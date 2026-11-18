/* ---------- update 161: smooth shores (he said the beaches and the river looked like Minecraft). The ground near
   water is reshaped from a blurred water mask, so the waterline is where that smooth field crosses the middle, not
   the edge of a 4 m tile; the water is drawn on any land tile that dips under it (SHOREWL). Roads, pavements,
   bridges, piers, yards and buildings keep their ground. ---------- */
var SHOREWL = new Float32Array(MW * MH).fill(-99);
(function () {
  var CW = MW + 1, CHH = MH + 1, N = CW * CHH, s = new Float32Array(N), tmp = new Float32Array(N), lock = new Uint8Array(N), cream = new Uint8Array(N);
  for (var j = 0; j < CHH; j++) for (var i = 0; i < CW; i++) { var w = 0, n = 0, c = 0;
    for (var dj = -1; dj <= 0; dj++) for (var di = -1; di <= 0; di++) { var a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= MW || b >= MH) continue; var k = KM[b * MW + a]; n++;
      if (isWaterK(k)) { w++; if (k === K_CREAM) c = 1; } if (k === K_ROAD || k === K_PAVE || k === K_BRIDGE || k === K_PIER || k === K_YARD || k === K_LOT || k === K_RUNWAY) lock[j * CW + i] = 1; }
    s[j * CW + i] = n ? w / n : 0; cream[j * CW + i] = c; }
  BLD.forEach(function (b) { if (!(b.h > 0)) return; for (var j = Math.floor(b.z0 / CT); j <= Math.ceil(b.z1 / CT); j++) for (var i = Math.floor(b.x0 / CT); i <= Math.ceil(b.x1 / CT); i++) if (i >= 0 && j >= 0 && i < CW && j < CHH) lock[j * CW + i] = 1; });
  // a soft blur (three passes of a 5-wide box each way, about two tiles of spread)
  function pass(src, dst, dx, dy) { for (var j = 0; j < CHH; j++) for (var i = 0; i < CW; i++) { var t = 0, n = 0; for (var q = -3; q <= 3; q++) { var a = i + q * dx, b = j + q * dy; if (a < 0 || b < 0 || a >= CW || b >= CHH) continue; t += src[b * CW + a]; n++; } dst[j * CW + i] = t / n; } }
  for (var r = 0; r < 3; r++) { pass(s, tmp, 1, 0); pass(tmp, s, 0, 1); }
  // spread the cream flag so the reshaped bank knows which water it belongs to
  for (var r2 = 0; r2 < 10; r2++) { var c2 = cream.slice(); for (var j2 = 1; j2 < CHH - 1; j2++) for (var i2 = 1; i2 < CW - 1; i2++) { var u = j2 * CW + i2; if (!c2[u] && (c2[u - 1] || c2[u + 1] || c2[u - CW] || c2[u + CW])) cream[u] = 1; } }
  for (var u2 = 0; u2 < N; u2++) { var sv = s[u2]; if (sv <= 0.001 || sv >= 0.999 || lock[u2]) continue; var wl = cream[u2] ? CREAMY : WATERY, h = CH[u2];
    if (sv < 0.5) { var land = Math.max(h, wl + 0.4), k2 = (0.5 - sv) / 0.5; k2 = k2 * k2 * (3 - 2 * k2); CH[u2] = wl - 0.05 + (land - wl + 0.05) * k2; }
    else { var k3 = (sv - 0.5) / 0.5; CH[u2] = Math.max(Math.min(h, wl - 0.05), wl - 0.05 - 1.6 * k3); } }
  // which land tiles dip under the water, and at what level
  for (var j3 = 0; j3 < MH; j3++) for (var i3 = 0; i3 < MW; i3++) { var t3 = j3 * MW + i3; if (isWaterK(KM[t3])) continue; var m = 0, cr = 0; [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (o) { var u3 = (j3 + o[1]) * CW + i3 + o[0]; if (s[u3] > m) m = s[u3]; if (cream[u3]) cr = 1; }); if (m > 0.2) SHOREWL[t3] = cr ? CREAMY : WATERY; }
})();

/* ---- soft edges between kinds of ground: sand, rock, dirt and fields meet grass along a smooth line through the
   tiles (a tent-weighted share of the tiles round each corner), not along the 4 m squares ---- */
