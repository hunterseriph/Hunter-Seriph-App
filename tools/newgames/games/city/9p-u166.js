/* update 166 (his playtest): the townsfolk rebuilt (he said they were ugly: massive grins, massive noses, palms always out,
   basic shapes). Every person made with person() gets a new body: a smaller, properly shaped head (skull, cheeks, jaw,
   chin, ears, a small nose), a face painted with small eyes, thin brows and a calm mouth, hair that sits on the head
   (short, long, swept, a bun), a torso shaped by a profile (shoulders, chest, waist, hips; women narrower at the waist),
   a collar and a neck, tapered sleeves, and hands that hang relaxed with the palm towards the leg and the fingers curled.
   Custom heads (Uncle Beeb's beard, the helmets, Judgement...) are kept and scaled to the new body. ---------- */
/* a lathe over part of the way round (a0..a1, 0 = the front): aprons, long hair at the back */
function latheArc(m, Pp, col, seg, a0, a1) { var T = TL('white'), c = C(col), n = Pp.length;
  function V(k, a) { var p = Pp[k], rx = p[1], rz = p[2] === undefined ? p[1] : p[2], pn = Pp[Math.min(n - 1, k + 1)], pp = Pp[Math.max(0, k - 1)], dy = Math.abs(pn[0] - pp[0]) || 0.001, sl = (pn[1] - pp[1]) / dy, sn = Math.sin(a), cs = Math.cos(a), l = Math.hypot(1, sl);
    return { p: [(p[3] || 0) + sn * rx, p[0], (p[4] || 0) + cs * rz], n: [sn / l, sl / l, cs / l] }; }
  for (var k = 0; k < n - 1; k++) for (var i = 0; i < seg; i++) { var b0 = a0 + (a1 - a0) * i / seg, b1 = a0 + (a1 - a0) * (i + 1) / seg, v = [V(k, b0), V(k, b1), V(k + 1, b1), V(k + 1, b0)];
    m.quadN(v.map(function (z) { return z.p; }), [0.1, 0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.9], T, c, v.map(function (z) { return z.n; })); } }
