/* =====================================================================================================
   CUM CITY'S OPEN GROUND: the cemetery (stone walls round it, gravel paths, rows of graves, hedges, crypts you can
   walk into with coffins to hide in, the chapel in the middle, dead trees, weeping angels) and the cumstruction site
   (hoardings round it, half-built towers in scaffolding, portacabins to walk into, girders, pipes, a digger, cement
   mixers, cones, portaloos to hide in). Same tile codes as everywhere else, so moving, seeing, hiding and the AI just work.
   F.BT / F.BH give a wall tile its own look and height; F.FT gives a floor tile its own texture.
   ===================================================================================================== */
SHOPIN.crypt = { room: 'crypt', floor: 'stonef', props: ['coffin', 'candles'], loot: ['cracker'] };
SHOPIN.cabin = { room: 'cabin', floor: 'plywood', props: ['table', 'chair', 'shelf'], loot: ['ammo9'] };
function genYard(fi, seed, style) {
  var rnd = srand(seed), F = lvlBase(fi), K = F.K, th = FLOORS[fi], cem = style === 'cemetery'; F.BT = {}; F.BH = {}; F.FT = {}; F.doorRoom = {};
  function ri(n) { return Math.floor(rnd() * n); }
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) K[idx(i, j)] = KC;
  for (var e = 0; e < MW; e++) [[e, 0], [e, MH - 1], [0, e], [MW - 1, e]].forEach(function (q) { F.BT[idx(q[0], q[1])] = cem ? 'stonewall' : 'hoarding'; F.BH[idx(q[0], q[1])] = cem ? 2.6 : 2.9; });
  var mid = MW >> 1, last = MH - 2; F.start = { i: mid, j: last, a: Math.PI }; F.start2 = { i: mid + 1, j: last }; F.respawn = F.start; F.cellIn = F.start; F.tb = { i: mid, j: last - 1 }; F.tbIn = { i: mid, j: last };
  K[idx(mid, 0)] = KC; K[idx(mid + 1, 0)] = KC; F.exitIn = { i: mid, j: 1 }; F.exitZone = [mid, 0, mid + 1, 1];
  var used = {}; [[mid, last], [mid + 1, last], [mid, 1], [mid + 1, 1], [mid, 0], [mid + 1, 0]].forEach(function (q) { used[idx(q[0], q[1])] = 1; });
  function keep() { var D = bfs(F, mid, last); return D[idx(mid, 1)] >= 0; }
  // the paths: a cross of wide ones and a ring; nothing is built on them
  var path = {}; function mark(i, j) { if (inMap(i, j)) path[idx(i, j)] = 1; }
  for (var a = 1; a < MH - 1; a++) { mark(mid, a); mark(mid + 1, a); mark(a, MH >> 1); mark(a, (MH >> 1) + 1); }
  for (var b = 4; b < MW - 4; b++) { mark(b, 4); mark(b, MH - 5); mark(4, b); mark(MW - 5, b); }
  if (cem) Object.keys(path).forEach(function (k) { F.FT[k] = 'stonef'; });
  else Object.keys(path).forEach(function (k) { F.FT[k] = 'pave'; });
  function free(x, y, w, h, gap) { for (var yy = y - gap; yy < y + h + gap; yy++) for (var xx = x - gap; xx < x + w + gap; xx++) { if (xx < 1 || yy < 1 || xx > MW - 2 || yy > MH - 2) return false; var q = idx(xx, yy); if (K[q] !== KC || used[q] || (path[q] && xx >= x && xx < x + w && yy >= y && yy < y + h)) return false; } return true; }
  // buildings: the chapel / the towers, then crypts / portacabins you can walk into
  function block(x, y, w, h, tex, ht, scaf) { for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) { var q = idx(xx, yy); K[q] = KW; F.BT[q] = tex; F.BH[q] = ht; if (scaf) F.BT[q + '_s'] = 1; } }
  var bigs = cem ? 1 : 4, rooms = cem ? 7 : 6;
  for (var t1 = 0, made = 0; t1 < 300 && made < bigs; t1++) { var w = cem ? 7 : 4 + ri(4), h = cem ? 9 : 4 + ri(4), x = 2 + ri(MW - w - 4), y = 3 + ri(MH - h - 8); if (cem) { x = mid - 3 - 6; y = (MH >> 1) - 4 - 8; } if (!free(x, y, w, h, 1)) { if (cem) { x = 6; y = 7; if (!free(x, y, w, h, 1)) continue; } else continue; }
    block(x, y, w, h, cem ? 'crypt' : 'conc', cem ? 10 : 7 + ri(9), !cem); if (!keep()) { for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) K[idx(xx, yy)] = KC; continue; } made++;
    if (cem) F.neons.push({ i: x + (w >> 1), j: y + h, d: 3, k: 'n_rip', y: 4.2, o: 0 }); }
  function walkIn(kind) { // a crypt or a portacabin: walls, a room inside, a door onto open ground
    for (var t2 = 0; t2 < 200; t2++) { var w = cem ? 5 : 5, h = cem ? 5 : 4, x = 2 + ri(MW - w - 4), y = 3 + ri(MH - h - 7); if (!free(x, y, w, h, 1)) continue;
      var sides = [[x + (w >> 1), y + h, 0, 1], [x + (w >> 1), y - 1, 0, -1], [x - 1, y + (h >> 1), -1, 0], [x + w, y + (h >> 1), 1, 0]].filter(function (s) { return inMap(s[0], s[1]) && K[idx(s[0], s[1])] === KC; }); if (!sides.length) continue; var sd = sides[ri(sides.length)];
      block(x, y, w, h, cem ? 'crypt' : 'cabin', cem ? 4.4 : 2.9, 0);
      var R = { id: F.rooms.length, x: x + 1, y: y + 1, w: w - 2, h: h - 2, doors: [], shop: kind }; var S = SHOPIN[kind]; R.th = { room: S.room, roomf: S.floor, wall2: S.room, ceil: 'ceil', wall: S.room, floor: S.floor };
      for (var yy = R.y; yy < R.y + R.h; yy++) for (var xx = R.x; xx < R.x + R.w; xx++) { K[idx(xx, yy)] = KR; F.RM[idx(xx, yy)] = R.id; used[idx(xx, yy)] = 1; }
      var di = sd[0] - sd[2], dj = sd[1] - sd[3]; K[idx(di, dj)] = KD; F.doorRoom[idx(di, dj)] = R.id; R.doors.push({ i: di, j: dj, di: sd[2], dj: sd[3] }); used[idx(di, dj)] = used[idx(sd[0], sd[1])] = 1; F.rooms.push(R);
      if (!keep()) { /* the door must open onto ground that leads somewhere */ }
      var spots = []; for (var y2 = R.y; y2 < R.y + R.h; y2++) for (var x2 = R.x; x2 < R.x + R.w; x2++) if (Math.abs(x2 - (di - sd[2])) + Math.abs(y2 - (dj - sd[3])) > 1) spots.push([x2, y2]);
      spots.sort(function () { return rnd() - 0.5; });
      var lk = spots.shift(); if (lk) { var wq = DIRS.find(function (q) { return K[idx(lk[0] + q[0], lk[1] + q[1])] === KW; }); if (wq) { K[idx(lk[0], lk[1])] = KL; F.lockers.push({ i: lk[0], j: lk[1], di: -wq[0], dj: -wq[1], indoor: 1, coffin: cem }); } }
      S.props.forEach(function (pk, n) { var p = spots[n]; if (!p) return; K[idx(p[0], p[1])] = KP; F.props.push({ i: p[0], j: p[1], k: pk, a: Math.atan2(sd[2], sd[3]), indoor: 1 }); });
      var fl = spots.filter(function (p) { return K[idx(p[0], p[1])] === KR; }); S.loot.forEach(function (lk2) { var p = fl[ri(fl.length)]; if (p) F.loot.push({ i: p[0], j: p[1], k: lk2 }); });
      F.lights.push({ i: R.x + (R.w - 1) / 2, j: R.y + (R.h - 1) / 2, k: 0.8, r: 5, fl: rnd() < 0.5 ? 1 : 0, c: cem ? [1, 0.6, 0.3] : [1, 0.9, 0.7], indoor: 1 });
      return R; } }
  for (var r = 0; r < rooms; r++) walkIn(cem ? 'crypt' : 'cabin');
  // hedges (the cemetery) / stacks of materials and fences (the site) cut the ground into yards
  for (var t3 = 0; t3 < (cem ? 22 : 16); t3++) { var hz = rnd() < 0.5, L = 4 + ri(6), x3 = 2 + ri(MW - 4), y3 = 2 + ri(MH - 6), cells = [];
    for (var s = 0; s < L; s++) cells.push(hz ? [x3 + s, y3] : [x3, y3 + s]);
    if (cells.some(function (q) { return q[0] < 2 || q[1] < 2 || q[0] > MW - 3 || q[1] > MH - 3 || K[idx(q[0], q[1])] !== KC || used[idx(q[0], q[1])] || path[idx(q[0], q[1])]; })) continue;
    cells.forEach(function (q) { var k = idx(q[0], q[1]); K[k] = KW; F.BT[k] = cem ? 'hedge' : 'hoarding'; F.BH[k] = cem ? 2.1 : 2.4; }); if (!keep()) cells.forEach(function (q) { K[idx(q[0], q[1])] = KC; }); }
  // the graves in rows / the site's junk
  if (cem) { for (var j4 = 2; j4 < MH - 2; j4 += 2) for (var i4 = 2; i4 < MW - 2; i4++) { var q4 = idx(i4, j4); if (K[q4] !== KC || used[q4] || path[q4] || (i4 % 4 === 0) || rnd() < 0.25) continue; K[q4] = KP; F.props.push({ i: i4, j: j4, k: th.props[ri(th.props.length)], a: 0, o: (rnd() - 0.5) * 0.4 }); used[q4] = 1; }
    if (!keep()) { // dig a way through if the rows closed it off
      F.props = F.props.filter(function (p) { if (p.indoor) return true; if (p.i === mid || p.i === mid + 1) { K[idx(p.i, p.j)] = KC; return false; } return true; }); }
  } else { for (var t4 = 0; t4 < 120; t4++) { var i5 = 2 + ri(MW - 4), j5 = 2 + ri(MH - 4), q5 = idx(i5, j5); if (K[q5] !== KC || used[q5] || path[q5]) continue; K[q5] = KP; if (!keep()) { K[q5] = KC; continue; } used[q5] = 1; F.props.push({ i: i5, j: j5, k: th.props[ri(th.props.length)], a: ri(4) * Math.PI / 2 }); } }
  // things to hide in out in the open: coffins stood up against the walls / portaloos
  var D = bfs(F, mid, last); addHides(F, rnd, cem ? 10 : 9, used, D, keep); F.hideWord = cem ? 'HIDE IN THE COFFIN' : 'HIDE IN THE PORTALOO'; F.lockers.forEach(function (Lk) { if (!Lk.indoor) Lk.style = cem ? 'coffin' : 'loo'; });
  // lamps: pale ones on posts in the cemetery, yellow work lights on the site; candles on some graves
  for (var j6 = 2; j6 < MH - 2; j6++) for (var i6 = 2; i6 < MW - 2; i6++) if (K[idx(i6, j6)] === KC && (cem ? path[idx(i6, j6)] && (i6 * 7 + j6 * 11) % 13 === 0 : (i6 * 7 + j6 * 11) % 23 === 0)) F.lights.push({ i: i6, j: j6, k: 1.2, r: 9, fl: rnd() < 0.25 ? 1 : 0, c: cem ? [0.7, 0.85, 1] : [1, 0.8, 0.35], y: 3.6, pole: 1 });
  if (cem) F.props.forEach(function (p) { if (p.k === 'grave' && rnd() < 0.08) F.lights.push({ i: p.i, j: p.j + 0.4, k: 0.55, r: 3.5, fl: 2, c: [1, 0.55, 0.2], y: 0.4 }); });
  F.lights.push({ i: mid + 0.5, j: 0.4, k: 2, r: 11, fl: 0, c: cem ? [0.7, 0.85, 1] : [1, 0.75, 0.3], y: 3, exit: 1 });
  if (!cem) F.neons.push({ i: mid - 1, j: last, d: 2, k: 'n_dig', y: 2.2, o: 0 });
  lvlFill(F, rnd, th, used, bfs(F, mid, last), 12);
  return F;
}
function genCemetery(fi, seed) { return genYard(fi, seed, 'cemetery'); }
function genSite(fi, seed) { return genYard(fi, seed, 'site'); }
