import { eq, inArray } from 'drizzle-orm';
import { type Database, tags, postTags, type Tag, type NewTag } from '@repo/db';
import { slugify } from '../slugify';

export async function getAllTags(db: Database): Promise<Tag[]> {
  return await db.select().from(tags).all();
}

export async function getTagBySlug(db: Database, slug: string): Promise<Tag | null> {
  const result = await db.select().from(tags).where(eq(tags.slug, slug)).get();
  return result || null;
}

export async function createTag(
  db: Database,
  data: { name: string; slug?: string; color?: string }
): Promise<Tag> {
  const id = `tag-${crypto.randomUUID().slice(0, 8)}`;
  const slug = data.slug || slugify(data.name);
  const color = data.color || '#3B82F6';

  const newTag: NewTag = {
    id,
    name: data.name.trim(),
    slug,
    color,
  };

  await db.insert(tags).values(newTag).run();
  return (await getTagBySlug(db, slug))!;
}

export async function deleteTag(db: Database, id: string): Promise<boolean> {
  const result = await db.delete(tags).where(eq(tags.id, id)).run();
  return (result?.meta?.changes ?? 0) > 0;
}

export async function getTagsForPost(db: Database, postId: string): Promise<Tag[]> {
  const relations = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      createdAt: tags.createdAt,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId))
    .all();

  return relations;
}

export async function syncPostTags(db: Database, postId: string, tagIds: string[]): Promise<void> {
  // Remove existing post-tags
  await db.delete(postTags).where(eq(postTags.postId, postId)).run();

  if (tagIds.length > 0) {
    const values = tagIds.map((tagId) => ({
      postId,
      tagId,
    }));
    await db.insert(postTags).values(values).run();
  }
}
