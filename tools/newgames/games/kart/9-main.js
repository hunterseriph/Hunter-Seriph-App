/* =====================================================================================================
   CUMHEAD KART: menus, Grand Prix, single races, time trials, unlocks, saves and the loop.
   Saves: ck-save.
   ===================================================================================================== */
var SV = KIT.load(SAVE_KEY, null) || { v: 1, unlock: {}, cups: {}, best: {}, drops: 0, ch: 'cumhead', cls: 'mild', races: 0 };
['unlock', 'cups', 'best'].forEach(function (k) { if (!SV[k]) SV[k] = {}; });
if (SV.auto === undefined) SV.auto = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
function persist() { KIT.save(SAVE_KEY, SV); }
(function () { var sc = document.getElementById('scan'); if (sc) sc.hidden = true; })();
var GP = null, MODE = 'title';

/* ---------- what is open ---------- */
function charOpen(id) { var c = CH[id]; return !c.lock || !!SV.unlock[id]; }
function cupOpen(id) { var c = CUPS.filter(function (q) { return q.id === id; })[0]; return !c.lock || !!SV.unlock['cup_' + id]; }
function classOpen(id) { var c = CLASSES.filter(function (q) { return q.id === id; })[0]; return !c.lock || !!SV.unlock['cls_' + id]; }
function cupPlace(cup, cls) { return SV.cups[cup + '_' + cls] || 0; }
function won(cup, cls) { var p = cupPlace(cup, cls); return p === 1; }
function checkUnlocks() {
  var got = [], U = SV.unlock;
  function give(k, what) { if (!U[k]) { U[k] = 1; got.push(what); } }
  function anyCls(cup, best) { return CLASSES.some(function (c) { var p = cupPlace(cup, c.id); return p && p <= best; }); }
  if (anyCls('cream', 3)) give('cup_blood', 'The Blood Cup');
  if (anyCls('cream', 3)) give('cup_ctour', 'The Cream Tour'); if (anyCls('blood', 3)) give('cup_btour', 'The Blood Tour'); if (anyCls('moon', 3)) give('cup_mtour', 'The Moon Tour');
  if (anyCls('blood', 3)) give('cup_moon', 'The Moon Cup');
  if (CUPS.some(function (c) { return won(c.id, 'hot') || won(c.id, 'dyn'); })) give('cls_dyn', 'Dynamite class');
  if (anyCls('cream', 1)) give('kaya', 'Kaya'); if (anyCls('blood', 1)) give('beebs', 'Uncle Beeb'); if (anyCls('moon', 1)) give('ali', 'Ali');
  if (CUPS.every(function (c) { return won(c.id, 'hot') || won(c.id, 'dyn'); })) give('potbelly', 'Potbelly');
  if (CUPS.some(function (c) { return won(c.id, 'dyn'); })) give('blum', 'Blumhead');
  if (CUPS.every(function (c) { return won(c.id, 'dyn'); })) give('kingblum', 'King Blumhead');
  if ((SV.drops || 0) >= 1000) give('sirj', 'Sir Johnathan');
  persist(); return got;
}
/* ---------- little portraits for the menus, cut from the sprite sheet ---------- */
var PORTS = {};
function portrait(n, size, bg) {
  var key = n + size + (bg || ''); if (PORTS[key]) return PORTS[key]; var f = KIT.SPR[n]; if (!f || !KIT.sheetReady) return '';
  var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, size, size); }
  var k = Math.min((size - 4) / f[2], (size - 4) / f[3]); k = k >= 1 ? Math.floor(k) : k; var w = f[2] * k, h = f[3] * k;
  g.drawImage(KIT.sheet, f[0], f[1], f[2], f[3], Math.round((size - w) / 2), Math.round(size - h - 2), Math.round(w), Math.round(h)); return (PORTS[key] = c.toDataURL());
}
function img(n, size, bg) { var u = portrait(n, size || 44, bg || '#140809'); return u ? '<img src="' + u + '" width="' + (size || 44) + '" height="' + (size || 44) + '" style="image-rendering:pixelated;vertical-align:middle;margin-right:10px;float:left">' : ''; }
function bars(v) { var s = ''; for (var i = 0; i < 5; i++) s += i < v ? '▮' : '▯'; return s; }

