/* ---------- the camera, the world, everyone, the HUD ---------- */
var DYN = null, CAMD = 4.6;
function camPose() {
  var p = P, lk = KIT.stick(1);
  if (LOCK && LOCK.hp > 0) { var la = Math.atan2(LOCK.x - p.x, LOCK.z - p.z); CAMY = turnTo(CAMY, la, 0.08); }
  else { CAMY -= lk.x * 0.045 + mouse.dx * 0.004; mouse.dx = 0; }
  G.camP = Math.max(-0.2, Math.min(0.7, (G.camP === undefined ? 0.28 : G.camP) + lk.y * 0.02 + mouse.dy * 0.003)); mouse.dy = 0;
  G.piv = G.piv || [p.x, p.y + 1.6, p.z]; G.piv[0] += (p.x - G.piv[0]) * 0.22; G.piv[1] += (p.y + 1.6 - G.piv[1]) * 0.12; G.piv[2] += (p.z - G.piv[2]) * 0.22; if (Math.hypot(p.x - G.piv[0], p.z - G.piv[2]) > 4) G.piv = [p.x, p.y + 1.6, p.z];
  var want = LOCK && LOCK.boss ? 7 : 4.6, piv = G.piv, d = 0.5, dir = [-Math.sin(CAMY) * Math.cos(G.camP), Math.sin(G.camP), -Math.cos(CAMY) * Math.cos(G.camP)];
  while (d < want) { var ex = piv[0] + dir[0] * (d + 0.3), ez = piv[2] + dir[2] * (d + 0.3), ey = piv[1] + dir[1] * (d + 0.3), k = tk(tileOf(ex), tileOf(ez)); if (k === 1 || ey < floorAt(ex, ez) + 0.2) break; d += 0.1; }
  CAMD = d < CAMD ? d : CAMD + (d - CAMD) * 0.1;
  var lift = Math.max(0, 3.2 - CAMD) * 0.55, eye = [piv[0] + dir[0] * CAMD, piv[1] + dir[1] * CAMD + lift, piv[2] + dir[2] * CAMD], at = LOCK && LOCK.hp > 0 ? [(p.x + LOCK.x) / 2, p.y + 1.3, (p.z + LOCK.z) / 2] : [p.x - dir[0] * 2.5, p.y + 1.2, p.z - dir[2] * 2.5];
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
    else if (e.boss) { if (st === 'swing' || st === 'combo') { var per = st === 'combo' ? 0.55 : 1.4, kk = (e.t % per) / per; poseSwing(Q, kk); } else if (st === 'charge') { Q.lean = e.t < 0.8 ? -0.2 : 0.55; } else if (st === 'slam' || st === 'leap') { Q.sh[0] = [2.8, 0.3, 0]; Q.sh[1] = [2.8, 0.3, 0]; Q.lean = e.t > 0.9 ? 0.5 : -0.2; } else if (st === 'throw') poseSwing(Q, Math.min(1, (e.t % 0.25) * 4)); else if (st === 'intro') { Q.sh[0] = [2.6, 0.6, 0]; Q.sh[1] = [2.6, 0.6, 0]; } }
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
  drawRig(RIGS.cumhead, P.x, P.y + (P.atk && P.atk.jy || 0), P.z, P.a + (P.atk && P.atk.spin || 0), poseOf(P, 1), { held: held, heldP: -Math.PI / 2 - 0.2, alpha: pa });
  FOE.forEach(function (f) { if (Math.hypot(f.x - P.x, f.z - P.z) > 32) return; if (f.st === 'dead' && f.t > 2) return; var rig = RIGS[f.d.rig] || RIGS.gimp, fl = f.hurt > 0 ? [0.6, 0.6, 0.6] : f.st === 'wind' && Math.floor(G.t * 14) % 2 ? [0.5, 0.05, 0.05] : null;
    drawRig(rig, f.x, f.y, f.z, f.a, poseOf(f), { flash: fl, held: f.d.held && rig.P[f.d.held] ? rig.P[f.d.held] : null, heldP: -Math.PI / 2, alpha: f.st === 'dead' ? Math.max(0, 1 - (f.t - 1)) : undefined }); });
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
function hud() {
  var Wd = KIT.W, Hd = KIT.H, R = KIT.R;
  var hw = maxHp() * 0.9; R('#12040a', 8, 8, hw + 4, 8); R('#3a0a10', 10, 10, hw, 4); R('#c4121c', 10, 10, Math.max(0, P.hp) * 0.9, 4); R('rgba(255,255,255,0.3)', 10, 10, Math.max(0, P.hp) * 0.9, 1);
  var sw = maxSta() * 0.9; R('#12040a', 8, 17, sw + 4, 6); R('#1a2a14', 10, 19, sw, 2); R('#7aff6a', 10, 19, Math.max(0, P.sta) * 0.9, 2);
  for (var i = 0; i < flaskMax(); i++) { var x = 10 + i * 10; R('#12040a', x, 27, 8, 11); R(i < P.flask ? '#f1e0b0' : '#3a2a20', x + 1, 30, 6, 7); R('#a8743a', x + 2, 27, 4, 3); }
  KIT.panel(Wd - 96, Hd - 30, 90, 24); KIT.text(String(SV.loads), Wd - 14, Hd - 22, { align: 'right', size: 8, col: '#ffe36a' }); KIT.text('LOADS', Wd - 88, Hd - 21, { size: 6, col: '#a6968f' });
  KIT.text(WEAPONS[SV.wpn].n.toUpperCase(), 10, 42, { size: 6, col: '#a6968f' });
  if (LOCK && LOCK.hp > 0) { var pp = R3.project(LOCK.x, LOCK.y + (LOCK.boss ? 2.2 * LOCK.B.sc * 0.6 : 1.4), LOCK.z); if (pp) { var g = KIT.ctx; g.strokeStyle = '#f1e7d0'; g.lineWidth = 1; g.beginPath(); g.arc(pp.x, pp.y, 4, 0, 6.3); g.stroke(); R('#ffe36a', pp.x - 1, pp.y - 1, 2, 2); } }
  FOE.forEach(function (f) { if (f.hp <= 0 || f.hp >= f.d.hp) return; var pp2 = R3.project(f.x, f.y + 2.3, f.z); if (pp2 && pp2.w < 18) { R('#12040a', pp2.x - 13, pp2.y, 26, 4); R('#c4121c', pp2.x - 12, pp2.y + 1, 24 * f.hp / f.d.hp, 2); } });
  POP.forEach(function (p) { p.t -= 1 / 60; p.y += 0.01; var pp3 = R3.project(p.x, p.y, p.z); if (pp3) KIT.text(p.s, pp3.x, pp3.y, { align: 'center', size: 6, col: p.col, alpha: Math.min(1, p.t * 2), outline: 1 }); }); POP = POP.filter(function (p) { return p.t > 0; });
  if (BOSS && BOSS.st !== 'dead' && G.inArena) { var bw = Math.min(300, Wd - 80); KIT.text(BOSS.B.n, Wd / 2 - bw / 2, Hd - 30, { size: 6, col: '#f1e7d0' }); R('#12040a', Wd / 2 - bw / 2 - 1, Hd - 21, bw + 2, 6); R('#3a0a10', Wd / 2 - bw / 2, Hd - 20, bw, 4); R('#c4121c', Wd / 2 - bw / 2, Hd - 20, bw * BOSS.hp / BOSS.mhp, 4); }
  if (G.prompt) KIT.text(G.prompt, Wd / 2, Hd * 0.66, { align: 'center', size: 8, col: '#f1e7d0', outline: 1 });
  if (G.banner && G.banner.t > 0) { var a = Math.min(1, G.banner.t, 3.5 - G.banner.t); R('rgba(0,0,0,' + 0.5 * a + ')', 0, Hd * 0.36, Wd, 34); KIT.text(G.banner.s, Wd / 2, Hd * 0.36 + 4, { align: 'center', font: 'title', size: 26, col: '#ffe36a', alpha: a }); }
  if (G.mode === 'dead') { var a2 = Math.min(1, G.deadT / 1.2); R('rgba(0,0,0,' + a2 * 0.6 + ')', 0, Hd * 0.38, Wd, 44); KIT.text('YOU DIED', Wd / 2, Hd * 0.38 + 4, { align: 'center', font: 'title', size: 36, col: '#c4121c', alpha: a2 }); }
}
