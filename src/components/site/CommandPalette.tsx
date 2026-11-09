import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Copy, FileText, Hash, MoonStar, SquareTerminal } from 'lucide-react';
import { toast } from 'sonner';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useRouteTransition } from '@/components/motion/RouteTransition';
import { navLinks } from '@/components/site/Nav';
import { easterEggs, terminalCommands } from '@/content/commands';
import { contactLinks, email } from '@/content/contact';
import { projects } from '@/content/projects';
import { quips } from '@/content/quips';
import { useCv } from '@/lib/cv';
import { usePalette } from '@/lib/palette';
import { scrollToId } from '@/lib/scroll';
import { useTheme } from '@/lib/theme';

type Entry = { id: number; cmd: string; lines: string[] };

/** ⌘K: search the site, run actions, or use it as the old terminal. */
export function CommandPalette() {
  const { open, setOpen } = usePalette();
  const { setOpen: openCv } = useCv();
  const { toggle: toggleTheme } = useTheme();
  const go = useRouteTransition();
  const { pathname } = useLocation();
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<Entry[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  /** Close first (dialogs lock scrolling), then act once the exit animation is done. */
  const closeThen = (fn: () => void) => {
    setOpen(false);
    window.setTimeout(fn, 320); // dialog exit is 300ms
  };

  const goTo = (id: string, label: string) =>
    closeThen(() => (pathname === '/' ? scrollToId(id) : go(`/#${id}`, label)));

  function run(raw: string) {
    const input = raw.trim();
    const cmd = input.toLowerCase();
    if (!cmd) return;
    setValue('');
    if (cmd === 'clear') return setHistory([]);
    const known = terminalCommands.find((c) => c.name === cmd);
    const egg = easterEggs.find((e) => e.match(cmd));
    const lines = known?.output() ?? egg?.output ?? [`command not found: ${input}`, "Type 'help' to see what I understand."];
    setHistory((h) => [...h.slice(-12), { id: nextId.current++, cmd: input, lines }]);
  }

  // Enter runs exact terminal commands / easter eggs instead of picking the highlighted item.
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const cmd = value.trim().toLowerCase();
    const nothingListed = !e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item]');
    if (cmd === 'clear' || nothingListed || terminalCommands.some((c) => c.name === cmd) || easterEggs.some((egg) => egg.match(cmd))) {
      e.preventDefault();
      e.stopPropagation();
      run(value);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      toast(quips.toast.copied);
    } catch {
      toast(`Copy failed — it's ${email}`);
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Search the site, run actions, or type a terminal command.">
      <CommandInput
        value={value}
        onValueChange={setValue}
        onKeyDown={onKeyDown}
        placeholder="Search, or type a command… (try 'help')"
      />

      <AnimatePresence initial={false}>
        {history.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden border-b"
          >
            <div ref={outputRef} className="max-h-52 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed" aria-live="polite">
              <AnimatePresence initial={false}>
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-3 last:mb-0"
                  >
                    <p>
                      <span className="text-signal">❯</span> {entry.cmd}
                    </p>
                    {entry.lines.map((line, i) => (
                      <p key={i} className="whitespace-pre-wrap text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandList>
        <CommandEmpty>
          Nothing matches. Press <span className="text-foreground">Enter</span> to run it as a command.
        </CommandEmpty>

        <CommandGroup heading="Navigate">
          {navLinks.map((l) => (
            <CommandItem key={l.id} value={`go ${l.label}`} onSelect={() => goTo(l.id, l.label)}>
              <Hash /> {l.label}
            </CommandItem>
          ))}
          {projects.map((p) => (
            <CommandItem key={p.slug} value={`project ${p.title} ${p.category}`} onSelect={() => closeThen(() => go(`/work/${p.slug}`, p.title))}>
              <ArrowUpRight /> {p.title}
              <CommandShortcut>{p.category}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="copy email address" onSelect={() => closeThen(copyEmail)}>
            <Copy /> Copy email address
          </CommandItem>
          <CommandItem value="open cv resume" onSelect={() => closeThen(() => openCv(true))}>
            <FileText /> Open CV
          </CommandItem>
          <CommandItem value="toggle theme dark light" onSelect={() => closeThen(toggleTheme)}>
            <MoonStar /> Toggle theme
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Links">
          {contactLinks
            .filter((c) => c.href?.startsWith('http'))
            .map((c) => (
              <CommandItem key={c.label} value={`link ${c.label}`} onSelect={() => closeThen(() => window.open(c.href, '_blank', 'noopener'))}>
                <ArrowUpRight /> {c.label}
                <CommandShortcut>{c.value}</CommandShortcut>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Terminal">
          {terminalCommands.map((c) => (
            <CommandItem key={c.name} value={`terminal ${c.name} ${c.description}`} onSelect={() => run(c.name)}>
              <SquareTerminal /> <span className="font-mono">{c.name}</span>
              <CommandShortcut>{c.description}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between border-t px-4 py-2.5 font-mono text-[0.7rem] text-muted-foreground">
        <span>↑↓ navigate · ↵ run · esc close</span>
        <span>{quips.hero}</span>
      </div>
    </CommandDialog>
  );
}
