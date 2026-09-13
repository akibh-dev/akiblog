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
//#region src/pages/admin/write.astro
var write_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Write,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Write = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Write;
	const env = getRuntimeEnv(Astro.locals);
	const user = await verifyAccessJWT(Astro.request, env);
	if (!user) return new Response("Unauthorized Access. Please login via Cloudflare Access.", { status: 401 });
	const db = getDb(Astro.locals);
	const allTags = await getAllTags(db);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "New Article",
		"userEmail": user.email
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<form id="write-post-form" class="space-y-8 max-w-4xl mx-auto"><!-- Top Action Bar --><div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800"><div><h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Write New Article</h1><p class="text-sm text-slate-500 dark:text-slate-400">Craft and publish structured content directly to the edge.</p></div><div class="flex items-center gap-3"><a href="/admin" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors">Cancel</a><button type="submit" id="save-post-btn" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50">Save Article</button></div></div><!-- Alert / Status message --><div id="post-status-msg" class="hidden p-4 rounded-xl text-sm font-medium"></div><!-- Post Metadata Details --><div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm"><div><label for="title" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Article Title *</label><input type="text" id="title" name="title" required placeholder="e.g. Architecting Distributed Systems with Cloudflare" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-lg font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="slug" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">URL Slug</label><input type="text" id="slug" name="slug" placeholder="architecting-distributed-systems" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div><label for="status" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Publication Status</label><select id="status" name="status" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="draft">Draft (Private)</option><option value="published">Published (Public)</option><option value="archived">Archived</option></select></div></div><div><label for="excerpt" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Excerpt / Summary</label><textarea id="excerpt" name="excerpt" rows="2" placeholder="A brief summary for previews, SEO description, and search cards..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></div><div><label for="coverImage" class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Cover Image URL</label><input type="url" id="coverImage" name="coverImage" placeholder="https://images.unsplash.com/... or uploaded URL" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><!-- Tag selection -->${allTags.length > 0 && renderTemplate`<div><label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Categories & Tags</label><div class="flex flex-wrap gap-2">${allTags.map((tag) => renderTemplate`<label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><input type="checkbox" name="tagIds"${addAttribute(tag.id, "value")} class="rounded text-blue-600 focus:ring-blue-500"><span class="w-1.5 h-1.5 rounded-full"${addAttribute(`background-color: ${tag.color || "#3B82F6"};`, "style")}></span><span>${tag.name}</span></label>`)}</div></div>`}<!-- Comments Toggle --><div class="flex items-center gap-2"><input type="checkbox" id="allowComments" name="allowComments" checked class="rounded text-blue-600 focus:ring-blue-500"><label for="allowComments" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Allow reader comments on this article</label></div></div><!-- Structured Editor.js Section --><div class="space-y-2"><label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Article Content *</label><input type="hidden" id="editor-content-input" name="contentJson">${renderComponent($$result, "Editor", null, {
		"client:only": "react",
		"placeholder": "Start writing your article... click '+' or type '/' for blocks",
		"client:component-hydration": "only",
		"client:component-path": "/home/akib/Desktop/akiblog/apps/blog/src/components/editor/Editor.tsx",
		"client:component-export": "default"
	})}</div></form>` })}${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/write.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/write.astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/write.astro";
var $$url = "/admin/write";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/write@_@astro
var page = () => write_exports;
//#endregion
export { page };
