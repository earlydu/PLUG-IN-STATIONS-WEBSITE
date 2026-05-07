// Audit which referenced /vehicle_images/<brand>/<model>.jpg paths exist on disk.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VI   = path.join(ROOT, 'vehicle_images');

// Build a case-insensitive lookup: lowercased relative path -> actual path on disk.
const diskLookup = new Map();
function indexDir(dir, prefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel  = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) indexDir(full, rel);
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
      diskLookup.set(rel.toLowerCase(), rel);
    }
  }
}
indexDir(VI);

// Walk vehicles/ and collect referenced images per page.
const REF = /\/vehicle_images\/([^"'\s<>]+\.(?:jpe?g|png|webp))/gi;
const missing = [];
const ok = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) walk(path.join(dir, entry.name));
    else if (entry.name === 'index.html') {
      const full = path.join(dir, entry.name);
      const src  = fs.readFileSync(full, 'utf8');
      const refs = new Set();
      let m;
      while ((m = REF.exec(src))) refs.add(m[1]);
      if (refs.size === 0) continue;
      for (const ref of refs) {
        const lc = ref.toLowerCase();
        const actual = diskLookup.get(lc);
        const rec = { page: path.relative(ROOT, full), ref, actual };
        if (!actual) missing.push(rec);
        else if (actual !== ref) rec.casing_mismatch = true, missing.push(rec);
        else ok.push(rec);
      }
    }
  }
}
walk(path.join(ROOT, 'vehicles'));

console.log(`OK refs: ${ok.length}`);
console.log(`Problem refs: ${missing.length}`);
const groupedMissing = missing.filter(r => !r.casing_mismatch);
const casing = missing.filter(r => r.casing_mismatch);
console.log(`  - missing on disk: ${groupedMissing.length}`);
console.log(`  - casing mismatch (works on Windows, fails on Vercel): ${casing.length}`);

if (groupedMissing.length) {
  console.log('\n=== MISSING ON DISK (sample 30) ===');
  groupedMissing.slice(0, 30).forEach(r => console.log(`  ${r.ref}  ←  ${r.page}`));
}
if (casing.length) {
  console.log('\n=== CASING MISMATCH (sample 30) ===');
  casing.slice(0, 30).forEach(r => console.log(`  ref ${r.ref}  →  disk ${r.actual}  (in ${r.page})`));
}