var SOFTS = {}; SOFTS[K_SAND] = 1; SOFTS[K_ROCK] = 1; SOFTS[K_DIRT] = 1; SOFTS[K_FIELD] = 1; SOFTS[K_PARK] = 1; /* update 162: park lawns blend into grass too */
var SOFTB = {}; SOFTB[K_GRASS] = 1; SOFTB[K_PARK] = 1; SOFTB[K_FOREST] = 1; SOFTB[K_SAND] = 1; SOFTB[K_ROCK] = 1; SOFTB[K_DIRT] = 1; SOFTB[K_FIELD] = 1;
function softShare(S, ci, cj) { var t = 0, w = 0; for (var dj = -2; dj < 2; dj++) for (var di = -2; di < 2; di++) { var a = ci + di, b = cj + dj; if (a < 0 || b < 0 || a >= MW || b >= MH) continue; var ww = (2 - Math.abs(di + 0.5)) * (2 - Math.abs(dj + 0.5)); w += ww; if (KM[b * MW + a] === S) t += ww; } return w ? t / w : 0; }
function softPiece(M0, NAT, i, j, k, d, h) {
  if (!SOFTB[k]) return false; var S = SOFTS[k] ? k : -1, O = SOFTS[k] ? -1 : k;
  for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) { if (!di && !dj) continue; var a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= MW || b >= MH) continue; var nk = KM[b * MW + a]; if (!SOFTB[nk] || nk === k) continue; if (S < 0 && SOFTS[nk]) S = nk; else if (O < 0 && nk !== S) O = nk; }
  if (S < 0 || O < 0) return false;
  var ax = i * CT, az = j * CT, C = [[ax, az], [ax + CT, az], [ax + CT, az + CT], [ax, az + CT]], f = [softShare(S, i, j) - 0.5, softShare(S, i + 1, j) - 0.5, softShare(S, i + 1, j + 1) - 0.5, softShare(S, i, j + 1) - 0.5];
  var Hh = [h[0], h[1], h[3], h[2]], TS = TL(groundTile(S, d)), TO = TL(groundTile(O, d));
  function hAt(x, z) { var u = (x - ax) / CT, v = (z - az) / CT; return Hh[0] * (1 - u) * (1 - v) + Hh[1] * u * (1 - v) + Hh[2] * u * v + Hh[3] * (1 - u) * v; }
  function clip(sign) { var out = []; for (var q = 0; q < 4; q++) { var A = C[q], B = C[(q + 1) % 4], fa = f[q] * sign, fb = f[(q + 1) % 4] * sign; if (fa >= 0) out.push(A); if ((fa >= 0) !== (fb >= 0)) { var t2 = fa / (fa - fb); out.push([A[0] + (B[0] - A[0]) * t2, A[1] + (B[1] - A[1]) * t2]); } } return out; }
  function poly(pts, T, kind) { if (pts.length < 3) return; var MM = natural(kind) ? NAT : M0; for (var q = 1; q < pts.length - 1; q++) { var A = pts[0], B = pts[q], Cc = pts[q + 1], ns = [A, B, Cc].map(function (p) { return groundN(p[0], p[1]); }); MM.quad([A[0], hAt(A[0], A[1]), A[1]], [B[0], hAt(B[0], B[1]), B[1]], [Cc[0], hAt(Cc[0], Cc[1]), Cc[1]], [Cc[0], hAt(Cc[0], Cc[1]), Cc[1]], [(A[0] - ax) / CT, (A[1] - az) / CT, (B[0] - ax) / CT, (B[1] - az) / CT, (Cc[0] - ax) / CT, (Cc[1] - az) / CT, (Cc[0] - ax) / CT, (Cc[1] - az) / CT], T, [lit(ns[0]), lit(ns[1]), lit(ns[2]), lit(ns[2])], ns[0]); } }
  poly(clip(1), TS, S); poly(clip(-1), TO, O); return true; }

/* ---- the steaming grates in the road get a grate drawn under them (the steam came out of nothing) ---- */
(function () { var bd = bridgeDress; bridgeDress = function (M0, x0, z0, CS, first) { bd(M0, x0, z0, CS, first); if (typeof steamSpots !== 'function') return;
  steamSpots().forEach(function (s) { if (!s.grate || s.x < x0 || s.x >= x0 + CS || s.z < z0 || s.z >= z0 + CS) return; var y = groundY(s.x, s.z) + 0.045; tub(M0, [s.x, y - 0.03, s.z], [s.x, y, s.z], 0.75, 0.75, '#2a2a2e', 12, { T: TL('grate'), cap: 1 }); tub(M0, [s.x, y - 0.03, s.z], [s.x, y + 0.012, s.z], 0.82, 0.82, '#1a1a1e', 12); }); }; })();

