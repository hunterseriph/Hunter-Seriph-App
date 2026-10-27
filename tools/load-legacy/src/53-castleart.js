/* =====================================================================================================
   THE CASTLES' LOOKS: stone for each area, the backdrops, and the new things foes and bosses throw.
   Blumhead's Castle is black, violet and sick red. Greebo's Grotto is cream, caramel and cherry, still
   with dark outlines so it sits with the rest of the game.
   ===================================================================================================== */

/* ---------- backdrops ---------- */
function castleBack(a, gx, A) {
  if (a === 'bkeep') { wallBack(gx, A); keepBack(gx); }
  else if (a === 'bspire') { outdoorSky(gx, false); spireBack(gx); }
  else if (a === 'bcrypt') { wallBack(gx, A); cryptBack(gx); }
  else if (a === 'bgarden') { // no city out here: just the red sky, the moon and the dead trees
    var sg = ctx.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, '#0a0206'); sg.addColorStop(0.55, '#3a0a0e'); sg.addColorStop(1, '#2a2a0a'); ctx.fillStyle = sg; ctx.fillRect(0, 0, VW, VH);
    for (var st = 0; st < 30; st++) R(ctx, '#a6968f', Math.round(((st * 89 - gx * 0.03) % VW + VW) % VW), (st * 37) % 120, 1, 1);
    moon(Math.round(VW * 0.7 - gx * 0.02), 52, 26); if (ok(imgs.clouds)) tileRepeat(imgs.clouds, 0.1, 4, 0.5, gx + G.t * 5, 1); gardenBack(gx); }
  else if (a === 'gkitchen') { wallBack(gx, A); kitchenBack(gx); }
  else if (a === 'gtower') { wallBack(gx, A); towerBack(gx); }
  else if (a === 'gcellar') { wallBack(gx, A); cellarBack(gx); }
  else if (a === 'gfair') picnicBack(gx);
  else return false;
  if (A.sky) { ctx.fillStyle = A.sky; ctx.fillRect(0, 0, VW, VH); }
  return true;
}
function blumFace(x, y, s, col) { // Blumhead's head, carved or stitched into things
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 14 * s, 12 * s, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 10 * s); ctx.lineTo(x, y - 22 * s); ctx.lineTo(x + 6 * s, y - 10 * s); ctx.fill();
  ctx.fillStyle = '#060206'; ctx.fillRect(Math.round(x - 8 * s), Math.round(y - 4 * s), Math.round(5 * s), Math.round(4 * s)); ctx.fillRect(Math.round(x + 3 * s), Math.round(y - 4 * s), Math.round(5 * s), Math.round(4 * s)); ctx.fillRect(Math.round(x - 7 * s), Math.round(y + 4 * s), Math.round(14 * s), Math.round(2 * s));
}
function keepBack(gx) { // tall windows onto a violet sky, Blumhead's banners between them, cages hanging in the dark
  var sp = 200, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var wx = Math.round(x + 40), wy = 30, n = segN(gx, 0.6, sp, x, x0);
    ctx.fillStyle = '#040204'; ctx.beginPath(); ctx.moveTo(wx - 5, wy + 130); ctx.lineTo(wx - 5, wy + 26); ctx.lineTo(wx + 22, wy - 8); ctx.lineTo(wx + 49, wy + 26); ctx.lineTo(wx + 49, wy + 130); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.moveTo(wx, wy + 126); ctx.lineTo(wx, wy + 28); ctx.lineTo(wx + 22, wy); ctx.lineTo(wx + 44, wy + 28); ctx.lineTo(wx + 44, wy + 126); ctx.clip();
    var g = ctx.createLinearGradient(0, wy, 0, wy + 126); g.addColorStop(0, '#1a0a2a'); g.addColorStop(1, '#4a1a5a'); ctx.fillStyle = g; ctx.fillRect(wx, wy, 44, 126);
    if (G.strike > 0 || (Math.sin(G.t * 0.7 + n * 2.1) > 0.995)) { ctx.fillStyle = 'rgba(220,180,255,0.5)'; ctx.fillRect(wx, wy, 44, 126); }
    ctx.fillStyle = '#c08aff'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(wx + 30, wy + 40, 7, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#040204'; ctx.fillRect(wx + 20, wy, 4, 126); ctx.fillRect(wx, wy + 60, 44, 3); ctx.fillRect(wx, wy + 92, 44, 3); ctx.restore();
    // a banner with his face
    var bx = wx + 110, by = 20; R(ctx, '#060206', bx - 2, by - 2, 34, 84); R(ctx, '#3a0a3a', bx, by, 30, 78); R(ctx, '#5a1a5a', bx, by, 30, 3);
    ctx.fillStyle = '#3a0a3a'; ctx.beginPath(); ctx.moveTo(bx, by + 78); ctx.lineTo(bx + 15, by + 92); ctx.lineTo(bx + 30, by + 78); ctx.fill(); blumFace(bx + 15, by + 40, 0.8, '#7a2a7a');
    // a cage on a chain, every other bay
    if (n % 2 === 0) { var cxg = wx + 170, ch = 40 + (Math.abs(n) * 23) % 40; R(ctx, '#1a141e', cxg, 0, 2, ch); R(ctx, '#0a060c', cxg - 12, ch, 26, 30); R(ctx, '#2a2232', cxg - 11, ch + 1, 24, 28); for (var b = 0; b < 5; b++) R(ctx, '#0a060c', cxg - 9 + b * 5, ch + 1, 2, 28); R(ctx, '#e8dcc0', cxg - 3, ch + 18, 6, 4); }
  }
}
function spireBack(gx) { // black spires with violet windows, and his own tower far off with a light at the top
  var far = 600, fx = VW * 0.7 - (((gx * 0.05) % far) + far) % far; if (fx < -80) fx += far;
  ctx.fillStyle = '#0a0612'; ctx.fillRect(Math.round(fx), 30, 26, VH); ctx.beginPath(); ctx.moveTo(fx - 8, 32); ctx.lineTo(fx + 13, -20); ctx.lineTo(fx + 34, 32); ctx.fill();
  ctx.save(); ctx.shadowColor = '#c08aff'; ctx.shadowBlur = 14; R(ctx, '#c08aff', Math.round(fx + 10), 22, 6, 8); ctx.restore();
  var sp = 130, x0 = -((gx * 0.4) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.4, sp, x, x0), h = 100 + (((n * 53) % 60) + 60) % 60;
    ctx.fillStyle = '#08040e'; ctx.fillRect(bx + 18, VH - h, 34, h); ctx.beginPath(); ctx.moveTo(bx + 10, VH - h); ctx.lineTo(bx + 35, VH - h - 60); ctx.lineTo(bx + 60, VH - h); ctx.fill();
    ctx.fillRect(bx + 8, VH - h + 10, 54, 6); // a parapet
    for (var w = 0; w < 3; w++) { var lit = ((n + w) % 3) !== 0; R(ctx, lit ? '#9a7aff' : '#1a1028', bx + 30, VH - h + 24 + w * 22, 8, 10); }
  }
  // rain
  ctx.fillStyle = 'rgba(180,160,255,0.35)'; for (var i = 0; i < 40; i++) { var rx = ((i * 53 + G.t * 60 - gx * 0.2) % VW + VW) % VW, ry = (G.t * 260 + i * 37) % VH; ctx.fillRect(Math.round(rx), Math.round(ry), 1, 6); }
}
function cryptBack(gx) { // rows of burial niches with skulls, and a candle here and there
  var sp = 120, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.6, sp, x, x0);
    for (var row = 0; row < 3; row++) for (var col = 0; col < 2; col++) {
      var nx = bx + 16 + col * 48, ny = 30 + row * 60; R(ctx, '#040306', nx, ny, 38, 26); ctx.fillStyle = '#040306'; ctx.beginPath(); ctx.arc(nx + 19, ny, 19, Math.PI, 0); ctx.fill();
      var k = (Math.abs(n * 7 + row * 3 + col) % 4);
      if (k === 0) { R(ctx, '#3a3640', nx + 12, ny + 10, 14, 12); R(ctx, '#040306', nx + 14, ny + 13, 4, 4); R(ctx, '#040306', nx + 20, ny + 13, 4, 4); R(ctx, '#2a2830', nx + 14, ny + 19, 10, 3); }
      else if (k === 1) { R(ctx, '#2a2632', nx + 4, ny + 18, 30, 8); R(ctx, '#3a3640', nx + 4, ny + 18, 30, 2); }
      else if (k === 2) { var fl = Math.floor(G.t * 8 + n + row) % 2; R(ctx, '#c8b898', nx + 17, ny + 14, 4, 10); R(ctx, '#ff9a40', nx + 18, ny + 9 - fl, 2, 4); ctx.fillStyle = 'rgba(255,160,60,0.10)'; ctx.beginPath(); ctx.arc(nx + 19, ny + 12, 16, 0, 6.28); ctx.fill(); }
    }
  }
  for (var d = 0; d < 6; d++) { var dx = ((d * 97 + gx * 0.3) % VW + VW) % VW, dy = (G.t * 24 + d * 47) % 160; ctx.fillStyle = 'rgba(150,120,255,0.35)'; ctx.fillRect(Math.round(dx), Math.round(dy), 1, 3); }
}
function gardenBack(gx) { // dead trees, thorn hedges and grave markers, with a sickly green mist
  var sp = 170, x0 = -((gx * 0.3) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.3, sp, x, x0), h = 170 + (((n * 41) % 50) + 50) % 50;
    ctx.strokeStyle = '#060804'; ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(bx + 60, VH); ctx.lineTo(bx + 62, VH - h); ctx.stroke();
    ctx.lineWidth = 4; [[-1, 0.55], [1, 0.7], [-1, 0.85], [1, 0.95]].forEach(function (b, k) { var yy = VH - h * b[1]; ctx.beginPath(); ctx.moveTo(bx + 61, yy); ctx.lineTo(bx + 61 + b[0] * (30 + k * 6), yy - 24); ctx.lineTo(bx + 61 + b[0] * (40 + k * 6), yy - 20); ctx.stroke(); });
    ctx.lineWidth = 1; ctx.lineCap = 'butt';
    if (n % 2) { R(ctx, '#0a0c08', bx + 120, VH - 58, 14, 30); ctx.fillStyle = '#0a0c08'; ctx.beginPath(); ctx.arc(bx + 127, VH - 58, 7, Math.PI, 0); ctx.fill(); }
  }
  var hs = 90, h0 = -((gx * 0.55) % hs) - hs; ctx.fillStyle = '#0a1006';
  for (var hx = h0; hx < VW + hs; hx += hs) { ctx.beginPath(); ctx.moveTo(hx, VH); for (var k2 = 0; k2 <= 9; k2++) ctx.lineTo(hx + k2 * 10, VH - 40 - (k2 % 2 ? 10 : 0) - Math.sin((hx + k2) * 0.3) * 3); ctx.lineTo(hx + hs, VH); ctx.fill(); }
  var mg = ctx.createLinearGradient(0, VH - 80, 0, VH); mg.addColorStop(0, 'rgba(120,180,60,0)'); mg.addColorStop(1, 'rgba(120,180,60,0.18)'); ctx.fillStyle = mg; ctx.fillRect(0, VH - 80, VW, 80);
}
function kitchenBack(gx) { // big ovens glowing, shelves of pies, pans hanging on hooks, a chalk menu
  var sp = 230, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.6, sp, x, x0), gl = 0.6 + Math.sin(G.t * 3 + n) * 0.15;
    // an oven
    R(ctx, '#140a06', bx + 20, 110, 80, 100); R(ctx, '#3a2a24', bx + 22, 112, 76, 96); R(ctx, '#4a3a34', bx + 22, 112, 76, 3);
    ctx.fillStyle = '#140a06'; ctx.beginPath(); ctx.arc(bx + 60, 150, 26, Math.PI, 0); ctx.fill(); ctx.fillRect(bx + 34, 150, 52, 30);
    ctx.fillStyle = 'rgba(255,140,40,' + gl.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(bx + 60, 152, 22, Math.PI, 0); ctx.fill(); ctx.fillRect(bx + 38, 152, 44, 26);
    for (var f = 0; f < 4; f++) R(ctx, '#ffe36a', bx + 44 + f * 10, 170 - Math.floor((G.t * 10 + f * 3) % 6), 3, 6);
    // shelves of pies
    R(ctx, '#2a1408', bx + 120, 60, 90, 4); R(ctx, '#2a1408', bx + 120, 100, 90, 4);
    for (var p = 0; p < 4; p++) { var px = bx + 126 + p * 21; R(ctx, '#12040a', px, 52, 16, 8); R(ctx, '#c8903a', px + 1, 54, 14, 5); R(ctx, '#f1e7d0', px + 1, 52, 14, 3); if ((n + p) % 3 === 0) R(ctx, '#ff2630', px + 6, 50, 3, 3);
      R(ctx, '#12040a', px, 92, 16, 8); R(ctx, '#a8602a', px + 1, 94, 14, 5); R(ctx, '#ffd080', px + 1, 92, 14, 3); }
    // pans
    for (var q = 0; q < 3; q++) { var hx = bx + 130 + q * 26; R(ctx, '#3a3440', hx + 6, 112, 2, 12); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(hx + 7, 132, 10 - q, 0, 6.28); ctx.fill(); ctx.fillStyle = '#5a5060'; ctx.beginPath(); ctx.arc(hx + 7, 132, 8 - q, 0, 6.28); ctx.fill(); }
    if (n % 3 === 0) { R(ctx, '#12040a', bx + 120, 150, 70, 44); R(ctx, '#1e2a1e', bx + 122, 152, 66, 40); text("TODAY", bx + 155, 165, 'center', '#f1e7d0', 5); text('CREAM PIE', bx + 155, 177, 'center', '#ffd080', 4); text('MORE PIE', bx + 155, 187, 'center', '#ffd080', 4); }
  }
}
function towerBack(gx) { // great scratching posts wound with rope, paw prints, cushions and dangling toys
  var sp = 150, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.6, sp, x, x0);
    R(ctx, '#140810', bx + 30, 0, 40, VH); for (var y = 0; y < VH; y += 6) { R(ctx, y % 12 ? '#8a6a48' : '#a8865a', bx + 32, y, 36, 5); R(ctx, '#5a4430', bx + 32, y + 4, 36, 1); }
    for (var s = 0; s < 3; s++) { var sy = 40 + ((n * 31 + s * 57) % 140); R(ctx, '#4a3424', bx + 36 + s * 9, sy, 2, 18); R(ctx, '#4a3424', bx + 39 + s * 9, sy + 2, 2, 16); } // claw marks in the rope
    // a cushion on a shelf
    R(ctx, '#140810', bx + 80, 120, 50, 6); R(ctx, '#5a2a1a', bx + 81, 121, 48, 4); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.ellipse(bx + 105, 114, 22, 8, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = '#c4206a'; ctx.beginPath(); ctx.ellipse(bx + 105, 114, 20, 6, 0, 0, 6.28); ctx.fill(); R(ctx, '#ffe36a', bx + 103, 110, 4, 2);
    // a feather toy on a string
    var sw = Math.sin(G.t * 1.4 + n) * 10; ctx.strokeStyle = '#a6968f'; ctx.beginPath(); ctx.moveTo(bx + 110, 0); ctx.lineTo(bx + 110 + sw, 60); ctx.stroke(); R(ctx, '#ff9ad0', Math.round(bx + 107 + sw), 60, 6, 12); R(ctx, '#9adfff', Math.round(bx + 109 + sw), 64, 2, 10);
    // paw prints up the wall
    if (n % 2) for (var pw = 0; pw < 4; pw++) { var ppx = bx + 90 + (pw % 2) * 14, ppy = 190 - pw * 20; ctx.fillStyle = 'rgba(241,231,208,0.12)'; ctx.beginPath(); ctx.arc(ppx, ppy, 4, 0, 6.28); ctx.fill(); for (var t = 0; t < 3; t++) { ctx.beginPath(); ctx.arc(ppx - 4 + t * 4, ppy - 6, 1.6, 0, 6.28); ctx.fill(); } }
  }
}
function cellarBack(gx) { // great vats of cream with taps, barrels stacked, cream dribbling down the walls
  var sp = 210, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.6, sp, x, x0);
    R(ctx, '#0a0604', bx + 18, 60, 104, 160); R(ctx, '#4a3424', bx + 20, 62, 100, 156); for (var hb = 0; hb < 4; hb++) R(ctx, '#2a1c12', bx + 20, 80 + hb * 38, 100, 4);
    R(ctx, '#a8865a', bx + 20, 62, 100, 2); R(ctx, '#fff6d8', bx + 26, 58, 88, 6); // cream at the brim
    R(ctx, '#2a2a30', bx + 64, 170, 12, 8); R(ctx, '#5a5a60', bx + 66, 172, 8, 4); var dr = (G.t * 40 + n * 13) % 30; R(ctx, '#fff6d8', bx + 69, 178, 2, Math.round(dr));
    text(n % 2 ? 'NO 7' : 'EXTRA THICK', bx + 70, 125, 'center', '#c8b080', 4);
    for (var b = 0; b < 3; b++) { var bbx = bx + 140 + (b % 2) * 24, bby = 180 - Math.floor(b / 2) * 22; ctx.fillStyle = '#0a0604'; ctx.beginPath(); ctx.ellipse(bbx + 10, bby + 10, 12, 11, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = '#5a3a20'; ctx.beginPath(); ctx.ellipse(bbx + 10, bby + 10, 10, 9, 0, 0, 6.28); ctx.fill(); R(ctx, '#2a1c12', bbx + 1, bby + 9, 18, 2); }
    var wx = bx + 190, wl = 30 + (Math.abs(n) * 17) % 50; R(ctx, 'rgba(255,246,216,0.25)', wx, 0, 3, wl); R(ctx, 'rgba(255,246,216,0.4)', wx - 1, wl, 5, 3);
  }
}
function picnicBack(gx) { // Greebo's big day out: a warm sky, rolling hills, bunting, a hamper the size of a house, and Sir Johnathan asleep on the far hill
  var g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#3a1a3a'); g.addColorStop(0.45, '#c4502a'); g.addColorStop(0.8, '#ffb060'); g.addColorStop(1, '#ffd890'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.shadowColor = '#ffe36a'; ctx.shadowBlur = 20; ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(Math.round(VW * 0.78 - gx * 0.02), 70, 22, 0, 6.28); ctx.fill(); ctx.restore();
  if (ok(imgs.clouds)) { ctx.globalAlpha = 0.35; tileRepeat(imgs.clouds, 0.1, 10, 0.5, gx + G.t * 6, 0.35); ctx.globalAlpha = 1; }
  // the far hill, with a tuxedo cat curled up asleep on top
  var fh = 700, fx = VW * 0.35 - (((gx * 0.08) % fh) + fh) % fh; if (fx < -200) fx += fh;
  ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.ellipse(fx, VH + 20, 220, 110, 0, Math.PI, 0); ctx.fill();
  var cx = fx, cy = VH - 88; ctx.fillStyle = '#100810'; ctx.beginPath(); ctx.ellipse(cx, cy, 30, 15, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 24, cy - 6, 11, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 16, cy - 14); ctx.lineTo(cx + 18, cy - 24); ctx.lineTo(cx + 24, cy - 16); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx + 26, cy - 16); ctx.lineTo(cx + 32, cy - 24); ctx.lineTo(cx + 34, cy - 12); ctx.fill();
  ctx.fillStyle = '#f1e7d0'; ctx.beginPath(); ctx.ellipse(cx + 26, cy - 1, 6, 4, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx + 6, cy + 6, 12, 5, 0, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#100810'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx - 26, cy + 2, 12, -0.4, 2.2); ctx.stroke(); ctx.lineWidth = 1;
  if (Math.floor(G.t * 1.2) % 3) text('Z', Math.round(cx + 38 + Math.sin(G.t) * 3), Math.round(cy - 30 - (G.t * 8) % 12), 'center', '#f1e7d0', 6);
  // nearer hills
  var hs = 260, h0 = -((gx * 0.25) % hs) - hs; ctx.fillStyle = '#3a5a1a';
  for (var hx = h0; hx < VW + hs; hx += hs) { ctx.beginPath(); ctx.ellipse(hx + 130, VH + 30, 170, 90, 0, Math.PI, 0); ctx.fill(); }
  // the hamper and bunting
  var sp = 340, x0 = -((gx * 0.45) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var bx = Math.round(x), n = segN(gx, 0.45, sp, x, x0);
    if (n % 2 === 0) { R(ctx, '#12040a', bx + 60, VH - 92, 120, 92); R(ctx, '#a8703a', bx + 62, VH - 90, 116, 90); for (var w = 0; w < 116; w += 8) R(ctx, '#7a4a20', bx + 62 + w, VH - 90, 3, 90); for (var hh = 0; hh < 90; hh += 10) R(ctx, '#c8904a', bx + 62, VH - 90 + hh, 116, 2);
      R(ctx, '#12040a', bx + 54, VH - 104, 132, 16); R(ctx, '#ff2630', bx + 56, VH - 102, 128, 12); for (var c = 0; c < 128; c += 16) R(ctx, '#f1e7d0', bx + 56 + c, VH - 102, 8, 6), R(ctx, '#f1e7d0', bx + 64 + c, VH - 96, 8, 6); }
    ctx.strokeStyle = '#3a1a0a'; ctx.beginPath(); ctx.moveTo(bx, 30); ctx.quadraticCurveTo(bx + sp / 2, 60, bx + sp, 30); ctx.stroke();
    for (var f = 0; f < 10; f++) { var t = (f + 0.5) / 10, fx2 = bx + t * sp, fy = 30 + 4 * 30 * t * (1 - t) + 1; ctx.fillStyle = ['#ff2630', '#ffe36a', '#f1e7d0', '#9ae05a'][(f + n) % 4]; ctx.beginPath(); ctx.moveTo(fx2 - 6, fy); ctx.lineTo(fx2 + 6, fy); ctx.lineTo(fx2, fy + 12); ctx.fill(); }
  }
  ctx.fillStyle = 'rgba(40,10,0,0.28)'; ctx.fillRect(0, 0, VW, VH); // darker, so the playfield reads
}

