/* ---------- the people of Cum City: every character of ours, the citizens, the police, and the zombies, robots and Blum goons
   of the chapters. Psycho Nightmare's rigs (Cumhead, TB, Shithead Laboozie, TB's boys, the circus) and Spermhog Adventure's
   townsfolk, plus the rest built here the same way. Faces are painted before the atlas is made. ---------- */
(function () {
  var F = {
    f_amy: personFace('#f0c8a0', {}), f_saba: personFace('#e0b090', { shades: 1, beard: '#e8e0d8' }), f_joff: personFace('#f0c8a0', { tache: '#3a2418' }), f_beeb: personFace('#f0c8a0', { beard: '#c86a2a' }),
    f_harold: personFace('#f0c8a0', { beard: '#6a3a1e' }), f_kaya: personFace('#f0c8a0', {}), f_ali: personFace('#d8a880', {}), f_pig: personFace('#ff9ab4', {}),
    f_elden: personFace('#f0c8a0', { beard: '#4a2a18' }), f_bonjo: personFace('#f0d0b8', { eye: '#4a1a5a' }), f_t: personFace('#f0d0c0', { eye: '#6a1a6a' }), f_jessiah: personFace('#d8c8c0', { eye: '#4a6a8a' }),
    f_natty: personFace('#e8e0e8', { eye: '#c4121c' }), f_judge: personFace('#f4ece0', { eye: '#c8a040' }), f_fate: personFace('#2a3a2a', { eye: '#7aff6a' }), f_bates: personFace('#f0c8a0', {}),
    f_cop: personFace('#e8c0a0', { tache: '#3a2418' }), f_cop2: personFace('#8a5a3a', {}), f_zombie: personFace('#8aa878', { eye: '#ff3a2a' }), f_goon: personFace('#5a3a6a', { eye: '#c040ff', shades: 1 }),
    f_robot: face(function (g) { g.fillStyle = '#1a1a1e'; g.fillRect(16, 40, 96, 34); g.fillStyle = '#ff2630'; g.fillRect(24, 50, 80, 12); g.fillStyle = '#ffb0a0'; g.fillRect(30, 53, 20, 5); g.fillStyle = '#5a5a60'; for (var i = 0; i < 6; i++) g.fillRect(36 + i * 10, 88, 6, 14); }, '#9a9ca2'),
    f_pulsar: face(function (g) { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(64, 58, 44, 22, 0, 0, 6.3); g.fill(); g.fillStyle = '#4adfff'; g.fillRect(34, 50, 22, 8); g.fillRect(72, 50, 22, 8); fShape(g, [[48, 96], [64, 106, 80, 96], [64, 100, 48, 96]], '#3a1a5a', '#12040a', 2); }, '#8a5ad8')
  };
  var skins = ['#f0c8a0', '#e0b090', '#c89068', '#8a5a3a', '#5a3a24', '#f4d8c0'];
  for (var i = 0; i < 8; i++) F['f_cit' + i] = personFace(skins[i % skins.length], { eye: ['#2a1a14', '#3a5a8a', '#4a6a3a', '#2a1a14'][i % 4], tache: i === 3 ? '#3a2418' : null, beard: i === 5 ? '#2a1a10' : i === 6 ? '#8a6a4a' : null, shades: i === 7 });
  for (var k in F) HIPAINT[k] = F[k];
})();
var CITIZENS = [];
function citizen(i) { var R = srand(1000 + i), sk = ['#f0c8a0', '#e0b090', '#c89068', '#8a5a3a', '#5a3a24', '#f4d8c0'], shirts = ['#c4121c', '#12040a', '#2a4a6a', '#f1e7d0', '#3a6a3a', '#6a3a8a', '#a87a20', '#5a5a5a', '#2a2a2a', '#ff7ab0', '#3ab0b0'],
  legs = ['#1a1a1a', '#2a3a5a', '#4a3a2a', '#5a5a5a', '#12040a'], hair = ['#1a1010', '#3a2418', '#c86a2a', '#e8d080', '#8a8a8a', '#ff7ab0', null], hats = [null, null, null, 'beanie', 'cowboy', 'top'];
  var s = Math.floor(R() * 6); return person({ skin: sk[s], shirt: shirts[Math.floor(R() * shirts.length)], legs: legs[Math.floor(R() * legs.length)], hair: hair[Math.floor(R() * hair.length)], long: R() < 0.35, fringe: R() < 0.3, hat: hats[Math.floor(R() * hats.length)], belly: R() < 0.2, face: 'f_cit' + Math.floor(R() * 8) }); }
