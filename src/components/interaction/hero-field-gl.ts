import { Mesh, Program, Renderer, Triangle } from 'ogl';

import { ScrollTrigger } from '@/lib/motion';

// Topographic contour lines over a slowly drifting noise field. Monochrome ink at low alpha;
// lines near the cursor warm toward the signal colour. WebGL2 (fwidth for crisp 1px lines).
const vertex = /* glsl */ `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform vec3 uInk;
uniform vec3 uSignal;
uniform float uStrength;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * 0.035;

  // Domain-warped field, drifting slowly.
  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 4.2));
  float n = fbm(p * 1.1 + q * 1.4 + vec2(t * 0.6, -t * 0.4));

  // Gentle bulge around the cursor so the contours flow around it.
  vec2 m = uMouse * vec2(aspect, 1.0);
  float d = distance(p, m);
  float near = smoothstep(0.45, 0.0, d) * uMouseOn;
  n += near * 0.06;

  // Contour lines, ~1px wide regardless of density.
  float k = n * 14.0;
  float line = 1.0 - smoothstep(0.0, 1.25, abs(fract(k) - 0.5) / fwidth(k));

  // Fade toward the bottom-left where the name sits, so type always wins.
  float fade = smoothstep(-0.1, 0.9, vUv.y) * 0.6 + smoothstep(0.2, 1.0, vUv.x) * 0.4;

  vec3 col = mix(uInk, uSignal, near);
  float alpha = line * (uStrength * fade + near * 0.32);
  fragColor = vec4(col * alpha, alpha); // premultiplied
}
`;

function cssColor(name: string): [number, number, number] {
  // Resolve a CSS custom property to RGB via the browser's own parser.
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const [r, g, b] = getComputedStyle(probe).color.match(/[\d.]+/g)!.map(Number);
  probe.remove();
  return [r / 255, g / 255, b / 255];
}

/** Mounts the field into `canvasHost` and returns a cleanup function. */
export function mountHeroField(canvasHost: HTMLElement, trigger: HTMLElement) {
  const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: true, premultipliedAlpha: true, antialias: false });
  const gl = renderer.gl;
  if (!(gl instanceof WebGL2RenderingContext)) throw new Error('WebGL2 unavailable');
  gl.clearColor(0, 0, 0, 0);
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  canvasHost.appendChild(canvas);

  // Strength follows the surface the lines sit on, not the theme: the hero is dark in both.
  const isDark = () => {
    const [r, g, b] = cssColor('--paper');
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
  };
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uMouse: { value: [0.7, 0.6] },
      uMouseOn: { value: 0 },
      uInk: { value: cssColor('--ink') },
      uSignal: { value: cssColor('--signal') },
      uStrength: { value: isDark() ? 0.16 : 0.11 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const { width, height } = canvasHost.getBoundingClientRect();
    renderer.setSize(width, height);
    program.uniforms.uRes.value = [width, height];
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvasHost);

  // Cursor, eased.
  const target = { x: 0.7, y: 0.6, on: 0 };
  const onMove = (e: PointerEvent) => {
    const r = canvasHost.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
    target.on = e.pointerType === 'mouse' ? 1 : 0;
  };
  const onLeave = () => (target.on = 0);
  trigger.addEventListener('pointermove', onMove);
  trigger.addEventListener('pointerleave', onLeave);

  // Re-read colours on theme change and as the colour journey moves.
  const recolor = () => {
    program.uniforms.uInk.value = cssColor('--ink');
    program.uniforms.uSignal.value = cssColor('--signal');
    program.uniforms.uStrength.value = isDark() ? 0.16 : 0.11;
  };
  const themeObserver = new MutationObserver(recolor);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('journeychange', recolor);

  // Render only while the hero is on screen and the tab is visible.
  let raf = 0;
  let running = false;
  const start = performance.now();
  const frame = (now: number) => {
    const u = program.uniforms;
    u.uTime.value = (now - start) / 1000;
    const [mx, my] = u.uMouse.value as number[];
    u.uMouse.value = [mx + (target.x - mx) * 0.06, my + (target.y - my) * 0.06];
    u.uMouseOn.value += (target.on - u.uMouseOn.value) * 0.05;
    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(frame);
  };
  const play = () => {
    if (running || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const st = ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? play() : pause()) });
  if (st.isActive) play();
  const onVisibility = () => (document.hidden ? pause() : st.isActive && play());
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    pause();
    st.kill();
    ro.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('journeychange', recolor);
    document.removeEventListener('visibilitychange', onVisibility);
    trigger.removeEventListener('pointermove', onMove);
    trigger.removeEventListener('pointerleave', onLeave);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
}
