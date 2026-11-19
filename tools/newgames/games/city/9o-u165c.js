/* update 165, part three: references to his music (his ask). The Legion of Semen Demons fly the sky at night and now and then
   one dives at you; the Knights of Cum-a-lot ride round Cumhead's Castle on horseback and call the horse Neigh-Neigh; and
   Uncle Spooge, who keeps to his 10ft rule and whose tissues are crispy. */

/* ---------- the cast ---------- */
CAST.knight = { rig: 'knight', name: 'Knight of Cum-a-lot' };
CAST.spooge = { rig: 'spooge', name: 'Uncle Spooge' };
CASTLINES.knight = ['Easy, Neigh-Neigh. He is a friend of the Mayor.', 'Neigh-Neigh does not like cars. Neither do I.', 'We are the Knights of Cum-a-lot. Neigh-Neigh is the brains of the outfit.',
  'Whoa, Neigh-Neigh! Whoa!', 'Neigh-Neigh has carried me through forty battles. And one car park.', 'Hail, Mayor Cumhead! Neigh-Neigh, bow.', 'Mind where you step. Neigh-Neigh has been at the oats again.',
  'Onwards, Neigh-Neigh. Gently. My back.', 'Nobody touches the castle while Neigh-Neigh draws breath.', 'Neigh-Neigh says hello. That was a hello, trust me.'];
CASTLINES.spooge = ['There is a 10ft rule. I keep to it.', 'My tissues are crispy. Do not ask.', 'Uncle Spooge, at your service. Mind the tissues.', 'Got a tissue? Not that one. That one is crispy.',
  'Ten feet. That is the rule. I measure it every morning.', 'Crispy tissues, son. Every single one.', 'Do not sit there. That is my bench. Ten feet, please.'];
['cafe', 'redlight', 'park'].forEach(function (st) { if (DISTCAST[st]) DISTCAST[st].push('spooge'); });
RADIO2.news.push('News. The Legion of Semen Demons were seen flying over Cum City again last night. The Council says keep your windows shut and your mouth closed.',
  'News. A man was knocked off his bike by a diving Semen Demon on the ring road. He says it grinned at him. They always grin.',
  'News. The Knights of Cum-a-lot rode round Cumhead\'s Castle all night again. A spokesman for the horse, Neigh-Neigh, declined to comment.');
RADIO2.gossip.push('Gossip. Uncle Spooge was seen in the cafe streets with a box of tissues. Crispy, sources say. He kept ten feet from everyone. That is the rule.',
  'Gossip. Is Neigh-Neigh the real brains behind the Knights of Cum-a-lot? The knights say yes. Neigh-Neigh said neigh.');

/* ---------- Uncle Spooge's face and body, the knights' armour ---------- */
HIPAINT.f_spooge = personFace2('#e8c0a8', { beard: '#b8b4ac', brow: '#d8d4cc', eye: '#5a6a4a' });
(function () { var bc = buildCityRigs; buildCityRigs = function () { var had = !!RIGS.copM; bc.apply(this, arguments); if (RIGS.spooge && RIGS.knight) return;
  RIGS.spooge = person({ skin: '#e8c0a8', shirt: '#b39a6c', legs: '#4a4038', boot: '#3a2a1e', hand: '#e8c0a8', belly: 1, face: 'f_spooge', headFn: function (hd) {
    ell(hd, 0, 0.22, 0, 0.2, 0.22, 0.19, '#e8c0a8', 12, 8, { face: 'f_spooge', fz: 0.25, fw: 0.82, fh: 0.8 });
    tub(hd, [-0.19, 0.2, -0.02], [-0.17, 0.3, -0.12], 0.06, 0.05, '#c8c4bc', 6); tub(hd, [0.19, 0.2, -0.02], [0.17, 0.3, -0.12], 0.06, 0.05, '#c8c4bc', 6); ell(hd, 0, 0.27, -0.13, 0.17, 0.11, 0.08, '#c8c4bc', 10, 5); /* a ring of grey hair round a bald top */
    [-0.06, 0, 0.06].forEach(function (x) { tub(hd, [-0.17, 0.36, x - 0.02], [0.15, 0.42, x], 0.012, 0.012, '#9a968e', 3); }); /* three strands combed over */
    ell(hd, 0, -0.02, 0.02, 0.14, 0.05, 0.12, '#8a7656', 10, 3); } }); /* the mac's collar */
  var helm = function (hd) { ell(hd, 0, 0.22, 0, 0.22, 0.25, 0.22, '#aab0b8', 14, 9); tub(hd, [0, 0.0, 0], [0, 0.42, 0], 0.235, 0.215, '#9aa0a8', 14);
    boxC(hd, -0.17, 0.2, 0.2, 0.17, 0.25, 0.24, '#12040a'); tub(hd, [0, 0.14, 0.23], [0, 0.04, 0.23], 0.015, 0.015, '#12040a', 4);
    ell(hd, 0, 0.43, 0, 0.1, 0.05, 0.1, '#c8a040', 8, 3); tub(hd, [0, 0.45, 0], [0, 0.66, -0.08], 0.05, 0.08, '#c4121c', 6); tub(hd, [0, 0.66, -0.08], [0, 0.62, -0.32], 0.08, 0.02, '#c4121c', 6); };
  RIGS.knight = person({ skin: '#e8c0a0', shirt: '#a8acb4', legs: '#8a8e96', boot: '#5a5e66', hand: '#6a6e76', apron: '#c4121c', face: 'f_cop', headFn: helm });
  RIGS.knight2 = person({ skin: '#e8c0a0', shirt: '#9aa0aa', legs: '#7a7e88', boot: '#4a4e56', hand: '#5a5e66', apron: '#12040a', face: 'f_cop', headFn: helm }); }; })();

