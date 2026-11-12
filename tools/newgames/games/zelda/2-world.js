/* ---------- the land: 8 x 6 areas of 27 x 21 tiles, each walled in by its own country (forest, cliffs, reeds, thorns,
   hedges, the city wall) and joined to its neighbours only where EDGES says, through a passage three tiles wide.
   The shape inside each area comes from a hand-drawn block plan (TPL, one character = 3 x 3 tiles, mirrored for
   variety), then the edges are worn ragged, things are placed (POIS), roads are laid between the passages and the
   doors, and everything left over is dressed with trees, bushes, tall grass, rocks and flowers. ---------- */
function srand(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hash2(i, j, s) { var h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/* tiles: 0 ground, 1 wall, 2 rock, 3 water, 4 road, 5 bush, 6 tree, 9 ledge, 10 bridge, 11 flowers, 12 cracked rock, 13 grave, 14 lamp, 15 bones,
   16 candles, 17 fence, 18 pegs up, 19 pegs down, 20 orb, 21 stone eye, 22 chasm, 23 blood boulder, 26 sign, 27 statue, 30 tall grass, 31 cross,
   33 skulls, 40 building (solid), 41 door, 42 cave mouth, 43 standing stone, 45 bench, 46 stall, 48 stump, 49 mushrooms
   inside: 60-75 (3b-inside.js); dungeons: 80-99 (2b-dungeon.js) */
var SOLID = {}; [1, 2, 3, 5, 6, 9, 79, 12, 13, 14, 17, 18, 20, 21, 23, 26, 27, 31, 33, 40, 41, 42, 43, 45, 46, 48, 61, 62, 64, 65, 66, 67, 69, 71, 73, 74, 75, 76, 81, 83, 84, 85, 86, 87, 89, 90, 91, 92, 94, 96, 97].forEach(function (t) { SOLID[t] = 1; });
var FLYSOLID = {}; [1, 6, 79, 14, 21, 26, 27, 40, 41, 42, 43, 46, 61, 69, 81, 84, 85, 86, 87, 89, 90, 91, 92, 96, 97].forEach(function (t) { FLYSOLID[t] = 1; });
var AW = 27, AH = 21, NX = 8, NY = 6, WW = AW * NX, WHT = AH * NY;
var BIO = ['ppfwwkkk', 'pffwkkbk', 'ffmmmkbb', 'ssmmmmbb', 'ssmCCmmb', 'asmCCmaa'];
var BIOMES = {
  m: { k: 'moors', n: 'THE CRIMSON MOORS', wall: 'forest', water: 'blood', road: 'dirt', tree: ['red', 'red', 'dead'], treeD: 0.02, bush: 'red', foes: ['slime', 'rat', 'crawler', 'bat'], song: 'lcover', map: '#3a1416' },
  f: { k: 'wood', n: 'THE GOONWOOD', wall: 'woodsy', water: 'blood', road: 'dirt', tree: ['wine', 'pine', 'wine'], treeD: 0.05, bush: 'wine', foes: ['ghoul', 'bat', 'slimeB', 'crawler'], song: 'castle', map: '#2a1424' },
  p: { k: 'park', n: 'EJACULAND', wall: 'hedge', water: 'cream', road: 'flag', tree: ['mush'], treeD: 0.02, bush: 'pink', foes: ['clown', 'balloon', 'imp'], song: 'park', map: '#3a0e2a' },
  s: { k: 'marsh', n: 'THE CREAM MARSH', wall: 'reeds', water: 'cream', road: 'dirt', tree: ['dead'], treeD: 0.012, bush: 'olive', foes: ['creamblob', 'slime', 'rat'], song: 'sewer', map: '#3a3020' },
  b: { k: 'bones', n: 'THE BONE FIELDS', wall: 'bonecliff', water: 'blood', road: 'dirt', tree: ['dead'], treeD: 0.012, bush: 'bone', foes: ['skeleton', 'bonehound', 'mummy', 'bat'], song: 'bone', map: '#4a3e32' },
  k: { k: 'peaks', n: 'THE BLOODSPINE', wall: 'cliff', water: 'blood', road: 'flag', tree: ['pine'], treeD: 0.015, bush: 'wine', foes: ['imp', 'bat', 'knight'], song: 'castle', map: '#3a2e30' },
  w: { k: 'wastes', n: 'THE BLUM WASTES', wall: 'thorns', water: 'goo', road: 'dirt', tree: ['goo'], treeD: 0.02, bush: 'goo', foes: ['blumling', 'wraith', 'cultist'], song: 'moonarea', map: '#2a1034' },
  a: { k: 'shore', n: 'THE BLOOD COAST', wall: 'cliff', water: 'blood', road: 'dirt', tree: ['dead'], treeD: 0.006, bush: 'olive', foes: ['crawler', 'rat'], song: 'lcover', map: '#4a3624' },
  C: { k: 'city', n: 'CUM CITY', wall: 'cwall', water: 'blood', road: 'flag', tree: ['red'], treeD: 0, bush: 'red', foes: [], song: 'town', map: '#2a2022' }
};
/* how the areas join: [ax, ay, bx, by, kind]. '' open, b bushes, k cracked rocks, o red pegs (an orb waits past them), e a stone eye,
   c a chasm, h blood boulders, v a ledge you can only hop down (a to b). The gated side is b. */
var EDGES = [
  [2, 2, 2, 3, ''], [2, 2, 3, 2, 'b'], [3, 2, 4, 2, ''], [4, 2, 4, 3, ''], [2, 3, 3, 3, ''], [3, 3, 4, 3, ''], [4, 3, 5, 3, ''], [2, 3, 2, 4, ''], [2, 4, 2, 5, ''], [5, 3, 5, 4, ''], [5, 4, 5, 5, ''], [5, 4, 6, 4, ''], [6, 4, 6, 5, ''], [6, 5, 7, 5, ''], [5, 5, 6, 5, 'k'],
  [2, 4, 3, 4, ''], [3, 3, 3, 4, ''], [4, 3, 4, 4, ''], [5, 5, 4, 5, ''],
  [2, 4, 1, 4, 'b'], [1, 4, 0, 4, ''], [0, 4, 0, 3, ''], [0, 3, 1, 3, ''], [1, 4, 1, 5, ''], [0, 4, 0, 5, ''], [1, 3, 1, 4, 'b'],
  [6, 4, 6, 3, 'o'], [6, 3, 7, 3, ''], [7, 3, 7, 4, ''], [6, 3, 6, 2, ''], [6, 2, 7, 2, ''], [7, 2, 7, 3, 'k'], [6, 2, 6, 1, ''],
  [2, 2, 2, 1, 'e'], [1, 2, 0, 2, ''], [1, 2, 1, 1, ''], [1, 1, 2, 1, ''], [2, 1, 2, 0, ''], [1, 1, 1, 0, ''], [0, 2, 0, 1, ''], [0, 1, 0, 0, ''], [0, 0, 1, 0, ''], [1, 0, 2, 0, 'k'], [1, 2, 1, 3, 'v'],
  [6, 1, 6, 0, 'c'], [6, 0, 5, 0, ''], [6, 0, 7, 0, ''], [5, 0, 5, 1, ''], [5, 1, 4, 1, ''], [5, 1, 5, 2, ''], [7, 0, 7, 1, ''], [5, 2, 5, 3, 'v'], [6, 1, 7, 1, 'c'],
  [4, 1, 3, 1, 'h'], [3, 1, 3, 0, ''], [3, 0, 4, 0, ''], [3, 1, 3, 2, 'v']
];
/* block plans for an area's inside (7 x 5 blocks; the ring round them is the wall). # wall, ~ water, = bridge, , rough ground */
var TPL = [
  ['.......', '.##.##.', '.......', '.##.##.', '.......'],
  ['.,.....', '..~~~..', '.~~~~~.', '..~~~,.', '.......'],
  ['..#.#..', '.##.##.', '.......', '.##.##.', '..#.#..'],
  ['....~..', '.,..~#.', '....=..', '.#..~..', '....~,.'],
  ['.......', '.##.##.', '.#...#.', '.##.##.', '.,.....'],
  ['.#.....', '..#..#.', '.......', '.#..#..', '.....#.'],
  ['~~~....', '~~~..#.', '.......', '~~~..#.', '~~~..,.'],
  ['.#.....', '.#.###.', '.......', '.###.#.', '.....#.'],
  ['.......', '~~~=~~~', '.......', '.,.....', '.#...#.'],
  ['.#...#.', '...#...', '.......', '...#...', '.#...#.'],
  ['..#.#..', '.#...#.', '.......', '.#...#.', '..#.#..'],
  ['##...##', '#.....#', '.......', '#.....#', '##...##'],
  ['.,.#...', '...#.#.', '.......', '.#.#...', '...#.,.'],
  ['...,...', '.#~~~#.', '..~~~..', '.#~~~#.', '.......']
];
/* what stands in each area */
var POIS = {
  '0,4': [{ k: 'dg', d: 0 }], '7,3': [{ k: 'dg', d: 1 }], '0,0': [{ k: 'dg', d: 2 }], '7,0': [{ k: 'dg', d: 3 }], '3,0': [{ k: 'dg', d: 4 }],
  '2,2': [{ k: 'st', s: 'st_chapel', id: 'chapel' }, { k: 'graves' }], '5,3': [{ k: 'st', s: 'st_tent', id: 'tent' }], '0,3': [{ k: 'st', s: 'st_shack', id: 'shack' }], '1,1': [{ k: 'st', s: 'st_treehouse', id: 'harold' }],
  '6,5': [{ k: 'cave', id: 'seacave' }], '5,1': [{ k: 'cave', id: 'forge' }], '4,2': [{ k: 'cave', id: 'hideout' }], '6,2': [{ k: 'cave', id: 'bats' }], '2,5': [{ k: 'cave', id: 'crack', cracked: 1 }], '7,1': [{ k: 'cave', id: 'crack2', cracked: 1 }],
  '1,0': [{ k: 'deco', s: 'st_ferris' }], '0,1': [{ k: 'deco', s: 'st_carousel' }], '6,1': [{ k: 'deco', s: 'st_skullsign' }], '7,5': [{ k: 'deco', s: 'st_wreck' }], '2,1': [{ k: 'deco', s: 'st_bigtree' }], '5,4': [{ k: 'deco', s: 'pr_well' }], '2,3': [{ k: 'circle' }],
  '4,3': [{ k: 'graves' }], '7,2': [{ k: 'graves' }], '6,3': [{ k: 'graves' }]
};
var PIECES = { '1,5': 'b', '2,0': 'b', '7,4': 'k', '5,0': 'c', '3,1': 'h', '6,4': 'o', '4,3': 'k', '0,2': 'b' };
var GATEMSG = { b: 'Thick bushes. Something sharp would cut through them.', k: 'A cracked rock. A bomb would split it.', o: 'Red pegs block the way. There is an orb past them, out of reach.', e: 'A stone eye stares at you. It does not blink. Something from far away might make it.', c: 'A chasm. Far too wide to jump.', h: 'A blood boulder. Far too heavy for you as you are.', v: '' };
var WT = null, WA = null, WV = null, STRUCTS = [], DOORS = {}, SPAWNS = [], WSIGNS = {}, WITEMS = [], TREES = [], GATES = [], TOWN = null, CHV = {}, AREAINFO = {};
function widx(i, j) { return j * WW + i; }
function bioAt(i, j) { var ax = Math.max(0, Math.min(NX - 1, Math.floor(i / AW))), ay = Math.max(0, Math.min(NY - 1, Math.floor(j / AH))), b = BIO[ay][ax];
  if (b === 'C' && TOWN && TOWN.inner && (i < TOWN.x + 3 || j < TOWN.y + 3 || i >= TOWN.x + TOWN.w - 3 || j >= TOWN.y + TOWN.h - 3)) return 'm'; /* the wood round the town (its wall too) */ return b; }
function walkable(t) { return !SOLID[t] && t !== 22 && t !== 3 && t >= 0; }
function genWorld() {
  if (WT) return; WT = new Uint8Array(WW * WHT); WV = new Uint8Array(WW * WHT); STRUCTS = []; DOORS = {}; SPAWNS = []; WSIGNS = {}; WITEMS = []; TREES = []; GATES = []; AREAINFO = {};
  var rnd = srand(7331), i, j;
  function set(i, j, v) { if (i >= 0 && j >= 0 && i < WW && j < WHT) WT[widx(i, j)] = v; }
  function get(i, j) { return i < 0 || j < 0 || i >= WW || j >= WHT ? 1 : WT[widx(i, j)]; }
  var edgeOf = {}; EDGES.forEach(function (e) { edgeOf[e[0] + ',' + e[1] + '>' + e[2] + ',' + e[3]] = e; edgeOf[e[2] + ',' + e[3] + '>' + e[0] + ',' + e[1]] = e; });
  function sides(ax, ay) { var o = {}; [['n', 0, -1], ['s', 0, 1], ['w', -1, 0], ['e', 1, 0]].forEach(function (d) { var e = edgeOf[ax + ',' + ay + '>' + (ax + d[1]) + ',' + (ay + d[2])]; if (e) o[d[0]] = e; }); return o; }
  // 1. the block plans
  var used = {};
  for (var ay = 0; ay < NY; ay++) for (var ax = 0; ax < NX; ax++) {
    var bio = BIO[ay][ax], x0 = ax * AW, y0 = ay * AH, info = AREAINFO[ax + ',' + ay] = { ax: ax, ay: ay, bio: bio, x0: x0, y0: y0, sides: sides(ax, ay) };
    if (bio === 'C') continue;
    var pick = Math.floor(hash2(ax, ay, 3) * TPL.length); for (var tries = 0; tries < TPL.length && (used[pick + ',' + (ax - 1) + ',' + ay] || used[pick + ',' + ax + ',' + (ay - 1)]); tries++) pick = (pick + 1) % TPL.length; used[pick + ',' + ax + ',' + ay] = 1;
    var tp = TPL[pick], mx = hash2(ax, ay, 5) < 0.5, my = hash2(ax, ay, 6) < 0.5 && tp.join('').indexOf('=') < 0; info.tpl = pick;
    for (j = 0; j < AH; j++) for (i = 0; i < AW; i++) {
      var bx = Math.floor(i / 3), by = Math.floor(j / 3), ch = '#';
      if (bx >= 1 && bx <= 7 && by >= 1 && by <= 5) { var r = tp[my ? 5 - by : by - 1]; ch = r[mx ? 7 - bx : bx - 1]; }
      var v = ch === '#' ? 1 : ch === '~' ? 3 : ch === '=' ? 10 : 0; set(x0 + i, y0 + j, v); if (ch === ',') WV[widx(x0 + i, y0 + j)] = 1;
    }
    // the sea along the south of the land
    if (ay === NY - 1) for (j = AH - (bio === 'a' ? 5 : 3); j < AH; j++) for (i = 0; i < AW; i++) set(x0 + i, y0 + j, 3);
    // the passages
    Object.keys(info.sides).forEach(function (s) { var a, b; if (s === 'n' || s === 's') { for (j = 0; j < 6; j++) for (i = 12; i <= 14; i++) { var jj = s === 'n' ? j : AH - 1 - j; if (get(x0 + i, y0 + jj) !== 3) set(x0 + i, y0 + jj, 0); } }
      else { for (i = 0; i < 6; i++) for (j = 9; j <= 11; j++) { var ii = s === 'w' ? i : AW - 1 - i; set(x0 + ii, y0 + j, 0); } } });
  }
  // 2. ragged edges: wall tiles touching open ground wear away (never the outer two rows of an area, so areas stay shut)
  for (j = 1; j < WHT - 1; j++) for (i = 1; i < WW - 1; i++) { if (get(i, j) !== 1) continue; var li = i % AW, lj = j % AH; if (li < 2 || lj < 2 || li > AW - 3 || lj > AH - 3) continue; if (BIO[Math.floor(j / AH)][Math.floor(i / AW)] === 'C') continue;
    var open = (get(i - 1, j) === 0) + (get(i + 1, j) === 0) + (get(i, j - 1) === 0) + (get(i, j + 1) === 0); if (open && hash2(i, j, 11) < 0.22 * open) WV[widx(i, j)] = 9; }
  for (var q = 0; q < WT.length; q++) if (WV[q] === 9) { WT[q] = 0; WV[q] = 0; }
  // 3. Cum City
  buildTown(set, get);
  // 4. things in the areas
  Object.keys(AREAINFO).forEach(function (key) { var A = AREAINFO[key]; if (A.bio === 'C') return; (POIS[key] || []).forEach(function (p) { placePoi(A, p, set, get, rnd); }); if (PIECES[key]) pocket(A, PIECES[key], set, get); });
  // 5. the gates in the passages
  EDGES.forEach(function (e, n) { if (e[4]) gate(e, n, set, get); });
  // 6. roads, then dressing, then make sure every way through still works
  Object.keys(AREAINFO).forEach(function (key) { var A = AREAINFO[key]; if (A.bio === 'C') return; roads(A, set, get); });
  Object.keys(AREAINFO).forEach(function (key) { var A = AREAINFO[key]; if (A.bio === 'C') return; dress(A, set, get); });
  Object.keys(AREAINFO).forEach(function (key) { var A = AREAINFO[key]; if (A.bio === 'C') return; mend(A, set, get); });
  // 7. foes wait at spawn points
  Object.keys(AREAINFO).forEach(function (key) { var A = AREAINFO[key], B = BIOMES[A.bio]; if (!B.foes.length) return; var r = srand(900 + A.ax * 31 + A.ay * 17), n = 0;
    for (var t = 0; t < 40 && n < 3 + (A.ax + A.ay) % 2; t++) { var ii = A.x0 + 4 + Math.floor(r() * (AW - 8)), jj = A.y0 + 4 + Math.floor(r() * (AH - 8)); if (get(ii, jj) !== 0 && get(ii, jj) !== 30) continue; SPAWNS.push({ i: ii, j: jj, k: B.foes[Math.floor(r() * B.foes.length)], cd: 0, live: null }); n++; } });
}
/* the middle of an area's floor, for roads to meet at */
function hubOf(A, get) { var best = null, bd = 1e9; for (var j = 4; j < AH - 4; j++) for (var i = 4; i < AW - 4; i++) { var t = get(A.x0 + i, A.y0 + j); if (t !== 0 && t !== 4) continue; var d = Math.abs(i - 13) + Math.abs(j - 10); if (d < bd) { bd = d; best = [A.x0 + i, A.y0 + j]; } } return best || [A.x0 + 13, A.y0 + 10]; }
function freeRect(get, i0, j0, w, h) { for (var j = j0; j < j0 + h; j++) for (var i = i0; i < i0 + w; i++) { var t = get(i, j); if (t !== 0 && t !== 4) return false; } return true; }
function placePoi(A, p, set, get, rnd) {
  var x0 = A.x0, y0 = A.y0;
  if (p.k === 'st' || p.k === 'dg' || p.k === 'deco') { var s = p.k === 'dg' ? 'st_' + DUNGEONS[p.d].look : p.s, sz = KITSIZE(s), fw = Math.max(2, Math.ceil(sz.w / TS) - (p.k === 'deco' ? 1 : 0)), best = null, bd = 1e9;
    for (var j = 5; j < AH - 4; j++) for (var i = 4; i < AW - 4 - fw; i++) { if (!freeRect(get, x0 + i - 1, y0 + j - 2, fw + 2, 6)) continue; var d = Math.abs(i + fw / 2 - 13.5) + Math.abs(j - 9) * 1.3; if (d < bd) { bd = d; best = [i, j]; } }
    if (!best) { best = [13 - Math.floor(fw / 2), 10]; for (var jj = -2; jj <= 3; jj++) for (var ii = -1; ii <= fw; ii++) set(x0 + best[0] + ii, y0 + best[1] + jj, 0); }
    var bi = x0 + best[0], bj = y0 + best[1], S = { i: bi, j: bj, w: fw, spr: s, id: p.id || ('d' + p.d), cx: (bi + fw / 2) * TS };
    for (var a = 0; a < fw; a++) { set(bi + a, bj, 40); set(bi + a, bj - 1, 40); }
    if (p.k !== 'deco') { var di = bi + Math.floor(fw / 2); if (fw % 2 === 0) S.cx = (di + 0.5) * TS; set(di, bj, 41); DOORS[widx(di, bj)] = { to: p.k === 'dg' ? { dg: p.d } : { in: p.id }, back: { x: (di + 0.5) * TS, y: (bj + 1.7) * TS } }; S.door = [di, bj]; if (p.k === 'dg') DUNGEONS[p.d].wx = di, DUNGEONS[p.d].wy = bj; }
    STRUCTS.push(S); A.targets = (A.targets || []).concat([[Math.floor(S.cx / TS), bj + 1]]); return; }
  if (p.k === 'cave') { var c = null, cd = 1e9;
    for (var j2 = 4; j2 < AH - 4; j2++) for (var i2 = 4; i2 < AW - 4; i2++) { var I = x0 + i2, J = y0 + j2; if (get(I, J) === 1 && get(I, J - 1) === 1 && get(I, J - 2) === 1 && get(I - 1, J) === 1 && get(I + 1, J) === 1 && get(I - 1, J - 1) === 1 && get(I + 1, J - 1) === 1 && get(I, J + 1) === 0 && get(I, J + 2) === 0 && get(I - 1, J + 1) === 0 && get(I + 1, J + 1) === 0) { var d2 = Math.abs(i2 - 13) + Math.abs(j2 - 10) + hash2(I, J, 4) * 6; if (d2 < cd) { cd = d2; c = [I, J]; } } }
    if (!c) { var h = hubOf(A, get), ci = h[0] + 3, cj = h[1] - 1; for (var dj = -3; dj <= 0; dj++) for (var dx = -2; dx <= 2; dx++) set(ci + dx, cj + dj, 1); for (dx = -2; dx <= 2; dx++) { set(ci + dx, cj + 1, 0); set(ci + dx, cj + 2, 0); } c = [ci, cj]; }
    set(c[0], c[1], 42); DOORS[widx(c[0], c[1])] = { to: { in: p.id }, back: { x: (c[0] + 0.5) * TS, y: (c[1] + 1.7) * TS }, cracked: p.cracked ? p.id : null, cave: 1 };
    A.targets = (A.targets || []).concat([[c[0], c[1] + 1]]); return; }
  if (p.k === 'graves') { var h2 = hubOf(A, get), r = srand(A.ax * 7 + A.ay * 13 + 3), n = 0; for (var t = 0; t < 60 && n < 9; t++) { var gi = h2[0] - 7 + Math.floor(r() * 14), gj = h2[1] - 5 + Math.floor(r() * 10); if (gi % 2 || !freeRect(get, gi - 1, gj - 1, 3, 3)) continue; set(gi, gj, r() < 0.7 ? 13 : 31); n++; } return; }
  if (p.k === 'circle') { var h3 = hubOf(A, get); for (var k = 0; k < 7; k++) { var an = k / 7 * 6.283, si = Math.round(h3[0] + Math.cos(an) * 4), sj = Math.round(h3[1] + Math.sin(an) * 3); if (freeRect(get, si, sj, 1, 1)) set(si, sj, 43); } return; }
}
function KITSIZE(n) { var s = KIT.size(n); return s.w ? s : { w: 72, h: 72 }; }
/* a heart piece shut in a ring of whatever the area's gate is */
function pocket(A, kind, set, get) { var r = srand(A.ax * 101 + A.ay * 7), spot = null;
  var need = kind === 'o' || kind === 'c' ? 3 : 2;
  for (var t = 0; t < 400 && !spot; t++) { var i = A.x0 + 5 + Math.floor(r() * (AW - 10)), j = A.y0 + 5 + Math.floor(r() * (AH - 10)); if (Math.abs(i - A.x0 - 13) < 2 || Math.abs(j - A.y0 - 10) < 2) continue; if (freeRect(get, i - need, j - need, need * 2 + 1, need * 2 + 2)) spot = [i, j]; }
  if (!spot) { spot = [A.x0 + 7, A.y0 + 7]; for (var cj = -need; cj <= need + 1; cj++) for (var ci = -need; ci <= need; ci++) set(spot[0] + ci, spot[1] + cj, 0); } var tile = { b: 5, k: 12, h: 23, c: 22, o: 18 }[kind], id = 'p' + A.ax + A.ay, G2 = { id: id, kind: kind, tiles: [], pocket: 1 };
  if (kind !== 'o') { for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) if (di || dj) { set(spot[0] + di, spot[1] + dj, tile); G2.tiles.push(widx(spot[0] + di, spot[1] + dj)); } if (kind !== 'c' && kind !== 'b') GATES.push(G2); }
  if (kind === 'c') for (dj = -2; dj <= 2; dj++) for (di = -2; di <= 2; di++) if (Math.max(Math.abs(di), Math.abs(dj)) === 2) set(spot[0] + di, spot[1] + dj, 22);
  if (kind === 'o') { var G1 = { id: id, kind: 'o', tiles: [], orb: [spot[0], spot[1]], pocket: 1 }; for (dj = -2; dj <= 2; dj++) for (di = -2; di <= 2; di++) { var ring = Math.max(Math.abs(di), Math.abs(dj)); if (ring === 2) { set(spot[0] + di, spot[1] + dj, 18); G1.tiles.push(widx(spot[0] + di, spot[1] + dj)); } else set(spot[0] + di, spot[1] + dj, 0); }
    set(spot[0], spot[1], 20); GATES.push(G1); WITEMS.push({ i: spot[0], j: spot[1] + 1, id: id }); A.pocket = [spot[0], spot[1] + 1]; return; }
  WITEMS.push({ i: spot[0], j: spot[1], id: id }); A.pocket = spot;
}
/* a gate in the passage between two areas */
function gate(e, n, set, get) { var vert = e[0] === e[2], kind = e[4], id = 'g' + n, G0 = { id: id, kind: kind, tiles: [], e: e }, c, b, k;
  if (vert) { c = e[0] * AW + 13; b = Math.max(e[1], e[3]) * AH; var bUp = e[3] < e[1];
    if (kind === 'c') { for (k = b - 3; k <= b + 2; k++) for (var d = -1; d <= 1; d++) { set(c + d, k, 22); G0.tiles.push(widx(c + d, k)); } }
    else if (kind === 'v') { for (d = -1; d <= 1; d++) set(c + d, b, 9); }
    else { var t = { b: 5, k: 12, h: 23, o: 18, e: 21 }[kind], rows = kind === 'b' ? [b - 1, b] : [b]; rows.forEach(function (r) { for (var d2 = -1; d2 <= 1; d2++) { set(c + d2, r, t); G0.tiles.push(widx(c + d2, r)); } });
      if (kind === 'o') { G0.orb = [c, bUp ? b - 3 : b + 2]; set(c, G0.orb[1], 20); }
      if (kind === 'e') G0.eye = [c, b]; }
    G0.sign = bUp ? [c - 2, b + 4] : [c - 2, b - 5]; }
  else { var r0 = e[1] * AH + 10; b = Math.max(e[0], e[2]) * AW; var bLeft = e[2] < e[0];
    if (kind === 'c') { for (k = b - 3; k <= b + 2; k++) for (var d3 = -1; d3 <= 1; d3++) { set(k, r0 + d3, 22); G0.tiles.push(widx(k, r0 + d3)); } }
    else { var t2 = { b: 5, k: 12, h: 23, o: 18, e: 21 }[kind], cols = kind === 'b' ? [b - 1, b] : [b]; cols.forEach(function (cc) { for (var d4 = -1; d4 <= 1; d4++) { set(cc, r0 + d4, t2); G0.tiles.push(widx(cc, r0 + d4)); } });
      if (kind === 'o') { G0.orb = [bLeft ? b - 3 : b + 2, r0]; set(G0.orb[0], r0, 20); } }
    G0.sign = bLeft ? [b + 4, r0 - 2] : [b - 5, r0 - 2]; }
  if (kind !== 'v') { GATES.push(G0); if (GATEMSG[kind]) { set(G0.sign[0], G0.sign[1], 26); WSIGNS[widx(G0.sign[0], G0.sign[1])] = GATEMSG[kind]; } } }
/* roads: A* across the area from every passage to the middle and from the middle to every door */
function astar(get, from, to, box, cost) { var Wd = box[2] - box[0], Hd = box[3] - box[1], N = Wd * Hd, dist = new Float32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), heap = [];
  function id(i, j) { return (j - box[1]) * Wd + (i - box[0]); }
  function push(f, v, g) { heap.push([f, v, g]); var k = heap.length - 1; while (k > 0) { var p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; var tmp = heap[p]; heap[p] = heap[k]; heap[k] = tmp; k = p; } }
  function pop() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var k = 0; for (;;) { var l = 2 * k + 1, r = l + 1, m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; var tmp = heap[m]; heap[m] = heap[k]; heap[k] = tmp; k = m; } } return top; }
  var s = id(from[0], from[1]), g = id(to[0], to[1]); dist[s] = 0; push(0, s, 0);
  while (heap.length) { var e = pop(), u = e[1]; if (e[2] > dist[u]) continue; if (u === g) break; var ui = u % Wd + box[0], uj = Math.floor(u / Wd) + box[1];
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var vi = ui + d[0], vj = uj + d[1]; if (vi < box[0] || vj < box[1] || vi >= box[2] || vj >= box[3]) return; var c = cost(get(vi, vj), vi, vj); if (c >= 1e8) return; var v = id(vi, vj), nd = dist[u] + c; if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push(nd + Math.abs(vi - to[0]) + Math.abs(vj - to[1]), v, nd); } }); }
  if (dist[g] >= 1e9) return null; var path = [], v = g; while (v >= 0) { path.push([v % Wd + box[0], Math.floor(v / Wd) + box[1]]); v = prev[v]; } return path; }
