import { ArrowUpRight } from 'lucide-react';

import { TLink } from '@/components/motion/RouteTransition';
import { SectionHeader } from '@/components/site/SectionHeader';
import { projects } from '@/content/projects';
import { quips } from '@/content/quips';

export function SelectedWork() {
  return (
    <section id="work" className="container-x scroll-mt-20 pb-[clamp(6rem,14vw,12rem)]">
      <SectionHeader index="03" label="Selected work" aside={`${String(projects.length).padStart(2, '0')} projects`} />
      <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 data-split className="text-h1 max-w-[14ch]">
          Engineered <em className="serif">by hand.</em>
        </h2>
        <p className="max-w-xs font-mono text-xs text-muted-foreground md:text-right">{quips.work}</p>
      </div>

      <ol data-stagger className="mt-[clamp(3rem,6vw,5rem)]">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-t last:border-b">
            <TLink to={`/work/${p.slug}`} label={p.title} className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 py-6 md:py-9">
              <span className="col-span-2 font-mono text-sm text-muted-foreground tabular-nums md:col-span-1">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="col-span-9 text-h2 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:col-span-5">
                {p.title}
              </span>
              <ArrowUpRight
                aria-hidden
                className="col-span-1 size-5 self-center justify-self-end text-muted-foreground transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal md:order-last"
              />
              <span className="col-span-10 col-start-3 text-sm text-muted-foreground md:col-span-3 md:col-start-auto">
                {p.category}
              </span>
              <span className="hidden text-sm text-muted-foreground md:col-span-2 md:block md:text-right">
                {p.tags.slice(0, 2).join(' · ')}
              </span>
            </TLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
