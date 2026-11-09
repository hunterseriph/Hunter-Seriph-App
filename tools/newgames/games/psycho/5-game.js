/* =====================================================================================================
   THE GAME: Cumhead (and online, Shithead Laboozie), TB and TB's boys on a level. Moving, hiding, fighting, the pills,
   getting caught. G.P is the player on THIS machine; G.R is the other player when two play online (on the host G.R is
   Laboozie as the guest reports him, on the guest it is Cumhead as the host sends him). The host runs TB, his boys,
   the doors and the pickups for both; a guest only runs itself and tells the host what it hit, threw and picked up.
   ===================================================================================================== */
var G = null, MESH = null, DECALMESH = null;
function newPlayer(who) { var lab = who === 'lab'; return { who: lab ? 'lab' : 'cum', x: 0, z: 0, a: 0, ca: 0, cp: -0.08, hp: 100, st: 100, stLock: 0, weap: lab ? 'bag' : 'fists', weaps: lab ? { bag: 1 } : { fists: 1 }, ammo: { '9mm': 0, shells: 0, rifle: 0 }, inv: { cracker: 0, cuppa: 0, pill: 0 }, keys: {}, buffs: [],
  ph: 0, spd: 0, run: 0, crouch: 0, aim: 0, atkT: -1, cool: 0, kick: 0, hurtT: 0, hide: null, noise: 0, flashT: 0, mash: 0, dead: 0 }; }
