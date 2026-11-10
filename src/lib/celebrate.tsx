import { toast } from 'sonner';

import { LottieTick } from '@/components/interaction/LottieTick';
import { motionEnabled } from '@/lib/motion';

/** Success toast with the self-drawing Lottie tick. */
export const toastSuccess = (message: string) => toast(message, { icon: <LottieTick /> });

/** One short confetti burst (tsParticles) from an element. Lazy-loaded; skipped under reduced motion. */
export async function confettiFrom(el: Element | null) {
  if (!el || !motionEnabled()) return;
  const r = el.getBoundingClientRect();
  const { confetti } = await import('@tsparticles/confetti');
  const signal = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim() || '#ff4f00';
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#0b0b0c';
  await confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 38,
    ticks: 180,
    scalar: 0.9,
    colors: [signal, ink, '#8a8a86'],
    // tsParticles positions are percentages of the viewport.
    position: { x: ((r.left + r.width / 2) / innerWidth) * 100, y: ((r.top + r.height / 2) / innerHeight) * 100 },
    zIndex: 90,
    disableForReducedMotion: true,
  });
}
