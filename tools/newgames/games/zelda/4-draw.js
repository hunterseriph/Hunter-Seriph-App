/* ---------- drawing (update 135): every tile is a sprite from tiles.py at its own pixel size. Terrain is autotiled in
   12 px quarters (paths, water, pits, carpets and the tops of walls), walls show a two-tile face on their south side,
   and the ground is painted into cached chunks; tall things (trees, buildings, lamps, statues) stand up and are drawn
   in order of their feet with everyone else. ---------- */
var R = KIT.R, CHW = 16, CHH = 10, CHV = {};
var NV = { forest: 3, woodsy: 3, hedge: 3, cliff: 3, bonecliff: 3, cwall: 1, thorns: 3, reeds: 3, dirt: 3, flag: 2, sand: 3, blood: 2, cream: 2, goo: 2, pit: 1, rug: 1, dw_sewer: 2, dw_skull: 2, dw_funhouse: 2, dw_factory: 2, dw_lair: 2 };
function dropChunks() { CHV = {}; KIT.dropLayer(); }
function dirtyChunk(i, j) { if (!SCR) return; var k = SCR.key + ':' + Math.floor(i / CHW) + ',' + Math.floor(j / CHH); KIT.dropLayer('lc:' + k + ':' + (CHV[k] || 0)); CHV[k] = (CHV[k] || 0) + 1; }
function chunkLayer(ci, cj) { var k = SCR.key + ':' + ci + ',' + cj; return KIT.layer('lc:' + k + ':' + (CHV[k] || 0), CHW * TS, CHH * TS, function () { for (var j = 0; j < CHH; j++) for (var i = 0; i < CHW; i++) { var wi = ci * CHW + i, wj = cj * CHH + j; if (wi >= SW() || wj >= SH()) continue; paintTile(wi, wj, i * TS, j * TS); } }, { px: 1 }); }
function fr(n, x, y) { KIT.spr(n, x, y, { anchor: 'tl' }); }
function auto(name, i, j, same, x, y) { var nv = NV[name] || 1;
  for (var qy = 0; qy < 2; qy++) for (var qx = 0; qx < 2; qx++) { var hx = i + (qx ? 1 : -1), vy = j + (qy ? 1 : -1), h = same(hx, j), v = same(i, vy), d = same(hx, vy);
    var c = h && v && d ? 'F' + Math.floor(hash2(i * 2 + qx, j * 2 + qy, 17) * nv) : h && v ? 'I' : h ? 'H' : v ? 'V' : 'O'; fr('a_' + name + '_' + qx + qy + c, x + qx * 12, y + qy * 12); } }
function prop(n, x, y) { KIT.spr(n, x + 12, y + 23); }
/* walls with faces: Wf says what counts as wall */
function paintWall(i, j, x, y, Wf, kind) {
  var f1 = Wf(i, j) && !Wf(i, j + 1), f0 = Wf(i, j) && Wf(i, j + 1) && !Wf(i, j + 2);
  if (f1 || f0) { var row = f1 ? 1 : 0; function isf(ii) { return Wf(ii, j) && (row === 1 ? !Wf(ii, j + 1) : Wf(ii, j + 1) && !Wf(ii, j + 2)); }
    var L = isf(i - 1), Rt = isf(i + 1), pos = L && Rt ? 'M' : Rt ? 'L' : L ? 'R' : 'S'; fr('f_' + kind + '_' + pos + row, x, y); return row; }
  auto(kind, i, j, function (ii, jj) { return Wf(ii, jj) && !(Wf(ii, jj) && !Wf(ii, jj + 1)) && !(Wf(ii, jj) && Wf(ii, jj + 1) && !Wf(ii, jj + 2)); }, x, y); return -1; }
