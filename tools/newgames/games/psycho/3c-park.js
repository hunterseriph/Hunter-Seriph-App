/* =====================================================================================================
   EJACULAND, ABANDONED (his ask: after the woods, the park as a horror park; TB stalks you in a clown suit). Lanes
   three tiles wide between boarded-up stalls, plazas with the dead rides (the carousel, the big top, the ferris wheel,
   the teacups, a Steve statue), photo booths to hide in, broken neon, and the Load Flume's station at the far end:
   the only way on is the ride. Also: the map size per level, and the one mesh builder every level goes through.
   ===================================================================================================== */
function setMapSize(n) { MW = MH = n || 41; }
function buildFloorMesh(F) {
  var kind = FLOORS[F.fi].kind; if (!kind) return buildIndoorMesh(F);
  buildFronts(F); var m = new R3.Mesh();
  if (F.rooms.some(function (r) { return r.shop; })) { F.indoorOnly = 1; buildIndoorMesh(F, m); F.indoorOnly = 0; }
  buildOutdoorMesh(F, m); return m.upload();
}
function genPark(fi, seed) {
  var rnd = srand(seed), F = lvlBase(fi), K = F.K, th = FLOORS[fi], lines = [];
  for (var r = 2; r + 2 < MW - 3; r += 8) lines.push(r);
  lines.forEach(function (a) { for (var i = 1; i < MW - 1; i++) for (var w = 0; w < 3; w++) { K[idx(i, a + w)] = KC; K[idx(a + w, i)] = KC; } });
  var mid = lines[lines.length >> 1], last = lines[lines.length - 1] + 2;
  for (var g = mid; g < mid + 3; g++) { K[idx(g, 1)] = KC; for (var gj = last; gj < MH - 1; gj++) K[idx(g, gj)] = KC; } // the flume station north, the gate you came in by south
  F.start = { i: mid + 1, j: MH - 3, a: Math.PI }; F.start2 = { i: mid + 2, j: MH - 3 }; F.respawn = F.start; F.cellIn = F.start; F.tb = { i: mid + 1, j: MH - 2 }; F.tbIn = { i: mid + 1, j: MH - 2, di: 0, dj: -1 };
  F.exitIn = { i: mid + 1, j: 1 }; F.exitZone = [mid, 0, mid + 2, 1];
  var used = {}; for (var u = mid; u < mid + 3; u++) { used[idx(u, 1)] = used[idx(u, 2)] = used[idx(u, MH - 3)] = used[idx(u, MH - 2)] = 1; }
  var keep = function () { var D = bfs(F, mid + 1, MH - 3); return D[idx(mid + 1, 1)] >= 0; };
  // plazas: whole blocks cleared round a dead ride
  var blocks = []; for (var bj = 0; bj < lines.length - 1; bj++) for (var bi = 0; bi < lines.length - 1; bi++) blocks.push([lines[bi] + 3, lines[bj] + 3]);
  blocks.sort(function () { return rnd() - 0.5; });
  ['carousel', 'bigtop', 'ferris', 'teacups', 'steve', 'graves'].forEach(function (k, n) { var b = blocks[n]; if (!b) return; var R = { id: F.rooms.length, x: b[0], y: b[1], w: 5, h: 5, open: 1, doors: [], ride: k };
    for (var y = b[1]; y < b[1] + 5; y++) for (var x = b[0]; x < b[0] + 5; x++) { K[idx(x, y)] = KR; F.RM[idx(x, y)] = R.id; } F.rooms.push(R);
    var cx = b[0] + 2, cy = b[1] + 2;
    if (k === 'carousel' || k === 'bigtop') { for (var y2 = cy - 1; y2 <= cy + 1; y2++) for (var x2 = cx - 1; x2 <= cx + 1; x2++) { K[idx(x2, y2)] = KP; used[idx(x2, y2)] = 1; if (x2 !== cx || y2 !== cy) F.props.push({ i: x2, j: y2, k: 'big', a: 0, hide: 1 }); } F.props.push({ i: cx, j: cy, k: k, a: 0 }); }
    else if (k === 'ferris') { for (var x3 = cx - 1; x3 <= cx + 1; x3++) { K[idx(x3, cy)] = KP; used[idx(x3, cy)] = 1; if (x3 !== cx) F.props.push({ i: x3, j: cy, k: 'big', a: 0, hide: 1 }); } F.props.push({ i: cx, j: cy, k: 'ferris', a: 0 }); }
    else if (k === 'teacups') [[cx - 1, cy - 1], [cx + 1, cy], [cx - 1, cy + 1]].forEach(function (p) { K[idx(p[0], p[1])] = KP; used[idx(p[0], p[1])] = 1; F.props.push({ i: p[0], j: p[1], k: 'teacup', a: rnd() * 6 }); });
    else if (k === 'steve') { K[idx(cx, cy)] = KP; used[idx(cx, cy)] = 1; F.props.push({ i: cx, j: cy, k: 'plinth', a: 0 }); F.standees.push({ x: tx(cx), z: tx(cy), a: 0, k: 'steve0', h: 3.4, y: 1.0 }); F.standees.push({ x: tx(cx), z: tx(cy), a: Math.PI / 2, k: 'steve0', h: 3.4, y: 1.0 }); }
    else if (k === 'graves') for (var gn = 0; gn < 5; gn++) { var gx = b[0] + Math.floor(rnd() * 5), gy = b[1] + Math.floor(rnd() * 5); if (K[idx(gx, gy)] !== KR) continue; K[idx(gx, gy)] = KP; if (!keep()) { K[idx(gx, gy)] = KR; continue; } used[idx(gx, gy)] = 1; F.props.push({ i: gx, j: gy, k: 'gravestone', a: Math.PI }); }
    F.lights.push({ i: cx, j: cy + 2.4, k: 1.2, r: 10, fl: rnd() < 0.5 ? 1 : 0, c: k === 'graves' ? [0.5, 1, 0.4] : [1, 0.2, 0.3], y: 3.6, pole: 1 });
  });
  // fallen things block some lanes, so it's never a straight run
  for (var t = 0; t < 60; t++) { var horiz = rnd() < 0.5, a = lines[Math.floor(rnd() * lines.length)], bpos = lines[Math.floor(rnd() * (lines.length - 1))] + 3 + Math.floor(rnd() * 5), cells = [];
    for (var w2 = 0; w2 < 3; w2++) cells.push(horiz ? [bpos, a + w2] : [a + w2, bpos]);
    if (cells.some(function (q) { return K[idx(q[0], q[1])] !== KC || used[idx(q[0], q[1])]; })) continue;
    cells.forEach(function (q) { K[idx(q[0], q[1])] = KP; }); if (!keep()) { cells.forEach(function (q) { K[idx(q[0], q[1])] = KC; }); continue; }
    cells.forEach(function (q, n) { used[idx(q[0], q[1])] = 1; F.props.push({ i: q[0], j: q[1], k: ['barrier', 'popcorn', 'barrier'][n], a: horiz ? Math.PI / 2 : 0 }); }); }
  // junk along the lanes
  for (var jn = 0; jn < 70; jn++) { var pi = 1 + Math.floor(rnd() * (MW - 2)), pj = 1 + Math.floor(rnd() * (MH - 2)); if (K[idx(pi, pj)] !== KC || used[idx(pi, pj)] || !DIRS.some(function (q) { return K[idx(pi + q[0], pj + q[1])] === KW; })) continue;
    K[idx(pi, pj)] = KP; if (!keep()) { K[idx(pi, pj)] = KC; continue; } used[idx(pi, pj)] = 1; F.props.push({ i: pi, j: pj, k: th.props[Math.floor(rnd() * th.props.length)], a: Math.floor(rnd() * 4) * Math.PI / 2 }); }
  var D = bfs(F, mid + 1, MH - 3); addHides(F, rnd, 16, used, D, keep); F.hideWord = 'HIDE IN THE PHOTO BOOTH';
  // broken neon on the stalls, lamps (half of them dead), the gate and the flume station
  var faces = []; for (var j5 = 1; j5 < MH - 1; j5++) for (var i5 = 1; i5 < MW - 1; i5++) { if (K[idx(i5, j5)] !== KC) continue; DIRS.forEach(function (q, d) { var ni = i5 + q[0], nj = j5 + q[1]; if (K[idx(ni, nj)] === KW && ni > 0 && nj > 0 && ni < MW - 1 && nj < MH - 1) faces.push({ i: i5, j: j5, d: d }); }); }
  faces.sort(function () { return rnd() - 0.5; });
  faces.slice(0, 70).forEach(function (f, n) { F.neons.push({ i: f.i, j: f.j, d: f.d, k: ['n_closed', 'n_fun', 'n_heart', 'n_ejac', 'n_steve', 'n_closed', 'n_lips'][n % 7], y: 2.9, o: (rnd() - 0.5) * 0.6, broken: rnd() < 0.4 }); });
  for (var j6 = 1; j6 < MH - 1; j6++) for (var i6 = 1; i6 < MW - 1; i6++) if (K[idx(i6, j6)] === KC && (i6 * 5 + j6 * 11) % 13 === 0) F.lights.push({ i: i6, j: j6, k: 1.1, r: 8, fl: rnd() < 0.45 ? 1 : 0, dead: rnd() < 0.3, c: rnd() < 0.6 ? [1, 0.15, 0.22] : [1, 0.5, 0.2], y: 3.4, pole: 1 });
  F.lights.push({ i: mid + 1, j: 0.4, k: 2.0, r: 12, fl: 0, c: [1, 0.85, 0.4], y: 3, exit: 1 });
  F.lights.push({ i: mid + 1, j: MH - 2, k: 1.4, r: 9, fl: 1, c: [1, 0.15, 0.2], y: 3.5 });
  F.standees.push({ x: tx(mid) - 0.6, z: tx(MH - 4), a: 0, k: 'steve0', h: 2.3 }); // Steve still waves you in at the gate
  F.gate = { i: mid, j: MH - 2 };
  lvlFill(F, rnd, th, used, D, 12);
  return F;
}
/* ---------- the park's looks ---------- */
function parkMesh(F, m, H) {
  var K = F.K, boxM = H.boxM, cylM = H.cylM, vc = H.vc, kk = H.kk, face = H.face, rnd = H.rnd;
  function hs(i, j) { var b = ((i >> 1) * 73856093 ^ (j >> 1) * 19349663) >>> 0; return 2.7 + (b % 4) * 0.2; }
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
    var k = kk(i, j), x0 = i * TSZ, z0 = j * TSZ, room = F.RM[idx(i, j)] >= 0;
    if (k !== KW) { m.quad([x0, 0, z0 + TSZ], [x0 + TSZ, 0, z0 + TSZ], [x0 + TSZ, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(room ? (F.rooms[F.RM[idx(i, j)]].ride === 'graves' ? 'grass' : 'checker') : rnd() < 0.2 ? 'dirt' : 'pave'), vc(0.8 + rnd() * 0.2), [0, 1, 0]); continue; }
    var edge = i === 0 || j === 0 || i === MW - 1 || j === MH - 1;
    if (edge) { // the iron fence round the park, dead trees behind it
      DIRS.forEach(function (q, d) { var ni = i + q[0], nj = j + q[1]; if (!inMap(ni, nj) || kk(ni, nj) === KW) return; face(ni, nj, d === 0 ? 1 : d === 1 ? 0 : d === 2 ? 3 : 2, 0, 3.4, TL('ironbar'), 1, [0, 1, 1, 1, 1, 0, 0, 0]); });
      if (rnd() < 0.5) { var ox = i === 0 ? -1 : i === MW - 1 ? 1 : 0, oz = j === 0 ? -1 : j === MH - 1 ? 1 : 0, tx0 = x0 + TSZ / 2 + ox * (2 + rnd() * 6), tz0 = z0 + TSZ / 2 + oz * (2 + rnd() * 6); cylM(tx0, tz0, 0, 8 + rnd() * 4, 0.25, TL('bark'), 0.6); }
      m.quad([x0, 0, z0 + TSZ], [x0 + TSZ, 0, z0 + TSZ], [x0 + TSZ, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL('grass'), vc(0.6), [0, 1, 0]); continue; }
    var h = hs(i, j); m.quad([x0, h, z0], [x0 + TSZ, h, z0], [x0 + TSZ, h, z0 + TSZ], [x0, h, z0 + TSZ], [0, 0, 1, 0, 1, 1, 0, 1], TL('roof'), vc(0.6), [0, 1, 0]);
    for (var d = 0; d < 4; d++) { var q = DIRS[d], ni = i + q[0], nj = j + q[1], nk = kk(ni, nj); if (nk === KW) { var nh = hs(ni, nj); if (nh < h && !(ni === 0 || nj === 0 || ni === MW - 1 || nj === MH - 1)) face(ni, nj, d === 0 ? 1 : d === 1 ? 0 : d === 2 ? 3 : 2, nh, h, TL('boards'), 0.7); continue; }
      var fd = d === 0 ? 1 : d === 1 ? 0 : d === 2 ? 3 : 2; face(ni, nj, fd, 0, 2.3, TL('boards'), 0.85); face(ni, nj, fd, 2.3, h, TL('stripes'), 0.8);
      // a sagging striped awning over the boarded window
      var ax0 = ni * TSZ, az0 = nj * TSZ, out = 0.7, y0 = 2.35, y1 = 2.0;
      if (fd === 0) m.quad([ax0 + TSZ, y0, az0], [ax0 + TSZ, y0, az0 + TSZ], [ax0 + TSZ - out, y1, az0 + TSZ], [ax0 + TSZ - out, y1, az0], [0, 0, 1, 0, 1, 1, 0, 1], TL('stripes'), vc(0.75), [-0.4, 0.9, 0]);
      else if (fd === 1) m.quad([ax0, y0, az0 + TSZ], [ax0, y0, az0], [ax0 + out, y1, az0], [ax0 + out, y1, az0 + TSZ], [0, 0, 1, 0, 1, 1, 0, 1], TL('stripes'), vc(0.75), [0.4, 0.9, 0]);
      else if (fd === 2) m.quad([ax0 + TSZ, y0, az0 + TSZ], [ax0, y0, az0 + TSZ], [ax0, y1, az0 + TSZ - out], [ax0 + TSZ, y1, az0 + TSZ - out], [0, 0, 1, 0, 1, 1, 0, 1], TL('stripes'), vc(0.75), [0, 0.9, -0.4]);
      else m.quad([ax0, y0, az0], [ax0 + TSZ, y0, az0], [ax0 + TSZ, y1, az0 + out], [ax0, y1, az0 + out], [0, 0, 1, 0, 1, 1, 0, 1], TL('stripes'), vc(0.75), [0, 0.9, 0.4]);
    }
  }
  F.neons.forEach(function (N) { var q = DIRS[N.d], x0 = N.i * TSZ, z0 = N.j * TSZ, s = 0.7, y = N.y, T = TL(N.k), off = TSZ / 2 - 0.03, cx = x0 + TSZ / 2 + q[0] * off, cz = z0 + TSZ / 2 + q[1] * off, n = [-q[0], 0, -q[1]], g = N.broken ? 0.3 : 1.4;
    if (q[0]) m.quad([cx, y - s, cz - s * q[0] + N.o], [cx, y - s, cz + s * q[0] + N.o], [cx, y + s, cz + s * q[0] + N.o], [cx, y + s, cz - s * q[0] + N.o], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(N.broken ? 0.5 : 1), n, g);
    else m.quad([cx + s * q[1] + N.o, y - s, cz], [cx - s * q[1] + N.o, y - s, cz], [cx - s * q[1] + N.o, y + s, cz], [cx + s * q[1] + N.o, y + s, cz], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(N.broken ? 0.5 : 1), n, g); });
  F.lights.forEach(function (L) { if (!L.pole) return; var x = tx(L.i), z = tx(L.j); boxM(x - 0.05, 0, z - 0.05, x + 0.05, L.y, z + 0.05, TL('metal'), 0.6); boxM(x - 0.22, L.y - 0.1, z - 0.22, x + 0.22, L.y + 0.05, z + 0.22, TL('rust'), 0.8); });
  F.lockers.forEach(function (L) { var r = lockerRect(L); boxM(r[0], 0, r[1], r[2], 2.2, r[3], TL('polka'), 0.6); boxM(r[0] - 0.05, 2.2, r[1] - 0.05, r[2] + 0.05, 2.35, r[3] + 0.05, TL('black'), 1); });
  // the rides and the junk
  F.props.forEach(function (p) { var cx = tx(p.i), cz = tx(p.j), s = Math.sin(p.a), c = Math.cos(p.a);
    function B(f0, f1, s0, s1, y0, y1, T, k2) { var pts = [[s0, f0], [s1, f0], [s1, f1], [s0, f1]].map(function (q) { return [cx + q[0] * c + q[1] * s, cz - q[0] * s + q[1] * c]; }); var xs = pts.map(function (q) { return q[0]; }), zs = pts.map(function (q) { return q[1]; }); boxM(Math.min.apply(0, xs), y0, Math.min.apply(0, zs), Math.max.apply(0, xs), y1, Math.max.apply(0, zs), T, k2); }
    if (p.k === 'carousel') { cylM(cx, cz, 0, 0.45, 3.4, TL('wood'), 0.7, 14); cylM(cx, cz, 0, 4.2, 0.25, TL('metal'), 0.9, 8); for (var n = 0; n < 8; n++) { var a = n / 8 * 6.283 + 0.3, hx = cx + Math.cos(a) * 2.4, hz = cz + Math.sin(a) * 2.4; boxM(hx - 0.03, 0.45, hz - 0.03, hx + 0.03, 3.8, hz + 0.03, TL('metal'), 0.9); boxM(hx - 0.5, 1.0 + (n % 3) * 0.3, hz - 0.15, hx + 0.5, 1.5 + (n % 3) * 0.3, hz + 0.15, TL(n % 2 ? 'clownskin' : 'polka'), 0.7); }
      var top = [cx, 5.6, cz]; for (var r = 0; r < 12; r++) { var a0 = r / 12 * 6.283, a1 = (r + 1) / 12 * 6.283; m.tri([cx + Math.cos(a0) * 3.6, 3.8, cz + Math.sin(a0) * 3.6], [cx + Math.cos(a1) * 3.6, 3.8, cz + Math.sin(a1) * 3.6], top, [0, 1, 1, 1, 0.5, 0], TL('stripes'), vc(0.8)); } }
    else if (p.k === 'bigtop') { var tp = [cx, 7.5, cz]; for (var r2 = 0; r2 < 14; r2++) { var b0 = r2 / 14 * 6.283, b1 = (r2 + 1) / 14 * 6.283; m.quad([cx + Math.cos(b0) * 3.5, 0, cz + Math.sin(b0) * 3.5], [cx + Math.cos(b1) * 3.5, 0, cz + Math.sin(b1) * 3.5], [cx + Math.cos(b1) * 3.5, 3, cz + Math.sin(b1) * 3.5], [cx + Math.cos(b0) * 3.5, 3, cz + Math.sin(b0) * 3.5], [0, 1, 1, 1, 1, 0, 0, 0], TL('stripes'), vc(0.8)); m.tri([cx + Math.cos(b0) * 3.5, 3, cz + Math.sin(b0) * 3.5], [cx + Math.cos(b1) * 3.5, 3, cz + Math.sin(b1) * 3.5], tp, [0, 1, 1, 1, 0.5, 0], TL('stripes'), vc(0.9)); } boxM(cx - 0.03, 7.5, cz - 0.03, cx + 0.03, 8.6, cz + 0.03, TL('metal'), 0.8); }
    else if (p.k === 'ferris') { var R = 9, hub = R + 1.5; boxM(cx - 2.8, 0, cz - 0.15, cx - 2.5, hub, cz + 0.15, TL('lattice'), 1); boxM(cx + 2.5, 0, cz - 0.15, cx + 2.8, hub, cz + 0.15, TL('lattice'), 1);
      for (var sg = 0; sg < 24; sg++) { var e0 = sg / 24 * 6.283, e1 = (sg + 1) / 24 * 6.283; [-0.4, 0.4].forEach(function (zz) { m.quad([cx + Math.cos(e0) * R, hub + Math.sin(e0) * R, cz + zz - 0.06], [cx + Math.cos(e1) * R, hub + Math.sin(e1) * R, cz + zz - 0.06], [cx + Math.cos(e1) * R, hub + Math.sin(e1) * R, cz + zz + 0.06], [cx + Math.cos(e0) * R, hub + Math.sin(e0) * R, cz + zz + 0.06], [0, 0, 1, 0, 1, 1, 0, 1], TL('rust'), vc(0.8), [Math.cos(e0), Math.sin(e0), 0]); });
        if (sg % 3 === 0) { var gx = cx + Math.cos(e0) * R, gy = hub + Math.sin(e0) * R; m.quad([cx, hub - 0.05, cz], [gx, gy - 0.05, cz], [gx, gy + 0.05, cz], [cx, hub + 0.05, cz], [0, 0, 1, 0, 1, 1, 0, 1], TL('metal'), vc(0.7), [0, 0, 1]); boxM(gx - 0.6, gy - 1.6, cz - 0.7, gx + 0.6, gy - 0.4, cz + 0.7, TL(sg % 2 ? 'polka' : 'rust'), 0.7); } } }
    else if (p.k === 'teacup') { cylM(cx, cz, 0, 0.9, 0.95, TL('polka'), 0.75, 10); cylM(cx, cz, 0.85, 0.95, 1.0, TL('clownskin'), 0.7, 10); }
    else if (p.k === 'plinth') B(-0.8, 0.8, -0.8, 0.8, 0, 1.0, TL('rockt'), 0.8);
    else if (p.k === 'gravestone') { B(-0.15, 0.15, -0.45, 0.45, 0, 1.0, TL('grave'), 0.9); B(-0.15, 0.15, -0.3, 0.3, 1.0, 1.25, TL('grave'), 0.9); }
    else if (p.k === 'popcorn') { B(-0.5, 0.5, -0.7, 0.7, 0.3, 1.1, TL('polka'), 0.7); B(-0.45, 0.45, -0.6, 0.6, 1.1, 1.9, TL('windscreen'), 0.7); B(-0.55, 0.55, -0.75, 0.75, 1.9, 2.05, TL('stripes'), 0.8); }
    else if (p.k === 'clownhead') { cylM(cx, cz, 0, 0.6, 0.7, TL('rockt'), 0.7); boxM(cx - 0.7, 0.6, cz - 0.7, cx + 0.7, 2.2, cz + 0.7, TL('clownskin'), 0.6); boxM(cx - 0.85, 1.9, cz - 0.85, cx + 0.85, 2.6, cz + 0.85, TL('wigred'), 0.7); boxM(cx + s * 0.72 - 0.15, 1.35, cz + c * 0.72 - 0.15, cx + s * 0.72 + 0.15, 1.65, cz + c * 0.72 + 0.15, TL('carpaint'), 0.45); }
    else if (p.k === 'stall') B(-1, 1, -1, 1, 0, 2.6, TL('boards'), 0.8);
  });
  // far off over the fence: the coaster's lattice and track, and the flume station (the way on)
  var mid = F.exitIn.i, sx = tx(mid), sz = -1.5; boxM(sx - 6, 0, sz - 8, sx + 6, 6, sz, TL('hauntw'), 0.6); boxM(sx - 6.3, 6, sz - 8.3, sx + 6.3, 6.4, sz + 0.3, TL('black'), 1);
  m.quad([sx - 2.6, 3.2, sz + 0.05], [sx + 2.6, 3.2, sz + 0.05], [sx + 2.6, 5.8, sz + 0.05], [sx - 2.6, 5.8, sz + 0.05], [0, 1, 1, 1, 1, 0, 0, 0], TL('n_flume'), vc(1), [0, 0, 1], 1.6);
  m.quad([sx + 3, 0.8, sz + 0.05], [sx + 5, 0.8, sz + 0.05], [sx + 5, 2.8, sz + 0.05], [sx + 3, 2.8, sz + 0.05], [0, 1, 1, 1, 1, 0, 0, 0], TL('n_loaded'), vc(1), [0, 0, 1], 1.2);
  var ex = MW * TSZ + 8; for (var cz2 = 4; cz2 < MH * TSZ - 4; cz2 += 6) { var hh = 9 + Math.sin(cz2 / 17) * 6 + 6; boxM(ex - 0.2, 0, cz2 - 0.2, ex + 0.2, hh, cz2 + 0.2, TL('lattice'), 1); boxM(ex - 1.2, hh, cz2 - 3, ex + 1.2, hh + 0.3, cz2 + 3, TL('rail'), 0.8); }
  var gx = tx(F.gate.i) + TSZ / 2, gz = MH * TSZ + 0.2; m.quad([gx + 3.2, 3.6, gz], [gx - 3.2, 3.6, gz], [gx - 3.2, 5.6, gz], [gx + 3.2, 5.6, gz], [0, 1, 1, 1, 1, 0, 0, 0], TL('n_ejac'), vc(0.6), [0, 0, -1], 0.4);
}
