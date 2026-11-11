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
