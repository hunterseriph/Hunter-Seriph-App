/* =====================================================================================================
   DARK LOADS updates 145-146: Elden Ring style movement and combat (his ask).
   The rules and numbers follow "ELDEN RING Combat Rewrite" by Funny-Bones and contributors
   (https://github.com/Funny-Bones/ELDEN-RING-Combat-Rewrite, MIT licence, Copyright (c) 2026 Funny-Bones
   and contributors: permission is granted to use, copy, modify and distribute; the notice is kept here).
   Its frame data is not public, so timings are its documented estimates turned into seconds.
   146 (he said 145 barely felt different): Elden Ring's own pad layout (RB light, RT heavy, LB guard,
   LT skill, B dodge/sprint, A jump, X flask, Y use, R3 lock on / recentre, L3 crouch), mouse on PC,
   weapon skills with an FP bar, heavier attacks, faster running, a real jump, footsteps.
   - Dodge: let go within 0.33 s = roll (backstep with no direction), hold = sprint (drains only in a fight).
   - Roll by weight (LOADS). Locked on, rolls go four ways round the foe and you keep facing it.
   - Jump clears ground slams and sweeps; RB in the air a falling swing, RT a plunging smash.
   - RB straight out of a roll or backstep = rolling attack, then the combo carries on from hit 2.
   - Hold RT to charge; RT just after a block = guard counter. Guard covers 80 degrees.
   - Hits: flinch / stagger / big stagger / knockdown (invincible on the floor, dodge to roll out).
   ===================================================================================================== */
var ER = { tap: 0.33, regen: 45, sprintDrain: 11, roll: 12, back: 8, jump: 10, acc: 30, dec: 36, walk: 0.55, arc: 1.396, gc: 0.66, jumpV: 7.6, lowH: 0.35, lockBreak: 22, atkK: 1.25,
  walkS: 1.8, runS: 5.0, sprintS: 7.0, lockS: 3.6, turn: { run: 18.8, sprint: 8.4, lock: 12.6, act: 6.3 } };
var LOADS = { // equip load tiers by weapon kind
  light: { n: 'LIGHT', len: 0.6, i0: 0.04, i1: 0.56, sp: 12.5, cost: 0.9 },
  mid: { n: 'MEDIUM', len: 0.66, i0: 0.05, i1: 0.47, sp: 9.5, cost: 1 },
  heavy: { n: 'HEAVY', len: 0.9, i0: 0.06, i1: 0.3, sp: 5.8, cost: 1.3 } };
function loadOf(w) { var c = WEAPONS[w || SV.wpn].c; return c === 'dagger' || c === 'fist' ? 'light' : c === 'heavy' || c === 'axe' ? 'heavy' : 'mid'; }
MOVES.rollatk = { wind: 0.1, act: 0.12, rec: 0.3, lunge: 4.4, arc: 0.7, reach: 1.05, pose: 'stab' };
MOVES.backatk = { wind: 0.08, act: 0.12, rec: 0.3, lunge: 3.2, arc: 1.2, pose: 'slashR' };
MOVES.crouchatk = { wind: 0.12, act: 0.1, rec: 0.26, lunge: 2.4, arc: 0.5, reach: 1.1, pose: 'stab' };
MOVES.jl = { wind: 0.12, act: 0.18, rec: 0.24, lunge: 0, arc: 1.3, dmg: 1.2, pose: 'over' };
MOVES.jh = { wind: 0.18, act: 0.12, rec: 0.5, lunge: 0, arc: 3.2, reach: 1.15, aoe: 1, pose: 'slam' };
/* weapon skills (LT): one per kind of weapon, paid in FP */
MOVES.sqoff = { wind: 0.5, act: 0.14, rec: 0.42, lunge: 3.2, arc: 0.7, reach: 1.15, dmg: 2.0, pose: 'upper', armour: 1 };
MOVES.lclaw = { wind: 0.38, act: 0.14, rec: 0.6, lunge: 7.5, arc: 3.2, reach: 1.2, dmg: 1.5, aoe: 1, ringR: 3.2, pose: 'slam', armour: 1, flip: 1 };
MOVES.wild = { wind: 0.28, act: 1.0, rec: 0.45, lunge: 1.6, arc: 3.2, reach: 1.05, dmg: 0.75, multi: 0.25, spins: 3, pose: 'spin', armour: 1 };
MOVES.impale = { wind: 0.5, act: 0.16, rec: 0.42, lunge: 10, arc: 0.4, reach: 1.3, dmg: 2.2, pose: 'lunge' };
MOVES.sspin = { wind: 0.26, act: 0.7, rec: 0.42, lunge: 2.6, arc: 3.2, reach: 1.1, dmg: 0.9, multi: 0.24, spins: 2, pose: 'spin' };
MOVES.gslam = { wind: 0.55, act: 0.12, rec: 0.6, lunge: 2.4, arc: 3.2, reach: 1.3, dmg: 1.6, aoe: 1, ringR: 3.8, pose: 'slam', armour: 1 };
MOVES.endure = { wind: 0.3, act: 0.06, rec: 0.3, lunge: 0, arc: 0, nohit: 1, buff: 1, pose: 'upper' };
var SKILLS = { club: { n: 'Square Off', m: 'sqoff', fp: 12 }, dagger: { n: 'Quickstep', qs: 1, fp: 6 }, heavy: { n: "Lion's Claw", m: 'lclaw', fp: 16 }, axe: { n: 'Wild Strikes', m: 'wild', fp: 14 },
  spear: { n: 'Impaling Thrust', m: 'impale', fp: 10 }, scythe: { n: 'Spinning Slash', m: 'sspin', fp: 12 }, flail: { n: 'Ground Slam', m: 'gslam', fp: 14 }, fist: { n: 'Endure', m: 'endure', fp: 10 } };
