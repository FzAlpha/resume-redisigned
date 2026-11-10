import { createContext, useCallback, useContext, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router';

import { ease, gsap, motionEnabled, nextFrame } from '@/lib/motion';
import { getLenis, scrollToId, scrollToTop } from '@/lib/scroll';
import { loadWork } from '@/pages/lazy';

/**
 * Page transitions — a different one for each kind of move:
 *
 *   morph    list → case study: the project title flies into the page heading (View Transitions)
 *   slide    case study → next case study: pages push sideways (View Transitions)
 *   curtain  back to the work list: a panel wipes up, names the destination, lifts (GSAP)
 *   columns  logo / section links from a case study: five blinds sweep up in a stagger (GSAP)
 *   zoom     ⌘K jumps, 404: the old page sinks and blurs, the new one settles in (View Transitions)
 *
 * View-Transition styles fall back to the curtain where the API is missing.
 */
export type TransitionStyle = 'morph' | 'slide' | 'curtain' | 'columns' | 'zoom';
type Go = (to: string, label?: string, style?: TransitionStyle) => void;

const COLUMNS = 5;

const preloadRoute = (to: string) => (to.startsWith('/work/') ? loadWork().then(() => {}, () => {}) : Promise.resolve());

// Warm the case-study chunk once the browser is idle (also lets "morph" render without suspending).
if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
  idle(() => preloadRoute('/work/'));
}

const pathOf = (to: string) => to.split('#')[0] || '/';
const hashOf = (to: string) => to.split('#')[1] ?? '';

function pickStyle(from: string, to: string): TransitionStyle {
  const target = pathOf(to);
  if (from === '/' && target.startsWith('/work/')) return 'morph';
  if (from.startsWith('/work/') && target.startsWith('/work/')) return 'slide';
  if (from.startsWith('/work/') && target === '/') return 'curtain';
  return 'zoom';
}

/** Resolves once the page for `path` has mounted (pages carry data-page). Rendering is
 *  suppressed inside a View Transition's update callback, so this polls with timers, not rAF. */
function pageMounted(path: string, timeout = 2000) {
  const start = performance.now();
  return new Promise<void>((resolve) => {
    const check = () => {
      if (document.querySelector(`[data-page="${CSS.escape(path)}"]`) || performance.now() - start > timeout) resolve();
      else window.setTimeout(check, 16);
    };
    check();
  });
}

const TransitionContext = createContext<Go | null>(null);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const curtain = useRef<HTMLDivElement>(null);
  const blinds = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState('');

  /** GSAP overlays: one panel (curtain) or staggered columns (blinds). */
  const overlay = useCallback(
    async (to: string, style: 'curtain' | 'columns') => {
      const cover = async () => {
        if (style === 'curtain') {
          await gsap.fromTo(
            curtain.current,
            { clipPath: 'inset(100% 0% 0% 0%)', visibility: 'visible' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: ease.inOut },
          );
        } else {
          gsap.set(blinds.current, { visibility: 'visible' });
          await gsap.fromTo(
            blinds.current!.children,
            { scaleY: 0, transformOrigin: '50% 100%' },
            { scaleY: 1, duration: 0.55, ease: ease.inOut, stagger: 0.06 },
          );
        }
      };
      const reveal = async () => {
        if (style === 'curtain') {
          await gsap.to(curtain.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: ease.inOut, delay: 0.1 });
          gsap.set(curtain.current, { visibility: 'hidden' });
        } else {
          await gsap.to(blinds.current!.children, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.6, ease: ease.inOut, stagger: 0.06, delay: 0.05 });
          gsap.set(blinds.current, { visibility: 'hidden' });
        }
      };
      // Fetch the destination's code while covered, so it never lifts on a blank page.
      await Promise.all([cover(), preloadRoute(to)]);
      navigate(to);
      await nextFrame();
      await nextFrame();
      await reveal();
    },
    [navigate],
  );

  /** View Transitions: the browser snapshots old and new pages and animates between them. */
  const viewTransition = useCallback(
    async (to: string, style: 'morph' | 'slide' | 'zoom') => {
      await preloadRoute(to);
      const root = document.documentElement;
      root.dataset.vt = style;
      let navigated = false;
      const transition = document.startViewTransition(async () => {
        navigated = true;
        navigate(to);
        await pageMounted(pathOf(to));
        const hash = hashOf(to);
        if (hash) scrollToId(hash, { immediate: true });
        else {
          getLenis()?.scrollTo(0, { immediate: true, force: true });
          window.scrollTo(0, 0);
        }
      });
      // `ready` rejects with AbortError when a transition is skipped; that's expected.
      transition.ready.catch(() => {});
      // If the browser can't snapshot (no frames: a throttled background tab), skip the
      // animation rather than strand the visitor; navigate ourselves as a last resort.
      const stall = window.setTimeout(() => {
        if (navigated) return;
        transition.skipTransition();
        window.setTimeout(() => !navigated && navigate(to), 400);
      }, 1500);
      try {
        await transition.finished;
      } catch {
        /* skipped — the navigation itself still happened */
      } finally {
        window.clearTimeout(stall);
        delete root.dataset.vt;
      }
    },
    [navigate],
  );

  const go = useCallback<Go>(
    async (to, nextLabel, requested) => {
      if (!motionEnabled() || busy.current) {
        navigate(to);
        return;
      }
      busy.current = true;
      setLabel(nextLabel ?? '');
      let style = requested ?? pickStyle(pathname, to);
      const vtStyle = style === 'morph' || style === 'slide' || style === 'zoom';
      if (vtStyle && !document.startViewTransition) style = 'curtain';
      try {
        if (style === 'curtain' || style === 'columns') await overlay(to, style);
        else await viewTransition(to, style);
      } catch {
        navigate(to); // never strand the visitor if an animation throws
      } finally {
        busy.current = false;
      }
    },
    [navigate, overlay, viewTransition, pathname],
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
      <div ref={blinds} aria-hidden className="invisible fixed inset-0 z-[70] flex">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <span key={i} className="h-full flex-1 bg-foreground" style={{ marginLeft: i ? -1 : 0 }} />
        ))}
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
 * Drop-in <Link> that plays a page transition (picked by route, or `transition`), and
 * smooth-scrolls for same-page anchors (`/#about` while already on `/`).
 */
export function TLink({
  to,
  label,
  transition,
  onClick,
  ...props
}: Omit<LinkProps, 'to'> & { to: string; label?: string; transition?: TransitionStyle }) {
  const go = useRouteTransition();
  const { pathname } = useLocation();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();

    if (pathOf(to) === pathname) {
      const hash = hashOf(to);
      if (hash) {
        scrollToId(hash);
        history.replaceState(null, '', `#${hash}`);
      } else {
        scrollToTop();
      }
      return;
    }
    go(to, label, transition);
  }

  return <Link to={to} onClick={handleClick} {...props} />;
}
