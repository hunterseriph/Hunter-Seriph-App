/* =====================================================================================================
   DRAWING
   ===================================================================================================== */
var vignette = null;
function buildVignette() {
  vignette = mk(VW * M, VH * M); var g = vignette.getContext('2d'), w = VW * M, h = VH * M;
  var gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.58);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.62)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
function resize() {
  var r = view.getBoundingClientRect(), aspect = r.width / Math.max(1, r.height);
  VW = Math.max(240, Math.min(CW * T, Math.round(VH * aspect)));
  var cssScale = Math.min(r.width / VW, r.height / VH) * (window.devicePixelRatio || 1);
  M = Math.max(1, Math.min(4, Math.ceil(cssScale))); cv.width = VW * M; cv.height = VH * M; buildVignette();
}
window.addEventListener('resize', resize);
function areaNow() { if (G.mode === 'town') return null; if (L && L.arena) return BOSSDEF[L.arena].area; return G.rm ? G.rm.area : 'castle'; }
function TH() { var a = areaNow(); return a ? AREAS[a] : { e1: '#ff3a44', e2: '#7a0a12', tint: null, sky: null }; }
function text(str, x, y, align, col, size) {
  ctx.font = (size || 8) + 'px "Press Start 2P", monospace'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#000'; ctx.fillText(str, x + 1, y + 1); ctx.fillStyle = col || '#f1e7d0'; ctx.fillText(str, x, y);
}
function tileMirror(img, par, y, scale, off) {
  var w = img.naturalWidth * scale, h = img.naturalHeight * scale, x0 = -(((off * par) % (w * 2)) + w * 2) % (w * 2);
  for (var x = x0; x < VW + w; x += w) { var i = Math.round((x - x0) / w); if (i % 2 === 0) ctx.drawImage(img, x, y, w, h); else { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); ctx.restore(); } }
}
function tileRepeat(img, par, y, scale, off, alpha) {
  var w = img.naturalWidth * scale, h = img.naturalHeight * scale, x0 = -(((off * par) % w) + w) % w;
  if (alpha !== undefined) ctx.globalAlpha = alpha; for (var x = x0 - w; x < VW + w; x += w) ctx.drawImage(img, x, y, w, h); ctx.globalAlpha = 1;
}
function moon(x, y, r) {
  var mg = ctx.createRadialGradient(x, y, 2, x, y, r); mg.addColorStop(0, '#d8141f'); mg.addColorStop(0.8, '#8e0c14'); mg.addColorStop(1, '#5a070c');
  ctx.save(); ctx.shadowColor = 'rgba(255,30,40,0.7)'; ctx.shadowBlur = 24; ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); ctx.restore();
}
function outdoorSky(gx, city) {
  if (ok(imgs.sky)) tileMirror(imgs.sky, 0.06, 0, 216 / imgs.sky.naturalHeight, gx); else { ctx.fillStyle = '#1a0507'; ctx.fillRect(0, 0, VW, VH); }
  moon(70 - (gx * 0.02) % 40, 46, 22);
  if (ok(imgs.clouds)) { tileRepeat(imgs.clouds, 0.1, 4, 0.5, gx + G.t * 5, 1); tileRepeat(imgs.clouds, 0.18, 34, 0.5, 260 + gx + G.t * 9, 0.85); }
  if (G.flash > 0) { ctx.fillStyle = 'rgba(255,50,60,' + (G.flash / 0.16 * 0.26).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (ok(imgs.skyline)) tileRepeat(imgs.skyline, 0.28, 224 - imgs.skyline.naturalHeight / 2, 0.5, gx, 1);
  if (city && ok(imgs.city)) { var ch = imgs.city.naturalHeight / 2, cw = imgs.city.naturalWidth / 2, x = -((gx * 0.5) % cw); ctx.drawImage(imgs.city, Math.round(x), 228 - ch, cw, ch); ctx.drawImage(imgs.city, Math.round(x + cw), 228 - ch, cw, ch); }
}
var BGPAT = {};
function bgPattern(a) { // the far wall: big dim blocks with bevels, pre-drawn once per area
  if (BGPAT[a]) return BGPAT[a];
  var S = STONE[a] || STONE.castle, w = 96, h = 48, c = mk(w, h), g = c.getContext('2d'), j, i;
  g.fillStyle = S.m; g.fillRect(0, 0, w, h);
  for (j = 0; j < 3; j++) for (i = -1; i < 5; i++) {
    var bx = i * 24 + (j % 2 ? 12 : 0), by = j * 16, hv = hsh(i + 20, j + 40, 5);
    g.fillStyle = S.c[Math.floor(hv * 4)]; g.fillRect(bx + 1, by + 1, 22, 14);
    g.fillStyle = S.hi; g.fillRect(bx + 1, by + 1, 22, 1); g.fillRect(bx + 1, by + 1, 1, 14);
    g.fillStyle = S.lo; g.fillRect(bx + 1, by + 14, 22, 1); g.fillRect(bx + 22, by + 1, 1, 14);
    if (hv > 0.9) { g.fillStyle = S.lo; g.fillRect(bx + 8, by + 4, 1, 3); g.fillRect(bx + 9, by + 7, 1, 2); }
  }
  return (BGPAT[a] = c);
}
function wallBack(gx, A) {
  ctx.fillStyle = A.wall; ctx.fillRect(0, 0, VW, VH);
  var p = bgPattern(areaNow()), x0 = -((gx * 0.5) % p.width) - p.width;
  ctx.globalAlpha = 0.32; for (var x = x0; x < VW + p.width; x += p.width) for (var y = 0; y < VH; y += p.height) ctx.drawImage(p, Math.round(x), y); ctx.globalAlpha = 1;
  var vg = ctx.createLinearGradient(0, 0, 0, VH); vg.addColorStop(0, 'rgba(0,0,0,0.55)'); vg.addColorStop(0.5, 'rgba(0,0,0,0.25)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
}
function castleWindows(gx) {
  var sp = 190, x0 = -((gx * 0.6) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) {
    var wx = Math.round(x + 60), wy = 40;
    ctx.fillStyle = '#060203'; ctx.beginPath(); ctx.moveTo(wx - 4, wy + 104); ctx.lineTo(wx - 4, wy + 30); ctx.arc(wx + 26, wy + 30, 30, Math.PI, 0); ctx.lineTo(wx + 56, wy + 104); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.moveTo(wx, wy + 100); ctx.lineTo(wx, wy + 30); ctx.arc(wx + 26, wy + 30, 26, Math.PI, 0); ctx.lineTo(wx + 52, wy + 100); ctx.clip();
    var g = ctx.createLinearGradient(0, wy, 0, wy + 100); g.addColorStop(0, '#2a0306'); g.addColorStop(1, '#5a070c'); ctx.fillStyle = g; ctx.fillRect(wx, wy, 52, 100);
    moon(wx + 26, wy + 30, 13); ctx.fillStyle = '#060203'; ctx.fillRect(wx + 24, wy, 4, 100); ctx.fillRect(wx, wy + 52, 52, 3); ctx.restore();
  }
}
function dungeonChains(gx) {
  var sp = 70, x0 = -((gx * 0.8) % sp) - sp;
  for (var x = x0; x < VW + sp; x += sp) { var h = 40 + ((Math.abs(Math.round((x - x0) / sp + gx / sp)) * 37) % 70); ctx.fillStyle = '#2a1a1a'; for (var y = 0; y < h; y += 6) ctx.fillRect(Math.round(x) + (y % 12 ? 0 : 1), y, 3, 4); ctx.fillStyle = '#5a0f14'; ctx.fillRect(Math.round(x) - 3, h, 9, 3); }
  for (var d = 0; d < 6; d++) { var dx = ((d * 97 + gx * 0.3) % VW + VW) % VW, dy = (G.t * 30 + d * 47) % 120; ctx.fillStyle = 'rgba(160,10,20,0.6)'; ctx.fillRect(Math.round(dx), Math.round(dy), 2, 4); }
}
function roofSpires(gx) {
  var sp = 150, x0 = -((gx * 0.4) % sp) - sp;
  ctx.fillStyle = '#0c0306';
  for (var x = x0; x < VW + sp; x += sp) { var bx = Math.round(x), h = 90 + ((Math.abs(Math.round((x - x0) / sp)) * 53) % 50); ctx.fillRect(bx + 20, VH - h, 30, h); ctx.beginPath(); ctx.moveTo(bx + 14, VH - h); ctx.lineTo(bx + 35, VH - h - 46); ctx.lineTo(bx + 56, VH - h); ctx.fill(); ctx.fillStyle = '#ff2630'; ctx.fillRect(bx + 32, VH - h + 20, 5, 8); ctx.fillStyle = '#0c0306'; }
}

/* ---------- Ejaculand: black and red theme park skyline ---------- */
var INK = '#0a0204';
function rimStroke(path, w) { ctx.strokeStyle = INK; ctx.lineWidth = w + 3; path(); ctx.stroke(); ctx.strokeStyle = '#c4121c'; ctx.lineWidth = 1; path(); ctx.stroke(); }
function ferris(cx, cy, r) {
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - r * 0.7, 240); ctx.lineTo(cx - r * 0.7 + 8, 240); ctx.lineTo(cx, cy + 8); ctx.lineTo(cx + r * 0.7 - 8, 240); ctx.lineTo(cx + r * 0.7, 240); ctx.lineTo(cx + 6, cy); ctx.fill();
  rimStroke(function () { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); }, 3);
  var a0 = G.t * 0.18;
  ctx.strokeStyle = INK; ctx.lineWidth = 2; for (var i = 0; i < 10; i++) { var a = a0 + i * 0.6283; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke(); }
  for (i = 0; i < 10; i++) { var b = a0 + i * 0.6283, gx = cx + Math.cos(b) * r, gy = cy + Math.sin(b) * r; ctx.fillStyle = INK; ctx.fillRect(Math.round(gx - 5), Math.round(gy), 10, 8); ctx.fillStyle = (Math.floor(G.t * 2) + i) % 3 ? '#8e0c14' : '#ff2630'; ctx.fillRect(Math.round(gx - 4), Math.round(gy + 2), 8, 2); }
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 6.28); ctx.fill(); ctx.fillStyle = '#ff2630'; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, 6.28); ctx.fill();
}
/* the roller coaster: one continuous track per 720px panel (hill, loop, then a low run back), sampled once */
var PARKW = 720, COAST = null;
function coastPts() {
  if (COAST) return COAST;
  var pts = [];
  function bez(p0, p1, p2, p3, n) { for (var i = 1; i <= n; i++) { var t = i / n, u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } }
  pts.push([0, -40]);
  bez([0, -40], [40, -60], [50, -150], [90, -150], 24);
  bez([90, -150], [130, -150], [140, -40], [190, -40], 24);
  for (var i = 1; i <= 40; i++) { var a = Math.PI / 2 - i / 40 * 6.2832; pts.push([190 + Math.cos(a) * 50 + i / 40 * 20, -90 + Math.sin(a) * 50]); } // the loop, drifting forward
  bez([210, -40], [250, -40], [280, -18], [330, -14], 16);
  bez([330, -14], [450, -12], [600, -12], [660, -18], 24);
  bez([660, -18], [690, -22], [700, -38], [720, -40], 10);
  var len = [0]; for (var j = 1; j < pts.length; j++) len.push(len[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  COAST = { p: pts, len: len, total: len[len.length - 1] }; return COAST;
}
function coaster(x, gy) {
  var C = coastPts(), p = C.p, i;
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  for (i = 0; i < p.length; i += 3) { var px = p[i][0], py = p[i][1]; if (px > 135 && px < 250) continue; if (px % 18 > 6 && py > -60) continue; ctx.beginPath(); ctx.moveTo(Math.round(x + px), gy); ctx.lineTo(Math.round(x + px), Math.round(gy + py)); ctx.stroke(); }
  rimStroke(function () { ctx.beginPath(); ctx.moveTo(x + p[0][0], gy + p[0][1]); for (var k = 1; k < p.length; k++) ctx.lineTo(x + p[k][0], gy + p[k][1]); }, 4);
  // the car rides the track itself, one lap per panel
  var d = (G.t * 70) % C.total, k2 = 1; while (k2 < C.len.length - 1 && C.len[k2] < d) k2++;
  var q0 = p[k2 - 1], q1 = p[k2], f = (d - C.len[k2 - 1]) / Math.max(0.001, C.len[k2] - C.len[k2 - 1]), cx = x + q0[0] + (q1[0] - q0[0]) * f, cy = gy + q0[1] + (q1[1] - q0[1]) * f, ang = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]);
  ctx.save(); ctx.translate(Math.round(cx), Math.round(cy)); ctx.rotate(ang); ctx.fillStyle = INK; ctx.fillRect(-8, -9, 16, 7); ctx.fillStyle = '#ff2630'; ctx.fillRect(-6, -8, 3, 2); ctx.fillRect(1, -8, 3, 2); ctx.restore();
}
function clockTower(x, gy) {
  ctx.fillStyle = INK; ctx.fillRect(x - 22, gy - 170, 44, 170); ctx.beginPath(); ctx.moveTo(x - 28, gy - 170); ctx.lineTo(x, gy - 236); ctx.lineTo(x + 28, gy - 170); ctx.fill();
  ctx.strokeStyle = '#c4121c'; ctx.lineWidth = 1; ctx.strokeRect(x - 22.5, gy - 170.5, 45, 171); ctx.beginPath(); ctx.moveTo(x - 28, gy - 170); ctx.lineTo(x, gy - 236); ctx.lineTo(x + 28, gy - 170); ctx.stroke();
  ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.arc(x, gy - 140, 12, 0, 6.28); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 3 : 8; ctx.lineTo(x + Math.cos(a) * rr, gy - 140 + Math.sin(a) * rr); } ctx.fill();
  ctx.fillStyle = '#c4121c'; ctx.fillRect(x - 3, gy - 110, 6, 18); ctx.strokeStyle = '#c4121c'; ctx.beginPath(); ctx.moveTo(x - 10, gy); ctx.lineTo(x - 10, gy - 22); ctx.arc(x, gy - 22, 10, Math.PI, 0); ctx.lineTo(x + 10, gy); ctx.stroke();
}
function carousel(x, gy) {
  ctx.fillStyle = INK; ctx.fillRect(x - 48, gy - 12, 96, 12); ctx.fillRect(x - 40, gy - 72, 80, 4);
  for (var p = -36; p <= 36; p += 24) ctx.fillRect(x + p - 1, gy - 72, 3, 60);
  ctx.beginPath(); ctx.moveTo(x - 52, gy - 72); ctx.lineTo(x, gy - 112); ctx.lineTo(x + 52, gy - 72); ctx.fill();
  for (var s = -48; s < 48; s += 12) { ctx.beginPath(); ctx.arc(x + s + 6, gy - 72, 6, 0, Math.PI); ctx.fill(); }
  ctx.strokeStyle = '#c4121c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 52, gy - 72); ctx.lineTo(x, gy - 112); ctx.lineTo(x + 52, gy - 72); ctx.stroke(); ctx.beginPath(); ctx.arc(x, gy - 116, 4, 0, 6.28); ctx.fillStyle = INK; ctx.fill(); ctx.stroke();
  for (var h = 0; h < 3; h++) { var hx = x - 24 + h * 24, hy = gy - 40 + Math.sin(G.t * 3 + h * 2) * 5; ctx.fillStyle = INK; ctx.fillRect(hx - 8, hy, 16, 6); ctx.fillRect(hx + 5, hy - 6, 5, 7); ctx.fillRect(hx - 7, hy + 6, 2, 6); ctx.fillRect(hx + 5, hy + 6, 2, 6); }
}
function tent(x, gy) {
  for (var i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? INK : '#5a070c'; ctx.beginPath(); ctx.moveTo(x - 36 + i * 12, gy); ctx.lineTo(x, gy - 64); ctx.lineTo(x - 24 + i * 12, gy); ctx.fill(); }
  ctx.fillStyle = INK; ctx.fillRect(x - 1, gy - 78, 2, 14); ctx.fillStyle = '#ff2630'; ctx.beginPath(); ctx.moveTo(x + 1, gy - 78); ctx.lineTo(x + 12, gy - 74); ctx.lineTo(x + 1, gy - 70); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(x - 10, gy); ctx.lineTo(x, gy - 26); ctx.lineTo(x + 10, gy); ctx.fill();
}
function stringLights(off) {
  var sp = 140, x0 = -((off % sp) + sp) % sp - sp;
  for (var x = x0; x < VW + sp; x += sp) { ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 26); ctx.quadraticCurveTo(x + sp / 2, 56, x + sp, 26); ctx.stroke();
    for (var b = 1; b < 8; b++) { var u = b / 8, bx = x + sp * u, by = 26 + 4 * 30 * u * (1 - u) * 1.0 / 1 * 0.5 + 2, on = (Math.floor(G.t * 3) + b) % 2; ctx.fillStyle = on ? '#ffe36a' : '#ff2630'; ctx.fillRect(Math.round(bx) - 1, Math.round(by), 3, 3); } }
}
function parkBack(gx) {
  var g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0c0204'); g.addColorStop(0.55, '#3a0609'); g.addColorStop(1, '#6a0a12'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  moon(VW - 90 - (gx * 0.02) % 30, 52, 24);
  if (ok(imgs.clouds)) tileRepeat(imgs.clouds, 0.1, 6, 0.5, gx + G.t * 5, 0.55);
  // far back: the wheel, dimmed, slow. Middle: one panel holding the coaster, the clock tower and the carousel, laid out so nothing overlaps.
  var sp = 720, x0 = -((gx * 0.12) % sp) - sp, x;
  ctx.save(); ctx.globalAlpha = 0.7; for (x = x0; x < VW + sp; x += sp) ferris(Math.round(x + 470), 120, 84); ctx.restore();
  sp = PARKW; x0 = -((gx * 0.3) % sp) - sp;
  for (x = x0; x < VW + sp; x += sp) { coaster(Math.round(x), 238); clockTower(Math.round(x + 420), 238); carousel(Math.round(x + 580), 238); }
  sp = 360; x0 = -((gx * 0.5) % sp) - sp; for (x = x0; x < VW + sp; x += sp) tent(Math.round(x + 180), 242);
  stringLights(gx * 0.5);
  if (G.flash > 0) { ctx.fillStyle = 'rgba(255,50,60,' + (G.flash / 0.16 * 0.2).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function drawParkGate(x, gy) {
  var L0 = x - 82, R0 = x + 82;
  [L0, R0].forEach(function (px) { R(ctx, INK, px - 10, gy - 128, 20, 128); for (var s = 0; s < 128; s += 16) R(ctx, '#5a070c', px - 10, gy - 128 + s, 20, 8); R(ctx, '#c4121c', px - 12, gy - 134, 24, 6); });
  ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 14; ctx.strokeStyle = '#c4121c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(L0, gy - 128); ctx.quadraticCurveTo(x, gy - 200, R0, gy - 128); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L0, gy - 128); ctx.quadraticCurveTo(x, gy - 200, R0, gy - 128); ctx.stroke();
  for (var i = 0; i <= 12; i++) { var u = i / 12, bx = (1 - u) * (1 - u) * L0 + 2 * u * (1 - u) * x + u * u * R0, by = (1 - u) * (1 - u) * (gy - 128) + 2 * u * (1 - u) * (gy - 200) + u * u * (gy - 128); ctx.fillStyle = (Math.floor(G.t * 4) + i) % 2 ? '#ffe36a' : '#ff2630'; ctx.fillRect(Math.round(bx) - 2, Math.round(by) - 2, 4, 4); }
  ctx.save(); ctx.font = '26px "Pirata One", serif'; ctx.textAlign = 'center'; ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 12; ctx.fillStyle = INK; ctx.fillText('EJACULAND', x + 1, gy - 167); ctx.fillStyle = '#ff2630'; ctx.fillText('EJACULAND', x, gy - 168); ctx.restore();
}
function drawSteve(e, cx) {
  var x = Math.round(e.x - cx); if (x < -60 || x > VW + 60) return;
  var near = Math.abs(P.x - e.x) < 90, f = Math.floor(G.t * (near ? 4 : 1.6)) % 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(x, e.y - 1, 18, 3, 0, 0, 6.28); ctx.fill();
  spr('steve' + f, x, e.y + Math.round(Math.abs(Math.sin(G.t * 3)) * -1), P.x < e.x - 30, 1.15);
  if (near) { var t = 'WELCOME TO EJACULAND!', w = t.length * 5.4 + 14, by = e.y - 82; R(ctx, '#f1e7d0', x - w / 2, by - 11, w, 15); R(ctx, '#0a0204', x - w / 2 + 1, by - 10, w - 2, 13); ctx.fillStyle = '#0a0204'; ctx.beginPath(); ctx.moveTo(x - 4, by + 4); ctx.lineTo(x + 2, by + 10); ctx.lineTo(x + 6, by + 4); ctx.fill(); text(t, x, by, 'center', '#ff2630', 5); }
}
function drawFlume(cx) {
  var w = L.water; if (!w) return; var x0 = Math.round(w.x0 - cx), x1 = Math.round(w.x1 - cx), y = w.y, bot = 15 * T;
  ctx.save(); ctx.globalAlpha = 0.86; var g = ctx.createLinearGradient(0, y, 0, bot); g.addColorStop(0, '#fff6d8'); g.addColorStop(1, '#c8b890'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x0, bot); for (var x = x0; x <= x1; x += 4) ctx.lineTo(x, y + Math.sin(x * 0.12 + G.t * 4) * 1.6); ctx.lineTo(x1, bot); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#c4121c'; ctx.fillRect(x0, y - 1, 2, bot - y + 1); ctx.fillRect(x1 - 2, y - 1, 2, bot - y + 1);
  for (var b = 0; b < 8; b++) { var bx = x0 + ((b * 61 + G.t * 40) % (x1 - x0)), by = y + 6 + (b * 7) % 18; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(Math.round(bx), Math.round(by), 2, 2); }
}
function drawLogs(cx) {
  if (!L.movers) return;
  L.movers.forEach(function (m) { var x = Math.round(m.x - cx), y = Math.round(m.y);
    R(ctx, '#12040a', x - m.w / 2 - 1, y - m.h - 1, m.w + 2, m.h + 2); R(ctx, '#3a1a0a', x - m.w / 2, y - m.h, m.w, m.h); R(ctx, '#6a3a1a', x - m.w / 2, y - m.h, m.w, 3); R(ctx, '#c4121c', x - m.w / 2, y - 3, m.w, 2);
    ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.moveTo(x + m.w / 2, y - m.h); ctx.lineTo(x + m.w / 2 + 8, y - m.h - 6); ctx.lineTo(x + m.w / 2, y - 2); ctx.fill(); R(ctx, '#2a0a06', x - 14, y - m.h + 3, 28, 4); });
}
function drawFlumeSign(x, y) {
  ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 12 + Math.sin(G.t * 6) * 3; ctx.strokeStyle = '#ff2630'; ctx.lineWidth = 2; ctx.strokeRect(x - 90, y, 180, 26); ctx.restore();
  R(ctx, 'rgba(10,2,4,0.85)', x - 89, y + 1, 178, 24); ctx.save(); ctx.font = '20px "Pirata One", serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff2630'; ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 8; ctx.fillText('THE LOAD FLUME', x, y + 19); ctx.restore();
}
function drawBack() {
  var a = areaNow(), gx = (G.mode === 'town' ? 0 : (L && L.arena ? 0 : (G.rm ? G.rm.cx * CW * T : 0))) + G.cam.x;
  if (G.mode === 'town') { outdoorSky(gx, true); return; }
  var A = AREAS[a];
  if (a === 'roof') { outdoorSky(gx, false); roofSpires(gx); }
  else if (a === 'city') parkBack(gx);
  else { wallBack(gx, A); if (a === 'castle') castleWindows(gx); else dungeonChains(gx); }
  if (A.sky) { ctx.fillStyle = A.sky; ctx.fillRect(0, 0, VW, VH); }
}
/* the room's static tiles, rendered once into a layer */
/* ---------- 16-bit tiles: pixel masonry drawn per area (bevelled bricks, capstones, mortar, cracks), ledges with brackets, steel spikes ---------- */
var STONE = {
  castle:  { m: '#12040a', c: ['#3e0f16', '#45121a', '#381016', '#4c141c'], hi: '#6a2028', lo: '#22070b', cap: ['#7a2430', '#a83440', '#4a1018'], deep: '#1c0609', spot: '#5a1820', style: 'brick' },
  roof:    { m: '#0a0610', c: ['#2c1c3c', '#33204a', '#281836', '#3a2650'], hi: '#55406e', lo: '#160c22', cap: ['#5a3a74', '#8a64a8', '#2a1838'], deep: '#120a1a', spot: '#4a2e62', style: 'shingle' },
  city:    { m: '#060204', c: ['#1a0a10', '#1e0c14', '#160810', '#220e16'], hi: '#3a1622', lo: '#0a0306', cap: ['#2a0e18', '#ff2a8a', '#14060a'], deep: '#0c0408', spot: '#6a1a2a', style: 'panel' },
  dungeon: { m: '#060406', c: ['#2c2326', '#30272a', '#272022', '#342a2e'], hi: '#4a3e42', lo: '#160f12', cap: ['#463a3e', '#6a5a5e', '#221a1c'], deep: '#110b0d', spot: '#4a0a10', style: 'rough' }
};
function th16() { var a = L && L.arena ? (L.arena === 'blum' || L.arena === 'blum2' ? 'castle' : BOSSDEF[L.arena].area) : (G.rm ? G.rm.area : 'castle'); return STONE[a] || STONE.castle; }
function hsh(x, y, k) { var h = (x * 374761393 + y * 668265263 + (k || 0) * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function stoneTile(g, px, py, tx, ty, S, open) {
  // open: which sides face air {u, d, l, r}
  var i, j;
  g.fillStyle = S.m; g.fillRect(px, py, T, T);
  if (!open.u && !open.d && !open.l && !open.r) { // deep inside a wall: quiet, dark blocks so the playfield reads clearly
    g.fillStyle = S.deep; g.fillRect(px, py, T, T); g.fillStyle = S.lo; if (hsh(tx, ty, 9) < 0.35) g.fillRect(px + 3 + Math.floor(hsh(tx, ty, 2) * 8), py + 3 + Math.floor(hsh(tx, ty, 3) * 8), 2, 1); return;
  }
  if (S.style === 'panel') { // Ejaculand: black riveted plates
    g.fillStyle = S.c[Math.floor(hsh(tx, ty) * 4)]; g.fillRect(px + 1, py + 1, T - 2, T - 2);
    g.fillStyle = S.hi; g.fillRect(px + 1, py + 1, T - 2, 1); g.fillRect(px + 1, py + 1, 1, T - 2);
    g.fillStyle = S.lo; g.fillRect(px + 1, py + T - 2, T - 2, 1); g.fillRect(px + T - 2, py + 1, 1, T - 2);
    g.fillStyle = S.spot; [[3, 3], [T - 4, 3], [3, T - 4], [T - 4, T - 4]].forEach(function (r) { g.fillRect(px + r[0], py + r[1], 1, 1); });
  } else if (S.style === 'shingle') { // roof: overlapping slate shingles
    for (j = 0; j < 2; j++) for (i = -1; i < 3; i++) {
      var sx = px + i * 8 + (j % 2 ? 4 : 0) + ((ty % 2) ? 4 : 0), sy = py + j * 8, cc = S.c[Math.floor(hsh(tx * 4 + i, ty * 2 + j) * 4)];
      var x0 = Math.max(px, sx), x1 = Math.min(px + T, sx + 7); if (x1 <= x0) continue;
      g.fillStyle = cc; g.fillRect(x0, sy, x1 - x0, 7); g.fillStyle = S.hi; g.fillRect(x0, sy, x1 - x0, 1);
      g.fillStyle = S.lo; g.fillRect(x0, sy + 6, x1 - x0, 1); if (sx + 6 < px + T && sx + 6 >= px) g.fillRect(sx + 6, sy, 1, 7);
      g.fillStyle = S.lo; if (sx + 3 >= px && sx + 3 < px + T) g.fillRect(sx + 3, sy + 4, 1, 2);
    }
  } else { // castle bricks and dungeon rough stone: two courses per tile, offset every other row
    var rough = S.style === 'rough';
    for (j = 0; j < 2; j++) {
      var off = ((ty * 2 + j) % 2) ? 4 : 0, bwid = rough ? 12 : 8;
      for (i = -1; i < 3; i++) {
        var bx0 = px + i * bwid + off * (rough ? 2 : 1) - (rough ? 4 : 0), by0 = py + j * 8, xa = Math.max(px, bx0), xb = Math.min(px + T, bx0 + bwid - 1); if (xb <= xa) continue;
        var hv = hsh(tx * 4 + i + 7, ty * 2 + j), col = S.c[Math.floor(hv * 4)];
        g.fillStyle = col; g.fillRect(xa, by0, xb - xa, 7);
        g.fillStyle = S.hi; g.fillRect(xa, by0, xb - xa, 1); if (bx0 >= px) g.fillRect(bx0, by0, 1, 6);
        g.fillStyle = S.lo; g.fillRect(xa, by0 + 6, xb - xa, 1); if (bx0 + bwid - 2 < px + T && bx0 + bwid - 2 >= px) g.fillRect(bx0 + bwid - 2, by0 + 1, 1, 6);
        if (hv > 0.82) { g.fillStyle = S.lo; var cx = Math.max(xa + 1, Math.min(xb - 3, bx0 + 3)); g.fillRect(cx, by0 + 2, 1, 2); g.fillRect(cx + 1, by0 + 4, 1, 1); } // a crack
        if (hv < 0.08) { g.fillStyle = S.spot; g.fillRect(Math.min(xb - 2, xa + 2), by0 + 3, 2, 1); } // a stain
        if (rough && hv > 0.5 && hv < 0.56) { g.fillStyle = S.hi; g.fillRect(xa + 2, by0 + 2, 1, 1); }
      }
    }
  }
  // faces that touch air: a lit capstone on top, a shadow lip underneath, darker sides
  if (open.u) {
    g.fillStyle = S.cap[2]; g.fillRect(px, py, T, 5); g.fillStyle = S.cap[0]; g.fillRect(px, py, T, 4); g.fillStyle = S.cap[1]; g.fillRect(px, py, T, 1);
    for (i = 0; i < T; i += 8) { g.fillStyle = S.cap[2]; g.fillRect(px + i + ((tx % 2) ? 4 : 0), py + 1, 1, 3); }
    if (S.style === 'panel') { g.fillStyle = S.cap[1]; g.fillRect(px, py, T, 1); g.fillStyle = 'rgba(255,42,138,0.25)'; g.fillRect(px, py + 1, T, 2); }
  }
  if (open.d) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(px, py + T - 3, T, 3); g.fillStyle = S.lo; g.fillRect(px, py + T - 1, T, 1); }
  if (open.l) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(px, py, 1, T); }
  if (open.r) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(px + T - 2, py, 2, T); }
}
function buildLayer() {
  var W = L.w, H = L.h, c = mk(W * T, H * T), g0 = c.getContext('2d'), fk = mk(W * T, H * T), gf = fk.getContext('2d'), g = g0, th = TH(), hau = RUN && RUN.card === 'haunted', anyF = false, S = th16();
  function wallish(t) { return t === TW || t === TF; }
  function at(x, y) { return (x < 0 || y < 0 || x >= W || y >= H) ? TW : L.tiles[y * W + x]; }
  for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
    var t = L.tiles[y * W + x], px = x * T, py = y * T;
    g = t === TF ? gf : g0; if (t === TF) anyF = true;
    if (t === TW || t === TF) {
      stoneTile(g, px, py, x, y, S, { u: !wallish(at(x, y - 1)), d: !wallish(at(x, y + 1)), l: !wallish(at(x - 1, y)), r: !wallish(at(x + 1, y)) });
      if (th.tint) { g.fillStyle = th.tint; g.fillRect(px, py, T, T); }
      if (t === TF && hau) { g.fillStyle = 'rgba(170,80,255,0.35)'; g.fillRect(px, py, T, T); }
      if (!wallish(at(x, y - 1))) { g.fillStyle = th.e1; g.fillRect(px, py, T, 1); }
    } else if (t === TG) {
      g.fillStyle = '#0c0305'; g.fillRect(px, py, T, 6); g.fillStyle = '#6a6a78'; g.fillRect(px, py, T, 2); g.fillStyle = '#9a9aa8'; g.fillRect(px, py, T, 1);
      g.fillStyle = '#2a2a32'; for (var gb = 1; gb < T; gb += 4) g.fillRect(px + gb, py + 2, 2, 4);
    } else if (t === TL || t === TV) {
      var ll = at(x - 1, y) !== t, rr = at(x + 1, y) !== t, crack = t === TV;
      g.fillStyle = S.m; g.fillRect(px, py, T, 7);
      g.fillStyle = crack ? S.c[2] : S.cap[0]; g.fillRect(px, py + 1, T, 5);
      g.fillStyle = S.cap[1]; g.fillRect(px, py, T, 1); g.fillStyle = S.cap[2]; g.fillRect(px, py + 5, T, 1);
      g.fillStyle = S.m; for (var lk = (x % 2) ? 4 : 0; lk < T; lk += 8) g.fillRect(px + lk, py + 1, 1, 5);
      if (crack) { g.fillStyle = S.m; g.fillRect(px + 5, py + 1, 1, 2); g.fillRect(px + 6, py + 3, 1, 2); g.fillRect(px + 11, py + 2, 1, 3); }
      if (ll) { g.fillStyle = S.m; g.fillRect(px, py, 1, 7); g.fillStyle = S.cap[2]; g.fillRect(px + 2, py + 7, 3, 3); g.fillRect(px + 3, py + 10, 2, 2); }
      if (rr) { g.fillStyle = S.m; g.fillRect(px + T - 1, py, 1, 7); g.fillStyle = S.cap[2]; g.fillRect(px + T - 5, py + 7, 3, 3); g.fillRect(px + T - 5, py + 10, 2, 2); }
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(px, py + 7, T, 2);
      if (th.tint) { g.fillStyle = th.tint; g.fillRect(px, py, T, 7); }
      if (t === TV && hau) { g.fillStyle = 'rgba(170,80,255,0.45)'; g.fillRect(px, py, T, 7); }
    } else if (t === TS) {
      for (var k = 0; k < T; k += 4) { // steel spikes: pointed, lit on the left, blood on the tips
        var hgt = 8 + ((x * 3 + k) % 3 === 0 ? 2 : 0), base = py + T;
        for (var rI = 0; rI < hgt; rI++) { var wdt = rI < hgt - 6 ? 3 : rI < hgt - 2 ? 2 : 1, sx3 = px + k + (wdt === 3 ? 0 : 1), yy = base - 1 - rI;
          g.fillStyle = '#12040a'; g.fillRect(sx3 - 1, yy, wdt + 2, 1); g.fillStyle = '#7a7a88'; g.fillRect(sx3, yy, wdt, 1); g.fillStyle = '#d8d8e4'; g.fillRect(sx3, yy, 1, 1); }
        g.fillStyle = '#12040a'; g.fillRect(px + k + 1, base - hgt - 1, 1, 1); g.fillStyle = '#ff3a44'; g.fillRect(px + k + 1, base - hgt, 1, 2);
      }
      g.fillStyle = '#3a3a44'; g.fillRect(px, py + T - 2, T, 2); g.fillStyle = '#5a5a66'; g.fillRect(px, py + T - 2, T, 1);
    }
  }
  G.layer = c; G.fakeLayer = anyF ? fk : null;
}
function chevron(x, y, dir, col, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir === 'r' ? 0 : dir === 'l' ? Math.PI : dir === 'u' ? -Math.PI / 2 : Math.PI / 2);
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'square'; ctx.shadowColor = col; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(-s / 2, -s); ctx.lineTo(s / 2, 0); ctx.lineTo(-s / 2, s); ctx.stroke(); ctx.restore();
}
/* make every way out obvious: glowing arches on the sides, hatches above and below, arrows, and the area name when it leads somewhere new */
function drawExits(cx) {
  if (!G.rm || (L && L.arena)) return;
  var rm = G.rm, W = L.w * T, H = L.h * T, pulse = 0.55 + 0.45 * Math.sin(G.t * 4), locked = G.lock;
  for (var d in rm.ex) {
    var nr = WORLD.rooms[key2(rm.cx + DIRV[d][0], rm.cy + DIRV[d][1])], area = rm.signs ? rm.signs[d] : (nr && nr.area !== rm.area ? nr.area : null);
    var col = locked ? '#5a0f14' : '#ff2630', lbl = area ? AREAS[area].name.toUpperCase() : '', seen = RUN.rs[key2(rm.cx + DIRV[d][0], rm.cy + DIRV[d][1])];
    ctx.save(); ctx.globalAlpha = locked ? 0.5 : 1;
    if (d === 'l' || d === 'r') {
      var ex = d === 'l' ? 0 : W - T, x0 = Math.round(ex - cx), ix = d === 'l' ? x0 + T : x0;
      R(ctx, '#0c0305', d === 'l' ? x0 + T : x0 - 4, 12 * T - 10, 4, 3 * T + 10);
      ctx.shadowColor = col; ctx.shadowBlur = 10 * pulse; ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); if (d === 'l') { ctx.moveTo(x0, 12 * T - 6); ctx.quadraticCurveTo(x0 + T + 2, 12 * T - 12, x0 + T + 2, 12 * T + 6); ctx.lineTo(x0 + T + 2, 15 * T); } else { ctx.moveTo(x0 + T, 12 * T - 6); ctx.quadraticCurveTo(x0 - 2, 12 * T - 12, x0 - 2, 12 * T + 6); ctx.lineTo(x0 - 2, 15 * T); } ctx.stroke();
    } else {
      var hx = Math.round(14 * T - cx), hw = 4 * T, hy = d === 'u' ? T : H - T;
      var gr = ctx.createLinearGradient(0, d === 'u' ? hy : hy, 0, d === 'u' ? hy + 18 : hy - 18); gr.addColorStop(0, 'rgba(255,38,48,' + (0.45 * pulse).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,38,48,0)');
      ctx.fillStyle = gr; ctx.fillRect(hx, d === 'u' ? hy : hy - 18, hw, 18);
      R(ctx, col, hx - 3, d === 'u' ? hy - 1 : hy, 3, 2); R(ctx, col, hx + hw, d === 'u' ? hy - 1 : hy, 3, 2);
    }
    ctx.restore();
  }
}
function drawDeco(e, cx) {
  var x = Math.round(e.x - cx), y = e.y; if (x < -40 || x > VW + 40) return;
  if (e.d === 'candle') { R(ctx, '#12040a', x, y + 6, 6, 12); R(ctx, '#f1e7d0', x + 1, y + 7, 4, 10); ctx.fillStyle = 'rgba(255,170,60,0.22)'; ctx.beginPath(); ctx.arc(x + 3, y + 2, 10, 0, 6.28); ctx.fill(); ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.arc(x + 3, y + 2 + Math.sin(G.t * 9 + x) * 0.8, 2.2, 0, 6.28); ctx.fill(); }
  else if (e.d === 'banner') { R(ctx, '#2a0509', x - 1, y - 2, 22, 3); R(ctx, '#8e0c14', x, y, 20, 34); ctx.fillStyle = '#8e0c14'; ctx.beginPath(); ctx.moveTo(x, y + 34); ctx.lineTo(x + 10, y + 42); ctx.lineTo(x + 20, y + 34); ctx.fill(); R(ctx, '#ff2630', x + 2, y + 2, 1, 32); R(ctx, '#ff2630', x + 17, y + 2, 1, 32); ctx.drawImage(dropImg, x + 5, y + 10, 10, 12); }
  else if (e.d === 'parkgate') drawParkGate(x, y);
  else if (e.d === 'flumesign') drawFlumeSign(x, y);
  else if (e.d === 'bulbs') { for (var bi = 0; bi < 6; bi++) { ctx.fillStyle = (Math.floor(G.t * 3) + bi) % 2 ? '#ffe36a' : '#ff2630'; ctx.fillRect(x + bi * 9, y + Math.round(Math.sin(bi / 5 * Math.PI) * 6), 3, 3); } }
  else if (e.d === 'neon') { if (e.post) { R(ctx, '#12040a', x + 6, y + 14, 3, 10); R(ctx, '#12040a', x + 25, y + 14, 3, 10); R(ctx, '#3a0a10', x + 7, y + 14, 1, 10); R(ctx, '#3a0a10', x + 26, y + 14, 1, 10); } var col = e.hue < 0.5 ? '#ff2a8a' : '#ff2630'; ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10 + Math.sin(G.t * 6 + x) * 3; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x, y, 34, 14); ctx.fillStyle = col; ctx.font = '6px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillText(e.hue < 0.33 ? 'LOAD' : e.hue < 0.66 ? 'OPEN' : 'XXX', x + 17, y + 10); ctx.restore(); }
  else if (e.d === 'throneL' || e.d === 'throneR') { R(ctx, '#1a0507', x - 10, y - 50, 20, 50); R(ctx, '#5a070c', x - 8, y - 48, 16, 46); R(ctx, '#ff2630', x - 8, y - 48, 16, 2); ctx.fillStyle = 'rgba(255,170,60,0.18)'; ctx.beginPath(); ctx.arc(x, y - 58, 12, 0, 6.28); ctx.fill(); ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.arc(x, y - 58 + Math.sin(G.t * 8 + x) * 0.8, 3, 0, 6.28); ctx.fill(); }
}
function drawDoor(e, cx) {
  var x = Math.round(e.x - cx), y = e.y, w = 48, h = 70, dead = e.boss !== 'blum' && META.bosses[BOSSDEF[e.boss].area];
  ctx.fillStyle = '#0c0305'; ctx.beginPath(); ctx.moveTo(x - w / 2 - 6, y); ctx.lineTo(x - w / 2 - 6, y - h + 20); ctx.arc(x, y - h + 20, w / 2 + 6, Math.PI, 0); ctx.lineTo(x + w / 2 + 6, y); ctx.fill();
  ctx.fillStyle = dead ? '#050102' : '#3a0a10'; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + 20); ctx.arc(x, y - h + 20, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, y); ctx.fill();
  if (!dead) { ctx.fillStyle = '#1a0507'; ctx.fillRect(x - 1, y - h, 2, h); for (var i = 0; i < 4; i++) ctx.fillRect(x - w / 2, y - 12 - i * 14, w, 2); ctx.fillStyle = '#ffe36a'; ctx.fillRect(x - 6, y - 32, 3, 4); ctx.fillRect(x + 3, y - 32, 3, 4); }
  ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 12; ctx.strokeStyle = '#ff2630'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + 20); ctx.arc(x, y - h + 20, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, y); ctx.stroke(); ctx.restore();
  if (e.boss === 'blum') {
    for (var s = 0; s < 4; s++) { var a = AREAORDER[s], on = META.bosses[a], sx = x - 27 + s * 18, sy = y - h - 14; ctx.fillStyle = '#0c0305'; ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 6.28); ctx.fill(); ctx.fillStyle = on ? '#ff2630' : '#3a0a10'; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 6.28); ctx.fill(); if (on) { ctx.fillStyle = '#ffe36a'; ctx.fillRect(sx - 1, sy - 3, 2, 6); } }
    spr('boss_blum', x, y - 30, false, 1.4, sealCount() >= 4 ? 1 : 0.35);
  } else { var d = BOSSDEF[e.boss], f = SPR[d.sp + '0'] || SPR[d.sp]; if (f) { var sc = Math.min(30 / f[2], 26 / f[3]); spr(SPR[d.sp + '0'] ? d.sp + '0' : d.sp, x, y - h + 26, true, sc, dead ? 0.3 : 1); } if (dead) text('SLAIN', x, y - 20, 'center', '#a6968f', 6); }
}
function drawChest(e, cx) {
  var x = Math.round(e.x - cx), y = e.y, w = e.big ? 24 : 18, h = e.big ? 16 : 13;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x - w / 2, y - 2, w, 3);
  R(ctx, '#12040a', x - w / 2 - 1, y - h - 1, w + 2, h + 1); R(ctx, '#7a1218', x - w / 2, y - h, w, h); R(ctx, '#ffe36a', x - w / 2, y - h + 4, w, 2); R(ctx, '#ffe36a', x - 2, y - h + 3, 4, 5);
  if (e.open) { R(ctx, '#12040a', x - w / 2 - 1, y - h - 7, w + 2, 6); R(ctx, '#5a0a10', x - w / 2, y - h - 6, w, 4); ctx.fillStyle = 'rgba(255,227,106,0.25)'; ctx.fillRect(x - w / 2 + 2, y - h - 2, w - 4, 3); }
  else { R(ctx, '#9a1a22', x - w / 2, y - h, w, 3); if (e.secret || e.big) { ctx.fillStyle = 'rgba(255,227,106,' + (0.25 + 0.2 * Math.sin(G.t * 5)) + ')'; ctx.fillRect(x - w / 2 - 2, y - h - 2, w + 4, h + 2); } }
}
function drawAltar(e, cx) {
  var x = Math.round(e.x - cx), y = e.y;
  R(ctx, '#12040a', x - 16, y - 22, 32, 22); R(ctx, '#3a2a2a', x - 15, y - 21, 30, 20); R(ctx, '#5a4a4a', x - 15, y - 21, 30, 3); R(ctx, '#12040a', x - 20, y - 26, 40, 5); R(ctx, '#6a5a5a', x - 19, y - 25, 38, 3);
  if (!e.taken) { var oy = y - 40 + Math.sin(G.t * 3) * 3; ctx.save(); ctx.shadowColor = '#ffe36a'; ctx.shadowBlur = 16; ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(x, oy, 6, 0, 6.28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 2, oy - 2, 2, 0, 6.28); ctx.fill(); ctx.restore(); }
}
function drawTurret(e, cx) { var x = Math.round(e.x - cx), y = e.y; R(ctx, '#12040a', x - 8, y - 8, 16, 16); R(ctx, '#3a2a2a', x - 7, y - 7, 14, 14); R(ctx, '#f1e7d0', x - 5, y - 5, 10, 8); R(ctx, '#12040a', x - 3, y - 3, 2, 3); R(ctx, '#12040a', x + 1, y - 3, 2, 3); R(ctx, '#ff2630', x + e.dir * 6 - 2, y - 1, 4, 3); }
function drawNpcEnt(e, cx) { var x = Math.round(e.x - cx); R(ctx, '#12040a', x - 26, e.y - 16, 52, 16); R(ctx, '#5a3a1a', x - 25, e.y - 15, 50, 4); R(ctx, '#3a200e', x - 25, e.y - 11, 50, 11); spr(e.who, x, e.y - 14, P.x < e.x, 1.2); ctx.fillStyle = '#ffe36a'; ctx.drawImage(dropImg, x + 14, e.y - 24); }

