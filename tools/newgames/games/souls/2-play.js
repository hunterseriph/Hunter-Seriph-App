/* ---------- who lives here ---------- */
var FOES = {
  g: { id: 'gimp', rig: 'gimp', hp: 60, dmg: 16, spd: 3.2, reach: 1.5, wind: 0.45, poise: 12, loads: 40, swing: 'punch' },
  b: { id: 'butcher', rig: 'butcher', hp: 140, dmg: 30, spd: 2.0, reach: 2.0, wind: 0.85, poise: 45, loads: 110, swing: 'swing', held: 'weapon' },
  p: { id: 'pusher', rig: 'pusher', hp: 50, dmg: 14, spd: 2.4, reach: 11, wind: 0.8, poise: 8, loads: 55, swing: 'throw', held: 'syringe' },
  k: { id: 'clown', rig: 'clown', hp: 70, dmg: 18, spd: 2.8, reach: 1.6, wind: 0.55, poise: 15, loads: 60, swing: 'punch' },
  s: { id: 'strongman', rig: 'strongman', hp: 180, dmg: 34, spd: 1.8, reach: 2.0, wind: 1.0, poise: 70, loads: 150, swing: 'slam' },
  a: { id: 'acrobat', rig: 'acrobat', hp: 60, dmg: 18, spd: 4.0, reach: 1.6, wind: 0.4, poise: 6, loads: 70, swing: 'punch', leap: 1 }
};
FOES.gimp = FOES.g; FOES.butcher = FOES.b; FOES.pusher = FOES.p; FOES.clown = FOES.k; FOES.strongman = FOES.s; FOES.acrobat = FOES.a;
var BOSSES = {
  muckies: { n: 'MAMA MUCKIES', rig: 'muckies', sc: 1.7, hp: 900, dmg: 32, spd: 3.2, moves: ['combo', 'slam', 'charge', 'swing', 'leap'], loads: 1500, song: 'bpig' },
  bride: { n: 'THE GRAVEDIGGER BRIDE', rig: 'bride', sc: 1.7, hp: 1200, dmg: 36, spd: 3.4, moves: ['swing', 'throw', 'combo', 'leap', 'slam'], loads: 2500, song: 'bmoon' },
  stag: { n: 'THE STITCHED STAG', rig: 'stag', sc: 1.8, hp: 1600, dmg: 42, spd: 3.6, moves: ['charge', 'combo', 'slam', 'charge', 'leap'], loads: 4000, song: 'bbeast' },
  tb: { n: 'TB, THE PILL KING', rig: 'tbmad', sc: 2.1, hp: 2400, dmg: 46, spd: 3.6, moves: ['combo', 'throw', 'slam', 'charge', 'leap', 'swing'], loads: 0, song: 'blum' }
};
var WEAPONS = {
  sausage: { n: "Amy's Sausage", dmg: 24, heavy: 50, spd: 0.5, reach: 2.1, sta: 16, mesh: 'sausage', d: 'Quick and meaty. Where it all starts.' },
  bat: { n: 'Baseball Bat', dmg: 32, heavy: 66, spd: 0.58, reach: 2.3, sta: 20, mesh: 'bat', d: 'Knocks them silly.' },
  axe: { n: 'Fireman Axe', dmg: 44, heavy: 96, spd: 0.75, reach: 2.4, sta: 28, mesh: 'fireaxe', d: 'Slow. Splits shields and skulls.' },
  hammer: { n: 'Hammer', dmg: 36, heavy: 80, spd: 0.6, reach: 2.0, sta: 22, mesh: 'hammer', d: 'Heavy hits break their stance.' },
  knife: { n: 'Knife', dmg: 18, heavy: 40, spd: 0.34, reach: 1.7, sta: 10, mesh: 'knife', d: 'Fast and cheap on stamina.' }
};
var RINGS = { pie: { n: "Greebo's Pie Ring", d: 'Stamina comes back faster.' }, blood: { n: 'Bloodmoon Ring', d: 'Every hit you land heals a little.' }, condom: { n: 'The Condom Ring', d: 'Guarding costs far less stamina.' }, tb: { n: "TB's Pill Ring", d: 'More damage, less health. Typical TB.' } };
var SHOP = [{ k: 'shard', n: 'Cream Shard', d: 'One more swig in your Cum Flask.', cost: 800, max: 3 }, { k: 'w_knife', n: 'Knife', d: WEAPONS.knife.d, cost: 900, max: 1 }, { k: 'r_tb', n: RINGS.tb.n, d: RINGS.tb.d, cost: 1500, max: 1 }, { k: 'r_condom', n: RINGS.condom.n, d: RINGS.condom.d, cost: 2000, max: 1 }];
var CHESTS = [['w', 'bat'], ['r', 'pie'], ['shard'], ['w', 'hammer'], ['r', 'blood'], ['w', 'axe'], ['loads']];
var TBQ = ['Fuck muck', 'suck your own and fuck your own', 'Old geezer, Prick teaser', 'you shoot real hard huh?', 'holy shit!', "you'll make a good sissy", 'Cock rinse', "where the fuck do you think you're goin? Prick!"];

