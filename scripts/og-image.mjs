// Renders the social share card (public/og.png, 1200×630) from an SVG.
// Run with: npm run og   (re-run if the name/tagline changes)

import sharp from 'sharp';

const W = 1200;
const H = 630;
const paper = '#f4f3ef';
const ink = '#0b0b0c';
const muted = '#6f6f6b';
const signal = '#ff4f00';
const sans = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const mono = "Consolas, 'SFMono-Regular', Menlo, monospace";
const serif = "Georgia, 'Times New Roman', serif";

const grid = Array.from({ length: 30 }, (_, i) => i * 40)
  .map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="${H}" />`)
  .concat(Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="${W}" y2="${i * 40}" />`))
  .join('');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="${paper}"/>
  <g stroke="${ink}" stroke-opacity="0.045" stroke-width="1">${grid}</g>

  <text x="72" y="92" font-family="${mono}" font-size="20" letter-spacing="1" fill="${muted}">HB / FZALPHA</text>
  <text x="${W - 72}" y="92" text-anchor="end" font-family="${mono}" font-size="20" letter-spacing="1" fill="${muted}">SYSTEMS &amp; SOFTWARE DEVELOPER</text>
  <line x1="72" y1="118" x2="${W - 72}" y2="118" stroke="${ink}" stroke-opacity="0.12"/>

  <text font-family="${sans}" font-size="148" font-weight="600" letter-spacing="-7" fill="${ink}">
    <tspan x="64" y="290">Hritabrata</tspan>
    <tspan x="64" y="420">Bardhan<tspan fill="${signal}">.</tspan></tspan>
  </text>

  <line x1="72" y1="500" x2="${W - 72}" y2="500" stroke="${ink}" stroke-opacity="0.12"/>
  <text x="72" y="556" font-family="${sans}" font-size="34" fill="${ink}">I build software <tspan font-family="${serif}" font-style="italic">close to the metal.</tspan></text>
  <text x="${W - 72}" y="556" text-anchor="end" font-family="${mono}" font-size="20" fill="${muted}">C++ · LINUX · ALGORITHMS</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(new URL('../public/og.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
console.log('[og] wrote public/og.png');
