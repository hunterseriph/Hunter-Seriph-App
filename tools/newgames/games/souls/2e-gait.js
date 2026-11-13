/* =====================================================================================================
   DARK LOADS update 147: how Cumhead walks (he said it still felt like Roblox walking).
   The old walk swung both legs like pendulums on a fixed beat, the foot was glued to the shin and the
   stride had nothing to do with how fast he was going, so the feet skated. Now:
   - his own legs with an ankle, so the foot stays flat on the ground, rolls heel to toe and dangles in the swing
   - every step is placed: the planted foot sticks to the ground and slides back at exactly his speed
     (two-bone IK from the hip to the ankle), the stride gets longer and the steps quicker as he speeds up
   - walk (long contact, heel strike, hips that rise over the planted foot and drop on the swing side),
     run (short contact, knees up, heels kick back, he dips on landing), sprint (longer stride, leans in, arms pump)
   - the pelvis turns with the leading leg and the shoulders turn against it, the head stays level
   - he banks into turns, leans into a start and rocks back when he stops, and shuffles when he turns on the spot
   - locked on, the legs turn towards where he is going (up to 55 degrees) while the chest keeps facing the foe,
     and walking backwards really steps backwards
   ===================================================================================================== */
var GAIT = { la: 0.25, ank: 0.08, hj: 0.64 };
function wrapA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
function cumRigP() { // Cumhead with separate feet, built once from his normal rig
  if (RIGS.cumP) return RIGS.cumP; var B = RIGS.cumhead, D = B.D, P = {}, L = D.leg, la = GAIT.la, legs = '#1a1012', boot = '#0e0808';
  Object.keys(B.P).forEach(function (k) { P[k] = B.P[k]; });
  ['L', 'R'].forEach(function (sd) {
    var ll = M(); ell(ll, 0, 0, 0.012, L * 0.9, L * 0.9, L * 0.92, legs, 8, 4); lathe(ll, [[0, L * 0.86], [-D.ll * 0.3, L * 0.92, L * 0.98, 0, -0.012], [-la * 0.8, L * 0.72], [-la, L * 0.66]], legs, 10);
    tub(ll, [0, -la + 0.06, 0], [0, -la + 0.02, 0], L * 0.74, L * 0.8, shade(legs, 0.75), 10); P['ll' + sd] = ll.upload();
    var ft = M(); ell(ft, 0, 0, 0, L * 0.72, L * 0.72, L * 0.72, boot, 8, 4); tub(ft, [0, 0.03, 0], [0, -0.03, 0], L * 0.78, L * 0.82, boot, 10, { cap: 1 });
    ell(ft, 0, -0.01, -0.012, L * 0.82, 0.07, L * 0.95, boot, 8, 4); ell(ft, 0, -0.025, 0.085, L * 0.86, 0.052, L * 1.45, boot, 10, 5);
    bxp(ft, -L * 0.82, -GAIT.ank, -L * 0.95, L * 0.82, -GAIT.ank + 0.022, L * 2.15, shade(boot, 0.45)); P['ft' + sd] = ft.upload(); });
  RIGS.cumP = { P: P, D: D, eyeY: B.eyeY, drip: 1 }; return RIGS.cumP; }
