import { TLink, useRouteTransition } from '@/components/motion/RouteTransition';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useCv } from '@/lib/cv';
import { usePalette } from '@/lib/palette';
import { scrollToId } from '@/lib/scroll';
import { navLinks } from './nav-links';

/** Phone menu (lazy-loaded on first tap, so Radix Dialog stays off the first load). */
export function MobileMenu({ open, onOpenChange, onHome }: { open: boolean; onOpenChange: (o: boolean) => void; onHome: boolean }) {
  const go = useRouteTransition();
  const { setOpen: openCv } = useCv();
  const { setOpen: openPalette } = usePalette();

  // Close first; the dialog locks scrolling until its exit animation (300ms) has finished.
  const closeThen = (fn: () => void) => {
    onOpenChange(false);
    window.setTimeout(fn, 380);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                  e.preventDefault();
                  closeThen(() => (onHome ? scrollToId(link.id) : go(`/#${link.id}`, link.label)));
                }}
                className="flex items-baseline justify-between py-4 text-h2"
              >
                {link.label}
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </TLink>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => closeThen(() => openCv(true))}
            className="h-12 rounded-full bg-foreground text-sm font-medium text-background"
          >
            View CV
          </button>
          <button
            type="button"
            onClick={() => closeThen(() => openPalette(true))}
            className="h-12 rounded-full border border-foreground/15 font-mono text-sm"
          >
            &gt;_ Terminal
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
