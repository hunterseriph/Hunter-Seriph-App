/* =====================================================================================================
   THE PLAYER. A attack (combos of 3-4, dash attack when running, flying kick in the air, picks things up),
   B jump, X special (on its own: the fireball; with UP: the rising move; FORWARD: the dash; DOWN: the ground move),
   Y super (full meter). Street Fighter motions with A do the EX version of a special for free:
   down, down-forward, forward + A = EX fireball; forward, down, down-forward + A = EX rising move.
   Walk into someone to grab them: A knees, A with a direction throws. Double tap forward to run.
   X while you are being hit = BREAKAWAY: knocks everyone off you for a little health.
   ===================================================================================================== */
function makePlayer(id) {
  var H = HEROES[id];
  var e = ent({ team: 'p', hero: H, hid: id, x: 60, z: 34, w: H.w, ht: H.ht, hp: H.hp, mhp: H.hp, meter: 0, face: 1, dirs: [], ci: 0, lastAtk: -9, floaty: H.float, weapon: null, fast: 0, fire: 0, shieldT: 0 });
  // specials become moves the engine can run
  e.spm = {}; for (var k in H.sp) { if (k === 'sup') continue; e.spm[k] = specialMove(H.sp[k], k, false); e.spm[k + 'EX'] = specialMove(H.sp[k], k, true); }
  return e;
}
function specialMove(s, kind, ex) {
  var k = ex ? 1.5 : 1, m = MV({ pose: s.pose, st: s.st || 0.08, rc: s.rc || 0.22, ac: 0.06, n: (ex ? 'EX ' : '') + s.n, kind: kind, ex: ex, meter: 6, dmg: (s.dmg || 0) * k, kd: s.kd, lift: s.lift, kb: s.kb || 120, hs: 0.08, sfx: 'heavy', inv: s.inv || ex });
  if (kind === 'fire') { m.ac = 0.05; m.shot = ex && s.ex ? s.ex : s.shot; m.triple = ex && s.ex && s.ex.triple; }
  if (kind === 'rise') { m.ac = 0.7; m.rc = 0.16; m.box = s.box; m.vh = s.vh * (ex ? 1.12 : 1); m.fwd = s.fwd; m.hits = s.hits + (ex ? 2 : 0); m.spin = s.spin; m.heal = s.heal; m.rise = 1; }
  if (kind === 'dash') { m.ac = s.dur; m.rc = 0.2; m.lunge = s.lunge * (ex ? 1.15 : 1); m.box = s.box; m.ghost = s.ghost; m.fx = s.fx; m.lift = s.lift || 160; }
  if (kind === 'ground') { m.ac = 0.06; m.rc = 0.3; m.ring = (s.ring || 0) * (ex ? 1.3 : 1); m.shield = s.shield; m.quake = s.quake; m.fx = s.fx; m.shot = s.shot; m.lift = s.lift || 200; }
  return m;
}
/* the direction history, for motions: numpad style, relative to the way you face (6 = forwards) */
function dirNow(e) {
  var l = KIT.held('left'), r = KIT.held('right'), u = KIT.held('up'), d = KIT.held('down'), f = e.face > 0 ? r : l, b = e.face > 0 ? l : r;
  return d ? (f ? 3 : b ? 1 : 2) : u ? (f ? 9 : b ? 7 : 8) : f ? 6 : b ? 4 : 5;
}
function motion(e, seq, win) { var t = G.t - win, j = 0; for (var i = 0; i < e.dirs.length; i++) { var d = e.dirs[i]; if (d.t < t) continue; if (d.d === seq[j]) { j++; if (j === seq.length) return true; } } return false; }
function startMove(e, m) { e.mv = m; e.mvT = 0; e.hit = {}; e.st = 'atk'; e.mf = {}; if (m.n && e.team === 'p') G.callout = { s: m.n, t: 0.9 }; }

