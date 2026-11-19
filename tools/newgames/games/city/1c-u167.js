/* ---------- update 167 (his playtest: grass, fences and deer all over city streets, the HUD saying THE OUTSKIRTS) ----------
   The map's districts stop short of the town's last blocks, so those blocks sat in the countryside district: the ground
   left over round their buildings was made grass, the 165 pavement code turns pavement beside grass into grass, and the
   grass got bushes, fences and wildlife. Here every town block (ground closed in by roads with a pavement round it) that
   lies in the countryside joins the nearest town district: leftover grass round buildings becomes the town's lot ground
   or pavement, a block with no buildings becomes a small park (trees, no fences, no animals), and the roads round it take
   that district too (name, ground, street furniture). Real countryside (huge areas, no pavements) is left alone. */
(function () {
  var TOWN = /^(downtown|redlight|cafe|labs|lab|industrial|docks|site|suburb|factory)$/;
  function sty(t) { return DIST[DM[t]].style; }
  function wall(k) { return k === K_ROAD || k === K_BRIDGE || isWaterK(k); }
  function nextTo(i, j, kind) { for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) { var ni = i + di, nj = j + dj; if ((di || dj) && ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === kind) return true; } return false; }
  function nearTown(cx, cz, R) { for (var r = 1; r < R; r++) for (var dj = -r; dj <= r; dj++) for (var di = -r; di <= r; di++) { if (Math.abs(di) !== r && Math.abs(dj) !== r) continue; var i = cx + di, j = cz + dj; if (i < 0 || j < 0 || i >= MW || j >= MH) continue; var t = j * MW + i; if (TOWN.test(sty(t))) return DM[t]; } return -1; }
  /* the town district most of the block's surroundings belong to (a block between the red light district and the cafe
     streets goes with whichever has more of the streets round it) */
  function townOf(list) { var C = {}, best = -1, bn = 0, step = Math.max(1, Math.floor(list.length / 60)), want = null;
    /* the nearest building says what kind of street this is (a PEEP SHOW block is the red light district) */
    var mid = list[list.length >> 1], mi = mid % MW, mj = (mid - mi) / MW;
    for (var r = 0; r < 40 && !want; r++) for (var dj = -r; dj <= r && !want; dj++) for (var di = -r; di <= r; di++) { if (Math.abs(di) !== r && Math.abs(dj) !== r) continue; var ii = mi + di, jj = mj + dj; if (ii < 0 || jj < 0 || ii >= MW || jj >= MH) continue; var b = BI[jj * MW + ii]; if (b >= 0 && BLD[b].style) { want = BLD[b].style === 'lab' ? 'labs' : BLD[b].style; break; } }
    for (var n = 0; n < list.length; n += step) { var t = list[n], ci = t % MW, cj = (t - ci) / MW;
      for (var dj = -12; dj <= 12; dj += 2) for (var di = -12; di <= 12; di += 2) { var i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= MW || j >= MH) continue; var tt = j * MW + i; if (TOWN.test(sty(tt))) C[DM[tt]] = (C[DM[tt]] || 0) + (sty(tt) === want ? 50 : 1); } }
    for (var k in C) if (C[k] > bn) { bn = C[k]; best = +k; }
    if (best < 0) { best = nearTown(mid % MW, (mid - mid % MW) / MW, 45); } return best; }
  var BT = new Uint8Array(MW * MH), BI = new Int32Array(MW * MH).fill(-1); BLD.forEach(function (b, bi) { for (var j = Math.max(0, Math.floor(b.z0 / CT)); j <= Math.min(MH - 1, Math.floor((b.z1 - 0.01) / CT)); j++) for (var i = Math.max(0, Math.floor(b.x0 / CT)); i <= Math.min(MW - 1, Math.floor((b.x1 - 0.01) / CT)); i++) { BT[j * MW + i] = 1; BI[j * MW + i] = bi; } });
  var comp = new Int32Array(MW * MH).fill(-1), nc = 0, fixed = 0, done = [];
  for (var t0 = 0; t0 < MW * MH; t0++) { if (comp[t0] >= 0 || wall(KM[t0]) || sty(t0) !== 'country') continue;
    /* flood the block this tile is in, bounded by roads and water */
    var list = [t0], head = 0, pave = 0, bld = 0; comp[t0] = nc;
    while (head < list.length) { var t = list[head++], i = t % MW, j = (t - i) / MW; if (KM[t] === K_PAVE) pave++; if (BT[t]) bld++;
      var N = [i > 0 ? t - 1 : -1, i < MW - 1 ? t + 1 : -1, j > 0 ? t - MW : -1, j < MH - 1 ? t + MW : -1];
      for (var q = 0; q < 4; q++) { var tn = N[q]; if (tn < 0 || comp[tn] >= 0 || wall(KM[tn])) continue; comp[tn] = nc; list.push(tn); } }
    nc++;
    if (list.length > 1500 || pave < 16 || pave < list.length * 0.08) continue;
    var tgt = townOf(list); if (tgt < 0) continue;
    list.forEach(function (t) { var i = t % MW, j = (t - i) / MW, k = KM[t];
      if (sty(t) === 'country') { DM[t] = tgt; fixed++; }
      if (k === K_GRASS || k === K_FIELD || k === K_DIRT || k === K_FOREST) KM[t] = bld ? K_PAVE : K_PARK;
      if (KM[t] === K_PAVE) done.push([i, j, tgt]); });
  }
  /* the roads round those blocks belong to the town too */
  var seen = {}, Q = done.map(function (e) { return [e[0], e[1], 0, e[2]]; }), h = 0;
  while (h < Q.length) { var e = Q[h++], t2 = e[1] * MW + e[0]; if (seen[t2]) continue; seen[t2] = 1;
    if (KM[t2] === K_ROAD && sty(t2) === 'country') { DM[t2] = e[3]; fixed++; }
    if (e[2] >= 4) continue;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (n) { var ni = e[0] + n[0], nj = e[1] + n[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var tn = nj * MW + ni; if (!seen[tn] && KM[tn] === K_ROAD) Q.push([ni, nj, e[2] + 1, e[3]]); }); }
  window.U167FIX = fixed;
})();
