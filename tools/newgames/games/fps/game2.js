/* ---------- Cumstein update 132 (his playtest: aim up and down, far too dark to see, more decorations). Look up and down
   with the right stick / mouse / R and F, shots and rockets follow your aim; every floor is lit properly (more lamps, a
   fill light round you, a lighter fog); each room is dressed: pillars in big rooms, barrels, crates, tables with candles,
   bookshelves, goo vats, wall torches that light the room, and the sprites from our other games stood about Doom style
   (skulls, ribs, cages, altars, shrines, crucibles, feasts, chandeliers). Big things are solid. ---------- */
PAINT.barrel3 = function (p) { p.fill('#5a3a24'); p.rect(0, 4, 32, 2, '#2a2a2e'); p.rect(0, 26, 32, 2, '#2a2a2e'); p.speck(['#4a2a18', '#6a4a2e'], 80); for (var x = 0; x < 32; x += 6) p.rect(x, 0, 1, 32, '#3a2214'); };
PAINT.crate3 = function (p) { p.fill('#8a6a3a'); p.rect(0, 0, 32, 2, '#4a3418'); p.rect(0, 30, 32, 2, '#4a3418'); p.rect(0, 0, 2, 32, '#4a3418'); p.rect(30, 0, 2, 32, '#4a3418'); for (var i = 2; i < 30; i++) { p.px(i, i, '#5a4220'); p.px(i, 31 - i, '#5a4220'); } };
PAINT.table3 = function (p) { p.fill('#4a2a18'); for (var y = 0; y < 32; y += 5) p.rect(0, y, 32, 1, '#3a2010'); p.speck(['#5a3a24'], 40); };
PAINT.vat = function (p) { p.fill('#3a3a40'); p.rect(0, 0, 32, 3, '#7a2ad8'); for (var x = 2; x < 32; x += 8) p.rect(x, 0, 2, 32, '#2a2a30'); p.speck(['#4a4a50'], 40); };
PAINT.vatgoo = function (p) { p.fill('#7a2ad8'); p.speck(['#c08aff', '#5a1a9a'], 120); };
PAINT.rug = function (p) { p.fill('#6a0a10'); p.rect(2, 2, 28, 28, '#8a0a12'); p.rect(4, 4, 24, 24, '#6a0a10'); p.rect(12, 12, 8, 8, '#ffe36a'); p.rect(14, 14, 4, 4, '#6a0a10'); p.rect(0, 0, 32, 1, '#ffe36a'); p.rect(0, 31, 32, 1, '#ffe36a'); };
PAINT.sconce = function (p) { p.fill('#2a2a2e'); p.rect(10, 0, 12, 32, '#3a3a40'); p.rect(12, 2, 8, 6, '#5a5a60'); };
PAINT.bookcase = PAINT.books;
var SOLIDS = [], DECO = [], TORCH = [];
function decorate(m) {
  var F = FLOORS[G.fl], rnd = srand(7000 + G.fl * 131); SOLIDS = []; DECO = []; TORCH = [];
  function c(k) { return [0.5 * k, 0.5 * k, 0.5 * k]; }
  function box(x0, y0, z0, x1, y1, z1, T, Tt, k) { var cc = c(k || 1), uv = [0, 1, 1, 1, 1, 0, 0, 0];
    m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], uv, T, cc, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], uv, T, cc, [0, 0, -1]);
    m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], uv, T, cc, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], uv, T, cc, [-1, 0, 0]); m.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], uv, Tt || T, cc, [0, 1, 0]); }
  function cyl(cx, cz, y0, y1, r, T, Tt) { for (var s = 0; s < 10; s++) { var a0 = s / 10 * 6.283, a1 = (s + 1) / 10 * 6.283; m.quad([cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r], [0, 1, 1, 1, 1, 0, 0, 0], T, c(1), [Math.cos(a0 + 0.31), 0, Math.sin(a0 + 0.31)]); if (Tt) m.quad([cx, y1, cz], [cx + Math.cos(a1) * r, y1, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, y1, cz + Math.sin(a0) * r], [cx, y1, cz], [0.5, 0.5, 1, 0, 0, 0, 0.5, 0.5], Tt, c(1), [0, 1, 0]); } }
  var busy = {}; THINGS.forEach(function (t) { busy[tileOf(t.x) + ',' + tileOf(t.z)] = 1; }); FOE.forEach(function (f) { busy[tileOf(f.x) + ',' + tileOf(f.z)] = 1; });
  function nearDoor(i, j) { for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) { var k = inMap(i + di, j + dj) ? K[idx(i + di, j + dj)] : 1; if (k === 2 || k === 3 || k === 5 || k === 4) return true; } return false; }
  var theme = { 'THE CELLS': ['p_skulls', 'p_ribs', 'p_cell', 'barrel', 'crate'], 'THE KITCHENS': ['p_feast', 'barrel', 'crate', 'table', 'p_crucible'], 'THE CHAPEL': ['p_altar', 'p_shrine', 'table', 'p_skulls', 'rug'],
    "THE JAILER'S HALL": ['p_cell', 'p_skulls', 'barrel', 'p_ribs', 'crate'], 'THE GOO WORKS': ['vat', 'p_heart0', 'barrel', 'p_creampool', 'crate'], 'THE LIBRARY': ['books', 'table', 'books', 'rug', 'p_skulls'],
    'THE GOLEM PITS': ['p_crucible', 'p_ribs', 'barrel', 'vat', 'p_skulls'], "BLUMHEAD'S THRONE": ['p_shrine', 'p_heart0', 'rug', 'p_altar', 'vat'] }[F.name] || ['barrel', 'crate'];
  ROOMS.forEach(function (R0, n) {
    if (R0.w >= 6 && R0.h >= 6) [[R0.x + 1, R0.y + 1], [R0.x + R0.w - 2, R0.y + 1], [R0.x + 1, R0.y + R0.h - 2], [R0.x + R0.w - 2, R0.y + R0.h - 2]].forEach(function (q) { if (busy[q[0] + ',' + q[1]] || nearDoor(q[0], q[1])) return; var x = tx(q[0]), z = tx(q[1]); cyl(x, z, 0, WH, 0.32, TL(F.wall2)); box(x - 0.42, 0, z - 0.42, x + 0.42, 0.3, z + 0.42, TL(F.wall)); box(x - 0.42, WH - 0.25, z - 0.42, x + 0.42, WH, z + 0.42, TL(F.wall)); SOLIDS.push({ x: x, z: z, r: 0.42 }); busy[q[0] + ',' + q[1]] = 1; });
    // things along the walls
    var edge = []; for (var i = R0.x; i < R0.x + R0.w; i++) { edge.push([i, R0.y, 0, -1]); edge.push([i, R0.y + R0.h - 1, 0, 1]); } for (var j = R0.y + 1; j < R0.y + R0.h - 1; j++) { edge.push([R0.x, j, -1, 0]); edge.push([R0.x + R0.w - 1, j, 1, 0]); }
    edge.forEach(function (e) { var i = e[0], j = e[1]; if (busy[i + ',' + j] || nearDoor(i, j) || (i === R0.cx && j === R0.cy)) return; var r = rnd(); var wx = tx(i) + e[2] * 0.45, wz = tx(j) + e[3] * 0.45;
      if (inMap(i + e[2], j + e[3]) && K[idx(i + e[2], j + e[3])] === 1 && r < 0.12) { TORCH.push({ x: tx(i) + e[2] * (TSZ / 2 - 0.12), z: tx(j) + e[3] * (TSZ / 2 - 0.12), y: 1.9 }); var tx0 = tx(i) + e[2] * (TSZ / 2 - 0.02), tz0 = tx(j) + e[3] * (TSZ / 2 - 0.02); box(tx0 - 0.08 - Math.abs(e[3]) * 0.04, 1.4, tz0 - 0.08 - Math.abs(e[2]) * 0.04, tx0 + 0.08 + Math.abs(e[3]) * 0.04, 1.85, tz0 + 0.08 + Math.abs(e[2]) * 0.04, TL('sconce')); return; }
      var out = inMap(i + e[2], j + e[3]) ? K[idx(i + e[2], j + e[3])] : 1, side1 = inMap(i + e[3], j + e[2]) ? K[idx(i + e[3], j + e[2])] : 1, side2 = inMap(i - e[3], j - e[2]) ? K[idx(i - e[3], j - e[2])] : 1;
      if (out !== 1 || (side1 !== 0 && side1 !== 1) || (side2 !== 0 && side2 !== 1)) return;
      if (r > 0.45) return; var k = theme[Math.floor(rnd() * theme.length)]; busy[i + ',' + j] = 1;
      if (k === 'barrel') { cyl(wx, wz, 0, 1.0, 0.36, TL('barrel3'), TL('barrel3')); SOLIDS.push({ x: wx, z: wz, r: 0.4 }); }
      else if (k === 'crate') { box(wx - 0.45, 0, wz - 0.45, wx + 0.45, 0.9, wz + 0.45, TL('crate3')); if (rnd() < 0.5) box(wx - 0.3, 0.9, wz - 0.3, wx + 0.3, 1.5, wz + 0.3, TL('crate3')); SOLIDS.push({ x: wx, z: wz, r: 0.55 }); }
      else if (k === 'table') { box(wx - 0.6, 0.72, wz - 0.4, wx + 0.6, 0.82, wz + 0.4, TL('table3')); [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].forEach(function (o) { box(wx + o[0] - 0.05, 0, wz + o[1] - 0.05, wx + o[0] + 0.05, 0.72, wz + o[1] + 0.05, TL('table3')); }); for (var cn = 0; cn < 3; cn++) { var cx = wx + (cn - 1) * 0.3, cz = wz + (rnd() - 0.5) * 0.3; box(cx - 0.04, 0.82, cz - 0.04, cx + 0.04, 1.05, cz + 0.04, TL('white')); DECO.push({ k: 'flame', x: cx, z: cz, y: 1.1 }); } SOLIDS.push({ x: wx, z: wz, r: 0.6 }); }
      else if (k === 'books') { var bx0 = tx(i) + e[2] * 0.75, bz0 = tx(j) + e[3] * 0.75, hw = e[2] ? 0.25 : 1.1, hd = e[2] ? 1.1 : 0.25; box(bx0 - hw, 0, bz0 - hd, bx0 + hw, 2.3, bz0 + hd, TL('books'), TL('table3')); SOLIDS.push({ x: bx0, z: bz0, r: 0.6 }); }
      else if (k === 'vat') { cyl(wx, wz, 0, 1.3, 0.6, TL('vat'), TL('vatgoo')); SOLIDS.push({ x: wx, z: wz, r: 0.62 }); DECO.push({ k: 'goo', x: wx, z: wz, y: 1.35 }); }
      else if (k === 'rug') { var rx = tx(R0.cx), rz = tx(R0.cy) + 1.2; m.quad([rx - 1.1, 0.02, rz + 0.8], [rx + 1.1, 0.02, rz + 0.8], [rx + 1.1, 0.02, rz - 0.8], [rx - 1.1, 0.02, rz - 0.8], [0, 1, 1, 1, 1, 0, 0, 0], TL('rug'), c(1), [0, 1, 0]); }
      else { DECO.push({ k: 'spr', n: k, x: wx, z: wz, h: k === 'p_cell' ? 2.0 : k === 'p_altar' || k === 'p_shrine' ? 1.4 : 0.9 }); if (k === 'p_cell' || k === 'p_altar' || k === 'p_shrine' || k === 'p_crucible') SOLIDS.push({ x: wx, z: wz, r: 0.5 }); }
    });
    if (R0.w >= 5 && R0.h >= 5 && rnd() < 0.6) DECO.push({ k: 'spr', n: 'p_chand', x: tx(R0.cx), z: tx(R0.cy), h: 0.9, y: WH - 0.95 });
  });
}
function solidsPush(o, r) { for (var i = 0; i < SOLIDS.length; i++) { var s = SOLIDS[i], dx = o.x - s.x, dz = o.z - s.z, d = Math.hypot(dx, dz), mm = r + s.r; if (d < mm && d > 1e-4) { o.x = s.x + dx / d * mm; o.z = s.z + dz / d * mm; } } }
function drawDeco(bb, sq) {
  DECO.forEach(function (d) { if (Math.abs(d.x - P.x) > 26 || Math.abs(d.z - P.z) > 26) return; if (d.k === 'spr') bb(d.n, d.x, d.z, d.h, d.y || 0); });
}
function drawDecoGlow(sq) {
  DECO.forEach(function (d, n) { if (Math.abs(d.x - P.x) > 22 || Math.abs(d.z - P.z) > 22) return; if (d.k === 'flame') sq(d.x, d.y + Math.sin(G.t * 14 + n) * 0.01, d.z, 0.05, [0.7, 0.45, 0.15]); else if (d.k === 'goo') sq(d.x, d.y + Math.sin(G.t * 2 + n) * 0.05, d.z, 0.25, [0.35, 0.1, 0.55]); });
  TORCH.forEach(function (t, n) { if (Math.abs(t.x - P.x) > 24 || Math.abs(t.z - P.z) > 24) return; var s = 0.13 + Math.sin(G.t * 13 + n * 2) * 0.02; sq(t.x, t.y, t.z, s, [0.8, 0.45, 0.12]); sq(t.x, t.y + 0.08, t.z, s * 0.6, [0.8, 0.75, 0.35]); });
}
/* your things: the pause screen is a proper inventory */
var GUNICON = { sausage: 'it_sword', pistol: 'it_cup', shotgun: 'it_pie', swarm: 'it_charm', nado: 'it_moon' };
function invMenu() { if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {} var p = P;
  var sl = GUNS.map(function (g, gi) { if (!p.guns[g.id]) return { spr: GUNICON[g.id], name: '???', desc: 'Not found yet.', dis: true }; return { spr: GUNICON[g.id], name: g.n, desc: (g.ammo ? 'Uses ' + g.ammo + '. ' : 'Needs no ammo. ') + 'Damage ' + g.dmg + (g.pellets ? ' x' + g.pellets : '') + '.', count: g.ammo ? p.ammo[g.ammo] : null, gold: p.gun === gi, tag: p.gun === gi ? 'IN HAND' : null, def: p.gun === gi, act: p.gun === gi ? 'IN HAND' : 'HOLD', dis: p.gun === gi, fn: function () { p.gun = gi; invMenu(); } }; });
  sl.push(p.key ? { spr: 'gr_key', name: 'The Gold Key', desc: 'Opens the gold door to the lift room.' } : null, { spr: 'gr_shield', name: 'Condoms', desc: 'Armour. Takes over half of every hit.', count: p.arm }, { spr: 'gr_coin5', name: 'Treasure', desc: 'Score ' + p.score + '.', count: G.got || 0 });
  KIT.inv({ title: FLOORS[G.fl].n + ': ' + FLOORS[G.fl].name, cols: 4, min: 8, slots: sl, tabs: [{ label: 'THINGS', on: true, fn: invMenu }, { label: 'SYSTEM', fn: sysMenu }], stats: [['HEALTH', Math.max(0, Math.round(p.hp))], ['KILLS', G.kills + '/' + G.total], ['SECRETS', G.found + '/' + G.secrets]], close: KIT.closeMenu }); }
function sysMenu() { KIT.menu({ cls: 'clear', title: 'Paused', sub: FLOORS[G.fl].n + ': ' + FLOORS[G.fl].name, items: [{ label: 'CARRY ON', def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }, { label: 'BACK', back: true, fn: invMenu }] }); }
