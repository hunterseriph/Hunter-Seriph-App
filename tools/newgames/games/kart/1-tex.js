/* =====================================================================================================
   TEXTURES: every course paints its own 512x512 atlas of 32x32 pixel tiles (bricks, planks, asphalt, cream,
   neon, flesh...) from its colours, plus a sky strip that wraps round the horizon. Painted pixel by pixel
   with a seeded random so a course always looks the same. Low colour, hard edges, PS1 style.
   ===================================================================================================== */
var TS = 32, TT = 64, TA = 1024; // painters work on a 32x32 grid; each tile is finished at 64x64 in a 1024 atlas
function srand(seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hexrgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function shade(h, k) { var c = hexrgb(h); return 'rgb(' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * k))); }).join(',') + ')'; }
function mix(a, b, k) { var x = hexrgb(a), y = hexrgb(b); return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * k); }).join(',') + ')'; }
/* seamless value noise on a 64 tile: smooth blobs of light and dark so surfaces look worn, not flat */
function tileNoise(rnd, cells) { var g = []; for (var i = 0; i < cells * cells; i++) g.push(rnd()); return function (x, y) { var fx = x / TT * cells, fy = y / TT * cells, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
  var a = g[(y0 % cells) * cells + (x0 % cells)], b = g[(y0 % cells) * cells + ((x0 + 1) % cells)], c = g[((y0 + 1) % cells) * cells + (x0 % cells)], d = g[((y0 + 1) % cells) * cells + ((x0 + 1) % cells)]; return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty; }; }

function Atlas(seed) {
  var c = document.createElement('canvas'); c.width = c.height = TA; var g = c.getContext('2d');
  var t = document.createElement('canvas'); t.width = t.height = TS; var tg = t.getContext('2d'); tg.imageSmoothingEnabled = false;
  var slots = {}, next = 0, rnd = srand(seed || 7);
  var P = { rnd: rnd,
    px: function (x, y, col) { tg.fillStyle = col; tg.fillRect(((x % TS) + TS) % TS, ((y % TS) + TS) % TS, 1, 1); },
    rect: function (x, y, w, h, col) { tg.fillStyle = col; for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) tg.fillRect(((xx % TS) + TS) % TS, ((yy % TS) + TS) % TS, 1, 1); },
    fill: function (col) { tg.fillStyle = col; tg.fillRect(0, 0, TS, TS); },
    clear: function () { tg.clearRect(0, 0, TS, TS); },
    speck: function (cols, n) { for (var i = 0; i < n; i++) { tg.fillStyle = cols[Math.floor(rnd() * cols.length)]; tg.fillRect(Math.floor(rnd() * TS), Math.floor(rnd() * TS), 1, 1); } },
    g: tg };
  /* paint at 32, then finish at 64: smoothed up, a wash of soft light and shadow, fine grain. o.flat keeps a tile clean (solid colours for tinting) */
  function add(name, fn, o) {
    o = o || {}; var i = next++, ox = (i % (TA / TT)) * TT, oy = Math.floor(i / (TA / TT)) * TT;
    tg.clearRect(0, 0, TS, TS); fn(P);
    g.clearRect(ox, oy, TT, TT); g.imageSmoothingEnabled = !o.flat && !o.crisp; g.drawImage(t, 0, 0, TS, TS, ox, oy, TT, TT); g.imageSmoothingEnabled = false;
    if (!o.flat) {
      var im = g.getImageData(ox, oy, TT, TT), d = im.data, n1 = tileNoise(rnd, 4), n2 = tileNoise(rnd, 8), amt = o.wash === undefined ? 0.22 : o.wash;
      for (var y = 0; y < TT; y++) for (var x = 0; x < TT; x++) { var q = (y * TT + x) * 4; if (!d[q + 3]) continue; if (d[q + 3] < 128 && !o.soft) { d[q + 3] = 0; continue; } if (!o.soft) d[q + 3] = 255;
        var k = 1 + amt * ((n1(x, y) - 0.5) * 1.4 + (n2(x, y) - 0.5) * 0.7) + (rnd() - 0.5) * 0.09; d[q] = Math.min(255, d[q] * k); d[q + 1] = Math.min(255, d[q + 1] * k); d[q + 2] = Math.min(255, d[q + 2] * k); }
      g.putImageData(im, ox, oy);
    }
    slots[name] = [(ox + 0.5) / TA, (oy + 0.5) / TA, (TT - 1) / TA, (TT - 1) / TA]; return slots[name];
  }
  function tile(name) { return slots[name] || slots.white; }
  return { canvas: c, add: add, tile: tile, slots: slots };
}

