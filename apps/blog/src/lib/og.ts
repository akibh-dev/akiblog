/* For more details, see docs/blog/implementation-notes.md#src-lib-og-ts-note-1. */
import sharp from "sharp";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const W = 1200;
const H = 630;
const PAD = 72;

const C = {
  canvas: "#111316",
  surface: "#1c1f23",
  border: "#444951",
  text: "#eeecec",
  muted: "#a09ca5",
  accent: "#e37261",
  fill: "#be3c26",
  rail2: "#444951",
  blue: "#346dae",
};

/* For more details, see docs/blog/implementation-notes.md#src-lib-og-ts-note-2. */
const font = (file: string) => {
  const path = resolve(process.cwd(), "src/lib/og-fonts", file);
  if (!existsSync(path)) throw new Error(`OG card font missing: ${path}`);
  return path;
};
const SERIF = font("IBMPlexSerif-Var.ttf");
const MONO = font("Lilex-Regular.ttf");
/* pango matches the font's INTERNAL family name */
const SERIF_FAMILY = "IBM Plex Serif Var";
const MONO_FAMILY = "Lilex";

/** pango markup needs &, <, > escaped */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function text(markup: string, fontfile: string, fontDesc: string, width: number, spacing = 0) {
  const img = sharp({ text: { text: markup, fontfile, font: fontDesc, rgba: true, width, wrap: "word", spacing } });
  const { data, info } = await img.png().toBuffer({ resolveWithObject: true });
  return { input: data, width: info.width, height: info.height };
}

export interface OgCard {
  title: string;
  /** small uppercase line above the title, e.g. "GUIDE / #HTML / #WEB" */
  eyebrow?: string;
  /** right side of the footer, e.g. "13 min read · Oct 13, 2026" */
  meta?: string;
}

export async function renderOgCard({ title, eyebrow, meta }: OgCard): Promise<Buffer> {
  // long titles: step the size down, and cap at ~3 lines
  const size = title.length > 70 ? 54 : title.length > 42 ? 62 : 72;
  const t = title.length > 110 ? title.slice(0, 107).trimEnd() + "…" : title;

  const titleImg = await text(`<span foreground="${C.text}">${esc(t)}</span>`, SERIF, `${SERIF_FAMILY} ${size}`, W - PAD * 2, Math.round(size * 0.12));
  const eyebrowImg = eyebrow ? await text(`<span foreground="${C.accent}" letter_spacing="2400">${esc(eyebrow.toUpperCase())}</span>`, MONO, `${MONO_FAMILY} 20`, W - PAD * 2) : null;
  const brandImg = await text(`<span foreground="${C.text}">akiblog</span>`, SERIF, `${SERIF_FAMILY} 36`, 400);
  const hostImg = await text(`<span foreground="${C.muted}">blog.akibh.dev</span>`, MONO, `${MONO_FAMILY} 18`, 400);
  const metaImg = meta ? await text(`<span foreground="${C.muted}">${esc(meta)}</span>`, MONO, `${MONO_FAMILY} 18`, 600) : null;

  // vertical rhythm: eyebrow + title block centered in the space above the footer
  const footerTop = H - PAD - brandImg.height;
  const blockH = (eyebrowImg ? eyebrowImg.height + 28 : 0) + titleImg.height;
  const blockTop = Math.max(PAD + 40, Math.round((footerTop - 40 - blockH) / 2 + 20));

  const shapes = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${C.canvas}"/>
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="${C.surface}" stroke="${C.border}" stroke-width="1.5"/>
    <rect x="24" y="24" width="${((W - 48) * 3) / 8}" height="8" fill="${C.fill}"/>
    <rect x="${24 + ((W - 48) * 3) / 8}" y="24" width="${((W - 48) * 2) / 8}" height="8" fill="${C.rail2}"/>
    <rect x="${24 + ((W - 48) * 5) / 8}" y="24" width="${((W - 48) * 3) / 8}" height="8" fill="${C.blue}"/>
    <line x1="${PAD}" y1="${footerTop - 28}" x2="${W - PAD}" y2="${footerTop - 28}" stroke="${C.border}" stroke-width="1"/>
    <circle cx="${PAD + brandImg.width + 8}" cy="${footerTop + brandImg.height - 9}" r="5" fill="${C.accent}"/>
  </svg>`);

  const layers: sharp.OverlayOptions[] = [{ input: shapes, top: 0, left: 0 }];
  let y = blockTop;
  if (eyebrowImg) {
    layers.push({ input: eyebrowImg.input, top: y, left: PAD });
    y += eyebrowImg.height + 28;
  }
  layers.push({ input: titleImg.input, top: y, left: PAD });
  layers.push({ input: brandImg.input, top: footerTop, left: PAD });
  layers.push({ input: hostImg.input, top: footerTop + brandImg.height - hostImg.height - 4, left: PAD + brandImg.width + 28 });
  if (metaImg) layers.push({ input: metaImg.input, top: footerTop + brandImg.height - metaImg.height - 4, left: W - PAD - metaImg.width });

  return sharp({ create: { width: W, height: H, channels: 4, background: C.canvas } })
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();
}
