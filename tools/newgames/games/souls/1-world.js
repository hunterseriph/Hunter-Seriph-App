/* =====================================================================================================
   DARK LOADS: a souls-like in 3D (his ask: a souls-like is 3D, not a side-on game). Third person behind Cumhead
   (Psycho Nightmare's 3D model and engine), lock-on, roll, guard, stamina for everything. Light the candles (they heal
   you, refill the Cum Flask and bring every foe back), spend the Loads you take from the dead on levels, and when you
   die your Loads stay where you fell: get back to them without dying again. Four places, each laid by hand, shortcut
   doors that open from the far side, chasms that kill, a boss behind white fog at the end of each, and TB on his throne
   at the very end.
   Maps: one character per 2 m tile. '#' wall, ' ' chasm, '.' floor, 1-9 raised floor (0.5 m a step; one step is a stair,
   more is a ledge you can drop off but not climb), P start, C candle, X chest, F fog gate, B boss, E the way on,
   D / U shortcut door (opens only from the north / south side), T torch, R pillar, foes: g gimp, b butcher, p pill pusher,
   k clown, s strongman, a acrobat, m muckies (big), w bride (big).
   ===================================================================================================== */
var W = 480, H = 270, TSZ = 2, WALLH = 7;
var AREAS = [
  { id: 'ruins', name: 'THE CUM CITY RUINS', wall: 'brick', floor: 'cobble2', fog: [0.07, 0.015, 0.025], amb: [0.2, 0.12, 0.13], lamp: [1, 0.45, 0.2], song: 'dkruins', boss: 'muckies', moon: 1,
    map: [
      '#######################',
      '#########.E.###########',
      '#########...###########',
      '#####...........#######',
      '#####...........#######',
      '#####.....B.....#######',
      '#####...........#######',
      '#####...........#######',
      '##########F############',
      '##########.############',
      '######C...p...T########',
      '######..........#######',
      '###..g....###....g.####',
      '###.......###......####',
      '###..444..###..k...####',
      '###..4X4.....    ..####',
      '###..444.....    ..####',
      '###...3......    ..####',
      '###...2..b.........####',
      '###...1........###.####',
      '###......g.....###.####',
      '###########.######U####',
      '#.......T..........####',
      '#..k.......#######.####',
      '#...##..g..###.........',
      '#...##.....###.X......#',
      '#..........###........#',
      '#....C.....###..p.....#',
      '#....P................#',
      '#######################'] },
  { id: 'cath', name: 'THE CATHEDRAL OF BLUM', wall: 'marble2', floor: 'tilew', fog: [0.04, 0.03, 0.07], amb: [0.14, 0.12, 0.2], lamp: [0.8, 0.7, 1], song: 'dkcath', boss: 'bride',
    map: [
      '######################',
      '########.E.###########',
      '########...###########',
      '####............######',
      '####............######',
      '####.....B......######',
      '####............######',
      '####............######',
      '#########F############',
      '#########.############',
      '####.....C.....#######',
      '####.R.......R.#######',
      '####...........##...##',
      '####.R..p....R.D..X.##',
      '####...........##...##',
      '####.R...k...R.#######',
      '######   .   ##########',
      '######   .   ##########',
      '######   .   ##########',
      '######   g   ##########',
      '######   .   ##########',
      '####.....T.....#######',
      '####.R..s....R.#######',
      '####...........#######',
      '####.R...a...R.#######',
      '####...........#######',
      '####.R...X...R.#######',
      '####...........#######',
      '#######...############',
      '#######.C....g....#####',
      '#######..P........#####',
      '######################'] },
  { id: 'depths', name: 'THE BONE DEPTHS', wall: 'rockt', floor: 'bone2', fog: [0.03, 0.025, 0.02], amb: [0.13, 0.12, 0.1], lamp: [1, 0.75, 0.4], song: 'dkdepths', boss: 'stag',
    map: [
      '####################',
      '#######.E.##########',
      '#######...##########',
      '###.............####',
      '###.............####',
      '###......B......####',
      '###.............####',
      '###.............####',
      '########F###########',
      '########.###########',
      '###.....C....#######',
      '###..p....g..#######',
      '###...   ....#######',
      '###...   ..k.#######',
      '###...   ....#######',
      '###.....g....#######',
      '######.....##..X####',
      '######..b..##.....##',
      '######.....##.##..##',
      '#######...........##',
      '#####   ...  #######',
      '#####   .s.  #######',
      '#####   ...  #######',
      '###.........########',
      '###.T..g...#########',
      '###...##...#########',
      '###...##...#########',
      '###.C....P.#########',
      '####################'] },
  { id: 'keep', name: 'THE PILL KEEP', wall: 'stonewall2', floor: 'checker', fog: [0.07, 0.01, 0.04], amb: [0.2, 0.08, 0.14], lamp: [1, 0.25, 0.55], song: 'dkthrone', boss: 'tb',
    map: [
      '###################',
      '#######.E.#########',
      '#######...#########',
      '###.............###',
      '###.............###',
      '###......B......###',
      '###.............###',
      '###.............###',
      '########F##########',
      '########.##########',
      '#####...C...#######',
      '#####.p...p.#######',
      '#####.......#######',
      '#####...    #######',
      '#####..s    #######',
      '#####....g..#######',
      '######....a.#######',
      '######.........####',
      '######......X..####',
      '#########.#########',
      '#########.#########',
      '####...T.........##',
      '####..g.....k....##',
      '####........######',
      '####..C.P...######',
      '###################'] }
];
/* parse a map into tiles: k (0 floor, 1 wall, 2 chasm, 3 door), h (floor height in metres), and the things on it */
var WORLD = null;
function parseArea(ai) {
  var A = AREAS[ai], rows = A.map, MH = rows.length, MW = Math.max.apply(0, rows.map(function (r) { return r.length; })), K = new Uint8Array(MW * MH), Hh = new Float32Array(MW * MH), things = [];
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) { var ch = rows[j][i] || '#', q = j * MW + i, left = i > 0 ? Hh[q - 1] : 0;
    if (ch === '#') { K[q] = 1; continue; } if (ch === ' ') { K[q] = 2; continue; }
    if (ch >= '1' && ch <= '9') { Hh[q] = (+ch) * 0.5; continue; }
    if (ch === '.') { Hh[q] = 0; continue; }
    var lh = 0; if (i > 0 && rows[j][i - 1] >= '1' && rows[j][i - 1] <= '9') lh = (+rows[j][i - 1]) * 0.5; Hh[q] = lh;
    if (ch === 'D' || ch === 'U') { K[q] = 3; things.push({ k: 'door', i: i, j: j, from: ch === 'D' ? -1 : 1, id: A.id + ':' + i + ',' + j }); continue; }
    if (ch === 'R') { K[q] = 1; things.push({ k: 'pillar', i: i, j: j }); continue; }
    var t = { P: 'start', C: 'candle', X: 'chest', F: 'fog', B: 'boss', E: 'exit', T: 'torch' }[ch];
    if (t) things.push({ k: t, i: i, j: j, id: A.id + ':' + i + ',' + j });
    else if (FOES[ch]) things.push({ k: 'foe', f: FOES[ch].id, i: i, j: j });
  }
  var cand = 0; things.forEach(function (t) { if (t.k === 'candle') t.id = A.id + (cand++); });
  return { ai: ai, A: A, MW: MW, MH: MH, K: K, H: Hh, things: things };
}
function inMap(i, j) { return WORLD && i >= 0 && j >= 0 && i < WORLD.MW && j < WORLD.MH; }
function tk(i, j) { return inMap(i, j) ? WORLD.K[j * WORLD.MW + i] : 1; }
function th(i, j) { return inMap(i, j) ? WORLD.H[j * WORLD.MW + i] : 0; }
function tileOf(x) { return Math.floor(x / TSZ); }
function tx(i) { return (i + 0.5) * TSZ; }
function doorOpen(i, j) { var d = WORLD.things.filter(function (t) { return t.k === 'door' && t.i === i && t.j === j; })[0]; return !d || SV.doors[d.id]; }
function fogAt(i, j) { var f = WORLD.things.filter(function (t) { return t.k === 'fog' && t.i === i && t.j === j; })[0]; return f && G.fogShut; }
/* can a body standing at height y step onto tile (i, j)? */
function passable(i, j, y, who) { var k = tk(i, j); if (k === 1) return false; if (k === 3 && !doorOpen(i, j)) return false; if (who !== 'p' && k === 2) return false; if (who !== 'p' && fogAt(i, j)) return false; if (who === 'p' && fogAt(i, j) && G.inArena) return false; if (k !== 2 && th(i, j) - y > 0.6) return false; return true; }
function floorAt(x, z) { var i = tileOf(x), j = tileOf(z), k = tk(i, j); if (k === 2) return -60; return th(i, j); }
function collide(o, r, who) {
  var i0 = tileOf(o.x - r), i1 = tileOf(o.x + r), j0 = tileOf(o.z - r), j1 = tileOf(o.z + r);
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { if (passable(i, j, o.y, who)) continue; var bx0 = i * TSZ, bz0 = j * TSZ, bx1 = bx0 + TSZ, bz1 = bz0 + TSZ, nx = Math.max(bx0, Math.min(o.x, bx1)), nz = Math.max(bz0, Math.min(o.z, bz1)), dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
    if (d < r) { if (d < 1e-5) { o.x = tx(i) + (o.x > tx(i) ? 1 : -1) * (TSZ / 2 + r); } else { o.x = nx + dx / d * r; o.z = nz + dz / d * r; } } }
}
function lineClear(ax, az, bx, bz) { var dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz), n = Math.ceil(d / 0.5); for (var s = 1; s < n; s++) { var t = s / n, k = tk(tileOf(ax + dx * t), tileOf(az + dz * t)); if (k === 1 || (k === 3 && !doorOpen(tileOf(ax + dx * t), tileOf(az + dz * t)))) return false; } return true; }

