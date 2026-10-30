/* =====================================================================================================
   THE 32-BIT LOOK: karts and drivers as real low-poly 3D models, lit per vertex (Gouraud) by a sun and the
   course's own light. Each driver's face is cut from their own sprite and wrapped round the front of a
   3D head; the rest of them (hair, hats, body, arms) is built from shapes in their colours.
   ===================================================================================================== */
var SUN = (function () { var v = [0.35, 0.85, 0.4], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();
function rgb01(hex) { var c = hexrgb(hex); return [c[0] / 255, c[1] / 255, c[2] / 255]; }
/* a frame: the kart's own axes (f forward, s right, u up) placed in the world */
function Frame(ox, oy, oz, yaw, pitch, sq, L, sc) {
  sc = sc || 1;
  var cp = Math.cos(pitch), sp = Math.sin(pitch), F = [Math.cos(yaw) * cp, sp, Math.sin(yaw) * cp], U = [-Math.cos(yaw) * sp, cp, -Math.sin(yaw) * sp], Sd = [-Math.sin(yaw), 0, Math.cos(yaw)];
  var fr = {
    L: L, sq: sq || 1,
    P: function (f, s, u) { f *= sc; s *= sc; u *= fr.sq * sc; return [ox + F[0] * f + Sd[0] * s + U[0] * u, oy + F[1] * f + U[1] * u, oz + F[2] * f + Sd[2] * s + U[2] * u]; },
    N: function (nf, ns, nu) { return [F[0] * nf + Sd[0] * ns + U[0] * nu, F[1] * nf + U[1] * nu, F[2] * nf + Sd[2] * ns + U[2] * nu]; },
    /* light a colour for a surface facing n: the course's light, more where the sun hits */
    lit: function (col, n, k) { var d = n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2], f = (0.56 + 0.72 * Math.max(0, d) + 0.1 * Math.max(0, -d)) * (k || 1) * 0.85; return [col[0] * L[0] * f, col[1] * L[1] * f, col[2] * L[2] * f]; }
  };
  return fr;
}
function faceN(a, b, c) { var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1; return [nx / l, ny / l, nz / l]; }
/* a box from 8 local corners [f, s, u]: bottom 0-3 then top 4-7, going round the same way. Each face is lit by its outward normal. */
function hull(m, fr, T, pts, col) {
  var p = pts.map(function (q) { return fr.P(q[0], q[1], q[2]); }), c = rgb01(col), uv = [0.02, 0.98, 0.98, 0.98, 0.98, 0.02, 0.02, 0.02], ctr = [0, 0, 0];
  p.forEach(function (q) { ctr[0] += q[0] / 8; ctr[1] += q[1] / 8; ctr[2] += q[2] / 8; });
  [[4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach(function (f) {
    var a = p[f[0]], b = p[f[1]], cc = p[f[2]], d = p[f[3]], n = faceN(a, b, cc), mx = (a[0] + cc[0]) / 2 - ctr[0], my = (a[1] + cc[1]) / 2 - ctr[1], mz = (a[2] + cc[2]) / 2 - ctr[2];
    if (n[0] * mx + n[1] * my + n[2] * mz < 0) n = [-n[0], -n[1], -n[2]];
    m.quad(a, b, cc, d, uv, T, fr.lit(c, n));
  });
}
function bx(f0, f1, s0, s1, u0, u1, o) { // corners for a plain or tapered box
  o = o || {}; var ts = o.ts || 0, tu = o.tu || 0, nf = o.nf || 0; // ts: narrow the front by, tu: lower the front top by, nf: lean the top back
  return [[f0, s0, u0], [f1, s0 + ts, u0], [f1, s1 - ts, u0], [f0, s1, u0], [f0 + nf, s0, u1], [f1 + nf, s0 + ts, u1 - tu], [f1 + nf, s1 - ts, u1 - tu], [f0 + nf, s1, u1]];
}
/* a smooth ellipsoid. tex: a face to wrap round the front ({T, rect}) and where the front ends (fz: 0 = half the head) */
function ball(m, fr, T, cf, cs, cu, rf, rs, ru, col, seg, o) {
  o = o || {}; seg = seg || 8; var rings = o.rings || 6, c = rgb01(col), face = o.face;
  function V(a, b) { // a: round the vertical axis (0 = facing forward), b: from top (0) to bottom (PI)
    var nf = Math.cos(a) * Math.sin(b), ns = Math.sin(a) * Math.sin(b), nu = Math.cos(b), top = o.tip && b < 0.5 ? (0.5 - b) * o.tip : 0;
    return { p: fr.P(cf + nf * rf, cs + ns * rs, cu + nu * ru + top), n: fr.N(nf, ns, nu), nf: nf, ns: ns, nu: nu };
  }
  var b0 = o.b0 || 0, b1 = o.b1 || Math.PI;
  for (var r = 0; r < rings; r++) for (var i = 0; i < seg; i++) {
    var ba = b0 + (b1 - b0) * r / rings, bb = b0 + (b1 - b0) * (r + 1) / rings, aa = i / seg * Math.PI * 2, ab = (i + 1) / seg * Math.PI * 2;
    var q = [V(aa, ba), V(ab, ba), V(ab, bb), V(aa, bb)]; if (o.back && (q[0].nf + q[1].nf + q[2].nf + q[3].nf) / 4 > o.back) continue; var front = face && (q[0].nf + q[1].nf + q[2].nf + q[3].nf) / 4 > (face.fz === undefined ? 0.25 : face.fz);
    if (front) { // planar mapping from the front: the sprite's left is the driver's right
      var uv = []; q.forEach(function (v) { uv.push(clamp(0.5 - v.ns * 0.5 / (face.w || 0.92), 0.01, 0.99), clamp(0.5 - v.nu * 0.5 / (face.h || 0.92) + (face.dv || 0), 0.01, 0.99)); });
      m.quad(q[0].p, q[1].p, q[2].p, q[3].p, uv, face.T, q.map(function (v) { return fr.lit([1, 1, 1], v.n, 0.98); }));
    } else m.quad(q[0].p, q[1].p, q[2].p, q[3].p, [0.1, 0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.9], T, q.map(function (v) { return fr.lit(c, v.n); }));
  }
}
/* a cylinder or cone along any local axis: from point a to point b (local), radius ra -> rb */
function tube(m, fr, T, a, b, ra, rb, col, seg, o) {
  o = o || {}; seg = seg || 8; var c = rgb01(col), d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]) || 1; d = [d[0] / l, d[1] / l, d[2] / l];
  var h = Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], pp = [d[1] * h[2] - d[2] * h[1], d[2] * h[0] - d[0] * h[2], d[0] * h[1] - d[1] * h[0]], pl = Math.hypot(pp[0], pp[1], pp[2]); pp = [pp[0] / pl, pp[1] / pl, pp[2] / pl];
  var q = [d[1] * pp[2] - d[2] * pp[1], d[2] * pp[0] - d[0] * pp[2], d[0] * pp[1] - d[1] * pp[0]], rot = o.rot || 0;
  function V(t, ang, r) { var cs = Math.cos(ang + rot), sn = Math.sin(ang + rot), nl = [pp[0] * cs + q[0] * sn, pp[1] * cs + q[1] * sn, pp[2] * cs + q[2] * sn]; return { p: fr.P(a[0] + (b[0] - a[0]) * t + nl[0] * r, a[1] + (b[1] - a[1]) * t + nl[1] * r, a[2] + (b[2] - a[2]) * t + nl[2] * r), n: fr.N(nl[0], nl[1], nl[2]) }; }
  var capP = fr.P(b[0], b[1], b[2]), capN = fr.N(d[0], d[1], d[2]), c0P = fr.P(a[0], a[1], a[2]), c0N = fr.N(-d[0], -d[1], -d[2]);
  for (var i = 0; i < seg; i++) {
    var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2, v = [V(0, a0, ra), V(0, a1, ra), V(1, a1, rb), V(1, a0, rb)], cc = o.cols ? rgb01(o.cols[i % o.cols.length]) : c;
    m.quad(v[0].p, v[1].p, v[2].p, v[3].p, [0.1, 0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1], T, v.map(function (z) { return fr.lit(cc, z.n); }));
    if (o.cap && rb > 0) m.tri(capP, v[3].p, v[2].p, [0.5, 0.5, 0.1, 0.1, 0.9, 0.1], T, fr.lit(rgb01(i % 2 && o.cap2 ? o.cap2 : o.cap), capN));
    if (o.cap0 && ra > 0) m.tri(c0P, v[0].p, v[1].p, [0.5, 0.5, 0.1, 0.1, 0.9, 0.1], T, fr.lit(rgb01(o.cap0), c0N));
  }
}

