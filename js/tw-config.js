/* Shared Tailwind config — loaded after the Tailwind CDN script on every page.
   Edit here once and every page picks it up. */
window.tailwind = window.tailwind || {};
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pis-lime':    '#C1FF1D',  // primary CTA — electric green from brand_assets
        'pis-green':   '#39B54A',  // classic green
        'pis-deep':    '#009245',  // fern green
        'pis-dark':    '#006837',  // abundant green
        'pis-jasmine': '#78D23D',  // jasmine green (lightning-bolt accent)
        'pis-ink':     '#0A0E14',  // dark navy bg
        'pis-ink-2':   '#111827',  // surface on dark
        'pis-ink-3':   '#1F2937',  // raised surface on dark
        'pis-line':    '#1F2937',  // border on dark
        'pis-mute':    '#94A3B8',  // muted text on dark
        'pis-text':    '#0F172A',  // primary text on light
        'pis-text-2':  '#334155',  // secondary text on light
        'pis-text-3':  '#64748B',  // tertiary text on light
        'pis-light':   '#F8FAFC',  // surface on light
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Calibri', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    }
  }
};
