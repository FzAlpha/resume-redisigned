import { useEffect, useRef, type ReactNode } from 'react';

import { motionEnabled, ScrollTrigger } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Infinite marquee (after Magic UI's Marquee): content is rendered twice and slid by 50%.
 * Scroll velocity briefly speeds it up (and flips direction when scrolling up). Pauses on hover.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 40,
  gap = '3rem',
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  gap?: string;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || !motionEnabled()) return;
    const anim = el.getAnimations()[0];
    if (!anim) return;

    let decay = 0;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity() / 600; // px/s → rate boost
        anim.playbackRate = 1 + Math.min(Math.abs(v), 4) * Math.sign(v || 1);
        cancelAnimationFrame(decay);
        const settle = () => {
          anim.playbackRate += (1 - anim.playbackRate) * 0.08;
          if (Math.abs(anim.playbackRate - 1) > 0.01) decay = requestAnimationFrame(settle);
          else anim.playbackRate = 1;
        };
        decay = requestAnimationFrame(settle);
      },
    });
    return () => {
      st.kill();
      cancelAnimationFrame(decay);
    };
  }, []);

  return (
    <div
      className={cn('marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]', className)}
      data-reverse={reverse || undefined}
      style={{ '--marquee-duration': `${duration}s`, '--marquee-gap': gap } as React.CSSProperties}
    >
      <div ref={track} className="marquee-track flex w-max" style={{ gap }}>
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