function paintTile(i, j, x, y) { var t = tAt(i, j); if (SCR.kind === 'world') paintWorld(t, i, j, x, y); else if (SCR.kind === 'dg') paintDg(t, i, j, x, y); else paintIn(t, i, j, x, y); }
function wt(i, j) { return i < 0 || j < 0 || i >= WW || j >= WHT ? (j >= WHT ? 3 : 1) : WT[widx(i, j)]; }
function isWallW(i, j) { var t = wt(i, j); return t === 1 || t === 42; }
function paintWorld(t, i, j, x, y) {
  var bio = bioAt(i, j), B = BIOMES[bio], gk = B.k, v = Math.floor(hash2(i, j, 3) * 4);
  fr('g_' + gk + v, x, y);
  if (t === 1 || t === 42) { var row = paintWall(i, j, x, y, isWallW, B.wall); if (t === 42) { var D = DOORS[widx(i, j)]; if (!D || !D.cracked || SV.got['crk:' + D.cracked]) fr('f_' + B.wall + '_C1', x, y); else KIT.spr('pr_crack', x + 12, y + 24); }
    if (row === 0 && wt(i, j + 1) === 42) { var D2 = DOORS[widx(i, j + 1)]; if (!D2 || !D2.cracked || SV.got['crk:' + D2.cracked]) fr('f_' + B.wall + '_C0', x, y); } return; }
  if (t === 3 || t === 10) { auto(B.water, i, j, function (a, b) { var tt = wt(a, b); return tt === 3 || tt === 10; }, x, y); if (t === 10) fr(wt(i - 1, j) === 3 || wt(i + 1, j) === 3 ? 'pr_bridge' : 'pr_bridgeh', x, y); return; }
  if ((t === 4 || t === 41) && bio === 'C') { for (var qq = 0; qq < 4; qq++) fr('a_flag_' + (qq & 1) + (qq >> 1) + 'F' + Math.floor(hash2(i, j, 2) * 2), x + (qq & 1) * 12, y + (qq >> 1) * 12); return; }
  if (t === 4 || t === 41) { auto(B.road, i, j, function (a, b) { var tt = wt(a, b); return tt === 4 || tt === 41 || tt === 10; }, x, y); return; }
  if (t === 22) { auto('pit', i, j, function (a, b) { return wt(a, b) === 22; }, x, y); return; }
  if (t === 9) { var l = wt(i - 1, j) === 9, r = wt(i + 1, j) === 9; fr('ld_' + (l && r ? 'M' : r ? 'L' : l ? 'R' : 'S'), x, y); return; }
  var P1 = { 2: 'pr_rock', 5: 'bu_' + B.bush, 11: 'pr_flowers', 12: 'pr_crack', 13: 'pr_grave', 15: 'pr_bones', 16: 'pr_candles', 17: 'pr_fence', 18: 'pr_peg_up', 19: 'pr_peg_dn', 23: 'pr_bloodrock', 26: 'pr_sign', 30: 'pr_grass', 31: 'pr_cross', 33: 'pr_skulls', 48: 'pr_stump', 49: 'pr_mush' }[t];
  if (t === 20) { var g = orbGate(i, j); P1 = g && g.open ? 'pr_orb1' : 'pr_orb0'; }
  if (P1) { if (t === 11 || t === 30 || t === 18 || t === 19) fr(P1, x, y); else prop(P1, x, y); } }
function isWallD(i, j) { var t = tAt(i, j); return t === 81 || t === 92; }
function paintDg(t, i, j, x, y) { var D = DUNGEONS[DG.di], look = D.look, v = Math.floor(hash2(i, j, 5) * 6);
  if (t === 79) { R('#050203', x, y, TS, TS); return; }
  if (t === 81 || t === 92) { fr('df_' + look + '0', x, y); paintWall(i, j, x, y, isWallD, 'dw_' + look); return; }
  fr('df_' + look + (v < 4 ? 0 : v === 4 ? 1 : 2), x, y);
  if (t === 82) auto('pit', i, j, function (a, b) { return tAt(a, b) === 82; }, x, y);
  else if (t === 83) auto({ sewer: 'cream', funhouse: 'cream', lair: 'goo' }[look] || 'blood', i, j, function (a, b) { return tAt(a, b) === 83; }, x, y);
  else if (t === 99) auto('rug', i, j, function (a, b) { return tAt(a, b) === 99; }, x, y);
  else if (t === 84) fr('pr_block', x, y - 2); else if (t === 85) fr('pr_heavy', x, y - 2); else if (t === 98) fr('pr_spikes', x, y); else if (t === 94) fr('pr_peg_up', x, y); else if (t === 95) fr('pr_peg_dn', x, y);
  else if (t === 93) fr('pr_stairs', x, y); else if (t === 91) fr('pr_shut', x, y); else if (t === 86) prop('pr_torch', x, y); else if (t === 96) prop('pr_orb0', x, y);
  if (t === 88) { var up = tAt(i, j - 1), dn = tAt(i, j + 1); if (isWallD(i - 1, j) || isWallD(i + 1, j)) R('rgba(5,2,3,0.35)', x, y, TS, TS); } }
