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
  sections/                home-page sections (Hero, About, Disciplines, SelectedWork, Stack, Activity, Contact)
  pages/                   Home, Work (/work/:slug, lazy), NotFound
  components/ui/           shadcn/ui primitives (hand-copied, styled to DESIGN.md)
  components/site/         Nav, Footer, CV sheet, ⌘K palette, mobile menu, contribution grid…
  components/motion/       Lenis, preloader, route curtain, scroll progress, page-animation hook
  components/interaction/  cursor, magnetic, marquee, tilt cover, work preview, glass lens, hero shader, Lottie tick
  lib/                     motion tokens, scroll helpers, animation engine, theme, contexts
scripts/                   fetch-activity.mjs, og-image.mjs
```

### Animations

Scroll animations are declarative — add a data attribute and `src/lib/animations.ts` handles it:
`data-split` (headline line reveal) · `data-scrub-words` (word-by-word opacity) · `data-stagger` (children fade up) ·
`data-count="N"` (count up) · `data-scramble` (label decode) · `data-parallax` (image drift) · `data-grow` (bar grows).
Everything is skipped under `prefers-reduced-motion`. Add `?intro` to the URL to replay the preloader.

## Libraries

GSAP + ScrollTrigger · Lenis · SplitType · Baffle · Ukiyo · Motion · @use-gesture · Atropos · cmdk · OGL ·
@ybouane/liquidglass · lottie-web · tsParticles confetti · shadcn/ui (Radix) · Tailwind v4 · React 19 · Vite 8.
Patterns adapted from Magic UI (marquee, border beam), React Bits (cursor, magnet) and Aceternity (card spotlight).

## Deploy

`npm run build` and upload `dist/` to any static host. SPA routing is preconfigured for **Vercel** (`vercel.json`)
and **Netlify** (`public/_redirects`). After choosing a domain, make the `og:image` URLs in `index.html` absolute.

## History

The previous cinematic WebGL version is tagged `v2-cinematic`. Its Blender scenes, raw models and rendered films
are archived outside the repo in `../resume-archive-cinematic/`.
