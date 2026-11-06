/* =====================================================================================================
   GIMMICKS (his ask: both paths felt like the same thing over and over; a big update with 100 new obstacles, traps,
   mechanics and decorations, no two parts of a level alike and nothing repeating).
   Every gimmick is a set piece SEC[name] that lays its own ground, and a thing 'gim' (standing) or 'gimh' (hanging in
   the air) that it steps and draws. Every zone dresses them its own way (GLOOK): Clubhouse Row black and red, the sewers
   slime and cream, Ejaculand bulbs and stripes, the Bone Pit bone and ghost fire, the factory rust and fire, Spunk Brain
   flesh and steel. 5d: the framework and the traps. 5e: things you ride and use. 5f: new ground shapes. 5g: landmarks.
   5h: the director that makes sure nothing repeats in an act (street, three lanes and the deep).
   GIM[name] = { h: rows it needs above the floor, lay(b), init(e), step(e, dt, p), draw(g, e, x, y, L), over(...), ride(p, s, dt) }
   ===================================================================================================== */
var GIM = {};
var GLOOK = {
  city: { k: 'city', main: '#c4121c', hot: '#ff2630', lite: '#f1d8a8', glow: '#ff2630', metal: '#3a2a2e', mlite: '#6a4a50', dark: '#1a0a0e', wood: '#4a1a1c', fire: ['#ff2630', '#ff6a5a', '#f1d8a8'], goo: '#8a0a14', stone: '#2e1a1e', slite: '#5a3036' },
  sewer: { k: 'sewer', main: '#4a6a4a', hot: '#c8ff9a', lite: '#f1e0b0', glow: '#f1e0b0', metal: '#3a4a3a', mlite: '#6a7a6a', dark: '#0e1a12', wood: '#3a3a28', fire: ['#c8ff9a', '#f1e0b0', '#fffbe8'], goo: '#e8d4a0', stone: '#2c3a2e', slite: '#4a5a4a' },
  park: { k: 'park', main: '#c4121c', hot: '#ffe36a', lite: '#fff6c0', glow: '#ffe36a', metal: '#4a2a3a', mlite: '#7a4a5a', dark: '#1e060c', wood: '#6a3a28', fire: ['#ff2630', '#ffe36a', '#fff6c0'], goo: '#ff6ad0', stone: '#3a1a24', slite: '#6a3444' },
  bone: { k: 'bone', main: '#d8ccb0', hot: '#d8b0ff', lite: '#fff8e8', glow: '#e8dcc0', metal: '#5a4a3a', mlite: '#8a7a64', dark: '#1a120c', wood: '#4a3a2a', fire: ['#a070ff', '#d8b0ff', '#fff8e8'], goo: '#6a5a8a', stone: '#3a2e24', slite: '#5a4a3a' },
  factory: { k: 'factory', main: '#a04a10', hot: '#ff8a2a', lite: '#ffd080', glow: '#ff6a10', metal: '#5a3a30', mlite: '#8a5a48', dark: '#1a0a06', wood: '#4a2a1a', fire: ['#ff6a10', '#ffb040', '#ffe0a0'], goo: '#c42a08', stone: '#3a2420', slite: '#5a3a30' },
  brain: { k: 'brain', main: '#8a0a10', hot: '#ff2630', lite: '#ffb0b0', glow: '#ff2630', metal: '#4a3a50', mlite: '#7a6a80', dark: '#140e18', wood: '#2e2434', fire: ['#ff2630', '#ff8a8a', '#ffe0e0'], goo: '#d86a8a', stone: '#2e2434', slite: '#4a3a50' }
};
function GL() { return GLOOK[LV && LV.zone ? LV.zone.id : 'city'] || GLOOK.city; }
var OUT = '#12040a';
function bx(x, y, w, h, c, lt) { R(OUT, x - 1, y - 1, w + 2, h + 2); R(c, x, y, w, h); if (lt) R(lt, x, y, w, 1); }
function postD(x, y, h, L, w) { w = w || 4; bx(x - w / 2, y - h, w, h, L.metal, L.mlite); }
function motif(g, x, y, L) { // a little emblem of the zone on caps, hubs and faces
  x = Math.round(x); y = Math.round(y); var k = L.k;
  if (k === 'city') { R(OUT, x - 4, y - 3, 9, 8); R(L.hot, x - 3, y - 2, 3, 3); R(L.hot, x + 1, y - 2, 3, 3); R(L.hot, x - 2, y + 1, 5, 2); R(L.hot, x - 1, y + 3, 3, 1); }
  else if (k === 'sewer') { bx(x - 3, y - 3, 6, 6, L.metal, L.mlite); R(L.hot, x - 1, y - 1, 2, 2); }
  else if (k === 'park') { R(OUT, x - 3, y - 3, 7, 7); R(Math.floor(G.t * 4 + x) % 2 ? L.hot : L.main, x - 2, y - 2, 5, 5); R('#ffffff', x - 1, y - 1, 1, 1); }
  else if (k === 'bone') { R(OUT, x - 4, y - 4, 9, 9); R(L.main, x - 3, y - 3, 7, 6); R(OUT, x - 2, y - 1, 2, 2); R(OUT, x + 1, y - 1, 2, 2); R(L.main, x - 2, y + 3, 5, 1); }
  else if (k === 'factory') { R(OUT, x - 4, y - 3, 9, 7); R(L.mlite, x - 3, y - 2, 7, 5); R(L.dark, x - 1, y - 1, 3, 3); }
  else { R(OUT, x - 4, y - 3, 9, 7); R('#e8d8d8', x - 3, y - 2, 7, 5); R(L.hot, x - 1, y - 2, 3, 5); R(OUT, x, y - 1, 1, 3); }
}
function flame(x, y, r, L, k) { var f = Math.floor(G.t * 14 + (k || 0)) % 3; R(OUT, x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2); R(L.fire[0], x - r, y - r, r * 2, r * 2); R(L.fire[1], x - r + 1 + f % 2, y - r + 1, r * 2 - 3, r * 2 - 3); R(L.fire[2], x - 1, y - 1 - f, 2, 2); }
function spikeBall(g, x, y, r, L) { for (var i = 0; i < 8; i++) { var a = i / 8 * 6.283 + G.t * 0.5; R(OUT, x + Math.cos(a) * (r + 2) - 2, y + Math.sin(a) * (r + 2) - 2, 4, 4); R(L.lite, x + Math.cos(a) * (r + 2) - 1, y + Math.sin(a) * (r + 2) - 1, 2, 2); }
  g.fillStyle = OUT; g.beginPath(); g.arc(x, y, r + 1, 0, 6.3); g.fill(); g.fillStyle = L.metal; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); R(L.mlite, x - r * 0.5, y - r * 0.5, 3, 2); }
/* the player's hurt box (a little inside the sprite, his rule) against a box or a circle */
function pRect(x0, y0, x1, y1) { var p = PL; return !!p && p.state === 'normal' && p.x + PHW - 1 > x0 && p.x - PHW + 1 < x1 && p.y - 2 > y0 && p.y - PH + 6 < y1; }
function pCirc(x, y, r) { var p = PL; if (!p || p.state !== 'normal') return false; var qx = Math.max(p.x - PHW + 1, Math.min(x, p.x + PHW - 1)), qy = Math.max(p.y - PH + 6, Math.min(y, p.y - 2)); return Math.hypot(qx - x, qy - y) < r; }
function onFloor(p, e, x0, x1) { return !!p && p.state === 'normal' && !p.air && p.x >= x0 && p.x <= x1 && Math.abs(p.y - e.y) < 6; }
function bits(x, y, n, c, sp, g) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = (sp || 120) * (0.4 + Math.random() * 0.6); FX.push({ k: 'bit', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, t: 0.4 + Math.random() * 0.3, c: c[i % c.length], g: g === undefined ? 300 : g }); } }
function gimDef(name, d) { GIM[name] = d; if (d.lay) SEC[name] = function (b) { var a = [].slice.call(arguments, 1); b.ground(3); d.lay.apply(null, [b].concat(a)); b.ground(2); return b; }; }
function GT(b, dx, g, o, up, k) { o = o || {}; o.g = g; return b.thing(dx, k || 'gim', up || 0, o); }
function gimNear(e, pad) { var x0 = e.x - 90, x1 = e.x + (e.w || 4) * TS + 90; pad = pad || 0.5; return x1 > CAM.x - KIT.W * pad && x0 < CAM.x + KIT.W * (1 + pad); }
function safePit(b, n) { // a pit you can not die in: a spiked floor five rows down and a spring out every nine columns
  var c0 = b.col; for (var i = 0; i < n; i++) { var c = b.col; b.h += 5; b.ground(1); b.h -= 5; b.set(c, b.h + 4, '^'); }
  for (var sc = c0 + 4; sc < b.col - 2; sc += 9) { b.set(sc, b.h + 4, '.'); b.ent('spring', sc, b.h + 5, { pow: 1 }); } return c0; }
