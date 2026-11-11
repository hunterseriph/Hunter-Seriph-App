/* ---------- the 3D people and things (update 132). Cumhead, Laboozie, TB and TB's boys are Psycho Nightmare's rigs;
   Greebo, Spermaid, Steve, the townsfolk, the foes, the bosses and every prop are built here with the same shapes. ---------- */
HIPAINT.f_greebo = face(function (g) { fEye(g, 44, 60, 12, 15, '#2a1a14', 0.2); fEye(g, 84, 60, 12, 15, '#2a1a14', 0.2); fLine(g, [[30, 40], [44, 32, 58, 40]], 4); fLine(g, [[70, 40], [84, 32, 98, 40]], 4); fShape(g, [[40, 86], [64, 104, 88, 86], [64, 94, 40, 86]], '#5a0c14', '#12040a', 3); }, '#fff6dc');
HIPAINT.f_spermaid = face(function (g) { fEye(g, 46, 62, 13, 16, '#1a8a8a', 0.3); fLine(g, [[72, 64], [84, 58, 96, 64]], 4.5); fLine(g, [[30, 44], [46, 36, 60, 44]], 3); fShape(g, [[50, 88], [64, 98, 80, 86], [64, 92, 50, 88]], '#c4405a', '#12040a', 2.5); g.fillStyle = 'rgba(255,120,150,0.35)'; g.beginPath(); g.arc(30, 80, 9, 0, 6.3); g.arc(98, 80, 9, 0, 6.3); g.fill(); }, '#f1e0b0');
HIPAINT.f_steve = face(function (g) { g.fillStyle = '#ff2630'; g.beginPath(); g.ellipse(44, 56, 10, 13, 0, 0, 6.3); g.ellipse(84, 56, 10, 13, 0, 0, 6.3); g.fill(); fShape(g, [[24, 80], [64, 120, 104, 80], [64, 96, 24, 80]], '#ff2630', '#12040a', 3); g.fillStyle = '#fff'; for (var i = 0; i < 6; i++) g.fillRect(36 + i * 10, 84, 7, 7); }, '#12040a');
function personFace(skin, o) { return face(function (g) { fEye(g, 46, 62, 11, 13, o.eye || '#2a1a14', 0.2); fEye(g, 82, 62, 11, 13, o.eye || '#2a1a14', 0.2); if (o.shades) { g.fillStyle = '#12040a'; g.fillRect(28, 50, 34, 22); g.fillRect(66, 50, 34, 22); g.fillRect(60, 56, 8, 4); } fLine(g, [[34, 44], [46, 38, 58, 44]], 3); fLine(g, [[70, 44], [82, 38, 94, 44]], 3);
  if (o.tache) fShape(g, [[44, 90], [64, 82, 84, 90], [64, 96, 44, 90]], o.tache, '#12040a', 2); fShape(g, [[50, 98], [64, 108, 78, 98], [64, 102, 50, 98]], '#7a1a1e', '#12040a', 2.5); if (o.beard) { g.fillStyle = o.beard; g.beginPath(); g.moveTo(14, 70); g.quadraticCurveTo(64, 140, 114, 70); g.lineTo(104, 70); g.quadraticCurveTo(64, 112, 24, 70); g.fill(); } }, skin); }
