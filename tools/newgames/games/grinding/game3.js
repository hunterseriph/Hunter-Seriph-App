/* =====================================================================================================
   update 129, the looks pass (he said it all looked basic): every floor has its own painted room. Walls
   are drawn in perspective with courses of stone, trim and their own dressing; the floor is real tiles
   (flagstones, cobbles, flesh, iron plates, bone, heart meat) with wear, cracks and stains, shaded where
   it meets the walls; torches burn on the back wall; the HUD sits in framed panels.
   ===================================================================================================== */
function grMix(a, b, k) { function h(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; } var x = h(a), y = h(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * k) + ',' + Math.round(x[1] + (y[1] - x[1]) * k) + ',' + Math.round(x[2] + (y[2] - x[2]) * k) + ')'; }
function grRng(s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
var GRSTYLE = ['slab', 'cobble', 'flesh', 'plate', 'bone', 'heart'];
function roomBack() {
  var fi = run.floor % FLOORS.length, v = ((room.gx || 0) * 7 + (room.gy || 0) * 13) % 4, key = 'grroom' + fi + '_' + v + (room.type === 'boss' ? 'b' : '');
  KIT.blit(KIT.layer(key, W, H, function () { paintRoom(fi, v, room.type === 'boss'); }, { px: 1 }), 0, 0);
  /* torches on the back wall, alive */
  var c = KIT.ctx, t = KIT.t; [IX0 + TS * 2.5, IX0 + IW - TS * 2.5].forEach(function (tx, i) { var ty = RY + 7, fl = Math.sin(t * 13 + i * 2) * 0.5 + Math.sin(t * 7.3 + i) * 0.5, col = fi === 1 ? ['#7dff3a', '#d8ffa0'] : fi === 2 || fi === 5 ? ['#ff4a8a', '#ffd0e0'] : ['#ff8a20', '#ffe36a'];
    c.globalAlpha = 0.1 + fl * 0.02; c.fillStyle = col[0]; c.beginPath(); c.arc(tx, ty + 8, 34 + fl * 2, 0, 6.29); c.fill(); c.globalAlpha = 0.12; c.beginPath(); c.arc(tx, ty + 6, 18 + fl * 2, 0, 6.29); c.fill(); c.globalAlpha = 1;
    R('#12040a', tx - 2, ty + 2, 4, 8); R('#5a4a40', tx - 1, ty + 3, 2, 6); R('#12040a', tx - 4, ty + 1, 8, 2);
    var fh = 6 + Math.round(fl * 1.5); R(col[0], tx - 3, ty - fh + 2, 6, fh); R(col[1], tx - 1, ty - fh + 4, 2, fh - 3); R(col[0], tx - 1 + Math.round(fl), ty - fh, 2, 2); });
}
function paintRoom(fi, v, boss) {
  var F = FLOORS[fi], st = GRSTYLE[fi], rnd = grRng(fi * 977 + v * 131 + 5), c = KIT.ctx, x0 = RX, y0 = RY, x1 = RX + IW + WALL * 2, y1 = RY + IH + WALL * 2, k, i;
  R('#070405', 0, 0, W, H);
  /* the walls: four faces, lit from above */
  var wT = grMix(F.wall, '#ffffff', 0.1), wS = grMix(F.wall, '#000000', 0.22), wB = grMix(F.wall, '#000000', 0.48), dk = grMix(F.wall, '#000000', 0.62), hi = grMix(F.wall, '#ffffff', 0.26);
  function quad(col, pts) { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (var q = 2; q < pts.length; q += 2) c.lineTo(pts[q], pts[q + 1]); c.fill(); }
  R('#12040a', x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  quad(wT, [x0, y0, x1, y0, x1 - WALL, y0 + WALL, x0 + WALL, y0 + WALL]); quad(wB, [x0, y1, x1, y1, x1 - WALL, y1 - WALL, x0 + WALL, y1 - WALL]);
  quad(wS, [x0, y0, x0 + WALL, y0 + WALL, x0 + WALL, y1 - WALL, x0, y1]); quad(wS, [x1, y0, x1 - WALL, y0 + WALL, x1 - WALL, y1 - WALL, x1, y1]);
  /* courses of stone: three rows on each face, joints staggered, following the slope at the corners */
  for (k = 0; k < 3; k++) { var o = k * 6, len = (x1 - x0) - o * 2;
    R(dk, x0 + o, y0 + o + 5, len, 1); R(dk, x0 + o, y1 - o - 6, len, 1); R(dk, x0 + o + 5, y0 + o, 1, (y1 - y0) - o * 2); R(dk, x1 - o - 6, y0 + o, 1, (y1 - y0) - o * 2);
    for (i = x0 + o + (k % 2 ? 9 : 2); i < x1 - o - 2; i += 18) { R(dk, i, y0 + o, 1, 5); R(dk, i + 7, y1 - o - 5, 1, 5); if (rnd() < 0.25) R(hi, i + 2, y0 + o + 1, 5 + Math.floor(rnd() * 6), 1); if (rnd() < 0.12) R(dk, i + 3, y0 + o + 2, 3, 2); }
    for (i = y0 + o + (k % 2 ? 9 : 2); i < y1 - o - 2; i += 18) { R(dk, x0 + o, i, 5, 1); R(dk, x1 - o - 5, i + 7, 5, 1); } }
  c.strokeStyle = '#12040a'; c.lineWidth = 1; [[x0, y0, x0 + WALL, y0 + WALL], [x1, y0, x1 - WALL, y0 + WALL], [x0, y1, x0 + WALL, y1 - WALL], [x1, y1, x1 - WALL, y1 - WALL]].forEach(function (l) { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
  R(hi, x0, y0, x1 - x0, 1); R('#12040a', IX0 - 1, IY0 - 1, IW + 2, 1); R('#12040a', IX0 - 1, IY0 + IH, IW + 2, 1); R('#12040a', IX0 - 1, IY0 - 1, 1, IH + 2); R('#12040a', IX0 + IW, IY0 - 1, 1, IH + 2);
  /* the floor */
  c.save(); c.beginPath(); c.rect(IX0, IY0, IW, IH); c.clip();
  R(F.floor, IX0, IY0, IW, IH);
  var fa = F.floor, fb = F.tile, fl = grMix(F.tile, '#ffffff', 0.09), fd = grMix(F.floor, '#000000', 0.45), fm = grMix(F.floor, F.tile, 0.5), cx, cy, x, y;
  if (st === 'slab' || st === 'bone') { // big flagstones in a running bond, each a little different
    for (cy = 0; cy < ROWS * 2; cy++) for (cx = -1; cx < COLS; cx++) { x = IX0 + cx * TS + (cy % 2 ? TS / 2 : 0); y = IY0 + cy * TS / 2; var sh = rnd(); R(sh < 0.33 ? fa : sh < 0.66 ? fm : fb, x, y, TS, TS / 2); R(fl, x + 1, y + 1, TS - 2, 1); R(fd, x, y + TS / 2 - 1, TS, 1); R(fd, x + TS - 1, y, 1, TS / 2);
      if (rnd() < 0.18) { var px = x + 4 + Math.floor(rnd() * 14), py = y + 3 + Math.floor(rnd() * 6); R(fd, px, py, 4, 1); R(fd, px + 3, py + 1, 3, 1); R(fd, px + 5, py + 2, 1, 2); } // a crack
      if (rnd() < 0.3) R(fl, x + 3 + Math.floor(rnd() * 18), y + 4 + Math.floor(rnd() * 6), 2, 1);
      if (st === 'bone' && rnd() < 0.035) { var bx2 = x + 8, by2 = y + 4; R('#12040a', bx2 - 1, by2 - 1, 9, 7); R('#c8bca0', bx2, by2, 7, 4); R('#c8bca0', bx2 + 1, by2 + 4, 5, 1); R('#12040a', bx2 + 1, by2 + 1, 2, 2); R('#12040a', bx2 + 4, by2 + 1, 2, 2); } } }
  else if (st === 'cobble') { for (cy = 0; cy < IH / 9 + 1; cy++) for (cx = -1; cx < IW / 11 + 1; cx++) { x = IX0 + cx * 11 + (cy % 2 ? 5 : 0) + Math.floor(rnd() * 2); y = IY0 + cy * 9; var s2 = rnd(); c.fillStyle = s2 < 0.4 ? fa : s2 < 0.75 ? fm : fb; c.beginPath(); c.ellipse(x + 5, y + 4, 5, 4, 0, 0, 6.29); c.fill(); R(fl, x + 3, y + 1, 3, 1); if (rnd() < 0.07) { c.fillStyle = 'rgba(125,255,58,0.16)'; c.beginPath(); c.ellipse(x + 5, y + 5, 9 + rnd() * 8, 4 + rnd() * 3, 0, 0, 6.29); c.fill(); R('rgba(200,255,150,0.3)', x + 2, y + 4, 3, 1); } }
    R(fd, IX0, IY0, IW, 1); }
  else if (st === 'flesh' || st === 'heart') { for (i = 0; i < 260; i++) { x = IX0 + rnd() * IW; y = IY0 + rnd() * IH; c.fillStyle = rnd() < 0.5 ? fb : fm; c.beginPath(); c.ellipse(x, y, 5 + rnd() * 9, 3 + rnd() * 5, rnd() * 3, 0, 6.29); c.fill(); }
    c.lineWidth = 1; for (i = 0; i < 16; i++) { x = IX0 + rnd() * IW; y = IY0 + rnd() * IH; c.strokeStyle = st === 'heart' && i % 3 === 0 ? 'rgba(255,227,106,0.35)' : grMix(F.wall, '#ff2630', 0.3); c.beginPath(); c.moveTo(x, y); for (k = 0; k < 6; k++) { x += (rnd() - 0.5) * 34; y += (rnd() - 0.5) * 22; c.lineTo(x, y); } c.stroke(); } // veins
    for (i = 0; i < 40; i++) { x = IX0 + Math.floor(rnd() * (IW - 4)); y = IY0 + Math.floor(rnd() * (IH - 3)); R(fl, x, y, 2, 1); R(fd, x, y + 2, 3, 1); } }
  else if (st === 'plate') { for (cy = 0; cy < ROWS; cy++) for (cx = 0; cx < COLS; cx++) { x = IX0 + cx * TS; y = IY0 + cy * TS; R((cx + cy) % 2 ? fb : fm, x, y, TS, TS); R(fl, x + 1, y + 1, TS - 2, 1); R(fl, x + 1, y + 1, 1, TS - 2); R(fd, x, y + TS - 1, TS, 1); R(fd, x + TS - 1, y, 1, TS);
      [[3, 3], [TS - 5, 3], [3, TS - 5], [TS - 5, TS - 5]].forEach(function (r) { R(fd, x + r[0], y + r[1], 2, 2); R(fl, x + r[0], y + r[1], 1, 1); }); // rivets
      if ((cx + cy) % 2 === 0) for (k = 6; k < TS - 6; k += 4) R(fd, x + k, y + TS - k - 2, 3, 1); // tread
      if (rnd() < 0.08) { R('#ff7a20', x + 5, y + 12, 9, 1); R('#ffe36a', x + 8, y + 12, 3, 1); R('#ff7a20', x + 13, y + 13, 5, 1); } } } // a glowing seam
  /* wear: scuffs, stains, grit; all inside the floor */
  for (i = 0; i < 5; i++) { x = IX0 + rnd() * IW; y = IY0 + rnd() * IH; c.fillStyle = fi === 1 ? 'rgba(40,60,10,0.3)' : 'rgba(40,2,6,0.34)'; c.beginPath(); c.ellipse(x, y, 8 + rnd() * 14, 4 + rnd() * 6, 0, 0, 6.29); c.fill(); c.beginPath(); c.ellipse(x + 12, y + 5, 3, 2, 0, 0, 6.29); c.fill(); }
  for (i = 0; i < 90; i++) R(rnd() < 0.5 ? fd : fl, IX0 + Math.floor(rnd() * IW), IY0 + Math.floor(rnd() * IH), 1, 1);
  if (boss) { c.strokeStyle = 'rgba(196,18,28,0.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(IX0 + IW / 2, IY0 + IH / 2, 70, 46, 0, 0, 6.29); c.stroke(); c.lineWidth = 1; c.beginPath(); c.ellipse(IX0 + IW / 2, IY0 + IH / 2, 62, 40, 0, 0, 6.29); c.stroke(); for (k = 0; k < 5; k++) { var a = k * 1.2566 - 1.57, b2 = a + 2.513; c.beginPath(); c.moveTo(IX0 + IW / 2 + Math.cos(a) * 62, IY0 + IH / 2 + Math.sin(a) * 40); c.lineTo(IX0 + IW / 2 + Math.cos(b2) * 62, IY0 + IH / 2 + Math.sin(b2) * 40); c.stroke(); } } // a ritual ring
  /* where the floor meets the walls: hard bands of shade, deepest under the back wall */
  R('rgba(0,0,0,0.42)', IX0, IY0, IW, 3); R('rgba(0,0,0,0.24)', IX0, IY0 + 3, IW, 4); R('rgba(0,0,0,0.12)', IX0, IY0 + 7, IW, 5);
  R('rgba(0,0,0,0.3)', IX0, IY0, 3, IH); R('rgba(0,0,0,0.14)', IX0 + 3, IY0, 4, IH); R('rgba(0,0,0,0.3)', IX0 + IW - 3, IY0, 3, IH); R('rgba(0,0,0,0.14)', IX0 + IW - 7, IY0, 4, IH); R('rgba(0,0,0,0.2)', IX0, IY0 + IH - 3, IW, 3);
  c.restore();
  /* dressing on the walls, by floor */
  var spots = [IX0 + TS * 0.8, IX0 + TS * 4.6, IX0 + IW - TS * 4.6, IX0 + IW - TS * 0.8];
  spots.forEach(function (sx, n) { var sy = y0 + 3; sx = Math.round(sx);
    if (st === 'slab') { R('#12040a', sx - 1, sy, 3, 3); for (k = 0; k < 4; k++) { R('#8a8490', sx + (k % 2), sy + 3 + k * 3, 2, 2); R('#12040a', sx + (k % 2), sy + 5 + k * 3, 2, 1); } if (n % 2) { R('#12040a', sx - 3, sy + 14, 7, 3); R('#8a8490', sx - 2, sy + 15, 5, 1); } } // chains and a shackle
    else if (st === 'cobble') { c.fillStyle = '#5ac828'; c.fillRect(sx - 4, sy - 1, 9, 3); R('#7dff3a', sx - 3, sy, 6, 1); R('#5ac828', sx - 2, sy + 2, 2, 7 + n * 2); R('#5ac828', sx + 2, sy + 2, 2, 4); R('#b8ff80', sx - 2, sy + 8 + n * 2, 2, 2); } // slime running down
    else if (st === 'flesh' || st === 'heart') { R('#12040a', sx - 5, sy + 2, 11, 9); c.fillStyle = '#f1e7d0'; c.beginPath(); c.ellipse(sx + 0.5, sy + 6.5, 4.5, 3.5, 0, 0, 6.29); c.fill(); R(st === 'heart' ? '#ffe36a' : '#c4121c', sx - 1, sy + 5, 3, 3); R('#12040a', sx, sy + 6, 1, 1); } // an eye in the wall
    else if (st === 'plate') { R('#12040a', sx - 6, sy + 4, 13, 6); R('#8a5a30', sx - 5, sy + 5, 11, 4); R('#c89050', sx - 5, sy + 5, 11, 1); R('#12040a', sx - 1, sy + 3, 3, 8); R('#c4121c', sx, sy + 4, 1, 6); } // a pipe with a valve
    else if (st === 'bone') { R('#12040a', sx - 5, sy + 2, 11, 11); R('#1a1410', sx - 4, sy + 3, 9, 9); R('#c8bca0', sx - 3, sy + 4, 7, 5); R('#c8bca0', sx - 2, sy + 9, 5, 2); R('#12040a', sx - 2, sy + 6, 2, 2); R('#12040a', sx + 1, sy + 6, 2, 2); } }); // a skull in a niche
}
/* the HUD in framed panels, the map in its own box */
drawHud = (function (orig) { return function () {
  var c = KIT.ctx; c.fillStyle = 'rgba(7,4,5,0.72)'; c.fillRect(122, 2, 112, 30); R('#4a1a1c', 122, 2, 112, 1); R('#4a1a1c', 122, 31, 112, 1); R('#4a1a1c', 122, 2, 1, 30); R('#4a1a1c', 233, 2, 1, 30); R('#c4121c', 122, 2, 3, 3); R('#c4121c', 231, 2, 3, 3);
  var seen = run.rooms.list.filter(function (q) { return q.seen; }); if (seen.length) { var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; seen.forEach(function (q) { var x = 436 + (q.gx - 4) * 7 + 18, y = 44 + (q.gy - 4) * 6 + 26; x0 = Math.min(x0, x); x1 = Math.max(x1, x + 7); y0 = Math.min(y0, y); y1 = Math.max(y1, y + 6); });
    c.fillStyle = 'rgba(7,4,5,0.72)'; c.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8); R('#4a1a1c', x0 - 4, y0 - 4, x1 - x0 + 8, 1); R('#4a1a1c', x0 - 4, y1 + 3, x1 - x0 + 8, 1); R('#4a1a1c', x0 - 4, y0 - 4, 1, y1 - y0 + 8); R('#4a1a1c', x1 + 3, y0 - 4, 1, y1 - y0 + 8); }
  orig();
}; })(drawHud);
/* update 131: he said the character stopped moving after a few rooms. One door in ten put him inside a rock or a pit
   (a layout with something right inside that door). The tiles he arrives on, and the ones just in front, are cleared. */
enterRoom = (function (orig) { return function (c, fromDir) {
  orig.apply(this, arguments);
  if (!fromDir || !room || !room.tiles) return;
  var T = room.tiles, into = DV[fromDir], clear = function (x, y) { var cx = Math.floor(x / TS), cy = Math.floor(y / TS); if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS && T[cy][cx]) T[cy][cx] = 0; };
  for (var s = 0; s <= 30; s += 6) { var px = P.x + into[0] * s, py = P.y + into[1] * s; clear(px - 9, py - 9); clear(px + 9, py - 9); clear(px - 9, py + 9); clear(px + 9, py + 9); }
}; })(enterRoom);