/* ---------- painters ---------- */
var PAINT = {
  solid: function (col) { return function (p) { p.fill(col); }; },
  white: function (p) { p.fill('#ffffff'); },
  check: function (p) { for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) p.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#12040a' : '#f1e7d0'); },
  kerb: function (a, b) { return function (p) { p.rect(0, 0, 32, 16, a); p.rect(0, 16, 32, 16, b); p.rect(0, 15, 32, 1, shade(a, 0.6)); p.rect(0, 31, 32, 1, shade(b, 0.6)); }; },
  arrow: function (p) { // boost pad: gold chevrons on red
    p.fill('#5a0610'); for (var k = 0; k < 2; k++) for (var y = 0; y < 10; y++) { var yy = k * 16 + y + 2; p.rect(4 + y, yy, 4, 1, y < 9 ? '#ffe36a' : '#a8741a'); p.rect(24 - y, yy, 4, 1, y < 9 ? '#ffe36a' : '#a8741a'); }
    p.rect(0, 0, 1, 32, '#12040a'); p.rect(31, 0, 1, 32, '#12040a');
  },
  box: function (p) { // item box face: a gold question mark in a blood red frame
    p.fill('#c4121c'); p.rect(2, 2, 28, 28, '#5a0610'); p.rect(3, 3, 26, 1, '#ff2630'); p.rect(3, 3, 1, 26, '#ff2630');
    var q = ['..####..', '.##..##.', '.....##.', '....##..', '...##...', '...##...', '........', '...##...'];
    q.forEach(function (r, y) { for (var x = 0; x < 8; x++) if (r[x] === '#') { p.rect(8 + x * 2, 8 + y * 2, 2, 2, '#ffe36a'); p.px(8 + x * 2 + 2, 8 + y * 2 + 2, '#12040a'); } });
  },
  shadow: function (p) { p.clear(); for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var d = Math.hypot(x - 15.5, y - 15.5); if (d < 14 && ((x + y) % 2 === 0 || d < 9)) p.px(x, y, '#000000'); } },
  asphalt: function (base, flecks, line) {
    return function (p) {
      p.fill(base); p.speck(flecks, 120);
      for (var i = 0; i < 2; i++) { var x = Math.floor(p.rnd() * 28), y = Math.floor(p.rnd() * 28); p.rect(x, y, 3, 1, shade(base, 0.7)); p.px(x + 2, y + 1, shade(base, 0.7)); }
      if (line) { p.rect(15, 0, 2, 12, line); }
    };
  },
  bricks: function (mortar, cols, bw, bh, o) {
    bw = bw || 16; bh = bh || 8; o = o || {};
    return function (p) {
      p.fill(mortar);
      for (var r = 0; r < TS / bh; r++) for (var cI = -1; cI < TS / bw + 1; cI++) {
        var x = cI * bw + (r % 2 ? bw / 2 : 0), y = r * bh, col = cols[Math.floor(p.rnd() * cols.length)];
        p.rect(x + 1, y + 1, bw - 1, bh - 1, col); p.rect(x + 1, y + 1, bw - 1, 1, shade(col, 1.25)); p.rect(x + 1, y + bh - 1, bw - 1, 1, shade(col, 0.7));
        if (p.rnd() < 0.3) p.px(x + 3 + Math.floor(p.rnd() * (bw - 6)), y + 2 + Math.floor(p.rnd() * (bh - 4)), shade(col, 0.6));
        if (o.moss && p.rnd() < 0.25) p.rect(x + 1, y + bh - 2, 3 + Math.floor(p.rnd() * 5), 1, o.moss);
      }
    };
  },
  planks: function (cols, dark) {
    return function (p) {
      for (var i = 0; i < 4; i++) { var col = cols[i % cols.length]; p.rect(0, i * 8, 32, 8, col); p.rect(0, i * 8, 32, 1, shade(col, 1.2)); p.rect(0, i * 8 + 7, 32, 1, dark); var j = Math.floor(p.rnd() * 32); p.rect(j, i * 8, 1, 8, dark); p.px(Math.floor(p.rnd() * 32), i * 8 + 3, shade(col, 0.7)); p.px(Math.floor(p.rnd() * 32), i * 8 + 4, shade(col, 0.7)); }
    };
  },
  grass: function (cols) { return function (p) { p.fill(cols[0]); p.speck(cols, 260); for (var i = 0; i < 18; i++) { var x = Math.floor(p.rnd() * 32), y = Math.floor(p.rnd() * 32); p.px(x, y, cols[cols.length - 1]); p.px(x, y - 1, cols[cols.length - 1]); } }; },
  speckle: function (base, cols, n) { return function (p) { p.fill(base); p.speck(cols, n || 160); }; },
  liquid: function (cols) { // cream, goo, blood: wavy bands (the vertex scroll makes it flow)
    return function (p) { p.fill(cols[0]); for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var w = Math.sin((x / 32) * Math.PI * 2 + y * 0.4) + Math.sin(y / 32 * Math.PI * 4); if (w > 1.2) p.px(x, y, cols[2]); else if (w > 0.5) p.px(x, y, cols[1]); else if (w < -1.4) p.px(x, y, cols[3] || cols[0]); } };
  },
  metal: function (base, dark, rivet) {
    return function (p) { p.fill(base); p.rect(0, 0, 32, 1, shade(base, 1.3)); p.rect(0, 31, 32, 1, dark); p.rect(0, 0, 1, 32, shade(base, 1.2)); p.rect(31, 0, 1, 32, dark); p.rect(0, 15, 32, 1, dark); p.rect(0, 16, 32, 1, shade(base, 1.2));
      [[3, 3], [28, 3], [3, 12], [28, 12], [3, 19], [28, 19], [3, 28], [28, 28]].forEach(function (r) { p.px(r[0], r[1], rivet); p.px(r[0] + 1, r[1] + 1, dark); }); p.speck([shade(base, 0.9), shade(base, 1.1)], 40); };
  },
  grid: function (base, line, glow) { // neon floor
    return function (p) { p.fill(base); p.rect(0, 0, 32, 1, line); p.rect(0, 0, 1, 32, line); p.rect(0, 1, 32, 1, glow); p.rect(1, 0, 1, 32, glow); p.speck([shade(base, 1.4)], 12); };
  },
  stone: function (mortar, cols) { // big uneven blocks
    return function (p) {
      p.fill(mortar); var rows = [[0, 11], [11, 10], [21, 11]];
      rows.forEach(function (r, ri) { var x = ri % 2 ? -8 : 0; while (x < 32) { var w = 10 + Math.floor(p.rnd() * 10), col = cols[Math.floor(p.rnd() * cols.length)]; p.rect(x + 1, r[0] + 1, w - 1, r[1] - 1, col); p.rect(x + 1, r[0] + 1, w - 1, 1, shade(col, 1.25)); p.rect(x + w - 1, r[0] + 1, 1, r[1] - 1, shade(col, 0.75)); x += w; } });
      p.speck([shade(cols[0], 0.8), shade(cols[0], 1.15)], 50);
    };
  },
  tiles: function (a, b, grout) { return function (p) { for (var y = 0; y < 2; y++) for (var x = 0; x < 2; x++) { var col = (x + y) % 2 ? a : b; p.rect(x * 16, y * 16, 16, 16, col); p.rect(x * 16, y * 16, 16, 1, grout); p.rect(x * 16, y * 16, 1, 16, grout); p.rect(x * 16 + 2, y * 16 + 2, 4, 1, shade(col, 1.2)); } }; },
  flesh: function (base, vein, light) {
    return function (p) { p.fill(base); p.speck([shade(base, 0.85), shade(base, 1.15)], 120); var x = Math.floor(p.rnd() * 32); for (var y = 0; y < 32; y++) { x += Math.round(p.rnd() * 2 - 1); p.px(x, y, vein); p.px(x + 1, y, shade(vein, 0.7)); }
      for (var i = 0; i < 3; i++) { var bx = Math.floor(p.rnd() * 28), by = Math.floor(p.rnd() * 28); p.rect(bx, by, 3, 2, light); } };
  },
  carpet: function (base, pat, edge) { return function (p) { p.fill(base); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) { p.px(x + 4, y + 2, pat); p.rect(x + 3, y + 3, 3, 1, pat); p.px(x + 4, y + 4, pat); } p.rect(0, 0, 32, 2, edge); p.rect(0, 30, 32, 2, edge); }; },
  crater: function (base, dark, light) { return function (p) { p.fill(base); p.speck([dark, light], 140); for (var i = 0; i < 3; i++) { var cx = 4 + Math.floor(p.rnd() * 24), cy = 4 + Math.floor(p.rnd() * 24), r = 2 + Math.floor(p.rnd() * 3); for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) { var d = Math.hypot(x, y); if (d <= r) p.px(cx + x, cy + y, d > r - 1 ? light : dark); } } }; },
  stars: function (base, cols) { return function (p) { p.fill(base); p.speck(cols, 30); }; },
  gingham: function (a, b) { return function (p) { for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var u = Math.floor(x / 8) % 2, v = Math.floor(y / 8) % 2; p.px(x, y, u && v ? a : (u || v) ? mix(a, b, 0.55) : b); } }; },
  window: function (frame, glass, lit) { return function (p) { p.fill(frame); p.rect(4, 4, 24, 26, '#12040a'); p.rect(5, 5, 10, 11, lit ? glass : shade(glass, 0.5)); p.rect(17, 5, 10, 11, glass); p.rect(5, 18, 10, 11, glass); p.rect(17, 18, 10, 11, lit ? shade(glass, 0.6) : glass); p.rect(5, 5, 3, 1, '#ffffff'); }; },
  banner: function (cloth, trim, mark) { return function (p) { p.clear(); p.rect(4, 0, 24, 26, cloth); p.rect(4, 0, 24, 2, trim); for (var y = 26; y < 32; y++) { p.rect(4, y, 12 - (y - 26) * 2, 1, cloth); p.rect(16 + (y - 26) * 2, y, 12 - (y - 26) * 2, 1, cloth); } p.rect(14, 8, 4, 10, mark); p.rect(11, 11, 10, 3, mark); }; },
  fence: function (post, rail) { return function (p) { p.clear(); p.rect(0, 0, 3, 32, post); p.rect(16, 0, 3, 32, post); p.rect(0, 6, 32, 3, rail); p.rect(0, 20, 32, 3, rail); p.rect(0, 6, 32, 1, shade(rail, 1.3)); }; },
  pipe: function (base) { return function (p) { for (var y = 0; y < 32; y++) { var k = 0.55 + 0.6 * Math.sin(y / 32 * Math.PI); p.rect(0, y, 32, 1, shade(base, k)); } p.rect(14, 0, 4, 32, shade(base, 0.6)); p.rect(15, 0, 1, 32, shade(base, 1.3)); }; },
  rope: function (a, b) { return function (p) { for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) p.px(x, y, ((x + y * 2) % 8) < 4 ? a : b); for (var i = 0; i < 6; i++) p.rect(Math.floor(p.rnd() * 30), Math.floor(p.rnd() * 30), 1, 3, shade(b, 0.6)); }; },
  cab: function (body, screen, trim) { // an arcade cabinet front
    return function (p) { p.fill(body); p.rect(4, 3, 24, 14, '#12040a'); p.rect(5, 4, 22, 12, screen); for (var y = 5; y < 16; y += 2) p.rect(5, y, 22, 1, shade(screen, 0.75)); p.rect(4, 20, 24, 3, trim); p.rect(8, 21, 2, 1, '#ff2630'); p.rect(14, 21, 2, 1, '#ffe36a'); p.rect(20, 21, 2, 1, '#9adfff'); p.rect(12, 26, 8, 3, '#12040a'); };
  },
  lava: function (p) { p.fill('#5a1004'); for (var y = 0; y < 32; y++) for (var x = 0; x < 32; x++) { var w = Math.sin(x * 0.4 + Math.sin(y * 0.3) * 2) + Math.cos(y * 0.35); if (w > 1.1) p.px(x, y, '#ffe36a'); else if (w > 0.4) p.px(x, y, '#ff7a20'); else if (w > -0.3) p.px(x, y, '#c4301a'); } }
};

