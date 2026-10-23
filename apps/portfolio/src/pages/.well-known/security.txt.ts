/**
 * @file pages/.well-known/security.txt.ts
 * @description /.well-known/security.txt (RFC 9116) — tells security
 *              researchers how to report a vulnerability (plan32).
 *
 * WHY GENERATED (not a static public/ file): RFC 9116 makes `Expires`
 * REQUIRED and says it should be less than a year ahead; a hand-written file
 * silently goes stale. Built here, every deploy stamps build time + 360 days,
 * and the contacts come from data/portfolio.ts (the same email + socials the
 * page shows). The blog serves its own copy (apps/blog, same fields) because
 * the file is per-host; both point at the one policy: akibh.dev/security/.
 *
 * FIELDS: Contact (email first = preferred, then GitHub / LinkedIn / X as
 * other ways to reach me), Expires, Preferred-Languages, Canonical, Policy.
 *
 * POC: `curl https://akibh.dev/.well-known/security.txt`
 */
import type { APIRoute } from "astro";
import { portfolioData } from "../../data/portfolio";

export const prerender = true;

const DAY = 86_400_000;

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(portfolioData.meta.siteUrl)).origin;
  const contacts = portfolioData.socials.filter((s) => ["GitHub", "LinkedIn", "X"].includes(s.name));
  const expires = new Date(Date.now() + 360 * DAY).toISOString().replace(/\.\d{3}Z$/, "Z");
  const body = [
    "# Found a security issue in akibh.dev or blog.akibh.dev? Thank you!",
    "# Please report it privately (email preferred) - not in public comments or issues.",
    `Contact: mailto:${portfolioData.meta.email}`,
    ...contacts.map((s) => `Contact: ${s.url}`),
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${origin}/.well-known/security.txt`,
    `Policy: ${origin}/security/`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
