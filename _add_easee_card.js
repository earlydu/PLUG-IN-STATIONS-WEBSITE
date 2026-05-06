// Add a 3rd "Easee One" charger card to every /vehicles/{brand}/{model}/index.html
// - Widens the grid from 2-up to 3-up on lg
// - Updates the intro paragraph from "Both Ohme units" to "Three units below"
// - Inserts the Easee One card after the Ohme ePod card
// Idempotent: skips files that already contain the Easee One card.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'vehicles');

const EASEE_FALLBACK = `'<svg viewBox=&quot;0 0 80 110&quot; class=&quot;h-40&quot;><rect x=&quot;20&quot; y=&quot;10&quot; width=&quot;40&quot; height=&quot;90&quot; rx=&quot;6&quot; fill=&quot;%23161B22&quot;/><circle cx=&quot;40&quot; cy=&quot;55&quot; r=&quot;14&quot; fill=&quot;%23C1FF1D&quot;/><text x=&quot;40&quot; y=&quot;60&quot; text-anchor=&quot;middle&quot; fill=&quot;%230D1117&quot; font-family=&quot;Poppins&quot; font-weight=&quot;800&quot; font-size=&quot;9&quot;>e</text></svg>'`;

const EASEE_CARD = `

          <article class="bg-slate-50 dark:bg-white/[0.02] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 lift hover:shadow-xl relative">
            <div class="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-[0.65rem] font-extrabold tracking-wider bg-pis-lime text-pis-ink px-3 py-1.5 rounded-full uppercase shadow-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.3L2 10l7.1-1.1z"/></svg>
              3-Phase Ready
            </div>
            <div class="bg-white p-8 h-64 grid place-items-center relative border-b border-slate-200 dark:border-white/10">
              <span class="absolute top-3 left-3 text-[0.65rem] font-bold tracking-[0.14em] text-pis-deep bg-pis-deep/10 border border-pis-deep/25 rounded-full px-2.5 py-1">7.4 / 22 kW · MODULAR</span>
              <img src="/ev_charger_images/easee-one.png" alt="Easee One EV charger" class="h-44 object-contain" loading="lazy" onerror="this.outerHTML=${EASEE_FALLBACK}" />
            </div>
            <div class="p-7">
              <h3 class="text-xl font-bold mb-1.5">Easee One</h3>
              <p class="text-sm text-pis-text-3 dark:text-slate-300 mb-5">Slim, modular - works on single-phase or 3-phase supplies. Dynamic load balancing.</p>
              <ul class="text-sm space-y-1.5 mb-5 text-pis-text-2 dark:text-slate-300">
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>7.4 kW single / 22 kW three-phase</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Untethered Type 2</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>Dynamic load balancing</li>
                <li class="flex gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39B54A" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>OCPP 1.6 ready &middot; 3-yr warranty</li>
              </ul>
              <div class="flex items-baseline gap-2 mb-1"><span class="text-2xl font-extrabold">£949</span><span class="text-sm text-pis-text-3 dark:text-slate-400">fully fitted</span></div>
              <p class="text-xs text-pis-deep dark:text-pis-lime font-semibold mb-4">Or from £26.36/mo &middot; 0% finance via Bumper</p>
              <div class="grid grid-cols-2 gap-2"><a href="/chargers/easee/one/" class="btn btn-outline btn-sm">View EV charger</a><a href="#quote" class="btn btn-primary btn-sm">Get my quote</a></div>
            </div>
          </article>`;

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

      if (html.includes('Easee One')) { skipped++; continue; }
      // Need the existing 2-card grid to be present
      if (!html.includes('<div class="grid md:grid-cols-2 gap-6 max-w-4xl">')) { skipped++; continue; }

      // Widen grid + max width
      html = html.replace(
        '<div class="grid md:grid-cols-2 gap-6 max-w-4xl">',
        '<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">'
      );
      // Update intro paragraph (any model name after "Best EV chargers for the X")
      html = html.replace(
        /Both Ohme units below are fully compatible\. Pick the Home Pro for a built-in display \+ tethered cable, or the ePod for the smallest footprint\./,
        'All three units below are fully compatible. Pick the Home Pro for a built-in display + tethered cable, the ePod for the smallest footprint, or the Easee One if you want 3-phase headroom.'
      );

      // Insert Easee card after the ePod (last) article. Anchor is `</article>` followed by
      // the grid's closing `</div></div></section>` — the only `</article>` that's directly
      // followed by a `</div>` (other articles are followed by `<article ...>`).
      const anchorRe = /(\s*<\/article>)(\s*<\/div>\s*<\/div>\s*<\/section>)/;
      if (anchorRe.test(html)) {
        html = html.replace(anchorRe, '$1' + EASEE_CARD + '$2');
        fs.writeFileSync(file, html);
        ok++;
      } else {
        skipped++;
      }
    }
  }
  console.log(`Inserted Easee One on: ${ok}  Skipped: ${skipped}`);
}
walk();
