globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as maybeRenderHead, p as addAttribute, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
//#region src/components/ui/TagBadge.astro
createAstro("https://astro.build");
var $$TagBadge = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$TagBadge;
	const { tag, size = "sm", clickable = true } = Astro.props;
	const sizeClasses = size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3.5 py-1.5";
	const color = tag.color || "#3B82F6";
	return renderTemplate`${clickable ? renderTemplate`${maybeRenderHead($$result)}<a${addAttribute(`/tags/${tag.slug}`, "href")}${addAttribute(`inline-flex items-center gap-1.5 font-medium rounded-full transition-colors border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400 ${sizeClasses}`, "class")}><span class="w-1.5 h-1.5 rounded-full"${addAttribute(`background-color: ${color};`, "style")}></span><span>${tag.name}</span></a>` : renderTemplate`<span${addAttribute(`inline-flex items-center gap-1.5 font-medium rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 ${sizeClasses}`, "class")}><span class="w-1.5 h-1.5 rounded-full"${addAttribute(`background-color: ${color};`, "style")}></span><span>${tag.name}</span></span>`}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/TagBadge.astro", void 0);
//#endregion
export { $$TagBadge as t };
