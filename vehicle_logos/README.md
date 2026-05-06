# Vehicle Logos

Drop brand logo images here for the Find-Your-EV grid (homepage) and the `/vehicles/` hub.

## Why these aren't auto-downloaded

I (Claude) can't scrape Smart Home Charge or any other site's images directly — no fetch-image tool, and re-using their licensed assets would be a copyright issue for you. Sources for proper logos:

- **Each manufacturer's UK press portal** (Audi, BMW, VW etc. — search "[brand] press kit UK")
- **Wikipedia File: pages** — many car brand logos are public domain or fair-use SVGs
- **[Brandfetch.com](https://brandfetch.com)** — free brand search, downloads available
- **[Worldvectorlogo.com](https://worldvectorlogo.com)** — free SVG car brand logos with attribution
- **[Vector.me](https://vector.me)** / **[seeklogo.com](https://seeklogo.com)** — free SVG library

## Format

- **SVG preferred** (perfect scaling, tiny files)
- PNG with transparent background also fine (~400×400 minimum)
- Square / near-square works best in the grid

## File naming

Save each as the brand slug (lowercase, hyphenated). Site looks up `/vehicle_logos/[brand-slug].svg` first, then `.png`, then falls back to a brand-letter avatar.

```
abarth.svg
alfa-romeo.svg
alpine.svg
audi.svg
bentley.svg
bmw.svg
byd.svg
chery.svg
chevrolet.svg
citroen.svg
cupra.svg
dacia.svg
ds.svg
fiat.svg
fisker.svg
ford.svg
geely.svg
genesis.svg
gwm.svg
honda.svg
hyundai.svg
jaecoo.svg
jaguar.svg
jeep.svg
kgm.svg
kia.svg
land-rover.svg
leapmotor.svg
levc.svg
lexus.svg
lotus.svg
lucid-motors.svg
maserati.svg
maxus.svg
mazda.svg
mercedes-benz.svg
mg.svg
mini.svg
mitsubishi.svg
nissan.svg
omoda.svg
peugeot.svg
polestar.svg
porsche.svg
renault.svg
rivian.svg
rolls-royce.svg
seat.svg
skoda.svg
skywell.svg
smart.svg
ssangyong.svg
subaru.svg
suzuki.svg
tesla.svg
toyota.svg
vauxhall.svg
volkswagen.svg
volvo.svg
xpeng.svg
zero-motorcycles.svg
```

## Fallback

If a logo file is missing, the site renders the brand initial(s) on a green badge — no broken image icons. The site looks great before any logos are dropped in; gets even better once they are.
