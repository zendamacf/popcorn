import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const releaseVersion = pkg.version;
const releaseScriptUrl = `https://github.com/zendamacf/popcorn/releases/download/v${releaseVersion}/popcorn.min.js`;

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
          `  <script src="${releaseScriptUrl}"></script>\n</head>`,
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
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
