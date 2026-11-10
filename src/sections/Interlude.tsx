import { useEffect, useRef } from 'react';

import { gsap, motionEnabled, ScrollTrigger } from '@/lib/motion';

/**
 * Ribbon interlude — the horizontal scroll moment that plays *before* each colour change.
 *
 * The section pins and a twisting ribbon draws itself across the screen as you scroll. One smooth
 * curve with a single loop; the band tapers at both ends and turns over a few times along its
 * length, its front face lit and its back face darker, so it reads as a 3D strip. It is drawn in
 * the current section's accent colour. The section has no palette of its own, so the page keeps
 * its colour until the pin releases and the next section brings the new one.
 *
 * `direction="reverse"` mirrors it (drawn right to left).
 */

// The ribbon's centre line, passed through a centripetal Catmull-Rom spline.
// The waves either side are generated to fit the width (one swell per ~canvas-height), so a wide
// screen gets more and deeper curves instead of a stretched, flat line. The knot is placed in units of the canvas *height* around the centre, so it keeps the
// same tall, round shape on a phone and on a wide monitor (stretching it with the width flattens it).
// It loops *above* the ribbon, and its turn stays wide relative to the band so the band never folds.

// [x offset from the centre in heights, y as a fraction of the height] — the phone-sized knot,
// expressed in heights so every screen gets the same shape.
const KNOT: [number, number][] = [
  [-0.083, 0.6],
  [0.055, 0.46],
  [0.096, 0.26],
  [0, 0.13],
  [-0.11, 0.24],
  [-0.083, 0.44],
  [0.055, 0.62],
];


// Swing pattern for the waves (+ is up), varied so it never looks mechanical.
const SWING = [0.85, -0.7, 1, -0.55, 0.8, -0.9, 0.65, -0.8];
const MID = 0.62; // the ribbon's resting height, where it meets the knot

/** Waves between x0 and x1: one swell per ~canvas-height, so wide screens get more, deeper curves. */
function waves(x0: number, x1: number, w: number, h: number, offset: number): Pt[] {
  const span = x1 - x0;
  const count = Math.max(1, Math.round(span / (h * 0.62)));
  const amp = h * (w / h > 2 ? 0.24 : 0.16); // deeper on wide screens, gentler on phones
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const x = x0 + (span * i) / count;
    pts.push({ x, y: MID * h - amp * SWING[(i + offset) % SWING.length] });
  }
  return pts;
}

const spinePoints = (w: number, h: number) => {
  const knot = KNOT.map(([dx, y]) => ({ x: 0.5 * w + dx * h, y: y * h }));
  const knotLeft = Math.min(...knot.map((p) => p.x));
  const knotRight = Math.max(...knot.map((p) => p.x));
  const gap = h * 0.22; // clear air between the waves and the knot
  return [
    ...waves(-0.06 * w, knotLeft - gap, w, h, 0),
    ...knot,
    ...waves(knotRight + gap, 1.06 * w, w, h, 1),
    { x: 1.08 * w, y: MID * h - h * 0.08 },
  ];
};
const SAMPLES = 1100;
const TWISTS = 2.75;

type Pt = { x: number; y: number };

