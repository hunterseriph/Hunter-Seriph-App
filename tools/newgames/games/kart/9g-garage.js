/* =====================================================================================================
   THE GARAGE (his ask: a car parts shop with loads of customisation and colours).
   Parts are looks only, so nobody buys a faster kart. Bought with drops, kept in SV.gar
   ({ own: {part: 1}, eq: {body, wheel, wing, exh, top, c0, c1, c2} }). Your own kart wears them in every
   race (k.cust). The showroom (a slow turntable) is drawn into a little canvas: in the garage, and on the
   character select so you see the driver in their kart going round.
   ===================================================================================================== */
var PARTS = {
  body: { n: 'Body', list: [
    ['classic', 'Classic', 0], ['muscle', 'Muscle', 220], ['buggy', 'Dune Buggy', 260], ['coffin', 'Coffin', 320], ['rocket', 'Rocket', 380], ['tub', 'Cream Bath', 420]] },
  wheel: { n: 'Wheels', list: [
    ['std', 'Standard', 0], ['monster', 'Monster', 200], ['slick', 'Fat Slicks', 140], ['spiked', 'Spiked', 180], ['gold', 'Gold Rims', 240], ['bone', 'Bone White', 120]] },
  wing: { n: 'Wing', list: [
    ['std', 'Standard', 0], ['none', 'No Wing', 0], ['gt', 'Tall GT', 150], ['double', 'Double Decker', 190], ['bat', 'Bat Wings', 260]] },
  exh: { n: 'Exhaust', list: [
    ['twin', 'Twin Pipes', 0], ['quad', 'Quad Pipes', 90], ['stacks', 'Smoke Stacks', 140], ['organ', 'Church Organ', 230]] },
  top: { n: 'Topper', list: [
    ['none', 'Nothing', 0], ['horns', 'Devil Horns', 110], ['skull', 'Skull', 130], ['candles', 'Candles', 120], ['flag', 'Flag', 90], ['aerial', 'Aerial', 70]] }
};
var PAINT_C = [['', "Driver's own"], ['#c4121c', 'Blood Red'], ['#ff2630', 'Hot Red'], ['#6a0a14', 'Wine'], ['#12040a', 'Black'], ['#3a3438', 'Gunmetal'], ['#a8a0a8', 'Silver'],
  ['#f1e7d0', 'Bone'], ['#f0c070', 'Cream'], ['#ffe36a', 'Gold'], ['#c8903a', 'Brass'], ['#ff8ac0', 'Pink'], ['#9a3ae0', 'Purple'], ['#3a5ad8', 'Blue'], ['#3ab4c8', 'Sea'], ['#3fb43a', 'Goo Green'], ['#ff8a20', 'Orange']];
var PAINTCOST = 35, PAINTSLOT = { c0: 'Main colour', c1: 'Second colour', c2: 'Trim colour' };
function GAR() { SV.gar = SV.gar || { own: {}, eq: {} }; return SV.gar; }
function custNow() { var g = GAR(), e = g.eq; return { body: e.body || 'classic', wheel: e.wheel || 'std', wing: e.wing || 'std', exh: e.exh || 'twin', top: e.top || 'none', c0: e.c0 || '', c1: e.c1 || '', c2: e.c2 || '' }; }
function partOwned(cat, id, price) { return !price || !!GAR().own[cat + ':' + id]; }
function paintOwned(hex) { return !hex || !!GAR().own['paint:' + hex]; }
/* Sir Johnathan unlocks at 1,000 drops earned: spending them in the garage does not take that away */
var _checkUnlocksG = typeof checkUnlocks === 'function' ? checkUnlocks : null;
if (_checkUnlocksG) checkUnlocks = function () { var d = SV.drops || 0; SV.drops = d + (SV.spent || 0); try { return _checkUnlocksG.apply(this, arguments); } finally { SV.drops = d; } };

/* your kart wears your parts (only yours; the AI keep their own karts) */
startRace = (function (orig) { return function (o) { var r = orig.apply(this, arguments); if (RACE && !RACE.demo && o && o.mode !== 'demo' && RACE.me) RACE.me.cust = custNow(); return r; }; })(startRace);

