// Replaces the simplified charger-card grid in each /vehicles/{brand}/{model}/index.html
// with the full /chargers/-index style cards (white image area + power tag + Best Seller badge
// + 4-bullet feature list + price + 0% finance line + dual CTA).
// Idempotent: if the new structure is already present, the file is skipped.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'vehicles');

const HOME_PRO_FALLBACK = `'<svg viewBox=&quot;0 0 80 110&quot; class=&quot;h-40&quot;><rect x=&quot;14&quot; y=&quot;6&quot; width=&quot;52&quot; height=&quot;98&quot; rx=&quot;10&quot; fill=&quot;%23161B22&quot; stroke=&quot;%230099CC&quot; stroke-width=&quot;0.5&quot;/><rect x=&quot;22&quot; y=&quot;20&quot; width=&quot;36&quot; height=&quot;50&quot; rx=&quot;4&quot; fill=&quot;%230D1117&quot;/><text x=&quot;40&quot; y=&quot;45&quot; text-anchor=&quot;middle&quot; fill=&quot;%23C1FF1D&quot; font-family=&quot;Poppins&quot; font-weight=&quot;800&quot; font-size=&quot;9&quot;>OHME</text><text x=&quot;40&quot; y=&quot;58&quot; text-anchor=&quot;middle&quot; fill=&quot;white&quot; font-family=&quot;Poppins&quot; font-weight=&quot;600&quot; font-size=&quot;7&quot;>HOME PRO</text><circle cx=&quot;40&quot; cy=&quot;84&quot; r=&quot;14&quot; fill=&quot;%23C1FF1D&quot;/><path d=&quot;M39 76l-5 12h5l-1.5 8 8-12h-5l1.5-8z&quot; fill=&quot;%230D1117&quot;/></svg>'`;
const EPOD_FALLBACK = `'<svg viewBox=&quot;0 0 80 110&quot; class=&quot;h-40&quot;><rect x=&quot;22&quot; y=&quot;14&quot; width=&quot;36&quot; height=&quot;78&quot; rx=&quot;8&quot; fill=&quot;%23161B22&quot;/><text x=&quot;40&quot; y=&quot;38&quot; text-anchor=&quot;middle&quot; fill=&quot;%23C1FF1D&quot; font-family=&quot;Poppins&quot; font-weight=&quot;800&quot; font-size=&quot;9&quot;>OHME</text><text x=&quot;40&quot; y=&quot;50&quot; text-anchor=&quot;middle&quot; fill=&quot;white&quot; font-family=&quot;Poppins&quot; font-weight=&quot;600&quot; font-size=&quot;6&quot;>EPOD</text><circle cx=&quot;40&quot; cy=&quot;72&quot; r=&quot;13&quot; fill=&quot;none&quot; stroke=&quot;%23C1FF1D&quot; stroke-width=&quot;2&quot;/><path d=&quot;M39 64l-4 11h4l-1 7 7-11h-4l1-7z&quot; fill=&quot;%23C1FF1D&quot;/></svg>'`;

