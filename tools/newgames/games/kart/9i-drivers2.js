/* =====================================================================================================
   THE DRIVERS, SECOND PASS (he said the last ones were awful: blotchy "burn" faces, basic shapes, Cumhead's drip
   joined to his head). What changed:
   - No more faces cut from the little sprites (stretched over a 3D head they turned into blotches). Every face is
     PAINTED cleanly at 128 px in his cartoon style: thick dark lines, big glossy eyes, proper mouths, each with their
     own features (TB's eye patch and grin, Saba's shades and white beard, Joff's moustache, Beeb's ginger beard...).
   - Bodies are rounded (ellipsoids, not boxes), arms have elbows, mitten hands with thumbs.
   - Cumhead's and Spermaid's little drip floats ABOVE the tip, on its own, like his drawings, bobbing gently.
   ===================================================================================================== */
var FACES = {}, FACESLOT = 128;
var K0 = '#12040a';
function fEll(g, x, y, rx, ry, fill, line, lw) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.lineWidth = lw || 3; g.strokeStyle = line; g.stroke(); } }
function fLine(g, pts, w, col) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) { var p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.lineTo(p[0], p[1]); } g.lineWidth = w; g.strokeStyle = col || K0; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function fShape(g, pts, fill, line, lw) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) { var p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.lineTo(p[0], p[1]); } g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.lineWidth = lw || 3; g.strokeStyle = line; g.lineJoin = 'round'; g.stroke(); } }
/* a glossy cartoon eye: white, a big iris/pupil looking slightly forward, two highlights */
function fEye(g, x, y, rx, ry, iris, look) {
  fEll(g, x, y, rx, ry, '#fffaf0', K0, 3); var ix = x + (look || 0) * rx * 0.25;
  fEll(g, ix, y + ry * 0.12, rx * 0.62, ry * 0.72, iris || '#2a1a14'); fEll(g, ix, y + ry * 0.15, rx * 0.34, ry * 0.42, K0);
  fEll(g, ix - rx * 0.25, y - ry * 0.22, rx * 0.2, ry * 0.18, '#ffffff'); fEll(g, ix + rx * 0.22, y + ry * 0.35, rx * 0.09, ry * 0.08, '#ffffff');
}
function fBlush(g, x, y, col) { g.globalAlpha = 0.45; fEll(g, x, y, 9, 5, col || '#ff7a8a'); g.globalAlpha = 1; }
function fSmile(g, x, y, w, open, tongue) { // a big friendly mouth
  if (open) { fShape(g, [[x - w, y], [x, y + w * 0.95, x + w, y], [x, y + w * 0.25, x - w, y]], '#5a0c14', K0, 3); if (tongue) fEll(g, x + w * 0.15, y + w * 0.55, w * 0.42, w * 0.26, '#e0405a'); fShape(g, [[x - w * 0.8, y + 2], [x, y + w * 0.32, x + w * 0.8, y + 2], [x, y + w * 0.18, x - w * 0.8, y + 2]], '#fffaf0'); }
  else fLine(g, [[x - w, y], [x, y + w * 0.6, x + w, y]], 3.5);
}
var FACEPAINT = {
  cumhead: { bg: '#f0c070', f: function (g) { fEye(g, 46, 62, 13, 16, '#2a1a14', 0.3); fEye(g, 82, 62, 13, 16, '#2a1a14', 0.3); fLine(g, [[34, 42], [46, 38, 58, 43]], 3.5); fLine(g, [[70, 43], [82, 38, 94, 42]], 3.5); fSmile(g, 64, 88, 13, false); fBlush(g, 34, 82, '#e8905a'); fBlush(g, 94, 82, '#e8905a'); } },
  spermaid: { bg: '#fff0d8', f: function (g) { // her wink: the left eye a closed curve with lashes, the right open
    fLine(g, [[34, 66], [46, 56, 58, 64]], 4); fLine(g, [[36, 63], [31, 58]], 2.5); fLine(g, [[42, 60], [39, 54]], 2.5);
    fEye(g, 82, 62, 10, 15, '#1a1a1a', 0.2); fLine(g, [[90, 50], [96, 44]], 2.5); fLine(g, [[86, 48], [90, 41]], 2.5);
    fLine(g, [[32, 46], [44, 40, 56, 44]], 3); fLine(g, [[72, 44], [82, 38, 94, 43]], 3); fLine(g, [[60, 72], [56, 77, 62, 79]], 2.5);
    fLine(g, [[44, 86], [62, 98, 82, 84]], 4); fBlush(g, 34, 80, '#ff8aa0'); fBlush(g, 94, 80, '#ff8aa0'); fShape(g, [[100, 58], [96, 66, 100, 70], [104, 66, 100, 58]], '#f0d8a8'); } },
  greebo: { bg: '#f6ecd0', f: function (g) { // a cheeky pie: heavy-lidded eyes, tongue out
    [[46, 60], [82, 60]].forEach(function (e) { fEye(g, e[0], e[1], 12, 14, '#2a1a14', 0); fShape(g, [[e[0] - 13, e[1] - 2], [e[0], e[1] - 20, e[0] + 13, e[1] - 2], [e[0], e[1] - 8, e[0] - 13, e[1] - 2]], '#f6ecd0', K0, 3); });
    fLine(g, [[32, 38], [46, 33, 58, 38]], 4); fLine(g, [[70, 38], [82, 33, 96, 38]], 4); fSmile(g, 64, 84, 18, true, true); } },
  amy: { bg: '#f6d0b0', f: function (g) { fEye(g, 46, 64, 11, 14, '#c4407a', 0.2); fEye(g, 82, 64, 11, 14, '#c4407a', 0.2); fLine(g, [[36, 50], [44, 46, 54, 49]], 3, '#c4407a'); fLine(g, [[74, 49], [84, 46, 92, 50]], 3, '#c4407a');
    [[36, 54], [92, 54]].forEach(function (l, i) { fLine(g, [[l[0], l[1]], [l[0] + (i ? 5 : -5), l[1] - 5]], 2.5); }); fShape(g, [[54, 88], [64, 96, 74, 88], [64, 91, 54, 88]], '#d01848', K0, 2.5); fBlush(g, 36, 80); fBlush(g, 92, 80); fLine(g, [[63, 72], [61, 77]], 2, '#c89070'); } },
  tb: { bg: '#e8c0a0', f: function (g) { // eye patch over one eye and a big toothy grin
    fLine(g, [[18, 44], [110, 58]], 4, '#1a1010'); fEll(g, 46, 60, 14, 12, '#1a1010', K0, 2); fEye(g, 82, 62, 11, 13, '#3a2412', -0.2); fLine(g, [[72, 46], [84, 42, 94, 47]], 4, '#3a2412');
    fLine(g, [[62, 72], [60, 78], [66, 80]], 2.5, '#a87a5a');
    fShape(g, [[40, 88], [64, 106, 88, 86], [64, 92, 40, 88]], '#3a0a0a', K0, 3); for (var t = 0; t < 6; t++) g.fillStyle = '#fffaf0', g.fillRect(45 + t * 6.5, 89 + Math.abs(t - 2.5) * 0.6, 5, 5); } },
  saba: { bg: '#e0b090', f: function (g) { // black shades, a proper nose, white beard over the lower face
    fShape(g, [[22, 52], [106, 52], [104, 66], [76, 70], [66, 60], [62, 60], [52, 70], [24, 66]], '#0e0a0e', K0, 3); fLine(g, [[30, 56], [44, 56]], 3, '#5a5060'); fLine(g, [[80, 56], [94, 56]], 3, '#5a5060');
    fShape(g, [[58, 64], [56, 80], [64, 84], [72, 80], [70, 64]], '#d09878', K0, 2.5);
    fShape(g, [[14, 72], [36, 84, 64, 80], [92, 84, 114, 72], [118, 128], [10, 128]], '#ece6de', K0, 3); fShape(g, [[44, 86], [64, 76, 84, 86], [64, 92, 44, 86]], '#ece6de', K0, 3);
    for (var s = 0; s < 6; s++) fLine(g, [[24 + s * 16, 98], [28 + s * 16, 118]], 2, '#c8c0b8'); } },
  joff: { bg: '#f0c090', f: function (g) { fEye(g, 46, 60, 10, 12, '#3a2418', 0.2); fEye(g, 82, 60, 10, 12, '#3a2418', 0.2); fLine(g, [[32, 44], [46, 39, 58, 45]], 5, '#3a2418'); fLine(g, [[70, 45], [82, 39, 96, 44]], 5, '#3a2418');
    fShape(g, [[64, 64], [58, 78], [66, 80]], null, K0, 2.5); fShape(g, [[34, 86], [50, 76, 64, 82], [78, 76, 94, 86], [80, 90, 64, 86], [48, 90, 34, 86]], '#3a2418', K0, 2.5); fLine(g, [[52, 96], [64, 101, 76, 96]], 3); } },
  kaya: { bg: '#f6d0b0', f: function (g) { fEye(g, 46, 64, 10, 13, '#5a2a14', 0.2); fEye(g, 82, 64, 10, 13, '#5a2a14', 0.2); fLine(g, [[36, 50], [46, 46, 56, 50]], 3, '#8a3a20'); fLine(g, [[72, 50], [82, 46, 92, 50]], 3, '#8a3a20');
    [[36, 56], [92, 56]].forEach(function (l, i) { fLine(g, [[l[0], l[1]], [l[0] + (i ? 5 : -5), l[1] - 4]], 2.5); }); fShape(g, [[52, 88], [64, 82, 76, 88], [64, 98, 52, 88]], '#c4121c', K0, 2.5); fBlush(g, 36, 80); fBlush(g, 92, 80); } },
  beebs: { bg: '#f0c8a0', f: function (g) { // bushy brows, red nose, big ginger beard and moustache
    fEye(g, 46, 58, 10, 11, '#3a5a8a', 0); fEye(g, 82, 58, 10, 11, '#3a5a8a', 0); fShape(g, [[30, 46], [46, 36, 60, 44], [46, 44, 30, 46]], '#a85a20', K0, 2); fShape(g, [[68, 44], [82, 36, 98, 46], [82, 44, 68, 44]], '#a85a20', K0, 2);
    fShape(g, [[10, 66], [30, 76, 50, 74], [64, 80, 78, 74], [98, 76, 118, 66], [120, 128], [8, 128]], '#c8702a', K0, 3); fEll(g, 64, 70, 9, 8, '#e06a5a', K0, 2.5);
    fShape(g, [[34, 82], [50, 74, 64, 82], [78, 74, 94, 82], [78, 90, 64, 86], [50, 90, 34, 82]], '#a85a20', K0, 2.5); for (var s = 0; s < 6; s++) fLine(g, [[22 + s * 17, 96], [26 + s * 17, 120]], 2.5, '#a85a20'); } },
  ali: { bg: '#d8a880', f: function (g) { fEye(g, 46, 62, 10, 13, '#2a1a10', 0.2); fEye(g, 82, 62, 10, 13, '#2a1a10', 0.2); fLine(g, [[34, 46], [46, 42, 58, 46]], 4, '#2a1a10'); fLine(g, [[70, 46], [82, 42, 94, 46]], 4, '#2a1a10'); fLine(g, [[62, 70], [60, 77], [66, 79]], 2.5, '#9a6a4a'); fSmile(g, 64, 86, 15, true, true); } },
  potbelly: { bg: '#ff9ab4', f: function (g) { fEye(g, 44, 56, 9, 11, '#2a1418', 0.1); fEye(g, 84, 56, 9, 11, '#2a1418', 0.1); fLine(g, [[34, 42], [44, 38, 54, 42]], 3.5, '#c4506a'); fLine(g, [[74, 42], [84, 38, 94, 42]], 3.5, '#c4506a'); fSmile(g, 64, 96, 14, false); fBlush(g, 30, 78, '#ff5a80'); fBlush(g, 98, 78, '#ff5a80'); } },
  lab: { bg: '#57300f', f: function (g) { // Shithead Laboozie: big cartoon eyes and a grin on a swirl of poop
    fLine(g, [[10, 30], [64, 20, 118, 30]], 3, '#3a1e08'); fEye(g, 46, 60, 15, 18, '#2a1a14', 0.2); fEye(g, 82, 60, 15, 18, '#2a1a14', 0.2); fLine(g, [[32, 38], [46, 33, 58, 39]], 3.5, '#2a1408'); fLine(g, [[70, 39], [82, 33, 96, 38]], 3.5, '#2a1408');
    fSmile(g, 64, 92, 18, true, true); } },
  kingblum: { bg: '#c4121c', f: function (g) { [[44, 1], [84, -1]].forEach(function (e) { fEll(g, e[0], 60, 13, 10, '#ffe36a', K0, 3); fEll(g, e[0], 62, 4, 7, K0); fShape(g, [[e[0] - 18 * e[1], 40], [e[0] + 16 * e[1], 50], [e[0] + 16 * e[1], 44], [e[0] - 18 * e[1], 34]], K0); });
    fShape(g, [[24, 80], [64, 118, 104, 80], [64, 94, 24, 80]], K0); g.fillStyle = '#f1e7d0'; for (var t = 0; t < 8; t++) g.fillRect(33 + t * 8, 84 + Math.abs(t - 3.5) * 0.8, 5, 7); } }
};
/* the faces join the old driver texture (which keeps the cat, the Gloop and Blumhead) on a bigger sheet */
var DRVTEX2 = null;
driverTex = (function (orig) { return function () {
  if (DRVTEX2) return DRVTEX2; var t = orig(); if (!t || !t.canvas) return t;
  var c = document.createElement('canvas'); c.width = c.height = 1024; var g = c.getContext('2d'); g.drawImage(t.canvas, 0, 0);
  Object.keys(DRVT).forEach(function (k) { var r = DRVT[k]; DRVT[k] = [r[0] / 2, r[1] / 2, r[2] / 2, r[3] / 2]; });
  var n = 0; Object.keys(FACEPAINT).forEach(function (id) {
    var x = (n % 8) * FACESLOT, y = 512 + Math.floor(n / 8) * FACESLOT; n++; var P = FACEPAINT[id];
    g.save(); g.beginPath(); g.rect(x, y, FACESLOT, FACESLOT); g.clip(); g.translate(x, y); var D = DRV3D[id] || {}; g.fillStyle = id === 'greebo' ? P.bg : (D.skin || (id === 'spermaid' ? '#fff0d8' : D.col) || P.bg); g.fillRect(0, 0, FACESLOT, FACESLOT); g.translate(64, 66); g.scale(1.14, 1.14); g.translate(-64, -66); P.f(g); g.restore();
    FACES[id] = [(x + 1) / 1024, (y + 1) / 1024, (FACESLOT - 2) / 1024, (FACESLOT - 2) / 1024];
  });
  DRVTEX2 = R3.texture(c, true); DRVTEX2.canvas = c; DRVTEX = DRVTEX2; return DRVTEX2;
}; })(driverTex);

