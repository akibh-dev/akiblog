/**
 * @file tests/unit/auth.test.ts
 * @description Unit tests for Cloudflare Access JWT verification and authentication fallback.
 *
 * POC / Implementation Details:
 * - Tests development bypass logic (localhost, DEV_MODE=true) and production JWT validation rules.
 * - Covers the CF_Authorization cookie fallback added to fix 401s on same-origin XHR
 *   (POST /api/posts), where Cloudflare does not inject the Cf-Access-Jwt-Assertion header.
 * - Why this implementation is best: Ensures zero-trust security is strictly enforced in production
 *   while maintaining frictionless local developer experience without fake token rituals.
 */

import { describe, it, expect } from 'vitest';
import { verifyAccessJWT, extractJwtFromCfAuthorizationCookie } from '../../src/lib/auth';

const PROD_ENV = {
  DB: {} as any,
  DEV_MODE: 'false',
  CLOUDFLARE_TEAM_DOMAIN: 'myteam.cloudflareaccess.com',
  CLOUDFLARE_ACCESS_AUD: 'valid-audience-tag',
};

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

    const user = await verifyAccessJWT(request, PROD_ENV);
    expect(user).toBeNull();
  });

  it('rejects invalid or corrupted JWT header string', async () => {
    const request = new Request('https://blog.akib35.me/api/posts', {
      method: 'POST',
      headers: {
        'Cf-Access-Jwt-Assertion': 'invalid.jwt.token',
      },
    });

    const user = await verifyAccessJWT(request, PROD_ENV);
    expect(user).toBeNull();
  });

  it('rejects requests that only carry a malformed CF_Authorization cookie', async () => {
    const request = new Request('https://blog.akib35.dev/api/posts', {
      method: 'POST',
      headers: {
        Cookie: 'CF_Authorization=not-a-jwt',
      },
    });

    const user = await verifyAccessJWT(request, PROD_ENV);
    expect(user).toBeNull();
  });

  it('rejects cookie tokens whose signature does not verify against the team JWKS', async () => {
    // Structurally a `<key_id>.<JWT>` cookie value, but signed by nobody we trust.
    const request = new Request('https://blog.akib35.dev/api/posts', {
      method: 'POST',
      headers: {
        Cookie:
          'CF_Authorization=eyJraWQiOiJmYWtlLWtleS1pZCJ9.eyJlbWFpbCI6ImF0dGFja2VyQGV2aWwuY29tIn0.tampered-signature',
      },
    });

    const user = await verifyAccessJWT(request, PROD_ENV);
    expect(user).toBeNull();
  });
});

describe('extractJwtFromCfAuthorizationCookie()', () => {
  it('extracts the JWT portion after the key_id prefix', () => {
    const request = new Request('https://blog.akib35.dev/api/posts', {
      headers: { Cookie: 'CF_Authorization=abc123keyid.eyJhbGciOiJSUzI1NiJ9.sig' },
    });

    expect(extractJwtFromCfAuthorizationCookie(request)).toBe('eyJhbGciOiJSUzI1NiJ9.sig');
  });

  it('parses the cookie from a multi-cookie header regardless of position', () => {
    const request = new Request('https://blog.akib35.dev/api/posts', {
      headers: {
        Cookie: 'theme=dark; CF_Authorization=kid.header.payload; other=x',
      },
    });

    expect(extractJwtFromCfAuthorizationCookie(request)).toBe('header.payload');
  });

  it('returns null when the cookie is absent or has no key_id prefix', () => {
    const noCookie = new Request('https://blog.akib35.dev/api/posts');
    const noPrefix = new Request('https://blog.akib35.dev/api/posts', {
      headers: { Cookie: 'CF_Authorization=justoneblob' },
    });

    expect(extractJwtFromCfAuthorizationCookie(noCookie)).toBeNull();
    expect(extractJwtFromCfAuthorizationCookie(noPrefix)).toBeNull();
  });
});
