/* =====================================================================================================
   THE GRINDING OF CUMHEAD: a Binding of Isaac style dungeon crawl through Blumhead's Lair.
   Six floors of rooms. The doors shut until every foe in the room is dead. Find the treasure room and
   the shop, then the boss room: a random boss from the other games waits at the end of each floor,
   and Blumhead himself at the bottom of the sixth. Move with the left stick / WASD, shoot cream in four
   directions with the face buttons / arrow keys, drop bombs with LB / E.
   ===================================================================================================== */
var W = 480, H = 270, TS = 26, COLS = 13, ROWS = 7, WALL = 18, RX = 53, RY = 40, IX0 = RX + WALL, IY0 = RY + WALL, IW = COLS * TS, IH = ROWS * TS;
var SV = KIT.load('gr-save', null) || { best: 0, wins: 0, runs: 0, seen: {} };
function persist() { KIT.save('gr-save', SV); }
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'sup', ArrowDown: 'sdown', KeyJ: 'sleft', KeyL: 'sright', KeyI: 'sup', KeyK: 'sdown', KeyE: 'bomb', Space: 'bomb', KeyZ: 'none', KeyX: 'none', KeyC: 'none', KeyV: 'none' });

var FLOORS = [
  { name: 'The Cell Block', floor: '#2a1c20', tile: '#33242a', wall: '#4e3c40', song: 'dungeon', pool: ['bat', 'crawler', 'slime', 'rat', 'ghoul'] },
  { name: 'The Goo Pits', floor: '#2a2418', tile: '#352c1e', wall: '#5a4a32', song: 'sewer', pool: ['creamblob', 'slime', 'blumling', 'imp', 'cultrat', 'bat'] },
  { name: 'The Flesh Halls', floor: '#2a0a1e', tile: '#341026', wall: '#5a1a3a', song: 'lair', pool: ['blumeye', 'blumling', 'blumspore', 'wraith', 'ghoul', 'batP'] },
  { name: 'The Furnace Gut', floor: '#2a0e06', tile: '#36140a', wall: '#6a2a10', song: 'furnace', pool: ['magmaslug', 'emberbat', 'slimeR', 'imp', 'golem'] },
  { name: 'The Bone Vault', floor: '#24201a', tile: '#2e2820', wall: '#6a604e', song: 'bone', pool: ['skeleton', 'bonehound', 'wraith', 'crow', 'vampire'] },
  { name: "Blumhead's Heart", floor: '#200410', tile: '#2c0618', wall: '#7a1a3a', song: 'moonarea', pool: ['blumeye', 'blumling', 'vampire', 'blumspore', 'imp', 'wraith', 'skeleton'] }
];
/* foes. dmg is in half hearts */
var FOES = {
  bat: { s: 'f_bat_', nf: 4, hp: 6, spd: 70, r: 8, ai: 'fly', dmg: 1 }, batP: { s: 'f_batP_', nf: 4, hp: 8, spd: 85, r: 8, ai: 'fly', dmg: 1 },
  crawler: { s: 'f_crawler_', nf: 4, hp: 10, spd: 40, r: 10, ai: 'chase', dmg: 1 }, slime: { s: 'f_slime_', nf: 4, hp: 12, spd: 110, r: 8, ai: 'hop', dmg: 1, split: 1 },
  slimeR: { s: 'f_slimeR_', nf: 4, hp: 14, spd: 120, r: 8, ai: 'hop', dmg: 2, split: 1 }, creamblob: { s: 'f_creamblob_', nf: 4, hp: 14, spd: 110, r: 9, ai: 'hop', dmg: 1, split: 1 },
  rat: { s: 'f_rat_', nf: 4, hp: 4, spd: 120, r: 7, ai: 'wander', dmg: 1, pack: 3 }, ghoul: { s: 'f_ghoul_', nf: 4, hp: 18, spd: 35, r: 9, ai: 'charge', dmg: 2 },
  imp: { s: 'f_imp_', nf: 4, hp: 10, spd: 50, r: 8, ai: 'shoot', dmg: 1, fly: 1, shot: 'f' }, blumling: { s: 'f_blumling_', nf: 4, hp: 10, spd: 125, r: 8, ai: 'hop', dmg: 1 },
  blumeye: { s: 'f_blumeye_', nf: 3, hp: 14, spd: 40, r: 10, ai: 'shoot', dmg: 1, fly: 1, shot: 'p', burst: 3 }, blumspore: { s: 'f_blumspore_', nf: 3, hp: 18, spd: 0, r: 10, ai: 'ring', dmg: 1, shot: 'p' },
  wraith: { s: 'f_wraith_', nf: 4, hp: 14, spd: 45, r: 9, ai: 'phase', dmg: 1, fly: 1 }, magmaslug: { s: 'f_magmaslug_', nf: 4, hp: 26, spd: 22, r: 11, ai: 'trail', dmg: 1 },
  emberbat: { s: 'f_emberbat_', nf: 4, hp: 9, spd: 90, r: 8, ai: 'fly', dmg: 1 }, golem: { s: 'f_golem_', nf: 4, hp: 40, spd: 28, r: 13, ai: 'charge', dmg: 2 },
  skeleton: { s: 'f_skeleton_', nf: 3, hp: 16, spd: 30, r: 8, ai: 'shoot', dmg: 1, shot: 'c', spread: 1 }, bonehound: { s: 'f_bonehound_', nf: 3, hp: 14, spd: 50, r: 10, ai: 'charge', dmg: 1 },
  crow: { s: 'f_crow_', nf: 4, hp: 6, spd: 100, r: 7, ai: 'fly', dmg: 1 }, vampire: { s: 'f_vampire_', nf: 4, hp: 22, spd: 0, r: 9, ai: 'tele', dmg: 2, shot: 'r' },
  cultrat: { s: 'f_cultrat_', nf: 3, hp: 12, spd: 40, r: 8, ai: 'shoot', dmg: 1, shot: 'c' }
};
var BOSSES = {
  beast: { n: 'Cum-starved Beast', s: 'f_beast_', hp: 220, spd: 60, moves: ['charge', 'charge', 'summon', 'aim'], summon: 'bat', song: 'bbeast' },
  demon: { n: 'Legion of Semen Demon', s: 'f_demon_', hp: 60, spd: 0, moves: ['aim', 'ring'], count: 4, song: 'bdemon' },
  sperm: { n: 'The Sperminator', s: 'f_sperm_', hp: 260, spd: 40, moves: ['burst', 'homing', 'charge', 'burst'], song: 'bsperm' },
  pig: { n: 'Brothers Load Piggy', s: 'f_pig_', hp: 260, spd: 50, moves: ['charge', 'coins', 'slam'], song: 'bpig' },
  ratking: { n: 'Cult of the Rat', s: 'f_ratking_', hp: 260, spd: 45, moves: ['summon', 'ring', 'charge'], summon: 'rat', song: 'brat' },
  boner: { n: 'The Big Boner', s: 'f_boner_', hp: 280, spd: 35, moves: ['spread', 'slam', 'spread'], song: 'bboner' },
  hotload: { n: 'The Hot Load', s: 'f_hotload_', hp: 300, spd: 30, moves: ['slam', 'aim', 'slam', 'ring'], fire: 1, song: 'bhot' },
  moon: { n: 'The Crimson Moon', s: 'f_moon_', hp: 320, spd: 0, moves: ['beams', 'rain', 'ring'], fly: 1, song: 'bmoon' },
  blum: { n: 'Blumhead', s: 'f_blum_', hp: 520, spd: 0, moves: ['ring', 'aim', 'spiral', 'summon', 'slam', 'rain'], fly: 1, summon: 'blumling', song: 'blum' }
};
/* items: everyone's stuff */
var ITEMS = [
  { id: 'cup', n: 'Cumpuccino', d: 'Tears up', f: function (s) { s.rate += 0.6; } },
  { id: 'chilli', n: 'Willy Chilli', d: 'Damage up', f: function (s) { s.dmgAdd += 1; } },
  { id: 'dchilli', n: 'Dynamite Willy Chilli', d: 'Damage way up', f: function (s) { s.dmgMul *= 1.4; } },
  { id: 'pizza', n: 'Pineapple Pizza', d: 'Health up. "Fight me."', f: function (s) { s.hpMax += 2; }, now: function () { heal(99); } },
  { id: 'bread', n: 'Garlic Bread', d: 'Health up', f: function (s) { s.hpMax += 2; }, now: function () { heal(4); } },
  { id: 'tea', n: 'Mad Tea', d: 'Range and shot speed up', f: function (s) { s.range += 0.25; s.ss += 0.2; } },
  { id: 'pill', n: "TB's Silly Pill", d: 'Who knows?', f: function (s, it) { var r = it.roll; if (r === 0) s.dmgAdd += 1.2; else if (r === 1) s.rate += 0.8; else if (r === 2) s.spd += 0.2; else if (r === 3) s.range -= 0.2; else s.spd -= 0.1; } },
  { id: 'pie', n: "Greebo's Cream Pie", d: 'Big tears, damage up', f: function (s) { s.big = 1; s.dmgAdd += 0.7; } },
  { id: 'lotion', n: 'Lotion', d: 'Slow, heavy tears', f: function (s) { s.ss -= 0.25; s.range += 0.3; s.dmgAdd += 0.6; } },
  { id: 'shell', n: "Spermaid's Shell", d: 'Homing tears', f: function (s) { s.homing = 1; } },
  { id: 'tin', n: "Greebo's Pie Tin", d: 'Triple shot', f: function (s) { s.triple = 1; s.rateMul *= 0.8; } },
  { id: 'egg', n: 'Homunculus Egg', d: 'A baby homunculus fights with you', f: function (s) { s.pets += 1; } },
  { id: 'fang', n: 'Bloodmoon Fang', d: 'Kills sometimes heal', f: function (s) { s.steal = 1; s.dmgAdd += 0.3; } },
  { id: 'cards', n: 'Stacked Deck', d: 'Luck up', f: function (s) { s.luck += 1; } },
  { id: 'phones', n: "Pulsar's Headphones", d: 'Piercing tears', f: function (s) { s.pierce = 1; } },
  { id: 'robe', n: "Master Bates' Robe", d: 'Range and tears up', f: function (s) { s.range += 0.4; s.rate += 0.3; } },
  { id: 'charm', n: "Saba's Hitless Charm", d: 'Blocks the first hit in each room', f: function (s) { s.ward = 1; } },
  { id: 'balloon', n: 'Steve Balloon', d: 'Float over spikes. Speed up', f: function (s) { s.fly = 1; s.spd += 0.1; } },
  { id: 'sword', n: "Nattyboro's Edge", d: 'Critical hits', f: function (s) { s.crit += 0.15; } },
  { id: 'scales', n: "Judgement's Scales", d: 'Double shot', f: function (s) { s.double = 1; } },
  { id: 'pineapple', n: "Joff's Pineapple", d: 'Damage and speed up', f: function (s) { s.dmgAdd += 0.5; s.spd += 0.1; } },
  { id: 'pint', n: "Uncle Beeb's Pint", d: 'Heal a little when a room is cleared', f: function (s) { s.regen = 1; } },
  { id: 'espresso', n: "Kaya's Espresso", d: 'Tears way up', f: function (s) { s.rate += 1; } },
  { id: 'tongs', n: "Elden's Grill Tongs", d: 'Burning tears', f: function (s) { s.burn = 1; } },
  { id: 'garlic', n: "Ali's Garlic", d: 'Poison tears', f: function (s) { s.poison = 1; } },
  { id: 'boot', n: "Bonjo's Boot", d: 'Speed up', f: function (s) { s.spd += 0.2; } },
  { id: 'boa', n: "T's Feather Boa", d: 'Tears can charm', f: function (s) { s.charm = 1; } },
  { id: 'token', n: 'Potbelly Token', d: 'Coins count double', f: function (s) { s.coin2 = 1; }, now: function () { P.coins += 5; } },
  { id: 'moon', n: 'The Red Moon', d: 'Red tears. Damage up', f: function (s) { s.dmgMul *= 1.25; s.red = 1; } },
  { id: 'dice', n: "Stacked Fate's Die", d: 'Two random stats up', f: function (s, it) { [it.roll % 4, (it.roll + 2) % 4].forEach(function (r) { if (r === 0) s.dmgAdd += 0.6; else if (r === 1) s.rate += 0.5; else if (r === 2) s.spd += 0.12; else s.range += 0.25; }); } },
  { id: 'vial', n: 'Blood Vial', d: 'Health and damage up', f: function (s) { s.hpMax += 2; s.dmgAdd += 0.5; }, now: function () { heal(2); } },
  { id: 'eye', n: "Peeper's Third Eye", d: 'Tears pass through rocks', f: function (s) { s.spectral = 1; s.range += 0.15; } }
];
var ITEM = {}; ITEMS.forEach(function (it) { ITEM[it.id] = it; });

