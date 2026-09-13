globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Bp6qAf0c.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { r as getAllPostsForAdmin, s as getPublishedPosts, t as createPost } from "./posts_CMTQj74H.mjs";
//#region src/pages/api/posts/index.ts
var posts_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ request, locals }) => {
	try {
		const db = getDb(locals);
		const env = getRuntimeEnv(locals);
		const url = new URL(request.url);
		if (url.searchParams.get("admin") === "true") {
			if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
			const allPosts = await getAllPostsForAdmin(db);
			return Response.json(allPosts);
		}
		const search = url.searchParams.get("q") || void 0;
		const tagSlug = url.searchParams.get("tag") || void 0;
		const limit = Number(url.searchParams.get("limit")) || 50;
		const offset = Number(url.searchParams.get("offset")) || 0;
		const result = await getPublishedPosts(db, {
			search,
			tagSlug,
			limit,
			offset
		});
		return Response.json(result);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
var POST = async ({ request, locals }) => {
	const env = getRuntimeEnv(locals);
	const user = await verifyAccessJWT(request, env);
	if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	try {
		const db = getDb(locals);
		const body = await request.json();
		if (!body.title || !body.content) return new Response(JSON.stringify({ error: "Title and content are required" }), { status: 400 });
		const post = await createPost(db, {
			title: body.title,
			slug: body.slug,
			excerpt: body.excerpt,
			content: typeof body.content === "object" ? JSON.stringify(body.content) : body.content,
			coverImage: body.coverImage,
			status: body.status || "draft",
			authorEmail: user.email,
			allowComments: body.allowComments ?? true,
			tagIds: body.tagIds || []
		});
		return Response.json({
			success: true,
			post
		}, { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/posts/index@_@ts
var page = () => posts_exports;
//#endregion
export { page };
