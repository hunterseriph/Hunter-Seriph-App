/* ---------- the floors: one 128px tile per place, painted once into a cached layer and repeated.
   Everything on the floor is keyed to the world (hash of the cell), never to the screen, so it never slides. ---------- */
var TILE = 128;
function hh(x, y, s) { var n = Math.sin(x * 127.1 + y * 311.7 + (s || 0) * 74.7) * 43758.5453; return n - Math.floor(n); }
function wrapH(x, y, s) { return hh(((x % TILE) + TILE) % TILE, ((y % TILE) + TILE) % TILE, s); }
function speck(cols, n, s, sz) { for (var i = 0; i < n; i++) { var x = Math.floor(hh(i, 1, s) * TILE), y = Math.floor(hh(i, 2, s) * TILE); R(cols[i % cols.length], x, y, sz || 1, sz || 1); } }
var PAINT = {
  sewer: function () {
    R('#0a0606', 0, 0, TILE, TILE);
    for (var row = 0; row < 16; row++) for (var c = 0; c < 8; c++) {
      var x = c * 16 + (row % 2) * 8, y = row * 8, v = hh(c, row, 3), col = v < 0.3 ? '#1c0e0e' : v < 0.7 ? '#170b0b' : '#221212';
      R(col, x % TILE, y, 15, 7); if (x % TILE + 15 > TILE) R(col, 0, y, (x % TILE + 15) - TILE, 7);
      R('rgba(255,90,90,0.05)', x % TILE, y, 15, 1);
    }
    for (var i = 0; i < 7; i++) { var px = Math.floor(hh(i, 9, 5) * 112), py = Math.floor(hh(i, 8, 5) * 112); R('rgba(241,224,176,0.06)', px, py, 10 + (i % 3) * 4, 3); R('rgba(241,224,176,0.12)', px + 2, py + 1, 3, 1); }
    speck(['#2a1414', '#050303'], 60, 7);
  },
  park: function () {
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) R((x + y) % 2 ? '#1a0609' : '#0e0405', x * 32, y * 32, 32, 32);
    for (var i = 0; i < 16; i++) { R('rgba(255,38,48,0.06)', (i % 4) * 32, Math.floor(i / 4) * 32, 32, 1); R('rgba(0,0,0,0.25)', (i % 4) * 32, Math.floor(i / 4) * 32 + 31, 32, 1); }
    speck(['#2a0a10', '#06020a', '#3a1016'], 90, 11);
    for (var j = 0; j < 4; j++) { var px = Math.floor(hh(j, 4, 12) * 120), py = Math.floor(hh(j, 5, 12) * 120); R('#4a1218', px, py, 3, 2); }
  },
  bone: function () {
    R('#221a14', 0, 0, TILE, TILE);
    for (var i = 0; i < 26; i++) { var x = Math.floor(hh(i, 1, 21) * TILE), y = Math.floor(hh(i, 2, 21) * TILE), w = 6 + Math.floor(hh(i, 3, 21) * 14); R(i % 2 ? '#2a2018' : '#1c1510', x, y, w, 3 + (i % 3)); }
    for (var j = 0; j < 30; j++) { var x2 = Math.floor(hh(j, 4, 22) * 124), y2 = Math.floor(hh(j, 5, 22) * 124); R('#4a3e30', x2, y2, 2, 2); R('#12100c', x2 + 1, y2 + 2, 2, 1); }
    for (var k = 0; k < 6; k++) { var bx = Math.floor(hh(k, 6, 23) * 116), by = Math.floor(hh(k, 7, 23) * 120); R('#a8987a', bx, by, 7, 2); R('#d8c8a8', bx, by, 2, 2); R('#d8c8a8', bx + 6, by, 2, 2); }
    speck(['#3a2e22', '#0c0806'], 70, 24);
  },
  furnace: function () {
    R('#140a08', 0, 0, TILE, TILE);
    for (var row = 0; row < 4; row++) for (var c = 0; c < 4; c++) { var x = c * 32 + (row % 2) * 16, y = row * 32, v = hh(c, row, 31); R(v < 0.5 ? '#1e100c' : '#1a0d0a', x % TILE, y + 1, 30, 30); if (x % TILE + 30 > TILE) R(v < 0.5 ? '#1e100c' : '#1a0d0a', 0, y + 1, x % TILE + 30 - TILE, 30); R('rgba(255,154,48,0.07)', x % TILE, y + 1, 30, 1); }
    // glowing seams
    for (var i = 0; i < 5; i++) { var sx = Math.floor(hh(i, 1, 33) * TILE), sy = Math.floor(hh(i, 2, 33) * TILE), len = 10 + Math.floor(hh(i, 3, 33) * 24); for (var t = 0; t < len; t++) { var px = (sx + t) % TILE, py = (sy + Math.floor(Math.sin(t * 0.5 + i) * 3) + TILE) % TILE; R(t % 5 ? '#6a1e08' : '#c4501a', px, py, 1, 1); } }
    speck(['#2a1610', '#ff9a30'], 26, 34);
  },
  castle: function () {
    R('#160c0e', 0, 0, TILE, TILE);
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) { var v = hh(x, y, 41); R(v < 0.33 ? '#241a1c' : v < 0.66 ? '#201618' : '#2a1e20', x * 32 + 1, y * 32 + 1, 30, 30); R('rgba(255,255,255,0.04)', x * 32 + 1, y * 32 + 1, 30, 1); R('rgba(0,0,0,0.3)', x * 32 + 1, y * 32 + 30, 30, 1); }
    for (var i = 0; i < 8; i++) { var cx = Math.floor(hh(i, 3, 42) * 120), cy = Math.floor(hh(i, 4, 42) * 120); R('#120a0c', cx, cy, 5, 1); R('#120a0c', cx + 4, cy + 1, 3, 1); }
    speck(['#2e2224', '#0c0608'], 50, 43);
  },
  picnic: function () {
    R('#0e140a', 0, 0, TILE, TILE);
    for (var i = 0; i < 160; i++) { var x = Math.floor(hh(i, 1, 51) * TILE), y = Math.floor(hh(i, 2, 51) * TILE), c = i % 3 === 0 ? '#1e2a12' : i % 3 === 1 ? '#16200e' : '#24321a'; R(c, x, y, 1, 3); R(c, x + 1, y + 1, 1, 2); }
    for (var j = 0; j < 10; j++) { var px = Math.floor(hh(j, 3, 52) * 116), py = Math.floor(hh(j, 4, 52) * 116); R('#0a0e06', px, py, 12, 6); }
    speck(['#2e3e1a', '#060a04'], 40, 53);
  },
  lair: function () {
    R('#1a0614', 0, 0, TILE, TILE);
    for (var i = 0; i < 18; i++) { var x = Math.floor(hh(i, 1, 61) * TILE), y = Math.floor(hh(i, 2, 61) * TILE), r = 6 + Math.floor(hh(i, 3, 61) * 10); for (var a = 0; a < r; a++) R('#220a1c', (x + a) % TILE, (y + Math.floor(Math.sin(a * 0.4) * 2) + TILE) % TILE, 2, r - a > 3 ? 4 : 2); }
    for (var j = 0; j < 6; j++) { var vx = Math.floor(hh(j, 4, 62) * TILE), vy = Math.floor(hh(j, 5, 62) * TILE); for (var t = 0; t < 40; t++) R('#4a0a2a', (vx + t) % TILE, (vy + Math.floor(Math.sin(t * 0.25 + j) * 6) + TILE) % TILE, 1, 1); }
    speck(['#3a0e2a', '#0a0208', '#6a1a4a'], 50, 63);
  },
  moon: function () {
    R('#1e0608', 0, 0, TILE, TILE);
    for (var i = 0; i < 40; i++) { var x = Math.floor(hh(i, 1, 71) * TILE), y = Math.floor(hh(i, 2, 71) * TILE); R(i % 2 ? '#26080a' : '#180406', x, y, 4 + (i % 5), 2 + (i % 3)); }
    for (var k = 0; k < 3; k++) { var cx = 16 + Math.floor(hh(k, 3, 72) * 96), cy = 16 + Math.floor(hh(k, 4, 72) * 96), r = 5 + k * 3;
      for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) { var d = Math.hypot(xx, yy * 1.3); if (d < r) R(d > r - 1.5 ? '#3a0c10' : yy < 0 ? '#120204' : '#160406', cx + xx, cy + yy, 1, 1); } }
    speck(['#3a1014', '#0a0203'], 60, 73);
  }
};
/* what lies about on each floor, by world cell (DECOR names: sprites in the sheet; 'blanket' and so on are drawn here) */
var DECOR = {
  sewer: ['dc_grate', 'p_creampool', 'dc_bones', 'dc_grate', 'p_skulls'], park: ['dc_lamp', 'ticket', 'dc_mush', 'p_tallsign', 'ticket', 'dc_lamp'], bone: ['p_skulls', 'p_ribs', 'dc_grave', 'dc_bones', 'dc_grave'],
  furnace: ['p_crucible', 'p_vent', 'dc_bones', 'p_crucible'], castle: ['dc_pillar', 'p_shrinedry', 'dc_pillar'], picnic: ['blanket', 'dc_flower0', 'dc_flower1', 'dc_flower2', 'dc_anthill', 'dc_mush'],
  lair: ['dc_tent', 'p_walleyeshut', 'dc_tent', 'p_creampool'], moon: ['crater', 'crater', 'p_skulls', 'dc_bones']
};
var DCELL = 150;
function decorAt(cx, cy, st) {
  var out = [], list = DECOR[st.ground], n = hh(cx, cy, 81) < 0.4 ? 1 : hh(cx, cy, 82) < 0.25 ? 2 : 0;
  for (var i = 0; i < n; i++) out.push({ k: list[Math.floor(hh(cx, cy, 83 + i) * list.length)], x: cx * DCELL + 20 + hh(cx, cy, 90 + i) * (DCELL - 40), y: cy * DCELL + 20 + hh(cx, cy, 95 + i) * (DCELL - 40) });
  return out;
}
function drawBlanket(x, y, s) { for (var j = 0; j < 4; j++) for (var i = 0; i < 6; i++) R((i + j) % 2 ? '#c4121c' : '#e8dcc8', x + i * 6 - 18, y + j * 6 - 12, 6, 6); R('rgba(0,0,0,0.25)', x - 18, y + 12, 36, 2); if (s > 0.5) KIT.spr('sv_pie', x + 6, y - 2); }
function drawCrater(x, y, s) { var r = 10 + s * 12; for (var a = 0; a < 3; a++) { KIT.ctx.fillStyle = ['#3a0c10', '#120204', '#1a0507'][a]; KIT.ctx.beginPath(); KIT.ctx.ellipse(Math.round(x), Math.round(y + a), r - a * 2, (r - a * 2) * 0.55, 0, 0, 6.283); KIT.ctx.fill(); } }
function drawGround(cx, cy) {
  var st = run.st, L = KIT.layer('gr_' + st.ground, TILE, TILE, PAINT[st.ground]);
  var x0 = Math.floor(cx / TILE) * TILE, y0 = Math.floor(cy / TILE) * TILE;
  for (var y = y0; y < cy + H + TILE; y += TILE) for (var x = x0; x < cx + KIT.W + TILE; x += TILE) KIT.blit(L, x - cx, y - cy);
  drawStrips(cx, cy);
  // floor dressing
  var a = Math.floor(cx / DCELL) - 1, b = Math.floor(cy / DCELL) - 1, a2 = Math.floor((cx + KIT.W) / DCELL) + 1, b2 = Math.floor((cy + H) / DCELL) + 1;
  for (var gy = b; gy <= b2; gy++) for (var gx = a; gx <= a2; gx++) decorAt(gx, gy, st).forEach(function (d) {
    if (!inBand(d.x, d.y, 30) || (st.ground === 'sewer' && Math.abs(d.y) < 50) || (st.ground === 'castle' && Math.abs(d.x) < 80)) return;
    var sx = d.x - cx, sy = d.y - cy, s = hh(gx, gy, 99);
    if (d.k === 'blanket') drawBlanket(sx, sy, s); else if (d.k === 'ticket') { for (var q = 0; q < 3; q++) { var tx = sx + (hh(gx, gy, 110 + q) - 0.5) * 40, ty = sy + (hh(gx, gy, 120 + q) - 0.5) * 24; R('#12040a', tx - 1, ty - 1, 9, 5); R(q % 2 ? '#c4121c' : '#e8dcc8', tx, ty, 7, 3); R('#12040a', tx + 2, ty + 1, 1, 1); } } else if (d.k === 'crater') drawCrater(sx, sy, s); else KIT.spr(d.k, sx, sy, { flip: s > 0.5 });
  });
}
/* the corridor places: walls along the edges of the band, and the long strips down the middle */
function inBand(x, y, m) { var b = run.st.band; if (!b) return true; m = m || 0; if (b.y) return Math.abs(y) < b.y - m; if (b.x) return Math.abs(x) < b.x - m; return true; }
function drawStrips(cx, cy) {
  var st = run.st, b = st.band, ctx = KIT.ctx, i;
  if (st.ground === 'sewer') {
    // the cream river down the middle of the tunnel
    var ry = -30 - cy; R('#2a1a10', 0, ry - 3, KIT.W, 3); R('#3a2c18', 0, ry, KIT.W, 60); R('#4a3a20', 0, ry + 8, KIT.W, 44);
    for (i = 0; i < 22; i++) { var wx = ((i * 61 - cx - KIT.t * 30) % (KIT.W + 60) + KIT.W + 60) % (KIT.W + 60) - 30, wy = ry + 8 + (i * 17) % 44; R('rgba(241,224,176,0.28)', wx, wy, 10 + (i % 3) * 6, 1); }
    R('#120806', 0, ry + 60, KIT.W, 3);
  }
  if (st.ground === 'castle') { // a long red carpet up the hall
    var rx = -60 - cx; R('#a8741a', rx - 3, 0, 126, H); R('#6a0a10', rx, 0, 120, H); R('#8e0c14', rx + 6, 0, 108, H);
    for (var yy = Math.floor(cy / 40) * 40; yy < cy + H + 40; yy += 40) { var py = yy - cy; R('#c4121c', rx + 56, py, 8, 8); R('#a8741a', rx + 58, py + 2, 4, 4); }
  }
  if (!b) return;
  if (b.y) { // tunnel walls above and below
    [-1, 1].forEach(function (sg) {
      var edge = sg * b.y - cy, top = sg < 0 ? 0 : edge, h = sg < 0 ? edge : H - edge; if (h <= 0) return;
      R('#0e0806', 0, top, KIT.W, h);
      var bandY = sg < 0 ? edge - 40 : edge;
      for (var row = 0; row < 5; row++) for (var c = Math.floor(cx / 24) - 1; c < (cx + KIT.W) / 24 + 1; c++) { var x = c * 24 + (row % 2) * 12 - cx; R(hh(c, row + sg * 9, 4) < 0.5 ? '#2e1e16' : '#281a12', x, bandY + row * 8, 23, 7); }
      R('#4a3020', 0, sg < 0 ? edge - 2 : edge, KIT.W, 2);
      for (var p = Math.floor(cx / 220) - 1; p < (cx + KIT.W) / 220 + 1; p++) { var px = p * 220 + 60 - cx, pyy = sg < 0 ? edge - 30 : edge + 8; R('#3a3a3e', px, pyy, 18, 22); R('#5a545c', px + 2, pyy + 2, 14, 18); R('#12040a', px + 5, sg < 0 ? edge - 8 : edge + 8, 8, 6);
        var dr = (KIT.t * 30 + p * 7) % 26; if (sg < 0) R('#f1e0b0', px + 7, edge - 2 + dr, 3, 4); }
    });
  }
  if (b.x) { // the hall's side walls
    [-1, 1].forEach(function (sg) {
      var edge = sg * b.x - cx, left = sg < 0 ? 0 : edge, w = sg < 0 ? edge : KIT.W - edge; if (w <= 0) return;
      R('#0c0608', left, 0, w, H);
      var bx = sg < 0 ? edge - 36 : edge;
      for (var r = Math.floor(cy / 16) - 1; r < (cy + H) / 16 + 1; r++) for (var c2 = 0; c2 < 3; c2++) { var yy2 = r * 16 - cy; R(hh(r, c2 + sg * 5, 6) < 0.5 ? '#2a1e20' : '#241a1c', bx + c2 * 12 + (r % 2) * 6 - 3, yy2, 11, 15); }
      R('#4a1a1c', sg < 0 ? edge - 2 : edge, 0, 2, H);
      for (var t = Math.floor(cy / 160) - 1; t < (cy + H) / 160 + 1; t++) { var ty = t * 160 + 50 - cy, tx = sg < 0 ? edge - 10 : edge + 4; R('#5a4044', tx, ty, 6, 10); var fl = Math.sin(KIT.t * 12 + t) > 0; R(fl ? '#ffe36a' : '#ff9a30', tx + 1, ty - 6, 4, 6); R('rgba(255,154,48,0.12)', tx - 12, ty - 16, 30, 30); }
    });
  }
}
/* the light falls off at the edges: a cached vignette */
function drawVignette() { // only the edges darken: four cached strips instead of a full-screen layer (a big saving on phones)
  if (KIT.S < 3) return; // the darker edges are a luxury: only at the sharpest resolution
  var WW = KIT.W, c = KIT.ctx, eh = 44, ew = 90;
  var T = KIT.layer('vigT' + WW, WW, eh, function () { var gr = KIT.ctx.createLinearGradient(0, 0, 0, eh); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); KIT.ctx.fillStyle = gr; KIT.ctx.fillRect(0, 0, WW, eh); });
  var Lf = KIT.layer('vigL' + H, ew, H, function () { var gr = KIT.ctx.createLinearGradient(0, 0, ew, 0); gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); KIT.ctx.fillStyle = gr; KIT.ctx.fillRect(0, 0, ew, H); });
  KIT.blit(T, 0, 0); c.save(); c.translate(0, H); c.scale(1, -1); c.drawImage(T, 0, 0, WW, eh); c.restore();
  KIT.blit(Lf, 0, 0); c.save(); c.translate(WW, 0); c.scale(-1, 1); c.drawImage(Lf, 0, 0, ew, H); c.restore();
}
