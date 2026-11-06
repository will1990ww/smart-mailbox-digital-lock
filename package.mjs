#!/usr/bin/env node
/* Produces both builds in one pass:
 *   ./deploy/   production (root-absolute URLs) — upload this
 *   ./          preview   (relative URLs)       — double-click index.html
 */

import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm, readdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DEPLOY = join(ROOT, 'deploy');
const run = (args) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'pipe' }).toString();

/* Source and tooling never ship to the web server. */
const EXCLUDE = new Set([
  'src', 'tests', 'tools', 'node_modules', 'deploy', '.git', '.github',
  'build.mjs', 'build-pages.mjs', 'checks.mjs', 'serve.mjs', 'package.mjs',
  'package.json', 'package-lock.json', 'README.md', 'START-HERE.txt', '.gitignore'
]);

async function main() {
  console.log('Building production…');
  run(['build.mjs']); run(['build-pages.mjs']);

  await rm(DEPLOY, { recursive: true, force: true });
  await mkdir(DEPLOY, { recursive: true });

  for (const entry of await readdir(ROOT, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const from = join(ROOT, entry.name);
    const to = join(DEPLOY, entry.name);
    if (entry.isDirectory()) await cp(from, to, { recursive: true });
    else await cp(from, to);
  }

  const pages = (await readdir(DEPLOY, { recursive: true })).filter((f) => String(f).endsWith('.html')).length;
  console.log(`  → deploy/  (${pages} pages, root-absolute URLs)`);

  console.log('Building preview…');
  run(['build.mjs', '--preview']); run(['build-pages.mjs', '--preview']);
  console.log('  → ./       (relative URLs — double-click index.html)');

  /* Guard against the two ways this can be misused. */
  if (!(await readFile(join(DEPLOY, 'index.html'), 'utf8')).includes('href="/assets/css/site.css"')) {
    throw new Error('deploy/index.html is not a production build');
  }
  if (!(await readFile(join(ROOT, 'index.html'), 'utf8')).includes('href="assets/css/site.css"')) {
    throw new Error('root index.html is not a preview build');
  }
  if (!existsSync(join(DEPLOY, 'assets/css/site.css'))) throw new Error('deploy/ missing the stylesheet');
  if (!existsSync(join(DEPLOY, 'zh/index.html'))) throw new Error('deploy/ missing the Chinese site');

  await writeFile(join(DEPLOY, 'UPLOAD-THIS-FOLDER.txt'),
    'Upload the CONTENTS of this folder to your web host root.\n' +
    'index.html here must become https://www.letterboxlock.sg/index.html\n\n' +
    'Do not double-click this index.html — it uses server paths and will\n' +
    'appear unstyled. Use the index.html one level up for local viewing.\n');

  console.log('\n✓ both builds verified\n');
}

main().catch((e) => { console.error('✗ package failed:', e.message); process.exit(1); });
