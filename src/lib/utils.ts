import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge about the custom type-scale utilities in index.css,
// otherwise `text-label text-muted-foreground` is treated as two colours and one is dropped.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-display', 'text-h1', 'text-h2', 'text-statement', 'text-label'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
