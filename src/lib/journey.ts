/**
 * Colour journey — the page background changes as you scroll.
 *
 * Every section carries `data-journey="<palette>"`. As the next section's top travels from
 * 85% to 30% of the viewport, the five base colours (paper, ink, muted-ink, accent-ink, glow)
 * blend from the previous palette to the next and are written onto <html>. All other tokens
 * are color-mix()ed from those five in index.css, so the whole UI follows.
 *
 * Pinned sections hold their palette for the whole pin (their pin-spacer is measured), which is
 * what lets a section play a scroll animation *before* the colour changes.
 */
import { ScrollTrigger } from '@/lib/motion';

export type JourneyName = 'lichen' | 'lavender' | 'fog';

type Stop = { paper: string; ink: string; muted: string; accent: string; glow: string };

export const journeys: Record<JourneyName, Stop> = {
  // Pale lichen green.
  lichen: { paper: '#e3e8dc', ink: '#161b14', muted: '#5d6756', accent: '#3d6b26', glow: '#bccfa5' },
  // Soft lavender.
  lavender: { paper: '#ebe6f3', ink: '#1b1724', muted: '#6a6278', accent: '#6e55a8', glow: '#d4c6ee' },
  // Cool fog blue-grey.
  fog: { paper: '#e4e8ec', ink: '#11161b', muted: '#5c6670', accent: '#2a5b8c', glow: '#b4c7da' },
};

/** Palettes cycled across case studies, so each project page has its own colour. */
export const projectJourneys: JourneyName[] = ['lichen', 'lavender', 'fog'];

const VARS: Record<keyof Stop, string> = {
  paper: '--paper',
  ink: '--ink',
  muted: '--muted-ink',
  accent: '--accent-ink',
  glow: '--glow',
};

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const l = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${l(r1, r2)} ${l(g1, g2)} ${l(b1, b2)})`;
};
// Ease the blend so the change gathers, then settles.
const smooth = (t: number) => t * t * (3 - 2 * t);

const html = () => document.documentElement;

/** Current colours of the page, for canvas code that can't read CSS (e.g. the hero shader). */
export const journeyColor = (key: keyof Stop) => getComputedStyle(html()).getPropertyValue(VARS[key]).trim();

/** Wires the journey for every [data-journey] inside `root`. Returns a cleanup. */
export function initJourney(root: HTMLElement, onChange?: () => void) {
  const nodes = [...root.querySelectorAll<HTMLElement>('[data-journey]')];
  if (!nodes.length) return () => {};
  const names = nodes.map((n) => (n.dataset.journey as JourneyName) in journeys ? (n.dataset.journey as JourneyName) : 'fog');

  let tops: number[] = [];
  let last = '';

  const measure = () => {
    tops = nodes.map((n) => {
      const box = n.parentElement?.classList.contains('pin-spacer') ? n.parentElement : n;
      return box.getBoundingClientRect().top + window.scrollY;
    });
  };

  const update = () => {
    const vh = window.innerHeight;
    const edge = window.scrollY + vh * 0.85;
    let i = 0;
    while (i + 1 < tops.length && tops[i + 1] <= edge) i++;
    const t = i === 0 ? 1 : smooth(Math.min(1, Math.max(0, (edge - tops[i]) / (vh * 0.55))));
    const to = journeys[names[i]];
    const from = journeys[names[Math.max(0, i - 1)]];

    const style = html().style;
    let signature = '';
    for (const key of Object.keys(VARS) as (keyof Stop)[]) {
      const value = mix(from[key], to[key], t);
      style.setProperty(VARS[key], value);
      signature += value;
    }
    html().dataset.journey = t > 0.5 ? names[i] : names[Math.max(0, i - 1)];
    if (signature !== last) {
      last = signature;
      onChange?.();
    }
  };

  const refresh = () => {
    measure();
    update();
  };

  refresh();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', refresh);
  // ScrollTrigger adds pin spacing after mount; re-measure whenever it refreshes.
  ScrollTrigger.addEventListener('refresh', refresh);
  const ro = new ResizeObserver(refresh);
  ro.observe(root);

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', refresh);
    ScrollTrigger.removeEventListener('refresh', refresh);
    ro.disconnect();
    for (const v of Object.values(VARS)) html().style.removeProperty(v);
    delete html().dataset.journey;
  };
}
