/* =====================================================================================================
   update 130: the micro games no longer play on flat colour (he said it all looked basic). While one is
   on screen, a full-screen fill becomes a banded backdrop with dither between the bands and drifting motes,
   a floor fill becomes a floor with depth (lit edge, lines running to a vanishing point, darker towards you),
   and the whole picture gets a cabinet screen finish: shaded corners, faint scanlines, a glass glint.
   ===================================================================================================== */
var AOBG = false, AOR0 = R;
function aoMix(c, k) { var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16), t = k > 0 ? 255 : 0, a = Math.abs(k); return 'rgb(' + Math.round(r + (t - r) * a) + ',' + Math.round(g + (t - g) * a) + ',' + Math.round(b + (t - b) * a) + ')'; }
function aoBack(c) {
  var L = KIT.layer('aoback' + c, W, H, function () { var n = 7, bh = Math.ceil(H / n), i, x;
    for (i = 0; i < n; i++) { var k = 0.1 - i * 0.045; AOR0(aoMix(c, k), 0, i * bh, W, bh); if (i) for (x = (i % 2) * 2; x < W; x += 4) { AOR0(aoMix(c, 0.1 - (i - 1) * 0.045), x, i * bh, 2, 2); AOR0(aoMix(c, k), x + 2, i * bh - 2, 2, 2); } } // bands, a row of dither where two meet
    for (i = 0; i < 46; i++) { var sx = (i * 131 + 17) % W, sy = (i * 71 + 9) % Math.round(H * 0.7); AOR0(aoMix(c, i % 5 ? 0.16 : 0.4), sx, sy, i % 7 ? 1 : 2, i % 7 ? 1 : 2); }
  }, { px: 1 }); KIT.blit(L, 0, 0);
  var t = KIT.t; for (var m = 0; m < 14; m++) { var mx = (m * 97 + t * (6 + m % 4 * 3)) % W, my = (m * 53 + Math.sin(t * 0.6 + m) * 8 + 300) % (H * 0.8); AOR0(aoMix(c, 0.3 + 0.2 * Math.sin(t * 2 + m)), mx, my, 2, 2); } // motes drifting across
}
function aoFloor(c, y, h) {
  var L = KIT.layer('aofloor' + c + '_' + y, W, h, function () { var g = KIT.ctx, i;
    for (i = 0; i < 5; i++) AOR0(aoMix(c, 0.05 - i * 0.07), 0, Math.floor(h * i / 5), W, Math.ceil(h / 5));
    g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1; for (i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 26, 0); g.lineTo(W / 2 + i * 90, h); g.stroke(); } // boards running towards you
    for (i = 1; i < 6; i++) { var yy = Math.round(h * (i * i) / 30); AOR0('rgba(0,0,0,0.26)', 0, yy, W, 1); AOR0('rgba(255,255,255,0.04)', 0, yy + 1, W, 1); }
    AOR0(aoMix(c, 0.3), 0, 0, W, 1); AOR0('rgba(255,255,255,0.08)', 0, 1, W, 1); AOR0('rgba(0,0,0,0.35)', 0, 2, W, 3); AOR0('rgba(0,0,0,0.15)', 0, 5, W, 4);
  }, { px: 1 }); KIT.blit(L, 0, y);
}
R = function (c, x, y, w, h) {
  if (AOBG && x === 0 && w === W && typeof c === 'string' && c.charAt(0) === '#' && c.length === 7) {
    if (y === 0 && h === H) { aoBack(c); return; }
    if (y >= 100 && y + h >= H - 1 && h >= 40) { aoFloor(c, y, h); return; } }
  AOR0(c, x, y, w, h);
};
drawMicro = (function (orig) { return function () {
  AOBG = true; try { M.g.draw(M); } finally { AOBG = false; }
  KIT.blit(KIT.layer('aoglass', W, H, function () { var g = KIT.ctx, i, v = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.36)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    for (i = 0; i < H; i += 3) AOR0('rgba(0,0,0,0.07)', 0, i, W, 1);
    g.fillStyle = 'rgba(255,255,255,0.035)'; g.beginPath(); g.moveTo(W * 0.08, 0); g.lineTo(W * 0.3, 0); g.lineTo(W * 0.12, H); g.lineTo(-W * 0.1, H); g.fill(); }), 0, 0);
  var gd = M.g.draw; M.g.draw = function () {}; try { orig(); } finally { M.g.draw = gd; } // the timer, the word and the gold frame on top
}; })(drawMicro);
