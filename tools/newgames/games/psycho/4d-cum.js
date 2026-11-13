/* =====================================================================================================
   Cumhead's 3D model, from his reference art (Dark Loads update 149, shared by every 3D game from update 151: his ask).
   Pale cream droplet head, the tip curling over (it shows on the left as you face him, like the drawing) with the little drop flicking off above and beyond it, big cartoon eyes,
   black T-shirt with the red HUNTER SERIPH print over long sleeves, white cartoon gloves (the right one a fist round
   whatever he holds), wide black trip pants with red plaid straps, studded pockets, chains and D-rings, chunky platform
   boots with red welts. RIGS.cumhead is replaced with it after buildRigs; Dark Loads builds the separate-feet version.
   ===================================================================================================== */
HIPAINT.f_cum2 = face(function (g) { g.translate(128, 0); g.scale(-1, 1); // the head's texture is seen mirrored, so it is painted mirrored
  function eye(x, y, flip) { fEll(g, x, y, 15, 20, '#fffaf0', K0, 5); fEll(g, x + 3, y + 5, 10, 13, K0);
    g.fillStyle = '#fffaf0'; g.beginPath(); g.moveTo(x + 3, y + 5); g.lineTo(x - 7, y - 4); g.lineTo(x + 1, y - 9); g.closePath(); g.fill(); }
  eye(46, 60); eye(84, 58);
  fLine(g, [[30, 34], [42, 26, 56, 32]], 5); fLine(g, [[72, 30], [86, 24, 98, 32]], 5);
  fLine(g, [[40, 90], [66, 110, 98, 88]], 5); fLine(g, [[96, 84], [104, 86, 100, 94]], 4);
  fLine(g, [[104, 70], [114, 76, 106, 86]], 4);
  g.globalAlpha = 0.5; fShape(g, [[22, 66], [16, 80, 22, 86], [28, 80, 22, 66]], '#f9ecc4', '#c8a868', 2); g.globalAlpha = 1;
  g.globalAlpha = 0.35; fEll(g, 30, 84, 8, 5, '#e8a070'); fEll(g, 100, 80, 8, 5, '#e8a070'); g.globalAlpha = 1;
}, '#f3dfa8');
HIPAINT.cumshirt = face(function (g) {
  g.save(); g.translate(128, 0); g.scale(-1, 1); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#c4121c';
  var fnt = '"Pirata One", serif';
  function fit(t, y, px) { g.font = px + 'px ' + fnt; var w = g.measureText(t).width; g.save(); g.translate(64, y); if (w > 96) g.scale(96 / w, 1); g.fillText(t, 0, 0); g.restore(); }
  fit('HUNTER', 50, 30); fit('SERIPH', 76, 27);
  g.strokeStyle = '#c4121c'; g.lineWidth = 2; g.lineCap = 'round';
  [[14, 30, 4, 22], [114, 30, 124, 22], [12, 64, 2, 70], [116, 64, 126, 70], [30, 20, 26, 10], [98, 20, 104, 10]].forEach(function (s) { g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[2], s[3]); g.stroke(); });
  for (var i = 0; i < 9; i++) { var x = 26 + i * 9.5 + (i % 2) * 3, l = 6 + ((i * 37) % 13); g.fillRect(x, 74, 2, l); g.beginPath(); g.arc(x + 1, 74 + l + 2, 2.2, 0, 6.3); g.fill(); }
  g.restore();
}, '#121014');
function cumBoot(m, y0, RED) { // a chunky platform boot round an ankle at y0: shaft, a big round shiny toe cap, a thick rounded sole with a red stitched welt, treads, red laces
  var ank = 0.08, g = y0 - ank;
  ell(m, 0, y0, -0.005, 0.088, 0.085, 0.092, '#0e0b0e', 10, 6);
  ell(m, 0, y0 - 0.02, 0.075, 0.094, 0.07, 0.15, '#0c0a0c', 14, 8); ell(m, 0, y0 + 0.012, 0.15, 0.04, 0.022, 0.05, '#5a5a66', 8, 4);
  ell(m, 0, g + 0.033, 0.055, 0.112, 0.034, 0.2, '#161116', 16, 6); ell(m, 0, g + 0.058, 0.055, 0.108, 0.011, 0.196, RED, 16, 4);
  for (var k = 0; k < 14; k++) { var a = k / 14 * Math.PI * 2; ell(m, Math.cos(a) * 0.106, g + 0.058, 0.055 + Math.sin(a) * 0.194, 0.006, 0.004, 0.006, '#e8d8c0', 4, 2); }
  for (var tr = 0; tr < 6; tr++) { var tz = -0.1 + tr * 0.062; ell(m, 0, g + 0.006, tz, 0.09 - Math.abs(tr - 2.5) * 0.008, 0.008, 0.016, '#050305', 8, 3); }
  [0.02, 0.055, 0.09].forEach(function (z) { tub(m, [-0.035, y0 + 0.02 - z * 0.25, z], [0.035, y0 + 0.02 - z * 0.25, z], 0.007, 0.007, RED, 5); }); }
