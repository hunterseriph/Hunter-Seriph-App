/* =====================================================================================================
   JOURNEY TO THE VOID: a Final Fantasy style RPG. Cumhead, Spermaid and Greebo walk the world map,
   the towns (go into every building) and the dungeons. Battles run on ATB gauges like Final Fantasy VII:
   each fighter's TIME bar fills, then they act, every attack and skill with its own animation.
   c-game.js: the save, the field, towns and the insides of buildings, talking.
   d-battle.js: battles.  e-ui.js: the FF7 style windows and menus.  f-main.js: title, loop, music.
   ===================================================================================================== */
var W = 480, H = 270, TS = 16;
var R = KIT.R, spr = KIT.spr, text = KIT.text;
var G = { mode: 'title', t: 0 }, S, P, DLG = null, BT = null, banner = null, fade = 0;

/* ---------- the save ---------- */
function newSave() {
  return { party: ['cumhead', 'spermaid', 'greebo'].map(function (id) { var h = HEROES[id]; return { id: id, lv: 1, xp: 0, hp: h.hp, mp: h.mp, wpn: h.wpn, arm: h.arm, limit: 0 }; }),
    inv: { puff: 4, garlic: 2 }, gear: {}, drops: 120, flags: {}, chests: {}, given: {}, map: null, t: 0, steps: 0, v: 2 };
}
function save() { S.map = { k: G.mk, id: G.mid, floor: G.floor, x: P.x, y: P.y, dir: P.dir, bld: G.bld }; KIT.save('jv-save', S); }
function hasSave() { return !!KIT.load('jv-save', null); }

/* ---------- party maths ---------- */
function stat(m, k) { var h = HEROES[m.id], v = h[k] + h.grow[k] * (m.lv - 1); var w = GEAR[m.wpn] || {}, a = GEAR[m.arm] || {}; v += (w[k] || 0) + (a[k] || 0); return Math.round(v); }
function maxHp(m) { return stat(m, 'hp'); } function maxMp(m) { return stat(m, 'mp'); }
function xpNext(lv) { return Math.round(14 * Math.pow(lv, 1.75)); }
function skillsOf(m) { return SKILLS[m.id].filter(function (s) { return s.lv <= m.lv; }); }
function alive(m) { return m.hp > 0; }
function heroName(m) { return HEROES[m.id].name; }
function foeStats(id, lv, boss) {
  var f = boss ? BOSSES[id] : FOES[id], L = lv;
  var o = { id: id, n: f.n, s: f.s, lv: L, sk: f.sk || [], weak: f.weak, boss: !!boss, summon: f.summon, next: f.next,
    hp: boss ? Math.round(f.hp * 1.6) : Math.round((22 + L * 15) * (f.hpk || 1)), atk: Math.round((8 + L * 3.6 * (boss ? 1.3 : 1)) * (f.atkk || 1)), def: Math.round((2 + L * 1.7) * (f.defk || 1)),
    mag: Math.round(6 + L * 3.3 * (boss ? 1.3 : 1)), spd: Math.round(5 + L * 0.95), xp: Math.round((8 + Math.pow(L, 1.8) * 2.4) * (boss ? 9 : 1)), drops: Math.round((6 + L * 5) * (boss ? 10 : 1)) };
  o.mhp = o.hp; return o;
}

