import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const banner = `/*!
 * Popcorn v${pkg.version} (https://github.com/zendamacf/popcorn)
 *
 * Licensed under the MIT License
 */`;

function prependBanner(): Plugin {
  return {
    name: 'prepend-banner',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') {
          file.code = `${banner}\n\n${file.code}`;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [prependBanner()],
  server: {
    open: '/demo/',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/popcorn.ts',
      name: 'Popcorn',
      formats: ['iife'],
      fileName: () => 'popcorn.min.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