function skillOf(w) { return SKILLS[WEAPONS[w || SV.wpn].c] || SKILLS.club; }
function maxFp() { return 60 + (SV.end || 0) * 3; }
/* ---------- input: Elden Ring's layout on a pad, keys and mouse on PC, the touch buttons ---------- */
var ERI = { now: {}, prev: {}, M: {}, dev: ('ontouchstart' in window) ? 'touch' : 'kb' };
document.addEventListener('mousedown', function (e) { if (!document.pointerLockElement) return; var k = e.button === 0 ? 'l' : e.button === 2 ? 'r' : 'm'; ERI.M[k] = 1; ERI.dev = 'kb'; });
document.addEventListener('mouseup', function (e) { var k = e.button === 0 ? 'l' : e.button === 2 ? 'r' : 'm'; ERI.M[k] = 0; });
document.addEventListener('contextmenu', function (e) { if (document.pointerLockElement) e.preventDefault(); });
window.addEventListener('keydown', function (e) { if (!/^F1[3-8]$/.test(e.code)) ERI.dev = 'kb'; });
window.addEventListener('touchstart', function () { ERI.dev = 'touch'; }, { passive: true });
function erRead() { var gp = KIT.gamepad, b = function (n) { return !!(gp && gp.buttons[n] && gp.buttons[n].pressed); }, M = ERI.M, sh = KIT.held('shift');
  if (gp && gp.buttons.some(function (x) { return x && x.pressed; })) ERI.dev = 'pad';
  ERI.prev = ERI.now; ERI.now = { dodge: KIT.held('b'), jump: KIT.held('a'), item: KIT.held('x'), use: KIT.held('y'), guard: KIT.held('lb') || (M.r && !sh), light: KIT.held('rb') || (M.l && !sh),
    heavy: KIT.held('rt') || b(7) || (M.l && sh), skill: KIT.held('lt') || b(6) || (M.r && sh), lock: KIT.held('r3') || b(11) || M.m, crouch: KIT.held('l3') || b(10) }; }
function ih(k) { return !!ERI.now[k]; }
function ip(k) { return !!ERI.now[k] && !ERI.prev[k]; }
var KEYN = { pad: { use: 'Y', light: 'RB', heavy: 'RT', dodge: 'B' }, kb: { use: 'E', light: 'J', heavy: 'K', dodge: 'SPACE' }, touch: { use: 'JUMP', light: 'HIT', heavy: 'HEAVY', dodge: 'ROLL' } };
function keyName(k) { return (KEYN[ERI.dev] || KEYN.kb)[k] || k; }
function inCombat() { if (G.inArena && BOSS && BOSS.hp > 0) return true;
  for (var i = 0; i < FOE.length; i++) { var f = FOE[i]; if (f.hp > 0 && f.st !== 'idle' && f.st !== 'walk' && f.st !== 'dead' && Math.hypot(f.x - P.x, f.z - P.z) < 20) return true; } return false; }
function jump() { var p = P; p.sta -= ER.jump; p.staWait = 0.45; p.jsq = 0.1; p.crouch = 0; } // update 148: a short squat first, then liftOff()
function liftOff() { var p = P; p.jsq = 0; p.fall = 1; p.jump = 1; p.vy = ER.jumpV; p.fy0 = p.y; sfx.noise(0.08, 0.06, 900); sfx.tone('triangle', 140, 220, 0.08, 0.04); }
function useSkill(wl, wa) { var p = P, S0 = skillOf(); if ((p.fp || 0) < S0.fp) { POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'NOT ENOUGH FP', t: 0.8, col: '#6a9aff' }); sfx.tone('square', 200, 150, 0.08, 0.03); return; }
  p.fp -= S0.fp; p.crouch = 0; sfx.tone('sine', 300, 900, 0.18, 0.05); FX.push({ k: 'spark', x: p.x, y: p.y + 1.4, z: p.z, t: 0.3, col: '#6a9aff' });
  if (S0.qs) { var ra = wl > 0.2 ? wa : p.a + Math.PI; p.st = 'roll'; p.qs = 1; p.roll = p.rollLen = 0.32; p.rollSp = 11; p.ri0 = 0; p.ri1 = 1; p.rollA = ra; if (!(LOCK && LOCK.hp > 0)) p.a = ra; return; }
  startAtk(false, 0, { m: S0.m, skill: 1 }); }
