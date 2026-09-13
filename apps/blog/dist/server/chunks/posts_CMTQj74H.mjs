globalThis.process ??= {};
globalThis.process.env ??= {};
import { a as tags, c as eq, d as sql, i as posts, l as like, n as comments, o as desc, r as postTags, s as and, u as or } from "./db_CGVLS4Nl.mjs";
import { a as getTagsForPost, o as syncPostTags, s as slugify } from "./tags_HgVHpaP4.mjs";
//#region src/lib/readingTime.ts
function calculateReadingTime(content) {
	if (!content) return "1 min read";
	let textToCount = content;
	try {
		if (content.trim().startsWith("{")) {
			const parsed = JSON.parse(content);
			if (Array.isArray(parsed.blocks)) textToCount = parsed.blocks.map((b) => {
				if (b.data?.text) return b.data.text;
				if (Array.isArray(b.data?.items)) return b.data.items.join(" ");
				if (b.data?.code) return b.data.code;
				return "";
			}).join(" ");
		}
	} catch {}
	const wordCount = textToCount.replace(/<[^>]*>?/gm, " ").trim().split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}
//#endregion
//#region src/lib/services/posts.ts
async function getPublishedPosts(db, options) {
	const { search, tagSlug, limit = 50, offset = 0 } = options || {};
	let filteredPostIds = null;
	if (tagSlug) {
		filteredPostIds = (await db.select({ postId: postTags.postId }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(tags.slug, tagSlug)).all()).map((t) => t.postId);
		if (filteredPostIds.length === 0) return {
			posts: [],
			total: 0
		};
	}
	const conditions = [eq(posts.status, "published")];
	if (search && search.trim() !== "") {
		const q = `%${search.trim()}%`;
		conditions.push(or(like(posts.title, q), like(posts.excerpt, q), like(posts.content, q)));
	}
	let finalPosts = await db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.publishedAt), desc(posts.createdAt)).all();
	if (filteredPostIds !== null) {
		const idSet = new Set(filteredPostIds);
		finalPosts = finalPosts.filter((p) => idSet.has(p.id));
	}
	const total = finalPosts.length;
	const paginated = finalPosts.slice(offset, offset + limit);
	return {
		posts: await Promise.all(paginated.map(async (p) => {
			const postTagList = await getTagsForPost(db, p.id);
			return {
				...p,
				tags: postTagList,
				readingTime: calculateReadingTime(p.content)
			};
		})),
		total
	};
}
async function getPostBySlug(db, slug) {
	const post = await db.select().from(posts).where(eq(posts.slug, slug)).get();
	if (!post) return null;
	const postTagList = await getTagsForPost(db, post.id);
	return {
		...post,
		tags: postTagList,
		readingTime: calculateReadingTime(post.content)
	};
}
async function getPostById(db, id) {
	const post = await db.select().from(posts).where(eq(posts.id, id)).get();
	if (!post) return null;
	const postTagList = await getTagsForPost(db, post.id);
	return {
		...post,
		tags: postTagList,
		readingTime: calculateReadingTime(post.content)
	};
}
async function getAllPostsForAdmin(db) {
	const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).all();
	return await Promise.all(allPosts.map(async (p) => {
		const postTagList = await getTagsForPost(db, p.id);
		const commentsResult = await db.select({ count: sql`count(*)` }).from(comments).where(eq(comments.postId, p.id)).get();
		return {
			...p,
			tags: postTagList,
			readingTime: calculateReadingTime(p.content),
			commentCount: commentsResult?.count || 0
		};
	}));
}
async function createPost(db, data) {
	const id = `post-${crypto.randomUUID()}`;
	let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
	if (!baseSlug) baseSlug = `post-${Date.now()}`;
	let finalSlug = baseSlug;
	let counter = 1;
	while (await db.select().from(posts).where(eq(posts.slug, finalSlug)).get()) finalSlug = `${baseSlug}-${counter++}`;
	const now = /* @__PURE__ */ new Date();
	const status = data.status || "draft";
	const publishedAt = status === "published" ? now : null;
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
		updatedAt: now
	}).run();
	if (data.tagIds && data.tagIds.length > 0) await syncPostTags(db, id, data.tagIds);
	return await getPostById(db, id);
}
async function updatePost(db, id, data) {
	const existing = await db.select().from(posts).where(eq(posts.id, id)).get();
	if (!existing) return null;
	const updateValues = { updatedAt: /* @__PURE__ */ new Date() };
	if (data.title !== void 0) updateValues.title = data.title;
	if (data.excerpt !== void 0) updateValues.excerpt = data.excerpt;
	if (data.content !== void 0) updateValues.content = data.content;
	if (data.coverImage !== void 0) updateValues.coverImage = data.coverImage;
	if (data.allowComments !== void 0) updateValues.allowComments = data.allowComments;
	if (data.slug !== void 0 && data.slug !== existing.slug) {
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
	if (data.status !== void 0) {
		updateValues.status = data.status;
		if (data.status === "published" && !existing.publishedAt) updateValues.publishedAt = /* @__PURE__ */ new Date();
	}
	await db.update(posts).set(updateValues).where(eq(posts.id, id)).run();
	if (data.tagIds !== void 0) await syncPostTags(db, id, data.tagIds);
	return await getPostById(db, id);
}
async function deletePost(db, id) {
	return ((await db.delete(posts).where(eq(posts.id, id)).run())?.meta?.changes ?? 0) > 0;
}
async function getPostStats(db) {
	const all = await db.select().from(posts).all();
	const publishedCount = all.filter((p) => p.status === "published").length;
	const draftCount = all.filter((p) => p.status === "draft").length;
	const archivedCount = all.filter((p) => p.status === "archived").length;
	const pendingComments = await db.select({ count: sql`count(*)` }).from(comments).where(eq(comments.isApproved, false)).get();
	return {
		totalPosts: all.length,
		publishedCount,
		draftCount,
		archivedCount,
		pendingComments: pendingComments?.count || 0
	};
}
//#endregion
export { getPostBySlug as a, updatePost as c, getPostById as i, deletePost as n, getPostStats as o, getAllPostsForAdmin as r, getPublishedPosts as s, createPost as t };