/* a person from a few colours: the townsfolk and Greebo's body */
function person(o) { var D = { lu: 0.33, ll: 0.33, tor: 0.42, shW: 0.2, hipW: 0.1, au: 0.24, al: 0.22, arm: 0.055, hand: 0.065, leg: 0.07, neck: 0.04 }, P = {}, c = { sleeve: o.shirt, fore: o.fore || o.shirt, hand: o.hand || o.skin, legs: o.legs, boot: o.boot || '#1a1012' };
  var hp = M(); ell(hp, 0, 0, 0, 0.17, 0.11, 0.12, o.legs, 8, 4); P.hips = hp.upload();
  var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.21, D.tor * 0.56, 0.15, o.shirt, 10, 6); if (o.apron) { ell(to, 0, D.tor * 0.35, 0.05, 0.17, D.tor * 0.45, 0.12, o.apron, 8, 5); if (o.emblem) ell(to, 0, D.tor * 0.45, 0.17, 0.05, 0.05, 0.01, o.emblem, 6, 3); } if (o.belly) ell(to, 0, D.tor * 0.3, 0.08, 0.2, 0.2, 0.16, o.shirt, 10, 6); P.torso = to.upload();
  var hd = M(); if (o.headFn) o.headFn(hd); else { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, o.skin, 12, 8, { face: o.face, fz: 0.25, fw: 0.82, fh: 0.8, fdv: 0.02 });
    var hc = o.hair; if (hc) { ell(hd, 0, 0.3, -0.02, 0.215, 0.18, 0.205, hc, 12, 6, { only: 'back' }); if (o.long) ell(hd, 0, 0.12, -0.08, 0.22, 0.26, 0.15, hc, 10, 6); if (o.fringe) ell(hd, 0, 0.38, 0.06, 0.18, 0.07, 0.14, hc, 10, 4); }
    if (o.hat === 'top') { tub(hd, [0, 0.38, 0], [0, 0.42, 0], 0.32, 0.32, '#12040a', 12, { cap: 1 }); tub(hd, [0, 0.42, 0], [0, 0.72, 0], 0.17, 0.18, '#1a1a1e', 12, { cap: 1 }); tub(hd, [0, 0.44, 0], [0, 0.5, 0], 0.18, 0.18, '#ffe36a', 12); }
    else if (o.hat === 'beanie') { ell(hd, 0, 0.36, -0.01, 0.22, 0.16, 0.21, '#c4121c', 10, 5, { b1: 1.7 }); ell(hd, 0, 0.53, 0, 0.05, 0.05, 0.05, '#ffe36a', 6, 3); }
    else if (o.hat === 'chef') { tub(hd, [0, 0.38, 0], [0, 0.56, 0], 0.17, 0.2, '#f6f0e4', 10); ell(hd, 0, 0.6, 0, 0.24, 0.12, 0.24, '#f6f0e4', 10, 5); }
    else if (o.hat === 'cowboy') { tub(hd, [0, 0.38, 0], [0, 0.4, 0], 0.36, 0.36, '#5a3a1a', 12, { cap: 1 }); ell(hd, 0, 0.47, 0, 0.18, 0.14, 0.17, '#5a3a1a', 10, 5); }
    if (o.specs) [-1, 1].forEach(function (s) { tub(hd, [s * 0.08, 0.25, 0.19], [s * 0.08, 0.25, 0.2], 0.05, 0.05, '#ffc840', 10); }); }
  P.head = hd.upload(); limbs(P, D, c); return { P: P, D: D, eyeY: 1.5 }; }
