/* ---------- dungeons (update 135): one map of rooms you walk straight through, the camera gliding from room to room like
   A Link to the Past (he said the old ones still flicked screen to screen). Rooms sit on a grid, joined as a tree from
   the entrance: the boss at the far end behind the Boss Door, the dungeon's item in a big chest behind a locked door
   (the small key is in a chest elsewhere), and the Boss Key behind a gate only that item opens: red pegs with an orb
   past them (Garlic Bread), a stone eye (Cream Pistol), a chasm across the room (Steve Balloon), blood blocks
   (Bloodmoon Ring). Some rooms shut their doors until every foe is down, and one wall in each dungeon is cracked.
   Tiles: 79 void, 80 floor, 81 wall, 82 pit, 83 cream/blood/goo, 84 block, 85 blood block, 86 torch, 87 statue,
   88 doorway, 89 locked door, 90 boss door, 91 shutter, 92 cracked wall, 93 way out, 94 pegs up, 95 pegs down,
   96 orb, 97 eye door, 98 spikes, 99 carpet ---------- */
var RW = 22, RH = 14, DGN = {};
var DOORSIDE = { n: [0, -1, 's'], s: [0, 1, 'n'], w: [-1, 0, 'e'], e: [1, 0, 'w'] };
function buildDungeon(di) {
  if (DGN[di]) return DGN[di]; var D = DUNGEONS[di], rnd = srand(5000 + di * 313), GW = 6, GH = 6, rooms = {}, list = [];
  function key(x, y) { return x + ',' + y; } function ri(n) { return Math.floor(rnd() * n); }
  var start = { x: 2 + (di % 2), y: GH - 1, d: 0, doors: {}, id: '', kids: [] }; start.id = key(start.x, start.y); rooms[start.id] = start; list.push(start);
  for (var guard = 0; list.length < D.rooms && guard < 5000; guard++) { var from = list[ri(list.length)], dd = [['e', 1, 0], ['w', -1, 0], ['n', 0, -1], ['n', 0, -1], ['s', 0, 1]][ri(5)], nx = from.x + dd[1], ny = from.y + dd[2];
    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || rooms[key(nx, ny)] || (from === start && dd[0] === 's')) continue; if (Object.keys(from.doors).length >= 3) continue;
    var r = { x: nx, y: ny, d: from.d + 1, doors: {}, id: key(nx, ny), parent: from, kids: [] }; from.doors[dd[0]] = { k: 'open' }; r.doors[DOORSIDE[dd[0]][2]] = { k: 'open' }; from.kids.push(r); rooms[r.id] = r; list.push(r); }
  start.doors.s = { k: 'exit' };
  function sideTo(a, b) { return b.x > a.x ? 'e' : b.x < a.x ? 'w' : b.y > a.y ? 's' : 'n'; }
  function setEdge(child, kind) { var p = child.parent, s = sideTo(p, child), o = DOORSIDE[s][2]; var e = { k: kind, id: child.id + o, child: child.id }; p.doors[s] = e; child.doors[o] = e; }
  function under(r, set) { set[r.id] = 1; r.kids.forEach(function (k) { under(k, set); }); return set; }
  var leaves = list.filter(function (r) { return !r.kids.length && r !== start; }).sort(function (a, b) { return b.d - a.d; });
  var boss = leaves[0], bkey = leaves[1] || list[list.length - 2], item = leaves[2] || list[Math.max(1, list.length - 3)];
  boss.type = 'boss'; setEdge(boss, 'boss');
  if (D.item) { item.type = 'item'; setEdge(item, 'locked'); }
  bkey.type = 'bkey'; setEdge(bkey, 'gate');
  var shut = {}; under(bkey, shut); under(boss, shut); if (D.item) under(item, shut);
  var free = list.filter(function (r) { return r !== start && !shut[r.id] && !r.type; });
  var keyRoom = free[ri(free.length)] || list[1]; keyRoom.type = keyRoom.type || 'key';
  // a second gate in the Lair
  if (D.gate2) { var mid = free.filter(function (r) { return r !== keyRoom && r.kids.length; })[0]; if (mid) mid.kids.forEach(function (k) { if (!shut[k.id] && !k.type) { k.type = k.type || 'drops'; setEdge(k, 'gate2'); } }); }
  // a cracked wall into a little secret room off the side of the map
  var sec = null; for (var t2 = 0; t2 < 80 && !sec; t2++) { var r0 = list[ri(list.length)], ds = [['e', 1, 0], ['w', -1, 0], ['n', 0, -1]][ri(3)], sx = r0.x + ds[1], sy = r0.y + ds[2]; if (sx < 0 || sy < 0 || sx >= GW || sy >= GH || rooms[key(sx, sy)] || r0.type === 'boss') continue;
    sec = { x: sx, y: sy, d: r0.d + 1, doors: {}, id: key(sx, sy), parent: r0, kids: [], type: 'secret' }; r0.kids.push(sec); rooms[sec.id] = sec; list.push(sec); r0.doors[ds[0]] = { k: 'open' }; sec.doors[DOORSIDE[ds[0]][2]] = { k: 'open' }; setEdge(sec, 'crack'); }
  list.forEach(function (r, n) { if (r !== start && !r.type && rnd() < 0.45) r.trap = 1; if (r.type === 'boss') r.trap = 1; });
  var dg = { di: di, D: D, rooms: rooms, list: list, start: start, boss: boss, w: GW * RW, h: GH * RH, doors: [], chests: [], orbs: [], torches: [] };
  // tiles
  var T = new Uint8Array(dg.w * dg.h).fill(79); dg.T = T;
  function set(i, j, v) { if (i >= 0 && j >= 0 && i < dg.w && j < dg.h) T[j * dg.w + i] = v; }
  function get(i, j) { return i < 0 || j < 0 || i >= dg.w || j >= dg.h ? 79 : T[j * dg.w + i]; }
  list.forEach(function (r) { var ox = r.x * RW, oy = r.y * RH; r.ox = ox; r.oy = oy; for (var j = 0; j < RH; j++) for (var i = 0; i < RW; i++) set(ox + i, oy + j, j <= 2 || j === RH - 1 || i === 0 || i === RW - 1 ? 81 : 80); });
  list.forEach(function (r, n) { layoutRoom(dg, r, srand(9000 + di * 50 + n), set, get); });
  // doorways
  list.forEach(function (r) { var ox = r.ox, oy = r.oy;
    if (r.doors.n) for (var i = 10; i <= 12; i++) { for (var j = 0; j <= 2; j++) set(ox + i, oy + j, 88); set(ox + i, oy - 1, 88); }
    if (r.doors.w) for (var j2 = 7; j2 <= 9; j2++) { set(ox, oy + j2, 88); set(ox - 1, oy + j2, 88); }
    if (r.doors.s && r.doors.s.k === 'exit') for (var i2 = 10; i2 <= 12; i2++) set(ox + i2, oy + RH - 1, 93); });
  // the door things, sat in the gated room's own wall
  list.forEach(function (r) { Object.keys(r.doors).forEach(function (s) { var e = r.doors[s]; if (e.k === 'open' || e.k === 'exit' || e.child !== r.id) return;
    var tiles = doorTiles(r, s), kind = e.k === 'gate' ? D.gate : e.k === 'gate2' ? D.gate2 : e.k, d = { id: e.id, kind: kind, tiles: tiles, vert: s === 'w' || s === 'e', side: s, room: r.id };
    dg.doors.push(d); var tv = { locked: 89, boss: 90, crack: 92, eye: 97, pegs: 94, heavy: 85 }[kind]; if (tv) tiles.forEach(function (q) { T[q] = tv; });
    if (kind === 'pegs') { var c = laneCentre(r, s, 2); set(c[0], c[1], 96); dg.orbs.push({ x: c[0], y: c[1], door: d.id }); }
    if (kind === 'pit') { var a = s === 'n' ? [1, 3, RW - 2, 6] : s === 's' ? [1, RH - 4, RW - 2, RH - 2] : s === 'w' ? [1, 3, 4, RH - 2] : [RW - 5, 3, RW - 2, RH - 2];
      for (var jj = a[1]; jj <= a[3]; jj++) for (var ii = a[0]; ii <= a[2]; ii++) set(r.ox + ii, r.oy + jj, 82); } }); });
  // chests
  list.forEach(function (r) { if (!r.type || r.type === 'boss') return; var x = r.ox + 11, y = r.oy + 7; if (get(x, y) !== 80 && get(x, y) !== 99) { for (var tt = 0; tt < 40; tt++) { var xi = r.ox + 3 + Math.floor(rnd() * (RW - 6)), yj = r.oy + 4 + Math.floor(rnd() * (RH - 7)); if (get(xi, yj) === 80) { x = xi; y = yj; break; } } }
    dg.chests.push({ room: r.id, kind: r.type, i: x, j: y, big: r.type === 'item' || r.type === 'bkey' }); });
  for (var q = 0; q < T.length; q++) if (T[q] === 86) dg.torches.push({ i: q % dg.w, j: Math.floor(q / dg.w) });
  return (DGN[di] = dg);
}
/* the three tiles of a door in room r's own wall on side s */
function doorTiles(r, s) { var w = DUNGEONS.length ? null : null, out = [], k, dw = r.ox, oy = r.oy, W = 6 * RW;
  if (s === 'n') for (k = 10; k <= 12; k++) out.push((oy + 2) * W + r.ox + k);
  else if (s === 's') for (k = 10; k <= 12; k++) out.push((oy + RH - 1) * W + r.ox + k);
  else if (s === 'w') for (k = 7; k <= 9; k++) out.push((oy + k) * W + r.ox);
  else for (k = 7; k <= 9; k++) out.push((oy + k) * W + r.ox + RW - 1);
  return out; }