function buildCityRigs() {
  if (RIGS.copM) return; buildAdvRigs(); if (typeof buildRigs2 === 'function') buildRigs2(); if (typeof buildTB2 === 'function') buildTB2();
  RIGS.amy = person({ skin: '#f0c8a0', shirt: '#c4121c', legs: '#1a1a1a', hair: '#ff8ac0', long: 1, fringe: 1, face: 'f_amy' });
  RIGS.saba = person({ skin: '#e0b090', shirt: '#3a8a2a', legs: '#2a2a2a', hat: 'beanie', face: 'f_saba', beard: 1 });
  RIGS.joff = person({ skin: '#f0c8a0', shirt: '#f1e7d0', legs: '#2a2a2a', hat: 'chef', apron: '#c4121c', face: 'f_joff' });
  RIGS.beeb = person({ skin: '#f0c8a0', shirt: '#5a3a1a', legs: '#2a1a10', hair: '#c86a2a', face: 'f_beeb', belly: 1, headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#f0c8a0', 12, 8, { face: 'f_beeb', fz: 0.25, fw: 0.82, fh: 0.8, fdv: 0.02 }); ell(hd, 0, 0.36, 0, 0.23, 0.14, 0.22, '#8a8a90', 10, 5); [-1, 1].forEach(function (s) { tub(hd, [s * 0.2, 0.4, 0], [s * 0.36, 0.62, 0], 0.05, 0.01, '#f1e7d0', 6); }); } });
  RIGS.harold = person({ skin: '#f0c8a0', shirt: '#a8141e', legs: '#3a2a2a', hat: 'top', specs: 1, face: 'f_harold' });
  RIGS.kaya = person({ skin: '#f0c8a0', shirt: '#c4121c', legs: '#1a1a1a', hair: '#8a3a20', long: 1, apron: '#f1e7d0', face: 'f_kaya' });
  RIGS.elden = person({ skin: '#f0c8a0', shirt: '#f1e7d0', legs: '#2a2a2a', hat: 'chef', face: 'f_elden' });
  RIGS.ali = person({ skin: '#d8a880', shirt: '#e8dcc0', legs: '#2a2a2a', hair: '#2a1a10', apron: '#3a9a2a', face: 'f_ali', headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#d8a880', 12, 8, { face: 'f_ali', fz: 0.25, fw: 0.82, fh: 0.8, fdv: 0.02 }); ell(hd, 0, 0.36, -0.01, 0.215, 0.1, 0.205, '#2a8a2a', 10, 4); } });
  RIGS.potbelly = RIGS.potbelly || person({ skin: '#ff9ab4', shirt: '#c4121c', legs: '#1a1a1a', belly: 1, face: 'f_pig' });
  RIGS.bonjo = person({ skin: '#f0d0b8', shirt: '#5a1a6a', legs: '#5a1a6a', hair: '#12040a', long: 1, fringe: 1, face: 'f_bonjo' });
  RIGS.t = person({ skin: '#f0d0c0', shirt: '#ff5ab0', legs: '#ff5ab0', hair: '#8a3ac0', long: 1, fringe: 1, face: 'f_t' });
  RIGS.jessiah = person({ skin: '#d8c8c0', shirt: '#5a5a62', legs: '#3a3a42', face: 'f_jessiah', headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.21, 0.23, 0.2, '#8a8a92', 12, 8, { face: 'f_jessiah', fz: 0.45, fw: 0.5, fh: 0.5, fdv: 0.02 }); tub(hd, [0, 0.42, -0.05], [0, 0.6, -0.12], 0.04, 0.01, '#c4121c', 5); } });
  RIGS.natty = person({ skin: '#e8e0e8', shirt: '#12040a', legs: '#12040a', hair: '#12040a', face: 'f_natty', apron: '#8a0a14' });
  RIGS.judge = person({ skin: '#f4ece0', shirt: '#f4f0e8', legs: '#f4f0e8', hair: '#f4f0e8', face: 'f_judge', headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#f4ece0', 12, 8, { face: 'f_judge', fz: 0.25, fw: 0.82, fh: 0.8 }); tub(hd, [0, 0.62, 0], [0, 0.64, 0], 0.2, 0.2, '#ffe36a', 12); } });
  RIGS.fate = person({ skin: '#2a3a2a', shirt: '#1a2a1a', legs: '#12040a', face: 'f_fate', headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#2a3a2a', 12, 8, { face: 'f_fate', fz: 0.25, fw: 0.82, fh: 0.8 }); ell(hd, 0, 0.26, -0.03, 0.25, 0.27, 0.24, '#1a2a1a', 12, 6, { only: 'back' }); } });
  RIGS.bates = person({ skin: '#f0c8a0', shirt: '#5a2a5a', legs: '#2a2a2a', hair: '#5a3a1a', face: 'f_bates' });
  RIGS.copM = person({ skin: '#e8c0a0', shirt: '#1a2a5a', legs: '#12182a', face: 'f_cop', headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#e8c0a0', 12, 8, { face: 'f_cop', fz: 0.25, fw: 0.82, fh: 0.8 }); ell(hd, 0, 0.38, 0, 0.22, 0.09, 0.22, '#1a2a5a', 10, 4); tub(hd, [0, 0.36, 0.12], [0, 0.36, 0.3], 0.18, 0.18, '#12182a', 10, { cap: 1 }); } });
  RIGS.copF = person({ skin: '#8a5a3a', shirt: '#1a2a5a', legs: '#12182a', hair: '#1a1010', long: 1, face: 'f_cop2' });
  RIGS.zombie = person({ skin: '#8aa878', shirt: '#5a4a3a', legs: '#3a3a2a', hair: '#3a3a2a', face: 'f_zombie' }); RIGS.zombie2 = person({ skin: '#7a9868', shirt: '#6a1a1a', legs: '#2a2a3a', face: 'f_zombie', belly: 1 });
  RIGS.robot = person({ skin: '#9a9ca2', shirt: '#7a7c82', legs: '#5a5c62', hand: '#3a3a3e', boot: '#2a2a2e', headFn: function (hd) { var m = hd; boxC(m, -0.18, 0.04, -0.17, 0.18, 0.42, 0.17, '#9a9ca2'); ell(m, 0, 0.24, 0.17, 0.15, 0.08, 0.02, '#ff2630', 8, 3); tub(m, [0.1, 0.42, 0], [0.12, 0.6, 0], 0.012, 0.012, '#3a3a3e', 4); ell(m, 0.12, 0.62, 0, 0.03, 0.03, 0.03, '#ff2630', 5, 3); } });
  RIGS.goon = person({ skin: '#5a3a6a', shirt: '#3a1a5a', legs: '#2a0a3a', face: 'f_goon', headFn: function (hd) { ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#5a3a6a', 12, 8, { face: 'f_goon', fz: 0.25, fw: 0.82, fh: 0.8 }); ell(hd, 0, 0.28, -0.03, 0.26, 0.28, 0.25, '#3a1a5a', 12, 6, { only: 'back' }); tub(hd, [0, 0.5, -0.05], [0, 0.7, -0.15], 0.15, 0.0, '#3a1a5a', 8); } });
  // PulsarOctopus: a purple dome with his cyan visor, tentacles for legs, headphones
  (function () { var D = { lu: 0.3, ll: 0.3, tor: 0.36, shW: 0.2, hipW: 0.1, au: 0.22, al: 0.2, arm: 0.06, hand: 0.06, leg: 0.06, neck: 0.02 }, P = {}, c = { sleeve: '#8a5ad8', fore: '#8a5ad8', hand: '#a87ae8', legs: '#8a5ad8', boot: '#8a5ad8' };
    var hp = M(); for (var k = 0; k < 6; k++) { var a = k / 6 * 6.283; tub(hp, [Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12], [Math.cos(a) * 0.3, -0.62, Math.sin(a) * 0.3 + 0.05], 0.08, 0.03, '#8a5ad8', 6); } P.hips = hp.upload();
    var to = M(); ell(to, 0, D.tor * 0.5, 0, 0.2, D.tor * 0.55, 0.16, '#7a4ac8', 10, 6); P.torso = to.upload();
    var hd = M(); ell(hd, 0, 0.3, 0, 0.32, 0.32, 0.3, '#8a5ad8', 12, 8, { face: 'f_pulsar', fz: 0.3, fw: 0.8, fh: 0.7, fdv: 0.05 }); [-1, 1].forEach(function (s) { ell(hd, s * 0.32, 0.28, 0, 0.06, 0.12, 0.12, '#4adfff', 8, 4); }); tub(hd, [-0.32, 0.36, 0], [0.32, 0.36, 0], 0.025, 0.025, '#12040a', 6); P.head = hd.upload();
    limbs(P, D, c); var none = M(); ell(none, 0, -0.05, 0, 0.01, 0.01, 0.01, '#8a5ad8', 3, 2); var nm = none.upload(); P.luL = P.luR = P.llL = P.llR = nm; RIGS.pulsar = { P: P, D: D, eyeY: 1.3 }; })();
  for (var i = 0; i < 14; i++) CITIZENS.push(citizen(i));
  // things people hold
  var gm = M(); boxC(gm, -0.03, -0.02, -0.05, 0.03, 0.06, 0.18, '#1a1a1c'); boxC(gm, -0.025, -0.12, -0.03, 0.025, 0.0, 0.03, '#1a1a1c'); RIGS.pistolM = gm.upload();
  var sm = M(); boxC(sm, -0.035, -0.03, -0.12, 0.035, 0.07, 0.42, '#2a2a2e'); boxC(sm, -0.025, -0.14, 0.0, 0.025, 0.0, 0.05, '#1a1a1c'); boxC(sm, -0.02, -0.16, 0.14, 0.02, -0.03, 0.18, '#3a3a3e'); RIGS.smgM = sm.upload();
  var sg = M(); tub(sg, [0, 0.03, -0.25], [0, 0.03, 0.55], 0.03, 0.03, '#2a2a2e', 6); boxC(sg, -0.04, -0.05, -0.45, 0.04, 0.05, -0.2, '#5a3a20'); RIGS.shotgunM = sg.upload();
  var rf = M(); tub(rf, [0, 0.03, -0.3], [0, 0.03, 0.75], 0.025, 0.02, '#2a2a2e', 6); boxC(rf, -0.04, -0.06, -0.5, 0.04, 0.05, -0.25, '#5a3a20'); tub(rf, [0, 0.1, 0.0], [0, 0.1, 0.25], 0.03, 0.03, '#1a1a1c', 6); RIGS.rifleM = rf.upload();
  var rl = M(); tub(rl, [0, 0.05, -0.5], [0, 0.05, 0.6], 0.08, 0.08, '#3a5a2a', 8, { cap: 1, cap0: 1 }); ell(rl, 0, 0.05, 0.65, 0.07, 0.07, 0.12, '#c4121c', 6, 3); RIGS.rocketM = rl.upload();
  var bt = M(); tub(bt, [0, 0, 0], [0, 0, 0.85], 0.025, 0.05, '#8a6a40', 6, { cap: 1 }); RIGS.batM = bt.upload();
  var sa = M(); tub(sa, [0, 0, -0.05], [0, 0, 0.75], 0.06, 0.065, '#c86a4a', 8, { cap: 1, cap0: 1 }); RIGS.sausageM = sa.upload();
  var kn = M(); boxC(kn, -0.01, -0.02, 0, 0.01, 0.02, 0.24, '#c8ccd0'); boxC(kn, -0.015, -0.025, -0.1, 0.015, 0.025, 0, '#2a1a10'); RIGS.knifeM = kn.upload();
  var bg = M(); ell(bg, 0, 0, 0.05, 0.1, 0.12, 0.1, '#aa7846', 8, 5); ell(bg, 0, 0.12, 0.05, 0.06, 0.08, 0.06, '#ff7a20', 6, 3); RIGS.bagM = bg.upload();
  var ph = M(); boxC(ph, -0.04, -0.07, -0.01, 0.04, 0.07, 0.01, '#12040a'); RIGS.phoneM = ph.upload();
  var sh = M(); sh.quad([-0.5, 0.02, -0.5], [-0.5, 0.02, 0.5], [0.5, 0.02, 0.5], [0.5, 0.02, -0.5], UV1, TL('shadow'), [0.5, 0.5, 0.5], [0, 1, 0]); RIGS.shadowC = sh.upload();
}
/* who is who: rig, name, where they live (a shop id) */
var CAST = {
  cumhead: { rig: 'cumhead', name: 'Cumhead' }, tb: { rig: 'tb', name: 'TB', shop: 'tb' }, lab: { rig: 'laboozie', name: 'Shithead Laboozie' }, greebo: { rig: 'greebo', name: 'Greebo', shop: 'greebo' },
  spermaid: { rig: 'spermaid', name: 'Spermaid', shop: 'sanct' }, amy: { rig: 'amy', name: 'Amy', shop: 'amy' }, saba: { rig: 'saba', name: 'Saba', shop: 'saba' }, joff: { rig: 'joff', name: 'Joff', shop: 'joff' },
  beeb: { rig: 'beeb', name: 'Uncle Beeb', shop: 'beebs' }, harold: { rig: 'harold', name: 'Harold', shop: 'harold' }, kaya: { rig: 'kaya', name: 'Kaya', shop: 'cafe' }, elden: { rig: 'elden', name: 'Elden', shop: 'cafe' },
  ali: { rig: 'ali', name: 'Ali', shop: 'ali' }, potbelly: { rig: 'potbelly', name: 'Potbelly', shop: 'arcade' }, pulsar: { rig: 'pulsar', name: 'PulsarOctopus', shop: 'pulsar' }, bonjo: { rig: 'bonjo', name: 'Bonjo', shop: 'bonjo' },
  t: { rig: 't', name: 'T', shop: 't' }, jessiah: { rig: 'jessiah', name: 'Jessiah', shop: 'jessiah' }, natty: { rig: 'natty', name: 'Nattyboro', shop: 'natty' }, judge: { rig: 'judge', name: 'Judgement', shop: 'judge' },
  fate: { rig: 'fate', name: 'Stacked Fate', shop: 'fate' }, bates: { rig: 'bates', name: 'Master Bates', shop: 'bates' }, steve: { rig: 'steve', name: 'Steve' }, blumhead: { rig: 'goon', name: 'Blumhead' }
};
function rigOf(k) { if (typeof k === 'number') return CITIZENS[k % CITIZENS.length]; return RIGS[(CAST[k] && CAST[k].rig) || k] || RIGS.cumhead; }
/* draw a person: rig + pose, a shadow on the ground under them, what they hold */
function drawPerson(rig, x, y, z, yaw, Q, o) {
  o = o || {}; if (rig === 'steve' || (rig && rig === RIGS.steve)) { R3.draw(RIGS.steveM, ATT, { m: MD(x, y + Math.abs(Math.sin(G.t * 6 + x)) * 0.1, z, yaw, 0, 0, o.sc || 1.3), rim: 1 }); R3.draw(RIGS.shadowC, ATT, { m: MD(x, groundY(x, z) + 0.02, z, 0, 0, 0, 1.2), soft: 1, lit: false, alpha: 0.7 }); return {}; }
  if (typeof rig === 'string') rig = rigOf(rig);
  var out = drawRig(rig, x, y, z, yaw, Q, { noShadow: 1, held: o.held, heldP: o.heldP, heldL: o.heldL, flash: o.flash, tint: o.tint || G.ptint, sc: o.sc, alpha: o.alpha, still: o.still });
  if (!o.noShadow) R3.draw(RIGS.shadowC, ATT, { m: MD(x, standY(x, z, y) + 0.03, z, 0, 0, 0, 1.1 * (o.sc || 1)), soft: 1, lit: false, alpha: 0.75 });
  return out;
}
function poseSit(Q) { Q.hip[0] = Q.hip[1] = 1.45; Q.kn[0] = Q.kn[1] = 1.5; Q.y = -0.5; Q.sh[0] = [1.0, 0.25, 0]; Q.sh[1] = [1.0, 0.25, 0]; Q.el[0] = Q.el[1] = 0.6; }
function poseRideStand(Q) { Q.kn[0] = 0.25; Q.kn[1] = 0.3; Q.hip[0] = 0.2; Q.hip[1] = -0.1; Q.sh[0] = [0.9, 0.2, 0]; Q.sh[1] = [0.9, 0.2, 0]; Q.el[0] = Q.el[1] = 0.5; Q.lean = 0.15; }
function poseDance(Q, t, s) { var a = Math.sin(t * 7 + s), b = Math.cos(t * 3.5 + s); Q.sh[0] = [2.4 + a * 0.5, 0.4, 0]; Q.sh[1] = [2.4 - a * 0.5, 0.4, 0]; Q.el[0] = Q.el[1] = 0.6; Q.y = -Math.abs(a) * 0.08; Q.twist = b * 0.3; Q.hip[0] = a * 0.2; Q.hip[1] = -a * 0.2; Q.kn[0] = Q.kn[1] = Math.abs(a) * 0.3; }
function poseZombie(Q, ph, amt) { poseWalk(Q, ph, amt * 0.6, false); Q.sh[0] = [1.5, 0.1, 0]; Q.sh[1] = [1.4, 0.1, 0]; Q.el[0] = Q.el[1] = 0.1; Q.lean = 0.25; Q.hr = 0.3; }
function poseHandsUp(Q) { Q.sh[0] = [2.9, 0.3, 0]; Q.sh[1] = [2.9, 0.3, 0]; Q.el[0] = Q.el[1] = 0.2; }
function poseCower(Q) { Q.y = -0.4; Q.kn[0] = Q.kn[1] = 1.4; Q.hip[0] = Q.hip[1] = 1.3; Q.lean = 0.6; Q.sh[0] = [2.6, 0.6, 0.6]; Q.sh[1] = [2.6, 0.6, -0.6]; Q.el[0] = Q.el[1] = 2.2; }
function posePlay(Q, t, inst) { if (inst === 'drum') { Q.sh[0] = [1.0 + Math.max(0, Math.sin(t * 9)) * 0.6, 0.3, 0.3]; Q.sh[1] = [1.0 + Math.max(0, -Math.sin(t * 9)) * 0.6, 0.3, -0.3]; Q.el[0] = Q.el[1] = 1.2; } else { Q.sh[0] = [1.4, 0.2, 0.5]; Q.sh[1] = [1.4, 0.2, -0.5]; Q.el[0] = Q.el[1] = 1.5; Q.hp = -0.2; } }