/* ---------- towns: built from TOWNSPEC, with a fountain, paths, lamps, gardens and buildings ---------- */
var TOWNMAP = {};
var BX = [2, 8, 14, 24, 30, 36];
function buildTown(id) {
  if (TOWNMAP[id]) return TOWNMAP[id];
  var sp = TOWNSPEC[id], w = sp.w, h = sp.h, g = [], x, y;
  for (y = 0; y < h; y++) { g.push([]); for (x = 0; x < w; x++) g[y].push(x === 0 || y === 0 || x === w - 1 || y === h - 1 ? '#' : '.'); }
  function rect(x0, y0, rw, rh, c) { for (var yy = y0; yy < y0 + rh; yy++) for (var xx = x0; xx < x0 + rw; xx++) if (yy >= 0 && yy < h && xx >= 0 && xx < w) g[yy][xx] = c; }
  rect(1, 8, w - 2, 2, ','); rect(0, 20, w, 2, ','); rect(1, 26, w - 2, 2, ','); rect(20, 8, 3, 20, ','); rect(2, 8, 1, 20, ','); rect(w - 3, 8, 1, 20, ',');
  rect(13, 11, 17, 8, ','); rect(20, 13, 3, 3, 'F');
  [[13, 11], [14, 11], [13, 12], [28, 11], [29, 11], [29, 12], [13, 18], [14, 18], [13, 17], [29, 18], [28, 18], [29, 17]].forEach(function (p) { g[p[1]][p[0]] = 'f'; });
  [[16, 16], [26, 16], [16, 12], [26, 12]].forEach(function (p) { g[p[1]][p[0]] = 'b'; });
  [5, 11, 17, 25, 31, 37].forEach(function (lx) { g[10][lx] = 'L'; g[19][lx] = 'L'; });
  for (x = 2; x < w - 2; x += 4) { g[2][x] = 'T'; if (x % 8 === 2) g[1][x + 2] = 'T'; g[29][x + 1] = 'T'; }
  rect(30, 28, 7, 2, '~'); rect(6, 28, 2, 1, 'f'); rect(9, 29, 3, 1, 'f');
  var blds = [];
  [['rowA', 4], ['rowB', 22]].forEach(function (row) {
    (sp[row[0]] || []).forEach(function (bid, i) { var bx = BX[i]; rect(bx, row[1], 5, 4, 'B'); g[row[1] + 3][bx + 2] = 'D'; blds.push({ id: bid, x: bx, y: row[1], w: 5, h: 4, door: { x: bx + 2, y: row[1] + 3 } }); });
  });
  if (sp.rowA && sp.rowA.indexOf('beebs') >= 0) { var bb = BX[sp.rowA.indexOf('beebs')]; g[8 - 1] && (g[7][bb + 5] = 'r'); }
  var folk = (sp.folk || []).map(function (f) { return { s: f.s, n: f.n, say: f.say, x: f.at[0], y: f.at[1], hx: f.at[0], hy: f.at[1], px: f.at[0] * TS, py: f.at[1] * TS, dir: 'd', wait: rnd(0.5, 2), moving: false, t: Math.random() * 5 }; });
  return (TOWNMAP[id] = { rows: g, w: w, h: h, blds: blds, folk: folk, sp: sp });
}
/* the inside of a building: a counter with the keeper behind it, the props, the door at the bottom */
var ROOMS = {};
function buildRoom(bid) {
  if (ROOMS[bid]) return ROOMS[bid];
  var B = BUILDINGS[bid], w = 18, h = 11, g = [], x, y, props = [];
  for (y = 0; y < h; y++) { g.push([]); for (x = 0; x < w; x++) g[y].push(y < 2 || x === 0 || x === w - 1 || y === h - 1 ? '#' : '.'); }
  g[h - 1][9] = 'D';
  if (B.keeper || B.home || bid === 'greebo') { for (x = 6; x <= 11; x++) g[4][x] = 'C'; if (B.keeper) g[3][9] = 'K'; }
  var slots = [[2, 3], [14, 3], [2, 7], [14, 7], [5, 7], [11, 7]];
  if (B.arcade) { [2, 4, 12, 14, 16].forEach(function (cx, i) { g[2][cx] = 'A'; g[3][cx] = 'A'; props.push({ k: 'cab', x: cx, y: 3, i: i }); }); }
  B.props.forEach(function (k, i) { if (k === 'cabs') return; var s = slots[i % slots.length]; props.push({ k: k, x: s[0], y: s[1] }); var sz = { bed: [2, 2], table: [2, 1], sofa: [3, 1], mat: [2, 1] }[k] || [1, 1]; for (var yy = 0; yy < sz[1]; yy++) for (var xx = 0; xx < sz[0]; xx++) g[s[1] + yy][s[0] + xx] = k === 'mat' ? '.' : 'P'; });
  return (ROOMS[bid] = { rows: g, w: w, h: h, props: props, B: B });
}
var ARCADE = [['spermhog.html', 'Cumhead the Spermhog'], ['meatnado.html', 'Meatnado Escape'], ['spermaid-survivors.html', 'Spermaid Survivors'], ['willy-nilly.html', 'Willy Nilly'],
  ['spuzzworld.html', "Spuzzworld: Cum's Oddysee"], ['grinding-of-cumhead.html', 'The Grinding of Cumhead'], ['arcade-overdrive.html', "Potbelly's Arcade Overdrive"], ['load-legacy.html', 'Load Legacy'], ['cumheads-quest.html', 'Cumheads Quest'], ['cumhead-kart.html', 'Cumhead Kart']];