function isWallI(i, j) { var t = tAt(i, j); return t === 69 || t < 0; }
function paintIn(t, i, j, x, y) { var cave = SCR.style === 'cave';
  if (t === 69) { fr('in_cfloor', x, y); paintWall(i, j, x, y, isWallI, 'cliff'); return; }
  if (t === 61) { if (j === 0 && i > 0 && i < COLS - 1) fr('iw_' + SCR.style + '0', x, y); else if (j === 1 && i > 0 && i < COLS - 1) fr('iw_' + SCR.style + '1', x, y); else fr('in_side', x, y); return; }
  fr(cave || t === 68 ? 'in_cfloor' : 'in_floor', x, y);
  if (t === 63) auto('rug', i, j, function (a, b) { return tAt(a, b) === 63; }, x, y);
  var n = { 62: 'in_counter', 64: 'in_table', 65: 'in_shelf', 66: 'in_crate', 70: 'in_exit', 71: 'in_fire', 72: 'in_stool', 73: 'in_cabinet', 74: 'in_plant', 75: 'in_pool' }[t];
  if (n) fr(n, x, y); if (t === 67 && tAt(i, j - 1) !== 67) fr('in_bed', x, y); if (t === 13) prop('pr_grave', x, y); if (t === 31) prop('pr_cross', x, y); if (t === 16) prop('pr_candles', x, y); }
