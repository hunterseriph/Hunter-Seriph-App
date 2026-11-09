/* =====================================================================================================
   MORE PEOPLE: Ejaculand's circus (Killer Clown, Pie Clown, Strongman, Acrobat) and TB's five henchmen, one at
   the end of each part of the night, each one his own sick piece of work:
   MAMA MUCKIES (B1): a huge grown man in a bonnet and a filthy nappy, a dummy in his mouth, sucking Silly Pills from a bottle
   THE STITCHED STAG (the woods): a man sewn into a deer's hide, antlers nailed into his skull, on his hands and feet
   THE SMILES TWINS (Ejaculand): two clowns sewn together at the hip, two heads, four arms, cut smiles ear to ear
   THE GRAVEDIGGER BRIDE (the cemetery): a rotten bride with her dead groom strapped to her back, and a shovel
   THE SISSIFIER (Clubhouse Row): seven foot of pink frilly maid's dress, a gimp mask with the lipstick smeared on
   ===================================================================================================== */
HIPAINT.f_clown = face(function (g) { fShape(g, [[30, 40], [46, 26], [60, 42], [46, 76]], '#12040a'); fShape(g, [[68, 42], [82, 26], [98, 40], [82, 76]], '#12040a'); fEye(g, 46, 52, 9, 10, '#c4121c', 0, '#ffe0e0'); fEye(g, 82, 52, 9, 10, '#c4121c', 0, '#ffe0e0');
  fEll(g, 64, 72, 11, 10, '#e01010', K0, 3); fShape(g, [[8, 74], [64, 120, 120, 74], [64, 98, 8, 74]], '#7a0a10', K0, 3); g.fillStyle = '#fffaf0'; for (var t = 0; t < 10; t++) g.fillRect(24 + t * 8, 86 + Math.abs(t - 4.5) * 1.6, 5, 7);
  for (var s = 0; s < 6; s++) { fLine(g, [[10 + s * 3, 70 + s * 2], [16 + s * 3, 78 + s * 2]], 2, '#3a0a0a'); fLine(g, [[118 - s * 3, 70 + s * 2], [112 - s * 3, 78 + s * 2]], 2, '#3a0a0a'); } }, '#f4f0e8');
HIPAINT.f_pieclown = face(function (g) { fEye(g, 46, 54, 11, 12, '#2a50c0'); fEye(g, 82, 54, 11, 12, '#2a50c0'); fShape(g, [[44, 70], [40, 86], [48, 86]], '#5aa0ff', K0, 2); fEll(g, 64, 74, 10, 9, '#e01010', K0, 3);
  fShape(g, [[38, 100], [64, 88, 90, 100], [64, 94, 38, 100]], '#7a0a10', K0, 3); g.fillStyle = '#f1e7d0'; [[22, 24, 16], [100, 30, 12], [90, 104, 10], [30, 104, 8]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 6.28); g.fill(); }); }, '#f4f0e8');
HIPAINT.f_strong = face(function (g) { fLine(g, [[30, 44], [56, 52]], 6); fLine(g, [[98, 44], [72, 52]], 6); fEye(g, 46, 60, 9, 8, '#3a2412'); fEye(g, 82, 60, 9, 8, '#3a2412');
  fShape(g, [[20, 88], [40, 78], [64, 84], [88, 78], [108, 88], [116, 72], [104, 96], [64, 92], [24, 96], [12, 72]], '#1a1010', K0, 2); fLine(g, [[50, 104], [78, 104]], 4, '#5a1010'); }, '#d8a07a');
HIPAINT.f_acro = face(function (g) { fShape(g, [[14, 50], [40, 34], [64, 48], [88, 34], [114, 50], [100, 70], [64, 62], [28, 70]], '#12040a', '#ffe36a', 3); fEll(g, 42, 52, 8, 7, '#ffffff'); fEll(g, 86, 52, 8, 7, '#ffffff'); fEll(g, 42, 53, 3, 4, K0); fEll(g, 86, 53, 3, 4, K0);
  fLine(g, [[44, 94], [64, 102, 84, 94]], 3, '#7a0a10'); fEll(g, 64, 76, 4, 3, '#c0907a'); }, '#e8c8b0');
