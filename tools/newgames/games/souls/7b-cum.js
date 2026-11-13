/* =====================================================================================================
   DARK LOADS update 149: Cumhead rebuilt from his reference art (his ask: the 3D model did not look like him, where is
   the Hunter Seriph shirt, where are the trip pants with chains). Pale cream droplet head with the tip curling over and
   the little drop floating above, big cartoon eyes with the pie-cut shine, black T-shirt with the red dripping
   HUNTER SERIPH print over black long sleeves, white cartoon gloves, wide black trip pants with red plaid straps,
   studded pockets, silver chains and D-rings, chunky black platform boots with red trim.
   He is drawn 1.22 times bigger than before (CUMS) so his legs are a real length: the walk takes fewer, longer steps.
   ===================================================================================================== */
var CUMS = 1.22;
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
function cumRigP() {
  if (RIGS.cumP) return RIGS.cumP;
  var D = { lu: 0.33, ll: 0.33, tor: 0.4, shW: 0.21, hipW: 0.105, au: 0.24, al: 0.21, arm: 0.052, hand: 0.078, leg: 0.075, neck: 0.03 }, P = {}, la = GAIT.la;
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
  tub(hd, [0, 0.74, -0.01], [0.05, 0.86, -0.02], 0.075, 0.04, '#f3dfa8', 10); tub(hd, [0.05, 0.86, -0.02], [0.13, 0.9, -0.02], 0.04, 0.012, '#f3dfa8', 8); ell(hd, 0.135, 0.9, -0.02, 0.016, 0.016, 0.016, '#f3dfa8', 6, 3);
  ell(hd, -0.14, 0.42, 0.24, 0.035, 0.05, 0.02, '#fff6dc', 6, 3);
  P.head = hd.upload();
  var dr = M(); ell(dr, 0, 0, 0, 0.075, 0.07, 0.07, '#f3dfa8', 10, 6); tub(dr, [0.02, -0.04, 0], [0.07, -0.15, 0], 0.05, 0.0, '#f3dfa8', 8); ell(dr, -0.025, 0.03, 0.05, 0.02, 0.025, 0.01, '#fffbe8', 5, 3); P.drip = dr.upload();
  ['L', 'R'].forEach(function (sd) { var s = sd === 'L' ? 1 : -1, A = D.arm, H2 = D.hand;
    // the upper arm: a loose short sleeve over the long one
    var au = M(); ell(au, 0, -0.01, 0, A * 1.5, A * 1.4, A * 1.45, BLK, 10, 5); tub(au, [0, 0, 0], [0, -D.au * 0.55, 0], A * 1.55, A * 1.6, BLK, 10); tub(au, [0, -D.au * 0.5, 0], [0, -D.au * 0.56, 0], A * 1.6, A * 1.6, '#0a080a', 10);
    lathe(au, [[-D.au * 0.4, A * 1.0], [-D.au * 0.75, A * 0.95], [-D.au, A * 0.88]], SLEEVE, 9); P['au' + sd] = au.upload();
    // the forearm and a big white cartoon glove with a rolled cuff
    var al = M(); ell(al, 0, 0, 0, A * 0.92, A * 0.92, A * 0.92, SLEEVE, 8, 4); lathe(al, [[0, A * 0.9], [-D.al * 0.5, A * 0.86], [-D.al, A * 0.78]], SLEEVE, 9);
    tub(al, [0, -D.al + 0.01, 0], [0, -D.al - 0.04, 0], A * 1.25, A * 1.35, GLV, 10, { cap: 1 }); var hy = -D.al - 0.04 - H2 * 0.55;
    ell(al, 0, hy, 0.005, H2 * 0.9, H2 * 0.95, H2 * 0.62, GLV, 10, 6);
    for (var f = 0; f < 3; f++) { var fx = (f - 1) * H2 * 0.55, fy = hy - H2 * 0.6; tub(al, [fx, fy + H2 * 0.15, 0.02], [fx, fy - H2 * 0.55, 0.05], H2 * 0.3, H2 * 0.27, GLV, 6, { cap: 1 }); }
    tub(al, [s * H2 * 0.7, hy + H2 * 0.15, 0.03], [s * H2 * 1.15, hy - H2 * 0.35, 0.08], H2 * 0.3, H2 * 0.24, GLV, 6, { cap: 1 });
    [-1, 0, 1].forEach(function (k) { bxp(al, k * H2 * 0.3 - 0.003, hy + H2 * 0.3, H2 * 0.6, k * H2 * 0.3 + 0.003, hy + H2 * 0.75, H2 * 0.63, '#bdb6aa'); }); // the stitching on the back of the glove
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
    P['ll' + sd] = ll.upload();
    // the boot: a chunky shiny toe, a thick platform sole with a red stripe, red laces
    var ft = M(), ank = GAIT.ank; ell(ft, 0, 0, 0, 0.085, 0.08, 0.09, '#0e0b0e', 10, 5);
    ell(ft, 0, -0.025, 0.1, 0.09, 0.065, 0.13, '#0c0a0c', 12, 6); ell(ft, 0.0, 0.015, 0.16, 0.035, 0.02, 0.04, '#3a3a44', 6, 3);
    bxp(ft, -0.098, -ank, -0.11, 0.098, -ank + 0.05, 0.245, '#141014'); bxp(ft, -0.1, -ank + 0.045, -0.112, 0.1, -ank + 0.056, 0.247, RED);
    for (var tr = 0; tr < 5; tr++) bxp(ft, -0.1, -ank, -0.1 + tr * 0.07, 0.1, -ank + 0.012, -0.08 + tr * 0.07, '#060406');
    [0.04, 0.08].forEach(function (z) { bxp(ft, -0.04, 0.01, z, 0.04, 0.02, z + 0.012, RED); });
    P['ft' + sd] = ft.upload(); });
  RIGS.cumP = { P: P, D: D, eyeY: 1.6, drip: 1 }; return RIGS.cumP; }