function laneCentre(r, s, n) { return s === 'n' ? [r.ox + 11, r.oy + 3 + n] : s === 's' ? [r.ox + 11, r.oy + RH - 2 - n] : s === 'w' ? [r.ox + 1 + n, r.oy + 8] : [r.ox + RW - 2 - n, r.oy + 8]; }
/* what's in a room: twelve shapes, the door lanes always kept clear */
function layoutRoom(dg, r, rr, set, get) {
  var ox = r.ox, oy = r.oy, L = r === dg.start ? 0 : r.type === 'boss' ? 9 : 1 + Math.floor(rr() * 11), liq = 83, D = dg.D;
  function S(i, j, v) { if (i >= 1 && j >= 3 && i <= RW - 2 && j <= RH - 2) set(ox + i, oy + j, v); }
  function box(i0, j0, i1, j1, v) { for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) S(i, j, v); }
  function clear(i0, j0, i1, j1) { for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { var t = get(ox + i, oy + j); if (t === 82 || t === 83 || t === 84 || t === 86 || t === 87 || t === 98) S(i, j, 80); } }
  var i, j; r.layout = L;
  if (L === 0) { box(9, 6, 13, 10, 99); }
  else if (L === 1) { [[4, 5], [16, 5], [4, 10], [16, 10]].forEach(function (p) { box(p[0], p[1], p[0] + 1, p[1] + 1, 84); }); }
  else if (L === 2) { box(6, 6, 16, 10, D.look === 'sewer' || D.look === 'lair' ? liq : 82); }
  else if (L === 3) { box(3, 6, 19, 6, 84); box(3, 10, 19, 10, 84); }
  else if (L === 4) { [4, 8, 14, 18].forEach(function (x) { S(x, 4, 87); S(x, 12, 87); }); box(7, 7, 15, 9, 99); }
  else if (L === 5) { box(1, 3, 8, 6, 82); box(14, 3, 20, 6, 82); box(1, 10, 8, 12, 82); box(14, 10, 20, 12, 82); }
  else if (L === 6) { box(3, 5, 19, 5, 98); box(3, 11, 19, 11, 98); }
  else if (L === 7) { for (j = 4; j <= 12; j += 2) for (i = 3; i <= 19; i += 3) if (rr() < 0.4) S(i, j, 84); }
  else if (L === 8) { box(1, 5, 20, 6, liq); box(1, 10, 20, 11, liq); }
  else if (L === 9) { [[2, 3], [19, 3], [2, 12], [19, 12]].forEach(function (p) { S(p[0], p[1], 86); }); }
  else if (L === 10) { for (var k = 0; k < 6; k++) { S(4 + k * 2, 4 + k, 84); S(17 - k * 2, 4 + k, 84); } }
  else { box(5, 5, 17, 11, 82); box(8, 7, 14, 9, 80); box(10, 5, 12, 6, 80); box(10, 10, 12, 11, 80); box(5, 7, 7, 9, 80); box(15, 7, 17, 9, 80); }
  if (L !== 9 && L !== 0) [[1, 3], [20, 3]].forEach(function (p) { if (rr() < 0.6) S(p[0], p[1], 86); });
  // keep the lanes from every door to the middle clear
  Object.keys(r.doors).forEach(function (s) { if (s === 'n' || (s === 's')) clear(10, s === 'n' ? 3 : 7, 12, s === 'n' ? 9 : RH - 2); else clear(s === 'w' ? 1 : 11, 7, s === 'w' ? 11 : RW - 2, 9); });
  if (L === 2 || L === 8) { clear(10, 3, 12, RH - 2); clear(1, 7, RW - 2, 9); }
}
