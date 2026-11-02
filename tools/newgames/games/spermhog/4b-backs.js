/* =====================================================================================================
   DISTRICT BACKDROPS: every part of Night City paints its own scenery behind the play field, once, into a
   cached layer: terraced houses, cafe string lights, tower cranes, downtown towers, neon, a wet alley with fire
   escapes, the docks, the overpass, the old church. Crossfaded where two districts meet.
   ===================================================================================================== */
function rngOf(seed) { var s = seed * 9301 + 49297; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
var BACKS = {
  terraces: function (g, r) { // two rows of terraced houses: gables, chimneys, warm windows
    for (var row = 0; row < 2; row++) { var base = 300, col = row ? '#1e0a0c' : '#120608', win = row ? 'rgba(255,200,110,0.55)' : 'rgba(255,180,90,0.25)';
      for (var x = -10 + row * 30; x < 960; ) { var w = 54 + Math.floor(r() * 30), h = (row ? 120 : 180) + Math.floor(r() * 50), top = base - h;
        g.fillStyle = col; g.fillRect(x, top, w, h); g.beginPath(); g.moveTo(x - 3, top); g.lineTo(x + w / 2, top - 22); g.lineTo(x + w + 3, top); g.fill();
        g.fillRect(x + w * 0.7, top - 30, 8, 20); g.fillStyle = '#060203'; g.fillRect(x + w - 2, top, 2, h);
        for (var wy = top + 12; wy < base - 30; wy += 26) for (var wx = x + 9; wx < x + w - 14; wx += 18) { if (r() < 0.55) { g.fillStyle = win; g.fillRect(wx, wy, 8, 12); g.fillStyle = col; g.fillRect(wx + 3, wy, 2, 12); } }
        x += w + 2; } } },
  cafe: function (g, r) { // low shops with awnings, trees, string lights swinging between poles
    for (var x = 0; x < 960; ) { var w = 70 + Math.floor(r() * 40), h = 110 + Math.floor(r() * 40), top = 300 - h; g.fillStyle = '#1a0c0a'; g.fillRect(x, top, w, h);
      var aw = ['#5a1418', '#3a2a10', '#2a1a30'][Math.floor(r() * 3)]; for (var s = 0; s < w; s += 10) { g.fillStyle = (s / 10) % 2 ? aw : '#120606'; g.fillRect(x + s, top + 40, 10, 12); }
      g.fillStyle = 'rgba(255,190,110,0.35)'; g.fillRect(x + 8, top + 58, w - 16, 26); x += w + 6; }
    for (var t = 30; t < 960; t += 150) { g.fillStyle = '#0a0606'; g.fillRect(t, 170, 4, 130); g.beginPath(); g.arc(t + 2, 160, 26 + r() * 8, 0, 6.3); g.fill(); }
    for (var p = 0; p < 960; p += 120) { g.fillStyle = '#0a0606'; g.fillRect(p, 110, 3, 190); g.strokeStyle = '#0a0606'; g.lineWidth = 1; g.beginPath(); g.moveTo(p, 112); g.quadraticCurveTo(p + 60, 140, p + 120, 112); g.stroke();
      for (var b = 1; b < 10; b++) { var tt = b / 10, bx = p + 120 * tt, by = 112 + 4 * 28 * tt * (1 - tt); g.fillStyle = b % 3 === 0 ? '#f1e7d0' : '#ff2630'; g.fillRect(bx - 1, by + 1, 3, 3); g.fillStyle = 'rgba(255,60,60,0.18)'; g.fillRect(bx - 4, by - 2, 9, 9); } } },
  cranes: function (g, r) { // tower cranes, a half-built tower of beams, scaffolding
    g.strokeStyle = '#140a08'; g.fillStyle = '#140a08';
    for (var k = 0; k < 2; k++) { var cx = 160 + k * 480 + r() * 60, top = 30 + r() * 30; g.lineWidth = 2; for (var y = top; y < 300; y += 14) { g.strokeRect(cx, y, 12, 14); g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + 12, y + 14); g.stroke(); }
      g.fillRect(cx - 120, top - 6, 260, 6); for (var j = -120; j < 140; j += 12) { g.beginPath(); g.moveTo(cx + j, top - 6); g.lineTo(cx + j + 6, top - 16); g.lineTo(cx + j + 12, top - 6); g.stroke(); }
      g.fillRect(cx + 120, top, 18, 18); g.fillRect(cx + 80, top, 2, 70); g.fillRect(cx + 74, top + 70, 14, 8); g.fillStyle = '#ff2630'; g.fillRect(cx + 4, top - 22, 4, 4); g.fillStyle = '#140a08'; }
    var bx = 360, bt = 90; g.lineWidth = 3; for (var fy = bt; fy < 300; fy += 30) { g.beginPath(); g.moveTo(bx, fy); g.lineTo(bx + 200, fy); g.stroke(); } for (var fx = bx; fx <= bx + 200; fx += 40) { g.beginPath(); g.moveTo(fx, bt); g.lineTo(fx, 300); g.stroke(); }
    g.fillStyle = 'rgba(255,200,60,0.12)'; g.fillRect(bx + 40, bt + 90, 40, 30); g.lineWidth = 1; g.strokeStyle = '#1e100c';
    for (var sx = 700; sx < 940; sx += 20) { g.beginPath(); g.moveTo(sx, 150); g.lineTo(sx, 300); g.stroke(); } for (var sy = 150; sy < 300; sy += 30) { g.beginPath(); g.moveTo(700, sy); g.lineTo(940, sy); g.stroke(); } },
  towers: function (g, r) { cityTowers(g, r, 77); },
  neon: function (g, r) { // the plaza: tall facades hung with neon
    for (var x = 0; x < 960; ) { var w = 90 + Math.floor(r() * 60), h = 160 + Math.floor(r() * 100), top = 300 - h; g.fillStyle = '#100608'; g.fillRect(x, top, w, h);
      var nc = ['#ff2630', '#ff2a6a', '#c4121c', '#ff5a5a'][Math.floor(r() * 4)]; g.save(); g.strokeStyle = nc; g.lineWidth = 2;
      var sy = top + 20 + r() * 40; if (r() < 0.5) { g.beginPath(); g.arc(x + w / 2, sy + 14, 14, 0, 6.3); g.stroke(); } else g.strokeRect(x + 12, sy, w - 24, 24); g.beginPath(); g.moveTo(x + 14, sy + 40); g.lineTo(x + w - 14, sy + 40); g.stroke(); g.restore();
      for (var wy = sy + 56; wy < 280; wy += 22) for (var wx = x + 10; wx < x + w - 12; wx += 16) if (r() < 0.3) { g.fillStyle = 'rgba(255,90,120,0.3)'; g.fillRect(wx, wy, 7, 10); }
      x += w + 4; } },
  alley: function (g, r) { // close wet brick walls, fire escapes zig-zagging, neon hearts and arrows, pipes
    g.fillStyle = '#16080a'; g.fillRect(0, 20, 960, 280); for (var y = 20; y < 300; y += 8) for (var x = ((y / 8) % 2) * 12; x < 960; x += 24) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y, 23, 1); g.fillRect(x, y, 1, 8); }
    for (var f = 40; f < 960; f += 220) { g.strokeStyle = '#06020a'; g.lineWidth = 2; for (var lv = 60; lv < 260; lv += 50) { g.strokeRect(f, lv, 90, 4); g.beginPath(); g.moveTo(f + (lv % 100 ? 10 : 80), lv + 4); g.lineTo(f + (lv % 100 ? 80 : 10), lv + 50); g.stroke(); for (var rl = f; rl < f + 90; rl += 10) { g.beginPath(); g.moveTo(rl, lv); g.lineTo(rl, lv - 12); g.stroke(); } g.beginPath(); g.moveTo(f, lv - 12); g.lineTo(f + 90, lv - 12); g.stroke(); }
      g.fillStyle = 'rgba(255,200,120,0.3)'; g.fillRect(f + 20, 150, 16, 22); }
    for (var n = 150; n < 960; n += 260) { g.save(); g.strokeStyle = '#ff2a8a'; g.lineWidth = 2; g.beginPath(); g.moveTo(n, 110); g.bezierCurveTo(n - 20, 90, n - 20, 70, n, 80); g.bezierCurveTo(n + 20, 70, n + 20, 90, n, 110); g.stroke();
      g.strokeStyle = '#ff2630'; g.beginPath(); g.moveTo(n + 50, 140); g.lineTo(n + 90, 140); g.lineTo(n + 82, 132); g.moveTo(n + 90, 140); g.lineTo(n + 82, 148); g.stroke(); g.restore(); }
    for (var pp = 100; pp < 960; pp += 170) { g.fillStyle = '#0a0406'; g.fillRect(pp, 20, 6, 280); g.fillRect(pp - 4, 200, 14, 6); } },
  docks: function (g, r) { // the cream harbour: warehouse roofs, a big ship, harbour cranes, the water
    g.fillStyle = '#0c0608'; for (var x = 0; x < 960; x += 130) { g.fillRect(x, 170, 120, 130); g.beginPath(); g.moveTo(x, 170); g.lineTo(x + 60, 140); g.lineTo(x + 120, 170); g.fill(); }
    g.fillStyle = '#08040a'; g.beginPath(); g.moveTo(420, 230); g.lineTo(760, 230); g.lineTo(730, 270); g.lineTo(440, 270); g.fill(); g.fillRect(520, 190, 120, 40); g.fillRect(560, 160, 30, 30); g.fillStyle = 'rgba(255,200,120,0.4)'; for (var p = 530; p < 630; p += 16) g.fillRect(p, 200, 6, 6);
    for (var k = 0; k < 2; k++) { var cx = 120 + k * 640; g.fillStyle = '#100608'; g.fillRect(cx, 60, 10, 240); g.fillRect(cx - 50, 60, 140, 8); g.fillRect(cx + 60, 68, 2, 90); g.fillRect(cx + 54, 158, 14, 12); g.fillStyle = '#ff2630'; g.fillRect(cx + 2, 54, 5, 5); }
    g.fillStyle = 'rgba(241,224,176,0.12)'; g.fillRect(0, 270, 960, 30); for (var w = 0; w < 960; w += 24) { g.fillStyle = 'rgba(255,240,200,0.18)'; g.fillRect(w + (r() * 10 | 0), 276 + (r() * 18 | 0), 10, 1); } },
  highway: function (g, r) { // the overpass: concrete pillars, a far road with tail lights, billboards
    g.fillStyle = '#0e0a0c'; g.fillRect(0, 120, 960, 14); for (var x = 0; x < 960; x += 80) { g.fillStyle = 'rgba(255,40,48,0.6)'; g.fillRect(x + r() * 60, 124, 4, 2); g.fillStyle = 'rgba(255,240,200,0.6)'; g.fillRect(x + r() * 60, 128, 4, 2); }
    for (var p = 40; p < 960; p += 160) { g.fillStyle = '#120c0e'; g.fillRect(p, 134, 26, 166); g.fillRect(p - 8, 134, 42, 10); }
    for (var b = 100; b < 960; b += 320) { g.fillStyle = '#0a0606'; g.fillRect(b + 40, 70, 4, 50); g.fillRect(b + 100, 70, 4, 50); g.fillStyle = '#1a0a0c'; g.fillRect(b, 20, 150, 56); g.strokeStyle = '#c4121c'; g.lineWidth = 2; g.strokeRect(b + 4, 24, 142, 48); g.fillStyle = 'rgba(241,231,208,0.2)'; g.fillRect(b + 14, 34, 60, 8); g.fillRect(b + 14, 48, 90, 6); }
    g.fillStyle = '#0a0608'; g.fillRect(0, 230, 960, 70); for (var s = 0; s < 960; s += 40) { g.fillStyle = 'rgba(241,231,208,0.25)'; g.fillRect(s, 262, 20, 2); } },
  church: function (g, r) { // old town: the cathedral, its rose window, gravestones, dead trees, the red moon
    g.fillStyle = 'rgba(196,18,28,0.55)'; g.beginPath(); g.arc(780, 70, 40, 0, 6.3); g.fill(); g.fillStyle = '#0a0406';
    var cx = 360; g.fillRect(cx, 110, 200, 190); g.beginPath(); g.moveTo(cx + 70, 110); g.lineTo(cx + 100, 0); g.lineTo(cx + 130, 110); g.fill(); g.fillRect(cx + 80, 40, 40, 70);
    g.beginPath(); g.moveTo(cx - 10, 110); g.lineTo(cx + 100, 60); g.lineTo(cx + 210, 110); g.fill(); g.fillStyle = 'rgba(196,18,28,0.6)'; g.beginPath(); g.arc(cx + 100, 150, 18, 0, 6.3); g.fill(); g.fillStyle = '#0a0406'; for (var a = 0; a < 8; a++) g.fillRect(cx + 100 + Math.cos(a * 0.785) * 9 - 1, 150 + Math.sin(a * 0.785) * 9 - 1, 3, 3);
    g.fillStyle = 'rgba(255,170,80,0.3)'; for (var wx = cx + 20; wx < cx + 190; wx += 30) { g.beginPath(); g.moveTo(wx, 230); g.lineTo(wx, 200); g.arc(wx + 6, 200, 6, Math.PI, 0); g.lineTo(wx + 12, 230); g.fill(); } g.fillStyle = '#0a0406';
    for (var t = 60; t < 960; t += 280) { g.fillRect(t, 160, 6, 140); for (var b = 0; b < 5; b++) { g.save(); g.translate(t + 3, 170 + b * 18); g.rotate((b % 2 ? 1 : -1) * 0.8); g.fillRect(0, 0, 34 - b * 4, 3); g.restore(); } }
    for (var gs = 0; gs < 960; gs += 38) { var gh = 18 + r() * 14; g.fillRect(gs, 300 - gh, 14, gh); g.beginPath(); g.arc(gs + 7, 300 - gh, 7, Math.PI, 0); g.fill(); } },
  drain: function (g, r) { // the city wall and the great storm drain the Beast lives in
    g.fillStyle = '#100a0a'; g.fillRect(0, 60, 960, 240); for (var y = 60; y < 300; y += 16) for (var x = ((y / 16) % 2) * 20; x < 960; x += 40) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, y, 39, 1); g.fillRect(x, y, 1, 16); }
    g.fillStyle = '#050304'; g.beginPath(); g.arc(480, 300, 140, Math.PI, 0); g.fill(); g.strokeStyle = '#2a2420'; g.lineWidth = 6; g.beginPath(); g.arc(480, 300, 140, Math.PI, 0); g.stroke();
    for (var b = 0; b < 9; b++) { g.fillStyle = '#1a1412'; g.fillRect(380 + b * 24, 170, 6, 130); } g.fillStyle = 'rgba(241,224,176,0.25)'; g.fillRect(440, 280, 80, 20); }
};
function cityTowers(g, r, seed) { // the black towers (two depths were drawn by cityMid before districts)
  for (var x = -20; x < 960; ) {
    var w = 50 + Math.floor(r() * 70), h = 120 + Math.floor(r() * 170), top = 300 - h;
    g.fillStyle = r() < 0.5 ? '#12060a' : '#180a0e'; g.fillRect(x, top, w, h); g.fillStyle = '#060203'; g.fillRect(x + w - 4, top, 4, h); g.fillRect(x, top, w, 3);
    for (var wy = top + 10; wy < 290; wy += 12) for (var wx = x + 6; wx < x + w - 8; wx += 9) { var q = r(); if (q < 0.18) { g.fillStyle = q < 0.1 ? 'rgba(255,40,48,0.55)' : 'rgba(241,200,170,0.35)'; g.fillRect(wx, wy, 4, 6); } else if (q < 0.5) { g.fillStyle = 'rgba(60,20,26,0.8)'; g.fillRect(wx, wy, 4, 6); } }
    if (r() < 0.35) { g.fillStyle = '#0a0406'; g.fillRect(x + 10, top - 18, 22, 14); g.beginPath(); g.moveTo(x + 8, top - 18); g.lineTo(x + 21, top - 26); g.lineTo(x + 34, top - 18); g.fill(); }
    else if (r() < 0.5) { g.fillStyle = '#0a0406'; g.fillRect(x + w / 2, top - 30, 2, 30); g.fillStyle = '#ff2630'; g.fillRect(x + w / 2 - 1, top - 32, 4, 3); }
    x += w + Math.floor(r() * 6);
  }
}
function distLayer(id) { return KIT.layer('dback_' + id, 960, 300, function () { var g = KIT.ctx, r = rngOf(id.length * 131 + id.charCodeAt(0)); (BACKS[DIST[id].back] || BACKS.towers)(g, r); }, { px: 1, crisp: 1 }); } // painted at game pixel size with hard edges: crisp Mega Drive scenery, nothing see-through
/* draw the district backdrop at the camera. Where one district meets the next, the new scenery starts at a gateway
   column that moves with the ground (a hard cut, hidden behind a tall pillar), never a see-through blend */
