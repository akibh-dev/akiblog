# Icon Creation Guide

How to design new icons for this set so they look like they belong.
Read this once, then keep it open while drawing.

---

## 1. The contract (non-negotiable)

| Rule | Value | Why |
| --- | --- | --- |
| Grid | 24 × 24 (`viewBox="0 0 24 24"`) | every icon aligns at any size |
| Live area | keep art inside **~2 → 22** | optical padding; strokes won't clip |
| Stroke | `stroke-width: 1.8`, round caps & joins | matches the delta.dev aesthetic |
| Color | **only `currentColor`** | dark/light mode works for free via theme tokens |
| Fills | none — except small accent dots (`fill="currentColor"`, r ≈ 0.85–1.15) | dots read as eyes / nodes / pulses |
| Shell | wrap everything in `IconBase.astro` | one place owns a11y + defaults |

Every icon file looks like this:

```astro
---
/**
 * Icon: <Name> — <one-line description of the construction>.
 * Theme-aware via currentColor (see IconBase.astro).
 */
import IconBase from "../IconBase.astro";
---

<IconBase {...Astro.props}>
  <!-- your paths here -->
</IconBase>
```

Then export it from `src/icons/index.ts` with an `Icon` suffix.

---

## 2. SVG coordinates & path commands (60-second primer)

- Origin `(0,0)` is **top-left**. **y grows downward.** Center is `(12,12)`.
- A `<path d="...">` is a list of commands. Uppercase = absolute, lowercase = relative.

| Command | Meaning | Example |
| --- | --- | --- |
| `M x y` | move pen (start subpath) | `M12 3` |
| `L x y` | line to | `L20 12` |
| `H x` / `V y` | horizontal / vertical line | `H18` |
| `C x1 y1  x2 y2  x y` | cubic Bézier to (x,y) with 2 control points | see §4 |
| `A rx ry  rot largeArc sweep  x y` | elliptical arc to (x,y) | see §3 |
| `Z` | close path (straight line to start) | `Z` |

Multiple subpaths in one `d` (via extra `M`s) is normal — see `Cpp.astro`.

`<circle cx cy r>`, `<ellipse cx cy rx ry>`, `<rect x y width height>` are
also allowed (see `React.astro`, `Docker.astro`).

---

## 3. Arcs — the only tricky part

`A rx ry rot largeArc sweep x y` draws an arc from the **current point** to
`(x,y)`. Given two points and a radius there are 4 possible arcs; the two
flags pick one:

```
sweep=1  →  arc bulges to the RIGHT of travel direction (clockwise)
sweep=0  →  arc bulges to the LEFT  (counter-clockwise)
largeArc=1  →  take the long way around (the > 180° option)
largeArc=0  →  take the short way
```

**Remember: y is down, so "clockwise" looks clockwise on screen.**

### Recipe: quarter circle (90° corner)

End point is `(±r, ±r)` away from start. Radius = that offset.

```
M15 4.5 A3.75 3.75 0 0 1 15 12     ← from (15,4.5) to (15,12): chord 7.5 = 2r
                                      → a semicircle bulging right
```

### Recipe: open circle / letter "C" (the `C.astro` trick)

Pick a chord that cuts off the right side; `largeArc=1 sweep=0` goes the long
way around the left:

```
M15.8 7.2 A6.8 6.8 0 1 0 15.8 16.8
```

Geometry: endpoints `(15.8, 7.2)` & `(15.8, 16.8)` → chord = 9.6, half = 4.8.
Center sits `sqrt(6.8² − 4.8²) ≈ 4.8` left of the chord → center `(11, 12)`. ✔

### Recipe: semicircle (U-turn, used in `Python.astro`)

Endpoints exactly `2r` apart; flags don't matter much:

```
M15 3.5 A3.5 3.5 0 0 1 15 10.5      ← top snake's U-turn bulging right
M9 20.5 A3.5 3.5 0 0 1 9 13.5       ← bottom snake's U-turn bulging left
```

### Sanity check

`chord length must be ≤ 2r`, otherwise the browser silently scales the arc
up and your numbers stop meaning anything.

---

## 4. Bézier curves in practice

`C x1 y1  x2 y2  x y` — the curve leaves the start heading toward
`(x1,y1)` and arrives at `(x,y)` coming from `(x2,y2)`. You almost never need
perfect math; you need **smoothness**:

- **Waves** (`Tailwind.astro`): alternate control points above and below the
  baseline. `M2.8 10.2 C4.3 6.9 7.3 6.4 9.6 7.6 …`
- **Blobs** (`Cloudflare.astro` cloud): chain 3 arcs/cubics around and close.
- **Letter "S"** (`TypeScript.astro`): 2–3 stacked cubics, hooks pointing
  left at both ends:

```
M16.9 9.2 C16 8.3 14.1 8.3 13.7 9.5 C13.3 10.7 14.7 11.2 15.8 11.7
C17 12.3 18.1 13 17.8 14.4 C17.5 15.9 15.4 16.6 13.7 15.6
```

