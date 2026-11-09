import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

import { scrollToId, scrollToTop } from '@/lib/scroll';

/**
 * After a route change, jump (no animation — the curtain is covering it) to the
 * hash target or the top. Same-page anchor clicks are handled by <TLink>.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    const id = hash.slice(1);
    // On first load, wait for fonts so the target's position is final.
    const run = () => (id ? scrollToId(id, { immediate: true }) : scrollToTop({ immediate: true }));
    if (first.current) {
      first.current = false;
      if (id) document.fonts.ready.then(() => requestAnimationFrame(run));
      return;
    }
    requestAnimationFrame(run);
  }, [pathname, hash]);

  return null;
}
