/* =====================================================================================================
   THE DUEL: Street Fighter. When a boss turns up (Story) or in Arcade, the brawler stops: the camera locks, the
   floor becomes one flat line and it is one on one. Rounds (first to two), a 60 second clock, health bars at the
   top, blocking (hold back; low attacks need down-back, jump-ins need standing), chip damage, throws, crouching,
   jump-ins, cancels, EX specials on motions, supers. A punches, B kicks, UP jumps, X special, Y super.
   Bosses fight with their own move lists (6-foes.js) on the same line; the other fighters are driven by cpuInput.
   ARCADE: ten fights in a row (LADDER), a continue screen if you lose one.
   ===================================================================================================== */
var LANE = 40; // the z every duel is fought on
var NOIN = {};
/* the camera zooms in for a duel so the fighters are big, Street Fighter style, and follows the pair across the stage.
   The zoom is picked so a game pixel lands on whole screen pixels where it can */
function duelZoom() { var S = KIT.S || 2, z = Math.round(S * 1.5) / S; return clamp(z, 1.34, 1.6); }
function VW() { return KIT.W / (G.duel ? (G.zoom || 1) : 1); }
function duelCam(snap) { var D = G.duel, foe = D.foe, vw = VW(), mid = (P.x + foe.x) / 2, want = clamp(mid - vw / 2, D.x0, D.x0 + KIT.W - vw); G.cam = snap ? want : G.cam + (want - G.cam) * 0.15; G.lock = G.cam; }
/* the normals every fighter has in a duel, built from their size and power */
function duelMoves(H) {
  var h = H.ht, pw = H.id === 'greebo' ? 1.3 : H.id === 'spermaid' ? 0.85 : H.id === 'homunculus' ? 0.92 : 1, tl = H.id === 'spermaid' ? 8 : H.id === 'homunculus' ? 4 : 0, sl = H.id === 'greebo' ? 1.25 : 1;
  function M(o) { var m = MV(o); m.dmg *= pw; m.st *= sl; m.rc *= sl; return m; }
  H.vs = {
    jab: M({ an: 'jab', st: 0.05, ac: 0.06, rc: 0.1, dmg: 5, kb: 50, stun: 0.24, box: [4, 30, h * 0.5, h * 0.95], hs: 0.04 }),
    cross: M({ an: 'cross', st: 0.07, ac: 0.07, rc: 0.16, dmg: 8, kb: 80, stun: 0.32, box: [4, 34, h * 0.45, h * 0.9], hs: 0.06, sfx: 'heavy' }),
    kick: M({ an: 'kick', st: 0.08, ac: 0.08, rc: 0.18, dmg: 9, kb: 90, stun: 0.3, box: [4, 36 + tl, h * 0.2, h * 0.6], hs: 0.06, arc: '#f1e7d0' }),
    rh: M({ an: 'rh', n: H.id === 'spermaid' ? 'TIDE TAIL' : 'ROUNDHOUSE', st: 0.14, ac: 0.09, rc: 0.26, dmg: 13, kb: 150, lift: 220, kd: true, box: [2, 40 + tl, h * 0.45, h * 1.1], hs: 0.09, sfx: 'heavy', arc: H.col }),
    cjab: M({ an: 'cjab', st: 0.04, ac: 0.05, rc: 0.1, dmg: 4, kb: 40, stun: 0.22, box: [4, 30, h * 0.15, h * 0.55], crouch: 1 }),
    sweep: M({ an: 'sweep', n: 'SWEEP', st: 0.1, ac: 0.08, rc: 0.32, dmg: 9, kb: 60, lift: 120, kd: true, low: 1, box: [2, 42 + tl, -6, h * 0.28], crouch: 1, sfx: 'heavy' }),
    jpunch: M({ an: 'jpunch', st: 0.04, ac: 0.3, rc: 0.1, dmg: 8, kb: 70, stun: 0.34, over: 1, air: true, box: [0, 28, -h * 0.15, h * 0.5] }),
    jkick: M({ an: 'jkick', st: 0.05, ac: 0.35, rc: 0.1, dmg: 10, kb: 90, stun: 0.38, over: 1, air: true, box: [0, 32 + tl, -h * 0.25, h * 0.4] }),
    upper: M({ an: 'upper', n: 'UPPERCUT', st: 0.08, ac: 0.08, rc: 0.3, dmg: 11, kb: 100, lift: 300, kd: true, box: [2, 28, h * 0.3, h * 1.3], crouch: 1, sfx: 'heavy', arc: H.col })
  };
}
HEROLIST.forEach(function (id) { HEROES[id].id = id; duelMoves(HEROES[id]); });

