# Hritabrata Bardhan — portfolio (v3)

Minimal, typography-led portfolio with a deliberate motion layer.
Design system: [`DESIGN.md`](DESIGN.md) · roadmap & decisions: [`REDESIGN_PLAN.md`](REDESIGN_PLAN.md).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # refreshes activity data, type-checks, builds dist/
npm run preview    # serve the build
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run activity` | Re-fetch GitHub + LeetCode stats into `src/content/activity.json` (also runs before every build; keeps the old snapshot if offline) |
| `npm run og` | Re-render the social share card `public/og.png` |

## Editing content

All text lives in `src/content/`:

| File | Contents |
|---|---|
| `profile.ts` | Name, role, tagline, statement, education, stats, disciplines |
| `projects.ts` | Projects. Set `cover` to an image path (e.g. `/images/shell.png`) to replace the typographic cover; set `year` too |
| `skills.ts` | Skill groups (feeds the stack list, marquee, CV and ⌘K) |
| `contact.ts` | Email and social links |
| `quips.ts` | The cheesy lines |
| `commands.ts` | ⌘K terminal commands and easter eggs |

## Structure

```
src/
  content/                 all copy + activity snapshot
  sections/                home-page sections (Hero, Prologue, About, Manifesto, Disciplines, SelectedWork, Stack, Activity, Contact)
  pages/                   Home, Work (/work/:slug, lazy), NotFound
  components/ui/           shadcn/ui primitives (hand-copied, styled to DESIGN.md)
  components/site/         Nav, Footer, CV sheet, ⌘K palette, mobile menu, contribution grid…
  components/motion/       Lenis, preloader, route curtain, scroll progress, page-animation hook
  components/interaction/  cursor, magnetic, marquee, tilt cover, work preview, glass lens, hero background wrapper, Lottie tick
  lib/                     motion tokens, scroll helpers, animation engine, colour journey, contexts
scripts/                   fetch-activity.mjs, og-image.mjs
```

### Animations

Scroll animations are declarative — add a data attribute and `src/lib/animations.ts` handles it:

| Attribute | Effect |
|---|---|
| `data-split` | headline words rise from a line mask |
| `data-chars` | letters start scattered and assemble (scrubbed) |
| `data-scrub-words` | paragraph lights up word by word (scrubbed) |
| `data-fill` + `.text-fill` | outline text fills with ink (scrubbed) |
| `data-scrub-x="-20"` | slides horizontally with the scroll |
| `data-speed="1.1"` | parallax depth |
| `data-skew` | leans with scroll velocity |
| `data-clip-reveal` | frame opens from an inset clip while zooming out |
| `data-expand` | section grows from a rounded card to full bleed |
| `data-stagger` · `data-count="N"` · `data-scramble` · `data-parallax` · `data-grow` | fade-up lists · count-up · label decode · image drift · bar grow |

### Colour journey

The background changes colour as you scroll (`src/lib/journey.ts`). Give a section `data-journey="lichen|fog"`
and the page blends into that palette as the section arrives; palettes live in `journeys` (light only; there is no dark mode). Every
token is mixed from five base colours, so the whole UI follows. Pinned sections hold their colour for the whole pin: the
**Prologue** (`sections/Prologue.tsx`) pins on the hero's green and lights up its statement word by word before the page turns blue.
Behind everything, `components/site/Atmosphere.tsx` draws a slow glow in the palette's `--glow`.

Type: **Fraunces** (variable, optical sizing) for display and headings, with italic Fraunces in the section's accent colour for
emphasis; **Geist** for text; **Geist Mono** for labels.

Hero: the background is React Bits' **Antigravity** (vendored in `src/vendor/react-bits/`, MIT + Commons Clause,
configured in `components/interaction/HeroField.tsx`): particles gather into a circle around the cursor as it
approaches and settle back when it leaves; click to burst. The tagline types itself out with a caret
(`components/motion/TypedText.tsx`), then hands over to React Bits' **Tech Text** (`components/interaction/TechTagline.tsx`):
hover a letter for its dashed outline and type metrics, drag or flick it and it springs back (desktop, where the line fits on one line).

Section-level effects: pinned horizontal scroll (`sections/Disciplines.tsx`), stacking cards (`sections/Stack.tsx`),
hero exit (`sections/Hero.tsx`). Everything is skipped under `prefers-reduced-motion` — if you see no motion at all,
check Windows Settings → Accessibility → Visual effects → **Animation effects** (off = reduced motion).
Add `?intro` to the URL to replay the preloader.

### Page transitions

`components/motion/RouteTransition.tsx` — a different one per kind of move:
**morph** (work list → case study; the title flies into the heading, View Transitions API) ·
**slide** (case study → next) · **curtain** (back to the work list) · **columns** (logo / section links from a case study) ·
**zoom** (⌘K jumps, 404). View-Transition styles fall back to the curtain where unsupported.

### Liquid glass

`src/vendor/liquid-glass/` is [nordify/css-liquid-glass](https://github.com/nordify/css-liquid-glass) (MIT), vendored
unmodified and wrapped by `components/interaction/useLiquidGlass.ts`. Used on the nav pill and the draggable hero lens.
Chromium refracts; Safari/Firefox get frosted glass. Never put `transform`, `opacity`, `filter`, `isolation`,
`will-change` or `overflow:hidden` on a glass element or its ancestors.

## Libraries

GSAP + ScrollTrigger · Lenis · SplitType · Baffle · Ukiyo · Motion · @use-gesture · Atropos · cmdk ·
css-liquid-glass (vendored) · React Bits Antigravity + Tech Text (vendored) · View Transitions API · lottie-web · tsParticles confetti · shadcn/ui (Radix) · Tailwind v4 · React 19 · Vite 8.
Patterns adapted from Magic UI (marquee, border beam), React Bits (cursor, magnet) and Aceternity (card spotlight).

## Deploy

`npm run build` and upload `dist/` to any static host. SPA routing is preconfigured for **Vercel** (`vercel.json`)
and **Netlify** (`public/_redirects`). After choosing a domain, make the `og:image` URLs in `index.html` absolute.

## History

The previous cinematic WebGL version is tagged `v2-cinematic`. Its Blender scenes, raw models and rendered films
are archived outside the repo in `../resume-archive-cinematic/`.
