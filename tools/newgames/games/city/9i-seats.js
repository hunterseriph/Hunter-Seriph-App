/* ---------- update 162 (his ask): two on a bench. In co-op both players can sit on the same bench (or sofa, log, hot
   tub): they shuffle up to make room. Whoever lights a joint smokes it and passes it across every few drags until one
   of you gets up (it stays lit, and you keep smoking, until you stand). The high is gentler than before. Works
   outside and on the sofas at home. ---------- */
function seatKey(s) { return s.id || (Math.round(s.x * 2) + ',' + Math.round(s.z * 2)); }
function mateSeat() { var R = G.coop && G.coop.other; return R && R.tg && R.tg.seat ? R.tg.seat : null; }
function sameSeat(S) { var m = mateSeat(); if (!m || !S) return null; var here = G.interior ? (G.interior.home || G.interior.key) : ''; return m.k === seatKey(S.s) && (m.in || '') === here ? m : null; }
function seatSide(S) { var m = sameSeat(S); if (!m) return 0; var w = S.s.kind === 'log' ? 0.5 : S.s.kind === 'tub' ? 0.6 : 0.45; return m.sd > 0 ? -w : m.sd < 0 ? w : (NET.role === 'host' ? -w : w); }
sitDown = function (s) { G.seat = { s: s, t: 0, sd: 0, lit: 0, hold: 0, passT: 0, passA: 0, puffT: 1 }; P.vx = P.vz = 0; sfx.play('select'); };
standUp = function () { var S = G.seat, s = S.s; if (S.lit) toast('You flick the end away. Nice.'); G.seat = null; var ox = Math.cos(s.a) * S.sd, oz = -Math.sin(s.a) * S.sd; P.x = s.x + ox + Math.sin(s.a) * 0.9; P.z = s.z + oz + Math.cos(s.a) * 0.9; P.y = G.interior ? 0 : standY(P.x, P.z, P.y + 1); };
function holding(S) { if (!S) return false; if (S.lit) return !!S.hold; var m = sameSeat(S); return !!(m && m.lit && !m.hold); }
lightJoint = function () { var S = G.seat; if (!S || S.lit) return; var m = sameSeat(S); if (m && m.lit) { toast(holding(S) ? 'Puff puff pass.' : 'Wait for it. It\'s coming round.'); return; }
  var have = SV.joints || 0; if (have <= 0) { toast('No joints left. Saba sells them.'); return; } SV.joints = have - 1; S.lit = 1; S.hold = 1; S.passT = 0; sfx.play('blip');
  toast(pick(m ? ['You spark one up for the two of you.', 'One for the road. Two for the bench.', 'Light it up. Puff, puff, pass.'] : ['You spark one up. Cum City slows right down.', 'A long drag. The streetlights go soft at the edges.', 'You light up. Somewhere a dog laughs.', 'Ahh. Everything is going to be fine.'])); };