/* ---------- Neigh-Neigh and the other horses ---------- */
var HORSEM = {};
function horseMesh(col, cloth) { var key = col + cloth; if (HORSEM[key]) return HORSEM[key]; var b = new R3.Mesh(), dk = shadeHex(col, -0.35), tr = '#f1e7d0';
  ell(b, 0, 1.42, 0.05, 0.38, 0.44, 1.02, col, 14, 9); ell(b, 0, 1.45, 0.72, 0.34, 0.4, 0.38, col, 12, 8); ell(b, 0, 1.48, -0.72, 0.36, 0.38, 0.4, col, 12, 8);
  tub(b, [0, 1.55, 0.8], [0, 2.2, 1.2], 0.27, 0.17, col, 12); tub(b, [0, 2.32, 1.22], [0, 2.05, 1.66], 0.15, 0.1, col, 12, { cap: 1 }); ell(b, 0, 2.3, 1.24, 0.15, 0.16, 0.17, col, 10, 6);
  ell(b, 0, 2.02, 1.66, 0.1, 0.08, 0.08, dk, 8, 4); [-1, 1].forEach(function (s) { ell(b, s * 0.12, 2.3, 1.36, 0.03, 0.035, 0.035, '#0a0506', 6, 3); tub(b, [s * 0.07, 2.42, 1.2], [s * 0.1, 2.6, 1.16], 0.04, 0.0, col, 5); });
  for (var k = 0; k < 6; k++) { var t = k / 5; ell(b, 0, 1.78 + t * 0.62, 0.86 + t * 0.32 - 0.12, 0.05, 0.1, 0.09, dk, 6, 3); }
  tub(b, [0, 1.62, -1.02], [0, 1.0, -1.36], 0.09, 0.03, dk, 6); tub(b, [0, 1.5, -1.12], [0, 0.8, -1.28], 0.07, 0.02, dk, 5);
  /* the knight's cloth: a red caparison hanging either side with a cream hem, the saddle on top */
  [-1, 1].forEach(function (s) { var x = s * 0.4; for (var i = 0; i < 6; i++) { var z0 = -0.9 + i * 0.32, z1 = z0 + 0.32, n = [s, 0, 0];
      b.quad([x, 1.0, s > 0 ? z0 : z1], [x, 1.0, s > 0 ? z1 : z0], [x * 0.92, 1.7, s > 0 ? z1 : z0], [x * 0.92, 1.7, s > 0 ? z0 : z1], UV1, TL('white'), litc(cloth, n, 1), n);
      b.quad([x * 1.01, 0.94, s > 0 ? z0 : z1], [x * 1.01, 0.94, s > 0 ? z1 : z0], [x * 1.01, 1.02, s > 0 ? z1 : z0], [x * 1.01, 1.02, s > 0 ? z0 : z1], UV1, TL('white'), litc(tr, n, 1), n); } });
  ell(b, 0, 1.86, -0.05, 0.3, 0.09, 0.4, '#4a2a18', 10, 4); ell(b, 0, 1.93, -0.36, 0.22, 0.1, 0.06, '#3a2014', 8, 3);
  tub(b, [-0.12, 1.98, 1.4], [0, 2.1, 1.62], 0.012, 0.012, '#2a1a10', 3); tub(b, [0.12, 1.98, 1.4], [0, 2.1, 1.62], 0.012, 0.012, '#2a1a10', 3);
  var leg = new R3.Mesh(); tub(leg, [0, 0, 0], [0, -0.52, 0.02], 0.11, 0.075, col, 8); tub(leg, [0, -0.52, 0.02], [0, -1.08, 0], 0.055, 0.05, col, 7); ell(leg, 0, -0.98, 0, 0.065, 0.06, 0.065, '#f1e7d0', 7, 3); tub(leg, [0, -1.05, 0], [0, -1.16, 0.02], 0.07, 0.075, '#1a1214', 8, { cap: 1 });
  HORSEM[key] = { body: b.upload(), leg: leg.upload() }; return HORSEM[key]; }
