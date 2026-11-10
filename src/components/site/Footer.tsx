import { ArrowUp } from 'lucide-react';

import { profile } from '@/content/profile';
import { quips } from '@/content/quips';
import { useLocalTime } from '@/lib/hooks';
import { scrollToTop } from '@/lib/scroll';

export function Footer() {
  const time = useLocalTime();
  return (
    <footer className="container-x pb-8">
      <div className="grid grid-cols-2 gap-y-4 border-t pt-6 text-label text-muted-foreground md:grid-cols-4">
        <span>
          © {new Date().getFullYear()} {profile.name.first} {profile.name.last}
        </span>
        <span className="text-right md:text-left">
          <span className="tabular-nums">{time}</span> IST
        </span>
        <span className="hidden normal-case md:block">{quips.footer}</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          className="col-span-2 -my-3 inline-flex items-center gap-1.5 justify-self-start py-3 transition-colors hover:text-foreground md:col-span-1 md:justify-self-end"
        >
          Back to top <ArrowUp className="size-3" />
        </a>
      </div>
    </footer>
  );
}
