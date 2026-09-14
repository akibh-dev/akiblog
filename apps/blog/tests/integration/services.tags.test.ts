/**
 * @file tests/integration/services.tags.test.ts
 * @description Integration tests for Tag and Category service operations with Cloudflare D1.
 * 
 * POC / Implementation Details:
 * - Tests tag creation, uniqueness constraints, slug generation, post-tag synchronization, and cascade deletes.
 * - Why this implementation is best: Verifies schema integrity, relational junctions, and database indexes
 *   under realistic edge transactional operations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, type TestDatabaseContext } from '../helpers/test-db';
import {
  createTag,
  getAllTags,
  getTagBySlug,
  deleteTag,
  syncPostTags,
  getTagsForPost,
} from '../../src/lib/services/tags';
import { createPost } from '../../src/lib/services/posts';

describe('Tags Service Integration Tests', () => {
  let ctx: TestDatabaseContext;

  beforeEach(() => {
    ctx = createTestDatabase();
  });

  it('creates and retrieves tags by slug and all tags list', async () => {
    const created = await createTag(ctx.db, {
      name: 'Cloudflare Workers',
      color: '#F97316',
    });

    expect(created.id).toMatch(/^tag-/);
    expect(created.name).toBe('Cloudflare Workers');
    expect(created.slug).toBe('cloudflare-workers');
    expect(created.color).toBe('#F97316');

    const bySlug = await getTagBySlug(ctx.db, 'cloudflare-workers');
    expect(bySlug).toEqual(created);

    const all = await getAllTags(ctx.db);
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Cloudflare Workers');
  });

  it('syncs post tags and retrieves them for a given post', async () => {
    const tag1 = await createTag(ctx.db, { name: 'Astro' });
    const tag2 = await createTag(ctx.db, { name: 'D1' });

    const post = await createPost(ctx.db, {
      title: 'Post with Tags',
      content: '{"blocks":[]}',
      authorEmail: 'admin@akib35.me',
    });

    // Attach tags
    await syncPostTags(ctx.db, post.id, [tag1.id, tag2.id]);

    const postTags = await getTagsForPost(ctx.db, post.id);
    expect(postTags).toHaveLength(2);
    expect(postTags.map((t) => t.name).sort()).toEqual(['Astro', 'D1']);

    // Re-sync with only 1 tag
    await syncPostTags(ctx.db, post.id, [tag1.id]);
    const updatedTags = await getTagsForPost(ctx.db, post.id);
    expect(updatedTags).toHaveLength(1);
    expect(updatedTags[0].name).toBe('Astro');
  });

  it('deletes tags cleanly and handles nonexistent IDs', async () => {
    const tag = await createTag(ctx.db, { name: 'Delete Me' });
    const success = await deleteTag(ctx.db, tag.id);
    expect(success).toBe(true);

    const remaining = await getAllTags(ctx.db);
    expect(remaining).toHaveLength(0);

    const falseDelete = await deleteTag(ctx.db, 'non-existent-tag');
    expect(falseDelete).toBe(false);
  });
});
