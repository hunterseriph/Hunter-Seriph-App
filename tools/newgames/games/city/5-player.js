/* ---------- Cumhead on foot: walking, running, jumping, swimming, the weapons, the camera ---------- */
var WPN = {
  fists: { n: 'Fists', melee: 1, dmg: 8, rate: 0.38, range: 1.5 },
  knife: { n: 'Knife', melee: 1, dmg: 22, rate: 0.35, range: 1.6, mesh: 'knifeM', cost: 150 },
  bat: { n: 'Baseball Bat', melee: 1, dmg: 26, rate: 0.6, range: 2.0, mesh: 'batM', cost: 200, swing: 1 },
  sausage: { n: "Amy's Sausage", melee: 1, dmg: 34, rate: 0.55, range: 2.2, mesh: 'sausageM', swing: 1, cost: 0 },
  pistol: { n: 'Cream Pistol', dmg: 24, rate: 0.28, range: 70, ammo: 'pistol', clip: 12, mesh: 'pistolM', cost: 800, ammoCost: 60, ammoN: 36, one: 1 },
  smg: { n: 'Load Spitter', dmg: 14, rate: 0.08, range: 55, ammo: 'smg', clip: 30, mesh: 'smgM', cost: 2500, ammoCost: 120, ammoN: 90, auto: 1 },
  shotgun: { n: 'Pie Shotgun', dmg: 12, pellets: 7, spread: 0.14, rate: 0.85, range: 32, ammo: 'shells', clip: 6, mesh: 'shotgunM', cost: 3500, ammoCost: 100, ammoN: 18 },
  rifle: { n: 'Load Rifle', dmg: 32, rate: 0.13, range: 110, ammo: 'rifle', clip: 30, mesh: 'rifleM', cost: 6000, ammoCost: 180, ammoN: 90, auto: 1 },
  rocket: { n: 'Meatnado Launcher', dmg: 200, rate: 1.4, range: 160, ammo: 'rocket', clip: 1, mesh: 'rocketM', cost: 25000, ammoCost: 1500, ammoN: 4, rocket: 1 },
  bag: { n: 'Flaming Bag of Shit', dmg: 60, rate: 0.9, range: 30, ammo: 'bag', clip: 1, mesh: 'bagM', cost: 300, ammoCost: 300, ammoN: 5, thrown: 1 },
  pills: { n: "TB's Silly Pills", dmg: 0, rate: 0.9, range: 26, ammo: 'pills', clip: 1, cost: 250, ammoCost: 250, ammoN: 5, thrown: 1, trip: 1 }
};
var WORDER = ['fists', 'knife', 'bat', 'sausage', 'pistol', 'smg', 'shotgun', 'rifle', 'rocket', 'bag', 'pills'];
var P = null, CAM = { yaw: 0, pit: -0.18, dist: 4.4, x: 0, y: 0, z: 0, free: 0, shake: 0 };
function newPlayer(x, z, a) { P = { x: x, z: z, y: groundY(x, z), a: a || 0, vx: 0, vz: 0, vy: 0, ph: 0, sp: 0, hp: SV.maxHp || 100, armour: SV.armour || 0, wpn: SV.wpn || 'fists', cool: 0, atkT: 0, veh: null, seat: 0, state: 'foot', jump: 0, ground: 1, swim: 0, hurtT: 0, aim: 0, target: null, kick: 0, enterT: 0, lastHit: 0, fall: 0, ragT: 0 }; CAM.yaw = P.a; return P; }
function hasW(w) { return w === 'fists' || (SV.weapons && SV.weapons[w]); }
function ammoOf(w) { var W0 = WPN[w]; if (!W0.ammo) return Infinity; return (SV.ammo && SV.ammo[W0.ammo]) || 0; }
function nextWeapon(d) { var i = WORDER.indexOf(P.wpn); for (var k = 0; k < WORDER.length; k++) { i = (i + (d || 1) + WORDER.length) % WORDER.length; var w = WORDER[i]; if (hasW(w) && (ammoOf(w) > 0 || WPN[w].melee)) { P.wpn = w; SV.wpn = w; sfx.play('select'); return; } } }
/* the stick, turned by the camera */
function moveInput() { var s = KIT.stick(0), c = Math.cos(CAM.yaw), sn = Math.sin(CAM.yaw); return { x: s.x * -c + -s.y * sn, z: s.x * sn + -s.y * c, m: Math.min(1, Math.hypot(s.x, s.y)), raw: s }; }
function stepFoot(dt) {
  var mi = moveInput(), run = KIT.held('b') || KIT.held('run'), swim = P.swim, top = swim ? 2.6 : run ? 7.2 : 3.2, drunk = G.drunk || 0;
  if (drunk > 0.2) { mi.x += Math.sin(G.t * 1.7) * drunk * 0.6; mi.z += Math.cos(G.t * 1.3) * drunk * 0.6; }
  if (P.ragT > 0) { P.ragT -= dt; mi.m = 0; }
  if (G.cut || G.talk) mi.m = 0;
  var tx = mi.m > 0.15 ? mi.x * top * mi.m : 0, tz = mi.m > 0.15 ? mi.z * top * mi.m : 0, k = P.ground || swim ? 10 : 2.5;
  P.vx += (tx - P.vx) * Math.min(1, k * dt); P.vz += (tz - P.vz) * Math.min(1, k * dt);
  P.sp = Math.hypot(P.vx, P.vz);
  if (P.aim && P.target) P.a = Math.atan2(P.target.x - P.x, P.target.z - P.z); else if (P.aim) P.a = CAM.yaw; else if (P.sp > 0.4) P.a += angDiff(P.a, Math.atan2(P.vx, P.vz)) * Math.min(1, dt * 12);
  // gravity, jumping, falling, water
  var g = standY(P.x, P.z, P.y), wy = waterY(P.x, P.z);
  if (KIT.pressed('a') && P.ground && !swim && !G.cut) { P.vy = 6.2; P.ground = 0; sfx.play('jump'); }
  P.vy -= 18 * dt; P.y += P.vy * dt;
  if (wy > -50 && P.y < wy - 0.9 && g < wy - 1.2) { P.swim = 1; P.y = wy - 0.9; P.vy = 0; P.ground = 0; } else P.swim = 0;
  if (!P.swim && P.y <= g) { if (P.vy < -14) hurtPlayer((-P.vy - 14) * 6, 'fall'); P.y = g; P.vy = 0; P.ground = 1; } else if (!P.swim && P.y > g + 0.05) P.ground = 0;
  // move and collide
  var nx = P.x + P.vx * dt, nz = P.z + P.vz * dt, c = collide(nx, nz, 0.35, P.y, 1.7); nx += c.x; nz += c.z;
  // step up small things (kerbs, stairs): the ground ahead may be at most 0.6 m up
  var gn = standY(nx, nz, P.y + 0.6); if (gn > P.y + 0.65 && P.ground) { nx = P.x; nz = P.z; }
  P.x = clamp(nx, 2, WX - 2); P.z = clamp(nz, 2, WZ - 2);
  vehPush(P, 0.4);
  // pose phase
  P.ph += dt * (P.sp * (run ? 1.6 : 2.4)) ;
  // the weapon
  stepWeapon(dt, mi);
  if (KIT.pressed('rb')) nextWeapon(1);
  // use: a vehicle, a door, a person to talk to
  if (KIT.pressed('y') && !G.cut && !G.talk) { if (!useNear()) enterNearest(); }
}
function useNear() { // doors and people with something to say come before vehicles
  var u = nearestUse(); if (!u) return false; u.fn(); return true;
}
function nearestUse() { var best = null, bd = 9; ((G.interior ? G.indoorUses : G.uses) || []).forEach(function (u) { var d = dist2(P.x, P.z, u.x, u.z); if (d < (u.r || 2.2) * (u.r || 2.2) && d < bd) { bd = d; best = u; } }); return best; }
/* ---------- weapons ---------- */
function stepWeapon(dt, mi) {
  P.cool -= dt; P.atkT = Math.max(0, P.atkT - dt); P.kick = Math.max(0, P.kick - dt * 6);
  var W0 = WPN[P.wpn]; P.aim = KIT.held('lb') && !W0.melee ? 1 : 0;
  if (P.aim) { if (!P.target || P.target.dead || dist2(P.x, P.z, P.target.x, P.target.z) > W0.range * W0.range) P.target = findTarget(W0.range); } else P.target = null;
  var fire = W0.auto ? KIT.held('x') : KIT.pressed('x');
  if (fire && P.cool <= 0 && !G.cut && !G.talk && !P.swim) {
    if (W0.melee) { P.cool = W0.rate; P.atkT = 0.35; meleeHit(W0); }
    else if (ammoOf(P.wpn) <= 0) { sfx.play('back'); P.cool = 0.4; nextWeapon(1); }
    else { P.cool = W0.rate; SV.ammo[W0.ammo]--; P.kick = 1; shoot(P, W0); }
  }
}
function findTarget(range) { // the nearest thing worth shooting in front of the camera
  var best = null, bs = -1, f = [Math.sin(CAM.yaw), Math.cos(CAM.yaw)];
  PEDS.forEach(function (p) { if (p.dead || p === P) return; var dx = p.x - P.x, dz = p.z - P.z, d = Math.hypot(dx, dz); if (d > range || d < 0.5) return; var dot = (dx * f[0] + dz * f[1]) / d; if (dot < 0.6) return; var s = dot * 2 - d / range + (p.hostile ? 0.6 : 0) + (p.cop ? 0.3 : 0); if (s > bs) { bs = s; best = p; } });
  return best;
}
function muzzle(o) { var a = o.a, x = o.x + Math.sin(a) * 0.6 - Math.cos(a) * 0.2, z = o.z + Math.cos(a) * 0.6 + Math.sin(a) * 0.2; return [x, o.y + 1.35, z]; }
function shoot(who, W0) {
  var m = muzzle(who), dir;
  if (who === P) { if (P.target) { var t = P.target, ty = (t.y || 0) + 1.2; dir = [t.x - m[0], ty - m[1], t.z - m[2]]; } else { var fw = R3.cam.fwd; dir = [fw[0], fw[1] + 0.03, fw[2]]; } }
  else { var tg = who.tgt || P, tty = (tg.y || 0) + 1.1; dir = [tg.x - m[0], tty - m[1], tg.z - m[2]]; }
  var l = Math.hypot(dir[0], dir[1], dir[2]) || 1; dir = [dir[0] / l, dir[1] / l, dir[2] / l];
  makeNoise(who.x, who.z, 60, who);
  G.dynLights = G.dynLights || []; G.dynLights.push({ x: m[0], y: m[1], z: m[2], r: 7, c: [1, 0.8, 0.4], k: 1.4, life: 0.06 });
  if (W0.rocket) { addFx({ k: 'rocket', x: m[0], y: m[1], z: m[2], vx: dir[0] * 45, vy: dir[1] * 45, vz: dir[2] * 45, life: 4, by: who }); sfx.play('boom'); return; }
  if (W0.thrown) { addFx({ k: W0.trip ? 'pill' : 'bagf', x: m[0], y: m[1], z: m[2], vx: dir[0] * 16, vy: dir[1] * 16 + 5, vz: dir[2] * 16, life: 3, by: who }); sfx.play('jump'); return; }
  sfx.play(W0.pellets ? 'boom' : 'hit');
  for (var p = 0; p < (W0.pellets || 1); p++) {
    var sp = (W0.spread || 0.02) + (who !== P ? 0.05 : 0) + (G.drunk || 0) * 0.08, d = [dir[0] + (Math.random() - 0.5) * sp, dir[1] + (Math.random() - 0.5) * sp, dir[2] + (Math.random() - 0.5) * sp];
    var R = W0.range, e = [m[0] + d[0] * R, m[1] + d[1] * R, m[2] + d[2] * R], wt = rayBlock(m[0], m[1], m[2], e[0], e[1], e[2]), hit = rayHit(m, d, R * wt, who);
    var endT = hit ? hit.t : R * wt; addFx({ k: 'tracer', x: m[0], y: m[1], z: m[2], ex: m[0] + d[0] * endT, ey: m[1] + d[1] * endT, ez: m[2] + d[2] * endT, life: 0.06 });
    if (hit) { if (hit.ped) hurtPed(hit.ped, W0.dmg, who, d); else if (hit.veh) hurtVeh(hit.veh, W0.dmg * 0.6, who); else if (hit.player) hurtPlayer(W0.dmg * 0.55, who); }
    else if (wt < 1) addFx({ k: 'spark', x: m[0] + d[0] * endT, y: m[1] + d[1] * endT, z: m[2] + d[2] * endT, life: 0.25 });
  }
}
function rayHit(o, d, maxT, who) { // the first person, car or the player along a ray
  var best = null, bt = maxT;
  function cyl(x, y0, z, r, h) { var ox = o[0] - x, oz = o[2] - z, a = d[0] * d[0] + d[2] * d[2], b = 2 * (ox * d[0] + oz * d[2]), c = ox * ox + oz * oz - r * r, disc = b * b - 4 * a * c; if (disc < 0 || a < 1e-6) return -1; var t = (-b - Math.sqrt(disc)) / (2 * a); if (t < 0) return -1; var y = o[1] + d[1] * t; return y >= y0 && y <= y0 + h ? t : -1; }
  PEDS.forEach(function (p) { if (p.dead || p === who || p.inVeh) return; var t = cyl(p.x, p.y, p.z, 0.4, 1.9); if (t > 0 && t < bt) { bt = t; best = { ped: p, t: t }; } });
  VEH.forEach(function (v) { if (v === who.veh) return; var t = cyl(v.x, v.y, v.z, Math.max(v.t.wid, v.t.len * 0.55) / 1.6, v.t.hgt + 0.3); if (t > 0 && t < bt) { bt = t; best = { veh: v, t: t }; } });
  if (who !== P && P.state === 'foot') { var t2 = cyl(P.x, P.y, P.z, 0.4, 1.9); if (t2 > 0 && t2 < bt) { bt = t2; best = { player: 1, t: t2 }; } }
  if (who !== P && P.state === 'car' && P.veh) { var v2 = P.veh, t3 = cyl(v2.x, v2.y, v2.z, Math.max(v2.t.wid, v2.t.len * 0.55) / 1.6, v2.t.hgt + 0.3); if (t3 > 0 && t3 < bt) { bt = t3; best = { veh: v2, t: t3 }; } }
  return best;
}
function meleeHit(W0) {
  sfx.play('swing'); var hit = false;
  PEDS.forEach(function (p) { if (p.dead || p.inVeh) return; var dx = p.x - P.x, dz = p.z - P.z, d = Math.hypot(dx, dz); if (d > W0.range + 0.3) return; var dot = (dx * Math.sin(P.a) + dz * Math.cos(P.a)) / (d || 1); if (dot < 0.3 && d > 0.8) return; hurtPed(p, W0.dmg * (1 + (SV.str || 0) * 0.1), P, [dx / (d || 1), 0.2, dz / (d || 1)]); hit = true; });
  VEH.forEach(function (v) { if (v.dead || v === P.veh) return; if (Math.hypot(v.x - P.x, v.z - P.z) < W0.range + v.t.len * 0.4) { hurtVeh(v, W0.dmg * 0.15, P); hit = true; } });
  if (hit) { sfx.play('hit'); KIT.shake && KIT.shake(2); }
}
function hurtPlayer(dmg, by) {
  if (G.god || P.state === 'dead' || G.cut) return; if (P.armour > 0) { var a = Math.min(P.armour, dmg * 0.7); P.armour -= a; dmg -= a; }
  P.hp -= dmg; P.hurtT = 0.4; CAM.shake = Math.max(CAM.shake, 0.3); if (dmg > 2) sfx.play('hurt');
  if (P.hp <= 0) { P.hp = 0; wasted(); }
}
/* ---------- the camera ---------- */
function stepCamera(dt) {
  if (G.cut && G.mode === 'play') return;
  var r = KIT.stick(1), tgt, dist, hgt, look = 0;
  if (r.on) { CAM.yaw -= r.x * dt * 2.4; CAM.pit = clamp(CAM.pit - r.y * dt * 1.6, -1.1, 0.6); CAM.free = 1.6; }
  else CAM.free = Math.max(0, CAM.free - dt);
  if (P.state === 'car' && P.veh) { var v = P.veh, cl = v.t.cls, air = cl === 'heli' || cl === 'plane';
    dist = air ? v.t.len * 1.6 + 7 : Math.max(5.5, v.t.len * 1.35 + 2.4); hgt = air ? 3.4 : v.t.hgt + 1.3; tgt = [v.x, v.y + v.t.hgt * 0.7, v.z];
    var behind = v.a + (G.lookBack ? Math.PI : 0); if (CAM.free <= 0) { var sp = Math.hypot(v.vx || 0, v.vz || 0), k = clamp(sp / 8, 0.3, 3); CAM.yaw += angDiff(CAM.yaw, behind) * Math.min(1, dt * k); CAM.pit += (-0.16 - CAM.pit) * Math.min(1, dt * 2); }
  } else { dist = P.aim ? 2.6 : G.interior ? 3.0 : 4.4; hgt = P.aim ? 1.65 : G.interior ? 2.6 : 1.9; if (G.interior && CAM.free <= 0) CAM.pit += (-0.42 - CAM.pit) * Math.min(1, dt * 3); tgt = [P.x, P.y + (P.aim ? 1.55 : 1.45), P.z]; look = P.aim ? 0.55 : 0;
    if (CAM.free <= 0 && P.sp > 2 && !P.aim) CAM.yaw += angDiff(CAM.yaw, P.a) * Math.min(1, dt * 1.2); }
  var cy = Math.cos(CAM.yaw), sy = Math.sin(CAM.yaw), cp = Math.cos(CAM.pit), sp2 = Math.sin(CAM.pit);
  var ox = tgt[0] - sy * cp * dist + cy * look, oz = tgt[2] - cy * cp * dist - sy * look, oy = tgt[1] - sp2 * dist + (hgt - 1.45) * 0.5;
  // keep out of walls
  var t = rayBlock(tgt[0], tgt[1], tgt[2], ox, oy, oz); if (t < 1) { t = Math.max(0.12, t - 0.06); ox = tgt[0] + (ox - tgt[0]) * t; oy = tgt[1] + (oy - tgt[1]) * t; oz = tgt[2] + (oz - tgt[2]) * t; }
  var gy = groundY(ox, oz) + 0.4; if (oy < gy) oy = gy; var wy = waterY(ox, oz); if (wy > -50 && oy < wy + 0.4) oy = wy + 0.4;
  var s = CAM.snap ? 1 : Math.min(1, dt * 14); CAM.snap = 0; CAM.x += (ox - CAM.x) * s; CAM.y += (oy - CAM.y) * s; CAM.z += (oz - CAM.z) * s;
  if (Math.hypot(CAM.x - ox, CAM.z - oz) > 30) { CAM.x = ox; CAM.y = oy; CAM.z = oz; }
  CAM.shake = Math.max(0, CAM.shake - dt); var sh = CAM.shake * 0.25;
  CAM.at = [tgt[0] + sy * look * 0 + (Math.random() - 0.5) * sh, tgt[1] + (Math.random() - 0.5) * sh, tgt[2] + (Math.random() - 0.5) * sh];
  if (P.aim) { var fx = Math.sin(CAM.yaw) * Math.cos(CAM.pit), fz = Math.cos(CAM.yaw) * Math.cos(CAM.pit); CAM.at = [CAM.x + fx * 10, CAM.y + Math.sin(CAM.pit) * 10 + 0.4, CAM.z + fz * 10]; }
}
function poseOfPlayer() {
  var Q = pose0();
  if (P.state === 'dead') { poseDown(Q, 1, 1); return Q; }
  if (P.swim) { Q.bp = 1.2; Q.bodyY = -0.6; Q.sh[0] = [2.6 + Math.sin(P.ph * 2) * 0.8, 0.3, 0]; Q.sh[1] = [2.6 - Math.sin(P.ph * 2) * 0.8, 0.3, 0]; Q.hip[0] = Math.sin(P.ph * 3) * 0.4; Q.hip[1] = -Q.hip[0]; return Q; }
  var run = P.sp > 4.2; if (P.sp > 0.3) poseWalk(Q, P.ph, Math.min(1, P.sp / 3), run);
  if (!P.ground) { Q.kn[0] = Q.kn[1] = 0.9; Q.hip[0] = 0.7; Q.hip[1] = 0.2; Q.sh[0] = [0.4, 0.8, 0]; Q.sh[1] = [0.4, 0.8, 0]; }
  var W0 = WPN[P.wpn];
  if (P.aim || (P.cool > 0 && !W0.melee && P.atkT === 0 && P.kick > 0)) poseAim(Q, W0.mesh === 'pistolM' ? 'handgun' : 'rifle', P.kick);
  if (P.atkT > 0) { var t = 1 - P.atkT / 0.35; if (W0.swing) poseSwing(Q, t); else posePunch(Q, t); }
  if (P.hurtT > 0) poseHurt(Q, P.hurtT / 0.4);
  if (P.ragT > 0) poseDown(Q, Math.min(1, P.ragT), 0);
  return Q;
}
function drawPlayer() {
  if (P.state === 'car' && P.veh && !P.veh.t.carry && P.veh.t.cls !== 'bike' && P.veh.t.cls !== 'board') return; // inside: seen through the glass as nobody (cheap)
  if (P.state === 'foot' && Math.hypot(CAM.x - P.x, CAM.z - P.z) < 0.75 && Math.abs(CAM.y - P.y - 1.5) < 0.9) return;
  var Q = poseOfPlayer(), W0 = WPN[P.wpn], held = W0.mesh ? RIGS[W0.mesh] : null, y = P.y;
  if (P.state === 'car' && P.veh) { var v = P.veh; Q = pose0(); if (v.t.cls === 'board') poseRideStand(Q); else { poseSit(Q); Q.y = -0.35; } drawPerson(RIGS.cumhead, v.x, v.y + (v.t.cls === 'board' ? 0.15 : 0.35), v.z, v.a, Q, { noShadow: 1 }); return; }
  drawPerson(RIGS.cumhead, P.x, y, P.z, P.a, Q, { held: held, heldP: W0.swing ? -Math.PI / 2 - 0.2 : -Math.PI / 2, flash: P.hurtT > 0.3 ? [0.5, 0, 0] : null });
}
