/* ---------- drawing ---------- */
function ell(x, y, rx, ry, col) { var c = KIT.ctx; c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, 6.283); c.fill(); }
function circ(x, y, r, col, w) { var c = KIT.ctx; c.strokeStyle = col; c.lineWidth = w || 1; c.beginPath(); c.arc(Math.round(x), Math.round(y), Math.max(0.5, r), 0, 6.283); c.stroke(); }
function fmt(s) { s = Math.max(0, Math.floor(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
function draw() {
  H = KIT.H;
  if (G.mode === 'title' || !run) { drawTitle(); return; }
  var cx = Math.round(CAM.x), cy = Math.round(CAM.y), i;
  drawGround(cx, cy);
  // things on the floor
  hazards.forEach(function (z) { drawHazardFloor(z, cx, cy); });
  pools.forEach(function (p) { if (p.fire) { var fa = Math.min(1, (p.life - p.t) / 1.5); ell(p.x - cx, p.y - cy, p.r, p.r * 0.5, 'rgba(70,36,12,' + 0.7 * fa + ')'); for (var fi = 0; fi < 5; fi++) spr('lab_burn' + ((Math.floor(KIT.t * 10) + fi) % 4), p.x - cx - p.r * 0.7 + fi * p.r * 0.35, p.y - cy + 4, { sc: 0.35 * fa + 0.1 }); return; } var a = Math.min(1, (p.life - p.t) * 2) * (p.hold ? 0.35 : 0.6); ell(p.x - cx, p.y - cy, p.r, p.r * 0.55, 'rgba(184,160,112,' + a * 0.8 + ')'); ell(p.x - cx, p.y - cy, p.r - 3, p.r * 0.55 - 2, 'rgba(241,224,176,' + a + ')'); ell(p.x - cx - p.r * 0.3, p.y - cy - 2, p.r * 0.25, 1.5, 'rgba(255,255,255,' + a + ')'); });
  marks.forEach(function (m) { var k = m.t / m.at; shadow(m.x - cx, m.y - cy, m.r * k, m.r * k * 0.5); });
  marks2.forEach(function (m) { if (m.t < 0) return; var k = m.t / m.at; ell(m.x - cx, m.y - cy, m.r, m.r * 0.55, 'rgba(255,38,48,' + (0.12 + 0.18 * k) + ')'); circ(m.x - cx, m.y - cy, m.r * k, m.col, 2); });
  if (G.garlic !== undefined) {} var gw = wOf('garlic'); if (gw && gw.rad) { var pr = gw.rad * (1 + Math.sin(KIT.t * 6) * 0.04); ell(P.x - cx, P.y - 12 - cy, pr, pr, gw.evo ? 'rgba(255,240,200,0.16)' : 'rgba(241,231,208,0.10)'); circ(P.x - cx, P.y - 12 - cy, pr, 'rgba(241,231,208,0.35)', 1); }
  breakablesNear().forEach(function (b) { R('rgba(0,0,0,0.3)', b.x - cx - 8, b.y - cy - 2, 16, 4); spr(run.st.br, b.x - cx, b.y - cy); });
  drawCell(cx, cy);
  loot.forEach(function (o) { var x = o.x - cx, y = o.y - cy; if (x < -20 || x > KIT.W + 20 || y < -20 || y > H + 20) return;
    if (o.k === 'pearl') spr('pk_pearl' + o.tier, x, y + Math.sin(KIT.t * 4 + o.x) * 1, { anchor: 'c', sc: o.big ? 1.6 : 1 });
    else if (o.k === 'chest') { spr(o.big ? 'p_bigchest' : 'p_chest', x, y + 4); if (Math.floor(KIT.t * 3) % 2) R('#ffe36a', x - 1, y - 24, 2, 4); }
    else { R('rgba(0,0,0,0.3)', x - 6, y + 4, 12, 3); spr(PICKS[o.k].spr, x, y + 2 + Math.sin(KIT.t * 3 + o.x) * 2); } });
  // everything that stands, front to back
  foes.sort(byY); // nearly sorted already, so this is cheap
  var ex = EXTRA; ex.length = 0; ex.push(P);
  for (i = 0; i < run.weapons.length; i++) { var w = run.weapons[i]; if (w.pets) for (var q = 0; q < w.pets.length; q++) ex.push(w.pets[q]); if (w.cat) ex.push(w.cat); if (w.cats) for (q = 0; q < w.cats.length; q++) ex.push(w.cats[q]); }
  ex.sort(byY);
  var xi = 0, W2 = KIT.W + 80, H2 = H + 120;
  for (i = 0; i < foes.length; i++) { var e = foes[i]; while (xi < ex.length && ex[xi].y <= e.y) drawExtra(ex[xi++], cx, cy); if (e.dead) continue; var sx = e.x - cx, sy = e.y - cy; if (sx < -80 || sx > W2 || sy < -40 || sy > H2) continue; drawFoe(e, cx, cy); }
  while (xi < ex.length) drawExtra(ex[xi++], cx, cy);
  // above them
  hazards.forEach(function (z) { drawHazardTop(z, cx, cy); });
  marks.forEach(function (m) { var k = m.t / m.at; spr('sv_pie', m.x - cx, m.y - cy - (1 - k) * 160, { anchor: 'c', sc: 1.6, rot: k * 6 }); });
  marks2.forEach(function (m) { if (m.meteor && m.t > 0) { var k = m.t / m.at; spr('hz_meteor', m.x - cx + (1 - k) * 60, m.y - cy - (1 - k) * 200, { anchor: 'c', sc: m.r / 12 }); } });
  drawWeaponsTop(cx, cy);
  shots.forEach(function (s) { var x = s.x - cx, y = s.y - cy; if (x < -30 || x > KIT.W + 30 || y < -30 || y > H + 30) return;
    var a = Math.atan2(s.vy, s.vx), rot = s.k === 'drop' ? a - Math.PI / 2 : s.k === 'sperm' ? a : s.rot || 0;
    spr(s.spr, x, y, { anchor: 'c', rot: rot, flip: s.flip, sc: s.k === 'wave' ? s.r / 13 : s.k === 'drop' ? (s.r / 4) : s.sc || 1 }); });
  eshots.forEach(function (s) { drawEShot(s, s.x - cx, s.y - cy); });
  rings.forEach(function (g) { var a = 1 - Math.max(0, g.t - g.life) / 0.15; circ(g.x - cx, g.y - cy, g.r, g.col, g.big ? 6 : 3); if (g.big) { circ(g.x - cx, g.y - cy, g.r - 8, 'rgba(232,255,255,0.7)', 2); circ(g.x - cx, g.y - cy, g.r * 0.8, 'rgba(42,160,168,0.4)', 10); } else circ(g.x - cx, g.y - cy, g.r * 0.85, 'rgba(192,138,255,' + 0.3 * a + ')', 4); });
  fx.forEach(function (f) { drawFx(f, cx, cy); });
  if (G.freeze > 0) R('rgba(154,223,255,0.10)', 0, 0, KIT.W, H);
  if (run.endless) R('rgba(196,18,28,0.07)', 0, 0, KIT.W, H);
  drawVignette();
  for (i = 0; i < nums.length; i++) { var nm = nums[i]; numDraw(nm.s, nm.x - cx, nm.y - cy, nm.col, 1 - nm.t / 0.7); }
  drawHud();
}
var EXTRA = [];
function byY(a, b) { return a.y - b.y; }
function drawExtra(o, cx, cy) { if (o === P) drawPlayer(o, cx, cy); else if (o.b) drawPet(o, cx, cy); else drawCat(o, cx, cy); }
/* soft shadows, foe shots and damage numbers come from small cached pictures instead of being drawn shape by shape every frame */
function shadow(x, y, rx, ry) { var L = KIT.layer('shadow', 32, 12, function () { ell(16, 6, 15.5, 5.5, 'rgba(0,0,0,0.38)'); }); KIT.ctx.drawImage(L, Math.round(x - rx), Math.round(y - ry), Math.round(rx * 2), Math.round(ry * 2)); }
var ORBCOL = { fire: ['#ff9a30', '#ffe36a'], goo: ['#9a3ad8', '#d88aff'], bolt: ['#ffc840', '#ffffff'], orb: ['#c4121c', '#ff8a94'], shard: ['#c4121c', '#ff3a44'], cork: ['#6e3a1e', '#a8643a'] };
function orb(k, x, y, r) { var col = ORBCOL[k] || ORBCOL.orb, L = KIT.layer('orb_' + k, 16, 16, function () { ell(8, 8, 7, 7, '#12040a'); ell(8, 8, 6, 6, col[0]); ell(7, 7, 2.7, 2.7, col[1]); }); var s = (r + 1) / 7; KIT.ctx.drawImage(L, Math.round(x - 8 * s), Math.round(y - 8 * s), Math.round(16 * s), Math.round(16 * s)); }
var DIGITS = '0123456789+-', FONTOK = false, FONTOK_T = -9;
function digits(col) {
  if (!FONTOK) { if (KIT.t - (FONTOK_T || -9) < 1) return null; FONTOK_T = KIT.t; FONTOK = !!(document.fonts && document.fonts.check && document.fonts.check('8px "Press Start 2P"')); if (!FONTOK) return null; } // checked once a second until the font is in
  return KIT.layer('dg_' + col, DIGITS.length * 8, 10, function () { for (var i = 0; i < DIGITS.length; i++) text(DIGITS[i], i * 8, 1, { size: 8, col: col }); });
}
function numDraw(s, x, y, col, a) {
  var L = /[^0-9+\-]/.test(s) ? null : digits(col); if (!L) { text(s, x, y, { size: 8, col: col, align: 'center', alpha: a }); return; }
  var c = KIT.ctx, S = KIT.S, x0 = Math.round(x - s.length * 4); c.globalAlpha = a;
  for (var i = 0; i < s.length; i++) { var k = DIGITS.indexOf(s[i]); if (k >= 0) c.drawImage(L, k * 8 * S, 0, 8 * S, 10 * S, x0 + i * 8, Math.round(y), 8, 10); }
  c.globalAlpha = 1;
}
function drawPlayer(o, cx, cy) {
  var x = P.x - cx, y = P.y - cy, bob = Math.sin(KIT.t * 4) * 2;
  shadow(x, y + 1, 14, 4);
  if (G.frenzy > 0) ell(x, y - 22, 22, 26, 'rgba(255,38,48,' + (0.1 + Math.sin(KIT.t * 12) * 0.05) + ')');
  if (P.inv > 0 && P.dashT <= 0 && Math.floor(KIT.t * 20) % 2) return;
  var f = P.moving ? 'spermaid_s' + (Math.floor(P.walk) % 3) : 'spermaid_s' + (Math.floor(KIT.t * 3) % 3);
  if (G.mode === 'dead') f = 'spermaid_dead';
  spr(f, x, y + bob - 2, { flip: P.face < 0, flash: P.hurtT > 0, rot: P.dashT > 0 ? P.face * 0.5 : P.moving ? P.face * 0.08 : 0 });
  // health under her feet
  if (P.hp < P.max) { R('#12040a', x - 16, y + 5, 32, 4); R('#4a0a10', x - 15, y + 6, 30, 2); R('#ff2630', x - 15, y + 6, 30 * P.hp / P.max, 2); }
  if (P.dashCd > 0) R('rgba(42,160,168,0.8)', x - 15, y + 10, 30 * (1 - P.dashCd / 1.8), 1);
}
function drawFoe(e, cx, cy) {
  var x = e.x - cx, y = e.y - cy;
  if (e.under !== undefined) { ell(x, y, 10, 4, 'rgba(60,40,30,0.8)'); if (Math.floor(KIT.t * 10) % 2) R('#a8987a', x - 1, y - 2, 2, 2); return; }
  var name, fr;
  if (e.boss) { name = 'f_' + e.k + '_' + (Math.floor(e.t * 3) % 2); }
  else { fr = Math.floor(e.t * 8 * (e.f.ai === 'fly' ? 1.4 : 1)) % 4; name = 'f_' + e.k + '_' + fr; }
  var sc = e.sc * (e.boss ? 1 : 1), wb = e.f.ai === 'fly' || e.f.fly ? -8 + Math.sin(e.t * 5) * 2 : 0;
  shadow(x, y + 1, e.r * 1.1, Math.max(2, e.r * 0.35));
  if (e.elite) ell(x, y - e.r, e.r * 1.6, e.r * 1.6, 'rgba(255,38,48,' + (0.18 + Math.sin(KIT.t * 6) * 0.06) + ')');
  if (G.freeze > 0) ell(x, y, e.r * 1.2, e.r * 0.5, 'rgba(154,223,255,0.6)');
  var alpha = e.f.ghost ? 0.55 : 1;
  if (e.boss && e.act && e.act.k === 'charge' && e.act.t < 0.6) alpha = Math.floor(KIT.t * 16) % 2 ? 0.6 : 1;
  spr(name, x, y + wb + 2, { flip: e.face < 0, sc: sc, flash: e.flash > 0, alpha: alpha });
  if (e.confT > 0) text('?', x, y - e.r * 2 - 14, { size: 8, col: '#ffe36a', align: 'center' });
  if (e.elite) { var w = 30; R('#12040a', x - w / 2 - 1, y + 6, w + 2, 4); R('#ff2630', x - w / 2, y + 7, w * Math.max(0, e.hp / e.mhp), 2); }
  if (e.boss && e.beams !== null && e.beams !== undefined || e.beamWarn !== null && e.beamWarn !== undefined) {
    var ang = e.beams !== null && e.beams !== undefined ? e.beams : e.beamWarn, on = e.beams !== null && e.beams !== undefined, c = KIT.ctx;
    for (var b = 0; b < 4; b++) { var a = ang + b * Math.PI / 2; c.strokeStyle = on ? 'rgba(255,38,48,0.85)' : 'rgba(255,38,48,0.25)'; c.lineWidth = on ? 8 : 2; c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x + Math.cos(a) * 700, y - 30 + Math.sin(a) * 700); c.stroke(); if (on) { c.strokeStyle = 'rgba(255,220,220,0.9)'; c.lineWidth = 2; c.stroke(); } }
  }
}
function drawPet(p, cx, cy) {
  var st = ['baby', 'teen', 'adult'][p.st || 0], f = 'h_' + p.b + '_' + st + '_run' + (Math.floor(p.t * (p.mv ? 10 : 3)) % 4);
  if (!KIT.has(f)) f = 'h_' + p.b + '_' + st + '_idle0';
  shadow(p.x - cx, p.y - cy + 1, 8, 3); spr(f, p.x - cx, p.y - cy + 2, { flip: p.face < 0, sc: p.atk > 0 ? 1.1 : 1 });
}
function drawCat(c, cx, cy) { shadow(c.x - cx, c.y - cy + 1, 9, 3); spr('cat', c.x - cx, c.y - cy - (c.z || 0) + 2, { flip: (c.face || 1) < 0, rot: c.j ? (c.face || 1) * -0.4 : 0 }); }
function drawWeaponsTop(cx, cy) {
  run.weapons.forEach(function (w) {
    if (w.id === 'bubble' && w.on && w.pts) w.pts.forEach(function (p) { var x = p[0] - cx, y = p[1] - cy; ell(x, y, p[2], p[2], 'rgba(154,223,255,0.22)'); circ(x, y, p[2], w.evo ? '#ffe36a' : '#9adfff', 1.5); R('#ffffff', x - p[2] * 0.45, y - p[2] * 0.5, 2, 2); });
    if (w.id === 'sausage' && w.evo && w.pts) w.pts.forEach(function (p, i) { var x = p[0] - cx, y = p[1] - cy; ell(x, y + 12, 22, 6, 'rgba(0,0,0,0.3)'); for (var k = 0; k < 9; k++) { var a = KIT.t * 10 + k * 0.9 + i, r = 6 + k * 2.6; spr('sv_sausage', x + Math.cos(a) * r, y + 10 - k * 5 + Math.sin(a) * r * 0.3, { anchor: 'c', rot: a, sc: 0.9 }); } for (var q = 0; q < 3; q++) circ(x, y - q * 12, 10 + q * 6, 'rgba(166,150,143,0.25)', 2); });
  });
}
function drawEShot(s, x, y) {
  if (x < -20 || x > KIT.W + 20 || y < -20 || y > H + 20) return;
  var k = s.k;
  if (k === 'pie') return spr('sv_pie', x, y, { anchor: 'c', sc: 0.8, rot: s.t * 8 });
  if (k === 'bone') return spr('dc_bones', x, y, { anchor: 'c', sc: 0.8, rot: s.t * 10 });
  if (k === 'coin') return spr('coin', x, y, { anchor: 'c', sc: 0.6 });
  if (k === 'dagger') { var a = Math.atan2(s.vy, s.vx), c = KIT.ctx; c.strokeStyle = '#d8d0d8'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - Math.cos(a) * 5, y - Math.sin(a) * 5); c.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); c.stroke(); return; }
  orb(k, x, y, s.r);
}
function drawFx(f, cx, cy) {
  var x = f.x - cx, y = f.y - cy, k = f.t / f.life, c = KIT.ctx;
  if (f.k === 'pt') R(f.col, x, y, 2, 2);
  else if (f.k === 'bub') { circ(x, y - k * 10, 2 + k * 2, 'rgba(154,223,255,' + (1 - k) + ')', 1); }
  else if (f.k === 'slap') { c.save(); c.globalAlpha = 1 - k; c.fillStyle = 'rgba(42,160,168,0.5)'; c.beginPath(); c.ellipse(x + f.dir * f.w / 2, y, f.w / 2, f.h / 2, 0, f.dir > 0 ? -1.6 : 1.6, f.dir > 0 ? 1.6 : 4.7); c.fill(); c.strokeStyle = '#e8ffff'; c.lineWidth = 2; c.beginPath(); c.ellipse(x + f.dir * f.w / 2, y, f.w / 2, f.h / 2, 0, f.dir > 0 ? -1.2 : 1.9, f.dir > 0 ? 1.2 : 4.4); c.stroke(); c.restore(); }
  else if (f.k === 'bolt') { c.strokeStyle = 'rgba(255,240,154,' + (1 - k) + ')'; c.lineWidth = 3; c.beginPath(); var yy = y - 220, xx = x + rnd(-10, 10); c.moveTo(xx, yy); for (var i = 1; i <= 6; i++) c.lineTo(x + rnd(-9, 9) * (1 - i / 6), yy + (y - yy) * i / 6); c.stroke(); c.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; c.lineWidth = 1; c.stroke(); ell(x, y, 16 * (1 - k) + 4, 7 * (1 - k) + 2, 'rgba(255,240,154,' + (0.6 * (1 - k)) + ')'); }
  else if (f.k === 'arc') { c.strokeStyle = 'rgba(255,240,154,' + (1 - k) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); var x2 = f.x2 - cx, y2 = f.y2 - cy; for (var j = 1; j <= 4; j++) c.lineTo(lerp(x, x2, j / 4) + rnd(-5, 5), lerp(y, y2, j / 4) + rnd(-5, 5)); c.stroke(); }
  else if (f.k === 'ring') circ(x, y, f.r * (0.6 + k * 0.6), f.col, 3 * (1 - k) + 1);
  else if (f.k === 'splat') spr('sv_splat', x, y + 4, { anchor: 'c', alpha: 1 - k, sc: (f.sc || 1) * (1 + k * 0.4) });
  else if (f.k === 'z') text('z', x + k * 10, y - k * 20, { size: 8, col: '#f1e7d0', alpha: 1 - k });
  else if (f.k === 'nado') { var nx = -40 + k * (KIT.W + 80); for (var q = 0; q < 14; q++) { var a = KIT.t * 12 + q * 0.9, r = 10 + q * 5; spr('sv_sausage', nx + Math.cos(a) * r, H / 2 + 80 - q * 13 + Math.sin(a) * r * 0.3, { anchor: 'c', rot: a, sc: 1.2 }); } }
}
function drawHazardFloor(z, cx, cy) {
  var warn = z.t < (z.warn || 0), x = z.x - cx, y = z.y - cy, blink = Math.floor(KIT.t * 8) % 2;
  if (z.k === 'burn') { var a = Math.min(1, (z.life - z.t)); ell(x, y, z.r, z.r * 0.5, 'rgba(255,90,20,' + 0.45 * a + ')'); if (Math.random() < 0.3) R('#ffe36a', x + rnd(-6, 6), y - rnd(0, 6), 1, 2); }
  else if (z.k === 'hand' || z.k === 'vent' || z.k === 'chand') { if (warn) { var kk = z.t / z.warn; ell(x, y, z.r, z.r * 0.55, z.k === 'vent' ? 'rgba(255,154,48,' + 0.15 * (1 + kk) + ')' : 'rgba(0,0,0,' + 0.25 * (1 + kk) + ')'); circ(x, y, z.r * kk, z.k === 'vent' ? '#ff9a30' : '#ff2630', 1); } else if (z.k === 'vent') ell(x, y, z.r, z.r * 0.5, 'rgba(255,154,48,0.4)'); }
  else if (z.k === 'goo') { var g = warn ? z.t / z.warn : Math.min(1, (z.life - z.t) / 1); ell(x, y, z.r * g, z.r * 0.55 * g, 'rgba(154,58,216,0.55)'); ell(x - 6, y - 2, z.r * 0.3 * g, 3 * g, 'rgba(216,138,255,0.6)'); }
  else if (z.k === 'coaster' && warn) { if (blink) { R('rgba(255,38,48,0.14)', 0, y - 14, KIT.W, 28); } R('#ff2630', 0, y - 15, KIT.W, 1); R('#ff2630', 0, y + 14, KIT.W, 1); for (var bx = 8; bx < KIT.W; bx += 24) R(blink ? '#ffe36a' : '#6a0a10', bx, y - 17, 3, 3); }
  else if (z.k === 'pin' && warn) { R('#ff2630', x - 81, 0, 1, H); R('#ff2630', x + 80, 0, 1, H); if (blink) for (var py = 20; py < H; py += 46) text(z.dir > 0 ? 'v' : '^', x, py, { size: 8, align: 'center', col: '#ff2630' }); }
  else if (z.k === 'flush' && warn) { var ex = z.dir > 0 ? 8 : KIT.W - 20; if (blink) for (var ay = 40; ay < H - 20; ay += 40) text(z.dir > 0 ? '>>' : '<<', ex, ay, { size: 8, col: '#f1e0b0' }); }
}
function drawHazardTop(z, cx, cy) {
  var live = z.t >= (z.warn || 0), x = z.x - cx, y = z.y - cy;
  if (!live) { if (z.k === 'chand') { var k = z.t / z.warn; spr('hz_chand', x, y - (1 - k) * 220 - 6, { sc: 1.2 }); } return; }
  if (z.k === 'coaster') for (var c = 0; c < 3; c++) spr('hz_coaster', x - z.dir * c * 34, y + 8, { flip: z.dir < 0, sc: 1.2 });
  else if (z.k === 'pin') spr('hz_pin', x, y + 20, { sc: 4, rot: 0 });
  else if (z.k === 'hand' && z.t < z.life) spr('f_gravehand_' + Math.min(3, Math.floor((z.t - z.warn) * 8)), x, y + 2, { sc: 1.3 });
  else if (z.k === 'vent') { var fk = Math.min(1, (z.life - z.t) * 2); for (var i = 0; i < 9; i++) { var rr = (z.r * (1 - i / 11)) * fk, ox = Math.sin(KIT.t * 20 + i * 1.7) * 3 * i / 3; ell(x + ox, y - i * 7 - 4, rr, rr * 0.8, i < 3 ? 'rgba(196,48,26,0.85)' : i < 6 ? 'rgba(255,154,48,0.8)' : 'rgba(255,227,106,0.75)'); } ell(x, y, z.r, z.r * 0.45, 'rgba(255,240,154,0.5)'); }
  else if (z.k === 'chand' && z.t < z.warn + 0.5) { spr('hz_chand', x, y + 4, { sc: 1.2, alpha: 1 - (z.t - z.warn) * 2 }); }
  else if (z.k === 'flush') { var X = z.x - cx; R('rgba(184,160,112,0.9)', X - 34, 0, 68, H); R('#f1e0b0', X - 28, 0, 56, H); for (var j = 0; j < 12; j++) R('#ffffff', X + 14 * z.dir + rnd(-6, 6), j * 30 + (KIT.t * 200 % 30), 4, 10); R('rgba(255,255,255,0.6)', X + (z.dir > 0 ? 24 : -28), 0, 4, H); }
}
function drawCell(cx, cy) {
  var c = run.cell; if (!c) return; var x = c.x - cx, y = c.y - cy;
  if (x > -60 && x < KIT.W + 60 && y > -80 && y < H + 40) {
    if (!c.freed) spr(FRIENDS[c.id].spr, x, y - 6); spr(c.freed ? 'p_cellopen' : 'p_cell', x, y + 4);
    if (!c.freed && c.t > 0) { var k = c.t / 1.4, cc = KIT.ctx; cc.strokeStyle = '#ffe36a'; cc.lineWidth = 3; cc.beginPath(); cc.arc(x, y - 30, 30, -Math.PI / 2, -Math.PI / 2 + k * 6.283); cc.stroke(); }
  }
}
function drawHud() {
  var WW = KIT.W, i;
  // experience
  R('#12040a', 0, 0, WW, 8); R('#3a0a10', 1, 1, WW - 2, 6); R('#c4121c', 1, 1, (WW - 2) * Math.min(1, run.xp / run.need), 6); R('rgba(255,255,255,0.3)', 1, 1, (WW - 2) * Math.min(1, run.xp / run.need), 1);
  text('LV ' + run.lvl, 6, 54, { size: 8 });
  // weapons and charms
  for (i = 0; i < 6; i++) { var w = run.weapons[i], x = 6 + i * 19, y = 11; R('#12040a', x - 1, y - 1, 18, 18); R(w && w.evo ? '#a8741a' : '#2a0a0e', x, y, 16, 16); if (w) { spr('ic_' + w.id, x, y, { anchor: 'tl' }); if (!w.evo) for (var l = 0; l < w.lv; l++) R(l < 7 ? '#f1e7d0' : '#ffe36a', x + l * 2, y + 17, 1, 2); else R('#ffe36a', x, y + 17, 16, 2); } }
  for (i = 0; i < 6; i++) { var c = run.charms[i], x2 = 6 + i * 19, y2 = 32; R('#12040a', x2 - 1, y2 - 1, 18, 18); R('#1a080a', x2, y2, 16, 16); if (c) { spr('ic_' + c.id, x2, y2, { anchor: 'tl' }); for (var l2 = 0; l2 < c.lv; l2++) R('#c4121c', x2 + l2 * 3, y2 + 17, 2, 2); } }
  // the clock
  var tleft = run.endless ? run.t - DAWN : DAWN - run.t;
  text(run.miniDone >= 3 && !run.cleared && !run.endless ? 'DAWN' : fmt(Math.max(0, tleft)), WW / 2, 10, { size: 24, font: 'title', align: 'center', col: run.endless ? '#ff2630' : '#f1e7d0' });
  text(run.endless ? 'ENDLESS NIGHT' : run.miniDone >= 3 && !run.cleared ? 'KILL IT' : 'UNTIL DAWN', WW / 2, 38, { size: 6, align: 'center', col: '#a6968f' });
  // kills and drops
  text(String(run.kills), WW - 22, 50, { size: 8, align: 'right' }); spr('cumface', WW - 10, 59, { sc: 0.45 });
  text(String(Math.floor(run.gold)), WW - 22, 64, { size: 8, align: 'right', col: '#ffe36a' }); spr('pk_gold', WW - 11, 74, {});
  // the tidal wave and timers
  var bw = 130, bx = WW / 2 - bw / 2, by = H - 14, full = P.wave >= 1;
  KIT.bar(bx, by, bw, 5, P.wave, full ? (Math.floor(KIT.t * 6) % 2 ? '#7ae0e0' : '#2aa0a8') : '#2aa0a8', '#0e2226');
  text(full ? 'A  TIDAL WAVE' : 'TIDAL WAVE', WW / 2, by - 9, { size: 6, align: 'center', col: full ? '#e8ffff' : '#6a8a8e' });
  var tx = bx + bw + 8; if (G.frenzy > 0) { spr('pk_cuppa', tx, by + 7); tx += 16; } if (G.freeze > 0) { spr('pk_egg', tx, by + 7); tx += 14; }
  if (run.revives > 0) spr('pk_heart', bx - 14, by + 7);
  // the big foe's health
  var bs = foes.filter(function (e) { return e.boss && !e.dead; });
  if (bs.length) { var hp = 0, mhp = 0; bs.forEach(function (b) { hp += b.hp; mhp += b.mhp; }); var bwid = Math.min(300, WW - 60); KIT.bar(WW / 2 - bwid / 2, 54, bwid, 5, hp / mhp, '#c4121c'); text(bs[0].B.n.toUpperCase(), WW / 2, 62, { size: 6, align: 'center' }); }
  // which way the friend's cell is
  var cl = run.cell; if (cl && !cl.freed) { var sx = cl.x - CAM.x, sy = cl.y - CAM.y; if (sx < 0 || sx > WW || sy < 0 || sy > H) { var a = Math.atan2(sy - H / 2, sx - WW / 2), ex = clamp(WW / 2 + Math.cos(a) * 1000, 22, WW - 22), ey = clamp(H / 2 + Math.sin(a) * 1000, 64, H - 30); var kk = Math.min((WW / 2 - 22) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - 40) / Math.abs(Math.sin(a) || 1e-6)); ex = WW / 2 + Math.cos(a) * kk; ey = H / 2 + Math.sin(a) * kk;
    spr(FRIENDS[cl.id].spr, ex, ey + 8, { sc: 0.5 }); var c2 = KIT.ctx; c2.fillStyle = '#ffe36a'; c2.beginPath(); c2.moveTo(ex + Math.cos(a) * 16, ey + Math.sin(a) * 16); c2.lineTo(ex + Math.cos(a + 2.5) * 8, ey + Math.sin(a + 2.5) * 8); c2.lineTo(ex + Math.cos(a - 2.5) * 8, ey + Math.sin(a - 2.5) * 8); c2.fill(); } }
  // messages
  if (banner) { var al = Math.min(1, banner.t * 2), yy = banner.small ? 78 : 84;
    text(banner.a, WW / 2, yy, { size: banner.small ? 18 : 30, font: 'title', align: 'center', col: banner.boss ? '#ff2630' : banner.small ? '#ffe36a' : '#ff2630', alpha: al, max: WW - 40 });
    text(banner.b, WW / 2, yy + (banner.small ? 22 : 34), { size: banner.quote ? 8 : 8, align: 'center', alpha: al, max: WW - 30, col: banner.quote ? '#f1e7d0' : '#a6968f' }); }
}
/* the title: Spermaid holds out in a ring of foes while the menu is up */
var TT = { foes: [] };
function titleStep(dt) {
  TT.t = (TT.t || 0) + dt;
  if (TT.foes.length < 22) { var k = pick(['bat', 'crawler', 'rat', 'ghoul', 'clown', 'skeleton', 'blumling', 'imp', 'creamblob', 'wraith']), a = Math.random() * 6.283; TT.foes.push({ k: k, a: a, d: 260 + Math.random() * 60, t: Math.random() * 3 }); }
  TT.foes.forEach(function (f) { f.t += dt; f.d -= dt * 30; f.a += dt * 0.1; });
  TT.foes = TT.foes.filter(function (f) { return f.d > 60; });
}
function drawTitle() {
  var L = KIT.layer('gr_castle', TILE, TILE, PAINT.castle), off = (KIT.t * 6) % TILE;
  for (var y = -TILE; y < H + TILE; y += TILE) for (var x = -TILE; x < KIT.W + TILE; x += TILE) KIT.blit(L, x - off, y);
  var cx = KIT.W * 0.28, cy = H * 0.62;
  TT.foes.slice().sort(function (a, b) { return Math.sin(a.a) - Math.sin(b.a); }).forEach(function (f) { var x = cx + Math.cos(f.a) * f.d, y = cy + Math.sin(f.a) * f.d * 0.6; shadow(x, y, 8, 3); spr('f_' + f.k + '_' + (Math.floor(f.t * 8) % 4), x, y, { flip: Math.cos(f.a) > 0, alpha: Math.min(1, (f.d - 60) / 40) }); });
  var t = KIT.t; ell(cx, cy + 1, 22, 6, 'rgba(0,0,0,0.5)');
  for (var i = 0; i < 4; i++) { var a = t * 2.6 + i * 1.57; ell(cx + Math.cos(a) * 60, cy - 30 + Math.sin(a) * 36, 9, 9, 'rgba(154,223,255,0.22)'); circ(cx + Math.cos(a) * 60, cy - 30 + Math.sin(a) * 36, 9, '#9adfff', 1.5); }
  spr('spermaid_s' + (Math.floor(t * 4) % 3), cx, cy + Math.sin(t * 3) * 3, { sc: 2 });
  drawVignette(); R('rgba(7,4,5,0.35)', 0, 0, KIT.W, H);
}