/* ---------- the kart ---------- */
function kart3D(m, A, k, fr) {
  var W = A.tile('white'), col = k.c.kart, R = RACE, dk = '#1a1418';
  hull(m, fr, W, bx(-1.05, 1.0, -0.58, 0.58, 0.14, 0.3), col[1]);                                     // floor pan
  hull(m, fr, W, bx(-0.72, 0.62, -0.5, 0.5, 0.3, 0.56, { nf: -0.04 }), col[0]);                        // the tub
  hull(m, fr, W, bx(0.62, 1.38, -0.44, 0.44, 0.2, 0.5, { ts: 0.24, tu: 0.22 }), col[0]);               // nose cone
  hull(m, fr, W, bx(1.22, 1.5, -0.86, 0.86, 0.1, 0.2, { ts: 0.05 }), col[2]);                           // front wing
  [-1, 1].forEach(function (sd) {                                                                       // side pods, sloped at the front
    var s0 = sd > 0 ? 0.48 : -0.84, s1 = sd > 0 ? 0.84 : -0.48;
    hull(m, fr, W, [[-0.6, s0, 0.16], [0.52, s0, 0.16], [0.52, s1, 0.16], [-0.6, s1, 0.16], [-0.6, s0, 0.5], [0.2, s0, 0.46], [0.2, s1, 0.46], [-0.6, s1, 0.5]], col[2]);
    tube(m, fr, W, [-0.66, sd * 0.66, 0.34], [-0.4, sd * 0.66, 0.34], 0.1, 0.12, '#12040a', 6);           // air intakes
  });
  hull(m, fr, W, bx(-0.66, -0.42, -0.32, 0.32, 0.42, 0.95, { nf: -0.1 }), dk);                         // seat back
  hull(m, fr, A.tile('metal'), bx(-1.08, -0.7, -0.38, 0.38, 0.44, 0.8), '#a8a0a8');                     // engine
  [-0.22, 0.22].forEach(function (s) { tube(m, fr, W, [-0.95, s, 0.7], [-1.32, s, 0.74], 0.08, 0.1, '#6a646c', 6, { cap: '#12040a' }); }); // exhausts
  hull(m, fr, W, bx(-1.32, -1.08, -0.78, 0.78, 1.02, 1.1), col[2]);                                     // rear wing
  [-0.5, 0.5].forEach(function (s) { hull(m, fr, W, bx(-1.22, -1.16, s - 0.03, s + 0.03, 0.6, 1.03), dk); });
  tube(m, fr, W, [0.2, 0, 0.48], [0.4, 0, 0.6], 0.04, 0.04, dk, 4);                                  // steering column
  tube(m, fr, W, [0.39, 0, 0.59], [0.43, 0, 0.64], 0.17, 0.17, dk, 8);                                      // steering wheel
  // wheels: rubber, with hubs that turn as you roll
  var roll = k._roll = (k._roll || 0) + (k.spd || 0) * (1 / 60) / 0.3, st = k.steerVis * 0.35;
  [[0.8, 1, 0.27], [0.8, -1, 0.27], [-0.74, 1, 0.31], [-0.74, -1, 0.31]].forEach(function (w, i) {
    var r = w[2], sd = w[1], f = w[0], s0 = sd * 0.6, s1 = sd * 0.92, sf = i < 2 ? Math.sin(st) * 0.16 : 0;
    tube(m, fr, A.tile('tire'), [f - sf, s0, r], [f + sf, s1, r], r, r, '#2a2228', 8, { rot: roll, cap: '#8a828a', cap2: '#3a343c', cap0: '#3a343c' });
  });
}

