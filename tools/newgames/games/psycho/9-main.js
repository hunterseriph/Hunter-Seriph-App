/* =====================================================================================================
   PSYCHO NIGHTMARE: the title, the story cards, getting caught, the stairs, game over, the way out, menus and saves.
   Save: pn-save (the run is kept at the start of every floor you reach).
   ===================================================================================================== */
var SV = KIT.load(SAVE_KEY, null) || { v: 1, runs: 0, wins: 0, best: 0, run: null, aim: 'toggle' };
function persist() { KIT.save(SAVE_KEY, SV); }
(function () { var sc = document.getElementById('scan'); if (sc) sc.hidden = true; })();
var TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
function freshG(seed) { return { seed: seed, fi: 0, P: newPlayer(), trip: 0.25, tripKick: 0, evT: 30, ev: null, ghost: null, msgs: [], sub: null, banner: null, prompt: null, foes: [], tb: null, loot: [], fx: [], shots: [], noises: [], stash: null,
  read: {}, kills: 0, caught: 0, pills: 3, time: 0, notesRead: 0, spotted: 0, mode: 'title', cut: null, wake: 0, trans: 0, touchMode: TOUCH && SV.aim !== 'hold', touchAim: false }; }
function snapshot() { var P = G.P; return { seed: G.seed, fi: G.fi, hp: P.hp, weaps: P.weaps, weap: P.weap, ammo: P.ammo, inv: P.inv, buffs: P.buffs, trip: G.trip, read: G.read, kills: G.kills, caught: G.caught, pills: G.pills, time: G.time, notesRead: G.notesRead, spotted: G.spotted }; }
function saveRun() { SV.run = JSON.parse(JSON.stringify(snapshot())); persist(); }
function newGame() { KIT.closeMenu(); SV.runs++; persist(); G = freshG((Math.random() * 1e9) >>> 0); G.mode = 'intro'; G.introT = 0; music.stop(1); }
function continueGame() {
  var r = SV.run; if (!r) return newGame(); KIT.closeMenu(); G = freshG(r.seed); var P = G.P; P.hp = Math.max(40, r.hp); P.weaps = r.weaps; P.weap = r.weap; P.ammo = r.ammo; P.inv = r.inv; P.buffs = r.buffs || [];
  G.trip = r.trip; G.read = r.read || {}; G.kills = r.kills; G.caught = r.caught; G.pills = r.pills; G.time = r.time; G.notesRead = r.notesRead || 0; G.spotted = r.spotted || 0;
  loadFloor(r.fi, r.fi === 0 ? 'new' : 'up'); music.stop(1);
}
function startFloorOne() { loadFloor(0, 'new'); saveRun(); say('You wake up on a filthy bed. The cell door is rusted shut.', 5); say('Walk to it and keep pressing A to force it.', 6, '#a6968f'); }
/* ---------- the loop ---------- */
function update(dt) {
  if (!G) return;
  G.msgs.forEach(function (m) { m.t -= dt; }); G.msgs = G.msgs.filter(function (m) { return m.t > 0; });
  if (G.sub) { G.sub.t -= dt; if (G.sub.t <= 0) G.sub = null; } if (G.banner) G.banner.t -= dt; if (G.wake > 0) G.wake -= dt;
  if (G.mode === 'intro') { G.introT += dt; if (KIT.pressed('a') || KIT.pressed('start') || KIT.ptr.tap) G.introT = Math.ceil(G.introT / 3.4 + 0.01) * 3.4; if (G.introT > INTRO.length * 3.4) startFloorOne(); return; }
  if (G.mode === 'title') { G.titleT = (G.titleT || 0) + dt; stepTrip(dt); if (G.tb) { G.tb.ph += dt * 1.2; } return; }
  if (G.mode === 'play') {
    G.time += dt; stepPlayer(dt); stepDoors(dt); stepFoes(dt); stepTB(dt); stepLoot(dt); stepTrip(dt); stepFx(dt);
    G.noises = G.noises.filter(function (n) { n.t -= dt; return n.t > 0; });
    var chase = G.tb && G.tb.st === 'chase' || G.foes.some(function (f) { return f.st === 'chase'; }); if (chase && !(G.ev && G.ev.k === 'mute')) music.play('pnchase'); else if (music.current === 'pnchase') music.stop(2.5);
  } else if (G.mode === 'catch') { stepCatch(dt); stepFx(dt); }
  else if (G.mode === 'trans') { G.trans += dt; if (G.trans > 1.4) { if (G.transTo >= FLOORS.length) beginEnding(); else { loadFloor(G.transTo, 'up'); saveRun(); G.wake = 1.5; } } }
  else if (G.mode === 'end') stepEnding(dt);
  ambience(dt);
}
function idle(dt) { if (G && G.mode === 'title') update(dt); ambience(dt); }
function stepDoors(dt) {
  var P = G.P, mv = []; if (!P.hide) mv.push(P); if (G.tb && G.tb.st !== 'away') mv.push(G.tb); G.foes.forEach(function (f) { if (f.st !== 'dead' && f.st !== 'ko') mv.push(f); });
  FL.doors.forEach(function (D) { var cx = tx(D.i), cz = tx(D.j), near = mv.some(function (m) { return Math.hypot(m.x - cx, m.z - cz) < 1.75; });
    if (near) { if (D.open < 0.02) { sfx.play('door'); makeNoise(cx, cz, 2.5, 'door'); } D.open = Math.min(1, D.open + dt * 3.2); D.idle = 0; } else { D.idle += dt; if (D.idle > 4) D.open = Math.max(0, D.open - dt * 1.1); } });
}
function stepFx(dt) { for (var i = G.fx.length - 1; i >= 0; i--) { var e = G.fx[i]; e.t -= dt; if (e.k === 'blood') { e.vy -= 9.8 * dt; e.x += e.vx * dt; e.y = Math.max(0.02, e.y + e.vy * dt); e.z += e.vz * dt; if (e.y <= 0.02) { e.vx *= 0.5; e.vz *= 0.5; } } else if (e.k === 'pillfall') { e.y = Math.max(0.08, e.y - dt * 3.2); } if (e.t <= 0) G.fx.splice(i, 1); } }
/* ---------- caught ---------- */
function stepCatch(dt) {
  var c = G.cut, tb = G.tb, P = G.P; c.t += dt; tb.a = Math.atan2(P.x - tb.x, P.z - tb.z);
  if (c.t > 0.3 && !c.said) { c.said = 1; subtitle('TB', c.q, 3.4); sfx.play('tblaugh'); }
  if (c.t > 3.2 && !c.res) { c.res = takePill(true, c.n); sfx.play('pill'); G.tripKick = 1.5; }
  if (c.t > 7.2) catchDone();
}
/* ---------- game over ---------- */
function gameOver(why) {
  G.mode = 'over'; music.stop(1); sfx.play(why === 'seen' ? 'grab' : 'lose'); var q = tbLine();
  setTimeout(function () { KIT.menu({ cls: 'pn', title: why === 'seen' ? 'TB GOT YOU FOR GOOD' : 'YOU DIED', sub: why === 'seen' ? 'He saw you before you got your stuff back. "' + q + '"' : 'TB will be along to tidy you up.', items: [
    { label: 'TRY THIS FLOOR AGAIN', def: 1, fn: continueGame }, { label: 'QUIT TO THE TITLE', back: 1, fn: titleMenu }] }); }, why === 'seen' ? 1800 : 1200);
  if (why === 'seen') { G.over = { t: 0 }; }
}
/* ---------- the menus ---------- */
function titleMenu() {
  if (!G || G.mode !== 'title') { G = freshG(12345); G.trip = 2.6; loadFloor(0, 'new'); G.mode = 'title'; G.tb.st = 'ghost'; var P = G.P; G.tb.x = P.x + Math.sin(P.a) * 3.5; G.tb.z = P.z + Math.cos(P.a) * 3.5; collide(G.tb, 0.3, 'tb'); G.evT = 999; }
  music.play('pntitle');
  var r = SV.run, items = [r ? { label: 'CONTINUE', sub: FLOORS[r.fi].n + '  ·  ' + FLOORS[r.fi].name, def: 1, fn: continueGame } : null, { label: r ? 'NEW NIGHTMARE' : 'START', def: !r, fn: function () { if (r) KIT.confirm({ title: 'Start again?', sub: 'Your run on ' + FLOORS[r.fi].n + ' will be lost.', yesLabel: 'Start again', yes: newGame, no: titleMenu }); else newGame(); } },
    { label: 'HOW TO PLAY', fn: function () { helpMenu(titleMenu); } }, { label: 'OPTIONS', fn: function () { optionsMenu(titleMenu); } }];
  KIT.menu({ cls: 'clear pn', logo: '../assets/pn-logo.webp', title: 'Psycho Nightmare', items: items, note: SV.wins ? 'Escaped ' + SV.wins + (SV.wins === 1 ? ' time' : ' times') + (SV.best ? '  ·  best ' + clock(SV.best) : '') : '' });
}
function clock(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
function helpMenu(back) {
  KIT.menu({ cls: 'pn plain', title: 'How to play', wide: true, html:
    '<b>Get out of TB\'s basement.</b> Four floors. Each one has a locked gate to the stairs up, and TB keeps its key somewhere on that floor.<br><br>' +
    '<b>Move</b> with the left stick (WASD). <b>Look</b> with the right stick (the arrow keys, or drag on the right of the screen). <b>B</b> (Shift) runs, but running is loud and wears you out. <b>L</b> (Q) sneaks: slower, quiet, harder to see.<br>' +
    '<b>A</b> (Z or Space) uses what is in front of you, or attacks. <b>X</b> (C, or the left trigger) aims a gun' + (TOUCH ? ' (on a phone it toggles)' : '') + '; aimed shots hit harder. The right trigger fires too. <b>Y</b> (V) swaps weapon. <b>R</b> (E) eats a Cum Cracker or a Cumpuccino.<br><br>' +
    '<b>TB</b> cannot be killed. Shoot him and he only laughs. If he sees you the eye at the edge of the screen fills up: once it is full, run. Lose him round corners, behind doors or in a <b>locker</b>. Now and then he takes his own pills and checks out for a while.<br>' +
    '<b>If TB catches you</b> he feeds you more Silly Pills and locks you back in the cell. Everything you had stays where he grabbed you. Get it back <b>without him seeing you</b>, or it is over.<br><br>' +
    '<b>His boys</b> (Gimps, Butchers, Pill Pushers) can be killed. Hide or fight. The <b>2x4</b> has a rusty nail: they bleed. The <b>bat</b> knocks them out cold. Guns need ammo, and TB hears every shot.<br>' +
    '<b>Silly Pills</b> always make the trip worse. Sometimes they also make you stronger. A Cumpuccino clears your head a little.',
    items: [{ label: 'BACK', back: 1, fn: back }] });
}
function optionsMenu(back) {
  KIT.menu({ cls: 'pn plain', title: 'Options', items: [
    R3.ok ? R3.resItem(function () { optionsMenu(back); }) : null, KIT.resItem(function () { optionsMenu(back); }),
    TOUCH ? { label: 'AIM ON SCREEN: ' + (SV.aim === 'hold' ? 'HOLD' : 'TAP TO TOGGLE'), fn: function () { SV.aim = SV.aim === 'hold' ? 'toggle' : 'hold'; persist(); if (G) G.touchMode = SV.aim !== 'hold'; optionsMenu(back); } } : null,
    { label: 'BACK', back: 1, fn: back }] });
}
function pauseMenu() {
  if (!G || G.mode !== 'play' || KIT.menuOpen()) return;
  KIT.menu({ cls: 'pn plain', title: 'Paused', sub: FLOORS[G.fi].n + '  ·  ' + FLOORS[G.fi].name + '  ·  ' + clock(G.time), items: [
    { label: 'CARRY ON', def: 1, back: 1, fn: KIT.closeMenu }, { label: 'MAP', fn: mapMenu }, { label: 'YOUR THINGS', fn: bagMenu },
    G.notesRead ? { label: 'NOTES', fn: notesMenu } : null, { label: 'HOW TO PLAY', fn: function () { helpMenu(pauseMenu); } }, { label: 'OPTIONS', fn: function () { optionsMenu(pauseMenu); } },
    { label: 'QUIT TO THE TITLE', fn: function () { KIT.confirm({ title: 'Quit?', sub: 'You will carry on from the start of ' + FLOORS[G.fi].n + '.', yesLabel: 'Quit', yes: function () { G = null; titleMenu(); }, no: pauseMenu }); } }] });
}
function bagMenu() {
  var P = G.P, items = [];
  ['cracker', 'cuppa', 'pill'].forEach(function (k) { if (P.inv[k]) items.push({ label: ITEMS[k].n.toUpperCase() + '  x' + P.inv[k], sub: ITEMS[k].d, fn: function () { useItem(k); if (k === 'pill' || !P.inv[k]) KIT.closeMenu(); else bagMenu(); } }); });
  WORDER.forEach(function (w) { if (!P.weaps[w]) return; var W = WEAP[w]; items.push({ label: (P.weap === w ? '> ' : '') + W.n.toUpperCase() + (W.gun ? '  ·  ' + P.ammo[W.ammo] + ' ' + AMMO[W.ammo].n : ''), fn: function () { P.weap = w; bagMenu(); } }); });
  items.push({ label: 'BACK', back: 1, fn: pauseMenu });
  KIT.menu({ cls: 'pn plain', title: 'Your things', sub: (P.keys[G.fi] ? FLOORS[G.fi].key + '  ·  ' : '') + (P.buffs.length ? P.buffs.map(function (b) { return BUFFS[b].n; }).join(', ') : 'No pill powers yet'), items: items });
}
function notesMenu() { var items = []; Object.keys(G.read).forEach(function (k) { var n = +k.split(':')[1]; items.push({ label: NOTES[n].split('\n')[0].slice(0, 34) + '...', fn: function () { openNote(n, notesMenu); } }); }); items.push({ label: 'BACK', back: 1, fn: pauseMenu }); KIT.menu({ cls: 'pn plain', title: 'Notes', items: items }); }
function openNote(n, back) { sfx.play('pickup'); KIT.menu({ cls: 'pn plain note', title: "TB's note", html: '<div class="pnnote">' + NOTES[n].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</div>', items: [{ label: 'PUT IT DOWN', back: 1, fn: back || KIT.closeMenu }] }); }
function mapMenu() {
  var c = document.createElement('canvas'), s = 7; c.width = MW * s; c.height = MH * s; var g = c.getContext('2d'); g.fillStyle = '#070405'; g.fillRect(0, 0, c.width, c.height);
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) { if (!FL.seen[idx(i, j)]) continue; var k = FL.K[idx(i, j)]; g.fillStyle = k === KW ? '#2a1214' : k === KL ? '#4a5a48' : k === KS ? '#c4121c' : k === KD ? '#6a4428' : k === KP ? '#3a2a24' : FL.RM[idx(i, j)] >= 0 ? '#5a3a34' : '#4a3430'; g.fillRect(i * s, j * s, s, s); }
  function dot(x, z, col, r) { g.fillStyle = col; g.beginPath(); g.arc(x / TSZ * s, z / TSZ * s, r, 0, 6.28); g.fill(); }
  G.loot.forEach(function (l) { if (FL.seen[idx(tileOf(l.x), tileOf(l.z))] && (l.k === 'key' || l.k === 'bag')) dot(l.x, l.z, '#ffe36a', 4); });
  var P = G.P; g.save(); g.translate(P.x / TSZ * s, P.z / TSZ * s); g.rotate(-P.a); g.fillStyle = '#f1e7d0'; g.beginPath(); g.moveTo(0, 6); g.lineTo(4, -4); g.lineTo(-4, -4); g.fill(); g.restore();
  KIT.menu({ cls: 'pn plain', title: 'Map', sub: FLOORS[G.fi].n + '  ·  ' + FLOORS[G.fi].name, wide: true, html: '<img class="pnmap" src="' + c.toDataURL() + '" alt="map"><p class="pnkey">You (white arrow)  ·  <span style="color:#c4121c">stairs up</span>  ·  <span style="color:#ffe36a">key / your stuff</span>  ·  <span style="color:#7a9a78">lockers</span></p>', items: [{ label: 'BACK', back: 1, fn: pauseMenu }] });
}
/* ---------- the way out: the bar upstairs, TB at the front door ---------- */
function beginEnding() {
  var F = { fi: 3, K: new Uint8Array(MW * MH), RM: new Int16Array(MW * MH).fill(-1), rooms: [], props: [], lockers: [], pipes: [], decals: [], lights: [], loot: [], notes: [], foes: [] };
  for (var j = 3; j <= 18; j++) for (var i = 18; i <= 22; i++) { F.K[idx(i, j)] = KR; F.RM[idx(i, j)] = 0; }
  for (var l = 5; l <= 17; l += 3) F.lights.push({ i: 20, j: l, k: 1.3, r: 8, fl: l === 11 ? 1 : 0 });
  [['g_bro', 6], ['poster', 9], ['g_tb', 15], ['poster2', 12], ['g_suck', 17]].forEach(function (d, n) { F.decals.push({ i: n % 2 ? 18 : 22, j: d[1], d: n % 2 ? 1 : 0, k: d[0], y: 1.5, s: 1, o: 0 }); });
  [[18, 7, 'keg'], [22, 10, 'table'], [18, 13, 'chair'], [22, 16, 'keg']].forEach(function (p) { F.props.push({ i: p[0], j: p[1], k: p[2], a: p[0] < 20 ? Math.PI / 2 : -Math.PI / 2 }); F.K[idx(p[0], p[1])] = KP; });
  FL = F; F.seen = new Uint8Array(MW * MH); F.propAt = {}; F.props.forEach(function (p) { F.propAt[idx(p.i, p.j)] = p; }); F.lockerAt = {}; F.doorAt = {}; F.doors = []; F.cellLocked = 0; F.cellDoor = null; F.exit = { i: 20, j: 2, di: 0, dj: 1 };
  if (MESH) MESH.free(); MESH = buildFloorMesh(F); F.lights.push({ i: 20, j: 2.6, k: 2.2, r: 9, fl: 0, exit: 1, c: [1, 0.95, 0.85] });
  G.fi = 3; G.foes = []; G.loot = []; G.fx = []; G.shots = []; G.stash = null; G.ev = null; G.ghost = null;
  var P = G.P; P.x = tx(20); P.z = tx(17.5); P.a = P.ca = Math.PI; P.cp = -0.05; P.hide = null; P.aim = 0; P.atkT = -1; P.crouch = 0;
  G.tb = { x: tx(21) - 0.2, z: tx(3) - 0.4, a: 0, st: 'door', ph: 0, spd: 0, sus: 0 }; F.lights.push({ i: 21, j: 3.2, k: 1.6, r: 5, fl: 0, exit: 1, c: [1, 0.3, 0.25] }); G.mode = 'end'; G.endT = 0; G.wake = 1.5; G.banner = { s: "TB'S SUCK N' FUCK", t: 4 };
  SV.wins++; if (!SV.best || G.time < SV.best) SV.best = G.time; SV.run = null; persist(); music.play('pnend');
}
function stepEnding(dt) {
  var P = G.P, tb = G.tb; G.endT += dt; tb.a = Math.atan2(P.x - tb.x, P.z - tb.z);
  if (P.z > tx(2) + 0.6) { var sp = 4.3; P.z -= sp * dt; P.spd = sp; P.run = 1; P.ph += sp * dt * 3.06; P.x += (tx(20) - 0.3 - P.x) * dt * 2; P.a = Math.PI; P.ca += angDiff(Math.PI, P.ca) * dt * 3; }
  if (!G.endSaid && P.z < tx(9)) { G.endSaid = 1; subtitle('TB', TBEND, 5); sfx.play('tblaugh'); }
  if (P.z <= tx(2) + 0.6 && !G.outT) { G.outT = G.endT; KIT.flash(0.6); sfx.play('door'); }
  if (G.outT && G.endT - G.outT > 1.2 && !G.endMenu) { G.endMenu = 1; endMenu(); }
}
function endMenu() {
  KIT.menu({ cls: 'pn ending', title: 'YOU GOT OUT', sub: 'Cumhead ran out of TB\'s Suck n\' Fuck into the night and did not stop running.', html: '<p class="pnstats">Time  ' + clock(G.time) + '<br>TB\'s boys put down  ' + G.kills + '<br>Times TB caught you  ' + G.caught + '<br>Silly Pills taken  ' + G.pills + '<br>Notes read  ' + G.notesRead + '</p><p class="pnbro">"' + TBEND + '"</p>',
    items: [{ label: 'BACK TO THE TITLE', def: 1, fn: function () { G = null; titleMenu(); } }] });
}
/* ---------- drawing ---------- */
var LOGOIMG = null;
function draw() {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H; ctx.clearRect(0, 0, W, H); if (!R3.ok || !G) return;
  if (G.mode === 'intro') { R3.begin([0, 0, 0]); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); var n = Math.floor(G.introT / 3.4), u = G.introT - n * 3.4; if (n < INTRO.length) { var a = Math.min(1, u * 1.5, (3.4 - u) * 2), last = n === INTRO.length - 1;
    KIT.wrap(INTRO[n], W - 80, last ? 40 : 18, last ? 'title' : 'body').forEach(function (s, k, A) { KIT.text(s, W / 2, H / 2 - A.length * 11 + k * (last ? 40 : 22), { align: 'center', font: last ? 'title' : 'body', size: last ? 40 : 18, col: last ? '#c4121c' : '#f1e7d0', alpha: a }); }); }
    KIT.text('A  SKIP', W - 10, H - 14, { align: 'right', size: 6, col: '#4a3a3a' }); return; }
  if (!FL) return;
  if (G.mode === 'title') { drawTitleScene(); return; }
  if (G.mode === 'catch') { drawCatch(); return; }
  drawWorld(); drawHud();
  if (G.mode === 'trans') { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, G.trans / 1) + ')'; ctx.fillRect(0, 0, W, H); if (G.trans > 0.6) KIT.text('CLIMBING...', W / 2, H / 2, { align: 'center', font: 'title', size: 26, col: '#a6968f', alpha: Math.min(1, (G.trans - 0.6) * 2) }); }
  if (G.mode === 'over') { G.overT = (G.overT || 0) + 1 / 60; ctx.fillStyle = 'rgba(80,0,6,' + Math.min(0.85, G.overT) + ')'; ctx.fillRect(0, 0, W, H); }
  if (G.mode === 'end' && G.outT) { ctx.fillStyle = 'rgba(255,250,240,' + Math.min(1, (G.endT - G.outT) * 1.2) + ')'; ctx.fillRect(0, 0, W, H); }
}
function drawTitleScene() {
  var P = G.P, t = G.titleT || 0; P.hide = null; var a = P.a + Math.sin(t * 0.15) * 0.5; P.ca = a; P.cp = -0.05 + Math.sin(t * 0.2) * 0.05; P.aim = 0; P.crouch = 0;
  var keep = G.mode; G.tb.st = 'ghost'; G.tb.a = Math.atan2(P.x - G.tb.x, P.z - G.tb.z);
  drawWorld();
  KIT.blit(vignette(), 0, 0);
}
function drawCatch() {
  var P = G.P, tb = G.tb, c = G.cut, ctx = KIT.ctx, W = KIT.W, H = KIT.H, k = Math.min(1, c.t * 2);
  // the camera is your eyes: his face fills them
  var T = tripLook(), dd = Math.hypot(tb.x - P.x, tb.z - P.z) || 1, ex = P.x - (tb.x - P.x) / dd * 0.45, ez = P.z - (tb.z - P.z) / dd * 0.45, hy = RIGS.tb.eyeY;
  R3.begin([0.05, 0, 0]); var shake = Math.sin(c.t * 40) * 0.01 * (c.t < 1 ? 1 : 0.3);
  R3.setCam([ex, 1.45 + shake, ez], [tb.x, hy - 0.1 + (c.t > 3.2 ? Math.sin(c.t * 2) * 0.08 : 0), tb.z], 0.8 - k * 0.12, upVec(T.roll + Math.sin(c.t * 1.3) * 0.1 * k, [tb.x - ex, 0, tb.z - ez]));
  R3.scene({ fog: [0.05, 0, 0], fogR: [3, 14], amb: [0.12, 0.05, 0.05], lights: [{ x: (tb.x + P.x) / 2, y: 2.2, z: (tb.z + P.z) / 2, r: 6, c: [1, 0.25, 0.2], k: 1.4 }], torch: { p: [ex, 1.3, ez], d: [0, -1, 0], c: [0, 0, 0] }, t: KIT.t, warp: T.warp + 0.2, hue: T.hue + (c.t > 3.2 ? 0.6 : 0), meat: c.t > 3.2 ? 0.35 : 0, neg: 0 });
  R3.draw(MESH, ATT, {}); var Q = pose0(); poseGrab(Q, 1); Q.hr = 0.3 + Math.sin(c.t * 3) * 0.15; if (c.t > 2.4 && c.t < 3.4) { Q.sh[0] = [2.0, 0.1, 0.6]; Q.el[0] = 1.2; }
  drawRig(RIGS.tbmad, tb.x, 0, tb.z, tb.a, Q, { heldL: RIGS.tbmad.P.bottle, noShadow: 0 });
  ctx.fillStyle = 'rgba(120,0,8,' + (0.25 + Math.sin(c.t * 8) * 0.08) + ')'; ctx.fillRect(0, 0, W, H); KIT.blit(vignette(), 0, 0);
  if (G.sub) KIT.text('"' + G.sub.s + '"', W / 2, H - 60, { align: 'center', font: 'body', size: 18, col: '#ff2630', outline: 1, max: W - 30 });
  if (c.t > 1.6) KIT.text('TB FORCES ' + c.n + ' SILLY PILL' + (c.n > 1 ? 'S' : '') + ' DOWN YOUR THROAT', W / 2, 24, { align: 'center', size: 8, col: '#ff4a8a', alpha: Math.min(1, (c.t - 1.6) * 2) });
  if (c.res) c.res.forEach(function (s, n) { KIT.text(s, W / 2, 46 + n * 14, { align: 'center', size: 8, col: s === 'IT GETS WORSE' ? '#c4121c' : '#ffe36a', alpha: Math.min(1, (c.t - 3.2 - n * 0.4) * 2) }); });
  if (c.t > 6.2) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, (c.t - 6.2)) + ')'; ctx.fillRect(0, 0, W, H); }
}
/* ---------- start ---------- */
var PNPAD = { sticks: true, btns: [{ k: 'a', label: 'A', sub: 'USE / HIT', cls: 'big' }, { k: 'x', label: 'X', sub: 'AIM' }, { k: 'b', label: 'B', sub: 'RUN' }, { k: 'y', label: 'Y', sub: 'SWAP' }, { k: 'lb', label: 'L', sub: 'SNEAK' }, { k: 'rb', label: 'R', sub: 'EAT' }] };
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'sup', ArrowDown: 'sdown', ShiftLeft: 'b', ShiftRight: 'b' });
(function () { var st = document.createElement('style'); st.textContent = '#menu.pn .mbox{background:rgba(7,4,5,.9)}#menu .pnnote{font-family:"Pirata One",serif;font-size:22px;line-height:1.3;color:#3a1a14;background:#e8dcc0;padding:18px 22px;transform:rotate(-1deg);box-shadow:0 0 0 3px #12040a,6px 6px 0 #000;text-align:left;white-space:normal}' +
  '#menu .pnmap{width:100%;max-width:420px;image-rendering:pixelated;display:block;margin:0 auto;border:3px solid #4a1a1c}#menu .pnkey{font-size:13px;color:#a6968f;text-align:center}#menu .pnstats{font-size:18px;line-height:1.6;color:#f1e7d0;text-align:center}#menu .pnbro{font-family:"Pirata One",serif;font-size:30px;color:#ff2630;text-align:center}'; document.head.appendChild(st); })();
KIT.start({ w: 480, h: 270, flex: 720, update: update, draw: draw, idleUpdate: idle, onPause: pauseMenu, startPauses: true, pad: PNPAD, padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' } });
if (!R3.ok) KIT.menu({ title: 'Psycho Nightmare', sub: 'This device cannot draw 3D (WebGL is switched off or missing), so the basement cannot open here.', items: [] });
else { var FONTOK = false, fontT = Date.now(); try { document.fonts.load('22px "Pirata One"').then(function () { FONTOK = true; }, function () { FONTOK = true; }); } catch (e) { FONTOK = true; }
  (function wait() { if (FONTOK || Date.now() - fontT > 2500) { buildAtlas(); buildRigs(); titleMenu(); } else setTimeout(wait, 50); })(); }
window.__pn = { get G() { return G; }, get FL() { return FL; }, SV: SV, newGame: newGame, continueGame: continueGame, loadFloor: loadFloor, titleMenu: titleMenu, beginEnding: beginEnding, catchPlayer: catchPlayer, takePill: takePill, startFloorOne: startFloorOne,
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, drawNow: function () { draw(); } };
