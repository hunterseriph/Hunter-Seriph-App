/* =====================================================================================================
   TB, MADE WORSE (his ask: way more fucked up). Sallow, sweating skin with boils; the eye patch is gone: the socket is
   stitched shut with black thread and a nail through it, weeping blood; the other eye bulges, veined red; half his
   nose is missing; the grin is cut out to the ears and stitched open, rotten teeth, gums, drool. A lumpy skull with a
   missing ear and nails through the hat, a hunched back, a hanging belly with a stitched Y scar under the open jacket,
   a blood-soaked vest, needles still stuck in his shoulder, long arms with claws, bandages. He twitches.
   ===================================================================================================== */
function tbFace(g, mad, clown) {
  var skin = clown ? '#f4f0e8' : mad ? '#c8a888' : '#c0b08c';
  g.fillStyle = skin; g.fillRect(0, 0, 128, 128);
  if (!clown) { g.globalAlpha = 0.35; fEll(g, 30, 30, 22, 16, '#8a9a68'); fEll(g, 100, 96, 20, 14, '#8a9a68'); fEll(g, 64, 20, 30, 10, '#7a6a50'); g.globalAlpha = 1; // bruised, sallow patches
    [[22, 70, 5], [104, 58, 4], [96, 28, 3], [30, 100, 3.5], [70, 30, 2.5]].forEach(function (b) { fEll(g, b[0], b[1], b[2], b[2], '#d8c070', '#7a5a30', 1.5); fEll(g, b[0] - 1, b[1] - 1, b[2] * 0.35, b[2] * 0.35, '#fff0b0'); }); // boils
    g.fillStyle = 'rgba(40,30,20,0.35)'; for (var s = 0; s < 120; s++) g.fillRect((s * 53) % 124, 84 + (s * 29) % 40, 2, 2); } // stubble
  // the left socket: stitched shut, a nail through it, blood running down
  fEll(g, 42, 58, 16, 12, '#5a1a1a', K0, 3); fLine(g, [[28, 58], [56, 58]], 3, '#2a0808');
  for (var x = 0; x < 5; x++) { fLine(g, [[30 + x * 6, 50], [34 + x * 6, 66]], 2.2, '#0a0404'); fLine(g, [[34 + x * 6, 50], [30 + x * 6, 66]], 2.2, '#0a0404'); }
  fEll(g, 42, 56, 4, 4, '#8a8a90', K0, 2); fLine(g, [[42, 56], [36, 46]], 3, '#6a6a70');
  g.fillStyle = '#8a0410'; g.fillRect(36, 66, 4, mad ? 40 : 26); g.fillRect(46, 66, 3, mad ? 30 : 16); fEll(g, 38, mad ? 106 : 92, 3, 4, '#8a0410');
  // the right eye: bulging, bloodshot, tiny pupil
  var er = mad ? 21 : 19; fEll(g, 86, 58, er + 4, er + 2, '#5a3020', K0, 3); fEll(g, 86, 58, er, er - 1, '#fff2e0', K0, 2);
  g.strokeStyle = '#c4121c'; g.lineWidth = 1.4; for (var v = 0; v < 9; v++) { var a = v / 9 * 6.28; g.beginPath(); g.moveTo(86 + Math.cos(a) * er, 58 + Math.sin(a) * (er - 1)); g.lineTo(86 + Math.cos(a + 0.3) * er * 0.5, 58 + Math.sin(a + 0.3) * er * 0.45); g.stroke(); }
  fEll(g, 88, 59, mad ? 4 : 5, mad ? 4 : 5, mad ? '#c4121c' : '#5a4a10', K0, 1.5); fEll(g, 88, 59, 2, 2, K0); fEll(g, 84, 54, 2.5, 2, '#ffffff');
  fLine(g, [[66, mad ? 34 : 40], [86, mad ? 28 : 34], [106, mad ? 40 : 42]], 5, '#2a1a10'); // brow
  // half a nose: two wet slits and the stump
  fShape(g, [[60, 70], [66, 66], [70, 76], [62, 80]], '#9a6a5a', K0, 2); fEll(g, 62, 78, 2.5, 3.5, '#2a0808'); fEll(g, 69, 78, 2.5, 3.5, '#2a0808');
  // the grin, cut to the ears and stitched open
  var mo = mad ? 14 : 6; fShape(g, [[4, 82], [30, 98 + mo], [64, 106 + mo * 1.6], [98, 98 + mo], [124, 82], [98, 92], [64, 96], [30, 92]], '#2a0406', K0, 3);
  if (mad) fEll(g, 64, 108, 12, 6, '#8a2a3a', K0, 1.5); // the tongue
  g.fillStyle = '#7a1a22'; g.fillRect(24, 91, 80, 4); // gums
  for (var t = 0; t < 13; t++) { var tx0 = 24 + t * 6.2, rot = (t * 7) % 5, h = 5 + (t * 3) % 4; if (rot === 3) continue; g.fillStyle = rot === 1 ? '#7a6a30' : rot === 4 ? '#5a4a28' : '#d8cc98'; g.fillRect(tx0, 93, 5, h); if (mad) { g.fillStyle = rot === 2 ? '#6a5a28' : '#c8bc88'; g.fillRect(tx0 + 1, 103 + mo * 0.9 - h, 4, h); } }
  [[8, 84], [16, 90], [112, 84], [120, 82]].forEach(function (s) { fLine(g, [[s[0] - 4, s[1] - 6], [s[0] + 4, s[1] + 6]], 2, '#0a0404'); }); // the stitches at the corners
  g.fillStyle = 'rgba(220,230,200,0.75)'; g.fillRect(52, 100 + mo, 3, 18); g.fillRect(80, 98 + mo, 2, 12); // drool
  fLine(g, [[100, 20], [118, 44]], 2, '#6a3a2a'); fLine(g, [[106, 22], [112, 24]], 1.5, '#3a1a10'); fLine(g, [[110, 30], [116, 32]], 1.5, '#3a1a10'); // a stitched scar
  if (clown) { fEll(g, 64, 74, 10, 9, '#e01010', K0, 3); g.globalAlpha = 0.7; fShape(g, [[74, 30], [86, 14], [98, 30], [86, 84]], '#2a50c0'); g.globalAlpha = 1; fEll(g, 86, 58, er, er - 1, '#fff2e0', K0, 2); fEll(g, 88, 59, 4, 4, '#c4121c', K0, 1.5); g.fillStyle = 'rgba(196,18,28,0.7)'; g.fillRect(4, 80, 120, 4); }
}
HIPAINT.f_tb = face(function (g) { tbFace(g, 0, 0); }, '#c0b08c');
HIPAINT.f_tbmad = face(function (g) { tbFace(g, 1, 0); }, '#c8a888');
HIPAINT.f_tbclown = face(function (g) { tbFace(g, 1, 1); }, '#f4f0e8');
HIPAINT.tbvest = function (g, r) { g.fillStyle = '#b8a888'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(80,60,30,0.5)'; for (var i = 0; i < 40; i++) g.fillRect(r() * 64, r() * 64, 3, 2); paintBlood(g, r, 1.1); };
HIPAINT.tbbelly = function (g, r) { g.fillStyle = '#c0a888'; g.fillRect(0, 0, 64, 64); g.globalAlpha = 0.3; g.fillStyle = '#7a8a5a'; g.beginPath(); g.ellipse(20, 40, 14, 10, 0, 0, 6.28); g.fill(); g.globalAlpha = 1;
  g.strokeStyle = '#5a1a14'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 8); g.lineTo(32, 30); g.lineTo(54, 8); g.moveTo(32, 30); g.lineTo(32, 62); g.stroke(); g.strokeStyle = '#0a0404'; g.lineWidth = 1;
  for (var s = 0; s < 8; s++) { g.beginPath(); g.moveTo(29, 32 + s * 4); g.lineTo(35, 34 + s * 4); g.stroke(); } for (var k = 0; k < 4; k++) { g.beginPath(); g.moveTo(12 + k * 5, 8 + k * 5); g.lineTo(16 + k * 5, 6 + k * 5); g.moveTo(52 - k * 5, 8 + k * 5); g.lineTo(48 - k * 5, 6 + k * 5); g.stroke(); }
  g.fillStyle = 'rgba(120,6,12,0.8)'; g.fillRect(30, 40, 3, 14); g.fillStyle = '#3a1a10'; g.beginPath(); g.arc(32, 46, 2.5, 0, 6.28); g.fill(); };
