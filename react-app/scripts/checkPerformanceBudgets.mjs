import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'dist');
const assets = path.join(root, 'assets');
const MAX_JS_GZIP = 400 * 1024;
const MAX_ENTRY_RAW = 300 * 1024;
const MAX_GLB = 25 * 1024 * 1024;

const files = readdirSync(assets).map((name) => ({
  name,
  path: path.join(assets, name),
  bytes: statSync(path.join(assets, name)).size,
}));

const javascript = files
  .filter((file) => file.name.endsWith('.js'))
  .map((file) => ({ ...file, gzip: gzipSync(readFileSync(file.path)).length }));
const glbs = files.filter((file) => file.name.endsWith('.glb'));
const entry = javascript.find((file) => /^index-.*\.js$/.test(file.name));
const oversizedJs = javascript.filter((file) => file.gzip > MAX_JS_GZIP);
const oversizedGlb = glbs.filter((file) => file.bytes > MAX_GLB);

if (!entry) throw new Error('Vite entry chunk was not found.');
if (entry.bytes > MAX_ENTRY_RAW) {
  throw new Error(`Initial entry exceeds 300 KiB: ${entry.name} (${entry.bytes} bytes)`);
}
if (oversizedJs.length) {
  throw new Error(`Gzip JavaScript budget exceeded: ${oversizedJs.map((file) => `${file.name}=${file.gzip}`).join(', ')}`);
}
if (oversizedGlb.length) {
  throw new Error(`GLB budget exceeded: ${oversizedGlb.map((file) => `${file.name}=${file.bytes}`).join(', ')}`);
}

const largestJs = [...javascript].sort((a, b) => b.gzip - a.gzip)[0];
const largestGlb = [...glbs].sort((a, b) => b.bytes - a.bytes)[0];
console.log(
  `[Performance] entry=${entry.name} ${Math.round(entry.bytes / 1024)}KiB, ` +
  `largest-js-gzip=${largestJs.name} ${Math.round(largestJs.gzip / 1024)}KiB, ` +
  `largest-glb=${largestGlb.name} ${(largestGlb.bytes / 1024 / 1024).toFixed(2)}MiB`,
);
