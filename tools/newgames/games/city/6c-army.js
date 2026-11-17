/* ---------- update 159: five stars brings in the army (his ask). Army trucks drop off soldiers with rifles, an army
   helicopter takes over from the police one, and a tank rolls in and shells you. ---------- */
VT.armytruck = { n: 'Army Truck', cls: 'car', top: 34, acc: 8, grip: 6.5, len: 7.0, wid: 2.4, hgt: 3.0, col: ['#3e4a2c'], cost: 0, body: 'truck', heavy: 1, army: 1 };
VT.armyheli = { n: 'Army Choppa', cls: 'heli', top: 46, acc: 11, grip: 3, len: 9, wid: 2.4, hgt: 3, col: ['#3e4a2c'], cost: 0, body: 'heli', army: 1 };
VT.tank = { n: 'Load Tank', cls: 'car', top: 15, acc: 4, grip: 9, len: 6.6, wid: 3.2, hgt: 1.9, col: ['#4a5432'], cost: 0, body: 'tank', heavy: 1, army: 1, armour: 1 };
var SHELLM = null;
(function () { var vm = vmesh; vmesh = function (type, colI) {
  var t = VT[type]; if (t.body !== 'tank') return vm(type, colI); var key = type + ':' + colI; if (VMESH[key]) return VMESH[key];
  var c = t.col[0], D = '#12040a', dk = '#2e3620', m = M(), wh = M(), tu = M(), L = t.len / 2, Wd = t.wid / 2;
  // hull: a sloped glacis front and back, track guards, the tracks themselves
  boxC(m, -Wd + 0.55, 0.55, -L + 0.3, Wd - 0.55, 1.35, L - 0.5, c);
  m.quad([-Wd + 0.55, 1.35, L - 0.5], [Wd - 0.55, 1.35, L - 0.5], [Wd - 0.55, 0.7, L + 0.25], [-Wd + 0.55, 0.7, L + 0.25], UV1, TL('metal'), litc(c, [0, 0.7, 0.7]), [0, 0.7, 0.7]);
  m.quad([Wd - 0.55, 1.35, -L + 0.3], [-Wd + 0.55, 1.35, -L + 0.3], [-Wd + 0.55, 0.75, -L - 0.1], [Wd - 0.55, 0.75, -L - 0.1], UV1, TL('metal'), litc(c, [0, 0.6, -0.8]), [0, 0.6, -0.8]);
  [-1, 1].forEach(function (s) { var x0 = s > 0 ? Wd - 0.6 : -Wd, x1 = s > 0 ? Wd : -Wd + 0.6;
    boxC(m, x0, 0.12, -L + 0.2, x1, 0.95, L - 0.2, '#1c1c1a'); // the track
    boxC(m, x0 - 0.02, 0.95, -L, x1 + 0.02, 1.08, L + 0.1, dk); // the guard over it
    for (var k = 0; k < 6; k++) { var z = -L + 0.7 + k * (t.len - 1.4) / 5; tub(m, [x0 - 0.01, 0.45, z], [x1 + 0.01, 0.45, z], 0.34, 0.34, '#2a2a28', 8, { cap: 1, cap0: 1 }); }
    boxC(m, s * (Wd - 0.75) - 0.2, 1.36, -L + 0.5, s * (Wd - 0.75) + 0.2, 1.6, -L + 1.3, dk); });
  boxC(m, -0.5, 1.0, L + 0.1, -0.2, 1.15, L + 0.2, '#fff6d0', 0.8); boxC(m, 0.2, 1.0, L + 0.1, 0.5, 1.15, L + 0.2, '#fff6d0', 0.8);
  // the turret (its own mesh so it turns): a squat block, a hatch, the long gun
  boxC(tu, -1.05, 0, -1.3, 1.05, 0.75, 1.0, c); boxC(tu, -0.85, 0.75, -1.0, 0.85, 0.85, 0.7, dk); tub(tu, [0.4, 0.85, -0.4], [0.4, 1.0, -0.4], 0.3, 0.3, dk, 8, { cap: 1 });
  tub(tu, [0, 0.4, 1.0], [0, 0.4, 4.4], 0.13, 0.11, dk, 8, { cap: 1 }); tub(tu, [0, 0.4, 3.9], [0, 0.4, 4.5], 0.17, 0.17, D, 8, { cap: 1, cap0: 1 });
  boxC(tu, -1.1, 0.3, -1.35, -0.95, 0.6, 0.6, '#c4121c'); boxC(tu, 0.95, 0.3, -1.35, 1.1, 0.6, 0.6, '#c4121c');
  tub(wh, [-0.01, 0, 0], [0.01, 0, 0], 0.01, 0.01, D, 3);
  var sh = M(); sh.quad([-Wd * 1.1, 0.02, -L * 1.1], [-Wd * 1.1, 0.02, L * 1.1], [Wd * 1.1, 0.02, L * 1.1], [Wd * 1.1, 0.02, -L * 1.1], UV1, TL('shadow'), [0.5, 0.5, 0.5], [0, 1, 0]);
  VMESH[key] = { body: m.upload(), wheel: wh.upload(), wr: 0.45, sh: sh.upload(), tur: tu.upload(), lofted: 1 }; return VMESH[key]; }; })();
