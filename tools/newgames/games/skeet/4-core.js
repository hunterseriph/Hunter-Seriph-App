/* =====================================================================================================
   THE FIGHT ENGINE: everyone stands on a floor band (x along the street, z into the screen, h up in the air).
   Moves have startup, active and recovery; a hit freezes both fighters for a moment (hit stop), pushes, stuns,
   launches (juggles) or knocks down. Shots, food, weapons and breakables live here too.
   ===================================================================================================== */
var G = { mode: 'title', t: 0, cam: 0, ents: [], shots: [], fx: [], items: [], props: [], puddles: [], hs: 0, slow: 0, combo: 0, comboT: 0 };
var P = null; // the player
function locked() { return G.lock !== null && G.lock !== undefined; } // the camera is held (a lock at 0 still counts: Boss Rush's arena starts there)
function sy(e) { return FLOOR + e.z; } // where someone's feet are on screen
function ent(o) { var e = { x: 0, z: 30, h: 0, vx: 0, vz: 0, vh: 0, face: 1, st: 'idle', t: 0, mv: null, mvT: 0, hit: {}, inv: 0, stun: 0, anim: 0, flash: 0, armor: 0, juggle: 0, id: ++ent.n }; for (var k in o) e[k] = o[k]; return e; }
ent.n = 0;

/* ---------- moving about ---------- */
function physics(e, dt) {
  if (e.st === 'grabbed') return;
  e.x += e.vx * dt; e.z += e.vz * dt;
  if (e.h > 0 || e.vh > 0) { e.vh -= GRAV * (e.floaty && e.vh < 0 ? 0.55 : 1) * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; landed(e); } }
  if (e.z < 0) e.z = 0; if (e.z > DEPTH) e.z = DEPTH;
  var ground = e.h <= 0 && e.st !== 'air' && e.st !== 'thrown';
  if (ground && !(e.mv && e.mv.lunge && e.mvT < e.mv.st + e.mv.ac) && e.st !== 'run' && !(e.mv && e.mv.dashT)) { e.vx *= Math.pow(0.0008, dt); e.vz *= Math.pow(0.0008, dt); }
  if (e.team === 'p' || (locked() && e.inside)) { var l = G.cam + 10, r = G.cam + KIT.W - 10; if (e.x < l) e.x = l; if (e.x > r) e.x = r; }
  if (e.team === 'f' && !e.inside && e.x > G.cam + 14 && e.x < G.cam + KIT.W - 14) e.inside = true;
}
function landed(e) {
  e.vh = 0;
  if (e.st === 'air' || e.st === 'thrown') {
    if (e.st === 'thrown') { hitArea(e.x, e.z, 26, 14, { dmg: 0, kd: true, kb: 120, lift: 160, from: e, team: e.team === 'f' ? 'p' : 'f' }); G.shake = 5; }
    if (e.bounce && e.bounce > 0) { e.vh = 120; e.h = 0.01; e.bounce = 0; sfx.play('land'); dust(e.x, e.z, 3); return; }
    e.st = 'down'; e.t = 0; e.vx *= 0.3; sfx.play('land'); dust(e.x, e.z, 5); KIT.shake(2);
  } else if (e.mv && e.mv.air) { e.mv = null; e.st = 'idle'; dust(e.x, e.z, 2); }
  else if (e.st === 'jump') { e.st = 'idle'; dust(e.x, e.z, 2); }
  if (e.mv && e.mv.riseT) { e.mv = null; e.st = 'idle'; }
}
function dust(x, z, n) { for (var i = 0; i < n; i++) G.fx.push({ k: 'spr', spr: 'fx_dust', x: x + rnd(-10, 10), z: z, h: rnd(0, 4), vx: rnd(-30, 30), vh: rnd(10, 40), life: 0.35, t: 0, alpha: 0.8 }); }

