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
 *   data-grow            bar grows from the left
 *   data-chars           heading: letters start scattered and assemble as you scroll (scrubbed)
 *   data-fill            big text fills from outline to solid ink as you scroll (scrubbed)
 *   data-scrub-x="-25"   element slides horizontally by N% across its pass through the viewport
 *   data-speed="0.85"    parallax depth: < 1 lags behind the page, > 1 runs ahead
 *   data-skew            leans with scroll velocity, then settles
 *   data-clip-reveal     frame opens from an inset clip while its content zooms out (scrubbed)
 *   data-expand          section grows from a rounded inset card to full bleed (scrubbed)
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

    // ── Headings: scattered letters assemble (scrubbed) ──────────
    for (const el of q('[data-chars]')) {
      const split = new SplitType(el, { types: 'words,chars', wordClass: 'chars-word', charClass: 'chars-char' });
      splits.push(split);
      gsap.set(el, { visibility: 'visible' });
      const rand = gsap.utils.random;
      gsap.fromTo(
        split.chars,
        {
          opacity: 0,
          yPercent: () => rand(-160, 160),
          xPercent: () => rand(-60, 60),
          rotate: () => rand(-50, 50),
        },
        {
          opacity: 1,
          yPercent: 0,
          xPercent: 0,
          rotate: 0,
          ease: 'power2.out',
          stagger: { each: 0.02, from: 'random' },
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.8 },
        },
      );
    }

    // ── Outline → solid fill (scrubbed) ──────────────────────────
    for (const el of q('[data-fill]')) {
      gsap.fromTo(
        el,
        { backgroundSize: '0% 100%' },
        { backgroundSize: '100% 100%', ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 35%', scrub: 0.4 } },
      );
    }

    // ── Horizontal drift tied to scroll ──────────────────────────
    for (const el of q('[data-scrub-x]')) {
      const shift = Number(el.dataset.scrubX) || -20;
      gsap.fromTo(
        el,
        { xPercent: shift > 0 ? -shift : 0 },
        { xPercent: shift > 0 ? 0 : shift, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
      );
    }

    // ── Parallax depth ───────────────────────────────────────────
    for (const el of q('[data-speed]')) {
      const speed = Number(el.dataset.speed) || 1;
      gsap.fromTo(
        el,
        { y: () => (1 - speed) * innerHeight * 0.25 },
        {
          y: () => -(1 - speed) * innerHeight * 0.25,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        },
      );
    }

    // ── Frame opens from an inset clip, content zooms out ────────
    for (const el of q('[data-clip-reveal]')) {
      const inner = el.firstElementChild;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: 0.6 } });
      tl.fromTo(el, { clipPath: 'inset(14% 14% 14% 14% round 1.5rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 0.125rem)', ease: 'none' });
      if (inner) tl.fromTo(inner, { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
    }

    // ── Section grows to full bleed ──────────────────────────────
    for (const el of q('[data-expand]')) {
      gsap.fromTo(
        el,
        { clipPath: 'inset(6% 5% 0% 5% round 2.5rem)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0rem)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 15%', scrub: 0.5 } },
      );
    }

    // ── Lean with scroll velocity ────────────────────────────────
    const skewers = q('[data-skew]');
    if (skewers.length) {
      const setters = skewers.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.6, ease: 'power3' }));
      let settle = 0;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = gsap.utils.clamp(-5, 5, self.getVelocity() / -400);
          setters.forEach((set) => set(skew));
          window.clearTimeout(settle);
          settle = window.setTimeout(() => setters.forEach((set) => set(0)), 120);
        },
      });
      cleanups.push(() => window.clearTimeout(settle));
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
