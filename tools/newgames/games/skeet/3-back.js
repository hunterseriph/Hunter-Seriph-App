/* =====================================================================================================
   BACKDROPS: six places, each in layers that scroll at their own speed (sky, far, mid, the back wall right behind
   the fight, the floor, and things in front). Painted once at the game's own pixel size with hard edges (no fades)
   into cached layers; the moving bits (bulbs, flames, flowing cream) are drawn live on top. Details are keyed to the
   world, never to the screen, so nothing jumps while the camera moves.
   ===================================================================================================== */
function srand(seed) { var s = (seed * 9301 + 49297) % 233280 || 1; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function R(c, x, y, w, h) { KIT.R(c, x, y, w, h); }
var SEG = 128; // the back wall and the floor are cut into world-keyed pieces this wide
function bands(cols, y0, y1) { var n = cols.length, h = (y1 - y0) / n; for (var i = 0; i < n; i++) R(cols[i], 0, y0 + i * h, KIT.W, h + 1); }
function moon(x, y, r, rings) { var g = KIT.ctx; (rings || ['#2a060a', '#3a080c', '#5a0a10']).forEach(function (c, i, a) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r + (a.length - i) * 7, 0, 6.3); g.fill(); }); g.fillStyle = '#c4121c'; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); g.fillStyle = '#ff2630'; g.beginPath(); g.arc(x - r * 0.18, y - r * 0.18, r * 0.78, 0, 6.3); g.fill(); g.fillStyle = '#c4121c'; [[0.3, -0.2, 0.18], [-0.3, 0.25, 0.12], [0.1, 0.4, 0.1]].forEach(function (c) { g.beginPath(); g.arc(x + c[0] * r, y + c[1] * r, c[2] * r, 0, 6.3); g.fill(); }); }
function windows(x, y, w, h, rnd, lit, dark) { for (var wy = y + 4; wy < y + h - 6; wy += 7) for (var wx = x + 3; wx < x + w - 4; wx += 6) R(rnd() < 0.22 ? lit : dark, wx, wy, 3, 4); }
function spire(x, y, w, h, c) { var g = KIT.ctx; g.fillStyle = c; g.fillRect(x, y, w, h); g.beginPath(); g.moveTo(x - 1, y); g.lineTo(x + w / 2, y - w * 1.3); g.lineTo(x + w + 1, y); g.fill(); }
/* a layer that repeats along the world at a parallax speed k */
function parLayer(key, tw, th, k, y, fn) { var L = KIT.layer(key, tw, th, fn, { px: true, crisp: true }), off = -((G.cam * k) % tw + tw) % tw; for (var x = off; x < KIT.W; x += tw) KIT.blit(L, x, y); }
/* the back wall and floor: one cached piece per SEG of world, painted from its own seed */
function segs(key, th, y, fn) { var s0 = Math.floor(G.cam / SEG) - 1, s1 = Math.floor((G.cam + KIT.W) / SEG) + 1; for (var s = s0; s <= s1; s++) { (function (s) { var L = KIT.layer(key + s, SEG, th, function () { fn(s, srand(s * 131 + 7)); }, { px: true, crisp: true }); KIT.blit(L, s * SEG - G.cam, y); })(s); } }
function brickRow(y, h, off, c1, c2, mortar, bw) { R(mortar, 0, y, SEG, h); for (var x = -off; x < SEG; x += bw) R((Math.floor((x + off) / bw) % 2) ? c1 : c2, x + 1, y + 1, bw - 1, h - 1); }
/* the floor in rows that get taller towards you, so it reads as going back */
function floorRows(fn) { var y = 0, i = 0; while (y < KIT.H - FLOOR) { var h = Math.round(5 + i * 1.15); fn(y, h, i); y += h; i++; } }