var CSKIN = ['#f4d8c0', '#f0c8a0', '#e0b090', '#a87048', '#6a4028', '#e8c4a0'];
function meshScale(m, k, oy) { var a = m.a; for (var i = 0; i < a.length; i += 16) { a[i] *= k; a[i + 1] = (oy || 0) + (a[i + 1] - (oy || 0)) * k; a[i + 2] *= k; } return m; }
/* the face: drawn on the front of the head (128 px, the same mapping as before) */
function personFace3(skin, o) { o = o || {}; return face(function (g) {
  var dk = shadeHex(skin, -0.16), dk2 = shadeHex(skin, -0.32), lt = shadeHex(skin, 0.12);
  var rg = g.createRadialGradient(64, 60, 10, 64, 66, 80); rg.addColorStop(0, lt); rg.addColorStop(0.65, skin); rg.addColorStop(1, dk); g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  // soft shading round the eye sockets and under the cheekbones
  g.fillStyle = 'rgba(60,20,20,0.10)'; g.beginPath(); g.ellipse(46, 58, 15, 9, 0, 0, 6.3); g.ellipse(82, 58, 15, 9, 0, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(80,20,20,0.07)'; g.beginPath(); g.ellipse(36, 84, 10, 14, 0.3, 0, 6.3); g.ellipse(92, 84, 10, 14, -0.3, 0, 6.3); g.fill();
  if (o.fem) { g.globalAlpha = 0.18; g.fillStyle = '#ff6a7a'; g.beginPath(); g.ellipse(38, 80, 9, 6, 0, 0, 6.3); g.ellipse(90, 80, 9, 6, 0, 0, 6.3); g.fill(); g.globalAlpha = 1; }
  var iris = o.eye || '#3a2414', brow = o.brow || '#2a1a12';
  [[46, 1], [82, -1]].forEach(function (E) { var x = E[0], y = 60, s = E[1]; g.save(); g.translate(x, y); g.scale(1.3, 1.3); g.translate(-x, -y);
    // the eye: an almond, white, iris and pupil, a lid line and a crease
    g.beginPath(); g.moveTo(x - 9, y + 1); g.quadraticCurveTo(x - 1, y - 7, x + 9, y); g.quadraticCurveTo(x, y + 5, x - 9, y + 1); g.closePath(); g.fillStyle = '#f4efe6'; g.fill(); g.save(); g.clip();
    var ig = g.createRadialGradient(x, y, 0.5, x, y, 4.6); ig.addColorStop(0, shadeHex(iris, 0.3)); ig.addColorStop(1, shadeHex(iris, -0.3)); g.fillStyle = ig; g.beginPath(); g.arc(x + s * 0.3, y - 0.5, 4.4, 0, 6.3); g.fill();
    g.fillStyle = '#0a0506'; g.beginPath(); g.arc(x + s * 0.3, y - 0.5, 1.9, 0, 6.3); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 10, y - 8, 20, 3.5); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x - 1.2 + s * 0.3, y - 2, 1.1, 0, 6.3); g.fill();
    g.strokeStyle = '#1a0c0c'; g.lineWidth = o.fem ? 2.4 : 1.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 9.5, y + 1); g.quadraticCurveTo(x - 1, y - 7.5, x + 9.5, y); g.stroke();
    if (o.fem) { g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + s * 8.5, y - 0.5); g.lineTo(x + s * 11.5, y - 3); g.stroke(); }
    g.strokeStyle = 'rgba(70,30,25,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 8, y - 5); g.quadraticCurveTo(x, y - 11, x + 8, y - 5); g.stroke();
    // the brow: thin and tapered
    g.fillStyle = o.fem ? shadeHex(brow, 0.1) : brow; g.beginPath(); g.moveTo(x - 11 * s, y - 10); g.quadraticCurveTo(x - 2 * s, y - 17, x + 11 * s, y - 13); g.quadraticCurveTo(x - 2 * s, y - 14.5, x - 11 * s, y - 8.5); g.closePath(); g.fill(); g.restore(); });
  // the nose: only shading (the 3D nose is small), a lit bridge and two nostrils
  g.strokeStyle = 'rgba(70,30,25,0.30)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(60, 62); g.quadraticCurveTo(58, 74, 59, 79); g.stroke();
  g.fillStyle = 'rgba(255,240,220,0.25)'; g.beginPath(); g.ellipse(65, 71, 2, 6, 0, 0, 6.3); g.fill();
  g.fillStyle = dk2; g.beginPath(); g.ellipse(60, 81, 1.9, 1.1, 0.2, 0, 6.3); g.ellipse(68, 81, 1.9, 1.1, -0.2, 0, 6.3); g.fill();
  if (o.tache) { g.fillStyle = o.tache; g.beginPath(); g.moveTo(50, 89); g.quadraticCurveTo(64, 82, 78, 89); g.quadraticCurveTo(64, 87, 50, 89); g.fill(); }
  // the mouth: small and calm, a darker upper lip, a fuller lower lip, a shade under it
  var lip = o.lip || (o.fem ? '#a8404a' : shadeHex(skin, -0.28));
  g.fillStyle = shadeHex(lip, -0.15); g.beginPath(); g.moveTo(54, 92); g.quadraticCurveTo(60, 89.5, 64, 91); g.quadraticCurveTo(68, 89.5, 74, 92); g.quadraticCurveTo(64, 93, 54, 92); g.fill();
  g.fillStyle = lip; g.beginPath(); g.moveTo(55, 92.5); g.quadraticCurveTo(64, 93.5, 73, 92.5); g.quadraticCurveTo(64, 98, 55, 92.5); g.fill();
  g.strokeStyle = 'rgba(40,10,12,0.55)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(53.5, 92); g.quadraticCurveTo(64, 93.4, 74.5, 92); g.stroke();
  g.fillStyle = 'rgba(60,20,20,0.10)'; g.beginPath(); g.ellipse(64, 101, 8, 2.5, 0, 0, 6.3); g.fill();
  if (o.shades) { g.fillStyle = '#0c0608'; g.beginPath(); g.ellipse(47, 60, 12, 8, 0, 0, 6.3); g.ellipse(81, 60, 12, 8, 0, 0, 6.3); g.fill(); g.fillRect(57, 57, 14, 2.5); g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(43, 57, 4, 1.8, -0.4, 0, 6.3); g.ellipse(77, 57, 4, 1.8, -0.4, 0, 6.3); g.fill(); }
  if (o.beard) { g.fillStyle = o.beard; g.beginPath(); g.moveTo(16, 70); g.quadraticCurveTo(20, 124, 64, 126); g.quadraticCurveTo(108, 124, 112, 70); g.lineTo(104, 72); g.quadraticCurveTo(98, 92, 82, 96); g.quadraticCurveTo(64, 99, 46, 96); g.quadraticCurveTo(30, 92, 24, 72); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(52, 90); g.quadraticCurveTo(64, 84, 76, 90); g.quadraticCurveTo(64, 88, 52, 90); g.fill(); g.fillStyle = 'rgba(0,0,0,0.16)'; for (var q = 0; q < 50; q++) g.fillRect(22 + (q * 37) % 84, 98 + (q * 13) % 24, 1.2, 3.5);
    g.fillStyle = lip; g.beginPath(); g.ellipse(64, 93, 8, 2.2, 0, 0, 6.3); g.fill(); }
  if (o.stubble) { g.fillStyle = 'rgba(40,30,30,0.18)'; g.beginPath(); g.moveTo(26, 82); g.quadraticCurveTo(64, 132, 102, 82); g.quadraticCurveTo(64, 104, 26, 82); g.fill(); }
}, skin); }
(function () { var F = {}, FEM = { f_amy: 1, f_kaya: 1, f_bonjo: 1, f_t: 1, f_cop2: 1 };
  var SPEC = { f_amy: ['#f0c8a0', {}], f_saba: ['#e0b090', { shades: 1, beard: '#e8e0d8', brow: '#d8d0c8' }], f_joff: ['#f0c8a0', { tache: '#3a2418' }], f_beeb: ['#f0c8a0', { beard: '#c86a2a', brow: '#a85a24' }],
    f_harold: ['#f0c8a0', { beard: '#6a3a1e' }], f_kaya: ['#f0c8a0', { eye: '#4a6a3a' }], f_ali: ['#d8a880', { stubble: 1 }], f_elden: ['#f0c8a0', { beard: '#4a2a18' }], f_bonjo: ['#f0d0b8', { eye: '#4a1a5a', lip: '#8a1a3a' }], f_t: ['#f0d0c0', { eye: '#6a1a6a', lip: '#c4126a' }],
    f_jessiah: ['#d8c8c0', { eye: '#4a6a8a', stubble: 1 }], f_natty: ['#e8e0e8', { eye: '#c4121c' }], f_judge: ['#5a3826', { eye: '#2a1a14', beard: '#140a08', brow: '#100808' }], f_fate: ['#2a3a2a', { eye: '#7aff6a' }], f_bates: ['#f0c8a0', {}],
    f_cop: ['#e8c0a0', { tache: '#3a2418' }], f_cop2: ['#8a5a3a', {}], f_zombie: ['#8aa878', { eye: '#ff3a2a', lip: '#4a5a3a' }], f_goon: ['#5a3a6a', { eye: '#c040ff', shades: 1 }], f_spooge: ['#e8c0a8', { stubble: 1, brow: '#c8c4bc', eye: '#5a6a4a' }] };
  for (var k in SPEC) { var s = SPEC[k]; s[1].fem = !!FEM[k]; F[k] = personFace3(s[0], s[1]); }
  var skins = ['#f0c8a0', '#e0b090', '#c89068', '#8a5a3a', '#5a3a24', '#f4d8c0'];
  for (var i = 0; i < 8; i++) F['f_cit' + i] = personFace3(skins[i % skins.length], { eye: ['#2a1a14', '#3a5a8a', '#4a6a3a', '#2a1a14'][i % 4], tache: i === 3 ? '#3a2418' : null, beard: i === 5 ? '#2a1a10' : i === 6 ? '#8a6a4a' : null, shades: i === 7, stubble: i === 1 || i === 4 });
  for (var j = 0; j < 8; j++) F['f_citw' + j] = personFace3(skins[j % skins.length], { eye: ['#3a5a8a', '#2a1a14', '#4a6a3a', '#5a3a2a'][j % 4], fem: 1, lip: ['#a8404a', '#c4304a', '#8a3a3a', '#b8505a'][j % 4] });
  /* update 166b: the townsfolk's faces are made for their own skin (a black man had a white face): f_c<skin><m|w><variant> */
  var EYES = [['#3a5a8a', '#4a6a3a', '#3a2414', '#5a6a7a'], ['#3a2414', '#4a6a3a', '#3a5a8a', '#2a1a14'], ['#2a1a14', '#3a2414', '#4a3a1a', '#2a1a14'], ['#1a100a', '#2a1a14', '#2a1a14', '#1a100a'], ['#1a0c08', '#1a100a', '#2a1a14', '#1a0c08'], ['#3a5a8a', '#4a6a3a', '#5a6a7a', '#3a2414']];
  CSKIN.forEach(function (sk, si) { var dark = si === 3 || si === 4, br = dark ? '#100808' : si === 5 ? '#8a6a4a' : '#2a1a12';
    for (var v = 0; v < 4; v++) { F['f_c' + si + 'm' + v] = personFace3(sk, { eye: EYES[si][v], brow: br, stubble: v === 1, beard: v === 2 ? (dark ? '#140a08' : si === 5 ? '#a8885a' : '#3a2418') : null, tache: v === 3 ? (dark ? '#140a08' : '#3a2418') : null });
      F['f_c' + si + 'w' + v] = personFace3(sk, { eye: EYES[si][(v + 1) % 4], brow: br, fem: 1, lip: (dark ? ['#6a2a2a', '#8a2a3a', '#5a2a2a', '#a02a4a'] : ['#a8404a', '#c4304a', '#b8606a', '#8a3a3a'])[v] }); } });
  for (var q in F) HIPAINT[q] = F[q]; })();

