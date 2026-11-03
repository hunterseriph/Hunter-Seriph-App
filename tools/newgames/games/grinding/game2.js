/* =====================================================================================================
   MORE ROOMS (his ask: loads of new room types and variations, until it feels like a full game).
   - 36 more layouts on top of the first 14, with pits ('o': you walk round them, shots and fliers cross them).
     Every layout is checked so all four doors join up; one that does not is never used.
   - Room flavours: dark rooms (a ring of light round Cumhead), and foe formations (a ring, a wall, a crowd, an ambush).
   - New special rooms hung off each floor: Challenge (three waves, then an item), Miniboss (one huge foe, an item),
     Potbelly's Arcade (a slot machine, a coin a pull), Curse (the door bites you on the way in; two chests),
     Spermaid's Shrine (two items, take one), the Vault (gold chests, a key each), Sacrifice (spikes that pay out
     the more you bleed on them) and a Secret room on every floor, only found by bombing the wall where it is.
   ===================================================================================================== */
LAYOUTS = LAYOUTS.concat([
  ['.............', '.oo.......oo.', '.oo.......oo.', '.............', '.oo.......oo.', '.oo.......oo.', '.............'],
  ['.............', '.............', '..ooooooooo..', '.............', '..ooooooooo..', '.............', '.............'],
  ['.............', '..o.......o..', '..o..ppp..o..', '..o.......o..', '..o..ppp..o..', '..o.......o..', '.............'],
  ['.............', '.....ooo.....', '....ooooo....', '.............', '....ooooo....', '.....ooo.....', '.............'],
  ['.............', '.ooo.....ooo.', '.o.........o.', '.....rrr.....', '.o.........o.', '.ooo.....ooo.', '.............'],
  ['.............', '.r.o.r.o.r.o.', '.............', '.o.r.o.r.o.r.', '.............', '.r.o.r.o.r.o.', '.............'],
  ['.............', '..sss...sss..', '..s.......s..', '.............', '..s.......s..', '..sss...sss..', '.............'],
  ['.............', '....rr.rr....', '...r.....r...', '...r..o..r...', '...r.....r...', '....rr.rr....', '.............'],
  ['.............', '.pppp...pppp.', '.............', '.............', '.............', '.pppp...pppp.', '.............'],
  ['.............', '.o.o.o.o.o.o.', '.............', '.............', '.............', '.o.o.o.o.o.o.', '.............'],
  ['.............', '..r...r...r..', '...s.....s...', '....r.r.r....', '...s.....s...', '..r...r...r..', '.............'],
  ['.............', '.............', '.oooo...oooo.', '.oooo...oooo.', '.oooo...oooo.', '.............', '.............'],
  ['.............', '.r.........r.', '..r..ooo..r..', '...........', '..r..ooo..r..', '.r.........r.', '.............'],
  ['.............', '..pp.....pp..', '.p..p...p..p.', '.............', '.p..p...p..p.', '..pp.....pp..', '.............'],
  ['.............', '.s.s.s.s.s.s.', '.............', '...ooo.ooo...', '.............', '.s.s.s.s.s.s.', '.............'],
  ['.............', '......r......', '.....rrr.....', '..o.......o..', '.....rrr.....', '......r......', '.............'],
  ['.............', '.oo..rrr..oo.', '.............', '.............', '.............', '.oo..rrr..oo.', '.............'],
  ['.............', '...r.....r...', '..r.r...r.r..', '.............', '..r.r...r.r..', '...r.....r...', '.............'],
  ['.............', '.ppp.....ppp.', '.p.........p.', '.............', '.p.........p.', '.ppp.....ppp.', '.............'],
  ['.............', '.............', '...o.o.o.o...', '.............', '...o.o.o.o...', '.............', '.............'],
  ['.............', '.rrr.....rrr.', '.............', '....sssss....', '.............', '.rrr.....rrr.', '.............'],
  ['.............', '..o.......o..', '.ooo.....ooo.', '.............', '.ooo.....ooo.', '..o.......o..', '.............'],
  ['.............', '....p...p....', '...ppp.ppp...', '.............', '...ppp.ppp...', '....p...p....', '.............'],
  ['.............', '.r.r.....r.r.', '..s.......s..', '.............', '..s.......s..', '.r.r.....r.r.', '.............'],
  ['.............', '.....o.o.....', '....o...o....', '...o.....o...', '....o...o....', '.....o.o.....', '.............'],
  ['.............', '.rr..ppp..rr.', '.............', '.............', '.............', '.rr..ppp..rr.', '.............'],
  ['.............', '..sss.o.sss..', '.............', '.............', '.............', '..sss.o.sss..', '.............'],
  ['.............', '.oooo.....oo.', '.oooo.....oo.', '.............', '.oo.....oooo.', '.oo.....oooo.', '.............'],
  ['.............', '..r.p.r.p.r..', '.............', '.............', '.............', '..p.r.p.r.p..', '.............'],
  ['.............', '.............', '.rr.ss.ss.rr.', '.............', '.rr.ss.ss.rr.', '.............', '.............'],
  ['.............', '...rrrrrrr...', '.............', '.............', '.............', '...rrrrrrr...', '.............'],
  ['.............', '.o.........o.', '.o..r...r..o.', '.o.........o.', '.o..r...r..o.', '.o.........o.', '.............'],
  ['.............', '..pp.....pp..', '..pp.....pp..', '.....ooo.....', '..pp.....pp..', '..pp.....pp..', '.............'],
  ['.............', '.r.s.r.s.r.s.', '.............', '.............', '.............', '.s.r.s.r.s.r.', '.............'],
  ['.............', '....ooooo....', '.............', '..r.......r..', '.............', '....ooooo....', '.............'],
  ['.............', '.ppp.ooo.ppp.', '.............', '.............', '.............', '.ppp.ooo.ppp.', '.............']
]);
var TILECH = { r: 1, p: 3, s: 4, o: 5 };
function layTiles(lay, flip) { return lay.map(function (row) { var r = row.split(''); while (r.length < COLS) r.push('.'); if (flip) r.reverse(); return r.slice(0, COLS).map(function (ch) { return TILECH[ch] || 0; }); }); }
/* do all four doors join up, walking round rocks, piles and pits? */
function joined(t) {
  var doors = [[6, 0], [6, ROWS - 1], [0, 3], [COLS - 1, 3]], seen = {}, q = [doors[0]], walk = function (x, y) { return x >= 0 && y >= 0 && x < COLS && y < ROWS && (t[y][x] === 0 || t[y][x] === 4); };
  if (!walk(6, 0)) return false; seen['6,0'] = 1;
  while (q.length) { var c = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var x = c[0] + d[0], y = c[1] + d[1], k = x + ',' + y; if (!seen[k] && walk(x, y)) { seen[k] = 1; q.push([x, y]); } }); }
  return doors.every(function (d) { return seen[d[0] + ',' + d[1]]; });
}
var GOODLAY = LAYOUTS.filter(function (l, i) { return i > 0 && joined(layTiles(l, false)); });
/* pits: you walk round them (fliers and shots cross) */
blocked = (function (orig) { return function (x, y, r, fly) { if (orig(x, y, r, fly)) return true; if (fly) return false; var t = room && room.tiles; if (!t) return false; return [[x - r, y - r], [x + r, y - r], [x - r, y + r], [x + r, y + r]].some(function (p) { return tileAt(p[0], p[1]) === 5; }); }; })(blocked);

