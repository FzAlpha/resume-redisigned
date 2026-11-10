# DESIGN.md — Quiet Precision

The design system for hritabrata's portfolio. Every visual change starts here; `src/index.css` implements these tokens.
Structure follows the DESIGN.md format used by VoltAgent/awesome-claude-design, adapted from Linear/Vercel-style systems.

## 1. Visual theme & atmosphere

Editorial, engineered, calm. Typography is the hero. The page reads like a well-set technical journal: oversized type, generous whitespace, 1px hairlines, almost no shadows or decoration.
The mood is a precise instrument at rest, lit by a slow, warm glow that changes colour section by section. **No 3D, no video.**

## 2. Colour — the journey

The page background changes as you scroll. Each section declares a palette (`data-journey`), and
`src/lib/journey.ts` blends the five base colours between neighbouring sections onto `<html>` while the next
section's top travels from 85% to 30% of the viewport. Pinned sections hold their colour for the whole pin, so a
section can play its scroll animation *before* the colour changes (the Prologue does this). The page uses just two families, green and blue, alternating section by section. Every other token is
`color-mix()`ed from the five, so cards, hairlines and inputs follow automatically.

| Palette | Light paper / ink | Dark paper / ink | Where |
|---|---|---|---|
| lichen | `#E3E8DC` / `#161B14` | `#0F1810` / `#E1E8DA` | Hero, Prologue, Disciplines, Stack, case studies |
| fog | `#E4E8EC` / `#11161B` | `#0E151D` / `#E0E6EC` | About, Manifesto, Selected work, Activity, footer, case studies; the default |

Each palette also sets `--muted-ink`, `--accent-ink` (italic serif emphasis) and `--glow` (the blurred light of the
fixed atmosphere layer behind the page). `--signal` `#FF4F00` stays constant: focus, active, live states only.
Sections are transparent; only the inverse Contact island paints its own background.

## 3. Typography

| Role | Font | Size | Line height / tracking |
|---|---|---|---|
| Display (name) | Fraunces 340, optical size auto | `clamp(3.5rem, 12.5vw, 13rem)` | 0.9 / -0.045em |
| H1 | Fraunces 360 | `clamp(2.6rem, 6.4vw, 6rem)` | 0.98 / -0.035em |
| H2 | Fraunces 380 | `clamp(1.9rem, 3.8vw, 3.25rem)` | 1.05 / -0.025em |
| Statement | Geist 400 | `clamp(1.6rem, 3.3vw, 3.1rem)` | 1.16 / -0.035em |
| Body | Geist 400 | 17px | 1.6 |
| Label | Geist Mono 400, uppercase | 11px | 1.2 / +0.14em |
| Emphasis | Fraunces *italic* 360 in `--accent-ink` | inherits | one or two words per headline, max |

A high-contrast display serif for headings against a neutral grotesk for reading, with italic serif emphasis
picked out in the section's accent colour.

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
- ❌ Animations that loop forever. Sanctioned exceptions: the stack marquee (pauses on hover), the hero contour field (very low contrast, paused off-screen), the terminal caret, and the CV border beam (hover only)
