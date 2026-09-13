globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { t as $$Layout } from "./Layout_DGLHzemq.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { r as getAllTags } from "./tags_HgVHpaP4.mjs";
import { s as getPublishedPosts } from "./posts_CMTQj74H.mjs";
import { t as $$TagBadge } from "./TagBadge_D0l4MdDU.mjs";
import { n as $$TagFilter, r as $$PostCard, t as $$EmptyState } from "./EmptyState_CgmJF8lW.mjs";
//#region src/components/ui/FeaturedPostCard.astro
createAstro("https://astro.build");
var $$FeaturedPostCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$FeaturedPostCard;
	const { post } = Astro.props;
	const dateFormatted = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric"
	}) : new Date(post.createdAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric"
	});
	return renderTemplate`${maybeRenderHead($$result)}<article class="group relative bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900/50 rounded-3xl border border-blue-100 dark:border-slate-800 p-6 sm:p-8 lg:p-10 hover:border-blue-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-xl"><div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"><div class="lg:col-span-7 flex flex-col justify-between"><div><div class="flex items-center gap-3 mb-4"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm">Featured Article</span>${post.tags && post.tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-1.5">${post.tags.slice(0, 2).map((tag) => renderTemplate`${renderComponent($$result, "TagBadge", $$TagBadge, {
		"tag": tag,
		"size": "sm"
	})}`)}</div>`}</div><h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight"><a${addAttribute(`/posts/${post.slug}`, "href")} class="focus:outline-none"><span class="absolute inset-0" aria-hidden="true"></span>${post.title}</a></h2>${post.excerpt && renderTemplate`<p class="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">${post.excerpt}</p>`}</div><div class="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400"><time${addAttribute(new Date(post.publishedAt || post.createdAt).toISOString(), "datetime")}>${dateFormatted}</time><span>•</span><div class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>${post.readingTime}</span></div></div></div>${post.coverImage && renderTemplate`<div class="lg:col-span-5"><div class="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-md"><img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div></div>`}</div></article>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/FeaturedPostCard.astro", void 0);
//#endregion
//#region src/components/ui/SearchBar.astro
createAstro("https://astro.build");
var $$SearchBar = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SearchBar;
	const { initialValue = "", placeholder = "Search articles, topics, keywords...", action = "/" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<form method="GET"${addAttribute(action, "action")} class="relative w-full"><div class="relative flex items-center"><div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div><input type="search" name="q"${addAttribute(initialValue, "value")}${addAttribute(placeholder, "placeholder")} class="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"><div class="absolute inset-y-1.5 right-1.5 flex items-center"><button type="submit" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">Search</button></div></div></form>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/SearchBar.astro", void 0);
//#endregion
//#region src/components/ui/Pagination.astro
createAstro("https://astro.build");
var $$Pagination = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Pagination;
	const { currentPage, totalPages, baseUrl } = Astro.props;
	if (totalPages <= 1) return null;
	function getPageUrl(p) {
		const url = new URL(baseUrl, "http://localhost");
		if (p === 1) url.searchParams.delete("page");
		else url.searchParams.set("page", String(p));
		return `${url.pathname}${url.search}`;
	}
	return renderTemplate`${maybeRenderHead($$result)}<nav class="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">${currentPage > 1 ? renderTemplate`<a${addAttribute(getPageUrl(currentPage - 1), "href")} class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">← Previous</a>` : renderTemplate`<span class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed">← Previous</span>`}<span class="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 font-medium">Page ${currentPage} of ${totalPages}</span>${currentPage < totalPages ? renderTemplate`<a${addAttribute(getPageUrl(currentPage + 1), "href")} class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next →</a>` : renderTemplate`<span class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed">Next →</span>`}</nav>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/Pagination.astro", void 0);
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	prerender: () => false,
	url: () => ""
});
createAstro("https://astro.build");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const url = new URL(Astro.request.url);
	const search = url.searchParams.get("q") || void 0;
	const tagSlug = url.searchParams.get("tag") || void 0;
	const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
	const limit = 9;
	const offset = (page - 1) * limit;
	let posts = [];
	let total = 0;
	let allTags = [];
	try {
		const db = getDb(Astro.locals);
		const result = await getPublishedPosts(db, {
			search,
			tagSlug,
			limit,
			offset
		});
		posts = result.posts;
		total = result.total;
		allTags = await getAllTags(db);
	} catch (error) {
		console.error("Error fetching blog data:", error);
	}
	const totalPages = Math.ceil(total / limit);
	const featuredPost = !search && !tagSlug && page === 1 && posts.length > 0 ? posts[0] : null;
	const feedPosts = featuredPost ? posts.slice(1) : posts;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Blog — Engineering Notes & Technical Writing",
		"description": "A focused log of software architecture, edge systems, web performance, and developer experience."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="py-6 sm:py-10"><div class="max-w-3xl"><div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 mb-4"><span>Software Engineering & Architecture</span></div><h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">notes.from.akib</h1><p class="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">Deep dives into distributed edge architecture, serverless databases, clean systems design, and modern web application development.</p></div><!-- Search & Filter Controls --><div class="mt-8 space-y-4">${renderComponent($$result, "SearchBar", $$SearchBar, { "initialValue": search })}${renderComponent($$result, "TagFilter", $$TagFilter, {
		"tags": allTags,
		"activeSlug": tagSlug
	})}</div></section><section class="py-6 space-y-12">${featuredPost && renderTemplate`<div>${renderComponent($$result, "FeaturedPostCard", $$FeaturedPostCard, { "post": featuredPost })}</div>`}${feedPosts.length > 0 ? renderTemplate`<div>${featuredPost && renderTemplate`<h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Recent Articles</h2>`}<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${feedPosts.map((post) => renderTemplate`${renderComponent($$result, "PostCard", $$PostCard, { "post": post })}`)}</div></div>` : !featuredPost && renderTemplate`${renderComponent($$result, "EmptyState", $$EmptyState, {
		"title": "No articles found",
		"description": search ? `No articles matched your search for "${search}".` : "There are no published articles yet.",
		"actionHref": "/",
		"actionText": "Clear Search"
	})}`}${renderComponent($$result, "Pagination", $$Pagination, {
		"currentPage": page,
		"totalPages": totalPages,
		"baseUrl": url.toString()
	})}</section>` })}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/index.astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
