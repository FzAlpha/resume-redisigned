// Converts the Poly Haven "Hotel Room" HDRI (modelss/model 11) into a night-graded
// 4096×2048 WebP panorama for the About act. Usage: node scripts/convert-room.mjs
import { readFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import sharp from 'sharp';

const SRC = 'modelss/model 11/hotel_room_4k.exr';
const OUT = 'public/env/room-night.webp';
const W = 4096, H = 2048;

const loader = new EXRLoader().setDataType(THREE.FloatType);
const buf = readFileSync(SRC);
const exr = loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const { width: sw, height: sh, data } = exr;
const ch = data.length / (sw * sh);
console.log(`source ${sw}x${sh}, ${ch} channels`);

const aces = (x) => Math.min(1, Math.max(0, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)));
const toSRGB = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  // EXRLoader returns rows bottom-up; flip.
  const sy = sh - 1 - Math.floor((y / H) * sh);
  for (let x = 0; x < W; x++) {
    const sx = Math.floor((x / W) * sw);
    const i = (sy * sw + sx) * ch;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const warm = (r - b) / (lum + 1e-4);
    // Night: low exposure, cool moonlit tint.
    let nr = aces(r * 0.075) * 0.42, ng = aces(g * 0.075) * 0.58, nb = aces(b * 0.075) * 1.1;
    // Warm practical lights (lamps, LED strip) keep their glow.
    if (lum > 1.2 && warm > 0.18) {
      const k = Math.min(1, (lum - 1.2) / 3);
      nr += aces(r * 0.55) * k; ng += aces(g * 0.5) * k * 0.85; nb += aces(b * 0.4) * k * 0.6;
    }
    const o = (y * W + x) * 3;
    out[o] = Math.round(toSRGB(Math.min(1, nr)) * 255);
    out[o + 1] = Math.round(toSRGB(Math.min(1, ng)) * 255);
    out[o + 2] = Math.round(toSRGB(Math.min(1, nb)) * 255);
  }
}
mkdirSync('public/env', { recursive: true });
await sharp(out, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 82 }).toFile(OUT);
console.log('wrote', OUT);
