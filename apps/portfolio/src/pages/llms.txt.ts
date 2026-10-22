/**
 * @file pages/llms.txt.ts
 * @description /llms.txt — the site in plain Markdown for LLMs and AI
 *              agents, following the llms.txt proposal (https://llmstxt.org):
 *              H1 name, a > summary, short context, then H2 sections of links.
 *
 * WHY GENERATED (not a hand-written public/llms.txt): every fact comes from
 * data/portfolio.ts — the same source the page renders — so the summary
 * can't drift from the site. `prerender` makes it a static file at build
 * time (dist/llms.txt); no runtime code.
 *
 * WHAT IT IS NOT: llms.txt doesn't control crawling. It's a map for agents
 * that are ALLOWED in (AI search / answer bots) so they read one small file
 * instead of parsing the full HTML. Crawl permissions live in
 * public/robots.txt (AI training crawlers are disallowed there).
 *
 * POC: `curl https://akibh.dev/llms.txt`
 */
import type { APIRoute } from "astro";
import { portfolioData } from "../data/portfolio";
import { getBlogPosts } from "../lib/blog";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const { meta, bio, education, skills, projects, competitiveMetrics, socials } = portfolioData;
  const blogPosts = await getBlogPosts();
  const origin = (site ?? new URL(meta.siteUrl)).origin;

  const lines = [
    `# ${meta.name} (${meta.handle})`,
    "",
    `> ${meta.role} based in ${meta.location} (${meta.timezone}). ${meta.statusText}.`,
    "",
    ...bio.flatMap((p) => [p, ""]),
    `Education: ${education.degree}, ${education.institution} (${education.year}).`,
    "",
    `Contact: ${meta.email} · contact form at ${origin}/#contact · résumé (PDF): ${origin}${meta.resumeUrl}`,
    "",
    "## Projects",
    "",
    ...projects.map((p) => {
      const link = p.liveUrl ?? p.githubUrl ?? origin;
      const extra = [p.githubUrl && p.liveUrl ? `source: ${p.githubUrl}` : "", `stack: ${p.techStack.join(", ")}`, `status: ${p.status}`]
        .filter(Boolean)
        .join("; ");
      return `- [${p.title}](${link}): ${p.description} (${extra})`;
    }),
    "",
    "## Skills",
    "",
    ...skills.map((s) => `- ${s.category}: ${s.skills.join(", ")}`),
    "",
    "## Competitive programming",
    "",
    ...competitiveMetrics.map((m) => `- [${m.platform}](${m.url}): @${m.handle} — ${m.stats}`),
    "",
    "## Writing",
    "",
    `- [Blog](${meta.blogUrl}): field notes on edge infrastructure, security and algorithms ([RSS](${meta.blogUrl}/rss.xml))`,
    ...blogPosts.map((b) => `- ${b.title} (${b.date}): ${b.excerpt}`),
    "",
    "## Profiles",
    "",
    ...socials.map((s) => `- [${s.name}](${s.url}): @${s.handle}`),
    "",
    "## Optional",
    "",
    `- [Portfolio home](${origin}/): the human-facing version of this page`,
    `- [Sitemap](${origin}/sitemap-index.xml)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
