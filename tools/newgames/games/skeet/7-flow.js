/* =====================================================================================================
   THE FLOW: title, fighter select, stage card, sections (the camera stops, waves come in from both sides, GO),
   the boss arena with a Street Fighter VS screen and FIGHT!, the stage clear tally, continues, the ending.
   ===================================================================================================== */
var SV = KIT.load('sk-save', null) || {}; if (!SV.v) SV = { v: 1, clear: {}, best: {}, hard: false, rush: 0, wins: 0, seen: {} };
function persist() { KIT.save('sk-save', SV); }
var STORY = [
  'Blumhead has been pumping his goo into the homunculi of Clubhouse Row.',
  'One by one they go purple, go quiet, and go to work for his cult.',
  'Nobody is coming to save them. So four idiots from the Clubhouse are.',
  'Beat the goo out of every one of them. Then go and beat it out of Blumhead.'
];
function newGame(hero, o) {
  o = o || {}; G.arc = null; G.duel = null; G.endArc = false; padSubs(false); G.hero = hero; G.rush = !!o.rush; G.hard = !!SV.hard; G.hardK = G.hard ? 1.35 : 1; G.si = o.stage || 0; G.lives = 3; G.score = 0; G.kills = 0; G.freed = 0; G.best = 0; G.runT = 0; G.conts = 0;
  P = makePlayer(hero); startStage(G.si);
}
function startStage(i) {
  G.si = i; G.S = STAGES[i]; G.ents = []; G.shots = []; G.fx = []; G.items = []; G.props = []; G.puddles = []; G.waves = []; G.cam = 0; G.lock = null; G.secI = -1; G.bossOn = false; G.koT = 0; G.go = 0; G.stageT = 0; G.hurtThisStage = false; G.beam = null; G.sup = null; G.superT = 0; G.cutin = null; G.splat = 0; G.combo = 0;
  G.foeK = { hp: (1 + i * 0.12 + (G.hard ? 0.25 : 0)) * coK('hp'), dmg: (1 + i * 0.07) * coK('dmg') };
  // lay the stage out: sections one after another, then the arena
  var x = 0; G.secs = (G.rush ? [] : G.S.secs).map(function (s, k) { var o = { x0: x, x1: x + s.len, def: s, k: k }; x += s.len; return o; });
  G.arena = x; G.end = x + KIT.W;
  G.secs.forEach(function (s) { (s.def.props || []).forEach(function (p, j) { var px = s.x0 + 150 + j * ((s.def.len - 200) / Math.max(1, s.def.props.length)); G.props.push(ent({ team: 'o', prop: true, spr: p[0], drop: p[1], x: px, z: 10 + (j * 23) % (DEPTH - 20), hp: p[0] === 'b_coffin' ? 3 : 2, w: 22, ht: 28 })); }); });
  P.x = 50; P.z = 36; P.h = 0; P.st = 'idle'; P.mv = null; P.vx = P.vz = 0; P.inv = 1; P.held = null; P.heldBy = null;
  if (!G.rush && i > 0) P.hp = Math.min(P.mhp, P.hp + P.mhp * 0.5); if (G.rush) P.hp = P.mhp;
  G.mode = 'card'; G.cardT = 0; music.play(G.S.song); KIT.dropLayer();
}
/* solo: one player. Online co-op (G.pl): every player takes a step with his own buttons (IN), and each foe goes for the player nearest to it */
function stepPlayers(dt) {
  if (!G.pl) { stepPlayer(dt); physics(P, dt); return; }
  var me = P, gb = G.bot;
  G.pl.forEach(function (pl) { if (pl.out) return; P = pl; IN = pl.IN || null; if (pl.IN) { G.bot = !!pl.IN.bot; if (G.bot) botThink(); } try { stepPlayer(dt); } finally { IN = null; G.bot = gb; } physics(pl, dt); });
  P = me;
}
function stepFoes(dt) { var me = P; G.ents.forEach(function (e) { if (G.pl) P = foeTarget(e); stepFoe(e, dt); P = me; physics(e, dt); }); }
function foeTarget(e) {
  var live = G.pl.filter(function (p) { return !p.out && p.st !== 'dead'; }); if (!live.length) return G.pl[0];
  for (var i = 0; i < live.length; i++) if (live[i].heldBy === e) return live[i];
  var cur = live.filter(function (p) { return p.id === e.tgt; })[0]; e.tgtT = (e.tgtT || 0) - 1 / 60;
  if (cur && e.tgtT > 0) return cur;
  var best = live[0], bd = 1e9; live.forEach(function (p) { var d = Math.abs(p.x - e.x) + Math.abs(p.z - e.z) * 2 + (p.id === e.tgt ? -30 : 0); if (d < bd) { bd = d; best = p; } });
  e.tgt = best.id; e.tgtT = 2.5 + Math.random(); return best;
}
function playersX(k) { var L = players(); if (!L.length) return P ? P.x : 0; if (k === 'max') return Math.max.apply(null, L.map(function (p) { return p.x; })); return L.reduce(function (a, p) { return a + p.x; }, 0) / L.length; }
function coN() { return G.pl ? G.pl.length : 1; }
function coK(k) { var n = coN() - 1; return k === 'hp' ? 1 + 0.45 * n : 1 + 0.08 * n; } // the difficulty follows the number of players
function coExtra(len) { return Math.round(len * 0.5 * (coN() - 1)); }
function inPlay() { return G.mode === 'play'; }
/* the camera follows; a lock holds it while a wave is on */
function stepCamera(dt) {
  var want = playersX('mid') - KIT.W * 0.42, max = G.end - KIT.W;
  if (locked()) want = G.lock; else want = clamp(want, G.cam - 0, max); // the camera never goes back
  if (!locked()) want = Math.max(G.cam, want);
  G.cam += (want - G.cam) * Math.min(1, dt * 6); if (Math.abs(want - G.cam) < 0.3) G.cam = want;
}
function stepSections(dt) {
  if (G.bossOn || G.koT) return;
  // reach the next section's middle: lock and send the waves
  var nx = G.secI + 1, s = G.secs[nx];
  if (!locked() && s && playersX('max') > s.x0 + s.def.len * 0.45) { G.secI = nx; G.lock = clamp(P.x - KIT.W * 0.45, G.cam, G.end - KIT.W); G.wave = -1; G.waveT = 0.4; G.go = 0; }
  if (locked() && G.secI >= 0) {
    var cur = G.secs[G.secI], alive = G.ents.filter(function (e) { return e.team === 'f' && e.hp > 0 && e.st !== 'gone'; }).length;
    if (G.spawnQ && G.spawnQ.length) { G.spawnT -= dt; if (G.spawnT <= 0) { var q = G.spawnQ.shift(); spawnFoe(q[0], q[1]); G.spawnT = 0.45; } return; }
    if (alive === 0) { G.waveT -= dt; if (G.waveT > 0) return; G.wave++;
      if (G.wave >= cur.def.waves.length) { G.lock = null; G.go = 3; sfx.play('go'); G.ents = G.ents.filter(function (e) { return e.st !== 'gone'; }); return; }
      var w = cur.def.waves[G.wave], side = Math.random() < 0.5 ? -1 : 1; G.spawnQ = w.map(function (id, j) { return [id, j % 2 ? side : -side]; }); for (var xj = 0; xj < coExtra(w.length); xj++) G.spawnQ.push([pick(w), xj % 2 ? side : -side]); G.spawnT = 0; G.waveT = 0.8; // co-op: more of them
      if (G.hard && G.wave === cur.def.waves.length - 1) G.spawnQ.push([pick(cur.def.waves[0]), side]);
    }
  }
  // the arena
  if (!locked() && G.secI >= G.secs.length - 1 && playersX('max') > G.arena + 60) { G.lock = G.arena; G.cam = Math.min(G.cam, G.arena); bossIntro(); }
}
function bossIntro() { // the brawl stops here: the Street Fighter VS screen, then a one on one
  G.ents = G.ents.filter(function (e) { return e.team !== 'f' || e.hp > 0; }).filter(function (e) { return e.team !== 'f'; });
  var id = G.S.boss, o = id === 'brothers' ? { boss: 'pig', assist: 'cowpig' } : { boss: id };
  G.cam = G.arena; G.lock = G.arena; G.vsOpp = { o: o, name: oppName(o), quote: oppQuote(o), art: oppArt(o) };
  G.bossOn = true; G.mode = 'vs'; G.vsT = 0; music.play(BOSSES[id].song); sfx.play('vs');
}
function bossFight() { G.cam = G.lock = G.arena; startDuel(G.vsOpp.o); }
function stageClear() {
  G.mode = 'clear'; G.clearT = 0; music.play('skclear'); var tb = Math.max(0, Math.round((240 - G.stageT) * 20)), nb = G.hurtThisStage ? 0 : 10000, cb = (G.best || 0) * 100;
  G.tally = { time: tb, nodmg: nb, combo: cb, freed: (G.freed || 0) * 300, total: tb + nb + cb };
  G.score += G.tally.total; var k = G.hero; SV.clear[k] = Math.max(SV.clear[k] || 0, G.si + 1); SV.best[k] = Math.max(SV.best[k] || 0, G.score); persist();
}
function nextStage() { if (G.si >= STAGES.length - 1) return theEnd(); startStage(G.si + 1); }
function gameOver() { G.mode = 'over'; G.overT = 0; music.stop(0.6); sfx.play('lose'); }
function continueGame() { G.conts = (G.conts || 0) + 1; if (G.duel) { G.lives = 2; G.score = Math.floor(G.score / 2); return duelRetry(); } G.lives = 2; G.score = Math.floor(G.score / 2); P.hp = P.mhp; P.st = 'air'; P.h = 160; P.vh = 0; P.inv = 2.6; P.meter = 100; G.mode = 'play'; music.play(G.bossOn ? BOSSES[G.S.boss].song : G.S.song); sfx.play('power'); hitArea(P.x, P.z, 90, 40, { dmg: 0, kd: true, kb: 220, lift: 200, from: P, team: 'p' }); }
function theEnd() {
  G.mode = 'end'; G.endT = 0; music.play('skend'); SV.wins = (SV.wins || 0) + 1; if (G.rush) SV.rush = Math.max(SV.rush || 0, G.score); SV.cleared = 1; SV.rushOpen = 1; SV.hardOpen = 1; persist();
}
/* a step of the game proper */
function stepPlay(dt) {
  G.t += dt; G.stageT += dt; G.runT += dt;
  if (G.koT) { G.koT += dt; if (G.koT > 3.2) { G.koT = 0; stageClear(); return; } }
  if (G.fightT > 0) G.fightT -= dt; if (G.go > 0) G.go -= dt; if (G.splat > 0) G.splat -= dt; if (G.tagT > 0) G.tagT -= dt; if (G.callout) { G.callout.t -= dt; if (G.callout.t <= 0) G.callout = null; }
  if (G.cutin) { G.cutin.t += dt; if (G.cutin.t > 1.2) G.cutin = null; }
  if (G.superT > 0 && !G.sup) { G.superT -= dt; stepFx(dt); return; } // a boss transforming: everything holds still
  if (G.sup) { stepSuper(dt); stepFx(dt); if (G.sup && G.sup.t < 0.7) return; }
  if (G.hs > 0) { G.hs -= dt; stepFx(dt); return; } // hit stop: the world freezes on a big hit
  if (G.slow > 0) { G.slow -= dt; dt *= 0.35; }
  stepPlayers(dt);
  stepFoes(dt);
  G.ents = G.ents.filter(function (e) { return e.st !== 'gone'; });
  G.props = G.props.filter(function (p) { return !p.gone; });
  stepShots(dt); stepItems(dt); stepPuddles(dt); stepWaves(dt); stepFx(dt); stepCamera(dt); stepSections(dt);
  if (G.bossOn && !G.koT && bossesLeft().length === 0 && G.ents.filter(function (e) { return e.boss && e.st !== 'dead'; }).length === 0) G.koT = 0.01;
}
