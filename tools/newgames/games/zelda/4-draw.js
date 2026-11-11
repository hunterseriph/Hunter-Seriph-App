/* ---------- drawing: the land is painted in chunks once (and again when a bush is cut), rooms once each, and everyone on
   top, sorted by how far down the screen their feet are ---------- */
var R = KIT.R, CHW = 16, CHH = 10;
function shadeHex(h, k) { var n = parseInt(h.slice(1), 16), r = Math.min(255, ((n >> 16) & 255) * k) | 0, g = Math.min(255, ((n >> 8) & 255) * k) | 0, b = Math.min(255, (n & 255) * k) | 0; return 'rgb(' + r + ',' + g + ',' + b + ')'; }
function wt(i, j) { if (!WT || i < 0 || j < 0 || i >= WW || j >= WHT) return 3; return WT[widx(i, j)]; }
function dirtyChunk(i, j) { var k = Math.floor(i / CHW) + ',' + Math.floor(j / CHH); KIT.dropLayer && KIT.dropLayer('lcw:' + k + ':' + (CHV[k] || 0)); CHV[k] = (CHV[k] || 0) + 1; }
function chunkLayer(ci, cj) { var k = ci + ',' + cj; return KIT.layer('lcw:' + k + ':' + (CHV[k] || 0), CHW * TS, CHH * TS, function () { for (var j = 0; j < CHH; j++) for (var i = 0; i < CHW; i++) { var wi = ci * CHW + i, wj = cj * CHH + j; if (wi >= WW || wj >= WHT) continue; paintW(WT[widx(wi, wj)], i * TS, j * TS, wi, wj); } }, { px: 1 }); }
/* the land's tiles */
function paintW(t, x, y, i, j) {
  var g = KIT.ctx, q = widx(i, j), bk = BKEYS[WB[q]], B = BIOME[bk], v = (i * 7 + j * 13) % 5, h = hash2(i, j, 31);
  function ground() { if (bk === 'shore' || t === 36) { R('#5e5042', x, y, TS, TS); R('#6e5e4c', x + 3 + v * 4, y + 5, 3, 2); R('#4e4236', x + 15 - v, y + 15, 2, 2); if (h < 0.15) { R('#e8dcc8', x + 9, y + 11, 3, 2); } return; }
    if (bk === 'city') { R('#1a1012', x, y, TS, TS); R('#24161a', x + 3 + v * 4, y + 5, 2, 4); return; }
    R(B.g, x, y, TS, TS); R(B.g2, x + 3 + v * 4, y + 5, 2, 4); R(B.g2, x + 15 - v, y + 15, 3, 2); if (v === 3) R(B.blood ? '#3a0a10' : shadeHex(B.g, 1.4), x + 10, y + 9, 2, 2); if (bk === 'bones' && h < 0.2) R('#4a3e34', x + 4, y + 18, 6, 1); if (bk === 'wastes' && h < 0.25) R('#3a1040', x + 6 + v, y + 8, 3, 2); if (bk === 'wood' && h < 0.3) R('#20141a', x + 2 + v * 3, y + 12, 4, 1); }
  if (t === 3) { var sea = SEA[q], wc = sea ? '#22060c' : B.water; R(wc, x, y, TS, TS); var hi = sea ? '#4a1018' : B.cream ? '#fff6dc' : B.tar ? '#3a2020' : B.goo ? '#9a3aaa' : '#a8141e';
    if (wt(i, j - 1) !== 3) { R(shadeHex(sea ? '#22060c' : B.water, 0.6), x, y, TS, 3); R(sea ? '#e8dcc8' : hi, x + (h * 8 | 0), y + 3, 6, 1); } if (wt(i - 1, j) !== 3) R(hi, x, y + 4, 1, 14); if (wt(i + 1, j) !== 3) R(hi, x + TS - 1, y + 4, 1, 14); if (wt(i, j + 1) !== 3) R(shadeHex(wc, 1.35), x, y + TS - 2, TS, 2);
    R(hi, x + 3 + v * 3, y + 9, 6, 1); R(hi, x + 12, y + 17, 5, 1); if (B.cream && v === 1) R('#fff6dc', x + 8, y + 12, 3, 3); return; }
  if (t === 11) { R(B.water, x, y, TS, TS); R('#12040a', x, y + 1, TS, TS - 2); R('#6e3a1e', x, y + 2, TS, TS - 4); for (var p = 0; p < TS; p += 6) R('#3a1a0c', x + p, y + 2, 1, TS - 4); R('#8a5a2e', x, y + 2, TS, 1); return; }
  if (t === 4) { if (bk === 'city') { paintW(38, x, y, i, j); return; } R(B.path, x, y, TS, TS); var c = shadeHex(B.path, 0.75), c2 = shadeHex(B.path, 1.2); R(c, x + 2 + v * 3, y + 5, 4, 2); R(c, x + 14, y + 15 - v, 3, 2); R(c2, x + 9, y + 9, 2, 1); R(c2, x + 18 - v, y + 3, 2, 1);
    if (wt(i - 1, j) !== 4 && wt(i - 1, j) !== 11) R(shadeHex(B.path, 0.6), x, y, 1, TS); if (wt(i + 1, j) !== 4 && wt(i + 1, j) !== 11) R(shadeHex(B.path, 0.6), x + TS - 1, y, 1, TS); return; }
  if (t === 38) { R('#2a2024', x, y, TS, TS); var cc = '#1a1216', cl = '#3a2e32'; for (var r2 = 0; r2 < 3; r2++) { R(cc, x, y + r2 * 8, TS, 1); R(cc, x + ((r2 + j) % 2 ? 4 : 12), y + r2 * 8, 1, 8); R(cc, x + ((r2 + j) % 2 ? 16 : 0) + 4, y + r2 * 8, 1, 8); R(cl, x + 2, y + r2 * 8 + 1, 5, 1); } if (h < 0.06) R('#4a0a10', x + 8, y + 10, 5, 3); return; }
  if (t === 6) { var top = wt(i, j - 1) !== 6, bot = wt(i, j + 1) !== 6 && wt(i, j + 1) !== 7 && wt(i, j + 1) !== 12;
    R('#2e2220', x, y, TS, TS); R('#3a2c28', x + 2 + v * 3, y + 4, 6, 3); R('#241a18', x + 12, y + 14 - v, 7, 2); if (h < 0.3) R('#4a3a34', x + 6, y + 10, 3, 2);
    if (wt(i - 1, j) !== 6) R('#1a1210', x, y, 2, TS); if (wt(i + 1, j) !== 6) R('#1a1210', x + TS - 2, y, 2, TS);
    if (top) { R('#12040a', x, y, TS, 2); R('#5a4a42', x, y + 2, TS, 3); R('#6e5c52', x + 2, y + 2, TS - 4, 1); }
    if (bot) { R('#1e1412', x, y + 8, TS, 16); for (var s = 0; s < TS; s += 5) R('#140c0a', x + s + (j % 2), y + 9, 1, 14); R('#3a2c28', x, y + 8, TS, 2); R('#12040a', x, y + TS - 1, TS, 1); } return; }
  if (t === 47) { R('#2e2220', x, y, TS, TS); for (var st = 0; st < 4; st++) { R('#4a3a34', x + 2, y + st * 6, TS - 4, 4); R('#6a5850', x + 2, y + st * 6, TS - 4, 1); R('#1a1210', x + 2, y + st * 6 + 4, TS - 4, 2); } return; }
  if (t === 39) { var roof = wt(i, j - 1) !== 39; if (roof || (j > 0 && wt(i, j - 2) !== 39)) { R('#12040a', x, y, TS, TS); R('#2a0a10', x, y + 1, TS, TS - 1); for (var sl = 0; sl < 4; sl++) R(sl % 2 ? '#3a0e16' : '#320c12', x, y + 2 + sl * 6, TS, 5); R('#4a141c', x, y + 2, TS, 1); if (wt(i - 1, j) !== 39) R('#12040a', x, y, 2, TS); if (wt(i + 1, j) !== 39) R('#12040a', x + TS - 2, y, 2, TS); return; }
    R('#1a0a0c', x, y, TS, TS); for (var by = 0; by < 3; by++) { R('#12040a', x, y + by * 8, TS, 1); R('#12040a', x + ((by + j) % 2 ? 4 : 16), y + by * 8, 1, 8); R('#2a1014', x + 1, y + by * 8 + 1, TS - 2, 1); } return; }
  if (t === 40) { paintW(39, x, y, i, j); R('#12040a', x + 5, y + 4, 14, 20); R('#3a1a10', x + 6, y + 5, 12, 19); return; }
  ground();
  if (t === 0 || t === 36 || t === 51) return;
  if (t === 1) { var cx = x + 12;
    if (B.pine) { g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(cx, y - 2); g.lineTo(cx + 12, y + 20); g.lineTo(cx - 12, y + 20); g.fill(); g.fillStyle = '#1e1218'; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + 10, y + 19); g.lineTo(cx - 10, y + 19); g.fill(); g.fillStyle = '#2e1c26'; g.beginPath(); g.moveTo(cx - 1, y + 2); g.lineTo(cx - 8, y + 16); g.lineTo(cx - 1, y + 13); g.fill(); R('#3a0a10', cx - 4, y + 8, 2, 2); R('#12040a', cx - 2, y + 19, 4, 5); return; }
    if (B.cream) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(cx, y + 9, 11, 0, 6.3); g.fill(); g.fillStyle = '#3a3220'; g.beginPath(); g.arc(cx, y + 9, 10, 0, 6.3); g.fill(); for (var d2 = -8; d2 <= 8; d2 += 4) R('#5a4a2a', cx + d2, y + 8, 1, 12 - Math.abs(d2) / 2); R('#12040a', cx - 2, y + 17, 4, 7); return; }
    if (B.tar) { R('#12040a', cx - 3, y + 4, 6, 20); R('#e8dcc8', cx - 2, y + 5, 4, 18); R('#12040a', cx - 9, y + 6, 7, 3); R('#e8dcc8', cx - 8, y + 7, 6, 1); R('#12040a', cx + 2, y + 2, 8, 3); R('#e8dcc8', cx + 3, y + 3, 6, 1); R('#c8bca8', cx - 2, y + 12, 4, 1); return; }
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(cx, y + 10, 11.5, 0, 6.3); g.fill(); g.fillStyle = shadeHex(B.t, 0.55); g.beginPath(); g.arc(cx, y + 10, 10.5, 0, 6.3); g.fill();
    g.fillStyle = B.t; g.beginPath(); g.arc(x + 10, y + 8, 7, 0, 6.3); g.fill(); g.fillStyle = shadeHex(B.t, 1.35); g.beginPath(); g.arc(x + 8, y + 6, 3, 0, 6.3); g.fill();
    R('#12040a', x + 10, y + 15, 4, 9); R('#2a1a18', x + 11, y + 16, 2, 8); R('#12040a', x + 6, y + 13, 5, 2); R('#12040a', x + 13, y + 12, 6, 2); return; }
  if (t === 5) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 12, y + 13, 10, 0, 6.3); g.fill(); g.fillStyle = '#1e0a0c'; g.beginPath(); g.arc(x + 12, y + 13, 9, 0, 6.3); g.fill(); g.fillStyle = '#2e1216'; g.beginPath(); g.arc(x + 10, y + 11, 5, 0, 6.3); g.fill();
    R('#0a0204', x + 4, y + 9, 3, 1); R('#0a0204', x + 17, y + 12, 3, 1); R('#0a0204', x + 11, y + 4, 1, 3); R('#ff2630', x + 8, y + 9, 2, 2); R('#ff2630', x + 15, y + 14, 2, 2); R('#c4121c', x + 11, y + 17, 2, 2); R('#ffb0b0', x + 8, y + 9, 1, 1); return; }
  if (t === 2) { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(x + 12, y + 13, 11, 9, 0, 0, 6.3); g.fill(); g.fillStyle = '#5a4e4a'; g.beginPath(); g.ellipse(x + 12, y + 12, 10, 8, 0, 0, 6.3); g.fill(); g.fillStyle = '#7a6e68'; g.beginPath(); g.ellipse(x + 9, y + 9, 4, 3, 0, 0, 6.3); g.fill(); R('#2a2226', x + 6, y + 16, 8, 2); return; }
  if (t === 12) { paintW(6, x, y, i, j); R('#5a4e48', x + 3, y + 6, TS - 6, TS - 6); R('#12040a', x + 7, y + 7, 1, 13); R('#12040a', x + 7, y + 13, 9, 1); R('#12040a', x + 15, y + 9, 1, 6); return; }
  if (t === 7) { paintW(6, x, y, i, j); g.fillStyle = '#000'; g.beginPath(); g.moveTo(x + 2, y + TS); g.lineTo(x + 2, y + 10); g.quadraticCurveTo(x + 12, y - 2, x + 22, y + 10); g.lineTo(x + 22, y + TS); g.fill(); R('#12040a', x + 1, y + 8, 2, 16); R('#12040a', x + 21, y + 8, 2, 16); return; }
  if (t === 8) return;
  if (propTile(t, x, y, B, v)) return;
  if (t === 34) { R('#1a0a0c', x, y, TS, TS); for (var by2 = 0; by2 < 3; by2++) { R('#12040a', x, y + by2 * 8, TS, 1); R('#12040a', x + ((by2 + j) % 2 ? 4 : 16), y + by2 * 8, 1, 8); R('#2a1014', x + 1, y + by2 * 8 + 1, TS - 2, 1); } if (wt(i, j - 1) !== 34) { R('#3a1418', x, y, TS, 4); for (var m = 0; m < TS; m += 8) R('#12040a', x + m + 5, y, 3, 3); R('#c4121c', x, y + 4, TS, 1); } return; }
  if (t === 42) { for (var rd = 0; rd < 5; rd++) { var rx = x + 3 + rd * 4 + (v + rd) % 2, rh = 10 + (rd * 3 + v) % 7; R('#12040a', rx - 1, y + TS - rh - 1, 3, rh + 1); R('#7a6a3a', rx, y + TS - rh, 1, rh); R('#4a2a10', rx - 1, y + TS - rh - 3, 3, 4); } return; }
  if (t === 44) { R('#12040a', x + 9, y + 2, 6, 22); for (var sp2 = 0; sp2 < 6; sp2++) R(sp2 % 2 ? '#c4121c' : '#f1e7d0', x + 10, y + 3 + sp2 * 3, 4, 3); R('#ffe36a', x + 9, y, 6, 3); return; }
  if (t === 46) { var tl = wt(i - 1, j) !== 46, tp = wt(i, j - 1) !== 46; R('#3a2e32', x, y, TS, TS); R('#12040a', tl ? x : x - 1, tp ? y : y - 1, TS + 1, TS + 1); R('#5a4a4e', x + (tl ? 2 : 0), y + (tp ? 2 : 0), TS - 2, TS - 2); R('#d8c898', x + (tl ? 5 : 0), y + (tp ? 5 : 0), TS - (tl ? 5 : 3), TS - (tp ? 5 : 3)); R('#fff6dc', x + (tl ? 7 : 2), y + (tp ? 8 : 3), 5, 1); return; }
  if (t === 48) { R('#12040a', x + 6, y + 1, 12, 22); R('#4a4448', x + 7, y + 2, 10, 20); R('#6a6468', x + 7, y + 2, 2, 20); R('#c4121c', x + 10, y + 8, 4, 1); R('#2a2226', x + 5, y + 21, 14, 3); return; }
  if (t === 50) { g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(x + 12, y); g.lineTo(x + 19, y + 14); g.lineTo(x + 12, y + 23); g.lineTo(x + 5, y + 14); g.fill(); g.fillStyle = '#7a2a9a'; g.beginPath(); g.moveTo(x + 12, y + 2); g.lineTo(x + 17, y + 14); g.lineTo(x + 12, y + 21); g.lineTo(x + 7, y + 14); g.fill(); R('#d080ff', x + 10, y + 6, 2, 8); return; }
  if (t === 52) { [[7, 15, '#c4121c'], [15, 12, '#f1e7d0'], [12, 19, '#c4121c']].forEach(function (c) { R('#12040a', x + c[0] - 4, y + c[1] - 3, 9, 5); R(c[2], x + c[0] - 3, y + c[1] - 2, 7, 3); R('#f1e7d0', x + c[0] - 1, y + c[1] + 1, 2, 4); R('#fff', x + c[0] - 2, y + c[1] - 2, 1, 1); }); return; }
  if (t === 53) { R('#12040a', x + 2, y + 12, 20, 6); R('#6a5440', x + 3, y + 13, 18, 4); R('#8a7058', x + 3, y + 13, 18, 1); R('#12040a', x + 14, y + 7, 3, 7); R('#6a5440', x + 15, y + 8, 1, 5); return; }
  if (t === 55) { g.fillStyle = '#12040a'; g.fillRect(x, y + 3, TS, 20); g.fillStyle = '#1e1214'; g.fillRect(x, y + 4, TS, 18); for (var hb = 0; hb < 4; hb++) { g.fillStyle = '#2e1a1e'; g.beginPath(); g.arc(x + 3 + hb * 6, y + 7, 4, 0, 6.3); g.fill(); } R('#c4121c', x + 6, y + 10, 2, 2); R('#c4121c', x + 16, y + 14, 2, 2); return; }
  if (t === 56) { R('#12040a', x + 2, y + 12, 20, 10); R('#4a2a1a', x + 3, y + 13, 18, 8); for (var fb = 0; fb < 4; fb++) { R('#2a3a1a', x + 4 + fb * 4, y + 9, 2, 4); R(fb % 2 ? '#ff2630' : '#ffe36a', x + 4 + fb * 4, y + 7, 3, 3); } return; }
  if (t === 57) { R('#12040a', x + 1, y + 9, 22, 8); R('#4a2a1a', x + 2, y + 10, 20, 3); R('#3a1a10', x + 2, y + 14, 20, 2); R('#12040a', x + 3, y + 16, 2, 6); R('#12040a', x + 19, y + 16, 2, 6); return; }
  if (t === 58) { R('#12040a', x + 1, y + 2, 22, 21); R('#3a1a10', x + 2, y + 12, 20, 10); for (var aw = 0; aw < 5; aw++) R(aw % 2 ? '#c4121c' : '#f1e7d0', x + 2 + aw * 4, y + 3, 4, 6); R('#12040a', x + 2, y + 9, 20, 1); R('#ffe36a', x + 6, y + 13, 3, 3); R('#f1e0b0', x + 13, y + 13, 4, 3); return; }
}
function propTile(t, x, y, B, v) { var g = KIT.ctx;
  if (t === 10 || t === 32) { R('#12040a', x + 5, y + 7, 4, 4); R('#c4121c', x + 6, y + 7, 3, 3); R('#ff2630', x + 6, y + 7, 1, 1); R('#1a3a1a', x + 7, y + 10, 1, 4); R('#12040a', x + 14, y + 13, 4, 4); R('#8a0a14', x + 15, y + 13, 3, 3); R('#1a3a1a', x + 16, y + 16, 1, 4); if (v > 2) { R('#c4121c', x + 9, y + 17, 3, 3); R('#ff2630', x + 9, y + 17, 1, 1); } return 1; }
  if (t === 13) { R('#12040a', x + 4, y + 3, 16, 19); R('#4a4246', x + 5, y + 4, 14, 17); g.fillStyle = '#4a4246'; g.beginPath(); g.arc(x + 12, y + 7, 7, Math.PI, 0); g.fill(); R('#6a6266', x + 6, y + 4, 3, 14); R('#2a2226', x + 8, y + 9, 8, 1); R('#2a2226', x + 8, y + 12, 8, 1); R('#2a2226', x + 8, y + 15, 5, 1); R('#3a2a1a', x + 3, y + 21, 18, 3); return 1; }
  if (t === 31) { R('#12040a', x + 9, y + 2, 7, 21); R('#12040a', x + 4, y + 6, 17, 6); R('#5a5258', x + 10, y + 3, 5, 19); R('#5a5258', x + 5, y + 7, 15, 4); R('#7a7278', x + 10, y + 3, 1, 19); R('#3a2a1a', x + 6, y + 21, 13, 3); return 1; }
  if (t === 14) { R('#12040a', x + 10, y + 4, 4, 20); R('#2a2228', x + 11, y + 5, 2, 18); R('#12040a', x + 6, y + 0, 12, 7); R('#ffd27a', x + 7, y + 1, 10, 5); R('#fff6dc', x + 9, y + 2, 4, 2); R('#12040a', x + 8, y + 22, 8, 2); return 1; }
  if (t === 15) { R('#e8dcc8', x + 5, y + 12, 10, 2); R('#e8dcc8', x + 4, y + 11, 2, 4); R('#e8dcc8', x + 14, y + 11, 2, 4); R('#c8bca8', x + 12, y + 17, 8, 2); R('#e8dcc8', x + 7, y + 5, 6, 5); R('#12040a', x + 8, y + 7, 1, 1); R('#12040a', x + 11, y + 7, 1, 1); return 1; }
  if (t === 16) { [[6, 14], [12, 11], [17, 15]].forEach(function (c) { R('#12040a', x + c[0] - 1, y + c[1] - 1, 4, 9); R('#f1e7d0', x + c[0], y + c[1], 2, 7); R('#ffb040', x + c[0], y + c[1] - 3, 2, 3); R('#fff6dc', x + c[0], y + c[1] - 2, 1, 1); }); R('#c4121c', x + 4, y + 20, 16, 2); return 1; }
  if (t === 17) { R('#12040a', x, y + 8, TS, 3); R('#12040a', x, y + 17, TS, 3); for (var f = 2; f < TS; f += 6) { R('#12040a', x + f, y + 2, 3, 21); R('#3a3438', x + f + 1, y + 4, 1, 18); R('#12040a', x + f, y, 3, 3); } return 1; }
  if (t === 19) { [[6, 14], [14, 14], [10, 8]].forEach(function (c) { R('#12040a', x + c[0] - 4, y + c[1] - 4, 9, 9); R('#e8dcc8', x + c[0] - 3, y + c[1] - 3, 7, 6); R('#12040a', x + c[0] - 2, y + c[1] - 1, 2, 2); R('#12040a', x + c[0] + 1, y + c[1] - 1, 2, 2); R('#c8bca8', x + c[0] - 2, y + c[1] + 3, 5, 2); }); return 1; }
  if (t === 33) { g.fillStyle = B.cream ? '#d8c898' : B.tar ? '#120606' : B.goo ? '#5a1a6a' : '#6a0a10'; g.beginPath(); g.ellipse(x + 12, y + 13, 9, 5, 0, 0, 6.3); g.fill(); R(B.cream ? '#fff6dc' : B.goo ? '#c070ff' : '#c4121c', x + 8, y + 11, 4, 1); return 1; }
  if (t === 35) { R('#12040a', x + 10, y + 8, 4, 16); R('#4a2a1a', x + 11, y + 9, 2, 14); R('#12040a', x + 2, y + 2, 20, 10); R('#6a3a1e', x + 3, y + 3, 18, 8); R('#8a5a2e', x + 3, y + 3, 18, 1); R('#2a1208', x + 6, y + 6, 12, 1); R('#2a1208', x + 6, y + 8, 8, 1); return 1; }
  return 0; }
