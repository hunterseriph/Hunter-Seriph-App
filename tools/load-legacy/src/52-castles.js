/* =====================================================================================================
   THE CASTLES. Cumhead's Castle is where every legacy starts. Two more have to be earned:
   - Blumhead's Castle (beat Blumhead once): a dark, evil place. The Black Keep, the Black Spire above it,
     the Crypt of Blum below, the Rotten Garden to the right. King Blumhead waits behind the throne-room door.
   - Greebo's Grotto (beat King Blumhead): fun, but it bites. Greebo's kitchen under the Goonery, Sir
     Johnathan's Scratching Tower above, the Cream Cellar below, the Picnic to the right, and at the end
     Sir Johnathan himself, Greebo's cat, grown huge on the cream.
   Each castle has its own four areas (same shape as the first: a hub, up, down and right), its own foes,
   bosses, songs and room types, and runes that can only be found inside it. You pick the castle at the gate.
   ===================================================================================================== */
var CASTLES = {
  cum: { name: "Cumhead's Castle", sub: 'WHERE EVERY HEIR BEGINS', hub: 'castle', up: 'roof', down: 'dungeon', right: 'city', final: 'blum', win: 1 },
  blumc: { name: "Blumhead's Castle", sub: 'A DARK, EVIL PLACE', hub: 'bkeep', up: 'bspire', down: 'bcrypt', right: 'bgarden', final: 'kingblum', win: 4,
    hint: 'Beat Blumhead once to open it.', open: function () { return (META.blumWins || 0) >= 1; } },
  grotto: { name: "Greebo's Grotto", sub: 'FUN, BUT IT BITES', hub: 'gkitchen', up: 'gtower', down: 'gcellar', right: 'gfair', final: 'sirj', win: 5,
    hint: "Beat King Blumhead in Blumhead's Castle to open it.", open: function () { return ((META.cwins || {}).blumc || 0) >= 1; } }
};
var CASTLEORDER = ['cum', 'blumc', 'grotto'];
function castleOpen(c) { return c === 'cum' || (CASTLES[c] && CASTLES[c].open()); }
function curCastle() { return (RUN && !RUN.endless && RUN.castle) || 'cum'; }
function castleAreas(c) { var C = CASTLES[c || curCastle()]; return [C.hub, C.up, C.right, C.down]; }
function castleOfArea(a) { for (var k in CASTLES) if (castleAreas(k).indexOf(a) >= 0) return k; return null; }
function finalBoss(id) { for (var k in CASTLES) if (CASTLES[k].final === id) return k; return null; }

/* ---------- the areas ---------- */
AREAS.bkeep = { name: 'The Black Keep', sub: "BLUMHEAD'S OWN HOUSE", tier: 4, ox: 0, oy: 5, w: 7, h: 5, rooms: 22, boss: 'execu', music: 'bkeep', special: ['pendulum', 'pendulum'],
  sky: null, tint: 'rgba(40,0,50,0.25)', e1: '#c08aff', e2: '#3a0a4a', wall: '#0a040c', pool: [['cultist', 3], ['goohound', 3], ['blumguard', 2], ['blumling', 2], ['wraith', 1]] };
AREAS.bspire = { name: 'The Black Spire', sub: 'STORMS ROUND THE TOP', tier: 5, ox: 0, oy: 0, w: 7, h: 5, rooms: 20, boss: 'stormwing', music: 'bspire', special: ['storm', 'storm'], outdoor: 1,
  sky: 'rgba(50,0,80,0.42)', tint: 'rgba(60,20,90,0.30)', e1: '#c08aff', e2: '#3a1060', wall: null, pool: [['harpy', 3], ['stormling', 3], ['gargoyle', 2], ['crow', 1], ['blumeye', 1]] };
AREAS.bcrypt = { name: 'The Crypt of Blum', sub: 'NOTHING STAYS BURIED', tier: 6, ox: 0, oy: 10, w: 7, h: 5, rooms: 22, boss: 'queen', music: 'bcrypt', special: ['coffins', 'coffins'],
  sky: null, tint: 'rgba(20,0,30,0.45)', e1: '#9a7aff', e2: '#200830', wall: '#060308', pool: [['mummy', 3], ['gravehand', 3], ['vampire', 2], ['wraith', 1], ['skeleton', 1]] };
AREAS.bgarden = { name: 'The Rotten Garden', sub: 'EVERYTHING HERE HAS THORNS', tier: 5, ox: 7, oy: 5, w: 7, h: 5, rooms: 21, boss: 'rotmother', music: 'bgarden', special: ['thorns', 'thorns'], outdoor: 1,
  sky: 'rgba(30,40,10,0.30)', tint: 'rgba(40,60,10,0.22)', e1: '#9adf5a', e2: '#1a3008', wall: null, pool: [['thornling', 3], ['rotfly', 3], ['blumspore', 2], ['goohound', 1], ['crow', 1]] };
AREAS.gkitchen = { name: "Greebo's Grotto", sub: 'THE KITCHEN UNDER THE GOONERY', tier: 5, ox: 0, oy: 5, w: 7, h: 5, rooms: 22, boss: 'cake', music: 'gkitchen', special: ['conveyor', 'conveyor'],
  sky: null, tint: 'rgba(90,40,0,0.14)', e1: '#ffd080', e2: '#5a2a08', wall: '#140a04', pool: [['pieling', 3], ['rollingpin', 3], ['creamblob', 2], ['corkbot', 1]] };
AREAS.gtower = { name: "Sir Johnathan's Scratching Tower", sub: 'MIND THE CLAWS', tier: 6, ox: 0, oy: 0, w: 7, h: 5, rooms: 20, boss: 'clockmouse', music: 'gtower', special: ['yarn', 'yarn'],
  sky: null, tint: 'rgba(60,30,60,0.16)', e1: '#ff9ad0', e2: '#4a1a3a', wall: '#100810', pool: [['toymouse', 3], ['feather', 3], ['crow', 1], ['rat', 2]] };
AREAS.gcellar = { name: 'The Cream Cellar', sub: 'IT RISES WHEN YOU LEAST WANT IT', tier: 7, ox: 0, oy: 10, w: 7, h: 5, rooms: 22, boss: 'kraken', music: 'gcellar', special: ['vats', 'vats'],
  sky: null, tint: 'rgba(60,40,10,0.18)', e1: '#fff6d8', e2: '#5a4a2a', wall: '#0c0904', pool: [['corkbot', 3], ['jelly', 3], ['creamblob', 2], ['rat', 1]] };
AREAS.gfair = { name: 'The Picnic', sub: "GREEBO'S BIG DAY OUT", tier: 6, ox: 7, oy: 5, w: 7, h: 5, rooms: 21, boss: 'waspqueen', music: 'gfair', special: ['jellies', 'jellies'], outdoor: 1,
  sky: 'rgba(60,20,0,0.18)', tint: 'rgba(80,40,0,0.14)', e1: '#ffe36a', e2: '#5a3a08', wall: null, pool: [['wasp', 3], ['ant', 3], ['jelly', 1], ['pieling', 1], ['crow', 1]] };
var SPECIALAREA = {}; ['bkeep', 'bspire', 'bcrypt', 'bgarden', 'gkitchen', 'gtower', 'gcellar', 'gfair'].forEach(function (a) { SPECIALAREA[AREAS[a].special[0]] = a; });

/* ---------- foes ---------- */
ENEMIES.cultist = { name: 'Blum Cultist', ai: 'cast', hp: 26, dmg: 13, spd: 26, w: 16, h: 32, fsp: 'cultist', nf: 3, sc: 1, drops: 4 };
ENEMIES.goohound = { name: 'Goo Hound', ai: 'charge', hp: 24, dmg: 14, spd: 50, w: 28, h: 18, fsp: 'goohound', nf: 4, sc: 1, drops: 3 };
ENEMIES.harpy = { name: 'Blum Harpy', ai: 'dive', hp: 18, dmg: 13, spd: 78, w: 22, h: 20, fsp: 'harpy', nf: 4, sc: 1, drops: 3, fly: 1 };
ENEMIES.stormling = { name: 'Stormling', ai: 'cloud', hp: 16, dmg: 13, spd: 60, w: 22, h: 18, fsp: 'stormling', nf: 3, sc: 1, drops: 3, fly: 1 };
ENEMIES.mummy = { name: 'Mummy', ai: 'walk', hp: 54, dmg: 16, spd: 18, w: 16, h: 34, fsp: 'mummy', nf: 4, sc: 1, drops: 5 };
ENEMIES.gravehand = { name: 'Grave Hand', ai: 'hand', hp: 22, dmg: 14, spd: 0, w: 14, h: 20, fsp: 'gravehand', nf: 4, sc: 1, drops: 3 };
ENEMIES.thornling = { name: 'Thornling', ai: 'lob', hp: 28, dmg: 13, spd: 24, w: 22, h: 24, fsp: 'thornling', nf: 4, sc: 1, drops: 4, shot: 'thorn' };
ENEMIES.rotfly = { name: 'Rot Fly', ai: 'fly', hp: 8, dmg: 10, spd: 74, w: 16, h: 12, fsp: 'rotfly', nf: 4, sc: 1, drops: 2 };
ENEMIES.pieling = { name: 'Pieling', ai: 'hop', hp: 20, dmg: 12, spd: 80, w: 20, h: 16, fsp: 'pieling', nf: 4, sc: 1, drops: 3 };
ENEMIES.rollingpin = { name: 'Rolling Pin', ai: 'charge', hp: 26, dmg: 14, spd: 46, w: 30, h: 12, fsp: 'rollingpin', nf: 4, sc: 1, drops: 3 };
ENEMIES.toymouse = { name: 'Clockwork Mouse', ai: 'walk', hp: 12, dmg: 11, spd: 104, w: 20, h: 12, fsp: 'toymouse', nf: 4, sc: 1, drops: 2, pack: 2 };
ENEMIES.feather = { name: 'Feather Toy', ai: 'dive', hp: 12, dmg: 11, spd: 84, w: 16, h: 24, fsp: 'feather', nf: 4, sc: 1, drops: 2, fly: 1 };
ENEMIES.corkbot = { name: 'Fizzy Bottle', ai: 'lob', hp: 24, dmg: 12, spd: 22, w: 14, h: 30, fsp: 'corkbot', nf: 3, sc: 1, drops: 4, shot: 'cork' };
ENEMIES.jelly = { name: 'Cherry Jelly', ai: 'hop', hp: 22, dmg: 12, spd: 70, w: 18, h: 18, fsp: 'jelly', nf: 4, sc: 1, drops: 3, split: 1 };
ENEMIES.wasp = { name: 'Picnic Wasp', ai: 'dive', hp: 10, dmg: 12, spd: 96, w: 18, h: 14, fsp: 'wasp', nf: 4, sc: 1, drops: 2, fly: 1 };
ENEMIES.ant = { name: 'Picnic Ant', ai: 'walk', hp: 10, dmg: 10, spd: 64, w: 18, h: 12, fsp: 'ant', nf: 4, sc: 1, drops: 1, pack: 3 };

