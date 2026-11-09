import { useEffect, useRef } from 'react';

import { initScrollAnimations } from '@/lib/animations';
import { motionEnabled, ScrollTrigger } from '@/lib/motion';

/** Attach to a page's root element; wires up every data-* animation inside it. */
export function usePageAnimations<T extends HTMLElement>(key?: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionEnabled()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Split text only after the web fonts are in, or line breaks are measured wrong.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      cleanup = initScrollAnimations(root);
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [key]);

  return ref;
}