/* hair, clothes and extras for each person */
HAIR = {
  amy: { style: 'long', fringe: 1, bow: '#c4121c', top: '#c4121c', front: '#f1e7d0', legs: '#34507a' },
  tb: { style: 'short', top: '#5a3a20', collar: '#3a2412', scarf: '#8a1a1a' },
  saba: { style: 'none', beard: '#ece6de', longbeard: 1, top: '#3a8a2a' },
  joff: { style: 'short', top: '#f6f0e4', scarf: '#c4121c' },
  kaya: { style: 'long', fringe: 1, side: 1, top: '#c4121c', front: '#f1e7d0' },
  beebs: { style: 'short', beard: '#c8702a', braids: 1, top: '#7a4a20', belt: '#3a2010', buckle: '#c8903a' },
  ali: { style: 'short', bandana: '#3a9a2a', top: '#f1e7d0' }
};
/* a mitten hand with a thumb, gripping */
function mitt(m, fr, W, f, s, u, col, sd) { ball2(m, fr, W, f, s, u, 0.085, 0.075, 0.075, col, 8, { rings: 4 }); ball2(m, fr, W, f + 0.02, s - sd * 0.06, u + 0.05, 0.035, 0.03, 0.04, col, 6, { rings: 3 }); }
function arms(m, fr, W, sh, up, fore, hand, wob, thick) {
  thick = thick || 1;
  [-1, 1].forEach(function (sd) {
    var S = [-0.24, sd * sh, 0.88], E = [0.04, sd * (sh - 0.02), 0.66], H = [0.4, sd * 0.15 + sd * wob, 0.64 + sd * wob];
    ball2(m, fr, W, S[0], S[1], S[2], 0.11 * thick, 0.11 * thick, 0.1 * thick, up, 8, { rings: 5 });
    tube(m, fr, W, S, E, 0.085 * thick, 0.075 * thick, up, 8); ball2(m, fr, W, E[0], E[1], E[2], 0.077 * thick, 0.077 * thick, 0.077 * thick, up, 7, { rings: 4 });
    tube(m, fr, W, E, H, 0.07 * thick, 0.062 * thick, fore, 8); mitt(m, fr, W, H[0] + 0.02, H[1], H[2], hand, sd);
  });
}
/* the little drip that floats above Cumhead and Spermaid, apart from the head, bobbing */
function drip(m, fr, W, f, u, col, t) { var b = Math.sin(t * 3) * 0.03; ball2(m, fr, W, f, 0, u + b, 0.075, 0.075, 0.08, col, 8, { rings: 5 }); tube(m, fr, W, [f, 0, u + b + 0.05], [f - 0.01, 0, u + b + 0.17], 0.06, 0.0, col, 8); }