function drawCum(x, y, z, yaw, P, o) { // drawRig for Cumhead's own legs: pelvis yaw (P.py) apart from the chest, and ankles (P.ank)
  var rig = cumRigP(); o = o || {}; var D = rig.D, S = rig.P, fl = o.flash, tint = o.tint, al = o.alpha;
  if (!P.bp && !o.still) { var lt = KIT.t, br = Math.sin(lt * 1.7); P.lean += br * 0.012; P.sh[0][1] = (P.sh[0][1] || 0) + br * 0.018; P.sh[1][1] = (P.sh[1][1] || 0) + br * 0.018; P.hy += Math.sin(lt * 0.63) * 0.04; P.hp += Math.sin(lt * 0.9) * 0.015; }
  var bz = P.bodyZ || 0, hipY = D.lu + D.ll + P.y, body = MD(x + Math.sin(yaw) * bz, y + (P.bodyY || 0), z + Math.cos(yaw) * bz, yaw, P.bp || 0, P.br || 0, 1);
  function dr(mesh, m) { if (mesh) R3.draw(mesh, ATT, { m: m, flash: fl, tint: tint, alpha: al, warp: 0, rim: 1 }); }
  var pY = P.py !== undefined ? P.py : P.twist * 0.3, hips = MM(body, MD(0, hipY, 0, pY, 0, P.roll * 0.5)); dr(S.hips, hips);
  var tor = MM(hips, MD(0, 0.02, 0, P.twist, P.lean, P.roll * (P.py !== undefined ? -0.6 : 1))); dr(S.torso, tor);
  var head = MM(tor, MD(0, D.tor + D.neck, 0, P.hy, P.hp, P.hr)); dr(S.head, head);
  dr(S.drip, MM(head, MD(0.04, 0.95 + Math.sin(KIT.t * 3) * 0.03, -0.1, 0, 0, 0)));
  var out = { head: head };
  [0, 1].forEach(function (k) { var sd = k ? 'R' : 'L', sx = k ? -D.shW : D.shW, a = P.sh[k];
    var up = MM(tor, MD(sx, D.tor * 0.86, 0, a[2] || 0, -a[0], k ? -a[1] : a[1])); dr(S['au' + sd], up);
    var lo = MM(up, MD(0, -D.au, 0, 0, -P.el[k], 0)); dr(S['al' + sd], lo);
    if (k === 1) out.hand = MM(lo, MD(0, -D.al - D.hand * 0.7, 0.02, 0, Math.PI, 0)); else out.handL = MM(lo, MD(0, -D.al - D.hand * 0.7, 0.02, 0, Math.PI, 0));
    var hx = k ? -D.hipW : D.hipW, th = MM(hips, MD(hx, -0.02, 0, 0, -P.hip[k], P.abd ? P.abd[k] : 0)); dr(S['lu' + sd], th);
    var sh = MM(th, MD(0, -D.lu, 0, 0, P.kn[k], 0)); dr(S['ll' + sd], sh);
    var an = P.ank ? P.ank[k] : Math.max(-0.7, Math.min(0.7, P.hip[k] - P.kn[k])); dr(S['ft' + sd], MM(sh, MD(0, -GAIT.la, 0, 0, an, P.abd ? -P.abd[k] : 0))); });
  if (o.held && out.hand) dr(o.held, MM(out.hand, MD(0, 0, 0, 0, o.heldP || 0, 0)));
  if (!o.noShadow) R3.draw(RIGS.shadow, ATT, { m: MD(x, 0, z, 0, 0, 0, 1.1), soft: 1, lit: false, alpha: 0.85, warp: 0 });
  return out; }
function legIK(x, zf, h) { // the ankle x out to the side, zf forward and h below the hip joint: thigh swing, knee bend and the thigh rolled out (the rig rolls before it pitches)
  var a = RIGS.cumhead.D.lu, b = GAIT.la, d = Math.hypot(x, zf, h); d = Math.max(Math.abs(a - b) + 0.02, Math.min(a + b - 0.002, d));
  var kn = Math.PI - Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - d * d) / (2 * a * b)))), Y = a + b * Math.cos(kn), ro = Math.asin(Math.max(-0.9, Math.min(0.9, x / Y)));
  var th = Math.atan2(zf, h) - Math.atan2(-b * Math.sin(kn), Y * Math.cos(ro));
  return [th, kn, ro]; }
