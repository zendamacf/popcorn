import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { releaseDownloadUrl } from './package-version';

const docsIndex = resolve(process.cwd(), 'docs/index.html');
const html = readFileSync(docsIndex, 'utf-8');

if (!html.includes(releaseDownloadUrl)) {
  console.error(`Expected release URL in docs/index.html: ${releaseDownloadUrl}`);
  process.exit(1);
}

console.log(`Verified demo references ${releaseDownloadUrl}`);
