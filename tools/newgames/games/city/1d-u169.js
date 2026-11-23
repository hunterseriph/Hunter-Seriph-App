/* ---------- update 169 (his ask: a big beach with people sunbathing and beach parties): Seamen Beach is widened at load.
   Along the south-east coast, every bit of open ground within about 70 m of the sea (not roads, pavements, buildings or
   the park) becomes sand and part of Seamen Beach. The people, towels, parasols and parties are in 9z-u169e.js. ---- */
(function () {
  var bi = -1; DIST.forEach(function (d, i) { if (d.id === 'beach') bi = i; }); if (bi < 0) return;
  var I0 = 540, I1 = 730, J0 = 520, J1 = 740, R = 18, dist = new Int16Array(MW * MH).fill(999), Q = [];
  for (var j = J0 - R; j < J1 + R; j++) for (var i = I0 - R; i < I1 + R; i++) { if (i < 0 || j < 0 || i >= MW || j >= MH) continue; var t = j * MW + i; if (isWaterK(KM[t]) && DIST[DM[t]].id === 'sea') { dist[t] = 0; Q.push(t); } }
  for (var h = 0; h < Q.length; h++) { var t0 = Q[h], d = dist[t0]; if (d >= R) continue; var i0 = t0 % MW, j0 = (t0 - i0) / MW;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { var ni = i0 + q[0], nj = j0 + q[1]; if (ni < I0 || nj < J0 || ni >= I1 || nj >= J1) return; var tn = nj * MW + ni; if (dist[tn] <= d + 1) return; var k = KM[tn];
      if (!(k === K_GRASS || k === K_FOREST || k === K_FIELD || k === K_DIRT || k === K_SAND || k === K_ROCK)) return; var st = DIST[DM[tn]].style; if (st === 'park' || st === 'downtown' || st === 'docks') return; dist[tn] = d + 1; Q.push(tn); }); }
  var n = 0; for (var t2 = 0; t2 < MW * MH; t2++) if (dist[t2] > 0 && dist[t2] <= R) { KM[t2] = K_SAND; DM[t2] = bi; n++; }
  window.BEACHN = n; })();