/* the walk's state moves with the game, not with the drawing */
var gaitStepP = stepPlayer;
stepPlayer = function (dt) { gaitStepP(dt); var p = P; if (!p) return;
  var v = Math.min(Math.hypot(p.vx || 0, p.vz || 0), (p.spd || 0) + 0.3), mA = Math.atan2(p.vx || 0, p.vz || 0), rel = wrapA(mA - p.a);
  var ly = 0; if (v > 0.35) { ly = Math.abs(rel) <= Math.PI / 2 + 0.25 ? rel : wrapA(rel - Math.PI); ly = Math.max(-0.95, Math.min(0.95, ly)); }
  p.gly = (p.gly || 0) + (ly - (p.gly || 0)) * Math.min(1, dt * 10);
  var vf = v, gv0 = p.gv || 0; p.gv = gv0 + (v - gv0) * Math.min(1, dt * 12); p.gvf = vf; if (v > 0.2) p.gmu = wrapA(rel - p.gly);
  var yr = wrapA(p.a - (p.gpa === undefined ? p.a : p.gpa)) / Math.max(dt, 1e-3); p.gpa = p.a;
  var av = Math.abs(vf), s = Math.max(0, Math.min(1, (av - 2.2) / 2.6)), sp = Math.max(0, Math.min(1, (av - 5.2) / 1.8)), cr = p.crouch ? 1 : 0, gd = p.guard ? 1 : 0;
  // update 149: the steps are timed like a person's (about 2.4 a second walking, 3.2 running, 3.6 sprinting) on his longer legs (drawn CUMS bigger),
  // and the time a foot spends on the ground is whatever his legs can reach at that pace: a walk always has a foot down, a run has a flight in it
  var hj = GAIT.hj - 0.08 - 0.02 * s - 0.02 * sp - 0.15 * cr - 0.04 * gd, h = hj - GAIT.ank, mx = 0.33 + GAIT.la - 0.005;
  var reachMax = 2 * Math.sqrt(Math.max(0.01, mx * mx - h * h)), vm = av / CUMS, rate = av < 1.8 ? 1.4 + av * 0.55 : av < 5 ? 2.4 + (av - 1.8) / 3.2 * 0.8 : 3.2 + Math.min(0.5, (av - 5) * 0.2);
  var L = Math.max(0.45, 2 * vm / rate), beta = Math.max(0.2, Math.min(0.62 - 0.3 * s - 0.06 * sp, reachMax / L)); p.gL = L; p.gp = { s: s, sp: sp, cr: cr, gd: gd, beta: beta, hj: hj };
  if (v < 0.35 && Math.abs(yr) > 1.5 && !p.atk && !p.fall) { p.gph = ((p.gph || 0) + dt * 1.4) % 1; p.gturn = Math.min(1, (p.gturn || 0) + dt * 6); } else { p.gph = ((p.gph || 0) + dt * (v / CUMS) / L) % 1; p.gturn = Math.max(0, (p.gturn || 0) - dt * 4); }
  var bank = Math.max(-0.3, Math.min(0.3, -yr * v * 0.022)); p.gbank = (p.gbank || 0) + (bank - (p.gbank || 0)) * Math.min(1, dt * 8);
  var acc = (p.gv - gv0) / Math.max(dt, 1e-3); p.gacc = (p.gacc || 0) + (Math.max(-0.35, Math.min(0.3, acc * 0.028)) - (p.gacc || 0)) * Math.min(1, dt * 6);
  if (!p.gfeet) p.gfeet = [0.07, -0.05]; };