const NEW_GRID = `<div class="grid md:grid-cols-2 gap-6 max-w-4xl">
          <article class="bg-slate-50 dark:bg-white/[0.02] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 lift hover:shadow-xl relative">
            <div class="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-[0.65rem] font-extrabold tracking-wider bg-pis-lime text-pis-ink px-3 py-1.5 rounded-full uppercase shadow-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.3L2 10l7.1-1.1z"/></svg>
              Best Seller
            </div>
            <div class="bg-white p-8 h-64 grid place-items-center relative border-b border-slate-200 dark:border-white/10">
              <span class="absolute top-3 left-3 text-[0.65rem] font-bold tracking-[0.14em] text-pis-deep bg-pis-deep/10 border border-pis-deep/25 rounded-full px-2.5 py-1">7.4 kW · TETHERED</span>
              <img src="/ev_charger_images/ohme-home-pro.jpg" alt="Ohme Home Pro EV charger" class="h-44 object-contain" loading="lazy" onerror="this.outerHTML=${HOME_PRO_FALLBACK}" />
            </div>
            <div class="p-7">
              <h3 class="text-xl font-bold mb-1.5">Ohme Home Pro</h3>
              <p class="text-sm text-pis-text-3 dark:text-slate-300 mb-5">Best-in-class with Octopus Intelligent. 5m tethered cable, LED display, OZEV-grant ready.</p>
              <ul class="text-sm space-y-1.5 mb-5 text-pis-text-2 dark:text-slate-300">
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>7.4 kW Type 2 tethered (5m)</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Built-in LED display</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Smart tariff scheduling</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>3-year unit warranty</li>
              </ul>
              <div class="flex items-baseline gap-2 mb-1"><span class="text-2xl font-extrabold">£999</span><span class="text-sm text-pis-text-3 dark:text-slate-400">fully fitted</span></div>
              <p class="text-xs text-pis-deep dark:text-pis-lime font-semibold mb-4">Or from £27.75/mo · 0% finance via Bumper</p>
              <div class="grid grid-cols-2 gap-2"><a href="/chargers/ohme/home-pro/" class="btn btn-outline btn-sm">View EV charger</a><a href="/#quote" class="btn btn-primary btn-sm">Get my quote</a></div>
            </div>
          </article>

          <article class="bg-slate-50 dark:bg-white/[0.02] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 lift hover:shadow-xl relative">
            <div class="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-[0.65rem] font-extrabold tracking-wider bg-pis-lime text-pis-ink px-3 py-1.5 rounded-full uppercase shadow-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.3L2 10l7.1-1.1z"/></svg>
              Best Seller
            </div>
            <div class="bg-white p-8 h-64 grid place-items-center relative border-b border-slate-200 dark:border-white/10">
              <span class="absolute top-3 left-3 text-[0.65rem] font-bold tracking-[0.14em] text-pis-deep bg-pis-deep/10 border border-pis-deep/25 rounded-full px-2.5 py-1">7.4 kW · COMPACT</span>
              <img src="/ev_charger_images/ohme-epod.jpg" alt="Ohme ePod EV charger" class="h-44 object-contain" loading="lazy" onerror="this.outerHTML=${EPOD_FALLBACK}" />
            </div>
            <div class="p-7">
              <h3 class="text-xl font-bold mb-1.5">Ohme ePod</h3>
              <p class="text-sm text-pis-text-3 dark:text-slate-300 mb-5">Compact, untethered, no display - same smart brains as the Home Pro.</p>
              <ul class="text-sm space-y-1.5 mb-5 text-pis-text-2 dark:text-slate-300">
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>7.4 kW Type 2 untethered</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Smallest Ohme unit</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Full Ohme app + tariff support</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Bring your own Type 2 cable</li>
              </ul>
              <div class="flex items-baseline gap-2 mb-1"><span class="text-2xl font-extrabold">£849</span><span class="text-sm text-pis-text-3 dark:text-slate-400">fully fitted</span></div>
              <p class="text-xs text-pis-deep dark:text-pis-lime font-semibold mb-4">Or from £23.58/mo · 0% finance via Bumper</p>
              <div class="grid grid-cols-2 gap-2"><a href="/chargers/ohme/epod/" class="btn btn-outline btn-sm">View EV charger</a><a href="/#quote" class="btn btn-primary btn-sm">Get my quote</a></div>
            </div>
          </article>
        </div>`;

// Match the existing model-page chargers grid (the one that opens with this exact class
// and contains two <article> blocks ending with the closing </div> of the grid).
const GRID_RE = /<div class="grid md:grid-cols-2 gap-6 max-w-4xl">\s*<article[\s\S]*?<\/article>\s*<\/div>/m;

let ok = 0, skipped = 0;
function walk() {
  const brands = fs.readdirSync(ROOT).filter(b => fs.statSync(path.join(ROOT, b)).isDirectory());
  for (const b of brands) {
    const brandDir = path.join(ROOT, b);
    const models = fs.readdirSync(brandDir).filter(d => fs.statSync(path.join(brandDir, d)).isDirectory());
    for (const mod of models) {
      const file = path.join(brandDir, mod, 'index.html');
      if (!fs.existsSync(file)) continue;
      let html = fs.readFileSync(file, 'utf8');
      // Skip if already converted (presence of the new feature-list style)
      if (html.includes('7.4 kW Type 2 tethered (5m)') && html.includes('h-64 grid place-items-center relative border-b')) {
        skipped++; continue;
      }
      if (!GRID_RE.test(html)) {
        skipped++; continue;
      }
      html = html.replace(GRID_RE, NEW_GRID);
      fs.writeFileSync(file, html);
      ok++;
    }
  }
  console.log(`Restyled: ${ok}  Skipped: ${skipped}`);
}
walk();
