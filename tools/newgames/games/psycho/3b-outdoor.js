/* =====================================================================================================
   OUTSIDE: the woods (a big maze of paths two trees wide, clearings with campfires, bushes to hide in; you come in
   at the south edge and get out at the north), Clubhouse Row's red light district (streets between black buildings,
   red neon everywhere, shop fronts with their names baked in, dumpsters to hide in, T's Hussy House half way, the
   Clubhouse at the far end) and the plaza in front of the Clubhouse where TB is finally fought.
   They use the same tile codes as the basement, so moving, seeing, hiding and the AI all just work.
   ===================================================================================================== */
function lvlBase(fi) { return { fi: fi, K: new Uint8Array(MW * MH), RM: new Int16Array(MW * MH).fill(-1), rooms: [], lockers: [], props: [], loot: [], foes: [], lights: [], decals: [], pipes: [], notes: [], fronts: [], neons: [], fires: [], standees: [], cellDoor: null, arrive: null }; }
function bfs(F, si, sj, pass) { pass = pass || function (k) { return k === KC || k === KR; }; var D = new Int32Array(MW * MH).fill(-1), q = [idx(si, sj)]; D[q[0]] = 0;
  for (var h = 0; h < q.length; h++) { var p = q[h], pi = p % MW, pj = (p / MW) | 0; for (var d = 0; d < 4; d++) { var ni = pi + DIRS[d][0], nj = pj + DIRS[d][1]; if (!inMap(ni, nj)) continue; var nk = idx(ni, nj); if (D[nk] < 0 && pass(F.K[nk])) { D[nk] = D[p] + 1; q.push(nk); } } } return D; }
