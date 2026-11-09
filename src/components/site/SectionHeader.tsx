import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** The mono label row that opens every section: `(01) — About ............ context` */
export function SectionHeader({
  index,
  label,
  aside,
  className,
}: {
  index: string;
  label: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-6 border-t pt-4 text-label text-muted-foreground', className)}>
      {/* Single text node so Baffle can scramble it safely. */}
      <span data-scramble>{`(${index}) — ${label}`}</span>
      {aside && <span className="text-right">{aside}</span>}
    </div>
  );
}
