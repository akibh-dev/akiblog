import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../lib/env';
import { getDb } from '../lib/db';
import { getPublishedPosts } from '../lib/services/posts';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDb(locals);
    const env = getRuntimeEnv(locals);
    const { posts } = await getPublishedPosts(db, { limit: 20 });
    const siteUrl = env?.SITE_URL || 'https://blog.akib35.me';

    const itemsXml = posts
      .map((post) => {
        const link = `${siteUrl}/posts/${post.slug}`;
        const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();
        const description = post.excerpt ? `<![CDATA[${post.excerpt}]]>` : '';
        const title = `<![CDATA[${post.title}]]>`;

        return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
      })
      .join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>akib.blog</title>
    <link>${siteUrl}</link>
    <description>Engineering decisions, architecture notes, and web development lessons.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    return new Response('Error generating RSS', { status: 500 });
  }
};