/* the body */
var PFEM = { amy: 1, kaya: 1, bonjo: 1, t: 1 };
person = function (o) {
  var face0 = o.face || ''; if (o.long && /^f_cit\d/.test(face0)) o.face = face0.replace('f_cit', 'f_citw'); var fem = !!o.fem || /^f_(amy|kaya|bonjo|t|cop2|citw\d|c\dw\d)$/.test(o.face || ''), D = { lu: 0.33, ll: 0.33, tor: 0.45, shW: fem ? 0.17 : 0.19, hipW: fem ? 0.095 : 0.09, au: 0.25, al: 0.23, arm: fem ? 0.045 : 0.052, hand: 0.055, leg: fem ? 0.064 : 0.07, neck: 0.05 }, P = {};
  var sh = o.shirt, sk = o.skin, dk = shadeHex(sh, -0.3), lg = o.legs, fore = o.short ? sk : (o.fore || o.jacket || sh), hand = o.hand || sk, boot = o.boot || '#1a1012';
  // the legs and shoes from the shared builder, then new arms
  limbs(P, D, { sleeve: sh, fore: fore, hand: hand, legs: lg, boot: boot });
  var A = D.arm, H = D.hand;
  ['L', 'R'].forEach(function (sd) { var s = sd === 'L' ? 1 : -1;
    var sl = o.jacket || sh, au = M(); ell(au, 0, -0.01, 0, A * 1.25, A * 1.15, A * 1.2, sl, 10, 6); // the round of the shoulder
    lathe(au, [[0, A * 1.12, A * 1.12], [-D.au * 0.3, A * 1.08, A * 1.1], [-D.au * 0.65, A * 0.96, A * 0.98], [-D.au, A * 0.86, A * 0.88]], sl, 10);
    if (o.short) { tub(au, [0, -D.au * 0.55, 0], [0, -D.au * 0.62, 0], A * 1.04, A * 1.06, dk, 10); lathe(au, [[-D.au * 0.6, A * 0.92], [-D.au, A * 0.84]], sk, 10); }
    P['au' + sd] = au.upload();
    var al = M(); ell(al, 0, 0, 0, A * 0.9, A * 0.9, A * 0.9, fore, 8, 5);
    lathe(al, [[0, A * 0.86, A * 0.88], [-D.al * 0.3, A * 0.9, A * 0.84], [-D.al * 0.75, A * 0.68, A * 0.62], [-D.al, A * 0.6, A * 0.56]], fore, 10);
    if (!o.short && fore !== hand) tub(al, [0, -D.al + 0.03, 0], [0, -D.al - 0.004, 0], A * 0.7, A * 0.74, shadeHex(fore, -0.25), 10, { cap: 1 });
    // the hand: palm towards the leg, fingers together and curled a little, the thumb along the front
    var hy = -D.al - H * 0.55, hx = -s * 0.004;
    ell(al, hx, hy, 0.002, H * 0.36, H * 0.72, H * 0.62, hand, 9, 6);
    ell(al, hx - s * 0.004, hy - H * 0.7, 0.012, H * 0.33, H * 0.5, H * 0.56, hand, 8, 5); // the fingers
    ell(al, hx - s * 0.008, hy - H * 1.05, 0.03, H * 0.28, H * 0.26, H * 0.4, hand, 7, 4); // the curl of the fingertips
    tub(al, [hx - s * 0.006, hy + H * 0.3, H * 0.46], [hx - s * 0.012, hy - H * 0.45, H * 0.7], H * 0.22, H * 0.17, hand, 6, { cap: 1 }); // the thumb
    P['al' + sd] = al.upload(); });
  // the hips: trousers with a little seat, a belt
  var hp = M(); ell(hp, 0, -0.01, -0.005, fem ? 0.165 : 0.16, 0.115, 0.115, o.skirt || lg, 12, 6); if (o.skirt) { tub(hp, [0, 0.04, 0], [0, -0.17, 0], 0.168, 0.2, o.skirt, 14); tub(hp, [0, -0.17, 0], [0, -0.18, 0], 0.2, 0.2, shadeHex(o.skirt, -0.3), 14); } P.hips = hp.upload();
  // the torso: a profile from the neck down to the waist
  var to = M(), T = D.tor, pro = fem ? [[T + 0.02, 0.05, 0.045], [T - 0.01, 0.12, 0.08], [T - 0.04, 0.17, 0.095], [T - 0.08, 0.175, 0.105], [T * 0.7, 0.165, 0.125], [T * 0.52, 0.145, 0.1], [T * 0.32, 0.13, 0.09], [T * 0.12, 0.145, 0.095], [-0.01, 0.16, 0.105]]
    : [[T + 0.02, 0.055, 0.05], [T - 0.01, 0.135, 0.085], [T - 0.04, 0.195, 0.105], [T - 0.09, 0.2, 0.115], [T * 0.7, 0.19, 0.12], [T * 0.5, 0.172, 0.112], [T * 0.3, 0.158, 0.105], [T * 0.1, 0.158, 0.105], [-0.01, 0.162, 0.108]];
  if (o.belly) pro = pro.map(function (p, i) { return i >= 4 && i <= 7 ? [p[0], p[1] + 0.02, p[2] + [0.02, 0.05, 0.06, 0.04][i - 4], 0, [0.01, 0.03, 0.035, 0.02][i - 4]] : p; });
  lathe(to, pro, sh, 14, { cap: 1 });
  if (o.jacket) { var jp = pro.map(function (p) { return [p[0], p[1] + 0.012, p[2] + 0.012, p[3] || 0, p[4] || 0]; }).slice(1); latheArc(to, jp, o.jacket, 14, 0.38, Math.PI * 2 - 0.38);
    [-1, 1].forEach(function (sd) { tub(to, [sd * 0.05, T - 0.02, 0.1], [sd * 0.075, T * 0.55, 0.125], 0.012, 0.01, shadeHex(o.jacket, -0.25), 5); }); }
  if (fem) ell(to, 0, T * 0.66, 0.06, 0.13, 0.06, 0.07, sh, 12, 6);
  // a collar and the open neck of the shirt, the neck itself
  tub(to, [0, T - 0.03, 0], [0, T + 0.015, 0], 0.075, 0.065, o.collar || dk, 12);
  tub(to, [0, T - 0.02, -0.005], [0, T + 0.075, 0.0], 0.05, 0.046, sk, 10);
  if (o.apron) { latheArc(to, pro.slice(3).map(function (p) { return [p[0], p[1] + 0.006, p[2] + 0.008, 0, p[4] || 0]; }), o.apron, 10, -1.05, 1.05); if (o.emblem) ell(to, 0, T * 0.5, 0.135, 0.04, 0.04, 0.01, o.emblem, 8, 3);
    [-1, 1].forEach(function (s) { tub(to, [s * 0.11, T * 0.7, 0.1], [s * 0.05, T, 0.07], 0.01, 0.01, o.apron, 5); }); }
  else if (!o.plain) { for (var b = 0; b < 3; b++) ell(to, 0, T * (0.3 + b * 0.18), 0.113 + (fem ? 0.005 : 0), 0.008, 0.008, 0.006, dk, 6, 3); tub(to, [0, T * 0.05, 0.11], [0, T * 0.9, 0.118], 0.004, 0.004, dk, 4); }
  ell(to, 0, 0.0, 0, 0.165, 0.028, 0.112, '#1a1012', 16, 4); boxC(to, -0.022, -0.016, 0.106, 0.022, 0.018, 0.118, '#c8a040');
  P.torso = to.upload();
  // the head
  var hd = M(), HK = o.headK || 0.62;
  if (o.headFn) { o.headFn(hd); if (HK !== 1) meshScale(hd, HK, 0); }
  else {
    var hr = 0.112, hy0 = 0.145;
    ell(hd, 0, hy0, 0, hr, hr * 1.2, hr * 1.08, sk, 16, 11, { face: o.face, fz: 0.2, fw: 0.86, fh: 0.86, fdv: -0.02 });
    ell(hd, 0, hy0 - 0.1, 0.05, 0.045, 0.035, 0.05, sk, 8, 5); // the chin
    tub(hd, [0, -0.035, -0.01], [0, 0.06, 0.0], 0.05, 0.055, sk, 10); // the neck
    [-1, 1].forEach(function (s) { ell(hd, s * hr * 0.97, hy0 - 0.005, -0.01, 0.014, 0.03, 0.022, shadeHex(sk, -0.06), 8, 5); });
    tub(hd, [0, hy0 + 0.005, hr * 1.02], [0, hy0 - 0.03, hr * 1.12], 0.011, 0.016, shadeHex(sk, -0.03), 8, { cap: 1 }); // a small nose
    var hc = o.hair, st = o.style || (o.long ? 'long' : 'short');
    if (st === 'bald') hc = null;
    if (hc && !o.hat) {
      ell(hd, 0, hy0 + 0.012, -0.006, hr * 1.08, hr * 1.22, hr * 1.12, hc, 16, 9, { b1: 1.75, only: 'back' }); // the cap of hair over the top and back
      ell(hd, 0, hy0 + 0.03, 0.02, hr * 1.06, hr * 1.1, hr * 1.02, hc, 16, 6, { b1: 0.95 }); // the hairline, a little forward over the brow
      [-1, 1].forEach(function (s) { ell(hd, s * hr * 0.98, hy0 - 0.01, 0.025, 0.012, 0.035, 0.022, hc, 6, 4); }); // sideburns
      if (o.fringe) ell(hd, -0.015, hy0 + 0.1, hr * 0.62, hr * 0.85, 0.028, 0.055, hc, 12, 5);
      if (st === 'long') { latheArc(hd, [[hy0 + 0.06, hr * 1.1, hr * 1.06, 0, -0.02], [hy0 - 0.03, hr * 1.14, hr * 1.04, 0, -0.03], [hy0 - 0.13, hr * 1.18, hr * 0.8, 0, -0.06], [hy0 - 0.2, hr * 1.12, hr * 0.5, 0, -0.07]], hc, 12, Math.PI * 0.45, Math.PI * 1.55);
        [-1, 1].forEach(function (s) { tub(hd, [s * hr * 0.95, hy0 + 0.02, 0.03], [s * hr * 1.0, hy0 - 0.16, 0.02], 0.022, 0.016, hc, 7, { cap: 1 }); }); }
      else if (st === 'bun') ell(hd, 0, hy0 + 0.1, -0.09, 0.05, 0.045, 0.045, hc, 10, 6);
      else if (st === 'bob') [-1, 1].forEach(function (sd) { ell(hd, sd * hr * 0.92, hy0 - 0.03, 0.0, 0.035, 0.085, 0.09, hc, 8, 6); });
      if (st === 'short' && !fem) ell(hd, 0, hy0 + 0.1, -0.01, hr * 0.92, 0.045, hr * 0.95, hc, 12, 5); /* a little volume on top */
    }
    if (o.hat === 'top') { tub(hd, [0, hy0 + 0.1, 0], [0, hy0 + 0.115, 0], 0.19, 0.19, '#12040a', 16, { cap: 1 }); tub(hd, [0, hy0 + 0.115, 0], [0, hy0 + 0.3, 0], 0.11, 0.115, '#1a1a1e', 16, { cap: 1 }); tub(hd, [0, hy0 + 0.12, 0], [0, hy0 + 0.15, 0], 0.117, 0.117, '#ffe36a', 16); }
    else if (o.hat === 'beanie') { ell(hd, 0, hy0 + 0.035, -0.006, hr * 1.12, hr * 1.25, hr * 1.14, '#c4121c', 14, 7, { b1: 1.55 }); tub(hd, [0, hy0 + 0.02, 0], [0, hy0 + 0.05, 0], hr * 1.13, hr * 1.13, '#8a0a12', 16); ell(hd, 0, hy0 + 0.17, 0, 0.03, 0.03, 0.03, '#ffe36a', 6, 4); }
    else if (o.hat === 'chef') { tub(hd, [0, hy0 + 0.08, 0], [0, hy0 + 0.2, 0], hr * 1.05, hr * 1.25, '#f6f0e4', 14); ell(hd, 0, hy0 + 0.23, 0, hr * 1.4, hr * 0.7, hr * 1.4, '#f6f0e4', 14, 7); }
    else if (o.hat === 'cowboy') { tub(hd, [0, hy0 + 0.07, 0], [0, hy0 + 0.085, 0], 0.22, 0.22, '#5a3a1a', 18, { cap: 1 }); ell(hd, 0, hy0 + 0.12, 0, hr * 1.02, hr * 0.85, hr, '#5a3a1a', 14, 7); tub(hd, [0, hy0 + 0.085, 0], [0, hy0 + 0.11, 0], hr * 1.03, hr * 1.03, '#2a1a0a', 14); }
    else if (o.hat === 'cap') { ell(hd, 0, hy0 + 0.04, -0.005, hr * 1.1, hr * 1.12, hr * 1.12, o.capCol || '#12040a', 14, 7, { b1: 1.5 }); ell(hd, 0, hy0 + 0.05, hr * 1.05, hr * 0.9, 0.012, hr * 0.7, o.capCol || '#12040a', 12, 3); }
    if (o.specs) [-1, 1].forEach(function (s) { tub(hd, [s * 0.042, hy0 + 0.02, hr * 1.06], [s * 0.042, hy0 + 0.02, hr * 1.08], 0.03, 0.03, '#ffc840', 12); tub(hd, [s * 0.075, hy0 + 0.025, hr * 1.0], [s * hr * 1.02, hy0 + 0.03, 0.0], 0.004, 0.004, '#ffc840', 4); });
  }
  P.head = hd.upload();
  return { P: P, D: D, eyeY: 1.35 };
};
/* talking in a group: mostly relaxed, now and then one hand makes a point (no more both palms out all the time) */
poseChat = function (Q, p) { var t = G.t + p.id * 9, ph = (t * 0.35 + p.id) % 3, talk = ph < 1, k = talk ? Math.sin(ph * Math.PI) : 0, w = Math.sin(t * 5) * 0.15 * k, side = (p.id * 7 | 0) % 2;
  Q.sh[side] = [0.25 + 0.5 * k, 0.12, -0.2 * k]; Q.el[side] = 0.4 + 1.1 * k + w; Q.sh[1 - side] = [0.05, 0.1, 0]; Q.el[1 - side] = 0.25;
  if ((p.id * 13 | 0) % 3 === 0) { Q.sh[1 - side] = [-0.25, 0.25, 0.3]; Q.el[1 - side] = 1.2; } /* that one has a hand in his pocket */
  Q.hy = 0.25 * Math.sin(t * 0.6 + p.id); Q.hp = 0.05 * Math.sin(t * 1.3) * (talk ? 1 : 0.3); Q.lean = 0.02 * Math.sin(t * 0.4); Q.y = 0; };

