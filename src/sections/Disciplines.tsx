import { useState } from 'react';
import { Plus } from 'lucide-react';

import { SectionHeader } from '@/components/site/SectionHeader';
import { disciplines } from '@/content/profile';
import { cn } from '@/lib/utils';

export function Disciplines() {
  const [open, setOpen] = useState<string | null>(disciplines[0].index);

  return (
    <section aria-labelledby="disciplines-title" className="container-x pb-[clamp(6rem,14vw,12rem)]">
      <SectionHeader index="02" label="Disciplines" aside="What I work on" />
      <h2 id="disciplines-title" className="sr-only">
        Disciplines
      </h2>

      <ul data-stagger className="mt-10">
        {disciplines.map((d) => {
          const isOpen = open === d.index;
          const panelId = `discipline-${d.index}`;
          return (
            <li key={d.index} className="border-t last:border-b">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : d.index)}
                className="group grid w-full grid-cols-12 items-baseline gap-4 py-6 text-left md:py-8"
              >
                <span className="col-span-2 font-mono text-sm text-muted-foreground tabular-nums md:col-span-1">{d.index}</span>
                <span className="col-span-9 text-h2 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:col-span-10">
                  {d.title}
                </span>
                <Plus
                  aria-hidden
                  className={cn(
                    'col-span-1 size-5 justify-self-end self-center text-muted-foreground transition-transform duration-500 ease-out-expo',
                    isOpen && 'rotate-45 text-foreground',
                  )}
                />
              </button>
              <div
                id={panelId}
                className={cn(
                  'grid transition-[grid-template-rows] duration-500 ease-out-expo',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <p className="grid grid-cols-12 gap-4 pb-8">
                    <span className="col-span-10 col-start-3 max-w-xl text-muted-foreground md:col-span-6 md:col-start-2">{d.body}</span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
