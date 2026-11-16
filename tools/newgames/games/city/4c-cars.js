/* ---------- update 155: rounded car bodies (he said the vehicles looked too blocky and basic).
   A car body is lofted through stations along its length: each station is a cross-section with a tucked-in sill, a
   straight side up to the waist, a shoulder and a cabin that leans in towards the roof. Glass goes where the cabin is,
   then arches, bumpers, grille, lamps, mirrors, door lines, handles and plates go on top. The old box bodies stay for
   bikes, boards, boats and aircraft. Wheels get a rim with spokes on both faces. ---------- */
var _vmeshOld = vmesh;
var LOFT = { // stations front to back: [z as a share of the half length, top (y) or a word, width scale, the segment after it: b body, g glass]
  saloon: { low: 0.36, belt: 0.95, st: [[1, 0.62, 0.86, 'b'], [0.95, 0.86, 0.95, 'b'], [0.82, 0.93, 1, 'b'], [0.42, 1.0, 1, 'g'], [0.12, 'H', 1, 'b'], [-0.38, 'H', 1, 'g'], [-0.64, 1.02, 1, 'b'], [-0.92, 0.98, 1, 'b'], [-1, 0.66, 0.88, 'b']] },
  hatch: { low: 0.36, belt: 0.95, st: [[1, 0.62, 0.86, 'b'], [0.94, 0.86, 0.95, 'b'], [0.78, 0.95, 1, 'b'], [0.45, 1.0, 1, 'g'], [0.12, 'H', 1, 'b'], [-0.62, 'H', 1, 'g'], [-0.9, 1.08, 1, 'b'], [-1, 0.7, 0.9, 'b']] },
  sports: { low: 0.3, belt: 0.8, st: [[1, 0.5, 0.82, 'b'], [0.94, 0.7, 0.95, 'b'], [0.7, 0.8, 1, 'b'], [0.36, 0.86, 1, 'g'], [0.0, 'H', 0.98, 'b'], [-0.3, 'H', 0.98, 'g'], [-0.7, 0.9, 1, 'b'], [-0.94, 0.86, 1, 'b'], [-1, 0.56, 0.88, 'b']] },
  muscle: { low: 0.38, belt: 0.92, st: [[1, 0.66, 0.9, 'b'], [0.96, 0.9, 0.97, 'b'], [0.75, 0.96, 1, 'b'], [0.3, 0.98, 1, 'g'], [0.02, 'H', 0.98, 'b'], [-0.36, 'H', 0.98, 'g'], [-0.62, 0.98, 1, 'b'], [-0.95, 0.96, 1, 'b'], [-1, 0.68, 0.92, 'b']] },
  hearse: { low: 0.38, belt: 1.0, st: [[1, 0.66, 0.88, 'b'], [0.95, 0.92, 0.96, 'b'], [0.78, 1.0, 1, 'b'], [0.5, 1.04, 1, 'g'], [0.28, 'H', 1, 'b'], [-0.9, 'H', 1, 'b'], [-1, 'H-', 0.95, 'b']] },
  limo: { low: 0.36, belt: 0.95, st: [[1, 0.62, 0.88, 'b'], [0.96, 0.88, 0.96, 'b'], [0.84, 0.94, 1, 'b'], [0.62, 0.98, 1, 'g'], [0.46, 'H', 1, 'b'], [-0.62, 'H', 1, 'g'], [-0.78, 1.0, 1, 'b'], [-0.96, 0.96, 1, 'b'], [-1, 0.64, 0.9, 'b']] },
  van: { low: 0.5, belt: 1.15, glass: [0.22, 0.96], st: [[1, 0.85, 0.9, 'b'], [0.97, 1.12, 0.97, 'b'], [0.86, 1.2, 1, 'g'], [0.62, 'H-', 1, 'b'], [0.56, 'H', 1, 'b'], [-0.98, 'H', 1, 'b'], [-1, 'H-', 0.97, 'b']] },
  truck: { low: 0.6, belt: 1.55, glass: [0.55, 0.98], cab: 1, st: [[1, 1.0, 0.92, 'b'], [0.97, 1.5, 0.98, 'g'], [0.9, 'H-', 1, 'b'], [0.86, 'H', 1, 'b'], [0.4, 'H', 1, 'b'], [0.38, 'H-', 0.97, 'b']] }
};
LOFT.icecream = LOFT.van;
function loftBody(m, t, c, o) {
  var L = t.len / 2, Wd = t.wid / 2, H = o.H || t.hgt, low = o.low, belt = o.belt, glassC = '#16222e', trim = '#1a1416';
  if (o.cab) H = 2.65; // the truck cab; its box comes from the old body
  var S = o.st.map(function (s) { var top = s[1] === 'H' ? H : s[1] === 'H-' ? H - 0.12 : s[1]; return { z: s[0] * L, top: top, w: s[2], k: s[3] }; });
  function sec(s) { // the +x half of a cross-section, bottom to top
    var cab = s.top > belt + 0.2, w = Wd * s.w, bl = Math.min(belt, s.top - 0.02), tw = cab ? 0.78 : 0.9;
    return [[w * 0.93, low], [w, low + 0.18], [w, bl], [w - 0.05, Math.min(bl + 0.05, s.top)], [w * tw, s.top - (cab ? 0.07 : 0.02)], [w * tw - 0.14, s.top]]; }
  var gz = o.glass ? [o.glass[0] * L, o.glass[1] * L] : [-L, L];
  function Q(a, b, cc, d, col, gl) { var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(n[0], n[1], n[2]) || 1; n = [n[0] / l, n[1] / l, n[2] / l];
    var mx = (a[0] + b[0] + cc[0] + d[0]) / 4, my = (a[1] + b[1] + cc[1] + d[1]) / 4; if (n[0] * mx + n[1] * (my - (low + belt) / 2) < 0) n = [-n[0], -n[1], -n[2]];
    m.quad(a, b, cc, d, UV1, TL(gl ? 'w_glass' : 'white'), litc(col, n, gl ? 1.2 : 1), n); }
  for (var i = 0; i < S.length - 1; i++) {
    var A = S[i], B = S[i + 1], pa = sec(A), pb = sec(B), cabSeg = Math.max(A.top, B.top) > belt + 0.3, zin = (A.z + B.z) / 2 > gz[0] && (A.z + B.z) / 2 < gz[1];
    [-1, 1].forEach(function (sd) { for (var j = 0; j < 5; j++) { var g = j === 3 && cabSeg && zin && A.top > belt + 0.1 && B.top > belt + 0.1; Q([sd * pa[j][0], pa[j][1], A.z], [sd * pb[j][0], pb[j][1], B.z], [sd * pb[j + 1][0], pb[j + 1][1], B.z], [sd * pa[j + 1][0], pa[j + 1][1], A.z], j === 0 ? trim : g ? glassC : c, g); } });
    var gtop = A.k === 'g'; Q([pa[5][0], pa[5][1], A.z], [pb[5][0], pb[5][1], B.z], [-pb[5][0], pb[5][1], B.z], [-pa[5][0], pa[5][1], A.z], gtop ? glassC : c, gtop);
    Q([pa[0][0], pa[0][1], A.z], [pb[0][0], pb[0][1], B.z], [-pb[0][0], pb[0][1], B.z], [-pa[0][0], pa[0][1], A.z], trim); }
  [S[0], S[S.length - 1]].forEach(function (s, e) { var p = sec(s), cz = s.z, cy = (low + s.top) / 2, n = [0, 0, e ? -1 : 1]; // the nose and the tail, closed with a fan
    for (var j = 0; j < 6; j++) { var q = p[j], r = p[(j + 1) % 6]; if (j === 5) { m.quad([q[0], q[1], cz], [-q[0], q[1], cz], [-p[0][0], p[0][1], cz], [p[0][0], p[0][1], cz], UV1, TL('white'), litc(c, n), n); break; }
      m.quad([q[0], q[1], cz], [r[0], r[1], cz], [-r[0], r[1], cz], [-q[0], q[1], cz], UV1, TL('white'), litc(c, n), n); } });
  return { S: S, sec: sec, L: L, Wd: Wd, H: H };
}
function carDetails(m, t, c, o, F, wr) {
  var L = F.L, Wd = F.Wd, low = o.low, belt = o.belt, S = F.S, f0 = S[0], b0 = S[S.length - 1], D = '#12040a', chrome = '#c8ccd0', bump = '#1e1a1c';
  var zf = f0.z, zb = b0.z, fw = Wd * f0.w, bw = Wd * b0.w, fy = Math.min(f0.top, belt) - 0.05, by = Math.min(b0.top, belt) - 0.05;
  // bumpers: rounded bars wrapping a little round the corners
  tub(m, [-fw * 0.98, low + 0.14, zf + 0.04], [fw * 0.98, low + 0.14, zf + 0.04], 0.11, 0.11, bump, 8, { cap: 1, cap0: 1 }); tub(m, [-bw * 0.98, low + 0.14, zb - 0.04], [bw * 0.98, low + 0.14, zb - 0.04], 0.11, 0.11, bump, 8, { cap: 1, cap0: 1 });
  // grille, headlamps, tail lamps, plates
  boxC(m, -fw * 0.42, low + 0.26, zf - 0.02, fw * 0.42, fy - 0.08, zf + 0.025, D); for (var g = 0; g < 4; g++) boxC(m, -fw * 0.4, low + 0.3 + g * (fy - low - 0.42) / 4, zf + 0.025, fw * 0.4, low + 0.31 + g * (fy - low - 0.42) / 4, zf + 0.03, '#3a3436');
  [-1, 1].forEach(function (s) { boxC(m, s * fw * 0.72 - 0.17, fy - 0.2, zf - 0.03, s * fw * 0.72 + 0.17, fy - 0.04, zf + 0.03, '#fff6d0', 0.85); boxC(m, s * fw * 0.72 - 0.19, fy - 0.22, zf - 0.035, s * fw * 0.72 + 0.19, fy - 0.02, zf + 0.02, chrome);
    boxC(m, s * bw * 0.74 - 0.16, by - 0.2, zb - 0.03, s * bw * 0.74 + 0.16, by - 0.04, zb + 0.03, '#ff2630', 0.7); boxC(m, s * bw * 0.74 - 0.05, by - 0.2, zb - 0.035, s * bw * 0.74 + 0.05, by - 0.12, zb, '#ffb070', 0.6); });
  boxC(m, -0.22, low + 0.05, zf + 0.12, 0.22, low + 0.2, zf + 0.15, '#f1e7d0'); boxC(m, -0.22, low + 0.3, zb - 0.06, 0.22, low + 0.45, zb - 0.03, '#ffe36a');
  // wheel arches: a dark ring of trim round each wheel on both sides
  var ax = [L * 0.66, -L * 0.66]; if (o.cab) ax = [L * 0.66, -L * 0.15, -L * 0.66];
  ax.forEach(function (az) { [-1, 1].forEach(function (s) { var R = wr + 0.1, x = s * (Wd + 0.006), n = [s, 0, 0]; for (var k = 0; k < 8; k++) { var a0 = Math.PI * k / 8, a1 = Math.PI * (k + 1) / 8;
    m.quad([x, wr + Math.sin(a0) * R, az + Math.cos(a0) * R], [x, wr + Math.sin(a1) * R, az + Math.cos(a1) * R], [x, wr + Math.sin(a1) * (R - 0.08), az + Math.cos(a1) * (R - 0.08)], [x, wr + Math.sin(a0) * (R - 0.08), az + Math.cos(a0) * (R - 0.08)], UV1, TL('white'), litc('#1a1416', n), n);
    m.quad([x * 0.999, wr + Math.sin(a0) * (R - 0.08), az + Math.cos(a0) * (R - 0.08)], [x * 0.999, wr + Math.sin(a1) * (R - 0.08), az + Math.cos(a1) * (R - 0.08)], [x * 0.999, wr, az], [x * 0.999, wr, az], UV1, TL('white'), litc('#08060a', n), n); } }); });
  // the cabin: mirrors, door lines, handles, a B pillar
  var cab = S.filter(function (s) { return s.top > belt + 0.3; }), cf = cab.length ? cab[0].z : L * 0.3, cb = cab.length ? cab[cab.length - 1].z : -L * 0.3, mid = (cf + cb) / 2;
  if (!o.glass) { [-1, 1].forEach(function (s) { var x = s * (Wd + 0.005), n = [s, 0, 0]; boxC(m, s * (Wd + 0.02) - 0.07, belt + 0.02, cf + 0.18, s * (Wd + 0.16) + 0.07 * s * 0, belt + 0.14, cf + 0.32, c); boxC(m, s * (Wd + 0.1) - 0.04, belt + 0.03, cf + 0.19, s * (Wd + 0.1) + 0.04, belt + 0.13, cf + 0.31, '#9aa4b0');
      [cf + 0.15, mid, cb - 0.05].forEach(function (z) { m.quad([x, low + 0.2, z - 0.012], [x, low + 0.2, z + 0.012], [x, belt, z + 0.012], [x, belt, z - 0.012], UV1, TL('white'), litc(D, n), n); });
      boxC(m, s * (Wd + 0.01) - 0.02, belt - 0.12, mid + 0.1, s * (Wd + 0.01) + 0.02, belt - 0.08, mid + 0.3, chrome); boxC(m, s * (Wd + 0.01) - 0.02, belt - 0.12, cb + 0.15, s * (Wd + 0.01) + 0.02, belt - 0.08, cb + 0.35, chrome);
      var sp = F.sec({ z: mid, top: F.H, w: 1 }); tub(m, [s * sp[3][0], sp[3][1], mid], [s * sp[4][0], sp[4][1], mid], 0.05, 0.05, c, 5); }); }
  else [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.02) - 0.06, belt + 0.05, L * o.glass[1] - 0.25, s * (Wd + 0.14) + 0.0, belt + 0.25, L * o.glass[1] - 0.12, D); var x = s * (Wd + 0.005), n = [s, 0, 0], zd = L * o.glass[0]; m.quad([x, low + 0.25, zd - 0.012], [x, low + 0.25, zd + 0.012], [x, F.H - 0.15, zd + 0.012], [x, F.H - 0.15, zd - 0.012], UV1, TL('white'), litc(D, n), n); boxC(m, s * (Wd + 0.01) - 0.02, belt - 0.1, zd + 0.15, s * (Wd + 0.01) + 0.02, belt - 0.06, zd + 0.35, chrome); });
  return { cf: cf, cb: cb };
}
function wheelMesh(wh, r, w) { var T = TL('tyre'); tub(wh, [-w / 2, 0, 0], [w / 2, 0, 0], r, r, '#1a1a1c', 14, { T: T });
  [-1, 1].forEach(function (s) { var x = s * w / 2, n = [s, 0, 0]; tub(wh, [x, 0, 0], [x + s * 0.002, 0, 0], r * 0.97, r * 0.97, '#0e0c0e', 14, { cap: 1 });
    tub(wh, [x, 0, 0], [x + s * 0.012, 0, 0], r * 0.62, r * 0.62, '#b8bcc4', 12, { cap: 1 });
    for (var k = 0; k < 5; k++) { var a = k / 5 * 6.283, a2 = a + 0.5; wh.quad([x + s * 0.016, Math.sin(a) * r * 0.16, Math.cos(a) * r * 0.16], [x + s * 0.016, Math.sin(a) * r * 0.58, Math.cos(a) * r * 0.58], [x + s * 0.016, Math.sin(a2) * r * 0.58, Math.cos(a2) * r * 0.58], [x + s * 0.016, Math.sin(a2) * r * 0.16, Math.cos(a2) * r * 0.16], UV1, TL('white'), litc('#3a3a40', n), n); }
    tub(wh, [x + s * 0.012, 0, 0], [x + s * 0.03, 0, 0], r * 0.16, r * 0.12, '#e0e4ea', 8, { cap: 1 }); }); }