function drawCum(x, y, z, yaw, P, o) {
  var rig = cumRigP(); o = o || {}; var D = rig.D, S = rig.P, fl = o.flash, tint = o.tint, al = o.alpha, SC = CUMS;
  if (!P.bp && !o.still) { var lt = KIT.t, br = Math.sin(lt * 1.7); P.lean += br * 0.012; P.sh[0][1] = (P.sh[0][1] || 0) + br * 0.018; P.sh[1][1] = (P.sh[1][1] || 0) + br * 0.018; P.hy += Math.sin(lt * 0.63) * 0.04; P.hp += Math.sin(lt * 0.9) * 0.015; }
  var bz = (P.bodyZ || 0) * SC, hipY = D.lu + D.ll + P.y, body = MD(x + Math.sin(yaw) * bz, y + (P.bodyY || 0) * SC, z + Math.cos(yaw) * bz, yaw, P.bp || 0, P.br || 0, SC);
  function dr(mesh, m) { if (mesh) R3.draw(mesh, ATT, { m: m, flash: fl, tint: tint, alpha: al, warp: 0, rim: 1 }); }
  var pY = P.py !== undefined ? P.py : P.twist * 0.3, hips = MM(body, MD(0, hipY, 0, pY, 0, P.roll * 0.5)); dr(S.hips, hips);
  var tor = MM(hips, MD(0, 0.06, 0, P.twist, P.lean, P.roll * (P.py !== undefined ? -0.6 : 1))); dr(S.torso, tor);
  var head = MM(tor, MD(0, D.tor + D.neck, 0, P.hy, P.hp, P.hr)); dr(S.head, head);
  dr(S.drip, MM(head, MD(0.05, 1.13 + Math.sin(KIT.t * 3) * 0.025, -0.02, 0, 0, Math.sin(KIT.t * 1.3) * 0.12)));
  var out = { head: head };
  [0, 1].forEach(function (k) { var sd = k ? 'R' : 'L', sx = k ? -D.shW : D.shW, a = P.sh[k];
    var up = MM(tor, MD(sx, D.tor * 0.86, 0, a[2] || 0, -a[0], k ? -a[1] : a[1])); dr(S['au' + sd], up);
    var lo = MM(up, MD(0, -D.au, 0, 0, -P.el[k], 0)); dr(S['al' + sd], lo);
    var hm = MM(lo, MD(0, -D.al - 0.04 - D.hand * 0.6, 0.02, 0, Math.PI, 0)); if (k === 1) out.hand = hm; else out.handL = hm;
    var hx = k ? -D.hipW : D.hipW, th2 = MM(hips, MD(hx, -0.02, 0, 0, -P.hip[k], P.abd ? P.abd[k] : 0)); dr(S['lu' + sd], th2);
    var sh = MM(th2, MD(0, -D.lu, 0, 0, P.kn[k], 0)); dr(S['ll' + sd], sh);
    var an = P.ank ? P.ank[k] : Math.max(-0.7, Math.min(0.7, P.hip[k] - P.kn[k])); dr(S['ft' + sd], MM(sh, MD(0, -GAIT.la, 0, 0, an, P.abd ? -P.abd[k] : 0))); });
  if (o.held && out.hand) dr(o.held, MM(out.hand, MD(0, 0, 0, 0, o.heldP || 0, 0)));
  if (!o.noShadow) R3.draw(RIGS.shadow, ATT, { m: MD(x, (WORLD ? floorAt(x, z) : 0) + 0.03, z, 0, 0, 0, 1.25), soft: 1, lit: false, alpha: 0.85, warp: 0 });
  return out; }