function lvlFill(F, rnd, th, used, D, minD) { // pickups and TB's boys on free open tiles
  var free = []; for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { var k = F.K[idx(i, j)]; if ((k === KC || k === KR) && !used[idx(i, j)] && D[idx(i, j)] > 3) free.push({ i: i, j: j, d: D[idx(i, j)] }); }
  function take(pred) { var c = free.filter(pred); if (!c.length) return null; var p = c[Math.floor(rnd() * c.length)]; free.splice(free.indexOf(p), 1); used[idx(p.i, p.j)] = 1; return p; }
  th.loot.forEach(function (l) { var p = take(function () { return true; }); if (p) F.loot.push({ i: p.i, j: p.j, k: l }); });
  th.foes.forEach(function (f) { var p = take(function (q) { return q.d > (minD || 12); }); if (p) F.foes.push({ i: p.i, j: p.j, k: f }); });
  for (var n = 0; n < 3; n++) { var np = take(function () { return true; }); if (np) F.notes.push({ i: np.i, j: np.j, n: noteFor(F.fi, n) }); }
}
function addHides(F, rnd, n, used, D, keep) { // lockers by another name: thick bushes, dumpsters
  var c = []; for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { if (F.K[idx(i, j)] !== KC || used[idx(i, j)] || D[idx(i, j)] < 4) continue; var walls = DIRS.filter(function (q) { return F.K[idx(i + q[0], j + q[1])] === KW; }); if (walls.length) c.push({ i: i, j: j, w: walls }); }
  for (var t = 0; t < 200 && F.lockers.length < n && c.length; t++) { var p = c.splice(Math.floor(rnd() * c.length), 1)[0], q = p.w[Math.floor(rnd() * p.w.length)];
    F.K[idx(p.i, p.j)] = KL; if (!keep()) { F.K[idx(p.i, p.j)] = KC; continue; } used[idx(p.i, p.j)] = 1; F.lockers.push({ i: p.i, j: p.j, di: -q[0], dj: -q[1] }); }
}
/* ---------- THE WOODS ---------- */
function genWoods(fi, seed) { // open woods (his ask: only the basement is a maze): clumps of trees, clearings, and you head north
  var rnd = srand(seed), F = lvlBase(fi), K = F.K, th = FLOORS[fi], mid = MW >> 1, last = MH - 2;
  function ri(n) { return Math.floor(rnd() * n); }
  for (var j0 = 1; j0 < MH - 1; j0++) for (var i0 = 1; i0 < MW - 1; i0++) K[idx(i0, j0)] = KC;
  F.start = { i: mid, j: last, a: Math.PI }; F.start2 = { i: mid + 1, j: last }; F.respawn = F.start; F.cellIn = F.start; F.tb = { i: mid, j: last - 1 }; F.tbIn = { i: mid, j: last, di: 0, dj: -1 };
  for (var e = 0; e <= 1; e++) { K[idx(mid + e, 0)] = KC; } F.exitIn = { i: mid, j: 1 }; F.exitZone = [mid - 1, 0, mid + 2, 1];
  var used = {}; [[mid, last], [mid + 1, last], [mid, 1], [mid + 1, 1]].forEach(function (q) { used[idx(q[0], q[1])] = 1; });
  function keep() { var D2 = bfs(F, mid, last); return D2[idx(mid, 1)] >= 0; }
  // clearings, kept free of trees
  for (var r = 0, tries = 0; r < 10 && tries < 300; tries++) { var w = 5 + 2 * ri(3), h = 5 + 2 * ri(2), x = 3 + ri(MW - w - 6), y = 4 + ri(MH - h - 9);
    if (F.rooms.some(function (q) { return x < q.x + q.w + 3 && x + w + 3 > q.x && y < q.y + q.h + 3 && y + h + 3 > q.y; })) continue;
    var R = { id: F.rooms.length, x: x, y: y, w: w, h: h, open: 1, doors: [] }; for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) { K[idx(i, j)] = KR; F.RM[idx(i, j)] = R.id; } F.rooms.push(R); r++; }
  // clumps of trees everywhere else, never closing the way north
  var target = Math.floor((MW - 2) * (MH - 2) * 0.24), placed = 0;
  for (var t2 = 0; t2 < 900 && placed < target; t2++) { var cx = 1 + ri(MW - 2), cy = 2 + ri(MH - 4), rad = rnd() < 0.6 ? 1 : 2, cells = [];
    for (var dy = -rad; dy <= rad; dy++) for (var dx = -rad; dx <= rad; dx++) { var a = cx + dx, b = cy + dy; if (a < 1 || b < 1 || a > MW - 2 || b > MH - 2) continue; if (dx * dx + dy * dy > rad * rad + rnd() * 1.5) continue; if (K[idx(a, b)] !== KC || used[idx(a, b)] || Math.abs(a - mid - 0.5) < 2 && (b > MH - 5 || b < 4)) continue; cells.push(idx(a, b)); }
    if (!cells.length) continue; cells.forEach(function (k) { K[k] = KW; }); if (!keep()) { cells.forEach(function (k) { K[k] = KC; }); continue; } placed += cells.length; }
  // the edge of the woods is thick
  for (var q = 0; q < MW; q++) [[q, 1], [1, q], [MW - 2, q], [q, MH - 2]].forEach(function (p) { if (Math.abs(p[0] - mid - 0.5) < 2) return; if (inMap(p[0], p[1]) && rnd() < 0.7 && K[idx(p[0], p[1])] === KC && !used[idx(p[0], p[1])]) { K[idx(p[0], p[1])] = KW; if (!keep()) K[idx(p[0], p[1])] = KC; } });
  // campfires and camp junk in the clearings
  F.rooms.forEach(function (R) { var cxm = R.x + (R.w >> 1), cym = R.y + (R.h >> 1); K[idx(cxm, cym)] = KP; if (!keep()) K[idx(cxm, cym)] = KR; else { F.props.push({ i: cxm, j: cym, k: 'campfire', a: 0 }); used[idx(cxm, cym)] = 1; F.lights.push({ i: cxm, j: cym, k: 1.5, r: 9, fl: 2, c: [1, 0.5, 0.18], y: 0.8 }); F.fires.push({ x: tx(cxm), z: tx(cym), s: 0.6 }); }
    for (var n = 0; n < 3; n++) { var px = R.x + ri(R.w), py = R.y + ri(R.h); if (used[idx(px, py)] || Math.abs(px - cxm) + Math.abs(py - cym) < 2) continue; K[idx(px, py)] = KP; if (!keep()) { K[idx(px, py)] = KR; continue; } used[idx(px, py)] = 1; F.props.push({ i: px, j: py, k: th.props[ri(th.props.length)], a: ri(4) * Math.PI / 2 }); } });
  // logs and rocks out among the trees
  for (var t3 = 0; t3 < 30; t3++) { var lx = 2 + ri(MW - 4), ly = 3 + ri(MH - 6); if (K[idx(lx, ly)] !== KC || used[idx(lx, ly)]) continue; K[idx(lx, ly)] = KP; if (!keep()) { K[idx(lx, ly)] = KC; continue; } used[idx(lx, ly)] = 1; F.props.push({ i: lx, j: ly, k: ['log', 'rock', 'stump'][t3 % 3], a: ri(4) * Math.PI / 2 }); }
  var D = bfs(F, mid, last); addHides(F, rnd, 18, used, D, keep); F.hideWord = 'HIDE IN THE BUSHES';
  for (var j3 = 2; j3 < MH - 2; j3 += 3) for (var i3 = 2; i3 < MW - 2; i3 += 3) if (K[idx(i3, j3)] === KC && rnd() < 0.14) F.lights.push({ i: i3, j: j3, k: 0.7, r: 6, fl: 1, c: [1, 0.75, 0.4], y: 2.2, lantern: 1 });
  F.lights.push({ i: mid + 0.5, j: 0.2, k: 2.2, r: 12, fl: 0, c: [1, 0.1, 0.18], y: 3, exit: 1 });
  lvlFill(F, rnd, th, used, bfs(F, mid, last), 14);
  return F;
}
/* ---------- CLUBHOUSE ROW: the red light district ---------- */
var FRONTS = ['fac_cafe', 'fac_amy', 'fac_beebs', 'fac_bonjo', 'fac_joff', 'fac_saba', 'fac_greebo', 'fac_pulsar', 'fac_arcade', 'fac_sanct', 'fac_tb'];
var NEONS = ['n_girls', 'n_xxx', 'n_live', 'n_peep', 'n_open', 'n_heart', 'n_lips', 'n_cum'];
function streetGrid(F, rows, cols) { var K = F.K; rows.forEach(function (j) { for (var i = 1; i < MW - 1; i++) for (var w = 0; w < 3; w++) if (j + w < MH - 1) K[idx(i, j + w)] = KC; }); cols.forEach(function (i) { for (var j = 1; j < MH - 1; j++) for (var w = 0; w < 3; w++) if (i + w < MW - 1) K[idx(i + w, j)] = KC; }); } // streets three tiles wide (he wants it open)
function genDistrict(fi, seed) {
  var rnd = srand(seed), F = lvlBase(fi), K = F.K, th = FLOORS[fi], CT = th.city || { fronts: FRONTS, hussy: 1, club: 1, closed: 10, neons: NEONS, lamps: [[1, 0.1, 0.18], [1, 0.3, 0.65]] }, rows = [], cols = [];
  for (var r = 2; r + 2 < MH - 3; r += 8) rows.push(r); for (var c = 2; c + 2 < MW - 3; c += 9) cols.push(c);
  streetGrid(F, rows, cols);
  for (var i0 = 1; i0 < MW - 1; i0++) K[idx(i0, 1)] = KW; // the top street is closed off on the north by the buildings
  var mid = cols[cols.length >> 1], last = rows[rows.length - 1] + 1;
  // two blocks knocked flat into open squares, a statue in each
  for (var pz = 0, ptry = 0; pz < 2 && ptry < 40; ptry++) { var br = 1 + Math.floor(rnd() * (rows.length - 2)), bc = Math.floor(rnd() * (cols.length - 1)), y0 = rows[br] + 3, x0 = cols[bc] + 3, y1 = rows[br + 1] - 1, x1 = cols[bc + 1] - 1; if (F.squares && F.squares.some(function (s) { return s[0] === br && s[1] === bc; })) continue; (F.squares = F.squares || []).push([br, bc]); for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) K[idx(xx, yy)] = KC; var sx = (x0 + x1) >> 1, sy = (y0 + y1) >> 1; K[idx(sx, sy)] = KP; F.props.push({ i: sx, j: sy, k: 'angel', a: 0 }); pz++; }
  F.start = { i: mid, j: last, a: Math.PI }; F.start2 = { i: mid + 1, j: last }; F.respawn = F.start; F.cellIn = F.start; F.tb = { i: mid, j: last - 1 };
  F.club = { i: mid, j: 2 }; F.exitIn = { i: mid, j: 2 }; F.exitZone = [mid - 1, 2, mid + 2, 3];
  var used = {}; used[idx(mid, last)] = used[idx(mid + 1, last)] = used[idx(mid, 2)] = used[idx(mid + 1, 2)] = 1;
  var keep = function () { var D = bfs(F, mid, last); return D[idx(mid, 2)] >= 0; };
  var scale = MW * MH / (41 * 41);
  // barricades close some stretches so it is a maze of streets, never a straight run
  for (var t = 0; t < 7 * scale; t++) { var horiz = rnd() < 0.5, a, b, cells = [];
    if (horiz) { var row = rows[1 + Math.floor(rnd() * (rows.length - 2))], c0 = cols[Math.floor(rnd() * (cols.length - 1))]; a = c0 + 3 + Math.floor(rnd() * 3); cells = [[a, row], [a, row + 1]]; }
    else { var col = cols[Math.floor(rnd() * cols.length)], r0 = rows[Math.floor(rnd() * (rows.length - 1))]; b = r0 + 3 + Math.floor(rnd() * 2); cells = [[col, b], [col + 1, b]]; }
    if (cells.some(function (q) { return K[idx(q[0], q[1])] !== KC || used[idx(q[0], q[1])]; })) continue;
    cells.forEach(function (q) { K[idx(q[0], q[1])] = KP; }); if (!keep()) { cells.forEach(function (q) { K[idx(q[0], q[1])] = KC; }); continue; }
    cells.forEach(function (q, n) { used[idx(q[0], q[1])] = 1; F.props.push({ i: q[0], j: q[1], k: n ? 'car' : 'barrier', a: horiz ? 0 : Math.PI / 2 }); }); }
  // alleys through some blocks
  for (var al = 0; al < 9 * scale; al++) { var vert = rnd() < 0.5; if (vert) { var ci = cols[Math.floor(rnd() * (cols.length - 1))] + 4 + Math.floor(rnd() * 3), rj = rows[Math.floor(rnd() * (rows.length - 1))]; for (var j = rj + 2; j < rj + 7; j++) if (K[idx(ci, j)] === KW) K[idx(ci, j)] = KC; }
    else { var rj2 = rows[Math.floor(rnd() * (rows.length - 1))] + 3 + Math.floor(rnd() * 3), ci2 = cols[Math.floor(rnd() * (cols.length - 1))]; for (var i = ci2 + 2; i < ci2 + 8; i++) if (K[idx(i, rj2)] === KW) K[idx(i, rj2)] = KC; } }
  var D = bfs(F, mid, last), total = D[idx(mid, 2)];
  // every shop front is a door you can walk through: a room carved into the block behind it
  F.doorRoom = {};
  function carve(f, kind) {
    var q = DIRS[f.d], di = f.i + q[0], dj = f.j + q[1], wide = 1, deep = 3, s0 = [-q[1], q[0]];
    var cells = []; for (var dd = 1; dd <= deep; dd++) for (var w = -wide; w <= wide; w++) cells.push([di + q[0] * dd + s0[0] * w, dj + q[1] * dd + s0[1] * w]);
    var ring = []; for (var d2 = 0; d2 <= deep + 1; d2++) for (var w2 = -wide - 1; w2 <= wide + 1; w2++) ring.push([di + q[0] * d2 + s0[0] * w2, dj + q[1] * d2 + s0[1] * w2]);
    if (ring.some(function (p) { return !inMap(p[0], p[1]) || p[0] < 1 || p[1] < 1 || p[0] > MW - 2 || p[1] > MH - 2 || K[idx(p[0], p[1])] !== KW || used[idx(p[0], p[1])]; })) return null;
    var xs = cells.map(function (p) { return p[0]; }), ys = cells.map(function (p) { return p[1]; }), R = { id: F.rooms.length, x: Math.min.apply(0, xs), y: Math.min.apply(0, ys), doors: [{ i: di, j: dj, di: -q[0], dj: -q[1] }], shop: kind };
    R.w = Math.max.apply(0, xs) - R.x + 1; R.h = Math.max.apply(0, ys) - R.y + 1; var S = SHOPIN[kind] || SHOPIN.closed; R.th = { room: S.room, roomf: S.floor, wall2: 'wood', ceil: 'ceil', wall: S.room, floor: S.floor };
    F.rooms.push(R); cells.forEach(function (p) { K[idx(p[0], p[1])] = KR; F.RM[idx(p[0], p[1])] = R.id; used[idx(p[0], p[1])] = 1; }); K[idx(di, dj)] = KD; F.doorRoom[idx(di, dj)] = R.id; used[idx(di, dj)] = 1;
    ring.forEach(function (p) { used[idx(p[0], p[1])] = 1; });
    // furniture along the back and sides, never in the line from the door
    var spots = cells.filter(function (p) { var dd2 = Math.abs((p[0] - di) * q[0] + (p[1] - dj) * q[1]), ww = (p[0] - di) * s0[0] + (p[1] - dj) * s0[1]; return !(ww === 0 && dd2 < deep) && !(dd2 === 1 && Math.abs(ww) <= 1 && wide === 1); });
    spots.sort(function () { return rnd() - 0.5; });
    (S.props || []).slice(0, Math.max(1, spots.length - 2)).forEach(function (k, n) { var p = spots[n]; if (!p) return; var ww = (p[0] - di) * s0[0] + (p[1] - dj) * s0[1], back = Math.abs((p[0] - di) * q[0] + (p[1] - dj) * q[1]) === deep;
      var face = back && !ww ? Math.atan2(-q[0], -q[1]) : ww ? Math.atan2(-s0[0] * Math.sign(ww), -s0[1] * Math.sign(ww)) : Math.atan2(-q[0], -q[1]);
      K[idx(p[0], p[1])] = KP; F.props.push({ i: p[0], j: p[1], k: k, a: face, indoor: 1 }); });
    var lc = [di + q[0] * 2, dj + q[1] * 2]; F.lights.push({ i: lc[0], j: lc[1], k: 0.75, r: 6, fl: rnd() < 0.5 ? 1 : 0, c: [1, 0.35, 0.3], indoor: 1 });
    var free = cells.filter(function (p) { return K[idx(p[0], p[1])] === KR; }); (S.loot || []).forEach(function (k) { var p = free[Math.floor(rnd() * free.length)]; if (p) F.loot.push({ i: p[0], j: p[1], k: k }); });
    return R;
  }
  // T's Hussy House: a shop front about half way along the route to the Clubhouse
  var faces = []; for (var j5 = 2; j5 < MH - 2; j5++) for (var i5 = 2; i5 < MW - 2; i5++) { if (K[idx(i5, j5)] !== KC || D[idx(i5, j5)] < 0) continue; DIRS.forEach(function (q, d) { if (K[idx(i5 + q[0], j5 + q[1])] === KW) faces.push({ i: i5, j: j5, d: d, dd: D[idx(i5, j5)] }); }); }
  faces.sort(function (p, q) { return Math.abs(p.dd - total * 0.5) - Math.abs(q.dd - total * 0.5) + (rnd() - 0.5) * 6; });
  var best = null; if (CT.hussy) { for (var h = 0; h < faces.length && !best; h++) { var f0 = { i: faces[h].i, j: faces[h].j, d: faces[h].d, k: 'fac_t', big: 1 }; if (carve(f0, 'fac_t')) { best = f0; } } F.hussy = best; if (best) F.fronts.push(best); }
  if (CT.club) F.fronts.push({ i: mid, j: 2, d: 3, k: 'fac_club', big: 1, at: mid + 0.5 }); // the Clubhouse, north end of the top street
  else { K[idx(mid, 1)] = KC; K[idx(mid + 1, 1)] = KC; F.exitZone = [mid, 1, mid + 1, 2]; F.lights.push({ i: mid + 0.5, j: 1.2, k: 2, r: 10, fl: 0, c: CT.lamps[0], y: 3, exit: 1 }); F.neons.push({ i: mid - 1, j: 2, d: 3, k: CT.exitSign || 'n_open', y: 3.6, o: 0 }); } // the street runs on north
  faces.sort(function () { return rnd() - 0.5; });
  function place(k, n) { for (var h2 = 0; h2 < faces.length; h2++) { var q = faces[h2]; if (F.fronts.some(function (o) { return Math.abs(o.i - q.i) + Math.abs(o.j - q.j) < 5; }) || q.dd < 4) continue; var f = { i: q.i, j: q.j, d: q.d, k: k }; if (carve(f, k)) { faces.splice(h2, 1); if (k !== 'closed') F.fronts.push(f); else F.plain.push(f); return f; } } }
  F.plain = []; CT.fronts.forEach(function (k) { place(k); }); for (var cl = 0; cl < (CT.closed || 10) * scale; cl++) place('closed');
  // neon on every other wall
  faces.slice(0, Math.round(160 * scale)).forEach(function (f, n) { if (n % 2 && K[idx(f.i + DIRS[f.d][0], f.j + DIRS[f.d][1])] === KW) F.neons.push({ i: f.i, j: f.j, d: f.d, k: CT.neons[Math.floor(rnd() * CT.neons.length)], y: 3.2 + rnd() * 2.2, o: (rnd() - 0.5) * 0.8 }); });
  // red street lamps everywhere
  for (var j6 = 1; j6 < MH - 1; j6++) for (var i6 = 1; i6 < MW - 1; i6++) if (K[idx(i6, j6)] === KC && (i6 * 7 + j6 * 13) % 9 === 0) { var adj = DIRS.some(function (q) { return K[idx(i6 + q[0], j6 + q[1])] === KW; }); if (adj) F.lights.push({ i: i6, j: j6, k: 1.25, r: 8, fl: rnd() < 0.2 ? 1 : 0, c: rnd() < 0.7 ? CT.lamps[0] : CT.lamps[1], y: 3.6, pole: 1 }); }
  F.fronts.forEach(function (f) { var q = DIRS[f.d]; F.lights.push({ i: f.i - q[0] * 0.2, j: f.j - q[1] * 0.2, k: f.big ? 1.4 : 0.9, r: 7, fl: 0, c: [1, 0.3, 0.25], y: 2.6 }); });
  D = bfs(F, mid, last); addHides(F, rnd, Math.round(12 * scale), used, D, keep); F.hideWord = 'HIDE IN THE DUMPSTER'; F.dumpsters = 1;
  // wardrobes to hide in inside some of the shops
  F.rooms.forEach(function (R, n) { if (n % 2) return; for (var y = R.y; y < R.y + R.h; y++) for (var x = R.x; x < R.x + R.w; x++) { if (K[idx(x, y)] !== KR) continue; var w3 = DIRS.find(function (q) { return K[idx(x + q[0], y + q[1])] === KW; }); if (!w3) continue; K[idx(x, y)] = KL; if (!keep() || bfs(F, mid, last)[idx(R.doors[0].i, R.doors[0].j)] < 0) { K[idx(x, y)] = KR; continue; } F.lockers.push({ i: x, j: y, di: -w3[0], dj: -w3[1], indoor: 1 }); return; } });
  if (CT.tables) { // the cafes put their tables out on the pavement
    F.fronts.forEach(function (f) { if (!f.k || f.k === 'fac_club') return; var q = DIRS[f.d], s0 = [-q[1], q[0]]; [-2, 2].forEach(function (w) { var i = f.i + s0[0] * w - q[0], j = f.j + s0[1] * w - q[1]; if (!inMap(i, j) || K[idx(i, j)] !== KC || used[idx(i, j)]) return; K[idx(i, j)] = KP; if (!keep()) { K[idx(i, j)] = KC; return; } used[idx(i, j)] = 1; F.props.push({ i: i, j: j, k: 'cafetable', a: Math.atan2(q[0], q[1]) }); }); });
  }
  lvlFill(F, rnd, th, used, D, 10);
  F.tbIn = best ? { i: best.i, j: best.j } : { i: mid, j: last }; F.toClub = bfs(F, mid, 2); F.clubTotal = F.toClub[idx(mid, last)]; if (!CT.club) F.exitIn = { i: mid, j: 2 };
  return F;
}
/* ---------- THE PLAZA in front of the Clubhouse ---------- */
function genArena(fi, seed) {
  var rnd = srand(seed), F = lvlBase(fi), K = F.K, th = FLOORS[fi];
  for (var j = 12; j <= 32; j++) for (var i = 10; i <= 30; i++) K[idx(i, j)] = KC;
  [[14, 17, 'car', 0], [26, 17, 'car', 0], [14, 27, 'barrier', 0], [26, 27, 'barrier', 0], [20, 22, 'car', Math.PI / 2]].forEach(function (p) { K[idx(p[0], p[1])] = KP; F.props.push({ i: p[0], j: p[1], k: p[2], a: p[3] }); });
  F.start = { i: 20, j: 31, a: Math.PI }; F.start2 = { i: 21, j: 31 }; F.respawn = F.start; F.cellIn = F.start; F.tb = { i: 20, j: 15 }; F.exitIn = { i: 20, j: 12 };
  F.fronts.push({ i: 20, j: 12, d: 3, k: 'fac_club', big: 1, at: 20.5 }); F.fronts.push({ i: 10, j: 20, d: 1, k: 'fac_tb' }); F.fronts.push({ i: 30, j: 24, d: 0, k: 'fac_t' });
  for (var n = 0; n < 16; n++) { var side = n % 4, a = 11 + Math.floor(rnd() * 19); var ii = side === 0 ? 10 : side === 1 ? 30 : a, jj = side === 2 ? 12 : side === 3 ? 32 : 13 + Math.floor(rnd() * 19); F.neons.push({ i: ii, j: jj, d: side === 0 ? 1 : side === 1 ? 0 : side === 2 ? 3 : 2, k: NEONS[n % NEONS.length], y: 3.4 + rnd() * 2, o: 0 }); }
  for (var q = 0; q < 8; q++) F.lights.push({ i: [12, 28, 12, 28, 20, 12, 28, 20][q], j: [14, 14, 30, 30, 13, 22, 22, 31][q], k: 1.3, r: 10, fl: q === 6 ? 1 : 0, c: q % 3 ? [1, 0.12, 0.2] : [1, 0.35, 0.6], y: 3.8, pole: 1 });
  lvlFill(F, rnd, th, {}, bfs(F, 20, 31), 0); F.loot.forEach(function (l) { l.boss = 1; });
  return F;
}
/* ---------- the looks outside ---------- */
function buildOutdoorMesh(F, mesh) {
  var m = mesh || new R3.Mesh(), K = F.K, kind = F.meshKind || FLOORS[F.fi].kind, rnd = srand(F.fi * 313 + 7);
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  function kk(i, j) { return inMap(i, j) ? K[idx(i, j)] : KW; }
  function boxM(x0, y0, z0, x1, y1, z1, T, k) { var c = vc(k || 1), cd = vc((k || 1) * 0.75), w = (x1 - x0) / TSZ * 2, h = (y1 - y0) / TSZ * 2, d = (z1 - z0) / TSZ * 2, uvw = [0, h, w, h, w, 0, 0, 0], uvd = [0, h, d, h, d, 0, 0, 0];
    m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, w, 0, w, d, 0, d], T, c, [0, 1, 0]);
    m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], uvw, T, cd, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], uvw, T, cd, [0, 0, -1]);
    m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], uvd, T, cd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], uvd, T, cd, [-1, 0, 0]); }
  function cylM(cx, cz, y0, y1, r, T, k, seg, uRep) { seg = seg || 7; var c = vc(k || 1); for (var s = 0; s < seg; s++) { var a0 = s / seg * 6.283, a1 = (s + 1) / seg * 6.283, n0 = [Math.cos(a0), 0, Math.sin(a0)], n1 = [Math.cos(a1), 0, Math.sin(a1)], v = (y1 - y0) / 2.4;
    m.quadN([[cx + n0[0] * r, y0, cz + n0[2] * r], [cx + n1[0] * r, y0, cz + n1[2] * r], [cx + n1[0] * r, y1, cz + n1[2] * r], [cx + n0[0] * r, y1, cz + n0[2] * r]], [0, v, 1, v, 1, 0, 0, 0], T, c, [n0, n1, n1, n0]); } }
  function cross(x, z, w, h, T, k) { var c = vc(k || 1); m.quad([x - w, 0, z], [x + w, 0, z], [x + w, h, z], [x - w, h, z], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [0, 0, 1]); m.quad([x, 0, z - w], [x, 0, z + w], [x, h, z + w], [x, h, z - w], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [1, 0, 0]); }
  function face(i, j, d, y0, y1, T, k, uv, g) { var x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ, a, b, n, v = (y1 - y0) / TSZ;
    if (d === 0) { a = [x1, z0]; b = [x1, z1]; n = [-1, 0, 0]; } else if (d === 1) { a = [x0, z1]; b = [x0, z0]; n = [1, 0, 0]; } else if (d === 2) { a = [x1, z1]; b = [x0, z1]; n = [0, 0, -1]; } else { a = [x0, z0]; b = [x1, z0]; n = [0, 0, 1]; }
    m.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], uv || [0, v, 1, v, 1, 0, 0, 0], T, vc(k), n, g || 0); }
  var CTY = FLOORS[F.fi].city || {}, WIN1 = CTY.win || 'windows', WIN2 = CTY.glow || 'shopglow';
  function indoor(i, j) { if (!inMap(i, j)) return false; var rm = F.RM[idx(i, j)]; return rm >= 0 && F.rooms[rm] && F.rooms[rm].shop || K[idx(i, j)] === KD; }
  if (kind === 'park') parkMesh(F, m, { boxM: boxM, cylM: cylM, cross: cross, face: face, vc: vc, kk: kk, rnd: rnd });
  else if (kind === 'woods') {
    for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
      var k = kk(i, j), x0 = i * TSZ, z0 = j * TSZ, cx = x0 + TSZ / 2, cz = z0 + TSZ / 2, room = F.RM[idx(i, j)] >= 0;
      m.quad([x0, 0, z0 + TSZ], [x0 + TSZ, 0, z0 + TSZ], [x0 + TSZ, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(k === KW ? 'grass' : room ? 'dirt' : rnd() < 0.5 ? 'dirt' : 'grass'), vc(0.85 + rnd() * 0.2), [0, 1, 0]);
      if (k !== KW) continue;
      var edge = DIRS.some(function (q) { var n = kk(i + q[0], j + q[1]); return n !== KW; });
      var nt = edge ? 2 : 1; for (var t = 0; t < nt; t++) { var tx0 = x0 + 0.4 + rnd() * (TSZ - 0.8), tz0 = z0 + 0.4 + rnd() * (TSZ - 0.8), r = 0.18 + rnd() * 0.24, ht = 7 + rnd() * 5; cylM(tx0, tz0, 0, ht, r, TL('bark'), 0.75 + rnd() * 0.3);
        var cr = 1.2 + rnd() * 1.1, cy0 = 3.5 + rnd() * 2, cy1 = ht + 1.5, ap = [tx0, cy1, tz0], base = [[tx0 - cr, cy0, tz0 - cr], [tx0 + cr, cy0, tz0 - cr], [tx0 + cr, cy0, tz0 + cr], [tx0 - cr, cy0, tz0 + cr]];
        for (var s = 0; s < 4; s++) m.tri(base[s], base[(s + 1) % 4], ap, [0, 1, 1, 1, 0.5, 0], TL('leaves'), vc(0.7 + rnd() * 0.3)); m.quad(base[0], base[1], base[2], base[3], [0, 0, 1, 0, 1, 1, 0, 1], TL('leaves'), vc(0.5), [0, -1, 0]); }
      if (edge) { DIRS.forEach(function (q, d) { if (kk(i + q[0], j + q[1]) === KW) return; var bx = cx + q[0] * (TSZ / 2 - 0.25), bz = cz + q[1] * (TSZ / 2 - 0.25); if (q[0]) m.quad([bx, 0, z0], [bx, 0, z0 + TSZ], [bx, 1.9, z0 + TSZ], [bx, 1.9, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL('bush'), vc(0.9), [q[0], 0, 0]); else m.quad([x0, 0, bz], [x0 + TSZ, 0, bz], [x0 + TSZ, 1.9, bz], [x0, 1.9, bz], [0, 1, 1, 1, 1, 0, 0, 0], TL('bush'), vc(0.9), [0, 0, q[1]]); }); }
    }
    F.lockers.forEach(function (L) { var r = lockerRect(L), cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2; cross(cx, cz, 0.85, 2.2, TL('bush'), 1); cross(cx + 0.2, cz - 0.2, 0.7, 1.8, TL('bush'), 0.8); boxM(r[0] + 0.1, 0, r[1] + 0.1, r[2] - 0.1, 1.2, r[3] - 0.1, TL('leaves'), 0.6); });
    F.lights.forEach(function (L) { if (!L.lantern) return; var x = tx(L.i), z = tx(L.j); boxM(x - 0.1, 2.0, z - 0.1, x + 0.1, 2.35, z + 0.1, TL('metal'), 0.8); });
  } else {
    var H = {}; function hgt(i, j) { var key = idx(i, j); if (H[key]) return H[key]; var b = ((i >> 2) * 73856093 ^ (j >> 2) * 19349663) >>> 0; return (H[key] = 6 + (b % 9)); }
    for (var j2 = 0; j2 < MH; j2++) for (var i2 = 0; i2 < MW; i2++) {
      var k2 = kk(i2, j2), x02 = i2 * TSZ, z02 = j2 * TSZ;
      if (k2 === KD) { var hq = DIRS.findIndex(function (q) { var n = kk(i2 + q[0], j2 + q[1]); return n !== KW && n !== KD && !indoor(i2 + q[0], j2 + q[1]); }); if (hq >= 0) { var sq = DIRS[hq], nb = DIRS.map(function (q) { return kk(i2 + q[0], j2 + q[1]) === KW ? hgt(i2 + q[0], j2 + q[1]) : 0; }), hh = Math.max.apply(0, nb) || 7, bt = null; DIRS.forEach(function (q) { var nq = idx(i2 + q[0], j2 + q[1]); if (F.BT && F.BT[nq] && kk(i2 + q[0], j2 + q[1]) === KW) bt = F.BT[nq]; }); face(i2 + sq[0], j2 + sq[1], hq === 0 ? 1 : hq === 1 ? 0 : hq === 2 ? 3 : 2, bt ? 2.25 : CEIL, hh, TL(bt || 'windows'), 0.9, [0, (hh - CEIL) / 2.6, 1, (hh - CEIL) / 2.6, 1, 0, 0, 0]); } continue; }
      if (k2 !== KW && indoor(i2, j2)) continue;
      if (k2 !== KW) { var nearWall = DIRS.some(function (q) { return kk(i2 + q[0], j2 + q[1]) === KW; }), ft = F.FT ? F.FT[idx(i2, j2)] || FLOORS[F.fi].floor : nearWall ? 'pave' : FLOORS[F.fi].floor || 'asphalt'; m.quad([x02, 0, z02 + TSZ], [x02 + TSZ, 0, z02 + TSZ], [x02 + TSZ, 0, z02], [x02, 0, z02], [0, 1, 1, 1, 1, 0, 0, 0], TL(ft), vc(0.85 + rnd() * 0.15), [0, 1, 0]); continue; }
      var bq = idx(i2, j2), BT = F.BT && inMap(i2, j2) ? F.BT[bq] : null;
      if (BT) { var bh = F.BH[bq], roofT = BT === 'hedge' ? 'hedge' : BT === 'conc' ? 'roof' : BT; m.quad([x02, bh, z02], [x02 + TSZ, bh, z02], [x02 + TSZ, bh, z02 + TSZ], [x02, bh, z02 + TSZ], [0, 0, 1, 0, 1, 1, 0, 1], TL(roofT), vc(0.7), [0, 1, 0]);
        for (var db = 0; db < 4; db++) { var qb = DIRS[db]; if (indoor(i2 + qb[0], j2 + qb[1])) continue; var nkb = kk(i2 + qb[0], j2 + qb[1]), nib = i2 + qb[0], njb = j2 + qb[1], nhb = nkb === KW ? (inMap(nib, njb) ? (F.BT[idx(nib, njb)] ? F.BH[idx(nib, njb)] : hgt(nib, njb)) : 99) : 0; if (nhb >= bh) continue;
          var fdb = db === 0 ? 1 : db === 1 ? 0 : db === 2 ? 3 : 2, y0b = nhb; while (y0b < bh) { var y1b = Math.min(bh, y0b + TSZ); face(nib, njb, fdb, y0b, y1b, TL(BT), 0.85, [0, (y1b - y0b) / TSZ, 1, (y1b - y0b) / TSZ, 1, 0, 0, 0]); y0b = y1b; }
          if (BT === 'crypt' || BT === 'stonewall') face(nib, njb, fdb, bh - 0.2, bh, TL('marble'), 0.8);
          if (F.BT[bq + '_s'] && nhb === 0) { var ox = (i2 + 0.5 + qb[0] * 0.5) * TSZ + qb[0] * 0.35, oz = (j2 + 0.5 + qb[1] * 0.5) * TSZ + qb[1] * 0.35; for (var ly = 2; ly < bh; ly += 2.2) { if (qb[0]) boxM(ox - 0.06, ly, z02, ox + 0.06, ly + 0.08, z02 + TSZ, TL('plywood'), 0.8); else boxM(x02, ly, oz - 0.06, x02 + TSZ, ly + 0.08, oz + 0.06, TL('plywood'), 0.8); }
            if ((i2 + j2) % 2 === 0) boxM(ox - 0.04, 0, oz - 0.04, ox + 0.04, bh, oz + 0.04, TL('metal'), 0.8); } }
        continue; }
      var h = hgt(i2, j2); m.quad([x02, h, z02], [x02 + TSZ, h, z02], [x02 + TSZ, h, z02 + TSZ], [x02, h, z02 + TSZ], [0, 0, 1, 0, 1, 1, 0, 1], TL('roof'), vc(0.6), [0, 1, 0]);
      for (var d = 0; d < 4; d++) { var q = DIRS[d]; if (indoor(i2 + q[0], j2 + q[1])) continue; var nk = kk(i2 + q[0], j2 + q[1]), nh = nk === KW ? (inMap(i2 + q[0], j2 + q[1]) ? hgt(i2 + q[0], j2 + q[1]) : 99) : 0; if (nh >= h) continue;
        var fd = d === 0 ? 1 : d === 1 ? 0 : d === 2 ? 3 : 2, ni = i2 + q[0], nj = j2 + q[1]; // the face on the neighbour's side, looking back at this building
        if (nh < 3.2) { var lit = ((ni * 31 + nj * 17 + d * 7) % 5) < 2; if (lit) { face(ni, nj, fd, nh, 0.6, TL('citywall'), 0.8); face(ni, nj, fd, 0.6, 2.7, TL(WIN2), 0.7, [0, 1, 1, 1, 1, 0, 0, 0], 0.7); face(ni, nj, fd, 2.7, 3.2, TL('citywall'), 0.8); } else face(ni, nj, fd, nh, 3.2, TL('citywall'), 0.8); } var y = Math.max(3.2, nh); while (y < h) { var y1 = Math.min(h, y + 2.6); face(ni, nj, fd, y, y1, TL(WIN1), 0.9, [0, (y1 - y) / 2.6, 1, (y1 - y) / 2.6, 1, 0, 0, 0]); y = y1; }
        face(ni, nj, fd, h - 0.25, h, TL('metal'), 0.7); }
    }
    // neon on the walls (lights itself)
    F.neons.forEach(function (N) { var q = DIRS[N.d], x0 = N.i * TSZ, z0 = N.j * TSZ, s = 1.05, y = N.y, T = TL(N.k), off = TSZ / 2 - 0.03, cx = x0 + TSZ / 2 + q[0] * off, cz = z0 + TSZ / 2 + q[1] * off, n = [-q[0], 0, -q[1]];
      if (q[0]) m.quad([cx, y - s, cz - s * q[0] + N.o], [cx, y - s, cz + s * q[0] + N.o], [cx, y + s, cz + s * q[0] + N.o], [cx, y + s, cz - s * q[0] + N.o], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(1), n, 1.6);
      else m.quad([cx + s * q[1] + N.o, y - s, cz], [cx - s * q[1] + N.o, y - s, cz], [cx - s * q[1] + N.o, y + s, cz], [cx + s * q[1] + N.o, y + s, cz], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(1), n, 1.6); });
    // red neon tubes strung across the streets
    if (kind === 'district') for (var j7 = 2; j7 < MH - 2; j7++) for (var i7 = 2; i7 < MW - 2; i7++) { if (kk(i7, j7) !== KC || (i7 * 3 + j7 * 5) % 11) continue; var hz = kk(i7 - 1, j7) === KW && kk(i7 + 2, j7) === KW && kk(i7 + 1, j7) === KC, vt = kk(i7, j7 - 1) === KW && kk(i7, j7 + 2) === KW && kk(i7, j7 + 1) === KC, y7 = 4.6 + (i7 % 3) * 0.4, tc = TL('glow'), cc = (i7 + j7) % 3 ? [0.6, 0.06, 0.1] : [0.6, 0.2, 0.45];
      if (hz) m.quad([i7 * TSZ, y7, (j7 + 0.5) * TSZ - 0.05], [(i7 + 2) * TSZ, y7 - 0.3, (j7 + 0.5) * TSZ - 0.05], [(i7 + 2) * TSZ, y7 - 0.22, (j7 + 0.5) * TSZ + 0.05], [i7 * TSZ, y7 + 0.08, (j7 + 0.5) * TSZ + 0.05], [0, 0, 1, 0, 1, 1, 0, 1], tc, cc, [0, -1, 0], 2);
      if (vt) m.quad([(i7 + 0.5) * TSZ - 0.05, y7, j7 * TSZ], [(i7 + 0.5) * TSZ - 0.05, y7 - 0.3, (j7 + 2) * TSZ], [(i7 + 0.5) * TSZ + 0.05, y7 - 0.22, (j7 + 2) * TSZ], [(i7 + 0.5) * TSZ + 0.05, y7 + 0.08, j7 * TSZ], [0, 0, 1, 0, 1, 1, 0, 1], tc, cc, [0, -1, 0], 2); }
    // lamp posts, dumpsters
    F.lights.forEach(function (L) { if (!L.pole) return; var x = tx(L.i), z = tx(L.j); boxM(x - 0.05, 0, z - 0.05, x + 0.05, L.y, z + 0.05, TL('metal'), 0.6); boxM(x - 0.2, L.y - 0.1, z - 0.2, x + 0.2, L.y + 0.05, z + 0.2, TL('metal'), 0.8); });
    F.lockers.forEach(function (L) { if (L.indoor) return; var r = lockerRect(L);
      if (L.style === 'coffin') { boxM(r[0], 0, r[1], r[2], 2.0, r[3], TL('wood'), 0.55); boxM((r[0] + r[2]) / 2 - 0.05, 1.2, (r[1] + r[3]) / 2 - 0.05, (r[0] + r[2]) / 2 + 0.05, 1.7, (r[1] + r[3]) / 2 + 0.05, TL('marble'), 0.9); return; }
      if (L.style === 'loo') { boxM(r[0], 0, r[1], r[2], 2.3, r[3], TL('carpaint'), 0.3); boxM(r[0] - 0.03, 2.3, r[1] - 0.03, r[2] + 0.03, 2.38, r[3] + 0.03, TL('white'), 0.8); return; }
      boxM(r[0], 0.1, r[1], r[2], 1.4, r[3], TL('rust'), 1); boxM(r[0] - 0.05, 1.4, r[1] - 0.05, r[2] + 0.05, 1.5, r[3] + 0.05, TL('metal'), 0.7); });
  }
  // props outside
  F.props.forEach(function (p) { if (p.indoor) return; var cx = tx(p.i), cz = tx(p.j), s = Math.sin(p.a), c = Math.cos(p.a);
    function B(f0, f1, s0, s1, y0, y1, T, kk2) { var pts = [[s0, f0], [s1, f0], [s1, f1], [s0, f1]].map(function (q) { return [cx + q[0] * c + q[1] * s, cz - q[0] * s + q[1] * c]; }); var xs = pts.map(function (q) { return q[0]; }), zs = pts.map(function (q) { return q[1]; }); boxM(Math.min.apply(0, xs), y0, Math.min.apply(0, zs), Math.max.apply(0, xs), y1, Math.max.apply(0, zs), T, kk2); }
    if (p.k === 'log') B(-0.3, 0.3, -1.0, 1.0, 0, 0.55, TL('bark'), 0.9);
    else if (p.k === 'stump') cylM(cx, cz, 0, 0.7, 0.45, TL('bark'), 0.9);
    else if (p.k === 'rock') { B(-0.7, 0.6, -0.7, 0.8, 0, 0.9, TL('rockt'), 0.9); B(-0.3, 0.3, -0.4, 0.4, 0.9, 1.3, TL('rockt'), 1); }
    else if (p.k === 'tent') { var a0 = [cx - 1, 0, cz - 1], a1 = [cx + 1, 0, cz - 1], a2 = [cx + 1, 0, cz + 1], a3 = [cx - 1, 0, cz + 1], top0 = [cx - 1, 1.6, cz], top1 = [cx + 1, 1.6, cz]; m.quad(a0, a1, top1, top0, [0, 1, 1, 1, 1, 0, 0, 0], TL('canvas'), vc(1)); m.quad(a3, a2, top1, top0, [0, 1, 1, 1, 1, 0, 0, 0], TL('canvas'), vc(0.8)); }
    else if (p.k === 'campfire') { for (var n = 0; n < 7; n++) { var aa = n / 7 * 6.28; boxM(cx + Math.cos(aa) * 0.6 - 0.12, 0, cz + Math.sin(aa) * 0.6 - 0.12, cx + Math.cos(aa) * 0.6 + 0.12, 0.2, cz + Math.sin(aa) * 0.6 + 0.12, TL('rockt'), 0.8); } B(-0.08, 0.08, -0.5, 0.5, 0, 0.16, TL('bark'), 0.5); B(-0.5, 0.5, -0.08, 0.08, 0.05, 0.2, TL('bark'), 0.5); }
    else if (p.k === 'car') { B(-1.0, 1.0, -0.85, 0.85, 0.3, 0.95, TL('carpaint'), 0.35); B(-0.5, 0.45, -0.75, 0.75, 0.95, 1.45, TL('windscreen'), 0.8); [[-0.75, -0.7], [0.75, -0.7], [-0.75, 0.7], [0.75, 0.7]].forEach(function (w) { var wx = cx + w[1] * c + w[0] * s, wz = cz - w[1] * s + w[0] * c; boxM(wx - 0.18, 0, wz - 0.18, wx + 0.18, 0.4, wz + 0.18, TL('black'), 1); }); }
    else if (p.k === 'barrier') { B(-0.15, 0.15, -1.1, 1.1, 0, 0.9, TL('metal'), 0.8); B(-0.17, 0.17, -1.12, 1.12, 0.55, 0.7, TL('carpaint'), 0.9); }
    else if (p.k === 'bin' || p.k === 'dumpster') B(-0.5, 0.5, -0.5, 0.5, 0, 1.1, TL('rust'), 1);
    else if (p.k === 'grave') { var go = p.o || 0; B(-0.12 + go, 0.12 + go, -0.42, 0.42, 0, 1.05, TL('grave'), 0.9); B(-0.6, 0.6, -0.45, 0.45, 0, 0.12, TL('dirt'), 0.8); }
    else if (p.k === 'cross') { B(-0.06, 0.06, -0.06, 0.06, 0, 1.6, TL('grave'), 0.9); B(-0.06, 0.06, -0.4, 0.4, 1.1, 1.24, TL('grave'), 0.9); B(-0.5, 0.5, -0.4, 0.4, 0, 0.1, TL('dirt'), 0.8); }
    else if (p.k === 'tomb') { B(-0.85, 0.85, -0.5, 0.5, 0, 0.9, TL('marble'), 0.8); B(-0.9, 0.9, -0.55, 0.55, 0.9, 1.0, TL('marble'), 1); B(-0.1, 0.1, -0.35, 0.35, 1.0, 1.9, TL('marble'), 0.9); }
    else if (p.k === 'angel') { B(-0.45, 0.45, -0.45, 0.45, 0, 0.7, TL('marble'), 0.8); cylM(cx, cz, 0.7, 2.0, 0.24, TL('marble'), 0.9); cylM(cx, cz, 2.0, 2.4, 0.15, TL('marble'), 1); B(-0.1, 0.1, -0.75, 0.75, 1.5, 2.3, TL('marble'), 0.75); }
    else if (p.k === 'deadtree') { cylM(cx, cz, 0, 4.2, 0.2, TL('bark'), 0.6); B(-0.05, 0.05, 0, 1.3, 2.6, 2.7, TL('bark'), 0.6); B(-1.1, 0, -0.05, 0.05, 3.2, 3.3, TL('bark'), 0.6); B(-0.05, 0.05, -1.0, 0, 3.7, 3.8, TL('bark'), 0.6); }
    else if (p.k === 'girders') { for (var gl = 0; gl < 3; gl++) B(-0.25 + gl * 0.02, 0.25, -1.1, 1.1, gl * 0.25, gl * 0.25 + 0.22, TL('girder'), 0.9 - gl * 0.1); }
    else if (p.k === 'pipes') { for (var pp = 0; pp < 3; pp++) { var px = cx + (pp - 1) * 0.42 * c, pz = cz - (pp - 1) * 0.42 * s; if (c > 0.5 || c < -0.5) boxM(px - 0.2, 0, cz - 1.1, px + 0.2, 0.4, cz + 1.1, TL('pipe'), 0.9); else boxM(cx - 1.1, 0, pz - 0.2, cx + 1.1, 0.4, pz + 0.2, TL('pipe'), 0.9); } B(-0.2, 0.2, -1.1, 1.1, 0.4, 0.75, TL('pipe'), 0.8); }
    else if (p.k === 'mixer') { cylM(cx, cz, 0.5, 1.6, 0.6, TL('plastic'), 0.9, 9); B(-0.7, 0.7, -0.5, 0.5, 0, 0.5, TL('metal'), 0.8); [[-0.6, -0.5], [0.6, -0.5]].forEach(function (w) { boxM(cx + w[0] - 0.2, 0, cz + w[1] - 0.2, cx + w[0] + 0.2, 0.4, cz + w[1] + 0.2, TL('black'), 1); }); }
    else if (p.k === 'cones') { [[-0.5, -0.4], [0.4, 0.3], [-0.2, 0.5]].forEach(function (q) { cylM(cx + q[0], cz + q[1], 0, 0.6, 0.12, TL('hazard'), 1, 6); }); B(-0.9, 0.9, -0.06, 0.06, 0.5, 0.65, TL('hazard'), 1); }
    else if (p.k === 'skip') { B(-0.85, 0.85, -1.05, 1.05, 0, 1.2, TL('plastic'), 0.6); B(-0.75, 0.75, -0.95, 0.95, 1.0, 1.3, TL('crate'), 0.7); }
    else if (p.k === 'digger') { B(-0.9, 0.9, -1.0, 1.0, 0.4, 1.6, TL('hazard'), 0.8); B(-0.6, 0.6, -0.6, 0.4, 1.6, 2.6, TL('windscreen'), 0.8); B(-1.0, 1.0, -1.1, 1.1, 0, 0.45, TL('black'), 1); B(0.9, 2.0, -0.12, 0.12, 1.6, 1.9, TL('hazard'), 0.7); B(1.8, 2.3, -0.4, 0.4, 0.2, 1.1, TL('metal'), 0.8); }
    else if (p.k === 'pallets') { for (var pl = 0; pl < 4; pl++) B(-0.6, 0.6, -0.55, 0.55, pl * 0.18, pl * 0.18 + 0.14, TL('plywood'), 0.85); }
    else if (p.k === 'cafetable') { cylM(cx, cz, 0, 0.75, 0.05, TL('metal'), 0.8, 6); cylM(cx, cz, 0.72, 0.78, 0.5, TL('metal'), 1, 10); cylM(cx, cz, 0.78, 2.3, 0.03, TL('metal'), 0.7, 5); var aw = [cx, 2.7, cz]; for (var at = 0; at < 6; at++) { var a0 = at / 6 * 6.28, a1 = (at + 1) / 6 * 6.28; m.tri([cx + Math.cos(a0) * 1.0, 2.2, cz + Math.sin(a0) * 1.0], [cx + Math.cos(a1) * 1.0, 2.2, cz + Math.sin(a1) * 1.0], aw, [0, 1, 1, 1, 0.5, 0], TL('awning'), vc(0.9)); } [[0.65, 0], [-0.65, 0]].forEach(function (q) { boxM(cx + q[0] * c - 0.2, 0.42, cz - q[0] * s - 0.2, cx + q[0] * c + 0.2, 0.48, cz - q[0] * s + 0.2, TL('metal'), 0.8); }); }
  });
  return mesh ? m : m.upload();
}
/* shop fronts (sprites from the shared sheet, with their names baked in) go in their own mesh on the sheet texture */
var SHTEX = null, FRONTMESH = null;
function sheetTex() { if (!SHTEX && KIT.sheetReady) SHTEX = R3.texture(KIT.sheet); return SHTEX; }
function buildFronts(F) {
  if (FRONTMESH) { FRONTMESH.free(); FRONTMESH = null; } if (!sheetTex()) return;
  var m = new R3.Mesh(), W = KIT.sheet.width, Hh = KIT.sheet.height, c = [0.5, 0.5, 0.5];
  function rectUV(s, u0, v0, u1, v1) { return [(s[0] + 0.5 + u0 * (s[2] - 1)) / W, (s[1] + 0.5 + v0 * (s[3] - 1)) / Hh, (u1 - u0) * (s[2] - 1) / W, (v1 - v0) * (s[3] - 1) / Hh]; }
  // a piece of the picture: across a = the left edge (as seen), b = the right edge, from height y0 to y1; u0..u1, v0..v1 is the part of the sprite
  function part(s, A, B, y0, y1, u0, u1, v0, v1, n) { m.quad([A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]], [0, 1, 1, 1, 1, 0, 0, 0], rectUV(s, u0, v0, u1, v1), c, n, 0.25); }
  (F.fronts || []).forEach(function (f) { var s = KIT.SPR[f.k]; if (!s) return; var q = DIRS[f.d], wdt = (f.big ? 7.2 : 5.4), ht = wdt * s[3] / s[2], off = TSZ / 2 - 0.04;
    var cx = (f.at !== undefined && q[1] ? f.at * TSZ : tx(f.i)) + q[0] * off, cz = (f.at !== undefined && q[0] ? f.at * TSZ : tx(f.j)) + q[1] * off, hw = wdt / 2, n = [-q[0], 0, -q[1]];
    var L, R; if (q[1] === -1) { L = [cx - hw, cz]; R = [cx + hw, cz]; } else if (q[1] === 1) { L = [cx + hw, cz]; R = [cx - hw, cz]; } else if (q[0] === 1) { L = [cx, cz - hw]; R = [cx, cz + hw]; } else { L = [cx, cz + hw]; R = [cx, cz - hw]; }
    var walk = FL && FL.K && inMap(f.i + q[0], f.j + q[1]) && FL.K[idx(f.i + q[0], f.j + q[1])] === KD && !f.noDoor;
    if (!walk) { part(s, L, R, 0, ht, 0, 1, 0, 1, n); return; }
    var dw = TSZ / wdt, u0 = 0.5 - dw / 2, u1 = 0.5 + dw / 2, dh = 2.25 / ht, lerp = function (t) { return [L[0] + (R[0] - L[0]) * t, L[1] + (R[1] - L[1]) * t]; };
    part(s, L, lerp(u0), 0, ht, 0, u0, 0, 1, n); part(s, lerp(u1), R, 0, ht, u1, 1, 0, 1, n); part(s, lerp(u0), lerp(u1), 2.25, ht, u0, u1, 0, 1 - dh, n); });
  (F.standees || []).forEach(function (o) { var s = KIT.SPR[o.k]; if (!s) return; var y0 = o.y || 0, h = o.h || 2, w = h * s[2] / s[3], dx = Math.cos(o.a) * w / 2, dz = -Math.sin(o.a) * w / 2, T = rectUV(s, 0, 0, 1, 1), Tm = rectUV(s, 1, 0, 0, 1);
    m.quad([o.x - dx, y0, o.z - dz], [o.x + dx, y0, o.z + dz], [o.x + dx, y0 + h, o.z + dz], [o.x - dx, y0 + h, o.z - dz], [0, 1, 1, 1, 1, 0, 0, 0], T, c, [Math.sin(o.a), 0, Math.cos(o.a)], 0.2);
    m.quad([o.x + dx, y0, o.z + dz], [o.x - dx, y0, o.z - dz], [o.x - dx, y0 + h, o.z - dz], [o.x + dx, y0 + h, o.z + dz], [0, 1, 1, 1, 1, 0, 0, 0], Tm, c, [-Math.sin(o.a), 0, -Math.cos(o.a)], 0.2); });
  if (m.n) FRONTMESH = m.upload();
}
