/* =====================================================================================================
   DRAWING: the backdrop, the tiles in view, cream and lava, every thing in the act, Cumhead, the bosses,
   effects, and the HUD (score, time, drops, lives) in the top corner like the old days.
   ===================================================================================================== */
var R = KIT.R, text = KIT.text, spr = KIT.spr, CAM = { x: 0, y: 0 };
function camera(dt) {
  var p = PL, W = KIT.W, H = KIT.H, look = Math.max(-60, Math.min(60, (p.air ? p.vx : p.gsp) * 0.25));
  var tx = p.x - W * 0.42 + look, ty = p.y - H * 0.62;
  if (G.lock) tx = G.lock.cam;
  CAM.x += (tx - CAM.x) * Math.min(1, dt * (G.lock ? 3 : 9)); CAM.y += (ty - CAM.y) * Math.min(1, dt * (p.air ? 5 : 8));
  CAM.x = Math.max(0, Math.min(LV.w * TS - W, CAM.x)); CAM.y = Math.max(0, Math.min(LV.h * TS - H, CAM.y));
  if (G.shake > 0) { G.shake -= dt * 12; }
  G.cam = CAM.x;
}
function drawWorld() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, Z = LV.zone, sh = G.shake > 0 ? (Math.random() - 0.5) * G.shake * 2 : 0, cx = Math.round(CAM.x + sh), cy = Math.round(CAM.y);
  drawBack(g, Z, cx, cy, W, H);
  // tiles
  var c0 = Math.floor(cx / TS), c1 = Math.ceil((cx + W) / TS), r0 = Math.floor(cy / TS), r1 = Math.ceil((cy + H) / TS);
  for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) {
    var ch = T(c, r); if (ch === '.') continue; var x = c * TS - cx, y = r * TS - cy;
    if (ch === '~' || ch === '%' || ch === 'L' || ch === 'l') { drawLiquid(g, ch, x, y, c); continue; }
    var key = ch;
    if (ch === '#') key = isSolid(T(c, r - 1), c, r - 1) || surf(T(c, r - 1), 0) >= 0 ? '#' : '#t';
    else if (ch === 'W') key = T(c, r - 1) === '.' ? 'Wt' : 'W';
    else if (ch === 'Q') key = qOn(c) ? 'Q1' : 'Q';
    else if (ch === 'D') { if (TRAPOPEN[c + ',' + r]) continue; }
    else if (ch === '_' || ch === '-') key = ch + (Math.floor(G.t * 10) % 4);
    var TSET = tilesFor(c, r);
    if (ch !== 'k' && ch !== 'K' && !isSolid(ch, c, r)) { var bk = T(c, r - 1) === 'K' || T(c - 1, r) === 'K' || T(c + 1, r) === 'K' ? 'K' : T(c, r - 1) === 'k' || T(c - 1, r) === 'k' || T(c + 1, r) === 'k' ? 'k' : null; if (bk) g.drawImage(TSET, TILEKEYS[bk] * 16, 0, 16, 16, x, y, 16, 16); }
    var ti = TILEKEYS[key]; if (ti === undefined) continue;
    g.drawImage(TSET, ti * 16, 0, 16, 16, x, y, 16, 16);
  }
  // torches and chains along the walls of caves and tunnels
  (LV.caves || []).forEach(function (q) { if (q.c1 * TS < cx || q.c0 * TS > cx + W) return; for (var c = q.c0 + 4; c < q.c1 - 2; c += 9) { var r0 = null; for (var y = r0 = Math.floor(cy / TS); y < r1 + 2; y++) if (T(c, y) === 'k' && isSolid(T(c, y + 1), c, y + 1)) { r0 = y; break; } if (r0 === null || T(c, r0) !== 'k') continue;
      var x = c * TS + 8 - cx, y0 = r0 * TS - cy - 30, fl = Math.floor(G.t * 10 + c) % 3; R('#12040a', x - 3, y0, 6, 10); R('#5a545c', x - 2, y0 + 1, 4, 8); R('#12040a', x - 4, y0 - 6, 8, 6); R(fl ? '#ff9a30' : '#ffe36a', x - 2, y0 - 9 - fl, 4, 6); R('#ffe36a', x - 1, y0 - 6, 2, 3);
      for (var k = 0; k < 40; k += 2) for (var j = -k; j <= k; j += 4) if (((j + k) / 2) % 2 === 0) R('#3a1a0a', x + j, y0 - 6 + k * 0.9, 1, 1);
      var ch = q.c0 * 7 + c; if (ch % 2) { for (var cl = 0; cl < 5 + ch % 4; cl++) R(cl % 2 ? '#3a343c' : '#22202a', x + 36, y0 - 60 + cl * 6, 3, 5); } } });
  // platforms
  PLATS.forEach(function (q) { if (q.gone) return; var x = Math.round(q.x - cx), y = Math.round(q.y - cy); if (x > W || x + q.w < 0) return;
    if (q.log) { if (distAt(Math.floor(q.x / TS))) spr('hog_barge', x + q.w / 2, y + 16, { sc: q.w / 64 }); else spr('p_logboat', x + q.w / 2, y + 14, { sc: q.w / 60 }); return; }
    if (q.k === 'line') { spr('hog_washline', x + q.w / 2, y + 18, {}); R('#12040a', x - 2, y - 2, 3, 120); R('#12040a', x + q.w, y - 2, 3, 120); return; }
    var dq = distAt(Math.floor(q.x / TS));
    if (dq === 'site') { R('#12040a', x - 1, y - 1, q.w + 2, 10); R('#c43a10', x, y, q.w, 3); R('#c43a10', x, y + 6, q.w, 2); for (var gi = 0; gi < q.w; gi += 8) R('#ff6a3a', x + gi, y + 3, 2, 3); if (q.k === 'movv' || q.k === 'movh') { R('#3a343c', x + q.w / 2 - 1, y - 400, 2, 399); } return; }
    if (dq === 'docks' && q.k === 'crumble') { var sh2 = q.touch > 0 && !q.fall ? Math.round(Math.sin(G.t * 60)) : 0; spr('hog_crate', x + q.w / 2 + sh2, y + 20, { sc: q.w / 20 }); return; }
    var shk = q.touch > 0 && !q.fall ? Math.round(Math.sin(G.t * 60)) : 0;
    var PT = tilesFor(Math.floor(q.x / TS), Math.floor(q.y / TS)); for (var i = 0; i < q.w / 16; i++) g.drawImage(PT, TILEKEYS['='] * 16, 0, 16, 16, x + i * 16 + shk, y, 16, 16);
    if (q.k === 'movv' || q.k === 'movh') { R(q.k === 'movv' ? '#ffe36a' : '#c4121c', x + q.w / 2 - 2, y + 6, 4, 2); } });
  // street furniture, and the lamps' pools of light
  if (LV.props.length) drawProps(g, cx, cy, W, H);
  // things
  ENTS.forEach(function (e) { drawEnt(g, e, cx, cy, W, H); });
  SCAT.forEach(function (d) { if (d.t > 2.6 && Math.floor(d.t * 12) % 2) return; spr('hog_drop', d.x - cx, d.y - cy, {}); });
  bossList().concat([G.boss, G.boss2].filter(function (b) { return b && !b.alive && b.dead > 0; })).forEach(function (b) { drawBoss(b, cx, cy); });
  SHOTS.forEach(function (s) { if (s.delay > 0) return; drawShot(g, s, s.x - cx, s.y - cy); });
  if (PL) drawPlayer(PL, cx, cy);
  FX.forEach(function (f) { drawFx(g, f, f.x - cx, f.y - cy); });
  // dark rooms in the Bone Pit: a light round Cumhead
  if (Z.id === 'bone') { var lx = PL.x - cx, ly = PL.y - 20 - cy, DK = KIT.layer('bonedark', 640, 480, function () { var c = KIT.ctx; [[1, 0.5], [0.62, 0.5], [0.44, 0.26]].forEach(function (q, i) { c.globalCompositeOperation = 'source-over'; if (i === 0) { c.fillStyle = 'rgba(8,5,3,' + q[1] + ')'; c.fillRect(0, 0, 640, 480); } }); c.globalCompositeOperation = 'destination-out'; [[230, 0.3], [170, 0.35], [110, 1]].forEach(function (q) { c.fillStyle = 'rgba(0,0,0,' + q[1] + ')'; c.beginPath(); c.arc(320, 240, q[0], 0, 6.3); c.fill(); }); c.globalCompositeOperation = 'source-over'; }, { px: 1 }); g.drawImage(DK, Math.round(lx - 320), Math.round(ly - 240)); var ex = Math.round(lx - 320), ey = Math.round(ly - 240); g.fillStyle = 'rgba(8,5,3,0.5)'; if (ex > 0) g.fillRect(0, 0, ex, H); if (ex + 640 < W) g.fillRect(ex + 640, 0, W - ex - 640, H); if (ey > 0) g.fillRect(Math.max(0, ex), 0, 640, ey); if (ey + 480 < H) g.fillRect(Math.max(0, ex), ey + 480, 640, H - ey - 480); } // dark rooms: three hard rings of light round him
}
function qOn(c) { for (var i = 0; i < ENTS.length; i++) { var e = ENTS[i]; if (e.k === 'zap' && Math.abs(e.x - (c * TS + 8)) < 30) return e.on || (e.warn && Math.floor(G.t * 16) % 2); } return false; }
function drawBack(g, Z, cx, cy, W, H) {
  skyBands(g, Z.sky, W, H); // hard bands of colour like a Mega Drive sky, not a smooth fade
  var D = bkDrift(cy), vy = Math.round(D * 0.9); // the backdrop drifts a little as you climb, but only so far, so no layer ever shows its bottom edge
  if (Z.id === 'city') {
    if (imgOk(HOGIM.sky)) tile(g, HOGIM.sky, cx * 0.05, vy - 30, H + 40, 1);
    if (imgOk(HOGIM.clouds)) tile(g, HOGIM.clouds, cx * 0.1 + G.t * 6, vy + 6, 64, 1);
    if (imgOk(HOGIM.skyline)) { var SL = imgLayer('skyl', HOGIM.skyline, 130, 0.5), sw = SL.lw, sx = -(((cx * 0.12) % sw) + sw) % sw; for (; sx < W; sx += sw) KIT.blit(SL, sx, vy + H - 200); }
    drawPar(g, 'far', 'city', cx, vy, W, H);
    if (LV.dists && LV.dists.length) { // the far black towers, then each district's own painted street (tools/spermhog/backs/citydist.py: real rooflines, so no flat band under the sky), then the railing
      var far = cityMid('citymid0', 0.12), fx = -(((cx * 0.12) % 960) + 960) % 960, fy = Math.round(D * 0.8) + H - 250; for (; fx < W; fx += 960) KIT.blit(far, fx, fy); downBand(g, far, cx * 0.12, fy, W, H, 36);
      drawDistMid(g, cx, D, W, H); drawZL(g, 'city', 'near', cx, D, W, H); drawAir(g, 'city', cx, cy, W, H); return; }
    [[0.22, 'citymid0', 30], [0.4, 'citymid1', 0]].forEach(function (L) { var mid = cityMid(L[1]), mw = 960, mx = -(((cx * L[0]) % mw) + mw) % mw, my = Math.round(D * (1 + L[0])) + H - 300 + L[2]; for (; mx < W; mx += mw) KIT.blit(mid, mx, my); downBand(g, mid, cx * L[0], my, W, H, 36); });
    return;
  }
  // stars and the moon, then the zone's painted far layer, this district's own scenery, the painted middle and near layers
  g.fillStyle = 'rgba(241,231,208,0.5)'; for (var i = 0; i < 40; i++) { var sx2 = ((i * 97 - cx * 0.03) % W + W) % W, sy = (i * 53) % (H * 0.35); g.fillRect(sx2, sy, 1, 1); }
  if (Z.id === 'park' || Z.id === 'bone') { g.fillStyle = Z.id === 'park' ? '#c4121c' : '#d8ccb0'; g.beginPath(); g.arc(W * 0.78 - cx * 0.02, 34 + D * 0.3, 22, 0, 6.3); g.fill(); if (Z.id === 'park') { g.fillStyle = '#8a0a14'; g.beginPath(); g.arc(W * 0.78 - cx * 0.02 + 6, 30 + D * 0.3, 6, 0, 6.3); g.fill(); } }
  drawZL(g, Z.id, 'far', cx, D, W, H);
  if (LV.dists && LV.dists.length) drawDistMid(g, cx, D, W, H); else drawZL(g, Z.id, 'mid', cx, D, W, H); // every district has its own painted middle layer (he said the whole act looked the same)
  drawZL(g, Z.id, 'near', cx, D, W, H);
  drawAir(g, Z.id, cx, cy, W, H);
}
/* the painted layers (tools/spermhog/backs: real pixel art with outlines and lit edges, his ask: the backdrops were too basic).
   [where its horizon sits on screen, how far it drifts, scroll speed, its horizon row in the picture] */
