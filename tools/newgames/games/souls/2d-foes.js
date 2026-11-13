/* =====================================================================================================
   DARK LOADS update 146: foes that fight like Elden Ring's (his ask: it did not feel like Elden Ring).
   They notice you and square up, circle you at a distance, walk backwards, take turns (two attack at
   once at most), mix their moves: quick strings, delayed swings that hang at the top before they
   come down, low sweeps you can jump, gap-closing lunges from range, ground slams; they punish you
   for drinking in front of them, the quick ones sidestep your swings, and a broken stance leaves
   them open to a critical hit (RB in front of them).
   ===================================================================================================== */
var FMOVES = { // an = pose, wind = wind-up, hold = up to this much extra wait at the top (a delayed attack), act = hitting window,
  // rec = recovery, dmg x the foe's damage, reach, arc (half angle), lunge m/s while it hits, track = how fast it turns to you in the wind-up,
  // next = [follow-up, chance], far = a gap closer used from range, low = a sweep you can jump, heavy = knocks you down, ring = a ground slam
  jab: { an: 'punch', wind: 0.34, act: 0.12, rec: 0.4, dmg: 0.6, reach: 1.5, arc: 0.9, lunge: 2.6, track: 6, next: ['jab2', 0.7] },
  jab2: { an: 'punch', wind: 0.24, act: 0.12, rec: 0.45, dmg: 0.6, reach: 1.5, arc: 0.9, lunge: 2.6, track: 5, next: ['hook', 0.55] },
  hook: { an: 'swing', wind: 0.32, hold: 0.3, act: 0.15, rec: 0.75, dmg: 1.05, reach: 1.6, arc: 1.3, lunge: 3, track: 3 },
  lungepunch: { an: 'punch', wind: 0.5, act: 0.32, rec: 0.75, dmg: 1.15, reach: 1.6, arc: 0.8, lunge: 9, track: 4, far: 1 },
  haymaker: { an: 'swing', wind: 0.65, hold: 0.7, act: 0.15, rec: 0.95, dmg: 1.45, reach: 1.7, arc: 1.1, lunge: 3.6, track: 2.6, heavy: 1 },
  cleave: { an: 'swing', wind: 0.6, hold: 0.55, act: 0.15, rec: 0.8, dmg: 0.95, reach: 2.2, arc: 1.0, lunge: 2.6, track: 3, next: ['cleave2', 0.45] },
  cleave2: { an: 'swing', wind: 0.42, act: 0.15, rec: 0.95, dmg: 0.95, reach: 2.2, arc: 1.0, lunge: 3, track: 2.4 },
  sweep: { an: 'sweep', wind: 0.55, hold: 0.25, act: 0.2, rec: 0.85, dmg: 0.8, reach: 2.4, arc: 2.2, lunge: 1.5, track: 2, low: 1 },
  overhead: { an: 'slam', wind: 0.85, hold: 0.45, act: 0.12, rec: 1.1, dmg: 1.35, reach: 2.2, arc: 0.7, lunge: 2.2, track: 2.2, heavy: 1 },
  stab: { an: 'punch', wind: 0.36, act: 0.12, rec: 0.5, dmg: 0.8, reach: 1.7, arc: 0.6, lunge: 4, track: 5 },
  throw: { an: 'throw', wind: 0.7, hold: 0.3, act: 0.1, rec: 0.6, dmg: 1, shot: 1, track: 4, far: 1 },
  flurry: { an: 'punch', wind: 0.4, act: 0.66, multi: 0.22, rec: 0.6, dmg: 0.42, reach: 1.6, arc: 1.0, lunge: 3.6, track: 4 },
  hopkick: { an: 'leap', wind: 0.5, act: 0.36, rec: 0.7, dmg: 1.05, reach: 1.6, arc: 1.0, lunge: 7.5, track: 3, far: 1 },
  slam: { an: 'slam', wind: 0.9, hold: 0.35, act: 0.12, rec: 1.0, dmg: 1.15, ring: 2.6, track: 2, heavy: 1, next: ['slam2', 0.35] },
  slam2: { an: 'slam', wind: 0.55, act: 0.12, rec: 1.2, dmg: 1.15, ring: 3.0, track: 1.5, heavy: 1 }
};
var FOEMV = { gimp: ['jab', 'jab', 'lungepunch', 'haymaker'], butcher: ['cleave', 'cleave', 'sweep', 'overhead'], pusher: ['throw', 'throw', 'stab'],
  clown: ['flurry', 'jab', 'hopkick'], strongman: ['slam', 'sweep', 'overhead'], acrobat: ['hopkick', 'jab', 'flurry'] };