/* ---------- things the new foes and bosses throw ---------- */
function drawCastleShot(b, x, y) {
  var k = b.k;
  if (k === 'orb') { ctx.save(); ctx.shadowColor = '#c08aff'; ctx.shadowBlur = 8; ctx.fillStyle = '#2a0a3a'; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 6.28); ctx.fill(); ctx.fillStyle = '#c08aff'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.28); ctx.fill(); ctx.restore(); R(ctx, '#ffffff', x - 1, y - 2, 2, 2); }
  else if (k === 'zap') { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 3, y - 8); ctx.lineTo(x - 3, y - 3); ctx.lineTo(x + 1, y + 4); ctx.stroke(); ctx.strokeStyle = '#c08aff'; ctx.lineWidth = 1; ctx.stroke(); }
  else if (k === 'thorn' || k === 'seed') { ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 10); R(ctx, '#12040a', -5, -3, 10, 6); R(ctx, k === 'seed' ? '#7a5a2a' : '#3a5a1a', -4, -2, 8, 4); R(ctx, '#c8b898', 3, -1, 4, 2); R(ctx, '#c8b898', -7, -1, 4, 2); ctx.restore(); }
  else if (k === 'cork') { ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 14); R(ctx, '#12040a', -5, -4, 10, 8); R(ctx, '#c8904a', -4, -3, 8, 6); R(ctx, '#e8b870', -4, -3, 8, 2); ctx.restore(); }
  else if (k === 'feather') { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(b.vy, b.vx)); R(ctx, '#12040a', -8, -2, 16, 4); R(ctx, '#3a2a5a', -7, -1, 14, 2); R(ctx, '#9a7aff', 3, -1, 4, 2); ctx.restore(); }
  else if (k === 'bat') { var fl = Math.floor(G.t * 16) % 2; R(ctx, '#12040a', x - 3, y - 2, 6, 5); R(ctx, '#3a0a14', x - (fl ? 9 : 7), y - (fl ? 3 : 0), 6, 3); R(ctx, '#3a0a14', x + (fl ? 3 : 1), y - (fl ? 3 : 0), 6, 3); R(ctx, '#ff2630', x - 2, y - 1, 1, 1); R(ctx, '#ff2630', x + 1, y - 1, 1, 1); }
  else if (k === 'drop2') { R(ctx, '#12040a', x - 3, y - 5, 6, 9); R(ctx, '#c4121c', x - 2, y - 3, 4, 6); R(ctx, '#ff6a70', x - 1, y - 2, 1, 2); }
  else if (k === 'spore') { R(ctx, '#12040a', x - 3, y - 3, 6, 6); R(ctx, '#9adf5a', x - 2, y - 2, 4, 4); R(ctx, '#e0ffb0', x - 1, y - 1, 1, 1); }
  else if (k === 'cherry') { ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x, y, 6.5, 0, 6.28); ctx.fill(); ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.28); ctx.fill(); R(ctx, '#ff9a9a', x - 2, y - 3, 2, 2); R(ctx, '#3a5a1a', x, y - 10, 2, 5); if (Math.floor(G.t * 12) % 2) R(ctx, '#ffe36a', x + 1, y - 11, 2, 2); }
  else if (k === 'gear') { ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 9); ctx.fillStyle = '#12040a'; for (var t = 0; t < 6; t++) { ctx.rotate(Math.PI / 3); ctx.fillRect(-2, -7, 4, 4); } ctx.beginPath(); ctx.arc(0, 0, 5, 0, 6.28); ctx.fill(); ctx.fillStyle = '#c8a050'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 6.28); ctx.fill(); ctx.fillStyle = '#12040a'; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); }
  else if (k === 'creamglob') { ctx.fillStyle = '#5a4a2a'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.28); ctx.fill(); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.28); ctx.fill(); R(ctx, '#ffffff', x - 2, y - 2, 2, 2); }
  else if (k === 'needle') { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(b.vy, b.vx)); R(ctx, '#12040a', -6, -2, 12, 3); R(ctx, '#ffe36a', -5, -1, 6, 1); R(ctx, '#f1e7d0', 1, -1, 4, 1); ctx.restore(); }
  else if (k === 'claw') { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(b.vy, b.vx)); ctx.strokeStyle = '#12040a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-4, 0, 6, -1, 1); ctx.stroke(); ctx.strokeStyle = '#f1e7d0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
  else if (k === 'hairball' || k === 'fluff') { var r = k === 'fluff' ? 4 : 8; ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, 6.28); ctx.fill(); ctx.fillStyle = '#3a3036'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); for (var h = 0; h < 5; h++) { var a = h * 1.3 + G.t * 3; R(ctx, h % 2 ? '#f1e7d0' : '#6a5a60', Math.round(x + Math.cos(a) * r * 0.6), Math.round(y + Math.sin(a) * r * 0.6), 2, 1); } }
  else return false;
  return true;
}
/* the Picnic's bounce pads are big wobbly cherry jellies */
function drawJellyPad(x, e) {
  var sq = e.sq > 0 ? 0.7 : 1 + Math.sin(G.t * 6 + e.x) * 0.04, h = Math.round(14 * sq), w = Math.round(13 / Math.sqrt(sq));
  ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.ellipse(x, e.y - h / 2, w + 1.5, h / 2 + 1.5, 0, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.ellipse(x, e.y - h / 2, w, h / 2, 0, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#ff4a5a'; ctx.beginPath(); ctx.ellipse(x - 3, e.y - h * 0.65, w * 0.45, h * 0.18, 0, 0, 6.28); ctx.fill(); R(ctx, '#ffd0d8', x - 6, e.y - h + 3, 3, 2);
  R(ctx, '#f1e7d0', x - 3, e.y - h - 3, 6, 4); R(ctx, '#c4121c', x - 1, e.y - h - 6, 3, 3);
}
