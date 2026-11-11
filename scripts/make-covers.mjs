// Generates the project cover art in public/images/work/ (SVG, no text, so no font dependency).
// Run: node scripts/make-covers.mjs. Deterministic: the same seed draws the same picture.
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 1200;
const H = 900;
const BG = '#0e151d';
const C = { green: '#9fc27f', lavender: '#b9a6e3', blue: '#8cb8e6', signal: '#ff4f00', ink: '#e0e6ec' };

const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n) => Math.round(n * 10) / 10;

const frame = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="${BG}"/>
<g stroke="${C.ink}" stroke-opacity="0.05" stroke-width="1">${Array.from({ length: 19 }, (_, i) => `<path d="M${i * 64 + 24} 0V${H}"/>`).join('')}${Array.from({ length: 15 }, (_, i) => `<path d="M0 ${i * 64 + 2}H${W}"/>`).join('')}</g>
${body}
</svg>
`;

// log-Manager: a timeline of milestones with log lines either side and a telemetry trace.
function logManager() {
  const r = rng(7);
  let out = '';
  const x = 600;
  out += `<path d="M${x} 110V790" stroke="${C.green}" stroke-opacity="0.35" stroke-width="2"/>`;
  for (let i = 0; i < 17; i++) {
    const y = 130 + i * 40;
    const mile = i % 4 === 1;
    const lenL = 80 + r() * 300;
    const lenR = 80 + r() * 300;
    const hiL = r() < 0.18;
    const hiR = r() < 0.18;
    out += `<rect x="${f(x - 40 - lenL)}" y="${y - 6}" width="${f(lenL)}" height="12" rx="6" fill="${hiL ? C.green : C.ink}" fill-opacity="${hiL ? 0.85 : 0.13}"/>`;
    out += `<rect x="${x + 40}" y="${y - 6}" width="${f(lenR)}" height="12" rx="6" fill="${hiR ? C.green : C.ink}" fill-opacity="${hiR ? 0.85 : 0.13}"/>`;
    out += mile
      ? `<circle cx="${x}" cy="${y}" r="13" fill="${BG}" stroke="${C.green}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="5" fill="${C.green}"/>`
      : `<circle cx="${x}" cy="${y}" r="4" fill="${C.green}" fill-opacity="0.6"/>`;
  }
  // The latest entry, still being written.
  out += `<circle cx="${x}" cy="790" r="9" fill="${C.signal}"/>`;
  let d = '';
  for (let i = 0; i <= 60; i++) {
    const px = 60 + i * 18;
    const py = 830 - 26 * Math.abs(Math.sin(i * 0.45)) - r() * 16;
    d += `${i ? 'L' : 'M'}${f(px)} ${f(py)}`;
  }
  out += `<path d="${d}" fill="none" stroke="${C.green}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return frame(out);
}

// Custom Linux Shell: a fork tree above a big prompt, a pipeline below.
function shell() {
  let out = '';
  const nodes = [
    [600, 120],
    [420, 230],
    [780, 230],
    [330, 330],
    [510, 330],
    [690, 330],
    [870, 330],
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  for (const [a, b] of edges) {
    const [x1, y1] = nodes[a];
    const [x2, y2] = nodes[b];
    out += `<path d="M${x1} ${y1 + 22}C${x1} ${(y1 + y2) / 2 + 10} ${x2} ${(y1 + y2) / 2 - 10} ${x2} ${y2 - 22}" fill="none" stroke="${C.blue}" stroke-opacity="0.45" stroke-width="2"/>`;
  }
  nodes.forEach(([x, y], i) => {
    const w = i === 0 ? 120 : 92;
    out += `<rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="10" fill="${i === 0 ? C.blue : BG}" fill-opacity="${i === 0 ? 0.9 : 1}" stroke="${C.blue}" stroke-opacity="${i === 0 ? 1 : 0.55}" stroke-width="2"/>`;
    out += `<rect x="${x - w / 2 + 16}" y="${y - 3}" width="${w - 32}" height="6" rx="3" fill="${i === 0 ? BG : C.blue}" fill-opacity="${i === 0 ? 0.8 : 0.4}"/>`;
  });
  // The prompt.
  out += `<path d="M470 450L560 515L470 580" fill="none" stroke="${C.ink}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
  out += `<rect x="610" y="560" width="110" height="24" rx="4" fill="${C.signal}"/>`;
  // The pipeline.
  const xs = [190, 430, 670, 910];
  xs.forEach((x, i) => {
    out += `<rect x="${x - 90}" y="680" width="180" height="70" rx="14" fill="none" stroke="${C.blue}" stroke-opacity="0.6" stroke-width="2"/>`;
    out += `<rect x="${x - 60}" y="710" width="${70 + i * 15}" height="10" rx="5" fill="${C.blue}" fill-opacity="0.45"/>`;
    if (i < 3) out += `<path d="M${x + 102} 715H${x + 138}" stroke="${C.ink}" stroke-opacity="0.6" stroke-width="3"/><path d="M${x + 130} 707L${x + 140} 715L${x + 130} 723" fill="none" stroke="${C.ink}" stroke-opacity="0.6" stroke-width="3"/>`;
  });
  return frame(out);
}

