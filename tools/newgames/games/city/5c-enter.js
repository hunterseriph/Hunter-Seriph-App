/* ---------- update 155: getting into a car (his ask: it was bugged, there was no animation, and stealing a car
   should show you pulling the driver out). Y near a car: the car stops, Cumhead walks to the driver's door, opens it,
   drags out whoever is sitting there (they land on the road, then run or fight back), climbs in and shuts the door.
   Bikes, boards, boats and aircraft are still hopped onto at once. Moving the stick while walking up cancels it. ---------- */
function doorPt(v, out) { var r = [Math.cos(v.a), -Math.sin(v.a)], f = [Math.sin(v.a), Math.cos(v.a)], s = v.t.wid / 2 + (out === undefined ? 0.55 : out), k = v.t.len * 0.12; return { x: v.x - r[0] * s + f[0] * k, z: v.z - r[1] * s + f[1] * k }; }
function carNear() { // the car you are standing by, by its door more than its middle
  var best = null, bd = 1e9; VEH.forEach(function (v) { if (v.dead || v === P.veh) return; var c = Math.cos(v.a), s = Math.sin(v.a), dx = P.x - v.x, dz = P.z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
    var ex = Math.max(0, Math.abs(lx) - v.t.wid / 2), ez = Math.max(0, Math.abs(lz) - v.t.len / 2), d = Math.hypot(ex, ez); if (d < 2.6 && Math.abs(P.y - v.y) < 3 && d < bd) { bd = d; best = v; } });
  return best; }
function takeSeat(v, jacked) { // what enterNearest used to do, once you are in the seat
  if (v.driver && v.driver !== P) { var o = v.driver; o.inVeh = null; var D = doorPt(v, 1.2); o.x = D.x; o.z = D.z; o.y = v.y; o.fear = 6; }
  P.state = 'car'; P.veh = v; v.driver = P; CAM.yaw = v.a; CAM.snap = 1; v.ai = null; P.vx = P.vz = 0; P.ent = null; v.door = 0;
  if (!v.owned && !v.mission && !v.t.cop && !v.mine && !jacked) crime('steal', v.x, v.z); if (v.t.cop) crime('copcar', v.x, v.z); v.mine = 1;
  if (G.onEnter) G.onEnter(v); radioOn(v); }
enterNearest = function () {
  var v = carNear(); if (!v) return false;
  if (v.t.cls !== 'car' || v.t.body === 'kart' || v.t.body === 'buggy' || G.cut) { sfx.play('door'); takeSeat(v); return true; }
  P.state = 'enter'; P.ent = { v: v, t: 0, ph: 'walk', jack: v.driver && v.driver !== P ? v.driver : null }; if (v.ai) v.ai.hold = 1; P.aim = 0; return true;
};
function stepEnter(dt) {
  var E = P.ent, v = E && E.v; if (!v || v.dead) { P.state = 'foot'; P.ent = null; return; }
  E.t += dt; var k = Math.pow(0.03, dt); v.vx *= k; v.vz *= k; v.sp *= k; // the car pulls up
  var D = doorPt(v), a2c = Math.atan2(v.x - P.x, v.z - P.z);
  if (E.ph === 'walk') { var s = KIT.stick(0); if (E.t > 0.3 && Math.hypot(s.x, s.y) > 0.85 && !E.jack) { P.state = 'foot'; P.ent = null; if (v.ai) v.ai.hold = 0; return; }
    var dx = D.x - P.x, dz = D.z - P.z, d = Math.hypot(dx, dz), sp2 = Math.hypot(v.vx, v.vz);
    if (d < 0.2 || E.t > 2.4) { if (sp2 < 2 || E.t > 2.4) { P.x = D.x; P.z = D.z; E.ph = 'open'; E.t = 0; sfx.play('door'); } }
    else { var spd = Math.min(d / dt, 5.2); if (!collide(P.x + dx / d * spd * dt, P.z + dz / d * spd * dt, 0.3, P.y, 1.7).hit || E.t > 1) { P.x += dx / d * spd * dt; P.z += dz / d * spd * dt; } P.a = Math.atan2(dx, dz); P.sp = spd; P.ph += dt * spd * 2.4; }
    P.y = standY(P.x, P.z, P.y + 1); return; }
  P.sp = 0; P.x = D.x; P.z = D.z; P.a = v.a + Math.PI / 2; // facing the car's side
  if (E.ph === 'open') { v.door = Math.min(1, E.t / 0.3); if (E.t >= 0.3) { E.t = 0; E.ph = E.jack ? 'pull' : 'in'; if (E.jack) jackStart(v, E.jack); } return; }
  if (E.ph === 'pull') { if (E.t >= 1.0) { E.t = 0; E.ph = 'in'; } return; }
  if (E.ph === 'in') { v.door = 1; var q = Math.min(1, E.t / 0.45), C = { x: v.x, z: v.z }; P.x = D.x + (C.x - D.x) * q * 0.85; P.z = D.z + (C.z - D.z) * q * 0.85; P.y = v.y + q * 0.1; P.a = v.a + Math.PI / 2 * (1 - q);
    if (E.t >= 0.45) { E.t = 0; E.ph = 'close'; } return; }
  if (E.ph === 'close') { v.door = Math.max(0, 1 - E.t / 0.25); if (E.t >= 0.25) { sfx.play('door'); takeSeat(v, E.jack); } } }
