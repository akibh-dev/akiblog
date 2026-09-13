globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as maybeRenderHead, f as renderHead, i as renderComponent, p as addAttribute, s as renderSlot, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { t as $$ThemeToggle } from "./global_DOBNg5uU.mjs";
//#region src/components/admin/AdminNav.astro
createAstro("https://astro.build");
var $$AdminNav = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminNav;
	const { userEmail = "admin@akib35.me" } = Astro.props;
	const currentPath = Astro.url.pathname;
	const navItems = [
		{
			href: "/admin",
			label: "Posts",
			exact: true
		},
		{
			href: "/admin/write",
			label: "New Post",
			exact: false
		},
		{
			href: "/admin/comments",
			label: "Comments",
			exact: false
		},
		{
			href: "/admin/tags",
			label: "Tags",
			exact: false
		}
	];
	return renderTemplate`${maybeRenderHead($$result)}<header class="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"><div class="flex items-center gap-6"><a href="/admin" class="flex items-center gap-2 font-black text-lg tracking-tight text-slate-900 dark:text-slate-100"><span class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">A</span><span>Studio</span></a><nav class="hidden sm:flex items-center gap-1">${navItems.map((item) => {
		const isActive = item.exact ? currentPath === item.href : currentPath.startsWith(item.href);
		return renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"}`, "class")}>${item.label}</a>`;
	})}</nav></div><div class="flex items-center gap-4"><div class="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 bg-slate-50 dark:bg-slate-800/50"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="font-mono">${userEmail}</span></div><a href="/" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">View Blog ↗</a>${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})}</div></div><!-- Mobile nav row --><div class="sm:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800/80 px-2 py-1.5 overflow-x-auto">${navItems.map((item) => {
		const isActive = item.exact ? currentPath === item.href : currentPath.startsWith(item.href);
		return renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`px-3 py-1 rounded-md text-xs font-medium ${isActive ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-400"}`, "class")}>${item.label}</a>`;
	})}</div></header>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/admin/AdminNav.astro", void 0);
//#endregion
//#region src/components/admin/AdminLayout.astro
createAstro("https://astro.build");
var $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminLayout;
	const { title = "Admin Studio", userEmail = "admin@akib35.me" } = Astro.props;
	return renderTemplate`<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} — Studio</title><link rel="icon" type="image/svg+xml" href="/favicon.ico"><script>
      const theme = (() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('color-theme')) {
          return localStorage.getItem('color-theme');
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      })();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    <\/script>${renderHead($$result)}</head><body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">${renderComponent($$result, "AdminNav", $$AdminNav, { "userEmail": userEmail })}<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">${renderSlot($$result, $$slots["default"])}</main></body></html>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/admin/AdminLayout.astro", void 0);
//#endregion
export { $$AdminLayout as t };
