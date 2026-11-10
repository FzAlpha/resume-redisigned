import { useEffect, useRef } from 'react';

import { SectionHeader } from '@/components/site/SectionHeader';
import { disciplines } from '@/content/profile';
import { gsap, motionEnabled } from '@/lib/motion';

const keywords: Record<string, string[]> = {
  '01': ['fork / exec', 'pipes', 'signals', 'job control', 'POSIX'],
  '02': ['dynamic programming', 'graphs', 'segment trees', 'Dijkstra', 'Tarjan'],
  '03': ['agents', 'pipelines', 'REST', 'Docker', 'self-hosting'],
};

/**
 * Pinned horizontal scroll: on wide screens the section locks in place and the three
 * discipline panels slide sideways as you scroll down, with a progress hairline.
 * Narrow screens (and reduced motion) get the same panels stacked vertically.
 */
export function Disciplines() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionEnabled() || !section.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      tl.to(track.current, { x: () => -distance(), ease: 'none' }, 0).fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0);
      // Panel numbers counter-drift for depth.
      gsap.utils.toArray<HTMLElement>('[data-panel-num]', section.current).forEach((n) => tl.fromTo(n, { xPercent: 25 }, { xPercent: -25, ease: 'none' }, 0));
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} data-journey="lichen" aria-labelledby="disciplines-title" className="relative overflow-hidden pb-[clamp(6rem,14vw,12rem)] lg:flex lg:h-svh lg:flex-col lg:justify-center lg:pb-0">
      <div className="container-x">
        <SectionHeader index="02" label="Disciplines" aside="Scroll ↓ — it moves sideways" />
        <h2 id="disciplines-title" className="sr-only">
          Disciplines
        </h2>
      </div>

      <div ref={track} className="mt-10 flex flex-col gap-6 px-[var(--gutter)] lg:w-max lg:flex-row lg:gap-8">
        {disciplines.map((d) => (
          <article
            key={d.index}
            className="relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-2xl border bg-card p-[clamp(1.5rem,3vw,3rem)] lg:h-[62svh] lg:w-[min(62vw,58rem)]"
          >
            <span
              data-panel-num
              aria-hidden
              className="pointer-events-none absolute -right-[0.06em] -bottom-[0.22em] font-mono text-[clamp(8rem,22vw,20rem)] leading-none font-light text-foreground/[0.06]"
            >
              {d.index}
            </span>
            <span className="text-label text-muted-foreground">({d.index})</span>
            <div className="relative max-w-2xl">
              <h3 className="text-h1">{d.title}</h3>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">{d.body}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {(keywords[d.index] ?? []).map((k) => (
                  <li key={k} className="rounded-full border border-foreground/15 px-3 py-1 font-mono text-xs">
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        {/* Breathing room at the end of the horizontal run. */}
        <div aria-hidden className="hidden w-[10vw] shrink-0 lg:block" />
      </div>

      <div className="container-x mt-8 hidden lg:block">
        <div className="h-px bg-border">
          <div ref={bar} className="h-px origin-left scale-x-0 bg-signal" />
        </div>
      </div>
    </section>
  );
}