/* ---------- the kart, built from parts ---------- */
function kart3D(m, A, k, fr) {
  var W = A.tile('white'), cu = k.cust || {}, base = k.c.kart, col = [cu.c0 || base[0], cu.c1 || base[1], cu.c2 || base[2]], dk = '#1a1418', body = cu.body || 'classic', gold = '#ffe36a';
  hull(m, fr, W, bx(-1.05, 1.0, -0.58, 0.58, 0.14, 0.3), col[1]);                                       // floor pan
  if (body === 'classic') {
    hull(m, fr, W, bx(-0.72, 0.62, -0.5, 0.5, 0.3, 0.56, { nf: -0.04 }), col[0]);
    hull(m, fr, W, bx(0.62, 1.38, -0.44, 0.44, 0.2, 0.5, { ts: 0.24, tu: 0.22 }), col[0]);
    hull(m, fr, W, bx(1.22, 1.5, -0.86, 0.86, 0.1, 0.2, { ts: 0.05 }), col[2]);
    [-1, 1].forEach(function (sd) { var s0 = sd > 0 ? 0.48 : -0.84, s1 = sd > 0 ? 0.84 : -0.48;
      hull(m, fr, W, [[-0.6, s0, 0.16], [0.52, s0, 0.16], [0.52, s1, 0.16], [-0.6, s1, 0.16], [-0.6, s0, 0.5], [0.2, s0, 0.46], [0.2, s1, 0.46], [-0.6, s1, 0.5]], col[2]);
      tube(m, fr, W, [-0.66, sd * 0.66, 0.34], [-0.4, sd * 0.66, 0.34], 0.1, 0.12, '#12040a', 6); });
  } else if (body === 'muscle') { // a big boxy hot rod with a bonnet scoop
    hull(m, fr, W, bx(-1.0, 0.3, -0.8, 0.8, 0.18, 0.66, { nf: -0.04 }), col[0]);
    hull(m, fr, W, bx(0.3, 1.42, -0.8, 0.8, 0.18, 0.6, { tu: 0.12 }), col[0]);
    hull(m, fr, W, bx(0.5, 1.0, -0.2, 0.2, 0.56, 0.72, { tu: 0.08 }), dk);
    hull(m, fr, W, bx(1.4, 1.52, -0.82, 0.82, 0.2, 0.34), col[2]); hull(m, fr, W, bx(-1.1, -0.98, -0.82, 0.82, 0.2, 0.34), col[2]);
    [-0.5, 0.5].forEach(function (s) { hull(m, fr, W, bx(1.41, 1.45, s - 0.14, s + 0.14, 0.4, 0.52), '#fff6d8'); }); // headlights
  } else if (body === 'buggy') { // a little tub inside a roll cage
    hull(m, fr, W, bx(-0.72, 0.9, -0.46, 0.46, 0.28, 0.5, { ts: 0.12 }), col[0]);
    hull(m, fr, W, bx(0.9, 1.4, -0.5, 0.5, 0.16, 0.3, { tu: 0.06 }), col[2]);
    var cg = col[2]; [-1, 1].forEach(function (sd) {
      tube(m, fr, W, [-0.62, sd * 0.5, 0.45], [-0.5, sd * 0.42, 1.6], 0.045, 0.045, cg, 5);
      tube(m, fr, W, [0.5, sd * 0.5, 0.45], [0.05, sd * 0.42, 1.6], 0.045, 0.045, cg, 5);
      tube(m, fr, W, [-0.5, sd * 0.42, 1.6], [0.05, sd * 0.42, 1.6], 0.045, 0.045, cg, 5); });
    tube(m, fr, W, [-0.5, -0.42, 1.6], [-0.5, 0.42, 1.6], 0.045, 0.045, cg, 5); tube(m, fr, W, [0.05, -0.42, 1.6], [0.05, 0.42, 1.6], 0.045, 0.045, cg, 5);
  } else if (body === 'coffin') { // a coffin on wheels, gold cross on the lid
    hull(m, fr, W, [[-1.15, -0.46, 0.18], [0.55, -0.78, 0.18], [0.55, 0.78, 0.18], [-1.15, 0.46, 0.18], [-1.15, -0.46, 0.6], [0.55, -0.78, 0.6], [0.55, 0.78, 0.6], [-1.15, 0.46, 0.6]], col[0]);
    hull(m, fr, W, [[0.55, -0.78, 0.18], [1.4, -0.42, 0.18], [1.4, 0.42, 0.18], [0.55, 0.78, 0.18], [0.55, -0.78, 0.6], [1.4, -0.42, 0.6], [1.4, 0.42, 0.6], [0.55, 0.78, 0.6]], col[0]);
    hull(m, fr, W, bx(0.75, 1.3, -0.06, 0.06, 0.6, 0.64), gold); hull(m, fr, W, bx(0.95, 1.05, -0.3, 0.3, 0.6, 0.64), gold);
    [-1, 1].forEach(function (sd) { [-0.6, 0.1, 0.9].forEach(function (f) { hull(m, fr, W, bx(f - 0.08, f + 0.08, sd * 0.7 - 0.04, sd * 0.7 + 0.04, 0.34, 0.42), col[2]); }); }); // handles
  } else if (body === 'rocket') { // a rocket with fins, pointy nose
    tube(m, fr, W, [-1.05, 0, 0.48], [0.95, 0, 0.48], 0.42, 0.4, col[0], 10);
    tube(m, fr, W, [0.95, 0, 0.48], [1.65, 0, 0.42], 0.4, 0.03, col[2], 10);
    tube(m, fr, W, [-1.05, 0, 0.48], [-1.2, 0, 0.48], 0.42, 0.3, dk, 10);
    hull(m, fr, W, [[-1.05, -0.05, 0.85], [-0.45, -0.05, 0.85], [-0.45, 0.05, 0.85], [-1.05, 0.05, 0.85], [-1.15, -0.04, 1.45], [-0.95, -0.04, 1.45], [-0.95, 0.04, 1.45], [-1.15, 0.04, 1.45]], col[2]);
    [-1, 1].forEach(function (sd) { hull(m, fr, W, [[-1.05, sd * 0.38, 0.4], [-0.45, sd * 0.38, 0.4], [-0.45, sd * 0.38, 0.5], [-1.05, sd * 0.38, 0.5], [-1.15, sd * 0.98, 0.28], [-0.95, sd * 0.98, 0.28], [-0.95, sd * 0.98, 0.36], [-1.15, sd * 0.98, 0.36]], col[2]); });
  } else if (body === 'tub') { // a claw-foot bath full of cream
    hull(m, fr, W, bx(-0.95, 0.95, -0.64, 0.64, 0.24, 0.72, { ts: 0.06 }), col[0]);
    hull(m, fr, W, bx(-0.88, 0.88, -0.56, 0.56, 0.62, 0.68), '#f6ecd0');
    hull(m, fr, W, bx(-1.0, 1.0, -0.7, 0.7, 0.72, 0.78), col[2]);
    tube(m, fr, W, [0.86, 0, 0.75], [0.86, 0, 1.0], 0.04, 0.04, gold, 5); tube(m, fr, W, [0.86, 0, 1.0], [0.68, 0, 1.0], 0.04, 0.03, gold, 5);
    [[-0.8, -0.56], [-0.8, 0.56], [0.8, -0.56], [0.8, 0.56]].forEach(function (p) { hull(m, fr, W, bx(p[0] - 0.08, p[0] + 0.08, p[1] - 0.08, p[1] + 0.08, 0.1, 0.26), gold); });
  }
  hull(m, fr, W, bx(-0.66, -0.42, -0.32, 0.32, 0.42, 0.95, { nf: -0.1 }), dk);                         // seat back
  hull(m, fr, A.tile('metal'), bx(-1.08, -0.7, -0.38, 0.38, 0.44, 0.8), '#a8a0a8');                     // engine
  // exhaust
  var ex = cu.exh || 'twin';
  if (ex === 'twin') [-0.22, 0.22].forEach(function (s) { tube(m, fr, W, [-0.95, s, 0.7], [-1.32, s, 0.74], 0.08, 0.1, '#6a646c', 6, { cap: '#12040a' }); });
  else if (ex === 'quad') [-0.3, -0.1, 0.1, 0.3].forEach(function (s) { tube(m, fr, W, [-0.95, s, 0.66], [-1.34, s, 0.7], 0.06, 0.07, '#8a848c', 6, { cap: '#12040a' }); });
  else if (ex === 'stacks') [-0.3, 0.3].forEach(function (s) { tube(m, fr, W, [-0.9, s, 0.7], [-0.92, s * 1.2, 1.5], 0.07, 0.09, '#a8a0a8', 6, { cap: '#12040a' }); });
  else if (ex === 'organ') [-0.32, -0.16, 0, 0.16, 0.32].forEach(function (s, i) { tube(m, fr, W, [-0.95, s, 0.72], [-0.95, s, 1.1 + (2 - Math.abs(i - 2)) * 0.22], 0.055, 0.055, gold, 6, { cap: '#12040a' }); });
  // wing
  var wg = cu.wing || 'std';
  if (wg === 'std') { hull(m, fr, W, bx(-1.32, -1.08, -0.78, 0.78, 1.02, 1.1), col[2]); [-0.5, 0.5].forEach(function (s) { hull(m, fr, W, bx(-1.22, -1.16, s - 0.03, s + 0.03, 0.6, 1.03), dk); }); }
  else if (wg === 'gt') { hull(m, fr, W, bx(-1.42, -1.1, -0.9, 0.9, 1.4, 1.48), col[2]); [-0.9, 0.9].forEach(function (s) { hull(m, fr, W, bx(-1.44, -1.08, s - 0.02, s + 0.02, 1.28, 1.6), col[0]); }); [-0.45, 0.45].forEach(function (s) { hull(m, fr, W, bx(-1.28, -1.22, s - 0.03, s + 0.03, 0.6, 1.41), dk); }); }
  else if (wg === 'double') { [1.0, 1.28].forEach(function (u) { hull(m, fr, W, bx(-1.34, -1.08, -0.8, 0.8, u, u + 0.07), col[2]); }); [-0.8, 0.8].forEach(function (s) { hull(m, fr, W, bx(-1.36, -1.06, s - 0.02, s + 0.02, 0.95, 1.4), dk); }); [-0.5, 0.5].forEach(function (s) { hull(m, fr, W, bx(-1.22, -1.16, s - 0.03, s + 0.03, 0.6, 1.03), dk); }); }
  else if (wg === 'bat') [-1, 1].forEach(function (sd) { // leathery bat wings off the back, spread wide
    hull(m, fr, W, [[-1.0, sd * 0.3, 0.8], [-0.7, sd * 0.3, 0.8], [-0.7, sd * 0.32, 0.86], [-1.0, sd * 0.32, 0.86], [-1.35, sd * 1.35, 1.55], [-1.05, sd * 1.35, 1.5], [-1.05, sd * 1.37, 1.56], [-1.35, sd * 1.37, 1.6]], '#12040a');
    hull(m, fr, W, [[-1.05, sd * 0.4, 0.78], [-0.75, sd * 0.4, 0.8], [-0.75, sd * 0.42, 0.84], [-1.05, sd * 0.42, 0.82], [-1.25, sd * 1.25, 1.0], [-1.0, sd * 1.25, 1.02], [-1.0, sd * 1.27, 1.06], [-1.25, sd * 1.27, 1.04]], col[0]); });
  // toppers
  var tp = cu.top || 'none', nose = body === 'rocket' ? 1.3 : body === 'muscle' ? 1.2 : body === 'coffin' ? 1.25 : 1.05, nu = body === 'rocket' ? 0.82 : body === 'tub' ? 0.78 : body === 'muscle' || body === 'coffin' ? 0.64 : 0.5;
  if (tp === 'horns') [-1, 1].forEach(function (sd) { tube(m, fr, W, [nose, sd * 0.22, nu], [nose + 0.14, sd * 0.4, nu + 0.42], 0.09, 0.01, '#ff2630', 6); });
  else if (tp === 'skull') { hull(m, fr, W, bx(nose - 0.2, nose + 0.12, -0.17, 0.17, nu, nu + 0.3), '#f1e7d0'); [-0.08, 0.08].forEach(function (s) { hull(m, fr, W, bx(nose + 0.11, nose + 0.13, s - 0.05, s + 0.05, nu + 0.12, nu + 0.22), '#12040a'); }); hull(m, fr, W, bx(nose - 0.1, nose + 0.12, -0.12, 0.12, nu - 0.06, nu + 0.02), '#e0d6c0'); }
  else if (tp === 'candles') [-0.24, 0, 0.24].forEach(function (s, i) { var h = 0.28 + (i === 1 ? 0.12 : 0), t2 = (RACE ? RACE.t : 0) * 9 + i; tube(m, fr, W, [-0.88, s, 0.8], [-0.88, s, 0.8 + h], 0.05, 0.05, '#f1e7d0', 6); tube(m, fr, W, [-0.88, s, 0.8 + h], [-0.88, s + Math.sin(t2) * 0.02, 0.8 + h + 0.12], 0.04, 0.005, gold, 5); });
  else if (tp === 'flag') { tube(m, fr, W, [-0.9, 0.32, 0.8], [-0.9, 0.32, 2.0], 0.02, 0.02, dk, 4); var fl = (RACE ? RACE.t : 0) * 6; hull(m, fr, W, [[-0.9, 0.32, 1.6], [-1.45, 0.32 + Math.sin(fl) * 0.08, 1.62], [-1.45, 0.34 + Math.sin(fl) * 0.08, 1.62], [-0.9, 0.34, 1.6], [-0.9, 0.32, 1.98], [-1.45, 0.32 + Math.sin(fl) * 0.08, 1.92], [-1.45, 0.34 + Math.sin(fl) * 0.08, 1.92], [-0.9, 0.34, 1.98]], col[0]); }
  else if (tp === 'aerial') { tube(m, fr, W, [-0.95, -0.34, 0.8], [-1.05, -0.38, 2.1], 0.015, 0.01, dk, 4); tube(m, fr, W, [-1.05, -0.38, 2.04], [-1.05, -0.38, 2.2], 0.08, 0.08, '#ff2630', 6, { cap: '#ff2630', cap0: '#ff2630' }); }
  tube(m, fr, W, [0.2, 0, 0.48], [0.4, 0, 0.6], 0.04, 0.04, dk, 4);                                    // steering column
  tube(m, fr, W, [0.39, 0, 0.59], [0.43, 0, 0.64], 0.17, 0.17, dk, 8);                                // steering wheel
  // wheels
  var wh = cu.wheel || 'std', roll = k._roll = (k._roll || 0) + (k.spd || 0) * (1 / 60) / 0.3, st = (k.steerVis || 0) * 0.35;
  var big = wh === 'monster' ? 0.13 : 0, tyre = wh === 'bone' ? '#e8dcc0' : '#2a2228', hub = wh === 'gold' ? gold : wh === 'bone' ? '#3a343c' : '#8a828a', hub2 = wh === 'gold' ? '#c8903a' : '#3a343c';
  [[0.8, 1, 0.27], [0.8, -1, 0.27], [-0.74, 1, 0.31], [-0.74, -1, 0.31]].forEach(function (w, i) {
    var r = w[2] + big + (wh === 'slick' ? (i < 2 ? -0.04 : 0.06) : 0), sd = w[1], f = w[0], s0 = sd * 0.6, s1 = sd * (0.92 + (wh === 'slick' && i >= 2 ? 0.16 : 0) + (big ? 0.1 : 0)), sf = i < 2 ? Math.sin(st) * 0.16 : 0;
    var pts = function (a) { return [f - sf * (a ? -1 : 1), a ? s1 : s0, r - big * 0.5]; };
    tube(m, fr, A.tile('tire'), pts(0), pts(1), r, r, tyre, 8, { rot: roll, cap: hub, cap2: hub2, cap0: hub2 });
    if (wh === 'spiked') tube(m, fr, W, pts(1), [f, s1 + sd * 0.22, r - big * 0.5], 0.07, 0.005, '#d8d0d8', 5);
  });
}

