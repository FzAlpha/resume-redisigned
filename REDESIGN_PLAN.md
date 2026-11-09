# Redesign Plan — Minimal / Premium

Status: **proposal — nothing deleted or built yet.**

---

## 1. The gist (what the site has to say)

Taken only from the written content of the current site; everything visual is discarded.

| | |
|---|---|
| **Who** | Hritabrata Bardhan · handle **FzAlpha** · Computer Science Engineering student |
| **Positioning** | "I build software close to the metal." Low-level systems, C++, Linux internals, algorithms, plus full-stack and multi-agent AI |
| **Personality** | Arch / EndeavourOS / Hyprland user who configures his own system to understand how an OS works underneath; Neovim, Lua, Bash |
| **Disciplines** | 01 Low-level systems (process management, syscalls, POSIX, custom shells) · 02 Algorithms & optimization (DP, graphs, trees) · 03 Full-stack & AI agents (multi-agent pipelines, self-hosted services) |
| **Skills** | Languages: C++, C, Python, Java, Bash, Lua, JavaScript, HTML/CSS · Systems: Arch, EndeavourOS, Ubuntu, Hyprland, Docker, Git, Neovim, CMake, POSIX · Architecture: DSA, multi-agent AI, daemons, state engines, REST, GDB |
| **Work** | **log-Manager** (C++ state/telemetry tool for CP + DSA tracking) · **Custom Linux Shell** (C++: piping, job control, signals, syscalls) · **Algo-Vault** (200+ verified solutions: DP, Dijkstra, Tarjan, segment trees) · **Multi-Agent AI Platform** (Python, Docker, orchestration pipelines) |
| **Proof** | 200+ DSA problems · 10+ GitHub repos (drop "98% code efficiency": it isn't a measurable number and weakens the rest) |
| **Contact** | Email · LinkedIn · GitHub `FzAlpha` · LeetCode `Fz_Alpha_07` · Discord `fz_alpha_1` |
| **Extras worth keeping** | The CV (printable) and the terminal easter egg (`help / about / skills / projects / contact / github / clear`), reborn as a ⌘K command palette |

**Content I need from you** (I won't invent these): a portrait photo (the old `assets/images/user_photo.jpg` is recoverable from commit `f5aa142`), city/country, university + graduation year, whether you're open to internships/roles, a screenshot or GIF per project, and a repo link for the Multi-Agent AI Platform.

---

## 2. Design direction — "Quiet precision"

References (patterns, not copies). I tried to open them in the browser and the navigation was blocked, so these come from known work. I can do a live pass if you allow those sites.

| Site | What we take |
|---|---|
| rauno.me, emilkowal.ski | Restraint: motion only where it explains something; tiny, careful interaction details |
| linear.app, vercel.com (Geist) | Type system, hairline borders, a near-monochrome palette with one signal colour |
| dennissnellenberg.com | Cursor-following project previews, magnetic buttons, curtain page transitions |
| brittanychiang.com | Developer-portfolio structure: clear hierarchy, fast, scannable |
| darkroom.engineering (makers of Lenis) | Smooth-scroll feel, editorial grid |

**Principles**
1. **Typography is the hero.** No 3D, no video. Oversized type, generous whitespace, a 12-column grid, 1px hairlines.
2. **One accent, used rarely.** Monochrome everywhere; the accent appears only on focus, active and "live" states.
3. **Every animation has a job:** reveal hierarchy, give feedback, or connect two states. Nothing loops for its own sake.
4. **Fast first.** The site works and reads well with JS off or `prefers-reduced-motion`, and the heavy pieces load lazily.

**Tokens** (locked in `DESIGN.md`, see §4)
- Light `#F4F3EF` paper / `#0B0B0C` ink · Dark `#0A0A0A` / `#EDEDEA` · muted `#8A8A86` · hairline `rgba(ink, .08)`
- Accent (pick one): **signal orange `#FF4F00`** (recommended) or phosphor green `#3DDC84`
- Fonts (all free/OFL): **Geist** (UI + display), **Geist Mono** (labels, palette, numbers), **Instrument Serif italic** for one or two emphasis words per headline
- Type scale: fluid `clamp()`. Display 9–14vw for the name, H2 ~4.5rem, body 17px / 1.6
- Motion: ease `cubic-bezier(.16,1,.3,1)` (out-expo); durations 180 / 450 / 900 ms; stagger 40 ms; spring `{stiffness: 300, damping: 30}`
- Radius 0 for structure, 999px for pills; shadows used almost nowhere

---

## 3. Information architecture

```
/                 single scrolling page
/work/:slug       short case study per project (gives page transitions a reason to exist)
⌘K                command palette, available everywhere (replaces the Terminal section)
```

| # | Section | Layout & behaviour |
|---|---|---|
| 0 | **Preloader** (first visit only, ≤1.2 s) | Mono counter 000→100, name revealed line by line, then a clip-path curtain lifts. No sound, no "hold" gate. Skipped on repeat visits (sessionStorage) and under reduced motion |
| 1 | **Nav** | Floating **liquid-glass pill**, top centre: `HB` monogram · Work · About · Stack · Contact · `⌘K` · theme · language. Links scramble on hover (Baffle) |
| 2 | **Hero** | Full-bleed name in display type, split-line mask reveal. One line: *"I build software close to the metal."* Meta row in mono: role · location · local time · status. Faint OGL grain/noise field behind the type that responds slightly to the cursor |
| 3 | **About / statement** | One large paragraph; each word scrubs from 15% to 100% opacity as you scroll (GSAP ScrollTrigger + SplitType). Portrait with Ukiyo parallax. Two stats counting up (200+, 10+) |
| 4 | **Disciplines** | Three numbered rows (01 / 02 / 03) with hairline dividers. Click to expand (Motion layout animation) |
| 5 | **Selected work** | 4 large list rows (index · title · tags · year). On desktop a preview card follows the cursor (Atropos tilt). Click → `/work/:slug` with a shared-element transition. On mobile: a draggable card rail (use-gesture) |
| 6 | **Stack** | Two Magic UI marquees running in opposite directions, monochrome logos (Simple Icons, CC0) that pause on hover; a grouped list below for screen readers and scanning |
| 7 | **Activity** | Small Tremor panel: GitHub contribution tracker + LeetCode solved by difficulty. Data fetched at build time into JSON so nothing hits APIs at runtime |
| 8 | **Contact** | Huge *"Let's build something."* A magnetic email button copies the address (toast + Lottie tick). Links list with arrow-slide hover. Short form; on success, a single small tsParticles confetti burst |
| 9 | **Footer** | Local time, © 2026, back-to-top, "Built with…" line |
| — | **CV** | shadcn Sheet from the right, drag down/right to dismiss (use-gesture), Print/PDF button |

---

## 4. Every library in `references.txt`, and what we do with it

Minimal and premium means each tool earns its place. ✅ use · ◐ use in one place · ✗ skip (reason given).

| Library | Verdict | Where / why |
|---|---|---|
| **tilde-nlp/website-translator** | ◐ decide | It needs a Tilde client ID and service URL (a hosted MT service). Alternative: hand-written EN / বাংলা / हिन्दी JSON is higher quality and free for a site this small. **Your call** |
| **Immersive Translate** | ✗ | A visitor-side browser extension, not something a site embeds. We just keep markup semantic so it works well for anyone who uses it |
| **open-glass-ui** (React) | ◐ | Fallback glass for the nav on browsers where WebGL glass is off |
| **ybouane/liquidglass** (WebGL) | ◐ | The nav pill only: real refraction + chromatic edge. One element, so it stays premium rather than gimmicky |
| **Liquid-Glass-CSS** (SVG displacement) | ✗ | Couldn't find this repo; SVG displacement glass is Chromium-only anyway. Covered by the two above |
| **shadcn/ui** | ✅ | Base primitives: Dialog, Sheet (CV), Command (⌘K, built on `cmdk`), Tooltip, Sonner toasts, form inputs |
| **Aceternity UI** | ◐ | Card spotlight (cursor-lit border) on project preview cards. Nothing else; their beams/sparkles would fight the minimal look |
| **Magic UI** | ✅ | Marquee (stack), Number Ticker (stats), Border Beam on the CV button only |
| **React Bits** | ✅ | Magnet (CTA buttons), custom cursor (dot → ring on links → "View" label on projects), Click Spark off |
| **Tremor** | ◐ | Activity panel only (Tracker + BarList) |
| **Motion (Framer Motion)** | ✅ | Layout animations, `layoutId` shared element (project row → case-study header), AnimatePresence route transitions, springs |
| **Atropos.js** | ◐ | Tilt/parallax on the cursor-following project preview |
| **@use-gesture/react** | ✅ | Mobile project rail drag, CV sheet drag-to-dismiss, magnetic button math |
| **React Three Fiber + Drei** | ✗ | You asked for all 3D models gone; R3F would be ~150 KB for one shader. OGL does that job at a fraction of the size |
| **Curtains.js** | ✗ | Maintenance mode. Its hover-ripple effect is done with OGL on the case-study hero image instead |
| **OGL** | ◐ | Hero grain/noise shader + case-study image hover distortion. Lazy-loaded, paused off-screen |
| **Rive** | ◐ optional | `HB` monogram that draws itself in the preloader, if we author a `.riv` in the Rive editor; otherwise an SVG stroke animation |
| **lottie-web** | ◐ | 2–3 micro icons: copy → tick, menu ↔ close, theme sun ↔ moon |
| **Lenis** | ✅ | Global smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync |
| **Ukiyo.js** | ◐ | Portrait parallax in About |
| **tsParticles** | ◐ | A single confetti burst on contact-form success. Loaded only at that moment |
| **SplitType** | ✅ | Splits headlines into lines/words/chars for every text reveal |
| **GSAP** | ✅ | ScrollTrigger (word-opacity scrub, pinned sections, progress line), preloader timeline, page-transition curtain. GSAP is fully free now, including SplitText |
| **Arwes** | ✗ | Cyberpunk glow contradicts the direction. One nod: the ⌘K palette's output uses mono + a blinking caret |
| **Baffle.js** | ✅ | Character-scramble on nav hover, section labels on enter, and the `FzAlpha` handle. A small, fitting systems-hacker touch |
| **awesome-claude-design** | ✅ | Start from a Linear/Vercel-style `DESIGN.md` template, customise it with the tokens in §2, and commit it at the root so every later change stays on-system |
| **Preline / FlyonUI / Tailgrids** | ✗ install, ✅ reference | Used only as wireframe references for section layouts. Installing them alongside shadcn would mean two competing design systems |

### Transitions & animation catalogue
- **Text:** line-mask rise (headlines) · word-opacity scrub (statement) · character scramble (labels/nav) · counter roll (stats, preloader)
- **Page:** curtain wipe (GSAP) + `layoutId` shared element for home → case study; View Transitions API circular reveal for the theme toggle
- **Scroll:** Lenis smoothing · pinned section with a progress hairline · section-label scramble on enter · parallax portrait · marquee speed nudged by scroll velocity
- **Micro:** magnetic CTAs · cursor states · arrow-slide links · spotlight borders · Atropos tilt · Lottie icon morphs · toast slide-in · confetti on send
- **Reduced motion:** all of the above collapse to simple opacity fades; Lenis and the shaders turn off

---

## 5. Stack

- **Vite 7 + React 19 + TypeScript**, React Router for `/work/:slug`, static build (deploys anywhere)
- **Tailwind CSS v4** with tokens from `DESIGN.md` as CSS variables; shadcn/ui components copied into `src/components/ui`
- Fonts self-hosted via `@fontsource` (Geist, Geist Mono, Instrument Serif)
- `src/content/` is the single source of truth for all text (typed), ready for i18n
- **Budget:** under 120 KB gzip initial JS. OGL, Atropos, Tremor, tsParticles, Lottie, liquidglass and the ⌘K palette are all dynamically imported. Target Lighthouse ≥ 95 on all four scores; LCP < 1.8 s

---

## 6. What gets deleted

| Path | Notes |
|---|---|
| `src/acts/`, `src/engine/`, `src/ui/`, `src/main.js`, `src/styles.css` | All replaced. The terminal command text gets ported into the ⌘K palette first |
| `public/audio/`, `public/env/`, `public/film/`, `public/models/` (67 MB), `public/stills/`, `public/fonts/` | No sound, video, 3D, or old fonts |
| `blender/`, `modelss/`, `scripts/` | Blender scenes, render logs, raw models, model-compression scripts |
| `three`, `@gltf-transform/cli`, `sharp` override | Dependencies no longer needed |
| `index.html`, `README.md`, `.claude/launch.json` | Rewritten |

⚠ `blender/` and `public/film/` are **untracked**, so git cannot bring them back once deleted. Before deleting anything I'll commit the current state and tag it `v2-cinematic`. I recommend moving `blender/` and `modelss/` to a folder outside the repo rather than deleting them.

---

## 7. Build phases

1. **Safety snapshot:** commit + tag `v2-cinematic`; move untracked heavy assets out of the repo
2. **Teardown + scaffold:** delete §6, set up Vite/React/TS/Tailwind/shadcn, `DESIGN.md`, tokens, fonts
3. **Content layer:** `src/content/*.ts` from §1; restore the portrait
4. **Static layout:** every section, responsive (375 → 1920), light/dark, no motion yet
5. **Motion system:** Lenis + GSAP + SplitType reveals, preloader, route transitions, reduced-motion path
6. **Signature interactions:** cursor, magnetic buttons, Baffle, project hover preview + Atropos, liquid-glass nav, ⌘K palette, CV sheet
7. **Extras:** OGL hero shader, Tremor activity (build-time fetch), Lottie icons, tsParticles, translation
8. **Polish:** accessibility (focus rings, keyboard, contrast), performance budget, SEO/OG image, 404, deploy

## 8. Open decisions

1. Translation: Tilde widget (hosted, needs an account) **or** hand-written EN/BN/HI?
2. Accent: signal orange **or** phosphor green?
3. Default theme: light (more editorial) **or** dark?
4. Untracked `blender/` + `modelss/`: move outside the repo **or** delete permanently?
5. Contact form: keep `mailto:` **or** use a free form backend (Web3Forms/Formspree) so messages actually arrive?
