/* =====================================================================================================
   THE DEEP (his ask: branching paths, a whole other level under each level that joins up now and then; then: the first
   try was just a path, too shallow, you could still see the top, all samey: make full areas down there with new
   mechanics). After an act is laid, up to four long stretches of solid ground get a cavern dug far under them (about
   thirty tiles down, out of sight of the street) and a level of its own is built in it with the same builder: its own
   set pieces for that zone, climbs and drops, and four new mechanics found only down here:
     ZIPLINES  ('zip')    climb the ledges, grab the rope and slide down over a spiked ditch; jump to let go
     CARTS     ('cart')   jump in, it races along its rails smashing foes; jump the spiked ditch or crash; buffer throws you
     GATES     ('switch') a portcullis blocks the way; the lever is up on a ledge before it
     UPDRAFTS  ('updraft') the way back up: a column of rising cream / steam / dust that carries you up the shaft
   It is dark down there (a light round you, glowing crystals in the zone's colour), the walls are rough cave rock ('K')
   and the roof hangs low and jagged. Holes in the street drop you in (jump them to stay up top); updrafts bring you back
   up; they take turns along the stretch. At the far end, a cracked wall ('X') hides a pocket with a box, or once an act a
   hidden special stage gateway. Cracked walls break when you hit them fast, jump into them, shoot them or are Super.
   ===================================================================================================== */
var DEEP = { minLen: 140, maxLen: 380, crust: 7, below: 30, maxAreas: 4, step: 64 };
var DEEPLOOK = { city: { glow: '#ff2630', glow2: '#ff8a8a', air: '#c4121c', wall: 0.34 }, sewer: { glow: '#f1e0b0', glow2: '#fffbe8', air: '#f1e0b0', wall: 0.4 },
  park: { glow: '#ffe36a', glow2: '#fff6c0', air: '#ffe36a', wall: 0.34 }, bone: { glow: '#e8dcc0', glow2: '#ffffff', air: '#c8b89a', wall: 0.42 },
  factory: { glow: '#ff8a2a', glow2: '#ffd080', air: '#ff6a10', wall: 0.36 }, brain: { glow: '#ff2630', glow2: '#ffb0b0', air: '#ff2630', wall: 0.36 } };
// each zone's deep level: the order its pieces come in (new mechanics among the zone's own set pieces)
var DEEPPLAN = {
  city: [['zipline', 30], ['platPit', 3, '=', 'm', true], ['gateway'], ['climb', 5, 'n'], ['crushers', 3], ['cart', 44], ['drop', 5], ['fallers', 3, 'p'], ['zipline', 30], ['conveyor', 12, 1, 'm']],
  sewer: [['pool', 10, true], ['zipline', 30], ['gateway'], ['conveyor', 14, -1, 'n'], ['cart', 44], ['climb', 5, 'm'], ['jets', 3], ['drop', 5], ['platPit', 3, 'M', 'p', true], ['zipline', 28]],
  park: [['cart', 44], ['bumpers'], ['zipline', 30], ['gateway'], ['platPit', 3, 'O', 'm', true], ['climb', 5, 'n'], ['cart', 44], ['drop', 5], ['saws', 2]],
  bone: [['cart', 44], ['fallers', 3, 'm'], ['gateway'], ['zipline', 30], ['climb', 5, 'n'], ['spikeRun', 2], ['drop', 5], ['cart', 44], ['platPit', 3, 'F', 'p', true]],
  factory: [['conveyor', 14, 1, 'm'], ['cart', 44], ['crushers', 3], ['gateway'], ['zipline', 30], ['jets', 3], ['climb', 5, 'n'], ['saws', 2, true], ['drop', 5], ['cart', 44]],
  brain: [['electric', 3], ['zipline', 30], ['gateway'], ['saws', 2], ['cart', 44], ['climb', 5, 'm'], ['wires', 2], ['drop', 5], ['zipline', 30], ['platPit', 3, 'N', 'n', true]] };
/* ---------- the new set pieces (also usable anywhere) ---------- */
SEC.zipline = function (b, len) { // two ledges up, a rope from the top one down over a spiked ditch to the far side
  b.ground(3); b.ledge(1, 3, 3, '#'); b.ledge(4, 6, 3, '#'); var c0 = b.col + 6, r0 = b.h - 6 - 3; // the rope's top: a hand's reach above the high ledge
  b.ground(7); var cs = b.col; b.ground(2);
  for (var i = 0; i < len - 8; i++) { b.ground(1); if (i > 2 && i < len - 12) b.set(b.col - 1, b.h - 1, '^'); } // spikes under the rope (hurt, not kill)
  b.ent('zip', c0, r0, { c1: b.col - 2, row1: b.h - 3 }); b.drops(-(len - 6), Math.floor((len - 10) / 2), 5, null, 2); b.ground(5); return b; };
