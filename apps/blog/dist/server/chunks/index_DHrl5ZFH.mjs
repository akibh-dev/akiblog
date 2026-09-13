globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Bp6qAf0c.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { r as getAllTags, t as createTag } from "./tags_HgVHpaP4.mjs";
//#region src/pages/api/tags/index.ts
var tags_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async ({ locals }) => {
	try {
		const db = getDb(locals);
		const allTags = await getAllTags(db);
		return Response.json(allTags);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
var POST = async ({ request, locals }) => {
	const env = getRuntimeEnv(locals);
	if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	try {
		const db = getDb(locals);
		const body = await request.json();
		if (!body.name) return new Response(JSON.stringify({ error: "Tag name is required" }), { status: 400 });
		const tag = await createTag(db, {
			name: body.name,
			slug: body.slug,
			color: body.color
		});
		return Response.json({
			success: true,
			tag
		}, { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/tags/index@_@ts
var page = () => tags_exports;
//#endregion
export { page };