/* ---- the houses you can buy: each its own walls, roof and front, and a garage beside it you drive into ---- */
var HOMELOOK = [['w_home0', 'roofh0'], ['w_home1', 'roofh1'], ['w_home2', 'roofh3'], ['w_home3', 'roofh2'], ['w_home4', 'roofh4']];
HOUSES.forEach(function (h) { var k = +h.id.slice(4); if (HOMELOOK[k] && (h.b.style === 'house' || h.b.style === 'suburb')) { h.b.wallX = HOMELOOK[k][0]; h.b.roofX = HOMELOOK[k][1]; } });
function homeGarage(b) { var F = frontFace(b), nx = F.n[0], nz = F.n[2], ux = F.R[0] - F.L[0], uz = F.R[1] - F.L[1], wF = Math.hypot(ux, uz) || 1, mx = (F.L[0] + F.R[0]) / 2, mz = (F.L[1] + F.R[1]) / 2; ux /= wF; uz /= wF;
  function at(t, s) { return [mx + ux * t + nx * s, mz + uz * t + nz * s]; }
  if (b.style !== 'house' && b.style !== 'suburb') { var p0 = at(wF / 2 - 2.4, 1.6); return { x: p0[0], z: p0[1], a: Math.atan2(nx, nz), under: 1, door: at(wF / 2 - 2.4, 0.05), nx: nx, nz: nz, ux: ux, uz: uz }; } // the penthouse: a ramp down under the block
  var r1 = hash2(b.i, 21, 1), side = 0; [r1 < 0.5 ? -1 : 1, r1 < 0.5 ? 1 : -1].some(function (sd) { var c = wF / 2 + 1.7, p = at(sd * c, -2.5); if (!bldAt(p[0], p[1]) && !bldAt(at(sd * c, -0.5)[0], at(sd * c, -0.5)[1])) { side = sd; return true; } return false; });
  if (!side) side = r1 < 0.5 ? -1 : 1; var tc = side * (wF / 2 + 1.75), d = at(tc, 0.1), c2 = at(tc, -3.2);
  return { side: side, tc: tc, x: d[0] + nx * 2.8, z: d[1] + nz * 2.8, cx: c2[0], cz: c2[1], a: Math.atan2(nx, nz), door: d, nx: nx, nz: nz, ux: ux, uz: uz, at: at }; }
