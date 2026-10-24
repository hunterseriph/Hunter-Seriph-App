/* =====================================================================================================
   WILLY NILLY: Amy runs Amy's Willy Chilli. Seat the customers, take their order, cook the chilli
   (Classic or Dynamite) in the right pot, carry it out, take the bill and clear the table.
   Tap (or move the cursor and press A) on a customer in the queue, then on a free table to seat them.
   Tap a table to take an order, serve, take the bill or clear it. Tap a pot to cook or pick up a bowl.
   Amy remembers up to four jobs in a row. 10 levels; the diner grows from 2 tables to 6.
   ===================================================================================================== */
var W = 480, H = 270;
var SAVE_KEY = 'wn-save';
var SV = KIT.load(SAVE_KEY, null) || { unlocked: 1, best: {}, stars: {}, coins: 0, ups: {} };
function persist() { KIT.save(SAVE_KEY, SV); }

/* everyone we have met so far turns up to eat */
var FOLK = [
  { s: 'npc_ali', n: 'Ali' }, { s: 'npc_beebs', n: 'Uncle Beeb', tip: 1.3 }, { s: 'npc_bonjo', n: 'Bonjo' }, { s: 'npc_elden', n: 'Elden' }, { s: 'npc_greebo', n: 'Greebo', eat: 0.5 },
  { s: 'npc_harold', n: 'Harold', eat: 1.5 }, { s: 'npc_jessiah', n: 'Jessiah', eat: 0.7 }, { s: 'npc_joff', n: 'Joff' }, { s: 'npc_judgement', n: 'Judgement' }, { s: 'npc_kaya', n: 'Kaya' },
  { s: 'npc_masterbates', n: 'Master Bates', read: 2, pat: 0.8 }, { s: 'npc_nattyboro', n: 'Nattyboro' }, { s: 'npc_potbelly', n: 'Potbelly', tip: 1.6 }, { s: 'npc_pulsar', n: 'PulsarOctopus', pat: 0.7 },
  { s: 'npc_saba', n: 'Saba', pat: 0.55 }, { s: 'npc_spermaid', n: 'Spermaid', pat: 0.7 }, { s: 'npc_stackedfate', n: 'Stacked Fate' }, { s: 'npc_t', n: 'T' }, { s: 'npc_tb', n: 'TB', pat: 1.5, tip: 2 },
  { s: 'ch_idle0', n: 'Cumhead', sc: 0.7, want: 'd' }, { s: 'steve0', n: 'Steve', sc: 0.75, want: 'c', pat: 0.8 },
  { s: 'h_gloop_adult_idle0', n: 'Homunculus', pat: 1.3, tip: 0.7 }, { s: 'h_ember_adult_idle0', n: 'Homunculus', pat: 1.3, tip: 0.7 }, { s: 'h_blood_adult_idle0', n: 'Bloodmoon Homunculus', pat: 1.2, tip: 1.5, want: 'd' },
  { s: 'h_frost_adult_idle0', n: 'Homunculus', pat: 1.3, tip: 0.7 }, { s: 'h_goldie_adult_idle0', n: 'Goldie Homunculus', tip: 2.2 }
].filter(function (f) { return KIT.has(f.s); });

var LEVELS = [
  { t: 2, n: 6, gap: [7, 10], dyn: 0.35, pots: 'cd', pair: 0.2 },
  { t: 2, n: 8, gap: [6, 9], dyn: 0.4, pots: 'cd', pair: 0.3 },
  { t: 3, n: 10, gap: [5.5, 8.5], dyn: 0.45, pots: 'cd', pair: 0.35 },
  { t: 3, n: 12, gap: [5, 8], dyn: 0.45, pots: 'cd', pair: 0.4 },
  { t: 4, n: 13, gap: [4.6, 7.5], dyn: 0.5, pots: 'cd', pair: 0.45 },
  { t: 4, n: 15, gap: [4.3, 7], dyn: 0.5, pots: 'cd', pair: 0.5 },
  { t: 5, n: 16, gap: [4, 6.5], dyn: 0.5, pots: 'cdc', pair: 0.5 },
  { t: 5, n: 18, gap: [3.7, 6.2], dyn: 0.55, pots: 'cdc', pair: 0.55 },
  { t: 6, n: 19, gap: [3.5, 6], dyn: 0.55, pots: 'cdcd', pair: 0.6 },
  { t: 6, n: 22, gap: [3.2, 5.6], dyn: 0.6, pots: 'cdcd', pair: 0.65 }
];
LEVELS.forEach(function (L, i) { L.goal = Math.round(L.n * (44 + i * 1.5) / 10) * 10; L.expert = Math.round(L.n * (62 + i * 2) / 10) * 10; });
var UPGRADES = [
  { id: 'shoes', name: 'Comfy Shoes', d: 'Amy walks 20% faster.', cost: 300 },
  { id: 'ladle', name: 'Big Ladle', d: 'Chilli cooks 25% faster.', cost: 400 },
  { id: 'juke', name: 'The Jukebox', d: 'Customers lose patience 15% slower.', cost: 500 },
  { id: 'cloth', name: 'Fancy Tablecloths', d: 'Every bill tips 3 more.', cost: 350 },
  { id: 'apron', name: 'Big Apron Pockets', d: 'Amy can carry 3 bowls.', cost: 600 }
];
var PRICE = { c: 12, d: 18 }, NAME = { c: 'CLASSIC', d: 'DYNAMITE' };
var SLOTS = [[170, 172], [290, 172], [410, 172], [170, 242], [290, 242], [410, 242]];