/* ---------- hitting ---------- */
function boxOf(e, b) { var a = e.x + e.face * b[0], c = e.x + e.face * b[1]; return { x0: Math.min(a, c), x1: Math.max(a, c), h0: e.h + b[2], h1: e.h + b[3] }; }
function overlaps(B, t, zr) { return t.x + t.w / 2 > B.x0 && t.x - t.w / 2 < B.x1 && t.h + t.ht > B.h0 && t.h < B.h1 && Math.abs(t.z - B.z) <= zr; }
function hittable(t) { return t.st !== 'dead' && t.st !== 'down' && t.st !== 'gone' && t.inv <= 0 && t.st !== 'getup' && !t.leaving && !t.intro; }
/* who an attacker of this team can hit (the player is not in G.ents, so foes get him added) */
function targetsOf(team) { var out = []; G.ents.forEach(function (e) { if (e.team !== team && e.team !== 'o' && hittable(e)) out.push(e); }); if (team === 'p') G.props.forEach(function (p) { if (p.hp > 0) out.push(p); }); else if (P && P.team !== team && hittable(P)) out.push(P); return out; }
/* one blow lands. m: {dmg, kb, lift, kd, stun, hs, sfx, fx, dir, from, guardBreak} */
function strike(t, m, dir) {
  var from = m.from;
  if (t.prop) { t.hp -= 1; spark(t.x, t.z, 22, 1); sfx.play('thud'); if (t.hp <= 0) breakProp(t); return true; }
  // the Hollow Knight blocks from the front unless he is busy attacking
  if (t.def && t.def.ai === 'shield' && !t.mv && t.st !== 'hurt' && t.st !== 'grabbed' && t.face === -dir && !m.guardBreak && !m.shot) { t.vx = dir * 80; spark(t.x - dir * 8, t.z, t.h + 22, 0, '#a6968f'); sfx.play('block'); t.blockT = 0.3; G.hs = 0.03; return false; }
  // a duel: holding back blocks (low attacks need down-back, jump-ins need standing). A little chip damage gets through
  if (G.duel && t.guard && !m.unblock && !t.prop && G.duel.phase === 'fight') { var okG = m.low ? t.guard === 'lo' : m.over ? t.guard === 'hi' : true;
    if (okG) { var chip = (m.dmg || 0) * 0.12; if (t.hp > 1) t.hp = Math.max(1, t.hp - chip); t.st = 'block'; t.mv = null; t.stun = 0.16 + Math.min(0.25, (m.dmg || 0) * 0.012); t.vx = dir * Math.max(90, (m.kb || 60) * 0.8);
      if (from && from.hero) from.vx = -dir * 30; spark(t.x - dir * 8, t.z, t.h + t.ht * (t.guard === 'lo' ? 0.35 : 0.7), 0, '#a6968f'); sfx.play('block'); G.hs = Math.max(G.hs, 0.04); if (t.hero) t.meter = Math.min(100, t.meter + 2); return false; } }
  var dmg = m.dmg * (t.team === 'p' ? G.hardK : 1) * (from && from.fire > 0 ? 1.3 : 1);
  t.hurtK = (m.low || t.crouch) ? 1 : (m.kb || 0) >= 100 ? 0 : (t.hurtK ? 0 : 1);
  if (t.team === 'p' && t.shieldT > 0) dmg *= 0.3;
  t.hp -= dmg; t.flash = 0.1; t.lastHitBy = from;
  if (t.team === 'p') { t.meter = Math.min(100, t.meter + dmg * 0.5); G.hurtThisStage = true; if (dmg > 0) { G.combo = 0; } }
  if (from && from.team === 'p' && t.team !== 'p') { from.meter = Math.min(100, from.meter + (m.meter || dmg * 0.5)); G.combo++; G.comboT = 1.4; G.best = Math.max(G.best || 0, G.combo); G.score += Math.round(dmg * 10) + G.combo * 5; G.tag = t; G.tagT = 2.5; if (m.heal) from.hp = Math.min(from.mhp, from.hp + m.heal); }
  if (G.duel && from && from.cpu && from.hero) from.meter = Math.min(100, from.meter + dmg * 0.6);
  if (G.duel && t.cpu && t.hero) t.meter = Math.min(100, t.meter + dmg * 0.4);
  if (from && from.def && from.def.drain) from.hp = Math.min(from.mhp, from.hp + dmg * 0.5);
  G.hs = Math.max(G.hs, m.hs || 0.05); spark(t.x - dir * 4, t.z, t.h + t.ht * 0.6, m.kd || dmg >= 14 ? 2 : 1); sfx.play(m.sfx || 'hit');
  if (m.kd || dmg >= 14) KIT.shake(m.kd ? 4 : 2);
  // armour (heavy foes, Greebo mid swing) eats the stagger, not the damage
  var armour = (t.armor > 0 && !m.kd) || (t.team === 'p' && t.mv && t.mv.armor && !m.kd) || (t.boss && !m.kd && t.hp > 0 && (t.superArmor > 0));
  if (t.armor > 0 && !m.kd) t.armor--;
  if (t.hp <= 0) { t.hp = 0; launch(t, dir, Math.max(150, m.kb || 0), Math.max(220, m.lift || 0)); onKO(t, from); return true; }
  if (t.boss) { t.stagger = (t.stagger || 0) + dmg; if (t.stagger < t.poise && !m.kd) { t.vx += dir * (m.kb || 30) * 0.2; return true; } t.stagger = 0; }
  if (armour) { t.vx += dir * 10; return true; }
  if (t.st === 'grabbed') return true;
  if (m.kd || t.h > 0 || t.st === 'air') { launch(t, dir, m.kb || 120, (m.lift || 180) * Math.pow(0.82, t.juggle)); t.juggle++; return true; }
  t.st = 'hurt'; t.t = 0; t.stun = (m.stun || 0.32) * (t.boss ? 0.5 : 1); t.mv = null; t.superArmor = 0; if (t.boss) G.beam = null; t.vx = dir * (m.kb || 30); if (t.team === 'p') dropWeapon(t);
  return true;
}
function launch(t, dir, kb, lift) { t.superArmor = 0; if (t.boss) G.beam = null; t.st = 'air'; t.t = 0; t.mv = null; t.vx = dir * kb; t.vh = lift; t.h = Math.max(t.h, 1); t.bounce = lift > 250 ? 1 : 0; if (t.team === 'p') dropWeapon(t); if (t.grabbing) letGo(t); }
/* an attacker's active box against everyone on the other side; each target once per move */
function hitWith(e, mv, box) {
  var B = boxOf(e, box || mv.box); B.z = e.z; var n = 0;
  targetsOf(e.team).forEach(function (t) { if (e.hit[t.id]) return; if (!overlaps(B, t, mv.zr || 9)) return; e.hit[t.id] = 1; var d = t.prop ? e.face : (t.x >= e.x ? 1 : -1); if (strike(t, { dmg: mv.dmg, kb: mv.kb, lift: mv.lift, kd: mv.kd, stun: mv.stun, hs: mv.hs, sfx: mv.sfx, from: e, meter: mv.meter, heal: mv.heal, guardBreak: mv.guardBreak }, d)) n++; });
  return n;
}
/* everything near a point (ground pounds, explosions, throws landing) */
function hitArea(x, z, r, zr, m) {
  var n = 0; targetsOf(m.team || 'p').forEach(function (t) { if (t === m.from || t.assist) return; if (Math.abs(t.x - x) > r + (t.w || 16) / 2 || Math.abs(t.z - z) > zr) return; if (t.h > 40 && !m.air) return; if (strike(t, m, t.x >= x ? 1 : -1)) n++; });
  return n;
}
function onKO(t, from) {
  if (G.duel) return duelKO(t, from);
  if (t.team === 'f') { G.kills++; if (!t.boss) G.score += t.def.score || 200; if (t.washed) { t.freed = true; } if (t.boss) bossDown(t); else if (Math.random() < 0.22) dropItem(pick(RANDOMDROP), t.x, t.z); }
  if (G.ents.filter(function (e) { return e.team === 'f' && e.hp > 0 && e.st !== 'dead'; }).length === 0 && (locked() || G.bossOn)) { G.slow = 0.6; } // the last one down: a moment of slow motion
}
function spark(x, z, h, size, col) { G.fx.push({ k: 'spark', x: x, z: z, h: h, t: 0, life: 0.18, size: size, col: col }); }

