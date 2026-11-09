// The old in-page terminal, reborn inside the ⌘K palette.

import { profile } from './profile';
import { projects } from './projects';
import { skillGroups } from './skills';
import { contactLinks } from './contact';
import { quips } from './quips';

export type TerminalCommand = { name: string; description: string; output: () => string[] };

export const terminalCommands: TerminalCommand[] = [
  {
    name: 'about',
    description: 'Personal summary & background',
    output: () => [
      `${profile.name.first} ${profile.name.last} (${profile.handle})`,
      '• Computer Science Engineering student',
      '• Low-level systems programming in C++ / POSIX',
      '• Operating-system internals & custom Linux shells',
      '• 200+ LeetCode & algorithmic problems solved',
    ],
  },
  {
    name: 'skills',
    description: 'Technical competencies & stack',
    output: () => skillGroups.map((g) => `${g.title}: ${g.items.join(', ')}`),
  },
  {
    name: 'projects',
    description: 'Featured repositories',
    output: () => projects.map((p, i) => `${i + 1}. ${p.title} — ${p.category}`),
  },
  {
    name: 'contact',
    description: 'Email & social handles',
    output: () => contactLinks.map((c) => `${c.label}: ${c.value}`),
  },
  {
    name: 'neofetch',
    description: 'System information',
    output: () => [
      `${profile.handle}@arch`,
      '─────────────',
      'OS: Arch Linux x86_64',
      'WM: Hyprland',
      'Editor: Neovim',
      'Shell: a custom one, written in C++',
      'Uptime: since the first segfault',
    ],
  },
  {
    name: 'help',
    description: 'List terminal commands',
    output: () => [
      'Commands:',
      ...['about', 'skills', 'projects', 'contact', 'neofetch', 'clear'].map((c) => `  ${c}`),
      'There may also be a few undocumented ones.',
    ],
  },
];

/** Undocumented commands. Matched on exact input (or prefix where noted), never listed. */
export const easterEggs: { match: (input: string) => boolean; output: string[] }[] = [
  { match: (s) => s.startsWith('sudo'), output: ['Nice try. This incident will be reported.'] },
  { match: (s) => s.replace(/\s+/g, ' ') === 'rm -rf /', output: ['Not on my watch.'] },
  { match: (s) => s === ':q' || s === ':q!' || s === 'exit', output: ['E37: No write since last change (add ! to override)', 'There is no escape. Only Vim.'] },
  { match: (s) => s === 'hello' || s === 'hi', output: [quips.hero] },
  { match: (s) => s === 'whoami', output: [`${profile.handle} — but you can call me ${profile.name.first}.`] },
  { match: (s) => s === 'ls', output: ['about  skills  projects  contact  secrets.txt'] },
  { match: (s) => s === 'cat secrets.txt', output: ['I use tabs. Please keep this between us.'] },
  { match: (s) => s === 'chai' || s === 'coffee', output: ['418 I’m a teapot. Brewing chai instead…'] },
];