var HOGBK = {}; Object.keys(typeof HOGBKIMG === 'undefined' ? {} : HOGBKIMG).forEach(function (k) { var i = new Image(); i.src = HOGBKIMG[k]; HOGBK[k] = i; });
var BKCEIL = { sewer: 1, bone: 1 };
var BKF = { far: [0.52, 0.6, 0.1, 140], mid: [0.64, 1.0, 0.24, 170], near: [0.86, 1.6, 0.6, 90] };
function bkDrift(cy) { var base = (LV.sy || 0) - KIT.H * 0.62; return Math.max(-50, Math.min(50, (base - cy) * 0.07)); }
function downBand(g, L, off, y, W, H, band) { // a layer carries on down to the bottom of the screen as itself (its bottom rows repeat), never a black block
  var bot = y + L.lh; if (bot >= H) return; var sc = L.height / L.lh, lw = L.lw, x0 = -((off % lw) + lw) % lw;
  for (var yy = bot; yy < H; yy += band) for (var x = x0; x < W; x += lw) g.drawImage(L, 0, (L.lh - band) * sc, L.width, band * sc, Math.round(x), Math.round(yy), lw, band);
}
function drawDistMid(g, cx, D, W, H) { // tools/spermhog/backs/districts.py: d_<district id>, cut over at a gateway pillar where districts meet
  var ds = LV.dists, F = BKF.mid, left = distAt(Math.floor(cx / TS)), x = 0, gates = [];
  function one(id, x0, x1) { if (x1 <= x0) return; var im = HOGBK['d_' + id]; if (!imgOk(im)) { g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, H); g.clip(); drawZL(g, LV.zone.id, 'mid', cx, D, W, H); g.restore(); return; }
    var L = imgLayer('dm_' + id, im, im.naturalHeight, 0), y = Math.round(H * F[0] + D * F[1] - F[3]); if (typeof HOGBKROOF !== 'undefined' && HOGBKROOF[id]) y = Math.min(y, 0); // an indoor wall never shows its top edge
    var lw = L.lw, mx = -(((cx * F[2]) % lw) + lw) % lw;
    g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, H); g.clip(); for (; mx < W; mx += lw) KIT.blit(L, mx, y); downBand(g, L, cx * F[2], y, W, H, 32); g.restore(); }
  for (var i = 0; i < ds.length; i++) { var bx = Math.round(ds[i].c * TS - cx); if (bx <= 0 || bx >= W) continue; one(left, x, bx); gates.push(bx); left = ds[i].id; x = bx; }
  one(left, x, W); gates.forEach(function (bx) { drawGate(g, bx, H); });
}
function drawZL(g, z, kind, cx, D, W, H) {
  var im = HOGBK[z + '_' + kind]; if (!imgOk(im)) return false;
  var F = BKF[kind], L = imgLayer('zl_' + z + '_' + kind, im, im.naturalHeight, 0), y = Math.round(H * F[0] + D * F[1] - F[3]), lw = L.lw;
  if (kind === 'far' && BKCEIL[z]) y = Math.min(y, -16); // a far layer that is a ceiling (sewer vault, cave roof) never shows its top edge as a band across the screen
  var x0 = -(((cx * F[2]) % lw) + lw) % lw;
  for (var x = x0; x < W; x += lw) KIT.blit(L, x, y);
  downBand(g, L, cx * F[2], y, W, H, 32); return true;
}
function lampCone() { // the lamp's light on the street: a hard-edged cone of dotted warm pixels, the old way to do see-through
  return KIT.layer('lampcone', 80, 64, function () { var c = KIT.ctx; for (var y = 0; y < 64; y++) { var hw = 4 + y * 0.56; for (var x = Math.round(40 - hw); x < 40 + hw; x++) if ((x + y) % 2 === 0 && (y > 4 || (x + y) % 4 === 0)) { c.fillStyle = y > 58 ? '#c87a30' : '#7a4418'; c.fillRect(x, y, 1, 1); } } }, { px: 1 });
}
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function skyBands(g, s, W, H) {
  var L = KIT.layer('sky_' + s.join('') + H, 8, H, function () { var a = hexRgb(s[0]), b = hexRgb(s[1]), c = hexRgb(s[2]), n = 10;
    for (var i = 0; i < n; i++) { var t = i / (n - 1), p = t < 0.6 ? t / 0.6 : (t - 0.6) / 0.4, A = t < 0.6 ? a : b, B = t < 0.6 ? b : c, col = 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(A[k] + (B[k] - A[k]) * p); }).join(',') + ')'; KIT.ctx.fillStyle = col; KIT.ctx.fillRect(0, Math.floor(i * H / n), 8, Math.ceil(H / n) + 1); } }, { px: 1 });
  g.drawImage(L, 0, 0, W, H);
}
/* a picture strip as a solid layer at a set height, darkened by dim (instead of drawing it see-through) */
function imgLayer(key, im, h, dim) { var w = Math.round(im.naturalWidth * h / im.naturalHeight); return KIT.layer(key, w, h, function () { KIT.ctx.drawImage(im, 0, 0, w, h); }, { px: 1, crisp: 1, dim: dim }); }
function tile(g, im, off, y, h, alpha) { var w = im.naturalWidth * h / im.naturalHeight, x = -((off % w) + w) % w; g.globalAlpha = alpha; for (; x < KIT.W; x += w) g.drawImage(im, Math.round(x), Math.round(y), Math.ceil(w), h); g.globalAlpha = 1; }
function drawLiquid(g, ch, x, y, c) {
  var lava = ch === 'L' || ch === 'l', top = ch === '~' || ch === 'L';
  g.fillStyle = lava ? (top ? '#ff5a10' : '#c42a08') : (top ? 'rgba(241,224,176,0.78)' : 'rgba(216,196,150,0.72)');
  if (top) { var wv = Math.sin(G.t * 3 + c * 0.9) * 2; g.fillRect(x, y + 4 + wv, 16, 12 - wv); g.fillStyle = lava ? '#ffd040' : '#fffbe8'; g.fillRect(x, y + 3 + wv, 16, 2); if (lava && Math.random() < 0.02) FX.push({ k: 'bit', x: c * TS + Math.random() * 16, y: (y + CAM.y), vx: 0, vy: -80, t: 0.5, c: '#ffb040' }); }
  else g.fillRect(x, y, 16, 16);
}
function drawEnt(g, e, cx, cy, W, H) {
  var x = e.x - cx, y = e.y - cy; if (!(e.k === 'traffic' || e.k === 'train') && (x < -160 || x > W + 400 || y < -200 || y > H + 220)) return;
  var k = e.k;
  if (TRAPKINDS[k]) { drawTrap(g, e, cx, cy); return; }
  if (SETKINDS[k]) { drawSetpiece(g, e, cx, cy); return; }
  if (k === 'loop') { drawLoop(g, e, cx, cy); return; }
  if (k === 'dsign') return; // he said the level already has a name: districts are never named on screen
  if (k === 'drop') { if (e.alive) spr('hog_drop', x, y - 2 + Math.sin(G.t * 4 + e.x * 0.1) * 1.5, {}); return; }
  if (k === 'foe') { if (!e.alive) return; var F = e.F, fr = F.spr + (Math.floor(e.t * 7) % F.n); if (F.beh === 'pop') { var rs = e.rise || 0, wn = e.warn || 0, gq = KIT.ctx;
      if (wn > 0.05) { var sh = Math.round(Math.sin(G.t * 40) * Math.min(2, wn * 3)), mh = Math.round(3 + wn * 5); // a mound of churned earth heaves up, red light leaks out of the cracks
        gq.fillStyle = '#12040a'; gq.beginPath(); gq.ellipse(x + sh, y - 1, 21, mh + 2, 0, Math.PI, 0); gq.fill(); gq.fillStyle = '#3a2618'; gq.beginPath(); gq.ellipse(x + sh, y, 18, mh, 0, Math.PI, 0); gq.fill();
        gq.fillStyle = '#9a7a54'; gq.fillRect(x - 12 + sh, y - mh, 8, 2); gq.fillRect(x + 3 + sh, y - mh + 1, 8, 2); gq.fillStyle = '#6a4c30'; gq.fillRect(x - 15 + sh, y - 3, 30, 2);
        if (Math.floor(G.t * (6 + wn * 10)) % 2) { gq.fillStyle = '#ff2630'; gq.fillRect(x - 9 + sh, y - 2, 6, 1); gq.fillRect(x - 3 + sh, y - 3, 1, 2); gq.fillRect(x + 2 + sh, y - 2, 8, 1); }
        if (wn > 0.3) { gq.save(); gq.globalCompositeOperation = 'lighter'; gq.fillStyle = 'rgba(255,38,48,' + (0.12 + wn * 0.15).toFixed(2) + ')'; gq.beginPath(); gq.ellipse(x, y - 4, 26, 12, 0, 0, 6.3); gq.fill(); gq.restore(); } }
      var show = Math.max(rs, wn >= 0.5 ? Math.min(0.38, (wn - 0.4) * 0.7) : 0); if (show <= 0.02) return; // fingertips poke out before it grabs
      gq.save(); gq.beginPath(); gq.rect(x - 30, y - 80, 60, 80); gq.clip(); spr(fr, x, y + (1 - show) * 26, { flip: e.dir < 0 }); gq.restore(); return; }
    spr(fr, x, y, { flip: e.dir < 0, sc: e.small ? 0.6 : 1, flash: e.hitT > 0, alpha: F.ghost ? 0.6 + Math.sin(e.t * 3) * 0.3 : 1 }); return; }
  if (k === 'spring') { var sq = e.t > 0 ? 0.5 : 1; R('#12040a', x - 11, y - 6, 22, 6); R('#8a828a', x - 10, y - 5, 20, 4); R(e.pow === 2 ? '#ff2630' : '#ffe36a', x - 11, y - 6 - 10 * sq, 22, 5); R('#12040a', x - 11, y - 6 - 10 * sq, 22, 1); for (var i = 0; i < 3; i++) R('#d0c8d0', x - 6 + i * 5, y - 6 - 10 * sq + 5, 2, 10 * sq - 5); return; }
  if (k === 'dash') { for (var j = 0; j < 3; j++) { var a = (Math.floor(G.t * 8) + j) % 3 === 0; R(a ? '#ffe36a' : '#c4121c', x - 12 + j * 8, y - 3, 6, 3); } return; }
  if (k === 'portal') { if (e.used || gateUsed(e) || chalCount() >= 7) return; drawGateway(g, x, y, G.drops >= 50); return; }
  if (k === 'bumper') { var r = e.t > 0 ? 13 : 11; g.fillStyle = '#12040a'; g.beginPath(); g.arc(x, y - 10, r + 1, 0, 6.3); g.fill(); g.fillStyle = '#c4121c'; g.beginPath(); g.arc(x, y - 10, r, 0, 6.3); g.fill(); g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(x, y - 10, r * 0.55, 0, 6.3); g.fill(); g.fillStyle = '#fffbe8'; g.fillRect(x - 4, y - 16, 3, 3); return; }
  if (k === 'box') { if (!e.alive) { R('#3a343c', x - 10, y - 4, 20, 4); return; } R('#12040a', x - 12, y - 24, 24, 24); R('#8a828a', x - 11, y - 23, 22, 22); R('#3a343c', x - 8, y - 20, 16, 14); spr(ITEMICON[e.item || 'drops'], x, y - 13, { anchor: 'c' }); R('#fffbe8', x - 11, y - 23, 22, 1); return; }
  if (k === 'check') { R('#12040a', x - 2, y - 44, 4, 44); R('#a6968f', x - 1, y - 43, 2, 43); g.fillStyle = e.on ? (Math.floor(G.t * 4) % 2 ? '#ff2630' : '#ffe36a') : '#4a1a1c'; g.beginPath(); g.arc(x, y - 46, 5, 0, 6.3); g.fill(); return; }
  if (k === 'goal') { R('#12040a', x - 2, y - 40, 4, 40); R('#a6968f', x - 1, y - 40, 2, 40); var sp = e.spin > 0 ? Math.cos(G.t * 18) : 1, face = e.hit && (e.spin <= 0 || Math.cos(G.t * 18) > 0) ? 'cumface' : 'f_blum_0'; var w = Math.abs(sp) * 34; R('#12040a', x - w / 2 - 1, y - 76, w + 2, 36); R('#f1e7d0', x - w / 2, y - 75, w, 34); if (w > 8) spr(face, x, y - 58, { anchor: 'c', sc: (face === 'cumface' ? 0.9 : 0.3) * Math.abs(sp) }); return; }
  if (k === 'jet') { R('#12040a', x - 8, y - 6, 16, 6); R('#5a545c', x - 7, y - 5, 14, 4); if (e.warn && Math.floor(G.t * 16) % 2) R('#ff9a30', x - 3, y - 10, 6, 4); if (e.on) for (var f = 0; f < 6; f++) { var fy = y - 8 - f * 9, fw = 10 - f + Math.sin(G.t * 30 + f) * 2; R(f < 2 ? '#fff6d0' : f < 4 ? '#ffb040' : '#ff2630', x - fw / 2, fy - 9, fw, 10); } return; }
  if (k === 'crusher') { var yy = (e.cy || e.y0) - cy; R('#3a343c', x - 2, e.y0 - cy - 100, 4, yy - (e.y0 - cy - 100) - 24); R('#12040a', x - 17, yy - 25, 34, 25); R('#5a545c', x - 16, yy - 24, 32, 20); for (var sk = 0; sk < 4; sk++) { g.fillStyle = '#d0c8d0'; g.beginPath(); g.moveTo(x - 16 + sk * 8, yy - 4); g.lineTo(x - 12 + sk * 8, yy + 2); g.lineTo(x - 8 + sk * 8, yy - 4); g.fill(); } R('#ff2630', x - 4, yy - 18, 8, 3); return; }
  if (k === 'zap') { if (e.on) for (var z = 0; z < 5; z++) { var zx = x - 22 + z * 11 + Math.random() * 4; R('#fff6a0', zx, y - 6 - Math.random() * 10, 2, 8); } return; }
  if (k === 'trap') { if (e.warn && Math.floor(G.t * 12) % 2) R('#ff2630', x - 16, y - 2, 32, 2); return; }
  if (k === 'saw') { var sx = (e.sx || e.x) - cx, sy = (e.sy || e.y - 14) - cy; if (e.vert) R('#3a343c', x - 1, y - 90 - cy + cy, 2, 80); else R('#3a343c', x - 48, y - 15, 96, 2); spr(Math.floor(G.t * 20) % 2 ? 'p_saw1' : 'p_saw0', sx, sy, { anchor: 'c' }); return; }
}
var ITEMICON = { drops: 'hog_drop', shield: 'hog_ishield', shoes: 'hog_ishoes', star: 'hog_istar', life: 'ch_icon0' };
function drawShot(g, s, x, y) {
  if (s.k === 'sperm') { spr('hog_shot', x, y, { anchor: 'c', flip: s.vx < 0 }); return; }
  var col = { pie: '#f1e7d0', dagger: '#d0c8d0', bone: '#f1e7d0', cork: '#c08040', orb: '#c040ff', ember: '#ff9a30', shard: '#ff2630', rock: '#7a6a6a', bubble: '#fffbe8', goo: '#9a4aff', wave: '#ff2630' }[s.k] || '#ff2630';
  if (s.k === 'wave') { R('#12040a', x - 7, y - 14, 14, 14); R(col, x - 6, y - 13, 12, 12); R('#ffe36a', x - 6, y - 13, 12, 3); return; }
  g.fillStyle = '#12040a'; g.beginPath(); g.arc(x, y, 5, 0, 6.3); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, 4, 0, 6.3); g.fill();
}
function drawPlayer(p, cx, cy) {
  if (p.inv > 0 && p.state !== 'dead' && Math.floor(G.t * 20) % 2 === 0) return;
  var x = Math.round(p.x - cx), y = Math.round(p.y - cy), sp = Math.abs(p.air ? p.vx : p.gsp), n;
  n = pName(p, sp); // the frame comes from the character being played (9c-chars.js)
  var ground = !p.air && p.state === 'normal', skid = ground && sp > 140 && ((KIT.held('left') && p.gsp > 0) || (KIT.held('right') && p.gsp < 0));
  var rot = p.loop ? p.rot : !p.air && Math.abs(p.slope) > 0.2 ? Math.atan(p.slope) * 0.6 : 0;
  if (ground && sp >= 115 && !skid) rot += p.face * Math.min(0.12, (sp - 115) / 1400); // leans into it as he speeds up
  if (skid) { rot -= p.face * 0.16; n = pName(p, 60); if (Math.random() < 0.6) FX.push({ k: 'bit', x: p.x + p.face * 6, y: p.y - 2, vx: -p.gsp * 0.2, vy: -30 - Math.random() * 40, t: 0.35, c: '#a6968f' }); }
  // after-images at full pelt (dash pads, springs, shoes)
  p.trail = p.trail || []; if (sp > 300 && p.state === 'normal') { p.trail.unshift({ x: p.x, y: p.y, n: n, r: rot }); if (p.trail.length > 6) p.trail.pop(); } else if (p.trail.length) p.trail.pop();
  for (var ti = p.trail.length - 1; ti >= 1; ti -= 2) { var tr = p.trail[ti]; spr(tr.n, Math.round(tr.x - cx), Math.round(tr.y - cy) + 1, { flip: p.face < 0, rot: tr.r, alpha: 0.22 * (1 - ti / 7), sc: CHR().sc }); }
  // a puff of dust each footfall
  if (ground && sp >= 115) { var step = Math.floor((p.dist || 0) / 30); if (step !== p.lastStep) { p.lastStep = step; FX.push({ k: 'bit', x: p.x - p.face * 6, y: p.y - 1, vx: -p.face * 30, vy: -18, t: 0.28, c: '#7a6a6a' }); } }
  if (G.super) { var gl = g0(); gl.save(); gl.globalCompositeOperation = 'lighter'; var ga = gl.createRadialGradient(x, y - 28, 4, x, y - 28, 46); ga.addColorStop(0, 'rgba(255,220,80,' + (0.35 + 0.1 * Math.sin(G.t * 20)).toFixed(2) + ')'); ga.addColorStop(1, 'rgba(255,160,0,0)'); gl.fillStyle = ga; gl.fillRect(x - 50, y - 80, 100, 100); gl.restore();
    var gf = superImg(n); if (gf) { var gsc = CHR().sc || 1; gl.save(); gl.translate(x, y + 1); if (rot) gl.rotate(rot); if (CHR().flipped ? p.face > 0 : p.face < 0) gl.scale(-1, 1); gl.drawImage(gf, -gf.width * gsc / 2, -gf.height * gsc, gf.width * gsc, gf.height * gsc); gl.restore(); }
    if (Math.random() < 0.5) FX.push({ k: 'bit', x: p.x + (Math.random() - 0.5) * 30, y: p.y - Math.random() * 50, vx: 0, vy: -40, t: 0.4, c: Math.random() < 0.5 ? '#ffe36a' : '#fffbe8' });
  } else spr(n, x, y + 1, { flip: CHR().flipped ? p.face > 0 : p.face < 0, rot: rot, sc: CHR().sc });
  if (p.shield) { var cg = g0(); cg.save(); cg.translate(x, y + 1); if (rot) cg.rotate(rot); KIT.condom(0, 2, 38, 56, G.t); cg.restore(); } // the condom: takes the next hit, turned with him round loops and slopes
  if (G.star > 0 && !G.super) for (var i = 0; i < 4; i++) { var a = G.t * 8 + i * 1.57; R(['#ffe36a', '#ff2630', '#fffbe8', '#9adfff'][i], x + Math.cos(a) * 20 - 2, y - 26 + Math.sin(a) * 26 - 2, 4, 4); }
  if (G.shoes > 0 && sp > 120 && Math.random() < 0.5) FX.push({ k: 'bit', x: p.x - p.face * 8, y: p.y - 4, vx: -p.face * 40, vy: -20, t: 0.3, c: '#ffe36a' });
}
function drawBoss(b, cx, cy) {
  var x = b.x - cx, y = b.y - cy, fr = b.B.spr + (Math.floor(b.fx * 4) % 2), flash = b.hitT > 0.6 || (b.hitT > 0 && Math.floor(b.hitT * 20) % 2);
  if (!b.alive) { if (Math.floor(b.dead * 12) % 2) spr(fr, x, y, { flip: b.dir < 0, flash: true }); return; }
  spr(fr, x, y, { flip: b.dir < 0 && !b.B.fixed, flash: flash });
}
function drawFx(g, f, x, y) {
  if (f.k === 'bit') R(f.c, x - 1, y - 1, 3, 3);
  else if (f.k === 'spark') { R('#fffbe8', x - 1, y - 6, 2, 12); R('#fffbe8', x - 6, y - 1, 12, 2); }
  else if (f.k === 'ring') { g.strokeStyle = 'rgba(255,227,106,' + (f.t * 2).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, (0.5 - f.t) * 60 + 6, 0, 6.3); g.stroke(); }
  else if (f.k === 'score' || f.k === 'item') text(f.s, x, y, { size: 6, align: 'center', col: f.k === 'item' ? '#ffe36a' : '#f1e7d0', outline: true });
  else if (f.k === 'fire') { var h = 6 + Math.sin(G.t * 20 + f.x) * 2; R('#ff2630', x - 4, y - h, 8, h); R('#ffb040', x - 2, y - h + 2, 4, h - 2); if (PL && PL.state === 'normal' && Math.abs(PL.x - f.x) < 8 && Math.abs(PL.y - f.y) < 6) hurt(f.x); }
  else if (f.k === 'warn') { if (Math.floor(f.t * 12) % 2) { R('#ff2630', x - 8, y - 2, 16, 2); } }
  else if (f.k === 'pillar') { R('rgba(241,224,176,0.9)', x - 14, y - 220, 28, 220); R('#fffbe8', x - 6, y - 220, 12, 220); }
  else if (f.k === 'cage') { spr('h_gloop_baby_idle' + (Math.floor(G.t * 4) % 2), x, y - Math.max(0, 3 - f.t) * 20, {}); }
}
/* ---------- the HUD ---------- */
function drawHud() {
  var t = G.time, m = Math.floor(t / 60), s = Math.floor(t % 60), low = G.drops === 0 && Math.floor(G.t * 3) % 2;
  text('SCORE', 10, 8, { size: 8, col: '#ffe36a', outline: true }); text(String(G.score), 66, 8, { size: 8, outline: true });
  text('TIME', 10, 22, { size: 8, col: '#ffe36a', outline: true }); text(m + ':' + (s < 10 ? '0' : '') + s, 66, 22, { size: 8, outline: true });
  text('DROPS', 10, 36, { size: 8, col: low ? '#ff2630' : '#ffe36a', outline: true }); text(String(G.drops), 66, 36, { size: 8, outline: true });
  drawLifeIcon(16, KIT.H - 6); text('x' + G.lives, 28, KIT.H - 16, { size: 8, outline: true });
  var ic = 10; if (PL && PL.shield) { spr('hog_ishield', KIT.W - ic - 10, 14, { anchor: 'c' }); ic += 20; } if (G.shoes > 0) { spr('hog_ishoes', KIT.W - ic - 10, 14, { anchor: 'c' }); ic += 20; } if (G.star > 0) spr('hog_istar', KIT.W - ic - 10, 14, { anchor: 'c' });
  bossList().forEach(function (b, i) { var w = 120; KIT.bar(KIT.W / 2 - w / 2, 10 + i * 10, w, 5, b.hp / b.B.hp, '#ff2630', '#2a0509'); });
  if (G.bossName && bossList().length) text(G.bossName, KIT.W / 2, 22 + (G.boss2 ? 10 : 0), { size: 6, align: 'center', col: '#f1e7d0', outline: true });
  if (G.banner > 0) text(G.bannerTxt, KIT.W / 2, 90, { size: 16, align: 'center', col: '#ff2630', font: 'title', outline: true, alpha: Math.min(1, G.banner * 2) });
}

