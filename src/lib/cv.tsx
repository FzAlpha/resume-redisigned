import { createContext, useContext, useState, type ReactNode } from 'react';

type CvContextValue = { open: boolean; setOpen: (open: boolean) => void };

const CvContext = createContext<CvContextValue | null>(null);

export function CvProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <CvContext.Provider value={{ open, setOpen }}>{children}</CvContext.Provider>;
}

export function useCv() {
  const ctx = useContext(CvContext);
  if (!ctx) throw new Error('useCv must be used inside <CvProvider>');
  return ctx;
}
