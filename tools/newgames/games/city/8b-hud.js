/* ---------- what is on the screen: the radar, health and armour, money, the wanted stars, the weapon, the clock,
   messages, subtitles, prompts, speech over people's heads, and the full map ---------- */
var MAPC = null;
function mapCanvas() {
  if (MAPC) return MAPC; var c = document.createElement('canvas'); c.width = MW; c.height = MH; var g = c.getContext('2d'), im = g.createImageData(MW, MH), d = im.data;
  var COL = {}; COL[K_SEA] = [16, 22, 44]; COL[K_WATER] = [26, 40, 70]; COL[K_SAND] = [150, 136, 100]; COL[K_GRASS] = [40, 64, 34]; COL[K_FOREST] = [24, 46, 24]; COL[K_ROAD] = [190, 180, 170]; COL[K_PAVE] = [92, 84, 82]; COL[K_LOT] = [70, 62, 62]; COL[K_PARK] = [48, 84, 40];
  COL[K_ROCK] = [80, 72, 68]; COL[K_DIRT] = [100, 78, 58]; COL[K_RUNWAY] = [120, 120, 124]; COL[K_GRAVE] = [44, 58, 40]; COL[K_BRIDGE] = [200, 60, 60]; COL[K_CREAM] = [220, 206, 170]; COL[K_PIER] = [110, 80, 50]; COL[K_YARD] = [80, 80, 80]; COL[K_FIELD] = [76, 84, 44];
  for (var i = 0; i < MW * MH; i++) { var cc = COL[KM[i]] || [0, 0, 0], q = i * 4, h = HT[i]; var k = KM[i] === K_ROAD || KM[i] === K_BRIDGE ? 1 : 0.85 + clamp(h / 120, 0, 0.4); d[q] = cc[0] * k; d[q + 1] = cc[1] * k; d[q + 2] = cc[2] * k; d[q + 3] = 255; }
  g.putImageData(im, 0, 0); g.fillStyle = '#3a2a2c'; BLD.forEach(function (b) { if (!b.solid) return; g.fillStyle = b.shop ? '#7a1a20' : b.h > 30 ? '#4a3a3c' : '#342628'; g.fillRect(b.x0 / CT, b.z0 / CT, (b.x1 - b.x0) / CT, (b.z1 - b.z0) / CT); });
  MAPC = c; return c;
}
var BLIPS = { shop: '#ffe36a', mission: '#ff2630', house: '#7aff6a', race: '#4adfff', event: '#ff7ab0', clue: '#c48aff', wash: '#f1e7d0', car: '#ffffff', way: '#ffe36a' };
function blipList() { var L = []; (G.uses || []).forEach(function (u) { if (u.blip) L.push({ x: u.x, z: u.z, c: BLIPS[u.blip] || '#fff', icon: u.icon, big: u.blip === 'mission' }); }); if (G.mission && G.mission.mark) L.push({ x: G.mission.mark.x, z: G.mission.mark.z, c: '#ffe36a', big: 1, icon: '!' }); if (SV.way) L.push({ x: SV.way[0], z: SV.way[1], c: '#ff2630', big: 1, icon: 'X' }); (G.blips || []).forEach(function (b) { L.push(b); }); return L; }
function drawRadar(x, y, r) {
  var ctx = KIT.ctx, mc = mapCanvas(), px = (P.state === 'car' && P.veh ? P.veh.x : P.x), pz = (P.state === 'car' && P.veh ? P.veh.z : P.z), zoom = P.state === 'car' && P.veh && Math.abs(P.veh.sp) > 15 ? 0.55 : 0.85, rot = CAM.yaw;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = '#070405'; ctx.fill(); ctx.clip();
  ctx.translate(x, y); ctx.rotate(rot + Math.PI); ctx.scale(zoom, zoom); ctx.imageSmoothingEnabled = false; ctx.drawImage(mc, -px / CT, -pz / CT); ctx.setTransform(KIT.S, 0, 0, KIT.S, 0, 0);
  // blips
  blipList().forEach(function (b) { var dx = (b.x - px) / CT * zoom, dz = (b.z - pz) / CT * zoom, c = Math.cos(rot + Math.PI), s = Math.sin(rot + Math.PI), rx = dx * c - dz * s, rz = dx * s + dz * c, d = Math.hypot(rx, rz); if (d > r - 4) { rx *= (r - 4) / d; rz *= (r - 4) / d; }
    ctx.fillStyle = '#12040a'; ctx.fillRect(x + rx - (b.big ? 3 : 2), y + rz - (b.big ? 3 : 2), b.big ? 6 : 4, b.big ? 6 : 4); ctx.fillStyle = b.c; ctx.fillRect(x + rx - (b.big ? 2 : 1), y + rz - (b.big ? 2 : 1), b.big ? 4 : 2, b.big ? 4 : 2); });
  PEDS.forEach(function (p) { if (!(p.cop || p.hostile || p.mission) || p.dead) return; var dx = (p.x - px) / CT * zoom, dz = (p.z - pz) / CT * zoom, c = Math.cos(rot + Math.PI), s = Math.sin(rot + Math.PI), rx = dx * c - dz * s, rz = dx * s + dz * c; if (Math.hypot(rx, rz) > r) return; ctx.fillStyle = p.cop ? (Math.floor(G.t * 6) % 2 ? '#2a6aff' : '#ff2630') : '#ff2630'; ctx.fillRect(x + rx - 1, y + rz - 1, 2, 2); });
  ctx.restore();
  // you, north, the ring
  ctx.save(); ctx.translate(x, y); var pa = (P.state === 'car' && P.veh ? P.veh.a : P.a) - rot; ctx.rotate(-pa); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(3, 3); ctx.lineTo(-3, 3); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#4a1a1c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); ctx.strokeStyle = '#c4121c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, 6.283); ctx.stroke();
  var na = rot + Math.PI; tx('N', x + Math.sin(-na) * (r - 5) - 2, y - Math.cos(-na) * (r - 5) - 3, { col: '#f1e7d0', size: 6 });
}
function drawHud() {
  var ctx = KIT.ctx, Wd = KIT.W, Hd = KIT.H, up = Hd > Wd, pad = KIT.padRect ? KIT.padRect() : null;
  if (G.mode !== 'play' || !P) return;
  // radar bottom left (above the touch stick when upright)
  var rr = up ? 34 : 30, rx = 8 + rr + 5, ry = Hd - rr - 12; drawRadar(rx, ry, rr);
  tx(districtName(P.x, P.z).toUpperCase(), rx - rr, ry - rr - 12, { col: '#a6968f', size: 6 });
  // top right: clock, money, weapon, stars
  var x1 = Wd - 8, hh = Math.floor(G.time), mm = Math.floor((G.time - hh) * 60), clock = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  ctx.save(); ctx.translate(0, 18); tx(clock, x1 - tw2(clock, 10), 22, { col: '#f1e7d0', size: 10 }); var sd = SEASONS[season()] + ' · Day ' + (G.day + 1); tx(sd, x1 - tw2(sd, 6), 31, { col: '#a6968f', size: 6 });
ctx.restore(); drawStatus(ctx);
  // drunk/high/pilled and the boost, the radio
  var st = []; if (G.drunk > 0.1) st.push('DRUNK'); if (G.high > 0.1) st.push('HIGH'); if (G.pilled > 0.1) st.push('PILLED'); if (st.length) tx(st.join(' · '), 10, 76, { col: '#c48aff', size: 7 });
  if (G.radioName && G.radioT > 0) { G.radioT -= 1 / 60; var rn = G.radioName; ctx.globalAlpha = Math.min(1, G.radioT); tx(rn, Wd / 2 - tw2(rn, 10) / 2, 26, { col: '#ffe36a', size: 10 }); if (G.radioSong) tx(G.radioSong, Wd / 2 - tw2(G.radioSong, 6) / 2, 36, { col: '#f1e7d0', size: 6 }); ctx.globalAlpha = 1; }
  if (G.radioLine && P.state === 'car') { var rl = G.radioLine.who + ': ' + G.radioLine.s, L3 = KIT.wrap(rl, Wd * 0.62, 6, 'body'); L3.slice(0, 3).forEach(function (l, i) { tx(l, Wd / 2 - tw2(l, 6) / 2, 44 + i * 7, { col: '#ffe36a', size: 6 }); }); }
  // mission text and timers
  if (G.objective) { var ob = G.objective, lines = KIT.wrap ? KIT.wrap(ob, Wd * 0.7, 7, 'body') : [ob]; lines.forEach(function (l, i) { tx(l, Wd / 2 - tw2(l, 7) / 2, Hd * (up ? 0.12 : 0.16) + i * 9, { col: '#f1e7d0', size: 7, sh: 1 }); }); }
  if (G.timer !== undefined && G.timer !== null) { var tt = Math.max(0, G.timer), ts = Math.floor(tt / 60) + ':' + ('0' + Math.floor(tt % 60)).slice(-2); tx(ts, Wd / 2 - tw2(ts, 12) / 2, Hd * 0.1 - 6, { col: tt < 10 ? '#ff2630' : '#ffe36a', size: 12 }); }
  if (G.counter) tx(G.counter, Wd - 8 - tw2(G.counter, 7), 84, { col: '#ffe36a', size: 7 });
  // subtitles
  if (G.sub && G.sub.t > 0) { G.sub.t -= 1 / 60; var who = G.sub.who ? G.sub.who + ': ' : '', txt = who + G.sub.s, wl2 = KIT.wrap ? KIT.wrap(txt, Wd * 0.8, 8, 'body') : [txt]; ctx.fillStyle = 'rgba(7,4,5,0.72)'; ctx.fillRect(Wd * 0.08, Hd - 22 - wl2.length * 10, Wd * 0.84, wl2.length * 10 + 8); wl2.forEach(function (l, i) { tx(l, Wd / 2 - tw2(l, 8) / 2, Hd - 16 - (wl2.length - 1 - i) * 10, { col: i === 0 && who ? '#ffe36a' : '#f1e7d0', size: 8 }); }); }
  // toasts
  if (G.toasts && G.toasts.length) { var T = G.toasts[0]; T.t -= 1 / 60; if (T.t <= 0) G.toasts.shift(); ctx.fillStyle = 'rgba(7,4,5,0.8)'; var tw = tw2(T.s, 7) + 14; ctx.fillRect(8, 86, tw, 15); ctx.fillStyle = '#c4121c'; ctx.fillRect(8, 86, 2, 15); tx(T.s, 15, 90, { col: '#f1e7d0', size: 7 }); }
  // the big words
  if (G.big && G.big.t > 0) { G.big.t -= 1 / 60; var bs = G.big.sz || 26, bw = tw2(G.big.s, bs, 'title'); tx(G.big.s, Wd / 2 - bw / 2, Hd * 0.38, { col: G.big.col || '#c4121c', size: bs, font: 'title', sh: 1 }); if (G.big.sub) tx(G.big.sub, Wd / 2 - tw2(G.big.sub, 8) / 2, Hd * 0.38 + bs + 4, { col: '#f1e7d0', size: 8 }); }
  // the prompt for whatever is near
  var u = P.state === 'foot' ? nearestUse() : null, pr = u ? (u.label || 'USE') : null; if (!pr && P.state === 'foot' && !G.cut) { var nv = null; VEH.forEach(function (v) { if (!v.dead && dist2(P.x, P.z, v.x, v.z) < Math.pow(v.t.len * 0.6 + 2, 2)) nv = v; }); if (nv) pr = (nv.driver ? 'STEAL ' : 'GET IN ') + nv.t.n.toUpperCase(); }
  if (P.state === 'car') pr = G.carUse ? G.carUse.label : null; if (pr) { var lab = (TOUCHUI() ? 'Y' : KEYY()) + '  ' + pr, lw = tw2(lab, 7) + 14; ctx.fillStyle = 'rgba(7,4,5,0.8)'; ctx.fillRect(Wd / 2 - lw / 2, Hd * (up ? 0.52 : 0.7), lw, 14); ctx.strokeStyle = '#c4121c'; ctx.strokeRect(Wd / 2 - lw / 2 + 0.5, Hd * (up ? 0.52 : 0.7) + 0.5, lw - 1, 13); tx(lab, Wd / 2 - lw / 2 + 7, Hd * (up ? 0.52 : 0.7) + 4, { col: '#ffe36a', size: 7 }); }
  // speech over heads
  PEDS.forEach(function (p) { if (!p.said || p.sayT <= 0 || p.dead) return; var s = R3.project(p.x, p.y + 2.3, p.z); if (!s || dist2(p.x, p.z, P.x, P.z) > 30 * 30) return; var w = Math.min(160, tw2(p.said, 6) + 8), L = KIT.wrap ? KIT.wrap(p.said, 150, 6, 'body') : [p.said]; ctx.fillStyle = 'rgba(241,231,208,0.92)'; ctx.fillRect(s.x - w / 2, s.y - L.length * 8 - 4, w, L.length * 8 + 4); L.forEach(function (l, i) { tx(l, s.x - tw2(l, 6) / 2, s.y - L.length * 8 - 1 + i * 8, { col: '#12040a', size: 6 }); }); });
  // aiming: the target ring
  if (P.aim && P.target) { var ts2 = R3.project(P.target.x, P.target.y + 1.2, P.target.z); if (ts2) { ctx.strokeStyle = '#ff2630'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ts2.x, ts2.y, 7, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#ff2630'; ctx.fillRect(ts2.x - 0.5, ts2.y - 0.5, 1, 1); } }
  else if (P.aim) { ctx.fillStyle = '#f1e7d0'; ctx.fillRect(Wd / 2 - 0.5, Hd / 2 - 4, 1, 3); ctx.fillRect(Wd / 2 - 0.5, Hd / 2 + 1, 1, 3); ctx.fillRect(Wd / 2 - 4, Hd / 2 - 0.5, 3, 1); ctx.fillRect(Wd / 2 + 1, Hd / 2 - 0.5, 3, 1); }
  // speed in a vehicle
  if (P.state === 'car' && P.veh) { var v = P.veh, mph = Math.round(Math.abs(v.sp) * 2.237), sl = mph + ' MPH', vn = v.t.n.toUpperCase(); var sx0 = rx + rr + 10; tx(sl, sx0, Hd - 14, { col: '#f1e7d0', size: 10 }); tx(vn, sx0, Hd - 26, { col: '#a6968f', size: 6 }); if (v.t.cls === 'heli' || v.t.cls === 'plane') { var alt = 'ALT ' + Math.round(v.y - groundY(v.x, v.z)) + ' M'; tx(alt, sx0, Hd - 36, { col: '#4adfff', size: 7 }); } if (v.hp < 40) tx('DAMAGED', sx0, Hd - 46, { col: '#ff2630', size: 7 }); }
  // hurt: red at the edges
  if (P.hp < 30) { ctx.fillStyle = 'rgba(160,0,10,' + (0.12 + 0.08 * Math.sin(G.t * 6)) + ')'; ctx.fillRect(0, 0, Wd, 4); ctx.fillRect(0, Hd - 4, Wd, 4); ctx.fillRect(0, 0, 4, Hd); ctx.fillRect(Wd - 4, 0, 4, Hd); }
}
function TOUCHUI() { return !document.documentElement.classList.contains('hs-notouch') && ('ontouchstart' in window); }
function KEYY() { return KIT.gamepad ? 'Y' : 'E'; }
function toast(s, t) { G.toasts = G.toasts || []; if (G.toasts.length && G.toasts[G.toasts.length - 1].s === s) return; G.toasts.push({ s: s, t: t || 3 }); }
function bigText(s, sub, col, t) { G.big = { s: s, sub: sub, col: col, t: t || 3 }; }
function subtitle(who, s, t) { G.sub = { who: who, s: s, t: t || Math.max(3, s.length * 0.065) }; if (typeof radioDuck === 'function') radioDuck(G.sub.t); }
/* ---------- the full map (in the pause menu) ---------- */
function mapMenu(back) { // update 155: the map has its own controls (he said they fought each other): the touch pad hides,
  // one finger drags, two pinch, a tap without dragging drops or lifts the waypoint, on-screen buttons zoom, centre, clear and close; pads pan with the left stick, zoom with the right stick or LB/RB
  KIT.closeMenu(); G.mapOpen = { x: P.x, z: P.z, zoom: 1.4, back: back, ptrs: {}, drag: 0 }; G.mode = 'map'; document.documentElement.classList.add('hs-menu', 'hs-map'); mapPointer(true);
}
function mapClose() { var M0 = G.mapOpen; G.mode = 'play'; G.mapOpen = null; mapPointer(false); document.documentElement.classList.remove('hs-menu', 'hs-map'); if (M0 && M0.back) M0.back(); }
function mapBtns() { var Wd = KIT.W, Hd = KIT.H, s = 30, x = Wd - s - 8; return [{ id: 'close', t: '✕', x: x, y: 34, w: s, h: s }, { id: 'in', t: '+', x: x, y: 34 + s + 8, w: s, h: s }, { id: 'out', t: '−', x: x, y: 34 + (s + 8) * 2, w: s, h: s }, { id: 'me', t: '◎', x: x, y: 34 + (s + 8) * 3, w: s, h: s }, { id: 'clear', t: 'CLEAR', x: x - 26, y: 34 + (s + 8) * 4, w: s + 26, h: 22 }]; }
function mapPress(id) { var M0 = G.mapOpen; if (!M0) return; sfx.play('select'); if (id === 'close') mapClose(); else if (id === 'in') M0.zoom = clamp(M0.zoom * 1.5, 0.5, 6); else if (id === 'out') M0.zoom = clamp(M0.zoom / 1.5, 0.5, 6); else if (id === 'me') { M0.x = P.x; M0.z = P.z; } else if (id === 'clear') SV.way = null; }
var MAPH = null;
function mapPointer(on) { var cv = KIT.ctx.canvas; if (!cv) return;
  if (!on) { if (MAPH) { cv.removeEventListener('pointerdown', MAPH.d); window.removeEventListener('pointermove', MAPH.m); window.removeEventListener('pointerup', MAPH.u); window.removeEventListener('pointercancel', MAPH.u); cv.removeEventListener('wheel', MAPH.w); } MAPH = null; return; }
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * KIT.W, y: (e.clientY - r.top) / r.height * KIT.H }; }
  function sc() { return Math.min(KIT.W / MW, KIT.H / MH) * G.mapOpen.zoom / CT; }
  MAPH = { d: function (e) { var M0 = G.mapOpen; if (!M0) return; var p = pos(e); M0.ptrs[e.pointerId] = { x: p.x, y: p.y, x0: p.x, y0: p.y }; M0.drag = 0; M0.pinch = null; e.preventDefault(); },
    m: function (e) { var M0 = G.mapOpen; if (!M0 || !M0.ptrs[e.pointerId]) return; var p = pos(e), q = M0.ptrs[e.pointerId], ids = Object.keys(M0.ptrs);
      if (ids.length >= 2) { var a = M0.ptrs[ids[0]], b = M0.ptrs[ids[1]]; q.x = p.x; q.y = p.y; var d = Math.hypot(a.x - b.x, a.y - b.y); if (M0.pinch) M0.zoom = clamp(M0.zoom * d / M0.pinch, 0.5, 6); M0.pinch = d; M0.drag = 99; return; }
      var dx = p.x - q.x, dy = p.y - q.y; q.x = p.x; q.y = p.y; if (Math.hypot(p.x - q.x0, p.y - q.y0) > 5) M0.drag = 1; if (M0.drag) { M0.x = clamp(M0.x - dx / sc(), 0, WX); M0.z = clamp(M0.z - dy / sc(), 0, WZ); } },
    u: function (e) { var M0 = G.mapOpen; if (!M0 || !M0.ptrs[e.pointerId]) return; var q = M0.ptrs[e.pointerId]; delete M0.ptrs[e.pointerId]; if (Object.keys(M0.ptrs).length) return; M0.pinch = null; if (M0.drag) return;
      var hit = mapBtns().filter(function (b) { return q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h; })[0]; if (hit) { mapPress(hit.id); return; }
      var mx = M0.x + (q.x - KIT.W / 2) / sc(), mz = M0.z + (q.y - KIT.H / 2) / sc(); mapWay(mx, mz); },
    w: function (e) { var M0 = G.mapOpen; if (!M0) return; M0.zoom = clamp(M0.zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), 0.5, 6); e.preventDefault(); } };
  cv.addEventListener('pointerdown', MAPH.d); window.addEventListener('pointermove', MAPH.m); window.addEventListener('pointerup', MAPH.u); window.addEventListener('pointercancel', MAPH.u); cv.addEventListener('wheel', MAPH.w, { passive: false }); }
