import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

import { gsap, motionEnabled } from '@/lib/motion';

/** 1px signal-coloured hairline across the top that fills as you scroll. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionEnabled()) return;
    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 0, end: 'max', scrub: 0.3 } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [pathname]);

  return <div ref={ref} aria-hidden className="fixed inset-x-0 top-0 z-50 h-px origin-left scale-x-0 bg-signal" />;
}
