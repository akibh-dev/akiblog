/**
 * @file data/site.ts
 * @description Single source of truth for blog identity + navigation —
 *              the blog's counterpart of the portfolio's data/portfolio.ts
 *              (identity) and data/sections.ts (nav registry).
 *
 * WHY ONE FILE (not a copy of portfolio.ts): the copied shell components
 * (SiteSidebar, MobileMenu, MobileHeader, BaseHead, 404) only read a small
 * identity subset (name, handle, socials, urls). Copying the whole
 * portfolio model (projects, skills, dummy posts) would ship dead data
 * and drift. Every copied component now imports `site` / `stations` from
 * here instead — one edit re-brands the whole blog.
 *
 * STATIONS = SECTIONS OF THE HOME PAGE (plan23): the home page is a
 * one-pager like the portfolio — #home, #search, #tags, #posts (plan24 order) —
 * so on "/" stations are in-page anchors marked by ScrollSpy. On every
 * other page (posts, /tags/<tag>/) `stationHref` points them back to
 * "/#<id>" and `isActive` marks the matching one at build time.
 *
 * POC:
 *   import { stations, stationHref, isActive } from "../data/site";
 *   <a href={stationHref(s, onHome)} aria-current={!onHome && isActive(s, path) ? "true" : undefined}>
 */

export interface Social {
  name: "GitHub" | "LinkedIn" | "X";
  handle: string;
  url: string;
}

export interface Station {
  /** stable key (also the 404 matcher's suggestion key) */
  id: string;
  label: string;
  /** zero-padded ordinal — section order (not rendered; eyebrows were dropped, plan25) */
  number: string;
  /** external URL (only for `external` stations; sections use their id) */
  href?: string;
  /** opens another site → new tab + ↗ marker */
  external?: boolean;
  /** path prefixes of OTHER pages that mark this station active there */
  matches?: string[];
  /** active on any non-home page no other station matches (post pages) */
  fallback?: boolean;
}

export const site = {
  /** brand / wordmark */
  name: "akiblog",
  tagline: "Field notes on edge infrastructure, security, and solving hard problems.",
  description:
    "akiblog — technical notes and guides by Md Akib Hasan on web platforms, Cloudflare, tooling and software craft.",
  author: {
    name: "Md Akib Hasan",
    handle: "akib35",
    role: "Full-Stack Engineer & Systems Builder",
    email: "hello@akib35.dev",
  },
  url: "https://blog.akib35.dev",
  portfolioUrl: "https://akib35.dev",
  /** the notes repo posts are sourced from (plan19/20) */
  notesRepo: "https://github.com/akibh-dev/notes",
  socials: [
    { name: "GitHub", handle: "akibh-dev", url: "https://github.com/akibh-dev" },
    { name: "LinkedIn", handle: "akibH", url: "https://linkedin.com/in/akibH" },
    { name: "X", handle: "mdakibhasan18", url: "https://twitter.com/mdakibhasan18" },
  ] satisfies Social[],
} as const;

export const stations: Station[] = [
  { id: "home", label: "Home", number: "01" },
  { id: "search", label: "Search", number: "02" },
  { id: "tags", label: "Tags", number: "03", matches: ["/tags/"] },
  { id: "posts", label: "Posts", number: "04", fallback: true },
  { id: "portfolio", label: "Portfolio", number: "05", href: site.portfolioUrl, external: true },
];

/** `#id` on the home page (ScrollSpy anchors), `/#id` everywhere else. */
export function stationHref(station: Station, onHome: boolean): string {
  if (station.external) return station.href!;
  if (station.id === "home") return onHome ? "#home" : "/";
  return onHome ? `#${station.id}` : `/#${station.id}`;
}

/** Off the home page: does `pathname` belong to this station? */
export function isActive(station: Station, pathname: string): boolean {
  if (station.external) return false;
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const hit = (s: Station) => (s.matches ?? []).some((m) => path.startsWith(m));
  if (hit(station)) return true;
  // posts live at the root (/<slug>/), so "a post page" = no other match
  return Boolean(station.fallback) && !stations.some(hit);
}