function jackStart(v, o) { // drag the driver out: he comes up out of the seat, over your shoulder, onto the road
  var D0 = doorPt(v, 0.1), D1 = doorPt(v, 2.4); o.inVeh = null; v.driver = null; o.jackT = 0; o.x = D0.x; o.z = D0.z; o.y = v.y + 0.3; o.a = v.a - Math.PI / 2; say(o, pick(['Get off me!', 'My car!', 'What the fuck?!', 'Help! Police!', 'Not again...', 'Oi!']));
  o.ctl = function (p, dt) { p.jackT += dt; var t = Math.min(1, p.jackT / 0.9); p.x = D0.x + (D1.x - D0.x) * t; p.z = D0.z + (D1.z - D0.z) * t; p.y = standY(p.x, p.z, v.y + 2) + Math.sin(t * Math.PI) * 0.6; p.a = v.a - Math.PI / 2;
    if (p.jackT >= 0.9) { p.ctl = null; p.pose = null; p.downT = 1.3; p.vx = 0; p.vz = 0; if (!p.cop && Math.random() < 0.3) { p.angry = 1; p.state = 'fight'; } else p.fear = 8; } };
  o.pose = function (Q, p) { var t = Math.min(1, p.jackT / 0.9); poseHurt(Q, 1); Q.sh[0] = [2.2, 0.6, 0]; Q.sh[1] = [1.8, 0.8, 0]; Q.bp = -1.2 * t; Q.kn[0] = Q.kn[1] = 1.0 * (1 - t); Q.hip[0] = Q.hip[1] = 1.2 * (1 - t); };
  crime('jack', v.x, v.z, 1); sfx.play('punch'); }
function poseEnter(Q) { var E = P.ent; if (!E) return;
  if (E.ph === 'open') { var k = Math.min(1, E.t / 0.3); Q.sh[0] = [1.3 * k, 0.1, 0.4 * k]; Q.el[0] = 0.4; }
  else if (E.ph === 'pull') { var t = Math.min(1, E.t / 0.9), r = t < 0.35 ? t / 0.35 : 1 - (t - 0.35) * 0.4; Q.sh[0] = [1.5 * r, 0.2, 0.3]; Q.sh[1] = [1.5 * r, 0.2, -0.3]; Q.el[0] = Q.el[1] = 0.3 + 0.9 * (1 - r); Q.lean = t < 0.35 ? 0.35 : -0.25; Q.twist = t > 0.35 ? -0.6 * (t - 0.35) : 0; Q.kn[0] = Q.kn[1] = 0.3; }
  else if (E.ph === 'in' || E.ph === 'close') { var q = E.ph === 'close' ? 1 : Math.min(1, E.t / 0.45); poseSit(Q); Q.hip[0] = Q.hip[1] = 1.45 * q; Q.kn[0] = Q.kn[1] = 1.5 * q; Q.y = -0.5 * q; if (E.ph === 'close') { Q.sh[1] = [1.4, 0.5, -0.5]; } } }
