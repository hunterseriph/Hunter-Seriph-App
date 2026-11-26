/* ---------- what is on the screen: the radar, health and armour, money, the wanted stars, the weapon, the clock,
   messages, subtitles, prompts, speech over people's heads, and the full map ---------- */
var MAPC = null;
function mapCanvas() { // update 158 (his ask: the map felt basic): drawn at twice the tile size, the land shaded, the roads as smooth lines with kerbs, park paths, buildings with a shadow
  if (MAPC) return MAPC; var c0 = document.createElement('canvas'); c0.width = MW; c0.height = MH; var g = c0.getContext('2d'), im = g.createImageData(MW, MH), d = im.data;
  var COL = {}; COL[K_SEA] = [16, 22, 44]; COL[K_WATER] = [26, 40, 70]; COL[K_SAND] = [150, 136, 100]; COL[K_GRASS] = [40, 64, 34]; COL[K_FOREST] = [24, 46, 24]; COL[K_ROAD] = [92, 84, 82]; COL[K_PAVE] = [92, 84, 82]; COL[K_LOT] = [70, 62, 62]; COL[K_PARK] = [48, 84, 40];
  COL[K_ROCK] = [80, 72, 68]; COL[K_DIRT] = [100, 78, 58]; COL[K_RUNWAY] = [120, 120, 124]; COL[K_GRAVE] = [44, 58, 40]; COL[K_BRIDGE] = [40, 52, 86]; COL[K_CREAM] = [220, 206, 170]; COL[K_PIER] = [110, 80, 50]; COL[K_YARD] = [80, 80, 80]; COL[K_FIELD] = [76, 84, 44];
  for (var i = 0; i < MW * MH; i++) { var cc = COL[KM[i]] || [0, 0, 0], q = i * 4, h = HT[i], x = i % MW, j = (i - x) / MW, sh = 0;
    if (x > 0 && j > 0) sh = clamp((HT[i] - HT[i - MW - 1]) * 0.08, -0.18, 0.18); var k = 0.85 + clamp(h / 120, 0, 0.4) + sh; d[q] = cc[0] * k; d[q + 1] = cc[1] * k; d[q + 2] = cc[2] * k; d[q + 3] = 255; }
  g.putImageData(im, 0, 0);
  var S = 2, c = document.createElement('canvas'); c.width = MW * S; c.height = MH * S; var g2 = c.getContext('2d'); g2.imageSmoothingEnabled = true; g2.drawImage(c0, 0, 0, MW * S, MH * S);
  function path(pts) { g2.beginPath(); pts.forEach(function (p, k) { var x = p[0] / CT * S, z = p[1] / CT * S; if (k) g2.lineTo(x, z); else g2.moveTo(x, z); }); }
  g2.lineCap = 'round'; g2.lineJoin = 'round';
  RE.forEach(function (E) { path(E.pts); g2.strokeStyle = '#141012'; g2.lineWidth = E.w / CT * S + 2.2; g2.stroke(); });
  (typeof PPATH !== 'undefined' ? PPATH : []).forEach(function (P0) { path(P0.pts); g2.strokeStyle = '#8a7a72'; g2.lineWidth = P0.w / CT * S; g2.stroke(); });
  RE.forEach(function (E) { path(E.pts); var br = E.pts.some(function (p) { return kAt(p[0], p[1]) === K_BRIDGE; }); g2.strokeStyle = E.track ? '#9a8a76' : E.w >= 14 ? '#e8dcc8' : '#c8bcb0'; g2.lineWidth = E.w / CT * S; g2.stroke(); if (E.w >= 14) { path(E.pts); g2.strokeStyle = '#c4121c'; g2.lineWidth = 0.6; g2.stroke(); } });
  BLD.forEach(function (b) { if (!b.solid) return; var x = b.x0 / CT * S, z = b.z0 / CT * S, w = (b.x1 - b.x0) / CT * S, hh = (b.z1 - b.z0) / CT * S; g2.fillStyle = 'rgba(0,0,0,0.35)'; g2.fillRect(x + 1, z + 1, w, hh); g2.fillStyle = b.shop && SHOPS[b.shop] ? '#8a1a20' : b.h > 30 ? '#5a4a4c' : b.style === 'house' ? '#6a3a30' : '#3e3032'; g2.fillRect(x, z, w, hh); });
  MAPC = c; MAPC.S = S; return c;
}
var MAPICON = { petrol: ['P', '#ffb030'], diner: ['D', '#ff7ab0'], motel: ['M', '#ff2630'], jetty: ['F', '#4adfff'], lookout: ['L', '#7aff6a'], view: ['V', '#f1e7d0'], camp: ['C', '#ffb030'], scrapyard: ['S', '#a6968f'], church: ['+', '#f1e7d0'], drivein: ['T', '#ffe36a'], golf: ['G', '#7aff6a'], observatory: ['O', '#4adfff'], village: ['B', '#ffe36a'], cabin: ['H', '#c8a060'], castle: ['K', '#c4121c'], grotto: ['G', '#f1e7d0'] };
var BLIPS = { shop: '#ffe36a', mission: '#ff2630', house: '#7aff6a', race: '#4adfff', event: '#ff7ab0', clue: '#c48aff', wash: '#f1e7d0', car: '#ffffff', way: '#ffe36a' };
function blipList() { var L = []; if (G.coop && G.coop.other && G.coop.other.tg) L.push({ x: G.coop.other.x, z: G.coop.other.z, c: '#4adfff', icon: G.guest ? 'C' : 'S', big: 1 }); if (G.coopMark) L.push({ x: G.coopMark.x, z: G.coopMark.z, c: '#ffe36a', big: 1, icon: '!' }); (G.uses || []).forEach(function (u) { if (u.blip) L.push({ x: u.x, z: u.z, c: BLIPS[u.blip] || '#fff', icon: u.icon, big: u.blip === 'mission', who: u.m ? u.m.who : null }); }); if (G.mission && G.mission.mark) L.push({ x: G.mission.mark.x, z: G.mission.mark.z, c: '#ffe36a', big: 1, icon: '!' }); if (SV.way) L.push({ x: SV.way[0], z: SV.way[1], c: '#ff2630', big: 1, icon: 'X' }); (G.blips || []).forEach(function (b) { L.push(b); }); return L; }
function drawRadar(x, y, r) {
  var ctx = KIT.ctx, mc = mapCanvas(), px = (P.state === 'car' && P.veh ? P.veh.x : P.x), pz = (P.state === 'car' && P.veh ? P.veh.z : P.z), zoom = P.state === 'car' && P.veh && Math.abs(P.veh.sp) > 15 ? 0.55 : 0.85, rot = CAM.yaw;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = '#070405'; ctx.fill(); ctx.clip();
  ctx.translate(x, y); ctx.rotate(rot + Math.PI); ctx.scale(zoom, zoom); ctx.imageSmoothingEnabled = true; ctx.drawImage(mc, -px / CT, -pz / CT, MW, MH); ctx.setTransform(KIT.S, 0, 0, KIT.S, 0, 0);
  if (typeof gpsDraw === 'function') gpsDraw(ctx, function (wx, wz) { var dx = (wx - px) / CT * zoom, dz = (wz - pz) / CT * zoom, c = Math.cos(rot + Math.PI), s = Math.sin(rot + Math.PI); return [x + dx * c - dz * s, y + dx * s + dz * c]; }, 2.5);
  // blips
  blipList().forEach(function (b) { var dx = (b.x - px) / CT * zoom, dz = (b.z - pz) / CT * zoom, c = Math.cos(rot + Math.PI), s = Math.sin(rot + Math.PI), rx = dx * c - dz * s, rz = dx * s + dz * c, d = Math.hypot(rx, rz); if (d > r - 4) { rx *= (r - 4) / d; rz *= (r - 4) / d; }
    if (b.who && portraitBlip(ctx, b.who, x + rx, y + rz, 6, b.c)) return;
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
  var rr = up ? 34 : 30, rx = 8 + rr + 5, ry = Hd - rr - 12; if (!G.interior) drawRadar(rx, ry, rr); else ry = Hd + 4; // update 158: no radar indoors (it showed the open sea)
  // update 158 (his ask: neaten the UI; the clock hid under the touch buttons): the clock, the day and where you are sit together over the radar
  var hh = Math.floor(G.time), mm = Math.floor((G.time - hh) * 60), clock = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm, dn = G.interior ? (G.interior.id && SHOPS[G.interior.id] ? SHOPS[G.interior.id].name.toUpperCase() : 'INSIDE') : districtName(P.x, P.z).toUpperCase(), sd = SEASONS[season()].toUpperCase() + ' · DAY ' + (G.day + 1), by0 = ry - rr - 30, gw = Math.max(tw2(dn, 6), tw2(clock, 10) + 6 + tw2(sd, 5)) + 14;
  var gg = ctx.createLinearGradient(rx - rr - 4, 0, rx - rr - 4 + gw + 20, 0); gg.addColorStop(0, 'rgba(7,4,5,0.7)'); gg.addColorStop(1, 'rgba(7,4,5,0)'); ctx.fillStyle = gg; ctx.fillRect(rx - rr - 6, by0 - 3, gw + 20, 25); ctx.fillStyle = '#c4121c'; ctx.fillRect(rx - rr - 6, by0 - 3, 2, 25);
  tx(clock, rx - rr, by0, { col: '#f1e7d0', size: 10 }); tx(sd, rx - rr + tw2(clock, 10) + 6, by0 + 3, { col: '#a6968f', size: 5 }); tx(dn, rx - rr, by0 + 12, { col: '#ffe36a', size: 6 });
  drawStatus(ctx);
  // drunk/high/pilled and the boost, the radio
  var st = []; if (G.drunk > 0.1) st.push('DRUNK'); if (G.high > 0.1 && !(G.stim > 0)) st.push('HIGH'); if (G.pilled > 0.1) st.push('PILLED'); if (st.length) tx(st.join(' · '), 10, 76, { col: '#c48aff', size: 7 });
  if (G.radioName && G.radioT > 0) { G.radioT -= 1 / 60; var rn = G.radioName; ctx.globalAlpha = Math.min(1, G.radioT); tx(rn, Wd / 2 - tw2(rn, 10) / 2, 26, { col: '#ffe36a', size: 10 }); if (G.radioSong) tx(G.radioSong, Wd / 2 - tw2(G.radioSong, 6) / 2, 36, { col: '#f1e7d0', size: 6 }); ctx.globalAlpha = 1; }
  if (G.radioLine && P.state === 'car' && !G.radioLine.spoken) { var rl = G.radioLine.who + ': ' + G.radioLine.s, L3 = KIT.wrap(rl, Wd * 0.62, 6, 'body'); L3.slice(0, 3).forEach(function (l, i) { tx(l, Wd / 2 - tw2(l, 6) / 2, 44 + i * 7, { col: '#ffe36a', size: 6 }); }); }
  // mission text and timers
  if (G.objective) { var ob = G.objective, lines = KIT.wrap ? KIT.wrap(ob, Wd * 0.7, 7, 'body') : [ob]; lines.forEach(function (l, i) { tx(l, Wd / 2 - tw2(l, 7) / 2, Hd * (up ? 0.12 : 0.16) + i * 9, { col: '#f1e7d0', size: 7, sh: 1 }); }); }
  if (G.timer !== undefined && G.timer !== null) { var tt = Math.max(0, G.timer), ts = Math.floor(tt / 60) + ':' + ('0' + Math.floor(tt % 60)).slice(-2); tx(ts, Wd / 2 - tw2(ts, 12) / 2, Hd * 0.1 - 6, { col: tt < 10 ? '#ff2630' : '#ffe36a', size: 12 }); }
  if (G.counter) tx(G.counter, Wd - 8 - tw2(G.counter, 7), 84, { col: '#ffe36a', size: 7 });
  // subtitles
  if (G.sub && G.sub.t > 0) { G.sub.t -= 1 / 60; var who = G.sub.who ? G.sub.who + ': ' : '', txt = who + G.sub.s, wl2 = KIT.wrap ? KIT.wrap(txt, Wd * 0.84, 10, 'body') : [txt]; ctx.fillStyle = 'rgba(7,4,5,0.8)'; ctx.fillRect(Wd * 0.06, Hd - 24 - wl2.length * 13, Wd * 0.88, wl2.length * 13 + 9); wl2.forEach(function (l, i) { subLine(l, i === 0 ? who : '', Wd / 2 - tw2(l, 10) / 2, Hd - 17 - (wl2.length - 1 - i) * 13, 10); }); }
  // toasts
  if (G.toasts && G.toasts.length) { var T = G.toasts[0]; T.t -= 1 / 60; if (T.t <= 0) G.toasts.shift(); ctx.fillStyle = 'rgba(7,4,5,0.8)'; var tw = tw2(T.s, 7) + 14; ctx.fillRect(8, 86, tw, 15); ctx.fillStyle = '#c4121c'; ctx.fillRect(8, 86, 2, 15); tx(T.s, 15, 90, { col: '#f1e7d0', size: 7 }); }
  // the big words
  if (G.big && G.big.t > 0) { G.big.t -= 1 / 60; var bs = G.big.sz || 26, bw = tw2(G.big.s, bs, 'title'); tx(G.big.s, Wd / 2 - bw / 2, Hd * 0.38, { col: G.big.col || '#c4121c', size: bs, font: 'title', sh: 1 }); if (G.big.sub) tx(G.big.sub, Wd / 2 - tw2(G.big.sub, 8) / 2, Hd * 0.38 + bs + 4, { col: '#f1e7d0', size: 8 }); }
  // the prompt for whatever is near
  var u = P.state === 'foot' ? nearestUse() : null, pr = u ? (u.label || 'USE') : null; if (!pr && P.state === 'foot' && !G.cut) { var nv = null; VEH.forEach(function (v) { if (!v.dead && Math.abs(P.y - v.y) < 2.5 && dist2(P.x, P.z, v.x, v.z) < Math.pow(v.t.len * 0.6 + 2, 2)) nv = v; }); if (nv) pr = (nv.driver ? 'STEAL ' : 'GET IN ') + nv.t.n.toUpperCase(); }
  if (P.state === 'car') pr = G.carUse ? G.carUse.label : null;
  if (G.seat) pr = (G.seat.lit || (typeof holding === 'function' && holding(G.seat)) ? (holding(G.seat) ? 'PUFF PUFF   ' : 'PASSED ROUND   ') : (typeof sameSeat === 'function' && sameSeat(G.seat) && sameSeat(G.seat).lit) ? 'WAIT FOR IT   ' : (TOUCHUI() ? 'X' : KIT.gamepad ? 'B' : 'C') + '  LIGHT A JOINT (' + (SV.joints || 0) + ')   ') + (TOUCHUI() ? 'Y' : KEYY()) + '  STAND UP';
  if (G.fish) pr = G.fish.st === 'bite' ? '!!  PRESS A NOW  !!' : 'WAITING FOR A BITE...   ' + (TOUCHUI() ? 'Y' : KEYY()) + '  STOP';
  if (pr && (G.seat || G.fish)) { var lw0 = tw2(pr, 7) + 14, py1 = Hd * (up ? 0.52 : 0.7); ctx.fillStyle = 'rgba(7,4,5,0.8)'; ctx.fillRect(Wd / 2 - lw0 / 2, py1, lw0, 14); ctx.strokeStyle = G.fish && G.fish.st === 'bite' ? '#ffe36a' : '#c4121c'; ctx.strokeRect(Wd / 2 - lw0 / 2 + 0.5, py1 + 0.5, lw0 - 1, 13); tx(pr, Wd / 2 - lw0 / 2 + 7, py1 + 4, { col: '#ffe36a', size: 7 }); pr = null; }
  if (pr) { var lab = (TOUCHUI() ? 'Y' : KEYY()) + '  ' + pr, lw = tw2(lab, 7) + 14; ctx.fillStyle = 'rgba(7,4,5,0.8)'; ctx.fillRect(Wd / 2 - lw / 2, Hd * (up ? 0.52 : 0.7), lw, 14); ctx.strokeStyle = '#c4121c'; ctx.strokeRect(Wd / 2 - lw / 2 + 0.5, Hd * (up ? 0.52 : 0.7) + 0.5, lw - 1, 13); tx(lab, Wd / 2 - lw / 2 + 7, Hd * (up ? 0.52 : 0.7) + 4, { col: '#ffe36a', size: 7 }); }
  // speech over heads
  PEDS.forEach(function (p) { if (!p.said || p.sayT <= 0 || p.dead) return; var s = R3.project(p.x, p.y + 2.3, p.z); if (!s || dist2(p.x, p.z, P.x, P.z) > 30 * 30) return; drawBubble(p.said, s.x, s.y); });
  // aiming: the target ring
  if (P.aim && P.target) { var ts2 = R3.project(P.target.x, P.target.y + 1.2, P.target.z); if (ts2) { ctx.strokeStyle = '#ff2630'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ts2.x, ts2.y, 7, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#ff2630'; ctx.fillRect(ts2.x - 0.5, ts2.y - 0.5, 1, 1); } }
  else if (P.aim) { ctx.fillStyle = '#f1e7d0'; ctx.fillRect(Wd / 2 - 0.5, Hd / 2 - 4, 1, 3); ctx.fillRect(Wd / 2 - 0.5, Hd / 2 + 1, 1, 3); ctx.fillRect(Wd / 2 - 4, Hd / 2 - 0.5, 3, 1); ctx.fillRect(Wd / 2 + 1, Hd / 2 - 0.5, 3, 1); }
  // speed in a vehicle
  if (P.state === 'car' && P.veh) { var v = P.veh, mph = '' + Math.round(Math.abs(v.sp) * 2.237), vn = v.t.n.toUpperCase(), sx0 = rx + rr + 10, py0 = Hd - 40, pw = Math.max(70, tw2(vn, 6) + 14), hpk = clamp(v.hp / (v.t.hp || 100), 0, 1);
    var pg = ctx.createLinearGradient(sx0 - 4, 0, sx0 + pw + 24, 0); pg.addColorStop(0, 'rgba(7,4,5,0.72)'); pg.addColorStop(1, 'rgba(7,4,5,0)'); ctx.fillStyle = pg; ctx.fillRect(sx0 - 4, py0, pw + 28, 32); ctx.fillStyle = '#c4121c'; ctx.fillRect(sx0 - 4, py0, 2, 32);
    tx(vn, sx0 + 2, py0 + 3, { col: '#a6968f', size: 6 }); tx(mph, sx0 + 2, py0 + 12, { col: '#f1e7d0', size: 14, font: 'title' }); tx('MPH', sx0 + 6 + tw2(mph, 14, 'title'), py0 + 19, { col: '#a6968f', size: 5 });
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx0 + 2, py0 + 28, pw - 6, 2); ctx.fillStyle = hpk < 0.35 ? (Math.floor(G.t * 4) % 2 ? '#ff2630' : '#8a0c14') : hpk < 0.6 ? '#ffb030' : '#7aff6a'; ctx.fillRect(sx0 + 2, py0 + 28, (pw - 6) * hpk, 2);
    if (v.t.cls === 'heli' || v.t.cls === 'plane') { var alt = 'ALT ' + Math.round(v.y - groundY(v.x, v.z)) + ' M'; tx(alt, sx0 + 2, py0 - 9, { col: '#4adfff', size: 6 }); } }
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
function mapBtns() { var Hd = KIT.H, s = 38, x = 10, y0 = 12; // update 157: the buttons live on the LEFT (the app's pause button sat over the old close button, so the map could not be shut)
  return [{ id: 'close', t: '✕ CLOSE', x: x, y: y0, w: 84, h: s }, { id: 'in', t: '+', x: x, y: y0 + s + 10, w: s, h: s }, { id: 'out', t: '−', x: x + s + 8, y: y0 + s + 10, w: s, h: s }, { id: 'me', t: '◎', x: x, y: y0 + (s + 10) * 2, w: s, h: s }, { id: 'clear', t: 'CLEAR', x: x, y: Hd - 34 - 10, w: 70, h: 30 }]; }
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
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.translate(Wd / 2, Hd / 2); ctx.scale(sc, sc); ctx.drawImage(mc, -M0.x / CT, -M0.z / CT, MW, MH); ctx.restore();
  function W2S(x, z) { return [Wd / 2 + (x - M0.x) / CT * sc, Hd / 2 + (z - M0.z) / CT * sc]; }
  DIST.forEach(function (d) { if (!d.cx) return; var p = W2S(d.cx, d.cz); tx(d.name.toUpperCase(), p[0] - tw2(d.name.toUpperCase(), 6) / 2, p[1], { col: 'rgba(241,231,208,0.75)', size: 6 }); });
  if (typeof gpsDraw === 'function') gpsDraw(ctx, W2S, 3);
  if (M0.zoom > 0.9) POIS.forEach(function (q) { var ic = MAPICON[q.k]; if (!ic) return; var p = W2S(q.x, q.z); if (p[0] < -10 || p[1] < -10 || p[0] > Wd + 10 || p[1] > Hd + 10) return; ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 6.283); ctx.fill(); ctx.strokeStyle = ic[1]; ctx.lineWidth = 1; ctx.stroke(); tx(ic[0], p[0] - tw2(ic[0], 6) / 2, p[1] - 3, { col: ic[1], size: 6 }); if (M0.zoom > 2.2 && q.name) tx(q.name, p[0] + 7, p[1] - 3, { col: 'rgba(241,231,208,0.8)', size: 5 }); });
  blipList().forEach(function (b) { var p = W2S(b.x, b.z); if (b.who && portraitBlip(ctx, b.who, p[0], p[1], 9, b.c)) { if (M0.zoom > 1.2 && CAST[b.who]) tx(CAST[b.who].name, p[0] + 11, p[1] - 3, { col: '#f1e7d0', size: 6 }); return; } ctx.fillStyle = '#12040a'; ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6); ctx.fillStyle = b.c; ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4); if (b.icon && M0.zoom > 1.2) tx(b.icon, p[0] + 4, p[1] - 4, { col: b.c, size: 6 }); });
  var pp = W2S(P.x, P.z); ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(pp[0], pp[1], 3, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#ff2630'; ctx.beginPath(); ctx.moveTo(Wd / 2 - 6, Hd / 2); ctx.lineTo(Wd / 2 + 6, Hd / 2); ctx.moveTo(Wd / 2, Hd / 2 - 6); ctx.lineTo(Wd / 2, Hd / 2 + 6); ctx.stroke();
  tx('CUM CITY', 104, 12, { col: '#c4121c', size: 16, font: 'title' }); tx(districtName(M0.x, M0.z), 104, 32, { col: '#f1e7d0', size: 8 });
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
function drawStatus(ctx) { // update 157 (his ask: a sleeker look): no boxed plate; a round weapon badge, the money in big type, thin bars, stars beside
  var x = 10, y = 9, R = 17, cx = x + R, cy = y + R, g = ctx.createLinearGradient(x, 0, x + 190, 0); g.addColorStop(0, 'rgba(7,4,5,0.66)'); g.addColorStop(1, 'rgba(7,4,5,0)'); ctx.fillStyle = g; ctx.fillRect(x - 6, y - 5, 196, R * 2 + 22);
  ctx.fillStyle = '#0b0607'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#c4121c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, 6.283); ctx.stroke();
  wIcon(ctx, P.wpn, cx - R * 0.6, cy - R * 0.6, R * 1.2); var W0 = WPN[P.wpn]; if (W0.ammo) { var am = '' + ammoOf(P.wpn); ctx.fillStyle = '#c4121c'; var aw = tw2(am, 6) + 6; ctx.fillRect(cx - aw / 2, cy + R - 5, aw, 9); tx(am, cx - tw2(am, 6) / 2, cy + R - 4, { col: '#fff6dc', size: 6 }); }
  var mx = x + R * 2 + 8, mon = '$' + Math.floor(SV.money).toLocaleString('en-GB'), ms = G.moneyPop > 0 ? 15 : 14; G.moneyPop = Math.max(0, (G.moneyPop || 0) - 1 / 60 * 2);
  tx(mon, mx + 1, y + 1, { col: 'rgba(0,0,0,0.6)', size: ms, font: 'title' }); tx(mon, mx, y, { col: '#f1e7d0', size: ms, font: 'title' });
  var by = y + 21, bw = 110, flash = P.hp < 25 && Math.floor(G.t * 4) % 2;
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(mx, by, bw, 3); ctx.fillStyle = flash ? '#ff2630' : '#e0202a'; ctx.fillRect(mx, by, bw * clamp(P.hp / SV.maxHp, 0, 1), 3); if (P.hp > SV.maxHp) { ctx.fillStyle = '#ffe36a'; ctx.fillRect(mx, by, bw * clamp((P.hp - SV.maxHp) / 50, 0, 1), 3); } /* update 166: health over the top shows gold */
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(mx, by + 6, bw, 2); ctx.fillStyle = '#f1e7d0'; ctx.fillRect(mx, by + 6, bw * clamp((P.armour || 0) / 100, 0, 1), 2);
  for (var s = 0; s < 5; s++) { var on = s < SV.wanted, sx = mx + 4 + s * 12; ctx.globalAlpha = on ? (G.lostT > 6 && Math.floor(G.t * 3) % 2 ? 0.45 : 1) : 0.22; star(ctx, sx + 2, by + 18, 4.6, on ? '#ffe36a' : '#6a5a5c'); ctx.globalAlpha = 1; }
  if (G.stim > 0) { var st = 'HIGH ' + Math.ceil(G.stim); tx(st, mx + 70, by + 14, { col: '#ff2630', size: 6 }); }
}
function star(ctx, cx, cy, r, col) { ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#12040a'; ctx.lineWidth = 2; ctx.strokeStyle = '#12040a'; ctx.stroke(); ctx.fillStyle = col; ctx.fill(); }

/* update 158 (his ask: an icon for every character so you know who has missions for you): their portrait (the app's
   profile portraits, www/assets/portraits.png) in a ring on the radar, the map and over their marker */
var PORTIMG = new Image(); PORTIMG.src = '../assets/portraits.png';
var PORTIX = { cumhead: 0, spermaid: 1, greebo: 2, amy: 3, tb: 4, saba: 5, joff: 6, kaya: 7, elden: 8, beeb: 9, beebs: 9, ali: 10, potbelly: 11, t: 12, bonjo: 13, pulsar: 14, harold: 15, jessiah: 16, natty: 17, judge: 18, fate: 19, bates: 20, steve: 21, sirj: 22, blum: 23, blumhead: 23, kingblum: 24, lab: 38 };
function portraitBlip(ctx, who, x, y, r, col) { var i = PORTIX[who]; if (i === undefined || !PORTIMG.complete || !PORTIMG.naturalWidth) return false;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, 6.283); ctx.fillStyle = col || '#ff2630'; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.clip(); ctx.fillStyle = '#12040a'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(PORTIMG, (i % 8) * 64 + 6, Math.floor(i / 8) * 64 + 2, 52, 52, x - r, y - r, r * 2, r * 2); ctx.restore(); return true; }
var _drawHud158 = drawHud; drawHud = function () { _drawHud158(); if (G.mode !== 'play' || !P || G.interior) return; var ctx = KIT.ctx; // faces over the mission markers nearby
  (G.uses || []).forEach(function (u) { if (u.blip !== 'mission' || !u.m) return; var d = dist2(u.x, u.z, P.x, P.z); if (d > 70 * 70 || d < 9) return; var s = R3.project(u.x, groundY(u.x, u.z) + 3.4, u.z); if (!s) return; var r = clamp(14 - Math.sqrt(d) * 0.12, 7, 13); portraitBlip(ctx, u.m.who, s.x, s.y + Math.sin(G.t * 2) * 2, r, '#ffe36a'); }); };