/* ---------- bosses ---------- */
BOSSDEF.execu = { name: 'The Blum Executioner', area: 'bkeep', hp: 1300, dmg: 26, sp: 'f_execu_', sc: 1, w: 46, h: 84 };
BOSSDEF.stormwing = { name: 'Stormwing', area: 'bspire', hp: 1200, dmg: 25, sp: 'f_stormwing_', sc: 1, w: 70, h: 50, fly: 1 };
BOSSDEF.queen = { name: 'The Pale Queen', area: 'bcrypt', hp: 1400, dmg: 27, sp: 'f_queen_', sc: 1, w: 30, h: 80 };
BOSSDEF.rotmother = { name: 'The Rot Mother', area: 'bgarden', hp: 1500, dmg: 25, sp: 'f_rotmother_', sc: 1, w: 70, h: 80 };
BOSSDEF.kingblum = { name: 'King Blumhead', area: 'bkeep', hp: 2200, dmg: 30, sp: 'f_kingblum_', sc: 1, w: 70, h: 104, fly: 1, tier: 7, final: 1 };
BOSSDEF.cake = { name: 'The Great Cake', area: 'gkitchen', hp: 1500, dmg: 26, sp: 'f_cake_', sc: 1, w: 66, h: 84 };
BOSSDEF.clockmouse = { name: 'The Clockwork Mouse', area: 'gtower', hp: 1600, dmg: 27, sp: 'f_clockmouse_', sc: 1, w: 84, h: 56 };
BOSSDEF.kraken = { name: 'The Cream Kraken', area: 'gcellar', hp: 1800, dmg: 28, sp: 'f_kraken_', sc: 1, w: 70, h: 84 };
BOSSDEF.waspqueen = { name: 'The Wasp Queen', area: 'gfair', hp: 1500, dmg: 27, sp: 'f_waspqueen_', sc: 1, w: 70, h: 52, fly: 1 };
BOSSDEF.sirj = { name: 'Sir Johnathan', area: 'gkitchen', hp: 3000, dmg: 32, sp: 'f_sirj_', sc: 1, w: 92, h: 70, tier: 8, final: 1 };
['execu', 'stormwing', 'queen', 'rotmother', 'kingblum', 'cake', 'clockmouse', 'kraken', 'waspqueen', 'sirj'].forEach(function (k) { BOSSMUSIC[k] = 'b' + k; });
BOSSLINES.execu = ['THE KING SENDS HIS REGARDS. AND HIS AXE.', 'KNEEL, LITTLE DROP. IT IS QUICKER.'];
BOSSLINES.stormwing = ['SCREEEEEEE!', 'THE SPIRE IS MINE. THE SKY IS MINE.'];
BOSSLINES.queen = ['A WARM ONE. HOW LONG IT HAS BEEN.', 'STAY FOR SUPPER, DARLING. YOU ARE SUPPER.'];
BOSSLINES.rotmother = ['MY CHILDREN ARE HUNGRY.', 'BE STILL. LET THE ROOTS HAVE YOU.'];
BOSSLINES.kingblum = ['WELCOME TO MY HOUSE, LITTLE DROP. WIPE YOUR FEET.', 'ON MY OWN GROUND I AM KING. BOW.'];
BOSSLINES.cake = ['HAPPY BIRTHDAY TO ME. HAPPY BIRTHDAY TO ME.', 'MAKE A WISH. IT WILL NOT COME TRUE.'];
BOSSLINES.clockmouse = ['TICK. TICK. TICK. SQUEAK.', 'SIR JOHNATHAN NEVER CAUGHT ME. NEITHER WILL YOU.'];
BOSSLINES.kraken = ['BLUB. BLUB. BLUB.', 'THE CELLAR IS DEEP. DEEPER THAN YOU THINK.'];
BOSSLINES.waspqueen = ['WHO INVITED YOU TO THE PICNIC?', 'BZZZZ. MY DARLINGS. STING IT.'];
BOSSLINES.sirj = ['MRRROW.', '...MRRRRRRROWWW!'];

/* runes that can only be found in their own castle */
RUNES.push({ id: 'dread', name: 'Dread Rune', d: '+25% damage while under half HP', cost: 2200, icon: 'curse', castle: 'blumc' },
  { id: 'pact', name: 'Blood Pact Rune', d: 'Every kill heals 3 HP', cost: 2600, icon: 'bloodpack', castle: 'blumc' },
  { id: 'void', name: 'Void Rune', d: '+10% critical hits', cost: 2400, icon: 'deck', castle: 'blumc' },
  { id: 'whisker', name: 'Whisker Rune', d: 'Drops fly to you from much further away', cost: 2000, icon: 'lid', castle: 'grotto' },
  { id: 'piepow', name: 'Pie Rune', d: '20% chance an attack goes off twice', cost: 2800, icon: 'ppz', castle: 'grotto' },
  { id: 'nine', name: 'Nine Lives Rune', d: 'Once a run, a killing blow leaves you on 1 HP', cost: 3200, icon: 'holy', castle: 'grotto' });
function castleRuneStats(s) {
  if (runeOn('void')) s.crit += 0.1; if (runeOn('whisker')) s.magnet += 1; if (runeOn('piepow')) s.echo = Math.min(0.75, s.echo + 0.2);
  if (runeOn('dread')) s.dread = 0.25; if (runeOn('pact')) s.pact = 3;
}

/* ---------- new foe brains ---------- */
var foeAI0 = foeAI;
foeAI = function (e, dt, dx, dy, adx, sp) {
  var ai = e.d.ai;
  if (ai === 'cast') { // the cultist stops, raises his staff and sends three slow orbs of goo at you
    if (e.st === 'cast') { e.vx = 0; e.fr = 3; e.st2 -= dt; if (e.st2 <= 0) { var a = Math.atan2(dy, dx); for (var k = -1; k <= 1; k++) eshots.push({ x: e.x + e.face * 10, y: e.y - 28, vx: Math.cos(a + k * 0.22) * 120, vy: Math.sin(a + k * 0.22) * 120, life: 3, r: 4, dmg: e.dmg * 0.8, k: 'orb', by: 'a cultist' }); sfx.fire(); e.st = 'go'; e.cd = 2.6; e.fr = null; } }
    else { e.fr = null; e.cd -= dt; patrol(e, sp); if (e.cd <= 0 && adx < 230 && Math.abs(dy) < 120 && e.onGround) { e.st = 'cast'; e.st2 = 0.55; e.face = dx > 0 ? 1 : -1; } }
    moveBody(e, dt, GRAV);
  } else if (ai === 'cloud') { // a stormling drifts over your head and drops lightning straight down
    var tx = P.x + Math.sin(e.t * 0.9 + e.ph) * 30, ty = Math.max(40, P.y - 110);
    e.x += clamp(tx - e.x, -sp * dt, sp * dt); e.y += clamp(ty - e.y, -sp * dt, sp * dt); e.face = dx >= 0 ? 1 : -1;
    e.cd -= dt; e.fr = e.cd < 0.45 ? 3 : null;
    if (e.cd <= 0) { e.cd = 2.4 + Math.random(); if (adx < 60) { eshots.push({ x: e.x, y: e.y + 8, vx: 0, vy: 330, life: 2, r: 4, dmg: e.dmg, k: 'zap', by: 'a stormling' }); sfx.fire(); } }
  } else if (ai === 'hand') { // a grave hand waits under the dirt, then grabs up when you walk over it
    e.vx = 0; var near = adx < 72 && Math.abs(dy) < 60;
    if (near) e.rise = Math.min(1, (e.rise || 0) + dt * 3); else e.rise = Math.max(0, (e.rise || 0) - dt * 0.6);
    e.fr = Math.min(3, Math.floor((e.rise || 0) * 4)); e.ghost = (e.rise || 0) < 0.3;
    if (e.fr >= 2 && !e.grabbed) { e.grabbed = 1; sfx.splat(); } if (!near) e.grabbed = 0;
    moveBody(e, dt, GRAV);
  } else foeAI0(e, dt, dx, dy, adx, sp);
};

