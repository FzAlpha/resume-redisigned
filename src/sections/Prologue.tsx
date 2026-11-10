import { useEffect, useRef } from 'react';

import { profile } from '@/content/profile';
import { quips } from '@/content/quips';
import { gsap, motionEnabled } from '@/lib/motion';

// Words rendered in italic serif inside the statement.
const EMPHASIS = new Set(['low-level', 'systems,']);

/**
 * The scroll animation that plays *before* the first colour change.
 *
 * The section pins on the hero's green; as you scroll, the summary lights up word by word
 * (blur → sharp, dim → full) while a boot log types itself out. Only when the pin releases does
 * About rise into view and the background turn lavender (the journey measures the pin-spacer).
 */
export function Prologue() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionEnabled()) return;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('[data-word]');
      const lines = gsap.utils.toArray<HTMLElement>('[data-boot]');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=160%', pin: true, scrub: 0.7, anticipatePin: 1 },
      });
      tl.fromTo(words, { opacity: 0.1, filter: 'blur(8px)', yPercent: 35 }, { opacity: 1, filter: 'blur(0px)', yPercent: 0, stagger: 0.08, duration: 0.5 }, 0)
        .fromTo('[data-prologue-bar]', { scaleX: 0 }, { scaleX: 1, duration: tl.duration() || 1.6 }, 0);
      const span = tl.duration();
      lines.forEach((line, i) => tl.fromTo(line, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.15 }, (span * (i + 0.6)) / lines.length));
      // Hold, then ease the statement back as the next colour gets ready.
      tl.to('[data-prologue-text]', { scale: 0.94, opacity: 0.55, duration: 0.5, transformOrigin: '0% 50%' }, '+=0.25');
    }, el);
    return () => ctx.revert();
  }, []);

  const words = profile.summary.split(' ');

  return (
    <section ref={root} data-journey="lichen" aria-label="Prologue" className="relative flex min-h-svh flex-col justify-center overflow-hidden py-24">
      <div className="container-x">
        <p className="text-label text-muted-foreground">(00) — Prologue</p>
        <p data-prologue-text className="text-h1 mt-8 max-w-[22ch] text-pretty">
          {words.map((w, i) => (
            <span key={i}>
              <span data-word className={`inline-block ${EMPHASIS.has(w) ? 'serif' : ''}`}>
                {w}
              </span>{' '}
            </span>
          ))}
        </p>

        <div className="mt-[clamp(2.5rem,6vw,5rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <ol aria-label="Boot log" className="font-mono text-xs leading-relaxed text-muted-foreground">
            {quips.boot.map((line) => (
              <li key={line} data-boot>
                <span className="text-signal">[ OK ]</span> {line}
              </li>
            ))}
          </ol>
          <div aria-hidden className="h-px w-full max-w-xs bg-border md:w-64">
            <div data-prologue-bar className="h-full origin-left bg-signal" />
          </div>
        </div>
      </div>
    </section>
  );
}
