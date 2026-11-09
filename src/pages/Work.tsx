import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { projects } from '@/content/projects';
import { NotFound } from './NotFound';

// Phase 2 placeholder for /work/:slug — the case-study layout lands in phase 4.
export function Work() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return <NotFound />;

  return (
    <main className="container-x py-24">
      <Link to="/" className="inline-flex items-center gap-2 text-label text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back
      </Link>
      <p className="mt-16 text-label text-muted-foreground">{project.category}</p>
      <h1 className="text-h1 mt-4">{project.title}</h1>
      <p className="mt-8 max-w-2xl text-muted-foreground">{project.summary}</p>
      <Button variant="outline" className="mt-10" asChild>
        <a href={project.href} target="_blank" rel="noreferrer">
          {project.linkLabel} <ArrowUpRight />
        </a>
      </Button>
    </main>
  );
}
