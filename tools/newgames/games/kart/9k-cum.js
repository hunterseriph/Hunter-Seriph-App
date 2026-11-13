/* =====================================================================================================
   Update 152 (his ask: Cumhead in the kart the same as the 3D model in the other games): pale cream droplet head with his
   face from the shared model, the tip curling over to the left as you face him and the little drop floating above and
   beyond it, its tail flicking down to the tip; black T-shirt with the red HUNTER SERIPH print, black long sleeves,
   white cartoon gloves with flared cuffs, black trip pants with red straps, a silver chain and D-rings, platform boots
   with red welts on the pedals. Here +s is the left as you face him (the face texture's left).
   ===================================================================================================== */
FACEPAINT.cumhead = { bg: '#f3dfa8', f: function (g) {
  function eye(x, y) { fEll(g, x, y, 15, 20, '#fffaf0', K0, 5); fEll(g, x + 3, y + 5, 10, 13, K0);
    g.fillStyle = '#fffaf0'; g.beginPath(); g.moveTo(x + 3, y + 5); g.lineTo(x - 7, y - 4); g.lineTo(x + 1, y - 9); g.closePath(); g.fill(); }
  eye(46, 60); eye(84, 58);
  fLine(g, [[30, 34], [42, 26, 56, 32]], 5); fLine(g, [[72, 30], [86, 24, 98, 32]], 5);
  fLine(g, [[40, 90], [66, 110, 98, 88]], 5); fLine(g, [[96, 84], [104, 86, 100, 94]], 4);
  fLine(g, [[104, 70], [114, 76, 106, 86]], 4);
  g.globalAlpha = 0.5; fShape(g, [[22, 66], [16, 80, 22, 86], [28, 80, 22, 66]], '#f9ecc4', '#c8a868', 2); g.globalAlpha = 1;
  g.globalAlpha = 0.35; fEll(g, 30, 84, 8, 5, '#e8a070'); fEll(g, 100, 80, 8, 5, '#e8a070'); g.globalAlpha = 1;
} };
FACEPAINT.cumshirt = { bg: '#121014', f: function (g) { // the shirt print, read on the chest
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#c4121c';
  function fit(t, y, px) { g.font = px + 'px "Pirata One", serif'; var w = g.measureText(t).width; g.save(); g.translate(64, y); if (w > 96) g.scale(96 / w, 1); g.fillText(t, 0, 0); g.restore(); }
  fit('HUNTER', 54, 32); fit('SERIPH', 82, 29);
  g.strokeStyle = '#c4121c'; g.lineWidth = 2; g.lineCap = 'round';
  [[14, 34, 4, 26], [114, 34, 124, 26], [12, 66, 2, 72], [116, 66, 126, 72]].forEach(function (s) { g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[2], s[3]); g.stroke(); });
  for (var i = 0; i < 9; i++) { var x = 26 + i * 9.5 + (i % 2) * 3, l = 6 + ((i * 37) % 13); g.fillRect(x, 86, 2, l); g.beginPath(); g.arc(x + 1, 86 + l + 2, 2.2, 0, 6.3); g.fill(); }
} };
DRV3D.cumhead.col = '#f3dfa8';

