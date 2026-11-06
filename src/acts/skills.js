// ACT II — SKILLS. Infinian spawns; hovering a skill card makes it answer with a skill.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { clip, lerp, smooth, track } from './util.js';

const CARD_SKILLS = ['Skill01', 'Skill02', 'Skill04'];

export default {
  id: 'skills', nav: 'skills', hud: ['Act II', 'The Arsenal'],
  models: ['infinian'],
  mix: { epic: 0.55, calm: 0 },
  mood: {
    sky: { top: '#140d05', bottom: '#020203', glow: '#4a3010', dir: [0, 0.6, -1] },
    dust: { color: '#e2bf7a', opacity: 0.55 },
    key: { color: '#9db7ff', intensity: 1.2, pos: [4, 4, 6] },
    rim: { color: '#ffcf86', intensity: 5, pos: [-2, 5, -5] },
    fill: { sky: '#3a2a12', ground: '#05040a', intensity: 0.3 },
    env: 0.6, exposure: 1.0,
    bloom: { strength: 0.5, threshold: 0.82, radius: 0.45 },
    tint: '#fff6ea',
  },

  build(ctx) {
    const gltf = ctx.assets.get('infinian');
    this.root = new THREE.Group();
    this.model = gltf.scene;
    this.root.add(this.model);
    fitModel(this.model, { size: 3.3, axis: 'y', anchor: 'bottom' });
    this.mixer = new THREE.AnimationMixer(this.model);
    this.idle = this.mixer.clipAction(clip(gltf, 'CombatIdle'));
    const spawnClip = clip(gltf, '_Spawn');
    this.spawn = spawnClip && this.mixer.clipAction(spawnClip);
    if (this.spawn) { this.spawn.setLoop(THREE.LoopOnce, 1); this.spawn.clampWhenFinished = true; }
    this.skills = CARD_SKILLS.map((n) => {
      const c = clip(gltf, n);
      if (!c) return null;
      const a = this.mixer.clipAction(c);
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      return a;
    });
    this.mixer.addEventListener('finished', (e) => {
      if (e.action !== this.idle) this._toIdle(e.action);
    });
    this.idle.play();
    this.root.visible = false;
    ctx.stage.scene.add(this.root);

    // Gold halo disc on the floor.
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.18, 96),
      new THREE.MeshBasicMaterial({ color: 0xffcf86, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.ring = ring;
    this.root.add(ring);

    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('pointerenter', () => this.perform(Number(card.dataset.skill), ctx));
    });
  },

  _toIdle(from) {
    this.idle.reset().play();
    this.idle.crossFadeFrom(from, 0.5, false);
    this.busy = false;
  },

  perform(i, ctx) {
    ctx.audio.tick(0.8);
    const a = this.skills?.[i];
    if (!a || this.busy || !this.root?.visible || !this.spawned) return;
    this.busy = true;
    a.reset().play();
    a.crossFadeFrom(this.idle, 0.35, false);
    ctx.audio.play('portal', { volume: 0.35, rate: 0.8 + i * 0.12 });
  },

  enter(ctx) {
    if (!this.root) return;
    this.root.visible = true;
    if (!this.spawned && this.spawn) {
      this.spawned = true;
      this.busy = true;
      this.spawn.reset().play();
      this.idle.stop();
      ctx.audio.play('choir-angel', { volume: 0.8, duck: 0.4 });
    } else this.spawned = true;
  },
  leave() { if (this.root) this.root.visible = false; },

  update(p, dt, t, ctx) {
    const { stage } = ctx;
    const portrait = stage.isPortrait;
    const x = portrait ? 0 : 1.5;
    this.root.position.x = x;
    const v = track([
      { p: 0, pos: [x + 0.4, 0.35, 3.4], look: [x, 2.6, 0], fov: 42 },
      { p: 0.45, pos: [x + 2.6, 1.3, 6.4], look: [x - 0.2, 1.25, 0], fov: 36 },
      { p: 1, pos: [x - 0.6, 1.6, portrait ? 11 : 8.8], look: [x - 0.6, portrait ? 1.6 : 1.05, 0], fov: 35 },
    ], p, (this._pos ||= new THREE.Vector3()), (this._look ||= new THREE.Vector3()));
    stage.shot(this._pos, this._look, v.fov, v.roll);
    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.05, p) + smooth(0.95, 1, p);
    this.ring.material.opacity = 0.35 + Math.sin(t * 2) * 0.15;
    this.ring.scale.setScalar(lerp(1, 1.15, (Math.sin(t * 0.8) + 1) / 2));
    this.mixer.update(dt);
  },
};
