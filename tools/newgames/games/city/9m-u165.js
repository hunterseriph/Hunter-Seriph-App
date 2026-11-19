/* ---------- update 165 (his playtest) ---------- */

/* ---- ROADS (his ask: "look at the roads", jagged corners, bits of road not joined to anything). Road surfaces are no
   longer cut out of the 4 m squares: every road edge is drawn as a smooth strip of its real width along its curve
   (`roadRibbons`), every junction and bend gets a round fill, turning circles their full circle, and a kerb runs along
   the side of the road wherever a pavement is beside it (it stops at junction mouths by itself, because the other road
   is there). The squares under the roads are drawn as whatever is beside the road (pavement, grass...), so a road
   square with no road edge through it is no longer a lone bit of tarmac. Pavements are flat now (they stood 15 cm up and
   that step is what left Cumhead floating by the cut corners); the kerb is a stone lip along the road. ---- */
window.RIBBON = 1;
var RIBY = 0.045;
function ribbonTile(M0, NAT, i, j, k, d, h00, h10, h01, h11) {
  var ax = i * CT, az = j * CT, bx = ax + CT, bz = az + CT, kk = k;
  if (k === K_ROAD) { var f = roadF(ax + 2, az + 2);
    if (f > -1.6) { kk = -1; var nb = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      for (var q = 0; q < nb.length && kk !== K_PAVE; q++) { var ni = i + nb[q][0], nj = j + nb[q][1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) continue; var nk = KM[nj * MW + ni]; if (nk === K_PAVE) kk = K_PAVE; else if (kk < 0 && nk !== K_ROAD && nk !== K_BRIDGE && !isWaterK(nk)) kk = nk; }
      if (kk < 0) kk = K_PAVE; } }
  if (kk === K_PAVE) { var pe = paveEdge(M0, NAT, i, j, d); if (pe === true) return; if (pe) kk = pe; }
  var nat = natural(kk) || kk === K_SAND || kk === K_DIRT || kk === K_ROCK, M = natural(kk) ? NAT : M0, T = TL(groundTile(kk, d)), n = groundN(ax + 2, az + 2);
  var col = nat ? [cLit(i, j), cLit(i, j + 1), cLit(i + 1, j + 1), cLit(i + 1, j)] : lit(n);
  if (Math.abs(h00 - h11) > Math.abs(h10 - h01) + 0.01) M.quad([ax, h01, bz], [bx, h11, bz], [bx, h10, az], [ax, h00, az], UVR1, T, col.length === 4 ? [col[1], col[2], col[3], col[0]] : col, n);
  else M.quad([ax, h00, az], [ax, h01, bz], [bx, h11, bz], [bx, h10, az], UV1, T, col, n);
}
RE.forEach(function (E, i) { E.__ri = i; });
/* the back of a pavement next to grass follows the road's curve (cut on a 1 m grid, so the edge is smooth, not 4 m steps) */
function paveEdge(M0, NAT, i, j, d, own) {
  if (own === undefined && d && /^(downtown|redlight|cafe|labs|industrial|docks|site|factory)$/.test(d.style)) return false; /* update 167: town pavement is never turned into grass */
  var ax = i * CT, az = j * CT, nk = own === undefined ? -1 : own;
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) return; var k2 = KM[nj * MW + ni]; if (nk < 0 && (k2 === K_GRASS || k2 === K_FOREST || k2 === K_FIELD || k2 === K_PARK || k2 === K_DIRT)) nk = k2; }); if (nk < 0) return false;
  var N = 4, c = CT / N, F = []; for (var v = 0; v <= N; v++) for (var u = 0; u <= N; u++) F.push(roadF(ax + u * c, az + v * c) - PAVEW);
  if (F.every(function (x) { return x <= 0; })) { if (own === undefined) return false; } else if (F.every(function (x) { return x > 0; }) && own !== undefined) return false; if (own === undefined && F.every(function (x) { return x > 0; })) return nk; /* a pavement square wholly past the pavement's width, beside grass, is grass (the 4 m steps in the countryside) */
  var TP = TL(groundTile(K_PAVE, d)), TN = TL(groundTile(nk, d)), up = [0, 1, 0];
  function poly(pts, T, M, colf) { if (pts.length < 3) return; for (var q = 1; q < pts.length - 1; q++) { var A = pts[0], B = pts[q], C2 = pts[q + 1]; M.tri([A[0], groundY(A[0], A[1]), A[1]], [B[0], groundY(B[0], B[1]), B[1]], [C2[0], groundY(C2[0], C2[1]), C2[1]], [(A[0] - ax) / CT, (A[1] - az) / CT, (B[0] - ax) / CT, (B[1] - az) / CT, (C2[0] - ax) / CT, (C2[1] - az) / CT], T, colf, up); } }
  for (var v2 = 0; v2 < N; v2++) for (var u2 = 0; u2 < N; u2++) { var C = [[ax + u2 * c, az + v2 * c], [ax + (u2 + 1) * c, az + v2 * c], [ax + (u2 + 1) * c, az + (v2 + 1) * c], [ax + u2 * c, az + (v2 + 1) * c]], f = [F[v2 * (N + 1) + u2], F[v2 * (N + 1) + u2 + 1], F[(v2 + 1) * (N + 1) + u2 + 1], F[(v2 + 1) * (N + 1) + u2]];
    [[1, TP, M0], [-1, TN, natural(nk) ? NAT : M0]].forEach(function (S) { var out = []; for (var q = 0; q < 4; q++) { var a = C[q], b = C[(q + 1) % 4], fa = -f[q] * S[0], fb = -f[(q + 1) % 4] * S[0]; if (fa >= 0) out.push(a); if ((fa >= 0) !== (fb >= 0)) { var t2 = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t2, a[1] + (b[1] - a[1]) * t2]); } } poly(out, S[1], S[2], S[0] > 0 ? lit(up) : cLit(i, j)); }); }
  return true; }
