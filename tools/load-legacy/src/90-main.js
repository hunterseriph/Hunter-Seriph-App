/* =====================================================================================================
   LOOP, TITLE AND BUTTONS
   ===================================================================================================== */
function step(dt) {
  G.t += dt; pollPad();
  input.l = keys.l || pad.l || gp.l; input.r = keys.r || pad.r || gp.r; input.j = keys.j || pad.j || gp.j; input.a = keys.a || pad.a || gp.a; input.s = keys.s || pad.s || gp.s; input.d = keys.d || pad.d || gp.d;
  if (G.banner > 0) G.banner -= dt; if (G.shake > 0) G.shake -= dt * 20; if (G.fade > 0) G.fade -= dt;
  if (G.msg) { G.msg.age += dt; if (G.msg.age > 4) G.msg = null; }
  G.flashT = (G.flashT || 5) - dt; if (G.flashT <= 0) { G.flash = 0.16; G.flashT = 4 + Math.random() * 5; } if (G.flash > 0) G.flash -= dt;
  if (G.paused) return;
  if (G.mode === 'play') stepPlay(dt); else if (G.mode === 'town') stepTown(dt);
  if (G.mode === 'play' && RUN) el('bC').classList.toggle('cool', P.mana < CLASSES[RUN.cls].specCost);
}
function titleInfo() {
  var s = META.started ? 'HEIRS ' + META.runs + '  ·  BANK ' + fmtN(META.bank) + '  ·  SEALS ' + sealCount() + '/4' + (META.blumWins ? '  ·  BLUMHEAD x' + META.blumWins : '') + (META.ng ? '  ·  NG+' + META.ng : '') : 'A NEW LEGACY BEGINS WITH CUMHEAD.';
  el('titleInfo').textContent = s; el('contBtn').disabled = !(readRun() || META.started);
}
function toTitle() { G.mode = 'title'; music.play('title'); el('title').hidden = false; el('over').hidden = true; setMenuMode(true); titleInfo(); }
function hideTitle() { el('title').hidden = true; setMenuMode(false); }
el('contBtn').addEventListener('click', function () { sfx.init(); sfx.click(); hideTitle(); if (!resumeRun()) { if (META.runs && !META.nextHeir) openHeirs(); else goTown(false); } });
el('newBtn').addEventListener('click', function () {
  sfx.init(); sfx.click();
  function fresh() { META = freshMeta(); META.nextHeir = 'cumhead'; saveMeta(); clearRun(); closeMenu(); hideTitle(); goTown(true); }
  if (!META.started) { fresh(); return; }
  openMenu({ title: 'Start Over?', note: 'This wipes your town, gear, runes, seals and every heir. It cannot be undone.', bank: 'none', rows: [
    { icon: 'curse', name: 'YES, BURN THE LEGACY', sub: 'Start again with Cumhead', fn: fresh },
    { icon: 'elixir', name: 'NO, KEEP IT', fn: function () { closeMenu(); setMenuMode(true); } }], back: function () { closeMenu(); setMenuMode(true); } });
});
el('overBtn').addEventListener('click', function () { sfx.init(); sfx.click(); el('over').hidden = true; openHeirs(); }); // straight on to choosing who goes next
(function () {
  var b = el('mute');
  function paint() { b.setAttribute('aria-pressed', sfx.muted ? 'true' : 'false'); b.setAttribute('aria-label', sfx.muted ? 'Sound off' : 'Sound on'); b.classList.toggle('off', sfx.muted); }
  b.addEventListener('click', function () { sfx.init(); sfx.setMuted(!sfx.muted); paint(); if (!sfx.muted) sfx.click(); });
  paint();
})();
el('pauseBtn').addEventListener('click', function () { sfx.init(); if ((G.mode === 'play' || G.mode === 'town') && !menuOpen()) openPause(); });
['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, function () { sfx.init(); }, { passive: true }); });
document.addEventListener('visibilitychange', function () { if (document.hidden) { sfx.suspend(); if (G.mode === 'play') saveRun(); } else sfx.init(); });
window.addEventListener('pagehide', function () { if (G.mode === 'play') saveRun(); });

function paintTitle() { var c = sprCanvas('throne', 1); if (c) el('title').style.backgroundImage = 'url(' + c.toDataURL() + ')'; }
imgs.sheet.addEventListener('load', function () { paintTitle(); G.layer = null; });
if (ok(imgs.sheet)) paintTitle();
resize(); toTitle();

var last = 0, acc = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  var dt = (ts - last) / 1000; last = ts; if (!(dt > 0) || dt > 0.25) dt = STEP;
  acc += dt; var n = 0; while (acc >= STEP && n < 5) { step(STEP); acc -= STEP; n++; } if (n === 5) acc = 0;
  render();
}
requestAnimationFrame(frame);
window.__ll = { step: step, G: G, get P() { return P; }, get RUN() { return RUN; }, get META() { return META; }, set META(v) { META = v; }, get L() { return L; }, get WORLD() { return WORLD; },
  get enemies() { return enemies; }, get bosses() { return bosses; }, get drops() { return drops; }, get ST() { return ST; }, keys: keys, input: input,
  startRun: startRun, goTown: goTown, enterRoom: enterRoom, enterArena: enterArena, openHeirs: openHeirs, openBuilding: openBuilding, useThing: useThing, hurtE: hurtE, hurtP: hurtP,
  genWorld: genWorld, buildRoom: buildRoom, calcStats: calcStats, resumeRun: resumeRun, readRun: readRun, saveRun: saveRun, closeMenu: closeMenu, menuOpen: menuOpen, toTitle: toTitle,
  get TOWN() { return TOWN; }, moveBody: moveBody, tileAt: tileAt, setL: function (l) { L = l; }, rsOf: rsOf, spawnRoom: spawnRoom, AREAS: AREAS, CLASSES: CLASSES, BOSSDEF: BOSSDEF, music: music, findNear: findNear, get cut() { return CUT; }, cutPlay: cutPlay, spawnTest: function (k, x, y) { var e = mkEnemy(k, x, y, -1); enemies.push(e); return e; }, special: special, attack: attack, render: render, get eshots() { return eshots; }, ENEMIES: ENEMIES, openGamble: openGamble, startEndless: startEndless, enterClub: enterClub, clubStation: clubStation };

/* ---------- controller in every menu + the on-screen controls toggle (padkit.js) ---------- */
if (window.HSPad) HSPad.setup({
  menu: function () { if (menuOpen()) return el('menu'); if (!el('over').hidden) return el('over'); if (!el('title').hidden) return el('title'); return null; },
  back: function (sc) { if (sc.id === 'menu') menuBackPress(); return true; },
  onStart: function () { if ((G.mode === 'play' || G.mode === 'town') && !G.paused && !menuOpen()) openPause(); },
  idle: function () { return !el('arc').hidden; },
  onSelect: function () { if (!el('arc').hidden) el('arcX').click(); },
  onFocus: function (b) { if (!menuOpen()) return; var i = menuButtons().indexOf(b); if (i >= 0 && i !== menuIdx) { menuIdx = i; paintKb(); } },
  tick: function () { sfx.click(); },
  touch: '#pad', toggleAfter: '#pauseBtn'
});
