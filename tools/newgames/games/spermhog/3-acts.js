/* =====================================================================================================
   THE ACTS, piece by piece. Act 1 of each zone teaches its gimmick, Act 2 pushes it and ends in the boss
   arena. Each act runs about 750 to 900 tiles (2 minutes and more for a first run), with checkpoints along the
   way and the hardest stretch near the end. m n p q are the zone's walkers, w its flyer (ZONES[].foes).
   ===================================================================================================== */
/* three-lane stretches: what runs on the high road, the street and the low road, per zone and per act
   (act 2 gets the meaner list). Gaps in the street fall to the low road, gaps on the high road fall to the street. */
function LANES(z, hard, portal) {
  var L = [
    // NIGHT CITY: rooftops and gantries / the street / the subway
    [{ top: [['run', 10], ['gaps', 2, 4], ['box', 'shoes'], ['run', 8, 'w'], ['swings', 1], ['gaps', 2, 5], ['run', 14], ['dash'], ['gaps', 2, 4], ['run', 12]],
       mid: [['run', 12, 'm'], ['fallers', 2], ['gaps', 1, 4], ['run', 10, 'n'], ['rollers2', 2], ['wires', 2], ['gaps', 1, 4, 'm'], ['run', 10, 'p'], ['ditch', 3], ['run', 12, 'n']],
       low: [['run', 14, 'n'], ['wires', 2], ['run', 10, 'm'], ['rollers2', 2], ['box', 'drops'], ['run', 12, 'n'], ['ditch', 3], ['run', 16]] },
     { top: [['run', 8], ['gaps', 3, 5], ['swings', 2], ['box', 'shield'], ['platPit', 4, 'M'], ['run', 10, 'w'], ['gaps', 2, 5], ['dash'], ['run', 14]],
       mid: [['run', 10, 'n'], ['rollers2', 3], ['fallers', 3, 'm'], ['gaps', 2, 4], ['wires', 3], ['run', 10, 'p'], ['swings', 2], ['ditch', 4, 'n'], ['run', 12]],
       low: [['run', 10, 'm'], ['wires', 3], ['ditch', 4], ['rollers2', 3], ['run', 10, 'n'], ['box', 'drops'], ['wires', 2], ['run', 14]] }],
    // CREAM SEWERS: pipes overhead / the walkway / the deep drain
    [{ top: [['run', 10], ['gaps', 2, 4], ['box', 'shoes'], ['conveyor', 14, 1], ['gaps', 2, 4], ['run', 10, 'w'], ['dash'], ['run', 14]],
       mid: [['run', 10, 'm'], ['conveyor', 16, -1, 'n'], ['fallers', 2], ['gaps', 1, 4], ['rollers2', 2], ['ditch', 3], ['run', 12, 'p']],
       low: [['run', 12, 'q'], ['conveyor', 16, 1], ['rollers2', 2], ['box', 'drops'], ['ditch', 3], ['run', 14, 'n']] },
     { top: [['run', 8], ['gaps', 3, 5], ['conveyor', 16, -1], ['box', 'shield'], ['platPit', 4, 'N'], ['run', 10, 'w'], ['gaps', 2, 5], ['run', 14]],
       mid: [['run', 10, 'n'], ['conveyor', 18, -1, 'm'], ['fallers', 3], ['gaps', 2, 4], ['rollers2', 3], ['vents', 2], ['ditch', 4, 'p'], ['run', 12]],
       low: [['run', 10, 'q'], ['conveyor', 18, -1], ['rollers2', 3], ['ditch', 4], ['box', 'drops'], ['run', 12, 'n']] }],
    // EJACULAND: the coaster track / the midway / under the boardwalk
    [{ top: [['run', 8], ['dash'], ['rollers', 2], ['gaps', 2, 5], ['box', 'shoes'], ['loop'], ['gaps', 2, 4], ['run', 12, 'w']],
       mid: [['run', 10, 'm'], ['bumpers'], ['rollers2', 2], ['swings', 2], ['run', 10, 'n'], ['wires', 2], ['run', 12, 'p']],
       low: [['run', 12, 'n'], ['wires', 2], ['rollers2', 2], ['box', 'drops'], ['ditch', 3], ['run', 14, 'p']] },
     { top: [['run', 6], ['dash'], ['loop'], ['gaps', 3, 5], ['swings', 2], ['box', 'shield'], ['platPit', 4, 'O'], ['dash'], ['run', 12]],
       mid: [['run', 8, 'n'], ['bumpers'], ['swings', 3], ['rollers2', 3], ['wires', 3], ['ditch', 4, 'm'], ['run', 10]],
       low: [['run', 10, 'm'], ['wires', 3], ['rollers2', 3], ['ditch', 4], ['box', 'drops'], ['run', 12, 'p']] }],
    // THE BONE PIT: rib bridges / the ossuary floor / the catacombs
    [{ top: [['run', 8], ['crumbleBridge', 6], ['run', 8, 'w'], ['gaps', 2, 4], ['box', 'shoes'], ['crumbleBridge', 8], ['run', 12]],
       mid: [['run', 10, 'm'], ['fallers', 3], ['ditch', 3], ['rollers2', 2], ['swings', 2], ['run', 12, 'n']],
       low: [['run', 12, 'p'], ['fallers', 2, null, 6], ['rollers2', 2], ['box', 'drops'], ['ditch', 3], ['run', 14, 'm']] },
     { top: [['run', 6], ['crumbleBridge', 8], ['gaps', 3, 5], ['swings', 2], ['box', 'shield'], ['crumbleBridge', 10], ['run', 12, 'w']],
       mid: [['run', 8, 'n'], ['fallers', 4], ['swings', 3], ['rollers2', 3], ['ditch', 4, 'm'], ['run', 10, 'p']],
       low: [['run', 10, 'm'], ['fallers', 3, null, 6], ['rollers2', 3], ['ditch', 4], ['box', 'drops'], ['run', 12, 'p']] }],
    // BLOOD FACTORY: gantries / the shop floor / the furnace tunnels
    [{ top: [['run', 8], ['conveyor', 14, 1], ['gaps', 2, 4], ['box', 'shoes'], ['jets', 2], ['gaps', 2, 4], ['run', 12, 'w']],
       mid: [['run', 10, 'm'], ['jets', 3], ['conveyor', 16, -1, 'n'], ['fallers', 2], ['rollers2', 2], ['crushers', 2], ['run', 10]],
       low: [['run', 12, 'n'], ['jets', 3], ['rollers2', 2], ['box', 'drops'], ['wires', 2], ['run', 14, 'p']] },
     { top: [['run', 6], ['conveyor', 16, -1], ['gaps', 3, 5], ['jets', 3], ['box', 'shield'], ['platPit', 4, 'M'], ['run', 12]],
       mid: [['run', 8, 'n'], ['crushers', 3], ['jets', 4], ['rollers2', 3], ['fallers', 3, 'm'], ['wires', 3], ['run', 10]],
       low: [['run', 10, 'm'], ['jets', 4], ['wires', 3], ['rollers2', 3], ['box', 'drops'], ['run', 12, 'p']] }],
    // SPUNK BRAIN: catwalks / the machine floor / the guts
    [{ top: [['run', 6], ['saws', 2], ['gaps', 2, 5], ['box', 'shield'], ['wires', 2], ['gaps', 2, 4], ['dash'], ['run', 10]],
       mid: [['run', 8, 'm'], ['electric', 3], ['swings', 2], ['trapdoors', 3], ['rollers2', 3], ['saws', 2], ['run', 10, 'n']],
       low: [['run', 10, 'n'], ['crushers', 3], ['wires', 3], ['rollers2', 2], ['box', 'drops'], ['jets', 3], ['run', 12, 'p']] },
     { top: [['run', 6], ['saws', 3], ['gaps', 3, 5], ['wires', 3], ['box', 'shield'], ['platPit', 5, 'N'], ['saws', 2], ['run', 10]],
       mid: [['run', 6, 'n'], ['electric', 4], ['swings', 3], ['trapdoors', 4], ['rollers2', 3], ['crushers', 3], ['saws', 3], ['run', 8]],
       low: [['run', 8, 'm'], ['crushers', 4], ['wires', 4], ['rollers2', 3], ['jets', 4], ['box', 'drops'], ['run', 10, 'p']] }]
  ][z], A = L[hard ? 1 : 0], B = L[1];
  // long: two lists back to back (the second always the meaner one), so a route lasts half a minute
  return { top: A.top.concat(B.top), mid: A.mid.concat(B.mid), low: A.low.concat(B.low), portal: portal || null };
}
/* every act: a stretch to warm up, a long three-lane section, single-lane set pieces with the zone's traps, a
   second three-lane section (meaner), a hard run to the sign. Act 2s end in the boss arena. */