/* dungeon and inside tiles */
function paintRoomTile(t, x, y, i, j) {
  var g = KIT.ctx, v = (i * 7 + j * 13) % 5, h = hash2(i, j, 41);
  if (SCR.kind === 'dg') { var D = DG.D, fl = D.floor, wl = D.wall;
    if (t === 21) { R(shadeHex(wl, 0.6), x, y, TS, TS); R(wl, x + 1, y + 1, TS - 2, TS - 2); R(shadeHex(wl, 1.25), x + 1, y + 1, TS - 2, 2); R(shadeHex(wl, 0.75), x + 1, y + TS / 2, TS - 2, 1); return; }
    R(fl, x, y, TS, TS); R(shadeHex(fl, 0.85), x, y, TS, 1); R(shadeHex(fl, 0.85), x, y, 1, TS); if (v === 0) R(shadeHex(fl, 1.15), x + 6, y + 8, 4, 2);
    if (t === 20) { var hh = (i * 31 + j * 17) % 23; if (hh === 0) { R('#4a0608', x + 6, y + 9, 9, 5); R('#6a0a10', x + 8, y + 10, 5, 3); } else if (hh === 5) { R('#e8dcc8', x + 7, y + 12, 6, 5); R('#12040a', x + 8, y + 13, 1, 1); R('#12040a', x + 11, y + 13, 1, 1); } }
    else if (t === 22) { R('#12040a', x + 1, y + 1, TS - 2, TS - 2); R(shadeHex(wl, 1.1), x + 2, y + 2, TS - 4, TS - 4); R(shadeHex(wl, 1.4), x + 2, y + 2, TS - 4, 2); R(shadeHex(wl, 0.7), x + 2, y + TS - 5, TS - 4, 3); }
    else if (t === 23) { R('#000', x, y, TS, TS); R('#12040a', x, y, TS, 3); }
    else if (t === 29) { R('#c8b880', x, y, TS, TS); }
    else if (t >= 24 && t <= 28) { R('#12040a', x, y, TS, TS); if (t === 25) { R('#6e3a1e', x + 2, y + 2, TS - 4, TS - 4); R('#ffe36a', x + 9, y + 9, 6, 6); } if (t === 26) { R('#6a0a10', x + 2, y + 2, TS - 4, TS - 4); R('#f1e7d0', x + 8, y + 6, 8, 8); R('#12040a', x + 9, y + 9, 2, 2); R('#12040a', x + 13, y + 9, 2, 2); } if (t === 27) { for (var b = 0; b < 4; b++) R('#7a7a80', x + 3 + b * 5, y, 2, TS); } if (t === 28) { for (var s = 0; s < 4; s++) R(shadeHex(fl, 1 - s * 0.15), x, y + s * 6, TS, 6); } }
    else if (t === 13 || t === 31 || t === 16) propTile(t, x, y, BIOME.moors, v);
    return; }
  var Wc = WALLS[SCR.style] || ['#1a1012', '#3a1a1c'], cave = t === 68 || t === 69;
  function floor() { if (SCR.style === 'cave' || cave) { R('#221a18', x, y, TS, TS); R('#2e2422', x + 3 + v * 4, y + 6, 4, 2); R('#18100e', x + 14 - v, y + 15, 5, 2); return; } R('#3a2214', x, y, TS, TS); for (var pl = 0; pl < 3; pl++) { R('#2a180c', x, y + pl * 8, TS, 1); R('#4a2c1a', x, y + pl * 8 + 1, TS, 1); R('#2a180c', x + ((pl + i) % 3) * 8 + 3, y + pl * 8, 1, 8); } }
  if (t === 61) { var topRow = j <= 1 && i > 0 && i < COLS - 1; R(Wc[0], x, y, TS, TS); if (topRow) { if (j === 0) { R(Wc[1], x, y + 2, TS, 20); R(shadeHex(Wc[1], 1.25), x, y + 2, TS, 1); for (var wp = 0; wp < TS; wp += 8) R(shadeHex(Wc[1], 0.75), x + wp + (i % 2) * 4, y + 8, 2, 2); R('#12040a', x, y + 22, TS, 2); } else { R(shadeHex(Wc[0], 0.8), x, y, TS, 14); R('#4a2c1a', x, y + 14, TS, 3); R('#2a180c', x, y + 17, TS, 7); for (var wb = 0; wb < TS; wb += 6) R('#3a2214', x + wb, y + 18, 1, 6); } } else { R('#12040a', x, y, TS, TS); R(shadeHex(Wc[0], 0.6), x + 2, y + 2, TS - 4, TS - 4); } return; }
  if (t === 69) { R('#12040a', x, y, TS, TS); R('#2a201c', x + 1, y + 1, TS - 2, TS - 2); R('#3a2e28', x + 2 + v * 3, y + 3, 7, 4); R('#1a1210', x + 10, y + 14 - v, 9, 3); if (tAt(i, j + 1) === 68) { R('#1a1210', x, y + 18, TS, 6); R('#4a3a32', x, y + 17, TS, 1); } return; }
  floor(); if (t === 60 || t === 68) return;
  if (t === 70) { R('#12040a', x, y, TS, TS); R('#4a1a1c', x + 2, y + 4, TS - 4, TS - 4); R('#c4121c', x + 4, y + 6, TS - 8, 2); return; }
  if (t === 62) { R('#12040a', x, y + 2, TS, 22); R('#5a3218', x, y + 3, TS, 8); R('#7a4a26', x, y + 3, TS, 2); R('#3a1e0e', x, y + 11, TS, 12); for (var cp = 0; cp < TS; cp += 8) R('#2a140a', x + cp, y + 12, 1, 11); return; }
  if (t === 63) { var rl = tAt(i - 1, j) !== 63, rr = tAt(i + 1, j) !== 63, ru = tAt(i, j - 1) !== 63, rdn = tAt(i, j + 1) !== 63; R('#7a1420', x, y, TS, TS); if ((i + j) % 2) R('#6a1018', x + 6, y + 6, 12, 12); R('#3a0610', x + 10, y + 10, 4, 4); if (rl) { R('#3a0610', x, y, 2, TS); R('#ffe36a', x + 3, y, 1, TS); } if (rr) { R('#3a0610', x + TS - 2, y, 2, TS); R('#ffe36a', x + TS - 4, y, 1, TS); } if (ru) { R('#3a0610', x, y, TS, 2); R('#ffe36a', x, y + 3, TS, 1); } if (rdn) { R('#3a0610', x, y + TS - 2, TS, 2); R('#ffe36a', x, y + TS - 4, TS, 1); } return; }
  if (t === 64) { R('#12040a', x + 1, y + 4, 22, 14); R('#6a3a1a', x + 2, y + 5, 20, 8); R('#8a5226', x + 2, y + 5, 20, 1); R('#3a1e0e', x + 2, y + 13, 20, 4); R('#12040a', x + 3, y + 17, 3, 6); R('#12040a', x + 18, y + 17, 3, 6); if (h < 0.5) { R('#f1e0b0', x + 6, y + 6, 4, 3); R('#c4121c', x + 14, y + 7, 3, 3); } return; }
  if (t === 65) { R('#12040a', x, y, TS, TS); R('#3a2414', x + 1, y + 1, TS - 2, TS - 2); for (var sh = 0; sh < 3; sh++) { R('#5a3a1e', x + 1, y + 7 + sh * 7, TS - 2, 1); for (var bo = 0; bo < 4; bo++) R(['#c4121c', '#f1e0b0', '#4adfff', '#ffe36a', '#6a8a3a'][(i + sh + bo) % 5], x + 3 + bo * 5, y + 2 + sh * 7, 3, 5); } return; }
  if (t === 66) { R('#12040a', x + 3, y + 3, 18, 20); R('#6a3a1a', x + 4, y + 4, 16, 18); R('#3a3438', x + 4, y + 8, 16, 2); R('#3a3438', x + 4, y + 16, 16, 2); R('#8a5226', x + 5, y + 4, 2, 18); return; }
  if (t === 67) { var head = tAt(i, j - 1) !== 67; R('#12040a', x + 2, y, 20, TS); R('#4a2a1a', x + 3, y + (head ? 1 : 0), 18, TS); if (head) { R('#f1e7d0', x + 5, y + 3, 14, 7); } else { R('#7a0a14', x + 4, y, 16, TS - 3); R('#a8141e', x + 4, y, 16, 2); } return; }
  if (t === 71) { R('#12040a', x, y, TS, TS); R('#3a2a2a', x + 1, y + 1, TS - 2, TS - 2); R('#12040a', x + 4, y + 8, 16, 16); var fl2 = Math.sin(i * 3) * 2; R('#ff7a2a', x + 6, y + 13 + fl2, 12, 9); R('#ffe36a', x + 9, y + 16, 6, 6); return; }
  if (t === 72) { R('#12040a', x + 7, y + 8, 10, 6); R('#6a3a1a', x + 8, y + 9, 8, 3); R('#12040a', x + 8, y + 13, 2, 7); R('#12040a', x + 14, y + 13, 2, 7); return; }
  if (t === 73) { var st2 = SCR.style; R('#12040a', x + 2, y, 20, TS); if (st2 === 'arcade') { R('#2a1448', x + 3, y + 1, 18, 22); R('#0a0a12', x + 5, y + 3, 14, 9); R(['#ff2630', '#4adfff', '#ffe36a'][i % 3], x + 6, y + 5, 12, 5); R('#c4121c', x + 6, y + 15, 3, 3); R('#ffe36a', x + 12, y + 15, 2, 2); R('#4adfff', x + 15, y + 15, 2, 2); }
    else if (st2 === 'pulsar') { R('#14141a', x + 3, y + 1, 18, 22); R('#000', x + 7, y + 4, 10, 6); R('#000', x + 6, y + 12, 12, 9); R('#3a3a48', x + 10, y + 15, 4, 3); }
    else if (st2 === 'cafe') { R('#6a6a72', x + 3, y + 2, 18, 20); R('#3a3a42', x + 5, y + 4, 14, 6); R('#12040a', x + 9, y + 12, 6, 4); R('#f1e0b0', x + 9, y + 18, 6, 3); }
    else { R('#4a2a1a', x + 3, y + 1, 18, 22); R('#c4121c', x + 5, y + 3, 14, 6); R('#ffe36a', x + 7, y + 5, 10, 2); R('#2a180c', x + 5, y + 12, 14, 9); } return; }
  if (t === 74) { R('#12040a', x + 6, y + 13, 12, 10); R('#6a3a1a', x + 7, y + 14, 10, 8); g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 12, y + 9, 8, 0, 6.3); g.fill(); g.fillStyle = '#2a3a1a'; g.beginPath(); g.arc(x + 12, y + 9, 7, 0, 6.3); g.fill(); R('#c4121c', x + 9, y + 6, 2, 2); return; }
  if (t === 54) { R('#1a3a5a', x, y, TS, TS); R('#4a7aaa', x + 3 + v * 3, y + 7, 6, 1); R('#4a7aaa', x + 12, y + 16, 5, 1); if (SCR.style === 'sanct') { R('#2a8a8a', x, y, TS, TS); R('#8affff', x + 3 + v * 3, y + 7, 6, 1); } return; }
  if (t === 13 || t === 31 || t === 16) { propTile(t, x, y, BIOME.moors, v); return; }
}
function roomLayer() { var key = SCR.kind === 'dg' ? 'lc-d' + DG.di + ':' + SCR.r.id + ':' + SCR.T.join('') : 'lc-in:' + SCR.id + ':' + SCR.T.join('');
  return KIT.layer(key, COLS * TS, ROWS * TS, function () { for (var j = 0; j < ROWS; j++) for (var i = 0; i < COLS; i++) paintRoomTile(SCR.T[j * COLS + i], i * TS, j * TS, i, j); }, { px: 1 }); }
