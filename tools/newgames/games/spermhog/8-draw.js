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
    var ti = TILEKEYS[key]; if (ti === undefined) continue;
    g.drawImage(TILESET, ti * 16, 0, 16, 16, x, y, 16, 16);
  }
  // platforms
  PLATS.forEach(function (q) { if (q.gone) return; var x = Math.round(q.x - cx), y = Math.round(q.y - cy); if (x > W || x + q.w < 0) return;
    if (q.log) { spr('p_logboat', x + q.w / 2, y + 14, { sc: q.w / 60 }); return; }
    var shk = q.touch > 0 && !q.fall ? Math.round(Math.sin(G.t * 60)) : 0;
    for (var i = 0; i < q.w / 16; i++) g.drawImage(TILESET, TILEKEYS['='] * 16, 0, 16, 16, x + i * 16 + shk, y, 16, 16);
    if (q.k === 'movv' || q.k === 'movh') { R(q.k === 'movv' ? '#ffe36a' : '#c4121c', x + q.w / 2 - 2, y + 6, 4, 2); } });
  // things
  ENTS.forEach(function (e) { drawEnt(g, e, cx, cy, W, H); });
  SCAT.forEach(function (d) { if (d.t > 2.6 && Math.floor(d.t * 12) % 2) return; spr('hog_drop', d.x - cx, d.y - cy, {}); });
  bossList().concat([G.boss, G.boss2].filter(function (b) { return b && !b.alive && b.dead > 0; })).forEach(function (b) { drawBoss(b, cx, cy); });
  SHOTS.forEach(function (s) { if (s.delay > 0) return; drawShot(g, s, s.x - cx, s.y - cy); });
  if (PL) drawPlayer(PL, cx, cy);
  FX.forEach(function (f) { drawFx(g, f, f.x - cx, f.y - cy); });
  // dark rooms in the Bone Pit: a light round Cumhead
  if (Z.id === 'bone') { var lx = PL.x - cx, ly = PL.y - 20 - cy, gr = g.createRadialGradient(lx, ly, 60, lx, ly, 230); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.72)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
}
function qOn(c) { for (var i = 0; i < ENTS.length; i++) { var e = ENTS[i]; if (e.k === 'zap' && Math.abs(e.x - (c * TS + 8)) < 30) return e.on || (e.warn && Math.floor(G.t * 16) % 2); } return false; }
function drawBack(g, Z, cx, cy, W, H) {
  var s = Z.sky, gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, s[0]); gr.addColorStop(0.6, s[1]); gr.addColorStop(1, s[2]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  var vy = Math.round(-cy * 0.08); // the backdrop rises a little as you climb
  if (Z.id === 'city') {
    if (imgOk(HOGIM.sky)) tile(g, HOGIM.sky, cx * 0.05, vy - 30, H + 40, 1);
    if (imgOk(HOGIM.clouds)) tile(g, HOGIM.clouds, cx * 0.12 + G.t * 6, vy + 10, 70, 0.8);
    if (imgOk(HOGIM.skyline)) tile(g, HOGIM.skyline, cx * 0.25, vy + H - 190, 120, 0.85);
    if (imgOk(HOGIM.city)) tile(g, HOGIM.city, cx * 0.45, vy + H - 150, 150, 1);
    return;
  }
  // moon and stars, then three painted layers
  g.fillStyle = 'rgba(241,231,208,0.5)'; for (var i = 0; i < 40; i++) { var sx = ((i * 97 - cx * 0.03) % W + W) % W, sy = (i * 53) % (H * 0.6); g.fillRect(sx, sy, 1, 1); }
  if (Z.id === 'park' || Z.id === 'bone') { g.fillStyle = Z.id === 'park' ? '#c4121c' : '#d8ccb0'; g.beginPath(); g.arc(W * 0.78 - cx * 0.02, 50 + vy * 0.5, 22, 0, 6.3); g.fill(); }
  [0, 1, 2].forEach(function (n) { var Lc = bgLayer(Z, n, 640, 270); var par = [0.15, 0.3, 0.5][n], x = -(((cx * par) % 640) + 640) % 640; for (; x < W; x += 640) KIT.blit(Lc, x, vy * (1 + n * 0.5) + (H - 270)); });
}
function tile(g, im, off, y, h, alpha) { var w = im.naturalWidth * h / im.naturalHeight, x = -((off % w) + w) % w; g.globalAlpha = alpha; for (; x < KIT.W; x += w) g.drawImage(im, Math.round(x), Math.round(y), Math.ceil(w), h); g.globalAlpha = 1; }
function drawLiquid(g, ch, x, y, c) {
  var lava = ch === 'L' || ch === 'l', top = ch === '~' || ch === 'L';
  g.fillStyle = lava ? (top ? '#ff5a10' : '#c42a08') : (top ? 'rgba(241,224,176,0.78)' : 'rgba(216,196,150,0.72)');
  if (top) { var wv = Math.sin(G.t * 3 + c * 0.9) * 2; g.fillRect(x, y + 4 + wv, 16, 12 - wv); g.fillStyle = lava ? '#ffd040' : '#fffbe8'; g.fillRect(x, y + 3 + wv, 16, 2); if (lava && Math.random() < 0.02) FX.push({ k: 'bit', x: c * TS + Math.random() * 16, y: (y + CAM.y), vx: 0, vy: -80, t: 0.5, c: '#ffb040' }); }
  else g.fillRect(x, y, 16, 16);
}
function drawEnt(g, e, cx, cy, W, H) {
  var x = e.x - cx, y = e.y - cy; if (x < -80 || x > W + 80 || y < -120 || y > H + 120) return;
  var k = e.k;
  if (k === 'drop') { if (e.alive) spr('hog_drop', x, y - 2 + Math.sin(G.t * 4 + e.x * 0.1) * 1.5, {}); return; }
  if (k === 'foe') { if (!e.alive) return; var F = e.F, fr = F.spr + (Math.floor(e.t * 7) % F.n); if (F.beh === 'pop') { var rs = e.rise || 0; if (rs <= 0.02) return; spr(fr, x, y + (1 - rs) * 26, { flip: e.dir < 0 }); return; }
    spr(fr, x, y, { flip: e.dir < 0, sc: e.small ? 0.6 : 1, flash: e.hitT > 0, alpha: F.ghost ? 0.6 + Math.sin(e.t * 3) * 0.3 : 1 }); return; }
  if (k === 'spring') { var sq = e.t > 0 ? 0.5 : 1; R('#12040a', x - 11, y - 6, 22, 6); R('#8a828a', x - 10, y - 5, 20, 4); R(e.pow === 2 ? '#ff2630' : '#ffe36a', x - 11, y - 6 - 10 * sq, 22, 5); R('#12040a', x - 11, y - 6 - 10 * sq, 22, 1); for (var i = 0; i < 3; i++) R('#d0c8d0', x - 6 + i * 5, y - 6 - 10 * sq + 5, 2, 10 * sq - 5); return; }
  if (k === 'dash') { for (var j = 0; j < 3; j++) { var a = (Math.floor(G.t * 8) + j) % 3 === 0; R(a ? '#ffe36a' : '#c4121c', x - 12 + j * 8, y - 3, 6, 3); } return; }
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
  if (p.state === 'dead') n = 'ch_death' + (Math.floor(p.deadT * 4) % 2);
  else if (p.state === 'hurt') n = 'ch_hurt0';
  else if (p.atkT > 0) n = 'ch_attack';
  else if (p.air) n = 'ch_jump' + Math.min(3, p.vy < -150 ? 0 : p.vy < 0 ? 1 : p.vy < 200 ? 2 : 3);
  else if (sp < 8) n = 'ch_idle' + (Math.floor(G.t * 6) % 7);
  else if (sp < 150) n = 'ch_walk' + (Math.floor(p.anim) % 9);
  else n = 'ch_run' + (Math.floor(p.anim) % 7);
  var rot = !p.air && Math.abs(p.slope) > 0.2 ? Math.atan(p.slope) * 0.6 : 0;
  spr(n, x, y + 1, { flip: p.face < 0, rot: rot });
  if (p.shield) { var g = KIT.ctx; g.strokeStyle = 'rgba(154,223,255,' + (0.5 + 0.3 * Math.sin(G.t * 8)).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 26, 22, 30, 0, 0, 6.3); g.stroke(); }
  if (G.star > 0) for (var i = 0; i < 4; i++) { var a = G.t * 8 + i * 1.57; R(['#ffe36a', '#ff2630', '#fffbe8', '#9adfff'][i], x + Math.cos(a) * 20 - 2, y - 26 + Math.sin(a) * 26 - 2, 4, 4); }
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
  spr('ch_icon0', 16, KIT.H - 6, { sc: 0.7 }); text('x' + G.lives, 28, KIT.H - 16, { size: 8, outline: true });
  var ic = 10; if (PL && PL.shield) { spr('hog_ishield', KIT.W - ic - 10, 14, { anchor: 'c' }); ic += 20; } if (G.shoes > 0) { spr('hog_ishoes', KIT.W - ic - 10, 14, { anchor: 'c' }); ic += 20; } if (G.star > 0) spr('hog_istar', KIT.W - ic - 10, 14, { anchor: 'c' });
  bossList().forEach(function (b, i) { var w = 120; KIT.bar(KIT.W / 2 - w / 2, 10 + i * 10, w, 5, b.hp / b.B.hp, '#ff2630', '#2a0509'); });
  if (G.bossName && bossList().length) text(G.bossName, KIT.W / 2, 22 + (G.boss2 ? 10 : 0), { size: 6, align: 'center', col: '#f1e7d0', outline: true });
  if (G.banner > 0) text(G.bannerTxt, KIT.W / 2, 90, { size: 16, align: 'center', col: '#ff2630', font: 'title', outline: true, alpha: Math.min(1, G.banner * 2) });
}