function gaitPose(Q, p) {
  var G0 = p.gp, vf = p.gvf || 0, av = Math.abs(vf), amt = Math.max(Math.min(1, (p.gv || 0) / 0.7), (p.gturn || 0) * 0.6), s = G0.s, sp = G0.sp, cr = G0.cr, gd = G0.gd;
  var L = p.gL || 0.8, beta = G0.beta, reach = beta * (p.gturn > 0.3 && av < 0.5 ? 0.5 : L), dir = vf < -0.05 ? -1 : 1;
  var hj = G0.hj, f = 0, fwd = [0, 0];
  var mu = p.gmu || 0, cm = Math.cos(mu), sm = Math.sin(mu), back = cm < -0.3, D = cumRigP().D, U = [0, 0], SS = [0, 0], LF = [0, 0], PS = [0, 0];
  for (var k = 0; k < 2; k++) { // where each foot is along the stride, how high it is lifted and how the foot is tipped
    var u = ((p.gph || 0) + k * 0.5) % 1, S0, lift = 0, psi; U[k] = u;
    if (u < beta) { var q = u / beta; S0 = reach * (0.5 - q); f = Math.max(f, Math.sin(Math.PI * q));
      psi = q < 0.2 ? -0.28 * (1 - s) * (1 - q / 0.2) : q > 0.72 ? 0.65 * (q - 0.72) / 0.28 : 0; lift = Math.max(0, Math.sin(psi)) * 0.1; }
    else { var w = (u - beta) / (1 - beta), m0 = -reach * (1 - beta) / beta, w2 = w * w, w3 = w2 * w; // a Hermite curve: the foot leaves and lands at standstill on the ground, no skid
      S0 = (2 * w3 - 3 * w2 + 1) * (-reach / 2) + (w3 - 2 * w2 + w) * m0 + (-2 * w3 + 3 * w2) * (reach / 2) + (w3 - w2) * m0;
      lift = (0.07 + 0.1 * s + 0.06 * sp) * Math.sin(Math.PI * w) + 0.16 * s * Math.sin(Math.PI * Math.min(1, w * 1.5)); psi = 0.55 * (1 - w) - 0.25 * w; }
    if (back) psi *= 0.4; SS[k] = S0; LF[k] = lift; PS[k] = psi; fwd[k] = Math.cos(2 * Math.PI * u) * (back ? -1 : 1); }
  // the hips ride up over a walking step and sink into a running one
  var bob = amt * ((1 - s) * 0.026 * f - s * 0.05 * f + s * 0.02);
  Q.y = hj + bob - GAIT.hj;
  var osc = fwd[0] * (0.08 + 0.08 * s) * amt, co = Math.cos(osc), so = Math.sin(osc); Q.py = (p.gly || 0) - osc; Q.twist = -(p.gly || 0) + osc * 1.4; Q.hy = (Q.hy || 0) - osc * 0.5; Q.abd = [0, 0];
  for (k = 0; k < 2; k++) { var hx = k ? -D.hipW : D.hipW, bx = hx + sm * SS[k] * amt, bz = cm * SS[k] * amt + p.gfeet[k] * (1 - amt);
    var px = bx * co + bz * so, pz = -bx * so + bz * co; // into the turned pelvis, so turning the hips does not drag the planted foot
    var ik = legIK(px - hx, pz, hj + bob - GAIT.ank - LF[k] * amt); Q.hip[k] = ik[0]; Q.kn[k] = ik[1]; Q.abd[k] = ik[2]; Q.ank[k] = ik[0] - ik[1] + PS[k] * amt; }
  var st0 = U[0] < beta ? 1 : -1; Q.roll = st0 * 0.05 * (1 - s) * amt;
  Q.lean = 0.04 + 0.2 * s * (back ? 0.2 : 1) + 0.16 * sp + 0.32 * cr + 0.1 * gd + (p.gacc || 0) * (1 - cr); Q.hp = (Q.hp || 0) - Q.lean * 0.55;
  Q.br = (p.gbank || 0) * Math.min(1, av / 3);
  var A = (0.28 + 0.32 * s + 0.3 * sp) * amt;
  for (k = 0; k < 2; k++) { Q.sh[k][0] = -fwd[k] * A + 0.05 * s; Q.sh[k][1] = 0.1 + 0.08 * s; Q.el[k] = 0.22 + 1.0 * s + 0.25 * sp + Math.max(0, -fwd[k]) * 0.35 * amt; }
  if (amt < 0.05 && !cr) { Q.sh[0][0] = 0.05; Q.el[0] = 0.25; }
}
var gaitPoseOf = poseOf;
poseOf = function (e, isP) { var Q = gaitPoseOf(e, isP);
  if (!isP || e.hp <= 0 || e.atk || e.st === 'roll' || e.st === 'back' || e.st === 'down' || e.fall || (e.landT || 0) > 0 || e.hurtT > 0.3 || !e.gfeet || !e.gp) return Q;
  var keepArms = e.guard || e.st === 'drink', sh = [Q.sh[0].slice(), Q.sh[1].slice()], el = Q.el.slice(), held = [Q.sh[1].slice(), Q.el[1]];
  Q.ank = [0, 0]; Q.twist = 0; Q.roll = 0; Q.lean = 0; Q.hy = 0; Q.hp = 0; gaitPose(Q, e);
  if (keepArms) { Q.sh = sh; Q.el = el; } else { Q.sh[1] = [0.35 + Q.sh[1][0] * 0.45, 0.2, 0.15]; Q.el[1] = 0.5 + Q.el[1] * 0.4; if (kindOf().two) { Q.sh[0] = [0.7, 0.5, 0.6]; Q.el[0] = 1.1; } }
  return Q; };

/* update 148: the moves taken from an Elden Ring reference video (his link: unarmed movement) -
   the dive roll, the crouched backstep hop, the squat before a jump, the tucked jump and the crouched landing,
   the skid when he stops from a run or a sprint, being thrown by a big hit, and drinking from the flask in steps */
