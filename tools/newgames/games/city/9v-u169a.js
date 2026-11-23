/* ---------- update 169 (his playtest) ---------- */

/* ---- RAISED PAVEMENTS ARE BACK (he asked why they went: update 165 flattened them when the roads became ribbons, and
   the street furniture was left 15 cm in the air). Pavements stand 15 cm up again, cut cleanly along the road's real
   edge: a 30 cm kerb stone runs along the road at the pavement's height, the pavement starts behind it, and wherever the
   raised part meets lower ground there is a face down to it, so nothing is left floating or open underneath. People,
   Cumhead and the furniture stand on top of it; cars still drive over the lip (NOPAVE). ---- */
var PRAISE = 0.15, KERBW = 0.3;
function raisedPt(x, z) { if (G.interior) return false; var i = Math.floor(x / CT), j = Math.floor(z / CT); if (i < 0 || j < 0 || i >= MW || j >= MH) return false;
  var k = KM[j * MW + i]; if (k !== K_PAVE && k !== K_ROAD) return false; if (k === K_ROAD && !roadTileIsPave(i, j)) return false; return roadF(x, z) >= KERBW; }
var RTP = {};
function roadTileIsPave(i, j) { var key = j * MW + i; if (RTP[key] !== undefined) return RTP[key]; var r = false; [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === K_PAVE) r = true; }); return (RTP[key] = r); }
/* one 1 m cell split along f = 0: the part with f >= 0 is raised; returns the crossing segment (for the face) */
function marchCell(C, f, up, low, skirt) { var hi = [], lo = [], X = [];
  for (var q = 0; q < 4; q++) { var a = C[q], b = C[(q + 1) % 4], fa = f[q], fb = f[(q + 1) % 4]; if (fa >= 0) hi.push(a); else lo.push(a);
    if ((fa >= 0) !== (fb >= 0)) { var t = fa / (fa - fb), p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; hi.push(p); lo.push(p); X.push(p); } }
  if (hi.length >= 3) up(hi); if (lo.length >= 3 && low) low(lo); if (X.length === 2 && skirt) skirt(X[0], X[1]); }
function raisedFace(M0, a, b, ff, T) { // a vertical face from the ground up to the pavement, facing the low side
  var ya = groundY(a[0], a[1]), yb = groundY(b[0], b[1]), dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, n = [dz / l, 0, -dx / l];
  var mx = (a[0] + b[0]) / 2 + n[0] * 0.15, mz = (a[1] + b[1]) / 2 + n[2] * 0.15; if (ff(mx, mz) >= 0) n = [-n[0], 0, -n[2]];
  M0.quad([a[0], ya - 0.02, a[1]], [b[0], yb - 0.02, b[1]], [b[0], yb + PRAISE, b[1]], [a[0], ya + PRAISE, a[1]], uvR(l / 2, 0.15), T, lit(n, 0.85), n); }
