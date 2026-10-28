/* For more details, see docs/blog/implementation-notes.md#src-lib-markdown-ts-note-1. */

/* Minimal structural node type — enough for walking mdast + hast. */
interface Node {
  type: string;
  tagName?: string;
  value?: string;
  depth?: number;
  lang?: string | null;
  properties?: Record<string, unknown>;
  children?: Node[];
  data?: Record<string, unknown>;
}

function walk(node: Node, fn: (n: Node, parent?: Node) => void, parent?: Node) {
  fn(node, parent);
  node.children?.forEach((c) => walk(c, fn, node));
}

/* ── remark ────────────────────────────────────────────────────────────── */

export function remarkStripTitle() {
  return (tree: Node) => {
    const first = tree.children?.findIndex((n) => n.type !== "html" && n.type !== "yaml");
    if (first === undefined || first < 0) return;
    const n = tree.children![first];
    if (n.type === "heading" && n.depth === 1) tree.children!.splice(first, 1);
  };
}

export function remarkCodeLang() {
  return (tree: Node) =>
    walk(tree, (node) => {
      if (node.type === "code" && node.lang) node.lang = node.lang.toLowerCase();
    });
}

const ALERTS = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
} as const;
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i;

export function remarkAlerts() {
  return (tree: Node) =>
    walk(tree, (node) => {
      if (node.type !== "blockquote") return;
      const para = node.children?.[0];
      const text = para?.type === "paragraph" ? para.children?.[0] : undefined;
      const m = text?.type === "text" ? ALERT_RE.exec(text.value ?? "") : null;
      if (!para || !text || !m) return;

      const kind = m[1].toUpperCase() as keyof typeof ALERTS;
      text.value = text.value!.slice(m[0].length);
      // "[!NOTE]" alone on its line → the paragraph may now start with a break
      if (!text.value) para.children!.shift();
      if (para.children![0]?.type === "break") para.children!.shift();
      if (para.children!.length === 0) node.children!.shift();

      node.data = {
        hName: "div",
        hProperties: { className: ["callout", `callout-${kind.toLowerCase()}`], role: "note" },
      };
      node.children!.unshift({
        type: "paragraph",
        data: { hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: ALERTS[kind] }],
      });
    });
}

/* ── rehype ────────────────────────────────────────────────────────────── */

export function rehypeHeadingAnchors() {
  return (tree: Node) =>
    walk(tree, (node) => {
      if (node.type !== "element" || !/^h[2-4]$/.test(node.tagName ?? "")) return;
      const id = node.properties?.id;
      if (typeof id !== "string") return;
      node.children = [
        ...(node.children ?? []),
        {
          type: "element",
          tagName: "a",
          properties: { href: `#${id}`, className: ["heading-anchor"], ariaLabel: "Link to this section" },
          children: [],
        },
      ];
    });
}

/** hosts treated as THIS site (no ↗, same tab) */
export function rehypeExternalLinks(siteHosts: string[] = ["blog.akibh.dev"]) {
  return () => (tree: Node) =>
    walk(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https?:\/\//.test(href)) return;
      if (siteHosts.includes(new URL(href).host)) return;
      const cls = node.properties!.className;
      node.properties!.className = [...(Array.isArray(cls) ? cls : []), "external"];
      node.properties!.rel = ["noopener", "noreferrer"];
      node.properties!.target = "_blank";
    });
}

/* ── shiki ─────────────────────────────────────────────────────────────── */

/** Display names for the tab strip; anything else shows the raw lang id. */
const LANG_LABEL: Record<string, string> = {
  ts: "TypeScript", typescript: "TypeScript", js: "JavaScript", javascript: "JavaScript",
  tsx: "TSX", jsx: "JSX", sh: "Shell", bash: "Shell", shell: "Shell", zsh: "Shell",
  console: "Console", json: "JSON", jsonc: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML",
  md: "Markdown", markdown: "Markdown", html: "HTML", css: "CSS", astro: "Astro",
  py: "Python", python: "Python", rs: "Rust", rust: "Rust", go: "Go", c: "C", cpp: "C++",
  java: "Java", sql: "SQL", diff: "Diff", dockerfile: "Dockerfile", txt: "Text", plaintext: "Text",
};

export function shikiCodeFrame() {
  return {
    name: "akiblog:code-frame",
    root(this: { options: { lang?: string; meta?: { __raw?: string } } }, root: Node) {
      const pre = root.children?.find((n) => n.type === "element" && n.tagName === "pre");
      if (!pre) return;
      const lang = (this.options.lang ?? "text").toLowerCase();
      const title = /title=(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(this.options.meta?.__raw ?? "");
      const file = title?.[1] ?? title?.[2] ?? title?.[3];

      const tab: Node = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-tab"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["code-lang"] },
            children: [{ type: "text", value: LANG_LABEL[lang] ?? lang }],
          },
          ...(file
            ? [{ type: "element", tagName: "span", properties: { className: ["code-file"] }, children: [{ type: "text", value: file }] } as Node]
            : []),
          {
            type: "element",
            tagName: "button",
            properties: { type: "button", className: ["code-copy", "btn"], dataCopy: "", ariaLabel: "Copy code" },
            children: [{ type: "text", value: "Copy" }],
          },
        ],
      };
      // tabindex lets keyboard users scroll long lines (axe: scrollable-region-focusable)
      pre.properties = { ...pre.properties, tabindex: "0" };
      root.children = [
        { type: "element", tagName: "figure", properties: { className: ["code-block"], dataLang: lang }, children: [tab, pre] },
      ];
    },
  };
}
