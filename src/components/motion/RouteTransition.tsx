import { createContext, useCallback, useContext, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router';

import { ease, gsap, motionEnabled, nextFrame } from '@/lib/motion';
import { scrollToId, scrollToTop } from '@/lib/scroll';

type Go = (to: string, label?: string) => void;

/** Same specifier as the lazy() route in App.tsx, so the module cache is shared. */
const preloadRoute = (to: string) => (to.startsWith('/work/') ? import('@/pages/Work').catch(() => {}) : Promise.resolve());

// Warm the case-study chunk once the browser is idle.
if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
  idle(() => preloadRoute('/work/'));
}
const TransitionContext = createContext<Go | null>(null);

/** Curtain wipe between routes: rises over the page, shows where you're going, then lifts. */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState('');

  const go = useCallback<Go>(
    async (to, nextLabel) => {
      const el = curtain.current;
      if (!el || !motionEnabled() || busy.current) {
        navigate(to);
        return;
      }
      busy.current = true;
      setLabel(nextLabel ?? '');
      // Fetch the destination's code while the curtain is coming down, so it never lifts on a blank page.
      await Promise.all([
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)', visibility: 'visible' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: ease.inOut },
        ),
        preloadRoute(to),
      ]);
      navigate(to);
      await nextFrame();
      await nextFrame();
      await gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: ease.inOut, delay: 0.1 });
      gsap.set(el, { visibility: 'hidden' });
      busy.current = false;
    },
    [navigate],
  );

  return (
    <TransitionContext.Provider value={go}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="invisible fixed inset-0 z-[70] flex flex-col justify-between bg-foreground p-[var(--gutter)] text-background"
      >
        <span className="text-label opacity-60">Context switching…</span>
        <span className="text-h1">{label}</span>
      </div>
    </TransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useRouteTransition must be used inside <RouteTransitionProvider>');
  return ctx;
}

/**
 * Drop-in <Link> that plays the curtain between pages, and smooth-scrolls
 * for same-page anchors (`/#about` while already on `/`).
 */
export function TLink({ to, label, onClick, ...props }: Omit<LinkProps, 'to'> & { to: string; label?: string }) {
  const go = useRouteTransition();
  const { pathname } = useLocation();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const [path, hash] = to.split('#');
    const targetPath = path || '/';
    e.preventDefault();

    if (targetPath === pathname) {
      if (hash) {
        scrollToId(hash);
        history.replaceState(null, '', `#${hash}`);
      } else {
        scrollToTop();
      }
      return;
    }
    go(to, label);
  }

  return <Link to={to} onClick={handleClick} {...props} />;
}