var CANVASM = null;
(function () { var dv = drawVeh; drawVeh = function (v) { dv(v);
  if (v.type === 'armytruck') { var t = v.t, L = t.len / 2, Wd = t.wid / 2; if (!CANVASM) { var q = M(); boxC(q, -Wd - 0.04, 0.93, -L - 0.04, Wd + 0.04, t.hgt + 0.06, L * 0.34 + 0.03, '#4a5432'); for (var k = 0; k < 4; k++) { var z = -L + 0.4 + k * (L * 1.34 - 0.8) / 3; boxC(q, -Wd - 0.06, 0.95, z - 0.05, Wd + 0.06, t.hgt + 0.08, z + 0.05, '#2e3620'); } boxC(q, -0.4, 1.4, -L - 0.06, 0.4, 2.0, -L - 0.05, '#c4121c'); CANVASM = q.upload(); }
    R3.draw(CANVASM, ATT, { m: MD(v.x, v.y, v.z, v.a, v.pitch, v.roll), tint: v.dead ? [0.25, 0.22, 0.22] : [0.82, 0.82, 0.82] }); return; }
  if (v.t.body !== 'tank') return; var VM = vmesh(v.type, v.col);
  R3.draw(VM.tur, ATT, { m: MM(MD(v.x, v.y, v.z, v.a, v.pitch, v.roll), MD(0, 1.35, -0.2, v.tur || 0, 0, 0)), tint: v.dead ? [0.25, 0.22, 0.22] : [0.82, 0.82, 0.82], flash: v.flash > 0 ? [0.6, 0.6, 0.6] : null });
  if (!SHELLM) { var q = M(); tub(q, [0, 0, -0.3], [0, 0, 0.3], 0.12, 0.08, '#ffe36a', 6, { cap: 1, cap0: 1 }); SHELLM = q.upload(); }
  (v.shells || []).forEach(function (s) { R3.draw(SHELLM, ATT, { m: MD(s.x, s.y, s.z, Math.atan2(s.vx, s.vz), 0, 0), lit: false }); }); }; })();