var G = { mode: 'title', lv: 0 };
var amy, tables, pots, groups, queue, arrivals, cursor, sel, pops, parts, chain;

function startLevel(i) {
  var L = LEVELS[i]; G.lv = i; G.L = L; G.mode = 'intro'; G.t = 0; G.introT = 2.6; G.score = 0; G.served = 0; G.lost = 0; G.done = false;
  amy = { x: 120, y: 120, face: 1, q: [], tickets: [], bowls: [], walkT: 0, act: null, actT: 0 };
  tables = []; for (var k = 0; k < L.t; k++) tables.push({ i: k, x: SLOTS[k][0], y: SLOTS[k][1], g: null, dirty: false });
  pots = L.pots.split('').map(function (c, j) { return { j: j, type: c, x: L.pots.length > 3 ? 322 + j * 44 : 330 + j * 56, y: 92, st: 'idle', t: 0 }; });
  groups = []; queue = []; pops = []; parts = []; chain = { k: null, n: 0 };
  arrivals = []; var t = 1.5; for (k = 0; k < L.n; k++) { arrivals.push(t); t += rnd(L.gap[0], L.gap[1]); }
  cursor = { i: 0 }; sel = null;
  music.play('wn');
}
function speedAmy() { return 130 * (SV.ups.shoes ? 1.2 : 1); }
function handsMax() { return SV.ups.apron ? 3 : 2; }
function floorRect() { var n = G.L.t; return { x0: 64, x1: n >= 3 ? 476 : 356, y0: 104, y1: n >= 4 ? 268 : 206 }; }