/* ---------- Cumhead ---------- */
function stepPlayer(dt) {
  var p = P, mv = KIT.stick(0), W0 = WEAPONS[SV.wpn]; erRead(); p.t += dt; p.inv = Math.max(0, p.inv - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.staWait = Math.max(0, (p.staWait || 0) - dt);
  p.gcT = Math.max(0, (p.gcT || 0) - dt); p.landT = Math.max(0, (p.landT || 0) - dt); p.endure = Math.max(0, (p.endure || 0) - dt); p.vx = p.vx || 0; p.vz = p.vz || 0; if (p.fp === undefined) p.fp = maxFp();
  if (p.afterRoll) { p.afterRoll.t -= dt; if (p.afterRoll.t <= 0) p.afterRoll = null; }
  if (p.hpLag === undefined || p.hpLag < p.hp) p.hpLag = p.hp; p.lagT = Math.max(0, (p.lagT || 0) - dt); if (p.hpLag > p.hp) { if (p.lastHp !== undefined && p.hp < p.lastHp) p.lagT = 0.7; if (p.lagT <= 0) p.hpLag = Math.max(p.hp, p.hpLag - dt * 60); } p.lastHp = p.hp;
  var f = camFwd(), r = [-f[1], f[0]], wx = (-mv.y) * f[0] + mv.x * r[0], wz = (-mv.y) * f[1] + mv.x * r[1], wl = Math.min(1, Math.hypot(wx, wz)), wa = Math.atan2(wx, wz);
  var locked = LOCK && LOCK.hp > 0, lockA = locked ? Math.atan2(LOCK.x - p.x, LOCK.z - p.z) : 0;
  // use things (Y / E, or the jump button when something is there to use)
  var useNow = G.prompt && G.act && (ip('use') || ip('jump')) && !p.atk && !p.fall && p.st !== 'roll' && p.st !== 'down';
  if (useNow) { var fn = G.act; G.act = null; fn(); if (G.mode !== 'play' || P !== p) return; }
  // one buffer slot, the newest press wins
  if (ip('light')) p.buf = { k: 'x', t: 0.4 }; else if (ip('heavy')) p.buf = { k: 'y', t: 0.4 }; else if (ip('item')) p.buf = { k: 'b', t: 0.3 }; else if (ip('skill')) p.buf = { k: 's', t: 0.35 }; else if (ip('jump') && !useNow) p.buf = { k: 'j', t: 0.2 };
  if (p.buf) { p.buf.t -= dt; if (p.buf.t <= 0) p.buf = null; }
  if (ip('crouch') && !p.atk && p.st !== 'down' && !p.fall) { p.crouch = !p.crouch; sfx.tone('triangle', p.crouch ? 220 : 300, p.crouch ? 160 : 360, 0.06, 0.03); }
  p.holdA = ih('dodge') ? (p.holdA || 0) + dt : 0; if (ip('dodge')) p.tapA = 1;
  var released = p.tapA && !ih('dodge'), quickTap = released && p.lastHold < ER.tap; if (released) p.tapA = 0; if (ih('dodge')) p.lastHold = p.holdA;
  if (p.jsq > 0) { p.jsq -= dt; if (p.jsq <= 0) liftOff(); }
  var busy = p.jsq > 0 || p.atk || p.st === 'roll' || p.st === 'back' || p.st === 'down' || p.hurtT > 0.25 || p.st === 'drink' || p.fall || p.landT > 0.15;
  var wasGuard = p.guard; p.guard = !busy && ih('guard') && p.sta > 0; if (p.guard && !wasGuard) p.guardT = 0; if (p.guard) p.guardT = (p.guardT || 0) + dt;
  var sprint = !busy && !p.guard && ih('dodge') && p.holdA > ER.tap && wl > 0.3 && p.sta > 0, fight = inCombat(); if (sprint) p.crouch = 0;
  if (p.staWait <= 0 && (!busy || p.st === 'drink') && !(sprint && fight)) p.sta = Math.min(maxSta(), p.sta + dt * ER.regen * (p.guard ? 0.5 : 1) * (SV.ring === 'pie' ? 1.35 : 1));
  if (sprint && fight) { p.sta -= dt * ER.sprintDrain; p.staWait = 0.35; if (p.sta <= 0) p.sta = 0; }
  p.sprint = sprint;
  var tvx = 0, tvz = 0, acc = ER.acc, spdNow = Math.hypot(p.vx, p.vz);
  if (p.st === 'roll' || p.st === 'back') { p.roll -= dt; var len = p.rollLen || 0.62, k = 1 - p.roll / len, sp;
    if (p.st === 'roll') { sp = p.qs ? p.rollSp * (1 - k * 0.6) : k < 0.65 ? p.rollSp : p.rollSp * (1 - (k - 0.65) / 0.35); if (k > p.ri0 && k < p.ri1) p.inv = Math.max(p.inv, 0.02); } else { sp = k < 0.12 ? -2 : -6.2 * Math.max(0, 1 - (k - 0.12) / 0.55); if (k < 0.36) p.inv = Math.max(p.inv, 0.02); }
    var ra = p.st === 'roll' ? p.rollA : p.a; tvx = Math.sin(ra) * sp; tvz = Math.cos(ra) * sp; acc = 70;
    if (k > 0.78 && quickTap && p.sta > 0) { p.st = 'idle'; p.qs = 0; doRoll(wl, wa); } // chain another roll in the recovery
    else if (p.roll <= 0) { p.afterRoll = { k: p.st, t: 0.2 }; p.st = 'idle'; p.qs = 0; if (locked) p.a = lockA; } }
  else if (p.st === 'down') { p.downT -= dt; p.inv = Math.max(p.inv, 0.05); var dk = 1 - p.downT / p.downLen; if (dk < 0.3) { tvx = p.kx || 0; tvz = p.kz || 0; acc = 30; }
    if (dk > 0.4 && quickTap && p.sta > 0) { p.st = 'idle'; p.inv = 0; doRoll(1, wl > 0.2 ? wa : p.a); }
    else if (p.downT <= 0) { p.st = 'idle'; p.inv = 0.25; } }
  else if (p.st === 'drink') { p.drinkT -= dt; if (p.drinkT < 0.55 && !p.drank) { p.drank = 1; p.hp = Math.min(maxHp(), p.hp + Math.round(maxHp() * 0.45)); sfx.play('pour'); FX.push({ k: 'heal', x: p.x, y: p.y + 1, z: p.z, t: 0.8 }); } if (p.drinkT <= 0) p.st = 'idle'; if (wl > 0.2) { tvx = wx * 1.1; tvz = wz * 1.1; } }
  else if (p.atk) { var A = p.atk, Mv = MOVES[A.m], spd = W0.spd * (A.spdK || ER.atkK), wnd = Mv.wind * spd, act = Mv.act * spd, rec = Mv.rec * spd;
    if (A.skill) { wnd = Mv.wind * ER.atkK; act = Mv.act * ER.atkK; rec = Mv.rec * ER.atkK; }
    // a charged heavy: holding RT keeps it wound up
    if (A.charge && A.t >= wnd * 0.85 && A.t < wnd && ih('heavy') && A.chg < 0.75) { A.chg += dt; if (A.chg >= 0.75 && !A.full) { A.full = 1; sfx.tone('square', 600, 1200, 0.12, 0.05); FX.push({ k: 'spark', x: p.x, y: p.y + 2.2, z: p.z, t: 0.35, col: '#ffe36a' }); } }
    else if (A.m === 'jh' && p.fall && A.t >= wnd) A.t = wnd; // the plunge waits for the ground
    else A.t += dt;
    if (A.charge && A.t >= wnd && !A.chgK) A.chgK = A.chg > 0.15 ? 1 + 0.6 * Math.min(1, A.chg / 0.75) : 1;
    if (A.t < wnd) { if (locked) p.a = turnTo(p.a, lockA, dt * ER.turn.act); else if (wl > 0.3) p.a = turnTo(p.a, wa, dt * ER.turn.act); }
    if (p.fall) { tvx = p.vx; tvz = p.vz; acc = 2; }
    else if (A.t < wnd + act) { var lg = Mv.lunge * (A.t < wnd ? 0.35 : 1); if (locked && Math.hypot(LOCK.x - p.x, LOCK.z - p.z) < 1.3) lg = 0; tvx = Math.sin(p.a) * lg; tvz = Math.cos(p.a) * lg; acc = 40; }
    if (Mv.pose === 'slam' && A.m !== 'jh') { var sk = A.t / (wnd + act); A.jy = sk < 1 ? Math.sin(Math.min(1, sk) * Math.PI) * (Mv.flip ? 1.8 : 0.9) : 0; }
    if (A.t >= wnd && A.t < wnd + act) { if (Mv.multi && A.t - (A.lastMulti || wnd) >= Mv.multi * (A.skill ? ER.atkK : spd)) { A.hitList = []; A.lastMulti = A.t; A.sw = 0; } if (!Mv.nohit) swing(A, Mv); }
    if (A.t >= wnd && Mv.buff && !A.buffed) { A.buffed = 1; p.endure = 8; POP.push({ x: p.x, y: p.y + 2.4, z: p.z, s: 'ENDURE', t: 1.2, col: '#6a9aff' }); sfx.tone('sawtooth', 120, 260, 0.3, 0.05); }
    if (A.t >= wnd + act && !A.landed && Mv.aoe) { A.landed = 1; KIT.shake(Mv.ringR ? 10 : 7); sfx.play('boom'); FX.push({ k: 'ring', x: p.x + Math.sin(p.a) * 1.2, y: p.y + 0.1, z: p.z + Math.cos(p.a) * 1.2, r: Mv.ringR || 2.6, t: 0.4 });
      if (Mv.ringR) { A.hitList = []; var rr = Mv.ringR; FOE.concat(BOSS && BOSS.hp > 0 ? [BOSS] : []).forEach(function (e) { if (e.hp <= 0) return; var cx = p.x + Math.sin(p.a) * 1.2, cz = p.z + Math.cos(p.a) * 1.2; if (Math.hypot(e.x - cx, e.z - cz) < rr + (e.boss ? 1 : 0.3)) { var dm = W0.heavy * dmgK() * 0.6; if (e.boss) hurtBoss(dm, true); else hurtFoe(e, dm, true, 2); } }); } }
    var free = A.t >= wnd + act && !A.air;
    if (free && p.buf && p.buf.k === 'x' && A.light && p.sta > 0) { p.buf = null; startAtk(false, A.combo + 1); }
    else if (free && p.buf && p.buf.k === 'y' && p.sta > 0) { p.buf = null; startAtk(true, 0, { charge: 1 }); }
    else if (A.t >= wnd + act + rec * 0.55 && !p.fall && quickTap && p.sta > 0) { p.atk = null; doRoll(wl, wa); }
    else if (A.t >= wnd + act + rec * 0.6 && !p.fall && p.buf && p.buf.k === 'j' && p.sta > 0) { p.buf = null; p.atk = null; jump(); }
    else if (A.t >= wnd + act + rec && !(A.air && p.fall)) p.atk = null; }
  else if (p.jsq > 0) { tvx = p.vx; tvz = p.vz; acc = 3; }
  else if (p.fall) { // in the air: a little steering, jump attacks
    var ac = wl > 0.15 ? Math.max(spdNow, 2.6) : spdNow; tvx = wl > 0.15 ? wx / Math.max(1e-4, Math.hypot(wx, wz)) * ac : p.vx; tvz = wl > 0.15 ? wz / Math.max(1e-4, Math.hypot(wx, wz)) * ac : p.vz; acc = 4;
    if (p.buf && p.buf.k === 'x' && p.sta > 0) { p.buf = null; startAtk(false, 0, { m: 'jl', air: 1 }); }
    else if (p.buf && p.buf.k === 'y' && p.sta > 0) { p.buf = null; startAtk(true, 0, { m: 'jh', heavy: 1, air: 1 }); } }
  else {
    var crouch = p.crouch && !sprint, spd2 = p.guard ? 1.9 : sprint ? ER.sprintS : crouch ? (wl > ER.walk ? 2.4 : 1.2) : locked ? (wl > ER.walk ? ER.lockS : 1.6) : wl > ER.walk ? ER.runS : ER.walkS;
    if (p.landT > 0) spd2 *= 0.35;
    if (wl > 0.15) { tvx = wx / Math.max(0.0001, Math.hypot(wx, wz)) * spd2; tvz = wz / Math.max(0.0001, Math.hypot(wx, wz)) * spd2; }
    if (locked && !sprint) p.a = turnTo(p.a, lockA, dt * ER.turn.lock); else if (wl > 0.15) p.a = turnTo(p.a, wa, dt * (sprint ? ER.turn.sprint : ER.turn.run));
    acc = wl > 0.15 ? (sprint ? 16 : ER.acc) : spdNow > 3 ? 14 : ER.dec; // out of a run or a sprint you skid to a stop
    if (quickTap && p.sta > 0) doRoll(wl, wa);
    if (p.buf && p.sta > 0) { var bk = p.buf.k, ar = p.afterRoll;
      if (bk === 'x') { p.buf = null; if (ar) { p.afterRoll = null; startAtk(false, 0, { m: ar.k === 'back' ? 'backatk' : 'rollatk', light: 1 }); } else if (sprint || spdNow > 5.6) startRun(); else if (crouch) startAtk(false, 0, { m: 'crouchatk', light: 1 }); else startAtk(false, 0); }
      else if (bk === 'y') { p.buf = null; if (p.gcT > 0) { p.gcT = 0; startAtk(true, 0, { gc: 1, spdK: 0.8 }); if (p.atk && !p.atk.crit) POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'GUARD COUNTER', t: 1, col: '#ffe36a' }); } else startAtk(true, 0, { charge: 1 }); }
      else if (bk === 's') { p.buf = null; useSkill(wl, wa); }
      else if (bk === 'j') { p.buf = null; jump(); }
      else if (bk === 'b' && p.flask > 0 && p.hp < maxHp()) { p.buf = null; p.flask--; p.st = 'drink'; p.drinkT = 1.25; p.drank = 0; p.crouch = 0; } }
  }
  if (p.hurtT > 0.25) { tvx = p.kx || 0; tvz = p.kz || 0; acc = 30; }
  // momentum: the body gets up to speed and slows down, it does not snap
  var ax = tvx - p.vx, az = tvz - p.vz, al = Math.hypot(ax, az), mx = acc * dt; if (al > mx) { ax = ax / al * mx; az = az / al * mx; } p.vx += ax; p.vz += az;
  var ox = p.x, oz = p.z; p.x += p.vx * dt; p.z += p.vz * dt; collide(p, 0.35, 'p'); propPush(p, 0.35); p.spd = Math.hypot(p.x - ox, p.z - oz) / dt; if (p.spd < Math.hypot(p.vx, p.vz) * 0.5) { p.vx *= 0.5; p.vz *= 0.5; } p.ph += p.spd * dt * (p.spd > 6 ? 1.5 : 1.85);
  // footsteps
  var stp = Math.floor(p.ph / Math.PI); if (stp !== p.lastStp && !p.fall && p.spd > 1 && p.st !== 'roll') { p.lastStp = stp; sfx.noise(0.05, Math.min(0.09, 0.02 + p.spd * 0.011) * (p.crouch ? 0.4 : 1), p.spd > 6 ? 520 : 380); sfx.tone('sine', 90, 55, 0.05, 0.03); }
  p.lean = (p.lean || 0) + ((Math.hypot(tvx, tvz) - Math.hypot(p.vx, p.vz)) * 0.04 - (p.lean || 0)) * Math.min(1, dt * 8);
  var fh = floorAt(p.x, p.z);
  if (!p.fall && fh < p.y - 0.6) { p.fall = 1; p.vy = 0; }
  if (p.fall) { p.vy -= 22 * dt; p.y += p.vy * dt;
    if (p.y <= fh && p.vy <= 0) { var drop = p.fy0 - fh; p.y = fh; var wj = p.jump; p.fall = 0; p.jump = 0; p.vy = 0;
      if (drop > 4) { p.landT = 0.6; p.hp -= (drop - 4) * 14; sfx.play('land'); KIT.shake(4); } else if (drop > 2) { p.landT = 0.3; sfx.play('land'); } else { p.landT = wj ? 0.22 : 0.12; sfx.noise(0.07, 0.07, 450); sfx.tone('sine', 80, 45, 0.07, 0.05); }
      if (p.atk && p.atk.air && p.atk.m === 'jl') p.atk = null; } else if (p.y > p.fy0) p.fy0 = p.y;
    if (p.y < -12) p.hp = 0; } else { p.fy0 = p.y; p.y += (fh - p.y) * Math.min(1, dt * 18); }
  // lock on (R3); with nothing to lock on to it puts the camera back behind you
  if (ip('lock')) { if (LOCK) LOCK = null; else { toggleLock(); if (!LOCK) G.recentre = 0.35; } }
  if (LOCK && (LOCK.hp <= 0 || Math.hypot(LOCK.x - p.x, LOCK.z - p.z) > ER.lockBreak)) LOCK = null;
  G.prompt = null; G.act = null;
  WORLD.things.forEach(function (t) { var d = Math.hypot(tx(t.i) - p.x, tx(t.j) - p.z);
    if (t.k === 'candle' && d < 1.8) { G.prompt = SV.lit[t.id] ? '@  REST AT THE CANDLE' : '@  LIGHT THE CANDLE'; G.act = function () { if (!SV.lit[t.id]) G.banner = { t: 3, s: 'CANDLE LIT' }; rest(t); }; }
    else if (t.k === 'chest' && !SV.chests[t.id] && d < 1.6) { G.prompt = '@  OPEN'; G.act = function () { openChest(t); }; }
    else if (t.k === 'door' && !SV.doors[t.id] && d < 1.8) { var side = p.z < tx(t.j) ? -1 : 1; if (side === t.from) { G.prompt = '@  OPEN THE DOOR'; G.act = function () { SV.doors[t.id] = 1; persist(); sfx.play('door'); G.banner = { t: 2.5, s: 'A SHORTCUT' }; }; } else G.prompt = 'IT OPENS FROM THE OTHER SIDE'; }
    else if (t.k === 'exit' && d < 1.8 && SV.bosses[WORLD.A.boss]) { G.prompt = '@  GO ON'; G.act = function () { if (SV.area < AREAS.length - 1) { var nid = AREAS[SV.area + 1].id + '0'; SV.lit[nid] = 1; SV.candle = nid; enterArea(SV.area + 1, nid); } else ending(); }; }
    else if (t.k === 'fog' && G.fogShut && !G.inArena && d < 1.6) { G.prompt = '@  WALK THROUGH THE FOG'; G.act = function () { G.inArena = true; p.z -= 2.4; var b = WORLD.things.filter(function (q) { return q.k === 'boss'; })[0]; BOSS = mkBoss(b); LOCK = BOSS; music.play(BOSS.B.song); G.banner = { t: 3, s: BOSS.B.n }; }; }
  });
  // a critical hit: a parried or stance-broken foe in front of you
  if (!p.atk) { var rip = FOE.filter(function (e) { return e.hp > 0 && e.parried > 0 && Math.hypot(e.x - p.x, e.z - p.z) < 1.9; })[0]; if (rip && !G.prompt) G.prompt = '%  CRITICAL HIT'; }
  var stn = SV.stain; if (stn && stn.area === SV.area && Math.hypot(stn.x - p.x, stn.z - p.z) < 1.2) { SV.loads += stn.loads; POP.push({ x: p.x, y: p.y + 2.2, z: p.z, s: '+' + stn.loads + ' LOADS', t: 1.6, col: '#ffe36a' }); SV.stain = null; persist(); sfx.play('power'); }
}
function doRoll(wl, wa) { var p = P, L0 = LOADS[loadOf()]; p.crouch = 0; p.staWait = 0.5; p.qs = 0;
  if (wl > 0.2) { var ra = wa; if (LOCK && LOCK.hp > 0) { var la = Math.atan2(LOCK.x - p.x, LOCK.z - p.z), rel = Math.atan2(Math.sin(wa - la), Math.cos(wa - la)); ra = la + Math.round(rel / (Math.PI / 2)) * (Math.PI / 2); }
    p.sta -= ER.roll * L0.cost; p.st = 'roll'; p.roll = p.rollLen = L0.len; p.rollSp = L0.sp; p.ri0 = L0.i0; p.ri1 = L0.i1; p.rollA = ra; p.a = ra; }
  else { p.sta -= ER.back; p.st = 'back'; p.roll = p.rollLen = 0.55; }
  sfx.noise(0.14, 0.07, L0 === LOADS.heavy ? 300 : 600); sfx.tone('sine', 110, 60, 0.1, 0.04); }
