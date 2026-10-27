/* =====================================================================================================
   THE PLACES: each course's tiles, scenery and its own hazards. Every one is a spot from our other games.
   ===================================================================================================== */
function THEME_TILES(A, TH, def) {
  A.add('white', PAINT.white); A.add('check', PAINT.check); A.add('arrow', PAINT.arrow); A.add('box', PAINT.box); A.add('shadow', PAINT.shadow);
  A.add('ramp', function (p) { for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) p.px(x, y, ((x + y) >> 3) % 2 ? '#ffe36a' : '#12040a'); });
  A.add('metal', PAINT.metal('#8a828a', '#3a343c', '#d0c8d0')); A.add('tire', function (p) { p.fill('#2a2228'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 2, '#12040a'); });
  A.add('belt', function (p) { p.fill('#2a2228'); for (var y = 0; y < 32; y += 8) { p.rect(0, y, 32, 2, '#5a545c'); p.rect(0, y + 2, 32, 1, '#12040a'); } p.rect(0, 0, 2, 32, '#ffe36a'); p.rect(30, 0, 2, 32, '#ffe36a'); });
  [['spark1', '#6ac8ff'], ['spark2', '#ffb040'], ['spark3', '#fff6d8'], ['flame1', '#ffe36a'], ['flame2', '#ff5a20'], ['cream', '#fff6d8'], ['red', '#ff2630'], ['dust', TH.dust || '#a6968f'], ['glow', '#ffe36a'], ['purple', '#9a4aff'], ['black', '#12040a'], ['steam', '#d8d0d8'], ['blood', '#8a0a14']].forEach(function (c) { A.add(c[0], PAINT.solid(c[1])); });
  A.add('kerb', PAINT.kerb('#c4121c', '#f1e7d0')); A.add('kerb2', PAINT.solid('#4a1a1c'));
  A.add('trim', PAINT.solid('#3a1418')); A.add('skirt', PAINT.speckle('#1a0a0c', ['#120608', '#24100e'], 80));
  A.add('stripes', function (p) { for (var x = 0; x < 32; x++) p.rect(x, 0, 1, 32, (x >> 3) % 2 ? '#f1e7d0' : '#c4121c'); });
  A.add('goopool', function (p) { p.clear(); for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var d = Math.hypot(x - 15.5, (y - 15.5) * 1.1) + Math.sin(Math.atan2(y - 15.5, x - 15.5) * 5) * 1.6; if (d < 14) p.px(x, y, d > 12 ? '#3a0a4a' : d > 9 ? '#7a2ad8' : (x + y) % 7 ? '#5a1aa8' : '#c08aff'); } });
}
var FACADES = ['fac_amy', 'fac_beebs', 'fac_greebo', 'fac_joff', 'fac_saba', 'fac_pulsar', 'fac_sanct', 'fac_tb', 'fac_t', 'fac_bonjo', 'fac_arcade', 'fac_cafe'];
function lamp(B, x, y, z, h, glow) { B.box(x, y, z, 0.35, 0.35, h, 0, 'trim', 'trim'); B.box(x, y + h, z, 0.9, 0.9, 0.6, 0, glow || 'glow', glow || 'glow', [1, 1, 1]); }
function inPlace(B, q, sd, dist, r) { var p = B.side(q, sd, dist); return B.clear(p.x, p.z, r || 2) ? p : null; }
function ahead(p, d) { return { x: p.x + Math.cos(p.face) * d, z: p.z + Math.sin(p.face) * d }; }
/* a building whose front faces the track, with a shop front stuck on it */
function shopFront(B, p, f, s) {
  var sz = KIT.size(f), w = sz.w * s, h = sz.h * s, ry = p.face + Math.PI / 2; B.box(p.x, p.y - 0.5, p.z, w * 0.95, 6, h * 0.82, ry, 'wall', 'roof');
  var a = ahead(p, 3.05); B.decal(a.x, p.y - 0.5, a.z, w, h, ry, f);
}
/* hazards shared by several courses: things on the road that spin you out (goo puddles), and round things you bounce off (bumpers) */
function hazardStep(R, k, loc, dt) {
  R.goo.forEach(function (g) { if (Math.hypot(k.x - g.x, k.z - g.z) < g.r && !k.air && k.nadoT <= 0) { if (g.kind === 'goo') { if (k.gooT <= 0 && k.invT <= 0) { k.gooT = 1.2; k.spinT = Math.max(k.spinT, 0.45); if (k === R.me) sfx.play('splat'); } } } });
  (R.bumpers || []).forEach(function (b) { var dx = k.x - b.x, dz = k.z - b.z, d = Math.hypot(dx, dz); if (d < b.r + KR && d > 0.01) { var nx = dx / d, nz = dz / d; k.x = b.x + nx * (b.r + KR); k.z = b.z + nz * (b.r + KR); k.kx += nx * 22; k.kz += nz * 22; k.spd *= 0.7; b.hit = 0.25; if (k === R.me || near(k)) sfx.play('boom'); } if (b.hit > 0) b.hit -= dt / R.karts.length; });
}

