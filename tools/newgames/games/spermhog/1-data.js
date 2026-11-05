/* =====================================================================================================
   CUMHEAD THE SPERMHOG (rebuilt): a Sonic-style platformer. Six zones, two acts each, a boss at the end of
   every Act 2. Long hand-built acts made from set pieces (2-builder.js), slopes, springs, routes high and low,
   the foes and bosses from Load Legacy, a zone gimmick each, and the Spunk Brain Zone at the end.
   ===================================================================================================== */
var TS = 16, PH = 36, PHW = 6;
// physics (pixels and seconds)
var PHYS = { acc: 520, dec: 520, brake: 1150, top: 290, maxg: 760, airacc: 420, grav: 990, jumpv: 362, jump2: 300, jcut: 150, term: 600, slope: 680, friction: 0.6 };

/* the zones: look, music, foes, gimmicks. pal: ground fill colours (light, mid, dark), top: edge colours */
var ZONES = [
  { id: 'city', name: 'CLUBHOUSE ROW', song: 'hogcity', boss: 'beast', fill: 'brick', top: 'curb', pal: ['#7a2a2e', '#4e1418', '#24080a'], edge: ['#b8a8a0', '#6a5a58', '#2a1e1e'], sky: ['#0a0204', '#1c0508', '#3a0a10'],
    foes: { m: 'crawler', n: 'rat', p: 'crawler', w: 'crow', q: 'bat' }, tint: null },
  { id: 'sewer', name: 'CREAM SEWERS', song: 'hogsewer', boss: 'kraken', fill: 'sewer', top: 'slime', pal: ['#4a5a4a', '#2c3a2e', '#121a14'], edge: ['#fffbe8', '#f1e0b0', '#8a7a50'], sky: ['#050a06', '#0c1810', '#16281a'],
    foes: { m: 'rat', n: 'cultrat', p: 'creamblob', w: 'crow', q: 'slime' }, liquid: 'cream' },
  { id: 'park', name: 'EJACULAND', song: 'hogpark', boss: 'pig', fill: 'stripe', top: 'bulbs', pal: ['#c4121c', '#1a0a0c', '#0a0405'], edge: ['#ffe36a', '#c4121c', '#3a0408'], sky: ['#06020a', '#14061a', '#2a0a20'],
    foes: { m: 'clown', n: 'toymouse', p: 'pieling', w: 'balloon', q: 'balloon' }, liquid: 'cream' },
  { id: 'bone', name: 'THE BONE PIT', song: 'hogbone', boss: 'boner', fill: 'bone', top: 'skulls', pal: ['#8a7a64', '#4e4234', '#201a14'], edge: ['#f1e7d0', '#b8a888', '#4a3e2e'], sky: ['#050404', '#100c0a', '#1e1612'],
    foes: { m: 'skeleton', n: 'bonehound', p: 'gravehand', w: 'wraith', q: 'mummy' } },
  { id: 'factory', name: 'BLOOD FACTORY', song: 'hogfactory', boss: 'hotload', fill: 'metal', top: 'grate', pal: ['#6a4a40', '#3a2420', '#160c0a'], edge: ['#ffb040', '#a04a10', '#3a1404'], sky: ['#0a0302', '#200804', '#3a1006'],
    foes: { m: 'magmaslug', n: 'golem', p: 'corkbot', w: 'emberbat', q: 'imp' }, liquid: 'lava' },
  { id: 'brain', name: 'SPUNK BRAIN', song: 'hogbrain', boss: 'blum', fill: 'plate', top: 'hazard', pal: ['#5a5460', '#34303a', '#14121a'], edge: ['#ff2630', '#8a0a10', '#2a0408'], sky: ['#030204', '#0c0610', '#1a0a14'],
    foes: { m: 'blumguard', n: 'blumling', p: 'blumeye', w: 'blumspore', q: 'knight' }, liquid: 'lava' }
];

