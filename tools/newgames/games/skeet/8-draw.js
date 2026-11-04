/* =====================================================================================================
   DRAWING: the fight (sorted by depth, shadows under everyone, hit sparks, swooshes, the weapon in your hand), the
   Street Fighter style HUD (your face, health with a damage trail, the super meter, the boss bar across the top),
   combo counter, call-outs, the super cut-in, and every screen.
   ===================================================================================================== */
function T(s, x, y, o) { KIT.text(s, x, y, o); }
function heroFrame(e) {
  var H = e.hero, st = e.st, m = e.mv;
  if (st === 'down' || st === 'dead') return H.down;
  if (st === 'air') return H.hurt; if (st === 'hurt' || st === 'grabbed') return H.hurt; if (st === 'getup') return H.crouch;
  if (m) { if (m.rise && e.mvT < m.st) return H.crouch; if (m.kind === 'ring' || m.kind === 'ground') return e.mvT < m.st ? H.wind : H.crouch; if (e.mvT < m.st * 0.6 && m.st > 0.07) return H.wind; return m.pose || H.combo[0].pose; }
  if (st === 'grab') return H.combo[1].pose;
  if (e.h > 0) { var J = H.jumpA; return J[Math.min(J.length - 1, Math.floor((1 - clamp(e.vh / H.jump, -1, 1)) * J.length / 2))]; }
  if (st === 'run') return H.runA[Math.floor(e.anim * 14) % H.runA.length];
  if (st === 'walk') return H.walk[Math.floor(e.anim * H.walkF) % H.walk.length];
  return H.idle[Math.floor(G.t * H.idleF) % H.idle.length];
}
function foeFrame(e) {
  var fr = e.fr, st = e.st;
  if (e.st === 'freedom' && fr.free) return fr.free + (e.t > 0.6 ? 'run' + (Math.floor(e.anim * 10) % 4) : 'idle0');
  if (st === 'wind') return fr.wind; if (st === 'atk' || st === 'holding') return fr.atk; if (st === 'leap') return fr.jump || fr.atk;
  if (st === 'hurt' || st === 'air' || st === 'grabbed' || st === 'thrown' || st === 'down' || st === 'dead' || st === 'getup') return fr.hurt || fr.wind;
  if (st === 'walk') return fr.walk[Math.floor(e.anim * 8) % 4];
  return fr.walk[0];
}
function bossFrame(e) {
  var d = e.def, s = e.spr;
  if (e.bid === 'titan' && e.hp <= 0) return 'h_titan_adult_hurt';
  if (e.st === 'move' && d.atk && e.pose === 'atk') return d.atk; if ((e.st === 'hurt' || e.st === 'air' || e.st === 'down') && d.hurt) return d.hurt;
  if (s.length > 2) return e.st === 'walk' || (e.st === 'move' && e.vx) ? s[1 + Math.floor(e.anim * 8) % 4] : s[0];
  return s[Math.floor(G.t * (e.st === 'move' ? 6 : 3)) % s.length];
}
function shadow(x, z, w, h) { var g = KIT.ctx, a = Math.max(0.15, 0.5 - h / 300); g.fillStyle = 'rgba(0,0,0,' + a.toFixed(2) + ')'; g.beginPath(); g.ellipse(Math.round(x), Math.round(FLOOR + z), w * 0.6 * (1 - Math.min(0.5, h / 200)), 3, 0, 0, 6.3); g.fill(); }
function drawFighter(e) {
  var x = e.x - G.cam, y = sy(e) - e.h, g = KIT.ctx, name, sc = e.sc || 1, flip, rot = 0;
  if (e.team === 'p') { name = heroFrame(e); flip = e.face < 0; if (e.mv && e.mv.spin && e.mv.rise) flip = Math.floor(G.t * 16) % 2 ? !flip : flip; }
  else if (e.boss) { name = bossFrame(e); flip = e.face < 0; }
  else { name = foeFrame(e); flip = e.face < 0; }
  // lying down: foes without a lying frame are tipped over
  var lying = (e.st === 'down' || e.st === 'dead') && !(e.team === 'p') && !(e.boss && e.bid === 'titan');
  if (lying) rot = (flip ? 1 : -1) * Math.PI / 2;
  if ((e.st === 'air' || e.st === 'thrown') && e.team !== 'p' && !e.boss) rot = (flip ? 1 : -1) * Math.min(Math.PI / 2, e.t * 5);
  if (e.st === 'dead' && Math.floor(e.t * 14) % 2) return; // blink out
  if (e.team === 'p' && e.inv > 0 && e.st !== 'getup' && Math.floor(G.t * 20) % 2 && !G.sup) return;
  var o = { flip: flip, sc: sc, flash: e.flash > 0, alpha: e.alpha !== undefined && e.alpha < 1 ? e.alpha : undefined, rot: rot || undefined };
  if (rot) { var sz = KIT.size(name); KIT.spr(name, x, y - sz.w * sc * 0.5 + sz.h * sc * 0.1, { flip: flip, sc: sc, rot: rot, anchor: 'c', flash: o.flash }); }
  else KIT.spr(name, x, y, o);
  // the goo on a brainwashed one: drips and two glowing eyes of light
  if (e.washed && e.hp > 0 && Math.random() < 0.08) G.fx.push({ k: 'drip', x: e.x + rnd(-6, 6), z: e.z, h: e.h + e.ht * rnd(0.4, 0.9), t: 0, life: 0.5 });
  if (e.bubbled > 0 && e.st === 'hurt') { g.strokeStyle = '#9adfff'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - e.ht / 2, e.ht * 0.6, 0, 6.3); g.stroke(); R('#ffffff', x - e.ht * 0.3, y - e.ht * 0.8, 3, 3); }
  if (e.silly > 0) for (var i = 0; i < 3; i++) R(i % 2 ? '#ff9ad0' : '#ffffff', x + Math.cos(G.t * 6 + i * 2) * 12, y - e.ht - 4 + Math.sin(G.t * 6 + i * 2) * 3, 2, 2);
  if (e.stun > 0.9 && e.st === 'hurt' && e.boss) for (var j = 0; j < 3; j++) KIT.spr('fx_star', x + Math.cos(G.t * 5 + j * 2.1) * 16, y - e.ht * sc - 2 + Math.sin(G.t * 5 + j * 2.1) * 3, {});
  if (e.team === 'p') drawHeld(e, x, y);
  if (e.team === 'p' && e.fire > 0 && Math.random() < 0.5) G.fx.push({ k: 'spr', spr: 's_fire', x: e.x + rnd(-8, 8), z: e.z, h: e.h + rnd(10, 40), vh: 40, t: 0, life: 0.3, sc: 0.6 });
  if (e.team === 'p' && e.shieldT > 0) { g.strokeStyle = 'rgba(154,255,90,0.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - e.ht / 2, 18, e.ht * 0.6, 0, 0, 6.3); g.stroke(); }
  // a swoosh while a move is out
  var m = e.mv; if (m && m.arc && e.mvT >= m.st && e.mvT < m.st + m.ac + 0.05 && m.box) { var b = m.box, k = (e.mvT - m.st) / (m.ac + 0.05); g.strokeStyle = m.arc; g.lineWidth = 3; g.beginPath(); var cx = x + e.face * (b[0] + b[1]) / 2 * 0.7, cy = y - (b[2] + b[3]) / 2, r = (b[1] - b[0]) * 0.55; if (e.face > 0) g.arc(cx, cy, r, -1.6 + k * 0.6, -1.6 + k * 0.6 + 2.2); else g.arc(cx, cy, r, Math.PI + 1.6 - k * 0.6 - 2.2, Math.PI + 1.6 - k * 0.6); g.stroke(); g.lineWidth = 1; }
}
function drawHeld(e, x, y) {
  if (!e.weapon || e.st === 'down' || e.st === 'dead') return; var w = WEAPONS[e.weapon.id], m = e.mv, swing = 0;
  if (m && m.weap) { var k = clamp(e.mvT / (m.st + m.ac), 0, 1); swing = -1.4 + k * 2.0; } else swing = -0.6 + Math.sin(G.t * 3) * 0.05;
  KIT.spr(e.weapon.id, x + e.face * 8, y - e.ht * 0.5, { flip: e.face < 0, rot: swing * e.face, anchor: 'c' });
}
function drawWorld() {
  drawBack();
  var g = KIT.ctx;
  G.puddles.forEach(function (q) { g.fillStyle = q.col; g.beginPath(); g.ellipse(q.x - G.cam, FLOOR + q.z, q.r, 4, 0, 0, 6.3); g.fill(); });
  (G.waves || []).forEach(function (w) { g.strokeStyle = '#ffe36a'; g.lineWidth = 3; g.beginPath(); g.ellipse(w.x - G.cam, FLOOR + w.z, w.r, w.r / 2.6, 0, 0, 6.3); g.stroke(); g.strokeStyle = '#ff9a30'; g.lineWidth = 1; g.beginPath(); g.ellipse(w.x - G.cam, FLOOR + w.z, w.r - 4, (w.r - 4) / 2.6, 0, 0, 6.3); g.stroke(); });
  G.fx.forEach(function (f) { if (f.k === 'mark') { var a = Math.floor(f.t * 12) % 2; g.strokeStyle = a ? '#ff2630' : '#ffe36a'; g.lineWidth = 2; g.beginPath(); g.ellipse(f.x - G.cam, FLOOR + f.z, f.r, f.r / 3, 0, 0, 6.3); g.stroke(); g.lineWidth = 1; } });
  // everything that stands on the floor, far ones first
  var L = [];
  G.props.forEach(function (p) { L.push({ z: p.z, f: function () { shadow(p.x - G.cam, p.z, 16, 0); KIT.spr(p.spr, p.x - G.cam, FLOOR + p.z, { flash: p.flash > 0 }); } }); });
  G.items.forEach(function (it) { L.push({ z: it.z, f: function () { shadow(it.x - G.cam, it.z, 10, it.h); var bob = it.h <= 0 ? Math.round(Math.sin(G.t * 4 + it.x) * 1) : 0; KIT.spr(it.id, it.x - G.cam, FLOOR + it.z - it.h - 1 + bob, {}); if (it.h <= 0 && Math.floor(G.t * 3) % 2 && WEAPONS[it.id]) R('#ffe36a', it.x - G.cam - 1, FLOOR + it.z - 20, 2, 2); } }); });
  G.ents.concat([P]).forEach(function (e) { if (e.st === 'gone') return; L.push({ z: e.z + (e.st === 'grabbed' ? 0.1 : 0), f: function () { shadow(e.x - G.cam, e.z, e.w * (e.sc || 1), e.h); drawFighter(e); } }); });
  G.shots.forEach(function (b) { L.push({ z: b.z, f: function () { shadow(b.x - G.cam, b.z, 8, b.h); var o = { flip: b.vx < 0, anchor: 'c' }; if (b.spin) o.rot = G.t * 18; if (b.big) o.sc = 1.5; if (b.rat) { KIT.spr('f_rat_' + (Math.floor(G.t * 10) % 4), b.x - G.cam, FLOOR + b.z, { flip: b.vx < 0 }); return; } if (b.ground && b.spr === 's_wave') { KIT.spr(b.spr, b.x - G.cam, FLOOR + b.z, { flip: b.vx < 0, sc: b.big ? 1.5 : 1 }); return; }
    if (b.col && b.spr === 's_orb') { g.fillStyle = '#12040a'; g.beginPath(); g.arc(b.x - G.cam, FLOOR + b.z - b.h, 6, 0, 6.3); g.fill(); g.fillStyle = b.col; g.beginPath(); g.arc(b.x - G.cam, FLOOR + b.z - b.h, 5, 0, 6.3); g.fill(); R('#ffffff', b.x - G.cam - 2, FLOOR + b.z - b.h - 3, 2, 2); return; }
    KIT.spr(b.spr, b.x - G.cam, FLOOR + b.z - b.h, o); } }); });
  L.sort(function (a, b) { return a.z - b.z; }); L.forEach(function (l) { l.f(); });
  // effects on top
  G.fx.forEach(function (f) { var x = f.x - G.cam, y = FLOOR + (f.z || 0) - (f.h || 0), k = f.t / f.life;
    if (f.k === 'spark') { KIT.spr('fx_spark' + Math.min(3, (f.size || 1) + Math.floor(k * 2)), x, y, { anchor: 'c' }); }
    else if (f.k === 'spr') KIT.spr(f.spr, x, y, { anchor: 'c', sc: f.sc || 1, alpha: 1 - k * 0.6, rot: f.rot ? f.rot + f.t * 10 : undefined });
    else if (f.k === 'text') T(f.s, x, y - k * 16, { size: 8, align: 'center', col: f.col, outline: true, alpha: 1 - Math.max(0, k - 0.6) * 2.5 });
    else if (f.k === 'ring') { g.strokeStyle = f.col; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.ellipse(x, FLOOR + f.z, f.r * (0.3 + k * 0.8), f.r * (0.3 + k * 0.8) / 2.8, 0, 0, 6.3); g.stroke(); g.lineWidth = 1; }
    else if (f.k === 'drip') R('#c08aff', x, y + k * 10, 1, 2);
    else if (f.k === 'spear') { var hh = Math.min(1, k * 4) * 34; KIT.spr('s_spear', x, FLOOR + f.z + 2, { sc: hh / 31 }); }
    else if (f.k === 'column') { var cy = FLOOR + f.z; R('#2aa0a8', x - 9, 0, 18, cy); R('#7ae0e0', x - 5, 0, 6, cy); R('#e8ffff', x - 2, 0, 2, cy); KIT.spr('fx_cream', x, cy, { anchor: 'c', sc: 1.4 }); }
    else if (f.k === 'piefall') { KIT.spr('t_pie', x, FLOOR + f.z - (1 - k) * 200, { anchor: 'c', sc: 1.5 }); }
  });
  // the super beam, Blumhead's beam
  if (G.sup && G.sup.kind === 'beam' && G.sup.t > 0.7) { var S = G.sup, bx = S.x - G.cam, by = FLOOR + S.z - 30, wob = Math.sin(G.t * 40) * 2; var x0 = S.face > 0 ? bx + 10 : 0, x1 = S.face > 0 ? KIT.W : bx - 10; R('#b8a070', x0, by - 14 - wob, x1 - x0, 28 + wob * 2); R('#fffbe8', x0, by - 10, x1 - x0, 20); R('#ffffff', x0, by - 4, x1 - x0, 8); }
  if (G.sup && G.sup.kind === 'flood' && G.sup.t > 0.7) { var r = (G.sup.t - 0.7) * 380, fx = G.sup.x - G.cam; R('#4aa82a', fx - r, FLOOR + 6, r * 2, DEPTH - 4); R('#9aff5a', fx - r, FLOOR + 6, r * 2, 3); }
  if (G.beam) { var B = G.beam, bx2 = B.x - G.cam, by2 = FLOOR + B.z - 34, x02 = B.face > 0 ? bx2 + 20 : 0, x12 = B.face > 0 ? KIT.W : bx2 - 20; if (B.warn) { if (Math.floor(G.t * 16) % 2) R('#ff2630', x02, FLOOR + B.z - 1, x12 - x02, 2); } else { R('#4a1070', x02, by2 - 12, x12 - x02, 24); R('#d08aff', x02, by2 - 8, x12 - x02, 16); R('#ffd0ff', x02, by2 - 3, x12 - x02, 6); } }
  drawFront();
}
/* ---------------------------------------------------------------- the HUD */
function hpBar(x, y, w, h, k, trail, col, flip) {
  R('#12040a', x - 1, y - 1, w + 2, h + 2); R('#2a0a0e', x, y, w, h);
  var tw = Math.max(0, Math.min(1, trail)) * w, kw = Math.max(0, Math.min(1, k)) * w;
  if (flip) { R('#ffe36a', x + w - tw, y, tw, h); R(col, x + w - kw, y, kw, h); R('rgba(255,255,255,0.3)', x + w - kw, y, kw, 1); }
  else { R('#ffe36a', x, y, tw, h); R(col, x, y, kw, h); R('rgba(255,255,255,0.3)', x, y, kw, 1); }
}
function drawHUD() {
  var e = P, H = e.hero, W = KIT.W, HH = KIT.H;
  e.trail = e.trail === undefined ? e.hp : (e.trail > e.hp ? Math.max(e.hp, e.trail - e.mhp * 0.6 / 60) : e.hp);
  KIT.panel(3, 3, 30, 30, { fill: 'solid' }); KIT.spr(H.face, 18, 31, {});
  T(H.n, 37, 4, { size: 8, col: '#f1e7d0' }); T('x' + G.lives, 37 + KIT.tw(H.n, 8) + 6, 4, { size: 8, col: '#ffe36a' });
  var bw = Math.min(120, W * 0.3);
  hpBar(37, 14, bw, 6, e.hp / e.mhp, e.trail / e.mhp, e.hp < e.mhp * 0.25 && Math.floor(G.t * 6) % 2 ? '#ff2630' : '#c4121c');
  var full = e.meter >= 100, sw = (bw - 3) / 4; R('#12040a', 36, 22, bw + 2, 6); for (var i = 0; i < 4; i++) { var seg = clamp(e.meter / 25 - i, 0, 1); R('#1a0a10', 37 + i * (sw + 1), 23, sw, 4); R(full ? (Math.floor(G.t * 8) % 2 ? '#ffe36a' : '#ffffff') : '#ff9a30', 37 + i * (sw + 1), 23, sw * seg, 4); }
  if (full) T('SUPER! Y', 37, 30, { size: 8, col: Math.floor(G.t * 4) % 2 ? '#ffe36a' : '#ff2630', outline: true });
  T(String(G.score).padStart(7, '0'), W / 2 + 10, 4, { size: 8, align: 'center', col: '#ffe36a' });
  var ty = full ? 42 : 34;
  if (e.weapon) { var w = WEAPONS[e.weapon.id]; KIT.panel(3, ty, 30, 18, { fill: 'solid' }); KIT.spr(e.weapon.id, 18, ty + 9, { anchor: 'c', sc: 0.8 }); T(w.n, 37, ty, { size: 6, col: '#f1e7d0' }); KIT.bar(37, ty + 9, 60, 4, e.weapon.dur / w.dur, w.kind === 'melee' ? '#ffc840' : '#7ae0e0'); ty += 22; }
  // who you are hitting, Final Fight style
  if (G.tag && G.tagT > 0 && !G.tag.boss && G.tag.hp >= 0 && G.tag.def) { var tg = G.tag; T(tg.def.n, 37, ty, { size: 6, col: '#a6968f' }); hpBar(37, ty + 7, 80, 4, tg.hp / tg.mhp, tg.hp / tg.mhp, tg.washed ? '#9a3ad8' : '#c4121c'); }
  // boss bars, Street Fighter style, under the sound / pad / pause buttons in the corner
  var bs = G.ents.filter(function (b) { return b.boss; });
  bs.forEach(function (b, i) { b.trail = b.trail === undefined ? b.hp : (b.trail > b.hp ? Math.max(b.hp, b.trail - b.mhp * 0.3 / 60) : b.hp); var bbw = Math.min(170, W * 0.4), bx = W - bbw - 6, by = 44 + i * 18;
    T(b.def.n, W - 6, by - 9, { size: 8, align: 'right', col: b.superOn ? '#d08aff' : '#f1e7d0' }); hpBar(bx, by, bbw, 6, b.hp / b.mhp, b.trail / b.mhp, b.superOn ? '#9a3ad8' : '#c4121c', true); });
  // combo counter
  if (G.combo >= 3) { var pop = Math.max(0, G.comboT - 1.1) * 3, cy = bs.length ? 44 + bs.length * 18 : 46; T(G.combo + ' HITS', W - 8, cy, { size: 16 + Math.round(pop * 8), align: 'right', col: G.combo >= 20 ? '#ffe36a' : G.combo >= 10 ? '#ff9a30' : '#f1e7d0', outline: true, font: 'title' }); if (G.combo >= 10) T(G.combo >= 30 ? 'SKEETACULAR!' : G.combo >= 20 ? 'FILTHY!' : 'MESSY!', W - 8, cy + 20, { size: 8, align: 'right', col: '#ff2630', outline: true }); }
  if (G.callout) T(G.callout.s, W / 2, 64, { size: 8, align: 'center', col: '#ffe36a', outline: true, alpha: Math.min(1, G.callout.t * 3) });
  if (G.go > 0 && Math.floor(G.t * 3) % 2) { T('GO', W - 48, 78, { size: 24, col: '#ff2630', outline: true, font: 'title' }); var g = KIT.ctx; g.fillStyle = '#ff2630'; g.beginPath(); g.moveTo(W - 12, 90); g.lineTo(W - 22, 80); g.lineTo(W - 22, 100); g.fill(); }
  if (G.fightT > 0) { var a = G.fightT > 0.9 ? 'ROUND ' + (G.si + 1) : 'FIGHT!'; T(a, W / 2, 70, { size: 32, align: 'center', col: a === 'FIGHT!' ? '#ff2630' : '#f1e7d0', outline: true, font: 'title' }); }
  if (G.koT > 0.2 && G.koT < 2.8) T('K.O.', W / 2, 60, { size: 48, align: 'center', col: '#ff2630', outline: true, font: 'title' });
  if (G.splat > 0) { var al = Math.min(1, G.splat); KIT.ctx.globalAlpha = al * 0.85; [[0.3, 0.35, 3], [0.62, 0.5, 2.6], [0.45, 0.7, 2.2], [0.75, 0.28, 1.8]].forEach(function (s) { KIT.spr('fx_cream', W * s[0], HH * s[1], { anchor: 'c', sc: s[2] }); }); KIT.ctx.globalAlpha = 1; }
  if (G.cutin) { var ci = G.cutin, k = Math.min(1, ci.t * 5), out = Math.max(0, ci.t - 0.9) * 5; R('rgba(7,4,5,0.6)', 0, 0, W, HH); var bx2 = -W + k * W - out * W; R(ci.boss ? '#4a1070' : '#c4121c', bx2, 70, W, 60); R('#12040a', bx2, 70, W, 3); R('#12040a', bx2, 127, W, 3);
    if (!ci.boss) KIT.spr(H.face, bx2 + W * 0.22, 126, { sc: 2.2 }); T(ci.n, bx2 + W * 0.6, 86, { size: 24, align: 'center', col: '#fffbe8', outline: true, font: 'title' }); }
}
/* ---------------------------------------------------------------- screens */
function drawCard() { // STAGE 1 / CLUBHOUSE ROW over the place itself
  var W = KIT.W, k = Math.min(1, G.cardT * 3); R('rgba(7,4,5,0.7)', 0, 0, W, KIT.H); R(G.S.tint, W / 2 - 140 * k, 84, 280 * k, 2); R(G.S.tint, W / 2 - 140 * k, 130, 280 * k, 2);
  T(G.rush ? 'BOSS RUSH ' + (G.si + 1) + ' / 6' : G.S.sub.toUpperCase(), W / 2, 68, { size: 8, align: 'center', col: '#a6968f' }); T(G.S.n, W / 2, 92, { size: 32, align: 'center', col: '#f1e7d0', outline: true, font: 'title' });
}
function drawVS() {
  var W = KIT.W, HH = KIT.H, t = G.vsT, k = Math.min(1, t * 4), H = P.hero, bs = G.ents.filter(function (e) { return e.boss; }), d = BOSSES[G.S.boss], g = KIT.ctx;
  R('#070405', 0, 0, W, HH);
  g.fillStyle = '#5a0a10'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W * 0.56 * k, 0); g.lineTo(W * 0.44 * k, HH); g.lineTo(0, HH); g.fill();
  g.fillStyle = '#2a0610'; g.beginPath(); g.moveTo(W, 0); g.lineTo(W - W * 0.44 * k, 0); g.lineTo(W - W * 0.56 * k, HH); g.lineTo(W, HH); g.fill();
  for (var i = 0; i < 12; i++) R('#12040a', 0, i * 19, W, 2);
  KIT.spr(H.idle[0], W * 0.22 - (1 - k) * 200, HH - 14, { sc: 2 });
  bs.forEach(function (b, j) { var tall = KIT.size(b.spr[0]).h * (b.sc || 1); KIT.spr(b.spr[0], W * 0.76 + (1 - k) * 200 + j * 40 - (bs.length - 1) * 20, HH - 14 - j * 4, { sc: (b.sc || 1) * clamp(130 / tall, 0.7, 2) * (bs.length > 1 ? 0.8 : 1), flip: true }); });
  T(H.n, W * 0.22, 26, { size: 16, align: 'center', col: '#f1e7d0', outline: true, font: 'title' }); T(d.n, W * 0.76, 26, { size: 16, align: 'center', col: '#ff2630', outline: true, font: 'title' }); // below the corner buttons
  if (t > 0.35) { var s = 1 + Math.max(0, 0.6 - t) * 3; T('VS', W / 2, 84 - (s - 1) * 20, { size: Math.round(48 * s), align: 'center', col: '#ffe36a', outline: true, font: 'title' }); }
  if (t > 0.9) { KIT.wrap('"' + H.quote + '"', W * 0.4, 8).forEach(function (l, i) { T(l, W * 0.22, 50 + i * 11, { size: 8, align: 'center', col: '#f1e7d0' }); }); KIT.wrap('"' + d.intro + '"', W * 0.4, 8).forEach(function (l, i) { T(l, W * 0.76, 50 + i * 11, { size: 8, align: 'center', col: '#ff9ad0' }); }); }
}
function drawClear() {
  var W = KIT.W, tl = G.tally, t = G.clearT; R('rgba(7,4,5,0.82)', 0, 0, W, KIT.H);
  T(G.rush ? 'BOSS DOWN' : 'STAGE CLEAR', W / 2, 16, { size: 32, align: 'center', col: '#ffe36a', outline: true, font: 'title' });
  var rows = [['TIME BONUS', tl.time], ['BEST COMBO  x' + (G.best || 0), tl.combo], ['HOMUNCULI FREED  ' + (G.freed || 0), tl.freed], ['NO DAMAGE', tl.nodmg]];
  rows.forEach(function (r, i) { if (t < 0.4 + i * 0.35) return; T(r[0], W / 2 - 120, 62 + i * 15, { size: 8, col: '#f1e7d0' }); T(String(r[1]), W / 2 + 120, 62 + i * 15, { size: 8, align: 'right', col: r[1] ? '#ffe36a' : '#4a1a1c' }); });
  if (t > 2) { var gr = GRADES.filter(function (g) { return G.score >= g[1] * (G.si + 1) / 6; })[0]; T('SCORE ' + G.score, W / 2, 130, { size: 8, align: 'center', col: '#f1e7d0' }); T(gr ? gr[0] : 'D', W / 2, 142, { size: 32, align: 'center', col: '#ff2630', outline: true, font: 'title' }); }
  if (t > 2.6 && Math.floor(G.t * 2) % 2) T('PRESS A', W / 2, KIT.H - 16, { size: 8, align: 'center', col: '#a6968f' });
}
function drawOver() {
  var W = KIT.W, n = Math.max(0, 9 - Math.floor(G.overT)); R('rgba(7,4,5,0.8)', 0, 0, W, KIT.H);
  T('CONTINUE?', W / 2, 40, { size: 32, align: 'center', col: '#f1e7d0', outline: true, font: 'title' }); T(String(n), W / 2, 80, { size: 48, align: 'center', col: '#ff2630', outline: true, font: 'title' });
  T('A: CONTINUE      B: GIVE UP', W / 2, 150, { size: 8, align: 'center', col: '#a6968f' });
}
function drawEnd() {
  var W = KIT.W, t = G.endT; R('#070405', 0, 0, W, KIT.H); moon(W / 2, 48, 30);
  var hs = HEROLIST.map(function (h) { return HEROES[h].idle[0]; }); hs.forEach(function (f, i) { KIT.spr(f, W / 2 + (i - 1.5) * 56, 112, {}); });
  var lines = ['Blumhead is down. The goo drains out of the city.', 'Every homunculus on Clubhouse Row wakes up in their own colours.', 'They go home. The Clubhouse gets the first round in.', 'SKEET FIGHTER', 'Thanks for playing.'];
  lines.forEach(function (l, i) { if (t < 1 + i * 1.4) return; var big = l === 'SKEET FIGHTER'; T(l, W / 2, 120 + i * 15 + (i >= 3 ? 4 : 0), { size: big ? 16 : 8, align: 'center', col: big ? '#ff2630' : '#f1e7d0', font: big ? 'title' : 'px', max: W - 16 }); });
  if (t > 9 && Math.floor(G.t * 2) % 2) T('PRESS A', W / 2, KIT.H - 12, { size: 8, align: 'center', col: '#a6968f' });
}
/* the fighter select: Street Fighter style. Four portraits across the top, the one you are on stands big with its moves */
function drawSelect() {
  var W = KIT.W, HH = KIT.H, sel = G.sel || 0, H = HEROES[HEROLIST[sel]];
  R('#070405', 0, 0, W, HH); for (var i = 0; i < 12; i++) R(i % 2 ? '#0e0708' : '#120809', 0, i * 20, W, 20);
  moon(W * 0.24, 104, 40);
  T('CHOOSE YOUR FIGHTER', W / 2, 2, { size: 16, align: 'center', col: '#ff2630', outline: true, font: 'title' });
  var cw = 44, gap = 6, x0 = W / 2 - (cw * 4 + gap * 3) / 2; G.selBox = [];
  HEROLIST.forEach(function (id, i) { var h = HEROES[id], x = x0 + i * (cw + gap), y = 22, on = i === sel;
    KIT.panel(x, y, cw, 40, { edge: on ? '#ffe36a' : '#4a1a1c', fill: on ? 'rgba(90,10,16,0.95)' : 'solid' }); KIT.spr(h.face, x + cw / 2, y + 36, { sc: 1.15 }); G.selBox[i] = [x, y, cw, 40]; });
  var bob = Math.sin(G.t * 3) * 1.5; KIT.spr(H.idle[Math.floor(G.t * H.idleF) % H.idle.length], W * 0.24, HH - 6 + bob, { sc: H.ht > 48 ? 2 : 2.2 });
  var tx = W * 0.47;
  T(H.n, tx, 66, { size: 16, col: '#f1e7d0', outline: true, font: 'title' });
  KIT.wrap(H.blurb, W - tx - 8, 8).forEach(function (l, i) { T(l, tx, 86 + i * 10, { size: 8, col: '#a6968f' }); });
  ['POWER', 'SPEED', 'RANGE'].forEach(function (s, i) { T(s, tx, 110 + i * 10, { size: 8, col: '#f1e7d0' }); for (var j = 0; j < 5; j++) R(j < H.stats[i] ? '#ff2630' : '#2a0a0e', tx + 50 + j * 10, 110 + i * 10, 8, 7); });
  var sp = H.sp; [['X', sp.fire.n], ['UP+X', sp.rise.n], ['FWD+X', sp.dash.n], ['DOWN+X', sp.ground.n], ['Y', sp.sup.n]].forEach(function (r, i) { T(r[0], tx, 144 + i * 10, { size: 8, col: '#ffe36a' }); T(r[1], tx + 50, 144 + i * 10, { size: 8, col: '#f1e7d0' }); });
  if (SV.best[HEROLIST[sel]]) T('BEST ' + SV.best[HEROLIST[sel]], x0 + cw * 4 + gap * 3 + 8, 36, { size: 8, col: '#9aff5a' });
  if (Math.floor(G.t * 2) % 2) T('A: FIGHT   B: BACK', W / 2, HH - 10, { size: 8, align: 'center', col: '#a6968f' });
}