/* ---------- the drivers ---------- */
/* face: [sprite, first row, last row] cut from the front sprite; kind: drop / human / pig / cat / blob */
var DRV3D = {
  cumhead: { kind: 'drop', face: ['ch_idle0', 0, 25], col: '#f0c070', body: '#241418', arm: '#241418', hand: '#f1e7d0', trim: '#c4121c', tip: 0.45, curl: 1 },
  spermaid: { kind: 'drop', face: ['npc_spermaid', 0, 27], col: '#f1e7d0', body: '#3ab4c8', arm: '#f1e7d0', hand: '#f1e7d0', tip: 0.42 },
  greebo: { kind: 'human', face: ['npc_greebo', 10, 24], skin: '#f0c8a0', hair: '#c8862a', hat: 'chef', hatc: '#f6f0e4', body: '#f1e7d0', arm: '#f1e7d0', hand: '#f0c8a0', beard: '#c8862a' },
  amy: { kind: 'human', face: ['npc_amy', 1, 18], skin: '#f0c8a0', hair: '#ff8ac0', long: 1, body: '#c4121c', arm: '#c4121c', hand: '#f0c8a0' },
  tb: { kind: 'human', face: ['npc_tb', 9, 18], skin: '#e8c0a0', hair: '#4a2e18', hat: 'cowboy', hatc: '#5a3a20', body: '#5a3a20', arm: '#5a3a20', hand: '#e8c0a0' },
  hom: { kind: 'blob', col: '#3fb43a', eye: '#f1e7d0', body: '#3fb43a', arm: '#3fb43a', hand: '#3fb43a' },
  saba: { kind: 'human', face: ['npc_saba', 7, 19], skin: '#e0b090', hair: '#e8e0d8', hat: 'beanie', hatcols: ['#c4121c', '#ffe36a', '#3a9a2a'], body: '#3a8a2a', arm: '#3a8a2a', hand: '#e0b090', beard: '#e8e0d8' },
  joff: { kind: 'human', face: ['npc_joff', 8, 18], skin: '#f0c8a0', hair: '#3a2418', hat: 'chef', hatc: '#f6f0e4', body: '#f1e7d0', arm: '#f1e7d0', hand: '#f0c8a0' },
  kaya: { kind: 'human', face: ['npc_kaya', 1, 18], skin: '#f0c8a0', hair: '#8a3a20', long: 1, body: '#c4121c', arm: '#c4121c', hand: '#f0c8a0' },
  beebs: { kind: 'human', face: ['npc_beebs', 7, 18], skin: '#f0c8a0', hair: '#c8702a', hat: 'viking', hatc: '#a8a0a8', body: '#7a4a20', arm: '#7a4a20', hand: '#f0c8a0', beard: '#c8702a' },
  ali: { kind: 'human', face: ['npc_ali', 1, 18], skin: '#d8a880', hair: '#2a1a10', body: '#f1e7d0', arm: '#f1e7d0', hand: '#d8a880' },
  potbelly: { kind: 'pig', face: ['npc_potbelly', 1, 18], col: '#ff9ab4', body: '#c4121c', arm: '#ff9ab4', hand: '#ff9ab4' },
  blum: { kind: 'drop', ownface: 'blumf', col: '#c4121c', body: '#c4121c', arm: '#c4121c', hand: '#c4121c', tip: 0.5 },
  kingblum: { kind: 'drop', face: ['f_kingblum_0', 24, 72], col: '#c4121c', body: '#c4121c', arm: '#c4121c', hand: '#c4121c', tip: 0, crown: 1, cape: '#12040a' },
  sirj: { kind: 'cat', col: '#1a1418' }
};
/* the drivers' texture: each face cut from its sprite, the gaps round it filled with hair (so the head has no holes) */
var DRVTEX = null, DRVT = {};
function driverTex() {
  if (DRVTEX) return DRVTEX; if (!KIT.sheetReady) return null;
  var c = document.createElement('canvas'); c.width = c.height = 512; var g = c.getContext('2d'); g.imageSmoothingEnabled = false; var n = 0;
  function slot(fn) { var x = (n % 8) * 64, y = Math.floor(n / 8) * 64; n++; fn(g, x, y); return [(x + 0.5) / 512, (y + 0.5) / 512, 63 / 512, 63 / 512]; }
  DRVT.white = slot(function (g, x, y) { g.fillStyle = '#fff'; g.fillRect(x, y, 64, 64); });
  Object.keys(DRV3D).forEach(function (id) {
    var d = DRV3D[id]; if (!d.face) return; var f = KIT.SPR[d.face[0]]; if (!f) return;
    // the width of the head in those rows
    var tmp = document.createElement('canvas'); tmp.width = f[2]; tmp.height = f[3]; var tg = tmp.getContext('2d'); tg.drawImage(KIT.sheet, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]);
    var dd = tg.getImageData(0, 0, f[2], f[3]).data, x0 = 1e9, x1 = -1;
    for (var yy = d.face[1]; yy <= d.face[2]; yy++) for (var xx = 0; xx < f[2]; xx++) if (dd[(yy * f[2] + xx) * 4 + 3] > 0) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); }
    var cw = x1 - x0 + 1, ch = d.face[2] - d.face[1] + 1, sz = Math.max(cw, ch);
    DRVT[id] = slot(function (g, x, y) {
      g.fillStyle = d.hair || d.col || '#000'; g.fillRect(x, y, 64, 64);
      var k = 64 / sz; g.drawImage(tmp, x0 - (sz - cw) / 2, d.face[1] - (sz - ch) / 2, sz, sz, x, y, 64, 64);
      // see-through pixels at the edges become the hair colour too
      var im = g.getImageData(x, y, 64, 64), q = im.data, hc = hexrgb(d.hair || d.col); for (var i = 0; i < q.length; i += 4) if (q[i + 3] < 200) { q[i] = hc[0]; q[i + 1] = hc[1]; q[i + 2] = hc[2]; q[i + 3] = 255; } g.putImageData(im, x, y);
    });
  });
  DRVT.cat = slot(function (g, x, y) { // Sir Johnathan's face: black, a white muzzle, green eyes, pink nose
    g.fillStyle = '#1a1418'; g.fillRect(x, y, 64, 64); g.fillStyle = '#f1e7d0'; g.beginPath(); g.ellipse(x + 32, y + 44, 16, 13, 0, 0, 6.3); g.fill(); g.fillRect(x + 28, y + 20, 8, 24);
    [[20, 28], [44, 28]].forEach(function (e) { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(x + e[0], y + e[1], 7, 6, 0, 0, 6.3); g.fill(); g.fillStyle = '#9adf5a'; g.beginPath(); g.ellipse(x + e[0], y + e[1], 5, 4.5, 0, 0, 6.3); g.fill(); g.fillStyle = '#12040a'; g.fillRect(x + e[0] - 1, y + e[1] - 4, 2, 8); g.fillStyle = '#fff'; g.fillRect(x + e[0] + 1, y + e[1] - 3, 2, 2); });
    g.fillStyle = '#ff9ab4'; g.beginPath(); g.moveTo(x + 28, y + 38); g.lineTo(x + 36, y + 38); g.lineTo(x + 32, y + 43); g.fill(); g.fillStyle = '#12040a'; g.fillRect(x + 31, y + 43, 2, 4); g.fillRect(x + 26, y + 47, 12, 1);
    g.fillStyle = '#d8d0c8'; [[12, 44], [14, 48], [50, 44], [48, 48]].forEach(function (w) { g.fillRect(x + w[0] - 8, y + w[1], 10, 1); });
  });
  DRVT.blob = slot(function (g, x, y) { // the Gloop's face: big eyes, a grin and its mole
    g.fillStyle = '#3fb43a'; g.fillRect(x, y, 64, 64); [[20, 26], [44, 26]].forEach(function (e) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + e[0], y + e[1], 9, 0, 6.3); g.fill(); g.fillStyle = '#f1e7d0'; g.beginPath(); g.arc(x + e[0], y + e[1], 7.5, 0, 6.3); g.fill(); g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + e[0] + 2, y + e[1] + 1, 3.5, 0, 6.3); g.fill(); });
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 32, y + 42, 12, 0.15, Math.PI - 0.15); g.fill(); g.fillStyle = '#c4121c'; g.beginPath(); g.arc(x + 32, y + 44, 8, 0.3, Math.PI - 0.3); g.fill(); g.fillStyle = '#1a6a1a'; g.beginPath(); g.arc(x + 48, y + 44, 3, 0, 6.3); g.fill();
  });
  DRVT.blumf = slot(function (g, x, y) { // Blumhead: angry eyes and a wide toothy grin
    g.fillStyle = '#c4121c'; g.fillRect(x, y, 64, 64);
    [[20, 1], [44, -1]].forEach(function (e) { var ex = x + e[0], ey = y + 28; g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(ex, ey, 9, 7, 0, 0, 6.3); g.fill(); g.fillStyle = '#ffe36a'; g.beginPath(); g.ellipse(ex, ey, 7, 5, 0, 0, 6.3); g.fill(); g.fillStyle = '#12040a'; g.fillRect(ex - 1.5, ey - 4, 3, 8);
      g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(ex - 11 * e[1], ey - 14); g.lineTo(ex + 10 * e[1], ey - 6); g.lineTo(ex + 10 * e[1], ey - 10); g.lineTo(ex - 11 * e[1], ey - 18); g.fill(); });
    g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(x + 12, y + 42); g.quadraticCurveTo(x + 32, y + 62, x + 52, y + 42); g.quadraticCurveTo(x + 32, y + 50, x + 12, y + 42); g.fill();
    g.fillStyle = '#f1e7d0'; for (var i = 0; i < 6; i++) { var tx = x + 17 + i * 5.5; g.fillRect(tx, y + 44 + Math.abs(i - 2.5) * -0.6, 3, 4); }
  });
  DRVTEX = R3.texture(c, true); DRVTEX.canvas = c; return DRVTEX;
}
function driver3D(m, k, fr) {
  var d = DRV3D[k.c.id] || DRV3D.cumhead, W = DRVT.white, face = DRVT[k.c.id], hf = -0.24, hu = 1.3, R = RACE, t = R ? R.t : 0;
  var body = d.body || d.col, arm = d.arm || body, hand = d.hand || '#f0c8a0';
  if (d.kind === 'cat') { // Sir Johnathan: a cat in a kart
    ball(m, fr, W, -0.28, 0, 0.62, 0.42, 0.3, 0.3, '#1a1418', 8, { rings: 5 }); ball(m, fr, W, -0.06, 0, 0.62, 0.22, 0.2, 0.2, '#f1e7d0', 6, { rings: 4 });
    ball(m, fr, W, -0.18, 0, 1.06, 0.3, 0.32, 0.28, '#1a1418', 8, { face: { T: DRVT.cat, fz: 0.3, w: 0.9, h: 0.9 } });
    [-1, 1].forEach(function (sd) { tube(m, fr, W, [-0.2, sd * 0.18, 1.25], [-0.22, sd * 0.22, 1.55], 0.1, 0.0, '#1a1418', 4); });
    tube(m, fr, W, [-0.6, 0, 0.6], [-0.95, 0.15 * Math.sin(t * 4), 1.05], 0.06, 0.04, '#1a1418', 5); return;
  }
  // body and arms reaching for the wheel
  hull(m, fr, W, bx(-0.44, -0.08, -0.25, 0.25, 0.42, 0.95, { nf: 0.04 }), body);
  if (d.trim) hull(m, fr, W, bx(-0.08, -0.06, -0.12, 0.12, 0.5, 0.9), d.trim);
  if (d.cape) hull(m, fr, W, bx(-0.52, -0.44, -0.3, 0.3, 0.4, 1.0), d.cape);
  var wob = Math.sin(k.steerVis * 1.2) * 0.06;
  [-1, 1].forEach(function (sd) {
    tube(m, fr, W, [-0.22, sd * 0.29, 0.86], [0.1, sd * 0.25, 0.66], 0.075, 0.07, arm, 5);
    tube(m, fr, W, [0.1, sd * 0.25, 0.66], [0.4, sd * 0.15 + sd * wob, 0.62 + sd * wob], 0.07, 0.06, arm, 5);
    ball(m, fr, W, 0.42, sd * 0.15 + sd * wob, 0.62 + sd * wob, 0.065, 0.065, 0.065, hand, 5, { rings: 3 });
  });
  if (d.kind === 'drop' || d.kind === 'blob') {
    var tex = d.kind === 'blob' ? { T: DRVT.blob, fz: 0.25 } : d.ownface ? { T: DRVT[d.ownface], fz: 0.2 } : face ? { T: face, fz: 0.18, w: 0.95, h: 0.95, dv: 0.04 } : null;
    ball(m, fr, W, hf, 0, hu + 0.02, 0.38, 0.4, 0.38, d.col, 9, { rings: 7, face: tex, tip: d.tip || 0 });
    if (d.tip) tube(m, fr, W, [hf - 0.02, 0, hu + 0.36], [hf - 0.12, 0, hu + 0.62], 0.12, 0.0, d.col, 6);
    if (d.curl) ball(m, fr, W, hf - 0.14, 0, hu + 0.64, 0.07, 0.07, 0.07, d.col, 5, { rings: 3 });
  } else {
    ball(m, fr, W, hf, 0, hu, 0.34, 0.36, 0.34, d.skin || d.col, 9, { rings: 7, face: face ? { T: face, fz: 0.2, w: 0.95, h: 0.95 } : null });
    if (d.kind === 'pig') { tube(m, fr, W, [hf + 0.3, 0, hu - 0.08], [hf + 0.42, 0, hu - 0.08], 0.12, 0.12, '#ff7a9a', 7, { cap: '#ff7a9a' }); [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf - 0.05, sd * 0.24, hu + 0.24], [hf - 0.02, sd * 0.32, hu + 0.42], 0.09, 0.0, d.col, 4); }); }
    if (!d.hat && d.kind !== 'pig') ball(m, fr, W, hf - 0.03, 0, hu + 0.04, 0.35, 0.38, 0.36, d.hair, 9, { rings: 4, b0: 0, b1: 1.5 }); // hair cap over the back and top
    if (d.kind !== 'pig' && d.hat !== 'beanie' && d.hat !== 'viking') ball(m, fr, W, hf - 0.02, 0, hu, 0.355, 0.375, 0.355, d.hair, 9, { rings: 6, b0: 0.2, b1: 2.3, back: -0.2 }); // the back of the head
    if (d.long) ball(m, fr, W, hf - 0.12, 0, hu - 0.22, 0.32, 0.4, 0.42, d.hair, 9, { rings: 5, b0: 0.6, b1: 2.6, back: -0.3 });
    if (d.hat === 'chef') { tube(m, fr, W, [hf, 0, hu + 0.22], [hf, 0, hu + 0.5], 0.27, 0.3, d.hatc, 9); ball(m, fr, W, hf, 0, hu + 0.6, 0.34, 0.36, 0.18, d.hatc, 9, { rings: 4 }); }
    if (d.hat === 'cowboy') { tube(m, fr, W, [hf, 0, hu + 0.2], [hf, 0, hu + 0.24], 0.56, 0.56, d.hatc, 10, { cap: d.hatc }); tube(m, fr, W, [hf, 0, hu + 0.22], [hf, 0, hu + 0.5], 0.28, 0.24, d.hatc, 8, { cap: d.hatc }); }
    if (d.hat === 'beanie') { ball(m, fr, W, hf, 0, hu + 0.12, 0.37, 0.39, 0.4, d.hatcols[0], 9, { rings: 2, b0: 0, b1: 0.5 }); ball(m, fr, W, hf, 0, hu + 0.12, 0.37, 0.39, 0.4, d.hatcols[1], 9, { rings: 1, b0: 0.5, b1: 0.85 }); ball(m, fr, W, hf, 0, hu + 0.12, 0.37, 0.39, 0.4, d.hatcols[2], 9, { rings: 1, b0: 0.85, b1: 1.2 }); }
    if (d.hat === 'viking') { ball(m, fr, W, hf, 0, hu + 0.1, 0.37, 0.39, 0.38, d.hatc, 9, { rings: 3, b0: 0, b1: 1.3 }); [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf, sd * 0.32, hu + 0.25], [hf + 0.05, sd * 0.62, hu + 0.62], 0.09, 0.0, '#f1e7d0', 5); }); }
  }
  if (d.crown) { tube(m, fr, W, [hf, 0, hu + 0.3], [hf, 0, hu + 0.46], 0.3, 0.3, '#ffe36a', 10); for (var j = 0; j < 5; j++) { var a = j / 5 * Math.PI * 2; tube(m, fr, W, [hf + Math.cos(a) * 0.26, Math.sin(a) * 0.26, hu + 0.46], [hf + Math.cos(a) * 0.26, Math.sin(a) * 0.26, hu + 0.66], 0.06, 0.0, '#ffe36a', 4); } }
}
