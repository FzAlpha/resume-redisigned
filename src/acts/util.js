import * as THREE from 'three';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const _a = new THREE.Vector3(), _b = new THREE.Vector3();

/**
 * Camera keyframes along an act's scroll progress.
 * keys: [{ p, pos:[x,y,z], look:[x,y,z], fov, roll }]
 */
export function track(keys, p, outPos, outLook) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const k0 = keys[i], k1 = keys[Math.min(i + 1, keys.length - 1)];
  const t = k1.p === k0.p ? 0 : easeInOut(clamp((p - k0.p) / (k1.p - k0.p)));
  outPos.lerpVectors(_a.fromArray(k0.pos), _b.fromArray(k1.pos), t);
  outLook.lerpVectors(_a.fromArray(k0.look), _b.fromArray(k1.look), t);
  return { fov: lerp(k0.fov ?? 35, k1.fov ?? 35, t), roll: lerp(k0.roll ?? 0, k1.roll ?? 0, t) };
}

/** Find a node whose name starts with / contains a string. */
export function findNode(root, test) {
  let hit = null;
  root.traverse((o) => { if (!hit && (typeof test === 'function' ? test(o) : o.name && o.name.includes(test))) hit = o; });
  return hit;
}

/** Find the clip whose name contains `part`. */
export const clip = (gltf, part) => gltf.animations.find((a) => a.name.includes(part));

/** Does a clip animate this node (by name)? */
export const animates = (c, node) => !!c && c.tracks.some((t) => t.name.startsWith(node.name + '.'));

/** World position of an object (new vector). */
export const worldPos = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