/* ---------- the floor: new layouts, flavours, and the new rooms hung off it ---------- */
var NEWROOMS = ['challenge', 'miniboss', 'arcade', 'curse', 'shrine', 'vault', 'sacrifice'];
genFloor = (function (orig) { return function (N) {
  var F = orig(N); if (!F) return F;
  var key = function (x, y) { return x + ',' + y; };
  F.list.forEach(function (c) { if (c.type === 'normal') { c.tiles = layTiles(pick(GOODLAY), Math.random() < 0.5); c.dark = Math.random() < 0.12 + run.floor * 0.03; c.form = pick(['', '', 'ring', 'wall', 'crowd', 'ambush']); } });
  function freeNear(minN, maxN) { var out = [];
    for (var y = 0; y < 9; y++) for (var x = 0; x < 9; x++) { if (F.cells[key(x, y)]) continue; var n = 0, bad = false; for (var d in DV) { var o = F.cells[key(x + DV[d][0], y + DV[d][1])]; if (o) { n++; if (o.type !== 'normal' && o.type !== 'start') bad = true; } } if (n >= minN && n <= maxN && !bad) out.push([x, y]); }
    return out; }
  function attach(x, y, type, secret) {
    var c = { gx: x, gy: y, type: type, doors: {}, hidden: {}, seen: false, visited: false, pick: [], peds: [], chests: [], tiles: layTiles(LAYOUTS[0], false), ph: {}, locked: 0, cleared: type !== 'challenge' && type !== 'miniboss' };
    F.cells[key(x, y)] = c; F.list.push(c);
    for (var d in DV) { var o = F.cells[key(x + DV[d][0], y + DV[d][1])]; if (!o || o === c) continue; if (secret) { c.doors[d] = o; o.hidden = o.hidden || {}; o.hidden[OPP[d]] = c; } else { c.doors[d] = o; o.doors[OPP[d]] = c; } if (!secret) break; }
    fillRoom(c); return c;
  }
  var kinds = shuffle(NEWROOMS.slice()).slice(0, 2 + (run.floor > 1 ? 1 : 0) + (run.floor > 3 ? 1 : 0));
  kinds.forEach(function (k) { var spots = freeNear(1, 1); if (spots.length) { var s = pick(spots); attach(s[0], s[1], k, false); } });
  var sec = freeNear(2, 4); if (sec.length) { var s2 = pick(sec); attach(s2[0], s2[1], 'secret', true); }
  return F;
}; })(genFloor);
function fillRoom(c) {
  var cx = IW / 2, cy = IH / 2;
  if (c.type === 'shrine') { c.peds.push({ x: cx - 50, y: cy + 6, item: rollItem(), pair: 1 }); c.peds.push({ x: cx + 50, y: cy + 6, item: rollItem(), pair: 1 }); }
  if (c.type === 'vault') { [-90, -30, 30, 90].forEach(function (dx, i) { c.chests.push({ x: cx + dx, y: cy + (i % 2 ? 20 : -10), gold: 1 }); }); c.tiles = layTiles(['.............', '..r.......r..', '.............', '.............', '.............', '..r.......r..', '.............'], false); }
  if (c.type === 'curse') { c.chests.push({ x: cx - 40, y: cy }); c.chests.push({ x: cx + 40, y: cy }); c.tiles = layTiles(['.............', '.s.........s.', '.............', '.............', '.............', '.s.........s.', '.............'], false); }
  if (c.type === 'arcade') { c.slot = { x: cx, y: cy - 6, pulls: 0 }; }
  if (c.type === 'sacrifice') { c.tiles = layTiles(['.............', '.............', '.............', '......s......', '.............', '.............', '.............'], false); c.sac = 0; }
  if (c.type === 'secret') { c.pick.push({ k: 'coin5', x: cx - 30, y: cy }); c.pick.push({ k: pick(['bomb', 'key', 'heart']), x: cx + 30, y: cy }); if (Math.random() < 0.5) c.peds.push({ x: cx, y: cy - 20, item: rollItem() }); else c.pick.push({ k: 'coin5', x: cx, y: cy + 24 }); }
  if (c.type === 'challenge') { c.wave = 0; c.tiles = layTiles(pick(GOODLAY), false); }
  if (c.type === 'miniboss') { c.tiles = layTiles(LAYOUTS[0], false); }
}
/* entering: the curse door bites, challenge and miniboss rooms fill up, dark rooms go dark */
enterRoom = (function (orig) { return function (c, fromDir) {
  orig(c, fromDir);
  if (c.type === 'secret') for (var sd in c.doors) { var so = c.doors[sd]; so.doors[OPP[sd]] = c; if (so.hidden) delete so.hidden[OPP[sd]]; }
  if (c.type === 'curse' && fromDir && !c.bit) { c.bit = 1; P.inv = 0; hurtP(1, 'the curse door'); pop(P.x, P.y - 40, 'THE DOOR BITES', '#ff2630'); }
  if (c.type === 'challenge' && !c.cleared) { c.wave = 0; spawnWave(c); banner = { t: 2.2, a: 'CHALLENGE', b: 'SURVIVE THREE WAVES' }; music.play(BOSSES[run.boss].song); }
  if (c.type === 'miniboss' && !c.cleared) { var k = run.F.pool.slice().sort(function (a, b) { return FOES[b].hp - FOES[a].hp; })[0], e = mkFoe(k, IW / 2, IH / 2 - 10); e.hp = e.mhp = e.hp * 9; e.r *= 1.8; e.sc = 1.8; e.elite = 1; foes.push(e); banner = { t: 2.2, a: 'A NASTY ONE', b: k.toUpperCase() }; music.play(BOSSES[run.boss].song); }
  if (c.type === 'normal' && !c.cleared && c.form) formation(c.form);
  if (c.type === 'arcade') banner = { t: 2.4, a: "POTBELLY'S CORNER", b: '"Cabinets are free, kid. Play all you like."' };
  if (c.type === 'shrine') banner = { t: 2.4, a: "SPERMAID'S SHRINE", b: 'TAKE ONE. THE OTHER GOES BACK' };
  if (c.type === 'vault') banner = { t: 2.2, a: 'THE VAULT', b: 'A KEY FOR EACH CHEST' };
  if (c.type === 'sacrifice') banner = { t: 2.2, a: 'SACRIFICE', b: 'BLEED ON THE SPIKES. IT PAYS' };
  if (c.type === 'secret' && !c.found) { c.found = 1; banner = { t: 2, a: 'A SECRET ROOM', b: '' }; sfx.play('power'); }
}; })(enterRoom);
function spawnWave(c) { var n = 3 + run.floor + c.wave * 2, pool = run.F.pool; for (var i = 0; i < n; i++) { var k = pick(pool), s = freeSpot(70); foes.push(mkFoe(k, s.x, s.y)); } fxPuff(IW / 2, IH / 2, '#ff2630', 20); }
function formation(f) { // rearrange the room's foes into a shape
  if (!foes.length) return; var n = foes.length;
  foes.forEach(function (e, i) { var a = i / n * 6.283;
    if (f === 'ring') { e.x = IW / 2 + Math.cos(a) * 110; e.y = IH / 2 + Math.sin(a) * 55; }
    else if (f === 'wall') { e.x = 60 + i * (IW - 120) / Math.max(1, n - 1); e.y = P.y < IH / 2 ? IH - 40 : 40; }
    else if (f === 'crowd') { e.x = IW / 2 + rnd(-30, 30); e.y = IH / 2 + rnd(-20, 20); }
    else if (f === 'ambush') { e.x = P.x + Math.cos(a) * 70; e.y = P.y + Math.sin(a) * 45; e.cd = 1.2; }
    e.x = clamp(e.x, 16, IW - 16); e.y = clamp(e.y, 16, IH - 16); if (blocked(e.x, e.y, e.r, e.f && e.f.ai === 'fly')) { var s = freeSpot(60); e.x = s.x; e.y = s.y; } });
  if (f === 'ambush') { banner = { t: 1.4, a: 'AMBUSH', b: '' }; sfx.play('roar'); }
}
roomClear = (function (orig) { return function () {
  if (room.type === 'challenge') { room.wave++; if (room.wave < 3) { spawnWave(room); banner = { t: 1.4, a: 'WAVE ' + (room.wave + 1), b: '' }; return; } room.cleared = true; sfx.play('win'); room.peds.push({ x: IW / 2, y: IH / 2, item: rollItem() }); music.play(run.F.song); return; }
  if (room.type === 'miniboss') { room.cleared = true; sfx.play('win'); room.peds.push({ x: IW / 2, y: IH / 2, item: rollItem() }); room.pick.push({ k: 'coin5', x: IW / 2 + 40, y: IH / 2 + 20 }); music.play(run.F.song); return; }
  orig();
}; })(roomClear);
/* the rooms' own things to touch, each step */
updShots = (function (orig) { return function (dt) {
  orig(dt);
  if (G.mode !== 'play' || !room) return;
  // a bomb by the right wall opens the way to a secret room
  fx.forEach(function (bm) { if (bm.k !== 'boom' || bm.chk) return; bm.chk = 1; if (!room.hidden) return;
    for (var d in room.hidden) { var dp = DOORPOS[d]; if (Math.hypot(bm.x - clamp(dp.x, 0, IW), bm.y - clamp(dp.y, 0, IH)) < 70) { room.doors[d] = room.hidden[d]; room.doors[d].doors[OPP[d]] = room; room.doors[d].seen = true; delete room.hidden[d]; sfx.play('door'); pop(clamp(dp.x, 20, IW - 20), clamp(dp.y, 20, IH - 20), 'A SECRET!', '#ffe36a'); } } });
  // shrine: take one, the other goes
  if (room.type === 'shrine' && room.peds.some(function (p) { return p.pair && !p.item; })) room.peds.forEach(function (p) { if (p.pair && p.item) { fxPuff(p.x, p.y - 14, '#f1e0b0', 10); p.item = null; } });
  // chests: the vault's need a key each, the curse room's open with a touch
  (room.chests || []).forEach(function (ch) { if (ch.open || Math.hypot(P.x - ch.x, P.y - ch.y) > 16) return;
    if (ch.gold) { if (P.keys <= 0) { if (!ch.msg || KIT.t - ch.msg > 1.2) { ch.msg = KIT.t; pop(ch.x, ch.y - 30, 'NEED A KEY', '#a6968f'); } return; } P.keys--; }
    ch.open = 1; sfx.play('power'); var r = Math.random();
    if (r < (ch.gold ? 0.3 : 0.45)) room.peds.push({ x: ch.x, y: ch.y + 24, item: rollItem() }); else { room.pick.push({ k: 'coin5', x: ch.x - 10, y: ch.y + 20 }); room.pick.push({ k: pick(['heart', 'bomb', 'key', 'shield', 'coin']), x: ch.x + 10, y: ch.y + 20 }); } });
  // Potbelly's slot machine: a coin a pull
  var sl = room.slot; if (sl && Math.hypot(P.x - sl.x, P.y - sl.y) < 20) { if (!sl.cd || run.t > sl.cd) { sl.cd = run.t + 0.8; if (P.coins <= 0) pop(sl.x, sl.y - 40, 'A COIN A PULL', '#a6968f'); else { P.coins--; sl.pulls++; sl.spin = 0.6; sl.q = Math.random(); sfx.play('tick'); } } }
  if (sl && sl.spin > 0) { sl.spin -= dt; if (sl.spin <= 0) { var q = sl.q; if (q < 0.02) { room.peds.push({ x: sl.x, y: sl.y + 40, item: rollItem() }); pop(sl.x, sl.y - 40, 'JACKPOT', '#ffe36a'); sfx.play('win'); } else if (q < 0.25) { room.pick.push({ k: 'coin5', x: sl.x + rnd(-30, 30), y: sl.y + 34 }); sfx.play('coin'); } else if (q < 0.4) { room.pick.push({ k: pick(['heart', 'bomb', 'key']), x: sl.x + rnd(-30, 30), y: sl.y + 34 }); sfx.play('coin'); } else if (q < 0.47) { var f = mkFoe(pick(run.F.pool), sl.x + 40, sl.y + 30); foes.push(f); room.cleared = false; pop(sl.x, sl.y - 40, 'BUST', '#ff2630'); } else pop(sl.x, sl.y - 40, 'NOTHING', '#a6968f'); } }
}; })(updShots);
/* the sacrifice spikes: every time they cut you, they pay more */
hurtP = (function (orig) { return function (n, by) { var hp0 = P.hp + P.shield; orig(n, by);
  if (room && room.type === 'sacrifice' && by === 'spikes' && P.hp + P.shield < hp0 && G.mode === 'play') { room.sac++; var n = room.sac;
    if (n === 1 || n === 2) room.pick.push({ k: 'coin', x: IW / 2 + rnd(-40, 40), y: IH / 2 + 30 }); else if (n === 3) room.pick.push({ k: 'coin5', x: IW / 2, y: IH / 2 + 34 }); else if (n === 4) room.pick.push({ k: 'key', x: IW / 2 + 30, y: IH / 2 + 30 }); else if (n === 5) room.peds.push({ x: IW / 2, y: IH / 2 - 40, item: rollItem() }); else if (n === 6) room.pick.push({ k: 'shield', x: IW / 2, y: IH / 2 + 34 });
    pop(IW / 2, IH / 2 - 30, 'SACRIFICE ' + n, '#ff2630'); }
}; })(hurtP);
/* drawing the new things */
drawRoom = (function (orig) { return function () {
  orig();
  var T = room.tiles, pit = function (x, y) { return T[y] && T[y][x] === 5; };
  for (var cy = 0; cy < ROWS; cy++) for (var cx = 0; cx < COLS; cx++) if (pit(cx, cy)) { var x = IX0 + cx * TS, y = IY0 + cy * TS;
    R('#050203', x, y, TS, TS); // the drop: hard bands getting darker the deeper you look
    if (!pit(cx, cy - 1)) { R(run.F.wall, x, y, TS, 7); R('rgba(0,0,0,0.35)', x, y + 3, TS, 4); R('#12040a', x, y + 7, TS, 2); R('#1a0a0e', x, y + 9, TS, 4); }
    if (!pit(cx - 1, cy)) { R('#12040a', x, y, 2, TS); R('#1a0a0e', x + 2, y, 2, TS); }
    if (!pit(cx + 1, cy)) { R('#12040a', x + TS - 2, y, 2, TS); R('#1a0a0e', x + TS - 4, y, 2, TS); }
    if (!pit(cx, cy + 1)) { R('#12040a', x, y + TS - 2, TS, 2); R('rgba(255,255,255,0.08)', x, y + TS - 3, TS, 1); }
    if ((cx * 7 + cy * 3) % 5 === 0) R('#2a1418', x + 9 + (cx % 3) * 3, y + 16, 2, 2); }
  // door marks for the new rooms
  for (var d in room.doors) { var nb = room.doors[d], dp = DOORPOS[d], x2 = IX0 + dp.x, y2 = IY0 + dp.y, t = nb.type === 'secret' || room.type === 'secret' ? 'secret' : nb.type;
    if (t === 'curse') { for (var k = -2; k <= 2; k++) R('#ff2630', x2 + k * 5 - 1, y2 - 9 + (k % 2 ? 2 : 0), 2, 6); }
    else if (t === 'challenge' || t === 'miniboss') { R('#12040a', x2 - 6, y2 - 6, 12, 12); R(t === 'miniboss' ? '#ff9a30' : '#c4121c', x2 - 5, y2 - 5, 10, 10); R('#f1e7d0', x2 - 1, y2 - 4, 2, 8); R('#f1e7d0', x2 - 3, y2 + 1, 6, 1); }
    else if (t === 'arcade' || t === 'vault') spr(t === 'arcade' ? 'gr_coin' : 'gr_key', x2, y2 + 6, { sc: 0.9 });
    else if (t === 'shrine' || t === 'sacrifice') { R('#12040a', x2 - 5, y2 - 5, 10, 10); R(t === 'shrine' ? '#9adfff' : '#6a0a10', x2 - 4, y2 - 4, 8, 8); }
    else if (t === 'secret') { R('#12040a', x2 - 14, y2 - 10, 28, 20); R('#060203', x2 - 10, y2 - 7, 20, 14); for (var cr = 0; cr < 5; cr++) R('#5a4044', x2 - 14 + cr * 6, y2 - 10 + (cr % 2) * 16, 4, 3); } }
  // cracks in the wall hint at a secret room
  if (room.hidden) for (var h in room.hidden) { var hp2 = DOORPOS[h]; var hx = IX0 + hp2.x, hy = IY0 + hp2.y; R('#12040a', hx - 6, hy - 1, 5, 1); R('#12040a', hx - 2, hy - 3, 1, 4); R('#12040a', hx + 1, hy + 1, 6, 1); }
}; })(drawRoom);
drawWorld = (function (orig) { return function () {
  orig();
  (room.chests || []).forEach(function (ch) { spr(ch.open ? (ch.gold ? 'p_bigchestopen' : 'p_chestopen') : (ch.gold ? 'p_bigchest' : 'p_chest'), IX0 + ch.x, IY0 + ch.y + 8); });
  if (room.slot) { var sl = room.slot; spr('p_slot', IX0 + sl.x, IY0 + sl.y + 20); if (sl.spin > 0) for (var i = 0; i < 3; i++) R(['#ff2630', '#ffe36a', '#f1e7d0'][(Math.floor(KIT.t * 20) + i) % 3], IX0 + sl.x - 8 + i * 6, IY0 + sl.y - 8, 4, 5); spr('npc_potbelly', IX0 + sl.x + 40, IY0 + sl.y + 18); }
  if (room.type === 'shrine') spr('npc_spermaid', IX0 + IW / 2, IY0 + 74);
  if (room.type === 'sacrifice') text(String(room.sac || 0), IX0 + IW / 2, IY0 + IH / 2 - 34, { align: 'center', size: 8, col: '#ff2630' });
  // dark rooms: rings of light round Cumhead
  if (room.dark && !room.cleared) { var c = KIT.ctx, px = IX0 + P.x, py = IY0 + P.y - 10; c.save(); c.beginPath(); c.rect(IX0, IY0, IW, IH); c.arc(px, py, 60, 0, 6.3, true); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fill(); c.beginPath(); c.rect(IX0, IY0, IW, IH); c.arc(px, py, 100, 0, 6.3, true); c.fillStyle = 'rgba(0,0,0,0.45)'; c.fill(); c.restore(); }
}; })(drawWorld);
drawHud = (function (orig) { return function () {
  orig();
  var mx = 436, my = 44, cw = 7, ch = 6, IC = { challenge: '#c4121c', miniboss: '#ff9a30', arcade: '#ffe36a', curse: '#6a0a10', shrine: '#9adfff', vault: '#c8a050', sacrifice: '#ff6a74', secret: '#f1e7d0' };
  run.rooms.list.forEach(function (c) { if (!c.seen || !IC[c.type]) return; var x = mx + (c.gx - 4) * cw + 18, y = my + (c.gy - 4) * ch + 26; R('#12040a', x, y, cw, ch); R(c === room ? '#f1e7d0' : '#3a2a2e', x + 1, y + 1, cw - 2, ch - 2); R(IC[c.type], x + 2, y + 2, cw - 4, ch - 4); });
}; })(drawHud);
window.__gr.enterRoom = function (c, d) { enterRoom(c, d); }; window.__gr.hurtP = function (n, b) { hurtP(n, b); }; window.__gr.joined = joined; window.__gr.GOODLAY = GOODLAY;