/* ---------- the save ---------- */
var SV = KIT.load('dk3-save', null);
function freshSave() { return { area: 0, candle: 'ruins0', lit: { ruins0: 1 }, loads: 0, lvl: 1, vig: 0, end: 0, str: 0, shards: 0, wpns: ['sausage'], wpn: 'sausage', rings: [], ring: null, chests: {}, bosses: {}, doors: {}, stain: null, deaths: 0, bought: {}, won: 0 }; }
if (!SV) SV = freshSave();
function persist() { KIT.save('dk3-save', SV); }
function maxHp() { return Math.round((100 + SV.vig * 12) * (SV.ring === 'tb' ? 0.8 : 1)); }
function maxSta() { return 80 + SV.end * 8; }
function flaskMax() { return 3 + SV.shards; }
function dmgK() { return (1 + SV.str * 0.07) * (SV.ring === 'tb' ? 1.3 : 1) * (1 + (SV.won || 0) * 0); }
function lvlCost() { return Math.round(300 + 90 * Math.pow(SV.lvl, 1.35)); }
function candleArea(id) { for (var a = 0; a < AREAS.length; a++) if (id.indexOf(AREAS[a].id) === 0) return a; return 0; }

/* ---------- the run ---------- */
var G = { mode: 'title', t: 0 }, P = null, FOE = [], SHOTS = [], FX = [], BOSS = null, MESH = null, CAMY = 0, LOCK = null, POP = [];
function enterArea(ai, candleId) {
  if (!R3.ok) { G.mode = 'nogl'; return; }
  buildAtlas(); buildRigs(); ownMeshes(); moreMeshes(); G.piv = null;
  WORLD = parseArea(ai); SV.area = ai; if (MESH) MESH.free(); MESH = buildMesh(); KIT.closeMenu(); G.mode = 'play';
  var c = WORLD.things.filter(function (t) { return t.k === 'candle' && t.id === candleId; })[0] || WORLD.things.filter(function (t) { return t.k === 'start'; })[0];
  P = { x: tx(c.i) + 1.1, z: tx(c.j), y: th(c.i, c.j), vy: 0, a: Math.PI, hp: maxHp(), sta: maxSta(), flask: flaskMax(), st: 'idle', t: 0, inv: 0, atk: null, guard: 0, hurtT: 0, ph: 0, spd: 0, roll: 0 };
  var bestA = P.a, bestN = -1; for (var q = 0; q < 8; q++) { var aa = q / 8 * 6.283, n = 0; while (n < 12 && tk(tileOf(P.x + Math.sin(aa) * (n + 1) * 1.5), tileOf(P.z + Math.cos(aa) * (n + 1) * 1.5)) === 0) n++; if (n > bestN) { bestN = n; bestA = aa; } } P.a = bestA; // face the open way
  CAMY = P.a; spawnFoes(); BOSS = null; LOCK = null; SHOTS = []; FX = []; POP = [];
  G.fogShut = !SV.bosses[AREAS[ai].boss]; G.inArena = false; G.banner = { t: 3.5, s: AREAS[ai].name }; music.play(AREAS[ai].song); persist();
}
function spawnFoes() { FOE = []; WORLD.things.forEach(function (t) { if (t.k === 'foe') FOE.push(mkFoe(t.f, tx(t.i), tx(t.j))); }); }
function mkFoe(id, x, z) { var d = FOES[id]; return { d: d, x: x, z: z, y: floorAt(x, z), hx: x, hz: z, a: 0, hp: d.hp, poise: d.poise, st: 'idle', t: 0, cd: 0, hurt: 0, ph: Math.random() * 6, spd: 0 }; }
var OWN = null;
function ownMeshes() { if (OWN) return; OWN = {}; var m = new R3.Mesh(); var segs = 8;
  for (var s = 0; s < segs; s++) { var a0 = s / segs * 6.283, a1 = (s + 1) / segs * 6.283; for (var y = 0; y < 3; y++) { var y0 = y * 0.24, y1 = y0 + 0.24, r0 = y === 2 ? 0.045 : 0.06, r1 = y === 2 ? 0.02 : 0.06; m.quad([Math.cos(a0) * r0, y0, Math.sin(a0) * r0], [Math.cos(a1) * r0, y0, Math.sin(a1) * r0], [Math.cos(a1) * r1, y1, Math.sin(a1) * r1], [Math.cos(a0) * r1, y1, Math.sin(a0) * r1], [0, 1, 1, 1, 1, 0, 0, 0], TL('sausage'), [0.5, 0.5, 0.5], [Math.cos(a0), 0, Math.sin(a0)]); } }
  OWN.sausage = m.upload();
  var f = new R3.Mesh(); f.quad([-0.5, 0, 0], [0.5, 0, 0], [0.5, 1, 0], [-0.5, 1, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL('flame'), [0.5, 0.5, 0.5], [0, 0, 1], 2); OWN.flame = f.upload();
  var fw = new R3.Mesh(); fw.quad([0, 0, 0], [TSZ, 0, 0], [TSZ, 4, 0], [0, 4, 0], [0, 2, 1, 2, 1, 0, 0, 0], TL('fogwall'), [0.5, 0.5, 0.5], [0, 0, 1], 1.5); OWN.fog = fw.upload();
  var dr = new R3.Mesh(); bx3(dr, -TSZ / 2, 0, -0.15, TSZ / 2, 3.2, 0.15, TL('door'), 1); OWN.door = dr.upload();
  var ch = new R3.Mesh(); bx3(ch, -0.45, 0, -0.3, 0.45, 0.5, 0.3, TL('crate'), 1); bx3(ch, -0.47, 0.5, -0.32, 0.47, 0.62, 0.32, TL('steel'), 0.8); OWN.chest = ch.upload();
  var cho = new R3.Mesh(); bx3(cho, -0.45, 0, -0.3, 0.45, 0.5, 0.3, TL('crate'), 0.7); OWN.chestOpen = cho.upload();
}
/* ---------- Cumhead ---------- */
function camFwd() { return [Math.sin(CAMY), Math.cos(CAMY)]; }
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0), W0 = WEAPONS[SV.wpn]; p.t += dt; p.inv = Math.max(0, p.inv - dt); p.hurtT = Math.max(0, p.hurtT - dt);
  var f = camFwd(), r = [-f[1], f[0]], wx = (-mv.y) * f[0] + mv.x * -r[0], wz = (-mv.y) * f[1] + mv.x * -r[1], wl = Math.hypot(wx, wz);
  var busy = p.atk || p.st === 'roll' || p.hurtT > 0.3 || p.st === 'drink' || p.fall;
  p.guard = !busy && KIT.held('lb') && p.sta > 0;
  var sprint = !busy && KIT.held('a') && wl > 0.3 && p.holdA > 0.25 && p.sta > 0; p.holdA = KIT.held('a') ? (p.holdA || 0) + dt : 0;
  if (!busy && !p.guard && !sprint) p.sta = Math.min(maxSta(), p.sta + dt * (SV.ring === 'pie' ? 48 : 34)); else if (p.guard) p.sta = Math.min(maxSta(), p.sta + dt * 8);
  if (sprint) p.sta -= dt * 14;
  var vx = 0, vz = 0;
  if (p.st === 'roll') { p.roll -= dt; vx = Math.sin(p.a) * 6.4; vz = Math.cos(p.a) * 6.4; if (p.roll <= 0) p.st = 'idle'; }
  else if (p.st === 'drink') { p.drinkT -= dt; if (p.drinkT < 0.5 && !p.drank) { p.drank = 1; p.hp = Math.min(maxHp(), p.hp + Math.round(maxHp() * 0.45)); sfx.play('pour'); FX.push({ k: 'heal', x: p.x, y: p.y + 1, z: p.z, t: 0.8 }); } if (p.drinkT <= 0) p.st = 'idle'; if (wl > 0.2) { vx = wx / wl * 1.1; vz = wz / wl * 1.1; } }
  else if (p.atk) { var A = p.atk; A.t += dt; if (A.t < A.wind) { vx = Math.sin(p.a) * 1.2; vz = Math.cos(p.a) * 1.2; } if (!A.hit && A.t >= A.wind) { A.hit = 1; swing(A); } if (A.t >= A.len) { p.atk = null; if (A.next) startAtk(A.next === 'h', A.combo + 1); } else if ((KIT.pressed('x') || KIT.pressed('y')) && A.t > A.wind) A.next = KIT.pressed('y') ? 'h' : 'l'; }
  else if (!p.fall) {
    var spd = p.guard ? 1.6 : sprint ? 6.2 : 3.9;
    if (wl > 0.2) { vx = wx / Math.max(1, wl) * spd; vz = wz / Math.max(1, wl) * spd; }
    if (LOCK && LOCK.hp > 0) p.a = Math.atan2(LOCK.x - p.x, LOCK.z - p.z); else if (wl > 0.2) p.a = turnTo(p.a, Math.atan2(wx, wz), dt * 12);
    if (KIT.pressed('a')) p.tapA = 1; if (!KIT.held('a') && p.tapA) { p.tapA = 0; if (p.lastHold < 0.25 && p.sta > 6 && !G.prompt) { p.st = 'roll'; p.roll = 0.42; p.inv = 0.3; p.sta -= 18; if (wl > 0.2) p.a = Math.atan2(wx, wz); sfx.play('step'); } else if (G.prompt && G.act) { G.act(); } }
    if (KIT.held('a')) p.lastHold = p.holdA; else if (!p.tapA) p.lastHold = 0;
    if (KIT.pressed('x') && p.sta > 4) startAtk(false, 0); else if (KIT.pressed('y') && p.sta > 4) startAtk(true, 0);
    if (KIT.pressed('b') && p.flask > 0 && p.hp < maxHp()) { p.flask--; p.st = 'drink'; p.drinkT = 1.1; p.drank = 0; }
  }
  if (p.hurtT > 0.3) { vx = p.kx || 0; vz = p.kz || 0; }
  var ox = p.x, oz = p.z; p.x += vx * dt; p.z += vz * dt; collide(p, 0.35, 'p'); p.spd = Math.hypot(p.x - ox, p.z - oz) / dt; p.ph += p.spd * dt * 2.1;
  // standing, stepping, falling
  var fh = floorAt(p.x, p.z);
  if (!p.fall && fh < p.y - 0.6) { p.fall = 1; p.vy = 0; }
  if (p.fall) { p.vy -= 22 * dt; p.y += p.vy * dt; if (p.y <= fh) { var drop = p.fy0 - fh; p.y = fh; p.fall = 0; if (drop > 4) { p.hp -= (drop - 4) * 14; sfx.play('land'); } } if (p.y < -12) p.hp = 0; } else { p.fy0 = p.y; p.y += (fh - p.y) * Math.min(1, dt * 18); }
  if (KIT.pressed('rb')) toggleLock();
  if (LOCK && (LOCK.hp <= 0 || Math.hypot(LOCK.x - p.x, LOCK.z - p.z) > 18)) LOCK = null;
  // things in reach
  G.prompt = null; G.act = null;
  WORLD.things.forEach(function (t) { var d = Math.hypot(tx(t.i) - p.x, tx(t.j) - p.z);
    if (t.k === 'candle' && d < 1.8) { G.prompt = SV.lit[t.id] ? 'A  REST AT THE CANDLE' : 'A  LIGHT THE CANDLE'; G.act = function () { if (!SV.lit[t.id]) G.banner = { t: 3, s: 'CANDLE LIT' }; rest(t); }; }
    else if (t.k === 'chest' && !SV.chests[t.id] && d < 1.6) { G.prompt = 'A  OPEN'; G.act = function () { openChest(t); }; }
    else if (t.k === 'door' && !SV.doors[t.id] && d < 1.8) { var side = p.z < tx(t.j) ? -1 : 1; if (side === t.from) { G.prompt = 'A  OPEN THE DOOR'; G.act = function () { SV.doors[t.id] = 1; persist(); sfx.play('door'); G.banner = { t: 2.5, s: 'A SHORTCUT' }; }; } else G.prompt = 'IT OPENS FROM THE OTHER SIDE'; }
    else if (t.k === 'exit' && d < 1.8 && SV.bosses[WORLD.A.boss]) { G.prompt = 'A  GO ON'; G.act = function () { if (SV.area < AREAS.length - 1) { var nid = AREAS[SV.area + 1].id + '0'; SV.lit[nid] = 1; SV.candle = nid; enterArea(SV.area + 1, nid); } else ending(); }; }
    else if (t.k === 'fog' && G.fogShut && !G.inArena && d < 1.6) { G.prompt = 'A  WALK THROUGH THE FOG'; G.act = function () { G.inArena = true; p.z -= 2.4; var b = WORLD.things.filter(function (q) { return q.k === 'boss'; })[0]; BOSS = mkBoss(b); LOCK = BOSS; music.play(BOSS.B.song); G.banner = { t: 3, s: BOSS.B.n }; }; }
  });
  var stn = SV.stain; if (stn && stn.area === SV.area && Math.hypot(stn.x - p.x, stn.z - p.z) < 1.2) { SV.loads += stn.loads; POP.push({ x: p.x, y: p.y + 2.2, z: p.z, s: '+' + stn.loads + ' LOADS', t: 1.6, col: '#ffe36a' }); SV.stain = null; persist(); sfx.play('power'); }
}
function turnTo(a, b, k) { var d = Math.atan2(Math.sin(b - a), Math.cos(b - a)); return a + Math.max(-k, Math.min(k, d)); }
function toggleLock() { if (LOCK) { LOCK = null; return; } var best = null, bs = 1e9, f = camFwd(); FOE.concat(BOSS ? [BOSS] : []).forEach(function (e) { if (e.hp <= 0) return; var dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d > 16 || !lineClear(P.x, P.z, e.x, e.z)) return; var dot = (dx * f[0] + dz * f[1]) / d, s = d - dot * 8; if (s < bs) { bs = s; best = e; } }); LOCK = best; if (best) sfx.play('tick'); }
function startAtk(heavy, combo) { var W0 = WEAPONS[SV.wpn], p = P; if (p.sta <= 0) return; p.sta -= W0.sta * (heavy ? 1.7 : 1); p.atk = { heavy: heavy, t: 0, wind: W0.spd * (heavy ? 0.75 : 0.38), len: W0.spd * (heavy ? 1.7 : 1), hit: 0, combo: combo || 0, side: (combo || 0) % 2 }; }
function swing(A) {
  var W0 = WEAPONS[SV.wpn], p = P, reach = W0.reach * (A.heavy ? 1.12 : 1), dmg = (A.heavy ? W0.heavy : W0.dmg) * dmgK() * (A.combo >= 2 ? 1.15 : 1), hitAny = false; sfx.tone('triangle', 260, 110, 0.12, 0.05);
  FOE.concat(BOSS && BOSS.hp > 0 ? [BOSS] : []).forEach(function (e) { if (e.hp <= 0) return; var dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz), rr = e.boss ? 1.1 * e.B.sc * 0.6 : 0.4; if (d > reach + rr || Math.abs(e.y - p.y) > 1.6) return; var ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - p.a), Math.cos(Math.atan2(dx, dz) - p.a))); if (ang > 1.1 && d > 0.8) return;
    if (e.boss) hurtBoss(dmg, A.heavy); else hurtFoe(e, dmg, A.heavy); hitAny = true; });
  if (hitAny) { G.hs = 0.06; if (SV.ring === 'blood') p.hp = Math.min(maxHp(), p.hp + 4); }
}
function hurtFoe(f, dmg, heavy) { f.hp -= dmg; f.hurt = 0.15; f.poise -= heavy ? 30 : 12; blood(f.x, f.y + 1.2, f.z, 6); sfx.play('hit'); POP.push({ x: f.x, y: f.y + 2.1, z: f.z, s: String(Math.round(dmg)), t: 0.8, col: '#f1e7d0' });
  if (f.poise <= 0 && f.hp > 0) { f.st = 'stagger'; f.t = 0; f.poise = f.d.poise; }
  var a = Math.atan2(f.x - P.x, f.z - P.z); f.x += Math.sin(a) * (heavy ? 0.5 : 0.2); f.z += Math.cos(a) * (heavy ? 0.5 : 0.2); collide(f, 0.4, 'f');
  if (f.st === 'idle' || f.st === 'walk') f.st = 'chase';
  if (f.hp <= 0) { f.st = 'dead'; f.t = 0; SV.loads += f.d.loads; POP.push({ x: f.x, y: f.y + 2.5, z: f.z, s: '+' + f.d.loads, t: 1.2, col: '#ffe36a' }); blood(f.x, f.y + 1, f.z, 14); if (LOCK === f) LOCK = null; } }