function mapWay(x, z) { var M0 = G.mapOpen; SV.way = SV.way && Math.hypot(SV.way[0] - x, SV.way[1] - z) < 50 / M0.zoom ? null : [clamp(x, 0, WX), clamp(z, 0, WZ)]; sfx.play('select'); }
function stepMap(dt) {
  var M0 = G.mapOpen, s = KIT.stick(0), r = KIT.stick(1); M0.x = clamp(M0.x + s.x * 420 * dt / M0.zoom, 0, WX); M0.z = clamp(M0.z + s.y * 420 * dt / M0.zoom, 0, WZ);
  M0.zoom = clamp(M0.zoom * (1 - r.y * dt * 1.8) * (KIT.held('rb') ? 1 + dt * 1.8 : 1) / (KIT.held('lb') ? 1 + dt * 1.8 : 1), 0.5, 6);
  if (KIT.pressed('a')) mapWay(M0.x, M0.z); if (KIT.pressed('x')) { SV.way = null; sfx.play('select'); } if (KIT.pressed('y')) { M0.x = P.x; M0.z = P.z; }
  if (KIT.pressed('b') || KIT.pressed('start') || KIT.pressed('pause')) mapClose();
}
function drawMap() {
  var ctx = KIT.ctx, Wd = KIT.W, Hd = KIT.H, M0 = G.mapOpen, mc = mapCanvas(), sc = Math.min(Wd / MW, Hd / MH) * M0.zoom; ctx.fillStyle = '#0a0c18'; ctx.fillRect(0, 0, Wd, Hd);
  ctx.save(); ctx.imageSmoothingEnabled = M0.zoom < 1.5; ctx.translate(Wd / 2, Hd / 2); ctx.scale(sc, sc); ctx.drawImage(mc, -M0.x / CT, -M0.z / CT); ctx.restore();
  function W2S(x, z) { return [Wd / 2 + (x - M0.x) / CT * sc, Hd / 2 + (z - M0.z) / CT * sc]; }
  DIST.forEach(function (d) { if (!d.cx) return; var p = W2S(d.cx, d.cz); tx(d.name.toUpperCase(), p[0] - tw2(d.name.toUpperCase(), 6) / 2, p[1], { col: 'rgba(241,231,208,0.75)', size: 6 }); });
  blipList().forEach(function (b) { var p = W2S(b.x, b.z); ctx.fillStyle = '#12040a'; ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6); ctx.fillStyle = b.c; ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4); if (b.icon && M0.zoom > 1.2) tx(b.icon, p[0] + 4, p[1] - 4, { col: b.c, size: 6 }); });
  var pp = W2S(P.x, P.z); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(pp[0], pp[1], 3, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#ff2630'; ctx.beginPath(); ctx.moveTo(Wd / 2 - 6, Hd / 2); ctx.lineTo(Wd / 2 + 6, Hd / 2); ctx.moveTo(Wd / 2, Hd / 2 - 6); ctx.lineTo(Wd / 2, Hd / 2 + 6); ctx.stroke();
  tx('CUM CITY', 10, 12, { col: '#c4121c', size: 16, font: 'title' }); tx(districtName(M0.x, M0.z), 10, 32, { col: '#f1e7d0', size: 8 });
  if (SV.way) { var wp = W2S(SV.way[0], SV.way[1]); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(wp[0], wp[1], 5, 0, 6.3); ctx.fill(); ctx.fillStyle = '#ff2630'; ctx.beginPath(); ctx.arc(wp[0], wp[1], 3.5, 0, 6.3); ctx.fill(); }
  tx(TOUCHUI() ? 'DRAG TO MOVE · PINCH TO ZOOM · TAP TO MARK A PLACE' : KIT.gamepad ? 'A MARK · X CLEAR · Y YOU · LB/RB ZOOM · B BACK' : 'DRAG TO MOVE · WHEEL TO ZOOM · CLICK TO MARK · ESC BACK', 10, Hd - 14, { col: '#a6968f', size: 6 });
  mapBtns().forEach(function (b) { KIT.panel(b.x, b.y, b.w, b.h); tx(b.t, b.x + b.w / 2 - tw2(b.t, b.t.length > 1 ? 7 : 12) / 2, b.y + b.h / 2 - (b.t.length > 1 ? 4 : 7), { col: b.id === 'close' ? '#ff2630' : '#ffe36a', size: b.t.length > 1 ? 7 : 12 }); });
}
(function () { DIST.forEach(function (d) { var sx = 0, sz = 0, n = 0; for (var j = 0; j < MH; j += 6) for (var i = 0; i < MW; i += 6) if (DM[j * MW + i] === d.i) { sx += i; sz += j; n++; } if (n > 20 && d.id !== 'sea' && d.id !== 'country') { d.cx = sx / n * CT; d.cz = sz / n * CT; } }); })();