(function () { var hd = houseDress; houseDress = function (m, glow, b) { hd(m, glow, b); if (!b.shop || b.shop.indexOf('home') !== 0) return; var k = +b.shop.slice(4), g = homeGarage(b), at = g.at, a = g.a, y0 = b.y0;
    // the garage: walls like the house, a flat roof with a lip, a roller door facing the road, a lamp over it
    var gy = groundY(g.cx, g.cz), x0 = Math.min(at(g.tc - 1.75, 0)[0], at(g.tc + 1.75, -6.4)[0]), x1 = Math.max(at(g.tc - 1.75, 0)[0], at(g.tc + 1.75, -6.4)[0]), z0 = Math.min(at(g.tc - 1.75, 0)[1], at(g.tc + 1.75, -6.4)[1]), z1 = Math.max(at(g.tc - 1.75, 0)[1], at(g.tc + 1.75, -6.4)[1]);
    boxT(m, x0, gy - 0.6, z0, x1, gy + 3.0, z1, { wall: b.wallX || 'w_house', top: 'roofs', v: 1 }); boxC(m, x0 - 0.12, gy + 3.0, z0 - 0.12, x1 + 0.12, gy + 3.18, z1 + 0.12, '#2a2226');
    standQ(m, g.door[0] + g.nx * 0.04, g.door[1] + g.nz * 0.04, a, 3.0, gy + 0.02, gy + 2.6, TL('shutter'), 1.1, 0.2); boxR(m, g.door[0] + g.nx * 0.05, g.door[1] + g.nz * 0.05, a, 1.6, 0.06, gy + 2.6, gy + 2.75, '#c4121c');
    ell(glow, g.door[0] + g.nx * 0.2, gy + 2.95, g.door[1] + g.nz * 0.2, 0.12, 0.08, 0.12, '#ffd890', 6, 3);
    if (!HDONE['g' + b.i]) { HDONE['g' + b.i] = 1; addBox(x0, z0, x1, z1, gy - 0.6, gy + 3.2); }
    // each house its own front
    var F = frontFace(b), nx = F.n[0], nz = F.n[2], ux = g.ux, uz = g.uz, mx = (F.L[0] + F.R[0]) / 2, mz = (F.L[1] + F.R[1]) / 2, wF = Math.hypot(F.R[0] - F.L[0], F.R[1] - F.L[1]); function A(t, s) { return [mx + ux * t + nx * s, mz + uz * t + nz * s]; }
    var trim = ['#f1e7d0', '#e8e0d0', '#f6f2e8', '#c8ccd2', '#c4121c'][k] || '#f1e7d0';
    if (k === 0 || k === 1) { [-1, 1].forEach(function (s2) { var p = A(s2 * 1.0, 1.4); boxC(m, p[0] - 0.07, y0, p[1] - 0.07, p[0] + 0.07, y0 + 2.6, p[1] + 0.07, trim); }); var pc = A(0, 0.75); boxR(m, pc[0], pc[1], a, 1.3, 0.8, y0 + 2.6, y0 + 2.75, '#3a2a22'); }
    if (k === 1) { var bw = A(-wF / 4, 0.45); boxR(m, bw[0], bw[1], a, 1.3, 0.45, y0 + 0.5, y0 + 2.2, trim); standQ(m, bw[0] + nx * 0.46, bw[1] + nz * 0.46, a, 2.2, y0 + 0.8, y0 + 2.0, TL('litwin'), 0.9, 0.3); boxR(m, bw[0], bw[1], a, 1.4, 0.55, y0 + 2.2, y0 + 2.35, '#3a2a22'); }
    if (k === 2) { var vr = A(0, 1.2); boxR(m, vr[0], vr[1], a, wF / 2, 1.2, y0, y0 + 0.25, '#7a5a3a', 'plank'); for (var q = -wF / 2 + 0.2; q <= wF / 2 - 0.1; q += wF / 5) { var pp = A(q, 2.3); boxC(m, pp[0] - 0.06, y0, pp[1] - 0.06, pp[0] + 0.06, y0 + 2.6, pp[1] + 0.06, '#f6f2e8'); } boxR(m, vr[0], vr[1], a, wF / 2 + 0.2, 1.35, y0 + 2.6, y0 + 2.75, '#3a3a3e'); var rl = A(0, 2.35); boxR(m, rl[0], rl[1], a, wF / 2, 0.03, y0 + 0.85, y0 + 0.92, '#f6f2e8'); }
    if (k === 3) { var cv = A(g.side ? -g.side * (wF / 2 - 1.6) : 0, -(Math.abs(nx) ? b.x1 - b.x0 : b.z1 - b.z0) - 1.5); boxR(m, cv[0], cv[1], a, 1.5, 1.5, y0, y0 + 2.4, '#d8dce0', 'w_glass'); boxR(m, cv[0], cv[1], a, 1.6, 1.6, y0 + 2.4, y0 + 2.55, '#f1f1f1'); var sd2 = A(wF / 2 - 0.4, 0.1); ell(m, sd2[0], b.y0 + b.h - 0.6, sd2[1], 0.35, 0.35, 0.1, '#d0d0d4', 8, 3); }
    if (k === 4) { [-1.2, -0.4, 0.4, 1.2].forEach(function (q) { var pp = A(q, 1.6); tub(m, [pp[0], y0, pp[1]], [pp[0], y0 + 3.2, pp[1]], 0.16, 0.14, '#f1e7d0', 8, { cap: 1 }); }); var pt = A(0, 0.9); boxR(m, pt[0], pt[1], a, 1.7, 0.95, y0 + 3.2, y0 + 3.45, '#f1e7d0'); boxR(m, pt[0], pt[1], a, 1.4, 0.7, y0 + 3.45, y0 + 3.55, '#c4121c'); [-1, 1].forEach(function (s2) { var l = A(s2 * 0.85, 0.2); ell(glow, l[0], y0 + 2.0, l[1], 0.1, 0.16, 0.1, '#ffb030', 6, 4); });
      var pl = A(0, -(Math.abs(nx) ? b.x1 - b.x0 : b.z1 - b.z0) - 3.6), py = groundY(pl[0], pl[1]); boxR(m, pl[0], pl[1], a, 2.6, 1.6, py, py + 0.18, '#d8d0c0'); boxR(glow, pl[0], pl[1], a, 2.35, 1.35, py + 0.19, py + 0.2, '#3a9ad8'); }
  }; })();
