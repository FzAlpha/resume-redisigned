// Compresses the original Sketchfab GLBs in /modelss into web-ready files in /public/models.
// Desktop: textures up to 2048px. Mobile: textures up to 1024px.
// Usage: npm run models            (all)
//        npm run models -- wings  (one)
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';

const MODELS = {
  wings:     'modelss/model 7/angel_wings.glb',
  butterfly: 'modelss/model 4 a/fantasy_butterfly_animation.glb',
  infinian:  'modelss/model 8 a/infinian_lineage_series.glb',
  arm:       'modelss/model 6 a/robotic_prosthetic_arm(1).glb',
  angel:     'modelss/model 1 a/angel.glb',
  k2so:      'modelss/model 3 a/free_droide_de_seguridad_k-2so_by_oscar_creativo.glb',
  astraia:   'modelss/model 5 a/astraia - Copy.glb',
  queen:     'modelss/model 9 a/the_queen_of_swords.glb',
  feathers:  'modelss/model 10/3_great_feathers_pack.glb',
};

const VARIANTS = [
  { dir: 'public/models/hd', size: 2048 },
  { dir: 'public/models/sd', size: 1024 },
];

const only = process.argv.slice(2);
const mb = (p) => (statSync(p).size / 1048576).toFixed(2) + ' MB';

for (const v of VARIANTS) mkdirSync(v.dir, { recursive: true });

for (const [name, src] of Object.entries(MODELS)) {
  if (only.length && !only.includes(name)) continue;
  for (const v of VARIANTS) {
    const out = `${v.dir}/${name}.glb`;
    execFileSync(process.execPath, [
      'node_modules/@gltf-transform/cli/bin/cli.js', 'optimize', src, out,
      '--compress', 'meshopt',
      '--texture-compress', 'webp',
      '--texture-size', String(v.size),
      '--simplify', 'false',
    ], { stdio: ['ignore', 'ignore', 'inherit'] });
    console.log(`${name.padEnd(10)} ${String(v.size).padEnd(5)} ${mb(src).padStart(10)} -> ${mb(out)}`);
  }
}
