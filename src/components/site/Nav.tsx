import { useState } from 'react';
import { useLocation } from 'react-router';

import { TLink, useRouteTransition } from '@/components/motion/RouteTransition';
import { scrollToId } from '@/lib/scroll';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCv } from '@/lib/cv';
import { useActiveSection } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
] as const;

const sectionIds = navLinks.map((l) => l.id);
const noSections: string[] = [];

export function Nav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(onHome ? sectionIds : noSections);
  const { setOpen: openCv } = useCv();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = useRouteTransition();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-[var(--gutter)] pt-4">
      {/* Glass pill — phase 6 swaps the backdrop for WebGL liquid glass */}
      <nav
        aria-label="Main"
        className="pointer-events-auto flex h-12 w-full max-w-[38rem] items-center justify-between gap-2 rounded-full border border-foreground/10 bg-background/70 pr-1.5 pl-5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl backdrop-saturate-150"
      >
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
                {link.label}
              </TLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => openCv(true)}
            className="hidden h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85 md:inline-flex"
          >
            CV
          </button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background md:hidden"
              >
                Menu
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-2xl border-b px-[var(--gutter)] pt-20 pb-8">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <ul className="flex flex-col">
                {navLinks.map((link, i) => (
                  <li key={link.id} className="border-t last:border-b">
                    <TLink
                      to={`/#${link.id}`}
                      label={link.label}
                      onClick={(e) => {
                        // Close the sheet first; scrolling is locked until it has gone.
                        e.preventDefault();
                        setMenuOpen(false);
                        window.setTimeout(() => (onHome ? scrollToId(link.id) : go(`/#${link.id}`, link.label)), 380);
                      }}
                      className="flex items-baseline justify-between py-4 text-h2"
                    >
                      {link.label}
                      <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    </TLink>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openCv(true);
                }}
                className="mt-6 h-12 w-full rounded-full bg-foreground text-sm font-medium text-background"
              >
                View CV
              </button>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
