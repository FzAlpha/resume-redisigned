import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { SectionHeader } from '@/components/site/SectionHeader';
import { Magnetic } from '@/components/interaction/Magnetic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { contactLinks, email } from '@/content/contact';
import { quips } from '@/content/quips';
import { confettiFrom, toastSuccess } from '@/lib/celebrate';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toastSuccess(quips.toast.copied);
  } catch {
    toast(`Copy failed — it's ${text}`);
  }
}

export function Contact() {
  const [errors, setErrors] = useState<{ name?: boolean; email?: boolean }>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const from = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    const next = { name: !name, email: !/^\S+@\S+\.\S+$/.test(from) };
    setErrors(next);
    if (next.name || next.email) return;

    // Hands off to the visitor's mail app (a form backend can replace this later).
    const subject = encodeURIComponent(`Hello from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${from})`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    toastSuccess(quips.toast.sent);
    confettiFrom(e.currentTarget.querySelector('button[type="submit"]'));
    e.currentTarget.reset();
  }

  return (
    <section
      id="contact"
      data-expand
      // Inverse island: a dark section on the light site. It grows from a rounded inset
      // card to full bleed as it scrolls in (data-expand).
      className="island-dark scroll-mt-20 bg-background pt-[clamp(5rem,10vw,8rem)] pb-[clamp(4rem,10vw,8rem)] text-foreground"
    >
      <div className="container-x">
      <SectionHeader index="06" label="Contact" aside={quips.contact.uptime} />

      <h2 data-split className="text-display mt-[clamp(3rem,6vw,5rem)] text-[clamp(3rem,10vw,10rem)]">
        {quips.contact.heading.lead} <em className="serif">{quips.contact.heading.emphasis}</em>
      </h2>
      <p className="mt-6 font-mono text-sm text-muted-foreground">{quips.contact.line}</p>

      <div data-stagger className="mt-[clamp(2.5rem,5vw,4rem)] flex flex-wrap items-center gap-3">
        <Magnetic>
          <Button size="lg" asChild>
            <a href={`mailto:${email}`}>Email me</a>
          </Button>
        </Magnetic>
        <Magnetic>
          <Button size="lg" variant="outline" onClick={() => copy(email)}>
            <Copy /> Copy address
          </Button>
        </Magnetic>
      </div>

      <div className="mt-[clamp(4rem,8vw,7rem)] grid gap-16 md:grid-cols-12 md:gap-6">
        <ul data-stagger className="md:col-span-5">
          {contactLinks.map((link) => {
            const content = (
              <>
                <span className="text-label text-muted-foreground">{link.label}</span>
                <span className="flex items-center gap-2 text-base">
                  {link.value}
                  {link.copy ? (
                    <Copy className="size-3.5 text-muted-foreground transition-colors group-hover:text-signal" />
                  ) : (
                    <ArrowUpRight className="size-4 text-muted-foreground transition-[transform,color] duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal" />
                  )}
                </span>
              </>
            );
            const cls = 'group flex w-full items-center justify-between gap-4 border-t py-4 text-left';
            return (
              <li key={link.label} className="last:border-b">
                {link.copy ? (
                  <button type="button" className={cls} onClick={() => copy(link.copy!)}>
                    {content}
                  </button>
                ) : (
                  <a className={cls} href={link.href} target={link.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {content}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        <form data-stagger onSubmit={onSubmit} noValidate className="flex flex-col gap-6 md:col-span-6 md:col-start-7">
          <p className="text-label text-muted-foreground">Or leave a message</p>
          <label className="flex flex-col gap-1">
            <span className="sr-only">Name</span>
            <Input
              name="name"
              placeholder="Your name"
              autoComplete="name"
              aria-invalid={errors.name || undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="font-mono text-xs text-destructive">
                A name, please — even a handle works.
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="sr-only">Email</span>
            <Input
              name="email"
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              aria-invalid={errors.email || undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="font-mono text-xs text-destructive">
                That email doesn’t parse. Mind checking it?
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="sr-only">Message</span>
            <Textarea name="message" rows={3} placeholder="Tell me a little about it" />
          </label>
          <Button type="submit" size="lg" className="self-start">
            Send message <ArrowUpRight />
          </Button>
        </form>
      </div>
      </div>
    </section>
  );
}