var BACKS = {
  /* CLUBHOUSE ROW at night: his red moon, black towers, the real shop fronts along the street, red brick pavement */
  street: {
    sky: function () { bands(['#050103', '#080206', '#0c0308', '#10040a', '#16050c', '#1c060e', '#240810'], 0, FLOOR); moon(KIT.W * 0.74, 46, 26);
      var r = srand(3); for (var i = 0; i < 40; i++) R(i % 7 ? '#4a1a20' : '#f1e7d0', r() * KIT.W, r() * 90, 1, 1); R('#3a080c', 0, 64, KIT.W, 2); R('#3a080c', KIT.W * 0.2, 70, KIT.W * 0.5, 1); },
    far: [320, 110, 0.15, FLOOR - 120, function () { var r = srand(11); for (var x = 0; x < 320; x += 18 + r() * 14) { var h = 40 + r() * 70, w = 14 + r() * 16; R('#0c0407', x, 110 - h, w, h); windows(x, 110 - h, w, h, r, '#5a0a10', '#14060a'); if (r() < 0.3) spire(x + w / 2 - 2, 110 - h, 4, 2, '#0c0407'); } }],
    mid: [400, 100, 0.4, FLOOR - 98, function () { var r = srand(21); for (var x = 0; x < 400; x += 30 + r() * 20) { var h = 40 + r() * 50, w = 26 + r() * 20; R('#150709', x, 100 - h, w, h); windows(x, 100 - h, w, h, r, '#8a1018', '#200a0e'); if (r() < 0.5) spire(x + 4, 100 - h, 6, 2, '#150709'); if (r() < 0.4) spire(x + w - 10, 100 - h, 6, 2, '#150709'); } }],
    wall: function (s, r) { // brick wall behind the street, the shops stand in front of it
      for (var y = 0; y < 60; y += 6) brickRow(y, 6, (y / 6) % 2 ? 6 : 0, '#2a0c10', '#240a0e', '#12040a', 12);
      R('#12040a', 0, 58, SEG, 2);
    },
    wallH: 60,
    props: function (s, r) { // a shop every other piece, a lamp between
      var shops = ['fac_joff', 'fac_t', 'fac_bonjo', 'fac_greebo', 'fac_amy', 'fac_beebs', 'fac_pulsar', 'fac_saba', 'fac_tb', 'fac_cafe', 'fac_arcade', 'fac_sanct'];
      var out = []; if (s % 2 === 0) out.push({ spr: shops[((s / 2) % shops.length + shops.length) % shops.length], x: s * SEG + 64 }); else out.push({ lamp: 1, x: s * SEG + 64 }); return out;
    },
    floor: function (s, r) {
      R('#5a2a30', 0, 0, SEG, 3); R('#2a0c10', 0, 3, SEG, 1); // the kerb at the back
      floorRows(function (y, h, i) { if (y < 4) { if (y + h > 4) R('#12040a', 0, 4, SEG, y + h - 4); return; } var bw = 14 + i * 2; brickRow(y, h, (i % 2) * (bw / 2) + (s * SEG) % bw, i % 3 ? '#341216' : '#2e1014', '#3a161a', '#12040a', bw); });
      if (r() < 0.5) R('#1a0608', 20 + r() * 80, 30 + r() * 30, 18, 4); // a puddle of something
    },
    front: function (s, r) { return r() < 0.3 ? [{ k: 'post', x: s * SEG + r() * SEG }] : []; }
  },
  /* THE CREAM SEWERS: a brick tunnel, arches, cream pipes pouring into a cream river behind the walkway */
  sewer: {
    sky: function () { bands(['#0a0806', '#0e0a08', '#120c0a', '#16100c', '#1a120e'], 0, FLOOR); },
    far: [256, 120, 0.2, FLOOR - 124, function () { for (var x = 0; x < 256; x += 64) { var g = KIT.ctx; g.fillStyle = '#1e1610'; g.fillRect(x, 0, 64, 120); g.fillStyle = '#070504'; g.beginPath(); g.moveTo(x + 10, 120); g.lineTo(x + 10, 50); g.quadraticCurveTo(x + 32, 18, x + 54, 50); g.lineTo(x + 54, 120); g.fill(); } }],
    mid: [320, 60, 0.45, FLOOR - 70, function () { var r = srand(5); for (var x = 0; x < 320; x += 80) { R('#3a3024', x, 10 + r() * 10, 80, 6); R('#5a4a36', x, 10, 80, 2); R('#2a2018', x + 30, 0, 8, 60); R('#4a3e2c', x + 31, 0, 2, 60); } }],
    wall: function (s, r) { for (var y = 0; y < 78; y += 7) brickRow(y, 7, (y / 7) % 2 ? 8 : 0, '#2e261c', '#28201a', '#0e0a08', 16);
      if (s % 2 === 0) { var g = KIT.ctx; g.fillStyle = '#0a0806'; g.beginPath(); g.moveTo(34, 78); g.lineTo(34, 40); g.quadraticCurveTo(64, 14, 94, 40); g.lineTo(94, 78); g.fill(); R('#12100c', 34, 40, 60, 2); }
      else { R('#5a4a36', 50, 14, 28, 12); R('#3a3024', 54, 26, 20, 4); R('#f1e0b0', 58, 30, 12, 48); R('#fffbe8', 60, 30, 3, 48); } // a pipe pouring cream
      R('#f1e0b0', 0, 70, SEG, 8); R('#fffbe8', 0, 70, SEG, 1); R('#b8a070', 0, 76, SEG, 2); }, // the cream river
    wallH: 78,
    floor: function (s, r) { R('#4a4034', 0, 0, SEG, 3); floorRows(function (y, h, i) { if (y < 3) { if (y + h > 3) R('#0e0a08', 0, 3, SEG, y + h - 3); return; } var bw = 20 + i * 3; brickRow(y, h, (i % 2) * (bw / 2) + (s * SEG) % bw, '#3a3226', '#342c22', '#14100c', bw); });
      if (r() < 0.5) { var px = r() * 90; R('#f1e0b0', px, 24, 26, 3); R('#fffbe8', px + 3, 24, 8, 1); } },
    live: function () { var t = G.t; for (var x = -((G.cam + t * 40) % 24); x < KIT.W; x += 24) R('#fffbe8', x, FLOOR - 7, 6, 1); }, // the river flows
    front: function (s, r) { return r() < 0.35 ? [{ k: 'pipe', x: s * SEG + r() * SEG }] : []; }
  },
  /* EJACULAND: his theme park at night, black and red: ferris wheel, coaster, carousel, stalls, Steve */
  park: {
    sky: function () { bands(['#06020a', '#0a030e', '#0e0412', '#120516', '#18061a', '#1e081c'], 0, FLOOR); moon(KIT.W * 0.2, 40, 16); var r = srand(9); for (var i = 0; i < 50; i++) R(i % 6 ? '#5a3a60' : '#f1e7d0', r() * KIT.W, r() * 100, 1, 1); },
    far: [480, 130, 0.12, FLOOR - 130, function () { var g = KIT.ctx; // the ferris wheel and the coaster loop
      g.strokeStyle = '#2a0a14'; g.lineWidth = 3; g.beginPath(); g.arc(120, 62, 52, 0, 6.3); g.stroke(); g.lineWidth = 1; for (var a = 0; a < 12; a++) { g.beginPath(); g.moveTo(120, 62); g.lineTo(120 + Math.cos(a * 0.524) * 52, 62 + Math.sin(a * 0.524) * 52); g.stroke(); R('#3a0c18', 120 + Math.cos(a * 0.524) * 52 - 3, 62 + Math.sin(a * 0.524) * 52, 6, 5); }
      g.fillStyle = '#2a0a14'; g.beginPath(); g.moveTo(100, 130); g.lineTo(120, 62); g.lineTo(140, 130); g.fill();
      g.strokeStyle = '#2a0a14'; g.lineWidth = 3; g.beginPath(); g.moveTo(240, 130); g.quadraticCurveTo(290, 10, 340, 80); g.arc(330, 80, 22, 0, 6.3); g.moveTo(352, 80); g.quadraticCurveTo(400, 140, 480, 60); g.stroke(); g.lineWidth = 1; for (var x = 250; x < 480; x += 14) R('#2a0a14', x, 90, 2, 40); }],
    mid: [360, 80, 0.35, FLOOR - 80, function () { var g = KIT.ctx; // carousel and the star clock tower
      g.fillStyle = '#240a12'; g.beginPath(); g.moveTo(40, 40); g.lineTo(100, 12); g.lineTo(160, 40); g.fill(); R('#240a12', 48, 40, 104, 40); for (var i = 0; i < 6; i++) R('#3a0e18', 52 + i * 17, 46, 8, 34);
      R('#200810', 240, 10, 30, 70); g.fillStyle = '#200810'; g.beginPath(); g.moveTo(236, 10); g.lineTo(255, -14); g.lineTo(274, 10); g.fill(); g.fillStyle = '#5a0a10'; g.beginPath(); g.arc(255, 24, 9, 0, 6.3); g.fill(); }],
    wall: function (s, r) { // stalls with red and black striped awnings
      R('#14060c', 0, 0, SEG, 64); for (var x = 0; x < SEG; x += 16) { R((x / 16) % 2 ? '#c4121c' : '#1a0608', x, 6, 16, 12); }
      R('#12040a', 0, 18, SEG, 2); R('#2a0a14', 6, 20, SEG - 12, 40); R('#0a0306', 12, 26, SEG - 24, 30); R('#3a0e18', 0, 58, SEG, 6);
      if (s % 3 === 0) { R('#12040a', 60, 22, 2, 36); } },
    wallH: 64,
    props: function (s, r) { return s % 3 === 1 ? [{ spr: 'steve0', x: s * SEG + 64, sc: 0.8 }] : []; },
    floor: function (s, r) { floorRows(function (y, h, i) { var tw = 16 + i * 3; for (var x = -((s * SEG) % (tw * 2)); x < SEG; x += tw) R(((Math.floor((x + s * SEG) / tw) + i) % 2) ? '#2a0a10' : '#120408', x, y, tw, h); R('#0a0204', 0, y, SEG, 1); }); },
    live: function () { var t = G.t; for (var x = -(G.cam % 16); x < KIT.W; x += 16) { var on = (Math.floor((x + G.cam) / 16) + Math.floor(t * 3)) % 3 === 0; R(on ? '#ffe36a' : '#5a3a10', x + 6, FLOOR - 64 + 4, 3, 3); } },
    front: function (s, r) { return r() < 0.25 ? [{ k: 'bulbpole', x: s * SEG + r() * SEG }] : []; }
  },
  /* THE BONE PIT: a cave of bones and torches */
  bone: {
    sky: function () { bands(['#040203', '#070405', '#0a0608', '#0e080a', '#120a0c'], 0, FLOOR); var g = KIT.ctx; g.fillStyle = '#0a0607'; for (var x = 0; x < KIT.W; x += 22) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 11, 16 + (x * 7) % 20); g.lineTo(x + 22, 0); g.fill(); } },
    far: [300, 100, 0.2, FLOOR - 100, function () { var g = KIT.ctx, r = srand(4); for (var x = 0; x < 300; x += 26 + r() * 20) { g.fillStyle = '#140c0e'; g.beginPath(); g.moveTo(x, 100); g.lineTo(x + 12, 20 + r() * 40); g.lineTo(x + 26, 100); g.fill(); } }],
    mid: [360, 70, 0.45, FLOOR - 70, function () { var r = srand(8); for (var x = 0; x < 360; x += 60 + r() * 30) { var g = KIT.ctx; g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(x + 30, 70, 34, 20, 0, Math.PI, 0); g.fill(); for (var i = 0; i < 6; i++) R('#4a4038', x + 8 + i * 8, 58 - r() * 10, 6, 4); } }],
    wall: function (s, r) { R('#1e1416', 0, 0, SEG, 70); for (var i = 0; i < 14; i++) R(r() < 0.5 ? '#261a1c' : '#160e10', r() * SEG, r() * 66, 10 + r() * 14, 4); // rock
      if (s % 2 === 0) { R('#0a0607', 40, 14, 48, 34); KIT.spr('p_skulls', 64, 46, {}); } R('#12040a', 0, 68, SEG, 2); },
    wallH: 70,
    props: function (s, r) { return s % 2 === 1 ? [{ torch: 1, x: s * SEG + 64 }] : (r() < 0.5 ? [{ spr: 'p_ribs', x: s * SEG + 30 + r() * 60 }] : []); },
    floor: function (s, r) { floorRows(function (y, h, i) { R(i % 2 ? '#2a1e1a' : '#261a16', 0, y, SEG, h); }); for (var i = 0; i < 6; i++) { var bx = r() * SEG, by = 6 + r() * 60; R('#8a7a5a', bx, by, 7, 2); R('#d8c8a8', bx, by, 6, 1); } },
    front: function (s, r) { return r() < 0.3 ? [{ k: 'stalag', x: s * SEG + r() * SEG }] : []; }
  },
  /* THE BLOOD FACTORY: Blumhead's works under the lair: furnace glow, pipes, vats, steel */
  factory: {
    sky: function () { bands(['#0a0404', '#140606', '#200806', '#2e0c06', '#3e1006', '#5a1a08'], 0, FLOOR); },
    far: [320, 120, 0.18, FLOOR - 120, function () { var r = srand(6); for (var x = 0; x < 320; x += 50) { var h = 50 + r() * 60; R('#120606', x, 120 - h, 30, h); R('#120606', x + 10, 120 - h - 30, 10, 30); R('#ff9a30', x + 4, 120 - h + 8, 4, 3); } }],
    mid: [360, 80, 0.42, FLOOR - 80, function () { R('#2a1a1a', 0, 20, 360, 8); R('#4a3030', 0, 20, 360, 2); for (var x = 0; x < 360; x += 90) { R('#3a2222', x + 10, 30, 50, 50); R('#c4121c', x + 14, 34, 42, 8); R('#ff3a44', x + 14, 34, 42, 2); R('#2a1a1a', x + 30, 0, 10, 30); } }],
    wall: function (s, r) { R('#2a2224', 0, 0, SEG, 66); for (var x = 0; x < SEG; x += 32) { R('#1a1416', x, 0, 1, 66); for (var y = 6; y < 66; y += 14) R('#4a4044', x + 3, y, 2, 2); }
      for (var x2 = 0; x2 < SEG; x2 += 12) R((x2 / 12) % 2 ? '#ffc840' : '#12040a', x2, 54, 12, 6); if (s % 2) { R('#12040a', 40, 10, 48, 30); R('#5a0a10', 44, 14, 40, 22); KIT.spr('p_walleyeshut', 64, 40, { sc: 0.7 }); } },
    wallH: 66,
    props: function (s, r) { return s % 3 === 0 ? [{ spr: 'p_crucible', x: s * SEG + 60 }] : []; },
    floor: function (s, r) { floorRows(function (y, h, i) { R(i % 2 ? '#3a3236' : '#342c30', 0, y, SEG, h); for (var x = (i % 2) * 4; x < SEG; x += 8) R('#1a1416', x, y, 1, h); }); R('#ffc840', 0, 0, SEG, 2); },
    live: function () { var t = G.t; var gl = Math.floor(t * 4) % 2; R(gl ? '#ff3a44' : '#c4121c', 0, FLOOR - 2, KIT.W, 1); },
    front: function (s, r) { return r() < 0.3 ? [{ k: 'girder', x: s * SEG + r() * SEG }] : []; }
  },
  /* BLUMHEAD'S THRONE: purple and black, pillars, banners, goo, and his throne at the end */
  throne: {
    sky: function () { bands(['#060208', '#0a030e', '#0e0414', '#12051a', '#16061e', '#1a0822'], 0, FLOOR); var r = srand(2); for (var i = 0; i < 30; i++) R('#4a1a6a', r() * KIT.W, r() * 120, 1, 2 + r() * 6); },
    far: [300, 130, 0.15, FLOOR - 130, function () { for (var x = 0; x < 300; x += 60) { R('#12061a', x + 20, 0, 22, 130); R('#1e0a2a', x + 22, 0, 4, 130); } }],
    mid: [360, 100, 0.4, FLOOR - 100, function () { for (var x = 0; x < 360; x += 120) { R('#1c0a24', x + 40, 0, 28, 100); R('#2a1036', x + 44, 0, 4, 100); R('#6a0a7a', x + 76, 10, 20, 50); var g = KIT.ctx; g.fillStyle = '#6a0a7a'; g.beginPath(); g.moveTo(x + 76, 60); g.lineTo(x + 86, 70); g.lineTo(x + 96, 60); g.fill(); g.fillStyle = '#ffd0ff'; g.beginPath(); g.ellipse(x + 86, 30, 5, 3, 0, 0, 6.3); g.fill(); g.fillStyle = '#12040a'; g.fillRect(x + 85, 28, 2, 4); } }],
    wall: function (s, r) { R('#1a0e20', 0, 0, SEG, 70); for (var y = 0; y < 70; y += 10) for (var x = (y / 10) % 2 ? 0 : 16; x < SEG; x += 32) R('#241430', x + 1, y + 1, 30, 8);
      if (s % 2 === 0) { R('#0a0410', 44, 8, 40, 46); R('#7a2ad8', 48, 12, 32, 38); R('#c08aff', 62, 12, 4, 38); R('#c08aff', 48, 28, 32, 4); } R('#9a3ad8', 0, 66, SEG, 2);
      for (var i = 0; i < 3; i++) { var dx = r() * SEG; R('#9a3ad8', dx, 0, 3, 8 + r() * 20); } },
    wallH: 70,
    floor: function (s, r) { floorRows(function (y, h, i) { var tw = 18 + i * 3; for (var x = -((s * SEG) % (tw * 2)); x < SEG; x += tw) R(((Math.floor((x + s * SEG) / tw) + i) % 2) ? '#1e0e28' : '#0c0610', x, y, tw, h); }); },
    front: function (s, r) { return r() < 0.25 ? [{ k: 'pillar', x: s * SEG + r() * SEG }] : []; }
  }
};
/* draw the whole back, before the fighters */
function drawBack() {
  var B = BACKS[G.S.back], W = KIT.W;
  var sky = KIT.layer('sky_' + G.S.back + W, W, FLOOR, B.sky, { px: true, crisp: true }); KIT.blit(sky, 0, 0);
  [B.far, B.mid].forEach(function (L, i) { if (L) parLayer(G.S.back + (i ? 'mid' : 'far'), L[0], L[1], L[2], L[3], L[4]); });
  if (!KIT.sheetReady) { R('#070405', 0, 0, KIT.W, KIT.H); return; } // painted once into the cache, so wait for the art
  var wh = B.wallH || 60; segs('w_' + G.S.back + '_', wh, FLOOR - wh, function (s, r) { B.wall(s, r); });
  R(B.seam || '#12040a', 0, FLOOR - 1, W, KIT.H - FLOOR + 1); // a solid foot under the wall: nothing behind ever shows between the wall and the floor (he saw a gap)
  // props that stand on the back of the street (shop fronts, lamps, Steve, torches): drawn whole, from the world
  if (B.props) { var s0 = Math.floor(G.cam / SEG) - 2, s1 = Math.floor((G.cam + W) / SEG) + 2; for (var s = s0; s <= s1; s++) B.props(s, srand(s * 77 + 3)).forEach(function (p) { var x = p.x - G.cam;
    if (p.spr) KIT.spr(p.spr, x, FLOOR + 1, { sc: p.sc || 1 });
    else if (p.lamp) { R('#12040a', x - 2, FLOOR - 70, 4, 70); R('#3a1418', x - 1, FLOOR - 70, 1, 70); R('#12040a', x - 7, FLOOR - 76, 14, 7); R('#ffe36a', x - 5, FLOOR - 74, 10, 3); for (var dy = 0; dy < 66; dy += 3) for (var dx = -dy * 0.35; dx <= dy * 0.35; dx += 4) if (((dx + dy) | 0) % 2 === 0) R('rgba(255,227,106,0.10)', x + dx, FLOOR - 70 + dy, 1, 1); }
    else if (p.torch) { R('#12040a', x - 2, FLOOR - 50, 4, 20); var f = Math.floor(G.t * 10 + s) % 3; R('#ff9a30', x - 3, FLOOR - 56 - f, 6, 6 + f); R('#ffe36a', x - 1, FLOOR - 54 - f, 2, 4); } }); }
  if (G.S.back === 'throne' && G.arena) { var tx = G.arena + W / 2 - G.cam; if (tx > -200 && tx < W + 200) drawThrone(tx, FLOOR + 1); } // his throne at the back of the last room
  segs('f_' + G.S.back + '_', KIT.H - FLOOR, FLOOR, function (s, r) { B.floor(s, r); });
  if (B.live) B.live();
}
/* things in front of the fight (a lamp post, a pipe), a little faster than the floor so they feel close */
function drawFront() {
  var B = BACKS[G.S.back]; if (!B.front) return; var k = 1.25, W = KIT.W, cam = G.cam * k, s0 = Math.floor(cam / SEG) - 1, s1 = Math.floor((cam + W) / SEG) + 1;
  for (var s = s0; s <= s1; s++) B.front(s, srand(s * 53 + 11)).forEach(function (f) { var x = f.x - cam, y = KIT.H, H = KIT.H;
    if (f.k === 'post') { R('#070304', x - 4, y - 40, 8, 40); R('#1a0a0e', x - 3, y - 40, 2, 40); R('#070304', x - 7, y - 42, 14, 3); }
    else if (f.k === 'pipe') { R('#0a0806', x - 6, FLOOR - 16, 12, H); R('#2a2018', x - 4, FLOOR - 16, 2, H); }
    else if (f.k === 'bulbpole') { R('#070304', x - 2, H - 56, 4, 56); var on = Math.floor(G.t * 3 + s) % 2; R(on ? '#ffe36a' : '#5a3a10', x - 3, H - 60, 6, 5); }
    else if (f.k === 'stalag') { var g = KIT.ctx; g.fillStyle = '#070405'; g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x, y - 46); g.lineTo(x + 12, y); g.fill(); }
    else if (f.k === 'girder') { R('#0a0606', x - 5, FLOOR + 14, 10, H); for (var gy = FLOOR + 18; gy < H; gy += 14) R('#2a1a1a', x - 5, gy, 10, 2); }
    else if (f.k === 'pillar') { R('#06020a', x - 9, FLOOR - 40, 18, H); R('#1a0a24', x - 7, FLOOR - 40, 3, H); } });
}