/* ---------- the showroom: a turntable drawn into a little canvas ---------- */
var SHOWS = [];
function showroom(cv, get) { SHOWS = SHOWS.filter(function (s) { return document.body.contains(s.cv); }); SHOWS.push({ cv: cv, get: get, t0: performance.now() }); }
function drawShows() {
  SHOWS = SHOWS.filter(function (s) { return document.body.contains(s.cv); }); if (!SHOWS.length || !RACE || !R3.ok) return;
  var dtx = driverTex(); if (!dtx) return; var A = RACE.A, gl = R3.gl;
  SHOWS.forEach(function (s) {
    var o = s.get(); if (!o || !CH[o.id]) return; var cv = s.cv, r = cv.getBoundingClientRect(); if (r.width < 8 || r.height < 8) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), want = Math.max(60, Math.min(R3.canvas.height, Math.round(r.height * dpr * 0.5))), wantW = Math.min(R3.canvas.width, Math.round(want * r.width / r.height));
    R3.begin([0.035, 0.016, 0.02]);
    var vh = Math.min(want, R3.canvas.height), vw = Math.min(wantW, R3.canvas.width); if (cv.width !== vw || cv.height !== vh) { cv.width = vw; cv.height = vh; }
    gl.viewport(0, 0, vw, vh);
    var t = (performance.now() - s.t0) / 1000, ang = t * 0.55 + 0.9, eye = [Math.cos(0.55) * 5.2, 2.3, Math.sin(0.55) * 5.2], at = [0, 0.85, 0];
    R3.setCam(eye, at, 0.7, [0.035, 0.016, 0.02], [1e5, 2e5]); R3.setMatrix(R3.mul(R3.persp(0.72, vw / vh, 0.3, 100), R3.look(eye, at, [0, 1, 0])));
    var m = new R3.Mesh(), W = A.tile('white'), seg = 28;
    for (var i = 0; i < seg; i++) { // the turntable: a dark disc, a red ring, a brass rim
      var a0 = i / seg * 6.2832 + ang * 0.3, a1 = (i + 1) / seg * 6.2832 + ang * 0.3, P = function (a, rr, y) { return [Math.cos(a) * rr, y, Math.sin(a) * rr]; };
      m.tri([0, -0.01, 0], P(a1, 1.9, -0.01), P(a0, 1.9, -0.01), [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], W, i % 2 ? [0.1, 0.045, 0.05] : [0.085, 0.035, 0.04]);
      m.quad(P(a0, 1.9, -0.01), P(a1, 1.9, -0.01), P(a1, 2.1, -0.01), P(a0, 2.1, -0.01), [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], W, [0.42, 0.04, 0.06]);
      m.quad(P(a0, 2.1, -0.32), P(a1, 2.1, -0.32), P(a1, 2.1, -0.01), P(a0, 2.1, -0.01), [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], W, [[0.18, 0.12, 0.05], [0.18, 0.12, 0.05], [0.4, 0.28, 0.12], [0.4, 0.28, 0.12]]);
    }
    var k = { c: CH[o.id], x: 0, y: 0, z: 0, yaw: ang, spd: 0, steerVis: Math.sin(t * 0.8) * 0.4, cust: o.cust || null, slot: 0 };
    var fr = Frame(0, 0, 0, ang, 0, 1, [0.66, 0.62, 0.62], 1), dv = new R3.Mesh();
    kart3D(m, A, k, fr); driver3D(dv, k, fr);
    R3.draw(m, RACE.atlas); if (dv.n) R3.draw(dv, dtx);
    var g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(R3.canvas, 0, R3.canvas.height - vh, vw, vh, 0, 0, vw, vh);
  });
}
drawRace = (function (orig) { return function () { if (SHOWS.length) drawShows(); return orig.apply(this, arguments); }; })(drawRace);