HIPAINT.f_muckies = face(function (g) { fEll(g, 46, 58, 6, 5, '#12040a'); fEll(g, 82, 58, 6, 5, '#12040a'); fEll(g, 44, 56, 2, 2, '#ffffff'); fEll(g, 80, 56, 2, 2, '#ffffff'); fLine(g, [[34, 46], [52, 50]], 3); fLine(g, [[94, 46], [76, 50]], 3);
  g.globalAlpha = 0.5; fEll(g, 28, 80, 14, 10, '#e05a6a'); fEll(g, 100, 80, 14, 10, '#e05a6a'); g.globalAlpha = 1; fEll(g, 64, 70, 8, 6, '#d88a8a', K0, 2);
  fEll(g, 64, 96, 22, 13, '#7ac0e0', K0, 3); fEll(g, 64, 96, 9, 8, '#ffe36a', K0, 3); fShape(g, [[58, 108], [62, 126], [66, 108]], '#d0e8f0'); g.fillStyle = 'rgba(60,40,30,0.5)'; for (var i = 0; i < 60; i++) g.fillRect(24 + (i * 37) % 80, 104 + (i * 13) % 20, 2, 2); }, '#e8b0a0');
HIPAINT.f_stag = face(function (g) { g.fillStyle = '#5a3e24'; g.fillRect(0, 0, 128, 128); fShape(g, [[36, 70], [64, 60], [92, 70], [84, 120], [44, 120]], '#3a2814', K0, 3); fEll(g, 54, 108, 6, 4, K0); fEll(g, 74, 108, 6, 4, K0);
  fEll(g, 40, 50, 12, 10, '#e8c0a0'); fEye(g, 40, 50, 8, 8, '#c4121c', 0.4, '#ffe0e0'); fEll(g, 88, 50, 9, 9, K0); for (var s = 0; s < 9; s++) { fLine(g, [[24 + s * 3, 30 + s * 4], [32 + s * 3, 30 + s * 4]], 2, '#c8b8a0'); fLine(g, [[96 + s * 2, 30 + s * 4], [104 + s * 2, 32 + s * 4]], 2, '#c8b8a0'); }
  fLine(g, [[24, 30], [52, 68]], 2, '#c8b8a0'); fLine(g, [[104, 30], [76, 68]], 2, '#c8b8a0'); g.fillStyle = 'rgba(120,6,12,0.8)'; g.fillRect(38, 60, 3, 18); g.fillRect(88, 58, 2, 22); }, '#5a3e24');
HIPAINT.f_smiles = face(function (g) { fEye(g, 44, 50, 12, 14, '#2a1a14', 0.4); fEye(g, 84, 50, 12, 14, '#2a1a14', -0.4); fShape(g, [[34, 30], [44, 20], [54, 30]], '#c4121c'); fShape(g, [[74, 30], [84, 20], [94, 30]], '#c4121c'); fEll(g, 64, 70, 9, 8, '#e01010', K0, 3);
  fShape(g, [[4, 70], [64, 124, 124, 70], [64, 100, 4, 70]], '#3a0408', K0, 3); for (var s = 0; s < 14; s++) fLine(g, [[10 + s * 8, 80 + Math.sin(s / 13 * 3.14) * 18], [10 + s * 8, 90 + Math.sin(s / 13 * 3.14) * 18]], 2, '#12040a'); g.fillStyle = '#fffaf0'; for (var t = 0; t < 8; t++) g.fillRect(34 + t * 8, 92 + Math.abs(t - 3.5) * 2, 5, 6); }, '#f4f0e8');
HIPAINT.f_bride = face(function (g) { fEll(g, 44, 56, 13, 15, '#12040a'); fEll(g, 84, 56, 13, 15, '#12040a'); fEll(g, 44, 58, 3, 3, '#e8f0a0'); fEll(g, 84, 58, 3, 3, '#e8f0a0'); fLine(g, [[64, 64], [60, 80], [68, 80]], 2.5, '#4a5a4a');
  fShape(g, [[40, 98], [64, 90, 88, 98], [64, 108, 40, 98]], '#12040a', K0, 2); g.fillStyle = '#c8c0a0'; for (var t = 0; t < 6; t++) g.fillRect(46 + t * 6, 96, 3, 5); g.fillStyle = 'rgba(60,80,50,0.6)'; for (var i = 0; i < 40; i++) g.fillRect((i * 53) % 120, (i * 29) % 120, 4, 3); fLine(g, [[30, 20], [44, 40]], 2, '#3a3a2a'); }, '#a8b0a0');
