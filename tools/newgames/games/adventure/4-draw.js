/* ---------- drawing the 3D world (update 132: everyone and everything is 3D) ---------- */
var MESH = null, SMESH = null, DYN = null, SKYM = {}, SHEETTEX = null, SHIPM = null, SPINM = {};
function sheetTex() { if (!SHEETTEX && KIT.sheetReady) SHEETTEX = R3.texture(KIT.sheet); return SHEETTEX; }
function sprRect(n) { var f = KIT.SPR[n], im = KIT.sheet; if (!f || !im || !im.width) return null; return { t: [(f[0] + 0.02) / im.width, (f[1] + 0.02) / im.height, (f[2] - 0.04) / im.width, (f[3] - 0.04) / im.height], w: f[2], h: f[3] }; }
function boxM(m, b, top, side, col) { var c = col || [0.5, 0.5, 0.5], sd = [0.42, 0.42, 0.42], w = (b.x1 - b.x0) / TSZ, d = (b.z1 - b.z0) / TSZ, h = (b.y1 - b.y0) / TSZ;
  m.quad([b.x0, b.y1, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1], [0, 0, w, 0, w, d, 0, d], top, c, [0, 1, 0]);
  m.quad([b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1, b.y1, b.z1], [b.x0, b.y1, b.z1], [0, h, w, h, w, 0, 0, 0], side, sd, [0, 0, 1]); m.quad([b.x1, b.y0, b.z0], [b.x0, b.y0, b.z0], [b.x0, b.y1, b.z0], [b.x1, b.y1, b.z0], [0, h, w, h, w, 0, 0, 0], side, sd, [0, 0, -1]);
  m.quad([b.x1, b.y0, b.z1], [b.x1, b.y0, b.z0], [b.x1, b.y1, b.z0], [b.x1, b.y1, b.z1], [0, h, d, h, d, 0, 0, 0], side, sd, [1, 0, 0]); m.quad([b.x0, b.y0, b.z0], [b.x0, b.y0, b.z1], [b.x0, b.y1, b.z1], [b.x0, b.y1, b.z0], [0, h, d, h, d, 0, 0, 0], side, sd, [-1, 0, 0]); }
function buildMesh() { if (MESH) MESH.free(); if (SMESH) { SMESH.free(); SMESH = null; } var m = M(), T = THEMES[LV.theme] || THEMES.city, top = TL(T.top), side = TL(T.side);
  LV.boxes.forEach(function (b) { if (b.hide) return; var tt = b.tex ? TL(b.tex) : top, ss = b.tex ? TL(b.tex) : b.wall ? TL(T.side) : side; boxM(m, b, tt, ss); });
  LV.ramps.forEach(function (r) { var tt = r.tex ? TL(r.tex) : top, c = [0.5, 0.5, 0.5], w = (r.x1 - r.x0) / TSZ, d = (r.z1 - r.z0) / TSZ; if (r.ax === 'z') m.quad([r.x0, r.ya, r.z0], [r.x1, r.ya, r.z0], [r.x1, r.yb, r.z1], [r.x0, r.yb, r.z1], [0, 0, w, 0, w, d, 0, d], tt, c, [0, 1, 0]); else m.quad([r.x0, r.ya, r.z0], [r.x0, r.ya, r.z1], [r.x1, r.yb, r.z1], [r.x1, r.yb, r.z0], [0, 0, d, 0, d, w, 0, w], tt, c, [0, 1, 0]); });
  LV.pads.forEach(function (d) { m.quad([d.x - 1.2, d.y + 0.04, d.z - 1.2], [d.x + 1.2, d.y + 0.04, d.z - 1.2], [d.x + 1.2, d.y + 0.04, d.z + 1.2], [d.x - 1.2, d.y + 0.04, d.z + 1.2], [1, 1, 0, 1, 0, 0, 1, 0], TL('dashpad'), [0.5, 0.5, 0.5], [0, 1, 0], 0.8); });
  LV.loops.forEach(function (L) { var n = 24; for (var i = 0; i < n; i++) { var a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283; function pt(a, s) { return [L.x + s, L.y + L.r - Math.cos(a) * L.r, L.z + Math.sin(a) * L.r]; } m.quad(pt(a0, -1.8), pt(a1, -1.8), pt(a1, 1.8), pt(a0, 1.8), [0, 0, 1, 0, 1, 1, 0, 1], TL(T.top), [0.5, 0.5, 0.5]); m.quad(pt(a0, 1.8), pt(a1, 1.8), pt(a1, -1.8), pt(a0, -1.8), [0, 0, 1, 0, 1, 1, 0, 1], TL(T.side), [0.4, 0.4, 0.4]); } });
  LV.lava.forEach(function (l) { m.quad([l.x0, l.y, l.z1], [l.x1, l.y, l.z1], [l.x1, l.y, l.z0], [l.x0, l.y, l.z0], [0, 0, (l.x1 - l.x0) / 4, 0, (l.x1 - l.x0) / 4, (l.z1 - l.z0) / 4, 0, (l.z1 - l.z0) / 4], TL('lava'), [0.5, 0.5, 0.5], [0, 1, 0], 1); });
  LV.deco.forEach(function (f) { f(m); });
  MESH = m.upload(); }
