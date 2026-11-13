/* =====================================================================================================
   THE PEOPLE: rigid-part bodies like the old survival horror games (hips, chest, head, upper and lower arms and legs),
   each part a smooth low-poly shape built once and kept on the graphics chip, posed every frame with matrices.
   Faces are painted cleanly in his cartoon style (thick dark lines, glossy eyes) onto the front of the head.
   Cumhead (cream droplet head with the curl and the little floating drip, gothic outfit), TB (eye patch, the grin,
   the cowboy hat, a rattling bottle of Silly Pills), and his boys: the Gimp, the Butcher (sack hood, cleaver) and
   the Pill Pusher (mask, goggles, a syringe).
   ===================================================================================================== */
var K0 = '#12040a';
function fEll(g, x, y, rx, ry, fill, line, lw) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.lineWidth = lw || 3; g.strokeStyle = line; g.stroke(); } }
function fLine(g, pts, w, col) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) { var p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.lineTo(p[0], p[1]); } g.lineWidth = w; g.strokeStyle = col || K0; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function fShape(g, pts, fill, line, lw) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) { var p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.lineTo(p[0], p[1]); } g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.lineWidth = lw || 3; g.strokeStyle = line; g.lineJoin = 'round'; g.stroke(); } }
function fEye(g, x, y, rx, ry, iris, look, white) {
  fEll(g, x, y, rx, ry, white || '#fffaf0', K0, 3); var ix = x + (look || 0) * rx * 0.25;
  fEll(g, ix, y + ry * 0.12, rx * 0.62, ry * 0.72, iris || '#2a1a14'); fEll(g, ix, y + ry * 0.15, rx * 0.34, ry * 0.42, K0);
  fEll(g, ix - rx * 0.25, y - ry * 0.22, rx * 0.2, ry * 0.18, '#ffffff'); fEll(g, ix + rx * 0.22, y + ry * 0.35, rx * 0.09, ry * 0.08, '#ffffff');
}
function face(fn, bg) { var f = function (g) { g.fillStyle = bg; g.fillRect(0, 0, 64, 64); g.scale(0.5, 0.5); fn(g); }; f.big = true; return f; }
function tbGrin(g, mad) { fShape(g, [[34, 86], [64, 112 + (mad ? 8 : 0), 94, 84], [64, 94, 34, 86]], '#3a0a0a', K0, 3); g.fillStyle = '#fffaf0'; for (var t = 0; t < 8; t++) g.fillRect(40 + t * 6.2, 87 + Math.abs(t - 3.5) * 0.7, 4.6, mad ? 7 : 5); if (mad) { g.fillStyle = '#fffaf0'; for (var b = 0; b < 7; b++) g.fillRect(43 + b * 6.2, 100 - Math.abs(b - 3) * 0.6, 4.4, 5); } }
HIPAINT.f_cum = face(function (g) { fEye(g, 46, 62, 13, 16, '#2a1a14', 0.3); fEye(g, 82, 62, 13, 16, '#2a1a14', 0.3); fLine(g, [[34, 40], [46, 34, 58, 42]], 3.5); fLine(g, [[70, 42], [82, 34, 94, 40]], 3.5); fShape(g, [[52, 90], [64, 82, 76, 90], [64, 100, 52, 90]], '#5a0c14', K0, 3); g.globalAlpha = 0.45; fEll(g, 32, 82, 9, 5, '#e8905a'); fEll(g, 96, 82, 9, 5, '#e8905a'); g.globalAlpha = 1; fShape(g, [[100, 40], [96, 50, 100, 54], [104, 50, 100, 40]], '#cfe8ff', K0, 2); }, '#f0c070');
HIPAINT.f_tb = face(function (g) { fLine(g, [[14, 44], [114, 58]], 4, '#1a1010'); fEll(g, 46, 60, 15, 13, '#1a1010', K0, 2); fEye(g, 82, 62, 11, 13, '#3a2412', -0.2); fLine(g, [[70, 44], [84, 40, 96, 46]], 4, '#3a2412'); fLine(g, [[62, 70], [58, 78], [66, 80]], 2.5, '#a87a5a'); tbGrin(g, 0); }, '#e8c0a0');
HIPAINT.f_tbmad = face(function (g) { fLine(g, [[14, 44], [114, 58]], 4, '#1a1010'); fEll(g, 46, 60, 15, 13, '#1a1010', K0, 2); fEye(g, 82, 60, 14, 16, '#c4121c', 0, '#ffe0e0'); fLine(g, [[74, 52], [80, 56]], 1.5, '#c4121c'); fLine(g, [[90, 66], [94, 70]], 1.5, '#c4121c'); fLine(g, [[66, 40], [84, 30, 100, 44]], 5, '#3a2412'); fLine(g, [[62, 70], [58, 78], [66, 80]], 2.5, '#a87a5a'); tbGrin(g, 1); }, '#e0a888');
HIPAINT.f_gimp = face(function (g) { g.fillStyle = '#26262c'; g.fillRect(0, 0, 128, 128); [[44, 58], [84, 58]].forEach(function (e) { fEll(g, e[0], e[1], 12, 8, '#0a0a0c', '#5a5a64', 3); fEll(g, e[0] + 3, e[1] - 2, 3, 2, '#ffffff'); }); fLine(g, [[34, 90], [94, 90]], 6, '#9a9aa4'); for (var z = 0; z < 12; z++) fLine(g, [[37 + z * 5, 86], [37 + z * 5, 94]], 2, '#c8c8d0'); fLine(g, [[64, 4], [64, 40]], 3, '#5a5a64'); [[20, 30], [108, 30], [20, 100], [108, 100]].forEach(function (s) { fEll(g, s[0], s[1], 4, 4, '#c8c8d0', K0, 1.5); }); }, '#26262c');
HIPAINT.f_butcher = face(function (g) { g.fillStyle = '#9a7a50'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#7a5a34'; g.lineWidth = 1; for (var y = 0; y < 128; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(128, y + 2); g.stroke(); } fShape(g, [[30, 50], [50, 44], [56, 64], [34, 66]], '#0a0606', K0, 3); fShape(g, [[74, 46], [96, 52], [92, 68], [72, 64]], '#0a0606', K0, 3); fEll(g, 44, 58, 3, 3, '#e8e0a0'); fEll(g, 84, 58, 3, 3, '#e8e0a0');
  fLine(g, [[40, 92], [52, 98], [64, 92], [76, 99], [90, 92]], 3, '#3a2010'); for (var s = 0; s < 6; s++) fLine(g, [[44 + s * 8, 88], [46 + s * 8, 100]], 2, '#3a2010'); g.fillStyle = 'rgba(120,6,12,0.85)'; g.beginPath(); g.arc(98, 96, 14, 0, 6.28); g.fill(); g.fillRect(96, 96, 4, 26); }, '#9a7a50');
