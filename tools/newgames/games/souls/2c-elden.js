/* =====================================================================================================
   DARK LOADS update 145: Elden Ring style movement and combat (his ask).
   The rules and numbers follow "ELDEN RING Combat Rewrite" by Funny-Bones and contributors
   (https://github.com/Funny-Bones/ELDEN-RING-Combat-Rewrite, MIT licence, Copyright (c) 2026 Funny-Bones
   and contributors: permission is granted to use, copy, modify and distribute; the notice is kept here).
   Its frame data is not public, so timings are its documented estimates turned into seconds.
   - Dodge button: let go within 0.33 s = roll (or backstep with no direction), hold longer = sprint.
     Sprinting only costs stamina while something is fighting you.
   - Roll by weight: light weapons roll far with long i-frames, heavy ones a slow fat roll.
     Locked on, you roll in four directions round the foe and keep facing it.
   - Jump (LT / RT, F, the JUMP button): clears ground slams and shock rings; jump attacks:
     X a falling swing, Y a plunging smash that lands with a shock ring.
   - Rolling and backstep attacks (X straight out of a roll), then the combo carries on from its second hit.
   - Charged heavy: hold Y to charge, let go early for the plain one. Guard counter: Y just after blocking a hit.
   - Guard covers 80 degrees either side. Hits now land as a flinch, a stagger, a big stagger or a knockdown
     (on the floor you cannot be hurt; tap A to roll out early). Hit-stop is halved.
   - Crouch (L3, Ctrl, the CROUCH button): sneak; foes only notice you close up (very close from behind).
   - One buffer slot, the newest press wins. Turning: run 1080 deg/s, sprint 480, locked on 720, mid move 360.
   ===================================================================================================== */
var ER = { tap: 0.33, regen: 45, sprintDrain: 11, roll: 12, back: 8, jump: 10, acc: 26, dec: 32, walk: 0.55, arc: 1.396, gc: 0.66, jumpV: 6.6, lowH: 0.35, lockBreak: 22,
  turn: { run: 18.8, sprint: 8.4, lock: 12.6, act: 6.3 } };
var LOADS = { // equip load tiers by weapon kind
  light: { n: 'LIGHT', len: 0.52, i0: 0.04, i1: 0.55, sp: 8.2, cost: 0.9 },
  mid: { n: 'MEDIUM', len: 0.62, i0: 0.05, i1: 0.46, sp: 6.6, cost: 1 },
  heavy: { n: 'HEAVY', len: 0.84, i0: 0.06, i1: 0.3, sp: 4.0, cost: 1.3 } };
function loadOf(w) { var c = WEAPONS[w || SV.wpn].c; return c === 'dagger' || c === 'fist' ? 'light' : c === 'heavy' || c === 'axe' ? 'heavy' : 'mid'; }
MOVES.rollatk = { wind: 0.1, act: 0.12, rec: 0.3, lunge: 4.4, arc: 0.7, reach: 1.05, pose: 'stab' };
MOVES.backatk = { wind: 0.08, act: 0.12, rec: 0.3, lunge: 3.2, arc: 1.2, pose: 'slashR' };
MOVES.crouchatk = { wind: 0.12, act: 0.1, rec: 0.26, lunge: 2.4, arc: 0.5, reach: 1.1, pose: 'stab' };
MOVES.jl = { wind: 0.12, act: 0.18, rec: 0.24, lunge: 0, arc: 1.3, dmg: 1.2, pose: 'over' };
MOVES.jh = { wind: 0.18, act: 0.12, rec: 0.5, lunge: 0, arc: 3.2, reach: 1.15, aoe: 1, pose: 'slam' };
function erIn() { // jump and crouch: keyboard, touch button, or LT / RT and the left stick click on a controller
  var gp = KIT.gamepad, b = function (n) { return !!(gp && gp.buttons[n] && gp.buttons[n].pressed); };
  var j = KIT.held('j') || b(6) || b(7), c = KIT.held('cr') || b(10), o = { jump: j && !ER.jw, crouch: c && !ER.cw }; ER.jw = j; ER.cw = c; return o; }
