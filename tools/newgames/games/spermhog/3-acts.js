/* =====================================================================================================
   THE ACTS, piece by piece. Act 1 of each zone teaches its gimmick, Act 2 pushes it and ends in the boss
   arena. Each act runs about 750 to 900 tiles (2 minutes and more for a first run), with checkpoints along the
   way and the hardest stretch near the end. m n p q are the zone's walkers, w its flyer (ZONES[].foes).
   ===================================================================================================== */
var ACTS = [
  // ---------- NIGHT CITY: streets and rooftops ----------
  { z: 0, act: 1, seed: 11, plan: [['start'], ['run', 18, 'm'], ['rollers', 3], ['gaps', 3, 4, 'm'], ['box', 'drops'], ['run', 14, 'n'], ['springTower', 'm'], ['valley', 3], ['check'],
    ['platPit', 5, '='], ['run', 16, 'p'], ['climb', 9, 'm'], ['dash'], ['rollers', 2], ['stairs', 3, 'down'], ['box', 'shield'], ['gaps', 3, 5, 'n'], ['check'],
    ['tunnel', 30, ['m', 'drops', 'spike', 'p']], ['valley', 4], ['run', 20, 'n'], ['platPit', 5, 'M'], ['springTower', 'p'], ['spikeRun', 3], ['rollers', 3], ['drop', 6], ['run', 18, 'm'], ['goal']] },
  { z: 0, act: 2, seed: 12, plan: [['start'], ['rollers', 2], ['run', 14, 'n'], ['gaps', 4, 5, 'm'], ['climb', 12, 'n'], ['box', 'shoes'], ['dash'], ['rollers', 3], ['check'],
    ['springTower', 'n'], ['platPit', 6, 'F'], ['valley', 4], ['run', 16, 'p'], ['stairs', 4, 'up'], ['spikeRun', 4], ['box', 'shield'], ['check'],
    ['tunnel', 34, ['n', 'spike', 'm', 'drops', 'spike']], ['gaps', 4, 6, 'p'], ['platPit', 6, 'M'], ['climb', 9, 'm'], ['drop', 9], ['dash'], ['check'], ['run', 12], ['arena', 'beast']] },
  // ---------- CREAM SEWERS: pools, currents, cream falls ----------
  { z: 1, act: 1, seed: 21, plan: [['start'], ['run', 14, 'm'], ['pool', 18], ['run', 10, 'n'], ['rollers', 2], ['conveyor', 18, 1, 'm'], ['box', 'drops'], ['pool', 26, 1], ['check'],
    ['springTower', 'p'], ['gaps', 3, 5, 'm'], ['valley', 4], ['conveyor', 22, -1, 'n'], ['climb', 9, 'p'], ['pool', 30, 1], ['box', 'shield'], ['check'],
    ['tunnel', 30, ['m', 'drops', 'n', 'spike']], ['platPit', 5, '='], ['drop', 6], ['pool', 22], ['run', 16, 'p'], ['rollers', 2], ['spikeRun', 3], ['run', 14, 'n'], ['goal']] },
  { z: 1, act: 2, seed: 22, plan: [['start'], ['conveyor', 20, 1, 'm'], ['pool', 28, 1], ['gaps', 4, 5, 'n'], ['box', 'shoes'], ['climb', 12, 'p'], ['dash'], ['check'],
    ['platPit', 6, 'N'], ['pool', 34, 1], ['conveyor', 24, -1, 'n'], ['springTower', 'm'], ['valley', 4], ['box', 'shield'], ['check'],
    ['tunnel', 36, ['n', 'spike', 'p', 'drops', 'm']], ['pool', 30, 1], ['platPit', 6, 'F'], ['spikeRun', 4], ['drop', 8], ['check'], ['run', 12], ['arena', 'kraken']] },
  // ---------- EJACULAND: bumpers, coasters (slopes and dash pads), the Load Flume ----------
  { z: 2, act: 1, seed: 31, plan: [['start'], ['dash'], ['rollers', 3], ['bumpers'], ['run', 12, 'm'], ['valley', 4], ['dash'], ['valley', 5], ['box', 'drops'], ['check'],
    ['pool', 32, 1], ['springTower', 'n'], ['bumpers'], ['gaps', 3, 5, 'p'], ['rollers', 3], ['box', 'shield'], ['check'],
    ['platPit', 5, 'M'], ['climb', 9, 'm'], ['dash'], ['valley', 5], ['spikeRun', 3], ['bumpers'], ['run', 16, 'n'], ['rollers', 2], ['goal']] },
  { z: 2, act: 2, seed: 32, plan: [['start'], ['dash'], ['valley', 5], ['bumpers'], ['gaps', 4, 5, 'n'], ['box', 'shoes'], ['pool', 36, 1], ['check'],
    ['springTower', 'm'], ['platPit', 6, 'N'], ['dash'], ['rollers', 3], ['bumpers'], ['climb', 12, 'p'], ['box', 'shield'], ['check'],
    ['platPit', 6, 'M'], ['spikeRun', 4], ['valley', 5], ['bumpers'], ['gaps', 4, 6, 'm'], ['drop', 9], ['check'], ['run', 12], ['arena', 'pig']] },
  // ---------- THE BONE PIT: crumbling bridges, rising hands, ghosts, the dark ----------
  { z: 3, act: 1, seed: 41, plan: [['start'], ['run', 16, 'm'], ['crumbleBridge', 8], ['run', 12, 'p'], ['stairs', 3, 'down'], ['spikeRun', 3], ['box', 'drops'], ['check'],
    ['platPit', 5, 'F'], ['run', 14, 'n'], ['climb', 12, 'm'], ['tunnel', 30, ['p', 'spike', 'm', 'drops']], ['crumbleBridge', 10], ['box', 'shield'], ['check'],
    ['springTower', 'n'], ['gaps', 4, 5, 'p'], ['valley', 4], ['crumbleBridge', 12], ['drop', 8], ['run', 14, 'm'], ['spikeRun', 4], ['goal']] },
  { z: 3, act: 2, seed: 42, plan: [['start'], ['crumbleBridge', 10], ['run', 14, 'n'], ['climb', 12, 'p'], ['platPit', 6, 'F'], ['box', 'shoes'], ['check'],
    ['tunnel', 36, ['m', 'spike', 'p', 'spike', 'n']], ['crumbleBridge', 12], ['springTower', 'm'], ['gaps', 4, 6, 'n'], ['box', 'shield'], ['check'],
    ['platPit', 6, 'N'], ['spikeRun', 5], ['crumbleBridge', 14], ['stairs', 4, 'up'], ['drop', 10], ['check'], ['run', 12], ['arena', 'boner']] },
  // ---------- BLOOD FACTORY: lava, conveyors, flame jets, crushers ----------
  { z: 4, act: 1, seed: 51, plan: [['start'], ['conveyor', 18, 1, 'm'], ['jets', 3], ['pool', 20], ['run', 12, 'p'], ['box', 'drops'], ['crushers', 3], ['check'],
    ['platPit', 5, 'M'], ['conveyor', 22, -1, 'n'], ['springTower', 'm'], ['jets', 4], ['pool', 26, 1], ['box', 'shield'], ['check'],
    ['climb', 9, 'p'], ['crushers', 4], ['gaps', 3, 5, 'm'], ['conveyor', 20, 1, 'n'], ['platPit', 5, 'F'], ['jets', 4], ['drop', 6], ['run', 14, 'm'], ['goal']] },
  { z: 4, act: 2, seed: 52, plan: [['start'], ['jets', 4], ['pool', 28, 1], ['conveyor', 24, -1, 'n'], ['crushers', 4], ['box', 'shoes'], ['check'],
    ['platPit', 6, 'M'], ['springTower', 'p'], ['jets', 5], ['climb', 12, 'm'], ['pool', 32, 1], ['box', 'shield'], ['check'],
    ['crushers', 5], ['platPit', 6, 'F'], ['conveyor', 26, 1, 'm'], ['jets', 5], ['gaps', 4, 6, 'n'], ['drop', 9], ['check'], ['run', 12], ['arena', 'hotload']] },
  // ---------- SPUNK BRAIN: everything at once. Saws, flame jets, crushers, electric floors, trapdoors, lava ----------
  { z: 5, act: 1, seed: 61, plan: [['start'], ['saws', 3], ['electric', 3], ['run', 12, 'm'], ['trapdoors', 4], ['box', 'shield'], ['crushers', 4], ['check'],
    ['platPit', 6, 'M'], ['jets', 4], ['conveyor', 22, -1, 'n'], ['saws', 3, 1], ['pool', 26, 1], ['electric', 4], ['box', 'shield'], ['check'],
    ['climb', 12, 'p'], ['trapdoors', 5], ['crushers', 5], ['platPit', 6, 'F'], ['saws', 4], ['electric', 5], ['spikeRun', 4], ['drop', 8], ['goal']] },
  { z: 5, act: 2, seed: 62, plan: [['start'], ['electric', 4], ['saws', 4], ['trapdoors', 5], ['box', 'shield'], ['crushers', 5], ['check'],
    ['pool', 30, 1], ['jets', 5], ['saws', 4, 1], ['platPit', 7, 'M'], ['conveyor', 26, 1, 'n'], ['electric', 5], ['box', 'shield'], ['check'],
    ['climb', 15, 'p'], ['trapdoors', 6], ['crushers', 6], ['platPit', 7, 'F'], ['saws', 5], ['jets', 6], ['electric', 6], ['drop', 10], ['check'], ['run', 12], ['arena', 'blum']] }
];
/* a fourth stretch for every act, spliced in after the second checkpoint: each zone's gimmicks pushed harder,
   so an act is 2 minutes and more and the run gets meaner towards the goal (act 2 gets the meaner list) */
