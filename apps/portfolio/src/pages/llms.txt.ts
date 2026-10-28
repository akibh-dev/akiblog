/* For more details, see docs/portfolio/implementation-notes.md#src-pages-llms-txt-ts-note-1. */
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
    `- [Privacy policy](${origin}/privacy/): what both sites collect (contact form, analytics, comments)`,
    `- [Terms of use](${origin}/terms/): reuse of posts (text ©, code MIT) and comment rules`,
    `- [Security](${origin}/security/): how to report a vulnerability ([security.txt](${origin}/.well-known/security.txt))`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
