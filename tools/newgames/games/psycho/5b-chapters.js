/* =====================================================================================================
   AFTER THE BASEMENT (his story): out of TB's Suck n' Fuck into a car, running down TB's boys, the car dies at the
   woods, TB is in the woods too ("make me your pretty vocaloid pig"), out the other side into Clubhouse Row's red
   light district with his boys looking for you; half way TB crashes a car into T's Hussy House, climbs out of the
   burning wreck and he is ANGRY; get to the Clubhouse, where he finds you and it's a fight. Beating him ends the game.
   ===================================================================================================== */
/* ---------- THE GETAWAY ---------- */
var DR = null, DRMESH = null;
function roadX(z) { return 7 * Math.sin(z / 95) + 3 * Math.sin(z / 41 + 1); }
function roadDir(z) { return Math.atan2(roadX(z + 1) - roadX(z - 1), 2); }
var DRLEN = 860, ROADW = 5.2;
function startDrive(fi, how) {
  G.fi = fi; FL = lvlBase(fi); FL.drive = 1; FL.seen = new Uint8Array(MW * MH); FL.propAt = {}; FL.lockerAt = {}; FL.doorAt = {}; FL.doors = []; FL.cellLocked = 0; FL.start = { i: 0, j: 0, a: 0 };
  if (!DRMESH) DRMESH = buildDriveMesh(); if (FRONTMESH) { FRONTMESH.free(); FRONTMESH = null; }
  DR = { z: 0, x: 0, yaw: 0, v: 8, hp: 100, t: 0, peds: [], next: 40, hits: 0, end: 0, stopT: 0, wheel: 0, steer: 0, splat: 0, bump: 0 };
  G.foes = []; G.loot = []; G.fx = []; G.shots = []; G.bags = []; G.burns = []; G.stash = null; G.keys = {}; G.tb = { x: -99, z: -99, st: 'gone', a: 0 };
  G.mode = 'drive'; G.banner = { s: FLOORS[fi].name, t: 4 }; G.wake = 1.2; music.play('pnchase');
  say('Floor it. Run the bastards down.', 4, '#ffe36a'); if (G.R) say('Shithead Laboozie: throw bags at them from the passenger seat!', 4, '#ffe36a');
  if (isHost()) netFloor(how);
}
function buildDriveMesh() {
  var m = new R3.Mesh(), rnd = srand(77), STEP = 4; function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  function boxM(x0, y0, z0, x1, y1, z1, T, k) { var c = vc(k), cd = vc(k * 0.75), U = [0, 1, 1, 1, 1, 0, 0, 0];
    m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, 1, 0, 1, 1, 0, 1], T, c, [0, 1, 0]); m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], U, T, cd, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], U, T, cd, [0, 0, -1]);
    m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [0, (y1 - y0) / 2.6, (z1 - z0) / 2.6, (y1 - y0) / 2.6, (z1 - z0) / 2.6, 0, 0, 0], T, cd, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [0, (y1 - y0) / 2.6, (z1 - z0) / 2.6, (y1 - y0) / 2.6, (z1 - z0) / 2.6, 0, 0, 0], T, cd, [-1, 0, 0]); }
  for (var z = -30; z < DRLEN + 120; z += STEP) {
    var x0 = roadX(z), x1 = roadX(z + STEP), w = ROADW, city = z < DRLEN * 0.55, wood = z > DRLEN * 0.7;
    m.quad([x0 - w, 0, z], [x0 + w, 0, z], [x1 + w, 0, z + STEP], [x1 - w, 0, z + STEP], [0, 0, 1, 0, 1, 1, 0, 1], TL('road'), vc(1), [0, 1, 0]);
    [-1, 1].forEach(function (sd) { var a = x0 + sd * w, b = x0 + sd * (w + 3), a1 = x1 + sd * w, b1 = x1 + sd * (w + 3); m.quad([Math.min(a, b), 0.12, z], [Math.max(a, b), 0.12, z], [Math.max(a1, b1), 0.12, z + STEP], [Math.min(a1, b1), 0.12, z + STEP], [0, 0, 1, 0, 1, 1, 0, 1], TL(wood ? 'grass' : 'pave'), vc(0.9), [0, 1, 0]);
      var c0 = x0 + sd * (w + 3), c2 = x0 + sd * 60; m.quad([Math.min(c0, c2), 0.1, z], [Math.max(c0, c2), 0.1, z], [Math.max(c0, c2), 0.1, z + STEP], [Math.min(c0, c2), 0.1, z + STEP], [0, 0, 10, 0, 10, 1, 0, 1], TL(wood ? 'grass' : 'asphalt'), vc(0.6), [0, 1, 0]); });
    if ((z / STEP) % 3 === 0) [-1, 1].forEach(function (sd) {
      var bx = x0 + sd * (w + 3.5);
      if (city) { var h = 6 + rnd() * 10, d = 7 + rnd() * 5; boxM(Math.min(bx, bx + sd * d), 0, z, Math.max(bx, bx + sd * d), h, z + STEP * 3 - 0.6, TL(rnd() < 0.5 ? 'windows' : 'citywall'), 0.8 + rnd() * 0.3);
        if (rnd() < 0.6) { var nz = z + 2 + rnd() * 7, ny = 3 + rnd() * 3, T = TL(NEONS[Math.floor(rnd() * NEONS.length)]), fx = bx - sd * 0.05; m.quad([fx, ny - 0.9, nz - 0.9 * sd], [fx, ny - 0.9, nz + 0.9 * sd], [fx, ny + 0.9, nz + 0.9 * sd], [fx, ny + 0.9, nz - 0.9 * sd], [0, 1, 1, 1, 1, 0, 0, 0], T, vc(1), [-sd, 0, 0], 1.6); } }
      else if (!wood) { boxM(bx - 0.05, 0, z, bx + 0.05, 1.2, z + STEP * 3, TL('metal'), 0.7); if (rnd() < 0.4) boxM(bx + sd * 4, 0, z + 2, bx + sd * 8, 3, z + 8, TL('rust'), 0.8); }
      else { for (var t = 0; t < 4; t++) { var tx0 = bx + sd * (0.5 + rnd() * 9), tz0 = z + rnd() * STEP * 3, r = 0.25 + rnd() * 0.25; boxM(tx0 - r, 0, tz0 - r, tx0 + r, 9, tz0 + r, TL('bark'), 0.8); boxM(tx0 - 1.6, 4, tz0 - 1.6, tx0 + 1.6, 8.5, tz0 + 1.6, TL('leaves'), 0.7); } }
    });
    if ((z / STEP) % 6 === 0 && !wood) { var sd2 = (z / STEP) % 12 === 0 ? 1 : -1, lx = x0 + sd2 * (w + 0.6); boxM(lx - 0.06, 0, z - 0.06, lx + 0.06, 5, z + 0.06, TL('metal'), 0.6); boxM(lx - sd2 * 1.2 - 0.2, 4.9, z - 0.2, lx + 0.2, 5.05, z + 0.2, TL('metal'), 0.8); }
  }
  for (var k = 0; k < 30; k++) { var z2 = DRLEN + 40 + k * 3, xx = roadX(z2); boxM(xx - 8 + (k % 5) * 3.5, 0, z2, xx - 7 + (k % 5) * 3.5, 10, z2 + 0.8, TL('bark'), 0.8); boxM(xx - 10 + (k % 5) * 3.5, 4, z2 - 1, xx - 5 + (k % 5) * 3.5, 9, z2 + 2, TL('leaves'), 0.6); } // the woods close the road off
  return m.upload();
}
function driveLights() { var out = [], zc = DR.z; for (var z = Math.floor((zc - 30) / 24) * 24; z < zc + 70; z += 24) { if (z < 0 || z > DRLEN * 0.7) continue; var sd = (z / 24) % 2 ? 1 : -1; out.push({ x: roadX(z) + sd * (ROADW - 0.6), y: 4.8, z: z, r: 13, c: z < DRLEN * 0.55 ? [1, 0.15, 0.22] : [1, 0.6, 0.3], k: 1.3, d: Math.abs(z - zc) }); }
  out.sort(function (a, b) { return a.d - b.d; }); out = out.slice(0, 5);
  var f = [Math.sin(DR.yaw), Math.cos(DR.yaw)], cx = roadX(DR.z) + DR.x; out.push({ x: cx + f[0] * 6, y: 1.2, z: DR.z + f[1] * 6, r: 14, c: [1, 0.95, 0.8], k: DR.end ? 0.3 : 1.8 }); // headlights
  return out; }