HIPAINT.f_sissy = face(function (g) { fEll(g, 44, 54, 13, 10, '#12040a', '#ff7ab0', 3); fEll(g, 84, 54, 13, 10, '#12040a', '#ff7ab0', 3); fEye(g, 44, 54, 7, 7, '#7a2a60', 0, '#ffe0f0'); fEye(g, 84, 54, 7, 7, '#7a2a60', 0, '#ffe0f0');
  for (var l = 0; l < 6; l++) { fLine(g, [[34 + l * 4, 44], [30 + l * 4, 34]], 2); fLine(g, [[74 + l * 4, 44], [70 + l * 4, 34]], 2); } g.globalAlpha = 0.65; fEll(g, 26, 76, 14, 9, '#ff4a8a'); fEll(g, 102, 76, 14, 9, '#ff4a8a'); g.globalAlpha = 1;
  fShape(g, [[34, 94], [50, 84], [64, 90], [78, 84], [94, 94], [64, 112]], '#ff1a5a', K0, 3); fShape(g, [[90, 92], [118, 104], [96, 100]], '#ff1a5a'); fLine(g, [[44, 96], [84, 96]], 2, '#7a0a30'); fLine(g, [[64, 4], [64, 30]], 3, '#ff7ab0'); }, '#2a2026');
