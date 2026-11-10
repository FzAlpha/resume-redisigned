// Single source of truth for all site copy. Components never hard-code text.
// TODO(content): location and availability — not provided yet, so they're left out of the UI.

import activity from './activity.json';
export { activity };

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
    institution: "ITER, Siksha 'O' Anusandhan",
    graduation: '2029',
  },
  availability: null as string | null,
  portrait: '/images/portrait.jpg',
  // Live numbers from the build-time snapshot (scripts/fetch-activity.mjs), with safe fallbacks.
  stats: [
    { value: activity.leetcode?.solved ?? 200, suffix: activity.leetcode ? '' : '+', label: 'LeetCode problems solved' },
    { value: activity.github?.total ?? 0, suffix: '', label: 'GitHub contributions this year' },
    { value: activity.github?.repos ?? 10, suffix: activity.github ? '' : '+', label: 'Public repositories' },
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
