/* =====================================================================================================
   PARALLAX (his ask: Sonic levels of parallax and detail). Behind the district's own scenery every zone has a
   far layer and a middle layer, and in front of it a near layer of dark silhouettes rimmed with light, all
   scrolling at their own speeds, plus a few moving things in the air (embers, drips, sparks, smoke).
   Every layer is painted at game pixel size with hard edges, never see-through.
   ===================================================================================================== */
function ridge(g, col, base, amp, step, r, sharp) { // a jagged skyline of hills, roofs or rock along the bottom of a layer
  g.fillStyle = col; g.beginPath(); g.moveTo(0, 400); var y = base;
  for (var x = 0; x <= 960; x += step) { y = base - r() * amp; if (sharp) { g.lineTo(x, y); g.lineTo(x + step / 2, base - r() * amp * 0.4); } else g.lineTo(x, y); }
  g.lineTo(960, 400); g.closePath(); g.fill();
}
function spire(g, col, x, w, h, base) { g.fillStyle = col; g.fillRect(x, base - h, w, h); g.beginPath(); g.moveTo(x - 2, base - h); g.lineTo(x + w / 2, base - h - w * 2.2); g.lineTo(x + w + 2, base - h); g.fill(); }
var FARP = { // the far distance, slowest of all
  city: function (g, r) { ridge(g, '#1a0a0c', 200, 40, 30, r); for (var x = 20; x < 960; x += 70 + r() * 90) spire(g, '#1a0a0c', x, 10 + r() * 10, 40 + r() * 70, 200); for (var w = 80; w < 960; w += 300) { g.fillStyle = '#1a0a0c'; g.fillRect(w, 120, 30, 22); g.fillRect(w + 4, 142, 4, 60); g.fillRect(w + 22, 142, 4, 60); } },
  sewer: function (g, r) { g.fillStyle = '#0e140f'; g.fillRect(0, 0, 960, 40); for (var x = 0; x < 960; x += 14 + r() * 20) { var l = 10 + r() * 50; g.beginPath(); g.moveTo(x, 38); g.lineTo(x + 6, 38 + l); g.lineTo(x + 12, 38); g.fill(); } BK.arches(g, '#0e140f', 6, 110, 40); },
  park: function (g, r) { ridge(g, '#14060e', 205, 25, 40, r); g.strokeStyle = '#1e0a16'; g.lineWidth = 3; g.beginPath(); for (var x = 0; x <= 960; x += 8) g.lineTo(x, 120 + Math.sin(x / 70) * 40 + Math.sin(x / 23) * 8); g.stroke(); for (var s = 10; s < 960; s += 24) { g.fillStyle = '#1e0a16'; g.fillRect(s, 120 + Math.sin(s / 70) * 40 + Math.sin(s / 23) * 8, 2, 100); } BK.wheel(g, '#1e0a16', 720, 110, 70, 12, 3); BK.tent(g, '#1e0a16', '#180812', 260, 140, 110); },
  bone: function (g, r) { ridge(g, '#1a1612', 205, 90, 24, r, true); g.fillStyle = '#221c16'; g.beginPath(); g.arc(600, 120, 60, Math.PI, 0); g.fill(); g.fillRect(550, 120, 100, 40); g.fillStyle = '#0e0a08'; g.beginPath(); g.arc(578, 120, 13, 0, 6.3); g.arc(622, 120, 13, 0, 6.3); g.fill(); g.fillRect(585, 145, 30, 8); },
  factory: function (g, r) { ridge(g, '#140a08', 210, 20, 50, r); for (var x = 30; x < 960; x += 110 + r() * 60) { var h = 80 + r() * 80; g.fillStyle = '#1c0e0a'; g.fillRect(x, 210 - h, 18, h); g.fillRect(x - 3, 210 - h, 24, 6); } for (var c = 150; c < 960; c += 380) { g.fillStyle = '#1c0e0a'; g.fillRect(c, 60, 6, 150); g.fillRect(c - 60, 60, 160, 6); for (var k = c - 60; k < c + 100; k += 10) g.fillRect(k, 66, 2, 6); } },
  brain: function (g, r) { ridge(g, '#0e0a14', 210, 30, 36, r); for (var x = 60; x < 960; x += 200) { g.fillStyle = '#16101e'; g.beginPath(); g.arc(x, 170, 50, Math.PI, 0); g.fill(); g.fillRect(x - 2, 80, 4, 50); g.fillRect(x - 8, 78, 16, 4); } for (var s = 0; s < 960; s += 90) spire(g, '#16101e', s + 30, 8, 60 + r() * 60, 210); }
};
var MIDP = { // between the far distance and the district's own scenery
  city: null, // Clubhouse Row already has its two depths of towers
  sewer: function (g, r) { for (var i = 0; i < 6; i++) BK.pipe(g, '#141e16', '#1e2c20', 0, 60 + i * 30, 960, 60 + i * 30 + (r() - 0.5) * 20, 10); for (var t = 40; t < 960; t += 240) BK.tank(g, '#141e16', '#203024', t, 120, 70, 140); },
  park: function (g, r) { for (var x = 0; x < 960; x += 160) BK.tent(g, '#200a14', '#18060e', x, 120, 90 + r() * 40); for (var b = 0; b < 960; b += 12) { g.fillStyle = (b / 12) % 2 ? '#3a0a12' : '#2a0810'; g.fillRect(b, 150 + Math.sin(b / 40) * 6, 6, 4); } },
  bone: function (g, r) { for (var x = 0; x < 960; x += 180) BK.ribs(g, '#241e18', x, 140, 150 + r() * 60); },
  factory: function (g, r) { for (var x = 0; x < 960; x += 120) { BK.tank(g, '#1e100c', '#2c1812', x + 10, 140, 60, 140); } for (var p = 0; p < 4; p++) BK.pipe(g, '#1e100c', '#2c1812', 0, 110 + p * 24, 960, 110 + p * 24, 8); },
  brain: function (g, r) { for (var x = 40; x < 960; x += 150) BK.gear(g, '#16101e', x, 150 + r() * 60, 30 + r() * 20); for (var c = 0; c < 960; c += 60) { g.fillStyle = '#16101e'; g.fillRect(c, 0, 3, 90 + r() * 80); } }
};
var NEARC = { city: ['#060203', '#3a1014'], sewer: ['#040806', '#2a3a2c'], park: ['#06020a', '#5a1020'], bone: ['#080604', '#3a3226'], factory: ['#060302', '#4a2010'], brain: ['#050308', '#2a1a40'] };
var NEARBAND = { city: 46, sewer: 40, park: 30, bone: 20, factory: 40, brain: 0 };
var NEARP = { // close up, in front of the district's scenery and behind the level: dark shapes with a lit edge
  city: function (g, r, c) { for (var x = 0; x < 960; x += 4) { g.fillStyle = c[0]; g.fillRect(x, 92, 2, 48); } g.fillRect(0, 90, 960, 4); for (var p = 30; p < 960; p += 150) { g.fillRect(p, 40, 6, 100); g.fillRect(p - 6, 32, 18, 10); g.fillStyle = c[1]; g.fillRect(p, 40, 1, 100); g.fillStyle = c[0]; } g.fillStyle = c[1]; g.fillRect(0, 90, 960, 1); },
  sewer: function (g, r, c) { for (var i = 0; i < 960; i += 320) { g.fillStyle = c[0]; g.fillRect(i, 60, 160, 26); g.fillRect(i + 140, 60, 26, 80); g.fillStyle = c[1]; g.fillRect(i, 60, 160, 2); g.fillRect(i + 140, 60, 2, 80); g.fillStyle = c[0]; g.beginPath(); g.arc(i + 70, 73, 16, 0, 6.3); g.fill(); g.fillStyle = c[1]; g.fillRect(i + 62, 72, 16, 2); } },
  park: function (g, r, c) { g.fillStyle = c[0]; g.fillRect(0, 100, 960, 4); for (var x = 0; x < 960; x += 24) { g.fillRect(x, 70, 4, 70); g.beginPath(); g.moveTo(x - 2, 72); g.lineTo(x + 2, 62); g.lineTo(x + 6, 72); g.fill(); } g.fillStyle = c[1]; g.fillRect(0, 100, 960, 1); for (var b = 0; b < 960; b += 16) { g.fillStyle = b % 32 ? '#ff2630' : '#ffe36a'; g.fillRect(b, 40 + Math.sin(b / 50) * 8, 2, 2); } },
  bone: function (g, r, c) { for (var x = 0; x < 960; x += 200) { g.strokeStyle = c[0]; g.lineWidth = 12; g.beginPath(); g.arc(x + 100, 150, 90, Math.PI, 0); g.stroke(); g.strokeStyle = c[1]; g.lineWidth = 1; g.beginPath(); g.arc(x + 100, 150, 96, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); } },
  factory: function (g, r, c) { g.fillStyle = c[0]; g.fillRect(0, 40, 960, 10); for (var x = 0; x < 960; x += 40) { g.beginPath(); g.moveTo(x, 50); g.lineTo(x + 20, 80); g.lineTo(x + 40, 50); g.lineTo(x + 36, 50); g.lineTo(x + 20, 72); g.lineTo(x + 4, 50); g.fill(); } for (var p = 80; p < 960; p += 240) g.fillRect(p, 50, 12, 90); g.fillStyle = c[1]; g.fillRect(0, 40, 960, 1); },
  brain: function (g, r, c) { for (var k = 0; k < 6; k++) { g.strokeStyle = k % 2 ? c[1] : c[0]; g.lineWidth = k % 2 ? 1 : 4; g.beginPath(); var y0 = 20 + k * 8; g.moveTo(0, y0); for (var x = 0; x <= 960; x += 40) g.quadraticCurveTo(x + 20, y0 + 40 + r() * 20, x + 40, y0); g.stroke(); } }
};
function parLayer(kind, z) {
  var tab = kind === 'far' ? FARP : kind === 'mid' ? MIDP : NEARP, f = tab[z]; if (!f) return null;
  var h = kind === 'far' ? 220 : kind === 'mid' ? 260 : 140, dim = kind === 'far' ? 0.35 : kind === 'mid' ? 0.15 : 0;
  return KIT.layer('par_' + kind + '_' + z, 960, h, function () { var g = KIT.ctx, r = rngOf(z.length * 31 + (kind === 'far' ? 7 : kind === 'mid' ? 13 : 19)); f(g, r, NEARC[z]); }, { px: 1, crisp: 1, dim: dim });
}
function drawPar(g, kind, z, cx, vy, W, H) {
  var L = parLayer(kind, z); if (!L) return;
  var par = kind === 'far' ? 0.1 : kind === 'mid' ? 0.22 : 0.62, x = -(((cx * par) % 960) + 960) % 960, y = Math.round(vy * (1 + par)) + H - L.lh - (kind === 'far' ? 40 : kind === 'mid' ? 20 : -10);
  for (; x < W; x += 960) KIT.blit(L, x, y);
  // every layer carries on down to the bottom of the screen, so going up a hill never shows its bottom edge floating (he spotted the fence doing it)
  if (y + L.lh >= H) return;
  if (kind !== 'near') { g.fillStyle = kind === 'far' ? '#0a0406' : '#080304'; g.fillRect(0, y + L.lh - 1, W, H - y - L.lh + 1); return; }
  // the near layer (railings, pipes, posts) carries on downwards as itself: its bottom band repeats to the bottom of the screen, never a solid block
  var band = NEARBAND[z] === undefined ? 24 : NEARBAND[z], sc = L.height / L.lh, x2; if (!band) return;
  for (var yy = y + L.lh; yy < H; yy += band) for (x2 = -(((cx * par) % 960) + 960) % 960; x2 < W; x2 += 960) g.drawImage(L, 0, (L.lh - band) * sc, L.width, band * sc, Math.round(x2), Math.round(yy), 960, band);
}
/* the moving things in the air: each zone its own, keyed to the world so they never jump about */
function drawAir(g, z, cx, cy, W, H) {
  var t = G.t, n = 26;
  for (var i = 0; i < n; i++) {
    var sx = (i * 137.5 + 40) % (W + 40), px = (((sx - cx * 0.5) % (W + 40)) + W + 40) % (W + 40);
    if (z === 'city' || z === 'bone') { var y = ((i * 71 + t * (18 + i % 5 * 6)) % (H + 40)) - 20; var x = (px + Math.sin(t * 0.8 + i) * 12) % W; R(z === 'city' ? (i % 3 ? '#ff2630' : '#ffe36a') : '#d8ccb0', x, H - y, 1, 1); if (i % 4 === 0) R(z === 'city' ? '#7a0a10' : '#8a7a5a', x + 1, H - y + 1, 1, 1); }
    else if (z === 'sewer') { var dy = (t * 160 + i * 53) % (H * 0.8); R('#c8b080', px % W, dy, 1, 3); }
    else if (z === 'park') { if (Math.sin(t * 3 + i * 1.7) > 0.6) R(i % 2 ? '#ffe36a' : '#ff2630', px % W, 20 + (i * 37) % (H * 0.5), 2, 2); }
    else if (z === 'factory') { var sy = (t * 40 + i * 29) % (H * 0.7), sx2 = (px + Math.sin(t + i) * 20) % W; R(i % 3 ? '#ff9a30' : '#ffe36a', sx2, H * 0.75 - sy, 1, 1); }
    else if (z === 'brain') { if ((Math.floor(t * 6) + i) % 13 === 0) { var bx = px % W, by = 30 + (i * 47) % (H * 0.6); R('#c08aff', bx, by, 1, 6); R('#c08aff', bx + 1, by + 5, 3, 1); R('#ffffff', bx, by + 2, 1, 1); } }
  }
}