/* ---------- customers ---------- */
function newGroup() {
  var L = G.L, size = Math.random() < L.pair ? 2 : 1, who = [], used = {};
  for (var k = 0; k < size; k++) { var f; do { f = pick(FOLK); } while (used[f.n] && FOLK.length > 2); used[f.n] = 1; who.push(f); }
  var want = who.filter(function (f) { return f.want; })[0], order = want ? want.want : (Math.random() < L.dyn ? 'd' : 'c');
  var pat = who.reduce(function (a, f) { return Math.max(a, f.pat || 1); }, 0), tip = who.reduce(function (a, f) { return a + (f.tip || 1); }, 0) / who.length;
  var g = { who: who, order: order, st: 'queue', t: 0, hearts: 5, pat: pat * (SV.ups.juke ? 0.85 : 1), tip: tip, x: -20, y: 150, table: null,
    read: who.reduce(function (a, f) { return Math.max(a, f.read || 1); }, 0), eat: who.reduce(function (a, f) { return a + (f.eat || 1); }, 0) / who.length, bob: Math.random() * 6 };
  groups.push(g); queue.push(g); sfx.play('bell');
}
function queuePos(k) { return { x: 30 + (k % 2) * 4, y: 150 + k * 40 }; }
var DRAIN = { queue: 0.11, order: 0.14, waitfood: 0.085, bill: 0.14 };
function updGroups(dt) {
  queue = queue.filter(function (g) { return g.st === 'queue'; });
  queue.forEach(function (g, k) { var p = queuePos(k); g.x += clamp(p.x - g.x, -90 * dt, 90 * dt); g.y += clamp(p.y - g.y, -90 * dt, 90 * dt); });
  groups.forEach(function (g) {
    g.t += dt; g.bob += dt;
    if (DRAIN[g.st]) { g.hearts -= DRAIN[g.st] * g.pat * dt; if (g.hearts <= 0) angry(g); }
    if (g.st === 'walk') { var tb = tables[g.table], dx = tb.x - g.x, dy = tb.y - 2 - g.y, d = Math.hypot(dx, dy), sp = 120 * dt; if (d <= sp) { g.x = tb.x; g.y = tb.y - 2; g.st = 'menu'; g.t = 0; } else { g.x += dx / d * sp; g.y += dy / d * sp; } }
    else if (g.st === 'menu' && g.t > 3 * g.read) { g.st = 'order'; g.t = 0; sfx.play('tick'); }
    else if (g.st === 'eat' && g.t > 6 * g.eat) { g.st = 'bill'; g.t = 0; sfx.play('tick'); }
    else if (g.st === 'leave') { g.x -= 140 * dt; g.y += (150 - g.y) * Math.min(1, dt * 2); if (g.x < -40) g.gone = true; }
  });
  groups = groups.filter(function (g) { return !g.gone; });
}
function angry(g) {
  if (g.st === 'leave') return;
  var tb = g.table !== null ? tables[g.table] : null; if (tb) { tb.g = null; }
  g.st = 'leave'; g.hearts = 0; G.lost++; G.score = Math.max(0, G.score - 20); chain = { k: null, n: 0 };
  pop(g.x, g.y - 60, 'STORMED OUT  -20', '#ff2630'); sfx.play('no');
}
function seat(g, tb) {
  g.st = 'walk'; g.table = tb.i; tb.g = g; g.hearts = Math.min(5, g.hearts + 1); score(10, 'seat', tb.x, tb.y - 60); sfx.play('select');
}
/* ---------- Amy's jobs ---------- */
function stationOf(job) { if (job.k === 'table') { var tb = tables[job.i]; return { x: tb.x, y: tb.y + 14 }; } var p = pots[job.i]; return { x: p.x, y: 120 }; }
function addJob(job) {
  if (amy.q.length >= 4) { sfx.play('no'); pop(amy.x, amy.y - 50, 'TOO MANY JOBS', '#a6968f'); return; }
  amy.q.push(job); sfx.play('blip');
}
function updAmy(dt) {
  if (amy.actT > 0) { amy.actT -= dt; return; }
  var job = amy.q[0]; if (!job) return;
  var st = stationOf(job), dx = st.x - amy.x, dy = st.y - amy.y, d = Math.hypot(dx, dy), sp = speedAmy() * dt;
  if (d > sp) { amy.x += dx / d * sp; amy.y += dy / d * sp; if (Math.abs(dx) > 2) amy.face = dx > 0 ? 1 : -1; amy.walkT += dt; if (Math.floor(amy.walkT * 6) !== Math.floor((amy.walkT - dt) * 6)) sfx.play('step'); return; }
  amy.x = st.x; amy.y = st.y; amy.q.shift(); doJob(job); amy.actT = 0.25;
}
function doJob(job) {
  if (job.k === 'table') {
    var tb = tables[job.i], g = tb.g;
    if (tb.dirty) { tb.dirty = false; score(5, 'clear', tb.x, tb.y - 50); sfx.play('splat'); return; }
    if (!g) return;
    if (g.st === 'order') { amy.tickets.push(g.order); g.st = 'waitfood'; g.t = 0; g.hearts = Math.min(5, g.hearts + 0.5); score(10, 'order', tb.x, tb.y - 60); sfx.play('select'); return; }
    if (g.st === 'waitfood') { var bi = amy.bowls.indexOf(g.order); if (bi >= 0) { amy.bowls.splice(bi, 1); g.st = 'eat'; g.t = 0; g.hearts = Math.min(5, g.hearts + 1); score(20, 'serve', tb.x, tb.y - 60); sfx.play('coin'); G.served++; return; }
      pop(tb.x, tb.y - 60, 'NOT THEIR ORDER', '#a6968f'); sfx.play('no'); return; }
    if (g.st === 'bill') {
      var tip = Math.round(Math.max(0, g.hearts) * 2 * g.tip) + (SV.ups.cloth ? 3 : 0), pay = PRICE[g.order] * g.who.length + tip;
      score(pay, 'bill', tb.x, tb.y - 60, 'BILL $' + pay); sfx.play('coin'); KIT.sfx.play('coin');
      for (var k = 0; k < 6; k++) parts.push({ x: tb.x, y: tb.y - 30, vx: rnd(-60, 60), vy: rnd(-120, -40), t: 0.7, c: '#ffe36a' });
      g.st = 'leave'; g.table = null; tb.g = null; tb.dirty = true; return;
    }
    return;
  }
  var p = pots[job.i];
  if (p.st === 'idle') { var ti = amy.tickets.indexOf(p.type); if (ti < 0) { pop(p.x, p.y - 50, amy.tickets.length ? 'WRONG POT' : 'NO ORDER FOR THIS', '#a6968f'); sfx.play('no'); return; }
    amy.tickets.splice(ti, 1); p.st = 'cook'; p.t = 0; p.need = (p.type === 'd' ? 7 : 5) * (SV.ups.ladle ? 0.75 : 1); sfx.play('pour'); return; }
  if (p.st === 'ready') { if (amy.bowls.length >= handsMax()) { pop(p.x, p.y - 50, 'HANDS FULL', '#a6968f'); sfx.play('no'); return; } amy.bowls.push(p.type); p.st = 'idle'; sfx.play('select'); return; }
  if (p.st === 'burnt') { p.st = 'idle'; amy.tickets.push(p.type); pop(p.x, p.y - 50, 'SCRAPED IT OUT. COOK AGAIN', '#ff9a30'); sfx.play('splat'); }
}
function updPots(dt) {
  pots.forEach(function (p) {
    p.t += dt;
    if (p.st === 'cook') { if (Math.random() < 0.3) sfx.play('cook'); if (p.t >= p.need) { p.st = 'ready'; p.t = 0; sfx.play('bell'); } }
    else if (p.st === 'ready' && p.t > 14) { p.st = 'burnt'; p.t = 0; G.score = Math.max(0, G.score - 10); pop(p.x, p.y - 50, 'BURNT!  -10', '#ff2630'); sfx.play('no'); }
  });
}
function score(n, kind, x, y, label) {
  if (chain.k === kind) chain.n++; else chain = { k: kind, n: 1 };
  var bonus = chain.n >= 2 ? 5 * (chain.n - 1) : 0; G.score += n + bonus;
  pop(x, y, (label || '+' + n) + (bonus ? '  CHAIN x' + chain.n : ''), bonus ? '#ffe36a' : '#f1e7d0');
}
function pop(x, y, t, c) { pops.push({ x: x, y: y, t: t, c: c, life: 1.4 }); }