function buildAdvRigs() { if (RIGS.greebo) return; buildRigs();
  // Greebo: a cream pie for a head, chef's hat, black apron with his red G, white gloves
  RIGS.greebo = person({ shirt: '#1a1a1a', legs: '#1a1a1a', skin: '#ffffff', hand: '#ffffff', apron: '#12040a', emblem: '#c4121c', headFn: function (hd) {
    ell(hd, 0, 0.2, 0, 0.3, 0.16, 0.3, '#d8a050', 12, 6); ell(hd, 0, 0.27, 0.02, 0.27, 0.12, 0.27, '#fff6dc', 12, 6, { face: 'f_greebo', fz: 0.1, fw: 0.9, fh: 1.2, fdv: 0.05 }); for (var c = 0; c < 14; c++) { var a = c / 14 * 6.283; ell(hd, Math.cos(a) * 0.3, 0.2, Math.sin(a) * 0.3, 0.05, 0.05, 0.05, '#b8803a', 5, 3); }
    tub(hd, [0, 0.34, -0.02], [0, 0.56, -0.02], 0.17, 0.19, '#ffffff', 10); ell(hd, 0, 0.62, -0.02, 0.25, 0.13, 0.25, '#ffffff', 10, 5); } });
  // Spermaid: a slim cream droplet, wink, black shell bra, the teal tail curling up behind her, the pink fin; she does not wave
  var D = { lu: 0.3, ll: 0.3, tor: 0.36, shW: 0.17, hipW: 0.08, au: 0.2, al: 0.19, arm: 0.045, hand: 0.055, leg: 0.06, neck: 0.03 }, P = {}, c = { sleeve: '#f1e0b0', fore: '#f1e0b0', hand: '#f1e0b0', legs: '#2a9a9a', boot: '#2a9a9a' };
  var hp = M(); tub(hp, [0, 0.05, 0], [0, -0.35, 0.02], 0.15, 0.11, '#2a9a9a', 10); tub(hp, [0, -0.35, 0.02], [0, -0.55, -0.08], 0.11, 0.07, '#2a9a9a', 10); tub(hp, [0, -0.55, -0.08], [0, -0.52, -0.25], 0.07, 0.04, '#2a9a9a', 8); ell(hp, 0, -0.42, -0.36, 0.17, 0.07, 0.04, '#ff6aa8', 8, 4); for (var k = 0; k < 4; k++) tub(hp, [0, -0.08 * k, 0.12], [0, -0.08 * k - 0.04, 0.11], 0.13 - k * 0.01, 0.12 - k * 0.01, '#3ab0b0', 10); P.hips = hp.upload();
  var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.17, D.tor * 0.58, 0.13, '#f1e0b0', 10, 6); ell(to, -0.07, D.tor * 0.62, 0.1, 0.07, 0.06, 0.05, '#1a1a1a', 8, 4); ell(to, 0.07, D.tor * 0.62, 0.1, 0.07, 0.06, 0.05, '#1a1a1a', 8, 4); P.torso = to.upload();
  var hd = M(); ell(hd, 0, 0.26, 0, 0.27, 0.26, 0.25, '#f1e0b0', 12, 8, { face: 'f_spermaid', fz: 0.25, fw: 0.8, fh: 0.78, fdv: 0.04, tip: 0.2 }); tub(hd, [0, 0.56, -0.02], [-0.05, 0.7, -0.1], 0.08, 0.035, '#f1e0b0', 8); tub(hd, [-0.05, 0.7, -0.1], [0.03, 0.76, -0.16], 0.035, 0.0, '#f1e0b0', 6); P.head = hd.upload();
  var dr = M(); ell(dr, 0, 0, 0, 0.05, 0.05, 0.05, '#f1e0b0', 8, 5); tub(dr, [0, 0.03, 0], [0, 0.11, 0], 0.045, 0.0, '#f1e0b0', 8); P.drip = dr.upload();
  limbs(P, D, c); var none = M(); ell(none, 0, -0.05, 0, 0.01, 0.01, 0.01, '#2a9a9a', 3, 2); var nm = none.upload(); P.luL = P.luR = P.llL = P.llR = nm; RIGS.spermaid = { P: P, D: D, eyeY: 1.3, drip: 1 };
  // the townsfolk
  RIGS.amy = person({ skin: '#f0c8a0', shirt: '#c4121c', legs: '#1a1a1a', hair: '#ff8ac0', long: 1, fringe: 1, face: 'f_amy' }); HIPAINT.f_amy = personFace('#f0c8a0', {});
  RIGS.saba = person({ skin: '#e0b090', shirt: '#3a8a2a', legs: '#2a2a2a', hat: 'beanie', face: 'f_saba', beard: 1 }); HIPAINT.f_saba = personFace('#e0b090', { shades: 1, beard: '#e8e0d8' });
  RIGS.joff = person({ skin: '#f0c8a0', shirt: '#f1e7d0', legs: '#2a2a2a', hat: 'chef', apron: '#c4121c', face: 'f_joff' }); HIPAINT.f_joff = personFace('#f0c8a0', { tache: '#3a2418' });
  RIGS.beeb = person({ skin: '#f0c8a0', shirt: '#3a2a1a', legs: '#1a1a1a', hair: '#c86a2a', face: 'f_beeb', belly: 1 }); HIPAINT.f_beeb = personFace('#f0c8a0', { beard: '#c86a2a' });
  RIGS.harold = person({ skin: '#f0c8a0', shirt: '#a8141e', legs: '#3a2a2a', hat: 'top', specs: 1, face: 'f_harold' }); HIPAINT.f_harold = personFace('#f0c8a0', { beard: '#6a3a1e' });
  RIGS.kaya = person({ skin: '#f0c8a0', shirt: '#c4121c', legs: '#1a1a1a', hair: '#8a3a20', long: 1, apron: '#f1e7d0', face: 'f_kaya' }); HIPAINT.f_kaya = personFace('#f0c8a0', {});
  RIGS.ali = person({ skin: '#d8a880', shirt: '#f1e7d0', legs: '#2a2a2a', hair: '#2a1a10', apron: '#3a9a2a', face: 'f_ali' }); HIPAINT.f_ali = personFace('#d8a880', {});
  RIGS.potbelly = person({ skin: '#ff9ab4', shirt: '#c4121c', legs: '#1a1a1a', belly: 1, headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.24, 0.22, 0.22, '#ff9ab4', 12, 8, { face: 'f_pig', fz: 0.3 }); ell(hd, 0, 0.18, 0.22, 0.08, 0.06, 0.05, '#ff7aa0', 8, 4); [-1, 1].forEach(function (s) { tub(hd, [s * 0.14, 0.38, 0], [s * 0.2, 0.5, 0.04], 0.07, 0.01, '#ff9ab4', 6); }); } }); HIPAINT.f_pig = personFace('#ff9ab4', {});
  // Steve: a black droplet with a red outline, red eyes, the big grin
  var st = M(); ell(st, 0, 0.7, 0, 0.5, 0.55, 0.48, '#12040a', 14, 9, { face: 'f_steve', fz: 0.2, fw: 0.85, fh: 0.85, tip: 0.6 }); ell(st, 0, 0.7, 0, 0.52, 0.56, 0.5, '#c4121c', 14, 9, { only: 'back', tip: 0.6 }); tub(st, [-0.45, 0.6, 0], [-0.72, 0.95, 0.1], 0.08, 0.06, '#12040a', 6); tub(st, [0.45, 0.6, 0], [0.62, 0.4, 0.1], 0.08, 0.06, '#12040a', 6); RIGS.steveM = st.upload();
}
function rigFor(who) { return RIGS[CHARS[who] ? CHARS[who].rig : who] || RIGS[who]; }
/* foes that are not people */
var FOEM = {};
function foeMesh(k) { if (FOEM[k]) return FOEM[k]; var m = M();
  if (k === 'rat') { ell(m, 0, 0.3, 0, 0.28, 0.24, 0.45, '#5a4a52', 10, 6); ell(m, 0, 0.36, 0.45, 0.16, 0.15, 0.2, '#5a4a52', 8, 5); ell(m, 0, 0.36, 0.64, 0.05, 0.05, 0.05, '#ff7ab8', 6, 3); [-1, 1].forEach(function (s) { ell(m, s * 0.12, 0.5, 0.42, 0.08, 0.1, 0.03, '#ff9ab4', 6, 3); ell(m, s * 0.07, 0.42, 0.6, 0.03, 0.03, 0.02, '#ff2630', 5, 3); }); tub(m, [0, 0.3, -0.45], [0, 0.4, -1.1], 0.05, 0.01, '#ff9ab4', 5); }
  else if (k === 'bat') { ell(m, 0, 0, 0, 0.2, 0.22, 0.2, '#2a1a24', 8, 5); [-1, 1].forEach(function (s) { m.quad([s * 0.15, 0.1, 0], [s * 0.9, 0.3, -0.1], [s * 0.75, -0.1, -0.05], [s * 0.15, -0.1, 0], [0, 0, 1, 0, 1, 1, 0, 1], TL('white'), C('#3a1a2a'), [0, 0, 1]); ell(m, s * 0.08, 0.06, 0.18, 0.04, 0.04, 0.02, '#ff2630', 5, 3); }); }
  else if (k === 'blob') { ell(m, 0, 0.45, 0, 0.55, 0.45, 0.55, '#f1e0b0', 12, 7, { tip: 0.3 }); [-1, 1].forEach(function (s) { ell(m, s * 0.17, 0.55, 0.48, 0.08, 0.1, 0.04, '#12040a', 6, 4); }); }
  else if (k === 'jelly') { ell(m, 0, 0, 0, 0.5, 0.35, 0.5, '#ff9ad8', 12, 5, { b1: 1.7 }); for (var t = 0; t < 6; t++) { var a = t / 6 * 6.283; tub(m, [Math.cos(a) * 0.3, -0.05, Math.sin(a) * 0.3], [Math.cos(a) * 0.35, -0.8, Math.sin(a) * 0.35], 0.05, 0.02, '#ff7ac8', 5); } }
  else if (k === 'balloon') { ell(m, 0, 0.3, 0, 0.42, 0.5, 0.4, '#12040a', 12, 7, { face: 'f_steve', fz: 0.25, tip: 0.3 }); tub(m, [0, -0.2, 0], [0, -1.2, 0], 0.01, 0.01, '#f1e7d0', 3); }
  else if (k === 'crab') { ell(m, 0, 0.3, 0, 0.45, 0.2, 0.35, '#e8502a', 10, 5); [-1, 1].forEach(function (s) { tub(m, [s * 0.35, 0.3, 0.2], [s * 0.6, 0.45, 0.45], 0.06, 0.06, '#e8502a', 5); ell(m, s * 0.62, 0.5, 0.52, 0.14, 0.1, 0.12, '#ff6a3a', 6, 4); for (var l = 0; l < 3; l++) tub(m, [s * 0.35, 0.25, -0.15 + l * 0.15], [s * 0.6, 0.0, -0.2 + l * 0.15], 0.03, 0.02, '#c8401a', 4); tub(m, [s * 0.1, 0.45, 0.25], [s * 0.12, 0.6, 0.28], 0.02, 0.02, '#c8401a', 4); ell(m, s * 0.12, 0.62, 0.28, 0.04, 0.04, 0.04, '#12040a', 5, 3); }); }
  else if (k === 'wasp') { ell(m, 0, 0, 0, 0.18, 0.18, 0.22, '#1a1a1a', 8, 5); ell(m, 0, -0.05, -0.35, 0.2, 0.2, 0.3, '#ffd020', 10, 6); for (var b = 0; b < 3; b++) tub(m, [0, -0.05, -0.2 - b * 0.12], [0, -0.05, -0.24 - b * 0.12], 0.21, 0.2, '#1a1a1a', 10); [-1, 1].forEach(function (s) { ell(m, s * 0.25, 0.18, -0.05, 0.25, 0.04, 0.12, '#d8f0ff', 8, 3); ell(m, s * 0.08, 0.05, 0.18, 0.05, 0.05, 0.03, '#ff2630', 5, 3); }); }
  else if (k === 'imp') { ell(m, 0, 0, 0, 0.28, 0.3, 0.26, '#c4121c', 10, 6); [-1, 1].forEach(function (s) { tub(m, [s * 0.12, 0.25, 0], [s * 0.2, 0.48, 0.05], 0.06, 0.005, '#12040a', 5); ell(m, s * 0.1, 0.06, 0.24, 0.05, 0.06, 0.03, '#ffe36a', 6, 3); m.quad([s * 0.2, 0.1, -0.1], [s * 0.7, 0.35, -0.25], [s * 0.6, -0.15, -0.2], [s * 0.2, -0.1, -0.1], [0, 0, 1, 0, 1, 1, 0, 1], TL('white'), C('#6a0a10'), [0, 0, 1]); }); tub(m, [0, -0.2, -0.2], [0, -0.5, -0.5], 0.04, 0.01, '#c4121c', 4); }
  // bosses that are not people
  else if (k === 'pig') { ell(m, 0, 0.75, 0, 0.6, 0.55, 0.75, '#ff9ab4', 14, 8); ell(m, 0, 1.0, 0.75, 0.42, 0.4, 0.38, '#ff9ab4', 12, 8, { face: 'f_pig', fz: 0.3 }); ell(m, 0, 0.92, 1.1, 0.16, 0.12, 0.08, '#ff7aa0', 8, 4); [-1, 1].forEach(function (s) { tub(m, [s * 0.25, 1.3, 0.7], [s * 0.4, 1.55, 0.75], 0.12, 0.01, '#ff9ab4', 6); tub(m, [s * 0.35, 0.4, 0.4], [s * 0.35, 0, 0.42], 0.13, 0.12, '#ff9ab4', 6); tub(m, [s * 0.35, 0.4, -0.4], [s * 0.35, 0, -0.42], 0.13, 0.12, '#ff9ab4', 6); }); tub(m, [0, 1.38, 0.72], [0, 1.42, 0.72], 0.5, 0.5, '#5a3a1a', 12, { cap: 1 }); ell(m, 0, 1.5, 0.72, 0.25, 0.16, 0.24, '#5a3a1a', 10, 5); }
  else if (k === 'kraken') { ell(m, 0, 1.4, 0, 0.8, 0.95, 0.75, '#f1e0b0', 14, 8, { tip: 0.5 }); [-1, 1].forEach(function (s) { ell(m, s * 0.28, 1.4, 0.68, 0.14, 0.18, 0.06, '#12040a', 8, 4); }); for (var t2 = 0; t2 < 8; t2++) { var a2 = t2 / 8 * 6.283, px = Math.cos(a2) * 0.55, pz = Math.sin(a2) * 0.55; tub(m, [px, 0.7, pz], [px * 2, 0.2, pz * 2], 0.18, 0.1, '#e8d0a0', 6); tub(m, [px * 2, 0.2, pz * 2], [px * 2.8, 0.5, pz * 2.8], 0.1, 0.02, '#e8d0a0', 6); } }
  else if (k === 'hotload') { ell(m, 0, 0.9, 0, 0.8, 0.8, 0.8, '#ff6a20', 14, 8, { tip: 0.6 }); ell(m, 0, 1.0, 0.4, 0.5, 0.45, 0.45, '#ffd040', 10, 6); [-1, 1].forEach(function (s) { ell(m, s * 0.25, 1.15, 0.75, 0.1, 0.13, 0.05, '#12040a', 6, 4); }); for (var f = 0; f < 8; f++) { var a3 = f / 8 * 6.283; tub(m, [Math.cos(a3) * 0.6, 1.3, Math.sin(a3) * 0.6], [Math.cos(a3) * 0.4, 2.2, Math.sin(a3) * 0.4], 0.18, 0.0, '#ffb030', 5); } }
  return (FOEM[k] = m.upload()); }
