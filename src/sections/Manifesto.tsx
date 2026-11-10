/**
 * A full-bleed band of oversized words between About and Disciplines.
 * Two lines drift in opposite directions with the scroll (data-scrub-x), lean with scroll
 * velocity (data-skew), and the second line fills from outline to ink as it passes (data-fill).
 */
const lineA = ['Shells', 'Schedulers', 'Syscalls', 'State engines'];
const lineB = ['Close', 'to', 'the', 'metal'];

export function Manifesto() {
  return (
    <section aria-label="What I build" className="overflow-hidden py-[clamp(4rem,10vw,8rem)]">
      <div data-skew className="flex flex-col gap-2">
        <p data-scrub-x="-22" className="text-display whitespace-nowrap text-foreground/90" aria-hidden>
          {lineA.map((w, i) => (
            <span key={w}>
              {w}
              {i < lineA.length - 1 && <span className="mx-[0.25em] text-signal">/</span>}
            </span>
          ))}
        </p>
        <p data-scrub-x="22" className="text-display whitespace-nowrap pl-[8vw]">
          <span data-fill className="text-fill">
            {lineB.join(' ')}
          </span>
          <em className="serif ml-[0.3em] text-muted-foreground">— literally.</em>
        </p>
      </div>
      <p className="sr-only">I build shells, schedulers, syscalls and state engines: software close to the metal.</p>
    </section>
  );
}
