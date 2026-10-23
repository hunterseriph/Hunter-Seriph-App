/* =====================================================================================================
   WORLD: a grid of one-screen rooms (32x16 tiles). Each run gets a new seed, so the castle rebuilds itself.
   Tiles: 0 air, 1 wall, 2 one-way ledge, 3 spikes, 4 illusion wall (looks solid, walk through),
          5 illusion ledge (gives way under you), 6 barrier (solid only while a fight has the room locked)
   ===================================================================================================== */
var TA = 0, TW = 1, TL = 2, TS = 3, TF = 4, TV = 5, TB = 6, TG = 7;
var WORLD = null;
function key2(x, y) { return x + ',' + y; }
var DIRV = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }, OPP = { l: 'r', r: 'l', u: 'd', d: 'u' };

function genWorld(seed) {
  var r = mulberry(seed), rooms = {};
  function inArea(a, x, y) { var A = AREAS[a]; return x >= A.ox && y >= A.oy && x < A.ox + A.w && y < A.oy + A.h; }
  function add(a, x, y) { var k = key2(x, y); if (!rooms[k]) rooms[k] = { cx: x, cy: y, area: a, type: 'normal', ex: {} }; return rooms[k]; }
  function link(a, b, d) { a.ex[d] = 1; b.ex[OPP[d]] = 1; }
  function walkTo(a, from, tx, ty) { // a wandering but always-arriving path inside an area
    var x = from.cx, y = from.cy, cur = from, guard = 0;
    while ((x !== tx || y !== ty) && guard++ < 200) {
      var opts = []; if (x < tx) opts.push('r'); if (x > tx) opts.push('l'); if (y < ty) opts.push('d'); if (y > ty) opts.push('u');
      if (r() < 0.25) { var side = ['l', 'r', 'u', 'd'][Math.floor(r() * 4)], nx = x + DIRV[side][0], ny = y + DIRV[side][1]; if (inArea(a, nx, ny)) opts = [side]; }
      var d = opts[Math.floor(r() * opts.length)]; x += DIRV[d][0]; y += DIRV[d][1];
      var nx2 = add(a, x, y); link(cur, nx2, d); cur = nx2;
    }
    return cur;
  }
  function grow(a, n) {
    var list = Object.keys(rooms).map(function (k) { return rooms[k]; }).filter(function (q) { return q.area === a; }), tries = 0;
    while (list.length < n && tries++ < 600) {
      var s = list[Math.floor(r() * list.length)], d = ['l', 'r', 'u', 'd'][Math.floor(r() * 4)], nx = s.cx + DIRV[d][0], ny = s.cy + DIRV[d][1];
      if (!inArea(a, nx, ny) || rooms[key2(nx, ny)]) continue;
      var q = add(a, nx, ny); link(s, q, d); list.push(q);
    }
    // a few loops so it is not a pure tree
    list.forEach(function (q) { ['r', 'd'].forEach(function (d) { var o = rooms[key2(q.cx + DIRV[d][0], q.cy + DIRV[d][1])]; if (o && o.area === a && !q.ex[d] && r() < 0.18) link(q, o, d); }); });
    return list;
  }
  // the start room sits on the castle's left edge: nothing lies to the left of it
  var C = AREAS.castle, start = add('castle', C.ox, C.oy + 2); start.type = 'start';
  // connectors out of the castle
  var upX = C.ox + 1 + Math.floor(r() * 4), dnX = C.ox + 1 + Math.floor(r() * 4), rtY = C.oy + Math.floor(r() * C.h);
  // the starting room opens up, down and right, and each way leads on towards its own area
  var sU = add('castle', start.cx, start.cy - 1), sD = add('castle', start.cx, start.cy + 1), sR = add('castle', start.cx + 1, start.cy);
  link(start, sU, 'u'); link(start, sD, 'd'); link(start, sR, 'r');
  var cu = walkTo('castle', sU, upX, C.oy), cd = walkTo('castle', sD, dnX, C.oy + C.h - 1), cr = walkTo('castle', sR, C.ox + C.w - 1, rtY);
  start.signs = { u: 'roof', d: 'dungeon', r: 'city' };
  grow('castle', C.rooms);
  var ru = add('roof', upX, C.oy - 1); link(cu, ru, 'u'); ru.entry = 1;
  var dd = add('dungeon', dnX, C.oy + C.h); link(cd, dd, 'd'); dd.entry = 1;
  var cc = add('city', C.ox + C.w, rtY); link(cr, cc, 'r'); cc.entry = 1;
  grow('roof', AREAS.roof.rooms); grow('city', AREAS.city.rooms); grow('dungeon', AREAS.dungeon.rooms);
  // special rooms per area, chosen from the rooms furthest from the way in
  AREAORDER.forEach(function (a) {
    var list = Object.keys(rooms).map(function (k) { return rooms[k]; }).filter(function (q) { return q.area === a; });
    var src = a === 'castle' ? start : list.filter(function (q) { return q.entry; })[0], dist = {}, qu = [src]; dist[key2(src.cx, src.cy)] = 0;
    while (qu.length) { var q = qu.shift(), dq = dist[key2(q.cx, q.cy)]; for (var d in q.ex) { var o = rooms[key2(q.cx + DIRV[d][0], q.cy + DIRV[d][1])]; if (o && dist[key2(o.cx, o.cy)] === undefined) { dist[key2(o.cx, o.cy)] = dq + 1; qu.push(o); } } }
    list.forEach(function (q) { q.dist = dist[key2(q.cx, q.cy)] || 0; });
    var free = list.filter(function (q) { return q.type === 'normal' && !q.entry && q !== start; });
    function deg(q) { return Object.keys(q.ex).length; }
    free.sort(function (p, q) { return (q.dist + (deg(q) === 1 ? 3 : 0)) - (p.dist + (deg(p) === 1 ? 3 : 0)); });
    var boss = free.shift(); if (boss) boss.type = 'bossdoor';
    shuffle(free, r);
    var want = ['merchant', 'powerup', 'challenge', 'trap', 'illusion'], extra = ['powerup', 'challenge', 'trap', 'illusion']; shuffle(extra, r); if (r() < 0.6) want.push(extra[0]); if (r() < 0.3) want.push(extra[1]);
    want.forEach(function (t) { var q = free.shift(); if (q) q.type = t; });
    if (a === 'city') { var fq = free.filter(function (q) { return !q.ex.d; })[0] || free[0]; if (fq) { fq.type = 'flume'; free.splice(free.indexOf(fq), 1); } }
  });
  var id = 0; Object.keys(rooms).forEach(function (k) { rooms[k].id = id++; });
  return { seed: seed, rooms: rooms, start: key2(start.cx, start.cy) };
}

