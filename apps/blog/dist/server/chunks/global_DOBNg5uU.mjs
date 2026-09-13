globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as maybeRenderHead, m as createRenderInstruction, u as renderTemplate } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
//#region ../../node_modules/.pnpm/astro@7.3.2_@emnapi+core@1.11.1_@emnapi+runtime@1.11.3_@types+node@22.20.2_jiti@2.7.0_tsx@4.23.13/node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/components/ui/ThemeToggle.astro
var $$ThemeToggle = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<button id="theme-toggle" type="button" aria-label="Toggle dark mode" class="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"><!-- Sun Icon (shown in dark mode) --><svg id="theme-toggle-light-icon" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg><!-- Moon Icon (shown in light mode) --><svg id="theme-toggle-dark-icon" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg></button>${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/ThemeToggle.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/ThemeToggle.astro", void 0);
//#endregion
export { renderScript as n, $$ThemeToggle as t };
