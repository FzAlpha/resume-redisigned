import type Lenis from 'lenis';

// The single Lenis instance (null when smooth scroll is off, e.g. reduced motion).
let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
  if (import.meta.env.DEV) Object.assign(window, { lenis: instance });
};
export const getLenis = () => lenis;

// Sections carry `scroll-mt-20`, which both Lenis and scrollIntoView respect, so no extra offset here.
export function scrollToId(id: string, { immediate = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { immediate, duration: 1.4 });
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' });
}

export function scrollToTop({ immediate = false } = {}) {
  if (lenis) lenis.scrollTo(0, { immediate, duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
