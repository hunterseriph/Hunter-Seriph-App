/* =====================================================================================================
   JOURNEY TO THE VOID: a Final Fantasy style RPG. Cumhead, Spermaid and Greebo walk the world map,
   the towns and the dungeons; foes jump them in turn-based battles (everyone picks a command, then the
   round plays out in speed order). Levels, skills, gear, shops, inns, save crystals, three keys, Blumhead,
   and at the end of it all, the Void.
   ===================================================================================================== */
var W = 480, H = 270, TS = 16;
var R = KIT.R, spr = KIT.spr, text = KIT.text;
var G = { mode: 'title', t: 0 }, S, P, DLG = null, BT = null, banner = null, fade = 0;

/* ---------- the save ---------- */
function newSave() {
  return { party: ['cumhead', 'spermaid', 'greebo'].map(function (id) { var h = HEROES[id]; return { id: id, lv: 1, xp: 0, hp: h.hp, mp: h.mp, wpn: h.wpn, arm: h.arm }; }),
    inv: { puff: 4, garlic: 2 }, gear: {}, drops: 120, flags: {}, chests: {}, given: {}, map: { k: 'town', id: 'C', x: 14, y: 8 }, t: 0, steps: 0 };
}
function save() { S.map = { k: G.mk, id: G.mid, floor: G.floor, x: P.x, y: P.y, dir: P.dir }; KIT.save('jv-save', S); }
function hasSave() { return !!KIT.load('jv-save', null); }

/* ---------- party maths ---------- */
function stat(m, k) { var h = HEROES[m.id], v = h[k] + h.grow[k] * (m.lv - 1); var w = GEAR[m.wpn] || {}, a = GEAR[m.arm] || {}; v += (w[k] || 0) + (a[k] || 0); return Math.round(v); }
function maxHp(m) { return stat(m, 'hp'); } function maxMp(m) { return stat(m, 'mp'); }
function xpNext(lv) { return Math.round(14 * Math.pow(lv, 1.75)); }
function skillsOf(m) { return SKILLS[m.id].filter(function (s) { return s.lv <= m.lv; }); }
function alive(m) { return m.hp > 0; }
function foeStats(id, lv, boss) {
  var f = boss ? BOSSES[id] : FOES[id], L = lv;
  var o = { id: id, n: f.n, s: f.s, lv: L, sk: f.sk || [], weak: f.weak, boss: !!boss, summon: f.summon, next: f.next,
    hp: boss ? Math.round(f.hp * 1.6) : Math.round((22 + L * 15) * (f.hpk || 1)), atk: Math.round(8 + L * 3.6 * (boss ? 1.3 : 1)), def: Math.round((2 + L * 1.7) * (f.defk || 1)),
    mag: Math.round(6 + L * 3.3 * (boss ? 1.3 : 1)), spd: Math.round(5 + L * 0.95), xp: Math.round((8 + Math.pow(L, 1.8) * 2.4) * (boss ? 9 : 1)), drops: Math.round((6 + L * 5) * (boss ? 10 : 1)) };
  o.mhp = o.hp; return o;
}

/* ---------- the field: world map, towns and dungeons ---------- */
function mapRows() { return G.mk === 'world' ? OVERWORLD : G.mk === 'town' ? TOWNS[G.mid].rows : FLOORS[G.floorId]; }
function tile(x, y) { var r = mapRows(); if (y < 0 || y >= r.length || x < 0 || x >= r[0].length) return G.mk === 'world' ? '^' : G.mk === 'town' ? ',' : '#'; return r[y][x]; }
function enter(mk, id, floor, x, y, dir) {
  G.mk = mk; G.mid = id; G.floor = floor || 0; G.floorId = mk === 'dun' ? DUNGEONS[id].floors[G.floor] : null;
  P = { x: x, y: y, px: x * TS, py: y * TS, dir: dir || 'd', moving: false, t: 0 }; G.mode = 'field'; fade = 0.4;
  if (mk === 'world') { music.play('jvworld'); banner = null; }
  else if (mk === 'town') { music.play(TOWNS[id].song); banner = { t: 2.2, a: TOWNS[id].name.toUpperCase() }; }
  else { var D = DUNGEONS[id]; music.play(D.song); banner = { t: 2.2, a: D.name.toUpperCase(), b: D.floors.length > 1 ? 'FLOOR ' + (G.floor + 1) : '' }; }
  G.encSteps = 0;
}
function findTile(rows, c) { for (var y = 0; y < rows.length; y++) { var x = rows[y].indexOf(c); if (x >= 0) return { x: x, y: y }; } return null; }
function solid(x, y) {
  var c = tile(x, y);
  if (G.mk === 'world') return c === '^' || c === '~';
  if (G.mk === 'town') { if (c === '#' || c === 'h') return true; return !!TOWNS[G.mid].people[c]; }
  if (c === '#' || c === 'c' || c === 's' || c === 'B') { if (c === 'B' && S.flags['boss_' + G.mid]) return false; return true; }
  return false;
}
var DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
function fieldUpdate(dt) {
  if (DLG) { dlgUpdate(dt); return; }
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  if (fade > 0) fade -= dt;
  var sp = (KIT.held('b') ? 10 : 6) * TS;
  if (P.moving) {
    var tx = P.x * TS, ty = P.y * TS, dx = tx - P.px, dy = ty - P.py, d = Math.hypot(dx, dy), st = sp * dt;
    if (d <= st) { P.px = tx; P.py = ty; P.moving = false; arrived(); } else { P.px += dx / d * st; P.py += dy / d * st; }
    P.t += dt; return;
  }
  var dir = KIT.held('up') ? 'u' : KIT.held('down') ? 'd' : KIT.held('left') ? 'l' : KIT.held('right') ? 'r' : null;
  if (dir) {
    P.dir = dir; var nx = P.x + DIRS[dir][0], ny = P.y + DIRS[dir][1];
    var c = tile(nx, ny);
    if (G.mk === 'dun' && c === 'B' && !S.flags['boss_' + G.mid]) { bossTalk(); return; }
    if (G.mk === 'town' && (nx < 0 || ny < 0 || nx >= 30 || ny >= 17)) { leaveTown(); return; }
    if (!solid(nx, ny)) { P.x = nx; P.y = ny; P.moving = true; }
  }
  if (KIT.pressed('a')) interact();
}
function arrived() {
  S.steps++; var c = tile(P.x, P.y);
  if (G.mk === 'world') {
    if (c === 'C' || c === 'E') { var t = TOWNS[c].rows, sp2 = findTile(t, ','); enter('town', c, 0, 1, 8, 'r'); return; }
    if (DUNGEONS[c]) { enterDungeon(c); return; }
    if (c === '.' || c === 'f') encounterCheck(c === 'f' ? 2 : 1);
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
  if (G.mk === 'town') { var who = TOWNS[G.mid].people[c]; if (who) talkTo(who, c); return; }
  if (G.mk === 'dun') {
    if (c === 'c') openChest(f.x, f.y);
    else if (c === 's') { healAll(); save(); sfx.play('magic'); say([['', 'The crystal glows. Your wounds close. Your journey is saved.']]); }
    else if (c === 'B' && !S.flags['boss_' + G.mid]) bossTalk();
  }
}
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
function talkTo(who, c) {
  var key = G.mid + c;
  if (who.tb) { say([['TB', pick(TBQ)]]); return; }
  var lines = who.say.map(function (l, i) { return [who.n, l]; });
  if (who.inn) { say([[who.n, who.say[0]], [who.n, 'A bed for the night is ' + who.inn + ' drops.']], function () { innMenu(who); }); return; }
  if (who.shop) { say([[who.n, who.say[0]]], function () { shopMenu(who); }); return; }
  if (who.gear) { say([[who.n, who.say[0]]], function () { gearShop(who); }); return; }
  if (who.heal) { say(lines.concat([['', 'Your heads clear. Everyone feels better.']]), function () { healAll(); sfx.play('magic'); }); return; }
  if (who.give && !S.given[key]) { S.given[key] = 1; say(lines, function () { S.inv[who.give] = (S.inv[who.give] || 0) + (who.give === 'garlic' ? 3 : 1); sfx.play('power'); say([['', 'Got ' + ITEMS[who.give].n + (who.give === 'garlic' ? ' x3' : '') + '.']]); }); return; }
  say(who.give ? [[who.n, who.say[0]]] : lines);
}
function bossTalk() {
  var D = DUNGEONS[G.mid], id = D.boss, lines = id === 'blum' ? STORY.blumPre : id === 'void' ? STORY.voidPre : [['', BOSSES[id].n + ' blocks the way.']];
  say(lines, function () { startBattle({ foes: [foeStats(id, BOSSES[id].lv, true)], bg: ZONES[D.zone].bg }, true); });
}

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
  if (!DLG) return; var l = DLG.lines[DLG.i]; KIT.panel(10, H - 78, W - 20, 70);
  if (l[0]) text(l[0], 24, H - 70, { size: 8, col: '#ffe36a' });
  var lines = KIT.wrap(l[1].slice(0, Math.floor(DLG.ch)), W - 52, 15, 'body');
  lines.slice(0, 3).forEach(function (s, i) { text(s, 24, H - (l[0] ? 56 : 66) + i * 16, { size: 15, font: 'body' }); });
  if (DLG.ch >= l[1].length && Math.floor(G.t * 3) % 2) R('#ffe36a', W - 30, H - 20, 6, 4);
}

