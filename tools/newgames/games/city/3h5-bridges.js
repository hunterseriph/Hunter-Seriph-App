/* ---------- update 162: bridges stand in the air (his ask: suspended on support beams, not ground). The ground the map
   raised under a bridge (an earth causeway) is dug back down to the level either side of it, so there is open air
   under the deck, and nothing is ever left poking up through the deck (those were the brown triangles on the
   Crimson Peak bridge that threw cars about). Piers are pairs of columns with a cap beam and cross bracing. ---------- */
/* update 162 (his ask: hills and edges still need smoothing): natural ground (grass, woods, fields, dirt, sand, rock)
   is blurred twice where every square round a corner is natural, so hills roll instead of faceting; roads, pavements,
   yards, water and buildings keep their heights exactly. */
(function () { var W1 = MW + 1, NAT2 = {}; [K_GRASS, K_FOREST, K_FIELD, K_DIRT, K_SAND, K_ROCK, K_PARK, K_GRAVE].forEach(function (k) { NAT2[k] = 1; });
  var ok = new Uint8Array(CH.length); for (var j = 1; j < MH; j++) for (var i = 1; i < MW; i++) { if (NAT2[KM[j * MW + i]] && NAT2[KM[j * MW + i - 1]] && NAT2[KM[(j - 1) * MW + i]] && NAT2[KM[(j - 1) * MW + i - 1]]) ok[j * W1 + i] = 1; }
  for (var pass = 0; pass < 2; pass++) { var C0 = CH.slice(); for (var u = W1; u < CH.length - W1; u++) { if (!ok[u]) continue; CH[u] = (C0[u] * 4 + C0[u - 1] + C0[u + 1] + C0[u - W1] + C0[u + W1]) / 8 * 0.5 + (C0[u - W1 - 1] + C0[u - W1 + 1] + C0[u + W1 - 1] + C0[u + W1 + 1]) / 4 * 0.5 * 0.5 + C0[u] * 0.25; } } })();
(function () {
  var W1 = MW + 1, CH0 = CH.slice();
  function g0(x, z) { var fx = x / CT, fz = z / CT, i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
    function c(ii, jj) { ii = clamp(ii, 0, MW); jj = clamp(jj, 0, MH); return CH0[jj * W1 + ii]; }
    var a = c(i, j), b = c(i + 1, j), cc = c(i, j + 1), d = c(i + 1, j + 1); return a * (1 - tx) * (1 - tz) + b * tx * (1 - tz) + cc * (1 - tx) * tz + d * tx * tz; }
  var tgt = new Float32Array(CH.length).fill(1e9);
  BSPAN.forEach(function (S) { var hw = S.hw, side = hw + 14;
    S.pts.forEach(function (p) { var nx = -p.dz, nz = p.dx;
      var gL = g0(p.x + nx * side, p.z + nz * side), gR = g0(p.x - nx * side, p.z - nz * side), low = Math.min(gL, gR);
      var e = clamp((p.y - low - 1.5) / 2.5, 0, 1); e = e * e * (3 - 2 * e); e *= clamp(Math.min(p.s - S.s0, S.s1 - p.s) / 8, 0, 1); p.base = low; p.elev = e;
      for (var o = -(hw + 10); o <= hw + 10; o += 0.75) { var x = p.x + nx * o, z = p.z + nz * o, ci = Math.round(x / CT), cj = Math.round(z / CT);
        if (ci < 0 || cj < 0 || ci > MW || cj > MH) continue; var u = cj * W1 + ci, cx = ci * CT, cz = cj * CT;
        var lat = Math.abs((cx - p.x) * nx + (cz - p.z) * nz), along = Math.abs((cx - p.x) * p.dx + (cz - p.z) * p.dz); if (along > 1.2) continue;
        var base = gR + (gL - gR) * clamp((((cx - p.x) * nx + (cz - p.z) * nz) + side) / (2 * side), 0, 1), w = lat <= hw + 2 ? 1 : Math.max(0, 1 - (lat - hw - 2) / 8);
        var h = CH0[u], dug = h - Math.max(0, h - base) * w * e; if (lat <= hw + 1.2) dug = Math.min(dug, p.y - 0.25 * e - 0.02); /* never above the deck */
        if (dug < tgt[u]) tgt[u] = dug; } }); });
  for (var u = 0; u < CH.length; u++) if (tgt[u] < 1e8 && tgt[u] < CH[u]) CH[u] = tgt[u];
})();
/* the piers: two columns, a cap beam under the deck, cross bracing on tall ones */
var PIERH = {};
function bridgePier(M0, S, a, b, first) { var mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, top = Math.min(a.y, b.y) + 0.05 - 1.3, gb = groundY(mx, mz), wy = waterY(mx, mz);
  var foot = Math.min(gb, wy > -50 ? wy : gb) - 1.5, h = top - foot; if (h < 2) return;
  var ang = Math.atan2(a.dx, a.dz), nx = -a.dz, nz = a.dx, off = S.hw * 0.62, cols = [-1, 1].map(function (sd) { return [mx + nx * off * sd, mz + nz * off * sd]; });
  boxR(M0, mx, mz, ang, S.hw + 0.5, 0.6, top - 0.9, top, '#6a1a1c'); // cap beam
  boxR(M0, mx, mz, ang, S.hw + 0.6, 0.7, top - 0.12, top, '#3a0a0e');
  cols.forEach(function (c) { tub(M0, [c[0], foot, c[1]], [c[0], top - 0.85, c[1]], 0.55, 0.45, '#7a7378', 10); tub(M0, [c[0], foot, c[1]], [c[0], Math.min(top - 1, foot + 2.2), c[1]], 0.8, 0.8, '#5a5458', 10);
    if (first) addPost(c[0], c[1], 0.6, foot, top, { pier: 1 }); });
  // cross bracing every 5 m of height, and a tie beam at each level
  for (var y = foot + 2.5; y + 5 <= top - 0.8; y += 5) { var A = cols[0], B = cols[1];
    tub(M0, [A[0], y, A[1]], [B[0], y + 5, B[1]], 0.14, 0.14, '#8a1018', 5); tub(M0, [B[0], y, B[1]], [A[0], y + 5, A[1]], 0.14, 0.14, '#8a1018', 5);
    tub(M0, [A[0], y + 5, A[1]], [B[0], y + 5, B[1]], 0.2, 0.2, '#5a0a10', 5); }
}
