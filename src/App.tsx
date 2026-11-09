import { Route, Routes } from 'react-router';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { Home } from '@/pages/Home';
import { Work } from '@/pages/Work';
import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<Work />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
}