var erStartAtk = startAtk;
startAtk = function (heavy, combo, o) { o = o || {}; var p = P; erStartAtk(heavy, combo); var A = p.atk; if (!A || A.crit) return;
  if (o.m) { A.m = o.m; A.light = !!o.light; A.heavy = !!o.heavy; } if (o.air) A.air = 1; if (o.skill) { A.skill = 1; A.spdK = 1; } if (o.spdK) A.spdK = o.spdK * ER.atkK; if (o.gc) A.gc = 1; if (heavy && o.charge && !o.m) { A.charge = 1; A.chg = 0; }
  var kd = WEAPONS[SV.wpn].c; if (kd === 'heavy' || kd === 'axe' || A.heavy) sfx.noise(0.1, 0.04, 300); };
var erSwing = swing;
swing = function (A, Mv) { var mul = (A.chgK || 1) * (A.gc ? 1.3 : 1), dk = dmgK, hs0 = G.hs || 0, n0 = A.hitList.length; if (mul !== 1) dmgK = function () { return dk() * mul; };
  try { erSwing(A, Mv); } finally { dmgK = dk; } if (!A.crit && (G.hs || 0) > hs0) G.hs = hs0 + (G.hs - hs0) * 0.5;
  if (A.hitList.length > n0) { P.fp = Math.min(maxFp(), (P.fp || 0) + 3 * (A.hitList.length - n0)); sfx.tone('sine', A.heavy ? 110 : 150, 45, A.heavy ? 0.16 : 0.1, 0.09); sfx.noise(0.08, 0.06, 900); } };
