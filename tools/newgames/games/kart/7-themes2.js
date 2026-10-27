/* =====================================================================================================
   THE PLACES, part two: the Blood Cup and the Moon Cup.
   ===================================================================================================== */
function gooPuddles(B, fs, r) { B.goo = B.goo || []; fs.forEach(function (f, n) { var q = B.T.at(f), lat = ((n % 3) - 1) * B.T.def.hw * 0.5, p = B.T.pos(q.i, lat); B.goo.push({ x: p.x, z: p.z, r: r || 2.2, kind: 'goo' }); var s = (r || 2.2) * 1.1; B.m.quad([p.x - s, p.y + 0.05, p.z - s], [p.x + s, p.y + 0.05, p.z - s], [p.x + s, p.y + 0.05, p.z + s], [p.x - s, p.y + 0.05, p.z + s], [0.001, 0.001, 0.999, 0.001, 0.999, 0.999, 0.001, 0.999], B.A.tile('goopool'), B.T.def.light); }); }
Object.assign(THEMES, {
  /* ---------------- The Cream Sewers: brick walkways over a cream river, pipes pouring more in ---------------- */
  sewer: {
    dust: '#fff6d8', groundScroll: 0.15,
    tiles: function (A) {
      A.add('road', PAINT.bricks('#1a140c', ['#4a3e2e', '#544634', '#40362a', '#5a4c38'], 16, 8)); A.add('off', PAINT.liquid(['#e8dcb0', '#fff6d8', '#ffffff', '#c8b080']));
      A.add('ground', PAINT.liquid(['#d8c8a0', '#f1e7d0', '#fffbe8', '#b8a070'])); A.add('wall', PAINT.bricks('#100c08', ['#3a3226', '#423a2c', '#342c22', '#4a3e30'], 16, 8, { moss: '#4a6a2a' }));
      A.add('trim', PAINT.solid('#c8b080')); A.add('kerb', PAINT.kerb('#c8b080', '#5a4c38')); A.add('kerb2', PAINT.solid('#6a5a44'));
      A.add('pipe', PAINT.pipe('#8a7a5a')); A.add('beam', PAINT.bricks('#100c08', ['#2a2420', '#342c24'], 8, 8)); A.add('grate', function (p) { p.fill('#12040a'); for (var x = 1; x < 32; x += 4) p.rect(x, 0, 2, 32, '#5a545c'); });
    },
    wallAt: function (i, band) { return band === 0 && i % 20 === 10 ? 'grate' : 'wall'; },
    scen: function (B) {
      var T = B.T; for (var i = 0; i < T.N; i += 8) B.beam(i, 7.6, 'beam', 1.4);
      for (var li = 4; li < T.N; li += 24) { var lq = T.S[li]; B.light(lq.x, lq.y + 6.8, lq.z, 16, [0.45, 0.5, 0.25], '#e8f0a0'); }
      B.pours = [];
      for (var j = 5; j < T.N; j += 22) { var q = T.S[j], sd = j % 44 < 22 ? 1 : -1, w = B.side(q, sd, -0.7), x2 = w.x + q.nx * sd * 3, z2 = w.z + q.nz * sd * 3; B.hcyl(w.x - q.nx * sd * 1.4, q.y + 5, w.z - q.nz * sd * 1.4, x2, q.y + 5, z2, 0.9, 'pipe'); B.pours.push({ x: w.x - q.nx * sd * 1.6, y: q.y + 4.4, z: w.z - q.nz * sd * 1.6 }); }
      B.along(20, function (q, sd, i) { var p = B.side(q, sd, -1.5); B.bill(p.x, p.y, p.z, i % 2 ? 'f_rat_0' : 'p_creampool', i % 2 ? 0.07 : 0.06, i % 2 ? { anim: function (t) { return 'f_rat_' + (Math.floor(t * 8) % 4); } } : null); });
    },
    drawDyn: function (R, m) { (R.B.pours || []).forEach(function (p, i) { for (var k = 0; k < 4; k++) { var f = ((R.t * 1.6 + k / 4 + i * 0.3) % 1); spark(R.soft || m, R.A, p.x + Math.sin(k * 7 + i) * 0.2, p.y - f * 5, p.z + Math.cos(k * 5) * 0.2, 0.42, R.soft ? 'puff' : 'cream', [0.62, 0.6, 0.52]); } }); }
  },
  /* ---------------- Potbelly Arcade: neon floor, cabinets for walls, pinball bumpers in the zigzags ---------------- */
  arcade: {
    dust: '#ff2a8a',
    tiles: function (A) {
      A.add('road', PAINT.grid('#140a24', '#ff2a8a', '#5a1a4a')); A.add('off', function (p) { p.fill('#0e0a2a'); for (var i = 0; i < 14; i++) { var x = Math.floor(p.rnd() * 28), y = Math.floor(p.rnd() * 28), c = ['#ff2a8a', '#9adfff', '#ffe36a', '#7dff3a'][i % 4]; p.rect(x, y, 3, 1, c); p.rect(x + 2, y + 1, 1, 2, c); } });
      A.add('ground', function (p) { p.fill('#0e0a2a'); for (var i = 0; i < 14; i++) { var x = Math.floor(p.rnd() * 28), y = Math.floor(p.rnd() * 28), c = ['#ff2a8a', '#9adfff', '#ffe36a', '#7dff3a'][i % 4]; p.rect(x, y, 3, 1, c); p.rect(x + 2, y + 1, 1, 2, c); } });
      A.add('wall', function (p) { p.fill('#12040a'); p.rect(0, 10, 32, 4, '#9adfff'); p.rect(0, 11, 32, 2, '#ffffff'); p.rect(0, 22, 32, 2, '#ff2a8a'); }); A.add('trim', PAINT.solid('#ff2a8a'));
      A.add('kerb', PAINT.kerb('#9adfff', '#14062a')); A.add('kerb2', PAINT.solid('#3a1a5a'));
      ['r', 'g', 'b', 'p'].forEach(function (c, i) { A.add('cab_' + c, PAINT.cab(['#8a0a14', '#1a6a2a', '#1a3a8a', '#5a1a8a'][i], ['#3a8a5a', '#2a3a8a', '#8a2a5a', '#8a6a1a'][i], '#12040a')); });
      A.add('cabside', function (p) { p.fill('#2a1438'); p.rect(0, 0, 2, 32, '#ff2a8a'); p.rect(30, 0, 2, 32, '#9adfff'); }); A.add('neonr', PAINT.solid('#ff2a8a')); A.add('neong', PAINT.solid('#7dff3a')); A.add('neonb', PAINT.solid('#9adfff')); A.add('neonp', PAINT.solid('#ffe36a')); A.add('bumper', function (p) { for (var y = 0; y < 32; y++) p.rect(0, y, 32, 1, y % 8 < 4 ? '#ff2a8a' : '#ffe36a'); });
    },
    scen: function (B) {
      var T = B.T, n = 0; B.bumpers = [];
      B.along(4.5, function (q, sd, i) { var p = B.side(q, sd, 1.8); if (!B.clear(p.x, p.z, 1)) return; var ry = p.face + Math.PI / 2, c = 'rgbp'[(n++) % 4]; B.box(p.x, p.y - 0.4, p.z, 3.2, 2.6, 6, ry, 'cabside', 'cabside', [0.7, 0.6, 0.75]); var a = ahead(p, 1.32); B.panel(a.x, p.y + 1.4, a.z, 3.0, 4.2, ry, 'cab_' + c, [0.85, 0.85, 0.85]); B.box(p.x, p.y + 5.6, p.z, 3.3, 2.7, 0.4, ry, 'neon' + c, 'neon' + c, [1, 1, 1]); if (n % 3 === 0) B.light(p.x, p.y + 4, p.z, 9, { r: [0.9, 0.15, 0.5], g: [0.3, 0.9, 0.2], b: [0.3, 0.7, 0.95], p: [0.9, 0.8, 0.3] }[c], null); });
      B.along(40, function (q, sd, i) { var p = inPlace(B, q, sd, 12, 6); if (p) B.decal(p.x, p.y - 0.5, p.z, 69 * 0.2, 72 * 0.2, p.face + Math.PI / 2, 'fac_arcade', [0.8, 0.8, 0.8]); });
      [0.18, 0.3, 0.42, 0.62].forEach(function (f, j) { var q = T.at(f), p = T.pos(q.i, (j % 2 ? 1 : -1) * T.def.hw * 0.55); B.bumpers.push({ x: p.x, z: p.z, r: 1.3, hit: 0 }); B.cyl(p.x, p.y, p.z, 1.3, 1.2, 10, 'bumper', null, 1.3, 'glow'); });
      var big = [0.05, 0.5, 0.8]; big.forEach(function (f, j) { var p = inPlace(B, T.at(f), j % 2 ? 1 : -1, 14, 6); if (p) B.decal(p.x, p.y, p.z, 96 * 0.12, 160 * 0.12, p.face + Math.PI / 2, 'ao_cabbig'); });
      var pb = B.side(T.S[4], 1, -1.2); B.bill(pb.x, pb.y, pb.z, 'npc_potbelly', 0.065);
    },
    kartStep: hazardStep,
    drawDyn: function (R, m) { (R.bumpers || []).forEach(function (b) { if (b.hit > 0) for (var k = 0; k < 6; k++) spark(R.glow || m, R.A, b.x + Math.cos(k) * 1.6, R.T.locate(b.x, b.z, -1).y + 1.4, b.z + Math.sin(k) * 1.6, 0.5, R.glow ? 'halo' : 'glow', [0.6, 0.5, 0.2]); }); }
  },
  /* ---------------- Spuzzworld Factory: the dark bloody steam factory under the lair ---------------- */
  factory: {
    dust: '#d8d0d8',
    tiles: function (A) {
      A.add('road', function (p) { p.fill('#3a343c'); for (var y = 0; y < 32; y += 4) for (var x = 0; x < 32; x += 4) { p.rect(x, y, 3, 3, '#4a444c'); p.px(x, y, '#5a545c'); } p.speck(['#5a0a10', '#3a0606'], 20); });
      A.add('off', PAINT.metal('#5a2a1a', '#2a1008', '#8a5a3a')); A.add('ground', PAINT.speckle('#1a0606', ['#3a0a0a', '#120404', '#5a0a10'], 180));
      A.add('wall', PAINT.metal('#2a2428', '#12040a', '#5a545c')); A.add('trim', function (p) { for (var x = 0; x < 32; x++) p.rect(x, 0, 1, 32, ((x >> 2) % 2) ? '#ffe36a' : '#12040a'); });
      A.add('kerb', PAINT.kerb('#ffe36a', '#12040a')); A.add('kerb2', PAINT.solid('#3a343c')); A.add('beam', PAINT.metal('#3a343c', '#12040a', '#8a828a')); A.add('pipe', PAINT.pipe('#6a5a50'));
      A.add('vent', function (p) { p.fill('#12040a'); for (var y = 2; y < 32; y += 5) p.rect(2, y, 28, 2, '#5a545c'); });
      A.add('cage', function (p) { p.clear(); for (var x = 0; x < 32; x += 6) p.rect(x, 0, 2, 32, '#5a545c'); p.rect(0, 0, 32, 2, '#5a545c'); p.rect(0, 30, 32, 2, '#5a545c'); });
      A.add('gear', PAINT.metal('#6a5a50', '#2a2018', '#a89a80'));
    },
    scen: function (B) {
      var T = B.T; for (var i = 0; i < T.N; i += 10) B.beam(i, 6.4, 'beam', 1.2);
      for (var fi = 5; fi < T.N; fi += 20) { var fq = T.S[fi]; B.light(fq.x, fq.y + 6, fq.z, 14, fi % 40 < 20 ? [0.9, 0.15, 0.08] : [0.8, 0.5, 0.2], fi % 40 < 20 ? '#ff4030' : '#ffb060'); }
      for (var j = 3; j < T.N; j += 16) { var q = T.S[j], a = B.side(q, 1, -0.6), b = B.side(q, -1, -0.6); B.hcyl(a.x, q.y + 4.6, a.z, b.x, q.y + 4.6, b.z, 0.4, 'pipe'); }
      B.vents = []; (T.def.vents || []).forEach(function (f, n) { var q = T.at(f), lat = ((n % 3) - 1) * T.def.hw * 0.45, p = T.pos(q.i, lat); B.vents.push({ x: p.x, z: p.z, y: p.y, ph: n * 1.3 }); B.m.quad([p.x - 1.4, p.y + 0.04, p.z - 1.4], [p.x + 1.4, p.y + 0.04, p.z - 1.4], [p.x + 1.4, p.y + 0.04, p.z + 1.4], [p.x - 1.4, p.y + 0.04, p.z + 1.4], [0.01, 0.01, 0.99, 0.01, 0.99, 0.99, 0.01, 0.99], B.A.tile('vent'), T.def.light); });
      B.along(24, function (q, sd, i) { var p = B.side(q, sd, -1.5); var w = ['f_blumguard_0', 'sw_hob0', 'h_gloop_adult_idle0', 'f_blumguard_1'][i % 4]; B.bill(p.x, p.y, p.z, w, w === 'sw_hob0' ? 0.045 : 0.07); });
      B.gears = []; for (var g = 8; g < T.N; g += 30) { var q2 = T.S[g], sd2 = g % 60 < 30 ? 1 : -1, p2 = B.side(q2, sd2, -0.9); B.gears.push({ x: p2.x, y: q2.y + 3.4, z: p2.z, ry: Math.atan2(q2.tz, q2.tx), r: 2.6, dir: g % 2 ? 1 : -1 }); }
    },
    kartStep: function (R, k, loc, dt) {
      (R.def.belts || []).forEach(function (b) { var i0 = R.T.idx(b[0]), n = Math.round(b[1] * R.T.N), di = (loc.i - i0 + R.T.N) % R.T.N; if (di < n && !k.air && Math.abs(loc.lat) < R.def.hw) { k.kx += loc.s.tx * 18 * dt; k.kz += loc.s.tz * 18 * dt; } });
      (R.B.vents || []).forEach(function (v) { var on = ((R.t + v.ph) % 3) > 2.2; if (on && !k.air && Math.hypot(k.x - v.x, k.z - v.z) < 1.8) { k.air = true; k.vy = 9; k.spd *= 0.75; if (k === R.me) sfx.play('cook'); } });
    },
    drawDyn: function (R, m) {
      var A = R.A, L = R.def.light;
      (R.B.vents || []).forEach(function (v) { var ph = (R.t + v.ph) % 3; if (ph > 1.9) for (var k = 0; k < 8; k++) { var f = (ph - 1.9) / 1.1; spark(R.soft || m, A, v.x + Math.sin(k * 3 + R.t * 5) * 0.8, v.y + 0.5 + k * 0.6 * (0.3 + f), v.z + Math.cos(k * 2 + R.t * 4) * 0.8, 0.6 + k * 0.12, R.soft ? 'puff' : 'steam', [0.5, 0.5, 0.52]); } });
      (R.B.gears || []).forEach(function (g) { var c = Math.cos(g.ry), s = Math.sin(g.ry), a0 = R.t * 0.8 * g.dir, n = 12; for (var i = 0; i < n; i++) { var a = a0 + i / n * Math.PI * 2, b = a0 + (i + 1) / n * Math.PI * 2, rr = i % 2 ? g.r : g.r * 1.25; var P = function (aa, r) { return [g.x + c * Math.cos(aa) * r, g.y + Math.sin(aa) * r, g.z + s * Math.cos(aa) * r]; }; m.quad(P(a, 0.6), P(b, 0.6), P(b, rr), P(a, rr), [0, 0, 1, 0, 1, 1, 0, 1], A.tile('gear'), L); } });
    }
  },
  /* ---------------- Blumhead's Lair: flesh, veins, purple goo, his eyes on the walls ---------------- */
  lair: {
    dust: '#9a4aff', groundScroll: 0.1,
    tiles: function (A) {
      A.add('road', PAINT.flesh('#5a1a2a', '#3a0a1a', '#7a2a3a')); A.add('off', PAINT.liquid(['#3a106a', '#5a1aa8', '#9a4aff', '#24084a']));
      A.add('ground', PAINT.liquid(['#2a0a4a', '#3a106a', '#7a2ad8', '#14042a'])); A.add('wall', PAINT.flesh('#3a0a24', '#9a0a2a', '#5a1a3a')); A.add('trim', PAINT.solid('#2a0418'));
      A.add('kerb', PAINT.kerb('#9a4aff', '#2a0418')); A.add('kerb2', PAINT.solid('#4a1a3a')); A.add('beam', function (p) { p.fill('#d8ccb0'); p.speck(['#b8ac90', '#f1e7d0'], 60); p.rect(0, 14, 32, 4, '#a89a80'); });
      A.add('walleye', function (p) { PAINT.flesh('#3a0a24', '#9a0a2a', '#5a1a3a')(p); for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var d = Math.hypot(x - 15.5, (y - 15.5) * 1.6); if (d < 13) p.px(x, y, d > 11 ? '#12040a' : d < 5 ? (d < 2.5 ? '#12040a' : '#c4121c') : '#f1e7d0'); } });
    },
    wallAt: function (i, band) { return band === 1 && i % 16 === 8 ? 'walleye' : 'wall'; },
    scen: function (B) {
      var T = B.T; for (var i = 0; i < T.N; i += 7) B.beam(i, 6.8, 'beam', 0.9);
      for (var ei = 8; ei < T.N; ei += 16) [1, -1].forEach(function (sd) { var p = B.side(T.S[ei], sd, -0.8); B.light(p.x, p.y + 5, p.z, 12, [0.55, 0.15, 0.7], null); });
      gooPuddles(B, T.def.goo || [], 2.3);
      B.along(22, function (q, sd, i) { var p = B.side(q, sd, -1.8); B.bill(p.x, p.y, p.z, i % 3 ? 'f_blumling_0' : 'f_blumeye_0', 0.07, { anim: i % 3 ? function (t) { return 'f_blumling_' + (Math.floor(t * 6 + i) % 4); } : function (t) { return 'f_blumeye_' + (Math.floor(t * 3 + i) % 3); } }); });
      var hp = B.side(T.S[Math.round(T.N * 0.5)], 1, -2.2); B.bill(hp.x, hp.y, hp.z, 'p_heart0', 0.09, { anim: function (t) { return Math.floor(t * 2.4) % 2 ? 'p_heart1' : 'p_heart0'; } });
    },
    kartStep: hazardStep
  },
  /* ---------------- Greebo's Picnic: a big day out on the hills, ants on the march, Sir Johnathan asleep ---------------- */
  picnic: {
    dust: '#8a6a3a',
    tiles: function (A) {
      A.add('road', PAINT.speckle('#8a6a3a', ['#7a5a2e', '#9a7a48', '#6a4a24', '#a8865a'], 220)); A.add('off', PAINT.grass(['#3a6a1a', '#4a7a22', '#2e5a14', '#5a8a2a']));
      A.add('ground', PAINT.grass(['#3a6a1a', '#447220', '#305e16', '#5a8a2a'])); A.add('wall', PAINT.fence('#f1e7d0', '#f1e7d0')); A.add('trim', PAINT.solid('#f1e7d0'));
      A.add('kerb', PAINT.kerb('#ff2630', '#f1e7d0')); A.add('kerb2', PAINT.solid('#6a4a24')); A.add('skirt', PAINT.grass(['#2e5a14', '#3a6a1a']));
      A.add('gingham', PAINT.gingham('#c4121c', '#f1e7d0')); A.add('wicker', PAINT.rope('#c8904a', '#8a5a2a')); A.add('bark', PAINT.planks(['#5a3a1a', '#4a3014'], '#2a1a08')); A.add('leaf', PAINT.grass(['#2a6a1a', '#3a8a22', '#1e4a10', '#5aa82a']));
      A.add('hill', PAINT.grass(['#4a7a22', '#3a6a1a', '#5a8a2a']));
    },
    scen: function (B) {
      var T = B.T;
      B.along(18, function (q, sd) { var p = inPlace(B, q, sd, 5 + B.rnd() * 14, 4); if (p && B.rnd() < 0.6) B.tree(p.x, p.y - 0.4, p.z, 8 + B.rnd() * 6, 'bark', 'leaf'); });
      var hm = inPlace(B, T.S[Math.round(T.N * 0.12)], 1, 16, 10) || inPlace(B, T.S[Math.round(T.N * 0.12)], -1, 16, 10); if (hm) { B.box(hm.x, hm.y - 0.4, hm.z, 14, 9, 8, hm.face, 'wicker', 'gingham'); B.box(hm.x, hm.y + 7.6, hm.z, 15, 10, 1, hm.face, 'gingham', 'gingham'); }
      [0.32, 0.6, 0.86].forEach(function (f, i) { var p = inPlace(B, T.at(f), i % 2 ? 1 : -1, 8, 6); if (p) { B.m.quad([p.x - 5, p.y - 0.3, p.z - 4], [p.x + 5, p.y - 0.3, p.z - 4], [p.x + 5, p.y - 0.3, p.z + 4], [p.x - 5, p.y - 0.3, p.z + 4], [0, 0, 2.5, 0, 2.5, 2, 0, 2], B.A.tile('gingham'), T.def.light); B.bill(p.x, p.y - 0.3, p.z, 'it_pie', 0.16); B.bill(p.x + 2, p.y - 0.3, p.z + 1, 'it_pint', 0.12); } });
      var sj = inPlace(B, T.S[Math.round(T.N * 0.45)], 1, 40, 18) || inPlace(B, T.S[Math.round(T.N * 0.45)], -1, 40, 18); if (sj) { B.cyl(sj.x, sj.y - 0.5, sj.z, 18, 9, 10, 'hill', null, 4, 'hill'); B.bill(sj.x, sj.y + 8.5, sj.z, 'f_sirj_0', 0.12); }
      var gp = B.side(T.S[4], -1, 1); B.bill(gp.x, gp.y, gp.z, 'npc_greebo', 0.07);
      B.antsAt = [0.21, 0.69].map(function (f) { return T.idx(f); });
    },
    init: function (R) { R.ants = []; (R.B.antsAt || []).forEach(function (i, n) { for (var a = 0; a < 6; a++) R.ants.push({ i: i, k: a / 6, sp: 0.09 * (n % 2 ? 1 : -1) }); }); },
    step: function (R, dt) { var T = R.T, e = T.edge; R.ants.forEach(function (a) { a.k = (a.k + a.sp * dt + 1) % 1; var lat = (a.k * 2 - 1) * (e + 2), p = T.pos(a.i, lat); a.x = p.x; a.z = p.z; a.y = p.y; }); },
    kartStep: function (R, k) { R.ants.forEach(function (a) { if (Math.abs(a.x - k.x) < 1.1 && Math.abs(a.z - k.z) < 1.1 && !k.air) { if (hitKart(k, null)) { if (k === R.me) say(k, 'ouch'); } } }); },
    drawBills: function (R, sp) { R.ants.forEach(function (a, i) { billboard(sp, a.x, a.y, a.z, 'f_ant_' + (Math.floor(R.t * 10 + i) % 4), 0.08, { flip: a.sp < 0 }); }); for (var w = 0; w < 5; w++) { var t = R.t * 0.6 + w * 1.3, s = R.T.S[Math.floor((w / 5 + R.t * 0.004) * R.T.N) % R.T.N]; billboard(sp, s.x + Math.cos(t * 3) * 5, s.y + 4 + Math.sin(t * 5), s.z + Math.sin(t * 3) * 5, 'f_wasp_' + (Math.floor(R.t * 14) % 4), 0.06); } }
  },
  /* ---------------- The Cumheads Quest Dungeon: stone corridors, torches, stairs down and back up ---------------- */
  dungeon: {
    dust: '#5a5a6a',
    tiles: function (A) {
      A.add('road', PAINT.stone('#14141a', ['#3a3a48', '#424250', '#34343e', '#4a4a58'])); A.add('off', PAINT.speckle('#24242c', ['#34343e', '#18181e', '#4a4a58'], 200));
      A.add('ground', PAINT.solid('#08080a')); A.add('wall', PAINT.stone('#0e0e14', ['#2e2e3a', '#363644', '#28283a', '#3e3e4c'])); A.add('trim', PAINT.solid('#1a1a22'));
      A.add('kerb', PAINT.kerb('#7a7a8a', '#2a2a34')); A.add('kerb2', PAINT.solid('#2a2a34')); A.add('beam', PAINT.planks(['#2a1a10', '#22140c'], '#0a0402'));
      A.add('walltorch', function (p) { PAINT.stone('#0e0e14', ['#2e2e3a', '#363644', '#28283a'])(p); p.rect(14, 12, 4, 14, '#4a3018'); p.rect(12, 10, 8, 3, '#2a1a0c'); for (var y = 2; y < 10; y++) p.rect(16 - (10 - y) / 3, y, Math.max(1, (10 - y) / 1.5), 1, y < 5 ? '#ffe36a' : '#ff7a20'); });
      A.add('door', function (p) { PAINT.stone('#0e0e14', ['#2e2e3a', '#363644'])(p); p.rect(6, 4, 20, 28, '#3a2410'); for (var x = 8; x < 26; x += 4) p.rect(x, 4, 1, 28, '#1a0e04'); p.rect(20, 18, 3, 3, '#c8903a'); });
    },
    wallAt: function (i, band) { if (band === 0 && i % 18 === 9) return 'walltorch'; if (band === 0 && i % 31 === 15) return 'door'; return 'wall'; },
    scen: function (B) {
      var T = B.T; for (var i = 0; i < T.N; i += 8) B.beam(i, 7.6, 'beam', 1);
      for (var ti = 9; ti < T.N; ti += 18) [1, -1].forEach(function (sd) { var p = B.side(T.S[ti], sd, -1.2); B.light(p.x, p.y + 2.6, p.z, 13, [0.95, 0.5, 0.12], '#ffa040'); });
      B.along(26, function (q, sd, i) { var p = B.side(q, sd, -1.4); var w = ['f_skeleton_0', 'p_chest', 'f_ghost_0', 'p_skulls', 'f_mummy_0', 'p_bigchest'][i % 6]; if (KIT.has(w)) B.bill(p.x, p.y, p.z, w, 0.07); });
    }
  },
  /* ---------------- Journey to the Void: a crystal road floating through the void, islands and portals ---------------- */
  void: {
    dust: '#c08aff',
    tiles: function (A) {
      A.add('road', function (p) { p.fill('#1a0a30'); p.rect(0, 0, 32, 1, '#9a4aff'); p.rect(0, 0, 1, 32, '#9a4aff'); p.rect(1, 1, 30, 1, '#3a1a6a'); p.speck(['#2a1448', '#c08aff'], 18); });
      A.add('off', PAINT.solid('#3a1a6a')); A.add('wall', function (p) { p.clear(); p.rect(0, 0, 32, 6, '#c08aff'); p.rect(0, 1, 32, 2, '#ffffff'); for (var x = 0; x < 32; x += 16) p.rect(x, 6, 3, 26, '#5a2aa8'); });
      A.add('trim', PAINT.solid('#c08aff')); A.add('skirt', function (p) { p.fill('#0a0418'); for (var y = 0; y < 32; y += 6) p.rect(0, y, 32, 1, '#2a0a4a'); }); A.add('kerb', PAINT.kerb('#ffe36a', '#5a2aa8')); A.add('kerb2', PAINT.solid('#5a2aa8'));
      A.add('isle', PAINT.grass(['#3a6a3a', '#2e5a2e', '#4a7a4a'])); A.add('rock', PAINT.speckle('#2a1a3a', ['#3a2a4a', '#1a0a2a'], 120));
    },
    scen: function (B) {
      var T = B.T;
      for (var n = 0; n < 26; n++) { var a = B.rnd() * Math.PI * 2, r = 60 + B.rnd() * 160, b = T.box, x = (b[0] + b[2]) / 2 + Math.cos(a) * r, z = (b[1] + b[3]) / 2 + Math.sin(a) * r; if (!B.clear(x, z, 12)) continue; var y = -20 + B.rnd() * 50, s = 6 + B.rnd() * 10;
        B.cyl(x, y - s * 1.2, z, 0.5, s * 1.2, 7, 'rock', null, s); B.cyl(x, y, z, s, 0.6, 7, 'isle', null, s, 'isle'); if (B.rnd() < 0.7) B.bill(x, y + 0.6, z, ['jv_crystal', 'jv_tree', 'jv_crys0', 'jv_lamp0'][n % 4], 0.12 + B.rnd() * 0.1); }
      var vp = T.S[Math.round(T.N * 0.4)]; B.bill(vp.x + 120, vp.y - 30, vp.z - 90, 'jv_void0', 0.8, { anim: function (t) { return Math.floor(t * 2) % 2 ? 'jv_void1' : 'jv_void0'; } });
      B.along(20, function (q, sd, i) { var p = B.side(q, sd, -0.4); if (i % 2) { B.bill(p.x, p.y, p.z, 'jv_crys' + (i % 4 < 2 ? 0 : 1), 0.06); B.light(p.x, p.y + 1, p.z, 10, [0.5, 0.25, 0.8], '#c08aff'); } });
    }
  },
  /* ---------------- The Crimson Moon: low gravity, red dust, big jumps, and the Crimson Moon itself watching ---------------- */
  moon: {
    dust: '#c4121c',
    tiles: function (A) {
      A.add('road', PAINT.speckle('#6a1a1a', ['#5a1414', '#7a2222', '#4a1010', '#8a2a2a'], 240)); A.add('off', PAINT.crater('#4a1010', '#2a0606', '#7a2222'));
      A.add('ground', PAINT.crater('#3a0a0a', '#200404', '#5a1414')); A.add('wall', PAINT.stone('#200404', ['#5a1414', '#4a1010', '#6a1a1a'])); A.add('trim', PAINT.solid('#8a2a2a'));
      A.add('kerb', PAINT.kerb('#f1e7d0', '#8a0a14')); A.add('kerb2', PAINT.solid('#5a1414')); A.add('rock', PAINT.stone('#200404', ['#4a1010', '#3a0a0a', '#5a1414']));
    },
    scen: function (B) {
      var T = B.T;
      B.along(14, function (q, sd) { var p = inPlace(B, q, sd, 3 + B.rnd() * 24, 4); if (p && B.rnd() < 0.55) { var s = 1.5 + B.rnd() * 4; B.cyl(p.x, p.y - 0.5, p.z, s, s * (0.6 + B.rnd()), 5 + Math.floor(B.rnd() * 3), 'rock', null, s * 0.3, 'rock'); } });
      var mp = T.S[Math.round(T.N * 0.25)]; B.bill(mp.x + mp.nx * 90, mp.y + 10, mp.z + mp.nz * 90, 'f_moon_0', 0.55, { anim: function (t) { return 'f_moon_' + (Math.floor(t * 2) % 2); } });
      var me2 = T.S[Math.round(T.N * 0.75)]; B.bill(me2.x - me2.nx * 80, me2.y + 4, me2.z - me2.nz * 80, 'f_mega_0', 0.4);
    }
  }
});