function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }
function tumble(Q, ang, c) { Q.bp = ang; Q.bodyY = c - c * Math.cos(ang); Q.bodyZ = -c * Math.sin(ang); } // turn the whole body round a point c up from the feet
function poseRollER(Q, e) { var k = 1 - e.roll / (e.rollLen || 0.6), hv = e.rollLen > 0.75, dive = hv ? 0.9 : 1.35, c = 0.32;
  if (k < 0.18) { var a = sm(0, 0.18, k); tumble(Q, a * dive, c); Q.bodyY += 0.12 * Math.sin(a * Math.PI); Q.hip = [lerp(0.3, -0.2, a), lerp(0.2, -0.5, a)]; Q.kn = [lerp(0.6, 0.3, a), lerp(0.4, 0.5, a)]; Q.sh[0] = [lerp(0.4, 1.6, a), 0.3]; Q.sh[1] = [lerp(0.4, 1.4, a), 0.3, 0.2]; Q.el = [0.6, 0.6]; Q.y = -0.12 * a; }
  else if (k < 0.56) { var b = sm(0.18, 0.56, k); tumble(Q, lerp(dive, Math.PI * 2, b), c * (1 - 0.3 * Math.sin(b * Math.PI))); Q.y = -0.3; Q.hip = [1.5, 1.4]; Q.kn = [2.1, 2.1]; Q.sh[0] = [1.2, 0.2]; Q.sh[1] = [1.1, 0.2, 0.2]; Q.el = [2.0, 2.0]; Q.hp = 0.5; }
  else if (k < 0.78) { var d = sm(0.56, 0.78, k); Q.bp = 0; Q.y = lerp(-0.34, -0.22, d); Q.hip = [lerp(1.3, 0.9, d), lerp(0.4, 0.2, d)]; Q.kn = [lerp(1.9, 1.3, d), lerp(1.2, 0.7, d)]; Q.lean = lerp(0.6, 0.35, d); Q.sh[0] = [0.5, 0.5]; Q.sh[1] = [0.6, 0.4, 0.2]; Q.el = [0.9, 0.8]; Q.hp = -0.3; }
  else { var r = sm(0.78, 1, k); Q.bp = 0; Q.y = lerp(-0.22, -0.04, r); Q.hip = [lerp(0.9, 0.15, r), lerp(0.2, 0.05, r)]; Q.kn = [lerp(1.3, 0.2, r), lerp(0.7, 0.15, r)]; Q.lean = lerp(0.35, 0.08, r); Q.sh[0] = [lerp(0.5, 0.1, r), lerp(0.5, 0.15, r)]; Q.el = [lerp(0.9, 0.3, r), lerp(0.8, 0.5, r)]; }
  if (hv && k > 0.56 && k < 0.85) { Q.y -= 0.05; Q.lean += 0.12; } // the fat roll flops
  Q.ank = [Q.hip[0] - Q.kn[0], Q.hip[1] - Q.kn[1]]; }
function poseBackER(Q, e) { var k = 1 - e.roll / (e.rollLen || 0.55), up = sm(0, 0.12, k) * (1 - sm(0.62, 1, k)), air = k > 0.12 && k < 0.5 ? Math.sin((k - 0.12) / 0.38 * Math.PI) : 0;
  Q.bodyY = 0.14 * air; Q.y = -0.3 * up - 0.04; Q.lean = 0.38 * up + 0.05; Q.hp = -0.35 * up;
  Q.hip = [lerp(0.1, 1.0, up), lerp(0.05, 0.75, up)]; Q.kn = [lerp(0.15, 1.5, up), lerp(0.1, 1.2, up)]; Q.abd = [0.32 * up, -0.32 * up];
  Q.sh[0] = [lerp(0.1, 0.25, up), lerp(0.1, 1.25, up)]; Q.sh[1] = [lerp(0.4, 0.35, up), lerp(0.2, 1.1, up), 0.2]; Q.el = [lerp(0.3, 0.45, up), lerp(0.5, 0.45, up)];
  Q.ank = [Q.hip[0] - Q.kn[0], Q.hip[1] - Q.kn[1]]; }
function poseDrinkER(Q, e) { var t = 1.25 - (e.drinkT || 0), reach = sm(0, 0.25, t), lift = sm(0.25, 0.45, t), down = sm(0.9, 1.2, t);
  var u = lift * (1 - down); Q.sh[0] = [lerp(lerp(0.1, -0.3, reach), 2.5, u), lerp(0.15, -0.15, u), 0.25 * u]; Q.el[0] = lerp(lerp(0.3, 0.9, reach), 1.9, u);
  Q.hp = -0.55 * sm(0.45, 0.6, t) * (1 - down); Q.lean = -0.08 * u; }
