// Build a square SVG favicon that wraps the PNG icon without distortion.
// Centers the 720x1091 portrait icon inside a 1091x1091 transparent square.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'brand_assets', 'plugin stations icon.png');
const OUT = path.join(__dirname, 'brand_assets', 'favicon.svg');

const png = fs.readFileSync(SRC);
const b64 = png.toString('base64');

const W = 720, H = 1091;
const SIZE = Math.max(W, H);
const x = (SIZE - W) / 2;
const y = (SIZE - H) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <image href="data:image/png;base64,${b64}" x="${x}" y="${y}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;

fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length/1024).toFixed(1)} KB)`);
