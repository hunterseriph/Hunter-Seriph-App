/* =====================================================================================================
   MAIN: the loop, the title, the fighter select, pause, the move list, options, the test autopilot.
   ===================================================================================================== */
HEROLIST.forEach(function (id) { var H = HEROES[id]; H.air.air = true; H.combo.concat([H.dash, H.knee]).forEach(function (m) { if (m.box) m.box[2] = Math.min(m.box[2], 4); }); }); // ground attacks reach right down, so short foes and crates get hit
// the sound effects this game needs on top of the kit's
(function () { var t = sfx.tone, n = sfx.noise;
  sfx.add('heavy', function () { n(0.14, 0.28, 500); t('square', 160, 50, 0.16, 0.09); });
  sfx.add('thwack', function () { n(0.1, 0.25, 700); t('triangle', 240, 80, 0.12, 0.1); });
  sfx.add('slash', function () { n(0.12, 0.18, 3000); t('sawtooth', 900, 300, 0.08, 0.04); });
  sfx.add('chord', function () { [196, 247, 294, 392].forEach(function (f, i) { t('sawtooth', f, f, 0.4, 0.035, i * 0.012); }); n(0.1, 0.15, 400); });
  sfx.add('block', function () { t('square', 1200, 900, 0.05, 0.05); n(0.05, 0.1, 4000); });
  sfx.add('thud', function () { n(0.12, 0.25, 180); t('sine', 90, 40, 0.15, 0.15); });
  sfx.add('crash', function () { n(0.3, 0.25, 1200); n(0.2, 0.15, 300, 0.05); });
  sfx.add('fire', function () { n(0.2, 0.12, 1500); t('sawtooth', 300, 700, 0.18, 0.05); });
  sfx.add('rise', function () { t('square', 200, 900, 0.22, 0.06); n(0.15, 0.1, 2000); });
  sfx.add('super', function () { [262, 330, 392, 523, 659, 784].forEach(function (f, i) { t('square', f, f, 0.1, 0.06, i * 0.05); }); n(0.6, 0.15, 800, 0.3); });
  sfx.add('throw', function () { n(0.1, 0.1, 1800); t('triangle', 500, 200, 0.1, 0.05); });
  sfx.add('grab', function () { t('square', 300, 200, 0.08, 0.06); });
  sfx.add('eat', function () { [523, 659, 784].forEach(function (f, i) { t('square', f, f, 0.06, 0.05, i * 0.05); }); });
  sfx.add('pickup', function () { t('square', 660, 990, 0.1, 0.06); });
  sfx.add('gun', function () { n(0.06, 0.12, 2500); t('square', 700, 300, 0.05, 0.04); });
  sfx.add('bubble', function () { t('sine', 400, 1200, 0.2, 0.08); });
  sfx.add('freed', function () { [784, 988, 1175, 1568].forEach(function (f, i) { t('triangle', f, f, 0.12, 0.06, i * 0.07); }); });
  sfx.add('tele', function () { t('sine', 1400, 200, 0.25, 0.06); });
  sfx.add('ko', function () { t('sawtooth', 220, 40, 0.9, 0.12); n(0.8, 0.25, 300); });
  sfx.add('vs', function () { n(0.4, 0.2, 500); t('square', 110, 110, 0.4, 0.1); t('square', 165, 165, 0.4, 0.06); });
  sfx.add('fight', function () { [392, 523, 659].forEach(function (f, i) { t('square', f, f, 0.12, 0.07, i * 0.08); }); n(0.3, 0.2, 900, 0.2); });
  sfx.add('go', function () { t('square', 880, 880, 0.08, 0.05); t('square', 880, 880, 0.08, 0.05, 0.14); });
  sfx.add('swing', function () { n(0.2, 0.15, 1200); });
  sfx.add('whip', function () { t('sawtooth', 1600, 200, 0.12, 0.05); });
  sfx.add('stab', function () { n(0.15, 0.2, 2400); t('square', 300, 1200, 0.08, 0.05); });
  sfx.add('rumble', function () { n(0.6, 0.2, 120); });
  sfx.add('charge', function () { t('sawtooth', 100, 800, 0.8, 0.05); });
  sfx.add('splash', function () { n(0.3, 0.2, 900); t('sine', 300, 120, 0.2, 0.06); });
})();

