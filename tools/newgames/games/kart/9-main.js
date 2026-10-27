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
function titleMenu() {
  MODE = 'title'; GP = null; if (!RACE || !RACE.demo) demo();
  KIT.menu({ logo: '../assets/ck-logo.webp', title: 'Cumhead Kart', cls: 'clear', items: [
    { label: 'GRAND PRIX', sub: 'Four races, points for every place, a trophy at the end', fn: function () { pickClass(function () { pickChar(function () { pickCup(beginGP); }); }); }, def: 1 },
    { label: 'SINGLE RACE', sub: 'Any course you have opened, against seven rivals', fn: function () { pickClass(function () { pickChar(function () { pickCourse(beginRace); }); }); } },
    { label: 'TIME TRIAL', sub: 'Just you, the clock and three Cumpuccinos', fn: function () { pickChar(function () { pickCourse(beginTT); }); } },
    { label: 'HOW TO DRIVE', sub: 'Controls, drifting and items', fn: helpMenu },
    { label: 'OPTIONS', sub: 'Auto accelerate: ' + (SV.auto ? 'ON' : 'OFF'), fn: optionsMenu }
  ], note: 'Drops collected in races: ' + (SV.drops || 0) + '   ·   Trophies: ' + Object.keys(SV.cups).filter(function (k) { return SV.cups[k] <= 3; }).length });
}
function helpMenu() {
  KIT.menu({ title: 'How to drive', wide: true, html: '<b>Steer</b> with the d-pad or left stick.<br><b>Gas</b> A (or up, or the right trigger). <b>Brake / reverse</b> B (or down, or the left trigger). On a phone, auto accelerate is on, so you only steer.<br>' +
    '<b>Drift</b>: hold R (RB, C or Shift) while turning. Hold it through the bend: blue sparks, then orange, then cream. Let go for a boost. The longer the drift, the bigger the boost.<br>' +
    '<b>Items</b>: drive through the red boxes, then Z (Y, LB or V) to use. Hold back to throw pies and pills behind you, up to lob a pill ahead.<br>' +
    '<b>Start boost</b>: hold gas just as the 1 disappears. Too early and you spin your wheels.<br><b>Ramps</b>: press drift in the air for a trick and a boost when you land.<br><b>Drops</b> on the road make you a little faster, up to ten. Getting hit spills two.<br><br>' +
    '<b>Items</b>: Cream Pie, Three Pies, TB\'s Silly Pill, Homing Sperm, Cumpuccino (x1 or x3), Spermaid\'s Bubble, Cum Cracker, Meatnado, Blum\'s Goo, and Sir Johnathan, who hunts down whoever is winning.',
    items: [{ label: 'BACK', back: 1, fn: titleMenu }] });
}
function optionsMenu() {
  KIT.menu({ title: 'Options', items: [
    { label: 'AUTO ACCELERATE: ' + (SV.auto ? 'ON' : 'OFF'), sub: 'The kart drives itself forward; brake to slow down', fn: function () { SV.auto = !SV.auto; persist(); optionsMenu(); } },
    { label: 'BACK', back: 1, fn: titleMenu }] });
}
function pickClass(next) {
  KIT.menu({ title: 'Mild, hot or dynamite?', sub: 'How fast everyone goes', items: CLASSES.map(function (c) { var op = classOpen(c.id); return { label: op ? c.n.toUpperCase() : '???', sub: op ? c.sub : c.lock, dis: !op, def: SV.cls === c.id, fn: function () { SV.cls = c.id; persist(); next(); } }; }).concat([{ label: 'BACK', back: 1, fn: titleMenu }]) });
}
function pickChar(next) {
  var items = CHARS.map(function (c) { var op = charOpen(c.id); return { label: (op ? img(c.f, 44) : img(c.f, 44, '#000')) + (op ? c.n.toUpperCase() : '???'), sub: op ? '<span style="font-family:monospace;letter-spacing:-1px">SPD ' + bars(c.st[0]) + '<br>ACC ' + bars(c.st[1]) + '<br>HND ' + bars(c.st[2]) + '<br>WGT ' + bars(c.st[3]) + '</span>' : c.lock, dis: !op, def: SV.ch === c.id, fn: function () { SV.ch = c.id; persist(); next(); } }; });
  KIT.menu({ title: 'Who is driving?', wide: true, grid: true, items: items.concat([{ label: 'BACK', back: 1, fn: titleMenu }]) });
  [].forEach.call(document.querySelectorAll('#menu .mbtn:disabled img'), function (im) { im.style.filter = 'brightness(0)'; });
}
function pickCup(next) {
  KIT.menu({ title: 'Choose a cup', sub: CLASSES.filter(function (c) { return c.id === SV.cls; })[0].n + ' class', items: CUPS.map(function (c) {
    var op = cupOpen(c.id), p = cupPlace(c.id, SV.cls), tro = p === 1 ? 'ck_gold' : p === 2 ? 'ck_silver' : p === 3 ? 'ck_bronze' : c.ic;
    return { label: img(tro, 40) + (op ? c.n.toUpperCase() : '???'), sub: op ? c.courses.map(function (k) { return COURSES[k].n; }).join(' · ') + (p ? '<br>Best: ' + ordinal(p) : '') : c.lock, dis: !op, fn: function () { next(c); } };
  }).concat([{ label: 'BACK', back: 1, fn: titleMenu }]) });
}
function pickCourse(next) {
  var items = []; CUPS.forEach(function (cup) { if (!cupOpen(cup.id)) return; cup.courses.forEach(function (k) { var c = COURSES[k], b = SV.best[k]; items.push({ label: c.n.toUpperCase(), sub: 'From ' + c.from + (b ? '<br>Best lap ' + fmtTime(b.lap) + '  ·  Best race ' + fmtTime(b.race) : ''), fn: function () { next(k); } }); }); });
  KIT.menu({ title: 'Choose a course', wide: true, grid: true, items: items.concat([{ label: 'BACK', back: 1, fn: titleMenu }]) });
}
function rivalsFor(ch) {
  var pool = CHARS.filter(function (c) { return c.id !== ch && charOpen(c.id); }).map(function (c) { return c.id; });
  if (pool.length < 7) pool = pool.concat(CHARS.filter(function (c) { return c.id !== ch && !charOpen(c.id) && c.id !== 'kingblum' && c.id !== 'sirj'; }).map(function (c) { return c.id; }));
  return shuffle(pool).slice(0, 7);
}
function go(o) { KIT.closeMenu(); MODE = 'race'; startRace(o); }
function beginGP(cup) { GP = { cup: cup, cls: SV.cls, ch: SV.ch, rivals: rivalsFor(SV.ch), n: 0, pts: {}, grid: null }; GP.pts[GP.ch] = 0; GP.rivals.forEach(function (r) { GP.pts[r] = 0; }); gpRace(); }
function gpRace() { go({ course: GP.cup.courses[GP.n], cls: GP.cls, player: GP.ch, rivals: GP.rivals, mode: 'gp', grid: GP.grid }); }
function beginRace(course) { GP = null; go({ course: course, cls: SV.cls, player: SV.ch, rivals: rivalsFor(SV.ch), mode: 'race' }); }
function beginTT(course) { GP = null; go({ course: course, cls: 'hot', player: SV.ch, rivals: [], mode: 'tt' }); }

