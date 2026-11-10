import { Fragment, useEffect, useRef } from 'react';

import { gsap, motionEnabled } from '@/lib/motion';

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

const groupNotes = ['What I think in.', 'Where I live.', 'What I build with them.'];

export function Stack() {
  const cards = useRef<HTMLDivElement>(null);

  // Stacking cards: each group sticks below the nav; as the next one slides over it,
  // the one underneath sinks back (scale + dim), scrubbed by scroll.
  useEffect(() => {
    const host = cards.current;
    if (!host || !motionEnabled()) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-stack-card]');
      items.forEach((card, i) => {
        const next = items[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
        });
      });
    }, host);
    return () => ctx.revert();
  }, []);

  return (
    <section id="stack" data-journey="lichen" className="scroll-mt-20 pb-[clamp(6rem,14vw,12rem)]">
      <div className="container-x">
        <SectionHeader index="04" label="Stack" aside="Tools I reach for" />
        <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 data-chars className="text-h1 max-w-[16ch]">
            Forged in <em className="serif">systems.</em>
          </h2>
          <p className="max-w-xs font-mono text-xs text-muted-foreground md:text-right">{quips.stack}</p>
        </div>
      </div>

      {/* Full-bleed marquee: decorative, so hidden from assistive tech (the cards below carry the content). */}
      <div data-skew aria-hidden className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 border-y py-6">
        <Marquee duration={45}>
          <MarqueeRow items={rowA} />
        </Marquee>
        <Marquee duration={50} reverse>
          <MarqueeRow items={rowB} />
        </Marquee>
      </div>

      <div ref={cards} className="container-x mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-[12vh]">
        {skillGroups.map((group, gi) => (
          <article
            key={group.title}
            data-stack-card
            className="sticky origin-top rounded-2xl border bg-card p-[clamp(1.5rem,3vw,3rem)] shadow-[0_-20px_40px_-30px_rgb(0_0_0/0.35)]"
            style={{ top: `calc(5.5rem + ${gi * 1.25}rem)` }}
          >
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="text-h2">{group.title}</h3>
              <span className="font-mono text-sm text-muted-foreground tabular-nums">
                0{gi + 1} / 0{skillGroups.length}
              </span>
            </div>
            <p className="mt-2 font-serif text-xl text-muted-foreground italic">{groupNotes[gi]}</p>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {group.items.map((item) => (
                <li key={item} className="rounded-full border border-foreground/15 px-4 py-2 text-base tracking-tight">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
