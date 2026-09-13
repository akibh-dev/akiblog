globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { n as renderScript } from "./global_DOBNg5uU.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CgT8jZJD.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as verifyAccessJWT } from "./auth_Bp6qAf0c.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { r as getAllTags } from "./tags_HgVHpaP4.mjs";
//#region src/pages/admin/tags.astro
var tags_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Tags,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Tags = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Tags;
	const env = getRuntimeEnv(Astro.locals);
	const user = await verifyAccessJWT(Astro.request, env);
	if (!user) return new Response("Unauthorized Access. Please login via Cloudflare Access.", { status: 401 });
	const db = getDb(Astro.locals);
	const tags = await getAllTags(db);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Tags & Categories",
		"userEmail": user.email
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"><!-- Tag Creation Form --><div class="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"><h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Create Tag</h2><p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Add a category or topic tag to organize articles.</p><form id="create-tag-form" class="space-y-4"><div><label for="tagName" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Tag Name *</label><input type="text" id="tagName" name="name" required placeholder="e.g. Cloudflare, Astro, TypeScript" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div><label for="tagSlug" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Slug (Optional)</label><input type="text" id="tagSlug" name="slug" placeholder="auto-generated-if-empty" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div><label for="tagColor" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Badge Accent Color</label><div class="flex items-center gap-3"><input type="color" id="tagColor" name="color" value="#3B82F6" class="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"><span class="text-xs text-slate-500 dark:text-slate-400">Choose a color for UI pills and accents</span></div></div><div id="tag-form-msg" class="text-sm font-medium hidden"></div><button type="submit" id="tag-submit-btn" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50">Add Tag</button></form></div><!-- Tags List --><div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"><div class="p-6 border-b border-slate-100 dark:border-slate-800/80"><h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">All Tags (${tags.length})</h2></div>${tags.length === 0 ? renderTemplate`<div class="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">No tags created yet.</div>` : renderTemplate`<div class="divide-y divide-slate-100 dark:divide-slate-800/80">${tags.map((tag) => renderTemplate`<div class="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"${addAttribute(`tag-row-${tag.id}`, "id")}><div class="flex items-center gap-3"><span class="w-3.5 h-3.5 rounded-full shrink-0"${addAttribute(`background-color: ${tag.color};`, "style")}></span><div><div class="font-bold text-sm text-slate-900 dark:text-slate-100">${tag.name}</div><div class="text-xs font-mono text-slate-400">/tags/${tag.slug}</div></div></div><div class="flex items-center gap-2"><a${addAttribute(`/tags/${tag.slug}`, "href")} target="_blank" class="text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">View ↗</a><button type="button" class="delete-tag-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"${addAttribute(tag.id, "data-tag-id")} title="Delete tag"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`)}</div>`}</div></div>` })}${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/tags.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/tags.astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/tags.astro";
var $$url = "/admin/tags";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/tags@_@astro
var page = () => tags_exports;
//#endregion
export { page };
