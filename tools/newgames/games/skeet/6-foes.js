/* =====================================================================================================
   FOES AND BOSSES. Only a couple of foes attack at once (they take turns: G.tokens); the others circle, so you are
   never mobbed unfairly. Every attack is shown before it lands: a wind-up pose and a flash. Ranged foes keep their
   distance and line up with you. The brainwashed homunculi leap at you; beat them and the goo comes out.
   ===================================================================================================== */
function foeFrames(id) {
  if (id.indexOf('wb:') === 0) { var p = id.split(':'), b = 'wb_' + p[1] + '_' + p[2] + '_'; return { walk: [b + 'run0', b + 'run1', b + 'run2', b + 'run3'], idle: b + 'idle0', atk: b + 'atk', wind: b + 'idle0', hurt: b + 'hurt', jump: b + 'jump', free: 'h_' + p[1] + '_' + p[2] + '_' }; }
  var s = 'sf_' + id + '_'; return { walk: [s + '0', s + '1', s + '2', s + '3'], idle: s + '0', atk: s + 'lean', wind: s + 'wind', hurt: s + 'wind' };
}
function foeDef(id) { if (id.indexOf('wb:') === 0) { var p = id.split(':'); return washed(p[1], p[2]); } return FOES[id]; }
function spawnFoe(id, side, o) {
  o = o || {}; var d = foeDef(id), k = G.foeK;
  var e = ent({ team: 'f', def: d, fid: id, fr: foeFrames(id), hp: d.hp * k.hp, mhp: d.hp * k.hp, w: d.w, ht: d.ht, face: -side, armor: d.armor || 0, washed: d.washed,
    x: o.x !== undefined ? o.x : (side > 0 ? G.cam + KIT.W + 24 + rnd(0, 40) : G.cam - 24 - rnd(0, 40)), z: o.z !== undefined ? o.z : rnd(6, DEPTH - 6), cd: rnd(0.6, 1.6), side: side, think: 0, phase: rnd(0, 6) });
  e.atkM = MV({ pose: e.fr.atk, st: d.ai === 'heavy' ? 0.5 : 0.36, ac: 0.1, rc: 0.38, box: [2, d.reach, 6, d.ht - 4], dmg: d.dmg * k.dmg, kb: d.ai === 'heavy' ? 200 : 60, kd: d.ai === 'heavy', lift: d.ai === 'heavy' ? 220 : 0, stun: 0.38, zr: d.ai === 'heavy' ? 14 : 8, foe: 1 });
  G.ents.push(e); return e;
}
function tokens() { return G.ents.filter(function (e) { return e.team === 'f' && e.tok && e.hp > 0; }).length; }
function maxTokens() { return Math.min(3, 1 + Math.floor((G.si + 2) / 3)) + (G.hard ? 1 : 0); }
function freeToken(e) { e.tok = false; e.cd = rnd(0.9, 1.9) / (G.hard ? 1.3 : 1); }