// Algo-Vault: a weighted graph with its shortest path traced.
function algoVault() {
  const r = rng(21);
  const pts = [];
  while (pts.length < 22) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const p = [600 + Math.cos(a) * d * 480, 450 + Math.sin(a) * d * 330];
    if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 120)) pts.push(p);
  }
  pts.sort((a, b) => a[0] - b[0]);
  const edges = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j])
      .filter(([, j]) => j !== i)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 3);
    for (const [, j] of near) if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j]);
  });
  // Dijkstra from the leftmost node to the rightmost.
  const n = pts.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const done = Array(n).fill(false);
  dist[0] = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = true;
    for (const [a, b] of edges) {
      const v = a === u ? b : b === u ? a : -1;
      if (v < 0) continue;
      const w = Math.hypot(pts[u][0] - pts[v][0], pts[u][1] - pts[v][1]);
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  const path = [];
  for (let v = n - 1; v >= 0; v = prev[v]) path.unshift(v);
  const onPath = (a, b) => path.some((v, i) => i && ((path[i - 1] === a && v === b) || (path[i - 1] === b && v === a)));
  let out = '';
  for (const [a, b] of edges) {
    if (onPath(a, b)) continue;
    out += `<path d="M${f(pts[a][0])} ${f(pts[a][1])}L${f(pts[b][0])} ${f(pts[b][1])}" stroke="${C.ink}" stroke-opacity="0.16" stroke-width="2"/>`;
  }
  out += `<path d="${path.map((v, i) => `${i ? 'L' : 'M'}${f(pts[v][0])} ${f(pts[v][1])}`).join('')}" fill="none" stroke="${C.lavender}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  pts.forEach((p, i) => {
    const hot = path.includes(i);
    const end = i === 0 || i === n - 1;
    out += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${end ? 17 : hot ? 12 : 8}" fill="${end ? C.signal : hot ? C.lavender : BG}" stroke="${end ? C.signal : C.lavender}" stroke-opacity="${hot || end ? 1 : 0.5}" stroke-width="3"/>`;
  });
  return frame(out);
}

// Multi-Agent AI Platform: agents on orbits around a hub, in the site's three colours.
function agents() {
  const r = rng(3);
  const cx = 600;
  const cy = 450;
  let out = '';
  const rings = [140, 250, 360];
  rings.forEach((rad, i) => {
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${rad * 1.35}" ry="${rad}" fill="none" stroke="${C.ink}" stroke-opacity="${0.18 - i * 0.03}" stroke-width="2" stroke-dasharray="${i === 1 ? '2 12' : 'none'}" stroke-linecap="round"/>`;
  });
  const colours = [C.green, C.lavender, C.blue];
  const counts = [3, 5, 7];
  const agentsAt = [];
  rings.forEach((rad, i) => {
    for (let k = 0; k < counts[i]; k++) {
      const a = (k / counts[i]) * Math.PI * 2 + i * 0.7 + r() * 0.3;
      agentsAt.push([cx + Math.cos(a) * rad * 1.35, cy + Math.sin(a) * rad, colours[(k + i) % 3], 22 - i * 4]);
    }
  });
  for (const [x, y, col] of agentsAt) {
    out += `<path d="M${cx} ${cy}L${f(x)} ${f(y)}" stroke="${col}" stroke-opacity="0.22" stroke-width="2"/>`;
    const t = 0.35 + r() * 0.4;
    out += `<circle cx="${f(cx + (x - cx) * t)}" cy="${f(cy + (y - cy) * t)}" r="4" fill="${col}"/>`;
  }
  for (const [x, y, col, rad] of agentsAt) out += `<circle cx="${f(x)}" cy="${f(y)}" r="${rad}" fill="${col}"/><circle cx="${f(x)}" cy="${f(y)}" r="${rad + 9}" fill="none" stroke="${col}" stroke-opacity="0.35" stroke-width="2"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="58" fill="${BG}" stroke="${C.signal}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="24" fill="${C.signal}"/>`;
  return frame(out);
}

const dir = new URL('../public/images/work/', import.meta.url);
mkdirSync(dir, { recursive: true });
const covers = { 'log-manager': logManager, 'custom-linux-shell': shell, 'algo-vault': algoVault, 'multi-agent-platform': agents };
for (const [slug, draw] of Object.entries(covers)) {
  writeFileSync(new URL(`${slug}.svg`, dir), draw());
  console.log(`public/images/work/${slug}.svg`);
}
