// The butterfly: a recurring character. Perches on the typing cursor in the hero,
// leads the About act, and returns for the credits to land on the replay button.
import * as THREE from 'three';
import { fitModel } from '../engine/assets.js';
import { clamp } from './util.js';

const TRAIL = 140;

export class Companion {
  constructor(ctx) {
    this.ctx = ctx;
    this.ready = false;
    this.mode = 'hidden';
    this.pos = new THREE.Vector3(6, 3, 2);
    this.vel = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.lastSpark = 0;
    this.landed = false;
  }

  build() {
    const { assets, stage } = this.ctx;
    const gltf = assets.get('butterfly');
    this.group = new THREE.Group();
    const inner = new THREE.Group();
    inner.add(gltf.scene);
    fitModel(gltf.scene, { size: 0.42 });
    this.group.add(inner);
    gltf.scene.traverse((o) => {
      if (o.isMesh && o.material) {
        // Neon line-art: black reads as transparent, lines glow (as on Sketchfab's black stage).
        o.material.transparent = true;
        o.material.blending = THREE.AdditiveBlending;
        o.material.depthWrite = false;
        o.material.side = THREE.DoubleSide;
        const m = o.material;
        if (!m.emissiveMap && m.map) { m.emissiveMap = m.map; m.emissive?.setRGB(1, 1, 1); }
        m.color?.setRGB(0, 0, 0);
        m.envMapIntensity = 0;
        m.emissiveIntensity = 2.4; // source file uses 10 (Sketchfab), far too hot under ACES
        if (m.alphaTest >= 1) m.alphaTest = 0.5;
      }
    });
    this.mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations[0]) this.action = this.mixer.clipAction(gltf.animations[0]).play();
    this.group.visible = false;
    stage.scene.add(this.group);