function drawHorse(H, x, y, z, a, ph, move) { var M = MD(x, y, z, a, 0, 0, 1); R3.draw(H.body, ATT, { m: M });
  [[0.22, 0.72, 0], [-0.22, 0.72, Math.PI], [0.22, -0.72, Math.PI * 0.5], [-0.22, -0.72, Math.PI * 1.5]].forEach(function (L) { var sw = Math.sin(ph + L[2]) * 0.42 * move; R3.draw(H.leg, ATT, { m: MM(M, MD(L[0], 1.18, L[1], 0, sw, 0, 1)) }); }); }

/* ---------- the knights: a patrol round the bailey of Cumhead's Castle and two guards at the gate ---------- */
var KNIGHTS = null;
function knightsInit() { if (KNIGHTS) return KNIGHTS; KNIGHTS = []; var C = POIS.filter(function (p) { return p.k === 'castle' && !p.dark; })[0]; if (!C) return KNIGHTS;
  var cols = [['#e8e2d6', '#c4121c'], ['#2a2224', '#c4121c'], ['#6a4228', '#12040a'], ['#9a9590', '#c4121c'], ['#e8e2d6', '#12040a']], R = typeof CASTLE_R !== 'undefined' ? CASTLE_R : 46;
  for (var k = 0; k < 3; k++) KNIGHTS.push({ id: 0.13 + k * 0.29, who: 'knight', c: C, k: k, patrol: 1, u: k / 3 * 6.283, ph: k, col: cols[k], rig: k === 1 ? 'knight2' : 'knight', cool: 0, sayT: 0, x: C.x, z: C.z, y: 0, a: 0, sp: 0 });
  [-1, 1].forEach(function (s, i) { var x = C.x + s * 7, z = C.z + R + 9; KNIGHTS.push({ id: 0.7 + i * 0.1, who: 'knight', c: C, k: 3 + i, guard: 1, x: x, z: z, y: 0, a: 0, ph: i, col: cols[3 + i], rig: i ? 'knight2' : 'knight', cool: 0, sayT: 0, sp: 0 }); });
  return KNIGHTS; }
function knightPos(K, u) { var C = K.c; return { x: C.x + Math.sin(u) * 22, z: C.z + 15 + Math.cos(u) * 13.5 }; }
var KSAYT = 0;
function stepKnights(dt) { var C = POIS.filter(function (p) { return p.k === 'castle' && !p.dark; })[0]; if (!C || G.interior || dist2(P.x, P.z, C.x, C.z) > 260 * 260) return; knightsInit();
  KNIGHTS.forEach(function (K) { var near = Math.hypot(P.x - K.x, P.z - K.z);
    if (K.patrol) { var stop = near < 3.5 && P.state === 'foot', want = stop ? 0 : 2.6; K.sp += (want - K.sp) * Math.min(1, dt * 2); K.u += K.sp * dt / 18; var q = knightPos(K, K.u), q2 = knightPos(K, K.u + 0.05); K.x = q.x; K.z = q.z; var ta = Math.atan2(q2.x - q.x, q2.z - q.z); K.a += angDiff(K.a, stop ? Math.atan2(P.x - K.x, P.z - K.z) : ta) * Math.min(1, dt * 4); }
    else { var ta2 = near < 12 ? Math.atan2(P.x - K.x, P.z - K.z) : 0; K.a += angDiff(K.a, ta2) * Math.min(1, dt * 2); K.sp *= 0.9; }
    K.ph += dt * (1.4 + K.sp * 2.2); K.y = groundY(K.x, K.z); K.sayT -= dt; K.cool -= dt;
    /* you cannot walk through a horse */
    if (P.state === 'foot' && near < 1.6 && near > 0.01) { var pu = (1.6 - near) / near; P.x += (P.x - K.x) * pu; P.z += (P.z - K.z) * pu; }
    if (P.state === 'car' && P.veh && Math.hypot(P.veh.x - K.x, P.veh.z - K.z) < 3 && Math.abs(P.veh.sp) > 4) { P.veh.sp *= 0.3; P.veh.vx = (P.veh.vx || 0) * 0.3; P.veh.vz = (P.veh.vz || 0) * 0.3; sfx.play('neigh'); if (K.cool < 0) { say(K, 'Whoa, Neigh-Neigh! Whoa!'); K.cool = 6; } }
    if (near < 9 && K.cool <= 0 && G.t > KSAYT && P.state === 'foot' && !G.cut) { K.cool = 9 + Math.random() * 6; KSAYT = G.t + 4; say(K, pick(CASTLINES.knight)); if (Math.random() < 0.6) sfx.play('neigh'); } }); }
