/* =====================================================================================================
   THE BASEMENT: every floor is a maze laid fresh for each new game (seeded, so a save always comes back to the same
   walls). Long hallways (the maze keeps going straight when it can), loops so you can run round and lose TB, rooms
   with doors that shut behind you, a cell (where TB locks you up), lockers to hide in, the stairs up behind a locked
   gate and the key for it as far away as the maze allows.
   ===================================================================================================== */
var KW = 0, KC = 1, KR = 2, KD = 3, KP = 4, KL = 5, KS = 6, KB = 7, KA = 8; // wall, corridor, room, door, prop, locker, stairs up, cell bars, stairs down
var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function idx(i, j) { return j * MW + i; }
function inMap(i, j) { return i >= 0 && j >= 0 && i < MW && j < MH; }
function tx(i) { return (i + 0.5) * TSZ; } function tileOf(x) { return Math.floor(x / TSZ); }
function genFloor(fi, seed) {
  var rnd = srand(seed), K = new Uint8Array(MW * MH), RM = new Int16Array(MW * MH).fill(-1), th = FLOORS[fi];
  function ri(n) { return Math.floor(rnd() * n); }
  function open(k) { return k === KC || k === KR || k === KD || k === KB; }
  /* 1. the maze: growing tree, carrying on straight 70% of the time so the halls run long */
  var CW = (MW - 1) / 2, CH = (MH - 1) / 2, vis = new Uint8Array(CW * CH), stack = [], c0 = [ri(CW), ri(CH)];
  vis[c0[1] * CW + c0[0]] = 1; K[idx(c0[0] * 2 + 1, c0[1] * 2 + 1)] = KC; stack.push({ x: c0[0], y: c0[1], d: -1 });
  while (stack.length) {
    var ci = rnd() < 0.8 ? stack.length - 1 : ri(stack.length), c = stack[ci], ds = [];
    for (var d = 0; d < 4; d++) { var nx = c.x + DIRS[d][0], ny = c.y + DIRS[d][1]; if (nx >= 0 && ny >= 0 && nx < CW && ny < CH && !vis[ny * CW + nx]) ds.push(d); }
    if (!ds.length) { stack.splice(ci, 1); continue; }
    var dd = ds.indexOf(c.d) >= 0 && rnd() < 0.7 ? c.d : ds[ri(ds.length)], nx2 = c.x + DIRS[dd][0], ny2 = c.y + DIRS[dd][1];
    vis[ny2 * CW + nx2] = 1; K[idx(c.x * 2 + 1 + DIRS[dd][0], c.y * 2 + 1 + DIRS[dd][1])] = KC; K[idx(nx2 * 2 + 1, ny2 * 2 + 1)] = KC; stack.push({ x: nx2, y: ny2, d: dd });
  }
  /* 2. loops: most dead ends get knocked through, so there is always another way round */
  for (var cy = 0; cy < CH; cy++) for (var cx = 0; cx < CW; cx++) {
    var ti = cx * 2 + 1, tj = cy * 2 + 1, n = 0; DIRS.forEach(function (q) { if (open(K[idx(ti + q[0], tj + q[1])])) n++; });
    if (n === 1 && rnd() < 0.3) { var opts = []; DIRS.forEach(function (q) { var wi = ti + q[0], wj = tj + q[1]; if (wi > 0 && wj > 0 && wi < MW - 1 && wj < MH - 1 && K[idx(wi, wj)] === KW) opts.push([wi, wj]); }); if (opts.length) { var o = opts[ri(opts.length)]; K[idx(o[0], o[1])] = KC; } }
  }
  /* 3. rooms (the first is the cell): walls all round with a door or two where a hall meets them */
  var rooms = [], want = 13 + fi;
  for (var tries = 0; tries < 2500 && rooms.length < want; tries++) {
    var cell = rooms.length === 0, rw = cell ? 3 : [3, 5, 5, 7, 7][ri(5)], rh = cell ? 3 : [3, 5, 5, 5, 7][ri(5)], rx = 1 + 2 * ri((MW - rw - 2) / 2 + 1), ry = 1 + 2 * ri((MH - rh - 2) / 2 + 1);
    if (rx + rw > MW - 2 || ry + rh > MH - 2) continue;
    if (rooms.some(function (r) { return rx - 2 < r.x + r.w + 1 && rx + rw + 2 > r.x - 1 && ry - 2 < r.y + r.h + 1 && ry + rh + 2 > r.y - 1; })) continue;
    var R = { id: rooms.length, x: rx, y: ry, w: rw, h: rh, cell: cell, doors: [] };
    for (var j = ry - 1; j <= ry + rh; j++) for (var i = rx - 1; i <= rx + rw; i++) { var inner = i >= rx && i < rx + rw && j >= ry && j < ry + rh; K[idx(i, j)] = inner ? KR : KW; RM[idx(i, j)] = inner ? R.id : -1; }
    var cand = [];
    for (var i2 = rx; i2 < rx + rw; i2++) { cand.push([i2, ry - 1, 0, -1]); cand.push([i2, ry + rh, 0, 1]); }
    for (var j2 = ry; j2 < ry + rh; j2++) { cand.push([rx - 1, j2, -1, 0]); cand.push([rx + rw, j2, 1, 0]); }
    cand = cand.filter(function (q) { var oi = q[0] + q[2], oj = q[1] + q[3]; return inMap(oi, oj) && K[idx(oi, oj)] === KC; });
    for (var s = cand.length - 1; s > 0; s--) { var t = ri(s + 1), tmp = cand[s]; cand[s] = cand[t]; cand[t] = tmp; }
    var nd = cell ? 1 : 1 + (rnd() < 0.6 ? 1 : 0) + (rnd() < 0.25 ? 1 : 0), sides = {};
    for (var q2 = 0; q2 < cand.length && R.doors.length < nd; q2++) { var cq = cand[q2], sk = cq[2] + ',' + cq[3]; if (sides[sk] && cand.length > 2) continue; sides[sk] = 1; K[idx(cq[0], cq[1])] = cell ? KB : KD; R.doors.push({ i: cq[0], j: cq[1], di: cq[2], dj: cq[3] }); }
    rooms.push(R);
  }
  /* 4. join anything cut off: dig the shortest way through the walls to the rest */
  function walk(k) { return k === KC || k === KR || k === KD || k === KB; }
  function flood(si, sj) { var seen = new Uint8Array(MW * MH), q = [idx(si, sj)]; seen[q[0]] = 1; for (var h = 0; h < q.length; h++) { var p = q[h], pi = p % MW, pj = (p / MW) | 0; for (var d = 0; d < 4; d++) { var ni = pi + DIRS[d][0], nj = pj + DIRS[d][1]; if (!inMap(ni, nj)) continue; var nk = idx(ni, nj); if (!seen[nk] && walk(K[nk])) { seen[nk] = 1; q.push(nk); } } } return seen; }
  function joinAll(root) {
  for (var guard = 0; guard < 60; guard++) {
    var seen = flood(root[0], root[1]), lost = -1;
    for (var p = 0; p < MW * MH; p++) if (walk(K[p]) && !seen[p]) { lost = p; break; }
    if (lost < 0) break;
    // BFS from the lost tile through walls (never through other rooms' walls' corners) to a reached tile
    var prev = new Int32Array(MW * MH).fill(-2), qq = [lost]; prev[lost] = -1; var hit = -1;
    for (var h = 0; h < qq.length && hit < 0; h++) { var pp = qq[h], pi2 = pp % MW, pj2 = (pp / MW) | 0;
      for (var d2 = 0; d2 < 4; d2++) { var ni = pi2 + DIRS[d2][0], nj = pj2 + DIRS[d2][1]; if (ni < 1 || nj < 1 || ni > MW - 2 || nj > MH - 2) continue; var c0r = rooms[0]; if (c0r && c0r.cell && ni >= c0r.x - 1 && ni <= c0r.x + c0r.w && nj >= c0r.y - 1 && nj <= c0r.y + c0r.h) continue; /* never dig into the cell */ var nk = idx(ni, nj); if (prev[nk] !== -2) continue;
        if (seen[nk]) { prev[nk] = pp; hit = nk; break; } if (K[nk] === KW || walk(K[nk])) { prev[nk] = pp; qq.push(nk); } } }
    if (hit < 0) break;
    for (var b = prev[hit]; b >= 0 && b !== lost; b = prev[b]) if (K[b] === KW) { var bi = b % MW, bj = (b / MW) | 0, onRoom = rooms.some(function (r) { return bi >= r.x - 1 && bi <= r.x + r.w && bj >= r.y - 1 && bj <= r.y + r.h; }); K[b] = onRoom ? KD : KC; if (onRoom) rooms.forEach(function (r) { if (bi >= r.x - 1 && bi <= r.x + r.w && bj >= r.y - 1 && bj <= r.y + r.h) r.doors.push({ i: bi, j: bj, di: bi < r.x ? -1 : bi >= r.x + r.w ? 1 : 0, dj: bj < r.y ? -1 : bj >= r.y + r.h ? 1 : 0 }); }); }
  }
  }
  joinAll(rooms[0] ? [rooms[0].x + 1, rooms[0].y + 1] : [1, 1]);
  /* 4b. fewer halls: dead ends get filled back in, again and again, so what is left is rooms joined by short halls
     (he said the basement was way too mazy) */
  for (var pass = 0; pass < 40; pass++) {
    var ends = []; for (var j9 = 1; j9 < MH - 1; j9++) for (var i9 = 1; i9 < MW - 1; i9++) { if (K[idx(i9, j9)] !== KC) continue; var nw = 0, byDoor = 0; DIRS.forEach(function (q) { var kq = K[idx(i9 + q[0], j9 + q[1])]; if (walk(kq)) nw++; if (kq === KD || kq === KB) byDoor = 1; }); if (nw <= 1 && !byDoor) ends.push(idx(i9, j9)); }
    if (ends.length <= 6) break;
    for (var s9 = ends.length - 1; s9 > 0; s9--) { var t9 = ri(s9 + 1), q9 = ends[s9]; ends[s9] = ends[t9]; ends[t9] = q9; }
    ends.slice(0, Math.max(1, Math.floor((ends.length - 6) * 0.8))).forEach(function (e) { K[e] = KW; });
  }
  if (rooms[0]) { var cd0 = rooms[0].doors[0]; joinAll([cd0.i + cd0.di, cd0.j + cd0.dj]); } // the hall outside the cell door always leads somewhere
  /* distances over walkable tiles */
  function dist(si, sj) { var D = new Int32Array(MW * MH).fill(-1), q = [idx(si, sj)]; D[q[0]] = 0; for (var h = 0; h < q.length; h++) { var p = q[h], pi = p % MW, pj = (p / MW) | 0; for (var d = 0; d < 4; d++) { var ni = pi + DIRS[d][0], nj = pj + DIRS[d][1]; if (!inMap(ni, nj)) continue; var nk = idx(ni, nj); if (D[nk] < 0 && walk(K[nk])) { D[nk] = D[p] + 1; q.push(nk); } } } return D; }
  var cellR = rooms[0], F = { fi: fi, K: K, RM: RM, rooms: rooms, cell: cellR, lockers: [], props: [], loot: [], foes: [], lights: [], decals: [], pipes: [], notes: [] };
  F.cellIn = { i: cellR.x + 1, j: cellR.y + 1 }; F.cellDoor = cellR.doors[0];
  /* dead ends: the stairs, the way you came, lockers */
  function deadEnds() { var out = []; for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { if (K[idx(i, j)] !== KC) continue; var n = 0, od = null; DIRS.forEach(function (q) { if (walk(K[idx(i + q[0], j + q[1])])) { n++; od = q; } }); if (n === 1 && K[idx(i + od[0], j + od[1])] !== KD && K[idx(i + od[0], j + od[1])] !== KB) out.push({ i: i, j: j, di: od[0], dj: od[1] }); } return out; } // never one that only opens onto a door (a locker or the stairs would block it)
  var dCell = dist(F.cellIn.i, F.cellIn.j), de = deadEnds();
  if (de.length < 3) { // a maze with no dead ends left: make some by walling off hall ends next to the outer wall
    for (var j3 = 1; j3 < MH - 1 && de.length < 6; j3 += 2) { var i3 = 1; if (K[idx(i3, j3)] === KC && K[idx(i3 + 1, j3)] === KC) { de.push({ i: i3, j: j3, di: 1, dj: 0 }); } }
  }
  de.sort(function (a, b) { return dCell[idx(b.i, b.j)] - dCell[idx(a.i, a.j)]; });
  var ex = de[0]; F.exit = { i: ex.i, j: ex.j, di: ex.di, dj: ex.dj }; K[idx(ex.i, ex.j)] = KS; // the stairs up, at the far end of the maze
  F.exitIn = { i: ex.i + ex.di, j: ex.j + ex.dj };
  var used = {}; used[idx(ex.i, ex.j)] = 1;
  if (fi > 0) { // the stairs you came up by: a mid-distance dead end (they lock behind you)
    var mids = de.slice(1).filter(function (q) { var dd = dCell[idx(q.i, q.j)]; return dd > 6; }); var ar = mids[Math.floor(mids.length * 0.55)] || de[1] || de[0];
    F.arrive = { i: ar.i, j: ar.j, di: ar.di, dj: ar.dj }; K[idx(ar.i, ar.j)] = KA; used[idx(ar.i, ar.j)] = 1; F.start = { i: ar.i + ar.di, j: ar.j + ar.dj, a: Math.atan2(ar.di, ar.dj) };
  } else F.start = { i: F.cellIn.i, j: F.cellIn.j, a: Math.atan2(F.cellDoor.di, F.cellDoor.dj) };
  var dS = dist(F.start.i, F.start.j), dE = dist(F.exitIn.i, F.exitIn.j);
  /* the key: the room tile furthest from both the start and the stairs */
  var best = -1, bk = null; rooms.forEach(function (r) { if (r.cell) return; for (var j = r.y; j < r.y + r.h; j++) for (var i = r.x; i < r.x + r.w; i++) { var s = Math.min(dS[idx(i, j)], dE[idx(i, j)]) + rnd() * 3; if (dS[idx(i, j)] >= 0 && s > best) { best = s; bk = { i: i, j: j }; } } });
  F.key = bk || { i: F.exitIn.i, j: F.exitIn.j }; used[idx(F.key.i, F.key.j)] = 1; F.keyRoom = RM[idx(F.key.i, F.key.j)];
  /* lockers: in dead ends that are left, and against room walls */
  de.slice(1).forEach(function (q) { if (used[idx(q.i, q.j)] || F.lockers.length >= 8) return; if (Math.abs(q.i - F.start.i) + Math.abs(q.j - F.start.j) < 3) return; K[idx(q.i, q.j)] = KL; used[idx(q.i, q.j)] = 1; F.lockers.push({ i: q.i, j: q.j, di: q.di, dj: q.dj }); });
  function nearDoor(i, j) { return rooms.some(function (r) { return r.doors.some(function (d) { return Math.abs(d.i - i) + Math.abs(d.j - j) <= 1; }); }); }
  function stillJoined() { var s = flood(F.start.i, F.start.j); return s[idx(F.exitIn.i, F.exitIn.j)] && s[idx(F.key.i, F.key.j)] && s[idx(F.cellIn.i, F.cellIn.j)]; }
  /* props in rooms (against the walls), keeping every way through */
  rooms.forEach(function (r) {
    if (r.cell) { var dd = r.doors[0], bi = dd.i - dd.di <= r.x ? r.x + 2 : r.x, bj = dd.j - dd.dj <= r.y ? r.y + 2 : r.y; if (dd.di) bj = dd.j === r.y ? r.y + 2 : r.y; if (dd.dj) bi = dd.i === r.x ? r.x + 2 : r.x;
      F.props.push({ i: bi, j: bj, k: 'bed', a: bi === r.x ? Math.PI / 2 : -Math.PI / 2 }); K[idx(bi, bj)] = KP; return; }
    var spots = []; for (var j = r.y; j < r.y + r.h; j++) for (var i = r.x; i < r.x + r.w; i++) { var edge = i === r.x || j === r.y || i === r.x + r.w - 1 || j === r.y + r.h - 1; if (edge && !nearDoor(i, j) && !used[idx(i, j)]) spots.push([i, j]); }
    var n = 2 + ri(Math.min(7, Math.floor(r.w * r.h / 3))), lk = 0;
    for (var k = 0; k < n && spots.length; k++) { var si = ri(spots.length), sp = spots.splice(si, 1)[0], kind = th.props[ri(th.props.length)];
      if (kind === 'locker' && lk) kind = 'crate'; var was = K[idx(sp[0], sp[1])]; K[idx(sp[0], sp[1])] = kind === 'locker' ? KL : KP; if (!stillJoined()) { K[idx(sp[0], sp[1])] = was; continue; }
      used[idx(sp[0], sp[1])] = 1; var a = sp[0] === r.x ? Math.PI / 2 : sp[0] === r.x + r.w - 1 ? -Math.PI / 2 : sp[1] === r.y ? 0 : Math.PI;
      if (kind === 'locker') { lk = 1; F.lockers.push({ i: sp[0], j: sp[1], di: Math.round(Math.sin(a)), dj: Math.round(Math.cos(a)) }); } else F.props.push({ i: sp[0], j: sp[1], k: kind, a: a }); }
  });
  joinAll([F.start.i, F.start.j]); // anything the lockers or props cut off gets dug back in
  /* free tiles for things */
  function freeTiles(pred) { var o = []; for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { var k = K[idx(i, j)]; if ((k === KC || k === KR) && !used[idx(i, j)] && pred(i, j, k)) o.push({ i: i, j: j }); } return o; }
  function take(list) { if (!list.length) return null; var p = list.splice(ri(list.length), 1)[0]; used[idx(p.i, p.j)] = 1; return p; }
  var lootSpots = freeTiles(function (i, j, k) { return dS[idx(i, j)] > 2 && (k === KR || rnd() < 0.25); });
  F.loot.push({ i: F.key.i, j: F.key.j, k: 'key' });
  th.loot.forEach(function (l, n) { var near = fi === 0 && n < 2, p = near ? take(freeTiles(function (i, j) { return dS[idx(i, j)] > 3 && dS[idx(i, j)] < 18; })) : take(lootSpots); if (p) F.loot.push({ i: p.i, j: p.j, k: l }); });
  for (var nn = 0; nn < NOTESPER; nn++) { var np = take(lootSpots); if (np) F.notes.push({ i: np.i, j: np.j, n: noteFor(fi, nn) }); }
  /* TB's boys, away from where you start */
  var foeSpots = freeTiles(function (i, j) { return dS[idx(i, j)] > 9; });
  th.foes.forEach(function (f) { var p = take(foeSpots); if (p) F.foes.push({ i: p.i, j: p.j, k: f }); });
  var tbs = freeTiles(function (i, j) { return dS[idx(i, j)] > 16; }); F.tb = tbs.length ? tbs[ri(tbs.length)] : { i: F.exitIn.i, j: F.exitIn.j };
  /* lamps: one in every room, and down the halls now and then; some flicker, some are dead */
  rooms.forEach(function (r) { F.lights.push({ i: r.x + (r.w - 1) / 2, j: r.y + (r.h - 1) / 2, k: r.cell ? 0.9 : 1.15, r: 6 + Math.max(r.w, r.h) * 0.9, fl: rnd() < 0.3 ? 1 : 0, room: 1 }); });
  for (var j4 = 1; j4 < MH - 1; j4++) for (var i4 = 1; i4 < MW - 1; i4++) if (K[idx(i4, j4)] === KC && (i4 + j4 * 3) % 7 === 0 && rnd() < 0.45) F.lights.push({ i: i4, j: j4, k: 0.85, r: 6.5, fl: rnd() < 0.35 ? 1 : 0, dead: rnd() < 0.12 });
  F.lights.push({ i: F.exitIn.i + F.exit.di * 0.6, j: F.exitIn.j + F.exit.dj * 0.6, k: 1.1, r: 5, fl: 0, exit: 1, c: [1, 0.12, 0.1] });
  /* decals on the walls and floor, and pipes along the halls */
  for (var j5 = 1; j5 < MH - 1; j5++) for (var i5 = 1; i5 < MW - 1; i5++) { var k5 = K[idx(i5, j5)]; if (k5 !== KC && k5 !== KR) continue;
    DIRS.forEach(function (q, d) { if (K[idx(i5 + q[0], j5 + q[1])] === KW && rnd() < 0.17) F.decals.push({ i: i5, j: j5, d: d, k: th.deco[ri(th.deco.length)], y: 0.7 + rnd() * 1.1, s: 0.7 + rnd() * 0.6, o: rnd() * 0.6 - 0.3 }); });
    if (rnd() < 0.08) F.decals.push({ i: i5, j: j5, d: -1, k: rnd() < 0.5 ? 'blood1' : 'blood2', s: 0.8 + rnd() * 0.9, o: rnd() * 6.28 });
    if (k5 === KC) { var ns = K[idx(i5, j5 - 1)] === KW && K[idx(i5, j5 + 1)] === KW, ew = K[idx(i5 - 1, j5)] === KW && K[idx(i5 + 1, j5)] === KW; if ((ns || ew) && ((ns ? i5 : j5) * 7 + (ns ? j5 : i5)) % 9 < 4) F.pipes.push({ i: i5, j: j5, ax: ns ? 'x' : 'z', side: ((i5 * 3 + j5) % 2) ? 1 : -1 }); }
  }
  /* clutter: small junk lying about that you walk through (bottles, buckets, bones, pill pots, rags, candles, chains...) */
  F.clutter = []; var CL = th.clutter || ['bottles', 'bucket', 'rags', 'bones', 'candles', 'pillpot', 'chains', 'paper', 'tv', 'mattress'];
  for (var j6 = 1; j6 < MH - 1; j6++) for (var i6 = 1; i6 < MW - 1; i6++) { var k6 = K[idx(i6, j6)]; if (k6 !== KC && k6 !== KR) continue; var wd = DIRS.findIndex(function (q) { return K[idx(i6 + q[0], j6 + q[1])] === KW; });
    if (rnd() < (k6 === KR ? 0.42 : 0.2)) { var ck = CL[ri(CL.length)]; if (ck === 'mattress' && (k6 !== KR || wd < 0)) ck = 'rags'; F.clutter.push({ i: i6, j: j6, k: ck, d: wd, o: rnd() * 6.28, s: rnd() }); } }
  F.dist = dist; F.walkK = walk;
  return F;
}
/* ---------- the floor's looks: one big mesh of floors, walls (a darker band at the bottom), ceilings, door heads,
   props, lockers, lamps, pipes, stairs and the blood and graffiti ---------- */
