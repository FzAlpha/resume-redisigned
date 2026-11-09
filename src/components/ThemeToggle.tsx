import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { motionEnabled } from '@/lib/motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    // Setting an explicit target (not toggling) keeps this idempotent if both paths below run.
    const apply = () => flushSync(() => setTheme(next));

    // Circular reveal from the button, where the browser supports View Transitions.
    if (!document.startViewTransition || !motionEnabled()) return apply();

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(apply);
    // If the browser can't snapshot (e.g. a throttled background tab), don't leave the theme stuck.
    const fallback = window.setTimeout(() => {
      transition.skipTransition();
      apply();
    }, 500);
    transition.updateCallbackDone.then(() => window.clearTimeout(fallback)).catch(() => {});
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {}); // `ready` rejects when the transition is skipped
  }

  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label={`Switch to ${next} theme`} className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="inline-flex"
        >
          {theme === 'dark' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