/* ---------- the frame ---------- */
function draw() {
  R('#070405', 0, 0, KIT.W, H); var ox = Math.round((KIT.W - COLS * TS) / 2);
  if (!SCR || !P) return;
  var g = KIT.ctx, cx = Math.round(CAM.x), cy = Math.round(CAM.y); g.save(); g.beginPath(); g.rect(ox, OY, COLS * TS, ROWS * TS); g.clip();
  var c0 = Math.floor(cx / (CHW * TS)), c1 = Math.floor((cx + COLS * TS - 1) / (CHW * TS)), r0 = Math.floor(cy / (CHH * TS)), r1 = Math.floor((cy + ROWS * TS - 1) / (CHH * TS));
  for (var cj = Math.max(0, r0); cj <= r1; cj++) for (var ci = Math.max(0, c0); ci <= c1; ci++) KIT.blit(chunkLayer(ci, cj), ox + ci * CHW * TS - cx, OY + cj * CHH * TS - cy);
  g.translate(ox - cx, OY - cy);
  waterShimmer();
  var list = [], i0 = Math.floor(cx / TS) - 3, i1 = i0 + COLS + 6, j0 = Math.floor(cy / TS) - 1, j1 = j0 + ROWS + 6;
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { var t = tAt(i, j), x = i * TS, y = j * TS;
    if (SCR.kind === 'world') { if (t === 14) list.push({ y: y + 23, s: 'pr_lamp', x: x + 12, yy: y + 24 }); else if (t === 43) list.push({ y: y + 23, s: 'pr_stone', x: x + 12, yy: y + 24 }); else if (t === 27) list.push({ y: y + 23, s: 'pr_statue', x: x + 12, yy: y + 24 }); }
    else if (SCR.kind === 'dg') { if (t === 87) list.push({ y: y + 23, s: 'pr_statue', x: x + 12, yy: y + 24 }); else if (t === 86) { (function (x, y) { list.push({ y: y + 1, f: function () { flame(x + 12, y + 8); } }); })(x, y); } else if (t === 76) { (function (i, j) { list.push({ y: (j + 1) * TS, f: function () { drawChest(i, j); } }); })(i, j); } } }
  if (SCR.kind === 'world') {
    var vx0 = cx - 140, vx1 = cx + COLS * TS + 140, vy0 = cy - 20, vy1 = cy + ROWS * TS + 160;
    TREES.forEach(function (o) { var x = o.i * TS + 12, y = (o.j + 1) * TS; if (x < vx0 || x > vx1 || y < vy0 || y > vy1) return; list.push({ y: y - 1, s: o.f, x: x, yy: y + 1 }); });
    STRUCTS.forEach(function (S) { var y = (S.j + 1) * TS; if (S.cx < vx0 - 40 || S.cx > vx1 + 40 || y < vy0 || y - 140 > vy1) return; list.push({ y: y - 2, s: S.spr, x: S.cx, yy: y }); });
    GATES.forEach(function (gg) { if (gg.kind === 'e' && !gg.open && gg.eye) { var x = (gg.eye[0] + 0.5) * TS, y = (gg.eye[1] + 1) * TS; list.push({ y: y - 1, s: 'pr_eyegate', x: x, yy: y }); } });
    WITEMS.forEach(function (it) { if (SV.got['wp:' + it.id]) return; var x = (it.i + 0.5) * TS, y = (it.j + 0.5) * TS; list.push({ y: y, f: function () { drawPiece(x, y); } }); }); }
  if (SCR.kind === 'dg') DG.doors.forEach(function (d) { var st = dgState(DG.di); if (st.open[d.id]) return; var k = { locked: 'lock', boss: 'boss', eye: 'eye', crack: 'crack' }[d.kind]; if (!k) return; var q = d.tiles[1], ti = q % DG.w, tj = Math.floor(q / DG.w);
    list.push({ y: (tj + 1) * TS - (d.side === 's' ? 0 : 30), f: function () { if (d.vert) KIT.spr('dr_' + k + '_v', (ti + 0.5) * TS, (tj + 2) * TS); else KIT.spr('dr_' + k, (ti + 0.5) * TS, (tj + 1) * TS + 3); } }); });
  (SCR.npcs || []).forEach(function (n) { list.push({ y: n.y, f: function () { drawNpc(n); } }); });
  if (SCR.kind === 'in') { (SCR.wares || []).forEach(function (w) { list.push({ y: w.y + 1, f: function () { drawWare(w); } }); }); if (SCR.chest) { var c = SCR.chest; list.push({ y: c.y + 10, f: function () { KIT.spr(SV.got['ch:' + c.id] ? 'pr_bigchesto' : 'pr_bigchest', c.x, c.y + 10); } }); } if (INSIDE_EXTRA[SCR.id]) list.push({ y: 0, f: INSIDE_EXTRA[SCR.id] }); }
  PICK.forEach(function (k) { list.push({ y: k.y, f: function () { drawPick(k); } }); });
  FOE.forEach(function (f) { if (f.hp <= 0) return; list.push({ y: f.y + 10, f: function () { var n = f.d.s + (Math.floor(G.t * 6 + f.x) % (f.d.nf || 4)); shadow(f.x, f.y + 9, 8); KIT.spr(n, f.x, f.y + 10, { flip: P.x > f.x, flash: f.hurt > 0, alpha: f.stun > 0 ? 0.7 : 1 }); if (f.stun > 0) R('#ffe36a', f.x - 1, f.y - 22 + Math.sin(G.t * 10) * 2, 2, 2); } }); });
  if (BOSS) { var b = BOSS; list.push({ y: b.y + 24, f: function () { var bn = b.B.s + (Math.floor(G.t * 3) % 2); shadow(b.x, b.y + 22, 22); KIT.spr(bn, b.x, b.y + 26, { flip: P.x > b.x && !KIT.has(bn + 'L'), flash: b.hurt > 0 || (b.st !== 'idle' && b.t < 0.4 && Math.floor(G.t * 12) % 2 === 0) }); b.marks.forEach(function (m) { if (!m.done) { g.fillStyle = 'rgba(255,38,48,' + (0.3 + Math.sin(G.t * 20) * 0.2) + ')'; g.beginPath(); g.ellipse(m.x, m.y, 16, 8, 0, 0, 6.3); g.fill(); } }); } }); }
  list.push({ y: P.y + 12, f: drawPlayer });
  list.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { if (e.f) e.f(); else KIT.spr(e.s, e.x, e.yy); });
  SHOT.forEach(function (s) { if (s.bread) KIT.spr('it_bread', s.x, s.y, { anchor: 'c', rot: G.t * 20 }); else if (s.foe) { g.fillStyle = '#12040a'; g.beginPath(); g.arc(s.x, s.y, 5, 0, 6.3); g.fill(); g.fillStyle = '#c04aff'; g.beginPath(); g.arc(s.x, s.y, 4, 0, 6.3); g.fill(); } else { R('#12040a', s.x - 4, s.y - 4, 8, 8); R('#f1e0b0', s.x - 3, s.y - 3, 6, 6); R('#ffffff', s.x - 2, s.y - 2, 2, 2); } });
  FX.forEach(function (f) { if (f.k === 'bomb') { if (!f.boom) KIT.spr(Math.floor(G.t * 8) % 2 ? 'gr_bombl' : 'gr_bomb', f.x, f.y, { anchor: 'c' }); return; } if (f.k === 'spear') { g.fillStyle = '#e8dcc8'; g.beginPath(); g.moveTo(f.x - 6, f.y); g.lineTo(f.x, f.y - 30); g.lineTo(f.x + 6, f.y); g.fill(); f.t -= 1 / 60; return; }
    if (f.k === 'ring') { f.t -= 1 / 60; g.strokeStyle = 'rgba(255,227,106,' + Math.max(0, f.t * 2) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, (0.5 - f.t) * 60 + 6, 0, 6.3); g.stroke(); return; } f.t -= 1 / 60; f.x += f.vx / 60; f.y += f.vy / 60; R(f.col, f.x, f.y, 2, 2); });
  FX = FX.filter(function (f) { return f.k === 'bomb' ? !f.boom || f.t > -0.2 : f.t > 0; });
  g.restore();
  drawNight(ox);
  if (FADE) { var a = FADE.t < 0.22 ? FADE.t / 0.22 : Math.max(0, 1 - (FADE.t - 0.22) / 0.22); R('rgba(7,4,5,' + Math.min(1, a) + ')', ox, OY, COLS * TS, ROWS * TS); }
  hud(ox);
}
function flame(x, y) { var fl = Math.sin(G.t * 14 + x) * 1.5; R('#12040a', x - 4, y - 10 + fl, 8, 9); R('#ff7a2a', x - 3, y - 9 + fl, 6, 7); R('#ffe36a', x - 2, y - 6 + fl, 4, 4); R('#ffffff', x - 1, y - 4 + fl, 2, 2); }
function drawChest(i, j) { var c = DG.chests.filter(function (c) { return c.i === i && c.j === j; })[0]; if (!c) return; var st = dgState(DG.di), open = st.chests[c.room + c.kind]; KIT.spr(c.big ? (open ? 'pr_bigchesto' : 'pr_bigchest') : (open ? 'pr_chesto' : 'pr_chest'), (i + 0.5) * TS, (j + 1) * TS); }
function shadow(x, y, r) { var g = KIT.ctx; g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, y, r, r * 0.4, 0, 0, 6.3); g.fill(); }
function drawPlayer() { var p = P, d = p.dir === 'l' || p.dir === 'r' ? 's' : p.dir, fr2 = 'chb_' + d + (p.moving ? Math.floor(p.anim) % 4 : 0), flip = p.dir === 'l', z = p.z || 0;
  if (p.fall > 0) { var k = p.fall / 0.45; if (p.fallK === 'water') { R('#f1e7d0', p.x - 8 * k, p.y + 4, 16 * k, 2); } else KIT.spr(fr2, p.x, p.y + 12, { sx: k, sy: k, alpha: k }); return; }
  shadow(p.x, p.y + 11, 8 - z / 4); if (p.hover > 0) KIT.spr('steve0', p.x, p.y - 20, { alpha: 0.95 });
  var blink = (p.inv > 0 && Math.floor(G.t * 20) % 2) || (G.pillInv > 0 && Math.floor(G.t * 10) % 2);
  if (!blink) KIT.spr(fr2, p.x, p.y + 12 - (p.hover > 0 ? 6 : 0) - z, { flip: flip });
  if (SV.items.condom && !blink) KIT.condom && KIT.condom(p.x, p.y + 12 - z, 26, 38, G.t);
  if (p.atk > 0) { var v = DIRV[p.dir], k2 = 1 - p.atk / 0.24; KIT.spr('lc_sausage', p.x + v[0] * 12, p.y + v[1] * 10 - 4, { anchor: 'c', rot: Math.atan2(v[1], v[0]) + (k2 - 0.5) * 1.8 }); } }
