/* =====================================================================================================
   TILES AND BACKDROPS. Each zone paints its own 16x16 tile set pixel by pixel (bricks, sewer stone, Ejaculand
   stripes, packed bones, rusted iron, steel plate) with an edge along every top surface, slopes included, and
   a dark outline like the rest of our art. Backdrops are parallax layers: Hunter's own city art for Night City,
   painted silhouettes for the others, each drawn once into a cached layer.
   ===================================================================================================== */
function hexc(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function hash2(x, y, s) { var n = (x * 374761393 + y * 668265263 + (s || 0) * 1442695041) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
var TILESET = null, TILEKEYS = {};
var OUTL = [18, 4, 10];
/* the ground's look inside: returns [r,g,b] for a pixel of the fill at world pixel (wx, wy) */
function fillPix(Z, wx, wy) {
  var p = Z.pal.map(hexc), L = p[0], M = p[1], D = p[2], x = ((wx % 16) + 16) % 16, y = ((wy % 16) + 16) % 16, n = hash2(wx >> 1, wy >> 1, 7);
  var st = Z.fill;
  if (st === 'brick') { var row = Math.floor(wy / 8), off = (row % 2) * 8, bx = ((wx + off) % 16 + 16) % 16, by = ((wy % 8) + 8) % 8;
    if (by === 7 || bx === 15) return D; if (by === 0 || bx === 0) return L; return n < 0.15 ? D : M; }
  if (st === 'sewer') { var r2 = Math.floor(wy / 8), o2 = (r2 % 2) * 6, bx2 = ((wx + o2) % 12 + 12) % 12, by2 = ((wy % 8) + 8) % 8;
    if (by2 === 7 || bx2 === 11) return D; if (n < 0.08) return [120, 150, 90]; if (by2 === 0) return L; return n < 0.3 ? D.map(function (v, i) { return (v + M[i]) >> 1; }) : M; }
  if (st === 'stripe') { var s = (((wx + wy) % 16) + 16) % 16; var base = s < 8 ? L : D; if (s === 0 || s === 8) return [base[0] * 0.6 | 0, base[1] * 0.6 | 0, base[2] * 0.6 | 0]; if (s === 1 || s === 9) return base.map(function (v) { return Math.min(255, v + 30); }); return base; }
  if (st === 'bone') { var cx = Math.floor(wx / 8), cy = Math.floor(wy / 6), h = hash2(cx, cy, 3), lx = ((wx % 8) + 8) % 8, ly = ((wy % 6) + 6) % 6;
    if (h < 0.55) { if (ly >= 2 && ly <= 3 && lx >= 1 && lx <= 6) return lx === 1 || lx === 6 ? M : L; if ((lx <= 1 || lx >= 6) && (ly === 1 || ly === 4)) return L; }
    if (h > 0.9 && lx >= 2 && lx <= 5 && ly >= 1 && ly <= 4) return (lx === 3 || lx === 4) && ly === 2 ? D : L;
    return n < 0.4 ? D : [D[0] + 14, D[1] + 10, D[2] + 8]; }
  if (st === 'metal') { if (y === 0 || x === 0) return L; if (y === 15 || x === 15) return D; if ((x === 3 || x === 12) && (y === 3 || y === 12)) return [210, 160, 110];
    var rust = hash2(wx >> 2, wy >> 2, 9); return rust < 0.25 ? [130, 60, 30] : rust < 0.4 ? D : M; }
  if (st === 'plate') { var px = ((wx % 32) + 32) % 32, py = ((wy % 32) + 32) % 32;
    if (px === 0 || py === 0) return L; if (px === 31 || py === 31) return D; if ((px === 3 || px === 28) && (py === 3 || py === 28)) return [200, 196, 206]; if (py === 16 && px > 6 && px < 26) return [140, 20, 26];
    return n < 0.12 ? D : M; }
  if (st === 'cobble') { var cbx = Math.floor((wx + (Math.floor(wy / 8) % 2) * 4) / 8), cby = Math.floor(wy / 8), lx = ((wx + (Math.floor(wy / 8) % 2) * 4) % 8 + 8) % 8, ly = ((wy % 8) + 8) % 8, hc = hash2(cbx, cby, 21);
    if (lx === 0 || ly === 0) return D; if (lx === 1 && ly === 1) return L; return hc < 0.3 ? L.map(function (v, i) { return (v + M[i]) >> 1; }) : M; }
  if (st === 'concrete') { var cr = hash2(wx >> 1, wy >> 1, 13), yy2 = ((wy % 16) + 16) % 16; if (yy2 === 0) return D; if (yy2 === 1) return L; if (cr < 0.05) return D; if (hash2(wx, wy, 5) < 0.03) return [150, 80, 50]; return cr > 0.9 ? L : M; }
  if (st === 'tar') { var g2 = hash2(wx, wy, 31); return g2 < 0.18 ? L : g2 < 0.4 ? D : M; }
  if (st === 'paving') { var px2 = ((wx % 16) + 16) % 16, py2 = ((wy % 16) + 16) % 16; if (px2 === 0 || py2 === 0) return D; if (px2 === 1 || py2 === 1) return L; return n < 0.1 ? D : M; }
  if (st === 'tile') { var tx = ((wx % 8) + 8) % 8, ty = ((wy % 8) + 8) % 8; if (tx === 7 || ty === 7) return D; var dirt = hash2(wx >> 3, wy >> 2, 3); return dirt < 0.2 ? M.map(function (v) { return v * 0.8 | 0; }) : (tx === 0 && ty === 0 ? [255, 250, 230] : L); }
  if (st === 'checker') { var cx2 = Math.floor(wx / 8), cy2 = Math.floor(wy / 8); return (cx2 + cy2) % 2 ? M : D; }
  if (st === 'wetbrick') { var row2 = Math.floor(wy / 8), off2 = (row2 % 2) * 8, bx3 = ((wx + off2) % 16 + 16) % 16, by3 = ((wy % 8) + 8) % 8; if (by3 === 7 || bx3 === 15) return D; if (hash2(wx >> 2, wy >> 1, 17) < 0.05) return [140, 20, 40]; return by3 === 0 ? L : M; }
  if (st === 'plank') { var pyy = ((wy % 8) + 8) % 8, seg = Math.floor((wx + (Math.floor(wy / 8) % 2) * 8) / 16); if (pyy === 7) return D; if (((wx + (Math.floor(wy / 8) % 2) * 8) % 16 + 16) % 16 === 0) return D; if (hash2(seg, Math.floor(wy / 8), 2) < 0.15 && pyy === 3 && ((wx % 5) === 0)) return D; return pyy === 0 ? L : (hash2(wx >> 3, wy, 7) < 0.2 ? D.map(function (v, i) { return (v + M[i]) >> 1; }) : M); }
  if (st === 'container') { var cxx = ((wx % 8) + 8) % 8; if (cxx === 0) return D; if (cxx === 1) return L; if (hash2(wx >> 2, wy >> 2, 9) < 0.08) return [120, 60, 30]; return M; }
  if (st === 'asphalt') { var a2 = hash2(wx, wy, 41); return a2 < 0.12 ? L : a2 < 0.3 ? D : M; }
  if (st === 'stone') { var sr = Math.floor(wy / 8), so = (sr % 2) * 8, sx = ((wx + so) % 16 + 16) % 16, sy = ((wy % 8) + 8) % 8, hs = hash2(Math.floor((wx + so) / 16), sr, 4);
    if (sy === 7 || sx === 15) return D; if (sy === 0 || sx === 0) return L; if (hs < 0.25 && hash2(wx, wy, 8) < 0.25) return [70, 90, 50]; return hs > 0.7 ? D.map(function (v, i) { return (v + M[i]) >> 1; }) : M; }
  return M;
}
/* the edge along a top surface: depth d pixels below the surface */
function edgePix(Z, wx, d) {
  var e = Z.edge.map(hexc), st = Z.top, x = ((wx % 16) + 16) % 16;
  if (d === 0) return OUTL;
  if (st === 'curb') return d === 1 ? e[0] : d <= 3 ? e[1] : d === 4 ? e[2] : d === 5 ? [140, 20, 26] : null;
  if (st === 'slime') { var drip = hash2(wx >> 1, 0, 5), len = drip < 0.2 ? 8 : drip < 0.5 ? 5 : 3; return d === 1 ? e[0] : d <= len ? (d === len ? e[2] : e[1]) : null; }
  if (st === 'bulbs') { if (d <= 4) { var bulb = x % 8 >= 2 && x % 8 <= 5 && d >= 1 && d <= 3; return bulb ? (d === 1 ? [255, 255, 220] : e[0]) : d === 4 ? e[2] : e[1]; } return null; }
  if (st === 'skulls') { if (d <= 5) { var sk = (x % 8), skull = sk >= 1 && sk <= 6 && d >= 1 && d <= 4; if (skull) return (sk === 2 || sk === 5) && d === 2 ? OUTL : e[0]; return d <= 2 ? e[2] : null; } return null; }
  if (st === 'grate') { if (d <= 4) return d === 1 ? e[0] : (x % 4 === 0 ? OUTL : (d === 4 ? e[2] : e[1])); return null; }
  if (st === 'parapet') { if (d <= 4) return d === 1 ? e[0] : d === 4 ? e[2] : e[1]; return null; }
  if (st === 'platform') { if (d <= 5) { if (d <= 2) return e[0]; var bump = x % 4 < 2; return d === 5 ? e[2] : (bump ? e[1] : e[0]); } return null; }
  if (st === 'plankedge') { if (d <= 3) return d === 1 ? e[0] : e[1]; return null; }
  if (st === 'rim') { if (d <= 3) return d === 1 ? e[0] : (x % 8 === 0 ? OUTL : e[1]); return null; }
  if (st === 'road') { if (d <= 4) return d === 1 ? e[1] : d === 2 && x < 8 ? e[0] : d === 4 ? e[2] : e[1]; return null; }
  if (st === 'moss') { var ml = hash2(wx >> 1, 0, 9) < 0.4 ? 5 : 3; return d === 1 ? e[0] : d <= ml ? (d === ml ? e[2] : e[1]) : null; }
  if (st === 'hazard') { if (d <= 5) { var s2 = (((wx + d) % 8) + 8) % 8; return d === 1 ? [255, 200, 200] : (s2 < 4 ? e[0] : [20, 16, 22]); } return null; }
  return null;
}
/* surface height inside a slope tile at column lx (0..15), -1 if this tile has no top surface of its own */
function surf(ch, lx) {
  switch (ch) {
    case '/': return 15 - lx; case '\\': return lx;
    case 'a': return 15 - (lx >> 1); case 'b': return 7 - (lx >> 1);
    case 'c': return lx >> 1; case 'd': return 8 + (lx >> 1);
  }
  return -1;
}
/* paint every tile kind once for this zone into one canvas strip */
function buildTileset(Z) {
  var kinds = ['k', '#', '#t', 'W', 'Wt', 'X', 'K', 'Z', '/', '\\', 'a', 'b', 'c', 'd', '=', '^', 'v', 'Q', 'Q1', 'D', '_0', '_1', '_2', '_3', '-0', '-1', '-2', '-3'];
  var c = document.createElement('canvas'); c.width = kinds.length * 16; c.height = 16; var g = c.getContext('2d'), im = g.createImageData(c.width, 16), d = im.data;
  function put(x, y, col, a) { if (!col) return; var i = (y * c.width + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = a === undefined ? 255 : a; }
  kinds.forEach(function (k, ti) {
    TILEKEYS[k] = ti; var ox = ti * 16;
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var wx = x + ti * 37, col = null;
      if (k === 'k') { col = fillPix(Z, x, y + 16).map(function (v) { return v * 0.55 | 0; }); if (y === 0 || x === 0) col = col.map(function (v) { return v * 0.78 | 0; }); } // underground: the back wall
      else if (k === '#') col = fillPix(Z, x, y + 16);
      else if (k === '#t') col = edgePix(Z, x, y) || fillPix(Z, x, y + 16);
      else if (k === 'K') { // the deep: rough cave rock, darker than the zone's ground, lumpy stones
        var hh = ((x >> 2) * 73 + (y >> 2) * 151 + ((x + y) >> 3) * 19) % 7; col = fillPix(Z, (x * 3 + 5) % 16, (y * 5 + 3) % 16 + 16).map(function (v) { return v * (0.58 + hh * 0.035) | 0; });
        if ((x % 8 === 0 && y % 6 < 4) || (y % 8 === 0 && (x + 3) % 7 < 5)) col = col.map(function (v) { return v * 0.6 | 0; }); }
      else if (k === 'Z') { // a portcullis: iron bars over the dark
        col = fillPix(Z, x, y + 16).map(function (v) { return v * 0.22 | 0; }); if (x % 5 === 1 || x % 5 === 2) col = x % 5 === 1 ? [106, 90, 96] : [58, 46, 52]; if (y % 8 === 0) col = [74, 62, 68]; if (y % 8 === 0 && x % 5 === 0) col = OUTL; if (y === 15 && x % 5 < 3) col = [200, 190, 196]; }
      else if (k === 'X') { // a cracked wall: the zone's fill, a hard rim, cracks and a lit chip (breaks if you hit it fast)
        col = fillPix(Z, x, y + 16).map(function (v) { return Math.min(255, v * 1.15 + 10) | 0; });
        if (x === 0 || y === 0) col = col.map(function (v) { return Math.min(255, v + 40); }); if (x === 15 || y === 15) col = OUTL;
        var cr = (x + y === 11) || (x - y === 3 && x > 6) || (y === 8 && x > 3 && x < 9) || (x === 5 && y > 8 && y < 14); if (cr) col = OUTL; if (cr && (x + 1 + y) % 4 === 0) col = [255, 227, 106]; }
      else if (k === 'W' || k === 'Wt') { col = fillPix(Z, x, y + 16).map(function (v) { return v * 0.55 | 0; }); if (k === 'Wt' && y < 2) col = y === 0 ? OUTL : hexc(Z.edge[2]); }
      else if ('/\\abcd'.indexOf(k) >= 0) { var s = surf(k, x); if (y >= s) col = edgePix(Z, x, y - s) || fillPix(Z, x, y + 16); }
      else if (k === '=') { if (y < 6) col = y === 0 || y === 5 ? OUTL : y === 1 ? hexc(Z.edge[0]) : (x % 8 === 0 ? OUTL : hexc(Z.edge[1])); if (y === 6 && x % 8 === 3) col = OUTL; }
      else if (k === '^' || k === 'v') { var yy = k === 'v' ? 15 - y : y, sx = x % 8, tip = Math.abs(sx - 3.5); if (yy >= 6 + tip * 2.2) col = yy >= 14 ? [60, 54, 62] : sx < 4 ? [230, 226, 236] : [140, 136, 150]; if (yy >= 6 + tip * 2.2 && (tip > 3)) col = OUTL; }
      else if (k === 'Q' || k === 'Q1') { col = fillPix(Z, x, y + 16).map(function (v) { return v * 0.7 | 0; }); if (y < 4) col = y === 0 ? OUTL : (k === 'Q1' ? [255, 240, 140] : [120, 110, 60]); if (y >= 4 && (x === 4 || x === 11)) col = [60, 60, 70]; }
      else if (k === 'D') { col = y < 3 ? (y === 0 ? OUTL : [230, 40, 50]) : (x === 7 || x === 8 ? OUTL : [70, 66, 76]); if (y >= 3 && x % 5 === 0) col = [40, 38, 46]; }
      else if (k.charAt(0) === '_' || k.charAt(0) === '-') { var f = +k.charAt(1), dir = k.charAt(0) === '_' ? 1 : -1; col = y < 6 ? (y === 0 || y === 5 ? OUTL : ((((x - dir * f * 2) % 8) + 8) % 8 < 4 ? [200, 196, 206] : [90, 86, 98])) : fillPix(Z, x, y + 16); if (y > 6 && y < 14 && (x === 3 || x === 12)) col = [40, 36, 44]; }
      put(ox + x, y, col);
    }
  });
  g.putImageData(im, 0, 0); return c;
}
/* ---------- backdrops ---------- */
var HOGIM = {}; Object.keys(HOGIMG).forEach(function (k) { var i = new Image(); i.src = HOGIMG[k]; HOGIM[k] = i; });
function imgOk(i) { return i && i.complete && i.naturalWidth > 0; }
/* a painted silhouette strip for the zones without photos: cached as a layer, tiled with parallax */
function bgLayer(Z, n, w, h) {
  return KIT.layer('bg_' + Z.id + '_' + n, w, h, function () { // (crisp, see the end)
    var g = KIT.ctx, r = (function () { var s = n * 977 + 13; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
    var dark = n === 0 ? 'rgba(0,0,0,0.55)' : n === 1 ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.9)', id = Z.id;
    g.fillStyle = dark;
    if (id === 'sewer') { // arches, pipes and cream falls
      for (var x = 0; x < w; x += 96) { g.fillRect(x, 40 + n * 20, 16, h); g.beginPath(); g.arc(x + 48, 70 + n * 20, 40, Math.PI, 0); g.lineTo(x + 96, 70 + n * 20); g.lineTo(x + 96, 40 + n * 20); g.lineTo(x, 40 + n * 20); g.fill(); }
      g.fillRect(0, 40 + n * 20 - 12, w, 12);
      if (n === 1) for (var p = 0; p < w; p += 140) { g.fillStyle = 'rgba(241,224,176,0.18)'; g.fillRect(p + 60, 0, 10, h); g.fillStyle = dark; g.fillRect(p + 40, 60, 50, 10); }
      if (n === 2) for (var q = 0; q < w; q += 70) { g.fillRect(q, h - 60, 24, 60); g.fillRect(q, h - 70, 70, 8); }
    } else if (id === 'park') { // the coaster, the ferris wheel, the carousel and tents
      if (n === 0) { g.strokeStyle = 'rgba(196,18,28,0.35)'; g.lineWidth = 2; g.beginPath(); for (var a = 0; a <= w; a += 4) g.lineTo(a, 80 + Math.sin(a / 60) * 40 + Math.sin(a / 23) * 10); g.stroke(); for (var s = 0; s < w; s += 24) { g.fillStyle = dark; g.fillRect(s, 80 + Math.sin(s / 60) * 40 + Math.sin(s / 23) * 10, 2, h); } }
      if (n === 1) for (var fw = 60; fw < w; fw += 260) { g.strokeStyle = 'rgba(0,0,0,0.8)'; g.lineWidth = 3; g.beginPath(); g.arc(fw, 100, 60, 0, 6.3); g.stroke(); for (var sp = 0; sp < 12; sp++) { g.beginPath(); g.moveTo(fw, 100); g.lineTo(fw + Math.cos(sp / 12 * 6.28) * 60, 100 + Math.sin(sp / 12 * 6.28) * 60); g.stroke(); } g.fillStyle = 'rgba(255,40,48,0.5)'; for (var bl = 0; bl < 12; bl++) g.fillRect(fw + Math.cos(bl / 12 * 6.28) * 60 - 2, 100 + Math.sin(bl / 12 * 6.28) * 60 - 2, 4, 4); g.fillStyle = dark; g.fillRect(fw - 40, 100, 6, h); g.fillRect(fw + 34, 100, 6, h); }
      if (n === 2) for (var t = 0; t < w; t += 110) { g.beginPath(); g.moveTo(t, h); g.lineTo(t + 10, h - 50); g.lineTo(t + 40, h - 80); g.lineTo(t + 70, h - 50); g.lineTo(t + 80, h); g.fill(); g.fillStyle = 'rgba(196,18,28,0.6)'; for (var st = 0; st < 4; st++) g.fillRect(t + 14 + st * 16, h - 50, 6, 50); g.fillStyle = dark; }
    } else if (id === 'bone') { // catacomb arches and bone heaps
      for (var x2 = 0; x2 < w; x2 += 120 - n * 20) { var hh = 60 + r() * 60; g.beginPath(); g.moveTo(x2, h); g.lineTo(x2 + 10, h - hh); g.quadraticCurveTo(x2 + 50, h - hh - 50, x2 + 90, h - hh); g.lineTo(x2 + 100, h); g.fill(); }
      if (n === 2) for (var bh = 0; bh < w; bh += 50) { g.beginPath(); g.ellipse(bh + 25, h, 30, 22 + r() * 12, 0, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(241,231,208,0.12)'; g.fillRect(bh + 12, h - 14, 10, 4); g.fillStyle = dark; }
    } else if (id === 'factory') { // chimneys, tanks and pipes, a glow
      if (n === 0) { var gr = g.createLinearGradient(0, h - 80, 0, h); gr.addColorStop(0, 'rgba(255,90,20,0)'); gr.addColorStop(1, 'rgba(255,90,20,0.22)'); g.fillStyle = gr; g.fillRect(0, h - 80, w, 80); g.fillStyle = dark; }
      for (var c = 0; c < w; c += 90 + n * 30) { var ch = 80 + r() * 90; g.fillRect(c, h - ch, 22, ch); g.fillRect(c - 4, h - ch, 30, 8); if (n === 1) { g.beginPath(); g.ellipse(c + 60, h - 40, 30, 40, 0, 0, 6.3); g.fill(); } }
      if (n === 2) { g.fillRect(0, h - 90, w, 8); for (var pp = 0; pp < w; pp += 40) g.fillRect(pp, h - 90, 6, 90); }
    } else if (id === 'brain') { // machinery: gears, girders, warning lights
      for (var gx = 0; gx < w; gx += 130 - n * 25) { var gr2 = 24 + r() * 26, gy = 60 + r() * 120; g.beginPath(); for (var k = 0; k < 24; k++) { var ang = k / 24 * 6.283, rr = gr2 + (k % 2 ? 6 : 0); g.lineTo(gx + Math.cos(ang) * rr, gy + Math.sin(ang) * rr); } g.fill(); }
      for (var gd = 0; gd < w; gd += 64) { g.fillRect(gd, 30 + n * 40, 64, 6); g.beginPath(); g.moveTo(gd, 36 + n * 40); g.lineTo(gd + 32, 66 + n * 40); g.lineTo(gd + 64, 36 + n * 40); g.lineWidth = 3; g.strokeStyle = dark; g.stroke(); }
      if (n === 1) for (var wl = 30; wl < w; wl += 160) { g.fillStyle = 'rgba(255,38,48,0.55)'; g.beginPath(); g.arc(wl, 20, 5, 0, 6.3); g.fill(); g.fillStyle = dark; }
    }
  }, { px: 1, crisp: 1 });
}