var erRest = rest;
rest = function (c) { if (P) P.fp = maxFp(); erRest(c); };
/* hits: an 80 degree guard, four kinds of reaction, slams jumped over */
_hurtPlayer = function (dmg, fx, fz, unblock) {
  var p = P, force = p.nextTier; p.nextTier = undefined; if (p.inv > 0 || p.hp <= 0) return; var a = Math.atan2(fx - p.x, fz - p.z), rel = Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a)), facing = Math.abs(rel) < ER.arc;
  if ((unblock || p.lowHit) && p.fall && p.y - floorAt(p.x, p.z) > ER.lowH) { p.lowHit = 0; POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'JUMPED IT', t: 0.8, col: '#ffe36a' }); return; } p.lowHit = 0;
  if (p.guard && facing && !unblock) { p.sta -= dmg * (SV.ring === 'condom' ? 0.55 : 1.25); p.gcT = ER.gc; sfx.play('block'); FX.push({ k: 'spark', x: p.x + Math.sin(p.a) * 0.6, y: p.y + 1.3, z: p.z + Math.cos(p.a) * 0.6, t: 0.25 }); p.x -= Math.sin(a) * 0.3; p.z -= Math.cos(a) * 0.3; collide(p, 0.35, 'p');
    if (p.sta < 0) { p.sta = 0; p.guard = 0; p.gcT = 0; p.hurtT = 0.9; p.kx = -Math.sin(a) * 1.5; p.kz = -Math.cos(a) * 1.5; POP.push({ x: p.x, y: p.y + 2.3, z: p.z, s: 'GUARD BROKEN', t: 1, col: '#ff2630' }); } return; }
  if (p.endure > 0) dmg *= 0.7;
  var mh = maxHp(), kk = dmg / mh, tier = force !== undefined ? force : (unblock && kk > 0.12) || kk >= 0.3 ? 3 : kk >= 0.17 ? 2 : kk >= 0.08 ? 1 : 0;
  var arm = (p.endure > 0 && tier < 3) || (p.atk && MOVES[p.atk.m] && MOVES[p.atk.m].armour && p.atk.t > 0.1 && tier < 3);
  p.hp -= dmg * (SV.won ? 1.2 : 1); KIT.shake(3 + tier * 2); sfx.play('hurt'); blood(p.x, p.y + 1.2, p.z, 6 + tier * 2); G.hs = Math.max(G.hs || 0, 0.04 + tier * 0.02);
  if (arm) return; // hyper armour: it hurts, but you carry on
  p.hitDir = Math.abs(rel) < 0.8 ? 'f' : Math.abs(rel) > 2.3 ? 'b' : rel > 0 ? 'l' : 'r'; p.react = tier;
  p.atk = null; p.crouch = 0; if (p.st === 'drink' || p.st === 'roll' || p.st === 'back') p.st = 'idle';
  var push = [1.4, 3, 4.4, 7.5][tier]; p.kx = -Math.sin(a) * push; p.kz = -Math.cos(a) * push;
  if (tier === 3 && !p.fall) { p.st = 'down'; p.downT = p.downLen = 1.3; p.hurtT = 0; p.inv = 1.35; }
  else { p.hurtT = [0.3, 0.55, 0.85, 0.85][tier]; p.inv = 0.45; }
};
/* crouching: foes that have not seen you only notice you close up */
var erStepFoes = stepFoes;
stepFoes = function (dt) { var was = P && P.crouch && P.hp > 0 ? FOE.map(function (f) { return f.st; }) : null, at = was ? FOE.map(function (f) { return [f.x, f.z, f.a, f.y]; }) : null; erStepFoes(dt); if (!was) return;
  FOE.forEach(function (f, i) { if ((was[i] !== 'idle' && was[i] !== 'walk') || f.st === was[i] || f.hurt > 0) return; var dx = P.x - f.x, dz = P.z - f.z, d = Math.hypot(dx, dz), ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - f.a), Math.cos(Math.atan2(dx, dz) - f.a)));
    if (d > (ang < 1.2 ? 6 : 2.5)) { f.st = was[i]; f.x = at[i][0]; f.z = at[i][1]; f.a = at[i][2]; f.y = at[i][3]; f.mv = null; } }); };
