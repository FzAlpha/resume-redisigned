import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';

import { LiquidLens } from '@/components/interaction/LiquidLens';
import { profile } from '@/content/profile';
import { quips } from '@/content/quips';
import { useLocalTime } from '@/lib/hooks';
import { introDone } from '@/lib/intro';
import { ease, gsap, motionEnabled } from '@/lib/motion';
import { scrollToId } from '@/lib/scroll';

export function Hero() {
  const time = useLocalTime();
  const root = useRef<HTMLElement>(null);

  // Entrance: plays as the preloader curtain lifts (or right away on repeat visits).
  useEffect(() => {
    const el = root.current;
    if (!el || !motionEnabled()) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    introDone.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap
          .timeline({ delay: 0.15 })
          // y: 0 clears the CSS pre-state (translateY(110%)), which GSAP would otherwise keep as a px offset.
          .fromTo('[data-hero-line]', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.25, ease: ease.out, stagger: 0.09 })
          .fromTo('[data-hero-fade]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: ease.out, stagger: 0.06 }, 0.35);
        // (No scroll parallax on the name: the liquid-glass lens caches a capture of it.)
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  const meta = [
    { k: 'Role', v: profile.role },
    { k: 'Focus', v: 'C++ · Linux · Algorithms' },
    { k: 'Status', v: quips.status },
    { k: 'Local time', v: `${time} IST` },
  ];

  return (
    <section
      ref={root}
      id="top"
      className="container-x relative isolate flex min-h-svh flex-col justify-end pt-28 pb-[clamp(1.5rem,4vw,3rem)]"
    >
      {/* Background as a real child: the glass lens refracts the section's children, never the section itself. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-background" />
      <LiquidLens className="top-[38%] right-[12%]" />
      <p data-hero-fade className="font-mono text-xs text-muted-foreground">
        <span className="text-signal">●</span> {quips.hero}
      </p>
      <p data-hero-fade className="text-h2 mt-4 max-w-[18ch] md:max-w-none">
        {profile.tagline.lead} <em className="serif">{profile.tagline.emphasis}</em>
      </p>

      <h1 data-hero-name className="text-display mt-[clamp(1.5rem,4vw,3rem)] -ml-[0.04em]">
        <span className="block overflow-hidden pb-[0.06em]">
          <span data-hero-line className="block">
            {profile.name.first}
          </span>
        </span>
        <span className="block overflow-hidden pb-[0.06em]">
          <span data-hero-line className="block">
            {profile.name.last}
            <span className="text-signal">.</span>
          </span>
        </span>
      </h1>

      <dl className="mt-[clamp(2rem,5vw,4rem)] grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-5 md:grid-cols-4">
        {meta.map((m) => (
          <div key={m.k} data-hero-fade className="flex flex-col gap-2">
            <dt className="text-label text-muted-foreground">{m.k}</dt>
            <dd className="text-sm text-pretty tabular-nums">{m.v}</dd>
          </div>
        ))}
      </dl>

      <a
        href="#about"
        data-hero-fade
        onClick={(e) => {
          e.preventDefault();
          scrollToId('about');
        }}
        className="mt-10 inline-flex items-center gap-2 self-start text-label text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowDown className="size-3.5" /> Scroll
      </a>
    </section>
  );
}
