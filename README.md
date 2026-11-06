# From Silicon to Soul — Hritabrata Bardhan's portfolio

A scroll-driven short film. One WebGL stage sits behind the page; every section is an act with its own 3D model, lighting, camera moves and sound.

| Act | Section | Model |
|---|---|---|
| Prologue | Home | The Queen of Swords with angel wings, a feather storm that bursts on the title card |
| I | About | A 360° night room (Poly Haven HDRI) — the wall screen wakes with a neofetch readout; the butterfly flies through |
| II | Skills | Infinian — hover a skill card to trigger a skill animation |
| III | Projects | Robotic Prosthetic Arm — its animation is scrubbed by scrolling |
| Intermission | — | Angel assembles, camera flies through the halo |
| IV | Terminal | K-2SO — powers on, holds steady, nods when you run a command |
| Finale | Contact | Astraía — six hands hold the six contact links |
| Credits | Footer | Model / music attributions |

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/ (upload dist/ anywhere)
npm run preview   # serve the built site
```

## How it works

- **Sound** — visitors are asked on every visit. Two music beds (`public/audio/score-*.mp3`) crossfade per act; effects duck the music. Small UI sounds are synthesized in `src/engine/audio.js`.
- **Downloads** — `src/engine/assets.js` downloads all models in parallel in story order; the next act always jumps the queue. The reel (bottom-left) shows progress.
- **Quality tiers** — `hd` (desktop, 2048px textures), `sd` (phones, 1024px), `still` (weak devices / no WebGL: pre-rendered images from `public/stills/`). A frame-rate watchdog downgrades automatically. Force one with `?tier=hd|sd|still`.
- **Models** — originals live in `modelss/` (not committed). `npm run models` recompresses them into `public/models/hd` and `public/models/sd`.
- **Room** — `node scripts/convert-room.mjs` turns the Hotel Room HDRI (`modelss/model 11`) into the night-graded panorama `public/env/room-night.webp`.

## Dev helpers (dev server only)

- `?skip&act=skills&p=0.5` — enter silently, skip the intro, jump to an act at a scroll position (0–1).
- `?skip&capture` — re-render the fallback stills into `public/stills/` (run once at desktop size and once at phone size).

## Credits

3D models from Sketchfab (CC BY 4.0 unless noted — see the end credits on the site). Music and sound effects from Mixkit under the Mixkit Free License.
