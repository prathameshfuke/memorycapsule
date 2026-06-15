/**
 * Rename all cat images in src/assets/cats/ to sequential cat1.ext, cat2.ext, ...
 * Then generate a manifest.json listing all files.
 *
 * Usage: node scripts/rename-cats.js
 */
const fs = require('fs');
const path = require('path');

const CATS_DIR = path.resolve(__dirname, '..', 'src', 'assets', 'cats');
const MANIFEST_PATH = path.resolve(CATS_DIR, 'manifest.json');

// Allowed image extensions
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function main() {
  // 1. Read directory
  const allFiles = fs.readdirSync(CATS_DIR)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTS.has(ext) && !f.startsWith('.');
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  console.log(`Found ${allFiles.length} image files to rename.\n`);

  // 2. First pass: rename to temp names to avoid collisions
  const tempMap = [];
  allFiles.forEach((file, idx) => {
    const ext = path.extname(file).toLowerCase();
    const tempName = `__temp_cat_${idx}${ext}`;
    const src = path.join(CATS_DIR, file);
    const dest = path.join(CATS_DIR, tempName);
    fs.renameSync(src, dest);
    tempMap.push({ tempName, ext, originalName: file });
  });

  // 3. Second pass: rename from temp to final sequential names
  const manifest = [];
  tempMap.forEach((entry, idx) => {
    const finalName = `cat${idx + 1}${entry.ext}`;
    const src = path.join(CATS_DIR, entry.tempName);
    const dest = path.join(CATS_DIR, finalName);
    fs.renameSync(src, dest);
    manifest.push(finalName);
    console.log(`  ${entry.originalName} → ${finalName}`);
  });

  // 4. Write manifest.json
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ count: manifest.length, files: manifest }, null, 2));
  console.log(`\n✓ Renamed ${manifest.length} files.`);
  console.log(`✓ Wrote manifest to ${MANIFEST_PATH}`);
}

main();
