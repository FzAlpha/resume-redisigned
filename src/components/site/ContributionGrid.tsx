import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

type Day = { date: string; count: number; level: number };

// Ink at rising opacity; only the busiest days earn the signal colour.
const levelClass = ['bg-foreground/[0.06]', 'bg-foreground/20', 'bg-foreground/40', 'bg-foreground/70', 'bg-signal'];

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short' });

/**
 * GitHub-style contribution heatmap in the manner of Tremor's Tracker: one block per day,
 * weeks as columns. Hover/focus a day to read it. On narrow screens the most recent weeks win.
 */
export function ContributionGrid({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<Day | null>(null);

  const weeks = useMemo(() => {
    // Pad the first week so columns start on Sunday, like GitHub.
    const pad = new Date(days[0].date).getUTCDay();
    const cells: (Day | null)[] = [...Array<null>(pad).fill(null), ...days];
    const out: (Day | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [days]);

  const total = days.reduce((s, d) => s + d.count, 0);
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);

  return (
    <div>
      <div className="flex justify-end overflow-hidden">
        <div className="flex gap-[3px]" role="img" aria-label={`${total} GitHub contributions in the last year; busiest day ${best.count} on ${fmt.format(new Date(best.date))}`}>
          {weeks.map((week, wi) => {
            const first = week.find(Boolean);
            const showMonth = first && new Date(first.date).getUTCDate() <= 7;
            return (
              <div key={wi} className="flex flex-col gap-[3px]">
                <span aria-hidden className="h-4 font-mono text-[0.6rem] leading-none text-muted-foreground">
                  {showMonth ? monthFmt.format(new Date(first!.date)) : ''}
                </span>
                {week.map((day, di) =>
                  day ? (
                    <span
                      key={day.date}
                      onPointerEnter={() => setHover(day)}
                      onPointerLeave={() => setHover(null)}
                      className={cn(
                        'size-[11px] rounded-[2px] transition-transform duration-150 hover:scale-150',
                        levelClass[day.level] ?? levelClass[0],
                      )}
                    />
                  ) : (
                    <span key={`pad-${di}`} className="size-[11px]" />
                  ),
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
        <span aria-live="polite" className="tabular-nums">
          {hover
            ? `${hover.count} contribution${hover.count === 1 ? '' : 's'} · ${fmt.format(new Date(hover.date))}`
            : `Busiest day: ${best.count} on ${fmt.format(new Date(best.date))}`}
        </span>
        <span className="flex items-center gap-1.5" aria-hidden>
          Less
          {levelClass.map((c) => (
            <span key={c} className={cn('size-[11px] rounded-[2px]', c)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
