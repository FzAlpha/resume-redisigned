import { useEffect, useState } from 'react';

/** Current time in a fixed zone, updated each minute. Default zone is IST (from the author's git timezone). */
export function useLocalTime(timeZone = 'Asia/Kolkata') {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(new Date());
  const [time, setTime] = useState(format);

  useEffect(() => {
    let interval: number | undefined;
    // Align ticks to the start of each minute.
    const timeout = window.setTimeout(
      () => {
        setTime(format());
        interval = window.setInterval(() => setTime(format()), 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);

  return time;
}

/** Which of the given section ids is currently in the middle band of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
