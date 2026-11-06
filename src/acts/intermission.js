// INTERMISSION — the Angel's scattered parts assemble into one being,
// then the camera rises through its halo (portal) into Act IV.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { clamp, lerp, smooth, track } from './util.js';

export default {
  id: 'intermission', nav: null, hud: ['Intermission', ''],
  models: ['angel'],
  mix: { epic: 0.5, calm: 0 },
  mood: {
    sky: { top: '#12030a', bottom: '#000000', glow: '#4a0a14', dir: [0, 1, -0.4] },
    dust: { color: '#ff8a7a', opacity: 0.3 },
    key: { color: '#f4e9ff', intensity: 1.6, pos: [3, 4, 6] },
    rim: { color: '#ffb36b', intensity: 6, pos: [-2, 6, -4] },
    fill: { sky: '#3a0d14', ground: '#000000', intensity: 0.3 },
    env: 0.8, exposure: 1.1,
    bloom: { strength: 0.9, threshold: 0.5, radius: 0.6 },
    tint: '#fff2ee',
  },

  build(ctx) {
    const gltf = ctx.assets.get('angel');
    this.root = new THREE.Group();
    this.model = gltf.scene;
    this.root.add(this.model);
    const box = fitModel(this.model, { size: 3.6, axis: 'y', anchor: 'bottom' });
    this.center = box.getCenter(new THREE.Vector3());
    this.mixer = new THREE.AnimationMixer(this.model);
    this.clip = gltf.animations[0];
    if (this.clip) this.mixer.clipAction(this.clip).play();

    // Group nodes by namespace prefix ("hand3:", "skeleton:" ...) and take each namespace's top node.
    // (three.js strips ':' from names, so read the original glTF node names.)
    const json = gltf.parser.json;
    const nsOf = (o) => {
      const idx = gltf.parser.associations.get(o)?.nodes;
      const raw = idx !== undefined ? json.nodes[idx]?.name || '' : '';
      return raw.includes(':') ? raw.split(':')[0] : null;
    };
    this.parts = [];
    const nsOffsets = new Map();
    this.model.updateMatrixWorld(true);
    this.model.traverse((o) => {
      const ns = nsOf(o);
      if (!ns || !o.parent) return;
      if (nsOf(o.parent) === ns) return;
      // One world-space offset per namespace, so all roots of a part travel together.
      let dirWorld = nsOffsets.get(ns);
      if (!dirWorld) {
        const wp = o.getWorldPosition(new THREE.Vector3());
        dirWorld = wp.clone().sub(this.center);
        if (dirWorld.lengthSq() < 1e-4) dirWorld.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        dirWorld.normalize().multiplyScalar(ns === 'skeleton' ? 0.4 : 1.6 + Math.random() * 1.4);
        dirWorld.y += (Math.random() - 0.3) * 1.2;
        nsOffsets.set(ns, dirWorld);
      }
      // offset expressed in the parent's local space
      const parentInv = new THREE.Matrix4().copy(o.parent.matrixWorld).invert();
      const localDir = dirWorld.clone().transformDirection(parentInv).multiplyScalar(dirWorld.length() / o.parent.getWorldScale(new THREE.Vector3()).x);
      this.parts.push({
        node: o, base: o.position.clone(), offset: localDir,
        animated: !!this.clip?.tracks.some((t) => t.name === `${o.name}.position`),
        spin: (Math.random() - 0.5) * 2,
      });
    });

    // Find the halo for the portal fly-through.
    this.halo = null;
    this.model.traverse((o) => { if (!this.halo && o.isMesh && /halo/i.test(o.material?.name || '')) this.halo = o; });

    this.root.visible = false;
    ctx.stage.scene.add(this.root);
    this.flags = {};
  },

  enter(ctx, dir) {
    if (!this.root) return;
    this.root.visible = true;
    this.flags = {};
    if (dir > 0) ctx.audio.play('riser', { volume: 0.75 });
  },
  leave() { if (this.root) this.root.visible = false; },

  update(p, dt, t, ctx) {
    const { stage, audio } = ctx;
    this.mixer.update(dt);

    // Assemble: 1 = fully exploded, 0 = whole.
    const e = 1 - smooth(0.08, 0.6, p);
    for (const part of this.parts) {
      if (!part.animated) part.node.position.copy(part.base);
      part.node.position.addScaledVector(part.offset, e);
    }
    this.model.rotation.y = e * 0.6 + Math.sin(t * 0.3) * 0.1;

    let haloPos = (this._halo ||= new THREE.Vector3(0, 3.4, 0));
    if (this.halo) this.halo.getWorldPosition(haloPos);

    track([
      { p: 0, pos: [0, 2.0, 11], look: [0, 1.8, 0], fov: 38 },
      { p: 0.6, pos: [0, 2.0, 7.2], look: [0, 1.9, 0], fov: 35 },
      { p: 0.78, pos: [0, haloPos.y - 0.2, 3.2], look: [haloPos.x, haloPos.y, haloPos.z], fov: 40 },
      { p: 1, pos: [haloPos.x, haloPos.y + 0.05, haloPos.z + 0.15], look: [haloPos.x, haloPos.y + 1.5, haloPos.z - 1], fov: 70 },
    ], p, (this._pos ||= new THREE.Vector3()), (this._look ||= new THREE.Vector3()));
    stage.shot(this._pos, this._look, lerp(38, 70, smooth(0.7, 1, p)), 0);
    if (stage.isPortrait) stage.rig.pos.z += 3 * (1 - smooth(0.6, 0.8, p));

    // The halo portal: white flash at the end.
    if (p > 0.6 && !this.flags.swell) { this.flags.swell = true; audio.mix({ epic: 0.68 }, 2.5); }
    if (p > 0.86 && !this.flags.portal) { this.flags.portal = true; audio.play('portal', { volume: 0.8, duck: 0.5 }); }
    stage.grade.uniforms.uFlash.value = smooth(0.9, 1, p) * 0.9;
    stage.grade.uniforms.uFade.value = 1 - smooth(0, 0.06, p);
    stage.grade.uniforms.uAberration.value = lerp(0.0015, 0.012, smooth(0.8, 1, p));
  },
};