function ribSkip(x, z) { var t = kAt(x, z); if (t === K_BRIDGE) return true; if (typeof BCOV !== 'undefined') { var i = Math.floor(x / CT), j = Math.floor(z / CT); if (BCOV[j * MW + i]) return true; } return isWaterK(t); }
function roadRibbons(M0, x0, z0, CS, first) {
  var seen = {}, up = [0, 1, 0], L = lit(up);
  function uv(p) { return [p[0] / 7, p[2] / 7]; }
  function Y(x, z, lo) { return groundY(x, z) + RIBY - (lo ? 0.012 : 0); }
  function quadW(a, b, c, e, T) { var A = uv(a), B = uv(b), C2 = uv(c), D = uv(e); M0.quad(a, b, c, e, [A[0], A[1], B[0], B[1], C2[0], C2[1], D[0], D[1]], T, L, up); }
  near(EGRID, x0 + CS / 2, z0 + CS / 2, CS * 0.75).forEach(function (E) { if (seen[E.__ri]) return; seen[E.__ri] = 1; if (E.off) return;
    var hw = E.w / 2, step = 2, dd = DIST[DM[Math.floor((RN[E.a].z) / CT) * MW + Math.floor(RN[E.a].x / CT)]] || DIST[0], T = TL(E.track ? 'dirt' : groundTile(K_ROAD, dd));
    for (var s = 0; s < E.len - 0.01; s += step) { var s1 = Math.min(E.len, s + step), m = edgeAt(E, (s + s1) / 2, false, 0); if (m.x < x0 || m.x >= x0 + CS || m.z < z0 || m.z >= z0 + CS) continue; if (ribSkip(m.x, m.z)) continue;
      var Lp = [edgeAt(E, s, false, hw), edgeAt(E, s1, false, hw)], Cp = [edgeAt(E, s, false, 0), edgeAt(E, s1, false, 0)], Rp = [edgeAt(E, s, false, -hw), edgeAt(E, s1, false, -hw)];
      function P(o) { return [o.x, Y(o.x, o.z, E.track), o.z]; } /* tracks sit a hair under tarmac where they meet it */
      quadW(P(Lp[0]), P(Cp[0]), P(Cp[1]), P(Lp[1]), T); quadW(P(Cp[0]), P(Rp[0]), P(Rp[1]), P(Cp[1]), T);
      /* the kerb: a stone lip along this side wherever a pavement (not another road) is beside it */
      [1, -1].forEach(function (sd) { var A0 = sd > 0 ? Lp[0] : Rp[0], A1 = sd > 0 ? Lp[1] : Rp[1], nx = -m.dz * sd, nz = m.dx * sd, mx = (A0.x + A1.x) / 2 + nx * 0.7, mz = (A0.z + A1.z) / 2 + nz * 0.7;
        if (E.track || roadF(mx, mz) < 0.25 || kAt(mx, mz) !== K_PAVE) return; kerbSeg(M0, A0.x, A0.z, A1.x, A1.z, nx, nz); }); }
  });
  /* junctions, bends and turning circles: a round fill so nothing is left open between the strips */
  for (var ci = 0; ci < RN.length; ci++) { var nd = RN[ci]; if (nd.x < x0 || nd.x >= x0 + CS || nd.z < z0 || nd.z >= z0 + CS) continue; if (ribSkip(nd.x, nd.z)) continue;
    var r = 0, trk = true; nd.e.forEach(function (ei) { var E = RE[ei]; if (E.off) return; r = Math.max(r, E.w / 2); if (!E.track) trk = false; }); if (!r) continue;
    var bulb = typeof BULBS !== 'undefined' && BULBS.indexOf(nd) >= 0; if (bulb) r = 12; else if (nd.e.length < 2) r = r; else r += 0.15;
    var dd2 = DIST[DM[Math.floor(nd.z / CT) * MW + Math.floor(nd.x / CT)]] || DIST[0], T2 = TL(trk ? 'dirt' : groundTile(K_ROAD, dd2)), N = bulb ? 32 : 20, cy = Y(nd.x, nd.z);
    for (var q = 0; q < N; q++) { var a0 = q / N * 6.2832, a1 = (q + 1) / N * 6.2832, p0 = [nd.x + Math.cos(a0) * r, 0, nd.z + Math.sin(a0) * r], p1 = [nd.x + Math.cos(a1) * r, 0, nd.z + Math.sin(a1) * r]; p0[1] = Y(p0[0], p0[2]); p1[1] = Y(p1[0], p1[2]);
      var mx2 = (p0[0] + p1[0]) / 2, mz2 = (p0[2] + p1[2]) / 2, h2 = [nd.x + (mx2 - nd.x) * 0.5, 0, nd.z + (mz2 - nd.z) * 0.5]; h2[1] = Y(h2[0], h2[2]);
      var A = uv([nd.x, cy, nd.z]), B = uv(p1), C2 = uv(p0); M0.tri([nd.x, Math.max(cy, h2[1]), nd.z], p1, p0, [A[0], A[1], B[0], B[1], C2[0], C2[1]], T2, L, up);
      if (bulb) { var ox = Math.cos((a0 + a1) / 2), oz = Math.sin((a0 + a1) / 2), kx = nd.x + ox * (r + 0.7), kz = nd.z + oz * (r + 0.7); if (roadF(kx, kz) > 0.25 && kAt(kx, kz) === K_PAVE) kerbSeg(M0, p0[0], p0[2], p1[0], p1[2], ox, oz); } } }
}
/* a kerb stone lip from a to b along the road's edge; (nx, nz) points away from the road */
function kerbSeg(M0, ax, az, bx, bz, nx, nz) { var w = 0.32, h = 0.13, ya = groundY(ax, az) + RIBY, yb = groundY(bx, bz) + RIBY, T = TL('kerb'), nn = [-nx, 0, -nz], top = [0, 1, 0];
  var ax2 = ax + nx * w, az2 = az + nz * w, bx2 = bx + nx * w, bz2 = bz + nz * w, ya2 = groundY(ax2, az2), yb2 = groundY(bx2, bz2);
  M0.quad([ax, ya - 0.03, az], [bx, yb - 0.03, bz], [bx, yb + h, bz], [ax, ya + h, az], uvR(1, 0.12), T, lit(nn, 0.9), nn);
  M0.quad([ax, ya + h, az], [bx, yb + h, bz], [bx2, Math.max(yb2, yb) + h, bz2], [ax2, Math.max(ya2, ya) + h, az2], uvR(1, 0.12), T, lit(top, 1.15), top);
  M0.quad([ax2, Math.max(ya2, ya) + h, az2], [bx2, Math.max(yb2, yb) + h, bz2], [bx2, yb2 - 0.02, bz2], [ax2, ya2 - 0.02, az2], uvR(1, 0.12), T, lit([nx, 0, nz]), [nx, 0, nz]); }
