// One-shot enrichment for all vehicle MODEL pages.
// - Adds brand logo lockup to hero
// - Replaces the basic "Charging speeds" section with an SHC-style charge-times matrix
// - Adds a "Cost to charge" section with avg-tariff vs EV-tariff annual savings
// - Adds an FAQ accordion (range, battery, connector, charge port, grant, bi-directional)
//
// Reads battery / range / maxAC / maxDC straight out of the existing hero stat tiles,
// so no external data file is required.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'vehicles');

const fmtHm = (hoursDecimal) => {
  if (!isFinite(hoursDecimal) || hoursDecimal <= 0) return '—';
  const totalMin = Math.round(hoursDecimal * 60);
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
const fmtMin = (minutes) => {
  if (!isFinite(minutes) || minutes <= 0) return '—';
  const m = Math.round(minutes);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), mm = m % 60;
  return mm === 0 ? `${h}h` : `${h}h ${mm}m`;
};
const fmtMoney = (n) => '£' + Math.round(n).toLocaleString('en-GB');
const fmtMoney2 = (n) => '£' + n.toFixed(2);

const ANNUAL_MILES = 7000;
const TARIFF_AVG = 0.27;   // p/kWh as £
const TARIFF_EV = 0.085;

const slugifyBrand = (s) => s.toLowerCase().replace(/[ëé]/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function parsePage(html) {
  const m = {};
  // Brand slug from breadcrumb
  const bc = html.match(/<a href="\/vehicles\/([a-z0-9-]+)\/" class="hover:text-pis-deep[^"]*">([^<]+)<\/a><span>\/<\/span>\s*<span class="text-pis-text dark:text-white">([^<]+)<\/span>/);
  if (!bc) return null;
  m.brandSlug = bc[1];
  m.brandName = bc[2].trim();
  m.modelName = bc[3].trim();
  // Eyebrow text e.g. "Abarth BEV"
  const eb = html.match(/<span class="eyebrow mb-3"><span class="eyebrow-dot"><\/span>([^<]+)<\/span>/);
  m.eyebrow = eb ? eb[1].trim() : `${m.brandName} BEV`;
  // Stats (from hero tiles)
  const grab = (label) => {
    const re = new RegExp(`mb-1">${label}<\\/p><p[^>]*>([^<]+)<\\/p>`);
    const x = html.match(re);
    return x ? x[1].trim() : null;
  };
  const battery = grab('Battery');           // e.g. "42 kWh"
  const range = grab('WLTP range');          // e.g. "164 mi"
  const maxAC = grab('Max AC');              // e.g. "11 kW"
  const maxDC = grab('Max DC');              // e.g. "85 kW"
  const num = (s) => s ? parseFloat(s.replace(/[^0-9.]/g, '')) : NaN;
  m.batteryKWh = num(battery);
  m.rangeMi = num(range);
  m.acKW = num(maxAC);
  m.dcKW = num(maxDC);
  m.batteryStr = battery; m.rangeStr = range; m.acStr = maxAC; m.dcStr = maxDC;
  return m;
}

function buildBrandLogoHero(brandSlug, brandName) {
  return `<div class="flex items-center gap-2.5 mb-3"><div class="w-10 h-10 grid place-items-center rounded-lg bg-white border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex-shrink-0"><img src="/vehicle_logos/${brandSlug}.png" alt="${brandName} logo" class="max-w-[80%] max-h-[80%] object-contain" loading="lazy" onerror="if(this.src.endsWith('.png')){this.src=this.src.replace('.png','.svg')}else{this.style.display='none';this.parentElement.innerHTML='<span class=&quot;text-xs font-extrabold tracking-tight text-pis-text&quot;>${brandName.slice(0,2).toUpperCase()}</span>'}"/></div><span class="text-sm font-bold tracking-[0.18em] uppercase text-pis-text-2 dark:text-slate-300">${brandName}</span></div>\n            `;
}

function buildCostSection(m) {
  const annualEnergyKWh = m.rangeMi > 0 ? (ANNUAL_MILES / m.rangeMi) * m.batteryKWh : 0;
  const costAvg = annualEnergyKWh * TARIFF_AVG;
  const costEV = annualEnergyKWh * TARIFF_EV;
  const savings = costAvg - costEV;
  const fullName = `${m.brandName} ${m.modelName}`;
  return `
    <!-- Cost to charge -->
    <section class="bg-pis-light dark:bg-white/[0.015] py-14 lg:py-20 border-y border-slate-200 dark:border-white/10">
      <div class="max-w-5xl mx-auto px-5 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <span class="eyebrow mb-3"><span class="eyebrow-dot"></span>RUNNING COSTS</span>
          <h2 class="text-2xl lg:text-4xl font-extrabold tracking-tight mb-4">How much does it cost to charge the ${fullName}?</h2>
          <p class="text-pis-text-3 dark:text-slate-300">On an average UK tariff, charging the ${fullName} at home costs about <strong class="text-pis-text dark:text-white">${fmtMoney(costAvg)} per year</strong>. Switch to an EV-friendly tariff like Octopus Intelligent and that drops to about <strong class="text-pis-deep dark:text-pis-lime">${fmtMoney(costEV)} per year</strong>.</p>
        </div>
        <div class="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div class="text-center p-7 rounded-2xl bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10">
            <p class="text-[0.65rem] uppercase tracking-[0.14em] font-bold text-pis-text-3 dark:text-slate-400 mb-2">Average UK tariff</p>
            <p class="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">${fmtMoney(costAvg)}</p>
            <p class="text-xs text-pis-text-3 dark:text-slate-400">per year</p>
          </div>
          <div class="text-center p-7 rounded-2xl bg-pis-deep text-white dark:bg-pis-lime dark:text-pis-ink border-2 border-pis-deep dark:border-pis-lime relative">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-extrabold tracking-[0.14em] uppercase bg-pis-lime text-pis-ink px-2.5 py-1 rounded-full whitespace-nowrap">Octopus Intelligent</span>
            <p class="text-[0.65rem] uppercase tracking-[0.14em] font-bold opacity-80 mb-2">EV-friendly tariff</p>
            <p class="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">${fmtMoney(costEV)}</p>
            <p class="text-xs opacity-85">per year</p>
          </div>
          <div class="text-center p-7 rounded-2xl bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10">
            <p class="text-[0.65rem] uppercase tracking-[0.14em] font-bold text-pis-text-3 dark:text-slate-400 mb-2">You save</p>
            <p class="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 text-pis-deep dark:text-pis-lime">${fmtMoney(savings)}</p>
            <p class="text-xs text-pis-text-3 dark:text-slate-400">per year</p>
          </div>
        </div>
        <p class="text-xs text-center text-pis-text-3 dark:text-slate-500 mt-6 max-w-3xl mx-auto">Calculated on ${ANNUAL_MILES.toLocaleString('en-GB')} miles/year, ${m.batteryStr} battery, ${m.rangeStr} WLTP range. Average tariff 27p/kWh. EV tariff (Octopus Intelligent off-peak) 8.5p/kWh.</p>
      </div>
    </section>
`;
}

function buildChargeTimesSection(m) {
  // Domestic 2.3, single-phase 7.4, three-phase 11, rapid = m.dcKW
  const fullName = `${m.brandName} ${m.modelName}`;
  const r2 = m.rangeMi || 1;
  const top20mi = (kw) => fmtHm((m.batteryKWh / r2 * 20) / kw);
  const top20miMin = (kw) => fmtMin((m.batteryKWh / r2 * 20) / kw * 60);
  const range20to80 = (kw) => fmtHm((m.batteryKWh * 0.6) / kw);
  const range20to80Min = (kw) => fmtMin((m.batteryKWh * 0.6) / kw * 60);
  const full = (kw) => fmtHm(m.batteryKWh / kw);
  const fullMin = (kw) => fmtMin(m.batteryKWh / kw * 60);
  const acCharge = Math.min(m.acKW || 7.4, 11);
  const tpKW = m.acKW >= 11 ? 11 : m.acKW || 7.4;
  const dc = m.dcKW || 50;
  return `
    <!-- Charge times -->
    <section class="py-14 lg:py-20">
      <div class="max-w-6xl mx-auto px-5 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <span class="eyebrow mb-3"><span class="eyebrow-dot"></span>CHARGE TIMES</span>
          <h2 class="text-2xl lg:text-4xl font-extrabold tracking-tight mb-4">How long does it take to charge the ${fullName}?</h2>
          <p class="text-pis-text-3 dark:text-slate-300">Most drivers top up overnight, so 0–100% charge times rarely matter. Here's what to expect across home and rapid charging.</p>
        </div>
        <div class="bg-white dark:bg-pis-ink-2 rounded-3xl border border-slate-200 dark:border-white/10 overflow-x-auto shadow-sm">
          <table class="w-full min-w-[720px] text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th class="text-left py-4 px-5 font-semibold text-pis-text-3 dark:text-slate-400">Charge amount</th>
                <th class="text-left py-4 px-5 font-semibold text-pis-text-3 dark:text-slate-400">Domestic socket<br><span class="text-[0.65rem] tracking-wide opacity-80">(2.3 kW)</span></th>
                <th class="text-left py-4 px-5 font-bold bg-pis-deep/5 dark:bg-pis-lime/10 text-pis-deep dark:text-pis-lime">Single phase<br><span class="text-[0.65rem] tracking-wide font-normal">(7.4 kW)</span></th>
                <th class="text-left py-4 px-5 font-semibold text-pis-text-3 dark:text-slate-400">Three phase<br><span class="text-[0.65rem] tracking-wide opacity-80">(${tpKW} kW)</span></th>
                <th class="text-left py-4 px-5 font-semibold text-pis-text-3 dark:text-slate-400">Rapid<br><span class="text-[0.65rem] tracking-wide opacity-80">(${dc} kW)</span></th>
              </tr>
            </thead>
            <tbody class="text-pis-text-2 dark:text-slate-300">
              <tr class="border-b border-slate-200 dark:border-white/10">
                <th class="text-left py-4 px-5 font-semibold">20 miles<br><span class="text-[0.65rem] tracking-wide font-normal text-pis-text-3 dark:text-slate-400">(average daily)</span></th>
                <td class="py-4 px-5">${top20mi(2.3)}</td>
                <td class="py-4 px-5 bg-pis-deep/5 dark:bg-pis-lime/10 font-bold text-pis-deep dark:text-pis-lime">${top20mi(7.4)}</td>
                <td class="py-4 px-5">${top20mi(tpKW)}</td>
                <td class="py-4 px-5">${top20miMin(dc)}</td>
              </tr>
              <tr class="border-b border-slate-200 dark:border-white/10">
                <th class="text-left py-4 px-5 font-semibold">20 → 80%</th>
                <td class="py-4 px-5">${range20to80(2.3)}</td>
                <td class="py-4 px-5 bg-pis-deep/5 dark:bg-pis-lime/10 font-bold text-pis-deep dark:text-pis-lime">${range20to80(7.4)}</td>
                <td class="py-4 px-5">${range20to80(tpKW)}</td>
                <td class="py-4 px-5">${range20to80Min(dc)}</td>
              </tr>
              <tr>
                <th class="text-left py-4 px-5 font-semibold">0 → 100%</th>
                <td class="py-4 px-5">${full(2.3)}</td>
                <td class="py-4 px-5 bg-pis-deep/5 dark:bg-pis-lime/10 font-bold text-pis-deep dark:text-pis-lime">${full(7.4)}</td>
                <td class="py-4 px-5">${full(tpKW)}</td>
                <td class="py-4 px-5">${fullMin(dc)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-pis-text-3 dark:text-slate-500 mt-4">Approximate. Real-world times vary with battery temperature, state of health and on-board charger limits. ${fullName} accepts up to ${m.acStr} AC / ${m.dcStr} DC.</p>
        <div class="text-center mt-8"><a href="/chargers/" class="btn btn-primary">View smart EV chargers</a></div>
      </div>
    </section>
`;
}

function buildFAQs(m) {
  const fullName = `${m.brandName} ${m.modelName}`;
  const isPHEV = /PHEV|Plug-in/i.test(m.eyebrow);
  const ac = m.acStr || '7.4 kW';
  const dc = m.dcStr || '50 kW';
  const range = m.rangeStr || '—';
  const battery = m.batteryStr || '—';
  return `
    <!-- FAQs -->
    <section class="py-14 lg:py-20">
      <div class="max-w-4xl mx-auto px-5 lg:px-8">
        <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight mb-8">${fullName} charging FAQs</h2>
        <div class="space-y-3">
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">What is the range of the ${fullName}?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">The ${fullName} has a WLTP-certified range of ${range}. WLTP is a standardised test all EVs go through in Europe — real-world range varies with driving style, weather and temperature.</div>
          </details>
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">What is the battery size of the ${fullName}?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">The ${fullName} has a ${battery} battery. The bigger the battery, the more range you get — and the more flexibility you have to charge during cheap off-peak windows.</div>
          </details>
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">What charging connector does the ${fullName} use?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">The ${fullName} uses a <strong>Type 2</strong> connector for home and public AC charging${isPHEV ? '' : ', and a <strong>CCS</strong> connector for rapid DC charging on the go'}. Every smart EV charger we install supports Type 2.</div>
          </details>
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">How fast can I charge the ${fullName} at home?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">The ${fullName} accepts up to ${ac} AC at home. With a 7.4 kW Ohme Home Pro on a single-phase supply, a full 0–100% charge takes around <strong>${fmtHm(m.batteryKWh / 7.4)}</strong>. Most drivers schedule overnight off-peak to wake up full.</div>
          </details>
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">What is the rapid-charging speed of the ${fullName}?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">On a public DC rapid charger, the ${fullName} can pull up to ${dc}, giving roughly a 20→80% charge in <strong>${fmtMin((m.batteryKWh * 0.6) / (m.dcKW || 50) * 60)}</strong>. Useful on long trips — at home, AC charging is cheaper and easier on the battery.</div>
          </details>
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">Does the ${fullName} qualify for the OZEV grant?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">If you rent, own a flat, or run a business you may qualify for up to <strong>£350 off</strong> via the OZEV EV Chargepoint Grant. Owner-occupier homeowners no longer qualify. <a href="/tools/grant-checker/" class="text-pis-deep dark:text-pis-lime font-semibold underline-offset-2 hover:underline">Check your eligibility</a>.</div>
          </details>
          <details class="group bg-white dark:bg-pis-ink-2 border border-slate-200 dark:border-white/10 rounded-2xl">
            <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&amp;::-webkit-details-marker]:hidden">
              <span class="font-bold">Does the ${fullName} support bi-directional charging?</span>
              <svg class="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180 text-pis-deep dark:text-pis-lime" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="px-6 pb-5 text-pis-text-3 dark:text-slate-300 text-sm leading-relaxed">Bi-directional (V2H / V2G) charging support varies by vehicle and software version. For a confirmed answer for your specific ${fullName} year and trim, <a href="/#quote" class="text-pis-deep dark:text-pis-lime font-semibold underline-offset-2 hover:underline">request a quote</a> and our team will check before install.</div>
          </details>
        </div>
      </div>
    </section>
`;
}

function enrichModelPage(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const m = parsePage(html);
  if (!m) return { skipped: true, reason: 'parse failed' };

  // Skip if already enriched
  if (html.includes('<!-- Cost to charge -->')) return { skipped: true, reason: 'already enriched' };

  // 1. Insert brand-logo lockup BEFORE the eyebrow span in the hero text col
  const heroLogo = buildBrandLogoHero(m.brandSlug, m.brandName);
  html = html.replace(
    /(<span class="eyebrow mb-3"><span class="eyebrow-dot"><\/span>)/,
    heroLogo + '$1'
  );

  // 2. Replace the existing "Charging speeds" section (the bg-pis-light section AFTER Compatible chargers).
  // Anchor: the section that opens with `<section class="bg-pis-light dark:bg-white/[0.015] py-14 lg:py-20">` and contains "Charging speeds"
  const speedsRegex = /\s*<section class="bg-pis-light dark:bg-white\/\[0\.015\] py-14 lg:py-20">[\s\S]*?Charging speeds[\s\S]*?<\/section>/;
  if (speedsRegex.test(html)) {
    html = html.replace(speedsRegex, buildCostSection(m) + buildChargeTimesSection(m));
  } else {
    // Fallback: insert AFTER the "Compatible EV chargers" section
    html = html.replace(
      /(<!-- Compatible EV chargers -->[\s\S]*?<\/section>)/,
      '$1\n' + buildCostSection(m) + buildChargeTimesSection(m)
    );
  }

  // 3. Insert FAQs BEFORE the final CTA (bg-section-radial)
  html = html.replace(
    /(<section class="bg-section-radial text-white py-20 lg:py-28 relative overflow-hidden">)/,
    buildFAQs(m) + '\n    $1'
  );

  fs.writeFileSync(filePath, html);
  return { ok: true, model: `${m.brandName} ${m.modelName}` };
}

// Walk all model pages
function walk() {
  const brands = fs.readdirSync(ROOT).filter(b => fs.statSync(path.join(ROOT, b)).isDirectory());
  let ok = 0, skipped = 0, failed = 0;
  for (const b of brands) {
    const brandDir = path.join(ROOT, b);
    const models = fs.readdirSync(brandDir).filter(d => fs.statSync(path.join(brandDir, d)).isDirectory());
    for (const mod of models) {
      const file = path.join(brandDir, mod, 'index.html');
      if (!fs.existsSync(file)) continue;
      try {
        const r = enrichModelPage(file);
        if (r.ok) ok++; else skipped++;
      } catch (e) {
        failed++;
        console.log('FAIL', file, e.message);
      }
    }
  }
  console.log(`Enriched: ${ok}  Skipped: ${skipped}  Failed: ${failed}`);
}

walk();