/* room layouts: r rock, p cream pile, s spikes, . floor. Door tiles (middle of each edge) are always kept clear */
var LAYOUTS = [
  ['.............', '.............', '.............', '.............', '.............', '.............', '.............'],
  ['.............', '..r.......r..', '.............', '.....ppp.....', '.............', '..r.......r..', '.............'],
  ['.............', '.rr.......rr.', '.r.........r.', '.............', '.r.........r.', '.rr.......rr.', '.............'],
  ['.............', '....r...r....', '....r...r....', '.............', '....r...r....', '....r...r....', '.............'],
  ['.............', '.............', '...rrr.rrr...', '.............', '...rrr.rrr...', '.............', '.............'],
  ['.............', '..p.......p..', '.............', '....s...s....', '.............', '..p.......p..', '.............'],
  ['.............', '.....r.r.....', '...r.....r...', '..r...p...r..', '...r.....r...', '.....r.r.....', '.............'],
  ['.............', '.ss.......ss.', '.............', '.............', '.............', '.ss.......ss.', '.............'],
  ['.............', '...p.....p...', '..ppp...ppp..', '.............', '..ppp...ppp..', '...p.....p...', '.............'],
  ['.............', '.r.r.r.r.r.r.', '.............', '.............', '.............', '.r.r.r.r.r.r.', '.............'],
  ['.............', '.............', '..rrr...rrr..', '..r.r...r.r..', '..rrr...rrr..', '.............', '.............'],
  ['.............', '..s.......s..', '..s..rrr..s..', '.............', '..s..rrr..s..', '..s.......s..', '.............'],
  ['.............', '.p.........p.', '..r.......r..', '.............', '..r.......r..', '.p.........p.', '.............'],
  ['.............', '.............', '.....sss.....', '....s.r.s....', '.....sss.....', '.............', '.............']
];
var DOORPOS = { u: { x: IW / 2, y: -WALL / 2 }, d: { x: IW / 2, y: IH + WALL / 2 }, l: { x: -WALL / 2, y: IH / 2 }, r: { x: IW + WALL / 2, y: IH / 2 } };
var DV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }, OPP = { u: 'd', d: 'u', l: 'r', r: 'l' };

var G = { mode: 'title' }, P, S, run, room, foes, tears, eshots, pickups, bombs, fx, pops, pets, banner;

/* ---------- a run and its floors ---------- */
function newRun() {
  run = { floor: 0, items: [], bossesDone: [], t: 0, kills: 0 };
  P = { x: IW / 2, y: IH / 2 + 30, vx: 0, vy: 0, hp: 6, coins: 0, bombs: 1, keys: 1, shield: 0, inv: 0, cd: 0, face: 'd', walk: 0, wardUsed: false };
  calc(); SV.runs++; persist(); newFloor(0);
}
function newFloor(n) {
  run.floor = n; var F = FLOORS[n], rooms, tries = 0;
  do { rooms = genFloor(8 + n * 2); } while (!rooms && tries++ < 50);
  run.rooms = rooms; run.F = F;
  var bossPool = Object.keys(BOSSES).filter(function (b) { return b !== 'blum' && run.bossesDone.indexOf(b) < 0; });
  run.boss = n === 5 ? 'blum' : pick(bossPool);
  enterRoom(rooms.start, null);
  G.mode = 'play'; banner = { t: 3, a: 'FLOOR ' + (n + 1), b: F.name.toUpperCase() }; music.play(F.song);
  if (n + 1 > SV.best) { SV.best = n + 1; persist(); }
}
function genFloor(N) {
  var cells = {}, list = [], key = function (x, y) { return x + ',' + y; };
  function add(x, y) { var c = { gx: x, gy: y, type: 'normal' }; cells[key(x, y)] = c; list.push(c); return c; }
  function nbrs(x, y) { var n = 0; for (var d in DV) if (cells[key(x + DV[d][0], y + DV[d][1])]) n++; return n; }
  var start = add(4, 4); start.type = 'start';
  var guard = 0;
  while (list.length < N && guard++ < 2000) {
    var c = pick(list), d = pick(['u', 'd', 'l', 'r']), x = c.gx + DV[d][0], y = c.gy + DV[d][1];
    if (x < 0 || y < 0 || x > 8 || y > 8 || cells[key(x, y)] || nbrs(x, y) > 1 || (Math.random() < 0.5 && list.length > 1 && c === start)) continue;
    add(x, y);
  }
  if (list.length < N) return null;
  // distance from the start
  var dist = {}, q = [start]; dist[key(4, 4)] = 0;
  while (q.length) { var cc = q.shift(); for (var dd in DV) { var k2 = key(cc.gx + DV[dd][0], cc.gy + DV[dd][1]); if (cells[k2] && dist[k2] === undefined) { dist[k2] = dist[key(cc.gx, cc.gy)] + 1; q.push(cells[k2]); } } }
  var ends = list.filter(function (c) { return c !== start && nbrs(c.gx, c.gy) === 1; }).sort(function (a, b) { return dist[key(b.gx, b.gy)] - dist[key(a.gx, a.gy)]; });
  if (ends.length < 3) return null;
  ends[0].type = 'boss'; ends[1].type = 'treasure'; ends[2].type = 'shop';
  list.forEach(function (c) {
    c.doors = {}; for (var d2 in DV) { var o = cells[key(c.gx + DV[d2][0], c.gy + DV[d2][1])]; if (o) c.doors[d2] = o; }
    c.cleared = c.type !== 'normal' && c.type !== 'boss'; c.seen = false; c.visited = false; c.pick = []; c.peds = [];
    c.locked = (c.type === 'shop' || (c.type === 'treasure' && run.floor > 0)) ? 1 : 0;
    var lay = c.type === 'normal' ? pick(LAYOUTS.slice(1)) : LAYOUTS[0], flip = Math.random() < 0.5;
    c.tiles = lay.map(function (row) { var r = row.split(''); if (flip) r.reverse(); return r.map(function (ch) { return ch === 'r' ? 1 : ch === 'p' ? 3 : ch === 's' ? 4 : 0; }); });
    c.ph = {}; // pile health
    if (c.type === 'treasure') c.peds.push({ x: IW / 2, y: IH / 2, item: rollItem() });
    if (c.type === 'shop') { c.peds.push({ x: IW / 2 - 60, y: IH / 2 + 10, item: rollItem(), price: 15 }); c.peds.push({ x: IW / 2 + 60, y: IH / 2 + 10, item: rollItem(), price: 15 });
      c.pick.push({ k: pick(['heart', 'bomb', 'key']), x: IW / 2, y: IH / 2 + 30, price: 5 }); }
  });
  return { list: list, cells: cells, start: start };
}
function rollItem() { var have = run.items.concat(run.offered || []); var pool = ITEMS.filter(function (it) { return have.indexOf(it.id) < 0; }); if (!pool.length) pool = ITEMS; var it = pick(pool); (run.offered = run.offered || []).push(it.id); return it.id; }

