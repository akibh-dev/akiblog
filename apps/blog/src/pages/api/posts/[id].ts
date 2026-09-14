import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { getDb } from '../../../lib/db';
import { verifyAccessJWT } from '../../../lib/auth';
import { getPostById, updatePost, deletePost } from '../../../lib/services/posts';

// GET /api/posts/[id]
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals);
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const post = await getPostById(db, id);
    if (!post) return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });

    return Response.json(post);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// PUT /api/posts/[id]
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const env = getRuntimeEnv(locals);

  // 1. Authenticate Request
  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const body = await request.json();

    const updated = await updatePost(db, id, {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: typeof body.content === 'object' ? JSON.stringify(body.content) : body.content,
      coverImage: body.coverImage,
      status: body.status,
      allowComments: body.allowComments,
      tagIds: body.tagIds,
    });

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    return Response.json({ success: true, post: updated });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// DELETE /api/posts/[id]
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const env = getRuntimeEnv(locals);

  // 1. Authenticate Request
  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Post ID required' }), { status: 400 });

    const deleted = await deletePost(db, id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Post not found or already deleted' }), { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