SEC.cart = function (b, n) { // a cart on rails: in, along, over the ditch, into the buffer
  b.ground(4); b.thing(-2, 'cart', 0, {}); var c0 = b.col - 3; b.ground(Math.floor(n * 0.55)); b.foe(-4, 'm');
  b.ground(2); for (var i = 0; i < 4; i++) { b.step(i === 0 ? 2 : 0); b.ground(1); b.set(b.col - 1, b.h - 1, '^'); } b.step(-2); // jump it, cart and all
  b.ground(Math.floor(n * 0.45) - 6); b.foe(-6, 'n'); b.thing(-1, 'buffer', 0, {}); b.ent('rails', c0, b.h, { c1: b.col }); b.ground(4);
  b.drops(-Math.floor(n * 0.8), 8, 3, null, 3); return b; };
SEC.gateway = function (b) { // a portcullis across the way and the lever that lifts it, up on a ledge
  b.ground(3); b.ledge(1, 3, 5, '#'); b.thing(3, 'switch', 3, {}); b.ground(10);
  for (var x = 0; x < 2; x++) for (var y = 1; y <= 7; y++) b.set(b.col + x, b.h - y, 'Z'); b.ground(2); b.drops(0, 4, 2); b.ground(6); return b; };
SEC.pocket = function (b, gate) { // the cracked wall at the end and what it hides
  b.ground(4); for (var x = 0; x < 2; x++) for (var y = 1; y <= 7; y++) b.set(b.col + x, b.h - y, 'X'); b.ground(4);
  if (gate) b.thing(5, 'portal', 1, { hidden: 1 }); else { b.thing(5, 'box', 0, { item: gate === false ? 'shield' : 'life' }); b.drops(1, 4, 3); }
  b.ground(14); return b; };
