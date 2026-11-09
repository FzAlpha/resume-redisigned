import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type PaletteContextValue = { open: boolean; setOpen: (open: boolean | ((o: boolean) => boolean)) => void };

const PaletteContext = createContext<PaletteContextValue | null>(null);

/** Open state for the ⌘K palette, plus the global ⌘K / Ctrl+K shortcut. */
export function PaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <PaletteContext.Provider value={{ open, setOpen }}>{children}</PaletteContext.Provider>;
}

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('usePalette must be used inside <PaletteProvider>');
  return ctx;
}

export const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
