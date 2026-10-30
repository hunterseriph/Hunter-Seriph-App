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
/* ---------- the kart and its driver: lit low-poly models (5b-models.js) ---------- */
function kartModel(m, A, k, dv) {
  var R = RACE, yaw = k.yaw + (k.drift ? k.drift * 0.38 : 0) + (k.spinA || 0), sq = k.squashT > 0 ? 0.45 : 1;
  var S = R.T.S, a = S[k.seg < 0 ? 0 : k.seg], b = S[(k.seg + 1) % R.T.N], pitch = k.air ? clamp(k.vy * 0.03, -0.35, 0.35) : Math.atan2(b.y - a.y, STEP);
  var hop = k.hopT > 0 ? Math.sin(k.hopT / 0.18 * Math.PI) * 0.35 : 0, bob = Math.sin(RACE.t * 30 + k.slot) * 0.02 * Math.min(1, Math.abs(k.spd) / 10);
  var tiny = k.tinyT > 0 ? 0.62 : 1, fr = Frame(k.x, k.y + hop + bob + (k.floatY || 0), k.z, yaw, pitch, sq, R.def.light, tiny); k._tiny = tiny;
  kart3D(m, A, k, fr); k._drv = null;
  if (dv) { driver3D(dv, k, fr); return; }
  // no driver texture yet: the old sprite
  var c = k.c, d = R3.cam.fwd, kf = [Math.cos(k.yaw + (k.spinA || 0)), Math.sin(k.yaw + (k.spinA || 0))], dot = d[0] * kf[0] + d[2] * kf[1], cross = d[0] * kf[1] - d[2] * kf[0];
  var name = c.f, flip = false;
  if (c.only) { name = c.side; flip = cross > 0; if (dot < -0.5) flip = !flip; }
  else if (dot > 0.35) name = 'ckb_' + c.id;
  else if (c.side && dot >= -0.35) { name = c.side; flip = cross > 0; }
  var sp2 = fr.P(-0.2, 0, 0.3); k._drv = { x: sp2[0], y: sp2[1], z: sp2[2], n: name, sc: c.sc * 0.052, flip: flip, sq: sq };
}
function boxModel(m, A, x, y, z, s, rot, tile, col) {
  var c = Math.cos(rot) * s, sn = Math.sin(rot) * s, t = A.tile(tile);
  var p = [[x - c + sn, y, z - sn - c], [x + c + sn, y, z + sn - c], [x + c - sn, y, z + sn + c], [x - c - sn, y, z - sn + c]], uv = [0.001, 0.999, 0.999, 0.999, 0.999, 0.001, 0.001, 0.001];
  for (var i = 0; i < 4; i++) { var a = p[i], b = p[(i + 1) % 4], k = 0.7 + 0.3 * ((i % 2) ? 1 : 0.6); m.quad(a, b, [b[0], y + s * 2, b[2]], [a[0], y + s * 2, a[2]], uv, t, mulc(col, k)); }
  m.quad([p[0][0], y + s * 2, p[0][2]], [p[1][0], y + s * 2, p[1][2]], [p[2][0], y + s * 2, p[2][2]], [p[3][0], y + s * 2, p[3][2]], uv, t, mulc(col, 1.1));
}
/* ---------- shop fronts stuck on buildings: always readable from the road, and a neon sign on the ones with no name painted on ---------- */
var SIGNS = { fac_bonjo: ["Bonjo's", 'BJ Boutique', '#d878ff'], fac_joff: ["Joff's", 'Pineapple Pizzaria', '#ffe36a'], fac_pulsar: ['PulsarOctopus', 'Beats', '#7af0ff'], fac_saba: ["Saba's", 'Hitless Hemporium', '#7dff3a'], fac_sanct: ["Spermaid's", 'Sanctum', '#ff6ab4'] };
var SIGNTEX = null, SIGNT = {};
function signTex() {
  if (SIGNTEX) return SIGNTEX; var c = document.createElement('canvas'); c.width = 256; c.height = 512; var g = c.getContext('2d'), n = 0;
  Object.keys(SIGNS).forEach(function (k) {
    var s = SIGNS[k], y = n * 64; n++; g.fillStyle = '#12040a'; g.fillRect(0, y, 256, 64); g.fillStyle = '#0a0204'; g.fillRect(4, y + 4, 248, 56);
    g.save(); g.shadowColor = s[2]; g.shadowBlur = 8; g.strokeStyle = s[2]; g.lineWidth = 2; g.strokeRect(8, y + 8, 240, 48);
    g.textAlign = 'center'; g.fillStyle = s[2]; g.font = '22px "Pirata One", serif'; g.fillText(s[0], 128, y + 30, 228); g.font = '18px "Pirata One", serif'; g.fillText(s[1], 128, y + 50, 228); g.restore();
    SIGNT[k] = [0.5 / 256, (y + 0.5) / 512, 255 / 256, 63 / 512];
  });
  SIGNTEX = R3.texture(c); return SIGNTEX;
}
function buildDecals(R) {
  var dmh = new R3.Mesh(), smh = new R3.Mesh(), def = R.def; signTex();
  R.B.decals.forEach(function (d) {
    var r = sprRect(d.spr); if (!r) return; var c = Math.cos(d.ry), s = Math.sin(d.ry), col = d.col || def.light;
    // the picture reads the right way round from the side its normal (-s, c) points to; if the road is behind it, mirror it so the words read properly
    var q = R.T.locate(d.x, d.z, -1), back = (q.s.x - d.x) * -s + (q.s.z - d.z) * c < 0, u0 = back ? 0.999 : 0.001, u1 = back ? 0.001 : 0.999;
    var nx = back ? s : -s, nz = back ? -c : c, x = d.x + nx * 0.06, z = d.z + nz * 0.06; // a hair in front of the wall, so the two never flicker
    dmh.quad([x - c * d.w / 2, d.y, z - s * d.w / 2], [x + c * d.w / 2, d.y, z + s * d.w / 2], [x + c * d.w / 2, d.y + d.h, z + s * d.w / 2], [x - c * d.w / 2, d.y + d.h, z - s * d.w / 2], [u0, 0.999, u1, 0.999, u1, 0.001, u0, 0.001], r.t, col);
    var sg = SIGNT[d.spr]; if (!sg) return;
    var sw = d.w * 0.95, sh = sw * 0.25, y0 = d.y + d.h * 0.98, sx = x + nx * 0.1, sz = z + nz * 0.1, su0 = back ? 0.999 : 0.001, su1 = back ? 0.001 : 0.999;
    smh.quad([sx - c * sw / 2, y0, sz - s * sw / 2], [sx + c * sw / 2, y0, sz + s * sw / 2], [sx + c * sw / 2, y0 + sh, sz + s * sw / 2], [sx - c * sw / 2, y0 + sh, sz - s * sw / 2], [su0, 0.999, su1, 0.999, su1, 0.001, su0, 0.001], sg, [0.5, 0.5, 0.5]);
  });
  R.decalMesh = dmh.n ? dmh.upload() : dmh; R.signMesh = smh.n ? smh.upload() : smh;
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
  if (stx && !R.decalMesh) buildDecals(R);
  if (stx && R.decalMesh && R.decalMesh.count) R3.draw(R.decalMesh, stx, { offset: 4 });
  if (R.signMesh && R.signMesh.count) R3.draw(R.signMesh, signTex(), { offset: 4 });
  // moving things made of boxes and flat tiles
  var dm = new R3.Mesh(), sp = new R3.Mesh(), L = def.light, dtx = driverTex(), dv = dtx ? new R3.Mesh() : null, shm = new R3.Mesh(), soft = new R3.Mesh(), glow = new R3.Mesh();
  R.soft = soft; R.glow = glow;
  R.karts.forEach(function (kk) {
    var far = Math.abs(kk.x - cam.eye[0]) + Math.abs(kk.z - cam.eye[2]);
    var gh = R.ghosts && kk !== R.me; if (gh && !R._gdm) { R._gdm = new R3.Mesh(); R._gdv = new R3.Mesh(); }
    kartModel(gh ? R._gdm : dm, A, kk, far < 140 ? (gh ? R._gdv : dv) : null);
    var q = R.T.locate(kk.x, kk.z, kk.seg); flat(shm, A, kk.x, q.y + 0.05, kk.z, 1.35 * (kk._tiny || 1) * (1 - Math.min(0.5, (kk.floatY || 0) * 0.15)), 'shadow', [0.5, 0.5, 0.5], kk.yaw);
    // drift sparks and boost flames
    if (kk.drift && kk.driftLvl > 0 && !kk.air) for (var s = -1; s <= 1; s += 2) { var sx = kk.x - Math.cos(kk.yaw) * 1.1 + -Math.sin(kk.yaw) * 0.8 * s, sz = kk.z - Math.sin(kk.yaw) * 1.1 + Math.cos(kk.yaw) * 0.8 * s; { for (var j = 0; j < 3; j++) spark(glow, A, sx + (Math.random() - 0.5) * 0.4, kk.y + 0.15 + Math.random() * 0.4, sz + (Math.random() - 0.5) * 0.4, 0.1 + Math.random() * 0.08, 'halo', DRIFTC[kk.driftLvl]); spark(glow, A, sx, kk.y + 0.3, sz, 0.55, 'halo', mulc(DRIFTC[kk.driftLvl], 0.5)); } }
    if (kk.boostT > 0 || kk.nadoT > 0) for (var s2 = -1; s2 <= 1; s2 += 2) { var bx = kk.x - Math.cos(kk.yaw) * 1.35 + -Math.sin(kk.yaw) * 0.27 * s2, bz = kk.z - Math.sin(kk.yaw) * 1.35 + Math.cos(kk.yaw) * 0.27 * s2; { var fl = Math.random(); spark(glow, A, bx - Math.cos(kk.yaw) * fl * 0.6, kk.y + 0.72, bz - Math.sin(kk.yaw) * fl * 0.6, 0.2 + Math.random() * 0.16, 'halo', fl < 0.5 ? [0.6, 0.45, 0.2] : [0.6, 0.2, 0.06]); spark(glow, A, bx, kk.y + 0.72, bz, 0.5, 'halo', [0.3, 0.15, 0.05]); } }
    if (!kk.air && Math.abs(kk.lat) > def.hw + 0.6 && kk.spd > 6 && Math.random() < 0.6) R.fx.push({ k: 'dust', x: kk.x - Math.cos(kk.yaw), y: kk.y + 0.2, z: kk.z - Math.sin(kk.yaw), t: 0.35, vx: 0, vy: 1.5, vz: 0 });
  });
  R.boxes.forEach(function (b) { if (b.t > 0) return; boxModel(dm, A, b.x, b.y + 0.7 + Math.sin(R.t * 3 + b.ph) * 0.15, b.z, 0.55, R.t * 1.6 + b.ph, 'box', mulc(L, 1.25)); });
  R.fx.forEach(function (f) {
    if (f.k === 'dust') spark(soft, A, f.x, f.y + (0.35 - f.t) * 1.5, f.z, 0.35 + (0.35 - f.t) * 2, 'puff', mulc(DUSTC(), 0.45 + f.t));
    else if (f.k === 'trail') spark(soft, A, f.x, f.y, f.z, 0.22, 'puff', [0.6, 0.58, 0.52]);
    else if (f.k === 'box') for (var q = 0; q < 6; q++) spark(glow, A, f.x + Math.cos(q + R.t * 9) * (0.35 - f.t) * 6, f.y + (0.35 - f.t) * 3, f.z + Math.sin(q + R.t * 9) * (0.35 - f.t) * 6, 0.3, 'halo', [0.6, 0.4, 0.15]);
    else if (f.k === 'ring') { var rr2 = (0.6 - f.t) * 16; for (var q4 = 0; q4 < 20; q4++) { var a5 = q4 / 20 * 6.283; spark(glow, A, f.x + Math.cos(a5) * rr2, f.y + 0.3, f.z + Math.sin(a5) * rr2, 0.7, 'halo', [0.5 * f.t / 0.6 + 0.08, 0.85 * f.t / 0.6 + 0.1, 1.0 * f.t / 0.6 + 0.12]); } }
    else if (f.k === 'pop') for (var q2 = 0; q2 < (f.big ? 16 : 9); q2++) { var aa = q2 / (f.big ? 16 : 9) * 6.28, rr = (0.6 - f.t) * (f.big ? 14 : 6); spark(soft, A, f.x + Math.cos(aa) * rr, f.y + Math.sin(q2 * 2.1) * rr * 0.4 + 0.3, f.z + Math.sin(aa) * rr, 0.45, 'puff', [0.62, 0.6, 0.55]); }
  });
  if (R.TH.drawDyn) R.TH.drawDyn(R, dm, sp);
  if (R.ev && typeof evDraw === 'function') evDraw(R, dm, glow, A);
  R3.draw(dm, R.atlas);
  if (dv && dv.n) R3.draw(dv, dtx);
  if (R._gdm) { R3.draw(R._gdm, R.atlas, { alpha: 0.42 }); if (dtx && R._gdv.n) R3.draw(R._gdv, dtx, { alpha: 0.42 }); R._gdm = null; R._gdv = null; } // the other players in an online time trial: see-through ghosts
  R.traps.forEach(function (t) { if (t.k !== 'goo' || t.air) return; var g2 = R.T.locate(t.x, t.z, -1); flat(shm, A, t.x, g2.y + 0.06, t.z, t.r * 1.05, 'puff', [0.32, 0.08, 0.42], t.x); });
  R3.draw(shm, R.atlas, { soft: true });
  // light halos round lamps and torches near the camera
  R.B.lights.forEach(function (l) { if (!l.halo) return; var dx = l.x - cam.eye[0], dz = l.z - cam.eye[2]; if (dx * dx + dz * dz > 120 * 120 || dx * R3.cam.fwd[0] + dz * R3.cam.fwd[2] < -4) return; spark(glow, A, l.x, l.y, l.z, 1.1 + Math.sin(R.t * 7 + l.x) * 0.06, 'halo', l.hc || (l.hc = rgb01(l.halo).map(function (v) { return v * 0.32; }))); });
  // sprites: drivers, scenery cut-outs, drops, items in flight
  var st = sheetTex(); if (!st) return;
  R.karts.forEach(function (kk) {
    var d = kk._drv; if (d) billboard(sp, d.x, d.y, d.z, d.n, d.sc, { flip: d.flip, squash: d.sq });
    if (kk.shieldT > 0) billboard(sp, kk.x, kk.y + (kk.floatY || 0) - 0.1, kk.z, 'ck_shield', 0.075, { col: [0.6, 0.6, 0.7] });
    if (kk.nadoT > 0) for (var j = 0; j < 7; j++) { var a = R.t * 9 + j * 0.9, r = 1.2 + (j % 3) * 0.25; billboard(sp, kk.x + Math.cos(a) * r, kk.y + 0.1 + j * 0.28, kk.z + Math.sin(a) * r, j % 2 ? 'mn_sausage' : 'ao_meat' + (j % 4 ? 0 : 1), 0.045); }
    var ky = kk.y + (kk.floatY || 0);
    if (kk.gooT > 0) billboard(sp, kk.x, ky + 1.7, kk.z, 'f_blumling_' + (Math.floor(R.t * 6) % 4), 0.04);
    if (kk.floatT > 0 || kk.floatY > 0.3) { billboard(sp, kk.x, ky + 2.1, kk.z, 'f_balloon_' + (Math.floor(R.t * 5) % 4), 0.09); }
    if (kk.orbit > 0) for (var o3 = 0; o3 < kk.orbit; o3++) { var a4 = R.t * 5 + o3 * 2.094; billboard(sp, kk.x + Math.cos(a4) * 1.5, ky + 0.4, kk.z + Math.sin(a4) * 1.5, 'it_pie', 0.055); }
    if (kk.petT > 0) { var bx3 = kk.x - Math.cos(kk.yaw) * 1.0, bz3 = kk.z - Math.sin(kk.yaw) * 1.0; billboard(sp, bx3, ky + 0.85 + (kk.petBite > 0 ? 0.25 : Math.abs(Math.sin(R.t * 6)) * 0.08), bz3, 'h_gloop_baby_idle' + (Math.floor(R.t * 4) % 2), 0.045); }
    if (kk.magT > 0) billboard(sp, kk.x, ky + 2.0 + Math.sin(R.t * 6) * 0.1, kk.z, 'ck_magnet', 0.06);
    if (kk.squashT > 0 && kk.spinT > 0) for (var s3 = 0; s3 < 3; s3++) { var a3 = R.t * 6 + s3 * 2.1; billboard(sp, kk.x + Math.cos(a3) * 0.6, kk.y + 1.6, kk.z + Math.sin(a3) * 0.6, 'ck_star', 0.04); }
  });
  R.drops.forEach(function (d) { if (d.t > 0) return; if (Math.abs(d.x - cam.eye[0]) + Math.abs(d.z - cam.eye[2]) > 180) return; billboard(sp, d.x, d.y + 0.35 + Math.sin(R.t * 4 + d.x) * 0.12, d.z, 'mn_drop', 0.065); });
  R.proj.forEach(function (p) {
    if (p.k === 'pie') billboard(sp, p.x, p.y - 0.3, p.z, 'it_pie', 0.07);
    else if (p.k === 'sperm') billboard(sp, p.x, p.y - 0.3, p.z, 'ck_sperm', 0.07, { flip: Math.cos(p.a) * R3.cam.right[0] + Math.sin(p.a) * R3.cam.right[2] < 0 });
    else if (p.k === 'cat') billboard(sp, p.x, p.y + Math.abs(Math.sin(R.t * 14)) * 0.5, p.z, 'cat', 0.17, { flip: Math.cos(p.a) * R3.cam.right[0] + Math.sin(p.a) * R3.cam.right[2] < 0 });
  });
  R.traps.forEach(function (t) { if (t.k === 'goo') return; billboard(sp, t.x, t.y, t.z, 'mn_pill', 0.07); });
  R.fx.forEach(function (f) { if (f.k === 'drop') billboard(sp, f.x, f.y, f.z, 'mn_drop', 0.05); });
  var cx = cam.eye[0], cz = cam.eye[2], fw = R3.cam.fwd;
  R.B.bills.forEach(function (b) {
    var dx = b.x - cx, dz = b.z - cz; if (dx * fw[0] + dz * fw[2] < -6) return; if (dx * dx + dz * dz > 260 * 260) return;
    var n = b.anim ? b.anim(R.t) : b.spr; billboard(sp, b.x, b.y, b.z, n, b.sc, { flip: b.flip, col: b.col });
  });
  if (R.TH.drawBills) R.TH.drawBills(R, sp);
  R3.draw(sp, st);
  R3.draw(soft, R.atlas, { soft: true });
  R3.draw(glow, R.atlas, { add: true, soft: true });
}
var DRIFTC = [null, [0.25, 0.55, 0.75], [0.75, 0.42, 0.12], [0.75, 0.72, 0.6]];
function DUSTC() { var c = rgb01(RACE.TH.dust || '#a6968f'); return [c[0] * 0.6, c[1] * 0.6, c[2] * 0.6]; }
function spark(m, A, x, y, z, s, tile, col) { var r = R3.cam.right; m.quad([x - r[0] * s, y - s, z - r[2] * s], [x + r[0] * s, y - s, z + r[2] * s], [x + r[0] * s, y + s, z + r[2] * s], [x - r[0] * s, y + s, z - r[2] * s], [0.02, 0.98, 0.98, 0.98, 0.98, 0.02, 0.02, 0.02], A.tile(tile), col || [0.5, 0.5, 0.5]); }

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
  if (R.net) R.karts.forEach(function (o) { if (!isHuman(R, o) || o === k || !o.tag) return; var p = R3.project(o.x, o.y + (o.floatY || 0) + 2.7, o.z); if (!p || p.w > 140) return; var w = KIT.tw(o.tag, 6) + 8; R2('rgba(7,4,5,0.8)', p.x - w / 2, p.y - 9, w, 11); text(o.tag, p.x, p.y - 7, { size: 6, align: 'center', col: '#ffe36a' }); }); // other players' names over their karts
  // countdown and banners
  if (R.phase === 'count') { var n = 3 - Math.floor(R.phaseT), f = R.phaseT % 1; text(String(n), 240, 100 - f * 6, { size: 64, align: 'center', col: n === 1 ? '#ffe36a' : '#ff2630', font: 'title', outline: true, alpha: 1 - f * 0.5 }); }
  if (R.phase === 'go' && R.t < 1.2) text('GO!', 240, 96, { size: 64, align: 'center', col: '#ffe36a', font: 'title', outline: true, alpha: Math.min(1, (1.2 - R.t) * 2) });
  if (R.lapBanner > 0) text(R.bannerTxt, 240, 96, { size: 32, align: 'center', col: R.bannerTxt === 'FINAL LAP' ? '#ffe36a' : '#f1e7d0', font: 'title', outline: true, alpha: Math.min(1, R.lapBanner * 2) });
  if (k.wrongT > 1.2 && !k.done && Math.floor(R.t * 3) % 2) text('WRONG WAY', 240, 120, { size: 16, align: 'center', col: '#ff2630', outline: true });
  if (R.phase === 'done') text(R.tt ? 'TIME!' : (k.place === 1 ? 'YOU WIN!' : 'FINISH!'), 240, 90, { size: 48, align: 'center', col: '#ffe36a', font: 'title', outline: true });
  if (R.msg) { var w = Math.min(420, KIT.tw(R.msg.who + ': ' + R.msg.s, 6) + 20); KIT.panel(240 - w / 2, 222, w, 20, { edge: '#4a1a1c' }); text(R.msg.who.toUpperCase() + ': ' + R.msg.s, 240, 229, { size: 6, align: 'center', col: '#f1e7d0', max: w - 10 }); }
  if (R.gooScreen > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.75, R.gooScreen / 2.6); for (var g = 0; g < 9; g++) { var gx = (g * 61 + 17) % 470, gy = (g * 37) % 180, gl = 30 + (g * 13) % 50 + (2.6 - R.gooScreen) * 30; ctx.fillStyle = g % 2 ? '#5a1a8a' : '#9a4aff'; ctx.fillRect(gx, 0, 10, gy + gl); ctx.beginPath(); ctx.arc(gx + 5, gy + gl, 7, 0, 6.3); ctx.fill(); } ctx.restore(); }
  if (R.ev && typeof evHud === 'function') evHud(R);
  if (R.splatScreen > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.92, R.splatScreen / 1.6); for (var sb = 0; sb < 7; sb++) { var sx2 = (sb * 83 + 40) % 440 + 20, sy2 = (sb * 53 + 30) % 190 + 30, sr = 28 + (sb * 17) % 30; ctx.fillStyle = sb % 2 ? '#f1e7d0' : '#fffbe8'; ctx.beginPath(); ctx.arc(sx2, sy2, sr, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.arc(sx2 + sr * 0.6, sy2 + sr * 0.5, sr * 0.55, 0, 6.3); ctx.fill(); ctx.fillRect(sx2 - 4, sy2, 8, sr + 18 * (2.6 - R.splatScreen)); } ctx.restore(); }
  if (k.revT > 0 && Math.floor(R.t * 3) % 2) text('BACK TO FRONT!', 240, 140, { size: 12, align: 'center', col: '#ffe36a', outline: true });
  if (R.pillMsg) text({ rev: 'STEERING BACK TO FRONT!', tiny: 'SHRUNK!', hic: '*HIC*' }[R.pillMsg.e], 240, 118, { size: 16, align: 'center', col: '#ffe36a', outline: true, alpha: Math.min(1, R.pillMsg.t * 2) });
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
