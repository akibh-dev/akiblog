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
import { o as getPostStats, r as getAllPostsForAdmin } from "./posts_CMTQj74H.mjs";
//#region src/components/admin/StatusBadge.astro
createAstro("https://astro.build");
var $$StatusBadge = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$StatusBadge;
	const { status } = Astro.props;
	const config = {
		published: {
			label: "Published",
			classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
			dot: "bg-emerald-500"
		},
		draft: {
			label: "Draft",
			classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
			dot: "bg-amber-500"
		},
		archived: {
			label: "Archived",
			classes: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
			dot: "bg-slate-400"
		}
	};
	const current = config[status] || config.draft;
	return renderTemplate`${maybeRenderHead($$result)}<span${addAttribute(`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.classes}`, "class")}><span${addAttribute(`w-1.5 h-1.5 rounded-full ${current.dot}`, "class")}></span><span>${current.label}</span></span>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/admin/StatusBadge.astro", void 0);
//#endregion
//#region src/pages/admin/index.astro
var admin_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const env = getRuntimeEnv(Astro.locals);
	const user = await verifyAccessJWT(Astro.request, env);
	if (!user) return new Response("Unauthorized Access. Please login via Cloudflare Access.", { status: 401 });
	const db = getDb(Astro.locals);
	const posts = await getAllPostsForAdmin(db);
	const stats = await getPostStats(db);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Post Management",
		"userEmail": user.email
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"><div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Posts</div><div class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">${stats.totalPosts}</div></div><div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Published</div><div class="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">${stats.publishedCount}</div></div><div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Drafts</div><div class="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">${stats.draftCount}</div></div><div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Pending Comments</div><div class="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">${stats.pendingComments}</div></div></div><div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6"><div><h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Articles</h1><p class="text-sm text-slate-500 dark:text-slate-400">Manage all articles, drafts, and publication status.</p></div><a href="/admin/write" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg><span>Write New Article</span></a></div><div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">${posts.length === 0 ? renderTemplate`<div class="py-16 text-center text-slate-500 dark:text-slate-400"><p class="text-base font-semibold">No articles yet</p><p class="text-sm mt-1">Get started by creating your very first post.</p><div class="mt-4"><a href="/admin/write" class="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Create First Post</a></div></div>` : renderTemplate`<div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm"><thead class="bg-slate-50 dark:bg-slate-800/50"><tr><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Tags</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th></tr></thead><tbody class="divide-y divide-slate-200 dark:divide-slate-800">${posts.map((post) => {
		const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		}) : new Date(post.createdAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
		return renderTemplate`<tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"${addAttribute(`post-row-${post.id}`, "id")}><td class="px-6 py-4"><div class="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">${post.title}</div><div class="text-xs font-mono text-slate-400 dark:text-slate-500 line-clamp-1">/${post.slug}</div></td><td class="px-6 py-4 whitespace-nowrap">${renderComponent($$result, "StatusBadge", $$StatusBadge, { "status": post.status })}</td><td class="px-6 py-4"><div class="flex flex-wrap gap-1 max-w-xs">${post.tags.map((t) => renderTemplate`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${t.name}</span>`)}</div></td><td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">${dateStr}</td><td class="px-6 py-4 whitespace-nowrap text-right"><div class="inline-flex items-center gap-2">${post.status === "published" && renderTemplate`<a${addAttribute(`/posts/${post.slug}`, "href")} target="_blank" class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="View live post"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`}<a${addAttribute(`/admin/edit/${post.id}`, "href")} class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit post"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></a><button type="button" class="delete-post-btn p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"${addAttribute(post.id, "data-post-id")}${addAttribute(post.title, "data-post-title")} title="Delete post"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></td></tr>`;
	})}</tbody></table></div>`}</div>` })}${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/index.astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/index.astro";
var $$url = "/admin";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/index@_@astro
var page = () => admin_exports;
//#endregion
export { page };