var FDODGE = { acrobat: 0.5, gimp: 0.18, clown: 0.2 };
function fAng(f) { return Math.atan2(P.x - f.x, P.z - f.z); }
function fWalk(f, ang, v, dt) { var ox = f.x, oz = f.z; f.x += Math.sin(ang) * v * dt; f.z += Math.cos(ang) * v * dt; collide(f, 0.4, 'f'); var nh = floorAt(f.x, f.z); if (nh < f.y - 0.6) { f.x = ox; f.z = oz; } f.spd = Math.hypot(f.x - ox, f.z - oz) / dt; f.ph += f.spd * dt * 2; }
function fAttackers() { var n = 0; FOE.forEach(function (o) { if (o.hp > 0 && (o.st === 'wind' || o.st === 'strike')) n++; }); return n; }
function fPick(f, dist, far) { var l = (FOEMV[f.d.id] || ['jab']).filter(function (m) { var M0 = FMOVES[m]; return far ? M0.far : (!M0.far || dist < 2.4); }); if (!l.length) return null; return l[Math.floor(Math.random() * l.length)]; }
function fStart(f, m) { var M0 = FMOVES[m]; f.mv = m; f.st = 'wind'; f.t = 0; f.wl = M0.wind + Math.random() * (M0.hold || 0); f.hit = 0; f.jy = 0; }
function stepFoes(dt) {
  FOE.forEach(function (f) {
    var d = f.d, dx = P.x - f.x, dz = P.z - f.z, dist = Math.hypot(dx, dz); f.t += dt; f.hurt = Math.max(0, f.hurt - dt); f.cd = Math.max(0, f.cd - dt); f.dodgeInv = Math.max(0, (f.dodgeInv || 0) - dt); f.spd = 0;
    if (f.st === 'dead') return;
    var sees = dist < 14 && Math.abs(P.y - f.y) < 3 && lineClear(f.x, f.z, P.x, P.z) && P.hp > 0, ang = fAng(f), M0 = f.mv && FMOVES[f.mv];
    if (f.st === 'stagger') { f.mv = null; f.jy = 0; if (f.t > 0.85) { f.st = 'strafe'; f.t = 0; f.sT = 0.4 + Math.random() * 0.6; f.cd = 0.4; } }
    else if (f.st === 'alert') { f.a = turnTo(f.a, ang, dt * 6); if (f.t > 0.45) { f.st = 'chase'; f.t = 0; } }
    else if (f.st === 'dodge') { fWalk(f, f.dA, 6.5 * (1 - f.t / 0.38), dt); f.a = turnTo(f.a, ang, dt * 8); if (f.t > 0.38) { f.st = 'strafe'; f.t = 0; f.sT = 0.5; f.cd = 0.15; } }
    else if (f.st === 'wind') { if (!M0) { f.st = 'chase'; return; } f.a = turnTo(f.a, ang, dt * M0.track); if (M0.an === 'leap') f.jy = 0;
      if (M0.lunge && f.t < f.wl * 0.6 && dist > 1.6) fWalk(f, f.a, M0.lunge * 0.12, dt);
      if (f.t >= f.wl) { f.st = 'strike'; f.t = 0; f.hitA = f.a;
        if (M0.shot) { SHOTS.push({ x: f.x, y: f.y + 1.5, z: f.z, vx: Math.sin(f.a) * 10, vy: 3, vz: Math.cos(f.a) * 10, g: 9, dmg: d.dmg * M0.dmg, t: 3 }); sfx.play('shoot'); f.hit = 1; }
        else sfx.tone('triangle', M0.heavy ? 150 : 220, 80, M0.heavy ? 0.18 : 0.1, 0.06); } }
    else if (f.st === 'strike') { if (!M0) { f.st = 'chase'; return; } f.a = turnTo(f.a, ang, dt * 0.8);
      if (M0.lunge && f.t < M0.act && dist > 1.0) fWalk(f, f.a, M0.lunge, dt);
      if (M0.an === 'leap') f.jy = Math.sin(Math.min(1, f.t / M0.act) * Math.PI) * 1.1;
      if (M0.multi && f.t - (f.mLast || 0) >= M0.multi) { f.mLast = f.t; f.hit = 0; }
      if (f.t < M0.act && !f.hit) { var dy = Math.abs(P.y - f.y);
        if (M0.ring) { if (f.t >= M0.act * 0.5) { f.hit = 1; KIT.shake(6); sfx.play('boom'); var cx = f.x + Math.sin(f.a) * 1.0, cz = f.z + Math.cos(f.a) * 1.0; FX.push({ k: 'ring', x: cx, y: f.y + 0.1, z: cz, r: M0.ring, t: 0.4 }); if (Math.hypot(P.x - cx, P.z - cz) < M0.ring && P.st !== 'roll') { P.nextTier = 3; hurtPlayer(d.dmg * M0.dmg, f.x, f.z, true); } } }
        else { var rel = Math.abs(Math.atan2(Math.sin(ang - f.a), Math.cos(ang - f.a))); if (dist < M0.reach + 0.45 && rel < M0.arc && dy < 1.5) { f.hit = 1; if (M0.low) P.lowHit = 1; if (M0.heavy) P.nextTier = 3; var hp0 = P.hp; hurtPlayer(d.dmg * M0.dmg, f.x, f.z); P.lowHit = 0; P.nextTier = undefined; if (P.hp < hp0) KIT.shake(M0.heavy ? 6 : 3); } } }
      if (f.t >= M0.act) { f.jy = 0; var nx = M0.next; if (nx && Math.random() < nx[1] && P.hp > 0) fStart(f, nx[0]); else { f.st = 'rec'; f.t = 0; } } }
    else if (f.st === 'rec') { var rl = (M0 && M0.rec) || 0.7; if (f.t > rl) { f.mv = null; f.st = 'strafe'; f.t = 0; f.sT = 0.4 + Math.random() * 1.4; f.sd = Math.random() < 0.5 ? -1 : 1; f.cd = 0.3 + Math.random() * 0.9; } }
    else if (f.st === 'chase' || f.st === 'strafe') {
      if (!sees && dist > 20) { f.st = 'idle'; f.mv = null; }
      else {
        var turn = fAttackers() < 2, closeR = (FMOVES[(FOEMV[d.id] || ['jab'])[0]].reach || 1.6) + 0.2, ranged = d.swing === 'throw';
        // punish a swig from the flask, sidestep a swing
        if (P.st === 'drink' && dist < 6.5 && f.cd < 0.6) { var pm = dist > 2.6 ? fPick(f, dist, true) : fPick(f, dist, false); if (pm) { fStart(f, pm); f.wl = FMOVES[pm].wind; return; } }
        if (P.atk && P.atk.t < 0.12 && dist < 2.8 && !f.dodged && Math.random() < (FDODGE[d.id] || 0)) { f.dodged = 1; f.st = 'dodge'; f.t = 0; f.dodgeInv = 0.3; f.dA = ang + Math.PI + (Math.random() < 0.5 ? 1.3 : -1.3); return; }
        if (!P.atk) f.dodged = 0;
        if (f.st === 'chase') { f.a = turnTo(f.a, ang, dt * 6);
          if (ranged) { if (dist > 9) fWalk(f, f.a, d.spd, dt); else if (dist < 3.5) fWalk(f, f.a + Math.PI, d.spd * 0.7, dt); if (f.cd <= 0 && sees && turn && dist < 11) fStart(f, dist < 2.2 ? 'stab' : 'throw'); }
          else if (dist > 7) fWalk(f, f.a, d.spd * 1.15, dt);
          else if (dist > 3.4 && f.cd <= 0 && turn && Math.random() < dt * 1.2) { var fm = fPick(f, dist, true); if (fm) fStart(f, fm); else fWalk(f, f.a, d.spd, dt); }
          else if (dist > closeR) { if (turn || dist > 4.5) fWalk(f, f.a, d.spd, dt); else { f.st = 'strafe'; f.t = 0; f.sT = 0.6 + Math.random(); f.sd = Math.random() < 0.5 ? -1 : 1; } }
          else if (f.cd <= 0 && turn) { var cm = fPick(f, dist, false); if (cm) fStart(f, cm); }
          else { f.st = 'strafe'; f.t = 0; f.sT = 0.5 + Math.random() * 0.8; f.sd = Math.random() < 0.5 ? -1 : 1; } }
        else { // strafe: circle you, facing you, sometimes backing off
          f.a = turnTo(f.a, ang, dt * 7); var want = 3.2, side = f.a + f.sd * Math.PI / 2, back = dist < want - 0.8 ? -0.6 : dist > want + 1 ? 0.6 : 0;
          var mx = Math.sin(side) + Math.sin(f.a) * back, mz = Math.cos(side) + Math.cos(f.a) * back, ma = Math.atan2(mx, mz); fWalk(f, ma, d.spd * 0.5, dt);
          if (f.t > f.sT) { f.st = 'chase'; f.t = 0; } } } }
    else { if (sees) { f.st = 'alert'; f.t = 0; } else { var hd = Math.hypot(f.hx - f.x, f.hz - f.z); if (hd > 0.5) { f.a = turnTo(f.a, Math.atan2(f.hx - f.x, f.hz - f.z), dt * 4); fWalk(f, f.a, 1.2, dt); } } }
    f.y += (floorAt(f.x, f.z) - f.y) * Math.min(1, dt * 12);
    FOE.forEach(function (o) { if (o === f || o.hp <= 0) return; var ex = f.x - o.x, ez = f.z - o.z, e = Math.hypot(ex, ez); if (e < 0.8 && e > 0) { f.x += ex / e * (0.8 - e) * 0.5; f.z += ez / e * (0.8 - e) * 0.5; } });
  });
  SHOTS.forEach(function (s) { s.t -= dt; s.vy -= (s.g || 0) * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; if (s.y < floorAt(s.x, s.z) || tk(tileOf(s.x), tileOf(s.z)) === 1) { s.t = 0; FX.push({ k: 'spark', x: s.x, y: s.y, z: s.z, t: 0.3, col: '#ff4a8a' }); } if (Math.hypot(s.x - P.x, s.z - P.z) < 0.6 && s.y > P.y && s.y < P.y + 2) { hurtPlayer(s.dmg, s.x - s.vx, s.z - s.vz, s.ub); s.t = 0; } });
  SHOTS = SHOTS.filter(function (s) { return s.t > 0; });
}
/* hits on foes: a sidestep dodges, a broken stance opens them to a critical */
var fdHurt = hurtFoe;
hurtFoe = function (f, dmg, heavy, pk) { if (f.dodgeInv > 0) return; var was = f.st; fdHurt(f, dmg, heavy, pk); if (f.hp <= 0) return;
  if (f.st === 'stagger' && was !== 'stagger' && !f.parried) { f.parried = 1.4; f.t = -0.6; f.mv = null; f.jy = 0; POP.push({ x: f.x, y: f.y + 2.5, z: f.z, s: 'STANCE BROKEN', t: 1, col: '#ffe36a' }); sfx.tone('square', 500, 260, 0.12, 0.05); }
  else if (f.st === 'idle' || f.st === 'walk' || f.st === 'alert') f.st = 'chase'; };
