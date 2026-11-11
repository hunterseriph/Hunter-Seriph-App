/* ---------- update 132: the places dressed (his ask: more decorations). Each area has its own clutter laid against the
   walls from the map (rubble, barrels, crates, graves, coffins, statues, pews, cages, giant pill bottles, ribcages, chains,
   candle clusters with real flames), banners hung on the walls and blood on the floors. The big pieces are solid
   (SOLIDS, pushed out of in 2b-moves.js); nothing is ever put on a path tile that has a wall on both sides. ---------- */
PAINT.banner = function (p) { p.fill('#5a0810'); p.rect(0, 0, 32, 3, '#ffe36a'); p.rect(0, 29, 32, 3, '#ffe36a'); for (var x = 0; x < 32; x += 8) p.rect(x + 2, 29, 4, 3, '#5a0810'); p.rect(13, 9, 6, 6, '#f1e0b0'); p.rect(14, 6, 4, 3, '#f1e0b0'); p.rect(15, 4, 2, 2, '#f1e0b0'); p.rect(12, 15, 8, 2, '#c4121c'); p.speck(['#4a060c', '#6a0a14'], 60); };
PAINT.banner2 = function (p) { p.fill('#1a0a2a'); p.rect(0, 0, 32, 3, '#c8a0ff'); p.rect(10, 8, 12, 12, '#5a1a6a'); p.rect(13, 11, 6, 6, '#c8a0ff'); p.speck(['#140820', '#24103a'], 60); };
PAINT.pillbottle = function (p) { p.fill('#c86a1a'); p.speck(['#b85a10', '#d87a2a'], 80); p.rect(0, 10, 32, 12, '#f1e7d0'); p.rect(4, 13, 24, 2, '#12040a'); p.rect(4, 17, 16, 2, '#c4121c'); };
PAINT.pillcap = function (p) { p.fill('#f1e7d0'); for (var x = 0; x < 32; x += 4) p.rect(x, 0, 2, 32, '#d8ccb0'); };
var FLAMES = [];
var DRESS = {
  ruins: ['rubble', 'barrel', 'crates', 'grave', 'candles', 'statue', 'skulls', 'rubble', 'barrel'],
  cath: ['pews', 'candles', 'statue', 'coffin', 'candles', 'pews', 'chains'],
  depths: ['skulls', 'ribs', 'cage', 'coffin', 'candles', 'rubble', 'skulls', 'chains'],
  keep: ['pills', 'candles', 'statue', 'crates', 'pills', 'chains', 'barrel']
};
function dressArea(m) {
  var A = WORLD.A, rnd = srand(911 + WORLD.ai * 37), MW = WORLD.MW, MH = WORLD.MH, list = DRESS[A.id] || DRESS.ruins, D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  SOLIDS = []; FLAMES = [];
  var used = {}; WORLD.things.forEach(function (t) { for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) used[(t.i + di) + ',' + (t.j + dj)] = 1; });
  function vc(k) { return [0.5 * k, 0.5 * k, 0.5 * k]; }
  for (var j = 1; j < MH - 1; j++) for (var i = 1; i < MW - 1; i++) {
    if (tk(i, j) !== 0 || used[i + ',' + j]) continue; var h = th(i, j), walls = D4.filter(function (d) { return tk(i + d[0], j + d[1]) === 1; });
    if (walls.length !== 1) continue; var opp = tk(i - walls[0][0], j - walls[0][1]); if (opp !== 0 || th(i - walls[0][0], j - walls[0][1]) !== h) continue;
    // never block a one-tile corridor: the tiles beside along the wall must be open too
    var sd = [walls[0][1], walls[0][0]]; if (tk(i + sd[0], j + sd[1]) !== 0 && tk(i - sd[0], j - sd[1]) !== 0) continue;
    if (rnd() > 0.34) continue;
    var w = walls[0], k = list[Math.floor(rnd() * list.length)], cx = tx(i) + w[0] * 0.45, cz = tx(j) + w[1] * 0.45, yaw = Math.atan2(-w[0], -w[1]);
    dressOne(m, k, cx, h, cz, w, rnd, vc); used[i + ',' + j] = 1;
  }
  // banners on long walls, blood on the floor
  for (j = 1; j < MH - 1; j++) for (i = 1; i < MW - 1; i++) { if (tk(i, j) !== 0) continue; var hh = th(i, j);
    D4.forEach(function (d) { if (tk(i + d[0], j + d[1]) !== 1 || (i * 7 + j * 3) % 6 !== 0) return; var cx = tx(i) + d[0] * (TSZ / 2 - 0.04), cz = tx(j) + d[1] * (TSZ / 2 - 0.04), sx = -d[1], sz = d[0], wd = 0.6, T = TL(A.id === 'cath' || A.id === 'keep' && (i + j) % 2 ? 'banner2' : 'banner');
      m.quad([cx + sx * wd, hh + 2.4, cz + sz * wd], [cx - sx * wd, hh + 2.4, cz - sz * wd], [cx - sx * wd, hh + 5.4, cz - sz * wd], [cx + sx * wd, hh + 5.4, cz + sz * wd], [0, 1.6, 1, 1.6, 1, 0, 0, 0], T, vc(0.95), [-d[0], 0, -d[1]]);
      bx3(m, cx - sx * 0.7 - d[0] * 0.05, hh + 5.4, cz - sz * 0.7 - d[1] * 0.05, cx + sx * 0.7 + d[0] * 0.02, hh + 5.5, cz + sz * 0.7 + d[1] * 0.02, TL('steel'), 0.6); });
    if (rnd() < 0.05) { var bx = tx(i) + (rnd() - 0.5), bz = tx(j) + (rnd() - 0.5), s = 0.4 + rnd() * 0.5; m.quad([bx - s, hh + 0.02, bz + s], [bx + s, hh + 0.02, bz + s], [bx + s, hh + 0.02, bz - s], [bx - s, hh + 0.02, bz - s], [0, 1, 1, 1, 1, 0, 0, 0], TL('blood1'), vc(0.8), [0, 1, 0]); } }
}
function dressOne(m, k, cx, h, cz, w, rnd, vc) {
  var T = TL;
  if (k === 'rubble') { for (var q = 0; q < 4; q++) { var x = cx + (rnd() - 0.5) * 1.2, z = cz + (rnd() - 0.5) * 1.2, s = 0.12 + rnd() * 0.22; bx3(m, x - s, h, z - s, x + s, h + s * 1.2, z + s, T(WORLD.A.wall), 0.7); } }
  else if (k === 'barrel') { cyl(m, cx, cz, h, h + 0.95, 0.34, T('keg'), 0.9); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.4 }); if (rnd() < 0.5) { cyl(m, cx + 0.6, cz + 0.2, h, h + 0.95, 0.34, T('keg'), 0.8); SOLIDS.push({ x: cx + 0.6, z: cz + 0.2, y: h, r: 0.4 }); } }
  else if (k === 'crates') { bx3(m, cx - 0.45, h, cz - 0.45, cx + 0.45, h + 0.9, cz + 0.45, T('crate'), 0.9); if (rnd() < 0.6) bx3(m, cx - 0.3, h + 0.9, cz - 0.3, cx + 0.3, h + 1.5, cz + 0.3, T('crate'), 0.8); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.6 }); }
  else if (k === 'grave') { var sx = -w[1], sz = w[0]; bx3(m, cx - 0.35 * Math.abs(sx) - 0.08 * Math.abs(w[0]), h, cz - 0.35 * Math.abs(sz) - 0.08 * Math.abs(w[1]), cx + 0.35 * Math.abs(sx) + 0.08 * Math.abs(w[0]), h + 1.1, cz + 0.35 * Math.abs(sz) + 0.08 * Math.abs(w[1]), T('grave'), 0.9); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.4 }); }
  else if (k === 'candles') { for (var c = 0; c < 5; c++) { var x2 = cx + (rnd() - 0.5) * 0.9, z2 = cz + (rnd() - 0.5) * 0.9, ch = 0.2 + rnd() * 0.5; cyl(m, x2, z2, h, h + ch, 0.05, T('candle'), 1); FLAMES.push({ x: x2, y: h + ch + 0.08, z: z2 }); } }
  else if (k === 'statue') { bx3(m, cx - 0.5, h, cz - 0.5, cx + 0.5, h + 0.7, cz + 0.5, T('marble'), 0.85); cyl(m, cx, cz, h + 0.7, h + 2.3, 0.28, T('marble'), 0.95); bx3(m, cx - 0.42, h + 1.9, cz - 0.12, cx + 0.42, h + 2.1, cz + 0.12, T('marble'), 0.9); var hd = 0.2; bx3(m, cx - hd, h + 2.3, cz - hd, cx + hd, h + 2.75, cz + hd, T('marble'), 1); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.7 }); }
  else if (k === 'skulls') { for (var s2 = 0; s2 < 5; s2++) { var x3 = cx + (rnd() - 0.5) * 1.0, z3 = cz + (rnd() - 0.5) * 1.0, r = 0.1 + rnd() * 0.05; bx3(m, x3 - r, h, z3 - r, x3 + r, h + r * 1.8, z3 + r, T('bone'), 1); } }
  else if (k === 'coffin') { var along = w[0] !== 0; bx3(m, cx - (along ? 0.3 : 0.9), h, cz - (along ? 0.9 : 0.3), cx + (along ? 0.3 : 0.9), h + 0.5, cz + (along ? 0.9 : 0.3), T('crypt'), 0.8); bx3(m, cx - (along ? 0.32 : 0.92), h + 0.5, cz - (along ? 0.92 : 0.32), cx + (along ? 0.32 : 0.92), h + 0.58, cz + (along ? 0.92 : 0.32), T('wood'), 0.7); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.6 }); }
  else if (k === 'pews') { var al = w[0] !== 0; bx3(m, cx - (al ? 0.3 : 0.95), h + 0.4, cz - (al ? 0.95 : 0.3), cx + (al ? 0.3 : 0.95), h + 0.5, cz + (al ? 0.95 : 0.3), T('wood'), 0.8); bx3(m, cx - (al ? 0.3 : 0.95) + w[0] * 0.25, h + 0.5, cz - (al ? 0.95 : 0.3) + w[1] * 0.25, cx + (al ? 0.3 : 0.95) + w[0] * 0.05, h + 1.1, cz + (al ? 0.95 : 0.3) + w[1] * 0.05, T('wood'), 0.75); [-0.8, 0.8].forEach(function (o) { var ox = al ? 0 : o, oz = al ? o : 0; bx3(m, cx + ox - 0.05, h, cz + oz - 0.25, cx + ox + 0.05, h + 0.4, cz + oz + 0.25, T('wood'), 0.6); }); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.55 }); }
  else if (k === 'chains') { for (var n = 0; n < 3; n++) { var x4 = cx + (n - 1) * 0.4, z4 = cz, len = 1.5 + rnd() * 2.5; for (var l = 0; l < len; l += 0.18) bx3(m, x4 - 0.03, WALLH - 0.6 - l - 0.14, z4 - 0.03, x4 + 0.03, WALLH - 0.6 - l, z4 + 0.03, T('steel'), 0.6); } }
  else if (k === 'cage') { var r2 = 0.55; for (var b = 0; b < 8; b++) { var a = b / 8 * 6.283; bx3(m, cx + Math.cos(a) * r2 - 0.03, h, cz + Math.sin(a) * r2 - 0.03, cx + Math.cos(a) * r2 + 0.03, h + 2.0, cz + Math.sin(a) * r2 + 0.03, T('steel'), 0.6); } bx3(m, cx - r2, h + 2.0, cz - r2, cx + r2, h + 2.1, cz + r2, T('rust'), 0.7); bx3(m, cx - 0.2, h, cz - 0.15, cx + 0.2, h + 0.25, cz + 0.15, T('bone'), 0.9); SOLIDS.push({ x: cx, z: cz, y: h, r: 0.62 }); }
  else if (k === 'ribs') { for (var rb = 0; rb < 6; rb++) { var zz = (rb - 2.5) * 0.22, sxx = -w[1], szz = w[0]; for (var seg = 0; seg < 6; seg++) { var a0 = seg / 6 * Math.PI, rx = Math.cos(a0) * 0.5, ry = Math.sin(a0) * 0.7; bx3(m, cx + sxx * zz + w[0] * 0 + (sxx ? 0 : rx) - 0.04, h + ry, cz + szz * zz + (szz ? 0 : rx) - 0.04, cx + sxx * zz + (sxx ? 0 : rx) + 0.04, h + ry + 0.1, cz + szz * zz + (szz ? 0 : rx) + 0.04, T('bone'), 1); } } SOLIDS.push({ x: cx, z: cz, y: h, r: 0.6 }); }
  else if (k === 'pills') { cyl(m, cx, cz, h, h + 1.4, 0.42, T('pillbottle'), 0.95); cyl(m, cx, cz, h + 1.4, h + 1.65, 0.36, T('pillcap'), 1); for (var pq = 0; pq < 4; pq++) { var px = cx + (rnd() - 0.5) * 1.4, pz = cz + (rnd() - 0.5) * 1.4; bx3(m, px - 0.1, h, pz - 0.05, px + 0.1, h + 0.08, pz + 0.05, T('white'), 0.9); } SOLIDS.push({ x: cx, z: cz, y: h, r: 0.48 }); }
}