function fallIn(list, e, dt, gr, onLand) { // simple falling pieces shared by the rain traps
  list.forEach(function (q) { if (q.warn > 0) { q.warn -= dt; return; } q.vy += gr * dt; q.y += q.vy * dt; if (q.y >= q.gy) { q.dead = 1; onLand(q); } }); return list.filter(function (q) { return !q.dead; }); }
function ceilAbove(x, y, rows) { var c = Math.floor(x / TS), r0 = Math.floor(y / TS) - 1; for (var r = r0; r > r0 - rows; r--) if (isSolid(T(c, r), c, r)) return (r + 1) * TS; return null; }

/* ====================================== THE TRAPS ====================================== */
gimDef('flamebar', { h: 6, // a bar of fireballs turning round a hub on a post: run under it or jump it
  lay: function (b) { b.ground(12); GT(b, -6, 'flamebar', { sp: (b.col % 2 ? 1 : -1) * 1.7 }); },
  step: function (e) { e.a = G.t * e.sp; for (var i = 1; i <= 5; i++) { var x = e.x + Math.cos(e.a) * i * 9, y = e.y - 46 + Math.sin(e.a) * i * 9; if (pCirc(x, y, 6)) { hurt(x); return; } } },
  draw: function (g, e, x, y, L) { postD(x, y, 46, L, 6); motif(g, x, y - 46, L); var a = e.a || 0; for (var i = 1; i <= 5; i++) flame(x + Math.cos(a) * i * 9, y - 46 + Math.sin(a) * i * 9, 4, L, i); } });

gimDef('popspikes', { h: 1, // a wave of spikes ripples along the floor: time your run through the troughs
  lay: function (b) { b.ground(14); GT(b, -13, 'popspikes', { w: 12 }); },
  step: function (e, dt, p) { e.hs = e.hs || []; for (var i = 0; i < e.w; i++) e.hs[i] = Math.max(0, Math.min(1, (Math.sin(G.t * 2.6 - i * 0.55) - 0.15) * 1.8)) * 14;
    var ci = Math.floor((p.x - (e.x - 8)) / TS); if (ci >= 0 && ci < e.w && e.hs[ci] > 5 && p.y > e.y - e.hs[ci] - 1 && Math.abs(p.y - e.y) < 20) hurt(p.x); },
  draw: function (g, e, x, y, L) { for (var i = 0; i < e.w; i++) { var sx = x - 8 + i * TS, hh = Math.round((e.hs || [])[i] || 0); R(OUT, sx + 1, y - 3, 14, 3); R(L.metal, sx + 2, y - 2, 12, 1);
      if (hh > 0) for (var s = 0; s < 3; s++) { g.fillStyle = OUT; g.beginPath(); g.moveTo(sx + 2 + s * 4, y - 2); g.lineTo(sx + 4 + s * 4, y - 3 - hh); g.lineTo(sx + 6 + s * 4, y - 2); g.fill(); g.fillStyle = L.lite; g.beginPath(); g.moveTo(sx + 3 + s * 4, y - 2); g.lineTo(sx + 4 + s * 4, y - 2 - hh); g.lineTo(sx + 5 + s * 4, y - 2); g.fill(); R(L.hot, sx + 4 + s * 4, y - 3 - hh, 1, 1); } } } });

var DEBRIS = { city: 'brick', sewer: 'chunk', park: 'bulb', bone: 'bone', factory: 'bolt', brain: 'shard' };
function drawPiece(g, kind, x, y, L) { x = Math.round(x); y = Math.round(y);
  if (kind === 'brick') { bx(x - 7, y - 5, 14, 8, L.main, L.hot); R(L.dark, x - 7, y - 1, 14, 1); }
  else if (kind === 'chunk') { bx(x - 6, y - 6, 12, 10, L.stone, L.slite); R(L.hot, x - 3, y + 3, 2, 4); }
  else if (kind === 'bulb') { R(OUT, x - 5, y - 6, 10, 11); R(L.hot, x - 4, y - 5, 8, 8); R('#ffffff', x - 2, y - 4, 2, 2); R(L.metal, x - 2, y - 9, 4, 4); }
  else if (kind === 'bone') { R(OUT, x - 2, y - 9, 5, 18); R(L.main, x - 1, y - 8, 3, 16); R(OUT, x - 4, y + 6, 9, 4); R(L.main, x - 3, y + 7, 7, 2); }
  else if (kind === 'bolt') { R(OUT, x - 5, y - 8, 10, 6); R(L.mlite, x - 4, y - 7, 8, 4); R(OUT, x - 2, y - 2, 5, 10); R(L.metal, x - 1, y - 2, 3, 9); }
  else { g.fillStyle = OUT; g.beginPath(); g.moveTo(x - 5, y - 8); g.lineTo(x + 5, y - 8); g.lineTo(x, y + 8); g.fill(); g.fillStyle = L.lite; g.beginPath(); g.moveTo(x - 3, y - 7); g.lineTo(x + 3, y - 7); g.lineTo(x, y + 5); g.fill(); } }
gimDef('debris', { h: 0, // bits of the roof come down where you are about to be: watch the shadows
  lay: function (b) { b.ground(16); b.drops(-12, 6, 2, null, 1.6); GT(b, -15, 'debris', { w: 14 }); },
  step: function (e, dt, p) { e.list = e.list || []; e.cd = (e.cd || 0) - dt; var x0 = e.x, x1 = e.x + e.w * TS;
    if (e.cd <= 0 && p.x > x0 - 120 && p.x < x1 && Math.abs(p.y - e.y) < 120) { e.cd = 0.5; var tx = Math.max(x0, Math.min(x1, p.x + p.gsp * 0.55 + (Math.random() - 0.5) * 70)), top = ceilAbove(tx, e.y, 14);
      e.list.push({ x: tx, y: top === null ? CAM.y - 20 : top + 6, vy: 0, warn: 0.6, gy: e.y, r: Math.random() * 6 }); }
    e.list = fallIn(e.list, e, dt, 1500, function (q) { bits(q.x, e.y - 4, 6, [GL().main, GL().lite, '#3a2a2a']); sfx.play('crumble', 0.4); });
    e.list.forEach(function (q) { if (q.warn <= 0 && pCirc(q.x, q.y, 8)) { hurt(q.x); q.dead = 1; } }); },
  draw: function (g, e, x, y, L, cx, cy) { (e.list || []).forEach(function (q) { var sx = q.x - cx, w = q.warn > 0 ? 4 + (0.6 - q.warn) * 14 : 12; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(Math.round(sx - w / 2), y - 2, Math.round(w), 2);
      if (q.warn > 0) { if (Math.floor(G.t * 16) % 2) R(L.hot, sx - 1, y - 3, 2, 1); bits(q.x, q.y, Math.random() < 0.2 ? 1 : 0, ['#5a4a4a']); } else drawPiece(g, DEBRIS[L.k], sx, q.y - cy, L); }); } });

gimDef('lasers', { h: 3, // beams that switch between the floor (jump) and head height (stay down)
  lay: function (b) { b.ground(12); GT(b, -11, 'lasers', { w: 10 }); },
  step: function (e) { var c = (G.t + e.c * 0.1) % 3.2; e.low = c < 0.9; e.high = c >= 1.6 && c < 2.5; e.warn = (c > 1.25 && c < 1.6) ? 'h' : c > 2.85 ? 'l' : ''; var x1 = e.x + e.w * TS;
    if (e.low && pRect(e.x, e.y - 12, x1, e.y - 8)) hurt(PL.x); if (e.high && pRect(e.x, e.y - 52, x1, e.y - 48)) hurt(PL.x); },
  draw: function (g, e, x, y, L) { var x1 = x + e.w * TS; [x, x1].forEach(function (px) { bx(px - 4, y - 62, 8, 62, L.metal, L.mlite); motif(g, px, y - 66, L); R(L.dark, px - 2, y - 12, 4, 4); R(L.dark, px - 2, y - 52, 4, 4); });
    [[e.low, 'l', y - 10], [e.high, 'h', y - 50]].forEach(function (q) { if (q[0]) { R(L.hot, x + 4, q[2] - 1, x1 - x - 8, 3); R('#ffffff', x + 4, q[2], x1 - x - 8, 1); for (var s = x + 8; s < x1 - 6; s += 13) if ((Math.floor(G.t * 30) + s) % 3 === 0) R(L.lite, s, q[2] - 2, 2, 5); }
      else if (e.warn === q[1] && Math.floor(G.t * 20) % 2) for (var d = x + 6; d < x1 - 6; d += 8) R(L.hot, d, q[2], 3, 1); }); } });