function stepPlayer(dt) {
  var e = P, H = e.hero;
  e.t += dt; if (e.inv > 0) e.inv -= dt; if (e.flash > 0) e.flash -= dt; if (e.fast > 0) e.fast -= dt; if (e.fire > 0) e.fire -= dt; if (e.shieldT > 0) e.shieldT -= dt; if (e.spCd > 0) e.spCd -= dt; if (e.gunCd > 0) e.gunCd -= dt;
  var dn = dirNow(e); if (!e.dirs.length || e.dirs[e.dirs.length - 1].d !== dn) { e.dirs.push({ d: dn, t: G.t }); if (e.dirs.length > 12) e.dirs.shift(); }
  if (G.superT > 0) return; // the super plays out
  switch (e.st) {
    case 'dead': e.t += 0; if (e.t > 1.6) playerOut(); return;
    case 'down': if (e.t > 0.75) { if (e.hp <= 0) { e.st = 'dead'; e.t = 0; } else { e.st = 'getup'; e.t = 0; e.inv = 0.9; } } return;
    case 'getup': if (e.t > 0.32) { e.st = 'idle'; e.juggle = 0; } return;
    case 'air': e.vx *= Math.pow(0.6, dt); return;
    case 'hurt': e.stun -= dt; if (KIT.pressed('x') && e.hp > 12) { breakaway(e); return; } if (e.stun <= 0) { e.st = 'idle'; e.juggle = 0; } return;
    case 'grabbed': if (KIT.pressed('a') || KIT.pressed('b') || KIT.pressed('x') || KIT.pressed('left') || KIT.pressed('right')) { e.mash = (e.mash || 0) + 1; e.vx = rnd(-20, 20); }
      if (e.mash >= 6 || !e.heldBy || e.heldBy.hp <= 0) { var by = e.heldBy; e.st = 'idle'; e.mash = 0; e.heldBy = null; e.inv = 0.5; if (by) { by.holding = null; by.st = 'hurt'; by.stun = 0.6; by.mv = null; by.vx = -by.face * 120; } } return;
    case 'grab': return stepGrab(e, dt);
    case 'atk': stepMove(e, dt); if (e.mv && (KIT.pressed('a') || (G.bot && G.botA))) e.buf = 1; if (e.mv && KIT.pressed('x')) e.bufX = 1; return;
  }
  // free: walking, running, jumping
  var air = e.h > 0 || e.st === 'jump';
  var mx = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0), mz = (KIT.held('down') ? 1 : 0) - (KIT.held('up') ? 1 : 0);
  if (G.bot) { var bi = botInput(); mx = bi.mx; mz = bi.mz; }
  var sp = H.spd * (e.fast > 0 ? 1.3 : 1);
  if (!air) {
    if (mx) { if (KIT.pressed(mx > 0 ? 'right' : 'left')) { if (G.t - (e.tapT || -9) < 0.25 && e.tapD === mx) e.running = true; e.tapT = G.t; e.tapD = mx; } }
    else e.running = false;
    if (mx && mx !== e.face) e.running = false;
    var spd = e.running ? H.run * (e.fast > 0 ? 1.25 : 1) : sp;
    e.vx = mx * spd; e.vz = mz * sp * 0.62; if (mx) e.face = mx;
    e.st = mx || mz ? (e.running ? 'run' : 'walk') : 'idle'; if (mx || mz) e.anim += dt;
    // walking into someone grabs them
    if (mx && !e.weapon) { var g = grabbable(e); if (g) { e.grabTry = (e.grabTry || 0) + dt; if (e.grabTry > 0.14) return grabStart(e, g); } else e.grabTry = 0; } else e.grabTry = 0;
  } else { if (mx) { e.vx += mx * 300 * dt; e.vx = clamp(e.vx, -H.run, H.run); } }
  var A = KIT.pressed('a') || (G.bot && G.botA), B = KIT.pressed('b') || (G.bot && G.botB), X = KIT.pressed('x') || (G.bot && G.botX), Y = KIT.pressed('y') || (G.bot && G.botY);
  if (Y && e.meter >= 100 && !air) return startSuper(e);
  if (B && !air) { e.vh = H.jump; e.h = 0.5; e.st = 'jump'; e.airDone = false; sfx.play('jump'); dust(e.x, e.z, 2); if (!mx) e.vx = 0; return; }
  if (X && e.spCd <= 0) { var k = motion(e, [2, 3, 6], 0.4) ? 'fireEX' : motion(e, [6, 2, 3], 0.4) ? 'riseEX' : dn === 8 || dn === 7 || dn === 9 ? 'rise' : dn === 6 ? 'dash' : dn === 2 || dn === 1 || dn === 3 ? 'ground' : 'fire';
    if (G.bot && G.botK) k = G.botK;
    if (air && k !== 'rise' && k !== 'riseEX') return; e.spCd = 0.55; e.running = false; return doSpecial(e, k); }
  if (A) {
    if (air) { if (!e.airDone) { e.airDone = true; startMove(e, H.air); e.mv = H.air; e.st = 'atk'; } return; }
    var it = nearItem(e); if (it && !(e.weapon && WEAPONS[it.id])) { takeItem(e, it); return; }
    if (motion(e, [2, 3, 6], 0.35)) { e.spCd = 0.5; return doSpecial(e, 'fireEX'); }
    if (motion(e, [6, 2, 3], 0.35)) { e.spCd = 0.5; return doSpecial(e, 'riseEX'); }
    if (e.weapon) return weaponAttack(e, dn);
    if (e.running) { e.running = false; return startMove(e, H.dash); }
    if (G.t - e.lastAtk > 0.6) e.ci = 0;
    startMove(e, H.combo[e.ci]); e.lastAtk = G.t; return;
  }
}
/* the engine side of a move: lunges, the active window, shots, rising, rings, chaining the combo */
function stepMove(e, dt) {
  var m = e.mv, t = (e.mvT += dt), H = e.hero, f = e.mf;
  if (m.inv && t < m.st + m.ac) e.inv = Math.max(e.inv, 0.03);
  if (m.lunge && t >= m.st * 0.5 && t < m.st + m.ac) { e.vx = e.face * m.lunge; if (m.fx && Math.random() < 0.4) G.fx.push({ k: 'spr', spr: m.fx, x: e.x - e.face * 10, z: e.z, h: 0, t: 0, life: 0.3 }); }
  if (m.rise && t >= m.st && !f.rose) { f.rose = 1; e.vh = m.vh; e.h = 1; e.vx = e.face * (m.fwd || 0); sfx.play('rise'); }
  if (t >= m.st && m.shot && !f.shot) { f.shot = 1; sfx.play('fire'); var hh = m.shot.ground ? 0 : e.ht * 0.5;
    if (m.triple) [-14, 0, 14].forEach(function (dz) { shoot(e, m.shot, { h: hh, dz: dz, vz: dz * 2 }); }); else shoot(e, m.shot, { h: hh });
    if (m.kind === 'fire' && m.ex) KIT.flash(0.05); }
  if (m.ring && t >= m.st && !f.ring) { f.ring = 1; G.fx.push({ k: 'ring', x: e.x, z: e.z, t: 0, life: 0.35, r: m.ring, col: H.col }); KIT.shake(m.quake ? 7 : 4); sfx.play(m.quake ? 'boom' : 'heavy');
    hitArea(e.x, e.z, m.ring, m.ring * 0.4, { dmg: m.dmg, kd: m.kd, kb: m.kb || 140, lift: m.lift, from: e, team: 'p', hs: 0.08, meter: 6 }); if (m.fx) for (var i = 0; i < 6; i++) G.fx.push({ k: 'spr', spr: m.fx, x: e.x + rnd(-m.ring, m.ring), z: e.z + rnd(-8, 8), h: 0, t: 0, life: 0.4 }); if (m.shield) e.shieldT = m.shield; }
  var act = t >= m.st && t < m.st + m.ac && m.box && m.dmg > 0 && !m.shot;
  if (m.rise && f.rose) act = e.h > 0 || e.vh > 0;
  if (act) { if (m.hits > 1 && t - (f.lastReset || 0) > m.ac / m.hits * 0.9) { f.lastReset = t; e.hit = {}; } var n = hitWith(e, m); if (n) { f.landed = 1; if (e.weapon && m.weap) weaponWear(e, n); } }
  if (m.air) { if (e.h <= 0) { e.mv = null; e.st = 'idle'; } return; }
  if (m.rise) { if (f.rose && e.h <= 0 && e.vh <= 0 && t > m.st + 0.1) { e.mv = null; e.st = 'idle'; e.vx = 0; } return; }
  if (t >= m.st + m.ac + m.rc) {
    var next = e.team === 'p' && e.buf && !m.weap && H.combo.indexOf(m) >= 0 && H.combo.indexOf(m) < H.combo.length - 1 && (f.landed || H.combo.indexOf(m) < 1);
    var bx = e.bufX; e.mv = null; e.st = 'idle'; e.buf = 0; e.bufX = 0; e.vx = 0;
    if (next) { e.ci = H.combo.indexOf(m) + 1; startMove(e, H.combo[e.ci]); e.lastAtk = G.t; }
    else { e.ci = 0; if (bx && e.spCd <= 0 && f.landed) { e.spCd = 0.5; doSpecial(e, 'fire'); } } // a special cancels the end of a combo that hit, like Street Fighter
  }
}
function doSpecial(e, k) { var m = e.spm[k]; if (!m) return; e.running = false; startMove(e, m); if (m.ex) { G.fx.push({ k: 'text', s: 'EX!', x: e.x, z: e.z, h: e.ht + 14, t: 0, life: 0.6, col: '#ffe36a' }); } }
function breakaway(e) { e.hp -= 10; e.st = 'idle'; e.inv = 0.6; G.fx.push({ k: 'ring', x: e.x, z: e.z, t: 0, life: 0.3, r: 46, col: '#ffffff' }); sfx.play('heavy'); KIT.shake(4); hitArea(e.x, e.z, 46, 18, { dmg: 6, kd: true, kb: 200, lift: 200, from: e, team: 'p' }); G.callout = { s: 'BREAKAWAY', t: 0.8 }; }

