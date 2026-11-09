/* =====================================================================================================
   TEXTURES: one 1024 atlas of 64 px tiles for the whole basement (concrete, brick, filthy white tiles, meat, velvet,
   planks, the cell bars, crates, kegs, pill shelves, TB's posters and graffiti, blood) and a 512 sheet of faces and
   clothes for the people. Painted at 32 px with a seeded random and finished at 64 with a wash of grime, PS1 style.
   ===================================================================================================== */
var TS = 32, TT = 64, TA = 1024;
function srand(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hexrgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function rgb01(h) { var c = hexrgb(h); return [c[0] / 255, c[1] / 255, c[2] / 255]; }
function shade(h, k) { var c = hexrgb(h); return 'rgb(' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * k))); }).join(',') + ')'; }
function tileNoise(rnd, cells) { var g = []; for (var i = 0; i < cells * cells; i++) g.push(rnd()); return function (x, y) { var fx = x / TT * cells, fy = y / TT * cells, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
  var a = g[(y0 % cells) * cells + (x0 % cells)], b = g[(y0 % cells) * cells + ((x0 + 1) % cells)], c = g[((y0 + 1) % cells) * cells + (x0 % cells)], d = g[((y0 + 1) % cells) * cells + ((x0 + 1) % cells)]; return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty; }; }
function Atlas(seed, size) {
  var SZ = size || TA, c = document.createElement('canvas'); c.width = c.height = SZ; var g = c.getContext('2d');
  var t = document.createElement('canvas'); t.width = t.height = TS; var tg = t.getContext('2d'); tg.imageSmoothingEnabled = false;
  var slots = {}, next = 0, rnd = srand(seed || 7), per = SZ / TT;
  var P = { rnd: rnd,
    px: function (x, y, col) { tg.fillStyle = col; tg.fillRect(((x % TS) + TS) % TS, ((y % TS) + TS) % TS, 1, 1); },
    rect: function (x, y, w, h, col) { tg.fillStyle = col; for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) tg.fillRect(((xx % TS) + TS) % TS, ((yy % TS) + TS) % TS, 1, 1); },
    fill: function (col) { tg.fillStyle = col; tg.fillRect(0, 0, TS, TS); },
    clear: function () { tg.clearRect(0, 0, TS, TS); },
    speck: function (cols, n) { for (var i = 0; i < n; i++) { tg.fillStyle = cols[Math.floor(rnd() * cols.length)]; tg.fillRect(Math.floor(rnd() * TS), Math.floor(rnd() * TS), 1, 1); } },
    g: tg };
  function slotXY(i) { return [(i % per) * TT, Math.floor(i / per) * TT]; }
  /* o.flat: no grime; o.hi: painted straight at 64 px with the canvas (text, faces); o.soft: keeps see-through edges */
  function add(name, fn, o) {
    o = o || {}; var i = next++, xy = slotXY(i), ox = xy[0], oy = xy[1];
    g.clearRect(ox, oy, TT, TT);
    if (o.hi) { g.save(); g.beginPath(); g.rect(ox, oy, TT, TT); g.clip(); g.translate(ox, oy); fn(g, rnd); g.restore(); }
    else { tg.clearRect(0, 0, TS, TS); fn(P); g.imageSmoothingEnabled = !o.crisp; g.drawImage(t, 0, 0, TS, TS, ox, oy, TT, TT); g.imageSmoothingEnabled = false; }
    if (!o.flat) {
      var im = g.getImageData(ox, oy, TT, TT), d = im.data, n1 = tileNoise(rnd, 4), n2 = tileNoise(rnd, 8), amt = o.wash === undefined ? 0.26 : o.wash;
      for (var y = 0; y < TT; y++) for (var x = 0; x < TT; x++) { var q = (y * TT + x) * 4; if (!d[q + 3]) continue; if (d[q + 3] < 128 && !o.soft) { d[q + 3] = 0; continue; } if (!o.soft) d[q + 3] = 255;
        var k = 1 + amt * ((n1(x, y) - 0.5) * 1.4 + (n2(x, y) - 0.5) * 0.7) + (rnd() - 0.5) * 0.1; d[q] = Math.min(255, d[q] * k); d[q + 1] = Math.min(255, d[q + 1] * k); d[q + 2] = Math.min(255, d[q + 2] * k); }
      g.putImageData(im, ox, oy);
    }
    slots[name] = [(ox + 0.5) / SZ, (oy + 0.5) / SZ, (TT - 1) / SZ, (TT - 1) / SZ]; return slots[name];
  }
  function tile(name) { return slots[name] || slots.white; }
  return { canvas: c, add: add, tile: tile, slots: slots, g: g };
}
/* ---------- painters (32 px) ---------- */
function pBricks(base, mort, h, w) { return function (p) { p.fill(mort); for (var r = 0; r < 32 / h; r++) for (var b = -1; b < 32 / w + 1; b++) { var x = b * w + (r % 2 ? w / 2 : 0); var col = shade(base, 0.8 + p.rnd() * 0.4); p.rect(x + 1, r * h + 1, w - 1, h - 1, col); p.rect(x + 1, r * h + 1, w - 1, 1, shade(base, 1.25)); } p.speck([shade(base, 0.5), shade(mort, 0.6)], 40); }; }
function pTiles(base, grout, n, dirt) { return function (p) { var s = 32 / n; p.fill(grout); for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { p.rect(x * s + 1, y * s + 1, s - 1, s - 1, shade(base, 0.9 + p.rnd() * 0.15)); p.rect(x * s + 1, y * s + 1, s - 1, 1, shade(base, 1.12)); }
  for (var i = 0; i < (dirt || 0); i++) { var dx = Math.floor(p.rnd() * 32), dy = Math.floor(p.rnd() * 32), l = 2 + Math.floor(p.rnd() * 8); p.rect(dx, dy, 1, l, shade(base, 0.55)); } p.speck([shade(base, 0.6)], 30); }; }