/* standing: pavements are flat now (the bridge decks, ramps and roofs still count) */
(function () { var sy = standY; standY = function (x, z, y) { var g = sy(x, z, y); if (G.interior) return g; var k = kAt(x, z); if (k !== K_PAVE && k !== K_ROAD) return g; var gy = groundY(x, z); return g > gy + 0.05 && g < gy + 0.25 ? gy : g; };
  window.meshRaise = function (x, z) { var ii = Math.floor(x / CT), jj = Math.floor(z / CT); if (ii < 0 || jj < 0 || ii >= MW || jj >= MH) return -1; var k = KM[jj * MW + ii]; /* never kAt here: buildStreet swaps kAt for one that calls this */ if (k !== K_PAVE && k !== K_ROAD) return -1; return roadF(x, z) > 0.35 ? 1 : 0; }; /* furniture keeps off the real road surface (paveSafe reads this) */
  if (typeof raisedAt === 'function') raisedAt = function () { return false; }; })();
/* grass beside a pavement, within the pavement's width of the road, is pavement up to the curve (so the pavement is one even band) */
function grassPave(M0, NAT, i, j, k, d) { if (!(natural(k) || k === K_DIRT)) return false; var pv = false;
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (ni >= 0 && nj >= 0 && ni < MW && nj < MH && KM[nj * MW + ni] === K_PAVE) pv = true; }); if (!pv) return false;
  if (roadF(i * CT + 2, j * CT + 2) > PAVEW + 3) return false; return paveEdge(M0, NAT, i, j, d, k) === true; }