/* ---------- battles ---------- */
var BGS = { waste: ['#1a0408', '#3a0a10', '#5a1a14'], forest: ['#0a0a06', '#1a1a10', '#2a2018'], castle: ['#14080e', '#2a1018', '#3e1820'], sewer: ['#141008', '#2a2214', '#4a3a20'],
  park: ['#100410', '#2a0820', '#4a0e2a'], bone: ['#100c08', '#2a241c', '#4a4030'], moon: ['#120204', '#3a0610', '#6a0a14'], lair: ['#0e0208', '#2a0618', '#4a0a2a'], void: ['#000000', '#0a0410', '#1a0a2a'] };
function startBattle(form, boss) {
  BT = { foes: form.foes, bg: form.bg, boss: boss, phase: 'intro', t: 0, ci: 0, cmd: 0, plans: [], q: [], msg: '', pops: [], fx: [], prevMode: G.mode, round: 0 };
  S.party.forEach(function (m) { m.st = {}; m.guard = false; });
  layoutFoes();
  G.mode = 'battle'; sfx.play('roar'); music.play(boss ? BOSSES[form.foes[0].id].song : 'jvbattle'); BT.flash = 0.5;
}
function layoutFoes() {
  var fs = BT.foes.filter(function (f) { return !f.gone; }), n = fs.length;
  fs.forEach(function (f, i) { if (f.boss) { f.x = 130; f.y = 185; } else { var col = i % 2, row = Math.floor(i / 2); f.x = 64 + col * 96 + (n === 1 ? 56 : 0); f.y = 118 + row * 50 + col * 20 + (n <= 2 ? 34 : 0); } });
}
function partyPos(i) { return { x: 370 + i * 26, y: 112 + i * 34 }; }
function liveFoes() { return BT.foes.filter(function (f) { return f.hp > 0 && !f.gone; }); }
function liveParty() { return S.party.filter(alive); }
function nextChooser(from) { for (var i = from; i < S.party.length; i++) if (alive(S.party[i])) return i; return -1; }
function battleUpdate(dt) {
  if (DLG) { dlgUpdate(dt); return; }
  BT.t += dt; if (BT.flash > 0) BT.flash -= dt;
  BT.pops.forEach(function (p) { p.t -= dt; p.y -= 20 * dt; }); BT.pops = BT.pops.filter(function (p) { return p.t > 0; });
  BT.foes.forEach(function (f) { if (f.flash > 0) f.flash -= dt; if (f.hp <= 0 && !f.gone) { f.fade = (f.fade || 0) + dt; if (f.fade > 0.6) f.gone = true; } });
  if (BT.phase === 'intro') { if (BT.t > 0.9) { BT.msg = BT.boss ? BT.foes[0].n + '!' : (liveFoes().length > 1 ? 'Foes appear!' : liveFoes()[0].n + ' appears!'); startRound(); } return; }
  if (BT.phase === 'cmd') return cmdInput();
  if (BT.phase === 'sub') return subInput();
  if (BT.phase === 'target') return targetInput();
  if (BT.phase === 'exec') return execUpdate(dt);
  if (BT.phase === 'win' || BT.phase === 'lose') { BT.endT -= dt; if (BT.endT <= 0) { if (BT.phase === 'win') endWin(); else gameOver(); } }
}
function startRound() { BT.round++; BT.plans = []; BT.ci = nextChooser(0); BT.cmd = 0; BT.phase = BT.ci >= 0 ? 'cmd' : 'exec'; if (BT.ci < 0) buildQueue(); }
var CMDS = ['FIGHT', 'SKILL', 'ITEM', 'GUARD', 'RUN'];
function menuNav(n, cur) { if (KIT.pressed('down')) { sfx.play('tick'); return (cur + 1) % n; } if (KIT.pressed('up')) { sfx.play('tick'); return (cur + n - 1) % n; } return cur; }
function cmdInput() {
  BT.cmd = menuNav(CMDS.length, BT.cmd);
  var tapped = tapList(cmdRects()); if (tapped >= 0) { BT.cmd = tapped; }
  if (KIT.pressed('a') || tapped >= 0) {
    var c = CMDS[BT.cmd], m = S.party[BT.ci]; sfx.play('select');
    if (c === 'FIGHT') { BT.pending = { k: 'fight', who: m }; beginTarget('one'); }
    else if (c === 'SKILL') { BT.subList = skillsOf(m).map(function (s) { return { label: s.n, right: s.mp + ' MP', dis: m.mp < s.mp, v: s }; }); BT.subKind = 'skill'; BT.sub = 0; BT.phase = 'sub'; }
    else if (c === 'ITEM') { BT.subList = Object.keys(S.inv).filter(function (k) { return S.inv[k] > 0; }).map(function (k) { return { label: ITEMS[k].n, right: 'x' + S.inv[k], v: k }; }); if (!BT.subList.length) { sfx.play('no'); return; } BT.subKind = 'item'; BT.sub = 0; BT.phase = 'sub'; }
    else if (c === 'GUARD') { plan({ k: 'guard', who: m }); }
    else if (c === 'RUN') { if (BT.boss) { sfx.play('no'); BT.msg = 'No running from this one.'; return; } plan({ k: 'run', who: m }); }
  }
  if (KIT.pressed('b')) { // back to the previous member's choice
    for (var i = BT.ci - 1; i >= 0; i--) if (alive(S.party[i])) { BT.plans = BT.plans.filter(function (p) { return p.who !== S.party[i]; }); BT.ci = i; sfx.play('back'); return; }
  }
}
function subInput() {
  var n = BT.subList.length; BT.sub = menuNav(n, BT.sub);
  var tapped = tapList(subRects()); if (tapped >= 0) BT.sub = tapped;
  if (KIT.pressed('b')) { BT.phase = 'cmd'; sfx.play('back'); return; }
  if (KIT.pressed('a') || tapped >= 0) {
    var it = BT.subList[BT.sub], m = S.party[BT.ci]; if (!it || it.dis) { sfx.play('no'); return; }
    sfx.play('select');
    if (BT.subKind === 'skill') { BT.pending = { k: 'skill', who: m, s: it.v }; beginTarget(it.v.tg); }
    else { BT.pending = { k: 'item', who: m, item: it.v }; beginTarget(ITEMS[it.v].tg); }
  }
}
function beginTarget(tg) {
  BT.tg = tg;
  if (tg === 'all' || tg === 'allies' || tg === 'self' || tg === 'rand3') { BT.pending.tg = tg; plan(BT.pending); return; }
  BT.tlist = tg === 'one' ? liveFoes() : tg === 'deadally' ? S.party.filter(function (m) { return !alive(m); }) : liveParty();
  if (!BT.tlist.length) { sfx.play('no'); BT.phase = 'cmd'; return; }
  BT.tc = 0; BT.phase = 'target';
}
function targetInput() {
  var n = BT.tlist.length;
  if (KIT.pressed('down') || KIT.pressed('right')) { BT.tc = (BT.tc + 1) % n; sfx.play('tick'); }
  if (KIT.pressed('up') || KIT.pressed('left')) { BT.tc = (BT.tc + n - 1) % n; sfx.play('tick'); }
  var tapped = -1; if (KIT.ptr.tap) BT.tlist.forEach(function (t, i) { var r = targetRect(t); if (KIT.ptr.x >= r[0] && KIT.ptr.x <= r[0] + r[2] && KIT.ptr.y >= r[1] && KIT.ptr.y <= r[1] + r[3]) tapped = i; });
  if (tapped >= 0) BT.tc = tapped;
  if (KIT.pressed('b')) { BT.phase = BT.pending.k === 'fight' ? 'cmd' : 'sub'; sfx.play('back'); return; }
  if (KIT.pressed('a') || tapped >= 0) { sfx.play('select'); BT.pending.target = BT.tlist[BT.tc]; plan(BT.pending); }
}
function plan(p) {
  BT.plans.push(p); if (p.k === 'item') S.inv[p.item]--; // reserve the item now
  var nx = nextChooser(BT.ci + 1);
  if (nx >= 0) { BT.ci = nx; BT.cmd = 0; BT.phase = 'cmd'; } else buildQueue();
}
function buildQueue() {
  var q = BT.plans.slice();
  liveFoes().forEach(function (f) { q.push({ k: 'foe', who: f }); if (f.boss) q.push({ k: 'foe', who: f }); }); /* bosses act twice a round */
  q.forEach(function (a) { a.spd = (a.who.boss !== undefined ? a.who.spd : stat(a.who, 'spd')) * rnd(0.85, 1.15) + (a.k === 'guard' ? 100 : 0); });
  q.sort(function (a, b) { return b.spd - a.spd; });
  BT.q = q; BT.phase = 'exec'; BT.at = 0; BT.cur = null;
  S.party.forEach(function (m) { m.guard = false; }); BT.plans.forEach(function (p) { if (p.k === 'guard') p.who.guard = true; });
}
function execUpdate(dt) {
  if (!BT.cur) {
    if (!liveFoes().length) return win();
    if (!liveParty().length) return lose();
    var a = BT.q.shift();
    if (!a) { endRound(); return; }
    var actorAlive = a.k === 'foe' ? a.who.hp > 0 && !a.who.gone : alive(a.who);
    if (!actorAlive) return;
    if (a.k === 'guard') { BT.msg = a.who.name + ' guards.'; return; }
    BT.cur = a; BT.at = 0; a.done = false; return;
  }
  BT.at += dt; var a2 = BT.cur;
  if (!a2.done && BT.at > 0.35) { a2.done = true; doAction(a2); }
  if (BT.at > 1.0) BT.cur = null;
}
function heroName(m) { return HEROES[m.id].name; }
function doAction(a) {
  if (a.k === 'foe') return foeAct(a.who);
  var m = a.who, nm = heroName(m);
  if (a.k === 'run') { if (Math.random() < 0.6) { BT.msg = 'Got away!'; sfx.play('back'); BT.ran = true; BT.phase = 'win'; BT.endT = 0.6; BT.q = []; } else BT.msg = "Can't get away!"; return; }
  if (a.k === 'fight') { var t = retarget(a.target, 'one'); if (!t) return; BT.msg = nm + ' attacks!'; hitFoe(m, t, physDmg(m, t, 1, HEROES[m.id].el && m.id === 'cumhead' ? null : null)); return; }
  if (a.k === 'item') { useItem(a.item, a.target, a.tg, m); return; }
  if (a.k === 'skill') {
    var s = a.s; if (m.mp < s.mp) { BT.msg = nm + ' is out of MP.'; return; } m.mp -= s.mp; BT.msg = nm + ': ' + s.n + '!'; sfx.play(s.k === 'heal' || s.k === 'revive' ? 'magic' : 'power');
    if (s.k === 'phys' || s.k === 'mag') {
      var ts = s.tg === 'all' ? liveFoes() : s.tg === 'rand3' ? [0, 1, 2].map(function () { return pick(liveFoes()); }) : [retarget(a.target, 'one')];
      ts.forEach(function (t, i) { if (!t || t.hp <= 0) return; var d = s.k === 'phys' ? physDmg(m, t, s.pow, s.el) : magDmg(m, t, s.pow, s.el); hitFoe(m, t, d); if (s.st === 'blind' && Math.random() < 0.6) t.blind = 3; });
    } else if (s.k === 'heal') { (s.tg === 'allies' ? liveParty() : [retarget(a.target, 'ally')]).forEach(function (t) { if (!t) return; var h = Math.round(stat(m, 'mag') * s.pow + s.base); t.hp = Math.min(maxHp(t), t.hp + h); popAt(t, '+' + h, '#7dff9a'); if (s.cure) t.st = {}; }); }
    else if (s.k === 'revive') { (s.tg === 'allies' ? S.party.filter(function (q) { return !alive(q); }) : [a.target]).forEach(function (t) { if (t && !alive(t)) { t.hp = Math.round(maxHp(t) * s.pow); popAt(t, 'UP!', '#7dff9a'); } }); }
    else if (s.k === 'buff') { m.st.lock = 3; popAt(m, 'LOCKED IN', '#ffe36a'); }
    else if (s.k === 'steal') { var tt = retarget(a.target, 'one'); if (tt) { var g = Math.round(tt.drops * 0.4 + 10); S.drops += g; popFoe(tt, '+' + g + ' DROPS', '#ffe36a'); } }
  }
}
function retarget(t, kind) { if (kind === 'one') { if (t && t.hp > 0 && !t.gone) return t; var l = liveFoes(); return l.length ? pick(l) : null; } if (t && alive(t)) return t; var p = liveParty(); return p.length ? pick(p) : null; }
function physDmg(m, t, pow, el) {
  if (m.st && m.st.blind && Math.random() < 0.5) return { miss: true };
  var atk = stat(m, 'atk') * (m.st && m.st.lock ? 1.5 : 1), d = atk * pow * rnd(0.9, 1.1) - t.def * 0.5, crit = Math.random() < 0.07;
  if (crit) d *= 1.75; if (el && t.weak === el) d *= 2; return { n: Math.max(1, Math.round(d)), crit: crit, weak: el && t.weak === el };
}
function magDmg(m, t, pow, el) { var d = (stat(m, 'mag') * pow * 1.25 + 6) * rnd(0.92, 1.08) - t.def * 0.25; if (el && t.weak === el) d *= 2; return { n: Math.max(1, Math.round(d)), weak: el && t.weak === el }; }
function hitFoe(m, t, d) {
  if (d.miss) { popFoe(t, 'MISS', '#a6968f'); return; }
  t.hp -= d.n; t.flash = 0.25; sfx.play('hit'); popFoe(t, d.n + (d.crit ? '!' : ''), d.weak ? '#ffe36a' : '#f1e7d0'); if (d.weak) popFoe(t, 'WEAK', '#ff2630', 14);
  if (t.hp <= 0) { t.hp = 0; sfx.play('splat'); }
}
function useItem(id, t, tg, m) {
  var it = ITEMS[id]; BT.msg = heroName(m) + ' uses ' + it.n + '.';
  if (it.dmg) { (tg === 'all' ? liveFoes() : [retarget(t, 'one')]).forEach(function (f) { if (f) { hitFoe(m, f, { n: Math.round(it.dmg * rnd(0.9, 1.1)) }); } }); sfx.play('boom'); return; }
  var ts = tg === 'allies' ? S.party : [tg === 'deadally' ? t : retarget(t, 'ally')];
  ts.forEach(function (q) {
    if (!q) return;
    if (it.revive) { if (!alive(q)) { q.hp = Math.round(maxHp(q) * it.revive); popAt(q, 'UP!', '#7dff9a'); } return; }
    if (!alive(q)) return;
    if (it.heal) { var h = Math.min(it.heal, maxHp(q) - q.hp); q.hp += h; popAt(q, '+' + h, '#7dff9a'); }
    if (it.mp) { var mm = Math.min(it.mp, maxMp(q) - q.mp); q.mp += mm; popAt(q, '+' + mm + ' MP', '#7af0ff'); }
    if (it.cure) { q.st = {}; popAt(q, 'CURED', '#7dff9a'); }
  });
  sfx.play('magic');
}
/* what a foe does on its turn */
function foeAct(f) {
  var ts = liveParty(); if (!ts.length) return; var t = pick(ts), sk = f.sk.length && Math.random() < (f.boss ? 0.55 : 0.35) ? pick(f.sk) : 'hit';
  if (f.blind) f.blind--;
  if (sk === 'summon') { if (liveFoes().length < 4) { var mf = foeStats(f.summon, Math.max(1, f.lv - 4)); BT.foes.push(mf); layoutFoes(); BT.msg = f.n + ' calls for help!'; sfx.play('roar'); return; } sk = 'hit'; }
  if (sk === 'hit') { BT.msg = f.n + ' attacks!'; if (f.blind && Math.random() < 0.5) { popAt(t, 'MISS', '#a6968f'); return; } var d = (f.atk * (f.roar ? 1.3 : 1)) * rnd(0.9, 1.1) - stat(t, 'def') * 0.5; hurtHero(t, d); return; }
  if (sk === 'all') { BT.msg = f.n + (f.boss ? ' unleashes a storm!' : ' lashes out!'); liveParty().forEach(function (q) { hurtHero(q, f.atk * 0.7 * rnd(0.9, 1.1) - stat(q, 'def') * 0.4); }); KIT.shake(6); return; }
  if (sk === 'fire' || sk === 'blizzard') { BT.msg = f.n + ' casts ' + (sk === 'fire' ? 'Hellfire' : 'Black Ice') + '!'; hurtHero(t, f.mag * 1.5 * rnd(0.9, 1.1) - stat(t, 'mag') * 0.3); sfx.play('boom'); return; }
  if (sk === 'drain') { BT.msg = f.n + ' drains ' + heroName(t) + '!'; var d2 = Math.max(1, Math.round(f.mag * 1.1 - stat(t, 'mag') * 0.3)); hurtHero(t, d2); f.hp = Math.min(f.mhp, f.hp + d2); popFoe(f, '+' + d2, '#7dff9a'); return; }
  if (sk === 'poison') { BT.msg = f.n + ' bites!'; hurtHero(t, f.atk * 0.8 - stat(t, 'def') * 0.5); if (alive(t)) { t.st.poison = 4; popAt(t, 'POISON', '#9aff5a', 14); } return; }
  if (sk === 'blind') { BT.msg = f.n + ' throws something in ' + heroName(t) + "'s eyes!"; t.st.blind = 3; popAt(t, 'BLIND', '#a6968f'); return; }
  if (sk === 'roar') { BT.msg = f.n + ' roars! Its attacks get stronger.'; f.roar = 3; sfx.play('roar'); KIT.shake(5); return; }
  if (sk === 'explode') { BT.msg = f.n + ' pops!'; liveParty().forEach(function (q) { hurtHero(q, f.mag * 1.2 - stat(q, 'def') * 0.3); }); f.hp = 0; sfx.play('boom'); KIT.shake(8); return; }
  if (sk === 'nothing') { BT.msg = 'The Void looks at you. You forget what you were doing.'; liveParty().forEach(function (q) { q.mp = Math.max(0, q.mp - 15); q.st = {}; popAt(q, '-15 MP', '#7af0ff'); }); return; }
}
function hurtHero(t, d) { d = Math.max(1, Math.round(d)); if (t.guard) d = Math.round(d / 2); t.hp = Math.max(0, t.hp - d); t.hurtT = 0.4; popAt(t, String(d), '#ff6a74'); sfx.play('hurt'); if (t.hp <= 0) { popAt(t, 'DOWN', '#ff2630', 14); t.st = {}; } }
function popAt(m, s, c, oy) { var i = S.party.indexOf(m), p = partyPos(i); BT.pops.push({ x: p.x, y: p.y - 60 + (oy || 0), s: s, c: c, t: 1.1 }); }
function popFoe(f, s, c, oy) { BT.pops.push({ x: f.x, y: f.y - (f.boss ? 110 : 64) + (oy || 0), s: s, c: c, t: 1.1 }); }
function endRound() {
  S.party.forEach(function (m) { if (!alive(m)) return; if (m.st.poison) { var d = Math.max(1, Math.round(maxHp(m) * 0.06)); m.hp = Math.max(1, m.hp - d); popAt(m, String(d), '#9aff5a'); m.st.poison--; } if (m.st.lock) m.st.lock--; if (m.st.blind) m.st.blind--; });
  BT.foes.forEach(function (f) { if (f.roar) f.roar--; });
  if (!liveFoes().length) return win(); if (!liveParty().length) return lose();
  startRound();
}
function win() {
  if (BT.phase === 'win') return; BT.phase = 'win'; BT.endT = 0.8;
  if (BT.ran) return;
  var boss = BT.boss && BT.foes[0];
  if (boss && boss.next) { // Blumhead does not stay down
    say(STORY.blumSuper, function () { var nb = foeStats(boss.next, BOSSES[boss.next].lv, true); BT.foes = [nb]; layoutFoes(); BT.phase = 'exec'; BT.q = []; BT.cur = null; music.play(BOSSES[boss.next].song); KIT.flash(0.5); sfx.play('roar'); startRound(); });
    BT.phase = 'exec'; return;
  }
  sfx.play('win'); music.play('jvwin');
}
function endWin() {
  var xp = 0, gold = 0; if (!BT.ran) BT.foes.forEach(function (f) { xp += f.xp; gold += f.drops; });
  var lines = [];
  if (!BT.ran) {
    S.drops += gold; lines.push(['', 'Won! ' + xp + ' XP and ' + gold + ' drops.']);
    S.party.forEach(function (m) { if (!alive(m)) return; m.xp += xp; while (m.xp >= xpNext(m.lv)) { m.xp -= xpNext(m.lv); var oldS = skillsOf(m).length; m.lv++; m.hp = maxHp(m); m.mp = maxMp(m); lines.push(['', heroName(m) + ' is now level ' + m.lv + '!']); var ns = skillsOf(m); if (ns.length > oldS) lines.push(['', heroName(m) + ' learns ' + ns[ns.length - 1].n + '!']); } });
    if (Math.random() < 0.18 && !BT.boss) { var drop = pick(['puff', 'puff', 'garlic', 'cuppa', 'chilli']); S.inv[drop] = (S.inv[drop] || 0) + 1; lines.push(['', 'Found a ' + ITEMS[drop].n + '.']); }
  }
  S.party.forEach(function (m) { m.st = {}; m.guard = false; });
  var wasBoss = BT.boss && !BT.ran; BT = null; G.mode = 'field';
  var after = function () { if (wasBoss) bossBeaten(); else { music.play(G.mk === 'world' ? 'jvworld' : G.mk === 'dun' ? DUNGEONS[G.mid].song : TOWNS[G.mid].song); } };
  if (lines.length) say(lines, after); else after();
}
function bossBeaten() {
  var D = DUNGEONS[G.mid]; if (!D) return; S.flags['boss_' + G.mid] = 1; S.flags[D.reward.flag] = 1;
  if (G.mid === 'V') { save(); endingScene(); return; }
  var lines = [['', D.reward.text]];
  if (S.flags.keyC && S.flags.keyB && S.flags.keyM && !S.flags.keysNote) { S.flags.keysNote = 1; lines = lines.concat(STORY.keys3); }
  if (G.mid === 'K') { S.gear.blade = (S.gear.blade || 0) + 1; }
  say(lines, function () { music.play(D.song); if (G.mid === 'L') { say([['', 'You step off the edge into the dark.']], function () { G.worldPos = G.worldPos; enter('dun', 'V', 0, 4, 8, 'r'); }); } });
}
function lose() { if (BT.phase === 'lose') return; BT.phase = 'lose'; BT.endT = 1.6; sfx.play('lose'); music.stop(1); }
function gameOver() {
  BT = null; G.mode = 'over';
  KIT.menu({ title: 'The Party Has Fallen', sub: 'The road to the Void is long.', items: [hasSave() ? { label: 'LOAD YOUR SAVE', fn: function () { KIT.closeMenu(); loadGame(); }, cls: 'hot', def: true } : null, { label: 'TITLE', fn: titleMenu, back: true }].filter(Boolean) });
}
function endingScene() { music.play('swend'); say(STORY.ending, function () { S.flags.done = 1; save(); KIT.menu({ title: 'Journey to the Void', sub: 'The End', html: '<p style="text-align:center">Cumhead, Spermaid and Greebo found the Void and came home.<br>Party level: <b>' + S.party.map(function (m) { return heroName(m) + ' ' + m.lv; }).join(' · ') + '</b></p>', items: [{ label: 'KEEP EXPLORING', fn: function () { KIT.closeMenu(); exitDungeon(); }, def: true }, { label: 'TITLE', fn: titleMenu, back: true }] }); }); }