/* ---------- digging the deep ---------- */
function underRoutes(b, a) {
  /* ONE way under the whole act (his ask: a whole path down there through the different areas, not pockets you have to
     come up out of): from just after the start to just before the sign or the arena. Its roof follows the lowest open
     space of each column above it (street, low roads, tunnels, caves) plus a crust; gaps in the street simply open into it.
     The level down there is laid with the same builder and kept at least 15 rows under the roof by climbs and drops. */
  var W = b.cols.length, Z = b.zone, ROWS = b.ROWS, plan = DEEPPLAN[Z.id] || DEEPPLAN.city;
  var st = 30, en = W - 60; b.ents.forEach(function (e) { if (e.k === 'start') st = Math.max(st, e.c + 30); if (e.k === 'goal') en = Math.min(en, e.c - 16); if (e.k === 'arena') en = Math.min(en, e.c0 - 26); });
  var c0 = st, c1 = en, n = c1 - c0; if (n < 200) { b.unders = []; return; }
  var open = new Array(W); for (var c = c0 - 8; c < c1 + 8; c++) { var col = b.cols[c], r = ROWS - 1; while (r >= 0 && col[r] === '#') r--; open[c] = r >= ROWS - 1 ? null : r; } // the lowest non-ground cell; null = a gap all the way down
  var ceil = [], req = [];
  for (var k = 0; k < n; k++) { var m = 0; for (var j = -3; j <= 3; j++) { var o = open[c0 + k + j]; if (o !== null && o !== undefined) m = Math.max(m, o); } ceil.push(m + DEEP.crust + Math.floor(Math.abs(Math.sin((c0 + k) * 0.37) + Math.sin((c0 + k) * 0.91)) * 1.5)); }
  for (var k2 = 0; k2 < n; k2++) req.push(ceil[k2] + 15);
  function need(c, w) { var q = 0; for (var i = Math.max(0, c - c0); i < Math.min(n, c - c0 + w); i++) q = Math.max(q, req[i]); return q; }
  var L = Builder(Z, (a.seed || 1) * 31 + 7); L.col = c0; L.h = need(c0, 40); SEC.run(L, 10);
  var pi = (a.seed || 0) % plan.length, guard = 0;
  while (L.col < c1 - 90 && guard++ < 80) {
    var nd = need(L.col, 120); if (L.h < nd) SEC.drop(L, nd - L.h + 1); else if (L.h > nd + 22) SEC.climb(L, Math.min(6, L.h - nd - 14));
    var p = plan[pi++ % plan.length]; if (p[0] === 'climb' && L.h - p[1] - 1 < need(L.col, 120)) p = ['run', 8]; // never climb into the roof
    SEC[p[0]].apply(null, [L].concat(p.slice(1))); SEC.run(L, 5); }
  while (L.col < c1 - 34) L.ground(1);
  if (L.h < need(L.col, 30)) SEC.drop(L, need(L.col, 30) - L.h + 1);
  SEC.pocket(L, true); while (L.col < c1) L.ground(1);
  // carve it in: rock from the roof down, the deep level's tiles over it
  for (var k3 = 0; k3 < n; k3++) { var c3 = c0 + k3, cl = b.cols[c3], Lc = L.cols[c3]; if (!Lc) continue;
    for (var y3 = ceil[k3]; y3 < ROWS; y3++) { var ch = Lc[y3]; cl[y3] = ch === '.' ? 'K' : ch; }
    if (cl[ROWS - 1] === 'K') { for (var y4 = ROWS - 4; y4 < ROWS; y4++) cl[y4] = '#'; cl[ROWS - 5] = '^'; } }
  L.ents.forEach(function (e) { if (e.c >= c0 && e.c < c1) b.ents.push(e); });
  function floorRow(c) { for (var y5 = ceil[c - c0]; y5 < ROWS; y5++) { var ch5 = b.cols[c][y5]; if (ch5 !== 'K' && ch5 !== '.') return ch5 === '#' ? y5 : null; } return null; }
  var busy = {}; L.ents.forEach(function (e) { for (var d = -4; d <= 6; d++) busy[e.c + d] = 1; });
  b.ents.forEach(function (e) { if (e.k !== 'drop' && e.c >= c0 - 4 && e.c < c1 + 4 && e.row < ceil[Math.max(0, Math.min(n - 1, e.c - c0))]) for (var d2 = -3; d2 <= 3; d2++) busy[e.c + d2] = 1; });
  b.bands.forEach(function (q) { for (var cb = q.c0 - 2; cb < q.c1 + 2; cb++) busy[cb] = 1; });
  function solidTo(c) { var t = b.top[c]; if (t === null || t === undefined) return false; for (var y = t + 1; y < ceil[c - c0]; y++) if (b.cols[c][y] !== '#') return false; return true; }
  function shaftOK(cA, loose) { if (cA < c0 + 4 || cA + 3 > c1 - 30) return false; var f = floorRow(cA); if (f === null) return false; for (var w = 0; w < 3; w++) { if ((busy[cA + w] && !loose) || floorRow(cA + w) !== f || !solidTo(cA + w) || Math.abs(b.top[cA + w] - b.top[cA]) > (loose ? 2 : 0)) return false; } return true; }
  function shaft(cA, up) { var f = floorRow(cA + 1); for (var w = 0; w < 3; w++) { var cc4 = cA + w; for (var y6 = b.top[cc4]; y6 < ceil[cc4 - c0] + 1; y6++) b.cols[cc4][y6] = 'K'; }
    b.ents = b.ents.filter(function (e) { return !(e.k !== 'drop' && e.c >= cA - 1 && e.c <= cA + 3 && e.row <= b.top[cA] + 1); });
    if (up) b.ent('updraft', cA + 1, f, { toprow: b.top[cA] - 3 }); else for (var dd = 0; dd < 4; dd++) b.ent('drop', cA + 1, b.top[cA] + 4 + dd * 6);
    for (var d3 = -4; d3 <= 6; d3++) busy[cA + d3] = 1; }
  function near(c, loose) { for (var d = 0; d < (loose ? 50 : 24); d++) { if (shaftOK(c + d, loose)) return c + d; if (shaftOK(c - d, loose)) return c - d; } return -1; }
  // ways in and out all along: a hole down, then an updraft up, and so on; the last is always a way up
  var up = false; for (var cs = c0 + 14; cs < c1 - 60; cs += DEEP.step) { var q = near(cs); if (q > 0) { shaft(q, up); up = !up; } }
  var last = near(c1 - 50, true); if (last > 0) shaft(last, true);
  // dark spots: some stretches go pitch black, lanterns and crystals light them
  var dark = [], h = (a.seed || 3); for (var ds = c0 + 60; ds < c1 - 80; ds += 70) { h = (h * 16807) % 2147483647; if (h % 3 === 0) { var dl = 34 + h % 30; dark.push([ds, ds + dl]); ds += dl; } }
  // decoration along the way, in the look of the district above
  var DS = DEEPDECO[Z.id] || DEEPDECO.city;
  for (var g = c0 + 4; g < c1 - 4; g += 4 + (g % 3)) { var fr = floorRow(g); if (fr === null || b.cols[g][fr - 1] !== 'K' || busy[g] || floorRow(g + 1) !== fr || floorRow(g - 1) !== fr) continue;
    var di = 0; for (var q2 = 0; q2 < b.dists.length; q2++) if (b.dists[q2].c <= g) di = q2;
    var set = DS.slice(di % DS.length).concat(DS.slice(0, di % DS.length)).slice(0, 4), pick = set[(g * 7 + di) % set.length];
    var inDark = dark.some(function (d) { return g >= d[0] && g < d[1]; });
    b.ent('deco', g, fr, { d: inDark && g % 3 === 0 ? 'hog_lantern' : pick, flip: g % 2 }); }
  for (var gg = c0 + 5; gg < c1 - 5; gg += 9) { if (b.cols[gg + 4] && b.cols[gg + 4][ceil[gg + 4 - c0]] === 'K') b.ent('glow', gg + 4, ceil[gg + 4 - c0], { up: 1, v: gg % 3 }); }
  b.unders = [{ c0: c0, c1: c1, ceil: ceil.slice(), dark: dark }];
}
var DEEPDECO = { city: ['hog_crates', 'hog_barrels', 'hog_candle', 'hog_poster', 'hog_pallet', 'hog_cross', 'hog_lantern'], sewer: ['hog_pipe', 'hog_valve', 'hog_sludge', 'hog_fungus', 'hog_barrels', 'hog_drip', 'hog_lantern'],
  park: ['hog_poster', 'hog_balloons', 'hog_booth', 'hog_popcorn', 'hog_crates', 'hog_ridesign', 'hog_lantern'], bone: ['hog_skullpile', 'hog_candle', 'hog_grave', 'hog_coffinup', 'p_ribs', 'hog_bonefence', 'hog_cross'],
  factory: ['hog_gastank', 'hog_gauge', 'hog_valve', 'hog_barrels', 'hog_anvil', 'hog_crates', 'hog_lantern'], brain: ['hog_specimen', 'hog_terminal', 'hog_cables', 'hog_blumbanner', 'hog_gauge', 'hog_lantern'] };

