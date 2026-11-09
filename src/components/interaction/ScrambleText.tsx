import { useEffect, useRef } from 'react';
import baffle from 'baffle';

import { motionEnabled } from '@/lib/motion';

/** Text that scrambles and re-decodes when its enclosing link/button is hovered or focused (Baffle). */
export function ScrambleText({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.closest('a, button') ?? el;
    if (!el || !host || !motionEnabled()) return;

    let running = false;
    const scramble = () => {
      if (running) return;
      running = true;
      baffle(el, { characters: '▒░/\\<>_-+*', speed: 40 }).start().reveal(380);
      window.setTimeout(() => (running = false), 450);
    };
    host.addEventListener('pointerenter', scramble);
    host.addEventListener('focus', scramble);
    return () => {
      host.removeEventListener('pointerenter', scramble);
      host.removeEventListener('focus', scramble);
    };
  }, []);

  return <span ref={ref}>{children}</span>;
}
