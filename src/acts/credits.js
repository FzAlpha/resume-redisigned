// END CREDITS — the score fades, credits roll, the butterfly returns.
import * as THREE from 'three';
import { lerp, smooth } from './util.js';

export default {
  id: 'credits', nav: 'contact', hud: ['Credits', ''],
  models: [],
  companion: 'credits',
  mix: { epic: 0.38, calm: 0 },
  mood: {
    sky: { top: '#050508', bottom: '#000000', glow: '#0c1430', dir: [0, 0.4, -1] },
    dust: { color: '#9cb8ff', opacity: 0.45 },
    key: { color: '#ffffff', intensity: 0.5, pos: [2, 3, 5] },
    rim: { color: '#ffffff', intensity: 0.5, pos: [-2, 3, -5] },
    fill: { sky: '#111a33', ground: '#000000', intensity: 0.2 },
    env: 0.2, exposure: 1,
    bloom: { strength: 1.0, threshold: 0.4, radius: 0.7 },
    tint: '#ffffff',
  },

  build() {
    this.roll = document.getElementById('credits-roll');
  },
  enter() { this.flags = {}; },
  leave() {},

  update(p, dt, t, ctx) {
    const { stage, audio } = ctx;
    const pos = (this._pos ||= new THREE.Vector3());
    const look = (this._look ||= new THREE.Vector3());
    pos.set(0, lerp(1.5, 4, p), 7);
    look.set(0, lerp(1.6, 4.4, p), 0);
    stage.shot(pos, look, 40, 0);
    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.06, p);

    if (this.roll) {
      const travel = this.roll.scrollHeight - innerHeight;
      this.roll.style.transform = `translateY(${-p * travel}px)`;
    }
    if (p > 0.84 && !this.flags.end) {
      this.flags.end = true;
      audio.play('credits', { volume: 0.7 });
      audio.mix({ epic: 0.12 }, 6);
    }
    if (p < 0.8 && this.flags.end) { this.flags.end = false; audio.mix({ epic: 0.38 }, 2); }
  },
};
