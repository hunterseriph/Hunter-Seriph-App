/* ---------- update 156 (his rule): Sir Johnathan is Greebo's cat and goes wherever Greebo goes. Any Greebo in the
   city has the big black cat trotting at his heels (`p.cat`, drawn with HOM3D.cat()); when Greebo gets in a car the cat
   rides along. One of Greebo's missions has Sir Johnathan kidnapped: Greebo rides with you (an ally, `G.ally`, who gets
   in and out of your car and shoots back) from one of TB's boys' hideouts to the next until you find him in a cage. ---------- */
var CATSC = 0.42;
function stepPets(dt) {
  PEDS.forEach(function (p) {
    if (p.who !== 'greebo' || p.dead) return;
    if (G.catGone && !p.catFound) { p.cat = null; return; }
    if (!p.cat) { p.cat = { x: p.x - Math.sin(p.a) * 1.2, z: p.z - Math.cos(p.a) * 1.2, a: p.a, sp: 0, ph: 0, y: p.y }; }
    var c = p.cat; if (p.inVeh) { c.x = p.x; c.z = p.z; c.y = p.y; c.hide = 1; return; }
    if (c.hide) { c.hide = 0; c.x = p.x + Math.cos(p.a) * 1.0; c.z = p.z - Math.sin(p.a) * 1.0; }
    // a spot just behind and beside his owner; trots there, sits when he gets there
    var tx = p.x - Math.sin(p.a) * 1.1 + Math.cos(p.a) * 0.7, tz = p.z - Math.cos(p.a) * 1.1 - Math.sin(p.a) * 0.7, dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz);
    if (d > 25) { c.x = tx; c.z = tz; d = 0; }
    var want = d > 0.4 ? Math.min(7.5, d * 2.6) : 0; c.sp += (want - c.sp) * Math.min(1, dt * 6);
    if (d > 0.05 && c.sp > 0.05) { var mx = dx / d * c.sp * dt, mz = dz / d * c.sp * dt, k = collide(c.x + mx, c.z + mz, 0.25, c.y, 0.6); c.x += mx + k.x; c.z += mz + k.z; c.a += angDiff(c.a, Math.atan2(dx, dz)) * Math.min(1, dt * 8); }
    else c.a += angDiff(c.a, p.a) * Math.min(1, dt * 2);
    c.ph += dt * c.sp * 3; c.y = standY(c.x, c.z, c.y + 0.5);
  });
  stepAlly(dt);
}
function drawCat(x, y, z, a, sp, ph, sit) { var C = HOM3D.cat(), bob = sp > 0.3 ? Math.abs(Math.sin(ph)) * 0.04 : 0, sq = sit ? 0.85 : 1; R3.draw(C.mesh, ATT, { m: MD(x, y + bob, z, a, sit ? -0.12 : 0, 0, CATSC * sq), tint: G.ptint }); }
var _dws = typeof drawWorldStuff === 'function' ? drawWorldStuff : function () {};
drawWorldStuff = function () { _dws();
  if (G.interior) return;
  PEDS.forEach(function (p) { var c = p.cat; if (!c || c.hide || p.dead || dist2(c.x, c.z, CAM.x, CAM.z) > 70 * 70) return; drawCat(c.x, c.y, c.z, c.a, c.sp, c.ph, c.sp < 0.2); });
  if (G.caged) { var K = G.caged; drawCat(K.x, K.y + 0.1, K.z, K.a, 0, 0, 1); if (!K.open) { for (var i = 0; i < 8; i++) { var q = i / 8 * 6.283; tub2(K.x + Math.cos(q) * 0.55, K.y, K.z + Math.sin(q) * 0.55, 1.0); } } }
};
var CAGEM = null;
function tub2(x, y, z, h) { if (!CAGEM) { var m = new R3.Mesh(); tub(m, [0, 0, 0], [0, 1, 0], 0.025, 0.025, '#3a3a3e', 5); tub(m, [-0.6, 1, 0], [0.6, 1, 0], 0.03, 0.03, '#3a3a3e', 4); CAGEM = m.upload(); } R3.draw(CAGEM, ATT, { m: MD(x, y, z, 0, 0, 0, h) }); }
/* ---------- an ally who rides with you and fights beside you ---------- */
function makeAlly(who) { var p = makePed({ x: P.x + 1.6, z: P.z + 0.6, who: who, rig: rigOf(who), state: 'idle', keep: 1, mission: 1, hp: 400 }); p.god = 1; p.ally = 1; p.cutWho = who; p.wpn = 'pistol'; p.ctl = allyCtl; G.ally = p; if (MS) MS.spawned.push(p); return p; }
function endAlly() { var p = G.ally; if (!p) return; if (p.inVeh) { p.inVeh = null; p.x = P.x + 2; p.z = P.z; } p.ally = 0; p.ctl = null; p.keep = 0; G.ally = null; }
function stepAlly(dt) { var p = G.ally; if (!p) return; if (p.dead) { G.ally = null; return; }
  if (P.state === 'car' && P.veh && !p.inVeh && dist2(p.x, p.z, P.x, P.z) < 35 * 35) { p.inVeh = P.veh; toast(CAST[p.who] ? CAST[p.who].name + ' hops in.' : ''); }
  if (p.inVeh && (P.state !== 'car' || p.inVeh.dead || P.veh !== p.inVeh)) { var v = p.inVeh; p.inVeh = null; var r = [Math.cos(v.a), -Math.sin(v.a)], s = v.t.wid / 2 + 0.9; p.x = v.x + r[0] * s; p.z = v.z + r[1] * s; p.y = standY(p.x, p.z, v.y + 1); p.a = v.a; } }