gimDef('searchlight', { h: 6, // a lamp on a tower sweeps the floor; if it finds you, shells come down on that spot
  lay: function (b) { b.ground(17); b.drops(-14, 5, 2, null, 2); GT(b, -2, 'searchlight', { w: 2 }); },
  step: function (e, dt, p) { e.a = 1.85 + Math.sin(G.t * 0.9 + e.c) * 0.5; e.cd = (e.cd || 0) - dt; e.shells = e.shells || [];
    var lx = e.x, ly = e.y - 84, ang = Math.atan2(p.y - 20 - ly, p.x - lx), d = Math.abs(((ang - e.a + 9.42) % 6.283) - 3.14);
    if (e.cd <= 0 && d < 0.1 && p.x < lx && lx - p.x < 340 && p.state === 'normal') { e.cd = 2.6; e.alarm = 0.7; e.mk = p.x + p.gsp * 0.3; sfx.play('horn', 0.4); }
    if (e.alarm > 0) { e.alarm -= dt; if (e.alarm <= 0) [-22, 0, 22].forEach(function (o, i) { e.shells.push({ x: e.mk + o, y: CAM.y - 10 - i * 30, vy: 200, warn: 0, gy: e.y }); }); }
    e.shells = fallIn(e.shells, e, dt, 900, function (q) { bits(q.x, e.y - 6, 10, [GL().fire[0], GL().fire[1], '#3a2a2a'], 160); sfx.play('thud', 0.5); if (pCirc(q.x, e.y - 10, 22)) hurt(q.x); }); },
  draw: function (g, e, x, y, L, cx, cy) { R(OUT, x - 9, y - 84, 18, 84); for (var t = 0; t < 84; t += 12) { R(L.metal, x - 8, y - 84 + t, 2, 12); R(L.metal, x + 6, y - 84 + t, 2, 12); R(L.mlite, x - 8, y - 84 + t, 16, 2); }
    var a = e.a || 2, lx = x, ly = y - 84, far = 340; g.fillStyle = e.alarm > 0 ? 'rgba(255,38,48,0.22)' : 'rgba(255,246,200,0.16)'; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + Math.cos(a - 0.1) * far, ly + Math.sin(a - 0.1) * far); g.lineTo(lx + Math.cos(a + 0.1) * far, ly + Math.sin(a + 0.1) * far); g.fill();
    bx(x - 8, y - 94, 16, 10, L.metal, L.mlite); R(e.alarm > 0 && Math.floor(G.t * 12) % 2 ? L.hot : L.lite, x - 6, y - 90, 12, 4); motif(g, x, y - 100, L);
    if (e.alarm > 0) { var mx = e.mk - cx; R(L.hot, mx - 8, y - 2, 16, 2); if (Math.floor(G.t * 10) % 2) text('!', mx, y - 30, { size: 8, align: 'center', col: L.hot }); }
    (e.shells || []).forEach(function (q) { var sx = q.x - cx, sy = q.y - cy; g.fillStyle = OUT; g.beginPath(); g.arc(sx, sy, 6, 0, 6.3); g.fill(); g.fillStyle = L.metal; g.beginPath(); g.arc(sx, sy, 5, 0, 6.3); g.fill(); R(L.fire[1], sx - 1, sy - 9, 2, 3); R('rgba(0,0,0,0.5)', sx - 5, y - 2, 10, 2); }); } });

gimDef('mines', { h: 0, // mines in the floor: step on one and you have a breath to get off it
  lay: function (b) { b.ground(17); b.drops(-14, 6, 3, 'arc', 2); GT(b, -15, 'mines', { w: 14 }); },
  init: function (e) { e.m = [0, 1, 2, 3].map(function (i) { return { x: e.x + 24 + i * 52, st: 0, t: 0 }; }); },
  step: function (e, dt, p) { e.m.forEach(function (m) {
      if (m.st === 0) { if (!p.air && p.state === 'normal' && Math.abs(p.x - m.x) < 9 && Math.abs(p.y - e.y) < 5) { m.st = 1; m.t = 0.32; sfx.play('clink'); } }
      else if (m.st === 1) { m.t -= dt; if (m.t <= 0) { m.st = 2; m.t = 4; bits(m.x, e.y - 8, 14, GL().fire.concat(['#3a2a2a']), 200); sfx.play('thud'); G.shake = Math.max(G.shake, 3); if (pCirc(m.x, e.y - 8, 26)) hurt(m.x); } }
      else { m.t -= dt; if (m.t <= 0) m.st = 0; } }); },
  draw: function (g, e, x, y, L, cx) { (e.m || []).forEach(function (m) { if (m.st === 2) { R(OUT, m.x - cx - 6, y - 2, 12, 2); return; } var mx = Math.round(m.x - cx);
      R(OUT, mx - 7, y - 6, 14, 6); R(L.metal, mx - 6, y - 5, 12, 5); R(L.mlite, mx - 6, y - 5, 12, 1); R(OUT, mx - 3, y - 8, 6, 2);
      var on = m.st === 1 ? Math.floor(G.t * 24) % 2 : Math.floor(G.t * 2 + m.x) % 2; R(on ? L.hot : L.dark, mx - 1, y - 9, 2, 2); }); } });

gimDef('bomber', { h: 2, // a mortar lobs bombs to where you are going
  lay: function (b) { b.ground(19); b.drops(-15, 5, 2, null, 2); GT(b, -2, 'bomber', { w: 2 }); },
  step: function (e, dt, p) { e.bombs = e.bombs || []; e.cd = (e.cd === undefined ? 1 : e.cd) - dt;
    if (e.cd <= 0 && p.x < e.x - 30 && e.x - p.x < 330 && Math.abs(p.y - e.y) < 120) { e.cd = 2.0; var T1 = 1.05, tx = p.x + p.gsp * 0.6; e.bombs.push({ x: e.x - 6, y: e.y - 22, vx: (tx - e.x) / T1, vy: (22 - 0.5 * 900 * T1 * T1) / T1, fuse: -1 }); e.kick = 0.2; sfx.play('thud', 0.5); }
    if (e.kick > 0) e.kick -= dt;
    e.bombs.forEach(function (q) { if (q.fuse < 0) { q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; var f = floorAt(q.x, q.y - 6, q.y + 6, true); if (q.vy > 0 && f !== null) { q.y = f; q.fuse = 0.5; } if (q.y > e.y + 200) q.dead = 1; }
      else { q.fuse -= dt; if (q.fuse <= 0) { q.dead = 1; bits(q.x, q.y - 6, 14, GL().fire.concat(['#3a2a2a']), 200); sfx.play('thud'); if (pCirc(q.x, q.y - 8, 26)) hurt(q.x); } } });
    e.bombs = e.bombs.filter(function (q) { return !q.dead; }); },
  draw: function (g, e, x, y, L, cx, cy) { bx(x - 10, y - 10, 20, 10, L.stone, L.slite); g.save(); g.translate(x, y - 10); g.rotate(-0.6 - (e.kick > 0 ? 0.15 : 0)); bx(-16, -6, 18, 12, L.metal, L.mlite); R(OUT, -18, -4, 3, 8); g.restore(); motif(g, x + 4, y - 5, L);
    (e.bombs || []).forEach(function (q) { var sx = q.x - cx, sy = q.y - cy - 6; g.fillStyle = OUT; g.beginPath(); g.arc(sx, sy, 6, 0, 6.3); g.fill(); g.fillStyle = q.fuse >= 0 && Math.floor(G.t * 20) % 2 ? L.hot : L.metal; g.beginPath(); g.arc(sx, sy, 5, 0, 6.3); g.fill(); R(L.fire[1], sx + 2, sy - 8, 2, 3); }); } });

gimDef('cannons', { h: 4, // a squat tower fires balls at your feet (jump) and over your head (stay down), then you climb it
  lay: function (b) { b.ground(16); for (var x = 0; x < 3; x++) for (var y = 1; y <= 3; y++) b.set(b.col + x, b.h - y, '#'); GT(b, 0, 'cannons', { w: 3 }, 0, 'gimh'); b.ground(3); b.drops(-2, 2, 5); },
  step: function (e, dt, p) { e.balls = e.balls || []; e.cd = (e.cd === undefined ? 1 : e.cd) - dt; e.warn = e.cd < 0.4;
    if (e.cd <= 0 && p.x < e.x && e.x - p.x < 300 && Math.abs(p.y - e.y) < 90) { e.cd = 1.3; e.hi = !e.hi; e.balls.push({ x: e.x - 12, y: e.y - (e.hi ? 44 : 10), sx: e.x }); sfx.play('thud', 0.5); bits(e.x - 12, e.y - (e.hi ? 44 : 10), 5, ['#5a4a4a', '#8a7a7a'], 80, 0); }
    e.balls.forEach(function (q) { q.x -= 240 * dt; if (q.x < q.sx - 280) q.dead = 1; if (pCirc(q.x, q.y, 7)) { hurt(q.x); q.dead = 1; } }); e.balls = e.balls.filter(function (q) { return !q.dead; }); },
  draw: function (g, e, x, y, L, cx) { [10, 44].forEach(function (hh, i) { bx(x - 20, y - hh - 6, 14, 12, L.metal, L.mlite); R(OUT, x - 22, y - hh - 4, 3, 8); if (e.warn && (i === 1) === !e.hi) R(L.hot, x - 21, y - hh - 2, 2, 4); }); motif(g, x + 8, y - 30, L);
    (e.balls || []).forEach(function (q) { var sx = q.x - cx; g.fillStyle = OUT; g.beginPath(); g.arc(sx, q.y - (e.y - y), 7, 0, 6.3); g.fill(); g.fillStyle = L.metal; g.beginPath(); g.arc(sx, q.y - (e.y - y), 6, 0, 6.3); g.fill(); R(L.mlite, sx - 3, q.y - (e.y - y) - 3, 2, 2); }); } });