var ROADCOST = function (t) { return t === 0 || t === 30 || t === 11 ? 1.2 : t === 4 ? 0.6 : t === 10 ? 1 : t === 5 || t === 2 || t === 6 || t === 48 || t === 49 ? 6 : t === 1 ? 40 : t === 3 ? 60 : 1e9; };
function openings(A) { var o = []; Object.keys(A.sides).forEach(function (s) { var e = A.sides[s]; if (s === 'n') o.push([A.x0 + 13, A.y0 + 3]); if (s === 's') o.push([A.x0 + 13, A.y0 + AH - 4]); if (s === 'w') o.push([A.x0 + 3, A.y0 + 10]); if (s === 'e') o.push([A.x0 + AW - 4, A.y0 + 10]); }); return o; }
function roads(A, set, get) { var hub = hubOf(A, get), box = [A.x0 + 1, A.y0 + 1, A.x0 + AW - 1, A.y0 + AH - 1], B = BIOMES[A.bio]; A.hub = hub;
  openings(A).concat(A.targets || []).forEach(function (t) { var p = astar(get, t, hub, box, ROADCOST); if (!p) return;
    p.forEach(function (c) { var tt = get(c[0], c[1]); if (tt === 3) set(c[0], c[1], 10); else if (tt !== 10 && tt !== 40 && tt !== 41 && tt !== 42) { set(c[0], c[1], 4); if (get(c[0] + 1, c[1]) === 0) set(c[0] + 1, c[1], 4); } }); });
  // pave the passages too, up to the gates
  Object.keys(A.sides).forEach(function (s) { for (var k = 0; k < 4; k++) for (var d = -1; d <= 1; d++) { var i = s === 'n' || s === 's' ? A.x0 + 13 + d : s === 'w' ? A.x0 + k : A.x0 + AW - 1 - k, j = s === 'w' || s === 'e' ? A.y0 + 10 + d : s === 'n' ? A.y0 + k : A.y0 + AH - 1 - k; if (get(i, j) === 0 && d === 0) set(i, j, 4); } });
  // lamps by the roads
  if (A.bio === 'm' || A.bio === 'p' || A.bio === 'k') for (var j = A.y0 + 3; j < A.y0 + AH - 3; j++) for (var i = A.x0 + 3; i < A.x0 + AW - 3; i++) if (get(i, j) === 0 && get(i + 1, j) === 4 && get(i - 1, j) === 0 && get(i, j - 1) === 0 && get(i, j + 1) === 0 && hash2(i, j, 21) < 0.08) set(i, j, 14);
}
function dress(A, set, get) { var B = BIOMES[A.bio], r = srand(A.ax * 977 + A.ay * 131);
  for (var j = A.y0 + 2; j < A.y0 + AH - 2; j++) for (var i = A.x0 + 2; i < A.x0 + AW - 2; i++) { var q = widx(i, j), t = WT[q]; if (t !== 0) continue; var x = r(), rough = WV[q] === 1, nearRoad = get(i - 1, j) === 4 || get(i + 1, j) === 4 || get(i, j - 1) === 4 || get(i, j + 1) === 4;
    var clear = true; for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) { var tt = get(i + di, j + dj); if (tt !== 0 && tt !== 30 && tt !== 11) clear = false; }
    if (rough) { WV[q] = 0; if (x < 0.3) set(i, j, 30); else if (x < 0.55 && !nearRoad) set(i, j, 5); else if (x < 0.62 && !nearRoad) set(i, j, 2); else if (x < 0.72) set(i, j, 11); continue; }
    if (clear && !nearRoad && x < B.treeD) { set(i, j, 6); TREES.push({ i: i, j: j, f: 'tr_' + B.tree[Math.floor(r() * B.tree.length)] }); continue; }
    x = r(); if (x < 0.012) set(i, j, 30); else if (x < 0.022) set(i, j, 11); else if (x < 0.062 && clear) set(i, j, A.bio === 'b' ? 15 : A.bio === 'p' ? 49 : A.bio === 'f' ? 48 : 2); else if (x < 0.066 && A.bio === 'b') set(i, j, 33); else if (x < 0.07 && A.bio === 'w' && clear) set(i, j, 16); }
  // clumps of bushes round the edges of the walls, like hedgerows
  for (j = A.y0 + 3; j < A.y0 + AH - 3; j++) for (i = A.x0 + 3; i < A.x0 + AW - 3; i++) if (get(i, j) === 0 && get(i, j - 1) === 1 && hash2(i, j, 31) < 0.18) set(i, j, 5);
}
/* after dressing, walk the area: every passage, door and pocket must still be reachable from the middle. Anything in the way is cleared. */
function mend(A, set, get) { var hub = A.hub || hubOf(A, get), box = [A.x0 + 1, A.y0 + 1, A.x0 + AW - 1, A.y0 + AH - 1];
  var cost = function (t) { return walkable(t) ? 1 : t === 5 || t === 2 || t === 6 || t === 48 || t === 49 || t === 15 || t === 33 || t === 14 || t === 13 || t === 31 || t === 43 ? 20 : t === 1 ? 60 : 1e9; };
  var targets = openings(A).concat(A.targets || []); if (A.pocket) targets.push([A.pocket[0], A.pocket[1] + 3]);
  targets.forEach(function (t) { var p = astar(get, t, hub, box, cost); if (!p) return; p.forEach(function (c) { var tt = get(c[0], c[1]); if (!walkable(tt) && tt !== 41 && tt !== 42 && tt !== 40) { if (tt === 6) TREES = TREES.filter(function (o) { return o.i !== c[0] || o.j !== c[1]; }); set(c[0], c[1], 0); } }); }); }
