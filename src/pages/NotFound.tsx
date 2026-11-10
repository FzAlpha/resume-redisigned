import { TLink } from '@/components/motion/RouteTransition';
import { quips } from '@/content/quips';
import { usePageTitle } from '@/lib/usePageTitle';

export function NotFound() {
  usePageTitle('Not found');
  return (
    <main id="main" tabIndex={-1} data-page="404" className="container-x flex min-h-svh flex-col justify-center outline-none">
      <p className="text-label text-muted-foreground">Error 404 · core dumped</p>
      <h1 className="text-h1 mt-4">
        Segmentation <em className="serif">fault.</em>
      </h1>
      <p className="mt-6 text-muted-foreground">{quips.notFound}</p>
      <TLink to="/" label="Home" transition="zoom" className="mt-10 self-start font-mono text-sm underline underline-offset-4 hover:text-signal">
        cd ~
      </TLink>
    </main>
  );
}