function stepDrive(dt) {
  var I = inputs(), host = !isGuest(); DR.t += dt; DR.splat = Math.max(0, DR.splat - dt * 0.3); DR.bump = Math.max(0, DR.bump - dt * 3);
  if (isGuest()) { stepDriveGuest(dt, I); return; }
  var gas = KIT.held('a') || (KIT.gamepad && KIT.gamepad.buttons[7] && KIT.gamepad.buttons[7].pressed) || I.my < -0.5, brake = KIT.held('b') || I.my > 0.5;
  if (G.botIn) { gas = true; brake = false; }
  var top = DR.end ? 0 : gas ? 26 : 17, acc = DR.end ? -6 : brake ? -14 : (top > DR.v ? 7 : -4);
  DR.v = Math.max(0, Math.min(top + 0.01, DR.v + acc * dt)); if (DR.end && DR.v <= 0.2) { DR.v = 0; DR.stopT += dt; }
  DR.steer += ((DR.end ? 0 : I.mx) - DR.steer) * Math.min(1, dt * 6); DR.x -= DR.steer * dt * (4 + DR.v * 0.22); DR.z += DR.v * dt; DR.wheel += DR.v * dt * 3;
  var rd = roadDir(DR.z); DR.yaw = rd - DR.steer * 0.25; // facing +z, right is -x (he said the steering was the wrong way round)
  if (Math.abs(DR.x) > ROADW - 0.9) { // scraping the kerb and the walls
    DR.x = Math.sign(DR.x) * (ROADW - 0.9); if (DR.v > 8) { DR.hp = Math.max(DR.z < DRLEN * 0.72 ? 8 : 0, DR.hp - dt * 8); DR.v *= 1 - dt * 1.5; if (Math.random() < dt * 20) { G.fx.push({ k: 'spark', x: roadX(DR.z) + DR.x * 1.05, y: 0.6, z: DR.z, t: 0.3 }); } if (Math.random() < dt * 4) sfx.play('scrape'); KIT.shake(1.5); } }
  // TB's boys come at the car
  if (DR.z + 70 > DR.next && DR.next < DRLEN * 0.86) { var n = 1 + Math.floor(Math.random() * 3); for (var q = 0; q < n; q++) { var k = ['gimp', 'gimp', 'butcher', 'pusher'][Math.floor(Math.random() * 4)], side = Math.random() < 0.5 ? -1 : 1, mode = Math.random();
      DR.peds.push({ id: DR.peds.length, k: k, z: DR.next + q * 3, x: mode < 0.5 ? (Math.random() - 0.5) * 6 : side * (ROADW + 1.5), vx: mode < 0.5 ? 0 : -side * (1.5 + Math.random() * 1.5), st: 'run', a: 0, ph: Math.random() * 6, y: 0, vy: 0, spin: 0, t: 0, throwT: 1 + Math.random() * 2 }); }
    DR.next += 14 + Math.random() * 12; }
  var cx = roadX(DR.z) + DR.x;
  DR.peds.forEach(function (p) { p.t += dt; var px = roadX(p.z) + p.x;
    if (p.st === 'run') { var toward = p.z > DR.z ? -1 : 1; p.x += p.vx * dt; if (Math.abs(p.x) > ROADW + 2.5) p.vx = -p.vx; if (p.z - DR.z < 30 && p.z > DR.z) { p.z -= 2.2 * dt; p.x += Math.sign(DR.x - p.x) * 1.2 * dt; } p.a = Math.atan2(cx - px, DR.z - p.z); p.ph += dt * 9;
      if (p.k === 'pusher' && p.z - DR.z < 26 && p.z - DR.z > 8) { p.throwT -= dt; if (p.throwT <= 0) { p.throwT = 3; G.shots.push({ x: px, z: p.z, y: 1.4, vx: (cx - px) * 0.6, vz: (DR.z + DR.v * 0.7 - p.z) * 0.6, t: 1.4, car: 1 }); sfx.play('throw'); } }
      var dz = p.z - DR.z, dx = px - cx; if (Math.abs(dz) < 2.6 && Math.abs(dx) < 1.35 && DR.v > 3) { flattenPed(p, DR.v); } }
    else if (p.st === 'fly') { p.vy -= 18 * dt; p.y = Math.max(0, p.y + p.vy * dt); p.z += p.vz * dt; p.x += p.vxx * dt; p.spin += dt * 9; if (p.y <= 0 && p.vy < 0) { p.st = 'dead'; p.vy = 0; } }
  });
  DR.peds = DR.peds.filter(function (p) { return p.z > DR.z - 30; });
  for (var s = G.shots.length - 1; s >= 0; s--) { var sh = G.shots[s]; sh.t -= dt; sh.x += sh.vx * dt; sh.z += sh.vz * dt; if (Math.hypot(sh.x - cx, sh.z - DR.z) < 1.6) { G.shots.splice(s, 1); DR.splat = 1; DR.hp = Math.max(DR.z < DRLEN * 0.72 ? 8 : 0, DR.hp - 3); G.trip = Math.min(TRIPMAX, G.trip + 0.2); netEv({ k: 'tripup', n: 0.2 }); sfx.play('splat'); continue; } if (sh.t <= 0) G.shots.splice(s, 1); }
  // Laboozie's bags out of the window: a hit sets them alight, the fire on the road gets the ones who run through it
  for (var bi = G.bags.length - 1; bi >= 0; bi--) { var bg = G.bags[bi]; DR.peds.forEach(function (p) { if (p.st === 'run' && bg.y < 2 && Math.hypot(roadX(p.z) + p.x - bg.x, p.z - bg.z) < 0.8) { bg.t = -1; flattenPed(p, 4); sfx.play('splat'); } }); }
  stepBags(dt); G.burns.forEach(function (B) { DR.peds.forEach(function (p) { if (p.st === 'run' && Math.hypot(roadX(p.z) + p.x - B.x, p.z - B.z) < B.r) flattenPed(p, 3); }); });
  if (!DR.end && (DR.z > DRLEN || DR.hp <= 0)) { DR.end = 1; sfx.play('engine'); sayAll('The engine coughs, bangs and dies. The woods it is.', 4, '#c4121c'); }
  if (DR.end) { if (Math.random() < dt * 14) G.fx.push({ k: 'smoke', x: cx + Math.sin(DR.yaw) * 1.6, y: 1.1, z: DR.z + Math.cos(DR.yaw) * 1.6, t: 2, vy: 1.2 }); if (DR.stopT > 2.4) { G.mode = 'trans'; G.trans = 0; G.transTo = G.fi + 1; music.stop(1); netEv({ k: 'climb' }); } }
  if (Math.random() < dt * 2) sfx.play('engine', 0.3);
}
function flattenPed(p, v) { if (p.st !== 'run') return; p.st = 'fly'; p.vy = 5 + v * 0.25; p.vz = v * 0.9; p.vxx = (Math.random() - 0.5) * 6; p.y = 0.2; DR.hits++; G.kills++; DR.hp = Math.max(DR.z < DRLEN * 0.72 ? 8 : 0, DR.hp - (p.k === 'butcher' ? 4 : 1.5)); DR.splat = Math.max(DR.splat, 0.6); KIT.shake(6); sfx.play('thud'); sfx.play('scream'); blood(roadX(p.z) + p.x, 1, p.z, 16, 1.6); netEv({ k: 'blood', x: roadX(p.z) + p.x, z: p.z, n: 16 }); }
function stepDriveGuest(dt, I) { // Laboozie rides along: only his bag to throw
  var P = G.P; P.cool = Math.max(0, P.cool - dt); if (P.atkT >= 0) { P.atkT += dt / 0.45; if (!P.hitDone && P.atkT >= 0.5) { P.hitDone = 1; var cx = roadX(DR.z) + DR.x + Math.cos(DR.yaw) * -0.5, tgt = DR.peds.filter(function (p) { return p.st === 'run' && p.z > DR.z + 4 && p.z < DR.z + 30; }).sort(function (a, b) { return a.z - b.z; })[0], tx0 = tgt ? roadX(tgt.z) + tgt.x : cx, tz0 = tgt ? tgt.z : DR.z + 14, tt = 0.7;
    netSend({ t: 'bag', b: { x: cx, z: DR.z, y: 1.6, vx: (tx0 - cx) / tt, vz: (tz0 - DR.z) / tt + DR.v * 0, vy: (0.5 - 1.6) / tt + 6 * tt, t: 3, by: 'g' } }); } if (P.atkT >= 1) P.atkT = -1; }
  if (I.fire && P.cool <= 0 && P.atkT < 0) { P.atkT = 0; P.hitDone = 0; P.cool = 0.8; sfx.play('throw'); }
}
/* ---------- the crash: TB drives into T's Hussy House ---------- */
function startCrash() {
  var H = FL.hussy, q = DIRS[H.d], s = [-q[1], q[0]], from = null;
  for (var k = 12; k >= 5 && !from; k--) [1, -1].forEach(function (sg) { var i = H.i + s[0] * k * sg, j = H.j + s[1] * k * sg; if (!from && walkable(i, j, 'tb')) from = { x: tx(i), z: tx(j) }; });
  if (!from) from = { x: tx(H.i) - q[0] * TSZ * 8, z: tx(H.j) - q[1] * TSZ * 8 };
  var hit = { x: tx(H.i) + q[0] * TSZ * 0.35, z: tx(H.j) + q[1] * TSZ * 0.35 };
  var eye = null; for (var k2 = 3; k2 <= 7 && !eye; k2++) [1, -1].forEach(function (sg) { var i = H.i - q[0] + s[0] * k2 * sg, j = H.j - q[1] + s[1] * k2 * sg; if (!eye && walkable(i, j, 'me') && Math.hypot(tx(i) - from.x, tx(j) - from.z) > TSZ * 3) eye = { x: tx(i), z: tx(j) }; });
  G.crash = { t: 0, from: from, hit: hit, H: H, q: q, boom: 0, eye: eye || { x: tx(H.i) - q[0] * TSZ, z: tx(H.j) - q[1] * TSZ } }; G.mode = 'crash'; music.stop(0.3); sfx.play('engine'); netEv({ k: 'crash' });
}
function stepCrash(dt) {
  var c = G.crash; c.t += dt;
  if (c.t > 2.2 && !c.boom) { c.boom = 1; KIT.shake(14); KIT.flash(0.3); sfx.play('boom'); FL.fires.push({ x: c.hit.x, z: c.hit.z, s: 1.4 }); FL.lights.push({ i: c.hit.x / TSZ - 0.5, j: c.hit.z / TSZ - 0.5, k: 1.8, r: 11, fl: 2, c: [1, 0.45, 0.15], y: 1.2 }); for (var i = 0; i < 30; i++) G.fx.push({ k: 'smoke', x: c.hit.x, y: 1 + Math.random(), z: c.hit.z, t: 2 + Math.random() * 2, vy: 1 + Math.random() }); }
  if (c.t > 3.6 && !c.out) { c.out = 1; var tb = G.tb; tb.x = c.hit.x - c.q[0] * TSZ * 0.9 + c.q[1] * 0.8; tb.z = c.hit.z - c.q[1] * TSZ * 0.9 + c.q[0] * 0.8; tb.a = Math.atan2(-c.q[0], -c.q[1]); tb.st = 'emerge'; tb.angry = 1; tb.fire = 1; tb.clown = 0; sfx.play('tbhurt'); sfx.play('fireup'); }
  if (c.t > 4.4 && !c.said) { c.said = 1; subtitle('TB', tbLine(), 3.5); sfx.play('tblaugh'); }
  if (c.t > 7) { var tb2 = G.tb; tb2.st = 'roam'; tb2.grace = 3; tb2.goal = null; FL.respawn = { i: c.H.i, j: c.H.j, a: Math.atan2(-c.q[0], -c.q[1]) }; G.mode = 'play'; G.crash.done = 1; sayAll('TB climbs out of the burning wreck. He is on fire, and he is ANGRY. Get out of the red light district.', 5, '#c4121c'); music.play('pnchase'); }
}
/* ---------- the chapters move on ---------- */
function stepChapter(dt) {
  if (isGuest()) return; var th = FLOORS[G.fi];
  if ((FL.arena || th.kind === 'woods' || th.kind === 'district' || th.kind === 'park' || th.kind === 'cemetery' || th.kind === 'site') && FL.exitZone) { var Z = FL.exitZone; if (players().some(function (P) { var i = tileOf(P.x), j = tileOf(P.z); return !P.dead && i >= Z[0] && i <= Z[2] && j >= Z[1] && j <= Z[3]; })) { if (henchAlive()) { if (!G.henchNag || G.time - G.henchNag > 4) { G.henchNag = G.time; henchBlock(); } return; } if (th.hench && !FL.arena) { climb(); return; } if (th.kind === 'woods') sayAll('Out of the trees: the back gate of Ejaculand. Nobody has been here in years.', 4); if (th.kind === 'park') sayAll('The Load Flume. A log boat bobs in the cream. The only way on is the ride.', 4); if (th.city && th.city.exit) sayAll(th.city.exit, 4); if (th.kind === 'cemetery') sayAll('Over the back wall of the cemetery: a building site. CUMSTRUCTION, the hoarding says.', 4); if (th.kind === 'site') sayAll('Through the site gates: the cafe streets. Every shutter down.', 4); climb(); return; } }
  if (th.kind === 'district' && !G.crash && FL.hussy) { var H = FL.hussy; if (players().some(function (P) { var dd = FL.toClub[idx(tileOf(P.x), tileOf(P.z))]; return Math.hypot(P.x - tx(H.i), P.z - tx(H.j)) < TSZ * 7 || dd >= 0 && dd < FL.clubTotal * 0.55; })) startCrash(); }
}
/* ---------- THE BOSS: TB, finally, in front of the Clubhouse ---------- */
function bossInit(tb) { tb.hp = tb.max = 900 * (G.R ? 1.6 : 1); tb.mv = null; tb.cd = 2.5; tb.phase = 1; tb.angry = 1; tb.summ = 0; tb.stun = 0; tb.x = tx(FL.tb.i); tb.z = tx(FL.tb.j); tb.a = 0; G.hazards = []; G.bossIntro = 3; }
function stepBoss(dt) {
  var tb = G.tb, P = nearestPlayer(tb), pd = dist2(tb, P), sp = tb.phase > 1 ? 1.25 : 1; tb.spd = 0; tb.hurtT = Math.max(0, (tb.hurtT || 0) - dt);
  G.hazards.forEach(function (h) { h.t -= dt; players().forEach(function (pl) { if (!pl.dead && Math.hypot(pl.x - h.x, pl.z - h.z) < h.r && Math.random() < dt * 4) hurtPlayer(pl, 5, null, 0); }); }); G.hazards = G.hazards.filter(function (h) { return h.t > 0; });
  if (G.bossIntro > 0) { G.bossIntro -= dt; tb.a = Math.atan2(P.x - tb.x, P.z - tb.z); return; }
  if (tb.stun > 0) { tb.stun -= dt; return; }
  if (tb.phase === 1 && tb.hp < tb.max * 0.5) { tb.phase = 2; tb.mv = { k: 'gulp', t: 0 }; subtitle('TB', tbLine(), 3); sfx.play('rattle'); }
  if (tb.summ < 2 && tb.hp < tb.max * (tb.summ ? 0.3 : 0.7)) { tb.summ++; [[11, 14], [29, 14], [11, 30], [29, 30]].slice(tb.summ * 2 - 2, tb.summ * 2).forEach(function (s, n) { var k = n ? 'butcher' : 'gimp', d = FOES[k]; G.foes.push({ id: G.foes.length, k: k, d: d, x: tx(s[0]), z: tx(s[1]), a: 0, hp: d.hp, st: 'chase', sus: 1, home: { i: s[0], j: s[1] }, ph: 0, t: 0, atk: -1, cool: 1, ko: 0, bleed: 0, poison: 0, daze: 0, goal: null, spd: 0, hurt: 0, wait: 0, tgt: nearestPlayer({ x: tx(s[0]), z: tx(s[1]) }) }); }); sayAll('TB whistles. His boys come running.', 3, '#c4121c'); }
  var m = tb.mv;
  if (!m) { tb.cd -= dt; tb.a += angDiff(Math.atan2(P.x - tb.x, P.z - tb.z), tb.a) * Math.min(1, dt * 5);
    if (pd > 2.2) steer(tb, (P.x - tb.x) / pd, (P.z - tb.z) / pd, 2.4 * sp, dt, 'tb');
    if (tb.cd <= 0) { var r = Math.random(), k = pd < 2.4 ? 'swipe' : r < 0.42 ? 'charge' : r < 0.72 ? 'pills' : 'molotov'; tb.mv = { k: k, t: 0, tgt: P }; tb.cd = (tb.phase > 1 ? 1.1 : 1.7) + Math.random(); if (k === 'charge') sfx.play('sting'); }
    tb.ph += tb.spd * dt * 2.6; return; }
  m.t += dt; var T = m.tgt || P;
  if (m.k === 'gulp') { if (m.t > 1.8) { tb.mv = null; G.trip = Math.min(TRIPMAX, G.trip + 1); netEv({ k: 'tripup', n: 1 }); G.tripKick = 1.5; sayAll('TB swallows a whole bottle. Everything melts. He is faster now.', 4, '#ff4a8a'); } return; }
  if (m.k === 'swipe') { if (m.t < 0.5) { tb.a += angDiff(Math.atan2(T.x - tb.x, T.z - tb.z), tb.a) * Math.min(1, dt * 8); return; } if (!m.hit) { m.hit = 1; players().forEach(function (pl) { if (dist2(tb, pl) < 2.4 && Math.abs(angDiff(Math.atan2(pl.x - tb.x, pl.z - tb.z), tb.a)) < 1.1) hurtPlayer(pl, 18, tb, 0.3); }); sfx.play('swingbig'); } if (m.t > 0.9) tb.mv = null; return; }
  if (m.k === 'charge') { if (m.t < 0.9) { tb.a += angDiff(Math.atan2(T.x - tb.x, T.z - tb.z), tb.a) * Math.min(1, dt * 6); return; }
    var ox = tb.x, oz = tb.z, v = 10.5 * sp; tb.x += Math.sin(tb.a) * v * dt; tb.z += Math.cos(tb.a) * v * dt; collide(tb, 0.4, 'tb'); tb.spd = v; tb.ph += v * dt * 2.6;
    players().forEach(function (pl) { if (!m.hitP && dist2(tb, pl) < 1.1) { m.hitP = 1; hurtPlayer(pl, 24, tb, 0); } });
    var moved = Math.hypot(tb.x - ox, tb.z - oz); if (moved < v * dt * 0.4) { tb.mv = null; tb.stun = 2.4; KIT.shake(10); sfx.play('bonk'); sayAll('TB smacks into the wall. Hit him now!', 2.5, '#ffe36a'); return; }
    if (m.t > 2.6) tb.mv = null; return; }
  if (m.k === 'pills') { if (m.t < 0.6) return; if (!m.hit) { m.hit = 1; var a0 = Math.atan2(T.x - tb.x, T.z - tb.z); for (var i = -2; i <= 2; i++) { var a = a0 + i * 0.22; G.shots.push({ x: tb.x, z: tb.z, y: 1.5, vx: Math.sin(a) * 10, vz: Math.cos(a) * 10, t: 1.8 }); } sfx.play('throw'); } if (m.t > 1) tb.mv = null; return; }
  if (m.k === 'molotov') { if (m.t < 0.7) return; if (!m.hit) { m.hit = 1; m.to = { x: T.x, z: T.z }; sfx.play('throw'); } if (m.t > 1.6) { G.hazards.push({ x: m.to.x, z: m.to.z, r: 2, t: 6 }); G.burns.push({ x: m.to.x, z: m.to.z, t: 6, r: 2, tbs: 1 }); sfx.play('boom'); tb.mv = null; } return; }
}
function bossHurt(dmg, w) {
  var tb = G.tb; if (tb.st !== 'boss' || G.bossIntro > 0) return; tb.hp -= dmg * (tb.stun > 0 ? 2 : 1); tb.hurtT = 0.2; if (w !== 'burn') { blood(tb.x, 1.5, tb.z, 5); netEv({ k: 'blood', x: tb.x, z: tb.z, n: 5 }); if (Math.random() < 0.3) sfx.play('tbhurt'); }
  if (tb.hp <= 0) { tb.hp = 0; tb.st = 'dead'; tb.downT = 0; G.mode = 'win'; G.winT = 0; music.stop(0.5); sfx.play('tbhurt'); subtitle('TB', tbLine(), 4); netEv({ k: 'win' }); }
}
function stepWin(dt) { G.winT += dt; G.tb.downT = (G.tb.downT || 0) + dt; if (G.winT > 5.5 && !G.endMenu) { G.endMenu = 1; finalEnding(); } }