/* ---------- battle drawing ---------- */
function cmdRects() { var r = []; for (var i = 0; i < CMDS.length; i++) r.push([124, 176 + i * 17, 90, 16]); return r; }
function subRects() { var r = []; for (var i = 0; i < Math.min(BT.subList.length, 7); i++) r.push([14, 170 + i * 13, 200, 12]); return r; }
function tapList(rs) { if (!KIT.ptr.tap) return -1; for (var i = 0; i < rs.length; i++) { var r = rs[i]; if (KIT.ptr.x >= r[0] && KIT.ptr.x <= r[0] + r[2] && KIT.ptr.y >= r[1] && KIT.ptr.y <= r[1] + r[3]) return i; } return -1; }
function targetRect(t) { if (t.boss !== undefined) { var sz = KIT.size(KIT.has(t.s + '0') ? t.s + '0' : t.s), k = t.boss ? 1 : 1.6; return [t.x - sz.w * k / 2, t.y - sz.h * k, sz.w * k, sz.h * k]; } var p = partyPos(S.party.indexOf(t)); return [p.x - 20, p.y - 50, 40, 52]; }
function drawBattleBg() {
  var c = BGS[BT.bg] || BGS.waste; R(c[0], 0, 0, W, H); for (var i = 0; i < 6; i++) R(i % 2 ? c[0] : c[1], 0, i * 12, W, 12);
  R(c[1], 0, 72, W, 90); R(c[2], 0, 150, W, 50); for (var x = 0; x < W; x += 24) R('rgba(0,0,0,0.2)', x + (x / 24 % 2) * 12, 156, 12, 40);
  if (BT.bg === 'moon' || BT.bg === 'waste') { KIT.ctx.fillStyle = '#c4121c'; KIT.ctx.beginPath(); KIT.ctx.arc(380, 40, 24, 0, 6.28); KIT.ctx.fill(); }
  if (BT.bg === 'void') for (var s = 0; s < 40; s++) R(s % 3 ? '#3a2a4a' : '#ffe36a', (s * 71 + G.t * 6) % W, (s * 37) % 150, 1, 1);
}
function drawBattle() {
  drawBattleBg();
  // foes
  BT.foes.forEach(function (f) { if (f.gone) return; var fr = KIT.has(f.s + '0') ? f.s + (Math.floor(G.t * 3) % 2) : f.s, act = BT.cur && BT.cur.k === 'foe' && BT.cur.who === f; var a = f.hp <= 0 ? Math.max(0, 1 - (f.fade || 0) / 0.6) : 1;
    spr(fr, f.x + (act ? 12 : 0), f.y, { flash: f.flash > 0 && Math.floor(G.t * 30) % 2, alpha: a, sc: f.boss ? 1 : 1.6 });
    if (BT.phase === 'target' && BT.tlist[BT.tc] === f) { var sz = KIT.size(fr), k = f.boss ? 1 : 1.6; sz = { w: sz.w * k, h: sz.h * k }; spr('cumface', f.x + sz.w / 2 + 10, f.y - sz.h / 2 + 8, { sc: 0.5 }); R('#ffe36a', f.x - 3, f.y - sz.h - 8, 6, 4); } });
  // the party
  S.party.forEach(function (m, i) {
    var p = partyPos(i), h = HEROES[m.id], act = BT.cur && BT.cur.who === m && BT.cur.k !== 'foe', chooser = (BT.phase === 'cmd' || BT.phase === 'sub' || BT.phase === 'target') && BT.ci === i;
    var f = !alive(m) ? h.spr.dead : m.hurtT > 0 ? h.spr.hurt : act ? h.spr.act : h.spr.idle; if (m.hurtT > 0) m.hurtT -= 1 / 60;
    spr(f, p.x - (act || chooser ? 16 : 0), p.y + (alive(m) ? 0 : 6), { flip: true });
    if (m.st && m.st.lock) R('#ffe36a', p.x - 20, p.y - 58, 4, 4); if (m.st && m.st.poison) R('#9aff5a', p.x - 14, p.y - 58, 4, 4); if (m.guard) R('#7af0ff', p.x - 8, p.y - 58, 4, 4);
    if (BT.phase === 'target' && BT.tlist[BT.tc] === m) R('#ffe36a', p.x - 3, p.y - 64, 6, 4);
  });
  BT.pops.forEach(function (p) { text(p.s, p.x, p.y, { align: 'center', size: 8, col: p.c, alpha: Math.min(1, p.t * 2) }); });
  // the windows
  KIT.panel(4, 196, 214, 70); liveFoes().slice(0, 4).forEach(function (f, i) { text(f.n, 14, 204 + i * 14, { size: 8, max: 150 }); if (f.boss) KIT.bar(14, 218, 190, 4, f.hp / f.mhp, '#c4121c'); });
  KIT.panel(222, 196, 254, 70);
  S.party.forEach(function (m, i) { var y = 204 + i * 20, c = !alive(m) ? '#ff2630' : m.hp < maxHp(m) * 0.25 ? '#ffe36a' : '#f1e7d0'; text(heroName(m).toUpperCase(), 232, y, { size: 6, col: BT.ci === i && BT.phase !== 'exec' ? '#ffe36a' : '#f1e7d0' }); text(m.hp + '/' + maxHp(m), 330, y, { size: 6, col: c }); text(m.mp + ' MP', 418, y, { size: 6, col: '#7af0ff' }); KIT.bar(330, y + 9, 72, 2, m.hp / maxHp(m), c === '#ff2630' ? '#5a0a10' : '#c4121c'); });
  if (BT.phase === 'cmd') { KIT.panel(116, 170, 102, 96); CMDS.forEach(function (c, i) { text((i === BT.cmd ? '> ' : '  ') + c, 126, 180 + i * 17, { size: 8, col: i === BT.cmd ? '#ffe36a' : (c === 'RUN' && BT.boss ? '#5a4a4a' : '#f1e7d0') }); }); }
  if (BT.phase === 'sub') { KIT.panel(4, 160, 214, 106); var top = Math.max(0, BT.sub - 6); BT.subList.slice(top, top + 7).forEach(function (s, i) { var on = top + i === BT.sub; text((on ? '> ' : '  ') + s.label, 14, 170 + i * 13, { size: 6, col: s.dis ? '#5a4a4a' : on ? '#ffe36a' : '#f1e7d0', max: 150 }); text(s.right, 210, 170 + i * 13, { size: 6, align: 'right', col: '#a6968f' }); }); var cur = BT.subList[BT.sub]; if (cur) { var d = BT.subKind === 'skill' ? cur.v.d : ITEMS[cur.v].d; KIT.panel(4, 4, W - 8, 24); text(d, 14, 12, { size: 6 }); } }
  if (BT.msg && (BT.phase === 'exec' || BT.phase === 'intro' || BT.phase === 'win')) { KIT.panel(4, 4, W - 8, 24); text(BT.msg, 14, 12, { size: 8, max: W - 30 }); }
  if (BT.phase === 'target') { KIT.panel(4, 4, W - 8, 24); text('PICK A TARGET  (B: BACK)', 14, 12, { size: 8, col: '#ffe36a' }); }
  if (BT.flash > 0) R('rgba(255,255,255,' + BT.flash + ')', 0, 0, W, H);
  if (BT.phase === 'lose') { R('rgba(0,0,0,' + Math.min(0.8, (1.6 - BT.endT)) + ')', 0, 0, W, H); }
}