/* ---------- Night City: being in it, not looking at it ---------- */
/* the tall blocks behind Hunter's street: dark towers, window grids, water towers, aerials with red lights */
function cityMid(id, dim) {
  return KIT.layer(id + (dim ? '_d' : ''), 960, 300, function () {
    var g = KIT.ctx, s = id === 'citymid0' ? 191 : 77; function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    for (var x = -20; x < 960; ) {
      var w = 50 + Math.floor(r() * 70), h = 120 + Math.floor(r() * 170), top = 300 - h;
      g.fillStyle = r() < 0.5 ? '#1e0a10' : '#261016'; g.fillRect(x, top, w, h); g.fillStyle = '#12040a'; g.fillRect(x + w - 4, top, 4, h); g.fillStyle = '#3a141c'; g.fillRect(x, top, w, 2); g.fillRect(x, top, 1, h);
      for (var wy = top + 10; wy < 290; wy += 12) for (var wx = x + 6; wx < x + w - 8; wx += 9) { var q = r(); if (q < 0.18) { g.fillStyle = q < 0.04 ? 'rgba(255,60,60,0.55)' : 'rgba(255,214,120,0.45)'; g.fillRect(wx, wy, 4, 6); } else if (q < 0.5) { g.fillStyle = 'rgba(60,20,26,0.8)'; g.fillRect(wx, wy, 4, 6); } }
      if (r() < 0.35) { g.fillStyle = '#0a0406'; g.fillRect(x + 10, top - 18, 22, 14); g.fillRect(x + 12, top - 4, 3, 4); g.fillRect(x + 27, top - 4, 3, 4); g.beginPath(); g.moveTo(x + 8, top - 18); g.lineTo(x + 21, top - 26); g.lineTo(x + 34, top - 18); g.fill(); }
      else if (r() < 0.5) { g.fillStyle = '#0a0406'; g.fillRect(x + w / 2, top - 30, 2, 30); g.fillStyle = '#ff2630'; g.fillRect(x + w / 2 - 1, top - 32, 4, 3); }
      x += w + Math.floor(r() * 6);
    }
    g.fillStyle = 'rgba(10,3,5,0.2)'; g.fillRect(0, 0, 960, 300);
  }, { px: 1, crisp: 1, dim: dim });
}
function drawProps(g, cx, cy, W, H) {
  LV.props.forEach(function (q) { var x = q.x - cx, y = q.y - cy; if (x < -120 || x > W + 120 || y < -20 || y > H + 260) return;
    if (q.lamp) { var fl = 0.85 + Math.sin(G.t * 9 + q.x) * 0.04 + (hash2(Math.floor(G.t * 8), q.x | 0, 3) < 0.02 ? -0.4 : 0); g.save(); g.globalCompositeOperation = 'lighter';
      g.restore(); var lx2 = q.k === 'hog_lamp2' ? x + 8 : x; if (fl > 0.6) KIT.blit(lampCone(), Math.round(lx2 - 40), Math.round(y - 62)); }
    if (q.shop) { var ff = KIT.SPR[q.shop]; spr(q.shop, x, y + 1, { sc: q.sc }); var nn = SHOPNEON[q.shop]; if (nn && ff) { var ty = y - ff[3] * q.sc - 6; text(nn[0], x, ty - 9, { size: 6, align: 'center', col: nn[2], outline: true }); text(nn[1], x, ty, { size: 6, align: 'center', col: nn[2], outline: true }); } return; }
    spr(q.k, x, y, { flip: q.flip });
  });
}


