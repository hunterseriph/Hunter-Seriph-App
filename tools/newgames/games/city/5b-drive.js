/* ---------- driving: one stepper for every vehicle (the player's and the traffic), by class: car, bike, board, boat, helicopter, plane ---------- */
function vehInput() { // the player's hands on the controls
  var s = KIT.stick(0), gp = KIT.gamepad, rt = gp && gp.buttons && gp.buttons[7] ? gp.buttons[7].value : 0, lt = gp && gp.buttons && gp.buttons[6] ? gp.buttons[6].value : 0, drunk = G.drunk || 0;
  var thr = Math.max(KIT.held('a') ? 1 : 0, rt, s.y < -0.3 ? -s.y : 0), brk = Math.max(KIT.held('b') ? 1 : 0, lt, s.y > 0.3 ? s.y : 0);
  var steer = -s.x; if (drunk > 0.2) steer += Math.sin(G.t * 1.9) * drunk * 0.5;
  return { thr: thr, brk: brk, steer: steer, hand: KIT.held('x'), up: KIT.held('a'), down: KIT.held('b'), pitch: s.y, roll: s.x, yaw: -s.x };
}
function stepVehicle(v, inp, dt) {
  var t = v.t, cl = t.cls; v.flash = Math.max(0, (v.flash || 0) - dt);
  if (v.dead) { v.sp *= 0.95; inp = { thr: 0, brk: 0.5, steer: 0 }; }
  if (cl === 'heli') return stepHeli(v, inp, dt);
  if (cl === 'plane') return stepPlane(v, inp, dt);
  var f = [Math.sin(v.a), Math.cos(v.a)], r = [Math.cos(v.a), -Math.sin(v.a)], fs = v.vx * f[0] + v.vz * f[1], ls = v.vx * r[0] + v.vz * r[1];
  var boat = cl === 'boat', top = t.top * (G.boost && v === (P && P.veh) ? 1.25 : 1), grip = t.grip * (inp.hand ? 0.22 : 1) * (G.weather === 'rain' || G.weather === 'storm' ? 0.75 : 1) * (G.weather === 'snow' ? 0.55 : 1);
  var gk = kAt(v.x, v.z), off = !boat && !isHardK(gk) && !t.offroad ? 0.7 : 1;
  if (boat) { var onW = isWaterK(gk); if (!onW) { inp = { thr: 0, brk: 0, steer: 0 }; fs *= 0.9; } }
  // throttle, brakes, reverse
  if (inp.thr > 0.05) { if (fs < -0.5) fs += 22 * inp.thr * dt; else fs += t.acc * inp.thr * (1 - Math.max(0, fs) / (top * off)) * dt * (fs < 6 ? 1.6 : 1); }
  if (inp.brk > 0.05) { if (fs > 0.5) fs -= 26 * inp.brk * dt; else fs = Math.max(-top * 0.3, fs - t.acc * 0.6 * inp.brk * dt); }
  if (inp.hand && !boat) fs -= Math.sign(fs) * Math.min(Math.abs(fs), 8 * dt);
  fs -= fs * (boat ? 0.35 : 0.12) * dt; if (Math.abs(fs) < 0.05 && inp.thr < 0.05) fs = 0;
  ls *= Math.exp(-grip * (boat ? 0.7 : 1) * dt);
  // steering: tighter when slow
  var tr = (cl === 'board' ? 2.6 : cl === 'bike' ? 2.2 : 1.9) - Math.min(1.1, Math.abs(fs) / 45), turn = inp.steer * tr * clamp(fs / 5, -1, 1);
  v.steer += (inp.steer - v.steer) * Math.min(1, dt * 8);
  if (!v.air || boat) v.a += turn * dt;
  f = [Math.sin(v.a), Math.cos(v.a)]; r = [Math.cos(v.a), -Math.sin(v.a)];
  v.vx = f[0] * fs + r[0] * ls; v.vz = f[1] * fs + r[1] * ls; v.sp = fs;
  // move, collide with the world
  var nx = v.x + v.vx * dt, nz = v.z + v.vz * dt, rad = Math.max(0.3, t.wid * 0.5), hit = null;
  [t.len * 0.3, -t.len * 0.3].forEach(function (o) { var cx = nx + f[0] * o, cz = nz + f[1] * o, c = collide(cx, cz, rad, v.y + 0.2, t.hgt); if (c.hit) { nx += c.x; nz += c.z; hit = c; } });
  if (boat) { var k2 = kAt(nx + f[0] * t.len * 0.5, nz + f[1] * t.len * 0.5); if (!isWaterK(k2)) { nx = v.x; nz = v.z; hit = hit || { x: -v.vx, z: -v.vz }; } }
  if (hit) { var imp = Math.abs(fs); if (imp > 6) { hurtVeh(v, (imp - 6) * 2.5, null); sfx.play('crash'); if (v === (P && P.veh)) CAM.shake = 0.35; } var hl = Math.hypot(hit.x, hit.z) || 1, nn = [hit.x / hl, hit.z / hl], vn = v.vx * nn[0] + v.vz * nn[1]; if (vn < 0) { v.vx -= nn[0] * vn * 1.5; v.vz -= nn[1] * vn * 1.5; } v.vx *= 0.6; v.vz *= 0.6; }
  v.x = clamp(nx, 4, WX - 4); v.z = clamp(nz, 4, WZ - 4);
  // up and down: follow the ground, fly off crests and ramps, fall in the water
  if (boat) { var wy = waterY(v.x, v.z); v.y = (wy > -50 ? wy : v.y) + Math.sin(G.t * 2 + v.x) * 0.05 + 0.1; v.pitch = -clamp(fs / top, 0, 1) * 0.12 + Math.sin(G.t * 1.7) * 0.03; v.roll = -v.steer * clamp(fs / top, 0, 1) * 0.15; }
  else {
    var g = standY(v.x, v.z, v.y + 0.5), was = v.air;
    if (!v.air) { var vyG = (g - v.y) / dt; if (vyG < v.vy - 30 * dt && Math.abs(fs) > 8) { v.air = 1; } else { v.vy = clamp(vyG, -20, 20); v.y = g; } }
    if (v.air) { v.vy -= 16 * dt; v.y += v.vy * dt; v.airT = (v.airT || 0) + dt; if (v.y <= g) { if (v.vy < -12) hurtVeh(v, (-v.vy - 12) * 2, null); if (v === (P && P.veh) && v.airT > 0.6) stuntLanded(v); v.y = g; v.vy = 0; v.air = 0; v.airT = 0; } }
    // tilt to the ground
    var fl = t.len * 0.4, gf = groundY(v.x + f[0] * fl, v.z + f[1] * fl), gb = groundY(v.x - f[0] * fl, v.z - f[1] * fl), wl = t.wid * 0.45, gr = groundY(v.x + r[0] * wl, v.z + r[1] * wl), glf = groundY(v.x - r[0] * wl, v.z - r[1] * wl);
    var tp = v.air ? v.pitch - 0.25 * dt : -Math.atan2(gf - gb, fl * 2), trl = v.air ? v.roll : Math.atan2(gr - glf, wl * 2) * -1;
    if (cl === 'bike' || cl === 'board') trl = -v.steer * clamp(fs / 18, 0, 1) * 0.5;
    v.pitch += (tp - v.pitch) * Math.min(1, dt * 10); v.roll += (trl - v.roll) * Math.min(1, dt * 8);
    var wy2 = waterY(v.x, v.z); if (wy2 > -50 && v.y < wy2 - 0.6 && !v.sunk) { v.sunk = 1; v.hp = 0; if (v === (P && P.veh)) { exitVehicle(true); P.swim = 1; } }
  }
  v.wheelA += fs * dt / Math.max(0.1, vmesh(v.type, v.col).wr);
  if (v.hp <= 0 && !v.dead && !v.sunk) explodeVeh(v);
  if (v.hp < 30 && !v.dead && Math.random() < dt * 8) addFx({ k: 'smoke', x: v.x + f[0] * t.len * 0.4, y: v.y + 1, z: v.z + f[1] * t.len * 0.4, vy: 1.5, life: 1.4 });
  if (v.hp < 12 && !v.dead) { v.burn = (v.burn || 0) + dt; if (v.burn > 5) v.hp = 0; if (Math.random() < dt * 10) addFx({ k: 'flame', x: v.x + f[0] * t.len * 0.4, y: v.y + 1.2, z: v.z + f[1] * t.len * 0.4, vy: 2, life: 0.5 }); }
}
function stepHeli(v, inp, dt) {
  var t = v.t, f = [Math.sin(v.a), Math.cos(v.a)], r = [Math.cos(v.a), -Math.sin(v.a)], g = standY(v.x, v.z, v.y), on = v.driver || v === (P && P.veh);
  v.rotor += dt * (on ? 28 : Math.max(0, (v.rotorV || 0))) ; v.rotorV = on ? 28 : Math.max(0, (v.rotorV || 0) - dt * 6);
  var lift = on ? (inp.up ? 9 : 0) - (inp.down ? 8 : 0) : -9; v.vy += (lift - v.vy) * Math.min(1, dt * 2);
  if (v.y <= g + 0.05 && v.vy < 0) { v.vy = 0; v.y = g; v.ground = 1; } else v.ground = 0;
  var fwd = v.ground ? 0 : -(inp.pitch || 0) * t.top, side = 0, ty = v.ground ? 0 : (inp.yaw || 0) * 1.4;
  v.a += ty * dt; v.vx += ((f[0] * fwd) - v.vx) * Math.min(1, dt * 1.2); v.vz += ((f[1] * fwd) - v.vz) * Math.min(1, dt * 1.2);
  var nx = v.x + v.vx * dt, nz = v.z + v.vz * dt, ny = Math.min(320, v.y + v.vy * dt), c = collide(nx, nz, 2.2, ny, 3);
  if (c.hit) { var sp = Math.hypot(v.vx, v.vz); if (sp > 6) { hurtVeh(v, sp * 2, null); sfx.play('crash'); } nx = v.x + c.x * 0.5; nz = v.z + c.z * 0.5; v.vx *= -0.3; v.vz *= -0.3; }
  if (ny < g && !v.ground) { if (v.vy < -6) hurtVeh(v, -v.vy * 4, null); ny = g; }
  v.x = clamp(nx, 4, WX - 4); v.z = clamp(nz, 4, WZ - 4); v.y = Math.max(ny, g);
  v.pitch += (((inp.pitch || 0) * 0.25 * (v.ground ? 0 : 1)) - v.pitch) * Math.min(1, dt * 3); v.roll += (((inp.yaw || 0) * -0.18 * (v.ground ? 0 : 1)) - v.roll) * Math.min(1, dt * 3);
  v.sp = Math.hypot(v.vx, v.vz); if (v.hp <= 0 && !v.dead) explodeVeh(v); if (v.dead && v.y > g) { v.vy -= 20 * dt; }
}
function stepPlane(v, inp, dt) {
  var t = v.t, g = standY(v.x, v.z, v.y), on = v === (P && P.veh), thr = on ? inp.thr : 0, brk = on ? inp.brk : 0.3;
  v.spd = v.spd || 0; v.spd += (thr * t.acc - brk * 14 - v.spd * 0.06) * dt; v.spd = clamp(v.spd, 0, t.top); v.rotor += dt * (8 + v.spd);
  var take = t.top * 0.38, flying = !v.ground;
  if (v.ground) { v.a += -(inp.roll || 0) * dt * clamp(v.spd / 6, 0, 1) * 1.2; v.pitch += ((v.spd > take ? (inp.pitch || 0) * 0.4 : 0) - v.pitch) * Math.min(1, dt * 3); if (v.spd > take && (inp.pitch || 0) > 0.3) { v.ground = 0; v.vy = 3; } v.roll *= 0.9; }
  else { v.roll += (-(inp.roll || 0) * 0.9 - v.roll) * Math.min(1, dt * 2.5); v.a -= Math.sin(v.roll) * dt * 1.1 * clamp(v.spd / 30, 0.3, 1.2); v.pitch += ((inp.pitch || 0) * 0.55 - v.pitch) * Math.min(1, dt * 2); }
  var f = [Math.sin(v.a) * Math.cos(v.pitch), Math.sin(v.pitch), Math.cos(v.a) * Math.cos(v.pitch)], liftK = clamp((v.spd - take * 0.8) / take, 0, 1);
  v.vx = f[0] * v.spd; v.vz = f[2] * v.spd;
  if (!v.ground) { v.vy = f[1] * v.spd - (1 - liftK) * 9; } else v.vy = 0;
  var nx = v.x + v.vx * dt, nz = v.z + v.vz * dt, ny = Math.min(500, v.y + v.vy * dt), c = collide(nx, nz, 2.5, ny, 2.5);
  if (c.hit && v.spd > 8) { hurtVeh(v, 999, null); }
  if (!v.ground && ny <= g) { var bad = v.vy < -6 || Math.abs(v.roll) > 0.5 || v.pitch < -0.3 || !isHardK(kAt(nx, nz)) && kAt(nx, nz) !== K_GRASS && kAt(nx, nz) !== K_FIELD; if (bad) hurtVeh(v, 999, null); else { v.ground = 1; ny = g; v.pitch = 0; } }
  if (v.ground) ny = g;
  if (isWaterK(kAt(nx, nz)) && ny < 1) hurtVeh(v, 999, null);
  v.x = clamp(nx, 4, WX - 4); v.z = clamp(nz, 4, WZ - 4); v.y = ny; v.sp = v.spd; v.wheelA += v.spd * dt / 0.3;
  if (v.hp <= 0 && !v.dead) explodeVeh(v);
}
/* getting in and out */
function enterNearest() {
  var best = null, bd = 16; VEH.forEach(function (v) { if (v.dead) return; var d = dist2(P.x, P.z, v.x, v.z), r = v.t.len * 0.6 + 2; if (d < r * r && d < bd * bd * 4) { if (!best || d < dist2(P.x, P.z, best.x, best.z)) best = v; } });
  if (!best) return false;
  if (best.driver && best.driver !== P) { var dr = best.driver; jackDriver(best, dr); }
  P.state = 'car'; P.veh = best; best.driver = P; CAM.yaw = best.a; CAM.snap = 1; best.ai = null; P.vx = P.vz = 0; sfx.play('door');
  if (!best.owned && !best.mission && !best.t.cop) crime('steal', best.x, best.z); if (best.t.cop) crime('copcar', best.x, best.z);
  if (G.onEnter) G.onEnter(best); radioOn(best);
  return true;
}
function exitVehicle(force) {
  var v = P.veh; if (!v) return; if (!force && Math.abs(v.sp || 0) > 6 && v.t.cls !== 'heli') { /* bail out at speed: tumble */ P.ragT = 1.0; hurtPlayer(10, 'bail'); }
  var r = [Math.cos(v.a), -Math.sin(v.a)], side = v.t.wid / 2 + 0.7, ex = v.x + r[0] * side * -1, ez = v.z + r[1] * side * -1;
  if (collide(ex, ez, 0.35, v.y, 1.7).hit) { ex = v.x - r[0] * side * -1; ez = v.z - r[1] * side * -1; }
  P.x = ex; P.z = ez; P.y = Math.max(standY(ex, ez, v.y + 1), v.t.cls === 'heli' || v.t.cls === 'plane' ? v.y : 0); P.vx = v.vx * 0.5; P.vz = v.vz * 0.5; P.vy = 0; P.state = 'foot'; v.driver = null; P.veh = null; P.a = v.a; sfx.play('door'); radioOff();
}
function vehPush(o, r) { // people get shoved by cars rather than standing inside them
  VEH.forEach(function (v) { if (v === o.veh) return; var c = Math.cos(v.a), s = Math.sin(v.a), dx = o.x - v.x, dz = o.z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c, hw = v.t.wid / 2 + r, hl = v.t.len / 2 + r;
    if (Math.abs(lx) < hw && Math.abs(lz) < hl && o.y < v.y + v.t.hgt && o.y + 1.6 > v.y) { var px = hw - Math.abs(lx), pz = hl - Math.abs(lz); if (px < pz) lx += Math.sign(lx || 1) * px; else lz += Math.sign(lz || 1) * pz; o.x = v.x + lx * c + lz * s; o.z = v.z - lx * s + lz * c;
      var sp = Math.hypot(v.vx || 0, v.vz || 0); if (sp > 5 && o === P && P.state === 'foot') { hurtPlayer(sp * 2.5, v.driver); P.ragT = 1.2; P.vx = v.vx * 0.8; P.vz = v.vz * 0.8; P.vy = 4; } } });
}
function carHits(dt) { // the player's car against people and other cars
  var v = P.veh; if (!v || v.t.cls === 'heli' || v.t.cls === 'plane') return; var sp = Math.hypot(v.vx, v.vz), c = Math.cos(v.a), s = Math.sin(v.a);
  PEDS.forEach(function (p) { if (p.dead || p.inVeh || p.downT > 0) return; var dx = p.x - v.x, dz = p.z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < v.t.wid / 2 + 0.3 && Math.abs(lz) < v.t.len / 2 + 0.3) {
    if (sp > 4) { hurtPed(p, sp * 4, P, [v.vx / sp, 0.5, v.vz / sp], 1); p.vx = v.vx * 0.9; p.vz = v.vz * 0.9; p.vy = 3 + sp * 0.15; if (sp > 15) stuntBonus('splat'); } else { p.x += lx > 0 ? 0.1 : -0.1; } } });
  VEH.forEach(function (o) { if (o === v || o.t.cls === 'heli' || o.t.cls === 'plane') return; var d = Math.hypot(o.x - v.x, o.z - v.z), m = (o.t.len + v.t.len) * 0.32 + (o.t.wid + v.t.wid) * 0.2; if (d < m && d > 0.01) { var nx = (o.x - v.x) / d, nz = (o.z - v.z) / d, rel = (v.vx - (o.vx || 0)) * nx + (v.vz - (o.vz || 0)) * nz;
    var push = (m - d) * 0.5; o.x += nx * push; o.z += nz * push; v.x -= nx * push; v.z -= nz * push;
    if (rel > 0) { var ma = v.t.heavy ? 2 : 1, mb = o.t.heavy ? 2 : 1, j = rel * 1.2 / (ma + mb); v.vx -= nx * j * mb; v.vz -= nz * j * mb; o.vx = (o.vx || 0) + nx * j * ma; o.vz = (o.vz || 0) + nz * j * ma; if (o.ai) o.ai.bump = 1.2; if (rel > 5) { hurtVeh(o, rel * 2.2, P); hurtVeh(v, rel * 1.2, null); sfx.play('crash'); CAM.shake = 0.25; if (o.t.cop) crime('hitcop', v.x, v.z); else crime('ram', v.x, v.z, 0.3); } } } });
}
function hurtVeh(v, dmg, by) { if (v.dead || G.cut) return; if (v === (P && P.veh) && G.god) return; v.hp -= dmg; v.flash = 0.1; if (by === P && v.driver && v.driver !== P) { var d = v.driver; d.angry = 1; if (v.t.cop) crime('shootcop', v.x, v.z); else crime('carattack', v.x, v.z, 0.5); } }
function explodeVeh(v) {
  v.dead = 1; v.hp = 0; boom(v.x, v.y + 1, v.z, 9, v === (P && P.veh) ? null : P); if (v.driver === P) { exitVehicle(true); hurtPlayer(80, 'boom'); } else if (v.driver) { var d = v.driver; v.driver = null; if (d.inVeh) { d.inVeh = null; d.x = v.x + 1.5; d.z = v.z; d.y = v.y; hurtPed(d, 200, null); } }
  v.vy = 7; v.air = 1;
}
function boom(x, y, z, r, by) {
  sfx.play('boom'); for (var k = 0; k < 18; k++) addFx({ k: 'flame', x: x + rnd(-1.5, 1.5), y: y + rnd(0, 1.5), z: z + rnd(-1.5, 1.5), vx: rnd(-6, 6), vy: rnd(2, 9), vz: rnd(-6, 6), life: rnd(0.5, 1.1) }); for (var s = 0; s < 8; s++) addFx({ k: 'smoke', x: x, y: y + 1, z: z, vx: rnd(-2, 2), vy: rnd(1, 4), vz: rnd(-2, 2), life: 2.5 });
  G.dynLights = G.dynLights || []; G.dynLights.push({ x: x, y: y + 2, z: z, r: 22, c: [1, 0.6, 0.2], k: 2.4, life: 0.4 });
  if (P && Math.hypot(P.x - x, P.z - z) < 60) CAM.shake = Math.max(CAM.shake, 0.6 * (1 - Math.hypot(P.x - x, P.z - z) / 60));
  PEDS.forEach(function (p) { var d = Math.hypot(p.x - x, p.z - z); if (d < r && !p.dead) hurtPed(p, (1 - d / r) * 160, by, [(p.x - x) / (d || 1), 1, (p.z - z) / (d || 1)], 1); });
  VEH.forEach(function (v) { var d = Math.hypot(v.x - x, v.z - z); if (d < r && !v.dead) { hurtVeh(v, (1 - d / r) * 120, by); v.vy = (v.vy || 0) + (1 - d / r) * 6; v.air = 1; } });
  if (P && P.state === 'foot') { var dp = Math.hypot(P.x - x, P.z - z); if (dp < r) { hurtPlayer((1 - dp / r) * 90, 'boom'); P.ragT = 1.2; P.vy = 5; } }
  makeNoise(x, z, 120, by);
}
