// For each brand hub (vehicles/<brand>/index.html), verify it has a card+image for every model in vehicles/<brand>/<model>/.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'vehicles');
const issues = [];

for (const b of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!b.isDirectory()) continue;
  const hub = path.join(ROOT, b.name, 'index.html');
  if (!fs.existsSync(hub)) continue;
  const hubSrc = fs.readFileSync(hub, 'utf8');
  const models = fs.readdirSync(path.join(ROOT, b.name), { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
  for (const m of models) {
    const linkRe = new RegExp(`href="/vehicles/${b.name}/${m}/"`);
    if (!linkRe.test(hubSrc)) issues.push({ brand: b.name, model: m, problem: 'no link from hub' });
    else {
      // ensure a corresponding image src reference for that model exists in the hub
      const imgRe = new RegExp(`/vehicle_images/${b.name}/${m}\\.(jpe?g|png|webp)`, 'i');
      if (!imgRe.test(hubSrc)) issues.push({ brand: b.name, model: m, problem: 'linked but no <img> on hub' });
    }
  }
}

console.log(`Brand hub issues: ${issues.length}`);
issues.slice(0, 50).forEach(i => console.log(`  [${i.problem}] ${i.brand}/${i.model}`));
