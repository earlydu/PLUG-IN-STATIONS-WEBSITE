// Replace distorting favicon refs across all HTML files with the square SVG + square PNG.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SKIP_DIRS = new Set(['node_modules', '.git', 'brand_assets', 'vehicle_images', 'vehicle_logos', 'ev_charger_images', 'video_thumbnails', 'videos', 'downloads', 'Other logos', 'Accredited_logos', 'New folder']);

const ICON_RE   = /<link\s+rel="icon"[^>]*href="\/brand_assets\/plugin%20stations%20icon\.png"[^>]*\/?>/gi;
const APPLE_RE  = /<link\s+rel="apple-touch-icon"[^>]*href="\/brand_assets\/plugin%20stations%20icon\.png"[^>]*\/?>/gi;

const NEW_ICON  = `<link rel="icon" type="image/svg+xml" href="/brand_assets/favicon.svg" />
  <link rel="alternate icon" type="image/png" href="/brand_assets/favicon-512.png" />`;
const NEW_APPLE = `<link rel="apple-touch-icon" href="/brand_assets/favicon-512.png" />`;

let scanned = 0, updated = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.html')) {
      const full = path.join(dir, entry.name);
      const src = fs.readFileSync(full, 'utf8');
      scanned++;
      const out = src.replace(ICON_RE, NEW_ICON).replace(APPLE_RE, NEW_APPLE);
      if (out !== src) {
        fs.writeFileSync(full, out);
        updated++;
      }
    }
  }
}

walk(ROOT);
console.log(`scanned: ${scanned}, updated: ${updated}`);
