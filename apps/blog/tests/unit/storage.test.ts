/**
 * @file tests/unit/storage.test.ts
 * @description Unit tests for R2 media storage (src/lib/storage.ts).
 *
 * POC / Implementation Details:
 * - Verifies key layout (`uploads/YYYY/MM/<uuid>.<ext>`), MIME-derived extensions, public URL
 *   construction, and the validation rules (type allowlist, 10 MB cap).
 * - The old base64 `data:` URL fallback was removed on purpose (it wrote megabytes of image data
 *   into D1 rows); a missing bucket must now fail loudly with a 503 StorageError.
 */

import { describe, it, expect } from 'vitest';
import { uploadImageToStorage, StorageError, buildObjectKey, MAX_UPLOAD_BYTES } from '../../src/lib/storage';

function mockBucket() {
  const calls: Array<{ key: string; options: any; size: number }> = [];
  return {
    calls,
    async put(key: string, body: ArrayBuffer, options?: any) {
      calls.push({ key, options, size: body.byteLength });
      return { key };
    },
  };
}

describe('uploadImageToStorage()', () => {
  it('stores the image in R2 under a date-partitioned key and returns its public URL', async () => {
    const bucket = mockBucket();
    const env: any = { BUCKET: bucket, R2_PUBLIC_DOMAIN: '/api/media/' };
    const file = new File(['fake-image-bytes'], 'banner.PNG', { type: 'image/png' });

    const result = await uploadImageToStorage(file, env);

    expect(result.key).toMatch(/^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.png$/);
    expect(result.url).toBe(`/api/media/${result.key}`);
    expect(bucket.calls[0].options.httpMetadata.contentType).toBe('image/png');
    expect(bucket.calls[0].options.customMetadata.originalName).toBe('banner.PNG');
    expect(bucket.calls[0].size).toBe(16);
  });

  it('derives the extension from the MIME type, not the filename', async () => {
    const env: any = { BUCKET: mockBucket() };
    const result = await uploadImageToStorage(new File(['x'], 'evil.html', { type: 'image/jpeg' }), env);
    expect(result.key.endsWith('.jpg')).toBe(true);
  });

  it('rejects non-raster types such as SVG (415)', async () => {
    const env: any = { BUCKET: mockBucket() };
    await expect(uploadImageToStorage(new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' }), env)).rejects.toMatchObject({
      status: 415,
    });
  });

  it('rejects files over the size limit (413)', async () => {
    const env: any = { BUCKET: mockBucket() };
    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], 'big.png', { type: 'image/png' });
    await expect(uploadImageToStorage(big, env)).rejects.toMatchObject({ status: 413 });
  });

  it('fails loudly (503) when the R2 binding is missing instead of inlining base64', async () => {
    const promise = uploadImageToStorage(new File(['x'], 'a.png', { type: 'image/png' }), undefined);
    await expect(promise).rejects.toBeInstanceOf(StorageError);
    await expect(promise).rejects.toMatchObject({ status: 503 });
  });
});

describe('buildObjectKey()', () => {
  it('uses UTC year/month partitions', () => {
    expect(buildObjectKey('webp', new Date('2026-01-31T23:59:00Z'))).toMatch(/^uploads\/2026\/01\/[0-9a-f-]{36}\.webp$/);
  });
});