/* Blumhead's throne: tall black and purple, gold trim, his goo running down it */
function drawThrone(x, y) {
  var g = KIT.ctx; R('#12040a', x - 34, y - 92, 68, 92); R('#1e0a28', x - 31, y - 89, 62, 86); R('#4a1070', x - 24, y - 80, 48, 50); R('#7a2ad8', x - 22, y - 78, 44, 4);
  g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(x - 34, y - 92); g.lineTo(x - 26, y - 116); g.lineTo(x - 18, y - 92); g.moveTo(x - 8, y - 92); g.lineTo(x, y - 124); g.lineTo(x + 8, y - 92); g.moveTo(x + 18, y - 92); g.lineTo(x + 26, y - 116); g.lineTo(x + 34, y - 92); g.fill();
  g.fillStyle = '#ffc840'; [[-26, -112], [0, -120], [26, -112]].forEach(function (p) { g.fillRect(x + p[0] - 2, y + p[1], 4, 4); });
  R('#ffc840', x - 31, y - 89, 62, 2); R('#a8741a', x - 31, y - 4, 62, 2); R('#12040a', x - 40, y - 34, 80, 10); R('#2a1036', x - 38, y - 32, 76, 6); R('#ffc840', x - 38, y - 32, 76, 1);
  for (var i = 0; i < 4; i++) { var dx = [-20, -6, 9, 21][i], ln = 10 + ((Math.floor(G.t * 2) + i) % 4) * 4; R('#9a3ad8', x + dx, y - 30, 2, ln); }
  g.fillStyle = '#ffd0ff'; g.beginPath(); g.ellipse(x, y - 60, 7, 4, 0, 0, 6.3); g.fill(); R('#12040a', x - 1, y - 63, 2, 6);
}