function raisedTile(M0, i, j, d, TP) { var ax = i * CT, az = j * CT, N = 4, c = CT / N, F = [], up = [0, 1, 0], TK = TL('kerb'), Lu = lit(up);
  for (var v = 0; v <= N; v++) for (var u = 0; u <= N; u++) F.push(roadF(ax + u * c, az + v * c) - KERBW);
  function poly(pts, h) { for (var q = 1; q < pts.length - 1; q++) { var A = pts[0], B = pts[q], C2 = pts[q + 1]; M0.tri([A[0], groundY(A[0], A[1]) + h, A[1]], [B[0], groundY(B[0], B[1]) + h, B[1]], [C2[0], groundY(C2[0], C2[1]) + h, C2[1]], [(A[0] - ax) / CT, (A[1] - az) / CT, (B[0] - ax) / CT, (B[1] - az) / CT, (C2[0] - ax) / CT, (C2[1] - az) / CT], TP, Lu, up); } }
  function ff(x, z) { return roadF(x, z) - KERBW; }
  for (var v2 = 0; v2 < N; v2++) for (var u2 = 0; u2 < N; u2++) { var C = [[ax + u2 * c, az + v2 * c], [ax + (u2 + 1) * c, az + v2 * c], [ax + (u2 + 1) * c, az + (v2 + 1) * c], [ax + u2 * c, az + (v2 + 1) * c]], f = [F[v2 * (N + 1) + u2], F[v2 * (N + 1) + u2 + 1], F[(v2 + 1) * (N + 1) + u2 + 1], F[(v2 + 1) * (N + 1) + u2]];
    marchCell(C, f, function (p) { poly(p, PRAISE); }, function (p) { poly(p, 0.005); }, function (a, b) { raisedFace(M0, a, b, ff, TK); }); }
  // where the square meets ground that is not pavement (a yard, a lot, grass, a building's foot), the raised edge gets its face
  function inT(x, z) { return x > ax && x < ax + CT && z > az && z < az + CT ? 1 : -1; }
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (s) { var ni = i + s[0], nj = j + s[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var nk = KM[nj * MW + ni]; if (nk === K_PAVE || nk === K_ROAD && roadTileIsPave(ni, nj) || nk === K_ROAD || nk === K_BRIDGE) return;
    for (var q = 0; q < N; q++) { var A, B, ia, ib;
      if (s[1] === -1) { A = [ax + q * c, az]; B = [ax + (q + 1) * c, az]; ia = q; ib = q + 1; } else if (s[1] === 1) { A = [ax + q * c, az + CT]; B = [ax + (q + 1) * c, az + CT]; ia = N * (N + 1) + q; ib = ia + 1; }
      else if (s[0] === -1) { A = [ax, az + q * c]; B = [ax, az + (q + 1) * c]; ia = q * (N + 1); ib = ia + N + 1; } else { A = [ax + CT, az + q * c]; B = [ax + CT, az + (q + 1) * c]; ia = q * (N + 1) + N; ib = ia + N + 1; }
      if (F[ia] >= 0 && F[ib] >= 0) raisedFace(M0, A, B, inT, TK); } }); }
/* pavement squares beside the road: raised and cut along the road (the other kinds of ground are drawn as before) */
(function () { var rt = ribbonTile; ribbonTile = function (M0, NAT, i, j, k, d, h00, h10, h01, h11) {
  var kk = k;
  if (k === K_ROAD) { var f = roadF(i * CT + 2, j * CT + 2); if (!(f > -1.6)) return rt.apply(this, arguments); kk = -1;
    var nb = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    for (var q = 0; q < nb.length && kk !== K_PAVE; q++) { var ni = i + nb[q][0], nj = j + nb[q][1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) continue; var nk = KM[nj * MW + ni]; if (nk === K_PAVE) kk = K_PAVE; else if (kk < 0 && nk !== K_ROAD && nk !== K_BRIDGE && !isWaterK(nk)) kk = nk; }
    if (kk < 0) kk = K_PAVE; }
  if (kk !== K_PAVE) return rt.apply(this, arguments);
  var pe = paveEdge(M0, NAT, i, j, d); if (pe === true) return; if (pe) return rt.apply(this, arguments);
  raisedTile(M0, i, j, d, TL(groundTile(K_PAVE, d))); }; })();
