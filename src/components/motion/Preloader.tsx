import { useLayoutEffect, useRef, useState } from 'react';

import { profile } from '@/content/profile';
import { ease, gsap } from '@/lib/motion';
import { finishIntro, markIntroSeen, shouldPlayIntro } from '@/lib/intro';
import { startScroll, stopScroll } from '@/lib/scroll';

/** First-visit loader: mono counter 000→100, name rises, then a curtain lifts. About 2 s total. */
export function Preloader() {
  const [visible, setVisible] = useState(shouldPlayIntro);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!visible) {
      finishIntro();
      return;
    }
    const el = root.current!;
    stopScroll();
    document.documentElement.classList.add('is-loading');

    const ctx = gsap.context(() => {
      const count = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          markIntroSeen();
          document.documentElement.classList.remove('is-loading');
          startScroll();
          setVisible(false);
        },
      });

      tl.to(count, {
        v: 100,
        duration: 1.3,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, '0');
        },
      })
        .fromTo('[data-pre-line]', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: ease.out, stagger: 0.08 }, 0.1)
        .fromTo('[data-pre-fade]', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3)
        .add(() => finishIntro(), '+=0.05')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: ease.inOut }, '<');
    }, el);

    return () => {
      ctx.revert();
      document.documentElement.classList.remove('is-loading');
      startScroll();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={root}
      role="presentation"
      className="fixed inset-0 z-[60] flex flex-col justify-between bg-foreground p-[var(--gutter)] text-background"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div className="flex justify-between text-label opacity-60">
        <span>HB / {profile.handle}</span>
        <span data-pre-fade>Allocating charm…</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <p className="text-h1">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-pre-line className="block">
              {profile.name.first}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-pre-line className="block">
              {profile.name.last}
              <span className="text-signal">.</span>
            </span>
          </span>
        </p>
        <span ref={counter} className="font-mono text-[clamp(2.5rem,7vw,6rem)] leading-none font-light tabular-nums">
          000
        </span>
      </div>
    </div>
  );
}
