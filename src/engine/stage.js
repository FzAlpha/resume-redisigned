// The Stage: one WebGL canvas behind the whole page.
// Renderer + camera + lights + sky + dust + cinematic grade (bloom, grain, vignette, fade, flash).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFade: { value: 1 },        // 0 = picture, 1 = black
    uFlash: { value: 0 },       // 0..1 white flash
    uVignette: { value: 0.9 },
    uGrain: { value: 0.06 },
    uAberration: { value: 0.0015 },
    uTint: { value: new THREE.Color(1, 1, 1) },
    uAspect: { value: 1 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime, uFade, uFlash, uVignette, uGrain, uAberration, uAspect; uniform vec3 uTint;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c * vec2(uAspect, 1.0), c * vec2(uAspect, 1.0));
      vec2 off = c * uAberration * (1.0 + r2 * 4.0);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      col *= uTint;
      float vig = smoothstep(1.15, 0.2, length(c * vec2(uAspect * 0.8, 1.0)) * uVignette * 1.4);
      col *= mix(1.0, vig, 0.85);
      float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime * 7.0) * 100.0) - 0.5;
      col += g * uGrain;
      col = mix(col, vec3(1.0), uFlash);
      col *= (1.0 - uFade);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

const SkyShader = {
  uniforms: {
    uTop: { value: new THREE.Color('#05060b') },
    uBottom: { value: new THREE.Color('#000000') },
    uGlow: { value: new THREE.Color('#0d1a3a') },
    uGlowDir: { value: new THREE.Vector3(0, 0.2, -1).normalize() },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec3 vDir;
    void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform vec3 uTop, uBottom, uGlow, uGlowDir; uniform float uTime; varying vec3 vDir;
    void main() {
      float h = vDir.y * 0.5 + 0.5;
      vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, h));
      float g = pow(max(dot(normalize(vDir), uGlowDir), 0.0), 6.0);
      col += uGlow * g;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export class Stage {
  constructor(canvas, { tier }) {
    this.tier = tier;
    const hd = tier === 'hd';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: hd, powerPreference: 'high-performance', alpha: false });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, hd ? 1.75 : 1.25);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setClearColor(0x050507, 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.05, 400);
    this.camera.position.set(0, 1.5, 8);

    // Image-based lighting so gold / chrome read properly.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.5;
    pmrem.dispose();

    // Lights shared by every act; acts re-colour and re-aim them.
    this.lights = {
      key: new THREE.DirectionalLight(0x8fb0ff, 1.5),
      rim: new THREE.DirectionalLight(0xffd59a, 2.5),
      fill: new THREE.HemisphereLight(0x22324f, 0x050507, 0.4),
      point: new THREE.PointLight(0x4f8cff, 0, 12, 1.6),
    };
    this.lights.key.position.set(4, 5, 6);
    this.lights.rim.position.set(-3, 4, -6);
    Object.values(this.lights).forEach((l) => this.scene.add(l));

    // Sky dome.
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), new THREE.ShaderMaterial({ ...SkyShader, side: THREE.BackSide, depthWrite: false }));
    this.scene.add(this.sky);

    this.dust = this.#makeDust(hd ? 1600 : 700);
    this.scene.add(this.dust);

    // Post-processing chain.
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.55, 0.82);
    this.bloom.enabled = true;
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);

    // Smoothed camera rig: acts write targets, the stage eases toward them.
    this.rig = {
      pos: new THREE.Vector3(0, 1.5, 8), look: new THREE.Vector3(0, 1, 0), fov: 35, roll: 0,
      curPos: new THREE.Vector3(0, 1.5, 8), curLook: new THREE.Vector3(0, 1, 0), curFov: 35, curRoll: 0,
      ease: 4.5,
    };
    this.pointer = new THREE.Vector2();
    this.pointerSmooth = new THREE.Vector2();
    window.addEventListener('pointermove', (e) => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    }, { passive: true });

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  #makeDust(count) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#6f9bff') }, uOpacity: { value: 0.5 }, uSize: { value: 22 * this.pixelRatio }, uRise: { value: 0.15 } },
      vertexShader: /* glsl */`
        attribute float aSeed; uniform float uTime, uSize, uRise; varying float vA;
        void main() {
          vec3 p = position;
          p.y = mod(p.y + uTime * uRise * (0.4 + aSeed) + 9.0, 18.0) - 7.0;
          p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.4;
          p.z += cos(uTime * 0.25 + aSeed * 30.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.3 + aSeed) / -mv.z;
          vA = 0.35 + 0.65 * sin(uTime * (0.5 + aSeed) + aSeed * 20.0) * 0.5 + 0.5;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor; uniform float uOpacity; varying float vA;
        void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor, a * vA * uOpacity); }`,
    });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    return pts;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.composer.setPixelRatio?.(this.pixelRatio);
    const bloomScale = this.tier === 'hd' ? 0.5 : 0.35;
    this.bloom.resolution.set(Math.round(w * bloomScale), Math.round(h * bloomScale));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.grade.uniforms.uAspect.value = w / h;
    this.isPortrait = h > w;
  }

  /** Acts call this every frame with the desired shot. */
  shot(pos, look, fov = 35, roll = 0) {
    this.rig.pos.copy(pos);
    this.rig.look.copy(look);
    this.rig.fov = fov;
    this.rig.roll = roll;
  }

  /** Jump straight to the target shot (used on act cuts). */
  cut() {
    this.rig.curPos.copy(this.rig.pos);
    this.rig.curLook.copy(this.rig.look);
    this.rig.curFov = this.rig.fov;
    this.rig.curRoll = this.rig.roll;
  }

  setMood({ sky, dust, key, rim, fill, env, exposure, bloom, tint } = {}, k = 1) {
    const L = (c, hex) => c.lerp(new THREE.Color(hex), k);
    if (sky) {
      L(this.sky.material.uniforms.uTop.value, sky.top);
      L(this.sky.material.uniforms.uBottom.value, sky.bottom);
      L(this.sky.material.uniforms.uGlow.value, sky.glow);
      if (sky.dir) this.sky.material.uniforms.uGlowDir.value.lerp(new THREE.Vector3(...sky.dir).normalize(), k);
    }
    if (dust) {
      L(this.dust.material.uniforms.uColor.value, dust.color);
      const u = this.dust.material.uniforms.uOpacity;
      u.value += (dust.opacity - u.value) * k;
    }
    const lerpLight = (light, d) => {
      if (!d) return;
      L(light.color, d.color);
      light.intensity += (d.intensity - light.intensity) * k;
      if (d.pos && light.position) light.position.lerp(new THREE.Vector3(...d.pos), k);
    };
    lerpLight(this.lights.key, key);
    lerpLight(this.lights.rim, rim);
    if (fill) {
      L(this.lights.fill.color, fill.sky); L(this.lights.fill.groundColor, fill.ground);
      this.lights.fill.intensity += (fill.intensity - this.lights.fill.intensity) * k;
    }
    if (env !== undefined) this.scene.environmentIntensity += (env - this.scene.environmentIntensity) * k;
    if (exposure !== undefined) this.renderer.toneMappingExposure += (exposure - this.renderer.toneMappingExposure) * k;
    if (bloom) {
      this.bloom.strength += (bloom.strength - this.bloom.strength) * k;
      this.bloom.threshold += (bloom.threshold - this.bloom.threshold) * k;
      this.bloom.radius += (bloom.radius - this.bloom.radius) * k;
    }
    if (tint) L(this.grade.uniforms.uTint.value, tint);
  }

  render(dt, t, { parallax = 1 } = {}) {
    const r = this.rig;
    const a = 1 - Math.exp(-r.ease * dt);
    r.curPos.lerp(r.pos, a);
    r.curLook.lerp(r.look, a);
    r.curFov += (r.fov - r.curFov) * a;
    r.curRoll += (r.roll - r.curRoll) * a;

    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-2.5 * dt));
    const px = this.pointerSmooth.x * 0.25 * parallax, py = this.pointerSmooth.y * 0.15 * parallax;
    // breathing handheld drift
    const bx = Math.sin(t * 0.6) * 0.03, by = Math.sin(t * 0.9 + 1) * 0.02;

    this.camera.position.set(r.curPos.x + px + bx, r.curPos.y + py + by, r.curPos.z);
    this.camera.lookAt(r.curLook);
    this.camera.rotateZ(r.curRoll);
    if (Math.abs(this.camera.fov - r.curFov) > 0.01) { this.camera.fov = r.curFov; this.camera.updateProjectionMatrix(); }

    this.sky.position.copy(this.camera.position);
    this.sky.material.uniforms.uTime.value = t;
    this.dust.material.uniforms.uTime.value = t;
    this.grade.uniforms.uTime.value = t;
    this.composer.render(dt);
  }
}