/* ---------- hotspots: what a tap or the cursor can pick ---------- */
function hotspots() {
  var hs = [];
  queue.forEach(function (g, k) { hs.push({ k: 'group', g: g, x: g.x, y: g.y - 20, r: [g.x - 18, g.y - 48, 36, 50] }); });
  tables.forEach(function (tb) { hs.push({ k: 'table', i: tb.i, x: tb.x, y: tb.y - 18, r: [tb.x - 50, tb.y - 56, 100, 66] }); });
  pots.forEach(function (p) { hs.push({ k: 'pot', i: p.j, x: p.x, y: p.y - 18, r: [p.x - 24, p.y - 46, 48, 60] }); });
  return hs;
}
function activate(h) {
  if (!h) return;
  if (h.k === 'group') { sel = sel === h.g ? null : h.g; sfx.play('blip'); return; }
  if (h.k === 'table') {
    var tb = tables[h.i];
    if (!tb.g && !tb.dirty) { var g = sel || queue[0]; if (g && g.st === 'queue') { seat(g, tb); sel = null; return; } }
    if (sel) { sel = null; }
    addJob({ k: 'table', i: h.i }); return;
  }
  if (h.k === 'pot') addJob({ k: 'pot', i: h.i });
}
function inputs() {
  var hs = hotspots();
  if (KIT.ptr.tap) { var p = KIT.ptr, hit = null; hs.forEach(function (h) { if (p.x >= h.r[0] && p.x <= h.r[0] + h.r[2] && p.y >= h.r[1] && p.y <= h.r[1] + h.r[3]) hit = h; }); if (hit) { cursor.h = hit; activate(hit); } G.usedPtr = true; }
  var dir = KIT.pressed('left') ? [-1, 0] : KIT.pressed('right') ? [1, 0] : KIT.pressed('up') ? [0, -1] : KIT.pressed('down') ? [0, 1] : null;
  if (dir) {
    G.usedPtr = false; var cur = cursor.h && hs.filter(function (h) { return h.k === cursor.h.k && (h.k === 'group' ? h.g === cursor.h.g : h.i === cursor.h.i); })[0];
    if (!cur) cursor.h = hs.filter(function (h) { return h.k === 'table'; })[0];
    else { var best = null, bd = 1e9; hs.forEach(function (h) { if (h === cur) return; var dx = h.x - cur.x, dy = h.y - cur.y, along = dx * dir[0] + dy * dir[1], across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]); if (along <= 4) return; var s = along + across * 2; if (s < bd) { bd = s; best = h; } }); if (best) { cursor.h = best; sfx.play('tick'); } }
  }
  if (cursor.h) { var still = hs.filter(function (h) { return h.k === cursor.h.k && (h.k === 'group' ? h.g === cursor.h.g : h.i === cursor.h.i); })[0]; cursor.h = still || null; }
  if (KIT.pressed('a')) { if (!cursor.h) cursor.h = hs.filter(function (h) { return h.k === 'table'; })[0]; else activate(cursor.h); }
  if (KIT.pressed('b')) { if (sel) { sel = null; sfx.play('back'); } else if (amy.q.length) { amy.q.pop(); sfx.play('back'); } }
}

