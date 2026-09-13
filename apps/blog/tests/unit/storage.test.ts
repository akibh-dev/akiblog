/**
 * @file tests/unit/storage.test.ts
 * @description Unit tests for Cloudflare R2 object storage and fallback upload handling.
 * 
 * POC / Implementation Details:
 * - Tests image file upload against Cloudflare R2 bucket binding as well as local base64 fallback.
 * - Validates content-type headers, key generation, and public URL path construction.
 * - Why this implementation is best: Guarantees zero-egress media storage in production and fully
 *   functional asset previews during offline/local testing.
 */

import { describe, it, expect } from 'vitest';
import { uploadImageToStorage } from '../../src/lib/storage';

describe('uploadImageToStorage()', () => {
  it('uploads to R2 bucket when BUCKET binding is present', async () => {
    let storedKey = '';
    let storedMeta: any = null;

    const mockBucket: any = {
      async put(key: string, stream: any, options?: any) {
        storedKey = key;
        storedMeta = options?.httpMetadata;
        return { key };
      },
    };

    const env: any = {
      BUCKET: mockBucket,
      R2_PUBLIC_DOMAIN: 'https://media.akib35.me',
    };

    const file = new File(['fake-image-bytes'], 'banner.png', { type: 'image/png' });
    const result = await uploadImageToStorage(file, env);

    expect(result.url).toMatch(/^https:\/\/media\.akib35\.me\/uploads\/\d+-[0-9a-f-]+\.png$/);
    expect(storedKey).toMatch(/^uploads\/\d+-[0-9a-f-]+\.png$/);
    expect(storedMeta?.contentType).toBe('image/png');
  });

  it('falls back to data URL when BUCKET is not configured (local dev fallback)', async () => {
    const file = new File(['sample image content'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await uploadImageToStorage(file, undefined);

    expect(result.url).toMatch(/^data:image\/jpeg;base64,/);
  });
});