/* foes: sprite base, frames, behaviour, hit points, how fast. beh: walk (patrols, turns at edges and walls), fly (hovers on a
   sine), dive (hovers, swoops at you), hop (bounces along), turret (stays put and shoots), pop (rises out of the ground when
   you are near), float (drifts, bursts into shards). Extras: throws (lobs something now and then), shield (only hurt from
   above or behind), split (breaks into two small ones), trail (leaves fire), charge (runs at you when close) */
var FOES = {
  crawler: { spr: 'f_crawler_', n: 4, beh: 'walk', v: 34, hp: 1, pts: 100 },
  clown: { spr: 'f_clown_', n: 4, beh: 'walk', v: 26, hp: 1, throws: 'pie', pts: 200 },
  rat: { spr: 'f_rat_', n: 4, beh: 'walk', v: 70, hp: 1, pts: 100 },
  bat: { spr: 'f_bat_', n: 4, beh: 'fly', v: 30, hp: 1, pts: 100 },
  balloon: { spr: 'f_balloon_', n: 4, beh: 'float', v: 14, hp: 1, burst: 1, pts: 100 },
  cultrat: { spr: 'f_cultrat_', n: 4, beh: 'walk', v: 30, hp: 1, throws: 'dagger', pts: 200 },
  creamblob: { spr: 'f_creamblob_', n: 4, beh: 'walk', v: 24, hp: 1, split: 1, pts: 150 },
  crow: { spr: 'f_crow_', n: 4, beh: 'dive', v: 40, hp: 1, pts: 150 },
  slime: { spr: 'f_slime_', n: 4, beh: 'hop', v: 40, hp: 1, pts: 100 },
  toymouse: { spr: 'f_toymouse_', n: 4, beh: 'walk', v: 80, hp: 1, pts: 100 },
  pieling: { spr: 'f_pieling_', n: 4, beh: 'hop', v: 46, hp: 1, pts: 100 },
  skeleton: { spr: 'f_skeleton_', n: 4, beh: 'walk', v: 26, hp: 1, throws: 'bone', pts: 200 },
  bonehound: { spr: 'f_bonehound_', n: 4, beh: 'walk', v: 40, hp: 1, charge: 1, pts: 200 },
  gravehand: { spr: 'f_gravehand_', n: 4, beh: 'pop', v: 0, hp: 1, pts: 150 },
  wraith: { spr: 'f_wraith_', n: 4, beh: 'dive', v: 36, hp: 1, ghost: 1, pts: 200 },
  mummy: { spr: 'f_mummy_', n: 4, beh: 'walk', v: 20, hp: 2, pts: 200 },
  magmaslug: { spr: 'f_magmaslug_', n: 4, beh: 'walk', v: 20, hp: 1, trail: 1, pts: 150 },
  golem: { spr: 'f_golem_', n: 4, beh: 'walk', v: 18, hp: 3, pts: 400 },
  corkbot: { spr: 'f_corkbot_', n: 4, beh: 'turret', v: 0, hp: 1, throws: 'cork', pts: 150 },
  emberbat: { spr: 'f_emberbat_', n: 4, beh: 'fly', v: 36, hp: 1, drips: 1, pts: 150 },
  imp: { spr: 'f_imp_', n: 4, beh: 'hop', v: 50, hp: 1, pts: 150 },
  blumguard: { spr: 'f_blumguard_', n: 4, beh: 'walk', v: 24, hp: 2, shield: 1, pts: 300 },
  blumling: { spr: 'f_blumling_', n: 4, beh: 'hop', v: 60, hp: 1, pts: 100 },
  blumeye: { spr: 'f_blumeye_', n: 4, beh: 'turret', v: 0, hp: 2, throws: 'orb', pts: 300 },
  blumspore: { spr: 'f_blumspore_', n: 4, beh: 'float', v: 22, hp: 1, burst: 1, pts: 150 },
  knight: { spr: 'f_knight_', n: 4, beh: 'walk', v: 22, hp: 2, shield: 1, pts: 300 }
};
/* what an item box gives */
var ITEMS = { drops: 'TEN DROPS', shield: 'CONDOM', shoes: 'SPEED SHOES', star: 'INVINCIBLE', life: 'EXTRA LIFE' };
