globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
//#region src/lib/env.ts
/**
* @file apps/blog/src/lib/env.ts
* @description Cloudflare environment accessor supporting Astro v6/v7 and legacy fallbacks.
* 
* POC / Implementation Details:
* - In Astro v6/v7 with `@astrojs/cloudflare` v14+, Cloudflare bindings are exported via `cloudflare:workers` (env).
* - This accessor safely inspects `cloudflare:workers` env first, falling back to `locals.runtime.env` (for test harnesses).
*/
function getRuntimeEnv(locals) {
	let combined = {};
	try {
		if (env && typeof env === "object") combined = { ...env };
	} catch {}
	try {
		const runtimeEnv = locals?.runtime?.env;
		if (runtimeEnv && typeof runtimeEnv === "object") combined = {
			...runtimeEnv,
			...combined
		};
	} catch {}
	return combined;
}
//#endregion
export { getRuntimeEnv as t };