/* ---------- Cum City: 2 x 2 areas inside its own wall, with every shop front on its streets ---------- */
var SHOPS = [['club', 'fac_club'], ['amy', 'fac_amy'], ['saba', 'fac_saba'], ['beebs', 'fac_beebs'], ['cafe', 'fac_cafe'], ['tb', 'fac_tb'], ['greebo', 'fac_greebo'], ['t', 'fac_t'], ['bonjo', 'fac_bonjo'], ['joff', 'fac_joff'], ['arcade', 'fac_arcade'], ['pulsar', 'fac_pulsar'], ['sanct', 'fac_sanct']];
/* Cum City: a walled town of 36 x 30 in the middle of its four areas, a thick wood round it with paths in from the four ways
   (he said the old one was too big with houses you could not go in) */
function buildTown(set, get) { var OX = 3 * AW, OY0 = 4 * AH, OW = 2 * AW, OH = 2 * AH, w = 36, h = 30, X = OX + 9, Y = OY0 + 6, i, j;
  TOWN = { x: X, y: Y, w: w, h: h, inner: 1 };
  for (j = 0; j < OH; j++) for (i = 0; i < OW; i++) set(OX + i, OY0 + j, 1); // the wood (drawn as forest: bioAt)
  function out(i0, j0, i1, j1) { for (var jj = j0; jj <= j1; jj++) for (var ii = i0; ii <= i1; ii++) set(OX + ii, OY0 + jj, 4); }
  out(0, 9, 6, 11); out(4, 9, 6, 17); out(4, 15, 9, 17); // west way in
  out(12, 0, 14, 6); out(39, 0, 41, 6); // the two ways in from the north
  out(47, 30, 53, 32); out(47, 28, 49, 32); out(44, 28, 49, 30); // east way in
  for (j = 0; j < h; j++) for (i = 0; i < w; i++) set(X + i, Y + j, i < 3 || j < 3 || i >= w - 3 || j >= h - 3 ? 1 : 0);
  function road(i0, j0, i1, j1) { for (var jj = j0; jj <= j1; jj++) for (var ii = i0; ii <= i1; ii++) set(X + ii, Y + jj, 4); }
  road(0, 9, 32, 11); road(3, 22, w - 1, 24); road(3, 0, 5, 8); road(30, 0, 32, 8); road(14, 12, 17, 21);
  // shop fronts: six on the top street (the Clubhouse and Amy's side by side), seven on the bottom one, a lane between
  var bySp = {}; SHOPS.forEach(function (sp) { bySp[sp[0]] = sp[1]; });
  function row(ids, c, jj) { ids.forEach(function (id) { var fw = Math.ceil(KITSIZE(bySp[id]).w / TS); placeShop(id, bySp[id], X + c, Y + jj, fw); c += fw + 1; }); }
  row(['club', 'amy', 'saba', 'beebs', 'cafe', 'tb'], 6, 8);
  row(['greebo', 't', 'bonjo'], 3, 21); row(['joff', 'arcade', 'pulsar', 'sanct'], 18, 21);
  // the plaza: fountain, benches, a stall, lamps, trees
  STRUCTS.push({ i: X + 21, j: Y + 15, w: 3, spr: 'pr_fountain', id: 'fountain', cx: (X + 22.5) * TS }); for (i = 20; i <= 25; i++) for (j = 13; j <= 15; j++) set(X + i, Y + j, 40);
  [[27, 16], [8, 16]].forEach(function (p) { set(X + p[0], Y + p[1], 45); set(X + p[0] + 1, Y + p[1], 45); STRUCTS.push({ i: X + p[0], j: Y + p[1], w: 2, spr: 'pr_bench', id: 'bench', cx: (X + p[0] + 1) * TS }); });
  [[9, 13]].forEach(function (p) { for (var a2 = 0; a2 < 2; a2++) set(X + p[0] + a2, Y + p[1], 46); STRUCTS.push({ i: X + p[0], j: Y + p[1], w: 2, spr: 'pr_stall', id: 'stall', cx: (X + p[0] + 1) * TS }); });
  [[19, 12], [26, 12], [4, 12], [31, 12], [6, 25], [29, 25], [13, 25], [22, 25]].forEach(function (p) { if (get(X + p[0], Y + p[1]) === 0) set(X + p[0], Y + p[1], 14); });
  [[5, 14], [30, 15], [8, 26], [17, 26], [27, 26]].forEach(function (p) { if (get(X + p[0], Y + p[1]) === 0) { set(X + p[0], Y + p[1], 6); TREES.push({ i: X + p[0], j: Y + p[1], f: 'tr_red' }); } });
  [[11, 26], [24, 26], [29, 13]].forEach(function (p) { if (get(X + p[0], Y + p[1]) === 0) set(X + p[0], Y + p[1], 11); });
  // the gates through the town wall
  road(0, 9, 2, 11); road(3, 0, 5, 2); road(30, 0, 32, 2); road(w - 3, 22, w - 1, 24);
  TOWN.home = TOWN.home || { x: (X + 8) * TS, y: (Y + 10) * TS };
}
function placeShop(id, spr, i0, j, fw) { for (var a = 0; a < fw; a++) { WT[widx(i0 + a, j)] = 40; WT[widx(i0 + a, j - 1)] = 40; } var di = i0 + Math.floor(fw / 2); WT[widx(di, j)] = 41;
  DOORS[widx(di, j)] = { to: { in: id }, back: { x: (di + 0.5) * TS, y: (j + 1.7) * TS }, town: 1 }; STRUCTS.push({ i: i0, j: j, w: fw, spr: spr, id: id, cx: (di + 0.5) * TS, door: [di, j], shop: 1 });
  if (id === 'club') TOWN.home = { x: (di + 0.5) * TS, y: (j + 1.7) * TS }; }
