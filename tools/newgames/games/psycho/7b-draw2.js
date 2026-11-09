/* =====================================================================================================
   MORE DRAWING: the getaway car (a chase camera), TB's crash into T's Hussy House, the boss fight's health bar, the
   rides' prompts, Laboozie's flaming bags and the fires they leave, TB on fire, the other player online.
   ===================================================================================================== */
/* the bags in the air, the burning patches, campfires and the wreck: flat bits (DYN) then glowing bits (add) */
function drawBagsFx(m) {
  G.bags.forEach(function (b) { bill(m, b.x, b.y, b.z, 0.2, 0.2, TL('poo'), [0.5, 0.5, 0.5], 0.4); });
  G.burns.forEach(function (B) { var s = B.r * 0.9, x = B.x, z = B.z; m.quad([x - s, 0.03, z - s], [x + s, 0.03, z - s], [x + s, 0.03, z + s], [x - s, 0.03, z + s], [0, 0, 1, 0, 1, 1, 0, 1], TL('poo'), [0.32, 0.32, 0.32], [0, 1, 0], 0); });
}
function drawFlames(m, P) {
  var t = KIT.t;
  function fire(x, z, s, y0, n) { for (var k = 0; k < (n || 3); k++) { var a = k * 2.1 + t * 0.7, h = s * (0.9 + 0.3 * Math.sin(t * 9 + k * 3)); bill(m, x + Math.cos(a) * s * 0.35, (y0 || 0) + h * 0.8, z + Math.sin(a) * s * 0.35, s * 0.55, h, TL('flame'), [0.55, 0.42, 0.3], 1); } }
  G.bags.forEach(function (b) { bill(m, b.x, b.y + 0.15, b.z, 0.22, 0.3, TL('flame'), [0.6, 0.45, 0.3], 1); });
  G.burns.forEach(function (B) { if (Math.hypot(B.x - P.x, B.z - P.z) > 30) return; var k = Math.min(1, B.t / 2); fire(B.x, B.z, 0.75 * k + 0.2, 0, 4); bill(m, B.x + Math.sin(t) * 0.3, 1.5 + (t * 0.8 % 1), B.z, 0.4, 0.5, TL('stink'), [0.3, 0.45, 0.2], 1); });
  (FL.fires || []).forEach(function (F) { if (Math.hypot(F.x - P.x, F.z - P.z) > 40) return; fire(F.x, F.z, F.s, F.y || 0, F.s > 1 ? 6 : 3); if (F.s > 1) bill(m, F.x, 3.5 + (t * 0.5 % 1) * 2, F.z, 1.4, 1.4, TL('smoke'), [0.15, 0.13, 0.12], 1); });
  var tb = G.tb; if (tb && tb.fire && tb.st !== 'gone' && tb.st !== 'away') { for (var k2 = 0; k2 < 5; k2++) { var a2 = k2 * 1.3 + t * 2, r = 0.25; bill(m, tb.x + Math.cos(a2) * r, 0.5 + k2 * 0.33 + Math.sin(t * 11 + k2) * 0.08, tb.z + Math.sin(a2) * r, 0.28, 0.4, TL('flame'), [0.6, 0.42, 0.25], 1); } }
  G.foes.forEach(function (f) { if (f.burnT > 0 || f.poison > 0) bill(m, f.x, 1.2 + Math.sin(t * 7) * 0.1, f.z, 0.3, 0.45, TL(f.poison > 0 ? 'stink' : 'flame'), f.poison > 0 ? [0.3, 0.45, 0.2] : [0.55, 0.4, 0.25], 1); });
}
function fireLights(eye) { var out = [];
  G.burns.forEach(function (B) { out.push({ x: B.x, y: 0.8, z: B.z, r: 5, c: [1, 0.5, 0.15], k: 1.2 + Math.sin(KIT.t * 17 + B.x) * 0.2, d: Math.hypot(B.x - eye[0], B.z - eye[2]) }); });
  (FL.fires || []).forEach(function (F) { out.push({ x: F.x, y: 1, z: F.z, r: F.s > 1 ? 11 : 7, c: [1, 0.45, 0.15], k: 1.4 + Math.sin(KIT.t * 13 + F.z) * 0.25, d: Math.hypot(F.x - eye[0], F.z - eye[2]) }); });
  var tb = G.tb; if (tb && tb.fire && tb.st !== 'gone' && tb.st !== 'away') out.push({ x: tb.x, y: 1.4, z: tb.z, r: 6, c: [1, 0.45, 0.12], k: 1.5 + Math.sin(KIT.t * 19) * 0.3, d: Math.hypot(tb.x - eye[0], tb.z - eye[2]) });
  return out.sort(function (a, b) { return a.d - b.d; }).slice(0, 3); }
