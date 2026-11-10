/**
 * The light behind the page: two large, heavily blurred glows in the journey's --glow colour,
 * drifting slowly. Fixed under all content, so sections stay transparent and the colour
 * change reads as one continuous surface rather than stacked blocks.
 */
export function Atmosphere() {
  return (
    <div aria-hidden className="atmosphere pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <span className="atmosphere-glow atmosphere-glow-a" />
      <span className="atmosphere-glow atmosphere-glow-b" />
      <span className="atmosphere-grain" />
    </div>
  );
}