/* tanks shrug off bullets and knocks: only explosions really hurt them */
(function () { var hv = hurtVeh; hurtVeh = function (v, dmg, by, isBoom) { if (v.t.armour && dmg < 300) dmg *= isBoom ? 0.35 : 0.04; return hv(v, dmg, by, isBoom); }; })();
function soldierRig() {
  if (!RIGS.soldier && typeof person === 'function') {
    var helm = function (sk, fc) { return function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, sk, 12, 8, { face: fc, fz: 0.25, fw: 0.82, fh: 0.8 }); ell(hd, 0, 0.36, 0, 0.25, 0.15, 0.25, '#3e4a2c', 12, 5); ell(hd, 0, 0.3, 0, 0.27, 0.035, 0.27, '#2e3620', 12, 3); tub(hd, [-0.15, 0.24, 0.16], [0.15, 0.24, 0.16], 0.02, 0.02, '#2a1a14', 4); }; };
    RIGS.soldier = person({ skin: '#e8c0a0', shirt: '#4a5432', legs: '#3a4228', boot: '#2a1c12', hand: '#2a2a22', face: 'f_cop', headFn: helm('#e8c0a0', 'f_cop') });
    RIGS.soldier2 = person({ skin: '#8a5a3a', shirt: '#4a5432', legs: '#3a4228', boot: '#2a1c12', hand: '#2a2a22', face: 'f_cop2', headFn: helm('#8a5a3a', 'f_cop2') }); }
  return Math.random() < 0.6 ? RIGS.soldier || rigFor('cop') : RIGS.soldier2 || rigFor('cop'); }
function makeSoldier(x, z, v) { var p = makePed({ x: x, z: z, kind: 'cop', cop: 1, rig: soldierRig(), hp: 110, wpn: 'rifle' }); p.army = 1; p.state = 'fight'; p.keep = 1; return p; }
function spawnArmy(kind) { var r = spawnPoint(100, 170); if (!r) return; var pt = edgeAt(r.E, r.s, false, 0), v = makeVeh(kind, pt.x, pt.z, Math.atan2(P.x - pt.x, P.z - pt.z), { col: 0 }); v.ai = { cop: 1, army: 1 }; v.keep = 1; v.siren = 0;
  if (kind === 'tank') v.hp = 100; var dr = makePed({ x: v.x, z: v.z, kind: 'cop', cop: 1, rig: soldierRig(), hp: 110, wpn: 'rifle' }); dr.army = 1; dr.inVeh = v; v.driver = dr; return v; }
/* the army comes at five stars: trucks of soldiers, a tank, the army helicopter (the police keep coming too, but fewer) */
(function () { var sw = stepWanted; stepWanted = function (dt) {
  var five = SV.wanted >= 5 && !G.interior; G.armyT = (G.armyT || 0) + dt;
  if (five) { if (!G.army) { G.army = 1; toast('FIVE STARS: THE ARMY IS COMING', 4); sfx.play('alarm'); }
    var trucks = VEH.filter(function (v) { return v.type === 'armytruck' && !v.dead; }).length, tanks = VEH.filter(function (v) { return v.type === 'tank' && !v.dead; }).length;
    if (trucks < 2 && Math.random() < dt * 0.25) spawnArmy('armytruck');
    if (tanks < 1 && G.armyT > 12 && Math.random() < dt * 0.08) spawnArmy('tank');
    var heli = VEH.filter(function (v) { return v.ai && v.ai.copHeli && !v.dead; });
    if (heli.length && heli[0].type !== 'armyheli' && Math.hypot(heli[0].x - P.x, heli[0].z - P.z) > 120) { heli[0].dead = 1; var i = VEH.indexOf(heli[0]); if (i >= 0) VEH.splice(i, 1); } }
  else { G.army = 0; G.armyT = 0; }
  sw(dt); stepTanks(dt); }; })();
(function () { var sc = spawnCop; spawnCop = function () { if (SV.wanted >= 5 && Math.random() < 0.5) return; return sc(); }; })();
(function () { var sh = spawnCopHeli; spawnCopHeli = function () { if (SV.wanted < 5) return sh();
  var a = Math.random() * 6.28, v = makeVeh('armyheli', P.x + Math.sin(a) * 150, P.z + Math.cos(a) * 150, 0, { col: 0 }); v.y = groundY(v.x, v.z) + 60; v.ground = 0; v.ai = { cop: 1, copHeli: 1, army: 1 }; v.keep = 1;
  var dr = makePed({ x: v.x, z: v.z, kind: 'cop', cop: 1, rig: soldierRig(), hp: 110, wpn: 'rifle' }); dr.inVeh = v; v.driver = dr; }; })();