function drawNpc(n) { shadow(n.x, n.y + 1, 9); KIT.spr(n.spr, n.x, n.y + 2, { flip: !!n.face }); }
function drawPiece(x, y) { var b = Math.round(Math.sin(G.t * 3) * 2); shadow(x, y + 8, 6); KIT.spr('gr_heart', x, y + b, { anchor: 'c' }); if (Math.floor(G.t * 3) % 2) R('#ffe36a', x - 1, y - 8 + b, 2, 2); }
function drawPick(k) { var x = k.x, y = Math.round(k.y + Math.sin(G.t * 4 + x) * 1.5); if (k.t !== undefined && k.t < 2 && Math.floor(G.t * 10) % 2) return;
  if (k.k === 'drop') KIT.spr('lc_drop', x, y, { anchor: 'c' }); else if (k.k === 'heart' || k.k === 'heartc') KIT.spr('gr_heart', x, y, { anchor: 'c', sc: k.k === 'heartc' ? 2 : 1 }); else if (k.k === 'bomb') KIT.spr('gr_bomb', x, y, { anchor: 'c' }); else if (k.k === 'chal') chalice(x, y, CHALCOL[DG ? DG.di : 0]); }
function chalice(x, y, col) { var gg = KIT.ctx; gg.fillStyle = '#12040a'; gg.fillRect(x - 9, y - 11, 18, 4); gg.fillStyle = '#ffe36a'; gg.beginPath(); gg.moveTo(x - 8, y - 10); gg.lineTo(x + 8, y - 10); gg.lineTo(x + 4, y); gg.lineTo(x + 2, y + 6); gg.lineTo(x + 6, y + 10); gg.lineTo(x - 6, y + 10); gg.lineTo(x - 2, y + 6); gg.lineTo(x - 4, y); gg.fill(); R(col || '#f1e0b0', x - 6, y - 9, 12, 3); }
function drawWare(w) { var x = w.x, y = w.y, ok = w.ok(); KIT.ctx.globalAlpha = ok ? 1 : 0.35; drawIcon(w.icon, x, y - 4); KIT.ctx.globalAlpha = 1; if (w.price) { KIT.text('' + w.price, x, y + 8, { align: 'center', size: 6, col: ok ? '#ffe36a' : '#6a5a4a', outline: 1 }); }
  if (Math.abs(P.x - x) < 16 && P.y > y && P.y - y < 48 && P.dir === 'u' && !MSGBOX) { KIT.text(w.name.toUpperCase(), x, y - 22, { align: 'center', size: 6, col: '#f1e7d0', outline: 1 }); } }