/** Centripetal Catmull-Rom (alpha 0.5): no cusps or overshoot, even with uneven spacing. */
function spline(points: Pt[], samples: number): Pt[] {
  const out: Pt[] = [];
  const pts = [points[0], ...points, points[points.length - 1]];
  const per = Math.ceil(samples / (points.length - 1));
  for (let i = 0; i < pts.length - 3; i++) {
    const [p0, p1, p2, p3] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
    const t = (a: Pt, b: Pt, prev: number) => prev + Math.max(1e-4, Math.hypot(b.x - a.x, b.y - a.y) ** 0.5);
    const t0 = 0;
    const t1 = t(p0, p1, t0);
    const t2 = t(p1, p2, t1);
    const t3 = t(p2, p3, t2);
    for (let k = 0; k < per; k++) {
      const u = t1 + ((t2 - t1) * k) / per;
      const lerp = (a: Pt, b: Pt, ta: number, tb: number): Pt => ({
        x: ((tb - u) / (tb - ta)) * a.x + ((u - ta) / (tb - ta)) * b.x,
        y: ((tb - u) / (tb - ta)) * a.y + ((u - ta) / (tb - ta)) * b.y,
      });
      const a1 = lerp(p0, p1, t0, t1);
      const a2 = lerp(p1, p2, t1, t2);
      const a3 = lerp(p2, p3, t2, t3);
      const b1 = lerp(a1, a2, t0, t2);
      const b2 = lerp(a2, a3, t1, t3);
      out.push(lerp(b1, b2, t1, t2));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

/** Resample to even arc length, so scrolling draws at a steady pace. */
function even(points: Pt[], count: number): Pt[] {
  const acc = [0];
  for (let i = 1; i < points.length; i++) acc.push(acc[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  const total = acc[acc.length - 1];
  const out: Pt[] = [];
  let j = 1;
  for (let i = 0; i < count; i++) {
    const s = (total * i) / (count - 1);
    while (j < acc.length - 1 && acc[j] < s) j++;
    const f = (s - acc[j - 1]) / Math.max(1e-6, acc[j] - acc[j - 1]);
    out.push({ x: points[j - 1].x + (points[j].x - points[j - 1].x) * f, y: points[j - 1].y + (points[j].y - points[j - 1].y) * f });
  }
  return out;
}

const rgb = (css: string) => {
  const m = css.match(/[\d.]+/g);
  if (!m) return [60, 100, 40];
  return m.slice(0, 3).map(Number);
};
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export function Interlude({ direction = 'forward', label }: { direction?: 'forward' | 'reverse'; label: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const hex = counter.current;
    if (!el || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let spine: Pt[] = [];
    let progress = motionEnabled() ? 0 : 1;

    // Per-sample geometry, rebuilt on resize: edge points either side of the spine, and shading.
    let left: Pt[] = [];
    let right: Pt[] = [];
    let facing: number[] = [];
    let broad: number[] = [];
    let base = 20;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pts = spinePoints(w, h);
      spine = even(spline(pts, SAMPLES), SAMPLES);
      base = Math.min(h * 0.05, w * 0.05, 22); // band:knot ratio is the same on every screen, so the knot stays open

      const last = spine.length - 1;
      left = [];
      right = [];
      facing = [];
      broad = [];
      for (let i = 0; i <= last; i++) {
        // Tangent from a wide central difference: smooth normals even through the tight loop.
        const a = spine[Math.max(0, i - 4)];
        const b = spine[Math.min(last, i + 4)];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const nx = -(b.y - a.y) / len;
        const ny = (b.x - a.x) / len;
        const t = i / last;
        const taper = 0.15 + 0.85 * Math.sin(Math.PI * t) ** 0.6; // thin at both ends
        const phi = t * Math.PI * 2 * TWISTS; // the twist
        const half = base * taper * Math.cos(phi); // projected half-width: 0 when edge-on
        const p = spine[i];
        left.push({ x: p.x + nx * half, y: p.y + ny * half });
        right.push({ x: p.x - nx * half, y: p.y - ny * half });
        const s = Math.sin(phi);
        facing.push(Math.min(1, Math.max(0, (s + 0.35) / 0.7))); // 0 = back face, 1 = front face, eased across the turn
        broad.push(Math.abs(Math.cos(phi))); // broad-on faces catch the most light
      }
      render();
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const n = Math.floor(progress * (spine.length - 1));
      if (n < 1) return;
      // Colours from the live palette. The section's text colour is the accent (text-accent-ink);
      // the page colour is on <html>.
      const accent = rgb(getComputedStyle(el).color);
      const paper = rgb(getComputedStyle(document.documentElement).backgroundColor);
      const lit = mix(accent, [255, 255, 255], 0.5);
      const deep = mix(accent, [0, 0, 0], 0.2);
      const back = mix(accent, paper, 0.5);

      for (let i = 0; i < n; i++) {
        // Each quad spans two samples, so neighbours overlap and no seam ever shows.
        const j = Math.min(n, i + 2);
        const front = mix(deep, lit, broad[i] ** 0.8 * 0.85);
        const rear = mix(back, deep, 0.2 + broad[i] * 0.3);
        const c = mix(rear, front, facing[i] * facing[i] * (3 - 2 * facing[i]));
        ctx.fillStyle = `rgb(${c[0]} ${c[1]} ${c[2]})`;
        ctx.beginPath();
        ctx.moveTo(left[i].x, left[i].y);
        ctx.lineTo(left[j].x, left[j].y);
        ctx.lineTo(right[j].x, right[j].y);
        ctx.lineTo(right[i].x, right[i].y);
        ctx.closePath();
        ctx.fill();
      }
      // A soft glow at the drawing end while it's still moving.
      if (progress < 0.995) {
        const p = spine[n];
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, base * 2.2);
        g.addColorStop(0, `rgb(${lit[0]} ${lit[1]} ${lit[2]} / 0.55)`);
        g.addColorStop(1, `rgb(${lit[0]} ${lit[1]} ${lit[2]} / 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, base * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (hex) hex.textContent = `0x${Math.round(progress * 255).toString(16).toUpperCase().padStart(2, '0')}`;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(cv);

    if (!motionEnabled()) return () => ro.disconnect();

    const gctx = gsap.context(() => {
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => {
          progress = state.p;
          render();
        },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, anticipatePin: 1 },
      });
    }, el);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => {
      ro.disconnect();
      gctx.revert();
    };
  }, []);

  return (
    <section ref={root} aria-label={label} className="relative flex h-svh flex-col items-center justify-center overflow-hidden text-accent-ink">
      <canvas
        ref={canvas}
        aria-hidden
        className="h-[clamp(14rem,48vh,32rem)] w-full"
        style={direction === 'reverse' ? { transform: 'scaleX(-1)' } : undefined}
      />
      <p className="mt-6 flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
        <span>{label}</span>
        <span aria-hidden className="h-px w-8 bg-current opacity-40" />
        <span ref={counter} className="tabular-nums text-accent-ink">
          0x00
        </span>
      </p>
    </section>
  );
}
