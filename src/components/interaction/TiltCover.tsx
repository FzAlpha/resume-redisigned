import { useRef, type PointerEvent, type ReactNode } from 'react';
import Atropos from 'atropos/react';
import 'atropos/atropos.css';

import { motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Case-study cover: Atropos tvOS-style 3D tilt with layered depth,
 * plus a cursor-lit spotlight (after Aceternity's Card Spotlight).
 */
export function TiltCover({ children, className }: { children: ReactNode; className?: string }) {
  const spot = useRef<HTMLDivElement>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = spot.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  }

  const spotlight = (
    <div
      ref={spot}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 rounded-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background:
          'radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklab, var(--signal) 14%, transparent), transparent 55%)',
      }}
    />
  );

  if (!motionEnabled() || !window.matchMedia('(pointer: fine)').matches) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <div className={cn('group relative', className)} onPointerMove={onMove} data-cursor="Tilt">
      <Atropos
        className="size-full [--atropos-perspective:1400px]"
        innerClassName="rounded-sm"
        rotateXMax={6}
        rotateYMax={8}
        shadow={false}
        highlight
        duration={500}
      >
        <div className="relative size-full">
          {children}
          {spotlight}
        </div>
      </Atropos>
    </div>
  );
}