/* foe poses for their moves */
var fdPose = poseOf;
poseOf = function (e, isP) { if (isP || e.boss || !e.mv || (e.st !== 'wind' && e.st !== 'strike')) { var Q0 = fdPose(e, isP); if (!isP && !e.boss && e.st === 'alert') { Q0.lean = -0.25; Q0.hp = -0.2; } if (!isP && !e.boss && e.st === 'dodge') { Q0.lean = -0.35; Q0.y = -0.15; Q0.kn = [0.8, 0.4]; } return Q0; }
  var Q = pose0(), M0 = FMOVES[e.mv], k = e.st === 'wind' ? Math.min(1, e.t / Math.max(0.01, M0.wind)) : 1, s = e.st === 'strike' ? Math.min(1, e.t / Math.max(0.01, M0.act)) : 0;
  if (M0.an === 'punch') posePunch(Q, e.st === 'wind' ? k * 0.39 : 0.4 + s * 0.6);
  else if (M0.an === 'swing' || M0.an === 'throw') poseSwing(Q, e.st === 'wind' ? k * 0.34 : 0.35 + s * 0.65);
  else if (M0.an === 'sweep') { poseSwing(Q, e.st === 'wind' ? k * 0.34 : 0.35 + s * 0.65); Q.y = -0.3; Q.kn = [0.9, 0.9]; Q.hip = [0.7, 0.7]; Q.lean = 0.35; }
  else if (M0.an === 'slam') { Q.sh[0] = [2.8 * (e.st === 'wind' ? k : 1 - s), 0.3, 0]; Q.sh[1] = [2.8 * (e.st === 'wind' ? k : 1 - s), 0.3, 0]; Q.el = [0.4, 0.4]; Q.lean = e.st === 'wind' ? -0.2 * k : 0.55 * s; if (e.st === 'strike') { Q.kn = [0.6, 0.6]; Q.y = -0.15; } }
  else if (M0.an === 'leap') { Q.hip = [1.0, 0.3]; Q.kn = [1.4, 0.6]; Q.lean = e.st === 'wind' ? 0.3 * k : -0.3; if (e.st === 'strike') { Q.hip = [-0.2, 1.4]; Q.kn = [0.1, 0.2]; } }
  if (e.st === 'wind' && e.t > M0.wind) Q.lean += Math.sin(G.t * 30) * 0.02; // holding it at the top
  return Q; };
