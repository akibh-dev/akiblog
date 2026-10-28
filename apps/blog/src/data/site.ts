/* For more details, see docs/blog/implementation-notes.md#src-data-site-ts-note-1. */

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
    "akiblog — technical notes and guides by Akib Hasan on web platforms, Cloudflare, tooling and software craft.",
  author: {
    name: "Md Akib Hasan",
    /** the searched form — schema.org Person.name, SAME value as the
        portfolio's meta.searchName (both sites describe one Person @id) */
    searchName: "Akib Hasan",
    handle: "akibh",
    role: "Full-Stack Engineer & Systems Builder",
    email: "hello@akibh.dev",
  },
  url: "https://blog.akibh.dev",
  portfolioUrl: "https://akibh.dev",
  /** one privacy policy + terms for both sites, hosted on the portfolio (plan31) */
  legal: { privacy: "https://akibh.dev/privacy/", terms: "https://akibh.dev/terms/", security: "https://akibh.dev/security/" },
  /** the notes repo posts are sourced from (plan19/20) */
  notesRepo: "https://github.com/akibh-dev/notes",
  socials: [
    { name: "GitHub", handle: "akibh-dev", url: "https://github.com/akibh-dev" },
    { name: "LinkedIn", handle: "akibH", url: "https://linkedin.com/in/akibH" },
    { name: "X", handle: "akibhdev", url: "https://x.com/akibhdev" },
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
