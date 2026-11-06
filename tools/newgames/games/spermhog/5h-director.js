/* =====================================================================================================
   THE DIRECTOR (his ask: no mechanic, trap or obstacle repeats in a level, on any path). Before an act is first laid,
   every set piece is checked against what the act has already used: the street, each of the three lanes and the deep
   share one list. A repeat is swapped for a gimmick the act has not had yet that fits where it is (the lanes have a
   roof over them, so only low ones go there; pits stay off the street lane, which has the low road under it).
   Ground shapes are swapped the same way for an unused shape going the same way (up, down or level).
   The deep gets its own list from what is left, so it never shows what the street had.
   ===================================================================================================== */
var STRUCTP = { run: 1, check: 1, district: 1, cave: 1, start: 1, goal: 1, arena: 1, box: 1, dash: 1, lanes: 1, pocket: 1 };
var TERRP = { ascent: 'u', springShaft: 'u', climb: 'u', pillars: 'u', terraces: 'u', bluff: 'u', rampup: 'u', descent: 'd', plunge: 'd', drop: 'd', slide: 'd', skijump: 'd', chute: 'd', ledgedrop: 'd', bigHill: 'n', ridge: 'n', rollers: 'n', valley: 'n', dunes: 'n', halfpipe: 'n', canyon: 'n', overhang: 'n', stairs: 's' };
var TERRPOOL = { u: [['ascent', 16], ['springShaft', 16], ['pillars'], ['terraces'], ['bluff'], ['rampup'], ['stairs', 3, 'up'], ['climb', 9]],
  d: [['descent', 18], ['plunge', 18], ['slide'], ['skijump'], ['chute'], ['ledgedrop'], ['stairs', 3, 'down']],
  n: [['bigHill', 12], ['ridge'], ['dunes'], ['halfpipe'], ['canyon'], ['overhang'], ['rollers', 3], ['valley', 4]] };
// the act's own pieces that may stand in for a repeat too (h = rows it needs, pit = digs a pit)
var OLDP = [[['swings', 2], 6], [['vents', 2], 3], [['fallers', 3], 5], [['rollers2', 2], 2], [['wires', 2], 3], [['ditch', 4], 1], [['crumbleBridge', 8], 1], [['spikeRun', 2], 5], [['jets', 3], 4],
  [['crushers', 3], 9], [['electric', 3], 1], [['saws', 2], 3], [['saws', 2, 1], 4], [['conveyor', 16, 1], 1], [['platPit', 4, '=', null, 1], 4, 1], [['platPit', 4, 'F', null, 1], 4, 1], [['platPit', 4, 'M', null, 1], 4, 1],
  [['platPit', 4, 'N', null, 1], 6, 1], [['platPit', 4, 'O', null, 1], 6, 1], [['loop'], 15], [['bumpers'], 6, 1], [['springTower', 'm'], 11], [['zipline', 30], 10], [['cart', 44], 2], [['gateway'], 8]];
var PITG = { sinkers: 1, bubbles: 1, beatblocks: 1, swingplats: 1, seesaw: 1 };
function pieceKey(p) { var k = p[0]; if (k === 'platPit') return k + ':' + p[2]; if (k === 'saws') return k + ':' + (p[2] ? 1 : 0); if (k === 'awnings' || k === 'subway') return k + ':' + (p[2] || ''); if (k === 'traffic') return k + ':' + (p[3] || ''); if (k === 'stairs') return k + ':' + (p[2] || 'up'); return k; }
function terrDir(p) { var d = TERRP[p[0]]; return d === 's' ? (p[2] === 'down' ? 'd' : 'u') : d; }
function uniqAct(a) {
  var r = (a.seed || 1) * 48271 + 11; function rnd(n) { r = (r * 16807) % 2147483647; return r % n; }
  function shuf(L) { L = L.slice(); for (var i = L.length - 1; i > 0; i--) { var j = rnd(i + 1), t = L[i]; L[i] = L[j]; L[j] = t; } return L; }
  var used = {}, fill = [], tfill = [];
  function walk(list, ctx) { for (var i = 0; i < list.length; i++) { var p = list[i]; if (p[0] === 'lanes') { var s = p[1]; walk(s.top, 'top'); walk(s.mid, 'mid'); walk(s.low, 'low'); continue; } if (STRUCTP[p[0]]) continue;
      var k = pieceKey(p); if (TERRP[p[0]]) { if (ctx !== 'single') continue; if (used[k]) tfill.push({ list: list, i: i, d: terrDir(p) }); used[k] = 1; continue; }
      if (used[k]) fill.push({ list: list, i: i, ctx: ctx }); used[k] = 1; } }
  walk(a.plan, 'single');
  // the pool of gimmicks: every new one, then the act's own old pieces, shuffled for this act
  var pool = shuf(Object.keys(GIM).filter(function (n) { return SEC[n] && GIM[n].lay; }).map(function (n) { return { p: [n], h: GIM[n].h, pit: !!PITG[n] }; }))
    .concat(shuf(OLDP.map(function (q) { return { p: q[0], h: q[1], pit: !!q[2] }; })));
  function maxH(ctx) { return ctx === 'top' ? 9 : ctx === 'mid' || ctx === 'low' ? 6 : ctx === 'deep' ? 10 : 99; }
  function take(ctx) { var mh = maxH(ctx); for (var i = 0; i < pool.length; i++) { var q = pool[i], k = pieceKey(q.p); if (used[k] || q.h > mh || (q.pit && (ctx === 'mid' || ctx === 'top'))) continue; used[k] = 1; return q.p.slice(); } return null; }
  // the tightest places first (lanes), then the open street
  fill.sort(function (x, y) { return maxH(x.ctx) - maxH(y.ctx); }).forEach(function (f) { var q = take(f.ctx); f.list[f.i] = q || ['run', 8]; });
  tfill.forEach(function (f) { var free = function (L) { return shuf(L).filter(function (q) { return !used[pieceKey(q)]; }); }, opts = free(TERRPOOL[f.d]);
    if (!opts.length) opts = free(TERRPOOL.n.concat(TERRPOOL[f.d === 'u' ? 'd' : 'u'])); /* that way is used up: any shape not seen yet */
    if (opts.length) { used[pieceKey(opts[0])] = 1; f.list[f.i] = opts[0].slice(); } else { var g = take('single'); if (g) f.list[f.i] = g; } });
  // the deep: what is left, in its own order
  var deep = []; for (var n = 0; n < 40; n++) { var q2 = take('deep'); if (!q2) break; deep.push(q2); }
  var tn = shuf(TERRPOOL.n); while (deep.length < 40) deep.push(tn[deep.length % tn.length].slice());
  a.deep = deep; a.gimDone = 1;
}
(function () { var bA = buildAct; buildAct = function (a) { if (!a.gimDone) uniqAct(a); return bA(a); }; })();