gimDef('spikesled', { h: 2, // a spiked block slides up and down the track
  lay: function (b) { b.ground(14); GT(b, -13, 'spikesled', { w: 12 }); },
  step: function (e) { var u = Math.sin(G.t * 1.3 + e.c) * 0.5 + 0.5; e.sx = e.x + 16 + u * (e.w * TS - 48); if (pRect(e.sx - 13, e.y - 24, e.sx + 13, e.y)) hurt(e.sx); },
  draw: function (g, e, x, y, L, cx) { R(OUT, x, y - 3, e.w * TS, 3); R(L.mlite, x, y - 3, e.w * TS, 1); var sx = Math.round((e.sx || e.x) - cx);
    bx(sx - 11, y - 22, 22, 19, L.metal, L.mlite); motif(g, sx, y - 13, L); for (var s = 0; s < 4; s++) { R(OUT, sx - 15, y - 21 + s * 5, 4, 3); R(L.lite, sx - 14, y - 20 + s * 5, 3, 1); R(OUT, sx + 11, y - 21 + s * 5, 4, 3); R(L.lite, sx + 11, y - 20 + s * 5, 3, 1); }
    for (var t = 0; t < 4; t++) { R(OUT, sx - 9 + t * 5, y - 26, 3, 4); R(L.lite, sx - 8 + t * 5, y - 25, 1, 3); } } });

gimDef('gear', { h: 2, // a giant gear turns half sunk in the floor: its teeth bite
  lay: function (b) { b.ground(12); GT(b, -6, 'gear', {}); },
  step: function (e) { e.a = G.t * 1.3; if (pCirc(e.x, e.y + 8, 36)) hurt(e.x); },
  draw: function (g, e, x, y, L) { g.save(); g.beginPath(); g.rect(x - 60, y - 60, 120, 60); g.clip(); var a = e.a || 0, cy2 = y + 8;
    for (var i = 0; i < 12; i++) { var t = a + i / 12 * 6.283; g.save(); g.translate(x + Math.cos(t) * 32, cy2 + Math.sin(t) * 32); g.rotate(t); R(OUT, -1, -5, 10, 10); R(L.metal, 0, -4, 8, 8); R(L.mlite, 0, -4, 8, 1); g.restore(); }
    g.fillStyle = OUT; g.beginPath(); g.arc(x, cy2, 33, 0, 6.3); g.fill(); g.fillStyle = L.metal; g.beginPath(); g.arc(x, cy2, 31, 0, 6.3); g.fill(); g.fillStyle = L.dark; g.beginPath(); g.arc(x, cy2, 20, 0, 6.3); g.fill();
    for (var s = 0; s < 4; s++) { var t2 = a + s * 1.571; R(L.mlite, x + Math.cos(t2) * 12 - 2, cy2 + Math.sin(t2) * 12 - 2, 4, 4); } motif(g, x, cy2 - 2, L); g.restore(); R(OUT, x - 40, y - 1, 80, 2); } });

gimDef('dripline', { h: 4, // a leaking pipe overhead: each nozzle swells, then drops something that burns
  lay: function (b) { b.ground(14); GT(b, -13, 'dripline', { w: 12 }); },
  init: function (e) { e.d = []; for (var i = 0; i < 4; i++) e.d.push({ x: e.x + 24 + i * 46, ph: i * 0.37, y: null }); },
  step: function (e, dt) { e.d.forEach(function (q) { var c = (G.t * 0.7 + q.ph) % 1; if (q.y === null && c > 0.85 && !q.f) { q.y = e.y - 60; q.vy = 0; q.f = 1; } if (c < 0.5) q.f = 0;
      if (q.y !== null) { q.vy += 900 * dt; q.y += q.vy * dt; if (pCirc(q.x, q.y, 5)) { hurt(q.x); q.y = null; } else if (q.y >= e.y - 2) { bits(q.x, e.y - 3, 5, [GL().goo, GL().fire[0]], 90); q.y = null; } } q.sw = c; }); },
  draw: function (g, e, x, y, L, cx, cy) { var x1 = x + e.w * TS; postD(x + 4, y, 66, L); postD(x1 - 4, y, 66, L); bx(x, y - 68, x1 - x, 8, L.metal, L.mlite); for (var s = x + 6; s < x1; s += 24) R(OUT, s, y - 68, 2, 8);
    (e.d || []).forEach(function (q) { var qx = Math.round(q.x - cx); R(OUT, qx - 3, y - 61, 6, 4); var sw = Math.max(0, (q.sw - 0.5) * 2); if (q.y === null) { R(L.goo, qx - 1, y - 57, 2, Math.round(1 + sw * 3)); } else { R(OUT, qx - 3, q.y - cy - 4, 6, 8); R(L.goo, qx - 2, q.y - cy - 3, 4, 6); }
      R(L.goo, qx - 5, y - 2, 10, 2); }); } });

gimDef('tesla', { h: 4, // a coil charges while you are near, marks where you stand and strikes there: keep moving
  lay: function (b) { b.ground(15); b.drops(-12, 6, 2, null, 1.6); GT(b, -7, 'tesla', {}); },
  step: function (e, dt, p) { var near = Math.abs(p.x - e.x) < 130 && Math.abs(p.y - e.y) < 90; e.ch = Math.max(0, Math.min(1.1, (e.ch || 0) + (near ? dt : -dt)));
    if (e.ch >= 1 && !e.mk) { e.mk = { x: p.x, t: 0.55 }; sfx.play('clink'); }
    if (e.mk) { e.mk.t -= dt; if (e.mk.t <= 0) { e.bolt = { x: e.mk.x, t: 0.16 }; if (Math.abs(p.x - e.mk.x) < 16 && p.y > e.y - 44 && p.state === 'normal') hurt(e.mk.x); bits(e.mk.x, e.y - 3, 8, [GL().hot, '#ffffff'], 140); sfx.play('thud', 0.5); e.mk = null; e.ch = 0; } }
    if (e.bolt) { e.bolt.t -= dt; if (e.bolt.t <= 0) e.bolt = null; } },
  draw: function (g, e, x, y, L, cx) { bx(x - 6, y - 12, 12, 12, L.stone, L.slite); for (var r = 0; r < 5; r++) bx(x - 8 + (r % 2), y - 20 - r * 8, 16 - (r % 2) * 2, 5, r % 2 ? L.metal : L.mlite); var ch = e.ch || 0;
    g.fillStyle = OUT; g.beginPath(); g.arc(x, y - 62, 8, 0, 6.3); g.fill(); g.fillStyle = ch > 0.6 && Math.floor(G.t * 20) % 2 ? '#ffffff' : L.hot; g.beginPath(); g.arc(x, y - 62, 6 + ch * 2, 0, 6.3); g.fill();
    if (ch > 0.2) for (var k = 0; k < 3; k++) { var a = G.t * 9 + k * 2.1; R(L.hot, x + Math.cos(a) * (10 + ch * 6), y - 62 + Math.sin(a) * (10 + ch * 6), 2, 2); }
    if (e.mk) { var mx = e.mk.x - cx; R(L.hot, mx - 10, y - 2, 20, 2); if (Math.floor(G.t * 16) % 2) { R(L.hot, mx - 1, y - 12, 2, 8); R(L.hot, mx - 5, y - 9, 10, 2); } }
    if (e.bolt) { var bx2 = e.bolt.x - cx; g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 62); for (var q = 1; q <= 6; q++) g.lineTo(x + (bx2 - x) * q / 6 + (q < 6 ? (Math.random() - 0.5) * 14 : 0), y - 62 + 60 * q / 6); g.stroke(); g.strokeStyle = L.hot; g.lineWidth = 1; g.stroke(); } } });

