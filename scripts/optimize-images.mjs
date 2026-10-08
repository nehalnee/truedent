// Converts PNG/JPG images in public/images to resized WebP and updates
// references in src/data/products.json. Safe to re-run: WebP files are skipped.
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const imagesDir = path.join(root, 'public', 'images');
const dataFile = path.join(root, 'src', 'data', 'products.json');
const MAX = { products: 1000, site: 1920 };

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const renamed = new Map();
let before = 0;
let after = 0;

for await (const file of walk(imagesDir)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue;
  const folder = path.basename(path.dirname(file));
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  const input = await readFile(file);
  const result = await sharp(input)
    .resize({ width: MAX[folder] ?? 1200, height: MAX[folder] ?? 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(out, result);
  await unlink(file);
  before += input.length;
  after += result.length;
  const toUrl = (p) => '/' + path.relative(path.join(root, 'public'), p).split(path.sep).join('/');
  renamed.set(toUrl(file), toUrl(out));
}

let json = await readFile(dataFile, 'utf8');
for (const [from, to] of renamed) json = json.split(from).join(to);
await writeFile(dataFile, json);

console.log(`Converted ${renamed.size} images: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
