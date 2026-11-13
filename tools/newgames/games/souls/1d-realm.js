/* =====================================================================================================
   DARK LOADS update 149: one world instead of four small boxes (his ask: why spawn in a room full of enemies, why is the
   area small and claustrophobic, look at how Dark Souls is laid out). REALMMAP (tools/dark-loads/realm.py) is the whole
   of it: the chapel you wake in, the graveyard, the Candlelit Square in the middle that everything loops back to, the
   ruins of Cum City climbing to Mama Muckies, the Cathedral of Blum above them, the Bone Depths under the square and
   the Pill Keep across the bridge behind the sealed gate. Stairs climb between levels (their heights come from the
   floors at each end), low walls you can see over, buildings of every height, shortcut doors that open from one side,
   fog gates that really are walls until you walk through them.
   ===================================================================================================== */
var REGIONS = {
  A: { id: 'chapel', name: 'THE FORGOTTEN CHAPEL', wall: 'stonewall', floor: 'stonef', wallH: 8, fog: [0.05, 0.03, 0.035], amb: [0.26, 0.2, 0.19], lamp: [1, 0.6, 0.3], fogR: [10, 40], song: 'dkcath', dress: ['candles', 'coffin', 'statue', 'candles', 'pews', 'skulls'] },
  B: { id: 'grave', name: 'THE CHAPEL GRAVEYARD', wall: 'stonewall', floor: 'grass', wallH: 3, fog: [0.13, 0.05, 0.07], amb: [0.36, 0.25, 0.26], lamp: [1, 0.5, 0.25], fogR: [16, 70], song: 'dkruins', dress: ['grave', 'grave', 'grave', 'candles', 'statue', 'grave'], sky: 1 },
  C: { id: 'hub', name: 'THE CANDLELIT SQUARE', wall: 'brick', floor: 'cobble2', wallH: 5, fog: [0.16, 0.05, 0.06], amb: [0.4, 0.27, 0.25], lamp: [1, 0.55, 0.25], fogR: [16, 80], song: 'dkhub', dress: ['barrel', 'crates', 'candles', 'rubble', 'statue'], sky: 1 },
  D: { id: 'ruins', name: 'THE CUM CITY RUINS', wall: 'brick', upper: 'windows', floor: 'cobble', wallH: 8, wallR: 9, fog: [0.15, 0.045, 0.05], amb: [0.36, 0.23, 0.22], lamp: [1, 0.45, 0.2], fogR: [14, 72], song: 'dkruins', boss: 'muckies', dress: ['rubble', 'barrel', 'crates', 'grave', 'candles', 'rubble', 'barrel', 'skulls'], sky: 1 },
  E: { id: 'cath', name: 'THE CATHEDRAL OF BLUM', wall: 'marble2', floor: 'tilew', wallH: 14, fog: [0.06, 0.05, 0.1], amb: [0.22, 0.2, 0.3], lamp: [0.8, 0.7, 1], fogR: [12, 62], song: 'dkcath', boss: 'bride', dress: ['pews', 'candles', 'statue', 'coffin', 'candles', 'pews', 'chains'] },
  F: { id: 'keep', name: 'THE PILL KEEP', wall: 'stonewall2', floor: 'checker', wallH: 10, fog: [0.17, 0.04, 0.1], amb: [0.36, 0.17, 0.25], lamp: [1, 0.25, 0.55], fogR: [16, 90], song: 'dkthrone', boss: 'tb', dress: ['pills', 'candles', 'statue', 'crates', 'pills', 'chains', 'barrel'], sky: 1 },
  G: { id: 'depths', name: 'THE BONE DEPTHS', wall: 'rockt', floor: 'bone2', wallH: 9, wallR: 4, fog: [0.045, 0.038, 0.03], amb: [0.2, 0.18, 0.15], lamp: [1, 0.75, 0.4], fogR: [8, 42], song: 'dkdepths', boss: 'stag', dress: ['skulls', 'ribs', 'cage', 'coffin', 'candles', 'rubble', 'skulls', 'chains'] }
};
var REGL = 'ABCDEFG'.split('');
AREAS = REGL.map(function (r) { return REGIONS[r]; });
function regionAt(x, z) { if (!WORLD || !WORLD.RG) return REGIONS.A; var i = tileOf(x), j = tileOf(z); return REGIONS[inMap(i, j) ? REGL[WORLD.RG[j * WORLD.MW + i]] : 'A'] || REGIONS.A; }
function parseArea() {
  var M0 = REALMMAP, MW = M0.W, MH = M0.H, K = new Uint8Array(MW * MH), Hh = new Float32Array(MW * MH), RS = new Float32Array(MW * MH), RD = new Uint8Array(MW * MH), RG = new Uint8Array(MW * MH), WT = new Float32Array(MW * MH), SOL = new Uint8Array(MW * MH), things = [];
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) { var q = j * MW + i, ch = M0.k[j][i]; Hh[q] = (M0.h[j].charCodeAt(i) - 48) / 2 - 12; RG[q] = Math.max(0, REGL.indexOf(M0.r[j][i]));
    K[q] = ch === '#' ? 1 : ch === ' ' ? 2 : ch === '=' ? 4 : (ch === 'O' || ch === 'R') ? 1 : ch === 'G' ? 3 : 0;
    if (ch === 'O') SOL[q] = 1; if (ch === 'R') SOL[q] = 2;
    RD[q] = { '>': 1, '<': 2, 'v': 3, '^': 4 }[ch] || 0; }
  var W0 = { MW: MW, MH: MH, K: K, H: Hh, RS: RS, RD: RD, RG: RG, WT: WT, SOL: SOL, things: things, ai: 0 };
  WORLD = W0;
  // stairs: each run gets the heights of the floors at its two ends
  var DV = [null, [1, 0], [-1, 0], [0, 1], [0, -1]];
  function endH(i, j, d, s) { var n = 0; while (n < 40) { i += d[0] * s; j += d[1] * s; n++; if (!inMap(i, j)) return null; var q = j * MW + i; if (RD[q]) continue; return K[q] === 0 || K[q] === 3 ? { h: Hh[q], n: n } : null; } return null; }
  var miss = [];
  for (j = 0; j < MH; j++) for (i = 0; i < MW; i++) { var q2 = j * MW + i; if (!RD[q2]) continue; var d = DV[RD[q2]], lo = endH(i, j, d, -1), hi = endH(i, j, d, 1);
    if (!lo || !hi) { miss.push(q2); continue; } var len = lo.n + hi.n - 1; RS[q2] = (hi.h - lo.h) / len; Hh[q2] = lo.h + RS[q2] * (lo.n - 1); }
  miss.forEach(function (q) { var i = q % MW, j = (q / MW) | 0, d = DV[RD[q]], side = [[d[1], d[0]], [-d[1], -d[0]]];
    for (var s = 0; s < 2; s++) { var ni = i + side[s][0], nj = j + side[s][1]; if (!inMap(ni, nj)) continue; var nq = nj * MW + ni; if (RD[nq] === RD[q] && RS[nq]) { RS[q] = RS[nq]; Hh[q] = Hh[nq]; return; } } RD[q] = 0; });
  // low walls and blocks stand on the floor beside them; walls rise from the highest floor near them
  function flTop(q) { return RD[q] ? Hh[q] + RS[q] : Hh[q]; }
  function hash(a, b) { var h = Math.imul(a * 73856093 ^ b * 19349663, 0x5bd1e995); return ((h >>> 0) % 1000) / 1000; }
  for (j = 0; j < MH; j++) for (i = 0; i < MW; i++) { var q3 = j * MW + i; if (K[q3] !== 1 && K[q3] !== 4) continue; var R0 = REGIONS[REGL[RG[q3]]];
    if (SOL[q3] === 1 || K[q3] === 4) { var m = -99; for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) { if (!inMap(i + di, j + dj)) continue; var nq3 = (j + dj) * MW + i + di; if (K[nq3] === 0 || K[nq3] === 3) m = Math.max(m, flTop(nq3)); }
      if (m < -50) m = Hh[q3]; WT[q3] = m + (K[q3] === 4 ? 1.1 : 1.2); Hh[q3] = WT[q3]; continue; }
    if (SOL[q3] === 2) { WT[q3] = Hh[q3] + R0.wallH; continue; }
    var mx = -99; for (var r = 1; r <= 6 && mx < -50; r++) for (dj = -r; dj <= r; dj++) for (di = -r; di <= r; di++) { if (!inMap(i + di, j + dj)) continue; var nq = (j + dj) * MW + i + di; if (K[nq] === 0 || K[nq] === 3) mx = Math.max(mx, flTop(nq)); }
    if (mx < -50) mx = 0; WT[q3] = mx + R0.wallH + Math.floor(hash(i >> 2, j >> 2) * (R0.wallR || 0) / 1.5) * 1.5; }
  // things
  var cand = 0; M0.things.forEach(function (t0) { var t = {}; for (var k in t0) t[k] = t0[k]; t.id = t.id || (t.k + ':' + t.i + ',' + t.j);
    if (t.k === 'door') { t.k = 'sdoor'; K[t.j * MW + t.i] = 3; Hh[t.j * MW + t.i] = Math.max(Hh[t.j * MW + t.i - 1] || 0, Hh[t.j * MW + t.i + 1] || 0, Hh[(t.j - 1) * MW + t.i] || 0, Hh[(t.j + 1) * MW + t.i] || 0); }
    if (t.k === 'candle') cand++; things.push(t); });
  for (i = 0; i < MW; i++) if (K[48 * MW + i] === 3 && M0.k[48][i] === 'G') things.push({ k: 'gate', i: i, j: 48, id: 'gate' });
  // the fog gates: every F tile belongs to the gate whose marker is in its line
  M0.k.forEach(function (row, j) { for (var i = 0; i < MW; i++) if (row[i] === 'F') { var g = things.filter(function (t) { return t.k === 'fog' && (t.j === j || t.i === i) && Math.abs(t.i - i) + Math.abs(t.j - j) < 6; })[0]; if (g) { (g.tiles = g.tiles || []).push([i, j]); WORLD.FOGT = WORLD.FOGT || {}; WORLD.FOGT[j * MW + i] = g; } } });
  things.forEach(function (t) { if (t.k === 'fog') { var a = t.tiles || [[t.i, t.j]]; t.alongX = a.some(function (p) { return p[1] === t.j && p[0] !== t.i; }) || (tk(t.i - 1, t.j) === 1 && tk(t.i + 1, t.j) === 1); } });
  return W0;
}
function tk(i, j) { return inMap(i, j) ? WORLD.K[j * WORLD.MW + i] : 1; }
function th(i, j) { return inMap(i, j) ? WORLD.H[j * WORLD.MW + i] : 0; }
function stairH(i, j, x, z) { var q = j * WORLD.MW + i, d = WORLD.RD[q], f;
  if (d === 1) f = x / TSZ - i; else if (d === 2) f = 1 - (x / TSZ - i); else if (d === 3) f = z / TSZ - j; else f = 1 - (z / TSZ - j);
  f = Math.max(0, Math.min(0.999, f)); return WORLD.H[q] + WORLD.RS[q] * Math.floor(f * 4) / 4; }