var THEMES = {
  /* ---------------- Clubhouse Row: Load Legacy's town, the castle gate, shops either side, a red moon ---------------- */
  town: {
    dust: '#6a4a4a',
    tiles: function (A) {
      A.add('road', PAINT.bricks('#1a080a', ['#4a2024', '#52262a', '#44181e', '#5a2a2c'], 8, 8));
      A.add('off', PAINT.tiles('#5a4a48', '#4e403e', '#2a1a1a')); A.add('ground', PAINT.bricks('#140608', ['#3a1418', '#341216', '#401a1c'], 8, 8));
      A.add('wall', PAINT.bricks('#240a0c', ['#7a2430', '#6a1e28', '#842a34', '#5a1820'], 16, 8)); A.add('trim', PAINT.stone('#1a0a0a', ['#6a5a58', '#5a4a48', '#7a6a66']));
      A.add('kerb2', PAINT.tiles('#6a5a58', '#5a4a48', '#2a1a1a')); A.add('roof', PAINT.planks(['#3a1418', '#2a0e10', '#44181c'], '#12040a'));
      A.add('tower', PAINT.stone('#140608', ['#4a1a20', '#3e161a', '#561e24'])); A.add('gate', function (p) { p.fill('#0a0204'); for (var x = 2; x < 32; x += 6) p.rect(x, 0, 2, 32, '#5a545c'); for (var y = 4; y < 32; y += 8) p.rect(0, y, 32, 2, '#5a545c'); });
    },
    scen: function (B) {
      var T = B.T, n = 0;
      B.along(26, function (q, sd, i) { if (i < 8 || i > T.N - 10) return; var p = inPlace(B, q, sd, 5 + B.rnd() * 3, 6); if (p) shopFront(B, p, FACADES[(n++) % FACADES.length], 0.12); });
      B.along(15, function (q, sd, i) { if (i % 2) return; var p = B.side(q, sd, 0.8); lamp(B, p.x, p.y, p.z, 4.5); });
      // the castle gate behind the start, with TB waiting at it
      var g = inPlace(B, T.S[Math.round(T.N * 0.03)], -1, 14, 10); if (g) {
        var ry = g.face + Math.PI / 2, c = Math.cos(ry), sn = Math.sin(ry);
        [-7, 7].forEach(function (o) { B.box(g.x + c * o, g.y - 0.5, g.z + sn * o, 5, 5, 16, ry, 'tower', 'trim'); for (var k = -1; k <= 1; k++) B.box(g.x + c * (o + k * 1.7), g.y + 15.5, g.z + sn * (o + k * 1.7), 1.2, 5, 1.6, ry, 'tower', 'trim'); });
        B.box(g.x, g.y + 7, g.z, 9, 4, 6, ry, 'tower', 'trim'); var a = ahead(g, 2.1); B.panel(a.x, g.y - 0.5, a.z, 9, 7.5, ry, 'gate');
        var t = ahead(g, 5); B.bill(t.x, g.y, t.z, 'npc_tb', 0.07);
      }
      var cp = inPlace(B, T.S[Math.round(T.N * 0.5)], 1, 16, 6); if (cp) { var a2 = ahead(cp, 0); B.decal(a2.x, cp.y - 0.5, a2.z, 54 * 0.16, 118 * 0.16, cp.face + Math.PI / 2, 'fac_club'); }
      var st = T.S[4]; [1, -1].forEach(function (sd) { var p = B.side(st, sd, 0.3); B.bill(p.x, p.y, p.z, sd > 0 ? 'npc_kaya' : 'npc_elden', 0.065); });
    }
  },
  /* ---------------- Ejaculand: the black and red theme park, Steve, the ferris wheel and carousel ---------------- */
  park: {
    dust: '#3a0a10',
    tiles: function (A) {
      A.add('road', PAINT.asphalt('#1a1014', ['#241a1e', '#120a0e', '#3a0a10']));
      A.add('off', PAINT.tiles('#3a0a10', '#14060a', '#000000')); A.add('ground', PAINT.speckle('#0e0608', ['#1a0a0e', '#2a0a10', '#06020a'], 160));
      A.add('wall', function (p) { for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) p.px(x, y, ((x + y) >> 3) % 2 ? '#c4121c' : '#12040a'); }); A.add('trim', PAINT.solid('#ff2630'));
      A.add('kerb', PAINT.kerb('#ff2630', '#12040a')); A.add('kerb2', PAINT.solid('#2a0a10'));
      A.add('tent', function (p) { for (var x = 0; x < 32; x++) p.rect(x, 0, 1, 32, (x >> 3) % 2 ? '#f1e7d0' : '#c4121c'); }); A.add('plat', PAINT.tiles('#3a0a10', '#ffe36a', '#12040a')); A.add('tower', PAINT.bricks('#0a0204', ['#2a0a10', '#220810', '#30101a'], 16, 8));
      A.add('clock', function (p) { p.fill('#12040a'); for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var d = Math.hypot(x - 15.5, y - 15.5); if (d < 14) p.px(x, y, d > 12 ? '#ffe36a' : '#f1e7d0'); } p.rect(15, 6, 2, 10, '#12040a'); p.rect(15, 15, 8, 2, '#c4121c'); });
      A.add('rail', PAINT.solid('#c4121c')); A.add('post', PAINT.solid('#2a0a10'));
    },
    scen: function (B) {
      var T = B.T, R0 = null;
      // Steve waves you in at the gates
      var st = T.S[3]; [1, -1].forEach(function (sd) { var p = B.side(st, sd, 1.5); B.bill(p.x, p.y, p.z, 'steve0', 0.06, { anim: function (t) { return Math.floor(t * 2) % 2 ? 'steve1' : 'steve0'; } }); });
      // tents and lamps all round
      B.along(30, function (q, sd, i) { var p = inPlace(B, q, sd, 6 + B.rnd() * 10, 6); if (p && B.rnd() < 0.6) { B.cyl(p.x, p.y - 0.5, p.z, 3.5, 3, 8, 'tent'); B.cyl(p.x, p.y + 2.5, p.z, 3.8, 3, 8, 'tent', null, 0); } });
      B.along(16, function (q, sd) { var p = B.side(q, sd, 0.8); lamp(B, p.x, p.y, p.z, 4, 'red'); });
      // the ferris wheel (turned in drawDyn), the carousel, the clock tower with its star, the coaster
      var fw = inPlace(B, T.S[Math.round(T.N * 0.3)], 1, 30, 16) || inPlace(B, T.S[Math.round(T.N * 0.3)], -1, 30, 16);
      if (fw) { B.wheel = fw; var ry = fw.face + Math.PI / 2, c = Math.cos(ry), s = Math.sin(ry); [-3, 3].forEach(function (o) { B.box(fw.x + c * o, fw.y - 0.5, fw.z + s * o, 0.8, 0.8, 16, 0, 'post', 'post'); }); }
      var cr = inPlace(B, T.S[Math.round(T.N * 0.72)], 1, 22, 10) || inPlace(B, T.S[Math.round(T.N * 0.72)], -1, 22, 10);
      if (cr) { B.carousel = cr; B.cyl(cr.x, cr.y - 0.5, cr.z, 8, 1.2, 12, 'plat', null, 8, 'plat'); B.cyl(cr.x, cr.y, cr.z, 0.6, 7, 6, 'rail'); B.cyl(cr.x, cr.y + 6.5, cr.z, 9, 3.5, 12, 'tent', null, 0.3); }
      var ct = inPlace(B, T.S[Math.round(T.N * 0.92)], -1, 18, 6) || inPlace(B, T.S[Math.round(T.N * 0.92)], 1, 18, 6);
      if (ct) { B.box(ct.x, ct.y - 0.5, ct.z, 5, 5, 24, ct.face, 'tower', 'trim'); var a = ahead(ct, 2.6); B.panel(a.x, ct.y + 17, a.z, 4, 4, ct.face + Math.PI / 2, 'clock'); B.cyl(ct.x, ct.y + 23.5, ct.z, 3.4, 5, 4, 'tower', null, 0); B.bill(ct.x, ct.y + 28, ct.z, 'ck_star', 0.25); }
      // the coaster: posts and a red track high up beside part of the circuit
      var c0 = Math.round(T.N * 0.52), prev = null;
      for (var i = 0; i < Math.round(T.N * 0.3); i += 2) { var q = T.S[(c0 + i) % T.N], p2 = B.side(q, -1, 12), h = 9 + Math.sin(i / 7) * 6; if (!B.clear(p2.x, p2.z, 2)) { prev = null; continue; } if (i % 6 === 0) B.box(p2.x, p2.y - 0.5, p2.z, 0.5, 0.5, h + 0.5, 0, 'post', 'post'); if (prev) B.hcyl(prev.x, prev.h, prev.z, p2.x, p2.y + h, p2.z, 0.35, 'rail', null, 4); prev = { x: p2.x, z: p2.z, h: p2.y + h }; }
    },
    init: function (R) { R.ride = 0; },
    drawDyn: function (R, m, sp) {
      var B = R.B, A = R.A, L = R.def.light, t = R.t;
      if (B.wheel) { var w = B.wheel, ry = w.face + Math.PI / 2, c = Math.cos(ry), s = Math.sin(ry), cx = w.x, cy = w.y + 15, cz = w.z, r = 12, a0 = t * 0.25;
        for (var i = 0; i < 20; i++) { var a = a0 + i / 20 * Math.PI * 2, b = a0 + (i + 1) / 20 * Math.PI * 2; var P = function (aa, rr) { return [cx + c * Math.cos(aa) * rr, cy + Math.sin(aa) * rr, cz + s * Math.cos(aa) * rr]; };
          var p0 = P(a, r), p1 = P(b, r), q0 = P(a, r - 0.6), q1 = P(b, r - 0.6); m.quad(p0, p1, q1, q0, [0, 0, 1, 0, 1, 1, 0, 1], A.tile('red'), L);
          if (i % 2 === 0) { var sp0 = P(a, 0.3), sp1 = P(a, r); m.quad([sp0[0], sp0[1] - 0.12, sp0[2]], [sp1[0], sp1[1] - 0.12, sp1[2]], [sp1[0], sp1[1] + 0.12, sp1[2]], [sp0[0], sp0[1] + 0.12, sp0[2]], [0, 0, 1, 0, 1, 1, 0, 1], A.tile('post'), L); var g = P(a, r); boxModel(m, A, g[0], g[1] - 1.8, g[2], 0.8, ry, i % 4 ? 'tent' : 'plat', L); }
        } }
      if (B.carousel) { var cr = B.carousel; for (var j = 0; j < 8; j++) { var aa = t * 0.7 + j / 8 * Math.PI * 2, x = cr.x + Math.cos(aa) * 6, z = cr.z + Math.sin(aa) * 6, y = cr.y + 0.8 + Math.sin(t * 3 + j) * 0.5; sp.bills = sp.bills || []; R.carouselPos = R.carouselPos || []; R.carouselPos[j] = [x, y, z]; m.quad([x - 0.07, cr.y + 0.7, z], [x + 0.07, cr.y + 0.7, z], [x + 0.07, cr.y + 6.5, z], [x - 0.07, cr.y + 6.5, z], [0, 0, 1, 0, 1, 1, 0, 1], A.tile('glow'), L); } }
    },
    drawBills: function (R, sp) { (R.carouselPos || []).forEach(function (p, j) { billboard(sp, p[0], p[1], p[2], j % 2 ? 'f_balloon_' + (Math.floor(R.t * 4) % 4) : 'steve0', j % 2 ? 0.07 : 0.035); }); }
  },
  /* ---------------- Cum Café Run: Willy Nilly's places along Meatnado Escape's night city, the meatnado on the horizon ---------------- */
  city: {
    dust: '#5a5058',
    tiles: function (A) {
      A.add('road', PAINT.asphalt('#26222a', ['#302a34', '#1e1a22', '#3a343e'], null)); A.add('off', PAINT.tiles('#5a5058', '#4a4048', '#2a242a'));
      A.add('ground', PAINT.asphalt('#1e1a20', ['#26222a', '#141016'])); A.add('wall', function (p) { p.fill('#8a828a'); p.rect(0, 0, 32, 6, '#ffe36a'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 4, 6, '#12040a'); p.speck(['#7a727a', '#9a929a'], 60); });
      A.add('trim', PAINT.solid('#a8a0a8')); A.add('kerb', PAINT.kerb('#ffe36a', '#12040a')); A.add('kerb2', PAINT.solid('#7a727a'));
      A.add('win1', PAINT.window('#3a2a30', '#ffe36a', true)); A.add('win2', PAINT.window('#2a1e24', '#5a4a6a', false)); A.add('win3', PAINT.window('#4a1a20', '#ff9a40', true)); A.add('roof', PAINT.speckle('#1a1418', ['#241e22', '#100c0e'], 80));
      A.add('meat', function (p) { p.fill('#8a3a2a'); for (var i = 0; i < 40; i++) { var x = Math.floor(p.rnd() * 30), y = Math.floor(p.rnd() * 30); p.rect(x, y, 3, 2, ['#c4504a', '#5a1a10', '#e0806a', '#ff2630'][i % 4]); } });
      A.add('wall', function (p) { p.fill('#8a828a'); p.rect(0, 0, 32, 6, '#ffe36a'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 4, 6, '#12040a'); p.speck(['#7a727a', '#9a929a'], 60); });
    },
    roadLine: true,
    scen: function (B) {
      var T = B.T, n = 0, wins = ['win1', 'win2', 'win3'];
      B.along(14, function (q, sd, i) { var p = inPlace(B, q, sd, 4 + B.rnd() * 6, 7); if (!p) return; var h = 10 + Math.floor(B.rnd() * 26), w = 9 + B.rnd() * 6; B.box(p.x, p.y - 0.5, p.z, w, 9, h, p.face + Math.PI / 2, wins[Math.floor(B.rnd() * 3)], 'roof', null, 4); if (B.rnd() < 0.4) { var f = ['fac_amy', 'fac_joff', 'fac_beebs', 'fac_greebo', 'fac_t', 'fac_bonjo'][(n++) % 6], sz = KIT.size(f), a = ahead(p, 4.55); B.decal(a.x, p.y - 0.5, a.z, sz.w * 0.1, sz.h * 0.1, p.face + Math.PI / 2, f); } });
      B.along(18, function (q, sd) { var p = B.side(q, sd, 0.6); lamp(B, p.x, p.y, p.z, 5); });
      // the Cum Café on its own lot right by the start
      var cf = inPlace(B, T.S[Math.round(T.N * 0.04)], 1, 4, 4) || inPlace(B, T.S[Math.round(T.N * 0.04)], -1, 4, 4); if (cf) shopFront(B, cf, 'fac_cafe', 0.12);
      var k = T.S[6], kp = B.side(k, 1, 0.5), ep = B.side(k, -1, 0.5); B.bill(kp.x, kp.y, kp.z, 'npc_kaya', 0.065); B.bill(ep.x, ep.y, ep.z, 'npc_elden', 0.065);
    },
    init: function (R) { var b = R.T.box; R.nado = { cx: (b[0] + b[2]) / 2, cz: (b[1] + b[3]) / 2, r: Math.max(b[2] - b[0], b[3] - b[1]) / 2 + 70, a: 0 }; },
    step: function (R, dt) { R.nado.a += dt * 0.05; },
    drawDyn: function (R, m) { // the meatnado: rings of meat, wider at the top, spinning
      var n = R.nado, x = n.cx + Math.cos(n.a) * n.r, z = n.cz + Math.sin(n.a) * n.r, y0 = R.T.minY - 1, A = R.A, L = R.def.light;
      for (var lv = 0; lv < 16; lv++) { var r0 = 3 + lv * 1.6, r1 = 3 + (lv + 1) * 1.6, ox = Math.sin(R.t * 1.3 + lv * 0.5) * lv * 0.4, a0 = R.t * (3 - lv * 0.1);
        for (var i = 0; i < 10; i++) { var a = a0 + i / 10 * Math.PI * 2, b = a0 + (i + 1) / 10 * Math.PI * 2, k = 0.7 + 0.3 * Math.sin(a); m.quad([x + ox + Math.cos(a) * r0, y0 + lv * 4, z + Math.sin(a) * r0], [x + ox + Math.cos(b) * r0, y0 + lv * 4, z + Math.sin(b) * r0], [x + ox + Math.cos(b) * r1, y0 + lv * 4 + 4, z + Math.sin(b) * r1], [x + ox + Math.cos(a) * r1, y0 + lv * 4 + 4, z + Math.sin(a) * r1], [0, 1, 1, 1, 1, 0, 0, 0], A.tile('meat'), mulc(L, k), 0); } }
      R.nadoPos = [x, y0, z];
    },
    drawBills: function (R, sp) { var p = R.nadoPos; if (!p) return; for (var j = 0; j < 14; j++) { var a = R.t * 2 + j, r = 8 + j * 1.6; billboard(sp, p[0] + Math.cos(a) * r, p[1] + 4 + j * 4, p[2] + Math.sin(a) * r, j % 2 ? 'mn_sausage' : 'ao_meat' + (j % 4 ? 0 : 1), 0.25); } }
  },
  /* ---------------- Cumhead's Castle: red carpet down the halls, banners, chandeliers, a drawbridge jump ---------------- */
  castle: {
    dust: '#6a5a58',
    tiles: function (A) {
      A.add('road', PAINT.carpet('#7a0a14', '#c8903a', '#c8903a')); A.add('off', PAINT.stone('#1a0a0a', ['#4a3a3a', '#423232', '#523e3e']));
      A.add('ground', PAINT.solid('#0a0204')); A.add('wall', PAINT.bricks('#140608', ['#3e1a1e', '#46201f', '#381618', '#4c2224'], 16, 8)); A.add('trim', PAINT.stone('#140608', ['#5a4a48', '#4a3a3a']));
      A.add('kerb', PAINT.kerb('#c8903a', '#5a0a10')); A.add('kerb2', PAINT.solid('#c8903a'));
      A.add('wallwin', function (p) { PAINT.bricks('#140608', ['#3e1a1e', '#46201f', '#381618'], 16, 8)(p); p.rect(9, 3, 14, 29, '#0a0204'); for (var y = 4; y < 32; y++) for (var x = 10; x < 22; x++) { var top = y < 10 && Math.hypot(x - 15.5, y - 10) > 6; if (!top) p.px(x, y, y < 14 ? '#5a070c' : '#2a0306'); } for (var y2 = 6; y2 < 14; y2++) for (var x2 = 13; x2 < 19; x2++) if (Math.hypot(x2 - 15.5, y2 - 9.5) < 3.2) p.px(x2, y2, '#d8141f'); p.rect(15, 4, 2, 28, '#0a0204'); p.rect(10, 18, 12, 2, '#0a0204'); });
      A.add('wallban', function (p) { PAINT.bricks('#140608', ['#3e1a1e', '#46201f', '#381618'], 16, 8)(p); p.rect(8, 0, 16, 26, '#a8101c'); p.rect(8, 0, 16, 2, '#ffe36a'); for (var y = 26; y < 32; y++) { p.rect(8, y, 8 - (y - 26), 1, '#a8101c'); p.rect(16 + (y - 26), y, 8 - (y - 26), 1, '#a8101c'); } p.rect(14, 7, 4, 10, '#ffe36a'); p.rect(11, 10, 10, 3, '#ffe36a'); });
      A.add('planks', PAINT.planks(['#5a3a1e', '#4a3018', '#6a4424'], '#1a0a04')); A.add('beam', PAINT.planks(['#2a1a10', '#22140c'], '#0a0402')); A.add('gold', PAINT.solid('#c8903a'));
    },
    wallAt: function (i, band) { if (band === 1 && i % 14 === 0) return 'wallwin'; if (band === 0 && i % 14 === 7) return 'wallban'; return 'wall'; },
    roadAt: function (f) { var r = COURSES.castle.ramps[0][0]; return f > r - 0.02 && f < r + 0.05 ? 'planks' : null; },
    scen: function (B) {
      var T = B.T; for (var i = 0; i < T.N; i += 9) B.beam(i, 8.4, 'beam', 1.2);
      for (var j = 4; j < T.N; j += 27) { var q = T.S[j]; B.cyl(q.x, q.y + 6, q.z, 1.6, 0.4, 8, 'gold'); B.box(q.x, q.y + 6.4, q.z, 0.15, 0.15, 2, 0, 'black'); B.bill(q.x + 1.3, q.y + 6.4, q.z, 'ck_flame', 0.05, { anim: function (t) { return 'ck_flame' + (Math.floor(t * 8) % 2); } }); B.bill(q.x - 1.3, q.y + 6.4, q.z, 'ck_flame', 0.05, { anim: function (t) { return 'ck_flame' + (Math.floor(t * 8 + 1) % 2); } }); }
      B.along(32, function (q, sd, i) { var p = B.side(q, sd, -1.6); B.bill(p.x, p.y, p.z, i % 3 ? 'f_knight_0' : 'f_gargoyle_0', 0.07); });
      var th = T.S[Math.round(T.N * 0.97)], tp = B.side(th, 1, -1.4); B.bill(tp.x, tp.y, tp.z, 'throne', 0.08);
    }
  }
};
