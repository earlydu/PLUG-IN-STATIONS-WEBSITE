// Walk /vehicle_images/ and merge any capitalized brand folder
// (e.g. "Alfa Romeo/", "Mercedes-Benz/", "BMW/") into the lowercase-hyphenated
// slug folder the model pages reference (e.g. "alfa-romeo/", "mercedes-benz/", "bmw/").
// Also lowercases each filename inside.
// Idempotent: if the lowercase folder already exists, files are merged in
// (existing files left alone, new ones added).

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'vehicle_images');

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

let moved = 0, kept = 0, skippedExisting = 0;
const entries = fs.readdirSync(ROOT, { withFileTypes: true });
for (const e of entries) {
  if (!e.isDirectory()) continue;
  const oldName = e.name;
  const newName = slug(oldName);
  if (oldName === newName) continue;          // already lowercase-hyphenated
  const oldDir = path.join(ROOT, oldName);
  const newDir = path.join(ROOT, newName);
  fs.mkdirSync(newDir, { recursive: true });

  for (const f of fs.readdirSync(oldDir)) {
    const lcName = f.toLowerCase();
    const src = path.join(oldDir, f);
    const tgt = path.join(newDir, lcName);
    if (!fs.statSync(src).isFile()) continue;
    if (fs.existsSync(tgt)) {
      fs.unlinkSync(src);
      skippedExisting++;
      continue;
    }
    fs.copyFileSync(src, tgt);
    fs.unlinkSync(src);
    moved++;
  }
  // Remove now-empty source folder
  if (fs.readdirSync(oldDir).length === 0) {
    fs.rmdirSync(oldDir);
    kept++;
  }
}
console.log(`Folders normalised: ${kept}  Files moved: ${moved}  Skipped (target existed): ${skippedExisting}`);