/* ---------- the loop ---------- */
function update(dt) {
  if (G.mode === 'intro') { G.introT -= dt; if (G.introT <= 0 || KIT.pressed('a') || KIT.ptr.tap) G.mode = 'play'; return; }
  if (G.mode !== 'play') return;
  G.t += dt;
  while (arrivals.length && G.t >= arrivals[0]) { arrivals.shift(); if (queue.length < 5) newGroup(); else { G.lost++; pop(40, 140, 'THE QUEUE WAS FULL', '#ff2630'); } }
  inputs(); updAmy(dt); updGroups(dt); updPots(dt);
  pops.forEach(function (p) { p.life -= dt; p.y -= 18 * dt; }); pops = pops.filter(function (p) { return p.life > 0; });
  parts.forEach(function (p) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }); parts = parts.filter(function (p) { return p.t > 0; });
  if (!arrivals.length && !groups.length && !G.done) { G.done = true; G.endT = 0.9; }
  if (G.done && G.endT > 0) { G.endT -= dt; if (G.endT <= 0) endLevel(); }
}
function endLevel() {
  var L = G.L, st = G.score >= L.expert ? 3 : G.score >= L.goal ? 2 : G.score >= L.goal * 0.6 ? 1 : 0, pass = G.score >= L.goal;
  G.mode = 'over'; music.play('wntitle');
  SV.coins += G.score; if ((SV.best[G.lv] || 0) < G.score) SV.best[G.lv] = G.score; if ((SV.stars[G.lv] || 0) < st && pass) SV.stars[G.lv] = st;
  if (pass && SV.unlocked < G.lv + 2) SV.unlocked = Math.min(LEVELS.length, G.lv + 2); persist();
  sfx.play(pass ? 'win' : 'lose');
  var last = G.lv === LEVELS.length - 1;
  KIT.menu({ title: pass ? (st === 3 ? 'Expert Service!' : 'Day Done!') : 'Not Enough Tips', sub: 'Level ' + (G.lv + 1) + '  ·  ' + G.L.t + ' tables',
    html: '<p style="text-align:center;margin:0">Score <b>' + G.score + '</b>  ·  Goal ' + L.goal + '  ·  Expert ' + L.expert + '<br>Served ' + G.served + '  ·  Stormed out ' + G.lost + '<br>' + starStr(pass ? st : 0) + '<br>Tips in the jar: <b>' + SV.coins + '</b></p>' +
      (pass && last ? '<p style="text-align:center;color:#ffe36a">Amy\'s Willy Chilli is the busiest diner in town. Mild, hot or dynamite?</p>' : ''),
    items: [pass && !last ? { label: 'NEXT DAY', sub: 'Level ' + (G.lv + 2), fn: function () { KIT.closeMenu(); startLevel(G.lv + 1); }, cls: 'hot', def: true } : null,
      { label: 'TRY AGAIN', fn: function () { KIT.closeMenu(); startLevel(G.lv); }, def: !pass },
      { label: 'UPGRADES', sub: 'Spend your tips', fn: upgradesMenu }, { label: 'LEVELS', fn: levelsMenu, back: true }].filter(Boolean) });
}
function starStr(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '<b>★</b>' : '<span style="color:#4a1a1c">★</span>'; return '<span style="font-size:22px;letter-spacing:6px">' + s + '</span>'; }