    // Glow + sparkle trail.
    this.light = new THREE.PointLight(0x7fe6ff, 0, 3, 2);
    this.group.add(this.light);
    const g = new THREE.BufferGeometry();
    this.trailPos = new Float32Array(TRAIL * 3);
    this.trailLife = new Float32Array(TRAIL);
    g.setAttribute('position', new THREE.BufferAttribute(this.trailPos, 3));
    g.setAttribute('aLife', new THREE.BufferAttribute(this.trailLife, 1));
    this.trail = new THREE.Points(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uSize: { value: 60 * stage.pixelRatio } },
      vertexShader: /* glsl */`attribute float aLife; uniform float uSize; varying float vL;
        void main(){ vL = aLife; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = uSize * aLife / -mv.z; }`,
      fragmentShader: /* glsl */`varying float vL; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d)*vL;
        vec3 c = mix(vec3(0.75,0.4,1.0), vec3(0.45,0.95,1.0), vL); gl_FragColor = vec4(c, a); }`,
    }));
    this.trail.frustumCulled = false;
    stage.scene.add(this.trail);
    this.trailIdx = 0;

    // About-act flight path, in camera-relative space (x right, y up, z toward camera).
    this.path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.95, 0.3, -3.0), new THREE.Vector3(0.45, 0.65, -2.6), new THREE.Vector3(1.15, 0.15, -2.4),
      new THREE.Vector3(0.8, -0.4, -3.0), new THREE.Vector3(1.45, 0.0, -3.4), new THREE.Vector3(1.0, 0.55, -3.2),
    ], true);
    this.ready = true;
  }

  /** Point `dist` units in front of the camera through a screen position (px). */
  screenToWorld(x, y, dist, out) {
    const cam = this.ctx.stage.camera;
    const ndc = new THREE.Vector3((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1, 0.5).unproject(cam);
    return out.copy(cam.position).add(ndc.sub(cam.position).normalize().multiplyScalar(dist));
  }

  camRelative(v, out) {
    const cam = this.ctx.stage.camera;
    return out.copy(v).applyQuaternion(cam.quaternion).add(cam.position);
  }

  setMode(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.landed = false;
  }

  update(dt, t, actId, p) {
    if (!this.ready) return;
    const { audio } = this.ctx;
    let speed = 3.2, flap = 1.6;

    if (this.mode === 'perch') {
      const el = document.getElementById('typing-cursor');
      const r = el?.getBoundingClientRect();
      if (r && r.width) this.screenToWorld(r.left + r.width / 2, r.top - 4, 3.2, this.target);
      flap = this.landed ? 0.35 : 1.6;
      speed = 2.6;
    } else if (this.mode === 'fly') {
      const u = (t * 0.035 + p * 0.6) % 1;
      const local = this.path.getPointAt(u);
      if (this.ctx.stage.isPortrait) { local.x *= 0.4; local.y += 0.7; }
      this.camRelative(local, this.target);
      flap = 1.4;
    } else if (this.mode === 'credits') {
      const btn = document.getElementById('replay-btn');
      const r = btn?.getBoundingClientRect();
      if (r && r.top < innerHeight && r.bottom > 0 && p > 0.7) {
        this.screenToWorld(r.left + 18, r.top - 6, 3.2, this.target);
        flap = this.landed ? 0.4 : 1.6;
      } else {
        this.camRelative(new THREE.Vector3(Math.sin(t * 0.4) * 1.6, 0.6 + Math.sin(t * 0.7) * 0.5, -3.4), this.target);
      }
    } else {
      // Exit: fly up and away, then hide.
      this.camRelative(new THREE.Vector3(5, 3, -4), this.target);
      speed = 2;
    }

    const prev = this.pos.clone();
    const k = 1 - Math.exp(-speed * dt);
    this.pos.lerp(this.target, k);
    // little organic flutter
    const flutter = this.landed ? 0.004 : 0.03;
    this.pos.y += Math.sin(t * 9) * flutter;
    this.vel.subVectors(this.pos, prev);

    const dist = this.pos.distanceTo(this.target);
    if ((this.mode === 'perch' || this.mode === 'credits') && !this.landed && dist < 0.05) {
      this.landed = true;
      audio.sparkle(1.2);
    }

    const visible = this.mode !== 'hidden' || dist > 0.6;
    this.group.visible = visible;
    this.group.position.copy(this.pos);
    const s = this.mode === 'perch' ? 0.38 : this.mode === 'credits' ? 0.5 : 1.35;
    this.group.scale.setScalar(this.group.scale.x + (s - this.group.scale.x) * (1 - Math.exp(-3 * dt)));
    if (this.vel.lengthSq() > 1e-7) {
      const look = this.pos.clone().add(this.vel.clone().normalize());
      const m = new THREE.Matrix4().lookAt(this.pos, look, new THREE.Vector3(0, 1, 0));
      const q = new THREE.Quaternion().setFromRotationMatrix(m);
      this.group.quaternion.slerp(q, 1 - Math.exp(-6 * dt));
    } else if (this.landed) {
      const cam = this.ctx.stage.camera;
      const q = cam.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.9, 0, 0)));
      this.group.quaternion.slerp(q, 1 - Math.exp(-4 * dt));
    }
    if (this.action) this.action.timeScale += (flap - this.action.timeScale) * clamp(dt * 4);
    this.mixer.update(dt);
    this.light.intensity = visible ? 1.2 : 0;

    // Sparkle trail.
    for (let i = 0; i < TRAIL; i++) this.trailLife[i] = Math.max(0, this.trailLife[i] - dt * 0.9);
    if (visible && !this.landed && this.vel.length() > 0.002) {
      for (let n = 0; n < 2; n++) {
        const i = this.trailIdx = (this.trailIdx + 1) % TRAIL;
        this.trailPos[i * 3] = this.pos.x + (Math.random() - 0.5) * 0.08;
        this.trailPos[i * 3 + 1] = this.pos.y + (Math.random() - 0.5) * 0.08;
        this.trailPos[i * 3 + 2] = this.pos.z + (Math.random() - 0.5) * 0.08;
        this.trailLife[i] = 1;
      }
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    this.trail.geometry.attributes.aLife.needsUpdate = true;

    if (this.mode === 'fly' && t - this.lastSpark > 9) { this.lastSpark = t; audio.sparkle(0.9); }
  }
}
