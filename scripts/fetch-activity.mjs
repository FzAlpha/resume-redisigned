// Fetches public GitHub + LeetCode activity into src/content/activity.json.
// Runs before every build (npm "prebuild"). If a source is unreachable, the
// previous snapshot for that source is kept, so builds never fail on the network.

import { readFile, writeFile } from 'node:fs/promises';

const GITHUB_USER = 'FzAlpha';
const LEETCODE_USER = 'Fz_Alpha_07';
const OUT = new URL('../src/content/activity.json', import.meta.url);
const TIMEOUT = 15_000;

const previous = await readFile(OUT, 'utf8')
  .then(JSON.parse)
  .catch(() => ({}));

async function getJson(url, init = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function github() {
  const [calendar, user] = await Promise.all([
    getJson(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`),
    getJson(`https://api.github.com/users/${GITHUB_USER}`, { headers: { 'User-Agent': 'portfolio-build' } }),
  ]);
  return {
    user: GITHUB_USER,
    total: calendar.total.lastYear,
    repos: user.public_repos,
    days: calendar.contributions.map(({ date, count, level }) => ({ date, count, level })),
  };
}

async function leetcode() {
  const query = `query($u: String!) { matchedUser(username: $u) { submitStatsGlobal { acSubmissionNum { difficulty count } } } }`;
  const data = await getJson('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query, variables: { u: LEETCODE_USER } }),
  });
  const counts = Object.fromEntries(
    data.data.matchedUser.submitStatsGlobal.acSubmissionNum.map(({ difficulty, count }) => [difficulty.toLowerCase(), count]),
  );
  return { user: LEETCODE_USER, solved: counts.all, easy: counts.easy, medium: counts.medium, hard: counts.hard };
}

const [gh, lc] = await Promise.allSettled([github(), leetcode()]);
for (const [name, r] of [['GitHub', gh], ['LeetCode', lc]]) {
  if (r.status === 'rejected') console.warn(`[activity] ${name} unavailable, keeping previous snapshot: ${r.reason.message}`);
}

const next = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  github: gh.status === 'fulfilled' ? gh.value : previous.github ?? null,
  leetcode: lc.status === 'fulfilled' ? lc.value : previous.leetcode ?? null,
};
await writeFile(OUT, JSON.stringify(next, null, 2) + '\n');
console.log(
  `[activity] ${next.fetchedAt}: GitHub ${next.github?.total ?? '?'} contributions / ${next.github?.repos ?? '?'} repos, LeetCode ${next.leetcode?.solved ?? '?'} solved`,
);
