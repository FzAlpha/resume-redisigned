import { ArrowUpRight } from 'lucide-react';

import { SectionHeader } from '@/components/site/SectionHeader';
import { ContributionGrid } from '@/components/site/ContributionGrid';
import { activity } from '@/content/profile';
import { quips } from '@/content/quips';

const difficulties = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
] as const;

/** Proof of work: GitHub heatmap + LeetCode solved by difficulty (Tremor-style BarList). */
export function Activity() {
  const { github, leetcode } = activity;
  if (!github && !leetcode) return null;
  const max = leetcode ? Math.max(leetcode.easy, leetcode.medium, leetcode.hard) : 1;

  return (
    <section id="activity" className="container-x scroll-mt-20 pb-[clamp(6rem,14vw,12rem)]">
      <SectionHeader index="05" label="Activity" aside={`Snapshot · ${activity.fetchedAt}`} />
      <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 data-split className="text-h1 max-w-[14ch]">
          Proof of <em className="serif">work.</em>
        </h2>
        <p className="max-w-xs font-mono text-xs text-muted-foreground md:text-right">{quips.activity}</p>
      </div>

      <div data-stagger className="mt-[clamp(3rem,6vw,5rem)] grid gap-12 lg:grid-cols-12 lg:gap-6">
        {github && (
          <div className="min-w-0 lg:col-span-8">
            <div className="flex items-baseline justify-between border-t pt-4">
              <h3 className="text-label text-muted-foreground">GitHub · last 12 months</h3>
              <a
                href={`https://github.com/${github.user}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-signal"
              >
                @{github.user} <ArrowUpRight className="size-3" />
              </a>
            </div>
            <p className="mt-6 font-mono text-[clamp(2rem,4vw,3rem)] leading-none font-light tabular-nums">
              <span data-count={github.total}>{github.total}</span>
              <span className="ml-3 align-middle font-sans text-sm text-muted-foreground">contributions</span>
            </p>
            <div className="mt-8">
              <ContributionGrid days={github.days} />
            </div>
          </div>
        )}

        {leetcode && (
          <div className="lg:col-span-4">
            <div className="flex items-baseline justify-between border-t pt-4">
              <h3 className="text-label text-muted-foreground">LeetCode · solved</h3>
              <a
                href={`https://leetcode.com/u/${leetcode.user}/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-signal"
              >
                {leetcode.user} <ArrowUpRight className="size-3" />
              </a>
            </div>
            <p className="mt-6 font-mono text-[clamp(2rem,4vw,3rem)] leading-none font-light tabular-nums">
              <span data-count={leetcode.solved}>{leetcode.solved}</span>
              <span className="ml-3 align-middle font-sans text-sm text-muted-foreground">problems</span>
            </p>
            <ul className="mt-8 flex flex-col gap-3" aria-label="Solved by difficulty">
              {difficulties.map(({ key, label }) => {
                const n = leetcode[key];
                return (
                  <li key={key} className="relative flex h-9 items-center justify-between px-3 text-sm">
                    <span
                      data-grow
                      aria-hidden
                      className={`absolute inset-y-0 left-0 rounded-sm ${key === 'hard' ? 'bg-signal/20' : 'bg-foreground/[0.07]'}`}
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                    <span className="relative">{label}</span>
                    <span className="relative font-mono tabular-nums">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
