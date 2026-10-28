/* For more details, see docs/portfolio/implementation-notes.md#src-data-portfolio-ts-note-1. */

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
   * Banner image URL, supplied by the blog's API (a 960×480 WebP rendered
   * from the post's cover). Optional: posts without one render the
   * typographic "document" thumbnail (ui/PostCover.astro).
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
    /** the form people actually search — <title> and schema.org Person.name;
        `name` stays the full name (H1, description, alternateName) */
    searchName: "Akib Hasan",
    handle: "akibh",
    role: "Full-Stack Engineer & Systems Builder",
    statusText: "Building distributed edge tools & full-stack applications",
    location: "Dhaka, Bangladesh",
    /** Google Maps link for the location tile (About) */
    mapUrl: "https://maps.app.goo.gl/wYNUWe4JeKeXKZ8t5",
    timezone: "UTC+6",
    email: "hello@akibh.dev",
    resumeUrl: "/akib_s_resume.pdf",
    siteUrl: "https://akibh.dev",
    blogUrl: "https://blog.akibh.dev"
  },

  socials: [
    { name: "GitHub", handle: "akibh-dev", url: "https://github.com/akibh-dev" },
    { name: "LinkedIn", handle: "akibH", url: "https://linkedin.com/in/akibH" },
    { name: "X", handle: "akibhdev", url: "https://x.com/akibhdev" },
    { name: "Facebook", handle: "akib4040", url: "https://facebook.com/akib4040" },
  ],

  /* For more details, see docs/portfolio/implementation-notes.md#src-data-portfolio-ts-note-2. */
  competitiveMetrics: [
    { platform: "LeetCode", handle: "akibh", stats: "350+ Solved", url: "https://leetcode.com/u/akibh/" },
    { platform: "Codeforces", handle: "akib35", stats: "Pupil", url: "https://codeforces.com/profile/akib35" },
    { platform: "HackerRank", handle: "akib35", stats: "3★ Problem Solving", url: "https://www.hackerrank.com/akib35" },
    { platform: "AtCoder", handle: "akibh", stats: "Active Contestant", url: "https://atcoder.jp/users/akibh" },
    { platform: "Topcoder", handle: "akib35", stats: "Member", url: "https://profiles.topcoder.com/akib35" },
  ],

  bio: [
    "Computer Science graduate from Chittagong University of Engineering and Technology (CUET). I focus on designing and implementing resilient, low-latency applications that operate cleanly from backend systems to browser interfaces.",
    "My core focus centers on modern full-stack engineering, distributed web architecture, Go concurrency, and edge compute primitives (Cloudflare Workers, D1 SQL, R2).",
    "Active competitive programmer with over 350 algorithmic problems solved across LeetCode, Codeforces, and AtCoder—grounding my engineering practice in disciplined complexity analysis and clean, idiomatic execution."
  ],

  education: {
    degree: "B.Sc. in Computer Science & Engineering",
    institution: "Chittagong University of Engineering and Technology (CUET)",
    year: "2024",
    url: "https://www.cuet.ac.bd/",
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
      liveUrl: "https://blog.akibh.dev",
      githubUrl: "https://github.com/akibh-dev/akiblog",
      featured: true,
      status: "shipped"
    },
    {
      title: "Black Board Collaborative Engine",
      description: "Real-time multi-user drawing workspace featuring simultaneous shared-canvas rendering and instant event synchronization over high-throughput WebSockets.",
      techStack: ["Go", "Gorilla WebSocket", "HTML5 Canvas", "JavaScript"],
      githubUrl: "https://github.com/akibh-dev/black-board",
      featured: true,
      status: "shipped"
    },
    {
      title: "University Management System",
      description: "Comprehensive relational database management system for university administrative operations: student enrollment, department courses, grade records, and secure RESTful endpoints.",
      techStack: ["Python", "Django", "PostgreSQL", "Docker"],
      githubUrl: "https://github.com/akibh-dev/university-management-system",
      featured: true,
      status: "shipped"
    },
    {
      title: "E-Code Verifier Mobile",
      description: "Cross-platform mobile application extracting and analyzing food ingredient safety profiles via barcode and E-Code scanning with two-step cryptographic verification.",
      techStack: ["Flutter", "Dart", "Firebase", "REST API"],
      featured: false,
      status: "shipped"
    },
    {
      title: "SmartHaat Agricultural Marketplace",
      description: "Digital trading platform facilitating livestock trade between farmers and enterprise buyers, with advanced catalog filtering, shopping carts, and administrative panels.",
      techStack: ["Django", "Vue.js", "PostgreSQL", "REST API"],
      githubUrl: "https://github.com/akibh-dev/SmartHaat",
      featured: false,
      status: "shipped"
    }
  ] as Project[],

  /**
   * Blog posts are NOT authored here: lib/blog.ts fetches them from the
   * blog's /api/featured at build time (Writings, terminal `blog`,
   * llms.txt). Empty by default — never ship placeholder posts.
   */
  blogPosts: [] as BlogPost[]
};

/* For more details, see docs/portfolio/implementation-notes.md#src-data-portfolio-ts-note-3. */
export const heroQuotes = [
  "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
  "Make it work, make it right, make it fast. — Kent Beck",
  "Programs must be written for people to read. — Harold Abelson",
  "The best way to predict the future is to invent it. — Alan Kay",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Premature optimization is the root of all evil. — Donald Knuth"
];