/* ---------- shots ---------- */
function shoot(owner, s, o) {
  o = o || {}; var dir = o.dir || owner.face;
  var b = { team: owner.team, owner: owner, x: owner.x + dir * (o.dx || 16), z: owner.z + (o.dz || 0), h: owner.h + (o.h !== undefined ? o.h : 24), vx: dir * (s.spd || 200) * (o.k || 1), vz: o.vz || 0, vh: s.arc ? s.arc * (o.lob || 1) : 0, grav: s.arc ? GRAV * 0.9 : 0,
    spr: s.spr, dmg: s.dmg, kb: s.kb || 60, kd: s.kd, stun: s.stun || 0.35, life: s.life || 2.2, t: 0, pierce: s.pierce, hit: {}, boom: s.boom, splat: s.splat, bubble: s.bubble, puddle: s.puddle, bounce: s.bounce || 0, boomer: s.boomer, spin: s.spin, ground: s.ground, big: s.big, col: s.col, silly: s.silly, green: s.green, dir: dir, fuse: s.fuse };
  if (b.ground) b.h = 0; G.shots.push(b); return b;
}
function stepShots(dt) {
  G.shots = G.shots.filter(function (b) {
    b.t += dt; b.x += b.vx * dt; b.z += b.vz * dt; if (b.grav) { b.vh -= b.grav * dt; b.h += b.vh * dt; }
    if (b.boomer && b.t > 0.45 && !b.back) { b.back = 1; b.vx = -b.vx; b.hit = {}; }
    if (b.boomer && b.back && b.owner && Math.abs(b.x - b.owner.x) < 14 && Math.abs(b.z - b.owner.z) < 12) return false;
    if (b.grav && b.h <= 0) { b.h = 0; if (b.bounce > 0) { b.bounce--; b.vh = 160; } else return burst(b); }
    // hits
    var targets = b.team === 'p' ? targetsOf('p') : (P && hittable(P) ? [P] : []);
    for (var i = 0; i < targets.length; i++) { var t = targets[i]; if (b.hit[t.id]) continue;
      if (Math.abs(t.x - b.x) < t.w / 2 + (b.big ? 12 : 6) && Math.abs(t.z - b.z) < (b.big ? 14 : 10) && b.h + 6 > t.h && b.h - 6 < t.h + t.ht) {
        b.hit[t.id] = 1;
        if (b.boom) return burst(b);
        if (b.bubble && !t.boss && !t.prop) { t.st = 'hurt'; t.stun = b.bubble; t.bubbled = b.bubble; t.vx = 0; t.mv = null; sfx.play('bubble'); return false; }
        if (b.team === 'f' && b.splat && t === P) G.splat = 1.4;
        strike(t, { dmg: b.dmg, kb: b.kb, kd: b.kd, stun: b.stun, hs: 0.04, from: b.owner, shot: 1, lift: 200 }, b.vx >= 0 ? 1 : -1);
        if (b.silly && t.team === 'f') { t.silly = 3; }
        if (b.puddle) return burst(b);
        if (!b.pierce) { G.fx.push({ k: 'spr', spr: b.green ? 'fx_goo' : b.team === 'f' && b.spr === 's_orb' ? 'fx_goo' : 'fx_cream', x: b.x, z: b.z, h: b.h, t: 0, life: 0.25 }); return false; }
      } }
    if (b.t > b.life || b.x < G.cam - 80 || b.x > G.cam + KIT.W + 80) { if (b.boom || b.puddle) return burst(b); return false; }
    return true;
  });
}
function burst(b) {
  if (b.boom) { G.fx.push({ k: 'ring', x: b.x, z: b.z, t: 0, life: 0.3, r: b.boom, col: b.fuse ? '#ffe36a' : '#fffbe8' }); if (b.splat) G.fx.push({ k: 'spr', spr: 'fx_cream', x: b.x, z: b.z, h: 0, t: 0, life: 0.4, sc: 1.6 }); sfx.play(b.fuse ? 'boom' : 'splat'); KIT.shake(b.fuse ? 6 : 3);
    hitArea(b.x, b.z, b.boom, b.boom * 0.45, { dmg: b.dmg, kd: b.kd, kb: 160, lift: 240, from: b.owner, team: b.team, hs: 0.06 }); if (b.team === 'f' && b.splat && P && Math.abs(P.x - b.x) < b.boom && Math.abs(P.z - b.z) < 18) G.splat = 1.4; }
  if (b.puddle) { G.puddles.push({ x: b.x, z: b.z, r: 18, t: 0, life: b.puddle, team: b.team, dmg: 3, col: b.green ? '#4aa82a' : '#9a3ad8', owner: b.owner }); sfx.play('splat'); }
  if (!b.boom && !b.puddle) G.fx.push({ k: 'spr', spr: 'fx_cream', x: b.x, z: b.z, h: 0, t: 0, life: 0.25 });
  return false;
}
function stepPuddles(dt) {
  G.puddles = G.puddles.filter(function (q) { q.t += dt; q.tick = (q.tick || 0) - dt;
    if (q.tick <= 0) { q.tick = 0.4; var vs = q.team === 'p' ? targetsOf('p').filter(function (t) { return !t.prop; }) : (P && hittable(P) ? [P] : []); vs.forEach(function (t) { if (t.h < 4 && Math.abs(t.x - q.x) < q.r && Math.abs(t.z - q.z) < 9) { t.hp -= q.dmg; t.flash = 0.08; if (t.hp <= 0 && t.st !== 'dead') { t.hp = 0; launch(t, 1, 80, 200); onKO(t, q.owner); } } }); }
    return q.t < q.life; });
}