/* the townsfolk (update 166b): a man or a woman, skin, a face made for that skin, natural hair for it (a rare dyed one),
   a hairstyle, clothes that go together (shirt or t-shirt, sometimes a jacket, jeans or trousers, shoes) */
citizen = function (i) { var R = srand(7000 + i * 13), fem = R() < 0.5, si = Math.floor(R() * CSKIN.length), dark = si === 3 || si === 4, sk = CSKIN[si];
  function pk(a) { return a[Math.floor(R() * a.length)]; }
  var hair = dark ? pk(['#120a08', '#120a08', '#1a100a', '#2a1a10', '#6a6a6a']) : pk(['#120a08', '#2a1a10', '#3a2418', '#5a3a20', '#c8a060', '#e0c080', '#a8502a', '#8a8a8a']);
  if (fem && R() < 0.07) hair = pk(['#c4121c', '#ff7ab0', '#7a3ac0']);
  var style = fem ? pk(['long', 'long', 'long', 'bun', 'bob']) : pk(['short', 'short', 'short', 'short', 'bald', 'short']);
  var tops = ['#1a2a4a', '#f1ece2', '#141416', '#5a5a5e', '#6a1a24', '#4a5a32', '#3a5a7a', '#a8822a', '#c4121c', '#d8cfc0', '#2a3a2a', '#7a4a6a'], tops2 = fem ? tops.concat(['#c45a7a', '#e8c0c8', '#5a2a5a']) : tops;
  var legs = fem ? ['#2e3e5a', '#141416', '#3a4a6a', '#5a4a3a', '#2a2a2e', '#6a1a24'] : ['#2e3e5a', '#3a4a6a', '#141416', '#7a6a4a', '#3a3a3e', '#4a3a2a'];
  var shoes = ['#e8e4dc', '#141416', '#3a2416', '#5a3a24', '#1a1a1e'], jacket = R() < 0.35 ? pk(['#141416', '#3a2a1a', '#2a3a4a', '#4a4a32', '#5a1a1e', '#6a5a4a']) : null, short = !jacket && R() < 0.4;
  var o = { skin: sk, hand: sk, shirt: pk(tops2), legs: pk(legs), boot: pk(shoes), hair: hair, style: style, long: style === 'long', fringe: fem ? R() < 0.4 : R() < 0.15, jacket: jacket, short: short, belly: !fem && R() < 0.18,
    hat: R() < 0.1 ? pk(['beanie', 'cap', 'cap']) : null, capCol: pk(['#141416', '#c4121c', '#1a2a4a', '#f1ece2']), face: 'f_c' + si + (fem ? 'w' : 'm') + Math.floor(R() * 4), fem: fem };
  if (fem && R() < 0.3) { o.skirt = pk(['#141416', '#6a1a24', '#2e3e5a', '#5a4a3a']); o.legs = R() < 0.5 ? sk : '#1a1416'; }
  return person(o); };