function drawKnights() { if (!KNIGHTS || G.interior) return; KNIGHTS.forEach(function (K) { if (dist2(K.x, K.z, CAM.x, CAM.z) > 180 * 180) return; var H = horseMesh(K.col[0], K.col[1]), mv = Math.min(1, K.sp / 2), bob = Math.abs(Math.sin(K.ph)) * 0.05 * mv;
    drawHorse(H, K.x, K.y + bob, K.z, K.a, K.ph, mv);
    var Q = pose0(); Q.y = -0.45; Q.hip[0] = Q.hip[1] = 1.2; Q.kn[0] = Q.kn[1] = 1.35; Q.hab = 0.42; Q.lean = 0.05 + mv * 0.04; Q.sh[0] = [0.7, 0.15, 0.25]; Q.el[0] = 1.1; Q.sh[1] = [0.35, 0.12, 0]; Q.el[1] = 0.5; Q.hy = 0;
    var sx = K.x + Math.sin(K.a) * -0.12, sz = K.z + Math.cos(K.a) * -0.12; drawPerson(RIGS[K.rig] || RIGS.knight, sx, K.y + bob + 1.93, sz, K.a, Q, { sc: 1.28 }); /* update 166: the new bodies are smaller */
    var Hd = window.LASTHAND; if (Hd) { if (!RIGS.lanceM) { var m = new R3.Mesh(); tub(m, [0, -0.6, 0], [0, 3.4, 0], 0.045, 0.02, '#c8a040', 6); for (var i = 0; i < 4; i++) tub(m, [0, 0.4 + i * 0.7, 0], [0, 0.75 + i * 0.7, 0], 0.05, 0.05, '#c4121c', 6); tub(m, [0, 0.1, 0], [0, 0.35, 0], 0.13, 0.05, '#9aa0a8', 8);
        m.quad([0, 3.0, 0], [0, 3.0, 0.6], [0, 2.6, 0.6], [0, 2.6, 0], UV1, TL('white'), litc('#c4121c', [1, 0, 0], 1), [1, 0, 0]); m.quad([0, 3.0, 0.6], [0, 3.0, 0], [0, 2.6, 0], [0, 2.6, 0.6], UV1, TL('white'), litc('#c4121c', [-1, 0, 0], 1), [-1, 0, 0]); RIGS.lanceM = m.upload(); }
      R3.draw(RIGS.lanceM, ATT, { m: MM(Hd, MD(0, 0, 0, 0, Math.PI, 0, 1)) }); } }); }