/* ---------- the title, with a race going on behind it ---------- */
function demo() {
  var open = COURSEORDER.filter(function (c) { return CUPS.some(function (q) { return q.courses.indexOf(c) >= 0 && cupOpen(q.id); }); });
  var chars = shuffle(CHARS.filter(function (c) { return charOpen(c.id); }).map(function (c) { return c.id; })).slice(0, 8);
  startRace({ course: pick(open), cls: 'hot', player: chars[0], rivals: chars.slice(1), mode: 'demo' }); RACE.demo = true; RACE.me.ai = true; RACE.me.skill = 1; RACE.phase = 'go'; RACE.camSnap = true;
  music.play('ck_title');
}
function helpMenu(back) {
  KIT.menu({ cls: 'ck plain', title: 'How to drive', wide: true, html: '<b>Steer</b> with the d-pad or left stick.<br><b>Gas</b> A (or up, or the right trigger). <b>Brake / reverse</b> B (or the left trigger). Hold <b>down</b> as you use an item to throw it behind you. <b>Start boost:</b> hold A on the grid to rev, and keep the needle in the green when GO lands; red over-revs and stalls you. On a phone, auto accelerate is on, so you only steer.<br>' +
    '<b>Drift</b>: hold R (RB, C or Shift) while turning. Hold it through the bend: blue sparks, then orange, then cream. Let go for a boost. The longer the drift, the bigger the boost.<br>' +
    '<b>Items</b>: drive through the red boxes, then Z (Y, LB or V) to use. Hold back to throw pies and pills behind you, up to lob a pill ahead.<br>' +
    '<b>Ramps</b>: press drift in the air for a trick and a boost when you land.<br><b>Drops</b> on the road make you a little faster, up to ten. Getting hit spills two.<br><br>' +
    '<b>Chain Race</b>: ' + CHAINHELP + '<br><br>' +
    Object.keys(ITEMS).filter(function (k) { return k !== 'cuppa3'; }).map(function (k) { return '<b>' + ITEMS[k].n + '</b>: ' + ITEMS[k].d; }).join('<br>'),
    items: [{ label: 'BACK', back: 1, fn: back || titleMenu }] });
}
function optionsMenu() {
  KIT.menu({ cls: 'ck plain', title: 'Options', items: [
    { label: 'AUTO ACCELERATE: ' + (SV.auto ? 'ON' : 'OFF'), sub: 'The kart drives itself forward; brake to slow down', fn: function () { SV.auto = !SV.auto; persist(); optionsMenu(); } },
    { label: 'BACK', back: 1, fn: titleMenu }] });
}
function rivalsFor(ch) {
  var pool = CHARS.filter(function (c) { return c.id !== ch && charOpen(c.id); }).map(function (c) { return c.id; });
  if (pool.length < 7) pool = pool.concat(CHARS.filter(function (c) { return c.id !== ch && !charOpen(c.id) && c.id !== 'kingblum' && c.id !== 'sirj'; }).map(function (c) { return c.id; }));
  return shuffle(pool).slice(0, 7);
}
function go(o) { KIT.closeMenu(); MODE = 'race'; startRace(o); }
function beginGP(cup) { // points are kept per kart (two players can pick the same driver online)
  var roster = typeof mpRoster === 'function' ? mpRoster(SV.ch, rivalsFor(SV.ch), 8) : null;
  if (!roster) roster = { ch: [SV.ch].concat(rivalsFor(SV.ch)), names: [], humans: [0] };
  GP = { cup: cup, cls: SV.cls, roster: roster.ch, names: roster.names, humans: roster.humans, n: 0, pts: roster.ch.map(function () { return 0; }), grid: null }; gpRace();
}
function gpRace() { go({ course: GP.cup.courses[GP.n], cls: GP.cls, player: GP.roster[0], rivals: GP.roster.slice(1), mode: 'gp', grid: GP.grid, humans: GP.humans, names: GP.names, fixed: 1, chain: !!GP.chain }); }
function beginRace(course) { GP = null; go({ course: course, cls: SV.cls, player: SV.ch, rivals: rivalsFor(SV.ch), mode: 'race' }); }
function beginTT(course) { GP = null; go({ course: course, cls: 'hot', player: SV.ch, rivals: [], mode: 'tt' }); }

/* ---------- the end of a race ---------- */
function finishRace() {
  var R = RACE; R.phase = 'done'; R.doneT = 0; var k = R.me; if (R.demo) return;
  music.play(R.tt || k.place <= 3 ? 'ck_win' : 'ck_results'); sfx.play(k.place <= 3 ? 'win' : 'lose');
  if (!R.demo && !R.ev) { var b = SV.best[R.o.course] || {}, lap = Math.min.apply(null, k.laps); if (!b.lap || lap < b.lap) { b.lap = lap; R.newLap = true; } if (!b.race || k.time < b.race) { b.race = k.time; R.newRace = true; } SV.best[R.o.course] = b; SV.drops = (SV.drops || 0) + (R.got || 0); SV.races = (SV.races || 0) + 1; persist(); }
}
function pauseMenu() {
  if (!RACE || RACE.demo || MODE !== 'race' || KIT.menuOpen()) return;
  var R = RACE;
  KIT.menu({ title: 'Paused', sub: R.def.n + (GP ? '  ·  race ' + (GP.n + 1) + ' of 4' : ''), cls: 'ck plain', items: [
    { label: 'CARRY ON', def: 1, back: 1, fn: KIT.closeMenu },
    R.net === 'client' ? null : { label: 'START AGAIN', fn: function () { if (R.ev) expGo(R.ev); else if (GP) gpRace(); else if (R.tt) beginTT(R.o.course); else if (R.chain) beginChain(R.o.course); else beginRace(R.o.course); } },
    { label: 'AUTO ACCELERATE: ' + (SV.auto ? 'ON' : 'OFF'), fn: function () { SV.auto = !SV.auto; persist(); KIT.closeMenu(); pauseMenu(); } },
    { label: 'HOW TO DRIVE', fn: function () { KIT.menu({ cls: 'ck plain', title: 'How to drive', html: 'Steer: d-pad or stick. A gas, B brake. Down + Z throws behind you. On the grid, rev with A and hold the needle in the green. Hold R while turning to drift, let go for a boost. Z uses your item.', items: [{ label: 'BACK', back: 1, fn: pauseMenu }] }); } },
    R.net ? { label: R.net === 'host' ? 'END THE RACE FOR EVERYONE' : 'LEAVE THE ROOM', fn: function () { if (R.net === 'host') { RACE = null; GP = null; mpLobby(); } else { netLeave(); RACE = null; mpMenu(); } } } : { label: 'QUIT TO THE TITLE', fn: function () { RACE = null; GP = null; titleMenu(); } }] });
}