/* ---------- boss brains ---------- */
var CASFX = []; // warnings and strikes: lightning, vines, tentacles
function casStrike(k, x, delay, dmg, by, col) { CASFX.push({ k: k, x: x, t: delay + 0.35, warn: delay, dmg: dmg, by: by, col: col || '#c08aff' }); }
function casFxStep(dt) {
  CASFX.forEach(function (f) {
    var was = f.t; f.t -= dt;
    if (was > 0.35 && f.t <= 0.35) { G.shake = Math.max(G.shake, 5); sfx[f.k === 'bolt' ? 'fire' : 'land'](); poof(f.x, 15 * T - 4, 10, [f.col, '#ffffff']); }
    if (f.t <= 0.35 && f.t > 0 && !f.hit && P.state !== 'dead' && Math.abs(P.x - f.x) < (f.k === 'bolt' ? 16 : 18) && (f.k === 'bolt' || P.y > 15 * T - 3.5 * T)) { f.hit = 1; hurtP(f.dmg, f.x, f.by); }
  });
  CASFX = CASFX.filter(function (f) { return f.t > 0; });
}
function drawCasFx(cx) {
  CASFX.forEach(function (f) {
    var x = Math.round(f.x - cx), gy = 15 * T;
    if (f.t > 0.35) { if (Math.floor(G.t * 14) % 2) R(ctx, f.col, x - 1, f.k === 'bolt' ? 0 : gy - 4, 2, f.k === 'bolt' ? gy : 4); R(ctx, f.col, x - 10, gy - 2, 20, 2); return; }
    if (f.k === 'bolt') { ctx.save(); ctx.shadowColor = f.col; ctx.shadowBlur = 14; var y = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); while (y < gy) { y += 16; ctx.lineTo(x + (Math.random() - 0.5) * 12, Math.min(gy, y)); } ctx.stroke(); ctx.strokeStyle = f.col; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
    else if (f.k === 'vine') { var h = Math.round(3.4 * T * Math.min(1, (0.35 - f.t) / 0.1)); R(ctx, '#12040a', x - 7, gy - h, 14, h); R(ctx, '#3a5a1a', x - 6, gy - h, 12, h); R(ctx, '#5a8a2a', x - 6, gy - h, 3, h); for (var k = 0; k < h; k += 8) { R(ctx, '#c8b898', x - 9, gy - k - 4, 3, 2); R(ctx, '#c8b898', x + 6, gy - k - 8, 3, 2); } R(ctx, '#c8b898', x - 2, gy - h - 4, 4, 4); }
    else { var h2 = Math.round(4 * T * Math.min(1, (0.35 - f.t) / 0.1)); R(ctx, '#12040a', x - 9, gy - h2, 18, h2); R(ctx, '#f1e0b0', x - 8, gy - h2, 16, h2); R(ctx, '#fffbe8', x - 8, gy - h2, 4, h2); for (var s = 6; s < h2; s += 10) R(ctx, '#c8a878', x + 4, gy - s, 3, 3); }
  });
}
function bossMove(b, dt) { var wasG = b.onGround; moveBody(b, dt, GRAV); return b.onGround && !wasG; }
function bossWaves(b, dmgK, by) { for (var q = -1; q <= 1; q += 2) waves.push({ x: b.x + q * 36, y: b.y, dir: q, life: 2.2, dmg: b.dmg * dmgK, by: by }); }
function summon(b, kinds, W) { kinds.forEach(function (k, s) { var e = mkEnemy(k, clamp(b.x + (s % 2 ? 90 : -90), 60, W - 60), isFlyer(ENEMIES[k]) ? 130 : 15 * T, -1); enemies.push(e); poof(e.x, e.y - 10, 12, ['#c08aff', '#ff2630']); }); sfx.roar(); }
function pickMove(b, opts) { var o = opts.filter(Boolean); b.nx = o[Math.floor(Math.random() * o.length)]; b.st = 'tell'; b.t2 = b.tellT || 0.5; b.n = 0; }
BRAIN.execu = function (b, dt, W, ph) {
  var f = towardP(b), dist = Math.abs(P.x - b.x);
  if (b.st === 'idle') { b.face = f; b.vx = dist > 60 ? f * 60 : 0; b.cd -= dt; if (b.cd <= 0) pickMove(b, dist < 120 ? ['chop', 'chop', 'spin'] : ['spin', 'chop', ph === 2 ? 'summon' : 'spin', enemies.length < 2 ? 'summon' : null]); }
  else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'chop') { b.st = 'rest'; b.t2 = 0.8; G.shake = 11; sfx.land(); var sx0 = b.face > 0 ? b.x : b.x - 100, sx1 = b.face > 0 ? b.x + 100 : b.x; fx.push({ k: 'ring', x: b.x + b.face * 60, y: b.y - 10, age: 0, c: '#c08aff' }); if (P.state !== 'dead' && ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, sx0, b.y - 60, sx1, b.y)) hurtP(b.dmg * 1.2, b.x, "the Executioner's axe"); waves.push({ x: b.x + b.face * 60, y: b.y, dir: b.face, life: 2.2, dmg: b.dmg * 0.7, by: 'the Executioner' }); if (ph === 2) waves.push({ x: b.x - b.face * 30, y: b.y, dir: -b.face, life: 2, dmg: b.dmg * 0.6, by: 'the Executioner' }); }
    else if (b.nx === 'spin') { b.st = 'spin'; b.t2 = ph === 2 ? 1.8 : 1.3; sfx.whip(); }
    else { summon(b, ph === 2 ? ['cultist', 'goohound'] : ['goohound'], W); b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'spin') { b.vx = b.face * 230; b.t2 -= dt; if (Math.random() < 0.3) sfx.whip(); if (b.hitWall) b.face = -b.face; if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1.2; b.vx = 0; } }
  else if (b.st === 'rest') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = ph === 2 ? 0.8 : 1.3; } }
  bossMove(b, dt);
};
BRAIN.stormwing = function (b, dt, W, ph) {
  var hx = clamp(P.x + Math.sin(b.t * 0.8) * 180, 80, W - 80), hy = 146 + Math.sin(b.t * 1.6) * 22;
  if (b.st === 'idle') { b.x += (hx - b.x) * Math.min(1, dt * 1.4); b.y += (hy - b.y) * Math.min(1, dt * 1.6); b.face = towardP(b); b.cd -= dt; if (b.cd <= 0) { var o = ['dive', 'dive', 'bolts', 'feathers']; if (ph === 2) o.push('bolts', 'storm'); b.st = o[Math.floor(Math.random() * o.length)]; b.n = 0; b.t2 = 0.5; if (b.st === 'dive') { b.tx = P.x; b.ty = P.y - 20; sfx.roar(); } } }
  else if (b.st === 'dive') { b.t2 -= dt; if (b.t2 > 0) { b.y -= 30 * dt; return; } b.x += clamp(b.tx - b.x, -320 * dt, 320 * dt); b.y += clamp(b.ty - b.y, -320 * dt, 320 * dt); if (Math.abs(b.tx - b.x) < 6 && Math.abs(b.ty - b.y) < 6) { b.st = 'idle'; b.cd = 1.3; G.shake = 5; } }
  else if (b.st === 'bolts') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.45; b.n++; casStrike('bolt', clamp(P.x + (Math.random() - 0.5) * 60, 20, W - 20), 0.8, b.dmg * 0.8, 'lightning', '#c08aff'); if (b.n >= (ph === 2 ? 5 : 3)) { b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'feathers') { b.t2 -= dt; if (b.t2 <= 0) { var a = Math.atan2((P.y - 18) - b.y, P.x - b.x); for (var k = -2; k <= 2; k++) bshot(b.x, b.y - 10, a + k * 0.16, 200, b.dmg * 0.6, 'feather', 'a black feather'); sfx.whip(); b.n++; b.t2 = 0.5; if (b.n >= 3) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'storm') { for (var i = 0; i < 6; i++) casStrike('bolt', 40 + (W - 80) * (i / 5) + (Math.random() - 0.5) * 30, 0.9 + (i % 2) * 0.6, b.dmg * 0.8, 'the storm', '#c08aff'); G.banner = 1; G.bannerTxt = 'THE STORM BREAKS'; G.bannerSub = 'WATCH THE LINES'; sfx.roar(); b.st = 'idle'; b.cd = 2.4; }
};
BRAIN.queen = function (b, dt, W, ph) {
  var f = towardP(b);
  if (b.st === 'idle') { b.face = f; b.vx = 0; b.cd -= dt; if (b.cd <= 0) pickMove(b, ['tele', 'bats', 'blood', enemies.length < 3 ? 'summon' : 'tele', ph === 2 ? 'drain' : 'bats']); }
  else if (b.st === 'tell') { b.t2 -= dt; b.face = f; if (b.t2 <= 0) {
    if (b.nx === 'tele') { poof(b.x, b.y - 40, 16, ['#ff2630', '#12040a']); b.x = clamp(P.x + (P.x < W / 2 ? 140 : -140), 60, W - 60); poof(b.x, b.y - 40, 16, ['#ff2630', '#12040a']); sfx.door(); b.st = 'tell'; b.nx = 'bats'; b.t2 = 0.4; return; }
    if (b.nx === 'bats') { var a = Math.atan2((P.y - 18) - (b.y - 50), P.x - b.x); for (var k = -2; k <= 2; k++) bshot(b.x, b.y - 50, a + k * 0.2, 170, b.dmg * 0.6, 'bat', 'a vampire bat'); sfx.fire(); b.st = 'idle'; b.cd = 1.3; }
    else if (b.nx === 'blood') { b.st = 'blood'; b.n = 0; b.t2 = 0; sfx.roar(); }
    else if (b.nx === 'drain') { b.st = 'drain'; b.t2 = 2; G.banner = 1; G.bannerTxt = 'SHE DRINKS'; G.bannerSub = 'GET AWAY FROM HER'; }
    else { summon(b, ['vampire', 'bat'], W); b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'blood') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.16; b.n++; eshots.push({ x: clamp(P.x + (Math.random() - 0.5) * 260, 20, W - 20), y: -10, vx: 0, vy: 220, life: 3, r: 4, dmg: b.dmg * 0.55, k: 'drop2', by: 'blood rain' }); if (b.n >= (ph === 2 ? 16 : 10)) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'drain') { b.t2 -= dt; var d = Math.abs(P.x - b.x); if (d < 150 && P.state !== 'dead') { b.dt2 = (b.dt2 || 0) + dt; if (b.dt2 > 0.4) { b.dt2 = 0; hurtP(b.dmg * 0.35, b.x, 'the Pale Queen'); b.hp = Math.min(b.mhp, b.hp + b.mhp * 0.01); } } if (Math.random() < 0.5) parts.push({ x: P.x + (Math.random() - 0.5) * 10, y: P.y - 20, vx: (b.x - P.x) * 1.2, vy: -20, life: 0.6, c: '#ff2630' }); if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1; } }
  bossMove(b, dt);
};
BRAIN.rotmother = function (b, dt, W, ph) {
  b.vx = 0; b.face = towardP(b);
  if (b.st === 'idle') { b.cd -= dt; if (b.cd <= 0) pickMove(b, ['seeds', 'vines', 'vines', enemies.length < 3 ? 'spawn' : 'seeds', ph === 2 ? 'spray' : 'seeds']); }
  else if (b.st === 'tell') { b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'seeds') { for (var k = 0; k < (ph === 2 ? 7 : 5); k++) { var tx = clamp(P.x + (k - 2) * 50, 20, W - 20), tt = 1, g = 500; eshots.push({ x: b.x, y: b.y - 60, vx: (tx - b.x) / tt, vy: (15 * T - 4 - (b.y - 60) - 0.5 * g * tt * tt) / tt, g: g, life: 3, r: 5, dmg: b.dmg * 0.6, k: 'seed', by: 'a rotten seed' }); } sfx.lob(); b.st = 'idle'; b.cd = 1.4; }
    else if (b.nx === 'vines') { for (var i = 0; i < (ph === 2 ? 4 : 3); i++) casStrike('vine', clamp(P.x + (i - 1) * 40 + (Math.random() - 0.5) * 20, 30, W - 30), 0.7 + i * 0.25, b.dmg * 0.8, 'a thorn vine', '#9adf5a'); sfx.roar(); b.st = 'idle'; b.cd = 1.6; }
    else if (b.nx === 'spray') { for (var a = 0; a < 12; a++) bshot(b.x, b.y - 56, -Math.PI + a / 11 * Math.PI, 150, b.dmg * 0.5, 'spore', 'a spore'); sfx.fire(); b.st = 'idle'; b.cd = 1.4; }
    else { summon(b, ['thornling', 'rotfly'], W); b.st = 'idle'; b.cd = 1.6; } } }
  bossMove(b, dt);
};
BRAIN.kingblum = function (b, dt, W, ph) {
  b.hoverY = ph === 2 ? 168 : 152; // he is taller than Blumhead, so he floats lower to stay in reach
  if (b.st === 'sweep') { b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1.3; } return; }
  if (b.st === 'guards') { summon(b, ph === 2 ? ['blumguard', 'cultist'] : ['cultist', 'blumling'], W); b.st = 'idle'; b.cd = 1.6; return; }
  if (b.st === 'idle' && b.cd - dt <= 0 && Math.random() < 0.3) { b.cd = 0; var o = ['sweep', enemies.length < 3 ? 'guards' : 'sweep']; b.st = o[Math.floor(Math.random() * o.length)];
    if (b.st === 'sweep') { b.t2 = 2; G.kbSweep = { x: P.x, dir: P.x < W / 2 ? 1 : -1, t: 0.8, dmg: b.dmg }; sfx.roar(); } return; }
  blumBrain(b, dt, W, ph, ph === 2);
};
BRAIN.cake = function (b, dt, W, ph) {
  var f = towardP(b);
  if (b.st === 'idle') { b.face = f; b.vx = f * 40; b.cd -= dt; if (b.cd <= 0) pickMove(b, ['hop', 'hop', 'cherries', 'candles', ph === 2 && enemies.length < 4 ? 'slice' : 'cherries']); }
  else if (b.st === 'tell') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'hop') { b.st = 'air'; b.vy = -500; b.vx = clamp((P.x - b.x) * 1.1, -260, 260); }
    else if (b.nx === 'cherries') { for (var k = 0; k < 4; k++) { var tx = clamp(P.x + (k - 1.5) * 44, 20, W - 20), tt = 0.9, g = 560; eshots.push({ x: b.x, y: b.y - 80, vx: (tx - b.x) / tt, vy: (15 * T - 4 - (b.y - 80) - 0.5 * g * tt * tt) / tt, g: g, life: 3, r: 5, dmg: b.dmg * 0.6, k: 'cherry', by: 'a cherry bomb', end: 1 }); } sfx.lob(); b.st = 'idle'; b.cd = 1.3; }
    else if (b.nx === 'candles') { b.st = 'candles'; b.n = 0; b.t2 = 0; }
    else { for (var s = 0; s < 3; s++) { var e = mkEnemy('pieling', clamp(b.x + (s - 1) * 40, 40, W - 40), b.y - 30, -1); e.vy = -260; enemies.push(e); } sfx.splat(); G.banner = 1; G.bannerTxt = 'A SLICE COMES OFF'; G.bannerSub = ''; b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'candles') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.2; b.n++; bshot(b.x + (b.n % 3 - 1) * 10, b.y - 84, -Math.PI / 2 + (Math.random() - 0.5) * 1.4, 220, b.dmg * 0.55, 'fire', 'a candle flame'); sfx.fire(); if (b.n >= (ph === 2 ? 12 : 8)) { b.st = 'idle'; b.cd = 1.2; } } }
  if (bossMove(b, dt) && b.st === 'air') { b.st = 'idle'; b.cd = 1.1; G.shake = 10; sfx.land(); bossWaves(b, 0.8, 'the Great Cake'); }
};
BRAIN.clockmouse = function (b, dt, W, ph) {
  var f = towardP(b);
  if (b.st === 'idle') { b.face = f; b.vx = f * 50; b.cd -= dt; if (b.cd <= 0) { b.tellT = 0.8; pickMove(b, ['zoom', 'zoom', 'gears', enemies.length < 4 ? 'mice' : 'hop', 'hop']); b.tellT = 0; if (b.nx === 'zoom') { b.t2 = 0.9; sfx.click(); } } }
  else if (b.st === 'tell') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'zoom') { b.st = 'zoom'; b.n = ph === 2 ? 3 : 2; sfx.roar(); }
    else if (b.nx === 'gears') { b.st = 'gears'; b.n = 0; b.t2 = 0; }
    else if (b.nx === 'hop') { b.st = 'air'; b.vy = -460; b.vx = clamp((P.x - b.x) * 1.1, -240, 240); }
    else { for (var s = 0; s < 3; s++) { var e = mkEnemy('toymouse', clamp(b.x + (s - 1) * 30, 40, W - 40), b.y, -1); enemies.push(e); } sfx.click(); b.st = 'idle'; b.cd = 1.4; } } }
  else if (b.st === 'zoom') { b.vx = b.face * 340; if (b.hitWall || b.x <= b.w / 2 + 18 || b.x >= W - b.w / 2 - 18) { G.shake = 7; sfx.land(); b.n--; b.face = -b.face; if (b.n <= 0) { b.st = 'stun'; b.t2 = 1; b.vx = 0; } } }
  else if (b.st === 'stun') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1; } }
  else if (b.st === 'gears') { b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.25; b.n++; eshots.push({ x: b.x, y: b.y - 50, vx: (Math.random() - 0.5) * 300, vy: -300 - Math.random() * 100, g: 620, life: 3, r: 5, dmg: b.dmg * 0.55, k: 'gear', by: 'a flying gear' }); sfx.click(); if (b.n >= (ph === 2 ? 8 : 5)) { b.st = 'idle'; b.cd = 1.2; } } }
  if (bossMove(b, dt) && b.st === 'air') { b.st = 'idle'; b.cd = 1.1; G.shake = 8; sfx.land(); bossWaves(b, 0.7, 'the Clockwork Mouse'); }
};
BRAIN.kraken = function (b, dt, W, ph) {
  b.vx = 0; b.face = towardP(b);
  if (b.st === 'idle') { b.cd -= dt; if (b.cd <= 0) pickMove(b, ['slam', 'slam', 'ink', ph === 2 ? 'flood' : 'ink', enemies.length < 3 ? 'spawn' : 'slam']); }
  else if (b.st === 'tell') { b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'slam') { for (var i = 0; i < (ph === 2 ? 3 : 2); i++) casStrike('tent', clamp(P.x + (i ? (i % 2 ? 60 : -60) : 0), 30, W - 30), 0.7 + i * 0.3, b.dmg * 0.9, 'a tentacle', '#fff6d8'); sfx.roar(); b.st = 'idle'; b.cd = 1.4; }
    else if (b.nx === 'ink') { for (var k = 0; k < 9; k++) bshot(b.x, b.y - 60, -Math.PI * (0.1 + 0.8 * k / 8), 190, b.dmg * 0.55, 'creamglob', 'a glob of cream'); sfx.splat(); b.st = 'idle'; b.cd = 1.2; }
    else if (b.nx === 'flood') { LAIRFX.push({ k: 'flood', t: 4.2, dmg: b.dmg * 0.5, cream: 1 }); G.banner = 1.2; G.bannerTxt = 'THE CREAM RISES'; G.bannerSub = 'GET UP HIGH'; sfx.roar(); b.st = 'idle'; b.cd = 2.2; }
    else { summon(b, ['jelly', 'corkbot'], W); b.st = 'idle'; b.cd = 1.5; } } }
  bossMove(b, dt);
};
BRAIN.waspqueen = function (b, dt, W, ph) {
  var hx = clamp(P.x + Math.sin(b.t * 1.1) * 140, 70, W - 70), hy = 150 + Math.sin(b.t * 2.2) * 24;
  if (b.st === 'idle') { b.x += (hx - b.x) * Math.min(1, dt * 1.6); b.y += (hy - b.y) * Math.min(1, dt * 1.8); b.face = towardP(b); b.cd -= dt; if (b.cd <= 0) { var o = ['sting', 'spray', 'sting', enemies.length < 4 ? 'swarm' : 'spray']; b.st = o[Math.floor(Math.random() * o.length)]; b.n = 0; b.t2 = 0.55; if (b.st === 'sting') { b.tx = P.x; b.ty = P.y - 14; sfx.whip(); } } }
  else if (b.st === 'sting') { b.t2 -= dt; if (b.t2 > 0) { b.x -= b.face * 40 * dt; return; } b.x += clamp(b.tx - b.x, -380 * dt, 380 * dt); b.y += clamp(b.ty - b.y, -380 * dt, 380 * dt); b.face = b.tx > b.x ? 1 : -1; if (Math.abs(b.tx - b.x) < 6 && Math.abs(b.ty - b.y) < 6) { b.n++; if (ph === 2 && b.n < 2) { b.tx = P.x; b.ty = P.y - 14; b.t2 = 0.3; } else { b.st = 'idle'; b.cd = 1.3; } } }
  else if (b.st === 'spray') { b.t2 -= dt; if (b.t2 <= 0) { var a = Math.atan2((P.y - 18) - b.y, P.x - b.x); for (var k = -2; k <= 2; k++) bshot(b.x, b.y, a + k * 0.14, 230, b.dmg * 0.55, 'needle', 'a stinger'); sfx.shoot(); b.n++; b.t2 = 0.4; if (b.n >= (ph === 2 ? 4 : 3)) { b.st = 'idle'; b.cd = 1.2; } } }
  else if (b.st === 'swarm') { summon(b, ['wasp', 'wasp'], W); b.st = 'idle'; b.cd = 1.5; }
};
BRAIN.sirj = function (b, dt, W, ph) {
  var f = towardP(b);
  if (b.st === 'nap') { b.vx = 0; b.t2 -= dt; b.napping = 1; if (Math.random() < 0.05) pop(b.x, b.y - b.h - 10, 'Z', '#9adfff'); if (b.t2 <= 0) { b.napping = 0; b.st = 'idle'; b.cd = 0.6; sfx.roar(); G.banner = 1; G.bannerTxt = 'HE IS AWAKE'; G.bannerSub = ''; } bossMove(b, dt); return; }
  if (b.st === 'idle') { b.face = f; b.vx = f * 70; b.cd -= dt; b.moves = b.moves || 0; if (b.cd <= 0) { b.moves++; if (b.moves % 6 === 0) { b.st = 'nap'; b.t2 = 2.4; G.banner = 1.2; G.bannerTxt = 'SIR JOHNATHAN NAPS'; G.bannerSub = 'HIT HIM WHILE HE SLEEPS'; return; } pickMove(b, ['pounce', 'pounce', 'claws', 'hairball', 'zoomies', ph === 2 && enemies.length < 4 ? 'mice' : 'claws']); } }
  else if (b.st === 'tell') { b.vx = 0; b.face = f; b.t2 -= dt; if (b.t2 <= 0) {
    if (b.nx === 'pounce') { b.st = 'air'; b.vy = -520; b.vx = clamp((P.x - b.x) * 1.2, -300, 300); sfx.roar(); }
    else if (b.nx === 'claws') { var n = ph === 2 ? 16 : 8; for (var i = 0; i < n; i++) bshot(b.x, b.y - 40, i / n * Math.PI * 2 + (ph === 2 ? 0.2 : 0), 190, b.dmg * 0.55, 'claw', "Sir Johnathan's claws"); sfx.whip(); b.st = 'rest'; b.t2 = 0.6; }
    else if (b.nx === 'hairball') { var tt = 1, g = 520, tx = P.x; eshots.push({ x: b.x + b.face * 30, y: b.y - 50, vx: (tx - b.x) / tt, vy: (P.y - 10 - (b.y - 50) - 0.5 * g * tt * tt) / tt, g: g, life: 3, r: 8, dmg: b.dmg * 0.7, k: 'hairball', by: 'a hairball', end: 1 }); sfx.splat(); b.st = 'rest'; b.t2 = 0.6; }
    else if (b.nx === 'zoomies') { b.st = 'zoom'; b.n = ph === 2 ? 4 : 3; G.banner = 1; G.bannerTxt = 'THE ZOOMIES'; G.bannerSub = 'JUMP!'; }
    else { for (var s = 0; s < 3; s++) enemies.push(mkEnemy('toymouse', clamp(b.x + (s - 1) * 30, 40, W - 40), b.y, -1)); sfx.click(); b.st = 'idle'; b.cd = 1.3; } } }
  else if (b.st === 'zoom') { b.vx = b.face * 380; if (b.hitWall || b.x <= b.w / 2 + 18 || b.x >= W - b.w / 2 - 18) { b.face = -b.face; b.n--; G.shake = 5; sfx.land(); if (b.n <= 0) { b.st = 'rest'; b.t2 = 0.8; b.vx = 0; } } }
  else if (b.st === 'rest') { b.vx = 0; b.t2 -= dt; if (b.t2 <= 0) { b.st = 'idle'; b.cd = ph === 2 ? 0.7 : 1.1; } }
  if (bossMove(b, dt) && b.st === 'air') { b.st = 'rest'; b.t2 = 0.5; G.shake = 9; sfx.land(); bossWaves(b, 0.75, 'Sir Johnathan'); }
};
/* the King's sceptre sweeps a beam down the room after a warning line */
function kingStep(dt) {
  var s = G.kbSweep; if (!s) return; s.t -= dt;
  if (s.t <= 0 && !s.go) { s.go = 1; s.t = 1.2; G.shake = 6; sfx.fire(); }
  if (s.go) { s.x += s.dir * 330 * dt; if (P.state !== 'dead' && Math.abs(P.x - s.x) < 14 && !s.hit) { s.hit = 1; hurtP(s.dmg * 0.9, s.x, "King Blumhead's sceptre"); } if (s.t <= 0) G.kbSweep = null; }
}
function drawKing(cx) { var s = G.kbSweep; if (!s) return; var x = Math.round(s.x - cx), gy = 15 * T; if (!s.go) { if (Math.floor(G.t * 14) % 2) R(ctx, '#ffe36a', x - 1, 0, 2, gy); return; } ctx.save(); ctx.shadowColor = '#ffe36a'; ctx.shadowBlur = 16; R(ctx, '#c08aff', x - 9, 0, 18, gy); R(ctx, '#fff09a', x - 3, 0, 6, gy); ctx.restore(); }

