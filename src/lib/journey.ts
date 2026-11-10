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

export type JourneyName = 'night' | 'bone' | 'lichen' | 'fog' | 'sand' | 'clay';

type Stop = { paper: string; ink: string; muted: string; accent: string; glow: string };

export const journeys: Record<JourneyName, { light: Stop; dark: Stop }> = {
  // Carbon night with an ember glow: the hero and its prologue, in both themes.
  night: {
    light: { paper: '#100e0c', ink: '#f2ece2', muted: '#9c9488', accent: '#ff8a4c', glow: '#5c2810' },
    dark: { paper: '#080707', ink: '#ece6dc', muted: '#8a837a', accent: '#ff8a4c', glow: '#3d1a0a' },
  },
  // Warm bone paper.
  bone: {
    light: { paper: '#f1ece2', ink: '#16130f', muted: '#6d665c', accent: '#b8430f', glow: '#f3c9a4' },
    dark: { paper: '#17130f', ink: '#ece6dc', muted: '#968e82', accent: '#ff8a4c', glow: '#4a2c16' },
  },
  // Pale lichen green.
  lichen: {
    light: { paper: '#e3e8dc', ink: '#161b14', muted: '#5d6756', accent: '#3d6b26', glow: '#bccfa5' },
    dark: { paper: '#0f1810', ink: '#e1e8da', muted: '#89957f', accent: '#9fd17a', glow: '#25381c' },
  },
  // Cool fog blue-grey.
  fog: {
    light: { paper: '#e4e8ec', ink: '#11161b', muted: '#5c6670', accent: '#2a5b8c', glow: '#b4c7da' },
    dark: { paper: '#0e151d', ink: '#e0e6ec', muted: '#8792a0', accent: '#8cb8e6', glow: '#1d2e42' },
  },
  // Sun-warmed sand.
  sand: {
    light: { paper: '#efe4d2', ink: '#1d160d', muted: '#73624b', accent: '#a8500c', glow: '#f1bd86' },
    dark: { paper: '#1b140b', ink: '#efe5d6', muted: '#998a72', accent: '#ffa25c', glow: '#4a2f12' },
  },
  // Dusty clay rose.
  clay: {
    light: { paper: '#ede2dc', ink: '#1e1412', muted: '#77605a', accent: '#a83a2a', glow: '#e8b3a3' },
    dark: { paper: '#1c110f', ink: '#efe2dd', muted: '#9c847c', accent: '#ff8f7a', glow: '#4a2019' },
  },
};

/** Palettes cycled across case studies, so each project page has its own colour. */
export const projectJourneys: JourneyName[] = ['fog', 'lichen', 'clay', 'sand'];

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
const theme = () => (html().classList.contains('dark') ? 'dark' : 'light');

/** Current colours of the page, for canvas code that can't read CSS (e.g. the hero shader). */
export const journeyColor = (key: keyof Stop) => getComputedStyle(html()).getPropertyValue(VARS[key]).trim();

/** Wires the journey for every [data-journey] inside `root`. Returns a cleanup. */
export function initJourney(root: HTMLElement, onChange?: () => void) {
  const nodes = [...root.querySelectorAll<HTMLElement>('[data-journey]')];
  if (!nodes.length) return () => {};
  const names = nodes.map((n) => (n.dataset.journey as JourneyName) in journeys ? (n.dataset.journey as JourneyName) : 'bone');

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
    const mode = theme();
    const to = journeys[names[i]][mode];
    const from = journeys[names[Math.max(0, i - 1)]][mode];

    const style = html().style;
    let signature = '';
    for (const key of Object.keys(VARS) as (keyof Stop)[]) {
      const value = mix(from[key], to[key], t);
      style.setProperty(VARS[key], value);
      signature += value;
    }
    // Glows only read well on light paper; on dark surfaces they turn muddy, so fade them out
    // as the paper darkens (black sections stay flat).
    const [r, g, b] = rgb(from.paper).map((c, k) => c + (rgb(to.paper)[k] - c) * t);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    style.setProperty('--glow-alpha', String(Math.min(1, Math.max(0, (lum - 0.35) / 0.4)).toFixed(3)));
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
  const themeObserver = new MutationObserver(update);
  themeObserver.observe(html(), { attributes: true, attributeFilter: ['class'] });

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', refresh);
    ScrollTrigger.removeEventListener('refresh', refresh);
    ro.disconnect();
    themeObserver.disconnect();
    for (const v of Object.values(VARS)) html().style.removeProperty(v);
    html().style.removeProperty('--glow-alpha');
    delete html().dataset.journey;
  };
}