/* a truck that has pulled up lets its soldiers out the back; when the stars go the army goes home */
(function () { var cd = copDrive; copDrive = function (v, dt) {
  if (v.type === 'tank' && SV.wanted >= 5) { tankDrive(v, dt); return; }
  cd(v, dt);
  if (v.type === 'armytruck' && v.ai.parked && !v.ai.unloaded) { v.ai.unloaded = 1; var bx = v.x - Math.sin(v.a) * 4.2, bz = v.z - Math.cos(v.a) * 4.2;
    for (var k = 0; k < 4; k++) makeSoldier(bx + Math.cos(v.a) * (k - 1.5) * 1.1, bz - Math.sin(v.a) * (k - 1.5) * 1.1, v); sfx.play('door'); } }; })();
function tankDrive(v, dt) {
  var me = P.state === 'car' && P.veh ? P.veh : P, dx = me.x - v.x, dz = me.z - v.z, d = Math.hypot(dx, dz), sees = copSees(v.x, v.y + 1, v.z, 130);
  if (!v.driver) { stepVehicle(v, { thr: 0, brk: 1, steer: 0 }, dt); return; }
  var tg = sees || !G.lastSeen ? me : G.lastSeen, ta = Math.atan2(tg.x - v.x, tg.z - v.z), steer = clamp(angDiff(v.a, ta) * 1.5, -1, 1);
  if (v.sp < 0.6 && (v.ai.stuck = (v.ai.stuck || 0) + dt) > 3) { v.ai.rev = 1.5; v.ai.stuck = 0; } if (v.ai.rev > 0) { v.ai.rev -= dt; stepVehicle(v, { thr: 0, brk: 1, steer: -steer }, dt); }
  else stepVehicle(v, { thr: d > 22 ? 1 : 0, brk: d < 16 ? 1 : 0, steer: steer }, dt);
  // the turret turns towards you on its own, slowly; it fires once it is pointing at you
  var want = angDiff(v.a, Math.atan2(dx, dz)), cur = v.tur || 0, dd = clamp(want - cur, -dt * 0.9, dt * 0.9); v.tur = cur + dd;
  v.fireT = (v.fireT === undefined ? 3 : v.fireT) - dt;
  if (sees && d < 140 && d > 9 && Math.abs(want - v.tur) < 0.08 && v.fireT <= 0) { v.fireT = 4.5; var a = v.a + v.tur, sp = 46, hy = v.y + 1.75, ty = (me.y || groundY(me.x, me.z)) + 0.8, tt = d / sp;
    v.shells = v.shells || []; v.shells.push({ x: v.x + Math.sin(a) * 4.6, y: hy, z: v.z + Math.cos(a) * 4.6, vx: Math.sin(a) * sp, vy: (ty - hy) / tt + 3 * tt, vz: Math.cos(a) * sp, t: 0 });
    sfx.play('boom'); CAM.shake = Math.max(CAM.shake, d < 60 ? 0.3 : 0.1); for (var k = 0; k < 6; k++) addFx({ k: 'smoke', x: v.x + Math.sin(a) * 4.7, y: hy, z: v.z + Math.cos(a) * 4.7, vx: Math.sin(a) * 3 + rnd(-1, 1), vy: rnd(0.5, 2), vz: Math.cos(a) * 3 + rnd(-1, 1), life: 1.4 }); }
}
function stepTanks(dt) {
  VEH.forEach(function (v) { if (!v.shells || !v.shells.length) return;
    v.shells = v.shells.filter(function (s) { s.t += dt; s.vy -= 6 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
      var me = P.state === 'car' && P.veh ? P.veh : P, hitMe = Math.hypot(me.x - s.x, me.z - s.z) < 2.6 && Math.abs((me.y || 0) + 1 - s.y) < 3;
      if (s.t > 5 || hitMe || s.y < groundY(s.x, s.z) || collide(s.x, s.z, 0.2, s.y, 0.4).hit) { boom(s.x, Math.max(s.y, groundY(s.x, s.z)), s.z, 8, v.driver || null); return false; } return true; }); });
}