/* ---------- weapons ---------- */
function weaponAttack(e, dn) {
  var w = WEAPONS[e.weapon.id], H = e.hero;
  if (w.kind === 'melee') {
    if (dn === 2 || dn === 1 || dn === 3) { // down + A: throw it
      shoot(e, { spr: e.weapon.id, spd: 320, dmg: w.dmg * 1.4, kd: true, kb: 200, spin: 1, life: 0.9 }, { h: e.ht * 0.5 }); e.weapon = null; sfx.play('throw'); startMove(e, MV({ pose: H.combo[1].pose, st: 0.05, ac: 0.02, rc: 0.18, dmg: 0, box: null })); return; }
    startMove(e, MV({ pose: H.combo[1].pose, st: 0.07, ac: 0.09, rc: w.spd, box: [0, w.reach, 4, H.ht], dmg: w.dmg, kb: w.kb, kd: !!w.kd, lift: w.kd ? 200 : 0, sfx: w.sfx, hs: 0.07, weap: 1, zr: w.wide ? 16 : 10, meter: 5 }));
    return;
  }
  if (w.kind === 'gun' && e.gunCd > 0) return;
  shoot(e, w.shot, { h: e.ht * 0.55 }); e.gunCd = w.rate || 0; sfx.play(w.kind === 'gun' ? 'gun' : 'throw');
  startMove(e, MV({ pose: H.combo[0].pose, st: 0.03, ac: 0.02, rc: w.kind === 'gun' ? 0.1 : 0.2, dmg: 0, box: null, weap: 1 }));
  weaponWear(e, 1);
}
function weaponWear(e, n) { if (!e.weapon) return; e.weapon.dur -= n; if (e.weapon.dur <= 0) { var w = WEAPONS[e.weapon.id]; e.weapon = null; sfx.play('crash'); G.fx.push({ k: 'text', s: w.kind === 'melee' ? 'BROKEN!' : 'EMPTY!', x: e.x, z: e.z, h: e.ht + 10, t: 0, life: 0.8, col: '#ff2630' }); for (var i = 0; i < 4; i++) G.fx.push({ k: 'spr', spr: 'b_bits', x: e.x + e.face * 14, z: e.z, h: 24, vx: rnd(-60, 60), vh: rnd(60, 160), grav: 1, life: 0.6, t: 0 }); } }