/* props */
var PROPM = {};
function propMesh(k) { if (PROPM[k]) return PROPM[k]; var m = M();
  if (k === 'drop') { ell(m, 0, 0, 0, 0.22, 0.22, 0.22, '#fff6dc', 10, 7, { tip: 0.45 }); ell(m, -0.07, 0.07, 0.15, 0.05, 0.06, 0.03, '#ffffff', 6, 3); }
  else if (k === 'chalice') { tub(m, [0, 0, 0], [0, 0.06, 0], 0.32, 0.32, '#ffc840', 12, { cap: 1 }); tub(m, [0, 0.06, 0], [0, 0.55, 0], 0.07, 0.07, '#ffc840', 8); ell(m, 0, 0.58, 0, 0.14, 0.08, 0.14, '#ffd860', 8, 4); tub(m, [0, 0.62, 0], [0, 1.05, 0], 0.18, 0.42, '#ffc840', 14); tub(m, [0, 1.0, 0], [0, 1.03, 0], 0.4, 0.4, '#c4121c', 14); ell(m, 0, 0.82, 0.3, 0.07, 0.07, 0.04, '#ff2630', 6, 3); }
  else if (k === 'spring') { tub(m, [0, 0, 0], [0, 0.15, 0], 0.6, 0.6, '#3a3a40', 12, { cap: 1 }); for (var i = 0; i < 4; i++) tub(m, [0, 0.15 + i * 0.08, 0], [0, 0.19 + i * 0.08, 0], 0.4, 0.4, '#c8c8d0', 10); tub(m, [0, 0.47, 0], [0, 0.55, 0], 0.62, 0.62, '#c4121c', 12, { cap: 1 }); tub(m, [0, 0.55, 0], [0, 0.57, 0], 0.35, 0.35, '#ffe36a', 12, { cap: 1 }); }
  else if (k === 'box') { bxp(m, -0.45, 0, -0.45, 0.45, 0.9, 0.45, '#c8c8d0', TL('steel')); bxp(m, -0.38, 0.15, 0.44, 0.38, 0.75, 0.47, '#12040a'); ell(m, 0, 0.45, 0.47, 0.18, 0.2, 0.02, '#f1e0b0', 8, 4, { tip: 0.2 }); }
  else if (k === 'check') { tub(m, [0, 0, 0], [0, 1.8, 0], 0.07, 0.07, '#2a2a30', 8); ell(m, 0, 1.95, 0, 0.18, 0.18, 0.18, '#c4121c', 8, 5); }
  else if (k === 'checkon') { tub(m, [0, 0, 0], [0, 1.8, 0], 0.07, 0.07, '#2a2a30', 8); ell(m, 0, 1.95, 0, 0.18, 0.18, 0.18, '#ffe36a', 8, 5); }
  else if (k === 'gate') { // the goal: a gothic gateway with the red moon swirling in it (like the Spermhog's)
    bxp(m, -2.4, 0, -0.4, -1.6, 4.4, 0.4, '#5a4a52', TL('stonewall')); bxp(m, 1.6, 0, -0.4, 2.4, 4.4, 0.4, '#5a4a52', TL('stonewall')); for (var s = 0; s <= 8; s++) { var a = s / 8 * Math.PI; bxp(m, Math.cos(a) * 2 - 0.4, 4.2 + Math.sin(a) * 1.4, -0.4, Math.cos(a) * 2 + 0.4, 4.6 + Math.sin(a) * 1.4, 0.4, '#5a4a52', TL('stonewall')); } }
  else if (k === 'pad') { m.quad([-1.2, 0.04, -1.2], [1.2, 0.04, -1.2], [1.2, 0.04, 1.2], [-1.2, 0.04, 1.2], [1, 1, 0, 1, 0, 0, 1, 0], TL('dashpad'), [0.5, 0.5, 0.5], [0, 1, 0], 0.8); }
  else if (k === 'ingr0') { ell(m, 0, 0.3, 0, 0.3, 0.3, 0.3, '#fff6dc', 10, 6, { tip: 0.4 }); }
  else if (k === 'ingr1') { ell(m, 0, 0.3, 0, 0.28, 0.28, 0.28, '#c4121c', 10, 6); tub(m, [0, 0.55, 0], [0.1, 0.8, 0], 0.03, 0.02, '#3a6a1a', 4); }
  else if (k === 'ingr2') { tub(m, [0, 0, 0], [0, 0.25, 0], 0.4, 0.42, '#d8a050', 12, { cap: 1 }); ell(m, 0, 0.3, 0, 0.36, 0.12, 0.36, '#ffe36a', 10, 4); }
  else if (k === 'fruit') { ell(m, 0, 0, 0, 0.16, 0.16, 0.16, '#ff2630', 8, 5); tub(m, [0, 0.14, 0], [0.04, 0.24, 0], 0.02, 0.01, '#3a6a1a', 4); }
  else if (k === 'egg') { ell(m, 0, 0.3, 0, 0.24, 0.3, 0.24, '#f1e7d0', 10, 7); ell(m, 0.08, 0.38, 0.2, 0.05, 0.05, 0.02, '#c4121c', 5, 3); ell(m, -0.1, 0.26, 0.2, 0.04, 0.04, 0.02, '#c4121c', 5, 3); }
  else if (k === 'bag') { ell(m, 0, 0, 0, 0.16, 0.18, 0.16, '#8a6a3a', 8, 5); ell(m, 0, 0.2, 0, 0.08, 0.1, 0.08, '#ff7a20', 6, 4); }
  else if (k === 'pill') { tub(m, [0, -0.15, 0], [0, 0.15, 0], 0.12, 0.12, '#ffffff', 8, { cap: 1, cap0: 1 }); tub(m, [0, 0, 0], [0, 0.15, 0], 0.125, 0.125, '#c4121c', 8, { cap: 1 }); }
  return (PROPM[k] = m.upload()); }