/* Super Cumhead's golden frames, made once from his own */
var GOLD = {};
function g0() { return KIT.ctx; }
function goldFrame(n) {
  if (GOLD[n]) return GOLD[n]; var f = KIT.SPR[n]; if (!f || !KIT.sheetReady) return null;
  var c = document.createElement('canvas'); c.width = f[2]; c.height = f[3]; var g = c.getContext('2d');
  g.drawImage(KIT.sheet, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]);
  var im = g.getImageData(0, 0, f[2], f[3]), d = im.data;
  for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var l = (d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15) / 255;
    if (l < 0.06) { d[i] = 110; d[i + 1] = 56; d[i + 2] = 8; continue; } // the outline turns deep gold
    d[i] = Math.min(255, 200 + l * 60); d[i + 1] = Math.min(255, 140 + l * 115); d[i + 2] = Math.min(255, 30 + l * 150); }
  g.putImageData(im, 0, 0); return (GOLD[n] = c);
}


/* the way into a special stage: a gothic gateway (two stone pillars, a pointed arch) with a red moon swirl inside and
   the next Cum Chalice hanging in it (he said the gold ring looked too much like Sonic). Grey and still under 50 drops */
function drawGateway(g, x, y, open) {
  var t = G.t, top = y - 78, w = 30;
  function arch(ex, path) { g.beginPath(); g.moveTo(x - w - ex, y); g.lineTo(x - w - ex, top + 34); g.quadraticCurveTo(x - w - ex, top - ex, x, top - 10 - ex * 1.4); g.quadraticCurveTo(x + w + ex, top - ex, x + w + ex, top + 34); g.lineTo(x + w + ex, y); g.closePath(); }
  // the stone frame: outline, stone, then the opening
  g.fillStyle = '#12040a'; arch(9); g.fill(); g.fillStyle = '#3a2a30'; arch(7); g.fill(); g.fillStyle = '#5a464c'; arch(5); g.fill();
  for (var b = 0; b < 7; b++) { g.fillStyle = '#2a1c22'; g.fillRect(x - w - 7, y - 12 - b * 13, 7, 1); g.fillRect(x + w, y - 6 - b * 13, 7, 1); } // stone joints
  g.save(); arch(0); g.clip();
  if (open) { // a red moon swirl: hard rings turning inwards
    var cols = ['#12040a', '#3a0810', '#7a0a14', '#c4121c', '#ff2630', '#7a0a14'], cyv = top + 40;
    for (var r = 70; r > 0; r -= 7) { var k = Math.floor(r / 7 + t * 6) % cols.length; g.fillStyle = cols[k]; g.beginPath(); g.ellipse(x + Math.sin(t * 2 + r * 0.08) * 3, cyv, r * 0.7, r, 0, 0, 6.3); g.fill(); }
  } else { g.fillStyle = '#1a1016'; g.fillRect(x - w, top - 20, w * 2, y - top + 20); g.fillStyle = '#2a2026'; for (var s2 = 0; s2 < 5; s2++) g.fillRect(x - w, top + 6 + s2 * 14, w * 2, 2); }
  g.restore();
  // pillar caps and a little skull keystone
  g.fillStyle = '#12040a'; g.fillRect(x - w - 11, y - 4, 15, 4); g.fillRect(x + w - 4, y - 4, 15, 4); g.fillStyle = '#7a6870'; g.fillRect(x - w - 10, y - 3, 13, 2); g.fillRect(x + w - 3, y - 3, 13, 2);
  g.fillStyle = '#12040a'; g.fillRect(x - 5, top - 16, 10, 9); g.fillStyle = '#f1e7d0'; g.fillRect(x - 4, top - 15, 8, 6); g.fillStyle = '#12040a'; g.fillRect(x - 3, top - 13, 2, 2); g.fillRect(x + 1, top - 13, 2, 2);
  var nx = 0; while (SV.chal[nx] && nx < 6) nx++;
  spr('hog_chal' + nx, x, top + 46 + Math.sin(t * 3) * 3, { sc: 1.6, alpha: open ? 1 : 0.35 });
  if (open && Math.random() < 0.3) FX.push({ k: 'spark', x: x + (Math.random() - 0.5) * 50, y: top + 40 + (Math.random() - 0.5) * 60, t: 0.25 });
  if (!open) text('50', x, top + 66, { size: 8, align: 'center', col: '#ffe36a', outline: true });
}