var p148 = poseOf;
poseOf = function (e, isP) { var Q = p148(e, isP); if (!isP || e.hp <= 0) return Q;
  if (e.st === 'roll' && !e.qs && !e.atk) { Q = pose0(); poseRollER(Q, e); return Q; }
  if (e.st === 'back' && !e.atk) { Q = pose0(); poseBackER(Q, e); return Q; }
  if (e.st === 'drink') poseDrinkER(Q, e);
  if (e.jsq > 0 && !e.atk) { var q = 1 - e.jsq / 0.1; Q.y = -0.16 * q; Q.kn = [0.9 * q + 0.1, 0.8 * q + 0.1]; Q.hip = [0.6 * q, 0.5 * q]; Q.lean = 0.3 * q; Q.sh[0] = [-0.5 * q, 0.2]; Q.sh[1] = [-0.3 * q, 0.2, 0.1]; Q.ank = [Q.hip[0] - Q.kn[0], Q.hip[1] - Q.kn[1]]; }
  else if (e.fall && e.jump && !e.atk && e.st !== 'roll' && e.st !== 'back') { var up = e.vy > 0 ? 1 : Math.max(0, 1 + e.vy / 6);
    Q.hip = [lerp(0.5, 1.35, up), lerp(-0.1, 0.1, up)]; Q.kn = [lerp(0.8, 1.7, up), lerp(0.5, 1.2, up)]; Q.sh[0] = [0.4, 0.9]; Q.sh[1] = [0.3, 0.8, 0.2]; Q.el = [0.6, 0.6]; Q.lean = 0.12; Q.ank = [Q.hip[0] - Q.kn[0] + 0.3, Q.hip[1] - Q.kn[1] + 0.3]; }
  else if (e.landT > 0 && !e.atk && e.st !== 'down') { var lk = Math.min(1, e.landT / 0.22); Q.y = -0.3 * lk; Q.kn = [1.3 * lk, 1.15 * lk]; Q.hip = [0.95 * lk, 0.8 * lk]; Q.lean = 0.35 * lk; Q.sh[0] = [0.3, 0.6 * lk]; Q.ank = [Q.hip[0] - Q.kn[0], Q.hip[1] - Q.kn[1]]; }
  if (e.st === 'down') { var dk = 1 - e.downT / e.downLen; if (dk < 0.32) { var f = dk / 0.32, back = e.hitDir !== 'b' ? -1 : 1; Q.bodyY = 0.7 * Math.sin(f * Math.PI); Q.bp = back * 1.4 * sm(0, 1, f); Q.hip = [0.7, 0.3]; Q.kn = [0.9, 0.5]; Q.sh[0] = [1.3, 0.9]; Q.sh[1] = [1.1, 0.9, 0.2]; Q.el = [0.4, 0.4]; } }
  // the skid out of a run or a sprint: lean back, front foot braced, the feet slide
  var sk = e.gskid || 0; if (sk > 0.01 && !e.atk && e.st !== 'roll' && e.st !== 'back' && !e.fall) { var a1 = legIK(0, 0.34, 0.5), a2 = legIK(0, -0.22, 0.52);
    Q.hip = [lerp(Q.hip[0], a1[0], sk), lerp(Q.hip[1], a2[0], sk)]; Q.kn = [lerp(Q.kn[0], a1[1], sk), lerp(Q.kn[1], a2[1], sk)]; if (Q.abd) Q.abd = [Q.abd[0] * (1 - sk), Q.abd[1] * (1 - sk)];
    Q.ank = [lerp(Q.ank ? Q.ank[0] : 0, a1[0] - a1[1] - 0.25, sk), lerp(Q.ank ? Q.ank[1] : 0, a2[0] - a2[1] + 0.2, sk)]; Q.y = lerp(Q.y, -0.08, sk); Q.lean = lerp(Q.lean, -0.32, sk); Q.hp = lerp(Q.hp, 0.15, sk);
    Q.sh[0] = [lerp(Q.sh[0][0], 0.6, sk), lerp(Q.sh[0][1], 0.4, sk)]; Q.el[0] = lerp(Q.el[0], 0.7, sk); Q.py = (Q.py || 0) * (1 - sk); Q.twist = (Q.twist || 0) * (1 - sk); }
  return Q; };
var s148 = stepPlayer;
stepPlayer = function (dt) { s148(dt); var p = P; if (!p) return; var mv = KIT.stick(0), noIn = Math.hypot(mv.x, mv.y) < 0.15, v = Math.hypot(p.vx || 0, p.vz || 0);
  var want = noIn && !p.atk && !p.fall && p.st !== 'roll' && p.st !== 'back' && (p.skidOn || v > 3.6) && v > 0.6 ? 1 : 0; p.skidOn = want && v > 0.6;
  if (want && !p.gskid) sfx.noise(0.25, 0.05, 300);
  p.gskid = (p.gskid || 0) + (want - (p.gskid || 0)) * Math.min(1, dt * (want ? 16 : 7)); if (p.gskid < 0.02) p.gskid = 0; };
