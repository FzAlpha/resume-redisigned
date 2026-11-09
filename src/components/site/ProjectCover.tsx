import type { Project } from '@/content/projects';
import { cn } from '@/lib/utils';

/**
 * Typographic stand-in for a project image: a terminal prompt on a hairline grid.
 * Swapped for the real screenshot once `project.cover` is set.
 */
export function ProjectCover({ project, index, className }: { project: Project; index: number; className?: string }) {
  if (project.cover) {
    return (
      <div className={cn('overflow-hidden rounded-sm bg-muted', className)}>
        <img src={project.cover} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn('relative overflow-hidden rounded-sm border bg-card', className)}
      style={{
        backgroundImage:
          'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)',
        backgroundSize: '2.5rem 2.5rem',
        backgroundPosition: '-1px -1px',
      }}
    >
      <span className="absolute top-4 left-4 text-label text-muted-foreground">{project.category}</span>
      <span className="absolute top-4 right-4 font-mono text-xs text-muted-foreground tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="font-mono text-[clamp(0.85rem,1.6vw,1.15rem)] tracking-tight">
          <span className="text-muted-foreground">~ $ </span>
          ./{project.slug}
          <span className="ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] animate-pulse bg-signal" />
        </p>
      </div>
      <span className="absolute bottom-4 left-4 font-mono text-xs text-muted-foreground">{project.tags.join(' · ')}</span>
    </div>
  );
}