/* ---------- the arcade ladder: your three rivals, the six bosses, your own shadow ---------- */
function ladder(hero) {
  var r = HEROLIST.filter(function (h) { return h !== hero; });
  return [{ hero: r[0], st: 0 }, { hero: r[1], st: 2 }, { boss: 'execu', st: 0 }, { boss: 'ratking', st: 1 }, { hero: r[2], st: 3 },
    { boss: 'pig', assist: 'cowpig', st: 2 }, { boss: 'boner', st: 3 }, { hero: hero, shadow: 1, st: 4 }, { boss: 'titan', st: 4 }, { boss: 'blum', st: 5 }];
}
function oppName(o) { return o.boss ? (o.assist ? BOSSES.brothers.n : BOSSES[o.boss].n) : (o.shadow ? 'SHADOW ' : '') + HEROES[o.hero].n; }
function oppQuote(o) { return o.boss ? (o.assist ? BOSSES.brothers.intro : BOSSES[o.boss].intro) : o.shadow ? 'Goo in your veins. Goo in your fists. You are me now.' : HEROES[o.hero].quote; }
function oppArt(o) { // for the VS screen
  if (o.hero) return [{ spr: HEROES[o.hero].A.idle[0], sc: 2, shade: o.shadow ? SHADE : null }];
  var L = [{ spr: BOSSES[o.boss].spr[0], sc: BOSSES[o.boss].sc || 1 }]; if (o.assist) L.push({ spr: BOSSES[o.assist].spr[0], sc: 1 }); return L;
}
var SHADE = 'grayscale(1) sepia(1) hue-rotate(225deg) saturate(3.2) brightness(0.62) contrast(1.3)'; // Blumhead's goo purple
function arcadeStart(hero) { G.hero = hero; G.arc = { i: 0, list: ladder(hero), conts: 0 }; G.rush = false; G.hard = !!SV.hard; G.hardK = G.hard ? 1.25 : 1; G.lives = 0; G.score = 0; G.kills = 0; G.freed = 0; G.best = 0; G.runT = 0; P = makePlayer(hero); arcadeNext(); }
function arcadeNext() {
  var A = G.arc, o = A.list[A.i]; G.si = o.st; G.S = STAGES[o.st]; G.cam = 400 + o.st * 37; G.vsOpp = { o: o, name: oppName(o), quote: oppQuote(o), art: oppArt(o) };
  G.mode = 'vs'; G.vsT = 0; sfx.play('vs'); music.play(o.boss ? (o.assist ? BOSSES.brothers.song : BOSSES[o.boss].song) : G.S.song); KIT.dropLayer();
}
/* ---------- starting a duel ---------- */
function startDuel(o) {
  var lvl = G.arc ? G.arc.i / 9 : G.si / 5;
  G.duel = { o: o, round: 1, wins: [0, 0], phase: 'intro', t: 0, clock: o.boss ? 90 : 60, lvl: lvl * (G.hard ? 1.2 : 1), x0: G.cam }; G.zoom = duelZoom();
  G.mode = 'duel'; G.lock = G.cam; G.bossOn = true; G.koT = 0; padSubs(true);
  duelRound();
}
function makeOpp(o) {
  var D = G.duel, e;
  if (o.hero) { e = makePlayer(o.hero); e.team = 'f'; e.cpu = true; e.face = -1; if (o.shadow) { e.shade = SHADE; e.hp = e.mhp = e.mhp * 1.15; } e.hp = e.mhp = e.mhp * (1 + D.lvl * 0.35); }
  else { var b = BOSSES[o.boss]; e = ent({ team: 'f', boss: true, bid: o.boss, def: b, w: b.w, ht: b.ht, face: -1, cd: 1.2, poise: 40 + D.lvl * 20, intro: true, sc: b.sc, spr: b.spr, mvi: 0, wait: 1.0 });
    e.hp = e.mhp = (200 + 140 * D.lvl) * (G.arc ? 1 : 1.1) * (o.boss === 'blum' ? 1.1 : 1); }
  e.inside = true; return e;
}
function duelRound() {
  var D = G.duel, W = KIT.W; G.ents = []; G.shots = []; G.fx = []; G.items = []; G.props = []; G.puddles = []; G.waves = []; G.beam = null; G.sup = null; G.superT = 0; G.cutin = null; G.splat = 0; G.combo = 0; G.hs = 0; G.slow = 0;
  G.foeK = { hp: 1, dmg: 0.85 + D.lvl * 0.35 };
  var o = D.o, e = makeOpp(o); D.foe = e; G.ents.push(e);
  if (o.assist) { var a = BOSSES[o.assist]; G.ents.push(ent({ team: 'f', boss: false, assist: true, def: a, spr: a.spr, w: a.w, ht: a.ht, face: -1, x: G.cam + VW() - 30, z: 6, inv: 1e9, hp: 1, mhp: 1, sc: 0.8, cd: 3 })); }
  G.zoom = duelZoom(); var mid = D.x0 + W / 2; e.x = mid + VW() * 0.22; e.z = LANE; e.h = 0;
  var keepM = P.meter || 0; var fresh = makePlayer(P.hid); for (var k in fresh) if (k !== 'id') P[k] = fresh[k]; P.meter = D.round === 1 && !G.arc ? keepM : Math.max(keepM, 0);
  P.x = mid - VW() * 0.22; P.z = LANE; P.face = 1; P.inv = 0; P.st = 'idle';
  D.phase = 'intro'; D.t = 0; D.clock = o.boss ? 90 : 60; D.hitP = false; D.msg = null; duelCam(true);
  if (D.round === 1) music.play(o.boss ? (o.assist ? BOSSES.brothers.song : BOSSES[o.boss].song) : (o.shadow ? 'blum' : G.S.song));
}
function padSubs(duel) { try { var s = document.querySelectorAll('#acts .pbtn small'), L = duel ? ['PUNCH', 'KICK', 'SPECIAL', 'SUPER'] : ['HIT', 'JUMP', 'SPECIAL', 'SUPER']; for (var i = 0; i < s.length && i < 4; i++) s[i].textContent = L[i]; } catch (err) {} }

