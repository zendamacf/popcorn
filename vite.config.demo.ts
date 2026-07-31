import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import {
  packageVersion,
  releaseDownloadUrl,
  releaseTagUrl,
} from './scripts/package-version';

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
          '</head>',
          `  <script src="${releaseDownloadUrl}"></script>\n</head>`,
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
    __POPCORN_VERSION__: JSON.stringify(packageVersion),
    __POPCORN_RELEASE_TAG_URL__: JSON.stringify(releaseTagUrl),
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
