globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as maybeRenderHead, f as renderHead, i as renderComponent, p as addAttribute, s as renderSlot, u as renderTemplate, w as createAstro } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { t as $$ThemeToggle } from "./global_DOBNg5uU.mjs";
//#region src/components/ui/Header.astro
createAstro("https://astro.build");
var $$Header = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Header;
	const { siteTitle = "akib.blog" } = Astro.props;
	const currentPath = Astro.url.pathname;
	return renderTemplate`${maybeRenderHead($$result)}<header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"><!-- Brand Logo / Title --><a href="/" class="flex items-center gap-2.5 font-black text-xl tracking-tight text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><span class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">A</span><span>${siteTitle}</span></a><!-- Nav Links & Theme Toggle --><div class="flex items-center gap-3 sm:gap-6"><nav class="flex items-center gap-1 sm:gap-2"><a href="/"${addAttribute(`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPath === "/" ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"}`, "class")}>Articles</a><a href="/admin"${addAttribute(`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPath.startsWith("/admin") ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"}`, "class")}>Admin</a></nav><div class="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})}</div></div></header>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/Header.astro", void 0);
//#endregion
//#region src/components/ui/Footer.astro
createAstro("https://astro.build");
var $$Footer = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Footer;
	const { authorName = "Md Akib Hasan" } = Astro.props;
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	return renderTemplate`${maybeRenderHead($$result)}<footer class="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-10 transition-colors"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex flex-col sm:flex-row items-center justify-between gap-4"><div class="text-sm text-slate-500 dark:text-slate-400">© ${currentYear} ${authorName}. Edge-native blog powered by Astro & Cloudflare.</div><div class="flex items-center gap-6 text-sm"><a href="/rss.xml" class="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5" aria-label="RSS Feed"><svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 1 1-2.18 2.18 2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-3.32A12.24 12.24 0 0 0 4 7.76zm0 5.88a9.68 9.68 0 0 1 9.68 9.68h-3.32A6.36 6.36 0 0 0 4 13.64z"></path></svg><span>RSS Feed</span></a><a href="#top" class="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Back to top ↑</a></div></div></div></footer>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/Footer.astro", void 0);
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title = "Blog — Notes & Engineering Log", description = "A focused log of engineering decisions, architecture notes, and web development lessons.", image = "/og-image.png", canonicalUrl = Astro.url.href } = Astro.props;
	const siteTitle = "akib.blog";
	return renderTemplate`<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.ico"><link rel="canonical"${addAttribute(canonicalUrl, "href")}><link rel="alternate" type="application/rss+xml"${addAttribute(`${siteTitle} RSS Feed`, "title")} href="/rss.xml"><!-- Primary Meta Tags --><title>${title}</title><meta name="title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(canonicalUrl, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}>${image && renderTemplate`<meta property="og:image"${addAttribute(image, "content")}>`}<!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(canonicalUrl, "content")}><meta property="twitter:title"${addAttribute(title, "content")}><meta property="twitter:description"${addAttribute(description, "content")}>${image && renderTemplate`<meta property="twitter:image"${addAttribute(image, "content")}>`}<!-- Prevent Theme Flash --><script>
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
    <\/script>${renderHead($$result)}</head><body class="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen antialiased selection:bg-blue-500 selection:text-white"><a id="top"></a>${renderComponent($$result, "Header", $$Header, { "siteTitle": siteTitle })}<main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">${renderSlot($$result, $$slots["default"])}</main>${renderComponent($$result, "Footer", $$Footer, {})}</body></html>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/layouts/Layout.astro", void 0);
//#endregion
export { $$Layout as t };
