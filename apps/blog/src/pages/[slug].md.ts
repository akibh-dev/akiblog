/* For more details, see docs/blog/implementation-notes.md#src-pages-slug-md-ts-note-1. */
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