/* ---------- the field ---------- */
function mapRows() { if (G.mk === 'world') return OVERWORLD; if (G.mk === 'town') return buildTown(G.mid).rows; if (G.mk === 'room') return buildRoom(G.bld).rows; return FLOORS[G.floorId]; }
function mapW() { var r = mapRows(); return r[0].length; } function mapH() { return mapRows().length; }
function tile(x, y) { var r = mapRows(); if (y < 0 || y >= r.length || x < 0 || x >= r[0].length) return G.mk === 'world' ? '^' : G.mk === 'town' ? ',' : '#'; return r[y][x]; }
function enter(mk, id, floor, x, y, dir, bld) {
  G.mk = mk; G.mid = id; G.floor = floor || 0; G.bld = bld || null; G.floorId = mk === 'dun' ? DUNGEONS[id].floors[G.floor] : null;
  P = { x: x, y: y, px: x * TS, py: y * TS, dir: dir || 'd', moving: false, t: 0 }; G.mode = 'field'; fade = 0.4;
  if (mk === 'world') { music.play('jvworld'); banner = null; }
  else if (mk === 'town') { var sp = TOWNSPEC[id]; music.play(sp.song); banner = { t: 2.2, a: sp.name.toUpperCase() }; }
  else if (mk === 'room') { banner = { t: 1.6, a: BUILDINGS[bld].n.toUpperCase() }; music.play(BUILDINGS[bld].arcade ? 'aohub' : TOWNSPEC[id].song); }
  else { var D = DUNGEONS[id]; music.play(D.song); banner = { t: 2.2, a: D.name.toUpperCase(), b: D.floors.length > 1 ? 'FLOOR ' + (G.floor + 1) : '' }; }
  G.encSteps = 0;
}
function findTile(rows, c) { for (var y = 0; y < rows.length; y++) { var x = rows[y].indexOf(c); if (x >= 0) return { x: x, y: y }; } return null; }
function folkAt(x, y) { if (G.mk !== 'town') return null; return buildTown(G.mid).folk.filter(function (f) { return f.x === x && f.y === y; })[0] || null; }
var TSOLID = '#TfLbr~FBCKPA';
function solid(x, y) {
  var c = tile(x, y);
  if (G.mk === 'world') return c === '^' || c === '~';
  if (G.mk === 'town' || G.mk === 'room') { if (TSOLID.indexOf(c) >= 0) return true; return !!folkAt(x, y); }
  if (c === '#' || c === 'c' || c === 's' || c === 'B') { if (c === 'B' && S.flags['boss_' + G.mid]) return false; return true; }
  return false;
}
var DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
function fieldUpdate(dt) {
  if (DLG) { dlgUpdate(dt); return; }
  if (UI.length) { uiUpdate(dt); return; }
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  if (fade > 0) fade -= dt;
  if (G.mk === 'town') updFolk(dt);
  var sp = (KIT.held('b') ? 10 : 6) * TS;
  if (P.moving) {
    var tx = P.x * TS, ty = P.y * TS, dx = tx - P.px, dy = ty - P.py, d = Math.hypot(dx, dy), st = sp * dt;
    P.t += dt; if (d <= st) { P.px = tx; P.py = ty; P.moving = false; arrived(); } else { P.px += dx / d * st; P.py += dy / d * st; }
    return;
  }
  var stk = KIT.stick(0), dir = KIT.held('up') || stk.y < -0.5 ? 'u' : KIT.held('down') || stk.y > 0.5 ? 'd' : KIT.held('left') || stk.x < -0.5 ? 'l' : KIT.held('right') || stk.x > 0.5 ? 'r' : null;
  if (dir) {
    P.dir = dir; var nx = P.x + DIRS[dir][0], ny = P.y + DIRS[dir][1], c = tile(nx, ny);
    if (G.mk === 'dun' && c === 'B' && !S.flags['boss_' + G.mid]) { bossTalk(); return; }
    if (G.mk === 'town' && (nx < 0 || ny < 0 || nx >= mapW() || ny >= mapH())) { leaveTown(); return; }
    if (!solid(nx, ny)) { P.x = nx; P.y = ny; P.moving = true; }
  } else P.t = 0;
  if (KIT.pressed('a')) interact();
}
function updFolk(dt) {
  buildTown(G.mid).folk.forEach(function (f) {
    f.t += dt;
    if (f.moving) { var tx = f.x * TS, ty = f.y * TS, dx = tx - f.px, dy = ty - f.py, d = Math.hypot(dx, dy), st = 2.4 * TS * dt; if (d <= st) { f.px = tx; f.py = ty; f.moving = false; f.wait = rnd(0.8, 3); } else { f.px += dx / d * st; f.py += dy / d * st; } return; }
    if (f.talking) return;
    f.wait -= dt; if (f.wait > 0) return;
    var ds = ['u', 'd', 'l', 'r'], dir = pick(ds), nx = f.x + DIRS[dir][0], ny = f.y + DIRS[dir][1]; f.dir = dir;
    if (Math.abs(nx - f.hx) > 3 || Math.abs(ny - f.hy) > 2 || solid(nx, ny) || (nx === P.x && ny === P.y) || tile(nx, ny) === 'D') { f.wait = rnd(0.5, 1.5); return; }
    f.x = nx; f.y = ny; f.moving = true;
  });
}
function arrived() {
  S.steps++; var c = tile(P.x, P.y);
  if (G.mk === 'world') {
    if (c === 'C' || c === 'E') { var T = buildTown(c); enter('town', c, 0, 1, 20, 'r'); return; }
    if (DUNGEONS[c]) { enterDungeon(c); return; }
    if (c === '.' || c === 'f') encounterCheck(c === 'f' ? 2 : 1);
  } else if (G.mk === 'town') {
    if (c === 'D') { var b = buildTown(G.mid).blds.filter(function (q) { return q.door.x === P.x && q.door.y === P.y; })[0]; if (b) { sfx.play('door'); enter('room', G.mid, 0, 9, 9, 'u', b.id); } }
  } else if (G.mk === 'room') {
    if (c === 'D') { var t2 = buildTown(G.mid), b2 = t2.blds.filter(function (q) { return q.id === G.bld; })[0]; sfx.play('door'); var bid = G.bld; enter('town', G.mid, 0, b2.door.x, b2.door.y + 1, 'd'); banner = null; }
  } else if (G.mk === 'dun') {
    if (c === '<') { if (G.floor > 0) { var prev = DUNGEONS[G.mid].floors[G.floor - 1], pt = findTile(FLOORS[prev], '>'); enter('dun', G.mid, G.floor - 1, pt.x - 1, pt.y, 'l'); } else exitDungeon(); return; }
    if (c === '>') { var nf = DUNGEONS[G.mid].floors[G.floor + 1], p2 = findTile(FLOORS[nf], '<'); enter('dun', G.mid, G.floor + 1, p2.x + 1, p2.y, 'r'); return; }
    if (c === '.') encounterCheck(1);
  }
}
function enterDungeon(k) {
  var D = DUNGEONS[k];
  if (D.need && !D.need.every(function (f) { return S.flags[f]; })) { say([['', 'A wall of flesh blocks the way in. Three keyholes pulse in it: cream, bone and moon. ' + D.need.filter(function (f) { return S.flags[f]; }).length + ' of 3.']]); return; }
  if (S.flags['boss_' + k] && k !== 'K') { say([['', D.name + ' is quiet now.']], function () {}); }
  G.worldPos = { x: P.x, y: P.y }; var st = findTile(FLOORS[D.floors[0]], '<'); enter('dun', k, 0, st.x + 1, st.y, 'r');
}
function exitDungeon() { var wp = G.worldPos || worldSpot(G.mid); enter('world', null, 0, wp.x, wp.y + 1 < OVERWORLD.length && !'^~'.includes(OVERWORLD[wp.y + 1][wp.x]) ? wp.y + 1 : wp.y, 'd'); }
function worldSpot(c) { var p = findTile(OVERWORLD, c); return p || { x: 8, y: 20 }; }
function leaveTown() { var p = worldSpot(G.mid); enter('world', null, 0, p.x, p.y + 1, 'd'); }
function encounterCheck(mul) {
  G.encSteps++; var ch = Math.min(0.16, Math.max(0, (G.encSteps - 5) * 0.02)) * mul;
  if (Math.random() < ch) { G.encSteps = 0; startBattle(pickFormation(), false); }
}
function zoneHere() {
  if (G.mk === 'dun') return DUNGEONS[G.mid].zone;
  var x = P.x, y = P.y, c = tile(x, y);
  if (x >= 30) { if (y <= 9) return 'north'; return c === 'f' ? 'eforest' : 'east'; }
  if (c === 'f') return 'forest'; return y >= 16 ? 'plains1' : 'plains2';
}
function pickFormation() { var z = ZONES[zoneHere()]; return { foes: pick(z.f).map(function (id) { return foeStats(id, rndi(z.lv[0], z.lv[1])); }), bg: z.bg }; }
function facing() { return { x: P.x + DIRS[P.dir][0], y: P.y + DIRS[P.dir][1] }; }
function interact() {
  var f = facing(), c = tile(f.x, f.y);
  if (G.mk === 'town') { var fk = folkAt(f.x, f.y); if (fk) { fk.dir = { u: 'd', d: 'u', l: 'r', r: 'l' }[P.dir]; fk.talking = 1; say(fk.say.map(function (l) { return [fk.n, l]; }), function () { fk.talking = 0; }); return; }
    if (c === 'D') return; if (c === 'F') { say([['', 'The Cum Fountain. Someone has carved Cumhead on the top. It is, frankly, a good likeness.']]); return; } return; }
  if (G.mk === 'room') { roomInteract(f, c); return; }
  if (G.mk === 'dun') {
    if (c === 'c') openChest(f.x, f.y);
    else if (c === 's') { healAll(); save(); sfx.play('magic'); say([['', 'The crystal glows. Your wounds close. Your journey is saved.']]); }
    else if (c === 'B' && !S.flags['boss_' + G.mid]) bossTalk();
  }
}
function roomInteract(f, c) {
  var Rm = buildRoom(G.bld), B = Rm.B;
  if (c === 'A') { var cab = Rm.props.filter(function (p) { return p.k === 'cab' && p.x === f.x; })[0]; arcadeMenu(cab ? cab.i : 0); return; }
  if (c === 'P') { var pr = Rm.props.filter(function (p) { var sz = { bed: [2, 2], table: [2, 1], sofa: [3, 1] }[p.k] || [1, 1]; return f.x >= p.x && f.x < p.x + sz[0] && f.y >= p.y && f.y < p.y + sz[1]; })[0];
    if (pr && pr.k === 'bed' && B.home) { restParty(0, 'You sleep in your own bed. Everyone is back to full. (Saved.)'); return; }
    if (pr && pr.k === 'jukebox') { say([['', 'The jukebox plays something with a lot of bass.']]); return; }
    if (pr && pr.k === 'crystal') { save(); healAll(); sfx.play('magic'); say([['', 'The crystal hums. Your journey is saved and everyone feels fine.']]); return; }
    return; }
  if (c === 'C' || c === 'K') {
    if (B.home) { say(B.say); return; }
    if (B.tb) { say([['TB', pick(TBQ)]], function () { if (B.shop) shopUI(B); }); return; }
    var key = 'b_' + G.bld;
    if (B.give && !S.given[key]) { S.given[key] = 1; say(B.say, function () { S.inv[B.give] = (S.inv[B.give] || 0) + (B.give === 'garlic' ? 3 : 1); sfx.play('power'); say([['', 'Got ' + ITEMS[B.give].n + (B.give === 'garlic' ? ' x3' : '') + '.']], function () { if (B.shop) shopUI(B); }); }); return; }
    if (B.inn) { say([[B.who, B.say[0][1]]], function () { innUI(B); }); return; }
    if (B.shop || B.gear) { say([B.say[0]], function () { shopUI(B); }); return; }
    if (B.heal) { say(B.say.concat([['', 'Your heads clear. Everyone feels better.']]), function () { healAll(); sfx.play('magic'); }); return; }
    if (B.arcade) { say(B.say, function () { arcadeMenu(0); }); return; }
    say(B.say);
  }
}
function restParty(cost, msg) { S.drops -= cost; healAll(); S.party.forEach(function (m) { m.st = {}; }); fade = 1.2; sfx.play('magic'); save(); say([['', msg]]); }
function chestId(x, y) { return G.floorId + ':' + x + ',' + y; }
function openChest(x, y) {
  var id = chestId(x, y); if (S.chests[id]) { say([['', 'Empty.']]); return; }
  var list = DUNGEONS[G.mid].chests[G.floorId] || [], idx = 0, rows = FLOORS[G.floorId];
  for (var yy = 0; yy < rows.length; yy++) for (var xx = 0; xx < rows[yy].length; xx++) if (rows[yy][xx] === 'c') { if (xx === x && yy === y) { var it = list[idx] || ['drops', 100]; give(it); S.chests[id] = 1; sfx.play('power'); return; } idx++; }
}
function give(it) {
  if (it[0] === 'item') { S.inv[it[1]] = (S.inv[it[1]] || 0) + 1; say([['', 'Found ' + ITEMS[it[1]].n + '.']]); }
  else if (it[0] === 'gear') { S.gear[it[1]] = (S.gear[it[1]] || 0) + 1; var g = GEAR[it[1]]; say([['', 'Found ' + g.n + '! (' + (g.w === 'all' ? 'anyone' : HEROES[g.w].name) + ' can use it. Equip it from the menu.)']]); }
  else if (it[0] === 'drops') { S.drops += it[1]; say([['', 'Found ' + it[1] + ' drops.']]); }
}
function healAll() { S.party.forEach(function (m) { m.hp = maxHp(m); m.mp = maxMp(m); }); }
function bossTalk() {
  var D = DUNGEONS[G.mid], id = D.boss, lines = id === 'blum' ? STORY.blumPre : id === 'void' ? STORY.voidPre : [['', BOSSES[id].n + ' blocks the way.']];
  say(lines, function () { startBattle({ foes: [foeStats(id, BOSSES[id].lv, true)], bg: ZONES[D.zone].bg }, true); });
}

