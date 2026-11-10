/* =====================================================================================================
   update 128: he said it all looked basic. Karts and drivers get proper shading (sky above, dark below,
   a glint of gloss where the sun hits), every box has bevelled edges that catch the light, and the karts
   are dressed: racing stripes, headlights, a chrome bumper, a roll hoop, a padded seat, wheel nuts.
   ===================================================================================================== */
var GLOSSH = (function () { var v = [SUN[0], SUN[1] + 0.55, SUN[2]], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();
Frame = (function (orig) { return function () { var fr = orig.apply(this, arguments), L = fr.L;
  fr.lit = function (col, n, k) { var d = n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2], h = Math.max(0, n[0] * GLOSSH[0] + n[1] * GLOSSH[1] + n[2] * GLOSSH[2]), sp = h * h; sp *= sp; sp *= sp; sp *= h * h * 0.2;
    var f = (0.42 + 0.14 * n[1] + 0.78 * Math.max(0, d) + 0.12 * Math.max(0, -d)) * (k || 1) * 0.85; return [(col[0] * f + sp) * L[0], (col[1] * f + sp) * L[1], (col[2] * f + sp) * L[2]]; };
  return fr; }; })(Frame);
var HULLFAR = false; // karts far from the camera skip the bevels and the trimmings
var HFACES = [[4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [3, 2, 1, 0]];
function hull(m, fr, T, pts, col, bev) {
  var c = rgb01(col), uv = [0.02, 0.98, 0.98, 0.98, 0.98, 0.02, 0.02, 0.02], lc = [0, 0, 0], i, minE = 9;
  pts.forEach(function (q) { lc[0] += q[0] / 8; lc[1] += q[1] / 8; lc[2] += q[2] / 8; });
  [[0, 1], [1, 2], [0, 4], [4, 5], [5, 6], [1, 5]].forEach(function (e) { var a = pts[e[0]], b = pts[e[1]], l = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); if (l < minE) minE = l; });
  var b = HULLFAR ? 0 : bev === undefined ? Math.min(0.04, minE * 0.3) : bev, wc = fr.P(lc[0], lc[1], lc[2]);
  if (HULLFAR) { var P0 = pts.map(function (q) { return fr.P(q[0], q[1], q[2]); }); for (i = 0; i < 5; i++) { var f = HFACES[i], a0 = P0[f[0]], b0 = P0[f[1]], c0 = P0[f[2]], n0 = faceN(a0, b0, c0); if (n0[0] * ((a0[0] + c0[0]) / 2 - wc[0]) + n0[1] * ((a0[1] + c0[1]) / 2 - wc[1]) + n0[2] * ((a0[2] + c0[2]) / 2 - wc[2]) < 0) n0 = [-n0[0], -n0[1], -n0[2]]; m.quad(a0, b0, c0, P0[f[3]], uv, T, fr.lit(c, n0)); } return; } // far away: plain boxes
  var F = HFACES.map(function (f) { // each face: its outward normal and its corners pulled in from the edges
    var lp = f.map(function (ix) { return pts[ix]; }), fc = [0, 0, 0]; lp.forEach(function (q) { fc[0] += q[0] / 4; fc[1] += q[1] / 4; fc[2] += q[2] / 4; });
    var w = lp.map(function (q) { var dx = fc[0] - q[0], dy = fc[1] - q[1], dz = fc[2] - q[2], l = Math.hypot(dx, dy, dz) || 1, t = Math.min(0.45, b * 1.3 / l); return fr.P(q[0] + dx * t, q[1] + dy * t, q[2] + dz * t); });
    var o = lp.map(function (q) { return fr.P(q[0], q[1], q[2]); }), n = faceN(o[0], o[1], o[2]), wf = fr.P(fc[0], fc[1], fc[2]);
    if (n[0] * (wf[0] - wc[0]) + n[1] * (wf[1] - wc[1]) + n[2] * (wf[2] - wc[2]) < 0) n = [-n[0], -n[1], -n[2]];
    return { ix: f, w: w, n: n, col: fr.lit(c, n), hi: fr.lit(c, n, 1.14) }; });
  for (i = 0; i < 5; i++) m.quad(F[i].w[0], F[i].w[1], F[i].w[2], F[i].w[3], uv, T, F[i].col);
  if (b < 0.008) return;
  function at(f, ix) { return F[f].w[F[f].ix.indexOf(ix)]; }
  for (var f1 = 0; f1 < 6; f1++) for (var f2 = f1 + 1; f2 < 6; f2++) { var sh = F[f1].ix.filter(function (x) { return F[f2].ix.indexOf(x) >= 0; }); if (sh.length !== 2 || (f2 === 5 && F[f1].n[1] > 0.9)) continue; // the bevel along an edge two faces share
    m.quad(at(f1, sh[0]), at(f1, sh[1]), at(f2, sh[1]), at(f2, sh[0]), uv, T, [F[f1].hi, F[f1].hi, F[f2].hi, F[f2].hi]); }
  for (var v = 0; v < 8; v++) { var fs = []; for (var k = 0; k < 6; k++) if (F[k].ix.indexOf(v) >= 0) fs.push(k); if (fs.length === 3) m.tri(at(fs[0], v), at(fs[1], v), at(fs[2], v), [0.5, 0.5, 0.1, 0.1, 0.9, 0.1], T, F[fs[0]].hi); }
}
kart3D = (function (orig) { return function (m, A, k, fr) {
  var me = typeof RACE !== 'undefined' && RACE && RACE.me, far = !!(me && k !== me && k.x !== undefined && Math.hypot(k.x - me.x, k.z - me.z) > 26);
  HULLFAR = far; try { orig(m, A, k, fr); } finally { HULLFAR = false; } if (far) return;
  var W = A.tile('white'), cu = k.cust || {}, base = k.c.kart, col = [cu.c0 || base[0], cu.c1 || base[1], cu.c2 || base[2]], body = cu.body || 'classic', chrome = '#d8d0d8', lamp = '#fff6d8', wh = cu.wheel || 'std';
  if (body === 'classic') {
    hull(m, fr, W, [[0.62, -0.09, 0.49], [1.37, -0.07, 0.27], [1.37, 0.07, 0.27], [0.62, 0.09, 0.49], [0.62, -0.09, 0.512], [1.37, -0.07, 0.292], [1.37, 0.07, 0.292], [0.62, 0.09, 0.512]], col[1], 0); // the stripe down the nose
    hull(m, fr, W, bx(-0.4, 0.2, -0.09, 0.09, 0.552, 0.572), col[1], 0);
    [-1, 1].forEach(function (sd) { ball(m, fr, W, 1.5, sd * 0.62, 0.24, 0.07, 0.1, 0.1, lamp, 6, { rings: 4 }); tube(m, fr, W, [1.42, sd * 0.62, 0.24], [1.5, sd * 0.62, 0.24], 0.12, 0.115, chrome, 8);
      hull(m, fr, W, bx(-0.3, 0.14, sd > 0 ? 0.845 : -0.855, sd > 0 ? 0.855 : -0.845, 0.24, 0.42), col[1], 0); }); // headlights, a flash on each side pod
    tube(m, fr, W, [1.54, -0.8, 0.13], [1.54, 0.8, 0.13], 0.04, 0.04, chrome, 6, { cap: chrome, cap0: chrome });
    hull(m, fr, W, bx(1.385, 1.4, -0.16, 0.16, 0.23, 0.3), '#12040a', 0); // the grille
  } else if (body === 'muscle') {
    [-0.34, 0.34].forEach(function (s) { hull(m, fr, W, bx(0.32, 1.4, s - 0.07, s + 0.07, 0.6, 0.615, { tu: 0.12 }), col[1], 0); });
    tube(m, fr, W, [1.56, -0.8, 0.24], [1.56, 0.8, 0.24], 0.045, 0.045, chrome, 6, { cap: chrome, cap0: chrome }); hull(m, fr, W, bx(1.425, 1.44, -0.3, 0.3, 0.26, 0.5), '#12040a', 0);
    tube(m, fr, W, [0.75, 0, 0.7], [0.75, 0, 0.8], 0.13, 0.13, chrome, 8, { cap: '#ffe36a' });
  } else if (body === 'buggy') {
    [-1, 1].forEach(function (sd) { ball(m, fr, W, 0.06, sd * 0.2, 1.68, 0.07, 0.1, 0.1, lamp, 6, { rings: 4 }); }); tube(m, fr, W, [1.42, -0.5, 0.2], [1.42, 0.5, 0.2], 0.04, 0.04, chrome, 6);
  } else if (body === 'rocket') {
    [-0.3, 0.3, 0.7].forEach(function (f) { tube(m, fr, W, [f, 0, 0.48], [f + 0.05, 0, 0.48], 0.425, 0.425, col[1], 10); });
  } else if (body === 'coffin') {
    [-1, 1].forEach(function (sd) { tube(m, fr, W, [1.3, sd * 0.3, 0.6], [1.3, sd * 0.3, 0.86], 0.035, 0.035, '#f1e7d0', 5); tube(m, fr, W, [1.3, sd * 0.3, 0.86], [1.3, sd * 0.3, 0.96], 0.03, 0.004, '#ffe36a', 5); });
  } else if (body === 'tub') {
    [[-0.3, 0.2, 0.16], [0.25, -0.22, 0.2], [0.5, 0.25, 0.13], [-0.55, -0.2, 0.14]].forEach(function (p) { ball(m, fr, W, p[0], p[1], 0.7, p[2], p[2], p[2] * 0.8, '#fff8e8', 6, { rings: 4, b1: 1.7 }); });
  }
  /* every kart: a padded seat, a chrome roll hoop, and nuts on the wheels */
  hull(m, fr, W, bx(-0.43, -0.39, -0.25, 0.25, 0.46, 0.9, { nf: -0.1 }), '#8a1018');
  [0.56, 0.7, 0.84].forEach(function (u) { hull(m, fr, W, bx(-0.395 - (u - 0.46) * 0.227, -0.385 - (u - 0.46) * 0.227, -0.25, 0.25, u, u + 0.012), '#4a060c', 0); });
  if (body !== 'buggy') { [-1, 1].forEach(function (sd) { tube(m, fr, W, [-0.72, sd * 0.36, 0.8], [-0.74, sd * 0.3, 1.12], 0.035, 0.035, chrome, 5); }); tube(m, fr, W, [-0.74, -0.3, 1.12], [-0.74, 0.3, 1.12], 0.035, 0.035, chrome, 5); }
  var big = wh === 'monster' ? 0.13 : 0, st = (k.steerVis || 0) * 0.35, nut = wh === 'gold' ? '#fff0a0' : chrome;
  [[0.8, 1, 0.27], [0.8, -1, 0.27], [-0.74, 1, 0.31], [-0.74, -1, 0.31]].forEach(function (w, i) { var r = w[2] + big + (wh === 'slick' ? (i < 2 ? -0.04 : 0.06) : 0), sd = w[1], s1 = sd * (0.92 + (wh === 'slick' && i >= 2 ? 0.16 : 0) + (big ? 0.1 : 0)), sf = i < 2 ? Math.sin(st) * 0.16 : 0, f = w[0] + sf, u = r - big * 0.5;
    if (wh !== 'spiked') tube(m, fr, W, [f, s1, u], [f, s1 + sd * 0.035, u], r * 0.3, r * 0.2, nut, 6, { cap: nut });
    tube(m, fr, W, [f, s1 - sd * 0.01, u], [f, s1 + sd * 0.012, u], r * 0.66, r * 0.6, wh === 'bone' ? '#3a343c' : '#12040a', 10); }); // the rim's lip
}; })(kart3D);

/* ---------- the race HUD, dressed (update 128) ---------- */
function hudLap(R, k) {
  var ctx = KIT.ctx, lap = Math.max(1, Math.min(R.laps, k.lap)); KIT.panel(6, 6, 112, 46, { stud: 1 });
  text('LAP', 14, 12, { size: 6, col: '#a6968f' }); text(lap + '', 14, 20, { size: 16, col: '#f1e7d0' }); text('/' + R.laps, 14 + KIT.tw(lap + '', 16) + 2, 27, { size: 8, col: '#a6968f' });
  for (var i = 0; i < R.laps && i < 9; i++) { var px = 60 + i * 9, on = i < lap, now = i === lap - 1; ctx.fillStyle = '#12040a'; ctx.fillRect(px, 13, 7, 7); ctx.fillStyle = now ? (Math.floor(R.t * 3) % 2 ? '#ffe36a' : '#c8903a') : on ? '#c4121c' : '#2a0a0e'; ctx.fillRect(px + 1, 14, 5, 5); } // a flag square per lap
  text(fmtTime(k.time), 110, 26, { size: 8, col: '#ffe36a', align: 'right' });
  var top = (k.top || 30) * 1.25, sp = Math.max(0, Math.min(1, Math.abs(k.spd || 0) / top)), bw = 96, bx0 = 14, by = 40; // the speed strip: ticks, a needle of colour, red at the top end
  ctx.fillStyle = '#12040a'; ctx.fillRect(bx0 - 1, by - 1, bw + 2, 7); for (var s = 0; s < 24; s++) { var f = s / 24, lit = f < sp; ctx.fillStyle = lit ? (f > 0.82 ? '#ff2630' : f > 0.6 ? '#ffe36a' : '#f1e7d0') : '#2a0a0e'; ctx.fillRect(bx0 + s * 4, by + (lit ? 0 : 2), 3, lit ? 5 : 3); }
  if (k.boostT > 0 || k.boostK > 1.02) { ctx.fillStyle = Math.floor(R.t * 12) % 2 ? '#6ac8ff' : '#fff6d8'; ctx.fillRect(bx0 - 1, by + 6, bw + 2, 1); }
  /* drops: a little purse with ten pips */
  var dx = 124, full = k.drops >= 10; ctx.fillStyle = 'rgba(7,4,5,0.78)'; ctx.fillRect(dx, 8, 58, 20); ctx.fillStyle = full ? '#ffe36a' : '#4a1a1c'; ctx.fillRect(dx, 8, 58, 1); ctx.fillRect(dx, 27, 58, 1); ctx.fillRect(dx, 8, 1, 20); ctx.fillRect(dx + 57, 8, 1, 20);
  spr('mn_drop', dx + 9, 27, { sc: 1.1 }); text('' + k.drops, dx + 19, 11, { size: 8, col: full ? '#ffe36a' : '#f1e7d0' });
  for (var d = 0; d < 10; d++) { ctx.fillStyle = d < k.drops ? '#ffe36a' : '#2a0a0e'; ctx.fillRect(dx + 19 + d * 3.6, 21, 2.6, 3); }
}
function hudItemBox(R, k) {
  var ctx = KIT.ctx, x = 212, y = 3, w = 56, h = 48, has = k.item && !(k.roul > 0), t = R.t;
  KIT.panel(x, y, w, h, { stud: 1 }); ctx.fillStyle = '#070405'; ctx.fillRect(x + 5, y + 5, w - 10, h - 10); var g = ctx.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, 26); g.addColorStop(0, has ? 'rgba(196,18,28,0.55)' : 'rgba(74,26,28,0.35)'); g.addColorStop(1, 'rgba(7,4,5,0)'); ctx.fillStyle = g; ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
  if (has) { ctx.save(); ctx.beginPath(); ctx.rect(x + 5, y + 5, w - 10, h - 10); ctx.clip(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(t * 0.8); ctx.fillStyle = 'rgba(255,227,106,0.12)'; for (var i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, -40); ctx.lineTo(6, -40); ctx.fill(); } ctx.restore(); } // rays turning behind the thing you hold
  ctx.strokeStyle = has ? '#ffe36a' : '#4a1a1c'; ctx.lineWidth = 1; ctx.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
  if (k.roul > 0) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 5, y + 5 + ((t * 90) % (h - 14)), w - 10, 4); }
}
function hudPlace(R, k, pl, col) {
  var ctx = KIT.ctx, cx = 428, cy = 172; if (HUDPL.p !== pl) { HUDPL.p = pl; HUDPL.t = R.t; } var pop = Math.max(0, 1 - (R.t - HUDPL.t) * 3), s = 1 + pop * 0.35;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.fillStyle = 'rgba(7,4,5,0.7)'; ctx.beginPath(); ctx.arc(0, 0, 31, 0, 6.29); ctx.fill(); ctx.strokeStyle = '#12040a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 31, 0, 6.29); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 31, 0, 6.29); ctx.stroke();
  ctx.strokeStyle = col; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 26.5, 0, 6.29); ctx.stroke(); ctx.globalAlpha = 1;
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + R.t * 0.3; ctx.fillStyle = col; ctx.fillRect(Math.cos(a) * 31 - 1.5, Math.sin(a) * 31 - 1.5, 3, 3); } ctx.restore();
  var tw = KIT.tw(String(pl), 48, 'title'); text(String(pl), cx - 8, cy - 30, { size: 48, col: col, font: 'title', outline: true, align: 'center' }); text(ordinal(pl).slice(-2).toUpperCase(), cx + 8, cy - 22, { size: 16, col: col, font: 'title', outline: true });
  text(pl + '/' + R.karts.length, cx, cy + 36, { size: 6, col: '#a6968f', align: 'center', outline: true });
}
var HUDPL = { p: 0, t: 0 };
function hudMapBack(x, y, w, h) { var ctx = KIT.ctx; ctx.fillStyle = 'rgba(7,4,5,0.5)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#4a1a1c'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = '#c4121c'; [[x, y], [x + w - 3, y], [x, y + h - 3], [x + w - 3, y + h - 3]].forEach(function (c) { ctx.fillRect(c[0], c[1], 3, 3); }); }

