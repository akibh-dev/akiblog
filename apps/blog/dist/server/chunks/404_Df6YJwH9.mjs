globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { t as $$Layout } from "./Layout_DGLHzemq.mjs";
//#region src/pages/404.astro
var _404_exports = /* @__PURE__ */ __exportAll({
	default: () => $$404,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
var $$404 = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "404 — Page Not Found" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="py-24 text-center"><div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-black text-2xl mb-6">404</div><h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">Page Not Found</h1><p class="mt-3 text-slate-600 dark:text-slate-400 max-w-md mx-auto">The article or page you are looking for doesn't exist, was renamed, or has been removed.</p><div class="mt-8"><a href="/" class="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm">← Back to Homepage</a></div></div>` })}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/404.astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/404.astro";
var $$url = "/404";
//#endregion
//#region \0virtual:astro:page:src/pages/404@_@astro
var page = () => _404_exports;
//#endregion
export { page };
