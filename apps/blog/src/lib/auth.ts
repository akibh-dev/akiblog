import { jwtVerify, createRemoteJWKSet } from 'jose';

export interface AccessJWTPayload {
  email: string;
  common_name?: string;
  name?: string;
  sub?: string;
  [key: string]: any;
}

export async function verifyAccessJWT(request: Request, env?: Env): Promise<AccessJWTPayload | null> {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  const url = new URL(request.url);
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
  const isExplicitProd = env?.DEV_MODE === 'false';
  const isDevMode = (env?.DEV_MODE === 'true' || import.meta.env?.DEV) && !isExplicitProd;

  // Local development bypass
  if (!jwt) {
    if (isDevMode && isLocalhost) {
      return {
        email: 'admin@akib35.me',
        common_name: 'Local Admin',
      };
    }
    return null;
  }

  const teamDomain = env?.CLOUDFLARE_TEAM_DOMAIN;
  const audience = env?.CLOUDFLARE_ACCESS_AUD;

  // If Cloudflare Access credentials are not provided, allow fallback in dev
  if (!teamDomain || !audience) {
    if (isDevMode && isLocalhost) {
      return {
        email: 'admin@akib35.me',
        common_name: 'Local Admin',
      };
    }
    return null;
  }

  try {
    const jwksUrl = new URL(`https://${teamDomain}/cdn-cgi/access/certs`);
    const JWKS = createRemoteJWKSet(jwksUrl);

    const { payload } = await jwtVerify(jwt, JWKS, {
      issuer: `https://${teamDomain}`,
      audience,
    });

    return payload as AccessJWTPayload;
  } catch (error) {
    console.error('Cloudflare Access JWT verification failed:', error);
    return null;
  }
}