/* ---------- drawing ---------- */
var R = KIT.R, spr = KIT.spr, text = KIT.text;
function drawRoom() {
  var fr = floorRect();
  R('#0a0506', 0, 0, W, H);
  // the back wall with brick, and the kitchen behind the pass
  R('#3a0a10', 0, 0, W, 104); for (var y = 0; y < 104; y += 8) for (var x = (y / 8) % 2 ? -8 : 0; x < W; x += 16) { R('#4a0e16', x + 1, y + 1, 14, 6); R('#5a141c', x + 1, y + 1, 14, 1); }
  R('#2a0408', 0, 96, W, 8);
  // the wall around the diner while it is still small: boarded up, CLOSED FOR EXPANSION
  // the floor: black and red checks
  for (var ty = fr.y0; ty < fr.y1; ty += 16) for (var tx = fr.x0; tx < fr.x1; tx += 16) { var on = ((tx - fr.x0) / 16 + (ty - fr.y0) / 16) % 2 === 0; R(on ? '#1e0a0c' : '#4a0e14', tx, ty, 16, 16); if (on) R('#2a0e10', tx, ty, 16, 1); }
  if (fr.x1 < 476) { R('#140808', fr.x1, 104, W - fr.x1, H - 104); for (var bx = fr.x1 + 4; bx < W; bx += 30) { R('#5a3a24', bx, 120, 24, 120); R('#3a2416', bx, 120, 2, 120); } text('CLOSED FOR', fr.x1 + (W - fr.x1) / 2, 160, { align: 'center', size: 8, col: '#a6968f' }); text('EXPANSION', fr.x1 + (W - fr.x1) / 2, 172, { align: 'center', size: 8, col: '#a6968f' }); }
  if (fr.y1 < 268) { R('#140808', 0, fr.y1, W, H - fr.y1); for (var by2 = fr.y1 + 6; by2 < H; by2 += 18) { R('#5a3a24', 70, by2, W - 80, 12); R('#3a2416', 70, by2, W - 80, 2); } text('MORE TABLES SOON', W / 2, fr.y1 + 26, { align: 'center', size: 8, col: '#a6968f' }); }
  R('#12040a', 0, 104, 60, H - 104); R('#1e0a0c', 4, 104, 52, H - 104); // the waiting area by the door
  for (var q = 0; q < 5; q++) R('#2a0e10', 8, 132 + q * 40, 44, 2);
  spr('wn_door', 30, 104, {});
  spr('wn_sign', 222, 78, {}); text("AMY'S WILLY CHILLI", 222, 62, { align: 'center', size: 14, font: 'title', col: '#ff2630', max: 126 });
  spr('wn_plant', 76, 102); spr('wn_jukebox', 106, 102); R('#2a0a0e', 136, 0, 2, 40);
  if (G.L.t >= 5) spr('wn_plant', 284, 102);
  // the kitchen: stove, pots and the pass counter in front
  R('#1a0a0c', 296, 40, W - 296, 64); R('#2a0e10', 296, 40, W - 296, 2); text('KITCHEN', 300 + (W - 300) / 2, 44, { align: 'center', size: 6, col: '#a6968f' });
  pots.forEach(function (p) {
    var f = p.st === 'cook' ? 'wn_pot' + p.type + (Math.floor(KIT.t * 6) % 3) : p.st === 'idle' ? 'wn_pot' + p.type + 'off' : 'wn_pot' + p.type + '0';
    spr(f, p.x, p.y);
    if (p.st === 'cook') { KIT.bar(p.x - 16, p.y - 50, 32, 4, p.t / p.need, p.type === 'd' ? '#ff2630' : '#ffb040'); if (Math.random() < 0.3) parts.push({ x: p.x + rnd(-10, 10), y: p.y - 30, vx: 0, vy: -20, t: 0.8, c: 'rgba(200,180,170,0.6)', smoke: 1 }); }
    if (p.st === 'ready') { spr(p.type === 'd' ? 'wn_bowld' : 'wn_bowlc', p.x, p.y - 34 + Math.sin(KIT.t * 6) * 1.5); text('READY', p.x, p.y - 58, { align: 'center', size: 6, col: '#ffe36a' }); }
    if (p.st === 'burnt') { R('#12040a', p.x - 12, p.y - 42, 24, 10); text('BURNT', p.x, p.y - 40, { align: 'center', size: 6, col: '#ff2630' }); if (Math.random() < 0.5) parts.push({ x: p.x + rnd(-10, 10), y: p.y - 30, vx: 0, vy: -26, t: 1, c: 'rgba(40,30,30,0.8)', smoke: 1 }); }
    R(p.type === 'd' ? '#c4121c' : '#ffb040', p.x - 18, p.y + 1, 36, 2); spr(p.type === 'd' ? 'wn_bowld' : 'wn_bowlc', p.x, p.y + 15, { sc: 0.7 });
  });
}
function drawGroup(g, seated) {
  var bob = g.st === 'walk' || g.st === 'leave' ? Math.abs(Math.sin(g.bob * 10)) * 2 : 0;
  g.who.forEach(function (f, k) {
    var x = seated ? tables[g.table].x + (k ? 34 : -34) : g.x + k * 16 - (g.who.length - 1) * 8, y = seated ? tables[g.table].y - 6 : g.y;
    spr(f.s, x, y - bob, { sc: f.sc || 1, flip: seated ? k === 1 : false });
  });
}
function bubbleFor(g, x, y, onTable) {
  var icon = null;
  if (g.st === 'menu') { spr('wn_bubble', x, y); text('...', x, y - 16, { align: 'center', size: 8, col: '#12040a', shadow: false }); }
  else if (g.st === 'order') { spr('wn_bubble', x, y + Math.sin(KIT.t * 8) * 2); text('!', x, y - 17, { align: 'center', size: 8, col: '#c4121c', shadow: false }); }
  else if (g.st === 'waitfood') { spr('wn_bubble', x, y); spr(g.order === 'd' ? 'wn_bowld' : 'wn_bowlc', x, y - 5, { sc: 0.8 }); }
  else if (g.st === 'eat') { text(Math.floor(KIT.t * 3) % 2 ? 'NOM' : 'nom', x, y - 12, { align: 'center', size: 6, col: '#ffe36a' }); }
  else if (g.st === 'bill') { spr('wn_bubble', x, y + Math.sin(KIT.t * 8) * 2); spr('wn_coin', x, y - 9); text('$', x, y - 17, { align: 'center', size: 6, col: '#12040a', shadow: false }); }
  if (g.st !== 'leave' && g.st !== 'walk') for (var h = 0; h < 5; h++) spr(g.hearts > h + 0.5 ? 'wn_heart' : 'wn_heart0', x - 24 + h * 10, onTable ? y + 20 : y + 9, { anchor: 'tl' });
}
function draw() {
  var ctx = KIT.ctx;
  if (G.mode === 'title') { drawTitle(); return; }
  drawRoom();
  // things on the floor, back to front
  var list = [];
  tables.forEach(function (tb) { list.push({ y: tb.y, d: function () {
    spr('wn_chair', tb.x - 34, tb.y - 2, { flip: false }); spr('wn_chair', tb.x + 34, tb.y - 2, { flip: true });
    if (tb.g && tb.g.st !== 'walk') drawGroup(tb.g, true);
    spr('wn_table', tb.x, tb.y + 6);
    if (tb.dirty) { spr('wn_dish', tb.x - 8, tb.y - 10); spr('wn_dish', tb.x + 9, tb.y - 8); }
    if (tb.g && tb.g.st !== 'walk' && tb.g.st !== 'leave') bubbleFor(tb.g, tb.x, tb.y - 8, true);
  } }); });
  groups.forEach(function (g) { if (g.st === 'queue' || g.st === 'walk' || g.st === 'leave') list.push({ y: g.y, d: function () { if (g === sel) { R('#ffe36a', g.x - 16, g.y - 1, 32, 2); } drawGroup(g, false); if (g.st === 'queue') bubbleFor(g, g.x + 30, g.y - 34); if (g.st === 'leave' && g.hearts <= 0) text('GRR', g.x, g.y - 52, { align: 'center', size: 6, col: '#ff2630' }); } }); });
  list.push({ y: amy.y, d: drawAmy });
  list.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { o.d(); });
  parts.forEach(function (p) { R(p.c, p.x, p.y, p.smoke ? 3 : 2, p.smoke ? 3 : 2); });
  // the cursor
  if (cursor.h && !G.usedPtr && G.mode === 'play') { var h = cursor.h, r = h.r, on = Math.floor(KIT.t * 4) % 2; ctx.strokeStyle = on ? '#ffe36a' : '#ff9a30'; ctx.lineWidth = 2; ctx.strokeRect(r[0] + 0.5, r[1] + 0.5, r[2], r[3]); }
  // the job queue numbers over their targets
  amy.q.forEach(function (j, k) { var s = stationOf(j); R('#12040a', s.x - 6, s.y - 2, 12, 11); R('#c4121c', s.x - 5, s.y - 1, 10, 9); text(String(k + 1), s.x, s.y, { align: 'center', size: 6 }); });
  pops.forEach(function (p) { text(p.t, p.x, p.y, { align: 'center', size: 6, col: p.c, alpha: Math.min(1, p.life * 2) }); });
  drawHud();
  if (G.mode === 'intro') { KIT.panel(W / 2 - 130, 96, 260, 78); text('DAY ' + (G.lv + 1), W / 2, 104, { align: 'center', size: 24, font: 'title', col: '#ff2630' }); text(G.L.t + ' TABLES  ·  ' + G.L.n + ' CUSTOMERS', W / 2, 134, { align: 'center', size: 6 }); text('GOAL ' + G.L.goal + '   EXPERT ' + G.L.expert, W / 2, 148, { align: 'center', size: 6, col: '#ffe36a' }); text('Mild, hot or dynamite?', W / 2, 158, { align: 'center', size: 10, font: 'body', col: '#a6968f' }); }
}
function drawAmy() {
  var walking = amy.q.length && amy.actT <= 0, bob = walking ? Math.abs(Math.sin(amy.walkT * 12)) * 2 : 0;
  R('rgba(0,0,0,0.35)', amy.x - 10, amy.y - 1, 20, 3);
  spr('npc_amy', amy.x, amy.y - bob, { flip: amy.face < 0 });
  amy.bowls.forEach(function (b, k) { spr(b === 'd' ? 'wn_bowld' : 'wn_bowlc', amy.x + (k - (amy.bowls.length - 1) / 2) * 18, amy.y - 38 - bob); });
  if (amy.tickets.length) { spr('wn_ticket', amy.x + 16, amy.y - 22, { anchor: 'tl' }); text('x' + amy.tickets.length, amy.x + 29, amy.y - 18, { size: 6 }); }
}
function drawHud() {
  var L = G.L; KIT.panel(4, 4, 152, 34);
  text('DAY ' + (G.lv + 1) + '  $' + G.score, 12, 10, { size: 8, col: '#ffe36a' });
  var k = Math.min(1, G.score / L.expert); KIT.bar(12, 24, 136, 6, k, G.score >= L.goal ? '#ffe36a' : '#c4121c');
  R('#f1e7d0', 12 + 136 * L.goal / L.expert, 22, 1, 10);
  KIT.panel(160, 4, 206, 34, { fill: 'rgba(14,7,8,0.8)' });
  text('WAITING ' + queue.length + '  STILL TO COME ' + arrivals.length, 168, 10, { size: 6, col: '#a6968f' });
  // Amy's order pad
  if (amy.tickets.length) { var c = amy.tickets.filter(function (t) { return t === 'c'; }).length, d = amy.tickets.length - c; text('ORDERS: ' + (c ? c + ' CLASSIC ' : '') + (d ? d + ' DYNAMITE' : ''), 168, 20, { size: 6, col: '#f1e7d0' }); }
  if (sel) text('SEAT ' + sel.who.map(function (f) { return f.n.toUpperCase(); }).join(' & ') + ': PICK A TABLE', 168, 29, { size: 6, col: '#ffe36a', max: 192 });
}
function drawTitle() {
  R('#0a0506', 0, 0, W, H); var t = KIT.t;
  for (var y = 0; y < H; y += 16) for (var x = 0; x < W; x += 16) R(((x + y) / 16) % 2 ? '#1e0a0c' : '#3a0a10', x, y, 16, 16);
  R('rgba(7,4,5,0.6)', 0, 0, W, H);
  spr('npc_amy', 240, 200 + Math.sin(t * 3) * 2, { sc: 2 });
  spr('wn_bowld', 196, 170, { sc: 1.5 }); spr('wn_bowlc', 284, 170, { sc: 1.5 });
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; music.play('wntitle');
  KIT.menu({ cls: 'clear', title: 'Willy Nilly', sub: "Amy's Willy Chilli is open. Seat them, feed them, take their money.",
    items: [{ label: 'PLAY', sub: 'Day ' + Math.min(SV.unlocked, LEVELS.length), fn: function () { KIT.closeMenu(); startLevel(Math.min(SV.unlocked, LEVELS.length) - 1); }, cls: 'hot', def: true },
      { label: 'PICK A DAY', fn: levelsMenu }, { label: 'UPGRADES', sub: 'Tips in the jar: ' + SV.coins, fn: upgradesMenu }, { label: 'HOW TO PLAY', fn: helpMenu }] });
}
function levelsMenu() {
  KIT.menu({ title: 'Pick a Day', grid: true, items: LEVELS.map(function (L, i) { var lock = i + 1 > SV.unlocked, st = SV.stars[i] || 0; return { label: 'DAY ' + (i + 1) + (lock ? '' : '  ' + '★★★'.slice(0, st)), sub: lock ? 'Locked' : L.t + ' tables · best $' + (SV.best[i] || 0), dis: lock, fn: function () { KIT.closeMenu(); startLevel(i); } }; }).concat([{ label: 'BACK', back: true, fn: titleMenu }]) });
}
function upgradesMenu() {
  KIT.menu({ title: 'Upgrades', sub: 'Tips in the jar: ' + SV.coins, items: UPGRADES.map(function (u) { var own = SV.ups[u.id]; return { label: u.name.toUpperCase() + (own ? '' : '  ·  $' + u.cost), sub: u.d, cls: own ? 'done' : '', dis: own || SV.coins < u.cost, fn: function () { SV.coins -= u.cost; SV.ups[u.id] = 1; persist(); sfx.play('power'); upgradesMenu(); } }; }).concat([{ label: 'BACK', back: true, fn: function () { if (G.mode === 'over') endLevelMenuBack(); else titleMenu(); } }]) });
}
function endLevelMenuBack() { titleMenu(); }
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p>Tap a customer in the queue, then a free table to seat them. (With a controller or keys: move the cursor and press A.)</p><p>When they put a hand up (<b>!</b>) tap their table to take the order. Tap the right pot, <b>Classic</b> or <b>Dynamite</b>, to cook it. When it says READY, tap the pot to pick up the bowl and tap the table to serve.</p><p>When they want the bill (<b>$</b>), tap the table to get paid, then tap it again to clear the plates before the next lot sit down.</p><p>Amy remembers up to 4 jobs in a row. Do the same job twice in a row for a CHAIN bonus. Hearts are patience: let them run out and they storm off. Leave a pot too long and it burns. B cancels the last job.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play' || G.mode === 'intro') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' && G.mode !== 'intro') return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: 'Day ' + (G.lv + 1) + '  ·  $' + G.score, items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'START THE DAY AGAIN', fn: function () { KIT.closeMenu(); startLevel(G.lv); } }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }] });
}

