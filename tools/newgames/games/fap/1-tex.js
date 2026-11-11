/* =====================================================================================================
   THE FAP ROOMS: textures. Old yellow wallpaper, damp mustard carpet, ceiling tiles and the buzzing light panels of
   the Lobby; the Stockroom's concrete; the Pipe Dreams; the Poolrooms' white tiles and water; the Party Room's pink;
   the red corridor; and the things that live down here, painted at 64 px for the billboards.
   ===================================================================================================== */
var PAINT = {
  white: function (p) { p.fill('#ffffff'); },
  glow: function (p) { p.fill('#ffffff'); },
  paper: function (p) { p.fill('#c8b45a'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) { var o = (y / 8) % 2 ? 4 : 0; p.px(x + o + 3, y + 2, '#a8943e'); p.px(x + o + 2, y + 3, '#a8943e'); p.px(x + o + 4, y + 3, '#a8943e'); p.px(x + o + 3, y + 4, '#a8943e'); }
    for (var x2 = 0; x2 < 32; x2 += 16) p.rect(x2, 0, 1, 32, '#b8a44c'); for (var k = 0; k < 4; k++) { var sx = Math.floor(p.rnd() * 30), sy = Math.floor(p.rnd() * 20); for (var j = 0; j < 10; j++) p.px(sx + Math.round(p.rnd()), sy + j, '#9a8636'); } p.speck(['#d4c068', '#b09c46'], 80); },
  paper2: function (p) { PAINT.paper(p); for (var i = 0; i < 40; i++) p.px(Math.floor(p.rnd() * 32), 22 + Math.floor(p.rnd() * 7), '#b4a04c'); p.rect(0, 29, 32, 3, '#6e5e28'); p.rect(0, 29, 32, 1, '#d8c878'); },
  carpet: function (p) { p.fill('#8a7a3a'); p.speck(['#7a6a30', '#9a8a44', '#6e6028', '#a69648'], 420); for (var k = 0; k < 3; k++) { var cx = Math.floor(p.rnd() * 32), cy = Math.floor(p.rnd() * 32), r = 3 + Math.floor(p.rnd() * 4); for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) if (x * x + y * y <= r * r && p.rnd() < 0.8) p.px(cx + x, cy + y, '#6a5c26'); } },
  ceil: function (p) { p.fill('#d8d0b0'); p.speck(['#c8c0a0', '#e0d8b8', '#b8b090'], 160); p.rect(0, 0, 32, 1, '#8a8470'); p.rect(0, 0, 1, 32, '#8a8470'); p.rect(0, 16, 32, 1, '#a09a84'); p.rect(16, 0, 1, 32, '#a09a84'); if (p.rnd() < 0.5) { var x = 2 + Math.floor(p.rnd() * 10), y = 2 + Math.floor(p.rnd() * 10); for (var k = 0; k < 18; k++) p.px(x + Math.floor(p.rnd() * 6), y + Math.floor(p.rnd() * 6), '#a89a60'); } },
  panel: function (p) { p.fill('#fffbe8'); p.rect(0, 0, 32, 2, '#8a8470'); p.rect(0, 30, 32, 2, '#8a8470'); p.rect(0, 0, 2, 32, '#8a8470'); p.rect(30, 0, 2, 32, '#8a8470'); for (var x = 4; x < 30; x += 4) p.rect(x, 2, 1, 28, '#f0e8c8'); },
  conc: pConcrete('#5a5654'), concf: function (p) { p.fill('#4a4644'); p.speck(['#3a3634', '#5a5654', '#423e3c'], 300); p.rect(0, 15, 32, 1, '#e8d040'); p.rect(0, 16, 32, 1, '#a89020'); },
  pillar: function (p) { pConcrete('#6a6662')(p); p.rect(0, 22, 32, 4, '#e8d040'); for (var x = 0; x < 32; x += 8) p.rect(x, 22, 4, 4, '#1a1a1a'); },
  pipe: function (p) { p.fill('#3a2a24'); for (var y = 2; y < 32; y += 10) { p.rect(0, y, 32, 6, '#6a4a3a'); p.rect(0, y, 32, 1, '#9a6a52'); p.rect(0, y + 5, 32, 1, '#2a1a14'); p.rect(12, y - 1, 3, 8, '#4a3a30'); } p.speck(['#8a3a1a', '#2a1a14'], 60); },
  grate: function (p) { p.fill('#1a1614'); for (var i = 0; i < 32; i += 4) { p.rect(i, 0, 2, 32, '#3a3430'); p.rect(0, i, 32, 1, '#2a2420'); } },
  pooltile: pTiles('#e8f0f0', '#a8c0c0', 8, 0), poolwall: pTiles('#d8e8ec', '#98b4b8', 8, 2),
  water: function (p) { p.fill('#3aa8b8'); for (var i = 0; i < 40; i++) p.rect(Math.floor(p.rnd() * 32), Math.floor(p.rnd() * 32), 4, 1, '#7ad8e0'); p.speck(['#2a98a8', '#5ac0cc'], 120); },
  party: function (p) { p.fill('#d86a9a'); for (var y = 0; y < 32; y += 16) for (var x = 0; x < 32; x += 16) { var o = (y / 16) % 2 ? 8 : 0, c = ['#ffe36a', '#4adfff', '#7aff6a', '#ff2630'][(x + y) / 16 % 4]; p.rect(x + o + 4, y + 3, 6, 7, c); p.px(x + o + 7, y + 10, '#3a1a2a'); p.px(x + o + 7, y + 11, '#3a1a2a'); p.px(x + o + 6, y + 12, '#3a1a2a'); } p.speck(['#c85a8a', '#e87aaa'], 80); },
  partyf: function (p) { for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) p.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#2a1a2a' : '#e8d8e0'); p.speck(['#ff2630', '#ffe36a', '#4adfff'], 30); },
  red: function (p) { p.fill('#5a0a10'); p.speck(['#4a080c', '#6a1018', '#3a0408'], 200); for (var k = 0; k < 4; k++) { var x = Math.floor(p.rnd() * 32); for (var y = 0; y < 32; y++) if (p.rnd() < 0.6) p.px(x, y, '#2a0204'); } },
  redf: function (p) { p.fill('#2a0608'); p.speck(['#3a080c', '#1a0204'], 200); },
  door: function (p) { p.fill('#6a4a2a'); p.rect(2, 2, 28, 30, '#8a6238'); p.rect(4, 4, 24, 12, '#7a5430'); p.rect(4, 18, 24, 12, '#7a5430'); p.rect(24, 16, 3, 3, '#e8d040'); },
  exit: function (p) { p.fill('#1a0a08'); p.rect(2, 2, 28, 30, '#2a3a2a'); p.rect(4, 4, 24, 26, '#1a2a1a'); p.rect(23, 16, 3, 3, '#a8a8a0'); },
  black: function (p) { p.fill('#000000'); }
};
var HIPAINT = { // drawn straight at 64 px with the canvas: the billboards and the signs
  exitsign: function (g) { g.fillStyle = '#0a2a0a'; g.fillRect(0, 16, 64, 32); g.fillStyle = '#4aff6a'; g.font = 'bold 22px monospace'; g.textAlign = 'center'; g.fillText('EXIT', 32, 40); g.strokeStyle = '#2a8a3a'; g.lineWidth = 2; g.strokeRect(2, 18, 60, 28); },
  grinner: function (g) { var r = g.createRadialGradient(32, 30, 4, 32, 30, 30); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(0.75, 'rgba(0,0,0,0.95)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(22, 22, 4, 2.5, 0.3, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(42, 22, 4, 2.5, -0.3, 0, 6.3); g.fill();
    g.beginPath(); g.moveTo(10, 32); g.quadraticCurveTo(32, 52, 54, 32); g.quadraticCurveTo(32, 42, 10, 32); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1; for (var i = 0; i < 12; i++) { var x = 13 + i * 3.6; g.beginPath(); g.moveTo(x, 33 + Math.sin(i / 11 * 3.14) * 3); g.lineTo(x, 38 + Math.sin(i / 11 * 3.14) * 7); g.stroke(); } },
  walker: function (g) { g.fillStyle = '#c8b090'; g.beginPath(); g.ellipse(32, 12, 7, 9, 0, 0, 6.3); g.fill(); g.fillStyle = '#1a1010'; g.fillRect(27, 10, 3, 2); g.fillRect(34, 10, 3, 2); g.fillRect(28, 16, 8, 1);
    g.fillStyle = '#d8c8a0'; g.fillRect(24, 21, 16, 22); g.fillStyle = '#c8b090'; g.fillRect(18, 22, 5, 26); g.fillRect(41, 22, 5, 26); g.fillRect(25, 43, 6, 21); g.fillRect(33, 43, 6, 21); g.fillStyle = '#e8d8b0'; g.fillRect(24, 21, 16, 3); g.fillStyle = 'rgba(80,20,10,0.7)'; g.fillRect(30, 26, 4, 12); },
  hound: function (g) { g.fillStyle = '#2a1a14'; g.beginPath(); g.ellipse(32, 40, 22, 10, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(14, 34, 9, 8, 0, 0, 6.3); g.fill(); for (var i = 0; i < 4; i++) g.fillRect(16 + i * 10, 46, 4, 16); g.fillStyle = '#ff2630'; g.fillRect(9, 31, 3, 2); g.fillRect(15, 31, 3, 2); g.fillStyle = '#e8e0d0'; for (var t = 0; t < 4; t++) g.fillRect(7 + t * 3, 38, 2, 3); },
  steve: function (g) { g.fillStyle = '#c4121c'; g.beginPath(); g.moveTo(32, 2); g.quadraticCurveTo(58, 34, 52, 50); g.quadraticCurveTo(32, 66, 12, 50); g.quadraticCurveTo(6, 34, 32, 2); g.fill(); g.fillStyle = '#0a0606'; g.beginPath(); g.moveTo(32, 6); g.quadraticCurveTo(55, 34, 49, 49); g.quadraticCurveTo(32, 62, 15, 49); g.quadraticCurveTo(9, 34, 32, 6); g.fill();
    g.fillStyle = '#ff2630'; g.beginPath(); g.ellipse(24, 34, 4, 5, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(40, 34, 4, 5, 0, 0, 6.3); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(18, 44); g.quadraticCurveTo(32, 58, 46, 44); g.quadraticCurveTo(32, 50, 18, 44); g.fill(); },
  chaser: function (g) { g.fillStyle = '#1a0204'; g.beginPath(); g.ellipse(32, 34, 30, 30, 0, 0, 6.3); g.fill(); g.fillStyle = '#ff2630'; for (var i = 0; i < 7; i++) { g.beginPath(); g.ellipse(14 + (i % 4) * 12, 20 + Math.floor(i / 4) * 14 + (i % 2) * 4, 3.5, 2.5, 0, 0, 6.3); g.fill(); }
    g.fillStyle = '#e8d8c0'; g.beginPath(); g.moveTo(8, 46); g.lineTo(56, 46); g.lineTo(52, 58); g.lineTo(12, 58); g.fill(); g.fillStyle = '#1a0204'; for (var t = 0; t < 9; t++) g.fillRect(10 + t * 5, 46, 2, 12); },
  cuppa: function (g) { g.fillStyle = '#c4121c'; g.beginPath(); g.moveTo(18, 22); g.lineTo(46, 22); g.lineTo(42, 54); g.lineTo(22, 54); g.fill(); g.fillStyle = '#f1e0b0'; g.beginPath(); g.ellipse(32, 22, 14, 4, 0, 0, 6.3); g.fill(); g.strokeStyle = '#c4121c'; g.lineWidth = 3; g.beginPath(); g.arc(48, 36, 6, -1.4, 1.4); g.stroke(); g.fillStyle = '#ffe36a'; g.fillRect(24, 34, 16, 6); },
  battery: function (g) { g.fillStyle = '#2a2a2a'; g.fillRect(22, 14, 20, 40); g.fillStyle = '#e8d040'; g.fillRect(22, 14, 20, 12); g.fillStyle = '#a8a8a0'; g.fillRect(28, 9, 8, 5); g.fillStyle = '#fff'; g.font = 'bold 12px monospace'; g.textAlign = 'center'; g.fillText('+', 32, 44); },
  note: function (g) { g.fillStyle = '#f1e7d0'; g.save(); g.translate(32, 34); g.rotate(-0.15); g.fillRect(-16, -20, 32, 40); g.fillStyle = '#5a4a3a'; for (var i = 0; i < 7; i++) g.fillRect(-12, -14 + i * 5, 18 + (i * 7) % 7, 1); g.restore(); },
  tissue: function (g) { g.fillStyle = '#4adfff'; g.fillRect(12, 34, 40, 22); g.fillStyle = '#2a8a9a'; g.fillRect(12, 34, 40, 4); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(26, 34); g.quadraticCurveTo(32, 14, 40, 22); g.quadraticCurveTo(36, 30, 38, 34); g.fill(); },
  balloon: function (g) { var c = ['#ff2630', '#ffe36a', '#4adfff']; c.forEach(function (col, i) { g.fillStyle = col; g.beginPath(); g.ellipse(18 + i * 14, 18 + (i % 2) * 6, 9, 11, 0, 0, 6.3); g.fill(); g.strokeStyle = '#ddd'; g.beginPath(); g.moveTo(18 + i * 14, 29 + (i % 2) * 6); g.lineTo(32, 62); g.stroke(); }); },
  halo: function (g) { var r = g.createRadialGradient(32, 32, 2, 32, 32, 32); r.addColorStop(0, 'rgba(255,250,220,0.9)'); r.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
};
var ATL = null, ATT = null;
function buildAtlas() {
  if (ATL) return; ATL = Atlas(77, 1024);
  Object.keys(PAINT).forEach(function (k) { ATL.add(k, PAINT[k], { flat: k === 'white' || k === 'glow' || k === 'panel' || k === 'black', wash: /pool|water|party/.test(k) ? 0.07 : undefined }); });
  Object.keys(HIPAINT).forEach(function (k) { ATL.add(k, HIPAINT[k], { hi: true, flat: true, soft: /grinner|halo|stain|damp|puddle|smear|blood|handprint/.test(k) }); });
  ATT = R3.texture(ATL.canvas, true);
}
function TL(n) { return ATL.tile(n); }