/* a cherry bomb bursts where it lands; a hairball breaks into three */
function shotEnd(q) {
  if (q.k === 'cherry') { poof(q.x, q.y, 12, ['#ff2630', '#ffe36a', '#12040a']); sfx.stomp(); G.shake = Math.max(G.shake, 3); if (P.state !== 'dead' && Math.hypot(P.x - q.x, P.y - 12 - q.y) < 34) hurtP(q.dmg, q.x, 'a cherry bomb'); }
  else if (q.k === 'hairball') { sfx.splat(); for (var k = 0; k < 3; k++) eshots.push({ x: q.x, y: q.y - 10, vx: (k - 1) * 130, vy: -220, g: 600, life: 2, r: 4, dmg: q.dmg * 0.7, k: 'fluff', by: 'a bit of hairball', safe: 0.05 }); }
}
/* hits on a napping Sir Johnathan do double; the Dread Rune and the Blood Pact Rune */
var hurtE0 = hurtE;
hurtE = function (e, dmg, src) {
  if (!e || !e.alive) return;
  if (e.boss && e.napping) dmg *= 2;
  if (ST.dread && src !== 'burn' && src !== 'poison' && P.hp < ST.mhp * 0.5) dmg *= 1 + ST.dread;
  var r = hurtE0(e, dmg, src); if (!e.alive && !e.boss && ST.pact) healP(ST.pact, true); return r;
};
var calcStats0 = calcStats;
calcStats = function () { var s = calcStats0(); castleRuneStats(s); return s; };