/* ---- EJACULAND'S GROUND (his ask: "do you really think this ground placement is acceptable"): the paths, the plazas
   and the turning circles were separate strips and discs laid on top of each other (overlaps, steps, jagged ends).
   Now they are ONE surface: the distance to the nearest path or plaza is worked out on a 1 m grid and the walkway is
   cut along where it reaches zero (marching squares), so paths join, bend and open into plazas in one smooth piece,
   with a single stone border all the way round its outside edge. ---- */
window.PARKMASK = 1;
function parkSurface(M0, x0, z0, CS) {
  var segs = [], discs = [], pad = 14;
  PPATH.forEach(function (P0) { for (var k = 0; k < P0.pts.length - 1; k++) { var a = P0.pts[k], b = P0.pts[k + 1]; if (Math.max(a[0], b[0]) < x0 - pad || Math.min(a[0], b[0]) > x0 + CS + pad || Math.max(a[1], b[1]) < z0 - pad || Math.min(a[1], b[1]) > z0 + CS + pad) continue; segs.push([a[0], a[1], b[0], b[1], P0.w / 2]); } });
  PDISC.forEach(function (D) { if (D.x + D.r < x0 - 2 || D.x - D.r > x0 + CS + 2 || D.z + D.r < z0 - 2 || D.z - D.r > z0 + CS + 2) return; discs.push(D); });
  if (!segs.length && !discs.length) return;
  function F(x, z) { var d = 99; for (var q = 0; q < segs.length; q++) { var S = segs[q], vx = S[2] - S[0], vz = S[3] - S[1], l2 = vx * vx + vz * vz || 1, t = clamp(((x - S[0]) * vx + (z - S[1]) * vz) / l2, 0, 1), e = Math.hypot(x - S[0] - vx * t, z - S[1] - vz * t) - S[4]; if (e < d) d = e; }
    for (var q2 = 0; q2 < discs.length; q2++) { var D = discs[q2], e2 = Math.hypot(x - D.x, z - D.z) - D.r; if (e2 < d) d = e2; } return d; }
  var g = 1, N = Math.round(CS / g), V = new Float32Array((N + 1) * (N + 1)); for (var j = 0; j <= N; j++) for (var i = 0; i <= N; i++) V[j * (N + 1) + i] = F(x0 + i * g, z0 + j * g);
  var T = TL('paver'), TB = TL('kerb'), up = [0, 1, 0], L = lit(up), OFF = 0.075;
  function Y(x, z) { return groundY(x, z) + OFF; }
  function P3(p) { return [p[0], Y(p[0], p[1]), p[1]]; }
  for (var j2 = 0; j2 < N; j2++) for (var i2 = 0; i2 < N; i2++) { var C = [[x0 + i2 * g, z0 + j2 * g], [x0 + (i2 + 1) * g, z0 + j2 * g], [x0 + (i2 + 1) * g, z0 + (j2 + 1) * g], [x0 + i2 * g, z0 + (j2 + 1) * g]], f = [V[j2 * (N + 1) + i2], V[j2 * (N + 1) + i2 + 1], V[(j2 + 1) * (N + 1) + i2 + 1], V[(j2 + 1) * (N + 1) + i2]];
    if (f[0] > 0 && f[1] > 0 && f[2] > 0 && f[3] > 0) continue;
    var out = [], cut = []; for (var q = 0; q < 4; q++) { var a = C[q], b = C[(q + 1) % 4], fa = f[q], fb = f[(q + 1) % 4]; if (fa <= 0) out.push(a); if ((fa <= 0) !== (fb <= 0)) { var t2 = fa / (fa - fb), p = [a[0] + (b[0] - a[0]) * t2, a[1] + (b[1] - a[1]) * t2]; out.push(p); cut.push(p); } }
    for (var q3 = 1; q3 < out.length - 1; q3++) { var A = out[0], B = out[q3], C2 = out[q3 + 1]; M0.tri(P3(A), P3(C2), P3(B), [A[0] / 3, A[1] / 3, C2[0] / 3, C2[1] / 3, B[0] / 3, B[1] / 3], T, L, up); }
    if (cut.length === 2) { /* the border: a dark stone lip just outside the edge */ var p0 = cut[0], p1 = cut[1], ex = p1[0] - p0[0], ez = p1[1] - p0[1], el = Math.hypot(ex, ez) || 1, nx = ez / el, nz = -ex / el, mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2;
      if (F(mx + nx * 0.3, mz + nz * 0.3) < F(mx - nx * 0.3, mz - nz * 0.3)) { nx = -nx; nz = -nz; }
      var w = 0.28, h = 0.07, q0 = [p0[0] + nx * w, p0[1] + nz * w], q1 = [p1[0] + nx * w, p1[1] + nz * w], ya = Y(p0[0], p0[1]), yb = Y(p1[0], p1[1]);
      M0.quad([p0[0], ya + h, p0[1]], [p1[0], yb + h, p1[1]], [q1[0], Y(q1[0], q1[1]) + h, q1[1]], [q0[0], Y(q0[0], q0[1]) + h, q0[1]], uvR(el / 2, 0.15), TB, lit(up, 0.75), up);
      M0.quad([p0[0], ya - 0.02, p0[1]], [p1[0], yb - 0.02, p1[1]], [p1[0], yb + h, p1[1]], [p0[0], ya + h, p0[1]], uvR(el / 2, 0.1), TB, lit([-nx, 0, -nz], 0.7), [-nx, 0, -nz]);
      M0.quad([q0[0], Y(q0[0], q0[1]) + h, q0[1]], [q1[0], Y(q1[0], q1[1]) + h, q1[1]], [q1[0], groundY(q1[0], q1[1]) - 0.02, q1[1]], [q0[0], groundY(q0[0], q0[1]) - 0.02, q0[1]], uvR(el / 2, 0.1), TB, lit([nx, 0, nz], 0.7), [nx, 0, nz]); } }
}

