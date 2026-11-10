import { useEffect, useRef } from 'react';

import { initScrollAnimations } from '@/lib/animations';
import { initJourney } from '@/lib/journey';
import { motionEnabled, ScrollTrigger } from '@/lib/motion';

/** Attach to a page's root element; wires up every data-* animation inside it. */
export function usePageAnimations<T extends HTMLElement>(key?: string) {
  const ref = useRef<T>(null);

  // The colour journey is not motion (it's colour tied to position), so it runs even under reduced motion.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const stop = initJourney(root, () => window.dispatchEvent(new Event('journeychange')));
    return stop;
  }, [key]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionEnabled()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Split text only after the web fonts are in, or line breaks are measured wrong.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      cleanup = initScrollAnimations(root);
      // Section effects (pins, stacking cards) are created separately; order every
      // trigger by page position so pin spacing is accounted for, then measure.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [key]);

  return ref;
}
