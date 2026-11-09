import { SectionHeader } from '@/components/site/SectionHeader';
import { skillGroups } from '@/content/skills';
import { quips } from '@/content/quips';

export function Stack() {
  return (
    <section id="stack" className="container-x scroll-mt-20 pb-[clamp(6rem,14vw,12rem)]">
      <SectionHeader index="04" label="Stack" aside="Tools I reach for" />
      <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 data-split className="text-h1 max-w-[16ch]">
          Forged in <em className="serif">systems.</em>
        </h2>
        <p className="max-w-xs font-mono text-xs text-muted-foreground md:text-right">{quips.stack}</p>
      </div>

      {/* Phase 6 adds the two-row marquee above this list. */}
      <div data-stagger className="mt-[clamp(3rem,6vw,5rem)] grid gap-10 md:grid-cols-3 md:gap-6">
        {skillGroups.map((group, gi) => (
          <div key={group.title}>
            <h3 className="flex items-baseline justify-between border-t pt-4 text-label text-muted-foreground">
              <span>{group.title}</span>
              <span className="tabular-nums">0{gi + 1}</span>
            </h3>
            <ul className="mt-4">
              {group.items.map((item) => (
                <li key={item} className="border-b py-3 text-lg tracking-tight">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