function buildIndoorMesh(F, mesh) { // the basement, and (with F.indoorOnly) the insides of Clubhouse Row's shops
  var m = mesh || new R3.Mesh(), th0 = FLOORS[F.fi], th = th0, K = F.K, rnd = srand(F.fi * 991 + 3), only = F.indoorOnly;
  function kk(i, j) { return inMap(i, j) ? K[idx(i, j)] : KW; }
  function solid(k) { return k === KW; }
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  var UV = [0, 1, 1, 1, 1, 0, 0, 0];
  function wallFace(x0, z0, x1, z1, y0, y1, T, n, cb, ct, uw) { var u = uw || 1, vv = (y1 - y0) / TSZ; m.quad([x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], [0, vv, u, vv, u, 0, 0, 0], T, [vc(cb), vc(cb), vc(ct), vc(ct)], n); }
  function boxM(x0, y0, z0, x1, y1, z1, T, k, sides) { // an axis box, every face lit by its normal
    var c = vc(k || 1), cd = vc((k || 1) * 0.75), w = (x1 - x0) / TSZ * 2, h = (y1 - y0) / TSZ * 2, d = (z1 - z0) / TSZ * 2, uvw = [0, h, w, h, w, 0, 0, 0], uvd = [0, h, d, h, d, 0, 0, 0];
    m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, w, 0, w, d, 0, d], T, c, [0, 1, 0]);
    m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], uvw, T, cd, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], uvw, T, cd, [0, 0, -1]);
    m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], uvd, T, cd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], uvd, T, cd, [-1, 0, 0]);
  }
  function cylM(cx, cz, y0, y1, r, T, k, seg) { seg = seg || 8; var c = vc(k || 1); for (var s = 0; s < seg; s++) { var a0 = s / seg * 6.283, a1 = (s + 1) / seg * 6.283, p0 = [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
    m.quadN([[p0[0], y0, p0[1]], [p1[0], y0, p1[1]], [p1[0], y1, p1[1]], [p0[0], y1, p0[1]]], [s / seg * 2, 1, (s + 1) / seg * 2, 1, (s + 1) / seg * 2, 0, s / seg * 2, 0], T, c, [[Math.cos(a0), 0, Math.sin(a0)], [Math.cos(a1), 0, Math.sin(a1)], [Math.cos(a1), 0, Math.sin(a1)], [Math.cos(a0), 0, Math.sin(a0)]]);
    m.tri([cx, y1, cz], [p1[0], y1, p1[1]], [p0[0], y1, p0[1]], [0.5, 0.5, 1, 0, 0, 0], T, c, [0, 1, 0]); } }
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
    var k = kk(i, j); if (solid(k)) continue; var rmi = F.RM[idx(i, j)];
    if (only) { if (rmi < 0 && k !== KD) continue; var rr = rmi >= 0 ? F.rooms[rmi] : F.rooms[F.doorRoom[idx(i, j)]]; th = rr && rr.th || th0; }
    var x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ, room = F.RM[idx(i, j)] >= 0 || k === KD && false, v = 0.92 + rnd() * 0.16;
    var isRoom = F.RM[idx(i, j)] >= 0, fl = TL(isRoom ? th.roomf : th.floor), wt = TL(isRoom ? th.room : th.wall), wb = TL(th.wall2), cl = TL(th.ceil);
    var low = k === KD || k === KB ? 2.25 : CEIL;
    if (k !== KA) m.quad([x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], fl, vc(v * 0.9), [0, 1, 0]);
    m.quad([x0, low, z0], [x1, low, z0], [x1, low, z1], [x0, low, z1], UV, cl, vc(v * 0.8), [0, -1, 0]);
    if (low < CEIL) { // a door head: the wall comes down to the top of the door frame
      for (var d = 0; d < 4; d++) { var q = DIRS[d], nk = kk(i + q[0], j + q[1]); if (solid(nk)) continue; var hx0, hz0, hx1, hz1, n;
        if (d === 0) { hx0 = x1; hz0 = z1; hx1 = x1; hz1 = z0; n = [1, 0, 0]; } else if (d === 1) { hx0 = x0; hz0 = z0; hx1 = x0; hz1 = z1; n = [-1, 0, 0]; } else if (d === 2) { hx0 = x0; hz0 = z1; hx1 = x1; hz1 = z1; n = [0, 0, 1]; } else { hx0 = x1; hz0 = z0; hx1 = x0; hz1 = z0; n = [0, 0, -1]; }
        wallFace(hx0, hz0, hx1, hz1, low, CEIL, TL(th.wall2), n, 0.8, 0.7); }
    }
    for (var d2 = 0; d2 < 4; d2++) {
      var q2 = DIRS[d2], nk2 = kk(i + q2[0], j + q2[1]); if (!solid(nk2)) continue;
      var a, b, nn; // face of the wall on that side, looking into this tile
      if (d2 === 0) { a = [x1, z0]; b = [x1, z1]; nn = [-1, 0, 0]; } else if (d2 === 1) { a = [x0, z1]; b = [x0, z0]; nn = [1, 0, 0]; } else if (d2 === 2) { a = [x1, z1]; b = [x0, z1]; nn = [0, 0, -1]; } else { a = [x0, z0]; b = [x1, z0]; nn = [0, 0, 1]; }
      var wv = 0.9 + rnd() * 0.18;
      wallFace(a[0], a[1], b[0], b[1], k === KA ? -2.6 : 0, 0.95, wb, nn, 0.62 * wv, 0.8 * wv);
      wallFace(a[0], a[1], b[0], b[1], 0.95, low, wt, nn, 0.86 * wv, 0.72 * wv);
      var ex0 = Math.min(a[0], b[0], a[0] + nn[0] * 0.05), ex1 = Math.max(a[0], b[0], a[0] + nn[0] * 0.05), ez0 = Math.min(a[1], b[1], a[1] + nn[2] * 0.05), ez1 = Math.max(a[1], b[1], a[1] + nn[2] * 0.05); boxM(ex0, 0.93, ez0, ex1, 1.0, ez1, TL('wood'), 0.7); // a dado rail
    }
  }
  /* props (all stand on their tile, turned to face into the room) */
  F.props.forEach(function (p) {
    if (only && !p.indoor) return;
    var cx = tx(p.i), cz = tx(p.j), s = Math.sin(p.a), c = Math.cos(p.a), w = TSZ / 2 - 0.2;
    function B(f0, f1, s0, s1, y0, y1, T, kk) { var pts = [[s0, f0], [s1, f0], [s1, f1], [s0, f1]].map(function (q) { return [cx + q[0] * c + q[1] * s, cz - q[0] * s + q[1] * c]; }); var xs = pts.map(function (q) { return q[0]; }), zs = pts.map(function (q) { return q[1]; }); boxM(Math.min.apply(0, xs), y0, Math.min.apply(0, zs), Math.max.apply(0, xs), y1, Math.max.apply(0, zs), T, kk); }
    if (p.k === 'bed') { B(-0.5, 0.9, -0.55, 0.55, 0, 0.5, TL('steel'), 0.6); B(-0.45, 0.85, -0.5, 0.5, 0.5, 0.65, TL('bed'), 1); B(-0.5, -0.4, -0.55, 0.55, 0.5, 1.05, TL('steel'), 0.6); }
    else if (p.k === 'crate') { B(-0.55, 0.55, -0.55, 0.55, 0, 1.1, TL('crate'), 1); if ((p.i + p.j) % 2) B(-0.35, 0.35, -0.35, 0.35, 1.1, 1.8, TL('crate'), 0.9); }
    else if (p.k === 'barrel') { cylM(cx - 0.3, cz, 0, 1.0, 0.38, TL('rust'), 0.9); cylM(cx + 0.4, cz + 0.3, 0, 1.0, 0.36, TL('rust'), 0.8); }
    else if (p.k === 'keg') { cylM(cx - 0.35, cz - 0.3, 0, 0.9, 0.36, TL('keg'), 1); cylM(cx + 0.38, cz - 0.3, 0, 0.9, 0.36, TL('keg'), 1); cylM(cx, cz + 0.35, 0, 0.9, 0.36, TL('keg'), 0.9); cylM(cx, cz - 0.3, 0.9, 1.8, 0.36, TL('keg'), 1.05); }
    else if (p.k === 'table') { B(-0.7, 0.7, -0.55, 0.55, 0.78, 0.88, TL('steel'), 1); [[-0.6, -0.45], [0.6, -0.45], [-0.6, 0.45], [0.6, 0.45]].forEach(function (q) { B(q[1] - 0.04, q[1] + 0.04, q[0] - 0.04, q[0] + 0.04, 0, 0.78, TL('steel'), 0.6); }); B(-0.3, 0.1, -0.2, 0.3, 0.88, 0.95, TL('blood1'), 1); }
    else if (p.k === 'chair') { B(-0.25, 0.25, -0.25, 0.25, 0.42, 0.5, TL('wood'), 1); B(-0.27, -0.2, -0.25, 0.25, 0.5, 1.1, TL('wood'), 0.9); [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(function (q) { B(q[1] - 0.03, q[1] + 0.03, q[0] - 0.03, q[0] + 0.03, 0, 0.42, TL('wood'), 0.6); }); B(0.4, 0.95, -0.5, 0.5, 0, 0.75, TL('crate'), 0.9); }
    else if (p.k === 'shelf') { B(-0.5, -0.1, -w, w, 0, 2.3, TL('shelf'), 1.25); }
    else if (p.k === 'counter') { B(-0.45, 0.45, -w - 0.18, w + 0.18, 0, 1.0, TL('wood'), 0.8); B(-0.5, 0.5, -w - 0.2, w + 0.2, 1.0, 1.08, TL('steel'), 1); B(-0.15, 0.15, -0.2, 0.2, 1.08, 1.4, TL('black'), 0.9); }
    else if (p.k === 'pot') { cylM(cx, cz, 0, 0.9, 0.4, TL('steel'), 0.9); cylM(cx, cz, 0.9, 0.95, 0.42, TL('meat'), 0.8); }
    else if (p.k === 'rack') { B(-0.04, 0.04, -w, w, 1.6, 1.66, TL('steel'), 0.8); B(-0.04, 0.04, -w, -w + 0.06, 0, 1.66, TL('steel'), 0.7); B(-0.04, 0.04, w - 0.06, w, 0, 1.66, TL('steel'), 0.7); for (var r = -2; r <= 2; r++) B(-0.18, 0.18, r * 0.18 - 0.07, r * 0.18 + 0.07, 0.75, 1.6, TL(r % 2 ? 'leather' : 'velvet'), 0.9); }
    else if (p.k === 'oven') { B(-0.5, 0.45, -0.55, 0.55, 0, 1.2, TL('steel'), 0.8); B(0.45, 0.47, -0.4, 0.4, 0.3, 0.9, TL('black'), 1); }
    else if (p.k === 'speaker') { B(-0.4, 0.4, -0.4, 0.4, 0, 1.9, TL('black'), 1); cylM(cx + s * 0.41, cz + c * 0.41, 0.5, 0.52, 0.25, TL('steel'), 0.6, 8); }
    else if (p.k === 'cabinet') { B(-0.4, 0.35, -0.4, 0.4, 0, 1.8, TL('black'), 1); B(0.35, 0.38, -0.3, 0.3, 1.0, 1.5, TL('neon'), 1.2); B(0.2, 0.5, -0.4, 0.4, 0.8, 0.9, TL('steel'), 0.8); }
    else if (p.k === 'coffin') { B(-0.4, 0.4, -0.95, 0.95, 0, 0.55, TL('wood'), 0.5); B(-0.42, 0.42, -0.97, 0.97, 0.55, 0.62, TL('wood'), 0.65); B(-0.04, 0.04, -0.3, 0.3, 0.62, 0.66, TL('marble'), 0.9); }
    else if (p.k === 'candles') { for (var cn = 0; cn < 5; cn++) cylM(cx + Math.cos(cn * 1.3) * 0.35, cz + Math.sin(cn * 1.3) * 0.35, 0, 0.2 + cn * 0.12, 0.04, TL('candle'), 1, 5); }
    else if (p.k === 'cage') { B(-0.6, 0.6, -0.6, 0.6, 0, 0.04, TL('steel'), 0.6); B(-0.6, 0.6, -0.6, 0.6, 1.4, 1.45, TL('steel'), 0.6); [[-0.58, -0.58], [0.58, -0.58], [-0.58, 0.58], [0.58, 0.58], [0, -0.58], [0, 0.58], [-0.58, 0], [0.58, 0]].forEach(function (q) { B(q[1] - 0.02, q[1] + 0.02, q[0] - 0.02, q[0] + 0.02, 0, 1.4, TL('steel'), 0.7); }); B(-0.3, 0.2, -0.25, 0.3, 0.04, 0.24, TL('bone'), 0.8); }
    else if (p.k === 'freezer') { B(-0.5, 0.45, -0.75, 0.75, 0, 1.0, TL('tilew'), 1.1); B(-0.52, 0.47, -0.77, 0.77, 1.0, 1.08, TL('steel'), 0.9); B(0.45, 0.48, -0.5, 0.5, 0.5, 0.6, TL('black'), 1); }
    else if (p.k === 'vat') { cylM(cx, cz, 0, 1.2, 0.62, TL('steel'), 0.85, 10); cylM(cx, cz, 1.2, 1.22, 0.56, TL('pinkgoo'), 1.2, 10); B(-0.05, 0.05, -0.65, 0.65, 1.2, 1.9, TL('pipe'), 0.8); }
    else if (p.k === 'sofa') { B(-0.45, 0.45, -1.0, 1.0, 0, 0.45, TL('velvet'), 0.9); B(-0.5, -0.25, -1.0, 1.0, 0.45, 1.0, TL('velvet'), 0.8); B(-0.45, 0.4, -1.05, -0.85, 0.45, 0.7, TL('velvet'), 0.75); B(-0.45, 0.4, 0.85, 1.05, 0.45, 0.7, TL('velvet'), 0.75); }
    else if (p.k === 'jukebox') { B(-0.45, 0.3, -0.5, 0.5, 0, 1.5, TL('wood'), 1); B(0.3, 0.33, -0.4, 0.4, 0.7, 1.35, TL('neon'), 1.3); cylM(cx + s * 0.31, cz + c * 0.31, 1.5, 1.6, 0.5, TL('wood'), 1, 8); }
    else if (p.k === 'hook') { B(-0.1, 0.1, -w, w, 2.6, 2.7, TL('steel'), 0.7); for (var h = -1; h <= 1; h += 2) { var hx = cx + h * 0.5 * c, hz = cz - h * 0.5 * s; boxM(hx - 0.02, 1.9, hz - 0.02, hx + 0.02, 2.6, hz + 0.02, TL('steel'), 0.8); boxM(hx - 0.28, 0.75, hz - 0.22, hx + 0.28, 1.95, hz + 0.22, TL('meat'), 1.05); } }
  });
  /* the junk on the floor (no collisions: you walk through it) */
  (F.clutter || []).forEach(function (c) {
    if (only && !c.indoor) return;
    var cx = tx(c.i), cz = tx(c.j), q = c.d >= 0 ? DIRS[c.d] : null, off = TSZ / 2 - 0.32;
    if (q) { cx += q[0] * off + (q[1] ? (c.s - 0.5) * 1.2 : 0); cz += q[1] * off + (q[0] ? (c.s - 0.5) * 1.2 : 0); } else { cx += Math.cos(c.o) * 0.5; cz += Math.sin(c.o) * 0.5; }
    var k = c.k;
    if (k === 'bottles') { for (var b = 0; b < 3; b++) { var bx = cx + Math.cos(c.o + b * 2.1) * 0.14, bz = cz + Math.sin(c.o + b * 2.1) * 0.14, h = 0.22 + b * 0.04; cylM(bx, bz, 0, h, 0.045, TL('glassg'), 1, 6); cylM(bx, bz, h, h + 0.08, 0.018, TL('glassg'), 1, 5); } }
    else if (k === 'bucket') { cylM(cx, cz, 0, 0.32, 0.17, TL('plastic'), 1, 8); cylM(cx, cz, 0.3, 0.31, 0.15, TL('blood1'), 0.8, 8); }
    else if (k === 'rags') { boxM(cx - 0.28, 0.0, cz - 0.2, cx + 0.28, 0.06, cz + 0.2, TL('cloth'), 0.7); boxM(cx - 0.1, 0.06, cz - 0.12, cx + 0.18, 0.11, cz + 0.1, TL('cloth'), 0.6); }
    else if (k === 'bones') { boxM(cx - 0.3, 0, cz - 0.03, cx + 0.3, 0.05, cz + 0.03, TL('bone'), 1); boxM(cx - 0.05, 0, cz - 0.28, cx + 0.01, 0.05, cz + 0.2, TL('bone'), 0.9); cylM(cx + 0.18, cz + 0.16, 0, 0.16, 0.1, TL('bone'), 1, 7); }
    else if (k === 'candles') { for (var n = 0; n < 4; n++) cylM(cx + Math.cos(c.o + n * 1.6) * 0.14, cz + Math.sin(c.o + n * 1.6) * 0.14, 0, 0.12 + n * 0.06, 0.03, TL('candle'), 1, 5); boxM(cx - 0.2, 0, cz - 0.2, cx + 0.2, 0.01, cz + 0.2, TL('candle'), 0.6); }
    else if (k === 'pillpot') { for (var n2 = 0; n2 < 2; n2++) cylM(cx + n2 * 0.16, cz, 0, 0.12, 0.05, TL('plastic'), 1.1, 6); boxM(cx - 0.18, 0, cz + 0.08, cx + 0.12, 0.012, cz + 0.28, TL('i_pill'), 1); }
    else if (k === 'chains') { boxM(cx - 0.015, 1.6 + c.s * 0.5, cz - 0.015, cx + 0.015, CEIL, cz + 0.015, TL('steel'), 0.6); boxM(cx - 0.06, 1.5 + c.s * 0.5, cz - 0.01, cx + 0.06, 1.62 + c.s * 0.5, cz + 0.01, TL('steel'), 0.8); }
    else if (k === 'paper') { var pc = Math.cos(c.o) * 0.25, ps = Math.sin(c.o) * 0.25; m.quad([cx - pc + ps, 0.008, cz - ps - pc], [cx + pc + ps, 0.008, cz + ps - pc], [cx + pc - ps, 0.008, cz + ps + pc], [cx - pc - ps, 0.008, cz - ps + pc], UV, TL('paper'), vc(0.8), [0, 1, 0]); }
    else if (k === 'tv') { boxM(cx - 0.26, 0, cz - 0.26, cx + 0.26, 0.48, cz + 0.26, TL('black'), 0.9); if (q) { var fx = cx - q[0] * 0.27, fz = cz - q[1] * 0.27; if (q[0]) m.quad([fx, 0.08, cz + 0.2 * q[0]], [fx, 0.08, cz - 0.2 * q[0]], [fx, 0.4, cz - 0.2 * q[0]], [fx, 0.4, cz + 0.2 * q[0]], UV, TL('tvscreen'), vc(1), [-q[0], 0, 0], 0.8); else m.quad([cx - 0.2 * q[1], 0.08, fz], [cx + 0.2 * q[1], 0.08, fz], [cx + 0.2 * q[1], 0.4, fz], [cx - 0.2 * q[1], 0.4, fz], UV, TL('tvscreen'), vc(1), [0, 0, -q[1]], 0.8); } }
    else if (k === 'mattress' && q) { var mx = tx(c.i) + q[0] * (TSZ / 2 - 0.5), mz = tx(c.j) + q[1] * (TSZ / 2 - 0.5), hw = q[0] ? 0.45 : 0.95, hd = q[0] ? 0.95 : 0.45; boxM(mx - hw, 0, mz - hd, mx + hw, 0.16, mz + hd, TL('bed'), 0.75); }
    else if (k === 'meatbits') { cylM(cx, cz, 0, 0.12, 0.16, TL('meat'), 0.9, 6); boxM(cx + 0.1, 0, cz - 0.2, cx + 0.3, 0.08, cz, TL('meat'), 0.8); }
    else if (k === 'syringes') { for (var n3 = 0; n3 < 3; n3++) { var sa = c.o + n3; boxM(cx + Math.cos(sa) * 0.1 - 0.12, 0, cz + Math.sin(sa) * 0.1 - 0.015, cx + Math.cos(sa) * 0.1 + 0.12, 0.03, cz + Math.sin(sa) * 0.1 + 0.015, TL('plastic'), 1.2); } }
    else if (k === 'glasses') { for (var n4 = 0; n4 < 3; n4++) cylM(cx + Math.cos(c.o + n4 * 2) * 0.16, cz + Math.sin(c.o + n4 * 2) * 0.16, 0, 0.12, 0.04, TL('glassg'), 1.2, 6); }
  });
  /* lockers: tall steel boxes with their doors facing the hall */
  F.lockers.forEach(function (L) { if (only && !L.indoor) return; var r = lockerRect(L); if (L.coffin) { boxM(r[0], 0, r[1], r[2], 2.0, r[3], TL('wood'), 0.55); return; } boxM(r[0], 0, r[1], r[2], 2.15, r[3], TL('locker'), 1.15); boxM(r[0] - 0.02, 2.15, r[1] - 0.02, r[2] + 0.02, 2.22, r[3] + 0.02, TL('steel'), 0.7); });
  /* pipes along the halls, just under the ceiling */
  F.pipes.forEach(function (p) { var cx = tx(p.i), cz = tx(p.j), y = 2.72, o = p.side * (TSZ / 2 - 0.22), r = 0.11;
    if (p.ax === 'x') boxM(cx - TSZ / 2, y - r, cz + o - r, cx + TSZ / 2, y + r, cz + o + r, TL('pipe'), 0.9); else boxM(cx + o - r, y - r, cz - TSZ / 2, cx + o + r, y + r, cz + TSZ / 2, TL('pipe'), 0.9); });
  /* lamp fittings (the light itself is in F.lights) */
  F.lights.forEach(function (L) { if (L.exit || (only && !L.indoor)) return; var cx = tx(L.i), cz = tx(L.j); boxM(cx - 0.02, 2.55, cz - 0.02, cx + 0.02, CEIL, cz + 0.02, TL('black'), 1); boxM(cx - 0.18, 2.45, cz - 0.18, cx + 0.18, 2.56, cz + 0.18, TL('steel'), 0.8); });
  /* the stairs: steps up (or down) into the dark behind bars */
  [F.exit ? [F.exit, 1] : null, F.arrive ? [F.arrive, -1] : null].forEach(function (E) {
    if (!E) return; var e = E[0], up = E[1], cx = tx(e.i), cz = tx(e.j), x0 = e.i * TSZ, z0 = e.j * TSZ, T = TL('stairs');
    for (var s = 0; s < 8; s++) { var f = s / 8, y = up > 0 ? s * 0.32 : -s * 0.32, a0 = -TSZ / 2 + f * TSZ, a1 = a0 + TSZ / 8; // steps run away from the hall
      var px0 = cx - e.di * a0, pz0 = cz - e.dj * a0, px1 = cx - e.di * a1, pz1 = cz - e.dj * a1, w = TSZ / 2;
      boxM(Math.min(px0, px1) - (e.dj ? w : 0), up > 0 ? 0 : y - 0.32, Math.min(pz0, pz1) - (e.di ? w : 0), Math.max(px0, px1) + (e.dj ? w : 0), up > 0 ? y + 0.32 : y, Math.max(pz0, pz1) + (e.di ? w : 0), T, 0.8 - f * 0.6); }
    var gx = cx + e.di * (TSZ / 2 - 0.05), gz = cz + e.dj * (TSZ / 2 - 0.05); // the gate, facing the hall
    if (e.di) m.quad([gx, 0, gz - TSZ / 2], [gx, 0, gz + TSZ / 2], [gx, 2.3, gz + TSZ / 2], [gx, 2.3, gz - TSZ / 2], [0, 1, 1.5, 1, 1.5, 0, 0, 0], TL('bars'), vc(1), [e.di, 0, 0]);
    else m.quad([gx - TSZ / 2, 0, gz], [gx + TSZ / 2, 0, gz], [gx + TSZ / 2, 2.3, gz], [gx - TSZ / 2, 2.3, gz], [0, 1, 1.5, 1, 1.5, 0, 0, 0], TL('bars'), vc(1), [0, 0, e.dj]);
    if (up > 0) { var sx = cx + e.di * (TSZ / 2 + 0.02), sz = cz + e.dj * (TSZ / 2 + 0.02); // the EXIT sign over the gate, lit from inside
      if (e.di) m.quad([sx, 2.35, sz - 0.4], [sx, 2.35, sz + 0.4], [sx, 2.75, sz + 0.4], [sx, 2.75, sz - 0.4], e.di > 0 ? [1, 1, 0, 1, 0, 0, 1, 0] : [0, 1, 1, 1, 1, 0, 0, 0], TL('neon'), vc(1), [e.di, 0, 0], 1.4);
      else m.quad([sx - 0.4, 2.35, sz], [sx + 0.4, 2.35, sz], [sx + 0.4, 2.75, sz], [sx - 0.4, 2.75, sz], e.dj < 0 ? [1, 1, 0, 1, 0, 0, 1, 0] : [0, 1, 1, 1, 1, 0, 0, 0], TL('neon'), vc(1), [0, 0, e.dj], 1.4); }
  });
  /* blood and graffiti */
  var dm0 = m; m = F._dm || (F._dm = new R3.Mesh()); // decals go in their own mesh, drawn after the walls with a depth offset (they flickered)
  F.decals.forEach(function (D, di) {
    var cx = tx(D.i), cz = tx(D.j), T = TL(D.k), s = D.s * 0.6, lift = 0.02 + (di % 4) * 0.004;
    if (D.d < 0) { var c = Math.cos(D.o) * s, sn = Math.sin(D.o) * s; m.quad([cx - c + sn, lift, cz - sn - c], [cx + c + sn, lift, cz + sn - c], [cx + c - sn, lift, cz + sn + c], [cx - c - sn, lift, cz - sn + c], UV, T, vc(0.9), [0, 1, 0]); return; }
    var q = DIRS[D.d], wx = cx + q[0] * (TSZ / 2 - lift), wz = cz + q[1] * (TSZ / 2 - lift), y0 = D.y - s, y1 = D.y + s, n = [-q[0], 0, -q[1]], o = D.o;
    if (q[0]) m.quad([wx, y0, cz + o - s * q[0]], [wx, y0, cz + o + s * q[0]], [wx, y1, cz + o + s * q[0]], [wx, y1, cz + o - s * q[0]], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(1), n);
    else m.quad([cx + o + s * q[1], y0, wz], [cx + o - s * q[1], y0, wz], [cx + o - s * q[1], y1, wz], [cx + o + s * q[1], y1, wz], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(1), n);
  });
  m = dm0;
  return mesh ? m : m.upload();
}
function lockerRect(L) { var cx = tx(L.i), cz = tx(L.j), back = TSZ / 2, dep = 0.85, wid = 0.75, fx = cx - L.di * (back - dep / 2), fz = cz - L.dj * (back - dep / 2);
  return [fx - (L.di ? dep / 2 : wid), fz - (L.dj ? dep / 2 : wid), fx + (L.di ? dep / 2 : wid), fz + (L.dj ? dep / 2 : wid)]; }
