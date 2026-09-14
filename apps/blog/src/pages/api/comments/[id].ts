import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { getDb } from '../../../lib/db';
import { verifyAccessJWT } from '../../../lib/auth';
import { setCommentApproval, deleteComment } from '../../../lib/services/comments';

// PUT /api/comments/[id] (Admin Only)
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const env = getRuntimeEnv(locals);

  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Comment ID required' }), { status: 400 });

    const body = await request.json();
    const isApproved = Boolean(body.isApproved);

    const success = await setCommentApproval(db, id, isApproved);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404 });
    }

    return Response.json({ success: true, isApproved });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// DELETE /api/comments/[id] (Admin Only)
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const env = getRuntimeEnv(locals);

  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Comment ID required' }), { status: 400 });

    const success = await deleteComment(db, id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Comment not found or already deleted' }), { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
