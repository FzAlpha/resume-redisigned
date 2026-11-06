// ACT IV — TERMINAL. K-2SO powers on, watches your cursor, and reacts to your commands.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { findNode, smooth, track } from './util.js';

export default {
  id: 'terminal', nav: 'terminal-section', hud: ['Act IV', 'The Machine'],
  models: ['k2so'],
  mix: { epic: 0, calm: 0.22 },
  mood: {
    sky: { top: '#0d0306', bottom: '#000000', glow: '#3a060c', dir: [-0.6, 0.2, -1] },
    dust: { color: '#ff6b74', opacity: 0.18 },
    key: { color: '#dfe6ff', intensity: 2.4, pos: [-3, 4, 6] },
    rim: { color: '#ff3b47', intensity: 6, pos: [3, 3, -4] },
    fill: { sky: '#1d0a10', ground: '#000000', intensity: 0.35 },
    env: 0.9, exposure: 1.05,
    bloom: { strength: 0.9, threshold: 0.55, radius: 0.45 },
    tint: '#fff4f4',
  },

  build(ctx) {
    const gltf = ctx.assets.get('k2so');
    this.root = new THREE.Group();
    this.model = gltf.scene;
    this.root.add(this.model);
    fitModel(this.model, { size: 3.3, axis: 'y', anchor: 'bottom' });
    this.mixer = new THREE.AnimationMixer(this.model);
    // Keep the idle body motion but hold the head still: drop the neck / head / eye tracks.
    const src = gltf.animations[0];
    if (src) {
      this.clip = src.clone();
      this.clip.tracks = this.clip.tracks.filter((t) => !/^(neck|head|l_eye|r_eye)/.test(t.name));
      this.mixer.clipAction(this.clip).play();
    }

    this.head = findNode(this.model, (o) => /^head_\d+$/.test(o.name));
    this.headBase = this.head?.quaternion.clone();
    this.nod = 0;

    // Where the head sits (root space) — the camera frames around it.
    this.mixer.update(0);
    this.model.updateMatrixWorld(true);
    this.headPos = this.head ? this.head.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 3, 0);

    // Eye / light materials: anything emissive gets a power-on animation.
    this.emissive = [];
    this.model.traverse((o) => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m.emissive && (m.emissiveMap || m.emissive.getHex() !== 0)) this.emissive.push({ m, base: m.emissiveIntensity || 1 }); });
      }
    });
    this.power = 0;
    this.powerT = -1;

    this.eyeLight = new THREE.PointLight(0xffffff, 0, 3, 2);
    this.root.add(this.eyeLight);

    this.root.visible = false;
    ctx.stage.scene.add(this.root);

    ctx.events.addEventListener('terminal:command', () => {
      this.nod = 1;
      ctx.audio.chirp();
    });
  },

  enter(ctx, dir) {
    if (!this.root) return;
    this.root.visible = true;
    if (this.power < 1) {
      this.powerT = 0;
      ctx.audio.play('power-on', { volume: 0.8 });
    }
  },
  leave() { if (this.root) this.root.visible = false; },

  update(p, dt, t, ctx) {
    const { stage } = ctx;
    const portrait = stage.isPortrait;
    const x = portrait ? 0 : -2.1;
    this.root.position.x = x;
    this.mixer.update(dt);

    // Power-on flicker.
    if (this.powerT >= 0) {
      this.powerT += dt;
      const f = this.powerT;
      this.power = f < 1.2 ? (Math.random() > 0.55 ? Math.min(1, f) : 0.05) : 1;
      if (f > 1.4) this.powerT = -1;
    }
    for (const { m, base } of this.emissive) m.emissiveIntensity = base * (0.05 + this.power * 1.6);

    // Head holds still; it only gives one short nod when a command runs.
    if (this.head && this.headBase) {
      this.nod = Math.max(0, this.nod - dt * 2.5);
      this.head.quaternion.copy(this.headBase)
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(this.nod * Math.PI) * 0.18, 0, 0)));
      this.head.getWorldPosition(this.eyeLight.position);
      this.root.worldToLocal(this.eyeLight.position);
      this.eyeLight.position.z += 0.35;
      this.eyeLight.intensity = this.power * 1.4;
    }

    // Camera: low close-up on the eyes as he powers on → arc to a 3/4 view → high wide shot.
    const hx = x + this.headPos.x, hy = this.headPos.y, hz = this.headPos.z;
    const v = track(portrait ? [
      { p: 0, pos: [hx + 0.3, hy - 0.35, hz + 2.4], look: [hx, hy - 0.35, hz], fov: 32, roll: -0.05 },
      { p: 0.4, pos: [hx + 1.8, hy - 0.6, hz + 6.5], look: [hx, hy - 1.2, hz], fov: 34, roll: 0 },
      { p: 1, pos: [hx - 0.8, hy + 0.6, hz + 8.5], look: [hx, hy - 1.5, hz], fov: 34, roll: 0.02 },
    ] : [
      { p: 0, pos: [hx + 0.7, hy - 0.45, hz + 1.9], look: [hx + 0.35, hy - 0.05, hz], fov: 30, roll: -0.06 },
      { p: 0.35, pos: [hx + 3.4, hy - 0.4, hz + 3.6], look: [hx + 1.5, hy - 0.7, hz], fov: 34, roll: 0 },
      { p: 0.7, pos: [hx + 1.4, hy + 0.5, hz + 6.4], look: [hx + 1.8, hy - 1.0, hz], fov: 34, roll: 0.02 },
      { p: 1, pos: [hx + 0.6, hy + 1.0, hz + 6.4], look: [hx + 1.7, hy - 1.2, hz], fov: 36, roll: 0.03 },
    ], p, (this._pos ||= new THREE.Vector3()), (this._look ||= new THREE.Vector3()));
    stage.shot(this._pos, this._look, v.fov, v.roll);
    // Arrive from the white portal flash.
    stage.grade.uniforms.uFlash.value = 0.9 * (1 - smooth(0, 0.08, p));
    stage.grade.uniforms.uFade.value = smooth(0.95, 1, p);
  },
};
