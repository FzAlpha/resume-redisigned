import { useEffect, useRef, useState } from 'react';

import { introDone } from '@/lib/intro';
import { motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

const LENS_CONFIG = {
  floating: true, // drag to move
  bevelMode: 1, // dome — a magnifier rather than a pill
  cornerRadius: 72,
  zRadius: 72,
  refraction: 0.95,
  chromAberration: 0.08,
  edgeHighlight: 0.12,
  specular: 0.25,
  fresnel: 1,
  shadowOpacity: 0.22,
  shadowSpread: 14,
  shadowOffsetY: 6,
};

const webglAvailable = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch {
    return false;
  }
};

/**
 * A draggable WebGL glass lens (ybouane/liquidglass) that refracts the hero name.
 * Must be rendered as a direct child of the hero section (the library's root).
 * Desktop + fine pointer + motion only; lazy-loaded; quietly absent if anything fails.
 */
export function LiquidLens({ className }: { className?: string }) {
  const lens = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled] = useState(
    () => motionEnabled() && window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches && webglAvailable(),
  );

  useEffect(() => {
    const el = lens.current;
    const root = el?.parentElement;
    if (!enabled || !el || !root) return;

    let instance: { destroy(): void; markChanged(el?: HTMLElement): void } | undefined;
    let themeObserver: MutationObserver | undefined;
    let cancelled = false;

    (async () => {
      // Capture the hero only once its entrance has settled and fonts are in.
      await introDone;
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 1700));
      if (cancelled) return;

      const { LiquidGlass } = await import('@ybouane/liquidglass');
      if (cancelled) return;
      el.dataset.config = JSON.stringify(LENS_CONFIG);
      instance = await LiquidGlass.init({ root, glassElements: [el] });
      if (cancelled) return instance.destroy();
      setReady(true);

      // Re-capture when the theme flips (colours change without a DOM mutation it watches).
      themeObserver = new MutationObserver(() => instance?.markChanged());
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    })().catch((err) => {
      console.warn('[LiquidLens] disabled:', err);
    });

    return () => {
      cancelled = true;
      themeObserver?.disconnect();
      instance?.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={lens}
      aria-hidden
      data-cursor="Drag"
      className={cn(
        'absolute z-10 size-36 rounded-full transition-opacity duration-700',
        ready ? 'opacity-100' : 'pointer-events-none opacity-0',
        className,
      )}
    />
  );
}
