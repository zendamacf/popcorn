import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import {
  demoReleaseDownloadUrl,
  demoReleaseTagUrl,
  demoVersion,
} from './scripts/demo-version';

function useReleasePopcorn(): Plugin {
  const shim = resolve(__dirname, 'demo/popcorn.release-shim.ts');
  return {
    name: 'use-release-popcorn',
    enforce: 'pre',
    resolveId(source) {
      if (source === './popcorn') {
        return shim;
      }
    },
  };
}

function injectReleaseScript(): Plugin {
  return {
    name: 'inject-release-script',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<head([^>]*)>/i,
          `<head$1>\n  <script src="${demoReleaseDownloadUrl}"></script>`,
        );
      },
    },
    closeBundle() {
      writeFileSync(resolve(__dirname, 'docs/.nojekyll'), '');
    },
  };
}

export default defineConfig({
  root: 'demo',
  base: '/popcorn/',
  plugins: [useReleasePopcorn(), injectReleaseScript()],
  define: {
    __DEMO_VERSION__: JSON.stringify(demoVersion),
    __DEMO_RELEASE_TAG_URL__: JSON.stringify(demoReleaseTagUrl),
    __DEMO_USE_RELEASE__: true,
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