/* poses for the new states */
var erPoseOf = poseOf;
poseOf = function (e, isP) { if (!isP) return erPoseOf(e, isP); var r0 = e.roll; if (e.st === 'roll' && e.rollLen) e.roll = r0 / e.rollLen * 0.62; var Q = erPoseOf(e, isP); e.roll = r0;
  if (e.hp <= 0) return Q;
  if (e.st === 'roll' && e.qs) { Q = pose0(); Q.lean = 0.35; Q.y = -0.2; Q.hip = [0.9, -0.5]; Q.kn = [1.0, 0.3]; Q.sh[0] = [0.4, 0.6, 0]; Q.sh[1] = [0.8, 0.3, 0.2]; Q.el = [0.6, 0.8]; return Q; }
  if (e.st === 'down') { var k = 1 - e.downT / e.downLen; poseDown(Q, k < 0.7 ? Math.min(1, k * 5) : Math.max(0, 1 - (k - 0.7) / 0.3), e.hitDir !== 'b'); }
  else if (e.fall && !e.atk && e.st !== 'roll' && e.st !== 'back') { var up = e.vy > 0; Q.hip = [up ? 1.2 : 0.7, up ? 0.4 : 0.3]; Q.kn = [up ? 1.6 : 0.9, up ? 1.0 : 0.6]; Q.sh[0] = [1.1, 0.7, 0.1]; Q.sh[1] = [1.0, 0.5, 0.1]; Q.el[0] = 0.8; Q.el[1] = 0.8; Q.lean = 0.12; }
  else if (e.landT > 0 && !e.atk) { var lk = Math.min(1, e.landT / 0.3); Q.y = -0.28 * lk; Q.kn = [1.1 * lk, 1.1 * lk]; Q.hip = [0.8 * lk, 0.8 * lk]; Q.lean = 0.25 * lk; }
  else if (e.crouch && !e.atk && e.st !== 'roll' && e.st !== 'back' && e.st !== 'drink') { Q.y = -0.36; Q.kn = [1.3 + (Q.kn[0] || 0) * 0.3, 1.3 + (Q.kn[1] || 0) * 0.3]; Q.hip = [1.0 + (Q.hip[0] || 0) * 0.3, 1.0 + (Q.hip[1] || 0) * 0.3]; Q.lean = 0.4; }
  else if (e.sprint && !e.atk) { Q.lean = 0.42; Q.sh[1] = [Q.sh[1][0] * 0.6 - 0.5, 0.25, 0.2]; Q.el[1] = 0.4; }
  if (e.hurtT > 0.3 && e.hitDir === 'b') { Q.lean = 0.4; Q.hp = 0.3; }
  if (e.hurtT > 0.3 && (e.hitDir === 'l' || e.hitDir === 'r')) Q.twist = (e.hitDir === 'l' ? -1 : 1) * 0.5 * Math.min(1, e.hurtT);
  return Q; };
var erPoseMove = poseMove;
poseMove = function (Q, A) { var t = A.t, Mv = MOVES[A.m], k = A.skill ? 1 / WEAPONS[SV.wpn].spd * ER.atkK : (A.spdK || ER.atkK); A.t = t / k; erPoseMove(Q, A); A.t = t;
  if (A.charge && A.chg > 0 && !A.chgK) Q.lean += Math.sin(G.t * 45) * 0.03 * (A.full ? 2 : 1);
  if (Mv && Mv.spins) { var spd = A.skill ? ER.atkK : WEAPONS[SV.wpn].spd * k, w0 = Mv.wind * spd, a0 = Mv.act * spd; A.spin = t >= w0 ? Math.min(1, (t - w0) / a0) * Math.PI * 2 * Mv.spins : 0; }
  if (Mv && Mv.flip && A.jy > 0.3) Q.bp = Math.min(1, (t / ((Mv.wind + Mv.act) * ER.atkK))) * Math.PI * 2; };
