globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Crr6vjTf.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { a as setCommentApproval, n as deleteComment } from "./comments_CZPswOHc.mjs";
//#region src/pages/api/comments/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	PUT: () => PUT
});
var PUT = async ({ params, request, locals }) => {
	const env = getRuntimeEnv(locals);
	if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
	try {
		const db = getDb(locals);
		const id = params.id;
		if (!id) return new Response(JSON.stringify({ error: "Comment ID required" }), { status: 400 });
		const body = await request.json();
		const isApproved = Boolean(body.isApproved);
		if (!await setCommentApproval(db, id, isApproved)) return new Response(JSON.stringify({ error: "Comment not found" }), { status: 404 });
		return Response.json({
			success: true,
			isApproved
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
		if (!id) return new Response(JSON.stringify({ error: "Comment ID required" }), { status: 400 });
		if (!await deleteComment(db, id)) return new Response(JSON.stringify({ error: "Comment not found or already deleted" }), { status: 404 });
		return Response.json({ success: true });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/comments/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
