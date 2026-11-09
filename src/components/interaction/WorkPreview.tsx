import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { ProjectCover } from '@/components/site/ProjectCover';
import { projects } from '@/content/projects';
import { gsap, motionEnabled } from '@/lib/motion';

/**
 * Floating preview that trails the cursor over the Selected-work list.
 * It leans into the direction of travel (velocity → rotation) and cross-fades between projects.
 * Rows mark themselves with data-preview="<index>".
 */
export function WorkPreview({ listRef }: { listRef: React.RefObject<HTMLElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [enabled] = useState(() => motionEnabled() && window.matchMedia('(pointer: fine) and (min-width: 768px)').matches);

  useEffect(() => {
    const list = listRef.current;
    const el = box.current;
    if (!enabled || !list || !el) return;

    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' });
    // 'rotation' (GSAP's own name) — quickTo can't reset the 'rotate' alias.
    const rot = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3' });
    let lastX = 0;

    const onMove = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      rot(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
      const row = (e.target as Element).closest<HTMLElement>('[data-preview]');
      setActive(row ? Number(row.dataset.preview) : null);
    };
    const onLeave = () => setActive(null);

    // Start at the cursor so the first frame doesn't fly in from the corner.
    const onEnter = (e: PointerEvent) => {
      gsap.set(el, { x: e.clientX, y: e.clientY });
      lastX = e.clientX;
    };

    list.addEventListener('pointerenter', onEnter);
    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', onLeave);
    return () => {
      list.removeEventListener('pointerenter', onEnter);
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, listRef]);

  if (!enabled) return null;

  return (
    <div ref={box} aria-hidden className="pointer-events-none fixed top-0 left-0 z-30">
      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="frame"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative -translate-x-1/2 -translate-y-[115%] overflow-hidden rounded-sm shadow-2xl"
            style={{ width: 'clamp(16rem, 24vw, 24rem)', aspectRatio: '16 / 10' }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <ProjectCover project={projects[active]} index={active} className="size-full" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