var DLOD = 1; // far karts get rounder shapes built from fewer pieces, so the phone keeps its frame rate
function driver3D(m, k, fr) {
  var ce = R3.cam && R3.cam.eye; DLOD = ce && k.x !== undefined && !k.c.showroom ? (Math.hypot(k.x - ce[0], k.z - ce[2]) > 20 ? 0.5 : 1) : 1;
  var d = DRV3D[k.c.id] || DRV3D.cumhead, id = k.c.id, H = HAIR[id] || {}, W = DRVT.white, R = RACE, t = R ? R.t : 0, wob = Math.sin((k.steerVis || 0) * 1.2) * 0.06;
  var FT = FACES[id], face = FT ? { T: FT, fz: 0.12, w: 0.9, h: 0.92, dv: 0.0 } : null;
  if (d.kind === 'cat') { // Sir Johnathan: loaf body, white chest and paws, his own face, ears, swishing tail
    ball2(m, fr, W, -0.3, 0, 0.66, 0.44, 0.32, 0.32, '#1a1418', 12, { rings: 6 }); ball2(m, fr, W, -0.06, 0, 0.66, 0.2, 0.2, 0.24, '#f1e7d0', 10, { front: -0.2 });
    [-1, 1].forEach(function (sd) { ball2(m, fr, W, 0.2, sd * 0.14, 0.5, 0.09, 0.08, 0.07, '#f1e7d0', 8, { rings: 4 }); });
    ball(m, fr, W, -0.16, 0, 1.1, 0.32, 0.34, 0.29, '#1a1418', 12, { rings: 8, face: { T: DRVT.cat, fz: 0.3, w: 0.9, h: 0.9 } });
    [-1, 1].forEach(function (sd) { tube(m, fr, W, [-0.2, sd * 0.17, 1.3], [-0.24, sd * 0.24, 1.62], 0.11, 0.0, '#1a1418', 6); tube(m, fr, W, [-0.18, sd * 0.18, 1.33], [-0.21, sd * 0.23, 1.54], 0.05, 0.0, '#c86a8a', 6); });
    var sw = Math.sin(t * 3) * 0.2; tube(m, fr, W, [-0.66, 0, 0.62], [-0.9, sw, 0.9], 0.07, 0.06, '#1a1418', 7); tube(m, fr, W, [-0.9, sw, 0.9], [-0.96, sw * 1.6, 1.22], 0.06, 0.04, '#1a1418', 7); return;
  }
  if (id === 'lab') { // Shithead Laboozie: black hoodie, white gloves, a swirl of poop for a head with his painted face on the bottom coil
    var PB = '#57300f', PB2 = '#6e3e14';
    ball2(m, fr, W, -0.26, 0, 0.7, 0.21, 0.28, 0.3, '#1e1a20', 12, { rings: 6 }); ball2(m, fr, W, -0.4, 0, 0.96, 0.12, 0.22, 0.12, '#262228', 10, { rings: 4 }); // body and the hood down his back
    hull(m, fr, W, bx(-0.06, -0.04, -0.06, -0.04, 0.72, 0.94), '#d8d0c0'); hull(m, fr, W, bx(-0.06, -0.04, 0.04, 0.06, 0.72, 0.94), '#d8d0c0');
    arms(m, fr, W, 0.28, '#1e1a20', '#1e1a20', '#f4f0ec', wob);
    var lf = -0.22, lu = 1.28; tube(m, fr, W, [lf, 0, 0.98], [lf, 0, 1.08], 0.12, 0.12, PB, 9);
    ball(m, fr, W, lf, 0, lu, 0.44, 0.46, 0.3, PB, DLOD < 1 ? 8 : 12, { rings: DLOD < 1 ? 5 : 8, face: FT ? { T: FT, fz: 0.15, w: 0.92, h: 0.9 } : null });
    ball2(m, fr, W, lf - 0.04, 0, lu + 0.3, 0.32, 0.34, 0.2, PB2, 12, { rings: 6 }); ball2(m, fr, W, lf - 0.06, 0, lu + 0.52, 0.22, 0.23, 0.15, PB, 10, { rings: 5 });
    tube(m, fr, W, [lf - 0.06, 0, lu + 0.6], [lf - 0.12, 0.05, lu + 0.82], 0.12, 0.0, PB2, 8); return;
  }
  if (id === 'greebo') { // the cream pie, with his painted face now
    var CR = '#d8943a', CR2 = '#b8742a';
    ball2(m, fr, W, -0.26, 0, 0.68, 0.22, 0.3, 0.3, '#1e1a1c', 12, { rings: 6 }); // black apron body
    [[0.88, 0.9, -0.11, 0.1], [0.6, 0.62, -0.11, 0.1], [0.73, 0.75, 0, 0.1]].forEach(function (b) { hull(m, fr, W, bx(-0.05, -0.03, b[2], b[3], b[0], b[1]), '#c4121c'); }); hull(m, fr, W, bx(-0.05, -0.03, -0.11, -0.08, 0.6, 0.9), '#c4121c'); hull(m, fr, W, bx(-0.05, -0.03, 0.07, 0.1, 0.6, 0.75), '#c4121c');
    arms(m, fr, W, 0.3, '#f6f0e4', '#f6f0e4', '#ffffff', wob, 1.05);
    var pf = -0.16, pu = 1.38, PR = 0.44;
    tube(m, fr, W, [pf - 0.16, 0, pu], [pf + 0.02, 0, pu], PR * 0.92, PR, CR2, 16, { cap0: CR2 });
    ball(m, fr, W, pf + 0.04, 0, pu, 0.13, PR * 0.9, PR * 0.9, '#f6ecd0', DLOD < 1 ? 8 : 12, { rings: DLOD < 1 ? 5 : 8, face: FT ? { T: FT, fz: 0.0, w: 0.98, h: 0.98 } : null });
    for (var cr = 0, CN = DLOD < 1 ? 10 : 16; cr < CN; cr++) { var ca = cr / CN * Math.PI * 2; ball2(m, fr, W, pf + 0.02, Math.cos(ca) * PR * 0.98, pu + Math.sin(ca) * PR * 0.98, 0.08, 0.08, 0.08, cr % 2 ? CR : CR2, 7, { rings: 4 }); }
    var hc0 = d.hatc || '#f6f0e4'; tube(m, fr, W, [pf - 0.06, 0, pu + 0.36], [pf - 0.06, 0, pu + 0.56], 0.3, 0.33, hc0, 12);
    [0, 1, 2, 3, 4].forEach(function (j) { var a = j / 5 * Math.PI * 2; ball2(m, fr, W, pf - 0.06 + Math.cos(a) * 0.2, Math.sin(a) * 0.2, pu + 0.72, 0.21, 0.21, 0.19, hc0, 9, { rings: 5 }); }); ball2(m, fr, W, pf - 0.06, 0, pu + 0.84, 0.25, 0.25, 0.17, hc0, 10, { rings: 5 });
    return;
  }
  var mermaid = id === 'spermaid', drop = d.kind === 'drop' || d.kind === 'blob', hand = d.hand || '#f0c8a0', skin = d.skin || d.col;
  // ---- bodies: rounded ----
  if (mermaid) {
    ball2(m, fr, W, -0.26, 0, 0.7, 0.15, 0.18, 0.28, '#fff0d8', 12, { rings: 6 });
    [-1, 1].forEach(function (sd) { ball2(m, fr, W, -0.14, sd * 0.085, 0.8, 0.07, 0.09, 0.075, '#16121a', 9, { rings: 5 }); });
    var tw = Math.sin(t * 2.4) * 0.05;
    tube(m, fr, W, [-0.28, 0, 0.5], [-0.6, tw, 0.64], 0.17, 0.15, '#1aa0b0', 10); ball2(m, fr, W, -0.6, tw, 0.64, 0.15, 0.15, 0.15, '#1898ac', 9, { rings: 5 });
    tube(m, fr, W, [-0.6, tw, 0.64], [-0.8, tw * 1.5, 0.96], 0.15, 0.1, '#1890a8', 10); ball2(m, fr, W, -0.8, tw * 1.5, 0.96, 0.1, 0.1, 0.1, '#1088a0', 8, { rings: 4 }); tube(m, fr, W, [-0.8, tw * 1.5, 0.96], [-0.83, tw * 2, 1.2], 0.1, 0.06, '#0a7088', 9);
    [-1, 1].forEach(function (sd) { hull(m, fr, W, [[-0.86, tw * 2, 1.18], [-0.78, tw * 2, 1.18], [-0.78, tw * 2 + 0.02 * sd, 1.22], [-0.86, tw * 2 + 0.02 * sd, 1.22], [-1.02, tw * 2 + sd * 0.32, 1.56], [-0.86, tw * 2 + sd * 0.28, 1.52], [-0.86, tw * 2 + sd * 0.3, 1.56], [-1.02, tw * 2 + sd * 0.34, 1.6]], '#f0107a'); });
    arms(m, fr, W, 0.19, '#fff0d8', '#fff0d8', '#fff0d8', wob, 0.85);
  } else if (d.kind === 'pig') {
    ball2(m, fr, W, -0.26, 0, 0.66, 0.26, 0.34, 0.32, d.col, 12, { rings: 6 }); ball2(m, fr, W, -0.25, 0, 0.72, 0.27, 0.35, 0.27, d.body, 12, { rings: 4, b0: 0, b1: 1.6 });
    arms(m, fr, W, 0.32, d.col, d.col, d.col, wob);
  } else if (drop) {
    var bodyc = d.body || d.col; ball2(m, fr, W, -0.26, 0, 0.7, 0.2, 0.27, 0.3, bodyc, 12, { rings: 6 });
    if (d.trim) { tube(m, fr, W, [-0.28, 0, 0.92], [-0.28, 0, 1.06], 0.22, 0.26, d.trim, 12); hull(m, fr, W, bx(-0.08, -0.05, -0.03, 0.03, 0.5, 0.94), d.trim); }
    if (d.cape) ball2(m, fr, W, -0.4, 0, 0.7, 0.14, 0.34, 0.36, d.cape, 12, { rings: 6, back: 0.1 });
    arms(m, fr, W, 0.28, d.arm || bodyc, d.arm || bodyc, hand, wob);
  } else {
    var top = H.top || d.body, wide = id === 'beebs' ? 0.04 : id === 'amy' || id === 'kaya' ? -0.03 : 0;
    ball2(m, fr, W, -0.26, 0, 0.7, 0.2 + wide, 0.26 + wide, 0.3, top, 12, { rings: 6 });
    if (H.front) ball2(m, fr, W, -0.25, 0, 0.66, 0.205 + wide, 0.18, 0.24, H.front, 10, { rings: 5, front: 0.45 });
    if (H.belt) { tube(m, fr, W, [-0.26, 0, 0.5], [-0.26, 0, 0.58], 0.25 + wide, 0.26 + wide, H.belt, 12); hull(m, fr, W, bx(-0.06, -0.03, -0.05, 0.05, 0.5, 0.58), H.buckle); }
    if (H.scarf) tube(m, fr, W, [-0.24, 0, 0.92], [-0.24, 0, 1.02], 0.16, 0.15, H.scarf, 10);
    else if (H.collar) tube(m, fr, W, [-0.24, 0, 0.92], [-0.24, 0, 1.0], 0.17, 0.16, H.collar, 10);
    var sleeve = top, fore = id === 'tb' || id === 'saba' || id === 'beebs' ? top : skin;
    arms(m, fr, W, 0.27 + wide, sleeve, fore, hand, wob);
  }
  // ---- heads ----
  if (drop) {
    var hf = -0.24, hu = 1.36, col = mermaid ? '#fff0d8' : d.col, tex = d.kind === 'blob' ? { T: DRVT.blob, fz: 0.25 } : d.ownface ? { T: DRVT[d.ownface], fz: 0.2 } : face;
    tube(m, fr, W, [hf, 0, 0.98], [hf, 0, 1.1], 0.13, 0.13, col, 9);
    ball(m, fr, W, hf, 0, hu, 0.42, 0.42, 0.4, col, DLOD < 1 ? 8 : 12, { rings: DLOD < 1 ? 5 : 8, face: tex, tip: d.tip || 0 });
    if (d.tip) { tube(m, fr, W, [hf - 0.02, 0, hu + 0.33], [hf - 0.07, 0, hu + 0.58], 0.15, 0.0, col, 10); if (id === 'cumhead' || mermaid) drip(m, fr, W, hf - 0.1, hu + 0.74, col, t + (mermaid ? 1 : 0)); } // the tip, then the drip on its own above it
  } else {
    var hf = -0.22, hu = 1.36, Rh = 0.37, hc = d.hair || '#3a2418', HC = H.style || 'short';
    tube(m, fr, W, [hf, 0, 0.94], [hf, 0, 1.06], 0.11, 0.11, skin, 9);
    ball(m, fr, W, hf, 0, hu, Rh, Rh * 1.02, Rh * 1.04, skin, DLOD < 1 ? 8 : 12, { rings: DLOD < 1 ? 5 : 8, face: face });
    if (d.kind === 'pig') {
      tube(m, fr, W, [hf + 0.3, 0, hu - 0.1], [hf + 0.44, 0, hu - 0.1], 0.14, 0.13, '#ff7a9a', 12, { cap: '#ff8aa8' });
      [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf + 0.45, sd * 0.05, hu - 0.1, 0.012, 0.028, 0.04, '#8a2a40', 6, { rings: 3 }); hull(m, fr, W, [[hf - 0.06, sd * 0.2, hu + 0.24], [hf + 0.1, sd * 0.2, hu + 0.24], [hf + 0.1, sd * 0.26, hu + 0.24], [hf - 0.06, sd * 0.26, hu + 0.24], [hf + 0.04, sd * 0.38, hu + 0.46], [hf + 0.16, sd * 0.36, hu + 0.4], [hf + 0.16, sd * 0.4, hu + 0.4], [hf + 0.04, sd * 0.42, hu + 0.46]], d.col); });
    } else {
      [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf - 0.02, sd * Rh * 0.98, hu - 0.02, 0.06, 0.05, 0.09, skin, 8, { rings: 4 }); });
      if (HC !== 'none') {
        ball2(m, fr, W, hf - 0.02, 0, hu + 0.02, Rh * 1.07, Rh * 1.08, Rh * 1.07, hc, 14, { rings: 6, b0: 0, b1: d.hat ? 1.0 : 1.15 });
        ball2(m, fr, W, hf - 0.04, 0, hu - 0.02, Rh * 1.06, Rh * 1.07, Rh * 1.06, hc, 14, { rings: 7, b0: 0.3, b1: 2.3, back: -0.05 });
        if (!d.hat || d.hat === 'cowboy') { var nf = H.fringe ? 6 : 4; for (var j = 0; j < nf; j++) { var a = (j / (nf - 1) - 0.5) * (H.fringe ? 1.6 : 1.2); ball2(m, fr, W, hf + Math.cos(a) * Rh * 0.92, Math.sin(a) * Rh * 0.94, hu + Rh * (H.fringe ? 0.52 : 0.64), 0.07, 0.1, H.fringe ? 0.12 : 0.08, hc, 8, { rings: 4 }); } }
        if (HC === 'long') { ball2(m, fr, W, hf - 0.2, 0, hu - 0.34, 0.2, Rh * 1.02, 0.5, hc, 12, { rings: 7 }); [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf + 0.04, sd * Rh * 0.94, hu - 0.2, 0.1, 0.09, 0.34, hc, 9, { rings: 6 }); }); if (H.bow) [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf - 0.1, sd * 0.12, hu + Rh * 1.02, 0.05, 0.1, 0.07, H.bow, 8, { rings: 4 }); }); }
      }
      if (H.bandana) { tube(m, fr, W, [hf - 0.02, 0, hu + 0.16], [hf - 0.02, 0, hu + 0.26], Rh * 1.1, Rh * 1.08, H.bandana, 14); [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf - 0.38, 0, hu + 0.2], [hf - 0.56, sd * 0.12, hu + 0.04], 0.05, 0.03, H.bandana, 6); }); }
      if (H.braids) [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf + 0.04, sd * 0.3, hu - 0.3], [hf + 0.14, sd * 0.3, hu - 0.72], 0.06, 0.05, H.beard, 7); });
      if (H.beard) { ball2(m, fr, W, hf + 0.02, 0, hu - 0.2, Rh * 0.9, Rh * 1.06, Rh * 0.7, H.beard, 14, { rings: 5, b0: 1.7, b1: 3.0, back: 0.45 }); ball2(m, fr, W, hf + 0.1, 0, hu - 0.46, 0.2, 0.25, H.longbeard ? 0.32 : 0.2, H.beard, 10, { rings: 5 }); }
    }
    if (d.hat === 'chef') { tube(m, fr, W, [hf, 0, hu + 0.24], [hf, 0, hu + 0.44], Rh * 1.02, Rh * 1.06, d.hatc, 12); [0, 1, 2, 3, 4].forEach(function (j) { var a = j / 5 * Math.PI * 2; ball2(m, fr, W, hf + Math.cos(a) * 0.2, Math.sin(a) * 0.2, hu + 0.6, 0.2, 0.2, 0.18, d.hatc, 9, { rings: 5 }); }); ball2(m, fr, W, hf, 0, hu + 0.72, 0.24, 0.24, 0.16, d.hatc, 10, { rings: 5 }); }
    if (d.hat === 'cowboy') {
      for (var j2 = 0; j2 < 16; j2++) { var a3 = j2 / 16 * Math.PI * 2, a4 = (j2 + 1) / 16 * Math.PI * 2, up = function (a) { return Math.abs(Math.sin(a)) * 0.12; };
        hull(m, fr, W, [[hf + Math.cos(a3) * 0.3, Math.sin(a3) * 0.3, hu + 0.22], [hf + Math.cos(a3) * 0.64, Math.sin(a3) * 0.66, hu + 0.22 + up(a3)], [hf + Math.cos(a4) * 0.64, Math.sin(a4) * 0.66, hu + 0.22 + up(a4)], [hf + Math.cos(a4) * 0.3, Math.sin(a4) * 0.3, hu + 0.22], [hf + Math.cos(a3) * 0.3, Math.sin(a3) * 0.3, hu + 0.25], [hf + Math.cos(a3) * 0.64, Math.sin(a3) * 0.66, hu + 0.25 + up(a3)], [hf + Math.cos(a4) * 0.64, Math.sin(a4) * 0.66, hu + 0.25 + up(a4)], [hf + Math.cos(a4) * 0.3, Math.sin(a4) * 0.3, hu + 0.25]], d.hatc); }
      tube(m, fr, W, [hf, 0, hu + 0.24], [hf, 0, hu + 0.56], 0.3, 0.26, d.hatc, 12, { cap: d.hatc }); tube(m, fr, W, [hf, 0, hu + 0.25], [hf, 0, hu + 0.33], 0.305, 0.3, '#2a1a0c', 12); hull(m, fr, W, bx(hf - 0.18, hf + 0.18, -0.03, 0.03, hu + 0.5, hu + 0.58), '#3a2410');
    }
    if (d.hat === 'beanie') { var hcs = d.hatcols; [[0, 0.45, 0], [0.45, 0.8, 1], [0.8, 1.15, 2]].forEach(function (b) { ball2(m, fr, W, hf, 0, hu + 0.14, Rh * 1.1, Rh * 1.1, Rh * 1.14, hcs[b[2]], 14, { rings: 2, b0: b[0], b1: b[1] }); }); tube(m, fr, W, [hf, 0, hu + 0.12], [hf, 0, hu + 0.2], Rh * 1.12, Rh * 1.12, hcs[0], 14); ball2(m, fr, W, hf, 0, hu + 0.6, 0.1, 0.1, 0.1, hcs[1], 8, { rings: 4 }); }
    if (d.hat === 'viking') { ball2(m, fr, W, hf, 0, hu + 0.16, Rh * 1.1, Rh * 1.1, Rh * 1.1, d.hatc, 14, { rings: 5, b0: 0, b1: 1.25 }); tube(m, fr, W, [hf, 0, hu + 0.2], [hf, 0, hu + 0.28], Rh * 1.12, Rh * 1.12, '#c8903a', 14);
      [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf, sd * 0.34, hu + 0.24], [hf + 0.08, sd * 0.56, hu + 0.42], 0.09, 0.06, '#f1e7d0', 8); tube(m, fr, W, [hf + 0.08, sd * 0.56, hu + 0.42], [hf + 0.18, sd * 0.6, hu + 0.72], 0.06, 0.0, '#f1e7d0', 8); }); }
  }
  if (d.crown) { var hu2 = 1.36; tube(m, fr, W, [-0.24, 0, hu2 + 0.3], [-0.24, 0, hu2 + 0.46], 0.3, 0.3, '#ffe36a', 12); for (var j3 = 0; j3 < 5; j3++) { var a5 = j3 / 5 * Math.PI * 2; tube(m, fr, W, [-0.24 + Math.cos(a5) * 0.26, Math.sin(a5) * 0.26, hu2 + 0.46], [-0.24 + Math.cos(a5) * 0.26, Math.sin(a5) * 0.26, hu2 + 0.66], 0.06, 0.0, '#ffe36a', 6); ball2(m, fr, W, -0.24 + Math.cos(a5) * 0.3, Math.sin(a5) * 0.3, hu2 + 0.38, 0.03, 0.03, 0.03, '#c4121c', 5, { rings: 3 }); } }
}

