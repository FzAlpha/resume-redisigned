import { lazy, Suspense, useRef, useState } from 'react';

import { TypedText } from '@/components/motion/TypedText';
import { cn } from '@/lib/utils';

// React Bits "Tech Text" (vendored, see src/vendor/react-bits). Loaded only once typing is done.
const TechText = lazy(() => import('@/vendor/react-bits/TechText'));

// Proportion of its box TechText leaves as margin on the aligned side (it insets text by 5%).
const TECH_MARGIN = 0.05;

/**
 * The hero tagline: types itself out first, then hands over to React Bits' Tech Text drawing
 * the same line on a canvas — hover a letter for its dashed outline and type metrics, drag or
 * flick it and it springs back. The hand-off is a short cross-fade in place.
 *
 * Tech Text draws one line in one style, so it only takes over when the typed line fits on one
 * line (desktop); on narrow screens the typed text simply stays.
 */
export function TechTagline({ lead, emphasis, className }: { lead: string; emphasis: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ size: number; width: number } | null>(null);
  const [shown, setShown] = useState(false);

  const handOff = () => {
    const el = wrap.current;
    const p = el?.querySelector('p');
    if (!el || !p) return;
    const style = getComputedStyle(p);
    const size = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || size * 1.1;
    if (p.offsetHeight > lineHeight * 1.5) return; // wrapped: keep the typed text
    // Let the caret blink once, then swap.
    window.setTimeout(() => setBox({ size, width: el.clientWidth }), 700);
  };

  // Tech Text insets text by 5% of its width; widen and shift the canvas so its text starts
  // exactly where the typed text does.
  const width = box ? box.width / (1 - TECH_MARGIN) : 0;

  return (
    <div ref={wrap} className={cn('relative', className)}>
      <TypedText
        className={cn('text-h2 transition-opacity duration-500', shown && 'opacity-0')}
        parts={[{ text: `${lead} ` }, { text: emphasis, as: 'em', className: 'serif' }]}
        onDone={handOff}
      />
      {box && (
        <Suspense fallback={null}>
          <div
            aria-hidden
            data-techtext
            className={cn('absolute top-1/2 text-foreground transition-opacity duration-500', shown ? 'opacity-100' : 'opacity-0')}
            style={{
              left: -width * TECH_MARGIN,
              width,
              height: box.size * 1.8,
              transform: 'translateY(-50%)',
            }}
            ref={(node) => {
              // Fade in on the frame after the canvas mounts.
              if (node && !shown) requestAnimationFrame(() => setShown(true));
            }}
          >
            <TechText
              text={`${lead} ${emphasis}`}
              fontFamily="'Fraunces Variable', ui-serif, Georgia, serif"
              fontWeight={380}
              fontSize={box.size}
              letterSpacing={-0.025}
              align="left"
              color="currentColor"
              accentColor="#3d6b26"
              specks={10}
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
