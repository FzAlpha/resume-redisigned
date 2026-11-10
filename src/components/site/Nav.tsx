import { lazy, Suspense, useMemo, useRef, useState, type ComponentProps } from 'react';
import { useLocation } from 'react-router';

import { TLink } from '@/components/motion/RouteTransition';
import { Magnetic } from '@/components/interaction/Magnetic';
import { useLiquidGlass } from '@/components/interaction/useLiquidGlass';
import { useCv } from '@/lib/cv';
import { useActiveSection } from '@/lib/hooks';
import { isMac, usePalette } from '@/lib/palette';
import PillNav from '@/vendor/react-bits/PillNav';
import { navLinks } from './nav-links';

export { navLinks };

const MobileMenu = lazy(() => import('./MobileMenu').then((m) => ({ default: m.MobileMenu })));

const sectionIds = navLinks.map((l) => l.id);
const noSections: string[] = [];

/** PillNav renders links with `href`; ours go through TLink so they keep the page transitions. */
function PillLink({ href, ...rest }: { href: string } & Omit<ComponentProps<typeof TLink>, 'to'>) {
  return <TLink to={href} transition="columns" {...rest} />;
}

const logo = <span className="font-mono text-[13px] font-medium tracking-tight">HB</span>;

export function Nav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(onHome ? sectionIds : noSections);
  const { setOpen: openCv } = useCv();
  const { setOpen: openPalette } = usePalette();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const glassRef = useRef<HTMLDivElement>(null);
  useLiquidGlass(glassRef, { radius: 24, rim: 1.1, blur: 3, saturate: 1.4 });

  const items = useMemo(() => navLinks.map((l) => ({ label: l.label, href: `/#${l.id}` })), []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-[var(--gutter)] pt-4">
      {/* Liquid glass (Nordify) on this pill; React Bits PillNav inside it with its own surface off,
          so the refraction is the only glass. No transform/opacity/filter here or on the header. */}
      <div
        ref={glassRef}
        className="nav-glass pointer-events-auto flex h-12 w-full max-w-[42rem] items-center justify-between gap-2 rounded-full pr-1.5 pl-1"
      >
        <div className="hidden md:block">
          <PillNav
            logo={logo}
            logoAlt="Hritabrata Bardhan — home"
            logoHref="/"
            items={items}
            activeHref={active ? `/#${active}` : ''}
            linkComponent={PillLink}
            theme="light"
            layout="joined"
            size="md"
            surface="none"
            itemStyle="plain"
            hoverEffect="glide"
            indicator="dot"
            highlightColor="#3d6b26"
            textColor="#161b14"
            collapse="never"
          />
        </div>

        <nav aria-label="Main" className="pl-4 md:hidden">
          <TLink to="/" label="Index" transition="columns" className="font-mono text-sm font-medium tracking-tight" aria-label="Hritabrata Bardhan — home">
            HB
          </TLink>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openPalette(true)}
            aria-label="Open command palette"
            className="hidden h-8 items-center gap-1 rounded-full border border-foreground/10 px-2.5 font-mono text-[0.7rem] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:inline-flex"
          >
            {isMac() ? '⌘' : 'Ctrl'} K
          </button>
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
      </div>
    </header>
  );
}
