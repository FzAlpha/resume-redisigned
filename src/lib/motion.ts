import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dev-only handle for debugging animations from the console.
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

/** DESIGN.md motion tokens, in GSAP terms. */
export const ease = {
  out: 'expo.out', // ≈ cubic-bezier(.16, 1, .3, 1)
  inOut: 'power4.inOut', // ≈ cubic-bezier(.76, 0, .24, 1)
} as const;
export const dur = { fast: 0.18, base: 0.45, slow: 0.9 } as const;
export const stagger = 0.04;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Motion is on when the inline script in index.html added `.js-anim` (JS ran, no reduced-motion). */
export const motionEnabled = () => document.documentElement.classList.contains('js-anim');

export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export { gsap, ScrollTrigger };
