import { Fragment } from 'react';

import { Marquee } from '@/components/interaction/Marquee';
import { SectionHeader } from '@/components/site/SectionHeader';
import { skillGroups } from '@/content/skills';
import { quips } from '@/content/quips';

const rowA = [...skillGroups[0].items, ...skillGroups[1].items.slice(0, 4)];
const rowB = [...skillGroups[2].items, ...skillGroups[1].items.slice(4)];

function MarqueeRow({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((item) => (
        <Fragment key={item}>
          <span className="text-h2 whitespace-nowrap text-foreground/80 transition-colors duration-300 hover:text-foreground">{item}</span>
          <span aria-hidden className="font-mono text-sm text-signal">
            /
          </span>
        </Fragment>
      ))}
    </>
  );
}

export function Stack() {
  return (
    <section id="stack" className="scroll-mt-20 pb-[clamp(6rem,14vw,12rem)]">
      <div className="container-x">
        <SectionHeader index="04" label="Stack" aside="Tools I reach for" />
        <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 data-split className="text-h1 max-w-[16ch]">
            Forged in <em className="serif">systems.</em>
          </h2>
          <p className="max-w-xs font-mono text-xs text-muted-foreground md:text-right">{quips.stack}</p>
        </div>
      </div>

      {/* Full-bleed marquee: decorative, so hidden from assistive tech (the list below carries the content). */}
      <div aria-hidden className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 border-y py-6">
        <Marquee duration={45}>
          <MarqueeRow items={rowA} />
        </Marquee>
        <Marquee duration={50} reverse>
          <MarqueeRow items={rowB} />
        </Marquee>
      </div>

      <div className="container-x">
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
      </div>
    </section>
  );
}
