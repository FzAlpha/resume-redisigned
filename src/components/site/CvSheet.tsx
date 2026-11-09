import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { skillGroups } from '@/content/skills';
import { contactLinks } from '@/content/contact';
import { useCv } from '@/lib/cv';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t px-6 py-5">
      <h3 className="text-label text-muted-foreground">{title}</h3>
      <div className="mt-3 flex flex-col gap-2 text-sm">{children}</div>
    </section>
  );
}

export function CvSheet() {
  const { open, setOpen } = useCv();
  const { name, education } = profile;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="print-cv gap-0 overflow-y-auto">
        <SheetHeader className="pb-5">
          <SheetTitle className="text-2xl">
            {name.first} {name.last}
          </SheetTitle>
          <SheetDescription>
            {profile.role} · @{profile.handle}
          </SheetDescription>
        </SheetHeader>

        <Block title="Education">
          <p className="font-medium">{education.degree}</p>
          {education.institution && <p>{education.institution}</p>}
          <p className="text-muted-foreground">Focus: {education.focus}</p>
        </Block>

        <Block title="Skills">
          {skillGroups.map((g) => (
            <p key={g.title}>
              <span className="font-medium">{g.title}: </span>
              <span className="text-muted-foreground">{g.items.join(', ')}</span>
            </p>
          ))}
        </Block>

        <Block title="Projects">
          {projects.map((p) => (
            <p key={p.slug}>
              <span className="font-medium">{p.title}</span>
              <span className="text-muted-foreground"> — {p.summary}</span>
            </p>
          ))}
        </Block>

        <Block title="Contact">
          {contactLinks.map((c) => (
            <p key={c.label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{c.label}</span>
              <span>{c.value}</span>
            </p>
          ))}
        </Block>

        <SheetFooter className="no-print flex-row border-t">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print / Save PDF
          </Button>
          <Button asChild>
            <a href="https://github.com/FzAlpha" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
