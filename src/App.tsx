import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';

import { Toaster } from '@/components/ui/sonner';
import { ScrollManager } from '@/components/site/ScrollManager';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { Preloader } from '@/components/motion/Preloader';
import { RouteTransitionProvider } from '@/components/motion/RouteTransition';
import { Cursor } from '@/components/interaction/Cursor';
import { CvProvider, useCv } from '@/lib/cv';
import { PaletteProvider, usePalette } from '@/lib/palette';
import { Home } from '@/pages/Home';

// Loaded on demand: case studies (Atropos), the palette (cmdk + Motion), the CV sheet.
const Work = lazy(() => import('@/pages/Work').then((m) => ({ default: m.Work })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));
const CommandPalette = lazy(() => import('@/components/site/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const CvSheet = lazy(() => import('@/components/site/CvSheet').then((m) => ({ default: m.CvSheet })));

/** Mounts a lazy overlay the first time it's opened, then keeps it (so exit animations still play). */
function WhenFirstOpened({ open, children }: { open: boolean; children: React.ReactNode }) {
  const [ever, setEver] = useState(open);
  useEffect(() => {
    if (open) setEver(true);
  }, [open]);
  return ever ? <Suspense fallback={null}>{children}</Suspense> : null;
}

function Overlays() {
  const { open: cvOpen } = useCv();
  const { open: paletteOpen } = usePalette();
  return (
    <>
      <WhenFirstOpened open={cvOpen}>
        <CvSheet />
      </WhenFirstOpened>
      <WhenFirstOpened open={paletteOpen}>
        <CommandPalette />
      </WhenFirstOpened>
    </>
  );
}

export function App() {
  return (
    <CvProvider>
      <PaletteProvider>
        {/* Order matters: Lenis must exist before the preloader pauses it. */}
        <SmoothScroll />
        <Preloader />
        <RouteTransitionProvider>
          <a
            href="#main"
            className="sr-only z-[100] rounded-full bg-foreground px-4 py-2 text-sm text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          <ScrollManager />
          <ScrollProgress />
          <Suspense fallback={<div className="min-h-svh" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work/:slug" element={<Work />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Overlays />
          <Toaster />
        </RouteTransitionProvider>
        <Cursor />
      </PaletteProvider>
    </CvProvider>
  );
}
