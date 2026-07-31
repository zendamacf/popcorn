import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'),
) as { version: string };

export const packageVersion = pkg.version;
export const releaseDownloadUrl = `https://github.com/zendamacf/popcorn/releases/download/v${packageVersion}/popcorn.min.js`;
export const releaseTagUrl = `https://github.com/zendamacf/popcorn/releases/tag/v${packageVersion}`;