function tx(s, x, y, o) { o = o || {}; if (!o.font) o.font = 'body'; if (o.sh) delete o.sh; KIT.text(s, x, y, o); }
function tw2(s, size, f) { return KIT.tw(s, size, f || 'body'); }

/* the status plate, top left (his ask): the weapon in a box, money, health and armour bars, the wanted stars */
function wIcon(ctx, id, x, y, s) { // little silhouettes, drawn in a 16 x 16 grid
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 16, s / 16); var B = '#12040a', M = '#c8c0bc', D = '#6a6266', R0 = function (c, a, b, w, h) { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  if (id === 'fists') { var F = '#f6f0e4', S2 = '#c8bca8'; ctx.fillStyle = B; ctx.beginPath(); ctx.moveTo(3, 6); ctx.lineTo(13, 4); ctx.lineTo(14.5, 6); ctx.lineTo(14.5, 11); ctx.lineTo(11, 14); ctx.lineTo(6, 15); ctx.lineTo(2, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = F; ctx.beginPath(); ctx.moveTo(4, 7); ctx.lineTo(12.6, 5.2); ctx.lineTo(13.5, 6.5); ctx.lineTo(13.5, 10.6); ctx.lineTo(10.6, 13); ctx.lineTo(6.2, 14); ctx.lineTo(3.2, 11.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = S2; for (var k = 0; k < 3; k++) ctx.fillRect(6 + k * 2.4, 6.2 - k * 0.45, 0.8, 3); ctx.fillStyle = B; ctx.fillRect(4.2, 10, 6.5, 0.9); ctx.fillStyle = S2; ctx.fillRect(4.2, 11, 6, 1.6); ctx.fillStyle = '#c4121c'; ctx.fillRect(2.4, 12.6, 4.6, 1.6); }
  else if (id === 'knife') { ctx.rotate(-0.7); R0(B, -2, 6, 8, 4); R0('#3a2a1a', -1, 7, 6, 2); R0(B, 6, 6, 12, 4); R0(M, 6, 7, 11, 2); R0('#fff', 7, 7, 9, 1); }
  else if (id === 'bat') { ctx.rotate(-0.7); R0(B, -2, 6, 20, 4); R0('#b8864a', -1, 7, 7, 2); R0('#c8965a', 6, 6, 11, 4); R0('#e0b070', 7, 6, 9, 1); }
  else if (id === 'sausage') { ctx.rotate(-0.6); R0(B, -2, 5, 20, 6); R0('#a83a2a', -1, 6, 18, 4); R0('#d86a4a', 0, 6, 16, 1); }
  else if (id === 'pistol') { R0(B, 2, 4, 13, 5); R0(D, 3, 5, 11, 3); R0(B, 3, 8, 5, 6); R0('#3a2a1a', 4, 8, 3, 5); R0(M, 3, 5, 11, 1); }
  else if (id === 'smg') { R0(B, 1, 4, 15, 5); R0(D, 2, 5, 13, 3); R0(B, 4, 8, 4, 6); R0(B, 9, 8, 3, 7); R0(D, 10, 9, 1, 5); R0(M, 2, 5, 13, 1); }
  else if (id === 'shotgun') { R0(B, 0, 5, 16, 4); R0(D, 1, 6, 10, 2); R0('#5a3a1a', 11, 6, 4, 4); R0(B, 10, 8, 6, 5); R0('#6a4a2a', 11, 9, 4, 3); R0(M, 1, 6, 10, 1); }
  else if (id === 'rifle') { R0(B, 0, 6, 16, 3); R0(D, 1, 7, 9, 1); R0(B, 4, 3, 5, 3); R0(D, 5, 4, 3, 1); R0('#5a3a1a', 10, 6, 6, 5); R0(B, 7, 9, 2, 4); }
  else if (id === 'rocket') { R0(B, 0, 5, 16, 6); R0('#3a4a2a', 1, 6, 14, 4); R0('#c4121c', 0, 6, 2, 4); R0(B, 6, 10, 3, 4); R0('#5a6a3a', 1, 6, 14, 1); }
  else if (id === 'bag') { R0(B, 4, 6, 9, 9); R0('#6a4a2a', 5, 7, 7, 7); R0(B, 6, 4, 5, 3); R0('#ff8a2a', 7, 1, 3, 4); R0('#ffe36a', 8, 2, 1, 2); }
  else if (id === 'pills') { R0(B, 4, 2, 8, 13); R0('#f6f0e4', 5, 6, 6, 8); R0('#c4121c', 5, 3, 6, 3); R0('#ff8ab0', 6, 8, 4, 2); }
  else { R0(B, 3, 3, 10, 10); R0(M, 4, 4, 8, 8); }
  ctx.restore(); }
function drawStatus(ctx) {
  var x = 8, y = 8, w = 152, h = 46; KIT.panel(x, y, w, h);
  // the weapon box
  var bx = x + 5, by = y + 5, bs = h - 10; ctx.fillStyle = '#070405'; ctx.fillRect(bx, by, bs, bs); ctx.strokeStyle = '#4a1a1c'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bs - 1, bs - 1);
  wIcon(ctx, P.wpn, bx + 5, by + 3, bs - 10); var W0 = WPN[P.wpn]; if (W0.ammo) { var am = '' + ammoOf(P.wpn); tx(am, bx + bs - 3 - tw2(am, 6), by + bs - 9, { col: '#ffe36a', size: 6 }); }
  // money
  var mx = bx + bs + 6, mon = '$' + Math.floor(SV.money).toLocaleString('en-GB'), ms = G.moneyPop > 0 ? 13 : 12; G.moneyPop = Math.max(0, (G.moneyPop || 0) - 1 / 60 * 2); tx(mon, mx, y + 6, { col: '#ffe36a', size: ms, font: 'title' });
  // health: a heart and a red bar; armour (the condom) cream under it
  var hy = y + 24, bw = x + w - 8 - (mx + 9), flash = P.hp < 25 && Math.floor(G.t * 4) % 2;
  ctx.fillStyle = flash ? '#ff2630' : '#c4121c'; ctx.beginPath(); ctx.arc(mx + 2, hy + 1.5, 2, 0, 6.3); ctx.arc(mx + 5, hy + 1.5, 2, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.moveTo(mx, hy + 2.5); ctx.lineTo(mx + 7, hy + 2.5); ctx.lineTo(mx + 3.5, hy + 6.5); ctx.closePath(); ctx.fill();
  KIT.bar(mx + 10, hy, bw, 5, P.hp / SV.maxHp, flash ? '#ff2630' : '#c4121c');
  var ay = hy + 9; ctx.fillStyle = '#f1e7d0'; ctx.fillRect(mx + 2, ay, 3, 5); ctx.beginPath(); ctx.arc(mx + 3.5, ay, 1.5, Math.PI, 0); ctx.fill();
  KIT.bar(mx + 10, ay + 1, bw, 3, (P.armour || 0) / 100, '#f1e7d0', '#2a2420');
  // wanted stars under the plate
  for (var s = 0; s < 5; s++) { var on = s < SV.wanted, sx = x + 4 + s * 13; ctx.globalAlpha = on ? (G.lostT > 6 && Math.floor(G.t * 3) % 2 ? 0.45 : 1) : 0.28; star(ctx, sx + 6, y + h + 8, 5.5, on ? '#ffe36a' : '#3a2a2c'); ctx.globalAlpha = 1; }
}
function star(ctx, cx, cy, r, col) { ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#12040a'; ctx.lineWidth = 2; ctx.strokeStyle = '#12040a'; ctx.stroke(); ctx.fillStyle = col; ctx.fill(); }