/* ---------- the menus, dressed (update 128): buttons with a blood bar that turns gold, tiles that lift, glossy bars ---------- */
(function () { var s = document.createElement('style'); s.textContent = [
  '.ckbtn{position:relative;background:linear-gradient(180deg,#1c0a0d,#0e0607);box-shadow:inset 0 0 0 1px #4a1a1c,inset 0 1px 0 1px rgba(255,255,255,.04);transition:transform .12s ease,box-shadow .12s ease,background .12s ease,filter .12s ease}',
  '.ckt .ckbtn::before,.ckacts .ckbtn::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#c4121c;transition:width .12s ease,background .12s ease}',
  '.ckt .ckbtn:hover,.ckt .ckbtn:focus-visible,.ckt .ckbtn.hs-focus{transform:translateX(6px);background:linear-gradient(90deg,#8e0c14,#2a0709 70%);box-shadow:inset 0 0 0 2px #ff2630,0 0 22px rgba(196,18,28,.45)}',
  '.ckt .ckbtn:hover::before,.ckt .ckbtn:focus-visible::before,.ckt .ckbtn.hs-focus::before,.ckacts .ckbtn:focus-visible::before{width:8px;background:#ffe36a}',
  '.ckt .ckbtn b{text-shadow:0 2px 0 #12040a}',
  '.ckt .logo{filter:drop-shadow(0 4px 0 #12040a) drop-shadow(0 0 26px rgba(196,18,28,.5));animation:ckfloat 4.5s ease-in-out infinite}',
  '@keyframes ckfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
  '.ckh h1,.ckh .ttl{text-shadow:0 2px 0 #12040a,0 0 24px rgba(255,38,48,.45)}',
  '.ckh{border-bottom:1px solid transparent;border-image:linear-gradient(90deg,#c4121c,rgba(196,18,28,0) 70%) 1}',
  '.ckc{transition:transform .14s ease,box-shadow .14s ease}',
  '.ckc:hover,.ckc:focus-visible,.ckc.hs-focus{transform:translateY(-3px);box-shadow:inset 0 0 0 2px #ff2630,0 10px 24px rgba(0,0,0,.6),0 0 22px rgba(196,18,28,.35)}',
  '.ckc img.th{box-shadow:inset 0 0 0 1px #2a0c0e,0 2px 0 #12040a}',
  '.ckgrp{display:flex;align-items:center;gap:10px}.ckgrp::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#c8903a,rgba(200,144,58,0))}',
  '.ckch .p{transition:transform .12s ease,box-shadow .12s ease,filter .12s ease;filter:saturate(.85) brightness(.9)}',
  '.ckch .p:hover,.ckch .p:focus-visible,.ckch .p.hs-focus,.ckch .p.sel{filter:none;transform:scale(1.06);z-index:2}',
  '.ckch .p.sel{box-shadow:inset 0 0 0 3px #ffe36a,0 0 18px rgba(255,227,106,.45)}',
  '.ckinfo{background:linear-gradient(180deg,#220b0f,#0e0708 70%);box-shadow:inset 0 0 0 2px #c8b898,inset 0 0 0 4px #12040a,inset 0 0 0 5px #4a1a1c,0 0 0 2px #12040a,0 12px 30px rgba(0,0,0,.6)}',
  '.ckst .bar i{height:10px;background:#3a1216;box-shadow:inset 0 2px 0 rgba(0,0,0,.5);transform:skewX(-14deg)}',
  '.ckst .bar i.on{background:linear-gradient(180deg,#ff6a70 0,#ff2630 22%,#c4121c 70%,#8e0c14);box-shadow:0 0 6px rgba(255,38,48,.5)}',
  '.ckgo{box-shadow:inset 0 0 0 1px #ff6a70,inset 0 -6px 0 rgba(0,0,0,.25),0 0 20px rgba(196,18,28,.5)!important;text-shadow:0 2px 0 #5a060c}',
  '.ckgo:hover,.ckgo:focus-visible,.ckgo.hs-focus{filter:brightness(1.2)}',
  '.ckr{background:linear-gradient(90deg,#1c0a0d,#0e0607);box-shadow:inset 0 0 0 1px #2a0c0e,inset 3px 0 0 #4a1a1c}',
  '.ckr:nth-child(1) .pl{color:#ffe36a;text-shadow:0 0 10px rgba(255,227,106,.6)}.ckr:nth-child(2) .pl{color:#d0c8d0}.ckr:nth-child(3) .pl{color:#e09a5a}',
  '.ckr.me{background:linear-gradient(90deg,#3a0a0e,#140809);box-shadow:inset 0 0 0 2px #ffe36a,0 0 16px rgba(255,227,106,.25)}',
  '.ckacts .ckbtn:hover,.ckacts .ckbtn:focus-visible,.ckacts .ckbtn.hs-focus{transform:translateY(-2px);box-shadow:inset 0 0 0 2px #ff2630,0 0 18px rgba(196,18,28,.45)}',
  '.ckbk:hover,.ckbk:focus-visible{background:#2a0a0e;box-shadow:inset 0 0 0 2px #ff2630}',
  '@media (prefers-reduced-motion:reduce){.ckt .logo{animation:none}.ckbtn,.ckc,.ckch .p{transition:none}}'
].join('\n'); document.head.appendChild(s); })();