/* ---------- moving about: what blocks feet and what blocks eyes ---------- */
var FL = null; // the floor being played
var BLOCKEYES = { shelf: 1, keg: 1, hook: 1, cabinet: 1, speaker: 1, rack: 1, stall: 1, big: 1, booth: 1, clownhead: 1, freezer: 0, vat: 1, jukebox: 1, tomb: 1, angel: 1, digger: 1, mixer: 1, skip: 1, cabin: 1, mausoleum: 1 };
function blocksFeet(i, j, who) { if (!inMap(i, j)) return true; var k = FL.K[idx(i, j)]; if (k === KW || k === KP || k === KL || k === KS || k === KA) return true; if (k === KB) return FL.cellLocked && who !== 'tb'; return false; }
function blocksEyes(i, j) { if (!inMap(i, j)) return true; var k = FL.K[idx(i, j)]; if (k === KW || k === KL) return true; if (k === KP) { var p = FL.propAt[idx(i, j)]; return p && BLOCKEYES[p.k]; } if (k === KD) { var d = FL.doorAt[idx(i, j)]; return d && d.open < 0.35; } return false; }
/* a circle of radius r at (x, z) pushed out of anything solid */
function collide(o, r, who) {
  var i0 = tileOf(o.x - r), i1 = tileOf(o.x + r), j0 = tileOf(o.z - r), j1 = tileOf(o.z + r);
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
    if (!blocksFeet(i, j, who)) continue; var bx0 = i * TSZ, bz0 = j * TSZ, bx1 = bx0 + TSZ, bz1 = bz0 + TSZ;
    var kq = FL.K[idx(i, j)]; if (kq === KP) { bx0 += 0.15; bz0 += 0.15; bx1 -= 0.15; bz1 -= 0.15; } else if (kq === KL) { var lr = lockerRect(FL.lockerAt[idx(i, j)]); bx0 = lr[0]; bz0 = lr[1]; bx1 = lr[2]; bz1 = lr[3]; }
    var nx = Math.max(bx0, Math.min(o.x, bx1)), nz = Math.max(bz0, Math.min(o.z, bz1)), dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
    if (d < r) { if (d < 1e-5) { var cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2; dx = o.x - cx; dz = o.z - cz; if (Math.abs(dx) > Math.abs(dz)) { o.x = dx > 0 ? bx1 + r : bx0 - r; } else { o.z = dz > 0 ? bz1 + r : bz0 - r; } } else { o.x = nx + dx / d * r; o.z = nz + dz / d * r; } }
  }
}
/* can a see b? walks the tiles between them (and gives up past range) */
function canSee(ax, az, bx, bz, range) {
  var dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz); if (range && d > range) return false;
  var steps = Math.ceil(d / (TSZ * 0.25)); for (var s = 1; s < steps; s++) { var t = s / steps, i = tileOf(ax + dx * t), j = tileOf(az + dz * t); if (blocksEyes(i, j)) return false; } return true;
}
/* a flow field: the walk distance from every tile to (ti, tj); movers roll downhill on it */
function flowTo(ti, tj, who) {
  var D = new Int32Array(MW * MH).fill(-1), q = [idx(ti, tj)]; D[q[0]] = 0;
  for (var h = 0; h < q.length; h++) { var p = q[h], pi = p % MW, pj = (p / MW) | 0; for (var d = 0; d < 4; d++) { var ni = pi + DIRS[d][0], nj = pj + DIRS[d][1]; if (!inMap(ni, nj)) continue; var nk = idx(ni, nj); if (D[nk] >= 0 || blocksFeet(ni, nj, who)) continue; D[nk] = D[p] + 1; q.push(nk); } }
  return D;
}
function walkable(i, j, who) { return inMap(i, j) && !blocksFeet(i, j, who); }