/* ---------- winning a castle ---------- */
function castleWin(b) {
  var c = finalBoss(b.id); META.cwins = META.cwins || {}; META.cwins[c] = (META.cwins[c] || 0) + 1;
  castleAreas(c).forEach(function (a) { delete META.bosses[a]; }); // its seals mend for the next heir
  var first = META.cwins[c] === 1, nextC = c === 'blumc' ? 'grotto' : null;
  RUN.drops += Math.round((c === 'grotto' ? 6000 : 4000) * (1 + 0.3 * META.ng)); saveMeta();
  G.winT = 0; sfx.goal();
  var lines = c === 'blumc' ? [
    { who: 'King Blumhead', say: 'MY HOUSE... MY CROWN... YOU WIPED YOUR FEET ON ALL OF IT...', col: '#ff2630', fx: function () { G.shake = 10; } },
    { who: '', say: 'The crown rolls across the floor and stops at your feet.', dur: 2.6 }] : [
    { who: 'Sir Johnathan', say: 'Mrrrp.', col: '#9adf5a', fx: function () { G.shake = 4; } },
    { who: '', say: 'Sir Johnathan has had enough. He flops over, shows you his belly and starts to purr.', dur: 3 },
    { who: 'Greebo', say: 'There you are, you big lump! Who has been eating all the cream?', col: '#ffe36a' }];
  if (first && nextC) lines.push({ who: '', say: "Somewhere under Greebo's Gourmet Goonery, a trapdoor creaks open. GREEBO'S GROTTO is open at the gate.", dur: 3.2 });
  cutPlay({ focus: { x: b.x }, lines: lines, onEnd: function () { G.banner = 3.5; G.bannerTxt = b.d.name.toUpperCase() + ' FALLS'; G.bannerSub = CASTLES[c].name.toUpperCase() + ' IS BEATEN'; G.winT = 3.6; G.winKind = CASTLES[c].win; } });
}

