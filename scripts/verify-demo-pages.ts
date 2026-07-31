import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { demoReleaseDownloadUrl } from './demo-version';

const docsIndex = resolve(process.cwd(), 'docs/index.html');
const html = readFileSync(docsIndex, 'utf-8');

if (!html.includes(demoReleaseDownloadUrl)) {
  console.error(`Expected release URL in docs/index.html: ${demoReleaseDownloadUrl}`);
  process.exit(1);
}

console.log(`Verified demo references ${demoReleaseDownloadUrl}`);
