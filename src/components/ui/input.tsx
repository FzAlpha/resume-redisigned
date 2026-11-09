import * as React from 'react';

import { cn } from '@/lib/utils';

/** Underline-style field: hairline at rest, signal colour on focus. */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 border-0 border-b border-input bg-transparent px-0 text-base outline-none transition-colors duration-200 placeholder:text-muted-foreground focus-visible:border-signal focus-visible:outline-none disabled:opacity-50 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
