// Single source of truth for all site copy. Components never hard-code text.
// TODO(content): location, university, graduation year, availability — ask Hritabrata.

export const profile = {
  name: { first: 'Hritabrata', last: 'Bardhan' },
  handle: 'FzAlpha',
  role: 'Systems & Software Developer',
  tagline: { lead: 'I build software', emphasis: 'close to the metal.' },
  summary:
    'Computer Science Engineering student focused on low-level systems, C++, Linux architecture and high-performance software.',
  statement:
    'I learn how operating systems work under the hood by building the parts most people never see — shells, process managers, state engines — and by configuring and maintaining my own Linux system. Alongside C++, Java and Python, I build telemetry trackers and multi-agent AI workflows.',
  location: null as string | null,
  education: {
    degree: 'B.Tech, Computer Science & Engineering',
    focus: 'Data Structures, Algorithms, Operating Systems, Systems Architecture',
    institution: null as string | null,
    graduation: null as string | null,
  },
  availability: null as string | null,
  portrait: '/images/portrait.jpg',
  stats: [
    { value: 200, suffix: '+', label: 'DSA problems solved' },
    { value: 10, suffix: '+', label: 'Public repositories' },
  ],
} as const;

export const disciplines = [
  {
    index: '01',
    title: 'Low-level systems programming',
    body: 'Process management, syscalls, POSIX compliance and custom C++ Linux shells.',
  },
  {
    index: '02',
    title: 'Algorithms & optimization',
    body: 'Dynamic programming, graph theory, trees and benchmarked state management.',
  },
  {
    index: '03',
    title: 'Full-stack & AI agents',
    body: 'Multi-agent pipeline orchestration, responsive interfaces and self-hosted services.',
  },
] as const;
