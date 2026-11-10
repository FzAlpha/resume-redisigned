import SplitType from 'split-type';
import baffle from 'baffle';
import Ukiyo from 'ukiyojs';

import { dur, ease, gsap, ScrollTrigger, stagger } from '@/lib/motion';

/**
 * Declarative scroll animations. Components only add data attributes:
 *
 *   data-split           headline: words rise from a line mask when it enters
 *   data-scrub-words     paragraph: each word goes 15% → 100% opacity, scrubbed by scroll
 *   data-stagger         container: direct children fade up one after another
 *   data-count="200"     number counts up from 0
 *   data-scramble        mono label decodes from noise (Baffle)
 *   data-parallax        image drifts inside its frame (Ukiyo)
 *
 * Returns a cleanup function. Only called when motion is enabled.
 */
export function initScrollAnimations(root: HTMLElement) {
  const splits: SplitType[] = [];
  const cleanups: (() => void)[] = [];
  const q = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T & HTMLElement>(sel));
  const enter = (trigger: Element, start = 'top 88%') => ({ trigger, start, once: true });

  const ctx = gsap.context(() => {
    // ── Headlines: line-mask rise ────────────────────────────────
    for (const el of q('[data-split]')) {
      const split = new SplitType(el, { types: 'lines,words', lineClass: 'split-line', wordClass: 'split-word' });
      splits.push(split);
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(
        split.words,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: dur.slow * 1.15,
          ease: ease.out,
          stagger,
          scrollTrigger: enter(el),
          // Lines are measured at split time; restore natural text so resizing reflows correctly.
          onComplete: () => split.revert(),
        },
      );
    }

    // ── Statement: scroll-scrubbed word opacity ──────────────────
    for (const el of q('[data-scrub-words]')) {
      const split = new SplitType(el, { types: 'words', wordClass: 'scrub-word' });
      splits.push(split);
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(
        split.words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
        },
      );
    }

    // ── Lists & groups: staggered fade-up ────────────────────────
    for (const el of q('[data-stagger]')) {
      const items = Array.from(el.children) as HTMLElement[];
      gsap.fromTo(
        items,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: dur.slow, ease: ease.out, stagger: 0.07, scrollTrigger: enter(el, 'top 90%') },
      );
    }

    // ── Bars: grow from the left (activity BarList) ──────────────
    for (const el of q('[data-grow]')) {
      gsap.fromTo(
        el,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, ease: ease.out, scrollTrigger: enter(el, 'top 92%') },
      );
    }

    // ── Numbers: count up ────────────────────────────────────────
    for (const el of q('[data-count]')) {
      const target = Number(el.dataset.count);
      const state = { v: 0 };
      el.textContent = '0';
      gsap.to(state, {
        v: target,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: enter(el, 'top 92%'),
        onUpdate: () => {
          el.textContent = String(Math.round(state.v));
        },
      });
    }
    // ── Labels: decode from noise (Baffle) on enter ──────────────
    for (const el of q('[data-scramble]')) {
      ScrollTrigger.create({
        ...enter(el, 'top 92%'),
        onEnter: () => {
          el.style.visibility = 'visible';
          const b = baffle(el, { characters: '█▓▒░/\\<>_-+=*#', speed: 45 }).start().reveal(650, 120);
          cleanups.push(() => b.stop());
        },
      });
    }
  }, root);

  // ── Images: parallax inside frame (Ukiyo) ──────────────────────
  const parallaxEls = q('[data-parallax]');
  if (parallaxEls.length) {
    const ukiyo = new Ukiyo(parallaxEls, { scale: 1.25, speed: 1.4, willChange: true, wrapperClass: 'ukiyo-wrap' });
    cleanups.push(() => ukiyo.destroy());
  }

  return () => {
    ctx.revert();
    splits.forEach((s) => s.revert());
    cleanups.forEach((fn) => fn());
  };
}