function floorAt(x, z) { var i = tileOf(x), j = tileOf(z), k = tk(i, j); if (k === 2) return -60; if (WORLD.RD && WORLD.RD[j * WORLD.MW + i]) return stairH(i, j, x, z); return th(i, j); }
function doorOpen(i, j) { var d = WORLD.things.filter(function (t) { return (t.k === 'sdoor' || t.k === 'gate') && t.i === i && t.j === j; })[0]; if (!d) return true; return d.k === 'gate' ? !!SV.gateOpen : !!SV.doors[d.id]; }
function fogUp(g) { return g && !SV.bosses[g.boss]; }
function fogAt(i, j) { var g = WORLD.FOGT && WORLD.FOGT[j * WORLD.MW + i]; return fogUp(g) ? g : null; }
function passable(i, j, y, who, px, pz) { var k = tk(i, j); if (k === 1 || k === 4) return false; if (k === 3 && !doorOpen(i, j)) return false; if (k === 2) return who === 'p';
  if (fogAt(i, j) && !(who === 'p' && G.fogPass)) return false;
  var h = px !== undefined && WORLD.RD[j * WORLD.MW + i] ? stairH(i, j, Math.max(i * TSZ, Math.min((i + 1) * TSZ - 0.001, px)), Math.max(j * TSZ, Math.min((j + 1) * TSZ - 0.001, pz))) : th(i, j);
  return h - y <= 0.6; }