// the deep's own ground and rock, per zone (Clubhouse Row's stays black and red)
var DEEPTILE = { city: { fill: 'stone', top: 'rim', pal: ['#5a2a2a', '#3a1a1c', '#1a0a0c'], edge: ['#a65a4a', '#6a2a24', '#2a0a0c'] },
  sewer: { fill: 'wetbrick', top: 'slime', pal: ['#5a5a40', '#38382a', '#181a12'], edge: ['#fffbe8', '#c8b880', '#4a4a30'] },
  park: { fill: 'plank', top: 'plankedge', pal: ['#6a3a28', '#42221a', '#1e0e0a'], edge: ['#ffe36a', '#c4121c', '#3a0a0c'] },
  bone: { fill: 'stone', top: 'skulls', pal: ['#5a4a3a', '#3a3024', '#1a1610'], edge: ['#f1e7d0', '#a89878', '#3a3024'] },
  factory: { fill: 'concrete', top: 'hazard', pal: ['#5a3a30', '#3a2420', '#1a0e0c'], edge: ['#ff8a2a', '#8a3a10', '#2a0e06'] },
  brain: { fill: 'tile', top: 'rim', pal: ['#4a3a50', '#2e2434', '#140e18'], edge: ['#ff2630', '#8a0a10', '#2a0408'] } };