/* ---------- speed: in a race each driver is built once, kept on the graphics card, and placed with a matrix ----------
   (building eight detailed drivers every frame cost more than the whole track; the turntable still builds them live) */
var DRVCACHE = {}, DRVQ = [];
var _drvBuild = driver3D;
driver3D = function (m, k, fr) {
  var R = RACE; if (!R || !R.karts || R.karts.indexOf(k) < 0 || (R.ghosts && k !== R.me) || !R3.ok) return _drvBuild(m, k, fr);
  var L = fr.L || [0.6, 0.6, 0.6], ce = R3.cam && R3.cam.eye, far = ce ? Math.hypot(k.x - ce[0], k.z - ce[2]) > 20 : false;
  var key = k.c.id + '|' + L.map(function (v) { return v.toFixed(2); }).join(',') + (far ? 'L' : 'H'), mesh = DRVCACHE[key];
  if (!mesh) { var lf = Frame(0, 0, 0, 0, 0, 1, L, 1), mm = new R3.Mesh(), keep = R.karts; DLOD = far ? 0.5 : 1; var k2 = { c: k.c, steerVis: 0, x: undefined, cust: k.cust }; _drvBuildLocal(mm, k2, lf); mesh = DRVCACHE[key] = mm.n ? mm.upload() : mm; }
  var o = fr.P(0, 0, 0), F = fr.P(1, 0, 0), S = fr.P(0, 1, 0), U = fr.P(0, 0, 1), M = new Float32Array(16);
  M[0] = F[0] - o[0]; M[1] = F[1] - o[1]; M[2] = F[2] - o[2]; M[4] = U[0] - o[0]; M[5] = U[1] - o[1]; M[6] = U[2] - o[2]; M[8] = S[0] - o[0]; M[9] = S[1] - o[1]; M[10] = S[2] - o[2]; M[12] = o[0]; M[13] = o[1]; M[14] = o[2]; M[15] = 1;
  DRVQ.push({ mesh: mesh, M: M });
};
function _drvBuildLocal(m, k, fr) { var r = RACE; RACE = null; try { _drvBuild(m, k, fr); } finally { RACE = r; } } // built outside the race, so nothing animates into the kept shape
/* the local frame maps (f, s, u) to (x = f, y = u, z = s); the matrix's columns are the kart's forward, up and side */
drawRace = (function (orig) { return function () {
  DRVQ = []; var r = orig.apply(this, arguments);
  if (DRVQ.length && R3.ok && R3.cam && R3.cam.m) { var tx = driverTex(); if (tx) { DRVQ.forEach(function (q) { if (!q.mesh.count) return; R3.setMatrix(R3.mul(R3.cam.m, q.M)); R3.draw(q.mesh, tx); }); R3.setMatrix(R3.cam.m); } }
  return r; }; })(drawRace);
