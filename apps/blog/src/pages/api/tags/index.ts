import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { getDb } from '../../../lib/db';
import { verifyAccessJWT } from '../../../lib/auth';
import { getAllTags, createTag } from '../../../lib/services/tags';

// GET /api/tags
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDb(locals);
    const allTags = await getAllTags(db);
    return Response.json(allTags);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// POST /api/tags (Admin Only)
export const POST: APIRoute = async ({ request, locals }) => {
  const env = getRuntimeEnv(locals);

  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const body = await request.json();

    if (!body.name) {
      return new Response(JSON.stringify({ error: 'Tag name is required' }), { status: 400 });
    }

    const tag = await createTag(db, {
      name: body.name,
      slug: body.slug,
      color: body.color,
    });

    return Response.json({ success: true, tag }, { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
