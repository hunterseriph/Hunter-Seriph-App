/* =====================================================================================================
   CUMSTEIN 3D: a first person shooter in the old Wolfenstein / Doom way. Cumhead storms Blumhead's castle floor by floor
   with Amy's Sausage, a Cream Pistol, Greebo's Pie Shotgun, the Sperm Swarm and the Meatnado Launcher. Find the keys,
   push the cracked walls for secrets, find the lift, and at the top of the castle Blumhead is waiting.
   Shields are condoms, as everywhere. Two episodes, four floors each, laid from fixed seeds so they never change.
   ===================================================================================================== */
var W = 480, H = 270, TSZ = 2.4, WH = 2.6;
var SV = KIT.load('c3-save', null) || { best: {}, reached: 0, sens: 1 };
function persist() { KIT.save('c3-save', SV); }
var FLOORS = [
  { n: 'E1 F1', name: 'THE CELLS', wall: 'stone', wall2: 'cell', floor: 'flag', ceil: 'ceilst', fog: [0.03, 0.02, 0.02], amb: [0.22, 0.18, 0.17], foes: ['cultist', 'ghoul', 'skeleton'], rooms: 9 },
  { n: 'E1 F2', name: 'THE KITCHENS', wall: 'tilew2', wall2: 'stone', floor: 'flag', ceil: 'ceilst', fog: [0.04, 0.03, 0.02], amb: [0.24, 0.2, 0.17], foes: ['cultist', 'ghoul', 'skeleton', 'knight'], rooms: 10 },
  { n: 'E1 F3', name: 'THE CHAPEL', wall: 'wood2', wall2: 'banner', floor: 'carpetr', ceil: 'wood2', fog: [0.05, 0.01, 0.02], amb: [0.24, 0.12, 0.13], foes: ['cultist', 'knight', 'wraith', 'mummy'], rooms: 11 },
  { n: 'E1 F4', name: "THE JAILER'S HALL", wall: 'stone', wall2: 'banner', floor: 'flag', ceil: 'ceilst', fog: [0.04, 0.02, 0.02], amb: [0.2, 0.15, 0.15], foes: ['knight', 'jailer', 'skeleton', 'imp'], rooms: 11, boss: 'jailer' },
  { n: 'E2 F1', name: 'THE GOO WORKS', wall: 'goo', wall2: 'stone', floor: 'grate2', ceil: 'ceilst', fog: [0.04, 0.0, 0.05], amb: [0.2, 0.1, 0.22], foes: ['blumguard', 'blumeye', 'imp', 'ghoul'], rooms: 11 },
  { n: 'E2 F2', name: 'THE LIBRARY', wall: 'books', wall2: 'wood2', floor: 'carpetr', ceil: 'wood2', fog: [0.04, 0.02, 0.01], amb: [0.22, 0.16, 0.12], foes: ['vampire', 'wraith', 'cultist', 'knight'], rooms: 12 },
  { n: 'E2 F3', name: 'THE GOLEM PITS', wall: 'stone', wall2: 'goo', floor: 'grate2', ceil: 'ceilst', fog: [0.05, 0.02, 0.01], amb: [0.22, 0.14, 0.1], foes: ['golem', 'blumguard', 'imp', 'mummy'], rooms: 12 },
  { n: 'E2 F4', name: "BLUMHEAD'S THRONE", wall: 'banner', wall2: 'goo', floor: 'carpetr', ceil: 'wood2', fog: [0.06, 0.0, 0.03], amb: [0.26, 0.1, 0.16], foes: ['blumguard', 'vampire', 'blumeye', 'golem'], rooms: 12, boss: 'blum' }
];
var FOES = {
  cultist: { s: 'f_cultist_', hp: 30, spd: 2.2, att: 'shot', dmg: 8, rate: 1.6, pts: 100, h: 1.5 }, ghoul: { s: 'f_ghoul_', hp: 40, spd: 3.0, att: 'melee', dmg: 12, rate: 1.0, pts: 100, h: 1.5 },
  skeleton: { s: 'f_skeleton_', hp: 35, spd: 2.0, att: 'hitscan', dmg: 6, rate: 1.4, pts: 120, h: 1.5 }, knight: { s: 'f_knight_', hp: 90, spd: 1.8, att: 'hitscan', dmg: 10, rate: 1.2, pts: 300, h: 1.6 },
  wraith: { s: 'f_wraith_', hp: 50, spd: 3.4, att: 'melee', dmg: 14, rate: 0.9, pts: 250, h: 1.4, fly: 1 }, mummy: { s: 'f_mummy_', hp: 80, spd: 1.6, att: 'melee', dmg: 18, rate: 1.2, pts: 250, h: 1.6 },
  jailer: { s: 'f_jailer_', hp: 140, spd: 1.6, att: 'melee', dmg: 24, rate: 1.4, pts: 400, h: 1.7 }, imp: { s: 'f_imp_', hp: 40, spd: 2.8, att: 'shot', dmg: 10, rate: 1.4, pts: 200, h: 1.2, fly: 1 },
  blumguard: { s: 'f_blumguard_', hp: 100, spd: 2.0, att: 'hitscan', dmg: 12, rate: 1.0, pts: 400, h: 1.6 }, blumeye: { s: 'f_blumeye_', hp: 70, spd: 1.4, att: 'shot', dmg: 14, rate: 1.1, pts: 350, h: 1.5, fly: 1, nf: 3 },
  vampire: { s: 'f_vampire_', hp: 90, spd: 3.2, att: 'melee', dmg: 18, rate: 0.9, pts: 400, h: 1.7 }, golem: { s: 'f_golem_', hp: 220, spd: 1.4, att: 'shot', dmg: 22, rate: 1.8, pts: 600, h: 1.8 }
};
var BOSSF = { jailer: { s: 'f_kingblum_', n: 'THE GOO JAILER KING', hp: 1400, spd: 1.8, dmg: 18, sc: 2.2, nf: 2 }, blum: { s: 'f_blum_', s2: 'f_blum2_', n: 'BLUMHEAD', hp: 2400, spd: 2.2, dmg: 20, sc: 2.4, nf: 2 } };
var GUNS = [
  { id: 'sausage', n: "AMY'S SAUSAGE", dmg: 30, rate: 0.45, range: 1.8, ammo: null },
  { id: 'pistol', n: 'CREAM PISTOL', dmg: 18, rate: 0.32, ammo: 'cream', use: 1, spread: 0.02 },
  { id: 'shotgun', n: "GREEBO'S PIE SHOTGUN", dmg: 12, rate: 0.85, ammo: 'pies', use: 1, pellets: 7, spread: 0.12 },
  { id: 'swarm', n: 'SPERM SWARM', dmg: 14, rate: 0.09, ammo: 'cream', use: 1, spread: 0.05 },
  { id: 'nado', n: 'MEATNADO LAUNCHER', dmg: 120, rate: 0.9, ammo: 'meat', use: 1, rocket: 1 }
];
/* ---------- textures ---------- */
var PAINT = {
  white: function (p) { p.fill('#ffffff'); }, glow: function (p) { p.fill('#ffffff'); },
  stone: pBricks('#5a4a4e', '#241a1c', 8, 16), cell: function (p) { pBricks('#5a4a4e', '#241a1c', 8, 16)(p); for (var x = 4; x < 32; x += 6) p.rect(x, 4, 2, 24, '#2a2a2e'); p.rect(2, 4, 28, 2, '#3a3a40'); p.rect(2, 26, 28, 2, '#3a3a40'); },
  tilew2: pTiles('#c8c0b0', '#7a7468', 4, 6), wood2: pPlanks('#5a3a24', 4), books: function (p) { p.fill('#2a1a10'); for (var y = 0; y < 32; y += 10) { p.rect(0, y + 8, 32, 2, '#5a3a24'); for (var x = 0; x < 32; x += 3) p.rect(x, y, 2, 8, ['#6a0a10', '#1a2a4a', '#2a4a1a', '#5a4a1a', '#3a1a3a'][(x * 7 + y) % 5]); } },
  banner: function (p) { pBricks('#4a3a3e', '#1a1214', 8, 16)(p); p.rect(10, 0, 12, 26, '#8a0a12'); p.rect(10, 0, 12, 2, '#ffe36a'); p.rect(12, 8, 8, 8, '#12040a'); p.rect(14, 10, 4, 4, '#c4121c'); p.px(10, 26, '#8a0a12'); p.px(21, 26, '#8a0a12'); p.px(15, 27, '#8a0a12'); p.px(16, 27, '#8a0a12'); },
  goo: function (p) { p.fill('#2a0a2a'); for (var i = 0; i < 20; i++) { var x = Math.floor(p.rnd() * 32), l = 4 + Math.floor(p.rnd() * 20); p.rect(x, 0, 2, l, '#7a2ad8'); p.px(x, l, '#c08aff'); } p.speck(['#3a1a3a', '#5a1a6a'], 120); },
  flag: function (p) { p.fill('#2a2224'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) { var c = shade('#4a3e3e', 0.7 + p.rnd() * 0.5); p.rect(x + 1, y + 1, 7, 7, c); } p.speck(['#1a1214'], 60); },
  ceilst: pConcrete('#2e2628'), carpetr: function (p) { p.fill('#5a0a10'); p.rect(0, 0, 32, 3, '#ffe36a'); p.rect(0, 29, 32, 3, '#ffe36a'); p.speck(['#4a080c', '#6a1018'], 200); },
  grate2: function (p) { p.fill('#1a1614'); for (var i = 0; i < 32; i += 4) { p.rect(i, 0, 2, 32, '#3a3430'); p.rect(0, i, 32, 1, '#2a2420'); } },
  door: function (p) { p.fill('#3a3a44'); p.rect(0, 0, 32, 2, '#6a6a74'); p.rect(15, 0, 2, 32, '#1a1a20'); for (var y = 4; y < 32; y += 7) { p.rect(2, y, 12, 1, '#5a5a64'); p.rect(18, y, 12, 1, '#5a5a64'); } },
  doorgold: function (p) { PAINT.door(p); p.rect(4, 12, 24, 8, '#ffc840'); p.rect(14, 14, 4, 4, '#12040a'); },
  lift: function (p) { p.fill('#2a2a30'); p.rect(4, 4, 24, 24, '#6a0a10'); p.rect(12, 8, 8, 6, '#7aff6a'); p.rect(12, 18, 8, 6, '#3a3a40'); },
  crack: function (p) { pBricks('#5a4a4e', '#241a1c', 8, 16)(p); for (var y = 2; y < 30; y++) p.px(14 + Math.round(Math.sin(y * 0.7) * 3), y, '#0e0808'); }
};
var ATL = null, ATT = null, SHEETTEX = null;
function TL(n) { return ATL.tile(n); }
function buildAtlas() { if (ATL) return; ATL = Atlas(9, 1024); Object.keys(PAINT).forEach(function (k) { ATL.add(k, PAINT[k], { flat: k === 'white' || k === 'glow' }); }); ATT = R3.texture(ATL.canvas, true); }
function sheetTex() { if (!SHEETTEX && KIT.sheetReady) SHEETTEX = R3.texture(KIT.sheet); return SHEETTEX; }
function sprRect(n) { var f = KIT.SPR[n], im = KIT.sheet; if (!f || !im || !im.width) return null; return { t: [(f[0] + 0.02) / im.width, (f[1] + 0.02) / im.height, (f[2] - 0.04) / im.width, (f[3] - 0.04) / im.height], w: f[2], h: f[3] }; }
/* ---------- the floors: rooms joined by corridors, doors between, a gold key, cracked walls, the lift ---------- */
var K, MW = 34, MH = 34, ROOMS = [], DOORS = [], THINGS = [], FOE = [], LIFT = null, MESH = null;
function idx(i, j) { return j * MW + i; } function inMap(i, j) { return i >= 0 && j >= 0 && i < MW && j < MH; } function tileOf(x) { return Math.floor(x / TSZ); } function tx(i) { return (i + 0.5) * TSZ; }
/* tiles: 0 floor, 1 wall, 2 door, 3 gold door, 4 cracked wall (pushes in), 5 lift switch wall */
function genFloor(n) {
  var F = FLOORS[n], rnd = srand(4242 + n * 977), i, j; function ri(a) { return Math.floor(rnd() * a); }
  K = new Uint8Array(MW * MH).fill(1); ROOMS = []; DOORS = []; THINGS = []; FOE = [];
  for (var t = 0; t < 300 && ROOMS.length < F.rooms; t++) { var w = 4 + ri(5), h = 4 + ri(5), x = 1 + ri(MW - w - 2), y = 1 + ri(MH - h - 2);
    if (ROOMS.some(function (r) { return x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y; })) continue; ROOMS.push({ x: x, y: y, w: w, h: h, cx: x + (w >> 1), cy: y + (h >> 1) }); for (j = y; j < y + h; j++) for (i = x; i < x + w; i++) K[idx(i, j)] = 0; }
  ROOMS.sort(function (a, b) { return (b.cy * 3 + b.cx) - (a.cy * 3 + a.cx); }); // the first room is bottom right, the last top left
  function corridor(a, b) { var x = a.cx, y = a.cy, out = []; while (x !== b.cx) { out.push([x, y]); x += x < b.cx ? 1 : -1; } while (y !== b.cy) { out.push([x, y]); y += y < b.cy ? 1 : -1; } out.forEach(function (p) { var k = idx(p[0], p[1]); if (K[k] === 1) { K[k] = 0; p.c = 1; } }); return out; }
  for (var r = 1; r < ROOMS.length; r++) corridor(ROOMS[r - 1], ROOMS[r]);
  for (var e = 0; e < 3; e++) { var a = ri(ROOMS.length), b = ri(ROOMS.length); if (a !== b) corridor(ROOMS[a], ROOMS[b]); }
  // doors where a corridor meets a room wall
  for (j = 1; j < MH - 1; j++) for (i = 1; i < MW - 1; i++) { if (K[idx(i, j)] !== 0 || inRoom(i, j)) continue; var hz = K[idx(i - 1, j)] === 1 && K[idx(i + 1, j)] === 1, vt = K[idx(i, j - 1)] === 1 && K[idx(i, j + 1)] === 1;
    var nearRoom = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { return inRoom(i + d[0], j + d[1]); }); if ((hz || vt) && nearRoom && !DOORS.some(function (D) { return Math.abs(D.i - i) + Math.abs(D.j - j) < 3; })) { K[idx(i, j)] = 2; DOORS.push({ i: i, j: j, ax: hz ? 'z' : 'x', open: 0, want: 0, t: 0 }); } }
  var start = ROOMS[0], last = ROOMS[ROOMS.length - 1]; G.start = { x: tx(start.cx), z: tx(start.cy) };
  // the lift: a switch on the last room's far wall; a gold door on the way into it, its key in a middle room
  for (i = last.x; i < last.x + last.w; i++) if (K[idx(i, last.y - 1)] === 1) { K[idx(i, last.y - 1)] = 5; LIFT = { i: i, j: last.y - 1 }; break; }
  var lastDoors = DOORS.filter(function (D) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { var q = D.i + d[0], w = D.j + d[1]; return q >= last.x && q < last.x + last.w && w >= last.y && w < last.y + last.h; }); });
  lastDoors.forEach(function (D) { D.gold = 1; K[idx(D.i, D.j)] = 3; });
  var keyRoom = ROOMS[Math.max(1, ROOMS.length >> 1)]; THINGS.push({ k: 'key', x: tx(keyRoom.cx), z: tx(keyRoom.cy) });
  // cracked walls on room edges hide treasure pockets
  for (var s = 0; s < 3; s++) { var R0 = ROOMS[1 + ri(ROOMS.length - 1)], side = ri(4), wi = side < 2 ? R0.x + ri(R0.w) : side === 2 ? R0.x - 1 : R0.x + R0.w, wj = side < 2 ? (side === 0 ? R0.y - 1 : R0.y + R0.h) : R0.y + ri(R0.h), d2 = side === 0 ? [0, -1] : side === 1 ? [0, 1] : side === 2 ? [-1, 0] : [1, 0];
    var p1 = [wi + d2[0], wj + d2[1]], p2 = [wi + d2[0] * 2, wj + d2[1] * 2]; if (!inMap(p2[0], p2[1]) || p2[0] < 1 || p2[1] < 1 || p2[0] > MW - 2 || p2[1] > MH - 2) continue; if (K[idx(wi, wj)] !== 1 || K[idx(p1[0], p1[1])] !== 1 || K[idx(p2[0], p2[1])] !== 1) continue;
    K[idx(wi, wj)] = 4; K[idx(p1[0], p1[1])] = 0; K[idx(p2[0], p2[1])] = 0; THINGS.push({ k: 'treasure', x: tx(p2[0]), z: tx(p2[1]), secret: 1 }); THINGS.push({ k: ['cuppa', 'condom', 'pies', 'meat'][s % 4], x: tx(p1[0]), z: tx(p1[1]) }); G.secrets++; }
  // foes, pickups and lamps through the rooms
  ROOMS.forEach(function (R1, n) { R1.lamp = { x: tx(R1.cx), z: tx(R1.cy) }; if (n === 0) return; var nf = 1 + ri(2) + Math.floor(n / 4); for (var f = 0; f < nf; f++) { var fx = R1.x + ri(R1.w), fz = R1.y + ri(R1.h); FOE.push(mkFoe(F.foes[ri(F.foes.length)], tx(fx), tx(fz))); }
    var it = ['cream', 'cracker', 'treasure', 'pies', 'condom', 'cream', 'meat', 'cuppa'][(n + ri(3)) % 8]; THINGS.push({ k: it, x: tx(R1.x + ri(R1.w)), z: tx(R1.y + ri(R1.h)) });
    if (n % 3 === 1) { var wpn = n < 4 ? 'w_shotgun' : n < 7 ? 'w_swarm' : 'w_nado'; THINGS.push({ k: wpn, x: tx(R1.cx), z: tx(R1.cy) }); } });
  if (F.boss) { var bf = BOSSF[F.boss]; FOE.push({ boss: 1, B: bf, d: { s: bf.s, hp: bf.hp, spd: bf.spd, att: 'shot', dmg: bf.dmg, rate: 0.7, pts: 5000, h: 3.2, nf: 2 }, k: 'boss', x: tx(last.cx), z: tx(last.cy), hp: bf.hp, st: 'idle', t: 0, cd: 1, pain: 0, a: 0 }); }
  G.kills = 0; G.total = FOE.length; G.found = 0; G.treasures = THINGS.filter(function (t) { return t.k === 'treasure'; }).length;
}
function inRoom(i, j) { return ROOMS.some(function (r) { return i >= r.x && i < r.x + r.w && j >= r.y && j < r.y + r.h; }); }
function mkFoe(k, x, z) { var d = FOES[k]; return { k: k, d: d, x: x, z: z, hp: d.hp, st: 'idle', t: Math.random(), cd: 1, pain: 0, a: 0 }; }
function solid(i, j) { if (!inMap(i, j)) return true; var k = K[idx(i, j)]; if (k === 0) return false; if (k === 2 || k === 3) { var D = doorAt(i, j); return !D || D.open < 0.8; } return true; }
function doorAt(i, j) { for (var n = 0; n < DOORS.length; n++) if (DOORS[n].i === i && DOORS[n].j === j) return DOORS[n]; return null; }
function collide(o, r) { var i0 = tileOf(o.x - r), i1 = tileOf(o.x + r), j0 = tileOf(o.z - r), j1 = tileOf(o.z + r);
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { if (!solid(i, j)) continue; var bx0 = i * TSZ, bz0 = j * TSZ, nx = Math.max(bx0, Math.min(o.x, bx0 + TSZ)), nz = Math.max(bz0, Math.min(o.z, bz0 + TSZ)), dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz); if (d < r) { if (d < 1e-5) { o.x = tx(i) + (o.x > tx(i) ? 1 : -1) * (TSZ / 2 + r); } else { o.x = nx + dx / d * r; o.z = nz + dz / d * r; } } } }
function clear(ax, az, bx, bz) { var dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz), n = Math.ceil(d / 0.4); for (var s = 1; s < n; s++) { var t = s / n; if (solid(tileOf(ax + dx * t), tileOf(az + dz * t))) return false; } return true; }
function buildMesh() {
  var m = new R3.Mesh(), F = FLOORS[G.fl], rnd = srand(5);
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) { var k = K[idx(i, j)], x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ;
    if (k === 0 || k === 2 || k === 3) { m.quad([x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(F.floor), vc(0.8 + rnd() * 0.2), [0, 1, 0]); m.quad([x0, WH, z0], [x1, WH, z0], [x1, WH, z1], [x0, WH, z1], [0, 0, 1, 0, 1, 1, 0, 1], TL(F.ceil), vc(0.7), [0, -1, 0]); continue; }
    var T = TL(k === 4 ? 'crack' : k === 5 ? 'lift' : (i * 5 + j * 3) % 7 ? F.wall : F.wall2);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nk = inMap(i + d[0], j + d[1]) ? K[idx(i + d[0], j + d[1])] : 1; if (nk !== 0 && nk !== 2 && nk !== 3) return; var a, b; if (d[0] > 0) { a = [x1, z1]; b = [x1, z0]; } else if (d[0] < 0) { a = [x0, z0]; b = [x0, z1]; } else if (d[1] > 0) { a = [x0, z1]; b = [x1, z1]; } else { a = [x1, z0]; b = [x0, z0]; }
      m.quad([a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], WH, b[1]], [a[0], WH, a[1]], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(d[0] ? 0.9 : 0.75), [d[0], 0, d[1]], k === 5 ? 0.6 : 0); }); }
  return m.upload();
}
/* ---------- playing ---------- */
var G = { mode: 'title', t: 0, secrets: 0 }, P = null, SHOTS = [], FX = [], DOORMESH = null;
function startFloor(n, keep) {
  if (!R3.ok) { G.mode = 'nogl'; return; }
  buildAtlas(); G.fl = n; G.secrets = 0; genFloor(n); if (MESH) MESH.free(); MESH = buildMesh(); KIT.closeMenu();
  var old = keep && P; P = { x: G.start.x, z: G.start.z, a: Math.PI, hp: old ? old.hp : 100, arm: old ? old.arm : 0, ammo: old ? old.ammo : { cream: 40, pies: 0, meat: 0 }, guns: old ? old.guns : { sausage: 1, pistol: 1 }, gun: old ? old.gun : 1, cd: 0, bob: 0, kick: 0, key: 0, score: old ? old.score : 0, hurt: 0, flash: 0 };
  for (var t = 0; t < 8; t++) { var aa = t / 8 * 6.283; if (!solid(tileOf(P.x + Math.sin(aa) * 3), tileOf(P.z + Math.cos(aa) * 3))) { P.a = aa; break; } }
  SHOTS = []; FX = []; G.mode = 'play'; G.lvT = 0; G.banner = { t: 3, s: FLOORS[n].name, b: FLOORS[n].n }; music.play(FLOORS[n].boss ? 'c3boss' : n % 2 ? 'c3b' : 'c3a'); if (n > SV.reached) { SV.reached = n; persist(); }
}
var mouse = { dx: 0 };
document.addEventListener('mousemove', function (e) { if (document.pointerLockElement) mouse.dx += e.movementX; });
KIT.canvas.addEventListener('click', function () { if (G.mode === 'play' && !('ontouchstart' in window) && KIT.canvas.requestPointerLock) try { KIT.canvas.requestPointerLock(); } catch (e) {} });
document.addEventListener('mousedown', function (e) { if (document.pointerLockElement && e.button === 0) G.mouseFire = 1; }); document.addEventListener('mouseup', function () { G.mouseFire = 0; });
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode === 'dead') { G.deadT += dt; return; } if (G.mode !== 'play') return; G.lvT += dt;
  var p = P, mv = KIT.stick(0), lk = KIT.stick(1); p.a -= (lk.x * 2.8 * dt + mouse.dx * 0.003) * (SV.sens || 1); mouse.dx = 0;
  var fx = Math.sin(p.a), fz = Math.cos(p.a), rx = -Math.cos(p.a), rz = Math.sin(p.a), sp = 5.2, ox = p.x, oz = p.z;
  p.x += (fx * -mv.y + rx * mv.x) * sp * dt; p.z += (fz * -mv.y + rz * mv.x) * sp * dt; collide(p, 0.3); var moved = Math.hypot(p.x - ox, p.z - oz); p.bob += moved * 3; p.hurt = Math.max(0, p.hurt - dt); p.flash = Math.max(0, p.flash - dt); p.kick = Math.max(0, p.kick - dt * 5);
  // doors open when you use them (A) or walk into them
  DOORS.forEach(function (D) { var d = Math.hypot(tx(D.i) - p.x, tx(D.j) - p.z); if (d < 1.9 && (KIT.pressed('a') || d < 1.5)) { if (D.gold && !p.key) { if (KIT.pressed('a') || !D.said) { msg('THE GOLD KEY OPENS THIS'); D.said = 1; } } else if (!D.want) { D.want = 1; sfx.play('door'); } } D.open = Math.max(0, Math.min(1, D.open + (D.want ? 1 : -1) * dt * 1.6)); if (D.want) { D.t += dt; if (D.t > 4 && !(Math.abs(tileOf(p.x) - D.i) + Math.abs(tileOf(p.z) - D.j) < 1) && !FOE.some(function (f) { return f.hp > 0 && tileOf(f.x) === D.i && tileOf(f.z) === D.j; })) { D.want = 0; D.t = 0; } } });
  if (KIT.pressed('a')) { var ti = tileOf(p.x + fx * 1.6), tj = tileOf(p.z + fz * 1.6); if (inMap(ti, tj) && K[idx(ti, tj)] === 4) { K[idx(ti, tj)] = 0; MESH.free(); MESH = buildMesh(); sfx.play('boom'); G.found++; msg('A SECRET!'); }
    if (LIFT && ti === LIFT.i && tj === LIFT.j) { finishFloor(); return; } }
  // weapons
  if (KIT.pressed('y')) nextGun(1); if (KIT.pressed('lb')) nextGun(-1); for (var n = 1; n <= 5; n++) if (KIT.pressed('g' + n) && p.guns[GUNS[n - 1].id]) p.gun = n - 1;
  p.cd -= dt; var g = GUNS[p.gun]; if ((KIT.held('x') || KIT.held('rb') || G.mouseFire) && p.cd <= 0) fire(g);
  // pickups
  THINGS.forEach(function (t) { if (t.got || Math.hypot(t.x - p.x, t.z - p.z) > 0.9) return; var take = true;
    if (t.k === 'cracker') { if (p.hp >= 100) take = false; else p.hp = Math.min(100, p.hp + 10); } else if (t.k === 'cuppa') { if (p.hp >= 100) take = false; else p.hp = Math.min(100, p.hp + 25); }
    else if (t.k === 'condom') { if (p.arm >= 100) take = false; else p.arm = Math.min(100, p.arm + 50); } else if (t.k === 'cream') p.ammo.cream = Math.min(200, p.ammo.cream + 20); else if (t.k === 'pies') p.ammo.pies = Math.min(50, p.ammo.pies + 8); else if (t.k === 'meat') p.ammo.meat = Math.min(30, p.ammo.meat + 4);
    else if (t.k === 'key') { p.key = 1; msg('THE GOLD KEY'); } else if (t.k === 'treasure') { p.score += 500; G.got = (G.got || 0) + 1; }
    else if (t.k.indexOf('w_') === 0) { var id = t.k.slice(2), gi = GUNS.findIndex(function (q) { return q.id === id; }); if (!p.guns[id]) { p.guns[id] = 1; p.gun = gi; msg(GUNS[gi].n + '!'); } if (id === 'shotgun') p.ammo.pies += 8; else if (id === 'nado') p.ammo.meat += 4; else p.ammo.cream += 30; }
    if (take) { t.got = 1; sfx.play('coin'); p.flash = 0.15; } });
  stepFoes(dt); stepShots(dt);
  if (p.hp <= 0) { G.mode = 'dead'; G.deadT = 0; sfx.play('lose'); music.stop(1); setTimeout(deadMenu, 1500); }
}
function nextGun(d) { var p = P; for (var n = 1; n <= 5; n++) { var gi = (p.gun + d * n + 50) % 5; if (p.guns[GUNS[gi].id]) { p.gun = gi; sfx.play('blip'); return; } } }
function fire(g) {
  var p = P; if (g.ammo && p.ammo[g.ammo] < g.use) { nextGun(-1); return; } p.cd = g.rate; if (g.ammo) p.ammo[g.ammo] -= g.use; p.kick = 1; G.noise = 1;
  if (g.id === 'sausage') { sfx.tone('triangle', 300, 100, 0.12, 0.05); FOE.forEach(function (f) { if (f.hp <= 0) return; var d = Math.hypot(f.x - p.x, f.z - p.z), a = Math.atan2(f.x - p.x, f.z - p.z); if (d < g.range && Math.abs(Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a))) < 0.6) hurtFoe(f, g.dmg); }); return; }
  p.mflash = 0.06; sfx.play(g.id === 'nado' ? 'boom' : 'shoot'); if (g.id === 'shotgun') sfx.noise(0.2, 0.25, 600);
  if (g.rocket) { SHOTS.push({ x: p.x + Math.sin(p.a) * 0.5, z: p.z + Math.cos(p.a) * 0.5, y: 1.2, vx: Math.sin(p.a) * 14, vz: Math.cos(p.a) * 14, t: 3, dmg: g.dmg, rocket: 1, mine: 1 }); return; }
  for (var n = 0; n < (g.pellets || 1); n++) { var a = p.a + (Math.random() - 0.5) * g.spread * 2, best = null, bd = 30;
    FOE.forEach(function (f) { if (f.hp <= 0) return; var dx = f.x - p.x, dz = f.z - p.z, d = Math.hypot(dx, dz), along = dx * Math.sin(a) + dz * Math.cos(a), side = Math.abs(dx * Math.cos(a) - dz * Math.sin(a)); if (along > 0 && side < (f.boss ? 1.4 : 0.45) && d < bd && clear(p.x, p.z, f.x, f.z)) { bd = d; best = f; } });
    if (best) hurtFoe(best, g.dmg * (bd < 4 ? 1.2 : 1)); else { var k = 0; while (k < 30 && !solid(tileOf(p.x + Math.sin(a) * k), tileOf(p.z + Math.cos(a) * k))) k += 0.3; FX.push({ k: 'puff', x: p.x + Math.sin(a) * (k - 0.2), y: 1.1 + (Math.random() - 0.5) * 0.6, z: p.z + Math.cos(a) * (k - 0.2), t: 0.3 }); } }
}
function hurtFoe(f, dmg) { f.hp -= dmg; f.pain = 0.15; if (f.st === 'idle') f.st = 'chase'; for (var i = 0; i < 4; i++) FX.push({ k: 'blood', x: f.x, y: 1.1 + Math.random() * 0.5, z: f.z, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 3, vz: (Math.random() - 0.5) * 3, t: 0.5 }); sfx.play('hit');
  if (f.hp <= 0) { f.st = 'dead'; f.t = 0; G.kills++; P.score += f.d.pts; if (f.boss) { music.stop(2); sfx.play('win'); G.banner = { t: 4, s: f.B.n + ' IS DOWN', b: 'FIND THE LIFT' }; KIT.shake(12); } else if (Math.random() < 0.35) THINGS.push({ k: Math.random() < 0.5 ? 'cream' : 'cracker', x: f.x, z: f.z }); } }