function inCombat() { if (G.inArena && BOSS && BOSS.hp > 0) return true;
  for (var i = 0; i < FOE.length; i++) { var f = FOE[i]; if (f.hp > 0 && f.st !== 'idle' && f.st !== 'walk' && f.st !== 'dead' && Math.hypot(f.x - P.x, f.z - P.z) < 20) return true; } return false; }
function jump() { var p = P; p.sta -= ER.jump; p.staWait = 0.45; p.fall = 1; p.jump = 1; p.vy = ER.jumpV; p.fy0 = p.y; p.crouch = 0; sfx.noise(0.08, 0.05, 900); sfx.tone('triangle', 160, 240, 0.08, 0.04); }
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0), W0 = WEAPONS[SV.wpn], ei = erIn(); p.t += dt; p.inv = Math.max(0, p.inv - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.staWait = Math.max(0, (p.staWait || 0) - dt);
  p.gcT = Math.max(0, (p.gcT || 0) - dt); p.landT = Math.max(0, (p.landT || 0) - dt); p.vx = p.vx || 0; p.vz = p.vz || 0; if (p.afterRoll) { p.afterRoll.t -= dt; if (p.afterRoll.t <= 0) p.afterRoll = null; }
  var f = camFwd(), r = [-f[1], f[0]], wx = (-mv.y) * f[0] + mv.x * r[0], wz = (-mv.y) * f[1] + mv.x * r[1], wl = Math.min(1, Math.hypot(wx, wz)), wa = Math.atan2(wx, wz);
  var locked = LOCK && LOCK.hp > 0, lockA = locked ? Math.atan2(LOCK.x - p.x, LOCK.z - p.z) : 0;
  // one buffer slot, the newest press wins
  if (KIT.pressed('x')) p.buf = { k: 'x', t: 0.4 }; else if (KIT.pressed('y')) p.buf = { k: 'y', t: 0.4 }; else if (KIT.pressed('b')) p.buf = { k: 'b', t: 0.3 }; else if (ei.jump) p.buf = { k: 'j', t: 0.2 };
  if (p.buf) { p.buf.t -= dt; if (p.buf.t <= 0) p.buf = null; }
  if (ei.crouch && !p.atk && p.st !== 'down' && !p.fall) { p.crouch = !p.crouch; sfx.tone('triangle', p.crouch ? 220 : 300, p.crouch ? 160 : 360, 0.06, 0.03); }
  p.holdA = KIT.held('a') ? (p.holdA || 0) + dt : 0; if (KIT.pressed('a')) p.tapA = 1;
  var released = p.tapA && !KIT.held('a'), quickTap = released && p.lastHold < ER.tap; if (released) p.tapA = 0; if (KIT.held('a')) p.lastHold = p.holdA;
  var busy = p.atk || p.st === 'roll' || p.st === 'back' || p.st === 'down' || p.hurtT > 0.25 || p.st === 'drink' || p.fall || p.landT > 0.15;
  var wasGuard = p.guard; p.guard = !busy && KIT.held('lb') && p.sta > 0; if (p.guard && !wasGuard) p.guardT = 0; if (p.guard) p.guardT = (p.guardT || 0) + dt;
  var sprint = !busy && !p.guard && KIT.held('a') && p.holdA > ER.tap && wl > 0.3 && p.sta > 0, fight = inCombat(); if (sprint) p.crouch = 0;
  if (p.staWait <= 0 && (!busy || p.st === 'drink') && !(sprint && fight)) p.sta = Math.min(maxSta(), p.sta + dt * ER.regen * (p.guard ? 0.5 : 1) * (SV.ring === 'pie' ? 1.35 : 1));
  if (sprint && fight) { p.sta -= dt * ER.sprintDrain; p.staWait = 0.35; if (p.sta <= 0) p.sta = 0; }
  p.sprint = sprint;
  var tvx = 0, tvz = 0, acc = ER.acc, spdNow = Math.hypot(p.vx, p.vz);
  if (p.st === 'roll' || p.st === 'back') { p.roll -= dt; var len = p.rollLen || 0.62, k = 1 - p.roll / len, sp;
    if (p.st === 'roll') { sp = k < 0.65 ? p.rollSp : p.rollSp * (1 - (k - 0.65) / 0.35); if (k > p.ri0 && k < p.ri1) p.inv = Math.max(p.inv, 0.02); } else { sp = -5.4 * (1 - k); if (k < 0.45) p.inv = Math.max(p.inv, 0.02); }
    var ra = p.st === 'roll' ? p.rollA : p.a; tvx = Math.sin(ra) * sp; tvz = Math.cos(ra) * sp; acc = 60;
    if (k > 0.78 && quickTap && p.sta > 0) { p.st = 'idle'; doRoll(wl, wa); } // chain another roll in the recovery
    else if (p.roll <= 0) { p.afterRoll = { k: p.st, t: 0.18 }; p.st = 'idle'; if (locked) p.a = lockA; } }
  else if (p.st === 'down') { p.downT -= dt; p.inv = Math.max(p.inv, 0.05); var dk = 1 - p.downT / p.downLen; if (dk < 0.3) { tvx = p.kx || 0; tvz = p.kz || 0; acc = 30; }
    if (dk > 0.4 && quickTap && p.sta > 0) { p.st = 'idle'; p.inv = 0; doRoll(wl > 0.2 ? 1 : 0.5, wl > 0.2 ? wa : p.a); if (p.st === 'back') { p.st = 'roll'; p.rollA = p.a; var L0 = LOADS[loadOf()]; p.roll = p.rollLen = L0.len; p.rollSp = L0.sp; p.ri0 = L0.i0; p.ri1 = L0.i1; } }
    else if (p.downT <= 0) { p.st = 'idle'; p.inv = 0.25; } }
  else if (p.st === 'drink') { p.drinkT -= dt; if (p.drinkT < 0.55 && !p.drank) { p.drank = 1; p.hp = Math.min(maxHp(), p.hp + Math.round(maxHp() * 0.45)); sfx.play('pour'); FX.push({ k: 'heal', x: p.x, y: p.y + 1, z: p.z, t: 0.8 }); } if (p.drinkT <= 0) p.st = 'idle'; if (wl > 0.2) { tvx = wx * 1.0; tvz = wz * 1.0; } }
  else if (p.atk) { var A = p.atk, Mv = MOVES[A.m], spd = W0.spd * (A.spdK || 1), wnd = Mv.wind * spd, act = Mv.act * spd, rec = Mv.rec * spd;
    // a charged heavy: holding Y keeps it wound up
    if (A.charge && A.t >= wnd * 0.85 && A.t < wnd && KIT.held('y') && A.chg < 0.75) { A.chg += dt; if (A.chg >= 0.75 && !A.full) { A.full = 1; sfx.tone('square', 600, 1200, 0.12, 0.05); FX.push({ k: 'spark', x: p.x, y: p.y + 2.2, z: p.z, t: 0.35, col: '#ffe36a' }); } }
    else if (A.m === 'jh' && p.fall && A.t >= wnd) A.t = wnd; // the plunge waits for the ground
    else A.t += dt;
    if (A.charge && A.t >= wnd && !A.chgK) A.chgK = A.chg > 0.15 ? 1 + 0.6 * Math.min(1, A.chg / 0.75) : 1;
    if (A.t < wnd) { if (locked) p.a = turnTo(p.a, lockA, dt * ER.turn.act); else if (wl > 0.3) p.a = turnTo(p.a, wa, dt * ER.turn.act); }
    if (p.fall) { tvx = p.vx; tvz = p.vz; acc = 2; }
    else if (A.t < wnd + act) { var lg = Mv.lunge * (A.t < wnd ? 0.35 : 1); if (locked && Math.hypot(LOCK.x - p.x, LOCK.z - p.z) < 1.3) lg = 0; tvx = Math.sin(p.a) * lg; tvz = Math.cos(p.a) * lg; acc = 40; }
    if (Mv.pose === 'slam' && A.m !== 'jh') { var sk = A.t / (wnd + act); A.jy = sk < 1 ? Math.sin(Math.min(1, sk) * Math.PI) * 0.9 : 0; }
    if (A.t >= wnd && A.t < wnd + act) swing(A, Mv); if (A.t >= wnd + act && !A.landed && Mv.aoe) { A.landed = 1; KIT.shake(7); sfx.play('boom'); FX.push({ k: 'ring', x: p.x + Math.sin(p.a) * 1.2, y: p.y + 0.1, z: p.z + Math.cos(p.a) * 1.2, r: 2.6, t: 0.4 }); }
    var free = A.t >= wnd + act && !A.air;
    if (free && p.buf && p.buf.k === 'x' && A.light && p.sta > 0) { p.buf = null; startAtk(false, A.combo + 1); }
    else if (free && p.buf && p.buf.k === 'y' && p.sta > 0) { p.buf = null; startAtk(true, 0, { charge: 1 }); }
    else if (A.t >= wnd + act + rec * 0.55 && !p.fall && quickTap && p.sta > 0) { p.atk = null; doRoll(wl, wa); }
    else if (A.t >= wnd + act + rec * 0.6 && !p.fall && p.buf && p.buf.k === 'j' && p.sta > 0) { p.buf = null; p.atk = null; jump(); }
    else if (A.t >= wnd + act + rec && !(A.air && p.fall)) p.atk = null; }
  else if (p.fall) { // in the air: a little steering, jump attacks
    var ac = wl > 0.15 ? Math.max(spdNow, 2.6) : spdNow; tvx = wl > 0.15 ? wx / Math.max(1e-4, Math.hypot(wx, wz)) * ac : p.vx; tvz = wl > 0.15 ? wz / Math.max(1e-4, Math.hypot(wx, wz)) * ac : p.vz; acc = 4;
    if (p.buf && p.buf.k === 'x' && p.sta > 0) { p.buf = null; startAtk(false, 0, { m: 'jl', air: 1 }); }
    else if (p.buf && p.buf.k === 'y' && p.sta > 0) { p.buf = null; startAtk(true, 0, { m: 'jh', heavy: 1, air: 1 }); } }
  else {
    var crouch = p.crouch && !sprint, spd2 = p.guard ? 1.7 : sprint ? 6.4 : crouch ? (wl > ER.walk ? 2.6 : 1.3) : locked ? (wl > ER.walk ? 3.2 : 1.6) : wl > ER.walk ? 4.4 : 1.9;
    if (p.landT > 0) spd2 *= 0.35;
    if (wl > 0.15) { tvx = wx / Math.max(0.0001, Math.hypot(wx, wz)) * spd2; tvz = wz / Math.max(0.0001, Math.hypot(wx, wz)) * spd2; }
    if (locked && !sprint) p.a = turnTo(p.a, lockA, dt * ER.turn.lock); else if (wl > 0.15) p.a = turnTo(p.a, wa, dt * (sprint ? ER.turn.sprint : ER.turn.run));
    acc = wl > 0.15 ? (sprint ? 14 : ER.acc) : spdNow > 5 ? 16 : ER.dec; // out of a sprint you skid to a stop
    if (quickTap && G.prompt && G.act) G.act(); else if (quickTap && p.sta > 0) doRoll(wl, wa);
    if (p.buf && p.sta > 0) { var bk = p.buf.k, ar = p.afterRoll;
      if (bk === 'x') { p.buf = null; if (ar) { p.afterRoll = null; startAtk(false, 0, { m: ar.k === 'back' ? 'backatk' : 'rollatk', light: 1 }); } else if (sprint || spdNow > 5.5) startRun(); else if (crouch) startAtk(false, 0, { m: 'crouchatk', light: 1 }); else startAtk(false, 0); }
      else if (bk === 'y') { p.buf = null; if (p.gcT > 0) { p.gcT = 0; startAtk(true, 0, { gc: 1, spdK: 0.65 }); if (p.atk && !p.atk.crit) POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'GUARD COUNTER', t: 1, col: '#ffe36a' }); } else startAtk(true, 0, { charge: 1 }); }
      else if (bk === 'j') { p.buf = null; jump(); }
      else if (bk === 'b' && p.flask > 0 && p.hp < maxHp()) { p.buf = null; p.flask--; p.st = 'drink'; p.drinkT = 1.25; p.drank = 0; p.crouch = 0; } }
  }
  if (p.hurtT > 0.25) { tvx = p.kx || 0; tvz = p.kz || 0; acc = 30; }
  // momentum: the body gets up to speed and slows down, it does not snap
  var ax = tvx - p.vx, az = tvz - p.vz, al = Math.hypot(ax, az), mx = acc * dt; if (al > mx) { ax = ax / al * mx; az = az / al * mx; } p.vx += ax; p.vz += az;
  var ox = p.x, oz = p.z; p.x += p.vx * dt; p.z += p.vz * dt; collide(p, 0.35, 'p'); propPush(p, 0.35); p.spd = Math.hypot(p.x - ox, p.z - oz) / dt; if (p.spd < Math.hypot(p.vx, p.vz) * 0.5) { p.vx *= 0.5; p.vz *= 0.5; } p.ph += p.spd * dt * 2.0;
  p.lean = (p.lean || 0) + ((Math.hypot(tvx, tvz) - Math.hypot(p.vx, p.vz)) * 0.04 - (p.lean || 0)) * Math.min(1, dt * 8);
  var fh = floorAt(p.x, p.z);
  if (!p.fall && fh < p.y - 0.6) { p.fall = 1; p.vy = 0; }
  if (p.fall) { p.vy -= 22 * dt; p.y += p.vy * dt;
    if (p.y <= fh && p.vy <= 0) { var drop = p.fy0 - fh; p.y = fh; p.fall = 0; p.jump = 0; p.vy = 0;
      if (drop > 4) { p.landT = 0.6; p.hp -= (drop - 4) * 14; sfx.play('land'); KIT.shake(4); } else if (drop > 2) { p.landT = 0.3; sfx.play('land'); } else { p.landT = 0.1; sfx.noise(0.06, 0.04, 500); }
      if (p.atk && p.atk.air && p.atk.m === 'jl') p.atk = null; } else if (p.y > p.fy0) p.fy0 = p.y;
    if (p.y < -12) p.hp = 0; } else { p.fy0 = p.y; p.y += (fh - p.y) * Math.min(1, dt * 18); }
  if (KIT.pressed('rb')) toggleLock();
  if (LOCK && (LOCK.hp <= 0 || Math.hypot(LOCK.x - p.x, LOCK.z - p.z) > 18)) LOCK = null;
  G.prompt = null; G.act = null;
  WORLD.things.forEach(function (t) { var d = Math.hypot(tx(t.i) - p.x, tx(t.j) - p.z);
    if (t.k === 'candle' && d < 1.8) { G.prompt = SV.lit[t.id] ? 'A  REST AT THE CANDLE' : 'A  LIGHT THE CANDLE'; G.act = function () { if (!SV.lit[t.id]) G.banner = { t: 3, s: 'CANDLE LIT' }; rest(t); }; }
    else if (t.k === 'chest' && !SV.chests[t.id] && d < 1.6) { G.prompt = 'A  OPEN'; G.act = function () { openChest(t); }; }
    else if (t.k === 'door' && !SV.doors[t.id] && d < 1.8) { var side = p.z < tx(t.j) ? -1 : 1; if (side === t.from) { G.prompt = 'A  OPEN THE DOOR'; G.act = function () { SV.doors[t.id] = 1; persist(); sfx.play('door'); G.banner = { t: 2.5, s: 'A SHORTCUT' }; }; } else G.prompt = 'IT OPENS FROM THE OTHER SIDE'; }
    else if (t.k === 'exit' && d < 1.8 && SV.bosses[WORLD.A.boss]) { G.prompt = 'A  GO ON'; G.act = function () { if (SV.area < AREAS.length - 1) { var nid = AREAS[SV.area + 1].id + '0'; SV.lit[nid] = 1; SV.candle = nid; enterArea(SV.area + 1, nid); } else ending(); }; }
    else if (t.k === 'fog' && G.fogShut && !G.inArena && d < 1.6) { G.prompt = 'A  WALK THROUGH THE FOG'; G.act = function () { G.inArena = true; p.z -= 2.4; var b = WORLD.things.filter(function (q) { return q.k === 'boss'; })[0]; BOSS = mkBoss(b); LOCK = BOSS; music.play(BOSS.B.song); G.banner = { t: 3, s: BOSS.B.n }; }; }
  });
  // a riposte: a parried foe in front of you
  if (!p.atk) { var rip = FOE.filter(function (e) { return e.hp > 0 && e.parried > 0 && Math.hypot(e.x - p.x, e.z - p.z) < 1.9; })[0]; if (rip && !G.prompt) G.prompt = 'X  RIPOSTE'; }
  var stn = SV.stain; if (stn && stn.area === SV.area && Math.hypot(stn.x - p.x, stn.z - p.z) < 1.2) { SV.loads += stn.loads; POP.push({ x: p.x, y: p.y + 2.2, z: p.z, s: '+' + stn.loads + ' LOADS', t: 1.6, col: '#ffe36a' }); SV.stain = null; persist(); sfx.play('power'); }
}
function doRoll(wl, wa) { var p = P, L0 = LOADS[loadOf()]; p.crouch = 0; p.staWait = 0.5;
  if (wl > 0.2) { var ra = wa; if (LOCK && LOCK.hp > 0) { var la = Math.atan2(LOCK.x - p.x, LOCK.z - p.z), rel = Math.atan2(Math.sin(wa - la), Math.cos(wa - la)); ra = la + Math.round(rel / (Math.PI / 2)) * (Math.PI / 2); }
    p.sta -= ER.roll * L0.cost; p.st = 'roll'; p.roll = p.rollLen = L0.len; p.rollSp = L0.sp; p.ri0 = L0.i0; p.ri1 = L0.i1; p.rollA = ra; p.a = ra; }
  else { p.sta -= ER.back; p.st = 'back'; p.roll = p.rollLen = 0.4; }
  sfx.play('step'); sfx.noise(0.12, 0.05, L0 === LOADS.heavy ? 400 : 700); }
