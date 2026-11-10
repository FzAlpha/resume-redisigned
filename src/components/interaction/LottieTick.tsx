import { useEffect, useRef } from 'react';

import { motionEnabled } from '@/lib/motion';

/** A check that draws itself (hand-made Lottie, played with lottie-web's light SVG player, lazy-loaded). */
export function LottieTick({ size = 20 }: { size?: number }) {
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let anim: { destroy(): void; goToAndStop(v: number, isFrame?: boolean): void } | undefined;
    let cancelled = false;

    Promise.all([import('lottie-web/build/player/lottie_light'), import('@/assets/lottie/tick.json')]).then(
      ([{ default: lottie }, { default: animationData }]) => {
        if (cancelled) return;
        const animate = motionEnabled();
        anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: animate, animationData });
        if (!animate) anim.goToAndStop(39, true);
      },
    );

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);

  return <span ref={host} aria-hidden className="inline-block shrink-0" style={{ width: size, height: size }} />;
}
