globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate, w as createAstro, x as unescapeHTML } from "./server_C5h2qq0N.mjs";
import { t as createComponent } from "./compiler_BmIeWdKh.mjs";
import { n as renderScript } from "./global_DOBNg5uU.mjs";
import { t as $$Layout } from "./Layout_DGLHzemq.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { i as getApprovedComments } from "./comments_CZPswOHc.mjs";
import { a as getPostBySlug } from "./posts_CMTQj74H.mjs";
import { t as $$TagBadge } from "./TagBadge_D0l4MdDU.mjs";
//#region src/components/ui/PostHeader.astro
createAstro("https://astro.build");
var $$PostHeader = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PostHeader;
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
	return renderTemplate`${maybeRenderHead($$result)}<header class="py-8 border-b border-slate-200 dark:border-slate-800"><div class="mb-4"><a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg><span>Back to articles</span></a></div>${post.tags && post.tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mb-4">${post.tags.map((tag) => renderTemplate`${renderComponent($$result, "TagBadge", $$TagBadge, {
		"tag": tag,
		"size": "md"
	})}`)}</div>`}<h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">${post.title}</h1>${post.excerpt && renderTemplate`<p class="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">${post.excerpt}</p>`}<div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">${post.authorEmail ? post.authorEmail.charAt(0).toUpperCase() : "A"}</div><span class="font-medium text-slate-700 dark:text-slate-300">${post.authorEmail}</span></div><span>•</span><time${addAttribute(new Date(post.publishedAt || post.createdAt).toISOString(), "datetime")}>${dateFormatted}</time><span>•</span><div class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>${post.readingTime}</span></div></div>${post.coverImage && renderTemplate`<div class="mt-8 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm max-h-[500px]"><img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover max-h-[500px]"></div>`}</header>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/PostHeader.astro", void 0);