/* ---------- field drawing ---------- */
var WTILE = { '.': '#2a0a0e', ',': '#4a3a34', 'f': '#22080c', '^': '#1a0a12', '~': '#3a0408', '=': '#5a3a24' };
function cam() { var r = mapRows(), mw = r[0].length * TS, mh = r.length * TS; var cx = mw <= W ? (mw - W) / 2 : clamp(P.px + 8 - W / 2, 0, mw - W), cy = mh <= H ? (mh - H) / 2 : clamp(P.py + 8 - H / 2, 0, mh - H); return { x: Math.round(cx), y: Math.round(cy) }; }
function drawField() {
  var r = mapRows(), c = cam(); R('#070405', 0, 0, W, H);
  var x0 = Math.max(0, Math.floor(c.x / TS)), y0 = Math.max(0, Math.floor(c.y / TS)), x1 = Math.min(r[0].length - 1, x0 + 31), y1 = Math.min(r.length - 1, y0 + 18);
  var ents = [];
  for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
    var ch = r[y][x], px = x * TS - c.x, py = y * TS - c.y;
    if (G.mk === 'world') drawWorldTile(ch, px, py, x, y, ents);
    else if (G.mk === 'town') drawTownTile(ch, px, py, x, y, ents, r);
    else drawDunTile(ch, px, py, x, y, ents);
  }
  ents.push({ y: P.py + 16, d: function () { drawHero(P.px - c.x + 8, P.py - c.y + 16); } });
  ents.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { e.d(); });
  if (fade > 0) R('rgba(0,0,0,' + Math.min(1, fade * 2.5) + ')', 0, 0, W, H);
  if (banner) { var a = Math.min(1, banner.t * 2); KIT.panel(W / 2 - 120, 14, 240, banner.b ? 40 : 30); text(banner.a, W / 2, 18, { align: 'center', size: 20, font: 'title', col: '#ff2630', alpha: a }); if (banner.b) text(banner.b, W / 2, 42, { align: 'center', size: 6, alpha: a }); }
  if (G.mk === 'world') { var z = { plains1: 'THE RED WASTE', plains2: 'THE RED WASTE', forest: 'DEAD WOOD', east: 'PAST THE BLOOD SEA', eforest: 'DEAD WOOD', north: 'THE PEAKS' }[zoneHere()] || ''; text(z, 8, H - 14, { size: 6, col: '#a6968f' }); text(S.drops + ' DROPS', W - 8, H - 14, { size: 6, col: '#ffe36a', align: 'right' }); }
  drawDlg();
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
function drawTownTile(ch, px, py, x, y, ents, rows) {
  R(ch === ',' ? '#4a3a34' : '#3a2018', px, py, TS, TS);
  if (ch === '.' && (x * 5 + y * 3) % 7 === 0) R('#4a2a20', px + 5, py + 6, 2, 2);
  if (ch === ',') { R('#5a4a40', px + 1, py + 1, 6, 6); R('#5a4a40', px + 9, py + 9, 6, 6); }
  if (ch === '#') { R('#1a0a0c', px, py, TS, TS); R('#5a3a24', px, py + 6, TS, 3); R('#5a3a24', px + 2, py + 2, 2, 12); R('#5a3a24', px + 12, py + 2, 2, 12); }
  if (ch === 'h' && rows[y][x - 1] !== 'h' && (y === 0 || rows[y - 1][x] !== 'h')) { var k = ['jv_houser', 'jv_housep', 'jv_houseb'][(x + y) % 3]; ents.push({ y: py + 48, d: function () { spr(k, px + 24, py + 48); } }); }
  var who = TOWNS[G.mid].people[ch];
  if (who) ents.push({ y: py + 16, d: function () { spr(who.s, px + 8, py + 16, { sc: who.s.indexOf('steve') === 0 ? 0.7 : 1 }); } });
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
function drawHero(x, y) {
  var step = P.moving ? Math.floor(P.t * 8) % 2 : 0, flip = P.dir === 'l';
  R('rgba(0,0,0,0.35)', x - 7, y - 2, 14, 3);
  R('#12040a', x - 5, y - 11, 10, 9); R('#1a1014', x - 4, y - 10, 8, 7); R('#c4121c', x - 4, y - 8, 8, 2);
  R('#12040a', x - 4 + step, y - 3, 3, 3); R('#12040a', x + 1 - step, y - 3, 3, 3);
  spr('ch_icon0', x, y - 8, { flip: flip, sc: 0.75 });
}

/* ---------- field menus (HTML, so a controller can drive them) ---------- */
function partyHtml() { return '<div style="display:grid;gap:6px">' + S.party.map(function (m) { return '<div style="padding:6px 10px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c"><b>' + heroName(m) + '</b>  Lv ' + m.lv + '  ·  HP ' + m.hp + '/' + maxHp(m) + '  ·  MP ' + m.mp + '/' + maxMp(m) + '<br><span style="color:#a6968f">ATK ' + stat(m, 'atk') + '  DEF ' + stat(m, 'def') + '  MAG ' + stat(m, 'mag') + '  SPD ' + stat(m, 'spd') + '  ·  XP to next ' + (xpNext(m.lv) - m.xp) + '<br>' + GEAR[m.wpn].n + '  ·  ' + GEAR[m.arm].n + '</span></div>'; }).join('') + '</div>'; }
function fieldMenu() {
  if (G.mode !== 'field' || DLG || KIT.menuOpen()) return;
  var keys = ['keyC', 'keyB', 'keyM'].filter(function (k) { return S.flags[k]; }).map(function (k) { return { keyC: 'Cream Key', keyB: 'Bone Key', keyM: 'Moon Key' }[k]; });
  KIT.menu({ title: 'Menu', sub: S.drops + ' drops' + (keys.length ? '  ·  ' + keys.join(', ') : ''), html: partyHtml(),
    items: [{ label: 'ITEMS', fn: itemsMenu }, { label: 'SKILLS', sub: 'Heal outside battle', fn: skillsMenu }, { label: 'EQUIP', fn: equipMenu },
      G.mk !== 'dun' ? { label: 'SAVE', sub: 'In a dungeon, use a red crystal', fn: function () { save(); sfx.play('magic'); fieldMenu(); } } : null,
      { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }, { label: 'CLOSE', back: true, def: true, fn: KIT.closeMenu }].filter(Boolean) });
}
function pickHero(title, cb, dead) { KIT.menu({ title: title, items: S.party.map(function (m) { return { label: heroName(m).toUpperCase() + '  ' + m.hp + '/' + maxHp(m) + ' HP  ' + m.mp + ' MP', dis: dead ? alive(m) : !alive(m), fn: function () { cb(m); } }; }).concat([{ label: 'BACK', back: true, fn: fieldMenu }]) }); }
function itemsMenu() {
  var ks = Object.keys(S.inv).filter(function (k) { return S.inv[k] > 0; });
  KIT.menu({ title: 'Items', items: ks.map(function (k) { var it = ITEMS[k]; return { label: it.n.toUpperCase() + '  x' + S.inv[k], sub: it.d, dis: !!it.dmg, fn: function () {
    if (it.tg === 'allies') { S.inv[k]--; S.party.forEach(function (m) { if (alive(m)) m.hp = Math.min(maxHp(m), m.hp + it.heal); }); sfx.play('magic'); itemsMenu(); return; }
    pickHero('Use ' + it.n + ' on', function (m) { S.inv[k]--; if (it.revive) m.hp = Math.round(maxHp(m) * it.revive); if (it.heal) m.hp = Math.min(maxHp(m), m.hp + it.heal); if (it.mp) m.mp = Math.min(maxMp(m), m.mp + it.mp); if (it.cure) m.st = {}; sfx.play('magic'); itemsMenu(); }, !!it.revive); } }; }).concat([{ label: 'BACK', back: true, fn: fieldMenu }]) });
}
function skillsMenu() {
  var list = []; S.party.forEach(function (m) { skillsOf(m).forEach(function (s) { if (s.k === 'heal' || s.k === 'revive') list.push({ m: m, s: s }); }); });
  KIT.menu({ title: 'Skills', items: list.map(function (o) { return { label: heroName(o.m).toUpperCase() + ': ' + o.s.n.toUpperCase() + '  (' + o.s.mp + ' MP)', sub: o.s.d + '  ·  ' + o.m.mp + ' MP left', dis: !alive(o.m) || o.m.mp < o.s.mp, fn: function () {
    var go = function (t) { o.m.mp -= o.s.mp; var ts = o.s.tg === 'allies' ? S.party : [t]; ts.forEach(function (q) { if (o.s.k === 'revive') { if (!alive(q)) q.hp = Math.round(maxHp(q) * o.s.pow); } else if (alive(q)) { q.hp = Math.min(maxHp(q), q.hp + Math.round(stat(o.m, 'mag') * o.s.pow + o.s.base)); if (o.s.cure) q.st = {}; } }); sfx.play('magic'); skillsMenu(); };
    if (o.s.tg === 'allies') go(); else pickHero(o.s.n + ' on', go, o.s.k === 'revive'); } }; }).concat([{ label: 'BACK', back: true, fn: fieldMenu }]) });
}
function equipMenu() { KIT.menu({ title: 'Equip', html: partyHtml(), items: S.party.map(function (m) { return { label: heroName(m).toUpperCase(), sub: GEAR[m.wpn].n + ' · ' + GEAR[m.arm].n, fn: function () { equipHero(m); } }; }).concat([{ label: 'BACK', back: true, fn: fieldMenu }]) }); }
function equipHero(m) {
  var opts = Object.keys(S.gear).filter(function (k) { return S.gear[k] > 0 && (GEAR[k].w === 'all' || GEAR[k].w === m.id); });
  KIT.menu({ title: heroName(m), sub: 'Wearing ' + GEAR[m.wpn].n + ' and ' + GEAR[m.arm].n, items: opts.map(function (k) { var g = GEAR[k]; return { label: g.n.toUpperCase(), sub: (g.s === 'wpn' ? 'Weapon' : 'Armour') + (g.atk ? '  ATK +' + g.atk : '') + (g.def ? '  DEF +' + g.def : '') + (g.mag ? '  MAG +' + g.mag : ''), fn: function () { var old = m[g.s]; m[g.s] = k; S.gear[k]--; S.gear[old] = (S.gear[old] || 0) + 1; m.hp = Math.min(m.hp, maxHp(m)); sfx.play('select'); equipHero(m); } }; }).concat([{ label: 'BACK', back: true, fn: equipMenu }]), note: opts.length ? '' : 'Nothing else to wear. Buy gear in town or find it in chests.' });
}
function shopMenu(who) {
  KIT.menu({ title: who.n, sub: who.say[0] + '  ·  You have ' + S.drops + ' drops', items: who.shop.map(function (k) { var it = ITEMS[k]; return { label: it.n.toUpperCase() + '  ·  ' + it.price, sub: it.d + '  (have ' + (S.inv[k] || 0) + ')', dis: S.drops < it.price, fn: function () { S.drops -= it.price; S.inv[k] = (S.inv[k] || 0) + 1; sfx.play('coin'); shopMenu(who); } }; }).concat([{ label: 'DONE', back: true, def: true, fn: KIT.closeMenu }]) });
}
function gearShop(who) {
  KIT.menu({ title: who.n, sub: who.say[0] + '  ·  You have ' + S.drops + ' drops', items: who.gear.map(function (k) { var g = GEAR[k]; return { label: g.n.toUpperCase() + '  ·  ' + g.price, sub: (g.w === 'all' ? 'Anyone' : HEROES[g.w].name) + ' · ' + (g.atk ? 'ATK +' + g.atk + ' ' : '') + (g.def ? 'DEF +' + g.def + ' ' : '') + (g.mag ? 'MAG +' + g.mag : '') + '  (have ' + (S.gear[k] || 0) + ')', dis: S.drops < g.price, fn: function () { S.drops -= g.price; S.gear[k] = (S.gear[k] || 0) + 1; sfx.play('coin'); gearShop(who); } }; }).concat([{ label: 'EQUIP NOW', fn: equipMenu }, { label: 'DONE', back: true, def: true, fn: KIT.closeMenu }]) });
}
function innMenu(who) {
  KIT.menu({ title: who.n, sub: 'A night\'s rest: ' + who.inn + ' drops. You have ' + S.drops + '.', items: [{ label: 'REST', sub: 'Everyone back to full', dis: S.drops < who.inn, fn: function () { S.drops -= who.inn; healAll(); S.party.forEach(function (m) { m.st = {}; }); KIT.closeMenu(); fade = 1.2; sfx.play('magic'); save(); say([['', 'You sleep well. Everyone is back to full. (Saved.)']]); }, cls: 'hot', def: true }, { label: 'NOT NOW', back: true, fn: KIT.closeMenu }] });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> with the d-pad, stick or WASD/arrows. Hold <b>B</b> (X key) to hurry. <b>A</b> (Z) talks, opens chests and touches crystals. <b>Start</b> / Esc / the pause button opens the menu.</p><p>In battle, pick a command for each of the three, then the round plays out fastest first. FIGHT hits one foe. SKILLS cost MP. GUARD halves damage. Foes can be WEAK to cream (Cumhead), water (Spermaid) or pie (Greebo).</p><p>Red crystals in dungeons heal you and save. Inns heal you and save. On the world map, save from the menu. Find the three keys, then go north behind the mountains.</p>', items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'field') fieldMenu(); else titleMenu(); } }] });
}

/* ---------- start, load, title ---------- */
function newGame() { S = newSave(); var m = S.map; enter('town', 'C', 0, m.x, m.y, 'd'); say(STORY.intro); }
function loadGame() { S = KIT.load('jv-save', null); if (!S) return newGame(); var m = S.map; if (m.k === 'dun') { G.worldPos = worldSpot(m.id); } enter(m.k, m.id, m.floor || 0, m.x, m.y, m.dir || 'd'); }
function titleMenu() {
  G.mode = 'title'; BT = null; DLG = null; music.play('jvtitle');
  var sv = KIT.load('jv-save', null);
  KIT.menu({ cls: 'clear', title: 'Journey to the Void', sub: 'Cumhead, Spermaid and Greebo set out to find the Void.',
    items: [sv ? { label: 'CONTINUE', sub: sv.party.map(function (m) { return HEROES[m.id].name + ' Lv ' + m.lv; }).join(' · '), fn: function () { KIT.closeMenu(); loadGame(); }, cls: 'hot', def: true } : null,
      { label: 'NEW JOURNEY', sub: sv ? 'Starts over (your save is kept until you save again)' : '', fn: function () { KIT.closeMenu(); newGame(); }, cls: sv ? '' : 'hot', def: !sv }, { label: 'HOW TO PLAY', fn: helpMenu }].filter(Boolean) });
}
function drawTitle() {
  R('#000000', 0, 0, W, H); for (var s = 0; s < 60; s++) R(s % 4 ? '#3a2a4a' : '#ffe36a', (s * 71 + G.t * 4) % W, (s * 37) % H, 1, 1);
  spr('jv_void' + (Math.floor(G.t * 2) % 2), W / 2, 150 + Math.sin(G.t) * 4, { sc: 0.9, alpha: 0.85 });
  spr('ch_idle' + (Math.floor(G.t * 7) % 7), 190, 262); spr('spermaid_s' + (Math.floor(G.t * 5) % 3), 240, 262); spr('greebo_s' + (Math.floor(G.t * 5) % 3), 290, 262);
}

/* ---------- loop ---------- */
function update(dt) {
  G.t += dt; if (S) S.t += dt;
  if (G.mode === 'field') fieldUpdate(dt);
  else if (G.mode === 'battle') battleUpdate(dt);
}
function draw() {
  if (G.mode === 'title' || G.mode === 'over' || !S) { drawTitle(); return; }
  if (G.mode === 'battle' && BT) { drawBattle(); drawDlg(); return; }
  drawField();
}
music.songs.jvtitle = { bpm: 76, beats: 4, vol: 0.95, wet: 0.65, lead: 'organlead', bass: 'drone', acc: 'organ', drums: null, chords: 'Em C G D Em C Am B',
  mel: 'b4 - - - e5 - - - | g5 - - - e5 - c5 - | d5 - - - b4 - g4 - | a4 - - - f#4 - - - | e4 - - - b4 - e5 - | g5 - - - c6 - - - | a5 - - - e5 - c5 - | b4 - - - d#5 - - -' };
music.songs.jvworld = { bpm: 108, beats: 4, vol: 0.85, wet: 0.4, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'rock', chords: 'Dm Bb F C Dm Bb Gm A',
  mel: 'a4 - d5 - f5 - a5 - | bb5 - - - f5 - d5 - | c5 - f5 - a5 - c6 - | g5 - - - e5 - c5 - | d5 - f5 - a5 - d6 - | d6 - c6 - bb5 - f5 - | g5 - bb5 - d6 - g6 - | e6 - - - c#6 - - -',
  counter: 'f4 - - - a4 - - - | d4 - - - f4 - - - | a4 - - - c5 - - - | e4 - - - g4 - - - | f4 - - - a4 - - - | d4 - - - f4 - - - | bb4 - - - d5 - - - | a4 - - - e4 - - -' };
music.songs.jvbattle = { bpm: 160, beats: 4, vol: 0.88, wet: 0.2, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'boss', chords: 'Am F G E Am F Dm E',
  mel: 'e5 . e5 a5 . c6 . e6 | f6 . e6 . c6 - a5 - | d6 . b5 . g5 . b5 d6 | e6 - - - g#5 - b5 - | a5 . c6 e6 . a6 . g6 | f6 e6 d6 c6 a5 - - - | d6 . f6 . a6 . f6 d6 | b5 - g#5 - e5 - - -' };
music.songs.jvwin = { bpm: 130, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'C G F G', mel: 'c6 . c6 . c6 - g5 - | a5 - b5 - c6 - - - | f5 - a5 - c6 - f6 - | e6 - d6 - b5 - g5 -' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: function () { if (G.mode === 'field') fieldMenu(); },
  pad: { four: true, btns: [{ k: 'a', label: 'A' }, { k: 'b', label: 'B' }] } });
titleMenu();
window.__jv = { G: G, get S() { return S; }, get P() { return P; }, get BT() { return BT; }, get DLG() { return DLG; }, newGame: newGame, loadGame: loadGame, enter: enter, startBattle: startBattle, foeStats: foeStats, enterDungeon: enterDungeon,
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, skipDlg: function () { var g = 0; while (DLG && g++ < 200) { var d = DLG; d.i = d.lines.length - 1; d.ch = 999; DLG.i++; var cb = d.done; DLG = null; if (cb) cb(); } }, stat: stat, maxHp: maxHp, xpNext: xpNext, ZONES: ZONES };