function update(dt) {
  switch (G.mode) {
    case 'title': G.t += dt; G.cam += 18 * dt; return;
    case 'select': G.t += dt; return stepSelect();
    case 'card': G.t += dt; G.cardT += dt; if (G.cardT > 2.2 || (G.cardT > 0.5 && KIT.pressed('a'))) { G.mode = 'play'; if (G.rush) { P.x = 60; } } return;
    case 'play': if (G.bot) botThink(); return stepPlay(dt);
    case 'vs': G.t += dt; G.vsT += dt; if (G.vsT > 3.4 || (G.vsT > 0.9 && (KIT.pressed('a') || G.bot))) { if (G.arc) startDuel(G.vsOpp.o); else bossFight(); } return;
    case 'duel': return stepDuel(dt);
    case 'won': G.t += dt; G.wonT += dt; stepFx(dt); if (P.st !== 'win') { P.st = 'win'; P.t = 0; } P.t += dt; if (G.wonT > 1.2 && (KIT.pressed('a') || KIT.pressed('start') || G.bot || G.wonT > 6)) arcadeNext(); return;
    case 'clear': G.t += dt; G.clearT += dt; stepFx(dt); if (G.clearT > 2.6 && (KIT.pressed('a') || KIT.pressed('start') || G.bot)) nextStage(); return;
    case 'over': G.t += dt; G.overT += dt; if (G.overT > 0.6 && (KIT.pressed('a') || KIT.pressed('start'))) return continueGame(); if (G.overT > 10 || (G.overT > 0.6 && KIT.pressed('b'))) titleMenu(); return;
    case 'end': G.t += dt; G.endT += dt; if (G.endT > 9 && (KIT.pressed('a') || KIT.pressed('start') || G.bot)) titleMenu(); return;
  }
}
function draw() {
  var W = KIT.W;
  if (G.mode === 'select') return drawSelect();
  if (G.mode === 'vs') return drawVS();
  if (G.mode === 'end') return drawEnd();
  if (G.mode === 'title') { G.S = STAGES[0]; drawBack(); HEROLIST.forEach(function (id, i) { var H = HEROES[id]; var hx = W * 0.1 + i * 30; shadow(hx, 60, H.w, 0); KIT.spr(H.idle[Math.floor(G.t * H.idleF + i) % H.idle.length], hx, FLOOR + 60, {}); }); drawFront(); return; }
  var zoomed = G.mode === 'duel' || G.mode === 'won' || (G.mode === 'over' && G.duel), g = KIT.ctx;
  if (zoomed) { var z = G.zoom || 1.5; g.save(); g.translate(0, KIT.H - 22); g.scale(z, z); g.translate(0, -(FLOOR + LANE)); }
  drawWorld();
  if (zoomed) g.restore();
  if (zoomed) { drawDuelHUD(); if (G.mode === 'won') drawWon(); else if (G.mode === 'over') drawOver(); return; }
  drawHUD();
  if (G.mode === 'card') drawCard(); else if (G.mode === 'clear') drawClear(); else if (G.mode === 'over') drawOver();
}
/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; G.S = STAGES[0]; G.cam = 0; music.play('sktitle'); KIT.dropLayer();
  KIT.menu({ cls: 'clear', logo: '../assets/sk-logo.webp', title: 'Skeet Fighter', items: [
    { label: 'Story', fn: function () { toSelect('story'); } },
    { label: 'Arcade', fn: function () { toSelect('arcade'); } },
    { label: 'How to Play', fn: helpMenu },
    { label: 'Options', fn: function () { optionsMenu(titleMenu); } }] });
}
function storyMenu() { KIT.menu({ title: 'Skeet Fighter', html: STORY.map(function (s) { return '<p>' + s + '</p>'; }).join(''), items: [{ label: 'Back', back: true, fn: titleMenu }] }); }
function helpMenu(back) {
  KIT.menu({ title: 'How to Play', html: '<p><b>Story</b>: the streets of Clubhouse Row, beat-em-up style, six stages. At the end of each one the boss stops the brawl and it turns into a one on one, Street Fighter style. <b>Arcade</b>: ten one on one fights in a row; lose one and you can continue.</p>' +
    '<p><b>On the streets</b>: up and down walk into and out of the screen. <b>A</b> attack (keep pressing for a combo, it also picks things up), <b>B</b> jump, <b>X</b> special, <b>Y</b> super with a full meter. Double tap forward to run, A while running for a dash attack, A in the air for a flying kick. Walk into someone to grab them: A knees, A with a direction throws. X while you are being hit breaks away for a little health. Smash bins and crates for food and weapons; weapons wear out, DOWN + A throws one.</p>' +
    '<p><b>One on one</b>: <b>A</b> punch, <b>B</b> kick, <b>UP</b> jump (with a direction to jump at them or away), <b>DOWN</b> crouch. <b>Hold back to block</b>: low sweeps need down-back, jump-ins need standing. Down + A jab low, down + B sweep, down-forward + A uppercut, forward + B roundhouse, A and B in the air. Forward + A up close throws (it cannot be blocked). Chains: A then A, then B. A normal that hits cancels into a special with X.</p>' +
    '<p><b>Specials</b> (both modes): X fireball, UP + X rising move, FORWARD + X dash, DOWN + X ground move. <b>Motions</b>: down, down-forward, forward + a button is the EX fireball; forward, down, down-forward + a button the EX rising move (a quarter of the meter in a one on one, free on the streets).</p>' +
    '<p>The <b>Blumwashed homunculi</b> are not evil, just full of goo: beat it out of them and they go home.</p>', items: [{ label: 'Back', back: true, fn: back || titleMenu }] });
}
function optionsMenu(back) {
  KIT.menu({ title: 'Options', items: [KIT.resItem(function () { optionsMenu(back); }),
    SV.hardOpen ? { label: 'DIFFICULTY: ' + (SV.hard ? 'HARD' : 'NORMAL'), fn: function () { SV.hard = !SV.hard; persist(); optionsMenu(back); } } : { label: 'DIFFICULTY: NORMAL', sub: 'Hard opens when you beat Blumhead', dis: true },
    { label: 'Back', back: true, fn: back }] });
}
function toSelect(kind) { KIT.closeMenu(); G.mode = 'select'; G.pickKind = kind; G.rushPick = false; G.sel = G.sel || 0; G.selBox = []; music.play('sktitle'); }
function stepSelect() {
  if (KIT.pressed('right')) { G.sel = (G.sel + 1) % 4; sfx.play('blip'); } if (KIT.pressed('left')) { G.sel = (G.sel + 3) % 4; sfx.play('blip'); }
  if (KIT.ptr.tap && G.selBox) G.selBox.forEach(function (b, i) { var p = KIT.ptr; if (p.x > b[0] && p.x < b[0] + b[2] && p.y > b[1] && p.y < b[1] + b[3]) { if (G.sel === i) pickFighter(); else { G.sel = i; sfx.play('blip'); } } });
  if (KIT.pressed('a') || KIT.pressed('start')) pickFighter();
  if (KIT.pressed('b')) titleMenu();
}
function pickFighter() { sfx.play('fight'); if (G.pickKind === 'arcade') arcadeStart(HEROLIST[G.sel]); else newGame(HEROLIST[G.sel], {}); }
function pauseMenu() {
  if (G.mode !== 'play' && G.mode !== 'card' && G.mode !== 'duel') return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: G.arc ? 'Arcade · fight ' + (G.arc.i + 1) + ' of 10' : G.S.n, items: [{ label: 'Resume', fn: KIT.closeMenu }, { label: 'Move List', fn: moveList }, { label: 'How to Play', fn: function () { helpMenu(pauseMenu); } }, { label: 'Options', fn: function () { optionsMenu(pauseMenu); } }, { label: 'Quit to Title', fn: titleMenu }] });
}
function moveList() {
  var H = P.hero, sp = H.sp, V = H.vs;
  KIT.menu({ title: H.n, html: (G.duel ? '<p><b>A</b> jab, A again: cross, then B: ' + V.rh.n.toLowerCase() + '. <b>B</b> kick, <b>Forward + B</b> ' + V.rh.n.toLowerCase() + '. <b>Down + A</b> low jab, <b>Down + B</b> sweep, <b>Down-forward + A</b> uppercut. <b>Forward + A</b> close: throw. <b>Air A / B</b>: jump-ins. <b>Hold back</b>: block.</p>'
      : '<p><b>A A A A</b>: combo, ending in ' + (H.combo[H.combo.length - 1].n || 'a finisher') + '. <b>Run + A</b>: ' + (H.dash.n || 'dash attack') + '. <b>Air A</b>: ' + (H.air.n || 'flying kick') + '.</p>') +
    '<p><b>X</b>: ' + sp.fire.n + ' · <b>Up + X</b>: ' + sp.rise.n + ' · <b>Forward + X</b>: ' + sp.dash.n + ' · <b>Down + X</b>: ' + sp.ground.n + '</p>' +
    '<p><b>Down, down-forward, forward + A</b>: EX ' + sp.fire.n + ' · <b>Forward, down, down-forward + A</b>: EX ' + sp.rise.n + '</p><p><b>Y</b> (full meter): ' + sp.sup.n + '</p>', items: [{ label: 'Back', back: true, fn: pauseMenu }] });
}
/* ---------- the autopilot the tests use (G.bot): walks to the nearest foe, combos, specials, picks things up ---------- */
function botThink() {
  G.botA = G.botB = G.botX = G.botY = false; G.botK = null; if (!P) return;
  var t = botTarget(); G.botT = t;
  if (P.st === 'grab') { G.botA = Math.floor(G.t * 8) % 2 === 0; return; }
  if (P.st === 'atk' && P.mv && P.mvT > P.mv.st) { G.botA = true; P.buf = 1; return; }
  if (P.meter >= 100 && t && t.team === 'f') { G.botY = true; return; }
  if (!t) return; var dx = t.x - P.x, dz = t.z - P.z, reach = 22 + (t.w || 16) / 2;
  if (t.isItem) { if (Math.abs(dx) < 12 && Math.abs(dz) < 6) G.botA = true; return; }
  if (Math.abs(dx) < reach && Math.abs(dz) < 5) { P.face = dx >= 0 ? 1 : -1; if (Math.random() < 0.08) { G.botX = true; G.botK = pick(['rise', 'ground', 'dash']); } else G.botA = Math.floor(G.t * 10) % 2 === 0; }
  else if (Math.abs(dz) < 6 && Math.abs(dx) > 70 && Math.abs(dx) < 180 && P.spCd <= 0 && Math.random() < 0.03) { P.face = dx >= 0 ? 1 : -1; G.botX = true; G.botK = 'fire'; }
  if (P.st === 'hurt' && Math.random() < 0.05) G.botX = true;
  var danger = G.fx.some(function (f) { return f.k === 'mark' && Math.abs(f.x - P.x) < f.r + 8 && Math.abs(f.z - P.z) < 12; }) || (G.waves || []).some(function (w) { var d = Math.hypot(P.x - w.x, (P.z - w.z) * 2.6); return d > w.r && d - w.r < 30; }) || (G.beam && Math.abs(G.beam.z - P.z) < 12);
  if (danger) { G.botB = true; G.botDodge = 0.5; }
}
function botTarget() {
  var best = null, bd = 1e9;
  G.ents.forEach(function (e) { if (e.team !== 'f' || e.hp <= 0 || e.st === 'gone' || e.leaving || e.intro) return; var d = Math.abs(e.x - P.x) + Math.abs(e.z - P.z) * 2; if (d < bd) { bd = d; best = e; } });
  if (!best) { G.items.forEach(function (it) { if (it.h > 2 || (WEAPONS[it.id] && P.weapon) || it.x < G.cam + 12) return; var d = Math.abs(it.x - P.x) + Math.abs(it.z - P.z) * 2; if (d < bd && d < 220) { bd = d; best = { x: it.x, z: it.z, isItem: 1, w: 8 }; } }); }
  if (!best) G.props.forEach(function (p) { if (p.hp <= 0) return; var d = Math.abs(p.x - P.x) + Math.abs(p.z - P.z) * 2; if (d < bd && p.x > G.cam - 10 && p.x < G.cam + KIT.W + 60) { bd = d; best = p; } });
  return best;
}
function botInput() {
  var t = G.botT; if (G.botDodge > 0) { G.botDodge -= 1 / 60; return { mx: 0, mz: P.z > DEPTH / 2 ? -1 : 1 }; }
  if (!t) return { mx: 1, mz: 0 };
  var dx = t.x - P.x, dz = t.z - P.z, reach = t.isItem ? 4 : 18 + (t.w || 16) / 2;
  var mx = Math.abs(dx) > reach ? Math.sign(dx) : 0, mz = Math.abs(dz) > 3 ? Math.sign(dz) : 0;
  return { mx: mx, mz: mz };
}

KIT.start({ w: 384, h: 216, wide: 512, update: update, draw: draw, onPause: pauseMenu, startPauses: true,
  idleUpdate: function (dt) { if (G.mode === 'title') { G.t += dt; G.cam += 18 * dt; } },
  pad: { dpad: true, btns: [{ k: 'a', label: 'A', sub: 'HIT', cls: 'big' }, { k: 'b', label: 'B', sub: 'JUMP' }, { k: 'x', label: 'X', sub: 'SPECIAL' }, { k: 'y', label: 'Y', sub: 'SUPER', cls: 'gold' }] } });
titleMenu();
window.__sk = { G: G, get P() { return P; }, HEROES: HEROES, STAGES: STAGES, BOSSES: BOSSES, newGame: newGame, startStage: startStage, bossIntro: bossIntro, bossFight: bossFight, spawnFoe: spawnFoe, spawnBoss: spawnBoss, titleMenu: titleMenu, toSelect: toSelect,
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, drawNow: function () { draw(); }, set mode(m) { G.mode = m; } };