function collide(o, r, who) {
  var i0 = tileOf(o.x - r), i1 = tileOf(o.x + r), j0 = tileOf(o.z - r), j1 = tileOf(o.z + r);
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { var bx0 = i * TSZ, bz0 = j * TSZ, bx1 = bx0 + TSZ, bz1 = bz0 + TSZ, nx = Math.max(bx0, Math.min(o.x, bx1)), nz = Math.max(bz0, Math.min(o.z, bz1));
    if (passable(i, j, o.y, who, nx, nz)) continue; var dx = o.x - nx, dz = o.z - nz, d = Math.hypot(dx, dz);
    if (d < r) { if (d < 1e-5) { o.x = tx(i) + (o.x > tx(i) ? 1 : -1) * (TSZ / 2 + r); } else { o.x = nx + dx / d * r; o.z = nz + dz / d * r; } } }
}
function lineClear(ax, az, bx, bz) { var dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz), n = Math.ceil(d / 0.5); for (var s = 1; s < n; s++) { var t = s / n, i = tileOf(ax + dx * t), j = tileOf(az + dz * t), k = tk(i, j); if (k === 1 || (k === 3 && !doorOpen(i, j)) || fogAt(i, j)) return false; } return true; }
function candleArea() { return 0; }

/* ---------- the look: textures per region, walls of every height, stairs as real steps, low walls, the fountain ---------- */
PAINT.dkfount = function (p) { p.fill('#3a3238'); for (var y = 0; y < 32; y += 8) p.rect(0, y, 32, 1, '#24202a'); p.speck(['#4a4248', '#2a2228'], 90); };
var CHUNK = 16, CHUNKS = [];
function buildMesh() {
  var MW = WORLD.MW, MH = WORLD.MH, rnd = srand(31), nc = Math.ceil(MW / CHUNK), ncz = Math.ceil(MH / CHUNK);
  CHUNKS.forEach(function (c) { if (c.mesh) c.mesh.free(); }); CHUNKS = [];
  var ms = []; for (var c = 0; c < nc * ncz; c++) ms.push(new R3.Mesh());
  var m = null;
  function vc(k) { var v = 0.5 * k; return [v, v, v]; }
  function face(a, b, y0, y1, T, n, k, Tup) { for (var y = y0; y < y1 - 0.01; y += TSZ) { var yy = Math.min(y1, y + TSZ), v = (yy - y) / TSZ, TT = Tup && y - y0 > 3.5 && yy < y1 - 0.5 ? Tup : T; m.quad([a[0], y, a[1]], [b[0], y, b[1]], [b[0], yy, b[1]], [a[0], yy, a[1]], [0, v, 1, v, 1, 0, 0, 0], TT, vc(k), n); } }
  function edges(i, j) { var x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ; return [[[1, 0], [x1, z1], [x1, z0]], [[-1, 0], [x0, z0], [x0, z1]], [[0, 1], [x0, z1], [x1, z1]], [[0, -1], [x1, z0], [x0, z0]]]; }
  function topOf(i, j) { var k = tk(i, j), q = j * MW + i; if (k === 2) return -12; if (k === 1 || k === 4) return WORLD.WT[q]; if (WORLD.RD[q]) return WORLD.H[q]; return th(i, j); }
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
    m = ms[Math.floor(j / CHUNK) * nc + Math.floor(i / CHUNK)];
    var k = tk(i, j), q = j * MW + i, x0 = i * TSZ, z0 = j * TSZ, x1 = x0 + TSZ, z1 = z0 + TSZ, h = th(i, j), R0 = REGIONS[REGL[WORLD.RG[q]]], TW = TL(R0.wall), TF = TL(R0.floor), sol = WORLD.SOL[q];
    if (k === 2) continue;
    if (sol === 2) { var cx = tx(i), cz = tx(j), r = 0.6, base = WORLD.WT[q] - R0.wallH; for (var s = 0; s < 10; s++) { var a0 = s / 10 * 6.283, a1 = (s + 1) / 10 * 6.283; m.quad([cx + Math.cos(a0) * r, base, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, base, cz + Math.sin(a1) * r], [cx + Math.cos(a1) * r, WORLD.WT[q], cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, WORLD.WT[q], cz + Math.sin(a0) * r], [0, 3.5, 1, 3.5, 1, 0, 0, 0], TW, vc(0.95), [Math.cos(a0 + 0.31), 0, Math.sin(a0 + 0.31)]); }
      bx3(m, cx - 0.8, base, cz - 0.8, cx + 0.8, base + 0.5, cz + 0.8, TW, 0.8); bx3(m, cx - 0.8, WORLD.WT[q] - 0.4, cz - 0.8, cx + 0.8, WORLD.WT[q], cz + 0.8, TW, 0.85);
      m.quad([x0, base, z1], [x1, base, z1], [x1, base, z0], [x0, base, z0], [0, 1, 1, 1, 1, 0, 0, 0], TF, vc(0.8), [0, 1, 0]); continue; }
    if (k === 1 || k === 4) { var top = WORLD.WT[q], Tw = sol === 1 ? TL('dkfount') : TW;
      edges(i, j).forEach(function (e) { var d = e[0], ni = i + d[0], nj = j + d[1], nt = topOf(ni, nj); if (nt >= top - 0.01) return; face(e[1], e[2], Math.max(nt, top - 40), top, Tw, [d[0], 0, d[1]], 0.82 + rnd() * 0.16, k === 1 && !sol ? (R0.upper ? TL(R0.upper) : null) : null); });
      m.quad([x0, top, z0], [x1, top, z0], [x1, top, z1], [x0, top, z1], [0, 0, 1, 0, 1, 1, 0, 1], Tw, vc(k === 4 || sol ? 0.75 : 0.55), [0, 1, 0]);
      if (k === 1 && !sol && R0.sky && top - h > 4) { // a lip round the roofs
        edges(i, j).forEach(function (e) { var d = e[0]; if (tk(i + d[0], j + d[1]) === 1) return; var a = e[1], b = e[2], ox = d[0] * 0.12, oz = d[1] * 0.12; m.quad([a[0] + ox, top - 0.35, a[1] + oz], [b[0] + ox, top - 0.35, b[1] + oz], [b[0] + ox, top + 0.15, b[1] + oz], [a[0] + ox, top + 0.15, a[1] + oz], [0, 0.25, 1, 0.25, 1, 0, 0, 0], TW, vc(0.6), [d[0], 0, d[1]]); }); }
      continue; }
    var RD = WORLD.RD[q];
    if (RD) { // four real steps a tile
      var rs = WORLD.RS[q]; for (var st = 0; st < 4; st++) { var y = h + rs * st / 4, y2 = h + rs * (st + 1) / 4, f0 = st / 4, f1 = (st + 1) / 4, P0, P1;
          function at(f, g) { if (RD === 1) return [x0 + f * TSZ, z0 + g * TSZ]; if (RD === 2) return [x1 - f * TSZ, z0 + g * TSZ]; if (RD === 3) return [x0 + g * TSZ, z0 + f * TSZ]; return [x0 + g * TSZ, z1 - f * TSZ]; }
          var a = at(f0, 0), b = at(f0, 1), c2 = at(f1, 1), d2 = at(f1, 0), up = [0, 1, 0], nrm = RD === 1 ? [-1, 0, 0] : RD === 2 ? [1, 0, 0] : RD === 3 ? [0, 0, -1] : [0, 0, 1];
          m.quad([a[0], y, a[1]], [b[0], y, b[1]], [c2[0], y, c2[1]], [d2[0], y, d2[1]], [0, 0, 1, 0, 1, 0.25, 0, 0.25], TF, vc(0.85 + (st % 2) * 0.08), up);
          if (st > 0) m.quad([a[0], y - rs / 4, a[1]], [b[0], y - rs / 4, b[1]], [b[0], y, b[1]], [a[0], y, a[1]], [0, 0.12, 1, 0.12, 1, 0, 0, 0], TW, vc(0.6), nrm); }
      var hiE = h + rs; edges(i, j).forEach(function (e) { var d = e[0], ni = i + d[0], nj = j + d[1], nk = tk(ni, nj); if (nk === 1 || nk === 4) return; var nt = topOf(ni, nj); if (WORLD.RD[nj * MW + ni] === RD) return; if (nt >= hiE - 0.01) return; face(e[1], e[2], Math.max(nt, hiE - 30), hiE, TW, [d[0], 0, d[1]], 0.7); });
      continue; }
    m.quad([x0, h, z1], [x1, h, z1], [x1, h, z0], [x0, h, z0], [0, 1, 1, 1, 1, 0, 0, 0], TF, vc(0.78 + rnd() * 0.22), [0, 1, 0]);
    edges(i, j).forEach(function (e) { var d = e[0], ni = i + d[0], nj = j + d[1], nk = tk(ni, nj); if (nk === 1 || nk === 4) return; var nt = topOf(ni, nj); if (nt >= h - 0.01) return; face(e[1], e[2], Math.max(nt, h - 30), h, TW, [d[0], 0, d[1]], 0.7); });
  }
  m = null; SOLIDS = []; FLAMES = [];
  WORLD.things.forEach(function (t) { var cx = tx(t.i), cz = tx(t.j), h = th(t.i, t.j); m = ms[Math.floor(t.j / CHUNK) * nc + Math.floor(t.i / CHUNK)];
    if (t.k === 'candle') { bx3(m, cx - 0.45, h, cz - 0.45, cx + 0.45, h + 0.25, cz + 0.45, TL('stonef'), 0.7); for (var n = 0; n < 5; n++) { var a = n / 5 * 6.283, ch = 0.5 + (n % 2) * 0.35; cyl(m, cx + Math.cos(a) * 0.22, cz + Math.sin(a) * 0.22, h + 0.25, h + 0.25 + ch, 0.06, TL('candlewax'), 1); } cyl(m, cx, cz, h + 0.25, h + 1.05, 0.1, TL('candlewax'), 1); }
    else if (t.k === 'torch') { bx3(m, cx - 0.05, h, cz - 0.05, cx + 0.05, h + 2.4, cz + 0.05, TL('steel'), 0.5); bx3(m, cx - 0.15, h + 2.4, cz - 0.15, cx + 0.15, h + 2.55, cz + 0.15, TL('steel'), 0.6); }
    else if (t.k === 'throne') { bx3(m, cx - 1.2, h, cz - 0.6, cx + 1.2, h + 0.9, cz + 0.9, TL('velvet'), 0.9); bx3(m, cx - 1.2, h, cz - 0.9, cx + 1.2, h + 4.2, cz - 0.5, TL('velvet'), 0.9); for (var p2 = 0; p2 < 7; p2++) { var px = cx - 1.6 + p2 * 0.55; cyl(m, px, cz - 0.4 + (p2 % 2) * 0.3, h, h + 0.9 + (p2 % 3) * 0.35, 0.22, TL('pillbottle'), 1); } }
    else if (t.k === 'deco') { WORLD.A = regionAt(cx, cz); var hh2 = t.top ? WORLD.WT[t.j * MW + t.i] : h; dressOne(m, t.d, cx, hh2, cz, [0, 1], srand(t.i * 31 + t.j), function (k) { return [0.5 * k, 0.5 * k, 0.5 * k]; }); WORLD.A = undefined; if (t.d === 'statue' && t.top) SOLIDS.pop(); }
    else if (t.k === 'wake') { bx3(m, cx - 0.55, h, cz - 1.15, cx + 0.55, h + 0.55, cz + 1.15, TL('crypt'), 0.8); bx3(m, cx - 0.62, h + 0.55, cz - 1.22, cx + 0.62, h + 0.68, cz + 1.22, TL('marble'), 0.7); }
    else if (t.k === 'npc' && t.who === 'saba') { bx3(m, cx - 1.6, h, cz + 0.6, cx + 1.6, h + 1.0, cz + 1.3, TL('wood'), 0.8); bx3(m, cx - 1.7, h + 2.5, cz + 0.2, cx + 1.7, h + 2.62, cz + 1.6, TL('canvas'), 0.9); [-1.6, 1.6].forEach(function (o) { bx3(m, cx + o - 0.05, h, cz + 1.25, cx + o + 0.05, h + 2.5, cz + 1.35, TL('wood'), 0.7); }); for (var b = 0; b < 4; b++) cyl(m, cx - 1.2 + b * 0.8, cz + 0.95, h + 1.0, h + 1.35, 0.12, TL(b % 2 ? 'pillbottle' : 'keg'), 1); }
  });
  WORLD.A0 = 1; dressRealm(ms, nc);
  ms.forEach(function (mm, c) { CHUNKS.push({ cx: ((c % nc) + 0.5) * CHUNK * TSZ, cz: (Math.floor(c / nc) + 0.5) * CHUNK * TSZ, mesh: mm.upload() }); });
  return { free: function () { CHUNKS.forEach(function (c) { if (c.mesh) c.mesh.free(); }); CHUNKS = []; } };
}
function drawChunks(eye, far) { CHUNKS.forEach(function (c) { if (Math.hypot(c.cx - eye[0], c.cz - eye[2]) < far + CHUNK * TSZ * 0.75) R3.draw(c.mesh, ATT); }); }
/* the clutter, per region now: against the walls, never in a corridor, never on stairs or by a candle, a door or a fog gate */
function dressRealm(ms, nc) {
  var rnd = srand(911), MW = WORLD.MW, MH = WORLD.MH, D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var used = {}; WORLD.things.forEach(function (t) { var r = t.k === 'foe' ? 0 : 2; for (var dj = -r; dj <= r; dj++) for (var di = -r; di <= r; di++) used[(t.i + di) + ',' + (t.j + dj)] = 1; (t.tiles || []).forEach(function (p) { for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) used[(p[0] + di) + ',' + (p[1] + dj)] = 1; }); });
  function vc(k) { return [0.5 * k, 0.5 * k, 0.5 * k]; }
  var keepA = WORLD.A0; WORLD.A0 = null;
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) {
    var q = j * MW + i; if (tk(i, j) !== 0 || WORLD.RD[q] || used[i + ',' + j]) continue; var h = th(i, j), R0 = REGIONS[REGL[WORLD.RG[q]]], walls = D4.filter(function (d) { return tk(i + d[0], j + d[1]) === 1 && !WORLD.SOL[(j + d[1]) * MW + i + d[0]]; });
    if (walls.length !== 1) continue; var w = walls[0], oi = i - w[0], oj = j - w[1]; if (tk(oi, oj) !== 0 || Math.abs(th(oi, oj) - h) > 0.01 || WORLD.RD[oj * MW + oi]) continue;
    var sd = [w[1], w[0]]; if (tk(i + sd[0], j + sd[1]) !== 0 || tk(i - sd[0], j - sd[1]) !== 0) continue;
    if (tk(oi - w[0], oj - w[1]) !== 0) continue; // keep three tiles of room in front
    if (rnd() > 0.3) continue;
    var m = ms[Math.floor(j / CHUNK) * nc + Math.floor(i / CHUNK)], list = R0.dress, k = list[Math.floor(rnd() * list.length)];
    WORLD.A = R0; dressOne(m, k, tx(i) + w[0] * 0.45, h, tx(j) + w[1] * 0.45, w, rnd, vc); used[i + ',' + j] = 1;
  }
  for (j = 1; j < MH - 1; j++) for (i = 1; i < MW - 1; i++) { var q2 = j * MW + i; if (tk(i, j) !== 0 || WORLD.RD[q2]) continue; var hh = th(i, j), R1 = REGIONS[REGL[WORLD.RG[q2]]], m2 = ms[Math.floor(j / CHUNK) * nc + Math.floor(i / CHUNK)];
    D4.forEach(function (d) { if (tk(i + d[0], j + d[1]) !== 1 || WORLD.SOL[(j + d[1]) * MW + i + d[0]] || (i * 7 + j * 3) % 7 !== 0 || R1.id === 'grave' || R1.id === 'depths') return; var cx = tx(i) + d[0] * (TSZ / 2 - 0.04), cz = tx(j) + d[1] * (TSZ / 2 - 0.04), sx = -d[1], sz = d[0], wd = 0.6, T = TL(R1.id === 'cath' || (R1.id === 'keep' && (i + j) % 2) ? 'banner2' : 'banner');
      m2.quad([cx + sx * wd, hh + 2.4, cz + sz * wd], [cx - sx * wd, hh + 2.4, cz - sz * wd], [cx - sx * wd, hh + 5.4, cz - sz * wd], [cx + sx * wd, hh + 5.4, cz + sz * wd], [0, 1.6, 1, 1.6, 1, 0, 0, 0], T, vc(0.95), [-d[0], 0, -d[1]]);
      bx3(m2, cx - sx * 0.7 - d[0] * 0.05, hh + 5.4, cz - sz * 0.7 - d[1] * 0.05, cx + sx * 0.7 + d[0] * 0.02, hh + 5.5, cz + sz * 0.7 + d[1] * 0.02, TL('steel'), 0.6); });
    if (rnd() < 0.04 && R1.id !== 'grave') { var bx = tx(i) + (rnd() - 0.5), bz = tx(j) + (rnd() - 0.5), s = 0.4 + rnd() * 0.5; m2.quad([bx - s, hh + 0.02, bz + s], [bx + s, hh + 0.02, bz + s], [bx + s, hh + 0.02, bz - s], [bx - s, hh + 0.02, bz - s], [0, 1, 1, 1, 1, 0, 0, 0], TL('blood1'), vc(0.8), [0, 1, 0]); }
    if (R1.id === 'grave' && rnd() < 0.07 && !used[i + ',' + j]) { var gx = tx(i) + (rnd() - 0.5) * 0.6, gz = tx(j) + (rnd() - 0.5) * 0.6; bx3(m2, gx - 0.38, hh, gz - 0.1, gx + 0.38, hh + 0.9 + rnd() * 0.4, gz + 0.1, TL('grave'), 0.9); SOLIDS.push({ x: gx, z: gz, y: hh, r: 0.35 }); used[i + ',' + j] = 1; }
  }
  WORLD.A0 = keepA; WORLD.A = undefined;
}
/* WORLD.A is the region you stand in (bosses, songs and the old code read it) */
var realmParse = parseArea;
parseArea = function () { var w = realmParse(); Object.defineProperty(w, 'A', { get: function () { return w._A || (P ? regionAt(P.x, P.z) : REGIONS.A); }, set: function (v) { w._A = v; }, configurable: true }); return w; };