/* ---------- the end of a race ---------- */
function finishRace() {
  var R = RACE; R.phase = 'done'; R.doneT = 0; var k = R.me; if (R.demo) return;
  music.play(R.tt || k.place <= 3 ? 'ck_win' : 'ck_results'); sfx.play(k.place <= 3 ? 'win' : 'lose');
  if (!R.demo) { var b = SV.best[R.o.course] || {}, lap = Math.min.apply(null, k.laps); if (!b.lap || lap < b.lap) { b.lap = lap; R.newLap = true; } if (!b.race || k.time < b.race) { b.race = k.time; R.newRace = true; } SV.best[R.o.course] = b; SV.drops = (SV.drops || 0) + (R.got || 0); SV.races = (SV.races || 0) + 1; persist(); }
}
function endRace() {
  var R = RACE; if (R.demo) { demo(); return; }
  // anyone still racing gets a time from how far they had to go
  R.karts.forEach(function (k) { if (!k.done) { var left = (R.laps + 1) * R.T.N - k.prog; k.time = R.t + left * STEP / Math.max(8, k.top * 0.85); k.done = true; } });
  var order = R.karts.slice().sort(function (a, b) { return a.time - b.time; }); order.forEach(function (k, i) { k.place = i + 1; });
  if (R.tt) return ttResults();
  var rows = order.map(function (k, i) { var pts = GP ? POINTS[i] : null; if (GP) GP.pts[k.ch] += pts; return '<tr style="' + (k === R.me ? 'color:#ffe36a' : '') + '"><td>' + ordinal(i + 1) + '</td><td>' + img(k.c.f, 22) + k.c.n + '</td><td style="text-align:right">' + fmtTime(k.time) + '</td>' + (GP ? '<td style="text-align:right">+' + pts + '</td>' : '') + '</tr>'; }).join('');
  var html = '<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.7">' + rows + '</table>' + (R.newLap ? '<br><b>New best lap!</b>' : '');
  if (GP) {
    GP.grid = order.map(function (k) { return R.karts.indexOf(k); }).reverse(); // next race: the leaders start at the front
    GP.lastPlace = R.me.place; GP.n++;
    KIT.menu({ title: R.def.n, sub: 'Race ' + GP.n + ' of 4  ·  you came ' + ordinal(R.me.place), wide: true, html: html, items: [{ label: GP.n < 4 ? 'STANDINGS' : 'FINAL STANDINGS', def: 1, fn: standings }] });
  } else {
    KIT.menu({ title: R.def.n, sub: 'You came ' + ordinal(R.me.place), wide: true, html: html, items: [{ label: 'RACE AGAIN', def: 1, fn: function () { beginRace(R.o.course); } }, { label: 'ANOTHER COURSE', fn: function () { pickCourse(beginRace); } }, { label: 'TITLE', back: 1, fn: function () { RACE = null; titleMenu(); } }] });
  }
}
function standings() {
  var list = Object.keys(GP.pts).sort(function (a, b) { return GP.pts[b] - GP.pts[a] || (a === GP.ch ? -1 : 1); }), place = list.indexOf(GP.ch) + 1;
  var rows = list.map(function (id, i) { return '<tr style="' + (id === GP.ch ? 'color:#ffe36a' : '') + '"><td>' + ordinal(i + 1) + '</td><td>' + img(CH[id].f, 22) + CH[id].n + '</td><td style="text-align:right">' + GP.pts[id] + ' pts</td></tr>'; }).join('');
  var html = '<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.7">' + rows + '</table>';
  if (GP.n < 4) { KIT.menu({ title: 'Standings', sub: GP.cup.n + '  ·  next: ' + COURSES[GP.cup.courses[GP.n]].n, wide: true, html: html, items: [{ label: 'NEXT RACE', def: 1, fn: gpRace }, { label: 'QUIT THE CUP', back: 1, fn: function () { RACE = null; titleMenu(); } }] }); return; }
  var key = GP.cup.id + '_' + GP.cls, prev = SV.cups[key]; if (!prev || place < prev) SV.cups[key] = place; persist();
  var got = checkUnlocks(), tro = place === 1 ? 'ck_gold' : place === 2 ? 'ck_silver' : place === 3 ? 'ck_bronze' : null;
  music.play(place <= 3 ? 'ck_win' : 'ck_results');
  KIT.menu({ title: place <= 3 ? (place === 1 ? 'You win the ' : 'You finish ' + ordinal(place) + ' in the ') + GP.cup.n : 'You finish ' + ordinal(place), sub: CLASSES.filter(function (c) { return c.id === GP.cls; })[0].n + ' class', wide: true,
    html: (tro ? '<div style="text-align:center">' + img(tro, 96, '#0e0708').replace('float:left', 'float:none') + '</div>' : '') + html + (got.length ? '<br><b>Unlocked: ' + got.join(', ') + '</b>' : ''),
    items: [{ label: 'BACK TO THE TITLE', def: 1, fn: function () { RACE = null; GP = null; titleMenu(); } }] });
}
function ttResults() {
  var R = RACE, k = R.me, b = SV.best[R.o.course];
  KIT.menu({ title: R.def.n, sub: 'Time trial', html: '<b>Time</b> ' + fmtTime(k.time) + (R.newRace ? '  NEW BEST!' : '') + '<br>' + k.laps.map(function (l, i) { return 'Lap ' + (i + 1) + ': ' + fmtTime(l); }).join('<br>') + '<br><br>Best race ' + fmtTime(b.race) + '  ·  best lap ' + fmtTime(b.lap),
    items: [{ label: 'TRY AGAIN', def: 1, fn: function () { beginTT(R.o.course); } }, { label: 'ANOTHER COURSE', fn: function () { pickCourse(beginTT); } }, { label: 'TITLE', back: 1, fn: function () { RACE = null; titleMenu(); } }] });
}
function pauseMenu() {
  if (!RACE || RACE.demo || MODE !== 'race' || KIT.menuOpen()) return;
  var R = RACE;
  KIT.menu({ title: 'Paused', sub: R.def.n + (GP ? '  ·  race ' + (GP.n + 1) + ' of 4' : ''), cls: 'clear', items: [
    { label: 'CARRY ON', def: 1, back: 1, fn: KIT.closeMenu },
    { label: 'START AGAIN', fn: function () { if (GP) gpRace(); else if (R.tt) beginTT(R.o.course); else beginRace(R.o.course); } },
    { label: 'AUTO ACCELERATE: ' + (SV.auto ? 'ON' : 'OFF'), fn: function () { SV.auto = !SV.auto; persist(); KIT.closeMenu(); pauseMenu(); } },
    { label: 'HOW TO DRIVE', fn: function () { KIT.menu({ title: 'How to drive', html: 'Steer: d-pad or stick. A gas, B brake. Hold R while turning to drift, let go for a boost. Z uses your item.', items: [{ label: 'BACK', back: 1, fn: pauseMenu }] }); } },
    { label: 'QUIT TO THE TITLE', fn: function () { RACE = null; GP = null; titleMenu(); } }] });
}

