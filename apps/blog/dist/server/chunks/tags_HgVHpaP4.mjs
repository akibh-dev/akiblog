globalThis.process ??= {};
globalThis.process.env ??= {};
import { a as tags, c as eq, r as postTags } from "./db_CGVLS4Nl.mjs";
//#region src/lib/slugify.ts
function slugify(text) {
	return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/&/g, "-and-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
//#endregion
//#region src/lib/services/tags.ts
async function getAllTags(db) {
	return await db.select().from(tags).all();
}
async function getTagBySlug(db, slug) {
	return await db.select().from(tags).where(eq(tags.slug, slug)).get() || null;
}
async function createTag(db, data) {
	const id = `tag-${crypto.randomUUID().slice(0, 8)}`;
	const slug = data.slug || slugify(data.name);
	const color = data.color || "#3B82F6";
	const newTag = {
		id,
		name: data.name.trim(),
		slug,
		color
	};
	await db.insert(tags).values(newTag).run();
	return await getTagBySlug(db, slug);
}
async function deleteTag(db, id) {
	return ((await db.delete(tags).where(eq(tags.id, id)).run())?.meta?.changes ?? 0) > 0;
}
async function getTagsForPost(db, postId) {
	return await db.select({
		id: tags.id,
		name: tags.name,
		slug: tags.slug,
		color: tags.color,
		createdAt: tags.createdAt
	}).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, postId)).all();
}
async function syncPostTags(db, postId, tagIds) {
	await db.delete(postTags).where(eq(postTags.postId, postId)).run();
	if (tagIds.length > 0) {
		const values = tagIds.map((tagId) => ({
			postId,
			tagId
		}));
		await db.insert(postTags).values(values).run();
	}
}
//#endregion
export { getTagsForPost as a, getTagBySlug as i, deleteTag as n, syncPostTags as o, getAllTags as r, slugify as s, createTag as t };