/* ---------- the Legion of Semen Demons ---------- */
var DEMONM = null;
function demonMesh() { if (DEMONM) return DEMONM; var b = new R3.Mesh(), cr = '#f1e7d0', dr = '#7a0a12';
  ell(b, 0, 0, 0, 0.3, 0.36, 0.5, cr, 12, 8); ell(b, 0, 0.26, 0.42, 0.25, 0.26, 0.25, cr, 12, 8); tub(b, [0, 0.48, 0.38], [0, 0.82, 0.12], 0.13, 0.02, cr, 8); ell(b, 0, 0.96, 0.02, 0.04, 0.06, 0.04, cr, 6, 3);
  [-1, 1].forEach(function (s) { tub(b, [s * 0.14, 0.44, 0.5], [s * 0.32, 0.74, 0.38], 0.05, 0.0, '#3a0408', 6); ell(b, s * 0.1, 0.3, 0.66, 0.05, 0.035, 0.03, '#ff2630', 6, 3); tub(b, [s * 0.18, -0.2, 0.15], [s * 0.2, -0.5, 0.3], 0.06, 0.04, cr, 5); });
  b.quad([-0.12, 0.17, 0.66], [0.12, 0.17, 0.66], [0.1, 0.12, 0.64], [-0.1, 0.12, 0.64], UV1, TL('white'), litc('#12040a', [0, 0, 1], 1), [0, 0, 1]);
  tub(b, [0, -0.05, -0.45], [0, -0.25, -1.1], 0.09, 0.02, cr, 6); b.tri([0, -0.25, -1.1], [0.14, -0.32, -1.32], [-0.14, -0.32, -1.32], [0, 0, 1, 0, 0.5, 1], TL('white'), litc(dr, [0, 1, 0], 1), [0, 1, 0]); b.tri([0, -0.25, -1.1], [-0.14, -0.32, -1.32], [0.14, -0.32, -1.32], [0, 0, 1, 0, 0.5, 1], TL('white'), litc(dr, [0, -1, 0], 1), [0, -1, 0]);
  var w = new R3.Mesh(), P0 = [0, 0, 0], tips = [[1.7, 0.3, -0.1], [1.4, -0.05, -0.55], [0.95, -0.1, -0.75], [0.45, -0.05, -0.6]];
  for (var i = 0; i < tips.length - 1; i++) { w.tri(P0, tips[i], tips[i + 1], [0, 0, 1, 0, 1, 1], TL('white'), litc(dr, [0, 1, 0], 1), [0, 1, 0]); w.tri(P0, tips[i + 1], tips[i], [0, 0, 1, 0, 1, 1], TL('white'), litc(dr, [0, -1, 0], 0.8), [0, -1, 0]); }
  tub(w, P0, tips[0], 0.04, 0.015, '#3a0408', 5); tub(w, [0.6, 0.1, -0.04], tips[1], 0.025, 0.01, '#3a0408', 4); tub(w, [0.5, 0.06, -0.05], tips[2], 0.02, 0.01, '#3a0408', 4);
  var wl = new R3.Mesh(); for (var j = 0; j < tips.length - 1; j++) { var a1 = [-tips[j][0], tips[j][1], tips[j][2]], a2 = [-tips[j + 1][0], tips[j + 1][1], tips[j + 1][2]]; wl.tri(P0, a2, a1, [0, 0, 1, 0, 1, 1], TL('white'), litc(dr, [0, 1, 0], 1), [0, 1, 0]); wl.tri(P0, a1, a2, [0, 0, 1, 0, 1, 1], TL('white'), litc(dr, [0, -1, 0], 0.8), [0, -1, 0]); }
  tub(wl, P0, [-tips[0][0], tips[0][1], tips[0][2]], 0.04, 0.015, '#3a0408', 5);
  DEMONM = { body: b.upload(), wr: w.upload(), wl: wl.upload() }; return DEMONM; }
function nightK() { var dl = dayLight(G.time); return clamp((0.42 - dl) / 0.2, 0, 1); }
/* the flocks: each one circles a point that drifts over the town; the same flocks every night (seeded from the hour and the cell) */
function demonFlocks() { var out = [], cx = Math.floor(CAM.x / 420), cz = Math.floor(CAM.z / 420);
  for (var gi = -1; gi <= 1; gi++) for (var gj = -1; gj <= 1; gj++) { var bi = cx + gi, bj = cz + gj, h = hash2(bi, bj, 165); if (h > 0.45) continue;
    var ox = (bi + 0.5) * 420 + Math.sin(G.t * 0.02 + h * 9) * 90, oz = (bj + 0.5) * 420 + Math.cos(G.t * 0.017 + h * 7) * 90; out.push({ id: bi * 1000 + bj, x: ox, z: oz, y: Math.max(groundY(ox, oz), 0) + 48 + h * 40, n: 4 + Math.floor(h * 14), R: 22 + h * 30, sp: 0.22 + h * 0.2, h: h }); }
  return out; }