function deepTiles(c) { // the deep under each district wears that district's ground, sunk into the dark (so travelling down there feels like travelling up top)
  var id = typeof distAt === 'function' ? distAt(c) : null, k = 'deep:' + LV.zone.id + ':' + (id || '');
  if (!TILESETS[k]) { var Z = {}, D = DEEPTILE[LV.zone.id] || DEEPTILE.city, S = id && styleOf(id, 'mid'); for (var q in LV.zone) Z[q] = LV.zone[q]; for (var q2 in D) Z[q2] = D[q2];
    if (S && S.pal && S.edge) { Z.fill = S.fill; Z.top = S.top; Z.pal = S.pal.map(function (h) { return tohexS(h, 0.62); }); Z.edge = S.edge.map(function (h) { return tohexS(h, 0.8); }); }
    TILESETS[k] = buildTileset(Z); } return TILESETS[k]; }
function tohexS(h, k) { var v = [1, 3, 5].map(function (i) { return Math.round(parseInt(h.substr(i, 2), 16) * k); }); return '#' + v.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
/* ---------- in play ---------- */
STANDS.cart = 1; STANDS.switch = 1; STANDS.buffer = 1; STANDS.deco = 1;
function isBreak(ch) { return ch === 'X'; }
function breakWall(cx, cy, ch) { // the whole block goes (cracked wall or a lifted gate), with rubble
  ch = ch || 'X'; var todo = [[cx, cy]], seen = {}, n = 0;
  while (todo.length && n < 80) { var q = todo.pop(), k = q[0] + ',' + q[1]; if (seen[k]) continue; seen[k] = 1; if (T(q[0], q[1]) !== ch) continue;
    LV.t[q[1] * LV.w + q[0]] = 'K'; n++; for (var i = 0; i < 3; i++) FX.push({ k: 'bit', x: q[0] * TS + 8, y: q[1] * TS + 8, vx: (Math.random() - 0.5) * 300, vy: -100 - Math.random() * 200, t: 0.6, c: ch === 'Z' ? '#4a3a40' : i % 2 ? LV.zone.pal[0] : LV.zone.pal[1] });
    todo.push([q[0] + 1, q[1]], [q[0] - 1, q[1]], [q[0], q[1] + 1], [q[0], q[1] - 1]); }
  if (n) { sfx.play('crumble'); sfx.play('thud'); G.shake = 4; if (ch === 'X') G.score += 50; }
  return n;
}
function wallCheck(dt) { var p = PL; if (!p || p.state !== 'normal' || G.mode !== 'play') return;
  var v = p.air ? p.vx : p.gsp, fast = Math.abs(v) >= 200 || (p.air && Math.abs(v) >= 110) || G.super || p.atkT > 0 || p.cart; if (!fast) return;
  var dir = v === 0 ? p.face : Math.sign(v), ax = p.x + dir * (12 + Math.abs(v) * dt * 2);
  for (var h = 4; h < 44; h += 10) { var cx = Math.floor(ax / TS), cy = Math.floor((p.y - h) / TS); if (isBreak(T(cx, cy))) { breakWall(cx, cy); return; } } }
function shotWalls() { SHOTS.forEach(function (s) { if (!s.mine || s.life <= 0) return; var cx = Math.floor((s.x + s.vx / 30) / TS), cy = Math.floor(s.y / TS); if (isBreak(T(cx, cy))) { breakWall(cx, cy); s.life = 0; } }); }
function deepAt(x, y, m) { var c = Math.floor(x / TS); m = m === undefined ? 2 : m; return (LV.unders || []).some(function (u) { return c >= u.c0 - 1 && c < u.c1 + 1 && y > (u.ceil[Math.max(0, Math.min(u.ceil.length - 1, c - u.c0))] + m) * TS; }); }
function zipPos(e, t) { var x1 = e.c1 * TS + 8, y1 = e.y + (e.row1 - e.row) * TS; return { x: e.x + (x1 - e.x) * t, y: e.y + (y1 - e.y) * t, len: Math.hypot(x1 - e.x, y1 - e.y), x1: x1, y1: y1 }; }
function stepDeep(dt) { // returns true when the player is on a zipline (his own movement then)
  var p = PL; if (!p || G.mode !== 'play') return false;
  if (p.zip) { var z = p.zip, e = z.e, P0 = zipPos(e, 0), slope = (P0.y1 - P0.y) / Math.max(1, P0.x1 - P0.x); z.v = Math.min(520, (z.v || 200) + (120 + slope * 500) * dt); z.s += z.v * dt;
    var t = z.s / P0.len, P = zipPos(e, Math.min(1, t)); p.x = P.x; p.y = P.y + 44; p.vx = z.v; p.vy = 0; p.gsp = z.v; p.air = true; p.face = 1; p.jumps = 1; p.dist = (p.dist || 0) + z.v * dt;
    if (KIT.pressed('a') || t >= 1 || p.state !== 'normal') { p.zip = null; p.vx = Math.max(260, z.v); p.vy = KIT.pressed('a') ? -330 : -80; e.cd = 0.6; sfx.play('jump'); }
    return true; }
  ENTS.forEach(function (e) {
    if (e.k === 'zip') { if (e.cd > 0) { e.cd -= dt; return; } var P1 = zipPos(e, 0); if (p.x < e.x - 4 || p.x > P1.x1) return; var t1 = (p.x - e.x) / Math.max(1, P1.x1 - e.x), Pz = zipPos(e, t1);
      if (p.state === 'normal' && p.vy > -260 && Math.abs((p.y - 44) - Pz.y) < 12) { p.zip = { e: e, s: t1 * P1.len, v: Math.max(200, Math.abs(p.vx) * 0.8) }; sfx.play('clink'); } }
    else if (e.k === 'cart') { if (!e.alive) return;
      if (e.st === 'ride') { if (p.state !== 'normal') { e.st = 'idle'; p.cart = 0; return; }
        if (!p.air) { p.gsp = Math.max(p.gsp, 480); p.face = 1; } e.x = p.x; e.y = p.y; e.rot = p.air ? 0 : Math.atan(p.slope || 0) * 0.6;
        ENTS.forEach(function (f) { if (f.k === 'foe' && f.alive && Math.abs(f.x - p.x) < 22 && Math.abs(f.y - p.y) < 30) { f.hp = 1; hitFoe(f, 9); } });
        var bf = ENTS.filter(function (q) { return q.k === 'buffer' && q.x > e.x0 && q.x < e.x0 + 80 * TS; })[0];
        if ((bf && p.x >= bf.x - 14) || (KIT.pressed('down') && !p.air)) { e.alive = bf && p.x >= bf.x - 14 ? false : true; e.st = e.alive ? 'idle' : 'gone'; p.cart = 0;
          if (!e.alive) { poof(e.x, e.y - 10, 16, ['#6a5a4a', '#3a2a20', '#ffe36a']); sfx.play('crumble'); sfx.play('spring'); p.air = true; p.vy = -420; p.vx = 520; p.gsp = 520; G.shake = 5; } }
        if (p.air && p.y > e.ry0 + 6 * TS) { e.st = 'idle'; p.cart = 0; } }
      else if (e.st !== 'gone' && p.state === 'normal' && Math.abs(p.x - e.x) < 16 && Math.abs(p.y - e.y) < 14 && !(e.cd > 0)) { e.st = 'ride'; p.cart = 1; e.ry0 = e.y; sfx.play('dash'); G.banner = 0.9; G.bannerTxt = 'HOLD ON!'; }
      if (e.cd > 0) e.cd -= dt; }
    else if (e.k === 'switch') { if (!e.on && p.state === 'normal' && Math.abs(p.x - e.x) < 14 && Math.abs(p.y - e.y) < 30) { e.on = 1; sfx.play('check'); var c0 = Math.floor(e.x / TS);
        for (var c = c0; c < c0 + 30; c++) for (var r = 0; r < LV.h; r++) if (T(c, r) === 'Z') { breakWall(c, r, 'Z'); } G.banner = 1.2; G.bannerTxt = 'THE GATE IS UP'; } }
    else if (e.k === 'updraft') { var top = e.y + (e.toprow - e.row) * TS; e.top = top;
      if (Math.abs(p.x - e.x) < 26 && p.y <= e.y + 2 && p.y > top - 10 && p.state === 'normal') { p.air = true; p.vy = Math.max(-760, Math.min(p.vy, 0) - 3200 * dt); if (p.y < top + 40) p.vx += p.face * 600 * dt; e.blow = 0.3; }
      if (Math.random() < 0.5) FX.push({ k: 'bit', x: e.x + (Math.random() - 0.5) * 40, y: e.y - Math.random() * 40, vx: 0, vy: -320 - Math.random() * 200, t: 0.9, c: (DEEPLOOK[LV.zone.id] || DEEPLOOK.city).air }); }
  });
  return false;
}
/* ---------- drawing: the new things, the dark and the crystals ---------- */
function drawDeepEnt(g, e, cx, cy) {
  var x = Math.round(e.x - cx), y = Math.round(e.y - cy), L = DEEPLOOK[LV.zone.id] || DEEPLOOK.city;
  if (e.k === 'zip') { var P = zipPos(e, 0), x1 = Math.round(P.x1 - cx), y1 = Math.round(P.y1 - cy); g.strokeStyle = '#12040a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#6a5a50'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 1); g.lineTo(x1, y1 - 1); g.stroke();
    R('#12040a', x - 3, y - 8, 6, 120); R('#3a2a24', x - 2, y - 8, 4, 120); R('#12040a', x1 - 3, y1 - 6, 6, 120); R('#3a2a24', x1 - 2, y1 - 6, 4, 120);
    var hx = x + 10, hy = y + (y1 - y) * (10 / Math.max(1, x1 - x)); if (PL.zip && PL.zip.e === e) { hx = Math.round(PL.x - cx); hy = Math.round(PL.y - 44 - cy); }
    R('#12040a', hx - 6, hy - 2, 12, 6); R('#c4121c', hx - 5, hy - 1, 10, 4); R('#12040a', hx - 1, hy + 4, 2, 6); return true; }
  if (e.k === 'cart') { if (!e.alive) return true; g.save(); g.translate(x, y); if (e.rot) g.rotate(e.rot);
    R('#12040a', -18, -18, 36, 16); R('#4a3a30', -17, -17, 34, 14); R('#6a5a4a', -17, -17, 34, 2); R('#2a1a14', -17, -9, 34, 2); R(L.glow, -13, -13, 3, 3);
    for (var w = -10; w <= 10; w += 20) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(w, -3, 4, 0, 6.3); g.fill(); g.fillStyle = '#8a7a6a'; g.fillRect(w - 1, -4, 2, 2); }
    g.restore(); if (e.st === 'ride' && !PL.air && Math.random() < 0.7) FX.push({ k: 'bit', x: e.x - 16, y: e.y - 2, vx: -120, vy: -40 - Math.random() * 40, t: 0.25, c: '#ffe36a' }); return true; }
  if (e.k === 'rails') { var c0 = e.c, c1 = e.c1; e.ry = e.ry || {}; for (var c = Math.max(c0, Math.floor(cx / TS) - 1); c < Math.min(c1, Math.floor((cx + KIT.W) / TS) + 1); c++) { if (e.ry[c] === undefined) { var f = floorAt(c * TS + 8, e.y - 6 * TS, e.y + 6 * TS, true); e.ry[c] = f === null ? -1 : f; } var fy = e.ry[c]; if (fy < 0) continue;
      R('#12040a', c * TS - cx, fy - cy - 3, 16, 3); R('#8a7a6a', c * TS - cx, fy - cy - 3, 16, 1); R('#3a2414', c * TS - cx + 4, fy - cy - 1, 4, 2); } return true; }
  if (e.k === 'buffer') { R('#12040a', x - 8, y - 22, 16, 22); R('#c4121c', x - 7, y - 21, 14, 20); for (var s2 = 0; s2 < 20; s2 += 6) R('#12040a', x - 7, y - 21 + s2, 14, 2); R('#ffe36a', x - 9, y - 14, 4, 6); return true; }
  if (e.k === 'switch') { R('#12040a', x - 8, y - 6, 16, 6); R('#4a3a40', x - 7, y - 5, 14, 4); g.save(); g.translate(x, y - 5); g.rotate(e.on ? 0.7 : -0.7); R('#12040a', -2, -18, 4, 18); R('#8a7a6a', -1, -17, 2, 16); R(e.on ? '#ffe36a' : '#ff2630', -4, -22, 8, 6); g.restore(); return true; }
  if (e.k === 'updraft') { var top = e.top !== undefined ? e.top : e.y - 400; for (var yy = Math.round(top - cy); yy < y; yy += 6) { var ph = Math.floor(G.t * 20 + yy / 6) % 3; if (ph === 0) R(L.air, x - 10 + ((yy * 7) % 20), yy, 2, 4); }
    R('#12040a', x - 18, y - 4, 36, 4); R(L.glow, x - 16, y - 3, 32, 2); return true; }
  if (e.k === 'glow') return true; // drawn over the dark
  if (e.k === 'deco') { if (e.d === 'hog_lantern') { R('#12040a', x - 1, y - 60, 2, 34); spr('hog_lantern', x, y - 20, { flip: !!e.flip }); if (Math.floor(G.t * 8 + e.x) % 5 === 0) R(L.glow2, x - 1, y - 30, 2, 2); } else spr(e.d, x, y + 1, { flip: !!e.flip }); return true; }
  return false;
}
var DKC = null;
function drawDeepDark() {
  if (!LV || !PL || !LV.unders || !LV.unders.length || !deepAt(PL.x, PL.y - 20)) return;
  var g = KIT.ctx, W = KIT.W, H = KIT.H, cx = Math.round(CAM.x), cy = Math.round(CAM.y), U = LV.unders[0], L = DEEPLOOK[LV.zone.id] || DEEPLOOK.city;
  var pc = PL.x / TS, dk = 0; (U.dark || []).forEach(function (d) { var k = Math.min(1, Math.min(pc - d[0], d[1] - pc) / 8); if (k > dk) dk = k; });
  var base = 0.16 + dk * 0.68; // dim everywhere down there; pitch dark in the dark spots
  if (!DKC) { DKC = document.createElement('canvas'); } if (DKC.width !== W || DKC.height !== H) { DKC.width = W; DKC.height = H; }
  var d = DKC.getContext('2d'); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, W, H); d.fillStyle = 'rgba(4,2,4,' + base.toFixed(2) + ')'; d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  function hole(x, y, r) { [[r * 1.6, 0.35], [r * 1.2, 0.55], [r, 1]].forEach(function (q) { d.fillStyle = 'rgba(0,0,0,' + q[1] + ')'; d.beginPath(); d.arc(Math.round(x), Math.round(y), Math.round(q[0]), 0, 6.3); d.fill(); }); }
  hole(PL.x - cx, PL.y - 22 - cy, dk > 0.5 ? 70 : 110);
  ENTS.forEach(function (e) { if (e.k === 'deco' && e.d === 'hog_lantern') { var x = e.x - cx, y = e.y - 30 - cy; if (x > -120 && x < W + 120 && y > -120 && y < H + 120) hole(x, y, 46 + Math.sin(G.t * 7 + e.x) * 2); }
    else if (e.k === 'glow' || e.k === 'updraft') { var x2 = e.x - cx, y2 = e.y - cy; if (x2 > -60 && x2 < W + 60 && y2 > -60 && y2 < H + 60) hole(x2, y2 + (e.up ? 8 : -10), e.k === 'updraft' ? 40 : 18); } });
  g.drawImage(DKC, 0, 0);
  // the crystals glow through the dark
  ENTS.forEach(function (e) { if (e.k !== 'glow') return; var x = Math.round(e.x - cx), y = Math.round(e.y - cy); if (x < -20 || x > W + 20 || y < -30 || y > H + 30) return; var c1 = e.v === 2 ? L.glow2 : L.glow, f = Math.sin(G.t * 3 + e.x) > 0.6 ? 1 : 0;
    var s = e.up ? 1 : -1; R('#12040a', x - 4, y, 9, s * 3); R(c1, x - 3, y, 2, s * (8 + f)); R(c1, x, y, 2, s * 12); R(c1, x + 3, y, 2, s * 6); R('#ffffff', x, y + s * 2, 1, s * 3);
    for (var k = 0; k < 4; k++) if ((Math.floor(G.t * 4) + k + e.v) % 4 === 0) R(c1, x - 8 + k * 5, y + s * (14 + k % 2 * 4), 1, 1); });
}
(function () {
  var sP = stepPlayer; stepPlayer = function (dt) { if (stepDeep(dt)) return; wallCheck(dt); sP(dt); };
  var sW = stepWorld; stepWorld = function (dt) { shotWalls(); sW(dt); };
  var dE = drawEnt; drawEnt = function (g, e, cx, cy, W, H) { if (e.k === 'zip' || e.k === 'cart' || e.k === 'rails' || e.k === 'buffer' || e.k === 'switch' || e.k === 'updraft' || e.k === 'glow' || e.k === 'deco') { drawDeepEnt(g, e, cx, cy); return; } dE(g, e, cx, cy, W, H); };
  var tF = tilesFor; tilesFor = function (c, r) { if (LV.unders && LV.unders.length && deepAt(c * TS + 8, r * TS + 8, -4)) return deepTiles(c); return tF(c, r); };
  var dW = drawWorld; drawWorld = function () { dW(); drawDeepDark(); };
  var bA = beginAct; beginAct = function (ai, fc) { if (PL) { PL.zip = null; PL.cart = 0; } bA(ai, fc); if (PL) { PL.zip = null; PL.cart = 0; } };
})();
