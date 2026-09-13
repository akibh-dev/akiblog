globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
//#region src/pages/api/media/[...key].ts
var ____key__exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ params, locals }) => {
	const env = locals?.runtime?.env;
	const key = params.key;
	if (!key || !env?.BUCKET) return new Response("Not Found", { status: 404 });
	try {
		const object = await env.BUCKET.get(key);
		if (!object) return new Response("Object Not Found", { status: 404 });
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("etag", object.httpEtag);
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		return new Response(object.body, { headers });
	} catch (err) {
		return new Response("Error retrieving media", { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/media/[...key]@_@ts
var page = () => ____key__exports;
//#endregion
export { page };