function demonAt(F, k) { var a = G.t * F.sp + k * 6.283 / F.n + Math.sin(k * 1.7) * 0.4, rr = F.R + Math.sin(k * 2.3 + G.t * 0.3) * 7; return { x: F.x + Math.cos(a) * rr, z: F.z + Math.sin(a) * rr, y: F.y + Math.sin(G.t * 0.8 + k) * 4 + (k % 3) * 3, a: a + Math.PI, bank: 0.4 }; }
var DIVE = null, DIVET = 60 + Math.random() * 60;
function stepDemons(dt) { var nk = nightK(); if (DIVE) { stepDive(dt); return; } if (nk < 0.8 || G.interior || G.cut || P.state === 'dead') return;
  DIVET -= dt; if (DIVET > 0) return; DIVET = 110 + Math.random() * 150; if (P.state !== 'foot' || Math.random() < 0.35) return;
  var F = demonFlocks().filter(function (f) { return dist2(f.x, f.z, P.x, P.z) < 300 * 300; }).sort(function (a, b) { return dist2(a.x, a.z, P.x, P.z) - dist2(b.x, b.z, P.x, P.z); })[0]; if (!F) return;
  var s = demonAt(F, 0); DIVE = { x: s.x, y: s.y, z: s.z, a: s.a, st: 'tell', t: 0, hp: 45, flock: F.id, vx: 0, vy: 0, vz: 0 }; sfx.play('screech'); toast('A Semen Demon breaks from the Legion and comes for you!'); }
function stepDive(dt) { var D = DIVE; D.t += dt;
  if (D.st === 'tell') { D.y += Math.sin(D.t * 6) * 0.05; D.a += angDiff(D.a, Math.atan2(P.x - D.x, P.z - D.z)) * Math.min(1, dt * 3); if (D.t > 1.6) { D.st = 'dive'; D.t = 0; sfx.play('screech'); } return; }
  if (D.st === 'dive') { var tx = P.x, ty = P.y + 1.2, tz = P.z, dx = tx - D.x, dy = ty - D.y, dz = tz - D.z, L = Math.hypot(dx, dy, dz) || 1, v = 26;
    D.vx += (dx / L * v - D.vx) * Math.min(1, dt * 2.2); D.vy += (dy / L * v - D.vy) * Math.min(1, dt * 2.2); D.vz += (dz / L * v - D.vz) * Math.min(1, dt * 2.2);
    D.x += D.vx * dt; D.y += D.vy * dt; D.z += D.vz * dt; D.a = Math.atan2(D.vx, D.vz); D.y = Math.max(D.y, groundY(D.x, D.z) + 0.8);
    if (L < 1.7 && P.state === 'foot') { hurtPlayer(14, null); CAM.shake = 0.6; var kx = D.vx / (Math.hypot(D.vx, D.vz) || 1), kz = D.vz / (Math.hypot(D.vx, D.vz) || 1); var c = collide(P.x + kx * 2.2, P.z + kz * 2.2, 0.35, P.y, 1.6); P.x += kx * 2.2 + c.x; P.z += kz * 2.2 + c.z; sfx.play('hurt'); D.st = 'away'; D.t = 0; }
    else if (D.t > 6 || P.state !== 'foot' || G.interior) { D.st = 'away'; D.t = 0; } return; }
  if (D.st === 'away') { D.vy += (14 - D.vy) * Math.min(1, dt * 1.5); D.x += D.vx * dt * 0.6; D.z += D.vz * dt * 0.6; D.y += D.vy * dt; if (D.t > 5) DIVE = null; return; }
  if (D.st === 'fall') { D.vy -= 20 * dt; D.y += D.vy * dt; D.x += D.vx * dt; D.z += D.vz * dt; D.spin = (D.spin || 0) + dt * 9; var g = groundY(D.x, D.z); if (D.y <= g + 0.3) { for (var i = 0; i < 10; i++) addFx({ k: 'puff', x: D.x, y: g + 0.4, z: D.z, vx: rnd(-1.5, 1.5), vy: rnd(0.5, 2), vz: rnd(-1.5, 1.5), life: 1.4, s0: 0.3, grow: 1.2, col: [0.95, 0.92, 0.85], a0: 0.6 }); PICKUPS.push({ k: 'cash', x: D.x, z: D.z, y: g, v: 80, life: 30 }); sfx.play('boom'); DIVE = null; } } }
