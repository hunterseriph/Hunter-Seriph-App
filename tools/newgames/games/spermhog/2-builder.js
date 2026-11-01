/* =====================================================================================================
   THE LEVEL BUILDER. An act is written as a list of set pieces (hills, gaps, spring towers, climbs, pools,
   tunnels...) that lay tiles down left to right from the current column and ground height. Every jump a piece
   makes is kept inside what Cumhead can do (a plain jump climbs 3 tiles and clears 6, a double jump 6 and 9).
   Tiles: '.' air  '#' ground  '=' platform you can jump up through  '/' '\' 45 degree slopes  a b (gentle rise)
   c d (gentle fall)  '^' spikes  'v' ceiling spikes  '~' '%' cream (top, body)  'L' 'l' lava  '_' '-' conveyors
   (right, left)  'Q' electric floor  'D' trapdoor  'W' wall you cannot jump through (same as '#', drawn darker)
   'k' open space underground (drawn as a dark back wall, not sky)
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
  /* ---------- traps that are not holes ---------- */
  ditch: function (b, w, foe) { // a shallow spiked ditch: it hurts, it does not kill, you can jump out
    w = w || 4; b.ground(3); b.drops(0, w, 4, 'arc', 1); for (var i = 0; i < w; i++) { b.step(i === 0 ? 2 : 0); b.ground(1); b.set(b.col - 1, b.h - 1, '^'); } b.step(-2); b.ground(4); if (foe) b.foe(-2, foe); return b; },
  swings: function (b, n) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(7); b.thing(-4, 'swing', 0, { ph: i * 1.4 }); b.drops(-6, 2, 2, null, 4); } b.ground(4); return b; }, // wrecking balls on chains
  vents: function (b, n) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(6); b.thing(-3, 'vent', 0, { ph: i * 0.9 }); b.drops(-3, 1, 9); } b.ground(3); return b; }, // steam that throws you up
  fallers: function (b, n, foe, up) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(5); b.thing(-3, 'faller', up || 8); } if (foe) b.foe(-6, foe); b.ground(4); return b; }, // pots, rocks, weights drop when you pass under
  rollers2: function (b, n) { b.ground(6); b.thing(0, 'roller', 0, { n: n || 2 }); b.ground(26); b.drops(-20, 6, 2, null, 2); return b; }, // bins, barrels, boulders roll at you
  wires: function (b, n) { b.ground(3); for (var i = 0; i < n; i++) { b.ground(6); b.thing(-5, 'arc', 0, { w: 4, ph: i * 0.8 }); } b.ground(4); return b; }, // live wires that spark across
  loop: function (b) { b.ground(10); b.thing(-6, 'loop', 0); b.drops(-9, 4, 2, null, 1.2); b.ground(10); return b; },
  /* ---------- LANES: three routes side by side for a long stretch: the high road (rooftops, gantries, ledges),
     the street, and the low road underneath. Fall through a gap in one and you land on the one below, so a slip
     costs you the better route, not a life. Springs and steam lead up, holes lead down. ---------- */
  lanes: function (b, spec) {
    var H = b.h, Z = b.zone; b.ground(4); b.thing(-2, 'spring', 0, { pow: 1 }); b.drops(-2, 3, 5, null, 1);
    var s0 = b.col;
    // the street, laid on the main builder
    (spec.mid || []).forEach(function (p) { SEC[p[0]].apply(null, [b].concat(p.slice(1))); });
    // the low road and the high road, each on a builder of its own, merged in after
    var LF = H + 11, TF = H - 9, L = Builder(Z, b.seed + 77), Tp = Builder(Z, b.seed + 99);
    L.col = s0; L.h = LF; (spec.low || []).forEach(function (p) { SEC[p[0]].apply(null, [L].concat(p.slice(1))); });
    Tp.col = s0 + 3; Tp.h = TF; (spec.top || []).forEach(function (p) { SEC[p[0]].apply(null, [Tp].concat(p.slice(1))); });
    var E = Math.max(b.col, L.col + 2, Tp.col + 4) + 8; b.ground(E - b.col); L.ground(E - L.col);
    // low road: everything under the street is carved out down to its floor, open space shows a back wall
    for (var c = s0; c < E - 1; c++) { var t = b.top[c], from = t === null || t === undefined ? H : t + 3;
      for (var y = Math.min(from, H + 3); y < b.ROWS; y++) { if (t !== null && t !== undefined && y < t + 3) continue; var ch = L.get(c, y); b.set(c, y, ch === '.' ? 'k' : ch); }
      for (var y2 = H; y2 < H + 3; y2++) if ((t === null || t === undefined) && b.get(c, y2) === '.') b.set(c, y2, '.'); }
    L.ents.forEach(function (e) { if (e.c >= s0 && e.c < E) b.ents.push(e); });
    b.set(s0 - 1, LF - 1, 'W'); for (var wy = H + 3; wy < LF; wy++) b.set(s0 - 1, wy, 'W'); for (var wy2 = H + 3; wy2 < LF; wy2++) b.set(E - 1, wy2, 'W'); // the low road's end walls
    // high road: only its slabs and what stands on them (its gaps drop you to the street)
    for (var c2 = s0 + 3; c2 < E - 5; c2++) { var tt = Tp.top[c2]; if (tt === null || tt === undefined) continue;
      for (var y3 = tt - 12; y3 < tt; y3++) { var ch2 = Tp.get(c2, y3); if (ch2 !== '.') b.set(c2, y3, ch2); }
      b.set(c2, tt, Tp.get(c2, tt) === '#' ? '#' : Tp.get(c2, tt)); b.set(c2, tt + 1, '#'); }
    Tp.ents.forEach(function (e) { if (e.c >= s0 + 3 && e.c < E - 5) b.ents.push(e); });
    // the ways between: a hole down after the spring, a spring back up halfway and at the end of the low road
    function hole(c) { for (var hx = -1; hx < 3; hx++) for (var hy = (b.top[c + hx] || H); hy < (b.top[c + hx] || H) + 3; hy++) b.set(c + hx, hy, '.'); b.ent('drop', c + 1, H - 2); b.ent('drop', c + 1, H + 2); }
    hole(s0 + 6); for (var xc = s0 + 60; xc < E - 40; xc += 64) { if (b.top[xc] === null || b.top[xc] === undefined || b.top[xc + 2] === null || b.top[xc + 2] === undefined) continue; hole(xc); b.ent('spring', xc + 1, LF, { pow: 2 }); } hole(E - 9); b.ent('spring', E - 8, LF, { pow: 2 }); hole(E - 5); b.ent('spring', E - 4, LF, { pow: 2 }); // the last spring sits right against the end wall: you can't miss it // a way down at the start, ways back up all along, the last at the end
    if (spec.portal === 'top') b.ent('portal', E - 14, (Tp.top[E - 14] || TF) - 1); else if (spec.portal === 'low') b.ent('portal', E - 14, LF - 1);
    b.h = H; return b;
  },
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
  goal: function (b) { b.ground(6); b.thing(-2, 'goal'); b.ground(40); return b; }, // no wall after the sign: the camera stops and he runs off
  arena: function (b, boss) { b.ground(4); var c0 = b.col; b.ground(30); b.thing(-15, 'arena', 0, { boss: boss, c0: c0, c1: b.col }); for (var y = 0; y < 18; y++) { b.set(c0 - 1, b.h - 1 - y, y > 6 ? 'W' : '.'); b.set(b.col, b.h - 1 - y, 'W'); } b.ground(3); b.ceil(-3, 3, 0, 18, 'W'); return b; }
};
