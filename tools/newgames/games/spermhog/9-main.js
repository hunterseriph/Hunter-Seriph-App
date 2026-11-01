/* =====================================================================================================
   THE GAME: title, zone cards, playing an act, the act clear tally, lives and continues, saves and menus.
   ===================================================================================================== */
var SV = KIT.load('hog-save2', null) || { reached: 0, best: {}, hi: 0 }; SV.chal = SV.chal || [];
function chalCount() { return SV.chal.filter(Boolean).length; }
function persist() { KIT.save('hog-save2', SV); }
var G = { mode: 'title', t: 0, time: 0, lives: 3, drops: 0, score: 0, kills: 0, nextLife: 100, shoes: 0, star: 0, shake: 0, banner: 0, ai: 0, cam: 0 };
/* sounds for this game */
(function () { var t = sfx.tone, n = sfx.noise;
  sfx.add('drop', function () { t('square', 1568, 1568, 0.05, 0.035); t('square', 2093, 2093, 0.16, 0.03, 0.05); });
  sfx.add('spring', function () { t('square', 220, 880, 0.18, 0.05); t('triangle', 440, 1320, 0.2, 0.04); });
  sfx.add('dash', function () { n(0.25, 0.1, 1500); t('sawtooth', 200, 900, 0.25, 0.04); });
  sfx.add('bump', function () { t('square', 880, 1320, 0.08, 0.05); t('square', 1320, 1760, 0.08, 0.04, 0.05); });
  sfx.add('box', function () { n(0.12, 0.15, 1200); t('square', 660, 990, 0.1, 0.04); });
  sfx.add('check', function () { [784, 988, 1175, 1568].forEach(function (f, i) { t('square', f, f, 0.07, 0.04, i * 0.06); }); });
  sfx.add('goal', function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { t('square', f, f, 0.1, 0.045, i * 0.07); }); });
  sfx.add('scatter', function () { for (var i = 0; i < 6; i++) t('square', 1568 - i * 90, 1200 - i * 90, 0.06, 0.03, i * 0.035); });
  sfx.add('die', function () { t('square', 880, 110, 0.6, 0.06); n(0.3, 0.1, 800); });
  sfx.add('jump2', function () { t('square', 500, 1000, 0.1, 0.045); });
  sfx.add('crumble', function () { n(0.3, 0.12, 300); });
  sfx.add('thud', function () { n(0.25, 0.25, 160); t('sine', 90, 40, 0.25, 0.15); });
  sfx.add('throw', function () { n(0.08, 0.06, 2500); });
  sfx.add('clink', function () { t('square', 1800, 1500, 0.06, 0.04); });
  sfx.add('pop', function () { n(0.1, 0.15, 1500); t('square', 600, 200, 0.1, 0.05); });
  sfx.add('bosshit', function () { n(0.2, 0.25, 700); t('sawtooth', 300, 80, 0.2, 0.08); });
  sfx.add('super', function () { [392, 523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { t('square', f, f, 0.09, 0.05, i * 0.05); t('triangle', f / 2, f / 2, 0.12, 0.04, i * 0.05); }); n(0.4, 0.08, 3000); });
  sfx.add('warp', function () { for (var i = 0; i < 12; i++) t('square', 300 + i * 120, 600 + i * 140, 0.08, 0.04, i * 0.04); });
  sfx.add('chalice', function () { [784, 988, 1175, 1568, 1175, 1568, 2093].forEach(function (f, i) { t('square', f, f, 0.14, 0.05, i * 0.1); t('triangle', f / 2, f / 2, 0.14, 0.04, i * 0.1); }); });
  sfx.add('life', function () { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { t('square', f, f, 0.12, 0.05, i * 0.11); }); });
})();
/* ---------- flow ---------- */
function newGame(zone) { G.lives = 3; G.score = 0; G.kills = 0; beginAct(zone * 2); }
function beginAct(ai, fromCheck) {
  KIT.closeMenu(); var keep = fromCheck ? G.check : null;
  G.ai = ai; loadAct(ai); G.check = keep; var sx = keep ? keep.x : LV.sx, sy = keep ? keep.y : LV.sy;
  newPlayer(sx, sy); G.time = keep ? keep.time || 0 : 0; G.drops = 0; G.nextLife = 100; G.shoes = 0; G.star = 0; G.bossDone = 0; G.boss = G.boss2 = null; G.lock = null; G.bossName = null; G.pendingBoss = null; G.super = 0; G.curDist = undefined; G.distT = 0;
  if (keep) ENTS.forEach(function (e) { if (e.k === 'check' && Math.abs(e.x - keep.x) < 4) e.on = true; });
  CAM.x = Math.max(0, sx - KIT.W * 0.42); CAM.y = Math.max(0, sy - KIT.H * 0.62);
  G.mode = 'card'; G.cardT = 0; music.play(LV.zone.song); G.ctl = true;
}
function loseLife() {
  G.lives--; if (G.lives < 0) { gameOver(); return; }
  if (G.check) G.check.time = G.check.time || G.time; beginAct(G.ai, !!G.check); G.cardT = 1.6;
}
function gameOver() {
  G.mode = 'over'; music.stop(0.5); sfx.play('lose'); if (G.score > SV.hi) { SV.hi = G.score; persist(); }
  KIT.menu({ cls: 'clear', title: 'Game Over', sub: 'Score ' + G.score, items: [
    { label: 'CONTINUE', sub: 'From the start of ' + ZONES[ACTS[G.ai].z].name + ' act ' + ACTS[G.ai].act, def: true, fn: function () { G.lives = 3; G.score = 0; G.check = null; beginAct(G.ai); } },
    { label: 'TITLE', fn: titleMenu }] });
}
function actClear(boss) {
  if (G.mode !== 'play') return; G.mode = 'clear'; G.clearT = 0; G.clearBoss = !!boss; music.play('hogclear'); G.star = 0;
  var t = G.time; G.tb = t < 60 ? 50000 : t < 90 ? 10000 : t < 120 ? 5000 : t < 150 ? 4000 : t < 180 ? 3000 : t < 240 ? 2000 : t < 300 ? 1000 : t < 420 ? 500 : 0;
  G.db = G.drops * 100; G.tally = 0;
  var key = 'a' + G.ai, b = SV.best[key]; if (!b || t < b) SV.best[key] = Math.round(t * 100) / 100;
  var z = ACTS[G.ai].z; if (ACTS[G.ai].act === 2 && SV.reached < z + 1) SV.reached = Math.min(ZONES.length - 1, z + 1); persist();
}
function nextAct() {
  if (G.ai + 1 >= ACTS.length) { ending(); return; }
  G.check = null; beginAct(G.ai + 1);
}
function ending() {
  G.mode = 'end'; music.play('hogtitle'); if (G.score > SV.hi) { SV.hi = G.score; persist(); } SV.done = 1; persist();
  KIT.menu({ cls: 'clear', title: 'Blumhead is done for', sub: (chalCount() >= 7 ? 'The seven Cum Chalices glow in the clubhouse. ' : '') + 'Spunk Brain falls quiet. The homunculi are free, and Cumhead walks home through Night City as the sun comes up. Score ' + G.score + '.', items: [{ label: 'BACK TO THE TITLE', def: true, fn: titleMenu }] });
}
/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; G.check = null; if (!LV || LV.ai !== 0) loadAct(0); newPlayer(LV.sx, LV.sy); PL.state = 'normal'; music.play('hogtitle');
  var items = [{ label: 'START', def: true, fn: function () { newGame(0); } }];
  if (SV.reached > 0) items.push({ label: 'ZONE SELECT', fn: zoneMenu });
  items.push({ label: 'HOW TO PLAY', fn: helpMenu });
  KIT.menu({ cls: 'clear', logo: '../assets/hog-logo.webp', title: 'Cumhead the Spermhog', items: items, note: (SV.hi ? 'HIGH SCORE ' + SV.hi : '') + (chalCount() ? '   CHALICES ' + chalCount() + '/7' : '') });
}
function zoneMenu() {
  KIT.menu({ cls: 'clear', title: 'Zone select', items: ZONES.map(function (z, i) { return { label: z.name + ' ZONE', dis: i > SV.reached, sub: bestTxt(i), fn: function () { newGame(i); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]) });
}
function bestTxt(z) { var a = SV.best['a' + z * 2], b = SV.best['a' + (z * 2 + 1)]; return (a ? 'Act 1 ' + clock(a) : '') + (b ? '  ·  Act 2 ' + clock(b) : ''); }
function clock(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
function helpMenu() {
  KIT.menu({ cls: 'clear', title: 'How to play', wide: true, html: '<b>Run</b> with the d-pad or stick. Slopes speed you up going down. <b>A</b> jumps, press it again in the air to <b>double jump</b>. <b>B</b> shoots.<br>Land on foes to stomp them. <b>Drops</b> keep you alive: get hit and they scatter (grab some back), get hit with none and you lose a life. 100 drops is an extra life.<br>Item boxes hold drops, a bubble shield, speed shoes, invincibility or a life. Lamp posts are checkpoints. Run past the sign to clear an act; Act 2 of every zone ends with a boss: eight hits.<br>Routes split: a spring up to the high road, the street, or a hole down to the low road. One of them in every act hides a <b>giant gold ring</b>: jump in with 50 drops for a special stage and a <b>Cum Chalice</b>. Get all seven, then with 50 drops jump, hold <b>up</b> and press <b>B</b>: <b>Super Cumhead</b>.',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') KIT.closeMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (KIT.menuOpen()) return;
  if (G.mode === 'special') { KIT.menu({ cls: 'clear', title: 'Paused', sub: 'SPECIAL STAGE', items: [{ label: 'CARRY ON', def: true, back: true, fn: KIT.closeMenu }, { label: 'LEAVE THE STAGE', fn: function () { KIT.closeMenu(); SS.state = 'fail'; SS.st = 0; } }] }); return; }
  if (G.mode !== 'play') return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: LV.zone.name + ' ZONE  ·  ACT ' + ACTS[G.ai].act, items: [
    { label: 'CARRY ON', def: true, back: true, fn: KIT.closeMenu },
    { label: 'RESTART ACT', fn: function () { G.check = null; beginAct(G.ai); } },
    { label: 'HOW TO PLAY', fn: helpMenu },
    { label: 'QUIT TO TITLE', fn: titleMenu }] });
}
/* ---------- the loop ---------- */
function update(dt) {
  G.t += dt; if (G.banner > 0) G.banner -= dt; if (G.distT > 0) G.distT -= dt;
  if (G.mode === 'title') { CAM.x += 30 * dt; if (CAM.x > LV.w * TS - KIT.W) CAM.x = 0; G.cam = CAM.x; return; }
  if (G.mode === 'special') { if (!KIT.menuOpen()) stepSpecial(dt); return; }
  if (G.mode === 'card') { G.cardT += dt; if (G.cardT > 2.4) { G.mode = 'play'; } stepWorld(dt); camera(dt); return; }
  if (G.mode === 'play' || G.mode === 'clear') {
    if (G.mode === 'play') { G.time += dt; if (G.time >= 600 && PL.state !== 'dead') die(false); }
    if (G.shoes > 0) G.shoes -= dt; if (G.star > 0) G.star -= dt;
    stepPlayer(dt); stepSuper(dt); stepWorld(dt); stepBoss(dt); camera(dt);
    if (G.pendingBoss) { G.pendingBoss.t -= dt; if (G.pendingBoss.t <= 0) { var pb = G.pendingBoss; G.pendingBoss = null; G.boss = mkBoss(pb.id, pb.x, pb.y); G.boss.t = 2.2; G.banner = 2.4; G.bannerTxt = BOSSES[pb.id].name; G.bossName = BOSSES[pb.id].name; sfx.play('roar'); } }
    if (G.mode === 'clear') { G.clearT += dt; if (G.clearT > 2.2 && (G.tb > 0 || G.db > 0)) { var st = Math.min(G.tb, 4000 * dt * 10), sd = Math.min(G.db, 4000 * dt * 10); G.tb -= st; G.db -= sd; G.score += Math.round(st + sd); if (Math.floor(G.t * 20) % 2) sfx.play('tick'); }
      if (G.clearT > 2.2 && G.tb <= 0 && G.db <= 0) { G.tb = G.db = 0; if (!G.clearDone) { G.clearDone = G.clearT; sfx.play('coin'); } if (G.clearT - G.clearDone > 1.6 || (G.clearT - G.clearDone > 0.4 && (KIT.pressed('a') || KIT.pressed('start')))) { G.clearDone = 0; nextAct(); } } }
  }
}
function draw() {
  var g = KIT.ctx; g.clearRect(0, 0, KIT.W, KIT.H);
  if (G.mode === 'special' && SS) { drawSpecial(); return; }
  if (!LV || !TILESET) return;
  drawWorld();
  if (G.mode === 'title' || G.mode === 'over' || G.mode === 'end') return;
  drawHud(); drawDistBanner();
  if (G.mode === 'card') drawCard(G.cardT);
  if (G.mode === 'clear' && G.clearT > 1) drawTally();
}
function drawCard(t) { // the zone title card, slides in and out
  var W = KIT.W, H = KIT.H, a = ACTS[G.ai], z = LV.zone, k = t < 0.4 ? t / 0.4 : t > 2.0 ? Math.max(0, 1 - (t - 2.0) / 0.4) : 1, g = KIT.ctx;
  g.fillStyle = 'rgba(7,4,5,' + (0.85 * k).toFixed(2) + ')'; g.fillRect(0, 0, W, H);
  var bx = -W + W * k; R('#c4121c', bx, H * 0.36, W * 0.72, 30); R('#12040a', bx, H * 0.36 + 30, W * 0.72, 3);
  text(z.name, W * 0.66 - (1 - k) * W, H * 0.38, { size: 32, align: 'right', col: '#f1e7d0', font: 'title', outline: true });
  text('ZONE', W * 0.66 - (1 - k) * W, H * 0.38 + 38, { size: 16, align: 'right', col: '#ffe36a', font: 'title', outline: true });
  var cx = W * 0.78 + (1 - k) * W, cy = H * 0.58; g.fillStyle = '#12040a'; g.beginPath(); g.arc(cx, cy, 24, 0, 6.3); g.fill(); g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(cx, cy, 22, 0, 6.3); g.fill();
  text('ACT', cx, cy - 16, { size: 6, align: 'center', col: '#12040a' }); text(String(a.act), cx, cy - 8, { size: 16, align: 'center', col: '#12040a' });
}
function drawTally() {
  var W = KIT.W, cx = W / 2, y = 70, k = Math.min(1, (G.clearT - 1) * 3);
  text('CUMHEAD GOT', cx - (1 - k) * W, y, { size: 16, align: 'center', col: '#f1e7d0', font: 'title', outline: true });
  text(G.clearBoss ? 'THROUGH ' + LV.zone.name : 'THROUGH ACT ' + ACTS[G.ai].act, cx + (1 - k) * W, y + 26, { size: 16, align: 'center', col: '#ff2630', font: 'title', outline: true });
  if (G.clearT > 1.8) { text('TIME BONUS', cx - 110, y + 70, { size: 8, col: '#ffe36a', outline: true }); text(String(Math.round(G.tb)), cx + 110, y + 70, { size: 8, align: 'right', outline: true });
    text('DROP BONUS', cx - 110, y + 90, { size: 8, col: '#ffe36a', outline: true }); text(String(Math.round(G.db)), cx + 110, y + 90, { size: 8, align: 'right', outline: true });
    text('SCORE', cx - 110, y + 114, { size: 8, col: '#ffe36a', outline: true }); text(String(G.score), cx + 110, y + 114, { size: 8, align: 'right', outline: true }); }
}
KIT.start({ w: 480, h: 270, wide: 640, update: update, draw: draw, onPause: pauseMenu, idleUpdate: function (dt) { if (G.mode === 'title' || G.mode === 'over' || G.mode === 'end') update(dt); },
  pad: { dpad: true, btns: [{ k: 'a', label: 'A', sub: 'JUMP', cls: 'big' }, { k: 'b', label: 'B', sub: 'SHOT' }] } });
titleMenu();
window.__ch = { G: G, get PL() { return PL; }, get LV() { return LV; }, ACTS: ACTS, ZONES: ZONES, beginAct: beginAct, newGame: newGame, loadAct: loadAct, startBoss: startBoss, ENTS: function () { return ENTS; },
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, drawNow: function () { draw(); }, set mode(m) { G.mode = m; } };