function drawDistrictBack(g, cx, vy, W, H) {
  var ds = LV.dists, my = Math.round(vy * 1.4) + H - 300;
  if (LV.zone.id === 'city') { var far = cityMid('citymid0', 0.55), fx = -(((cx * 0.22) % 960) + 960) % 960; for (; fx < W; fx += 960) KIT.blit(far, fx, Math.round(vy * 1.22) + H - 270); }
  function one(id, x0, x1) { if (!id || x1 <= x0) return; var L = distLayer(id), mx = -(((cx * 0.4) % 960) + 960) % 960; g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, H); g.clip(); for (; mx < W; mx += 960) KIT.blit(L, mx, my); if (my + 300 < H) { g.fillStyle = '#0a0406'; g.fillRect(x0, my + 299, x1 - x0, H - my - 299); } g.restore(); }
  var left = distAt(Math.floor(cx / TS)), x = 0, gates = [];
  for (var i = 0; i < ds.length; i++) { var bx = Math.round(ds[i].c * TS - cx); if (bx <= 0 || bx >= W) continue; one(left, x, bx); gates.push(bx); left = ds[i].id; x = bx; }
  one(left, x, W);
  gates.forEach(function (bx) { drawGate(g, bx, H); });
}
function drawGate(g, x, H) { // a tall dark pillar where two districts meet, so the scenery changes behind something solid
  var c = LV.zone.edge || ['#ff2630', '#c4121c']; R('#060203', x - 10, 0, 20, H); R('#140608', x - 8, 0, 16, H); R('#1e0a0e', x - 8, 0, 3, H);
  for (var y = 8; y < H; y += 40) { R('#060203', x - 10, y, 20, 3); R(c[1], x - 2, y + 12, 4, 10); }
}