function buildSheetMesh() { var st = sheetTex(); if (!st || SMESH || !LV.sq.length) return; var m = new R3.Mesh();
  LV.sq.forEach(function (q) { var r = sprRect(q.s); if (!r) return; var w = q.w / 2, h = q.w * r.h / r.w, f = q.face, sx = -f[1], sz = f[0]; // u = 0 on the viewer's left
    m.quad([q.x + sx * w, q.y, q.z + sz * w], [q.x - sx * w, q.y, q.z - sz * w], [q.x - sx * w, q.y + h, q.z - sz * w], [q.x + sx * w, q.y + h, q.z + sz * w], [0, 1, 1, 1, 1, 0, 0, 0], r.t, [0.5, 0.5, 0.5], [f[0], 0, f[1]]); });
  SMESH = m.upload(); }
function skyMesh(th) { if (SKYM[th]) return SKYM[th]; var T = THEMES[th] || HUBS.garden, s = T.sky || [0.3, 0.2, 0.3], m = M(), n = 16, rings = 8;
  for (var r = 0; r < rings; r++) for (var i = 0; i < n; i++) { var b0 = r / rings * Math.PI * 0.6, b1 = (r + 1) / rings * Math.PI * 0.6, a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283; function V(a, b) { return [Math.sin(a) * Math.sin(b) * 300, Math.cos(b) * 300 - 40, Math.cos(a) * Math.sin(b) * 300]; } var k0 = 0.35 + r / rings * 0.65, k1 = 0.35 + (r + 1) / rings * 0.65;
    m.quadN([V(a0, b1), V(a1, b1), V(a1, b0), V(a0, b0)], [0, 0, 1, 0, 1, 1, 0, 1], TL('white'), [s[0] * k1, s[1] * k1, s[2] * k1], [[0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]]); }
  if (th === 'isles' || th === 'reef') ell(m, -90, 120, 200, 18, 18, 4, '#fff6dc', 12, 6); else ell(m, -80, 110, 220, 26, 26, 4, th === 'volcano' ? '#ff6a20' : '#c4121c', 14, 7);
  return (SKYM[th] = m.upload()); }
