// FINALE — CONTACT. Astraía's six hands each hold one way to reach you.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { lerp, smooth, track } from './util.js';

/**
 * Turn only Astraía's head. Her head, neck and torso are single static meshes (no head bone),
 * so we rotate the vertices above the neck around a neck pivot, blending smoothly through the
 * neck (model-space heights y0 → y1) so nothing tears. Done once at build time.
 */
function turnHead(model, yawDeg, pitchDeg, y0, y1) {
  model.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(model.matrixWorld).invert();
  const meshes = [];
  model.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh && o.material?.name !== 'Instruments') meshes.push(o); });
  const v = new THREE.Vector3();
  const toModel = (o) => new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);

  // Pivot: horizontal centre of everything above the neck, at neck height.
  const pivot = new THREE.Vector3();
  let n = 0;
  for (const o of meshes) {
    const M = toModel(o), pos = o.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(M);
      if (v.y > y1) { pivot.x += v.x; pivot.z += v.z; n++; }
    }
  }
  if (!n) return;
  pivot.set(pivot.x / n, y0, pivot.z / n);

  const full = new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(pitchDeg), THREE.MathUtils.degToRad(yawDeg), 0, 'YXZ'));
  const none = new THREE.Quaternion(), q = new THREE.Quaternion(), nv = new THREE.Vector3();
  for (const o of meshes) {
    const M = toModel(o), Mi = M.clone().invert();
    const N = new THREE.Matrix3().getNormalMatrix(M), Ni = N.clone().invert();
    const pos = o.geometry.attributes.position, nor = o.geometry.attributes.normal;
    const outP = new Float32Array(pos.count * 3), outN = nor ? new Float32Array(nor.count * 3) : null;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(M);
      let w = Math.min(1, Math.max(0, (v.y - y0) / (y1 - y0)));
      w = w * w * (3 - 2 * w);
      q.slerpQuaternions(none, full, w);
      v.sub(pivot).applyQuaternion(q).add(pivot).applyMatrix4(Mi);
      outP.set([v.x, v.y, v.z], i * 3);
      if (nor) {
        nv.fromBufferAttribute(nor, i).applyMatrix3(N).applyQuaternion(q).applyMatrix3(Ni).normalize();
        outN.set([nv.x, nv.y, nv.z], i * 3);
      }
    }
    // (positions were quantized Int16 — store the turned result as plain floats)
    o.geometry.setAttribute('position', new THREE.BufferAttribute(outP, 3));
    if (nor) o.geometry.setAttribute('normal', new THREE.BufferAttribute(outN, 3));
    o.geometry.computeBoundingSphere();
    o.geometry.computeBoundingBox();
  }
}

// three.js turns spaces in node names into underscores.
const HAND_BONES = ['Bip002_R_Hand', 'Bip003_R_Hand', 'Bip004_R_Hand', 'Bip005_R_Hand', 'Bip006_R_Hand', 'Bip007_R_Hand'];