function drawScreen(S, ox, oy) { var keep = SCR; SCR = S; KIT.blit(roomLayer(), ox, oy); if (S.kind === 'dg') for (var q = 0; q < S.T.length; q++) if (S.T[q] === 29) { var x = ox + (q % COLS) * TS, y = oy + ((q / COLS) | 0) * TS; R('#c8b880', x, y, TS, TS); R('#fff6dc', x + (KIT.t * 8 + q * 5) % TS, y + 6, 6, 1); } SCR = keep; }
/* ---------- the frame ---------- */
function draw() {
  R('#070405', 0, 0, KIT.W, H); var ox = Math.round((KIT.W - COLS * TS) / 2);
  if (!SCR || !P) { var g0 = KIT.ctx; g0.fillStyle = '#12040a'; g0.fillRect(0, 0, KIT.W, H); g0.fillStyle = '#c4121c'; g0.beginPath(); g0.arc(KIT.W / 2, 90, 40, 0, 6.3); g0.fill(); return; }
  if (TRANS) { TRANS.t += 1 / 60 * 3; var k = Math.min(1, TRANS.t), dx = TRANS.dx * COLS * TS, dy = TRANS.dy * ROWS * TS; drawScreen(TRANS.from, ox - dx * k, OY - dy * k); drawScreen(SCR, ox + dx * (1 - k), OY + dy * (1 - k)); if (k >= 1) TRANS = null; hud(ox); return; }
  var g = KIT.ctx; g.save(); g.beginPath(); g.rect(ox, OY, COLS * TS, ROWS * TS); g.clip();
  if (SCR.kind === 'world') { var c0 = Math.floor(CAM.x / (CHW * TS)), c1 = Math.floor((CAM.x + COLS * TS - 1) / (CHW * TS)), r0 = Math.floor(CAM.y / (CHH * TS)), r1 = Math.floor((CAM.y + ROWS * TS - 1) / (CHH * TS));
    for (var cj = r0; cj <= r1; cj++) for (var ci = c0; ci <= c1; ci++) KIT.blit(chunkLayer(ci, cj), ox + ci * CHW * TS - Math.round(CAM.x), OY + cj * CHH * TS - Math.round(CAM.y));
    waterShimmer(ox); }
  else drawScreen(SCR, ox, OY);
  g.translate(ox - Math.round(CAM.x), OY - Math.round(CAM.y));
  // everything standing up, sorted by its feet
  var list = [];
  if (SCR.kind === 'world') { var vx0 = CAM.x - 160, vx1 = CAM.x + COLS * TS + 160, vy0 = CAM.y - 40, vy1 = CAM.y + ROWS * TS + 200;
    STRUCTS.forEach(function (S) { var bx = S.i * TS, by = (S.j + S.h) * TS; if (bx + S.w * TS < vx0 || bx > vx1 || by < vy0 || by - 300 > vy1) return; list.push({ y: by - 2, f: function () { drawStruct(S); } }); });
    WITEMS.forEach(function (it) { if (SV.got['wp:' + it.id]) return; var x = (it.i + 0.5) * TS, y = (it.j + 0.5) * TS; list.push({ y: y, f: function () { drawPiece(x, y); } }); }); }
  (SCR.npcs || []).forEach(function (n) { list.push({ y: n.y, f: function () { drawNpc(n); } }); });
  if (SCR.kind === 'in') { (SCR.wares || []).forEach(function (w) { list.push({ y: w.y + 1, f: function () { drawWare(w); } }); }); if (SCR.chest) { var c = SCR.chest; list.push({ y: c.y + 10, f: function () { KIT.spr(SV.got['ch:' + c.id] ? 'p_bigchestopen' : 'p_bigchest', c.x, c.y + 10); } }); } if (INSIDE_EXTRA[SCR.id]) list.push({ y: 0, f: INSIDE_EXTRA[SCR.id] }); }
  PICK.forEach(function (k) { list.push({ y: k.y, f: function () { drawPick(k); } }); });
  FOE.forEach(function (f) { if (f.hp <= 0) return; list.push({ y: f.y + 10, f: function () { var n = f.d.s + (Math.floor(G.t * 6 + f.x) % (f.d.nf || 4)); shadow(f.x, f.y + 9, 8); KIT.spr(n, f.x, f.y + 10, { flip: P.x > f.x, flash: f.hurt > 0, alpha: f.stun > 0 ? 0.7 : 1, sc: 0.85 }); if (f.stun > 0) R('#ffe36a', f.x - 1, f.y - 22 + Math.sin(G.t * 10) * 2, 2, 2); } }); });
  if (BOSS) { var b = BOSS; list.push({ y: b.y + 24, f: function () { var bn = b.B.s + (Math.floor(G.t * 3) % 2); shadow(b.x, b.y + 22, 20); KIT.spr(bn, b.x, b.y + 24, { sc: b.B.sc, flip: P.x > b.x && !KIT.has(bn + 'L'), flash: b.hurt > 0 || (b.st !== 'idle' && b.t < 0.4 && Math.floor(G.t * 12) % 2 === 0) }); b.marks.forEach(function (m) { if (!m.done) { g.fillStyle = 'rgba(255,38,48,' + (0.3 + Math.sin(G.t * 20) * 0.2) + ')'; g.beginPath(); g.ellipse(m.x, m.y, 16, 8, 0, 0, 6.3); g.fill(); } }); } }); }
  list.push({ y: P.y + 12, f: drawPlayer });
  list.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { e.f(); });
  SHOT.forEach(function (s) { if (s.bread) KIT.spr('it_bread', s.x, s.y, { anchor: 'c', rot: G.t * 20 }); else if (s.foe) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(s.x, s.y, 5, 0, 6.3); g.fill(); g.fillStyle = '#c04aff'; g.beginPath(); g.arc(s.x, s.y, 4, 0, 6.3); g.fill(); } else { R('#12040a', s.x - 4, s.y - 4, 8, 8); R('#f1e0b0', s.x - 3, s.y - 3, 6, 6); } });
  FX.forEach(function (f) { if (f.k === 'bomb') { if (!f.boom) KIT.spr(Math.floor(G.t * 8) % 2 ? 'gr_bombl' : 'gr_bomb', f.x, f.y, { anchor: 'c' }); return; } if (f.k === 'spear') { g.fillStyle = '#e8dcc8'; g.beginPath(); g.moveTo(f.x - 6, f.y); g.lineTo(f.x, f.y - 30); g.lineTo(f.x + 6, f.y); g.fill(); f.t -= 1 / 60; return; } f.t -= 1 / 60; f.x += f.vx / 60; f.y += f.vy / 60; R(f.col, f.x, f.y, 2, 2); });
  FX = FX.filter(function (f) { return f.k === 'bomb' ? !f.boom || f.t > -0.2 : f.t > 0; });
  g.restore();
  drawNight(ox);
  if (FADE) { var a = FADE.t < 0.22 ? FADE.t / 0.22 : Math.max(0, 1 - (FADE.t - 0.22) / 0.22); R('rgba(7,4,5,' + Math.min(1, a) + ')', ox, OY, COLS * TS, ROWS * TS); }
  hud(ox);
}
function shadow(x, y, r) { var g = KIT.ctx; g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, y, r, r * 0.4, 0, 0, 6.3); g.fill(); }
function drawPlayer() { var p = P, d = p.dir === 'l' || p.dir === 'r' ? 's' : p.dir, fr = 'chb_' + d + (p.moving ? Math.floor(p.anim) % 4 : 0), flip = p.dir === 'l';
  shadow(p.x, p.y + 11, 8); if (p.hover > 0) KIT.spr('steve0', p.x, p.y - 18, { sc: 0.35, alpha: 0.9 });
  var blink = (p.inv > 0 && Math.floor(G.t * 20) % 2) || (G.pillInv > 0 && Math.floor(G.t * 10) % 2);
  if (!blink) KIT.spr(fr, p.x, p.y + 12 - (p.hover > 0 ? 6 : 0), { flip: flip });
  if (SV.items.condom && !blink) { var g = KIT.ctx; g.strokeStyle = 'rgba(241,224,176,0.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(p.x, p.y - 4, 11, 17, 0, 0, 6.3); g.stroke(); }
  if (p.atk > 0) { var v = DIRV[p.dir], k2 = 1 - p.atk / 0.24, gg = KIT.ctx; gg.save(); gg.translate(p.x + v[0] * 8, p.y + v[1] * 8); gg.rotate(Math.atan2(v[1], v[0]) + (k2 - 0.5) * 1.8); gg.fillStyle = '#12040a'; gg.fillRect(2, -4, 21, 8); gg.fillStyle = SV.items.sharp ? '#c4121c' : '#a8442a'; gg.fillRect(3, -3, 19, 6); gg.fillStyle = '#e8a080'; gg.fillRect(3, -3, 19, 1); gg.restore(); } }
function drawNpc(n) { shadow(n.x, n.y + 1, 9); KIT.spr(n.spr, n.x, n.y + 2, { sc: n.sc || 0.8, flip: !!n.face }); }
function drawPiece(x, y) { var g = KIT.ctx, b = Math.sin(G.t * 3) * 2; shadow(x, y + 8, 6); g.fillStyle = 'rgba(255,227,106,' + (0.25 + Math.sin(G.t * 5) * 0.1) + ')'; g.beginPath(); g.arc(x, y - 2 + b, 11, 0, 6.3); g.fill(); KIT.spr('gr_heart', x, y + b, { anchor: 'c', sc: 1.3 }); R('#ffe36a', x - 1, y - 9 + b, 2, 2); }
function drawPick(k) { var x = k.x, y = k.y + Math.sin(G.t * 4 + x) * 1.5; if (k.t !== undefined && k.t < 2 && Math.floor(G.t * 10) % 2) return;
  if (k.k === 'drop') KIT.spr('lc_drop', x, y, { anchor: 'c', sc: k.n > 1 ? 1.5 : 1 }); else if (k.k === 'heart' || k.k === 'heartc') KIT.spr('gr_heart', x, y, { anchor: 'c', sc: k.k === 'heartc' ? 2 : 1 }); else if (k.k === 'key') KIT.spr('gr_key', x, y, { anchor: 'c' }); else if (k.k === 'bomb') KIT.spr('gr_bomb', x, y, { anchor: 'c' });
  else if (k.k === 'chest') KIT.spr('p_bigchest', x, y + 10); else if (k.k === 'chal') chalice(x, y, CHALCOL[DG ? DG.di : 0]); }
function chalice(x, y, col) { var gg = KIT.ctx; gg.fillStyle = '#12040a'; gg.fillRect(x - 9, y - 11, 18, 4); gg.fillStyle = '#ffe36a'; gg.beginPath(); gg.moveTo(x - 8, y - 10); gg.lineTo(x + 8, y - 10); gg.lineTo(x + 4, y); gg.lineTo(x + 2, y + 6); gg.lineTo(x + 6, y + 10); gg.lineTo(x - 6, y + 10); gg.lineTo(x - 2, y + 6); gg.lineTo(x - 4, y); gg.fill(); R(col || '#f1e0b0', x - 6, y - 9, 12, 3); }
/* the things for sale, laid on the counter with their price */
function drawWare(w) { var x = w.x, y = w.y, ok = w.ok(); KIT.ctx.globalAlpha = ok ? 1 : 0.35; drawIcon(w.icon, x, y - 4); KIT.ctx.globalAlpha = 1; if (w.price) { KIT.text('' + w.price, x, y + 8, { align: 'center', size: 6, col: ok ? '#ffe36a' : '#6a5a4a', outline: 1 }); }
  if (Math.abs(P.x - x) < 16 && P.y > y && P.y - y < 48 && P.dir === 'u' && !MSGBOX) { KIT.text(w.name.toUpperCase(), x, y - 22, { align: 'center', size: 6, col: '#f1e7d0', outline: 1 }); } }
function drawIcon(k, x, y) { var g = KIT.ctx;
  var spr = { bombs: 'gr_bomb', heart: 'gr_heart', pie: 'it_pie', slice: 'it_pie', piece: 'gr_heart' }[k]; if (spr && KIT.has(spr)) { KIT.spr(spr, x, y, { anchor: 'c', sc: k === 'slice' ? 0.8 : 1 }); if (k === 'piece') R('#ffe36a', x - 1, y - 8, 2, 2); return; }
  function o(c, a, b, w, h) { R('#12040a', x + a - 1, y + b - 1, w + 2, h + 2); R(c, x + a, y + b, w, h); }
  if (k === 'chilli') { o('#c4121c', -6, -2, 12, 5); R('#ff7a6a', x - 5, y - 2, 9, 1); R('#2a5a1a', x + 5, y - 4, 3, 3); }
  else if (k === 'condom') { o('#f1e0b0', -4, -7, 8, 12); R('#fffbe8', x - 3, y - 6, 2, 9); R('#d8c898', x - 4, y + 5, 8, 2); }
  else if (k === 'pill') { o('#ff7ab8', -6, -3, 6, 6); o('#ffe36a', 0, -3, 6, 6); }
  else if (k === 'pint' || k === 'cuppa' || k === 'tea') { o(k === 'pint' ? '#c8a040' : '#f1e0b0', -4, -5, 8, 10); R(k === 'pint' ? '#fff6dc' : k === 'tea' ? '#8a5a2a' : '#6a3a1a', x - 3, y - 4, 6, 2); R('#12040a', x + 4, y - 2, 3, 5); }
  else if (k === 'pizza') { g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(x - 8, y - 6); g.lineTo(x + 8, y - 6); g.lineTo(x, y + 7); g.fill(); g.fillStyle = '#e8b040'; g.beginPath(); g.moveTo(x - 6, y - 5); g.lineTo(x + 6, y - 5); g.lineTo(x, y + 5); g.fill(); R('#ffe36a', x - 2, y - 3, 2, 2); R('#c4121c', x + 1, y - 2, 2, 2); }
  else if (k === 'bottle') { o('#8ab8c8', -3, -6, 6, 11); R('#12040a', x - 2, y - 8, 4, 2); R('#cfefff', x - 2, y - 5, 1, 7); }
  else if (k === 'slot') { o('#2a1448', -7, -8, 14, 14); R('#ffe36a', x - 5, y - 5, 3, 4); R('#ff2630', x - 1, y - 5, 3, 4); R('#4adfff', x + 3, y - 5, 2, 4); }
  else if (k === 'stew') { o('#3a3438', -7, -1, 14, 6); R('#d8a060', x - 6, y - 2, 12, 2); }
  else if (k === 'sharp') { o('#a8442a', -9, -2, 18, 4); R('#c4121c', x - 8, y - 1, 16, 1); R('#f1e7d0', x + 8, y - 3, 2, 6); }
  else o('#ffe36a', -4, -4, 8, 8); }
/* moving highlights on the water in view, so the sea and the lakes don't sit dead still */
function waterShimmer(ox) { var i0 = Math.floor(CAM.x / TS), j0 = Math.floor(CAM.y / TS); for (var j = j0; j <= j0 + ROWS; j++) for (var i = i0; i <= i0 + COLS; i++) { if (wt(i, j) !== 3) continue; var q = widx(i, j), B = BIOME[BKEYS[WB[q]]], hi = SEA[q] ? '#6a1a24' : B.cream ? '#fffbe8' : B.goo ? '#d080ff' : B.tar ? '#4a3030' : '#ff3a44', ph = (G.t * 0.7 + hash2(i, j, 5) * 6) % 6;
  if (ph < 1.5) R(hi, ox + i * TS - Math.round(CAM.x) + ((hash2(i, j, 6) * 14) | 0), OY + j * TS - Math.round(CAM.y) + 6 + ((hash2(i, j, 7) * 12) | 0), 4 + (ph * 2 | 0), 1); } }
/* night: the land is lit by its lamps, candles, windows and crystals; ash drifts; Cumhead carries a little glow */
var ASH = []; for (var q0 = 0; q0 < 40; q0++) ASH.push({ x: Math.random() * 480, y: Math.random() * 240, s: 6 + Math.random() * 14, w: Math.random() * 6 });
var NIGHT = null;
function sceneLights() { var L = []; if (SCR.kind === 'world') { var i0 = Math.floor(CAM.x / TS) - 4, j0 = Math.floor(CAM.y / TS) - 4;
    for (var j = j0; j <= j0 + ROWS + 8; j++) for (var i = i0; i <= i0 + COLS + 8; i++) { var t = wt(i, j), x = (i + 0.5) * TS - CAM.x, y = (j + 0.5) * TS - CAM.y; if (t === 14) L.push({ x: x, y: y - 10, r: 72, c: 'rgba(255,170,90,' }); else if (t === 16) L.push({ x: x, y: y, r: 42, c: 'rgba(255,120,60,' }); else if (t === 50) L.push({ x: x, y: y, r: 34, c: 'rgba(200,90,255,' }); else if (t === 46 && wt(i - 1, j) !== 46 && wt(i, j - 1) !== 46) L.push({ x: x + 12, y: y + 12, r: 60, c: 'rgba(255,240,200,' }); else if (t === 7 || t === 40 || t === 8) L.push({ x: x, y: y + 6, r: 40, c: t === 8 ? 'rgba(255,38,48,' : 'rgba(255,190,110,' }); }
    STRUCTS.forEach(function (S) { var x = (S.i + S.w / 2) * TS - CAM.x, y = (S.j + S.h / 2) * TS - CAM.y; if (x < -150 || x > 630 || y < -150 || y > 400) return; if (S.k === 'factory') L.push({ x: x, y: y, r: 110, c: 'rgba(255,90,30,' }); else if (S.k === 'lair') L.push({ x: x, y: y - 40, r: 120, c: 'rgba(200,40,255,' }); else if (S.k === 'funhouse' || S.k === 'carousel' || S.k === 'ferris') L.push({ x: x, y: y - 20, r: 110, c: 'rgba(255,60,80,' }); else if (S.k === 'shop') L.push({ x: x, y: y + 20, r: 70, c: 'rgba(255,190,110,' }); }); }
  else { (SCR.lights || []).forEach(function (l) { L.push({ x: l.x - CAM.x, y: l.y - CAM.y, r: l.r, c: l.c || 'rgba(255,170,90,', torch: l.torch }); }); }
  return L; }
function drawNight(ox) {
  if (!SCR || !P) return; var g = KIT.ctx, Wd = COLS * TS, Hd = ROWS * TS, L = sceneLights();
  var dark = SCR.kind === 'dg' ? 0.5 : SCR.kind === 'in' ? (SCR.dark || 0.08) : (G.region === 'city' ? 0.14 : G.region === 'wastes' ? 0.34 : G.region === 'wood' ? 0.36 : 0.24);
  if (!NIGHT) { NIGHT = document.createElement('canvas'); NIGHT.width = Wd; NIGHT.height = Hd; }
  var n = NIGHT.getContext('2d'); n.globalCompositeOperation = 'source-over'; n.clearRect(0, 0, Wd, Hd); n.fillStyle = 'rgba(10,0,8,' + dark + ')'; n.fillRect(0, 0, Wd, Hd);
  n.globalCompositeOperation = 'destination-out'; function hole(x, y, r) { var gr = n.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); n.fillStyle = gr; n.beginPath(); n.arc(x, y, r, 0, 6.3); n.fill(); }
  hole(P.x - CAM.x, P.y - CAM.y, 100); L.forEach(function (l) { hole(l.x, l.y, l.r * (0.95 + Math.sin(G.t * 9 + l.x) * 0.04)); });
  g.drawImage(NIGHT, ox, OY);
  g.save(); g.beginPath(); g.rect(ox, OY, Wd, Hd); g.clip(); g.globalCompositeOperation = 'lighter'; L.forEach(function (l) { var gr = g.createRadialGradient(ox + l.x, OY + l.y, 0, ox + l.x, OY + l.y, l.r * 0.7); gr.addColorStop(0, l.c + '0.2)'); gr.addColorStop(1, l.c + '0)'); g.fillStyle = gr; g.fillRect(ox + l.x - l.r, OY + l.y - l.r, l.r * 2, l.r * 2); }); g.restore();
  if (SCR.kind === 'dg') L.forEach(function (l) { if (!l.torch) return; var fx = ox + l.x, fy = OY + l.y; R('#12040a', fx - 2, fy - 2, 5, 9); R('#5a3a1e', fx - 1, fy - 1, 3, 7); var fl = Math.sin(G.t * 14 + l.x) * 1.5; R('#ff7a2a', fx - 2, fy - 8 + fl, 5, 6); R('#ffe36a', fx - 1, fy - 6 + fl, 3, 3); });
  if (SCR.kind === 'world') { g.fillStyle = G.region === 'wastes' ? 'rgba(200,120,255,0.5)' : 'rgba(200,120,110,0.5)'; ASH.forEach(function (a) { a.y += a.s / 60; a.x += Math.sin(G.t + a.w) * 0.3 - 0.2; if (a.y > Hd) { a.y = -4; a.x = Math.random() * Wd; } if (a.x < 0) a.x += Wd; g.fillRect(ox + (a.x | 0), OY + (a.y | 0), 1, 1); }); }
  var vg = g.createRadialGradient(ox + Wd / 2, OY + Hd / 2, Hd * 0.45, ox + Wd / 2, OY + Hd / 2, Wd * 0.62); vg.addColorStop(0, 'rgba(60,0,8,0)'); vg.addColorStop(1, 'rgba(60,0,8,0.3)'); g.fillStyle = vg; g.fillRect(ox, OY, Wd, Hd);
}
function hud(ox) {
  R('#0e0708', 0, 0, KIT.W, OY); R('#4a1a1c', 0, OY - 1, KIT.W, 1);
  for (var i = 0; i < SV.hearts; i++) { var full = P.hp >= (i + 1) * 2, half = P.hp === i * 2 + 1; KIT.spr(full ? 'gr_heart' : half ? 'gr_hearth' : 'gr_hearte', ox + 8 + (i % 10) * 13, 4 + Math.floor(i / 10) * 12, { anchor: 'tl' }); }
  var hx = ox + Math.max(140, 8 + Math.min(10, SV.hearts) * 13 + 6);
  KIT.spr('lc_drop', hx, 8, { anchor: 'tl' }); KIT.text('' + SV.drops, hx + 14, 10, { size: 8, col: '#ffe36a' });
  if (SV.items.bombs) { KIT.spr('gr_bomb', hx + 50, 8, { anchor: 'tl' }); KIT.text('' + SV.bombs, hx + 64, 10, { size: 8 }); }
  if (DG) { KIT.spr('gr_key', hx + 88, 8, { anchor: 'tl' }); KIT.text('' + (SV.dg[DG.di].keys || 0) + (SV.dg[DG.di].bk ? ' B' : ''), hx + 102, 10, { size: 8 }); }
  KIT.panel(ox + 300, 2, 30, 26); KIT.text('B', ox + 303, 4, { size: 6, col: '#a6968f' }); if (SV.sel === 'bottle') drawIcon(SV.bottle === 'full' ? 'cuppa' : 'bottle', ox + 316, 16); else if (SV.sel && ITEMS[SV.sel]) KIT.spr(ITEMS[SV.sel].icon, ox + 316, 15, { anchor: 'c' });
  var where = SCR.kind === 'world' ? (G.region && BIOME[G.region].n || '') : SCR.kind === 'in' ? (SCR.label || '') : DG ? DG.D.n : '';
  KIT.text(where, ox + COLS * TS - 6, 5, { align: 'right', size: 6, col: '#a6968f', max: 140 }); KIT.text('CHALICES ' + SV.chal.length + '/5', ox + COLS * TS - 6, 17, { align: 'right', size: 6, col: '#ffe36a' });
  if (G.banner && G.banner.t > 0) { var a = Math.min(1, G.banner.t, 2.6 - G.banner.t); R('rgba(0,0,0,' + 0.6 * a + ')', 0, H * 0.4, KIT.W, 30); KIT.text(G.banner.s, KIT.W / 2, H * 0.4 + 4, { align: 'center', font: 'title', size: 22, col: '#ffe36a', alpha: a }); }
  if (MSGBOX) { var lines = KIT.wrap((MSGBOX.who ? MSGBOX.who + ':  ' : '') + MSGBOX.s, COLS * TS - 40, 14, 'body'); KIT.panel(ox + 10, H - 22 - lines.length * 15, COLS * TS - 20, lines.length * 15 + 16); lines.forEach(function (s, n) { KIT.text(s, ox + 20, H - 14 - lines.length * 15 + n * 15, { font: 'body', size: 14 }); }); }
  if (G.mode === 'dead') { R('rgba(0,0,0,' + Math.min(0.8, G.deadT) + ')', 0, 0, KIT.W, H); KIT.text('YOU DIED', KIT.W / 2, H * 0.4, { align: 'center', font: 'title', size: 34, col: '#c4121c', alpha: Math.min(1, G.deadT) }); }
}