/* ---- SHARPER SIGNS AND SPRITES (his ask: the Ejaculand sign was pixelated and stretched, fix all the graphics,
   the sprites too). The texture sheet is 4096 wide when the phone allows it (`TA`), and every sign, billboard,
   poster, shop board, blade sign and neon is painted at twice the resolution into it (`.big`). The sprite sheet (the
   shop fronts and other pixel art stuck into the 3D city) is enlarged 4x with the Scale2x (EPX) rule, twice, before
   it becomes a texture, so its edges are smoothed out instead of blown-up squares. ---- */
(function () { try { var c = document.createElement('canvas'), gl = c.getContext('webgl'); var m = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE); if (m >= 4096) { TA = 4096; window.BIGSIGNS = 1; } var lc = gl && gl.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext(); } catch (e) {} })();
(function () { if (!window.BIGSIGNS) return; var re = /^(sign|bb|pp|gs|st|bl|n|neon|sg|poster|poster2|pk|redcross|esign)(_|\d|$)/;
  function mark() { Object.keys(HIPAINT).forEach(function (k) { if (re.test(k) && typeof HIPAINT[k] === 'function') HIPAINT[k].big = true; }); }
  mark(); var bt = buildAtlas; buildAtlas = function () { mark(); return bt.apply(this, arguments); }; })();
