import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals?.runtime?.env;
  const key = params.key;

  if (!key || !env?.BUCKET) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const object = await env.BUCKET.get(key);
    if (!object) {
      return new Response('Object Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers,
    });
  } catch (err: any) {
    return new Response('Error retrieving media', { status: 500 });
  }
};