/* ---------- stats from items ---------- */
function calc() {
  var s = { dmgAdd: 0, dmgMul: 1, rate: 2.7, rateMul: 1, range: 0.75, ss: 0, spd: 1, hpMax: 6, pets: 0, luck: 0, crit: 0 };
  run && run.items.forEach(function (id, i) { ITEM[id].f(s, { roll: (run.rolls || [])[i] || 0 }); });
  s.dmg = (3.5 + s.dmgAdd) * s.dmgMul; s.fire = Math.min(9, Math.max(0.8, s.rate * s.rateMul)); s.life = Math.max(0.35, s.range); s.tsp = 230 * Math.max(0.5, 1 + s.ss); s.speed = Math.min(190, 105 * Math.max(0.6, s.spd));
  s.hpMax = Math.min(24, s.hpMax); S = s; if (P) P.hp = Math.min(P.hp, S.hpMax);
}
function heal(n) { P.hp = Math.min(S.hpMax, P.hp + n); }
function takeItem(id) {
  run.items.push(id); (run.rolls = run.rolls || []).push(rndi(0, 4)); SV.seen[id] = 1; persist(); var it = ITEM[id]; calc(); if (it.now) it.now();
  if (it.f.length > 0 && id === 'egg') spawnPet();
  banner = { t: 3, a: it.n.toUpperCase(), b: it.d, icon: 'it_' + id }; sfx.play('power');
}
function spawnPet() { var br = pick(['gloop', 'ember', 'frost', 'volt', 'blood', 'goldie', 'scout', 'titan', 'leech', 'medic', 'guard']); pets.push({ k: 'h_' + br + '_baby_idle0', a: Math.random() * 6, cd: 0 }); }

/* ---------- rooms ---------- */
function enterRoom(c, fromDir) {
  room = c; c.visited = true; c.seen = true; for (var d in c.doors) c.doors[d].seen = true;
  foes = []; tears = []; eshots = []; bombs = []; fx = []; pops = []; P.wardUsed = false;
  if (!pets) pets = [];
  if (fromDir) { var dp = DOORPOS[OPP[fromDir]]; P.x = clamp(dp.x, 14, IW - 14) - DV[OPP[fromDir]][0] * 22; P.y = clamp(dp.y, 14, IH - 10) - DV[OPP[fromDir]][1] * 26; if (OPP[fromDir] === 'd') P.y = IH - 22; if (OPP[fromDir] === 'u') P.y = 30; }
  P.vx = P.vy = 0; P.inv = Math.max(P.inv, 0.3);
  if (!c.cleared && c.type === 'normal') spawnFoes(c);
  if (c.type === 'boss' && !c.cleared) spawnBoss();
  if (c.type === 'boss' && !c.cleared) music.play(BOSSES[run.boss].song);
  else if (c.type !== 'boss') music.play(run.F.song);
  G.fadeIn = 0.25;
}
function freeSpot(minD) {
  for (var t = 0; t < 60; t++) { var cx = rndi(1, COLS - 2), cy = rndi(1, ROWS - 2); if (room.tiles[cy][cx]) continue; var x = cx * TS + TS / 2, y = cy * TS + TS / 2; if (Math.hypot(x - P.x, y - P.y) < (minD || 90)) continue; return { x: x, y: y }; }
  return { x: IW / 2, y: IH / 2 };
}
function spawnFoes(c) {
  var n = 2 + Math.floor(run.floor * 0.6) + rndi(0, 2), pool = run.F.pool;
  for (var i = 0; i < n; i++) { var k = pick(pool), f = FOES[k], s = freeSpot(); for (var p = 0; p < (f.pack || 1); p++) foes.push(mkFoe(k, s.x + p * 10, s.y + p * 6)); }
}
function mkFoe(k, x, y, mini) {
  var f = FOES[k], hp = f.hp * (1 + 0.35 * run.floor) * (mini ? 0.5 : 1);
  return { k: k, f: f, x: x, y: y, vx: 0, vy: 0, r: f.r * (mini ? 0.7 : 1), hp: hp, mhp: hp, t: Math.random() * 3, cd: 1 + Math.random() * 1.5, st: 'go', flash: 0, mini: mini, face: 1, burn: 0, poison: 0, charm: 0, sc: mini ? 0.75 : 1 };
}
function spawnBoss() {
  var B = BOSSES[run.boss], hp = B.hp * (1 + 0.45 * run.floor);
  if (B.count) { for (var i = 0; i < B.count; i++) { var b = mkBossE(run.boss, IW / 2 + Math.cos(i * 1.57) * 80, IH / 2 + Math.sin(i * 1.57) * 50, hp / 1.6); b.slot = i; foes.push(b); } }
  else foes.push(mkBossE(run.boss, IW / 2, IH / 2 - 20, hp));
  G.bossIntro = 2.2; sfx.play('roar');
}
function mkBossE(id, x, y, hp) {
  var B = BOSSES[id], sz = KIT.size(B.s + '0');
  return { boss: id, B: B, x: x, y: y, vx: 0, vy: 0, r: Math.max(12, Math.min(sz.w, sz.h) * 0.36), w: sz.w, h: sz.h, hp: hp, mhp: hp, t: 0, cd: 1.6, st: 'idle', flash: 0, face: 1, burn: 0, poison: 0, charm: 0, sc: 1, z: 0 };
}
function tileAt(x, y) { var cx = Math.floor(x / TS), cy = Math.floor(y / TS); if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return 1; return room.tiles[cy][cx]; }
function solidT(t) { return t === 1 || t === 3; }
function blocked(x, y, r, fly) {
  if (x - r < 0 || y - r < 0 || x + r > IW || y + r > IH) return true; if (fly) return false;
  return solidT(tileAt(x - r, y - r)) || solidT(tileAt(x + r, y - r)) || solidT(tileAt(x - r, y + r)) || solidT(tileAt(x + r, y + r));
}
function moveBody(b, dx, dy, r, fly) { if (!blocked(b.x + dx, b.y, r, fly)) b.x += dx; else b.hitX = true; if (!blocked(b.x, b.y + dy, r, fly)) b.y += dy; else b.hitY = true; }
function roomClear() {
  room.cleared = true; sfx.play('door'); P.wardUsed = false;
  if (S.regen && Math.random() < 0.4) { heal(1); pop(P.x, P.y - 40, '+HEALTH', '#ff6a74'); }
  if (room.type === 'normal' && Math.random() < 0.45 + S.luck * 0.12) room.pick.push({ k: pick(['heart', 'coin', 'coin', 'bomb', 'key', 'coin5', 'shield']), x: IW / 2, y: IH / 2 });
  if (room.type === 'boss') {
    run.bossesDone.push(run.boss); room.pick.push({ k: 'heart', x: IW / 2 - 40, y: IH / 2 + 30 }); room.pick.push({ k: 'heart', x: IW / 2 + 40, y: IH / 2 + 30 });
    if (run.floor === 5) { win(); return; }
    room.peds.push({ x: IW / 2, y: IH / 2 - 40, item: rollItem() }); room.trap = { x: IW / 2, y: IH / 2 + 50 };
    banner = { t: 3, a: BOSSES[run.boss].n.toUpperCase(), b: 'IS DOWN. THE WAY DOWN IS OPEN' }; music.play(run.F.song); sfx.play('win');
  }
}

