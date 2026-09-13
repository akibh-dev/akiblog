import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { getDb } from '../../../lib/db';
import { verifyAccessJWT } from '../../../lib/auth';
import { getPublishedPosts, getAllPostsForAdmin, createPost } from '../../../lib/services/posts';

// GET /api/posts
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDb(locals);
    const env = getRuntimeEnv(locals);
    const url = new URL(request.url);
    const isAdminQuery = url.searchParams.get('admin') === 'true';

    if (isAdminQuery) {
      const user = await verifyAccessJWT(request, env);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      const allPosts = await getAllPostsForAdmin(db);
      return Response.json(allPosts);
    }

    const search = url.searchParams.get('q') || undefined;
    const tagSlug = url.searchParams.get('tag') || undefined;
    const limit = Number(url.searchParams.get('limit')) || 50;
    const offset = Number(url.searchParams.get('offset')) || 0;

    const result = await getPublishedPosts(db, { search, tagSlug, limit, offset });
    return Response.json(result);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// POST /api/posts
export const POST: APIRoute = async ({ request, locals }) => {
  const env = getRuntimeEnv(locals);

  // 1. Authenticate Request
  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const db = getDb(locals);
    const body = await request.json();

    if (!body.title || !body.content) {
      return new Response(JSON.stringify({ error: 'Title and content are required' }), { status: 400 });
    }

    const post = await createPost(db, {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: typeof body.content === 'object' ? JSON.stringify(body.content) : body.content,
      coverImage: body.coverImage,
      status: body.status || 'draft',
      authorEmail: user.email,
      allowComments: body.allowComments ?? true,
      tagIds: body.tagIds || [],
    });

    return Response.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
