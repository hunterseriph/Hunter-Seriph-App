/* ---------- the land: 6 x 5 screens, each laid from its own seed so it is the same every time ---------- */
function srand(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/* tiles: 0 grass, 1 tree, 2 rock, 3 water, 4 path, 5 bush, 6 cliff, 7 cave door, 8 dungeon door, 10 flowers, 11 bridge, 12 cracked rock,
   dungeon: 20 floor, 21 wall, 22 block, 23 pit, 24 open door, 25 locked door, 26 boss door, 27 shutter, 28 stairs out, 29 water */
var SOLID = { 1: 1, 2: 1, 3: 1, 5: 1, 6: 1, 12: 1, 21: 1, 22: 1, 25: 1, 26: 1, 27: 1, 29: 1 };
var SPECIAL = { '2,4': 'amy', '3,4': 'saba', '1,2': 'harold', '5,1': 'heart', '0,1': 'heart', '4,2': 'heart', '2,2': 'greebo', '5,4': 'spermaid' };
function overScreen(sx, sy) {
  var b = biomeAt(sx, sy), B = BIOME[b], rnd = srand(sx * 131 + sy * 977 + 7), T = [], i, j;
  function ri(n) { return Math.floor(rnd() * n); }
  for (j = 0; j < ROWS; j++) for (i = 0; i < COLS; i++) { var edge = i === 0 || j === 0 || i === COLS - 1 || j === ROWS - 1; T.push(edge ? 1 : 0); }
  function set(i, j, v) { if (i >= 0 && j >= 0 && i < COLS && j < ROWS) T[j * COLS + i] = v; }
  function get(i, j) { return i >= 0 && j >= 0 && i < COLS && j < ROWS ? T[j * COLS + i] : 1; }
  // openings to the neighbours (always the middle of each edge)
  if (sx > 0) for (j = 3; j <= 6; j++) set(0, j, 4); if (sx < MAPW - 1) for (j = 3; j <= 6; j++) set(COLS - 1, j, 4);
  if (sy > 0) for (i = 8; i <= 11; i++) set(i, 0, 4); if (sy < MAPH - 1) for (i = 8; i <= 11; i++) set(i, ROWS - 1, 4);
  // scenery
  var n = 10 + ri(10); for (var k = 0; k < n; k++) { var cx = 2 + ri(COLS - 4), cy = 2 + ri(ROWS - 4), t = rnd(); var v = t < 0.45 ? 1 : t < 0.62 ? 2 : t < 0.8 ? 5 : 10; var w = 1 + ri(3), h = 1 + ri(2); for (var y = cy; y < cy + h; y++) for (var x = cx; x < cx + w; x++) if (get(x, y) === 0) set(x, y, v); }
  if (rnd() < 0.45 || b === 'swamp') { var px = 3 + ri(COLS - 9), py = 2 + ri(ROWS - 6), pw = 3 + ri(4), ph = 2 + ri(2); for (var y2 = py; y2 < py + ph; y2++) for (var x2 = px; x2 < px + pw; x2++) set(x2, y2, 3); }
  // paths from every opening to the middle, so the way through is never shut
  var mx = 10, my = 5; function carve(x, y) { while (x !== mx || y !== my) { var g = get(x, y); if (g !== 4 && g !== 11) set(x, y, g === 3 ? 11 : 4); if (x !== mx) x += x < mx ? 1 : -1; else y += y < my ? 1 : -1; } set(mx, my, 4); }
  if (sx > 0) carve(0, 4); if (sx < MAPW - 1) carve(COLS - 1, 5); if (sy > 0) carve(9, 0); if (sy < MAPH - 1) carve(10, ROWS - 1);
  // a dungeon, a cave or a shop in a cliff at the top of the screen
  var sp = SPECIAL[sx + ',' + sy], dn = -1; DUNGEONS.forEach(function (D, di) { if (D.at[0] === sx && D.at[1] === sy) dn = di; });
  var feat = null;
  if (dn >= 0 || sp) { for (i = 1; i <= 7; i++) for (j = 1; j <= 2; j++) set(i, j, 6); set(4, 2, dn >= 0 ? 8 : (sp === 'heart' ? 12 : 7)); feat = { i: 4, j: 2, k: dn >= 0 ? 'dungeon' : sp, d: dn }; for (i = 2; i <= 7; i++) if (get(i, 3) !== 4) set(i, 3, 0); var cx2 = 4, cy2 = 3; while (cx2 !== mx || cy2 !== my) { if (get(cx2, cy2) !== 11) set(cx2, cy2, get(cx2, cy2) === 3 ? 11 : 4); if (cy2 !== my) cy2 += 1; else cx2 += cx2 < mx ? 1 : -1; } }
  var foes = []; if (!(sx === 2 && sy === 4) && !sp) { var nf = 2 + ri(3); for (var f = 0; f < nf; f++) { var fx = 2 + ri(COLS - 4), fy = 2 + ri(ROWS - 4); if (get(fx, fy) === 0 || get(fx, fy) === 4) foes.push({ k: B.foes[ri(B.foes.length)], x: (fx + 0.5) * TS, y: (fy + 0.5) * TS }); } }
  return { kind: 'over', sx: sx, sy: sy, b: b, T: T, feat: feat, foes: foes };
}
/* ---------- dungeons: rooms on a grid joined as a tree; the boss room is the furthest, the item and boss key in the leaves ---------- */
var DGN = {};
function buildDungeon(di) {
  if (DGN[di]) return DGN[di]; var D = DUNGEONS[di], rnd = srand(5000 + di * 313), rooms = {}, list = [], GW = 5, GH = 5;
  function key(x, y) { return x + ',' + y; } function ri(n) { return Math.floor(rnd() * n); }
  var start = { x: 2, y: 4, d: 0, doors: {}, id: key(2, 4) }; rooms[start.id] = start; list.push(start);
  while (list.length < D.rooms) { var from = list[ri(list.length)], dirs = [[1, 0, 'e', 'w'], [-1, 0, 'w', 'e'], [0, -1, 'n', 's'], [0, 1, 's', 'n']], dd = dirs[ri(4)], nx = from.x + dd[0], ny = from.y + dd[1];
    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || rooms[key(nx, ny)] || (from === start && dd[2] === 's')) continue; var r = { x: nx, y: ny, d: from.d + 1, doors: {}, id: key(nx, ny), parent: from.id }; from.doors[dd[2]] = 'open'; r.doors[dd[3]] = 'open'; rooms[r.id] = r; list.push(r); }
  start.doors.s = 'exit';
  var leaves = list.filter(function (r) { return Object.keys(r.doors).length === 1 && r !== start; }).sort(function (a, b) { return b.d - a.d; });
  var boss = leaves[0] || list[list.length - 1], item = leaves[1] || list[list.length - 2], bk = leaves[2] || list[Math.floor(list.length / 2)];
  boss.type = 'boss'; item.type = 'item'; bk.type = bk === item ? 'item' : 'bkey';
  function doorBetween(a, b, v) { var dx = b.x - a.x, dy = b.y - a.y, s = dx > 0 ? 'e' : dx < 0 ? 'w' : dy > 0 ? 's' : 'n', o = { e: 'w', w: 'e', n: 's', s: 'n' }[s]; a.doors[s] = v; b.doors[o] = v; }
  doorBetween(rooms[boss.parent], boss, 'boss'); doorBetween(rooms[item.parent], item, 'locked');
  var keyRoom = list.filter(function (r) { return r !== start && r !== boss && r !== item && r !== bk && r.d <= item.d; })[0] || list[1]; keyRoom.type = keyRoom.type || 'key';
  list.forEach(function (r, n) { var rr = srand(9000 + di * 50 + n); r.layout = r === start ? 0 : r.type === 'boss' ? 0 : 1 + Math.floor(rr() * 5); r.foes = []; if (r !== start && r.type !== 'boss') { var nf = 2 + Math.floor(rr() * 3); for (var f = 0; f < nf; f++) r.foes.push(D.foes[Math.floor(rr() * D.foes.length)]); } });
  return (DGN[di] = { di: di, D: D, rooms: rooms, list: list, start: start, boss: boss });
}
function roomTiles(dg, r) {
  var T = [], i, j, L = r.layout, D = dg.D;
  for (j = 0; j < ROWS; j++) for (i = 0; i < COLS; i++) T.push(i === 0 || j === 0 || i === COLS - 1 || j === ROWS - 1 ? 21 : 20);
  function set(i, j, v) { T[j * COLS + i] = v; }
  if (L === 1) [[5, 3], [14, 3], [5, 6], [14, 6]].forEach(function (p) { set(p[0], p[1], 22); });
  else if (L === 2) { for (i = 8; i <= 11; i++) for (j = 4; j <= 5; j++) set(i, j, D.pits ? 23 : D.water ? 29 : 22); }
  else if (L === 3) { for (i = 3; i <= 16; i += 2) { set(i, 2, 22); set(i, 7, 22); } }
  else if (L === 4 && (D.pits || D.water)) { for (i = 2; i <= 17; i++) if (i < 9 || i > 10) { set(i, 4, D.pits ? 23 : 29); set(i, 5, D.pits ? 23 : 29); } }
  else if (L === 5) { for (j = 2; j <= 7; j++) { set(6, j, j === 4 || j === 5 ? 20 : 22); set(13, j, j === 4 || j === 5 ? 20 : 22); } }
  var dmap = { n: [[9, 0], [10, 0]], s: [[9, ROWS - 1], [10, ROWS - 1]], w: [[0, 4], [0, 5]], e: [[COLS - 1, 4], [COLS - 1, 5]] };
  Object.keys(r.doors).forEach(function (s) { var v = r.doors[s], st = SV.dg[dg.di] || {}, opened = st.open && st.open[r.id + s]; var t = v === 'exit' ? 28 : v === 'locked' && !opened ? 25 : v === 'boss' && !opened ? 26 : 24; dmap[s].forEach(function (p) { set(p[0], p[1], t); }); });
  return T;
}