/* ---------- the arcade: the real games, in a frame over this one ---------- */
var arcEl = null;
function openArcadeGame(i) {
  var g = ARCADE[i]; if (!g) return; music.stop(0.3);
  arcEl = document.createElement('div'); arcEl.style.cssText = 'position:fixed;inset:0;z-index:50;background:#000;display:flex;flex-direction:column';
  arcEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#0e0618;color:#ffe36a;font:12px \'Press Start 2P\',monospace"><span>' + g[1].toUpperCase() + '</span><button type="button" style="font:inherit;color:#f1e7d0;background:#3a0a10;border:0;padding:8px 12px;cursor:pointer">✕ LEAVE</button></div><iframe style="flex:1;border:0;width:100%" allow="autoplay; fullscreen"></iframe>';
  document.body.appendChild(arcEl); var fr = arcEl.querySelector('iframe'); fr.src = g[0];
  arcEl.querySelector('button').addEventListener('click', closeArcadeGame);
  fr.onload = function () { try { fr.contentWindow.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeArcadeGame(); }); fr.contentWindow.focus(); } catch (x) {} };
  G.inArcade = 1;
}
function closeArcadeGame() { if (!arcEl) return; arcEl.remove(); arcEl = null; G.inArcade = 0; try { window.focus(); } catch (e) {} music.play('aohub'); }
window.addEventListener('keydown', function (e) { if (G.inArcade && e.key === 'Escape') { closeArcadeGame(); e.preventDefault(); } });

