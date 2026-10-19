/**
 * @file apps/portfolio/src/data/portfolio.ts
 * @description Centralized portfolio content model derived from akib35.dev and legacy portfolio repository.
 *
 * POC / Implementation Architecture:
 * - Structured TypeScript objects providing compile-time type safety for all profile data.
 * - Single source of truth for bio, skills, competitive coding metrics, projects, and featured blog posts.
 * - Designed to easily pull or synchronize with external APIs or D1 in future iterations.
 */

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  status: 'active' | 'shipped' | 'wip';
}

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  slug: string;
  url: string;
  /**
   * Banner image URL, supplied by the blog (blog.akib35.dev) once posts are
   * fetched from it. Optional: posts without one render the typographic
   * "document" thumbnail (ui/PostCover.astro) — that is the default.
   * The picsum.photos URLs below are DUMMIES until the blog feed is wired.
   */
  banner?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export const portfolioData = {
  meta: {
    name: "Md Akib Hasan",
    handle: "akib35",
    role: "Full-Stack Engineer & Systems Builder",
    statusText: "Building distributed edge tools & full-stack applications",
    location: "Dhaka, Bangladesh",
    timezone: "UTC+6",
    email: "hello@akib35.dev",
    resumeUrl: "/my-cv.pdf",
    siteUrl: "https://akib35.dev",
    blogUrl: "https://blog.akib35.dev"
  },

  socials: [
    { name: "GitHub", handle: "akib35", url: "https://github.com/akib35" },
    { name: "LinkedIn", handle: "akibH", url: "https://linkedin.com/in/akibH" },
    { name: "X", handle: "mdakibhasan18", url: "https://twitter.com/mdakibhasan18" },
    { name: "Facebook", handle: "akib4040", url: "https://facebook.com/akib4040" },
  ],

  competitiveMetrics: [
    { platform: "LeetCode", stats: "200+ Solved", url: "https://leetcode.com/akib35" },
    { platform: "Codeforces", stats: "Pupil", url: "https://codeforces.com/profile/akib35" },
    { platform: "HackerRank", stats: "3★ Problem Solving", url: "https://www.hackerrank.com/akib35" },
    { platform: "AtCoder", stats: "Active Contestant", url: "https://atcoder.jp/users/akib35" },
  ],

  bio: [
    "Computer Science graduate from Chittagong University of Engineering and Technology (CUET). I focus on designing and implementing resilient, low-latency applications that operate cleanly from backend systems to browser interfaces.",
    "My core focus centers on modern full-stack engineering, distributed web architecture, Go concurrency, and edge compute primitives (Cloudflare Workers, D1 SQL, R2).",
    "Active competitive programmer with over 200 algorithmic problems solved across LeetCode, Codeforces, and AtCoder—grounding my engineering practice in disciplined complexity analysis and clean, idiomatic execution."
  ],

  education: {
    degree: "B.Sc. in Computer Science & Engineering",
    institution: "Chittagong University of Engineering and Technology (CUET)",
    year: "2024",
    focus: "Software Engineering, Distributed Systems & Algorithms"
  },

  skills: [
    {
      category: "Languages",
      skills: ["Go", "Python", "TypeScript", "JavaScript", "C++", "C", "SQL"]
    },
    {
      category: "Frameworks & Runtime",
      skills: ["Astro", "React", "Django", "Node.js", "Flutter", "Tailwind CSS"]
    },
    {
      category: "Cloud & Infrastructure",
      skills: ["Cloudflare Workers", "Cloudflare D1 & R2", "Docker", "PostgreSQL", "Linux", "Git / Forgejo"]
    },
    {
      category: "Architecture & Systems",
      skills: ["RESTful APIs", "WebSockets", "Zero-Trust SSO", "Clean Architecture", "TDD"]
    }
  ] as SkillCategory[],

  projects: [
    {
      title: "Akiblog Edge Platform",
      description: "Edge-native developer publishing system built on Astro SSR and Cloudflare Workers isolate network, featuring Zero-Trust SSO admin protection, D1 SQLite database, and R2 media bucket.",
      techStack: ["Astro v5", "Cloudflare Workers", "D1 SQL", "Drizzle ORM", "TypeScript"],
      liveUrl: "https://blog.akib35.dev",
      githubUrl: "https://github.com/akib35/akiblog",
      featured: true,
      status: "shipped"
    },
    {
      title: "Black Board Collaborative Engine",
      description: "Real-time multi-user drawing workspace featuring simultaneous shared-canvas rendering and instant event synchronization over high-throughput WebSockets.",
      techStack: ["Go", "Gorilla WebSocket", "HTML5 Canvas", "JavaScript"],
      githubUrl: "https://github.com/akib35/blackboard",
      featured: true,
      status: "shipped"
    },
    {
      title: "University Management System",
      description: "Comprehensive relational database management system for university administrative operations: student enrollment, department courses, grade records, and secure RESTful endpoints.",
      techStack: ["Python", "Django", "PostgreSQL", "Docker"],
      githubUrl: "https://github.com/akib35/university-management-system",
      featured: true,
      status: "shipped"
    },
    {
      title: "E-Code Verifier Mobile",
      description: "Cross-platform mobile application extracting and analyzing food ingredient safety profiles via barcode and E-Code scanning with two-step cryptographic verification.",
      techStack: ["Flutter", "Dart", "Firebase", "REST API"],
      githubUrl: "https://github.com/akib35/ecode-verifier",
      featured: false,
      status: "shipped"
    },
    {
      title: "SmartHaat Agricultural Marketplace",
      description: "Digital trading platform facilitating livestock trade between farmers and enterprise buyers, with advanced catalog filtering, shopping carts, and administrative panels.",
      techStack: ["Django", "Vue.js", "PostgreSQL", "REST API"],
      githubUrl: "https://github.com/akib35/smarthaat",
      featured: false,
      status: "shipped"
    }
  ] as Project[],

  blogPosts: [
    {
      title: "Deploying High-Performance SSR with Astro on Cloudflare Workers",
      excerpt: "Deep dive into configuring isolated V8 Workers, binding Cloudflare D1 SQL via Drizzle, and caching static assets at the global edge.",
      date: "Mar 2026",
      readingTime: "4 min read",
      tags: ["Cloudflare", "Astro", "Architecture"],
      slug: "astro-cloudflare-workers-ssr",
      url: "https://blog.akib35.dev",
      banner: "https://picsum.photos/seed/astro-cloudflare-workers-ssr/960/480"
    },
    {
      title: "Zero-Trust Security for Edge Applications: Replacing Monolithic Auth",
      excerpt: "Why delegating authentication to Cloudflare Access eliminates session database bloat, password reset flows, and credential vulnerabilities.",
      date: "Feb 2026",
      readingTime: "6 min read",
      tags: ["Security", "Zero Trust", "Cloudflare"],
      slug: "zero-trust-edge-auth",
      url: "https://blog.akib35.dev",
      banner: "https://picsum.photos/seed/zero-trust-edge-auth/960/480"
    },
    {
      title: "Algorithmic Problem Solving: Patterns from 200+ Challenges",
      excerpt: "Core mental frameworks and recurring data structures learned while solving competitive programming problems across LeetCode and Codeforces.",
      date: "Jan 2026",
      readingTime: "5 min read",
      tags: ["Algorithms", "Competitive Programming"],
      slug: "competitive-programming-patterns",
      url: "https://blog.akib35.dev"
    }
  ] as BlogPost[]
};

/**
 * Rotating epigraphs shown in the hero eyebrow slot (sections/Hero.astro).
 * One quote is picked at random in the browser on every page load.
 *
 * WHY a standalone export (not inside portfolioData): the tiny client-side
 * picker script imports ONLY this array, so the hero's JS bundle tree-shakes
 * down to a few strings instead of shipping the entire dataset to the browser.
 *
 * Edit freely — keep each quote a single line; quotation marks are rendered
 * by the component, attribution included in the string.
 */
export const heroQuotes = [
  "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
  "Make it work, make it right, make it fast. — Kent Beck",
  "Programs must be written for people to read. — Harold Abelson",
  "The best way to predict the future is to invent it. — Alan Kay",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Premature optimization is the root of all evil. — Donald Knuth"
];
