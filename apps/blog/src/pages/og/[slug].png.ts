/* For more details, see docs/blog/implementation-notes.md#src-pages-og-slug-png-ts-note-1. */
import type { APIRoute } from "astro";
import { renderOgCard } from "../../lib/og";
import { formatDate, getPosts, readingMinutes, type Post } from "../../lib/posts";

export async function getStaticPaths() {
  const posts = (await getPosts()).filter((p) => !p.data.cover);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { data, body } = (props as { post: Post }).post;
  const png = await renderOgCard({
    title: data.title,
    eyebrow: [data.type, ...data.tags.slice(0, 3).map((t) => `#${t}`)].join("  /  "),
    meta: `${readingMinutes(body)} min read  ·  ${formatDate(data.date)}`,
  });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