/* ---------- the look of it ---------- */
PAINT.cobble2 = function (p) { p.fill('#2a2224'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) { var o = (y / 8) % 2 ? 4 : 0, c = shade('#5a4a4c', 0.75 + p.rnd() * 0.4); p.rect(x + o + 1, y + 1, 6, 6, c); p.rect(x + o + 1, y + 1, 6, 1, shade('#5a4a4c', 1.2)); } p.speck(['#3a1a1c', '#1a1012'], 60); };
PAINT.marble2 = function (p) { p.fill('#5a5468'); for (var i = 0; i < 6; i++) { var x = Math.floor(p.rnd() * 32), y = 0; while (y < 32) { p.px(x, y, '#3a3448'); x += Math.round(p.rnd() * 2 - 1); y++; } } p.rect(0, 0, 32, 2, '#7a7488'); p.rect(0, 16, 32, 1, '#3a3448'); p.speck(['#6a6478', '#4a4458'], 80); };
PAINT.bone2 = function (p) { p.fill('#4a4234'); p.speck(['#3a3428', '#5a5040', '#6a604c'], 300); for (var k = 0; k < 5; k++) { var x = Math.floor(p.rnd() * 26), y = Math.floor(p.rnd() * 30); p.rect(x, y, 6, 2, '#d8ccb0'); p.px(x - 1, y - 1, '#d8ccb0'); p.px(x + 6, y + 2, '#d8ccb0'); } };
PAINT.stonewall2 = function (p) { p.fill('#1a0a12'); for (var r = 0; r < 4; r++) for (var b = -1; b < 3; b++) { var x = b * 16 + (r % 2 ? 8 : 0); p.rect(x + 1, r * 8 + 1, 15, 7, shade('#4a2234', 0.7 + p.rnd() * 0.5)); p.rect(x + 1, r * 8 + 1, 15, 1, '#6a3450'); } p.speck(['#2a0a1a'], 40); };
PAINT.candlewax = function (p) { p.fill('#f1e7d0'); p.rect(20, 0, 6, 32, '#d8ccb0'); for (var i = 0; i < 4; i++) p.rect(4 + i * 6, 0, 3, 4 + Math.floor(p.rnd() * 12), '#fffbe8'); };
PAINT.fogwall = function (p) { p.fill('#f1e7d0'); p.speck(['#ffffff', '#d8ccb0'], 200); };
PAINT.sausage = function (p) { p.fill('#a8442a'); p.speck(['#8a3420', '#c45a3a', '#6a2410'], 120); for (var x = 0; x < 32; x += 6) p.rect(x, 4, 2, 1, '#e8a080'); };
function buildMesh() {
  var m = new R3.Mesh(), A = WORLD.A, rnd = srand(31 + WORLD.ai), MW = WORLD.MW, MH = WORLD.MH;
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  function face(a, b, y0, y1, T, n, k) { var v = (y1 - y0) / TSZ; m.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], [0, v, 1, v, 1, 0, 0, 0], T, vc(k || 0.9), n); }
  var D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
    var k = tk(i, j), x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ, h = th(i, j);
    if (k === 1) { var pil = WORLD.things.some(function (t) { return t.k === 'pillar' && t.i === i && t.j === j; });
      if (pil) { var cx = tx(i), cz = tx(j), r = 0.55; for (var s = 0; s < 8; s++) { var a0 = s / 8 * 6.283, a1 = (s + 1) / 8 * 6.283; m.quad([cx + Math.cos(a0) * r, 0, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, 0, cz + Math.sin(a1) * r], [cx + Math.cos(a1) * r, WALLH, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, WALLH, cz + Math.sin(a0) * r], [0, 3.5, 1, 3.5, 1, 0, 0, 0], TL(A.wall), vc(0.95), [Math.cos(a0 + 0.39), 0, Math.sin(a0 + 0.39)]); }
        m.quad([x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(A.floor), vc(0.8), [0, 1, 0]); continue; }
      D4.forEach(function (d) { var nk = tk(i + d[0], j + d[1]); if (nk === 1 && !WORLD.things.some(function (t) { return t.k === 'pillar' && t.i === i + d[0] && t.j === j + d[1]; })) return; var nh = nk === 2 ? -8 : th(i + d[0], j + d[1]), a, b; if (d[0] > 0) { a = [x1, z1]; b = [x1, z0]; } else if (d[0] < 0) { a = [x0, z0]; b = [x0, z1]; } else if (d[1] > 0) { a = [x0, z1]; b = [x1, z1]; } else { a = [x1, z0]; b = [x0, z0]; }
        for (var y = nh; y < WALLH; y += TSZ) face(a, b, y, Math.min(WALLH, y + TSZ), TL(A.wall), [d[0], 0, d[1]], 0.85 + rnd() * 0.15); });
      m.quad([x0, WALLH, z0], [x1, WALLH, z0], [x1, WALLH, z1], [x0, WALLH, z1], [0, 0, 1, 0, 1, 1, 0, 1], TL(A.wall), vc(0.6), [0, 1, 0]); continue; }
    if (k === 2) continue;
    m.quad([x0, h, z1], [x1, h, z1], [x1, h, z0], [x0, h, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(A.floor), vc(0.8 + rnd() * 0.2), [0, 1, 0]);
    D4.forEach(function (d) { var nk = tk(i + d[0], j + d[1]), nh = nk === 2 ? -10 : nk === 1 ? 99 : th(i + d[0], j + d[1]); if (nh >= h) return; var a, b; if (d[0] > 0) { a = [x1, z0]; b = [x1, z1]; } else if (d[0] < 0) { a = [x0, z1]; b = [x0, z0]; } else if (d[1] > 0) { a = [x1, z1]; b = [x0, z1]; } else { a = [x0, z0]; b = [x1, z0]; }
      for (var y2 = nh; y2 < h; y2 += TSZ) face(a, b, y2, Math.min(h, y2 + TSZ), TL(A.wall), [d[0], 0, d[1]], 0.7); });
  }
  WORLD.things.forEach(function (t) { var cx = tx(t.i), cz = tx(t.j), h = th(t.i, t.j);
    if (t.k === 'candle') { bx3(m, cx - 0.35, h, cz - 0.35, cx + 0.35, h + 0.2, cz + 0.35, TL('wood'), 0.7); cyl(m, cx, cz, h + 0.2, h + 1.0, 0.11, TL('candlewax'), 1); }
    else if (t.k === 'torch') { bx3(m, cx - 0.05, h, cz - 0.05, cx + 0.05, h + 2.4, cz + 0.05, TL('steel'), 0.5); bx3(m, cx - 0.15, h + 2.4, cz - 0.15, cx + 0.15, h + 2.55, cz + 0.15, TL('steel'), 0.6); }
  });
  return m.upload();
}
function bx3(m, x0, y0, z0, x1, y1, z1, T, k) { var c = [0.5 * k, 0.5 * k, 0.5 * k], w = (x1 - x0) / TSZ, hh = (y1 - y0) / TSZ, d = (z1 - z0) / TSZ;
  m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, w, 0, w, d, 0, d], T, c, [0, 1, 0]);
  m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, hh, w, hh, w, 0, 0, 0], T, c, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, hh, w, hh, w, 0, 0, 0], T, c, [0, 0, -1]);
  m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [0, hh, d, hh, d, 0, 0, 0], T, c, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [0, hh, d, hh, d, 0, 0, 0], T, c, [-1, 0, 0]); }
function cyl(m, cx, cz, y0, y1, r, T, k) { for (var s = 0; s < 8; s++) { var a0 = s / 8 * 6.283, a1 = (s + 1) / 8 * 6.283; m.quad([cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r], [0, 1, 1, 1, 1, 0, 0, 0], T, [0.5 * k, 0.5 * k, 0.5 * k], [Math.cos(a0 + 0.39), 0, Math.sin(a0 + 0.39)]); } }
