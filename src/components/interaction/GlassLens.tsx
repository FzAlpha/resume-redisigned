import { useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';

import { supportsRefraction, useLiquidGlass } from './useLiquidGlass';
import { motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

const SIZE = 144;

/**
 * A draggable liquid-glass lens over the hero name (Nordify technique). It refracts the
 * live page — text, contour shader and all — so nothing is captured or cached.
 * Desktop, fine pointer and Chromium (real refraction) only.
 */
export function GlassLens({ className }: { className?: string }) {
  const lens = useRef<HTMLDivElement>(null);
  const [enabled] = useState(
    () => supportsRefraction && motionEnabled() && window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches,
  );
  const glass = useLiquidGlass(lens, { radius: SIZE / 2, rim: 1.5, blur: 0, saturate: 1.25, reflectStrength: 3 }, enabled);
  const start = useRef({ left: 0, top: 0 });

  // Moved with left/top, never transform (a transform would make it a backdrop root).
  const bind = useDrag(
    ({ first, movement: [mx, my] }) => {
      const el = lens.current;
      if (!el) return;
      if (first) start.current = { left: el.offsetLeft, top: el.offsetTop };
      const parent = el.offsetParent as HTMLElement | null;
      const maxX = (parent?.clientWidth ?? innerWidth) - SIZE;
      const maxY = (parent?.clientHeight ?? innerHeight) - SIZE;
      el.style.left = `${Math.max(0, Math.min(maxX, start.current.left + mx))}px`;
      el.style.top = `${Math.max(0, Math.min(maxY, start.current.top + my))}px`;
      el.style.right = 'auto';
      glass.current?.update();
    },
    { filterTaps: true },
  );

  if (!enabled) return null;

  return (
    <div
      ref={lens}
      {...bind()}
      aria-hidden
      data-cursor="Drag"
      className={cn('absolute z-10 cursor-grab touch-none rounded-full active:cursor-grabbing', className)}
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Content must be an element (bare text is not raised above the glass layers). */}
      <span className="flex size-full items-end justify-center pb-3 font-mono text-[0.6rem] tracking-widest text-foreground/50 uppercase select-none">
        drag
      </span>
    </div>
  );
}