var erStartAtk = startAtk;
startAtk = function (heavy, combo, o) { o = o || {}; var p = P; erStartAtk(heavy, combo); var A = p.atk; if (!A || A.crit) return;
  if (o.m) { A.m = o.m; A.light = !!o.light; A.heavy = !!o.heavy; } if (o.air) A.air = 1; if (o.spdK) A.spdK = o.spdK; if (o.gc) A.gc = 1; if (heavy && o.charge && !o.m) { A.charge = 1; A.chg = 0; } };
var erSwing = swing;
swing = function (A, Mv) { var mul = (A.chgK || 1) * (A.gc ? 1.3 : 1), dk = dmgK, hs0 = G.hs || 0; if (mul !== 1) dmgK = function () { return dk() * mul; };
  try { erSwing(A, Mv); } finally { dmgK = dk; } if (!A.crit && (G.hs || 0) > hs0) G.hs = hs0 + (G.hs - hs0) * 0.5; };
/* hits: an 80 degree guard, four kinds of reaction, slams jumped over */
_hurtPlayer = function (dmg, fx, fz, unblock) {
  var p = P; if (p.inv > 0 || p.hp <= 0) return; var a = Math.atan2(fx - p.x, fz - p.z), rel = Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a)), facing = Math.abs(rel) < ER.arc;
  if (unblock && p.fall && p.y - floorAt(p.x, p.z) > ER.lowH) { POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'JUMPED IT', t: 0.8, col: '#ffe36a' }); return; }
  if (p.guard && facing && !unblock) { p.sta -= dmg * (SV.ring === 'condom' ? 0.55 : 1.25); p.gcT = ER.gc; sfx.play('block'); FX.push({ k: 'spark', x: p.x + Math.sin(p.a) * 0.6, y: p.y + 1.3, z: p.z + Math.cos(p.a) * 0.6, t: 0.25 }); p.x -= Math.sin(a) * 0.3; p.z -= Math.cos(a) * 0.3; collide(p, 0.35, 'p');
    if (p.sta < 0) { p.sta = 0; p.guard = 0; p.gcT = 0; p.hurtT = 0.9; p.kx = -Math.sin(a) * 1.5; p.kz = -Math.cos(a) * 1.5; POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'GUARD BROKEN', t: 1, col: '#ff2630' }); } return; }
  var mh = maxHp(), kk = dmg / mh, tier = (unblock && kk > 0.12) || kk >= 0.3 ? 3 : kk >= 0.17 ? 2 : kk >= 0.08 ? 1 : 0;
  var arm = p.atk && MOVES[p.atk.m] && MOVES[p.atk.m].armour && p.atk.t > 0.1 && tier < 3;
  p.hp -= dmg * (SV.won ? 1.2 : 1); KIT.shake(3 + tier * 2); sfx.play('hurt'); blood(p.x, p.y + 1.2, p.z, 6 + tier * 2);
  if (arm) return; // the heavy's hyper armour: it hurts, but the swing carries on
  p.hitDir = Math.abs(rel) < 0.8 ? 'f' : Math.abs(rel) > 2.3 ? 'b' : rel > 0 ? 'l' : 'r'; p.react = tier;
  p.atk = null; p.crouch = 0; if (p.st === 'drink' || p.st === 'roll' || p.st === 'back') p.st = 'idle';
  var push = [1.4, 3, 4.4, 6][tier]; p.kx = -Math.sin(a) * push; p.kz = -Math.cos(a) * push;
  if (tier === 3 && !p.fall) { p.st = 'down'; p.downT = p.downLen = 1.3; p.hurtT = 0; p.inv = 1.35; }
  else { p.hurtT = [0.3, 0.55, 0.85, 0.85][tier]; p.inv = 0.6; }
};
/* crouching: foes that have not seen you only notice you close up */
var erStepFoes = stepFoes;
stepFoes = function (dt) { var was = P && P.crouch && P.hp > 0 ? FOE.map(function (f) { return f.st; }) : null, at = was ? FOE.map(function (f) { return [f.x, f.z, f.a, f.y]; }) : null; erStepFoes(dt); if (!was) return;
  FOE.forEach(function (f, i) { if ((was[i] !== 'idle' && was[i] !== 'walk') || (f.st !== 'chase' && f.st !== 'wind') || f.hurt > 0) return; var dx = P.x - f.x, dz = P.z - f.z, d = Math.hypot(dx, dz), ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - f.a), Math.cos(Math.atan2(dx, dz) - f.a)));
    if (d > (ang < 1.2 ? 6 : 2.5)) { f.st = was[i]; f.x = at[i][0]; f.z = at[i][1]; f.a = at[i][2]; f.y = at[i][3]; } }); };