/* ---------- dialogue ---------- */
function say(lines, done) { DLG = { lines: lines, i: 0, ch: 0, done: done }; }
function dlgUpdate(dt) {
  var l = DLG.lines[DLG.i], txt = l[1]; DLG.ch = Math.min(txt.length, DLG.ch + dt * 70);
  if (KIT.pressed('a') || KIT.ptr.tap) {
    if (DLG.ch < txt.length) DLG.ch = txt.length;
    else { DLG.i++; DLG.ch = 0; sfx.play('blip'); if (DLG.i >= DLG.lines.length) { var d = DLG.done; DLG = null; if (d) d(); } }
  }
}
function drawDlg() {
  if (!DLG) return; var l = DLG.lines[DLG.i], y0 = G.mode === 'battle' ? 4 : H - 80; win7(10, y0, W - 20, 72);
  if (l[0]) text(l[0], 24, y0 + 8, { size: 8, col: '#ffe36a' });
  var lines = KIT.wrap(l[1].slice(0, Math.floor(DLG.ch)), W - 52, 15, 'body');
  lines.slice(0, 3).forEach(function (s, i) { text(s, 24, y0 + (l[0] ? 22 : 12) + i * 16, { size: 15, font: 'body', col: '#ffffff' }); });
  if (DLG.ch >= l[1].length && Math.floor(G.t * 3) % 2) hand(W - 34, y0 + 60);
}

