/* =====================================================================================================
   THE LAND, update 134 (his playtest: way too basic, you rarely get to change screen, screens look the same, the map is
   a square, it doesn't feel like a place). One big land of 160 x 120 tiles that scrolls with Cumhead (A Link to the Past,
   not screen by screen): a coast all round, the Bloodspine mountains with a pass, the Crimson Moors in the middle,
   Cum City (a walled town you can walk round, every shop front a door), the Cream Marsh and its lake, the Goonwood,
   Ejaculand, the Bone Fields and the Blum Wastes. Regions are laid from a hand-drawn map (MACRO), their edges wobble with
   noise, roads are dug between every door and the town gates (A*: bridges over water, steps up cliffs), and each region
   has its own ground, trees, water, clutter, landmarks, foes and music.
   ===================================================================================================== */
function srand(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hash2(i, j, s) { var h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, sc, s) { x /= sc; y /= sc; var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = hash2(i, j, s), b = hash2(i + 1, j, s), c = hash2(i, j + 1, s), d = hash2(i + 1, j + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
/* tiles: 0 ground, 1 tree, 2 rock, 3 water, 4 road, 5 bush (cut it), 6 cliff, 7 cave mouth, 8 dungeon door, 10 flowers, 11 bridge,
   12 cracked rock (bomb it), 13 grave, 14 lamp, 15 bones, 16 candles, 17 iron fence, 19 skulls, 31 cross, 32 roses, 33 puddle,
   34 city wall, 35 signpost, 36 sand, 38 paving, 39 building, 40 building door, 42 reeds, 44 striped post, 46 fountain,
   47 steps, 48 standing stone, 50 goo crystal, 51 the footprint of a big thing (drawn on its own), 52 mushrooms, 53 driftwood,
   54 shallows, 55 hedge, 56 flower box, 57 bench, 58 market stall,
   dungeons 20 floor, 21 wall, 22 block, 23 pit, 24 open door, 25 locked, 26 boss door, 27 shutter, 28 stairs out, 29 water,
   insides 60 boards, 61 wall, 62 counter, 63 rug, 64 table, 65 shelf, 66 barrel, 67 bed, 68 cave floor, 69 cave wall, 70 the way out,
   71 hearth, 72 stool, 73 cabinet, 74 plant pot */
var SOLID = {}; [1, 2, 3, 5, 6, 7, 8, 12, 13, 14, 17, 19, 31, 34, 35, 39, 40, 44, 46, 48, 50, 51, 53, 55, 57, 58, 21, 22, 25, 26, 27, 29, 61, 62, 64, 65, 66, 67, 69, 71, 73, 74].forEach(function (t) { SOLID[t] = 1; });
var WW = 160, WHT = 120, CELL = 5;
var MACRO = [
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~..~~~~~~~^^^^^^~~~~~~~~~~~',
  '~~~~.pppp.~~~^^^^^^^^^^^~~~~~~~~',
  '~~~.pppppp.^^^^wwwwww^^^^^~~~~~~',
  '~~.ppppppp^^^wwwwwwwwww^^^^^~~~~',
  '~~.ppppppff^^wwwwwwwwww^^^^^^~~~',
  '~~~.ppfffff^^^wwwwwwww^^^^bb^~~~',
  '~~~.fffffffff^^^wwww^^^^^bbbb^~~',
  '~~..ffffffffff^^^gg^^^^bbbbbbb~~',
  '~~.mmffffffffggggggggggbbbbbbb.~',
  '~.mmmmmfffffgggggggggggbbbbbbb.~',
  '~.mmmmmmmffgggggggggggbbbbbbb..~',
  '~.mmmllmmmggggggggggggggbbbbb.~~',
  '~~.mmllllmmggggggggggggggbbbb.~~',
  '~~.mmmllmmmgggggggggggggggbbb.~~',
  '~~~.mmmmmmmggggggCCCCCgggggbb.~~',
  '~~~.mmmmmmgggggggCCCCCgggggggg.~',
  '~~~~.mmmmgggggggCCCCCCggggggg.~~',
  '~~~~~..mmggggggCCCCCCgggggg..~~~',
  '~~~~~~~...ggggggCCCCCggggg.~~~~~',
  '~~~~~~~~~~.....ggCCCgg.....~~~~~',
  '~~~~~~~~~~~~~~...........~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'];
var BKEYS = ['sea', 'shore', 'moors', 'wood', 'marsh', 'bones', 'peaks', 'park', 'wastes', 'city', 'lake'], MCH = { '~': 0, '.': 1, g: 2, f: 3, m: 4, b: 5, '^': 6, p: 7, w: 8, C: 9, l: 10 };
var BIOME = {
  sea: { g: '#140406', g2: '#1a080a', t: '#3a0a12', tr: '#12040a', path: '#3a2c2a', water: '#2a0810', sea: 1, foes: [] },
  shore: { n: 'THE PALE SHORE', g: '#5e5042', g2: '#6e5e4c', t: '#3a2a1a', tr: '#1a0e08', path: '#4a3a2e', water: '#2a0810', foes: ['rat', 'slime', 'crawler'], song: 'lcover' },
  moors: { n: 'THE CRIMSON MOORS', g: '#2c1419', g2: '#3a1c22', t: '#7a0a14', tr: '#120406', path: '#3a2c2a', water: '#5a0a10', blood: 1, foes: ['slime', 'bat', 'rat', 'crawler'], song: 'lcover' },
  wood: { n: 'THE GOONWOOD', g: '#1c1416', g2: '#261c1e', t: '#24161e', tr: '#0a0406', path: '#2a2020', water: '#3a0a14', pine: 1, foes: ['ghoul', 'bat', 'imp', 'crawler'], song: 'moonarea' },
  marsh: { n: 'THE CREAM MARSH', g: '#2c2219', g2: '#382c20', t: '#5a4a2a', tr: '#140e08', path: '#3e3426', water: '#d8c898', cream: 1, foes: ['creamblob', 'slimeB', 'rat', 'cultrat'], song: 'sewer' },
  bones: { n: 'THE BONE FIELDS', g: '#3a302a', g2: '#463a32', t: '#4a3a30', tr: '#1a120e', path: '#5a4c40', water: '#120606', tar: 1, foes: ['skeleton', 'bonehound', 'mummy', 'bat'], song: 'bone' },
  peaks: { n: 'THE BLOODSPINE', g: '#2a1e1c', g2: '#342624', t: '#3a2a24', tr: '#1a100c', path: '#3a2e2a', water: '#3a0a12', foes: ['bat', 'skeleton'], song: 'lcover' },
  park: { n: 'EJACULAND', g: '#2a1020', g2: '#38182a', t: '#c4121c', tr: '#12040a', path: '#3a1a26', water: '#c4121c', blood: 1, foes: ['clown', 'balloon', 'ghoul', 'imp'], song: 'park' },
  wastes: { n: 'THE BLUM WASTES', g: '#24102a', g2: '#301636', t: '#5a1a6a', tr: '#0a0206', path: '#2e1028', water: '#5a1a6a', goo: 1, foes: ['blumling', 'blumeye', 'wraith', 'knight'], song: 'castle' },
  city: { n: 'CUM CITY', g: '#1a1012', g2: '#22161a', t: '#7a0a14', tr: '#120406', path: '#2a2024', water: '#d8c898', town: 1, foes: [], song: 'town' },
  lake: { n: 'THE CRIMSON MOORS', g: '#2c1419', g2: '#3a1c22', t: '#7a0a14', tr: '#120406', path: '#3a2c2a', water: '#5a0a10', blood: 1, foes: [], song: 'lcover' }
};
var WT = null, WB = null, SEA = null, STRUCTS = [], DOORS = {}, SPAWNS = [], WSIGNS = {}, WITEMS = [], TOWN = null, CHV = {};
function widx(i, j) { return j * WW + i; }
function macroAt(i, j) { var mx = Math.max(0, Math.min(31, Math.floor(i / CELL))), my = Math.max(0, Math.min(23, Math.floor(j / CELL))); var row = MACRO[my] || ''; return MCH[row[mx] || '~']; }
function genWorld() {
  if (WT) return; WT = new Uint8Array(WW * WHT); WB = new Uint8Array(WW * WHT); SEA = new Uint8Array(WW * WHT); STRUCTS = []; DOORS = {}; SPAWNS = []; WSIGNS = {}; WITEMS = [];
  var i, j, q;
  function get(i, j) { return i < 0 || j < 0 || i >= WW || j >= WHT ? 3 : WT[widx(i, j)]; }
  function set(i, j, v) { if (i >= 0 && j >= 0 && i < WW && j < WHT) WT[widx(i, j)] = v; }
  // 1. regions with wobbly edges
  for (j = 0; j < WHT; j++) for (i = 0; i < WW; i++) { var jx = (vnoise(i, j, 7, 1) - 0.5) * 7 + (vnoise(i, j, 2.5, 5) - 0.5) * 2, jy = (vnoise(i, j, 7, 2) - 0.5) * 7 + (vnoise(i, j, 2.5, 6) - 0.5) * 2;
    var b = macroAt(i + jx, j + jy); if (b === 9) b = 2; q = widx(i, j); WB[q] = b;
    if (b === 0) { WT[q] = 3; SEA[q] = 1; } else if (b === 10) WT[q] = 3; else if (b === 6) WT[q] = 6; else WT[q] = 0; }
  // beaches wherever land meets the sea
  for (j = 0; j < WHT; j++) for (i = 0; i < WW; i++) { q = widx(i, j); if (SEA[q] || WB[q] === 6) continue; var near = 0; for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) { var a = i + di, c = j + dj; if (a < 0 || c < 0 || a >= WW || c >= WHT || SEA[widx(a, c)]) near = 1; } if (near) { WT[q] = 36; if (WB[q] !== 1) WB[q] = 1; } }
  // 2. the river: off the Bloodspine, down through the moors, into the marsh lake
  var RIV = [[88, 44], [84, 49], [77, 53], [70, 58], [62, 61], [54, 63], [46, 66], [38, 67]];
  for (var s = 0; s < RIV.length - 1; s++) { var A = RIV[s], B2 = RIV[s + 1], n = Math.max(Math.abs(B2[0] - A[0]), Math.abs(B2[1] - A[1])) * 2;
    for (var k = 0; k <= n; k++) { var t = k / n, x = A[0] + (B2[0] - A[0]) * t, y = A[1] + (B2[1] - A[1]) * t + (vnoise(x, y, 6, 9) - 0.5) * 3; for (var w = 0; w < 2; w++) for (var h = 0; h < 2; h++) { var ri = Math.round(x) + w, rj = Math.round(y) + h; if (get(ri, rj) !== 6) set(ri, rj, 3); } } }
  // an island in the lake (a heart piece waits there for anyone with the balloon)
  for (j = 66; j <= 67; j++) for (i = 32; i <= 33; i++) set(i, j, 0); WITEMS.push({ k: 'piece', i: 32, j: 66, id: 'isle' });
  // 3. the land's clutter, clumped with noise so there are thickets and clearings
  for (j = 1; j < WHT - 1; j++) for (i = 1; i < WW - 1; i++) { q = widx(i, j); if (WT[q] !== 0 && WT[q] !== 36) continue; var bk = BKEYS[WB[q]], cl = vnoise(i, j, 5, 11 + WB[q]), r = hash2(i, j, 3), r2 = hash2(i, j, 4);
    if (bk === 'moors') { if (cl > 0.66 && r < 0.42) WT[q] = 1; else if (r < 0.05) WT[q] = 5; else if (r < 0.075) WT[q] = 32; else if (r < 0.09) WT[q] = 10; else if (r < 0.1) WT[q] = 2; else if (r < 0.106) WT[q] = 15; }
    else if (bk === 'wood') { if (cl > 0.38 && r < 0.78) WT[q] = 1; else if (r < 0.08) WT[q] = 5; else if (r < 0.12) WT[q] = 52; else if (r < 0.14) WT[q] = 10; }
    else if (bk === 'marsh') { if (cl > 0.64) WT[q] = r2 < 0.85 ? 3 : 42; else if (r < 0.14) WT[q] = 42; else if (r < 0.18) WT[q] = 33; else if (r < 0.22 && cl < 0.4) WT[q] = 1; else if (r < 0.24) WT[q] = 5; }
    else if (bk === 'bones') { if (cl > 0.72) WT[q] = 3; else if (r < 0.05) WT[q] = 15; else if (r < 0.07) WT[q] = 19; else if (r < 0.1) WT[q] = 2; else if (r < 0.12 && cl < 0.3) WT[q] = 1; else if (r < 0.13) WT[q] = 13; }
    else if (bk === 'park') { if (cl > 0.7 && r < 0.4) WT[q] = 1; else if (r < 0.03) WT[q] = 44; else if (r < 0.07) WT[q] = 32; else if (r < 0.1) WT[q] = 5; else if (r < 0.115) WT[q] = 33; }
    else if (bk === 'wastes') { if (cl > 0.68) WT[q] = 3; else if (r < 0.05) WT[q] = 50; else if (r < 0.08) WT[q] = 19; else if (r < 0.1) WT[q] = 16; else if (r < 0.12) WT[q] = 33; }
    else if (bk === 'shore') { if (r < 0.025) WT[q] = 53; else if (r < 0.04) WT[q] = 2; else if (r < 0.05) WT[q] = 15; } }
  // a few graveyards and stone circles on the moors
  [[60, 50], [110, 70], [70, 72], [48, 85]].forEach(function (c, n) { graveyard(c[0], c[1], n); });
  function graveyard(gx, gy, n) { for (var y = gy - 1; y <= gy + 3; y++) for (var x = gx - 1; x <= gx + 6; x++) { if (get(x, y) === 3 || get(x, y) === 6) return; } for (y = gy - 1; y <= gy + 3; y++) for (x = gx - 1; x <= gx + 6; x++) set(x, y, 0);
    for (x = gx - 1; x <= gx + 6; x++) { set(x, gy - 1, 17); if (x !== gx + 2 && x !== gx + 3) set(x, gy + 3, 17); } for (y = gy - 1; y <= gy + 3; y++) { set(gx - 1, y, 17); set(gx + 6, y, 17); }
    for (x = gx; x <= gx + 5; x++) { set(x, gy, x % 2 ? 31 : 13); if (hash2(x, gy, n) < 0.5) set(x, gy + 1, x % 3 ? 13 : 31); } set(gx + 1, gy + 2, 16); set(gx + 4, gy + 2, 32); }
  [[102, 52], [56, 30]].forEach(function (c) { for (var a = 0; a < 8; a++) { var x = Math.round(c[0] + Math.cos(a / 8 * 6.283) * 3.5), y = Math.round(c[1] + Math.sin(a / 8 * 6.283) * 2.5); set(x, y, 48); } for (var y = c[1] - 1; y <= c[1] + 1; y++) for (var x = c[0] - 2; x <= c[0] + 2; x++) set(x, y, 0); set(c[0], c[1], 16); });
  // 4. Cum City
  buildTown(set, get);
  // 5. doors and landmarks out in the land
  function clearArea(x0, y0, w, h, keep) { for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) { var t = get(x, y); if (keep && (t === 3 && SEA[widx(x, y)])) continue; set(x, y, WB[widx(x, y)] === 1 ? 36 : 0); } }
  function struct(k, cx, cy, w, h, door, to) { var x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h); clearArea(x0 - 2, y0 - 1, w + 4, h + 4); var S = { k: k, i: x0, j: y0, w: w, h: h, to: to }; for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) set(x, y, 51);
    if (door) { var di = x0 + Math.floor(w / 2), dj = y0 + h - 1; set(di, dj, to && to.dg !== undefined ? 8 : 40); S.door = { i: di, j: dj }; DOORS[widx(di, dj)] = { to: to, back: { x: (di + 0.5) * TS, y: (dj + 1.6) * TS }, s: S }; }
    STRUCTS.push(S); return S; }
  DUNGEONS.forEach(function (D, di) { struct(D.look, D.wx, D.wy, D.look === 'lair' ? 7 : 5, D.look === 'lair' ? 5 : 4, 1, { dg: di }); });
  struct('treehouse', 42, 48, 3, 3, 1, { in: 'harold' });
  struct('shack', 13, 58, 3, 3, 1, { in: 'shack' });
  struct('chapel', 67, 63, 4, 4, 1, { in: 'chapel' });
  struct('tent', 22, 28, 3, 3, 1, { in: 'tent' });
  struct('seacave', 43, 98, 3, 2, 1, { in: 'seacave' });
  struct('ferris', 28, 18, 5, 2, 0); struct('carousel', 41, 22, 4, 3, 0); struct('steve', 43, 32, 2, 2, 0);
  struct('ribs', 122, 67, 6, 1, 0); struct('wreck', 122, 103, 5, 2, 0); struct('bigtree', 32, 38, 2, 2, 0); struct('well', 56, 76, 2, 2, 0);
  // caves cut into the cliffs
  function cave(tx, ty, id, cracked) { var best = null, bd = 1e9; for (var y = ty - 10; y <= ty + 10; y++) for (var x = tx - 12; x <= tx + 12; x++) { if (get(x, y) !== 6 || get(x, y - 1) !== 6 || get(x - 1, y) !== 6 || get(x + 1, y) !== 6) continue; var b = get(x, y + 1); if (b !== 0 && b !== 36 && b !== 1 && b !== 5) continue; var d = Math.hypot(x - tx, y - ty); if (d < bd) { bd = d; best = [x, y]; } }
    if (!best) return; set(best[0], best[1], cracked ? 12 : 7); set(best[0], best[1] + 1, 0); DOORS[widx(best[0], best[1])] = { to: { in: id }, back: { x: (best[0] + 0.5) * TS, y: (best[1] + 1.6) * TS }, cracked: cracked ? id : null, cave: 1 }; }
  cave(72, 41, 'forge'); cave(116, 40, 'crack', 1); cave(56, 20, 'hideout'); cave(100, 44, 'bats'); cave(140, 46, 'crack2', 1);
  // more heart pieces out in the land
  WITEMS.push({ k: 'piece', i: 32, j: 41, id: 'grove' }, { k: 'piece', i: 147, j: 82, id: 'east' }, { k: 'piece', i: 72, j: 13, id: 'wastes' });
  WITEMS.forEach(function (it) { if (it.id !== 'isle') { set(it.i, it.j, 0); } });
  for (var g = 0; g < 10; g++) { var a2 = g / 10 * 6.283; set(32 + Math.round(Math.cos(a2) * 2), 41 + Math.round(Math.sin(a2) * 2), 5); } // the grove's hedge of thorn bushes
  // 6. roads: from the town's middle to every door, sharing the way where they can
  var goals = []; Object.keys(DOORS).forEach(function (k) { var d = DOORS[k]; if (d.town) return; goals.push([k % WW, ((k / WW) | 0) + 1]); });
  goals.push([TOWN.x + 16, TOWN.y - 2], [TOWN.x + 16, TOWN.y + TOWN.h + 1], [TOWN.x + TOWN.w + 1, TOWN.y + 13]);
  goals.sort(function (a, b) { return Math.hypot(a[0] - 92, a[1] - 86) - Math.hypot(b[0] - 92, b[1] - 86); });
  goals.forEach(function (gl) { road(TOWN.x + 16, TOWN.y + 13, gl[0], gl[1]); });
  WITEMS.forEach(function (it) { if (it.id === 'east' || it.id === 'wastes') road(TOWN.x + 16, TOWN.y + 13, it.i, it.j + 1); });
  function cost(t, q) { if (SEA[q]) return 0; if (t === 34 || t === 39 || t === 40 || t === 51 || t === 46 || t === 7 || t === 8 || t === 12 || t === 48 || t === 17 || t === 13 || t === 31) return 0; if (t === 4 || t === 11 || t === 47 || t === 38) return 1; if (t === 3) return 16; if (t === 6) return 22; if (t === 1 || t === 2 || t === 5 || t === 50 || t === 53 || t === 44) return 5; return 3; }
  function road(sx, sy, gx, gy) {
    var N = WW * WHT, dist = new Float32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), heap = [], s0 = widx(sx, sy), g0 = widx(gx, gy); dist[s0] = 0; heap.push([0, s0, 0]);
    function push(e) { heap.push(e); var c = heap.length - 1; while (c > 0) { var p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; var t = heap[p]; heap[p] = heap[c]; heap[c] = t; c = p; } }
    function pop() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var c = 0; for (;;) { var l = c * 2 + 1, r = l + 1, m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; var t = heap[m]; heap[m] = heap[c]; heap[c] = t; c = m; } } return top; }
    while (heap.length) { var e = pop(), u = e[1]; if (u === g0) break; if (e[2] > dist[u]) continue; var ux = u % WW, uy = (u / WW) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var vx = ux + d[0], vy = uy + d[1]; if (vx < 1 || vy < 1 || vx >= WW - 1 || vy >= WHT - 1) return; var v = widx(vx, vy), c = v === g0 ? 1 : cost(WT[v], v); if (!c) return; var nd = dist[u] + c; if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push([nd + (Math.abs(vx - gx) + Math.abs(vy - gy)) * 0.9, v, nd]); } }); }
    if (prev[g0] < 0 && g0 !== s0) return; var cur = g0, last = -1;
    while (cur >= 0) { var cx = cur % WW, cy = (cur / WW) | 0; pave(cx, cy); if (last >= 0) { var lx = last % WW; if (lx === cx) pave(cx + 1, cy); else pave(cx, cy + 1); } last = cur; cur = prev[cur]; } }
  function pave(x, y) { var q = widx(x, y), t = WT[q]; if (SEA[q] || t === 34 || t === 39 || t === 40 || t === 51 || t === 46 || t === 7 || t === 8 || t === 12 || t === 38 || t === 48 || t === 17 || t === 13 || t === 31) return; WT[q] = t === 3 || t === 11 ? 11 : t === 6 || t === 47 ? 47 : 4; }
  // 7. lamps by the roads, signposts at the town gates
  for (j = 2; j < WHT - 2; j++) for (i = 2; i < WW - 2; i++) { q = widx(i, j); if (WT[q] !== 0 && WT[q] !== 36) continue; var bk2 = BKEYS[WB[q]]; if (bk2 === 'wastes' || bk2 === 'city') continue; var nr = get(i + 1, j) === 4 || get(i - 1, j) === 4 || get(i, j + 1) === 4 || get(i, j - 1) === 4; if (nr && hash2(i, j, 8) < 0.04) WT[q] = 14; }
  sign(TOWN.x + 14, TOWN.y - 3, "NORTH: THE MOORS AND THE BLOODSPINE PASS. WEST: THE CREAM MARSH AND THE GOONWOOD. EAST: THE BONE FIELDS.");
  sign(TOWN.x + 14, TOWN.y + TOWN.h + 2, 'THE PALE SHORE. DO NOT SWIM. THE SEA IS NOT WATER.');
  sign(TOWN.x + TOWN.w + 2, TOWN.y + 11, 'EAST: THE BONE FIELDS. THE BONE PIT IS IN THE GREAT SKULL. NOBODY COMES BACK. (SOME DO.)');
  sign(86, 47, 'THE BLOODSPINE PASS. BEYOND IT THE BLUM WASTES AND THE LAIR. TURN BACK. -- B.');
  sign(45, 34, 'EJACULAND THIS WAY. STEVE SAYS HI.'); sign(27, 74, 'THE CREAM MARSH. DO NOT DRINK.'); sign(48, 52, "THE GOONWOOD. HAROLD'S TREE IS IN THE MIDDLE. MIND THE GHOULS.");
  sign(126, 45, 'THE BLOOD FACTORY. NO ENTRY. (THERE IS ENTRY.)');
  function sign(x, y, s) { for (var r = 0; r < 6; r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) { var t = get(x + dx, y + dy); if ((t === 0 || t === 36) && get(x + dx, y + dy + 1) !== 34) { set(x + dx, y + dy, 35); WSIGNS[widx(x + dx, y + dy)] = s; return; } } }
  // 8. foes: spawn points out in the wild, never in town or right by its gates
  for (j = 2; j < WHT - 2; j++) for (i = 2; i < WW - 2; i++) { q = widx(i, j); var tt = WT[q]; if (tt !== 0 && tt !== 36 && tt !== 4) continue; var B = BIOME[BKEYS[WB[q]]]; if (!B.foes || !B.foes.length) continue; if (i > TOWN.x - 6 && i < TOWN.x + TOWN.w + 6 && j > TOWN.y - 6 && j < TOWN.y + TOWN.h + 6) continue;
    if (hash2(i, j, 21) < 0.011) SPAWNS.push({ i: i, j: j, k: B.foes[Math.floor(hash2(i, j, 22) * B.foes.length)], live: null, cd: 0 }); }
}
/* Cum City: walls, gates, an avenue and a high street, the plaza with its cream fountain, and every shop front a door */
var SHOPS = [
  { id: 'club', fac: 'fac_club', x: 2, y: 2, w: 3, h: 6 }, { id: 'amy', fac: 'fac_amy', x: 6, y: 4, w: 3, h: 4 }, { id: 'saba', fac: 'fac_saba', x: 10, y: 4, w: 3, h: 4 },
  { id: 'tb', fac: 'fac_tb', x: 21, y: 4, w: 3, h: 4 }, { id: 't', fac: 'fac_t', x: 25, y: 4, w: 3, h: 4 }, { id: 'bonjo', fac: 'fac_bonjo', x: 29, y: 4, w: 3, h: 4 },
  { id: 'sanct', fac: 'fac_sanct', x: 2, y: 10, w: 3, h: 4 },
  { id: 'greebo', fac: 'fac_greebo', x: 2, y: 19, w: 3, h: 4 }, { id: 'joff', fac: 'fac_joff', x: 6, y: 19, w: 3, h: 4 }, { id: 'cafe', fac: 'fac_cafe', x: 10, y: 19, w: 4, h: 4 },
  { id: 'beebs', fac: 'fac_beebs', x: 21, y: 19, w: 3, h: 4 }, { id: 'arcade', fac: 'fac_arcade', x: 25, y: 19, w: 3, h: 4 }, { id: 'pulsar', fac: 'fac_pulsar', x: 29, y: 19, w: 3, h: 4 }];
