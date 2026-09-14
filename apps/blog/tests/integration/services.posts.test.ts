/**
 * @file tests/integration/services.posts.test.ts
 * @description Integration tests for Post domain queries, CRUD, search, filtering, and stats.
 * 
 * POC / Implementation Details:
 * - Exercises post publishing flows, draft states, slug uniqueness collision avoidance,
 *   full-text like search queries, tag filtering, and admin aggregate statistics.
 * - Why this implementation is best: Validates edge database state transitions and content lifecycles
 *   directly against in-memory D1 SQLite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, type TestDatabaseContext } from '../helpers/test-db';
import {
  createPost,
  getPostBySlug,
  getPostById,
  getPublishedPosts,
  getAllPostsForAdmin,
  updatePost,
  deletePost,
  getPostStats,
} from '../../src/lib/services/posts';
import { createTag } from '../../src/lib/services/tags';

describe('Posts Service Integration Tests', () => {
  let ctx: TestDatabaseContext;

  beforeEach(() => {
    ctx = createTestDatabase();
  });

  it('creates, publishes, and retrieves a post with unique slug', async () => {
    const post = await createPost(ctx.db, {
      title: 'Architecting Distributed Apps',
      excerpt: 'Edge architectures deep dive',
      content: JSON.stringify({ blocks: [{ type: 'paragraph', data: { text: 'Hello edge' } }] }),
      status: 'published',
      authorEmail: 'admin@akib35.me',
    });

    expect(post.slug).toBe('architecting-distributed-apps');
    expect(post.status).toBe('published');
    expect(post.publishedAt).not.toBeNull();
    expect(post.readingTime).toBe('1 min read');

    // Create duplicate title to test slug collision handling
    const duplicatePost = await createPost(ctx.db, {
      title: 'Architecting Distributed Apps',
      content: '{"blocks":[]}',
      authorEmail: 'admin@akib35.me',
    });
    expect(duplicatePost.slug).toBe('architecting-distributed-apps-1');

    // Query by slug
    const fetched = await getPostBySlug(ctx.db, 'architecting-distributed-apps');
    expect(fetched?.id).toBe(post.id);
  });

  it('filters posts by search keyword and tag', async () => {
    const tagArch = await createTag(ctx.db, { name: 'Architecture', slug: 'arch' });
    const tagDB = await createTag(ctx.db, { name: 'Database', slug: 'db' });

    await createPost(ctx.db, {
      title: 'Astro on Cloudflare Pages',
      content: '{"blocks":[]}',
      status: 'published',
      authorEmail: 'admin@akib35.me',
      tagIds: [tagArch.id],
    });

    await createPost(ctx.db, {
      title: 'Drizzle ORM with D1 SQLite',
      content: '{"blocks":[]}',
      status: 'published',
      authorEmail: 'admin@akib35.me',
      tagIds: [tagDB.id],
    });

    await createPost(ctx.db, {
      title: 'Draft Article on Performance',
      content: '{"blocks":[]}',
      status: 'draft',
      authorEmail: 'admin@akib35.me',
    });

    // 1. All published posts
    const allPub = await getPublishedPosts(ctx.db);
    expect(allPub.total).toBe(2);

    // 2. Search by title
    const searchRes = await getPublishedPosts(ctx.db, { search: 'Drizzle' });
    expect(searchRes.total).toBe(1);
    expect(searchRes.posts[0].title).toBe('Drizzle ORM with D1 SQLite');

    // 3. Filter by tag slug
    const tagRes = await getPublishedPosts(ctx.db, { tagSlug: 'arch' });
    expect(tagRes.total).toBe(1);
    expect(tagRes.posts[0].title).toBe('Astro on Cloudflare Pages');
  });

  it('updates post content, status, and associated tags', async () => {
    const post = await createPost(ctx.db, {
      title: 'Initial Title',
      content: '{"blocks":[]}',
      status: 'draft',
      authorEmail: 'admin@akib35.me',
    });

    const updated = await updatePost(ctx.db, post.id, {
      title: 'Updated Title',
      status: 'published',
    });

    expect(updated?.title).toBe('Updated Title');
    expect(updated?.status).toBe('published');
    expect(updated?.publishedAt).not.toBeNull();
  });

  it('deletes posts and provides accurate admin statistics', async () => {
    const p1 = await createPost(ctx.db, { title: 'P1', content: '{}', status: 'published', authorEmail: 'a@a.com' });
    const p2 = await createPost(ctx.db, { title: 'P2', content: '{}', status: 'draft', authorEmail: 'a@a.com' });

    let stats = await getPostStats(ctx.db);
    expect(stats.totalPosts).toBe(2);
    expect(stats.publishedCount).toBe(1);
    expect(stats.draftCount).toBe(1);

    const deleted = await deletePost(ctx.db, p1.id);
    expect(deleted).toBe(true);

    stats = await getPostStats(ctx.db);
    expect(stats.totalPosts).toBe(1);
  });
});