function stepFoe(e, dt) {
  e.t += dt; if (e.flash > 0) e.flash -= dt; if (e.inv > 0) e.inv -= dt; if (e.cd > 0) e.cd -= dt; if (e.silly > 0) e.silly -= dt; if (e.blockT > 0) e.blockT -= dt;
  if (e.boss) return stepBoss(e, dt);
  stepThrown(e);
  switch (e.st) {
    case 'gone': return;
    case 'dead': if (e.t > 0.9) { e.st = 'gone'; } return;
    case 'down': if (e.t > 0.8) { if (e.hp <= 0) { if (e.freed) { e.st = 'freedom'; e.t = 0; G.fx.push({ k: 'spr', spr: 'fx_heart', x: e.x, z: e.z, h: e.ht + 6, vh: 30, t: 0, life: 1.2 }); G.fx.push({ k: 'text', s: 'FREED!', x: e.x, z: e.z, h: e.ht + 18, t: 0, life: 1.2, col: '#ff9ad0' }); G.score += 300; sfx.play('freed'); G.freed = (G.freed || 0) + 1; } else { e.st = 'dead'; e.t = 0; } } else { e.st = 'getup'; e.t = 0; e.inv = 0.5; } } return;
    case 'freedom': e.leaving = true; if (e.t > 0.6) { e.face = e.x < P.x ? -1 : 1; e.vx = e.face * 140; e.anim += dt; if (e.x < G.cam - 40 || e.x > G.cam + KIT.W + 40) e.st = 'gone'; } return;
    case 'getup': if (e.t > 0.4) { e.st = 'idle'; e.juggle = 0; e.armor = e.def.armor || 0; } return;
    case 'air': case 'thrown': return;
    case 'grabbed': return;
    case 'hurt': if (e.tok) freeToken(e); e.stun -= dt; if (e.stun <= 0) { e.st = 'idle'; e.juggle = 0; e.bubbled = 0; } return;
    case 'atk': return stepFoeMove(e, dt);
    case 'wind': if (e.t > e.wind) { if (e.leap) { e.st = 'leap'; e.t = 0; e.vh = 270; e.h = 1; e.vx = clamp((P.x - e.x) * 1.5, -220, 220); e.vz = clamp((P.z - e.z) * 1.6, -60, 60); e.hit = {}; sfx.play('jump'); } else if (e.shooting) { e.st = 'idle'; e.shooting = 0; var s = e.def.shot; shoot(e, s, { h: s.arc ? 30 : e.ht * 0.55, vz: s.arc ? clamp((P.z - e.z) * 1.2, -40, 40) : 0, lob: s.arc ? 1 : 1, k: s.arc ? clamp(Math.abs(P.x - e.x) / 140, 0.5, 1.4) : 1 }); sfx.play('throw'); e.cd = rnd(1.6, 2.8); } else { startMove(e, e.atkM); e.t = 0; } } return;
    case 'leap': hitWith(e, MV({ box: [-6, 20, 0, e.ht], dmg: e.def.dmg * G.foeK.dmg, kb: 100, stun: 0.4, zr: 10 })); if (e.h <= 0 && e.t > 0.1) { e.st = 'idle'; e.leap = 0; e.vx = 0; e.vz = 0; freeToken(e); } return;
    case 'tele': if (e.t > 0.35) { e.x = P.x - P.face * 34; e.z = P.z; e.face = P.face; e.st = 'wind'; e.t = 0; e.wind = 0.28; e.alpha = 1; sfx.play('tele'); } return;
    case 'holding': if (!P || P.st !== 'grabbed' || P.heldBy !== e) { e.holding = null; e.st = 'idle'; freeToken(e); return; } P.x = e.x + e.face * 16; P.z = e.z; e.tick = (e.tick || 0) - dt; if (e.tick <= 0) { e.tick = 0.5; P.hp -= e.def.dmg * G.foeK.dmg * 0.6 * G.hardK; P.flash = 0.1; sfx.play('hurt'); if (P.hp <= 0) { P.heldBy = null; launch(P, -e.face, 120, 200); e.st = 'idle'; } } if (e.t > 2.6) { P.st = 'idle'; P.heldBy = null; e.st = 'idle'; freeToken(e); } return;
  }
  // free: think about where to stand and when to strike
  if (!P || P.st === 'dead' || G.mode !== 'play') { e.vx = 0; e.vz = 0; e.st = 'idle'; return; }
  var d = e.def, dx = P.x - e.x, dz = P.z - e.z, adx = Math.abs(dx), spd = d.spd * (G.hard ? 1.15 : 1) * (e.silly > 0 ? 0.5 : 1);
  if (!e.inside) { e.vx = Math.sign(dx) * spd * 1.2; e.vz = 0; e.st = 'walk'; e.anim += dt; e.face = Math.sign(dx) || 1; return; }
  e.face = dx >= 0 ? 1 : -1; if (e.silly > 0 && Math.sin(G.t * 9 + e.id) > 0) e.face = -e.face;
  var ranged = d.ai === 'caster' || d.ai === 'thrower' || d.ai === 'lobber';
  var tx, tz;
  if (ranged) { // keep away and line up, then shoot
    var want = d.ai === 'lobber' ? 120 : 140; tx = P.x - Math.sign(dx || e.side) * want; tz = d.ai === 'lobber' ? e.z : P.z;
    if (adx < 36 && e.cd <= 0) { e.st = 'wind'; e.t = 0; e.wind = 0.3; return; } // too close: a quick swipe
    if (Math.abs(adx - want) < 30 && (d.ai === 'lobber' || Math.abs(dz) < 6) && e.cd <= 0 && (G.t - (G.lastShot || 0)) > 0.5) { G.lastShot = G.t; e.st = 'wind'; e.t = 0; e.wind = 0.4; e.shooting = 1; e.flash = 0.05; return; }
  } else if (e.tok) { // my turn: get in range and line up
    tx = P.x - Math.sign(dx || 1) * (d.reach * 0.75 + P.w / 2); tz = P.z;
    if (d.ai === 'leaper' && adx < 100 && adx > 40 && Math.abs(dz) < 16) { e.st = 'wind'; e.t = 0; e.wind = 0.32; e.leap = 1; return; }
    if (d.ai === 'fast' && e.cd <= 0 && adx > 60 && Math.random() < 0.02) { e.st = 'tele'; e.t = 0; e.alpha = 0.3; sfx.play('tele'); return; }
    if (adx < d.reach + P.w / 2 && Math.abs(dz) < 5 && P.h < 20) { e.st = 'wind'; e.t = 0; e.wind = (d.ai === 'heavy' ? 0.5 : 0.34) / (G.hard ? 1.25 : 1); e.vx = e.vz = 0; e.flash = 0.06; return; }
    if (e.t > 5) freeToken(e);
  } else { // wait my turn: circle at a distance, on my side
    var side = e.side || (dx > 0 ? -1 : 1); tx = P.x + side * (74 + (e.id % 3) * 16); tz = clamp(P.z + Math.sin(G.t * 0.7 + e.phase) * 22, 2, DEPTH - 2);
    if (e.cd <= 0 && tokens() < maxTokens()) { e.tok = true; e.t = 0; }
    if (d.ai === 'leaper' && WASHSHOT[e.washed] && e.cd <= 0 && Math.abs(dz) < 6 && adx > 60 && Math.random() < 0.01) { e.st = 'wind'; e.t = 0; e.wind = 0.4; e.shooting = 1; return; }
  }
  if (e.washed && !e.def.shot && WASHSHOT[e.washed]) e.def.shot = WASHSHOT[e.washed];
  var mx = tx - e.x, mz = tz - e.z;
  e.vx = Math.abs(mx) > 4 ? Math.sign(mx) * spd : 0; e.vz = Math.abs(mz) > 2 ? Math.sign(mz) * spd * 0.55 : 0;
  // do not stack on top of each other
  G.ents.forEach(function (o) { if (o !== e && o.team === 'f' && o.hp > 0 && Math.abs(o.x - e.x) < 14 && Math.abs(o.z - e.z) < 6) { e.vz += (e.z >= o.z ? 1 : -1) * 30; } });
  e.st = e.vx || e.vz ? 'walk' : 'idle'; if (e.st === 'walk') e.anim += dt;
}
function stepFoeMove(e, dt) {
  var m = e.mv, t = (e.mvT += dt);
  if (t >= m.st && t < m.st + m.ac) {
    if (e.def.ai === 'grabber') { if (P && hittable(P) && P.st !== 'grabbed' && Math.abs(P.x - e.x) < e.def.reach + P.w / 2 + 4 && Math.abs(P.z - e.z) < 7 && P.h < 10) { P.st = 'grabbed'; P.heldBy = e; P.mash = 0; P.mv = null; e.st = 'holding'; e.t = 0; e.mv = null; sfx.play('grab'); G.callout = { s: 'MASH TO BREAK FREE!', t: 1.4 }; return; } }
    else hitWith(e, m);
  }
  if (t >= m.st + m.ac + m.rc) { e.mv = null; e.st = 'idle'; var hits = e.def.hits || 1; e.chain = (e.chain || 0) + 1; if (e.chain < hits && P && Math.abs(P.x - e.x) < e.def.reach + 20) { startMove(e, MV({ pose: e.fr.atk, st: 0.14, ac: 0.08, rc: 0.3, box: m.box, dmg: m.dmg * 0.8, kb: 60, stun: 0.3, zr: 8 })); return; } e.chain = 0; freeToken(e); }
}

