import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { getDb } from '../../../lib/db';
import { verifyAccessJWT } from '../../../lib/auth';
import { deleteTag } from '../../../lib/services/tags';

// DELETE /api/tags/[id] (Admin Only)
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const env = getRuntimeEnv(locals);

  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Tag ID required' }), { status: 400 });

    const success = await deleteTag(db, id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Tag not found or already deleted' }), { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