function cumBuild(sep) { // sep: separate feet (Dark Loads' own walk); without, the boot is part of the shin (every other game's drawRig)
  var D = { lu: 0.33, ll: 0.33, tor: 0.4, shW: 0.21, hipW: 0.105, au: 0.24, al: 0.21, arm: 0.052, hand: 0.078, leg: 0.075, neck: 0.03 }, P = {}, la = 0.25;
  var BLK = '#141016', SLV = '#cfd0d8', RED = '#b0141e', SLEEVE = '#29242c', GLV = '#f4efe6';
  // hips: the top of the trip pants, a belt with a silver buckle
  var hp = M(); ell(hp, 0, 0, 0, 0.2, 0.13, 0.15, BLK, 10, 5); tub(hp, [0, 0.07, 0], [0, 0.12, 0], 0.205, 0.205, '#0c0a0c', 12, { cap: 1 }); bxp(hp, -0.035, 0.065, 0.19, 0.035, 0.125, 0.215, SLV);
  P.hips = hp.upload();
  // the T-shirt with the print, the collar, the hem standing off the body
  var to = M(); ell(to, 0, D.tor * 0.52, 0, 0.235, D.tor * 0.58, 0.165, BLK, 12, 7, { face: 'cumshirt', fz: 0.35, fw: 0.86, fh: 0.9, fdv: 0.06 });
  tub(to, [0, 0.0, 0], [0, 0.07, 0], 0.245, 0.235, BLK, 12); tub(to, [0, D.tor * 0.97, 0], [0, D.tor * 1.05, 0], 0.1, 0.09, '#0a080a', 10, { cap: 1 });
  P.torso = to.upload();
  // the head: a pale cream droplet, the tip curling over to his left
  var hd = M(); ell(hd, 0, 0.3, 0, 0.34, 0.32, 0.31, '#f3dfa8', 16, 10, { face: 'f_cum2', fz: 0.22, fw: 0.82, fh: 0.82, fdv: 0.02, tip: 0.34 });
  tub(hd, [0, 0.72, -0.01], [-0.045, 0.84, -0.015], 0.08, 0.042, '#f3dfa8', 10); tub(hd, [-0.045, 0.84, -0.015], [-0.12, 0.89, -0.015], 0.042, 0.014, '#f3dfa8', 8); ell(hd, -0.125, 0.89, -0.015, 0.016, 0.016, 0.016, '#f3dfa8', 6, 3);
  ell(hd, 0.14, 0.42, 0.24, 0.035, 0.05, 0.02, '#fff6dc', 6, 3);
  P.head = hd.upload();
  var dr = M(); ell(dr, 0, 0, 0, 0.068, 0.072, 0.064, '#f3dfa8', 12, 7); tub(dr, [0.025, -0.045, 0], [0.055, -0.1, 0], 0.045, 0.024, '#f3dfa8', 8); tub(dr, [0.055, -0.1, 0], [0.07, -0.15, 0], 0.024, 0.004, '#f3dfa8', 6); ell(dr, -0.022, 0.03, 0.05, 0.018, 0.024, 0.01, '#fffbe8', 5, 3); P.drip = dr.upload();
  ['L', 'R'].forEach(function (sd) { var s = sd === 'L' ? 1 : -1, A = D.arm, H2 = D.hand;
    // the upper arm: a loose short sleeve over the long one
    var au = M(); ell(au, 0, -0.01, 0, A * 1.5, A * 1.4, A * 1.45, BLK, 10, 5); tub(au, [0, 0, 0], [0, -D.au * 0.55, 0], A * 1.55, A * 1.6, BLK, 10); tub(au, [0, -D.au * 0.5, 0], [0, -D.au * 0.56, 0], A * 1.6, A * 1.6, '#0a080a', 10);
    lathe(au, [[-D.au * 0.4, A * 1.0], [-D.au * 0.75, A * 0.95], [-D.au, A * 0.88]], SLEEVE, 9); P['au' + sd] = au.upload();
    // the forearm and a big white cartoon glove with a rolled cuff
    var al = M(); ell(al, 0, 0, 0, A * 0.92, A * 0.92, A * 0.92, SLEEVE, 8, 4); lathe(al, [[0, A * 0.9], [-D.al * 0.5, A * 0.86], [-D.al, A * 0.78]], SLEEVE, 9);
    tub(al, [0, -D.al + 0.01, 0], [0, -D.al - 0.04, 0], A * 1.25, A * 1.35, GLV, 10, { cap: 1 }); var hy = -D.al - 0.04 - H2 * 0.55;
    if (sd === 'R') { // a fist: the grip runs through it front to back, fingers wrapped round from the outside, the thumb over the top
      var fy0 = -D.al - 0.04 - H2 * 0.6; ell(al, 0, fy0 + H2 * 0.15, 0, H2 * 0.82, H2 * 0.8, H2 * 0.95, GLV, 12, 7);
      for (var f = 0; f < 4; f++) { var fz = (f - 1.5) * H2 * 0.48; ell(al, s * -H2 * 0.62, fy0 - H2 * 0.2, fz, H2 * 0.36, H2 * 0.38, H2 * 0.26, GLV, 8, 5); ell(al, s * -H2 * 0.25, fy0 - H2 * 0.62, fz, H2 * 0.34, H2 * 0.3, H2 * 0.25, GLV, 8, 4); }
      tub(al, [s * H2 * 0.75, fy0 + H2 * 0.25, H2 * 0.3], [s * H2 * 0.35, fy0 - H2 * 0.55, H2 * 0.55], H2 * 0.32, H2 * 0.26, GLV, 7, { cap: 1 });
      [-1, 0, 1].forEach(function (k) { bxp(al, s * H2 * 0.78, fy0 + H2 * 0.1, k * H2 * 0.3 - 0.003, s * H2 * 0.82, fy0 + H2 * 0.6, k * H2 * 0.3 + 0.003, '#bdb6aa'); }); }
    else { ell(al, 0, hy, 0.005, H2 * 0.9, H2 * 0.95, H2 * 0.62, GLV, 10, 6);
    for (var f = 0; f < 3; f++) { var fx = (f - 1) * H2 * 0.55, fy = hy - H2 * 0.6; tub(al, [fx, fy + H2 * 0.15, 0.02], [fx, fy - H2 * 0.55, 0.05], H2 * 0.3, H2 * 0.27, GLV, 6, { cap: 1 }); }
    tub(al, [s * H2 * 0.7, hy + H2 * 0.15, 0.03], [s * H2 * 1.15, hy - H2 * 0.35, 0.08], H2 * 0.3, H2 * 0.24, GLV, 6, { cap: 1 });
    [-1, 0, 1].forEach(function (k) { bxp(al, k * H2 * 0.3 - 0.003, hy + H2 * 0.3, H2 * 0.6, k * H2 * 0.3 + 0.003, hy + H2 * 0.75, H2 * 0.63, '#bdb6aa'); }); } // the stitching on the back of the glove
    P['al' + sd] = al.upload();
    // the thigh: baggy black, a red plaid strap down the front, a studded pocket on the side, a chain from the belt to the pocket
    var L = D.leg, lu = M(); ell(lu, 0, -0.02, 0, 0.13, 0.12, 0.13, BLK, 10, 5); lathe(lu, [[0, 0.125], [-D.lu * 0.4, 0.128, 0.13], [-D.lu * 0.8, 0.122], [-D.lu, 0.12]], BLK, 12);
    bxp(lu, s * 0.025, -D.lu, 0.112, s * 0.065, -0.02, 0.13, RED); [-0.08, -0.17, -0.26].forEach(function (y) { bxp(lu, s * 0.022, y - 0.008, 0.128, s * 0.068, y + 0.008, 0.133, '#1a0a0c'); });
    var px0 = s * 0.115, px1 = s * 0.15; bxp(lu, Math.min(px0, px1), -0.27, -0.06, Math.max(px0, px1), -0.12, 0.07, '#1c171c'); bxp(lu, Math.min(px0, px1) - 0.003, -0.15, -0.065, Math.max(px0, px1) + 0.003, -0.115, 0.075, RED);
    [[-0.035, -0.2], [0.035, -0.2], [0, -0.13]].forEach(function (q) { ell(lu, s * 0.155, q[1], q[0], 0.012, 0.012, 0.012, SLV, 5, 3); });
    tub(lu, [s * 0.155, -0.27, 0.0], [s * 0.17, -0.31, 0.0], 0.012, 0.0, SLV, 5); // a spike under the pocket
    ell(lu, s * 0.152, -0.29, 0.06, 0.008, 0.022, 0.022, SLV, 6, 4); // a D-ring
    for (var c = 0; c <= 8; c++) { var t = c / 8, cx = s * (0.05 + 0.1 * t), cy = 0.02 - 0.16 * t - 0.09 * Math.sin(t * Math.PI), cz = 0.14 - 0.08 * t; ell(lu, cx, cy, cz, 0.014, c % 2 ? 0.02 : 0.012, c % 2 ? 0.012 : 0.02, SLV, 6, 3); }
    P['lu' + sd] = lu.upload();
    // the shin: the leg flares out wide over the boot, the strap carries on
    var ll = M(); ell(ll, 0, 0, 0.01, 0.12, 0.12, 0.12, BLK, 10, 4); lathe(ll, [[0, 0.12], [-la * 0.45, 0.13], [-la * 0.85, 0.155], [-la - 0.02, 0.17]], BLK, 12);
    tub(ll, [0, -la - 0.02, 0], [0, -la - 0.01, 0], 0.17, 0.165, '#0c0a0c', 12); bxp(ll, s * 0.03, -la * 0.75, 0.12, s * 0.07, 0.0, 0.142, RED);
    ell(ll, s * 0.13, -la * 0.6, 0.02, 0.008, 0.02, 0.02, SLV, 6, 4);
    if (!sep) cumBoot(ll, -la, RED);
    P['ll' + sd] = ll.upload();
    if (sep) { var ft = M(); cumBoot(ft, 0, RED); P['ft' + sd] = ft.upload(); } });
  return { P: P, D: D, eyeY: 1.6, drip: 1, dripAt: [-0.2, 1.05, -0.02], v149: 1 }; }
var cumOldRigs = buildRigs;
buildRigs = function () { var r = cumOldRigs.apply(this, arguments); if (!RIGS.cumhead || !RIGS.cumhead.v149) RIGS.cumhead = cumBuild(false); return r; };
