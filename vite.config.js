import { defineConfig } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';

// Dev-only helper: lets the page POST rendered frames to /__capture/<name>
// so we can generate fallback stills for weak devices (open the site with ?capture).
function captureStills() {
  return {
    name: 'capture-stills',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__capture/', (req, res) => {
        const name = (req.url || '').replace(/[^a-z0-9-]/gi, '');
        if (req.method !== 'POST' || !name) { res.statusCode = 400; return res.end(); }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          mkdirSync('public/stills', { recursive: true });
          writeFileSync(`public/stills/${name}.webp`, Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [captureStills()],
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
