import { SectionHeader } from '@/components/site/SectionHeader';
import { profile } from '@/content/profile';
import { quips } from '@/content/quips';

export function About() {
  return (
    <section id="about" data-journey="lavender" className="container-x scroll-mt-20 py-[clamp(6rem,14vw,12rem)]">
      <SectionHeader
        index="01"
        label="About"
        aside={`B.Tech CSE · ${profile.education.institution} · Class of ${profile.education.graduation}`}
      />

      <div className="mt-[clamp(3rem,6vw,5rem)] grid gap-12 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-8">
          <p data-scrub-words className="text-statement text-pretty">
            {profile.statement}
          </p>

          <dl data-stagger data-speed="1.12" className="mt-[clamp(3rem,6vw,5rem)] grid grid-cols-2 gap-6 sm:grid-cols-3">
            {profile.stats.map((s) => (
              <div key={s.label} className="border-t pt-4">
                <dd className="font-mono text-[clamp(2.5rem,5vw,4rem)] leading-none font-light tracking-tight tabular-nums">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-muted-foreground">{s.suffix}</span>
                </dd>
                <dt className="mt-3 text-sm text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <figure className="md:col-span-4 md:col-start-9">
          {/* Clip reveal on the wrapper, zoom on the frame, Ukiyo drift on the image: three layers, no conflicts. */}
          <div data-clip-reveal className="overflow-hidden">
          <div className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
            <img
              data-parallax
              src={profile.portrait}
              alt={`Portrait of ${profile.name.first} ${profile.name.last}`}
              width={752}
              height={1000}
              loading="lazy"
              decoding="async"
              className="size-full object-cover grayscale transition-[filter] duration-700 ease-out-expo group-hover:grayscale-0"
            />
          </div>
          </div>
          <figcaption className="mt-3 flex justify-between text-label text-muted-foreground">
            <span>@{profile.handle}</span>
            <span className="normal-case">{quips.about}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