function hurtPlayer(dmg, fx, fz, unblock) {
  var p = P; if (p.inv > 0 || p.hp <= 0) return; var a = Math.atan2(fx - p.x, fz - p.z), facing = Math.abs(Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a))) < 1.2;
  if (p.guard && facing && !unblock) { p.sta -= dmg * (SV.ring === 'condom' ? 0.55 : 1.25); sfx.play('block'); FX.push({ k: 'spark', x: p.x + Math.sin(p.a) * 0.6, y: p.y + 1.3, z: p.z + Math.cos(p.a) * 0.6, t: 0.25 }); p.x -= Math.sin(a) * 0.3; p.z -= Math.cos(a) * 0.3; collide(p, 0.35, 'p');
    if (p.sta < 0) { p.sta = 0; p.guard = 0; p.hurtT = 0.9; p.kx = -Math.sin(a) * 1.5; p.kz = -Math.cos(a) * 1.5; POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'GUARD BROKEN', t: 1, col: '#ff2630' }); } return; }
  p.hp -= dmg * (SV.won ? 1.2 : 1); p.hurtT = 0.55; p.inv = 0.6; p.atk = null; if (p.st === 'drink' || p.st === 'roll') p.st = 'idle'; p.kx = -Math.sin(a) * 3; p.kz = -Math.cos(a) * 3; KIT.shake(6); sfx.play('hurt'); blood(p.x, p.y + 1.2, p.z, 8);
}
sfx.add('block', function () { sfx.tone('square', 900, 700, 0.06, 0.05); sfx.noise(0.08, 0.15, 3000); });
function blood(x, y, z, n) { for (var i = 0; i < n; i++) FX.push({ k: 'blood', x: x, y: y, z: z, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4, vz: (Math.random() - 0.5) * 4, t: 0.7 }); }
/* ---------- foes ---------- */
function stepFoes(dt) {
  FOE.forEach(function (f) {
    var d = f.d, dx = P.x - f.x, dz = P.z - f.z, dist = Math.hypot(dx, dz); f.t += dt; f.hurt = Math.max(0, f.hurt - dt); f.cd = Math.max(0, f.cd - dt);
    if (f.st === 'dead') return; var sees = dist < 14 && Math.abs(P.y - f.y) < 3 && lineClear(f.x, f.z, P.x, P.z) && P.hp > 0, want = 0, ang = Math.atan2(dx, dz);
    if (f.st === 'stagger') { if (f.t > 0.8) { f.st = 'chase'; f.t = 0; } }
    else if (f.st === 'wind') { f.a = turnTo(f.a, ang, dt * 3); if (f.t >= d.wind) { f.st = 'strike'; f.t = 0;
        if (d.swing === 'throw') { SHOTS.push({ x: f.x, y: f.y + 1.5, z: f.z, vx: Math.sin(f.a) * 9, vy: 3, vz: Math.cos(f.a) * 9, g: 9, dmg: d.dmg, t: 3 }); sfx.play('shoot'); }
        else if (d.swing === 'slam') { if (dist < d.reach + 1.2) hurtPlayer(d.dmg, f.x, f.z, true); KIT.shake(4); sfx.play('boom'); }
        else { var hit = Math.abs(Math.atan2(Math.sin(ang - f.a), Math.cos(ang - f.a))) < 0.9; if (dist < d.reach + 0.4 && hit && Math.abs(P.y - f.y) < 1.4) hurtPlayer(d.dmg, f.x, f.z); sfx.tone('triangle', 200, 90, 0.12, 0.05); } } }
    else if (f.st === 'strike') { if (d.leap && f.t < 0.3) { f.x += Math.sin(f.a) * 6 * dt; f.z += Math.cos(f.a) * 6 * dt; } if (f.t > 0.3) { f.st = 'rec'; f.t = 0; } }
    else if (f.st === 'rec') { if (f.t > (d.poise > 40 ? 1.1 : 0.7)) { f.st = 'chase'; f.cd = 0.3 + Math.random() * 0.7; } }
    else { if (sees) f.st = 'chase'; if (f.st === 'chase') { f.a = turnTo(f.a, ang, dt * 5);
        if (d.swing === 'throw') { if (dist > 6) want = d.spd; else if (dist < 3) want = -d.spd * 0.7; if (f.cd <= 0 && dist < d.reach && sees) { f.st = 'wind'; f.t = 0; } }
        else if (dist > d.reach * 0.85) want = d.spd; else if (f.cd <= 0) { f.st = 'wind'; f.t = 0; }
        if (d.leap && dist < 5 && dist > 2.5 && f.cd <= 0) { f.st = 'wind'; f.t = 0; }
        if (!sees && dist > 20) f.st = 'idle'; }
      else { var hd = Math.hypot(f.hx - f.x, f.hz - f.z); if (hd > 0.5) { f.a = turnTo(f.a, Math.atan2(f.hx - f.x, f.hz - f.z), dt * 4); want = 1.2; } } }
    if (want) { var ox = f.x, oz = f.z; f.x += Math.sin(f.a) * want * dt; f.z += Math.cos(f.a) * want * dt; collide(f, 0.4, 'f'); var nh = floorAt(f.x, f.z); if (nh < f.y - 0.6) { f.x = ox; f.z = oz; } f.spd = Math.hypot(f.x - ox, f.z - oz) / dt; f.ph += f.spd * dt * 2; } else f.spd = 0;
    f.y += (floorAt(f.x, f.z) - f.y) * Math.min(1, dt * 12);
    FOE.forEach(function (o) { if (o === f || o.hp <= 0) return; var ex = f.x - o.x, ez = f.z - o.z, e = Math.hypot(ex, ez); if (e < 0.8 && e > 0) { f.x += ex / e * (0.8 - e) * 0.5; f.z += ez / e * (0.8 - e) * 0.5; } });
  });
  SHOTS.forEach(function (s) { s.t -= dt; s.vy -= (s.g || 0) * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; if (s.y < floorAt(s.x, s.z) || tk(tileOf(s.x), tileOf(s.z)) === 1) { s.t = 0; FX.push({ k: 'spark', x: s.x, y: s.y, z: s.z, t: 0.3, col: '#ff4a8a' }); } if (Math.hypot(s.x - P.x, s.z - P.z) < 0.6 && s.y > P.y && s.y < P.y + 2) { hurtPlayer(s.dmg, s.x - s.vx, s.z - s.vz, s.ub); s.t = 0; } });
  SHOTS = SHOTS.filter(function (s) { return s.t > 0; });
}
/* ---------- bosses: tells (a red ring where it will land, a wind-up you can see) then the hit ---------- */
function mkBoss(t) { var B = BOSSES[t.f || WORLD.A.boss] || BOSSES[WORLD.A.boss]; var k = 1 + (SV.lvl - 1) * 0.02; return { boss: 1, B: B, d: { dmg: B.dmg }, x: tx(t.i), z: tx(t.j), y: th(t.i, t.j), a: Math.PI * 0 + Math.atan2(P.x - tx(t.i), P.z - tx(t.j)), hp: B.hp * k, mhp: B.hp * k, st: 'intro', t: 0, mi: 0, ph: 0, spd: 0, ph2: 0, marks: [], hurt: 0 }; }
function hurtBoss(dmg, heavy) { var b = BOSS; b.hp -= dmg; b.hurt = 0.12; sfx.play('hit'); blood(b.x, b.y + 2, b.z, 6); POP.push({ x: b.x, y: b.y + 3.6, z: b.z, s: String(Math.round(dmg)), t: 0.8, col: '#f1e7d0' });
  if (!b.ph2 && b.hp < b.mhp / 2) { b.ph2 = 1; G.banner = { t: 2, s: 'IT GETS ANGRIER' }; sfx.play('roar'); KIT.shake(8); }
  if (b.hp <= 0) { b.hp = 0; b.st = 'dead'; b.t = 0; SV.bosses[WORLD.A.boss] = 1; SV.loads += b.B.loads; G.fogShut = false; G.inArena = false; LOCK = null; persist(); music.stop(2); sfx.play('win'); G.banner = { t: 4, s: b.B.rig === 'tbmad' ? 'TB IS DOWN. FOR GOOD THIS TIME' : 'LOAD DEFEATED' }; KIT.shake(12); } }
