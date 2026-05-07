// Find image files that DON'T have a corresponding /vehicles/<brand>/<model>/ page yet.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VEHICLES = path.join(ROOT, 'vehicles');
const VI = path.join(ROOT, 'vehicle_images');

const orphanImages = [];
const wired = [];

function walk(dir, prefix = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, rel);
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) {
      const parts = rel.split('/');
      if (parts.length !== 2) continue;
      const [brand, file] = parts;
      const model = file.replace(/\.[^.]+$/, '');
      const brandLc = brand.toLowerCase().replace(/\s+/g, '-');
      const pagePath = path.join(VEHICLES, brandLc, model, 'index.html');
      if (fs.existsSync(pagePath)) wired.push({ brand, model });
      else orphanImages.push({ brand, model, ref: rel });
    }
  }
}
walk(VI);

console.log(`Image → page wired: ${wired.length}`);
console.log(`Orphan images (no model page): ${orphanImages.length}\n`);

const byBrand = {};
orphanImages.forEach(o => (byBrand[o.brand] = byBrand[o.brand] || []).push(o));
for (const [brand, models] of Object.entries(byBrand)) {
  console.log(`  ${brand}/  (${models.length})`);
  models.forEach(m => console.log(`    - ${m.model}  (${m.ref})`));
}