HIPAINT.f_pusher = face(function (g) { g.fillStyle = '#e8d0c0'; g.fillRect(0, 0, 128, 128); [[44, 54], [84, 54]].forEach(function (e) { fEll(g, e[0], e[1], 15, 14, '#2a3a3a', K0, 4); fEll(g, e[0], e[1], 10, 9, '#8adfd0'); fEll(g, e[0] - 4, e[1] - 4, 3, 3, '#ffffff'); }); fLine(g, [[29, 54], [10, 50]], 4); fLine(g, [[99, 54], [118, 50]], 4); fLine(g, [[59, 54], [69, 54]], 4);
  fShape(g, [[22, 72], [106, 72], [100, 110], [28, 110]], '#b8e0d8', K0, 3); for (var p = 0; p < 3; p++) fLine(g, [[30, 82 + p * 8], [98, 82 + p * 8]], 2, '#8ab8b0'); }, '#e8d0c0');
HIPAINT.apron = function (g, r) { g.fillStyle = '#d8d0c0'; g.fillRect(0, 0, 64, 64); paintBlood(g, r, 0.6); };
/* ---------- shapes in a part's own space (x right of the screen when facing you... the character's left, y up, z forward) ---------- */
function C(h, k) { var c = rgb01(h); k = (k || 1) * 0.5; return [c[0] * k, c[1] * k, c[2] * k]; }
function ell(m, cx, cy, cz, rx, ry, rz, col, seg, rings, o) {
  o = o || {}; seg = seg || 10; rings = rings || 6; var T = o.T || TL('white'), c = C(col), fc = o.face ? TL(o.face) : null, fz = o.fz === undefined ? 0.3 : o.fz;
  function V(a, b) { var nx = Math.sin(a) * Math.sin(b), nz = Math.cos(a) * Math.sin(b), ny = Math.cos(b), tip = o.tip && b < 0.7 ? (0.7 - b) * o.tip : 0; return { p: [cx + nx * rx, cy + ny * ry + tip, cz + nz * rz], n: [nx, ny, nz], nx: nx, ny: ny, nz: nz }; }
  var b0 = o.b0 || 0, b1 = o.b1 || Math.PI;
  for (var r = 0; r < rings; r++) for (var i = 0; i < seg; i++) {
    var ba = b0 + (b1 - b0) * r / rings, bb = b0 + (b1 - b0) * (r + 1) / rings, aa = i / seg * Math.PI * 2, ab = (i + 1) / seg * Math.PI * 2;
    var q = [V(aa, ba), V(ab, ba), V(ab, bb), V(aa, bb)], mz = (q[0].nz + q[1].nz + q[2].nz + q[3].nz) / 4;
    if (o.only === 'back' && mz > 0.2) continue;
    if (fc && mz > fz) { var uv = []; q.forEach(function (v) { uv.push(Math.max(0.01, Math.min(0.99, 0.5 - v.nx * 0.5 / (o.fw || 0.85))), Math.max(0.01, Math.min(0.99, 0.5 - v.ny * 0.5 / (o.fh || 0.85) + (o.fdv || 0)))); }); m.quadN(q.map(function (v) { return v.p; }), uv, fc, [0.5, 0.5, 0.5], q.map(function (v) { return v.n; })); }
    else m.quadN(q.map(function (v) { return v.p; }), [0.1, 0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.9], T, c, q.map(function (v) { return v.n; }));
  }
}
function tub(m, a, b, ra, rb, col, seg, o) {
  o = o || {}; seg = seg || 8; var T = o.T || TL('white'), c = C(col), d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]) || 1; d = [d[0] / l, d[1] / l, d[2] / l];
  var h = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], p = [d[1] * h[2] - d[2] * h[1], d[2] * h[0] - d[0] * h[2], d[0] * h[1] - d[1] * h[0]], pl = Math.hypot(p[0], p[1], p[2]); p = [p[0] / pl, p[1] / pl, p[2] / pl];
  var q = [d[1] * p[2] - d[2] * p[1], d[2] * p[0] - d[0] * p[2], d[0] * p[1] - d[1] * p[0]];
  function V(t, ang, r) { var cs = Math.cos(ang), sn = Math.sin(ang), n = [p[0] * cs + q[0] * sn, p[1] * cs + q[1] * sn, p[2] * cs + q[2] * sn]; return { p: [a[0] + (b[0] - a[0]) * t + n[0] * r, a[1] + (b[1] - a[1]) * t + n[1] * r, a[2] + (b[2] - a[2]) * t + n[2] * r], n: n }; }
  for (var i = 0; i < seg; i++) { var a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832, v = [V(0, a0, ra), V(0, a1, ra), V(1, a1, rb), V(1, a0, rb)];
    m.quadN(v.map(function (z) { return z.p; }), [0, 1, (o.u || 1), 1, (o.u || 1), 0, 0, 0], T, c, v.map(function (z) { return z.n; }));
    if (o.cap && rb > 0) m.tri(b, v[3].p, v[2].p, [0.5, 0.5, 0, 0, 1, 0], T, c, d); if (o.cap0 && ra > 0) m.tri(a, v[1].p, v[0].p, [0.5, 0.5, 0, 0, 1, 0], T, c, [-d[0], -d[1], -d[2]]); }
}
function bxp(m, x0, y0, z0, x1, y1, z1, col, T) { T = T || TL('white'); var c = C(col), cd = C(col, 0.8), U = [0, 1, 1, 1, 1, 0, 0, 0];
  m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], U, T, c, [0, 1, 0]); m.quad([x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0], U, T, cd, [0, -1, 0]);
  m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], U, T, c, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], U, T, cd, [0, 0, -1]);
  m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], U, T, cd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], U, T, cd, [-1, 0, 0]); }
/* ---------- the bodies. D: sizes. Each part's mesh has its origin at its joint; limbs hang down -y ---------- */
var RIGS = {};
function M() { return new R3.Mesh(); }
/* a limb turned on a lathe: rings [y, rx, rz, cx, cz] down its length with smooth normals, so arms and legs have
   muscle, taper, wrists and ankles instead of being plain tubes */