function scale2x(src) { var w = src.width, h = src.height, sd = src.getContext('2d').getImageData(0, 0, w, h).data, out = document.createElement('canvas'); out.width = w * 2; out.height = h * 2; var og = out.getContext('2d'), im = og.createImageData(w * 2, h * 2), od = new Uint32Array(im.data.buffer), s32 = new Uint32Array(sd.buffer.slice(0));
  function P(x, y) { x = x < 0 ? 0 : x >= w ? w - 1 : x; y = y < 0 ? 0 : y >= h ? h - 1 : y; return s32[y * w + x]; }
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var E = s32[y * w + x], B = P(x, y - 1), D = P(x - 1, y), F = P(x + 1, y), H = P(x, y + 1), E0 = E, E1 = E, E2 = E, E3 = E;
    if (B !== H && D !== F) { E0 = D === B ? D : E; E1 = B === F ? F : E; E2 = D === H ? D : E; E3 = H === F ? F : E; }
    var o = (y * 2) * w * 2 + x * 2; od[o] = E0; od[o + 1] = E1; od[o + w * 2] = E2; od[o + w * 2 + 1] = E3; }
  og.putImageData(im, 0, 0); return out; }
(function () { var SHX = null; sheetTex = function () { if (!SHX && KIT.sheetReady) { var c = KIT.sheet; try { if (c.width * 4 <= 8192) c = scale2x(scale2x(KIT.sheet)); } catch (e) { c = KIT.sheet; } SHX = R3.texture(c); } return SHX; }; })();
/* the Ejaculand gate sign: one 768 x 128 picture (6:1, the board's own shape) cut into six hi-res slots */
var ESIGN = null, ESN = 6;
function esignCanvas() { if (ESIGN) return ESIGN; var W = 128 * ESN, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
  var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a0608'); bg.addColorStop(0.5, '#0a0204'); bg.addColorStop(1, '#1a0608'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#c4121c'; g.lineWidth = 5; g.strokeRect(9, 9, W - 18, H - 18); g.strokeStyle = '#5a0a10'; g.lineWidth = 2; g.strokeRect(17, 17, W - 34, H - 34);
  for (var x = 14; x < W - 8; x += 22) [7, H - 7].forEach(function (y) { var gl = g.createRadialGradient(x, y, 0, x, y, 7); gl.addColorStop(0, 'rgba(255,240,180,1)'); gl.addColorStop(0.45, 'rgba(255,200,90,0.9)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, 7, 0, 6.3); g.fill(); });
  for (var y2 = 30; y2 < H - 20; y2 += 22) [7, W - 7].forEach(function (x2) { var gl = g.createRadialGradient(x2, y2, 0, x2, y2, 7); gl.addColorStop(0, 'rgba(255,240,180,1)'); gl.addColorStop(0.45, 'rgba(255,200,90,0.9)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x2, y2, 7, 0, 6.3); g.fill(); });
  function steve(cx, cy, s, flip) { g.save(); g.translate(cx, cy); g.scale(flip ? -s : s, s); g.beginPath(); g.moveTo(0, -38); g.bezierCurveTo(6, -24, 26, -10, 26, 10); g.bezierCurveTo(26, 30, 12, 38, 0, 38); g.bezierCurveTo(-12, 38, -26, 30, -26, 10); g.bezierCurveTo(-26, -6, -6, -18, -4, -30); g.quadraticCurveTo(-3, -36, 0, -38); g.closePath(); g.fillStyle = '#0a0506'; g.fill(); g.lineWidth = 3.5; g.strokeStyle = '#ff2630'; g.stroke();
    g.fillStyle = '#ff2630'; g.beginPath(); g.ellipse(-9, 4, 4, 6.5, 0, 0, 6.3); g.ellipse(9, 4, 4, 6.5, 0, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(-14, 16); g.quadraticCurveTo(0, 15, 14, 16); g.quadraticCurveTo(12, 30, 0, 31); g.quadraticCurveTo(-12, 30, -14, 16); g.fillStyle = '#2a0608'; g.fill(); g.lineWidth = 2.5; g.stroke(); g.restore(); }
  steve(70, 64, 1.05, false); steve(W - 70, 64, 1.05, true);
  g.textAlign = 'center'; g.textBaseline = 'middle'; var fs = 96; g.font = fs + 'px "Pirata One", serif'; while (g.measureText('EJACULAND').width > W - 260 && fs > 40) { fs -= 2; g.font = fs + 'px "Pirata One", serif'; }
  g.shadowColor = 'rgba(255,38,48,0.9)'; g.shadowBlur = 18; g.fillStyle = '#ff2630'; g.fillText('EJACULAND', W / 2, H / 2 + 4); g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = '#3a0408'; g.strokeText('EJACULAND', W / 2, H / 2 + 4);
  g.fillStyle = 'rgba(255,220,200,0.35)'; g.fillText('EJACULAND', W / 2, H / 2 + 1); g.fillStyle = '#ff2630'; g.fillText('EJACULAND', W / 2, H / 2 + 4);
  ESIGN = c; return c; }
for (var esk = 0; esk < ESN; esk++) (function (k) { var f = function (g) { g.drawImage(esignCanvas(), k * 128, 0, 128, 128, 0, 0, 64, 64); }; f.big = true; HIPAINT['esign' + k] = f; })(esk);
LMBUILD.gate = function (o, p) { var y = p.h; [-1, 1].forEach(function (s) { boxT(o.m, p.x + s * 9 - 1.5, y, p.z - 1.5, p.x + s * 9 + 1.5, y + 12, p.z + 1.5, { wall: 'w_redbrick', top: 'roof' }); addBox(p.x + s * 9 - 1.5, p.z - 1.5, p.x + s * 9 + 1.5, p.z + 1.5, y - 2, y + 12); tub(o.m, [p.x + s * 9, y + 12, p.z], [p.x + s * 9, y + 16, p.z], 2.2, 0, '#c4121c', 8, { cap: 1 }); });
  boxC(o.m, p.x - 8, y + 9, p.z - 0.5, p.x + 8, y + 12, p.z + 0.5, '#12040a'); var SW = 15, sw = SW / ESN;
  for (var k = 0; k < ESN; k++) { var T = TL('esign' + k); standQ(o.glow, p.x - SW / 2 + (k + 0.5) * sw, p.z + 0.56, 0, sw + 0.002, y + 9.25, y + 11.75, T, 1.6, 1); standQ(o.glow, p.x + SW / 2 - (k + 0.5) * sw, p.z - 0.56, Math.PI, sw + 0.002, y + 9.25, y + 11.75, T, 1.6, 1); }
  ring(o.glow, p.x, 0, p.z, 0, 1, function () {}); o.r = 50; o.lights = [{ x: p.x, y: y + 8, z: p.z + 3, c: [1, 0.2, 0.3], r: 16 }]; };
