/* ---------- the camera, the world, everyone, the HUD ---------- */
var DYN = null, CAMD = 4.6;
function switchLock(dir) { var best = null, bs = 9, f = camFwd(), r = [f[1], -f[0]]; FOE.concat(BOSS ? [BOSS] : []).forEach(function (e) { if (e === LOCK || e.hp <= 0) return; var dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d > 15 || !lineClear(P.x, P.z, e.x, e.z)) return; var side = (dx * r[0] + dz * r[1]) / d, fw = (dx * f[0] + dz * f[1]) / d; if (fw < -0.2 || side * dir <= 0.05) return; var sc = (1 - side * dir) + d * 0.05; if (sc < bs) { bs = sc; best = e; } }); if (best) { LOCK = best; sfx.play('tick'); } }
function camPose() {
  var p = P, lk = KIT.stick(1);
  if (LOCK && LOCK.hp > 0) { var la = Math.atan2(LOCK.x - p.x, LOCK.z - p.z); CAMY = turnTo(CAMY, la, 0.08);
    var fl = lk.x + mouse.dx * 0.02; mouse.dx = 0; if (Math.abs(fl) > 0.7 && !G.flick) { G.flick = 1; switchLock(fl > 0 ? 1 : -1); } else if (Math.abs(fl) < 0.3) G.flick = 0; } // flick the stick to switch target
  else { if (Math.abs(lk.x) > 0.2 || Math.abs(mouse.dx) > 2) G.recentre = 0; if (G.recentre > 0) { G.recentre -= 1 / 60; CAMY = turnTo(CAMY, p.a, 0.18); } CAMY -= lk.x * 0.05 + mouse.dx * 0.004; mouse.dx = 0; }
  G.camP = Math.max(-0.2, Math.min(0.7, (G.camP === undefined ? 0.28 : G.camP) + lk.y * 0.02 + mouse.dy * 0.003)); mouse.dy = 0;
  G.piv = G.piv || [p.x, p.y + 1.6, p.z]; G.piv[0] += (p.x - G.piv[0]) * 0.22; G.piv[1] += (p.y + 1.6 - G.piv[1]) * 0.12; G.piv[2] += (p.z - G.piv[2]) * 0.22; if (Math.hypot(p.x - G.piv[0], p.z - G.piv[2]) > 4) G.piv = [p.x, p.y + 1.6, p.z];
  var want = LOCK && LOCK.boss ? 7 : 4.3, piv = G.piv, d = 0.5, dir = [-Math.sin(CAMY) * Math.cos(G.camP), Math.sin(G.camP), -Math.cos(CAMY) * Math.cos(G.camP)];
  while (d < want) { var ex = piv[0] + dir[0] * (d + 0.3), ez = piv[2] + dir[2] * (d + 0.3), ey = piv[1] + dir[1] * (d + 0.3), k = tk(tileOf(ex), tileOf(ez)); if (k === 1 || ey < floorAt(ex, ez) + 0.2) break; d += 0.1; }
  CAMD = d < CAMD ? d : CAMD + (d - CAMD) * 0.1;
  var lift = Math.max(0, 3.2 - CAMD) * 0.55, eye = [piv[0] + dir[0] * CAMD, piv[1] + dir[1] * CAMD + lift, piv[2] + dir[2] * CAMD], at = LOCK && LOCK.hp > 0 ? [p.x + (LOCK.x - p.x) * 0.65, p.y + 1.25 + (LOCK.y - p.y) * 0.5, p.z + (LOCK.z - p.z) * 0.65] : [p.x - dir[0] * 2.5, p.y + 1.2, p.z - dir[2] * 2.5];
  return { eye: eye, at: at };
}
var mouse = { dx: 0, dy: 0 };
document.addEventListener('mousemove', function (e) { if (document.pointerLockElement) { mouse.dx += e.movementX; mouse.dy += e.movementY; } });
KIT.canvas.addEventListener('click', function () { if (G.mode === 'play' && !('ontouchstart' in window) && KIT.canvas.requestPointerLock) try { KIT.canvas.requestPointerLock(); } catch (e) {} });
function poseOf(e, isP) {
  var Q = pose0(), run = e.spd > 4.5;
  poseWalk(Q, e.ph, Math.min(1, e.spd / 3), run);
  if (isP) {
    if (e.st === 'roll') { var rk = 1 - e.roll / 0.62; Q.bp = Math.min(1, rk / 0.7) * Math.PI * 2; Q.bodyY = 0.5 * Math.sin(Math.min(1, rk / 0.7) * Math.PI); Q.y = -0.3; Q.hip = [1.4, 1.4]; Q.kn = [2, 2]; Q.sh = [[1.2, 0.2], [1.2, 0.2]]; Q.el = [2, 2]; if (rk > 0.7) { Q.bp = 0; Q.bodyY = 0; Q.y = -0.25 * (1 - (rk - 0.7) / 0.3); Q.kn = [0.9, 0.6]; Q.hip = [0.8, 0.3]; Q.sh = [[0.6, 0.3], [0.6, 0.3]]; Q.el = [0.8, 0.8]; } }
    else if (e.st === 'back') { Q.lean = -0.3; Q.hip = [-0.3, 0.6]; Q.kn = [0.2, 0.8]; Q.sh[1] = [0.8, 0.3, 0.2]; Q.el[1] = 0.9; }
    else if (e.atk) poseMove(Q, e.atk);
    else if (e.st === 'drink') { Q.sh[0] = [2.4, -0.2, 0.2]; Q.el[0] = 1.8; Q.hp = -0.4; Q.sh[1] = [0.5, 0.2, 0.1]; Q.el[1] = 0.5; }
    else poseHold(Q, e);
    if (!e.atk && e.st !== 'roll' && e.lean) Q.lean += Math.max(-0.25, Math.min(0.3, e.lean));
    if (e.hurtT > 0.3) poseHurt(Q, 1);
    if (e.hp <= 0) poseDown(Q, Math.min(1, G.deadT * 2), 0);
  } else {
    var st = e.st, d = e.d;
    if (st === 'dead') poseDown(Q, Math.min(1, e.t * 2.5), e.boss);
    else if (st === 'stagger' || st === 'stun') { poseHurt(Q, 1); Q.hr = Math.sin(KIT.t * 4) * 0.3; }
    else if (st === 'wind') { if (d.swing === 'punch') posePunch(Q, Math.min(0.39, e.t / d.wind * 0.39)); else poseSwing(Q, Math.min(0.34, e.t / d.wind * 0.34)); }
    else if (st === 'strike') { if (d.swing === 'punch') posePunch(Q, 0.4 + Math.min(0.6, e.t * 2)); else poseSwing(Q, 0.35 + Math.min(0.65, e.t * 2.5)); if (d.swing === 'slam') { Q.lean = 0.5; } }
    else if (e.boss) { if (st === 'swing') { var dl = (e.dl || 0.7) / (e.ph2 ? 1.3 : 1); poseSwing(Q, e.t < dl ? Math.min(0.34, e.t / Math.min(dl, 0.6) * 0.34) : 0.35 + Math.min(0.65, (e.t - dl) * 2.5)); } else if (st === 'combo') { var per = 0.55, kk = (e.t % per) / per; poseSwing(Q, kk); } else if (st === 'charge') { Q.lean = e.t < 0.8 ? -0.2 : 0.55; } else if (st === 'slam' || st === 'leap') { Q.sh[0] = [2.8, 0.3, 0]; Q.sh[1] = [2.8, 0.3, 0]; Q.lean = e.t > 0.9 ? 0.5 : -0.2; } else if (st === 'throw') poseSwing(Q, Math.min(1, (e.t % 0.25) * 4)); else if (st === 'intro') { Q.sh[0] = [2.6, 0.6, 0]; Q.sh[1] = [2.6, 0.6, 0]; } }
  }
  return Q;
}
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (G.mode === 'nogl') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', KIT.W / 2, KIT.H / 2, { align: 'center' }); return; }
  if (!WORLD || !P) { if (R3.ok) R3.begin([0.04, 0.0, 0.01]); titleArt(); return; }
  var A = WORLD.A, C = camPose(); R3.begin(A.fog); R3.setCam(C.eye, C.at, KIT.W < KIT.H ? 1.25 : 1.0);
  var lights = []; WORLD.things.forEach(function (t, n) { if (t.k !== 'candle' && t.k !== 'torch') return; var x = tx(t.i), z = tx(t.j), d = Math.hypot(x - P.x, z - P.z); if (d > 28) return; var lit = t.k === 'torch' || SV.lit[t.id], fl = 0.9 + Math.sin(G.t * 11 + n) * 0.08 + Math.sin(G.t * 23 + n * 3) * 0.05;
    if (lit) lights.push({ x: x, y: th(t.i, t.j) + (t.k === 'torch' ? 2.7 : 1.4), z: z, r: t.k === 'torch' ? 11 : 9, c: A.lamp, k: 1.25 * fl, d: d }); });
  FLAMES.forEach(function (f, n) { if (n % 5) return; var d = Math.hypot(f.x - P.x, f.z - P.z); if (d < 16) lights.push({ x: f.x, y: f.y + 0.3, z: f.z, r: 5, c: [1, 0.6, 0.3], k: 0.9, d: d + 3 }); });
  lights.sort(function (a, b) { return a.d - b.d; }); lights = lights.slice(0, 6); lights.push({ x: P.x, y: P.y + 2.4, z: P.z, r: 7, c: [1, 0.85, 0.6], k: 0.5 }); // his own little glow so you can always see him
  R3.scene({ fog: A.fog, fogR: [10, 44], amb: [A.amb[0] * 1.5, A.amb[1] * 1.5, A.amb[2] * 1.5], lights: lights, torch: { p: [0, -99, 0], d: [0, 1, 0], c: [0, 0, 0] }, t: G.t });
  R3.draw(MESH, ATT);
  // props that change: doors, chests, the fog gate
  WORLD.things.forEach(function (t) { var x = tx(t.i), z = tx(t.j), h = th(t.i, t.j); if (Math.hypot(x - P.x, z - P.z) > 40) return;
    if (t.k === 'door' && !SV.doors[t.id]) { var horiz = tk(t.i - 1, t.j) === 1; R3.draw(OWN.door, ATT, { m: R3.model(x, h, z, horiz ? 0 : Math.PI / 2, 0, 0) }); }
    else if (t.k === 'chest') R3.draw(SV.chests[t.id] ? OWN.chestOpen : OWN.chest, ATT, { m: R3.model(x, h, z, 0, 0, 0) });
    else if (t.k === 'fog' && G.fogShut) { var a = 0.45 + Math.sin(G.t * 2) * 0.1; R3.draw(OWN.fog, ATT, { m: R3.model(x - TSZ / 2, h, z, 0, 0, 0), alpha: a, lit: false, add: 1 }); }
    else if (t.k === 'exit' && SV.bosses[WORLD.A.boss]) R3.draw(OWN.fog, ATT, { m: R3.model(x - TSZ / 2, h, z - 0.9, 0, 0, 0), alpha: 0.6, lit: false, add: 1, tint: [1, 0.85, 0.3] }); });
  // people
  var held = RIGS.weap[WEAPONS[SV.wpn].mesh] || OWN[WEAPONS[SV.wpn].mesh];
  var pa = P.inv > 0 && P.hurtT > 0 && Math.floor(G.t * 20) % 2 ? 0.5 : undefined;
  drawCum(P.x, P.y + (P.atk && P.atk.jy || 0), P.z, P.a + (P.atk && P.atk.spin || 0), poseOf(P, 1), { held: held, heldP: -Math.PI / 2 - 0.2, alpha: pa });
  FOE.forEach(function (f) { if (Math.hypot(f.x - P.x, f.z - P.z) > 32) return; if (f.st === 'dead' && f.t > 2) return; var rig = RIGS[f.d.rig] || RIGS.gimp, fl = f.hurt > 0 ? [0.6, 0.6, 0.6] : f.st === 'wind' && (f.wl === undefined || f.wl - f.t < 0.2) && Math.floor(G.t * 14) % 2 ? [0.5, 0.05, 0.05] : null;
    drawRig(rig, f.x, f.y + (f.jy || 0), f.z, f.a, poseOf(f), { flash: fl, held: f.d.held && rig.P[f.d.held] ? rig.P[f.d.held] : null, heldP: -Math.PI / 2, alpha: f.st === 'dead' ? Math.max(0, 1 - (f.t - 1)) : undefined }); });
  if (BOSS && !(BOSS.st === 'dead' && BOSS.t > 3)) { var b = BOSS, brig = RIGS[b.B.rig] || RIGS.butcher, bf = b.hurt > 0 ? [0.6, 0.6, 0.6] : (b.st !== 'idle' && b.st !== 'stun' && b.st !== 'dead' && b.t < 0.6 && Math.floor(G.t * 12) % 2) ? [0.55, 0.05, 0.05] : null;
    drawRig(brig, b.x, b.y + (b.jy || 0), b.z, b.a, poseOf(b), { sc: b.B.sc, flash: bf, held: brig.P.weapon || brig.P.bottle || null, heldP: -Math.PI / 2 }); }
  // billboards: flames, blood, sparks, shots, the bloodstain, tells
  if (!DYN) DYN = new R3.Mesh(); DYN.clear(); var R = R3.cam.right;
  function bb(x, y, z, w, h, T, g) { DYN.quad([x - R[0] * w, y - h, z - R[2] * w], [x + R[0] * w, y - h, z + R[2] * w], [x + R[0] * w, y + h, z + R[2] * w], [x - R[0] * w, y + h, z - R[2] * w], [0, 1, 1, 1, 1, 0, 0, 0], T, [0.5, 0.5, 0.5], [0, 0, 1], g || 1.5); }
  WORLD.things.forEach(function (t) { if ((t.k === 'candle' && SV.lit[t.id]) || t.k === 'torch') { var x = tx(t.i), z = tx(t.j); if (Math.hypot(x - P.x, z - P.z) > 30) return; var y = th(t.i, t.j) + (t.k === 'torch' ? 2.75 : 1.2), s = 0.22 + Math.sin(G.t * 13 + t.i) * 0.03; bb(x, y, z, s, s * 1.3, TL('flame'), 2); bb(x, y, z, s * 3, s * 3, TL('halo'), 1); } });
  FLAMES.forEach(function (f, n) { if (Math.abs(f.x - P.x) > 24 || Math.abs(f.z - P.z) > 24) return; var s = 0.06 + Math.sin(G.t * 15 + n) * 0.012; bb(f.x, f.y, f.z, s, s * 1.5, TL('flame'), 2); bb(f.x, f.y, f.z, s * 4, s * 4, TL('halo'), 0.6); });
  FX.forEach(function (f) { if (f.k === 'blood') { f.vy -= 12 / 60; f.x += f.vx / 60; f.y += f.vy / 60; f.z += f.vz / 60; bb(f.x, f.y, f.z, 0.05, 0.05, TL('blood1'), 0.6); } else if (f.k === 'spark') bb(f.x, f.y, f.z, 0.25, 0.25, TL('spark'), 2); else if (f.k === 'heal') bb(f.x, f.y + (0.8 - f.t), f.z, 0.5, 0.5, TL('halo'), 2); });
  SHOTS.forEach(function (s) { bb(s.x, s.y, s.z, 0.18, 0.18, TL('spark'), 2); });
  if (SV.stain && SV.stain.area === SV.area) { var sy = floorAt(SV.stain.x, SV.stain.z) + 0.5 + Math.sin(G.t * 3) * 0.1; bb(SV.stain.x, sy, SV.stain.z, 0.3, 0.3, TL('blood1'), 2); bb(SV.stain.x, sy, SV.stain.z, 0.8, 0.8, TL('halo'), 1); }
  if (BOSS) BOSS.marks.forEach(function (m) { var n = 24, g = TL('glow'), y = BOSS.y + 0.06; for (var i = 0; i < n; i++) { var a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283; DYN.quad([m.x + Math.cos(a0) * m.r, y, m.z + Math.sin(a0) * m.r], [m.x + Math.cos(a1) * m.r, y, m.z + Math.sin(a1) * m.r], [m.x + Math.cos(a1) * (m.r - 0.25), y, m.z + Math.sin(a1) * (m.r - 0.25)], [m.x + Math.cos(a0) * (m.r - 0.25), y, m.z + Math.sin(a0) * (m.r - 0.25)], [0, 0, 1, 0, 1, 1, 0, 1], g, [0.6, 0.05, 0.05], [0, 1, 0], 2); } });
  FX.forEach(function (f) { if (f.k !== 'ring') return; var n = 24, g = TL('glow'); for (var i = 0; i < n; i++) { var a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283, r = f.r * (1.2 - f.t); DYN.quad([f.x + Math.cos(a0) * r, f.y, f.z + Math.sin(a0) * r], [f.x + Math.cos(a1) * r, f.y, f.z + Math.sin(a1) * r], [f.x + Math.cos(a1) * (r - 0.4), f.y, f.z + Math.sin(a1) * (r - 0.4)], [f.x + Math.cos(a0) * (r - 0.4), f.y, f.z + Math.sin(a0) * (r - 0.4)], [0, 0, 1, 0, 1, 1, 0, 1], g, [0.6, 0.5, 0.4], [0, 1, 0], 2); } });
  R3.draw(DYN, ATT, { soft: true, lit: false }); FX.forEach(function (f) { f.t -= 1 / 60; }); FX = FX.filter(function (f) { return f.t > 0; });
  hud();
}
function titleArt() { var ctx = KIT.ctx, Wd = KIT.W, Hd = KIT.H; ctx.fillStyle = '#070405'; ctx.fillRect(0, 0, Wd, Hd); ctx.fillStyle = '#4a0a10'; ctx.beginPath(); ctx.arc(Wd / 2, Hd * 0.32, 60, 0, 6.3); ctx.fill(); ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.arc(Wd / 2, Hd * 0.32, 52, 0, 6.3); ctx.fill(); for (var i = 0; i < 9; i++) { ctx.fillStyle = '#0e0708'; ctx.fillRect(i * Wd / 9, Hd * 0.5 - (i % 3) * 30 - 40, Wd / 9 - 6, Hd); } }
var PADR = { t: 0, r: null };
function padRect() { // the touch buttons' top-left corner in HUD pixels, or null when they are off the picture
  var now = Date.now(); if (now - PADR.t < 500) return PADR.r; PADR.t = now; PADR.r = null; var a = document.getElementById('acts'), c = KIT.canvas; if (!a || !c || document.documentElement.classList.contains('hs-notouch')) return null;
  var ra = a.getBoundingClientRect(), rc = c.getBoundingClientRect(); if (!ra.width || ra.left > rc.right || ra.top > rc.bottom) return null; var sc = Math.min(rc.width / KIT.W, rc.height / KIT.H), ox = rc.left + (rc.width - KIT.W * sc) / 2, oy = rc.top + (rc.height - KIT.H * sc) / 2;
  PADR.r = { x: (ra.left - ox) / sc - 4, y: (ra.top - oy) / sc - 4 }; return PADR.r; }
