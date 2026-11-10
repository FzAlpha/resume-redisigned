import { useEffect, useRef, type ElementType } from 'react';

import { introDone } from '@/lib/intro';
import { gsap, motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Part = { text: string; className?: string; as?: ElementType };

/**
 * Types a line out letter by letter, with a block caret that jumps to the end of each new
 * letter and keeps blinking when it's done (technique after antigravity.google's header).
 * Screen readers get the whole line at once; without motion the text is simply there.
 */
export function TypedText({
  parts,
  className,
  delay = 0.35,
  speed = 0.045,
  onDone,
}: {
  parts: Part[];
  className?: string;
  delay?: number;
  speed?: number;
  /** Called once the last letter is in (not called without motion). */
  onDone?: () => void;
}) {
  const root = useRef<HTMLParagraphElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = root.current;
    const cursor = caret.current;
    if (!el || !cursor || !motionEnabled()) return;
    const chars = [...el.querySelectorAll<HTMLElement>('[data-ch]')];
    const moveTo = (ch: HTMLElement | undefined, after = true) => {
      if (!ch) return;
      cursor.style.left = `${ch.offsetLeft + (after ? ch.offsetWidth : 0)}px`;
      cursor.style.top = `${ch.offsetTop}px`;
      cursor.style.height = `${ch.offsetHeight}px`;
    };
    moveTo(chars[0], false);

    let tl: gsap.core.Timeline | undefined;
    let cancelled = false;
    introDone.then(() => {
      if (cancelled) return;
      tl = gsap.timeline({ delay });
      tl.set(cursor, { opacity: 1 });
      chars.forEach((ch, i) => tl!.call(() => {
        ch.style.opacity = '1';
        moveTo(ch);
      }, undefined, 0.25 + i * speed));
      tl.call(() => {
        el.classList.add('is-typed');
        done.current?.();
      });
    });
    // Keep the caret on the last letter if the line rewraps.
    const ro = new ResizeObserver(() => {
      const shown = chars.filter((c) => c.style.opacity === '1');
      moveTo(shown.at(-1) ?? chars[0], shown.length > 0);
    });
    ro.observe(el);
    return () => {
      cancelled = true;
      tl?.kill();
      ro.disconnect();
    };
  }, [delay, speed]);

  const label = parts.map((p) => p.text).join('');

  return (
    <p ref={root} className={cn('relative', className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden>
        {parts.map((part, pi) => {
          const Tag = part.as ?? 'span';
          return (
            <Tag key={pi} className={part.className}>
              {part.text.split(/(\s+)/).map((word, wi) =>
                /^\s+$/.test(word) ? (
                  <span key={wi} data-ch className="typed-ch">
                    {word}
                  </span>
                ) : (
                  <span key={wi} className="whitespace-nowrap">
                    {[...word].map((ch, ci) => (
                      <span key={ci} data-ch className="typed-ch">
                        {ch}
                      </span>
                    ))}
                  </span>
                ),
              )}
            </Tag>
          );
        })}
      </span>
      <span ref={caret} aria-hidden className="typed-caret" />
    </p>
  );
}
