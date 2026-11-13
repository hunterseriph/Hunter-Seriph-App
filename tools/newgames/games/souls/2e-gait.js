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
  var hipY = D.lu + D.ll + P.y, body = MD(x, y + (P.bodyY || 0), z, yaw, P.bp || 0, P.br || 0, 1);
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
  var beta = 0.6 - 0.24 * s - 0.04 * sp, hj = GAIT.hj - 0.04 - 0.06 * s - 0.02 * sp - 0.17 * cr - 0.05 * gd, h = hj - GAIT.ank, mx = RIGS.cumhead.D.lu + GAIT.la - 0.005;
  var reachMax = 2 * Math.sqrt(Math.max(0.01, mx * mx - h * h)) * 0.92, L = Math.max(0.5, Math.min(0.55 + 0.3 * av, reachMax / beta)); p.gL = L; p.gp = { s: s, sp: sp, cr: cr, gd: gd, beta: beta, hj: hj };
  if (v < 0.35 && Math.abs(yr) > 1.5 && !p.atk && !p.fall) { p.gph = ((p.gph || 0) + dt * 1.4) % 1; p.gturn = Math.min(1, (p.gturn || 0) + dt * 6); } else { p.gph = ((p.gph || 0) + dt * v / L) % 1; p.gturn = Math.max(0, (p.gturn || 0) - dt * 4); }
  var bank = Math.max(-0.3, Math.min(0.3, -yr * v * 0.022)); p.gbank = (p.gbank || 0) + (bank - (p.gbank || 0)) * Math.min(1, dt * 8);
  var acc = (p.gv - gv0) / Math.max(dt, 1e-3); p.gacc = (p.gacc || 0) + (Math.max(-0.35, Math.min(0.3, acc * 0.028)) - (p.gacc || 0)) * Math.min(1, dt * 6);
  if (!p.gfeet) p.gfeet = [0.07, -0.05]; };
function gaitPose(Q, p) {
  var G0 = p.gp, vf = p.gvf || 0, av = Math.abs(vf), amt = Math.max(Math.min(1, (p.gv || 0) / 0.7), (p.gturn || 0) * 0.6), s = G0.s, sp = G0.sp, cr = G0.cr, gd = G0.gd;
  var L = p.gL || 0.8, beta = G0.beta, reach = beta * (p.gturn > 0.3 && av < 0.5 ? 0.5 : L), dir = vf < -0.05 ? -1 : 1;
  var hj = G0.hj, f = 0, fwd = [0, 0];
  var mu = p.gmu || 0, cm = Math.cos(mu), sm = Math.sin(mu), back = cm < -0.3, D = RIGS.cumhead.D, U = [0, 0], SS = [0, 0], LF = [0, 0], PS = [0, 0];
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
