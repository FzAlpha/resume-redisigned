// ACT I — ABOUT. The butterfly leads; the world turns to deep indigo.
import * as THREE from 'three';
import { lerp, smooth } from './util.js';

export default {
  id: 'about', nav: 'about', hud: ['Act I', 'Origin'],
  models: [],
  companion: 'fly',
  mix: { epic: 0, calm: 0.42 },
  mood: {
    sky: { top: '#08071a', bottom: '#020206', glow: '#1c1650', dir: [0.6, 0.2, -1] },
    dust: { color: '#b49cff', opacity: 0.7 },
    key: { color: '#9ab4ff', intensity: 0.8, pos: [3, 3, 5] },
    rim: { color: '#7fe6ff', intensity: 1.5, pos: [-3, 2, -4] },
    fill: { sky: '#241f55', ground: '#000000', intensity: 0.3 },
    env: 0.3, exposure: 1.0,
    bloom: { strength: 0.65, threshold: 0.6, radius: 0.55 },
    tint: '#f2f0ff',
  },

  build() {},
  enter(ctx) { ctx.ui.countStats(); },
  leave() {},

  update(p, dt, t, ctx) {
    const { stage } = ctx;
    // Slow lateral drift through a starfield, rising slightly.
    const pos = (this._pos ||= new THREE.Vector3());
    const look = (this._look ||= new THREE.Vector3());
    pos.set(lerp(-1.5, 1.5, p), lerp(1.2, 2.2, p), 6);
    look.set(lerp(-0.5, 2.5, p), lerp(1.4, 2.0, p), -4);
    stage.shot(pos, look, 40, lerp(0.02, -0.02, p));
    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.06, p) + smooth(0.94, 1, p);
  },
};
