globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { t as $$Layout } from "./Layout_DGLHzemq.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { i as getTagBySlug, r as getAllTags } from "./tags_HgVHpaP4.mjs";
import { s as getPublishedPosts } from "./posts_CMTQj74H.mjs";
import { n as $$TagFilter, r as $$PostCard, t as $$EmptyState } from "./EmptyState_CgmJF8lW.mjs";
//#region src/pages/tags/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { slug } = Astro.params;
	if (!slug) return Astro.redirect("/");
	const db = getDb(Astro.locals);
	const tag = await getTagBySlug(db, slug);
	if (!tag) return Astro.redirect("/404");
	const allTags = await getAllTags(db);
	const { posts } = await getPublishedPosts(db, { tagSlug: slug });
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": `Articles on #${tag.name} — akib.blog`,
		"description": `Explore technical posts and deep dives categorized under ${tag.name}.`
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="py-6 sm:py-10"><div class="flex items-center gap-2 mb-3"><a href="/" class="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Articles</a><span class="text-slate-400">/</span><span class="text-sm font-medium text-slate-700 dark:text-slate-300">Tag</span></div><div class="flex items-center gap-3"><span class="w-4 h-4 rounded-full"${addAttribute(`background-color: ${tag.color || "#3B82F6"};`, "style")}></span><h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">#${tag.name}</h1></div><p class="mt-2 text-slate-600 dark:text-slate-400">Found ${posts.length} ${posts.length === 1 ? "article" : "articles"} tagged with #${tag.name}.</p><!-- Tag Filter Bar --><div class="mt-8">${renderComponent($$result, "TagFilter", $$TagFilter, {
		"tags": allTags,
		"activeSlug": tag.slug
	})}</div></div><section class="py-6">${posts.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${posts.map((post) => renderTemplate`${renderComponent($$result, "PostCard", $$PostCard, { "post": post })}`)}</div>` : renderTemplate`${renderComponent($$result, "EmptyState", $$EmptyState, {
		"title": `No articles found for #${tag.name}`,
		"description": "Check back later for new articles published under this tag.",
		"actionHref": "/",
		"actionText": "Back to all articles"
	})}`}</section>` })}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/tags/[slug].astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/tags/[slug].astro";
var $$url = "/tags/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/tags/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