function legIK(x, zf, h) { var a = 0.33, b = GAIT.la, d = Math.hypot(x, zf, h); d = Math.max(Math.abs(a - b) + 0.02, Math.min(a + b - 0.002, d));
  var kn = Math.PI - Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - d * d) / (2 * a * b)))), Y = a + b * Math.cos(kn), ro = Math.asin(Math.max(-0.9, Math.min(0.9, x / Y)));
  var thg = Math.atan2(zf, h) - Math.atan2(-b * Math.sin(kn), Y * Math.cos(ro)); return [thg, kn, ro]; }
/* waking in the coffin: lying, sitting up, a crouch on the lid, standing and stepping down */
var cumPose = poseOf;
poseOf = function (e, isP) { if (!isP || !(e.wakeT > 0)) return cumPose(e, isP);
  var Q = pose0(), k = 1 - e.wakeT / 4.2; Q.ank = [0, 0];
  if (k < 0.4) { Q.bp = -1.5; Q.bodyZ = 0.95; Q.bodyY = 0.05; Q.sh[0] = [0.15, 0.2]; Q.sh[1] = [0.15, 0.2, 0]; Q.el = [0.2, 0.2]; Q.hp = 0.3 * Math.max(0, k - 0.3) * 10; }
  else if (k < 0.62) { var u = sm(0.4, 0.62, k); Q.bp = -1.5 * (1 - u); Q.bodyZ = 0.95 - 0.55 * u; Q.bodyY = 0.05; Q.y = -0.62 * u; Q.hip = [1.5 * u, 1.5 * u]; Q.kn = [0.2 * u, 0.2 * u]; Q.ank = [-1.2 * u, -1.2 * u]; Q.sh[0] = [-0.3 * u, 0.3]; Q.sh[1] = [-0.3 * u, 0.3, 0]; Q.el = [0.4, 0.4]; Q.lean = 0.2 * u; }
  else if (k < 0.8) { var v = sm(0.62, 0.8, k); Q.bodyZ = 0.4 - 0.4 * v; Q.y = lerp(-0.62, -0.32, v); Q.hip = [lerp(1.5, 1.3, v), lerp(1.5, 1.3, v)]; Q.kn = [lerp(0.2, 2.3, v), lerp(0.2, 2.3, v)]; Q.ank = [lerp(-1.2, -1.0, v), lerp(-1.2, -1.0, v)]; Q.lean = lerp(0.2, 0.55, v); Q.sh[0] = [0.5 * v, 0.3]; Q.sh[1] = [0.5 * v, 0.3, 0]; Q.el = [0.6, 0.6]; Q.hy = 0.4 * Math.sin(v * 6); }
  else { var w = sm(0.8, 1, k); Q.y = lerp(-0.32, 0, w); Q.hip = [lerp(1.3, 0.05, w), lerp(1.3, 0.05, w)]; Q.kn = [lerp(2.3, 0.1, w), lerp(2.3, 0.1, w)]; Q.ank = [Q.hip[0] - Q.kn[0], Q.hip[1] - Q.kn[1]]; Q.lean = lerp(0.55, 0.05, w); Q.sh[0] = [0.1, 0.2]; Q.sh[1] = [0.2, 0.2, 0]; Q.el = [0.3, 0.4]; }
  return Q; };
/* Spermaid and Saba in the Candlelit Square (built like Spermhog Adventure's) */
function npcFace(skin, o) { return face(function (g) { fEye(g, 46, 62, 11, 13, '#2a1a14', 0.2); fEye(g, 82, 62, 11, 13, '#2a1a14', 0.2); if (o.shades) { g.fillStyle = '#12040a'; g.fillRect(28, 50, 34, 22); g.fillRect(66, 50, 34, 22); g.fillRect(60, 56, 8, 4); } fLine(g, [[34, 44], [46, 38, 58, 44]], 3); fLine(g, [[70, 44], [82, 38, 94, 44]], 3);
  fShape(g, [[50, 98], [64, 108, 78, 98], [64, 102, 50, 98]], '#7a1a1e', '#12040a', 2.5); if (o.beard) { g.fillStyle = o.beard; g.beginPath(); g.moveTo(14, 70); g.quadraticCurveTo(64, 140, 114, 70); g.lineTo(104, 70); g.quadraticCurveTo(64, 112, 24, 70); g.fill(); } }, skin); }