/* ---------- grabs ---------- */
function grabbable(e) { var best = null; G.ents.forEach(function (t) { if (t.team !== 'f' || t.boss || t.h > 0 || t.def.ghost || !(t.st === 'idle' || t.st === 'walk' || t.st === 'hurt') || t.leaving || !t.inside) return; if (Math.abs(t.z - e.z) > 6) return; var dx = (t.x - e.x) * e.face; if (dx > 0 && dx < (t.w + e.w) / 2 + 6) best = t; }); return best; }
function grabStart(e, t) { e.st = 'grab'; e.held = t; e.t = 0; e.knees = 0; e.mv = null; t.st = 'grabbed'; t.heldBy = e; t.vx = t.vz = 0; t.face = -e.face; sfx.play('grab'); e.grabTry = 0; }
function letGo(e) { var t = e.held; if (t && t.st === 'grabbed') { t.st = 'hurt'; t.stun = 0.4; t.heldBy = null; } e.held = null; if (e.st === 'grab') e.st = 'idle'; }
function stepGrab(e, dt) {
  var t = e.held; if (!t || t.hp <= 0 || t.st !== 'grabbed') { e.held = null; e.st = 'idle'; return; }
  t.x = e.x + e.face * ((t.w + e.w) / 2 + 2); t.z = e.z; t.h = 0;
  if (e.mv) { stepMove(e, dt); if (e.mv === null) e.st = 'grab'; return; }
  if (e.t > 1.8) { letGo(e); return; }
  var dn = dirNow(e), A = KIT.pressed('a') || (G.bot && G.botA);
  if (A) {
    var thr = dn === 6 || dn === 4 || e.knees >= 2;
    if (thr) { if (dn === 4) e.face = -e.face; throwFoe(e, t); return; }
    e.knees++; var m = e.hero.knee; e.mv = m; e.mvT = 0; e.hit = {}; e.mf = {}; e.st = 'grab';
    strike(t, { dmg: m.dmg, kb: 0, stun: 0.5, hs: 0.06, from: e, meter: 5, heal: m.heal }, e.face); t.st = 'grabbed'; t.stun = 0;
  }
}
function throwFoe(e, t) {
  e.held = null; e.st = 'atk'; startMove(e, MV({ pose: e.hero.wind, st: 0.05, ac: 0.02, rc: 0.25, dmg: 0, box: null, n: 'THROW' }));
  t.heldBy = null; strike(t, { dmg: 16 * (e.hero.armorHeavy ? 1.3 : 1), kd: true, kb: 280, lift: 200, hs: 0.08, from: e, meter: 10 }, e.face);
  if (t.hp > 0) { t.st = 'thrown'; t.vx = e.face * 280; t.vh = 200; t.h = 6; } sfx.play('throw'); KIT.shake(3);
}
/* thrown bodies bowl over anyone they fly into */
function stepThrown(e) { if (e.st !== 'thrown') return; G.ents.forEach(function (o) { if (o === e || o.team !== 'f' || !hittable(o) || o.boss && o.superArmor) return; if (Math.abs(o.x - e.x) < (o.w + e.w) / 2 && Math.abs(o.z - e.z) < 10) { if (!e.hit[o.id]) { e.hit[o.id] = 1; strike(o, { dmg: 12, kd: true, kb: 200, lift: 200, from: P, meter: 6 }, e.vx > 0 ? 1 : -1); } } }); }

