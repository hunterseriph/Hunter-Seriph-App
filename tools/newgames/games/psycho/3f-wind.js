/* =====================================================================================================
   UPDATE 131 (his ask: "some of the later sections you can just walk a straight line to get out, there needs to be
   more of a path going round the level and make the later areas bigger; the city needs to feel more like a city,
   with roads"). Shared helpers for the outside levels:
   windClose  shuts whole stretches of road/lane, keeping only the ones that make the way to the exit longer and
              never cutting anything off (dead ends are fine, sealed pockets are not);
   windBands  lays long barriers (tree lines, hedges, hoardings) right across the map with the gap at alternating
              ends, so the route zig-zags side to side all the way up;
   paintRoads gives Cum City's streets pavements, three lanes with a dashed middle line, zebra crossings before
              every junction; kerbs and traffic lights are added to the mesh by roadMesh.
   ===================================================================================================== */
function windClose(F, rnd, segs, s, e, used, mark, frac) {
  var K = F.K; function reachOf(D) { var n = 0; for (var q = 0; q < D.length; q++) if (D[q] >= 0) n++; return n; }
  var D = bfs(F, s[0], s[1]), cur = D[idx(e[0], e[1])], reach = reachOf(D), max = Math.floor(segs.length * (frac || 0.45)), done = 0;
  var order = segs.slice(); for (var pass = 0; pass < 3; pass++) { order.sort(function () { return rnd() - 0.5; });
    for (var n = 0; n < order.length && done < max; n++) { var cl = order[n];
      if (cl.some(function (p) { return !inMap(p[0], p[1]) || K[idx(p[0], p[1])] !== KC || used[idx(p[0], p[1])]; })) continue;
      cl.forEach(function (p) { K[idx(p[0], p[1])] = KW; }); var D2 = bfs(F, s[0], s[1]), d2 = D2[idx(e[0], e[1])], r2 = reachOf(D2);
      if (d2 < 0 || r2 < reach - cl.length || !(d2 > cur || (d2 === cur && rnd() < 0.15))) { cl.forEach(function (p) { K[idx(p[0], p[1])] = KC; }); continue; }
      cl.forEach(function (p) { var k = idx(p[0], p[1]); used[k] = 1; mark(k); }); cur = d2; reach = r2; done++; } }
  F.windLen = cur; return cur;
}
function windBands(F, rnd, s, e, nb, used, mark, ok) {
  var K = F.K, sp = (s[1] - e[1]) / (nb + 1), flip = rnd() < 0.5 ? 1 : 0; F.bandRows = {};
  for (var b = 1; b <= nb; b++) { var y = Math.round(e[1] + sp * b), left = (b + flip) % 2 === 0, g0 = left ? 2 : MW - 6, g1 = g0 + 4; F.bandRows[y] = 1;
    for (var x = 1; x < MW - 1; x++) { var k = idx(x, y); if (x >= g0 && x < g1) { for (var yy = y - 2; yy <= y + 2; yy++) if (inMap(x, yy) && yy > 0 && yy < MH - 1) { var k2 = idx(x, yy); if (K[k2] === KW && !(F.BT && F.BT[k2] && yy !== y)) { K[k2] = KC; if (F.BT) delete F.BT[k2]; } used[k2] = 1; } continue; }
      if (ok && !ok(k, x, y)) continue; K[k] = KW; used[k] = 1; mark(k); } }
}
function roadAt(F, i, j) { var R = F.roads, ro = -1, co = -1; if (!R) return [-1, -1]; R.rows.forEach(function (r) { if (j >= r && j < r + R.sw) ro = j - r; }); R.cols.forEach(function (c) { if (i >= c && i < c + R.sw) co = i - c; }); return [ro, co]; }
function roadJ(F, i, j) { var a = roadAt(F, i, j); return (a[0] >= 0 ? 1 : 0) + (a[1] >= 0 ? 2 : 0); }
function paintRoads(F) {
  var R = F.roads, sw = R.sw, K = F.K;
  function nearJ(i, j, dx, dy) { return roadJ(F, i + dx, j + dy) === 3; }
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { var k = idx(i, j), kk = K[k]; if (kk === KW || kk === KR || kk === KD) continue; var a = roadAt(F, i, j), ro = a[0], co = a[1], t = null;
    if (ro >= 0 && co >= 0) t = (ro === 0 || ro === sw - 1) && (co === 0 || co === sw - 1) ? 'pave' : 'roadx';
    else if (ro >= 0) t = ro === 0 || ro === sw - 1 ? 'pave' : (nearJ(i, j, 1, 0) || nearJ(i, j, -1, 0)) ? 'zebrah' : ro === (sw >> 1) ? 'roadh' : 'road';
    else if (co >= 0) t = co === 0 || co === sw - 1 ? 'pave' : (nearJ(i, j, 0, 1) || nearJ(i, j, 0, -1)) ? 'zebrav' : co === (sw >> 1) ? 'roadv' : 'road';
    if (t && !F.FT[k]) F.FT[k] = t; }
}
function isRoadT(t) { return t === 'road' || t === 'roadh' || t === 'roadv' || t === 'roadx' || t === 'zebrah' || t === 'zebrav'; }
function roadMesh(F, H) { // kerb stones along every pavement edge, traffic lights at the junction corners, the roadblocks dressed
  if (!F.roads) return; var boxM = H.boxM, KT = TL('kerb'), MT = TL('metal'), R = F.roads, sw = R.sw;
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) { var k = idx(i, j); if (F.FT[k] !== 'pave' || F.K[k] === KW) continue; var x0 = i * TSZ, z0 = j * TSZ;
    DIRS.forEach(function (q) { var nk = idx(i + q[0], j + q[1]); if (!isRoadT(F.FT[nk]) || F.K[nk] === KW) return; var t = 0.16, h = 0.12;
      if (q[0] > 0) boxM(x0 + TSZ - t, 0, z0, x0 + TSZ, h, z0 + TSZ, KT, 0.9); else if (q[0] < 0) boxM(x0, 0, z0, x0 + t, h, z0 + TSZ, KT, 0.9);
      else if (q[1] > 0) boxM(x0, 0, z0 + TSZ - t, x0 + TSZ, h, z0 + TSZ, KT, 0.9); else boxM(x0, 0, z0, x0 + TSZ, h, z0 + t, KT, 0.9); }); }
  R.rows.forEach(function (r) { R.cols.forEach(function (c) { [[c - 1, r - 1], [c + sw, r - 1], [c - 1, r + sw], [c + sw, r + sw]].forEach(function (p, n) { if (!inMap(p[0], p[1]) || F.K[idx(p[0], p[1])] === KW || (r * 7 + c * 3 + n) % 2) return;
    var x = tx(p[0]) + (n % 2 ? -0.9 : 0.9), z = tx(p[1]) + (n < 2 ? 0.9 : -0.9); boxM(x - 0.07, 0, z - 0.07, x + 0.07, 3.1, z + 0.07, MT, 0.55); boxM(x - 0.18, 3.1, z - 0.18, x + 0.18, 3.9, z + 0.18, MT, 0.35);
    var lc = ['#ff2630', '#ffb020', '#30ff70'][(r + c + n) % 3]; boxM(x - 0.12, 3.62 - ((r + c + n) % 3) * 0.24, z - 0.19, x + 0.12, 3.8 - ((r + c + n) % 3) * 0.24, z + 0.19, TL('glow'), 1.6); }); }); });
}