function allyCtl(p, dt) {
  var foe = null, fd = 26 * 26; PEDS.forEach(function (q) { if (q.dead || !(q.hostile || q.angry) || q === p) return; var d = dist2(q.x, q.z, p.x, p.z); if (d < fd) { fd = d; foe = q; } });
  var tx = P.x - Math.sin(P.a) * 1.8 + Math.cos(P.a) * 1.4 - p.x, tz = P.z - Math.cos(P.a) * 1.8 - Math.sin(P.a) * 1.4 - p.z, d = Math.hypot(tx, tz), spd = d > 6 ? 6.5 : d > 1.2 ? 3.4 : 0;
  if (foe) { p.state = 'fight'; p.a += angDiff(p.a, Math.atan2(foe.x - p.x, foe.z - p.z)) * Math.min(1, dt * 10); if (p.cool <= 0 && fd < 22 * 22 && rayBlock(p.x, p.y + 1.4, p.z, foe.x, foe.y + 1.2, foe.z) >= 1) { p.cool = 0.75 + Math.random() * 0.4; p.tgt = foe; p.atkT = 0.3; shoot(p, WPN.pistol); } if (d < 8) spd = 0; }
  else p.state = 'walk';
  if (d > 40) { p.x = P.x - Math.sin(P.a) * 2; p.z = P.z - Math.cos(P.a) * 2; p.y = standY(p.x, p.z, P.y + 1); return; }
  if (spd > 0 && d > 0.01) { p.vx = tx / d * spd; p.vz = tz / d * spd; if (!foe) p.a += angDiff(p.a, Math.atan2(tx, tz)) * Math.min(1, dt * 8); } else { p.vx *= 0.7; p.vz *= 0.7; }
  var nx = p.x + p.vx * dt, nz = p.z + p.vz * dt, c = collide(nx, nz, 0.3, p.y, 1.7); p.x = nx + c.x; p.z = nz + c.z; p.y = standY(p.x, p.z, p.y + 0.5); p.sp = Math.hypot(p.vx, p.vz); p.ph += dt * p.sp * 2.4; p.atkT = Math.max(0, (p.atkT || 0) - dt); }
var _cleanupMission = cleanupMission;
cleanupMission = function () { endAlly(); G.catGone = 0; G.caged = null; return _cleanupMission(); };
/* ---------- Greebo's mission: Cat Burglars ---------- */
function catCage() { var c = placeOf('road:dist:bone'), r = nearestRoad(c.x, c.z, 40), x = c.x, z = c.z; if (r) { x = r.x + r.dz * (r.E.w / 2 + 6); z = r.z - r.dx * (r.E.w / 2 + 6); } G.caged = { x: x, z: z, y: groundY(x, z), a: 0 }; }
MI({ id: 'greebo2', who: 'greebo', title: 'Cat Burglars', at: 'shop:greebo', chap: 'one', req: ['greebo1'], pay: 1500, steps: [
  { t: 'talk', lines: [['greebo', 'Mister Mayor! Sir Johnathan is gone! Somebody has taken my boy!'], ['greebo', 'They left a note on the oven. We have your cat. Try and find him, pie boy. And a little smiley face.'], ['greebo', 'TB\'s boys. It has to be. I\'m coming with you. Nobody takes Sir Johnathan.']] },
  { t: 'fn', fn: function () { G.catGone = 1; makeAlly('greebo'); } },
  { t: 'go', to: 'road:dist:docks', car: 1, r: 12, msg: 'Get a car and drive Greebo to the docks. The first hideout.' },
  { t: 'kill', spawn: [{ at: 'road:dist:docks', n: 6, kind: 'goon', wpn: 'pistol', spread: 16 }], msg: 'Kill everyone at the docks hideout.' },
  { t: 'talk', lines: [['greebo', 'No cat. Just his collar bell... and a receipt from the Cumstruction Site.'], ['greebo', 'Back in the car! Move!']] },
  { t: 'go', to: 'road:dist:site', car: 1, r: 12, msg: 'Drive to the Cumstruction Site.' },
  { t: 'kill', spawn: [{ at: 'road:dist:site', n: 7, kind: 'goon', wpn: 'pistol', spread: 18 }], msg: 'Kill everyone at the site.' },
  { t: 'talk', lines: [['greebo', 'He was here. Black fur everywhere. They have moved him again.'], ['greebo', 'The Bone Pit. That is where they took him. Of course it is the Bone Pit.']] },
  { t: 'go', to: 'road:dist:bone', car: 1, r: 14, msg: 'Drive to the Bone Pit.' },
  { t: 'fn', fn: catCage },
  { t: 'kill', spawn: [{ at: 'road:dist:bone', n: 9, kind: 'goon', wpn: 'pistol', spread: 20 }], msg: 'Kill everyone guarding Sir Johnathan.' },
  { t: 'fn', fn: function () { var K = G.caged; if (K) K.open = 1; G.catGone = 0; if (G.ally) { G.ally.catFound = 1; G.ally.cat = K ? { x: K.x, z: K.z, y: K.y, a: 0, sp: 0, ph: 0 } : null; } G.caged = null; sfx.play('coin'); } },
  { t: 'talk', lines: [['greebo', 'SIR JOHNATHAN! My boy! Did they hurt you? Did they feed you?'], ['greebo', 'He says they fed him tuna. From a tin. The monsters.'], ['greebo', 'Thank you, Mister Mayor. Free pies for life. Well. Cheap pies.']] },
  { t: 'go', to: 'shop:greebo', car: 1, msg: 'Drive Greebo and Sir Johnathan home.' }] });
