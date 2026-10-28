/* For more details, see docs/portfolio/implementation-notes.md#src-components-islands-terminal-commands-ts-note-1. */

import { isThemeMode, THEME_MODES } from "../../../lib/theme";
import { blank, kv, link, shortUrl, t } from "./dsl";
import type { Command } from "./types";

const help: Command = {
  name: "help",
  description: "list available commands",
  execute: ({ commands }) => [
    [t("available commands:", "muted")],
    blank(),
    ...commands
      .filter((c) => !c.hidden)
      .map((c) => [
        t(`  ${(c.usage ?? c.name)}`.padEnd(24), "accent"),
        t(c.description, "subtle"),
      ]),
    blank(),
    [t("↑/↓ history · tab autocomplete · ctrl+l clear", "muted")],
  ],
};

const whoami: Command = {
  name: "whoami",
  description: "identity",
  execute: ({ data }) => [
    kv("name", t(data.meta.name)),
    kv("handle", t(data.meta.handle, "accent")),
    kv("role", t(data.meta.role)),
  ],
};

const about: Command = {
  name: "about",
  description: "short bio",
  execute: () => [
    [t("CS grad (CUET '24) building resilient, low-latency systems —", "subtle")],
    [t("from database internals to browser pixels.", "subtle")],
    blank(),
    kv("focus", t("edge compute · distributed web · Go · TypeScript")),
    kv("algorithms", t("350+ problems across LeetCode / Codeforces / AtCoder")),
  ],
};

const status: Command = {
  name: "status",
  description: "what I'm up to",
  execute: ({ data }) => [
    [t("● ", "success"), t(data.meta.statusText, "success")],
    kv("focus", t("edge systems · distributed web")),
    kv("response", t("usually within 24h", "subtle")),
  ],
};

const education: Command = {
  name: "edu",
  aliases: ["education"],
  description: "academic background",
  execute: ({ data }) => [
    kv("degree", t(data.education.degree)),
    kv("school", t(data.education.institution)),
    kv("year", t(String(data.education.year))),
    kv("focus", t(data.education.focus, "subtle")),
  ],
};

const skills: Command = {
  name: "skills",
  description: "technical matrix",
  execute: ({ data }) =>
    data.skills.flatMap((cat) => [
      [t(cat.category, "accent")],
      [t(`  ${cat.skills.join(" · ")}`, "subtle")],
      blank(),
    ]),
};

const projects: Command = {
  name: "projects",
  aliases: ["ls"],
  description: "list repositories",
  execute: ({ data }) => [
    [t(`${data.projects.length} repositories — run 'project <n|name>' for detail`, "muted")],
    blank(),
    ...data.projects.map((p, i) => [
      t(` ${i}  `, "muted"),
      t(p.title.padEnd(40)),
      t(`[${p.status}]`, p.status === "shipped" ? "success" : "warning"),
    ]),
  ],
};

const project: Command = {
  name: "project",
  usage: "project <n|name>",
  description: "project detail by index or name",
  execute: ({ args, data }) => {
    const query = args.join(" ").toLowerCase();
    if (!query) return [[t("usage: project <n|name> — see 'projects'", "warning")]];

    const found = /^\d+$/.test(query)
      ? data.projects[Number(query)]
      : data.projects.find((p) => p.title.toLowerCase().includes(query));

    if (!found) {
      return [
        [t(`no project matching '${query}'`, "error")],
        [t("run 'projects' to list all repositories", "muted")],
      ];
    }

    return [
      [t(found.title, "accent")],
      kv("status", t(`[${found.status}]`, found.status === "shipped" ? "success" : "warning")),
      blank(),
      [t(found.description, "subtle")],
      blank(),
      kv("stack", t(found.techStack.join(", "))),
      ...(found.githubUrl
        ? [kv("code", link(shortUrl(found.githubUrl), found.githubUrl))]
        : []),
      ...(found.liveUrl
        ? [kv("live", link(shortUrl(found.liveUrl), found.liveUrl))]
        : []),
    ];
  },
};

const blog: Command = {
  name: "blog",
  aliases: ["posts"],
  description: "selected writings",
  execute: ({ data }) => [
    ...data.blogPosts.map((post) => [
      t(post.date.padEnd(10), "muted"),
      link(post.title, post.url),
      t(`  (${post.readingTime})`, "muted"),
    ]),
    blank(),
    kv("archive", link(shortUrl(data.meta.blogUrl), data.meta.blogUrl)),
  ],
};

const socials: Command = {
  name: "socials",
  aliases: ["links"],
  description: "find me elsewhere",
  execute: ({ data }) =>
    data.socials.map((s) => kv(s.name.toLowerCase(), link(shortUrl(s.url), s.url))),
};

const contact: Command = {
  name: "contact",
  description: "how to reach me",
  execute: ({ data }) => [
    kv("email", link(data.meta.email, `mailto:${data.meta.email}`)),
    blank(),
    [t("or scroll to ", "muted"), t("05. contact", "accent"), t(" for the form", "muted")],
  ],
};

const cv: Command = {
  name: "cv",
  aliases: ["resume"],
  description: "download résumé",
  execute: ({ data }) => [kv("pdf", link(`download ↓  (${shortUrl(data.meta.siteUrl + data.meta.resumeUrl)})`, data.meta.resumeUrl))],
};

const metrics: Command = {
  name: "metrics",
  aliases: ["stats"],
  description: "competitive programming",
  execute: ({ data }) =>
    data.competitiveMetrics.map((m) => kv(m.platform.toLowerCase(), t(`${m.stats}  `), link(`@${m.handle}`, m.url))),
};

const location: Command = {
  name: "loc",
  aliases: ["location"],
  description: "where in the world",
  execute: ({ data }) => {
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    return [
      kv("city", t(data.meta.location)),
      kv("timezone", t(data.meta.timezone)),
      kv("local time", t(time, "accent")),
    ];
  },
};

const theme: Command = {
  name: "theme",
  usage: "theme <mode>",
  description: "switch color theme",
  execute: ({ args, setTheme }) => {
    const mode = args[0] ?? "";
    if (!isThemeMode(mode)) {
      return [[t(`usage: theme <${THEME_MODES.join("|")}>`, "warning")]];
    }
    setTheme(mode);
    return [[t(`theme set to ${mode}`, "success")]];
  },
};

const echo: Command = {
  name: "echo",
  description: "print arguments",
  execute: ({ args }) => (args.length ? [[t(args.join(" "))]] : [blank()]),
};

const clear: Command = {
  name: "clear",
  description: "reset to a fresh session",
  // Never dispatched: Terminal.tsx intercepts `clear` and resets scrollback.
  execute: () => [],
};

const sudo: Command = {
  name: "sudo",
  description: "",
  hidden: true,
  execute: () => [[t("nice try. this incident has been logged.", "error")]],
};

const exit: Command = {
  name: "exit",
  description: "",
  hidden: true,
  execute: () => [[t("there is no escape. only scroll.", "muted")]],
};

/** Canonical command list. Order = `help` output order. */
export function buildCommands(): readonly Command[] {
  return [
    help,
    whoami,
    about,
    status,
    education,
    skills,
    projects,
    project,
    blog,
    socials,
    contact,
    cv,
    metrics,
    location,
    theme,
    echo,
    clear,
    sudo,
    exit,
  ];
}
