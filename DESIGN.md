# DESIGN.md — Quiet Precision

The design system for hritabrata's portfolio. Every visual change starts here; `src/index.css` implements these tokens.
Structure follows the DESIGN.md format used by VoltAgent/awesome-claude-design, adapted from Linear/Vercel-style systems.

## 1. Visual theme & atmosphere

Editorial, engineered, calm. Typography is the hero. The page reads like a well-set technical journal: oversized type, generous whitespace, 1px hairlines, almost no shadows or decoration.
The mood is a precise instrument at rest. **No 3D, no video, no ambient loops.**

## 2. Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#F4F3EF` | `#0A0A0A` | Page background |
| `--ink` | `#0B0B0C` | `#EDEDEA` | Text, primary buttons |
| `--muted-ink` | `#6F6F6B` | `#8A8A86` | Secondary text, meta, labels |
| `--hairline` | ink @ 9% | ink @ 9% | Dividers, borders |
| `--card` | `#EFEEE9` | `#111110` | Rare raised surfaces |
| `--signal` | `#FF4F00` | `#FF4F00` | **The one accent.** Focus rings, active nav, "live" dots, selection. Never for large fills |

Rules: monochrome by default. Use signal at most once per viewport outside focus states. Never use a gradient as a background.

## 3. Typography

| Role | Font | Size | Line height / tracking |
|---|---|---|---|
| Display (name) | Geist 500 | `clamp(3.5rem, 12.5vw, 13rem)` | 0.88 / -0.055em |
| H1 | Geist 500 | `clamp(2.5rem, 6vw, 5.5rem)` | 0.95 / -0.045em |
| H2 | Geist 500 | `clamp(1.75rem, 3.6vw, 3rem)` | 1.05 / -0.035em |
| Statement | Geist 450 | `clamp(1.6rem, 3.4vw, 3.25rem)` | 1.12 / -0.03em |
| Body | Geist 400 | 17px | 1.6 |
| Label | Geist Mono 400, uppercase | 12px | 1 / +0.04em |
| Emphasis | Instrument Serif *italic* | inherits | one or two words per headline, max |

Numbers in the UI (indices, counters, time) are always Geist Mono with tabular figures.

## 4. Layout

- 12-column grid, `max-width: 1440px`, gutter `clamp(1rem, 3vw, 2.5rem)`
- Sections open with a mono label row: `(01) — About` on the left and context on the right, separated from content by a hairline
- Vertical rhythm: section padding `clamp(6rem, 14vw, 12rem)`
- Breakpoints: 640 / 768 / 1024 / 1280. Design mobile-first; every section is legible at 375px

## 5. Components

- **Buttons:** pill (`radius: 999px`), height 40/48. Primary = ink fill. Outline = 15% ink border, 40% on hover. Magnetic on pointer devices
- **Links:** text plus a `↗` / `→` arrow that slides 2px on hover. Underline only inside paragraphs
- **Fields:** underline only (no box); the hairline turns signal on focus
- **List rows** (work, disciplines): full-width, hairline top border, mono index, title, meta aligned right
- **Glass:** reserved for the floating nav pill only
- **Command palette (⌘K):** popover surface, mono input, grouped items with shortcuts

## 6. Motion

| Token | Value |
|---|---|
| Ease (default) | `cubic-bezier(.16, 1, .3, 1)`, out-expo |
| Ease (page curtain) | `cubic-bezier(.76, 0, .24, 1)`, in-out-quart |
| Durations | 180 ms (micro) · 450 ms (UI) · 900 ms (reveals) |
| Stagger | 40 ms per word/line |
| Spring | stiffness 300, damping 30 |

Principles: motion must reveal hierarchy, give feedback, or connect two states. Text rises from a line mask; it never bounces.
Under `prefers-reduced-motion`, everything becomes opacity-only and smooth scroll is turned off.

## 7. Do / Don't

- ✅ Whitespace before decoration · one idea per viewport · real content over lorem ipsum
- ✅ Hairlines, mono labels, tabular numbers
- ❌ Drop shadows on cards · gradients · glows · emoji in UI · more than one accent · stock 3D
- ❌ Animations that loop forever (the marquee is the only exception, and it pauses on hover)
