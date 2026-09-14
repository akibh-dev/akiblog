import { eq, desc, and } from 'drizzle-orm';
import { type Database, comments, posts, type Comment, type NewComment } from '@repo/db';

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface AdminCommentWithPost extends Comment {
  postTitle: string;
  postSlug: string;
}

export async function getApprovedComments(
  db: Database,
  postId: string
): Promise<CommentWithReplies[]> {
  const allPostComments = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.isApproved, true)))
    .orderBy(desc(comments.createdAt))
    .all();

  // Separate top-level comments and replies
  const topLevel: CommentWithReplies[] = [];
  const repliesMap = new Map<string, Comment[]>();

  for (const c of allPostComments) {
    if (!c.parentId) {
      topLevel.push({ ...c, replies: [] });
    } else {
      const list = repliesMap.get(c.parentId) || [];
      list.push(c);
      repliesMap.set(c.parentId, list);
    }
  }

  // Attach replies (sorted oldest to newest for chronological conversation)
  for (const item of topLevel) {
    const r = repliesMap.get(item.id) || [];
    item.replies = r.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return topLevel;
}

export async function getAllCommentsForAdmin(db: Database): Promise<AdminCommentWithPost[]> {
  const rows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      authorName: comments.authorName,
      authorEmail: comments.authorEmail,
      content: comments.content,
      isApproved: comments.isApproved,
      ipAddress: comments.ipAddress,
      userAgent: comments.userAgent,
      createdAt: comments.createdAt,
      postTitle: posts.title,
      postSlug: posts.slug,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .orderBy(desc(comments.createdAt))
    .all();

  return rows;
}

export async function createComment(
  db: Database,
  data: {
    postId: string;
    parentId?: string | null;
    authorName: string;
    authorEmail: string;
    content: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    autoApprove?: boolean;
  }
): Promise<Comment> {
  const id = `comment-${crypto.randomUUID()}`;
  const now = new Date();

  const newComment: NewComment = {
    id,
    postId: data.postId,
    parentId: data.parentId || null,
    authorName: data.authorName.trim(),
    authorEmail: data.authorEmail.trim().toLowerCase(),
    content: data.content.trim(),
    isApproved: data.autoApprove ?? false,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
    createdAt: now,
  };

  await db.insert(comments).values(newComment).run();
  const created = await db.select().from(comments).where(eq(comments.id, id)).get();
  return created!;
}

export async function setCommentApproval(
  db: Database,
  id: string,
  isApproved: boolean
): Promise<boolean> {
  const result = await db
    .update(comments)
    .set({ isApproved })
    .where(eq(comments.id, id))
    .run();
  return (result?.meta?.changes ?? 0) > 0;
}

export async function deleteComment(db: Database, id: string): Promise<boolean> {
  // Delete replies first
  await db.delete(comments).where(eq(comments.parentId, id)).run();
  const result = await db.delete(comments).where(eq(comments.id, id)).run();
  return (result?.meta?.changes ?? 0) > 0;
}
