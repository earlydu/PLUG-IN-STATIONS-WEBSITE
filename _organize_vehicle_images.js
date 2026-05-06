// Move loose vehicle images from /vehicles/*.{jpg,png,jpeg,webp}
// into /vehicle_images/{brand-slug}/{model-slug}.jpg
//
// Manually-built mapping below pairs each source filename with the brand+model
// folder structure that the model pages already reference.
// All targets normalised to .jpg (PNG bytes are still served correctly by every
// modern browser via content-type sniffing — server sends image/jpeg header).
//
// Source files are removed after successful copy.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SOURCE_DIR = path.join(ROOT, 'vehicles');
const TARGET_BASE = path.join(ROOT, 'vehicle_images');

const MAP = {
  // Porsche
  '1-Porsche-Taycan-2024-UK-review.jpg':                                                                      'porsche/taycan.jpg',
  '2017-Porsche-Cayenne-S-E-Hybrid-front-angle.jpg':                                                          'porsche/cayenne-e-hybrid.jpg',
  '2024_Porsche_Cayenne_E-Hybrid_first_drive__Huge_tech_upgrade,_same_class-leading_drive___T3.png':          'porsche/cayenne-e-hybrid.jpg',
  'Cayenne Turbo E Hybrid.jpg':                                                                               'porsche/cayenne-turbo-e-hybrid.jpg',
  'Macan EV.jpg':                                                                                             'porsche/macan-ev.jpg',
  'Panamera 4 PHEV.jpg':                                                                                      'porsche/panamera-4-phev.jpg',
  'Taycan Cross Turismo.jpg':                                                                                 'porsche/taycan-cross-turismo.jpg',
  'Taycan Sport Turismo.jpg':                                                                                 'porsche/taycan-sport-turismo.jpg',

  // Peugeot
  '092-peugeot-e3008-front.jpg':                                                                              'peugeot/e-3008.jpg',
  '2024_Peugeot_3008_Review__GT_Sport_Petrol_&_PHEV_-_ForceGT.com.png':                                       'peugeot/3008-phev.jpg',
  'Peugeot 3008.jpg':                                                                                         'peugeot/3008-phev.jpg',
  'Peugeot E 2008.jpg':                                                                                       'peugeot/e-2008.jpg',
  'ZxKBHIF3NbkBXuRT_2024PeugeotE-5008frontquarterdriving.jpg':                                                'peugeot/e-5008.jpg',
  'f8fe3979-1960-4d3a-8445-9a59e33b2bcb_peugeot-e-308-front-3_3A4-moving.jpg':                                'peugeot/e-308.jpg',
  'peugeot-e-208-2023-093.jpg':                                                                               'peugeot/e-208.jpg',
  'peugeot_308_059.jpg':                                                                                      'peugeot/308-phev.jpg',

  // Volvo
  '2018-Volvo-XC60.12806.jpg':                                                                                'volvo/xc60-phev.jpg',
  '2023_Volvo_C40_Recharge_Review__Base_Hit___Capital_One_Auto_Navigator.png':                                'volvo/c40-recharge.jpg',
  '2025-volvo-xc90-front-quarter.jpg':                                                                        'volvo/xc90-phev.jpg',
  '324524_Volvo_EX30_Twin_Motor_Performance_Ultra.jpg':                                                       'volvo/ex30.jpg',
  'EX9.jpg':                                                                                                  'volvo/ex90.jpg',
  'Volvo_20EX40-28.jpg':                                                                                      'volvo/ex40.jpg',
  'XC40 Recharge.jpg':                                                                                        'volvo/xc40-recharge.jpg',
  'volvo-c40-recharge-2022-01-exterior-front-angle-scaled.jpg':                                               'volvo/c40-recharge.jpg',
  'volvo-s60-front-angle-low-view-932680.jpg':                                                                'volvo/s60-phev.jpg',

  // Vauxhall
  'Astra Electric .jpg':                                                                                      'vauxhall/astra-electric.jpg',
  "I_drove_the_Vauxhall_Astra_Electric_-_it's_not_class-leading_in_any_particular_area_but_it_does_everything_really_well.png": 'vauxhall/astra-electric.jpg',
  'Combo Electric .jpg':                                                                                      'vauxhall/combo-electric.jpg',
  'Corsa Electric .jpg':                                                                                      'vauxhall/corsa-electric.jpg',
  'Grandland Electric.jpg':                                                                                   'vauxhall/grandland-electric.jpg',
  'Vauxhall_Frontera_Electric_suburban_017.jpg':                                                              'vauxhall/frontera-electric.jpg',
  'Vauxhall_Mokka_2021_100_lead.jpg.jpg':                                                                     'vauxhall/mokka-electric.jpg',

  // Volkswagen
  'ID BUZZ.jpg':                                                                                              'volkswagen/id-buzz.jpg',
  'ID3.jpg':                                                                                                  'volkswagen/id-3.jpg',
  'ID4.jpg':                                                                                                  'volkswagen/id-4.jpg',
  'ID5.jpg':                                                                                                  'volkswagen/id-5.jpg',
  'ID7.jpg':                                                                                                  'volkswagen/id-7.jpg',
  'VW_ID7_Tourer_3.jpg':                                                                                      'volkswagen/id-7-tourer.jpg',

  // Tesla
  'Model 3 Long Range.jpg':                                                                                   'tesla/model-3-long-range.jpg',
  'Model S Long Range.jpg':                                                                                   'tesla/model-s-long-range.jpg',
  'Model X Long Range.jpg':                                                                                   'tesla/model-x-long-range.jpg',
  'Model Y Long Range.jpg':                                                                                   'tesla/model-y-long-range.jpg',

  // Skoda
  'Elroq.jpg':                                                                                                'skoda/elroq.jpg',
  'Enyaq Coupe iV.jpg':                                                                                       'skoda/enyaq-coupe-iv.jpg',
  'Enyaq iV.jpg':                                                                                             'skoda/enyaq-iv.jpg',
  'Kodiaq iV PHEV.jpg':                                                                                       'skoda/kodiaq-iv-phev.jpg',
  'Octavia iV PHEV.jpg':                                                                                      'skoda/octavia-iv-phev.jpg',
  'Superb iV PHEV.jpg':                                                                                       'skoda/superb-iv-phev.jpg',

  // Renault
  'Captur E Tech PHEV.jpg':                                                                                   'renault/captur-e-tech-phev.jpg',
  'Renault_Captur_E-Tech___Test_Drive___Auto_Class_Magazine.png':                                             'renault/captur-e-tech-phev.jpg',
  'Megane E Tech EV.jpg':                                                                                     'renault/megane-e-tech-ev.jpg',
  'R4 EV.jpg':                                                                                                'renault/r4-ev.jpg',
  'R5 EV.jpg':                                                                                                'renault/r5-ev.jpg',
  'Scenic E Tech EV.jpg':                                                                                     'renault/scenic-e-tech-ev.jpg',
  'Zoe.jpg':                                                                                                  'renault/zoe.jpg',

  // Toyota
  'C-HR PHEV.jpg':                                                                                            'toyota/c-hr-phev.jpg',
  'Proace City Electric.jpg':                                                                                 'toyota/proace-city-electric.jpg',
  'toyota-bz4x-front-angle-low-view-327698.jpg':                                                              'toyota/bz4x.jpg',
  'toyota-prius-2023-01-exterior-front-angle-scaled.jpg':                                                     'toyota/prius-phev.jpg',
  'toyota-rav4-plug-in-hybrid-xse-2025-01-exterior-front-angle-scaled.jpg':                                   'toyota/rav4-phev.jpg',

  // Smart
  'EQ ForTwo.jpg':                                                                                            'smart/eq-fortwo.jpg',
  'Smart 1.jpg':                                                                                              'smart/1.jpg',
  'Smart 3.jpg':                                                                                              'smart/3.jpg',

  // Polestar
  'Polestar 2.jpg':                                                                                           'polestar/polestar-2.jpg',
  'Polestar 3.jpg':                                                                                           'polestar/polestar-3.jpg',
  'Polestar 4.jpg':                                                                                           'polestar/polestar-4.jpg',

  // Rivian
  'R1S.jpg':                                                                                                  'rivian/r1s.jpg',
  'R1T.jpg':                                                                                                  'rivian/r1t.jpg',
  'Review__2023_Rivian_R1S_hits_Rocky_Mountain_highs.png':                                                    'rivian/r1s.jpg',

  // Subaru
  'subaru-solterra-front-driving.jpg':                                                                        'subaru/solterra.jpg',
  'SUBARU_STANDS_FIRM_ON_ALL-NEW_2026_SUBARU_SOLTERRA_PRICING,_STARTING_AT_$38,495_MSRP,_AND_INTRODUCES_MORE_POWERFUL_SOLTERRA_XT_MODEL.png': 'subaru/solterra.jpg',

  // Suzuki
  'Across PHEV.jpg':                                                                                          'suzuki/across-phev.jpg',
  'e-Vitara.jpg':                                                                                             'suzuki/e-vitara.jpg',

  // Seat
  'Leon E Hybrid PHEV.jpg':                                                                                   'seat/leon-e-hybrid-phev.jpg',
  'new-seat-tarraco-fr-phev.jpg':                                                                             'seat/tarraco-e-hybrid-phev.jpg',

  // KGM
  'Korando e-Motion.jpg':                                                                                     'kgm/korando-e-motion.jpg',

  // Skywell
  'ET5.jpg':                                                                                                  'skywell/et5.jpg',

  // Omoda
  'Chery_Omoda_E5_pricing_released,_adds_another_affordable_EV_to_stable.png':                                'omoda/e5.jpg',
  'Omoda_E5_review_-_EVs_Unplugged.png':                                                                      'omoda/e5.jpg',

  // Rolls-Royce
  'Spectre.jpg':                                                                                              'rolls-royce/spectre.jpg',
  'Test_Drive__Rolls-Royce_Spectre_-_COOL_HUNTING®.png':                                                      'rolls-royce/spectre.jpg',

  // Xpeng
  "Xpeng_G6_review__sleek,_tech-driven_premium_SUV_that's_all_the_rage.png":                                  'xpeng/g6.jpg',
  'xpeng-g6-front-deep-low-angle-view-791332.jpg':                                                            'xpeng/g6.jpg',
  'xpeng-g9-front-angle-low-view-841132.jpg':                                                                 'xpeng/g9.jpg',

  // Zero Motorcycles
  'First_Ride__Zero_DSR_X_Electrifies_the_Adventure_Bike.png':                                                'zero-motorcycles/dsr-x.jpg',
  'zero-dsr-x-02.jpg':                                                                                        'zero-motorcycles/dsr-x.jpg',
  'SRS.jpg':                                                                                                  'zero-motorcycles/sr-s.jpg',
};

let moved = 0, dupRemoved = 0, missing = 0;
for (const [src, target] of Object.entries(MAP)) {
  const srcPath = path.join(SOURCE_DIR, src);
  const tgtPath = path.join(TARGET_BASE, target);
  if (!fs.existsSync(srcPath)) {
    missing++; console.log('MISSING source:', src);
    continue;
  }
  fs.mkdirSync(path.dirname(tgtPath), { recursive: true });
  if (fs.existsSync(tgtPath)) {
    // Already have an image at this target — remove the duplicate source
    fs.unlinkSync(srcPath);
    dupRemoved++;
  } else {
    fs.copyFileSync(srcPath, tgtPath);
    fs.unlinkSync(srcPath);
    moved++;
    console.log('  →', target);
  }
}

// Report any leftover image files in /vehicles/ that didn't have a mapping
const remaining = fs.readdirSync(SOURCE_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
console.log(`\nMoved: ${moved}  Duplicates removed: ${dupRemoved}  Missing: ${missing}`);
if (remaining.length) {
  console.log(`Unmapped (still in /vehicles/): ${remaining.length}`);
  remaining.forEach(f => console.log('  ?', f));
}
