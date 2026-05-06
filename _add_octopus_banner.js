// Adds an "EV + smart charger + Octopus Intelligent = annual savings" banner
// to every /vehicles/{brand}/{model}/index.html, inserted between the hero
// and the "Compatible EV chargers" section.
//
// Pulls battery / range from the existing hero stat tiles and computes a
// per-car savings figure using the same constants as the cost-to-charge
// section (7,000 mi/yr, 27p/kWh average tariff, 8.5p/kWh off-peak EV tariff).
// Idempotent.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'vehicles');

const ANNUAL_MILES = 7000;
const TARIFF_AVG = 0.27;
const TARIFF_EV = 0.085;

const SPECIAL = {
  'bmw':'BMW','mg':'MG','ds':'DS','gwm':'GWM','kgm':'KGM','levc':'LEVC',
  'ssangyong':'SsangYong','byd':'BYD','lucid-motors':'Lucid Motors',
  'mercedes-benz':'Mercedes-Benz','rolls-royce':'Rolls-Royce','land-rover':'Land Rover',
  'alfa-romeo':'Alfa Romeo','zero-motorcycles':'Zero Motorcycles'
};
const pretty = (s) => SPECIAL[s] || s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const fmtMoney = (n) => '£' + Math.round(n).toLocaleString('en-GB');

function parseStats(html) {
  const grab = (label) => {
    const re = new RegExp('mb-1">' + label + '</p><p[^>]*>([^<]+)</p>');
    const x = html.match(re);
    return x ? x[1].trim() : null;
  };
  const num = (s) => s ? parseFloat(s.replace(/[^0-9.]/g, '')) : NaN;
  return {
    batteryKWh: num(grab('Battery')),
    rangeMi: num(grab('WLTP range'))
  };
}

function bannerHTML({ brandSlug, modelSlug, brandName, modelName, savings }) {
  const fullName = `${brandName} ${modelName}`;
  const initials = (brandName.split(/\s+/)[0][0] + (brandName.split(/\s+/)[1]?.[0] || modelName[0])).toUpperCase();
  // Octopus Energy brand pink: #E50580 (primary) with a softer #FBE4EE for backgrounds
  return `
    <!-- Octopus Intelligent savings banner -->
    <section class="bg-pis-light dark:bg-white/[0.015] py-10 lg:py-14 border-b border-slate-200 dark:border-white/10">
      <div class="max-w-5xl mx-auto px-5 lg:px-8">
        <div class="rounded-3xl border-2 border-[#E50580]/40 bg-white dark:bg-pis-ink-2 overflow-hidden shadow-sm">
          <div class="text-white text-center py-3 px-5" style="background:#E50580">
            <p class="text-[0.7rem] lg:text-xs font-extrabold tracking-[0.16em] uppercase">Pair your ${fullName} + a smart charger + Octopus Intelligent</p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-5 lg:gap-x-5 p-7 lg:p-9">

            <div class="text-center" style="width:130px">
              <div class="w-24 h-24 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-white/5 grid place-items-center overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
                <img src="/vehicle_images/${brandSlug}/${modelSlug}.jpg" alt="${fullName}" class="w-full h-full object-cover" loading="lazy" onerror="this.outerHTML='<span class=&quot;text-base font-extrabold text-pis-deep dark:text-pis-lime&quot;>${initials}</span>'" />
              </div>
              <p class="text-xs font-semibold leading-snug text-pis-text dark:text-white">${fullName}</p>
            </div>

            <span class="text-2xl font-extrabold text-pis-text-3 dark:text-slate-500 px-1">+</span>

            <div class="text-center" style="width:130px">
              <div class="w-24 h-24 mx-auto mb-2 rounded-full bg-white grid place-items-center overflow-hidden ring-1 ring-slate-200 dark:ring-white/20">
                <img src="/ev_charger_images/ohme-home-pro.jpg" alt="Smart EV charger" class="w-16 h-16 object-contain" loading="lazy" onerror="this.style.display='none'" />
              </div>
              <p class="text-xs font-semibold leading-snug text-pis-text dark:text-white">Any compatible smart charger</p>
            </div>

            <span class="text-2xl font-extrabold text-pis-text-3 dark:text-slate-500 px-1">+</span>

            <div class="text-center" style="width:130px">
              <div class="w-24 h-24 mx-auto mb-2 grid place-items-center">
                <img src="/Other%20logos/Octopus%20Icon%20.png" alt="Octopus Energy" class="max-w-full max-h-full object-contain" loading="lazy" onerror="this.outerHTML='<span style=&quot;color:#E50580;font-weight:900;font-size:0.95rem;letter-spacing:0.04em&quot;>OCTOPUS</span>'" />
              </div>
              <p class="text-xs font-semibold leading-snug" style="color:#E50580">Intelligent Octopus Go</p>
            </div>

            <span class="text-2xl font-extrabold px-1" style="color:#E50580">=</span>

            <div class="text-center md:text-left" style="min-width:160px">
              <p class="text-[0.65rem] uppercase tracking-[0.14em] font-bold text-pis-text-3 dark:text-slate-400 mb-1">Save up to</p>
              <p class="text-3xl lg:text-4xl font-extrabold mb-1 leading-none" style="color:#E50580">${fmtMoney(savings)}</p>
              <p class="text-[0.65rem] text-pis-text-3 dark:text-slate-400 mb-3">per year, charging off-peak</p>
              <a href="#quote" class="btn btn-sm whitespace-nowrap" style="background:#E50580;color:#ffffff;border:0;">Request a quote</a>
            </div>

          </div>
        </div>
      </div>
    </section>
`;
}

