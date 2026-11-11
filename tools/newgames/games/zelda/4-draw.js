/* ---------- drawing: each screen's tiles are painted once into a layer, then everyone on top ---------- */
var R = KIT.R;
function shadeHex(h, k) { var n = parseInt(h.slice(1), 16), r = Math.min(255, ((n >> 16) & 255) * k) | 0, g = Math.min(255, ((n >> 8) & 255) * k) | 0, b = Math.min(255, (n & 255) * k) | 0; return 'rgb(' + r + ',' + g + ',' + b + ')'; }
function paintTile(t, x, y, B, D, i, j) {
  var g = KIT.ctx, v = (i * 7 + j * 13) % 5;
  function grass() { R(B.g, x, y, TS, TS); if (v < 2) { R(B.g2, x + 4 + v * 5, y + 6, 2, 3); R(B.g2, x + 14, y + 15 - v * 3, 2, 3); } }
  if (t >= 20) { var fl = D.floor, wl = D.wall;
    if (t === 21) { R(shadeHex(wl, 0.6), x, y, TS, TS); R(wl, x + 1, y + 1, TS - 2, TS - 2); R(shadeHex(wl, 1.25), x + 1, y + 1, TS - 2, 2); R(shadeHex(wl, 0.75), x + 1, y + TS / 2, TS - 2, 1); return; }
    R(fl, x, y, TS, TS); R(shadeHex(fl, 0.85), x, y, TS, 1); R(shadeHex(fl, 0.85), x, y, 1, TS); if (v === 0) R(shadeHex(fl, 1.15), x + 6, y + 8, 4, 2);
    if (t === 22) { R('#12040a', x + 1, y + 1, TS - 2, TS - 2); R(shadeHex(wl, 1.1), x + 2, y + 2, TS - 4, TS - 4); R(shadeHex(wl, 1.4), x + 2, y + 2, TS - 4, 2); R(shadeHex(wl, 0.7), x + 2, y + TS - 5, TS - 4, 3); }
    else if (t === 23) { R('#000', x, y, TS, TS); R('#12040a', x, y, TS, 3); }
    else if (t === 29) { R('#1a3a5a', x, y, TS, TS); R('#3a6a8a', x + (KIT.t * 8 + i * 5) % TS, y + 6, 6, 1); }
    else if (t === 24 || t === 25 || t === 26 || t === 27 || t === 28) { R('#12040a', x, y, TS, TS); if (t === 25) { R('#6e3a1e', x + 2, y + 2, TS - 4, TS - 4); R('#ffe36a', x + 9, y + 9, 6, 6); } if (t === 26) { R('#6a0a10', x + 2, y + 2, TS - 4, TS - 4); R('#f1e7d0', x + 8, y + 6, 8, 8); R('#12040a', x + 9, y + 9, 2, 2); R('#12040a', x + 13, y + 9, 2, 2); } if (t === 27) { for (var b = 0; b < 4; b++) R('#7a7a80', x + 3 + b * 5, y, 2, TS); } if (t === 28) { for (var s = 0; s < 4; s++) R(shadeHex(fl, 1 - s * 0.15), x, y + s * 6, TS, 6); } }
    return; }
  if (t === 3) { R(B.water, x, y, TS, TS); R(shadeHex(B.water, 1.3), x + 3 + v * 3, y + 7, 7, 1); R(shadeHex(B.water, 1.3), x + 12, y + 16, 6, 1); return; }
  if (t === 11) { R(B.water, x, y, TS, TS); R('#6e3a1e', x, y + 2, TS, TS - 4); for (var p = 0; p < TS; p += 6) R('#3a1a0c', x + p, y + 2, 1, TS - 4); return; }
  if (t === 4) { R(B.path, x, y, TS, TS); R(shadeHex(B.path, 0.85), x + 3 + v * 2, y + 5, 3, 2); R(shadeHex(B.path, 1.15), x + 14, y + 14, 2, 2); return; }
  grass();
  if (t === 1) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 12, y + 11, 12, 0, 6.3); g.fill(); g.fillStyle = B.t; g.beginPath(); g.arc(x + 12, y + 11, 11, 0, 6.3); g.fill(); g.fillStyle = shadeHex(B.t, 1.4); g.beginPath(); g.arc(x + 9, y + 8, 5, 0, 6.3); g.fill(); R(B.tr, x + 10, y + 19, 4, 5); }
  else if (t === 2) { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(x + 12, y + 13, 11, 9, 0, 0, 6.3); g.fill(); g.fillStyle = '#6a5e58'; g.beginPath(); g.ellipse(x + 12, y + 12, 10, 8, 0, 0, 6.3); g.fill(); g.fillStyle = '#8a7e78'; g.beginPath(); g.ellipse(x + 9, y + 9, 4, 3, 0, 0, 6.3); g.fill(); }
  else if (t === 5) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(x + 12, y + 13, 10, 0, 6.3); g.fill(); g.fillStyle = shadeHex(B.t, 1.25); g.beginPath(); g.arc(x + 12, y + 13, 9, 0, 6.3); g.fill(); R(shadeHex(B.t, 1.7), x + 8, y + 9, 3, 3); R(shadeHex(B.t, 1.7), x + 14, y + 14, 3, 3); }
  else if (t === 10) { R('#ff2630', x + 5, y + 6, 2, 2); R('#ffe36a', x + 14, y + 12, 2, 2); R('#f1e7d0', x + 8, y + 17, 2, 2); }
  else if (t === 6) { R('#3a2e2a', x, y, TS, TS); R('#4a3e38', x, y + 2, TS, 6); R('#2a1e1a', x, y + 16, TS, 3); R('#5a4e48', x + v * 3, y + 10, 5, 2); }
  else if (t === 7 || t === 8 || t === 12) { R('#3a2e2a', x, y, TS, TS); if (t === 12) { R('#5a4e48', x + 2, y + 4, TS - 4, TS - 4); R('#12040a', x + 6, y + 6, 1, 12); R('#12040a', x + 6, y + 12, 8, 1); return; } g.fillStyle = '#000'; g.beginPath(); g.moveTo(x + 2, y + TS); g.lineTo(x + 2, y + 10); g.quadraticCurveTo(x + 12, y - 2, x + 22, y + 10); g.lineTo(x + 22, y + TS); g.fill(); if (t === 8) { R('#f1e7d0', x + 8, y + 2, 8, 6); R('#12040a', x + 9, y + 4, 2, 2); R('#12040a', x + 13, y + 4, 2, 2); } }
}
function screenLayer(S) {
  var key = (S.kind === 'over' ? 'lc-o' + S.sx + ',' + S.sy : 'lc-d' + DG.di + ':' + S.r.id) + ':' + S.T.join(',');
  return KIT.layer(key, COLS * TS, ROWS * TS, function () { var B = S.kind === 'over' ? BIOME[S.b] : null, D = S.kind === 'dg' ? DG.D : null; for (var j = 0; j < ROWS; j++) for (var i = 0; i < COLS; i++) paintTile(S.T[j * COLS + i], i * TS, j * TS, B, D, i, j); }, { px: 1 });
}
function drawScreen(S, ox, oy) { KIT.blit(screenLayer(S), ox, oy); if (S.kind === 'dg') for (var q = 0; q < S.T.length; q++) if (S.T[q] === 29) paintTile(29, ox + (q % COLS) * TS, oy + ((q / COLS) | 0) * TS, null, DG.D, q % COLS, (q / COLS) | 0); }
function draw() {
  R('#070405', 0, 0, KIT.W, H); var ox = Math.round((KIT.W - COLS * TS) / 2);
  if (!SCR || !P) { var g = KIT.ctx; g.fillStyle = '#12040a'; g.fillRect(0, 0, KIT.W, H); g.fillStyle = '#c4121c'; g.beginPath(); g.arc(KIT.W / 2, 90, 40, 0, 6.3); g.fill(); return; }
  if (TRANS) { TRANS.t += 1 / 60 * 3; var k = Math.min(1, TRANS.t), dx = TRANS.dx * COLS * TS, dy = TRANS.dy * ROWS * TS; drawScreen(TRANS.from, ox - dx * k, OY - dy * k); drawScreen(SCR, ox + dx * (1 - k), OY + dy * (1 - k)); if (k >= 1) TRANS = null; hud(ox); return; }
  drawScreen(SCR, ox, OY); drawLandBits(ox);
  var g2 = KIT.ctx; g2.save(); g2.beginPath(); g2.rect(ox, OY, COLS * TS, ROWS * TS); g2.clip(); g2.translate(ox, OY);
  if (SCR.kind === 'over' && SCR.feat) { var F = SCR.feat, npc = { amy: 'npc_amy', saba: 'npc_saba', harold: 'npc_harold', greebo: 'npc_greebo', spermaid: 'npc_spermaid' }[F.k]; if (npc) KIT.spr(npc, (F.i + 0.5) * TS - 26, (F.j + 2) * TS, { sc: 0.8 }); }
  PICK.forEach(function (k) { var x = k.x, y = k.y + Math.sin(G.t * 4 + x) * 1.5; if (k.t !== undefined && k.t < 2 && Math.floor(G.t * 10) % 2) return;
    if (k.k === 'drop') KIT.spr('lc_drop', x, y, { anchor: 'c', sc: k.n > 1 ? 1.5 : 1 }); else if (k.k === 'heart' || k.k === 'heartc') KIT.spr('gr_heart', x, y, { anchor: 'c', sc: k.k === 'heartc' ? 2 : 1 }); else if (k.k === 'key') KIT.spr('gr_key', x, y, { anchor: 'c' }); else if (k.k === 'bomb') KIT.spr('gr_bomb', x, y, { anchor: 'c' });
    else if (k.k === 'chest') KIT.spr('p_bigchest', x, y + 10); else if (k.k === 'chal') { var gg = KIT.ctx; gg.fillStyle = '#ffe36a'; gg.beginPath(); gg.moveTo(x - 8, y - 10); gg.lineTo(x + 8, y - 10); gg.lineTo(x + 4, y); gg.lineTo(x + 2, y + 6); gg.lineTo(x + 6, y + 10); gg.lineTo(x - 6, y + 10); gg.lineTo(x - 2, y + 6); gg.lineTo(x - 4, y); gg.fill(); R('#f1e0b0', x - 6, y - 9, 12, 3); } });
  FOE.forEach(function (f) { if (f.hp <= 0) return; var n = f.d.s + (Math.floor(G.t * 6 + f.x) % (f.d.nf || 4)); KIT.spr(n, f.x, f.y + 10, { flip: P.x > f.x, flash: f.hurt > 0, alpha: f.stun > 0 ? 0.7 : 1, sc: 0.85 }); if (f.stun > 0) R('#ffe36a', f.x - 1, f.y - 22 + Math.sin(G.t * 10) * 2, 2, 2); });
  if (BOSS) { var b = BOSS, bn = b.B.s + (Math.floor(G.t * 3) % 2); KIT.spr(bn, b.x, b.y + 24, { sc: b.B.sc, flip: P.x > b.x && !KIT.has(bn + 'L'), flash: b.hurt > 0 || (b.st !== 'idle' && b.t < 0.4 && Math.floor(G.t * 12) % 2 === 0) }); b.marks.forEach(function (m) { if (!m.done) { g2.fillStyle = 'rgba(255,38,48,' + (0.3 + Math.sin(G.t * 20) * 0.2) + ')'; g2.beginPath(); g2.ellipse(m.x, m.y, 16, 8, 0, 0, 6.3); g2.fill(); } }); }
  // Cumhead
  var p = P, d = p.dir === 'l' || p.dir === 'r' ? 's' : p.dir, fr = 'chb_' + d + (Math.floor(p.anim) % 4), flip = p.dir === 'l';
  if (p.hover > 0) { KIT.spr('steve0', p.x, p.y - 18, { sc: 0.35, alpha: 0.9 }); }
  if (!(p.inv > 0 && Math.floor(G.t * 20) % 2)) KIT.spr(fr, p.x, p.y + 12 - (p.hover > 0 ? 6 : 0), { flip: flip });
  if (p.atk > 0) { var v = DIRV[p.dir], k2 = 1 - p.atk / 0.26, gg2 = KIT.ctx; gg2.save(); gg2.translate(p.x + v[0] * 8, p.y + v[1] * 8); gg2.rotate(Math.atan2(v[1], v[0]) + (k2 - 0.5) * 1.8); gg2.fillStyle = '#12040a'; gg2.fillRect(2, -4, 20, 8); gg2.fillStyle = '#a8442a'; gg2.fillRect(3, -3, 18, 6); gg2.fillStyle = '#e8a080'; gg2.fillRect(3, -3, 18, 1); gg2.restore(); }
  SHOT.forEach(function (s) { if (s.bread) KIT.spr('it_bread', s.x, s.y, { anchor: 'c', rot: G.t * 20 }); else if (s.foe) { g2.fillStyle = '#c04aff'; g2.beginPath(); g2.arc(s.x, s.y, 4, 0, 6.3); g2.fill(); } else { R('#f1e0b0', s.x - 3, s.y - 3, 6, 6); } });
  FX.forEach(function (f) { if (f.k === 'bomb') { if (!f.boom) KIT.spr(Math.floor(G.t * 8) % 2 ? 'gr_bombl' : 'gr_bomb', f.x, f.y, { anchor: 'c' }); return; } if (f.k === 'spear') { g2.fillStyle = '#e8dcc8'; g2.beginPath(); g2.moveTo(f.x - 6, f.y); g2.lineTo(f.x, f.y - 30); g2.lineTo(f.x + 6, f.y); g2.fill(); f.t -= 1 / 60; return; } f.t -= 1 / 60; f.x += f.vx / 60; f.y += f.vy / 60; R(f.col, f.x, f.y, 2, 2); });
  FX = FX.filter(function (f) { return f.k === 'bomb' ? !f.boom || f.t > -0.2 : f.t > 0; });
  g2.restore();
  drawNight(ox);
  hud(ox);
}
function hud(ox) {
  R('#0e0708', 0, 0, KIT.W, OY); R('#4a1a1c', 0, OY - 1, KIT.W, 1);
  for (var i = 0; i < SV.hearts; i++) { var full = P.hp >= (i + 1) * 2, half = P.hp === i * 2 + 1; KIT.spr(full ? 'gr_heart' : half ? 'gr_hearth' : 'gr_hearte', ox + 8 + (i % 10) * 13, 6 + Math.floor(i / 10) * 12, { anchor: 'tl' }); }
  KIT.spr('lc_drop', ox + 150, 8, { anchor: 'tl' }); KIT.text('' + SV.drops, ox + 164, 10, { size: 8, col: '#ffe36a' });
  if (SV.items.bombs) { KIT.spr('gr_bomb', ox + 200, 8, { anchor: 'tl' }); KIT.text('' + SV.bombs, ox + 214, 10, { size: 8 }); }
  if (DG) { KIT.spr('gr_key', ox + 240, 8, { anchor: 'tl' }); KIT.text('' + (SV.dg[DG.di].keys || 0) + (SV.dg[DG.di].bk ? ' B' : ''), ox + 254, 10, { size: 8 }); }
  KIT.panel(ox + 290, 2, 40, 26); KIT.text('B', ox + 294, 4, { size: 6, col: '#a6968f' }); if (SV.sel) KIT.spr(ITEMS[SV.sel].icon, ox + 312, 15, { anchor: 'c' });
  KIT.text('CHALICES ' + SV.chal.length + '/5', ox + 340, 4, { size: 6, col: '#ffe36a' });
  // the little map: the land, or the dungeon's rooms you have seen
  var mx = ox + COLS * TS - 60, my = 4;
  if (!DG) { for (var y = 0; y < MAPH; y++) for (var x = 0; x < MAPW; x++) R(x === SV.sx && y === SV.sy ? '#ffe36a' : '#3a1a1c', mx + x * 9, my + 12 + y * 3, 8, 2); }
  else { var st = SV.dg[DG.di]; DG.list.forEach(function (r) { if (!st.seen[r.id] && r.type !== 'boss') return; R(r === ROOM ? '#ffe36a' : r.type === 'boss' ? '#c4121c' : '#6a4a4c', mx + r.x * 9, my + 9 + r.y * 4, 8, 3); }); }
  if (G.banner && G.banner.t > 0) { var a = Math.min(1, G.banner.t, 2.6 - G.banner.t); R('rgba(0,0,0,' + 0.6 * a + ')', 0, H * 0.4, KIT.W, 30); KIT.text(G.banner.s, KIT.W / 2, H * 0.4 + 4, { align: 'center', font: 'title', size: 22, col: '#ffe36a', alpha: a }); }
  if (MSGBOX) { var lines = KIT.wrap((MSGBOX.who ? MSGBOX.who + ':  ' : '') + MSGBOX.s, COLS * TS - 40, 14, 'body'); KIT.panel(ox + 10, H - 22 - lines.length * 15, COLS * TS - 20, lines.length * 15 + 16); lines.forEach(function (s, n) { KIT.text(s, ox + 20, H - 14 - lines.length * 15 + n * 15, { font: 'body', size: 14 }); }); }
  if (G.mode === 'dead') { R('rgba(0,0,0,' + Math.min(0.8, G.deadT) + ')', 0, 0, KIT.W, H); KIT.text('YOU DIED', KIT.W / 2, H * 0.4, { align: 'center', font: 'title', size: 34, col: '#c4121c', alpha: Math.min(1, G.deadT) }); }
}
