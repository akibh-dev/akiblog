/**
 * @file pages/[slug].md.ts
 * @description /<slug>.md — the plain-Markdown copy of each post, for LLM
 *              answer engines (linked from /llms.txt, llmstxt.org) and as
 *              <link rel="alternate" type="text/markdown"> on the post page.
 *
 * The source markdown straight from the notes repo, with a small header
 * (title, summary, canonical URL, date, tags) so the file stands alone.
 * Relative links/images (`./pic.png`) are made absolute against the post's
 * HTML URL, so they resolve outside the site. Drafts never get one.
 */
import type { APIRoute } from "astro";
import { formatDate, getPosts, postUrl, type Post } from "../lib/posts";

export async function getStaticPaths() {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = ({ props, site }) => {
  const post = (props as { post: Post }).post;
  const url = new URL(postUrl(post), site).href;
  const d = post.data;
  const body = (post.body ?? "").replace(/\]\(\.\//g, `](${url}`);
  const text = [
    `# ${d.title}`,
    "",
    `> ${d.description}`,
    "",
    `- URL: ${url}`,
    `- Published: ${formatDate(d.date)}${d.updated ? ` · Updated: ${formatDate(d.updated)}` : ""}`,
    `- Tags: ${d.tags.join(", ")}`,
    ...(d.ai !== "none" ? [`- AI: ${d.ai}`] : []),
    "",
    body.trim(),
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
