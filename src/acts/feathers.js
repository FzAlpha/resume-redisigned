// Feather storm: the three feathers from "3 Great Feathers Pack", instanced by the hundred.
// They drift down through the god-light, sway and spin, and burst outward on the title impact.
import * as THREE from 'three';

/** Meshopt-quantized attributes can't take transforms in place; copy to plain floats. */
function toFloat(attr) {
  const out = new Float32Array(attr.count * attr.itemSize);
  for (let i = 0; i < attr.count; i++) for (let k = 0; k < attr.itemSize; k++) out[i * attr.itemSize + k] = attr.getComponent(i, k);
  return new THREE.BufferAttribute(out, attr.itemSize);
}

export class FeatherStorm {
  constructor(gltf, { perType = 60, length = 0.34, bounds = { x: 6, yMin: -2.5, yMax: 7, zMin: -5, zMax: 3.5 } } = {}) {
    this.group = new THREE.Group();
    this.bounds = bounds;
    this.sets = [];
    gltf.scene.updateMatrixWorld(true);
    const meshes = [];
    gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });

    for (const mesh of meshes) {
      const geo = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'uv']) if (mesh.geometry.attributes[name]) geo.setAttribute(name, toFloat(mesh.geometry.attributes[name]));
      if (mesh.geometry.index) geo.setIndex(mesh.geometry.index.clone());
      geo.applyMatrix4(mesh.matrixWorld);
      geo.computeBoundingBox();
      const size = geo.boundingBox.getSize(new THREE.Vector3());
      const c = geo.boundingBox.getCenter(new THREE.Vector3());
      geo.translate(-c.x, -c.y, -c.z);
      const s = length / Math.max(size.x, size.y, size.z);
      geo.scale(s, s, s);

      const mat = mesh.material.clone();
      mat.side = THREE.DoubleSide;
      mat.envMapIntensity = 0.4;
      const inst = new THREE.InstancedMesh(geo, mat, perType);
      inst.frustumCulled = false;
      const st = [];
      for (let i = 0; i < perType; i++) st.push(this.#spawn(true));
      this.sets.push({ inst, st });
      this.group.add(inst);
    }
    this.burstT = -1;
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._s = new THREE.Vector3(1, 1, 1);
  }

  #spawn(anywhere) {
    const b = this.bounds;
    return {
      p: new THREE.Vector3(
        (Math.random() * 2 - 1) * b.x,
        anywhere ? b.yMin + Math.random() * (b.yMax - b.yMin) : b.yMax + Math.random() * 1.5,
        b.zMin + Math.random() * (b.zMax - b.zMin),
      ),
      v: new THREE.Vector3(0, -(0.18 + Math.random() * 0.25), 0),
      rot: new THREE.Vector3(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28),
      spin: new THREE.Vector3((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.2),
      phase: Math.random() * 6.28,
      scale: 0.7 + Math.random() * 0.6,
    };
  }

  /** Throw every feather outward from `center` (the title impact). */
  burst(center = new THREE.Vector3(0, 2, 0), force = 5) {
    for (const { st } of this.sets) for (const f of st) {
      const d = f.p.clone().sub(center);
      const len = Math.max(0.6, d.length());
      f.v.addScaledVector(d.normalize(), force / Math.sqrt(len));
      f.spin.multiplyScalar(4);
    }
    this.burstT = 0;
  }

  update(dt, t, opacity = 1) {
    const b = this.bounds;
    if (this.burstT >= 0) { this.burstT += dt; if (this.burstT > 3) this.burstT = -1; }
    const drag = 1 - Math.min(1, dt * 0.9);
    for (const { inst, st } of this.sets) {
      inst.material.opacity = opacity;
      inst.material.transparent = opacity < 1;
      inst.visible = opacity > 0.01;
      for (let i = 0; i < st.length; i++) {
        const f = st[i];
        // relax toward a gentle fall after a burst
        f.v.x *= drag; f.v.z *= drag;
        f.v.y += (-(0.2 + (i % 5) * 0.05) - f.v.y) * Math.min(1, dt * 0.8);
        f.spin.multiplyScalar(1 - Math.min(1, dt * 0.5));
        if (f.spin.lengthSq() < 0.2) f.spin.multiplyScalar(1.02);
        f.p.addScaledVector(f.v, dt);
        f.p.x += Math.sin(t * 0.8 + f.phase) * 0.25 * dt;
        f.p.z += Math.cos(t * 0.6 + f.phase) * 0.18 * dt;
        f.rot.addScaledVector(f.spin, dt);
        if (f.p.y < b.yMin || Math.abs(f.p.x) > b.x * 1.8 || f.p.z > b.zMax + 3 || f.p.z < b.zMin - 3) st[i] = this.#spawn(false);
        this._e.set(f.rot.x + Math.sin(t + f.phase) * 0.4, f.rot.y, f.rot.z);
        this._q.setFromEuler(this._e);
        this._s.setScalar(f.scale);
        this._m.compose(st[i].p, this._q, this._s);
        inst.setMatrixAt(i, this._m);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
  }
}
