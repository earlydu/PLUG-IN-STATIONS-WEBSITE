// Patch the cost-to-charge "Octopus Intelligent" card on every model page:
//   - swap the Plug In Stations green/lime background for Octopus pink (#E50580)
//   - add the Octopus wordmark above the price
//   - keep the existing £-amount that was computed for each car
// Idempotent: skips files that have already been patched.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'vehicles');

// Match the existing card. We capture the £ amount so we can preserve it.
const OLD_CARD_RE = /<div class="text-center p-7 rounded-2xl bg-pis-deep text-white dark:bg-pis-lime dark:text-pis-ink border-2 border-pis-deep dark:border-pis-lime relative">[\s\S]*?<p class="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">([^<]+)<\/p>[\s\S]*?<p class="text-xs opacity-85">per year<\/p>\s*<\/div>/;

const newCard = (price) => `<div class="text-center p-7 rounded-2xl text-white border-2 relative shadow-lg" style="background:#E50580; border-color:#E50580;">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-extrabold tracking-[0.14em] uppercase bg-white px-2.5 py-1 rounded-full whitespace-nowrap" style="color:#E50580">EV-friendly tariff</span>
            <img src="/Other%20logos/Octopus%20logo.png" alt="Octopus Energy" class="h-7 w-auto mx-auto mb-3 mt-1" style="filter:brightness(0) invert(1)" loading="lazy" onerror="this.outerHTML='<p class=&quot;text-sm font-extrabold tracking-tight mb-2&quot;>Octopus Energy</p>'" />
            <p class="text-[0.65rem] uppercase tracking-[0.14em] font-bold opacity-90 mb-2">Intelligent Octopus Go</p>
            <p class="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">${price}</p>
            <p class="text-xs opacity-90">per year</p>
          </div>`;

let ok = 0, skipped = 0, missing = 0;
function walk() {
  const brands = fs.readdirSync(ROOT).filter(b => fs.statSync(path.join(ROOT, b)).isDirectory());
  for (const b of brands) {
    const brandDir = path.join(ROOT, b);
    const models = fs.readdirSync(brandDir).filter(d => fs.statSync(path.join(brandDir, d)).isDirectory());
    for (const m of models) {
      const file = path.join(brandDir, m, 'index.html');
      if (!fs.existsSync(file)) continue;
      let html = fs.readFileSync(file, 'utf8');

      // Already patched (pink + Octopus wordmark) — skip
      if (html.includes('background:#E50580') && html.includes('Octopus%20logo.png')) {
        skipped++; continue;
      }

      const match = html.match(OLD_CARD_RE);
      if (!match) { missing++; continue; }

      const price = match[1];
      html = html.replace(OLD_CARD_RE, newCard(price));
      fs.writeFileSync(file, html);
      ok++;
    }
  }
  console.log(`Recoloured: ${ok}  Already patched: ${skipped}  No card found: ${missing}`);
}
walk();