var ICONSPR = { bombs: 'gr_bomb', heart: 'gr_heart', pie: 'it_pie', slice: 'it_pie', piece: 'gr_heart', chilli: 'it_chilli', pill: 'it_pill', pint: 'it_pint', cuppa: 'it_espresso', tea: 'it_tea', pizza: 'it_pizza', condom: 'gr_shield', bottle: 'it_bloodvial', slot: 'it_dice', stew: 'it_tin', sharp: 'it_sword' };
function drawIcon(k, x, y) { var s = ICONSPR[k]; if (s && KIT.has(s)) { KIT.spr(s, x, y, { anchor: 'c' }); if (k === 'piece') R('#ffe36a', x - 1, y - 8, 2, 2); return; } R('#12040a', x - 5, y - 5, 10, 10); R('#ffe36a', x - 4, y - 4, 8, 8); }
/* moving highlights on the water in view */
function waterShimmer() { var i0 = Math.floor(CAM.x / TS), j0 = Math.floor(CAM.y / TS); for (var j = j0; j <= j0 + ROWS; j++) for (var i = i0; i <= i0 + COLS; i++) { var t = tAt(i, j); if (t !== 3 && t !== 83) continue; var ph = (G.t * 0.8 + hash2(i, j, 5) * 6) % 6;
  if (ph < 1.6) { var c = SCR.kind === 'world' ? BIOMES[bioAt(i, j)].water : 'cream'; R(c === 'cream' ? '#fff6dc' : c === 'goo' ? '#c47aff' : '#ff4a50', i * TS + 3 + ((hash2(i, j, 6) * 12) | 0), j * TS + 5 + ((hash2(i, j, 7) * 12) | 0), 3 + (ph * 2 | 0), 1); } } }
