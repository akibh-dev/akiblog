import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/env';
import { getDb } from '../../../lib/db';
import { verifyAccessJWT } from '../../../lib/auth';
import { getApprovedComments, getAllCommentsForAdmin, createComment } from '../../../lib/services/comments';

// GET /api/comments?postId=...
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDb(locals);
    const env = getRuntimeEnv(locals);
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    const isAdmin = url.searchParams.get('admin') === 'true';

    if (isAdmin) {
      const user = await verifyAccessJWT(request, env);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      const allComments = await getAllCommentsForAdmin(db);
      return Response.json(allComments);
    }

    if (!postId) {
      return new Response(JSON.stringify({ error: 'postId parameter is required' }), { status: 400 });
    }

    const comments = await getApprovedComments(db, postId);
    return Response.json(comments);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// POST /api/comments
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDb(locals);
    const env = getRuntimeEnv(locals);
    const body = await request.json();

    if (!body.postId || !body.authorName || !body.authorEmail || !body.content) {
      return new Response(
        JSON.stringify({ error: 'postId, authorName, authorEmail, and content are required' }),
        { status: 400 }
      );
    }

    // Basic email sanity check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.authorEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 });
    }

    const ipAddress = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Check if user is authenticated admin (if so, auto-approve comment)
    const adminUser = await verifyAccessJWT(request, env);
    const autoApprove = Boolean(adminUser);

    const comment = await createComment(db, {
      postId: body.postId,
      parentId: body.parentId || null,
      authorName: body.authorName,
      authorEmail: body.authorEmail,
      content: body.content,
      ipAddress,
      userAgent,
      autoApprove,
    });

    return Response.json(
      {
        success: true,
        message: autoApprove
          ? 'Comment published!'
          : 'Thank you! Your comment has been submitted and will appear once approved.',
        comment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
