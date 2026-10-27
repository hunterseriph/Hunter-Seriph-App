/* =====================================================================================================
   DRAWING THE RACE: the sky, the world, karts built from boxes each frame, drivers and scenery as
   billboards from the sprite sheet (front, back and side views), effects, then the HUD over the top.
   ===================================================================================================== */
var SHEETTEX = null, SKYMESH = null;
function sheetTex() { if (!SHEETTEX && KIT.sheetReady) SHEETTEX = R3.texture(KIT.sheet); return SHEETTEX; }
function sprRect(n, flip) {
  var f = KIT.SPR[n], im = KIT.sheet; if (!f || !im || !im.width) return null;
  var W = im.width, H = im.height, r = [(f[0] + 0.02) / W, (f[1] + 0.02) / H, (f[2] - 0.04) / W, (f[3] - 0.04) / H];
  return { t: r, w: f[2], h: f[3], flip: flip };
}
/* a billboard: stands upright and turns to face the camera (sideways only) */
function billboard(m, x, y, z, n, sc, o) {
  o = o || {}; var r = sprRect(n, o.flip); if (!r) return; var cr = R3.cam.right, w = r.w * sc, h = r.h * sc, c = o.col || [0.5, 0.5, 0.5];
  var ax = x - cr[0] * w / 2, az = z - cr[2] * w / 2, bx = x + cr[0] * w / 2, bz = z + cr[2] * w / 2, y0 = y + (o.dy || 0), y1 = y0 + h * (o.squash || 1);
  var u0 = o.flip ? 0.999 : 0.001, u1 = o.flip ? 0.001 : 0.999, vt = o.crop ? 0.001 : 0.001, vb = o.crop ? 1 - o.crop : 0.999;
  if (o.crop) y0 += h * o.crop * (o.squash || 1) * 0; // cropped sprites keep their feet where they are
  m.quad([ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az], [u0, vb, u1, vb, u1, vt, u0, vt], r.t, c);
}
/* a flat sprite lying on the ground (shadows, splats) */
function flat(m, A, x, y, z, s, tile, col, rot) {
  var c = Math.cos(rot || 0) * s, sn = Math.sin(rot || 0) * s;
  m.quad([x - c + sn, y, z - sn - c], [x + c + sn, y, z + sn - c], [x + c - sn, y, z + sn + c], [x - c - sn, y, z - sn + c], [0.001, 0.001, 0.999, 0.001, 0.999, 0.999, 0.001, 0.999], A.tile(tile), col);
}
/* ---------- the kart: boxes in the driver's colours ---------- */
function kartModel(m, A, k) {
  var R = RACE, yaw = k.yaw + (k.drift ? k.drift * 0.38 : 0) + (k.spinA || 0), sq = k.squashT > 0 ? 0.45 : 1;
  var S = R.T.S, a = S[k.seg < 0 ? 0 : k.seg], b = S[(k.seg + 1) % R.T.N], pitch = k.air ? clamp(k.vy * 0.03, -0.35, 0.35) : Math.atan2(b.y - a.y, STEP);
  var cp = Math.cos(pitch), sp = Math.sin(pitch), F = [Math.cos(yaw) * cp, sp, Math.sin(yaw) * cp], U = [-Math.cos(yaw) * sp, cp, -Math.sin(yaw) * sp], Sd = [-Math.sin(yaw), 0, Math.cos(yaw)];
  var hop = k.hopT > 0 ? Math.sin(k.hopT / 0.18 * Math.PI) * 0.35 : 0, bob = Math.sin(RACE.t * 30 + k.slot) * 0.02 * Math.min(1, Math.abs(k.spd) / 10);
  var ox = k.x, oy = k.y + hop + bob, oz = k.z, L = RACE.def.light;
  function P(f, s, u) { u *= sq; return [ox + F[0] * f + Sd[0] * s + U[0] * u, oy + F[1] * f + U[1] * u, oz + F[2] * f + Sd[2] * s + U[2] * u]; }
  function C(hex, kk) { var c = hexrgb(hex); return [c[0] / 255 * L[0] * 1.6 * kk, c[1] / 255 * L[1] * 1.6 * kk, c[2] / 255 * L[2] * 1.6 * kk]; }
  function box(f0, f1, s0, s1, u0, u1, hex, tile, taper) {
    var t = A.tile(tile || 'white'), tp = taper || 0, c = C(hex, 1), cd = C(hex, 0.62), cs = C(hex, 0.8);
    var p = [P(f0, s0, u0), P(f1, s0 + tp, u0), P(f1, s1 - tp, u0), P(f0, s1, u0), P(f0, s0, u1), P(f1, s0 + tp, u1), P(f1, s1 - tp, u1), P(f0, s1, u1)], uv = [0, 1, 1, 1, 1, 0, 0, 0];
    m.quad(p[4], p[5], p[6], p[7], uv, t, c); m.quad(p[0], p[1], p[5], p[4], uv, t, cs); m.quad(p[3], p[2], p[6], p[7], uv, t, cs);
    m.quad(p[1], p[2], p[6], p[5], uv, t, cd); m.quad(p[0], p[3], p[7], p[4], uv, t, cd);
  }
  var col = k.c.kart;
  box(-1.0, 0.95, -0.62, 0.62, 0.16, 0.42, col[0]);           // chassis
  box(0.6, 1.3, -0.5, 0.5, 0.14, 0.34, col[1], null, 0.22);   // nose
  box(-0.55, 0.45, -0.82, -0.6, 0.16, 0.52, col[2]); box(-0.55, 0.45, 0.6, 0.82, 0.16, 0.52, col[2]); // side pods
  box(-0.72, -0.56, -0.36, 0.36, 0.42, 0.78, col[1]);         // seat back
  box(-1.05, -0.72, -0.42, 0.42, 0.42, 0.72, '#8a828a', 'metal'); // engine
  box(-1.18, -0.98, -0.34, -0.2, 0.56, 0.7, '#5a545c'); box(-1.18, -0.98, 0.2, 0.34, 0.56, 0.7, '#5a545c'); // exhausts
  box(0.32, 0.42, -0.12, 0.12, 0.55, 0.8, '#12040a');         // steering column
  box(1.1, 1.32, -0.66, 0.66, 0.12, 0.26, col[0]);            // front bumper
  var wr = 0.27, steerA = k.steerVis * 0.4;
  [[0.78, 1], [0.78, -1], [-0.72, 1], [-0.72, -1]].forEach(function (w, i) {
    var s0 = w[1] * 0.62, s1 = w[1] * 0.95, f = w[0], ws = i < 2 ? steerA : 0, roll = (RACE.t * k.spd * 0.8) % 1;
    var cs2 = Math.cos(ws) * 0.3, sn2 = Math.sin(ws) * 0.3;
    box(f - cs2, f + cs2, Math.min(s0, s1) - sn2 * w[1], Math.max(s0, s1) + sn2 * w[1], 0.0, wr * 2, '#2a2228', 'tire');
  });
  // the driver
  var c = k.c, d = R3.cam.fwd, kf = [Math.cos(k.yaw + (k.spinA || 0)), Math.sin(k.yaw + (k.spinA || 0))], dot = d[0] * kf[0] + d[2] * kf[1], cross = d[0] * kf[1] - d[2] * kf[0];
  var name = c.f, flip = false;
  if (c.only) { name = c.side; flip = cross > 0; if (dot < -0.5) flip = !flip; }
  else if (dot > 0.35) name = 'ckb_' + c.id;
  else if (dot < -0.35) name = c.f;
  else if (c.side) { name = c.side; flip = cross > 0; }
  var sc = c.sc * 0.052, sp2 = P(-0.2, 0, 0.3);
  k._drv = { x: sp2[0], y: sp2[1], z: sp2[2], n: name, sc: sc, flip: flip, sq: sq };
}
function boxModel(m, A, x, y, z, s, rot, tile, col) {
  var c = Math.cos(rot) * s, sn = Math.sin(rot) * s, t = A.tile(tile);
  var p = [[x - c + sn, y, z - sn - c], [x + c + sn, y, z + sn - c], [x + c - sn, y, z + sn + c], [x - c - sn, y, z - sn + c]], uv = [0.001, 0.999, 0.999, 0.999, 0.999, 0.001, 0.001, 0.001];
  for (var i = 0; i < 4; i++) { var a = p[i], b = p[(i + 1) % 4], k = 0.7 + 0.3 * ((i % 2) ? 1 : 0.6); m.quad(a, b, [b[0], y + s * 2, b[2]], [a[0], y + s * 2, a[2]], uv, t, mulc(col, k)); }
  m.quad([p[0][0], y + s * 2, p[0][2]], [p[1][0], y + s * 2, p[1][2]], [p[2][0], y + s * 2, p[2][2]], [p[3][0], y + s * 2, p[3][2]], uv, t, mulc(col, 1.1));
}
/* ---------- the camera ---------- */
function camera(dt) {
  var R = RACE, k = R.me, T = R.T;
  if (R.phase === 'intro') { // a slow swing round the starting grid
    var s0 = T.S[0], a = R.phaseT * 0.5 - 1.2, r = 26; var eye = [s0.x + Math.cos(a) * r, s0.y + 9 - R.phaseT, s0.z + Math.sin(a) * r];
    R.cam = { eye: eye, at: [s0.x, s0.y + 1, s0.z] }; R.camYaw = k.yaw; return R.cam;
  }
  if (R.phase === 'done' && R.doneT > 0.6) { var a2 = R.t * 0.4, eye2 = [k.x + Math.cos(a2) * 7, k.y + 2.6, k.z + Math.sin(a2) * 7]; R.cam = { eye: eye2, at: [k.x, k.y + 0.9, k.z] }; return R.cam; }
  var want = k.yaw + (k.drift ? k.drift * 0.22 : 0), back = KIT.held('lb') && KIT.held('rb');
  R.camYaw += angDiff(want, R.camYaw) * Math.min(1, dt * (k.drift ? 3.2 : 5.5));
  var dist = 6.2 + Math.min(1.2, Math.max(0, k.spd) / 30), hgt = 2.5, cy = R.camYaw + (back ? Math.PI : 0);
  var e = [k.x - Math.cos(cy) * dist, k.y + hgt, k.z - Math.sin(cy) * dist];
  // keep the camera inside the walls on indoor courses
  var q = T.locate(e[0], e[2], k.seg); if (Math.abs(q.lat) > T.edge - 0.5 && R.def.wallH > 2.5) { var sd = Math.sign(q.lat), over = Math.abs(q.lat) - (T.edge - 0.5); e[0] -= q.s.nx * sd * over; e[2] -= q.s.nz * sd * over; }
  e[1] = Math.max(e[1], q.y + 1.6);
  if (!R.cam || R.camSnap) { R.cam = { eye: e, at: [k.x, k.y + 1, k.z] }; R.camSnap = false; }
  var ce = R.cam.eye; for (var i = 0; i < 3; i++) ce[i] += (e[i] - ce[i]) * Math.min(1, dt * 9);
  var at = [k.x + Math.cos(cy) * 3, k.y + 1.1, k.z + Math.sin(cy) * 3]; R.cam.at = at;
  if (R.shake > 0) { R.shake -= dt; ce[0] += (Math.random() - 0.5) * 0.3; ce[1] += (Math.random() - 0.5) * 0.3; }
  return R.cam;
}
/* ---------- one frame of the 3D view ---------- */
var FOV = 1.12;
function drawRace(dt) {
  var R = RACE; if (!R || !R3.ok) return; var A = R.A, def = R.def, cam = camera(dt), k = R.me;
  var fog = hexrgb(def.fog).map(function (v) { return v / 255; }), fov = FOV + (k.boostT > 0 ? 0.12 : 0) + (k.nadoT > 0 ? 0.08 : 0);
  R.fov = (R.fov || fov) + (fov - (R.fov || fov)) * Math.min(1, dt * 4);
  R3.begin(fog); R3.setTime(R.t);
  // sky: a cylinder round the camera, no fog
  R3.setCam(cam.eye, cam.at, R.fov, fog, [1e5, 2e5]);
  if (!SKYMESH) SKYMESH = new R3.Mesh();
  var sm = new R3.Mesh(), e = cam.eye, rad = 380, segs = 24, top = 130, bot = -10;
  for (var i = 0; i < segs; i++) {
    var a0 = i / segs * Math.PI * 2, a1 = (i + 1) / segs * Math.PI * 2, u0 = i / segs * 4, u1 = (i + 1) / segs * 4;
    sm.quad([e[0] + Math.cos(a0) * rad, e[1] + bot, e[2] + Math.sin(a0) * rad], [e[0] + Math.cos(a1) * rad, e[1] + bot, e[2] + Math.sin(a1) * rad], [e[0] + Math.cos(a1) * rad, e[1] + top, e[2] + Math.sin(a1) * rad], [e[0] + Math.cos(a0) * rad, e[1] + top, e[2] + Math.sin(a0) * rad], [u0, 0.999, u1, 0.999, u1, 0.001, u0, 0.001], [0, 0, 1, 1], [0.5, 0.5, 0.5]);
  }
  R3.snap(false); R3.draw(sm, R.sky, { noDepth: true }); R3.snap(true);
  R3.setCam(cam.eye, cam.at, R.fov, fog, def.fogR);
  // the world
  R3.draw(R.mesh, R.atlas);
  var stx = sheetTex();
  if (stx && !R.decalMesh) { var dmh = new R3.Mesh(); R.B.decals.forEach(function (d) { var r = sprRect(d.spr); if (!r) return; var c = Math.cos(d.ry), s = Math.sin(d.ry), col = d.col || def.light; dmh.quad([d.x - c * d.w / 2, d.y, d.z - s * d.w / 2], [d.x + c * d.w / 2, d.y, d.z + s * d.w / 2], [d.x + c * d.w / 2, d.y + d.h, d.z + s * d.w / 2], [d.x - c * d.w / 2, d.y + d.h, d.z - s * d.w / 2], [0.001, 0.999, 0.999, 0.999, 0.999, 0.001, 0.001, 0.001], r.t, col); }); R.decalMesh = dmh.n ? dmh.upload() : dmh; }
  if (stx && R.decalMesh && R.decalMesh.count) R3.draw(R.decalMesh, stx);
  // moving things made of boxes and flat tiles
  var dm = new R3.Mesh(), sp = new R3.Mesh(), L = def.light;
  R.karts.forEach(function (kk) {
    kartModel(dm, A, kk);
    var q = R.T.locate(kk.x, kk.z, kk.seg); flat(dm, A, kk.x, q.y + 0.06, kk.z, 1.25, 'shadow', [0.5, 0.5, 0.5], kk.yaw);
    // drift sparks and boost flames
    if (kk.drift && kk.driftLvl > 0 && !kk.air) for (var s = -1; s <= 1; s += 2) { var sx = kk.x - Math.cos(kk.yaw) * 1.1 + -Math.sin(kk.yaw) * 0.8 * s, sz = kk.z - Math.sin(kk.yaw) * 1.1 + Math.cos(kk.yaw) * 0.8 * s; for (var j = 0; j < 3; j++) spark(dm, A, sx + (Math.random() - 0.5) * 0.4, kk.y + 0.15 + Math.random() * 0.4, sz + (Math.random() - 0.5) * 0.4, 0.09 + Math.random() * 0.07, 'spark' + kk.driftLvl); }
    if (kk.boostT > 0 || kk.nadoT > 0) for (var s2 = -1; s2 <= 1; s2 += 2) { var bx = kk.x - Math.cos(kk.yaw) * 1.35 + -Math.sin(kk.yaw) * 0.27 * s2, bz = kk.z - Math.sin(kk.yaw) * 1.35 + Math.cos(kk.yaw) * 0.27 * s2; spark(dm, A, bx - Math.cos(kk.yaw) * Math.random() * 0.5, kk.y + 0.62, bz - Math.sin(kk.yaw) * Math.random() * 0.5, 0.16 + Math.random() * 0.12, Math.random() < 0.5 ? 'flame1' : 'flame2'); }
    if (!kk.air && Math.abs(kk.lat) > def.hw + 0.6 && kk.spd > 6 && Math.random() < 0.6) R.fx.push({ k: 'dust', x: kk.x - Math.cos(kk.yaw), y: kk.y + 0.2, z: kk.z - Math.sin(kk.yaw), t: 0.35, vx: 0, vy: 1.5, vz: 0 });
  });
  R.boxes.forEach(function (b) { if (b.t > 0) return; boxModel(dm, A, b.x, b.y + 0.7 + Math.sin(R.t * 3 + b.ph) * 0.15, b.z, 0.55, R.t * 1.6 + b.ph, 'box', mulc(L, 1.25)); });
  R.fx.forEach(function (f) {
    if (f.k === 'dust') spark(dm, A, f.x, f.y + (0.35 - f.t), f.z, 0.25 + (0.35 - f.t), 'dust');
    else if (f.k === 'trail') spark(dm, A, f.x, f.y, f.z, 0.12, 'cream');
    else if (f.k === 'box') for (var q = 0; q < 6; q++) spark(dm, A, f.x + Math.cos(q + R.t * 9) * (0.35 - f.t) * 6, f.y + (0.35 - f.t) * 3, f.z + Math.sin(q + R.t * 9) * (0.35 - f.t) * 6, 0.18, 'spark2');
    else if (f.k === 'pop') for (var q2 = 0; q2 < (f.big ? 16 : 9); q2++) { var aa = q2 / (f.big ? 16 : 9) * 6.28, rr = (0.6 - f.t) * (f.big ? 14 : 6); spark(dm, A, f.x + Math.cos(aa) * rr, f.y + Math.sin(q2 * 2.1) * rr * 0.4 + 0.3, f.z + Math.sin(aa) * rr, 0.22, 'cream'); }
  });
  if (R.TH.drawDyn) R.TH.drawDyn(R, dm, sp);
  R3.draw(dm, R.atlas);
  // sprites: drivers, scenery cut-outs, drops, items in flight
  var st = sheetTex(); if (!st) return;
  R.karts.forEach(function (kk) {
    var d = kk._drv; if (!d) return; billboard(sp, d.x, d.y, d.z, d.n, d.sc, { flip: d.flip, squash: d.sq });
    if (kk.shieldT > 0) billboard(sp, kk.x, kk.y - 0.1, kk.z, 'ck_shield', 0.075, { col: [0.6, 0.6, 0.7] });
    if (kk.nadoT > 0) for (var j = 0; j < 7; j++) { var a = R.t * 9 + j * 0.9, r = 1.2 + (j % 3) * 0.25; billboard(sp, kk.x + Math.cos(a) * r, kk.y + 0.1 + j * 0.28, kk.z + Math.sin(a) * r, j % 2 ? 'mn_sausage' : 'ao_meat' + (j % 4 ? 0 : 1), 0.045); }
    if (kk.gooT > 0) billboard(sp, kk.x, kk.y + 1.7, kk.z, 'f_blumling_' + (Math.floor(R.t * 6) % 4), 0.04);
    if (kk.squashT > 0 && kk.spinT > 0) for (var s3 = 0; s3 < 3; s3++) { var a3 = R.t * 6 + s3 * 2.1; billboard(sp, kk.x + Math.cos(a3) * 0.6, kk.y + 1.6, kk.z + Math.sin(a3) * 0.6, 'ck_star', 0.04); }
  });
  R.drops.forEach(function (d) { if (d.t > 0) return; if (Math.abs(d.x - cam.eye[0]) + Math.abs(d.z - cam.eye[2]) > 180) return; billboard(sp, d.x, d.y + 0.35 + Math.sin(R.t * 4 + d.x) * 0.12, d.z, 'mn_drop', 0.065); });
  R.proj.forEach(function (p) {
    if (p.k === 'pie') billboard(sp, p.x, p.y - 0.3, p.z, 'it_pie', 0.07);
    else if (p.k === 'sperm') billboard(sp, p.x, p.y - 0.3, p.z, 'ck_sperm', 0.07, { flip: Math.cos(p.a) * R3.cam.right[0] + Math.sin(p.a) * R3.cam.right[2] < 0 });
    else if (p.k === 'cat') billboard(sp, p.x, p.y + Math.abs(Math.sin(R.t * 14)) * 0.5, p.z, 'cat', 0.17, { flip: Math.cos(p.a) * R3.cam.right[0] + Math.sin(p.a) * R3.cam.right[2] < 0 });
  });
  R.traps.forEach(function (t) { billboard(sp, t.x, t.y, t.z, 'mn_pill', 0.07); });
  R.fx.forEach(function (f) { if (f.k === 'drop') billboard(sp, f.x, f.y, f.z, 'mn_drop', 0.05); });
  var cx = cam.eye[0], cz = cam.eye[2], fw = R3.cam.fwd;
  R.B.bills.forEach(function (b) {
    var dx = b.x - cx, dz = b.z - cz; if (dx * fw[0] + dz * fw[2] < -6) return; if (dx * dx + dz * dz > 260 * 260) return;
    var n = b.anim ? b.anim(R.t) : b.spr; billboard(sp, b.x, b.y, b.z, n, b.sc, { flip: b.flip, col: b.col });
  });
  if (R.TH.drawBills) R.TH.drawBills(R, sp);
  R3.draw(sp, st);
}
function spark(m, A, x, y, z, s, tile) { var r = R3.cam.right; m.quad([x - r[0] * s, y - s, z - r[2] * s], [x + r[0] * s, y - s, z + r[2] * s], [x + r[0] * s, y + s, z + r[2] * s], [x - r[0] * s, y + s, z - r[2] * s], [0.1, 0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1], A.tile(tile), [0.5, 0.5, 0.5]); }

