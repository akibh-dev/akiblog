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
import { r as getAllCommentsForAdmin } from "./comments_CZPswOHc.mjs";
//#region src/pages/admin/comments.astro
var comments_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Comments,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Comments = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Comments;
	const env = getRuntimeEnv(Astro.locals);
	const user = await verifyAccessJWT(Astro.request, env);
	if (!user) return new Response("Unauthorized Access. Please login via Cloudflare Access.", { status: 401 });
	const db = getDb(Astro.locals);
	const comments = await getAllCommentsForAdmin(db);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Comments Moderation",
		"userEmail": user.email
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Comment Moderation</h1><p class="text-sm text-slate-500 dark:text-slate-400">Review, approve, and moderate reader comments.</p></div></div><div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">${comments.length === 0 ? renderTemplate`<div class="py-16 text-center text-slate-500 dark:text-slate-400"><p class="text-base font-semibold">No comments submitted yet</p><p class="text-sm mt-1">Reader comments will appear here for review.</p></div>` : renderTemplate`<div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm"><thead class="bg-slate-50 dark:bg-slate-800/50"><tr><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Author</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Comment</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Post</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th><th scope="col" class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th></tr></thead><tbody class="divide-y divide-slate-200 dark:divide-slate-800">${comments.map((comment) => {
		const dateStr = new Date(comment.createdAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
		return renderTemplate`<tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"${addAttribute(`comment-row-${comment.id}`, "id")}><td class="px-6 py-4 whitespace-nowrap"><div class="font-bold text-slate-900 dark:text-slate-100">${comment.authorName}</div><div class="text-xs text-slate-500 dark:text-slate-400 font-mono">${comment.authorEmail}</div><div class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">${dateStr}</div></td><td class="px-6 py-4 max-w-sm"><p class="text-slate-700 dark:text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">${comment.content}</p></td><td class="px-6 py-4 whitespace-nowrap"><a${addAttribute(`/posts/${comment.postSlug}`, "href")} target="_blank" class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 max-w-[200px]">${comment.postTitle}</a></td><td class="px-6 py-4 whitespace-nowrap"><span${addAttribute(`comment-badge-${comment.id}`, "id")}${addAttribute(`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${comment.isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"}`, "class")}><span${addAttribute(`w-1.5 h-1.5 rounded-full ${comment.isApproved ? "bg-emerald-500" : "bg-amber-500"}`, "class")}></span><span>${comment.isApproved ? "Approved" : "Pending"}</span></span></td><td class="px-6 py-4 whitespace-nowrap text-right"><div class="inline-flex items-center gap-2"><button type="button" class="toggle-approval-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"${addAttribute(comment.id, "data-comment-id")}${addAttribute(String(comment.isApproved), "data-current-approved")}>${comment.isApproved ? "Unapprove" : "Approve"}</button><button type="button" class="delete-comment-btn p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"${addAttribute(comment.id, "data-comment-id")} title="Delete comment"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></td></tr>`;
	})}</tbody></table></div>`}</div>` })}${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/comments.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/comments.astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/admin/comments.astro";
var $$url = "/admin/comments";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/comments@_@astro
var page = () => comments_exports;
//#endregion
export { page };