PAINT.dashpad = function (p) { p.fill('#2a2a30'); for (var y = 0; y < 32; y += 10) { p.rect(8, y, 16, 4, '#ffe36a'); p.rect(12, y + 4, 8, 3, '#ffe36a'); } };
PAINT.pave = function (p) { p.fill('#3a2a2e'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 16) p.rect(x + (y % 16 ? 8 : 0), y, 15, 7, '#46343a'); p.speck(['#2e2024', '#52404a'], 80); };
PAINT.citywall = pBricks('#3a1a1e', '#14080a', 8, 16);
PAINT.stonef = function (p) { p.fill('#5a4a32'); for (var y = 0; y < 32; y += 16) for (var x = 0; x < 32; x += 16) p.rect(x + 1, y + 1, 14, 14, '#64543a'); p.speck(['#4a3c28'], 80); };
PAINT.parkfloor = function (p) { p.fill('#e05a98'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) if ((x + y) % 16) p.rect(x, y, 8, 8, '#ff7ab8'); };
PAINT.checker = function (p) { for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) p.rect(x, y, 8, 8, (x + y) % 16 ? '#f1e7d0' : '#12040a'); };
PAINT.polka = function (p) { p.fill('#c4121c'); for (var y = 2; y < 32; y += 10) for (var x = 2; x < 32; x += 10) p.rect(x + (y % 20 ? 5 : 0), y, 4, 4, '#ffe36a'); };
PAINT.sand = function (p) { p.fill('#e8d8a8'); p.speck(['#d8c898', '#f4e8c0', '#c8b888'], 260); };
PAINT.rockt = function (p) { p.fill('#7a6a5a'); p.speck(['#6a5a4a', '#8a7a6a', '#5a4a3a'], 300); p.rect(0, 0, 32, 2, '#9a8a7a'); };
PAINT.coral = function (p) { p.fill('#c86a8a'); p.speck(['#e88aa8', '#a84a6a', '#ff9ab8'], 260); };
PAINT.ash = function (p) { p.fill('#3a2a24'); p.speck(['#2a1e1a', '#4a362e', '#ff6a20'], 200); };
PAINT.shipdeck = function (p) { p.fill('#4a4a52'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#3a3a42'); p.rect(0, 15, 32, 1, '#3a3a42'); for (var k = 0; k < 4; k++) p.px(3 + k * 8, 3, '#7a7a80'); };
PAINT.wetbrick = pBricks('#3e3426', '#1e1810', 8, 16);
PAINT.grass = function (p) { p.fill('#3a5a2a'); p.speck(['#2a4a1e', '#4a6a34', '#5a7a3a'], 320); };
PAINT.hedge = function (p) { p.fill('#24401a'); p.speck(['#1a3010', '#2e5222', '#3a6028'], 320); };
PAINT.lava = function (p) { p.fill('#c4301a'); p.speck(['#ff7a2a', '#ffb030', '#8a1a0a'], 200); };
PAINT.water = PAINT.water || function (p) { p.fill('#ffffff'); for (var i = 0; i < 30; i++) p.rect(Math.floor(p.rnd() * 28), Math.floor(p.rnd() * 32), 4, 1, '#e0e8f0'); };
