import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { TLink, useRouteTransition } from '@/components/motion/RouteTransition';
import { projects } from '@/content/projects';
import { journeys } from '@/lib/journey';

// React Bits, fetched only for the layout that needs it.
const AccordionGallery = lazy(() => import('@/vendor/react-bits/AccordionGallery'));
const CircularCarousel = lazy(() => import('@/vendor/react-bits/CircularCarousel'));

const WIDE = '(min-width: 768px)';

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const q = window.matchMedia(WIDE);
    const on = () => setWide(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return wide;
}

/** Gallery height on laptops and desktops: tall enough to feel like a showcase, never taller than the screen allows. */
function useGalleryHeight() {
  const get = () => Math.round(Math.min(560, Math.max(400, window.innerWidth * 0.34, window.innerHeight * 0.55)));
  const [h, setH] = useState(get);
  useEffect(() => {
    const on = () => setH(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return h;
}

/**
 * Selected work. Laptops and desktops get the React Bits Accordion Gallery (hover a panel to open it, click the
 * open one for the case study); phones and small tablets get the Circular Carousel (swipe, tap the front card).
 * The open project's details sit underneath either one.
 */
export function WorkShowcase() {
  const wide = useWide();
  const [active, setActive] = useState(0);
  const p = projects[active];

  return (
    <div className="mt-[clamp(3rem,6vw,5rem)]">
      <Suspense fallback={<div className="h-[26rem] md:h-[30rem]" />}>
        {wide ? <Accordion onActive={setActive} /> : <Carousel onActive={setActive} />}
      </Suspense>

      <div
        key={p.slug}
        data-showcase-detail
        className="mt-8 grid animate-[showcase-in_0.6s_cubic-bezier(0.16,1,0.3,1)_both] grid-cols-12 items-baseline gap-x-4 gap-y-3 border-t pt-6"
      >
        <span className="col-span-2 font-mono text-sm text-muted-foreground tabular-nums md:col-span-1">
          {String(active + 1).padStart(2, '0')}/{String(projects.length).padStart(2, '0')}
        </span>
        <div className="col-span-10 min-w-0 md:col-span-7">
          <TLink to={`/work/${p.slug}`} label={p.title} data-cursor="View" className="group inline-flex items-baseline gap-2">
            <span className="text-h2" style={{ viewTransitionName: `vt-title-${p.slug}` }}>
              {p.title}
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-5 self-center text-muted-foreground transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal"
            />
          </TLink>
          <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
        </div>
        <div className="col-span-10 col-start-3 flex flex-col gap-2 md:col-span-4 md:col-start-auto md:items-end md:text-right">
          <span className="text-label text-accent-ink">{p.category}</span>
          <span className="text-sm text-muted-foreground">{p.tags.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}

function Accordion({ onActive }: { onActive: (i: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const go = useRouteTransition();
  const height = useGalleryHeight();

  // The gallery keeps its own state; it marks the open panel with aria-current, so follow that.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const panels = [...el.querySelectorAll('[role="listitem"]')];
      const i = panels.findIndex((n) => n.getAttribute('aria-current') === 'true');
      if (i >= 0) onActive(i);
    };
    const mo = new MutationObserver(read);
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    read();
    return () => mo.disconnect();
  }, [onActive]);

  // Clicking the open panel goes to the case study through the site's page transition, not a full reload.
  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[aria-current="true"]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const i = projects.findIndex((p) => a.getAttribute('href') === `/work/${p.slug}`);
    go(a.getAttribute('href')!, projects[i]?.title);
  };

  return (
    <div ref={box} onClickCapture={onClickCapture} data-cursor="View" className="work-accordion">
      <AccordionGallery
        items={projects.map((p) => ({ image: p.poster, label: p.title, link: `/work/${p.slug}`, alt: '' }))}
        defaultIndex={0}
        height={height}
        gap={12}
        radius={14}
        expandRatio={0.56}
        tilt={6}
        parallax={0.5}
        accentColor="#ff4f00"
        overlayColor="#0e151d"
        textColor="#f2f5f8"
        trigger="hover"
        grayscale
      />
    </div>
  );
}

function Carousel({ onActive }: { onActive: (i: number) => void }) {
  const go = useRouteTransition();
  const front = useRef(0);
  // Each project twice, so the ring is full enough to read as a cylinder.
  const ring = [...projects, ...projects];
  const width = Math.round(Math.min(230, window.innerWidth * 0.56));

  return (
    <div className="-mx-[var(--gutter)] h-[min(24rem,100vw)]">
      <CircularCarousel
        items={ring.map((p) => ({ src: p.poster, alt: `${p.title} cover`, title: p.title, subtitle: p.category }))}
        preset="cylinder"
        intro="rise"
        cardWidth={width}
        aspectRatio={0.8}
        gap={22}
        tilt={0} // level ring: the far side hides behind the front cards instead of peeking out below
        autoplay="drift"
        speed={9}
        snap
        captions={false} // the details strip below names the front project
        cornerRadius={14}
        depthFade={0.6}
        fadeColor={journeys.fog.paper}
        innerShade={0.5}
        onChange={(i) => {
          front.current = i;
          onActive(i % projects.length);
        }}
        onItemClick={(_, i) => {
          if (i !== front.current) return; // a side card just turns to the front
          const p = ring[i];
          go(`/work/${p.slug}`, p.title);
        }}
      />
    </div>
  );
}
