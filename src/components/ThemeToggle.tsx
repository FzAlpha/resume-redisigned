import { flushSync } from 'react-dom';
import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

const iconBase = 'absolute size-4 transition-[transform,opacity] duration-500 ease-out-expo';

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
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => {}); // `ready` rejects when the transition is skipped
  }

  const dark = theme === 'dark';
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label={`Switch to ${next} theme`} className="relative overflow-hidden">
      {/* The two icons swap by rolling through the button (pure CSS, keeps Motion off the critical path). */}
      <SunIcon className={cn(iconBase, dark ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-4 rotate-90 opacity-0')} />
      <MoonIcon className={cn(iconBase, dark ? '-translate-y-4 -rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100')} />
    </Button>
  );
}
