/* ---------- update 160 (his playtest): smooth bridges, Cum Hills lived in, the pavement you stand on, signs that
   don't flicker, chunks that don't vanish at an angle ---------- */

/* ---- bridges: the deck follows the road itself instead of the 4 m tiles under it (they stepped in a staircase on
   bridges that cross at an angle). Spans are found along every road edge where the middle of the road is over a
   bridge tile or water; the tiles they cover are drawn as water under the deck. ---- */
var BSPAN = [], BCOV = new Uint8Array(MW * MH);
(function () {
  RE.forEach(function (E) { if (E.off || E.len < 6) return; var on = [], L = E.len;
    for (var s = 0; s <= L; s += 1) { var p = edgeAt(E, s, false, 0), k = kAt(p.x, p.z); on.push(k === K_BRIDGE || isWaterK(k)); }
    var i = 0; while (i < on.length) { if (!on[i]) { i++; continue; } var j = i; while (j < on.length && on[j]) j++; if (j - i >= 3) BSPAN.push({ E: E, s0: Math.max(0, i - 7), s1: Math.min(L, j + 6) }); i = j; } });
  BSPAN.forEach(function (S) { var E = S.E, P2 = [], n = Math.max(2, Math.ceil((S.s1 - S.s0) / 1.5));
    for (var q = 0; q <= n; q++) { var s = S.s0 + (S.s1 - S.s0) * q / n, p = edgeAt(E, s, false, 0), k = kAt(p.x, p.z); P2.push({ x: p.x, z: p.z, dx: p.dx, dz: p.dz, s: s, y: isWaterK(k) ? NaN : groundY(p.x, p.z) }); }
    // fill the heights over open water from the ends, then smooth
    var known = P2.filter(function (p) { return !isNaN(p.y); }); if (!known.length) known = [{ s: 0, y: 6.5 }];
    P2.forEach(function (p) { if (!isNaN(p.y)) return; var a = null, b = null; known.forEach(function (k) { if (k.s <= p.s) a = k; if (k.s >= p.s && !b) b = k; }); p.y = a && b ? (a.s === b.s ? a.y : a.y + (b.y - a.y) * (p.s - a.s) / (b.s - a.s)) : (a || b).y; });
    for (var r = 0; r < 12; r++) for (var q2 = 1; q2 < P2.length - 1; q2++) P2[q2].y = (P2[q2 - 1].y + P2[q2].y * 2 + P2[q2 + 1].y) / 4;
    S.pts = P2; S.hw = E.w / 2;
    // cover the bridge tiles under it (and a little round it)
    P2.forEach(function (p) { for (var o = -S.hw - 3; o <= S.hw + 3; o += 1) { var x = p.x - p.dz * o, z = p.z + p.dx * o, i2 = Math.floor(x / CT), j2 = Math.floor(z / CT); if (i2 < 0 || j2 < 0 || i2 >= MW || j2 >= MH) continue; var t = j2 * MW + i2; if (KM[t] === K_BRIDGE) BCOV[t] = 1; } });
    // the deck is solid wherever it reaches, even over water tiles at its edge
    for (var q3 = 0; q3 < P2.length - 1; q3++) (function (a, b) { var hw = S.hw + 0.2, x0 = Math.min(a.x, b.x) - hw, x1 = Math.max(a.x, b.x) + hw, z0 = Math.min(a.z, b.z) - hw, z1 = Math.max(a.z, b.z) + hw, dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1, l = Math.sqrt(l2);
      var bx = addBox(x0, z0, x1, z1, Math.min(a.y, b.y) - 0.3, Math.min(a.y, b.y) - 0.2, { deck: 1 });
      bx.ramp = function (x, z) { var t = ((x - a.x) * dx + (z - a.z) * dz) / l2; if (t < -0.02 || t > 1.02) return -999; var lat = Math.abs((x - a.x) * dz - (z - a.z) * dx) / l; if (lat > hw) return -999; return a.y + (b.y - a.y) * clamp(t, 0, 1) + 0.03; }; })(P2[q3], P2[q3 + 1]);
  });
})();
function underBridge(WAT, M0, i, j) { // a covered bridge tile: the water under the deck
  var ax = i * CT, az = j * CT, bx = ax + CT, bz = az + CT, cream = false;
  for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) { var ni = i + di, nj = j + dj; if (ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === K_CREAM) cream = true; }
  var wy = cream ? CREAMY : WATERY; WAT.quad([ax, wy, az], [ax, wy, bz], [bx, wy, bz], [bx, wy, az], UV1, TL(cream ? 'cream' : 'water'), cream ? [0.55, 0.55, 0.55] : [0.5, 0.5, 0.5], [0, 1, 0], cream ? 0.15 : 0);
  M0.quad([ax, -1.6, az], [ax, -1.6, bz], [bx, -1.6, bz], [bx, -1.6, az], UV1, TL(cream ? 'dirt' : 'sand'), [0.3, 0.3, 0.3], [0, 1, 0]);
}
function bridgeDress(M0, x0, z0, CS, first) {
  BSPAN.forEach(function (S) { var P2 = S.pts, hw = S.hw, d = dAt(P2[0].x, P2[0].z), RT = TL(groundTile(K_ROAD, d));
    for (var q = 0; q < P2.length - 1; q++) { var a = P2[q], b = P2[q + 1], mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2; if (mx < x0 || mx >= x0 + CS || mz < z0 || mz >= z0 + CS) continue;
      var na = [-a.dz, a.dx], nb = [-b.dz, b.dx], ya = a.y + 0.05, yb = b.y + 0.05, seg = Math.hypot(b.x - a.x, b.z - a.z);
      function L(p, n, o, y) { return [p.x + n[0] * o, y, p.z + n[1] * o]; }
      // the deck (road surface), its underside and the girders down each side
      M0.quad(L(a, na, -hw, ya), L(b, nb, -hw, yb), L(b, nb, hw, yb), L(a, na, hw, ya), [0, seg / 4, 1, seg / 4, 1, 0, 0, 0], RT, lit([0, 1, 0]), [0, 1, 0]);
      M0.quad(L(a, na, hw + 0.25, ya - 1.3), L(b, nb, hw + 0.25, yb - 1.3), L(b, nb, -hw - 0.25, yb - 1.3), L(a, na, -hw - 0.25, ya - 1.3), UV1, TL('metal'), litc('#3a1a18', [0, -1, 0]), [0, -1, 0]);
      [-1, 1].forEach(function (sd) { var o = sd * (hw + 0.25), nn = [na[0] * sd, 0, na[1] * sd];
        M0.quad(L(a, na, o, ya - 1.3), L(b, nb, o, yb - 1.3), L(b, nb, o, yb + 0.1), L(a, na, o, ya + 0.1), uvR(seg / 4, 0.4), TL('metal'), litc('#7a2a24', nn), nn);
        M0.quad(L(a, na, sd * hw, ya + 0.1), L(b, nb, sd * hw, yb + 0.1), L(b, nb, o, yb + 0.1), L(a, na, o, ya + 0.1), UV1, TL('metal'), litc('#5a2a24', [0, 1, 0]), [0, 1, 0]);
        // railings: bars between a top and bottom rail, a post at each end of the piece
        var r0 = sd * (hw + 0.12);
        M0.quad(L(a, na, r0, ya + 0.1), L(b, nb, r0, yb + 0.1), L(b, nb, r0, yb + 1.0), L(a, na, r0, ya + 1.0), uvR(seg / 4, 0.3), TL('bars'), litc('#c4121c', nn), nn);
        var ta = L(a, na, r0, ya + 1.02), tb = L(b, nb, r0, yb + 1.02); tub(M0, ta, tb, 0.06, 0.06, '#8a1018', 5);
        tub(M0, L(a, na, r0, ya + 0.1), L(a, na, r0, ya + 1.08), 0.06, 0.06, '#5a0a10', 5);
        if (first) for (var u = 0; u <= 1.001; u += 0.5) { var px = a.x + (b.x - a.x) * u + na[0] * r0, pz = a.z + (b.z - a.z) * u + na[1] * r0, py = ya + (yb - ya) * u; addPost(px, pz, 0.28, py - 0.2, py + 1.1, { rail: 1 }); } });
      // a pier every 14 m, down into the water
      if (Math.floor(a.s / 14) !== Math.floor(b.s / 14) && (a.elev > 0.3 || isWaterK(kAt(mx, mz)))) bridgePier(M0, S, a, b, first); /* update 162: columns and beams, not a wall */
    } });
}