/* the light: lamps, torches, candles and windows glow; the wood and the wastes are darker; dungeons are dark round the torches */
var ASH = []; for (var q0 = 0; q0 < 30; q0++) ASH.push({ x: Math.random() * 480, y: Math.random() * 240, s: 6 + Math.random() * 14, w: Math.random() * 6 });
var NIGHT = null;
function sceneLights() { var L = [], i0 = Math.floor(CAM.x / TS) - 4, j0 = Math.floor(CAM.y / TS) - 4;
  if (SCR.kind === 'world' || SCR.kind === 'dg') for (var j = j0; j <= j0 + ROWS + 8; j++) for (var i = i0; i <= i0 + COLS + 8; i++) { var t = tAt(i, j), x = (i + 0.5) * TS - CAM.x, y = (j + 0.5) * TS - CAM.y;
    if (t === 14) L.push({ x: x, y: y - 26, r: 70, c: 'rgba(255,170,90,' }); else if (t === 16) L.push({ x: x, y: y, r: 40, c: 'rgba(255,120,60,' }); else if (t === 86) L.push({ x: x, y: y - 4, r: 96, c: 'rgba(255,140,70,' }); else if (t === 20 || t === 96) L.push({ x: x, y: y - 8, r: 36, c: 'rgba(200,90,255,' }); else if (t === 83 && hash2(i, j, 9) < 0.15) L.push({ x: x, y: y, r: 30, c: 'rgba(255,240,200,' }); }
  if (SCR.kind === 'world') STRUCTS.forEach(function (S) { var x = S.cx - CAM.x, y = (S.j + 0.5) * TS - CAM.y; if (x < -150 || x > 630 || y < -150 || y > 400) return; if (S.shop || /house|chapel|treehouse|shack/.test(S.spr)) L.push({ x: x, y: y - 10, r: 64, c: 'rgba(255,190,110,' }); else if (/factory|funhouse|carousel|ferris/.test(S.spr)) L.push({ x: x, y: y - 30, r: 110, c: 'rgba(255,60,60,' }); else if (/lair/.test(S.spr)) L.push({ x: x, y: y - 30, r: 110, c: 'rgba(200,40,255,' }); });
  if (SCR.kind === 'in') (SCR.lights || []).forEach(function (l) { L.push({ x: l.x - CAM.x, y: l.y - CAM.y, r: l.r, c: l.c || 'rgba(255,170,90,' }); });
  return L; }
