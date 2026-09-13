globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Bp6qAf0c.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { n as deleteTag } from "./tags_HgVHpaP4.mjs";
//#region src/pages/api/tags/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({ DELETE: () => DELETE });
var DELETE = async ({ params, request, locals }) => {
	const env = getRuntimeEnv(locals);
	if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	try {
		const db = getDb(locals);
		const id = params.id;
		if (!id) return new Response(JSON.stringify({ error: "Tag ID required" }), { status: 400 });
		if (!await deleteTag(db, id)) return new Response(JSON.stringify({ error: "Tag not found or already deleted" }), { status: 404 });
		return Response.json({ success: true });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/tags/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