function hurtP(dmg) { var p = P; if (p.hp <= 0) return; var a = Math.min(p.arm, Math.round(dmg * 0.6)); p.arm -= a; p.hp -= dmg - a; p.hurt = 0.4; sfx.play('hurt'); KIT.shake(4); }
function stepFoes(dt) {
  var p = P; FOE.forEach(function (f) { if (f.st === 'dead') { f.t += dt; return; } f.t += dt; f.cd -= dt; f.pain = Math.max(0, f.pain - dt); var d = f.d, dx = p.x - f.x, dz = p.z - f.z, dist = Math.hypot(dx, dz), sees = dist < 22 && clear(f.x, f.z, p.x, p.z);
    if (f.st === 'idle') { if (sees && dist < 14 || (G.noise && dist < 16)) { f.st = 'chase'; sfx.tone('sawtooth', 200, 120, 0.2, 0.03); } return; }
    if (f.pain > 0) return; f.a = Math.atan2(dx, dz);
    var want = d.att === 'melee' ? 1.2 : 5; if (dist > want || !sees) { var ox = f.x, oz = f.z, sp2 = d.spd * (f.boss && f.hp < f.d.hp / 2 ? 1.4 : 1); f.x += dx / dist * sp2 * dt; f.z += dz / dist * sp2 * dt; collide(f, 0.35); if (Math.hypot(f.x - ox, f.z - oz) < 0.001) { f.x += Math.cos(f.t) * sp2 * dt; f.z += Math.sin(f.t) * sp2 * dt; collide(f, 0.35); } }
    if (f.cd <= 0 && sees && (d.att !== 'melee' || dist < 1.6)) { f.cd = d.rate * (0.8 + Math.random() * 0.5); f.flashT = 0.25;
      if (d.att === 'melee') { hurtP(d.dmg); sfx.play('hit'); }
      else if (d.att === 'hitscan') { if (Math.random() < Math.max(0.25, 0.85 - dist * 0.04)) hurtP(d.dmg); sfx.play('shoot'); }
      else { var n = f.boss ? (f.hp < f.d.hp / 2 ? 5 : 3) : 1; for (var k = 0; k < n; k++) { var aa = f.a + (k - (n - 1) / 2) * 0.18; SHOTS.push({ x: f.x, z: f.z, y: f.boss ? 2 : 1.1, vx: Math.sin(aa) * 7, vz: Math.cos(aa) * 7, t: 4, dmg: d.dmg, foe: 1 }); } sfx.play('shoot'); } }
    FOE.forEach(function (o) { if (o === f || o.st === 'dead') return; var ex = f.x - o.x, ez = f.z - o.z, e = Math.hypot(ex, ez); if (e < 0.7 && e > 0) { f.x += ex / e * 0.02; f.z += ez / e * 0.02; } }); });
  G.noise = 0;
}
function stepShots(dt) {
  SHOTS.forEach(function (s) { s.t -= dt; s.x += s.vx * dt; s.z += s.vz * dt; var hit = solid(tileOf(s.x), tileOf(s.z));
    if (s.foe) { if (Math.hypot(s.x - P.x, s.z - P.z) < 0.5) { hurtP(s.dmg); s.t = 0; } }
    else FOE.forEach(function (f) { if (f.st !== 'dead' && Math.hypot(f.x - s.x, f.z - s.z) < (f.boss ? 1.3 : 0.5)) hit = true; });
    if (hit && s.t > 0) { s.t = 0; if (s.rocket) { sfx.play('boom'); KIT.shake(6); FX.push({ k: 'boom', x: s.x, y: 1.2, z: s.z, t: 0.4 }); FOE.forEach(function (f) { var d = Math.hypot(f.x - s.x, f.z - s.z); if (f.st !== 'dead' && d < 3) hurtFoe(f, s.dmg * (1 - d / 4)); }); var pd = Math.hypot(P.x - s.x, P.z - s.z); if (pd < 2.5) hurtP(Math.round(40 * (1 - pd / 3))); } } });
  SHOTS = SHOTS.filter(function (s) { return s.t > 0; });
}
var MSGS = [];
function msg(s) { MSGS.push({ s: s, t: 2.5 }); if (MSGS.length > 3) MSGS.shift(); }
function finishFloor() {
  G.mode = 'tally'; sfx.play('win'); music.stop(0.5); var key = 'f' + G.fl, t = Math.round(G.lvT), kills = G.total ? Math.round(G.kills / G.total * 100) : 100, secr = G.secrets ? Math.round(G.found / G.secrets * 100) : 100, tre = G.treasures ? Math.round((G.got || 0) / G.treasures * 100) : 100; G.got = 0;
  var b = SV.best[key]; if (!b || t < b.t) SV.best[key] = { t: t, kills: kills }; if (G.fl + 1 > SV.reached) SV.reached = G.fl + 1; persist();
  KIT.menu({ title: 'Floor Done', sub: FLOORS[G.fl].n + ': ' + FLOORS[G.fl].name, html: '<p style="text-align:center;font-size:18px">KILLS ' + kills + '%<br>SECRETS ' + secr + '%<br>TREASURE ' + tre + '%<br>TIME ' + Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2) + '</p><p style="text-align:center;color:#ffe36a">SCORE ' + P.score + '</p>',
    items: [G.fl < FLOORS.length - 1 ? { label: 'NEXT FLOOR', def: true, fn: function () { startFloor(G.fl + 1, true); } } : { label: 'THE END', def: true, fn: ending }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
/* ---------- drawing ---------- */
var DYN = null;
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (G.mode === 'nogl') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', KIT.W / 2, KIT.H / 2, { align: 'center' }); return; }
  if (!P || !MESH) { if (R3.ok) R3.begin([0.05, 0, 0.01]); ctx.fillStyle = '#070405'; ctx.fillRect(0, 0, KIT.W, KIT.H); return; }
  var F = FLOORS[G.fl], p = P, bob = Math.sin(p.bob) * 0.04, eye = [p.x, 1.35 + bob, p.z], at = [p.x + Math.sin(p.a), 1.35 + bob, p.z + Math.cos(p.a)];
  R3.begin(F.fog); R3.setCam(eye, at, KIT.W < KIT.H ? 1.3 : 1.15);
  var lights = ROOMS.map(function (R0) { return { x: R0.lamp.x, y: WH - 0.3, z: R0.lamp.z, r: 10, c: [1, 0.8, 0.6], k: 1.1, d: Math.hypot(R0.lamp.x - p.x, R0.lamp.z - p.z) }; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 6);
  if (p.mflash > 0) { p.mflash -= 1 / 60; lights.push({ x: p.x + Math.sin(p.a), y: 1.3, z: p.z + Math.cos(p.a), r: 8, c: [1, 0.9, 0.6], k: 2.4 }); }
  FX.forEach(function (f) { if (f.k === 'boom') lights.push({ x: f.x, y: 1.4, z: f.z, r: 8, c: [1, 0.5, 0.2], k: 3 }); });
  R3.scene({ fog: F.fog, fogR: [8, 30], amb: F.amb, lights: lights.slice(0, 8), torch: { p: [0, -99, 0], d: [0, 1, 0], c: [0, 0, 0] }, t: G.t });
  R3.draw(MESH, ATT);
  // doors slide sideways into the wall
  if (!DYN) DYN = new R3.Mesh(); DYN.clear();
  DOORS.forEach(function (D) { if (D.open >= 0.99) return; var cx = tx(D.i), cz = tx(D.j), o = D.open * TSZ, T = TL(D.gold ? 'doorgold' : 'door'), c = [0.5, 0.5, 0.5];
    if (D.ax === 'z') { var x0 = D.i * TSZ + o, x1 = x0 + TSZ; DYN.quad([x0, 0, cz - 0.1], [x1, 0, cz - 0.1], [x1, WH, cz - 0.1], [x0, WH, cz - 0.1], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [0, 0, -1]); DYN.quad([x1, 0, cz + 0.1], [x0, 0, cz + 0.1], [x0, WH, cz + 0.1], [x1, WH, cz + 0.1], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [0, 0, 1]); }
    else { var z0 = D.j * TSZ + o, z1 = z0 + TSZ; DYN.quad([cx - 0.1, 0, z1], [cx - 0.1, 0, z0], [cx - 0.1, WH, z0], [cx - 0.1, WH, z1], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [-1, 0, 0]); DYN.quad([cx + 0.1, 0, z0], [cx + 0.1, 0, z1], [cx + 0.1, WH, z1], [cx + 0.1, WH, z0], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [1, 0, 0]); } });
  R3.draw(DYN, ATT);
  // billboards from the sprite sheet
  var st = sheetTex(); if (st) { DYN.clear(); var R = R3.cam.right;
    function bb(n, x, z, hgt, y0, alpha) { var r = sprRect(n); if (!r) return; var w = hgt * r.w / r.h / 2; DYN.quad([x - R[0] * w, y0, z - R[2] * w], [x + R[0] * w, y0, z + R[2] * w], [x + R[0] * w, y0 + hgt, z + R[2] * w], [x - R[0] * w, y0 + hgt, z - R[2] * w], [0, 1, 1, 1, 1, 0, 0, 0], r.t, [0.5, 0.5, 0.5], [-R3.cam.fwd[0], 0, -R3.cam.fwd[2]]); }
    var ITEMSPR = { cracker: 'it_pizza', cuppa: 'it_espresso', condom: 'gr_shield', cream: 'it_cup', pies: 'it_pie', meat: 'it_chilli', key: 'gr_key', treasure: 'gr_coin5', w_shotgun: 'it_pie', w_swarm: 'it_charm', w_nado: 'it_moon' };
    THINGS.forEach(function (t) { if (t.got || Math.hypot(t.x - p.x, t.z - p.z) > 26) return; bb(ITEMSPR[t.k] || 'gr_coin', t.x, t.z, t.k.indexOf('w_') === 0 ? 0.6 : 0.4, 0.05 + Math.sin(G.t * 3 + t.x) * 0.04); });
    FOE.forEach(function (f) { var d = Math.hypot(f.x - p.x, f.z - p.z); if (d > 30) return; var nf = f.d.nf || 4, fr = f.d.s + (f.st === 'chase' ? Math.floor(G.t * 6 + f.x) % nf : 0); if (f.boss && f.hp < f.d.hp / 2 && f.B.s2) fr = f.B.s2 + (Math.floor(G.t * 3) % 2);
      var h = f.d.h * (f.boss ? 1 : 1), y0 = f.d.fly ? 0.3 + Math.sin(G.t * 3 + f.x) * 0.1 : 0; if (f.st === 'dead') { if (f.t > 1.2) return; h *= Math.max(0.15, 1 - f.t * 1.4); } bb(fr, f.x, f.z, h, y0); });
    R3.draw(DYN, st, { soft: false });
    // flashes on foes in pain or firing
    DYN.clear(); FOE.forEach(function (f) { if (f.st === 'dead' || !(f.pain > 0 || f.flashT > 0)) return; f.flashT = Math.max(0, (f.flashT || 0) - 1 / 60); var nf = f.d.nf || 4, fr = f.d.s + (Math.floor(G.t * 6 + f.x) % nf); bb(fr, f.x, f.z, f.d.h, f.d.fly ? 0.3 : 0); }); if (DYN.n) R3.draw(DYN, st, { flash: [0.5, 0.05, 0.05], alpha: 0.6 }); }
  DYN.clear(); var Rr = R3.cam.right; function sq(x, y, z, s, col) { DYN.quad([x - Rr[0] * s, y - s, z - Rr[2] * s], [x + Rr[0] * s, y - s, z + Rr[2] * s], [x + Rr[0] * s, y + s, z + Rr[2] * s], [x - Rr[0] * s, y + s, z - Rr[2] * s], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), col, [0, 0, 1], 2); }
  SHOTS.forEach(function (s) { sq(s.x, s.y, s.z, s.rocket ? 0.18 : 0.12, s.foe ? [0.6, 0.2, 0.6] : [0.6, 0.3, 0.2]); });
  FX.forEach(function (f) { f.t -= 1 / 60; if (f.k === 'blood') { f.vy -= 9 / 60; f.x += f.vx / 60; f.y += f.vy / 60; f.z += f.vz / 60; sq(f.x, f.y, f.z, 0.04, [0.5, 0.02, 0.02]); } else if (f.k === 'puff') sq(f.x, f.y, f.z, 0.08, [0.5, 0.5, 0.45]); else if (f.k === 'boom') sq(f.x, f.y, f.z, 1.2 * (1 - f.t), [0.6, 0.35, 0.1]); }); FX = FX.filter(function (f) { return f.t > 0; });
  R3.draw(DYN, ATT, { lit: false });
  hud();
}
function gunArt(g, k) { // the weapon in your hands, drawn in pixels over the picture
  var c = KIT.ctx, Wd = KIT.W, Hd = KIT.H - 40, x = Wd / 2 + Math.sin(P.bob) * 6, y = Hd + 6 + Math.abs(Math.cos(P.bob)) * 4 + k * 10, R = KIT.R;
  if (g.id === 'sausage') { c.save(); c.translate(x + 50, y - 10); c.rotate(-0.6 - k * 0.9); R('#12040a', -10, -96, 22, 98); R('#a8442a', -8, -94, 18, 94); R('#e8a080', -5, -90, 4, 76); R('#6a2410', -8, -40, 18, 2); R('#6a2410', -8, -70, 18, 2); c.restore(); R('#12040a', x + 33, y - 32, 30, 34); R('#f1e7d0', x + 35, y - 30, 26, 30); R('#c4121c', x + 33, y - 4, 30, 6); return; }
  function hand(hx, hy) { R('#12040a', hx - 13, hy - 12, 26, 30); R('#f1e7d0', hx - 11, hy - 10, 22, 26); R('#c8b890', hx - 11, hy + 8, 22, 8); R('#c4121c', hx - 13, hy + 14, 26, 6); R('#ffffff', hx - 9, hy - 8, 6, 3); }
  if (g.id === 'pistol') { R('#12040a', x - 14, y - 74, 28, 60); R('#4a4a52', x - 12, y - 72, 24, 26); R('#6a6a74', x - 12, y - 72, 24, 3); R('#2a2a30', x - 4, y - 80, 8, 10); R('#12040a', x - 3, y - 82, 6, 3); R('#f1e0b0', x - 9, y - 66, 18, 12); R('#fffbe8', x - 7, y - 64, 6, 4); R('#c4121c', x - 12, y - 46, 24, 4); hand(x, y - 32); }
  else if (g.id === 'shotgun') { R('#12040a', x - 26, y - 78, 52, 70); R('#6e3a1e', x - 24, y - 50, 48, 42); R('#8a5a30', x - 24, y - 50, 48, 3); R('#2a2a30', x - 18, y - 86, 14, 40); R('#2a2a30', x + 4, y - 86, 14, 40); R('#12040a', x - 15, y - 88, 8, 4); R('#12040a', x + 7, y - 88, 8, 4); R('#f1e0b0', x - 16, y - 62, 32, 8); R('#c4121c', x - 16, y - 56, 32, 2); hand(x - 18, y - 22); hand(x + 18, y - 26); }
  else if (g.id === 'swarm') { R('#12040a', x - 28, y - 72, 56, 66); R('#3a3a40', x - 26, y - 70, 52, 40); var sp2 = P.cd > 0 ? Math.floor(G.t * 40) % 4 : 0; for (var bb = 0; bb < 4; bb++) { R('#12040a', x - 22 + bb * 12, y - 92, 10, 26); R(bb === sp2 ? '#fffbe8' : '#f1e0b0', x - 21 + bb * 12, y - 91, 8, 24); } R('#c4121c', x - 26, y - 34, 52, 4); hand(x - 20, y - 20); hand(x + 20, y - 20); }
  else if (g.id === 'nado') { R('#12040a', x - 30, y - 80, 60, 74); R('#6a0a10', x - 28, y - 78, 56, 50); R('#8a1a20', x - 28, y - 78, 56, 4); c.fillStyle = '#12040a'; c.beginPath(); c.arc(x, y - 76, 18, 0, 6.3); c.fill(); c.fillStyle = '#a8442a'; c.beginPath(); c.arc(x, y - 76, 10, 0, 6.3); c.fill(); R('#ffe36a', x - 4, y - 46, 8, 8); hand(x - 22, y - 22); hand(x + 22, y - 22); }
  if (P.mflash > 0) { c.fillStyle = 'rgba(255,240,180,0.9)'; c.beginPath(); c.arc(x, y - 96, 14, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); c.arc(x, y - 96, 6, 0, 6.3); c.fill(); }
}
function hud() {
  var Wd = KIT.W, Hd = KIT.H, R = KIT.R, p = P, g = GUNS[p.gun];
  if (G.mode === 'play' || G.mode === 'dead') gunArt(g, p.kick);
  if (p.hurt > 0) { R('rgba(160,0,0,' + p.hurt * 0.7 + ')', 0, 0, Wd, Hd); } if (p.flash > 0) R('rgba(255,227,106,' + p.flash + ')', 0, 0, Wd, Hd);
  R('#0e0708', 0, Hd - 40, Wd, 40); R('#4a1a1c', 0, Hd - 40, Wd, 2); var cx = Wd / 2;
  function box(x, w, lab, val, col) { KIT.panel(x, Hd - 37, w, 34); KIT.text(lab, x + w / 2, Hd - 32, { align: 'center', size: 6, col: '#a6968f' }); KIT.text(String(val), x + w / 2, Hd - 22, { align: 'center', size: 16, col: col || '#ff2630' }); }
  box(cx - 236, 76, 'AMMO', g.ammo ? p.ammo[g.ammo] : '--'); box(cx - 156, 76, 'HEALTH', Math.max(0, Math.round(p.hp)) + '%'); box(cx + 80, 76, 'CONDOM', Math.round(p.arm) + '%', '#ff8ad0'); box(cx + 160, 76, 'SCORE', p.score, '#ffe36a');
  KIT.panel(cx - 38, Hd - 39, 76, 38); KIT.spr('cumface', cx, Hd - 3, { sc: 1, flash: p.hurt > 0.2 }); if (p.hp < 40) R('rgba(160,0,0,0.35)', cx - 30, Hd - 34, 60, 30);
  if (p.key) KIT.spr('gr_key', cx + 60, Hd - 26, { anchor: 'c' });
  KIT.text(g.n, cx, Hd - 50, { align: 'center', size: 6, col: '#a6968f', outline: 1 });
  R('rgba(255,255,255,0.5)', cx - 1, (Hd - 40) / 2 - 1, 2, 2);
  MSGS.forEach(function (m, n) { m.t -= 1 / 60; KIT.text(m.s, 8, 8 + n * 11, { size: 8, col: '#ffe36a', alpha: Math.min(1, m.t), outline: 1 }); }); MSGS = MSGS.filter(function (m) { return m.t > 0; });
  var boss = FOE.filter(function (f) { return f.boss && f.st !== 'dead' && f.st !== 'idle'; })[0]; if (boss) { var bw = Math.min(300, Wd - 60); KIT.text(boss.B.n, cx, 8, { align: 'center', size: 6 }); R('#12040a', cx - bw / 2 - 1, 17, bw + 2, 6); R('#c4121c', cx - bw / 2, 18, bw * boss.hp / boss.d.hp, 4); }
  if (G.banner) { var a = Math.min(1, G.banner.t, 3 - G.banner.t); KIT.text(G.banner.b || '', cx, Hd * 0.28, { align: 'center', size: 8, col: '#a6968f', alpha: a }); KIT.text(G.banner.s, cx, Hd * 0.28 + 12, { align: 'center', font: 'title', size: 30, col: '#ffe36a', alpha: a, outline: 1 }); }
  if (G.mode === 'dead') { R('rgba(120,0,0,' + Math.min(0.7, G.deadT * 0.5) + ')', 0, 0, Wd, Hd); KIT.text('YOU DIED', cx, Hd * 0.35, { align: 'center', font: 'title', size: 36, col: '#ff2630', alpha: Math.min(1, G.deadT) }); }
}
/* ---------- menus ---------- */
function deadMenu() { KIT.menu({ title: 'You Died', sub: FLOORS[G.fl].n + ': ' + FLOORS[G.fl].name, items: [{ label: 'TRY THIS FLOOR AGAIN', def: true, fn: function () { var n = G.fl; P = null; startFloor(n); } }, { label: 'TITLE', back: true, fn: titleMenu }] }); }
function ending() { G.mode = 'end'; music.play('c3a'); KIT.menu({ title: 'Castle Cleared', html: '<p>Blumhead pops like a bad zit and the whole castle goes quiet. Cumhead takes the lift all the way down, out of the front gate and into the red moonlight of Cum City, still holding the Meatnado Launcher. Nobody asks.</p><p style="color:#ffe36a;text-align:center">SCORE ' + P.score + '</p>', items: [{ label: 'TITLE', back: true, def: true, fn: titleMenu }] }); }
function floorMenu() { KIT.menu({ title: 'Pick a Floor', items: FLOORS.map(function (F, n) { return { label: F.n + '  ' + F.name, dis: n > SV.reached, fn: function () { P = null; startFloor(n); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]) }); }
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left stick / WASD. <b>Turn</b> right stick, the arrow keys or the mouse (click the picture). <b>Fire</b> X, RB, J or the left mouse button. <b>Use</b> A, Space or K: doors, the lift switch (the green light), cracked walls. <b>Next weapon</b> Y or L, 1 to 5 picks one.</p><p>Doors open as you walk at them. The gold door needs the gold key. Push cracked walls for secrets. Condoms soak up damage. The lift (a red panel with a green light) takes you up a floor.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function optsMenu() { KIT.menu({ title: 'Options', items: [{ label: 'TURN SPEED: ' + (SV.sens || 1).toFixed(2), fn: function () { SV.sens = (SV.sens || 1) >= 2 ? 0.5 : Math.round(((SV.sens || 1) + 0.25) * 100) / 100; persist(); optsMenu(); } }, R3.ok ? R3.resItem(optsMenu) : null, { label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode !== 'play' || KIT.menuOpen()) return; if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {} KIT.menu({ cls: 'clear', title: 'Paused', sub: FLOORS[G.fl].n + ': ' + FLOORS[G.fl].name, items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }, { label: 'QUIT', fn: titleMenu }] }); }
function titleMenu() { G.mode = 'title'; P = null; music.play('c3a'); if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {}
  KIT.menu({ cls: 'clear', logo: '../assets/c3-logo.webp', title: 'Cumstein 3D', items: [{ label: 'NEW GAME', cls: 'hot', def: true, fn: function () { P = null; startFloor(0); } }, SV.reached > 0 ? { label: 'PICK A FLOOR', fn: floorMenu } : null, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }] }); }
music.songs.c3a = { bpm: 138, beats: 4, vol: 0.85, wet: 0.25, lead: 'fm', fmbass: 1, bass: 'drive', acc: 'stabs', drums: 'rock', chords: 'Am Am F G Am Am Dm E', mel: 'a4 . a4 c5 e5 . d5 c5 | a4 - g4 - e4 - - - | f4 . f4 a4 c5 . b4 a4 | g4 - b4 - d5 - - - | a4 . a4 c5 e5 . a5 g5 | e5 - c5 - a4 - - - | d5 - f5 - a5 - f5 - | e5 - g#5 - b5 - e5 -' };
music.songs.c3b = { bpm: 120, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'gallop', acc: 'arp16', drums: 'boss', chords: 'Em C D B Em C Am B', mel: 'e5 - - g5 f#5 - e5 - | c5 - - - e5 - - - | d5 - - f#5 a5 - g5 f#5 | d#5 - - - b4 - - - | e5 g5 b5 - a5 - g5 - | c6 - b5 - g5 - e5 - | a5 - c6 - e6 - c6 - | b5 - d#6 - f#6 - b5 -' };
music.songs.c3boss = music.songs.boss;
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'up', ArrowDown: 'down', KeyJ: 'x', ControlLeft: 'x', KeyK: 'a', Space: 'a', KeyL: 'y', KeyE: 'a', Digit1: 'g1', Digit2: 'g2', Digit3: 'g3', Digit4: 'g4', Digit5: 'g5' });
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, onPause: pauseMenu, startPauses: true,
  pad: { sticks: true, btns: [{ k: 'x', label: 'X', sub: 'FIRE', cls: 'big' }, { k: 'a', label: 'A', sub: 'USE' }, { k: 'y', label: 'Y', sub: 'WEAPON' }] },
  padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' } });
titleMenu();
window.__c3 = { G: G, get P() { return P; }, get FOE() { return FOE; }, get THINGS() { return THINGS; }, get LIFT() { return LIFT; }, get DOORS() { return DOORS; }, startFloor: startFloor, finishFloor: finishFloor, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, solid: solid, tx: tx, tileOf: tileOf, get K() { return K; } };
