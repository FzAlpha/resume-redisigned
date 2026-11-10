import { lazy, type ComponentType } from 'react';

type WorkModule = typeof import('./Work');
let work: WorkModule | undefined;

/** Fetches the case-study chunk (and remembers it). */
export const loadWork = () =>
  import('./Work').then((m) => {
    work = m;
    return m;
  });

/**
 * Lazy case-study page. Once the chunk has been preloaded, the factory hands React an
 * already-resolved thenable, so the first render does not suspend — that matters inside a
 * View Transition, which would otherwise snapshot the Suspense fallback as the "new" page.
 */
export const Work = lazy(() =>
  work
    ? ({ then: (resolve: (m: { default: ComponentType }) => void) => resolve({ default: work!.Work }) } as unknown as Promise<{
        default: ComponentType;
      }>)
    : loadWork().then((m) => ({ default: m.Work })),
);

export const NotFound = lazy(() => import('./NotFound').then((m) => ({ default: m.NotFound })));
