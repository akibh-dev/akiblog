/**
 * @file pages/llms.txt.ts
 * @description /llms.txt — the blog's summary for LLM answer engines, in
 *              the llmstxt.org format (H1, blockquote summary, H2 link
 *              lists). The portfolio has the same file (akib35.dev/llms.txt)
 *              and links here.
 *
 * WHY: AI search/answer agents (ChatGPT search, Claude, Perplexity) fetch a
 * page when a person asks about it; llms.txt gives them a clean map of the
 * site, and every post links to its plain-Markdown copy (/<slug>.md,
 * pages/[slug].md.ts) instead of HTML full of navigation. robots.txt still
 * disallows AI *training* crawlers — this is for answering, not training.
 * Posts are listed featured-first, then newest (same order as the home).
 */
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
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
