// Align the three cost-to-charge cards on every model page:
//   - All three cards same height, vertically centred content
//   - Octopus card: no wordmark image (was rendering as a white block)
//   - "You save" card: ringed in lime, larger number, badge, check icon — stands out as the takeaway
// Captures the existing £ amounts for each card and reuses them.
// Idempotent.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'vehicles');

const GRID_RE = /<div class="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">[\s\S]*?<p class="text-xs text-pis-text-3 dark:text-slate-400">per year<\/p>\s*<\/div>\s*<\/div>/;

const newGrid = ({ avg, ev, save }) => `<div class="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto items-stretch">

          <div class="text-center p-7 rounded-2xl bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center min-h-[200px]">
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-bold text-pis-text-3 dark:text-slate-400 mb-3">Average UK tariff</p>
            <p class="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none mb-2">${avg}</p>
            <p class="text-xs text-pis-text-3 dark:text-slate-400">per year</p>
          </div>

          <div class="text-center p-7 rounded-2xl text-white border-2 relative shadow-lg flex flex-col items-center justify-center min-h-[200px]" style="background:#E50580; border-color:#E50580;">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-extrabold tracking-[0.18em] uppercase bg-white px-3 py-1 rounded-full whitespace-nowrap" style="color:#E50580">EV-friendly tariff</span>
            <p class="text-[0.65rem] uppercase tracking-[0.18em] font-bold opacity-95 mb-3">Intelligent Octopus Go</p>
            <p class="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none mb-2">${ev}</p>
            <p class="text-xs opacity-95">per year</p>
          </div>

          <div class="text-center p-7 rounded-2xl bg-pis-lime/10 dark:bg-pis-lime/15 border-2 border-pis-deep dark:border-pis-lime relative shadow-lg flex flex-col items-center justify-center min-h-[200px]">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-extrabold tracking-[0.18em] uppercase bg-pis-lime text-pis-ink px-3 py-1 rounded-full whitespace-nowrap">Big saving</span>
            <div class="flex items-center justify-center gap-1.5 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="text-pis-deep dark:text-pis-lime"><path d="M20 6 9 17l-5-5"/></svg>
              <p class="text-[0.65rem] uppercase tracking-[0.18em] font-bold text-pis-deep dark:text-pis-lime">You save</p>
            </div>
            <p class="text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-2 text-pis-deep dark:text-pis-lime">${save}</p>
            <p class="text-xs text-pis-deep dark:text-pis-lime font-semibold">per year</p>
          </div>

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

      if (html.includes('items-stretch') && html.includes('Big saving')) { skipped++; continue; }

      const block = html.match(GRID_RE);
      if (!block) { missing++; continue; }

      // Extract the three £ amounts from the block (in order: avg, ev, save)
      const prices = [...block[0].matchAll(/<p class="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1[^"]*">([£0-9,]+)<\/p>/g)].map(x => x[1]);
      if (prices.length < 3) { missing++; continue; }

      html = html.replace(GRID_RE, newGrid({ avg: prices[0], ev: prices[1], save: prices[2] }));
      fs.writeFileSync(file, html);
      ok++;
    }
  }
  console.log(`Aligned: ${ok}  Skipped: ${skipped}  No grid found: ${missing}`);
}
walk();