/* ---------- the player ---------- */
var SHOOT = { sleft: [-1, 0], sright: [1, 0], sup: [0, -1], sdown: [0, 1] };
function updPlayer(dt) {
  var ix = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0), iy = (KIT.held('down') ? 1 : 0) - (KIT.held('up') ? 1 : 0), m = Math.hypot(ix, iy) || 1;
  var tx = ix / m * S.speed, ty = iy / m * S.speed;
  P.vx += (tx - P.vx) * Math.min(1, dt * 12); P.vy += (ty - P.vy) * Math.min(1, dt * 12);
  moveBody(P, P.vx * dt, P.vy * dt, 8, false); if (ix || iy) P.walk += dt;
  if (P.inv > 0) P.inv -= dt; P.cd -= dt;
  var sd = null; for (var k in SHOOT) if (KIT.held(k)) sd = k;
  if (sd) { P.face = sd; if (P.cd <= 0) { fire(SHOOT[sd]); P.cd = 1 / S.fire; } }
  else if (ix || iy) P.face = Math.abs(ix) >= Math.abs(iy) ? (ix > 0 ? 'sright' : 'sleft') : (iy > 0 ? 'sdown' : 'sup');
  if (KIT.pressed('bomb') && P.bombs > 0) { P.bombs--; bombs.push({ x: P.x, y: P.y, t: 1.5 }); sfx.play('tick'); }
  // spikes
  if (!S.fly && tileAt(P.x, P.y) === 4) hurtP(2, 'spikes');
  // doors
  for (var d in room.doors) {
    var dp = DOORPOS[d], near = d === 'u' || d === 'd' ? Math.abs(P.x - dp.x) < 14 : Math.abs(P.y - dp.y) < 14;
    var out = d === 'u' ? P.y < 12 : d === 'd' ? P.y > IH - 6 : d === 'l' ? P.x < 12 : P.x > IW - 12;
    if (near && out && KIT.held(d === 'u' ? 'up' : d === 'd' ? 'down' : d === 'l' ? 'left' : 'right')) {
      var nb = room.doors[d];
      if (!room.cleared) continue;
      if (nb.locked) { if (P.keys > 0) { P.keys--; nb.locked = 0; sfx.play('door'); pop(P.x, P.y - 40, 'UNLOCKED', '#ffe36a'); } else { if (!P.lockMsg || KIT.t - P.lockMsg > 1) { P.lockMsg = KIT.t; pop(P.x, P.y - 40, 'LOCKED. NEED A KEY', '#a6968f'); sfx.play('no'); } continue; } }
      enterRoom(nb, d); return;
    }
  }
  // pedestals and pickups
  room.peds.forEach(function (pd) {
    if (!pd.item || Math.hypot(P.x - pd.x, P.y - pd.y) > 16) return;
    if (pd.price) { if (P.coins < pd.price) { if (!pd.msgT || KIT.t - pd.msgT > 1.2) { pd.msgT = KIT.t; pop(pd.x, pd.y - 40, 'NEED ' + pd.price + ' COINS', '#a6968f'); } return; } P.coins -= pd.price; }
    takeItem(pd.item); pd.item = null;
  });
  room.pick = room.pick.filter(function (pk) {
    if (Math.hypot(P.x - pk.x, P.y - pk.y) > 14) return true;
    if (pk.price) { if (P.coins < pk.price) return true; }
    if (pk.k === 'heart' && P.hp >= S.hpMax) return true;
    if (pk.price) P.coins -= pk.price;
    if (pk.k === 'heart') { heal(2); sfx.play('magic'); } else if (pk.k === 'hearth') { heal(1); sfx.play('magic'); } else if (pk.k === 'shield') { P.shield += 2; sfx.play('magic'); }
    else if (pk.k === 'coin') { P.coins += S.coin2 ? 2 : 1; sfx.play('coin'); } else if (pk.k === 'coin5') { P.coins += S.coin2 ? 10 : 5; sfx.play('coin'); }
    else if (pk.k === 'bomb') { P.bombs++; sfx.play('select'); } else if (pk.k === 'key') { P.keys++; sfx.play('select'); }
    return false;
  });
  if (room.trap && Math.hypot(P.x - room.trap.x, P.y - room.trap.y) < 12) { room.trap = null; sfx.play('door'); G.fadeIn = 0.6; newFloor(run.floor + 1); }
}
function fire(d) {
  var sp = S.tsp, vx = d[0] * sp + P.vx * 0.3, vy = d[1] * sp + P.vy * 0.3, ox = P.x + d[0] * 6, oy = P.y - 16 + d[1] * 4;
  var shots = [[vx, vy, 0]];
  if (S.double) { var px = -d[1] * 5, py = d[0] * 5; shots = [[vx, vy, 1, px, py], [vx, vy, 1, -px, -py]]; }
  if (S.triple) { var a = Math.atan2(vy, vx); shots = shots.concat([[Math.cos(a - 0.22) * sp, Math.sin(a - 0.22) * sp], [Math.cos(a + 0.22) * sp, Math.sin(a + 0.22) * sp]]); }
  shots.forEach(function (s) { tears.push({ x: ox + (s[3] || 0), y: oy + (s[4] || 0), vx: s[0], vy: s[1], life: S.life, dmg: S.dmg, r: S.big ? 6 : 4, hit: {}, mine: 1 }); });
  sfx.play('shoot');
}
function hurtP(n, by) {
  if (P.inv > 0 || G.mode !== 'play') return;
  if (S.ward && !P.wardUsed) { P.wardUsed = true; P.inv = 1; pop(P.x, P.y - 40, 'BLOCKED', '#7af0ff'); sfx.play('magic'); return; }
  if (P.shield > 0) { var s = Math.min(P.shield, n); P.shield -= s; n -= s; }
  P.hp -= n; P.inv = 1; KIT.shake(6); sfx.play('hurt'); run.by = by;
  if (P.hp <= 0) die();
}

