import { eq, desc, and, like, or, sql } from 'drizzle-orm';
import { type Database, posts, postTags, tags, comments, type Post, type Tag } from '@repo/db';
import { slugify } from '../slugify';
import { calculateReadingTime } from '../readingTime';
import { syncPostTags, getTagsForPost } from './tags';

export interface PostWithMeta extends Post {
  tags: Tag[];
  readingTime: string;
  commentCount?: number;
}

export async function getPublishedPosts(
  db: Database,
  options?: {
    search?: string;
    tagSlug?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ posts: PostWithMeta[]; total: number }> {
  const { search, tagSlug, limit = 50, offset = 0 } = options || {};

  // Find post IDs matching tag if tagSlug provided
  let filteredPostIds: string[] | null = null;
  if (tagSlug) {
    const tagged = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(tags.slug, tagSlug))
      .all();
    filteredPostIds = tagged.map((t) => t.postId);
    if (filteredPostIds.length === 0) {
      return { posts: [], total: 0 };
    }
  }

  // Base condition: published
  const conditions = [eq(posts.status, 'published')];

  if (search && search.trim() !== '') {
    const q = `%${search.trim()}%`;
    conditions.push(or(like(posts.title, q), like(posts.excerpt, q), like(posts.content, q))!);
  }

  const allPublished = await db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .all();

  let finalPosts = allPublished;
  if (filteredPostIds !== null) {
    const idSet = new Set(filteredPostIds);
    finalPosts = finalPosts.filter((p) => idSet.has(p.id));
  }

  const total = finalPosts.length;
  const paginated = finalPosts.slice(offset, offset + limit);

  // Attach tags and reading time
  const postsWithMeta: PostWithMeta[] = await Promise.all(
    paginated.map(async (p) => {
      const postTagList = await getTagsForPost(db, p.id);
      return {
        ...p,
        tags: postTagList,
        readingTime: calculateReadingTime(p.content),
      };
    })
  );

  return { posts: postsWithMeta, total };
}

export async function getPostBySlug(
  db: Database,
  slug: string
): Promise<PostWithMeta | null> {
  const post = await db.select().from(posts).where(eq(posts.slug, slug)).get();
  if (!post) return null;

  const postTagList = await getTagsForPost(db, post.id);
  return {
    ...post,
    tags: postTagList,
    readingTime: calculateReadingTime(post.content),
  };
}

export async function getPostById(
  db: Database,
  id: string
): Promise<PostWithMeta | null> {
  const post = await db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) return null;

  const postTagList = await getTagsForPost(db, post.id);
  return {
    ...post,
    tags: postTagList,
    readingTime: calculateReadingTime(post.content),
  };
}

export async function getAllPostsForAdmin(db: Database): Promise<PostWithMeta[]> {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .all();

  const postsWithMeta: PostWithMeta[] = await Promise.all(
    allPosts.map(async (p) => {
      const postTagList = await getTagsForPost(db, p.id);
      const commentsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(eq(comments.postId, p.id))
        .get();

      return {
        ...p,
        tags: postTagList,
        readingTime: calculateReadingTime(p.content),
        commentCount: commentsResult?.count || 0,
      };
    })
  );

  return postsWithMeta;
}

export async function createPost(
  db: Database,
  data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    status?: 'draft' | 'published' | 'archived';
    authorEmail: string;
    allowComments?: boolean;
    tagIds?: string[];
  }
): Promise<PostWithMeta> {
  const id = `post-${crypto.randomUUID()}`;
  let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
  if (!baseSlug) baseSlug = `post-${Date.now()}`;

  // Ensure unique slug
  let finalSlug = baseSlug;
  let counter = 1;
  while (await db.select().from(posts).where(eq(posts.slug, finalSlug)).get()) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const now = new Date();
  const status = data.status || 'draft';
  const publishedAt = status === 'published' ? now : null;

  await db.insert(posts).values({
    id,
    title: data.title,
    slug: finalSlug,
    excerpt: data.excerpt || null,
    content: data.content,
    coverImage: data.coverImage || null,
    status,
    authorEmail: data.authorEmail,
    allowComments: data.allowComments !== false,
    publishedAt,
    createdAt: now,
    updatedAt: now,
  }).run();

  if (data.tagIds && data.tagIds.length > 0) {
    await syncPostTags(db, id, data.tagIds);
  }

  return (await getPostById(db, id))!;
}

export async function updatePost(
  db: Database,
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    status?: 'draft' | 'published' | 'archived';
    allowComments?: boolean;
    tagIds?: string[];
  }
): Promise<PostWithMeta | null> {
  const existing = await db.select().from(posts).where(eq(posts.id, id)).get();
  if (!existing) return null;

  const updateValues: Partial<Post> = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateValues.title = data.title;
  if (data.excerpt !== undefined) updateValues.excerpt = data.excerpt;
  if (data.content !== undefined) updateValues.content = data.content;
  if (data.coverImage !== undefined) updateValues.coverImage = data.coverImage;
  if (data.allowComments !== undefined) updateValues.allowComments = data.allowComments;

  if (data.slug !== undefined && data.slug !== existing.slug) {
    let cleanSlug = slugify(data.slug);
    let finalSlug = cleanSlug;
    let counter = 1;
    while (true) {
      const match = await db.select().from(posts).where(eq(posts.slug, finalSlug)).get();
      if (!match || match.id === id) break;
      finalSlug = `${cleanSlug}-${counter++}`;
    }
    updateValues.slug = finalSlug;
  }

  if (data.status !== undefined) {
    updateValues.status = data.status;
    if (data.status === 'published' && !existing.publishedAt) {
      updateValues.publishedAt = new Date();
    }
  }

  await db.update(posts).set(updateValues).where(eq(posts.id, id)).run();

  if (data.tagIds !== undefined) {
    await syncPostTags(db, id, data.tagIds);
  }

  return await getPostById(db, id);
}

export async function deletePost(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(posts).where(eq(posts.id, id)).run();
  return (result?.meta?.changes ?? 0) > 0;
}

export async function getPostStats(db: Database) {
  const all = await db.select().from(posts).all();
  const publishedCount = all.filter((p) => p.status === 'published').length;
  const draftCount = all.filter((p) => p.status === 'draft').length;
  const archivedCount = all.filter((p) => p.status === 'archived').length;

  const pendingComments = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(eq(comments.isApproved, false))
    .get();

  return {
    totalPosts: all.length,
    publishedCount,
    draftCount,
    archivedCount,
    pendingComments: pendingComments?.count || 0,
  };
}
