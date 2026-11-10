import { useLayoutEffect, useRef, type RefObject } from 'react';

import { createLiquidGlass, type LiquidGlassOptions } from '@/vendor/liquid-glass/liquid-glass';

export { supportsRefraction } from '@/vendor/liquid-glass/liquid-glass';

type Glass = ReturnType<typeof createLiquidGlass>;

/**
 * Turns `ref` into Nordify-style liquid glass (SVG displacement through backdrop-filter;
 * Chromium refracts, Safari/Firefox get frosted glass). Follows the site theme.
 *
 * The host and its ancestors must not have transform, opacity, filter, isolation,
 * will-change or overflow:hidden — each makes a backdrop root and kills the refraction.
 */
export function useLiquidGlass<T extends HTMLElement>(ref: RefObject<T | null>, options: LiquidGlassOptions, enabled = true) {
  const glass = useRef<Glass | null>(null);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host || !enabled) return;
    // promote: false — it would put will-change on <main>, which re-parents fixed descendants.
    glass.current = createLiquidGlass(host, { promote: false, ...options });
    return () => {
      glass.current?.destroy();
      glass.current = null;
    };
    // Options are read once at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return glass;
}
