import { useEffect, useRef, useState } from 'react';

import { gsap, motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Custom cursor in the spirit of React Bits' cursors: a dot that tracks the pointer exactly
 * and a ring that trails it. Hovering links/buttons grows the ring; elements with
 * data-cursor="View" (or any label) turn it into a labelled pill. Fine pointers only.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => motionEnabled() && window.matchMedia('(pointer: fine)').matches);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-cursor');

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      setHidden(false);
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>('[data-cursor]');
      const interactive = target?.closest('a, button, [role="button"], summary, label, [data-cursor]');
      setLabel(labelled?.dataset.cursor || null);
      setHovering(!!interactive);
    };
    const onLeave = () => setHidden(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className={cn('pointer-events-none fixed inset-0 z-[80] transition-opacity duration-300', hidden && 'opacity-0')}>
      <div ref={ring} className="absolute top-0 left-0">
        <div
          className={cn(
            'flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-500 ease-out-expo',
            label
              ? 'h-20 w-20 border-transparent bg-foreground text-background'
              : hovering
                ? 'h-12 w-12 border-foreground/40 bg-foreground/5'
                : 'h-8 w-8 border-foreground/25',
          )}
        >
          <span className={cn('text-label transition-opacity duration-200', label ? 'opacity-100' : 'opacity-0')}>{label}</span>
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0">
        <div
          className={cn(
            'size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal transition-transform duration-300',
            label && 'scale-0',
          )}
        />
      </div>
    </div>
  );
}
