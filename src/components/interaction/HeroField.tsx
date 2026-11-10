import { lazy, Suspense, useEffect, useState } from 'react';

import { introDone } from '@/lib/intro';
import { motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

// React Bits "Antigravity" (vendored, see src/vendor/react-bits). Lazy so it never weighs on first paint.
const Antigravity = lazy(() => import('@/vendor/react-bits/Antigravity'));

// Green only: three shades of the lichen accent, so the ring varies a little in tone.
const colors = ['#3d6b26', '#5f8f3e', '#2c4f1b'];

/**
 * Hero background: round particles (they stay circles, never stretch into pills) gather into a
 * ring around the cursor as it approaches, then settle back into the field (click to burst). Mounted after the entrance; absent under
 * reduced motion.
 */
export function HeroField({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!motionEnabled()) return;
    let cancelled = false;
    introDone.then(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 transition-opacity duration-[1500ms]', visible ? 'opacity-100' : 'opacity-0', className)}
    >
      {ready && (
        <Suspense fallback={null}>
          <Antigravity
            colors={colors}
            lightMode
            count={1400}
            ringRadius={7}
            magnetRadius={10}
            particleSize={0.45}
            waveAmplitude={0.35}
            waveCount={3}
            lerpSpeed={0.05}
            particleShape="sphere"
            colorMode="conic"
            colorSpeed={0.04}
            ambient={0} // dots away from the ring are invisible; only the ring shows
            opacity={0.9}
          />
        </Suspense>
      )}
    </div>
  );
}