//#endregion
//#region src/components/ui/TableOfContents.astro
createAstro("https://astro.build");
var $$TableOfContents = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$TableOfContents;
	const { contentJson } = Astro.props;
	const items = [];
	try {
		if (contentJson && contentJson.trim().startsWith("{")) {
			const parsed = JSON.parse(contentJson);
			if (Array.isArray(parsed.blocks)) {
				for (const block of parsed.blocks) if (block.type === "header" && block.data?.text) {
					const rawText = block.data.text.replace(/<[^>]*>?/gm, "");
					const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
					items.push({
						id,
						text: rawText,
						level: block.data.level || 2
					});
				}
			}
		}
	} catch {}
	return renderTemplate`${items.length > 1 && renderTemplate`${maybeRenderHead($$result)}<nav class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-sm"><div class="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg><span>Table of Contents</span></div><ul class="space-y-2">${items.map((item) => renderTemplate`<li${addAttribute(item.level === 3 ? "ml-3" : item.level >= 4 ? "ml-6" : "", "class")}><a${addAttribute(`#${item.id}`, "href")} class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 py-0.5">${item.text}</a></li>`)}</ul></nav>`}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/TableOfContents.astro", void 0);
//#endregion
//#region src/components/blocks/ParagraphBlock.astro
createAstro("https://astro.build");
var $$ParagraphBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ParagraphBlock;
	const { text } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<p class="text-slate-700 dark:text-slate-300 text-lg leading-relaxed my-4">${unescapeHTML(text)}</p>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/ParagraphBlock.astro", void 0);
//#endregion
//#region src/components/blocks/HeaderBlock.astro
createAstro("https://astro.build");
var $$HeaderBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$HeaderBlock;
	const { text, level = 2 } = Astro.props;
	const cleanText = text.replace(/<[^>]*>?/gm, "");
	const headingId = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
	const Tag = `h${level}`;
	const sizeClasses = {
		1: "text-3xl sm:text-4xl font-black mt-10 mb-4",
		2: "text-2xl sm:text-3xl font-extrabold mt-8 mb-3.5",
		3: "text-xl sm:text-2xl font-bold mt-7 mb-3",
		4: "text-lg sm:text-xl font-bold mt-6 mb-2"
	};
	const headingClass = sizeClasses[level] || sizeClasses[2];
	return renderTemplate`${renderComponent($$result, "Tag", Tag, {
		"id": headingId,
		"class": `text-slate-900 dark:text-slate-100 scroll-mt-24 group flex items-center gap-2 ${headingClass}`
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<span>${unescapeHTML(text)}</span><a${addAttribute(`#${headingId}`, "href")} class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity text-base font-normal"${addAttribute(`Link to ${cleanText}`, "aria-label")}>#</a>` })}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/HeaderBlock.astro", void 0);
//#endregion
//#region src/components/blocks/ListBlock.astro
createAstro("https://astro.build");
var $$ListBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ListBlock;
	const { items, style = "unordered" } = Astro.props;
	return renderTemplate`${renderComponent($$result, "Tag", style === "ordered" ? "ol" : "ul", { "class": style === "ordered" ? "list-decimal list-outside pl-6 space-y-2.5 my-4 text-slate-700 dark:text-slate-300 text-lg leading-relaxed" : "list-disc list-outside pl-6 space-y-2.5 my-4 text-slate-700 dark:text-slate-300 text-lg leading-relaxed" }, { "default": ($$result) => renderTemplate`${items.map((item) => {
		const content = typeof item === "string" ? item : item?.content || "";
		return renderTemplate`${maybeRenderHead($$result)}<li>${unescapeHTML(content)}</li>`;
	})}` })}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/ListBlock.astro", void 0);
//#endregion
//#region src/components/blocks/CodeBlock.astro
createAstro("https://astro.build");
var $$CodeBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CodeBlock;
	const { code, language = "text" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="relative my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-md"><div class="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 text-xs font-mono text-slate-400"><span class="uppercase tracking-wider">${language}</span><button type="button" class="copy-code-btn px-2.5 py-1 rounded bg-slate-700/80 hover:bg-slate-600 text-slate-200 transition-colors text-xs font-sans"${addAttribute(code, "data-code")}>Copy</button></div><pre class="p-4 sm:p-5 overflow-x-auto text-sm sm:text-base font-mono leading-relaxed"><code${addAttribute(`language-${language}`, "class")}>${code}</code></pre></div>${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/CodeBlock.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/CodeBlock.astro", void 0);
//#endregion
//#region src/components/blocks/QuoteBlock.astro
createAstro("https://astro.build");
var $$QuoteBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$QuoteBlock;
	const { text, caption, alignment = "left" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<figure${addAttribute(`my-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-l-4 border-blue-500 text-${alignment}`, "class")}><blockquote class="text-xl italic font-serif text-slate-800 dark:text-slate-200 leading-relaxed"><p>${unescapeHTML(text)}</p></blockquote>${caption && renderTemplate`<figcaption class="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 not-italic">— ${caption}</figcaption>`}</figure>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/QuoteBlock.astro", void 0);
//#endregion
//#region src/components/blocks/ImageBlock.astro
createAstro("https://astro.build");
var $$ImageBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ImageBlock;
	const { file, caption, withBorder = false, withBackground = false, stretched = false } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<figure${addAttribute(`my-8 ${stretched ? "-mx-4 sm:-mx-8 lg:-mx-16" : ""}`, "class")}><div${addAttribute(`overflow-hidden rounded-2xl ${withBorder ? "border border-slate-200 dark:border-slate-800" : ""} ${withBackground ? "bg-slate-100 dark:bg-slate-900 p-4" : ""}`, "class")}><img${addAttribute(file.url, "src")}${addAttribute(caption || "Article image", "alt")} loading="lazy" class="w-full h-auto object-cover rounded-xl max-h-[600px]"></div>${caption && renderTemplate`<figcaption class="mt-2.5 text-center text-sm text-slate-500 dark:text-slate-400 italic">${unescapeHTML(caption)}</figcaption>`}</figure>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/ImageBlock.astro", void 0);
//#endregion
//#region src/components/blocks/TableBlock.astro
createAstro("https://astro.build");
var $$TableBlock = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$TableBlock;
	const { content, withHeadings = true } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="my-8 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm"><tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">${content.map((row, rowIndex) => {
		const isHeader = withHeadings && rowIndex === 0;
		return renderTemplate`<tr${addAttribute(isHeader ? "bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-900 dark:text-slate-100" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30", "class")}>${row.map((cell) => {
			if (isHeader) return renderTemplate`<th scope="col" class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">${unescapeHTML(cell)}</th>`;
			return renderTemplate`<td class="px-5 py-3.5 text-slate-700 dark:text-slate-300 whitespace-nowrap sm:whitespace-normal">${unescapeHTML(cell)}</td>`;
		})}</tr>`;
	})}</tbody></table></div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/TableBlock.astro", void 0);
//#endregion
//#region src/components/blocks/DelimiterBlock.astro
var $$DelimiterBlock = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<div class="my-10 flex items-center justify-center gap-3 text-slate-300 dark:text-slate-700"><span class="w-1.5 h-1.5 rounded-full bg-current"></span><span class="w-1.5 h-1.5 rounded-full bg-current"></span><span class="w-1.5 h-1.5 rounded-full bg-current"></span></div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/DelimiterBlock.astro", void 0);
//#endregion
//#region src/components/blocks/BlockRenderer.astro
createAstro("https://astro.build");
var $$BlockRenderer = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BlockRenderer;
	const { contentJson } = Astro.props;
	let blocks = [];
	let isRawHtml = false;
	try {
		if (contentJson && contentJson.trim().startsWith("{")) {
			const parsed = JSON.parse(contentJson);
			if (Array.isArray(parsed.blocks)) blocks = parsed.blocks;
			else isRawHtml = true;
		} else isRawHtml = true;
	} catch {
		isRawHtml = true;
	}
	return renderTemplate`${maybeRenderHead($$result)}<div class="article-content max-w-none text-slate-800 dark:text-slate-200">${isRawHtml ? renderTemplate`<div class="prose dark:prose-invert max-w-none text-lg leading-relaxed space-y-4">${unescapeHTML(contentJson)}</div>` : blocks.map((block) => {
		switch (block.type) {
			case "paragraph": return renderTemplate`${renderComponent($$result, "ParagraphBlock", $$ParagraphBlock, { "text": block.data.text })}`;
			case "header": return renderTemplate`${renderComponent($$result, "HeaderBlock", $$HeaderBlock, {
				"text": block.data.text,
				"level": block.data.level
			})}`;
			case "list": return renderTemplate`${renderComponent($$result, "ListBlock", $$ListBlock, {
				"items": block.data.items,
				"style": block.data.style
			})}`;
			case "code": return renderTemplate`${renderComponent($$result, "CodeBlock", $$CodeBlock, {
				"code": block.data.code,
				"language": block.data.language
			})}`;
			case "quote": return renderTemplate`${renderComponent($$result, "QuoteBlock", $$QuoteBlock, {
				"text": block.data.text,
				"caption": block.data.caption,
				"alignment": block.data.alignment
			})}`;
			case "image": return renderTemplate`${renderComponent($$result, "ImageBlock", $$ImageBlock, {
				"file": block.data.file,
				"caption": block.data.caption,
				"withBorder": block.data.withBorder,
				"withBackground": block.data.withBackground,
				"stretched": block.data.stretched
			})}`;
			case "table": return renderTemplate`${renderComponent($$result, "TableBlock", $$TableBlock, {
				"content": block.data.content,
				"withHeadings": block.data.withHeadings
			})}`;
			case "delimiter": return renderTemplate`${renderComponent($$result, "DelimiterBlock", $$DelimiterBlock, {})}`;
			default: return null;
		}
	})}</div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/blocks/BlockRenderer.astro", void 0);
//#endregion
//#region src/components/ui/CommentItem.astro
createAstro("https://astro.build");
var $$CommentItem = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CommentItem;
	const { comment, postId } = Astro.props;
	const dateFormatted = new Date(comment.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
	const avatarLetter = (comment.authorName || "A").charAt(0).toUpperCase();
	return renderTemplate`${maybeRenderHead($$result)}<div class="comment-node py-4 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0"${addAttribute(`comment-${comment.id}`, "id")}><div class="flex items-start gap-3.5"><div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm shrink-0">${avatarLetter}</div><div class="flex-1 min-w-0"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="font-semibold text-sm text-slate-900 dark:text-slate-100">${comment.authorName}</span><span class="text-xs text-slate-400 dark:text-slate-500">•</span><time class="text-xs text-slate-500 dark:text-slate-400"${addAttribute(new Date(comment.createdAt).toISOString(), "datetime")}>${dateFormatted}</time></div><button type="button" class="reply-toggle-btn text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"${addAttribute(comment.id, "data-parent-id")}${addAttribute(comment.authorName, "data-author")}>Reply</button></div><div class="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">${comment.content}</div><!-- Nested Replies -->${comment.replies && comment.replies.length > 0 && renderTemplate`<div class="mt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">${comment.replies.map((reply) => {
		const replyDate = new Date(reply.createdAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
		const replyLetter = (reply.authorName || "A").charAt(0).toUpperCase();
		return renderTemplate`<div class="py-2"${addAttribute(`comment-${reply.id}`, "id")}><div class="flex items-center gap-2 mb-1.5"><div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-center text-xs">${replyLetter}</div><span class="font-semibold text-xs text-slate-900 dark:text-slate-100">${reply.authorName}</span><span class="text-xs text-slate-400 dark:text-slate-500">•</span><time class="text-xs text-slate-400 dark:text-slate-500">${replyDate}</time></div><div class="text-sm text-slate-700 dark:text-slate-300 pl-8 whitespace-pre-wrap">${reply.content}</div></div>`;
	})}</div>`}</div></div></div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/CommentItem.astro", void 0);
//#endregion
//#region src/components/ui/CommentList.astro
createAstro("https://astro.build");
var $$CommentList = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CommentList;
	const { comments, postId } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="mt-8"><div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800"><h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><span>Discussion</span><span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${comments.length}</span></h3></div>${comments.length === 0 ? renderTemplate`<div class="py-10 text-center text-slate-500 dark:text-slate-400 text-sm"><p>No comments yet. Be the first to share your thoughts!</p></div>` : renderTemplate`<div class="divide-y divide-slate-100 dark:divide-slate-800/80">${comments.map((comment) => renderTemplate`${renderComponent($$result, "CommentItem", $$CommentItem, {
		"comment": comment,
		"postId": postId
	})}`)}</div>`}</div>`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/CommentList.astro", void 0);
//#endregion
//#region src/components/ui/CommentForm.astro
createAstro("https://astro.build");
var $$CommentForm = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CommentForm;
	const { postId } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="mt-8 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm" id="comment-form-container"><div class="flex items-center justify-between mb-4"><h4 class="text-lg font-bold text-slate-900 dark:text-slate-100" id="form-heading">Leave a comment</h4><button type="button" id="cancel-reply-btn" class="hidden text-xs text-rose-500 hover:text-rose-600 font-medium">Cancel reply</button></div><form id="comment-form" class="space-y-4"><input type="hidden" name="postId"${addAttribute(postId, "value")}><input type="hidden" name="parentId" id="form-parent-id" value=""><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="authorName" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Name *</label><input type="text" id="authorName" name="authorName" required placeholder="Your name" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div><label for="authorEmail" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Email * (kept private)</label><input type="email" id="authorEmail" name="authorEmail" required placeholder="you@example.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></div></div><div><label for="content" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Comment *</label><textarea id="content" name="content" rows="4" required placeholder="Write your comment here..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></div><div class="flex items-center justify-between pt-2"><div id="comment-message" class="text-sm font-medium hidden"></div><button type="submit" id="comment-submit-btn" class="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">Post Comment</button></div></form></div>${renderScript($$result, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/CommentForm.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/components/ui/CommentForm.astro", void 0);
//#endregion
//#region src/pages/posts/[slug].astro
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
	if (!slug) return Astro.redirect("/404");
	const db = getDb(Astro.locals);
	const post = await getPostBySlug(db, slug);
	if (!post || post.status !== "published") return Astro.redirect("/404");
	const comments = await getApprovedComments(db, post.id);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": `${post.title} — akib.blog`,
		"description": post.excerpt || `Read ${post.title} on akib.blog`,
		"image": post.coverImage || void 0
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<article class="max-w-4xl mx-auto"><!-- Post Header -->${renderComponent($$result, "PostHeader", $$PostHeader, { "post": post })}<div class="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10"><!-- Article Content --><div class="lg:col-span-8 space-y-6">${renderComponent($$result, "BlockRenderer", $$BlockRenderer, { "contentJson": post.content })}<!-- Article Footer / Author Note --><div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800"><div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4"><div class="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm">${post.authorEmail.charAt(0).toUpperCase()}</div><div><h4 class="font-bold text-slate-900 dark:text-slate-100">Written by ${post.authorEmail}</h4><p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Software engineer focusing on edge systems, Cloudflare infrastructure, and developer tooling.</p></div></div></div><!-- Comments Section -->${post.allowComments && renderTemplate`<section class="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800" id="comments">${renderComponent($$result, "CommentList", $$CommentList, {
		"comments": comments,
		"postId": post.id
	})}${renderComponent($$result, "CommentForm", $$CommentForm, { "postId": post.id })}</section>`}</div><!-- Sticky Sidebar --><aside class="hidden lg:block lg:col-span-4"><div class="sticky top-24 space-y-6">${renderComponent($$result, "TableOfContents", $$TableOfContents, { "contentJson": post.content })}</div></aside></div></article>` })}`;
}, "/home/akib/Desktop/akiblog/apps/blog/src/pages/posts/[slug].astro", void 0);
var $$file = "/home/akib/Desktop/akiblog/apps/blog/src/pages/posts/[slug].astro";
var $$url = "/posts/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/posts/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