/* ---------- supers: the screen goes dark, the face cuts in, then something big ---------- */
function startSuper(e) {
  var S = e.hero.sp.sup; e.meter = 0; e.st = 'idle'; e.vx = e.vz = 0; e.inv = 3; G.superT = 2.2; G.sup = { kind: S.kind, n: S.n, col: S.col, dmg: S.dmg, t: 0, hit: {}, x: e.x, z: e.z, face: e.face };
  G.cutin = { t: 0, n: S.n }; sfx.play('super'); KIT.flash(0.15); KIT.shake(4);
}
function stepSuper(dt) {
  var S = G.sup; if (!S) return; S.t += dt; G.superT -= dt; var e = P;
  if (S.t < 0.7) return; // the cut-in
  var foes = G.ents.filter(function (o) { return o.team === 'f' && o.hp > 0 && o.st !== 'dead' && o.st !== 'gone' && !o.leaving && o.x > G.cam - 20 && o.x < G.cam + KIT.W + 20; });
  var tick = Math.floor((S.t - 0.7) / 0.12); if (tick !== S.tick) { S.tick = tick;
    if (S.kind === 'beam') foes.forEach(function (o) { if ((o.x - S.x) * S.face > -10 && Math.abs(o.z - S.z) < 22) { o.inv = 0; strike(o, { dmg: S.dmg / 10, kb: 40, stun: 0.5, hs: 0.02, from: e, meter: 0, sfx: 'hit', kd: tick === 9, lift: 240 }, S.face); } });
    if (S.kind === 'storm' || S.kind === 'pies') { var o = foes[tick % Math.max(1, foes.length)]; if (o) { G.fx.push({ k: S.kind === 'storm' ? 'column' : 'piefall', x: o.x, z: o.z, t: 0, life: 0.35 }); o.inv = 0; strike(o, { dmg: S.dmg / 4, kd: true, kb: 120, lift: 260, hs: 0.04, from: e, meter: 0, sfx: S.kind === 'storm' ? 'splash' : 'splat' }, o.x >= S.x ? 1 : -1); } else G.fx.push({ k: S.kind === 'storm' ? 'column' : 'piefall', x: G.cam + rnd(30, KIT.W - 30), z: rnd(10, DEPTH - 10), t: 0, life: 0.35 }); }
    if (S.kind === 'flood') { var r = (S.t - 0.7) * 380; foes.forEach(function (o) { if (Math.abs(o.x - S.x) < r && !S.hit[o.id]) { S.hit[o.id] = 1; o.inv = 0; strike(o, { dmg: S.dmg, kd: true, kb: 220, lift: 300, hs: 0.06, from: e, meter: 0, sfx: 'splash' }, o.x >= S.x ? 1 : -1); } }); }
  }
  if (G.superT <= 0) { G.sup = null; G.superT = 0; e.inv = 0.4; }
}
function playerOut() {
  G.lives--; if (G.lives < 0) { G.lives = 0; return gameOver(); }
  var e = P; e.hp = e.mhp; e.st = 'air'; e.h = 160; e.vh = 0; e.inv = 2.6; e.x = clamp(e.x, G.cam + 40, G.cam + KIT.W - 40); e.weapon = null; e.meter = Math.max(e.meter, 50); e.juggle = 0;
  G.fx.push({ k: 'ring', x: e.x, z: e.z, t: 0, life: 0.4, r: 70, col: '#ffe36a' }); hitArea(e.x, e.z, 70, 30, { dmg: 0, kd: true, kb: 200, lift: 200, from: e, team: 'p' }); sfx.play('power');
}
