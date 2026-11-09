import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { gsap, motionEnabled, ScrollTrigger } from '@/lib/motion';
import { setLenis } from '@/lib/scroll';

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays frame-perfect. */
export function SmoothScroll() {
  useEffect(() => {
    if (!motionEnabled()) return;

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
      if (document.body.hasAttribute('data-scroll-locked')) lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
