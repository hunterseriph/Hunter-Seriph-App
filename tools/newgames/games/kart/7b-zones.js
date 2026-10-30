/* =====================================================================================================
   THE PARTS OF EACH PLACE (zones for the full courses). ZT() makes a theme from a short description:
   tiles, an optional ceiling, lights, props placed along the road, and a landmark function for the
   one-off things (a statue, a big sign, the throne). Props:
     bill   sprites standing on the verge or past the wall      lamp   lamp posts
     bldg   buildings / blocks past the wall                     tree   trees      rock  boulders
     arch   two posts and a beam right over the road             pipe   a pipe across over the road
     pillar a column past the wall                               decal  shop fronts stuck on blocks
   ===================================================================================================== */
function ZT(o) {
  var th = { dust: o.dust, wallAt: o.wallAt, roadScroll: o.roadScroll, groundScroll: o.groundScroll, init: o.init, step: o.step, kartStep: o.kartStep, drawDyn: o.drawDyn, drawBills: o.drawBills };
  th.tiles = function (A, def) { o.tiles(A, def); };
  th.scen = function (B, def) {
    var T = B.T;
    if (o.ceil) for (var i = 0; i < T.N; i += o.ceil.every) B.beam(i, o.ceil.h, o.ceil.tile || 'beam', o.ceil.w || 1.2);
    (o.lights || []).forEach(function (l) { for (var i = l.at || 4; i < T.N; i += l.every) { var q = T.S[i]; (l.sides ? [1, -1] : [0]).forEach(function (sd) { var p = sd ? B.side(q, sd, l.dist === undefined ? -1 : l.dist) : q; B.light(p.x, q.y + (l.h || 5), p.z, l.r || 13, l.col, l.halo === undefined ? null : l.halo); }); } });
    (o.props || []).forEach(function (pr, pi) { placeProp(B, pr, pi); });
    if (o.scen) o.scen(B, def);
  };
  return th;
}
function rr(B, v) { return Array.isArray(v) ? v[0] + B.rnd() * (v[1] - v[0]) : v; }
function pickOf(B, v, i) { return Array.isArray(v) ? (typeof i === 'number' ? v[i % v.length] : v[Math.floor(B.rnd() * v.length)]) : v; }
function placeProp(B, pr, pi) {
  var T = B.T, sides = pr.side ? [pr.side] : [1, -1], every = pr.every || 20, n = 0;
  if (pr.k === 'arch' || pr.k === 'pipe') {
    for (var i = pr.at || 3; i < T.N - 2; i += Math.max(1, Math.round(every / STEP))) {
      var q = T.S[i], e = T.edge + 0.7, h = rr(B, pr.h || 7), ry = Math.atan2(q.tz, q.tx), col = pr.col;
      if (pr.k === 'pipe') { var a = B.side(q, 1, -0.5), b = B.side(q, -1, -0.5); B.hcyl(a.x, q.y + h, a.z, b.x, q.y + h, b.z, pr.r || 0.45, pr.tile || 'pipe', col); continue; }
      [1, -1].forEach(function (sd) { var x = q.x + q.nx * (e + 0.6) * sd, z = q.z + q.nz * (e + 0.6) * sd; B.box(x, q.y - 0.5, z, pr.w || 0.9, pr.w || 0.9, h + 0.5, ry, pr.tile || 'trim', pr.tile || 'trim', col); });
      B.box(q.x, q.y + h - (pr.thick || 0.8), q.z, pr.thick || 0.8, (e + 1.1) * 2, pr.thick || 0.8, ry, pr.top || pr.tile || 'trim', pr.top || pr.tile || 'trim', col);
      if (pr.light) B.light(q.x, q.y + h - 1, q.z, pr.light.r || 12, pr.light.col, pr.light.halo || null);
    }
    return;
  }
  B.along(every, function (q, sd, i) {
    if (sides.indexOf(sd) < 0) return; if (pr.from !== undefined && i < pr.from * T.N) return; if (pr.to !== undefined && i > pr.to * T.N) return;
    if (pr.chance !== undefined && B.rnd() > pr.chance) return;
    var dist = rr(B, pr.dist === undefined ? (pr.k === 'bill' ? -1.5 : pr.k === 'lamp' ? 0.8 : 6) : pr.dist), p;
    if (pr.k === 'bill' || pr.k === 'lamp' || dist < 0) p = B.side(q, sd, dist); else { p = inPlace(B, q, sd, dist, pr.r === undefined ? 4 : pr.r); if (!p) return; }
    n++;
    if (pr.k === 'bill') { var spr = typeof pr.spr === 'function' ? pr.spr(i, n) : pickOf(B, pr.spr, n); if (!KIT.has || KIT.has(spr)) B.bill(p.x, p.y + (pr.dy || 0), p.z, spr, rr(B, pr.sc || 0.07), pr.anim ? { anim: pr.anim(spr, i) } : null); }
    else if (pr.k === 'lamp') lamp(B, p.x, p.y, p.z, pr.h || 4.5, pr.glow);
    else if (pr.k === 'bldg') { var w = rr(B, pr.w || [8, 12]), h = rr(B, pr.h || [8, 20]); B.box(p.x, p.y - 0.5, p.z, w, rr(B, pr.d || 8), h, p.face + Math.PI / 2, pickOf(B, pr.tile || 'wall', n), pr.roof || 'trim', pr.col, pr.uvk); if (pr.decal) { var f = pickOf(B, pr.decal, n), sz = KIT.size(f), a = ahead(p, (pr.d ? rr(B, pr.d) : 8) / 2 + 0.05); if (decalFree(B, a.x, a.z, sz.w * (pr.ds || 0.1))) B.decal(a.x, p.y - 0.5, a.z, sz.w * (pr.ds || 0.1), sz.h * (pr.ds || 0.1), p.face + Math.PI / 2, f); } }
    else if (pr.k === 'tree') B.tree(p.x, p.y - 0.4, p.z, rr(B, pr.h || [7, 12]), pr.trunk || 'bark', pr.leaf || 'leaf');
    else if (pr.k === 'rock') { var s = rr(B, pr.s || [1.5, 4]); B.cyl(p.x, p.y - 0.5, p.z, s, s * rr(B, pr.tall || [0.6, 1.4]), pr.seg || 6, pr.tile || 'rock', null, s * (pr.top === undefined ? 0.3 : pr.top), pr.tile || 'rock'); }
    else if (pr.k === 'pillar') { var ph = rr(B, pr.h || [8, 12]); B.cyl(p.x, p.y - 0.5, p.z, pr.rad || 1.2, ph, pr.seg || 8, pr.tile || 'trim', null, pr.rad2 === undefined ? (pr.rad || 1.2) : pr.rad2, pr.cap || null); if (pr.light) B.light(p.x, p.y + ph, p.z, pr.light.r || 10, pr.light.col, pr.light.halo || null); }
    else if (pr.k === 'decal') { var f2 = pickOf(B, pr.list, n), sz2 = KIT.size(f2), sc = pr.ds || 0.12; if (!decalFree(B, p.x, p.z, sz2.w * sc)) return; B.box(p.x, p.y - 0.5, p.z, sz2.w * sc * 0.95, 6, sz2.h * sc * 0.82, p.face + Math.PI / 2, pr.tile || 'wall', pr.roof || 'trim'); var a2 = ahead(p, 3.05); B.decal(a2.x, p.y - 0.5, a2.z, sz2.w * sc, sz2.h * sc, p.face + Math.PI / 2, f2); }
    else if (pr.k === 'fn') pr.fn(B, p, q, sd, i, n);
  });
}
/* a big sprite standing past the wall at a fraction of the zone, on whichever side has room */
function landmark(B, f, dist, r, fn) { var q = B.T.at(f), p = dist < 0 ? B.side(q, 1, dist) : inPlace(B, q, 1, dist, r) || inPlace(B, q, -1, dist, r); if (p) fn(p, q); return p; }
function animOf(base, n, sp) { return function (t) { return base + (Math.floor(t * (sp || 6)) % (n || 4)); }; }