function tbRig2(fc, clown) {
  var D = { lu: 0.46, ll: 0.46, tor: 0.6, shW: 0.29, hipW: 0.13, au: 0.4, al: 0.38, arm: 0.07, hand: 0.08, leg: 0.085, neck: 0.06 }, P = {}, skin = clown ? '#f4f0e8' : '#c0b08c';
  var c = { sleeve: clown ? '#ffffff' : '#4a2e18', fore: clown ? '#ffffff' : '#4a2e18', hand: skin, legs: clown ? '#2a50c0' : '#2a2a38', boot: clown ? '#c4121c' : '#1e140c' };
  var hp = M(); ell(hp, 0, 0, 0, 0.23, 0.14, 0.17, c.legs, 8, 4); tub(hp, [-0.22, 0.06, 0], [0.22, 0.06, 0], 0.03, 0.03, '#3a2412', 6); ell(hp, 0, 0.06, 0.17, 0.05, 0.035, 0.02, '#c8a040', 6, 3); ell(hp, 0.08, -0.08, 0.15, 0.08, 0.1, 0.03, '#5a4020', 6, 3); P.hips = hp.upload(); // a piss stain
  var to = M();
  if (clown) { ell(to, 0, D.tor * 0.5, 0, 0.31, D.tor * 0.56, 0.21, '#ffffff', 10, 6, { T: TL('polka') }); [0.3, 0.55, 0.8].forEach(function (y) { ell(to, 0, D.tor * y, 0.21, 0.045, 0.045, 0.03, '#ffe36a', 6, 3); }); tub(to, [0, D.tor * 0.92, 0], [0, D.tor * 1.0, 0], 0.27, 0.2, '#f1e7d0', 12, { cap: 1 }); }
  else {
    ell(to, 0, D.tor * 0.5, -0.02, 0.29, D.tor * 0.56, 0.19, '#5a3a20', 10, 6); // the jacket
    ell(to, 0, D.tor * 0.52, 0.07, 0.17, D.tor * 0.46, 0.15, '#ffffff', 8, 5, { T: TL('tbvest'), b0: 0.4 }); // the vest, soaked
    ell(to, 0, D.tor * 0.16, 0.12, 0.21, D.tor * 0.24, 0.16, '#ffffff', 10, 5, { T: TL('tbbelly'), b0: 0.6 }); // the belly, hanging out
    ell(to, 0, D.tor * 0.88, -0.17, 0.2, D.tor * 0.2, 0.1, '#5a3a20', 8, 4); // the hump
    tub(to, [0, D.tor * 0.9, 0], [0, D.tor * 1.02, 0], 0.16, 0.13, '#5a0a0a', 10, { cap: 1 }); tub(to, [0.05, D.tor * 0.92, 0.12], [0.12, D.tor * 0.55, 0.2], 0.045, 0.02, '#5a0a0a', 6);
    [[0.2, 0.86, 0.06], [0.24, 0.8, 0.0], [0.16, 0.9, -0.05]].forEach(function (s, n) { var b = [s[0], D.tor * s[1], s[2]]; tub(to, b, [b[0] + 0.12, b[1] + 0.13, b[2] + 0.06 - n * 0.04], 0.022, 0.022, '#e8f0f0', 6); tub(to, [b[0] + 0.03, b[1] + 0.03, b[2] + 0.02], [b[0] + 0.09, b[1] + 0.1, b[2] + 0.05], 0.018, 0.018, n === 1 ? '#7aff6a' : '#ff4a8a', 6); tub(to, b, [b[0] - 0.05, b[1] - 0.05, b[2]], 0.004, 0.002, '#c8c8d0', 3); }); // needles still in him
  }
  P.torso = to.upload();
  var hd = M(); ell(hd, 0, 0.2, 0, 0.21, 0.24, 0.21, skin, 12, 8, { face: fc, fz: 0.18, fw: 0.84, fh: 0.84, fdv: 0.05 });
  ell(hd, 0.12, 0.32, -0.08, 0.1, 0.09, 0.1, skin, 8, 5); ell(hd, -0.14, 0.28, -0.1, 0.08, 0.08, 0.08, skin, 8, 4); ell(hd, 0.02, 0.1, -0.15, 0.09, 0.08, 0.08, skin, 8, 4); // a lumpy skull
  ell(hd, 0.21, 0.2, 0, 0.04, 0.065, 0.045, skin, 6, 3); ell(hd, -0.21, 0.2, 0, 0.03, 0.03, 0.03, '#6a1a14', 6, 3); // one ear, and where the other was
  if (clown) { [-1, 1].forEach(function (sd) { ell(hd, sd * 0.21, 0.28, -0.02, 0.13, 0.12, 0.14, '#ffffff', 8, 5, { T: TL('wigred') }); }); ell(hd, 0, 0.18, 0.22, 0.05, 0.05, 0.04, '#e01010', 8, 5);
    tub(hd, [0.05, 0.42, 0], [0.05, 0.44, 0], 0.14, 0.14, '#1a1a1e', 10, { cap: 1, cap0: 1 }); tub(hd, [0.05, 0.44, 0], [0.08, 0.6, 0.02], 0.07, 0.05, '#1a1a1e', 8, { cap: 1 }); }
  else { ell(hd, 0, 0.29, -0.04, 0.21, 0.17, 0.2, '#3a2412', 10, 5, { only: 'back' }); // greasy hair
    tub(hd, [0, 0.43, -0.03], [0.02, 0.45, -0.01], 0.33, 0.3, '#4a2e18', 14, { cap: 1, cap0: 1 }); tub(hd, [0, 0.45, -0.03], [0.03, 0.62, -0.05], 0.18, 0.14, '#4a2e18', 10, { cap: 1 }); tub(hd, [0, 0.46, -0.03], [0, 0.5, -0.03], 0.185, 0.18, '#5a0a0a', 10); // a sweat-black hat with a blood band
    [[-0.08, 0.55, 0.1], [0.1, 0.57, 0.08], [0.0, 0.6, -0.17]].forEach(function (n) { tub(hd, [n[0], n[1], n[2]], [n[0] * 1.6, n[1] + 0.12, n[2] * 1.3], 0.012, 0.008, '#9a9aa0', 4); ell(hd, n[0] * 1.6, n[1] + 0.12, n[2] * 1.3, 0.02, 0.012, 0.02, '#9a9aa0', 5, 2); }); } // nails through the crown
  P.head = hd.upload();
  limbs(P, D, c);
  // claws on the hands: re-upload the forearms with long black nails and a bandage on the right
  ['L', 'R'].forEach(function (sd) { var al = M(); ell(al, 0, 0, 0, D.arm * 0.9, D.arm * 0.9, D.arm * 0.9, c.fore, 7, 4); tub(al, [0, 0, 0], [0, -D.al, 0], D.arm * 0.86, D.arm * 0.72, c.fore, 8);
    if (sd === 'R' && !clown) tub(al, [0, -D.al * 0.55, 0], [0, -D.al * 0.95, 0], D.arm * 0.82, D.arm * 0.76, '#d8ccb0', 8);
    ell(al, 0, -D.al - D.hand * 0.6, 0.01, D.hand * 0.95, D.hand * 1.1, D.hand * 0.8, c.hand, 8, 4);
    for (var f = -1; f <= 1; f++) { var fx = f * D.hand * 0.5; tub(al, [fx, -D.al - D.hand * 1.2, 0.02], [fx * 1.2, -D.al - D.hand * 2.3, 0.05], D.hand * 0.22, D.hand * 0.16, c.hand, 5); tub(al, [fx * 1.2, -D.al - D.hand * 2.3, 0.05], [fx * 1.3, -D.al - D.hand * 2.9, 0.09], D.hand * 0.13, 0.0, '#1a1410', 4); }
    P['al' + sd] = al.upload(); });
  var bt = M(); tub(bt, [0, 0, 0], [0, 0.13, 0], 0.045, 0.045, '#f1e7d0', 8, { cap0: 1 }); tub(bt, [0, 0.13, 0], [0, 0.17, 0], 0.048, 0.048, '#c4121c', 8, { cap: 1 }); P.bottle = bt.upload();
  return { P: P, D: D, eyeY: 1.75, tbx: 1 };
}
function buildTB2() { RIGS.tb = tbRig2('f_tb'); RIGS.tbmad = tbRig2('f_tbmad'); RIGS.tbclown = tbRig2('f_tbclown', 1); }
/* he never stands straight: hunched, and his head jerks now and then */
function tbTwitch(Q, tb) { var t = KIT.t + (tb.x || 0) * 0.37; Q.lean += 0.22; Q.hp -= 0.02; var j = Math.sin(t * 1.7) * Math.sin(t * 2.9); if (j > 0.82) { Q.hr += Math.sin(t * 47) * 0.35; Q.hy += Math.sin(t * 31) * 0.25; } Q.hr += 0.12; }