/* poses for the new states */
var erPoseOf = poseOf;
poseOf = function (e, isP) { if (!isP) return erPoseOf(e, isP); var r0 = e.roll; if (e.st === 'roll' && e.rollLen) e.roll = r0 / e.rollLen * 0.62; var Q = erPoseOf(e, isP); e.roll = r0;
  if (e.hp <= 0) return Q;
  if (e.st === 'down') { var k = 1 - e.downT / e.downLen; poseDown(Q, k < 0.7 ? Math.min(1, k * 5) : Math.max(0, 1 - (k - 0.7) / 0.3), e.hitDir !== 'b'); }
  else if (e.fall && !e.atk && e.st !== 'roll' && e.st !== 'back') { var up = e.vy > 0; Q.hip = [up ? 1.2 : 0.7, up ? 0.4 : 0.3]; Q.kn = [up ? 1.6 : 0.9, up ? 1.0 : 0.6]; Q.sh[0] = [1.1, 0.7, 0.1]; Q.sh[1] = [1.0, 0.5, 0.1]; Q.el[0] = 0.8; Q.el[1] = 0.8; Q.lean = 0.12; }
  else if (e.landT > 0 && !e.atk) { var lk = Math.min(1, e.landT / 0.3); Q.y = -0.28 * lk; Q.kn = [1.1 * lk, 1.1 * lk]; Q.hip = [0.8 * lk, 0.8 * lk]; Q.lean = 0.25 * lk; }
  else if (e.crouch && !e.atk && e.st !== 'roll' && e.st !== 'back' && e.st !== 'drink') { Q.y = -0.36; Q.kn = [1.3 + (Q.kn[0] || 0) * 0.3, 1.3 + (Q.kn[1] || 0) * 0.3]; Q.hip = [1.0 + (Q.hip[0] || 0) * 0.3, 1.0 + (Q.hip[1] || 0) * 0.3]; Q.lean = 0.4; }
  if (e.hurtT > 0.3 && e.hitDir === 'b') { Q.lean = 0.4; Q.hp = 0.3; }
  if (e.hurtT > 0.3 && (e.hitDir === 'l' || e.hitDir === 'r')) Q.twist = (e.hitDir === 'l' ? -1 : 1) * 0.5 * Math.min(1, e.hurtT);
  return Q; };
var erPoseMove = poseMove;
poseMove = function (Q, A) { var t = A.t; if (A.spdK) A.t = t / A.spdK; erPoseMove(Q, A); A.t = t; if (A.charge && A.chg > 0 && !A.chgK) { Q.lean += Math.sin(G.t * 45) * 0.03 * (A.full ? 2 : 1); } };
