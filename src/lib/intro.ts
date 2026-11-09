// Resolves when the preloader has lifted (or immediately if it was skipped),
// so the hero's entrance plays after the curtain rather than behind it.

let resolveIntro: () => void;
export const introDone = new Promise<void>((r) => (resolveIntro = r));
export const finishIntro = () => resolveIntro();

const SEEN_KEY = 'intro-seen';

export function shouldPlayIntro() {
  if (!document.documentElement.classList.contains('js-anim')) return false;
  if (window.location.pathname !== '/') return false;
  if (new URLSearchParams(window.location.search).has('intro')) return true; // ?intro forces it (dev)
  try {
    return !sessionStorage.getItem(SEEN_KEY);
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}