function hud() { // update 146: laid out like Elden Ring's: three bars top left, the equipment cross bottom left, Loads bottom right, the boss bar along the bottom
  var Wd = KIT.W, Hd = KIT.H, R = KIT.R, g = KIT.ctx, GOLD = '#7a6238';
  function frame(x, y, w, h) { R('#0a0405', x - 2, y - 2, w + 4, h + 4); R(GOLD, x - 1, y - 1, w + 2, 1); R(GOLD, x - 1, y + h, w + 2, 1); R(GOLD, x - 1, y, 1, h); R(GOLD, x + w, y, 1, h); R('#170607', x, y, w, h); }
  function bar(x, y, w, h, k, col, lag) { frame(x, y, w, h); if (lag !== undefined && lag > k) R('#d8b060', x, y, Math.round(w * Math.max(0, lag)), h); R(col, x, y, Math.round(w * Math.max(0, k)), h); R('rgba(255,255,255,0.28)', x, y, Math.round(w * Math.max(0, k)), 1); R('rgba(0,0,0,0.3)', x, y + h - 1, Math.round(w * Math.max(0, k)), 1); }
  var mh = maxHp(), hw = Math.round(60 + mh * 0.75); bar(12, 10, hw, 5, P.hp / mh, '#b0141e', (P.hpLag || P.hp) / mh);
  var mf = maxFp(), fw = Math.round(50 + mf * 0.8); bar(12, 19, fw, 3, (P.fp === undefined ? mf : P.fp) / mf, '#3a62c8');
  var ms = maxSta(), sw = Math.round(40 + ms * 0.9); bar(12, 26, sw, 3, P.sta / ms, '#3f8f3a');
  // the equipment cross
  var cx = 40, cy = Hd - 48, S2 = 21, PR = padRect();
  function slot(x, y, fn) { R('rgba(8,3,4,0.72)', x - S2 / 2, y - S2 / 2, S2, S2); R(GOLD, x - S2 / 2, y - S2 / 2, S2, 1); R(GOLD, x - S2 / 2, y + S2 / 2 - 1, S2, 1); R(GOLD, x - S2 / 2, y - S2 / 2, 1, S2); R(GOLD, x + S2 / 2 - 1, y - S2 / 2, 1, S2); if (fn) { g.save(); g.translate(x - S2 / 2 + 2, y - S2 / 2 + 2); fn(g, S2 - 4, S2 - 4); g.restore(); } }
  var SK = skillOf(), canSk = (P.fp || 0) >= SK.fp;
  slot(cx, cy - 23, function (c, w) { c.globalAlpha = canSk ? 1 : 0.35; c.strokeStyle = '#6a9aff'; c.lineWidth = 1.5; c.beginPath(); c.arc(w / 2, w / 2, w * 0.32, 0, 6.3); c.stroke(); c.fillStyle = '#c8dcff'; c.fillRect(w / 2 - 1, w / 2 - 1, 2, 2); c.globalAlpha = 1; });
  slot(cx - 23, cy, function (c, w) { c.fillStyle = '#5a4a3a'; c.beginPath(); c.moveTo(w * 0.2, w * 0.15); c.lineTo(w * 0.8, w * 0.15); c.lineTo(w * 0.8, w * 0.5); c.lineTo(w * 0.5, w * 0.88); c.lineTo(w * 0.2, w * 0.5); c.fill(); c.fillStyle = '#8a7050'; c.fillRect(w * 0.45, w * 0.22, w * 0.1, w * 0.5); });
  slot(cx + 23, cy, wIcon(SV.wpn));
  slot(cx, cy + 23, function (c, w) { c.fillStyle = '#12040a'; c.fillRect(w * 0.3, w * 0.1, w * 0.4, w * 0.8); c.fillStyle = P.flask > 0 ? '#f1e0b0' : '#3a2a20'; c.fillRect(w * 0.36, w * 0.36, w * 0.28, w * 0.48); c.fillStyle = '#a8743a'; c.fillRect(w * 0.4, w * 0.12, w * 0.2, w * 0.16); });
  KIT.text(String(P.flask), cx + 8, cy + 26, { size: 6, col: '#f1e7d0', outline: 1 });
  KIT.text(SK.n.toUpperCase(), cx + 14, cy - 27, { size: 6, col: canSk ? '#9ab8ff' : '#5a6070', outline: 1 });
  KIT.text(WEAPONS[SV.wpn].n.toUpperCase(), cx + 36, cy - 3, { size: 6, col: '#c8b898', outline: 1 });
  KIT.text('CUM FLASK', cx + 17, cy + 26, { size: 6, col: '#c8b898', outline: 1 });
  // Loads, like runes
  var ls = String(SV.loads), lw = 30 + ls.length * 6, LX = Wd - 10, LY = Hd - 22; if (PR && PR.x < Wd - lw - 10 && PR.y < Hd - 8) { LX = 12 + lw; LY = 34; } // the touch buttons cover the corner: under the bars instead
  R('rgba(8,3,4,0.72)', LX - lw, LY, lw, 13); R(GOLD, LX - lw, LY, lw, 1); R(GOLD, LX - lw, LY + 12, lw, 1);
  g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(LX - lw + 9, LY + 8, 3, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(LX - lw + 6, LY + 7); g.lineTo(LX - lw + 9, LY + 1); g.lineTo(LX - lw + 12, LY + 7); g.fill();
  KIT.text(ls, LX - 4, LY + 3, { align: 'right', size: 7, col: '#f1e7d0' });
  if (LOCK && LOCK.hp > 0) { var pp = R3.project(LOCK.x, LOCK.y + (LOCK.boss ? 2.2 * LOCK.B.sc * 0.6 : 1.4), LOCK.z); if (pp) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(pp.x, pp.y, 3.5, 0, 6.3); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(pp.x, pp.y, 2, 0, 6.3); g.fill(); } }
  FOE.forEach(function (f) { if (f.hp <= 0 || f.hp >= f.d.hp) return; var pp2 = R3.project(f.x, f.y + 2.3, f.z); if (pp2 && pp2.w < 18) { R('#0a0405', pp2.x - 13, pp2.y, 26, 4); R(GOLD, pp2.x - 13, pp2.y, 26, 1); R('#b0141e', pp2.x - 12, pp2.y + 1, 24 * f.hp / f.d.hp, 2); } });
  POP.forEach(function (p) { p.t -= 1 / 60; p.y += 0.01; var pp3 = R3.project(p.x, p.y, p.z); if (pp3) KIT.text(p.s, pp3.x, pp3.y, { align: 'center', size: 6, col: p.col, alpha: Math.min(1, p.t * 2), outline: 1 }); }); POP = POP.filter(function (p) { return p.t > 0; });
  if (BOSS && BOSS.st !== 'dead' && G.inArena) { var b = BOSS; if (b.lag === undefined || b.lag < b.hp) b.lag = b.hp; if (b.lastHp !== undefined && b.hp < b.lastHp) { b.lagT = 0.8; b.dmgSum = (b.dmgT > 0 ? b.dmgSum : 0) + (b.lastHp - b.hp); b.dmgT = 2; } b.lastHp = b.hp; b.lagT = (b.lagT || 0) - 1 / 60; b.dmgT = (b.dmgT || 0) - 1 / 60; if (b.lagT <= 0) b.lag = Math.max(b.hp, b.lag - b.mhp / 90);
    var right = PR && PR.y < Hd - 30 ? Math.min(Wd, PR.x) : Wd, left = 96, bw = Math.min(320, right - left - 12), bx = left + (right - left - bw) / 2, by = Hd - 26; KIT.text(b.B.n, bx, by - 10, { size: 6, col: '#f1e7d0', outline: 1 }); if (b.dmgT > 0) KIT.text(String(Math.round(b.dmgSum)), bx + bw, by - 10, { align: 'right', size: 6, col: '#f1e7d0', outline: 1 }); bar(bx, by, bw, 4, b.hp / b.mhp, '#9a1018', b.lag / b.mhp); }
  if (G.prompt) { var ps = G.prompt.replace('@', keyName('use')).replace('%', keyName('light')), pw = ps.length * 6 + 24, py = Hd * 0.7; R('rgba(8,3,4,0.78)', Wd / 2 - pw / 2, py - 6, pw, 20); R(GOLD, Wd / 2 - pw / 2, py - 6, pw, 1); R(GOLD, Wd / 2 - pw / 2, py + 13, pw, 1); KIT.text(ps, Wd / 2, py, { align: 'center', size: 7, col: '#f1e7d0' }); }
  if (G.banner && G.banner.t > 0) { var a = Math.min(1, G.banner.t, 3.5 - G.banner.t); R('rgba(0,0,0,' + 0.5 * a + ')', 0, Hd * 0.36, Wd, 34); KIT.text(G.banner.s, Wd / 2, Hd * 0.36 + 4, { align: 'center', font: 'title', size: 26, col: '#ffe36a', alpha: a }); }
  if (G.mode === 'dead') { var a2 = Math.min(1, G.deadT / 1.2); R('rgba(0,0,0,' + a2 * 0.6 + ')', 0, Hd * 0.38, Wd, 44); KIT.text('YOU DIED', Wd / 2, Hd * 0.38 + 4, { align: 'center', font: 'title', size: 36, col: '#c4121c', alpha: a2 }); }
}

