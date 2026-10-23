/**
 * @file pages/.well-known/security.txt.ts
 * @description /.well-known/security.txt (RFC 9116) for blog.akibh.dev
 *              (plan32). security.txt is per-host, so the blog serves its own;
 *              the policy itself lives on the portfolio (akibh.dev/security/),
 *              like the privacy policy and terms (plan31).
 *
 * WHY GENERATED: `Expires` is required and must stay < 1 year ahead — every
 * deploy stamps build time + 360 days, so it can't go stale. Contacts come
 * from data/site.ts (author email + GitHub / LinkedIn / X).
 *
 * POC: `curl https://blog.akibh.dev/.well-known/security.txt`
 */
import type { APIRoute } from "astro";
import { site } from "../../data/site";

export const prerender = true;

const DAY = 86_400_000;

export const GET: APIRoute = ({ site: astroSite }) => {
  const origin = (astroSite ?? new URL(site.url)).origin;
  const expires = new Date(Date.now() + 360 * DAY).toISOString().replace(/\.\d{3}Z$/, "Z");
  const body = [
    "# Found a security issue in akibh.dev or blog.akibh.dev? Thank you!",
    "# Please report it privately (email preferred) - not in public comments or issues.",
    `Contact: mailto:${site.author.email}`,
    ...site.socials.map((s) => `Contact: ${s.url}`),
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${origin}/.well-known/security.txt`,
    `Policy: ${site.portfolioUrl}/security/`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