gimDef('beartrap', { h: 0, // jaws in the floor: step in one and they hold you a moment
  lay: function (b) { b.ground(16); b.drops(-13, 5, 3, 'arc', 2.5); GT(b, -14, 'beartrap', { w: 12 }); },
  init: function (e) { e.j = [0, 1, 2].map(function (i) { return { x: e.x + 30 + i * 62, shut: 0 }; }); },
  step: function (e, dt, p) { e.j.forEach(function (q) { if (q.shut > 0) { q.shut -= dt; return; }
      if (!p.air && p.state === 'normal' && Math.abs(p.x - q.x) < 8 && Math.abs(p.y - e.y) < 5) { q.shut = 2.4; p.lock = 0.7; p.gsp = 0; p.vx = 0; p.x = q.x; sfx.play('clink'); sfx.play('thud', 0.5); G.shake = Math.max(G.shake, 2); bits(q.x, e.y - 4, 6, [GL().metal, GL().mlite], 90); } }); },
  draw: function (g, e, x, y, L, cx) { (e.j || []).forEach(function (q) { var qx = Math.round(q.x - cx); R(OUT, qx - 10, y - 3, 20, 3); R(L.metal, qx - 9, y - 2, 18, 1); R(OUT, qx - 1, y - 4, 3, 3);
      if (q.shut > 0) { for (var t = 0; t < 5; t++) { R(OUT, qx - 6 + t * 3, y - 10, 2, 8); R(L.lite, qx - 6 + t * 3, y - 9, 1, 5); } R(L.mlite, qx - 7, y - 12, 14, 2); }
      else for (var s = -1; s <= 1; s += 2) { R(OUT, qx + s * 5 - 4, y - 4, 9, 2); for (var t2 = 0; t2 < 3; t2++) R(L.lite, qx + s * 5 - 3 + t2 * 3, y - 6, 1, 2); } }); } });

gimDef('pistons', { h: 3, // pistons in the wall behind punch out across the path
  lay: function (b) { b.ground(16); GT(b, -15, 'pistons', { w: 14 }); },
  init: function (e) { e.p = [0, 1, 2].map(function (i) { return { x: e.x + 56 + i * 70, ph: i * 0.6, ext: 0 }; }); },
  step: function (e) { e.p.forEach(function (q) { var c = (G.t + q.ph) % 1.8; q.ext = c < 1.0 ? 0 : c < 1.15 ? (c - 1.0) / 0.15 : c < 1.5 ? 1 : 1 - (c - 1.5) / 0.3; q.warn = c > 0.75 && c < 1.0;
      var hx = q.x - q.ext * 40; if (q.ext > 0.3 && pRect(hx - 6, e.y - 26, q.x, e.y - 8)) hurt(q.x + 20); }); },
  draw: function (g, e, x, y, L, cx) { (e.p || []).forEach(function (q) { var qx = Math.round(q.x - cx), hx = Math.round(qx - q.ext * 40); bx(qx, y - 52, 14, 52, L.stone, L.slite); R(OUT, qx + 2, y - 44, 10, 2); motif(g, qx + 7, y - 42, L);
      R(OUT, hx, y - 19, qx - hx, 6); R(L.mlite, hx, y - 18, qx - hx, 2); bx(hx - 6, y - 25, 8, 18, L.metal, q.warn && Math.floor(G.t * 16) % 2 ? L.hot : L.mlite); }); } });

gimDef('orbiters', { h: 5, // two maces swing round a long oval
  lay: function (b) { b.ground(13); b.drops(-10, 5, 2, null, 1.5); GT(b, -6, 'orbiters', {}); },
  step: function (e) { e.a = G.t * 1.6; for (var k = 0; k < 2; k++) { var a = e.a + k * Math.PI, mx = e.x + Math.cos(a) * 58, my = e.y - 36 + Math.sin(a) * 26; if (pCirc(mx, my, 9)) { hurt(mx); return; } } },
  draw: function (g, e, x, y, L) { postD(x, y, 36, L, 6); motif(g, x, y - 38, L); for (var i = 0; i < 24; i++) { var t = i / 24 * 6.283; if (i % 2) R(L.mlite, x + Math.cos(t) * 58, y - 36 + Math.sin(t) * 26, 1, 1); }
    var a = e.a || 0; for (var k = 0; k < 2; k++) { var t2 = a + k * Math.PI, mx = x + Math.cos(t2) * 58, my = y - 36 + Math.sin(t2) * 26; for (var c = 1; c < 6; c++) R(L.mlite, x + (mx - x) * c / 6 - 1, y - 36 + (my - y + 36) * c / 6 - 1, 2, 2); spikeBall(g, mx, my, 7, L); } } });

var CHASER = { city: 'iron', sewer: 'cream', park: 'bowl', bone: 'skull', factory: 'slag', brain: 'eye' };
gimDef('chase', { h: 4, // something huge comes rolling from behind: run!
  lay: function (b) { b.ground(2); b.thing(0, 'dash', 0, { dir: 1 }); b.ground(46); b.drops(-40, 14, 2, null, 2.6); GT(b, -46, 'chase', { w: 44 }); },
  step: function (e, dt, p) { var x1 = e.x + e.w * TS;
    if (!e.go && p.x > e.x + 30 && p.x < e.x + 120) { e.go = 1; e.bx = Math.min(p.x - 150, CAM.x - 40); e.by = e.y; e.rot = 0; G.banner = 1; G.bannerTxt = 'RUN!'; sfx.play('rumble'); }
    if (e.go === 1) { e.bx += 380 * dt; e.rot += 380 * dt / 30; var f = floorAt(e.bx, e.by - 30, e.by + 30, false); if (f !== null) e.by = f; G.shake = Math.max(G.shake, 1.5);
      if (pCirc(e.bx, e.by - 30, 27)) hurt(e.bx + 40); if (e.bx > x1 - 20) { e.go = 2; bits(e.bx, e.by - 30, 24, [GL().main, GL().lite, GL().metal], 260); sfx.play('crumble'); sfx.play('thud'); G.shake = 6; } }
    if (e.go === 2 && (p.x < e.x - 300 || p.x > x1 + 500)) e.go = 0; },
  draw: function (g, e, x, y, L, cx, cy) { var x1 = x + e.w * TS; bx(x1 - 10, y - 40, 12, 40, L.stone, L.slite); bx(x1 + 2, y - 26, 10, 26, L.stone, L.slite);
    if (e.go !== 1) return; var X = e.bx - cx, Y = e.by - cy - 30, k = CHASER[L.k]; g.save(); g.translate(X, Y); g.rotate(e.rot);
    g.fillStyle = OUT; g.beginPath(); g.arc(0, 0, 30, 0, 6.3); g.fill(); g.fillStyle = k === 'cream' ? '#e8d4a0' : k === 'skull' ? L.main : k === 'slag' ? L.fire[0] : k === 'eye' ? '#f0e0e0' : k === 'bowl' ? L.main : L.metal; g.beginPath(); g.arc(0, 0, 28, 0, 6.3); g.fill();
    if (k === 'iron') for (var s = 0; s < 8; s++) { var a = s / 8 * 6.283; R(OUT, Math.cos(a) * 30 - 3, Math.sin(a) * 30 - 3, 6, 6); R(L.mlite, Math.cos(a) * 30 - 2, Math.sin(a) * 30 - 2, 3, 3); }
    else if (k === 'skull') { R(OUT, -14, -8, 10, 10); R(OUT, 4, -8, 10, 10); R(OUT, -2, 4, 4, 6); for (var t = -10; t < 12; t += 4) R(OUT, t, 14, 2, 6); }
    else if (k === 'eye') { g.fillStyle = L.main; g.beginPath(); g.arc(8, 0, 12, 0, 6.3); g.fill(); g.fillStyle = OUT; g.beginPath(); g.arc(10, 0, 6, 0, 6.3); g.fill(); R('#ff8a8a', -20, -10, 12, 2); R('#ff8a8a', -18, 8, 10, 2); }
    else if (k === 'bowl') { R(OUT, -6, -14, 6, 6); R(OUT, 4, -12, 6, 6); R(OUT, -2, -2, 6, 6); R(L.hot, -28, -2, 56, 4); }
    else if (k === 'slag') { R(L.fire[1], -14, -10, 10, 6); R(L.fire[2], 4, 6, 8, 4); R(OUT, -4, 10, 14, 3); }
    else { R('#fffbe8', -16, -16, 12, 6); R('#c8b480', 4, 8, 14, 4); }
    g.restore(); if (Math.random() < 0.6) FX.push({ k: 'bit', x: e.bx - 24, y: e.by - 2, vx: -60 - Math.random() * 80, vy: -60 - Math.random() * 60, t: 0.4, c: L.metal }); } });