Rule of thumb: control points at roughly **⅓ and ⅔** of the segment give
even, non-lumpy curves.

---

## 5. The design process (5 steps)

### Step 1 — Get the real geometry

Open the official logo (simpleicons.org is great for reference proportions).
Identify the **one or two shapes that make it recognizable**; discard the
rest. Examples:

| Logo | Recognizable essence | Kept |
| --- | --- | --- |
| Git | diamond + branch nodes | ✔ both |
| Python | two interlocked snakes + eyes | ✔ both |
| Docker | whale + container stack | ✔ both |
| PostgreSQL | elephant head | ears, dome, trunk |
| React | 3 ellipses + nucleus | ✔ exactly as-is |

### Step 2 — Choose a construction pattern

- **Glyph**: pure letterform/shape (`C`, `Go`, `Lambda`)
- **Badge**: rounded square + monogram (`TypeScript`, `HackerRank`, `Markdown`)
- **Symbol**: geometric mark (`React`, `Graphql`, `Kubernetes`)
- **Scene**: mini illustration (`Docker`, `Bun`, `Linux`)
- **Mirrored pairs**: draw one half, rotate/reflect for the other
  (`Python` bottom snake = top snake rotated 180° about `(12,12)`:
  map every point `(x,y) → (24−x, 24−y)`)

### Step 3 — Sketch on the 24-grid

Use whole/half numbers where possible; quarters (`2.75`) are fine for curve
control points. Keep stems aligned to the same coordinates (in `Codeforces`,
all bars end at `y=19.5`; in `Database`, both sides start at `y=6`).

### Step 4 — Write the file

Follow the template in §1. One `<path>` per logical shape — it makes later
tweaks far easier than one mega-path.

### Step 5 — Verify in the gallery

```bash
bun run dev:portfolio   # → http://localhost:4322/icons
```

Toggle dark/light. Then run the checklist below.

---

## 6. Pattern library (copy-paste starters)

**Rounded badge** (used by TS/JS/HackerRank/Markdown):

```
M4.9 3.4 h14.2 a1.5 1.5 0 0 1 1.5 1.5 v14.2 a1.5 1.5 0 0 1 -1.5 1.5 H4.9
a1.5 1.5 0 0 1 -1.5 -1.5 V4.9 a1.5 1.5 0 0 1 1.5 -1.5 Z
```

**Pointy-top hexagon** (`NodeJs`, `Graphql`):

```
M12 3.5 L19.4 7.75 V16.25 L12 20.5 L4.6 16.25 V7.75 Z
```

**Diamond** (`Git`, `Vim`):

```
M12 2.8 L21.2 12 L12 21.2 L2.8 12 Z
```

**Filled accent dot** (eyes, nodes, nuclei):

```html
<circle cx="12" cy="12" r="0.95" fill="currentColor" stroke="none" />
```

**Rotated copies** (`React`'s ellipses):

```html
<ellipse cx="12" cy="12" rx="9.6" ry="3.7" transform="rotate(60 12 12)" />
```

**Radial spokes** (`Kubernetes`, `Rust`): for N spokes, angle step = 360/N;
endpoint of a spoke at radius r and angle θ (degrees):

```
x = 12 + r·cos θ
y = 12 + r·sin θ
```

---

## 7. QA checklist

- [ ] Art stays inside ~`2 → 22` on both axes (no clipped strokes)
- [ ] `stroke-width` comes from IconBase (don't hardcode a different one)
- [ ] No hardcoded colors anywhere (`stroke="#…"`, `fill="#…"` → instant reject)
- [ ] Filled dots use `fill="currentColor" stroke="none"`
- [ ] Recognizable at `size-4` (16 px) — if not, remove detail, don't shrink strokes
- [ ] Looks intentional in **both** light and dark (check `/icons` toggle)
- [ ] Visual weight matches neighbors (not noticeably heavier/lighter)
- [ ] Decorative usage needs no title; standalone-link usage gets `title="…"`
- [ ] Exported from `index.ts` with `Icon` suffix
- [ ] `bun run build:portfolio` still passes

## 8. Common pitfalls

1. **Arc draws the wrong side** → flip the `sweep` flag (0↔1). 90% of arc bugs.
2. **Arc looks huge/distorted** → your chord is longer than `2r`; the browser
   upscaled the radius. Increase `r` or move the endpoints closer.
3. **Eye dot invisible** → you placed a `currentColor` dot exactly on a
   `currentColor` stroke. Offset it beside the stroke (see `Python.astro`).
4. **Icon looks cramped vs the set** → you used the whole 0→24 canvas.
   Everything here lives in 2→22; scale down.
5. **Too much detail** → at 16–20 px, sub-1px gaps vanish. Merge or delete
   small features (that's why `Docker.astro` has 6 boxes, not 9).
6. **Mirrored half looks wrong** → for 180° rotation use `(x,y) → (24−x,24−y)`
   on every point, and flip arc `sweep` flags.

---

*When in doubt, open the two most similar existing icons and imitate their
construction — consistency beats cleverness.*
