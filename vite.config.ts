import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { packageVersion, releaseTagUrl } from './scripts/package-version';

const banner = `/*!
 * Popcorn v${packageVersion} (https://github.com/zendamacf/popcorn)
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
  define: {
    __POPCORN_VERSION__: JSON.stringify(packageVersion),
    __POPCORN_RELEASE_TAG_URL__: JSON.stringify(releaseTagUrl),
  },
  server: {
    open: process.env.CI ? false : '/demo/',
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