/* ---------- music: a jaunty diner shuffle ---------- */
music.songs.wn = { bpm: 138, beats: 4, vol: 0.85, wet: 0.25, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C Am F G C Am D G E Am F G C F G C',
  mel: 'e5 - g5 - c6 - g5 e5 | a5 - - - e5 - c5 - | f5 - a5 - c6 - a5 f5 | g5 - b5 - d6 - - - | e6 - d6 c6 g5 - e5 - | a5 - c6 - e6 - - - | f#5 - a5 - d6 - c6 a5 | b5 - - - g5 - - - | ' +
       'g#5 - b5 - e6 - - - | c6 - b5 a5 e5 - c5 - | a5 - c6 - f6 - e6 d6 | b5 - d6 - g6 - f6 d6 | e6 - c6 - g5 - e5 - | f5 - a5 - c6 - a5 - | g5 - b5 - d6 - b5 g5 | c6 - - - - - - -' };
music.songs.wntitle = { bpm: 112, beats: 4, vol: 0.8, wet: 0.35, lead: 'calliope', bass: 'walk', acc: 'stabs', drums: 'shuffle', chords: 'F Dm Bb C F Dm G C',
  mel: 'c5 - f5 - a5 - c6 - | d6 - c6 - a5 - f5 - | d5 - f5 - bb5 - d6 - | c6 - - - - - . . | c5 - f5 - a5 - c6 - | f6 - e6 - d6 - a5 - | g5 - b5 - d6 - f6 - | e6 - - - c6 - - -' };

KIT.start({ w: W, h: H, pad: 'none', update: update, draw: draw, onPause: pauseMenu, startPauses: false,
  idleUpdate: function () {} });
titleMenu();
window.__wn = { get cursor() { return cursor; }, get sel() { return sel; }, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, G: G, get amy() { return amy; }, get groups() { return groups; }, get tables() { return tables; }, get pots() { return pots; }, get queue() { return queue; }, startLevel: startLevel, doJob: doJob, seat: seat, newGroup: newGroup, endLevel: endLevel, SV: SV, LEVELS: LEVELS, activate: activate, hotspots: hotspots };