function hasBuff(b, pl) { return (pl || G.P).buffs.indexOf(b) >= 0; }
function maxHp(pl) { return 100 + (hasBuff('gut', pl) ? 35 : 0); }
function say(s, t, col) { G.msgs.push({ s: s, t: t || 3, col: col || '#f1e7d0' }); if (G.msgs.length > 4) G.msgs.shift(); }
function sayAll(s, t, col) { say(s, t, col); netEv({ k: 'say', s: s, t: t, col: col }); }
function subtitle(who, s, t) { G.sub = { who: who, s: s, t: t || 3.2 }; netEv({ k: 'sub', who: who, s: s, t: t }); }
function tbLine() { var q = TBQUOTES[Math.floor(Math.random() * TBQUOTES.length)]; if (q === G.lastQ) q = TBQUOTES[(TBQUOTES.indexOf(q) + 1) % TBQUOTES.length]; G.lastQ = q; return q; }
function isGuest() { return !!(G && G.net === 'guest'); }
function isHost() { return !!(G && G.net === 'host'); }
function players() { var L = [G.P]; if (G.R && !G.R.gone) L.push(G.R); return L; }
function wfoes() { return G.foes; } // the boys as the world sees them (the guest's come from the host)
/* ---------- a level ---------- */
function loadFloor(fi, how) {
  var th = FLOORS[fi], seed = (G.seed * 7919 + fi * 104729) >>> 0; setMapSize(th.size); G.crash = null; G.R && (G.R.gone = 0);
  if (th.kind === 'drive') { startDrive(fi, how); return; }
  if (th.kind === 'ride') { startRide(fi, how); return; }
  FL = th.kind === 'woods' ? genWoods(fi, seed) : th.kind === 'park' ? genPark(fi, seed) : th.kind === 'district' ? genDistrict(fi, seed) : th.kind === 'cemetery' ? genCemetery(fi, seed) : th.kind === 'site' ? genSite(fi, seed) : th.kind === 'boss' ? genArena(fi, seed) : genFloor(fi, seed);
  placeHench(FL, fi); G.hazards = []; G.splatT = 0;
  FL.cellLocked = th.kind ? 0 : how === 'cell' || (fi === 0 && how === 'new');
  FL.propAt = {}; FL.props.forEach(function (p) { FL.propAt[idx(p.i, p.j)] = p; }); FL.lockerAt = {}; FL.lockers.forEach(function (L) { FL.lockerAt[idx(L.i, L.j)] = L; });
  FL.doorAt = {}; FL.doors = []; FL.rooms.forEach(function (r) { if (r.cell || r.open) return; r.doors.forEach(function (d) { if (FL.K[idx(d.i, d.j)] !== KD || FL.doorAt[idx(d.i, d.j)]) return; var D = { i: d.i, j: d.j, ax: d.di ? 'x' : 'z', open: 0, idle: 0, side: ((d.i + d.j) % 2) ? 1 : -1 }; FL.doors.push(D); FL.doorAt[idx(d.i, d.j)] = D; }); });
  FL.seen = new Uint8Array(MW * MH);
  if (MESH) MESH.free(); FL._dm = null; MESH = buildFloorMesh(FL); if (DECALMESH) DECALMESH.free(); DECALMESH = FL._dm && FL._dm.n ? FL._dm.upload() : null; FL._dm = null;
  G.fi = fi; G.lootId = G.lootId || 1; G.loot = FL.loot.map(function (l) { return { id: G.lootId++, x: tx(l.i), z: tx(l.j), k: l.k, t: Math.random() * 6 }; });
  FL.notes.forEach(function (n) { if (!(G.read || {})[fi + ':' + n.n]) G.loot.push({ id: G.lootId++, x: tx(n.i), z: tx(n.j), k: 'note', n: n.n, t: Math.random() * 6 }); });
  G.foes = FL.foes.map(function (f, n) { var d = FOES[f.k]; return { id: n, k: f.k, d: d, x: tx(f.i), z: tx(f.j), a: Math.random() * 6.28, hp: d.hp * (G.R ? 1.35 : 1), max: d.hp * (G.R ? 1.35 : 1), st: 'idle', sus: 0, home: { i: f.i, j: f.j }, ph: 0, t: 0, atk: -1, cool: 0, ko: 0, bleed: 0, poison: 0, daze: 0, goal: null, spd: 0, hurt: 0, wait: Math.random() * 3, roam: th.kind === 'district' || th.kind === 'park' || th.kind === 'woods' ? 12 : 5 }; });
  G.fx = []; G.shots = []; G.bags = []; G.burns = []; G.stash = null; G.keys = {}; G.lootV = (G.lootV || 0) + 1;
  players().forEach(function (pl) { if (pl.dead && !pl.gone) { pl.dead = 0; pl.hp = Math.max(pl.hp, 50); pl.downT = 0; } }); G.transWord = null;
  var P = G.P, st = how === 'cell' ? FL.cellIn : FL.start; placeAt(P, st, how === 'cell' ? Math.atan2(FL.cellDoor.di, FL.cellDoor.dj) : st.a);
  if (G.R && !isGuest()) placeAt(G.R, FL.start2 || FL.start, FL.start.a, 0.9);
  if (isGuest()) placeAt(P, FL.start2 || FL.start, FL.start.a, 0.9);
  var tbOn = th.kind === 'woods' || th.kind === 'park' || th.kind === 'cemetery' || th.kind === 'site' ? 'away' : th.kind === 'district' ? (th.city && th.city.hussy ? 'gone' : 'away') : th.kind === 'boss' ? 'boss' : fi === 0 && how === 'new' ? 'roam' : 'away';
  var tb = G.tb = { x: tx(FL.tb.i), z: tx(FL.tb.j), a: 0, st: tbOn, t: fi === 0 ? 0 : th.kind === 'woods' ? 30 : th.kind === 'park' ? 26 : th.burnt ? 26 + Math.random() * 14 : 22 + Math.random() * 18, sus: 0, ph: 0, spd: 0, grace: fi === 0 ? 25 : 8, pillT: TBK.gap[0] + Math.random() * (TBK.gap[1] - TBK.gap[0]), goal: null, flow: null, flowKey: -1, lost: 0, flinch: 0, rage: 0, laughT: 0, angry: th.kind === 'boss' || th.burnt ? 1 : 0, tgt: null, said: 0, clown: th.kind === 'park' ? 1 : 0, fire: th.kind === 'boss' || th.burnt ? 1 : 0 };
  if (tb.st === 'away' || tb.st === 'gone') { tb.x = -50; tb.z = -50; }
  if (tb.st === 'boss') bossInit(tb);
  G.banner = { s: (th.n ? th.n + '  ·  ' : '') + th.name, t: 4 };
  G.trans = 0; G.mode = 'play'; G.bossIntro = 0;
  if (isHost()) netFloor(how);
}
function placeAt(P, st, a, side) { P.x = tx(st.i) + (side ? Math.cos(a) * side : 0); P.z = tx(st.j) - (side ? Math.sin(a) * side : 0); P.a = P.ca = a; P.hide = null; P.hp = Math.max(P.hp, 1); collide(P, 0.3, 'me'); }
function tileFlow(who, i, j) { // a cached flow field to a tile
  var key = idx(i, j); if (who.flowKey === key && who.flow) return who.flow; who.flow = flowTo(i, j, who === G.tb ? 'tb' : 'foe'); who.flowKey = key; return who.flow;
}
/* roll a mover along a flow field towards its goal; returns false when there is nowhere to go */
function followFlow(o, D, spd, dt, who) {
  var i = tileOf(o.x), j = tileOf(o.z), here = D[idx(i, j)]; if (here < 0) { // off the field (stood in a doorway): head for the middle of the tile
    o.x += (tx(i) - o.x) * Math.min(1, dt * 3); o.z += (tx(j) - o.z) * Math.min(1, dt * 3); return true; }
  if (here === 0) return false;
  var best = null, bd = here; DIRS.forEach(function (q) { var ni = i + q[0], nj = j + q[1]; if (!inMap(ni, nj)) return; var v = D[idx(ni, nj)]; if (v >= 0 && v < bd) { bd = v; best = [ni, nj]; } });
  if (!best) return false; var gx = tx(best[0]), gz = tx(best[1]);
  var dx = gx - o.x, dz = gz - o.z, d = Math.hypot(dx, dz) || 1; steer(o, dx / d, dz / d, spd, dt, who); return true;
}
function steer(o, ux, uz, spd, dt, who) {
  var want = Math.atan2(ux, uz), da = angDiff(want, o.a); o.a += Math.max(-dt * 7, Math.min(dt * 7, da));
  o.x += ux * spd * dt; o.z += uz * spd * dt; collide(o, 0.32, who); o.spd = spd;
}
function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function dist2(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
/* how easily a watcher sees a player: crouching and dark corners help, the torch does not */
function visK(P) { if (P.hide) return 0; var lit = FLOORS[G.fi].kind ? 0.8 : 0.55; FL.lights.forEach(function (L) { if (L.dead) return; var d = Math.hypot(tx(L.i) - P.x, tx(L.j) - P.z); if (d < L.r * 0.7) lit = 1; }); return lit * (P.crouch ? 0.55 : 1); }
function watching(w, sight, cone, P) { // 0 when it cannot see him, else how strongly (closer = stronger)
  P = P || G.P; if (P.hide || P.dead || P.gone) return 0; var d = dist2(w, P), r = sight * visK(P); if (d > r && d > 1.6) return 0;
  var ang = Math.abs(angDiff(Math.atan2(P.x - w.x, P.z - w.z), w.a)); if (ang > cone && d > 1.6) return 0;
  if (!canSee(w.x, w.z, P.x, P.z)) return 0; return Math.max(0.25, 1 - d / Math.max(r, 2));
}
function bestSeen(w, sight, cone) { var b = null, bs = 0; players().forEach(function (P) { var s = watching(w, sight, cone, P); if (s > bs) { bs = s; b = P; } }); return { p: b, s: bs }; }
function nearestPlayer(o) { var b = null, bd = 1e9; players().forEach(function (P) { if (P.dead || P.gone) return; var d = dist2(o, P); if (d < bd) { bd = d; b = P; } }); return b || G.P; }
function makeNoise(x, z, r, src) { // TB and his boys hear it
  if (isGuest()) { netSend({ t: 'noise', x: x, z: z, r: r, src: src }); return; }
  G.noises.push({ x: x, z: z, r: r, src: src, t: 0.1 });
  var tb = G.tb; if (tb && (tb.st === 'roam' || tb.st === 'search' || tb.st === 'investigate') && Math.hypot(tb.x - x, tb.z - z) < r * (src === 'shout' ? 1.4 : 1)) { tb.st = 'investigate'; tb.goal = { x: x, z: z }; tb.t = 0; }
  if (tb && tb.st === 'out' && src === 'gun' && Math.hypot(tb.x - x, tb.z - z) < 7) { tb.st = 'investigate'; tb.goal = { x: x, z: z }; tb.rage = 8; subtitle('TB', tbLine()); sfx.play('tblaugh'); }
  G.foes.forEach(function (f) { if (f.st === 'dead' || f.st === 'ko' || f.st === 'chase') return; if (Math.hypot(f.x - x, f.z - z) < r) { f.st = 'alert'; f.goal = { x: x, z: z }; f.t = 0; } });
}
/* ---------- the player on this machine ---------- */
function inputs() {
  if (G.botIn) return G.botIn();
  var gp = KIT.gamepad, b = function (n) { return !!(gp && gp.buttons[n] && gp.buttons[n].pressed); };
  var mv = KIT.stick(0), lk = KIT.stick(1), aimHeld = KIT.held('x') || b(6), fire = KIT.pressed('a') || (b(7) && !G.rtWas);
  G.rtWas = b(7);
  if (G.touchAim !== undefined && KIT.pressed('x') && G.touchMode) G.touchAim = !G.touchAim;
  var rev = G.ev && G.ev.k === 'reverse' ? -1 : 1;
  return { mx: mv.x * rev, my: mv.y, lx: lk.x * rev, ly: lk.y, aim: G.touchMode ? !!G.touchAim : aimHeld, fire: fire, run: KIT.held('b'), crouch: KIT.pressed('lb'), swap: KIT.pressed('y'), heal: KIT.pressed('rb'), use: KIT.pressed('a') };
}
function haveKey() { return !!(G.P.keys[G.fi] || G.keys[G.fi] || FLOORS[G.fi].kind); }
function interactAt() { // what A would use right now
  var P = G.P, best = null, bd = 2.5;
  function cand(x, z, k, o, r) { var d = Math.hypot(x - P.x, z - P.z); if (d > (r || 1.8)) return; var ang = Math.abs(angDiff(Math.atan2(x - P.x, z - P.z), P.a)); if (ang > 1.25 && d > 0.7) return; if (d < bd) { bd = d; best = { k: k, o: o, x: x, z: z }; } }
  FL.lockers.forEach(function (L, n) { var r = lockerRect(L); cand((r[0] + r[2]) / 2 + L.di * 0.4, (r[1] + r[3]) / 2 + L.dj * 0.4, 'locker', L, 1.5); });
  var e = FL.exit; if (e && !FLOORS[G.fi].kind) cand(tx(e.i) + e.di * TSZ * 0.5, tx(e.j) + e.dj * TSZ * 0.5, 'exit', e, 1.7);
  if (FL.arrive) { var a = FL.arrive; cand(tx(a.i) + a.di * TSZ * 0.5, tx(a.j) + a.dj * TSZ * 0.5, 'down', a, 1.4); }
  var cd = FL.cellDoor; if (FL.cellLocked && cd) cand(tx(cd.i) - cd.di * TSZ * 0.45, tx(cd.j) - cd.dj * TSZ * 0.45, 'cell', cd, 2.4);
  return best;
}
function promptText(it) {
  if (!it) return ''; if (it.k === 'locker') return FL.hideWord || 'HIDE IN THE LOCKER'; if (it.k === 'down') return 'THE WAY DOWN IS LOCKED';
  if (it.k === 'exit') return haveKey() ? 'UNLOCK THE GATE AND CLIMB' : 'LOCKED: FIND THE ' + FLOORS[G.fi].key.toUpperCase();
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
  P.aim = I.aim ? 1 : 0;
  if (I.crouch) { P.crouch = !P.crouch; sfx.play('step'); }
  if (I.swap) swapWeapon(1);
  if (I.heal) useItem(P.inv.cracker ? 'cracker' : P.inv.cuppa ? 'cuppa' : null);
  /* moving: relative to the camera */
  var fx = Math.sin(P.ca), fz = Math.cos(P.ca), rx = -Math.cos(P.ca), rz = Math.sin(P.ca), ix = I.mx, iy = -I.my, mag = Math.min(1, Math.hypot(ix, iy));
  var wx = fx * iy + rx * ix, wz = fz * iy + rz * ix, wl = Math.hypot(wx, wz) || 1; wx /= wl; wz /= wl;
  var running = I.run && mag > 0.2 && !P.aim && P.st > 0 && !P.stLock; if (running) P.crouch = 0;
  var feet = hasBuff('feet') ? 1.16 : 1, top = (P.aim ? 1.2 : running ? 4.7 : P.crouch ? 1.45 : 2.65) * feet * (P.hp < 25 ? 0.85 : 1) * (W.heavy && P.atkT >= 0 ? 0.4 : 1);
  var target = mag > 0.15 ? top * mag : 0; P.spd += (target - P.spd) * Math.min(1, dt * 9);
  if (P.spd > 0.05 && mag > 0.15) { P.x += wx * P.spd * dt; P.z += wz * P.spd * dt; if (!P.aim) { var wa = Math.atan2(wx, wz); P.a += Math.max(-dt * 10, Math.min(dt * 10, angDiff(wa, P.a))); } }
  collide(P, 0.3, 'me');
  if (P.aim || P.atkT >= 0 && (W.gun || W.throw)) P.a += angDiff(P.ca, P.a) * Math.min(1, dt * 14);
  P.run = running ? 1 : 0;
  if (running) { P.st -= dt * (hasBuff('lungs') ? 14 : 22); if (P.st <= 0) { P.st = 0; P.stLock = 1; } } else { P.st = Math.min(100, P.st + dt * (P.spd < 0.3 ? 20 : 13)); if (P.stLock && P.st > 30) P.stLock = 0; }
  var steps = P.spd * dt * (running ? 0.9 : 1.15); P.ph += steps * 3.4;
  if (Math.floor((P.ph - steps * 3.4) / Math.PI) !== Math.floor(P.ph / Math.PI) && P.spd > 0.4) { sfx.play(running ? 'steprun' : 'step'); }
  P.noise = running ? 9 : P.crouch ? 0.8 : P.spd > 0.4 ? 3.2 : 0; if (P.noise && Math.random() < dt * 4) makeNoise(P.x, P.z, P.noise, 'step');
  /* A: use what is in front of you, or attack */
  var it = interactAt(); G.prompt = it;
  if (it && it.k === 'cell' && I.use) { P.mash++; sfx.play('clang'); KIT.shake(2); makeNoise(P.x, P.z, 7, 'bang'); if (P.mash >= 10) { FL.cellLocked = 0; P.mash = 0; say('The rusted lock gives way.'); sfx.play('door'); if (isGuest()) netSend({ t: 'unlock' }); } return; }
  if (it && I.use && it.k !== 'cell') { useThing(it); return; }
  if (I.fire) attack();
  if (P.atkT >= 0) { P.atkT += dt / (W.melee ? W.rate : W.throw ? 0.45 : 0.25); if (W.melee && !P.hitDone && P.atkT >= (W.heavy ? 0.55 : 0.45)) { P.hitDone = 1; meleeHit(); } if (W.throw && !P.hitDone && P.atkT >= 0.5) { P.hitDone = 1; throwBag(P); } if (P.atkT >= 1) P.atkT = -1; }
  if (P.hp > m) P.hp = m;
  if ((G.seenT = (G.seenT || 0) + dt) > 0.2) { G.seenT = 0; markSeen(); }
}
function markSeen() { var P = G.P, i0 = tileOf(P.x), j0 = tileOf(P.z); for (var j = j0 - 3; j <= j0 + 3; j++) for (var i = i0 - 3; i <= i0 + 3; i++) if (inMap(i, j) && Math.abs(i - i0) + Math.abs(j - j0) <= 4 && (Math.abs(i - i0) + Math.abs(j - j0) <= 1 || canSee(P.x, P.z, tx(i), tx(j)))) FL.seen[idx(i, j)] = 1; }
function useThing(it) {
  var P = G.P;
  if (it.k === 'locker') { P.hide = it.o; G.hideT = 0; P.ca = Math.atan2(it.o.di, it.o.dj); P.cp = 0; P.crouch = 0; sfx.play('locker'); var tb = G.tb; P.hideSeen = tb && tb.st === 'chase' && dist2(tb, P) < 7 && canSee(tb.x, tb.z, P.x, P.z); if (!isGuest()) G.foes.forEach(function (f) { if (f.st === 'chase' && f.tgt === P) { f.st = 'lost'; f.t = 0; } }); return; }
  if (it.k === 'exit') { if (henchBlock()) return; if (!haveKey()) { say('The gate is locked. TB keeps the ' + FLOORS[G.fi].key + ' somewhere on this floor.', 3.5); sfx.play('no'); return; } sfx.play('door'); if (isGuest()) netSend({ t: 'exit' }); else climb(); return; }
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
  if (W.melee || W.throw) { P.atkT = 0; P.hitDone = 0; P.cool = W.rate; sfx.play(W.throw ? 'throw' : W.heavy ? 'swingbig' : 'swing'); return; }
  if (P.ammo[W.ammo] <= 0) { sfx.play('click'); say('Out of ' + AMMO[W.ammo].n + '.', 1.5, '#a6968f'); P.cool = 0.4; return; }
  P.ammo[W.ammo]--; P.cool = W.rate; P.atkT = 0; P.kick = 1; P.flashT = 0.07; sfx.play(P.weap); KIT.shake(W.kick * 2); makeNoise(P.x, P.z, W.noise, 'gun');
  var tgt = aimTarget(P.aim ? 0.22 : 0.42), base = P.ca; if (tgt) base = Math.atan2(tgt.x - P.x, tgt.z - P.z);
  for (var k = 0; k < W.pellets; k++) {
    var a = base + (Math.random() - 0.5) * W.spread * 2 * (P.aim ? 0.6 : 1), hits = rayFoes(P.x, P.z, a, 30);
    var wd = rayWall(P.x, P.z, a, 30), ends = wd;
    hits.forEach(function (h, n) { if (h.d > wd || (n > 0 && !W.pierce)) return; ends = Math.min(ends, h.d); dealHit(h.f, W.dmg * (hasBuff('hands') ? 1.3 : 1) * (P.aim ? 1.2 : 1), a, W.knock ? 2.5 : 0.8, P.weap); });
    G.fx.push({ k: 'tracer', x0: P.x + Math.sin(a) * 0.6, z0: P.z + Math.cos(a) * 0.6, x1: P.x + Math.sin(a) * ends, z1: P.z + Math.cos(a) * ends, y: 1.25, t: 0.06 });
    if (ends >= wd - 0.01) G.fx.push({ k: 'puff', x: P.x + Math.sin(a) * (wd - 0.1), z: P.z + Math.cos(a) * (wd - 0.1), y: 1.2, t: 0.4 });
  }
}
function targets() { return wfoes().filter(function (f) { return !f.under; }).concat(G.ghost ? [G.ghost] : []).concat(G.tb && G.tb.st !== 'away' && G.tb.st !== 'gone' && G.tb.st !== 'dead' ? [G.tb] : []); }
function aimTarget(cone) { // the nearest thing to shoot in front of the camera
  var P = G.P, best = null, bs = 1e9; targets().forEach(function (f) {
    if (f.st === 'dead') return; var d = dist2(f, P); if (d > 24 || d < 0.3) return; var ang = Math.abs(angDiff(Math.atan2(f.x - P.x, f.z - P.z), P.ca)); if (ang > cone) return; if (!canSee(P.x, P.z, f.x, f.z)) return;
    var s = ang * 8 + d; if (s < bs) { bs = s; best = f; } }); return best;
}
function rayWall(x, z, a, max) { var dx = Math.sin(a), dz = Math.cos(a); for (var d = 0.2; d < max; d += 0.1) { var i = tileOf(x + dx * d), j = tileOf(z + dz * d); if (blocksEyes(i, j) || (inMap(i, j) && FL.K[idx(i, j)] === KP && FL.propAt[idx(i, j)] && ['crate', 'keg', 'barrel', 'car', 'dumpster'].indexOf(FL.propAt[idx(i, j)].k) >= 0 && d > 1)) return d; } return max; }
function rayFoes(x, z, a, max) {
  var dx = Math.sin(a), dz = Math.cos(a), out = []; targets().forEach(function (f) { if (f.st === 'dead') return;
    var ox = f.x - x, oz = f.z - z, t = ox * dx + oz * dz; if (t < 0 || t > max) return; var px = ox - dx * t, pz = oz - dz * t, r = f.st === 'ko' ? 0.6 : f === G.tb && G.tb.st === 'boss' ? 0.55 : f.d && f.d.hr ? f.d.hr : 0.42; if (px * px + pz * pz < r * r) out.push({ f: f, d: t }); });
  return out.sort(function (p, q) { return p.d - q.d; });
}
function meleeHit() {
  var P = G.P, W = WEAP[P.weap], hit = 0, arc = W.cleave ? 1.5 : 1.0, done = 0;
  targets().forEach(function (f) { if (f.st === 'dead' || (done && !W.cleave)) return; var d = dist2(f, P); if (d > W.reach + 0.3) return; var ang = Math.abs(angDiff(Math.atan2(f.x - P.x, f.z - P.z), P.a)); if (ang > arc && d > 0.8) return;
    var dmg = W.dmg * (hasBuff('rage') ? 1.6 : 1);
    // the knife from behind, on one who has not seen you coming: dead in one go
    if (W.stab && f !== G.tb && !(f.d && f.d.boss) && f.st !== 'chase' && f.st !== 'dead' && Math.abs(angDiff(f.a, Math.atan2(f.x - P.x, f.z - P.z))) < 1.0) { dmg = 999; say('Quiet as you like.', 1.6, '#a6968f'); }
    hit = 1; done = 1; dealHit(f, dmg, Math.atan2(f.x - P.x, f.z - P.z), W.heavy ? 2.2 : 1.2, P.weap); });
  if (hit) { sfx.play(P.weap === 'bat' || P.weap === 'hammer' ? 'bonk' : P.weap === 'knife' ? 'stab' : 'thud'); KIT.shake(W.heavy ? 5 : 3); makeNoise(P.x, P.z, W.stab ? 1.5 : 4, 'hit'); }
}
/* a hit on something: the host applies it, a guest tells the host (and shows the blood straight away) */
function dealHit(f, dmg, a, push, w) {
  if (f === G.ghost) { G.ghost.t = Math.min(G.ghost.t, 0.4); G.ghost.pop = 1; sfx.play('tblaugh'); return; }
  if (isGuest()) { blood(f.x, 1.2, f.z, 6); f.hurt = 0.25; netSend({ t: 'hit', id: f === G.tb ? 'tb' : f.id, dmg: dmg, a: a, push: push, w: w }); return; }
  hurtFoe(f, dmg, a, push, w);
}
function blood(x, y, z, n, k) { for (var i = 0; i < n; i++) G.fx.push({ k: 'blood', x: x, y: y, z: z, vx: (Math.random() - 0.5) * 3 * (k || 1), vy: Math.random() * 3, vz: (Math.random() - 0.5) * 3 * (k || 1), t: 1.2 + Math.random() }); }
function hurtFoe(f, dmg, a, push, w) {
  if (f === G.tb) { hurtTB(dmg, a, w); return; }
  if (f.st === 'dead' || f.under) return;
  if (f.d && f.d.boss) { f.hp -= dmg * (f.stun > 0 ? 1.6 : 1); f.hurt = 0.2; blood(f.x, 1.5, f.z, 6); netEv({ k: 'blood', x: f.x, z: f.z, n: 6 }); var WB = WEAP[w]; if (WB && WB.bleed) { f.bleed = WB.bleedT; f.bleedK = WB.bleed; } if (f.st !== 'fight') f.st = 'chase'; if (f.hp <= 0) killFoe(f); return; }
  var ko = f.st === 'ko'; f.hp -= dmg * (ko ? 2 : 1); f.hurt = 0.25; blood(f.x, 1.2, f.z, 6); netEv({ k: 'blood', x: f.x, z: f.z, n: 6 }); f.x += Math.sin(a) * push * 0.3; f.z += Math.cos(a) * push * 0.3; collide(f, 0.32, 'foe');
  var W = WEAP[w]; if (W && W.bleed) { f.bleed = W.bleedT; f.bleedK = W.bleed; } if (W && W.daze) f.daze = 1.4;
  if (W && W.ko && f.st !== 'ko') { f.ko += W.ko; if (f.ko >= f.d.ko && f.hp > 0) { f.st = 'ko'; f.t = 0; f.koT = 16 + Math.random() * 6; sayAll(f.d.n + ' is out cold.', 2, '#a6968f'); sfx.play('bonk'); } }
  if (f.st !== 'ko' && f.st !== 'dead') { f.st = 'chase'; f.sus = 1; f.lost = 0; if (!f.tgt) f.tgt = nearestPlayer(f); }
  if (f.hp <= 0) killFoe(f);
}
function hurtTB(dmg, a, w) {
  var tb = G.tb; if (tb.st === 'boss') { bossHurt(dmg, w); return; }
  tb.flinch = 0.7; tb.rage = 7; blood(tb.x, 1.4, tb.z, 4); sfx.play('tbhurt'); if (tb.st === 'out') { tb.st = 'chase'; } else if (tb.st !== 'grab') { tb.st = 'chase'; tb.sus = 1; }
  if (!tb.tgt) tb.tgt = nearestPlayer(tb); if (Math.random() < 0.5) subtitle('TB', tbLine());
}
function killFoe(f) {
  if (f.d && f.d.boss) { f.mv = null; f.under = 0; f.y = 0; var H = HENCH[f.k]; if (H) subtitle(f.d.n, H.die, 3.5); sayAll(f.d.n + ' is dead. The way on is open.', 4, '#ffe36a'); KIT.shake(8); addLoot(f.x + 0.6, f.z, 'cracker'); addLoot(f.x - 0.6, f.z, 'cuppa'); G.hazards = []; }
  f.st = 'dead'; f.t = 0; f.hp = 0; G.kills++; sfx.play('scream'); blood(f.x, 1, f.z, 14, 1.4); netEv({ k: 'blood', x: f.x, z: f.z, n: 14 });
  if (Math.random() < 0.55) { var P = G.P, guns = ['handgun', 'shotgun', 'rifle'].filter(function (g) { return P.weaps[g]; }), k = Math.random() < 0.35 ? 'cracker' : guns.length ? { handgun: 'ammo9', shotgun: 'shells', rifle: 'riflea' }[guns[Math.floor(Math.random() * guns.length)]] : 'cracker'; addLoot(f.x, f.z, k); }
}
function addLoot(x, z, k, extra) { var l = { id: G.lootId++, x: x, z: z, k: k, t: 0 }; if (extra) for (var q in extra) l[q] = extra[q]; G.loot.push(l); G.lootV++; return l; }
/* something hurts a player: the host's own, or (online) the guest is told */
function hurtPlayer(P, dmg, from, dose) {
  if (P !== G.P) { if (isHost()) netEv({ k: 'hurt', dmg: dmg, dose: dose || 0, fx: from ? from.x : P.x, fz: from ? from.z : P.z }); return; }
  if (P.dead || (G.mode !== 'play' && G.mode !== 'drive' && G.mode !== 'ride')) return; P.hp -= dmg; P.hurtT = 0.4; blood(P.x, 1.2, P.z, 6); sfx.play('hurt'); KIT.shake(5); KIT.flash(0.08);
  if (dose) { G.trip = Math.min(TRIPMAX, G.trip + dose); say('Something sharp. Your head swims.', 2, '#ff4a8a'); }
  if (from) { var aa = Math.atan2(P.x - from.x, P.z - from.z); P.x += Math.sin(aa) * 0.25; P.z += Math.cos(aa) * 0.25; collide(P, 0.3, 'me'); }
  if (P.hp <= 0) { P.hp = 0; P.dead = 1; if (isGuest()) { netSend({ t: 'dead' }); say("You're down. Laboozie gets back up in a bit...", 4, '#c4121c'); }
    else if (G.R && !G.R.dead && !G.R.gone) { P.downT = 15; say("You're down! Cumhead gets back up in a bit, if Laboozie keeps them off you.", 4, '#c4121c'); netEv({ k: 'say', s: 'Cumhead is down! Keep them off him.', t: 4, col: '#c4121c' }); }
    else { gameOver('dead'); netEv({ k: 'over', why: 'dead' }); } }
}
/* ---------- Shithead Laboozie's flaming bag of shit: hits a foe = covered in it (poison), hits the floor = it burns there 8 s ---------- */
function throwBag(P) {
  var tgt = aimTarget(P.aim ? 0.25 : 0.5), a = tgt ? Math.atan2(tgt.x - P.x, tgt.z - P.z) : P.ca, d = tgt ? Math.min(14, dist2(tgt, P)) : 9, sp = 10, t = d / sp;
  var b = { x: P.x + Math.sin(a) * 0.5, z: P.z + Math.cos(a) * 0.5, y: 1.6, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, vy: (0.4 - 1.6) / Math.max(0.3, t) + 6 * t, t: 3, by: P === G.P && isGuest() ? 'g' : 'h' };
  makeNoise(P.x, P.z, 5, 'hit');
  if (isGuest()) { netSend({ t: 'bag', b: b }); G.bags.push(Object.assign({ ghost: 1 }, b)); return; } // the guest's own copy is only for looks
  G.bags.push(b);
}
function stepBags(dt) {
  for (var i = G.bags.length - 1; i >= 0; i--) { var b = G.bags[i]; b.t -= dt; b.vy -= 12 * dt; b.x += b.vx * dt; b.z += b.vz * dt; b.y += b.vy * dt;
    var open = G.mode === 'drive' || G.mode === 'ride';
    if (b.ghost) { if (b.y <= 0.1 || b.t <= 0 || !open && blocksEyes(tileOf(b.x), tileOf(b.z))) G.bags.splice(i, 1); continue; }
    var hit = null; targets().forEach(function (f) { if (!hit && f !== G.ghost && f.st !== 'dead' && Math.hypot(f.x - b.x, f.z - b.z) < 0.55 && b.y < 2.1) hit = f; });
    var wall = !open && blocksEyes(tileOf(b.x), tileOf(b.z));
    if (hit) { G.bags.splice(i, 1); sfx.play('splat'); if (hit === G.tb) { hurtTB(14, 0, 'bag'); G.tb.poison = 5; } else { hit.poison = 6; hurtFoe(hit, 10, Math.atan2(b.vx, b.vz), 0.6, 'bag'); } continue; }
    if (b.y <= 0.05 || wall || b.t <= 0) { if (wall) { b.x -= b.vx * dt * 2; b.z -= b.vz * dt * 2; } G.bags.splice(i, 1); G.burns.push({ x: b.x, z: b.z, t: 8, r: 1.7 }); sfx.play('splat'); sfx.play('fireup'); }
  }
  for (var k = G.burns.length - 1; k >= 0; k--) { var B = G.burns[k]; B.t -= dt; if (B.t <= 0) { G.burns.splice(k, 1); continue; }
    if (isGuest()) continue;
    G.foes.forEach(function (f) { if (f.st !== 'dead' && Math.hypot(f.x - B.x, f.z - B.z) < B.r) { f.hp -= 12 * dt; f.burnT = 0.3; if (f.hp <= 0) killFoe(f); else if (f.st !== 'ko') { f.st = 'chase'; f.sus = 1; if (!f.tgt) f.tgt = nearestPlayer(f); } } });
    var tb = G.tb; if (tb && Math.hypot(tb.x - B.x, tb.z - B.z) < B.r) { tb.slowT = 0.4; if (tb.st === 'boss') bossHurt(10 * dt, 'burn'); } }
}
/* ---------- the pickups ---------- */
function stepLoot(dt) {
  var P = G.P; G.loot.forEach(function (l) { l.t += dt; }); if (P.hide || P.dead) return;
  for (var i = G.loot.length - 1; i >= 0; i--) { var l = G.loot[i]; if (Math.hypot(l.x - P.x, l.z - P.z) > 0.85) continue;
    if (l.k === 'bag' && (l.own || 'h') !== (isGuest() ? 'g' : 'h')) continue; // only your own stuff
    if (isGuest()) { if (!l.asked) { l.asked = 1; netSend({ t: 'take', id: l.id }); } continue; }
    G.loot.splice(i, 1); G.lootV++; gotLoot(l);
  }
}
function gotLoot(l) {
  var P = G.P, L = LOOT[l.k]; sfx.play('pickup');
  if (L.weap) { var nw = !P.weaps[L.weap]; P.weaps[L.weap] = 1; if (L.ammo) P.ammo[L.ammo] += L.give; if (nw) { P.weap = L.weap; say('You found the ' + L.n + '!', 3, '#ffe36a'); } else say(L.n + ' ammo', 2); }
  else if (L.ammo) { P.ammo[L.ammo] += AMMO[L.ammo].give; say(AMMO[L.ammo].n + ' +' + AMMO[L.ammo].give, 2); }
  else if (L.item) { P.inv[L.item]++; say(L.n + ' (' + P.inv[L.item] + ')', 2); }
  else if (L.key) { if (G.R) G.keys[G.fi] = 1; else P.keys[G.fi] = 1; sayAll('Found the ' + FLOORS[G.fi].key + '! The stairs up are open now.', 4, '#ffe36a'); sfx.play('key'); }
  else if (L.note) { G.read[G.fi + ':' + l.n] = 1; G.notesRead++; openNote(l.n); }
  else if (L.bag) { var S = G.stash; if (S) { P.weaps = S.weaps; P.weap = S.weap; P.ammo = S.ammo; P.inv = S.inv; if (S.key) P.keys[G.fi] = 1; } G.stash = null; say('You got your stuff back.', 3, '#ffe36a'); sfx.play('key'); }
}
/* ---------- TB's boys ---------- */
function stepFoes(dt) {
  G.foes.forEach(function (f) {
    var d = f.d; f.t += dt; f.hurt = Math.max(0, f.hurt - dt); f.cool = Math.max(0, f.cool - dt); f.ko = Math.max(0, f.ko - dt * 6); f.daze = Math.max(0, (f.daze || 0) - dt); f.spd = 0;
    if (f.st === 'dead') return;
    if (f.bleed > 0) { f.bleed -= dt; f.hp -= f.bleedK * dt; if (Math.random() < dt * 6) G.fx.push({ k: 'blood', x: f.x, y: 1.1, z: f.z, vx: 0, vy: -0.5, vz: 0, t: 0.8 }); if (f.hp <= 0) { killFoe(f); return; } }
    if (f.poison > 0) { f.poison -= dt; f.hp -= 7 * dt; if (f.hp <= 0) { killFoe(f); return; } }
    if (d.boss) { if (f.stun > 0) { f.stun -= dt; f.mv = null; return; } stepHench(f, dt); return; }
    if (f.leapT > 0) { f.leapT -= dt; var lk = 1 - f.leapT / 0.7; f.x = f.lf.x + (f.lt.x - f.lf.x) * lk; f.z = f.lf.z + (f.lt.z - f.lf.z) * lk; f.y = Math.sin(lk * Math.PI) * 1.8; collide(f, 0.32, 'foe'); if (f.leapT <= 0) { f.y = 0; players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < 1.4) hurtPlayer(pl, d.dmg + 4, f, 0); }); sfx.play('thud'); } return; }
    if (f.st === 'ko') { if (f.t > f.koT) { f.st = 'chase'; f.ko = 0; f.sus = 1; f.tgt = nearestPlayer(f); } return; }
    if (f.daze > 0) { f.a += dt * 4; return; } // seeing stars
    var sw = bestSeen(f, d.sight, 1.05), see = sw.s, P = f.st === 'chase' && f.tgt && !f.tgt.gone ? f.tgt : sw.p || nearestPlayer(f), pd = dist2(f, P);
    if (f.st === 'chase' && f.tgt) see = watching(f, d.sight, 1.05, f.tgt);
    if (f.st === 'idle' || f.st === 'alert' || f.st === 'lost') {
      if (see) { f.sus += dt * (0.9 + see * 2.2); if (f.sus >= 1) { f.st = 'chase'; f.tgt = sw.p; f.lost = 0; sfx.play(d.honk ? 'honk' : 'shout'); netEv({ k: 'sfx', n: 'shout' }); makeNoise(f.x, f.z, 16, 'shout'); } } else f.sus = Math.max(0, f.sus - dt * 0.25);
    }
    if (f.st === 'idle') { // amble about near home
      f.wait -= dt; if (f.wait <= 0 || !f.goal) { var g = randomNear(f.home.i, f.home.j, f.roam || 5); f.goal = { x: tx(g.i), z: tx(g.j) }; f.wait = 6 + Math.random() * 6; }
      if (dist2(f, f.goal) > 0.5) followFlow(f, tileFlow(f, tileOf(f.goal.x), tileOf(f.goal.z)), d.walk * 0.7, dt, 'foe');
    } else if (f.st === 'alert' || f.st === 'lost') { if (!f.goal || dist2(f, f.goal) < 0.8 || !followFlow(f, tileFlow(f, tileOf(f.goal.x), tileOf(f.goal.z)), d.walk * 1.4, dt, 'foe')) { if (f.t > 6) { f.st = 'idle'; f.goal = null; } else f.a += dt * 1.5; } }
    else if (f.st === 'chase') {
      P = f.tgt || P; pd = dist2(f, P);
      if (P.hide || P.dead || P.gone) { var other = players().filter(function (q) { return q !== P && !q.hide && !q.dead && !q.gone; })[0]; if (other && watching(f, d.sight, 3.2, other)) { f.tgt = other; return; } f.st = 'lost'; f.t = 0; f.goal = { x: P.x, z: P.z }; f.tgt = null; return; }
      if (see || pd < 2) { f.lost = 0; f.last = { x: P.x, z: P.z }; } else { f.lost += dt; if (f.lost > 5) { f.st = 'lost'; f.t = 0; f.goal = f.last; f.tgt = null; return; } }
      if (f.atk >= 0) { f.atk += dt; if (f.atk > 0.45 && !f.hitDone) { f.hitDone = 1; if (d.slam) { KIT.shake(7); sfx.play('boom'); players().forEach(function (pl) { if (!pl.dead && dist2(f, pl) < d.reach + 0.6) hurtPlayer(pl, d.dmg, f, 0); }); } else if (pd < d.reach + 0.25 && Math.abs(angDiff(Math.atan2(P.x - f.x, P.z - f.z), f.a)) < 1.2) hurtPlayer(P, d.dmg, f, d.dose ? 0.4 : 0); } if (f.atk > 0.9) { f.atk = -1; f.cool = d.rate; } return; }
      if (pd < d.reach && f.cool <= 0) { f.atk = 0; f.hitDone = 0; sfx.play('grunt'); return; }
      if (d.throws && see && pd > 4 && pd < 10 && f.cool <= 0) { f.cool = 2.2; var a = Math.atan2(P.x - f.x, P.z - f.z); G.shots.push(d.pie ? { x: f.x, z: f.z, y: 1.4, vx: Math.sin(a) * 9, vz: Math.cos(a) * 9, t: 1.4, dmg: 3, dose: 0, splat: 1, tex: 'splat', sz: 0.2 } : { x: f.x, z: f.z, y: 1.4, vx: Math.sin(a) * 9, vz: Math.cos(a) * 9, t: 1.4 }); sfx.play('throw'); }
      if (d.leap && see && pd > 3.2 && pd < 8 && f.cool <= 0) { f.cool = 2.6; f.leapT = 0.7; f.lf = { x: f.x, z: f.z }; f.lt = { x: P.x, z: P.z }; sfx.play('grunt'); return; }
      var sp = d.run * (f.burnT > 0 ? 0.6 : 1); f.burnT = Math.max(0, (f.burnT || 0) - dt);
      if (see && pd < 5) steer(f, (P.x - f.x) / pd, (P.z - f.z) / pd, sp, dt, 'foe');
      else { var tg = f.lost > 0 && f.last ? f.last : P; followFlow(f, tileFlow(f, tileOf(tg.x), tileOf(tg.z)), sp, dt, 'foe'); }
    }
    f.ph += f.spd * dt * 3;
  });
  // the thrown pills
  for (var s = G.shots.length - 1; s >= 0; s--) { var q = G.shots[s]; q.t -= dt; q.x += q.vx * dt; q.z += q.vz * dt; if (q.t <= 0 || blocksEyes(tileOf(q.x), tileOf(q.z))) { G.shots.splice(s, 1); continue; }
    var hitP = players().filter(function (P) { return !P.hide && !P.dead && Math.hypot(q.x - P.x, q.z - P.z) < 0.45; })[0]; if (hitP) { G.shots.splice(s, 1); hurtPlayer(hitP, q.dmg || 4, q, q.dose === undefined ? 0.3 : q.dose); if (q.splat) { if (hitP === G.P) G.splatT = 3.2; else netEv({ k: 'splat' }); sfx.play('splat'); } } }
}
function randomNear(i, j, r) { for (var k = 0; k < 30; k++) { var a = i + Math.floor(Math.random() * (r * 2 + 1)) - r, b = j + Math.floor(Math.random() * (r * 2 + 1)) - r; if (walkable(a, b, 'foe')) return { i: a, j: b }; } return { i: i, j: j }; }
function randomFar(minD) { var L = players(); for (var k = 0; k < 80; k++) { var i = 1 + Math.floor(Math.random() * (MW - 2)), j = 1 + Math.floor(Math.random() * (MH - 2)); if (walkable(i, j, 'tb') && L.every(function (P) { return Math.hypot(tx(i) - P.x, tx(j) - P.z) > minD; })) return { i: i, j: j }; } return { i: FL.exitIn.i, j: FL.exitIn.j }; }
/* ---------- TB ---------- */
function tbSpotLine() { return FLOORS[G.fi].kind === 'woods' && (!G.tb.said || Math.random() < 0.5) ? (G.tb.said = 1, TBWOODS) : tbLine(); }
function stepTB(dt) {
  var tb = G.tb; tb.flinch = Math.max(0, tb.flinch - dt); tb.rage = Math.max(0, tb.rage - dt); tb.grace = Math.max(0, tb.grace - dt); tb.laughT -= dt; tb.spd = 0; tb.slowT = Math.max(0, (tb.slowT || 0) - dt);
  if (tb.poison > 0) { tb.poison -= dt; tb.slowT = Math.max(tb.slowT, 0.2); }
  if (tb.st === 'gone' || tb.st === 'dead' || tb.st === 'crash') return;
  if (tb.st === 'boss') { stepBoss(dt); return; }
  if (tb.st === 'away') { tb.t -= dt; if (tb.t <= 0) { var a = FL.arrive || FL.tbIn || FL.exit; tb.x = tx(a.i + (a.di || 0)); tb.z = tx(a.j + (a.dj || 0)); tb.a = Math.atan2(a.di || 0, a.dj || 1); tb.st = 'roam'; tb.grace = 4; var kd = FLOORS[G.fi].kind; sayAll(kd === 'woods' ? 'Branches snapping somewhere behind you. TB is in the woods.' : kd === 'park' ? 'A horn honks by the gate. TB is in the park, and he is wearing a clown suit.' : 'Footsteps on the stairs below. TB is on this floor now.', 4, '#c4121c'); if (kd === 'park') sfx.play('honk'); sfx.play('tblaugh'); } return; }
  if (tb.st === 'grab') return;
  if (!tb.angry) tb.pillT -= dt;
  if (tb.st === 'out') { tb.t -= dt; if (Math.random() < dt * 0.5) sfx.play('snore'); if (tb.t <= 0) { tb.st = 'roam'; tb.pillT = TBK.gap[0] + Math.random() * (TBK.gap[1] - TBK.gap[0]); sayAll('TB is back on his feet...', 3, '#c4121c'); sfx.play('tblaugh'); } return; }
  if (tb.st === 'pills') { tb.t -= dt; if (Math.random() < dt * 6) sfx.play('rattle'); if (tb.t <= 0) { tb.st = 'out'; tb.t = TBK.out[0] + Math.random() * (TBK.out[1] - TBK.out[0]); } return; }
  if (tb.flinch > 0) return;
  var sight = TBK.sight * (tb.angry ? 1.3 : 1), sw = tb.grace > 0 ? { p: null, s: 0 } : bestSeen(tb, sight, tb.angry ? 1.4 : 1.1), see = sw.s, P = tb.st === 'chase' && tb.tgt && !tb.tgt.gone ? tb.tgt : sw.p || nearestPlayer(tb), pd = dist2(tb, P);
  if (tb.st === 'chase') see = tb.grace > 0 ? 0 : watching(tb, sight, tb.angry ? 1.4 : 1.1, P);
  if (tb.st !== 'chase') {
    if (see) { tb.sus += dt * (0.7 + see * 2.4) * (tb.angry ? 1.6 : 1); if (tb.sus >= 1) { tb.st = 'chase'; tb.tgt = sw.p; tb.lost = 0; subtitle('TB', tbSpotLine()); sfx.play('tblaugh'); netEv({ k: 'sfx', n: 'tblaugh' }); G.spotted++; } }
    else tb.sus = Math.max(0, tb.sus - dt * 0.2);
    if (tb.sus >= 1 && sw.p && strippedOf(sw.p)) { tb.st = 'grab'; gameOver('seen'); netEv({ k: 'over', why: 'seen' }); return; }
    if (tb.pillT <= 0 && tb.st !== 'chase') { tb.st = 'pills'; tb.t = 2.6; sayAll('You hear a bottle of pills rattling somewhere...', 3, '#ff4a8a'); return; }
  }
  var sp = (tb.rage > 0 ? 1.12 : 1) * (tb.angry ? 1.12 : 1) * (tb.slowT > 0 ? 0.55 : 1);
  if (tb.st === 'roam') { // he wanders, but he always drifts your way: he knows the place, and he knows you
    if (!tb.goal || dist2(tb, tb.goal) < 0.8) { var near = nearestPlayer(tb), g = Math.random() < (strippedAny() ? 0.3 : tb.angry ? 0.75 : 0.5) ? randomNear(tileOf(near.x), tileOf(near.z), 8) : randomFar(0); tb.goal = { x: tx(g.i), z: tx(g.j) }; }
    if (!followFlow(tb, tileFlow(tb, tileOf(tb.goal.x), tileOf(tb.goal.z)), TBK.walk * sp, dt, 'tb')) tb.goal = null;
    if (Math.random() < dt * 0.12) sfx.play('hum');
  } else if (tb.st === 'investigate' || tb.st === 'search') {
    if (!tb.goal || dist2(tb, tb.goal) < 0.8 || !followFlow(tb, tileFlow(tb, tileOf(tb.goal.x), tileOf(tb.goal.z)), TBK.hunt * sp, dt, 'tb')) { tb.t += dt; tb.a += dt * 1.3; if (tb.t > 6) { tb.st = 'roam'; tb.goal = null; tb.t = 0; } }
  } else if (tb.st === 'chase') {
    if (P.hide) { if (P.hideSeen && pd < 3) { catchPlayer(P); return; } tb.st = 'search'; tb.goal = { x: P.x, z: P.z }; tb.t = 0; tb.tgt = null; return; }
    if (P.dead || P.gone) { tb.st = 'roam'; tb.tgt = null; return; }
    if (see || pd < 1.8) { tb.lost = 0; tb.last = { x: P.x, z: P.z }; } else { tb.lost += dt; if (tb.lost > 4.5) { tb.st = 'search'; tb.goal = tb.last; tb.t = 0; tb.tgt = null; return; } }
    if (pd < TBK.grab) { catchPlayer(P); return; }
    var cs = TBK.chase * sp; if (see && pd < 4.5) steer(tb, (P.x - tb.x) / pd, (P.z - tb.z) / pd, cs, dt, 'tb');
    else { var tg = tb.lost > 0 && tb.last ? tb.last : P; followFlow(tb, tileFlow(tb, tileOf(tg.x), tileOf(tg.z)), cs, dt, 'tb'); }
    if (tb.laughT <= 0) { tb.laughT = 4 + Math.random() * 4; sfx.play('tblaugh'); if (FLOORS[G.fi].kind === 'woods' && Math.random() < 0.4) subtitle('TB', TBWOODS); }
  }
  tb.ph += tb.spd * dt * 2.6;
}
function strippedOf(P) { return P === G.P ? !!G.stash : !!P.stripped; }
function strippedAny() { return players().some(strippedOf); }
/* he got you: more pills, back in the cell (or back at the start outside), and your stuff stays where he found you */
function catchPlayer(P) {
  var tb = G.tb; P = P || G.P; G.caught++;
  if (P !== G.P) { tb.st = 'grab'; tb.grabT = 2.2; netEv({ k: 'caught' }); tbReset(); return; } // the guest plays the scene on their side
  tb.st = 'grab'; G.mode = 'catch'; G.cut = { t: 0, q: FLOORS[G.fi].kind === 'woods' ? TBWOODS : tbLine(), n: 1 + Math.floor(Math.random() * 3), res: null };
  music.stop(0.5); sfx.play('grab'); KIT.shake(8);
}
function tbReset() { var tb = G.tb, g = randomFar(26); tb.x = tx(g.i); tb.z = tx(g.j); tb.st = 'roam'; tb.goal = null; tb.sus = 0; tb.grace = 14; tb.pillT = Math.max(tb.pillT, 40); tb.flow = null; tb.flowKey = -1; tb.tgt = null; }
function catchDone() {
  var P = G.P, coop = !!G.R;
  // your things go in a bag right where he grabbed you (online the key stays with the team)
  var hasStuff = WORDER.some(function (w) { return w !== 'fists' && w !== 'bag' && P.weaps[w]; }) || P.inv.cracker || P.inv.cuppa || P.inv.pill || P.ammo['9mm'] || P.ammo.shells || P.ammo.rifle || P.keys[G.fi];
  if (hasStuff) { var bx = P.x, bz = P.z, own = isGuest() ? 'g' : 'h'; G.loot = G.loot.filter(function (l) { return !(l.k === 'bag' && (l.own || 'h') === own); });
    G.stash = { fi: G.fi, x: bx, z: bz, weaps: P.weaps, weap: P.weap, ammo: P.ammo, inv: P.inv, key: !!P.keys[G.fi] };
    if (isGuest()) netSend({ t: 'bagdrop', x: bx, z: bz }); else addLoot(bx, bz, 'bag', { own: own });
    P.weaps = P.who === 'lab' ? { bag: 1 } : { fists: 1 }; P.weap = P.who === 'lab' ? 'bag' : 'fists'; P.ammo = { '9mm': 0, shells: 0, rifle: 0 }; P.inv = { cracker: 0, cuppa: 0, pill: 0 }; delete P.keys[G.fi]; }
  var outdoor = FLOORS[G.fi].kind, spot = outdoor ? (FL.respawn || FL.start) : FL.cellIn;
  if (!outdoor) FL.cellLocked = 1; if (!outdoor && isGuest()) netSend({ t: 'lock' });
  P.x = tx(spot.i); P.z = tx(spot.j); P.ca = P.a = outdoor ? (spot.a || 0) : Math.atan2(FL.cellDoor.di, FL.cellDoor.dj); P.hide = null; P.hp = Math.max(P.hp, 35); P.atkT = -1; P.mash = 0; P.crouch = 0;
  if (!isGuest()) { tbReset(); G.foes.forEach(function (f) { if ((f.st === 'chase' || f.st === 'lost' || f.st === 'alert') && f.tgt === P) { f.st = 'idle'; f.sus = 0; f.goal = null; f.tgt = null; } }); }
  G.mode = 'play'; G.cut = null; G.wake = 2.4;
  var where = outdoor ? 'He dumped you back where you started.' : 'Back in the cell. Force the door again.';
  if (G.stash) say('He took everything. Get your stuff back, and do NOT let him see you.', 5, '#c4121c'); else say(where, 4, '#c4121c');
}
function climb() { if (G.stash) say('You left your stuff behind.', 3, '#a6968f'); G.mode = 'trans'; G.trans = 0; G.transTo = G.fi + 1; music.stop(1); sfx.play('stairs'); netEv({ k: 'climb' }); }