function enemyImg(e) { var d = e.d, f = Math.floor(e.t * (d.ai === 'fly' ? 7 : 5)) % 2; if (d.proc) return { c: PROC[d.proc][f] }; return { s: d.sp + f }; }
function drawEnemy(e, cx) {
  var x = Math.round(e.x - cx); if (x < -40 || x > VW + 40) return;
  if (e.fade > 0 && Math.floor(G.t * 30) % 2) return;
  var im = enemyImg(e), sc = (e.d.sc || 1) * (e.mini ? 0.7 : 1), white = e.flash > 0 && Math.floor(G.t * 40) % 2 === 0;
  ctx.save(); if (white) ctx.filter = 'brightness(3)';
  if (im.c) { ctx.translate(x, Math.round(e.y)); if (e.face < 0) ctx.scale(-1, 1); var c = im.c, ps = e.d.sc || 1; ctx.drawImage(c, Math.round(-c.width * ps / 2), Math.round(-c.height * ps), Math.round(c.width * ps), Math.round(c.height * ps)); }
  else spr(im.s, x, Math.round(e.y), e.face < 0, sc);
  ctx.restore();
  if (e.stun > 0) for (var s = 0; s < 3; s++) { var a = G.t * 6 + s * 2.1; R(ctx, '#ffe36a', x + Math.cos(a) * 8 - 1, e.y - e.h - 6 + Math.sin(a) * 2, 2, 2); }
  if (e.burn > 0 && Math.random() < 0.3) parts.push({ x: e.x + (Math.random() - 0.5) * e.w, y: e.y - Math.random() * e.h, vx: 0, vy: -30, life: 0.3, c: '#ffb040' });
  if (e.hp < e.mhp) { R(ctx, '#000', x - 10, e.y - e.h - 6, 20, 3); R(ctx, '#ff2630', x - 10, e.y - e.h - 6, Math.round(20 * Math.max(0, e.hp) / e.mhp), 3); }
}
function drawBoss(b, cx) {
  var x = Math.round(b.x - cx), d = b.d, f = Math.floor(G.t * 4) % 2, name = SPR[d.sp + f] ? d.sp + f : d.sp, white = b.flash > 0 && Math.floor(G.t * 40) % 2 === 0;
  var face = b.face > 0, flip = (b.id === 'beast' || b.id === 'pig') ? !face : !face;
  ctx.save(); if (white) ctx.filter = 'brightness(3)'; if (b.ph === 2 && b.id !== 'demon') { ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 14; }
  var bob = b.fly ? Math.sin(G.t * 3 + (b.slot || 0)) * 3 : 0;
  if (b.st === 'tell' && Math.floor(G.t * 30) % 2) x += 2;
  spr(name, x, Math.round(b.y + bob), flip, d.sc); ctx.restore();
  if (b.stun > 0) for (var s = 0; s < 4; s++) { var a = G.t * 6 + s * 1.6; R(ctx, '#ffe36a', x + Math.cos(a) * 16 - 1, b.y - b.h - 8 + Math.sin(a) * 3, 3, 3); }
}
function drawPlayer(cx) {
  if (P.inv > 0 && P.state !== 'dead' && Math.floor(G.t * 20) % 2 === 0) return;
  var x = P.x - cx, y = P.y, cls = G.mode === 'town' ? (META.last || 'cumhead') : RUN.cls, flip = P.face < 0, sp = Math.abs(P.vx), dirIn = (input.r ? 1 : 0) - (input.l ? 1 : 0);
  var small = ST.small && RUN && RUN.card === 'tiny';
  ctx.save(); if (P.ooze > 0) { ctx.shadowColor = '#7dff3a'; ctx.shadowBlur = 16; }
  if (small) { ctx.translate(x, y); ctx.scale(0.75, 0.75); ctx.translate(-x, -y); }
  if (cls === 'cumhead') {
    var name;
    if (P.state === 'hurt' || P.state === 'dead') name = 'hurt0';
    else if (P.attackT > 0) name = 'attack';
    else if (!P.onGround) name = P.jumpStartT > 0 ? 'jump0' : (P.vy < -70 ? 'jump1' : (P.vy < 70 ? 'jump2' : 'jump3'));
    else if (sp > 90 && dirIn !== 0 && (P.vx > 0 ? 1 : -1) !== dirIn) name = 'run6';
    else if (sp < 10) name = 'idle' + (Math.floor(P.idleT * 4) % 7);
    else if (sp < 115) name = 'walk' + (Math.floor(P.anim) % 9);
    else name = 'rn' + (Math.floor(P.anim) % 8);
    cspr(name, x, y, flip);
  } else if (cls === 'homunculus') {
    if (G.mode === 'play' && RUN) drawHom(x, y, flip);
    else spr('h_gloop_teen_' + (sp > 10 ? 'run' + (Math.floor(P.anim * 0.9) % 4) : 'idle' + (Math.floor(P.idleT * 2.2) % 2)), x, y + 1, flip, 1);
  } else {
    var base = cls === 'homunculus' ? 'hom' : cls, nm = base + '_s0', sc = cls === 'homunculus' ? 0.95 : (cls === 'greebo' ? 1.2 : 1.25), dy = 0, rot = 0;
    if (P.state === 'dead') { nm = SPR[base + '_dead'] ? base + '_dead' : base + '_s0'; if (!SPR[base + '_dead']) rot = flip ? -1.4 : 1.4; }
    else if (!P.onGround) nm = base + '_s1';
    else if (sp > 10) nm = base + (Math.floor(P.anim) % 2 ? '_s1' : '_s2');
    else dy = Math.floor(P.idleT * 2) % 2;
    if (P.attackT > 0 && P.state === 'normal') { x += P.face * 2; }
    if (rot) { ctx.translate(x, y - 6); ctx.rotate(rot); spr(nm, 0, 6, flip, sc); }
    else spr(nm, x, y + dy, flip, sc);
  }
  ctx.restore();
}
function drawShots(cx) {
  pshots.forEach(function (s) {
    var x = Math.round(s.x - cx), y = Math.round(s.y);
    if (s.k === 'shot') { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(s.vy, s.vx)); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 10; ctx.fillStyle = '#ff3a44'; ctx.beginPath(); ctx.arc(-3, 0, 8, -1.05, 1.05); ctx.arc(-7, 0, 7, 1.0, -1.0, true); ctx.closePath(); ctx.fill(); ctx.restore(); }
    else if (s.k === 'whip') { var a = (0.13 - s.life) / 0.13; ctx.save(); ctx.translate(Math.round(P.x - cx), Math.round(P.y - 20)); ctx.scale(P.face, 1); ctx.strokeStyle = 'rgba(255,154,208,' + (1 - a) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(6, 0, 30, -1.2 + a, 0.9 + a * 0.4); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,' + (1 - a) * 0.8 + ')'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    else if (s.k === 'pie') { var sp = s.vx > 0 ? 1 : -1; ctx.fillStyle = 'rgba(241,231,208,0.35)'; ctx.fillRect(x - sp * 22, y - 3, sp * 12, 6); R(ctx, '#12040a', x - 11, y - 8, 22, 16); R(ctx, '#c8903a', x - 10, y - 6, 20, 13); R(ctx, '#f1e7d0', x - 10, y - 8, 20, 6); R(ctx, '#fff6d8', x - 7, y - 8, 6, 2); R(ctx, '#d9b36a', x - 10, y + 2, 20, 2); R(ctx, '#ff2630', x - 2, y - 11, 4, 4); }
    else if (s.k === 'acid') { var ar = s.small ? 3.5 : s.r + 1; ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x, y, ar + 1.5, 0, 6.28); ctx.fill(); ctx.fillStyle = s.col || '#7dff3a'; ctx.beginPath(); ctx.arc(x, y, ar, 0, 6.28); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x - 1, y - Math.round(ar * 0.6), 2, 2); }
    else if (s.k === 'claw') { var ca = (0.14 - s.life) / 0.14; ctx.save(); ctx.translate(Math.round(P.x - cx), Math.round(P.y - P.h * 0.55)); ctx.scale(P.face, 1); ctx.globalAlpha = 1 - ca; for (var cl = 0; cl < 3; cl++) { ctx.strokeStyle = cl === 1 ? '#f1e7d0' : (s.col || '#7dff3a'); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(4, -6 + cl * 7, 34, -1.0 + ca * 0.6, 0.6 + ca * 0.6); ctx.stroke(); } ctx.restore(); }
    else if (s.k === 'cat') { spr('cat', x, y, s.face < 0, 1.6); }
  });
  eshots.forEach(function (b) {
    var x = Math.round(b.x - cx), y = Math.round(b.y);
    if (b.k === 'laser') { ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 8; R(ctx, '#ff2630', x - 10, y - 2, 20, 4); R(ctx, '#ffd0d0', x - 8, y - 1, 16, 2); ctx.restore(); }
    else if (b.k === 'coin') { R(ctx, '#7a5a10', x - 4, y - 4, 8, 8); R(ctx, '#ffe36a', x - 3, y - 3, 6, 6); R(ctx, '#fff6d8', x - 2, y - 2, 2, 2); }
    else if (b.k === 'blob') { ctx.fillStyle = '#2a0509'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.28); ctx.fill(); ctx.fillStyle = G.bossGroup === 'blum2' ? '#9a4aff' : '#ff3a44'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.28); ctx.fill(); ctx.fillStyle = '#ffd0d0'; ctx.fillRect(x - 2, y - 2, 2, 2); }
    else { var c = b.k === 'bolt' ? ['#5a1a8a', '#d878ff'] : b.k === 'big' ? ['#6a0a10', '#ffb040'] : ['#a01a0a', '#ffb040']; ctx.save(); ctx.shadowColor = c[1]; ctx.shadowBlur = 10; ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(x, y, b.r + 1, 0, 6.28); ctx.fill(); ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(x, y, b.r - 1, 0, 6.28); ctx.fill(); ctx.restore(); }
  });
  waves.forEach(function (w) { var wx = Math.round(w.x - cx), wy = w.y; ctx.fillStyle = '#ff2630'; ctx.beginPath(); ctx.moveTo(wx - 9, wy); ctx.lineTo(wx, wy - 14); ctx.lineTo(wx + 9, wy); ctx.fill(); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.moveTo(wx - 4, wy); ctx.lineTo(wx, wy - 8); ctx.lineTo(wx + 4, wy); ctx.fill(); });
}
function bar(x, y, w, h, fr, col, bg) { R(ctx, '#000', x - 1, y - 1, w + 2, h + 2); R(ctx, bg || '#2a0509', x, y, w, h); R(ctx, col, x, y, Math.round(w * clamp(fr, 0, 1)), h); }
function drawMinimap() {
  if (!WORLD || !G.rm) return;
  var a = G.rm.area, A = AREAS[a], cw = 7, chh = 5, w = A.w * cw, h = A.h * chh, x0 = VW - w - 8, y0 = 6;
  ctx.fillStyle = 'rgba(7,4,5,0.75)'; ctx.fillRect(x0 - 3, y0 - 3, w + 6, h + 6); ctx.strokeStyle = '#4a1a1c'; ctx.strokeRect(x0 - 3.5, y0 - 3.5, w + 7, h + 7);
  for (var k in WORLD.rooms) {
    var r = WORLD.rooms[k]; if (r.area !== a) continue; var rs = RUN.rs[k]; if (!rs || !rs.v) continue;
    var rx = x0 + (r.cx - A.ox) * cw, ry = y0 + (r.cy - A.oy) * chh, cur = k === G.roomKey && !(L && L.arena);
    R(ctx, cur ? '#ff2630' : '#5a0f14', rx, ry, cw - 1, chh - 1);
    var dot = r.type === 'flume' ? '#fff6d8' : r.type === 'bossdoor' ? '#f1e7d0' : r.type === 'merchant' ? '#ffe36a' : r.type === 'powerup' ? '#7a8aff' : r.type === 'start' ? '#ff9ad0' : null; if (dot) R(ctx, dot, rx + 2, ry + 1, 2, 2);
    for (var d in r.ex) { var nk = key2(r.cx + DIRV[d][0], r.cy + DIRV[d][1]); if (!RUN.rs[nk] || !RUN.rs[nk].v) { R(ctx, '#a6968f', d === 'l' ? rx - 1 : d === 'r' ? rx + cw - 1 : rx + 2, d === 'u' ? ry - 1 : d === 'd' ? ry + chh - 1 : ry + 1, 2, 2); } }
  }
}
function drawHud() {
  if (G.mode === 'town') {
    ctx.drawImage(dropImg, 8, 8); text(fmtN(META.bank), 22, 17, 'left', '#ffe36a');
    text('BANK', 8, 30, 'left', '#a6968f', 6);
    return;
  }
  var c = CLASSES[RUN.cls];
  R(ctx, 'rgba(7,4,5,0.7)', 4, 4, 118, RUN.cls === 'homunculus' ? 44 : 40);
  if (RUN.cls === 'cumhead') { var ic = ATLAS.icon0; if (ic && ok(imgs.atlas)) { ctx.imageSmoothingEnabled = false; ctx.drawImage(imgs.atlas, ic[0], ic[1], ic[2], ic[3], 7, 7, 14, 17); } }
  else if (RUN.cls === 'homunculus') spr(homIcon(), 14, 27, false, [0.9, 0.75, 0.6][homSt()]);
  else spr(RUN.cls + '_s0', 14, 26, false, 0.5);
  bar(26, 8, 90, 7, P.hp / ST.mhp, P.hp < ST.mhp * 0.25 && Math.floor(G.t * 4) % 2 ? '#ffb040' : '#ff2630');
  text(Math.ceil(Math.max(0, P.hp)) + '/' + ST.mhp, 28, 15, 'left', '#f1e7d0', 5);
  bar(26, 18, 90, 4, P.mana / ST.mmana, P.mana >= c.specCost ? '#9a6aff' : '#4a3a7a', '#12081a');
  if (RUN.cls === 'homunculus') { bar(26, 25, 90, 3, homGrowFrac(), homOoze(), '#0a1a08'); text(homSt() >= 2 ? 'ADULT' : HOMSTNAME[homSt()] + ' ' + Math.floor(homGrowFrac() * 100) + '%', 116, 34, 'right', homOoze(), 5); }
  ctx.drawImage(dropImg, 8, 29); text(fmtN(RUN.drops), 22, 38, 'left', '#ffe36a', 7);
  if (RUN.powers.length) text('+' + RUN.powers.length, 116, RUN.cls === 'homunculus' ? 42 : 38, 'right', '#7a8aff', 6);
  drawMinimap();
  if (G.lock && !bosses.length && enemies.length) {
    // challenge rooms: how many are left, and arrows to any that are off screen
    text('FOES LEFT ' + enemies.length, VW / 2, 52, 'center', '#ffe36a', 7);
    var cx2 = G.cam.x;
    enemies.forEach(function (e) { var sx = e.x - cx2, sy = clamp(e.y - e.h / 2, 60, VH - 20); if (sx >= 0 && sx <= VW) return; var left = sx < 0, ax = left ? 8 : VW - 8, pl = 0.6 + 0.4 * Math.sin(G.t * 8);
      ctx.fillStyle = 'rgba(255,38,48,' + pl.toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(ax + (left ? -4 : 4), sy); ctx.lineTo(ax + (left ? 6 : -6), sy - 7); ctx.lineTo(ax + (left ? 6 : -6), sy + 7); ctx.fill(); });
  }
  if (bosses.length && G.mode === 'play') {
    var alive = bosses.filter(function (b) { return b.alive && b.id !== 'cowpig'; }), hp = 0, mh = 0; bosses.forEach(function (b) { if (b.id !== 'cowpig') { hp += Math.max(0, b.hp); mh += b.mhp; } });
    if (alive.length) { var bw = Math.min(220, VW - 80), bx = Math.round((VW - bw) / 2); bar(bx, VH - 22, bw, 6, hp / mh, '#ff2630'); text(BOSSDEF[G.bossGroup] ? BOSSDEF[G.bossGroup].name.toUpperCase() : '', VW / 2, VH - 26, 'center', '#f1e7d0', 6); }
  }
}
function drawPrompt(cx) {
  var e = G.near;
  if (!e && !G.paused && G.mode === 'play' && P.onGround && P.state === 'normal' && tileAt(P.x, P.y + 2) === TG) text('HOLD DOWN + JUMP', Math.round(P.x - cx), P.y - P.h - 16, 'center', '#ffe36a', 6);
  if (!e || G.paused) { el('bBt').textContent = G.mode === 'town' ? '·' : 'HIT'; el('bB').classList.remove('use'); return; }
  var t = e.k === 'grate' ? 'DOWN' : e.k === 'chest' ? 'OPEN' : e.k === 'door' ? 'ENTER' : e.k === 'npc' ? 'TALK' : e.k === 'altar' ? 'TAKE' : e.k === 'gate' ? 'ENTER' : e.k === 'bld' ? (META.built[e.b.id] ? 'ENTER' : 'BUY') : 'USE';
  el('bBt').textContent = t; el('bB').classList.add('use');
  var lbl = e.k === 'bld' ? (META.built[e.b.id] ? e.b.name : 'EMPTY LOT · ' + fmtN(e.b.cost)) : e.k === 'gate' ? 'THE CASTLE' : e.k === 'door' ? (e.boss === 'blum' ? 'THE BLUMHEAD DOOR' : BOSSDEF[e.boss].name) : e.k === 'npc' ? MERCHNAME[e.who] : '';
  var y = e.k === 'bld' || e.k === 'gate' ? 66 : e.y - (e.k === 'door' ? 92 : 44);
  text('B ' + t, Math.round(e.x - cx), y, 'center', '#ffe36a', 7); if (lbl) text(lbl.toUpperCase(), Math.round(e.x - cx), y + 11, 'center', '#f1e7d0', 6);
}
/* town street */
function drawTown(cx) {
  var gy = 15 * T;
  TOWN.ents.forEach(function (e) {
    var x = Math.round(e.x - cx); if (x < -160 || x > VW + 160) return;
    if (e.k === 'gate') { drawGate(x, gy); return; }
    var b = e.b, built = META.built[b.id];
    if (!built) { R(ctx, '#12040a', x - 44, gy - 6, 88, 6); R(ctx, '#3a2a1a', x - 2, gy - 46, 4, 40); R(ctx, '#12040a', x - 32, gy - 70, 64, 28); R(ctx, '#5a3a1a', x - 31, gy - 69, 62, 26); text('FOR SALE', x, gy - 58, 'center', '#ffe36a', 6); text(fmtN(b.cost), x, gy - 48, 'center', '#f1e7d0', 6); return; }
    if (b.fac && SPR[b.fac]) { var f = SPR[b.fac], sc = Math.min(1.7, 150 / f[3]); spr(b.fac, x, gy, false, sc); }
    else drawTent(x, gy);
    if (b.npc) spr(b.npc, x + (b.npc2 ? -14 : 0), gy, P.x < e.x, 1.15);
    if (b.npc2) spr(b.npc2, x + 14, gy, P.x < e.x, 1.15);
  });
}
function drawTent(x, gy) {
  ctx.fillStyle = '#2a0a3a'; ctx.beginPath(); ctx.moveTo(x - 52, gy); ctx.lineTo(x - 40, gy - 70); ctx.lineTo(x, gy - 96); ctx.lineTo(x + 40, gy - 70); ctx.lineTo(x + 52, gy); ctx.fill();
  ctx.fillStyle = '#5a1a8a'; ctx.beginPath(); ctx.moveTo(x - 40, gy - 70); ctx.lineTo(x, gy - 96); ctx.lineTo(x + 40, gy - 70); ctx.fill();
  ctx.fillStyle = '#1a0624'; ctx.beginPath(); ctx.moveTo(x - 22, gy); ctx.lineTo(x, gy - 60); ctx.lineTo(x + 22, gy); ctx.fill();
  R(ctx, '#12040a', x - 28, gy - 18, 56, 4); R(ctx, '#5a1a8a', x - 27, gy - 17, 54, 2); R(ctx, '#12040a', x - 24, gy - 14, 3, 14); R(ctx, '#12040a', x + 21, gy - 14, 3, 14);
  ctx.fillStyle = '#7dff9a'; ctx.font = '6px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillText('FATE', x, gy - 76);
}
function drawGate(x, gy) {
  ctx.fillStyle = '#0c0306'; ctx.fillRect(x - 90, gy - 200, 180, 200);
  ctx.beginPath(); ctx.moveTo(x - 100, gy - 200); ctx.lineTo(x - 70, gy - 236); ctx.lineTo(x - 40, gy - 200); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 40, gy - 200); ctx.lineTo(x + 70, gy - 236); ctx.lineTo(x + 100, gy - 200); ctx.fill();
  for (var i = -4; i <= 4; i++) R(ctx, '#0c0306', x + i * 20 - 6, gy - 212, 12, 12);
  ctx.fillStyle = '#1a0507'; ctx.beginPath(); ctx.moveTo(x - 40, gy); ctx.lineTo(x - 40, gy - 80); ctx.arc(x, gy - 80, 40, Math.PI, 0); ctx.lineTo(x + 40, gy); ctx.fill();
  ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 20; ctx.strokeStyle = '#ff2630'; ctx.lineWidth = 2; for (var b = -32; b <= 32; b += 10) { ctx.beginPath(); ctx.moveTo(x + b, gy); ctx.lineTo(x + b, gy - 80 - Math.sqrt(Math.max(0, 1600 - b * b)) + 4); ctx.stroke(); } ctx.restore();
  R(ctx, '#ff2630', x - 70, gy - 160, 10, 14); R(ctx, '#ff2630', x + 60, gy - 160, 10, 14); moon(x, gy - 150, 14);
  text('THE CASTLE', x, gy - 100, 'center', '#ffe36a', 7);
}

