/**
 * @file apps/blog/src/pages/api/upload.ts
 * @description Admin image upload -> R2. Response shape follows the Editor.js Image tool
 * contract (`{ success: 1, file: { url } }`) so the editor and the cover-image field share it.
 * Auth: enforced centrally by src/middleware.ts (admin-only POST) and re-checked here.
 */

import type { APIRoute } from 'astro';
import { verifyAccessJWT } from '../../lib/auth';
import { uploadImageToStorage, StorageError } from '../../lib/storage';
import { getRuntimeEnv } from '../../lib/env';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getRuntimeEnv(locals);

  const user = locals.auth?.user ?? (await verifyAccessJWT(request, env));
  if (!user) return json({ success: 0, error: 'Unauthorized' }, 401);

  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File) || file.size === 0) {
      return json({ success: 0, error: 'No image file provided' }, 400);
    }

    const { url, key } = await uploadImageToStorage(file, env);
    return json({ success: 1, file: { url, key } }, 200);
  } catch (error: any) {
    const status = error instanceof StorageError ? error.status : 500;
    return json({ success: 0, error: error?.message || 'Image upload failed' }, status);
  }
};
