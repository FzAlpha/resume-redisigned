# Hritabrata Bardhan — portfolio (v3)

Minimal, typography-led portfolio. Design system: [`DESIGN.md`](DESIGN.md) · roadmap: [`REDESIGN_PLAN.md`](REDESIGN_PLAN.md).

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + static build into dist/
npm run preview   # serve the build
```

## Structure

```
src/
  content/        all copy — profile, projects, skills, contact, ⌘K commands
  components/ui/  shadcn/ui primitives (copied source, styled to DESIGN.md)
  components/     site components
  pages/          Home, Work (/work/:slug), NotFound
  lib/            utils, theme
  index.css       design tokens + Tailwind v4 theme
```

Edit text in `src/content/*`. Edit colours, type and motion tokens in `DESIGN.md` first, then mirror them in `src/index.css`.

## History

The previous cinematic WebGL version is tagged `v2-cinematic`. Its Blender scenes, raw models and rendered films are archived outside the repo in `../resume-archive-cinematic/`.