let ok = 0, skipped = 0, failed = 0;
function walk() {
  const brands = fs.readdirSync(ROOT).filter(b => fs.statSync(path.join(ROOT, b)).isDirectory());
  for (const b of brands) {
    const brandDir = path.join(ROOT, b);
    const models = fs.readdirSync(brandDir).filter(d => fs.statSync(path.join(brandDir, d)).isDirectory());
    for (const m of models) {
      const file = path.join(brandDir, m, 'index.html');
      if (!fs.existsSync(file)) continue;
      let html = fs.readFileSync(file, 'utf8');
      // If a previous version of the banner is present, strip it so we re-insert the latest design.
      html = html.replace(/\s*<!-- Octopus Intelligent savings banner -->[\s\S]*?<\/section>\s*\n/, '\n');

      const stats = parseStats(html);
      let savings;
      if (isFinite(stats.batteryKWh) && isFinite(stats.rangeMi) && stats.rangeMi > 0) {
        const annualEnergy = (ANNUAL_MILES / stats.rangeMi) * stats.batteryKWh;
        savings = annualEnergy * (TARIFF_AVG - TARIFF_EV);
      } else {
        // Older/simpler PHEV templates don't expose battery+range tiles.
        // Use a sensible default: PHEVs ~£400, BEVs ~£500 (assumes off-peak vs avg tariff).
        savings = /phev|hybrid/i.test(html.match(/<span class="eyebrow[^"]*"><span class="eyebrow-dot"><\/span>([^<]+)/)?.[1] || '') ? 400 : 500;
      }

      const banner = bannerHTML({
        brandSlug: b, modelSlug: m,
        brandName: pretty(b), modelName: pretty(m),
        savings
      });

      // Insert before the chargers section. Try anchor variants in order.
      const anchorComment = '<!-- Compatible EV chargers -->';
      const anchorHeader = /(<section class="py-14 lg:py-20">\s*\n?\s*<div[^>]*>\s*\n?\s*<h2[^>]*>(?:Best|Recommended) EV chargers for)/;
      if (html.includes(anchorComment)) {
        html = html.replace(anchorComment, banner + '\n    ' + anchorComment);
      } else if (anchorHeader.test(html)) {
        html = html.replace(anchorHeader, banner + '\n    $1');
      } else {
        failed++; console.log('  no anchor:', file); continue;
      }
      fs.writeFileSync(file, html);
      ok++;
    }
  }
  console.log(`Banner inserted on: ${ok}  Skipped: ${skipped}  Failed: ${failed}`);
}
walk();
