/**
 * @file tests/unit/auth.test.ts
 * @description Cloudflare Access authentication tests with REAL RS256 signatures.
 *
 * POC / Why this suite looks like this:
 * - The previous suite only tested rejection paths plus a made-up `<key_id>.<JWT>` cookie format.
 *   It passed while production returned 401 for every valid session, because no test ever
 *   verified a correctly signed token end-to-end.
 * - Here we generate an RSA key pair, serve its public JWK from a stubbed
 *   `https://<team>/cdn-cgi/access/certs` (jose's remote JWKS uses global fetch), and sign tokens
 *   exactly like Access does (RS256, kid, iss = team URL, aud = [AUD tag]). The key regression
 *   test sends the token the way the browser does: `Cookie: CF_Authorization=<raw JWT>`.
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { SignJWT, generateKeyPair, exportJWK } from 'jose';
import {
  verifyAccessJWT,
  authenticateRequest,
  extractJwtFromCfAuthorizationCookie,
  normalizeTeamDomain,
  __resetJwksCacheForTests,
} from '../../src/lib/auth';

const TEAM = 'myteam.cloudflareaccess.com';
const AUD = 'valid-audience-tag';
const KID = 'test-kid-1';

const PROD_ENV: any = {
  DB: {},
  DEV_MODE: 'false',
  CLOUDFLARE_TEAM_DOMAIN: TEAM,
  CLOUDFLARE_ACCESS_AUD: AUD,
};

let privateKey: CryptoKey;
let otherPrivateKey: CryptoKey;
let jwks: { keys: any[] };

async function signToken(
  claims: Record<string, unknown> = {},
  opts: { key?: CryptoKey; aud?: string; iss?: string; exp?: string | number } = {}
) {
  return new SignJWT({ email: 'admin@akib35.me', type: 'app', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: KID })
    .setIssuedAt()
    .setIssuer(opts.iss ?? `https://${TEAM}`)
    .setAudience([opts.aud ?? AUD])
    .setExpirationTime(opts.exp ?? '1h')
    .sign(opts.key ?? privateKey);
}

const req = (headers: Record<string, string> = {}) =>
  new Request('https://blog.akib35.dev/api/posts', { method: 'POST', headers });

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  otherPrivateKey = (await generateKeyPair('RS256')).privateKey;
  const publicJwk = await exportJWK(pair.publicKey);
  jwks = { keys: [{ ...publicJwk, kid: KID, alg: 'RS256', use: 'sig' }] };
});

beforeEach(() => {
  __resetJwksCacheForTests();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: any) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === `https://${TEAM}/cdn-cgi/access/certs`) {
        return new Response(JSON.stringify(jwks), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('not found', { status: 404 });
    })
  );
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('authenticateRequest() — production (Cloudflare Access)', () => {
  it('REGRESSION: accepts a raw-JWT CF_Authorization cookie (the production 401 bug)', async () => {
    const token = await signToken();
    const result = await authenticateRequest(req({ Cookie: `CF_Authorization=${token}` }), PROD_ENV);

    expect(result.reason).toBeNull();
    expect(result.source).toBe('cookie');
    expect(result.user?.email).toBe('admin@akib35.me');
  });

  it('accepts the cookie among other cookies (as captured in production)', async () => {
    const token = await signToken();
    const cookie = `CF_AppSession=329e8dd26b18c271; CF_Authorization=${token}; theme=dark`;
    expect((await authenticateRequest(req({ Cookie: cookie }), PROD_ENV)).user?.email).toBe('admin@akib35.me');
  });

  it('accepts the Cf-Access-Jwt-Assertion header and prefers it', async () => {
    const token = await signToken({ email: 'header@akib35.me' });
    const cookieToken = await signToken({ email: 'cookie@akib35.me' });
    const result = await authenticateRequest(
      req({ 'Cf-Access-Jwt-Assertion': token, Cookie: `CF_Authorization=${cookieToken}` }),
      PROD_ENV
    );
    expect(result.source).toBe('header');
    expect(result.user?.email).toBe('header@akib35.me');
  });

  it('falls back to the cookie when the header token is invalid', async () => {
    const cookieToken = await signToken();
    const result = await authenticateRequest(
      req({ 'Cf-Access-Jwt-Assertion': 'garbage.token.here', Cookie: `CF_Authorization=${cookieToken}` }),
      PROD_ENV
    );
    expect(result.source).toBe('cookie');
  });

  it('tolerates a team domain configured with scheme and trailing slash', async () => {
    const token = await signToken();
    const env = { ...PROD_ENV, CLOUDFLARE_TEAM_DOMAIN: `https://${TEAM}/` };
    expect(await verifyAccessJWT(req({ Cookie: `CF_Authorization=${token}` }), env)).not.toBeNull();
  });

  it('rejects when no token is present', async () => {
    expect(await authenticateRequest(req(), PROD_ENV)).toEqual({ user: null, source: null, reason: 'no_token' });
  });

  it('rejects when Access is not configured', async () => {
    const token = await signToken();
    const env = { ...PROD_ENV, CLOUDFLARE_ACCESS_AUD: '' };
    expect((await authenticateRequest(req({ Cookie: `CF_Authorization=${token}` }), env)).reason).toBe('not_configured');
  });

  it('rejects a token signed by an untrusted key', async () => {
    const token = await signToken({}, { key: otherPrivateKey });
    expect((await authenticateRequest(req({ Cookie: `CF_Authorization=${token}` }), PROD_ENV)).reason).toBe('invalid_token');
  });

  it('rejects a token for another Access application (aud mismatch)', async () => {
    const token = await signToken({}, { aud: 'some-other-app' });
    expect(await verifyAccessJWT(req({ Cookie: `CF_Authorization=${token}` }), PROD_ENV)).toBeNull();
  });

  it('rejects a token from another team (iss mismatch)', async () => {
    const token = await signToken({}, { iss: 'https://evil.cloudflareaccess.com' });
    expect(await verifyAccessJWT(req({ 'Cf-Access-Jwt-Assertion': token }), PROD_ENV)).toBeNull();
  });

  it('reports expired tokens distinctly', async () => {
    const token = await signToken({}, { exp: Math.floor(Date.now() / 1000) - 3600 });
    expect((await authenticateRequest(req({ Cookie: `CF_Authorization=${token}` }), PROD_ENV)).reason).toBe('token_expired');
  });

  it('enforces the optional ADMIN_EMAILS allowlist (case-insensitive)', async () => {
    const token = await signToken({ email: 'Admin@Akib35.me' });
    const cookie = { Cookie: `CF_Authorization=${token}` };

    expect((await authenticateRequest(req(cookie), { ...PROD_ENV, ADMIN_EMAILS: 'admin@akib35.me, x@y.z' })).user).not.toBeNull();
    expect((await authenticateRequest(req(cookie), { ...PROD_ENV, ADMIN_EMAILS: 'someone@else.com' })).reason).toBe(
      'identity_not_allowed'
    );
  });

  it('caches the JWKS across requests (one certs fetch per isolate)', async () => {
    const token = await signToken();
    await verifyAccessJWT(req({ Cookie: `CF_Authorization=${token}` }), PROD_ENV);
    await verifyAccessJWT(req({ Cookie: `CF_Authorization=${token}` }), PROD_ENV);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});

describe('authenticateRequest() — local development', () => {
  it('bypasses Access when DEV_MODE is "true" (set only by scripts/dev.js)', async () => {
    const result = await authenticateRequest(req(), { DB: {} as any, DEV_MODE: 'true' });
    expect(result.source).toBe('dev-bypass');
    expect(result.user?.email).toBe('admin@akib35.me');
  });

  it('does NOT bypass for any other DEV_MODE value', async () => {
    expect(await verifyAccessJWT(req(), { ...PROD_ENV, DEV_MODE: 'false' })).toBeNull();
    expect(await verifyAccessJWT(req(), { ...PROD_ENV, DEV_MODE: 'TRUE ' })).toBeNull();
  });
});

describe('extractJwtFromCfAuthorizationCookie()', () => {
  it('returns the raw JWT value unchanged', () => {
    const jwt = 'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsieCJdfQ.c2ln';
    expect(extractJwtFromCfAuthorizationCookie(req({ Cookie: `CF_Authorization=${jwt}` }))).toBe(jwt);
  });

  it('returns null when absent or not JWT-shaped', () => {
    expect(extractJwtFromCfAuthorizationCookie(req())).toBeNull();
    expect(extractJwtFromCfAuthorizationCookie(req({ Cookie: 'CF_Authorization=justoneblob' }))).toBeNull();
    expect(extractJwtFromCfAuthorizationCookie(req({ Cookie: 'CF_Authorization=a.b.c.d' }))).toBeNull();
    expect(extractJwtFromCfAuthorizationCookie(req({ Cookie: 'other=eyJ.a.b' }))).toBeNull();
  });
});

describe('normalizeTeamDomain()', () => {
  it('strips scheme and trailing slashes', () => {
    expect(normalizeTeamDomain('https://team.cloudflareaccess.com/')).toBe('team.cloudflareaccess.com');
    expect(normalizeTeamDomain(' team.cloudflareaccess.com ')).toBe('team.cloudflareaccess.com');
  });
});