/* ---------- foes ---------- */
function updFoes(dt) {
  foes.forEach(function (e) {
    e.t += dt; if (e.flash > 0) e.flash -= dt;
    if (e.burn > 0) { e.burn -= dt; e.bT = (e.bT || 0) - dt; if (e.bT <= 0) { e.bT = 0.5; dmgFoe(e, S.dmg * 0.3, true); } }
    if (e.poison > 0) { e.poison -= dt; e.pT = (e.pT || 0) - dt; if (e.pT <= 0) { e.pT = 0.5; dmgFoe(e, S.dmg * 0.35, true); } }
    if (e.charm > 0) { e.charm -= dt; return; }
    if (e.boss) { bossAI(e, dt); return; }
    var f = e.f, dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, sp = f.spd * (1 + run.floor * 0.06);
    e.face = dx > 0 ? 1 : -1;
    if (f.ai === 'chase' || f.ai === 'trail') { moveBody(e, dx / d * sp * dt, dy / d * sp * dt, e.r, false); if (f.ai === 'trail') { e.cd -= dt; if (e.cd <= 0) { e.cd = 0.7; eshots.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: 3, r: 7, dmg: 1, k: 'f', puddle: 1 }); } } }
    else if (f.ai === 'fly') { var a = Math.atan2(dy, dx) + Math.sin(e.t * 3 + e.r) * 0.9; e.vx += Math.cos(a) * sp * 3 * dt; e.vy += Math.sin(a) * sp * 3 * dt; var v = Math.hypot(e.vx, e.vy); if (v > sp) { e.vx *= sp / v; e.vy *= sp / v; } moveBody(e, e.vx * dt, e.vy * dt, e.r, true); }
    else if (f.ai === 'phase') { moveBody(e, dx / d * sp * dt, dy / d * sp * dt, e.r, true); e.ghost = (e.t % 4) > 3; }
    else if (f.ai === 'hop') { e.cd -= dt; if (e.st === 'hop') { e.hopT -= dt; e.z = Math.sin((1 - e.hopT / 0.5) * Math.PI) * 14; moveBody(e, e.vx * dt, e.vy * dt, e.r, false); if (e.hopT <= 0) { e.st = 'go'; e.z = 0; } } else if (e.cd <= 0) { e.cd = 0.9 + Math.random() * 0.6; e.st = 'hop'; e.hopT = 0.5; e.vx = dx / d * sp; e.vy = dy / d * sp; } }
    else if (f.ai === 'wander') { e.cd -= dt; if (e.cd <= 0 || e.hitX || e.hitY) { e.cd = 0.6 + Math.random(); var a2 = Math.random() < 0.4 ? Math.atan2(dy, dx) : Math.random() * 6.28; e.vx = Math.cos(a2) * sp; e.vy = Math.sin(a2) * sp; e.hitX = e.hitY = false; } moveBody(e, e.vx * dt, e.vy * dt, e.r, false); }
    else if (f.ai === 'charge') {
      if (e.st === 'rush') { moveBody(e, e.vx * dt, e.vy * dt, e.r, false); e.st2 -= dt; if (e.st2 <= 0 || e.hitX || e.hitY) { e.st = 'go'; e.cd = 1.2; e.hitX = e.hitY = false; } }
      else { e.cd -= dt; moveBody(e, dx / d * sp * 0.6 * dt, dy / d * sp * 0.6 * dt, e.r, false); if (e.cd <= 0 && (Math.abs(dx) < 14 || Math.abs(dy) < 14)) { e.st = 'rush'; e.st2 = 0.9; var ax = Math.abs(dx) > Math.abs(dy); e.vx = ax ? Math.sign(dx) * sp * 4 : 0; e.vy = ax ? 0 : Math.sign(dy) * sp * 4; sfx.play('roar'); e.hitX = e.hitY = false; } }
    }
    else if (f.ai === 'shoot') {
      var want = d < 90 ? -1 : d > 160 ? 1 : 0; moveBody(e, dx / d * sp * want * dt + Math.sin(e.t) * 10 * dt, dy / d * sp * want * dt, e.r, !!f.fly);
      e.cd -= dt; if (e.cd <= 0) { e.cd = 2 + Math.random(); var a3 = Math.atan2(dy, dx); var n = f.burst || 1; for (var i = 0; i < n; i++) eshot(e.x, e.y - 8, a3, 120, f.shot, i * 0.15); if (f.spread) { eshot(e.x, e.y - 8, a3 - 0.3, 110, f.shot); eshot(e.x, e.y - 8, a3 + 0.3, 110, f.shot); } }
    }
    else if (f.ai === 'ring') { e.cd -= dt; if (e.cd <= 0) { e.cd = 2.6; for (var j = 0; j < 8; j++) eshot(e.x, e.y - 8, j * Math.PI / 4 + (e.t % 2 > 1 ? 0.39 : 0), 90, f.shot); sfx.play('shoot'); } }
    else if (f.ai === 'tele') { e.cd -= dt; if (e.cd <= 0) { e.cd = 2.4; var s = freeSpot(70); e.x = s.x; e.y = s.y; fxPuff(e.x, e.y, '#5a1a8a'); e.shootIn = 0.5; } if (e.shootIn > 0) { e.shootIn -= dt; if (e.shootIn <= 0) { var a4 = Math.atan2(P.y - e.y, P.x - e.x); [-0.25, 0, 0.25].forEach(function (o) { eshot(e.x, e.y - 10, a4 + o, 130, 'r'); }); } } }
    if (Math.hypot(P.x - e.x, P.y - e.y) < e.r + 7 && !e.ghost) hurtP(f.dmg, f.n || e.k);
  });
}
function eshot(x, y, a, sp, k, delay) { eshots.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 3, r: 4, dmg: 1, k: k || 'r', delay: delay || 0 }); }
function dmgFoe(e, n, dot) {
  if (e.dead) return; var crit = !dot && S.crit && Math.random() < S.crit; if (crit) n *= 2;
  e.hp -= n; e.flash = 0.08; if (!dot) sfx.play('hit');
  if (e.hp <= 0) killFoe(e);
}
function killFoe(e) {
  e.dead = true; run.kills++; fxPuff(e.x, e.y - 8, e.boss ? '#ff2630' : '#f1e7d0', e.boss ? 30 : 10); sfx.play(e.boss ? 'boom' : 'splat');
  if (e.f && e.f.split && !e.mini) for (var s = -1; s <= 1; s += 2) { var m = mkFoe(e.k, e.x + s * 8, e.y, true); m.cd = 0.6; foes.push(m); }
  if (S.steal && Math.random() < 0.07) { heal(1); pop(P.x, P.y - 40, '+HEALTH', '#ff6a74'); }
  if (!e.boss && Math.random() < 0.08 + S.luck * 0.03) room.pick.push({ k: pick(['coin', 'coin', 'hearth', 'bomb']), x: e.x, y: e.y });
}
/* ---------- the bosses: each picks from its own moves ---------- */
function bossAI(b, dt) {
  var B = b.B, dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx), fury = b.hp < b.mhp * 0.5 ? 1.35 : 1;
  b.face = dx > 0 ? 1 : -1; b.t += 0;
  if (b.boss === 'demon') { // four demons circle the room and shoot
    var ang = KIT.t * 0.7 + b.slot * Math.PI / 2, hx = IW / 2 + Math.cos(ang) * 120, hy = IH / 2 + Math.sin(ang) * 55;
    b.x += (hx - b.x) * Math.min(1, dt * 2); b.y += (hy - b.y) * Math.min(1, dt * 2);
    b.cd -= dt * fury; if (b.cd <= 0) { b.cd = 2 + Math.random(); if (Math.random() < 0.5) eshot(b.x, b.y - 10, a, 130, 'f'); else for (var i = 0; i < 6; i++) eshot(b.x, b.y - 10, i * 1.047 + b.t, 100, 'f'); sfx.play('shoot'); }
  } else if (b.st === 'idle') {
    if (!B.fly && B.spd) moveBody(b, dx / d * B.spd * dt * fury, dy / d * B.spd * dt * fury, b.r * 0.8, false);
    else if (B.fly) { b.x += (clamp(P.x + Math.sin(b.t * 0.8) * 80, 40, IW - 40) - b.x) * Math.min(1, dt * 0.8); b.y += ((IH * 0.35 + Math.sin(b.t * 1.4) * 15) - b.y) * Math.min(1, dt); }
    b.cd -= dt * fury;
    if (b.cd <= 0) { b.mv = pick(B.moves); b.st = b.mv; b.n = 0; b.t2 = 0.45; if (b.mv === 'summon' && foes.length > 4) b.st = 'aim'; }
  } else if (b.st === 'charge') {
    if (b.n === 0) { b.t2 -= dt; b.shakeX = (Math.random() - 0.5) * 3; if (b.t2 <= 0) { b.n = 1; b.vx = dx / d * 260 * fury; b.vy = dy / d * 260 * fury; b.t2 = 1; sfx.play('roar'); } }
    else { b.hitX = b.hitY = false; moveBody(b, b.vx * dt, b.vy * dt, b.r * 0.8, false); b.t2 -= dt; if (b.t2 <= 0 || b.hitX || b.hitY) { if (b.hitX || b.hitY) { KIT.shake(6); sfx.play('land'); } done(b); } }
  } else if (b.st === 'aim' || b.st === 'burst' || b.st === 'spread' || b.st === 'homing' || b.st === 'coins') {
    b.t2 -= dt; if (b.t2 <= 0) { b.n++;
      if (b.st === 'aim') { [-0.2, 0, 0.2].forEach(function (o) { eshot(b.x, b.y - b.h * 0.4, a + o, 140, 'r'); }); b.t2 = 0.5; }
      else if (b.st === 'burst') { eshot(b.x, b.y - b.h * 0.5, a, 220, 'p'); b.t2 = 0.12; }
      else if (b.st === 'spread') { for (var k = -2; k <= 2; k++) eshot(b.x, b.y - b.h * 0.5, a + k * 0.18, 130, 'c'); b.t2 = 0.6; }
      else if (b.st === 'homing') { var h = { x: b.x, y: b.y - b.h * 0.5, vx: Math.cos(a + rnd(-1, 1)) * 90, vy: Math.sin(a + rnd(-1, 1)) * 90, life: 4, r: 4, dmg: 1, k: 'g', home: 1 }; eshots.push(h); b.t2 = 0.3; }
      else if (b.st === 'coins') { for (var c = 0; c < 10; c++) eshot(b.x, b.y - 20, c * 0.628 + b.n * 0.3, 110, 'y'); b.t2 = 0.5; }
      sfx.play('shoot');
      if (b.n >= ({ aim: 3, burst: 8, spread: 3, homing: 5, coins: 3 })[b.st]) done(b); }
  } else if (b.st === 'ring' || b.st === 'spiral') {
    b.t2 -= dt; if (b.t2 <= 0) { b.n++;
      if (b.st === 'ring') { var nr = 12 + run.floor, off = Math.random(); for (var r = 0; r < nr; r++) eshot(b.x, b.y - b.h * 0.4, off + r / nr * 6.283, 100, 'r'); b.t2 = 0.7; if (b.n >= 3) done(b); }
      else { b.t2 = 0.08; var sa = b.n * 0.4; eshot(b.x, b.y - b.h * 0.4, sa, 105, 'p'); eshot(b.x, b.y - b.h * 0.4, sa + Math.PI, 105, 'p'); if (b.n >= 36) done(b); }
      if (b.n % 3 === 1) sfx.play('shoot'); }
  } else if (b.st === 'summon') {
    var sk = B.summon || 'blumling'; for (var q = 0; q < (sk === 'rat' ? 4 : 2); q++) { var e = mkFoe(sk, clamp(b.x + rnd(-60, 60), 20, IW - 20), clamp(b.y + rnd(10, 40), 20, IH - 20)); foes.push(e); fxPuff(e.x, e.y, '#ff2630'); }
    sfx.play('roar'); done(b);
  } else if (b.st === 'slam') { // up, a shadow follows you, then down with a ring
    if (b.n === 0) { b.n = 1; b.t2 = 0.9; sfx.play('jump'); }
    if (b.n === 1) { b.z = Math.min(160, (b.z || 0) + dt * 400); b.x += (P.x - b.x) * Math.min(1, dt * 3); b.y += (P.y - b.y) * Math.min(1, dt * 3); b.t2 -= dt; if (b.t2 <= 0) b.n = 2; }
    else if (b.n === 2) { b.z -= dt * 700; if (b.z <= 0) { b.z = 0; b.n = 3; b.t2 = 0.5; KIT.shake(10); sfx.play('boom'); for (var s = 0; s < 12; s++) eshot(b.x, b.y - 6, s * 0.5236, 120, B.fire ? 'f' : 'r'); if (Math.hypot(P.x - b.x, P.y - b.y) < b.r + 14) hurtP(2, B.n); if (B.fire) for (var fp = 0; fp < 3; fp++) eshots.push({ x: b.x + rnd(-30, 30), y: b.y + rnd(-20, 20), vx: 0, vy: 0, life: 4, r: 8, dmg: 1, k: 'f', puddle: 1 }); } }
    else { b.t2 -= dt; if (b.t2 <= 0) done(b); }
  } else if (b.st === 'beams') {
    if (b.n === 0) { b.n = 1; b.beams = [0, 1, 2].map(function (i) { return { x: clamp(P.x + (i - 1) * 60 + rnd(-10, 10), 10, IW - 10), t: 0.9 + i * 0.2 }; }); }
    b.beams.forEach(function (bm) { bm.t -= dt; if (bm.t <= 0 && !bm.hit) { bm.hit = 1; bm.show = 0.25; KIT.shake(4); sfx.play('boom'); if (Math.abs(P.x - bm.x) < 12) hurtP(2, B.n); } if (bm.hit) bm.show -= dt; });
    if (b.beams.every(function (bm) { return bm.hit && bm.show <= 0; })) { b.beams = null; done(b); }
  } else if (b.st === 'rain') {
    b.t2 -= dt; if (b.t2 <= 0) { b.n++; b.t2 = 0.18; var rx = clamp(P.x + rnd(-80, 80), 10, IW - 10), ry = clamp(P.y + rnd(-50, 50), 10, IH - 10); eshots.push({ x: rx, y: ry, vx: 0, vy: 0, life: 0.9, r: 9, dmg: 2, k: 'drop', fall: 0.9, z: 0 }); if (b.n >= 12) done(b); }
  }
  if (Math.hypot(P.x - b.x, P.y - b.y) < b.r + 6 && (b.z || 0) < 10) hurtP(b.boss === 'blum' ? 2 : 1, B.n);
}
function done(b) { b.st = 'idle'; b.cd = 1 + Math.random() * 0.6; b.n = 0; b.shakeX = 0; }