function pConcrete(base) { return function (p) { p.fill(base); p.speck([shade(base, 0.7), shade(base, 1.2), shade(base, 0.85)], 260); for (var i = 0; i < 3; i++) { var x = Math.floor(p.rnd() * 32), y = Math.floor(p.rnd() * 32); for (var k = 0; k < 10; k++) { p.px(x, y, shade(base, 0.5)); x += Math.round(p.rnd() * 2 - 1); y += 1; } } p.rect(0, 31, 32, 1, shade(base, 0.7)); }; }
function pPlanks(base, n) { return function (p) { var w = 32 / n; for (var i = 0; i < n; i++) { var col = shade(base, 0.8 + p.rnd() * 0.35); p.rect(i * w, 0, w, 32, col); p.rect(i * w, 0, 1, 32, shade(base, 0.45)); for (var k = 0; k < 6; k++) p.rect(i * w + 1 + Math.floor(p.rnd() * (w - 2)), Math.floor(p.rnd() * 32), 1, 3 + Math.floor(p.rnd() * 6), shade(base, 0.65)); p.px(i * w + 2, 3, '#1a1010'); p.px(i * w + 2, 28, '#1a1010'); } }; }
var PAINT = {
  white: function (p) { p.fill('#ffffff'); },
  conc: pConcrete('#5a504c'), concd: pConcrete('#3a3230'), concf: pConcrete('#443c38'),
  brick: pBricks('#6a2a22', '#2a1a18', 4, 8), brickd: pBricks('#3a1a18', '#140a0a', 4, 8),
  tilew: pTiles('#c8c4b0', '#5a5448', 4, 14), tileg: pTiles('#7a8a70', '#2a3026', 4, 10), tilep: pTiles('#d8b8d0', '#5a4058', 4, 8),
  checker: function (p) { for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) p.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#12080a' : '#6a0a12'); p.speck(['#2a0a0e', '#8a1a20'], 60); },
  velvet: function (p) { p.fill('#4a0810'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) { var o = (y / 8) % 2 ? 4 : 0; p.rect(x + o + 3, y + 1, 2, 6, '#6a1018'); p.rect(x + o + 1, y + 3, 6, 2, '#6a1018'); p.px(x + o + 3, y + 3, '#a8741a'); } p.speck(['#2a0408'], 40); },
  meat: function (p) { p.fill('#7a1420'); for (var i = 0; i < 14; i++) { var x = p.rnd() * 32, y = p.rnd() * 32, r = 2 + p.rnd() * 4; for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) p.px(Math.floor(x + xx), Math.floor(y + yy), shade('#a82838', 0.8 + p.rnd() * 0.4)); }
    for (var v = 0; v < 4; v++) { var vx = Math.floor(p.rnd() * 32), vy = 0; while (vy < 32) { p.px(vx, vy, '#3a0610'); vx += Math.round(p.rnd() * 2 - 1); vy++; } } p.speck(['#e8a0a0', '#3a0610'], 30); },
  ceil: function (p) { p.fill('#2a2420'); p.rect(0, 15, 32, 2, '#1a1412'); p.rect(15, 0, 2, 32, '#1a1412'); p.speck(['#3a3430', '#141010'], 120); },
  pipe: function (p) { p.fill('#3a3a36'); p.rect(0, 0, 32, 4, '#6a6a60'); p.rect(0, 4, 32, 6, '#4a4a44'); p.rect(0, 26, 32, 6, '#1a1a18'); for (var x = 0; x < 32; x += 16) { p.rect(x, 0, 3, 32, '#2a2a26'); p.rect(x, 0, 1, 32, '#7a7a70'); } p.speck(['#6a3a1a', '#8a4a20'], 60); },
  rust: function (p) { p.fill('#5a3a2a'); p.speck(['#8a4a20', '#3a2018', '#a85a28', '#4a4a44'], 300); p.rect(0, 0, 32, 2, '#2a1a12'); p.rect(0, 30, 32, 2, '#2a1a12'); for (var y = 4; y < 30; y += 8) for (var x = 3; x < 32; x += 8) p.px(x, y, '#c87a3a'); },
  door: function (p) { p.fill('#3a2014'); p.rect(2, 2, 28, 30, '#5a3420'); p.rect(4, 4, 24, 11, '#4a2a18'); p.rect(4, 18, 24, 12, '#4a2a18'); p.rect(4, 4, 24, 1, '#6a4428'); p.rect(4, 18, 24, 1, '#6a4428'); p.rect(25, 16, 3, 2, '#c8a040'); p.speck(['#2a160c'], 50); },
  bars: function (p) { p.clear(); p.rect(0, 0, 32, 2, '#3a3a36'); p.rect(0, 30, 32, 2, '#3a3a36'); p.rect(0, 14, 32, 2, '#3a3a36'); for (var x = 1; x < 32; x += 5) { p.rect(x, 0, 2, 32, '#4a4a44'); p.rect(x, 0, 1, 32, '#7a7a70'); } },
  crate: function (p) { p.fill('#6a4a28'); p.rect(0, 0, 32, 3, '#3a2814'); p.rect(0, 29, 32, 3, '#3a2814'); p.rect(0, 0, 3, 32, '#3a2814'); p.rect(29, 0, 3, 32, '#3a2814'); for (var i = 3; i < 29; i++) { p.px(i, i, '#3a2814'); p.px(i + 1, i, '#3a2814'); } p.speck(['#8a6a38', '#4a3018'], 80); },
  keg: function (p) { p.fill('#4a2a14'); for (var x = 0; x < 32; x += 4) p.rect(x, 0, 1, 32, '#2a160a'); p.rect(0, 4, 32, 3, '#7a7a70'); p.rect(0, 25, 32, 3, '#7a7a70'); p.rect(0, 4, 32, 1, '#aaa8a0'); },
  shelf: function (p) { p.fill('#1a1210'); p.rect(0, 9, 32, 2, '#5a3a20'); p.rect(0, 20, 32, 2, '#5a3a20'); p.rect(0, 31, 32, 1, '#5a3a20'); var cols = ['#ff4a8a', '#ffe36a', '#4adfff', '#7aff6a', '#c04aff', '#ff7a2a'];
    for (var r = 0; r < 3; r++) for (var x = 1; x < 31; x += 5) { var c = cols[Math.floor(p.rnd() * cols.length)]; p.rect(x, r * 11 + 2 - (r ? 0 : 0) + 1, 4, 6, '#d8d0c0'); p.rect(x, r * 11 + 4, 4, 3, c); p.rect(x + 1, r * 11 + 2, 2, 1, '#f1e7d0'); } },
  bed: function (p) { p.fill('#b8b0a0'); p.speck(['#8a1a1a', '#6a0a0a', '#a09888'], 90); p.rect(0, 0, 32, 3, '#6a6a60'); for (var i = 0; i < 3; i++) { var x = 6 + p.rnd() * 20, y = 8 + p.rnd() * 16; p.rect(Math.floor(x), Math.floor(y), 4, 3, '#7a0a10'); } },
  hook: function (p) { p.clear(); p.rect(15, 0, 2, 20, '#7a7a70'); p.rect(11, 20, 2, 6, '#aaa8a0'); p.rect(11, 26, 8, 2, '#aaa8a0'); p.rect(17, 22, 2, 6, '#aaa8a0'); },
  grate: function (p) { p.fill('#1a1614'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 2, '#4a4440'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 2, 32, '#4a4440'); },
  steel: function (p) { p.fill('#6a6a66'); p.speck(['#5a5a56', '#7a7a76'], 200); p.rect(0, 0, 32, 1, '#9a9a96'); p.rect(0, 31, 32, 1, '#3a3a36'); },
  locker: function (p) { p.fill('#4a5048'); p.rect(0, 0, 1, 32, '#2a2e28'); p.rect(31, 0, 1, 32, '#2a2e28'); for (var y = 3; y < 12; y += 2) p.rect(8, y, 16, 1, '#1a1e18'); p.rect(25, 15, 2, 5, '#aaa8a0'); p.rect(0, 30, 32, 2, '#2a2e28'); p.speck(['#6a3a1a', '#3a3e38'], 70); },
  stairs: function (p) { p.fill('#3a3430'); for (var y = 0; y < 32; y += 8) { p.rect(0, y, 32, 2, '#5a524c'); p.rect(0, y + 6, 32, 2, '#1a1614'); } },
  wallpaper: function (p) { p.fill('#3a2a1a'); for (var x = 0; x < 32; x += 8) { p.rect(x, 0, 3, 32, '#4a361e'); } for (var y = 2; y < 32; y += 10) for (var x2 = 4; x2 < 32; x2 += 8) p.rect(x2, y + (x2 % 16 ? 5 : 0), 2, 2, '#6a4a28'); p.speck(['#2a1a10', '#5a1010'], 80); },
  black: function (p) { p.fill('#060404'); },
  glow: function (p) { p.fill('#ffffff'); },
  skin: function (p) { p.fill('#e8c0a0'); },
  cloth: function (p) { p.fill('#888888'); p.speck(['#7a7a7a', '#999999'], 100); },
  leather: function (p) { p.fill('#2a2a2e'); p.speck(['#3a3a40', '#1a1a1e'], 120); p.rect(0, 15, 32, 1, '#4a4a50'); },
  wood: function (p) { p.fill('#8a6a40'); for (var y = 0; y < 32; y += 3) p.rect(0, y, 32, 1, '#6a4a28'); p.speck(['#a8885a'], 40); },
  nail: function (p) { p.fill('#8a8a80'); }
};
/* drawn straight at 64 px: blood, graffiti, posters, neon */
function paintBlood(g, r, k) { g.fillStyle = 'rgba(110,4,12,0.92)'; for (var i = 0; i < 26 * k; i++) { var a = r() * 6.28, d = r() * 22 * k, s = 2 + r() * 7; g.beginPath(); g.arc(32 + Math.cos(a) * d, 32 + Math.sin(a) * d, s, 0, 6.28); g.fill(); }
  g.fillStyle = 'rgba(70,0,6,0.95)'; g.beginPath(); g.arc(32, 32, 9 * k, 0, 6.28); g.fill(); for (var j = 0; j < 5; j++) { var x = 14 + r() * 36; g.fillRect(x, 32, 2, 10 + r() * 22); } }