(function () {
  var sf = stepFoot; stepFoot = function (dt) {
    if (!G.seat) return sf(dt);
    var S = G.seat, s = S.s; S.t += dt; var want = seatSide(S); S.sd += (want - S.sd) * Math.min(1, dt * 6);
    P.x = s.x - Math.sin(s.a) * 0.08 + Math.cos(s.a) * S.sd; P.z = s.z - Math.cos(s.a) * 0.08 - Math.sin(s.a) * S.sd; P.y = s.y; P.a = s.a; P.vx = P.vz = 0; P.sp = 0; P.ground = 1;
    var st = KIT.stick(0); if ((Math.hypot(st.x, st.y) > 0.6 && S.t > 0.4) || KIT.pressed('y') || P.hurtT > 0) { standUp(); return; }
    if (KIT.pressed('x')) lightJoint();
    if (S.lit) { var m = sameSeat(S); S.passT += dt; if (m && S.passT > 7) { S.passT = 0; S.hold = S.hold ? 0 : 1; S.passA = 0.7; sfx.play('blip'); } if (!m) S.hold = 1; }
    var mine = holding(S); if (mine !== S.wasHold) { if (S.wasHold !== undefined && !S.lit) S.passA = 0.7; S.wasHold = mine; }
    if (S.passA > 0) S.passA -= dt;
    if (mine) { S.puffT -= dt; G.high = Math.min(0.75, (G.high || 0) + dt * 0.03); P.hp = Math.min(SV.maxHp, P.hp + dt * 1.5);
      if (S.puffT <= 0 && !window.SMOKE165) { S.puffT = 2.4; var hx = P.x + Math.sin(P.a) * 0.35, hz = P.z + Math.cos(P.a) * 0.35; for (var k = 0; k < 4; k++) addFx({ k: 'puff', x: hx, y: P.y + 1.15, z: hz, vx: Math.sin(P.a) * 0.4 + rnd(-0.2, 0.2), vy: rnd(0.3, 0.6), vz: Math.cos(P.a) * 0.4 + rnd(-0.2, 0.2), life: 2.6 + k * 0.3, s0: 0.25, grow: 0.6, col: [0.85, 0.85, 0.82], a0: 0.45 }); } }
    if (s.fire && P.hp < SV.maxHp) P.hp = Math.min(SV.maxHp, P.hp + dt * 4); };
  // the pose: sat down; the smoking arm comes up to the mouth every couple of seconds; reaching across when it is passed
  function smokeArm(Q, t, passA, sd) { var c = (t % 2.4) / 2.4, up = c < 0.35 ? Math.sin(c / 0.35 * Math.PI) : 0; Q.sh[1] = [0.55 + up * 1.05, -0.15, 0.2 - up * 0.05]; Q.el[1] = 1.3 + up * 1.05; /* update 164: resting by the chest, raised to the mouth for a drag */ Q.hp = -0.1 * up;
    if (passA > 0) { var k = Math.sin(passA / 0.7 * Math.PI); Q.sh[1] = [1.2, -0.15 + k * 0.9 * (sd > 0 ? -1 : 1), 0.2]; Q.el[1] = 0.6; } return up; }
  window.sitPose = function (seatKind, hold, t, passA, sd) { var Q = pose0(); poseSit(Q); Q.y = seatKind === 'tub' ? -0.75 : -0.45; if (hold) smokeArm(Q, t, passA, sd); else if (passA > 0) smokeArm(Q, 0, passA, sd); else { Q.sh[0][0] = 0.6; Q.sh[1][0] = 0.6; } return Q; };
  var po = poseOfPlayer; poseOfPlayer = function () { if (!G.seat) return po(); var S = G.seat; if (S.s.fire && !holding(S)) return po(); return sitPose(S.s.kind, holding(S), S.t, S.passA, S.sd); };
  // the joint in the hand and its smoke
  window.drawJoint = function (x, y, z, a, t) { var c = (t % 2.4) / 2.4, up = c < 0.35 ? Math.sin(c / 0.35 * Math.PI) : 0, hx = x + Math.sin(a) * 0.28 + Math.cos(a) * -0.22, hz = z + Math.cos(a) * 0.28 - Math.sin(a) * -0.22, hy = y + 0.75 + up * 0.35;
    if (!RIGS.jointM) { var m = new R3.Mesh(); tub(m, [0, 0, 0], [0, 0, 0.16], 0.014, 0.02, '#f1e7d0', 5, { cap: 1, cap0: 1 }); RIGS.jointM = m.upload(); } R3.draw(RIGS.jointM, ATT, { m: MD(hx, hy, hz, a, -0.3, 0) });
    var tip = [hx + Math.sin(a) * 0.17, hy + 0.05, hz + Math.cos(a) * 0.17]; if (Math.random() < 0.08) addFx({ k: 'puff', x: tip[0], y: tip[1], z: tip[2], vy: 0.35, vx: 0, vz: 0, life: 1.6, s0: 0.06, grow: 0.25, col: [0.9, 0.9, 0.9], a0: 0.35 }); addFx({ k: 'ember', x: tip[0], y: tip[1], z: tip[2], life: 0.02 }); };
  var dp = drawPlayer; drawPlayer = function () { dp(); var S = G.seat; if (S && holding(S) && !(S.passA > 0)) drawJoint(P.x, P.y, P.z, P.a, S.t); };
  // what the other player sees
  var pm = packMe; packMe = function () { var o = pm(), S = G.seat; o.in = G.interior ? (G.interior.home || G.interior.key) : null; if (S) o.seat = { k: seatKey(S.s), in: o.in || '', sd: r2(S.sd), lit: S.lit ? 1 : 0, hold: S.hold ? 1 : 0, h: holding(S) ? 1 : 0, kind: S.s.kind, t: r2(S.t), pa: S.passA > 0 ? 1 : 0 }; return o; };
  window.drawMateSeated = function (R) { var T = R.tg, st = T.seat; if (!st) return false; var rig = RIGS[isGuest() ? 'cumhead' : 'laboozie']; R.seatT = (R.seatT || 0) + 1 / 60;
    var Q = sitPose(st.kind, st.h, R.seatT, st.pa ? 0.35 : 0, st.sd); drawPerson(rig, R.x, R.y, R.z, R.a, Q, {}); if (st.h && !st.pa) drawJoint(R.x, R.y, R.z, R.a, R.seatT); return true; };
  var base = typeof _dwsNet === 'function' ? _dwsNet : null, dw = drawWorldStuff; drawWorldStuff = function () { var R = G.coop && G.coop.other; if (base && R && R.tg && R.tg.seat && !R.pv && !G.interior) { base(); drawMateSeated(R); return; } dw(); };
})();
/* gentler: less wobble and sway from a joint (TB's pills are untouched) */
(function () { var sd0 = stepDrugs; stepDrugs = function (dt) { sd0(dt); var hi = G.high || 0, pl = G.pilled || 0; G.fxWarp = hi * 0.28 + pl * 1.5; if (hi > 0.05 && pl < 0.05) CAM.sway = Math.sin(G.t * 0.5) * 0.03 * hi; }; })();