function buildTown(set, get) {
  var X = 75, Y = 73, Wd = 34, Hd = 28; TOWN = { x: X, y: Y, w: Wd, h: Hd };
  for (var y = -1; y <= Hd; y++) for (var x = -1; x <= Wd; x++) { var q = widx(X + x, Y + y); WB[q] = 9; if (x < 0 || y < 0 || x >= Wd || y >= Hd) { if (WT[q] !== 3) WT[q] = 0; continue; } WT[q] = 38; }
  for (x = 0; x < Wd; x++) { set(X + x, Y, 34); set(X + x, Y + Hd - 1, 34); } for (y = 0; y < Hd; y++) { set(X, Y + y, 34); set(X + Wd - 1, Y + y, 34); }
  for (x = 15; x <= 18; x++) { set(X + x, Y, 38); set(X + x, Y + Hd - 1, 38); } for (y = 12; y <= 14; y++) set(X + Wd - 1, Y + y, 38);
  // the plaza: grass beds, the fountain in the middle, benches
  for (y = 10; y <= 16; y++) for (x = 12; x <= 21; x++) { var edge = y === 10 || y === 16 || x === 12 || x === 21; if (!edge && (x < 15 || x > 18) && (y < 12 || y > 14)) set(X + x, Y + y, hash2(x, y, 3) < 0.3 ? 32 : 0); }
  for (y = 12; y <= 14; y++) for (x = 16; x <= 17; x++) if (y !== 14) set(X + x, Y + y, 46);
  set(X + 13, Y + 11, 57); set(X + 20, Y + 11, 57); set(X + 13, Y + 15, 57); set(X + 20, Y + 15, 57);
  // a little park in the east, market stalls in the west
  for (y = 10; y <= 16; y++) for (x = 25; x <= 31; x++) if (y !== 13) set(X + x, Y + y, hash2(x, y, 9) < 0.35 ? 1 : hash2(x, y, 10) < 0.3 ? 32 : 0);
  for (x = 25; x <= 31; x++) { set(X + x, Y + 9, 55); set(X + x, Y + 17, 55); } set(X + 28, Y + 9, 38); set(X + 28, Y + 17, 38);
  set(X + 7, Y + 11, 58); set(X + 9, Y + 11, 58); set(X + 7, Y + 15, 58); set(X + 9, Y + 15, 58);
  // lamps down the avenue and along the high street
  for (y = 2; y < Hd - 1; y += 4) { set(X + 14, Y + y, 14); set(X + 19, Y + y, 14); } [4, 8, 24, 28].forEach(function (x) { set(X + x, Y + 9, 14); set(X + x, Y + 17, 14); });
  set(X + 1, Y + 1, 1); set(X + 32, Y + 1, 1); set(X + 1, Y + 26, 1); set(X + 32, Y + 26, 1); set(X + 13, Y + 1, 56); set(X + 20, Y + 1, 56);
  // the shops
  SHOPS.forEach(function (s) { for (var y = 0; y < s.h; y++) for (var x = 0; x < s.w; x++) set(X + s.x + x, Y + s.y + y, 39); var di = X + s.x + Math.floor(s.w / 2), dj = Y + s.y + s.h - 1; set(di, dj, 40); set(di, dj + 1, 38);
    var S = { k: 'shop', fac: s.fac, i: X + s.x, j: Y + s.y, w: s.w, h: s.h, door: { i: di, j: dj }, to: { in: s.id } }; STRUCTS.push(S); DOORS[widx(di, dj)] = { to: { in: s.id }, back: { x: (di + 0.5) * TS, y: (dj + 1.6) * TS }, s: S, town: 1 }; });
  TOWN.home = { x: (X + 3 + 0.5) * TS, y: (Y + 8 + 0.6) * TS };
}