/* ---------------------------------------------------------------- BOSSES */
function spawnBoss(id, x, z) {
  var d = BOSSES[id], k = G.foeK, hp = d.hp * k.hp * (G.rush ? 0.85 : 1);
  var e = ent({ team: 'f', boss: true, bid: id, def: d, hp: hp, mhp: hp, w: d.w, ht: d.ht, face: -1, x: x, z: z, cd: 1.2, poise: 34, intro: true, sc: d.sc, spr: d.spr, mvi: 0, wait: 1.2 });
  G.ents.push(e); return e;
}
function bossesLeft() { return G.ents.filter(function (e) { return e.boss && e.hp > 0; }); }
function stepBoss(e, dt) {
  var d = e.def; if (e.intro) { e.vx = 0; return; }
  switch (e.st) {
    case 'dead': return;
    case 'down': if (e.t > 0.9) { if (e.hp <= 0) { e.st = 'dead'; e.t = 0; } else { e.st = 'getup'; e.t = 0; e.inv = 0.8; } } return;
    case 'getup': if (e.t > 0.4) { e.st = 'idle'; e.juggle = 0; e.wait = 0.3; } return;
    case 'air': return;
    case 'hurt': e.stun -= dt; if (e.stun <= 0) { e.st = 'idle'; e.juggle = 0; } return;
    case 'grabbing': return bossGrab(e, dt);
    case 'move': return bossMove(e, dt);
  }
  if (!P || P.st === 'dead') { e.vx = 0; return; }
  var dx = P.x - e.x, dz = P.z - e.z, des = e.hp < e.mhp * 0.3, spd = d.spd * (des ? 1.3 : 1);
  // Blumhead turns Super at half health
  if (d.super && !e.superOn && e.hp < e.mhp * 0.5) { e.superOn = true; e.spr = d.super.spr; e.def = Object.assign({}, d, { moves: d.super.moves, n: d.super.n }); e.inv = 2; G.cutin = { t: 0, n: 'SUPER BLUMHEAD', boss: 1 }; G.superT = 1.4; music.play(d.super.song); KIT.flash(0.3); sfx.play('roar'); e.poise = 50; return; }
  e.face = dx >= 0 ? 1 : -1;
  e.wait -= dt * (des ? 1.5 : 1);
  if (e.wait > 0) { var want = 70 + (e.bid === 'cowpig' ? 60 : 0), tx = P.x - Math.sign(dx || 1) * want; e.vx = Math.abs(tx - e.x) > 8 ? Math.sign(tx - e.x) * spd : 0; e.vz = Math.abs(dz) > 4 ? Math.sign(dz) * spd * 0.5 : 0; e.st = e.vx || e.vz ? 'walk' : 'idle'; e.anim += dt; return; }
  var list = e.def.moves; e.mvName = list[e.mvi % list.length]; e.mvi++; if (Math.random() < 0.35) e.mvi++; e.st = 'move'; e.t = 0; e.mf = {}; e.hit = {}; e.vx = e.vz = 0; e.superArmor = 1;
}
/* every boss move: a wind-up you can see (flash, pose, a mark on the floor), the hit, then a gap to punish */
function bossMove(e, dt) {
  if (G.duel && e.mvName === 'summon') e.mvName = e.bid === 'blum' ? 'goo' : 'mugs'; // no extra foes in a one on one
  if (G.duel && e.mvName === 'mugs' && e.bid === 'execu') e.mvName = 'chop';
  var t = e.t, f = e.mf, d = e.def, n = e.mvName, des = e.hp < e.mhp * 0.3, k = des ? 0.75 : 1, dmg = d.dmg * G.foeK.dmg, done = function (gap) { e.st = 'idle'; e.superArmor = 0; e.wait = (gap || 0.9) * k * (G.hard ? 0.8 : 1); e.mv = null; e.vx = 0; e.vz = 0; };
  e.pose = t < 0.5 * k ? 'wind' : 'atk';
  if (n === 'sweep' || n === 'punch' || n === 'bite' || n === 'lasso') { var reach = n === 'lasso' ? 120 : n === 'sweep' ? 78 : n === 'bite' ? 60 : 48;
    if (t < 0.55 * k) { e.flash = Math.floor(t * 12) % 2 ? 0.05 : 0; if (n === 'bite') e.vx = e.face * 40; return; }
    if (!f.hit) { f.hit = 1; sfx.play(n === 'lasso' ? 'whip' : 'swing'); }
    if (t < 0.55 * k + 0.16) hitWith(e, MV({ box: [-8, reach, 0, d.ht], dmg: dmg, kb: 220, kd: n !== 'lasso', lift: 240, stun: n === 'lasso' ? 0.9 : 0.4, zr: 16, hs: 0.1, low: n === 'sweep' ? 1 : 0 }));
    if (t > 0.55 * k + 0.7) done(0.8); return; }
  if (n === 'chop') { if (t < 0.7 * k) { e.flash = Math.floor(t * 12) % 2 ? 0.05 : 0; return; }
    if (!f.hit) { f.hit = 1; KIT.shake(6); sfx.play('boom'); shoot(e, { spr: 's_wave', spd: 240, dmg: dmg * 0.8, kd: true, ground: 1, pierce: 1, life: 1.6, kb: 160, big: 1 }, { h: 0 }); }
    if (t < 0.7 * k + 0.14) hitWith(e, MV({ box: [0, 54, 0, d.ht], dmg: dmg * 1.2, kb: 200, kd: true, lift: 260, zr: 12, hs: 0.12 }));
    if (t > 0.7 * k + 0.8) done(1); return; }
  if (n === 'charge' || n === 'belly') { if (t < 0.6 * k) { e.vx = 0; if (Math.random() < 0.3) dust(e.x - e.face * 20, e.z, 1); e.flash = Math.floor(t * 12) % 2 ? 0.05 : 0; if (!f.lane) { f.lane = 1; e.z += clamp(P.z - e.z, -20, 20); } return; }
    if (!f.go) { f.go = 1; sfx.play('roar'); } e.vx = e.face * (n === 'belly' ? 300 : 260) * (des ? 1.15 : 1); e.anim += dt * 3;
    hitWith(e, MV({ box: [-10, 30, 0, d.ht], dmg: dmg, kb: 260, kd: true, lift: 280, zr: 14, hs: 0.1 }));
    var edge = e.face > 0 ? G.cam + VW() - 30 : G.cam + 30; if ((e.x - edge) * e.face >= 0 || t > 0.6 * k + 1.8) { e.x = clamp(e.x, G.cam + 30, G.cam + VW() - 30); e.vx = 0; KIT.shake(5); sfx.play('thud'); e.st = 'hurt'; e.stun = 1.1; e.superArmor = 0; e.wait = 0.6; G.fx.push({ k: 'text', s: 'DIZZY!', x: e.x, z: e.z, h: e.ht + 10, t: 0, life: 1, col: '#ffe36a' }); } return; }
  if (n === 'grab') { if (t < 0.4) { e.flash = 0.05; return; } e.vx = e.face * 220; if (P && hittable(P) && Math.abs(P.x - e.x) < e.w / 2 + 16 && Math.abs(P.z - e.z) < 8 && P.h < 10) { e.st = 'grabbing'; e.t = 0; P.st = 'grabbed'; P.heldBy = e; P.mash = 0; e.vx = 0; sfx.play('grab'); return; } if (t > 1.2) done(0.9); return; }
  if (n === 'swarm') { if (t < 0.6 * k) { e.flash = 0.04; if (!f.roar) { f.roar = 1; sfx.play('roar'); G.callout = { s: 'RAT SWARM!', t: 1 }; } return; }
    if (!f.go) { f.go = 1; var from = Math.random() < 0.5 ? -1 : 1, gap = Math.floor(rnd(0, 5)); for (var i = 0; i < 6; i++) { if (G.duel ? i > 0 : i === gap) continue; for (var j = 0; j < (G.duel ? 2 : 3); j++) { var b = shoot(e, { spr: 'f_rat_0', spd: 230, dmg: dmg * 0.5, ground: 1, life: 3, kb: 100, stun: 0.5 }, { dir: -from, h: 0 }); b.x = from > 0 ? G.cam + VW() + 20 + j * 30 : G.cam - 20 - j * 30; b.z = G.duel ? LANE : 4 + i * 12; b.rat = 1; if (G.duel) b.x = from > 0 ? G.cam + VW() + 20 + j * 70 : G.cam - 20 - j * 70; } } }
    if (t > 0.6 * k + 1.4) done(0.6); return; }
  if (n === 'summon') { if (t < 0.5) { e.flash = 0.04; return; } if (!f.go) { f.go = 1; sfx.play('roar'); var pool = e.bid === 'ratking' ? ['cultrat', 'cultrat'] : e.bid === 'blum' ? ['wb:blood:teen', 'wb:gloop:adult'] : ['cultist', 'cultist']; if (G.ents.filter(function (o) { return o.team === 'f' && !o.boss && o.hp > 0; }).length < 3) pool.forEach(function (id, i) { spawnFoe(id, i ? 1 : -1); }); } if (t > 1.1) done(0.8); return; }
  if (n === 'bounce' || n === 'slam' || n === 'leap') { if (!f.up) { f.up = 1; e.vh = n === 'bounce' ? 380 : 460; e.h = 1; f.tx = P.x; f.tz = P.z; sfx.play('jump'); G.fx.push({ k: 'mark', x: f.tx, z: f.tz, t: 0, life: 1.1, r: 34 }); }
    e.vx = clamp((f.tx - e.x) * 2.2, -260, 260); e.vz = clamp((f.tz - e.z) * 2.2, -80, 80);
    if (f.up && e.h <= 0 && t > 0.2) { if (!f.land) { f.land = 1; KIT.shake(8); sfx.play('boom'); G.fx.push({ k: 'ring', x: e.x, z: e.z, t: 0, life: 0.35, r: 60, col: '#ffffff' }); hitArea(e.x, e.z, 52, 22, { dmg: dmg * 1.1, kd: true, kb: 220, lift: 260, from: e, team: 'f', hs: 0.1, over: 1 }); if (n === 'bounce' && (f.n = (f.n || 0) + 1) < 3) { f.up = 0; f.land = 0; return; } } e.vx = 0; e.vz = 0; if (t > 2.6 || f.land) { if (!f.endT) f.endT = t; if (t - f.endT > 0.7) done(1); } } return; }
  if (n === 'mugs' || n === 'bones' || n === 'goo' || n === 'rocks' || n === 'rain') {
    if (t < 0.45 * k) { e.flash = Math.floor(t * 12) % 2 ? 0.05 : 0; return; }
    var count = n === 'rocks' ? 6 : n === 'rain' ? 12 : n === 'goo' ? 5 : 3;
    if (!f.go) { f.go = 1; f.i = 0; }
    if (f.i < count && t - 0.45 * k > f.i * (n === 'rain' || n === 'rocks' ? 0.14 : 0.12)) { var i2 = f.i++;
      if (n === 'rocks' || n === 'rain') { var rx = (n === 'rocks' && i2 % 2 === 0) ? P.x + rnd(-10, 10) : G.cam + rnd(30, VW() - 30), rz = (n === 'rocks' && i2 % 2 === 0) || G.duel ? P.z : rnd(4, DEPTH - 4); G.fx.push({ k: 'mark', x: rx, z: rz, t: 0, life: 0.8, r: 14 }); var rb = shoot(e, { spr: n === 'rocks' ? 's_rock' : 's_goo', spd: 0, arc: 1, dmg: dmg * 0.7, kd: n === 'rocks', boom: 16, life: 3 }, { h: 220 }); rb.x = rx; rb.z = rz; rb.vh = -40; rb.vx = 0; rb.grav = GRAV * 0.6; }
      else { var sh = n === 'mugs' ? { spr: 's_mug', spd: 150, arc: 230, dmg: dmg * 0.7, boom: 18 } : n === 'bones' ? { spr: 's_bone', spd: 160, arc: 220, dmg: dmg * 0.7, spin: 1 } : { spr: 's_goo', spd: 180, dmg: dmg * 0.7 };
        var spread = n === 'goo' ? (i2 - 2) * 26 : (i2 - 1) * 18; shoot(e, sh, { h: e.ht * 0.6, vz: clamp((P.z - e.z) * 1.2 + spread, -70, 70), k: sh.arc ? clamp(Math.abs(P.x - e.x) / 150, 0.5, 1.5) : 1 }); }
      sfx.play('throw'); }
    if (f.i >= count && t > 0.45 * k + count * 0.14 + 0.5) done(0.9); return; }
  if (n === 'spears') { if (!f.go) { f.go = 1; f.pts = []; for (var s = 0; s < (G.duel ? (des ? 4 : 3) : des ? 6 : 4); s++) { var px = s === 0 ? P.x : P.x + rnd(-80, 80), pz = s === 0 || G.duel ? P.z : rnd(4, DEPTH - 4); f.pts.push([px, pz]); G.fx.push({ k: 'mark', x: px, z: pz, t: 0, life: 0.9, r: 12 }); } sfx.play('rumble'); }
    if (t > 0.75 * k && !f.up) { f.up = 1; sfx.play('stab'); KIT.shake(4); f.pts.forEach(function (p) { G.fx.push({ k: 'spear', x: p[0], z: p[1], t: 0, life: 0.5 }); hitArea(p[0], p[1], 10, 8, { dmg: dmg, kd: true, kb: 60, lift: 360, from: e, team: 'f', hs: 0.08, low: 1 }); }); }
    if (t > 0.75 * k + 0.8) done(0.8); return; }
  if (n === 'pound') { if (t < 0.6 * k) { e.flash = Math.floor(t * 12) % 2 ? 0.05 : 0; return; } if (!f.go) { f.go = 1; KIT.shake(9); sfx.play('boom'); G.waves.push({ x: e.x, z: e.z, r: 10, spd: 190, max: 260, dmg: dmg, hit: false }); }
    if (des && f.go && !f.two && t > 0.6 * k + 0.45) { f.two = 1; G.waves.push({ x: e.x, z: e.z, r: 10, spd: 220, max: 260, dmg: dmg, hit: false }); sfx.play('boom'); } // desperate: a second ring
    if (t > 0.6 * k + 1.1) done(0.9); return; }
  if (n === 'teleport') { if (!f.go) { f.go = 1; e.alpha = 0.2; sfx.play('tele'); } if (t > 0.5 && !f.there) { f.there = 1; e.x = clamp(P.x - P.face * 50, G.cam + 40, G.cam + KIT.W - 40); e.z = P.z; e.alpha = 1; e.face = P.x >= e.x ? 1 : -1; e.vh = 300; e.h = 1; G.fx.push({ k: 'mark', x: P.x, z: P.z, t: 0, life: 0.7, r: 30 }); }
    if (f.there && e.h <= 0 && t > 0.7 && !f.land) { f.land = 1; KIT.shake(6); sfx.play('boom'); hitArea(e.x, e.z, 50, 20, { dmg: dmg, kd: true, kb: 220, lift: 260, from: e, team: 'f' }); G.fx.push({ k: 'ring', x: e.x, z: e.z, t: 0, life: 0.3, r: 50, col: '#d08aff' }); }
    if (f.land && t > 1.5) done(0.9); return; }
  if (n === 'beam') { if (!f.go) { f.go = 1; f.z = P.z; e.z = clamp(P.z, 0, DEPTH); sfx.play('charge'); G.callout = { s: 'GET OUT OF THE WAY!', t: 1 }; }
    if (t > 0.9 * k && t < 0.9 * k + 0.9) { G.beam = { x: e.x, z: e.z, face: e.face, t: t }; if (P && hittable(P) && Math.abs(P.z - e.z) < 9 && P.h < 30 && (P.x - e.x) * e.face > 0) { if (!(G.duel && P.crouch && P.h <= 0 && e.bid === 'blum')) strike(P, { dmg: dmg * 1.2, kd: true, kb: 240, lift: 260, from: e, hs: 0.1 }, e.face); } }
    else G.beam = t <= 0.9 * k ? { x: e.x, z: e.z, face: e.face, t: t, warn: 1 } : null;
    if (t > 0.9 * k + 1.3) { G.beam = null; done(1); } return; }
  done(0.5);
}
function bossGrab(e, dt) { if (!P || P.heldBy !== e) { e.st = 'idle'; e.wait = 0.5; return; } P.x = e.x + e.face * (e.w / 2 + 8); P.z = e.z; P.h = 20;
  if (e.t > 0.7) { P.heldBy = null; P.h = 20; strike(P, { dmg: e.def.dmg * G.foeK.dmg * 1.2, kd: true, kb: 260, lift: 300, from: e, hs: 0.1 }, e.face); e.st = 'idle'; e.wait = 1; KIT.shake(6); sfx.play('throw'); } }
function bossDown(b) {
  KIT.flash(0.25); G.slow = 1.2; sfx.play('ko'); G.score += 5000;
  if (bossesLeft().length === 0) { G.koT = 0.01; music.stop(0.4); G.ents.forEach(function (o) { if (o.team === 'f' && !o.boss && o.hp > 0) { o.hp = 0; launch(o, o.x > P.x ? 1 : -1, 120, 200); onKO(o); } }); }
}
/* shock rings from the Titan: jump over the line */
function stepWaves(dt) { G.waves = (G.waves || []).filter(function (w) { w.r += w.spd * dt; if (!w.hit && P && hittable(P) && P.h < 6) { var dd = Math.hypot(P.x - w.x, (P.z - w.z) * 2.6); if (Math.abs(dd - w.r) < 8) { w.hit = true; strike(P, { dmg: w.dmg, kd: true, kb: 160, lift: 240, hs: 0.08, low: 1 }, P.x >= w.x ? 1 : -1); } } return w.r < w.max; }); }
