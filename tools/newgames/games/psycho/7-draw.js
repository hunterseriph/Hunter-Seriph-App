/* =====================================================================================================
   DRAWING: the over-the-shoulder camera (pulls in when a wall is behind you, tighter when you aim), the lights
   (the nearest lamps, Cumhead's torch, the muzzle flash), the floor, doors, people, pickups and blood, then the HUD
   on the kit's canvas: condition line, trip meter, weapon and ammo, who is watching you, prompts and TB's voice.
   ===================================================================================================== */
var DYN = null, CAM = { d: 2.3 };
function camPose() {
  var P = G.P, T = tripLook();
  if (P.hide) { var r = lockerRect(P.hide), cx = (r[0] + r[2]) / 2 + P.hide.di * 0.25, cz = (r[1] + r[3]) / 2 + P.hide.dj * 0.25, f = [Math.sin(P.ca) * Math.cos(P.cp), Math.sin(P.cp), Math.cos(P.ca) * Math.cos(P.cp)]; return { eye: [cx, 1.6, cz], at: [cx + f[0] * 5, 1.6 + f[1] * 5, cz + f[2] * 5], fov: 0.95, roll: T.roll * 0.5, T: T }; }
  var aim = P.aim, want = aim ? 1.9 : P.crouch ? 2.1 : 2.5, side = aim ? 0.92 : 0.62, h = P.crouch ? 1.45 : aim ? 1.78 : 1.92, cp = P.cp;
  var fx = Math.sin(P.ca) * Math.cos(cp), fy = Math.sin(cp), fz = Math.cos(P.ca) * Math.cos(cp), rx = -Math.cos(P.ca), rz = Math.sin(P.ca);
  var base = [P.x, h, P.z], piv = [P.x + rx * side, h, P.z + rz * side], dir = [-fx, -fy + 0.12, -fz];
  function free(x, z) { var m = 0.2; return !(blockCam(x - m, z - m) || blockCam(x + m, z - m) || blockCam(x - m, z + m) || blockCam(x + m, z + m)); }
  for (var sk = 1; sk > 0 && !free(piv[0], piv[2]); sk -= 0.2) piv = [P.x + rx * side * sk, h, P.z + rz * side * sk]; if (!free(piv[0], piv[2])) piv = base;
  var d = 0.2; while (d < want && free(piv[0] + dir[0] * (d + 0.05), piv[2] + dir[2] * (d + 0.05))) d += 0.05;
  CAM.d = d < CAM.d ? d : CAM.d + (d - CAM.d) * 0.12;
  var eye = [piv[0] + dir[0] * CAM.d, Math.max(0.35, Math.min(CEIL - 0.2, piv[1] + dir[1] * CAM.d)), piv[2] + dir[2] * CAM.d];
  var ek = FL.K[idx(tileOf(eye[0]), tileOf(eye[2]))]; if (ek === KD || ek === KB) eye[1] = Math.min(eye[1], 2.02); // under a door head
  return { eye: eye, at: [eye[0] + fx * 8, eye[1] + fy * 8, eye[2] + fz * 8], fov: T.fov * (aim ? 0.82 : 1) * (KIT.W < KIT.H ? 1.3 : 1), roll: T.roll, T: T };
}
function blockCam(x, z) { var i = tileOf(x), j = tileOf(z); if (!inMap(i, j)) return true; var k = FL.K[idx(i, j)]; return k === KW || k === KL || k === KS || k === KA; }
function upVec(roll, fwd) { var c = Math.cos(roll), s = Math.sin(roll), r = [-fwd[2], 0, fwd[0]], l = Math.hypot(r[0], r[2]) || 1; r = [r[0] / l, 0, r[2] / l]; return [r[0] * s, c, r[2] * s]; }
function bill(m, x, y, z, w, h, T, col, g) { var R = R3.cam.right, U = R3.cam.up; m.quad([x - R[0] * w - U[0] * h, y - R[1] * w - U[1] * h, z - R[2] * w - U[2] * h], [x + R[0] * w - U[0] * h, y + R[1] * w - U[1] * h, z + R[2] * w - U[2] * h], [x + R[0] * w + U[0] * h, y + R[1] * w + U[1] * h, z + R[2] * w + U[2] * h], [x - R[0] * w + U[0] * h, y - R[1] * w + U[1] * h, z - R[2] * w + U[2] * h], [0, 1, 1, 1, 1, 0, 0, 0], T, col || [0.5, 0.5, 0.5], [-R3.cam.fwd[0], -R3.cam.fwd[1], -R3.cam.fwd[2]], g || 0); }
function lightsNow(eye) {
  var th = FLOORS[G.fi], t = KIT.t, out = [], P = G.P;
  FL.lights.forEach(function (L, n) { if (L.dead) return; var x = tx(L.i), z = tx(L.j), d = Math.hypot(x - eye[0], z - eye[2]); if (d > 24) return; var k = L.k;
    if (L.fl) { var s = Math.sin(t * 13 + n * 7) + Math.sin(t * 31 + n) * 0.6; k *= s > 1.1 ? 0.15 : 0.85 + Math.sin(t * 50 + n) * 0.1; }
    out.push({ x: x, y: L.exit ? 2.3 : 2.4, z: z, r: L.r, c: L.c || th.lamp, k: k, d: d, n: n }); });
  out.sort(function (a, b) { return a.d - b.d; }); out = out.slice(0, NL - 3);
  if (!P.hide && G.mode !== 'catch') out.push({ x: eye[0], y: eye[1] + 0.2, z: eye[2], r: 6, c: [0.75, 0.7, 0.65], k: 0.9 });
  if (P.flashT > 0) out.push({ x: P.x + Math.sin(P.a) * 0.8, y: 1.4, z: P.z + Math.cos(P.a) * 0.8, r: 9, c: [1, 0.8, 0.45], k: 2.6 });
  else if (G.tb && G.tb.st !== 'away' && dist2(G.tb, P) < 18) out.push({ x: G.tb.x, y: 2.2, z: G.tb.z, r: 2.6, c: [0.9, 0.15, 0.1], k: 0.35 + Math.sin(t * 3) * 0.1 }); // a faint red glow follows TB
  return out;
}
function drawWorld() {
  var P = G.P, th = FLOORS[G.fi], C = camPose(), T = C.T, fwd = [C.at[0] - C.eye[0], C.at[1] - C.eye[1], C.at[2] - C.eye[2]], fl = Math.hypot(fwd[0], fwd[1], fwd[2]); fwd = [fwd[0] / fl, fwd[1] / fl, fwd[2] / fl];
  var fog = th.fog, eyesB = hasBuff('eyes');
  if (T.meat > 0.2) fog = [0.12 * T.meat, 0.01, 0.02];
  R3.begin(fog); R3.setCam(C.eye, C.at, C.fov, upVec(C.roll, fwd));
  var tp = P.hide ? [0, -50, 0] : [P.x + Math.sin(P.ca) * 0.15 - Math.cos(P.ca) * 0.25, P.crouch ? 1.05 : 1.4, P.z + Math.cos(P.ca) * 0.15 + Math.sin(P.ca) * 0.25];
  var tk = (eyesB ? 1.9 : 1.45) * (G.mode === 'catch' ? 0.3 : 1), flick = G.trip > 3 && Math.sin(KIT.t * 17) > 0.97 ? 0.2 : 1;
  R3.scene({ fog: fog, fogR: G.mode === 'end' ? [10, 40] : eyesB ? [8, 28] : [6, 23], amb: [th.amb[0] * 1.6, th.amb[1] * 1.6, th.amb[2] * 1.6], lights: lightsNow(C.eye), torch: { p: tp, d: fwd, c: [tk * flick, tk * 0.92 * flick, tk * 0.76 * flick] }, t: KIT.t, warp: T.warp, hue: T.hue, meat: T.meat, neg: T.neg });
  R3.draw(MESH, ATT, { tint: T.tint });
  var heads = G.ev && G.ev.k === 'heads';
  FL.doors.forEach(function (D) { var cx = tx(D.i), cz = tx(D.j); if (Math.hypot(cx - P.x, cz - P.z) > 26) return; var op = D.open * Math.PI * 0.5 * D.side, m;
    if (D.ax === 'x') m = R3.model(cx, 0, D.i >= 0 ? D.j * TSZ + (D.side > 0 ? 0.1 : TSZ - 0.1) : 0, (D.side > 0 ? -Math.PI / 2 : Math.PI / 2) + op, 0, 0);
    else m = R3.model(D.side > 0 ? D.i * TSZ + 0.1 : D.i * TSZ + TSZ - 0.1, 0, cz, (D.side > 0 ? 0 : Math.PI) - op, 0, 0);
    R3.draw(RIGS.door, ATT, { m: m, tint: T.tint }); });
  var cd = FL.cellDoor; if (cd) { var ccx = tx(cd.i), ccz = tx(cd.j), sw = FL.cellLocked ? 0 : Math.PI * 0.45, mm = cd.di ? R3.model(ccx, 0, cd.j * TSZ, -Math.PI / 2 + sw, 0, 0) : R3.model(cd.i * TSZ, 0, ccz, sw, 0, 0); R3.draw(RIGS.bars, ATT, { m: mm }); }
  /* people */
  G.foes.forEach(function (f) { if (dist2(f, P) > 25) return; var Q = pose0(), rig = RIGS[f.k], run = f.st === 'chase';
    if (f.st === 'dead') { poseDown(Q, Math.min(1, f.t * 2.5), f.k === 'butcher'); }
    else if (f.st === 'ko') { poseDown(Q, 1, 0); Q.hr = Math.sin(KIT.t * 2) * 0.3; }
    else { poseWalk(Q, f.ph, Math.min(1, f.spd / 2), run); if (f.atk >= 0) { if (f.k === 'gimp') posePunch(Q, Math.min(1, f.atk / 0.9)); else poseSwing(Q, Math.min(1, f.atk / 0.7)); } if (f.hurt > 0) poseHurt(Q, f.hurt * 4); if (f.st !== 'idle' && f.sus > 0.2 && f.st !== 'chase') Q.hp = -0.15; }
    drawRig(rig, f.x, 0, f.z, f.a, Q, { flash: f.hurt > 0.15 ? [0.5, 0.05, 0.05] : null, held: rig.P.weapon, heldP: -Math.PI / 2, head: heads && f.st !== 'dead' ? RIGS.tbmad.P.head : null, tint: T.tint });
    });
  var tb = G.tb; if (tb && tb.st !== 'away') drawTB(tb, T, G.mode === 'catch' ? 'tbmad' : 'tb');
  if (G.ghost) drawTB(G.ghost, T, 'tbmad', 0.7 + Math.sin(KIT.t * 20) * 0.2);
  if (!P.hide) drawPlayer(T);
  /* pickups, sparks, blood, glows */
  var m = DYN || (DYN = new R3.Mesh()); m.clear();
  G.loot.forEach(function (l) { if (Math.hypot(l.x - P.x, l.z - P.z) > 22) return; var L = LOOT[l.k]; bill(m, l.x, 0.42 + Math.sin(l.t * 2.4) * 0.06, l.z, 0.26, 0.26, TL(L.tile), [0.5, 0.5, 0.5], 0.7); });
  G.shots.forEach(function (s) { bill(m, s.x, s.y, s.z, 0.09, 0.09, TL('i_pill'), [0.5, 0.5, 0.5], 1); });
  G.fx.forEach(function (e) { if (e.k === 'blood') bill(m, e.x, e.y, e.z, 0.05, 0.05, TL('drop'), [0.35, 0.01, 0.02], 0); else if (e.k === 'pillfall') bill(m, e.x, e.y, e.z, 0.12, 0.12, TL('i_pill'), [0.5, 0.5, 0.5], 1); });
  R3.draw(m, ATT, {});
  m.clear(); var t = KIT.t;
  G.loot.forEach(function (l) { if (Math.hypot(l.x - P.x, l.z - P.z) > 18) return; var s = 0.14 + Math.max(0, Math.sin(l.t * 3)) * 0.12; bill(m, l.x + 0.15, 0.62 + Math.sin(l.t * 2.4) * 0.06, l.z, s, s, TL('spark'), l.k === 'key' || l.k === 'bag' ? [0.5, 0.42, 0.1] : [0.35, 0.3, 0.22], 1); });
  FL.lights.forEach(function (L) { if (L.dead || L.exit) return; var x = tx(L.i), z = tx(L.j); if (Math.hypot(x - P.x, z - P.z) > 20) return; bill(m, x, 2.42, z, 0.5, 0.5, TL('halo'), [0.25 * FLOORS[G.fi].lamp[0], 0.25 * FLOORS[G.fi].lamp[1], 0.25 * FLOORS[G.fi].lamp[2]], 1); });
  G.fx.forEach(function (e) { if (e.k === 'tracer') { var R = R3.cam.up, w = 0.012; m.quad([e.x0, e.y - w, e.z0], [e.x1, e.y - w, e.z1], [e.x1, e.y + w, e.z1], [e.x0, e.y + w, e.z0], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), [0.5, 0.42, 0.2], [0, 1, 0], 1); }
    else if (e.k === 'puff') bill(m, e.x, e.y, e.z, 0.12 + (0.4 - e.t) * 0.5, 0.12 + (0.4 - e.t) * 0.5, TL('halo'), [0.18, 0.16, 0.14], 1); });
  if (P.flashT > 0) { var hx = P.x + Math.sin(P.a) * 0.75 - Math.cos(P.a) * 0.22, hz = P.z + Math.cos(P.a) * 0.75 + Math.sin(P.a) * 0.22; bill(m, hx, 1.35, hz, 0.28, 0.28, TL('spark'), [0.6, 0.45, 0.2], 1); }
  if (tb && tb.st !== 'away' && tb.st !== 'out') { var ey = RIGS.tb.eyeY; bill(m, tb.x + Math.sin(tb.a) * 0.18 - Math.cos(tb.a) * 0.07, ey - 0.05, tb.z + Math.cos(tb.a) * 0.18 + Math.sin(tb.a) * 0.07, 0.05, 0.05, TL('halo'), [0.6, 0.05, 0.03], 1); } // his one eye glints in the dark
  if (G.mode === 'end') { var dz = 3 * TSZ + 0.03, dx = tx(20); m.quad([dx - 0.65, 0, dz], [dx + 0.65, 0, dz], [dx + 0.65, 2.2, dz], [dx - 0.65, 2.2, dz], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), [0.5, 0.48, 0.42], [0, 0, 1], 1); bill(m, dx, 1.1, dz + 0.2, 1.6, 1.6, TL('halo'), [0.5, 0.45, 0.4], 1); }
  R3.draw(m, ATT, { add: 1, soft: 1, lit: false });
}
function drawTB(tb, T, rigN, alpha) {
  var Q = pose0(), rig = RIGS[rigN];
  if (tb.st === 'out') poseSlump(Q, KIT.t);
  else if (tb.st === 'pills') { Q.sh[0] = [2.3, 0.1, 0.5]; Q.el[0] = 1.9; Q.hp = -0.35; }
  else if (tb.st === 'grab') { poseGrab(Q, 1); }
  else if (tb.st === 'door') { Q.sh[0] = [0.9 + Math.sin(KIT.t * 6) * 0.3, 1.1, 0]; Q.sh[1] = [0.5, 1.2, 0]; Q.el[0] = 0.8 + Math.sin(KIT.t * 6) * 0.3; Q.hr = 0.2; }
  else if (tb.st === 'ghost') { Q.sh[0] = [0.2, 0.5, 0]; Q.sh[1] = [0.2, 0.5, 0]; Q.hr = 0.35; }
  else { poseWalk(Q, tb.ph, Math.min(1, tb.spd / 2.4), tb.st === 'chase'); Q.hr = 0.22 + Math.sin(tb.ph * 0.5) * 0.08; if (tb.st === 'chase') { Q.sh[1] = [1.1 + Math.sin(tb.ph) * 0.2, 0.15, -0.2]; Q.el[1] = 0.3; } if (tb.flinch > 0) poseHurt(Q, 1); }
  drawRig(rig, tb.x, 0, tb.z, tb.a, Q, { heldL: rig.P.bottle, alpha: alpha, tint: T.tint });
}
function drawPlayer(T) {
  var P = G.P, Q = pose0(), W = WEAP[P.weap];
  if (P.crouch) poseCrouch(Q, P.ph, Math.min(1, P.spd)); else poseWalk(Q, P.ph, Math.min(1, P.spd / 2.6), P.run);
  if (W.gun && (P.aim || P.atkT >= 0)) poseAim(Q, P.weap, P.kick); else if (W.gun) { Q.sh[1] = [0.35, 0.1, 0]; Q.el[1] = 0.9; }
  if (W.melee && P.atkT >= 0) { if (P.weap === 'fists') posePunch(Q, P.atkT); else poseSwing(Q, P.atkT); }
  else if (W.melee && P.weap !== 'fists') { Q.sh[1] = [0.25, 0.12, 0]; Q.el[1] = 0.7; }
  if (P.hurtT > 0) poseHurt(Q, P.hurtT * 2.5);
  var held = P.weap === 'fists' ? null : RIGS.weap[P.weap];
  drawRig(RIGS.cumhead, P.x, 0, P.z, P.a, Q, { held: held, heldP: W.gun ? -Math.PI / 2 : -Math.PI / 2 - 0.2, flash: P.hurtT > 0.2 ? [0.4, 0.05, 0.05] : null, tint: T.tint });
}
/* ---------- the HUD ---------- */
var HUDV = null;
function vignette() { var W = KIT.W, H = KIT.H; return KIT.layer('vig' + W + 'x' + H, W, H, function () { var g = KIT.ctx, gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.78)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }); }
function drawHud() {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H, P = G.P, t = KIT.t, L = G.trip;
  KIT.blit(vignette(), 0, 0);
  if (G.mode === 'end') { if (G.endSaid && G.sub) { var bl0 = KIT.wrap(G.sub.s, W - 40, 30, 'title'); bl0.forEach(function (s, n) { KIT.text(s, W / 2 + Math.sin(t * 30) * 1.5, H * 0.24 + n * 32, { align: 'center', font: 'title', size: 30, col: '#ff2630', outline: 1 }); }); KIT.text('TB', W / 2, H * 0.24 - 14, { align: 'center', size: 8, col: '#a6968f' }); }
    if (G.banner && G.banner.t > 0) KIT.text(G.banner.s, W / 2, H * 0.62, { align: 'center', font: 'title', size: 26, col: '#c4121c', alpha: Math.min(1, G.banner.t), outline: 1 }); if (G.wake > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, G.wake / 2) + ')'; ctx.fillRect(0, 0, W, H); } return; }
  if (L > 0.5) { ctx.save(); ctx.globalAlpha = Math.min(0.5, L * 0.07); for (var i = 0; i < 5; i++) { ctx.strokeStyle = ['#ff4a8a', '#ffe36a', '#4adfff', '#7aff6a', '#c04aff'][(i + Math.floor(t * 2)) % 5]; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(W / 2, H / 2, W * (0.56 + i * 0.03 + Math.sin(t + i) * 0.02), H * (0.62 + i * 0.04), Math.sin(t * 0.3) * 0.1, 0, 6.28); ctx.stroke(); } ctx.restore(); }
  if (P.hurtT > 0 || P.hp < 25) { ctx.fillStyle = 'rgba(160,0,10,' + Math.max(P.hurtT * 0.9, P.hp < 25 ? 0.12 + Math.sin(t * 6) * 0.06 : 0) + ')'; ctx.fillRect(0, 0, W, H); }
  if (P.hide) { ctx.fillStyle = '#050304'; for (var y = 0; y < H; y += 24) { ctx.fillRect(0, y, W, 12); } ctx.fillRect(0, 0, W * 0.14, H); ctx.fillRect(W * 0.86, 0, W * 0.14, H); KIT.text('HIDING', W / 2, H - 28, { align: 'center', col: '#a6968f' }); KIT.text('A  CLIMB OUT', W / 2, H - 16, { align: 'center', col: '#f1e7d0', size: 8 }); }
  /* condition: an ECG line, green, yellow, red */
  var k = P.hp / maxHp(), col = k > 0.6 ? '#4adf6a' : k > 0.3 ? '#ffe36a' : '#ff2630', word = k > 0.6 ? 'FINE' : k > 0.3 ? 'CAUTION' : 'DANGER';
  KIT.panel(8, 8, 112, 40); ctx.save(); ctx.beginPath(); ctx.rect(14, 14, 100, 22); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); var rate = k > 0.6 ? 1.2 : k > 0.3 ? 1.8 : 2.6;
  for (var x = 0; x <= 100; x += 2) { var ph = ((x / 100) * 2 - t * rate) % 1, u = ph < 0 ? ph + 1 : ph, yv = u > 0.42 && u < 0.46 ? -8 : u > 0.46 && u < 0.5 ? 7 : u > 0.5 && u < 0.53 ? -3 : 0; if (x === 0) ctx.moveTo(14 + x, 26 + yv); else ctx.lineTo(14 + x, 26 + yv); } ctx.stroke(); ctx.restore();
  KIT.text(word, 16, 36, { col: col, size: 8 }); KIT.text(Math.ceil(P.hp) + '', 112, 36, { col: '#a6968f', size: 8, align: 'right' });
  if (P.st < 99) KIT.bar(14, 45, 100, 2, P.st / 100, P.stLock ? '#6a3a3a' : '#c8c0a0');
  /* the trip */
  var tl = Math.floor(L + 1e-6), TY = 32; KIT.panel(W - 120, TY, 112, 30); for (var p = 0; p < TRIPMAX; p++) { var f = Math.max(0, Math.min(1, L - p)); ctx.fillStyle = '#2a0a12'; ctx.fillRect(W - 112 + p * 16, TY + 6, 12, 7); if (f > 0) { ctx.fillStyle = ['#ff4a8a', '#ffe36a', '#4adfff', '#7aff6a', '#c04aff', '#ff7a2a'][p]; ctx.fillRect(W - 112 + p * 16, TY + 6, 12 * f, 7); } }
  KIT.text(TRIPNAME[Math.min(TRIPMAX, tl)], W - 64, TY + 17, { align: 'center', size: 8, col: L > 3 ? ['#ff4a8a', '#ffe36a', '#4adfff'][Math.floor(t * 4) % 3] : '#a6968f' });
  /* weapon, ammo, food */
  var Wp = WEAP[P.weap], wx = Math.round(W / 2 - 60), wy = H - 40; KIT.panel(wx, wy, 120, 34); var ic = ICONS[P.weap]; if (ic) ctx.drawImage(ic, wx + 3, wy - 2, 38, 38);
  KIT.text(Wp.short || 'FISTS', wx + 44, wy + 7, { size: 8, col: '#f1e7d0', max: 70 }); KIT.text(Wp.gun ? P.ammo[Wp.ammo] + ' ' + AMMO[Wp.ammo].n : 'MELEE', wx + 44, wy + 20, { size: 8, col: Wp.gun && !P.ammo[Wp.ammo] ? '#ff2630' : '#ffe36a', max: 70 });
  var items = [['cracker', 'i_cracker'], ['cuppa', 'i_cuppa'], ['pill', 'i_pill']];
  KIT.panel(8, 50, 112, 24); items.forEach(function (q, n) { drawTile(q[1], 11 + n * 36, 51, 20); KIT.text('' + P.inv[q[0]], 32 + n * 36, 59, { size: 8, col: P.inv[q[0]] ? '#f1e7d0' : '#4a3a3a' }); });
  if (P.keys[G.fi]) drawTile('i_key', 122, 50, 24);
  P.buffs.forEach(function (b, n) { KIT.text(BUFFS[b].n, 10, 78 + n * 9, { size: 6, col: '#ff4a8a' }); });
  /* crosshair */
  if (Wp.gun && !P.hide && G.mode === 'play') { var tg = aimTarget(P.aim ? 0.22 : 0.42), q = tg ? R3.project(tg.x, 1.3, tg.z) : null, cx = q ? q.x : W / 2 + (P.aim ? 0 : 0), cy = q ? q.y : H * 0.46;
    ctx.strokeStyle = tg ? '#ff2630' : 'rgba(241,231,208,0.6)'; ctx.lineWidth = 1.5; var s = P.aim ? 5 : 8; ctx.beginPath(); ctx.moveTo(cx - s - 4, cy); ctx.lineTo(cx - 3, cy); ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + s + 4, cy); ctx.moveTo(cx, cy - s - 4); ctx.lineTo(cx, cy - 3); ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + s + 4); ctx.stroke(); }
  /* who is watching you: an eye at the edge of the screen in their direction, filling up */
  var watchers = G.foes.filter(function (f) { return f.st !== 'dead' && f.st !== 'ko' && (f.sus > 0.05 || f.st === 'chase'); }).map(function (f) { return { o: f, s: f.st === 'chase' ? 1 : f.sus, tb: 0 }; });
  if (G.tb && G.tb.st !== 'away' && (G.tb.sus > 0.05 || G.tb.st === 'chase')) watchers.push({ o: G.tb, s: G.tb.st === 'chase' ? 1 : G.tb.sus, tb: 1 });
  watchers.forEach(function (w) { var a = angDiff(Math.atan2(w.o.x - P.x, w.o.z - P.z), P.ca), r = Math.min(W, H) * 0.36, ex = W / 2 - Math.sin(a) * r * 1.3, ey = H / 2 - Math.cos(a) * r; ex = Math.max(20, Math.min(W - 20, ex)); ey = Math.max(56, Math.min(H - 60, ey));
    drawEye(ex, ey, w.s, w.tb); });
  /* your stuff, while TB has it */
  if (G.stash) { var sa = angDiff(Math.atan2(G.stash.x - P.x, G.stash.z - P.z), P.ca), sd = Math.hypot(G.stash.x - P.x, G.stash.z - P.z); KIT.text('YOUR STUFF  ' + Math.round(sd) + 'M', W / 2, 10, { align: 'center', size: 8, col: '#ffe36a' });
    ctx.save(); ctx.translate(W / 2, 30); ctx.rotate(-sa); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, 4); ctx.lineTo(-6, 4); ctx.fill(); ctx.restore(); KIT.text("DON'T LET TB SEE YOU", W / 2, 40, { align: 'center', size: 6, col: '#c4121c' }); }
  /* prompt, messages, subtitles */
  if (G.prompt && !P.hide && G.mode === 'play') { var pt = promptText(G.prompt); if (pt) { var pw = KIT.tw('A  ' + pt, 8) + 16; KIT.panel(W / 2 - pw / 2, H - 66, pw, 20); KIT.text('A  ' + pt, W / 2, H - 60, { align: 'center', size: 8, col: '#f1e7d0' }); } }
  G.msgs.forEach(function (m, n) { KIT.text(m.s, W / 2, H - 82 - (G.msgs.length - 1 - n) * 11, { size: 8, col: m.col, alpha: Math.min(1, m.t), max: W - 40, align: 'center' }); });
  if (G.sub && G.mode !== 'end') { var lines = KIT.wrap(G.sub.s, W - 80, 14, 'body'); lines.forEach(function (s, n) { KIT.text((n ? '' : G.sub.who + ':  ') + s, W / 2, H * 0.52 + n * 15 - (lines.length - 1) * 15, { align: 'center', size: 14, font: 'body', col: G.sub.who === 'TB' ? '#ff2630' : '#f1e7d0', outline: 1, alpha: Math.min(1, G.sub.t * 2) }); }); }
  if (G.mode === 'end' && G.endSaid && G.sub) { var bl = KIT.wrap(G.sub.s, W - 40, 30, 'title'); bl.forEach(function (s, n) { KIT.text(s, W / 2 + Math.sin(t * 30) * 1.5, H * 0.24 + n * 32, { align: 'center', font: 'title', size: 30, col: '#ff2630', outline: 1 }); }); }
  if (G.banner && G.banner.t > 0) { var ba = Math.min(1, G.banner.t, (4 - G.banner.t) * 2); KIT.text(G.banner.s, W / 2, H * 0.3, { align: 'center', font: 'title', size: 30, col: '#c4121c', alpha: ba, outline: 1 }); }
  if (FL.cellLocked && G.mode === 'play' && !G.prompt) KIT.text('THE CELL DOOR IS LOCKED. FIND IT AND FORCE IT.', W / 2, H - 60, { align: 'center', size: 8, col: '#a6968f' });
  if (G.ev && G.ev.k === 'whisper' || G.ev && G.ev.k === 'reverse') { var e = G.ev, a2 = Math.min(1, e.t, e.len - e.t); KIT.text(e.s, W / 2 + Math.sin(t * 9) * 6, H * 0.4 + Math.cos(t * 7) * 4, { align: 'center', font: 'title', size: 26, col: ['#ff4a8a', '#c4121c', '#f1e7d0'][Math.floor(t * 10) % 3], alpha: a2 * 0.85, outline: 1 }); }
  if (G.ev && G.ev.k === 'fakeover') { var fa = Math.min(1, G.ev.t * 2); ctx.fillStyle = 'rgba(0,0,0,' + fa * 0.92 + ')'; ctx.fillRect(0, 0, W, H); KIT.text('GAME OVER', W / 2, H * 0.4, { align: 'center', font: 'title', size: 44, col: '#c4121c', alpha: fa }); KIT.text('TB GOT YOU FOR GOOD', W / 2, H * 0.4 + 46, { align: 'center', size: 8, col: '#a6968f', alpha: fa }); }
  if (G.wake > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, G.wake / 2) + ')'; ctx.fillRect(0, 0, W, H); }
}
function drawTile(n, x, y, s) { var T = ATL.slots[n]; if (!T) return; KIT.ctx.drawImage(ATL.canvas, T[0] * TA, T[1] * TA, T[2] * TA, T[3] * TA, x, y, s, s); }
function drawEye(x, y, s, tb) { var ctx = KIT.ctx, col = tb ? '#ff2630' : '#ffe36a'; ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(14,7,8,0.8)'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, 6.28); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, 6.28); ctx.stroke();
  ctx.beginPath(); ctx.rect(-12, 7 - 14 * Math.min(1, s), 24, 14 * Math.min(1, s)); ctx.clip(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, 6.28); ctx.fill(); ctx.restore(); if (s >= 1) KIT.text(tb ? 'TB' : '!', x, y + 10, { align: 'center', size: 6, col: col }); }
