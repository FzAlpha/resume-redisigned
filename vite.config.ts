import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': `${import.meta.dirname}/src` },
  },
  build: {
    rolldownOptions: {
      output: {
        // Named vendor chunks. Groups pull their dependencies in recursively, so higher
        // priority claims shared libraries first (React must not end up inside "motion").
        // Motion is only used by lazy components, so its chunk stays off the first load.
        codeSplitting: {
          groups: [
            { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'gsap', test: /[\\/]node_modules[\\/]gsap[\\/]/, priority: 20 },
            { name: 'motion', test: /[\\/]node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
});
