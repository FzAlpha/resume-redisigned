import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { email } from '@/content/contact';

// Phase 2 scaffold: hero + a token specimen so the direction can be judged.
// Phase 4 replaces the specimen with the real sections.
export function Home() {
  return (
    <>
      <header className="container-x flex h-16 items-center justify-between">
        <a href="/" className="font-mono text-sm tracking-tight">
          HB<span className="text-muted-foreground"> / {profile.handle}</span>
        </a>
        <ThemeToggle />
      </header>

      <main>
        <section className="container-x flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-[clamp(2rem,6vw,5rem)]">
          <div className="flex items-center justify-between border-t pt-4 text-label text-muted-foreground">
            <span>(00) — Index</span>
            <span>{profile.role}</span>
          </div>

          <h1 className="text-display mt-[clamp(2rem,6vw,5rem)]">
            {profile.name.first}
            <br />
            {profile.name.last}
            <span className="text-signal">.</span>
          </h1>

          <div className="mt-[clamp(2rem,5vw,4rem)] grid gap-8 md:grid-cols-12">
            <p className="text-h2 md:col-span-7">
              {profile.tagline.lead} <em className="serif">{profile.tagline.emphasis}</em>
            </p>
            <div className="flex flex-col gap-6 md:col-span-4 md:col-start-9">
              <p className="text-muted-foreground">{profile.summary}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={`mailto:${email}`}>Get in touch</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://github.com/FzAlpha" target="_blank" rel="noreferrer">
                    GitHub <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container-x py-[clamp(6rem,14vw,12rem)]">
          <div className="flex items-center justify-between border-t pt-4 text-label text-muted-foreground">
            <span>(01) — Selected work</span>
            <span>{String(projects.length).padStart(2, '0')} projects</span>
          </div>
          <ol className="mt-10">
            {projects.map((p, i) => (
              <li key={p.slug} className="grid grid-cols-12 items-baseline gap-4 border-t py-6 last:border-b">
                <span className="col-span-2 font-mono text-sm tabular-nums text-muted-foreground md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="col-span-10 text-h2 md:col-span-6">{p.title}</span>
                <span className="col-span-10 col-start-3 text-sm text-muted-foreground md:col-span-5 md:col-start-auto md:text-right">
                  {p.tags.join(' · ')}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
