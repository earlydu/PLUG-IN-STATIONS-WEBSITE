// For every vehicles/<brand>/<model>/index.html, check whether vehicle_images/<brand>/<model>.<ext> exists.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VEHICLES = path.join(ROOT, 'vehicles');
const VI = path.join(ROOT, 'vehicle_images');

// Build case-insensitive disk lookup.
const disk = new Map();
function indexDir(dir, prefix = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) indexDir(full, rel);
    else disk.set(rel.toLowerCase(), rel);
  }
}
indexDir(VI);

const brands = fs.readdirSync(VEHICLES, { withFileTypes: true }).filter(e => e.isDirectory());

const orphans = [];
const found   = [];
const brandHubs = [];

for (const b of brands) {
  const brandDir = path.join(VEHICLES, b.name);
  // Brand hub (vehicles/<brand>/index.html) - skip, it's a listing
  if (fs.existsSync(path.join(brandDir, 'index.html'))) brandHubs.push(b.name);

  for (const m of fs.readdirSync(brandDir, { withFileTypes: true })) {
    if (!m.isDirectory()) continue;
    const idx = path.join(brandDir, m.name, 'index.html');
    if (!fs.existsSync(idx)) continue;
    // try common extensions, lowercase
    const candidates = [
      `${b.name}/${m.name}.jpg`,
      `${b.name}/${m.name}.jpeg`,
      `${b.name}/${m.name}.png`,
      `${b.name}/${m.name}.webp`,
    ];
    const hit = candidates.find(c => disk.has(c.toLowerCase()));
    if (hit) found.push({ brand: b.name, model: m.name, file: disk.get(hit.toLowerCase()) });
    else orphans.push({ brand: b.name, model: m.name });
  }
}

console.log(`Models with image: ${found.length}`);
console.log(`Models WITHOUT image (orphans): ${orphans.length}\n`);

if (orphans.length) {
  const byBrand = {};
  orphans.forEach(o => (byBrand[o.brand] = byBrand[o.brand] || []).push(o.model));
  for (const [brand, models] of Object.entries(byBrand)) {
    console.log(`  ${brand}/  (${models.length})`);
    models.forEach(m => console.log(`    - ${m}`));
  }
}