/* ---------- shots, bombs, effects ---------- */
function updShots(dt) {
  tears.forEach(function (t) {
    t.life -= dt;
    if (S.homing) { var best = null, bd = 140; foes.forEach(function (e) { var dd = Math.hypot(e.x - t.x, e.y - t.y); if (!e.dead && dd < bd) { bd = dd; best = e; } }); if (best) { var a = Math.atan2(best.y - 8 - t.y, best.x - t.x), sp = Math.hypot(t.vx, t.vy), ca = Math.atan2(t.vy, t.vx), dA = ((a - ca + Math.PI * 3) % (Math.PI * 2)) - Math.PI; ca += clamp(dA, -5 * dt, 5 * dt); t.vx = Math.cos(ca) * sp; t.vy = Math.sin(ca) * sp; } }
    t.x += t.vx * dt; t.y += t.vy * dt;
    var tt = tileAt(t.x, t.y + 12);
    if (!S.spectral && (tt === 1 || tt === 3)) { if (tt === 3) hitPile(t.x, t.y + 12); t.life = 0; }
    if (t.x < 0 || t.x > IW || t.y < -10 || t.y > IH) t.life = 0;
    foes.forEach(function (e) {
      if (e.dead || t.life <= 0 || t.hit[e.id || (e.id = Math.random())] || e.ghost) return;
      var ey = e.boss ? e.y - e.h * 0.4 - (e.z || 0) : e.y - 8 - (e.z || 0);
      if (Math.hypot(e.x - t.x, ey - t.y) < e.r + t.r) {
        t.hit[e.id] = 1; dmgFoe(e, t.dmg); if (S.burn) e.burn = 3; if (S.poison) e.poison = 3; if (S.charm && !e.boss && Math.random() < 0.12) e.charm = 2.5;
        if (!e.boss) { e.x += t.vx * 0.04; e.y += t.vy * 0.04; }
        if (!S.pierce) t.life = 0;
      }
    });
    if (t.life <= 0) fxPuff(t.x, t.y, S.red ? '#ff2630' : '#f1e7d0', 3);
  });
  tears = tears.filter(function (t) { return t.life > 0; });
  eshots.forEach(function (s) {
    if (s.delay > 0) { s.delay -= dt; return; }
    s.life -= dt;
    if (s.home && s.life > 1) { var a = Math.atan2(P.y - 16 - s.y, P.x - s.x), sp = Math.max(90, Math.hypot(s.vx, s.vy)), ca = Math.atan2(s.vy, s.vx), dA = ((a - ca + Math.PI * 3) % (Math.PI * 2)) - Math.PI; ca += clamp(dA, -2 * dt, 2 * dt); s.vx = Math.cos(ca) * sp; s.vy = Math.sin(ca) * sp; }
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (!s.puddle && s.k !== 'drop' && (solidT(tileAt(s.x, s.y)) || s.x < 0 || s.y < 0 || s.x > IW || s.y > IH)) s.life = 0;
    if (s.k === 'drop') { if (s.life <= 0) { if (Math.hypot(P.x - s.x, P.y - s.y) < s.r + 6) hurtP(s.dmg, 'falling goo'); fxPuff(s.x, s.y, '#ff2630', 6); } return; }
    var py = s.puddle ? P.y : P.y - 14;
    if (Math.hypot(P.x - s.x, py - s.y) < s.r + 6) { hurtP(s.dmg, 'a shot'); if (!s.puddle) s.life = 0; }
  });
  eshots = eshots.filter(function (s) { return s.life > 0; });
  bombs.forEach(function (b) {
    b.t -= dt; if (b.t > 0) return; b.done = true; KIT.shake(10); sfx.play('boom'); fx.push({ k: 'boom', x: b.x, y: b.y, t: 0.35 });
    for (var cy = 0; cy < ROWS; cy++) for (var cx = 0; cx < COLS; cx++) { var tx = cx * TS + 13, ty = cy * TS + 13; if (Math.hypot(tx - b.x, ty - b.y) < 46 && room.tiles[cy][cx] && room.tiles[cy][cx] !== 4) { if (room.tiles[cy][cx] === 3 && Math.random() < 0.3) room.pick.push({ k: 'coin', x: tx, y: ty }); room.tiles[cy][cx] = 0; fxPuff(tx, ty, '#8a6a6e', 6); } }
    foes.forEach(function (e) { if (!e.dead && Math.hypot(e.x - b.x, e.y - b.y) < 50 + e.r) dmgFoe(e, 40 + run.floor * 6); });
    if (Math.hypot(P.x - b.x, P.y - b.y) < 46) hurtP(2, 'your own bomb');
  });
  bombs = bombs.filter(function (b) { return !b.done; });
}
function hitPile(x, y) {
  var cx = Math.floor(x / TS), cy = Math.floor(y / TS), k = cx + ',' + cy; room.ph[k] = (room.ph[k] === undefined ? 3 : room.ph[k]) - 1; sfx.play('splat');
  if (room.ph[k] <= 0) { room.tiles[cy][cx] = 0; fxPuff(cx * TS + 13, cy * TS + 13, '#f1e0b0', 8); if (Math.random() < 0.3 + S.luck * 0.1) room.pick.push({ k: pick(['coin', 'coin', 'hearth']), x: cx * TS + 13, y: cy * TS + 13 }); }
}
function fxPuff(x, y, c, n) { for (var i = 0; i < (n || 8); i++) fx.push({ k: 'p', x: x, y: y, vx: rnd(-70, 70), vy: rnd(-90, 30), t: rnd(0.25, 0.5), c: c }); }
function pop(x, y, t, c) { pops.push({ x: x, y: y, t: t, c: c, life: 1.3 }); }
function updPets(dt) {
  pets.forEach(function (p, i) {
    p.a += dt * 2; var tx = P.x + Math.cos(p.a + i * 2) * 26, ty = P.y + Math.sin(p.a + i * 2) * 14; p.x = p.x === undefined ? tx : p.x + (tx - p.x) * Math.min(1, dt * 6); p.y = p.y === undefined ? ty : p.y + (ty - p.y) * Math.min(1, dt * 6);
    p.cd -= dt; var tgt = null, bd = 200; foes.forEach(function (e) { var dd = Math.hypot(e.x - p.x, e.y - p.y); if (!e.dead && dd < bd) { bd = dd; tgt = e; } });
    if (tgt && p.cd <= 0) { p.cd = 0.8; var a = Math.atan2(tgt.y - 8 - p.y, tgt.x - p.x); tears.push({ x: p.x, y: p.y - 10, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, life: 0.8, dmg: 2 + run.floor * 0.5, r: 3, hit: {}, pet: 1 }); }
  });
}

/* ---------- the loop ---------- */
function update(dt) {
  if (G.mode !== 'play') { if (G.mode === 'dead' || G.mode === 'won') { G.endT -= dt; } return; }
  run.t += dt;
  if (G.fadeIn > 0) G.fadeIn -= dt;
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  if (G.bossIntro > 0) { G.bossIntro -= dt; return; }
  updPlayer(dt); if (G.mode !== 'play') return;
  updFoes(dt); updPets(dt); updShots(dt);
  foes = foes.filter(function (e) { return !e.dead; });
  if (!room.cleared && !foes.length) roomClear();
  fx.forEach(function (f) { f.t -= dt; if (f.k === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 200 * dt; } }); fx = fx.filter(function (f) { return f.t > 0; });
  pops.forEach(function (p) { p.life -= dt; p.y -= 16 * dt; }); pops = pops.filter(function (p) { return p.life > 0; });
}
function die() {
  G.mode = 'dead'; sfx.play('lose'); music.stop(1);
  KIT.menu({ title: 'Cumhead Is Done', sub: 'Killed by ' + (run.by || 'the lair') + ' on floor ' + (run.floor + 1) + ': ' + run.F.name,
    html: '<p style="text-align:center;margin:0">Rooms cleared: <b>' + run.rooms.list.filter(function (c) { return c.cleared && c.type === 'normal'; }).length + '</b>  ·  Foes: <b>' + run.kills + '</b>  ·  Items: <b>' + run.items.length + '</b><br>Best floor ever: <b>' + SV.best + '</b></p>',
    items: [{ label: 'GO AGAIN', fn: function () { KIT.closeMenu(); pets = []; newRun(); }, cls: 'hot', def: true }, { label: 'TITLE', fn: titleMenu, back: true }] });
}
function win() {
  G.mode = 'won'; SV.wins++; persist(); sfx.play('win'); music.play('super');
  KIT.menu({ title: 'Blumhead Is Ground Down', sub: 'Six floors. ' + run.items.length + ' items. ' + run.kills + ' foes. Cumhead climbs out of the lair.',
    html: '<p style="text-align:center;margin:0">Time: <b>' + Math.floor(run.t / 60) + ':' + ('0' + Math.floor(run.t % 60)).slice(-2) + '</b>  ·  Wins: <b>' + SV.wins + '</b></p>',
    items: [{ label: 'GRIND AGAIN', fn: function () { KIT.closeMenu(); pets = []; newRun(); }, cls: 'hot', def: true }, { label: 'TITLE', fn: titleMenu, back: true }] });
}