/* ---------- the castles' own rooms ---------- */
function castleRoomStep(dt) {
  if (!L) return; kingStep(dt); casFxStep(dt); if (L.arena) return; var t = tierOf();
  L.ents.forEach(function (e) {
    if (e.k === 'pend') { // a pendulum axe swinging from the ceiling
      var a = Math.sin(G.t * 1.6 + e.ph) * 1.05; e.bx = e.x + Math.sin(a) * e.len; e.by = e.y + Math.cos(a) * e.len; e.a = a;
      if (P.state !== 'dead' && Math.hypot(P.x - e.bx, (P.y - P.h / 2) - e.by) < 14) hurtP(12 + 4 * t, e.bx, 'a pendulum axe');
    } else if (e.k === 'rod') { // a lightning rod: it crackles, then the sky hits it
      e.t = (e.t + dt) % 4.2; var was = e.strike; e.warn = e.t > 2.8 && e.t < 3.6; e.strike = e.t >= 3.6 && e.t < 3.9;
      if (e.strike && !was) { G.strike = 0.12; sfx.fire(); G.shake = Math.max(G.shake, 4); poof(e.x, e.y - 30, 10, ['#ffffff', '#c08aff']); }
      if (e.strike && !e.hitP && P.state !== 'dead' && Math.abs(P.x - e.x) < 16 && P.y <= e.y + 2) { e.hitP = 1; hurtP(12 + 4 * t, e.x, 'lightning'); } if (!e.strike) e.hitP = 0;
      if (e.strike) enemies.forEach(function (o) { if (o.alive && Math.abs(o.x - e.x) < 16 && !o.zapT) { o.zapT = 1; hurtE(o, 30, 'boom'); } });
    } else if (e.k === 'coffin') { // a coffin bursts open when you get close
      if (!e.open && Math.abs(P.x - e.x) < 70 && Math.abs(P.y - e.y) < 60) { e.open = 1; var rs = rsOf(G.roomKey); if (!rs.k['cf' + e.i]) { rs.k['cf' + e.i] = 1; var m = mkEnemy(e.who, e.x, e.y, 'cf' + e.i); m.safe = 0.4; enemies.push(m); } sfx.door(); G.shake = Math.max(G.shake, 4); poof(e.x, e.y - 20, 14, ['#3a2a30', '#9a7aff']); }
    } else if (e.k === 'vine') { // thorns burst up out of the ground
      e.t = (e.t + dt) % 3.6; e.warn = e.t > 2 && e.t < 2.6; e.up = e.t >= 2.6 && e.t < 3.4;
      if (e.warn && Math.random() < 0.3) parts.push({ x: e.x + (Math.random() - 0.5) * 14, y: e.y - 2, vx: (Math.random() - 0.5) * 30, vy: -60, life: 0.3, c: '#5a8a2a' });
      if (e.up && P.state !== 'dead' && Math.abs(P.x - e.x) < 12 && P.y > e.y - 3.2 * T) hurtP(10 + 4 * t, e.x, 'a thorn vine');
    } else if (e.k === 'belt') { // a conveyor belt carries whatever stands on it
      if (P.state !== 'dead' && P.onGround && Math.abs(P.y - e.y) < 2 && P.x > e.x0 && P.x < e.x1) { var nx = P.x + e.dir * 70 * dt; if (!boxSolid(nx - P.w / 2, P.y - P.h, nx + P.w / 2, P.y - 1)) P.x = nx; }
      enemies.forEach(function (o) { if (o.onGround && Math.abs(o.y - e.y) < 2 && o.x > e.x0 && o.x < e.x1) o.x += e.dir * 50 * dt; });
    } else if (e.k === 'yarnspot') { // giant balls of yarn roll across the floor: jump them, or bounce off the top
      L.yarns = L.yarns || []; e.t -= dt;
      if (e.t <= 0) { e.t = 3.6 + Math.random() * 1.6; var side = Math.random() < 0.5 ? -1 : 1; L.yarns.push({ x: side < 0 ? 20 : L.w * T - 20, y: 15 * T, vx: -side * (110 + 12 * t), r: 13, a: 0, col: Math.random() < 0.5 ? 0 : 1 }); sfx.roar(); }
    }
  });
  if (L.yarns) {
    L.yarns.forEach(function (y) {
      y.x += y.vx * dt; y.a += y.vx * dt / y.r;
      if (P.state !== 'dead' && Math.hypot(P.x - y.x, (P.y - P.h / 2) - (y.y - y.r)) < y.r + P.w / 2 + 2) {
        if (P.vy > 0 && P.y < y.y - y.r * 1.2) stompBounce(); else hurtP(10 + 4 * t, y.x, 'a ball of yarn');
      }
      enemies.forEach(function (o) { if (o.alive && !isFlyer(o.d) && Math.abs(o.x - y.x) < y.r + o.w / 2 && Math.abs(o.y - y.y) < 8) hurtE(o, 999, 'boom'); });
    });
    L.yarns = L.yarns.filter(function (y) { return y.x > -30 && y.x < L.w * T + 30; });
  }
}
function drawCastleRoom(cx, front) { // front: the swinging axes, yarn and boss effects go over the heir; the rest behind
  if (!L) return;
  if (front) { drawCastleFront(cx); return; }
  L.ents.forEach(function (e) {
    var x = Math.round(e.x - cx); if (x < -120 || x > VW + 120 || e.k === 'pend') return;
    if (e.k === 'rod') {
      R(ctx, '#12040a', x - 3, e.y - 40, 6, 40); R(ctx, '#7a7088', x - 2, e.y - 39, 4, 39); R(ctx, '#a8a0b8', x - 2, e.y - 39, 1, 39); R(ctx, '#12040a', x - 6, e.y - 46, 12, 8); R(ctx, e.warn || e.strike ? '#ffffff' : '#c08aff', x - 5, e.y - 45, 10, 6);
      if (e.warn) { if (Math.floor(G.t * 16) % 2) R(ctx, '#c08aff', x - 1, 0, 2, e.y - 46); for (var s = 0; s < 3; s++) R(ctx, '#ffe36a', x + Math.round((Math.random() - 0.5) * 16), e.y - 46 - Math.round(Math.random() * 10), 2, 2); }
      if (e.strike) { ctx.save(); ctx.shadowColor = '#c08aff'; ctx.shadowBlur = 16; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, 0); for (var yy = 16; yy < e.y - 40; yy += 16) ctx.lineTo(x + (Math.random() - 0.5) * 14, yy); ctx.lineTo(x, e.y - 40); ctx.stroke(); ctx.strokeStyle = '#c08aff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
    } else if (e.k === 'coffin') {
      R(ctx, '#12040a', x - 12, e.y - 34, 24, 34); R(ctx, '#3a2a30', x - 11, e.y - 33, 22, 33); R(ctx, '#5a4048', x - 11, e.y - 33, 22, 2); R(ctx, '#9a7aff', x - 1, e.y - 28, 2, 12); R(ctx, '#9a7aff', x - 5, e.y - 24, 10, 2);
      if (e.open) { R(ctx, '#060308', x - 9, e.y - 31, 18, 29); ctx.save(); ctx.translate(x - 12, e.y); ctx.rotate(-0.5); R(ctx, '#12040a', -24, -34, 24, 34); R(ctx, '#3a2a30', -23, -33, 22, 33); ctx.restore(); }
    } else if (e.k === 'vine') {
      if (e.warn) { R(ctx, '#3a2a10', x - 7, e.y - 2, 14, 2); R(ctx, '#5a8a2a', x - 3 + Math.round(Math.sin(G.t * 40) * 2), e.y - 5, 2, 3); R(ctx, '#5a8a2a', x + 2, e.y - 4, 2, 2); }
      else if (e.up) { var h = Math.round(3.2 * T * Math.min(1, (e.t - 2.6) / 0.12)); R(ctx, '#12040a', x - 6, e.y - h, 12, h); R(ctx, '#3a5a1a', x - 5, e.y - h, 10, h); R(ctx, '#5a8a2a', x - 5, e.y - h, 3, h); for (var k = 0; k < h; k += 7) { R(ctx, '#c8b898', x - 8, e.y - k - 4, 3, 2); R(ctx, '#c8b898', x + 5, e.y - k - 7, 3, 2); } R(ctx, '#c8b898', x - 1, e.y - h - 4, 3, 4); }
      else R(ctx, '#2a3a14', x - 5, e.y - 2, 10, 2);
    } else if (e.k === 'belt') {
      var x0 = Math.round(e.x0 - cx), w = Math.round(e.x1 - e.x0); R(ctx, '#12040a', x0 - 2, e.y - 3, w + 4, 8); R(ctx, '#3a3440', x0, e.y - 2, w, 6); R(ctx, '#6a6070', x0, e.y - 2, w, 1);
      for (var cx2 = 0; cx2 < w; cx2 += 10) { var off = ((G.t * 70 * e.dir) % 10 + 10) % 10, px2 = x0 + ((cx2 + off) % w); R(ctx, '#ffd080', px2, e.y, 4, 2); }
      R(ctx, '#12040a', x0 - 5, e.y - 4, 8, 8); R(ctx, '#a8a0b0', x0 - 4, e.y - 3, 6, 6); R(ctx, '#12040a', x0 + w - 3, e.y - 4, 8, 8); R(ctx, '#a8a0b0', x0 + w - 2, e.y - 3, 6, 6);
    }
  });
}
function drawCastleFront(cx) {
  L.ents.forEach(function (e) {
    var x = Math.round(e.x - cx); if (x < -220 || x > VW + 220) return;
    if (e.k === 'pend' && e.bx != null) {
      var bx = Math.round(e.bx - cx), by = Math.round(e.by);
      for (var i = 1; i < 10; i++) { var px = Math.round(x + (bx - x) * i / 10), py = Math.round(e.y + (by - e.y) * i / 10); R(ctx, '#12040a', px - 2, py - 2, 4, 4); R(ctx, '#7a7088', px - 1, py - 1, 2, 2); }
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-e.a); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(0, 2, 17, 0.15, Math.PI - 0.15); ctx.fill(); ctx.fillStyle = '#9a90aa'; ctx.beginPath(); ctx.arc(0, 1, 15, 0.2, Math.PI - 0.2); ctx.fill(); ctx.fillStyle = '#c08aff'; ctx.beginPath(); ctx.arc(0, 1, 15, 0.35, Math.PI - 0.35); ctx.arc(0, 1, 12, Math.PI - 0.35, 0.35, true); ctx.fill(); R(ctx, '#3a3448', -3, -6, 6, 8); ctx.restore();
      R(ctx, '#12040a', x - 4, e.y - 4, 8, 6); R(ctx, '#5a5068', x - 3, e.y - 3, 6, 4);
    }
  });
  (L.yarns || []).forEach(function (y) {
    var x = Math.round(y.x - cx), cy = Math.round(y.y - y.r), r = y.r, cols = y.col ? ['#ff6a9a', '#c4206a', '#ffc0d8'] : ['#9adfff', '#3a8ac8', '#d8f4ff'];
    ctx.save(); ctx.translate(x, cy); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(0, 0, r + 1.5, 0, 6.28); ctx.fill(); ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.fill();
    ctx.rotate(y.a); ctx.strokeStyle = cols[0]; ctx.lineWidth = 1.5; for (var k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(0, 0, r - 2, Math.abs(k) * 3 + 2, k * 0.5, 0, 6.28); ctx.stroke(); }
    ctx.rotate(-y.a); ctx.fillStyle = cols[2]; ctx.fillRect(-r * 0.5, -r * 0.6, 3, 2); ctx.restore();
    ctx.strokeStyle = cols[0]; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - Math.sign(y.vx) * r, y.y - 2); ctx.lineTo(x - Math.sign(y.vx) * (r + 14), y.y - 1); ctx.stroke();
  });
  drawKing(cx); drawCasFx(cx);
}

