globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Bp6qAf0c.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { c as updatePost, i as getPostById, n as deletePost } from "./posts_CMTQj74H.mjs";
//#region src/pages/api/posts/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	PUT: () => PUT
});
var GET = async ({ params, locals }) => {
	try {
		const db = getDb(locals);
		const id = params.id;
		if (!id) return new Response(JSON.stringify({ error: "Post ID required" }), { status: 400 });
		const post = await getPostById(db, id);
		if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
		return Response.json(post);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
var PUT = async ({ params, request, locals }) => {
	const env = getRuntimeEnv(locals);
	if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	try {
		const db = getDb(locals);
		const id = params.id;
		if (!id) return new Response(JSON.stringify({ error: "Post ID required" }), { status: 400 });
		const body = await request.json();
		const updated = await updatePost(db, id, {
			title: body.title,
			slug: body.slug,
			excerpt: body.excerpt,
			content: typeof body.content === "object" ? JSON.stringify(body.content) : body.content,
			coverImage: body.coverImage,
			status: body.status,
			allowComments: body.allowComments,
			tagIds: body.tagIds
		});
		if (!updated) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
		return Response.json({
			success: true,
			post: updated
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
var DELETE = async ({ params, request, locals }) => {
	const env = getRuntimeEnv(locals);
	if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	try {
		const db = getDb(locals);
		const id = params.id;
		if (!id) return new Response(JSON.stringify({ error: "Post ID required" }), { status: 400 });
		if (!await deletePost(db, id)) return new Response(JSON.stringify({ error: "Post not found or already deleted" }), { status: 404 });
		return Response.json({ success: true });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/posts/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
