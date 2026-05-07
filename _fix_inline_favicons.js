// Replace stale inline-SVG favicons (deprecated blue) with the canonical favicon.svg + PNG fallback.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SKIP = new Set(['node_modules', '.git', 'brand_assets', 'vehicle_images', 'vehicle_logos', 'ev_charger_images', 'video_thumbnails', 'videos', 'downloads', 'Other logos', 'Accredited_logos', 'New folder']);

const INLINE_RE = /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="data:image\/svg\+xml,[^"]*0066FF[^"]*"\s*\/?>/gi;

const REPLACEMENT = `<link rel="icon" type="image/svg+xml" href="/brand_assets/favicon.svg" />
  <link rel="alternate icon" type="image/png" href="/brand_assets/favicon-512.png" />
  <link rel="apple-touch-icon" href="/brand_assets/favicon-512.png" />`;

let updated = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.html')) {
      const full = path.join(dir, entry.name);
      const src = fs.readFileSync(full, 'utf8');
      if (!INLINE_RE.test(src)) continue;
      INLINE_RE.lastIndex = 0;
      fs.writeFileSync(full, src.replace(INLINE_RE, REPLACEMENT));
      updated++;
    }
  }
}
walk(ROOT);
console.log(`updated: ${updated}`);