/* ---------- the engine note: a low buzz that climbs with your speed ---------- */
var ENG = null;
function engine() {
  var au = KIT.sfx.audio(); if (!au) return;
  if (!ENG) { var o = au.ctx.createOscillator(), o2 = au.ctx.createOscillator(), f = au.ctx.createBiquadFilter(), g = au.ctx.createGain(); o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(au.master); o.start(); o2.start(); ENG = { o: o, o2: o2, g: g, f: f }; }
  var R = RACE, on = R && !R.demo && MODE === 'race' && !KIT.menuOpen() && !KIT.sfx.muted, k = on ? R.me : null, sp = k ? Math.abs(k.spd) / k.top : 0, t = au.ctx.currentTime;
  var fr = 46 + sp * 90 + (k && R.phase === 'count' ? (k.rpm || 0) * 80 : 0) + (k && k.boostT > 0 ? 25 : 0) + (k && k.drift ? 8 : 0);
  ENG.o.frequency.setTargetAtTime(fr, t, 0.06); ENG.o2.frequency.setTargetAtTime(fr * 0.5, t, 0.06); ENG.g.gain.setTargetAtTime(on ? 0.035 + sp * 0.03 + (R.phase === 'count' ? (k.rpm || 0) * 0.025 : 0) : 0, t, 0.08);
}

/* ---------- the loop ---------- */
function update(dt) {
  if (RACE) { stepRace(dt); if (RACE && RACE.me && !RACE.demo && RACE.me.roul <= 0 && RACE.me.item && RACE.itemSeen !== RACE.me.item + RACE.me.itemN) { RACE.itemSeen = RACE.me.item + RACE.me.itemN; } }
  engine();
}
function idle(dt) { if (RACE && (RACE.demo || (RACE.net && MODE === 'race' && !RACE.ended))) stepRace(dt); engine(); } // online races don't stop while your pause menu is open
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, 480, 270);
  if (!R3.ok) return;
  if (RACE) { drawRace(1 / 60); if (!RACE.demo) drawHud(); }
}
var CKPAD = { dpad: true, btns: [{ k: 'a', label: 'A', sub: 'GAS', cls: 'big' }, { k: 'x', label: 'R', sub: 'DRIFT' }, { k: 'y', label: 'Z', sub: 'ITEM', cls: 'gold' }, { k: 'b', label: 'B', sub: 'BRAKE' }] }, PADCHAIN = false;
function chainPad(on) { if (on === PADCHAIN) return; PADCHAIN = on; KIT.buildPad(on ? CHAINPAD : CKPAD); } // the CHAIN button only shows in a chain race
KIT.start({ w: 480, h: 270, update: update, draw: draw, idleUpdate: idle, onPause: pauseMenu, startPauses: true, pad: CKPAD });
if (!R3.ok) KIT.menu({ title: 'Cumhead Kart', sub: 'This device cannot draw 3D (WebGL is switched off or missing), so the karts cannot run here.', items: [] });
else { var FONTOK = false, fontT = Date.now(); try { document.fonts.load('22px "Pirata One"').then(function () { FONTOK = true; }, function () { FONTOK = true; }); } catch (e) { FONTOK = true; }
  (function wait() { if (KIT.sheetReady && (FONTOK || Date.now() - fontT > 2500)) titleMenu(); else setTimeout(wait, 50); })(); }
window.__ck = { get R() { return RACE; }, startRace: startRace, SV: SV, CHARS: CHARS, COURSES: COURSES, get GP() { return GP; }, titleMenu: titleMenu, beginGP: beginGP, beginRace: beginRace, beginTT: beginTT, checkUnlocks: checkUnlocks, endRace: endRace, standings: standings,
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, idle: function (n) { for (var i = 0; i < n; i++) idle(1 / 60); }, drawNow: function () { draw(); }, set mode(m) { MODE = m; } };
window.__aiPeek = function (k) { var keep = { laneT: k.laneT, lane: k.lane, aiDrift: k.aiDrift, itemT: k.itemT }; var o = aiInput(k, 0); for (var q in keep) k[q] = keep[q]; return o; };