/* ---------- drawing ---------- */
var R = KIT.R, spr = KIT.spr, text = KIT.text;
function drawRoom() {
  var F = run.F;
  R('#070405', 0, 0, W, H);
  // walls
  R(F.wall, RX, RY, IW + WALL * 2, IH + WALL * 2); R('#12040a', RX, RY, IW + WALL * 2, 2); R('rgba(0,0,0,0.35)', RX, RY + IH + WALL * 2 - 4, IW + WALL * 2, 4);
  for (var bx = RX; bx < RX + IW + WALL * 2; bx += 12) { R('rgba(0,0,0,0.22)', bx, RY, 1, WALL); R('rgba(0,0,0,0.22)', bx + 6, RY + IH + WALL, 1, WALL); }
  for (var by = RY; by < RY + IH + WALL * 2; by += 12) { R('rgba(0,0,0,0.22)', RX, by, WALL, 1); R('rgba(0,0,0,0.22)', RX + IW + WALL, by + 6, WALL, 1); }
  // floor
  R(F.floor, IX0, IY0, IW, IH);
  for (var cy = 0; cy < ROWS; cy++) for (var cx = 0; cx < COLS; cx++) { if ((cx + cy) % 2) R(F.tile, IX0 + cx * TS, IY0 + cy * TS, TS, TS); R('rgba(255,255,255,0.03)', IX0 + cx * TS, IY0 + cy * TS, TS, 1); }
  R('rgba(0,0,0,0.3)', IX0, IY0, IW, 4); R('rgba(0,0,0,0.3)', IX0, IY0, 4, IH);
  // doors
  for (var d in room.doors) {
    var nb = room.doors[d], kind = nb.type === 'boss' || room.type === 'boss' ? 'boss' : nb.type === 'treasure' ? 'gold' : nb.type === 'shop' ? 'shop' : 'n', open = room.cleared && !nb.locked;
    var dp = DOORPOS[d], x = IX0 + dp.x, y = IY0 + dp.y, rot = { u: 0, d: Math.PI, l: -Math.PI / 2, r: Math.PI / 2 }[d];
    spr('gr_door_' + kind + (open ? 'o' : ''), x, y, { anchor: 'c', rot: rot });
  }
  // tiles
  for (cy = 0; cy < ROWS; cy++) for (cx = 0; cx < COLS; cx++) {
    var t = room.tiles[cy][cx], px = IX0 + cx * TS + 13, py = IY0 + cy * TS + 13;
    if (t === 1) spr((cx + cy) % 2 ? 'gr_rock0' : 'gr_rock1', px, py, { anchor: 'c' });
    else if (t === 3) { var hp = room.ph[cx + ',' + cy]; spr('gr_pile' + (hp === undefined ? 3 : Math.max(1, hp)), px, py + 2, { anchor: 'c' }); }
    else if (t === 4) spr('gr_spikes', px, py, { anchor: 'c' });
  }
  if (room.trap) spr('gr_trap', IX0 + room.trap.x, IY0 + room.trap.y, { anchor: 'c' });
}
function drawWorld() {
  var list = [];
  room.peds.forEach(function (pd) { list.push({ y: pd.y, d: function () { spr('gr_ped', IX0 + pd.x, IY0 + pd.y + 6); if (pd.item) { spr('it_' + pd.item, IX0 + pd.x, IY0 + pd.y - 14 + Math.sin(KIT.t * 3) * 2); if (pd.price) text(pd.price + 'c', IX0 + pd.x, IY0 + pd.y + 8, { align: 'center', size: 6, col: '#ffe36a' }); } } }); });
  room.pick.forEach(function (pk) { list.push({ y: pk.y, d: function () { var n = { heart: 'gr_heart', hearth: 'gr_hearth', coin: 'gr_coin', coin5: 'gr_coin5', bomb: 'gr_bomb', key: 'gr_key', shield: 'gr_shield' }[pk.k]; spr(n, IX0 + pk.x, IY0 + pk.y + 4); if (pk.price) text(pk.price + 'c', IX0 + pk.x, IY0 + pk.y + 6, { align: 'center', size: 6, col: '#ffe36a' }); } }); });
  if (room.type === 'shop') list.push({ y: 10, d: function () { spr('npc_potbelly', IX0 + IW / 2, IY0 + 44); text('POTBELLY\'S STALL', IX0 + IW / 2, IY0 + 48, { align: 'center', size: 6, col: '#ffe36a' }); } });
  bombs.forEach(function (b) { list.push({ y: b.y, d: function () { spr(Math.floor(KIT.t * 8) % 2 ? 'gr_bombl' : 'gr_bomb', IX0 + b.x, IY0 + b.y + 4, { sc: b.t < 0.5 && Math.floor(KIT.t * 20) % 2 ? 1.15 : 1 }); } }); });
  eshots.forEach(function (s) { if (s.puddle) list.push({ y: -1, d: function () { var x = IX0 + s.x, y = IY0 + s.y; R('#a8300a', x - 7, y - 2, 14, 5); R('#ff7a20', x - 5, y - 1, 10, 3); if (Math.random() < 0.3) R('#ffe36a', x + rnd(-5, 5), y - 4, 1, 2); } }); });
  foes.forEach(function (e) { list.push({ y: e.y, d: function () { drawFoe(e); } }); });
  pets.forEach(function (p) { list.push({ y: p.y || 0, d: function () { spr(p.k, IX0 + p.x, IY0 + p.y, { sc: 0.8 }); } }); });
  list.push({ y: P.y, d: drawPlayer });
  list.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { o.d(); });
  // shots over everything
  tears.forEach(function (t) { var n = t.pet ? 'gr_tearg' : S.red ? 'gr_tearr' : S.poison ? 'gr_tearg' : S.burn ? 'gr_tearf' : 'gr_tearc'; R('rgba(0,0,0,0.3)', IX0 + t.x - 3, IY0 + t.y + 12, 6, 2); spr(n, IX0 + t.x, IY0 + t.y, { anchor: 'c', sc: t.r / 4 }); });
  eshots.forEach(function (s) {
    if (s.puddle || s.delay > 0) return; var x = IX0 + s.x, y = IY0 + s.y;
    if (s.k === 'drop') { var k = 1 - s.life / s.fall; R('rgba(0,0,0,0.4)', x - s.r * k, y - 2, s.r * 2 * k, 4); spr('gr_tearr', x, y - (1 - k) * 120, { anchor: 'c', sc: 1.6 }); return; }
    spr({ r: 'gr_tearr', p: 'gr_tearp', g: 'gr_tearg', f: 'gr_tearf', c: 'gr_tearc', y: 'gr_coin' }[s.k] || 'gr_tearr', x, y, { anchor: 'c' });
  });
  foes.forEach(function (b) { if (b.beams) b.beams.forEach(function (bm) { var x = IX0 + bm.x; if (!bm.hit) { if (Math.floor(KIT.t * 12) % 2) R('#ff2630', x - 1, IY0, 2, IH); } else if (bm.show > 0) { R('#ff2630', x - 10, IY0, 20, IH); R('#ffd0d0', x - 4, IY0, 8, IH); } }); });
  fx.forEach(function (f) { if (f.k === 'p') R(f.c, IX0 + f.x, IY0 + f.y, 2, 2); else if (f.k === 'boom') { var k = 1 - f.t / 0.35; KIT.ctx.fillStyle = 'rgba(255,' + Math.round(200 - k * 150) + ',60,' + (1 - k) + ')'; KIT.ctx.beginPath(); KIT.ctx.arc(IX0 + f.x, IY0 + f.y, 10 + k * 40, 0, 6.28); KIT.ctx.fill(); } });
  pops.forEach(function (p) { text(p.t, IX0 + p.x, IY0 + p.y, { align: 'center', size: 6, col: p.c, alpha: Math.min(1, p.life * 2) }); });
}
function drawFoe(e) {
  var x = IX0 + e.x, y = IY0 + e.y, z = e.z || 0;
  if (e.boss) {
    var B = e.B, f = B.s + (Math.floor(KIT.t * 4) % 2);
    R('rgba(0,0,0,0.35)', x - e.r, y - 3, e.r * 2, 6);
    spr(f, x + (e.shakeX || 0), y - z, { flip: e.face < 0, flash: e.flash > 0, alpha: e.charm > 0 ? 0.6 : 1 });
    return;
  }
  var fr = e.f.s + (Math.floor(e.t * 8) % e.f.nf);
  R('rgba(0,0,0,0.3)', x - e.r, y - 2, e.r * 2, 4);
  spr(fr, x, y - z + (e.f.fly ? -6 + Math.sin(e.t * 5) * 2 : 2), { flip: e.face < 0, sc: e.sc, flash: e.flash > 0, alpha: e.ghost ? 0.35 : e.charm > 0 ? 0.6 : 1 });
  if (e.charm > 0) text('<3', x, y - 30, { align: 'center', size: 6, col: '#ff8ad0' });
}
function drawPlayer() {
  if (P.inv > 0 && Math.floor(KIT.t * 20) % 2) return;
  var x = IX0 + P.x, y = IY0 + P.y, step = Math.hypot(P.vx, P.vy) > 20 ? Math.floor(P.walk * 10) % 2 : 0, flip = P.face === 'sleft';
  R('rgba(0,0,0,0.35)', x - 9, y - 2, 18, 4);
  // a small body in his black and red outfit, then his head
  R('#12040a', x - 6, y - 14, 12, 11); R('#1a1014', x - 5, y - 13, 10, 9); R('#c4121c', x - 5, y - 10, 10, 2);
  R('#12040a', x - 5 + (step ? 1 : 0), y - 4, 4, 5); R('#12040a', x + 1 - (step ? 1 : 0), y - 4, 4, 5); R('#2a1a20', x - 4 + (step ? 1 : 0), y - 4, 2, 3); R('#2a1a20', x + 2 - (step ? 1 : 0), y - 4, 2, 3);
  R('#12040a', x - 9, y - 13 + (step ? 1 : 0), 4, 7); R('#12040a', x + 5, y - 13 - (step ? 1 : 0), 4, 7); R('#f1e7d0', x - 8, y - 8 + (step ? 1 : 0), 2, 2); R('#f1e7d0', x + 6, y - 8 - (step ? 1 : 0), 2, 2);
  spr('ch_icon0', x, y - 11 - (P.cd > 1 / S.fire - 0.06 ? 1 : 0), { flip: flip });
  if (P.face === 'sup') R('rgba(18,4,10,0.25)', x - 10, y - 38, 20, 10);
}
function drawHud() {
  // hearts
  var hx = 6, hy = 6;
  for (var i = 0; i < S.hpMax / 2; i++) { var v = P.hp - i * 2; spr(v >= 2 ? 'gr_heart' : v === 1 ? 'gr_hearth' : 'gr_hearte', hx + (i % 8) * 13, hy + Math.floor(i / 8) * 12, { anchor: 'tl' }); }
  for (var j = 0; j < Math.ceil(P.shield / 2); j++) spr('gr_shield', hx + ((S.hpMax / 2 + j) % 8) * 13, hy + Math.floor((S.hpMax / 2 + j) / 8) * 12, { anchor: 'tl' });
  spr('gr_coin', 128, 6, { anchor: 'tl' }); text(String(P.coins), 140, 7, { size: 8 });
  spr('gr_bomb', 166, 2, { anchor: 'tl', sc: 0.8 }); text(String(P.bombs), 181, 7, { size: 8 });
  spr('gr_key', 204, 3, { anchor: 'tl', sc: 0.8 }); text(String(P.keys), 214, 7, { size: 8 });
  text('FLOOR ' + (run.floor + 1) + '  ' + run.F.name.toUpperCase(), 240, 7, { size: 6, col: '#a6968f' });
  text('DMG ' + S.dmg.toFixed(1) + '  TEARS ' + S.fire.toFixed(1) + '  SPD ' + (S.speed / 105).toFixed(1), 128, 22, { size: 6, col: '#a6968f' });
  // the minimap
  var mx = 436, my = 44, cw = 7, ch = 6;
  run.rooms.list.forEach(function (c) {
    if (!c.seen) return; var x = mx + (c.gx - 4) * cw + 18, y = my + (c.gy - 4) * ch + 26;
    R('#12040a', x, y, cw, ch); R(c === room ? '#f1e7d0' : c.visited ? '#6a5a5e' : '#3a2a2e', x + 1, y + 1, cw - 2, ch - 2);
    var ic = c.type === 'boss' ? '#ff2630' : c.type === 'treasure' ? '#ffe36a' : c.type === 'shop' ? '#7dff3a' : null; if (ic) R(ic, x + 2, y + 2, cw - 4, ch - 4);
  });
  // boss health
  var bs = foes.filter(function (e) { return e.boss; });
  if (bs.length) { var hp = 0, mhp = 0; bs.forEach(function (b) { hp += Math.max(0, b.hp); mhp += b.mhp; }); var dem = run.boss === 'demon' ? BOSSES.demon.count * bs[0].mhp : mhp; KIT.bar(IX0 + 40, H - 8, IW - 80, 5, hp / dem, '#c4121c'); text(BOSSES[run.boss].n.toUpperCase(), IX0 + IW / 2, H - 17, { align: 'center', size: 6 }); }
  // the run's items, small, down the left
  run.items.slice(-14).forEach(function (id, k) { spr('it_' + id, 4 + (k % 2) * 22, 44 + Math.floor(k / 2) * 22, { anchor: 'tl', sc: 1 }); });
}
function draw() {
  if (G.mode === 'title' || !run) { drawTitle(); return; }
  drawRoom(); drawWorld(); drawHud();
  if (G.bossIntro > 0) { var k = Math.min(1, (2.2 - G.bossIntro) * 3); KIT.panel(W / 2 - 150, H / 2 - 30, 300, 60); text(BOSSES[run.boss].n, W / 2, H / 2 - 22, { align: 'center', size: 24, font: 'title', col: '#ff2630', alpha: k }); text('VS  CUMHEAD', W / 2, H / 2 + 12, { align: 'center', size: 8, alpha: k }); }
  if (banner) { var a = Math.min(1, banner.t * 2); KIT.panel(W / 2 - 140, 46, 280, 40, { fill: 'rgba(14,7,8,0.85)' }); if (banner.icon) spr(banner.icon, W / 2 - 122, 56, { anchor: 'tl' }); text(banner.a, W / 2 + (banner.icon ? 10 : 0), 52, { align: 'center', size: 16, font: 'title', col: '#ff2630', alpha: a, max: 230 }); text(banner.b, W / 2 + (banner.icon ? 10 : 0), 72, { align: 'center', size: 6, alpha: a, max: 240 }); }
  if (G.fadeIn > 0) R('rgba(0,0,0,' + Math.min(1, G.fadeIn * 4) + ')', 0, 0, W, H);
}
function drawTitle() {
  R('#070405', 0, 0, W, H);
  for (var y = 0; y < H; y += 26) for (var x = 0; x < W; x += 26) R(((x + y) / 26) % 2 ? '#1a0a0e' : '#220c12', x, y, 26, 26);
  R('rgba(7,4,5,0.55)', 0, 0, W, H);
  spr('ch_icon0', W / 2, 220 + Math.sin(KIT.t * 2) * 3, { sc: 3 });
  for (var i = 0; i < 6; i++) spr('gr_tearc', W / 2 + Math.cos(KIT.t + i) * 120, 150 + Math.sin(KIT.t * 1.3 + i) * 60, { anchor: 'c', sc: 1.5 });
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; run = null; music.play('grtitle');
  KIT.menu({ cls: 'clear', title: 'The Grinding of Cumhead', sub: "Six floors of Blumhead's Lair. A boss at the end of every one. Blumhead at the bottom.",
    items: [{ label: 'START A RUN', fn: function () { KIT.closeMenu(); pets = []; newRun(); }, cls: 'hot', def: true }, { label: 'ITEMS FOUND', sub: Object.keys(SV.seen).length + ' of ' + ITEMS.length, fn: itemsMenu }, { label: 'HOW TO PLAY', fn: helpMenu }],
    note: 'Best floor ' + SV.best + '  ·  Runs ' + SV.runs + '  ·  Wins ' + SV.wins });
}
function itemsMenu() {
  KIT.menu({ title: 'Items Found', wide: true, html: '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">' + ITEMS.map(function (it) { var s = SV.seen[it.id]; return '<div style="padding:6px 8px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c;font-size:13px">' + (s ? '<b>' + it.n + '</b><br><span style="color:#a6968f">' + it.d + '</span>' : '<span style="color:#4a1a1c">???</span>') + '</div>'; }).join('') + '</div>',
    items: [{ label: 'BACK', back: true, fn: titleMenu }] });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p><b>Move</b>: left stick, d-pad, WASD or the left pad. <b>Shoot</b>: the face buttons (X left, B right, Y up, A down), the arrow keys / IJKL or the right pad. <b>Bomb</b>: LB, E or Space.</p><p>The doors shut until the room is clear. Bombs break rocks and cream piles. Gold doors and the shop need a key. Items stack. Find the boss room (the red mark on the map), kill the boss and drop down the hole.</p><p>Blumhead waits under the sixth floor.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' || KIT.menuOpen()) return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: 'Floor ' + (run.floor + 1) + ': ' + run.F.name, html: run.items.length ? '<p style="text-align:center;margin:0;color:#a6968f">' + run.items.map(function (id) { return ITEM[id].n; }).join(' · ') + '</p>' : '',
    items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'GIVE UP', sub: 'The run ends', fn: function () { KIT.closeMenu(); run.by = 'giving up'; die(); } }] });
}
music.songs.grtitle = { bpm: 92, beats: 4, vol: 0.9, wet: 0.55, lead: 'organlead', bass: 'drone', acc: 'bell', drums: 'slow', chords: 'Am F C E Am F Dm E',
  mel: 'e5 - - - a5 - - - | c6 - b5 - a5 - f5 - | g5 - - - e5 - c5 - | g#5 - - - b5 - - - | a5 - - - c6 - e6 - | f6 - e6 - c6 - a5 - | d6 - c6 - a5 - f5 - | e5 - - - - - . .' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu,
  pad: { four: false, shootPad: true, btns: [{ k: 'bomb', label: 'B', sub: 'BOMB', cls: 'gold' }] },
  padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'k', b: 'l', x: 'j', y: 'i', lb: 'e', rb: 'e' } });
titleMenu();
window.__gr = { G: G, get P() { return P; }, get S() { return S; }, get run() { return run; }, get room() { return room; }, get foes() { return foes; }, newRun: function () { pets = []; newRun(); }, enterRoom: enterRoom, newFloor: newFloor, takeItem: takeItem, ITEMS: ITEMS, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, killAll: function () { foes.forEach(function (e) { e.hp = 0; killFoe(e); }); } };
