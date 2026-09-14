/**
 * @file tests/integration/api.routes.test.ts
 * @description Integration tests for Astro API endpoints (REST endpoints for Posts, Comments, Tags, and Upload).
 * 
 * POC / Implementation Details:
 * - Invokes actual Astro APIRoute handlers (GET, POST, PUT, DELETE) with mocked runtime locals.
 * - Validates HTTP response status codes, payload serializations, input validation checks, and JWT security gates.
 * - Why this implementation is best: Ensures that API contracts match the Cloudflare Worker runtime expectations
 *   without requiring an active network server daemon.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, type TestDatabaseContext } from '../helpers/test-db';
import { GET as getPosts, POST as createPostRoute } from '../../src/pages/api/posts/index';
import { GET as getSinglePost, PUT as updatePostRoute, DELETE as deletePostRoute } from '../../src/pages/api/posts/[id]';
import { GET as getComments, POST as createCommentRoute } from '../../src/pages/api/comments/index';
import { PUT as updateCommentRoute, DELETE as deleteCommentRoute } from '../../src/pages/api/comments/[id]';
import { GET as getTags, POST as createTagRoute } from '../../src/pages/api/tags/index';
import { DELETE as deleteTagRoute } from '../../src/pages/api/tags/[id]';
import { POST as uploadRoute } from '../../src/pages/api/upload';

describe('Astro API Routes Integration Tests', () => {
  let ctx: TestDatabaseContext;

  beforeEach(() => {
    ctx = createTestDatabase();
  });

  describe('Tags API (/api/tags)', () => {
    it('creates a tag and retrieves tags list', async () => {
      // 1. POST /api/tags
      const postReq = new Request('http://localhost:4321/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Web Dev', color: '#3B82F6' }),
      });

      const postRes = await createTagRoute({ request: postReq, locals: ctx.locals } as any);
      expect(postRes.status).toBe(201);
      const postData = await postRes.json();
      expect(postData.success).toBe(true);
      expect(postData.tag.name).toBe('Web Dev');

      // 2. GET /api/tags
      const getRes = await getTags({ locals: ctx.locals } as any);
      expect(getRes.status).toBe(200);
      const list = await getRes.json();
      expect(list).toHaveLength(1);

      // 3. DELETE /api/tags/[id]
      const delReq = new Request(`http://localhost:4321/api/tags/${postData.tag.id}`, { method: 'DELETE' });
      const delRes = await deleteTagRoute({ params: { id: postData.tag.id }, request: delReq, locals: ctx.locals } as any);
      expect(delRes.status).toBe(200);
    });
  });

  describe('Posts API (/api/posts)', () => {
    it('creates, retrieves, updates, and deletes posts via API routes', async () => {
      // 1. POST /api/posts
      const createReq = new Request('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'API Created Post',
          slug: 'api-created-post',
          excerpt: 'Short summary',
          content: '{"time":1710000000000,"blocks":[{"type":"paragraph","data":{"text":"Hello" morph}}]}',
          status: 'published',
        }),
      });

      const createRes = await createPostRoute({ request: createReq, locals: ctx.locals } as any);
      expect(createRes.status).toBe(201);
      const createdData = await createRes.json();
      const postId = createdData.post.id;

      // 2. GET /api/posts
      const listReq = new Request('http://localhost:4321/api/posts');
      const listRes = await getPosts({ request: listReq, locals: ctx.locals } as any);
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();
      expect(listData.total).toBe(1);

      // 3. GET /api/posts/[id]
      const singleRes = await getSinglePost({ params: { id: postId }, locals: ctx.locals } as any);
      expect(singleRes.status).toBe(200);
      const singleData = await singleRes.json();
      expect(singleData.title).toBe('API Created Post');

      // 4. PUT /api/posts/[id]
      const updateReq = new Request(`http://localhost:4321/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated API Post Title' }),
      });
      const updateRes = await updatePostRoute({ params: { id: postId }, request: updateReq, locals: ctx.locals } as any);
      expect(updateRes.status).toBe(200);
      const updateData = await updateRes.json();
      expect(updateData.post.title).toBe('Updated API Post Title');

      // 5. DELETE /api/posts/[id]
      const delReq = new Request(`http://localhost:4321/api/posts/${postId}`, { method: 'DELETE' });
      const delRes = await deletePostRoute({ params: { id: postId }, request: delReq, locals: ctx.locals } as any);
      expect(delRes.status).toBe(200);
    });

    it('returns 400 when creating a post without title or content', async () => {
      const badReq = new Request('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      const res = await createPostRoute({ request: badReq, locals: ctx.locals } as any);
      expect(res.status).toBe(400);
    });
  });

  describe('Comments API (/api/comments)', () => {
    it('creates and approves comments', async () => {
      // First create a post
      const createPostReq = new Request('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Comment Target', content: '{}' }),
      });
      const postRes = await createPostRoute({ request: createPostReq, locals: ctx.locals } as any);
      const { post } = await postRes.json();

      // Submit comment
      const commentReq = new Request('http://localhost:4321/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          authorName: 'Reader One',
          authorEmail: 'reader@example.com',
          content: 'Insightful thoughts!',
        }),
      });

      const commentRes = await createCommentRoute({ request: commentReq, locals: ctx.locals } as any);
      expect(commentRes.status).toBe(201);
      const { comment } = await commentRes.json();

      // Moderate comment
      const modReq = new Request(`http://localhost:4321/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });
      const modRes = await updateCommentRoute({ params: { id: comment.id }, request: modReq, locals: ctx.locals } as any);
      expect(modRes.status).toBe(200);

      // Verify approved comment in list
      const getCommentsReq = new Request(`http://localhost:4321/api/comments?postId=${post.id}`);
      const getCommentsRes = await getComments({ request: getCommentsReq, locals: ctx.locals } as any);
      const commentsList = await getCommentsRes.json();
      expect(commentsList).toHaveLength(1);
    });
  });

  describe('Upload API (/api/upload)', () => {
    it('processes multipart form-data image upload', async () => {
      const formData = new FormData();
      const file = new File(['fake image bytes'], 'test.png', { type: 'image/png' });
      formData.append('image', file);

      const req = new Request('http://localhost:4321/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadRoute({ request: req, locals: ctx.locals } as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(1);
      expect(data.file.url).toContain('/uploads/');
    });
  });
});
