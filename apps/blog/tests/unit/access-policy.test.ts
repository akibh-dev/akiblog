/**
 * @file tests/unit/access-policy.test.ts
 * @description Route protection matrix + CSRF origin guard used by src/middleware.ts.
 * Locks in "protected by default": a new write endpoint is admin-only unless it is added to
 * PUBLIC_WRITE_ROUTES on purpose.
 */

import { describe, it, expect } from 'vitest';
import { requiresAdmin, isSameOrigin } from '../../src/lib/access-policy';

const u = (path: string) => new URL(`https://blog.akib35.dev${path}`);

describe('requiresAdmin()', () => {
  it.each([
    ['GET', '/admin'],
    ['GET', '/admin/'],
    ['GET', '/admin/write'],
    ['GET', '/admin/edit/post-1'],
    ['POST', '/api/posts'],
    ['PUT', '/api/posts/post-1'],
    ['DELETE', '/api/posts/post-1'],
    ['POST', '/api/tags'],
    ['DELETE', '/api/tags/t1'],
    ['PUT', '/api/comments/c1'],
    ['DELETE', '/api/comments/c1'],
    ['POST', '/api/upload'],
    ['POST', '/api/some-future-endpoint'],
    ['GET', '/api/health'],
    ['POST', '/api/health'],
    ['GET', '/api/posts?admin=true'],
    ['GET', '/api/comments?admin=true'],
  ])('%s %s -> admin', (method, path) => {
    expect(requiresAdmin(method, u(path))).toBe(true);
  });

  it.each([
    ['GET', '/'],
    ['GET', '/posts/hello'],
    ['GET', '/administrator-notes'],
    ['GET', '/api/posts'],
    ['GET', '/api/posts/post-1'],
    ['GET', '/api/tags'],
    ['GET', '/api/comments?postId=p1'],
    ['GET', '/api/media/uploads/2026/09/a.png'],
    ['POST', '/api/comments'],
  ])('%s %s -> public', (method, path) => {
    expect(requiresAdmin(method, u(path))).toBe(false);
  });
});

describe('isSameOrigin()', () => {
  const url = u('/api/posts');
  const r = (headers: Record<string, string>) => new Request(url, { method: 'POST', headers });

  it('accepts a matching Origin', () => expect(isSameOrigin(r({ Origin: 'https://blog.akib35.dev' }), url)).toBe(true));
  it('rejects a foreign Origin', () => expect(isSameOrigin(r({ Origin: 'https://evil.example' }), url)).toBe(false));
  it('rejects cross-site Sec-Fetch-Site without Origin', () =>
    expect(isSameOrigin(r({ 'Sec-Fetch-Site': 'cross-site' }), url)).toBe(false));
  it('allows non-browser clients (no Origin, no Sec-Fetch-Site)', () => expect(isSameOrigin(r({}), url)).toBe(true));
});
