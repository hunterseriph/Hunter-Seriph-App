/* =====================================================================================================
   THE WAY UNDER (his ask: branching paths, another level under each level that joins up now and then, so it feels bigger;
   and breakable walls with hidden gateways). After an act is laid, every long stretch of solid ground with nothing dug
   under it gets a second route carved beneath it: a passage about ten tiles down that follows the ground's rise and fall
   on slopes, with its own drops and foes. You fall in through holes in the street (jump them to stay up top) and come
   back up on springs in shafts; they alternate along it, so the two routes cross over every fifty tiles or so.
   Breakable walls ('X'): run into one fast, shoot it, or hit it as Super, and it bursts. Each way under ends past its last
   spring in a cracked wall with a pocket behind it: a box, or (once an act) a hidden gateway into a special stage.
   ===================================================================================================== */
var UNDER = { minLen: 74, depth: 10, head: 6, step: 52, maxRoutes: 4 };
function underRoutes(b, a) {
  var W = b.cols.length, bad = new Array(W), Z = b.zone, ROWS = b.ROWS;
  function mark(c0, c1) { for (var c = Math.max(0, c0); c < Math.min(W, c1); c++) bad[c] = 1; }
  b.bands.forEach(function (q) { mark(q.c0 - 8, q.c1 + 8); }); b.caves.forEach(function (q) { mark(q.c0 - 6, q.c1 + 6); });
  b.ents.forEach(function (e) { if (e.k === 'arena') mark(e.c0 - 20, W); else if (e.k === 'goal' || e.k === 'start') mark(e.c - 16, e.c + 16); else if (e.k === 'check' || e.k === 'portal' || e.k === 'trap') mark(e.c - 6, e.c + 6); else if (e.k === 'train' || e.k === 'traffic') mark(e.c - 4, e.c + (e.w || 10) + 4); });
  for (var c = 0; c < W; c++) { var t = b.top[c]; if (t === null || t === undefined || b.cols[c].liq || t + UNDER.depth + 14 >= ROWS) { bad[c] = 1; continue; }
    for (var y = t + 1; y < Math.min(ROWS, t + UNDER.depth + 4); y++) if (b.cols[c][y] !== '#') { bad[c] = 1; break; } }
  // the stretches
  var runs = [], s = -1; for (var c2 = 0; c2 <= W; c2++) { if (c2 < W && !bad[c2]) { if (s < 0) s = c2; } else if (s >= 0) { if (c2 - s >= UNDER.minLen) runs.push([s, c2]); s = -1; } }
  if (runs.length > UNDER.maxRoutes) runs = runs.sort(function (p, q) { return (q[1] - q[0]) - (p[1] - p[0]); }).slice(0, UNDER.maxRoutes).sort(function (p, q) { return p[0] - q[0]; });
  var gateDone = false, made = [];
  runs.forEach(function (rn, ri) {
    var c0 = rn[0] + 4, c1 = rn[1] - 4, n = c1 - c0, F = new Array(n), req = new Array(n);
    for (var i = 0; i < n; i++) { var m = 0; for (var j = -6; j <= 6; j++) { var cc = Math.max(rn[0], Math.min(rn[1] - 1, c0 + i + j)); m = Math.max(m, b.top[cc]); } req[i] = m + UNDER.depth; }
    for (var i2 = 0; i2 < n; i2++) F[i2] = i2 ? Math.max(req[i2], F[i2 - 1] - 1) : req[i2]; // the floor never climbs more than a tile a column (a slope)
    for (var i3 = n - 2; i3 >= 0; i3--) F[i3] = Math.max(F[i3], F[i3 + 1] - 1); // nor falls more than one
    if (F.some(function (f) { return f + 3 >= ROWS; })) return;
    // carve: back wall above the floor, the floor (slopes where it changes height)
    for (var k = 0; k < n; k++) { var col = b.cols[c0 + k], f = F[k];
      for (var y2 = f - UNDER.head; y2 < f; y2++) col[y2] = 'k';
      col[f] = k + 1 < n && F[k + 1] > f ? '\\' : k > 0 && F[k - 1] > f ? '/' : '#';
      if (col[f] === '\\') col[f] = '\\'; }
    // the ends of the passage: walls
    // ways in and out: a hole down at the start, then springs up and holes down, turn about, and a spring up at the end
    function shaft(i, spring) { var cA = c0 + i; for (var w = 0; w < 3; w++) { var cc = cA + w, t = b.top[cc]; for (var y3 = t; y3 < F[i + w] - UNDER.head + 1; y3++) b.cols[cc][y3] = 'k'; b.top[cc] = F[i + w] - UNDER.head; }
      b.ents = b.ents.filter(function (e) { return !(e.k !== 'drop' && e.c >= cA - 1 && e.c <= cA + 3 && e.row <= b.top[cA] + 1); }); // nothing left standing over the hole
      if (spring) b.ent('spring', cA + 1, F[i + 1], { pow: 2 }); else { b.ent('drop', cA + 1, b.top[cA] - 2); b.ent('drop', cA + 1, F[i + 1] - 2); } }
    function flatAt(i) { return i > 1 && i + 4 < n && F[i] === F[i + 1] && F[i + 1] === F[i + 2] && F[i] === F[i - 1]; }
    function near(i, want) { for (var d = 0; d < 14; d++) { if (flatAt(i + d)) return i + d; if (flatAt(i - d)) return i - d; } return -1; }
    var spots = [], ii = 4; spots.push([near(4, 0), false]); ii = 4 + UNDER.step; var up = true;
    while (ii < n - 30) { var q = near(ii); if (q > 0) { spots.push([q, up]); up = !up; } ii += UNDER.step; }
    var endS = near(n - 26); if (endS > 0 && (!spots.length || endS - spots[spots.length - 1][0] > 12)) spots.push([endS, true]); else if (spots.length) spots[spots.length - 1][1] = true;
    spots.forEach(function (sp) { if (sp[0] > 0 && F[sp[0]] - b.top[c0 + sp[0]] <= 15) shaft(sp[0], sp[1]); });
    // what is down there: drops along the floor, the zone's walkers, a box
    var walkers = ['m', 'n', 'p'];
    for (var d = 10; d < n - 30; d += 14) { if (!flatAt(d)) continue; for (var dd = 0; dd < 5; dd++) b.ent('drop', c0 + d + dd, F[d] - 2); }
    for (var fz = 24; fz < n - 34; fz += 31) { if (!flatAt(fz)) continue; b.ent('foe', c0 + fz, F[fz], { f: walkers[(fz + ri) % 3] }); }
    // the cracked wall at the far end, and the pocket behind it (the passage's last 18 columns)
    var wc = n - 16, fw = 0; for (var xq = wc; xq < n; xq++) fw = Math.max(fw, F[xq]); // the pocket's floor: as deep as the deepest bit, so its roof stays under the street
    if (wc > 30 && fw - F[wc - 1] <= 3) {
      for (var x = wc; x < n; x++) { F[x] = fw; var cl = b.cols[c0 + x]; for (var y4 = fw - UNDER.head; y4 < fw; y4++) cl[y4] = 'k'; cl[fw] = '#'; for (var y5 = fw + 1; y5 < fw + 3; y5++) cl[y5] = '#'; }
      for (var x2 = wc; x2 < wc + 2; x2++) for (var y6 = fw - UNDER.head; y6 < fw; y6++) b.cols[c0 + x2][y6] = 'X';
      if (!gateDone && (ri === 1 || runs.length === 1 || ri === runs.length - 1)) { gateDone = true; b.ent('portal', c0 + wc + 9, fw - 1, { hidden: 1 }); } // the hidden gateway
      else { b.ent('box', c0 + wc + 8, fw, { item: ['shield', 'drops', 'shoes', 'life'][(ri + a.z) % 4] }); for (var dr = 0; dr < 4; dr++) b.ent('drop', c0 + wc + 5 + dr, fw - 3); } }
    made.push({ c0: c0, c1: c1 });
  });
  b.unders = made;
}
/* ---------- breaking the walls ---------- */
function isBreak(ch) { return ch === 'X'; }
function breakWall(cx, cy) { // the whole cracked block goes, with rubble
  var todo = [[cx, cy]], seen = {}, n = 0;
  while (todo.length && n < 60) { var q = todo.pop(), k = q[0] + ',' + q[1]; if (seen[k]) continue; seen[k] = 1; if (T(q[0], q[1]) !== 'X') continue;
    LV.t[q[1] * LV.w + q[0]] = 'k'; n++; for (var i = 0; i < 4; i++) FX.push({ k: 'bit', x: q[0] * TS + 8, y: q[1] * TS + 8, vx: (Math.random() - 0.5) * 300, vy: -100 - Math.random() * 200, t: 0.6, c: i % 2 ? LV.zone.pal[0] : LV.zone.pal[1] });
    todo.push([q[0] + 1, q[1]], [q[0] - 1, q[1]], [q[0], q[1] + 1], [q[0], q[1] - 1]); }
  if (n) { sfx.play('crumble'); sfx.play('thud'); G.shake = 4; G.score += 50; KIT.dropLayer && 0; }
  return n;
}
function wallCheck(dt) { // before the player moves: running into a cracked wall fast (or as Super, or attacking) breaks it
  var p = PL; if (!p || p.state !== 'normal' || G.mode !== 'play') return;
  var v = p.air ? p.vx : p.gsp, fast = Math.abs(v) >= 200 || (p.air && Math.abs(v) >= 110) || G.super || p.atkT > 0; if (!fast) return;
  var dir = v === 0 ? p.face : Math.sign(v), ax = p.x + dir * (12 + Math.abs(v) * dt * 2);
  for (var h = 4; h < 44; h += 10) { var cx = Math.floor(ax / TS), cy = Math.floor((p.y - h) / TS); if (isBreak(T(cx, cy))) { breakWall(cx, cy); return; } }
}
function shotWalls() { SHOTS.forEach(function (s) { if (!s.mine || s.life <= 0) return; var cx = Math.floor((s.x + s.vx / 30) / TS), cy = Math.floor(s.y / TS); if (isBreak(T(cx, cy))) { breakWall(cx, cy); s.life = 0; } }); }
(function () {
  var sP = stepPlayer; stepPlayer = function (dt) { wallCheck(dt); sP(dt); };
  var sW = stepWorld; stepWorld = function (dt) { shotWalls(); sW(dt); };
})();