/* a person: Cumhead or Laboozie, here or online */
function drawPerson(pl, T) {
  var Q = pose0(), W = WEAP[pl.weap] || WEAP.fists, rig = pl.who === 'lab' ? 'laboozie' : 'cumhead';
  if (pl.dead) { poseDown(Q, 1, 0); drawRig(RIGS[rig], pl.x, 0, pl.z, pl.a, Q, { tint: T.tint }); return; }
  if (pl.crouch) poseCrouch(Q, pl.ph, Math.min(1, pl.spd)); else poseWalk(Q, pl.ph, Math.min(1, pl.spd / 2.6), pl.run);
  if (W.gun && (pl.aim || pl.atkT >= 0)) poseAim(Q, pl.weap, pl.kick || 0); else if (W.gun) { Q.sh[1] = [0.35, 0.1, 0]; Q.el[1] = 0.9; }
  if ((W.melee || W.throw) && pl.atkT >= 0) { if (pl.weap === 'fists') posePunch(Q, pl.atkT); else if (W.throw) { var k = pl.atkT < 0.5 ? pl.atkT / 0.5 : 1 - (pl.atkT - 0.5) / 0.5; Q.sh[1] = [2.4 * k + 0.6 * (1 - k), 0.1, 0]; Q.el[1] = 1.4 - k; Q.twist = -0.3 * k; } else poseSwing(Q, pl.atkT); }
  else if (W.melee && pl.weap !== 'fists') { Q.sh[1] = [0.25, 0.12, 0]; Q.el[1] = 0.7; }
  if (pl.hurtT > 0) poseHurt(Q, pl.hurtT * 2.5);
  var held = W.throw ? (pl.atkT < 0.5 ? RIGS.weap.bag : null) : pl.weap === 'fists' ? null : RIGS.weap[pl.weap];
  drawRig(RIGS[rig], pl.x, 0, pl.z, pl.a, Q, { held: held, heldP: W.gun ? -Math.PI / 2 : -Math.PI / 2 - 0.2, flash: pl.hurtT > 0.2 ? [0.4, 0.05, 0.05] : null, tint: T.tint });
}
/* ---------- THE GETAWAY ---------- */
function drawDrive() {
  var T = tripLook(), cx = roadX(DR.z) + DR.x, yaw = DR.yaw, f = [Math.sin(yaw), Math.cos(yaw)], look = G.P.rca || 0, la = yaw + look * 0.8;
  var fl = [Math.sin(la), Math.cos(la)], eye = [cx - fl[0] * 6.2, 2.9 + DR.bump * 0.2, DR.z - fl[1] * 6.2], at = [cx + fl[0] * 6, 1.1, DR.z + fl[1] * 6];
  var fog = FLOORS[G.fi].fog; R3.begin(fog); var fw = [at[0] - eye[0], at[1] - eye[1], at[2] - eye[2]], fwl = Math.hypot(fw[0], fw[1], fw[2]);
  R3.setCam(eye, at, T.fov * (KIT.W < KIT.H ? 1.35 : 1) + Math.min(0.15, DR.v * 0.004), upVec(T.roll, [fw[0] / fwl, fw[1] / fwl, fw[2] / fwl]));
  var amb = FLOORS[G.fi].amb; R3.scene({ fog: fog, fogR: [14, 95], amb: [amb[0] * 1.7, amb[1] * 1.7, amb[2] * 1.7], lights: driveLights(), torch: { p: [cx + f[0] * 2.4, 0.8, DR.z + f[1] * 2.4], d: [f[0], -0.06, f[1]], c: DR.end ? [0.2, 0.2, 0.15] : [1.6, 1.5, 1.2] }, t: KIT.t, warp: T.warp, hue: T.hue, meat: T.meat, neg: T.neg });
  R3.draw(DRMESH, ATT, { tint: T.tint });
  R3.draw(carMesh('car'), ATT, { m: R3.model(cx, Math.sin(KIT.t * 30) * 0.015 * Math.min(1, DR.v / 10) + DR.bump * 0.1, DR.z, yaw, 0, -DR.steer * 0.04), tint: T.tint });
  var Qd = pose0(), Dd = RIGS.cumhead.D; Qd.y = -Dd.lu * 0.95; Qd.hip = [1.45, 1.45]; Qd.kn = [1.5, 1.5]; Qd.sh = [[1.2, 0.1], [1.2, 0.1]]; Qd.el = [0.5, 0.5];
  var rr = [-Math.cos(yaw), Math.sin(yaw)]; drawRig(RIGS.cumhead, cx + rr[0] * 0.38 - f[0] * 0.2, 0.3, DR.z + rr[1] * 0.38 - f[1] * 0.2, yaw, Qd, { noShadow: 1, tint: T.tint, sc: 0.85 });
  if (G.R || G.net) { var Ql = pose0(), Dl = RIGS.laboozie.D; Ql.y = -Dl.lu * 0.95; Ql.hip = [1.45, 1.45]; Ql.kn = [1.5, 1.5]; var lp = isGuest() ? G.P : G.R; if (lp && lp.atkT >= 0) { Ql.sh[0] = [2.6, 0.5, 0]; Ql.el[0] = 0.3; } drawRig(RIGS.laboozie, cx - rr[0] * 0.38 - f[0] * 0.2, 0.3, DR.z - rr[1] * 0.38 - f[1] * 0.2, yaw, Ql, { noShadow: 1, tint: T.tint, sc: 0.85 }); }
  var heads = G.ev && G.ev.k === 'heads';
  DR.peds.forEach(function (p) { var Q = pose0(), px = roadX(p.z) + p.x; if (Math.abs(p.z - DR.z) > 70) return;
    if (p.st === 'run') poseWalk(Q, p.ph, 1, 1); else { Q.bp = p.spin; Q.sh = [[2.5, 0.8], [2.5, 0.8]]; Q.hip = [0.8, -0.6]; if (p.st === 'dead') { poseDown(Q, 1, (p.id % 2)); } }
    drawRig(RIGS[p.k], px, p.y, p.z, p.a, Q, { tint: T.tint, held: RIGS[p.k].P.weapon, heldP: -Math.PI / 2, head: heads ? RIGS.tbmad.P.head : null }); });
  var m = DYN || (DYN = new R3.Mesh()); m.clear(); G.shots.forEach(function (s) { bill(m, s.x, s.y, s.z, 0.12, 0.12, TL('i_pill'), [0.5, 0.5, 0.5], 1); }); drawBagsFx(m);
  G.fx.forEach(function (e) { if (e.k === 'blood') bill(m, e.x, e.y, e.z, 0.06, 0.06, TL('drop'), [0.35, 0.01, 0.02], 0); else if (e.k === 'smoke') bill(m, e.x, e.y + (2 - e.t) * (e.vy || 1), e.z, 0.5 + (2 - e.t) * 0.4, 0.5 + (2 - e.t) * 0.4, TL('smoke'), [0.25, 0.22, 0.2], 0); });
  R3.draw(m, ATT, {}); m.clear(); drawFlames(m, { x: cx, z: DR.z });
  G.fx.forEach(function (e) { if (e.k === 'spark') bill(m, e.x, e.y, e.z, 0.12, 0.12, TL('spark'), [0.6, 0.45, 0.2], 1); });
  [-0.6, 0.6].forEach(function (o) { if (!DR.end) bill(m, cx + f[0] * 2.25 + rr[0] * o, 0.65, DR.z + f[1] * 2.25 + rr[1] * o, 0.35, 0.35, TL('headlight'), [0.45, 0.42, 0.35], 1); });
  R3.draw(m, ATT, { add: 1, soft: 1, lit: false });
}
function drawDriveHud() {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H; KIT.blit(vignette(), 0, 0);
  if (DR.splat > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.8, DR.splat); ctx.fillStyle = '#7a0008'; for (var i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(W * ((i * 0.37 + 0.1) % 1), H * ((i * 0.53 + 0.2) % 1), 30 + i * 4, 18 + i * 3, i, 0, 6.28); ctx.fill(); } ctx.restore(); }
  KIT.panel(8, 8, 128, 34); KIT.text('THE CAR', 14, 14, { size: 8, col: '#a6968f' }); KIT.bar(14, 28, 116, 6, Math.max(0, DR.hp) / 100, DR.hp > 40 ? '#c8c0a0' : '#ff2630');
  var ry = W < 560 ? 48 : 8; KIT.panel(W - 120, ry, 112, 34); KIT.text(Math.round(DR.v * 3.6) + ' KM/H', W - 64, ry + 6, { align: 'center', size: 8, col: '#f1e7d0' }); KIT.text('RUN OVER  ' + DR.hits, W - 64, ry + 20, { align: 'center', size: 8, col: '#ffe36a' });
  if (DR.t < 6) KIT.text(TOUCH ? 'STEER WITH THE STICK  ·  A GAS  ·  B BRAKE' : 'STEER  ·  A / Z GAS  ·  B / X BRAKE', W / 2, H - 22, { align: 'center', size: 8, col: '#a6968f' });
  if (isGuest() && DR.t < 8) KIT.text('A: THROW A FLAMING BAG OUT OF THE WINDOW', W / 2, H - 36, { align: 'center', size: 8, col: '#ffe36a' });
}
/* ---------- the rides' HUD ---------- */
function drawRideHud() {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H, t = KIT.t, Q = RD.qte;
  if (RD.dark > 0) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); }
  if (Q) { var k = 1 - Q.t / Q.len, s = Q.key === 'lb' ? (TOUCH ? 'L' : 'L / Q') : (TOUCH ? 'A' : 'A / Z'); ctx.save(); ctx.globalAlpha = 0.9; KIT.panel(W / 2 - 150, H * 0.32 - 20, 300, 46); ctx.restore();
    KIT.text(Q.s, W / 2 + Math.sin(t * 40) * 1.2, H * 0.32 - 12, { align: 'center', size: 8, col: '#ff2630', max: 290 }); KIT.bar(W / 2 - 120, H * 0.32 + 12, 240, 6, Math.max(0, k), '#ffe36a');
    if (Q.n > 1) KIT.text('x' + Q.n, W / 2 + 132, H * 0.32 + 9, { size: 8, col: '#f1e7d0' }); KIT.text(s, W / 2, H * 0.32 + 2, { align: 'center', size: 8, col: '#f1e7d0' }); }
  if (RD.t < 5) KIT.text('LOOK ROUND WITH THE RIGHT STICK', W / 2, H - 22, { align: 'center', size: 8, col: '#a6968f', alpha: Math.min(1, 5 - RD.t) });
}
/* ---------- the crash: watch TB's car go into T's Hussy House ---------- */
function drawCrash() {
  var c = G.crash, P = G.P, T = tripLook(), k = Math.min(1, c.t / 2.2), car = { x: c.from.x + (c.hit.x - c.from.x) * k, z: c.from.z + (c.hit.z - c.from.z) * k }, yaw = Math.atan2(c.hit.x - c.from.x, c.hit.z - c.from.z);
  var at = c.t < 2.2 ? car : c.hit, eye = [c.eye.x, 2.1, c.eye.z], f = [at.x - eye[0], 1.2 - eye[1], at.z - eye[2]], l = Math.hypot(f[0], f[1], f[2]); f = [f[0] / l, f[1] / l, f[2] / l];
  R3.begin(FLOORS[G.fi].fog); R3.setCam(eye, [at.x, 1.2, at.z], 0.9 * (KIT.W < KIT.H ? 1.3 : 1), upVec(T.roll, f));
  var L = lightsNow(eye); if (c.t < 2.2) L.unshift({ x: car.x + Math.sin(yaw) * 3, y: 1, z: car.z + Math.cos(yaw) * 3, r: 12, c: [1, 0.95, 0.8], k: 2 }); L = fireLights(eye).concat(L).slice(0, NL - 1);
  var amb = FLOORS[G.fi].amb; R3.scene({ fog: FLOORS[G.fi].fog, fogR: [12, 60], amb: [amb[0] * 1.6, amb[1] * 1.6, amb[2] * 1.6], lights: L, torch: { p: [0, -50, 0], d: [0, -1, 0], c: [0, 0, 0] }, t: KIT.t, warp: T.warp, hue: T.hue, meat: 0, neg: 0 });
  R3.draw(MESH, ATT, {}); if (FRONTMESH && sheetTex()) R3.draw(FRONTMESH, sheetTex(), {});
  R3.draw(carMesh('car'), ATT, { m: R3.model(car.x, c.boom ? 0.2 : 0, car.z, yaw, c.boom ? 0.25 : 0, c.boom ? 0.12 : 0), flash: c.boom ? [0.2, 0.05, 0] : null });
  if (c.out) { var tb = G.tb, Q = pose0(); if (G.tb.st === 'emerge') { Q.sh[0] = [2.8, 0.6, 0]; Q.sh[1] = [2.8, 0.6, 0]; Q.el = [0.3, 0.3]; Q.hp = -0.4; } drawRig(RIGS.tbmad, tb.x, 0, tb.z, tb.a, Q, { heldL: RIGS.tbmad.P.bottle }); }
  var m = DYN || (DYN = new R3.Mesh()); m.clear(); G.fx.forEach(function (e) { if (e.k === 'smoke') bill(m, e.x, e.y + (4 - e.t) * (e.vy || 1) * 0.6, e.z, 0.6 + (4 - e.t) * 0.4, 0.6 + (4 - e.t) * 0.4, TL('smoke'), [0.22, 0.2, 0.18], 0); }); R3.draw(m, ATT, {});
  m.clear(); drawFlames(m, P); R3.draw(m, ATT, { add: 1, soft: 1, lit: false });
}
/* ---------- the boss fight's bar ---------- */
function drawBossHud() { var tb = G.tb; if (!tb || tb.st !== 'boss' && tb.st !== 'dead' || !tb.max) return; var W = KIT.W, w = Math.min(300, W - 40);
  var by = 8; if (W - 280 < 160) { w = W - 40; by = 84; } else w = Math.min(w, W - 280); KIT.panel(W / 2 - w / 2 - 6, by, w + 12, 26); KIT.text('TB', W / 2, by + 4, { align: 'center', size: 8, col: '#ff2630' }); KIT.bar(W / 2 - w / 2, by + 16, w, 6, Math.max(0, tb.hp) / tb.max, tb.phase > 1 ? '#ff4a8a' : '#c4121c');
  if (G.bossIntro > 0) KIT.text("HE'S HERE", W / 2, KIT.H * 0.3, { align: 'center', font: 'title', size: 34, col: '#c4121c', outline: 1, alpha: Math.min(1, G.bossIntro) }); }
/* ---------- the real ending ---------- */
function finalEnding() {
  SV.wins++; if (!SV.best || G.time < SV.best) SV.best = G.time; SV.run = null; persist(); music.play('pnend');
  KIT.menu({ cls: 'pn ending', title: 'HOME', sub: 'TB went down in front of the Clubhouse and stayed down. Cumhead crawled inside, locked the door and did not come out for a week.', html: '<p class="pnstats">Time  ' + clock(G.time) + '<br>TB\'s boys put down  ' + G.kills + '<br>Times TB caught you  ' + G.caught + '<br>Silly Pills taken  ' + G.pills + '<br>Notes read  ' + G.notesRead + '</p><p class="pnbro">"' + TBEND + '"</p>',
    items: [{ label: 'BACK TO THE TITLE', def: 1, fn: function () { netLeave(); G = null; titleMenu(); } }] });
}
