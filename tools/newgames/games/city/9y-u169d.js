/* ---------- update 169: the wildlife rebuilt (he said the animals were poles with legs that weren't attached and didn't
   walk). Each animal is a body, a head on its own pivot and legs in two parts joined at the knee, drawn every frame:
   cows, sheep and deer walk with a real four-legged gait (the diagonal legs together, knees folding as a foot lifts),
   run faster with a longer stride, lower their heads to graze, flick their tails; rabbits hop on long back legs; chickens
   strut and peck. They fall over stiff when a car gets them. ---------- */
var ANB = {};
function anBuild(k) { if (ANB[k]) return ANB[k]; var B = { body: new R3.Mesh(), head: new R3.Mesh(), tail: new R3.Mesh(), up: new R3.Mesh(), lo: new R3.Mesh(), up2: null, lo2: null, legs: [] };
  var b = B.body, h = B.head;
  function leg(m, L, r0, r1, col, hoof, hcol) { tub(m, [0, 0, 0], [0, -L, 0], r0, r1, col, 7, { cap0: 1 }); ell(m, 0, 0, 0, r0 * 1.05, r0 * 1.05, r0 * 1.05, col, 6, 4); if (hoof) { tub(m, [0, -L + 0.07, 0.01], [0, -L - 0.01, 0.02], r1 * 1.05, r1 * 1.15, hcol, 7, { cap: 1 }); } }
  if (k === 'cow') { var W = '#f1ece0', D = '#1a1416', PK = '#e8a8a0';
    ell(b, 0, 1.3, 0, 0.56, 0.5, 1.0, W, 14, 8); ell(b, 0, 1.15, 0.05, 0.5, 0.4, 0.8, W, 12, 6); // body and belly
    [[0.38, 1.45, 0.25, 0.32, 0.34, 0.42], [-0.32, 1.25, -0.45, 0.35, 0.32, 0.4], [0.2, 1.62, -0.6, 0.3, 0.12, 0.3], [-0.45, 1.4, 0.45, 0.14, 0.24, 0.26]].forEach(function (q) { ell(b, q[0], q[1], q[2], q[3], q[4], q[5], D, 8, 5); });
    ell(b, 0, 0.88, -0.45, 0.2, 0.13, 0.22, PK, 8, 4); [[-0.08, -0.4], [0.08, -0.4], [-0.08, -0.52], [0.08, -0.52]].forEach(function (q) { tub(b, [q[0], 0.8, q[1]], [q[0], 0.72, q[1]], 0.03, 0.02, PK, 4, { cap: 1 }); }); // udder
    tub(b, [0, 1.45, 0.75], [0, 1.5, 1.05], 0.28, 0.24, W, 10); // neck
    ell(h, 0, 0.05, 0.12, 0.24, 0.26, 0.3, W, 10, 6); ell(h, 0, -0.08, 0.38, 0.19, 0.16, 0.16, PK, 8, 5); [-1, 1].forEach(function (s) { ell(h, s * 0.07, -0.08, 0.53, 0.035, 0.03, 0.02, D, 4, 3); ell(h, s * 0.16, 0.12, 0.25, 0.05, 0.06, 0.04, D, 5, 4); ell(h, s * 0.17, 0.13, 0.28, 0.02, 0.025, 0.015, '#f1e7d0', 4, 3);
      ell(h, s * 0.3, 0.1, 0.05, 0.14, 0.05, 0.08, W, 6, 4); tub(h, [s * 0.15, 0.24, 0.02], [s * 0.3, 0.38, -0.02], 0.045, 0.02, '#d8c8a0', 5, { cap: 1 }); }); ell(h, 0, 0.22, 0.08, 0.16, 0.08, 0.14, D, 6, 4);
    tub(B.tail, [0, 0, 0], [0, -0.55, -0.06], 0.035, 0.03, W, 5); ell(B.tail, 0, -0.62, -0.07, 0.07, 0.12, 0.07, D, 6, 4);
    leg(B.up, 0.46, 0.11, 0.09, W); leg(B.lo, 0.48, 0.08, 0.065, W, 1, D);
    B.hip = 0.94; B.legs = [[0.27, 0.62], [-0.27, 0.62], [0.27, -0.62], [-0.27, -0.62]]; B.headAt = [0, 1.5, 1.08]; B.tailAt = [0, 1.62, -0.98]; B.amp = 0.42; }
  else if (k === 'sheep') { var WO = '#ece6d6', DK = '#1a1416';
    ell(b, 0, 0.95, 0, 0.46, 0.42, 0.66, WO, 12, 7); for (var q = 0; q < 14; q++) { var aa = q * 2.4, yy = 0.95 + Math.sin(q * 1.3) * 0.25; ell(b, Math.cos(aa) * 0.36, yy, Math.sin(aa * 0.7) * 0.5, 0.2, 0.18, 0.2, q % 3 ? WO : '#f6f2e8', 6, 4); }
    ell(b, 0, 1.08, 0.58, 0.24, 0.24, 0.2, WO, 8, 5);
    ell(h, 0, 0, 0.12, 0.13, 0.17, 0.22, DK, 8, 5); ell(h, 0, 0.12, 0.02, 0.15, 0.1, 0.13, WO, 6, 4); [-1, 1].forEach(function (s) { ell(h, s * 0.17, 0.02, 0.06, 0.11, 0.04, 0.06, DK, 5, 3); ell(h, s * 0.08, 0.04, 0.24, 0.025, 0.025, 0.02, '#e8d890', 4, 3); });
    ell(B.tail, 0, -0.08, -0.04, 0.08, 0.12, 0.07, WO, 6, 4);
    leg(B.up, 0.3, 0.06, 0.05, DK); leg(B.lo, 0.32, 0.045, 0.038, DK, 1, '#0a0606');
    B.hip = 0.62; B.legs = [[0.2, 0.42], [-0.2, 0.42], [0.2, -0.42], [-0.2, -0.42]]; B.headAt = [0, 1.05, 0.74]; B.tailAt = [0, 1.05, -0.68]; B.amp = 0.45; }
  else if (k === 'deer') { var BR = '#8a5a34', LT = '#c8a070', DD = '#4a2a18';
    ell(b, 0, 1.2, 0, 0.3, 0.33, 0.72, BR, 12, 7); ell(b, 0, 1.06, 0.02, 0.24, 0.2, 0.6, LT, 10, 5); ell(b, 0, 1.25, -0.7, 0.16, 0.18, 0.08, '#f1e7d0', 6, 4);
    tub(b, [0, 1.3, 0.5], [0, 1.78, 0.78], 0.15, 0.1, BR, 8); ell(b, 0, 1.55, 0.7, 0.1, 0.14, 0.08, LT, 6, 4);
    ell(h, 0, 0.02, 0.1, 0.12, 0.14, 0.2, BR, 8, 5); ell(h, 0, -0.04, 0.3, 0.07, 0.07, 0.1, '#6a4028', 6, 4); ell(h, 0, -0.04, 0.4, 0.04, 0.035, 0.03, '#12040a', 4, 3);
    [-1, 1].forEach(function (s) { ell(h, s * 0.11, 0.06, 0.18, 0.03, 0.035, 0.025, '#12040a', 4, 3); ell(h, s * 0.15, 0.18, 0.0, 0.05, 0.12, 0.03, BR, 5, 3); });
    tub(B.tail, [0, 0, 0], [0, -0.15, -0.05], 0.05, 0.04, BR, 5); ell(B.tail, 0, -0.1, -0.06, 0.05, 0.08, 0.03, '#f1e7d0', 5, 3);
    leg(B.up, 0.47, 0.07, 0.05, BR); leg(B.lo, 0.48, 0.045, 0.03, DD, 1, '#12040a');
    // a buck's antlers go on a second head
    B.head2 = new R3.Mesh(); var h2 = B.head2; ell(h2, 0, 0.02, 0.1, 0.12, 0.14, 0.2, BR, 8, 5); ell(h2, 0, -0.04, 0.3, 0.07, 0.07, 0.1, '#6a4028', 6, 4); ell(h2, 0, -0.04, 0.4, 0.04, 0.035, 0.03, '#12040a', 4, 3);
    [-1, 1].forEach(function (s) { ell(h2, s * 0.11, 0.06, 0.18, 0.03, 0.035, 0.025, '#12040a', 4, 3); ell(h2, s * 0.15, 0.18, 0.0, 0.05, 0.12, 0.03, BR, 5, 3); var A0 = [s * 0.06, 0.12, 0.05], A1 = [s * 0.2, 0.42, -0.02], A2 = [s * 0.28, 0.62, 0.08];
      tub(h2, A0, A1, 0.025, 0.02, '#d8c8a0', 5); tub(h2, A1, A2, 0.02, 0.012, '#d8c8a0', 5, { cap: 1 }); tub(h2, A1, [s * 0.14, 0.58, 0.1], 0.015, 0.01, '#d8c8a0', 4, { cap: 1 }); tub(h2, [s * 0.24, 0.52, 0.02], [s * 0.36, 0.6, -0.08], 0.014, 0.009, '#d8c8a0', 4, { cap: 1 }); });
    B.head2 = h2.upload();
    B.hip = 0.95; B.legs = [[0.16, 0.5], [-0.16, 0.5], [0.16, -0.52], [-0.16, -0.52]]; B.headAt = [0, 1.82, 0.84]; B.tailAt = [0, 1.32, -0.72]; B.amp = 0.5; }
  else if (k === 'rabbit') { var GR = '#9a8a7a', GL = '#c8b8a8';
    ell(b, 0, 0.19, -0.02, 0.12, 0.13, 0.19, GR, 10, 6); ell(b, 0, 0.15, 0.04, 0.09, 0.08, 0.14, GL, 8, 4); ell(b, 0, 0.21, -0.2, 0.05, 0.05, 0.05, '#f1ece0', 5, 4);
    [-1, 1].forEach(function (s) { ell(b, s * 0.09, 0.12, -0.1, 0.05, 0.08, 0.11, GR, 6, 4); });
    ell(h, 0, 0, 0.04, 0.085, 0.085, 0.1, GR, 8, 5); ell(h, 0, -0.02, 0.12, 0.035, 0.03, 0.03, GL, 5, 3); [-1, 1].forEach(function (s) { ell(h, s * 0.05, 0.02, 0.09, 0.016, 0.02, 0.012, '#12040a', 4, 3); tub(h, [s * 0.03, 0.06, 0.0], [s * 0.05, 0.22, -0.04], 0.022, 0.016, GR, 5, { cap: 1 }); });
    leg(B.up, 0.07, 0.025, 0.02, GR); leg(B.lo, 0.06, 0.02, 0.016, GR, 1, GL);
    B.hip = 0.13; B.legs = [[0.06, 0.1], [-0.06, 0.1]]; B.headAt = [0, 0.3, 0.17]; B.amp = 0.3; B.hop = 1; }
  else if (k === 'chicken') { var CW = '#f1ece0', Y = '#e0a020';
    ell(b, 0, 0.32, -0.02, 0.13, 0.14, 0.19, CW, 10, 6); [-1, 1].forEach(function (s) { ell(b, s * 0.12, 0.33, -0.04, 0.03, 0.09, 0.13, '#e8e2d4', 6, 4); }); tub(b, [0, 0.36, -0.15], [0, 0.48, -0.24], 0.07, 0.02, CW, 6, { cap: 1 });
    ell(h, 0, 0, 0.02, 0.07, 0.08, 0.07, CW, 8, 5); ell(h, 0, 0.09, 0.02, 0.025, 0.045, 0.05, '#c4121c', 5, 3); ell(h, 0, -0.06, 0.07, 0.02, 0.03, 0.015, '#c4121c', 4, 3); tub(h, [0, 0, 0.07], [0, -0.01, 0.13], 0.022, 0, Y, 4); [-1, 1].forEach(function (s) { ell(h, s * 0.055, 0.02, 0.04, 0.012, 0.014, 0.01, '#12040a', 3, 3); });
    leg(B.up, 0.09, 0.018, 0.014, Y); leg(B.lo, 0.09, 0.013, 0.011, Y); tub(B.lo, [0, -0.09, 0], [0, -0.095, 0.06], 0.01, 0.006, Y, 3, { cap: 1 });
    B.hip = 0.2; B.legs = [[0.05, 0], [-0.05, 0]]; B.headAt = [0, 0.45, 0.13]; B.amp = 0.6; B.biped = 1; }
  ['body', 'head', 'tail', 'up', 'lo'].forEach(function (n) { B[n] = B[n].n ? B[n].upload() : null; });
  ANB[k] = B; return B; }