/* ---------- the engine note: a low buzz that climbs with your speed ---------- */
var ENG = null;
function engine() {
  var au = KIT.sfx.audio(); if (!au) return;
  if (!ENG) { var o = au.ctx.createOscillator(), o2 = au.ctx.createOscillator(), f = au.ctx.createBiquadFilter(), g = au.ctx.createGain(); o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(au.master); o.start(); o2.start(); ENG = { o: o, o2: o2, g: g, f: f }; }
  var R = RACE, on = R && !R.demo && MODE === 'race' && !KIT.menuOpen() && !KIT.sfx.muted, k = on ? R.me : null, sp = k ? Math.abs(k.spd) / k.top : 0, t = au.ctx.currentTime;
  var fr = 46 + sp * 90 + (k && k.boostT > 0 ? 25 : 0) + (k && k.drift ? 8 : 0);
  ENG.o.frequency.setTargetAtTime(fr, t, 0.06); ENG.o2.frequency.setTargetAtTime(fr * 0.5, t, 0.06); ENG.g.gain.setTargetAtTime(on ? 0.035 + sp * 0.03 : 0, t, 0.08);
}

/* ---------- the loop ---------- */
function update(dt) {
  if (RACE) { stepRace(dt); if (RACE && RACE.me && !RACE.demo && RACE.me.roul <= 0 && RACE.me.item && RACE.itemSeen !== RACE.me.item + RACE.me.itemN) { RACE.itemSeen = RACE.me.item + RACE.me.itemN; } }
  engine();
}
function idle(dt) { if (RACE && RACE.demo) stepRace(dt); engine(); }
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, 480, 270);
  if (!R3.ok) return;
  if (RACE) { drawRace(1 / 60); if (!RACE.demo) drawHud(); }
}
KIT.start({ w: 480, h: 270, update: update, draw: draw, idleUpdate: idle, onPause: pauseMenu, startPauses: true,
  pad: { dpad: true, btns: [{ k: 'a', label: 'A', sub: 'GAS', cls: 'big' }, { k: 'x', label: 'R', sub: 'DRIFT' }, { k: 'y', label: 'Z', sub: 'ITEM', cls: 'gold' }, { k: 'b', label: 'B', sub: 'BRAKE' }] } });
if (!R3.ok) KIT.menu({ title: 'Cumhead Kart', sub: 'This device cannot draw 3D (WebGL is switched off or missing), so the karts cannot run here.', items: [] });
else (function wait() { if (KIT.sheetReady) titleMenu(); else setTimeout(wait, 50); })();
window.__ck = { get R() { return RACE; }, startRace: startRace, SV: SV, CHARS: CHARS, COURSES: COURSES, get GP() { return GP; }, titleMenu: titleMenu, beginGP: beginGP, beginRace: beginRace, beginTT: beginTT, checkUnlocks: checkUnlocks, endRace: endRace, standings: standings,
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, idle: function (n) { for (var i = 0; i < n; i++) idle(1 / 60); }, drawNow: function () { draw(); }, set mode(m) { MODE = m; } };
window.__aiPeek = function (k) { var keep = { laneT: k.laneT, lane: k.lane, aiDrift: k.aiDrift, itemT: k.itemT }; var o = aiInput(k, 0); for (var q in keep) k[q] = keep[q]; return o; };
