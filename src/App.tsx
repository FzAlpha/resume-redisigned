import { Route, Routes } from 'react-router';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { CvSheet } from '@/components/site/CvSheet';
import { CommandPalette } from '@/components/site/CommandPalette';
import { ScrollManager } from '@/components/site/ScrollManager';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { Preloader } from '@/components/motion/Preloader';
import { RouteTransitionProvider } from '@/components/motion/RouteTransition';
import { Cursor } from '@/components/interaction/Cursor';
import { CvProvider } from '@/lib/cv';
import { PaletteProvider } from '@/lib/palette';
import { Home } from '@/pages/Home';
import { Work } from '@/pages/Work';
import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <TooltipProvider>
      <CvProvider>
        <PaletteProvider>
          {/* Order matters: Lenis must exist before the preloader pauses it. */}
          <SmoothScroll />
          <Preloader />
          <RouteTransitionProvider>
            <ScrollManager />
            <ScrollProgress />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work/:slug" element={<Work />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CvSheet />
            <CommandPalette />
            <Toaster />
          </RouteTransitionProvider>
          <Cursor />
        </PaletteProvider>
      </CvProvider>
    </TooltipProvider>
  );
}