function anDraw(A) { var B = anBuild(A.k), y = groundY(A.x, A.z), dead = A.st === 'dead', run = A.sp > (ANSPD[A.k] || 1) * 0.6, ph = A.ph || 0;
  var bob = 0, pitch = 0; if (!dead) { if (B.hop) { bob = A.sp > 0.3 ? Math.abs(Math.sin(ph)) * 0.22 : 0; pitch = A.sp > 0.3 ? -Math.cos(ph) * 0.25 : 0; } else bob = A.sp > 0.2 ? Math.abs(Math.sin(ph * 2)) * (run ? 0.06 : 0.025) : 0; }
  var base = MD(A.x, y + bob, A.z, A.a, pitch, dead ? Math.PI / 2 : 0);
  if (B.body) R3.draw(B.body, ATT, { m: base });
  // the legs: diagonal pairs swing together, the knee folds as the foot comes forward
  var amp = dead ? 0 : (A.sp > 0.15 ? (run ? B.amp * 1.7 : B.amp) : 0), off = B.biped ? [0, Math.PI] : [0, Math.PI, Math.PI, 0];
  B.legs.forEach(function (L, i) { var s = Math.sin(ph + off[i]), sw = -s * amp, kn = Math.max(0, Math.cos(ph + off[i])) * amp * 1.4, dz = dead ? (i < 2 ? 0.35 : -0.35) : 0;
    if (B.hop && !dead) { var front = L[1] > 0; sw = A.sp > 0.3 ? (front ? -0.6 : 0.9) * Math.sin(ph) : 0; kn = A.sp > 0.3 ? 0.6 * Math.abs(Math.sin(ph)) : 0.4; }
    var up = MM(base, MD(L[0], B.hip, L[1], 0, sw + dz, 0)); if (B.up) R3.draw(B.up, ATT, { m: up });
    var ul = B.hip > 0.5 ? (A.k === 'cow' ? 0.46 : A.k === 'sheep' ? 0.3 : 0.47) : (A.k === 'rabbit' ? 0.07 : 0.09);
    if (B.lo) R3.draw(B.lo, ATT, { m: MM(up, MD(0, -ul, 0, 0, kn, 0)) }); });
  // the head: grazing lowers it, a walk nods it, a chicken pecks
  var graze = !dead && A.st === 'idle' && (A.k === 'cow' || A.k === 'sheep' || A.k === 'deer' && Math.sin(ph * 0.1 + A.x) > 0.3) ? 0.95 : 0, nod = A.sp > 0.2 ? Math.sin(ph * 2) * 0.08 : 0;
  if (A.k === 'chicken' && !dead && A.st === 'idle') graze = Math.max(0, Math.sin(G.t * 3 + A.x)) > 0.8 ? 1.1 : 0.1;
  var hd = B.headAt, hm = MM(base, MD(hd[0], hd[1], hd[2], 0, graze + nod, 0)); var HM = A.k === 'deer' && A.buck && B.head2 ? B.head2 : B.head; if (HM) R3.draw(HM, ATT, { m: hm });
  if (B.tail && B.tailAt) R3.draw(B.tail, ATT, { m: MM(base, MD(B.tailAt[0], B.tailAt[1], B.tailAt[2], Math.sin(G.t * 2.3 + A.x) * 0.35, 0.15, 0)) }); }
drawAnimals = function () { ANIM.forEach(function (A) { if (dist2(A.x, A.z, CAM.x, CAM.z) > 120 * 120 || !inView(A.x, A.z, 3)) return; if (A.k === 'deer' && A.buck === undefined) A.buck = Math.random() < 0.4; anDraw(A); }); };
/* the walk cycle goes at the pace of the legs (the old one ran the phase at the speed alone) */
(function () { var sa = stepAnimals; stepAnimals = function (dt) { sa(dt); ANIM.forEach(function (A) { if (A.st === 'dead') return; var B = anBuild(A.k), stride = B.hip * (A.k === 'rabbit' ? 2.6 : 1.5); A.ph += A.sp * dt / Math.max(0.15, stride) * 2.2 - A.sp * dt * (A.k === 'rabbit' ? 5 : 3); }); }; })();