/* ---------- a step of the duel ---------- */
function stepDuel(dt) {
  var D = G.duel; G.t += dt; D.t += dt; G.stageT += dt; G.runT = (G.runT || 0) + dt;
  if (G.callout) { G.callout.t -= dt; if (G.callout.t <= 0) G.callout = null; } if (G.splat > 0) G.splat -= dt;
  if (G.cutin) { G.cutin.t += dt; if (G.cutin.t > 1.2) G.cutin = null; }
  if (G.superT > 0 && !G.sup) { G.superT -= dt; stepFx(dt); return; }
  if (G.sup) { stepSuper(dt); stepFx(dt); if (G.sup && G.sup.t < 0.7) return; }
  if (G.hs > 0) { G.hs -= dt; stepFx(dt); return; }
  if (G.slow > 0) { G.slow -= dt; dt *= 0.35; }
  var foe = D.foe, live = D.phase === 'fight';
  if (D.phase === 'intro') { foe.intro = true; if (D.t > 1.9) { D.phase = 'fight'; D.t = 0; foe.intro = false; foe.wait = 0.6; sfx.play('fight'); } }
  if (live) { D.clock -= dt; if (D.clock <= 0) { D.clock = 0; duelTime(); } }
  var pin = live ? (G.bot ? cpuInput(P, foe, dt, 0.85) : padInput()) : NOIN;
  stepDuelHero(P, pin, foe, dt); physics(P, dt);
  if (foe.hero) stepDuelHero(foe, live ? cpuInput(foe, P, dt, D.lvl) : NOIN, P, dt);
  else if (live || D.phase === 'ko') { if (D.phase === 'ko' && foe.st !== 'down' && foe.st !== 'air' && foe.st !== 'dead') { foe.vx = 0; foe.st = foe.hp > 0 ? 'idle' : foe.st; } else stepFoe(foe, dt); }
  else { foe.t += dt; if (foe.flash > 0) foe.flash -= dt; }
  physics(foe, dt);
  G.ents.forEach(function (e) { if (e.assist) stepAssist(e, dt, live); });
  // one line, no walking through each other, nobody leaves the screen
  [P, foe].forEach(function (e) { e.z = LANE; e.vz = 0; });
  var gap = (P.w + foe.w) / 2 * 0.8, dx = foe.x - P.x;
  if (Math.abs(dx) < gap && P.h < 30 && foe.h < 30 && P.st !== 'grabbed' && foe.st !== 'grabbed') { var push = (gap - Math.abs(dx)) / 2 * (dx >= 0 ? 1 : -1); P.x -= push; foe.x += push; }
  G.zoom = duelZoom(); duelCam(false);
  [P, foe].forEach(function (e) { var l = G.cam + 14 + (e.boss ? e.w * 0.3 : 0), r = G.cam + VW() - 14 - (e.boss ? e.w * 0.3 : 0); if (e.x < l) { e.x = l; if (e.vx < 0) e.vx = 0; } if (e.x > r) { e.x = r; if (e.vx > 0) e.vx = 0; } });
  stepShots(dt); stepPuddles(dt); stepWaves(dt); stepFx(dt);
  if (D.phase === 'ko') {
    var win = D.winner;
    if (win && D.t > 1.4 && win.h <= 0 && win.hero && win.st !== 'win' && win.st !== 'air' && win.st !== 'down') { win.st = 'win'; win.t = 0; win.mv = null; win.vx = 0; }
    if (D.t > 3.6) duelRoundOver();
  }
}
function padInput() { return { l: KIT.held('left'), r: KIT.held('right'), u: KIT.held('up'), d: KIT.held('down'), a: KIT.pressed('a'), b: KIT.pressed('b'), x: KIT.pressed('x'), y: KIT.pressed('y') }; }
/* Cowboy Load leans on the fence at the back and lobs his mugs in while his brother fights */
function stepAssist(e, dt, live) { e.t += dt; e.z = 6; e.x = G.cam + VW() - 26; e.face = P.x < e.x ? -1 : 1; if (!live) return; e.cd -= dt; if (e.cd <= 0) { e.cd = rnd(3.2, 5) / (1 + G.duel.lvl * 0.5); e.flash = 0.1; var b = shoot(e, { spr: 's_mug', spd: 150, arc: 260, dmg: 7, boom: 18 }, { h: 40, k: clamp(Math.abs(P.x - e.x) / 150, 0.4, 1.6) }); b.vz = (LANE - 6) * 1.4; sfx.play('throw'); } }

