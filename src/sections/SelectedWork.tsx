import { WorkShowcase } from '@/components/interaction/WorkShowcase';
import { SectionHeader } from '@/components/site/SectionHeader';
import { projects } from '@/content/projects';
import { quips } from '@/content/quips';

export function SelectedWork() {
  return (
    <section id="work" data-journey="fog" className="container-x scroll-mt-20 pb-[clamp(6rem,14vw,12rem)]">
      <SectionHeader index="03" label="Selected work" aside={`${String(projects.length).padStart(2, '0')} projects`} />
      <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 data-split className="text-h1 max-w-[14ch]">
          Engineered <em className="serif">by hand.</em>
        </h2>
        <p className="max-w-xs font-mono text-xs text-muted-foreground md:text-right">{quips.work}</p>
      </div>

      <WorkShowcase />
    </section>
  );
}
