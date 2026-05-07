// Normalises brand folder names inside /vehicle_images/ to lowercase hyphenated slugs.
// Files are NEVER removed — folders are renamed (or, if a lowercase variant already exists, files
// are copied across so the lowercase folder has every image).
// On Windows (case-insensitive FS) we use a two-step rename via a temp name so git tracks the change.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const VI   = path.join(ROOT, 'vehicle_images');

const slug = s => s.toLowerCase().replace(/\s+/g, '-');

const entries = fs.readdirSync(VI, { withFileTypes: true })
  .filter(e => e.isDirectory());

const renames = [], merges = [], skips = [];

for (const e of entries) {
  const cur = e.name;
  const target = slug(cur);
  if (cur === target) { skips.push(cur); continue; }

  const sibling = entries.find(o => o !== e && o.name === target);
  if (sibling) {
    // Lowercase variant already exists — copy missing files into it instead of renaming.
    const fromDir = path.join(VI, cur);
    const toDir   = path.join(VI, target);
    let copied = 0;
    for (const f of fs.readdirSync(fromDir)) {
      const srcF = path.join(fromDir, f);
      const dstF = path.join(toDir, f);
      if (!fs.existsSync(dstF) && fs.statSync(srcF).isFile()) {
        fs.copyFileSync(srcF, dstF);
        copied++;
      }
    }
    merges.push({ from: cur, to: target, copied });
  } else {
    renames.push({ from: cur, to: target });
  }
}

// Two-step rename via temp name to dodge case-insensitive FS no-ops.
for (const r of renames) {
  const fromDir = path.join(VI, r.from);
  const toDir   = path.join(VI, r.to);
  const tmp     = path.join(VI, `__tmp_${Date.now()}_${r.to}`);
  try {
    // Use git mv when possible so the rename is tracked cleanly.
    try { execSync(`git mv "vehicle_images/${r.from}" "vehicle_images/__tmp_${r.to}"`, { cwd: ROOT, stdio: 'pipe' }); }
    catch (_) { fs.renameSync(fromDir, path.join(VI, `__tmp_${r.to}`)); }
    try { execSync(`git mv "vehicle_images/__tmp_${r.to}" "vehicle_images/${r.to}"`, { cwd: ROOT, stdio: 'pipe' }); }
    catch (_) { fs.renameSync(path.join(VI, `__tmp_${r.to}`), toDir); }
    r.ok = true;
  } catch (err) {
    r.ok = false; r.err = err.message;
  }
}

console.log(`Renamed: ${renames.filter(r => r.ok).length} / ${renames.length}`);
renames.forEach(r => console.log(`  ${r.ok ? 'OK' : 'FAIL'}  ${r.from} → ${r.to}${r.err ? ' ('+r.err+')' : ''}`));
console.log(`\nMerged into existing lowercase: ${merges.length}`);
merges.forEach(m => console.log(`  ${m.from} → ${m.to}  (+${m.copied} files)`));
console.log(`\nAlready lowercase (skipped): ${skips.length}`);