/* ---------- the sky: a strip that wraps round the horizon ---------- */
function paintSky(sk, seed) {
  var c = document.createElement('canvas'); c.width = 512; c.height = 128; var g = c.getContext('2d'), rnd = srand(seed || 3);
  var gr = g.createLinearGradient(0, 0, 0, 128); sk.grad.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); g.fillStyle = gr; g.fillRect(0, 0, 512, 128);
  if (sk.stars) for (var s = 0; s < sk.stars; s++) { g.fillStyle = rnd() < 0.2 ? '#ffe36a' : '#f1e7d0'; g.fillRect(Math.floor(rnd() * 512), Math.floor(rnd() * 70), 1, 1); }
  if (sk.moon) { var m = sk.moon, gl2 = g.createRadialGradient(m.x, m.y, m.r * 0.6, m.x, m.y, m.r * 3); gl2.addColorStop(0, m.glow || 'rgba(255,40,48,0.35)'); gl2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl2; g.fillRect(m.x - m.r * 3, m.y - m.r * 3, m.r * 6, m.r * 6);
    var mg = g.createRadialGradient(m.x - m.r * 0.35, m.y - m.r * 0.35, m.r * 0.1, m.x, m.y, m.r); mg.addColorStop(0, mix(m.col, '#ffffff', 0.35)); mg.addColorStop(0.7, m.col); mg.addColorStop(1, shade(m.col, 0.55)); g.fillStyle = mg; g.beginPath(); g.arc(m.x, m.y, m.r, 0, 6.3); g.fill();
    g.fillStyle = m.dark || 'rgba(0,0,0,0.2)'; [[-0.3, 0.2, 0.3], [0.35, -0.3, 0.18], [0.1, 0.45, 0.14], [-0.45, -0.2, 0.1]].forEach(function (cr) { g.beginPath(); g.arc(m.x + cr[0] * m.r, m.y + cr[1] * m.r, cr[2] * m.r, 0, 6.3); g.fill(); }); }
  if (sk.clouds) { g.fillStyle = sk.clouds; for (var k = 0; k < 12; k++) { var cx = rnd() * 512, cy = 20 + rnd() * 40, w = 30 + rnd() * 60; for (var j = 0; j < 5; j++) { g.beginPath(); g.ellipse(cx + j * w / 5, cy + Math.sin(j) * 3, w / 4, 4 + rnd() * 3, 0, 0, 6.3); g.fill(); } } }
  if (sk.city) { // a skyline along the bottom, with lit windows
    var x = 0; while (x < 512) { var w = 10 + Math.floor(rnd() * 22), h = 14 + Math.floor(rnd() * sk.city.h); g.fillStyle = sk.city.col; g.fillRect(x, 128 - h, w, h); if (rnd() < 0.3) { g.fillRect(x + w / 2 - 1, 128 - h - 8, 2, 8); }
      for (var wy = 128 - h + 3; wy < 124; wy += 5) for (var wx = x + 2; wx < x + w - 2; wx += 4) if (rnd() < 0.35) { g.fillStyle = sk.city.lit; g.fillRect(wx, wy, 2, 2); } x += w + Math.floor(rnd() * 3); }
  }
  if (sk.hills) sk.hills.forEach(function (hl, i) { g.fillStyle = hl; g.beginPath(); g.moveTo(0, 128); for (var x2 = 0; x2 <= 512; x2 += 8) g.lineTo(x2, 128 - 18 - i * -6 - 14 * Math.sin(x2 / 512 * Math.PI * (4 + i * 2) + i) - 6 * Math.sin(x2 / 40 + i)); g.lineTo(512, 128); g.fill(); });
  if (sk.spires) { g.fillStyle = sk.spires; for (var q = 0; q < 9; q++) { var sx = q * 57 + rnd() * 20, sh2 = 30 + rnd() * 40; g.fillRect(sx, 128 - sh2, 12, sh2); g.beginPath(); g.moveTo(sx - 3, 128 - sh2); g.lineTo(sx + 6, 128 - sh2 - 22); g.lineTo(sx + 15, 128 - sh2); g.fill(); g.fillStyle = '#ff2630'; g.fillRect(sx + 5, 128 - sh2 + 8, 2, 3); g.fillStyle = sk.spires; } }
  if (sk.wheel) { var wx2 = 380, wy2 = 70, wr = 34; g.strokeStyle = sk.wheel; g.lineWidth = 2; g.beginPath(); g.arc(wx2, wy2, wr, 0, 6.3); g.stroke(); for (var a = 0; a < 12; a++) { g.beginPath(); g.moveTo(wx2, wy2); g.lineTo(wx2 + Math.cos(a / 12 * 6.28) * wr, wy2 + Math.sin(a / 12 * 6.28) * wr); g.stroke(); } g.beginPath(); g.moveTo(wx2 - 20, 128); g.lineTo(wx2, wy2); g.lineTo(wx2 + 20, 128); g.stroke(); }
  if (sk.nado) { g.fillStyle = sk.nado; for (var y = 20; y < 128; y += 2) { var ww = 4 + (128 - y) * 0.18, ox = 120 + Math.sin(y * 0.08) * 6; g.fillRect(ox - ww, y, ww * 2, 2); } }
  g.fillStyle = sk.grad[0][1]; g.fillRect(0, 0, 512, 2); // a clean top row: the sky above the picture is stretched from it
  var big = document.createElement('canvas'); big.width = 1024; big.height = 256; var bg = big.getContext('2d'); bg.imageSmoothingEnabled = true; bg.drawImage(c, 0, 0, 1024, 256);
  if (sk.glow) { var gr2 = bg.createLinearGradient(0, 150, 0, 256); gr2.addColorStop(0, 'rgba(0,0,0,0)'); gr2.addColorStop(1, sk.glow); bg.fillStyle = gr2; bg.fillRect(0, 150, 1024, 106); }
  return big;
}
