import { lazy, Suspense, useState } from 'react';
import { useLocation } from 'react-router';

import { TLink } from '@/components/motion/RouteTransition';
import { Magnetic } from '@/components/interaction/Magnetic';
import { ScrambleText } from '@/components/interaction/ScrambleText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCv } from '@/lib/cv';
import { useActiveSection } from '@/lib/hooks';
import { isMac, usePalette } from '@/lib/palette';
import { cn } from '@/lib/utils';
import { navLinks } from './nav-links';

export { navLinks };

const MobileMenu = lazy(() => import('./MobileMenu').then((m) => ({ default: m.MobileMenu })));

const sectionIds = navLinks.map((l) => l.id);
const noSections: string[] = [];

export function Nav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(onHome ? sectionIds : noSections);
  const { setOpen: openCv } = useCv();
  const { setOpen: openPalette } = usePalette();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-[var(--gutter)] pt-4">
      <nav aria-label="Main" className="glass pointer-events-auto flex h-12 w-full max-w-[42rem] items-center justify-between gap-2 rounded-full pr-1.5 pl-5">
        <TLink to="/" label="Index" className="font-mono text-sm font-medium tracking-tight" aria-label="Hritabrata Bardhan — home">
          HB
        </TLink>

        <ul className="hidden items-center md:flex">
          {navLinks.map((link) => (
            <li key={link.id}>
              <TLink
                to={`/#${link.id}`}
                label={link.label}
                aria-current={active === link.id ? 'true' : undefined}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground',
                  active === link.id && 'text-foreground',
                )}
              >
                <span
                  aria-hidden
                  className={cn('size-1 rounded-full bg-signal transition-opacity duration-200', active === link.id ? 'opacity-100' : 'opacity-0')}
                />
                <ScrambleText>{link.label}</ScrambleText>
              </TLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openPalette(true)}
            aria-label="Open command palette"
            className="hidden h-8 items-center gap-1 rounded-full border border-foreground/10 px-2.5 font-mono text-[0.7rem] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:inline-flex"
          >
            {isMac() ? '⌘' : 'Ctrl'} K
          </button>
          <ThemeToggle />
          <Magnetic strength={0.25} className="hidden md:inline-flex">
            <button
              type="button"
              onClick={() => openCv(true)}
              className="border-beam inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background"
            >
              CV
            </button>
          </Magnetic>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setMenuLoaded(true);
              setMenuOpen(true);
            }}
            className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background md:hidden"
          >
            Menu
          </button>
          {menuLoaded && (
            <Suspense fallback={null}>
              <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} onHome={onHome} />
            </Suspense>
          )}
        </div>
      </nav>
    </header>
  );
}