var EXTRA = [
  [[['run', 14, 'n'], ['gaps', 4, 5, 'p'], ['rollers', 3], ['platPit', 5, 'N'], ['box', 'drops'], ['springTower', 'n'], ['valley', 4], ['tunnel', 24, ['m', 'spike', 'n']], ['check']],
   [['rollers', 3], ['gaps', 5, 6, 'n'], ['platPit', 7, 'F'], ['spikeRun', 5], ['box', 'drops'], ['climb', 12, 'p'], ['valley', 5], ['tunnel', 28, ['n', 'spike', 'm', 'spike']], ['gaps', 4, 6, 'm'], ['check']]],
  [[['pool', 24, 1], ['conveyor', 20, 1, 'n'], ['platPit', 5, 'M'], ['box', 'drops'], ['valley', 4], ['pool', 22], ['climb', 9, 'm'], ['check']],
   [['pool', 32, 1], ['conveyor', 26, -1, 'p'], ['platPit', 7, 'N'], ['spikeRun', 4], ['box', 'drops'], ['pool', 30, 1], ['gaps', 5, 6, 'n'], ['conveyor', 22, 1, 'm'], ['check']]],
  [[['dash'], ['valley', 5], ['bumpers'], ['platPit', 5, 'O'], ['box', 'drops'], ['rollers', 3], ['pool', 28, 1], ['bumpers'], ['check']],
   [['bumpers'], ['platPit', 7, 'O'], ['dash'], ['valley', 5], ['spikeRun', 4], ['box', 'drops'], ['pool', 34, 1], ['gaps', 5, 6, 'p'], ['bumpers'], ['platPit', 6, 'F'], ['check']]],
  [[['crumbleBridge', 10], ['run', 12, 'p'], ['platPit', 5, 'N'], ['box', 'drops'], ['tunnel', 26, ['n', 'spike', 'm']], ['crumbleBridge', 12], ['valley', 4], ['gaps', 4, 5, 'm'], ['run', 14, 'n'], ['climb', 9, 'p'], ['check']],
   [['crumbleBridge', 14], ['spikeRun', 5], ['platPit', 7, 'F'], ['box', 'drops'], ['tunnel', 30, ['m', 'spike', 'n', 'spike', 'p']], ['gaps', 5, 6, 'n'], ['crumbleBridge', 16], ['check']]],
  [[['conveyor', 22, 1, 'n'], ['jets', 4], ['crushers', 4], ['box', 'drops'], ['pool', 26, 1], ['platPit', 5, 'N'], ['jets', 4], ['check']],
   [['crushers', 6], ['pool', 34, 1], ['jets', 6], ['box', 'drops'], ['conveyor', 28, -1, 'p'], ['platPit', 7, 'M'], ['crushers', 5], ['gaps', 5, 6, 'm'], ['check']]],
  [[['run', 12, 'm'], ['saws', 4], ['run', 10, 'n'], ['trapdoors', 5], ['electric', 4], ['run', 10, 'p'], ['box', 'drops'], ['platPit', 6, 'N'], ['crushers', 5], ['jets', 5], ['check']],
   [['run', 12, 'n'], ['saws', 5, 1], ['run', 10, 'm'], ['electric', 6], ['trapdoors', 7], ['run', 10, 'p'], ['box', 'drops'], ['pool', 34, 1], ['crushers', 6], ['platPit', 7, 'N'], ['jets', 6], ['saws', 5], ['trapdoors', 6], ['check']]]
];
/* two forks in every act: three routes each (high road, street, low road). One of them hides the act's chalice portal */
var FORKHZ = [['m', 'spike', 'n', 'm'], ['m', 'n', 'spike', 'p'], ['m', 'p', 'spike', 'n'], ['m', 'spike', 'n', 'p'], ['jet', 'm', 'jet', 'n'], ['jet', 'm', 'n', 'jet', 'p']];
ACTS.forEach(function (a, ai) { var hz = FORKHZ[a.z], ins = [];
  a.plan.forEach(function (p, i) { if (p[0] === 'check') ins.push(i + 1); });
  if (ins.length >= 3) { a.plan.splice(ins[2], 0, ['fork', 64, hz.concat(['spike', 'm']), 'shoes', ai % 2 ? 'high' : null]); }
  if (ins.length >= 1) { a.plan.splice(ins[0], 0, ['fork', 56, hz, 'shield', ai % 2 ? null : 'high']); }
  // act 2s hide theirs on the low road of the second fork instead
  if (a.act === 2) a.plan.forEach(function (p) { if (p[0] === 'fork' && p[4] === 'high') p[4] = 'low'; });
});
ACTS.forEach(function (a) { var n = 0, at = -1; a.plan.forEach(function (p, i) { if (p[0] === 'check' && ++n === 2) at = i + 1; }); if (at > 0) Array.prototype.splice.apply(a.plan, [at, 0].concat(EXTRA[a.z][a.act - 1])); });
/* lay an act's tiles: returns the finished level (tile grid, things, size) */
function buildAct(a) {
  var Z = ZONES[a.z], b = Builder(Z, a.seed);
  a.plan.forEach(function (p) { var f = SEC[p[0]]; if (!f) throw new Error('no piece ' + p[0]); f.apply(null, [b].concat(p.slice(1))); });
  // crop to what is used: a little sky above the highest thing, a few rows under the lowest ground
  var lo = b.ROWS, hi = 0; b.top.forEach(function (t) { if (t !== null && t !== undefined) { lo = Math.min(lo, t); hi = Math.max(hi, t); } });
  b.ents.forEach(function (e) { lo = Math.min(lo, e.row); });
  b.cols.forEach(function (col) { for (var y = 0; y < b.ROWS; y++) if (col[y] !== '.' && col[y] !== '#') { lo = Math.min(lo, y); break; } });
  var y0 = Math.max(0, Math.floor(lo) - 14), y1 = Math.min(b.ROWS, hi + 5), H = y1 - y0, W = b.cols.length;
  var t = new Array(W * H);
  for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) t[y * W + x] = b.cols[x][y + y0];
  b.ents.forEach(function (e) { e.x = e.c * TS + TS / 2; e.y = (e.row - y0) * TS; }); // y: the top of that tile row (where a thing standing there has its feet)
  return { w: W, h: H, t: t, ents: b.ents, zone: Z, act: a };
}
