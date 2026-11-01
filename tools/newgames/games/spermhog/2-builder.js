/* =====================================================================================================
   THE LEVEL BUILDER. An act is written as a list of set pieces (hills, gaps, spring towers, climbs, pools,
   tunnels...) that lay tiles down left to right from the current column and ground height. Every jump a piece
   makes is kept inside what Cumhead can do (a plain jump climbs 3 tiles and clears 6, a double jump 6 and 9).
   Tiles: '.' air  '#' ground  '=' platform you can jump up through  '/' '\' 45 degree slopes  a b (gentle rise)
   c d (gentle fall)  '^' spikes  'v' ceiling spikes  '~' '%' cream (top, body)  'L' 'l' lava  '_' '-' conveyors
   (right, left)  'Q' electric floor  'D' trapdoor  'W' wall you cannot jump through (same as '#', drawn darker)
   ===================================================================================================== */
function Builder(zone, seed) {
  var ROWS = 120, b = { zone: zone, cols: [], top: [], col: 0, h: 80, ents: [], ROWS: ROWS, seed: seed || 1 };
  var r = seed || 1; b.rnd = function () { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; };
  function colAt(c) { while (b.cols.length <= c) { var a = []; for (var i = 0; i < ROWS; i++) a.push('.'); b.cols.push(a); b.top.push(null); } return b.cols[c]; }
  b.set = function (c, row, ch) { if (row < 0 || row >= ROWS || c < 0) return; colAt(c)[row] = ch; };
  b.get = function (c, row) { if (c < 0 || c >= b.cols.length || row < 0 || row >= ROWS) return '.'; return b.cols[c][row]; };
  function groundCol(c, top, ch) { colAt(c); for (var y = top; y < ROWS; y++) b.cols[c][y] = '#'; if (ch) b.cols[c][top] = ch; b.top[c] = top; }
  b.ent = function (k, c, row, o) { var e = { k: k, c: c, row: row }; if (o) for (var q in o) e[q] = o[q]; b.ents.push(e); return e; };
  b.gt = function (dx) { var c = b.col + dx; return b.top[c] !== null && b.top[c] !== undefined ? b.top[c] : b.h; }; // ground row under a column already built
  /* ---------- ground shapes ---------- */
  b.ground = function (n, ch) { for (var i = 0; i < n; i++) groundCol(b.col++, b.h, ch); return b; };
  b.up = function (k, steep) { for (var i = 0; i < k; i++) { if (steep) { groundCol(b.col, b.h - 1, '/'); b.col++; } else { groundCol(b.col, b.h - 1, 'a'); b.top[b.col] = b.h - 1; b.col++; groundCol(b.col, b.h - 1, 'b'); b.col++; } b.h--; } return b; };
  b.down = function (k, steep) { for (var i = 0; i < k; i++) { if (steep) { groundCol(b.col, b.h, '\\'); b.col++; } else { groundCol(b.col, b.h, 'c'); b.col++; groundCol(b.col, b.h, 'd'); b.col++; } b.h++; } return b; };
  b.step = function (dk) { b.h += dk; return b; };
  b.gap = function (n) { for (var i = 0; i < n; i++) { colAt(b.col); b.top[b.col] = null; b.col++; } return b; };
  b.pool = function (n, depth, kind) { // a sunken pool of cream (swim) or lava (burns)
    var t = kind === 'lava' ? 'L' : '~', body = kind === 'lava' ? 'l' : '%';
    for (var i = 0; i < n; i++) { var c = b.col++; groundCol(c, b.h + depth); b.top[c] = b.h + depth; b.set(c, b.h, t); for (var y = b.h + 1; y < b.h + depth; y++) b.set(c, y, body); b.cols[c].liq = 1; }
    return b;
  };
  b.trap = function (n) { for (var i = 0; i < n; i++) { var c = b.col++; colAt(c); b.cols[c][b.h] = 'D'; b.top[c] = b.h; } return b; }; // a trapdoor over nothing
  b.surface = function (dx, n, ch) { for (var i = 0; i < n; i++) { var c = b.col + dx + i, t = b.top[c]; if (t !== null && t !== undefined) b.set(c, t, ch); } return b; }; // conveyors, electric floor, trapdoors on the ground
  /* ---------- things above the ground (row offsets are tiles above the current ground) ---------- */
  b.ledge = function (dx, up, w, kind) { // kind '#' solid two thick, '=' thin platform, 'F' crumbles, 'M' moves sideways, 'N' moves up and down
    var c0 = b.col + dx, row = b.h - up;
    if (kind === 'F' || kind === 'M' || kind === 'N' || kind === 'O') { b.ent(kind === 'F' ? 'crumble' : kind === 'M' ? 'movh' : kind === 'N' ? 'movv' : 'circle', c0, row, { w: w }); return b; }
    for (var i = 0; i < w; i++) { b.set(c0 + i, row, kind === '=' ? '=' : '#'); if (kind !== '=') b.set(c0 + i, row + 1, '#'); }
    return b;
  };
  b.ceil = function (dx, n, up, thick, ch) { for (var i = 0; i < n; i++) { var c = b.col + dx + i, g = b.top[c] !== null && b.top[c] !== undefined ? b.top[c] : b.h; for (var t = 0; t < (thick || 3); t++) b.set(c, g - up - t, ch || 'W'); } return b; };
  b.drops = function (dx, n, up, shape, gapc) { // a row or an arc of drops
    gapc = gapc || 1.5;
    for (var i = 0; i < n; i++) { var c = b.col + dx + i * gapc, g = b.top[Math.floor(c)]; if (g === null || g === undefined) g = b.h; var lift = shape === 'arc' ? Math.sin((i + 0.5) / n * Math.PI) * 3 : 0; b.ent('drop', c, g - (up || 2) - lift); }
    return b;
  };
  b.foe = function (dx, key, up) { var c = b.col + dx, g = b.top[c]; if (g === null || g === undefined) g = b.h; b.ent('foe', c, g - (up || 0), { f: key }); return b; };
  b.thing = function (dx, k, up, o) { var c = b.col + dx, g = b.top[c]; if (g === null || g === undefined) g = b.h; return b.ent(k, c, g - (up || 0), o); };
  b.spikes = function (dx, w) { for (var i = 0; i < w; i++) { var c = b.col + dx + i, g = b.top[c]; if (g !== null && g !== undefined) b.set(c, g - 1, '^'); } return b; };
  return b;
}

