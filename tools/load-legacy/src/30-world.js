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
  // the secret area: not joined to the map at all. A hidden portal leads there.
  var M = AREAS.moon, me = add('moon', M.ox, M.oy + 1 + Math.floor(r() * 2)); me.entry = 1; me.type = 'moongate'; grow('moon', M.rooms);
  // special rooms per area, chosen from the rooms furthest from the way in
  AREAORDER.concat(['moon']).forEach(function (a) {
    var list = Object.keys(rooms).map(function (k) { return rooms[k]; }).filter(function (q) { return q.area === a; });
    var src = a === 'castle' ? start : list.filter(function (q) { return q.entry; })[0], dist = {}, qu = [src]; dist[key2(src.cx, src.cy)] = 0;
    while (qu.length) { var q = qu.shift(), dq = dist[key2(q.cx, q.cy)]; for (var d in q.ex) { var o = rooms[key2(q.cx + DIRV[d][0], q.cy + DIRV[d][1])]; if (o && dist[key2(o.cx, o.cy)] === undefined) { dist[key2(o.cx, o.cy)] = dq + 1; qu.push(o); } } }
    list.forEach(function (q) { q.dist = dist[key2(q.cx, q.cy)] || 0; });
    var free = list.filter(function (q) { return q.type === 'normal' && !q.entry && q !== start; }), moonA = a === 'moon';
    function deg(q) { return Object.keys(q.ex).length; }
    free.sort(function (p, q) { return (q.dist + (deg(q) === 1 ? 3 : 0)) - (p.dist + (deg(p) === 1 ? 3 : 0)); });
    var boss = free.shift(); if (boss) boss.type = 'bossdoor';
    shuffle(free, r);
    if (moonA) { ['merchant', 'shrine', 'powerup', 'challenge', 'ambush'].forEach(function (t) { var q = free.shift(); if (q) q.type = t; }); return; }
    var want = ['merchant', 'powerup', 'challenge', 'trap', 'illusion', 'shrine'], extra = ['powerup', 'challenge', 'trap', 'ambush', 'saws', 'crumble', 'cell', 'feast', 'saws', 'cell']; shuffle(extra, r); if (r() < 0.7) want.push('gamble'); want.push(extra[0]); if (r() < 0.75) want.push(extra[1]); if (r() < 0.45) want.push(extra[2]);
    want.forEach(function (t) { var q = free.shift(); if (q) q.type = t; });
    if (a === 'city') { var fq = free.filter(function (q) { return !q.ex.d; })[0] || free[0]; if (fq) { fq.type = 'flume'; free.splice(free.indexOf(fq), 1); } }
  });
  // some neighbouring plain rooms join into one big room: two screens wide, or two screens tall
  var list = Object.keys(rooms).map(function (k) { return rooms[k]; });
  function plain(q) { return q && q.type === 'normal' && !q.entry && !q.big && q !== start && Math.abs(q.cx - start.cx) + Math.abs(q.cy - start.cy) > 1; }
  shuffle(list, r);
  list.forEach(function (q) {
    if (rooms[key2(q.cx, q.cy)] !== q || !plain(q) || r() > 0.42) return;
    var opts = []; if (q.ex.r && plain(rooms[key2(q.cx + 1, q.cy)]) && rooms[key2(q.cx + 1, q.cy)].area === q.area) opts.push('r'); if (q.ex.d && plain(rooms[key2(q.cx, q.cy + 1)]) && rooms[key2(q.cx, q.cy + 1)].area === q.area) opts.push('d');
    if (!opts.length) return;
    var d = opts[Math.floor(r() * opts.length)], o = rooms[key2(q.cx + DIRV[d][0], q.cy + DIRV[d][1])], wide = d === 'r';
    var R = { cx: q.cx, cy: q.cy, cw: wide ? 2 : 1, ch: wide ? 1 : 2, area: q.area, type: 'normal', ex: {}, big: wide ? 'wide' : 'tall', exits: [], dist: Math.max(q.dist || 0, o.dist || 0) };
    for (var e1 in q.ex) if (e1 !== d) R.exits.push({ d: e1, i: 0 });
    for (var e2 in o.ex) if (e2 !== OPP[d]) R.exits.push({ d: e2, i: (wide ? (e2 === 'u' || e2 === 'd') : (e2 === 'l' || e2 === 'r')) ? 1 : 0 });
    rooms[key2(q.cx, q.cy)] = R; rooms[key2(o.cx, o.cy)] = R;
  });
  // one illusion room somewhere hides the portal in its alcove
  var ill = Object.keys(rooms).map(function (k) { return rooms[k]; }).filter(function (q) { return q.type === 'illusion'; });
  var pr = ill[Math.floor(r() * ill.length)]; if (pr) pr.portal = 1;
  var uniq = []; Object.keys(rooms).forEach(function (k) { if (uniq.indexOf(rooms[k]) < 0) uniq.push(rooms[k]); });
  uniq.forEach(function (q, i) { q.id = i; if (!q.exits) { q.exits = []; for (var d in q.ex) q.exits.push({ d: d, i: 0 }); } });
  return { seed: seed, rooms: rooms, list: uniq, start: key2(start.cx, start.cy), moonEntry: key2(me.cx, me.cy), portalFrom: pr ? key2(pr.cx, pr.cy) : null };
}

