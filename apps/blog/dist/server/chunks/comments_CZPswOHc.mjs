globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as eq, i as posts, n as comments, o as desc, s as and } from "./db_CGVLS4Nl.mjs";
//#region src/lib/services/comments.ts
async function getApprovedComments(db, postId) {
	const allPostComments = await db.select().from(comments).where(and(eq(comments.postId, postId), eq(comments.isApproved, true))).orderBy(desc(comments.createdAt)).all();
	const topLevel = [];
	const repliesMap = /* @__PURE__ */ new Map();
	for (const c of allPostComments) if (!c.parentId) topLevel.push({
		...c,
		replies: []
	});
	else {
		const list = repliesMap.get(c.parentId) || [];
		list.push(c);
		repliesMap.set(c.parentId, list);
	}
	for (const item of topLevel) item.replies = (repliesMap.get(item.id) || []).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
	return topLevel;
}
async function getAllCommentsForAdmin(db) {
	return await db.select({
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
		postSlug: posts.slug
	}).from(comments).innerJoin(posts, eq(comments.postId, posts.id)).orderBy(desc(comments.createdAt)).all();
}
async function createComment(db, data) {
	const id = `comment-${crypto.randomUUID()}`;
	const now = /* @__PURE__ */ new Date();
	const newComment = {
		id,
		postId: data.postId,
		parentId: data.parentId || null,
		authorName: data.authorName.trim(),
		authorEmail: data.authorEmail.trim().toLowerCase(),
		content: data.content.trim(),
		isApproved: data.autoApprove ?? false,
		ipAddress: data.ipAddress || null,
		userAgent: data.userAgent || null,
		createdAt: now
	};
	await db.insert(comments).values(newComment).run();
	return await db.select().from(comments).where(eq(comments.id, id)).get();
}
async function setCommentApproval(db, id, isApproved) {
	return ((await db.update(comments).set({ isApproved }).where(eq(comments.id, id)).run())?.meta?.changes ?? 0) > 0;
}
async function deleteComment(db, id) {
	await db.delete(comments).where(eq(comments.parentId, id)).run();
	return ((await db.delete(comments).where(eq(comments.id, id)).run())?.meta?.changes ?? 0) > 0;
}
//#endregion
export { setCommentApproval as a, getApprovedComments as i, deleteComment as n, getAllCommentsForAdmin as r, createComment as t };