function ACT(z, act, seed, a, b, c, d) {
  var plan = [['start']].concat(a, [['check'], ['lanes', LANES(z, act === 2, act === 1 ? 'top' : null)], ['check']], b, [['check'], ['lanes', LANES(z, true, act === 2 ? 'low' : null)], ['check']], c);
  plan = plan.concat(act === 2 ? [['run', 12], ['arena', ZONES[z].boss]] : [['goal']]);
  return { z: z, act: act, seed: seed, plan: plan };
}
var ACTS = [
  // NIGHT CITY act 1: west to the middle of town. Clubhouse Row, the cafe quarter, the building site, downtown (rooftops, the street, the
  // subway), Potbelly Plaza. Every district has its own look, shops and trap; nothing repeats
  { z: 0, act: 1, seed: 11, plan: [['district', 'row'], ['start'], ['run', 18, 'm'], ['rollers', 2], ['box', 'drops'], ['run', 14, 'n'], ['valley', 3], ['run', 12], ['loop'], ['springTower', 'p'], ['run', 16, 'n'], ['dash'], ['rollers', 3], ['run', 12, 'm'], ['check'],
    ['district', 'cafe'], ['run', 14, 'w'], ['awnings', 3], ['run', 12, 'm'], ['stairs', 2, 'up'], ['awnings', 2], ['run', 10, 'w'], ['box', 'shield'], ['stairs', 2, 'down'], ['run', 10, 'n'], ['awnings', 4], ['run', 14], ['check'],
    ['district', 'site'], ['run', 8, 'p'], ['swings', 2], ['run', 10], ['platPit', 4, 'N', null, 1], ['run', 8, 'm'], ['fallers', 3], ['climb', 9, 'n'], ['platPit', 4, 'M', null, 1], ['run', 8], ['swings', 1], ['fallers', 2], ['drop', 6], ['run', 10, 'p'], ['check'],
    ['district', 'downtown'], ['lanes', { top: [['run', 12], ['gaps', 2, 4], ['vents', 2], ['run', 10, 'w'], ['gaps', 2, 5], ['box', 'shoes'], ['run', 12], ['gaps', 2, 4], ['run', 10], ['vents', 3], ['gaps', 3, 4], ['run', 10, 'w'], ['gaps', 2, 5], ['run', 14]],
      mid: [['run', 8, 'm'], ['traffic', 40, 'n'], ['run', 8], ['box', 'drops'], ['traffic', 46, 'p'], ['run', 10, 'm'], ['traffic', 50, 'n'], ['run', 12]],
      low: [['run', 6, 'n'], ['subway', 50], ['run', 6, 'm'], ['wires', 2], ['subway', 44], ['box', 'drops'], ['run', 8, 'n'], ['subway', 46], ['wires', 2], ['run', 10]], portal: 'top' }], ['check'],
    ['district', 'plaza'], ['run', 16], ['dash'], ['run', 20], ['goal']] },
  // NIGHT CITY act 2: the middle of town to the storm drain. Red Light Alley, the cream docks (containers, the pier, the canal), the overpass,
  // old town, and the Beast waiting in the drain
  { z: 0, act: 2, seed: 12, plan: [['district', 'alley'], ['start'], ['run', 14, 'n'], ['washlines', 3], ['run', 10, 'm'], ['rollers2', 3], ['run', 12, 'n'], ['box', 'shoes'], ['washlines', 2], ['stairs', 2, 'up'], ['rollers2', 2], ['stairs', 2, 'down'], ['washlines', 3], ['run', 12], ['check'],
    ['district', 'docks'], ['lanes', { top: [['run', 10], ['crumbleBridge', 6], ['run', 8, 'w'], ['gaps', 2, 4], ['crumbleBridge', 8], ['box', 'shield'], ['run', 10], ['gaps', 3, 4], ['crumbleBridge', 10], ['run', 8, 'w'], ['gaps', 2, 5], ['run', 12]],
      mid: [['run', 10, 'm'], ['gaps', 2, 4, 'n'], ['run', 12, 'p'], ['gaps', 2, 5], ['run', 14, 'm'], ['box', 'drops'], ['run', 10, 'n'], ['gaps', 3, 4, 'p'], ['run', 12, 'm'], ['gaps', 2, 5], ['run', 12]],
      low: [['run', 6], ['pool', 34, 1], ['run', 8, 'q'], ['pool', 30, 1], ['run', 8, 'n'], ['box', 'drops'], ['pool', 36, 1], ['run', 10]], portal: 'low' }], ['check'],
    ['district', 'highway'], ['run', 10], ['dash'], ['loop'], ['ramps', 2], ['rollers', 3], ['dash'], ['loop'], ['ramps', 1], ['valley', 5], ['dash'], ['ramps', 2], ['loop'], ['run', 12], ['check'],
    ['district', 'oldtown'], ['run', 12, 'w'], ['graves', 4], ['run', 10, 'm'], ['valley', 4], ['box', 'shield'], ['stairs', 3, 'up'], ['graves', 3], ['run', 10, 'w'], ['stairs', 3, 'down'], ['graves', 2], ['run', 12, 'w'], ['check'],
    ['district', 'drain'], ['run', 12], ['arena', 'beast']] },
  ACT(1, 1, 21, [['run', 14, 'm'], ['pool', 18], ['run', 10, 'n'], ['conveyor', 16, 1, 'm'], ['box', 'drops'], ['fallers', 2]],
    [['pool', 24, 1], ['springTower', 'p'], ['conveyor', 20, -1, 'n'], ['rollers2', 2], ['ditch', 3], ['valley', 4], ['box', 'shield'], ['pool', 22, 1], ['run', 12, 'm']],
    [['vents', 2], ['conveyor', 18, 1, 'n'], ['fallers', 3], ['pool', 26, 1], ['ditch', 4, 'p'], ['run', 12]]),
  ACT(1, 2, 22, [['conveyor', 18, 1, 'm'], ['pool', 24, 1], ['fallers', 3], ['box', 'shoes'], ['run', 10, 'n']],
    [['pool', 30, 1], ['conveyor', 22, -1, 'n'], ['springTower', 'm'], ['rollers2', 3], ['vents', 2], ['ditch', 4], ['box', 'shield'], ['pool', 28, 1], ['run', 10, 'p']],
    [['conveyor', 22, -1, 'm'], ['fallers', 4], ['rollers2', 3], ['pool', 30, 1], ['ditch', 4], ['run', 10]]),
  ACT(2, 1, 31, [['dash'], ['rollers', 3], ['loop'], ['bumpers'], ['run', 10, 'm'], ['valley', 4], ['dash'], ['box', 'drops']],
    [['pool', 30, 1], ['loop'], ['swings', 2], ['springTower', 'n'], ['bumpers'], ['rollers2', 2], ['dash'], ['loop'], ['box', 'shield'], ['run', 10, 'p']],
    [['dash'], ['valley', 5], ['bumpers'], ['wires', 2], ['swings', 2], ['loop'], ['run', 12, 'n']]),
  ACT(2, 2, 32, [['dash'], ['loop'], ['valley', 5], ['bumpers'], ['swings', 2], ['box', 'shoes'], ['run', 10, 'n']],
    [['pool', 34, 1], ['loop'], ['springTower', 'm'], ['swings', 3], ['bumpers'], ['rollers2', 3], ['wires', 2], ['box', 'shield'], ['dash'], ['loop']],
    [['bumpers'], ['swings', 3], ['wires', 3], ['rollers2', 3], ['ditch', 4], ['run', 10]]),
  ACT(3, 1, 41, [['run', 14, 'm'], ['crumbleBridge', 8], ['run', 10, 'p'], ['fallers', 2], ['stairs', 3, 'down'], ['box', 'drops']],
    [['climb', 9, 'm'], ['crumbleBridge', 10], ['swings', 2], ['rollers2', 2], ['ditch', 3], ['box', 'shield'], ['tunnel', 26, ['p', 'spike', 'n']], ['run', 10]],
    [['crumbleBridge', 12], ['fallers', 3], ['swings', 2], ['ditch', 4, 'm'], ['drop', 6], ['run', 12]]),
  ACT(3, 2, 42, [['crumbleBridge', 10], ['run', 12, 'n'], ['fallers', 3], ['swings', 2], ['box', 'shoes']],
    [['tunnel', 30, ['m', 'spike', 'p', 'n']], ['crumbleBridge', 12], ['springTower', 'm'], ['rollers2', 3], ['swings', 3], ['ditch', 4], ['box', 'shield'], ['run', 10]],
    [['crumbleBridge', 14], ['fallers', 4], ['rollers2', 3], ['swings', 3], ['ditch', 4], ['run', 10]]),
  ACT(4, 1, 51, [['conveyor', 16, 1, 'm'], ['jets', 3], ['pool', 18], ['run', 10, 'p'], ['box', 'drops'], ['crushers', 3]],
    [['conveyor', 20, -1, 'n'], ['springTower', 'm'], ['jets', 4], ['rollers2', 2], ['fallers', 3], ['pool', 24, 1], ['box', 'shield'], ['wires', 2]],
    [['crushers', 4], ['conveyor', 18, 1, 'n'], ['jets', 4], ['rollers2', 3], ['ditch', 4], ['run', 12]]),
  ACT(4, 2, 52, [['jets', 4], ['pool', 24, 1], ['conveyor', 20, -1, 'n'], ['crushers', 4], ['box', 'shoes']],
    [['springTower', 'p'], ['jets', 5], ['fallers', 4], ['pool', 30, 1], ['rollers2', 3], ['crushers', 4], ['box', 'shield'], ['wires', 3]],
    [['crushers', 5], ['conveyor', 24, 1, 'm'], ['jets', 5], ['rollers2', 3], ['fallers', 3], ['run', 10]]),
  ACT(5, 1, 61, [['saws', 3], ['electric', 3], ['run', 10, 'm'], ['trapdoors', 3], ['box', 'shield'], ['crushers', 3]],
    [['jets', 4], ['conveyor', 20, -1, 'n'], ['saws', 3, 1], ['swings', 3], ['pool', 24, 1], ['electric', 4], ['rollers2', 3], ['box', 'shield'], ['wires', 3]],
    [['trapdoors', 4], ['crushers', 4], ['saws', 4], ['electric', 4], ['swings', 2], ['run', 10]]),
  ACT(5, 2, 62, [['electric', 4], ['saws', 4], ['trapdoors', 4], ['box', 'shield'], ['crushers', 4]],
    [['pool', 28, 1], ['jets', 5], ['saws', 4, 1], ['swings', 3], ['conveyor', 24, 1, 'n'], ['electric', 5], ['rollers2', 3], ['box', 'shield'], ['wires', 4]],
    [['trapdoors', 5], ['crushers', 5], ['saws', 5], ['jets', 5], ['electric', 5], ['swings', 3], ['rollers2', 3], ['run', 10]])
];
/* lay an act's tiles: returns the finished level (tile grid, things, size) */
function buildAct(a) {
  var Z = ZONES[a.z], b = Builder(Z, a.seed);
  a.plan.forEach(function (p) { var f = SEC[p[0]]; if (!f) throw new Error('no piece ' + p[0]); f.apply(null, [b].concat(p.slice(1))); });
  // crop to what is used: a little sky above the highest thing, a few rows under the lowest ground
  var lo = b.ROWS, hi = 0; b.top.forEach(function (t) { if (t !== null && t !== undefined) { lo = Math.min(lo, t); hi = Math.max(hi, t); } });
  b.ents.forEach(function (e) { lo = Math.min(lo, e.row); hi = Math.max(hi, e.row); });
  b.cols.forEach(function (col) { for (var y = b.ROWS - 1; y > 0; y--) if (col[y] !== '#') { hi = Math.max(hi, y); break; } }); // the low roads
  b.cols.forEach(function (col) { for (var y = 0; y < b.ROWS; y++) if (col[y] !== '.' && col[y] !== '#') { lo = Math.min(lo, y); break; } });
  var y0 = Math.max(0, Math.floor(lo) - 14), y1 = Math.min(b.ROWS, hi + 5), H = y1 - y0, W = b.cols.length;
  var t = new Array(W * H);
  for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) t[y * W + x] = b.cols[x][y + y0];
  b.ents.forEach(function (e) { e.x = e.c * TS + TS / 2; e.y = (e.row - y0) * TS; }); // y: the top of that tile row (where a thing standing there has its feet)
  var dc = null; if (b.dists.length) { dc = new Array(W); var di = 0, cur = b.dists[0].id; for (var cx = 0; cx < W; cx++) { while (di < b.dists.length && b.dists[di].c <= cx) { cur = b.dists[di].id; di++; } dc[cx] = cur; } }
  return { w: W, h: H, t: t, ents: b.ents, zone: Z, act: a, distCol: dc, dists: b.dists, bands: b.bands.map(function (q) { return { c0: q.c0, c1: q.c1, H: q.H - y0 }; }) };
}
