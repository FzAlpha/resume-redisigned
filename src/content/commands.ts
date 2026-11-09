// Ported from the old in-page terminal. The ⌘K palette (phase 6) runs these.

import { profile } from './profile';
import { projects } from './projects';
import { skillGroups } from './skills';
import { contactLinks } from './contact';

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
];