function buildRigs2() {
  function std(D, c, hipCol, torsoFn, headFn, extra) { var P = {}; var hp = M(); ell(hp, 0, 0, 0, D.shW * 0.78, 0.13, D.shW * 0.58, hipCol, 8, 4); P.hips = hp.upload(); var to = M(); torsoFn(to, D); P.torso = to.upload(); var hd = M(); headFn(hd); P.head = hd.upload(); limbs(P, D, c); if (extra) extra(P); return P; }
  var Dm = { lu: 0.44, ll: 0.44, tor: 0.56, shW: 0.25, hipW: 0.12, au: 0.31, al: 0.29, arm: 0.062, hand: 0.07, leg: 0.078, neck: 0.07 };
  function dup(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }
  /* the circus */
  RIGS.clown = { D: Dm, eyeY: 1.7, P: std(Dm, { sleeve: '#ffffff', hand: '#ffffff', legs: '#ffffff', boot: '#c4121c' }, '#2a50c0',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0, 0.26, D.tor * 0.56, 0.18, '#ffffff', 10, 6, { T: TL('polka') }); tub(to, [0, D.tor * 0.92, 0], [0, D.tor * 1.0, 0], 0.24, 0.18, '#f1e7d0', 12, { cap: 1 }); [0.3, 0.55].forEach(function (y) { ell(to, 0, D.tor * y, 0.18, 0.04, 0.04, 0.03, '#12040a', 6, 3); }); },
    function (hd) { ell(hd, 0, 0.18, 0, 0.18, 0.21, 0.19, '#f4f0e8', 12, 8, { face: 'f_clown', fz: 0.15, fw: 0.9, fh: 0.9 }); [-1, 1].forEach(function (sd) { ell(hd, sd * 0.18, 0.24, -0.04, 0.1, 0.1, 0.12, '#ffffff', 8, 4, { T: TL('wigred') }); }); },
    function (P) { var w = M(); tub(w, [0, 0, 0], [0, 0.12, 0], 0.025, 0.025, '#3a2010', 6); bxp(w, -0.07, 0.12, -0.06, 0.07, 0.28, 0.06, '#7a7a80', TL('steel')); P.weapon = w.upload(); }) };
  RIGS.pieclown = { D: Dm, eyeY: 1.66, P: std(Dm, { sleeve: '#ffe36a', hand: '#ffffff', legs: '#2a50c0', boot: '#c4121c' }, '#2a50c0',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0, 0.27, D.tor * 0.58, 0.2, '#ffffff', 10, 6, { T: TL('stripes') }); tub(to, [0, D.tor * 0.9, 0], [0, D.tor * 1.0, 0], 0.22, 0.12, '#c4121c', 10, { cap: 1 }); },
    function (hd) { ell(hd, 0, 0.18, 0, 0.18, 0.2, 0.19, '#f4f0e8', 12, 8, { face: 'f_pieclown', fz: 0.15, fw: 0.9, fh: 0.9 }); tub(hd, [0, 0.36, 0], [0, 0.62, 0], 0.12, 0.0, '#2a50c0', 8, { cap0: 1 }); ell(hd, 0, 0.63, 0, 0.04, 0.04, 0.04, '#ffe36a', 6, 3); },
    function (P) { var w = M(); tub(w, [0, 0.05, 0], [0, 0.1, 0], 0.13, 0.12, '#c8a050', 10, { cap0: 1 }); ell(w, 0, 0.11, 0, 0.12, 0.05, 0.12, '#f1e7d0', 10, 4); P.weapon = w.upload(); }) };
  var Ds = { lu: 0.47, ll: 0.46, tor: 0.68, shW: 0.36, hipW: 0.17, au: 0.35, al: 0.32, arm: 0.11, hand: 0.1, leg: 0.115, neck: 0.08 };
  RIGS.strongman = { D: Ds, eyeY: 1.92, P: std(Ds, { sleeve: '#d8a07a', hand: '#d8a07a', legs: '#2a1a14', boot: '#12040a' }, '#2a1a14',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0.02, 0.37, D.tor * 0.56, 0.28, '#ffffff', 12, 6, { T: TL('strongsuit') }); ell(to, 0, D.tor * 0.86, 0.04, 0.36, D.tor * 0.2, 0.25, '#d8a07a', 10, 4); },
    function (hd) { ell(hd, 0, 0.18, 0, 0.19, 0.21, 0.19, '#d8a07a', 12, 8, { face: 'f_strong', fz: 0.15, fw: 0.9, fh: 0.9 }); },
    function (P) { var w = M(); tub(w, [0, -0.05, 0], [0, 0.55, 0], 0.03, 0.03, '#4a4a50', 6); ell(w, 0, -0.05, 0, 0.14, 0.14, 0.14, '#1a1a1e', 8, 5); ell(w, 0, 0.6, 0, 0.16, 0.16, 0.16, '#1a1a1e', 8, 5); P.weapon = w.upload(); }) };
  var Da = dup(Dm); Da.arm = 0.05; Da.leg = 0.065; Da.shW = 0.21;
  RIGS.acrobat = { D: Da, eyeY: 1.66, P: std(Da, { sleeve: '#2a50c0', hand: '#e8c8b0', legs: '#2a50c0', boot: '#ffe36a' }, '#2a50c0',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0, 0.2, D.tor * 0.55, 0.14, '#ffffff', 10, 6, { T: TL('leotard') }); },
    function (hd) { ell(hd, 0, 0.18, 0, 0.16, 0.2, 0.17, '#e8c8b0', 12, 8, { face: 'f_acro', fz: 0.15, fw: 0.9, fh: 0.9 }); ell(hd, 0, 0.27, -0.05, 0.17, 0.12, 0.16, '#12040a', 10, 4, { only: 'back' }); }) };
  /* MAMA MUCKIES: a belly like a sack of cream, a bonnet, a nappy, the bottle */
  var Dk = { lu: 0.4, ll: 0.38, tor: 0.66, shW: 0.38, hipW: 0.2, au: 0.32, al: 0.3, arm: 0.12, hand: 0.1, leg: 0.14, neck: 0.04 };
  RIGS.muckies = { D: Dk, eyeY: 1.8, P: std(Dk, { sleeve: '#e8b0a0', hand: '#e8b0a0', legs: '#e8b0a0', boot: '#e8b0a0' }, '#ffffff',
    function (to, D) { ell(to, 0, D.tor * 0.42, 0.08, 0.46, D.tor * 0.58, 0.44, '#e8b0a0', 12, 8); ell(to, 0, D.tor * 0.62, 0.42, 0.04, 0.03, 0.02, '#a86a60', 6, 3); ell(to, 0, -0.04, 0.02, 0.4, 0.2, 0.34, '#ffffff', 10, 5, { T: TL('nappy') }); [-1, 1].forEach(function (sd) { ell(to, sd * 0.2, D.tor * 0.78, 0.3, 0.05, 0.05, 0.03, '#c87a70', 6, 3); }); },
    function (hd) { ell(hd, 0, 0.2, 0, 0.23, 0.24, 0.22, '#e8b0a0', 12, 8, { face: 'f_muckies', fz: 0.12, fw: 0.92, fh: 0.92 }); ell(hd, 0, 0.27, -0.04, 0.27, 0.26, 0.24, '#f4c8d8', 12, 6, { only: 'back' }); tub(hd, [-0.24, 0.12, 0.02], [0.24, 0.12, 0.02], 0.02, 0.02, '#f4c8d8', 6); ell(hd, 0.26, 0.4, -0.02, 0.07, 0.07, 0.07, '#ff7ab0', 8, 4); },
    function (P) { var w = M(); tub(w, [0, 0, 0], [0, 0.3, 0], 0.07, 0.07, '#e8f0f0', 10, { cap0: 1 }); tub(w, [0, 0.05, 0], [0, 0.22, 0], 0.06, 0.06, '#ff4a8a', 10); tub(w, [0, 0.3, 0], [0, 0.4, 0], 0.04, 0.02, '#c8a050', 8, { cap: 1 }); P.weapon = w.upload(); }) };
  /* THE STITCHED STAG: a deer hide sewn round a man, antlers nailed through the skull */
  var Dg = { lu: 0.45, ll: 0.45, tor: 0.6, shW: 0.27, hipW: 0.13, au: 0.4, al: 0.38, arm: 0.07, hand: 0.07, leg: 0.085, neck: 0.12 };
  RIGS.stag = { D: Dg, eyeY: 1.6, P: std(Dg, { sleeve: '#ffffff', hand: '#3a2814', legs: '#ffffff', boot: '#1a120a' }, '#ffffff',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0, 0.29, D.tor * 0.58, 0.22, '#ffffff', 10, 6, { T: TL('fur') }); for (var s = 0; s < 6; s++) ell(to, 0, D.tor * (0.15 + s * 0.14), 0.22, 0.05, 0.012, 0.012, '#d8c8a8', 4, 2); tub(to, [0, D.tor * 0.2, 0.2], [0, D.tor * 0.92, 0.2], 0.008, 0.008, '#c8b8a0', 4); },
    function (hd) { ell(hd, 0, 0.17, 0.04, 0.17, 0.2, 0.22, '#5a3e24', 12, 8, { face: 'f_stag', fz: 0.15, fw: 0.9, fh: 0.9 }); [-1, 1].forEach(function (sd) { tub(hd, [sd * 0.08, 0.34, 0], [sd * 0.26, 0.7, -0.05], 0.03, 0.02, '#c8b898', 6); tub(hd, [sd * 0.18, 0.52, -0.02], [sd * 0.34, 0.6, 0.08], 0.02, 0.012, '#c8b898', 5); tub(hd, [sd * 0.22, 0.62, -0.04], [sd * 0.18, 0.82, 0.02], 0.018, 0.01, '#c8b898', 5); tub(hd, [sd * 0.24, 0.66, -0.05], [sd * 0.38, 0.8, -0.1], 0.016, 0.008, '#c8b898', 5); ell(hd, sd * 0.1, 0.35, 0.02, 0.025, 0.025, 0.025, '#6a0a10', 5, 3); ell(hd, sd * 0.18, 0.3, -0.02, 0.06, 0.1, 0.02, '#4a3018', 6, 3); }); }) };
  /* THE SMILES TWINS: two clowns, one body, four arms (two up, juggling cleavers) */
  var Dt = dup(Dm); Dt.shW = 0.36; Dt.hipW = 0.17;
  RIGS.smiles = { D: Dt, eyeY: 1.75, twin: 1, P: std(Dt, { sleeve: '#ffffff', hand: '#ffffff', legs: '#c4121c', boot: '#12040a' }, '#c4121c',
    function (to, D) { [-1, 1].forEach(function (sd) { ell(to, sd * 0.17, D.tor * 0.5, 0, 0.22, D.tor * 0.56, 0.18, '#ffffff', 10, 6, { T: TL('polka') }); tub(to, [sd * 0.2, D.tor * 0.92, 0], [sd * 0.2, D.tor * 1.0, 0], 0.2, 0.14, '#f1e7d0', 10, { cap: 1 });
        tub(to, [sd * 0.32, D.tor * 0.85, 0], [sd * 0.55, D.tor * 1.35, 0.1], 0.05, 0.045, '#ffffff', 7); tub(to, [sd * 0.55, D.tor * 1.35, 0.1], [sd * 0.5, D.tor * 1.75, 0.2], 0.045, 0.04, '#ffffff', 7); ell(to, sd * 0.5, D.tor * 1.8, 0.2, 0.06, 0.06, 0.06, '#ffffff', 6, 4); });
      tub(to, [0, D.tor * 0.05, 0.17], [0, D.tor * 0.95, 0.17], 0.012, 0.012, '#6a0a10', 4); for (var s = 0; s < 8; s++) tub(to, [-0.05, D.tor * (0.1 + s * 0.11), 0.18], [0.05, D.tor * (0.1 + s * 0.11), 0.18], 0.008, 0.008, '#12040a', 3); },
    function (hd) { [-1, 1].forEach(function (sd) { ell(hd, sd * 0.2, 0.18, 0, 0.17, 0.2, 0.18, '#f4f0e8', 12, 8, { face: 'f_smiles', fz: 0.15, fw: 0.9, fh: 0.9 }); ell(hd, sd * 0.2 + sd * 0.14, 0.26, -0.04, 0.09, 0.09, 0.1, '#ffffff', 8, 4, { T: TL('wigred') }); tub(hd, [sd * 0.2, 0.36, 0], [sd * 0.22, 0.56, -0.02], 0.08, 0.0, sd > 0 ? '#ffe36a' : '#2a50c0', 8, { cap0: 1 }); }); },
    function (P) { var w = M(); tub(w, [0, -0.04, 0], [0, 0.1, 0], 0.02, 0.02, '#3a2010', 6); bxp(w, -0.015, 0.1, -0.04, 0.015, 0.36, 0.14, '#b8b8c0', TL('steel')); P.weapon = w.upload(); var cl = M(); bxp(cl, -0.015, -0.13, -0.09, 0.015, 0.13, 0.09, '#b8b8c0', TL('steel')); P.cleaver = cl.upload(); }) };
  /* THE GRAVEDIGGER BRIDE: rotten, veiled, the groom strapped to her back, a shovel */
  var Db = { lu: 0.47, ll: 0.47, tor: 0.6, shW: 0.24, hipW: 0.12, au: 0.33, al: 0.31, arm: 0.055, hand: 0.065, leg: 0.07, neck: 0.09 };
  RIGS.bride = { D: Db, eyeY: 1.8, P: std(Db, { sleeve: '#d8d4c8', hand: '#a8b0a0', legs: '#d8d4c8', boot: '#2a2a2a' }, '#ffffff',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0, 0.24, D.tor * 0.56, 0.17, '#ffffff', 10, 6, { T: TL('dress') }); tub(to, [0, D.tor * 0.05, 0], [0, -D.tor * 1.35, 0], 0.22, 0.55, '#ffffff', 12, { T: TL('dress') });
      // the groom on her back: grey, slumped, roped on
      ell(to, 0, D.tor * 0.55, -0.32, 0.2, D.tor * 0.45, 0.14, '#3a3a3e', 8, 5); ell(to, 0.02, D.tor * 1.05, -0.36, 0.13, 0.14, 0.13, '#8a9488', 10, 6); tub(to, [-0.18, D.tor * 0.75, -0.3], [-0.3, D.tor * 0.1, -0.2], 0.05, 0.04, '#3a3a3e', 6); tub(to, [0.18, D.tor * 0.75, -0.3], [0.32, D.tor * 0.15, -0.18], 0.05, 0.04, '#3a3a3e', 6);
      [0.35, 0.7].forEach(function (y) { tub(to, [-0.25, D.tor * y, 0.05], [0.25, D.tor * y, 0.05], 0.018, 0.018, '#7a5a34', 5); }); ell(to, 0.1, D.tor * 0.6, 0.16, 0.06, 0.06, 0.03, '#6a0a10', 6, 3); },
    function (hd) { ell(hd, 0, 0.17, 0, 0.16, 0.2, 0.17, '#a8b0a0', 12, 8, { face: 'f_bride', fz: 0.15, fw: 0.9, fh: 0.9 }); ell(hd, 0, 0.2, -0.04, 0.2, 0.3, 0.2, '#e8e4dc', 10, 6, { only: 'back', T: TL('dress') }); ell(hd, 0, 0.36, 0, 0.12, 0.05, 0.12, '#f4f0e8', 8, 3); ell(hd, 0.08, 0.38, 0.06, 0.04, 0.04, 0.04, '#7a0a10', 6, 3); },
    function (P) { var w = M(); tub(w, [0, -0.1, 0], [0, 0.85, 0], 0.022, 0.022, '#6a4a28', 6, { cap0: 1 }); bxp(w, -0.11, 0.85, -0.02, 0.11, 1.12, 0.02, '#7a7a80', TL('rust')); P.weapon = w.upload(); }) };
  /* THE SISSIFIER: huge, pink frills, white apron, gimp mask, pigtails, the giant lipstick */
  var Dz = { lu: 0.5, ll: 0.5, tor: 0.66, shW: 0.3, hipW: 0.14, au: 0.36, al: 0.34, arm: 0.075, hand: 0.08, leg: 0.085, neck: 0.08 };
  buildTB2();
  RIGS.sissifier = { D: Dz, eyeY: 2.0, P: std(Dz, { sleeve: '#ff7ab0', fore: '#2a2026', hand: '#f4f0ec', legs: '#f4f0ec', boot: '#12040a' }, '#ffffff',
    function (to, D) { ell(to, 0, D.tor * 0.5, 0, 0.3, D.tor * 0.56, 0.2, '#ffffff', 10, 6, { T: TL('pinkfrill') }); tub(to, [0, D.tor * 0.1, 0], [0, -D.tor * 0.75, 0], 0.27, 0.6, '#ffffff', 12, { T: TL('pinkfrill') }); tub(to, [0, -D.tor * 0.72, 0], [0, -D.tor * 0.8, 0], 0.62, 0.66, '#ffffff', 12);
      ell(to, 0, D.tor * 0.3, 0.12, 0.2, D.tor * 0.4, 0.12, '#c8bcb8', 8, 5, { b0: 0.3 }); [-1, 1].forEach(function (sd) { ell(to, sd * 0.3, D.tor * 0.92, 0, 0.13, 0.09, 0.13, '#ffd0e4', 8, 4); }); tub(to, [0, D.tor * 0.92, 0], [0, D.tor * 1.0, 0], 0.13, 0.12, '#12040a', 8, { cap: 1 }); },
    function (hd) { ell(hd, 0, 0.18, 0, 0.18, 0.21, 0.19, '#2a2026', 12, 8, { face: 'f_sissy', fz: 0.12, fw: 0.92, fh: 0.92, T: TL('leather') }); [-1, 1].forEach(function (sd) { tub(hd, [sd * 0.17, 0.3, -0.04], [sd * 0.34, 0.05, -0.1], 0.06, 0.03, '#ffe36a', 7); ell(hd, sd * 0.17, 0.3, -0.04, 0.05, 0.05, 0.05, '#ff4a8a', 6, 3); }); ell(hd, 0, 0.38, -0.02, 0.17, 0.04, 0.15, '#ffffff', 10, 3); },
    function (P) { var w = M(); tub(w, [0, -0.08, 0], [0, 0.3, 0], 0.06, 0.06, '#d8b040', 10, { cap0: 1 }); tub(w, [0, 0.3, 0], [0, 0.55, 0], 0.05, 0.05, '#ff1a5a', 10); tub(w, [0, 0.55, 0], [0.03, 0.66, 0], 0.05, 0.0, '#ff1a5a', 8); P.weapon = w.upload(); }) };
}
