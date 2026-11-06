// THE DIRECTOR — runs the film: sound gate, intro, scroll → act mapping, background
// downloads, lazy scene building, sound mixes and the low-power fallback.
import { Stage } from './engine/stage.js';
import { AssetDirector, ACT_ORDER, detectTier } from './engine/assets.js';
import { SoundDirector } from './engine/audio.js';
import { UI } from './ui/ui.js';
import { initTerminal } from './ui/terminal.js';
import { Companion } from './acts/companion.js';
import { clamp } from './acts/util.js';
import hero from './acts/hero.js';
import about from './acts/about.js';
import skills from './acts/skills.js';
import projects from './acts/projects.js';
import intermission from './acts/intermission.js';
import terminal from './acts/terminal.js';
import contact from './acts/contact.js';
import credits from './acts/credits.js';

const BASE = import.meta.env.BASE_URL;
const ACTS = [hero, about, skills, projects, intermission, terminal, contact, credits];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

let tier = detectTier();
document.body.classList.add(`tier-${tier}`);

const events = new EventTarget();
const audio = new SoundDirector();
const ui = new UI(audio);
initTerminal({ audio, events });
audio.onchange = (on) => ui.soundButton(on);

const assets = new AssetDirector(tier, { concurrency: tier === 'hd' ? 3 : 2 });
assets.addEventListener('progress', (e) => ui.reel(e.detail.list));
ui.reel([...assets.items.values()]);

// ------------------------------------------------------------------ acts
for (const act of ACTS) {
  act.el = document.querySelector(`[data-act="${act.id}"]`);
  act.built = false;
  act.building = false;
  act.p = 0;
}

let stage = null;
let ctx = null;
let companion = null;
if (tier !== 'still') {
  try {
    stage = new Stage(document.getElementById('stage'), { tier });
    ctx = { stage, assets, audio, ui, events };
    companion = new Companion(ctx);
  } catch (err) {
    console.warn('[stage] WebGL failed, using stills', err);
    switchToStills();
  }
}
assets.start();

// ------------------------------------------------------------- geometry
let layout = [];
function measure() {
  layout = ACTS.map((a) => ({ act: a, top: a.el.offsetTop, height: a.el.offsetHeight }));
}
measure();
addEventListener('resize', measure);
document.fonts?.ready.then(measure);

function readScroll() {
  const y = scrollY, vh = innerHeight, mid = y + vh * 0.5;
  let active = layout[0].act;
  for (const L of layout) {
    L.act.p = clamp((y - L.top) / Math.max(1, L.height - vh));
    if (mid >= L.top) active = L.act;
  }
  return active;
}

// ----------------------------------------------------------- scene build
function modelsDownloaded(act) { return act.models.every((m) => assets.isDownloaded(m)); }

async function ensureBuilt(act) {
  if (act.built || act.building || !ctx) return;
  if (act.models.length && !modelsDownloaded(act)) return;
  act.building = true;
  try {
    await Promise.all(act.models.map((m) => assets.prepare(m)));
    act.build(ctx);
    act.built = true;
    if (act === current) act.enter(ctx, 1);
  } catch (err) {
    console.error('[director] could not build', act.id, err);
  } finally {
    act.building = false;
  }
}

async function ensureCompanion() {
  if (!companion || companion.ready || companion.building || !assets.isDownloaded('butterfly')) return;
  companion.building = true;
  await assets.prepare('butterfly');
  companion.build();
}

// ----------------------------------------------------------- act switch
let current = null;
function switchAct(next) {
  const prev = current;
  const dir = prev ? Math.sign(ACTS.indexOf(next) - ACTS.indexOf(prev)) || 1 : 1;
  if (prev) {
    if (prev.built && ctx) prev.leave(ctx);
    ui.hideReveals(prev.el);
  }
  current = next;
  assets.focus(next.id);
  ui.setNav(next.nav);
  ui.hud(...next.hud);
  audio.mix(next.mix, 2.2);
  if (next.built && ctx) next.enter(ctx, dir);
  if (tier === 'still') showStill(next.id);
}