/* one fighter in a duel. I: held directions (l r u d) and pressed buttons (a b x y) */
function stepDuelHero(e, I, o, dt) {
  var H = e.hero, V = H.vs;
  e.t += dt; if (e.inv > 0) e.inv -= dt; if (e.flash > 0) e.flash -= dt; if (e.spCd > 0) e.spCd -= dt; if (e.shieldT > 0) e.shieldT -= dt;
  e.buf = 0; e.bufX = 0; e.guard = null;
  var fw = e.face > 0 ? I.r : I.l, bk = e.face > 0 ? I.l : I.r;
  var dn = I.d ? (fw ? 3 : bk ? 1 : 2) : I.u ? (fw ? 9 : bk ? 7 : 8) : fw ? 6 : bk ? 4 : 5;
  if (!e.dirs.length || e.dirs[e.dirs.length - 1].d !== dn) { e.dirs.push({ d: dn, t: G.t }); if (e.dirs.length > 12) e.dirs.shift(); }
  switch (e.st) {
    case 'ko': case 'dead': case 'win': e.vx *= 0.8; return;
    case 'down': if (e.t > 0.7) { if (e.hp <= 0) { e.st = 'ko'; e.t = 0; } else { e.st = 'getup'; e.t = 0; e.inv = 0.45; } } return;
    case 'getup': if (e.t > 0.3) { e.st = 'idle'; e.juggle = 0; } return;
    case 'air': case 'thrown': return;
    case 'hurt': e.stun -= dt; if (e.stun <= 0) { e.st = 'idle'; e.juggle = 0; } return;
    case 'block': e.stun -= dt; e.guard = e.crouch ? 'lo' : 'hi'; if (e.stun <= 0) e.st = 'idle'; return;
    case 'grabbed': if (I.a || I.b || I.x || I.l || I.r) { e.mash = (e.mash || 0) + 1; }
      if (e.mash >= 6 || !e.heldBy || e.heldBy.hp <= 0 || e.heldBy.st !== 'grabbing') { var by = e.heldBy; e.st = 'idle'; e.mash = 0; e.heldBy = null; e.inv = 0.5; e.h = 0; if (by && by.st === 'grabbing') { by.st = 'idle'; by.wait = 0.6; } } return;
    case 'atk': {
      var m = e.mv; stepMove(e, dt);
      // cancels, like Street Fighter: a normal that hit goes into a special, a jab chains into a cross, a cross into the roundhouse
      if (e.mv && e.mf.landed && !e.mv.sp && !e.mv.air && e.mvT > e.mv.st) {
        if (I.x && e.spCd <= 0) { e.spCd = 0.4; e.mv = null; return duelSpecial(e, dn); }
        if (I.a && e.mv.an === 'jab') return startMove(e, V.cross);
        if (I.b && e.mv.an === 'cross') return startMove(e, V.rh);
        if (I.b && e.mv.an === 'cjab') return startMove(e, V.sweep);
      }
      if (e.mv && e.mv.air && e.h <= 0) { e.mv = null; e.st = 'idle'; }
      return; }
  }
  if (e.st === 'prejump') { e.vx = 0; if (e.t > 0.06) { e.st = 'jump'; e.t = 0; e.vh = H.jump * 1.05; e.h = 0.5; e.vx = e.jdir * H.spd * 1.5; e.airDone = false; sfx.play('jump'); dust(e.x, e.z, 2); } return; }
  var air = e.h > 0 || e.st === 'jump';
  if (air) { if (!e.airDone && (I.a || I.b)) { e.airDone = true; startMove(e, I.b ? V.jkick : V.jpunch); } return; }
  e.face = o.x >= e.x ? 1 : -1; fw = e.face > 0 ? I.r : I.l; bk = e.face > 0 ? I.l : I.r;
  e.crouch = !!I.d;
  var threat = (o.mv && o.st === 'atk') || o.st === 'move' || o.st === 'leap' || (o.h > 0 && o.mv) || G.shots.some(function (b) { return b.team !== e.team && Math.abs(b.x - e.x) < 110; }) || (G.beam && !G.beam.warn) || (G.sup && G.sup.by !== e);
  if (bk && threat) e.guard = I.d ? 'lo' : 'hi';
  if (I.y && e.meter >= 100) return startSuper(e);
  // motions: quarter circle forward or a dragon punch with a button = the EX version (costs a quarter of the meter)
  if ((I.a || I.b || I.x) && e.spCd <= 0) {
    var ex = e.meter >= 25, qcf = motion(e, [2, 3, 6], 0.4), dp = motion(e, [6, 2, 3], 0.4);
    if (qcf || dp) { e.spCd = 0.45; if (ex) { e.meter -= 25; } return doSpecial(e, (qcf ? 'fire' : 'rise') + (ex ? 'EX' : '')); }
  }
  if (I.x && e.spCd <= 0) { e.spCd = 0.45; return duelSpecial(e, dn); }
  if (I.a) {
    var close = Math.abs(o.x - e.x) < (e.w + o.w) / 2 + 10 && o.h <= 0;
    if (close && fw && !e.crouch && canThrow(o)) return duelThrow(e, o);
    if (e.crouch && fw) return startMove(e, V.upper); // down-forward + A: an uppercut
    return startMove(e, e.crouch ? V.cjab : V.jab);
  }
  if (I.b) return startMove(e, e.crouch ? V.sweep : fw ? V.rh : V.kick);
  if (I.u) { e.st = 'prejump'; e.t = 0; e.jdir = fw ? e.face : bk ? -e.face : 0; e.crouch = false; return; }
  if (e.crouch) { e.vx = 0; e.st = 'idle'; return; }
  var mx = fw ? 1 : bk ? -1 : 0; e.back = mx < 0; e.vx = mx * e.face * H.spd * (mx < 0 ? 0.8 : 1.0) * (e.fast > 0 ? 1.2 : 1); e.st = mx ? 'walk' : 'idle'; if (mx) e.anim += dt;
}
function duelSpecial(e, dn) { var k = dn === 8 || dn === 7 || dn === 9 ? 'rise' : dn === 6 ? 'dash' : dn === 2 || dn === 1 || dn === 3 ? 'ground' : 'fire'; if (dn === 3) k = 'rise'; doSpecial(e, k); if (e.mv) e.mv.sp = 1; }
function canThrow(o) { return o.hero && (o.st === 'idle' || o.st === 'walk' || o.st === 'block' || o.st === 'prejump') && o.inv <= 0; }
function duelThrow(e, o) {
  startMove(e, MV({ an: 'throw', st: 0.12, ac: 0.02, rc: 0.3, dmg: 0, box: null, n: 'THROW' })); e.mv.sp = 1;
  o.vx = 0; sfx.play('grab');
  o.x = e.x + e.face * ((o.w + e.w) / 2 + 2);
  strike(o, { dmg: 13 * (e.hero.id === 'greebo' ? 1.3 : 1), kd: true, kb: 220, lift: 260, hs: 0.1, from: e, meter: 10, unblock: 1 }, e.face);
  KIT.shake(4); sfx.play('throw');
}
/* the KO, the clock, and what happens after a round */
function duelKO(t, from) {
  var D = G.duel; if (!D || D.phase !== 'fight') return;
  D.phase = 'ko'; D.t = 0; D.loser = t; D.winner = t === P ? D.foe : P; D.wins[t === P ? 1 : 0]++;
  D.msg = t === P || D.winner.hp < D.winner.mhp ? 'K.O.' : 'PERFECT'; if (t !== P && D.winner.hp >= D.winner.mhp) G.score += 10000;
  G.slow = 1.4; KIT.flash(0.25); KIT.shake(6); sfx.play('ko'); G.beam = null;
  if (t !== P) G.score += 2000 + Math.round(D.clock * 50);
}
function duelTime() {
  var D = G.duel; if (D.phase !== 'fight') return; var a = P.hp / P.mhp, b = D.foe.hp / D.foe.mhp;
  D.phase = 'ko'; D.t = 0; D.msg = 'TIME'; sfx.play('ko');
  if (a >= b) { D.winner = P; D.loser = D.foe; D.wins[0]++; } else { D.winner = D.foe; D.loser = P; D.wins[1]++; }
  P.mv = null; if (P.st === 'atk') P.st = 'idle'; D.foe.mv = null; if (D.foe.st === 'atk' || D.foe.st === 'move') D.foe.st = 'idle';
}
function duelRoundOver() {
  var D = G.duel;
  if (D.wins[0] >= 2 || D.wins[1] >= 2) return duelEnd(D.wins[0] >= 2);
  D.round++; duelRound();
}
function duelEnd(won) {
  var D = G.duel;
  if (won) {
    G.score += 5000; G.duel = null; padSubs(false);
    if (G.arc) { G.arc.i++; SV.arc = SV.arc || {}; SV.arc[G.hero] = Math.max(SV.arc[G.hero] || 0, G.arc.i); persist(); if (G.arc.i >= G.arc.list.length) return arcadeEnd(); G.mode = 'won'; G.wonT = 0; music.play('skclear'); return; }
    G.lock = null; P.st = 'win'; P.t = 0; G.bossOn = false; return stageClear();
  }
  // lost: a continue (Arcade), or a life (Story)
  if (G.arc) { G.mode = 'over'; G.overT = 0; music.stop(0.6); sfx.play('lose'); return; }
  G.lives--; if (G.lives < 0) { G.lives = 0; G.mode = 'over'; G.overT = 0; music.stop(0.6); sfx.play('lose'); return; }
  D.round = 1; D.wins = [0, 0]; duelRound(); G.callout = { s: 'ONE MORE TIME', t: 1.6 };
}
function duelRetry() { var D = G.duel; D.round = 1; D.wins = [0, 0]; G.mode = 'duel'; P.meter = 100; duelRound(); padSubs(true); }
function arcadeEnd() { G.mode = 'end'; G.endT = 0; G.endArc = true; music.play('skend'); SV.arcWins = (SV.arcWins || 0) + 1; SV.arcClear = SV.arcClear || {}; SV.arcClear[G.hero] = 1; persist(); }