/* the character select shows the driver in their kart, going round */
pickChar = (function (orig) { return function (next, back) {
  orig(next, back);
  var info = document.querySelector('.ckinfo'); if (!info) return;
  var cv = document.createElement('canvas'); cv.className = 'ckview'; info.insertBefore(cv, info.firstChild);
  showroom(cv, function () { var ip = document.getElementById('ckInfo'), h = ip && ip.querySelector('h2'), n = h ? h.textContent : '', c = CHARS.filter(function (c) { return c.n === n; })[0]; var id = c && charOpen(c.id) ? c.id : SV.ch; return { id: id, cust: custNow() }; });
}; })(pickChar);

/* ---------- the garage screen ---------- */
var GARCSS = false;
function garageCss() {
  if (GARCSS) return; GARCSS = true; var st = document.createElement('style'); st.textContent = [
    '.ckview{display:block;width:100%;aspect-ratio:16/10;max-height:34vh;background:#090405;image-rendering:pixelated;box-shadow:inset 0 0 0 2px #2a0c0e;flex:none}',
    '.ckgar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:14px;height:100%;min-height:0}',
    '.ckgar .view{display:flex;flex-direction:column;gap:8px;min-height:0}.ckgar .view .ckview{max-height:none;flex:1;min-height:0;aspect-ratio:auto}',
    '.ckgar .bank{font-family:var(--pixel);font-size:10px;color:var(--gold);text-align:center}',
    '.ckgar .side{display:flex;flex-direction:column;gap:8px;min-height:0}',
    '.ckgar .tabs{display:flex;flex-wrap:wrap;gap:6px}.ckgar .tabs .ckbtn{padding:8px 10px;font-size:13px;font-weight:700;letter-spacing:.06em}.ckgar .tabs .ckbtn.on{box-shadow:inset 0 0 0 2px #ffe36a;color:var(--gold)}',
    '.ckgar .opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;overflow:auto;min-height:0;align-content:start;touch-action:pan-y;padding:2px}',
    '.ckgar .opt{display:flex;align-items:center;gap:8px;padding:10px;text-align:left;min-height:46px}.ckgar .opt b{flex:1;font-size:15px}.ckgar .opt em{font-style:normal;font-family:var(--pixel);font-size:8px;color:var(--gold)}',
    '.ckgar .opt.eq{box-shadow:inset 0 0 0 2px #ffe36a}.ckgar .opt.eq em{color:var(--bone)}.ckgar .opt.poor em{color:#ff2630}',
    '.ckgar .opt.drv{padding:6px 10px}.ckgar .opt .hsp-pic{flex:none;width:32px!important;height:32px!important}.ckgar .opt[aria-disabled] .hsp-pic{filter:brightness(0)}',
    '.ckgar .opt i{width:20px;height:20px;flex:none;box-shadow:0 0 0 1px #12040a,inset 0 0 0 1px rgba(255,255,255,.15)}',
    '@media (max-height:460px){.ckinfo .ckview{max-height:24vh}.ckinfo .top .hsp-pic{display:none!important}.ckinfo{gap:5px;padding:8px}}',
    '@media (max-width:640px),(orientation:portrait){.ckgar{grid-template-columns:1fr;grid-template-rows:minmax(150px,38%) minmax(0,1fr)}}'
  ].join('\n'); document.head.appendChild(st);
}
function garage(back, tab) {
  garageCss(); tab = tab || 'drv'; var g = GAR(), cu = custNow(), redo = function () { garage(back, tab); }, acts = {};
  var tabs = [['drv', 'Driver']].concat(Object.keys(PARTS).map(function (k) { return [k, PARTS[k].n]; })).concat([['c0', 'Main colour'], ['c1', 'Second'], ['c2', 'Trim']]);
  var rows = '';
  if (tab === 'drv') CHARS.forEach(function (c, i) { // who drives: every driver you have opened
    var op = charOpen(c.id), eq = SV.ch === c.id;
    rows += '<button type="button" class="ckbtn opt drv' + (eq ? ' eq' : '') + '" data-act="p' + i + '"' + (op ? '' : ' aria-disabled="true"') + (eq ? ' data-pad-default' : '') + '>' + (op ? pic(c.id, 32) : '<span class="hsp-pic" style="display:inline-block;width:32px;height:32px;background:#0a0506"></span>') + '<b>' + esc(op ? c.n : '???') + '</b><em>' + (eq ? 'ON' : op ? '' : 'LOCKED') + '</em></button>';
    acts['p' + i] = function () { if (!op) { sfx.play('back'); return; } SV.ch = c.id; persist(); garageSync(); redo(); };
  });
  else if (PARTS[tab]) PARTS[tab].list.forEach(function (p, i) {
    var own = partOwned(tab, p[0], p[2]), eq = cu[tab] === p[0], poor = !own && (SV.drops || 0) < p[2];
    rows += '<button type="button" class="ckbtn opt' + (eq ? ' eq' : '') + (poor ? ' poor' : '') + '" data-act="p' + i + '"' + (eq ? ' data-pad-default' : '') + '><b>' + esc(p[1]) + '</b><em>' + (eq ? 'ON' : own ? 'OWNED' : p[2] + ' DROPS') + '</em></button>';
    acts['p' + i] = function () { if (!own) { if ((SV.drops || 0) < p[2]) { sfx.play('back'); return; } SV.drops -= p[2]; SV.spent = (SV.spent || 0) + p[2]; g.own[tab + ':' + p[0]] = 1; sfx.play('coin'); } g.eq[tab] = p[0]; persist(); garageSync(); redo(); };
  });
  else PAINT_C.forEach(function (p, i) {
    var own = paintOwned(p[0]), eq = cu[tab] === p[0], poor = !own && (SV.drops || 0) < PAINTCOST;
    rows += '<button type="button" class="ckbtn opt' + (eq ? ' eq' : '') + (poor ? ' poor' : '') + '" data-act="p' + i + '"' + (eq ? ' data-pad-default' : '') + '>' + (p[0] ? '<i style="background:' + p[0] + '"></i>' : '<i style="background:linear-gradient(135deg,#c4121c 50%,#f1e7d0 50%)"></i>') + '<b>' + esc(p[1]) + '</b><em>' + (eq ? 'ON' : own ? '' : PAINTCOST) + '</em></button>';
    acts['p' + i] = function () { if (!own) { if ((SV.drops || 0) < PAINTCOST) { sfx.play('back'); return; } SV.drops -= PAINTCOST; SV.spent = (SV.spent || 0) + PAINTCOST; g.own['paint:' + p[0]] = 1; sfx.play('coin'); } g.eq[tab] = p[0]; persist(); garageSync(); redo(); };
  });
  tabs.forEach(function (t) { acts['t_' + t[0]] = function () { garage(back, t[0]); }; });
  screen({ title: 'Garage', sub: 'Looks only. Your kart wears them in every race.', back: back || titleMenu, redo: redo, foot: 'A / TAP BUY OR FIT  ·  B BACK',
    html: '<div class="ckgar"><div class="view"><canvas class="ckview"></canvas><div class="bank">DROPS ' + (SV.drops || 0) + '</div></div><div class="side"><div class="tabs">' +
      tabs.map(function (t) { return '<button type="button" class="ckbtn' + (t[0] === tab ? ' on' : '') + '" data-act="t_' + t[0] + '">' + esc(t[1]) + '</button>'; }).join('') + '</div><div class="opts">' + rows + '</div></div></div>',
    acts: acts, after: function (m) { showroom(m.querySelector('.ckview'), function () { return { id: SV.ch, cust: custNow() }; }); var o = m.querySelector('.opt.eq'); if (o && o.scrollIntoView) o.scrollIntoView({ block: 'nearest' }); } });
}
/* the garage sits on the title, under Single Player and Multiplayer */
titleMenu = (function (orig) { return function (page) {
  orig(page); garageCss(); if (page) return; var list = document.querySelector('.ckt .list'), opt = list && list.querySelector('[data-act="opt"]'); if (!opt) return;
  var b = document.createElement('button'); b.type = 'button'; b.className = 'ckbtn'; b.innerHTML = '<b>Garage</b>'; list.insertBefore(b, opt);
  b.addEventListener('click', function (e) { e.stopPropagation(); sfx.play('select'); garage(function () { titleMenu(); }); });
}; })(titleMenu);