function lathe(m, P, col, seg, o) {
  o = o || {}; seg = seg || 10; var T = o.T || TL('white'), c = C(col), n = P.length;
  function V(k, a) { var p = P[k], rx = p[1], rz = p[2] === undefined ? p[1] : p[2], pn = P[Math.min(n - 1, k + 1)], pp = P[Math.max(0, k - 1)], dy = Math.abs(pn[0] - pp[0]) || 0.001, sl = (pn[1] - pp[1]) / dy, sn = Math.sin(a), cs = Math.cos(a), l = Math.hypot(1, sl);
    return { p: [(p[3] || 0) + sn * rx, p[0], (p[4] || 0) + cs * rz], n: [sn / l, sl / l, cs / l] }; }
  for (var k = 0; k < n - 1; k++) for (var i = 0; i < seg; i++) { var a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832, v = [V(k, a0), V(k, a1), V(k + 1, a1), V(k + 1, a0)];
    m.quadN(v.map(function (z) { return z.p; }), [0.1, 0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.9], T, c, v.map(function (z) { return z.n; })); }
  if (o.cap) { var b = P[n - 1]; for (var j = 0; j < seg; j++) { var b0 = j / seg * 6.2832, b1 = (j + 1) / seg * 6.2832; m.tri([b[3] || 0, b[0], b[4] || 0], V(n - 1, b1).p, V(n - 1, b0).p, [0.5, 0.5, 0, 0, 1, 0], T, c, [0, -1, 0]); } }
}
function limbs(P, D, c) { // upper and lower arms (elbow, wrist, cuff, a hand with fingers and a thumb) and legs (knee, calf, ankle, a proper shoe with a sole)
  var A = D.arm, L = D.leg, H = D.hand, fore = c.fore || c.sleeve, cuff = fore !== c.hand, hem = c.legs !== c.boot;
  ['L', 'R'].forEach(function (sd) { var s = sd === 'L' ? 1 : -1;
    var au = M(); ell(au, 0, -0.02, 0, A * 1.22, A * 1.18, A * 1.16, c.sleeve, 10, 5); lathe(au, [[0, A * 1.05], [-D.au * 0.28, A * 1.12], [-D.au * 0.62, A * 0.98], [-D.au, A * 0.86]], c.sleeve, 10); P['au' + sd] = au.upload();
    var al = M(); ell(al, 0, 0, -0.005, A * 0.94, A * 0.94, A * 0.94, fore, 8, 4); lathe(al, [[0, A * 0.88], [-D.al * 0.28, A * 0.96], [-D.al * 0.7, A * 0.76], [-D.al, A * 0.64]], fore, 10);
    if (cuff) tub(al, [0, -D.al + 0.035, 0], [0, -D.al - 0.005, 0], A * 0.8, A * 0.84, shade(fore, 0.72), 10, { cap: 1 });
    var hy = -D.al - H * 0.62; ell(al, 0, hy, 0.005, H * 0.82, H * 0.9, H * 0.5, c.hand, 8, 5); // the palm
    for (var f = 0; f < 4; f++) { var fx = (f - 1.5) * H * 0.4, fy = hy - H * 0.62, fl = H * (f === 0 || f === 3 ? 0.62 : 0.78); tub(al, [fx, fy + H * 0.1, 0.01], [fx, fy - fl * 0.55, 0.035], H * 0.2, H * 0.18, c.hand, 5); tub(al, [fx, fy - fl * 0.55, 0.035], [fx, fy - fl, 0.075], H * 0.18, H * 0.13, c.hand, 5, { cap: 1 }); }
    tub(al, [s * H * 0.6, hy + H * 0.25, 0.02], [s * H * 1.05, hy - H * 0.3, 0.07], H * 0.24, H * 0.2, c.hand, 5); tub(al, [s * H * 1.05, hy - H * 0.3, 0.07], [s * H * 1.0, hy - H * 0.75, 0.11], H * 0.2, H * 0.13, c.hand, 5, { cap: 1 }); // the thumb
    P['al' + sd] = al.upload();
    var lu = M(); ell(lu, 0, -0.02, 0, L * 1.14, L * 1.12, L * 1.14, c.legs, 10, 5); lathe(lu, [[0, L * 1.08], [-D.lu * 0.3, L * 1.12, L * 1.16], [-D.lu * 0.78, L * 0.92], [-D.lu, L * 0.84]], c.legs, 10); P['lu' + sd] = lu.upload();
    var ll = M(), ft = -D.ll; ell(ll, 0, 0, 0.012, L * 0.9, L * 0.9, L * 0.92, c.legs, 8, 4); // the knee
    lathe(ll, [[0, L * 0.86], [-D.ll * 0.3, L * 0.92, L * 0.98, 0, -0.012], [-D.ll * 0.72, L * 0.72], [ft + 0.1, L * 0.66]], c.legs, 10);
    if (hem) tub(ll, [0, ft + 0.13, 0], [0, ft + 0.09, 0], L * 0.74, L * 0.8, shade(c.legs, 0.75), 10);
    ell(ll, 0, ft + 0.07, -0.012, L * 0.82, 0.07, L * 0.95, c.boot, 8, 4); ell(ll, 0, ft + 0.055, 0.085, L * 0.86, 0.052, L * 1.45, c.boot, 10, 5); // heel and toe
    bxp(ll, -L * 0.82, ft, -L * 0.95, L * 0.82, ft + 0.022, L * 2.15, shade(c.boot, 0.45)); // the sole
    P['ll' + sd] = ll.upload();
  });
}
function buildRigs() {
  if (RIGS.cumhead) return;
  /* CUMHEAD: a big cream droplet of a head with his curl, the little drip floating over it, the gothic coat with red trim */
  (function () { var D = { lu: 0.33, ll: 0.33, tor: 0.42, shW: 0.2, hipW: 0.1, au: 0.24, al: 0.22, arm: 0.055, hand: 0.065, leg: 0.07, neck: 0.04 }, P = {}, c = { sleeve: '#241418', fore: '#241418', hand: '#f1e7d0', legs: '#1a1012', boot: '#0e0808' };
    var hp = M(); ell(hp, 0, 0, 0, 0.17, 0.11, 0.12, '#1a1012', 8, 4); P.hips = hp.upload();
    var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.21, D.tor * 0.56, 0.15, '#241418', 10, 6); tub(to, [0, D.tor * 0.92, 0], [0, D.tor * 1.0, 0], 0.13, 0.14, '#c4121c', 10, { cap: 1 });
    tub(to, [0, D.tor * 0.2, 0.135], [0, D.tor * 0.86, 0.155], 0.02, 0.02, '#c4121c', 5); [0.3, 0.5, 0.7].forEach(function (y) { ell(to, 0.045, D.tor * y, 0.155, 0.018, 0.018, 0.01, '#c4121c', 6, 3); });
    tub(to, [-0.21, D.tor * 0.08, 0], [0.21, D.tor * 0.08, 0], 0.035, 0.035, '#c4121c', 6); P.torso = to.upload();
    var hd = M(); ell(hd, 0, 0.27, 0.0, 0.29, 0.27, 0.27, '#f0c070', 12, 8, { face: 'f_cum', fz: 0.25, fw: 0.8, fh: 0.78, fdv: 0.04, tip: 0.18 });
    tub(hd, [0, 0.58, -0.02], [-0.06, 0.74, -0.12], 0.09, 0.04, '#f0c070', 8); tub(hd, [-0.06, 0.74, -0.12], [0.02, 0.8, -0.2], 0.04, 0.0, '#f0c070', 6);
    P.head = hd.upload(); var dr = M(); ell(dr, 0, 0, 0, 0.06, 0.06, 0.06, '#f0c070', 8, 5); tub(dr, [0, 0.04, 0], [0, 0.13, 0], 0.05, 0.0, '#f0c070', 8); P.drip = dr.upload();
    limbs(P, D, c); RIGS.cumhead = { P: P, D: D, eyeY: 1.5, drip: 1 }; })();
  /* TB: tall, cowboy hat, eye patch, that grin, his brown jacket and red scarf, a bottle of Silly Pills in his left hand */
  function tbRig(fc, clown) { var D = { lu: 0.46, ll: 0.46, tor: 0.6, shW: 0.27, hipW: 0.13, au: 0.33, al: 0.3, arm: 0.07, hand: 0.075, leg: 0.085, neck: 0.08 }, P = {}, c = { sleeve: '#5a3a20', hand: '#e8c0a0', legs: '#2a3048', boot: '#2a1a10' };
    var hp = M(); ell(hp, 0, 0, 0, 0.21, 0.13, 0.15, '#2a3048', 8, 4); tub(hp, [-0.2, 0.06, 0], [0.2, 0.06, 0], 0.03, 0.03, '#3a2412', 6); ell(hp, 0, 0.06, 0.15, 0.05, 0.035, 0.02, '#c8a040', 6, 3); P.hips = hp.upload();
    if (clown) { c.sleeve = '#ffffff'; c.legs = '#2a50c0'; c.boot = '#c4121c'; c.hand = '#f4f0e8'; }
    var to = M(); if (clown) { ell(to, 0, D.tor * 0.5, 0, 0.3, D.tor * 0.56, 0.2, '#ffffff', 10, 6, { T: TL('polka') }); [0.3, 0.55, 0.8].forEach(function (y) { ell(to, 0, D.tor * y, 0.2, 0.045, 0.045, 0.03, '#ffe36a', 6, 3); }); }
    else { ell(to, 0, D.tor * 0.5, 0, 0.28, D.tor * 0.55, 0.18, '#5a3a20', 10, 6); ell(to, 0, D.tor * 0.55, 0.06, 0.13, D.tor * 0.42, 0.14, '#c8b8a0', 8, 5, { b0: 0.4 }); }
    if (clown) { tub(to, [0, D.tor * 0.92, 0], [0, D.tor * 1.0, 0], 0.26, 0.2, '#f1e7d0', 12, { cap: 1 }); tub(to, [0, D.tor * 0.97, 0], [0, D.tor * 1.03, 0], 0.22, 0.14, '#c4121c', 12, { cap: 1 }); }
    else { tub(to, [0, D.tor * 0.9, 0], [0, D.tor * 1.02, 0], 0.15, 0.13, '#8a1a1a', 10, { cap: 1 }); tub(to, [0.05, D.tor * 0.92, 0.12], [0.1, D.tor * 0.6, 0.2], 0.04, 0.02, '#8a1a1a', 6); } P.torso = to.upload();
    var hd = M(); ell(hd, 0, 0.2, 0, 0.19, 0.22, 0.2, clown ? '#f4f0e8' : '#e8c0a0', 12, 8, { face: fc, fz: 0.2, fw: 0.82, fh: 0.82, fdv: 0.06 });
    if (clown) { [-1, 1].forEach(function (sd) { ell(hd, sd * 0.19, 0.28, -0.02, 0.12, 0.11, 0.13, '#ffffff', 8, 5, { T: TL('wigred') }); ell(hd, sd * 0.13, 0.36, -0.08, 0.09, 0.08, 0.1, '#ffffff', 8, 4, { T: TL('wigred') }); }); ell(hd, 0, 0.17, 0.205, 0.045, 0.045, 0.04, '#e01010', 8, 5);
      tub(hd, [0.04, 0.4, 0], [0.04, 0.42, 0], 0.13, 0.13, '#1a1a1e', 10, { cap: 1, cap0: 1 }); tub(hd, [0.04, 0.42, 0], [0.04, 0.55, 0], 0.07, 0.06, '#1a1a1e', 8, { cap: 1 }); tub(hd, [0.04, 0.43, 0], [0.04, 0.46, 0], 0.072, 0.072, '#c4121c', 8); }
    else { ell(hd, 0, 0.27, -0.03, 0.2, 0.17, 0.19, '#4a2e18', 10, 5, { only: 'back' });
    tub(hd, [0, 0.36, 0], [0, 0.38, 0], 0.38, 0.38, '#5a3a20', 14, { cap: 1, cap0: 1 }); tub(hd, [0, 0.38, 0], [0, 0.56, 0], 0.18, 0.15, '#5a3a20', 10, { cap: 1 }); tub(hd, [0, 0.39, 0], [0, 0.44, 0], 0.185, 0.18, '#3a2412', 10); }
    ell(hd, -0.19, 0.2, 0, 0.04, 0.06, 0.04, '#e0b090', 6, 3); ell(hd, 0.19, 0.2, 0, 0.04, 0.06, 0.04, '#e0b090', 6, 3); P.head = hd.upload();
    limbs(P, D, c); var bt = M(); tub(bt, [0, 0, 0], [0, 0.13, 0], 0.045, 0.045, '#f1e7d0', 8, { cap0: 1 }); tub(bt, [0, 0.13, 0], [0, 0.17, 0], 0.048, 0.048, '#c4121c', 8, { cap: 1 }); P.bottle = bt.upload();
    return { P: P, D: D, eyeY: 1.75 }; }
  RIGS.tb = tbRig('f_tb'); RIGS.tbmad = tbRig('f_tbmad'); RIGS.tbclown = tbRig('f_tbclown', 1);
  /* SHITHEAD LABOOZIE (from Hunter's drawing): a swirled poop of a head with big cartoon eyes and a grin, black hoodie,
     white gloves, camo cargo trousers, tan boots */
  (function () { var D = { lu: 0.4, ll: 0.4, tor: 0.5, shW: 0.23, hipW: 0.11, au: 0.29, al: 0.27, arm: 0.068, hand: 0.075, leg: 0.085, neck: 0.04 }, P = {}, c = { sleeve: '#1e1a20', fore: '#1e1a20', hand: '#f4f0ec', legs: '#5a5a38', boot: '#b08850' };
    var hp = M(); ell(hp, 0, 0, 0, 0.2, 0.13, 0.15, '#4a4a30', 8, 4); ell(hp, 0.17, -0.06, 0.02, 0.06, 0.08, 0.07, '#4a4a30', 6, 3); ell(hp, -0.17, -0.06, 0.02, 0.06, 0.08, 0.07, '#4a4a30', 6, 3); P.hips = hp.upload();
    var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.26, D.tor * 0.58, 0.18, '#1e1a20', 10, 6); ell(to, 0, D.tor * 0.92, -0.1, 0.2, 0.12, 0.12, '#262228', 8, 4); // the hood down his back
    ell(to, 0, D.tor * 0.3, 0.15, 0.15, 0.08, 0.05, '#2a262c', 8, 3); tub(to, [0.05, D.tor * 0.9, 0.14], [0.06, D.tor * 0.62, 0.17], 0.01, 0.01, '#d8d0c0', 4); tub(to, [-0.05, D.tor * 0.9, 0.14], [-0.06, D.tor * 0.62, 0.17], 0.01, 0.01, '#d8d0c0', 4); P.torso = to.upload();
    var hd = M(), B = '#57300f'; ell(hd, 0, 0.17, 0, 0.27, 0.17, 0.25, B, 12, 7, { face: 'f_lab', fz: 0.25, fw: 0.9, fh: 0.95, fdv: -0.02 });
    ell(hd, 0.02, 0.34, -0.02, 0.21, 0.11, 0.2, '#653812', 12, 5); ell(hd, -0.01, 0.46, -0.03, 0.14, 0.08, 0.13, '#57300f', 10, 5); tub(hd, [0, 0.52, -0.03], [0.05, 0.64, -0.06], 0.07, 0.0, '#653812', 8);
    tub(hd, [-0.25, 0.25, 0], [0.24, 0.29, 0.02], 0.025, 0.025, '#4a2408', 6); tub(hd, [0.2, 0.39, 0.0], [-0.19, 0.42, -0.02], 0.02, 0.02, '#4a2408', 6); P.head = hd.upload();
    limbs(P, D, c); RIGS.laboozie = { P: P, D: D, eyeY: 1.45 }; })();
  /* the GIMP: black leather head to toe, zipped mouth, studded belts */
  (function () { var D = { lu: 0.44, ll: 0.44, tor: 0.56, shW: 0.25, hipW: 0.12, au: 0.31, al: 0.29, arm: 0.062, hand: 0.07, leg: 0.078, neck: 0.07 }, P = {}, c = { sleeve: '#1e1e22', hand: '#141416', legs: '#1e1e22', boot: '#0a0a0c' };
    var hp = M(); ell(hp, 0, 0, 0, 0.19, 0.12, 0.14, '#1e1e22', 8, 4); P.hips = hp.upload();
    var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.25, D.tor * 0.55, 0.16, '#1e1e22', 10, 6, { T: TL('leather') }); [0.25, 0.55, 0.8].forEach(function (y) { tub(to, [-0.25, D.tor * y, 0], [0.25, D.tor * y, 0], 0.025, 0.025, '#3a3a40', 6); for (var s = -2; s <= 2; s++) ell(to, s * 0.08, D.tor * y, 0.16, 0.014, 0.014, 0.01, '#d8d8e0', 5, 3); });
    tub(to, [-0.24, D.tor * 0.25, 0.1], [0.24, D.tor * 0.85, 0.1], 0.02, 0.02, '#3a3a40', 5); tub(to, [0.24, D.tor * 0.25, 0.1], [-0.24, D.tor * 0.85, 0.1], 0.02, 0.02, '#3a3a40', 5); P.torso = to.upload();
    var hd = M(); ell(hd, 0, 0.17, 0, 0.17, 0.2, 0.18, '#26262c', 12, 8, { face: 'f_gimp', fz: 0.15, fw: 0.9, fh: 0.9 }); tub(hd, [0, 0.36, -0.02], [0, 0.42, -0.03], 0.03, 0.0, '#3a3a40', 6); P.head = hd.upload();
    limbs(P, D, c); RIGS.gimp = { P: P, D: D, eyeY: 1.7 }; })();
  /* the BUTCHER: huge, a sack over his head, a bloody apron, a cleaver */
  (function () { var D = { lu: 0.46, ll: 0.46, tor: 0.66, shW: 0.33, hipW: 0.16, au: 0.34, al: 0.31, arm: 0.095, hand: 0.09, leg: 0.11, neck: 0.09 }, P = {}, c = { sleeve: '#d8c8b0', fore: '#e0b090', hand: '#d8a080', legs: '#3a3028', boot: '#1a1410' };
    var hp = M(); ell(hp, 0, 0, 0, 0.26, 0.16, 0.2, '#3a3028', 8, 4); P.hips = hp.upload();
    var to = M(); ell(to, 0, D.tor * 0.46, 0.04, 0.34, D.tor * 0.55, 0.28, '#d8c8b0', 12, 6); ell(to, 0, D.tor * 0.4, 0.13, 0.3, D.tor * 0.48, 0.22, '#d8d0c0', 10, 5, { T: TL('apron'), b0: 0.5 });
    tub(to, [-0.28, D.tor * 0.86, 0.12], [0, D.tor * 1.0, 0.2], 0.02, 0.02, '#5a4a3a', 5); tub(to, [0.28, D.tor * 0.86, 0.12], [0, D.tor * 1.0, 0.2], 0.02, 0.02, '#5a4a3a', 5); P.torso = to.upload();
    var hd = M(); ell(hd, 0, 0.19, 0, 0.21, 0.24, 0.21, '#9a7a50', 12, 8, { face: 'f_butcher', fz: 0.1, fw: 0.95, fh: 0.95 }); tub(hd, [0, 0.0, 0], [0, 0.04, 0], 0.2, 0.17, '#7a5a34', 10); ell(hd, 0, 0.42, 0, 0.08, 0.06, 0.08, '#9a7a50', 6, 3); P.head = hd.upload();
    limbs(P, D, c); var cl = M(); tub(cl, [0, 0, 0], [0, 0.14, 0], 0.025, 0.025, '#3a2010', 6); bxp(cl, -0.015, 0.12, -0.04, 0.015, 0.4, 0.16, '#b8b8c0', TL('steel')); bxp(cl, -0.017, 0.24, 0.0, 0.017, 0.36, 0.1, '#7a0a10'); P.weapon = cl.upload();
    RIGS.butcher = { P: P, D: D, eyeY: 1.9 }; })();
  /* the PILL PUSHER: pale green scrubs, a mask and goggles, a syringe full of something pink */
  (function () { var D = { lu: 0.43, ll: 0.43, tor: 0.55, shW: 0.24, hipW: 0.12, au: 0.3, al: 0.28, arm: 0.06, hand: 0.068, leg: 0.075, neck: 0.07 }, P = {}, c = { sleeve: '#7aa898', fore: '#e8d0c0', hand: '#e0e8e0', legs: '#6a9888', boot: '#e0e0d8' };
    var hp = M(); ell(hp, 0, 0, 0, 0.18, 0.12, 0.14, '#6a9888', 8, 4); P.hips = hp.upload();
    var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.24, D.tor * 0.55, 0.16, '#7aa898', 10, 6); tub(to, [0, D.tor * 0.88, 0.02], [0, D.tor * 0.98, 0.02], 0.12, 0.1, '#5a8878', 8, { cap: 1 }); bxp(to, 0.06, D.tor * 0.55, 0.15, 0.15, D.tor * 0.68, 0.17, '#5a8878'); P.torso = to.upload();
    var hd = M(); ell(hd, 0, 0.18, 0, 0.17, 0.2, 0.18, '#e8d0c0', 12, 8, { face: 'f_pusher', fz: 0.15, fw: 0.9, fh: 0.9 }); ell(hd, 0, 0.27, -0.02, 0.18, 0.15, 0.18, '#5a8878', 10, 5, { b1: 1.5 }); P.head = hd.upload();
    limbs(P, D, c); var sy = M(); tub(sy, [0, 0, 0], [0, 0.2, 0], 0.03, 0.03, '#e8f0f0', 8, { cap: 1, cap0: 1 }); tub(sy, [0, 0.06, 0], [0, 0.18, 0], 0.024, 0.024, '#ff4a8a', 8); tub(sy, [0, 0.2, 0], [0, 0.32, 0], 0.005, 0.003, '#d8d8e0', 4); tub(sy, [0, -0.02, 0], [0, -0.08, 0], 0.01, 0.01, '#d8d8e0', 4); P.weapon = sy.upload();
    RIGS.pusher = { P: P, D: D, eyeY: 1.68 }; })();
  /* the weapons Cumhead holds (grip at the origin, pointing down the forearm's -y, so a raised arm points them forward) */
  var W = {};
  var pl = M(); bxp(pl, -0.03, -0.05, -0.045, 0.03, 0.85, 0.045, '#a07a48', TL('wood')); tub(pl, [0, 0.72, 0.045], [0, 0.72, 0.15], 0.006, 0.004, '#c8c8c0', 4); ell(pl, 0, 0.72, 0.05, 0.015, 0.015, 0.006, '#8a3a1a', 5, 3); W.plank = pl.upload();
  var bt = M(); tub(bt, [0, -0.06, 0], [0, 0.3, 0], 0.022, 0.03, '#2a1a10', 8, { cap0: 1 }); tub(bt, [0, 0.3, 0], [0, 0.82, 0], 0.03, 0.055, '#c8a070', 8); ell(bt, 0, 0.82, 0, 0.055, 0.03, 0.055, '#c8a070', 8, 4); W.bat = bt.upload();
  var kn = M(); tub(kn, [0, -0.04, 0], [0, 0.1, 0], 0.018, 0.018, '#2a1a10', 6, { cap0: 1 }); bxp(kn, -0.03, 0.1, -0.01, 0.03, 0.115, 0.01, '#7a7a70'); bxp(kn, -0.006, 0.115, -0.02, 0.006, 0.33, 0.022, '#d8d8d0', TL('steel')); W.knife = kn.upload();
  var hm = M(); tub(hm, [0, -0.05, 0], [0, 0.42, 0], 0.017, 0.02, '#8a5a30', 6, { cap0: 1 }); bxp(hm, -0.028, 0.38, -0.05, 0.028, 0.47, 0.07, '#5a5a60', TL('steel')); bxp(hm, -0.02, 0.4, -0.12, 0.02, 0.45, -0.05, '#4a4a50', TL('steel')); W.hammer = hm.upload();
  var ax = M(); tub(ax, [0, -0.08, 0], [0, 0.88, 0], 0.022, 0.022, '#c4121c', 6, { cap0: 1 }); tub(ax, [0, -0.08, 0], [0, 0.02, 0], 0.026, 0.026, '#ffe36a', 6); bxp(ax, -0.012, 0.7, 0.0, 0.012, 0.92, 0.22, '#a0a0a8', TL('steel')); bxp(ax, -0.014, 0.74, 0.18, 0.014, 0.9, 0.24, '#e0e0e8'); bxp(ax, -0.016, 0.78, -0.16, 0.016, 0.84, 0.0, '#c4121c'); W.fireaxe = ax.upload();
  var hg = M(); bxp(hg, -0.022, -0.02, -0.03, 0.022, 0.05, 0.08, '#2a2a2e'); bxp(hg, -0.024, 0.05, -0.04, 0.024, 0.09, 0.24, '#3a3a40'); W.handgun = hg.upload();
  var sg = M(); bxp(sg, -0.03, -0.06, -0.24, 0.03, 0.04, 0.04, '#5a3a20', TL('wood')); tub(sg, [0, 0.06, 0.0], [0, 0.06, 0.62], 0.022, 0.022, '#2a2a2e', 6); tub(sg, [0, 0.025, 0.08], [0, 0.025, 0.42], 0.03, 0.03, '#6a4a28', 6); W.shotgun = sg.upload();
  var rf = M(); bxp(rf, -0.028, -0.06, -0.3, 0.028, 0.04, 0.05, '#4a3018', TL('wood')); tub(rf, [0, 0.055, 0.0], [0, 0.055, 0.7], 0.016, 0.014, '#2a2a2e', 6); tub(rf, [0, 0.11, 0.02], [0, 0.11, 0.24], 0.024, 0.024, '#1a1a1e', 6, { cap: 1, cap0: 1 }); bxp(rf, -0.025, 0.0, 0.05, 0.025, 0.05, 0.4, '#4a3018', TL('wood')); W.rifle = rf.upload();
  var bg = M(); bxp(bg, -0.07, -0.02, -0.06, 0.07, 0.16, 0.06, '#a07a48', TL('wood')); ell(bg, 0, 0.18, 0, 0.06, 0.04, 0.05, '#5a3010', 6, 3); W.bag = bg.upload(); // the flaming bag of shit
  RIGS.weap = W;
  var sh = M(); var T = TL('shadow'); sh.quad([-0.5, 0.015, -0.5], [0.5, 0.015, -0.5], [0.5, 0.015, 0.5], [-0.5, 0.015, 0.5], [0, 0, 1, 0, 1, 1, 0, 1], T, [0.5, 0.5, 0.5], [0, 1, 0]); RIGS.shadow = sh.upload();
  var dm = M(); dm.quad([0, 0, -0.04], [TSZ * 0.92, 0, -0.04], [TSZ * 0.92, 2.25, -0.04], [0, 2.25, -0.04], [0, 1, 1, 1, 1, 0, 0, 0], TL('door'), [0.5, 0.5, 0.5], [0, 0, -1]); dm.quad([0, 0, 0.04], [TSZ * 0.92, 0, 0.04], [TSZ * 0.92, 2.25, 0.04], [0, 2.25, 0.04], [0, 1, 1, 1, 1, 0, 0, 0], TL('door'), [0.5, 0.5, 0.5], [0, 0, 1]);
  bxp(dm, 0, 0, -0.04, TSZ * 0.92, 0.02, 0.04, '#3a2014'); RIGS.door = dm.upload();
  var cb = M(); cb.quad([0, 0, 0], [TSZ, 0, 0], [TSZ, 2.25, 0], [0, 2.25, 0], [0, 1, 1.5, 1, 1.5, 0, 0, 0], TL('bars'), [0.5, 0.5, 0.5], [0, 0, 1]); RIGS.bars = cb.upload();
  buildRigs2();
}
/* ---------- posing: a pose is joint angles; drawRig builds the matrices down the body and draws each part ---------- */
function pose0() { return { y: 0, lean: 0, twist: 0, roll: 0, hp: 0, hy: 0, hr: 0, sh: [[0, 0.08], [0, 0.08]], el: [0.15, 0.15], hip: [0, 0], kn: [0, 0], bp: 0, br: 0, bodyY: 0 }; }
var MM = R3.ok ? R3.mul : null, MD = R3.ok ? R3.model : null;
function drawRig(rig, x, y, z, yaw, P, o) {
  o = o || {}; var D = rig.D, S = rig.P, sc = o.sc || 1, fl = o.flash, tint = o.tint, al = o.alpha;
  if (!P.bp && !o.still) { var lt = KIT.t, sd0 = x * 1.7 + z * 2.3, br = Math.sin(lt * 1.7 + sd0); // everyone breathes and shifts a little, so nobody stands like a statue
    P.lean += br * 0.012; P.y += br * 0.004; P.sh[0][1] = (P.sh[0][1] || 0) + br * 0.018; P.sh[1][1] = (P.sh[1][1] || 0) + br * 0.018; P.hy += Math.sin(lt * 0.63 + sd0) * 0.05; P.hp += Math.sin(lt * 0.9 + sd0 * 2) * 0.02; P.roll += Math.sin(lt * 0.5 + sd0) * 0.008; }
  var hipY = D.lu + D.ll + P.y, body = MD(x, y + (P.bodyY || 0), z, yaw, P.bp || 0, P.br || 0, sc);
  function dr(mesh, m) { if (mesh) R3.draw(mesh, ATT, { m: m, flash: fl, tint: tint, alpha: al, warp: 0, rim: 1 }); }
  var hips = MM(body, MD(0, hipY, 0, P.twist * 0.3, 0, P.roll * 0.5)); dr(S.hips, hips);
  var tor = MM(hips, MD(0, 0.02, 0, P.twist, P.lean, P.roll)); dr(S.torso, tor);
  var head = MM(tor, MD(0, D.tor + D.neck, 0, P.hy, P.hp, P.hr)); dr(o.head || S.head, head);
  if (S.drip && rig.drip) { var da = rig.dripAt || [0.04, 0.95, -0.1]; dr(S.drip, MM(head, MD(da[0], da[1] + Math.sin(KIT.t * 3) * 0.03, da[2], 0, 0, 0))); }
  var out = { head: head };
  [0, 1].forEach(function (k) { var sd = k ? 'R' : 'L', sx = k ? -D.shW : D.shW, a = P.sh[k];
    var up = MM(tor, MD(sx, D.tor * 0.86, 0, a[2] || 0, -a[0], k ? -a[1] : a[1])); dr(S['au' + sd], up);
    var lo = MM(up, MD(0, -D.au, 0, 0, -P.el[k], 0)); dr(S['al' + sd], lo);
    if (k === 1) out.hand = MM(lo, MD(0, -D.al - D.hand * 0.7, 0.02, 0, Math.PI, 0)); else out.handL = MM(lo, MD(0, -D.al - D.hand * 0.7, 0.02, 0, Math.PI, 0));
    var hx = k ? -D.hipW : D.hipW, th = MM(hips, MD(hx, -0.02, 0, 0, -P.hip[k], 0)); dr(S['lu' + sd], th);
    dr(S['ll' + sd], MM(th, MD(0, -D.lu, 0, 0, P.kn[k], 0)));
  });
  if (o.held && out.hand) dr(o.held, MM(out.hand, MD(0, 0, 0, 0, o.heldP || 0, 0)));
  if (o.heldL && out.handL) dr(o.heldL, out.handL);
  if (!o.noShadow) R3.draw(RIGS.shadow, ATT, { m: MD(x, 0, z, 0, 0, 0, 1.1 * sc), soft: 1, lit: false, alpha: 0.85, warp: 0 });
  return out;
}
/* the moves: walking, running, sneaking, aiming, swinging, getting hit, falling down */
function poseWalk(P, ph, amt, run) { // update 129: a real gait. Hips roll over the planted foot, the shoulders turn against them, the elbow folds on the back swing, the head stays level, two bobs a stride
  var s = Math.sin(ph), c = Math.cos(ph), k = amt * (run ? 1.25 : 1), st = run ? 0.72 : 0.5;
  P.hip[0] = s * st * k + (run ? 0.12 * amt : 0); P.hip[1] = -s * st * k + (run ? 0.12 * amt : 0);
  P.kn[0] = (Math.max(0, -c) * (run ? 1.35 : 0.85) + Math.max(0, s) * 0.18) * k + 0.06; P.kn[1] = (Math.max(0, c) * (run ? 1.35 : 0.85) + Math.max(0, -s) * 0.18) * k + 0.06;
  P.sh[0][0] = -s * (run ? 0.75 : 0.42) * k; P.sh[1][0] = s * (run ? 0.75 : 0.42) * k; P.sh[0][1] = (P.sh[0][1] || 0) + 0.04 * amt; P.sh[1][1] = (P.sh[1][1] || 0) + 0.04 * amt;
  P.el[0] = 0.18 + (run ? 1.0 : 0.22) * amt + Math.max(0, s) * (run ? 0.5 : 0.35) * k; P.el[1] = 0.18 + (run ? 1.0 : 0.22) * amt + Math.max(0, -s) * (run ? 0.5 : 0.35) * k;
  P.y = -(0.5 - 0.5 * Math.cos(ph * 2)) * (run ? 0.06 : 0.035) * k; P.lean = (run ? 0.26 : 0.06) * amt + Math.cos(ph * 2) * 0.015 * k;
  P.twist = s * (run ? 0.16 : 0.1) * k; P.roll = c * 0.045 * k; P.hy = (P.hy || 0) - P.twist * 0.8; P.hr = (P.hr || 0) - P.roll * 0.9; P.hp = (P.hp || 0) - (run ? 0.12 : 0.02) * amt;
}
function poseCrouch(P, ph, amt) { P.y = -0.3; P.lean = 0.45; P.hip[0] = 1.0 + Math.sin(ph) * 0.3 * amt; P.hip[1] = 1.0 - Math.sin(ph) * 0.3 * amt; P.kn[0] = 1.5; P.kn[1] = 1.5; P.hp = -0.35; P.sh[0][0] = 0.4; P.sh[1][0] = 0.4; P.el[0] = P.el[1] = 0.9; }
function poseAim(P, gun, kick) { P.sh[1] = [1.45 - kick * 0.25, -0.05, -0.15]; P.el[1] = 0.08 + kick * 0.2; P.sh[0] = gun === 'handgun' ? [1.35, 0.25, 0.4] : [1.2, 0.3, 0.55]; P.el[0] = gun === 'handgun' ? 0.25 : 0.6; P.twist = gun === 'handgun' ? 0 : -0.25; P.lean = 0.05; }
function poseSwing(P, t) { // t 0..1: wind up, then the strike across
  if (t < 0.35) { var k = t / 0.35; P.sh[1] = [1.2 + k * 1.4, -0.5 * k, -0.4 * k]; P.el[1] = 0.5 + k * 0.8; P.twist = -0.4 * k; }
  else { var k2 = Math.min(1, (t - 0.35) / 0.3); P.sh[1] = [2.6 - k2 * 1.9, -0.5 + k2 * 0.9, -0.4 + k2 * 0.9]; P.el[1] = 1.3 - k2 * 1.1; P.twist = -0.4 + k2 * 0.8; P.lean = 0.15 * k2; }
  P.sh[0] = [0.3, 0.3, 0]; P.el[0] = 0.6;
}
function posePunch(P, t) { var k = t < 0.4 ? t / 0.4 : Math.max(0, 1 - (t - 0.4) / 0.6); P.sh[1] = [0.6 + k * 0.95, -0.05, 0]; P.el[1] = 1.6 - k * 1.5; P.twist = -0.3 * k; P.sh[0] = [0.7, 0.2, 0]; P.el[0] = 1.6; }
function poseHurt(P, k) { P.lean = -0.35 * k; P.hp = -0.3 * k; P.sh[0][0] = -0.3 * k; P.sh[1][0] = -0.3 * k; P.sh[0][1] = 0.6 * k; P.sh[1][1] = 0.6 * k; }
function poseDown(P, k, face) { P.bp = (face ? 1 : -1) * Math.PI / 2 * k; P.bodyY = 0.12 * k; P.sh[0] = [0.2, 1.2 * k, 0]; P.sh[1] = [0.2, 1.2 * k, 0]; P.hip[0] = 0.15; P.hip[1] = -0.1; P.kn = [0.3, 0.1]; }
function poseSlump(P, t) { // TB checked out: sat on the floor, head lolling, laughing to himself
  P.y = -0.62; P.hip[0] = P.hip[1] = 1.45; P.kn[0] = 1.2; P.kn[1] = 1.4; P.lean = -0.5; P.hr = 0.5 + Math.sin(t * 0.7) * 0.25; P.hp = 0.3 + Math.sin(t * 2.3) * 0.08; P.sh[0] = [0.2, 0.25, 0]; P.sh[1] = [0.6 + Math.sin(t * 9) * 0.05, 0.2, 0]; P.el[0] = 0.3; P.el[1] = 1.4; }
function poseGrab(P, k) { P.sh[0] = [1.5 * k, 0.15, 0.3 * k]; P.sh[1] = [1.5 * k, 0.15, -0.3 * k]; P.el[0] = P.el[1] = 0.3; P.lean = 0.2 * k; }
