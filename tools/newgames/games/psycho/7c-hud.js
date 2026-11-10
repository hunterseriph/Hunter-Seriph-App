/* update 128: the HUD dressed properly (he said it all looked basic): a heart monitor with a screen, grid and a glowing
   trace, things in slots, the trip as six capsules, the weapon in a framed box with its rounds drawn out */
function hudSlot(x, y, w, h, on, gold) { var ctx = KIT.ctx; ctx.fillStyle = '#12040a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = on ? '#1c0b0e' : '#0c0607'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 1, y + 1, w - 2, 2); ctx.fillStyle = gold ? '#ffe36a' : on ? '#7a2226' : '#3a1416'; ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h); ctx.fillRect(x, y, w, 1); }
function hudCond(P, t) {
  var ctx = KIT.ctx, k = P.hp / maxHp(), col = k > 0.6 ? '#4adf6a' : k > 0.3 ? '#ffe36a' : '#ff2630', word = k > 0.6 ? 'FINE' : k > 0.3 ? 'CAUTION' : 'DANGER', rate = k > 0.6 ? 1.2 : k > 0.3 ? 1.8 : 2.6;
  var X = 8, Y = 8, SW = 108, SH = 24; KIT.panel(X, Y, SW + 12, 50, { stud: 1 });
  var sx = X + 6, sy = Y + 6; ctx.fillStyle = '#020604'; ctx.fillRect(sx, sy, SW, SH); ctx.fillStyle = k > 0.6 ? 'rgba(40,120,60,0.16)' : k > 0.3 ? 'rgba(140,120,30,0.16)' : 'rgba(150,20,20,0.2)';
  for (var gx = 6; gx < SW; gx += 9) ctx.fillRect(sx + gx, sy, 1, SH); for (var gy = 4; gy < SH; gy += 8) ctx.fillRect(sx, sy + gy, SW, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, SW, SH); ctx.clip(); var head = (t * rate * 0.5) % 1, my = sy + SH / 2 + 1;
  function yAt(x) { var ph = ((x / SW) * 2 - t * rate) % 1, u = ph < 0 ? ph + 1 : ph; return u > 0.38 && u < 0.42 ? -2 : u > 0.44 && u < 0.47 ? -10 : u > 0.47 && u < 0.5 ? 8 : u > 0.5 && u < 0.53 ? -3 : u > 0.6 && u < 0.68 ? -2.5 : 0; }
  for (var pass = 0; pass < 2; pass++) { ctx.strokeStyle = col; ctx.lineWidth = pass ? 1.2 : 3.5; ctx.globalAlpha = pass ? 1 : 0.22; ctx.lineJoin = 'round'; ctx.beginPath(); for (var x = 0; x <= SW; x += 1.5) { var yy = my + yAt(x); if (!x) ctx.moveTo(sx + x, yy); else ctx.lineTo(sx + x, yy); } ctx.stroke(); }
  ctx.globalAlpha = 1; var g = ctx.createLinearGradient(sx + head * SW - 34, 0, sx + head * SW, 0); g.addColorStop(0, 'rgba(2,6,4,0)'); g.addColorStop(1, 'rgba(2,6,4,0.78)'); ctx.fillStyle = g; ctx.fillRect(sx + head * SW - 34, sy, 34, SH); // the sweep wipes the old trace
  ctx.fillStyle = 'rgba(2,6,4,0.78)'; ctx.fillRect(sx + head * SW, sy, 5, SH); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.9; ctx.fillRect(sx + head * SW - 1, my + yAt(head * SW) - 1, 2, 2); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(sx, sy, SW, 5); ctx.restore();
  ctx.strokeStyle = '#3a1416'; ctx.lineWidth = 1; ctx.strokeRect(sx - 0.5, sy - 0.5, SW + 1, SH + 1);
  var beat = Math.max(0, 1 - ((t * rate * 2) % 1) * 3); ctx.fillStyle = col; ctx.globalAlpha = 0.45 + beat * 0.55; ctx.beginPath(); ctx.arc(sx + 4, sy + SH + 8, 2.2 + beat, 0, 6.29); ctx.fill(); ctx.globalAlpha = 1;
  KIT.text(word, sx + 10, sy + SH + 5, { col: col, size: 8 }); KIT.text(Math.ceil(P.hp) + '', sx + SW, sy + SH + 5, { col: '#f1e7d0', size: 8, align: 'right' });
  KIT.bar(sx, Y + 45, SW, 2, P.st / 100, P.stLock ? '#6a3a3a' : '#c8c0a0');
  /* things: three slots and the key */
  var items = [['cracker', 'i_cracker'], ['cuppa', 'i_cuppa'], ['pill', 'i_pill']], IY = Y + 53;
  items.forEach(function (q, n) { var n0 = P.inv[q[0]], ix = X + n * 31; hudSlot(ix, IY, 29, 22, n0 > 0); ctx.globalAlpha = n0 ? 1 : 0.3; drawTile(q[1], ix + 1, IY + 1, 20); ctx.globalAlpha = 1; KIT.text('' + n0, ix + 27, IY + 13, { size: 6, col: n0 ? '#ffe36a' : '#4a3a3a', align: 'right', outline: n0 ? 1 : 0 }); });
  var kx = X + 93; hudSlot(kx, IY, 27, 22, P.keys[G.fi], P.keys[G.fi]); ctx.globalAlpha = P.keys[G.fi] ? 1 : 0.18; drawTile('i_key', kx + 3, IY + 1, 20); ctx.globalAlpha = 1;
  P.buffs.forEach(function (b, n) { KIT.text(BUFFS[b].n, X + 2, IY + 27 + n * 9, { size: 6, col: '#ff4a8a', outline: 1 }); });
}
function hudTrip(L, t) {
  var ctx = KIT.ctx, W = KIT.W, tl = Math.floor(L + 1e-6), X = W - 126, Y = 32, COL = ['#ff4a8a', '#ffe36a', '#4adfff', '#7aff6a', '#c04aff', '#ff7a2a'];
  KIT.panel(X, Y, 118, 34, { stud: 1 });
  for (var p = 0; p < TRIPMAX; p++) { var f = Math.max(0, Math.min(1, L - p)), cx = X + 8 + p * 18, cy = Y + 6, w = 14, h = 8, wob = f > 0 && L > 3 ? Math.sin(t * 6 + p) * 1 : 0;
    ctx.save(); ctx.translate(0, wob); ctx.beginPath(); ctx.moveTo(cx + 4, cy); ctx.arcTo(cx + w, cy, cx + w, cy + h, 4); ctx.arcTo(cx + w, cy + h, cx, cy + h, 4); ctx.arcTo(cx, cy + h, cx, cy, 4); ctx.arcTo(cx, cy, cx + w, cy, 4); ctx.closePath();
    ctx.fillStyle = '#070304'; ctx.fill(); ctx.strokeStyle = f > 0 ? '#12040a' : '#7a2226'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.clip(); ctx.fillStyle = '#070304'; ctx.fillRect(cx, cy, w, h);
    if (f > 0) { ctx.fillStyle = COL[p]; ctx.fillRect(cx, cy, w * f, h); ctx.fillStyle = '#f1e7d0'; ctx.fillRect(cx, cy, Math.min(w / 2, w * f), h); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(cx + 2, cy + 1, w - 4, 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(cx, cy + h - 2, w, 2); }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(cx + w / 2 - 0.5, cy, 1, h); ctx.restore(); }
  KIT.text(TRIPNAME[Math.min(TRIPMAX, tl)], X + 59, Y + 21, { align: 'center', size: 8, col: L > 3 ? COL[Math.floor(t * 4) % 3] : L > 0.5 ? '#f1e7d0' : '#a6968f' });
}
function hudWeapon(P) {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H, Wp = WEAP[P.weap], bw = 140, wx = Math.round(W / 2 - bw / 2), wy = H - 44; KIT.panel(wx, wy, bw, 38, { stud: 1 });
  hudSlot(wx + 5, wy + 5, 36, 28, 1); var ic = ICONS[P.weap]; if (ic) ctx.drawImage(ic, wx + 5, wy + 1, 36, 36);
  KIT.text(Wp.short || 'FISTS', wx + 47, wy + 8, { size: 8, col: '#f1e7d0', max: bw - 54 });
  if (Wp.gun) { var n = P.ammo[Wp.ammo], show = Math.min(n, 12); KIT.text('' + n, wx + 47, wy + 21, { size: 8, col: n ? '#ffe36a' : '#ff2630' }); var ax = wx + 47 + KIT.tw('' + n, 8) + 5;
    if (n) for (var i = 0; i < 12; i++) { ctx.fillStyle = i < show ? '#d8a030' : '#2a1014'; ctx.fillRect(ax + i * 5, wy + 21, 3, 7); if (i < show) { ctx.fillStyle = '#ffe9a0'; ctx.fillRect(ax + i * 5, wy + 21, 1, 7); ctx.fillStyle = '#8a4a1c'; ctx.fillRect(ax + i * 5, wy + 26, 3, 2); } }
    if (!n) KIT.text('EMPTY', ax + 2, wy + 22, { size: 6, col: KIT.t % 0.6 < 0.3 ? '#ff2630' : '#7a2226' }); }
  else KIT.text(Wp.throw ? 'THROW' : 'MELEE', wx + 47, wy + 21, { size: 8, col: '#ffe36a' });
}
function hudPrompt(pt) {
  var ctx = KIT.ctx, W = KIT.W, H = KIT.H, tw = KIT.tw(pt, 8), pw = tw + 36, x = Math.round(W / 2 - pw / 2), y = H - 70; KIT.panel(x, y, pw, 22);
  var pulse = 0.5 + Math.sin(KIT.t * 5) * 0.5; ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x + 13, y + 11, 8, 0, 6.29); ctx.fill(); ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.arc(x + 13, y + 11, 6.5, 0, 6.29); ctx.fill();
  ctx.strokeStyle = 'rgba(255,227,106,' + (0.3 + pulse * 0.6) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 13, y + 11, 7.5 + pulse, 0, 6.29); ctx.stroke();
  KIT.text('A', x + 13, y + 7, { align: 'center', size: 8, col: '#f1e7d0' }); KIT.text(pt, x + 26, y + 7, { size: 8, col: '#f1e7d0' });
}
/* a boss's health: his name in the title face over a framed bar with quarter marks and a trailing white chunk for the last hit */
var HUDB = { k: 1, lag: 1, id: '' };
function hudBoss(name, k, col, x, y, w) {
  var ctx = KIT.ctx; if (HUDB.id !== name) { HUDB.id = name; HUDB.lag = k; } if (HUDB.lag < k) HUDB.lag = k; HUDB.lag += (k - HUDB.lag) * 0.04;
  KIT.text(name, x + w / 2, y - 3, { align: 'center', font: 'title', size: 16, col: '#f1e7d0', outline: 1 });
  var by = y + 15, h = 7; ctx.fillStyle = '#12040a'; ctx.fillRect(x - 3, by - 3, w + 6, h + 6); ctx.fillStyle = '#7a2226'; ctx.fillRect(x - 2, by - 2, w + 4, h + 4); ctx.fillStyle = '#12040a'; ctx.fillRect(x - 1, by - 1, w + 2, h + 2); ctx.fillStyle = '#1c0b0e'; ctx.fillRect(x, by, w, h);
  ctx.fillStyle = '#f1e7d0'; ctx.fillRect(x, by, w * HUDB.lag, h); ctx.fillStyle = col; ctx.fillRect(x, by, w * k, h); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(x, by, w * k, 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, by + h - 2, w * k, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; for (var q = 1; q < 4; q++) ctx.fillRect(x + Math.round(w * q / 4), by, 1, h);
  [x - 6, x + w + 6].forEach(function (dx) { ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.moveTo(dx, by - 4); ctx.lineTo(dx + 6, by + h / 2); ctx.lineTo(dx, by + h + 4); ctx.lineTo(dx - 6, by + h / 2); ctx.fill(); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.moveTo(dx, by - 2); ctx.lineTo(dx + 4, by + h / 2); ctx.lineTo(dx, by + h + 2); ctx.lineTo(dx - 4, by + h / 2); ctx.fill(); });
}
