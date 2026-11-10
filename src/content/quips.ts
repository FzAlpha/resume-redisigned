// The cheesy lines. Kept small and in asides so the headlines stay clean.

export const quips = {
  hero: 'Hello, World — but make it personal.',
  status: 'Compiling dreams, one segfault at a time.',
  about: 'I use Arch, btw.',
  work: 'Debugged by sheer will (and a lot of GDB).',
  stack: 'No Electron apps were harmed in the making of this stack.',
  activity: 'Green squares are my love language. Mine are orange.',
  contact: {
    heading: { lead: "Let's build", emphasis: 'something.' },
    line: "I'll bring the pointers, you bring the problem.",
    uptime: 'My inbox has better uptime than my sleep schedule.',
  },
  toast: {
    copied: 'Copied. Ctrl+C never felt so good.',
    sent: 'Opening your mail app — hit send and you’re in my queue. No race conditions, promise.',
  },
  // The boot log that types itself out in the prologue.
  boot: ['Reached target: curiosity', 'Started C++ toolchain (no warnings, allegedly)', 'Loaded Linux, btw'],
  footer: 'Compiled with -O3 and a lot of chai.',
  notFound: 'This pointer is dangling. Let me take you home.',
} as const;