/* ---------- online: your parts go with you, so everyone sees everyone's kart ---------- */
function custClean(c) { // only real part ids and real colours get through
  if (!c || typeof c !== 'object') return null; var o = {};
  Object.keys(PARTS).forEach(function (k) { var v = c[k]; o[k] = PARTS[k].list.some(function (p) { return p[0] === v; }) ? v : PARTS[k].list[0][0]; });
  ['c0', 'c1', 'c2'].forEach(function (k) { var v = c[k]; o[k] = PAINT_C.some(function (p) { return p[0] === v; }) ? v : ''; }); return o;
}
function garageSync() { if (typeof NET === 'undefined' || !NET.role) return; if (NET.role === 'client') { netSend({ t: 'ch', ch: SV.ch }); netSend({ t: 'cust', c: custNow() }); } else if (NET.players && NET.players[0]) { NET.players[0].ch = SV.ch; NET.players[0].cust = custNow(); if (typeof hostLobbyPush === 'function') hostLobbyPush(); } }
netMe = (function (orig) { return function () { var p = orig.apply(this, arguments); p.cust = custNow(); return p; }; })(netMe);
hostData = (function (orig) { return function (L, m) {
  if (m && (m.t === 'join' || m.t === 'cust')) { var r = orig.apply(this, arguments); var pi = NET.players.findIndex(function (p) { return p.id === L.remote; }); if (pi >= 0) NET.players[pi].cust = custClean(m.t === 'join' ? m.p && m.p.cust : m.c); return r; }
  return orig.apply(this, arguments); }; })(hostData);
go = (function (orig) { return function (o) { if (typeof NET !== 'undefined' && NET.role === 'host' && NET.sig) o.custs = NET.players.map(function (p, i) { return i ? custClean(p.cust) : custNow(); }); return orig.apply(this, arguments); }; })(go);
startRace = (function (orig) { return function (o) { var r = orig.apply(this, arguments);
  if (RACE && o && o.custs && RACE.all) o.custs.forEach(function (c, i) { var k = RACE.all[i]; if (k && c) k.cust = custClean(c); });
  if (RACE && RACE.me && !RACE.demo && o && o.mode !== 'demo') RACE.me.cust = custNow(); return r; }; })(startRace);