function cumKart(m, k, fr) {
  var W = DRVT.white, t = RACE ? RACE.t : 0, wob = Math.sin((k.steerVis || 0) * 1.2) * 0.06, lo = DLOD < 1;
  var BLK = '#121014', PNT = '#0c0a0c', SLV = '#bdb6aa', RED = '#c4121c', CR = '#f3dfa8', GLV = '#fffaf0';
  // trip pants: hips, thighs up to the knees, red straps round each thigh and one between them, a chain swinging off each hip
  ball2(m, fr, W, -0.25, 0, 0.5, 0.24, 0.3, 0.16, PNT, 12, { rings: 5 });
  [-1, 1].forEach(function (sd) {
    tube(m, fr, W, [-0.18, sd * 0.15, 0.5], [0.2, sd * 0.17, 0.64], 0.125, 0.115, PNT, 9);
    ball2(m, fr, W, 0.2, sd * 0.17, 0.64, 0.12, 0.12, 0.12, PNT, 9, { rings: 4 });
    tube(m, fr, W, [0.2, sd * 0.17, 0.64], [0.36, sd * 0.18, 0.4], 0.11, 0.1, PNT, 9); // shins down to the pedals
    tube(m, fr, W, [0.0, sd * 0.16, 0.565], [0.04, sd * 0.16, 0.58], 0.132, 0.13, RED, 9); // strap round the thigh
    tube(m, fr, W, [0.26, sd * 0.175, 0.52], [0.29, sd * 0.177, 0.47], 0.112, 0.11, RED, 9); // strap under the knee
    if (!lo) { // the chain: links hanging in a loop from the back of the hip to the front, a D-ring where it starts
      for (var i = 0; i <= 7; i++) { var q = i / 7, f = -0.32 + q * 0.34, u = 0.5 - Math.sin(q * Math.PI) * 0.12; ball2(m, fr, W, f, sd * (0.31 - q * 0.02), u, 0.022, 0.016, 0.022, SLV, 5, { rings: 3 }); }
      tube(m, fr, W, [-0.33, sd * 0.3, 0.54], [-0.33, sd * 0.31, 0.47], 0.03, 0.03, SLV, 6);
    }
    // platform boots on the pedals: a round shiny toe, a thick sole with a red welt
    ball2(m, fr, W, 0.44, sd * 0.18, 0.34, 0.12, 0.085, 0.08, '#0e0b0e', 9, { rings: 4 });
    tube(m, fr, W, [0.32, sd * 0.18, 0.27], [0.56, sd * 0.18, 0.27], 0.075, 0.07, '#1a1418', 8, { cap: '#1a1418', cap0: '#1a1418' });
    tube(m, fr, W, [0.33, sd * 0.18, 0.3], [0.55, sd * 0.18, 0.3], 0.078, 0.074, RED, 8);
  });
  tube(m, fr, W, [-0.06, -0.12, 0.58], [-0.06, 0.12, 0.58], 0.02, 0.02, RED, 6); // the strap between the legs
  // T-shirt with the print, collar
  ball(m, fr, W, -0.26, 0, 0.74, 0.21, 0.27, 0.28, BLK, 12, { rings: 6, face: FACES.cumshirt ? { T: FACES.cumshirt, fz: 0.35, w: 0.78, h: 0.82, dv: 0.04 } : null });
  tube(m, fr, W, [-0.25, 0, 0.94], [-0.25, 0, 1.0], 0.15, 0.13, '#0a080a', 10);
  // black long sleeves, white gloves with a flared cuff at each wrist
  arms(m, fr, W, 0.28, BLK, BLK, GLV, wob);
  [-1, 1].forEach(function (sd) { var E = [0.04, sd * 0.26, 0.66], H = [0.4, sd * 0.15 + sd * wob, 0.64 + sd * wob], a = 0.7, b = 0.86;
    tube(m, fr, W, [E[0] + (H[0] - E[0]) * a, E[1] + (H[1] - E[1]) * a, E[2] + (H[2] - E[2]) * a], [E[0] + (H[0] - E[0]) * b, E[1] + (H[1] - E[1]) * b, E[2] + (H[2] - E[2]) * b], 0.064, 0.09, GLV, 9, { cap: '#e8e2d6' }); });
  // the head: neck, droplet with his face, the tip curling over to the left as you face him
  var hf = -0.24, hu = 1.36;
  tube(m, fr, W, [hf, 0, 0.98], [hf, 0, 1.1], 0.12, 0.12, CR, 9);
  ball(m, fr, W, hf, 0, hu, 0.42, 0.42, 0.4, CR, lo ? 8 : 12, { rings: lo ? 5 : 8, face: FACES.cumhead ? { T: FACES.cumhead, fz: 0.12, w: 0.9, h: 0.92, dv: 0.0 } : null, tip: 0.45 });
  tube(m, fr, W, [hf - 0.02, 0, hu + 0.36], [hf - 0.04, 0.06, hu + 0.54], 0.12, 0.065, CR, 10);
  tube(m, fr, W, [hf - 0.04, 0.06, hu + 0.54], [hf - 0.04, 0.22, hu + 0.6], 0.065, 0.024, CR, 8);
  ball2(m, fr, W, hf - 0.04, 0.22, hu + 0.6, 0.024, 0.022, 0.022, CR, 6, { rings: 3 });
  // the little drop, apart from the tip, above and beyond it, its tail flicking down towards it
  var b = Math.sin(t * 3) * 0.025, ds = 0.36, du = hu + 0.86 + b;
  ball2(m, fr, W, hf - 0.04, ds, du, 0.085, 0.085, 0.09, CR, 9, { rings: 5 });
  tube(m, fr, W, [hf - 0.04, ds - 0.035, du - 0.06], [hf - 0.04, ds - 0.08, du - 0.14], 0.055, 0.03, CR, 8);
  tube(m, fr, W, [hf - 0.04, ds - 0.08, du - 0.14], [hf - 0.04, ds - 0.1, du - 0.2], 0.03, 0.0, CR, 6);
  ball2(m, fr, W, hf + 0.03, ds + 0.03, du + 0.03, 0.02, 0.024, 0.026, '#fffbe8', 5, { rings: 3 }); // shine
}
_drvBuild = (function (orig) { return function (m, k, fr) { if (k && k.c && k.c.id === 'cumhead') return cumKart(m, k, fr); return orig(m, k, fr); }; })(_drvBuild);
