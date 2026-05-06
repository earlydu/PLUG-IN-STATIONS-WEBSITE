// Flips the brand-logo-wrap to dark mode across vehicle pages.
// In dark mode: transparent wrap + inverted (white) logo + lime hover.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'vehicles');

const OLD = `    .brand-logo-wrap { display:grid; place-items:center; aspect-ratio:1; padding:14px; background:#fff; border-radius:14px; }
    .dark .brand-logo-wrap { background:#fff; }
    .brand-logo-wrap img { max-width:80%; max-height:80%; object-fit:contain; }`;

const NEW = `    .brand-logo-wrap { display:grid; place-items:center; aspect-ratio:1; padding:14px; background:#fff; border-radius:14px; transition: background-color .3s; }
    .dark .brand-logo-wrap { background:#111827; }
    .brand-logo-wrap img { max-width:80%; max-height:80%; object-fit:contain; transition: filter .3s; }
    .dark .brand-logo-wrap img { filter: brightness(0) invert(1); }
    .dark .brand-logo-wrap img[alt*="Fisker" i] { filter: invert(1) brightness(1.1); }`;

let updated = 0, skipped = 0, missing = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') {
      const src = fs.readFileSync(full, 'utf8');
      if (src.includes(NEW)) { skipped++; continue; }
      if (!src.includes(OLD)) { missing++; continue; }
      fs.writeFileSync(full, src.replace(OLD, NEW));
      updated++;
    }
  }
}

walk(ROOT);
console.log(`updated: ${updated}, already-done: ${skipped}, no-match: ${missing}`);