/* ---------- the computer: watches, blocks, punishes, zones with fireballs, jumps in, anti-airs ---------- */
function cpuInput(e, o, dt, lvl) {
  var I = {}, A = e.ai || (e.ai = { t: 0, plan: 'walk', pt: 0 }), dx = o.x - e.x, adx = Math.abs(dx), fwK = dx > 0 ? 'r' : 'l', bkK = dx > 0 ? 'l' : 'r', reach = 30 + (e.w + o.w) / 2;
  A.pt -= dt; A.t += dt; lvl = clamp(lvl, 0, 1);
  if (!e.hero) return I;
  var shot = G.shots.filter(function (b) { return b.team !== e.team && (b.x - e.x) * (b.vx || 0) < 0 && Math.abs(b.x - e.x) < 130; })[0];
  var busy = e.st === 'atk' || e.st === 'hurt' || e.st === 'down' || e.st === 'air' || e.st === 'block';
  // the other one is swinging at me: block (low if it is low), sometimes too slow
  var swing = (o.mv && o.st === 'atk' && adx < reach + 30) || (o.st === 'move' && adx < 140) || (o.st === 'leap');
  if (!busy && swing && (A.react === undefined || A.reactFor !== (o.mv || o.mvName))) { A.reactFor = o.mv || o.mvName; A.react = Math.random() < 0.25 + 0.55 * lvl; }
  if (!busy && swing && A.react) { I[bkK] = true; if ((o.mv && o.mv.low) || (o.boss && ['sweep', 'spears', 'pound', 'swarm', 'chop'].indexOf(o.mvName) >= 0)) I.d = true; return I; }
  if (!swing) A.react = undefined;
  if (!busy && shot) { if (Math.random() < 0.02 + 0.06 * lvl) { I.u = true; I[fwK] = true; return I; } if (Math.random() < 0.5 + 0.4 * lvl) { I[bkK] = true; return I; } }
  // anti-air: they jumped at me
  if (!busy && o.h > 18 && o.vh < 80 && adx < 70 && Math.random() < 0.04 + 0.2 * lvl) { I.d = true; I[fwK] = true; I.x = true; return I; }
  if (busy) { if (e.st === 'atk' && e.mf && e.mf.landed && Math.random() < 0.15 + 0.4 * lvl) { if (e.mv.an === 'jab') I.a = true; else if (e.mv.an === 'cross' || e.mv.an === 'cjab') I.b = true; } return I; }
  if (e.h > 0) { if (!e.airDone && adx < 46 && e.vh < 120) I.b = true; return I; }
  if (e.meter >= 100 && adx < 160 && Math.random() < 0.02) { I.y = true; return I; }
  if (A.pt <= 0) { A.pt = rnd(0.25, 0.7) * (1.3 - lvl * 0.5);
    var r = Math.random();
    A.plan = adx > 150 ? (r < 0.35 + 0.2 * lvl ? 'fire' : r < 0.55 ? 'jump' : 'walk') : adx > reach ? (r < 0.15 ? 'fire' : r < 0.3 + 0.1 * lvl ? 'jump' : r < 0.42 ? 'wait' : 'walk') : (r < 0.12 ? 'back' : r < 0.2 ? 'throw' : 'poke'); }
  var p = A.plan;
  if (p === 'walk') I[fwK] = true;
  else if (p === 'back') I[bkK] = true;
  else if (p === 'wait') { if (Math.random() < 0.3) I[bkK] = true; }
  else if (p === 'fire') { if (e.spCd <= 0) { I.x = true; A.plan = 'wait'; } }
  else if (p === 'jump') { I.u = true; I[fwK] = true; A.plan = 'wait'; }
  else if (p === 'throw') { if (adx < (e.w + o.w) / 2 + 9) { I[fwK] = true; I.a = true; A.plan = 'wait'; } else I[fwK] = true; }
  else if (p === 'poke') { if (adx > reach) { I[fwK] = true; return I; } var q = Math.random(); if (q < 0.4) I.a = true; else if (q < 0.65) { I.b = true; } else if (q < 0.85) { I.d = true; I.b = true; } else { I.d = true; I.a = true; } A.plan = Math.random() < 0.5 ? 'poke' : 'wait'; A.pt = Math.min(A.pt, 0.25); }
  return I;
}
