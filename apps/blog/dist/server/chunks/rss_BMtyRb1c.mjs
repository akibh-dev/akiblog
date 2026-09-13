globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./rolldown-runtime_BDykq6kg.mjs";
import { t as getDb } from "./db_CGVLS4Nl.mjs";
import { t as getRuntimeEnv } from "./env_DqgDjpTp.mjs";
import { s as getPublishedPosts } from "./posts_CMTQj74H.mjs";
//#region src/pages/rss.xml.ts
var rss_xml_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ locals }) => {
	try {
		const db = getDb(locals);
		const env = getRuntimeEnv(locals);
		const { posts } = await getPublishedPosts(db, { limit: 20 });
		const siteUrl = env?.SITE_URL || "https://blog.akib35.me";
		const itemsXml = posts.map((post) => {
			const link = `${siteUrl}/posts/${post.slug}`;
			const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();
			const description = post.excerpt ? `<![CDATA[${post.excerpt}]]>` : "";
			return `
    <item>
      <title>${`<![CDATA[${post.title}]]>`}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
		}).join("");
		const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>akib.blog</title>
    <link>${siteUrl}</link>
    <description>Engineering decisions, architecture notes, and web development lessons.</description>
    <language>en-us</language>
    <lastBuildDate>${(/* @__PURE__ */ new Date()).toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;
		return new Response(rssXml, { headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600"
		} });
	} catch (error) {
		return new Response("Error generating RSS", { status: 500 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/rss.xml@_@ts
var page = () => rss_xml_exports;
//#endregion
export { page };
