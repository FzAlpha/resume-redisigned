// ACT I — ABOUT. "Enter his room": a 360° night-time room (Poly Haven "Hotel Room", re-graded).
// The camera turns from the moonlit window to the wall screen, which wakes up showing a
// neofetch-style readout. The butterfly flies through the room.
import * as THREE from 'three';
import { lerp, smooth, easeInOut, clamp } from './util.js';

const BASE = import.meta.env.BASE_URL;
const R = 30; // panorama radius

/** Direction for a pixel position (u, v in 0..1) on the equirectangular panorama. */
function dirFromUV(u, v) {
  const phi = u * Math.PI * 2, theta = v * Math.PI;
  return new THREE.Vector3(Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
}

// Where things are in the panorama (measured from the image).
const WINDOW = { u: 0.56, v: 0.54 };
const TV = { u: 0.3205, v: 0.4925, du: 0.105, dv: 0.121 };

function screenTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 576;
  const g = c.getContext('2d');
  g.fillStyle = '#05070d';
  g.fillRect(0, 0, c.width, c.height);
  // Arch-style logo
  g.fillStyle = '#1793d1';
  g.beginPath();
  g.moveTo(190, 110); g.lineTo(290, 400); g.lineTo(240, 380); g.lineTo(190, 260); g.lineTo(140, 380); g.lineTo(90, 400);
  g.closePath(); g.fill();
  g.font = '600 26px "JetBrains Mono", monospace';
  const lines = [
    ['#4f8cff', 'hritabrata@arch'],
    ['#6c6c84', '────────────────'],
    ['#e2bf7a', 'OS      ', 'Arch Linux'],
    ['#e2bf7a', 'WM      ', 'Hyprland'],
    ['#e2bf7a', 'Shell   ', 'zsh (starship)'],
    ['#e2bf7a', 'Editor  ', 'Neovim'],
    ['#e2bf7a', 'Langs   ', 'C++ · C · Python · Java'],
    ['#e2bf7a', 'Focus   ', 'Systems · DSA · AI agents'],
    ['#e2bf7a', 'Solved  ', '200+ DSA problems'],
  ];
  lines.forEach(([col, a, b], i) => {
    const y = 120 + i * 42;
    g.fillStyle = col; g.fillText(a, 340, y);
    if (b) { g.fillStyle = '#e6e9f2'; g.fillText(b, 340 + g.measureText(a).width, y); }
  });
  ['#ff5f57', '#febc2e', '#28c840', '#4f8cff', '#b49cff', '#6ee7ff'].forEach((col, i) => { g.fillStyle = col; g.fillRect(340 + i * 52, 510, 44, 22); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default {
  id: 'about', nav: 'about', hud: ['Act I', 'Origin'],
  models: [],
  companion: 'fly',
  mix: { epic: 0, calm: 0.42 },
  mood: {
    sky: { top: '#05060c', bottom: '#020206', glow: '#0c1430', dir: [0.6, 0.2, -1] },
    dust: { color: '#9cb8ff', opacity: 0.22 },
    key: { color: '#9ab4ff', intensity: 0.6, pos: [3, 3, 5] },
    rim: { color: '#7fe6ff', intensity: 1.0, pos: [-3, 2, -4] },
    fill: { sky: '#1a1f3a', ground: '#000000', intensity: 0.3 },
    env: 0.3, exposure: 1.0,
    bloom: { strength: 0.7, threshold: 0.62, radius: 0.55 },
    tint: '#f2f0ff',
  },

  build(ctx) {
    this.root = new THREE.Group();
    // Panorama sphere (inside-out), always centred on the camera.
    const geo = new THREE.SphereGeometry(R, 96, 48);
    geo.scale(-1, 1, 1);
    const tex = new THREE.TextureLoader().load(`${BASE}env/room-night.webp`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.room = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, depthWrite: false }));
    this.room.renderOrder = -1;
    this.root.add(this.room);

    // The wall screen: a glowing plane laid over the TV in the photo.
    const d = dirFromUV(TV.u, TV.v);
    const dist = R * 0.96;
    const w = 2 * dist * Math.tan((TV.du * Math.PI * 2) / 2);
    const h = 2 * dist * Math.tan((TV.dv * Math.PI) / 2);
    this.screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.94, h * 0.9),
      new THREE.MeshBasicMaterial({ map: screenTexture(), toneMapped: false, transparent: true, opacity: 0 }),
    );
    this.screen.position.copy(d.multiplyScalar(dist));
    this.screen.lookAt(0, 0, 0);
    this.room.add(this.screen);

    this.root.visible = false;
    ctx.stage.scene.add(this.root);
    this._look = new THREE.Vector3();
    this._pos = new THREE.Vector3();
  },

  enter(ctx) {
    if (this.root) this.root.visible = true;
    ctx.stage.sky.visible = false; // the room replaces the sky in this act
    ctx.ui.countStats();
    this.wokeAt = -1;
  },
  leave(ctx) {
    if (this.root) this.root.visible = false;
    if (ctx) ctx.stage.sky.visible = true;
  },

  update(p, dt, t, ctx) {
    const { stage, audio } = ctx;
    const portrait = stage.isPortrait;
    // Camera sits in the middle of the room.
    this._pos.set(0, 1.5, 0);
    this.room.position.copy(this._pos);
    stage.sky.visible = false;

    // Pan from the window (moonlight) to the wall screen, then lean in.
    // On desktop the subject sits right of centre so the cards on the left stay clear.
    const k = easeInOut(clamp((p - 0.05) / 0.6));
    // (looking at a smaller u turns the camera left, which moves the subject to the right of frame)
    const u = lerp(WINDOW.u, TV.u, k) - (portrait ? 0 : lerp(0.075, 0.032, k));
    // On phones the card fills the lower two-thirds, so look lower to lift the subject into the top third.
    const v = lerp(WINDOW.v, TV.v, k) + (portrait ? 0.13 : 0.01);
    const dir = dirFromUV(u, v);
    this._look.copy(this._pos).add(dir);
    const fov = lerp(portrait ? 75 : 62, portrait ? 62 : 50, smooth(0.55, 1, p));
    stage.shot(this._pos, this._look, fov, lerp(0.015, -0.01, p));

    // The screen wakes up as it comes into view.
    if (p > 0.45 && this.wokeAt < 0) { this.wokeAt = t; audio.beep(660, 0.04); audio.sparkle(0.7); }
    if (p < 0.3) this.wokeAt = -1;
    const on = this.wokeAt < 0 ? 0 : clamp((t - this.wokeAt) / 0.8);
    const flicker = on < 1 ? (Math.random() > 0.4 ? on : on * 0.2) : 1;
    // On phones the screen sits behind the title, so it glows softer to keep the title readable.
    this.screen.material.opacity = flicker * (portrait ? 0.4 : 0.9) * (1 + Math.sin(t * 7) * 0.02);

    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.06, p) + smooth(0.94, 1, p);
  },
};