vmesh = function (type, colI) {
  var key = type + ':' + colI, o = _vmeshOld(type, colI), t = VT[type], lo = LOFT[t.body]; if (o.lofted) return o;
  var c = t.col[colI % t.col.length], wh = M(), wr = o.wr; if (t.cls === 'car' || t.cls === 'bike') { wheelMesh(wh, wr, t.cls === 'bike' ? 0.1 : t.body === 'truck' ? 0.36 : t.body === 'muscle' ? 0.3 : 0.26); o.wheel = wh.upload(); }
  if (!lo) { o.lofted = 1; return o; }
  var m = M(), F = loftBody(m, t, c, lo), d = carDetails(m, t, c, lo, F, wr), L = F.L, Wd = F.Wd, H = F.H, D = '#12040a';
  // the bits each kind adds
  if (t.cop) { boxC(m, -0.62, H, -0.12, 0.62, H + 0.07, 0.12, '#1a1a1e'); boxC(m, -0.58, H + 0.07, -0.1, -0.04, H + 0.2, 0.1, '#ff2630', 0.85); boxC(m, 0.04, H + 0.07, -0.1, 0.58, H + 0.2, 0.1, '#2a6aff', 0.85); [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.008) - 0.003, lo.low + 0.32, -L * 0.6, s * (Wd + 0.008) + 0.003, lo.low + 0.48, L * 0.6, '#f1e7d0'); }); }
  if (t.taxi) { boxC(m, -0.42, H, -0.15, 0.42, H + 0.3, 0.15, '#12040a'); boxC(m, -0.4, H + 0.02, 0.151, 0.4, H + 0.28, 0.16, '#ffe36a', 0.6); boxC(m, -0.4, H + 0.02, -0.16, 0.4, H + 0.28, -0.151, '#ffe36a', 0.6); [-1, 1].forEach(function (s) { for (var q = 0; q < 8; q++) boxC(m, s * (Wd + 0.008) - 0.003, lo.low + 0.3, -L * 0.6 + q * L * 0.15, s * (Wd + 0.008) + 0.003, lo.low + 0.4, -L * 0.6 + q * L * 0.15 + L * 0.075, D); }); }
  if (t.body === 'muscle') { boxC(m, -0.35, lo.belt + 0.02, L * 0.25, 0.35, lo.belt + 0.18, L * 0.68, D); [-1, 1].forEach(function (s) { boxC(m, s * 0.18 - 0.07, 0, -L, s * 0.18 + 0.07, H + 0.012, L, '#f1e7d0'); }); m.n = m.n; }
  if (t.body === 'sports') { boxC(m, -Wd + 0.12, lo.belt + 0.28, -L + 0.05, Wd - 0.12, lo.belt + 0.33, -L + 0.4, D); [-1, 1].forEach(function (s) { boxC(m, s * (Wd - 0.35) - 0.04, lo.belt + 0.08, -L + 0.2, s * (Wd - 0.35) + 0.04, lo.belt + 0.28, -L + 0.3, D); }); }
  if (t.body === 'hearse') [-1, 1].forEach(function (s) { var x = s * (Wd + 0.008), n = [s, 0, 0]; m.quad([x, lo.belt + 0.05, -L * 0.85], [x, lo.belt + 0.05, L * 0.1], [x, H - 0.12, L * 0.1], [x, H - 0.12, -L * 0.85], UV1, TL('white'), litc('#2a1a1e', n), n); tub(m, [x, lo.belt + 0.25, -L * 0.55], [x + s * 0.02, lo.belt + 0.25, -L * 0.55], 0.18, 0.18, '#c8a040', 10, { cap: 1 }); });
  if (t.body === 'limo') [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.006) - 0.003, lo.belt - 0.05, -L * 0.6, s * (Wd + 0.006) + 0.003, lo.belt - 0.02, L * 0.5, '#c8ccd0'); });
  if (t.body === 'icecream') { tub(m, [0, H, -0.6], [0, H + 0.55, -0.6], 0.32, 0.22, '#e8c880', 10); ell(m, 0, H + 0.8, -0.6, 0.4, 0.38, 0.4, '#ff9ab4', 10, 6); ell(m, 0, H + 1.08, -0.6, 0.26, 0.22, 0.26, '#f1e7d0', 8, 5); ell(m, 0.05, H + 1.3, -0.6, 0.08, 0.08, 0.08, '#c4121c', 6, 4);
    [-1, 1].forEach(function (s) { var x = s * (Wd + 0.01), n = [s, 0, 0]; m.quad([x, 1.0, -L + 0.5], [x, 1.0, L * 0.15], [x, 1.9, L * 0.15], [x, 1.9, -L + 0.5], s > 0 ? [1, 1, 0, 1, 0, 0, 1, 0] : UV1, TL('sign_cream'), [0.5, 0.5, 0.5], n); }); }
  else if (t.amb) { [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.008) - 0.003, 1.25, -L + 0.3, s * (Wd + 0.008) + 0.003, 1.5, L * 0.15, '#c4121c'); }); boxC(m, -0.55, H, L * 0.5, 0.55, H + 0.16, L * 0.7, '#ff2630', 0.85); }
  else if (t.body === 'van') [-1, 1].forEach(function (s) { var x = s * (Wd + 0.01), n = [s, 0, 0]; m.quad([x, 1.0, -L + 0.5], [x, 1.0, L * 0.15], [x, 1.9, L * 0.15], [x, 1.9, -L + 0.5], s > 0 ? [1, 1, 0, 1, 0, 0, 1, 0] : UV1, TL('sign_wash'), [0.5, 0.5, 0.5], n); });
  if (t.body === 'truck') { boxT(m, -Wd, 0.95, -L, Wd, t.hgt, L * 0.34, { wall: 'container', top: 'metal', u: 2.4, v: 2.4 }); boxC(m, -Wd + 0.1, 0.55, -L, Wd - 0.1, 0.95, L, '#2a2a2e'); tub(m, [Wd * 0.7, 1.2, L * 0.36], [Wd * 0.7, H + 0.5, L * 0.36], 0.07, 0.07, '#c8ccd0', 6, { cap: 1 }); }
  o.body = m.upload(); o.lofted = 1;
  // the driver's door, drawn swinging open when someone gets in, and the dark gap it leaves
  if (t.cls === 'car' && t.body !== 'truck') { var dm = M(), hz = (lo.glass ? L * lo.glass[1] - 0.15 : d.cf + 0.05), dl2 = lo.glass ? Math.min(1.15, L * (lo.glass[1] - lo.glass[0]) - 0.1) : Math.min(1.15, hz - (d.cf + d.cb) / 2);
    var by = lo.belt, ty = lo.glass ? F.H - 0.2 : Math.min(F.H - 0.08, by + 0.42);
    boxC(dm, -0.05, lo.low + 0.18, -dl2, 0, by, 0, c); dm.quad([-0.052, by, 0], [-0.052, by, -dl2], [-0.052, ty, -dl2 + 0.1], [-0.052, ty, -0.05], UV1, TL('w_glass'), litc('#16222e', [-1, 0, 0], 1.2), [-1, 0, 0]); dm.quad([0.002, by, 0], [0.002, by, -dl2], [0.002, ty, -dl2 + 0.1], [0.002, ty, -0.05], UV1, TL('w_glass'), litc('#16222e', [1, 0, 0], 1.2), [1, 0, 0]);
    boxC(dm, -0.03, by - 0.02, -dl2, 0.0, by + 0.02, 0, D); boxC(dm, 0.0, by - 0.25, -dl2 + 0.08, 0.06, by - 0.05, -dl2 + 0.3, '#3a2a2a');
    var gp = M(), x = -(Wd + 0.007), n = [-1, 0, 0]; gp.quad([x, lo.low + 0.18, hz], [x, lo.low + 0.18, hz - dl2], [x, ty, hz - dl2 + 0.1], [x, ty, hz - 0.05], UV1, TL('white'), litc('#0a0608', n), n);
    o.door = dm.upload(); o.gap = gp.upload(); o.hinge = [-(Wd + 0.01), 0, hz]; }
  return o;
};
(function () { var dv = drawVeh; drawVeh = function (v) { dv(v); if (!(v.door > 0.01) || v.dead) return; var VM = vmesh(v.type, v.col); if (!VM.door) return; var m = MD(v.x, v.y, v.z, v.a, v.pitch, v.roll);
  R3.draw(VM.gap, ATT, { m: m, tint: [0.82, 0.82, 0.82] }); R3.draw(VM.door, ATT, { m: MM(m, MD(VM.hinge[0], 0, VM.hinge[2], v.door * 1.15, 0, 0)), tint: [0.82, 0.82, 0.82] }); }; })();
