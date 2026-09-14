/**
 * @file tests/unit/auth.test.ts
 * @description Unit tests for Cloudflare Access JWT verification and authentication fallback.
 * 
 * POC / Implementation Details:
 * - Tests development bypass logic (localhost, DEV_MODE=true) and production JWT validation rules.
 * - Why this implementation is best: Ensures zero-trust security is strictly enforced in production
 *   while maintaining frictionless local developer experience without fake token rituals.
 */

import { describe, it, expect } from 'vitest';
import { verifyAccessJWT } from '../../src/lib/auth';

describe('verifyAccessJWT()', () => {
  it('allows local development requests on localhost when DEV_MODE is enabled', async () => {
    const request = new Request('http://localhost:4321/api/posts', {
      method: 'POST',
    });

    const env = {
      DB: {} as any,
      DEV_MODE: 'true',
    };

    const user = await verifyAccessJWT(request, env);
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@akib35.me');
  });

  it('rejects unauthenticated requests in production when headers and env are missing', async () => {
    const request = new Request('https://blog.akib35.me/api/posts', {
      method: 'POST',
    });

    const env = {
      DB: {} as any,
      DEV_MODE: 'false',
      CLOUDFLARE_TEAM_DOMAIN: 'myteam.cloudflareaccess.com',
      CLOUDFLARE_ACCESS_AUD: 'valid-audience-tag',
    };

    const user = await verifyAccessJWT(request, env);
    expect(user).toBeNull();
  });

  it('rejects invalid or corrupted JWT header string', async () => {
    const request = new Request('https://blog.akib35.me/api/posts', {
      method: 'POST',
      headers: {
        'Cf-Access-Jwt-Assertion': 'invalid.jwt.token',
      },
    });

    const env = {
      DB: {} as any,
      DEV_MODE: 'false',
      CLOUDFLARE_TEAM_DOMAIN: 'myteam.cloudflareaccess.com',
      CLOUDFLARE_ACCESS_AUD: 'valid-audience-tag',
    };

    const user = await verifyAccessJWT(request, env);
    expect(user).toBeNull();
  });
});