HIPAINT.f_saba = npcFace('#e0b090', { shades: 1, beard: '#e8e0d8' });
HIPAINT.f_spermaid = face(function (g) { fEye(g, 46, 62, 13, 16, '#1a8a8a', 0.3); fLine(g, [[72, 64], [84, 58, 96, 64]], 4.5); fLine(g, [[30, 44], [46, 36, 60, 44]], 3); fShape(g, [[50, 88], [64, 98, 80, 86], [64, 92, 50, 88]], '#c4405a', '#12040a', 2.5); g.fillStyle = 'rgba(255,120,150,0.35)'; g.beginPath(); g.arc(30, 80, 9, 0, 6.3); g.arc(98, 80, 9, 0, 6.3); g.fill(); }, '#f1e0b0');
function buildNpcRigs() { if (RIGS.saba) return;
  var D = { lu: 0.33, ll: 0.33, tor: 0.42, shW: 0.2, hipW: 0.1, au: 0.24, al: 0.22, arm: 0.055, hand: 0.065, leg: 0.07, neck: 0.04 }, P = {}, c = { sleeve: '#3a8a2a', fore: '#3a8a2a', hand: '#e0b090', legs: '#2a2a2a', boot: '#1a1012' };
  var hp = M(); ell(hp, 0, 0, 0, 0.17, 0.11, 0.12, '#2a2a2a', 8, 4); P.hips = hp.upload();
  var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.21, D.tor * 0.56, 0.15, '#3a8a2a', 10, 6); P.torso = to.upload();
  var hd = M(); ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#e0b090', 12, 8, { face: 'f_saba', fz: 0.25, fw: 0.82, fh: 0.8, fdv: 0.02 }); ell(hd, 0, 0.36, -0.01, 0.22, 0.16, 0.21, '#c4121c', 10, 5, { b1: 1.7 }); ell(hd, 0, 0.53, 0, 0.05, 0.05, 0.05, '#ffe36a', 6, 3); P.head = hd.upload();
  limbs(P, D, c); RIGS.saba = { P: P, D: D, eyeY: 1.5 };
  var D2 = { lu: 0.3, ll: 0.3, tor: 0.36, shW: 0.17, hipW: 0.08, au: 0.2, al: 0.19, arm: 0.045, hand: 0.055, leg: 0.06, neck: 0.03 }, P2 = {}, c2 = { sleeve: '#f1e0b0', fore: '#f1e0b0', hand: '#f1e0b0', legs: '#2a9a9a', boot: '#2a9a9a' };
  var hp2 = M(); tub(hp2, [0, 0.05, 0], [0, -0.35, 0.02], 0.15, 0.11, '#2a9a9a', 10); tub(hp2, [0, -0.35, 0.02], [0, -0.55, -0.08], 0.11, 0.07, '#2a9a9a', 10); tub(hp2, [0, -0.55, -0.08], [0, -0.52, -0.25], 0.07, 0.04, '#2a9a9a', 8); ell(hp2, 0, -0.42, -0.36, 0.17, 0.07, 0.04, '#ff6aa8', 8, 4); for (var k = 0; k < 4; k++) tub(hp2, [0, -0.08 * k, 0.12], [0, -0.08 * k - 0.04, 0.11], 0.13 - k * 0.01, 0.12 - k * 0.01, '#3ab0b0', 10); P2.hips = hp2.upload();
  var to2 = M(); ell(to2, 0, D2.tor * 0.5, 0, 0.17, D2.tor * 0.58, 0.13, '#f1e0b0', 10, 6); ell(to2, -0.07, D2.tor * 0.62, 0.1, 0.07, 0.06, 0.05, '#1a1a1a', 8, 4); ell(to2, 0.07, D2.tor * 0.62, 0.1, 0.07, 0.06, 0.05, '#1a1a1a', 8, 4); P2.torso = to2.upload();
  var hd2 = M(); ell(hd2, 0, 0.26, 0, 0.27, 0.26, 0.25, '#f1e0b0', 12, 8, { face: 'f_spermaid', fz: 0.25, fw: 0.8, fh: 0.78, fdv: 0.04, tip: 0.2 }); tub(hd2, [0, 0.56, -0.02], [-0.05, 0.7, -0.1], 0.08, 0.035, '#f1e0b0', 8); tub(hd2, [-0.05, 0.7, -0.1], [0.03, 0.76, -0.16], 0.035, 0.0, '#f1e0b0', 6); P2.head = hd2.upload();
  var dr2 = M(); ell(dr2, 0, 0, 0, 0.05, 0.05, 0.05, '#f1e0b0', 8, 5); tub(dr2, [0, 0.03, 0], [0, 0.11, 0], 0.045, 0.0, '#f1e0b0', 8); P2.drip = dr2.upload();
  limbs(P2, D2, c2); var none = M(); ell(none, 0, -0.05, 0, 0.01, 0.01, 0.01, '#2a9a9a', 3, 2); var nm = none.upload(); P2.luL = P2.luR = P2.llL = P2.llR = nm; RIGS.spermaid = { P: P2, D: D2, eyeY: 1.3, drip: 1 };
}
