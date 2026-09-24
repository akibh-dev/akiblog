/**
 * @file apps/blog/src/lib/storage.ts
 * @description R2-backed media storage for the blog (editor images, cover images).
 *
 * DESIGN / POC:
 * - R2 is the single source of truth for binary assets; D1 only stores the resulting URL.
 *   Objects are served back through the Worker at `/api/media/<key>` (R2_PUBLIC_DOMAIN), so no
 *   public bucket or r2.dev subdomain is required and caching stays under our control.
 * - Keys: `uploads/YYYY/MM/<uuid>.<ext>` — date-partitioned for easy browsing/cleanup in the
 *   dashboard, UUID for collision-free, unguessable names. The extension is derived from the
 *   validated MIME type, never from the user-supplied filename.
 * - Validation: raster image types only (SVG is excluded because it can carry script and is
 *   served same-origin), max 10 MB.
 * - No silent fallback: previously a missing BUCKET binding produced base64 `data:` URLs that got
 *   written into posts in D1. Local dev has a real (Miniflare-emulated) R2 bucket via
 *   `wrangler dev`, so a missing binding is now a clear 503 instead of hidden data bloat.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export class StorageError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export function buildObjectKey(extension: string, now = new Date()): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `uploads/${yyyy}/${mm}/${crypto.randomUUID()}.${extension}`;
}

export function publicUrlForKey(key: string, env?: Env): string {
  const base = (env?.R2_PUBLIC_DOMAIN || '/api/media').replace(/\/+$/, '');
  return `${base}/${key}`;
}

export async function uploadImageToStorage(file: File, env?: Env): Promise<{ url: string; key: string }> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new StorageError(`Unsupported file type "${file.type || 'unknown'}". Use PNG, JPEG, WebP, GIF or AVIF.`, 415);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new StorageError(`Image is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is 10 MB.`, 413);
  }
  if (!env?.BUCKET) {
    throw new StorageError('R2 bucket binding "BUCKET" is not configured on this Worker.', 503);
  }

  const key = buildObjectKey(extension);
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      originalName: file.name.slice(0, 200),
    },
  });

  return { url: publicUrlForKey(key, env), key };
}