function render() {
  ctx.setTransform(M, 0, 0, M, 0, 0); ctx.imageSmoothingEnabled = true; ctx.fillStyle = '#070405'; ctx.fillRect(0, 0, VW, VH);
  if (G.mode === 'title' || !L) { drawVignette(); return; }
  var cx = Math.round(G.cam.x), sh = G.shake > 0 ? G.shake : 0;
  if (sh) ctx.translate(Math.round((Math.random() - 0.5) * sh), Math.round((Math.random() - 0.5) * sh));
  drawBack();
  if (!G.layer) buildLayer();
  ctx.imageSmoothingEnabled = false;
  if (G.mode === 'town') drawTown(cx);
  ctx.drawImage(G.layer, -cx, 0);
  if (G.lock) { for (var i = 0; i < L.tiles.length; i++) if (L.tiles[i] === TB) { var bx = (i % L.w) * T - cx, by = Math.floor(i / L.w) * T; ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 8; R(ctx, '#ff2630', bx + 3, by, 2, T); R(ctx, '#ff2630', bx + 10, by, 2, T); ctx.restore(); } }
  for (var k in G.crumble) { var ti = +k, tx = (ti % L.w) * T - cx, ty = Math.floor(ti / L.w) * T; R(ctx, 'rgba(0,0,0,0.6)', tx + (Math.random() - 0.5) * 2, ty, T, 7); }
  if (G.mode === 'play') {
    drawExits(cx);
    L.ents.forEach(function (e) { if (e.k === 'deco') drawDeco(e, cx); });
    L.ents.forEach(function (e) { if (e.k === 'steve') drawSteve(e, cx); });
    drawFlume(cx); drawLogs(cx);
    L.ents.forEach(function (e) { if (e.k === 'door') drawDoor(e, cx); else if (e.k === 'chest') drawChest(e, cx); else if (e.k === 'altar') drawAltar(e, cx); else if (e.k === 'turret') drawTurret(e, cx); else if (e.k === 'npc') drawNpcEnt(e, cx); });
  }
  for (i = 0; i < drops.length; i++) { var d = drops[i], bob = d.fly ? 0 : Math.sin(G.t * 4 + d.x * 0.05) * 1.5, dx = Math.round(d.x - cx) - 4; if (dx < -12 || dx > VW + 12) continue; if (d.fly && d.age > 7 && Math.floor(G.t * 14) % 2 === 0) continue; ctx.drawImage(dropImg, dx, Math.round(d.y + bob) - 5); }
  enemies.forEach(function (e) { drawEnemy(e, cx); });
  bosses.forEach(function (b) { if (b.alive) drawBoss(b, cx); });
  if (P.x !== undefined) drawPlayer(cx);
  drawShots(cx);
  for (i = 0; i < parts.length; i++) if (!parts[i].spark) R(ctx, parts[i].c, Math.round(parts[i].x - cx), Math.round(parts[i].y), 2, 2);
  fx.forEach(function (f) { if (f.k === 'zap') { ctx.strokeStyle = '#fff6a0'; ctx.lineWidth = 2; ctx.globalAlpha = 1 - f.age / 0.45; ctx.beginPath(); ctx.moveTo(f.x0 - cx, f.y0); for (var zi = 1; zi < 5; zi++) ctx.lineTo(f.x0 + (f.x1 - f.x0) * zi / 5 - cx + (Math.random() * 8 - 4), f.y0 + (f.y1 - f.y0) * zi / 5 + (Math.random() * 8 - 4)); ctx.lineTo(f.x1 - cx, f.y1); ctx.stroke(); ctx.globalAlpha = 1; return; } var a = f.age / 0.45; ctx.strokeStyle = f.c || '#f1e7d0'; ctx.globalAlpha = 1 - a; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x - cx, f.y, (f.big ? 120 : 30) * a + 4, 0, 6.28); ctx.stroke(); ctx.globalAlpha = 1; });
  if (G.fakeLayer && G.mode === 'play') { ctx.globalAlpha = (RUN && RUN.card === 'haunted') ? 0.45 : (G.inFake ? 0.82 : 1); ctx.drawImage(G.fakeLayer, -cx, 0); ctx.globalAlpha = 1; for (i = 0; i < parts.length; i++) if (parts[i].spark) { var sp2 = parts[i]; ctx.fillStyle = sp2.c; ctx.fillRect(Math.round(sp2.x - cx) - 1, Math.round(sp2.y), 3, 1); ctx.fillRect(Math.round(sp2.x - cx), Math.round(sp2.y) - 1, 1, 3); } }
  pops.forEach(function (p) { ctx.globalAlpha = 1 - p.age / 0.8; text(p.t, Math.round(p.x - cx), Math.round(p.y), 'center', p.c, 6); ctx.globalAlpha = 1; });
  ctx.imageSmoothingEnabled = true;
  if (sh) ctx.setTransform(M, 0, 0, M, 0, 0);
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + clamp(G.fade / 0.18, 0, 1) + ')'; ctx.fillRect(0, 0, VW, VH); }
  drawVignette();
  ctx.imageSmoothingEnabled = false; drawHud(); drawPrompt(cx); ctx.imageSmoothingEnabled = true;
  if (G.banner > 0) {
    ctx.globalAlpha = Math.min(1, G.banner / 0.5); ctx.font = '30px "Pirata One", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000'; ctx.fillText(G.bannerTxt, VW / 2 + 1, 92); ctx.save(); ctx.shadowColor = '#c4121c'; ctx.shadowBlur = 14; ctx.fillStyle = '#ff2630'; ctx.fillText(G.bannerTxt, VW / 2, 91); ctx.restore();
    if (G.bannerSub) text(G.bannerSub, VW / 2, 107, 'center', '#f1e7d0', 7); ctx.globalAlpha = 1;
  }
  if (G.msg) { var al = G.msg.age < 3 ? 1 : Math.max(0, 1 - (G.msg.age - 3)); ctx.globalAlpha = al; var tw = Math.min(VW - 20, G.msg.t.length * 6.2 + 20); R(ctx, 'rgba(7,4,5,0.85)', (VW - tw) / 2, 120, tw, 18); text(G.msg.t, VW / 2, 132, 'center', '#ffe36a', 6); ctx.globalAlpha = 1; }
}
function drawVignette() { if (vignette) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vignette, 0, 0); ctx.setTransform(M, 0, 0, M, 0, 0); } }
