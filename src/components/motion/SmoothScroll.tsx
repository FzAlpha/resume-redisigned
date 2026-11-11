import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { gsap, motionEnabled, ScrollTrigger } from '@/lib/motion';
import { setLenis } from '@/lib/scroll';

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays frame-perfect. */
export function SmoothScroll() {
  useEffect(() => {
    if (!motionEnabled()) return;

    // Phones: the address bar showing/hiding changes the viewport height mid-scroll; don't re-lay-out every
    // pin for that. And run touch scrolling on the main thread, in step with ScrollTrigger, so a fast fling
    // can't race past a pinned section (the ribbon interludes, the prologue) and snap back.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const touchOnly = ScrollTrigger.isTouch === 1;
    let normalized = false;
    const normalize = (on: boolean) => {
      if (!touchOnly || on === normalized) return;
      normalized = on;
      ScrollTrigger.normalizeScroll(on ? { allowNestedScroll: true } : false);
    };
    // Not while the preloader holds the page still or a dialog is open (they own scrolling then).
    const syncNormalize = () =>
      normalize(!document.documentElement.classList.contains('is-loading') && !document.body.hasAttribute('data-scroll-locked'));
    syncNormalize();
    const loadWatch = new MutationObserver(syncNormalize);
    loadWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.4 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    // The preloader's layout effect runs before this one; honour its scroll lock.
    if (document.documentElement.classList.contains('is-loading')) lenis.stop();

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Radix dialogs lock the body (data-scroll-locked); pause Lenis while they're open.
    const observer = new MutationObserver(() => {
      // Dialogs scroll themselves; hand touch back to the browser while one is open.
      const locked = document.body.hasAttribute('data-scroll-locked');
      if (locked) lenis.stop();
      else lenis.start();
      syncNormalize();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });

    return () => {
      observer.disconnect();
      loadWatch.disconnect();
      normalize(false);
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
