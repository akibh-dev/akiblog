/* For more details, see docs/blog/implementation-notes.md#src-pages-llms-txt-ts-note-1. */
import type { APIRoute } from "astro";
import { getPosts, homeFeed } from "../lib/posts";
import { site } from "../data/site";

export const GET: APIRoute = async ({ site: origin }) => {
  const base = (origin ?? new URL(site.url)).origin;
  const { featured, rest } = homeFeed((await getPosts()).filter((p) => !p.data.draft));
  const line = (p: (typeof rest)[number]) => `- [${p.data.title}](${base}/${p.id}.md): ${p.data.description}`;

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `Technical notes, guides and references by ${site.author.name} (${site.author.role}). Every post below links to a plain-Markdown copy; the HTML version is the same URL without \`.md\` (e.g. ${base}/<slug>/).`,
    "",
    ...(featured.length ? ["## Featured", "", ...featured.map(line), ""] : []),
    "## Posts",
    "",
    ...rest.map(line),
    "",
    "## Optional",
    "",
    `- [RSS feed](${base}/rss.xml): every post with its summary`,
    `- [All posts as JSON](${base}/posts.json): title, summary, date, tags, URL`,
    `- [Author's portfolio](${site.portfolioUrl}/llms.txt): who writes this blog`,
    `- [Privacy policy](${site.legal.privacy}) · [Terms of use](${site.legal.terms}) · [Security](${site.legal.security}): shared with the portfolio`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
