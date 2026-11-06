// ACT III — PROJECTS. The prosthetic arm moves as you scroll; each project slides in.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { lerp, smooth, track } from './util.js';

export default {
  id: 'projects', nav: 'projects', hud: ['Act III', 'The Craft'],
  models: ['arm'],
  mix: { epic: 0, calm: 0.34 },
  mood: {
    sky: { top: '#03121a', bottom: '#010203', glow: '#0b3a4a', dir: [0.5, 0.3, -1] },
    dust: { color: '#6ee7ff', opacity: 0.4 },
    key: { color: '#e8f1ff', intensity: 2.2, pos: [5, 4, 5] },
    rim: { color: '#5fd4ff', intensity: 5, pos: [-4, 3, -4] },
    fill: { sky: '#123040', ground: '#020305', intensity: 0.4 },
    env: 1.0, exposure: 1.05,
    bloom: { strength: 0.75, threshold: 0.55, radius: 0.5 },
    tint: '#eefbff',
  },

  build(ctx) {
    const gltf = ctx.assets.get('arm');
    this.root = new THREE.Group();
    this.pivot = new THREE.Group();
    this.root.add(this.pivot);
    this.pivot.add(gltf.scene);
    fitModel(gltf.scene, { size: 3.6, axis: 'y' });
    this.pivot.position.y = 1.8;
    this.mixer = new THREE.AnimationMixer(gltf.scene);
    const c = gltf.animations[0];
    if (c) {
      this.action = this.mixer.clipAction(c);
      this.action.play();
      this.action.paused = true;
      this.duration = c.duration;
    }
    this.scrub = 0;
    this.lastServo = 0;
    this.servoAccum = 0;

    this.glow = new THREE.PointLight(0x4fe0ff, 0, 4, 1.5);
    this.glow.position.set(0, 1.5, 0.6);
    this.root.add(this.glow);

    this.root.visible = false;
    ctx.stage.scene.add(this.root);
    this.bar = document.getElementById('project-progress-bar');
  },

  enter() { if (this.root) this.root.visible = true; },
  leave() { if (this.root) this.root.visible = false; },

  update(p, dt, t, ctx) {
    const { stage, audio } = ctx;
    const portrait = stage.isPortrait;
    const x = portrait ? 0 : 1.9;
    this.root.position.x = x;

    // Scrub the arm's own animation with the scroll (smoothed).
    if (this.action) {
      const target = p * this.duration * 0.98;
      const prev = this.scrub;
      this.scrub += (target - this.scrub) * (1 - Math.exp(-5 * dt));
      this.action.time = this.scrub;
      this.mixer.update(0);
      this.servoAccum += Math.abs(this.scrub - prev);
      if (this.servoAccum > 0.9 && t - this.lastServo > 0.6) {
        this.servoAccum = 0;
        this.lastServo = t;
        audio.play('servo', { volume: 0.32, rate: 0.85 + Math.random() * 0.3 });
      }
    }
    this.pivot.rotation.y = lerp(-0.7, 0.9, p) + Math.sin(t * 0.4) * 0.05;

    const ang = lerp(-0.35, 0.35, p);
    const r = portrait ? 8.5 : lerp(6.4, 5.4, smooth(0, 0.5, p));
    track([
      { p: 0, pos: [x + Math.sin(ang) * r - (portrait ? 0 : 1.7), 2.2, Math.cos(ang) * r], look: [x - (portrait ? 0 : 1.7), 2.0, 0], fov: 34 },
      { p: 1, pos: [x + Math.sin(ang) * r - (portrait ? 0 : 1.7), 1.6, Math.cos(ang) * r], look: [x - (portrait ? 0 : 1.7), 1.7, 0], fov: 34 },
    ], p, (this._pos ||= new THREE.Vector3()), (this._look ||= new THREE.Vector3()));
    if (portrait) { this._look.y -= 1.1; this._pos.y -= 0.6; }
    stage.shot(this._pos, this._look, 34, 0);

    this.glow.intensity = 2.5 + Math.sin(t * 3) * 0.6;
    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.04, p) + smooth(0.97, 1, p);
    if (this.bar) this.bar.style.transform = `scaleX(${p})`;
  },
};
