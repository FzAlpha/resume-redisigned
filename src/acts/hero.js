// PROLOGUE + HERO — boot sequence, wings opening in the dark, title card.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { lerp, smooth, track } from './util.js';

const BOOT_LINES = [
  ['dim', '[    0.000000] Linux version 6.x-fzalpha (gcc) #1 SMP PREEMPT'],
  ['', '[    0.004211] Command line: BOOT_IMAGE=/vmlinuz-hritabrata root=/dev/soul rw quiet'],
  ['', '[    0.118734] CPU: C++ / C / Python / Java — all cores online'],
  ['', '[    0.230019] Mounting /dev/hritabrata on / ...'],
  ['ok', '[  OK  ] Started Arch Linux userspace.'],
  ['ok', '[  OK  ] Reached target Hyprland Session.'],
  ['', '[    0.512870] Loading scenes: wings, butterfly ...'],
  ['warn', '[  WARN ] Low-level systems detected. Proceeding anyway.'],
  ['ok', '[  OK  ] Started From Silicon to Soul.'],
];

export default {
  id: 'hero', nav: 'home', hud: ['Prologue', ''],
  models: ['wings'],
  mix: { epic: 0.42, calm: 0 },
  mood: {
    sky: { top: '#04060c', bottom: '#000000', glow: '#13254a', dir: [0, 0.35, -1] },
    dust: { color: '#9cb8ff', opacity: 0.35 },
    key: { color: '#7d9cff', intensity: 0.35, pos: [3, 4, 6] },
    rim: { color: '#ffd8a0', intensity: 4.5, pos: [0, 2.6, -4] },
    fill: { sky: '#1b2a4a', ground: '#000000', intensity: 0.25 },
    env: 0.12, exposure: 1.0,
    bloom: { strength: 0.6, threshold: 0.78, radius: 0.5 },
    tint: '#ffffff',
  },

  build(ctx) {
    const { assets, stage } = ctx;
    this.root = new THREE.Group();

    const wings = assets.get('wings').scene;
    this.wings = new THREE.Group();
    this.wings.add(wings);
    fitModel(wings, { size: 3.6, axis: 'x' });
    this.wings.position.set(0, 1.6, 0);
    wings.traverse((o) => {
      if (o.isMesh && o.material) { o.material.envMapIntensity = 0.25; o.material.color?.multiplyScalar(0.55); }
    });
    this.root.add(this.wings);

    // A soft glow card behind the wings gap — the "god light".
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture(), color: 0xffe2b0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    this.glow.scale.set(3.4, 3.4, 1);
    this.glow.position.set(0, 1.75, -0.6);
    this.root.add(this.glow);

    this.introT = -1;
    stage.scene.add(this.root);
  },

  /** Plays the timed opening. Resolves when the viewer has control. */
  playIntro(ctx, { skip } = {}) {
    const { ui, audio } = ctx;
    this.introT = 0;
    this.introDone = false;
    this.cues = new Set();
    document.body.classList.add('is-intro');
    ui.letterbox(true);
    return new Promise((resolve) => {
      this.finishIntro = () => {
        if (this.introDone) return;
        this.introDone = true;
        this.introT = -1;
        ui.boot(false);
        ui.titleCard(false);
        ui.letterbox(false);
        document.body.classList.remove('is-intro');
        ctx.stage.grade.uniforms.uFade.value = 0;
        ctx.stage.grade.uniforms.uFlash.value = 0;
        resolve();
      };
      if (skip) { this.finishIntro(); return; }
      // Boot log (DOM) — first 2.2 s.
      ui.boot(true);
      audio.play('boot', { volume: 0.5 });
      BOOT_LINES.forEach(([cls, line], i) => setTimeout(() => {
        if (this.introDone) return;
        ui.bootLine(line, cls);
        audio.beep(cls === 'ok' ? 1320 : cls === 'warn' ? 520 : 880, 0.025);
      }, 120 + i * 210));
    });
  },

  _cue(name, fn) { if (!this.cues.has(name)) { this.cues.add(name); fn(); } },

  /** Intro timeline, driven by real time. */
  intro(dt, ctx) {
    const { stage, ui, audio } = ctx;
    this.introT += dt;
    const t = this.introT;
    const g = stage.grade.uniforms;

    if (t > 2.2) this._cue('boot-off', () => { audio.play('glitch', { volume: 0.45 }); ui.boot(false); audio.mix({ epic: 0.55, calm: 0 }, 4); });
    g.uFade.value = 1 - smooth(2.4, 4.0, t);

    // Camera: slow push in on the wings.
    const push = smooth(2.2, 7.5, t);
    stage.shot(new THREE.Vector3(0, 1.7, lerp(11, 7.6, push)), new THREE.Vector3(0, 1.7, 0), 35);
    if (t < 2.3) stage.cut();

    // Back light blooms open.
    const light = smooth(2.6, 5.0, t);
    stage.lights.rim.intensity = lerp(0, 4.5, light);
    this.glow.material.opacity = 0.3 * light;
    if (t > 2.6) this._cue('wings', () => audio.play('wings', { volume: 0.7 }));

    // Impact + title card.
    if (t > 5.0) this._cue('impact', () => { audio.play('impact', { volume: 0.9, duck: 0.45 }); ui.titleCard(true); });
    g.uFlash.value = t > 5.0 ? Math.max(0, 0.7 - (t - 5.0) * 1.6) : 0;

    if (t > 8.4) this._cue('end', () => this.finishIntro());
    this._animate();
  },

  _animate() {
    this.wings.rotation.y = Math.sin(performance.now() * 0.0003) * 0.08;
  },

  enter() { this.root.visible = true; },
  leave() { this.root.visible = false; },

  update(p, dt, t, ctx) {
    if (this.introT >= 0) return this.intro(dt, ctx);
    const { stage, ui } = ctx;
    const portrait = stage.isPortrait;

    // Wings sit to the right of the copy on desktop, centred on phones.
    const x = portrait ? 0 : -1.9;
    const v = track([
      { p: 0, pos: [x, portrait ? 0.6 : 1.6, portrait ? 11.5 : 7.6], look: [x, portrait ? 0.15 : 1.6, 0], fov: 35 },
      { p: 0.55, pos: [x * 0.4, 1.7, 4.2], look: [0, 1.75, 0], fov: 38 },
      { p: 1, pos: [0, 1.75, 0.9], look: [0, 1.75, -2], fov: 48 },
    ], p, this._pos ||= new THREE.Vector3(), this._look ||= new THREE.Vector3());
    stage.shot(this._pos, this._look, v.fov, v.roll);

    stage.lights.rim.intensity = lerp(4.5, 9, smooth(0.4, 1, p));
    this.glow.material.opacity = lerp(0.3, 0.8, smooth(0.5, 1, p));
    stage.grade.uniforms.uFade.value = smooth(0.82, 1, p);
    ui.heroCopy(1 - smooth(0.08, 0.32, p));
    this._animate();
  },
};

export function radialTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