function hurtDemon(dmg) { var D = DIVE; if (!D || D.st === 'fall') return; D.hp -= dmg; D.hit = 0.15; if (D.hp <= 0) { D.st = 'fall'; D.vy = 2; D.vx *= 0.3; D.vz *= 0.3; sfx.play('screech'); SV.stats.demons = (SV.stats.demons || 0) + 1; bigText('SEMEN DEMON DOWN', '$80', '#ffe36a', 2); } else if (D.st === 'dive' && D.hp < 25) { D.st = 'away'; D.t = 0; } }
function drawOneDemon(M, x, y, z, a, flap, sc, tint, roll) { var B = MD(x, y, z, a, 0, roll || 0, sc); var o = { m: B, lit: false, tint: tint };
  R3.draw(M.body, ATT, o); R3.draw(M.wr, ATT, { m: MM(B, MD(-0.22, 0.12, 0, 0, 0, -flap, 1)), lit: false, tint: tint }); R3.draw(M.wl, ATT, { m: MM(B, MD(0.22, 0.12, 0, 0, 0, flap, 1)), lit: false, tint: tint }); }
function drawDemons() { var nk = nightK(); if (G.interior) return; var M = demonMesh();
  if (nk > 0.05) { var n = 0, tn = [0.55 * nk + 0.2, 0.5 * nk + 0.2, 0.5 * nk + 0.2]; demonFlocks().forEach(function (F) { for (var k = 0; k < F.n; k++) { if (DIVE && DIVE.flock === F.id && k === 0) continue; if (++n > 40) return; var s = demonAt(F, k); if (dist2(s.x, s.z, CAM.x, CAM.z) > 380 * 380) continue;
      var flap = Math.sin(G.t * 5 + k * 1.3) * 0.55; drawOneDemon(M, s.x, s.y, s.z, s.a, flap, 1.6, tn, 0.35); } }); }
  if (DIVE) { var D = DIVE, fl = D.st === 'dive' ? Math.sin(G.t * 3) * 0.2 - 0.5 : Math.sin(G.t * 12) * 0.7, tt = D.hit > 0 ? [3, 3, 3] : D.st === 'tell' ? [1.6, 0.5, 0.5] : [1, 1, 1]; D.hit = Math.max(0, (D.hit || 0) - 1 / 60);
    drawOneDemon(M, D.x, D.y, D.z, D.a, fl, 1.4, tt, D.st === 'fall' ? D.spin : 0); if (D.st === 'tell') gbill(D.x, D.y + 0.3, D.z, 0.9 + 0.3 * Math.sin(G.t * 14), 'halo', { tint: [1, 0.1, 0.1], add: 1 }); } }
/* bullets and the hook find a diving demon */
(function () { var rh = rayHit; rayHit = function (o, d, maxT, who) { var best = rh.apply(this, arguments); var D = DIVE; if (!D || D.st === 'fall' || who !== P) return best;
    var ox = o[0] - D.x, oy = o[1] - D.y, oz = o[2] - D.z, b = ox * d[0] + oy * d[1] + oz * d[2], c = ox * ox + oy * oy + oz * oz - 1.1 * 1.1, disc = b * b - c; if (disc < 0) return best; var t = -b - Math.sqrt(disc); if (t < 0 || t > (best ? best.t : maxT)) return best;
    if (window.__shootW) hurtDemon(window.__shootW.dmg || 10); return best; };
  var sh = shoot; shoot = function (who, W0) { if (who === P) window.__shootW = W0; try { return sh.apply(this, arguments); } finally { window.__shootW = null; } }; })();
/* melee: a swing in front of you hits a demon that is close */
(function () { var sf = stepFoot; stepFoot = function (dt) { var r = sf.apply(this, arguments); var D = DIVE; if (D && D.st === 'dive' && P.atkT > 0 && !P.demonHit && Math.hypot(D.x - P.x, D.z - P.z) < 2.6 && Math.abs(D.y - P.y - 1) < 1.8) { var W0 = WPN[P.wpn] || WPN.fists; if (W0.melee) { hurtDemon(W0.dmg * 1.5); P.demonHit = 1; } } if (!(P.atkT > 0)) P.demonHit = 0; return r; }; })();

