import { useEffect } from 'react';

const SITE = 'Hritabrata Bardhan';

/** Sets document.title for the current page (announced by screen readers on route change). */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : `${SITE} — Systems & Software Developer`;
  }, [title]);
}
