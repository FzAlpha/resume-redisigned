// Asset director: decides the quality tier, downloads every model in parallel
// (story order first, next act always prioritised) and turns them into scene-ready objects.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const BASE = import.meta.env.BASE_URL;

// Story order = download order. `act` is where the model is first needed.
export const MODELS = [
  { id: 'wings',     act: 'hero' },
  { id: 'feathers',  act: 'hero' },
  { id: 'butterfly', act: 'hero' },
  { id: 'queen',     act: 'hero' }, // joins the opening as soon as she arrives
  { id: 'infinian',  act: 'skills' },
  { id: 'arm',       act: 'projects' },
  { id: 'angel',     act: 'intermission' },
  { id: 'k2so',      act: 'terminal' },
  { id: 'astraia',   act: 'contact' },
];
export const ACT_ORDER = ['hero', 'about', 'skills', 'projects', 'intermission', 'terminal', 'contact', 'credits'];

/** Pick hd / sd / still from what the device can do. */
export function detectTier() {
  const q = new URLSearchParams(location.search).get('tier');
  if (q === 'hd' || q === 'sd' || q === 'still') return q;
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return 'still';
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return 'still';
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 4;
  const small = Math.min(screen.width, screen.height) < 700;
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (mem <= 2 || cores <= 2) return 'still';
  if (small || coarse || mem <= 4) return 'sd';
  return 'hd';
}

export class AssetDirector extends EventTarget {
  constructor(tier, { concurrency = 3 } = {}) {
    super();
    this.tier = tier;
    this.concurrency = concurrency;
    this.items = new Map(MODELS.map((m, i) => [m.id, { ...m, order: i, state: 'queued', loaded: 0, total: 0, buffer: null, gltf: null, parsing: null }]));
    this.active = 0;
    this.focusAct = 'hero';
    this.loader = new GLTFLoader();
    this.loader.setMeshoptDecoder(MeshoptDecoder);
  }

  /** Start background downloads. */
  start() {
    if (this.tier === 'still') return;
    this.#pump();
  }

  /** Tell the director where the viewer is, so the next scenes jump the queue. */
  focus(actId) {
    this.focusAct = actId;
  }

  #priority(item) {
    const cur = ACT_ORDER.indexOf(this.focusAct);
    const need = ACT_ORDER.indexOf(item.act);
    const d = need - cur;
    // Scenes just ahead come first, then the current scene, then the rest in story order.
    return d >= 0 ? d : 10 - d;
  }

  #pump() {
    while (this.active < this.concurrency) {
      const next = [...this.items.values()]
        .filter((i) => i.state === 'queued')
        .sort((a, b) => this.#priority(a) - this.#priority(b) || a.order - b.order)[0];
      if (!next) break;
      this.#download(next);
    }
  }

  async #download(item) {
    item.state = 'downloading';
    this.active++;
    try {
      const res = await fetch(`${BASE}models/${this.tier}/${item.id}.glb`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      item.total = Number(res.headers.get('content-length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        item.loaded += value.length;
        this.#emitProgress();
      }
      const buf = new Uint8Array(item.loaded);
      let o = 0;
      for (const c of chunks) { buf.set(c, o); o += c.length; }
      item.buffer = buf.buffer;
      item.total = item.loaded;
      item.state = 'downloaded';
      this.dispatchEvent(new CustomEvent('downloaded', { detail: item.id }));
    } catch (err) {
      console.warn('[assets] failed', item.id, err);
      item.state = 'queued';
      item.loaded = 0;
      setTimeout(() => this.#pump(), 3000);
    } finally {
      this.active--;
      this.#emitProgress();
      this.#pump();
    }
  }

  #emitProgress() {
    const list = [...this.items.values()];
    const done = list.filter((i) => i.state === 'downloaded' || i.state === 'ready').length;
    this.dispatchEvent(new CustomEvent('progress', { detail: { list, done, all: list.length } }));
  }

  isDownloaded(id) { const s = this.items.get(id)?.state; return s === 'downloaded' || s === 'ready'; }
  isReady(id) { return this.items.get(id)?.state === 'ready'; }
  get(id) { return this.items.get(id)?.gltf || null; }

  /** Parse a downloaded model (once). Resolves with the GLTF. */
  prepare(id) {
    const item = this.items.get(id);
    if (!item) return Promise.reject(new Error('unknown model ' + id));
    if (item.gltf) return Promise.resolve(item.gltf);
    if (item.parsing) return item.parsing;
    if (!item.buffer) return null;
    item.parsing = this.loader.parseAsync(item.buffer, `${BASE}models/${this.tier}/`).then((gltf) => {
      prepModel(gltf);
      item.gltf = gltf;
      item.state = 'ready';
      this.dispatchEvent(new CustomEvent('ready', { detail: id }));
      this.#emitProgress();
      return gltf;
    });
    return item.parsing;
  }
}

/** Shadows off, frustum culling off for skinned meshes (their bounds lie), trim clip lead-in. */
function prepModel(gltf) {
  gltf.scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = o.receiveShadow = false;
      if (o.isSkinnedMesh) o.frustumCulled = false;
    }
  });
  gltf.animations = gltf.animations.map(trimClip);
}

/** Some exports put every take on one long timeline; shift each clip so it starts at 0. */
export function trimClip(clip) {
  let start = Infinity;
  for (const t of clip.tracks) if (t.times.length) start = Math.min(start, t.times[0]);
  if (!isFinite(start) || start < 0.05) return clip;
  const c = clip.clone();
  for (const t of c.tracks) { t.shift(-start); }
  c.resetDuration();
  return c;
}

/** Scale & centre a model so its bounding box fits `size` on its largest (or chosen) axis. */
export function fitModel(object, { size = 2, axis = 'max', anchor = 'center' } = {}) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object, true);
  const dims = box.getSize(new THREE.Vector3());
  const ref = axis === 'max' ? Math.max(dims.x, dims.y, dims.z) : dims[axis];
  const s = ref > 0 ? size / ref : 1;
  object.scale.multiplyScalar(s);
  object.updateMatrixWorld(true);
  box.setFromObject(object, true);
  const c = box.getCenter(new THREE.Vector3());
  object.position.x -= c.x;
  object.position.z -= c.z;
  object.position.y -= anchor === 'bottom' ? box.min.y : c.y;
  object.updateMatrixWorld(true);
  return box.setFromObject(object, true);
}