gimDef('hammers', { h: 3, // great mallets swing over and slam the floor
  lay: function (b) { b.ground(16); GT(b, -15, 'hammers', { w: 14 }); },
  init: function (e) { e.hm = [0, 1, 2].map(function (i) { return { x: e.x + 64 + i * 68, ph: i * 0.8, a: -Math.PI / 2 }; }); },
  step: function (e) { e.hm.forEach(function (q) { var c = (G.t + q.ph) % 2.4, u = c < 1.2 ? 0 : c < 1.32 ? (c - 1.2) / 0.12 : c < 1.8 ? 1 : 1 - (c - 1.8) / 0.6; q.u = u; q.warn = c > 0.9 && c < 1.2; q.a = -Math.PI / 2 - u * Math.PI / 2;
      if (u > 0.7) { var hx = q.x + Math.cos(q.a) * 38, hy = e.y - 4 + Math.sin(q.a) * 38; if (pCirc(hx, hy, 12)) hurt(hx); }
      if (c > 1.3 && c < 1.34 && !q.bang) { q.bang = 1; sfx.play('thud', 0.6); G.shake = Math.max(G.shake, 2); bits(q.x - 38, e.y - 2, 6, [GL().stone, GL().slite], 100); } if (c < 1.2) q.bang = 0; }); },
  draw: function (g, e, x, y, L, cx) { (e.hm || []).forEach(function (q) { var qx = Math.round(q.x - cx), sh = q.warn ? Math.round(Math.sin(G.t * 60)) : 0; bx(qx - 6, y - 10, 12, 10, L.stone, L.slite);
      g.save(); g.translate(qx, y - 4); g.rotate(q.a + Math.PI / 2 + sh * 0.03); R(OUT, -2, -40, 5, 40); R(L.wood, -1, -39, 3, 38); bx(-10, -50, 20, 14, L.metal, L.mlite); R(L.hot, -10, -44, 20, 2); g.restore(); motif(g, qx, y - 6, L); }); } });

gimDef('snare', { h: 6, // a rope loop in the dirt: step in it and you are hauled up by the ankle
  lay: function (b) { b.ground(13); b.drops(-6, 3, 6); GT(b, -7, 'snare', {}); },
  step: function (e, dt, p) { e.cd = (e.cd || 0) - dt; if (!p.gl && e.cd <= 0 && !p.air && p.state === 'normal' && Math.abs(p.x - e.x) < 8 && Math.abs(p.y - e.y) < 5) { p.gl = { e: e, t: 0 }; sfx.play('clink'); sfx.play('jump'); } },
  ride: function (p, s, dt) { var e = s.e; s.t += dt; var u = ease(Math.min(1, s.t / 0.25)); p.x = e.x + Math.sin(s.t * 6) * 3 * (s.t > 0.25 ? 1 : 0); p.y = e.y - 4 - u * 44; p.grot = Math.PI * u; p.vx = 0; p.vy = 0; p.gsp = 0; p.air = true;
    if (s.t > 1.0) { p.gl = null; p.grot = 0; p.vy = 0; p.vx = 90; p.y = e.y - 30; e.cd = 2.5; } },
  draw: function (g, e, x, y, L, cx, cy) { var px = x + 26; bx(px - 3, y - 92, 6, 92, L.wood, L.metal); bx(x - 4, y - 94, px - x + 8, 5, L.wood, L.metal); motif(g, px, y - 98, L);
    var held = PL && PL.gl && PL.gl.e === e, ey = held ? PL.y - cy : y - 2, ex = held ? PL.x - cx : x; R(OUT, x - 1, y - 90, 2, Math.max(2, ey - (y - 90))); R(L.lite, x, y - 90, 1, Math.max(1, ey - (y - 90)));
    if (!held) { g.strokeStyle = L.lite; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 2, 9, 2, 0, 0, 6.3); g.stroke(); } } });

var DOMINO = { city: 'slab', sewer: 'slab', park: 'card', bone: 'grave', factory: 'plate', brain: 'cabinet' };
gimDef('dominoes', { h: 3, // a row of great slabs topples towards you one after another
  lay: function (b) { b.ground(17); b.drops(-6, 3, 4); GT(b, -16, 'dominoes', { w: 15 }); },
  init: function (e) { e.s = [0, 1, 2, 3, 4].map(function (i) { return { x: e.x + 60 + i * 34, a: 0, v: 0, go: -1 }; }); },
  step: function (e, dt, p) { var x1 = e.x + e.w * TS; if (!e.go && p.x > e.x - 80 && p.x < x1) { e.go = 1; e.s.forEach(function (q, i) { q.go = (4 - i) * 0.32; }); sfx.play('rumble', 0.5); }
    e.s.forEach(function (q) { if (q.go < 0) return; if (q.go > 0) { q.go = Math.max(0, q.go - dt); if (q.go > 0) return; } if (q.a > -1.57) { q.v += 7 * dt; q.a = Math.max(-1.57, q.a - q.v * dt * 3); if (q.a <= -1.57) { sfx.play('thud', 0.5); bits(q.x - 30, e.y - 2, 5, [GL().stone, GL().slite], 80); } }
      if (q.a > -1.5) for (var k = 1; k <= 3; k++) { var px = q.x + Math.sin(q.a) * 15 * k, py = e.y - Math.cos(q.a) * 15 * k; if (pCirc(px, py, 6)) { hurt(px); break; } } });
    if (e.go && (p.x < e.x - 400 || p.x > x1 + 500)) { e.go = 0; e.s.forEach(function (q) { q.a = 0; q.v = 0; q.go = -1; }); } },
  draw: function (g, e, x, y, L, cx) { var k = DOMINO[L.k]; (e.s || []).forEach(function (q) { g.save(); g.translate(q.x - cx, y); g.rotate(q.a);
      if (k === 'card') { bx(-6, -46, 12, 46, '#fff6e8', '#ffffff'); R(L.main, -3, -40, 6, 6); R(L.main, -3, -12, 6, 6); }
      else if (k === 'grave') { bx(-7, -42, 14, 42, L.stone, L.slite); R(L.main, -6, -46, 12, 4); R(L.slite, -1, -36, 2, 10); R(L.slite, -4, -32, 8, 2); }
      else if (k === 'cabinet') { bx(-7, -46, 14, 46, L.metal, L.mlite); for (var i = 0; i < 4; i++) R(Math.floor(G.t * 3 + i) % 2 ? L.hot : L.dark, -4 + (i % 2) * 6, -40 + i * 6, 2, 2); }
      else if (k === 'plate') { bx(-6, -46, 12, 46, L.metal, L.mlite); R(L.hot, -6, -24, 12, 3); }
      else { bx(-6, -46, 12, 46, '#1a0a0e', L.slite); R(L.hot, -2, -40, 4, 4); R(L.hot, -2, -14, 4, 4); R(L.slite, -6, -24, 12, 1); }
      g.restore(); }); } });

var HEAD = { city: 'gargoyle', sewer: 'pipe', park: 'clown', bone: 'dragon', factory: 'furnace', brain: 'bust' };
gimDef('firebreath', { h: 3, // stone heads breathe fire across the path in turn
  lay: function (b) { b.ground(18); GT(b, -16, 'firebreath', { w: 16 }); },
  init: function (e) { e.hd = [0, 1].map(function (i) { return { x: e.x + 110 + i * 120, ph: i * 1.2 }; }); },
  step: function (e) { e.hd.forEach(function (q) { var c = (G.t + q.ph) % 2.4; q.on = c > 1.5; q.warn = c > 1.1 && c <= 1.5; if (q.on && pRect(q.x - 84, e.y - 26, q.x - 8, e.y - 10)) hurt(q.x - 40); }); },
  draw: function (g, e, x, y, L, cx) { var k = HEAD[L.k]; (e.hd || []).forEach(function (q) { var qx = Math.round(q.x - cx); bx(qx - 8, y - 12, 18, 12, L.stone, L.slite); var hy = y - 30;
      if (k === 'clown') { bx(qx - 9, hy - 2, 18, 18, '#fff6e8', '#ffffff'); R(L.main, qx - 13, hy + 2, 4, 6); R(L.main, qx + 9, hy + 2, 4, 6); R(L.main, qx - 11, hy + 7, 4, 4); R(OUT, qx - 4, hy + 3, 2, 2); }
      else if (k === 'dragon') { bx(qx - 10, hy - 2, 20, 16, L.main, L.lite); R(OUT, qx - 6, hy + 2, 4, 4); R(L.main, qx + 4, hy - 8, 3, 6); R(L.main, qx + 8, hy - 6, 3, 4); for (var t = 0; t < 4; t++) R(OUT, qx - 10 + t * 3, hy + 11, 1, 3); }
      else if (k === 'furnace') { bx(qx - 9, hy - 4, 18, 18, L.metal, L.mlite); R(q.on ? L.fire[1] : L.dark, qx - 9, hy + 4, 6, 6); R(OUT, qx - 4, hy - 8, 6, 4); }
      else if (k === 'bust') { bx(qx - 9, hy - 2, 18, 18, L.goo, L.lite); R(L.hot, qx - 5, hy + 3, 3, 3); R(L.hot, qx + 2, hy + 3, 3, 3); R(L.main, qx - 9, hy - 4, 18, 3); }
      else if (k === 'pipe') { bx(qx - 8, hy, 18, 14, L.metal, L.mlite); R(OUT, qx - 11, hy + 3, 4, 8); R(L.mlite, qx - 11, hy + 3, 4, 2); }
      else { bx(qx - 9, hy - 2, 18, 18, L.stone, L.slite); R(L.hot, qx - 4, hy + 2, 3, 3); R(L.stone, qx + 4, hy - 8, 4, 6); R(L.stone, qx - 9, hy - 6, 4, 4); R(OUT, qx - 9, hy + 9, 8, 3); }
      if (q.warn) bits(q.x - 12, e.y - 20, Math.random() < 0.4 ? 1 : 0, ['#5a4a4a', '#8a7a7a'], 40, -40);
      if (q.on) for (var f = 0; f < 7; f++) { var fx = qx - 14 - f * 10, fr = 3 + Math.min(f, 4); flame(fx, y - 18 + Math.sin(G.t * 20 + f) * 2, fr, L, f); } }); } });