/* ---------- building one room's tiles and contents (deterministic per room) ---------- */
function roomRng(rm) { return mulberry(hash2(WORLD.seed, rm.cx + 50, rm.cy + 50)); }
function buildRoom(rm) {
  var W = CW * (rm.cw || 1), H = CH * (rm.ch || 1), tl = new Uint8Array(W * H), res = new Uint8Array(W * H), ents = [], r = roomRng(rm), A = AREAS[rm.area];
  function S(x, y, v) { if (x >= 0 && y >= 0 && x < W && y < H) tl[y * W + x] = v; }
  function G(x, y) { return (x < 0 || y < 0 || x >= W || y >= H) ? TW : tl[y * W + x]; }
  function RS(x0, y0, x1, y1) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < W && y < H) res[y * W + x] = 1; }
  function free(x0, y0, x1, y1) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { if (x < 1 || y < 1 || x > W - 2 || y > H - 2) return false; if (res[y * W + x] || tl[y * W + x] !== TA) return false; } return true; }
  function rn(a, b) { return a + Math.floor(r() * (b - a + 1)); }
  for (var x = 0; x < W; x++) { S(x, 0, TW); S(x, H - 1, TW); }
  for (var y = 0; y < H; y++) { S(0, y, TW); S(W - 1, y, TW); }
  var ex = rm.ex;
  // the openings: rows 12-14 on the sides, columns 14-17 top and bottom, in whichever screen of a big room they belong to
  (rm.exits || []).forEach(function (e) {
    var oy = e.i * CH, ox = e.i * CW;
    if (e.d === 'l') { for (y = oy + 12; y <= oy + 14; y++) S(0, y, TA); RS(0, oy + 10, 4, oy + 14); }
    if (e.d === 'r') { for (y = oy + 12; y <= oy + 14; y++) S(W - 1, y, TA); RS(W - 5, oy + 10, W - 1, oy + 14); }
    if (e.d === 'u') { for (x = ox + 14; x <= ox + 17; x++) S(x, 0, TA); RS(ox + 12, 0, ox + 19, 3); }
    if (e.d === 'd') { for (x = ox + 14; x <= ox + 17; x++) S(x, H - 1, TG); RS(ox + 12, H - 6, ox + 19, H - 1); }
  });
  function plat(x0, x1, y, v) { for (var x = x0; x <= x1; x++) S(x, y, v || TL); RS(x0, y - 3, x1, y - 1); RS(x0, y, x1, y); }
  if (rm.big) bigRoom();
  function bigRoom() {
    var segs = rm.big === 'wide' ? 2 : 1, s2, x, y;
    if (rm.big === 'tall') {
      // a tall shaft: ledges zig-zag up to the top screen, with a landing beside each high exit
      var cols = [[4, 9], [11, 16], [18, 23], [11, 16]], k = 0;
      for (y = H - 5; y >= 4; y -= 4) { var c2 = cols[k % 4]; if (free(c2[0], y - 2, c2[1], y)) plat(c2[0], c2[1], y); k++; }
      rm.exits.forEach(function (e) {
        if (e.d === 'l' && e.i === 0) plat(1, 5, CH - 1); if (e.d === 'r' && e.i === 0) plat(W - 6, W - 2, CH - 1);
        if (e.d === 'u') { plat(9, 13, 8); plat(18, 22, 4); }
      });
      for (var sp = 0; sp < 2; sp++) { var sx = rn(5, W - 8); var okS = true; for (x = sx; x < sx + 2; x++) if (res[(H - 2) * W + x] || G(x, H - 2) !== TA) okS = false; if (okS && r() < 0.6) { for (x = sx; x < sx + 2; x++) S(x, H - 2, TS); RS(sx, H - 3, sx + 1, H - 2); } }
    } else {
      rm.exits.forEach(function (e) { if (e.d === 'u') { var ox = e.i * CW; plat(ox + 9, ox + 13, 12); plat(ox + 18, ox + 22, 8); plat(ox + 12, ox + 16, 4); } }); // a way up to each exit in the ceiling
      for (s2 = 0; s2 < segs; s2++) {
        var ox = s2 * CW;
        var nb = rn(1, 3); for (var bi = 0; bi < nb; bi++) { var bw = rn(2, 4), bh = rn(1, 2), bx = ox + rn(4, 27 - bw); if (free(bx, 15 - bh, bx + bw - 1, 14) && free(bx, 15 - bh - 2, bx + bw - 1, 15 - bh - 1)) { for (y = 15 - bh; y <= 14; y++) for (x = bx; x < bx + bw; x++) S(x, y, TW); RS(bx, 15 - bh - 2, bx + bw - 1, 14); } }
        var np = rn(2, 4); for (var pi = 0; pi < np; pi++) { var pw = rn(3, 6), py = rn(6, 11), px = ox + rn(3, 28 - pw); if (free(px - 1, py - 2, px + pw, py + 1)) plat(px, px + pw - 1, py); }
        var ns = rn(0, 2); for (var si = 0; si < ns; si++) { var sw = rn(2, 3), sx2 = ox + rn(5, 26 - sw), okS2 = true; for (x = sx2; x < sx2 + sw; x++) if (res[14 * W + x] || G(x, 14) !== TA || G(x, 15) !== TW) okS2 = false; if (okS2) { for (x = sx2; x < sx2 + sw; x++) S(x, 14, TS); RS(sx2, 13, sx2 + sw - 1, 14); } }
      }
      // a high walkway across the middle of a wide hall, with a chest on it sometimes
      if (r() < 0.6) { var wy = rn(7, 8), w0 = CW - 6, w1 = CW + 5; if (free(w0, wy - 2, w1, wy) && free(w0 - 5, wy + 2, w0 - 1, wy + 4)) { plat(w0, w1, wy); plat(w0 - 5, w0 - 1, wy + 4); if (r() < 0.5) ents.push({ k: 'chest', x: CW * T, y: wy * T }); } }
    }
  }
  if (ex.u) { plat(9, 13, 12); plat(18, 22, 8); plat(12, 16, 4); }
  var t = rm.type, nE = 0, cx0 = ex.d ? 23 : 16, cxp = cx0 * T;
  if (rm.big) { t = 'big'; nE = 3 + Math.floor(A.tier / 2) + (rm.big === 'wide' ? 2 : 1); }
  if (t === 'start') {
    ents.push({ k: 'door', x: cxp, y: 15 * T, w: 48, h: 64, boss: 'blum' }); RS(cx0 - 5, 9, cx0 + 4, 14);
    ents.push({ k: 'deco', d: 'throneL', x: 6 * T, y: 15 * T }); ents.push({ k: 'deco', d: 'throneR', x: 26 * T, y: 15 * T });
  } else if (t === 'bossdoor') {
    ents.push({ k: 'door', x: cxp, y: 15 * T, w: 48, h: 64, boss: rm.boss || A.boss }); RS(cx0 - 5, 9, cx0 + 4, 14);
  } else if (t === 'merchant') {
    var who = MERCH[Math.floor(r() * MERCH.length)]; if (RUN && who === 'npc_' + RUN.cls) who = 'npc_jessiah'; // the heir you are playing does not also run a stall
    ents.push({ k: 'npc', x: cxp, y: 15 * T, who: who }); RS(cx0 - 4, 10, cx0 + 4, 14);
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
    var sinker = rn(0, 2); for (var lg = 0; lg < 3; lg++) ents.push({ k: 'log', x: 4 * T + 34 + lg * 8 * T, y: 13 * T + 15, w: 52, h: 11, vx: 52, sink: lg === sinker ? 1 : 0 }); /* one boat is leaky and goes under now and then */
    ents.push({ k: 'deco', d: 'flumesign', x: 16 * T, y: 2 * T + 4 });
    for (var qy = 6; qy < H - 1; qy++) if (G(2, qy) === TA && G(2, qy + 1) === TW) { ents.push({ k: 'deco', d: 'tallsign', x: 3 * T + 4, y: (qy + 1) * T }); break; } /* Steve checks your height, by the queue rails */
    RS(3, 11, 28, 15);
    plat(5, 7, 12); plat(24, 26, 12); /* low steps off the banks, so nothing needs a perfect double jump */
    [[5, 8, 9], [12, 16, 7], [19, 20, 8], [23, 27, 9]].forEach(function (p, i) { if (free(p[0], p[2] - 2, p[1], p[2])) { plat(p[0], p[1], p[2]); if (i === 3) ents.push({ k: 'chest', x: 25 * T + 8, y: 9 * T, big: 1 }); } });
    nE = 2;
  } else if (t === 'egate') { // the first screen of Endless: a sign, nothing to fight
    ents.push({ k: 'deco', d: 'esign', x: 16 * T, y: 4 * T }); nE = 0;
  } else if (t === 'moongate') {
    ents.push({ k: 'portal', x: cxp, y: 15 * T, back: 1 }); RS(cx0 - 4, 9, cx0 + 4, 14); nE = 0;
  } else if (t === 'saws') {
    // saw blades running back and forth on rails; a chest waits at the far end
    var far = ex.r && !ex.l ? 3 : 28;
    plat(5, 10, 11); plat(21, 26, 11); plat(13, 18, 8); /* every climb in here is 3 tiles or less */
    ents.push({ k: 'saw', x: 6 * T, x0: 6 * T, x1: 26 * T, y: 14 * T + 6, sp: 70 + 15 * A.tier, ph: 0 });
    ents.push({ k: 'saw', x: 5 * T, x0: 5 * T, x1: 26 * T, y: 9 * T - 2, sp: 50 + 10 * A.tier, ph: 0.5 });
    if (r() < 0.6) ents.push({ k: 'saw', x: 13 * T, x0: 13 * T, x1: 18 * T + 8, y: 7 * T - 2, sp: 40, ph: 0.25 });
    ents.push({ k: 'chest', x: 16 * T, y: 8 * T, big: 1 }); nE = 1;
  } else if (t === 'crumble') {
    // a floor of spikes, and above it a long run of ledges that give way under you. Do not stop.
    for (x = 5; x <= W - 6; x++) if (!res[14 * W + x] && G(x, 15) === TW) S(x, 14, TS);
    for (x = 4; x <= W - 5; x++) if (G(x, 11) === TA && !res[11 * W + x]) { S(x, 11, TV); ents.push({ k: 'drop', x: x * T + 8, y: 11 * T - 10 }); }
    RS(4, 8, W - 5, 11); plat(W - 5 < 27 ? 26 : 26, 28, 11);
    ents.push({ k: 'chest', x: 27 * T + 8, y: 11 * T, big: 1 }); nE = 1 + Math.floor(A.tier / 2);
  } else if (t === 'cell') {
    // someone is locked in a cell. Break them out and they give you something for it.
    ents.push({ k: 'cell', x: cxp, y: 15 * T, who: MERCH[Math.floor(r() * MERCH.length)] }); RS(cx0 - 4, 9, cx0 + 4, 14); nE = 2 + Math.floor(A.tier / 2);
  } else if (t === 'feast') {
    // a long table laid out. Eat one dish; the rest goes cold.
    ents.push({ k: 'feast', x: cxp, y: 15 * T }); RS(cx0 - 5, 11, cx0 + 5, 14); nE = 1;
  } else if (t === 'shrine') {
    // a blood fountain: pray once to heal
    ents.push({ k: 'shrine', x: cxp, y: 15 * T }); RS(cx0 - 4, 9, cx0 + 4, 14); nE = 1;
  } else if (t === 'gamble') {
    // a slot machine (Steve's prize wheel in Ejaculand): pay drops, pull, hope
    ents.push({ k: 'gamble', x: cxp, y: 15 * T, park: rm.area === 'city' }); RS(cx0 - 4, 8, cx0 + 4, 14); nE = 1;
  } else if (t === 'ambush') {
    // a lonely chest in the middle of the room. Opening it locks the doors.
    ents.push({ k: 'chest', x: cxp, y: 15 * T, big: 1, ambush: 1 }); RS(cx0 - 3, 11, cx0 + 3, 14);
    plat(5, 9, 10); plat(22, 26, 10); nE = 0;
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
    if (rm.portal) ents.push({ k: 'portal', x: ((ax0 + ax1) / 2 | 0) * T + 8, y: 8 * T });
    else ents.push({ k: 'chest', x: ((ax0 + ax1) / 2 | 0) * T + 8, y: 8 * T, big: 1, secret: 1 });
    for (x = ax0; x <= ax1; x++) ents.push({ k: 'drop', x: x * T + 8, y: 7 * T - 2 });
    for (var fv = 0; fv < 3; fv++) { var fx = rn(4, 24), fy = rn(9, 11); if (free(fx, fy, fx + 3, fy)) { for (x = fx; x <= fx + 3; x++) S(x, fy, TV); RS(fx, fy - 2, fx + 3, fy); } }
    nE = 1 + Math.floor(A.tier / 2);
  } else if (t !== 'big') nE = 2 + Math.floor(A.tier / 2) + (r() < 0.5 ? 1 : 0);
  // plain rooms come in several shapes, so the castle does not feel samey
  var style = 'classic';
  if (t === 'normal') { var sr = r(); style = sr < 0.34 ? 'classic' : sr < 0.47 ? 'pit' : sr < 0.6 ? 'stairs' : sr < 0.73 ? 'pillars' : sr < 0.86 ? 'tower' : 'bridge'; }
  if (style !== 'classic' && !roomStyle(style)) style = 'classic';
  rm.style = style;
  function roomStyle(st) {
    var ok = false, i, bx, bh, h;
    if (st === 'pit') { // spikes in the middle of the floor, ledges across
      var nsp = 0; for (x = 11; x <= 20; x++) if (!res[14 * W + x] && G(x, 14) === TA && G(x, 15) === TW) { S(x, 14, TS); nsp++; }
      if (nsp < 4) return false; RS(10, 12, 21, 14);
      if (free(5, 9, 10, 11)) plat(6, 10, 11); if (free(21, 9, 26, 11)) plat(21, 25, 11); if (free(13, 6, 18, 8)) plat(14, 17, 8); return true;
    }
    if (st === 'stairs') { // a staircase of blocks up to a high ledge
      var dirS = r() < 0.5 ? 1 : -1;
      for (i = 0; i < 5; i++) { bx = dirS > 0 ? 6 + i * 4 : W - 10 - i * 4; h = i + 1; if (!free(bx, 15 - h - 2, bx + 3, 14)) break; for (y = 15 - h; y <= 14; y++) for (x = bx; x < bx + 4; x++) S(x, y, TW); RS(bx, 15 - h - 2, bx + 3, 14); ok = true; }
      if (i >= 3) { var lx = dirS > 0 ? Math.min(W - 8, 6 + i * 4) : Math.max(2, W - 10 - i * 4 - 2), ly = 15 - i - 3; if (free(lx, ly - 2, lx + 5, ly)) plat(lx, lx + 5, ly); }
      return ok && i >= 3;
    }
    if (st === 'pillars') { // tall stone pillars; their tops are the platforms
      [6, 12, 19, 25].forEach(function (px) { var ph = rn(2, 4); /* low enough to hop over */ if (free(px, 15 - ph - 2, px + 1, 14)) { for (y = 15 - ph; y <= 14; y++) { S(px, y, TW); S(px + 1, y, TW); } RS(px - 1, 15 - ph - 2, px + 2, 14); ok = true; } });
      if (ok && free(13, 7, 18, 9)) plat(14, 17, 9); return ok;
    }
    if (st === 'tower') { // a column in the middle with ledges climbing round it
      // the column is low enough to get over with a step ledge either side (every climb here is 3 tiles at most)
      if (!free(9, 7, 22, 14)) return false;
      for (y = 9; y <= 14; y++) for (x = 15; x <= 16; x++) S(x, y, TW); RS(13, 8, 18, 14);
      plat(10, 13, 12); plat(18, 21, 12); if (free(9, 4, 14, 6)) plat(10, 14, 6); return true;
    }
    if (st === 'bridge') { // a long high walkway across the room, broken in the middle
      var nb2 = 0; for (x = 4; x <= W - 5; x++) if ((x < 14 || x > 17) && G(x, 9) === TA && !res[9 * W + x]) { S(x, 9, TL); nb2++; }
      if (nb2 < 12) return false; RS(4, 6, W - 5, 9);
      if (free(5, 11, 9, 13)) plat(5, 8, 12); if (free(W - 9, 11, W - 5, 13)) plat(W - 8, W - 5, 12);
      var ns3 = rn(1, 2); for (var si3 = 0; si3 < ns3; si3++) { var sx3 = rn(8, 22); if (free(sx3, 13, sx3 + 1, 14) && G(sx3, 15) === TW) { S(sx3, 14, TS); S(sx3 + 1, 14, TS); RS(sx3, 13, sx3 + 1, 14); } }
      return true;
    }
    return false;
  }
  // general features for rooms that fight
  if ((t === 'normal' && style === 'classic') || t === 'illusion' || t === 'challenge' || t === 'ambush') {
    var nb = t === 'challenge' || t === 'ambush' ? 1 : rn(0, 3);
    for (var bi = 0; bi < nb; bi++) { var bw = rn(2, 4), bh = rn(1, 2) + (r() < 0.15 ? 1 : 0), bx = rn(4, 27 - bw); if (free(bx, 15 - bh, bx + bw - 1, 14) && free(bx, 15 - bh - 2, bx + bw - 1, 15 - bh - 1)) { for (y = 15 - bh; y <= 14; y++) for (x = bx; x < bx + bw; x++) S(x, y, TW); RS(bx, 15 - bh - 2, bx + bw - 1, 14); } }
    var np = t === 'challenge' || t === 'ambush' ? 0 : rn(2, 4);
    for (var pi = 0; pi < np; pi++) { var pw = rn(3, 6), py = rn(6, 11), px = rn(3, 28 - pw); if (free(px - 1, py - 2, px + pw, py + 1)) plat(px, px + pw - 1, py); }
    if (t === 'normal') { var ns = rn(0, 2); for (var si = 0; si < ns; si++) { var sw = rn(2, 3), sx = rn(5, 26 - sw); var okS = true; for (x = sx; x < sx + sw; x++) if (res[14 * W + x] || G(x, 14) !== TA || G(x, 15) !== TW) okS = false; if (okS) { for (x = sx; x < sx + sw; x++) S(x, 14, TS); RS(sx, 13, sx + sw - 1, 14); } } }
  }
  // Ejaculand's front gate, with Steve the mascot waving you in
  if (rm.entry && rm.area === 'city') { ents.push({ k: 'deco', d: 'parkgate', x: 6 * T, y: 15 * T }); ents.push({ k: 'steve', x: 11 * T, y: 15 * T }); nE = 0; }
  // area quirks
  var fights = t === 'normal' || t === 'big', dark = false, wind = 0;
  if (fights && (rm.area === 'castle' || rm.area === 'bone') && r() < 0.55) { // chandeliers that drop when you walk under them
    var nc = rn(1, rm.big === 'wide' ? 3 : 2), tries = 0;
    while (nc > 0 && tries++ < 20) { var chx = rn(4, W - 5); if (G(chx, 0) === TW && free(chx - 1, 1, chx + 1, 5)) { ents.push({ k: 'chand', x: chx * T + 8, y: T, st: 'hang' }); RS(chx - 2, 1, chx + 2, 5); nc--; } }
  }
  if (rm.area === 'city' && t !== 'flume' && !rm.entry && r() < 0.6) { // bounce pads on the floor
    var npd = rn(1, 2), tries2 = 0;
    while (npd > 0 && tries2++ < 30) { var pdx = rn(4, W - 5), fy = H - 2; if (G(pdx, fy + 1) === TW && free(pdx - 1, fy - 3, pdx + 1, fy)) { ents.push({ k: 'pad', x: pdx * T + 8, y: (fy + 1) * T }); RS(pdx - 1, fy - 3, pdx + 1, fy); npd--; } }
  }
  if (rm.area === 'furnace' && t !== 'flume') { var nv = rn(1, 3), tv = 0; while (nv > 0 && tv++ < 30) { var vx = rn(5, W - 6); if (G(vx, H - 1) === TW && free(vx - 1, H - 4, vx + 1, H - 2)) { ents.push({ k: 'vent', x: vx * T + 8, y: (H - 1) * T, t: r() * 3.4 }); RS(vx - 1, H - 5, vx + 1, H - 2); nv--; } } }
  if ((rm.area === 'dungeon' || rm.area === 'sewer') && t !== 'start') { // drips from the ceiling, and some rooms are pitch dark
    var ndr = rn(1, 3);
    for (var dq = 0; dq < ndr; dq++) { var drx = rn(3, W - 4); if (G(drx, 0) === TW && G(drx, 1) === TA) ents.push({ k: 'drip', x: drx * T + 8, y: T, cd: 1 + r() * 3 }); }
    dark = rm.area === 'dungeon' && fights && r() < 0.5; /* the sewers stay lit so you can see the cream */
  }
  var DECO = { sewer: [['creampool', 3, 3]], bone: [['skulls', 2, 3], ['ribs', 1, 4]], furnace: [['crucible', 2, 2]] }[rm.area];
  if (DECO && t !== 'flume') DECO.forEach(function (dd) { // each endless area dresses its floors: cream puddles, skull piles and ribcages, crucibles of lava
    var n = rn(1, dd[1]), tr = 0, half = Math.ceil(dd[2] / 2);
    while (n > 0 && tr++ < 40) { var qx = rn(3, W - 4), qy = rn(2, H - 2); if (G(qx, qy) === TA && G(qx, qy + 1) === TW && G(qx - half, qy + 1) === TW && G(qx + half, qy + 1) === TW && !res[qy * W + qx] && !ents.some(function (o) { return o.k === 'adeco' && Math.abs(o.x - (qx * T + 8)) < 40 && Math.abs(o.y - (qy + 1) * T) < 8; })) { ents.push({ k: 'adeco', s: dd[0], x: qx * T + 8, y: (qy + 1) * T, fl: r() < 0.5 }); n--; } }
  });
  if (rm.area === 'roof' && fights && r() < 0.6) wind = r() < 0.5 ? -1 : 1; // gusts across the rooftops
  // stand spots for enemies and drops
  var stands = [];
  for (x = 2; x < W - 2; x++) for (y = 2; y < H - 1; y++) { var b = G(x, y + 1); if (G(x, y) === TA && G(x, y - 1) === TA && (b === TW || b === TL) && !res[y * W + x]) stands.push([x, y]); }
  shuffle(stands, r);
  var pool = A.pool, tot = 0; pool.forEach(function (p) { tot += p[1]; });
  function pickE() { var v = r() * tot; for (var i = 0; i < pool.length; i++) { v -= pool[i][1]; if (v <= 0) return pool[i][0]; } return pool[0][0]; }
  for (var e = 0; e < nE; e++) {
    var ek = t === 'flume' ? (r() < 0.5 ? 'batP' : 'imp') : pickE(), ed = ENEMIES[ek];
    if (ek === 'gargoyle') ents.push({ k: 'enemy', e: ek, x: rn(5, W - 6) * T, y: T + 23, idx: e }); // clings under the ceiling
    else if (isFlyer(ed)) ents.push({ k: 'enemy', e: ek, x: rn(6, W - 7) * T, y: rn(3, H - 8) * T, idx: e });
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
  return { w: W, h: H, tiles: tl, ents: ents, cx0: cx0, spawnX: (ex.d || style === 'tower' ? 8 : (t === 'start' ? 10 : 16)) * T, dark: dark, wind: wind, storm: rm.area === 'roof' };
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