/* ---------- sounds: the horse and the demon ---------- */
(function () { var t = sfx.tone, n = sfx.noise;
  sfx.add('neigh', function () { for (var i = 0; i < 7; i++) t('sawtooth', 820 - i * 55 + (i % 2) * 70, 760 - i * 55, 0.09, 0.05, i * 0.08); t('sawtooth', 420, 300, 0.25, 0.05, 0.56); n(0.15, 0.04, 2500); });
  sfx.add('screech', function () { t('sawtooth', 1400, 500, 0.5, 0.07); t('square', 1100, 380, 0.5, 0.04, 0.03); n(0.4, 0.06, 3000); }); })();

/* ---------- Uncle Spooge: his tissue in his hand, and he sits on a bench in the cafe streets when you are about ---------- */
(function () { var dp = drawPed; drawPed = function (p) { dp(p); if (p.who !== 'spooge' || p.dead || !window.LASTHAND) return; if (!RIGS.tissueM) { var m = new R3.Mesh(); ell(m, 0, 0, 0.05, 0.07, 0.06, 0.07, '#f4f0e6', 7, 4); ell(m, 0.03, 0.03, 0.08, 0.04, 0.035, 0.04, '#e8e0cc', 6, 3); ell(m, -0.03, -0.02, 0.03, 0.035, 0.03, 0.035, '#ece6d4', 6, 3); RIGS.tissueM = m.upload(); }
  R3.draw(RIGS.tissueM, ATT, { m: MM(LASTHAND, MD(0, 0.02, 0.04, 0, 0, 0, 1)) }); }; })();
var SPOOGE = null;
function stepSpooge() { if (G.interior) return; if (SPOOGE && (SPOOGE.dead || PEDS.indexOf(SPOOGE) < 0)) SPOOGE = null; if (SPOOGE) return; if ((G.spoogeT || 0) > G.t) return; G.spoogeT = G.t + 4;
  var s = SEATS.filter(function (q) { var d = dist2(q.x, q.z, P.x, P.z); return q.kind === 'bench' && !q.taken && d > 30 * 30 && d < 110 * 110 && dAt(q.x, q.z).style === 'cafe'; }).sort(function (a, b) { return hash2(Math.round(a.x), Math.round(a.z), 9) - hash2(Math.round(b.x), Math.round(b.z), 9); })[0];
  if (!s) return;
  var p = makePed({ x: s.x - Math.sin(s.a) * 0.08 + Math.cos(s.a) * 0.42, z: s.z - Math.cos(s.a) * 0.08 - Math.sin(s.a) * 0.42, kind: 'cit', who: 'spooge', rig: RIGS.spooge, state: 'idle', keep: 1 }); p.a = s.a; p.fixY = s.y; p.seat = s; s.taken = 1;
  p.ctl = function () { p.y = p.fixY; p.a = s.a; p.vx = p.vz = 0; if (P.state === 'foot' && Math.hypot(P.x - p.x, P.z - p.z) < 5 && (p.sayT || 0) <= 0 && Math.random() < 0.02) say(p, pick(CASTLINES.spooge)); };
  p.pose = function (Q) { var S = sitPose('bench', 0, 0, 0, 0); for (var k in S) Q[k] = S[k]; Q.sh[1] = [0.9, 0.1, 0.3]; Q.el[1] = 1.4; }; SPOOGE = p; }
/* the knights' and the demons' turn each frame */
(function () { var sf = stepFun; stepFun = function (dt) { sf(dt); try { stepKnights(dt); stepDemons(dt); stepSpooge(); } catch (e) { if (!window.__u165err) { window.__u165err = 1; console.warn(e); } } };
  var df = drawFun; drawFun = function () { df(); drawKnights(); drawDemons(); };
  var dh = drawHud; drawHud = function () { dh.apply(this, arguments); if (!KNIGHTS || G.interior) return; var ctx = KIT.ctx; KNIGHTS.forEach(function (p) { if (!p.said || p.sayT <= 0) return;
      var s = R3.project(p.x, p.y + 4.0, p.z); if (!s || dist2(p.x, p.z, P.x, P.z) > 30 * 30) return; var w = Math.min(190, tw2(p.said, 8) + 10), L = KIT.wrap ? KIT.wrap(p.said, 180, 8, 'body') : [p.said];
      ctx.fillStyle = 'rgba(241,231,208,0.94)'; ctx.fillRect(s.x - w / 2, s.y - L.length * 10 - 5, w, L.length * 10 + 5); L.forEach(function (l, i) { tx(l, s.x - tw2(l, 8) / 2, s.y - L.length * 10 - 1 + i * 10, { col: '#12040a', size: 8 }); }); }); }; })();
