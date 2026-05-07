// For each model page, verify the FIRST <img> in the hero (.model-img-wrap) points to its own model image.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VEHICLES = path.join(ROOT, 'vehicles');

const issues = [];
const ok = [];

function walkBrands(dir) {
  for (const b of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!b.isDirectory()) continue;
    const brandDir = path.join(dir, b.name);
    for (const m of fs.readdirSync(brandDir, { withFileTypes: true })) {
      if (!m.isDirectory()) continue;
      const idx = path.join(brandDir, m.name, 'index.html');
      if (!fs.existsSync(idx)) continue;
      const src = fs.readFileSync(idx, 'utf8');
      // Look for the model-img-wrap block then its first <img src=...>
      const wrapMatch = src.match(/<div[^>]*class="model-img-wrap[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (!wrapMatch) {
        issues.push({ brand: b.name, model: m.name, problem: 'no model-img-wrap block', expected: `vehicle_images/${b.name}/${m.name}.jpg` });
        continue;
      }
      const imgMatch = wrapMatch[1].match(/<img[^>]*\ssrc="([^"]+)"/);
      if (!imgMatch) {
        issues.push({ brand: b.name, model: m.name, problem: 'no <img> in hero wrap', expected: `vehicle_images/${b.name}/${m.name}.jpg` });
        continue;
      }
      const src1 = imgMatch[1];
      const expectedTail = `/vehicle_images/${b.name}/${m.name}.jpg`;
      if (src1.toLowerCase() !== expectedTail.toLowerCase()) {
        issues.push({ brand: b.name, model: m.name, problem: 'hero img is wrong model', got: src1, expected: expectedTail });
      } else {
        ok.push({ brand: b.name, model: m.name });
      }
    }
  }
}
walkBrands(VEHICLES);

console.log(`Hero image OK: ${ok.length}`);
console.log(`Hero image issues: ${issues.length}\n`);
issues.slice(0, 50).forEach(i => console.log(`  [${i.problem}] ${i.brand}/${i.model}  got=${i.got || '-'}  expected=${i.expected}`));
