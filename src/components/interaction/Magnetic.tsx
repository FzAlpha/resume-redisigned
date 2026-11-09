import { useEffect, useRef, type ReactNode } from 'react';

import { gsap, motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Magnetic wrapper (after React Bits' Magnet): the child leans toward the pointer
 * while it's within `padding` px of the element, and springs back on leave.
 */
export function Magnetic({
  children,
  strength = 0.35,
  padding = 24,
  className,
}: {
  children: ReactNode;
  strength?: number;
  padding?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionEnabled() || !window.matchMedia('(pointer: fine)').matches) return;

    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    let inside = false;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const near =
        e.clientX > r.left - padding && e.clientX < r.right + padding && e.clientY > r.top - padding && e.clientY < r.bottom + padding;
      if (near) {
        inside = true;
        x((e.clientX - cx) * strength);
        y((e.clientY - cy) * strength);
      } else if (inside) {
        inside = false;
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, padding]);

  return (
    <span ref={ref} className={cn('inline-flex will-change-transform', className)}>
      {children}
    </span>
  );
}
