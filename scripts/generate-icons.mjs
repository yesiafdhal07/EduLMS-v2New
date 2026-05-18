/**
 * Generate PWA icons from source image
 * Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SOURCE = join(projectRoot, 'public', 'icons', 'icon-source.png');
const OUTPUT_DIR = join(projectRoot, 'public', 'icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const size of SIZES) {
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
    .png()
    .toFile(join(OUTPUT_DIR, `icon-${size}x${size}.png`));
  console.log(`✅ Generated icon-${size}x${size}.png`);
}

// Also generate apple-touch-icon (180x180)
await sharp(SOURCE)
  .resize(180, 180, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
  .png()
  .toFile(join(projectRoot, 'public', 'apple-touch-icon.png'));
console.log('✅ Generated apple-touch-icon.png');

console.log('\n🎉 All PWA icons generated!');