/* ---------- set pieces: each lays tiles from b.col at b.h and moves on. 'm' 'n' 'p' 'q' are the zone's walkers, 'w' its flyer ---------- */
var SEC = {
  start: function (b) { b.ground(16); b.thing(-13, 'start'); b.drops(-9, 5, 2); return b; },
  run: function (b, n, foe) { b.ground(n); if (n >= 8) b.drops(-n + 2, Math.floor(n / 3), 2); if (foe) b.foe(-Math.floor(n / 2), foe); return b; },
  rollers: function (b, k) { // gentle hills: speed
    for (var i = 0; i < (k || 2); i++) { b.ground(3); b.up(2); b.ground(4); b.drops(-4, 3, 2); b.down(2); }
    b.ground(3); return b;
  },
  valley: function (b, d) { d = d || 3; b.ground(2); b.down(d, true); b.ground(4); b.drops(-4, 3, 1); b.up(d, true); b.ground(3); b.drops(-2, 3, 3, 'arc'); return b; },
  gaps: function (b, k, w, foe) { // run and jump: gaps with a foe between
    for (var i = 0; i < k; i++) { b.ground(6); if (foe && i % 2) b.foe(-3, foe); b.drops(0, Math.max(2, w - 1), 3, 'arc', 1.4); b.gap(w); }
    b.ground(5); return b;
  },
  stairs: function (b, k, dir) { for (var i = 0; i < k; i++) { b.ground(4); b.step(dir === 'down' ? 2 : -2); } b.ground(4); b.drops(-4, 3, 2); return b; },
  platPit: function (b, k, style, foe) { // a pit with floating platforms; style '=' thin, 'F' crumbling, 'M' moving, 'N' lifts
    b.ground(4); var c0 = b.col, n = 0;
    for (var i = 0; i < k; i++) {
      var dy = [2, 3, 1, 3, 2][i % 5], w = style === 'M' ? 3 : style === 'N' ? 3 : 4, gapw = style === 'M' ? 4 : 3;
      b.gap(gapw); b.ledge(0, dy, w, style || '='); b.drops(0, w - 1, dy + 2, null, 1); if (foe && style === '=' && i === 2) b.ent('foe', b.col + 1, b.h - dy, { f: foe });
      b.gap(w); n++;
    }
    b.gap(3); b.ground(5); return b;
  },
  springTower: function (b, foeLow) { // a spring up to a high route over a lower one with foes and spikes; they meet again
    b.ground(5); b.thing(-2, 'spring', 0, { pow: 1 }); var c0 = b.col;
    b.ledge(0, 8, 9, '='); b.drops(1, 6, 10, null, 1.2); b.ledge(12, 9, 8, '='); b.thing(15, 'box', 9, { item: 'drops' }); b.ledge(23, 8, 10, '=');
    b.drops(24, 6, 10, null, 1.4);
    b.ground(6); if (foeLow) b.foe(-3, foeLow); b.spikes(0, 3); b.ground(3); b.ground(8); if (foeLow) b.foe(-4, foeLow); b.spikes(0, 3); b.ground(3); b.ground(14);
    return b;
  },
  climb: function (b, rows, foe) { // a zig-zag of ledges up a cliff, then the ground carries on higher up
    b.ground(3); var steps = Math.ceil(rows / 3);
    for (var i = 0; i < steps; i++) { b.ledge(i % 2 ? 4 : 0, 3 * (i + 1), 5, '='); b.drops(i % 2 ? 5 : 1, 3, 3 * (i + 1) + 2, null, 1); }
    b.ground(9); if (foe) b.foe(-2, foe, 3 * steps); b.step(-steps * 3); b.ground(6); b.drops(-5, 4, 2); return b;
  },
  drop: function (b, rows) { b.ground(4); b.drops(1, 4, 2, 'arc'); b.step(rows); b.ground(2); b.drops(-2, 2, 2); b.ground(6); return b; },
  tunnel: function (b, n, hz) { // a low ceiling with hazards inside
    b.ground(2); b.ceil(0, n, 5, 4); b.ground(n);
    var at = 4; (hz || []).forEach(function (k) { if (k === 'spike') b.spikes(-n + at, 2); else if (k === 'drops') b.drops(-n + at, 4, 2, null, 1); else if (k.length === 1) b.foe(-n + at, k); else b.thing(-n + at, k, 0); at += Math.max(5, Math.floor((n - 6) / Math.max(1, hz.length))); });
    b.ground(2); return b;
  },
  box: function (b, item) { b.ground(3); b.ledge(-2, 2, 1, '#'); b.thing(-2, 'box', 3, { item: item }); b.ground(3); return b; },
  check: function (b) { b.ground(5); b.thing(-3, 'check'); return b; },
  dash: function (b) { b.ground(3); b.thing(-2, 'dash', 0, { dir: 1 }); b.ground(10); b.drops(-9, 6, 2, null, 1.2); return b; },
  spikeRun: function (b, k) { for (var i = 0; i < k; i++) { b.ground(5); b.spikes(-3, 2); b.ledge(-4, 3, 4, '='); b.drops(-4, 3, 5, null, 1); } b.ground(4); return b; },
  pool: function (b, n, logs) { // a cream or lava pool, crossed on floating logs or plain platforms
    var kind = b.zone.liquid || 'cream'; b.ground(3); var c0 = b.col; b.pool(n, kind === 'lava' ? 3 : 4, kind);
    for (var x = 2; x < n - 3; x += logs ? 8 : 6) { if (logs) b.ent('movh', c0 + x, b.h - 1, { w: 3, range: 2.5, log: 1 }); else { b.set(c0 + x, b.h - 2, '='); b.set(c0 + x + 1, b.h - 2, '='); b.set(c0 + x + 2, b.h - 2, '='); } b.ent('drop', c0 + x + 1, b.h - 4); }
    b.ground(5); return b;
  },
  conveyor: function (b, n, dir, foe) { b.ground(n); b.surface(-n, n, dir < 0 ? '-' : '_'); if (foe) b.foe(-Math.floor(n / 2), foe); b.drops(-n + 2, Math.floor(n / 3), 2, null, 2); return b; },
  bumpers: function (b) { // Ejaculand: a pit full of bumpers to bounce across
    b.ground(4); var c0 = b.col; b.gap(18);
    [[3, 4], [7, 2], [11, 5], [15, 3]].forEach(function (p) { b.ent('bumper', c0 + p[0], b.h - p[1]); b.ent('drop', c0 + p[0], b.h - p[1] - 2); });
    b.ledge(-18 + 8, 0, 3, '=');
    b.ground(5); return b;
  },
  jets: function (b, n) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(5); b.thing(-3, 'jet', 0, { ph: i * 0.7 }); } b.ground(3); return b; },
  crushers: function (b, n) { b.ground(3); b.ceil(0, n * 6, 7, 3); for (var i = 0; i < n; i++) { b.ground(6); b.thing(-4, 'crusher', 7, { ph: i * 0.9 }); } b.ground(3); return b; },
  electric: function (b, n) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(5); b.surface(-4, 3, 'Q'); b.thing(-3, 'zap', 0, { ph: i * 0.8 }); } b.ground(3); return b; },
  trapdoors: function (b, n) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(3); b.trap(2); b.thing(-2, 'trap', 0, { ph: i * 0.6 }); } b.ground(4); return b; }, // floors that drop open over a pit
  saws: function (b, n, vert) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(7); b.thing(-4, 'saw', vert ? 2 : 1, { vert: vert ? 1 : 0, ph: i * 1.1 }); } b.ground(3); return b; },
  crumbleBridge: function (b, n) { b.ground(3); var c0 = b.col; b.gap(n); for (var x = 0; x < n; x++) b.ent('crumble', c0 + x, b.h, { w: 1 }); b.drops(-n + 1, Math.floor(n / 2), 2, null, 2); b.ground(4); return b; },
  fork: function (b, n, hz, item, portal) { // three ways through: a spring to the high road, the street with its foes, or a hole down to the low road
    n = Math.max(48, n || 56); b.ground(4); b.thing(-2, 'spring', 0, { pow: 1 }); b.drops(-2, 3, 4, null, 1); b.ground(2);
    var c0 = b.col, H = b.h; b.ground(n);
    // high road: a solid deck seven up, drops along it, a box, a flyer
    for (var x = c0 + 2; x < c0 + n - 6; x++) { b.set(x, H - 7, '#'); b.set(x, H - 6, '#'); }
    for (var d = c0 + 5; d < c0 + n - 10; d += 9) for (var k = 0; k < 4; k++) b.ent('drop', d + k * 1.3, H - 9 - Math.sin((k + 0.5) / 4 * Math.PI) * 2);
    b.ent('box', c0 + Math.floor(n / 2), H - 8, { item: item || 'shield' }); b.ent('foe', c0 + Math.floor(n * 0.7), H - 9, { f: 'w' });
    if (portal === 'high') b.ent('portal', c0 + n - 12, H - 10);
    // low road: a hole, a tunnel under the street full of drops, a spring back up through a second hole
    var h0 = c0 + 7, h1 = c0 + n - 13;
    for (var hx = 0; hx < 3; hx++) for (var y = H; y <= H + 6; y++) { b.set(h0 + hx, y, '.'); b.set(h1 + hx, y, '.'); }
    for (var tx = h0 + 3; tx < h1; tx++) for (var ty = H + 2; ty <= H + 6; ty++) b.set(tx, ty, '.');
    b.ent('spring', h1 + 1, H + 7, { pow: 1 }); for (var dd = h0 + 1; dd < h1 - 1; dd += 1.6) b.ent('drop', dd, H + 5);
    b.ent('drop', h0 + 1, H - 2); b.ent('drop', h0 + 1, H - 4); // a trail into the hole
    if (portal === 'low') b.ent('portal', Math.floor((h0 + h1) / 2), H + 6);
    // the street: the zone's hazards, kept clear of the holes
    var at = h0 + 6, step = Math.max(5, Math.floor((h1 - h0 - 10) / Math.max(1, (hz || []).length)));
    (hz || []).forEach(function (k) { if (k === 'spike') { b.set(at, H - 1, '^'); b.set(at + 1, H - 1, '^'); } else if (k.length === 1) b.ent('foe', at, H, { f: k }); else b.ent(k, at, H, { ph: at * 0.3 }); at += step; });
    b.ground(4); return b;
  },
  goal: function (b) { b.ground(6); b.thing(-2, 'goal'); b.ground(22); b.ceil(-2, 2, 0, 20, 'W'); return b; },
  arena: function (b, boss) { b.ground(4); var c0 = b.col; b.ground(30); b.thing(-15, 'arena', 0, { boss: boss, c0: c0, c1: b.col }); for (var y = 0; y < 18; y++) { b.set(c0 - 1, b.h - 1 - y, y > 6 ? 'W' : '.'); b.set(b.col, b.h - 1 - y, 'W'); } b.ground(3); b.ceil(-3, 3, 0, 18, 'W'); return b; }
};