/* ---------- the HUD (480x270, over the 3D) ---------- */
var R2 = KIT.R, text = KIT.text, spr = KIT.spr;
function ordinal(n) { return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'); }
function fmtTime(t) { var m = Math.floor(t / 60), s = t - m * 60; return m + "'" + (s < 10 ? '0' : '') + s.toFixed(2).replace('.', '"'); }
var MAPC = null;
function drawHud() {
  var R = RACE, ctx = KIT.ctx, k = R.me; ctx.clearRect(0, 0, 480, 270);
  if (R.phase === 'intro') {
    KIT.panel(110, 194, 260, 54); text(R.def.n.toUpperCase(), 240, 203, { align: 'center', col: '#ffe36a', size: 16, font: 'title' }); text('FROM ' + R.def.from.toUpperCase(), 240, 226, { align: 'center', size: 6, col: '#a6968f' });
    text(R.tt ? 'TIME TRIAL' : R.cls.n.toUpperCase() + '  ·  ' + R.laps + ' LAPS', 240, 236, { align: 'center', size: 6 }); return;
  }
  // lap and time
  KIT.panel(6, 6, 104, 34); text('LAP', 14, 13, { size: 8, col: '#a6968f' }); text(Math.max(1, Math.min(R.laps, k.lap)) + '/' + R.laps, 46, 12, { size: 16, col: '#f1e7d0' });
  text(fmtTime(k.time), 14, 28, { size: 8, col: '#ffe36a' });
  // drops
  spr('mn_drop', 124, 30, { sc: 1.4 }); text('×' + k.drops, 134, 20, { size: 8, col: k.drops >= 10 ? '#ffe36a' : '#f1e7d0' });
  // item slot
  KIT.panel(214, 4, 52, 44); var it = k.item;
  if (k.roul > 0) { var keys = Object.keys(ITEMS), ik = ITEMS[keys[Math.floor(R.t * 14) % keys.length]].ic; spr(ik, 240, 40, { sc: 1.5 }); sfx.play && Math.floor(R.t * 14) !== Math.floor((R.t - 1 / 60) * 14) && sfx.play('tick'); }
  else if (it) { spr(ITEMS[it].ic, 240, 40, { sc: it === 'sirj' ? 1.4 : 1.5 }); if (k.itemN > 1) text('×' + k.itemN, 258, 36, { size: 8, col: '#ffe36a' }); }
  if (k.shieldT > 0) { R2('#9adfff', 216, 47, 48 * k.shieldT / 14, 2); }
  // place
  if (!R.tt) { var pl = k.place, col = pl === 1 ? '#ffe36a' : pl === 2 ? '#d0c8d0' : pl === 3 ? '#e09a5a' : '#ff2630'; text(String(pl), 404, 140, { size: 48, col: col, font: 'title', outline: true }); text(ordinal(pl).slice(-2).toUpperCase(), 436, 148, { size: 16, col: col, font: 'title', outline: true }); }
  // map
  drawMap(392, 54, 84, 84);
  // countdown and banners
  if (R.phase === 'count') { var n = 3 - Math.floor(R.phaseT), f = R.phaseT % 1; text(String(n), 240, 100 - f * 6, { size: 64, align: 'center', col: n === 1 ? '#ffe36a' : '#ff2630', font: 'title', outline: true, alpha: 1 - f * 0.5 }); }
  if (R.phase === 'go' && R.t < 1.2) text('GO!', 240, 96, { size: 64, align: 'center', col: '#ffe36a', font: 'title', outline: true, alpha: Math.min(1, (1.2 - R.t) * 2) });
  if (R.lapBanner > 0) text(R.bannerTxt, 240, 96, { size: 32, align: 'center', col: R.bannerTxt === 'FINAL LAP' ? '#ffe36a' : '#f1e7d0', font: 'title', outline: true, alpha: Math.min(1, R.lapBanner * 2) });
  if (k.wrongT > 1.2 && !k.done && Math.floor(R.t * 3) % 2) text('WRONG WAY', 240, 120, { size: 16, align: 'center', col: '#ff2630', outline: true });
  if (R.phase === 'done') text(R.tt ? 'TIME!' : (k.place === 1 ? 'YOU WIN!' : 'FINISH!'), 240, 90, { size: 48, align: 'center', col: '#ffe36a', font: 'title', outline: true });
  if (R.msg) { var w = Math.min(420, KIT.tw(R.msg.who + ': ' + R.msg.s, 6) + 20); KIT.panel(240 - w / 2, 222, w, 20, { edge: '#4a1a1c' }); text(R.msg.who.toUpperCase() + ': ' + R.msg.s, 240, 229, { size: 6, align: 'center', col: '#f1e7d0', max: w - 10 }); }
  if (R.gooScreen > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.75, R.gooScreen / 2.6); for (var g = 0; g < 9; g++) { var gx = (g * 61 + 17) % 470, gy = (g * 37) % 180, gl = 30 + (g * 13) % 50 + (2.6 - R.gooScreen) * 30; ctx.fillStyle = g % 2 ? '#5a1a8a' : '#9a4aff'; ctx.fillRect(gx, 0, 10, gy + gl); ctx.beginPath(); ctx.arc(gx + 5, gy + gl, 7, 0, 6.3); ctx.fill(); } ctx.restore(); }
  if (R.flash > 0) { ctx.fillStyle = 'rgba(255,240,200,' + (R.flash * 4).toFixed(2) + ')'; ctx.fillRect(0, 0, 480, 270); }
  if (k.drift && k.driftLvl > 0) { var dc = ['', '#6ac8ff', '#ffb040', '#fff6d8'][k.driftLvl]; R2(dc, 216, 50, 48 * Math.min(1, k.driftLvl / 3), 2); }
}
function drawMap(x0, y0, w, h) {
  var R = RACE, T = R.T, b = T.box, sc = Math.min(w / (b[2] - b[0] + 20), h / (b[3] - b[1] + 20)), ox = x0 + w / 2 - (b[0] + b[2]) / 2 * sc, oz = y0 + h / 2 - (b[1] + b[3]) / 2 * sc, ctx = KIT.ctx;
  ctx.save(); ctx.globalAlpha = 0.85; ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#12040a'; ctx.beginPath(); T.S.forEach(function (q, i) { if (i % 3) return; var X = ox + q.x * sc, Z = oz + q.z * sc; if (!i) ctx.moveTo(X, Z); else ctx.lineTo(X, Z); }); ctx.closePath(); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#a6968f'; ctx.stroke(); ctx.restore();
  var s0 = T.S[0]; R2('#f1e7d0', ox + s0.x * sc - 3, oz + s0.z * sc - 1, 6, 2);
  R.karts.slice().reverse().forEach(function (k) { var me = k === R.me, X = ox + k.x * sc, Z = oz + k.z * sc; R2('#12040a', X - (me ? 3 : 2), Z - (me ? 3 : 2), me ? 6 : 4, me ? 6 : 4); R2(me ? '#ffe36a' : k.c.kart[0], X - (me ? 2 : 1), Z - (me ? 2 : 1), me ? 4 : 2, me ? 4 : 2); });
}
