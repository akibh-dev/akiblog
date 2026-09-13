globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { t as $$TagBadge } from "./TagBadge_D0l4MdDU.mjs";
//#region src/components/ui/PostCard.astro
createAstro("https://astro.build");
var $$PostCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PostCard;
	const { post } = Astro.props;
	const dateFormatted = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	}) : new Date(post.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
	return renderTemplate`${maybeRenderHead($$result)}<article class="group relative flex flex-col bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300">${post.coverImage && renderTemplate`<div class="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800"><img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")} loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"></div>`}<div class="flex-1 p-6 flex flex-col justify-between"><div>${post.tags && post.tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-1.5 mb-3">${post.tags.slice(0, 3).map((tag) => renderTemplate`${renderComponent($$result, "TagBadge", $$TagBadge, {
		"tag": tag,
		"size": "sm"
	})}`)}</div>`}<h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"><a${addAttribute(`/posts/${post.slug}`, "href")} class="focus:outline-none"><span class="absolute inset-0" aria-hidden="true"></span>${post.title}</a></h2>${post.excerpt && renderTemplate`<p class="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">${post.excerpt}</p>`}</div><div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><time${addAttribute(new Date(post.publishedAt || post.createdAt).toISOString(), "datetime")}>${dateFormatted}</time><div class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>${post.readingTime}</span></div></div></div></article>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/PostCard.astro", void 0);
//#endregion
//#region src/components/ui/TagFilter.astro
createAstro("https://astro.build");
var $$TagFilter = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$TagFilter;
	const { tags, activeSlug, baseUrl = "/" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none"><a${addAttribute(baseUrl, "href")}${addAttribute(`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!activeSlug ? "bg-blue-600 text-white font-semibold" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`, "class")}>All Articles</a>${tags.map((tag) => {
		const isActive = activeSlug === tag.slug;
		return renderTemplate`<a${addAttribute(`/tags/${tag.slug}`, "href")}${addAttribute(`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${isActive ? "bg-blue-600 text-white font-semibold" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`, "class")}><span class="w-1.5 h-1.5 rounded-full"${addAttribute(`background-color: ${isActive ? "#ffffff" : tag.color || "#3B82F6"};`, "style")}></span><span>${tag.name}</span></a>`;
	})}</div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/TagFilter.astro", void 0);
//#endregion
//#region src/components/ui/EmptyState.astro
createAstro("https://astro.build");
var $$EmptyState = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$EmptyState;
	const { title = "No articles found", description = "Try searching with different keywords or selecting another tag.", actionHref, actionText } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="py-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8"><div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg></div><h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">${title}</h3><p class="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">${description}</p>${actionHref && actionText && renderTemplate`<div class="mt-6"><a${addAttribute(actionHref, "href")} class="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">${actionText}</a></div>`}</div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/EmptyState.astro", void 0);
//#endregion
export { $$TagFilter as n, $$PostCard as r, $$EmptyState as t };