gimDef('tentacles', { h: 4, // things in the floor rise, sway and slap down towards you
  lay: function (b) { b.ground(16); b.drops(-13, 5, 4, 'arc', 2.5); GT(b, -15, 'tentacles', { w: 14 }); },
  init: function (e) { e.tn = [0, 1, 2].map(function (i) { return { x: e.x + 50 + i * 64, ph: i * 1.0 }; }); },
  step: function (e) { e.tn.forEach(function (q) { var c = (G.t * 0.9 + q.ph) % 3; q.c = c; q.up = c < 0.6 ? 0 : c < 1.0 ? (c - 0.6) / 0.4 : c < 2.4 ? 1 : 1 - (c - 2.4) / 0.6; q.a = c > 1.6 && c < 2.4 ? -Math.min(1, (c - 1.6) / 0.25) * 1.45 : Math.sin(G.t * 3 + q.ph) * 0.15;
      if (q.up > 0.5) for (var k = 1; k <= 4; k++) { var px = q.x + Math.sin(q.a) * 13 * k * q.up, py = e.y - Math.cos(q.a) * 13 * k * q.up; if (pCirc(px, py, 7 - k * 0.6)) { hurt(px); break; } } }); },
  draw: function (g, e, x, y, L, cx) { (e.tn || []).forEach(function (q) { var qx = Math.round(q.x - cx); R(OUT, qx - 10, y - 2, 20, 2); R(L.goo, qx - 9, y - 2, 18, 1);
      if (q.c < 0.6 && Math.random() < 0.3) bits(q.x + (Math.random() - 0.5) * 14, e.y - 2, 1, [L.goo], 40, 100);
      for (var k = 0; k <= 5; k++) { var px = qx + Math.sin(q.a) * 11 * k * q.up, py = y - Math.cos(q.a) * 11 * k * q.up, r = 7 - k; if (q.up <= 0) break; g.fillStyle = OUT; g.beginPath(); g.arc(px, py, r + 1, 0, 6.3); g.fill(); g.fillStyle = k % 2 ? L.goo : L.main; g.beginPath(); g.arc(px, py, r, 0, 6.3); g.fill(); if (r > 3) R(L.lite, px - 1, py - 1, 2, 2); } }); } });

gimDef('quicksand', { h: 0, // the floor swallows you if you stand still: keep jumping out
  lay: function (b) { b.ground(14); GT(b, -13, 'quicksand', { w: 12 }); b.drops(-10, 6, 4, 'arc', 1.4); },
  step: function (e, dt, p) { var inA = p.x > e.x - 8 && p.x < e.x + e.w * TS - 8 && Math.abs(p.y - e.y) < 4 && !p.air && p.state === 'normal';
    e.sink = Math.max(0, Math.min(1, (e.sink || 0) + (inA ? dt * 0.7 : -dt * 2.5))); if (inA) { var cap = 120 * (1 - e.sink * 0.6); if (Math.abs(p.gsp) > cap) p.gsp = Math.sign(p.gsp) * cap; if (Math.random() < 0.3) bits(p.x, e.y - 2, 1, [GL().stone], 40, 200); }
    if (e.sink >= 1) { hurt(p.x); p.vy = -420; p.air = true; e.sink = 0; } },
  draw: function (g, e, x, y, L) { var w = e.w * TS; R(OUT, x - 8, y - 3, w, 3); for (var i = 0; i < w; i += 6) R((Math.floor(G.t * 3 + i / 6)) % 3 ? L.stone : L.slite, x - 8 + i, y - 3, 5, 2); for (var s = 0; s < 3; s++) { var sx = x + 30 + s * 60; R(L.slite, sx + Math.cos(G.t * 2 + s) * 6, y - 2, 4, 1); } },
  over: function (g, e, x, y, L, cx, cy) { if (!(e.sink > 0)) return; var p = PL, hh = Math.round(e.sink * 24); R(OUT, p.x - cx - 11, y - hh - 1, 22, hh + 1); R(L.stone, p.x - cx - 10, y - hh, 20, hh); R(L.slite, p.x - cx - 10, y - hh, 20, 1); } });

gimDef('cage', { h: 6, // a cage hangs from a gallows and drops on you: be quick under it
  lay: function (b) { b.ground(12); b.drops(-6, 3, 2); GT(b, -6, 'cage', {}); },
  step: function (e, dt, p) { e.st = e.st || 'up'; e.cy = e.cy === undefined ? e.y - 70 : e.cy;
    if (e.st === 'up' && Math.abs(p.x - e.x) < 34 && p.y <= e.y + 4 && p.y > e.y - 70 && p.state === 'normal') { e.st = 'shake'; e.t = 0.28; sfx.play('clink'); }
    else if (e.st === 'shake') { e.t -= dt; if (e.t <= 0) { e.st = 'fall'; e.vy = 0; } }
    else if (e.st === 'fall') { e.vy += 1600 * dt; e.cy += e.vy * dt; if (e.cy >= e.y - 42) { e.cy = e.y - 42; e.st = 'down'; e.t = 0.7; sfx.play('thud'); G.shake = Math.max(G.shake, 3); if (!p.gl && Math.abs(p.x - e.x) < 15 && !p.air && p.state === 'normal') { p.gl = { e: e, t: 0 }; e.t = 1.2; } } }
    else if (e.st === 'down') { e.t -= dt; if (e.t <= 0) e.st = 'lift'; }
    else if (e.st === 'lift') { e.cy -= 60 * dt; if (e.cy <= e.y - 70) { e.cy = e.y - 70; e.st = 'rest'; e.t = 2; } }
    else if (e.st === 'rest') { e.t -= dt; if (e.t <= 0 && Math.abs(p.x - e.x) > 50) e.st = 'up'; } },
  ride: function (p, s, dt) { s.t += dt; p.x = s.e.x + Math.sin(s.t * 30) * (s.t < 0.9 ? 1 : 0); p.gsp = 0; p.vx = 0; p.air = false; p.y = s.e.y; if (s.t > 1.1) p.gl = null; },
  draw: function (g, e, x, y, L, cx, cy) { var cyy = Math.round((e.cy === undefined ? e.y - 70 : e.cy) - cy), sh = e.st === 'shake' ? Math.round(Math.sin(G.t * 60)) : 0; bx(x + 26, y - 108, 6, 108, L.wood, L.metal); bx(x - 4, y - 110, 36, 5, L.wood, L.metal); motif(g, x + 29, y - 114, L);
    R(OUT, x - 1, y - 105, 2, cyy - (y - 105)); R(L.mlite, x, y - 105, 1, cyy - (y - 105));
    R(OUT, x - 15 + sh, cyy, 30, 3); R(OUT, x - 15 + sh, cyy + 40, 30, 3); for (var b2 = -14; b2 <= 14; b2 += 4) { R(OUT, x + b2 - 1 + sh, cyy, 3, 42); R(L.mlite, x + b2 + sh, cyy + 1, 1, 40); } R(L.mlite, x - 15 + sh, cyy, 30, 1); } });