function stepBoss(dt) {
  var b = BOSS; if (!b) return; b.t += dt; b.hurt = Math.max(0, b.hurt - dt); var B = b.B, sp = b.ph2 ? 1.3 : 1, dx = P.x - b.x, dz = P.z - b.z, dist = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), reach = 1.4 * B.sc;
  if (b.st === 'dead') return;
  function strike(r, mul, ub) { if (dist < r && Math.abs(P.y - b.y) < 2.5) hurtPlayer(B.dmg * (mul || 1), b.x, b.z, ub); }
  if (b.st === 'intro') { if (b.t > 1.6) { b.st = 'idle'; b.t = 0; } return; }
  if (b.st === 'idle') { b.a = turnTo(b.a, ang, dt * 3); if (dist > reach) mvB(B.spd * 0.6 * sp, dt); if (b.t > 0.9 / sp) { var mv = B.moves[b.mi++ % B.moves.length]; if ((mv === 'swing' || mv === 'combo') && dist > reach + 3) mv = Math.random() < 0.5 ? 'charge' : 'leap'; b.st = mv; b.t = 0; b.n = 0; b.done = 0;
      if (mv === 'slam') b.marks = [{ x: b.x, z: b.z, r: 4.2 * (b.ph2 ? 1.2 : 1), t: 1.0 }]; if (mv === 'leap') b.marks = [{ x: P.x, z: P.z, r: 2.4, t: 1.1 }]; } }
  else if (b.st === 'swing') { b.a = turnTo(b.a, ang, dt * 1.5); if (b.t > 0.7 / sp && !b.done) { b.done = 1; if (Math.abs(Math.atan2(Math.sin(ang - b.a), Math.cos(ang - b.a))) < 1.2) strike(reach + 1.2); sfx.play('hit'); } if (b.t > 1.4) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'combo') { var per = 0.55 / sp; b.a = turnTo(b.a, ang, dt * 2); if (b.t < per * 0.6) mvB(2, dt); if (b.t > per * (b.n + 1) - 0.1 && b.n < 3) { b.n++; if (Math.abs(Math.atan2(Math.sin(ang - b.a), Math.cos(ang - b.a))) < 1.1) strike(reach + 1.0, 0.7); sfx.play('hit'); } if (b.t > per * 3 + 0.9) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'charge') { if (b.t < 0.8 / sp) b.a = turnTo(b.a, ang, dt * 6); else { var ox = b.x, oz = b.z; mvB(11 * sp, dt); if (dist < reach * 0.8) strike(reach); if (Math.hypot(b.x - ox, b.z - oz) < 0.05 || b.t > 2.2) { b.st = 'stun'; b.t = 0; KIT.shake(8); sfx.play('boom'); } } }
  else if (b.st === 'stun') { if (b.t > 1.5) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'slam') { b.marks.forEach(function (m) { m.t -= dt; if (m.t <= 0 && !m.done) { m.done = 1; if (Math.hypot(P.x - m.x, P.z - m.z) < m.r && P.st !== 'roll') hurtPlayer(B.dmg * 1.1, b.x, b.z, true); KIT.shake(10); sfx.play('boom'); FX.push({ k: 'ring', x: m.x, y: b.y + 0.1, z: m.z, r: m.r, t: 0.4 }); } }); if (b.t > 1.8) { b.st = 'idle'; b.t = 0; } }
  else if (b.st === 'leap') { var m2 = b.marks[0]; if (b.t > 0.3 && !b.done) { var k = Math.min(1, (b.t - 0.3) / 0.8); b.x += (m2.x - b.x) * Math.min(1, dt * 5); b.z += (m2.z - b.z) * Math.min(1, dt * 5); b.jy = Math.sin(k * Math.PI) * 5; if (k >= 1) { b.done = 1; b.jy = 0; if (Math.hypot(P.x - b.x, P.z - b.z) < m2.r && P.st !== 'roll') hurtPlayer(B.dmg, b.x, b.z, true); KIT.shake(10); sfx.play('boom'); FX.push({ k: 'ring', x: b.x, y: b.y + 0.1, z: b.z, r: m2.r, t: 0.4 }); m2.done = 1; } } if (b.t > 2) { b.st = 'idle'; b.t = 0; b.jy = 0; } }
  else if (b.st === 'throw') { b.a = turnTo(b.a, ang, dt * 3); if (b.t > 0.6 && b.n < (b.ph2 ? 5 : 3) && b.t > 0.6 + b.n * 0.25) { b.n++; var sa = b.a + (b.n - 2) * 0.25; SHOTS.push({ x: b.x, y: b.y + 2.5, z: b.z, vx: Math.sin(sa) * 11, vy: 4, vz: Math.cos(sa) * 11, g: 10, dmg: B.dmg * 0.55, t: 3 }); sfx.play('shoot'); } if (b.t > 2) { b.st = 'idle'; b.t = 0; } }
  if (dist < 0.9 * B.sc * 0.6) { var a2 = Math.atan2(P.x - b.x, P.z - b.z); P.x = b.x + Math.sin(a2) * 0.9 * B.sc * 0.6; P.z = b.z + Math.cos(a2) * 0.9 * B.sc * 0.6; collide(P, 0.35, 'p'); }
  b.marks = b.marks.filter(function (m) { return !m.done; });
}
function mvB(v, dt) { var b = BOSS, ox = b.x, oz = b.z; b.x += Math.sin(b.a) * v * dt; b.z += Math.cos(b.a) * v * dt; collide(b, 0.9, 'f'); b.spd = Math.hypot(b.x - ox, b.z - oz) / dt; b.ph += b.spd * dt * 1.4; }
function rest(c) { SV.candle = c.id; SV.lit[c.id] = 1; P.hp = maxHp(); P.sta = maxSta(); P.flask = flaskMax(); persist(); sfx.play('magic'); spawnFoes(); SHOTS = []; LOCK = null; candleMenu(c); }
function openChest(t) { SV.chests[t.id] = 1; var k = 0; for (var i = 0; i < t.id.length; i++) k += t.id.charCodeAt(i); var it = CHESTS[k % CHESTS.length], s;
  if (it[0] === 'w' && SV.wpns.indexOf(it[1]) < 0) { SV.wpns.push(it[1]); s = WEAPONS[it[1]].n; } else if (it[0] === 'r' && SV.rings.indexOf(it[1]) < 0) { SV.rings.push(it[1]); s = RINGS[it[1]].n; } else if (it[0] === 'shard' && SV.shards < 6) { SV.shards++; s = 'Cream Shard (flask +1)'; } else { var n = 500 + SV.area * 500; SV.loads += n; s = n + ' Loads'; }
  G.banner = { t: 3, s: s.toUpperCase() }; sfx.play('power'); persist(); }
function die() { SV.deaths++; var x = P.x, z = P.z; if (P.y < -5 || floorAt(x, z) < -5) { var best = null, bd = 99; for (var j = -3; j <= 3; j++) for (var i = -3; i <= 3; i++) { var ti = tileOf(x) + i, tj = tileOf(z) + j; if (tk(ti, tj) === 0 && Math.hypot(i, j) < bd) { bd = Math.hypot(i, j); best = [tx(ti), tx(tj)]; } } if (best) { x = best[0]; z = best[1]; } }
  SV.stain = SV.loads > 0 ? { area: SV.area, x: x, z: z, loads: SV.loads } : null; SV.loads = 0; persist(); G.mode = 'dead'; G.deadT = 0; music.stop(1.5); sfx.play('lose'); LOCK = null; }