function scrawl(txt, col, sz, rot) { return function (g, r) { g.translate(32, 32); g.rotate(rot || 0); g.font = 'bold ' + sz + 'px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; var L = txt.split('\n');
  L.forEach(function (s, i) { var y = (i - (L.length - 1) / 2) * sz * 0.95; g.fillStyle = col; g.fillText(s, 0, y); g.fillText(s, 1, y + 1); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-28, y + sz * 0.35, 4, 6 + r() * 6); }); }; }
var HIPAINT = {
  blood1: function (g, r) { paintBlood(g, r, 1); }, blood2: function (g, r) { paintBlood(g, r, 0.7); g.fillStyle = 'rgba(110,4,12,0.9)'; for (var i = 0; i < 4; i++) { g.fillRect(10 + i * 13, 4, 4, 40 + r() * 20); } },
  smear: function (g, r) { g.fillStyle = 'rgba(100,4,10,0.85)'; for (var k = 0; k < 4; k++) { g.beginPath(); g.moveTo(4, 14 + k * 9); g.bezierCurveTo(20, 6 + k * 9, 40, 24 + k * 9, 60, 12 + k * 9); g.lineWidth = 4; g.strokeStyle = 'rgba(100,4,10,0.8)'; g.stroke(); } },
  hand: function (g, r) { g.fillStyle = 'rgba(120,6,14,0.9)'; g.beginPath(); g.ellipse(32, 40, 11, 13, 0, 0, 6.28); g.fill(); [[-11, 6, -0.6], [-5, 0, -0.2], [2, -2, 0], [9, 0, 0.2], [15, 12, 0.8]].forEach(function (f) { g.save(); g.translate(32 + f[0], 30 + f[1]); g.rotate(f[2]); g.fillRect(-2.5, -16, 5, 16); g.restore(); }); g.fillRect(28, 50, 3, 12); },
  g_tb: scrawl('TB WAS\nHERE', '#c4121c', 15, -0.15), g_smile: function (g) { g.strokeStyle = '#ffe36a'; g.lineWidth = 4; g.beginPath(); g.arc(32, 32, 24, 0, 6.28); g.stroke(); g.fillStyle = '#ffe36a'; g.fillRect(22, 20, 5, 9); g.fillRect(38, 20, 5, 9); g.beginPath(); g.arc(32, 34, 15, 0.2, 2.94); g.stroke(); g.fillStyle = 'rgba(255,227,106,0.8)'; g.fillRect(40, 54, 3, 10); },
  g_pills: scrawl('TAKE YOUR\nPILLS', '#ff4a8a', 13, 0.08), g_bro: scrawl('TAKE IT\nEASY BRO', '#f1e7d0', 13, -0.06), g_run: scrawl('RUN', '#c4121c', 30, 0.1), g_noexit: scrawl('NO WAY\nOUT', '#c4121c', 15, -0.1),
  g_suck: scrawl('SUCK ME\nFUCK ME', '#ff4a8a', 13, 0.12), g_muck: scrawl('FUCK\nMUCK', '#f1e7d0', 16, -0.12), g_count: function (g, r) { g.strokeStyle = '#d8d0c0'; g.lineWidth = 2; for (var b = 0; b < 4; b++) { for (var i = 0; i < 4; i++) { g.beginPath(); g.moveTo(8 + b * 14 + i * 3, 16 + (b % 2) * 22); g.lineTo(8 + b * 14 + i * 3, 34 + (b % 2) * 22); g.stroke(); } g.beginPath(); g.moveTo(6 + b * 14, 30 + (b % 2) * 22); g.lineTo(20 + b * 14, 20 + (b % 2) * 22); g.stroke(); } },
  poster: function (g, r) { g.fillStyle = '#e8d8b0'; g.fillRect(4, 2, 56, 60); g.fillStyle = '#c4121c'; g.fillRect(4, 2, 56, 12); g.fillStyle = '#f1e7d0'; g.font = 'bold 9px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.fillText("TB'S SUCK N' FUCK", 32, 11);
    g.fillStyle = '#e8c0a0'; g.beginPath(); g.arc(32, 34, 14, 0, 6.28); g.fill(); g.fillStyle = '#1a1010'; g.fillRect(19, 27, 26, 3); g.beginPath(); g.arc(26, 31, 4, 0, 6.28); g.fill(); g.fillStyle = '#3a2412'; g.fillRect(36, 30, 4, 4);
    g.fillStyle = '#3a0a0a'; g.beginPath(); g.arc(32, 39, 7, 0.1, 3.04); g.fill(); g.fillStyle = '#fffaf0'; g.fillRect(27, 39, 10, 2); g.fillStyle = '#5a3a20'; g.fillRect(14, 18, 36, 4); g.fillRect(20, 12, 24, 7);
    g.fillStyle = '#1a1010'; g.font = 'bold 8px "Archivo Narrow", sans-serif'; g.fillText('STAY A WHILE', 32, 58); },
  poster2: function (g) { g.fillStyle = '#1a0a2a'; g.fillRect(4, 2, 56, 60); for (var i = 0; i < 6; i++) { g.fillStyle = ['#ff4a8a', '#ffe36a', '#4adfff', '#7aff6a', '#c04aff', '#ff7a2a'][i]; g.beginPath(); g.ellipse(14 + (i % 3) * 18, 18 + Math.floor(i / 3) * 18, 7, 4, 0.5, 0, 6.28); g.fill(); }
    g.fillStyle = '#f1e7d0'; g.font = 'bold 9px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.fillText("SILLY PILLS", 32, 52); g.font = '7px "Archivo Narrow", sans-serif'; g.fillText('ASK TB', 32, 60); },
  neon: function (g) { g.fillStyle = '#ff2630'; g.font = 'bold 20px "Pirata One", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EXIT', 32, 32); },
  lamp: function (g) { g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(32, 32, 26, 0, 6.28); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 32, 14, 0, 6.28); g.fill(); },
  halo: function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
  shadow: function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
  spark: function (g) { g.fillStyle = '#ffffff'; g.beginPath(); for (var i = 0; i < 8; i++) { var a = i / 8 * 6.28, r = i % 2 ? 10 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill(); },
  drop: function (g) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 32, 20, 0, 6.28); g.fill(); },
  // the pickups, drawn as little standing cards (billboards)
  i_ammo9: function (g) { box(g, '#5a5a3a', '#8a8a5a', '9MM'); }, i_shells: function (g) { box(g, '#7a1a1a', '#c4121c', 'SHELLS'); }, i_rifle: function (g) { box(g, '#2a3a2a', '#4a6a3a', '.308'); },
  i_cracker: function (g) { g.fillStyle = '#e8c070'; g.beginPath(); for (var i = 0; i < 16; i++) { var a = i / 16 * 6.28, r = i % 2 ? 22 : 26; g.lineTo(32 + Math.cos(a) * r, 34 + Math.sin(a) * r * 0.8); } g.fill(); g.fillStyle = '#a87a3a'; for (var k = 0; k < 7; k++) g.fillRect(20 + (k % 3) * 10, 24 + Math.floor(k / 3) * 9, 3, 3); g.fillStyle = '#fff6e0'; g.beginPath(); g.ellipse(32, 30, 9, 4, 0, 0, 6.28); g.fill(); },
  i_cuppa: function (g) { g.fillStyle = '#f1e7d0'; g.fillRect(18, 22, 28, 32); g.fillStyle = '#c4121c'; g.fillRect(18, 34, 28, 8); g.fillStyle = '#6a3a1a'; g.fillRect(18, 18, 28, 6); g.fillStyle = '#fff6e0'; g.fillRect(20, 14, 24, 5); g.fillStyle = '#12040a'; g.fillRect(16, 54, 32, 3); },
  i_pill: function (g) { g.save(); g.translate(32, 32); g.rotate(-0.6); g.fillStyle = '#ff4a8a'; g.beginPath(); g.arc(-8, 0, 12, 1.57, 4.71); g.fill(); g.fillRect(-8, -12, 8, 24); g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(8, 0, 12, -1.57, 1.57); g.fill(); g.fillRect(0, -12, 8, 24); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-12, -8, 18, 3); g.restore(); },
  i_key: function (g) { g.strokeStyle = '#ffe36a'; g.lineWidth = 6; g.beginPath(); g.arc(20, 32, 11, 0, 6.28); g.stroke(); g.fillStyle = '#ffe36a'; g.fillRect(30, 29, 28, 6); g.fillRect(48, 35, 5, 9); g.fillRect(40, 35, 4, 6); },
  i_bag: function (g) { g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(32, 40, 24, 18, 0, 0, 6.28); g.fill(); g.fillRect(24, 14, 16, 12); g.fillStyle = '#c4121c'; g.fillRect(22, 24, 20, 4); g.fillStyle = '#f1e7d0'; g.font = 'bold 10px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.fillText('YOUR', 32, 42); g.fillText('STUFF', 32, 52); },
  i_note: function (g) { g.fillStyle = '#e8dcc0'; g.save(); g.translate(32, 32); g.rotate(0.1); g.fillRect(-18, -24, 36, 48); g.fillStyle = '#3a2a2a'; for (var i = 0; i < 7; i++) g.fillRect(-13, -17 + i * 6, 20 + (i * 7) % 8, 2); g.fillStyle = '#8a0a10'; g.fillRect(6, 12, 8, 8); g.restore(); },
  i_handgun: function (g) { gunIcon(g, 'handgun'); }, i_shotgun: function (g) { gunIcon(g, 'shotgun'); }, i_riflew: function (g) { gunIcon(g, 'rifle'); }, i_plank: function (g) { gunIcon(g, 'plank'); }, i_knife: function (g) { gunIcon(g, 'knife'); }, i_hammer: function (g) { gunIcon(g, 'hammer'); }, i_fireaxe: function (g) { gunIcon(g, 'fireaxe'); }, i_labbag: function (g) { gunIcon(g, 'bag'); }, i_bat: function (g) { gunIcon(g, 'bat'); }
};
function box(g, a, b, t) { g.fillStyle = '#12040a'; g.fillRect(8, 20, 48, 34); g.fillStyle = a; g.fillRect(10, 22, 44, 30); g.fillStyle = b; g.fillRect(10, 22, 44, 8); g.fillStyle = '#f1e7d0'; g.font = 'bold 12px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.fillText(t, 32, 46); }
/* weapon pictures (the HUD and the pickups share them) */
function gunIcon(g, w) {
  g.save(); g.lineJoin = 'round';
  if (w === 'handgun') { g.fillStyle = '#2a2a2e'; g.fillRect(10, 22, 40, 10); g.fillRect(14, 30, 12, 20); g.fillStyle = '#4a4a50'; g.fillRect(10, 22, 40, 3); g.fillStyle = '#5a3a20'; g.fillRect(15, 34, 10, 14); }
  else if (w === 'shotgun') { g.fillStyle = '#5a3a20'; g.fillRect(2, 30, 16, 10); g.fillStyle = '#2a2a2e'; g.fillRect(16, 27, 46, 6); g.fillRect(16, 33, 30, 4); g.fillStyle = '#6a4a28'; g.fillRect(26, 33, 14, 6); }
  else if (w === 'rifle') { g.fillStyle = '#4a3018'; g.fillRect(2, 30, 20, 9); g.fillStyle = '#2a2a2e'; g.fillRect(20, 28, 42, 5); g.fillRect(26, 20, 16, 5); g.fillStyle = '#4a3018'; g.fillRect(20, 33, 18, 4); }
  else if (w === 'plank') { g.save(); g.translate(32, 32); g.rotate(-0.7); g.fillStyle = '#a07a48'; g.fillRect(-28, -5, 56, 10); g.fillStyle = '#6a4a28'; g.fillRect(-28, -5, 56, 2); g.fillStyle = '#c8c8c0'; g.fillRect(18, -14, 2, 10); g.fillStyle = '#8a3a1a'; g.fillRect(18, -16, 4, 3); g.restore(); }
  else if (w === 'bat') { g.save(); g.translate(32, 32); g.rotate(-0.7); g.fillStyle = '#c8a070'; g.beginPath(); g.moveTo(-28, -2); g.lineTo(10, -6); g.quadraticCurveTo(30, -7, 30, 0); g.quadraticCurveTo(30, 7, 10, 6); g.lineTo(-28, 2); g.fill(); g.fillStyle = '#2a1a10'; g.fillRect(-28, -3, 10, 6); g.fillStyle = 'rgba(110,4,12,0.9)'; g.fillRect(14, -5, 8, 6); g.restore(); }
  else if (w === 'knife') { g.save(); g.translate(32, 32); g.rotate(-0.7); g.fillStyle = '#2a1a10'; g.fillRect(-24, -4, 18, 8); g.fillStyle = '#7a7a70'; g.fillRect(-7, -6, 3, 12); g.fillStyle = '#d8d8d0'; g.beginPath(); g.moveTo(-4, -4); g.lineTo(24, -4); g.lineTo(28, 0); g.lineTo(-4, 4); g.fill(); g.fillStyle = 'rgba(110,4,12,0.9)'; g.fillRect(14, -3, 9, 4); g.restore(); }
  else if (w === 'hammer') { g.save(); g.translate(32, 32); g.rotate(-0.7); g.fillStyle = '#8a5a30'; g.fillRect(-26, -3, 44, 6); g.fillStyle = '#2a2a2e'; g.fillRect(-28, -3, 9, 6); g.fillStyle = '#5a5a60'; g.fillRect(14, -12, 10, 24); g.fillStyle = '#8a8a90'; g.fillRect(14, -12, 10, 4); g.fillStyle = '#4a4a50'; g.beginPath(); g.moveTo(14, 8); g.lineTo(8, 16); g.lineTo(14, 12); g.fill(); g.restore(); }
  else if (w === 'fireaxe') { g.save(); g.translate(32, 34); g.rotate(-0.7); g.fillStyle = '#c4121c'; g.fillRect(-28, -3, 54, 6); g.fillStyle = '#ffe36a'; g.fillRect(-28, -3, 6, 6); g.fillStyle = '#9a9aa0'; g.beginPath(); g.moveTo(16, -3); g.lineTo(22, -18); g.quadraticCurveTo(32, -8, 28, -3); g.fill(); g.fillStyle = '#d8d8e0'; g.fillRect(24, -16, 3, 12); g.fillStyle = '#c4121c'; g.beginPath(); g.moveTo(18, 3); g.lineTo(24, 14); g.lineTo(14, 3); g.fill(); g.restore(); }
  else if (w === 'bag') { g.fillStyle = '#ff7a20'; for (var f = 0; f < 4; f++) { g.beginPath(); g.moveTo(18 + f * 8, 30); g.lineTo(22 + f * 8, 8 + (f % 2) * 6); g.lineTo(26 + f * 8, 30); g.fill(); } g.fillStyle = '#ffe36a'; g.fillRect(24, 22, 16, 8); g.fillStyle = '#aa7846'; g.beginPath(); g.moveTo(16, 30); g.lineTo(48, 30); g.lineTo(50, 56); g.lineTo(14, 56); g.fill(); g.fillStyle = '#6e3c18'; g.beginPath(); g.ellipse(32, 30, 9, 5, 0, 0, 6.28); g.fill(); }
  else if (w === 'fists') { g.fillStyle = '#f1e7d0'; g.beginPath(); g.arc(32, 32, 14, 0, 6.28); g.fill(); g.fillStyle = '#c8b890'; for (var i = 0; i < 4; i++) g.fillRect(20 + i * 6, 20, 5, 6); }
  g.restore();
}
var ATL = null, ATT = null, ICONS = {};
function buildAtlas() {
  if (ATL) return; ATL = Atlas(41);
  Object.keys(PAINT).forEach(function (k) { ATL.add(k, PAINT[k], { flat: k === 'white' || k === 'glow' || k === 'skin' || k === 'nail' || k === 'black', crisp: k === 'bars' || k === 'hook' || k === 'ironbar' || k === 'lattice' || k === 'rail' || k === 'scaffold' }); });
  Object.keys(HIPAINT).forEach(function (k) { ATL.add(k, HIPAINT[k], { hi: true, flat: true, soft: ['halo', 'shadow', 'bush', 'moon', 'flame', 'smoke', 'stink', 'headlight', 'splat', 'ring'].indexOf(k) >= 0 }); });
  ATT = R3.texture(ATL.canvas, true);
  ['handgun', 'shotgun', 'rifle', 'plank', 'bat', 'fists', 'knife', 'hammer', 'fireaxe', 'bag'].forEach(function (w) { var c = document.createElement('canvas'); c.width = c.height = 64; gunIcon(c.getContext('2d'), w); ICONS[w] = c; });
}
function TL(n) { return ATL.tile(n); }
