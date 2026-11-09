/* =====================================================================================================
   CUTSCENES (his ask: way more of them). In-engine shots with letterbox bars: the camera moves on its own, people are
   posed, TB and the henchmen speak (with their voices). A or a tap skips. Every one:
   - waking in the cell: TB at the bars, laughing, then gone down the hall
   - each new basement floor: TB over the speakers, and a look down the first hall
   - every place outside: a look at where you are, then TB somewhere ahead (in the clown suit in Ejaculand, on fire
     after the crash), and he is gone
   - every henchman: the camera finds them, close on their face, their line; and again when they die
   - TB in front of the Clubhouse before the fight
   Online, the host starts them and the guest plays the same shots.
   ===================================================================================================== */
var SCN = null;
function lerp3(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function ease(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
function cAt(o, y) { return [o.x, y, o.z]; }
function cTo(from, to, d, y) { var dx = to.x - from.x, dz = to.z - from.z, l = Math.hypot(dx, dz) || 1; d = Math.min(d, l - 0.3); return [from.x + dx / l * d, y, from.z + dz / l * d]; } // a point on the line from one to the other
function cBehind(P, back, y, side) { return [P.x - Math.sin(P.ca) * back + Math.cos(P.ca) * (side || 0), y, P.z - Math.cos(P.ca) * back - Math.sin(P.ca) * (side || 0)]; }
function cAhead(P, d, y) { return [P.x + Math.sin(P.ca) * d, y, P.z + Math.cos(P.ca) * d]; }
function camFree(p) { var i = tileOf(p[0]), j = tileOf(p[2]); return inMap(i, j) && !blocksEyes(i, j); }
function safeEye(from, want) { for (var k = 1; k >= 0; k -= 0.1) { var p = lerp3(from, want, k); if (camFree(p) && canSee(from[0], from[2], p[0], p[2])) return p; } return from; }
/* a spot ahead of the player you can see from where they stand: where TB shows himself */
function standAhead(P, dMin, dMax) {
  for (var d = dMax; d >= dMin; d -= 0.6) for (var s = 0; s < 7; s++) { var a = P.ca + [0, 0.25, -0.25, 0.5, -0.5, 0.8, -0.8][s], x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d;
    if (walkable(tileOf(x), tileOf(z), 'tb') && canSee(P.x, P.z, x, z)) return { x: x, z: z }; }
  return null;
}
/* if the way he faces is a wall close by, turn him to the longest open view first */
function faceOpen(P) { if (rayWall(P.x, P.z, P.ca, 20) >= 9) return; var best = P.ca, bd = 0; for (var s = 0; s < 16; s++) { var a = s / 16 * 6.283, d = rayWall(P.x, P.z, a, 24); if (d > bd + 0.5) { bd = d; best = a; } } P.ca = P.a = best; }
function scene(id, shots, o) {
  if (!shots || !shots.length || !G) return; o = o || {};
  var tb = G.tb, keep = tb ? { x: tb.x, z: tb.z, a: tb.a, st: tb.st, pose: tb.pose, spd: tb.spd } : null;
  SCN = { id: id, shots: shots, i: 0, t: 0, T: 0, after: o.after, back: o.back || 'play', restore: function () { if (tb && keep && !o.keepTB) { tb.x = keep.x; tb.z = keep.z; tb.a = keep.a; tb.st = keep.st; tb.pose = keep.pose; tb.spd = keep.spd; } } };
  G.mode = 'scene'; G.prompt = null; document.documentElement.classList.add('hs-menu'); if (shots[0].enter) shots[0].enter(); stepScene(0);
}
function stepScene(dt) {
  var S = SCN; if (!S) { G.mode = 'play'; return; } var sh = S.shots[S.i]; S.t += dt; S.T += dt; var k = Math.min(1, S.t / sh.len);
  if (sh.on) sh.on(k, dt);
  if (sh.say && !sh.said && S.t >= (sh.say[2] || 0.25)) { sh.said = 1; subtitle(sh.say[0], sh.say[1], sh.say[3] || Math.max(2.4, sh.len - S.t + 0.6)); if (sh.say[0] === 'TB') sfx.play('tblaugh'); }
  if (sh.cap && !sh.capd) { sh.capd = 1; G.capT = { s: sh.cap, t: sh.len + 0.3 }; }
  if (sh.snd && !sh.sndd) { sh.sndd = 1; sfx.play(sh.snd); }
  if (sh.ban && !sh.band) { sh.band = 1; G.banner = { s: sh.ban, t: 3.6 }; }
  var e = sh.eye(ease(k)), a = sh.at(ease(k)); S.cam = { eye: e, at: a, fov: sh.fov || 1.0, roll: sh.roll ? sh.roll(k) : 0, T: tripLook() };
  if (G.capT) { G.capT.t -= dt; if (G.capT.t <= 0) G.capT = null; }
  if (S.t >= sh.len) { S.i++; S.t = 0; if (S.i >= S.shots.length) { endScene(); return; } var n = S.shots[S.i]; if (n.enter) n.enter(); }
  if (S.T > 0.6 && (KIT.pressed('a') || KIT.pressed('start') || KIT.ptr.tap)) endScene();
}
function endScene() { var S = SCN; SCN = null; G.capT = null; G.sub = null; if (G.mode === 'scene') G.mode = S ? S.back : 'play'; document.documentElement.classList.remove('hs-menu'); if (S && S.restore) S.restore(); if (S && S.after) S.after(); try { if (window.speechSynthesis && voiceMode() === 'spoken') { /* let the last line finish */ } } catch (e) {} }
function drawSceneHud() {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H, bar = Math.round(H * 0.11); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  if (G.banner && G.banner.t > 0) { var ba = Math.min(1, G.banner.t, (3.6 - G.banner.t) * 2); KIT.text(G.banner.s, W / 2, H * 0.34, { align: 'center', font: 'title', size: 30, col: '#c4121c', alpha: ba, outline: 1 }); }
  if (G.capT) KIT.wrap(G.capT.s, W - 60, 14, 'body').forEach(function (s, n) { KIT.text(s, W / 2, bar + 10 + n * 15, { align: 'center', font: 'body', size: 13, col: '#a6968f' }); });
  if (G.sub) { var lines = KIT.wrap(G.sub.who + ':  ' + G.sub.s, W - 80, 15, 'body'); lines.forEach(function (s, n) { KIT.text(s, W / 2, H - bar - 12 - (lines.length - 1 - n) * 17, { align: 'center', font: 'body', size: 15, col: G.sub.who === 'TB' ? '#ff4a4a' : '#ffb0c0', outline: 1 }); }); }
  KIT.text('A  SKIP', W - 12, H - bar + 8, { align: 'right', size: 6, col: '#4a1a1c' });
}
/* ---------- the scenes ---------- */
function sceneCell() { // waking in the cell: TB is at the bars
  var cd = FL.cellDoor, P = G.P, tb = G.tb; if (!cd || !tb) return; var ox = tx(cd.i) + cd.di * TSZ * 0.7, oz = tx(cd.j) + cd.dj * TSZ * 0.7, ins = { x: tx(cd.i) - cd.di * TSZ * 0.9, z: tx(cd.j) - cd.dj * TSZ * 0.9 };
  var out = { x: ox, z: oz };
  scene('cell', [
    { len: 2.6, cap: 'Somebody is outside the cell.', enter: function () { tb.st = 'cut'; tb.pose = 'lean'; tb.x = ox; tb.z = oz; tb.a = Math.atan2(-cd.di, -cd.dj); }, eye: function (k) { return [tx(cd.i) - cd.di * TSZ * 1.75, 1.1 + k * 0.7, tx(cd.j) - cd.dj * TSZ * 1.75]; }, at: function () { return [ox, 1.6, oz]; }, fov: 1.1 },
    { len: 2.8, say: ['TB', tbLine(), 0.3], enter: function () { tb.pose = 'laugh'; }, eye: function (k) { return lerp3([ins.x, 1.7, ins.z], [tx(cd.i) - cd.di * 0.5, 1.75, tx(cd.j) - cd.dj * 0.5], k); }, at: function () { return [ox, 1.72, oz]; }, fov: 0.85 },
    { len: 2.4, cap: 'He rattles the bottle at you and walks off into the dark.', snd: 'rattle', enter: function () { tb.pose = 'pills'; tb.a = Math.atan2(cd.di, cd.dj) + 0.6; }, on: function (k, dt) { tb.x += Math.sin(tb.a) * dt * 1.6; tb.z += Math.cos(tb.a) * dt * 1.6; tb.spd = 1.6; tb.ph += dt * 4; }, eye: function () { return [ins.x, 1.5, ins.z]; }, at: function () { return [tb.x, 1.3, tb.z]; } }
  ]);
}
var FLOORCAP = ['', 'The Meat Locker. Cold, and it smells like a butcher\'s bin.', 'The Pill Lab. Pink dust on everything. Something bubbles.', 'The Cellar Bar. Music somewhere above you. The way out is up there.'];
function sceneSpeakers(fi) { // a new basement floor: TB over the speakers
  var P = G.P, line = tbLine(); faceOpen(P);
  scene('floor', [
    { len: 3.0, cap: FLOORCAP[fi], eye: function (k) { return safeEye([P.x, 1.7, P.z], cBehind(P, -0.5 - k * 1.5, 1.9 + k * 0.6)); }, at: function (k) { return cAhead(P, 8, 1.2); }, fov: 1.15 },
    { len: 3.2, snd: 'clang', say: ['TB', line, 0.5], eye: function (k) { return safeEye([P.x, 1.7, P.z], cAhead(P, 1 + k * 0.4, 2.6)); }, at: function () { return cAhead(P, 6, 2.9); }, roll: function (k) { return Math.sin(k * 9) * 0.02; } }
  ]);
}
var PLACECAP = { woods: 'The car is dead at the tree line. The woods go on for ever.', park: 'The back gate of Ejaculand. Nobody has ridden anything here in years.', redlight: 'The coaster car comes off its rails into Cum City: the red light district. Every sign is still on. Nobody is about.',
  cemetery: 'Past the neon, the cemetery. Somebody has been digging.', site: 'The Cumstruction site. Half-built towers in the dark, and the smell of wet cement.', cafe: 'The cafe streets. Every shutter down, every chair still out.', district: 'Clubhouse Row. The Clubhouse is at the end of it.' };
function sceneArrive(fi) { // a new place outside: where you are, then TB somewhere ahead
  var th = FLOORS[fi], P = G.P, tb = G.tb, cap = PLACECAP[th.id]; if (!cap) return; faceOpen(P);
  var spot = th.id !== 'redlight' && standAhead(P, 7, 13), line = th.kind === 'woods' ? TBWOODS : tbLine();
  var shots = [{ len: 3.2, cap: cap, ban: (th.n ? th.n + '  ·  ' : '') + th.name, eye: function (k) { return safeEye([P.x, 1.7, P.z], cBehind(P, 1.5 + k, 2.6 + k * 2.2)); }, at: function () { return cAhead(P, 16, 1.5); }, fov: 1.1 }];
  if (spot) shots.push({ len: 3.4, say: ['TB', line, 0.6], snd: th.kind === 'park' ? 'honk' : 'sting',
    enter: function () { tb.st = 'cut'; tb.pose = th.kind === 'park' ? 'wave' : 'point'; tb.x = spot.x; tb.z = spot.z; tb.a = Math.atan2(P.x - spot.x, P.z - spot.z); tb.spd = 0; },
    eye: function (k) { return safeEye([P.x, 1.8, P.z], cTo(P, spot, 1.5 + k * 3.5, 1.75)); }, at: function () { return [spot.x, 1.7, spot.z]; }, fov: 0.85 });
  if (spot) shots.push({ len: 1.4, cap: th.kind === 'park' ? 'He honks a horn and is gone behind the stalls.' : 'Then he is not there any more.', enter: function () { tb.x = -50; tb.z = -50; }, eye: function () { return safeEye([P.x, 1.8, P.z], cTo(P, spot, 4, 1.75)); }, at: function () { return [spot.x, 1.4, spot.z]; } });
  scene('arrive', shots);
}
function sceneBoss() { // TB in front of the Clubhouse
  var P = G.P, tb = G.tb, c = FL.exitIn || FL.tb;
  scene('boss', [
    { len: 2.8, cap: 'The Clubhouse. The lights are on.', eye: function (k) { return [P.x, 2.4 + k, P.z + 2 - k * 2]; }, at: function () { return [tx(c.i), 3, tx(c.j)]; }, fov: 1.1 },
    { len: 3.4, ban: "HE'S HERE", say: ['TB', tbLine(), 0.4], enter: function () { tb.pose = 'laugh'; }, eye: function (k) { return cTo(tb, P, 2.6 - k * 0.8, 1.8); }, at: function () { return [tb.x, 1.75, tb.z]; }, fov: 0.9 }
  ], { keepTB: 1, after: function () { G.bossIntro = 0.6; tb.pose = null; } });
}
function sceneHench(f) { // a henchman wakes
  var P = G.P, d = f.d, H = HENCH[f.k], sc = d.sc || 1, hy = d.h * 0.86;
  f.a = Math.atan2(P.x - f.x, P.z - f.z);
  scene('hench', [
    { len: 1.6, snd: 'sting', eye: function (k) { return safeEye([P.x, 1.7, P.z], cBehind(P, 1.6 - k * 0.6, 1.9)); }, at: function () { return [f.x, hy * 0.8, f.z]; }, fov: 1.0 },
    { len: 3.4, ban: d.n.toUpperCase(), say: [d.n, H.wake, 0.5], on: function (k) { f.wind = 0.5 + Math.sin(k * 12) * 0.3; }, eye: function (k) { return cTo(f, P, (2.2 + (1 - k) * 1.4) * sc, hy); }, at: function () { return [f.x, hy * 0.97, f.z]; }, fov: 0.85 },
    { len: 1.0, on: function () { f.wind = 0; }, eye: function (k) { return safeEye([P.x, 1.7, P.z], cBehind(P, 0.6 + k * 1.4, 1.9)); }, at: function () { return [f.x, hy * 0.7, f.z]; } }
  ], { after: function () { f.wind = 0; } });
  netEv({ k: 'scene', id: 'hench', f: f.id });
}
function sceneHenchDie(f) {
  var d = f.d, H = HENCH[f.k], P = G.P, a0 = Math.atan2(P.x - f.x, P.z - f.z);
  scene('henchdie', [{ len: 3.0, say: [d.n, H.die, 0.2], eye: function (k) { var a = a0 + k * 1.1, r = 3.2 * (d.sc || 1); return safeEye([f.x, 1.6, f.z], [f.x + Math.sin(a) * r, 1.6 + k * 0.8, f.z + Math.cos(a) * r]); }, at: function () { return [f.x, 0.5, f.z]; }, fov: 1.0 }]);
  netEv({ k: 'scene', id: 'henchdie', f: f.id });
}
/* which one plays when a floor starts */
function floorScene(fi, how) {
  if (isGuest() || G.botIn || G.noScenes) return; var th = FLOORS[fi];
  if (th.kind === 'boss') { sceneBoss(); netEv({ k: 'scene', id: 'boss' }); return; }
  if (!th.kind && how === 'new' && fi === 0) return; // the cell scene plays from startFloorOne
  if (!th.kind && how === 'up' && fi > 0) { sceneSpeakers(fi); netEv({ k: 'scene', id: 'floor', fi: fi }); return; }
  if (th.kind && how === 'up' && PLACECAP[th.id]) { sceneArrive(fi); netEv({ k: 'scene', id: 'arrive', fi: fi }); }
}
function guestScene(e) { // the host started one: play it here too
  if (e.id === 'floor') sceneSpeakers(e.fi); else if (e.id === 'arrive') sceneArrive(e.fi); else if (e.id === 'boss') sceneBoss();
  else if (e.id === 'cell') sceneCell();
  else { var f = G.foes.filter(function (q) { return q.id === e.f; })[0]; if (f && e.id === 'hench') sceneHench(f); else if (f && e.id === 'henchdie') sceneHenchDie(f); }
}
