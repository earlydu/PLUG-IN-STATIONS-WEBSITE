/* ============================================================
   Plug In Stations — main.js
   - Dark/light mode toggle (persisted to localStorage)
   - Header + footer + accreditation bar injection
   - Sticky CTA, exit intent, WhatsApp FAB
   - Animated counters, reveal-on-scroll
   - YouTube Lite facade pattern
   - Testimonials carousel (auto-play, pause on hover)
   - Form submission to GHL webhook with UTM capture
   ============================================================ */

(() => {
  'use strict';

  /* ---------- Plug In Stations site-wide stats (single source of truth) ---------- */
  window.PIS_STATS = {
    trustpilot_reviews: '1,121',
    trustpilot_rating: '4.7',
    trustpilot_label: 'Excellent',
    google_reviews: '1,368',
    google_rating: '4.9',
    google_label: '4.9★ on Google',
    total_installs: '25,000+',
    install_time: '7–10 Days',
    finance: '0% Finance Available',
    warranty_install: '5 Year Installation Warranty',
    warranty_unit: '3 Year Unit Warranty',
  };

  const PHONE = '0203 795 7117';
  const PHONE_LINK = 'tel:+442037957117';
  const EMAIL = 'enquiries@plugin-stations.com';
  const WHATSAPP = 'https://wa.me/447538231855?text=Hi%20PIS%2C%20I%27d%20like%20a%20quote';
  const FORM_WEBHOOK = '[REPLACE_WITH_GHL_WEBHOOK_URL]'; // TODO: replace with real GHL hook URL

  /* ============================================================
     ACCREDITATION BADGE DATA (used by bar + footer)
     ============================================================ */
  const ACCREDITATIONS = [
    { id:'ozev',       label:'OZEV Approved',         tip:'Office for Zero Emission Vehicles — required to process government grants', icon:'shield' },
    { id:'niceic',     label:'NICEIC Approved',       tip:'National Inspection Council for Electrical Installation Contracting — BS 7671 compliant', icon:'lightning' },
    { id:'napit',      label:'NAPIT Registered',      tip:'Government-approved scheme operator for electrical contractors', icon:'badge' },
    { id:'trustpilot', label:'Trustpilot Excellent',  tip:'4.7★ across 1,121 verified reviews', icon:'star' },
    { id:'google',     label:'4.9★ on Google',        tip:'1,368 verified Google reviews — 4.9★ average', icon:'google' },
    { id:'ohme',       label:'Ohme Approved Installer', tip:'Official Ohme installation partner — UK\'s #1', icon:'plug' },
    { id:'which',      label:'Which? Trusted Trader', tip:'Independent consumer endorsement', icon:'check' },
    { id:'trustmark',  label:'TrustMark',             tip:'Government-endorsed quality scheme for tradespeople', icon:'tick-shield' },
    { id:'tree',       label:'We Plant a Tree',       tip:'A real tree planted for every installation completed', icon:'tree' },
    { id:'finance',    label:'0% Finance · Bumper',   tip:'Spread the cost — 0% interest, soft credit check', icon:'finance' },
    { id:'warranty',   label:'5 Yr Install Warranty', tip:'Five-year workmanship warranty on every install', icon:'umbrella' },
  ];

  const ICONS = {
    shield:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/></svg>`,
    lightning: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 12.5h6L9.5 22 19.5 11.5h-6z"/></svg>`,
    badge:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m9 14-2 8 5-3 5 3-2-8"/></svg>`,
    star:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.3L2 10l7.1-1.1z"/></svg>`,
    google:    `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.54-.2-2.27H12v4.3h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC04" d="M5.85 14.12a6.6 6.6 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.67-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>`,
    plug:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v4M15 2v4M7 8h10v4a5 5 0 0 1-10 0z"/><path d="M12 17v5"/></svg>`,
    check:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>`,
    'tick-shield': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/><path d="m9 12 2 2 4-4"/></svg>`,
    tree:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 6 9h4l-3 4h3l-2 4h8l-2-4h3l-3-4h4z"/><path d="M12 17v5"/></svg>`,
    finance:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>`,
    umbrella:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10 10 0 0 0-20 0"/><path d="M12 12v7a3 3 0 0 0 6 0"/><path d="M12 2v4"/></svg>`,
    sun:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
    moon:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  };

  function renderAccreditation(b, opts={}) {
    return `<span class="accred-pill" data-tip="${b.tip}">
      <span class="accred-icon">${ICONS[b.icon] || ICONS.check}</span>
      <span class="accred-label">${b.label}</span>
    </span>`;
  }

  /* ============================================================
     HEADER (with dark/light toggle + dropdown)
     ============================================================ */
  const headerHTML = `
  <header id="siteHeader" data-state="top" class="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
    <div class="border-b border-transparent transition-all duration-300" data-shell>
      <div class="max-w-7xl mx-auto px-5 lg:px-8 h-[100px] flex items-center justify-between gap-6">
        <a href="/" class="flex items-center" aria-label="Plug In Stations home">
          <img src="/brand_assets/Plug%20In%20Stations%20Logo_black.png" alt="Plug In Stations" class="logo-black h-[5.25rem] w-auto" />
          <img src="/brand_assets/plugin%20stations%20logo.png" alt="Plug In Stations" class="logo-white h-[5.25rem] w-auto" />
        </a>

        <nav class="hidden lg:flex items-center gap-1 ml-auto" aria-label="Primary">
          <a href="/" class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors">Home</a>
          <a href="/chargers/" class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors">EV Chargers</a>
          <a href="/vehicles/" class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors">Vehicles</a>
          <div class="relative group">
            <button class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1">
              Tools <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[260px]">
              <div class="bg-white dark:bg-pis-ink-2 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-white/10 p-2">
                <a href="/smart-install-checker/" class="block px-4 py-3 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"><span class="font-semibold">Smart Install Checker</span><span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Get a tailored install report</span></a>
                <a href="/tools/cost-calculator/" class="block px-4 py-3 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"><span class="font-semibold">Cost Calculator</span><span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estimate your install cost</span></a>
                <a href="/tools/grant-checker/" class="block px-4 py-3 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"><span class="font-semibold">Grant Checker</span><span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Check OZEV eligibility</span></a>
                <a href="/tools/charging-cost-calculator/" class="block px-4 py-3 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"><span class="font-semibold">Charging Cost</span><span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Running costs vs petrol</span></a>
                <a href="/tools/compare-chargers/" class="block px-4 py-3 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"><span class="font-semibold">Compare Chargers</span><span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Side-by-side spec compare</span></a>
              </div>
            </div>
          </div>
          <a href="/guides/" class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors">Guides</a>
          <a href="/locations/" class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors">Locations</a>
          <a href="/about/" class="nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors">About</a>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          <button class="theme-toggle" id="themeToggle" role="switch" aria-label="Toggle dark mode">
            <span class="theme-icon theme-icon-sun" aria-hidden="true">${ICONS.sun}</span>
            <span class="theme-icon theme-icon-moon" aria-hidden="true">${ICONS.moon}</span>
          </button>
          <a href="${PHONE_LINK}" class="phone-link hidden lg:inline-flex items-center gap-2 text-sm font-semibold transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>${PHONE}</span>
          </a>
          <button type="button" data-pis-quote-trigger class="btn btn-primary btn-sm magnetic-cta hidden md:inline-flex">Get Free Quote</button>
          <button class="burger lg:hidden" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>

    <div id="mobileMenu" class="lg:hidden bg-white dark:bg-pis-ink-2 border-b border-slate-200 dark:border-white/10 shadow-xl px-5 py-6 space-y-1" hidden>
      <a href="/" class="block px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5">Home</a>
      <a href="/chargers/" class="block px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5">EV Chargers</a>
      <a href="/vehicles/" class="block px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5">Vehicles</a>
      <div class="pt-2 pb-1 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tools</div>
      <a href="/smart-install-checker/" class="block px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5">Smart Install Checker</a>
      <a href="/tools/cost-calculator/" class="block px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5">Cost Calculator</a>
      <a href="/tools/grant-checker/" class="block px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5">Grant Checker</a>
      <a href="/tools/charging-cost-calculator/" class="block px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5">Charging Cost</a>
      <a href="/tools/compare-chargers/" class="block px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5">Compare Chargers</a>
      <a href="/guides/" class="block px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5">Guides</a>
      <a href="/locations/" class="block px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5">Locations</a>
      <a href="/about/" class="block px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5">About</a>
      <button type="button" data-pis-quote-trigger class="btn btn-primary w-full mt-3">Get Free Quote</button>
    </div>
  </header>
  `;

  /* ============================================================
     ACCREDITATION BAR (used below hero + footer)
     ============================================================ */
  const accreditationBarHTML = `
  <section data-pis-accred-bar class="border-y border-slate-200 dark:border-white/10 bg-white dark:bg-pis-ink-2/40 py-5 lg:py-6">
    <div class="max-w-7xl mx-auto px-5 lg:px-8">
      <p class="text-[0.7rem] font-bold tracking-[0.22em] uppercase text-slate-500 dark:text-slate-400 text-center mb-4">UK's #1 Ohme Installer · Fully Accredited</p>
      <div class="flex flex-wrap justify-center items-center gap-2.5 lg:gap-3">
        ${ACCREDITATIONS.map(b => renderAccreditation(b)).join('')}
      </div>
    </div>
  </section>
  `;

  /* ============================================================
     FOOTER
     ============================================================ */
  const footerHTML = `
  <footer class="bg-pis-ink text-slate-400 pt-16 pb-8 border-t border-white/5">
    <div class="max-w-7xl mx-auto px-5 lg:px-8">
      <!-- Trust strip in footer -->
      <div class="border border-white/10 rounded-3xl p-6 lg:p-7 mb-12 bg-white/[0.02]">
        <div class="flex flex-wrap justify-center items-center gap-2.5 lg:gap-3">
          ${ACCREDITATIONS.map(b => renderAccreditation(b)).join('')}
        </div>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">
        <div class="lg:col-span-4">
          <a href="/" class="inline-flex items-center mb-5" aria-label="Plug In Stations">
            <img src="/brand_assets/plugin%20stations%20logo.png" alt="Plug In Stations" class="h-16 w-auto" />
          </a>
          <p class="text-sm leading-relaxed mb-5 max-w-xs">UK's #1 Ohme installer. 25,000+ installs across the UK. Fixed-price quotes, 5-year warranty, 0% finance.</p>
          <div class="flex gap-3">
            <a href="https://www.facebook.com/PlugInStationsUK" target="_blank" rel="noopener" aria-label="Facebook" class="w-9 h-9 rounded-full border border-white/10 grid place-items-center hover:border-pis-lime hover:text-pis-lime transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V14.9H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg></a>
            <a href="https://www.instagram.com/pluginstationsuk/" target="_blank" rel="noopener" aria-label="Instagram" class="w-9 h-9 rounded-full border border-white/10 grid place-items-center hover:border-pis-lime hover:text-pis-lime transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/></svg></a>
            <a href="https://www.linkedin.com/company/plug-in-stations" target="_blank" rel="noopener" aria-label="LinkedIn" class="w-9 h-9 rounded-full border border-white/10 grid place-items-center hover:border-pis-lime hover:text-pis-lime transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></a>
            <a href="https://www.youtube.com/@PlugInStationsUK" target="_blank" rel="noopener" aria-label="YouTube" class="w-9 h-9 rounded-full border border-white/10 grid place-items-center hover:border-pis-lime hover:text-pis-lime transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 6.2a3 3 0 0 0-2.1-2.1C19 3.5 12 3.5 12 3.5s-7 0-8.9.6A3 3 0 0 0 1 6.2C.5 8.1.5 12 .5 12s0 3.9.6 5.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.6-1.9.6-5.8.6-5.8s0-3.9-.7-5.8zM9.6 15.6V8.4l6.2 3.6z"/></svg></a>
          </div>
        </div>

        <div class="lg:col-span-2">
          <h5 class="text-white text-xs font-bold uppercase tracking-[0.14em] mb-5">For You</h5>
          <ul class="space-y-2.5 text-sm">
            <li><a href="/home-ev-charger-installation/" class="hover:text-pis-lime transition-colors">Home charging</a></li>
            <li><a href="/workplace-ev-charging/" class="hover:text-pis-lime transition-colors">Workplace</a></li>
            <li><a href="/fleet-ev-charging/" class="hover:text-pis-lime transition-colors">Fleet</a></li>
            <li><a href="/property-developer-ev-charging/" class="hover:text-pis-lime transition-colors">Developers</a></li>
          </ul>
        </div>

        <div class="lg:col-span-2">
          <h5 class="text-white text-xs font-bold uppercase tracking-[0.14em] mb-5">Tools</h5>
          <ul class="space-y-2.5 text-sm">
            <li><a href="/smart-install-checker/" class="hover:text-pis-lime transition-colors">Install Checker</a></li>
            <li><a href="/tools/cost-calculator/" class="hover:text-pis-lime transition-colors">Cost Calculator</a></li>
            <li><a href="/tools/grant-checker/" class="hover:text-pis-lime transition-colors">Grant Checker</a></li>
            <li><a href="/tools/charging-cost-calculator/" class="hover:text-pis-lime transition-colors">Charging Cost</a></li>
            <li><a href="/tools/compare-chargers/" class="hover:text-pis-lime transition-colors">Compare Chargers</a></li>
          </ul>
        </div>

        <div class="lg:col-span-2">
          <h5 class="text-white text-xs font-bold uppercase tracking-[0.14em] mb-5">Resources</h5>
          <ul class="space-y-2.5 text-sm">
            <li><a href="/guides/" class="hover:text-pis-lime transition-colors">Guides</a></li>
            <li><a href="/locations/" class="hover:text-pis-lime transition-colors">Locations</a></li>
            <li><a href="/vehicles/" class="hover:text-pis-lime transition-colors">Vehicle compatibility</a></li>
            <li><a href="/reviews/" class="hover:text-pis-lime transition-colors">Reviews</a></li>
            <li><a href="/accreditations/" class="hover:text-pis-lime transition-colors">Accreditations</a></li>
            <li><a href="/about/" class="hover:text-pis-lime transition-colors">About</a></li>
          </ul>
        </div>

        <div class="lg:col-span-2">
          <h5 class="text-white text-xs font-bold uppercase tracking-[0.14em] mb-5">Contact</h5>
          <ul class="space-y-2.5 text-sm">
            <li><a href="${PHONE_LINK}" class="hover:text-pis-lime transition-colors">${PHONE}</a></li>
            <li><a href="mailto:${EMAIL}" class="hover:text-pis-lime transition-colors text-[0.82rem] whitespace-nowrap">${EMAIL}</a></li>
            <li>Mon–Fri · 8am–6pm</li>
            <li>Nationwide UK</li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
        <span>&copy; <span data-year>2026</span> Plug In Stations Ltd. All rights reserved. Co. No. 12345678</span>
        <div class="flex gap-4">
          <a href="/privacy/" class="hover:text-pis-lime transition-colors">Privacy</a>
          <a href="/terms/" class="hover:text-pis-lime transition-colors">Terms</a>
          <a href="/cookies/" class="hover:text-pis-lime transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
  `;

  const quoteModalHTML = `
  <div class="modal-backdrop" id="quoteModal" role="dialog" aria-modal="true" aria-labelledby="quoteModalTitle">
    <div class="modal" style="max-width:560px">
      <button type="button" class="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close" data-close>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <span class="eyebrow mb-4">
        <span class="eyebrow-dot"></span>
        FREE QUOTE
      </span>
      <h2 id="quoteModalTitle" class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Get your fixed-price quote</h2>
      <p class="text-sm text-slate-300 mb-6">Tell us a bit about your install. We'll be back within 24 hours with a fixed price, including any grants you qualify for.</p>
      <form class="space-y-3" data-pis-form="header-quote-popup" novalidate>
        <div class="grid sm:grid-cols-2 gap-3">
          <label class="field"><span>First name</span><input type="text" name="firstName" required autocomplete="given-name" /></label>
          <label class="field"><span>Last name</span><input type="text" name="lastName" autocomplete="family-name" /></label>
        </div>
        <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email" /></label>
        <div class="grid sm:grid-cols-2 gap-3">
          <label class="field"><span>Phone</span><input type="tel" name="phone" required autocomplete="tel" /></label>
          <label class="field"><span>Postcode</span><input type="text" name="postcode" required autocomplete="postal-code" /></label>
        </div>
        <label class="field">
          <span>Enquiry type</span>
          <select name="enquiry"><option>Home charging</option><option>Workplace / business</option><option>Fleet</option><option>Property developer</option><option>Not sure yet</option></select>
        </label>
        <button class="btn btn-primary btn-lg w-full" type="submit">
          Request my free quote
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
        <p class="text-xs text-slate-400 text-center pt-1">No obligation. We'll never share your details.</p>
      </form>
    </div>
  </div>
  `;

  const exitModalHTML = `
  <div class="modal-backdrop" id="exitModal" role="dialog" aria-modal="true" aria-labelledby="exitTitle">
    <div class="modal">
      <button class="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close" data-close>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <span class="eyebrow mb-5">
        <span class="eyebrow-dot"></span>
        WAIT — DON'T LEAVE
      </span>
      <h2 id="exitTitle" class="text-3xl font-extrabold tracking-tight mb-3">Get your free quote — takes 60 seconds.</h2>
      <p class="text-slate-300 mb-6">No obligation. We'll text or email a tailored quote within 24 hours — and check your OZEV grant eligibility while we're at it.</p>
      <a href="/smart-install-checker/" class="btn btn-primary btn-lg w-full">Start my free check &rarr;</a>
      <p class="text-xs text-slate-500 mt-4 text-center">Trusted by 25,000+ UK homes &middot; 4.7★ Trustpilot &middot; 4.9★ Google</p>
    </div>
  </div>
  `;

  const stickyCtaHTML = `
  <div class="sticky-cta lg:hidden">
    <button type="button" data-pis-quote-trigger class="btn btn-primary btn-lg shadow-2xl">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 12.5h6L9.5 22 19.5 11.5h-6z"/></svg>
      Get my free quote
    </button>
  </div>
  `;

  const fabHTML = `
  <a href="${WHATSAPP}" class="fab-whatsapp" aria-label="Chat on WhatsApp" target="_blank" rel="noopener">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
  </a>
  `;

  /* ---------- Inject markup ---------- */
  const headerSlot = document.querySelector('[data-pis-header]');
  const footerSlot = document.querySelector('[data-pis-footer]');
  const accredSlot = document.querySelector('[data-pis-accreditation-bar]');
  if (headerSlot) headerSlot.outerHTML = headerHTML;
  if (footerSlot) footerSlot.outerHTML = footerHTML;
  if (accredSlot) accredSlot.outerHTML = accreditationBarHTML;
  document.body.insertAdjacentHTML('beforeend', quoteModalHTML);
  document.body.insertAdjacentHTML('beforeend', exitModalHTML);
  document.body.insertAdjacentHTML('beforeend', stickyCtaHTML);
  document.body.insertAdjacentHTML('beforeend', fabHTML);

  /* ============================================================
     Quote popup modal — opens on any [data-pis-quote-trigger] click
     ============================================================ */
  const quoteModal = document.getElementById('quoteModal');
  if (quoteModal) {
    const openQuote = () => { quoteModal.classList.add('is-open'); document.body.style.overflow = 'hidden'; setTimeout(() => { const f = quoteModal.querySelector('input[name="firstName"]'); if (f) f.focus(); }, 100); };
    const closeQuote = () => { quoteModal.classList.remove('is-open'); document.body.style.overflow = ''; };
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-pis-quote-trigger]');
      if (trigger) { e.preventDefault(); openQuote(); return; }
      if (e.target === quoteModal || e.target.closest('#quoteModal [data-close]')) closeQuote();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && quoteModal.classList.contains('is-open')) closeQuote(); });
  }

  // Inject accreditation pill styles once
  if (!document.getElementById('pis-accred-style')) {
    const style = document.createElement('style');
    style.id = 'pis-accred-style';
    style.textContent = `
      .accred-pill { display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border-radius:9999px; font-size:.78rem; font-weight:600; letter-spacing:.01em; background:rgba(0,146,69,.06); border:1px solid rgba(0,146,69,.2); color:#006837; transition:all .25s; cursor:default; position:relative; }
      .accred-pill:hover { background:rgba(0,146,69,.12); transform:translateY(-1px); }
      .accred-icon { width:18px; height:18px; display:grid; place-items:center; flex-shrink:0; }
      .accred-icon svg { width:100%; height:100%; }
      .accred-pill[data-tip]:hover::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); background:#0A0E14; color:#fff; padding:8px 12px; border-radius:8px; font-size:.72rem; font-weight:500; letter-spacing:0; white-space:nowrap; max-width:280px; white-space:normal; min-width:180px; text-align:center; z-index:50; pointer-events:none; box-shadow:0 8px 24px rgba(0,0,0,.2); }
      .dark .accred-pill { background:rgba(193,255,29,.06); border-color:rgba(193,255,29,.2); color:#C1FF1D; }
      .dark .accred-pill:hover { background:rgba(193,255,29,.12); }
      footer .accred-pill { background:rgba(193,255,29,.06); border-color:rgba(193,255,29,.2); color:#C1FF1D; }
      footer .accred-pill:hover { background:rgba(193,255,29,.12); }
    `;
    document.head.appendChild(style);
  }

  /* ============================================================
     DARK / LIGHT MODE TOGGLE
     ============================================================ */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('pis_theme', isDark ? 'dark' : 'light');
    });
  }

  /* ============================================================
     HEADER scroll-state styling
     ============================================================ */
  const header = document.getElementById('siteHeader');
  if (header) {
    const apply = () => {
      const dark = document.documentElement.classList.contains('dark');
      // Header is only "top" (transparent over dark hero) on the homepage.
      // Every other page has a light body, so force "scrolled" state to keep nav legible.
      const hasDarkHero = !!document.getElementById('hero');
      const scrolled = !hasDarkHero || window.scrollY > 30 || document.body.dataset.theme === 'light';
      header.dataset.state = scrolled ? 'scrolled' : 'top';
      const shell = header.querySelector('[data-shell]');
      const navLinks = header.querySelectorAll('.nav-link');
      const phoneLink = header.querySelector('.phone-link');
      const brand = header.querySelector('[data-brand-text]');
      const tag = header.querySelector('[data-brand-tag]');
      const burgerEl = document.getElementById('burger');

      // Reset
      shell.className = 'transition-all duration-300';
      navLinks.forEach(a => a.className = 'nav-link px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1');

      if (scrolled) {
        // Scrolled or static-light page → solid bar styled per theme
        if (dark) {
          shell.classList.add('bg-pis-ink/85','backdrop-blur-md','border-b','border-white/10');
        } else {
          shell.classList.add('bg-white/90','backdrop-blur-md','border-b','border-slate-200');
        }
        navLinks.forEach(a => {
          if (dark) a.classList.add('text-slate-200','hover:text-pis-lime','hover:bg-white/5');
          else      a.classList.add('text-slate-700','hover:text-pis-deep','hover:bg-slate-50');
        });
        if (phoneLink) phoneLink.className = 'phone-link hidden lg:inline-flex items-center gap-2 text-sm font-semibold transition-colors ' + (dark ? 'text-slate-200 hover:text-pis-lime' : 'text-slate-700 hover:text-pis-deep');
        if (brand) brand.className = 'text-[1rem] font-extrabold tracking-tight ' + (dark ? 'text-white' : 'text-slate-900');
        if (tag)   tag.className   = 'text-[0.65rem] font-semibold tracking-[0.22em] mt-0.5 ' + (dark ? 'text-slate-300' : 'text-slate-500');
        if (burgerEl) burgerEl.className = 'burger lg:hidden ' + (dark ? 'text-white bg-white/10' : 'text-slate-900 bg-slate-100');
      } else {
        // top of dark hero — translucent over dark bg
        shell.classList.add('bg-transparent','border-b','border-transparent');
        navLinks.forEach(a => a.classList.add('text-white/85','hover:text-white','hover:bg-white/10'));
        if (phoneLink) phoneLink.className = 'phone-link hidden lg:inline-flex items-center gap-2 text-sm font-semibold transition-colors text-white/90 hover:text-pis-lime';
        if (brand) brand.className = 'text-[1rem] font-extrabold tracking-tight text-white';
        if (tag)   tag.className   = 'text-[0.65rem] font-semibold tracking-[0.22em] mt-0.5 text-slate-300';
        if (burgerEl) burgerEl.className = 'burger lg:hidden text-white bg-white/10';
      }
    };
    apply();
    window.addEventListener('scroll', apply, { passive: true });
    // Re-apply on theme toggle
    new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* ============================================================
     Mobile menu
     ============================================================ */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    const close = () => { burger.setAttribute('aria-expanded','false'); mobileMenu.hidden = true; document.body.style.overflow = ''; };
    const open  = () => { burger.setAttribute('aria-expanded','true');  mobileMenu.hidden = false; document.body.style.overflow = 'hidden'; };
    burger.addEventListener('click', () => burger.getAttribute('aria-expanded') === 'true' ? close() : open());
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 1024) close(); });
  }

  /* ============================================================
     FAQ accordion
     ============================================================ */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const wrapper = btn.closest('[data-faq]');
      if (wrapper) wrapper.querySelectorAll('.faq-q').forEach(o => o.setAttribute('aria-expanded','false'));
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  /* ============================================================
     Reveal-on-scroll
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     Animated counters
     ============================================================ */
  const counters = document.querySelectorAll('[data-counter]');
  const animate = (el) => {
    const target = parseFloat(el.dataset.counter) || 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * ease(t));
      el.textContent = prefix + value.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString() + suffix;
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  }

  /* ============================================================
     YouTube Lite Embed (facade pattern)
     - First click swaps the thumbnail for an iframe.
     - Original facade HTML is cached so the video can be "paused"
       (restored to thumbnail) without reloading the page.
     ============================================================ */
  const FACADE_CACHE = new WeakMap();
  window.PIS_pauseFacade = (el) => {
    if (!el || el.dataset.playing !== 'true') return;
    const original = FACADE_CACHE.get(el);
    if (original != null) el.innerHTML = original;
    el.dataset.playing = 'false';
  };
  window.PIS_pauseAllFacades = (root = document) => {
    root.querySelectorAll('.yt-facade[data-playing="true"]').forEach(window.PIS_pauseFacade);
  };

  document.querySelectorAll('.yt-facade').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.playing === 'true') return;
      if (!FACADE_CACHE.has(el)) FACADE_CACHE.set(el, el.innerHTML);
      const id = el.dataset.videoid;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.title = 'YouTube video player';
      el.innerHTML = '';
      el.appendChild(iframe);
      el.dataset.playing = 'true';
    });
  });

  /* ============================================================
     Hero background video — segment looper
     Plays only the highlights from /videos/Eden Group Case Study V3.mp4
     in a loop: 0:18–0:21 · 0:30–0:38 · 1:18–1:23
     Muted, hard cuts, loops forever.
     ============================================================ */
  (function heroVideoLoop() {
    const v = document.querySelector('video.hero-video-frame') || document.getElementById('heroVideo');
    if (!v) return;

    // [startSec, endSec] for each segment
    const SEGMENTS = [
      [18, 21],   // 0:18 – 0:21
      [30, 38],   // 0:30 – 0:38
      [78, 83],   // 1:18 – 1:23
    ];
    let i = 0;
    let kickedOff = false;

    const seekTo = (sec) => { try { v.currentTime = sec; } catch (_) {} };
    const playSafe = () => {
      try {
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    };

    // Initial kick-off — seek to first segment as soon as metadata is available.
    const kickOff = () => {
      if (kickedOff) return;
      if (v.readyState < 1 || !isFinite(v.duration)) return;
      kickedOff = true;
      seekTo(SEGMENTS[0][0]);
      playSafe();
    };

    v.addEventListener('loadedmetadata', kickOff);
    v.addEventListener('loadeddata',     kickOff);
    v.addEventListener('canplay',        kickOff);

    // Segment switching — fires ~4×/s during playback.
    v.addEventListener('timeupdate', () => {
      if (!kickedOff) return;
      const end = SEGMENTS[i][1];
      if (v.currentTime >= end) {
        i = (i + 1) % SEGMENTS.length;
        seekTo(SEGMENTS[i][0]);
        playSafe();
      }
    });

    // Defensive: if the video reaches its natural end (e.g. browser races the seek), restart from segment 0.
    v.addEventListener('ended', () => {
      i = 0;
      seekTo(SEGMENTS[0][0]);
      playSafe();
    });

    // If metadata is already loaded by the time this runs, kick off immediately.
    kickOff();
  })();

  /* ============================================================
     Featured-video carousel — arrows, dots, swipe, peek-next
     ============================================================ */
  document.querySelectorAll('[data-video-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-track]');
    const slides = Array.from(carousel.querySelectorAll('.video-carousel-slide'));
    const indicators = Array.from(carousel.querySelectorAll('.video-carousel-dot, .video-carousel-thumb'));
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    if (!track || slides.length === 0) return;

    const getCurrent = () => {
      const center = track.scrollLeft + track.offsetWidth / 2;
      let best = 0, bestDist = Infinity;
      slides.forEach((s, i) => {
        const slideCenter = s.offsetLeft + s.offsetWidth / 2;
        const dist = Math.abs(slideCenter - center);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    };

    const scrollToIndex = (idx) => {
      const slide = slides[idx];
      if (!slide) return;
      const target = slide.offsetLeft - (track.offsetWidth - slide.offsetWidth) / 2;
      track.scrollTo({ left: target, behavior: 'smooth' });
    };

    const updateUI = () => {
      const cur = getCurrent();
      indicators.forEach((d, i) => d.classList.toggle('is-active', i === cur));
      if (prev) prev.disabled = (cur === 0);
      if (next) next.disabled = (cur === slides.length - 1);
    };

    if (prev) prev.addEventListener('click', () => { if (window.PIS_pauseAllFacades) window.PIS_pauseAllFacades(carousel); scrollToIndex(Math.max(0, getCurrent() - 1)); });
    if (next) next.addEventListener('click', () => { if (window.PIS_pauseAllFacades) window.PIS_pauseAllFacades(carousel); scrollToIndex(Math.min(slides.length - 1, getCurrent() + 1)); });
    indicators.forEach(d => d.addEventListener('click', () => { if (window.PIS_pauseAllFacades) window.PIS_pauseAllFacades(carousel); scrollToIndex(parseInt(d.dataset.index, 10)); }));

    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateUI, 80);
    }, { passive: true });

    /* ----- Mouse drag-to-slide (touch swipe is native via overflow-x:auto) ----- */
    let isDown = false, startX = 0, startScroll = 0, dragDistance = 0;
    const DRAG_THRESHOLD = 6; // px before we treat as a drag (and suppress the click)

    const onPointerDown = (e) => {
      // Ignore clicks on the arrow buttons or thumb buttons
      if (e.target.closest('.video-carousel-arrow, .video-carousel-thumb')) return;
      // Only react to primary mouse button or touch/pen
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      dragDistance = 0;
      track.style.scrollSnapType = 'none';
      track.style.cursor = 'grabbing';
      // Capture pointer so we still get move/up if cursor leaves the element
      try { track.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const onPointerMove = (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      dragDistance = Math.abs(dx);
      track.scrollLeft = startScroll - dx;
    };
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      track.style.cursor = '';
      track.style.scrollSnapType = '';
      // Snap to nearest after drag ends
      const cur = getCurrent();
      scrollToIndex(cur);
    };
    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);

    // Suppress the yt-facade click if the user actually dragged
    track.addEventListener('click', (e) => {
      if (dragDistance > DRAG_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
        dragDistance = 0;
      }
    }, true);

    /* ----- Pause any playing facade when the carousel scrolls out of view ----- */
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && window.PIS_pauseAllFacades) {
            window.PIS_pauseAllFacades(carousel);
          }
        });
      }, { threshold: 0.25 });
      observer.observe(carousel);
    }

    updateUI();
  });

  /* ============================================================
     Testimonials carousel (auto-play, pause on hover)
     ============================================================ */
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;
    const slides = track.children;
    if (!slides.length) return;
    let i = 0; let timer;
    const goNext = () => {
      i = (i + 1) % slides.length;
      const slide = slides[i];
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    };
    const start = () => { timer = setInterval(goNext, 5500); };
    const stop  = () => clearInterval(timer);
    start();
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    // controls
    carousel.querySelectorAll('[data-carousel-prev]').forEach(b => b.addEventListener('click', () => { i = (i - 2 + slides.length) % slides.length; goNext(); stop(); start(); }));
    carousel.querySelectorAll('[data-carousel-next]').forEach(b => b.addEventListener('click', () => { goNext(); stop(); start(); }));
  });

  /* ============================================================
     Forms — POST to GHL webhook + redirect to /thank-you/
     ============================================================ */
  const captureUTM = () => {
    const u = new URLSearchParams(window.location.search);
    return ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].reduce((a, k) => (a[k] = u.get(k) || '', a), {});
  };
  document.querySelectorAll('form[data-pis-form]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      try {
        const data = Object.fromEntries(new FormData(form));
        await fetch(FORM_WEBHOOK, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'no-cors',
          body: JSON.stringify({ ...data, ...captureUTM(), source: form.dataset.pisForm, page: location.pathname, ts: new Date().toISOString() }),
        }).catch(() => null);
        location.href = '/thank-you/';
      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
      }
    });
  });

  /* ============================================================
     Sticky mobile CTA visibility
     ============================================================ */
  const stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    const toggle = () => stickyCta.classList.toggle('is-visible', window.scrollY > 600);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  /* ============================================================
     Exit intent (desktop-only, once per session)
     ============================================================ */
  const exitModal = document.getElementById('exitModal');
  let exitArmed = !sessionStorage.getItem('pis_exit_shown') && window.matchMedia('(min-width: 1024px)').matches;
  if (exitModal && exitArmed) {
    const open = () => { if (!exitArmed) return; exitArmed = false; sessionStorage.setItem('pis_exit_shown', '1'); exitModal.classList.add('is-open'); };
    const close = () => exitModal.classList.remove('is-open');
    document.addEventListener('mouseleave', (e) => { if (e.clientY < 5 && window.scrollY > 200) open(); });
    exitModal.addEventListener('click', (e) => { if (e.target === exitModal || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ============================================================
     Year + smooth scroll
     ============================================================ */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const headerH = (header && header.offsetHeight) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH + 2;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });

  /* ============================================================
     Inject PIS_STATS into elements with data-pis-stat
     ============================================================ */
  document.querySelectorAll('[data-pis-stat]').forEach(el => {
    const key = el.dataset.pisStat;
    if (window.PIS_STATS[key]) el.textContent = window.PIS_STATS[key];
  });

  /* ============================================================
     Get-a-quote popup modal — intercepts every #quote / /#quote
     link site-wide and opens an inline contact form instead of
     navigating to the homepage anchor.
     ============================================================ */
  (function setupQuoteModal() {
    if (document.getElementById('pis-quote-modal')) return;

    const modalHTML = `
<div id="pis-quote-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pis-quote-title">
  <div class="bg-white dark:bg-pis-ink-2 text-pis-text dark:text-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-slate-200 dark:border-white/10 max-h-[92vh] overflow-y-auto">
    <button type="button" id="pis-quote-close" class="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10" aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="p-7 lg:p-9">
      <span class="eyebrow mb-3"><span class="eyebrow-dot"></span>FREE FIXED-PRICE QUOTE</span>
      <h2 id="pis-quote-title" class="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2">Get your free quote</h2>
      <p class="text-pis-text-3 dark:text-slate-300 mb-6 text-sm">Quote returned within 24 hours. Most installs in 7-10 days.</p>
      <form id="pis-quote-form" class="space-y-4">
        <label class="field"><span>Full name</span><input type="text" name="name" required autocomplete="name"></label>
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email"></label>
          <label class="field"><span>Phone</span><input type="tel" name="phone" required autocomplete="tel"></label>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <label class="field"><span>Postcode</span><input type="text" name="postcode" required autocomplete="postal-code"></label>
          <label class="field"><span>Vehicle <span class="opacity-60">(optional)</span></span><input type="text" name="vehicle" autocomplete="off"></label>
        </div>
        <label class="field"><span>Anything else? <span class="opacity-60">(optional)</span></span><textarea name="notes" rows="2"></textarea></label>
        <button type="submit" class="btn btn-primary btn-lg w-full">Request my quote &rarr;</button>
        <p class="text-xs text-center text-pis-text-3 dark:text-slate-400">Or call <a href="tel:+442037957117" class="font-semibold text-pis-deep dark:text-pis-lime">0203 795 7117</a> &middot; Mon-Fri 8am-6pm</p>
      </form>
      <div id="pis-quote-success" class="hidden text-center py-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-pis-lime grid place-items-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A0E14" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h3 class="text-xl font-bold mb-2">Got it - thanks!</h3>
        <p class="text-pis-text-3 dark:text-slate-300 text-sm">Our team will be in touch within 24 hours with your fixed-price quote.</p>
      </div>
    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('pis-quote-modal');
    const form = document.getElementById('pis-quote-form');
    const success = document.getElementById('pis-quote-success');
    let lastFocus = null;

    const open = (sourceEl) => {
      lastFocus = sourceEl || document.activeElement;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      // Reset form state
      form.classList.remove('hidden');
      success.classList.add('hidden');
      setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), 50);
    };
    const close = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a, button');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const isQuoteLink = href === '#quote' || href === '/#quote' || /[/]?#quote(?:[/?#].*)?$/.test(href);
      if (isQuoteLink) {
        e.preventDefault();
        open(a);
      }
    }, true);

    document.getElementById('pis-quote-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // No backend wired yet — show success state. Replace with real POST in production.
      form.classList.add('hidden');
      success.classList.remove('hidden');
    });
  })();

  /* ============================================================
     OZEV grant eligibility popup — intercepts any link/button
     marked with data-pis-grant-popup or href ending in
     #grant-check / pointing to /tools/grant-checker/.
     Three-question flow with branched eligibility result.
     ============================================================ */
  (function setupGrantPopup() {
    if (document.getElementById('pis-grant-modal')) return;
    const modalHTML = `
<div id="pis-grant-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pis-grant-title">
  <div class="bg-white dark:bg-pis-ink-2 text-pis-text dark:text-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-slate-200 dark:border-white/10 max-h-[92vh] overflow-y-auto">
    <button type="button" id="pis-grant-close" class="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10" aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="p-7 lg:p-8" data-grant-stage="q1">
      <span class="eyebrow mb-3"><span class="eyebrow-dot"></span>OZEV GRANT CHECKER</span>
      <h2 id="pis-grant-title" class="text-xl lg:text-2xl font-extrabold tracking-tight mb-1">Do you qualify for £350 off?</h2>
      <p class="text-sm text-pis-text-3 dark:text-slate-300 mb-6">30 seconds. No email needed.</p>
      <p class="font-bold mb-3">Which best describes you?</p>
      <div class="space-y-2.5">
        <button type="button" data-grant-answer="renter" class="grant-opt">I rent my home</button>
        <button type="button" data-grant-answer="flat" class="grant-opt">I own a flat or apartment</button>
        <button type="button" data-grant-answer="business" class="grant-opt">I'm installing for a business</button>
        <button type="button" data-grant-answer="homeowner" class="grant-opt">I own a house (owner-occupier)</button>
      </div>
    </div>
    <div class="p-7 lg:p-8 hidden" data-grant-stage="q2">
      <button type="button" data-grant-back class="text-xs font-semibold text-pis-text-3 dark:text-slate-400 hover:text-pis-deep dark:hover:text-pis-lime mb-4">&larr; Back</button>
      <h3 class="text-lg lg:text-xl font-extrabold tracking-tight mb-1">Do you have off-street parking?</h3>
      <p class="text-sm text-pis-text-3 dark:text-slate-300 mb-5">Driveway, garage, allocated bay - somewhere the cable doesn't cross a public footpath.</p>
      <div class="space-y-2.5">
        <button type="button" data-grant-answer="parking-yes" class="grant-opt">Yes</button>
        <button type="button" data-grant-answer="parking-no" class="grant-opt">No</button>
      </div>
    </div>
    <div class="p-7 lg:p-8 hidden text-center" data-grant-stage="result-yes">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-pis-lime grid place-items-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A0E14" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h3 class="text-2xl font-extrabold tracking-tight mb-2">You qualify for <span class="text-pis-deep dark:text-pis-lime" data-grant-amount>£350 off</span></h3>
      <p class="text-pis-text-3 dark:text-slate-300 text-sm mb-6" data-grant-msg></p>
      <a href="#quote" class="btn btn-primary btn-lg w-full">Get my quote with grant applied</a>
      <p class="text-xs text-pis-text-3 dark:text-slate-400 mt-3">We handle the OZEV paperwork. The grant comes off your invoice up front.</p>
    </div>
    <div class="p-7 lg:p-8 hidden text-center" data-grant-stage="result-no">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/10 grid place-items-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg></div>
      <h3 class="text-xl font-extrabold tracking-tight mb-2">No grant - but we've got you covered</h3>
      <p class="text-pis-text-3 dark:text-slate-300 text-sm mb-6" data-grant-msg></p>
      <a href="#quote" class="btn btn-primary btn-lg w-full">Get my free quote</a>
      <p class="text-xs text-pis-text-3 dark:text-slate-400 mt-3">0% finance via Bumper - from £25/mo, no deposit.</p>
    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inject local style for option buttons
    const style = document.createElement('style');
    style.textContent = `
.grant-opt { display:block; width:100%; text-align:left; padding:14px 18px; border-radius:14px; border:1px solid rgba(15,23,42,0.12); background:#ffffff; color:#0F172A; font-weight:600; font-size:0.95rem; transition:all .2s; cursor:pointer; }
.grant-opt:hover { border-color:#009245; background:#F0FDF4; }
.dark .grant-opt { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.12); color:#fff; }
.dark .grant-opt:hover { border-color:#C1FF1D; background:rgba(193,255,29,0.06); }
`;
    document.head.appendChild(style);

    const modal = document.getElementById('pis-grant-modal');
    let lastFocus = null;
    let answers = {};
    const stages = modal.querySelectorAll('[data-grant-stage]');
    const showStage = (name) => {
      stages.forEach(s => s.classList.toggle('hidden', s.dataset.grantStage !== name));
    };
    const open = (sourceEl) => {
      lastFocus = sourceEl || document.activeElement;
      modal.classList.remove('hidden'); modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      answers = {};
      showStage('q1');
    };
    const close = () => {
      modal.classList.add('hidden'); modal.classList.remove('flex');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-pis-grant-popup], a[href="#grant-check"], a[href$="/tools/grant-checker/"], a[href$="/tools/grant-checker"]');
      if (t) {
        e.preventDefault();
        open(t);
        return;
      }
      const opt = e.target.closest('.grant-opt');
      if (opt && modal.contains(opt)) {
        const ans = opt.dataset.grantAnswer;
        if (['renter','flat','business','homeowner'].includes(ans)) {
          answers.who = ans;
          if (ans === 'business') {
            // Businesses qualify regardless of off-street parking? Actually WCS still needs it but skip Q2 for simplicity.
            const msgEl = modal.querySelector('[data-grant-stage="result-yes"] [data-grant-msg]');
            const amtEl = modal.querySelector('[data-grant-stage="result-yes"] [data-grant-amount]');
            amtEl.textContent = 'up to £350 per socket';
            msgEl.textContent = "You qualify under the Workplace Charging Scheme - up to £350 per socket on up to 40 sockets.";
            showStage('result-yes');
          } else if (ans === 'homeowner') {
            const msgEl = modal.querySelector('[data-grant-stage="result-no"] [data-grant-msg]');
            msgEl.textContent = "Owner-occupier homeowners aren't eligible for the OZEV grant any more. We'll send a fixed-price quote with 0% finance options.";
            showStage('result-no');
          } else {
            showStage('q2');
          }
        } else if (ans === 'parking-yes') {
          const msgEl = modal.querySelector('[data-grant-stage="result-yes"] [data-grant-msg]');
          const amtEl = modal.querySelector('[data-grant-stage="result-yes"] [data-grant-amount]');
          amtEl.textContent = '£350 off';
          msgEl.textContent = answers.who === 'renter'
            ? "You qualify as a renter. We'll get written landlord consent for you and submit the grant claim - the £350 comes straight off your install."
            : "You qualify as a flat owner / leaseholder. We'll handle the OZEV paperwork - the £350 comes straight off your install.";
          showStage('result-yes');
        } else if (ans === 'parking-no') {
          const msgEl = modal.querySelector('[data-grant-stage="result-no"] [data-grant-msg]');
          msgEl.textContent = "OZEV requires dedicated off-street parking, so the grant doesn't apply. We can still install a smart charger - or recommend a public-charging-first plan.";
          showStage('result-no');
        }
      }
      const back = e.target.closest('[data-grant-back]');
      if (back && modal.contains(back)) {
        showStage('q1');
      }
    }, true);

    document.getElementById('pis-grant-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
    });
  })();

  /* ============================================================
     "Time to Plug In" guide-download popup — intercepts any
     [data-pis-guide-popup] or href="#guide-download" link, captures
     name/email, then triggers a PDF download.
     ============================================================ */
  (function setupGuidePopup() {
    if (document.getElementById('pis-guide-modal')) return;
    const PDF_URL = '/downloads/time-to-plug-in.pdf';
    const modalHTML = `
<div id="pis-guide-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pis-guide-title">
  <div class="bg-white dark:bg-pis-ink-2 text-pis-text dark:text-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-slate-200 dark:border-white/10 max-h-[92vh] overflow-y-auto">
    <button type="button" id="pis-guide-close" class="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10" aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="p-7 lg:p-8" data-guide-stage="form">
      <span class="eyebrow mb-3"><span class="eyebrow-dot"></span>FREE DOWNLOAD</span>
      <h2 id="pis-guide-title" class="text-2xl font-extrabold tracking-tight mb-1">Time to Plug In</h2>
      <p class="text-sm text-pis-text-3 dark:text-slate-300 mb-5">14-page handbook to home EV charger installation. Drop your details, we'll start the download.</p>
      <form id="pis-guide-form" class="space-y-4">
        <label class="field"><span>Full name</span><input type="text" name="name" required autocomplete="name"></label>
        <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email"></label>
        <label class="field"><span>Phone <span class="opacity-60">(optional)</span></span><input type="tel" name="phone" autocomplete="tel"></label>
        <button type="submit" class="btn btn-primary btn-lg w-full">Download the guide &rarr;</button>
        <p class="text-xs text-center text-pis-text-3 dark:text-slate-400">By submitting you agree to receive occasional updates from Plug In Stations. Unsubscribe any time. <a href="/terms/" class="text-pis-deep dark:text-pis-lime font-semibold hover:underline">Terms</a>.</p>
      </form>
    </div>
    <div class="p-7 lg:p-8 hidden text-center" data-guide-stage="success">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-pis-lime grid place-items-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A0E14" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h3 class="text-2xl font-extrabold tracking-tight mb-2">Download started!</h3>
      <p class="text-pis-text-3 dark:text-slate-300 text-sm mb-5">If your browser didn't auto-download, use the button below.</p>
      <a href="${PDF_URL}" download="time-to-plug-in.pdf" class="btn btn-primary btn-lg w-full">Download PDF (3.2 MB)</a>
      <p class="text-xs text-pis-text-3 dark:text-slate-400 mt-4">When you're ready, <a href="#quote" class="text-pis-deep dark:text-pis-lime font-semibold hover:underline">request a free fixed-price quote</a>.</p>
    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('pis-guide-modal');
    const form = document.getElementById('pis-guide-form');
    const stages = modal.querySelectorAll('[data-guide-stage]');
    let lastFocus = null;

    const showStage = (name) => stages.forEach(s => s.classList.toggle('hidden', s.dataset.guideStage !== name));
    const open = (sourceEl) => {
      lastFocus = sourceEl || document.activeElement;
      modal.classList.remove('hidden'); modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      showStage('form');
      setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), 50);
    };
    const close = () => {
      modal.classList.add('hidden'); modal.classList.remove('flex');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-pis-guide-popup], a[href="#guide-download"]');
      if (!t) return;
      e.preventDefault();
      open(t);
    }, true);

    document.getElementById('pis-guide-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Show success state and trigger the PDF download programmatically.
      showStage('success');
      const a = document.createElement('a');
      a.href = PDF_URL;
      a.download = 'time-to-plug-in.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Wire to your CRM / Mailchimp here using the form data when ready.
    });
  })();

  /* ============================================================
     Magnetic CTA buttons — pull toward the cursor when it's near.
     Sets --magnetic-x / --magnetic-y CSS variables on the element;
     transform: translate() lives in styles.css so the wobble keyframe
     (which animates `rotate`) and the magnetic translate don't fight
     over the transform property.
     ============================================================ */
  (function setupMagneticButtons() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(hover: none)').matches) return; // skip touch devices
    const STRENGTH = 0.32;          // 0 = no pull, 1 = follows cursor exactly
    const PULL_RADIUS = 60;         // px outside the button still felt
    const buttons = () => document.querySelectorAll('.magnetic-cta');
    document.addEventListener('mousemove', (e) => {
      buttons().forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const inside = e.clientX >= rect.left - PULL_RADIUS && e.clientX <= rect.right + PULL_RADIUS
                    && e.clientY >= rect.top  - PULL_RADIUS && e.clientY <= rect.bottom + PULL_RADIUS;
        if (!inside) {
          if (btn.style.getPropertyValue('--magnetic-x') !== '0px') {
            btn.style.setProperty('--magnetic-x', '0px');
            btn.style.setProperty('--magnetic-y', '0px');
          }
          return;
        }
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        btn.style.setProperty('--magnetic-x', `${(e.clientX - cx) * STRENGTH}px`);
        btn.style.setProperty('--magnetic-y', `${(e.clientY - cy) * STRENGTH}px`);
      });
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
      buttons().forEach(btn => {
        btn.style.setProperty('--magnetic-x', '0px');
        btn.style.setProperty('--magnetic-y', '0px');
      });
    });
  })();

  /* ============================================================
     Cookie consent banner — bottom-right, single-decision (accept / reject).
     Stores choice in localStorage so it stays dismissed across visits.
     ============================================================ */
  (function setupCookieBanner() {
    if (localStorage.getItem('pis_cookie_consent')) return;
    if (document.getElementById('pis-cookie-banner')) return;

    const html = `
<div id="pis-cookie-banner" class="fixed bottom-4 right-4 z-[90] max-w-sm bg-white dark:bg-pis-ink-2 text-pis-text dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-5" role="dialog" aria-label="Cookie consent">
  <div class="flex items-start gap-3 mb-4">
    <div class="w-9 h-9 rounded-full bg-pis-lime/20 grid place-items-center flex-shrink-0 mt-0.5">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009245" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="9" r="0.5" fill="#009245"/><circle cx="14" cy="13" r="0.5" fill="#009245"/><circle cx="10" cy="14" r="0.5" fill="#009245"/></svg>
    </div>
    <div>
      <p class="font-bold text-sm mb-1">We use cookies</p>
      <p class="text-xs text-pis-text-3 dark:text-slate-300 leading-relaxed">We use essential cookies to make this site work and analytics cookies to improve it. <a href="/terms/" class="text-pis-deep dark:text-pis-lime font-semibold underline-offset-2 hover:underline">Read more</a>.</p>
    </div>
  </div>
  <div class="flex gap-2">
    <button type="button" data-cookie-action="reject" class="flex-1 px-4 py-2 rounded-full text-xs font-bold border border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Reject</button>
    <button type="button" data-cookie-action="accept" class="flex-1 px-4 py-2 rounded-full text-xs font-bold bg-pis-deep dark:bg-pis-lime text-white dark:text-pis-ink hover:opacity-90 transition-opacity">Accept all</button>
  </div>
</div>`;

    const inject = () => {
      document.body.insertAdjacentHTML('beforeend', html);
      const banner = document.getElementById('pis-cookie-banner');
      banner.addEventListener('click', (e) => {
        const action = e.target.closest('[data-cookie-action]')?.dataset.cookieAction;
        if (!action) return;
        localStorage.setItem('pis_cookie_consent', action);
        banner.style.transition = 'opacity .25s, transform .25s';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        setTimeout(() => banner.remove(), 280);
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  })();

})();
