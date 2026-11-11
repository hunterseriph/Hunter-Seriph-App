/* ---------- the world: solid boxes (stand on top, sides are walls, each with its own textures), ramps, water, lava,
   and everything in it. Scenery is built into the level mesh by `deco` painters (L.deco); shop fronts and posters
   use the sprite sheet (L.sq). Hubs are laid by hand; stages are laid piece by piece and dressed per theme. ---------- */
var LV = null;
function newLevel(theme) { return { boxes: [], ramps: [], water: [], lava: [], drops: [], foes: [], springs: [], pads: [], loops: [], items: [], ibox: [], checks: [], targets: [], npcs: [], portals: [], deco: [], sq: [], lights: [], flames: [], spin: [], theme: theme, start: { x: 0, y: 0, z: 0, a: 0 } }; }
function bx(L, x0, y0, z0, x1, y1, z1, o) { var b = { x0: Math.min(x0, x1), y0: y0, z0: Math.min(z0, z1), x1: Math.max(x0, x1), y1: y1, z1: Math.max(z0, z1) }; if (o) for (var k in o) b[k] = o[k]; L.boxes.push(b); return b; }
function rp(L, x0, z0, x1, z1, ya, yb, ax, o) { var r = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), ya: ya, yb: yb, ax: ax || 'z' }; if (o) for (var k in o) r[k] = o[k]; L.ramps.push(r); return r; }
function dropLine(L, x, y, z, dx, dz, n, dy) { for (var i = 0; i < n; i++) L.drops.push({ x: x + dx * i, y: y + 1 + (dy || 0) * i, z: z + dz * i }); }
function dropRing(L, x, y, z, r, n) { for (var i = 0; i < n; i++) { var a = i / n * 6.283; L.drops.push({ x: x + Math.cos(a) * r, y: y + 1, z: z + Math.sin(a) * r }); } }
function front(L, s, x, y, z, w, face) { L.sq.push({ s: s, x: x, y: y, z: z, w: w, face: face }); } // a sprite stood on a wall facing `face` [dx, dz]
/* ---------- the stages ---------- */
function buildStage(id, who) {
  var S = STAGES[id], L = newLevel(S.theme), rnd = srand(9000 + id.length * 131 + id.charCodeAt(0) * 7 + id.charCodeAt(1)), kind = S.kind, th = S.theme; L.id = id;
  function ri(a) { return Math.floor(rnd() * a); }
  var job = who === 'greebo' ? 'hunt' : who === 'spermaid' ? 'water' : who === 'lab' ? 'shoot' : kind === 'hunt' || kind === 'water' ? 'speed' : kind; L.job = job;
  var x = 0, y = 0, z = 0, wid = job === 'shoot' ? 13 : 9, pieces = Math.round(S.len / (job === 'speed' ? 4 : 5)), nfoe = 0;
  function foe(k, fx, fy, fz) { L.foes.push(mkFoe(k || S.foes[ri(S.foes.length)], fx, fy, fz)); nfoe++; }
  function floor(x0, z0, x1, z1, yy) { var b = bx(L, x0, yy - (th === 'city' || th === 'ship' ? 30 : 6), z0, x1, yy, z1, { path: 1 }); dress(L, b, rnd); return b; }
  floor(-8, -8, 8, 8, 0); L.start = { x: 0, y: 0, z: -3, a: 0 }; z = 8;
  if (job === 'hunt') { // a big dressed place with towers, ledges and three ingredients to find
    var R = 34; floor(-R, 8, R, 8 + R * 2, 0); for (var t = 0; t < 14; t++) { var tx = (rnd() - 0.5) * R * 1.6, tz = 14 + rnd() * R * 1.8, tw = 3 + rnd() * 4, thh = 3 + rnd() * 9; var tb = bx(L, tx - tw / 2, 0, tz - tw / 2, tx + tw / 2, thh, tz + tw / 2, { climb: 1 }); dress(L, tb, rnd, 1); if (rnd() < 0.5) bx(L, tx + tw / 2, thh - 0.5, tz - 1.5, tx + tw / 2 + 5, thh, tz + 1.5); if (rnd() < 0.5) dropLine(L, tx, thh, tz - 1, 0, 1, 3); }
    [0, 1, 3].forEach(function (w) { bx(L, [-R - 2, R, -R, -R][w], 0, [8, 8, 6, 8 + R * 2][w], [-R, R + 2, R, R][w], 7, [8 + R * 2, 8 + R * 2, 8, 8 + R * 2 + 2][w], { climb: 1, wall: 1 }); });
    var spots = L.boxes.filter(function (b) { return b.y1 > 2 && b.y1 < 6.5; }); for (var k = 0; k < 3; k++) { var b = spots[(k * 5 + 3) % spots.length]; L.items.push({ k: 'ingr', n: k, x: (b.x0 + b.x1) / 2, y: b.y1 + 0.8, z: (b.z0 + b.z1) / 2 }); }
    for (var r2 = 0; r2 < 50; r2++) L.drops.push({ x: (rnd() - 0.5) * R * 1.7, y: 1, z: 12 + rnd() * R * 1.8 }); for (var f = 0; f < 12; f++) foe(null, (rnd() - 0.5) * R * 1.5, 0, 16 + rnd() * R * 1.7);
    for (var ib = 0; ib < 4; ib++) L.ibox.push({ x: (rnd() - 0.5) * R, y: 0, z: 20 + rnd() * R * 1.5 });
    L.goal = null; return L; }
  for (var p = 0; p < pieces; p++) { var r = rnd(), len = 12 + ri(10);
    if (p > 0 && p % 5 === 0) L.checks.push({ x: x + wid / 2 - 1, y: y, z: z + 1 });
    if (job === 'water' && p % 2 === 1) { // a pool: the floor drops away and the water fills it
      var deep = 7; floor(x - wid / 2 - 4, z, x + wid / 2 + 4, z + len + 6, y - deep); bx(L, x - wid / 2 - 5, y - deep, z, x - wid / 2 - 4, y + 0.5, z + len + 6); bx(L, x + wid / 2 + 4, y - deep, z, x + wid / 2 + 5, y + 0.5, z + len + 6);
      L.water.push({ x0: x - wid / 2 - 4, y0: y - deep, z0: z, x1: x + wid / 2 + 4, y1: y - 0.4, z1: z + len + 6 }); dropLine(L, x, y - 4, z + 2, 0, 1.6, 9); foe('jelly', x + 2, y - 3, z + len / 2); if (th === 'reef' || th === 'sewer') L.deco.push(kelpPatch(x, y - deep, z + 3, len, rnd())); z += len + 6; continue; }
    if (r < 0.22) { floor(x - wid / 2, z, x + wid / 2, z + len, y); dropLine(L, x, y, z + 2, 0, 1.5, Math.min(9, len / 1.5)); if (job !== 'shoot' && rnd() < 0.6) L.pads.push({ x: x, y: y, z: z + 1, dx: 0, dz: 1 }); for (var e = 0; e < 1 + ri(2); e++) foe(null, x + (rnd() - 0.5) * wid * 0.6, y, z + 4 + rnd() * (len - 6)); if (rnd() < 0.4) L.ibox.push({ x: x - wid / 2 + 1.2, y: y, z: z + len / 2 }); z += len; }
    else if (r < 0.4) { var dy = (rnd() < 0.5 ? -1 : 1) * (2 + ri(4)); rp(L, x - wid / 2, z, x + wid / 2, z + len, y, y + dy, 'z', { path: 1 }); bx(L, x - wid / 2, Math.min(y, y + dy) - 6, z, x + wid / 2, Math.min(y, y + dy), z + len, { under: 1 }); dropLine(L, x, y, z + 2, 0, 1.6, 6, dy / 7); z += len; y += dy; }
    else if (r < 0.52) { var side = rnd() < 0.5 ? -1 : 1; floor(x - wid / 2, z, x + wid / 2, z + wid, y); var nx = x + side * (len + 4); floor(Math.min(x, nx) - wid / 2, z, Math.max(x, nx) + wid / 2, z + wid, y); dropLine(L, x + side * 2, y, z + wid / 2, side * 1.6, 0, 7); x = nx; z += wid; }
    else if (r < 0.64 && job === 'speed') { // a loop: run into it fast and it carries you round
      floor(x - wid / 2, z, x + wid / 2, z + 16, y); L.pads.push({ x: x, y: y, z: z + 1, dx: 0, dz: 1 }); L.loops.push({ x: x, y: y, z: z + 10, r: 4.5 }); dropRing(L, x, y + 4.5, z + 10, 3.4, 10); z += 16; }
    else if (r < 0.76) { // a spring up to a high road, or a gap you jump
      if (rnd() < 0.5) { floor(x - wid / 2, z, x + wid / 2, z + 4, y); L.springs.push({ x: x, y: y, z: z + 2, vy: 16, vz: 6 }); var hy = y + 6; var hb = bx(L, x - wid / 2, hy - 1, z + 8, x + wid / 2, hy, z + 8 + len, { path: 1 }); dress(L, hb, rnd, 2); dropLine(L, x, hy, z + 9, 0, 1.5, 7); floor(x - wid / 2, z + 4, x + wid / 2, z + 8 + len, y); z += 8 + len; }
      else { var gap = 4 + ri(3); floor(x - wid / 2, z, x + wid / 2, z + 4, y); z += 4 + gap; floor(x - wid / 2, z, x + wid / 2, z + 6, y); dropLine(L, x, y + 2, z - gap + 1, 0, 1.2, gap); if (th === 'volcano') L.lava.push({ x0: x - wid, z0: z - gap - 2, x1: x + wid, z1: z + 2, y: y - 5 }); z += 6; } }
    else if (r < 0.86 && job !== 'water') { // a narrow beam over a drop, foes on it
      var nw = 3.2; floor(x - nw / 2, z, x + nw / 2, z + len, y); dropLine(L, x, y, z + 2, 0, 1.6, 7); if (rnd() < 0.5) foe(null, x, y, z + len / 2); z += len; }
    else { // stepping platforms
      for (var st = 0; st < 3; st++) { floor(x - 2.5 + (st % 2 ? 2 : -2), z + st * 6, x + 2.5 + (st % 2 ? 2 : -2), z + st * 6 + 4, y + st); L.drops.push({ x: x + (st % 2 ? 2 : -2), y: y + st + 1, z: z + st * 6 + 2 }); } y += 2; floor(x - wid / 2, z + 18, x + wid / 2, z + 22, y); z += 22; }
  }
  if (job === 'shoot') { L.targets = L.foes; floor(x - 12, z, x + 12, z + 24, y); L.mini = { x: x, y: y, z: z + 16, at: z + 2 }; z += 24; }
  floor(x - wid / 2, z, x + wid / 2, z + 12, y); L.goal = { x: x, y: y, z: z + 8 };
  sky(L, th); return L;
}
/* ---------- dressing: what stands round each piece, per theme ---------- */
function dress(L, b, rnd, small) {
  var th = L.theme, cx = (b.x0 + b.x1) / 2, w = b.x1 - b.x0, d = b.z1 - b.z0, y = b.y1, n = Math.max(1, Math.floor(d / 6));
  L.deco.push(function (m) { edge(m, b, THEMES[th].edge); });
  if (small) return;
  for (var i = 0; i < n; i++) { var z = b.z0 + (i + 0.5) * d / n, r1 = rnd(), r2 = rnd(), sd = r1 < 0.5 ? -1 : 1, ex = sd < 0 ? b.x0 : b.x1;
    if (th === 'city') { // rooftops: towers beside you with lit windows, water tanks, chimneys, aerials, neon
      if (i % 2 === 0) { var tx = ex + sd * (6 + r2 * 10), th2 = y + 4 + r2 * 18; L.deco.push(towerD(tx, y - 30, z, 3 + r2 * 2, th2)); if (r2 < 0.4) L.deco.push(neonD(tx - sd * (3 + r2 * 2) - sd * 0.05, th2 - 2, z, sd, ['n_xxx', 'n_live', 'n_cum', 'n_open', 'n_girls'][Math.floor(r1 * 10) % 5])); }
      if (r2 < 0.3 && w > 4) L.deco.push(tankD(ex - sd * 1.2, y, z)); else if (r2 < 0.6 && w > 4) { var cb = bx(L, ex - sd * 1.2 - 0.4, y, z - 0.4, ex - sd * 1.2 + 0.4, y + 1.6, z + 0.4, { hide: 1 }); L.deco.push(chimD(cb)); } else if (r2 < 0.75) L.lights.push({ x: ex - sd * 0.6, y: y + 2.4, z: z, c: [1, 0.75, 0.45], r: 8 }); }
    else if (th === 'sewer') { L.deco.push(pipeD(ex + sd * 0.6, y, z, d / n, sd)); if (r2 < 0.4) L.deco.push(fallD(ex + sd * 1.6, y, z)); if (r2 > 0.7) L.flames.push({ x: ex + sd * 0.3, y: y + 1.6, z: z, lamp: 1 }); }
    else if (th === 'park') { L.deco.push(railsD(b)); if (i % 2 === 0) L.deco.push(supportD(cx, y, z, w)); if (r2 < 0.35) L.deco.push(tentD(ex + sd * (6 + r1 * 6), y - 6, z, r2)); else if (r2 < 0.6) L.deco.push(balloonD(ex + sd * (3 + r1 * 5), y, z, r1)); if (r1 > 0.8) L.lights.push({ x: ex + sd * 0.5, y: y + 2, z: z, c: [1, 0.6, 0.8], r: 7 }); }
    else if (th === 'funhouse') { if (r2 < 0.5) L.deco.push(toyD(ex - sd * 1.5, y, z, r1)); }
    else if (th === 'isles') { if (r2 < 0.5) L.deco.push(palmD(ex + sd * (1 + r1 * 3), y, z, r1)); else if (r2 < 0.7) L.deco.push(rockD(ex + sd * 2, y - 1, z, 0.8 + r1)); else if (r2 < 0.85) L.deco.push(brollyD(ex - sd * 1.5, y, z, r1)); }
    else if (th === 'reef') { L.deco.push(coralD(ex + sd * (1 + r1 * 2), y, z, r1)); if (r2 < 0.5) L.deco.push(kelpPatch(ex + sd * 2.5, y, z, 2, r2)); }
    else if (th === 'volcano') { if (r2 < 0.5) L.deco.push(spireD(ex + sd * (3 + r1 * 4), y - 6, z, 3 + r1 * 8)); if (r1 < 0.3) L.flames.push({ x: ex + sd * 0.4, y: y + 0.2, z: z, vent: 1 }); }
    else if (th === 'ship') { if (r2 < 0.4) L.deco.push(crateD(ex - sd * 1.1, y, z, r1)); else if (r2 < 0.65) L.deco.push(cannonD(ex - sd * 0.8, y, z, sd)); else L.deco.push(postD(ex - sd * 0.1, y, z, sd)); if (r1 > 0.6) L.lights.push({ x: ex, y: y + 2.5, z: z, c: [1, 0.3, 0.3], r: 7 }); }
  }
  if (th === 'volcano') L.lava.push({ x0: b.x0 - 30, z0: b.z0 - 2, x1: b.x1 + 30, z1: b.z1 + 2, y: y - 6 });
  if (th === 'isles' || th === 'reef') L.sea = th === 'isles' ? y - 1.2 : null;
}
function edge(m, b, col) { var y = b.y1 + 0.01; [[b.x0, b.z0, b.x0 + 0.25, b.z1], [b.x1 - 0.25, b.z0, b.x1, b.z1]].forEach(function (q) { m.quad([q[0], y, q[3]], [q[2], y, q[3]], [q[2], y, q[1]], [q[0], y, q[1]], [0, 0, 1, 0, 1, 1, 0, 1], TL('white'), C(col), [0, 1, 0]); }); }
function towerD(x, y0, z, w, y1) { return function (m) { bxp(m, x - w, y0, z - w, x + w, y1, z + w, '#2a1418', TL('windows')); bxp(m, x - w - 0.2, y1, z - w - 0.2, x + w + 0.2, y1 + 0.4, z + w + 0.2, '#14080a'); }; }
function neonD(x, y, z, sd, t) { return function (m) { m.quad([x, y - 0.8, z + 1.6 * sd], [x, y - 0.8, z - 1.6 * sd], [x, y + 0.8, z - 1.6 * sd], [x, y + 0.8, z + 1.6 * sd], [0, 1, 1, 1, 1, 0, 0, 0], TL(t), [0.5, 0.5, 0.5], [-sd, 0, 0], 1); }; }
function tankD(x, y, z) { return function (m) { [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(function (o) { tub(m, [x + o[0], y, z + o[1]], [x + o[0], y + 1.5, z + o[1]], 0.06, 0.06, '#3a2a24', 5); }); tub(m, [x, y + 1.5, z], [x, y + 3.2, z], 0.9, 0.9, '#6a4a2a', 12, { T: TL('wood'), cap: 1 }); ell(m, x, y + 3.2, z, 0.95, 0.4, 0.95, '#4a3424', 10, 4, { b1: 1.6 }); }; }
function chimD(b) { return function (m) { bxp(m, b.x0, b.y0, b.z0, b.x1, b.y1, b.z1, '#5a2a24', TL('brick')); }; }
function pipeD(x, y, z, len, sd) { return function (m) { tub(m, [x, y + 0.5, z - len / 2], [x, y + 0.5, z + len / 2], 0.35, 0.35, '#5a5a4a', 10, { T: TL('rust') }); tub(m, [x, y + 2.2, z - len / 2], [x, y + 2.2, z + len / 2], 0.2, 0.2, '#6a4a2a', 8, { T: TL('rust') }); bxp(m, x + sd * 0.4, y - 6, z - len / 2, x + sd * 1.2, y + 5, z + len / 2, '#3e3426', TL('wetbrick')); }; }
function fallD(x, y, z) { return function (m) { m.quad([x, y - 6, z - 0.8], [x, y - 6, z + 0.8], [x, y + 4.5, z + 0.8], [x, y + 4.5, z - 0.8], [0, 3, 1, 3, 1, 0, 0, 0], TL('water'), C('#f1e0b0'), [-1, 0, 0], 0.3); }; }
function railsD(b) { return function (m) { var y = b.y1 + 0.12; [-1.2, 1.2].forEach(function (o) { tub(m, [(b.x0 + b.x1) / 2 + o, y, b.z0], [(b.x0 + b.x1) / 2 + o, y, b.z1], 0.1, 0.1, '#c8c8d0', 6); }); for (var z = b.z0 + 0.5; z < b.z1; z += 1.2) bxp(m, (b.x0 + b.x1) / 2 - 1.5, b.y1, z - 0.15, (b.x0 + b.x1) / 2 + 1.5, b.y1 + 0.08, z + 0.15, '#5a3a24', TL('wood')); }; }
function supportD(x, y, z, w) { return function (m) { [-w / 2 + 0.4, w / 2 - 0.4].forEach(function (o) { tub(m, [x + o, y - 6, z], [x + o, y - 18, z], 0.3, 0.3, '#ffe36a', 8); }); tub(m, [x - w / 2 + 0.4, y - 8, z], [x + w / 2 - 0.4, y - 13, z], 0.15, 0.15, '#c4121c', 6); }; }
function tentD(x, y, z, r) { return function (m) { var R = 3 + r * 2; tub(m, [x, y, z], [x, y + 4, z], R, R, '#ff7ab8', 12, { T: TL('stripes') }); tub(m, [x, y + 4, z], [x, y + 7.5, z], R + 0.4, 0.1, '#ffe36a', 12, { T: TL('stripes') }); tub(m, [x, y + 7.5, z], [x, y + 8.8, z], 0.05, 0.05, '#2a2a2a', 4); m.quad([x, y + 8.8, z], [x + 1.2, y + 8.5, z], [x + 1.2, y + 8.1, z], [x, y + 8.3, z], [0, 0, 1, 0, 1, 1, 0, 1], TL('white'), C('#c4121c'), [0, 0, 1]); }; }
function balloonD(x, y, z, r) { return function (m) { var by = y + 3 + r * 3; ell(m, x, by, z, 0.6, 0.75, 0.6, ['#c4121c', '#ffe36a', '#4adfff', '#ff7ab8'][Math.floor(r * 4)], 8, 6); tub(m, [x, by - 0.75, z], [x, y, z], 0.015, 0.015, '#f1e7d0', 3); }; }
function toyD(x, y, z, r) { return function (m) { if (r < 0.33) { ell(m, x, y + 1.2, z, 1.2, 1.2, 1.2, '#c4121c', 12, 8); tub(m, [x - 1.2, y + 1.2, z], [x + 1.2, y + 1.2, z], 1.22, 1.22, '#ffe36a', 12); } else if (r < 0.66) { bxp(m, x - 1, y, z - 1, x + 1, y + 2, z + 1, '#4adfff', TL('polka')); } else { tub(m, [x, y, z], [x, y + 3, z], 0.5, 0.2, '#ff7ab8', 10); ell(m, x, y + 3.4, z, 0.6, 0.6, 0.6, '#f1e0b0', 10, 6, { face: 'f_steve' }); } }; }
function palmD(x, y, z, r) { return function (m) { var h = 4 + r * 3, lean = 0.6 + r; tub(m, [x, y, z], [x + lean * 0.5, y + h * 0.5, z], 0.28, 0.22, '#8a6a3a', 6, { T: TL('bark') }); tub(m, [x + lean * 0.5, y + h * 0.5, z], [x + lean, y + h, z], 0.22, 0.16, '#8a6a3a', 6, { T: TL('bark') }); for (var l = 0; l < 7; l++) { var a = l / 7 * 6.283; tub(m, [x + lean, y + h, z], [x + lean + Math.cos(a) * 2.6, y + h - 0.9, z + Math.sin(a) * 2.6], 0.35, 0.04, '#3a8a2a', 4); } ell(m, x + lean, y + h - 0.2, z, 0.2, 0.2, 0.2, '#5a3a1a', 6, 3); }; }
function rockD(x, y, z, s) { return function (m) { ell(m, x, y + s * 0.5, z, s * 1.4, s, s * 1.1, '#7a7a74', 8, 5); ell(m, x + s * 0.8, y + s * 0.3, z + s * 0.4, s * 0.8, s * 0.6, s * 0.7, '#6a6a64', 7, 4); }; }
function brollyD(x, y, z, r) { return function (m) { tub(m, [x, y, z], [x, y + 2.2, z], 0.04, 0.04, '#f1e7d0', 4); tub(m, [x, y + 2.2, z], [x, y + 2.7, z], 1.4, 0.05, ['#c4121c', '#ffe36a', '#4adfff'][Math.floor(r * 3)], 10, { T: TL('stripes') }); bxp(m, x - 0.6, y, z + 0.8, x + 0.6, y + 0.1, z + 2.4, '#f1e7d0', TL('stripes')); }; }
function coralD(x, y, z, r) { return function (m) { for (var k = 0; k < 4; k++) { var a = k * 1.6 + r * 6, h = 1 + r * 2; tub(m, [x, y, z], [x + Math.cos(a) * 0.6, y + h, z + Math.sin(a) * 0.6], 0.25, 0.08, ['#ff7ab8', '#ff9a5a', '#c86aff'][k % 3], 6); ell(m, x + Math.cos(a) * 0.6, y + h, z + Math.sin(a) * 0.6, 0.15, 0.15, 0.15, '#ffb0d0', 5, 3); } }; }
function kelpPatch(x, y, z, len, r) { return function (m) { for (var k = 0; k < 5; k++) { var kx = x + (k - 2) * 0.7, kz = z + (k * 0.37 % 1) * len, h = 3 + ((k * 7 + r * 10) % 4); for (var s = 0; s < 4; s++) tub(m, [kx + Math.sin(s) * 0.3, y + s * h / 4, kz], [kx + Math.sin(s + 1) * 0.3, y + (s + 1) * h / 4, kz], 0.12, 0.1, '#3a8a3a', 5); } }; }
function spireD(x, y, z, h) { return function (m) { tub(m, [x, y, z], [x, y + h, z], 1.4, 0.2, '#3a2a24', 8, { T: TL('rockt') }); }; }
function crateD(x, y, z, r) { return function (m) { bxp(m, x - 0.5, y, z - 0.5, x + 0.5, y + 1, z + 0.5, '#8a6a3a', TL('crate')); if (r < 0.5) bxp(m, x - 0.35, y + 1, z - 0.35, x + 0.35, y + 1.7, z + 0.35, '#8a6a3a', TL('crate')); }; }
function cannonD(x, y, z, sd) { return function (m) { tub(m, [x, y + 0.6, z], [x - sd * 1.6, y + 1.0, z], 0.32, 0.26, '#2a2a30', 10); ell(m, x, y + 0.5, z, 0.45, 0.45, 0.45, '#3a3a40', 8, 5); }; }
function postD(x, y, z, sd) { return function (m) { tub(m, [x, y, z], [x, y + 1.2, z], 0.08, 0.08, '#c4121c', 6); tub(m, [x, y + 1.1, z - 1.5], [x, y + 1.1, z + 1.5], 0.04, 0.04, '#ffe36a', 4); }; }
function sky(L, th) { L.skyT = th; }
/* ---------- boss arenas: a round floor dressed for where the boss lives ---------- */
function buildArena(boss) { var th = { beast: 'city', execu: 'city', pig: 'park', golem: 'funhouse', kraken: 'reef', hotload: 'volcano', mega: 'ship', tb: 'ship', supertb: 'city' }[boss] || 'city', L = newLevel(th), rnd = srand(77 + boss.length);
  var f = bx(L, -18, -6, -18, 18, 0, 18, { path: 1 }); for (var w = 0; w < 4; w++) bx(L, [-20, 18, -18, -18][w], 0, [-18, -18, -20, 18][w], [-18, 20, 18, 18][w], 1.2, [18, 18, -18, 20][w], { wall: 1 });
  for (var k = 0; k < 8; k++) { var a = (k + 0.5) / 8 * 6.283; L.flames.push({ x: Math.cos(a) * 17, y: 2.6, z: Math.sin(a) * 17, lamp: 1 }); L.deco.push((function (a) { return function (m) { tub(m, [Math.cos(a) * 17, 0, Math.sin(a) * 17], [Math.cos(a) * 17, 2.4, Math.sin(a) * 17], 0.25, 0.3, '#2a1418', 8); }; })(a)); }
  L.deco.push(function (m) { edge(m, f, THEMES[th].edge); }); if (th === 'volcano') L.lava.push({ x0: -60, z0: -60, x1: 60, z1: 60, y: -5 }); if (th === 'reef' || th === 'isles') L.sea = -1.2;
  for (var t = 0; t < 10; t++) { var a2 = t / 10 * 6.283 + 0.3; if (th === 'city' || th === 'ship') L.deco.push(towerD(Math.cos(a2) * 34, -30, Math.sin(a2) * 34, 4, 10 + rnd() * 20)); else if (th === 'park') L.deco.push(tentD(Math.cos(a2) * 30, -4, Math.sin(a2) * 30, rnd())); else if (th === 'volcano') L.deco.push(spireD(Math.cos(a2) * 28, -5, Math.sin(a2) * 28, 6 + rnd() * 12)); else L.deco.push(rockD(Math.cos(a2) * 26, -1, Math.sin(a2) * 26, 1.5 + rnd() * 2)); }
  L.start = { x: 0, y: 0, z: -12, a: 0 }; L.boss = boss; dropRing(L, 0, 0, 0, 11, 16); sky(L, th); return L; }
/* ---------- the hubs: places to walk round, with the ways into the stages out in the world ---------- */
function portal(L, k, x, y, z, n, o) { var p = { k: k, x: x, y: y, z: z, n: n }; if (o) for (var q in o) p[q] = o[q]; L.portals.push(p); return p; }
function npc(L, rig, x, z, a, name, say) { L.npcs.push({ rig: rig, x: x, y: 0, z: z, a: a, name: name, say: say }); }
function building(L, x0, z0, x1, z1, h, fac, faceDir) { var b = bx(L, x0, 0, z0, x1, h, z1, { hide: 1 }); L.deco.push(function (m) { bxp(m, x0, 0, z0, x1, h, z1, '#2a1418', TL('citywall')); bxp(m, x0 - 0.2, h, z0 - 0.2, x1 + 0.2, h + 0.4, z1 + 0.2, '#14080a'); bxp(m, x0 + 0.5, h + 0.4, z0 + 0.5, x0 + 1.5, h + 1.6, z0 + 1.5, '#3a1a1e', TL('brick')); });
  if (fac) { var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, fx = faceDir[0] ? (faceDir[0] > 0 ? x1 : x0) + faceDir[0] * 0.03 : cx, fz = faceDir[1] ? (faceDir[1] > 0 ? z1 : z0) + faceDir[1] * 0.03 : cz; front(L, fac, fx, 0, fz, Math.min(faceDir[0] ? z1 - z0 : x1 - x0, 7) - 0.4, faceDir); } return b; }
function buildHub(h) {
  var L = newLevel(h === 'isles' ? 'isles' : h === 'park' ? 'park' : h === 'garden' ? 'garden' : 'city'), rnd = srand(4040 + h.length); L.hub = h;
  if (h === 'city') { // Clubhouse Row: a long street of shop fronts, a plaza with the cream fountain, the tram stop to Ejaculand, the pier to the Isles
    bx(L, -40, -2, -48, 40, 0, 48, { tex: 'pave' }); L.deco.push(function (m) { for (var z = -46; z < 46; z += 4) bxp(m, -0.15, 0.01, z, 0.15, 0.03, z + 2, '#ffe36a'); [-7, 7].forEach(function (x) { bxp(m, x - 0.15, 0, -48, x + 0.15, 0.2, 48, '#5a4a4e', TL('stonef')); }); });
    var fr = ['fac_cafe', 'fac_amy', 'fac_tb', 'fac_saba', 'fac_greebo', 'fac_pulsar', 'fac_arcade', 'fac_club', 'fac_joff', 'fac_beebs', 'fac_t', 'fac_bonjo'];
    for (var i = 0; i < 6; i++) { var z0 = -44 + i * 15 + (i >= 3 ? 6 : 0); if (z0 > -8 && z0 < 6) continue; building(L, -22, z0, -10, z0 + 9, 9 + (i % 3) * 3, fr[i], [1, 0]); building(L, 10, z0, 22, z0 + 9, 8 + ((i + 1) % 3) * 4, fr[6 + i], [-1, 0]); }
    // the plaza and its fountain of cream
    var fb = bx(L, -2.2, 0, -2.2, 2.2, 0.9, 2.2, { hide: 1 }); L.deco.push(function (m) { tub(m, [0, 0, 0], [0, 0.9, 0], 3.1, 3.1, '#5a4a52', 16, { T: TL('stonewall') }); m.quad([-2.8, 0.85, 2.8], [2.8, 0.85, 2.8], [2.8, 0.85, -2.8], [-2.8, 0.85, -2.8], [0, 0, 2, 0, 2, 2, 0, 2], TL('water'), C('#f1e0b0'), [0, 1, 0], 0.2); tub(m, [0, 0.9, 0], [0, 2.6, 0], 0.4, 0.3, '#5a4a52', 10, { T: TL('stonewall') }); ell(m, 0, 2.9, 0, 0.6, 0.6, 0.6, '#f0c070', 10, 7, { face: 'f_cum', tip: 0.4 }); }); L.fountain = { x: 0, y: 3.3, z: 0 };
    // the fire escape up to the rooftops (Rooftop Run), the manhole (the Cream Sewers), the Clubhouse door (the Garden)
    for (var s = 0; s < 6; s++) { bx(L, -9.8, s * 1.1, -26 + s * 1.6, -7.2, s * 1.1 + 0.2, -24.4 + s * 1.6, { tex: 'steel' }); } bx(L, -9.8, 6.4, -16, -7.2, 6.6, -12, { tex: 'steel' }); portal(L, 'stage', -8.5, 6.6, -14, STAGES.rooftop.n, { id: 'rooftop' });
    L.deco.push(function (m) { for (var s2 = 0; s2 < 6; s2++) tub(m, [-7.3, s2 * 1.1, -25.2 + s2 * 1.6], [-7.3, s2 * 1.1 + 1.0, -25.2 + s2 * 1.6], 0.04, 0.04, '#3a3a40', 4); });
    portal(L, 'stage', 4, 0, 22, STAGES.sewer.n, { id: 'sewer', hole: 1 }); L.deco.push(function (m) { tub(m, [4, 0, 22], [4, 0.05, 22], 1.0, 1.0, '#2a2a30', 12, { cap: 1 }); });
    portal(L, 'garden', -9.6, 0, 33, 'THE CLUBHOUSE: THE GARDEN', {});
    // TB's Cumship over the plaza: a spring pad takes you up to its ladder
    L.springs.push({ x: 12, y: 0, z: -4, vy: 22, vz: 0, vx: 0 }); bx(L, 9, 13, -8, 17, 13.4, 0, { tex: 'shipdeck' }); portal(L, 'stage', 13, 13.4, -4, STAGES.lair.n, { id: 'lair' }); L.ship = { x: 13, y: 17, z: -4 };
    portal(L, 'hub', 0, 0, 45, 'TRAM TO EJACULAND', { to: 'park' }); portal(L, 'hub', 0, 0, -45, 'BOAT TO THE SPERM ISLES', { to: 'isles' });
    L.deco.push(function (m) { bxp(m, -5, 0, 43, 5, 3.4, 47, '#3a1a1e', TL('citywall')); bxp(m, -5.4, 3.4, 42.6, 5.4, 3.8, 47.4, '#c4121c'); m.quad([-6, 0.02, -48], [6, 0.02, -48], [6, 0.02, -56], [-6, 0.02, -56], [0, 0, 3, 0, 3, 2, 0, 2], TL('wood'), [0.5, 0.5, 0.5], [0, 1, 0]); });
    for (var lp = -40; lp <= 40; lp += 10) [-6.6, 6.6].forEach(function (x) { L.deco.push(lampD(x, 0, lp)); L.lights.push({ x: x, y: 4, z: lp, c: [1, 0.75, 0.45], r: 10 }); });
    npc(L, 'amy', -8.5, -30, Math.PI / 2, 'AMY', 'Mild, hot or dynamite?'); npc(L, 'saba', 8.5, -15, -Math.PI / 2, 'SABA', 'Hitless runs only. Take a look, my friend.'); npc(L, 'kaya', -8.5, 24, Math.PI / 2, 'KAYA', 'Welcome in! Kaya\'s on the coffee, Elden\'s on the grill.'); npc(L, 'ali', 8.5, 30, -Math.PI / 2, 'ALI', 'Nuggets? Garlic bread? Everything is better with garlic.'); npc(L, 'harold', 4, -6, Math.PI, 'HAROLD', 'Potions? Tea? Same thing, really. Sit, sit!');
    for (var dd = 0; dd < 40; dd++) L.drops.push({ x: (rnd() - 0.5) * 12, y: 1, z: -44 + rnd() * 88 }); dropLine(L, -8.5, 6.6, -15, 0, 1, 3); dropRing(L, 13, 13.4, -4, 2.5, 8);
    L.start = { x: 0, y: 0, z: -20, a: 0 };
  } else if (h === 'park') { // Ejaculand: the gate with Steve, the carousel, the ferris wheel, the Big Dipper's queue, the Funhouse
    bx(L, -40, -2, -40, 40, 0, 40, { tex: 'parkfloor' }); L.deco.push(function (m) { for (var z = -38; z < 38; z += 3) bxp(m, -2.5, 0.01, z, 2.5, 0.03, z + 2.4, '#3a1a2a', TL('pave')); });
    L.deco.push(function (m) { bxp(m, -9, 0, -33, -6, 8, -31, '#2a0a1a', TL('stripes')); bxp(m, 6, 0, -33, 9, 8, -31, '#2a0a1a', TL('stripes')); bxp(m, -9, 8, -33, 9, 10, -31, '#c4121c'); for (var b2 = 0; b2 < 9; b2++) ell(m, -8 + b2 * 2, 10.3, -32, 0.2, 0.2, 0.2, '#ffe36a', 6, 3); });
    L.steve = { x: 3, z: -28 }; bx(L, 2.4, 0, -28.6, 3.6, 1.6, -27.4, { hide: 1 });
    L.spin.push({ k: 'carousel', x: -18, z: 4 }); bx(L, -21.5, 0, 0.5, -14.5, 0.4, 7.5, { hide: 1 }); L.spin.push({ k: 'ferris', x: 24, z: 14 }); bx(L, 22.5, 0, 12.5, 25.5, 12, 15.5, { hide: 1 });
    portal(L, 'stage', -6, 0, 26, STAGES.coaster.n, { id: 'coaster' }); L.deco.push(function (m) { for (var q = 0; q < 5; q++) tub(m, [-12, 0.9, 18 + q * 1.4], [-4, 0.9, 18 + q * 1.4], 0.05, 0.05, '#c8c8d0', 4); for (var s3 = 0; s3 < 8; s3++) tub(m, [-10 + s3 * 0.1, 0, 30 + s3 * 2], [-10 + s3 * 0.1, 6 + Math.sin(s3) * 3, 30 + s3 * 2], 0.25, 0.25, '#ffe36a', 6); });
    building(L, 8, 22, 18, 32, 9, null); portal(L, 'stage', 7.4, 0, 27, STAGES.funhouse.n, { id: 'funhouse' }); L.deco.push(function (m) { ell(m, 7.9, 6, 27, 0.4, 2.6, 2.6, '#f1e0b0', 12, 7, { face: 'f_steve' }); bxp(m, 7.95, 0, 25.6, 8.0, 2.6, 28.4, '#12040a'); });
    building(L, -30, -20, -22, -10, 7, 'fac_joff', [1, 0]); building(L, 22, -20, 30, -10, 7, 'fac_beebs', [-1, 0]); building(L, -30, -6, -22, 4, 7, 'fac_bonjo', [1, 0]);
    portal(L, 'hub', 0, 0, -37, 'TRAM TO CUM CITY', { to: 'city' });
    for (var bl = 0; bl < 16; bl++) L.deco.push(balloonD((rnd() - 0.5) * 60, 0, (rnd() - 0.5) * 60, rnd())); for (var tn = 0; tn < 6; tn++) L.deco.push(tentD((tn % 2 ? 1 : -1) * (30 + rnd() * 6), 0, -30 + tn * 12, rnd()));
    npc(L, 'potbelly', 3, 12, Math.PI, 'POTBELLY', 'Cabinets are free, kid. Play all you like.'); npc(L, 'joff', -21, -15, Math.PI / 2, 'JOFF', 'Pineapple belongs on pizza. Fight me.'); npc(L, 'beeb', 21, -15, -Math.PI / 2, 'UNCLE BEEB', 'Sit down, lad. First one\'s always warm.');
    for (var dd2 = 0; dd2 < 40; dd2++) L.drops.push({ x: (rnd() - 0.5) * 50, y: 1, z: (rnd() - 0.5) * 60 }); for (var lp2 = -30; lp2 <= 30; lp2 += 10) L.lights.push({ x: (lp2 % 20 ? 4 : -4), y: 4, z: lp2, c: [1, 0.55, 0.8], r: 10 });
    L.start = { x: 0, y: 0, z: -26, a: 0 };
  } else if (h === 'isles') { // a sand island in the sea: the pier, huts, palms, the reef jetty, the volcano path, Spermaid's stall
    bx(L, -34, -4, -34, 34, 0, 30, { tex: 'sand' }); L.sea = -1.2; bx(L, -2, -1, -60, 2, 0, -34, { tex: 'wood' }); portal(L, 'hub', 0, 0, -56, 'BOAT TO CUM CITY', { to: 'city' });
    bx(L, 34, -1, 4, 54, 0, 8, { tex: 'wood' }); portal(L, 'stage', 51, 0, 6, STAGES.reef.n, { id: 'reef' }); portal(L, 'stage', -30, 0, -10, STAGES.beach.n, { id: 'beach' });
    L.deco.push(function (m) { tub(m, [0, -1, 70], [0, 34, 60], 40, 6, '#3a2a24', 16, { T: TL('rockt') }); ell(m, 0, 34, 60, 6, 1.5, 6, '#ff6a20', 10, 3); }); rp(L, -3, 30, 3, 44, 0, 8, 'z', { tex: 'ash' }); bx(L, -3, 4, 44, 3, 8, 50, { tex: 'ash' }); portal(L, 'stage', 0, 8, 47, STAGES.volcano.n, { id: 'volcano' });
    building(L, -14, 8, -6, 16, 4.5, 'fac_sanct', [0, -1]); building(L, 8, 8, 16, 16, 4.5, 'fac_t', [0, -1]);
    for (var pl = 0; pl < 22; pl++) { var a = rnd() * 6.283, rr = 14 + rnd() * 16, px = Math.cos(a) * rr, pz = Math.sin(a) * rr * 0.8; if (Math.abs(px) < 4 || pz > 26) continue; L.deco.push(palmD(px, 0, pz, rnd())); bx(L, px - 0.3, 0, pz - 0.3, px + 0.3, 3, pz + 0.3, { hide: 1 }); }
    for (var rk = 0; rk < 8; rk++) L.deco.push(rockD(-30 + rk * 9, -1, 28 + (rk % 2) * 3, 1 + rnd())); for (var br = 0; br < 5; br++) L.deco.push(brollyD(-20 + br * 9, 0, -22, rnd()));
    npc(L, 'spermaidN', -10, 4, 0, 'SPERMAID', 'Sweetie! Even down here I keep a little stall.'); npc(L, 'harold', 12, 4, 0, 'HAROLD', 'Potions? Tea? Same thing, really. Sit, sit!');
    for (var dd3 = 0; dd3 < 40; dd3++) L.drops.push({ x: (rnd() - 0.5) * 56, y: 1, z: (rnd() - 0.5) * 56 });
    L.start = { x: 0, y: 0, z: -30, a: 0 };
  } else if (h === 'garden') { buildGardenWorld(L, rnd); }
  sky(L, L.theme === 'garden' ? 'isles' : L.theme); return L; }
function lampD(x, y, z) { return function (m) { tub(m, [x, y, z], [x, y + 3.8, z], 0.07, 0.06, '#12040a', 6); ell(m, x, y + 4, z, 0.25, 0.3, 0.25, '#ffd27a', 8, 5); tub(m, [x, y + 4.25, z], [x, y + 4.45, z], 0.28, 0.02, '#12040a', 8); }; }
/* ---------- standing and walls ---------- */
function groundAt(x, z, y) { var best = -999, src = null;
  for (var i = 0; i < LV.boxes.length; i++) { var b = LV.boxes[i]; if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue; if (b.y1 <= y + 0.65 && b.y1 > best) { best = b.y1; src = b; } }
  for (var j = 0; j < LV.ramps.length; j++) { var r = LV.ramps[j]; if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue; var t = r.ax === 'z' ? (z - r.z0) / (r.z1 - r.z0) : (x - r.x0) / (r.x1 - r.x0), h = r.ya + (r.yb - r.ya) * t; if (h <= y + 0.9 && h > best) { best = h; src = r; } }
  return { y: best, src: src }; }
function pushWalls(o, rad) { var climb = null; for (var i = 0; i < LV.boxes.length; i++) { var b = LV.boxes[i]; if (b.y1 <= o.y + 0.65 || b.y0 >= o.y + 1.2) continue; var nx = Math.max(b.x0, Math.min(o.x, b.x1)), nz = Math.max(b.z0, Math.min(o.z, b.z1)), dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
    if (d < rad) { if (d < 1e-4) { var cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; dx = o.x - cx; dz = o.z - cz; d = Math.hypot(dx, dz) || 1; } o.x = nx + dx / d * rad; o.z = nz + dz / d * rad; climb = b; } } return climb; }
function inWater(x, y, z) { if (LV.sea !== undefined && LV.sea !== null && y < LV.sea + 0.2 && groundAt(x, z, y).y < LV.sea - 0.5) return { y0: LV.sea - 30, y1: LV.sea, sea: 1 }; for (var i = 0; i < LV.water.length; i++) { var w = LV.water[i]; if (x > w.x0 && x < w.x1 && z > w.z0 && z < w.z1 && y < w.y1 && y > w.y0 - 1) return w; } return null; }
