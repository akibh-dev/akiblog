globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as verifyAccessJWT } from "./auth_Bp6qAf0c.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
//#region src/lib/storage.ts
async function uploadImageToStorage(file, env) {
	const extension = file.name.split(".").pop() || "png";
	const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
	if (env?.BUCKET) {
		await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
		const publicDomain = env.R2_PUBLIC_DOMAIN || "/api/media";
		return { url: `${publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain}/${key}` };
	}
	const buffer = await file.arrayBuffer();
	const base64 = Buffer.from(buffer).toString("base64");
	return { url: `data:${file.type || "image/png"};base64,${base64}` };
}
//#endregion
//#region src/pages/api/upload.ts
var upload_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ request, locals }) => {
	const env = getRuntimeEnv(locals);
	if (!await verifyAccessJWT(request, env)) return new Response(JSON.stringify({
		success: 0,
		error: "Unauthorized"
	}), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const file = (await request.formData()).get("image");
		if (!file) return new Response(JSON.stringify({
			success: 0,
			error: "No image file provided"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { url } = await uploadImageToStorage(file, env);
		return new Response(JSON.stringify({
			success: 1,
			file: { url }
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (error) {
		return new Response(JSON.stringify({
			success: 0,
			error: error.message || "Image upload failed"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/upload@_@ts
var page = () => upload_exports;
//#endregion
export { page };