function shipMesh() { if (SHIPM) return SHIPM; var m = M(); ell(m, 0, 0, 0, 5, 2.2, 9, '#3a3a42', 14, 8, { T: TL('steel') }); bxp(m, -1.5, 1.5, -4, 1.5, 4, 2, '#2a2a30', TL('steel')); tub(m, [0, 4, -1], [0, 7, -1], 0.6, 0.5, '#c4121c', 8); [-1, 1].forEach(function (s) { tub(m, [s * 4.5, 0, -2], [s * 8, 0.5, -5], 0.8, 0.3, '#2a2a30', 8); }); ell(m, 0, 0.6, 8, 2, 1.2, 2, '#c4121c', 10, 5); for (var k = 0; k < 6; k++) ell(m, 4.9, 0.4, -6 + k * 2.4, 0.05, 0.4, 0.4, '#ffe36a', 6, 3); return (SHIPM = m.upload()); }
function spinMesh(k) { if (SPINM[k]) return SPINM[k]; var m = M();
  if (k === 'carousel') { tub(m, [0, 0, 0], [0, 0.4, 0], 3.6, 3.6, '#c4121c', 16, { cap: 1 }); tub(m, [0, 0.4, 0], [0, 5, 0], 0.35, 0.35, '#ffe36a', 8); tub(m, [0, 5, 0], [0, 6.5, 0], 4.2, 0.2, '#ff7ab8', 16, { T: TL('stripes') }); for (var h = 0; h < 6; h++) { var a = h / 6 * 6.283; tub(m, [Math.cos(a) * 2.8, 0.4, Math.sin(a) * 2.8], [Math.cos(a) * 2.8, 5, Math.sin(a) * 2.8], 0.05, 0.05, '#ffe36a', 5); ell(m, Math.cos(a) * 2.8, 1.6, Math.sin(a) * 2.8, 0.3, 0.45, 0.7, '#f1e0b0', 8, 5, { tip: 0.2 }); } }
  else if (k === 'ferris') { for (var s = 0; s < 16; s++) { var a0 = s / 16 * 6.283, a1 = (s + 1) / 16 * 6.283; tub(m, [Math.cos(a0) * 9, Math.sin(a0) * 9, 0], [Math.cos(a1) * 9, Math.sin(a1) * 9, 0], 0.2, 0.2, '#ffe36a', 5); tub(m, [0, 0, 0], [Math.cos(a0) * 9, Math.sin(a0) * 9, 0], 0.08, 0.08, '#c4121c', 4); if (s % 2 === 0) bxp(m, Math.cos(a0) * 9 - 0.8, Math.sin(a0) * 9 - 1.6, -0.8, Math.cos(a0) * 9 + 0.8, Math.sin(a0) * 9 - 0.2, 0.8, ['#c4121c', '#ff7ab8', '#4adfff'][s % 3]); } ell(m, 0, 0, 0, 1, 1, 1, '#c4121c', 10, 6); }
  return (SPINM[k] = m.upload()); }
/* the camera and the frame */
var CAMO = null; // a cutscene sets this: { eye, at }
function playerPose(p) {
  var Q = pose0(), sp = Math.hypot(p.vx, p.vz);
  if (p.ball || p.homing > 0 || p.charge) { Q.bp = (G.t * (p.charge ? 30 : 22)) % 6.283; Q.bodyY = 0.55; Q.y = -0.3; Q.hip = [1.5, 1.5]; Q.kn = [2.2, 2.2]; Q.sh = [[1.4, 0.3], [1.4, 0.3]]; Q.el = [2.2, 2.2]; Q.hp = 0.5; return Q; }
  if (p.hurtT > 0) { if (typeof poseHurt === 'function') poseHurt(Q, 1); return Q; }
  if (p.swim) { Q.bp = -1.2; Q.bodyY = 0.8; poseWalk(Q, G.t * 6, 1, false); Q.sh = [[2.6, 0.4], [2.6, 0.4]]; return Q; }
  if (p.climb) { Q.sh = [[2.8, 0.3], [2.8, 0.3]]; Q.el = [0.6, 0.6]; poseWalk(Q, G.t * 8, Math.abs(p.vy) > 0.5 ? 0.5 : 0, false); Q.sh[0][0] = 2.8 + Math.sin(G.t * 8) * 0.3; Q.sh[1][0] = 2.8 - Math.sin(G.t * 8) * 0.3; return Q; }
  if (p.glide) { Q.sh = [[1.6, 1.4], [1.6, 1.4]]; Q.el = [0.2, 0.2]; Q.lean = 0.4; Q.hip = [0.3, 0.1]; Q.kn = [0.6, 0.6]; return Q; }
  if (!p.ground) { Q.hip = [0.9, 0.2]; Q.kn = [1.4, 0.4]; Q.sh = [[2.2, 0.4], [1.0, 0.6]]; Q.el = [0.5, 1.0]; Q.lean = -0.1; if (p.who === 'spermaid') { Q.sh = [[0.6, 0.6], [0.6, 0.6]]; } return Q; }
  if (p.atkT > 0) { if (p.who === 'spermaid') { Q.bp = 0; Q.twist = (p.atkT / 0.35) * 6.283; } else posePunch ? posePunch(Q, 1 - p.atkT / 0.35) : 0; return Q; }
  if (p.locking) { Q.sh[1] = [2.4, 0.2, 0]; Q.el[1] = 1.6; }
  if (sp > 0.5) { poseWalk(Q, p.anim * 2.4, Math.min(1, sp / 6), sp > 7); if (sp > 14) { Q.lean += 0.25; Q.sh = [[-1.0, 0.3], [-1.0, 0.3]]; Q.el = [0.3, 0.3]; } }
  if (p.who === 'spermaid') Q.y += Math.abs(Math.sin(p.anim * 2)) * (sp > 0.5 ? 0.25 : 0.03);
  return Q; }