/* ---------- field drawing ---------- */
var WTILE = { '.': '#2a0a0e', ',': '#4a3a34', 'f': '#22080c', '^': '#1a0a12', '~': '#3a0408', '=': '#5a3a24' };
function cam() { var mw = mapW() * TS, mh = mapH() * TS; var cx = mw <= W ? (mw - W) / 2 : clamp(P.px + 8 - W / 2, 0, mw - W), cy = mh <= H ? (mh - H) / 2 : clamp(P.py + 8 - H / 2, 0, mh - H); return { x: Math.round(cx), y: Math.round(cy) }; }
function drawField() {
  var r = mapRows(), c = cam(); R('#070405', 0, 0, W, H);
  var x0 = Math.max(0, Math.floor(c.x / TS)), y0 = Math.max(0, Math.floor(c.y / TS)), x1 = Math.min(r[0].length - 1, x0 + 31), y1 = Math.min(r.length - 1, y0 + 18);
  var ents = [];
  if (G.mk === 'town') { drawTownLayer(c); }
  else if (G.mk === 'room') { drawRoom(c, ents); }
  else for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
    var ch = r[y][x], px = x * TS - c.x, py = y * TS - c.y;
    if (G.mk === 'world') drawWorldTile(ch, px, py, x, y, ents); else drawDunTile(ch, px, py, x, y, ents);
  }
  if (G.mk === 'town') townEnts(c, ents);
  ents.push({ y: P.py + 16, d: function () { drawHero(P.px - c.x + 8, P.py - c.y + 16); } });
  ents.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { e.d(); });
  if (G.mk === 'town') { var lit = G.mid === 'E'; KIT.blit(KIT.layer('jv-night-' + G.mid, W, H, function () { var g = KIT.ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 290); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, lit ? 'rgba(20,0,10,0.5)' : 'rgba(0,0,0,0.45)'); KIT.ctx.fillStyle = g; KIT.ctx.fillRect(0, 0, W, H); }), 0, 0); }
  if (fade > 0) R('rgba(0,0,0,' + Math.min(1, fade * 2.5) + ')', 0, 0, W, H);
  if (banner) { var a = Math.min(1, banner.t * 2); win7(W / 2 - 130, 12, 260, banner.b ? 40 : 30, a); text(banner.a, W / 2, 17, { align: 'center', size: 18, font: 'title', col: '#ffffff', alpha: a, max: 250 }); if (banner.b) text(banner.b, W / 2, 41, { align: 'center', size: 6, alpha: a }); }
  if (G.mk === 'town') { var near = buildTown(G.mid).blds.filter(function (b) { return Math.abs(P.x - b.door.x) <= 1 && (P.y === b.door.y + 1 || P.y === b.door.y + 2); })[0]; if (near && !banner && !DLG) { var nm = BUILDINGS[near.id].n.toUpperCase(), tw = KIT.tw(nm, 8) + 24; win7(W / 2 - tw / 2, 10, tw, 22); text(nm, W / 2, 17, { align: 'center', size: 8, col: '#ffffff' }); } }
  if (G.mk === 'world') { var z = { plains1: 'THE RED WASTE', plains2: 'THE RED WASTE', forest: 'DEAD WOOD', east: 'PAST THE BLOOD SEA', eforest: 'DEAD WOOD', north: 'THE PEAKS' }[zoneHere()] || ''; text(z, 8, H - 14, { size: 6, col: '#a6968f' }); text(S.drops + ' DROPS', W - 8, H - 14, { size: 6, col: '#ffe36a', align: 'right' }); }
  drawDlg(); drawUI();
}
function drawWorldTile(ch, px, py, x, y, ents) {
  var base = ch === ',' || ch === '=' ? WTILE[ch] : ch === '~' ? WTILE['~'] : ch === '^' ? '#24101a' : '#2a0a0e';
  R(base, px, py, TS, TS);
  if (ch === '.' || ch === 'f') { if ((x * 7 + y * 13) % 5 === 0) R('#3a1014', px + (x * 3) % 12, py + (y * 5) % 12, 2, 1); if ((x * 11 + y) % 7 === 0) R('#4a1a16', px + 6, py + 9, 1, 2); }
  if (ch === ',') { R('#5a4a40', px + (x % 3) * 4, py + (y % 3) * 5, 3, 2); }
  if (ch === '~') { var w = Math.sin(G.t * 2 + x * 0.7 + y) > 0.6; R('#5a060c', px, py + 4, TS, 2); if (w) R('#8a1018', px + 4, py + 8, 6, 1); }
  if (ch === '=') { for (var i = 0; i < 4; i++) R('#3a2416', px, py + i * 4, TS, 1); }
  if (ch === 'f') ents.push({ y: py + 18, d: function () { spr('jv_tree', px + 8, py + 18); } });
  if (ch === '^') ents.push({ y: py + 16, d: function () { spr('jv_mtn', px + 8, py + 16); } });
  var pl = { C: 'jv_pl_clubhouse', E: 'jv_pl_park', K: 'jv_pl_castle', S: 'jv_pl_sewer', B: 'jv_pl_bone', M: 'jv_pl_tower', L: 'jv_pl_lair' }[ch];
  if (pl) { R(WTILE['.'], px, py, TS, TS); ents.push({ y: py + 16, d: function () { spr(pl, px + 8, py + 18); } }); }
}
/* the town: the ground is drawn once into a layer (it never changes), the things with height are sorted with the people */
var TTHEME = { red: { grass: ['#2a120e', '#30160f', '#26100c'], cob: ['#5a4a42', '#4a3c36', '#6a5a50'], fence: '#3a2416', water: '#e8d8b0' }, park: { grass: ['#1a0a14', '#200c18', '#160810'], cob: ['#3a1a2a', '#2a1020', '#4a2234'], fence: '#c4121c', water: '#f1e0b0' } };
function drawTownLayer(c) {
  var T = buildTown(G.mid), th = TTHEME[T.sp.theme];
  var L = KIT.layer('jv-town-' + G.mid, T.w * TS, T.h * TS, function () {
    for (var y = 0; y < T.h; y++) for (var x = 0; x < T.w; x++) {
      var ch = T.rows[y][x], px = x * TS, py = y * TS, hsh = (x * 73 + y * 151) % 7;
      R(th.grass[hsh % 3], px, py, TS, TS); if (hsh === 0) { R('#3a1a12', px + 3, py + 5, 1, 2); R('#3a1a12', px + 5, py + 4, 1, 3); }
      if (ch === ',' || ch === 'F' || ch === 'b' || ch === 'L' || ch === 'D') { R(th.cob[1], px, py, TS, TS); R(th.cob[0], px + 1, py + 1, 6, 6); R(th.cob[0], px + 9, py + 1, 6, 6); R(th.cob[2], px + 5, py + 9, 6, 6); R(th.cob[0], px - 3 + 16, py + 9, 3, 6); R(th.cob[0], px, py + 9, 4, 6); }
      if (ch === '#') { R(th.fence, px, py + 6, TS, 3); R(th.fence, px + 2, py + 2, 3, 12); R(th.fence, px + 11, py + 2, 3, 12); R('rgba(0,0,0,0.3)', px, py + 14, TS, 2); }
      if (ch === '~') { R('#5a060c', px, py, TS, TS); if ((x + y) % 2) R('#8a1018', px + 3, py + 6, 8, 1); }
      if (ch === 'f') { R('#1a2a10', px + 1, py + 2, 14, 12); for (var k = 0; k < 4; k++) { var fx = px + 2 + ((x * 5 + k * 7) % 11), fy = py + 3 + ((y * 3 + k * 5) % 9); R(['#ff2630', '#ffe36a', '#ff6aa0', '#ffffff'][k], fx, fy, 2, 2); } }
    }
    // the fountain basin, painted under the statue
    var fp = findTile(T.rows.map(function (r) { return r.join(''); }), 'F'); if (fp) { var bx = fp.x * TS + 24, by = fp.y * TS + 26, cc = KIT.ctx; [[30, 22, '#2a2224'], [28, 20, '#8a7a70'], [25, 17, '#5a4a44'], [22, 15, th.water]].forEach(function (e) { cc.fillStyle = e[2]; cc.beginPath(); cc.ellipse(bx, by, e[0], e[1], 0, 0, 6.28); cc.fill(); }); }
  });
  KIT.blit(L, -c.x, -c.y);
}
function townEnts(c, ents) {
  var T = buildTown(G.mid), th = TTHEME[T.sp.theme];
  // the fountain: cream water rippling, Cumhead on top, jets of cream
  var fp = null; for (var y = 0; y < T.h && !fp; y++) { var xx = T.rows[y].indexOf('F'); if (xx >= 0) fp = { x: xx, y: y }; }
  if (fp) { var fx = fp.x * TS - c.x, fy = fp.y * TS - c.y;
    for (var r2 = 0; r2 < 3; r2++) { var k = (G.t * 0.8 + r2 / 3) % 1; KIT.ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - k)) + ')'; KIT.ctx.lineWidth = 1; KIT.ctx.beginPath(); KIT.ctx.ellipse(fx + 24, fy + 26, 6 + k * 14, 3 + k * 7, 0, 0, 6.28); KIT.ctx.stroke(); }
    ents.push({ y: fy + 40 + c.y - c.y, d: function () {
      R('#5a4a44', fx + 18, fy + 2, 12, 26); R('#8a7a70', fx + 19, fy + 2, 4, 26); R('#5a4a44', fx + 14, fy + 2, 20, 4); spr('cumface', fx + 24, fy + 4, { sc: 1.3 });
      for (var j = 0; j < 14; j++) { var a = (j / 14) * Math.PI * 2, t2 = (G.t * 1.6 + j * 0.37) % 1; var jx = fx + 24 + Math.cos(a) * t2 * 18, jy = fy - 2 + t2 * 26 - Math.sin(t2 * Math.PI) * 14; R(t2 > 0.8 ? '#ffffff' : '#fff6d8', jx, jy, 2, 2); } } }); }
  // lamps, benches, barrels, trees: anything with height
  for (var y2 = 0; y2 < T.h; y2++) for (var x2 = 0; x2 < T.w; x2++) {
    var ch = T.rows[y2][x2], px = x2 * TS - c.x, py = y2 * TS - c.y; if (px < -64 || px > W + 64 || py < -80 || py > H + 32) continue;
    (function (ch, px, py) {
      if (ch === 'T') ents.push({ y: py + 16, d: function () { spr('jv_tree', px + 8, py + 18, { sc: 1.3 }); } });
      else if (ch === 'L') ents.push({ y: py + 16, d: function () { R('rgba(255,227,106,0.08)', px - 12, py - 12, 40, 34); spr('jv_lamp1', px + 8, py + 16); } });
      else if (ch === 'b') ents.push({ y: py + 14, d: function () { spr('jv_bench', px + 8, py + 15); } });
      else if (ch === 'r') ents.push({ y: py + 16, d: function () { spr('jv_barrel', px + 8, py + 16); } });
    })(ch, px, py);
  }
  // the buildings
  T.blds.forEach(function (b) {
    var B = BUILDINGS[b.id], cx = (b.x + 2.5) * TS - c.x, by = (b.y + 4) * TS - c.y; if (cx < -80 || cx > W + 80) return;
    ents.push({ y: by, d: function () { drawBuilding(B, cx, by); } });
  });
  T.folk.forEach(function (f) { var x = f.px - c.x + 8, y = f.py - c.y + 16; ents.push({ y: y, d: function () { var bob = f.moving ? Math.abs(Math.sin(f.t * 12)) * 2 : Math.sin(f.t * 2.4) * 0.6; R('rgba(0,0,0,0.3)', x - 7, y - 2, 14, 3); spr(f.s, x, y - bob, { sc: f.s.indexOf('h_') === 0 ? 0.6 : f.s.indexOf('steve') === 0 ? 0.7 : 0.85, flip: f.dir === 'l' }); } }); });
}
function drawBuilding(B, cx, by) {
  R('rgba(0,0,0,0.35)', cx - 40, by - 4, 80, 6);
  if (B.fac && KIT.has(B.fac)) { var sz = KIT.size(B.fac), sc = Math.min(1.2, 80 / sz.w); spr(B.fac, cx, by, { sc: sc }); }
  else { // a plain shop: walls, a roof in the owner's colour, a sign, a door, windows with light
    R('#12040a', cx - 38, by - 54, 76, 54); R('#3a2a24', cx - 36, by - 52, 72, 52); for (var y = by - 50; y < by; y += 6) R('#2e201a', cx - 36, y, 72, 1);
    KIT.ctx.fillStyle = '#12040a'; KIT.ctx.beginPath(); KIT.ctx.moveTo(cx - 44, by - 50); KIT.ctx.lineTo(cx, by - 78); KIT.ctx.lineTo(cx + 44, by - 50); KIT.ctx.fill();
    KIT.ctx.fillStyle = B.roof || '#5a0a10'; KIT.ctx.beginPath(); KIT.ctx.moveTo(cx - 40, by - 52); KIT.ctx.lineTo(cx, by - 74); KIT.ctx.lineTo(cx + 40, by - 52); KIT.ctx.fill();
    R('#ffe36a', cx - 30, by - 40, 14, 12); R('#ffe36a', cx + 16, by - 40, 14, 12); R('#12040a', cx - 24, by - 40, 2, 12); R('#12040a', cx + 22, by - 40, 2, 12);
    R('#1a0a0c', cx - 9, by - 26, 18, 26); R('#5a2a14', cx - 7, by - 24, 14, 24); R('#ffe36a', cx + 3, by - 12, 2, 2);
    R('#12040a', cx - 30, by - 50, 60, 9); R('#e8dcc8', cx - 29, by - 49, 58, 7); text(B.n.split(' ')[0].replace("'s", '').toUpperCase(), cx, by - 49, { align: 'center', size: 4, col: '#12040a', shadow: false, max: 56 });
  }
}
function drawRoom(c, ents) {
  var Rm = buildRoom(G.bld), B = Rm.B, ox = -c.x, oy = -c.y;
  KIT.blit(KIT.layer('jv-room-' + G.bld, Rm.w * TS, Rm.h * TS, function () {
    for (var y = 0; y < Rm.h; y++) for (var x = 0; x < Rm.w; x++) { var ch = Rm.rows[y][x], px = x * TS, py = y * TS;
      if (ch === '#') { R(B.wall, px, py, TS, TS); if (y === 1) { R('rgba(255,255,255,0.06)', px, py + 12, TS, 4); R('rgba(0,0,0,0.3)', px, py + 15, TS, 1); } continue; }
      R((x + y) % 2 ? B.floor[0] : B.floor[1], px, py, TS, TS); R('rgba(0,0,0,0.12)', px, py + 15, TS, 1); }
    R('#12040a', 9 * TS, (Rm.h - 1) * TS, TS, TS); R('#3a1a10', 9 * TS + 2, (Rm.h - 1) * TS + 2, TS - 4, TS - 2); // the way out
    for (var w = 1; w < Rm.w - 1; w += 4) { R('#0a0406', w * TS + 4, 6, 20, 14); R('rgba(255,227,106,0.25)', w * TS + 6, 8, 16, 10); } // windows
  }), ox, oy);
  var cy = 4 * TS + oy;
  if (B.keeper || B.home || G.bld === 'greebo') { ents.push({ y: cy + 16, d: function () { R('#12040a', 6 * TS + ox, cy + 2, 6 * TS, 14); R('#6e3a1e', 6 * TS + ox, cy, 6 * TS, 12); R('#a8643a', 6 * TS + ox, cy, 6 * TS, 3); if (G.bld === 'greebo') { spr('wn_d_q', 8 * TS + ox, cy + 2); spr('wn_d_q', 10 * TS + ox, cy + 2); } } }); }
  if (B.keeper) ents.push({ y: cy, d: function () { var bob = Math.sin(G.t * 2) * 0.8; spr(B.keeper, 9 * TS + 8 + ox, cy + bob, { sc: B.keeper.indexOf('steve') === 0 ? 0.7 : 1 }); if (B.helper) spr(B.helper, 11 * TS + 12 + ox, cy - 2, { sc: 0.9 }); } });
  Rm.props.forEach(function (p) {
    var px = p.x * TS + ox, py = p.y * TS + oy;
    var f = { bed: ['jv_bed', 16, 34], table: ['wn_table', 16, 18], jukebox: ['wn_jukebox', 8, 16], plant: ['wn_plant', 8, 16], taps: ['wn_st_tap0', 8, 16], barrel: ['jv_barrel', 8, 16], coffee: ['wn_st_mach0', 8, 16], rack: ['jv_rack', 8, 16], crystal: ['jv_crystal', 8, 16], tea: ['wn_d_p', 8, 14], pots: ['wn_potd0', 8, 16], oven: ['wn_st_oven1', 8, 16], sofa: ['jv_sofa', 24, 16], mat: ['jv_mat', 16, 14] }[p.k];
    if (p.k === 'cab') { var cabs = ['ao_cab_r', 'ao_cab_p', 'ao_cab_b', 'ao_cab_g', 'ao_cab_r']; ents.push({ y: py + 16, d: function () { spr(cabs[p.i], px + 8, py + 16, { sc: 0.7 }); R(['#ff2630', '#c08aff', '#7af0ff', '#9aff5a', '#ffe36a'][p.i], px + 4 + (Math.floor(G.t * 6 + p.i) % 3) * 3, py - 20, 3, 3); } }); return; }
    if (f) ents.push({ y: py + f[2], d: function () { spr(f[0], px + f[1], py + f[2]); } });
  });
}
var DUNCOL = { castle: ['#5a3a42', '#14080c', '#3a2228'], sewer: ['#5a4a30', '#100c06', '#3a3020'], bone: ['#6a604e', '#14100c', '#3e362a'], moon: ['#6a1420', '#100204', '#3e0a14'], lair: ['#6a1a44', '#0e0208', '#3a0a24'], void: ['#3a2a4a', '#000000', '#140a20'] };
function drawDunTile(ch, px, py, x, y, ents) {
  var col = DUNCOL[DUNGEONS[G.mid].zone] || DUNCOL.castle;
  if (ch === '#') { R(col[1], px, py, TS, TS); var below = tile(x, y + 1); if (below !== '#') { R(col[0], px, py + 4, TS, 12); R('rgba(255,255,255,0.08)', px, py + 4, TS, 1); for (var b = 0; b < 2; b++) R('rgba(0,0,0,0.3)', px + (y % 2) * 8, py + 10, 1, 6); } return; }
  R(col[2], px, py, TS, TS); if ((x + y) % 2) R('rgba(255,255,255,0.03)', px, py, TS, TS);
  if (G.mid === 'V') { if ((x * 7 + y * 3 + Math.floor(G.t)) % 9 === 0) R('#ffe36a', px + 7, py + 7, 1, 1); }
  if (ch === 'c') { var open = S.chests[chestId(x, y)]; ents.push({ y: py + 16, d: function () { spr(open ? 'p_chestopen' : 'p_chest', px + 8, py + 16); } }); }
  if (ch === 's') ents.push({ y: py + 16, d: function () { spr('jv_crys' + (Math.floor(G.t * 2) % 2), px + 8, py + 18, { sc: 0.8 }); } });
  if (ch === '<' || ch === '>') { R('#12040a', px + 2, py + 2, 12, 12); for (var i = 0; i < 4; i++) R(ch === '>' ? '#6a5a5e' : '#a6968f', px + 3 + (ch === '>' ? i : 0), py + 3 + i * 3, 10 - i * 2, 2); }
  if (ch === 'B' && !S.flags['boss_' + G.mid]) { var B = BOSSES[DUNGEONS[G.mid].boss], f = KIT.has(B.s + '0') ? B.s + (Math.floor(G.t * 3) % 2) : B.s, sz = KIT.size(f), sc = Math.min(1, 46 / sz.h); ents.push({ y: py + 16, d: function () { spr(f, px + 8, py + 16 + Math.sin(G.t * 2) * 1, { sc: sc }); } }); }
}
function drawHero(x, y) { // the chibi Cumhead leads the party
  var d = P.dir === 'u' ? 'u' : P.dir === 'd' ? 'd' : 's', f = P.moving ? Math.floor(P.t * 9) % 4 : 0;
  R('rgba(0,0,0,0.35)', x - 7, y - 2, 14, 3);
  spr('chb_' + d + f, x, y + 1, { flip: P.dir === 'l', sc: G.mk === 'world' ? 0.75 : 0.85 });
}