// ------------------------------------------------------------ fallback
function showStill(id) {
  const layer = document.getElementById('still-layer');
  const name = innerHeight > innerWidth ? `${id}-p` : id;
  let img = layer.querySelector(`[data-still="${name}"]`);
  if (!img) {
    img = document.createElement('img');
    img.dataset.still = name;
    img.alt = '';
    img.src = `${BASE}stills/${name}.webp`;
    img.onerror = () => img.remove();
    layer.appendChild(img);
  }
  layer.querySelectorAll('img').forEach((i) => i.classList.toggle('is-on', i === img));
}

function switchToStills() {
  tier = 'still';
  document.body.classList.remove('tier-hd', 'tier-sd');
  document.body.classList.add('tier-still');
  ui.sceneWait(false);
  if (current) showStill(current.id);
}

// FPS watchdog: downgrade, then fall back to stills if the device really struggles.
const fps = { acc: 0, frames: 0, strikes: 0, downgraded: false };
function watchdog(dt) {
  if (!stage || document.hidden || hero.introT >= 0) return;
  fps.acc += dt; fps.frames++;
  if (fps.acc < 3) return;
  const avg = fps.frames / fps.acc;
  fps.acc = 0; fps.frames = 0;
  if (avg < 28 && !fps.downgraded) {
    fps.downgraded = true;
    stage.bloom.enabled = false;
    stage.pixelRatio = 1;
    stage.renderer.setPixelRatio(1);
    stage.resize();
  } else if (avg < 16) {
    if (++fps.strikes >= 2) { switchToStills(); ui.toast('Switched to lightweight mode for smoother playback'); }
  } else fps.strikes = 0;
}

// ------------------------------------------------------------ the loop
// In development a hidden preview pane pauses rAF; fall back to a timer so testing still works.
const nextFrame = (cb) => {
  let fired = false;
  const go = () => { if (!fired) { fired = true; cb(performance.now()); } };
  requestAnimationFrame(go);
  if (import.meta.env.DEV) setTimeout(go, 50);
};
let last = performance.now();
let filmStarted = false;
function frame(now) {
  nextFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;

  const act = readScroll();
  if (filmStarted && act !== current) switchAct(act);
  if (filmStarted && current) ui.reveal(current.el, current.p);

  if (!stage || tier === 'still') return;

  // Build the current and the next act as soon as their models arrive.
  const i = ACTS.indexOf(current || hero);
  [ACTS[i], ACTS[i + 1], ACTS[i - 1]].forEach((a) => a && ensureBuilt(a));
  ensureCompanion();

  const g = stage.grade.uniforms;
  g.uFlash.value = 0;
  g.uAberration.value = 0.0015;
  g.uGrain.value = reducedMotion ? 0.03 : 0.06;

  const a = current || hero;
  const waiting = filmStarted && !a.built;
  ui.sceneWait(waiting, a.models.length ? `Loading ${a.hud[1] || a.hud[0]}` : 'Loading');
  if (a.built) {
    stage.setMood(a.mood, 1 - Math.exp(-2.2 * dt));
    a.update(a.p, dt, t, ctx);
  } else {
    g.uFade.value = 1;
  }

  if (companion?.ready) {
    const mode = !filmStarted || hero.introT >= 0 ? 'hidden'
      : a.companion || (a === hero && a.p < 0.3 ? 'perch' : 'hidden');
    companion.setMode(mode);
    companion.update(dt, t, a.id, a.p);
  }

  stage.render(dt, t, { parallax: reducedMotion ? 0 : 1 });
  watchdog(dt);
}
nextFrame(frame);

// ------------------------------------------------------------ the gate
function waitFor(cond) {
  return new Promise((res) => { const tick = () => (cond() ? res() : nextFrame(tick)); tick(); });
}