/* ---------- the castles' songs (written out like the rest: eighth notes, one chord a bar) ---------- */
(function (S) {
  S.bkeep = { bpm: 126, beats: 4, vol: 0.9, wet: 0.4, lead: 'organlead', harm: 1, bass: 'drive', acc: 'organ', drums: 'rock', chords: 'Cm Cm Ab G Cm Fm G G',
    mel: 'c5 - eb5 - g5 - c6 - | b5 - c6 - g5 - eb5 - | ab5 - g5 - f5 - eb5 - | d5 - - - g4 - b4 d5 | c5 - g5 - c6 - eb6 - | d6 c6 ab5 - f5 - c5 - | b4 - d5 - g5 - b5 - | d6 - - - g5 - - -' };
  S.bspire = { bpm: 150, beats: 4, vol: 0.88, wet: 0.42, lead: 'fm', fmbass: 1, bass: 'gallop', acc: 'arp16', drums: 'fast', chords: 'F#m D E C# F#m D Bm C#',
    mel: 'f#5 - a5 - c#6 - f#6 - | e6 d6 c#6 d6 a5 - f#5 - | g#5 - b5 - e6 - d6 c#6 | f5 - - - c#5 - g#5 - | a5 - c#6 - f#6 - e6 f#6 | d6 - a5 - f#5 - d5 - | d5 - f#5 - b5 - d6 - | c#6 - b5 - g#5 - f5 -' };
  S.bcrypt = { bpm: 76, beats: 4, vol: 1, wet: 0.65, lead: 'soft', bass: 'drone', acc: 'bell', drums: 'slow', chords: 'Gm Gm Eb D Gm Cm D D',
    mel: 'g4 - - - bb4 - d5 - | f#5 - - g5 - - d5 - | eb5 - - - g5 - bb5 - | a5 - - - f#5 - - - | g5 - - - d6 - - - | c6 - bb5 - g5 - eb5 - | d5 - f#5 - a5 - c6 - | bb5 - a5 - f#5 - . .' };
  S.bgarden = { bpm: 112, beats: 4, vol: 0.9, wet: 0.45, lead: 'pulse', bass: 'walk', acc: 'bell', drums: 'tribal', chords: 'Am Bb Am G Am Bb F E',
    mel: 'a4 - c5 - e5 - a5 - | bb5 - a5 - f5 - d5 - | e5 - c5 - a4 - e5 - | d5 - b4 - g4 - b4 - | a4 . a5 . e5 . c5 . | d5 - f5 - bb5 - a5 - | a5 - f5 - c5 - f5 - | g#5 - - - e5 - - -' };
  S.gkitchen = { bpm: 138, beats: 4, vol: 0.85, wet: 0.28, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'F Dm Bb C F A Bb C',
    mel: 'c5 - f5 - a5 - g5 f5 | d5 - f5 - a5 - - - | bb5 - a5 - g5 - f5 - | e5 - g5 - c6 - - - | a5 - c6 - f6 - e6 d6 | c#6 - a5 - e5 - c#5 - | d5 - f5 - bb5 - d6 - | c6 - bb5 - g5 - e5 -',
    counter: 'a4 - - - c5 - - - | f4 - - - a4 - - - | d4 - - - f4 - - - | e4 - - - g4 - - - | c5 - - - a4 - - - | a4 - - - e4 - - - | f4 - - - d4 - - - | e4 - - - g4 - - -' };
  S.gtower = { bpm: 168, beats: 3, vol: 0.85, wet: 0.32, lead: 'xylo', bass: 'waltz', acc: 'stabs', drums: 'waltz', chords: 'G G D D C G D G',
    mel: 'd5 - g5 - b5 - | a5 g5 f#5 - g5 - | a5 - f#5 - d5 - | e5 f#5 a5 - - - | c6 - b5 - a5 - | g5 - d5 - b4 - | c5 - e5 - f#5 - | g5 - - - - -' };
  S.gcellar = { bpm: 108, beats: 4, vol: 0.9, wet: 0.5, lead: 'fm', fmbass: 1, bass: 'walk', acc: 'bell', drums: 'shuffle', chords: 'Dm Dm Gm A Dm Bb Gm A',
    mel: 'd5 - - f5 a5 - g5 f5 | d5 - - - a4 - - - | g4 - bb4 - d5 - f5 - | e5 - c#5 - a4 - - - | f5 - a5 - d6 - c6 a5 | bb5 - f5 - d5 - bb4 - | g4 - bb4 d5 g5 - f5 e5 | c#5 - e5 - a5 - - -' };
  S.gfair = { bpm: 146, beats: 4, vol: 0.85, wet: 0.3, lead: 'calliope', bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'C Am F G C E F G',
    mel: 'e5 - g5 - c6 - e6 - | c6 - a5 - e5 - a5 - | f5 - a5 - c6 - a5 - | b5 - d6 - g6 - - - | e6 - d6 c6 g5 - c6 - | g#5 - b5 - e6 - d6 - | c6 - a5 - f5 - a5 - | g5 - b5 - d6 - - -' };
  S.bexecu = { bpm: 150, beats: 4, vol: 0.9, wet: 0.24, lead: 'fm', harm: 1, fmbass: 1, bass: 'pulse16', acc: 'stabs', drums: 'boss', chords: 'Cm Cm Ab G Cm Cm Db G',
    mel: 'c5 . c5 . eb5 . g5 . | f#5 g5 eb5 - c5 - - - | ab5 - c6 - eb6 - c6 ab5 | g5 - b5 - d6 - - - | c6 . c6 . bb5 . g5 eb5 | f5 g5 eb5 f5 c5 - - - | db6 - ab5 - f5 - db5 - | b4 - d5 - g5 - b5 -' };
  S.bstormwing = { bpm: 172, beats: 4, vol: 0.88, wet: 0.24, lead: 'pulse', harm: 1, bass: 'gallop', acc: 'arp16', drums: 'fast', chords: 'Am F G E Am F Dm E',
    mel: 'a5 - e5 a5 c6 - b5 a5 | f5 - a5 - c6 - - - | g5 - d6 - b5 - g5 - | g#5 - b5 - e6 - - - | a6 - e6 - c6 - a5 - | f6 - c6 - a5 - f5 - | d6 - f6 - a6 - f6 d6 | e6 - d6 - b5 - g#5 -' };
  S.bqueen = { bpm: 132, beats: 4, vol: 0.92, wet: 0.42, lead: 'organlead', harm: 1, bass: 'drive', acc: 'organ', drums: 'boss', chords: 'Dm A Bb A Gm Dm E A',
    mel: 'd5 - a5 - f5 - d6 - | c#6 - - - e5 - a5 - | bb5 - - - d6 - f6 - | e6 - c#6 - a5 - - - | g5 - bb5 - d6 - g6 - | f6 - d6 - a5 - f5 - | g#5 - b5 - e6 - d6 - | c#6 - - - a5 - - -' };
  S.brotmother = { bpm: 120, beats: 4, vol: 0.9, wet: 0.4, lead: 'fm', fmbass: 1, bass: 'walk', acc: 'bell', drums: 'tribal', chords: 'Em F Em D Em F G F',
    mel: 'e5 - - g5 f5 - e5 - | f5 - a5 - c6 - - - | b5 - g5 - e5 - b4 - | d5 - f#5 - a5 - - - | e5 g5 b5 e6 - - d6 - | c6 - a5 - f5 - - - | g5 - b5 - d6 - b5 g5 | a5 - f5 - c5 - - -' };
  S.bkingblum = { bpm: 160, beats: 4, vol: 0.92, wet: 0.3, lead: 'organlead', harm: 1, bass: 'drive', acc: 'organ', drums: 'boss', chords: 'Bm Bm G F# Bm Em F# F# G A Bm F# G Em F# Bm',
    mel: 'b4 - d5 - f#5 - b5 - | a#5 b5 a#5 f#5 d5 - b4 - | g5 - b5 - d6 - b5 g5 | f#5 - a#5 - c#6 - - - | b5 - d6 - f#6 - e6 d6 | e6 - g5 - b5 - e6 - | c#6 - a#5 - f#5 - c#5 - | f#5 - - - a#5 - - - | ' +
         'g5 - - b5 d6 - - g6 | e6 - c#6 - a5 - e5 - | f#5 - b5 - d6 - f#6 - | e6 - c#6 - a#5 - f#5 - | g5 - b5 - d6 - g6 - | e6 - b5 - g5 - e5 - | a#5 - c#6 - e6 - f#6 - | b5 - - - - - - -' };
  S.bcake = { bpm: 156, beats: 4, vol: 0.85, wet: 0.3, lead: 'calliope', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'Bb Gm Eb F Bb D Eb F',
    mel: 'f5 - bb5 - d6 - bb5 - | g5 - bb5 - d6 - g6 - | eb6 - - g5 bb5 - eb6 - | c6 - a5 - f5 - - - | d6 . d6 . c6 . bb5 f5 | f#5 - a5 - d6 - c6 - | bb5 - g5 - eb5 - g5 - | a5 - c6 - f6 - - -' };
  S.bclockmouse = { bpm: 176, beats: 4, vol: 0.85, wet: 0.25, lead: 'xylo', bass: 'pulse16', acc: 'arp16', drums: 'fast', chords: 'Em B Em B C D B Em',
    mel: 'e5 . e5 . b5 . e5 . | d#5 . f#5 . b5 . a5 . | g5 a5 b5 . e6 . b5 . | a5 g5 f#5 . d#5 . b4 . | c5 - e5 - g5 - c6 - | d6 - c6 - a5 - f#5 - | d#5 f#5 b5 d#6 f#6 - - - | e6 - b5 - g5 - e5 -' };
  S.bkraken = { bpm: 112, beats: 4, vol: 0.95, wet: 0.5, lead: 'fm', harm: 1, fmbass: 1, bass: 'drone', acc: 'organ', drums: 'industrial', chords: 'C#m C#m A G# C#m E A G#',
    mel: 'c#5 - - - g#5 - - - | e5 - c#5 - g#4 - - - | a4 - c#5 - e5 - a5 - | g#5 - - - c5 - d#5 - | c#6 - b5 - g#5 - e5 - | b5 - g#5 - e5 - b4 - | a4 - e5 - a5 - c#6 - | c6 - - - g#5 - - -' };
  S.bwaspqueen = { bpm: 184, beats: 4, vol: 0.86, wet: 0.22, lead: 'pulse', harm: 1, bass: 'pulse16', acc: 'arp16', drums: 'fast', chords: 'Dm Dm Bb A Dm Dm Gm A',
    mel: 'd5 c#5 d5 c#5 d5 - f5 - | a5 g#5 a5 g#5 a5 - d6 - | bb5 a5 bb5 a5 f5 - d5 - | e5 - c#5 - a4 - - - | d6 c#6 d6 - a5 g#5 a5 - | f5 e5 f5 - d5 - - - | g5 - bb5 - d6 - g6 - | e6 - c#6 - a5 - - -' };
  S.bsirj = { bpm: 164, beats: 4, vol: 0.9, wet: 0.26, lead: 'fm', harm: 1, fmbass: 1, bass: 'drive', acc: 'arp16', drums: 'boss', chords: 'Em C G D Em C D B C D G Em C D B Em',
    mel: 'e5 - g5 - b5 - e6 - | c6 - e6 - g6 - e6 c6 | b5 - d6 - g6 - - - | f#6 - d6 - a5 - f#5 - | g5 - e5 - b4 - e5 g5 | c6 - g5 - e5 - c5 - | d5 - f#5 - a5 - d6 - | d#6 - - - b5 - f#5 - | ' +
         'e6 - - g6 - - e6 c6 | f#6 - - a6 - - f#6 d6 | g6 - d6 - b5 - g5 - | b5 - e6 - g6 - b6 - | a6 - g6 - e6 - c6 - | a5 - d6 - f#6 - a6 - | f#6 - d#6 - b5 - f#5 - | e6 - - - - - - -' };
})(music.songs);
var CASTLEJUKE = [['bkeep', 'The Black Keep'], ['bspire', 'The Black Spire'], ['bcrypt', 'The Crypt of Blum'], ['bgarden', 'The Rotten Garden'], ['bexecu', 'The Blum Executioner'], ['bstormwing', 'Stormwing'], ['bqueen', 'The Pale Queen'], ['brotmother', 'The Rot Mother'], ['bkingblum', 'King Blumhead'],
  ['gkitchen', "Greebo's Kitchen"], ['gtower', 'The Scratching Tower'], ['gcellar', 'The Cream Cellar'], ['gfair', 'The Picnic'], ['bcake', 'The Great Cake'], ['bclockmouse', 'The Clockwork Mouse'], ['bkraken', 'The Cream Kraken'], ['bwaspqueen', 'The Wasp Queen'], ['bsirj', 'Sir Johnathan']];