/* ---- the pavement is 15 cm up: you stand on it now (feet went through it) ---- */
var PAVEC = new Int8Array(MW * MH); // 0 unknown, 1 raised all over, 2 cut by the road edge (ask roadF), 3 flat
function paveKind(i, j) { var t = j * MW + i; if (PAVEC[t]) return PAVEC[t]; var k = KM[t], v = 3;
  if (k === K_PAVE || k === K_ROAD) { var ax = i * CT, az = j * CT, f = [roadF(ax, az), roadF(ax + CT, az), roadF(ax, az + CT), roadF(ax + CT, az + CT)], allOut = f.every(function (q) { return q >= 0; }), allIn = f.every(function (q) { return q < 0; });
    var paveN = k === K_PAVE || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (q) { var ni = i + q[0], nj = j + q[1]; return ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === K_PAVE; });
    if (k === K_PAVE) v = allOut ? 1 : allIn ? 1 : 2; else v = !paveN || allIn ? 3 : 2; if (k === K_PAVE && allIn) v = 1;
    if (k === K_PAVE) { var g2 = f.map(function (q) { return q - PAVEW; }); if (!g2.every(function (q) { return q <= 0; }) && !g2.every(function (q) { return q > 0; })) v = 4; } }
  PAVEC[t] = v; return v; }