/* the back of a pavement next to grass: the pavement part is raised too, with its face down to the grass */
paveEdge = function (M0, NAT, i, j, d, own) {
  if (own === undefined && d && /^(downtown|redlight|cafe|labs|industrial|docks|site|factory)$/.test(d.style)) return false;
  var ax = i * CT, az = j * CT, nk = own === undefined ? -1 : own;
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var k2 = KM[nj * MW + ni]; if (nk < 0 && (k2 === K_GRASS || k2 === K_FOREST || k2 === K_FIELD || k2 === K_PARK || k2 === K_DIRT)) nk = k2; }); if (nk < 0) return false;
  var N = 4, c = CT / N, F = [], R = []; for (var v = 0; v <= N; v++) for (var u = 0; u <= N; u++) { var rf = roadF(ax + u * c, az + v * c); F.push(rf - PAVEW); R.push(rf - KERBW); }
  if (F.every(function (x) { return x <= 0; })) { if (own === undefined) return false; } else if (F.every(function (x) { return x > 0; }) && own !== undefined) return false; if (own === undefined && F.every(function (x) { return x > 0; })) return nk;
  var TP = TL(groundTile(K_PAVE, d)), TN = TL(groundTile(nk, d)), TK = TL('kerb'), up = [0, 1, 0];
  function hOf(x, z) { return roadF(x, z) >= KERBW ? PRAISE : 0.005; }
  function poly(pts, T, M, colf, raise) { if (pts.length < 3) return; for (var q = 1; q < pts.length - 1; q++) { var A = pts[0], B = pts[q], C2 = pts[q + 1]; M.tri([A[0], groundY(A[0], A[1]) + (raise ? hOf(A[0], A[1]) : 0), A[1]], [B[0], groundY(B[0], B[1]) + (raise ? hOf(B[0], B[1]) : 0), B[1]], [C2[0], groundY(C2[0], C2[1]) + (raise ? hOf(C2[0], C2[1]) : 0), C2[1]], [(A[0] - ax) / CT, (A[1] - az) / CT, (B[0] - ax) / CT, (B[1] - az) / CT, (C2[0] - ax) / CT, (C2[1] - az) / CT], T, colf, up); } }
  function fPave(x, z) { return -(roadF(x, z) - PAVEW); }
  for (var v2 = 0; v2 < N; v2++) for (var u2 = 0; u2 < N; u2++) { var C = [[ax + u2 * c, az + v2 * c], [ax + (u2 + 1) * c, az + v2 * c], [ax + (u2 + 1) * c, az + (v2 + 1) * c], [ax + u2 * c, az + (v2 + 1) * c]], ix = [v2 * (N + 1) + u2, v2 * (N + 1) + u2 + 1, (v2 + 1) * (N + 1) + u2 + 1, (v2 + 1) * (N + 1) + u2], f = ix.map(function (n) { return -F[n]; });
    marchCell(C, f, function (p) { poly(p, TP, M0, lit(up), 1); }, function (p) { poly(p, TN, natural(nk) ? NAT : M0, cLit(i, j), 0); }, function (a, b) { raisedFace(M0, a, b, fPave, TK); }); }
  return true; };
/* the kerb stone is as high as the pavement now */
kerbSeg = function (M0, ax, az, bx, bz, nx, nz) { var w = KERBW + 0.02, h = PRAISE + 0.004, ya = groundY(ax, az) + RIBY, yb = groundY(bx, bz) + RIBY, T = TL('kerb'), nn = [-nx, 0, -nz], top = [0, 1, 0];
  var ax2 = ax + nx * w, az2 = az + nz * w, bx2 = bx + nx * w, bz2 = bz + nz * w, ya2 = groundY(ax2, az2), yb2 = groundY(bx2, bz2);
  M0.quad([ax, ya - 0.03, az], [bx, yb - 0.03, bz], [bx, yb + h - RIBY, bz], [ax, ya + h - RIBY, az], uvR(1, 0.12), T, lit(nn, 0.9), nn);
  M0.quad([ax, ya + h - RIBY, az], [bx, yb + h - RIBY, bz], [bx2, yb2 + h, bz2], [ax2, ya2 + h, az2], uvR(1, 0.12), T, lit(top, 1.15), top); };
/* standing on it */
(function () { var sy = standY; standY = function (x, z, y) { var g = sy(x, z, y); if (window.NOPAVE || G.interior) return g; var gy = groundY(x, z); if (g > gy + 0.3) return g; if (y !== undefined && y < gy - 0.5) return g; if (raisedPt(x, z)) return Math.max(g, gy + PRAISE); return g; };
  raisedAt = function (x, z) { return raisedPt(x, z); }; })();