async function startFilm(withSound) {
  audio.setEnabled(withSound);
  ui.soundButton(withSound);
  const gate = document.getElementById('gate');
  gate.classList.add('is-gone');
  document.body.classList.remove('is-gated');
  setTimeout(() => gate.remove(), 1200);
  window.scrollTo(0, 0);

  current = hero;
  ui.setNav('home');
  ui.hud(...hero.hud);
  audio.mix({ epic: 0, calm: 0 }, 0.1);

  if (tier !== 'still' && stage) {
    ui.sceneWait(true, 'Loading opening scene');
    await waitFor(() => hero.built || tier === 'still');
    ui.sceneWait(false);
  }
  filmStarted = true;
  if (tier !== 'still' && stage) {
    await hero.playIntro(ctx, { skip: reducedMotion });
  } else {
    showStill('hero');
    await stillIntro();
  }
  audio.mix(hero.mix, 3);
}

/** Short version of the opening for the stills mode. */
function stillIntro() {
  return new Promise((resolve) => {
    document.body.classList.add('is-intro');
    ui.letterbox(true);
    ui.titleCard(true);
    audio.play('impact', { volume: 0.8 });
    audio.mix({ epic: 0.5 }, 3);
    const done = () => { ui.titleCard(false); ui.letterbox(false); document.body.classList.remove('is-intro'); resolve(); };
    stillIntro.skip = done;
    setTimeout(done, reducedMotion ? 600 : 3800);
  });
}

document.getElementById('gate-sound').addEventListener('click', () => startFilm(true), { once: true });
document.getElementById('gate-silent').addEventListener('click', () => startFilm(false), { once: true });
document.getElementById('sound-toggle').addEventListener('click', () => {
  audio.toggle();
  if (audio.enabled && current) audio.mix(current.mix, 1.5);
});
document.getElementById('skip-intro').addEventListener('click', () => {
  if (hero.finishIntro) hero.finishIntro();
  stillIntro.skip?.();
});
document.getElementById('replay-btn').addEventListener('click', async () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  switchAct(hero);
  audio.mix({ epic: 0, calm: 0 }, 0.6);
  if (tier !== 'still' && hero.built) await hero.playIntro(ctx);
  else await stillIntro();
  audio.mix(hero.mix, 3);
});

// Development helpers: window.__film, and ?skip[&act=id&p=0.5] to jump straight into a scene.
if (import.meta.env.DEV) {
  const goAct = (id, p = 0.5) => {
    const a = ACTS.find((x) => x.id === id);
    if (a) window.scrollTo(0, a.el.offsetTop + p * (a.el.offsetHeight - innerHeight));
  };
  window.__film = { ACTS, assets, audio, goAct, get stage() { return stage; }, ACT_ORDER };
  const q = new URLSearchParams(location.search);
  if (q.has('skip')) {
    startFilm(q.has('sound'));
    waitFor(() => hero.introT >= 0 || tier === 'still').then(() => {
      hero.finishIntro?.();
      stillIntro.skip?.();
      if (q.get('act')) setTimeout(() => goAct(q.get('act'), Number(q.get('p') ?? 0.5)), 300);
      if (q.has('capture')) captureStills();
    });
  }

  // ?skip&capture renders one frame per act into public/stills/ (fallback for weak devices).
  async function captureStills() {
    const SHOTS = { hero: 0.02, about: 0.85, skills: 0.62, projects: 0.62, intermission: 0.66, terminal: 0.4, contact: 0.55, credits: 0.3 };
    const WAIT = { skills: 8000 }; // let Infinian finish his spawn
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const suffix = innerHeight > innerWidth ? '-p' : '';
    for (const a of ACTS) {
      goAct(a.id, SHOTS[a.id]);
      await waitFor(() => a.built);
      await sleep(WAIT[a.id] || 3500);
      stage.render(0.016, performance.now() / 1000);
      const blob = await new Promise((r) => stage.renderer.domElement.toBlob(r, 'image/webp', 0.8));
      await fetch(`/__capture/${a.id}${suffix}`, { method: 'POST', body: blob });
      console.log('[capture]', a.id + suffix, blob.size);
    }
    console.log('[capture] done');
  }
}