function darkness() { if (SCR.kind === 'dg') return 0.4; if (SCR.kind === 'in') return SCR.dark || 0.06; var b = bioAt(P.x / TS, P.y / TS); return b === 'f' ? 0.3 : b === 'w' ? 0.28 : b === 'C' ? 0.1 : b === 'p' ? 0.16 : 0.14; }
function drawNight(ox) {
  if (!SCR || !P) return; var g = KIT.ctx, Wd = COLS * TS, Hd = ROWS * TS, L = sceneLights(), dark = darkness();
  var cheap = SCR.kind === 'world' || (SCR.kind === 'in' && !SCR.dark);
  if (cheap) R('rgba(10,0,8,' + (dark * 0.7) + ')', ox, OY, Wd, Hd);
  else { if (!NIGHT) { NIGHT = document.createElement('canvas'); NIGHT.width = Wd; NIGHT.height = Hd; }
  var n = NIGHT.getContext('2d'); n.globalCompositeOperation = 'source-over'; n.clearRect(0, 0, Wd, Hd); n.fillStyle = 'rgba(10,0,8,' + dark + ')'; n.fillRect(0, 0, Wd, Hd);
  n.globalCompositeOperation = 'destination-out'; function hole(x, y, r) { var gr = n.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); n.fillStyle = gr; n.beginPath(); n.arc(x, y, r, 0, 6.3); n.fill(); }
  hole(P.x - CAM.x, P.y - CAM.y, 110); L.forEach(function (l) { hole(l.x, l.y, l.r * (0.95 + Math.sin(G.t * 9 + l.x) * 0.04)); });
  g.drawImage(NIGHT, ox, OY); }
  g.save(); g.beginPath(); g.rect(ox, OY, Wd, Hd); g.clip(); g.globalCompositeOperation = 'lighter'; L.forEach(function (l) { var gr = g.createRadialGradient(ox + l.x, OY + l.y, 0, ox + l.x, OY + l.y, l.r * 0.7); gr.addColorStop(0, l.c + '0.16)'); gr.addColorStop(1, l.c + '0)'); g.fillStyle = gr; g.fillRect(ox + l.x - l.r, OY + l.y - l.r, l.r * 2, l.r * 2); }); g.restore();
  if (SCR.kind === 'world') { var b = bioAt(P.x / TS, P.y / TS); g.fillStyle = b === 'w' ? 'rgba(200,120,255,0.45)' : 'rgba(200,120,110,0.4)'; ASH.forEach(function (a) { a.y += a.s / 60; a.x += Math.sin(G.t + a.w) * 0.3 - 0.2; if (a.y > Hd) { a.y = -4; a.x = Math.random() * Wd; } if (a.x < 0) a.x += Wd; g.fillRect(ox + (a.x | 0), OY + (a.y | 0), 1, 1); }); }
  var vg = g.createRadialGradient(ox + Wd / 2, OY + Hd / 2, Hd * 0.5, ox + Wd / 2, OY + Hd / 2, Wd * 0.62); vg.addColorStop(0, 'rgba(30,0,6,0)'); vg.addColorStop(1, 'rgba(30,0,6,0.28)'); g.fillStyle = vg; g.fillRect(ox, OY, Wd, Hd);
}
function hud(ox) {
  R('#0e0708', 0, 0, KIT.W, OY); R('#4a1a1c', 0, OY - 1, KIT.W, 1); R('#12040a', 0, OY - 2, KIT.W, 1);
  for (var i = 0; i < SV.hearts; i++) { var full = P.hp >= (i + 1) * 2, half = P.hp === i * 2 + 1; KIT.spr(full ? 'gr_heart' : half ? 'gr_hearth' : 'gr_hearte', ox + 8 + (i % 10) * 13, 4 + Math.floor(i / 10) * 12, { anchor: 'tl' }); }
  var hx = ox + Math.max(140, 8 + Math.min(10, SV.hearts) * 13 + 6);
  KIT.spr('lc_drop', hx, 8, { anchor: 'tl' }); KIT.text('' + SV.drops, hx + 14, 10, { size: 8, col: '#ffe36a' });
  if (SV.items.bombs) { KIT.spr('gr_bomb', hx + 50, 7, { anchor: 'tl' }); KIT.text('' + SV.bombs, hx + 66, 10, { size: 8 }); }
  if (DG) { var st = dgState(DG.di); KIT.spr('gr_key', hx + 92, 8, { anchor: 'tl' }); KIT.text('' + (st.keys || 0), hx + 106, 10, { size: 8 }); if (st.bk) { KIT.spr('gr_key', hx + 120, 6, { anchor: 'tl', sc: 1 }); R('#ff2630', hx + 121, 7, 3, 3); } }
  var bx = hx + 140; KIT.panel(bx, 2, 34, 26); KIT.text('B', bx + 3, 4, { size: 6, col: '#a6968f' }); if (SV.sel === 'bottle') drawIcon(SV.bottle === 'full' ? 'cuppa' : 'bottle', bx + 18, 16); else if (SV.sel && ITEMS[SV.sel]) KIT.spr(ITEMS[SV.sel].icon, bx + 18, 15, { anchor: 'c' });
  for (var c = 0; c < 5; c++) { var hv = SV.chal.indexOf(c) >= 0; R('#12040a', bx + 42 + c * 10, 10, 9, 11); R(hv ? CHALCOL[c] : '#2a1416', bx + 43 + c * 10, 11, 7, 7); if (hv) R('#ffe36a', bx + 43 + c * 10, 18, 7, 2); }
  if (G.banner && G.banner.t > 0) { var a = Math.min(1, G.banner.t, 2.6 - G.banner.t); R('rgba(0,0,0,' + 0.6 * a + ')', 0, H * 0.4, KIT.W, 30); KIT.text(G.banner.s, KIT.W / 2, H * 0.4 + 4, { align: 'center', font: 'title', size: 22, col: '#ffe36a', alpha: a }); }
  if (MSGBOX) { var lines = KIT.wrap((MSGBOX.who ? MSGBOX.who + ':  ' : '') + MSGBOX.s, COLS * TS - 40, 14, 'body'); KIT.panel(ox + 10, H - 22 - lines.length * 15, COLS * TS - 20, lines.length * 15 + 16); lines.forEach(function (s, n) { KIT.text(s, ox + 20, H - 14 - lines.length * 15 + n * 15, { font: 'body', size: 14 }); }); }
  if (G.mode === 'dead') { R('rgba(0,0,0,' + Math.min(0.8, G.deadT) + ')', 0, 0, KIT.W, H); KIT.text('YOU DIED', KIT.W / 2, H * 0.4, { align: 'center', font: 'title', size: 34, col: '#c4121c', alpha: Math.min(1, G.deadT) }); }
}