(function () { var sy = standY; standY = function (x, z, y) { var g = sy(x, z, y); if (G.interior || window.NOPAVE) return g; var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i < 0 || j < 0 || i >= MW || j >= MH) return g;
  var pk = paveKind(i, j); if (pk === 3) return g; var gy = groundY(x, z); if (g > gy + 0.1) return g; if (pk === 1) return gy + 0.15; var rf = roadF(x, z); if (rf >= 0 && (pk !== 4 || rf <= PAVEW)) return gy + 0.15; return g; }; })();

/* ---- chunks: how far their buildings reach (a tall block centred in one chunk could stick out of view and vanish) ---- */
function chunkR(x0, z0, CS) { var cx = x0 + CS / 2, cz = z0 + CS / 2, r = CS * 0.72;
  near(BGRID, cx, cz, CS * 0.75).forEach(function (b) { var mx = (b.x0 + b.x1) / 2, mz = (b.z0 + b.z1) / 2; if (mx < x0 || mx >= x0 + CS || mz < z0 || mz >= z0 + CS) return; [[b.x0, b.z0], [b.x1, b.z0], [b.x0, b.z1], [b.x1, b.z1]].forEach(function (c) { r = Math.max(r, Math.hypot(c[0] - cx, c[1] - cz) + 2); }); });
  return r; }

/* ---- signs: a real board with the words a little off each face (the two faces sat 3 cm apart and flickered) ---- */
function sign(m, glow, x, z, a, y, txt, w, post) { var c = Math.cos(a), s = Math.sin(a);
  if (post !== false) { var g0 = groundY(x + c * w * 0.42, z - s * w * 0.42), g1 = groundY(x - c * w * 0.42, z + s * w * 0.42); y = Math.max(g0, g1); /* update 161: stands on the ground (some were sunk into it) */ [[-w * 0.42, g1], [w * 0.42, g0]].forEach(function (q) { var u = q[0]; boxC(m, x + c * u - 0.07, Math.min(q[1], y) - 0.3, z - s * u - 0.07, x + c * u + 0.07, y + 1.6 + w * 0.42 + 0.1, z - s * u + 0.07, '#3a2a1a'); }); }
  boxR(m, x, z, a, w / 2 + 0.05, 0.06, y + 1.55, y + 1.65 + w * 0.42, '#2a1a12');
  standQ(glow || m, x + s * 0.075, z + c * 0.075, a, w, y + 1.6, y + 1.6 + w * 0.42, TL(txt), 1.3, 0.3, SGUV); standQ(glow || m, x - s * 0.075, z - c * 0.075, a + Math.PI, w, y + 1.6, y + 1.6 + w * 0.42, TL(txt), 1.3, 0.3, SGUV); }