Object.assign(THEMES, {
  /* ================= CLUBHOUSE ROW ================= */
  yard: ZT({ dust: '#5a6a3a',
    tiles: function (A) {
      A.add('road', PAINT.stone('#1a0a0a', ['#5a4a48', '#6a5a56', '#4e403e', '#625250'])); A.add('off', PAINT.grass(['#2e4a14', '#3a5a1a', '#24400e', '#4a6a22'])); A.add('ground', PAINT.grass(['#2a4412', '#34521a', '#22380c']));
      A.add('wall', PAINT.stone('#140608', ['#4a1a20', '#3e161a', '#561e24'])); A.add('trim', PAINT.stone('#1a0a0a', ['#6a5a58', '#5a4a48'])); A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#3a5a1a'));
      A.add('hedge', PAINT.grass(['#1e3a0e', '#2a4a14', '#183008', '#345a1a'])); A.add('banner', PAINT.banner('#a8101c', '#ffe36a', '#ffe36a')); A.add('statue', PAINT.stone('#2a2a2a', ['#8a8484', '#7a7474', '#9a9494']));
    },
    lights: [{ every: 24, h: 4.2, sides: 1, dist: 1, col: [0.85, 0.6, 0.25], halo: '#ffd080' }],
    props: [{ k: 'bldg', every: 9, dist: 1.5, w: [6, 7], d: [2.2, 2.6], h: [2.4, 3.2], tile: 'hedge', roof: 'hedge', r: 1 }, { k: 'pillar', every: 40, dist: 5, rad: 0.5, h: [9, 11], tile: 'trim', cap: 'trim' }, { k: 'fn', every: 40, dist: 5.2, fn: function (B, p) { B.panel(p.x, p.y + 4, p.z, 3, 5, p.face + Math.PI / 2, 'banner'); } }],
    scen: function (B) {
      landmark(B, 0.5, 18, 8, function (p) { B.cyl(p.x, p.y - 0.5, p.z, 3, 2, 8, 'statue', null, 2.6, 'statue'); B.bill(p.x, p.y + 1.5, p.z, 'ch_idle0', 0.22); }); // a statue of Cumhead in the middle of the courtyard
      landmark(B, 0.82, 14, 6, function (p) { B.bill(p.x, p.y, p.z, 'npc_saba', 0.07); B.bill(p.x + 2, p.y, p.z + 1, 'npc_judgement', 0.07); });
      B.along(30, function (q, sd, i) { var p = inPlace(B, q, sd, 26, 6); if (p) B.box(p.x, p.y - 0.5, p.z, 10, 10, 18 + B.rnd() * 6, p.face, 'wall', 'trim'); }); // the castle's inner walls all round
    } }),
  clubin: ZT({ dust: '#6a4a2a',
    tiles: function (A) {
      A.add('road', PAINT.planks(['#6a4424', '#5a3a1e', '#7a4e2a', '#4e3218'], '#1a0a04')); A.add('off', PAINT.carpet('#5a0a14', '#c8903a', '#c8903a')); A.add('ground', PAINT.solid('#0a0402'));
      A.add('wall', PAINT.planks(['#3a2010', '#2e180c', '#44261a'], '#120804')); A.add('trim', PAINT.planks(['#5a3a1e', '#4a3018'], '#1a0a04')); A.add('kerb', PAINT.kerb('#c8903a', '#3a2010')); A.add('kerb2', PAINT.solid('#7a4e2a'));
      A.add('beam', PAINT.planks(['#2a1a10', '#22140c'], '#0a0402')); A.add('gold', PAINT.solid('#c8903a'));
      A.add('trophy', function (p) { PAINT.planks(['#3a2010', '#2e180c', '#44261a'], '#120804')(p); for (var k = 0; k < 3; k++) { var x = 3 + k * 10; p.rect(x, 10, 6, 6, '#ffe36a'); p.rect(x + 2, 16, 2, 4, '#c8903a'); p.rect(x + 1, 20, 4, 2, '#a8741a'); p.px(x + 1, 11, '#ffffff'); } p.rect(0, 23, 32, 2, '#1a0a04'); });
      A.add('poster', function (p) { PAINT.planks(['#3a2010', '#2e180c', '#44261a'], '#120804')(p); p.rect(6, 4, 20, 24, '#f1e7d0'); p.rect(8, 6, 16, 12, '#c4121c'); for (var y = 20; y < 26; y += 2) p.rect(8, y, 16, 1, '#5a4a48'); });
    },
    wallAt: function (i, band) { if (band === 0 && i % 12 === 6) return 'trophy'; if (band === 1 && i % 12 === 0) return 'poster'; return 'wall'; },
    ceil: { every: 8, h: 7, tile: 'beam' },
    lights: [{ every: 20, h: 6, col: [0.9, 0.65, 0.3], halo: '#ffc060', r: 16 }],
    props: [{ k: 'bill', every: 22, spr: ['wn_jukebox', 'wn_table', 'wn_plant', 'p_chest', 'wn_table'], sc: [0.07, 0.09], dist: -1.6 }],
    scen: function (B) { var T = B.T; [['npc_masterbates', 0.2], ['npc_t', 0.45], ['npc_bonjo', 0.7]].forEach(function (c, k) { var p = B.side(T.at(c[1]), k % 2 ? 1 : -1, -1.4); B.bill(p.x, p.y, p.z, c[0], 0.07); });
      var c0 = B.side(T.at(0.55), 1, -1.6); B.bill(c0.x, c0.y, c0.z, 'ch_idle0', 0.07); } }),
  alley: ZT({ dust: '#3a3438',
    tiles: function (A) {
      A.add('road', PAINT.asphalt('#1a161a', ['#241e22', '#100c0e', '#2a2228'])); A.add('off', PAINT.speckle('#1e1a1e', ['#2a2428', '#141014', '#3a0a10'], 140)); A.add('ground', PAINT.asphalt('#141014', ['#1e1a1e']));
      A.add('wall', PAINT.bricks('#100608', ['#3a1a1e', '#2e1418', '#44201f', '#341618'], 16, 8, { moss: '#2a3a1a' })); A.add('trim', PAINT.solid('#2a1418')); A.add('kerb', PAINT.kerb('#5a545c', '#1a161a')); A.add('kerb2', PAINT.solid('#2a2428'));
      A.add('pipe', PAINT.pipe('#5a545c')); A.add('bin', PAINT.metal('#2a4a2a', '#12200e', '#5a7a4a')); A.add('graffiti', function (p) { PAINT.bricks('#100608', ['#3a1a1e', '#2e1418'], 16, 8)(p); p.rect(4, 10, 24, 3, '#ff2a8a'); p.rect(6, 14, 3, 8, '#7dff3a'); p.rect(12, 15, 12, 3, '#ffe36a'); p.rect(20, 8, 3, 12, '#9adfff'); });
      A.add('neon', PAINT.solid('#ff2630'));
    },
    wallAt: function (i, band) { return band === 0 && i % 13 === 4 ? 'graffiti' : 'wall'; },
    lights: [{ every: 16, h: 4.5, sides: 1, dist: -1, col: [0.8, 0.2, 0.3], halo: '#ff4060', at: 6 }],
    props: [{ k: 'pipe', every: 22, h: [5.5, 6.5], r: 0.4 }, { k: 'bldg', every: 7, dist: 0.8, w: [1.4, 1.8], d: [1.2, 1.4], h: [1.6, 1.8], tile: 'bin', roof: 'bin', chance: 0.4, r: 0.5 },
      { k: 'bill', every: 18, spr: ['f_rat_0', 'p_skulls', 'f_cultrat_0', 'f_rat_0'], dist: -1.4, anim: function (s) { return s === 'f_rat_0' ? animOf('f_rat_', 4, 8) : null; } }],
    scen: function (B) { landmark(B, 0.45, 5, 6, function (p) { var sz = KIT.size('fac_tb'); B.box(p.x, p.y - 0.5, p.z, sz.w * 0.11, 6, sz.h * 0.1, p.face + Math.PI / 2, 'wall', 'trim'); var a = ahead(p, 3.05); B.decal(a.x, p.y - 0.5, a.z, sz.w * 0.12, sz.h * 0.12, p.face + Math.PI / 2, 'fac_tb'); var t = ahead(p, 5); B.bill(t.x, p.y, t.z, 'npc_tb', 0.07); B.light(t.x, p.y + 4, t.z, 14, [0.9, 0.5, 0.2], '#ffa040'); });
      B.along(14, function (q, sd) { var p = inPlace(B, q, sd, 4, 5); if (p) B.box(p.x, p.y - 0.5, p.z, 10, 8, 16 + B.rnd() * 14, p.face + Math.PI / 2, 'wall', 'trim'); }); } }),

  /* ================= EJACULAND ================= */
  parkgate: ZT({ dust: '#3a0a10',
    tiles: function (A) {
      A.add('road', PAINT.tiles('#2a0a10', '#12040a', '#000000')); A.add('off', PAINT.tiles('#3a0a10', '#14060a', '#000000')); A.add('ground', PAINT.speckle('#0e0608', ['#1a0a0e', '#2a0a10'], 160));
      A.add('wall', function (p) { for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) p.px(x, y, ((x + y) >> 3) % 2 ? '#c4121c' : '#12040a'); }); A.add('trim', PAINT.solid('#ff2630'));
      A.add('kerb', PAINT.kerb('#ff2630', '#12040a')); A.add('kerb2', PAINT.solid('#2a0a10')); A.add('booth', function (p) { p.fill('#c4121c'); p.rect(4, 6, 24, 12, '#12040a'); p.rect(5, 7, 22, 10, '#ffe36a'); p.rect(0, 0, 32, 4, '#f1e7d0'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 4, 4, '#c4121c'); });
      A.add('post', PAINT.solid('#2a0a10')); A.add('bulb', PAINT.solid('#ffe36a'));
    },
    lights: [{ every: 12, h: 5, sides: 1, dist: -0.5, col: [0.9, 0.7, 0.2], halo: '#ffe36a' }],
    props: [{ k: 'arch', every: 34, h: 9, tile: 'wall', top: 'bulb', light: { col: [0.9, 0.7, 0.2], halo: '#ffe36a' } }, { k: 'bldg', every: 18, dist: 3, w: 4, d: 4, h: 4, tile: 'booth', roof: 'trim', chance: 0.7 },
      { k: 'bill', every: 26, spr: ['f_balloon_0', 'f_clown_0', 'steve0'], sc: 0.07, dist: -1.6, anim: function (s) { return s === 'f_balloon_0' ? animOf('f_balloon_', 4, 4) : s === 'steve0' ? function (t) { return Math.floor(t * 2) % 2 ? 'steve1' : 'steve0'; } : null; } }],
    scen: function (B) { landmark(B, 0.35, 22, 12, function (p) { B.bill(p.x, p.y, p.z, 'steve0', 0.3, { anim: function (t) { return Math.floor(t * 1.5) % 2 ? 'steve1' : 'steve0'; } }); B.light(p.x, p.y + 10, p.z, 24, [0.9, 0.15, 0.1], '#ff4a3a'); }); } }), // a giant Steve waves you in
  coaster: ZT({ dust: '#3a0a10',
    tiles: function (A) {
      A.add('road', PAINT.asphalt('#1a1014', ['#241a1e', '#120a0e', '#3a0a10'])); A.add('off', PAINT.speckle('#14060a', ['#2a0a10', '#06020a'], 160)); A.add('ground', PAINT.speckle('#0e0608', ['#1a0a0e', '#2a0a10'], 160));
      A.add('wall', PAINT.fence('#c4121c', '#c4121c')); A.add('trim', PAINT.solid('#c4121c')); A.add('kerb', PAINT.kerb('#ffe36a', '#12040a')); A.add('kerb2', PAINT.solid('#2a0a10'));
      A.add('rail', PAINT.solid('#c4121c')); A.add('post', PAINT.metal('#3a1a20', '#12040a', '#8a2a30')); A.add('car', function (p) { p.fill('#ffe36a'); p.rect(0, 20, 32, 12, '#c4121c'); p.rect(4, 4, 24, 12, '#12040a'); });
    },
    props: [{ k: 'arch', every: 14, h: [10, 14], tile: 'post', top: 'rail', w: 0.7, thick: 0.6 }, { k: 'rock', every: 20, dist: [6, 20], s: [0.5, 0.7], tall: [14, 24], tile: 'post', top: 1, chance: 0.6 }],
    lights: [{ every: 14, h: 9, col: [0.85, 0.15, 0.1], halo: '#ff3a2a' }],
    scen: function (B) { var T = B.T, prev = null; // a second line of track snaking above the road, and the loop
      for (var i = 0; i < T.N; i += 2) { var q = T.S[i], p2 = B.side(q, i % 80 < 40 ? 1 : -1, 6), h = 14 + Math.sin(i / 9) * 4; if (!B.clear(p2.x, p2.z, 1)) { prev = null; continue; } if (prev) B.hcyl(prev.x, prev.h, prev.z, p2.x, p2.y + h, p2.z, 0.35, 'rail', null, 4); prev = { x: p2.x, z: p2.z, h: p2.y + h }; }
      landmark(B, 0.5, 20, 14, function (p) { var ry = p.face, c = Math.cos(ry), s = Math.sin(ry), r = 11; for (var k = 0; k < 24; k++) { var a0 = k / 24 * Math.PI * 2, a1 = (k + 1) / 24 * Math.PI * 2; B.hcyl(p.x + c * Math.cos(a0) * r, p.y + r + Math.sin(a0) * r, p.z + s * Math.cos(a0) * r, p.x + c * Math.cos(a1) * r, p.y + r + Math.sin(a1) * r, p.z + s * Math.cos(a1) * r, 0.5, 'rail', null, 4); } B.box(p.x, p.y - 0.5, p.z, 1, 1, 2, 0, 'post'); }); } }),
  flume: ZT({ dust: '#fff6d8', roadScroll: function () { return 0; },
    tiles: function (A) {
      A.add('road', PAINT.planks(['#5a3a1e', '#4a3018', '#6a4424'], '#1a0a04')); A.add('off', PAINT.liquid(['#e8dcb0', '#fff6d8', '#ffffff', '#c8b080'])); A.add('ground', PAINT.liquid(['#d8c8a0', '#f1e7d0', '#fffbe8']));
      A.add('wall', PAINT.planks(['#c4121c', '#a8101c'], '#5a0610')); A.add('trim', PAINT.solid('#ffe36a')); A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#4a3018'));
      A.add('rock', PAINT.stone('#2a1a10', ['#5a4a3a', '#4a3a2a'])); A.add('splash', PAINT.solid('#fffbe8'));
    }, groundScroll: 0.2,
    props: [{ k: 'bill', every: 14, spr: 'p_logboat', sc: [0.08, 0.1], dist: [2, 10] }, { k: 'rock', every: 18, dist: [12, 26], s: [3, 6], tile: 'rock', chance: 0.6 }],
    lights: [{ every: 22, h: 4, sides: 1, dist: 0.5, col: [0.85, 0.75, 0.5], halo: '#fff0c0' }],
    scen: function (B) { landmark(B, 0.15, 3, 4, function (p) { B.bill(p.x, p.y, p.z, 'p_tallsign', 0.1); var s = ahead(p, -2); B.bill(s.x, p.y, s.z, 'steve0', 0.07); });
      landmark(B, 0.6, 20, 10, function (p) { B.cyl(p.x, p.y - 0.5, p.z, 6, 16, 8, 'rock', null, 3, 'rock'); for (var k = 0; k < 5; k++) B.bill(p.x, p.y + 15 - k * 3.5, p.z, 'p_creampool', 0.12); }); } }), // the big drop with its waterfall of cream

  /* ================= CUM CAFE RUN ================= */
  kitchen: ZT({ dust: '#f1e7d0',
    tiles: function (A) {
      A.add('road', PAINT.tiles('#f1e7d0', '#12040a', '#5a4a48')); A.add('off', PAINT.tiles('#c4121c', '#8a0a14', '#3a0a10')); A.add('ground', PAINT.solid('#0a0204'));
      A.add('wall', PAINT.tiles('#f1e7d0', '#d8ccb0', '#8a7a6a')); A.add('trim', PAINT.metal('#a8a0a8', '#5a545c', '#d8d0d8')); A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#8a0a14'));
      A.add('steel', PAINT.metal('#a8a0a8', '#5a545c', '#d8d0d8')); A.add('grill', function (p) { p.fill('#1a1418'); for (var x = 2; x < 32; x += 4) p.rect(x, 0, 2, 32, '#5a545c'); p.speck(['#ff7a20', '#ffe36a'], 10); }); A.add('beam', PAINT.metal('#3a343c', '#12040a', '#8a828a'));
      A.add('menu', function (p) { PAINT.tiles('#f1e7d0', '#d8ccb0', '#8a7a6a')(p); p.rect(4, 4, 24, 20, '#12040a'); for (var y = 7; y < 22; y += 3) p.rect(6, y, 6 + (y * 7) % 12, 1, '#ffe36a'); p.rect(20, 6, 6, 6, '#c4121c'); });
    },
    wallAt: function (i, band) { return band === 1 && i % 10 === 5 ? 'menu' : 'wall'; },
    ceil: { every: 7, h: 6.2, tile: 'beam', w: 0.8 },
    lights: [{ every: 12, h: 5.6, col: [0.9, 0.8, 0.6], halo: '#fff0c0', r: 14 }],
    props: [{ k: 'bldg', every: 8, dist: -2.2, w: [3, 3.6], d: 1.8, h: 1.4, tile: 'steel', roof: 'grill', r: 0, chance: 0.8 }, { k: 'bill', every: 16, spr: ['it_espresso', 'it_pie', 'mn_pie', 'it_cup', 'it_tea'], sc: 0.06, dist: -2.2, dy: 1.4 }],
    scen: function (B) { var T = B.T; [['npc_kaya', 0.25], ['npc_elden', 0.6]].forEach(function (c, k) { var p = B.side(T.at(c[1]), k ? -1 : 1, -1.5); B.bill(p.x, p.y, p.z, c[0], 0.075); }); var w = B.side(T.at(0.85), 1, -1.6); B.bill(w.x, w.y, w.z, 'wn_sp_cafe', 0.07); } }),
  roofs: ZT({ dust: '#3a343c',
    tiles: function (A) {
      A.add('road', PAINT.speckle('#1e1a1e', ['#2a2428', '#141014', '#3a343c'], 160)); A.add('off', PAINT.tiles('#3a343c', '#2a2428', '#141014')); A.add('ground', PAINT.asphalt('#141016', ['#1e1a20']));
      A.add('wall', PAINT.bricks('#100608', ['#3a2a2a', '#2e2222', '#443030'], 16, 8)); A.add('trim', PAINT.solid('#5a545c')); A.add('kerb', PAINT.kerb('#ffe36a', '#12040a')); A.add('kerb2', PAINT.solid('#3a343c'));
      A.add('chimney', PAINT.bricks('#100608', ['#5a2a24', '#4a2018', '#6a3028'], 8, 6)); A.add('ac', PAINT.metal('#8a828a', '#3a343c', '#d0c8d0')); A.add('win1', PAINT.window('#3a2a30', '#ffe36a', true)); A.add('win2', PAINT.window('#2a1e24', '#5a4a6a', false));
      A.add('meat', function (p) { p.fill('#8a3a2a'); for (var i = 0; i < 40; i++) { var x = Math.floor(p.rnd() * 30), y = Math.floor(p.rnd() * 30); p.rect(x, y, 3, 2, ['#c4504a', '#5a1a10', '#e0806a', '#ff2630'][i % 4]); } });
    },
    props: [{ k: 'bldg', every: 9, dist: [1, 4], w: [1.2, 1.8], d: [1.2, 1.8], h: [3, 6], tile: 'chimney', roof: 'trim', chance: 0.5, r: 0.5 }, { k: 'bldg', every: 13, dist: [1, 6], w: 2.6, d: 2.2, h: 1.6, tile: 'ac', roof: 'ac', chance: 0.6, r: 1 },
      { k: 'bldg', every: 24, dist: [16, 28], w: [12, 18], d: 12, h: [10, 30], tile: ['win1', 'win2'], roof: 'trim', r: 8 }, { k: 'lamp', every: 30, h: 3, glow: 'red', side: 1, dist: 0.5 }],
    init: THEMES.city.init, step: THEMES.city.step,
    drawDyn: THEMES.city.drawDyn, drawBills: THEMES.city.drawBills,
    scen: function (B) { landmark(B, 0.4, 6, 4, function (p) { B.bill(p.x, p.y, p.z, 'npc_pulsar', 0.07); }); } }),
  diner: ZT({ dust: '#5a5058',
    tiles: function (A) {
      A.add('road', PAINT.asphalt('#26222a', ['#302a34', '#1e1a22', '#3a343e'], '#ffe36a')); A.add('off', PAINT.tiles('#c4121c', '#f1e7d0', '#5a4a48')); A.add('ground', PAINT.asphalt('#1e1a20', ['#26222a']));
      A.add('wall', PAINT.fence('#f1e7d0', '#c4121c')); A.add('trim', PAINT.solid('#c4121c')); A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#7a727a'));
      A.add('chrome', PAINT.metal('#c8c0c8', '#6a646c', '#ffffff')); A.add('roof', PAINT.speckle('#1a1418', ['#241e22'], 60)); A.add('neonb', PAINT.solid('#9adfff')); A.add('neonr', PAINT.solid('#ff2a8a'));
    },
    props: [{ k: 'decal', every: 22, dist: [4, 6], list: ['wn_sp_amy', 'wn_sp_greebo', 'wn_sp_ali', 'wn_sp_joff', 'wn_sp_beebs', 'wn_sp_cafe'], ds: 0.18, tile: 'chrome', roof: 'roof', r: 5 }, { k: 'lamp', every: 14, h: 5 },
      { k: 'bill', every: 24, spr: ['npc_amy', 'npc_greebo', 'npc_ali', 'npc_joff', 'npc_beebs'], sc: 0.07, dist: -1.4 }],
    lights: [{ every: 18, h: 5, sides: 1, dist: 3, col: [0.9, 0.2, 0.6], halo: '#ff2a8a' }] }),

  /* ================= CUMHEAD'S CASTLE ================= */
  moat: ZT({ dust: '#6a5a58', groundScroll: 0.15,
    tiles: function (A) {
      A.add('road', PAINT.planks(['#5a3a1e', '#4a3018', '#6a4424', '#3e2814'], '#1a0a04')); A.add('off', PAINT.liquid(['#e8dcb0', '#fff6d8', '#ffffff', '#c8b080'])); A.add('ground', PAINT.liquid(['#d8c8a0', '#f1e7d0', '#fffbe8']));
      A.add('wall', PAINT.stone('#140608', ['#4a3a3a', '#423232', '#523e3e'])); A.add('trim', PAINT.stone('#140608', ['#5a4a48', '#4a3a3a'])); A.add('kerb', PAINT.kerb('#c8903a', '#3a2010')); A.add('kerb2', PAINT.solid('#3a2010'));
      A.add('chain', function (p) { p.clear(); for (var y = 0; y < 32; y += 6) { p.rect(13, y, 6, 2, '#5a545c'); p.rect(13, y + 2, 2, 2, '#5a545c'); p.rect(17, y + 2, 2, 2, '#5a545c'); } }); A.add('tower', PAINT.stone('#140608', ['#4a1a20', '#3e161a', '#561e24']));
    },
    props: [{ k: 'bill', every: 30, spr: ['f_kraken_0', 'f_creamblob_0'], sc: 0.06, dist: [3, 6], chance: 0.6 }],
    lights: [{ every: 20, h: 3, sides: 1, dist: 0, col: [0.9, 0.55, 0.2], halo: '#ffa040' }],
    scen: function (B) { var T = B.T; B.along(10, function (q, sd) { var p = inPlace(B, q, sd, 30, 10); if (p && B.rnd() < 0.5) B.box(p.x, p.y - 0.5, p.z, 12, 12, 22 + B.rnd() * 10, p.face, 'tower', 'trim'); }); // the castle walls across the moat
      landmark(B, 0.12, 10, 8, function (p) { B.cyl(p.x, p.y - 0.5, p.z, 6, 30, 8, 'tower', null, 6); B.cyl(p.x, p.y + 29.5, p.z, 7, 8, 8, 'trim', null, 0.2); }); } }),
  battle: ZT({ dust: '#5a4a48',
    tiles: function (A) {
      A.add('road', PAINT.stone('#14080a', ['#5a4a48', '#4e403e', '#625250', '#463836'])); A.add('off', PAINT.stone('#100606', ['#3a2a2a', '#2e2222'])); A.add('ground', PAINT.bricks('#0a0204', ['#2a0a10', '#220810'], 16, 8));
      A.add('wall', PAINT.stone('#140608', ['#5a4a48', '#4a3a3a'])); A.add('trim', PAINT.stone('#140608', ['#6a5a58', '#5a4a48']));
      A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#3a2a2a')); A.add('banner', PAINT.banner('#a8101c', '#ffe36a', '#ffe36a')); A.add('tower', PAINT.stone('#140608', ['#4a1a20', '#3e161a', '#561e24']));
    },
    props: [{ k: 'pillar', every: 12, dist: -0.2, rad: 0.9, h: 3.6, seg: 4, tile: 'trim', cap: 'trim' }, { k: 'fn', every: 36, dist: -0.2, fn: function (B, p) { B.panel(p.x, p.y - 4, p.z, 2.6, 4, p.face + Math.PI / 2, 'banner'); } },
      { k: 'bill', every: 24, spr: ['f_gargoyle_0', 'f_crow_0', 'f_gargoyle_0', 'f_knight_0'], sc: 0.07, dist: -1.3 }],
    lights: [{ every: 18, h: 3.4, sides: 1, dist: -0.3, col: [0.95, 0.5, 0.15], halo: '#ff9030' }],
    scen: function (B) { B.along(36, function (q, sd) { var p = inPlace(B, q, sd, 18, 8); if (p && B.rnd() < 0.6) { B.cyl(p.x, p.y - 30, p.z, 5, 44, 8, 'tower', null, 5); B.cyl(p.x, p.y + 14, p.z, 6, 9, 8, 'trim', null, 0.2); } }); } }),
  cells: ZT({ dust: '#4a4a52',
    tiles: function (A) {
      A.add('road', PAINT.stone('#0e0e14', ['#3a3a44', '#34343e', '#42424c'])); A.add('off', PAINT.speckle('#1a1a1e', ['#24242a', '#121216', '#3a0a10'], 160)); A.add('ground', PAINT.solid('#060608'));
      A.add('wall', PAINT.stone('#0a0a0e', ['#26262e', '#2e2e36', '#22222a'])); A.add('trim', PAINT.solid('#1a1a1e')); A.add('kerb', PAINT.kerb('#5a545c', '#1a1a1e')); A.add('kerb2', PAINT.solid('#24242a'));
      A.add('bars', function (p) { PAINT.stone('#0a0a0e', ['#26262e', '#2e2e36'])(p); p.rect(4, 4, 24, 28, '#06060a'); for (var x = 5; x < 28; x += 4) p.rect(x, 4, 2, 28, '#5a545c'); p.rect(4, 12, 24, 2, '#5a545c'); }); A.add('beam', PAINT.planks(['#2a1a10', '#22140c'], '#0a0402'));
    },
    wallAt: function (i, band) { return band === 0 && i % 6 === 3 ? 'bars' : 'wall'; },
    ceil: { every: 8, h: 7.6, tile: 'beam', w: 1 },
    lights: [{ every: 16, h: 2.6, sides: 1, dist: -1.2, col: [0.95, 0.5, 0.12], halo: '#ffa040', at: 8 }],
    props: [{ k: 'bill', every: 16, spr: ['p_cell', 'f_jailer_0', 'p_cell', 'f_skeleton_0', 'p_skulls'], sc: 0.07, dist: -1.4 }] }),

  /* ================= THE CREAM SEWERS ================= */
  reservoir: ZT({ dust: '#fff6d8', groundScroll: 0.12,
    tiles: function (A) {
      A.add('road', PAINT.bricks('#1a140c', ['#4a3e2e', '#544634', '#40362a'], 16, 8)); A.add('off', PAINT.liquid(['#e8dcb0', '#fff6d8', '#ffffff', '#c8b080'])); A.add('ground', PAINT.liquid(['#d8c8a0', '#f1e7d0', '#fffbe8', '#b8a070']));
      A.add('wall', PAINT.pipe('#8a7a5a')); A.add('trim', PAINT.solid('#c8b080')); A.add('kerb', PAINT.kerb('#c8b080', '#5a4c38')); A.add('kerb2', PAINT.solid('#6a5a44')); A.add('rock', PAINT.stone('#100c08', ['#3a3226', '#423a2c']));
      A.add('pipe', PAINT.pipe('#8a7a5a'));
    },
    props: [{ k: 'pillar', every: 30, dist: [14, 30], rad: 3, h: [26, 30], tile: 'rock', r: 4 }, { k: 'bill', every: 26, spr: ['f_creamblob_0', 'f_kraken_0'], sc: 0.07, dist: [3, 8], chance: 0.7 }],
    lights: [{ every: 30, h: 14, col: [0.5, 0.5, 0.3], halo: '#f0f0b0', r: 20 }],
    scen: function (B) { B.along(28, function (q, sd) { var p = inPlace(B, q, sd, 10, 6); if (!p || B.rnd() > 0.5) return; var x2 = p.x - q.nx * sd * 4, z2 = p.z - q.nz * sd * 4; B.hcyl(p.x, p.y + 14, p.z, x2, p.y + 14, z2, 1.6, 'pipe'); B.pours = B.pours || []; B.pours.push({ x: x2, y: p.y + 13, z: z2 }); }); },
    drawDyn: THEMES.sewer.drawDyn }),
  ratcult: ZT({ dust: '#5a3a30',
    tiles: function (A) {
      A.add('road', PAINT.bricks('#140808', ['#3a1a14', '#44201a', '#2e1410'], 8, 8)); A.add('off', PAINT.speckle('#1a0a0a', ['#2a0e0e', '#3a1410', '#5a0a10'], 180)); A.add('ground', PAINT.solid('#080404'));
      A.add('wall', PAINT.bricks('#0a0404', ['#2a1210', '#341614', '#22100e'], 16, 8)); A.add('trim', PAINT.solid('#3a0a10')); A.add('kerb', PAINT.kerb('#c4121c', '#2a1210')); A.add('kerb2', PAINT.solid('#2a1210'));
      A.add('rune', function (p) { PAINT.bricks('#0a0404', ['#2a1210', '#341614'], 16, 8)(p); for (var a = 0; a < 6.28; a += 0.2) p.px(16 + Math.round(Math.cos(a) * 10), 16 + Math.round(Math.sin(a) * 10), '#ff2630'); p.rect(15, 8, 2, 16, '#ff2630'); p.rect(9, 15, 14, 2, '#ff2630'); }); A.add('beam', PAINT.bricks('#0a0404', ['#2a1210', '#22100e'], 8, 8)); A.add('candle', PAINT.solid('#f1e7d0'));
    },
    wallAt: function (i, band) { return band === 1 && i % 14 === 7 ? 'rune' : 'wall'; },
    ceil: { every: 9, h: 8.4, tile: 'beam', w: 1.4 },
    lights: [{ every: 10, h: 1.6, sides: 1, dist: -1.2, col: [0.9, 0.3, 0.1], halo: '#ff6030', r: 9 }],
    props: [{ k: 'pillar', every: 10, dist: -1.2, rad: 0.15, h: [0.8, 1.6], tile: 'candle', seg: 4 }, { k: 'bill', every: 14, spr: ['f_cultrat_0', 'f_rat_0', 'f_cultist_0', 'f_rat_0'], sc: 0.07, dist: -1.6, anim: function (s) { return s === 'f_rat_0' ? animOf('f_rat_', 4, 8) : null; } }],
    scen: function (B) { landmark(B, 0.5, -2.4, 0, function (p) { B.bill(p.x, p.y, p.z, 'f_ratking_0', 0.1); B.bill(p.x, p.y, p.z, 'p_altar', 0.09); }); } }),
  bonepit: ZT({ dust: '#d8ccb0',
    tiles: function (A) {
      A.add('road', PAINT.speckle('#5a4a3a', ['#6a5a48', '#4a3a2a', '#d8ccb0'], 200)); A.add('off', function (p) { p.fill('#2a2018'); for (var i = 0; i < 22; i++) { var x = Math.floor(p.rnd() * 28), y = Math.floor(p.rnd() * 30); p.rect(x, y, 5, 1, '#d8ccb0'); p.px(x, y - 1, '#d8ccb0'); p.px(x + 4, y + 1, '#d8ccb0'); } }); A.add('ground', PAINT.speckle('#1a140e', ['#2a2018', '#d8ccb0'], 80));
      A.add('wall', function (p) { p.fill('#2a2018'); for (var y = 2; y < 32; y += 6) for (var x = (y % 12 ? 0 : 6); x < 32; x += 12) { p.rect(x + 1, y, 8, 4, '#d8ccb0'); p.rect(x + 3, y + 1, 1, 1, '#12040a'); p.rect(x + 6, y + 1, 1, 1, '#12040a'); p.rect(x + 3, y + 3, 4, 1, '#8a7a6a'); } }); A.add('trim', PAINT.solid('#d8ccb0'));
      A.add('kerb', PAINT.kerb('#d8ccb0', '#3a2a1a')); A.add('kerb2', PAINT.solid('#3a2a1a')); A.add('bone', PAINT.solid('#e8dcc0')); A.add('beam', function (p) { p.fill('#d8ccb0'); p.speck(['#b8ac90', '#f1e7d0'], 60); });
    },
    ceil: { every: 10, h: 7, tile: 'beam', w: 0.8 },
    lights: [{ every: 18, h: 5, col: [0.7, 0.75, 0.4], halo: '#e8f0a0' }],
    props: [{ k: 'bill', every: 12, spr: ['p_skulls', 'p_ribs', 'f_skeleton_0', 'f_bonehound_0', 'p_skulls'], sc: 0.07, dist: -1.5 }, { k: 'arch', every: 30, h: 6.5, tile: 'bone', w: 0.6, thick: 0.6 }],
    scen: function (B) { landmark(B, 0.5, -2.6, 0, function (p) { B.bill(p.x, p.y, p.z, 'f_boner_0', 0.1); }); } }),

  /* ================= POTBELLY ARCADE ================= */
  carpark: ZT({ dust: '#3a3440',
    tiles: function (A) {
      A.add('road', PAINT.asphalt('#1a181e', ['#24222a', '#121016'], '#f1e7d0')); A.add('off', function (p) { PAINT.asphalt('#1e1c22', ['#26242a'])(p); p.rect(0, 0, 2, 32, '#f1e7d0'); }); A.add('ground', PAINT.asphalt('#16141a', ['#1e1c22', '#100e12']));
      A.add('wall', PAINT.solid('#3a3440')); A.add('trim', PAINT.solid('#ffe36a')); A.add('kerb', PAINT.kerb('#ffe36a', '#12040a')); A.add('kerb2', PAINT.solid('#3a3440'));
      ['#8a0a14', '#1a3a8a', '#1a6a2a', '#5a5a5a'].forEach(function (c, i) { A.add('car' + i, function (p) { p.fill(c); p.rect(0, 0, 32, 10, '#12040a'); p.rect(2, 2, 12, 6, '#5a7a9a'); p.rect(18, 2, 12, 6, '#5a7a9a'); p.rect(0, 26, 32, 6, '#12040a'); }); });
      A.add('sign', PAINT.cab('#ff2a8a', '#9adfff', '#ffe36a'));
    },
    props: [{ k: 'bldg', every: 7, dist: [1, 3], w: 4.2, d: 2.2, h: 1.6, tile: ['car0', 'car1', 'car2', 'car3'], roof: 'car3', chance: 0.55, r: 1.5 }, { k: 'lamp', every: 26, h: 7, glow: 'glow' }],
    scen: function (B) { landmark(B, 0.55, 14, 10, function (p) { var sz = KIT.size('fac_arcade'); B.box(p.x, p.y - 0.5, p.z, sz.w * 0.2, 8, sz.h * 0.17, p.face + Math.PI / 2, 'wall', 'trim'); var a = ahead(p, 4.05); B.decal(a.x, p.y - 0.5, a.z, sz.w * 0.2, sz.h * 0.2, p.face + Math.PI / 2, 'fac_arcade'); B.light(a.x, p.y + 10, a.z, 24, [0.9, 0.2, 0.6], '#ff2a8a'); }); } }),
  prizes: ZT({ dust: '#ffe36a',
    tiles: function (A) {
      A.add('road', PAINT.carpet('#1a0a3a', '#ff2a8a', '#9adfff')); A.add('off', function (p) { p.fill('#ff2a8a'); for (var i = 0; i < 40; i++) { p.rect(Math.floor(p.rnd() * 30), Math.floor(p.rnd() * 30), 3, 3, ['#ffe36a', '#9adfff', '#7dff3a', '#ff2630', '#f1e7d0'][i % 5]); } }); A.add('ground', PAINT.solid('#0a0418'));
      A.add('wall', function (p) { p.fill('#2a1438'); for (var y = 0; y < 32; y += 8) { p.rect(0, y + 6, 32, 2, '#c8903a'); for (var x = 2; x < 32; x += 6) p.rect(x, y + 1, 4, 5, ['#ff2a8a', '#ffe36a', '#9adfff', '#7dff3a'][(x + y) % 4]); } }); A.add('trim', PAINT.solid('#ffe36a'));
      A.add('kerb', PAINT.kerb('#ffe36a', '#ff2a8a')); A.add('kerb2', PAINT.solid('#5a1a8a')); A.add('beam', PAINT.solid('#5a1a8a')); A.add('glass', PAINT.solid('#9adfff'));
    },
    ceil: { every: 10, h: 4.6, tile: 'beam', w: 0.6 },
    lights: [{ every: 10, h: 4, col: [0.9, 0.7, 0.3], halo: '#ffe36a', r: 10 }],
    props: [{ k: 'bill', every: 9, spr: ['it_token', 'ao_coin', 'it_dice', 'it_cards', 'it_balloon', 'it_charm', 'it_shell', 'it_moon'], sc: [0.08, 0.12], dist: -1.6, dy: 0.6 }],
    scen: function (B) { landmark(B, 0.4, -1.6, 0, function (p) { B.bill(p.x, p.y, p.z, 'npc_potbelly', 0.075); }); landmark(B, 0.8, -1.6, 0, function (p) { B.bill(p.x, p.y, p.z, 'ck_gold', 0.15); }); } }),
  machine: ZT({ dust: '#7dff3a',
    tiles: function (A) {
      A.add('road', function (p) { p.fill('#020a02'); p.rect(0, 0, 32, 1, '#7dff3a'); p.rect(0, 0, 1, 32, '#7dff3a'); p.rect(0, 16, 32, 1, '#1a5a1a'); p.rect(16, 0, 1, 32, '#1a5a1a'); }, { flat: 1 });
      A.add('off', function (p) { p.fill('#041004'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 1, '#0a2a0a'); }, { flat: 1 }); A.add('wall', function (p) { p.clear(); p.rect(0, 0, 32, 3, '#7dff3a'); p.rect(0, 29, 32, 3, '#1a5a1a'); }, { flat: 1 });
      A.add('trim', PAINT.solid('#7dff3a'), { flat: 1 }); A.add('skirt', function (p) { p.fill('#020602'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#0a2a0a'); }, { flat: 1 }); A.add('kerb', PAINT.kerb('#7dff3a', '#020a02')); A.add('kerb2', PAINT.solid('#0a2a0a'));
      A.add('pix', PAINT.solid('#7dff3a'), { flat: 1 }); A.add('pix2', PAINT.solid('#ff2a8a'), { flat: 1 }); A.add('pix3', PAINT.solid('#9adfff'), { flat: 1 });
    },
    props: [{ k: 'arch', every: 16, h: 9, tile: 'pix', w: 0.4, thick: 0.4 }],
    lights: [{ every: 16, h: 8, col: [0.2, 0.8, 0.2], halo: '#7dff3a' }],
    scen: function (B) { var T = B.T; for (var n = 0; n < 40; n++) { var q = T.S[Math.floor(B.rnd() * T.N)], sd = B.rnd() < 0.5 ? 1 : -1, d = 10 + B.rnd() * 40, x = q.x + q.nx * (T.edge + d) * sd, z = q.z + q.nz * (T.edge + d) * sd; if (!B.clear(x, z, 3)) continue; var s = 2 + Math.floor(B.rnd() * 3) * 2; B.box(x, q.y - 4 + B.rnd() * 12, z, s, s, s, 0, ['pix', 'pix2', 'pix3'][n % 3], ['pix', 'pix2', 'pix3'][n % 3], [0.9, 0.9, 0.9]); }
      B.along(30, function (q, sd, i) { var p = B.side(q, sd, 3); B.bill(p.x, p.y + 2, p.z, ['ao_meat0', 'ao_coin', 'ck_star'][i % 3], 0.1); }); } }), // floating pixels

  /* ================= SPUZZWORLD FACTORY ================= */
  mincer: ZT({ dust: '#8a0a14',
    tiles: function (A) {
      A.add('road', function (p) { p.fill('#2a2428'); for (var y = 0; y < 32; y += 8) { p.rect(0, y, 32, 2, '#5a545c'); p.rect(0, y + 2, 32, 1, '#12040a'); } p.speck(['#8a0a14', '#5a0610'], 30); }); A.add('off', PAINT.metal('#3a0a0e', '#12040a', '#8a2a30')); A.add('ground', PAINT.speckle('#1a0606', ['#3a0a0a', '#5a0a10'], 180));
      A.add('wall', PAINT.metal('#2a2428', '#12040a', '#5a545c')); A.add('trim', function (p) { for (var x = 0; x < 32; x++) p.rect(x, 0, 1, 32, ((x >> 2) % 2) ? '#ff2630' : '#12040a'); }); A.add('kerb', PAINT.kerb('#ff2630', '#12040a')); A.add('kerb2', PAINT.solid('#2a2428'));
      A.add('beam', PAINT.metal('#3a343c', '#12040a', '#8a828a')); A.add('cage', function (p) { p.clear(); for (var x = 0; x < 32; x += 6) p.rect(x, 0, 2, 32, '#5a545c'); p.rect(0, 0, 32, 2, '#5a545c'); p.rect(0, 30, 32, 2, '#5a545c'); }); A.add('blood', PAINT.solid('#8a0a14'));
    },
    ceil: { every: 9, h: 6.4, tile: 'beam', w: 1.1 },
    lights: [{ every: 14, h: 5.6, col: [0.95, 0.12, 0.08], halo: '#ff3020' }],
    props: [{ k: 'bill', every: 10, spr: ['p_saw0', 'h_gloop_adult_idle0', 'p_saw1', 'sw_hob0', 'f_blumguard_0'], sc: 0.07, dist: -1.5, anim: function (s) { return s.indexOf('p_saw') === 0 ? function (t) { return 'p_saw' + (Math.floor(t * 12) % 2); } : null; } },
      { k: 'bldg', every: 20, dist: -2.2, w: 2.2, d: 2.2, h: 2.4, tile: 'cage', roof: 'cage', r: 0 }] }),
  furnace: ZT({ dust: '#ff7a20',
    tiles: function (A) {
      A.add('road', PAINT.metal('#2a2020', '#12040a', '#5a4a40')); A.add('off', PAINT.lava); A.add('ground', PAINT.lava); A.add('wall', PAINT.bricks('#0a0404', ['#3a1410', '#44180e', '#2e100c'], 16, 8)); A.add('trim', PAINT.solid('#ff7a20'));
      A.add('kerb', PAINT.kerb('#ff7a20', '#12040a')); A.add('kerb2', PAINT.solid('#3a1410')); A.add('beam', PAINT.metal('#2a2020', '#12040a', '#6a5a50'));
    }, groundScroll: 0.06,
    ceil: { every: 11, h: 7, tile: 'beam', w: 1.2 },
    lights: [{ every: 8, h: 0.6, sides: 1, dist: 1, col: [1, 0.45, 0.1], halo: null, r: 10 }, { every: 24, h: 6, col: [1, 0.5, 0.15], halo: '#ff9030' }],
    props: [{ k: 'bill', every: 14, spr: ['p_crucible', 'f_magmaslug_0', 'f_emberbat_0', 'f_hotload_0'], sc: 0.07, dist: -1.5 }] }),
  throne: ZT({ dust: '#6a0a14',
    tiles: function (A) {
      A.add('road', PAINT.carpet('#5a0610', '#c8903a', '#c8903a')); A.add('off', PAINT.stone('#0a0204', ['#2a0a10', '#220810', '#30101a'])); A.add('ground', PAINT.solid('#060102'));
      A.add('wall', PAINT.flesh('#3a0a24', '#9a0a2a', '#5a1a3a')); A.add('trim', PAINT.solid('#c8903a')); A.add('kerb', PAINT.kerb('#c8903a', '#5a0610')); A.add('kerb2', PAINT.solid('#2a0a10'));
      A.add('gold', PAINT.solid('#c8903a')); A.add('pillar', PAINT.stone('#0a0204', ['#3a0a14', '#2a0610', '#4a1018'])); A.add('beam', PAINT.stone('#0a0204', ['#2a0610', '#3a0a14']));
    },
    ceil: { every: 12, h: 9, tile: 'beam', w: 1.6 },
    lights: [{ every: 14, h: 6, sides: 1, dist: -1.5, col: [0.9, 0.3, 0.2], halo: '#ff5030' }],
    props: [{ k: 'pillar', every: 12, dist: -1.6, rad: 1, h: 9, seg: 8, tile: 'pillar' }, { k: 'bill', every: 20, spr: ['f_blumguard_0', 'f_blumguard_1', 'f_blumeye_0'], sc: 0.075, dist: -3.2 }],
    scen: function (B) { landmark(B, 0.85, -2.6, 0, function (p) { B.bill(p.x, p.y, p.z, 'throne', 0.1); }); } }),

  /* ================= BLUMHEAD'S LAIR ================= */
  heart: ZT({ dust: '#c4121c',
    tiles: function (A) {
      A.add('road', PAINT.flesh('#6a1a24', '#3a0a14', '#8a2a34')); A.add('off', PAINT.liquid(['#5a0610', '#8a0a14', '#c4121c', '#3a0408'])); A.add('ground', PAINT.liquid(['#3a0408', '#5a0610', '#8a0a14']));
      A.add('wall', PAINT.flesh('#5a0a14', '#c4121c', '#8a1a24')); A.add('trim', PAINT.solid('#3a0408')); A.add('kerb', PAINT.kerb('#c4121c', '#3a0408')); A.add('kerb2', PAINT.solid('#5a0610'));
      A.add('vein', function (p) { p.fill('#5a0a14'); for (var k = 0; k < 4; k++) { var x = k * 8 + 2; for (var y = 0; y < 32; y++) { x += Math.round(p.rnd() * 2 - 1); p.rect(x, y, 2, 1, '#c4121c'); } } }); A.add('beam', PAINT.flesh('#7a1a2a', '#c4121c', '#9a2a3a'));
    }, groundScroll: 0.05,
    wallAt: function (i, band) { return band === 1 ? 'vein' : 'wall'; },
    ceil: { every: 6, h: 7.4, tile: 'beam', w: 1.6 },
    lights: [{ every: 12, h: 5, col: [0.9, 0.12, 0.15], halo: '#ff2a3a' }],
    props: [{ k: 'bill', every: 16, spr: ['f_lheart_0', 'f_blumspore_0', 'p_heart0'], sc: 0.075, dist: -1.6, anim: function (s) { return s === 'p_heart0' ? function (t) { return Math.floor(t * 2.4) % 2 ? 'p_heart1' : 'p_heart0'; } : null; } }],
    scen: function (B) { landmark(B, 0.5, 6, 6, function (p) { B.bill(p.x, p.y, p.z, 'p_heart0', 0.32, { anim: function (t) { return Math.floor(t * 2.4) % 2 ? 'p_heart1' : 'p_heart0'; } }); B.light(p.x, p.y + 6, p.z, 26, [0.9, 0.1, 0.1], '#ff2030'); }); } }),
  blackkeep: ZT({ dust: '#3a3440',
    tiles: function (A) {
      A.add('road', PAINT.stone('#06060a', ['#1e1a22', '#24202a', '#18141c'])); A.add('off', PAINT.speckle('#0e0c10', ['#1a161e', '#3a0a10'], 140)); A.add('ground', PAINT.stone('#040406', ['#141018', '#100c14']));
      A.add('wall', PAINT.bricks('#040406', ['#1a161e', '#221e26', '#141018'], 16, 8)); A.add('trim', PAINT.solid('#3a0a10')); A.add('kerb', PAINT.kerb('#c4121c', '#12040a')); A.add('kerb2', PAINT.solid('#141018'));
      A.add('redwin', function (p) { PAINT.bricks('#040406', ['#1a161e', '#221e26'], 16, 8)(p); p.rect(10, 4, 12, 26, '#000000'); p.rect(11, 6, 10, 22, '#c4121c'); p.rect(15, 6, 2, 22, '#000000'); }); A.add('tower', PAINT.bricks('#040406', ['#1a161e', '#221e26'], 16, 8));
    },
    wallAt: function (i, band) { return band === 0 && i % 10 === 5 ? 'redwin' : 'wall'; },
    lights: [{ every: 20, h: 4, sides: 1, dist: -0.6, col: [0.9, 0.15, 0.1], halo: '#ff3020' }],
    props: [{ k: 'bill', every: 22, spr: ['f_execu_0', 'f_wraith_0', 'f_gravehand_0', 'f_cultist_0'], sc: 0.075, dist: -1.6 }],
    scen: function (B) { B.along(24, function (q, sd) { var p = inPlace(B, q, sd, 14, 8); if (p && B.rnd() < 0.6) { var h = 30 + B.rnd() * 20; B.box(p.x, p.y - 0.5, p.z, 8, 8, h, p.face, 'tower', 'trim'); B.cyl(p.x, p.y + h, p.z, 6, 10, 4, 'tower', null, 0); } }); } }),
  crypt: ZT({ dust: '#5a4a6a',
    tiles: function (A) {
      A.add('road', PAINT.stone('#0a0810', ['#2a2434', '#322a3e', '#241e2e'])); A.add('off', PAINT.speckle('#14101a', ['#1e1826', '#5a1aa8'], 140)); A.add('ground', PAINT.solid('#06040a'));
      A.add('wall', PAINT.stone('#0a0810', ['#221c2a', '#2a2234', '#1c1622'])); A.add('trim', PAINT.solid('#3a1a5a')); A.add('kerb', PAINT.kerb('#9a4aff', '#14101a')); A.add('kerb2', PAINT.solid('#221c2a'));
      A.add('coffin', PAINT.planks(['#3a2418', '#2a1810'], '#0a0402')); A.add('beam', PAINT.stone('#0a0810', ['#221c2a', '#2a2234'])); A.add('candle', PAINT.solid('#d8c8f0'));
    },
    ceil: { every: 8, h: 6.8, tile: 'beam', w: 1.2 },
    lights: [{ every: 12, h: 1.8, sides: 1, dist: -1.2, col: [0.55, 0.3, 0.9], halo: '#c08aff', r: 10 }],
    props: [{ k: 'bldg', every: 12, dist: -2.4, w: 2.4, d: 1.2, h: 0.9, tile: 'coffin', roof: 'coffin', r: 0 }, { k: 'pillar', every: 12, dist: -1.2, rad: 0.15, h: [0.8, 1.4], tile: 'candle', seg: 4 },
      { k: 'bill', every: 18, spr: ['f_gravehand_0', 'f_mummy_0', 'f_vampire_0', 'f_ghoul_0', 'f_wraith_0'], sc: 0.07, dist: -1.6 }],
    scen: function (B) { landmark(B, 0.55, -2.6, 0, function (p) { B.bill(p.x, p.y, p.z, 'f_queen_0', 0.07); }); } }),

  /* ================= GREEBO'S PICNIC ================= */
  gkitchen: ZT({ dust: '#f1e7d0',
    tiles: function (A) {
      A.add('road', PAINT.tiles('#c8903a', '#f1e7d0', '#8a5a2a')); A.add('off', PAINT.gingham('#c4121c', '#f1e7d0')); A.add('ground', PAINT.solid('#0a0604'));
      A.add('wall', PAINT.tiles('#f1e7d0', '#9adfff', '#8a7a6a')); A.add('trim', PAINT.planks(['#8a5a2a', '#7a4e24'], '#2a1a08')); A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#8a5a2a'));
      A.add('oven', function (p) { p.fill('#3a343c'); p.rect(4, 6, 24, 18, '#12040a'); p.rect(6, 8, 20, 14, '#ff7a20'); p.rect(6, 8, 20, 2, '#ffe36a'); p.rect(4, 26, 24, 3, '#8a828a'); }); A.add('beam', PAINT.planks(['#5a3a1e', '#4a3018'], '#1a0a04')); A.add('cake', PAINT.gingham('#ff9ab4', '#f1e7d0'));
    },
    wallAt: function (i, band) { return band === 0 && i % 9 === 4 ? 'oven' : 'wall'; },
    ceil: { every: 9, h: 7, tile: 'beam', w: 1.2 },
    lights: [{ every: 14, h: 6, col: [0.9, 0.75, 0.45], halo: '#ffe0a0', r: 15 }],
    props: [{ k: 'bill', every: 12, spr: ['it_pie', 'mn_pie', 'f_rollingpin_0', 'it_pint', 'f_pieling_0', 'it_bread'], sc: [0.07, 0.1], dist: -1.6 }],
    scen: function (B) { landmark(B, 0.3, -2.4, 0, function (p) { B.bill(p.x, p.y, p.z, 'npc_greebo', 0.075); }); landmark(B, 0.7, 6, 6, function (p) { B.cyl(p.x, p.y - 0.5, p.z, 5, 4, 10, 'cake', null, 5, 'cake'); B.cyl(p.x, p.y + 3.5, p.z, 3.4, 3, 10, 'cake', null, 3.4, 'cake'); B.bill(p.x, p.y + 6.5, p.z, 'f_cake_0', 0.06); }); } }),
  yarn: ZT({ dust: '#c4121c',
    tiles: function (A) {
      A.add('road', PAINT.carpet('#5a2a6a', '#ff9ab4', '#f1e7d0')); A.add('off', PAINT.rope('#c8904a', '#8a5a2a')); A.add('ground', PAINT.carpet('#3a1a4a', '#ff9ab4', '#f1e7d0'));
      A.add('wall', PAINT.rope('#c8904a', '#8a5a2a')); A.add('trim', PAINT.carpet('#5a2a6a', '#ff9ab4', '#f1e7d0')); A.add('kerb', PAINT.kerb('#ff9ab4', '#5a2a6a')); A.add('kerb2', PAINT.solid('#5a2a6a'));
      ['#c4121c', '#3a8ac8', '#7dff3a', '#ffe36a'].forEach(function (c, i) { A.add('yarn' + i, function (p) { p.fill(c); for (var y = 0; y < 32; y += 3) p.rect(0, y, 32, 1, shade(c, 0.7)); for (var x = 0; x < 32; x += 7) p.rect(x, 0, 1, 32, shade(c, 1.2)); }); });
      A.add('beam', PAINT.carpet('#3a1a4a', '#ff9ab4', '#f1e7d0'));
    },
    ceil: { every: 12, h: 6, tile: 'beam', w: 2 },
    lights: [{ every: 16, h: 5, col: [0.85, 0.55, 0.65], halo: '#ffb0c8' }],
    props: [{ k: 'fn', every: 14, dist: [2, 10], r: 3, fn: function (B, p, q, sd, i, n) { var s = 1.6 + B.rnd() * 2.4, t = 'yarn' + (n % 4); B.cyl(p.x, p.y - 0.5 + s, p.z, s, s, 8, t, null, 0.2, t); B.cyl(p.x, p.y - 0.5, p.z, 0.2, s, 8, t, null, s); } },
      { k: 'bill', every: 16, spr: ['f_toymouse_0', 'f_clockmouse_0', 'f_feather_0', 'f_toymouse_0'], sc: 0.07, dist: -1.5 }],
    scen: function (B) { landmark(B, 0.6, 10, 8, function (p) { B.cyl(p.x, p.y - 0.5, p.z, 4, 28, 8, 'wall', null, 3, 'trim'); B.bill(p.x, p.y + 27.5, p.z, 'f_sirj_0', 0.14); }); } }), // Sir Johnathan on top of his scratching post
  cellar: ZT({ dust: '#fff6d8', groundScroll: 0.08,
    tiles: function (A) {
      A.add('road', PAINT.bricks('#1a140c', ['#4a3e2e', '#544634', '#40362a'], 8, 8)); A.add('off', PAINT.liquid(['#e8dcb0', '#fff6d8', '#ffffff', '#c8b080'])); A.add('ground', PAINT.liquid(['#d8c8a0', '#f1e7d0', '#fffbe8']));
      A.add('wall', PAINT.stone('#100c08', ['#3a3226', '#423a2c', '#342c22'])); A.add('trim', PAINT.solid('#c8b080')); A.add('kerb', PAINT.kerb('#c8b080', '#4a3e2e')); A.add('kerb2', PAINT.solid('#4a3e2e'));
      A.add('barrel', function (p) { PAINT.planks(['#6a4424', '#5a3a1e', '#7a4e2a'], '#1a0a04')(p); p.rect(0, 4, 32, 3, '#3a343c'); p.rect(0, 25, 32, 3, '#3a343c'); }); A.add('beam', PAINT.planks(['#2a1a10', '#22140c'], '#0a0402'));
    },
    ceil: { every: 8, h: 6.6, tile: 'beam', w: 1.2 },
    lights: [{ every: 18, h: 5.6, col: [0.7, 0.65, 0.4], halo: '#f0e0a0' }],
    props: [{ k: 'pillar', every: 9, dist: -2, rad: 1.1, h: 2.4, seg: 8, tile: 'barrel', cap: 'barrel' }, { k: 'bill', every: 20, spr: ['f_kraken_0', 'f_creamblob_0', 'f_slime_0'], sc: 0.07, dist: [1, 3] }] }),

  /* ================= THE DUNGEON ================= */
  emporium: ZT({ dust: '#6a5a48',
    tiles: function (A) {
      A.add('road', PAINT.carpet('#3a1a3a', '#c8903a', '#c8903a')); A.add('off', PAINT.stone('#14141a', ['#3a3a48', '#424250'])); A.add('ground', PAINT.solid('#08080a'));
      A.add('wall', PAINT.stone('#0e0e14', ['#2e2e3a', '#363644', '#28283a'])); A.add('trim', PAINT.solid('#c8903a')); A.add('kerb', PAINT.kerb('#c8903a', '#3a1a3a')); A.add('kerb2', PAINT.solid('#3a1a3a'));
      A.add('beam', PAINT.planks(['#2a1a10', '#22140c'], '#0a0402')); A.add('cloth', PAINT.banner('#5a1a8a', '#ffe36a', '#ffe36a'));
    },
    ceil: { every: 8, h: 7.6, tile: 'beam', w: 1 },
    lights: [{ every: 14, h: 3, sides: 1, dist: -1.4, col: [0.95, 0.6, 0.2], halo: '#ffb050' }],
    props: [{ k: 'bill', every: 14, spr: ['p_stall', 'p_bigchest', 'p_shrine', 'p_chest', 'p_slot'], sc: 0.08, dist: -1.6 }],
    scen: function (B) { var T = B.T; [['npc_masterbates', 0.4], ['npc_nattyboro', 0.15], ['npc_harold', 0.65], ['npc_stackedfate', 0.85], ['npc_jessiah', 0.28]].forEach(function (c, k) { var p = B.side(T.at(c[1]), k % 2 ? 1 : -1, -1.3); B.bill(p.x, p.y, p.z, c[0], 0.07); }); } }),
  depths: ZT({ dust: '#ff7a20', groundScroll: 0.05,
    tiles: function (A) {
      A.add('road', PAINT.stone('#140806', ['#3a2420', '#44281e', '#30201a'])); A.add('off', PAINT.lava); A.add('ground', PAINT.lava); A.add('wall', PAINT.stone('#0e0604', ['#2e1a14', '#3a2018', '#24140e'])); A.add('trim', PAINT.solid('#ff7a20'));
      A.add('kerb', PAINT.kerb('#ff7a20', '#2e1a14')); A.add('kerb2', PAINT.solid('#2e1a14')); A.add('beam', PAINT.stone('#0e0604', ['#2e1a14', '#3a2018']));
    },
    ceil: { every: 12, h: 8, tile: 'beam', w: 1.4 },
    lights: [{ every: 7, h: 0.5, sides: 1, dist: 1, col: [1, 0.45, 0.1], r: 10 }],
    props: [{ k: 'bill', every: 16, spr: ['f_imp_0', 'f_demon_0', 'f_magmaslug_0', 'f_emberbat_0'], sc: 0.07, dist: -1.4 }] }),
  caverns: ZT({ dust: '#9adfff',
    tiles: function (A) {
      A.add('road', PAINT.stone('#0a0e1a', ['#2a3448', '#24304a', '#303c54'])); A.add('off', PAINT.speckle('#101828', ['#1a2438', '#9adfff', '#5a2aa8'], 140)); A.add('ground', PAINT.solid('#04060a'));
      A.add('wall', PAINT.stone('#060a14', ['#1a2234', '#222a3e', '#141a2a'])); A.add('trim', PAINT.solid('#3a5a8a')); A.add('kerb', PAINT.kerb('#9adfff', '#1a2234')); A.add('kerb2', PAINT.solid('#1a2234'));
      A.add('crys', function (p) { p.fill('#9adfff'); for (var y = 0; y < 32; y++) p.rect(0, y, 32, 1, y % 8 < 3 ? '#d8f4ff' : '#5aa8e8'); }); A.add('beam', PAINT.stone('#060a14', ['#1a2234', '#222a3e']));
    },
    ceil: { every: 14, h: 9, tile: 'beam', w: 2 },
    lights: [{ every: 12, h: 2, sides: 1, dist: -1, col: [0.3, 0.6, 0.95], halo: '#9adfff' }],
    props: [{ k: 'rock', every: 8, dist: -1.6, s: [0.4, 0.9], tall: [3, 6], tile: 'crys', top: 0, seg: 4, r: 0 }, { k: 'bill', every: 22, spr: ['jv_crys0', 'jv_crystal', 'f_bat_0', 'f_slimeB_0'], sc: 0.07, dist: -1.4 }] }),

  /* ================= JOURNEY TO THE VOID ================= */
  field: ZT({ dust: '#6a8a3a',
    tiles: function (A) {
      A.add('road', PAINT.speckle('#8a7a5a', ['#7a6a4a', '#9a8a6a', '#6a5a3a'], 200)); A.add('off', PAINT.grass(['#3a7a2a', '#4a8a32', '#2e6a22', '#5a9a3a'])); A.add('ground', PAINT.grass(['#3a7a2a', '#447a28', '#305a1e', '#5a9a3a']));
      A.add('wall', PAINT.fence('#8a6a3a', '#8a6a3a')); A.add('trim', PAINT.solid('#8a6a3a')); A.add('kerb', PAINT.kerb('#f1e7d0', '#3a6a2a')); A.add('kerb2', PAINT.solid('#5a4a2a'));
      A.add('bark', PAINT.planks(['#5a3a1a', '#4a3014'], '#2a1a08')); A.add('leaf', PAINT.grass(['#2a6a1a', '#3a8a22', '#1e4a10'])); A.add('rock', PAINT.stone('#2a2a30', ['#5a5a64', '#4a4a54', '#6a6a74']));
    },
    props: [{ k: 'tree', every: 16, dist: [4, 20], h: [6, 11], chance: 0.6 }, { k: 'rock', every: 40, dist: [30, 60], s: [10, 18], tall: [1.6, 2.6], top: 0.15, seg: 6, r: 10, chance: 0.7 }],
    scen: function (B) { B.along(36, function (q, sd, i) { var p = inPlace(B, q, sd, 14, 6); if (p && B.rnd() < 0.5) B.bill(p.x, p.y, p.z, ['jv_mtn', 'jv_tree', 'f_slime_0', 'f_cowpig_0'][i % 4], 0.12); }); } }),
  jvtown: ZT({ dust: '#5a4a48',
    tiles: function (A) {
      A.add('road', PAINT.stone('#1a1418', ['#4a4044', '#544a4e', '#3e3438'])); A.add('off', PAINT.tiles('#5a4a48', '#4e403e', '#2a1a1a')); A.add('ground', PAINT.stone('#100c0e', ['#2a2226', '#24202a']));
      A.add('wall', PAINT.metal('#3a343c', '#12040a', '#6a646c')); A.add('trim', PAINT.solid('#7a727a')); A.add('kerb', PAINT.kerb('#9adfff', '#1a1418')); A.add('kerb2', PAINT.solid('#3a343c'));
      A.add('win1', PAINT.window('#3a3440', '#9adfff', true)); A.add('win2', PAINT.window('#2a2430', '#5a7a9a', false)); A.add('pipe', PAINT.pipe('#6a646c')); A.add('roof', PAINT.metal('#2a2428', '#12040a', '#5a545c'));
    },
    props: [{ k: 'bldg', every: 12, dist: [3, 8], w: [8, 12], d: 8, h: [10, 26], tile: ['win1', 'win2'], roof: 'roof', r: 6 }, { k: 'pipe', every: 30, h: [8, 10], r: 0.6 }, { k: 'lamp', every: 18, h: 5 },
      { k: 'bill', every: 24, spr: ['jv_lamp0', 'npc_spermaid', 'jv_lamp0', 'npc_greebo', 'ch_idle0'], sc: 0.07, dist: -1.4 }],
    lights: [{ every: 22, h: 6, sides: 1, dist: 4, col: [0.3, 0.7, 0.9], halo: '#9adfff' }] }),
  core: ZT({ dust: '#c08aff',
    tiles: function (A) {
      A.add('road', function (p) { p.fill('#0a0418'); p.rect(0, 0, 32, 2, '#ff2a8a'); p.speck(['#3a1a6a', '#c08aff'], 30); }); A.add('off', PAINT.solid('#1a0a30')); A.add('wall', function (p) { p.clear(); p.rect(0, 0, 32, 4, '#ff2a8a'); p.rect(0, 1, 32, 1, '#ffffff'); });
      A.add('trim', PAINT.solid('#ff2a8a')); A.add('skirt', function (p) { p.fill('#06020e'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 1, '#2a0a4a'); }); A.add('kerb', PAINT.kerb('#ff2a8a', '#1a0a30')); A.add('kerb2', PAINT.solid('#1a0a30'));
      A.add('rock', PAINT.speckle('#14081e', ['#2a1a3a', '#9a4aff'], 100)); A.add('ring', PAINT.solid('#c08aff'));
    },
    lights: [{ every: 12, h: 2, col: [0.6, 0.2, 0.8], halo: '#c08aff' }],
    scen: function (B) { var T = B.T, b = T.box, cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2;
      for (var n = 0; n < 18; n++) { var a = B.rnd() * 6.28, r = 40 + B.rnd() * 120, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!B.clear(x, z, 8)) continue; var s = 3 + B.rnd() * 8; B.cyl(x, -10 + B.rnd() * 40, z, s, s * 0.8, 5, 'rock', null, s * 0.2, 'rock'); }
      B.bill(cx, T.S[0].y - 40, cz, 'jv_void0', 1.4, { anim: function (t) { return Math.floor(t * 2) % 2 ? 'jv_void1' : 'jv_void0'; } }); // the core itself, under you
      B.along(16, function (q, sd, i) { if (i % 2) return; var p = B.side(q, sd, 1); for (var k = 0; k < 3; k++) B.hcyl(p.x, p.y + k * 2, p.z, p.x, p.y + k * 2 + 0.6, p.z, 0.2, 'ring'); }); } }),

  /* ================= THE CRIMSON MOON ================= */
  crater: ZT({ dust: '#8a2a2a',
    tiles: function (A) {
      A.add('road', PAINT.speckle('#5a1414', ['#4a1010', '#6a1a1a', '#3a0a0a'], 240)); A.add('off', PAINT.crater('#3a0a0a', '#200404', '#5a1414')); A.add('ground', PAINT.crater('#2a0606', '#140202', '#4a1010'));
      A.add('wall', PAINT.stone('#140202', ['#4a1010', '#3a0a0a', '#5a1414'])); A.add('trim', PAINT.solid('#6a1a1a')); A.add('kerb', PAINT.kerb('#f1e7d0', '#5a1414')); A.add('kerb2', PAINT.solid('#4a1010')); A.add('rock', PAINT.stone('#140202', ['#4a1010', '#3a0a0a']));
    },
    props: [{ k: 'rock', every: 8, dist: [1, 10], s: [2, 6], tall: [1, 3], tile: 'rock', chance: 0.7 }, { k: 'bill', every: 30, spr: ['f_moon_0', 'f_stormling_0', 'f_harpy_0'], sc: 0.07, dist: [2, 6], chance: 0.6 }],
    lights: [{ every: 26, h: 3, col: [0.8, 0.2, 0.15], halo: '#ff4030' }],
    scen: function (B) { B.along(10, function (q, sd) { var p = inPlace(B, q, sd, 14, 6); if (p) B.cyl(p.x, p.y - 0.5, p.z, 8, 10 + B.rnd() * 12, 6, 'wall', null, 4, 'rock'); }); } }), // the crater's sides rising up round you
  temple: ZT({ dust: '#3a0a14',
    tiles: function (A) {
      A.add('road', PAINT.stone('#040204', ['#1a1218', '#221620', '#140e12'])); A.add('off', PAINT.crater('#2a0606', '#140202', '#4a1010')); A.add('ground', PAINT.crater('#2a0606', '#140202', '#4a1010'));
      A.add('wall', function (p) { PAINT.stone('#040204', ['#1a1218', '#221620'])(p); p.rect(0, 14, 32, 2, '#c4121c'); for (var x = 2; x < 32; x += 8) p.rect(x, 10, 3, 10, '#c4121c'); }); A.add('trim', PAINT.solid('#c4121c'));
      A.add('kerb', PAINT.kerb('#c4121c', '#040204')); A.add('kerb2', PAINT.solid('#1a1218')); A.add('obsid', PAINT.stone('#020102', ['#140e12', '#1a1218', '#0a060a']));
    },
    props: [{ k: 'pillar', every: 14, dist: [1, 2], rad: 1.4, rad2: 0.3, h: [12, 20], seg: 4, tile: 'obsid', r: 2, light: { col: [0.9, 0.1, 0.1], halo: '#ff2030', r: 9 } }, { k: 'arch', every: 44, h: 14, tile: 'obsid', top: 'trim', w: 1.4, thick: 1.4 }],
    scen: function (B) { landmark(B, 0.5, 20, 10, function (p) { B.cyl(p.x, p.y - 0.5, p.z, 12, 8, 4, 'obsid', null, 6, 'obsid'); B.cyl(p.x, p.y + 7.5, p.z, 6, 6, 4, 'obsid', null, 2, 'trim'); B.bill(p.x, p.y + 13.5, p.z, 'f_kingblum_0', 0.12); B.light(p.x, p.y + 14, p.z, 30, [0.9, 0.1, 0.1], '#ff2030'); }); } }),
  megablum: ZT({ dust: '#9a4aff', groundScroll: 0.08,
    tiles: function (A) {
      A.add('road', PAINT.flesh('#4a1a2a', '#2a0a1a', '#6a2a3a')); A.add('off', PAINT.liquid(['#3a106a', '#5a1aa8', '#9a4aff', '#24084a'])); A.add('ground', PAINT.liquid(['#2a0a4a', '#3a106a', '#7a2ad8']));
      A.add('wall', function (p) { p.fill('#3a0a24'); for (var x = 0; x < 32; x += 8) { for (var y = 0; y < 20; y++) p.rect(x + Math.floor(y / 5), y, 8 - Math.floor(y / 2.5), 1, '#f1e7d0'); } }); A.add('trim', PAINT.solid('#c4121c'));
      A.add('kerb', PAINT.kerb('#9a4aff', '#2a0418')); A.add('kerb2', PAINT.solid('#4a1a3a')); A.add('beam', PAINT.flesh('#5a1a2a', '#c4121c', '#7a2a3a'));
    },
    ceil: { every: 10, h: 8, tile: 'beam', w: 2 },
    lights: [{ every: 14, h: 6, col: [0.6, 0.15, 0.75], halo: '#c08aff' }],
    props: [{ k: 'bill', every: 14, spr: ['f_blumling_0', 'f_blumeye_0', 'f_blumspore_0', 'f_blumguard_0'], sc: 0.07, dist: -1.6, anim: function (s) { return s === 'f_blumling_0' ? animOf('f_blumling_', 4, 6) : null; } }],
    scen: function (B) { var T = B.T, q = T.at(0.6); B.bill(q.x + q.nx * 60, q.y - 10, q.z + q.nz * 60, 'f_mega_0', 0.7); gooPuddles(B, [0.25, 0.65], 2.3); }, kartStep: hazardStep })
});