function drawChar(who, x, y, z, a, Q, o) { var R = rigFor(who); if (!R) return null; var C2 = CHARS[who] || {}; return drawRig(R, x, y, z, a, Q, Object.assign({ tint: C2.gold ? [1.4, 1.2, 0.5] : null }, o || {})); }
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (G.mode === 'nogl') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', KIT.W / 2, KIT.H / 2, { align: 'center' }); return; }
  if (!LV || (!P && !CAMO)) { if (R3.ok) R3.begin([0.1, 0.02, 0.04]); titleArt(); return; }
  var T = THEMES[LV.theme] || THEMES.isles, p = P, lk = KIT.stick(1), eye, at;
  if (CAMO) { eye = CAMO.eye; at = CAMO.at; }
  else if (G.camOv) { eye = G.camOv.eye; at = G.camOv.at; }
  else { CAMS.yaw -= lk.x * 0.045; var mv = Math.hypot(p.vx, p.vz); if (mv > 3 && !lk.on) CAMS.yaw += Math.atan2(Math.sin(Math.atan2(p.vx, p.vz) - CAMS.yaw), Math.cos(Math.atan2(p.vx, p.vz) - CAMS.yaw)) * 0.03;
    var dist = 6.5 + Math.min(4, mv * 0.15), wx = p.x - Math.sin(CAMS.yaw) * dist, wz = p.z - Math.cos(CAMS.yaw) * dist, wy = p.y + 3.0 + Math.max(0, lk.y) * 2 - Math.max(0, -lk.y) * 1.5;
    CAMS.x += (wx - CAMS.x) * 0.18; CAMS.y += (wy - CAMS.y) * 0.12; CAMS.z += (wz - CAMS.z) * 0.18; at = [p.x, p.y + 1.2, p.z]; eye = camClip(at, [CAMS.x, CAMS.y, CAMS.z]); }
  var skyc = BOSS && BOSS.B.dark ? [0.04, 0, 0.02] : (HUBS[LV.hub] && LV.hub !== undefined ? HUBS[LV.hub].sky : T.sky), fogc = LV.fogOverride || skyc;
  R3.begin(fogc); R3.setCam(eye, at, KIT.W < KIT.H ? 1.25 : 1.05);
  var lights = LV.lights.map(function (L) { return { x: L.x, y: L.y, z: L.z, r: L.r, c: L.c, k: 1.2, d: Math.hypot(L.x - at[0], L.z - at[2]) }; }); LV.flames.forEach(function (f) { lights.push({ x: f.x, y: f.y + 0.4, z: f.z, r: 6, c: f.vent ? [1, 0.4, 0.1] : [1, 0.6, 0.3], k: 1.3, d: Math.hypot(f.x - at[0], f.z - at[2]) + 1 }); });
  lights.sort(function (a, b) { return a.d - b.d; }); lights = lights.slice(0, 6); if (p) lights.push({ x: p.x, y: p.y + 2.5, z: p.z, r: 8, c: CHARS[p.who] && CHARS[p.who].gold ? [1, 0.85, 0.3] : [0.9, 0.85, 0.8], k: CHARS[p.who] && CHARS[p.who].gold ? 1.6 : 0.5 });
  var amb = T.amb || [0.7, 0.65, 0.65]; if (LV.hub === 'garden') amb = [0.85, 0.78, 0.75];
  R3.scene({ fog: fogc, fogR: [40, 140], amb: amb, lights: lights, torch: { p: [0, -99, 0], d: [0, 1, 0], c: [0, 0, 0] }, t: G.t });
  R3.draw(skyMesh(LV.skyT || LV.theme), ATT, { m: R3.model(at[0], 0, at[2], 0, 0, 0), lit: false });
  R3.draw(MESH, ATT, {}); buildSheetMesh(); if (SMESH) R3.draw(SMESH, sheetTex(), { lit: false });
  // things that move
  var t = G.t; function near(o, r) { return Math.abs(o.x - at[0]) < (r || 70) && Math.abs(o.z - at[2]) < (r || 70); }
  LV.drops.forEach(function (r) { if (!r.got && near(r)) R3.draw(propMesh('drop'), ATT, { m: R3.model(r.x, r.y - 0.1 + Math.sin(t * 3 + r.z) * 0.1, r.z, t * 3 + r.x, 0, 0), lit: false, tint: [1.2, 1.15, 1.05] }); });
  FX.forEach(function (f) { if (f.ring && f.t > 0 && (f.t > 1 || Math.floor(t * 10) % 2)) R3.draw(propMesh('drop'), ATT, { m: R3.model(f.x, f.y, f.z, t * 5, 0, 0, 0.8), lit: false }); });
  LV.items.forEach(function (it) { if (!it.got) R3.draw(propMesh('ingr' + it.n), ATT, { m: R3.model(it.x, it.y - 0.4 + Math.sin(t * 2) * 0.15, it.z, t * 1.5, 0, 0, 1.4) }); });
  LV.ibox.forEach(function (b) { if (!b.got && near(b)) R3.draw(propMesh('box'), ATT, { m: R3.model(b.x, b.y, b.z, t * 0.5, 0, 0) }); });
  LV.checks.forEach(function (c) { R3.draw(propMesh(c.on ? 'checkon' : 'check'), ATT, { m: R3.model(c.x, c.y, c.z, 0, 0, 0) }); });
  LV.springs.forEach(function (s) { R3.draw(propMesh('spring'), ATT, { m: R3.model(s.x, s.y, s.z, 0, 0, 0) }); });
  if (LV.goal) { var gl = LV.goal; R3.draw(propMesh('gate'), ATT, { m: R3.model(gl.x, gl.y, gl.z + 1, 0, 0, 0) }); R3.draw(propMesh('chalice'), ATT, { m: R3.model(gl.x, gl.y + 1.6 + Math.sin(t * 2) * 0.2, gl.z + 1, t, 0, 0, 1.3), lit: false, tint: [1.3, 1.2, 1] }); }
  LV.portals.forEach(function (po) { if (!near(po)) return; var want = typeof storyWants === 'function' && storyWants(po); R3.draw(propMesh('gate'), ATT, { m: R3.model(po.x, po.y, po.z, Math.atan2(at[0] - po.x, at[2] - po.z) * 0, 0, 0, po.hole ? 0.35 : 0.55) }); });
  LV.spin.forEach(function (s) { R3.draw(spinMesh(s.k), ATT, s.k === 'ferris' ? { m: R3.model(s.x, 12, s.z, 0, 0, t * 0.25) } : { m: R3.model(s.x, 0, s.z, t * 0.6, 0, 0) }); });
  if (LV.ship) R3.draw(shipMesh(), ATT, { m: R3.model(LV.ship.x, LV.ship.y + Math.sin(t) * 0.4, LV.ship.z, 0.3, 0, Math.sin(t * 0.7) * 0.05) });
  if (LV.steve) R3.draw(RIGS.steveM, ATT, { m: R3.model(LV.steve.x, 0, LV.steve.z, Math.PI + Math.sin(t) * 0.3, 0, Math.sin(t * 3) * 0.05, 1.4) });
  LV.npcs.forEach(function (n) { if (!near(n, 50) || (p && n.rig === 'spermaidN' && p.who === 'spermaid')) return; var Q = pose0(), d = p ? Math.hypot(p.x - n.x, p.z - n.z) : 99; n.fa = d < 6 ? Math.atan2(p.x - n.x, p.z - n.z) : n.a; if (n.talk > 0) { n.talk -= 1 / 60; Q.sh[1] = [1.3 + Math.sin(t * 10) * 0.3, 0.4, 0.5]; Q.el[1] = 1.2; } drawRig(RIGS[n.rig === 'spermaidN' ? 'spermaid' : n.rig], n.x, n.y, n.z, n.fa, Q, { sc: 1 }); });
  if (LV.hub === 'garden') drawGardenThings();
  LV.foes.forEach(function (e) { if ((e.dead && e.dt > 0.3) || !near(e, 60)) return; var sc = e.dead ? Math.max(0.01, 1 - e.dt * 3) : 1, lock = p && p.lock && p.lock.indexOf(e) >= 0;
    if (e.d.rig) { var Q = pose0(); poseWalk(Q, t * 6 + e.hx, 0.7, false); drawRig(RIGS[e.d.rig], e.x, e.y, e.z, e.a, Q, { sc: sc * 0.95, held: e.d.held && RIGS[e.d.rig].P[e.d.held] ? RIGS[e.d.rig].P[e.d.held] : null, heldP: -Math.PI / 2, flash: lock ? [0.5, 0.1, 0.1] : null }); }
    else R3.draw(foeMesh(e.d.m), ATT, { m: R3.model(e.x, e.y + (e.fly ? Math.sin(t * 4 + e.hx) * 0.15 : 0), e.z, e.a, 0, e.d.m === 'bat' ? Math.sin(t * 20) * 0.3 : 0, sc), flash: lock ? [0.5, 0.1, 0.1] : null }); });
  if (BOSS && (BOSS.hp > 0 || BOSS.dt < 1.5)) { var b = BOSS, flash = (b.stun > 0 && Math.floor(t * 10) % 2) || b.hitCd > 0.6, ba = p ? Math.atan2(p.x - b.x, p.z - b.z) : 0, bs = b.hp <= 0 ? Math.max(0.01, 1 - b.dt) : 1;
    if (b.B.rig) { var QB = pose0(); poseWalk(QB, t * 5, b.st === 'charge' ? 1 : 0.4, b.st === 'charge'); if (b.stun > 0) { QB.hp = 0.6; QB.lean = -0.3; } drawRig(RIGS[b.B.rig], b.x, b.y, b.z, ba, QB, { sc: b.B.sc * bs, tint: b.B.tint, flash: flash ? [0.6, 0.6, 0.6] : null }); }
    else R3.draw(foeMesh(b.B.m), ATT, { m: R3.model(b.x, b.y, b.z, ba, 0, b.stun > 0 ? Math.sin(t * 8) * 0.15 : 0, b.B.sc * 0.8 * bs), flash: flash ? [0.6, 0.6, 0.6] : null }); }
  SHOTS.forEach(function (s) { if (s.delay > 0) return; R3.draw(propMesh(s.mine ? 'bag' : s.pill ? 'pill' : 'fruit'), ATT, { m: R3.model(s.x, s.y, s.z, t * 8, t * 6, 0, s.mine ? 1.4 : 1.2), lit: false, tint: s.foe && !s.pill ? [0.6, 0.2, 1] : null }); });
  if (p && !CAMO) { var Q2 = playerPose(p); if (!(p.inv > 0 && Math.floor(t * 16) % 2)) drawChar(p.who, p.x, p.y, p.z, p.a, Q2, { sc: 1 }); if (p.carry === 'fruit') R3.draw(propMesh('fruit'), ATT, { m: R3.model(p.x, p.y + 2.2, p.z, t, 0, 0, 1.4) }); }
  if (CAMO && typeof drawActors === 'function') drawActors();
  // see-through and glowing things
  if (!DYN) DYN = new R3.Mesh(); DYN.clear(); var Rr = R3.cam.right;
  function glow(x, y, z, s, c) { DYN.quad([x - Rr[0] * s, y - s, z - Rr[2] * s], [x + Rr[0] * s, y - s, z + Rr[2] * s], [x + Rr[0] * s, y + s, z + Rr[2] * s], [x - Rr[0] * s, y + s, z - Rr[2] * s], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), c, [0, 0, 1], 2); }
  LV.flames.forEach(function (f, n) { if (!near(f, 40)) return; var s = 0.18 + Math.sin(t * 13 + n) * 0.03; glow(f.x, f.y + (f.vent ? 0.6 + Math.sin(t * 3 + n) * 0.4 : 0), f.z, f.vent ? 0.6 : s, f.vent ? [0.8, 0.3, 0.05] : [0.8, 0.5, 0.15]); });
  LV.lights.forEach(function (L) { if (near(L, 50)) glow(L.x, L.y, L.z, 0.35, [0.5, 0.4, 0.25]); });
  LV.portals.forEach(function (po) { if (!near(po)) return; var want = typeof storyWants === 'function' && storyWants(po), c = po.k === 'boss' ? [0.6, 0.05, 0.05] : po.k === 'hub' ? [0.6, 0.5, 0.15] : po.k === 'garden' ? [0.2, 0.55, 0.25] : want ? [0.8, 0.1, 0.1] : [0.35, 0.1, 0.3]; var sc = po.hole ? 0.35 : 0.55; for (var k = 0; k < 3; k++) glow(po.x + Math.sin(t * 2 + k * 2) * 0.3 * sc, po.y + 2.4 * sc * 1.6 + Math.cos(t * 2 + k * 2) * 0.3 * sc, po.z, (1.3 - k * 0.3) * sc * 1.6, c); });
  if (LV.goal) glow(LV.goal.x, LV.goal.y + 2.6, LV.goal.z + 1, 1.6 + Math.sin(t * 3) * 0.1, [0.6, 0.08, 0.08]);
  if (LV.fountain) for (var fs = 0; fs < 10; fs++) { var ph = (t * 1.2 + fs / 10) % 1, aa = fs * 0.63; glow(Math.cos(aa) * ph * 1.8, LV.fountain.y + Math.sin(ph * Math.PI) * 1.2 - ph * 1.4, Math.sin(aa) * ph * 1.8, 0.12, [0.5, 0.48, 0.4]); }
  SHOTS.forEach(function (s) { if (s.mine && !(s.delay > 0)) glow(s.x, s.y + 0.25, s.z, 0.35, [0.8, 0.35, 0.05]); });
  FX.forEach(function (f) { if (f.ring || f.wave || f.flashB) return; if (f.fire) glow(f.x, f.y, f.z, 0.8 * f.t, [0.8, 0.35, 0.05]); else if (f.c) { f.vy -= 0.3; f.x += f.vx / 60; f.y += f.vy / 60; f.z += f.vz / 60; glow(f.x, f.y, f.z, 0.1, f.c); } });
  if (p && p.shield) glow(p.x, p.y + 0.9, p.z, 1.1, [0.35, 0.3, 0.2]); if (p && CHARS[p.who] && CHARS[p.who].gold) glow(p.x, p.y + 0.9, p.z, 1.4 + Math.sin(t * 8) * 0.1, [0.5, 0.4, 0.1]);
  if (p && p.lock) p.lock.forEach(function (e) { glow(e.x, e.y + 1.4, e.z, 0.4, [0.8, 0.1, 0.1]); });
  if (BOSS && BOSS.B.dark && BOSS.hp > 0) glow(BOSS.x, BOSS.y + BOSS.h * 0.5, BOSS.z, BOSS.h * 0.8, [0.4, 0.02, 0.1]);
  if (DYN.n) R3.draw(DYN, ATT, { soft: true, lit: false, add: 1 });
  // water and the sea on top
  var wd = new R3.Mesh(); var wc = T.water || [0.3, 0.6, 0.8], wcol = LV.blackSea ? [0.04, 0.02, 0.05] : [wc[0] * 0.5, wc[1] * 0.5, wc[2] * 0.5];
  LV.water.forEach(function (w) { wd.quad([w.x0, w.y1, w.z1], [w.x1, w.y1, w.z1], [w.x1, w.y1, w.z0], [w.x0, w.y1, w.z0], [0, 0, (w.x1 - w.x0) / 3, 0, (w.x1 - w.x0) / 3, (w.z1 - w.z0) / 3, 0, (w.z1 - w.z0) / 3], TL('water'), wcol, [0, 1, 0]); });
  if (LV.sea !== undefined && LV.sea !== null) { var sy = LV.sea + Math.sin(t) * 0.05, cx = Math.round(at[0] / 6) * 6, cz = Math.round(at[2] / 6) * 6; wd.quad([cx - 160, sy, cz + 160], [cx + 160, sy, cz + 160], [cx + 160, sy, cz - 160], [cx - 160, sy, cz - 160], [0, 0, 50, 0, 50, 50, 0, 50], TL('water'), LV.blackSea ? [0.04, 0.02, 0.05] : [0.15, 0.32, 0.42], [0, 1, 0]); }
  if (wd.n) { wd.upload(); R3.draw(wd, ATT, { alpha: 0.62, lit: false }); wd.free(); }
  hud();
}
function titleArt() { var c = KIT.ctx, Wd = KIT.W, Hd = KIT.H; c.fillStyle = '#12040a'; c.fillRect(0, 0, Wd, Hd); for (var y = 0; y < Hd; y += 6) { c.fillStyle = 'rgba(196,18,28,' + (0.04 + (y / Hd) * 0.18) + ')'; c.fillRect(0, y, Wd, 6); } c.fillStyle = '#c4121c'; c.beginPath(); c.arc(Wd * 0.78, Hd * 0.3, 40, 0, 6.3); c.fill(); }
function hud() {
  var Wd = KIT.W, Hd = KIT.H, p = P; if (CAMO) { if (typeof cutHud === 'function') cutHud(); return; } if (!p) return;
  KIT.panel(6, 6, 150, 40); KIT.spr('sa_drop', 14, 12, { anchor: 'tl', sc: 1.4 }); KIT.text(String(p.rings), 36, 14, { size: 12, col: p.rings ? '#ffe36a' : (Math.floor(G.t * 4) % 2 ? '#ff2630' : '#ffe36a') }); KIT.text('LIVES ' + SV.lives, 92, 14, { size: 6, col: '#f1e7d0' }); if (LV.hub === undefined) KIT.text(fmtT(G.time), 92, 28, { size: 6, col: '#a6968f' }); else KIT.text('DROPS ' + SV.drops, 36, 32, { size: 6, col: '#a6968f' });
  if (LV.job === 'hunt') { KIT.panel(Wd / 2 - 60, Hd - 34, 120, 26); var near = LV.items.filter(function (i) { return !i.got; }).map(function (i) { return Math.hypot(i.x - p.x, i.z - p.z); }).sort(function (a, b) { return a - b; })[0]; var lvl = near === undefined ? 0 : near < 6 ? 3 : near < 14 ? 2 : near < 28 ? 1 : 0; for (var k = 0; k < 3; k++) KIT.R(k < lvl ? ['#7aff6a', '#ffe36a', '#ff2630'][k] : '#2a1a1e', Wd / 2 - 40 + k * 28, Hd - 26, 22, 10); KIT.text(G.found + '/3', Wd / 2 + 46, Hd - 25, { size: 6, col: '#ffe36a' }); }
  if (BOSS && BOSS.hp > 0 && !BOSS.mini || (BOSS && BOSS.mini && BOSS.hp > 0)) { KIT.text(BOSS.B.n, Wd / 2, 10, { align: 'center', size: 8, col: '#ff2630', outline: 1 }); KIT.bar(Wd / 2 - 90, 22, 180, 6, BOSS.hp / BOSS.mhp, '#c4121c'); }
  if (G.prompt) { KIT.panel(Wd / 2 - 110, Hd - 70, 220, 22); KIT.text(G.prompt, Wd / 2, Hd - 63, { align: 'center', size: 8, col: '#ffe36a' }); }
  if (G.banner) { var a = Math.min(1, G.banner.t * 2); KIT.text(G.banner.s, Wd / 2, Hd * 0.3, { align: 'center', font: 'title', size: 30, col: '#ffe36a', outline: 1, alpha: a }); if (G.banner.b) KIT.text(G.banner.b, Wd / 2, Hd * 0.3 + 36, { align: 'center', size: 8, col: '#f1e7d0', outline: 1, alpha: a }); }
  if (G.noteT > 0) KIT.text(G.note, Wd / 2, Hd - 90, { align: 'center', size: 6, col: '#ffe36a', outline: 1 });
  if (LV.hub === 'garden' && typeof gardenHud === 'function') gardenHud();
}
function fmtT(s) { var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
