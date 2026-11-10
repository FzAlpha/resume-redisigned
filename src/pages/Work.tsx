import { useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { ProjectCover } from '@/components/site/ProjectCover';
import { TiltCover } from '@/components/interaction/TiltCover';
import { TLink } from '@/components/motion/RouteTransition';
import { usePageAnimations } from '@/components/motion/usePageAnimations';
import { projects } from '@/content/projects';
import { NotFound } from './NotFound';
import { usePageTitle } from '@/lib/usePageTitle';
import { projectJourneys } from '@/lib/journey';

export function Work() {
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return <NotFound />;
  // Keyed by slug so moving between case studies remounts cleanly (split text owns its DOM).
  return <CaseStudy key={slug} index={index} />;
}

function CaseStudy({ index }: { index: number }) {
  const ref = usePageAnimations<HTMLDivElement>();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  usePageTitle(project.title);

  const facts = [
    { k: 'Category', v: project.category },
    { k: 'Stack', v: project.tags.join(', ') },
    { k: 'Year', v: project.year ?? '—' },
    {
      k: 'Source',
      v: (
        <a href={project.href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-signal">
          GitHub ↗
        </a>
      ),
    },
  ];

  return (
    <div ref={ref} data-page={`/work/${project.slug}`}>
      <Nav />
      <main id="main" tabIndex={-1} className="container-x pt-32 outline-none">
        <div data-journey={projectJourneys[index % projectJourneys.length]} aria-hidden />
        <TLink
          to="/#work"
          label="Selected work"
          className="inline-flex items-center gap-2 text-label text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All work
        </TLink>

        <header className="mt-[clamp(3rem,8vw,7rem)]">
          <p data-scramble className="text-label text-muted-foreground">
            {`(${String(index + 1).padStart(2, '0')}) — ${project.category}`}
          </p>
          {/* Shares its view-transition-name with the row on the work list: the "morph" target. */}
          <h1 className="text-h1 mt-4" style={{ viewTransitionName: `vt-title-${project.slug}` }}>
            {project.title}
          </h1>
        </header>

        <div data-clip-reveal className="mt-[clamp(2.5rem,6vw,5rem)]">
          <TiltCover className="aspect-[16/10] md:aspect-[16/8]">
            <ProjectCover project={project} index={index} className="size-full" />
          </TiltCover>
        </div>

        <div className="mt-[clamp(3rem,6vw,5rem)] grid gap-12 md:grid-cols-12 md:gap-6">
          <dl data-stagger className="grid grid-cols-2 gap-6 self-start md:col-span-4 md:grid-cols-1">
            {facts.map((f) => (
              <div key={f.k} className="border-t pt-3">
                <dt className="text-label text-muted-foreground">{f.k}</dt>
                <dd className="mt-2 text-sm">{f.v}</dd>
              </div>
            ))}
          </dl>
          <div className="md:col-span-7 md:col-start-6">
            <p data-scrub-words className="text-statement text-pretty">
              {project.summary}
            </p>
            <Button variant="outline" size="lg" className="mt-10" asChild>
              <a href={project.href} target="_blank" rel="noreferrer">
                {project.linkLabel} <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>

        <TLink to={`/work/${next.slug}`} label={next.title} className="group mt-[clamp(6rem,14vw,12rem)] mb-16 block border-t pt-6">
          <span className="text-label text-muted-foreground">Next project</span>
          <span className="mt-4 flex items-center justify-between gap-6">
            <span className="text-h1 transition-transform duration-500 ease-out-expo group-hover:translate-x-2">{next.title}</span>
            <ArrowRight className="size-8 shrink-0 transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-signal md:size-12" />
          </span>
        </TLink>
      </main>
      <Footer />
    </div>
  );
}