/* ---------- food, weapons, breakables ---------- */
function dropItem(id, x, z) { G.items.push({ id: id, x: x, z: Math.max(2, Math.min(DEPTH - 2, z)), h: 16, vh: 140, t: 0, dur: WEAPONS[id] ? WEAPONS[id].dur : 0 }); }
function stepItems(dt) {
  G.items.forEach(function (it) { it.t += dt; if (it.h > 0 || it.vh > 0) { it.vh -= GRAV * dt; it.h += it.vh * dt; if (it.h <= 0) { it.h = 0; it.vh = it.vh < -120 ? -it.vh * 0.3 : 0; } } });
  G.items = G.items.filter(function (it) { return it.t < 30 || WEAPONS[it.id]; });
}
function nearItem(e) { var best = null, bd = 99; G.items.forEach(function (it) { var d = Math.abs(it.x - e.x) + Math.abs(it.z - e.z) * 1.5; if (it.h < 4 && d < 22 && d < bd) { bd = d; best = it; } }); return best; }
function takeItem(e, it) {
  G.items.splice(G.items.indexOf(it), 1);
  var f = FOOD[it.id];
  if (f) { if (f.heal) e.hp = Math.min(e.mhp, e.hp + f.heal); if (f.fast) e.fast = f.fast; if (f.fire) e.fire = f.fire; if (f.score) G.score += f.score; if (f.life) G.lives++;
    G.fx.push({ k: 'text', s: f.heal >= 999 ? 'FULL HEALTH!' : f.heal ? '+' + f.heal : f.life ? '1 UP!' : '+' + f.score, x: e.x, z: e.z, h: e.ht + 8, t: 0, life: 0.9, col: f.heal ? '#9aff5a' : '#ffe36a' }); sfx.play(f.heal ? 'eat' : 'coin'); return; }
  e.weapon = { id: it.id, dur: it.dur || WEAPONS[it.id].dur }; sfx.play('pickup'); G.fx.push({ k: 'text', s: WEAPONS[it.id].n, x: e.x, z: e.z, h: e.ht + 8, t: 0, life: 1.1, col: '#ffe36a' });
}
function dropWeapon(e) { if (!e.weapon) return; var w = e.weapon; e.weapon = null; if (w.dur > 0) { G.items.push({ id: w.id, x: e.x + e.face * 14, z: e.z, h: 20, vh: 120, t: 0, dur: w.dur }); } }
function breakProp(p) { p.hp = 0; p.gone = true; sfx.play('crash'); KIT.shake(2); for (var i = 0; i < 5; i++) G.fx.push({ k: 'spr', spr: 'b_bits', x: p.x + rnd(-8, 8), z: p.z, h: rnd(4, 16), vx: rnd(-80, 80), vh: rnd(80, 200), grav: 1, life: 0.7, t: 0, rot: rnd(0, 6) }); if (p.drop) dropItem(p.drop, p.x, p.z); G.score += 100; }
function stepFx(dt) {
  G.fx = G.fx.filter(function (f) { f.t += dt; if (f.vx) f.x += f.vx * dt; if (f.vh !== undefined) { if (f.grav) f.vh -= GRAV * dt; f.h += f.vh * dt; if (f.grav && f.h < 0) { f.h = 0; f.vh = 0; f.vx *= 0.5; } } return f.t < f.life; });
  if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) { if (G.combo >= 5) G.score += G.combo * 50; G.combo = 0; } }
}
