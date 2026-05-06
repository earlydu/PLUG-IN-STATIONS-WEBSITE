/* ============================================================
   Plug In Stations — tools.js
   Self-contained client-side tools:
   - Smart Install Checker (multi-step lead magnet)
   - Cost Calculator
   - Grant Checker
   - Charging Cost Calculator
   - Compare Chargers
   ============================================================ */

(() => {
  'use strict';

  const fmt = (n) => '£' + Math.round(n).toLocaleString('en-GB');
  const fmtRange = (lo, hi) => `${fmt(lo)} – ${fmt(hi)}`;

  /* =========================================================
     Vehicle catalogue (used by charging cost calculator + chooser)
     Battery kWh and approx WLTP mi/kWh efficiency.
     ========================================================= */
  const VEHICLES = [
    { make: 'Tesla',       model: 'Model 3 Long Range',  battery: 75, miPerKwh: 4.0 },
    { make: 'Tesla',       model: 'Model Y Long Range',  battery: 75, miPerKwh: 3.7 },
    { make: 'Volkswagen',  model: 'ID.3',                battery: 58, miPerKwh: 3.9 },
    { make: 'Volkswagen',  model: 'ID.4',                battery: 77, miPerKwh: 3.5 },
    { make: 'BMW',         model: 'i4 eDrive40',         battery: 80, miPerKwh: 3.7 },
    { make: 'BMW',         model: 'iX3',                 battery: 74, miPerKwh: 3.4 },
    { make: 'Kia',         model: 'EV6 RWD',             battery: 77, miPerKwh: 3.8 },
    { make: 'Kia',         model: 'Niro EV',             battery: 64, miPerKwh: 4.0 },
    { make: 'Hyundai',     model: 'Ioniq 5 RWD',         battery: 77, miPerKwh: 3.7 },
    { make: 'Hyundai',     model: 'Kona Electric',       battery: 64, miPerKwh: 4.1 },
    { make: 'Nissan',      model: 'Leaf e+',             battery: 62, miPerKwh: 3.9 },
    { make: 'Nissan',      model: 'Ariya 87 kWh',        battery: 87, miPerKwh: 3.4 },
    { make: 'Audi',        model: 'Q4 e-tron 40',        battery: 77, miPerKwh: 3.5 },
    { make: 'Audi',        model: 'e-tron GT',           battery: 84, miPerKwh: 3.0 },
    { make: 'MG',          model: 'MG4 Long Range',      battery: 64, miPerKwh: 3.9 },
    { make: 'MG',          model: 'ZS EV',               battery: 51, miPerKwh: 3.6 },
    { make: 'Peugeot',     model: 'e-208',               battery: 50, miPerKwh: 4.0 },
    { make: 'Peugeot',     model: 'e-2008',              battery: 50, miPerKwh: 3.7 },
    { make: 'Vauxhall',    model: 'Corsa Electric',      battery: 50, miPerKwh: 4.0 },
    { make: 'Vauxhall',    model: 'Mokka Electric',      battery: 50, miPerKwh: 3.8 },
    { make: 'Renault',     model: 'Megane E-Tech',       battery: 60, miPerKwh: 4.0 },
    { make: 'Renault',     model: 'Zoe',                 battery: 52, miPerKwh: 4.1 },
    { make: 'Ford',        model: 'Mustang Mach-E',      battery: 88, miPerKwh: 3.3 },
    { make: 'Ford',        model: 'F-150 Lightning',     battery: 131, miPerKwh: 2.4 },
    { make: 'Toyota',      model: 'bZ4X',                battery: 71, miPerKwh: 3.4 },
    { make: 'Mercedes',    model: 'EQA 250',             battery: 67, miPerKwh: 3.5 },
    { make: 'Mercedes',    model: 'EQE 350+',            battery: 90, miPerKwh: 3.4 },
    { make: 'Jaguar',      model: 'I-PACE',              battery: 84, miPerKwh: 2.9 },
    { make: 'Polestar',    model: '2 Long Range',        battery: 78, miPerKwh: 3.4 },
    { make: 'Volvo',       model: 'XC40 Recharge',       battery: 75, miPerKwh: 3.0 },
  ];

  /* =========================================================
     Tariff rates (p/kWh) — illustrative, update annually
     ========================================================= */
  const TARIFFS = {
    'Standard cap (~24p/kWh)':            { peak: 24,  off: 24,  offHours: 0 },
    'Octopus Go (7p off-peak)':           { peak: 27,  off: 7,   offHours: 5 },
    'Intelligent Octopus (7p off-peak)':  { peak: 27,  off: 7,   offHours: 6 },
    'EDF GoElectric (~9p off-peak)':      { peak: 28,  off: 9,   offHours: 5 },
    'OVO Charge Anytime (10p)':           { peak: 27,  off: 10,  offHours: 6 },
    'British Gas EV (10p)':               { peak: 28,  off: 10,  offHours: 5 },
  };

  const PETROL_PPL = 145;          // pence per litre (illustrative)
  const PETROL_MPG = 45;            // average MPG of comparable ICE car
  const KWH_PER_GAL = 33.7;         // kWh equivalent in 1 imperial gallon of petrol (proxy)

  /* =========================================================
     SMART INSTALL CHECKER
     ========================================================= */
  function initSmartInstallChecker() {
    const root = document.querySelector('[data-tool="smart-install-checker"]');
    if (!root) return;

    const state = {
      step: 0,
      answers: {},
    };

    const steps = [
      {
        id: 'audience',
        title: 'Who is this install for?',
        description: 'Helps us match you with the right team.',
        choices: [
          { key: 'home',      label: 'My home',           desc: 'Driveway, garage or off-street parking' },
          { key: 'workplace', label: 'My workplace',      desc: 'Staff, visitors or company vehicles' },
          { key: 'fleet',     label: 'A fleet / depot',   desc: 'Multiple vehicles, depot charging' },
          { key: 'developer', label: 'A development',     desc: 'New build / multi-dwelling site' },
        ],
      },
      {
        id: 'parking',
        title: 'Where will the car be parked?',
        description: 'We can install where the cable can reach safely.',
        choices: [
          { key: 'driveway',  label: 'Off-street driveway',    desc: 'Most straightforward install' },
          { key: 'garage',    label: 'Garage',                 desc: 'Internal or attached garage' },
          { key: 'shared',    label: 'Shared / allocated bay', desc: 'Flat or shared parking — needs landlord approval' },
          { key: 'street',    label: 'On-street only',         desc: 'We may need to assess a cross-pavement solution' },
        ],
      },
      {
        id: 'distance',
        title: 'Distance from fuse board to charger location?',
        description: 'A rough guess is fine — affects cabling cost.',
        choices: [
          { key: 'short',  label: 'Under 5 metres',  desc: 'Standard install length' },
          { key: 'medium', label: '5 to 10 metres',  desc: 'Small additional cabling' },
          { key: 'long',   label: '10 to 20 metres', desc: 'Extra labour + cable' },
          { key: 'xl',     label: 'Over 20 metres',  desc: 'Site visit recommended' },
        ],
      },
      {
        id: 'consumer',
        title: 'How old is your fuse board (consumer unit)?',
        description: 'New chargers need a modern board with spare capacity.',
        choices: [
          { key: 'new',     label: 'Less than 10 years old', desc: 'Likely good to go' },
          { key: 'mid',     label: '10–20 years old',        desc: 'Probably fine, may need a tweak' },
          { key: 'old',     label: 'Over 20 years old',      desc: 'Likely needs upgrading' },
          { key: 'unknown', label: "I'm not sure",           desc: "We'll check during the survey" },
        ],
      },
      {
        id: 'vehicle',
        title: 'What about the vehicle?',
        description: 'So we can check OZEV grant eligibility.',
        choices: [
          { key: 'owned',  label: 'I already own an EV',     desc: 'Need a charger ASAP' },
          { key: 'order',  label: 'On order / arriving soon', desc: 'Want it installed before the car arrives' },
          { key: 'ptl',    label: 'Looking in the next 6 months', desc: 'Planning ahead' },
          { key: 'fleet',  label: 'Multiple vehicles',       desc: "I'll work it out at survey" },
        ],
      },
    ];

    const inner = document.createElement('div');
    inner.className = 'sic-inner';
    root.appendChild(inner);

    function render() {
      if (state.step < steps.length) {
        renderStep(steps[state.step]);
      } else if (state.step === steps.length) {
        renderContact();
      } else {
        renderResult();
      }
    }

    function renderProgress() {
      const total = steps.length + 2; // +contact +result
      const dots = Array.from({ length: total }, (_, i) =>
        `<div class="dot ${i < state.step ? 'is-done' : i === state.step ? 'is-active' : ''}"></div>`
      ).join('');
      return `<div class="steps-progress">${dots}</div>`;
    }

    function renderStep(step) {
      inner.innerHTML = `
        ${renderProgress()}
        <p class="text-xs font-bold tracking-[0.18em] uppercase text-[#0066FF] mb-3">Step ${state.step + 1} of ${steps.length + 1}</p>
        <h3 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">${step.title}</h3>
        <p class="text-slate-400 mb-7">${step.description}</p>
        <div class="choice-grid grid sm:grid-cols-2 gap-3 mb-8">
          ${step.choices.map(c => `
            <button class="choice-card ${state.answers[step.id] === c.key ? 'is-selected' : ''}" data-key="${c.key}" type="button">
              <span class="choice-radio"></span>
              <span class="choice-card-body">
                <strong>${c.label}</strong>
                <span>${c.desc}</span>
              </span>
            </button>
          `).join('')}
        </div>
        <div class="flex justify-between gap-3">
          <button class="btn btn-ghost ${state.step === 0 ? 'invisible' : ''}" data-back type="button">&larr; Back</button>
          <button class="btn btn-primary" data-next type="button" ${state.answers[step.id] ? '' : 'disabled style="opacity:.4;cursor:not-allowed"'}>Continue &rarr;</button>
        </div>
      `;

      inner.querySelectorAll('.choice-card').forEach(card => {
        card.addEventListener('click', () => {
          state.answers[step.id] = card.dataset.key;
          render();
        });
      });
      inner.querySelector('[data-next]').addEventListener('click', () => {
        if (state.answers[step.id]) { state.step++; render(); }
      });
      inner.querySelector('[data-back]').addEventListener('click', () => {
        if (state.step > 0) { state.step--; render(); }
      });
    }

    function renderContact() {
      inner.innerHTML = `
        ${renderProgress()}
        <p class="text-xs font-bold tracking-[0.18em] uppercase text-[#0066FF] mb-3">Final step</p>
        <h3 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">Where shall we send your tailored estimate?</h3>
        <p class="text-slate-400 mb-7">No obligation, no spam. We'll text you a time-stamped estimate within 24 hours.</p>
        <form class="space-y-3" id="sicForm" novalidate>
          <div class="grid sm:grid-cols-2 gap-3">
            <label class="field">
              <span>First name</span>
              <input type="text" name="firstName" required autocomplete="given-name" />
            </label>
            <label class="field">
              <span>Last name</span>
              <input type="text" name="lastName" autocomplete="family-name" />
            </label>
          </div>
          <label class="field">
            <span>Email</span>
            <input type="email" name="email" required autocomplete="email" />
          </label>
          <div class="grid sm:grid-cols-2 gap-3">
            <label class="field">
              <span>Phone</span>
              <input type="tel" name="phone" required autocomplete="tel" />
            </label>
            <label class="field">
              <span>Postcode</span>
              <input type="text" name="postcode" required autocomplete="postal-code" />
            </label>
          </div>
          <div class="flex justify-between gap-3 pt-2">
            <button class="btn btn-ghost" data-back type="button">&larr; Back</button>
            <button class="btn btn-accent" type="submit">See my result &rarr;</button>
          </div>
          <p class="text-xs text-slate-500 text-center pt-2">By submitting you agree to our privacy policy. We never share your details.</p>
        </form>
      `;

      inner.querySelector('[data-back]').addEventListener('click', () => { state.step--; render(); });

      const form = inner.querySelector('#sicForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        Object.assign(state.answers, data);
        // optimistic webhook send (silent fail until configured)
        fetch('https://services.leadconnectorhq.com/hooks/PLACEHOLDER', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            source: 'smart-install-checker',
            ...state.answers,
            ts: new Date().toISOString(),
          }),
        }).catch(() => null);
        state.step++;
        render();
      });
    }

    function renderResult() {
      const a = state.answers;
      // Scoring: lower = simpler/cheaper
      let score = 0;
      let issues = [];
      let perks = [];

      if (a.parking === 'driveway' || a.parking === 'garage') {
        score += 10; perks.push('Off-street parking — straightforward install');
      } else if (a.parking === 'shared') {
        score += 4; issues.push('Shared parking — landlord approval needed');
      } else {
        score += 1; issues.push('On-street parking — additional survey required');
      }

      if (a.distance === 'short') { score += 10; perks.push('Short cable run — minimum labour'); }
      else if (a.distance === 'medium') { score += 7; }
      else if (a.distance === 'long') { score += 4; issues.push('Longer cable run — adds £50–£150'); }
      else { score += 2; issues.push('20m+ cable run — needs site visit'); }

      if (a.consumer === 'new') { score += 10; perks.push('Modern consumer unit — no upgrade needed'); }
      else if (a.consumer === 'mid') { score += 7; }
      else if (a.consumer === 'old') { score += 3; issues.push('Older consumer unit — likely upgrade required'); }
      else { score += 5; }

      if (a.audience === 'home') { perks.push('OZEV EV Chargepoint Grant up to £350 may apply'); }
      if (a.audience === 'workplace') { perks.push('Workplace Charging Scheme up to £350/socket × 40'); }

      const verdict = score >= 25 ? 'great' : score >= 18 ? 'good' : 'review';

      let costLow = 800, costHigh = 1100;
      if (a.distance === 'medium') { costLow += 80; costHigh += 150; }
      else if (a.distance === 'long') { costLow += 150; costHigh += 300; }
      else if (a.distance === 'xl') { costLow += 300; costHigh += 600; }
      if (a.consumer === 'old') { costLow += 250; costHigh += 500; }
      if (a.parking === 'shared') { costLow += 100; costHigh += 250; }
      if (a.parking === 'street') { costLow += 200; costHigh += 600; }

      const verdictMap = {
        great:  { eyebrow: "GREAT NEWS", title: "You're a perfect candidate.", body: "Your install looks straightforward — we can usually book a fixed-price quote within 48 hours." },
        good:   { eyebrow: "LOOKING GOOD", title: "You're a strong candidate.", body: "A couple of items need a quick check, but most installs like yours go ahead smoothly." },
        review: { eyebrow: "NEEDS A REVIEW", title: "Let's chat through your setup.", body: "Your install has a few moving parts. A 5-minute call will sort it." },
      }[verdict];

      inner.innerHTML = `
        ${renderProgress()}
        <span class="eyebrow eyebrow-light mb-4">
          <span class="eyebrow-dot"></span>
          ${verdictMap.eyebrow}
        </span>
        <h3 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white">${verdictMap.title}</h3>
        <p class="text-slate-300 mb-8">${verdictMap.body}</p>

        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-7 mb-6">
          <p class="text-xs font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">Estimated install cost</p>
          <p class="result-bignum mb-2">${fmtRange(costLow, costHigh)}</p>
          <p class="text-sm text-slate-400">Includes labour, certification and a smart 7.4 kW charger. Final price confirmed after a 5-minute remote survey.</p>
        </div>

        ${perks.length ? `
        <div class="mb-5">
          <p class="text-xs font-bold tracking-[0.16em] uppercase text-[#00E676] mb-3">Working in your favour</p>
          <ul class="space-y-2">
            ${perks.map(p => `<li class="flex gap-2.5 text-slate-200 text-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>${p}</li>`).join('')}
          </ul>
        </div>` : ''}

        ${issues.length ? `
        <div class="mb-7">
          <p class="text-xs font-bold tracking-[0.16em] uppercase text-amber-300 mb-3">Worth a quick check</p>
          <ul class="space-y-2">
            ${issues.map(p => `<li class="flex gap-2.5 text-slate-200 text-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>${p}</li>`).join('')}
          </ul>
        </div>` : ''}

        <div class="flex flex-col sm:flex-row gap-3">
          <a href="/#quote" class="btn btn-accent btn-lg flex-1">Get my fixed-price quote &rarr;</a>
          <a href="tel:+448000000000" class="btn btn-ghost btn-lg flex-1">Call us — 0800 000 0000</a>
        </div>
      `;
    }

    render();
  }

  /* =========================================================
     COST CALCULATOR
     ========================================================= */
  function initCostCalculator() {
    const root = document.querySelector('[data-tool="cost-calculator"]');
    if (!root) return;

    const inputs = {
      property: root.querySelector('[name="property"]'),
      distance: root.querySelector('[name="distance"]'),
      consumer: root.querySelector('[name="consumer"]'),
      charger:  root.querySelector('[name="charger"]'),
    };
    const out = {
      lo: root.querySelector('[data-out="lo"]'),
      hi: root.querySelector('[data-out="hi"]'),
      breakdown: root.querySelector('[data-out="breakdown"]'),
      grant: root.querySelector('[data-out="grant"]'),
      label: root.querySelector('[data-out="label"]'),
    };

    function calc() {
      const p = inputs.property.value;
      const d = inputs.distance.value;
      const c = inputs.consumer.value;
      const ch = inputs.charger.value;

      let baseLo = 549, baseHi = 749; // labour
      let lines = [];
      lines.push({ label: 'Standard installation labour', cost: '£549 – £749' });

      const chargerCosts = {
        budget:  { lo: 300, hi: 500, name: 'Budget charger (basic 7 kW)' },
        smart:   { lo: 600, hi: 900, name: 'Smart charger (7 kW, app-controlled)' },
        premium: { lo: 900, hi: 1300, name: 'Premium charger (smart, OCPP, solar-ready)' },
      };
      const chSpec = chargerCosts[ch];
      lines.push({ label: chSpec.name, cost: `£${chSpec.lo} – £${chSpec.hi}` });
      baseLo += chSpec.lo; baseHi += chSpec.hi;

      const distanceAdj = { short: [0, 0], medium: [80, 160], long: [180, 380], xl: [400, 700] };
      const [dLo, dHi] = distanceAdj[d];
      if (dLo) {
        baseLo += dLo; baseHi += dHi;
        lines.push({ label: `Cable run (${d === 'medium' ? '5–10m' : d === 'long' ? '10–20m' : '20m+'})`, cost: `£${dLo} – £${dHi}` });
      }

      if (c === 'upgrade') {
        baseLo += 350; baseHi += 650;
        lines.push({ label: 'Consumer unit upgrade', cost: '£350 – £650' });
      }

      if (p === 'flat') {
        baseLo += 100; baseHi += 250;
        lines.push({ label: 'Flat / shared parking complexity', cost: '£100 – £250' });
      } else if (p === 'commercial') {
        baseLo += 300; baseHi += 800;
        lines.push({ label: 'Commercial extras (signage, cert.)', cost: '£300 – £800' });
      }

      // OZEV grant
      let grantText = '';
      if (p === 'flat') {
        grantText = `Eligible for OZEV EV Chargepoint Grant (up to £350) — included in our quote.`;
      } else if (p === 'commercial') {
        grantText = `Eligible for Workplace Charging Scheme — up to £350 per socket, max 40 sockets.`;
      } else {
        grantText = `Most homeowners with off-street parking aren't eligible for the new OZEV grant — we can confirm at survey.`;
      }

      out.lo.textContent = fmt(baseLo);
      out.hi.textContent = fmt(baseHi);
      out.label.textContent = `Estimated total — ${chSpec.name}`;
      out.grant.innerHTML = grantText;
      out.breakdown.innerHTML = lines.map(l => `
        <li class="flex justify-between gap-4 py-2.5 border-b border-slate-200 last:border-0">
          <span class="text-slate-700">${l.label}</span>
          <span class="font-semibold text-slate-900">${l.cost}</span>
        </li>
      `).join('');
    }

    Object.values(inputs).forEach(el => el.addEventListener('input', calc));
    calc();
  }

  /* =========================================================
     GRANT CHECKER
     ========================================================= */
  function initGrantChecker() {
    const root = document.querySelector('[data-tool="grant-checker"]');
    if (!root) return;

    const state = { step: 0, answers: {} };

    const steps = [
      {
        id: 'context', title: 'Where will the charger be installed?',
        choices: [
          { key: 'home_owner',  label: 'Home — I own', desc: 'House or maisonette, sole owner' },
          { key: 'home_renter', label: 'Home — I rent or live in a flat', desc: 'Tenant or leaseholder' },
          { key: 'workplace',   label: 'Workplace', desc: 'Business premises' },
          { key: 'fleet',       label: 'Fleet / depot', desc: 'Multi-vehicle business charging' },
        ],
      },
      {
        id: 'parking', title: 'Do you have dedicated off-street parking?',
        choices: [
          { key: 'yes', label: 'Yes', desc: 'Driveway, garage or allocated bay' },
          { key: 'no',  label: 'No', desc: 'On-street only or no parking allocated' },
        ],
      },
      {
        id: 'vehicle', title: 'Do you (or your business) own/lease an EV?',
        choices: [
          { key: 'yes',     label: 'Yes', desc: 'Already on the road or on order' },
          { key: 'pending', label: 'On order / arriving soon', desc: 'Awaiting delivery' },
          { key: 'no',      label: 'Not yet', desc: 'Still researching' },
        ],
      },
    ];

    const inner = document.createElement('div'); root.appendChild(inner);

    function progress() {
      const total = steps.length + 1;
      return `<div class="steps-progress">${
        Array.from({length: total}, (_, i) => `<div class="dot ${i < state.step ? 'is-done' : i === state.step ? 'is-active' : ''}"></div>`).join('')
      }</div>`;
    }

    function renderStep(step) {
      inner.innerHTML = `
        ${progress()}
        <p class="text-xs font-bold tracking-[0.18em] uppercase text-[#0066FF] mb-3">Step ${state.step + 1} of ${steps.length}</p>
        <h3 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-7 text-white">${step.title}</h3>
        <div class="choice-grid grid sm:grid-cols-2 gap-3 mb-8">
          ${step.choices.map(c => `
            <button class="choice-card ${state.answers[step.id] === c.key ? 'is-selected' : ''}" data-key="${c.key}" type="button">
              <span class="choice-radio"></span>
              <span class="choice-card-body">
                <strong>${c.label}</strong>
                <span>${c.desc}</span>
              </span>
            </button>
          `).join('')}
        </div>
        <div class="flex justify-between gap-3">
          <button class="btn btn-ghost ${state.step === 0 ? 'invisible' : ''}" data-back type="button">&larr; Back</button>
          <button class="btn btn-primary" data-next type="button" ${state.answers[step.id] ? '' : 'disabled style="opacity:.4;cursor:not-allowed"'}>${state.step === steps.length - 1 ? 'See result' : 'Continue'} &rarr;</button>
        </div>
      `;
      inner.querySelectorAll('.choice-card').forEach(card => {
        card.addEventListener('click', () => { state.answers[step.id] = card.dataset.key; render(); });
      });
      inner.querySelector('[data-next]').addEventListener('click', () => {
        if (state.answers[step.id]) { state.step++; render(); }
      });
      inner.querySelector('[data-back]').addEventListener('click', () => {
        if (state.step > 0) { state.step--; render(); }
      });
    }

    function renderResult() {
      const a = state.answers;
      let title, body, value, name, eligible;
      if (a.context === 'workplace' || a.context === 'fleet') {
        eligible = true;
        name = 'Workplace Charging Scheme (WCS)';
        value = 'Up to £350 per socket, maximum 40 sockets';
        title = "You're eligible for the Workplace Charging Scheme.";
        body = 'Your business can claim a voucher towards EV chargers installed at your premises. We handle the application and admin for you.';
      } else if (a.context === 'home_renter' && a.parking === 'yes' && (a.vehicle === 'yes' || a.vehicle === 'pending')) {
        eligible = true;
        name = 'EV Chargepoint Grant for Renters & Flat Owners';
        value = 'Up to £350 off the cost of installation';
        title = "You qualify for the EV Chargepoint Grant.";
        body = "As a renter or flat owner with off-street parking and an EV, you can claim £350 off your install. We'll handle the paperwork.";
      } else if (a.context === 'home_owner' && a.parking === 'yes' && a.vehicle !== 'no') {
        eligible = false;
        name = 'OZEV EV Chargepoint Grant';
        value = 'Not currently available to owner-occupier homeowners';
        title = "Owner-occupier homeowners aren't eligible right now.";
        body = "The grant for owner-occupier homes was withdrawn in 2022. The good news: our installs are still some of the most affordable in the UK, with finance from £25/month.";
      } else if (a.parking === 'no') {
        eligible = false;
        name = 'OZEV grants generally require off-street parking';
        value = 'No grant available without dedicated parking';
        title = "You'll need off-street parking to qualify.";
        body = "Without dedicated off-street parking we can't access OZEV grants. Some councils offer cross-pavement schemes — ask us for local options.";
      } else {
        eligible = false;
        name = 'Need an EV first';
        value = 'OZEV grants require an EV (owned or on order)';
        title = "Come back when your EV is on the way.";
        body = "Grant rules require proof of EV ownership or order. We can still install — and re-check eligibility once your car is sorted.";
      }

      inner.innerHTML = `
        ${progress()}
        <span class="eyebrow ${eligible ? 'eyebrow-light' : ''} mb-4">
          <span class="eyebrow-dot"></span>
          ${eligible ? 'YOU ARE ELIGIBLE' : 'NOT ELIGIBLE'}
        </span>
        <h3 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white">${title}</h3>
        <p class="text-slate-300 mb-7">${body}</p>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-7">
          <p class="text-xs font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">${eligible ? 'Estimated grant value' : 'Scheme'}</p>
          <p class="result-bignum mb-1">${eligible ? value.split(' — ')[0].split(',')[0] : '—'}</p>
          <p class="text-sm text-slate-400 mt-2"><strong class="text-white">${name}.</strong> ${value}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="/#quote" class="btn btn-accent btn-lg flex-1">${eligible ? 'Apply with us' : 'Get a quote anyway'} &rarr;</a>
          <button class="btn btn-ghost btn-lg flex-1" data-restart type="button">Start over</button>
        </div>
      `;
      inner.querySelector('[data-restart]').addEventListener('click', () => {
        state.step = 0; state.answers = {}; render();
      });
    }

    function render() {
      if (state.step < steps.length) renderStep(steps[state.step]);
      else renderResult();
    }

    render();
  }

  /* =========================================================
     CHARGING COST CALCULATOR
     ========================================================= */
  function initChargingCostCalculator() {
    const root = document.querySelector('[data-tool="charging-cost"]');
    if (!root) return;

    // Populate vehicle dropdown
    const select = root.querySelector('[name="vehicle"]');
    select.innerHTML = VEHICLES.map((v, i) => `<option value="${i}">${v.make} ${v.model}</option>`).join('');

    const tariffSelect = root.querySelector('[name="tariff"]');
    tariffSelect.innerHTML = Object.keys(TARIFFS).map(k => `<option>${k}</option>`).join('');

    const milesInput = root.querySelector('[name="miles"]');
    const out = {
      week:        root.querySelector('[data-out="week"]'),
      month:       root.querySelector('[data-out="month"]'),
      year:        root.querySelector('[data-out="year"]'),
      petrolYear:  root.querySelector('[data-out="petrolYear"]'),
      saving:      root.querySelector('[data-out="saving"]'),
      savingPct:   root.querySelector('[data-out="savingPct"]'),
    };

    function calc() {
      const v = VEHICLES[+select.value];
      const tariff = TARIFFS[tariffSelect.value];
      const miles = +milesInput.value || 0;

      // EV cost: assume off-peak charging dominates (smart-tariff users)
      const kwhPerWeek = miles / v.miPerKwh;
      const offPeakShare = tariff.offHours > 0 ? 0.85 : 0;
      const evCostPence = kwhPerWeek * (tariff.peak * (1 - offPeakShare) + tariff.off * offPeakShare);
      const evWeekly = evCostPence / 100;
      const evMonthly = evWeekly * (52 / 12);
      const evYear = evWeekly * 52;

      // Petrol equivalent
      const gallonsPerWeek = miles / PETROL_MPG;
      const litresPerWeek = gallonsPerWeek * 4.546;
      const petrolWeekly = (litresPerWeek * PETROL_PPL) / 100;
      const petrolYear = petrolWeekly * 52;

      const saving = petrolYear - evYear;
      const savingPct = petrolYear > 0 ? (saving / petrolYear) * 100 : 0;

      out.week.textContent = fmt(evWeekly);
      out.month.textContent = fmt(evMonthly);
      out.year.textContent = fmt(evYear);
      out.petrolYear.textContent = fmt(petrolYear);
      out.saving.textContent = fmt(Math.max(saving, 0));
      out.savingPct.textContent = `${Math.round(Math.max(savingPct, 0))}%`;
    }

    [select, tariffSelect, milesInput].forEach(el => el.addEventListener('input', calc));
    calc();
  }

  /* =========================================================
     COMPARE CHARGERS
     ========================================================= */
  const CHARGERS = [
    { id: 'pis-home',   name: 'Plug In Stations Home 7',     img: '/ev_charger_images/easee-one.png',         price: 949,  rating: 4.8, power: '7.4 kW', conn: 'Type 2 (tethered/untethered)', smart: true,  app: 'Plug In Stations app',     ocpp: false, solar: false, warranty: '3 yrs', size: '237 × 213 × 117mm', best: 'Single-EV homes wanting tidy app control' },
    { id: 'ohme-pro',   name: 'Ohme Home Pro',  img: '/ev_charger_images/ohme-home-pro.jpg',     price: 999,  rating: 4.7, power: '7.4 kW', conn: 'Type 2 tethered',              smart: true,  app: 'Ohme app',    ocpp: false, solar: false, warranty: '3 yrs', size: '210 × 165 × 110mm', best: 'Octopus Intelligent users on smart tariffs' },
    { id: 'hypervolt',  name: 'Hypervolt 3 Pro', img: '/ev_charger_images/hypervolt-7kw.jpg',    price: 1099, rating: 4.6, power: '7.4 kW', conn: 'Type 2 tethered',              smart: true,  app: 'Hypervolt',   ocpp: false, solar: true,  warranty: '3 yrs', size: '198 × 198 × 110mm', best: 'Solar/PV households' },
    { id: 'zappi',      name: 'MyEnergi Zappi', img: '/ev_charger_images/myenergi-zappi.jpg',    price: 1199, rating: 4.7, power: '7.4 kW', conn: 'Type 2 (tethered/untethered)', smart: true,  app: 'myenergi',    ocpp: false, solar: true,  warranty: '3 yrs', size: '283 × 296 × 122mm', best: 'Eco-mode + heating integration' },
    { id: 'wallbox',    name: 'Wallbox Pulsar Plus', img: '/ev_charger_images/wallbox-pulsar-max.jpg', price: 879, rating: 4.5, power: '7.4 kW', conn: 'Type 2 tethered',          smart: true,  app: 'Wallbox',     ocpp: true,  solar: true,  warranty: '2 yrs', size: '166 × 163 × 82mm',  best: 'Smallest unit, OCPP-ready' },
    { id: 'ohme-epod',  name: 'Ohme ePod',      img: '/ev_charger_images/ohme-epod.jpg',         price: 849,  rating: 4.6, power: '7.4 kW', conn: 'Type 2 untethered',            smart: true,  app: 'Ohme app',    ocpp: false, solar: false, warranty: '3 yrs', size: '177 × 152 × 100mm', best: 'Tight spaces & flats' },
    { id: 'pod-point',  name: 'Pod Point Solo 3', img: '/ev_charger_images/pod-point-solo-3.jpg', price: 949, rating: 4.5, power: '7.4 kW', conn: 'Type 2 tethered',              smart: true,  app: 'Pod Point',   ocpp: false, solar: false, warranty: '3 yrs', size: '342 × 199 × 122mm', best: 'Network-wide reliability' },
    { id: 'rolec',      name: 'Rolec EVO',      img: '/ev_charger_images/rolec-evo.jpg',         price: 799,  rating: 4.3, power: '7.4 kW', conn: 'Type 2 tethered',              smart: false, app: '—',           ocpp: true,  solar: false, warranty: '3 yrs', size: '300 × 200 × 130mm', best: 'Budget-friendly, simple' },
  ];

  function initCompareChargers() {
    const root = document.querySelector('[data-tool="compare-chargers"]');
    if (!root) return;

    const slots = ['a', 'b', 'c'];
    const state = { selection: ['pis-home', 'ohme-pro', 'wallbox'] };

    const select = (slot) => `
      <label class="field field-light">
        <span>Charger ${slot.toUpperCase()}</span>
        <select data-slot="${slot}">
          ${CHARGERS.map(c => `<option value="${c.id}" ${state.selection[slots.indexOf(slot)] === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </label>
    `;

    function render() {
      const sels = root.querySelector('[data-selectors]');
      sels.innerHTML = slots.map(select).join('');
      sels.querySelectorAll('select').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = slots.indexOf(sel.dataset.slot);
          state.selection[idx] = sel.value;
          renderTable();
        });
      });
      renderTable();
    }

    function renderTable() {
      const cs = state.selection.map(id => CHARGERS.find(c => c.id === id));
      const rows = [
        { label: 'Price (installed)', get: c => fmt(c.price) },
        { label: 'Pay monthly from', get: c => fmt(c.price / 36) + '/mo' },
        { label: 'Power output', get: c => c.power },
        { label: 'Connector', get: c => c.conn },
        { label: 'Smart / app control', get: c => c.smart ? '✓ ' + c.app : '—' },
        { label: 'OCPP compatible', get: c => c.ocpp ? '✓ Yes' : '—' },
        { label: 'Solar / PV ready', get: c => c.solar ? '✓ Yes' : '—' },
        { label: 'Warranty', get: c => c.warranty },
        { label: 'Dimensions', get: c => c.size },
        { label: 'Customer rating', get: c => `${c.rating} / 5` },
        { label: 'Best for', get: c => c.best },
      ];

      const tbody = root.querySelector('[data-table-body]');
      tbody.innerHTML = `
        <tr class="bg-white dark:bg-white/[0.02]">
          <th class="text-left py-5 px-5 font-semibold text-sm text-slate-600 dark:text-slate-400 align-bottom">Image</th>
          ${cs.map(c => `<td class="py-5 px-5"><div class="bg-white dark:bg-white/[0.04] rounded-2xl p-4 grid place-items-center h-32"><img src="${c.img}" alt="${c.name}" class="max-h-24 max-w-full object-contain" loading="lazy" onerror="this.style.display='none'"/></div></td>`).join('')}
        </tr>
        <tr class="bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10">
          <th class="text-left py-4 px-5 font-semibold text-sm text-slate-600 dark:text-slate-400">Charger</th>
          ${cs.map(c => `<th class="text-left py-4 px-5 font-extrabold text-base text-slate-900 dark:text-white">${c.name}</th>`).join('')}
        </tr>
        ${rows.map(r => `
          <tr class="border-t border-slate-200 dark:border-white/10">
            <th class="text-left py-4 px-5 font-semibold text-sm text-slate-600 dark:text-slate-400 align-top">${r.label}</th>
            ${cs.map(c => `<td class="py-4 px-5 text-sm text-slate-800 dark:text-slate-200 align-top">${r.get(c)}</td>`).join('')}
          </tr>
        `).join('')}
        <tr class="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <th class="text-left py-4 px-5 font-semibold text-sm text-slate-600 dark:text-slate-400"></th>
          ${cs.map(() => `<td class="py-4 px-5"><a href="/#quote" class="btn btn-primary btn-sm">Get quote</a></td>`).join('')}
        </tr>
      `;
    }

    render();
  }

  /* =========================================================
     Init all on DOM ready
     ========================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  function init() {
    initSmartInstallChecker();
    initCostCalculator();
    initGrantChecker();
    initChargingCostCalculator();
    initCompareChargers();
  }
})();
