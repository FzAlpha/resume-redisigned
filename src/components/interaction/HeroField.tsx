import { useEffect, useRef, useState } from 'react';

import { introDone } from '@/lib/intro';
import { motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Animated contour-line background for the hero (OGL shader, lazy-loaded).
 * Fades in after the entrance; absent under reduced motion or without WebGL2.
 */
export function HeroField({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    const section = el?.closest('section');
    if (!el || !section || !motionEnabled()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      await introDone;
      const { mountHeroField } = await import('./hero-field-gl');
      if (cancelled) return;
      cleanup = mountHeroField(el, section);
      requestAnimationFrame(() => setVisible(true));
    })().catch((err) => console.warn('[HeroField] disabled:', err));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 transition-opacity duration-[2000ms]', visible ? 'opacity-100' : 'opacity-0', className)}
    />
  );
}
