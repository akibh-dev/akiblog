globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Crr6vjTf.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { i as getApprovedComments, r as getAllCommentsForAdmin, t as createComment } from "./comments_CZPswOHc.mjs";
//#region src/pages/api/comments/index.ts
var comments_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ request, locals }) => {
	try {
		const db = getDb(locals);
		const env = getRuntimeEnv(locals);
		const url = new URL(request.url);
		const postId = url.searchParams.get("postId");
		if (url.searchParams.get("admin") === "true") {
			if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
			const allComments = await getAllCommentsForAdmin(db);
			return Response.json(allComments);
		}
		if (!postId) return new Response(JSON.stringify({ error: "postId parameter is required" }), { status: 400 });
		const comments = await getApprovedComments(db, postId);
		return Response.json(comments);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
var POST = async ({ request, locals }) => {
	try {
		const db = getDb(locals);
		const env = getRuntimeEnv(locals);
		const body = await request.json();
		if (!body.postId || !body.authorName || !body.authorEmail || !body.content) return new Response(JSON.stringify({ error: "postId, authorName, authorEmail, and content are required" }), { status: 400 });
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.authorEmail)) return new Response(JSON.stringify({ error: "Invalid email address" }), { status: 400 });
		const ipAddress = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || null;
		const userAgent = request.headers.get("user-agent") || null;
		const adminUser = await verifyAccessJWT(request, env);
		const autoApprove = Boolean(adminUser);
		const comment = await createComment(db, {
			postId: body.postId,
			parentId: body.parentId || null,
			authorName: body.authorName,
			authorEmail: body.authorEmail,
			content: body.content,
			ipAddress,
			userAgent,
			autoApprove
		});
		return Response.json({
			success: true,
			message: autoApprove ? "Comment published!" : "Thank you! Your comment has been submitted and will appear once approved.",
			comment
		}, { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/comments/index@_@ts
var page = () => comments_exports;
//#endregion
export { page };