/* ---- Cum Hills looks lived in: a path to every front door, a drive with a car on it, a garden fence or hedge,
   bins, a letterbox, flower beds, a porch light, and round the back a shed or a washing line ---- */
var HDONE = {};
(function () { var bd = building; building = function (m, night, fr, glow, b, lamps) { bd(m, night, fr, glow, b, lamps); if (b.style === 'house' || b.style === 'suburb') houseDress(m, glow, b); }; })();
function bldAt(x, z) { var ls = near(BGRID, x, z, 1); for (var k = 0; k < ls.length; k++) { var q = ls[k]; if (x > q.x0 - 0.3 && x < q.x1 + 0.3 && z > q.z0 - 0.3 && z < q.z1 + 0.3) return q; } return null; }
var DRIVES = [];
function houseDress(m, glow, b) {
  var F = frontFace(b), nx = F.n[0], nz = F.n[2], ux = F.R[0] - F.L[0], uz = F.R[1] - F.L[1], wF = Math.hypot(ux, uz) || 1, mx = (F.L[0] + F.R[0]) / 2, mz = (F.L[1] + F.R[1]) / 2, first = !HDONE[b.i], d = dAt(mx, mz);
  ux /= wF; uz /= wF; HDONE[b.i] = 1;
  var D = 0; for (var s = 0.5; s < 16; s += 0.25) { var k = kAt(mx + nx * s, mz + nz * s); if (k === K_PAVE || k === K_ROAD || k === K_BRIDGE) { D = s; break; } if (bldAt(mx + nx * s, mz + nz * s)) break; } if (!D) D = 4;
  function at(t, s2) { return [mx + ux * t + nx * s2, mz + uz * t + nz * s2]; }
  function flat(t0, t1, s0, s1, T, lift, uv) { var p0 = at(t0, s0), p1 = at(t1, s0), p2 = at(t1, s1), p3 = at(t0, s1); m.quad([p0[0], groundY(p0[0], p0[1]) + lift, p0[1]], [p1[0], groundY(p1[0], p1[1]) + lift, p1[1]], [p2[0], groundY(p2[0], p2[1]) + lift, p2[1]], [p3[0], groundY(p3[0], p3[1]) + lift, p3[1]], uv || UV1, T, lit([0, 1, 0]), [0, 1, 0]); }
  var r1 = hash2(b.i, 21, 1), r2 = hash2(b.i, 22, 2), r3 = hash2(b.i, 23, 3), r4 = hash2(b.i, 24, 4), a = Math.atan2(nx, nz);
  // the path: stepping slabs from the door to the pavement
  for (var s3 = 0.15; s3 < D - 0.1; s3 += 0.95) flat(-0.55, 0.55, s3, Math.min(D, s3 + 0.75), TL('paver'), 0.04, uvR(0.6, 0.4));
  // the drive, on whichever side is free
  var side = 0; [r1 < 0.5 ? -1 : 1, r1 < 0.5 ? 1 : -1].some(function (sd) { var c = wF / 2 + 1.7, p = at(sd * c, -2.5); if (!bldAt(p[0], p[1]) && !bldAt(at(sd * c, -0.5)[0], at(sd * c, -0.5)[1])) { side = sd; return true; } return false; });
  if (side) { var tc = side * (wF / 2 + 1.7); flat(tc - 1.35, tc + 1.35, -4.5, D, TL(groundTile(K_ROAD, d)), 0.035, uvR(0.7, (D + 4.5) / 4));
    if (r2 < 0.62 && !(b.shop && b.shop.indexOf('home') === 0) && first) { var cp = at(tc, -1.6); /* update 169: a real car you can get in, made when you come near (DRIVES, stepDrives) */ DRIVES.push({ x: cp[0], z: cp[1], a: a + (r4 < 0.5 ? Math.PI : 0), c: Math.floor(r3 * 7), b: b.i }); }
    // two wheelie bins by the drive
    for (var q = 0; q < 2; q++) { var bp = at(tc + side * 1.75, 0.3 + q * 0.75), by = groundY(bp[0], bp[1]), bc = ['#2a3a2a', '#3a3a5a', '#5a2a1a'][Math.floor((r4 + q * 0.4) * 3) % 3]; boxR(m, bp[0], bp[1], a, 0.3, 0.33, by, by + 1.0, bc); boxR(m, bp[0], bp[1], a, 0.32, 0.37, by + 1.0, by + 1.08, bc); } }
  // the fence or hedge along the front, with a gap for the path and the drive
  var fs = D - 0.45, half = wF / 2 + (side ? 0.2 : 1.2), hedge = r4 < 0.45, gaps = [[-0.75, 0.75]]; if (side) gaps.push([side * (wF / 2 + 1.7) - 1.45, side * (wF / 2 + 1.7) + 1.45]);
  var left = side < 0 ? -(wF / 2 + 3.3) : -half, right = side > 0 ? wF / 2 + 3.3 : half;
  for (var t = left; t < right - 0.01; t += 0.5) { var t2 = Math.min(right, t + 0.5), tm = (t + t2) / 2; if (gaps.some(function (g) { return tm > g[0] && tm < g[1]; })) continue; var p0 = at(t, fs), p1 = at(t2, fs), gy = groundY((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    if (hedge) boxT(m, Math.min(p0[0], p1[0]) - Math.abs(nx) * 0.3, gy, Math.min(p0[1], p1[1]) - Math.abs(nz) * 0.3, Math.max(p0[0], p1[0]) + Math.abs(nx) * 0.3, gy + 0.9, Math.max(p0[1], p1[1]) + Math.abs(nz) * 0.3, { wall: 'hedge', top: 'hedge', u: 0.5, v: 0.5 });
    else { boxC(m, Math.min(p0[0], p1[0]) - Math.abs(nx) * 0.04, gy + 0.55, Math.min(p0[1], p1[1]) - Math.abs(nz) * 0.04, Math.max(p0[0], p1[0]) + Math.abs(nx) * 0.04, gy + 0.62, Math.max(p0[1], p1[1]) + Math.abs(nz) * 0.04, '#e8e0d0'); boxC(m, p0[0] - 0.05, gy, p0[1] - 0.05, p0[0] + 0.05, gy + 0.8, p0[1] + 0.05, '#f1e7d0'); var pm = at(tm, fs); boxC(m, pm[0] - 0.04, gy, pm[1] - 0.04, pm[0] + 0.04, gy + 0.72, pm[1] + 0.04, '#f1e7d0'); } }
  // a letterbox by the gate, a porch light, flower beds under the front windows
  var lb = at(1.0, fs + 0.1), ly = groundY(lb[0], lb[1]); boxC(m, lb[0] - 0.04, ly, lb[1] - 0.04, lb[0] + 0.04, ly + 1.0, lb[1] + 0.04, '#3a2a1a'); boxR(m, lb[0], lb[1], a, 0.14, 0.22, ly + 1.0, ly + 1.3, ['#c4121c', '#12040a', '#2a4a6a'][Math.floor(r2 * 3)]);
  var pl = at(0.8, 0.12); boxC(m, pl[0] - 0.08, b.y0 + 2.1, pl[1] - 0.08, pl[0] + 0.08, b.y0 + 2.4, pl[1] + 0.08, '#12040a'); ell(glow, pl[0], b.y0 + 2.25, pl[1], 0.07, 0.1, 0.07, '#ffd890', 6, 3);
  [-1, 1].forEach(function (sd) { var t0 = sd * 1.4, t1 = sd * (wF / 2 - 0.5); flat(Math.min(t0, t1), Math.max(t0, t1), 0.05, 0.8, TL('dirt'), 0.03); for (var f = 0; f < 6; f++) { var fp = at(t0 + (t1 - t0) * (f + 0.5) / 6, 0.42), fy = groundY(fp[0], fp[1]); ell(m, fp[0], fy + 0.2, fp[1], 0.18, 0.2, 0.18, f % 2 ? '#2e5222' : '#3a6a2a', 6, 3); ell(m, fp[0], fy + 0.38, fp[1], 0.08, 0.06, 0.08, ['#ffe36a', '#f1e7d0', '#c4121c', '#ff9ab4', '#c48aff'][Math.floor(hash2(b.i, f, 7) * 5)], 5, 2); } });
  // a tree in the front garden now and then
  if (r3 < 0.35 && D > 3.2 && !(b.shop && b.shop.indexOf('home') === 0)) { var tp = at(-side * (wF / 2 - 1.2) || -3, D * 0.55), ty = groundY(tp[0], tp[1]); tree(m, tp[0], ty, tp[1], false, 0.55 + r2 * 0.25); if (first) addPost(tp[0], tp[1], 0.3, ty, ty + 4); }
  // round the back: a shed or a washing line
  var dep = Math.abs(nx) ? b.x1 - b.x0 : b.z1 - b.z0, back = -dep - 2.6, bp2 = at(-wF / 2 + 1.4, back);
  if (!bldAt(bp2[0], bp2[1]) && !bldAt(at(-wF / 2 + 1.4, back - 1.5)[0], at(-wF / 2 + 1.4, back - 1.5)[1])) { var sy2 = groundY(bp2[0], bp2[1]);
    if (r4 > 0.55) { boxR(m, bp2[0], bp2[1], a, 1.1, 0.9, sy2, sy2 + 2.1, '#6a4a2a', 'plank'); boxR(m, bp2[0], bp2[1], a, 1.25, 1.05, sy2 + 2.1, sy2 + 2.25, '#3a2a1a'); if (first) addPost(bp2[0], bp2[1], 1.1, sy2, sy2 + 2.3); }
    else { var w0 = at(-wF / 2 + 1, back), w1 = at(wF / 2 - 1, back), wy0 = groundY(w0[0], w0[1]), wy1 = groundY(w1[0], w1[1]); tub(m, [w0[0], wy0, w0[1]], [w0[0], wy0 + 1.9, w0[1]], 0.04, 0.04, '#8a8a8e', 4); tub(m, [w1[0], wy1, w1[1]], [w1[0], wy1 + 1.9, w1[1]], 0.04, 0.04, '#8a8a8e', 4); tub(m, [w0[0], wy0 + 1.85, w0[1]], [w1[0], wy1 + 1.85, w1[1]], 0.01, 0.01, '#d8d0c0', 3);
      for (var c2 = 0; c2 < 4; c2++) { var u2 = 0.2 + c2 * 0.2, cx2 = w0[0] + (w1[0] - w0[0]) * u2, cz2 = w0[1] + (w1[1] - w0[1]) * u2, cy2 = wy0 + (wy1 - wy0) * u2 + 1.85; boxR(m, cx2, cz2, a + Math.PI / 2, 0.3, 0.02, cy2 - 0.6, cy2, ['#c4121c', '#f1e7d0', '#2a4a6a', '#12040a'][c2]); } } }
}

/* ---- round pavements: the turning circles at the end of each close count as road, and the back edge of the
   pavement is cut along the road's own curve, so neither steps across the grass in 4 m squares any more ---- */
var BULBS = (CITY.bulbs || []).map(function (i) { return RN[i]; }).filter(Boolean), PAVEW = 6.4;
function roadF(x, z) { var r = nearestRoad(x, z, 16), d = r ? r.d - r.E.w / 2 : 99; for (var k = 0; k < BULBS.length; k++) { var b = BULBS[k], dx = b.x - x, dz = b.z - z; if (dx > 40 || dx < -40 || dz > 40 || dz < -40) continue; var e = Math.hypot(dx, dz) - 12; if (e < d) d = e; } return d; }
function paveOuter(M0, NAT, i, j, d, h) {
  var ax = i * CT, az = j * CT, C = [[ax, az], [ax + CT, az], [ax + CT, az + CT], [ax, az + CT]], f = C.map(function (p) { return roadF(p[0], p[1]) - PAVEW; });
  if (f.every(function (v) { return v <= 0; }) || f.every(function (v) { return v > 0; })) return false;
  var nk = -1; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var k2 = KM[nj * MW + ni]; if (k2 === K_GRASS || k2 === K_FOREST || k2 === K_FIELD || k2 === K_PARK || k2 === K_LOT || k2 === K_DIRT) nk = k2; }); if (nk < 0) return false;
  var Hh = [h[0], h[1], h[3], h[2]];
  function hAt(x, z) { var u = (x - ax) / CT, v = (z - az) / CT; return Hh[0] * (1 - u) * (1 - v) + Hh[1] * u * (1 - v) + Hh[2] * u * v + Hh[3] * (1 - u) * v; }
  function clip(sign) { var out = []; for (var q = 0; q < 4; q++) { var a = C[q], b = C[(q + 1) % 4], fa = -f[q] * sign, fb = -f[(q + 1) % 4] * sign; if (fa >= 0) out.push(a); if ((fa >= 0) !== (fb >= 0)) { var t2 = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t2, a[1] + (b[1] - a[1]) * t2]); } } return out; }
  function poly(pts, raise, T, MM) { if (pts.length < 3) return; var n = [0, 1, 0], col = lit(n); for (var q = 1; q < pts.length - 1; q++) { var A = pts[0], B = pts[q], Cc = pts[q + 1]; MM.quad([A[0], hAt(A[0], A[1]) + raise, A[1]], [B[0], hAt(B[0], B[1]) + raise, B[1]], [Cc[0], hAt(Cc[0], Cc[1]) + raise, Cc[1]], [Cc[0], hAt(Cc[0], Cc[1]) + raise, Cc[1]], [(A[0] - ax) / CT, (A[1] - az) / CT, (B[0] - ax) / CT, (B[1] - az) / CT, (Cc[0] - ax) / CT, (Cc[1] - az) / CT, (Cc[0] - ax) / CT, (Cc[1] - az) / CT], T, col, n); } }
  poly(clip(1), 0.15, TL(groundTile(K_PAVE, d)), M0); poly(clip(-1), 0, TL(groundTile(nk, d)), natural(nk) ? NAT : M0);
  var cut = []; for (var q = 0; q < 4; q++) { var fa = f[q], fb = f[(q + 1) % 4]; if ((fa > 0) !== (fb > 0)) { var t3 = fa / (fa - fb), a = C[q], b = C[(q + 1) % 4]; cut.push([a[0] + (b[0] - a[0]) * t3, a[1] + (b[1] - a[1]) * t3]); } }
  if (cut.length >= 2) { var p0 = cut[0], p1 = cut[1], ex = p1[0] - p0[0], ez = p1[1] - p0[1], el = Math.hypot(ex, ez) || 1, nn = [ez / el, 0, -ex / el], mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2; if (roadF(mx + nn[0] * 0.3, mz + nn[2] * 0.3) < PAVEW) nn = [-nn[0], 0, -nn[2]];
    M0.quad([p0[0], hAt(p0[0], p0[1]) - 0.25, p0[1]], [p1[0], hAt(p1[0], p1[1]) - 0.25, p1[1]], [p1[0], hAt(p1[0], p1[1]) + 0.15, p1[1]], [p0[0], hAt(p0[0], p0[1]) + 0.15, p0[1]], uvR(el / 4, 0.1), TL('kerb'), lit(nn), nn); }
  return true; }
