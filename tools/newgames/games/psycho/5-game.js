/* =====================================================================================================
   THE GAME: Cumhead, TB and TB's boys on a floor of the basement. Moving, hiding, fighting, the pills, getting caught.
   ===================================================================================================== */
var G = null, MESH = null;
function newPlayer() { return { x: 0, z: 0, a: 0, ca: 0, cp: -0.08, hp: 100, st: 100, stLock: 0, weap: 'fists', weaps: { fists: 1 }, ammo: { '9mm': 0, shells: 0, rifle: 0 }, inv: { cracker: 0, cuppa: 0, pill: 0 }, keys: {}, buffs: [],
  ph: 0, spd: 0, run: 0, crouch: 0, aim: 0, atkT: -1, cool: 0, kick: 0, hurtT: 0, hide: null, noise: 0, flashT: 0, mash: 0, dead: 0 }; }
function hasBuff(b) { return G.P.buffs.indexOf(b) >= 0; }
function maxHp() { return 100 + (hasBuff('gut') ? 35 : 0); }
function say(s, t, col) { G.msgs.push({ s: s, t: t || 3, col: col || '#f1e7d0' }); if (G.msgs.length > 4) G.msgs.shift(); }
function subtitle(who, s, t) { G.sub = { who: who, s: s, t: t || 3.2 }; }
function tbLine() { var q = TBQUOTES[Math.floor(Math.random() * TBQUOTES.length)]; if (q === G.lastQ) q = TBQUOTES[(TBQUOTES.indexOf(q) + 1) % TBQUOTES.length]; G.lastQ = q; return q; }
/* ---------- a floor ---------- */
function loadFloor(fi, how) {
  FL = genFloor(fi, (G.seed * 7919 + fi * 104729) >>> 0); FL.cellLocked = how === 'cell' || (fi === 0 && how === 'new');
  FL.propAt = {}; FL.props.forEach(function (p) { FL.propAt[idx(p.i, p.j)] = p; }); FL.lockerAt = {}; FL.lockers.forEach(function (L) { FL.lockerAt[idx(L.i, L.j)] = L; });
  FL.doorAt = {}; FL.doors = []; FL.rooms.forEach(function (r) { if (r.cell) return; r.doors.forEach(function (d) { if (FL.K[idx(d.i, d.j)] !== KD || FL.doorAt[idx(d.i, d.j)]) return; var D = { i: d.i, j: d.j, ax: d.di ? 'x' : 'z', open: 0, idle: 0, side: ((d.i + d.j) % 2) ? 1 : -1 }; FL.doors.push(D); FL.doorAt[idx(d.i, d.j)] = D; }); });
  FL.seen = new Uint8Array(MW * MH);
  if (MESH) MESH.free(); MESH = buildFloorMesh(FL);
  G.fi = fi; G.loot = FL.loot.map(function (l) { return { x: tx(l.i), z: tx(l.j), k: l.k, t: Math.random() * 6 }; });
  FL.notes.forEach(function (n) { if (!(G.read || {})[fi + ':' + n.n]) G.loot.push({ x: tx(n.i), z: tx(n.j), k: 'note', n: n.n, t: Math.random() * 6 }); });
  G.foes = FL.foes.map(function (f) { var d = FOES[f.k]; return { k: f.k, d: d, x: tx(f.i), z: tx(f.j), a: Math.random() * 6.28, hp: d.hp, st: 'idle', sus: 0, home: { i: f.i, j: f.j }, ph: 0, t: 0, atk: -1, cool: 0, ko: 0, bleed: 0, path: null, goal: null, spd: 0, hurt: 0, wait: Math.random() * 3 }; });
  G.fx = []; G.shots = []; G.flow = null; G.flowKey = -1; G.stash = G.stash && G.stash.fi === fi ? G.stash : (G.stash && G.stash.fi !== fi ? null : null);
  var P = G.P, st = how === 'cell' ? FL.cellIn : FL.start; P.x = tx(st.i); P.z = tx(st.j); P.a = P.ca = how === 'cell' ? Math.atan2(FL.cellDoor.di, FL.cellDoor.dj) : st.a; P.hide = null; P.hp = Math.max(P.hp, 1);
  var tb = G.tb = { x: tx(FL.tb.i), z: tx(FL.tb.j), a: 0, st: fi === 0 && how === 'new' ? 'roam' : 'away', t: fi === 0 ? 0 : 22 + Math.random() * 18, sus: 0, ph: 0, spd: 0, grace: fi === 0 ? 25 : 8, pillT: TBK.gap[0] + Math.random() * (TBK.gap[1] - TBK.gap[0]), goal: null, flow: null, flowKey: -1, seen: 0, lastSeen: null, lost: 0, flinch: 0, rage: 0, laughT: 0, hum: 0 };
  if (tb.st === 'away') { tb.x = -50; tb.z = -50; }
  G.banner = { s: FLOORS[fi].n + '  ·  ' + FLOORS[fi].name, t: 4 };
  G.trans = 0; G.mode = 'play';
}
function tileFlow(who, i, j) { // a cached flow field to a tile
  var key = idx(i, j); if (who.flowKey === key && who.flow) return who.flow; who.flow = flowTo(i, j, who === G.tb ? 'tb' : 'foe'); who.flowKey = key; return who.flow;
}
var PFLOW = { flow: null, flowKey: -1 };
/* roll a mover along a flow field towards its goal; returns false when there is nowhere to go */
function followFlow(o, D, spd, dt, who) {
  var i = tileOf(o.x), j = tileOf(o.z), here = D[idx(i, j)]; if (here < 0) { // off the field (stood in a doorway): head for the middle of the tile
    o.x += (tx(i) - o.x) * Math.min(1, dt * 3); o.z += (tx(j) - o.z) * Math.min(1, dt * 3); return true; }
  if (here === 0) return false;
  var best = null, bd = here; DIRS.forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (!inMap(ni, nj)) return; var v = D[idx(ni, nj)]; if (v >= 0 && v < bd) { bd = v; best = [ni, nj]; } });
  if (!best) return false; var gx = tx(best[0]), gz = tx(best[1]);
  // cut corners when the next-but-one tile is in a straight line of sight
  var dx = gx - o.x, dz = gz - o.z, d = Math.hypot(dx, dz) || 1; steer(o, dx / d, dz / d, spd, dt, who); return true;
}
function steer(o, ux, uz, spd, dt, who) {
  var want = Math.atan2(ux, uz), da = angDiff(want, o.a); o.a += Math.max(-dt * 7, Math.min(dt * 7, da));
  o.x += ux * spd * dt; o.z += uz * spd * dt; collide(o, 0.32, who); o.spd = spd;
}
function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function dist2(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
/* how easily a watcher sees Cumhead: crouching and dark corners help, the torch does not */
function visK() { var P = G.P; if (P.hide) return 0; var lit = 0.55; FL.lights.forEach(function (L) { if (L.dead) return; var d = Math.hypot(tx(L.i) - P.x, tx(L.j) - P.z); if (d < L.r * 0.7) lit = 1; }); return lit * (P.crouch ? 0.55 : 1); }
function watching(w, sight, cone) { // 0 when it cannot see him, else how strongly (closer = stronger)
  var P = G.P; if (P.hide || P.dead) return 0; var d = dist2(w, P), r = sight * visK(); if (d > r && d > 1.6) return 0;
  var ang = Math.abs(angDiff(Math.atan2(P.x - w.x, P.z - w.z), w.a)); if (ang > cone && d > 1.6) return 0;
  if (!canSee(w.x, w.z, P.x, P.z)) return 0; return Math.max(0.25, 1 - d / Math.max(r, 2));
}
function makeNoise(x, z, r, src) { // TB and his boys hear it
  G.noises.push({ x: x, z: z, r: r, src: src, t: 0.1 });
  var tb = G.tb; if (tb && (tb.st === 'roam' || tb.st === 'search' || tb.st === 'investigate') && Math.hypot(tb.x - x, tb.z - z) < r * (src === 'shout' ? 1.4 : 1)) { tb.st = 'investigate'; tb.goal = { x: x, z: z }; tb.t = 0; }
  if (tb && tb.st === 'out' && src === 'gun' && Math.hypot(tb.x - x, tb.z - z) < 7) { tb.st = 'investigate'; tb.goal = { x: x, z: z }; tb.rage = 8; subtitle('TB', tbLine()); sfx.play('tblaugh'); }
  G.foes.forEach(function (f) { if (f.st === 'dead' || f.st === 'ko' || f.st === 'chase') return; if (Math.hypot(f.x - x, f.z - z) < r) { f.st = 'alert'; f.goal = { x: x, z: z }; f.t = 0; } });
}
/* ---------- Cumhead ---------- */
function inputs() {
  if (G.botIn) return G.botIn();
  var gp = KIT.gamepad, b = function (n) { return !!(gp && gp.buttons[n] && gp.buttons[n].pressed); };
  var mv = KIT.stick(0), lk = KIT.stick(1), aimHeld = KIT.held('x') || b(6), fire = KIT.pressed('a') || (b(7) && !G.rtWas);
  G.rtWas = b(7);
  if (G.touchAim !== undefined && KIT.pressed('x') && G.touchMode) G.touchAim = !G.touchAim;
  var rev = G.ev && G.ev.k === 'reverse' ? -1 : 1;
  return { mx: mv.x * rev, my: mv.y, lx: lk.x * rev, ly: lk.y, aim: G.touchMode ? !!G.touchAim : aimHeld, fire: fire, run: KIT.held('b'), crouch: KIT.pressed('lb'), swap: KIT.pressed('y'), heal: KIT.pressed('rb'), use: KIT.pressed('a') };
}
function interactAt() { // what A would use right now
  var P = G.P, best = null, bd = 2.5;
  function cand(x, z, k, o, r) { var d = Math.hypot(x - P.x, z - P.z); if (d > (r || 1.8)) return; var ang = Math.abs(angDiff(Math.atan2(x - P.x, z - P.z), P.a)); if (ang > 1.25 && d > 0.7) return; if (d < bd) { bd = d; best = { k: k, o: o, x: x, z: z }; } }
  FL.lockers.forEach(function (L) { var r = lockerRect(L); cand((r[0] + r[2]) / 2 + L.di * 0.4, (r[1] + r[3]) / 2 + L.dj * 0.4, 'locker', L, 1.5); });
  var e = FL.exit; cand(tx(e.i) + e.di * TSZ * 0.5, tx(e.j) + e.dj * TSZ * 0.5, 'exit', e, 1.7);
  if (FL.arrive) { var a = FL.arrive; cand(tx(a.i) + a.di * TSZ * 0.5, tx(a.j) + a.dj * TSZ * 0.5, 'down', a, 1.4); }
  var cd = FL.cellDoor; if (FL.cellLocked) cand(tx(cd.i) - cd.di * TSZ * 0.45, tx(cd.j) - cd.dj * TSZ * 0.45, 'cell', cd, 2.4);
  return best;
}
function promptText(it) {
  if (!it) return ''; if (it.k === 'locker') return 'HIDE IN THE LOCKER'; if (it.k === 'down') return 'THE WAY DOWN IS LOCKED';
  if (it.k === 'exit') return G.P.keys[G.fi] ? 'UNLOCK THE GATE AND CLIMB' : 'LOCKED: FIND THE ' + FLOORS[G.fi].key.toUpperCase();
  if (it.k === 'cell') return 'FORCE THE CELL DOOR (KEEP PRESSING)'; return '';
}
function stepPlayer(dt) {
  var P = G.P, I = inputs(), m = maxHp();
  P.hurtT = Math.max(0, P.hurtT - dt); P.cool = Math.max(0, P.cool - dt); P.kick = Math.max(0, P.kick - dt * 6); P.flashT = Math.max(0, P.flashT - dt);
  if (P.dead) return;
  /* hidden in a locker: peek out, A (or moving away) climbs out */
  if (P.hide) { P.ca -= I.lx * dt * 1.6; var L = P.hide, base = Math.atan2(L.di, L.dj); P.ca = base + Math.max(-0.7, Math.min(0.7, angDiff(P.ca, base))); P.cp += (I.ly * 0.8 - P.cp) * dt * 2; P.cp = Math.max(-0.4, Math.min(0.3, P.cp));
    P.st = Math.min(100, P.st + dt * 25); if (I.use || Math.hypot(I.mx, I.my) > 0.8 && G.hideT > 0.6) { var r = lockerRect(L); P.x = (r[0] + r[2]) / 2 + L.di * 0.95; P.z = (r[1] + r[3]) / 2 + L.dj * 0.95; P.a = base; P.hide = null; sfx.play('locker'); makeNoise(P.x, P.z, 2.5, 'locker'); }
    G.hideT += dt; return; }
  /* the camera: right stick or the arrows turn it */
  var turn = 2.6 * (P.aim ? 0.55 : 1); P.ca -= I.lx * dt * turn; P.cp = Math.max(-0.75, Math.min(0.55, P.cp - I.ly * dt * 1.6 * (P.aim ? 0.6 : 1)));
  if (!I.ly && !P.aim) P.cp += (-0.1 - P.cp) * dt * 0.8;
  var W = WEAP[P.weap];
  P.aim = I.aim && !P.atkT0 ? 1 : 0;
  if (I.crouch) { P.crouch = !P.crouch; sfx.play('step'); }
  if (I.swap) swapWeapon(1);
  if (I.heal) useItem(P.inv.cracker ? 'cracker' : P.inv.cuppa ? 'cuppa' : null);
  /* moving: relative to the camera */
  var fx = Math.sin(P.ca), fz = Math.cos(P.ca), rx = -Math.cos(P.ca), rz = Math.sin(P.ca), ix = I.mx, iy = -I.my, mag = Math.min(1, Math.hypot(ix, iy));
  var wx = fx * iy + rx * ix, wz = fz * iy + rz * ix, wl = Math.hypot(wx, wz) || 1; wx /= wl; wz /= wl;
  var running = I.run && mag > 0.2 && !P.aim && P.st > 0 && !P.stLock; if (running) P.crouch = 0;
  var feet = hasBuff('feet') ? 1.16 : 1, top = (P.aim ? 1.2 : running ? 4.7 : P.crouch ? 1.45 : 2.65) * feet * (P.hp < 25 ? 0.85 : 1);
  var target = mag > 0.15 ? top * mag : 0; P.spd += (target - P.spd) * Math.min(1, dt * 9);
  if (P.spd > 0.05 && mag > 0.15) { P.x += wx * P.spd * dt; P.z += wz * P.spd * dt; if (!P.aim) { var wa = Math.atan2(wx, wz); P.a += Math.max(-dt * 10, Math.min(dt * 10, angDiff(wa, P.a))); } }
  collide(P, 0.3, 'me');
  if (P.aim || P.atkT >= 0 && W.gun) P.a += angDiff(P.ca, P.a) * Math.min(1, dt * 14);
  P.run = running ? 1 : 0;
  if (running) { P.st -= dt * (hasBuff('lungs') ? 14 : 22); if (P.st <= 0) { P.st = 0; P.stLock = 1; } } else { P.st = Math.min(100, P.st + dt * (P.spd < 0.3 ? 20 : 13)); if (P.stLock && P.st > 30) P.stLock = 0; }
  var steps = P.spd * dt * (running ? 0.9 : 1.15); P.ph += steps * 3.4;
  if (Math.floor((P.ph - steps * 3.4) / Math.PI) !== Math.floor(P.ph / Math.PI) && P.spd > 0.4) { sfx.play(running ? 'steprun' : 'step'); }
  P.noise = running ? 9 : P.crouch ? 0.8 : P.spd > 0.4 ? 3.2 : 0; if (P.noise && Math.random() < dt * 4) makeNoise(P.x, P.z, P.noise, 'step');
  /* A: use what is in front of you, or attack */
  var it = interactAt(); G.prompt = it;
  if (it && it.k === 'cell' && I.use) { P.mash++; sfx.play('clang'); KIT.shake(2); makeNoise(P.x, P.z, 7, 'bang'); if (P.mash >= 10) { FL.cellLocked = 0; P.mash = 0; say('The rusted lock gives way.'); sfx.play('door'); } return; }
  if (it && I.use && it.k !== 'cell') { useThing(it); return; }
  if (I.fire) attack();
  if (P.atkT >= 0) { P.atkT += dt / (W.melee ? W.rate : 0.25); if (W.melee && !P.hitDone && P.atkT >= 0.45) { P.hitDone = 1; meleeHit(); } if (P.atkT >= 1) P.atkT = -1; }
  /* bleeding out slowly when badly hurt? no: health only comes back with food */
  if (P.hp > m) P.hp = m;
  markSeen();
}
function markSeen() { var P = G.P, i0 = tileOf(P.x), j0 = tileOf(P.z); for (var j = j0 - 3; j <= j0 + 3; j++) for (var i = i0 - 3; i <= i0 + 3; i++) if (inMap(i, j) && Math.abs(i - i0) + Math.abs(j - j0) <= 4 && (Math.abs(i - i0) + Math.abs(j - j0) <= 1 || canSee(P.x, P.z, tx(i), tx(j)))) FL.seen[idx(i, j)] = 1; }
function useThing(it) {
  var P = G.P;
  if (it.k === 'locker') { P.hide = it.o; G.hideT = 0; P.ca = Math.atan2(it.o.di, it.o.dj); P.cp = 0; P.crouch = 0; sfx.play('locker'); var tb = G.tb; G.hideSeen = tb.st === 'chase' && dist2(tb, P) < 7 && canSee(tb.x, tb.z, P.x, P.z); G.foes.forEach(function (f) { if (f.st === 'chase') { f.st = 'lost'; f.t = 0; } }); return; }
  if (it.k === 'exit') { if (!P.keys[G.fi]) { say('The gate is locked. TB keeps the ' + FLOORS[G.fi].key + ' somewhere on this floor.', 3.5); sfx.play('no'); return; } sfx.play('door'); climb(); return; }
  if (it.k === 'down') { say('The gate slammed shut behind you. The only way is up.', 3); sfx.play('no'); }
}
function swapWeapon(dir) {
  var P = G.P, have = WORDER.filter(function (w) { return P.weaps[w]; }), i = have.indexOf(P.weap); P.weap = have[(i + dir + have.length) % have.length]; P.atkT = -1; sfx.play('swap'); say(WEAP[P.weap].n, 1.2, '#a6968f');
}
function useItem(k) {
  var P = G.P; if (!k) { say('Nothing to eat.', 1.5, '#a6968f'); sfx.play('no'); return; } if (!P.inv[k]) return;
  P.inv[k]--; if (k === 'cracker') { P.hp = Math.min(maxHp(), P.hp + 40); say('Cum Cracker. +40', 2, '#ffe36a'); sfx.play('eat'); }
  else if (k === 'cuppa') { P.hp = Math.min(maxHp(), P.hp + 30); G.trip = Math.max(0, G.trip - 0.8); say('Cumpuccino. +30, and your head clears a little.', 2.5, '#ffe36a'); sfx.play('eat'); }
  else if (k === 'pill') { takePill(false); }
}
/* a Silly Pill: always more trip, then either a lift or more trip */
function takePill(forced, n) {
  n = n || 1; var out = [];
  for (var q = 0; q < n; q++) {
    G.trip = Math.min(TRIPMAX, G.trip + 0.7); G.pills++;
    var free = BUFFORDER.filter(function (b) { return !hasBuff(b); });
    if (Math.random() < (forced ? 0.45 : 0.6) && free.length) { var b = free[Math.floor(Math.random() * free.length)]; G.P.buffs.push(b); out.push(BUFFS[b].n + ': ' + BUFFS[b].d.toUpperCase()); if (b === 'gut') G.P.hp += 35; }
    else { G.trip = Math.min(TRIPMAX, G.trip + 0.6); out.push('IT GETS WORSE'); }
  }
  if (!forced) { say(out.join('  ·  '), 3.2, '#ff4a8a'); sfx.play('pill'); G.tripKick = 1; }
  return out;
}
/* ---------- fighting ---------- */
function attack() {
  var P = G.P, W = WEAP[P.weap]; if (P.cool > 0 || P.atkT >= 0) return;
  if (W.melee) { P.atkT = 0; P.hitDone = 0; P.cool = W.rate; sfx.play('swing'); return; }
  if (P.ammo[W.ammo] <= 0) { sfx.play('click'); say('Out of ' + AMMO[W.ammo].n + '.', 1.5, '#a6968f'); P.cool = 0.4; return; }
  P.ammo[W.ammo]--; P.cool = W.rate; P.atkT = 0; P.kick = 1; P.flashT = 0.07; sfx.play(P.weap); KIT.shake(W.kick * 2); makeNoise(P.x, P.z, W.noise, 'gun');
  var tgt = aimTarget(P.aim ? 0.22 : 0.42), base = P.ca, pitch = P.cp + 0.08; if (tgt) { base = Math.atan2(tgt.x - P.x, tgt.z - P.z); pitch = 0; }
  for (var k = 0; k < W.pellets; k++) {
    var a = base + (Math.random() - 0.5) * W.spread * 2 * (P.aim ? 0.6 : 1), hits = rayFoes(P.x, P.z, a, 30, W.pierce);
    var wd = rayWall(P.x, P.z, a, 30), ends = wd;
    hits.forEach(function (h, n) { if (h.d > wd || (n > 0 && !W.pierce)) return; ends = Math.min(ends, h.d); hurtFoe(h.f, W.dmg * (hasBuff('hands') ? 1.3 : 1) * (P.aim ? 1.2 : 1), a, W.knock ? 2.5 : 0.8, P.weap); });
    G.fx.push({ k: 'tracer', x0: P.x + Math.sin(a) * 0.6, z0: P.z + Math.cos(a) * 0.6, x1: P.x + Math.sin(a) * ends, z1: P.z + Math.cos(a) * ends, y: 1.25 + Math.tan(pitch) * 0, t: 0.06 });
    if (ends >= wd - 0.01) G.fx.push({ k: 'puff', x: P.x + Math.sin(a) * (wd - 0.1), z: P.z + Math.cos(a) * (wd - 0.1), y: 1.2, t: 0.4 });
  }
}
function aimTarget(cone) { // the nearest thing to shoot in front of the camera
  var P = G.P, best = null, bs = 1e9; G.foes.concat(G.ghost ? [G.ghost] : []).concat(G.tb && G.tb.st !== 'away' ? [G.tb] : []).forEach(function (f) {
    if (f.st === 'dead') return; var d = dist2(f, P); if (d > 24 || d < 0.3) return; var ang = Math.abs(angDiff(Math.atan2(f.x - P.x, f.z - P.z), P.ca)); if (ang > cone) return; if (!canSee(P.x, P.z, f.x, f.z)) return;
    var s = ang * 8 + d; if (s < bs) { bs = s; best = f; } }); return best;
}
function rayWall(x, z, a, max) { var dx = Math.sin(a), dz = Math.cos(a); for (var d = 0.2; d < max; d += 0.1) { var i = tileOf(x + dx * d), j = tileOf(z + dz * d); if (blocksEyes(i, j) || (inMap(i, j) && FL.K[idx(i, j)] === KP && FL.propAt[idx(i, j)] && ['crate', 'keg', 'barrel'].indexOf(FL.propAt[idx(i, j)].k) >= 0 && d > 1)) return d; } return max; }
function rayFoes(x, z, a, max) {
  var dx = Math.sin(a), dz = Math.cos(a), out = []; G.foes.concat(G.tb && G.tb.st !== 'away' ? [G.tb] : []).concat(G.ghost ? [G.ghost] : []).forEach(function (f) { if (f.st === 'dead') return;
    var ox = f.x - x, oz = f.z - z, t = ox * dx + oz * dz; if (t < 0 || t > max) return; var px = ox - dx * t, pz = oz - dz * t, r = f.st === 'ko' ? 0.6 : 0.42; if (px * px + pz * pz < r * r) out.push({ f: f, d: t }); });
  return out.sort(function (p, q) { return p.d - q.d; });
}
function meleeHit() {
  var P = G.P, W = WEAP[P.weap], hit = 0;
  G.foes.concat(G.tb && G.tb.st !== 'away' ? [G.tb] : []).concat(G.ghost ? [G.ghost] : []).forEach(function (f) { if (f.st === 'dead') return; var d = dist2(f, P); if (d > W.reach + 0.3) return; var ang = Math.abs(angDiff(Math.atan2(f.x - P.x, f.z - P.z), P.a)); if (ang > 1.0 && d > 0.8) return;
    hit = 1; hurtFoe(f, W.dmg * (hasBuff('rage') ? 1.6 : 1), Math.atan2(f.x - P.x, f.z - P.z), 1.2, P.weap); });
  if (hit) { sfx.play(P.weap === 'bat' ? 'bonk' : 'thud'); KIT.shake(3); makeNoise(P.x, P.z, 4, 'hit'); }
}
function blood(x, y, z, n, k) { for (var i = 0; i < n; i++) G.fx.push({ k: 'blood', x: x, y: y, z: z, vx: (Math.random() - 0.5) * 3 * (k || 1), vy: Math.random() * 3, vz: (Math.random() - 0.5) * 3 * (k || 1), t: 1.2 + Math.random() }); }
function hurtFoe(f, dmg, a, push, w) {
  if (f === G.ghost) { G.ghost.t = Math.min(G.ghost.t, 0.4); G.ghost.pop = 1; sfx.play('tblaugh'); return; }
  if (f === G.tb) { var tb = G.tb; tb.flinch = 0.7; tb.rage = 7; blood(tb.x, 1.4, tb.z, 4); sfx.play('tbhurt'); if (tb.st === 'out') { tb.st = 'chase'; } else if (tb.st !== 'grab') { tb.st = 'chase'; tb.sus = 1; }
    if (Math.random() < 0.5) subtitle('TB', tbLine()); return; }
  var ko = f.st === 'ko'; f.hp -= dmg * (ko ? 2 : 1); f.hurt = 0.25; blood(f.x, 1.2, f.z, 6); f.x += Math.sin(a) * push * 0.3; f.z += Math.cos(a) * push * 0.3; collide(f, 0.32, 'foe');
  var W = WEAP[w]; if (W && W.bleed) { f.bleed = W.bleedT; f.bleedK = W.bleed; } if (W && W.ko && f.st !== 'ko') { f.ko += W.ko; if (f.ko >= f.d.ko && f.hp > 0) { f.st = 'ko'; f.t = 0; f.koT = 16 + Math.random() * 6; say(f.d.n + ' is out cold.', 2, '#a6968f'); sfx.play('bonk'); } }
  if (f.st !== 'ko' && f.st !== 'dead') { f.st = 'chase'; f.sus = 1; f.lost = 0; }
  if (f.hp <= 0) killFoe(f);
}
function killFoe(f) {
  f.st = 'dead'; f.t = 0; f.hp = 0; G.kills++; sfx.play('scream'); blood(f.x, 1, f.z, 14, 1.4);
  if (Math.random() < 0.55) { var P = G.P, guns = ['handgun', 'shotgun', 'rifle'].filter(function (g) { return P.weaps[g]; }), k = Math.random() < 0.35 ? 'cracker' : guns.length ? { handgun: 'ammo9', shotgun: 'shells', rifle: 'riflea' }[guns[Math.floor(Math.random() * guns.length)]] : 'cracker'; G.loot.push({ x: f.x, z: f.z, k: k, t: 0 }); }
}
function hurtPlayer(dmg, from, dose) {
  var P = G.P; if (P.dead || G.mode !== 'play') return; P.hp -= dmg; P.hurtT = 0.4; blood(P.x, 1.2, P.z, 6); sfx.play('hurt'); KIT.shake(5); KIT.flash(0.08);
  if (dose) { G.trip = Math.min(TRIPMAX, G.trip + dose); say('Something sharp. Your head swims.', 2, '#ff4a8a'); }
  if (from) { P.x += Math.sin(Math.atan2(P.x - from.x, P.z - from.z)) * 0.25; P.z += Math.cos(Math.atan2(P.x - from.x, P.z - from.z)) * 0.25; collide(P, 0.3, 'me'); }
  if (P.hp <= 0) { P.hp = 0; P.dead = 1; gameOver('dead'); }
}
/* ---------- the pickups ---------- */
function stepLoot(dt) {
  var P = G.P; if (P.hide) return;
  for (var i = G.loot.length - 1; i >= 0; i--) { var l = G.loot[i]; l.t += dt; if (Math.hypot(l.x - P.x, l.z - P.z) > 0.85) continue;
    var L = LOOT[l.k]; G.loot.splice(i, 1); sfx.play('pickup');
    if (L.weap) { var nw = !P.weaps[L.weap]; P.weaps[L.weap] = 1; if (L.ammo) P.ammo[L.ammo] += L.give; if (nw) { P.weap = L.weap; say('You found the ' + L.n + '!', 3, '#ffe36a'); } else say(L.n + ' ammo', 2); }
    else if (L.ammo) { P.ammo[L.ammo] += AMMO[L.ammo].give; say(AMMO[L.ammo].n + ' +' + AMMO[L.ammo].give, 2); }
    else if (L.item) { P.inv[L.item]++; say(L.n + ' (' + P.inv[L.item] + ')', 2); }
    else if (L.key) { P.keys[G.fi] = 1; say('You found the ' + FLOORS[G.fi].key + '! The stairs up are open to you now.', 4, '#ffe36a'); sfx.play('key'); }
    else if (L.note) { G.read[G.fi + ':' + l.n] = 1; G.notesRead++; openNote(l.n); }
    else if (L.bag) { var S = G.stash; P.weaps = S.weaps; P.weap = S.weap; P.ammo = S.ammo; P.inv = S.inv; if (S.key) P.keys[G.fi] = 1; G.stash = null; say('You got your stuff back.', 3, '#ffe36a'); sfx.play('key'); }
  }
}
/* ---------- TB's boys ---------- */
function stepFoes(dt) {
  var P = G.P, pi = tileOf(P.x), pj = tileOf(P.z);
  G.foes.forEach(function (f) {
    var d = f.d; f.t += dt; f.hurt = Math.max(0, f.hurt - dt); f.cool = Math.max(0, f.cool - dt); f.ko = Math.max(0, f.ko - dt * 6); f.spd = 0;
    if (f.st === 'dead') return;
    if (f.bleed > 0) { f.bleed -= dt; f.hp -= f.bleedK * dt; if (Math.random() < dt * 6) G.fx.push({ k: 'blood', x: f.x, y: 1.1, z: f.z, vx: 0, vy: -0.5, vz: 0, t: 0.8 }); if (f.hp <= 0) { killFoe(f); return; } }
    if (f.st === 'ko') { if (f.t > f.koT) { f.st = 'chase'; f.ko = 0; f.sus = 1; } return; }
    var see = watching(f, d.sight, 1.05), pd = dist2(f, P);
    if (f.st === 'idle' || f.st === 'alert' || f.st === 'lost') {
      if (see) { f.sus += dt * (0.9 + see * 2.2); if (f.sus >= 1) { f.st = 'chase'; f.lost = 0; sfx.play('shout'); makeNoise(f.x, f.z, 16, 'shout'); } } else f.sus = Math.max(0, f.sus - dt * 0.25);
    }
    if (f.st === 'idle') { // amble about near home
      f.wait -= dt; if (f.wait <= 0 || !f.goal) { var g = randomNear(f.home.i, f.home.j, 5); f.goal = { x: tx(g.i), z: tx(g.j) }; f.wait = 6 + Math.random() * 6; }
      if (dist2(f, f.goal) > 0.5) followFlow(f, tileFlow(f, tileOf(f.goal.x), tileOf(f.goal.z)), d.walk * 0.7, dt, 'foe');
    } else if (f.st === 'alert' || f.st === 'lost') { if (!f.goal || dist2(f, f.goal) < 0.8 || !followFlow(f, tileFlow(f, tileOf(f.goal.x), tileOf(f.goal.z)), d.walk * 1.4, dt, 'foe')) { if (f.t > 6) { f.st = 'idle'; f.goal = null; } else f.a += dt * 1.5; } }
    else if (f.st === 'chase') {
      if (P.hide) { f.st = 'lost'; f.t = 0; f.goal = { x: P.x, z: P.z }; return; }
      if (see || pd < 2) { f.lost = 0; f.last = { x: P.x, z: P.z }; } else { f.lost += dt; if (f.lost > 5) { f.st = 'lost'; f.t = 0; f.goal = f.last; return; } }
      if (f.atk >= 0) { f.atk += dt; if (f.atk > 0.45 && !f.hitDone) { f.hitDone = 1; if (pd < d.reach + 0.25 && Math.abs(angDiff(Math.atan2(P.x - f.x, P.z - f.z), f.a)) < 1.2) hurtPlayer(d.dmg, f, d.dose ? 0.4 : 0); } if (f.atk > 0.9) { f.atk = -1; f.cool = d.rate; } return; }
      if (pd < d.reach && f.cool <= 0) { f.atk = 0; f.hitDone = 0; sfx.play('grunt'); return; }
      if (d.throws && see && pd > 4 && pd < 10 && f.cool <= 0) { f.cool = 2.2; var a = Math.atan2(P.x - f.x, P.z - f.z); G.shots.push({ x: f.x, z: f.z, y: 1.4, vx: Math.sin(a) * 9, vz: Math.cos(a) * 9, t: 1.4 }); sfx.play('throw'); }
      if (see && pd < 5) steer(f, (P.x - f.x) / pd, (P.z - f.z) / pd, d.run, dt, 'foe');
      else { var D = PFLOW.flowKey === idx(pi, pj) ? PFLOW.flow : (PFLOW.flow = flowTo(pi, pj, 'foe'), PFLOW.flowKey = idx(pi, pj), PFLOW.flow); var tgt = f.lost > 0 && f.last ? f.last : P; if (f.lost > 0) followFlow(f, tileFlow(f, tileOf(tgt.x), tileOf(tgt.z)), d.run, dt, 'foe'); else followFlow(f, D, d.run, dt, 'foe'); }
    }
    f.ph += f.spd * dt * 3;
  });
  // the thrown pills
  for (var s = G.shots.length - 1; s >= 0; s--) { var q = G.shots[s]; q.t -= dt; q.x += q.vx * dt; q.z += q.vz * dt; if (q.t <= 0 || blocksEyes(tileOf(q.x), tileOf(q.z))) { G.shots.splice(s, 1); continue; }
    if (!P.hide && Math.hypot(q.x - P.x, q.z - P.z) < 0.45) { G.shots.splice(s, 1); hurtPlayer(4, q, 0.3); } }
}
function randomNear(i, j, r) { for (var k = 0; k < 30; k++) { var a = i + Math.floor(Math.random() * (r * 2 + 1)) - r, b = j + Math.floor(Math.random() * (r * 2 + 1)) - r; if (walkable(a, b, 'foe')) return { i: a, j: b }; } return { i: i, j: j }; }
function randomFar(minD) { var P = G.P; for (var k = 0; k < 80; k++) { var i = 1 + Math.floor(Math.random() * (MW - 2)), j = 1 + Math.floor(Math.random() * (MH - 2)); if (walkable(i, j, 'tb') && Math.hypot(tx(i) - P.x, tx(j) - P.z) > minD) return { i: i, j: j }; } return { i: FL.exitIn.i, j: FL.exitIn.j }; }
/* ---------- TB ---------- */
function stepTB(dt) {
  var tb = G.tb, P = G.P; tb.flinch = Math.max(0, tb.flinch - dt); tb.rage = Math.max(0, tb.rage - dt); tb.grace = Math.max(0, tb.grace - dt); tb.laughT -= dt; tb.spd = 0;
  if (tb.st === 'away') { tb.t -= dt; if (tb.t <= 0) { var a = FL.arrive || FL.exit; tb.x = tx(a.i + a.di); tb.z = tx(a.j + a.dj); tb.a = Math.atan2(a.di, a.dj); tb.st = 'roam'; tb.grace = 4; say('Footsteps on the stairs below. TB is on this floor now.', 4, '#c4121c'); sfx.play('tblaugh'); } return; }
  if (tb.st === 'grab') return;
  tb.pillT -= dt;
  if (tb.st === 'out') { tb.t -= dt; if (Math.random() < dt * 0.5) sfx.play('snore'); if (tb.t <= 0) { tb.st = 'roam'; tb.pillT = TBK.gap[0] + Math.random() * (TBK.gap[1] - TBK.gap[0]); say('TB is back on his feet...', 3, '#c4121c'); sfx.play('tblaugh'); } return; }
  if (tb.st === 'pills') { tb.t -= dt; if (Math.random() < dt * 6) sfx.play('rattle'); if (tb.t <= 0) { tb.st = 'out'; tb.t = TBK.out[0] + Math.random() * (TBK.out[1] - TBK.out[0]); } return; }
  if (tb.flinch > 0) return;
  var see = tb.grace > 0 ? 0 : watching(tb, TBK.sight, 1.1), pd = dist2(tb, P);
  if (tb.st !== 'chase') {
    if (see) { tb.sus += dt * (0.7 + see * 2.4); if (tb.sus >= 1) { tb.st = 'chase'; tb.lost = 0; subtitle('TB', tbLine()); sfx.play('tblaugh'); G.spotted++; } }
    else tb.sus = Math.max(0, tb.sus - dt * 0.2);
    if (G.stash && tb.sus >= 1) { tb.st = 'grab'; gameOver('seen'); return; }
    if (tb.pillT <= 0 && tb.st !== 'chase') { tb.st = 'pills'; tb.t = 2.6; say('You hear a bottle of pills rattling somewhere...', 3, '#ff4a8a'); return; }
  }
  var sp = (tb.rage > 0 ? 1.12 : 1);
  if (tb.st === 'roam') { // he wanders, but he always drifts your way: he knows the basement, and he knows you
    if (!tb.goal || dist2(tb, tb.goal) < 0.8) { var g = Math.random() < (G.stash ? 0.3 : 0.5) ? randomNear(tileOf(P.x), tileOf(P.z), 8) : randomFar(0); tb.goal = { x: tx(g.i), z: tx(g.j) }; }
    if (!followFlow(tb, tileFlow(tb, tileOf(tb.goal.x), tileOf(tb.goal.z)), TBK.walk * sp, dt, 'tb')) tb.goal = null;
    if (Math.random() < dt * 0.12) sfx.play('hum');
  } else if (tb.st === 'investigate' || tb.st === 'search') {
    if (!tb.goal || dist2(tb, tb.goal) < 0.8 || !followFlow(tb, tileFlow(tb, tileOf(tb.goal.x), tileOf(tb.goal.z)), TBK.hunt * sp, dt, 'tb')) { tb.t += dt; tb.a += dt * 1.3; if (tb.t > 6) { tb.st = 'roam'; tb.goal = null; tb.t = 0; } }
  } else if (tb.st === 'chase') {
    if (P.hide) { if (G.hideSeen && pd < 3) { catchPlayer(); return; } tb.st = 'search'; tb.goal = { x: P.x, z: P.z }; tb.t = 0; return; }
    if (see || pd < 1.8) { tb.lost = 0; tb.last = { x: P.x, z: P.z }; } else { tb.lost += dt; if (tb.lost > 4.5) { tb.st = 'search'; tb.goal = tb.last; tb.t = 0; return; } }
    if (pd < TBK.grab && !P.dead) { catchPlayer(); return; }
    if (see && pd < 4.5) steer(tb, (P.x - tb.x) / pd, (P.z - tb.z) / pd, TBK.chase * sp, dt, 'tb');
    else { var tgt = tb.lost > 0 && tb.last ? tb.last : P; followFlow(tb, tileFlow(tb, tileOf(tgt.x), tileOf(tgt.z)), TBK.chase * sp, dt, 'tb'); }
    if (tb.laughT <= 0) { tb.laughT = 4 + Math.random() * 4; sfx.play('tblaugh'); }
  }
  tb.ph += tb.spd * dt * 2.6;
}
/* he got you: more pills, back in the cell, and your stuff stays where he found you */
function catchPlayer() {
  var P = G.P, tb = G.tb; tb.st = 'grab'; G.mode = 'catch'; G.cut = { t: 0, q: tbLine(), n: 1 + Math.floor(Math.random() * 3), res: null }; G.caught++;
  music.stop(0.5); sfx.play('grab'); KIT.shake(8);
}
function catchDone() {
  var P = G.P, c = G.cut;
  // your things go in a bag right where he grabbed you
  var hasStuff = WORDER.some(function (w) { return w !== 'fists' && P.weaps[w]; }) || P.inv.cracker || P.inv.cuppa || P.inv.pill || P.ammo['9mm'] || P.ammo.shells || P.ammo.rifle || P.keys[G.fi];
  if (hasStuff) { var bx = P.x, bz = P.z; if (G.stash) { G.loot = G.loot.filter(function (l) { return l.k !== 'bag'; }); } G.stash = { fi: G.fi, x: bx, z: bz, weaps: P.weaps, weap: P.weap, ammo: P.ammo, inv: P.inv, key: !!P.keys[G.fi] }; G.loot.push({ x: bx, z: bz, k: 'bag', t: 0 });
    P.weaps = { fists: 1 }; P.weap = 'fists'; P.ammo = { '9mm': 0, shells: 0, rifle: 0 }; P.inv = { cracker: 0, cuppa: 0, pill: 0 }; delete P.keys[G.fi]; }
  FL.cellLocked = 1; P.x = tx(FL.cellIn.i); P.z = tx(FL.cellIn.j); P.ca = P.a = Math.atan2(FL.cellDoor.di, FL.cellDoor.dj); P.hide = null; P.hp = Math.max(P.hp, 35); P.atkT = -1; P.mash = 0; P.crouch = 0;
  var tb = G.tb, g = randomFar(26); tb.x = tx(g.i); tb.z = tx(g.j); tb.st = 'roam'; tb.goal = null; tb.sus = 0; tb.grace = 14; tb.pillT = Math.max(tb.pillT, 40); tb.flow = null; tb.flowKey = -1;
  G.foes.forEach(function (f) { if (f.st === 'chase' || f.st === 'lost' || f.st === 'alert') { f.st = 'idle'; f.sus = 0; f.goal = null; } });
  G.mode = 'play'; G.cut = null; G.wake = 2.4;
  if (G.stash) say('He took everything. Get your stuff back, and do NOT let him see you.', 5, '#c4121c'); else say('Back in the cell. Force the door again.', 4, '#c4121c');
}
function climb() { if (G.stash) say('You left your stuff behind.', 3, '#a6968f'); G.mode = 'trans'; G.trans = 0; G.transTo = G.fi + 1; music.stop(1); sfx.play('stairs'); }
