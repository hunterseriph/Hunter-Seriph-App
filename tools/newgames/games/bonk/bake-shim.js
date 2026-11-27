/* bake-shim: runs inside Cum City Nights (in a test browser) so Spermabonk's new models are built with the same kit as
   every other 3D game (same atlas, same colours, same shading), and so the existing models can be exported as they are.
   B3 here is a stand-in for the model calls used in m-new.js: the shapes go straight into the kit's meshes, in metres. */
var BKP = [0, 0, 0, 0], UNIT = 22;
(function () { var v0 = R3.Mesh.prototype.v; R3.Mesh.prototype.v = function () { (this.tg || (this.tg = [])).push(BKP[0], BKP[1], BKP[2], BKP[3]); return v0.apply(this, arguments); };
  var up = R3.Mesh.prototype.upload; R3.Mesh.prototype.upload = function () { this.keep = new Float32Array(this.a); this.keepT = this.tg ? new Float32Array(this.tg) : null; return up.apply(this, arguments); }; })();
var NEWM = {};
var B3 = (function () {
  var m = null, ctr = null;
  function hex(h) { if (typeof h !== 'string') return h; h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
  function col(c) { c = hex(c); return [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5]; }
  function m3(a, b) { var o = []; for (var c = 0; c < 3; c++) for (var r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2]; return o; }
  function rot3(r) { var cx = Math.cos(r[0]), sx = Math.sin(r[0]), cy = Math.cos(r[1]), sy = Math.sin(r[1]), cz = Math.cos(r[2]), sz = Math.sin(r[2]); return m3([cz, sz, 0, -sz, cz, 0, 0, 0, 1], m3([cy, 0, -sy, 0, 1, 0, sy, 0, cy], [1, 0, 0, 0, cx, sx, 0, -sx, cx])); }
  function xf(R, p) { return [R[0] * p[0] + R[3] * p[1] + R[6] * p[2], R[1] * p[0] + R[4] * p[1] + R[7] * p[2], R[2] * p[0] + R[5] * p[1] + R[8] * p[2]]; }
  function place(o, p, R) { var q = xf(R, p); return [q[0] + o[0], q[1] + o[1], q[2] + o[2]]; }
  var T = null;
  function tri(a, b, c, cl, na, nb, nc) { var U = 1 / UNIT;
    if (!na) { var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
      if (ctr && (nx * ((a[0] + b[0] + c[0]) / 3 - ctr[0]) + ny * ((a[1] + b[1] + c[1]) / 3 - ctr[1]) + nz * ((a[2] + b[2] + c[2]) / 3 - ctr[2])) < 0) l = -l; na = nb = nc = [nx / l, ny / l, nz / l]; }
    [[a, na], [b, nb], [c, nc]].forEach(function (q) { m.v([q[0][0] * U, q[0][1] * U, q[0][2] * U], 0.5, 0.5, T, cl, q[1], 0); }); }
  function ell(c0, o, s, r, seg, rings, cut) { var cl = col(c0); r = r || [0, 0, 0]; seg = seg || 10; rings = rings || 7; var R = rot3(r), lo = cut ? Math.PI * (1 - cut) : Math.PI; ctr = null;
    function pt(i, j) { var th = j / rings * lo, ph = i / seg * Math.PI * 2, x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph), nn = xf(R, [x / s[0], y / s[1], z / s[2]]), l = Math.hypot(nn[0], nn[1], nn[2]) || 1; return { p: place(o, [x * s[0], y * s[1], z * s[2]], R), n: [nn[0] / l, nn[1] / l, nn[2] / l] }; }
    for (var j = 0; j < rings; j++) for (var i = 0; i < seg; i++) { var a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1); if (j > 0) tri(a.p, c.p, b.p, cl, a.n, c.n, b.n); if (j < rings - 1 || cut) tri(a.p, d.p, c.p, cl, a.n, d.n, c.n); }
    if (cut) { ctr = o; var y0 = Math.cos(lo) * s[1], rr = Math.sin(lo); for (var k = 0; k < seg; k++) { var a0 = k / seg * 6.283, a1 = (k + 1) / seg * 6.283; tri(place(o, [0, y0, 0], R), place(o, [Math.cos(a0) * rr * s[0], y0, Math.sin(a0) * rr * s[2]], R), place(o, [Math.cos(a1) * rr * s[0], y0, Math.sin(a1) * rr * s[2]], R), cl); } } }
  function box(c0, o, s, r, top) { var cl = col(c0), tc = top ? col(top) : cl, R = rot3(r || [0, 0, 0]), x = s[0] / 2, y = s[1] / 2, z = s[2] / 2; ctr = o;
    var P = [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]].map(function (p) { return place(o, p, R); });
    [[0, 3, 2, 1, cl], [4, 5, 6, 7, cl], [0, 4, 7, 3, cl], [1, 2, 6, 5, cl], [3, 7, 6, 2, tc], [0, 1, 5, 4, cl]].forEach(function (f) { tri(P[f[0]], P[f[1]], P[f[2]], f[4]); tri(P[f[0]], P[f[2]], P[f[3]], f[4]); }); }
  function cyl(c0, o, r1, r2, h, r, seg, smooth, caps) { var cl = col(c0), R = rot3(r || [0, 0, 0]); seg = seg || 8; caps = caps === undefined ? 3 : caps; ctr = place(o, [0, h * (r2 > 0.001 ? 0.5 : 0.3), 0], R);
    for (var i = 0; i < seg; i++) { var a0 = i / seg * 6.283, a1 = (i + 1) / seg * 6.283, c0_ = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      var A = place(o, [c0_ * r1, 0, s0 * r1], R), B = place(o, [c1 * r1, 0, s1 * r1], R), Cc = place(o, [c1 * r2, h, s1 * r2], R), Dd = place(o, [c0_ * r2, h, s0 * r2], R), sl = (r1 - r2) / h;
      if (smooth) { var n0 = xf(R, [c0_, sl, s0]), n1 = xf(R, [c1, sl, s1]); [n0, n1].forEach(function (n) { var l = Math.hypot(n[0], n[1], n[2]); n[0] /= l; n[1] /= l; n[2] /= l; }); tri(A, Dd, Cc, cl, n0, n0, n1); tri(A, Cc, B, cl, n0, n1, n1); } else { if (r2 > 0.001) tri(A, Dd, Cc, cl); tri(A, Cc, B, cl); }
      if (caps & 1 && r1 > 0.001) tri(place(o, [0, 0, 0], R), A, B, cl); if (caps & 2 && r2 > 0.001) tri(place(o, [0, h, 0], R), Cc, Dd, cl); } }
  function tor(c0, o, R0, r0, r, seg, s2) { var cl = col(c0), Rm = rot3(r || [0, 0, 0]); seg = seg || 12; s2 = s2 || 5; ctr = null;
    function pt(i, j) { var a = i / seg * 6.283, b = j / s2 * 6.283, x = (R0 + r0 * Math.cos(b)) * Math.cos(a), z = (R0 + r0 * Math.cos(b)) * Math.sin(a), y = r0 * Math.sin(b); return { p: place(o, [x, y, z], Rm), n: xf(Rm, [Math.cos(b) * Math.cos(a), Math.sin(b), Math.cos(b) * Math.sin(a)]) }; }
    for (var i = 0; i < seg; i++) for (var j = 0; j < s2; j++) { var A = pt(i, j), B = pt(i + 1, j), C = pt(i + 1, j + 1), D = pt(i, j + 1); tri(A.p, C.p, B.p, cl, A.n, C.n, B.n); tri(A.p, D.p, C.p, cl, A.n, D.n, C.n); } }
  function part(id, piv, fn) { var o = BKP.slice(); BKP[0] = id; piv = piv || [0, 0, 0]; BKP[1] = piv[0] / UNIT; BKP[2] = piv[1] / UNIT; BKP[3] = piv[2] / UNIT; fn(); BKP = o; }
  function both(fn) { fn(1); fn(-1); }
  function model(name, fn, o) { m = new R3.Mesh(); T = TL('white'); BKP = [0, 0, 0, 0]; fn(); NEWM[name] = m.upload(); m.o = o || {}; return m; }
  return { ell: ell, box: box, cyl: cyl, tor: tor, part: part, both: both, hex: hex, model: model, add: function () {}, fx: function () {} };
})();