/* ---------- building one room's tiles and contents (deterministic per room) ---------- */
function roomRng(rm) { return mulberry(hash2(WORLD.seed, rm.cx + 50, rm.cy + 50)); }
function buildRoom(rm) {
  var W = CW, H = CH, tl = new Uint8Array(W * H), res = new Uint8Array(W * H), ents = [], r = roomRng(rm), A = AREAS[rm.area];
  function S(x, y, v) { if (x >= 0 && y >= 0 && x < W && y < H) tl[y * W + x] = v; }
  function G(x, y) { return (x < 0 || y < 0 || x >= W || y >= H) ? TW : tl[y * W + x]; }
  function RS(x0, y0, x1, y1) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < W && y < H) res[y * W + x] = 1; }
  function free(x0, y0, x1, y1) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { if (x < 1 || y < 1 || x > W - 2 || y > H - 2) return false; if (res[y * W + x] || tl[y * W + x] !== TA) return false; } return true; }
  function rn(a, b) { return a + Math.floor(r() * (b - a + 1)); }
  for (var x = 0; x < W; x++) { S(x, 0, TW); S(x, H - 1, TW); }
  for (var y = 0; y < H; y++) { S(0, y, TW); S(W - 1, y, TW); }
  var ex = rm.ex;
  if (ex.l) { for (y = 12; y <= 14; y++) S(0, y, TA); RS(0, 10, 4, 14); }
  if (ex.r) { for (y = 12; y <= 14; y++) S(W - 1, y, TA); RS(W - 5, 10, W - 1, 14); }
  if (ex.u) { for (x = 14; x <= 17; x++) S(x, 0, TA); RS(12, 0, 19, 3); }
  if (ex.d) { for (x = 14; x <= 17; x++) S(x, H - 1, TG); RS(12, 10, 19, 15); }
  function plat(x0, x1, y, v) { for (var x = x0; x <= x1; x++) S(x, y, v || TL); RS(x0, y - 3, x1, y - 1); RS(x0, y, x1, y); }
  if (ex.u) { plat(9, 13, 12); plat(18, 22, 8); plat(12, 16, 4); }
  var t = rm.type, nE = 0, cx0 = ex.d ? 23 : 16, cxp = cx0 * T;
  if (t === 'start') {
    ents.push({ k: 'door', x: cxp, y: 15 * T, w: 48, h: 64, boss: 'blum' }); RS(cx0 - 5, 9, cx0 + 4, 14);
    ents.push({ k: 'deco', d: 'throneL', x: 6 * T, y: 15 * T }); ents.push({ k: 'deco', d: 'throneR', x: 26 * T, y: 15 * T });
  } else if (t === 'bossdoor') {
    ents.push({ k: 'door', x: cxp, y: 15 * T, w: 48, h: 64, boss: A.boss }); RS(cx0 - 5, 9, cx0 + 4, 14);
  } else if (t === 'merchant') {
    ents.push({ k: 'npc', x: cxp, y: 15 * T, who: MERCH[Math.floor(r() * MERCH.length)] }); RS(cx0 - 4, 10, cx0 + 4, 14);
  } else if (t === 'powerup') {
    ents.push({ k: 'altar', x: cxp, y: 15 * T }); RS(cx0 - 4, 10, cx0 + 4, 14);
  } else if (t === 'challenge') {
    ents.push({ k: 'trigger', x0: 6 * T, x1: 26 * T });
    plat(5, 9, 10); plat(22, 26, 10); if (!ex.u) plat(13, 18, 7);
  } else if (t === 'trap') {
    for (x = 5; x <= 26; x++) if (!res[14 * W + x] && G(x, 15) === TW) S(x, 14, TS);
    var pxs = [[5, 8, 11], [11, 14, 10], [17, 20, 11], [23, 26, 10]];
    pxs.forEach(function (p) { if (free(p[0], p[2], p[1], p[2])) plat(p[0], p[1], p[2]); });
    ents.push({ k: 'turret', x: 1 * T + 6, y: rn(5, 8) * T + 8, dir: 1, cd: r() * 2 }); ents.push({ k: 'turret', x: (W - 1) * T - 6, y: rn(5, 8) * T + 8, dir: -1, cd: 1 + r() * 2 });
    var cp = [[14, 9], [16, 7]]; for (var ci = 0; ci < cp.length; ci++) if (free(cp[ci][0] - 1, cp[ci][1] - 2, cp[ci][0] + 1, cp[ci][1])) { plat(cp[ci][0] - 1, cp[ci][0] + 1, cp[ci][1]); ents.push({ k: 'chest', x: cp[ci][0] * T + 8, y: cp[ci][1] * T, big: 1 }); break; }
    if (ci === cp.length) ents.push({ k: 'chest', x: 3 * T, y: 15 * T, big: 1 });
  } else if (t === 'flume') {
    // the Load Flume: a channel of cream with logs drifting left to right. Ride them across; falling in hurts.
    ents.push({ k: 'water', x0: 4 * T, x1: 28 * T, y: 13 * T + 6 });
    for (var lg = 0; lg < 3; lg++) ents.push({ k: 'log', x: 4 * T + 34 + lg * 8 * T, y: 13 * T + 15, w: 52, h: 11, vx: 52 });
    ents.push({ k: 'deco', d: 'flumesign', x: 16 * T, y: 2 * T + 4 });
    RS(3, 11, 28, 15);
    [[5, 8, 9], [12, 16, 7], [23, 27, 9]].forEach(function (p, i) { if (free(p[0], p[2] - 2, p[1], p[2])) { plat(p[0], p[1], p[2]); if (i === 2) ents.push({ k: 'chest', x: 25 * T + 8, y: 9 * T, big: 1 }); } });
    nE = 2;
  } else if (t === 'illusion') {
    var right = !ex.r || r() < 0.5, mx0 = right ? 23 : 1, mx1 = right ? 30 : 8;
    if (ex.u && !right) { mx0 = 1; mx1 = 8; }
    for (y = 3; y <= 8; y++) for (x = mx0; x <= mx1; x++) S(x, y, TW);
    var ax0 = right ? mx0 + 1 : mx0, ax1 = right ? mx1 : mx1 - 1;
    for (y = 5; y <= 7; y++) for (x = ax0; x <= ax1; x++) S(x, y, TF);
    var fw = right ? mx0 : mx1; for (y = 5; y <= 7; y++) S(fw, y, TF);
    RS(mx0 - 1, 3, mx1 + 1, 8);
    var ex0 = right ? mx0 - 5 : mx1 + 1, ex1 = right ? mx0 - 1 : mx1 + 5; for (x = ex0; x <= ex1; x++) if (G(x, 8) === TA) S(x, 8, TL);
    RS(ex0, 5, ex1, 8);
    var sx0 = right ? mx0 - 10 : mx1 + 6, sx1 = sx0 + 4; for (x = sx0; x <= sx1; x++) if (G(x, 11) === TA) S(x, 11, TL); RS(sx0, 8, sx1, 11);
    ents.push({ k: 'chest', x: ((ax0 + ax1) / 2 | 0) * T + 8, y: 8 * T, big: 1, secret: 1 });
    for (x = ax0; x <= ax1; x++) ents.push({ k: 'drop', x: x * T + 8, y: 7 * T - 2 });
    for (var fv = 0; fv < 3; fv++) { var fx = rn(4, 24), fy = rn(9, 11); if (free(fx, fy, fx + 3, fy)) { for (x = fx; x <= fx + 3; x++) S(x, fy, TV); RS(fx, fy - 2, fx + 3, fy); } }
    nE = 1 + Math.floor(A.tier / 2);
  } else nE = 2 + Math.floor(A.tier / 2) + (r() < 0.5 ? 1 : 0);
  // general features for rooms that fight
  if (t === 'normal' || t === 'illusion' || t === 'challenge') {
    var nb = t === 'challenge' ? 1 : rn(0, 3);
    for (var bi = 0; bi < nb; bi++) { var bw = rn(2, 4), bh = rn(1, 2) + (r() < 0.15 ? 1 : 0), bx = rn(4, 27 - bw); if (free(bx, 15 - bh, bx + bw - 1, 14) && free(bx, 15 - bh - 2, bx + bw - 1, 15 - bh - 1)) { for (y = 15 - bh; y <= 14; y++) for (x = bx; x < bx + bw; x++) S(x, y, TW); RS(bx, 15 - bh - 2, bx + bw - 1, 14); } }
    var np = t === 'challenge' ? 0 : rn(2, 4);
    for (var pi = 0; pi < np; pi++) { var pw = rn(3, 6), py = rn(6, 11), px = rn(3, 28 - pw); if (free(px - 1, py - 2, px + pw, py + 1)) plat(px, px + pw - 1, py); }
    if (t === 'normal') { var ns = rn(0, 2); for (var si = 0; si < ns; si++) { var sw = rn(2, 3), sx = rn(5, 26 - sw); var okS = true; for (x = sx; x < sx + sw; x++) if (res[14 * W + x] || G(x, 14) !== TA || G(x, 15) !== TW) okS = false; if (okS) { for (x = sx; x < sx + sw; x++) S(x, 14, TS); RS(sx, 13, sx + sw - 1, 14); } } }
  }
  // Ejaculand's front gate, with Steve the mascot waving you in
  if (rm.entry && rm.area === 'city') { ents.push({ k: 'deco', d: 'parkgate', x: 6 * T, y: 15 * T }); ents.push({ k: 'steve', x: 11 * T, y: 15 * T }); nE = 0; }
  // stand spots for enemies and drops
  var stands = [];
  for (x = 2; x < W - 2; x++) for (y = 2; y < H - 1; y++) { var b = G(x, y + 1); if (G(x, y) === TA && G(x, y - 1) === TA && (b === TW || b === TL) && !res[y * W + x]) stands.push([x, y]); }
  shuffle(stands, r);
  var pool = A.pool, tot = 0; pool.forEach(function (p) { tot += p[1]; });
  function pickE() { var v = r() * tot; for (var i = 0; i < pool.length; i++) { v -= pool[i][1]; if (v <= 0) return pool[i][0]; } return pool[0][0]; }
  for (var e = 0; e < nE; e++) {
    var ek = t === 'flume' ? (r() < 0.5 ? 'batP' : 'imp') : pickE(), ed = ENEMIES[ek];
    if (ed.ai === 'fly' || ed.ai === 'shoot') ents.push({ k: 'enemy', e: ek, x: rn(6, 25) * T, y: rn(3, 8) * T, idx: e });
    else { var sp = null; for (var q = 0; q < stands.length; q++) { var sx2 = stands[q][0]; if (sx2 > 6 && sx2 < W - 7 && Math.abs(sx2 - 16) > 2) { sp = stands.splice(q, 1)[0]; break; } } if (sp) ents.push({ k: 'enemy', e: ek, x: sp[0] * T + 8, y: (sp[1] + 1) * T, idx: e }); }
  }
  // drops: little rows on ledges, like Spermhog
  var di = 0;
  for (y = 3; y < H - 1; y++) for (x = 2; x < W - 2; x++) if (G(x, y) === TL && G(x - 1, y) !== TL && r() < 0.6) { var len = 0; while (G(x + len, y) === TL) len++; for (var k = 0; k < len; k += 2) ents.push({ k: 'drop', x: (x + k) * T + 8, y: y * T - 10, di: di++ }); }
  if (t === 'normal' && r() < 0.18 && stands.length) { var cs = stands.pop(); ents.push({ k: 'chest', x: cs[0] * T + 8, y: (cs[1] + 1) * T }); }
  // decorations by area
  // decorations, placed on purpose: hangings in mirrored pairs under the ceiling, candles standing on ledges and the floor
  function clear(x0, y0, x1, y1) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) if (xx < 1 || xx > W - 2 || G(xx, yy) !== TA || res[yy * W + xx]) return false; return true; }
  function nearEnt(px, py, d) { return ents.some(function (en) { return en.k !== 'enemy' && en.x !== undefined && Math.abs(en.x - px) < d && Math.abs((en.y || 0) - py) < 40; }); }
  var city = rm.area === 'city', hang = city ? 'bulbs' : 'banner', hw = city ? 3 : 2, hh = city ? 2 : 4;
  var pairs = city ? [[9, W - 12], [4, W - 7]] : [[8, W - 10], [12, W - 14], [4, W - 6]]; // inner pairs first so the HUD corners stay clear
  var wantPairs = t === 'start' ? 1 : rn(1, 2), placed = 0;
  for (var pq = 0; pq < pairs.length && placed < wantPairs; pq++) {
    var a0 = pairs[pq][0], a1 = pairs[pq][1];
    if (G(a0, 0) === TW && G(a1, 0) === TW && clear(a0, 1, a0 + hw - 1, hh) && clear(a1, 1, a1 + hw - 1, hh)) {
      ents.push({ k: 'deco', d: hang, x: a0 * T + (city ? 2 : 6), y: city ? T + 3 : T + 2, hue: r() });
      ents.push({ k: 'deco', d: hang, x: a1 * T + (city ? 2 : 6), y: city ? T + 3 : T + 2, hue: r() });
      placed++;
    }
  }
  // ledge tops: candles at both ends of a bare ledge (castle side), or one neon sign on a post (Ejaculand)
  var ledges = [];
  for (y = 4; y < H - 2; y++) for (x = 1; x < W - 1; x++) if (G(x, y) === TL && G(x - 1, y) !== TL) { var x1 = x; while (G(x1 + 1, y) === TL) x1++; if (x1 - x >= 3 && clear(x, y - 2, x1, y - 1) && !ents.some(function (en) { return (en.k === 'drop' || en.k === 'chest') && en.y < y * T + 2 && en.y > y * T - 20 && en.x > x * T - 8 && en.x < (x1 + 1) * T + 8; })) ledges.push([x, x1, y]); }
  shuffle(ledges, r);
  if (city) { if (ledges.length && r() < 0.7) { var lg = ledges[0], mx = ((lg[0] + lg[1] + 1) / 2) * T; ents.push({ k: 'deco', d: 'neon', x: Math.round(mx - 17), y: lg[2] * T - 24, hue: r(), post: 1 }); } }
  else {
    var nl = Math.min(ledges.length, rn(1, 2));
    for (var li = 0; li < nl; li++) { var L0 = ledges[li]; ents.push({ k: 'deco', d: 'candle', x: L0[0] * T + 3, y: L0[2] * T - 18 }); ents.push({ k: 'deco', d: 'candle', x: L0[1] * T + 7, y: L0[2] * T - 18 }); }
    // a candle by each side wall on the floor, only where there is no way out on that side
    if (!ex.l && !ex.r && r() < 0.6 && clear(2, 13, 2, 14) && clear(W - 3, 13, W - 3, 14) && G(2, 15) === TW && G(W - 3, 15) === TW && !nearEnt(2 * T + 8, 15 * T, 24) && !nearEnt((W - 3) * T + 8, 15 * T, 24)) {
      ents.push({ k: 'deco', d: 'candle', x: 2 * T + 5, y: 15 * T - 18 }); ents.push({ k: 'deco', d: 'candle', x: (W - 3) * T + 5, y: 15 * T - 18 });
    }
  }
  ents.forEach(function (en, i) { en.i = i; });
  return { w: W, h: H, tiles: tl, ents: ents, cx0: cx0, spawnX: (ex.d ? 8 : (t === 'start' ? 10 : 16)) * T };
}

/* ---------- boss arenas (two screens wide). Reached through a boss door. ---------- */
function buildArena(boss) {
  var W = CW * 2, H = CH, tl = new Uint8Array(W * H);
  function S(x, y, v) { if (x >= 0 && y >= 0 && x < W && y < H) tl[y * W + x] = v; }
  for (var x = 0; x < W; x++) { S(x, 0, TW); S(x, H - 1, TW); }
  for (var y = 0; y < H; y++) { S(0, y, TW); S(W - 1, y, TW); }
  for (y = 12; y <= 14; y++) S(0, y, TB);
  [[8, 13, 10], [50, 55, 10], [27, 36, 7], [17, 21, 4], [42, 46, 4]].forEach(function (p) { for (var x = p[0]; x <= p[1]; x++) S(x, p[2], TL); });
  return { w: W, h: H, tiles: tl, ents: [], arena: boss };
}