var DRONE = { city: 'cam', sewer: 'fly', park: 'plane', bone: 'batskull', factory: 'rotor', brain: 'eye' };
gimDef('drones', { h: 6, // drones hover overhead and drop things on you; shoot them or stomp them
  lay: function (b) { b.ground(20); GT(b, -18, 'drones', { w: 18 }); b.drops(-16, 8, 2, null, 2); },
  init: function (e) { e.dr = [0, 1].map(function (i) { return { x0: e.x + 80 + i * 120, x: 0, y: e.y - 76, ph: i * 2, cd: 1 + i, dead: 0 }; }); },
  step: function (e, dt, p) { e.dr.forEach(function (q) { if (q.dead > 0) { q.dead -= dt; return; } q.x = q.x0 + Math.sin(G.t * 0.8 + q.ph) * 70; q.y = e.y - 76 + Math.sin(G.t * 2.2 + q.ph) * 6; q.cd -= dt;
      if (q.cd <= 0 && Math.abs(p.x - q.x) < 60 && p.y > q.y) { q.cd = 1.4; SHOTS.push({ x: q.x, y: q.y + 8, vx: 0, vy: 40, g: 500, life: 1.6, k: 'ember' }); sfx.play('shoot', 0.4); }
      SHOTS.forEach(function (s) { if (s.mine && s.life > 0 && Math.abs(s.x - q.x) < 12 && Math.abs(s.y - q.y) < 12) { s.life = 0; q.dead = 5; G.score += 100; bits(q.x, q.y, 12, [GL().metal, GL().hot, GL().mlite], 160); sfx.play('pop'); } });
      if (p.state === 'normal' && p.vy > 0 && Math.abs(p.x - q.x) < 14 && p.y > q.y - 10 && p.y < q.y + 6) { q.dead = 5; p.vy = -420; G.score += 100; bits(q.x, q.y, 12, [GL().metal, GL().hot], 160); sfx.play('pop'); } }); },
  draw: function (g, e, x, y, L, cx, cy) { var k = DRONE[L.k]; (e.dr || []).forEach(function (q) { if (q.dead > 0) return; var qx = Math.round(q.x - cx), qy = Math.round(q.y - cy), fl = Math.floor(G.t * 30) % 2;
      if (k === 'eye') { g.fillStyle = OUT; g.beginPath(); g.arc(qx, qy, 9, 0, 6.3); g.fill(); g.fillStyle = '#f0e0e0'; g.beginPath(); g.arc(qx, qy, 8, 0, 6.3); g.fill(); R(L.hot, qx - 3, qy, 6, 5); R(OUT, qx - 1, qy + 1, 2, 3); R(L.main, qx - 12, qy - 2 + fl * 2, 4, 2); R(L.main, qx + 8, qy - 2 + fl * 2, 4, 2); }
      else if (k === 'batskull') { bx(qx - 6, qy - 5, 12, 10, L.main, L.lite); R(OUT, qx - 4, qy - 2, 3, 3); R(OUT, qx + 1, qy - 2, 3, 3); R(OUT, qx - 16, qy - 4 + fl * 3, 10, 3); R(OUT, qx + 6, qy - 4 + fl * 3, 10, 3); }
      else if (k === 'fly') { bx(qx - 6, qy - 4, 12, 9, L.metal, L.mlite); R(L.hot, qx + 3, qy - 2, 3, 3); R('rgba(241,224,176,0.6)', qx - 8, qy - 9 + fl, 7, 4); R('rgba(241,224,176,0.6)', qx + 1, qy - 9 + fl, 7, 4); }
      else if (k === 'plane') { bx(qx - 9, qy - 3, 18, 6, L.main, L.lite); R(L.hot, qx - 2, qy - 8, 4, 16); R(OUT, qx + 9, qy - 4 + fl * 4, 2, 4); }
      else { bx(qx - 8, qy - 4, 16, 8, L.metal, L.mlite); R(L.hot, qx - 2, qy + 1, 4, 2); R(L.mlite, qx - 14 + fl * 4, qy - 8, 10, 1); R(L.mlite, qx + 4 - fl * 4, qy - 8, 10, 1); R(OUT, qx - 1, qy - 8, 2, 4); }
      R('rgba(0,0,0,0.35)', qx - 6, y - 2, 12, 2); }); } });

gimDef('arrowtrap', { h: 3, // pressure plates: step on one and an arrow flies out of the wall at head height
  lay: function (b) { b.ground(18); GT(b, -17, 'arrowtrap', { w: 16 }); },
  init: function (e) { e.pl = [e.x + 30, e.x + 120]; e.ar = []; e.wx = e.x + 16 * TS - 6; },
  step: function (e, dt, p) { e.pl.forEach(function (px, i) { if (!p.air && p.state === 'normal' && Math.abs(p.x - px) < 10 && Math.abs(p.y - e.y) < 5) { if (!e['d' + i]) { e['d' + i] = 1; e.fire = 0.25; sfx.play('clink'); } } else e['d' + i] = 0; });
    if (e.fire > 0) { e.fire -= dt; if (e.fire <= 0) { e.ar.push({ x: e.wx - 8, y: e.y - 24 }); sfx.play('shoot', 0.5); } }
    e.ar.forEach(function (q) { q.x -= 420 * dt; if (q.x < e.x - 60) q.dead = 1; if (pRect(q.x - 10, q.y - 2, q.x + 10, q.y + 2)) { hurt(q.x); q.dead = 1; } }); e.ar = e.ar.filter(function (q) { return !q.dead; }); },
  draw: function (g, e, x, y, L, cx, cy) { (e.pl || []).forEach(function (px, i) { var qx = Math.round(px - cx); R(OUT, qx - 9, y - 3, 18, 3); R(e['d' + i] ? L.hot : L.mlite, qx - 8, y - (e['d' + i] ? 1 : 2), 16, 1); });
    var wx = Math.round(e.wx - cx); bx(wx - 8, y - 56, 16, 56, L.stone, L.slite); R(OUT, wx - 9, y - 26, 6, 4); motif(g, wx, y - 44, L);
    (e.ar || []).forEach(function (q) { var ax = Math.round(q.x - cx), ay = Math.round(q.y - cy); R(OUT, ax - 10, ay - 1, 20, 3); R(L.wood, ax - 9, ay, 18, 1); R(L.lite, ax - 12, ay - 1, 3, 3); R(L.main, ax + 8, ay - 2, 3, 5); }); } });

gimDef('pogo', { h: 5, // spiked balls bounce in place on springs: run under them when they are up
  lay: function (b) { b.ground(14); GT(b, -13, 'pogo', { w: 12 }); b.drops(-11, 6, 2, null, 1.8); },
  init: function (e) { e.pg = [0, 1, 2].map(function (i) { return { x: e.x + 40 + i * 56, ph: i * 1.1 }; }); },
  step: function (e) { e.pg.forEach(function (q) { q.hh = Math.abs(Math.sin(G.t * 2.2 + q.ph)) * 72; if (pCirc(q.x, e.y - 12 - q.hh, 10)) hurt(q.x); }); },
  draw: function (g, e, x, y, L, cx) { (e.pg || []).forEach(function (q) { var qx = Math.round(q.x - cx), by = y - 12 - (q.hh || 0); g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(qx, y); for (var s = 1; s <= 8; s++) g.lineTo(qx + (s % 2 ? -4 : 4), y + (by - y) * s / 8); g.stroke(); g.strokeStyle = L.mlite; g.lineWidth = 1; g.stroke();
      R(OUT, qx - 6, y - 3, 12, 3); spikeBall(g, qx, by, 8, L); }); } });

/* ---------- the plumbing: stepping, drawing, riding, loading ---------- */
STANDS.gim = 1;
(function () {
  var sW = stepWorld; stepWorld = function (dt) { sW(dt); if (!PL || !LV || (G.mode !== 'play' && G.mode !== 'card')) return;
    for (var i = 0; i < ENTS.length; i++) { var e = ENTS[i]; if ((e.k === 'gim' || e.k === 'gimh') && gimNear(e)) { var d = GIM[e.g]; if (d && d.step) d.step(e, dt, PL); } } };
  var dE = drawEnt; drawEnt = function (g, e, cx, cy, W, H) { if (e.k === 'gim' || e.k === 'gimh') { var d = GIM[e.g]; if (d && d.draw && gimNear(e, 0.15)) { var X = Math.round(e.x - cx), Y = Math.round(e.y - cy); if (d.big) { g.save(); g.translate(X, Y); g.scale(d.big, d.big); g.translate(-X, -Y); } d.draw(g, e, X, Y, GL(), cx, cy); if (d.big) g.restore(); } return; } dE(g, e, cx, cy, W, H); };
  var dW = drawWorld; drawWorld = function () { dW(); if (!LV || !PL) return; var g = KIT.ctx, cx = Math.round(CAM.x), cy = Math.round(CAM.y);
    ENTS.forEach(function (e) { if ((e.k === 'gim' || e.k === 'gimh') && GIM[e.g] && GIM[e.g].over && gimNear(e, 0.15)) GIM[e.g].over(g, e, Math.round(e.x - cx), Math.round(e.y - cy), GL(), cx, cy); }); };
  var sP = stepPlayer; stepPlayer = function (dt) { var p = PL;
    if (p && p.gl) { if (p.state !== 'normal' || G.mode !== 'play') { p.gl = null; p.hide = 0; p.grot = 0; } else { var d = GIM[p.gl.e.g]; d.ride(p, p.gl, dt); p.anim += dt * 8; if (p.state === 'normal' && p.y > LV.h * TS + 30) die(true); return; } }
    sP(dt); if (PL && PL.state === 'normal' && T(Math.floor(PL.x / TS), Math.floor((PL.y - PH + 4) / TS)) === 'v') hurt(PL.x, true); }; // fangs under a rock roof
  var dP = drawPlayer; drawPlayer = function (p, cx, cy) { if (p.hide) return; dP(p, cx, cy); };
  var lA = loadAct; loadAct = function (ai) { lA(ai); ENTS.forEach(function (e) { if ((e.k === 'gim' || e.k === 'gimh') && GIM[e.g] && GIM[e.g].init) GIM[e.g].init(e); }); };
  var bA = beginAct; beginAct = function (ai, fc) { if (PL) { PL.gl = null; PL.hide = 0; PL.grot = 0; } bA(ai, fc); if (PL) { PL.gl = null; PL.hide = 0; PL.grot = 0; } };
})();
