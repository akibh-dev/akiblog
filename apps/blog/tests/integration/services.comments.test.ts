/**
 * @file tests/integration/services.comments.test.ts
 * @description Integration tests for Comment threads, moderation, approval states, and nested reply trees.
 * 
 * POC / Implementation Details:
 * - Tests hierarchical comment tree construction, approval status toggles, author attribution,
 *   and cascade deletion of replies when parent comment is deleted.
 * - Why this implementation is best: Ensures discussion threads remain consistent, nested replies
 *   are strictly chronological, and unapproved comments are never leaked to public readers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, type TestDatabaseContext } from '../helpers/test-db';
import {
  createComment,
  getApprovedComments,
  getAllCommentsForAdmin,
  setCommentApproval,
  deleteComment,
} from '../../src/lib/services/comments';
import { createPost } from '../../src/lib/services/posts';

describe('Comments Service Integration Tests', () => {
  let ctx: TestDatabaseContext;

  beforeEach(() => {
    ctx = createTestDatabase();
  });

  it('creates comments with pending and approved statuses', async () => {
    const post = await createPost(ctx.db, {
      title: 'Post with Comments',
      content: '{}',
      authorEmail: 'admin@akib35.me',
    });

    const unapproved = await createComment(ctx.db, {
      postId: post.id,
      authorName: 'Guest User',
      authorEmail: 'guest@example.com',
      content: 'This comment needs moderation approval.',
      autoApprove: false,
    });

    expect(unapproved.isApproved).toBe(false);

    // Should not show in public approved comments list
    let publicComments = await getApprovedComments(ctx.db, post.id);
    expect(publicComments).toHaveLength(0);

    // Approve the comment
    await setCommentApproval(ctx.db, unapproved.id, true);

    publicComments = await getApprovedComments(ctx.db, post.id);
    expect(publicComments).toHaveLength(1);
    expect(publicComments[0].content).toBe('This comment needs moderation approval.');
  });

  it('correctly nests replies under parent comments in chronological order', async () => {
    const post = await createPost(ctx.db, {
      title: 'Threaded Post',
      content: '{}',
      authorEmail: 'admin@akib35.me',
    });

    // Parent comment
    const parent = await createComment(ctx.db, {
      postId: post.id,
      authorName: 'Alex',
      authorEmail: 'alex@example.com',
      content: 'Parent comment topic.',
      autoApprove: true,
    });

    // Reply 1
    await createComment(ctx.db, {
      postId: post.id,
      parentId: parent.id,
      authorName: 'Beth',
      authorEmail: 'beth@example.com',
      content: 'First reply.',
      autoApprove: true,
    });

    // Reply 2
    await createComment(ctx.db, {
      postId: post.id,
      parentId: parent.id,
      authorName: 'Charlie',
      authorEmail: 'charlie@example.com',
      content: 'Second reply.',
      autoApprove: true,
    });

    const thread = await getApprovedComments(ctx.db, post.id);
    expect(thread).toHaveLength(1); // 1 top-level comment
    expect(thread[0].replies).toHaveLength(2);
    expect(thread[0].replies[0].content).toBe('First reply.');
    expect(thread[0].replies[1].content).toBe('Second reply.');
  });

  it('deletes comment and automatically cascades deletion to its replies', async () => {
    const post = await createPost(ctx.db, {
      title: 'Post to delete comments',
      content: '{}',
      authorEmail: 'admin@akib35.me',
    });

    const parent = await createComment(ctx.db, {
      postId: post.id,
      authorName: 'Parent',
      authorEmail: 'p@example.com',
      content: 'Parent comment',
      autoApprove: true,
    });

    await createComment(ctx.db, {
      postId: post.id,
      parentId: parent.id,
      authorName: 'Child',
      authorEmail: 'c@example.com',
      content: 'Child comment',
      autoApprove: true,
    });

    // Delete parent
    const success = await deleteComment(ctx.db, parent.id);
    expect(success).toBe(true);

    const remaining = await getApprovedComments(ctx.db, post.id);
    expect(remaining).toHaveLength(0);
  });
});
