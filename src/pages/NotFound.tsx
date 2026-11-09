import { Link } from 'react-router';

export function NotFound() {
  return (
    <main className="container-x flex min-h-svh flex-col justify-center">
      <p className="text-label text-muted-foreground">Error 404</p>
      <h1 className="text-h1 mt-4">
        Segmentation <em className="serif">fault.</em>
      </h1>
      <p className="mt-6 text-muted-foreground">This address doesn't point anywhere.</p>
      <Link to="/" className="mt-10 font-mono text-sm underline underline-offset-4">
        cd ~
      </Link>
    </main>
  );
}