export default {
  id: 'contact', nav: 'contact', hud: ['Finale', 'Six Hands'],
  models: ['astraia'],
  mix: { epic: 0.6, calm: 0 },
  mood: {
    sky: { top: '#060b1c', bottom: '#000000', glow: '#1b2f66', dir: [0, 0.5, -1] },
    dust: { color: '#cfe0ff', opacity: 0.5 },
    key: { color: '#d6e4ff', intensity: 1.5, pos: [2, 5, 6] },
    rim: { color: '#7fa8ff', intensity: 3.5, pos: [-3, 4, -5] },
    fill: { sky: '#1a2850', ground: '#000000', intensity: 0.3 },
    env: 0.35, exposure: 0.95,
    bloom: { strength: 0.45, threshold: 0.88, radius: 0.45 },
    tint: '#f2f6ff',
  },

  build(ctx) {
    const gltf = ctx.assets.get('astraia');
    this.root = new THREE.Group();
    this.pivot = new THREE.Group(); // turns her to face the camera
    this.root.add(this.pivot);
    this.model = gltf.scene;
    this.pivot.add(this.model);
    // The source scene ships its own backdrop sphere ("Fond"); our sky replaces it.
    const backdrop = [];
    this.model.traverse((o) => { if (o.isMesh && o.material?.name === 'Fond') backdrop.push(o); });
    backdrop.forEach((o) => o.removeFromParent());
    const box = fitModel(this.model, { size: 4.6, axis: 'y', anchor: 'bottom' });
    this.top = box.max.y;
    this.pivot.rotation.y = Math.PI / 2; // the source faces sideways; this shows her body
    // and this turns only her face to the camera (dev: ?turn=yaw,pitch,y0,y1 to tune, ?turn=off to disable)
    const tune = import.meta.env.DEV ? new URLSearchParams(location.search).get('turn') : null;
    if (tune !== 'off') {
      // Blend zone 0.16–0.24 is her neck (chin ≈ 0.25, shoulders ≈ 0.15), so the face turns rigidly.
      const [yaw, pitch, y0, y1] = tune ? tune.split(',').map(Number) : [-30, -10, 0.16, 0.24];
      turnHead(this.model, yaw, pitch, y0, y1);
    }
    this.mixer = new THREE.AnimationMixer(this.model);
    // Her body stays still (arm bones "Bip…" held at the clip's first frame);
    // only the armillary spheres and rings keep their original slow motion.
    const clip = gltf.animations[0];
    if (clip) {
      const body = clip.clone();
      body.tracks = body.tracks.filter((t) => t.name.startsWith('Bip'));
      const spheres = clip.clone();
      spheres.tracks = spheres.tracks.filter((t) => !t.name.startsWith('Bip'));
      const hold = this.mixer.clipAction(body);
      hold.play();
      hold.paused = true; // frozen pose
      this.mixer.clipAction(spheres).play();
    }

    this.hands = HAND_BONES.map((n) => {
      let hit = null;
      this.model.traverse((o) => { if (!hit && o.name.startsWith(n)) hit = o; });
      return hit;
    });
    this.handLight = new THREE.PointLight(0x7fb0ff, 0, 2.5, 2);
    this.root.add(this.handLight);
    this.hover = -1;

    this.spots = [...document.querySelectorAll('.hotspot')];
    this.spots.forEach((el) => {
      const i = Number(el.dataset.hand);
      el.addEventListener('pointerenter', () => { this.hover = i; ctx.audio.sparkle(0.8 + i * 0.1); });
      el.addEventListener('pointerleave', () => { if (this.hover === i) this.hover = -1; });
      el.addEventListener('focus', () => { this.hover = i; });
    });

    this.root.visible = false;
    ctx.stage.scene.add(this.root);
  },

  enter(ctx, dir) {
    if (!this.root) return;
    this.root.visible = true;
    if (dir > 0) ctx.audio.play('choir-swell', { volume: 0.7, duck: 0.35 });
  },
  leave() { if (this.root) this.root.visible = false; },

  update(p, dt, t, ctx) {
    const { stage } = ctx;
    const portrait = stage.isPortrait;
    const x = portrait ? 0 : 2.6;
    this.root.position.x = x;
    this.mixer.update(dt);

    const v = track([
      { p: 0, pos: [x - 0.2, this.top * 0.72, 4.2], look: [x - 0.2, this.top * 0.68, 0], fov: 32 },
      { p: 0.32, pos: [x - (portrait ? 0.3 : 1.7), 2.3, portrait ? 13 : 10.8], look: [x - (portrait ? 0.3 : 1.7), 2.2, 0], fov: 36 },
      { p: 1, pos: [x - (portrait ? -0.4 : 0.9), 2.3, portrait ? 12.5 : 10.2], look: [x - (portrait ? 0.2 : 1.6), 2.2, 0], fov: 36 },
    ], p, (this._pos ||= new THREE.Vector3()), (this._look ||= new THREE.Vector3()));
    stage.shot(this._pos, this._look, v.fov, 0);
    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.05, p) + smooth(0.95, 1, p);

    // Pin the six hotspots to the six hands.
    const cam = stage.camera;
    const v3 = (this._v ||= new THREE.Vector3());
    const w = innerWidth, h = innerHeight;
    // Labels must not cover the contact form (left) or run off the right edge.
    const formRight = (this._block ||= document.querySelector('.contact-block'))?.getBoundingClientRect().right ?? 0;
    this.hands.forEach((bone, i) => {
      const el = this.spots[i];
      if (!bone || !el) return;
      bone.getWorldPosition(v3);
      if (i === this.hover) {
        this.handLight.position.copy(v3);
        this.root.worldToLocal(this.handLight.position);
      }
      v3.project(cam);
      const sx = (v3.x * 0.5 + 0.5) * w, sy = (-v3.y * 0.5 + 0.5) * h;
      const ew = el.offsetWidth;
      let left = sx < w * 0.5 + x * 40;
      if (left && sx - ew + 18 < formRight + 12) left = false;
      if (!left && sx + ew - 9 > w - 20) left = true;
      el.classList.toggle('flip', left);
      const offX = left ? -ew + 18 : -9;
      el.style.transform = `translate(${sx + offX}px, ${sy - 15}px)`;
      el.style.setProperty('--vis', v3.z < 1 ? 1 : 0);
    });
    this.handLight.intensity += ((this.hover >= 0 ? 3 : 0) - this.handLight.intensity) * (1 - Math.exp(-6 * dt));
  },
};
