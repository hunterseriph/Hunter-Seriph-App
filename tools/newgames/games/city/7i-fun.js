/* ---------- update 158 (his asks: more things to do, sit on benches and light a joint, the wilderness needs things to
   interact with, decorations a car would knock over, smoke that moves, a lot more animation, the door inside buildings):
   - SEATS: every bench, log, picnic bench and porch chair can be sat on (Y). Sitting: X lights a joint (Saba sells
     them, you start with three): smoke from your mouth, the world goes a little wavy (G.high); by a campfire you warm up.
   - knock-overs: bins, hydrants, meters, news boxes, planters and benches fly when a car hits them (KNOCKED, the chunk's
     FURN mesh is rebuilt without them; they come back after four minutes); a hydrant hit sprays water.
   - animals: cows and sheep on the farms, deer and rabbits in the woods and fields, chickens in the farmyards; they wander,
     the wild ones run from you, cars knock them down; pet the tame ones.
   - birds: flocks circling over the land, gulls along the coast.
   - smoke and steam that rise, drift and fade: chimneys, cabins, farmhouses, the volcano, steam from the manholes and the
     grates in town; the fountains spray real droplets.
   - things to do: fishing off the jetties, climbing the ranger lookouts, photos at the view points, the scrapyard crusher,
     Dot's diner, the petrol station shop, a room at the motel, a pint at the village pub, praying at St Spunk's.
   - side jobs from the phone: taxi fares, paramedic runs, vigilante chases and Joff's pizza deliveries.
   - inside: you leave by walking into the door, and nothing stands in front of it. ---------- */
var SEATS = [], SEATG = {};
function addSeat(x, z, a, kind, o) { var k = Math.round(x * 2) + ',' + Math.round(z * 2); if (SEATG[k]) return; var s = { x: x, z: z, a: a, kind: kind, y: o && o.y !== undefined ? o.y : groundY(x, z) + (kind === 'bench' ? 0.6 : 0.45), fire: o && o.fire }; SEATG[k] = s; SEATS.push(s); }
function seatNear() { var best = null, bd = 1.6 * 1.6; for (var i = 0; i < SEATS.length; i++) { var s = SEATS[i]; if (Math.abs(s.x - P.x) > 3 || Math.abs(s.z - P.z) > 3) continue; var d = dist2(s.x, s.z, P.x, P.z); if (d < bd) { bd = d; best = s; } } return best; }
function sitDown(s) { G.seat = { s: s, t: 0, smoke: 0, puffT: 0 }; P.vx = P.vz = 0; sfx.play('select'); }
function standUp() { var s = G.seat.s; G.seat = null; var off = s.kind === 'chair' ? -0.75 : 0.9; /* update 169: you get up from a chair backwards, not into the table */ P.x = s.x + Math.sin(s.a) * off; P.z = s.z + Math.cos(s.a) * off; P.y = standY(P.x, P.z, P.y + 1); }
function lightJoint() { if (G.seat.smoke > 0) return; var have = SV.joints || 0; if (have <= 0) { toast('No joints left. Saba sells them.'); return; } SV.joints = have - 1; G.seat.smoke = 14; sfx.play('blip'); toast(pick(['You spark one up. Cum City slows right down.', 'A long drag. The streetlights go soft at the edges.', 'You light up. Somewhere a dog laughs.', 'Ahh. Everything is going to be fine.'])); }
var _stepFoot158 = stepFoot; stepFoot = function (dt) {
  if (G.fish) { P.vx = P.vz = 0; P.sp = 0; return; } // fishing: the rod has your hands
  if (G.seat) { var S = G.seat, s = S.s; S.t += dt; P.x = s.x - Math.sin(s.a) * 0.08; P.z = s.z - Math.cos(s.a) * 0.08; P.y = s.y; P.a = s.a; P.vx = P.vz = 0; P.sp = 0; P.ground = 1;
    var st = KIT.stick(0); if ((Math.hypot(st.x, st.y) > 0.6 && S.t > 0.4) || KIT.pressed('y') || P.hurtT > 0) { standUp(); return; }
    if (KIT.pressed('x')) lightJoint();
    if (S.smoke > 0) { S.smoke -= dt; S.puffT -= dt; G.high = Math.min(1, (G.high || 0) + dt * 0.05); P.hp = Math.min(SV.maxHp, P.hp + dt * 1.5); if (S.puffT <= 0) { S.puffT = 2.2; var hx = P.x + Math.sin(P.a) * 0.35, hz = P.z + Math.cos(P.a) * 0.35; for (var k = 0; k < 4; k++) addFx({ k: 'puff', x: hx, y: P.y + 1.15, z: hz, vx: Math.sin(P.a) * 0.4 + rnd(-0.2, 0.2), vy: rnd(0.3, 0.6), vz: Math.cos(P.a) * 0.4 + rnd(-0.2, 0.2), life: 2.6 + k * 0.3, s0: 0.25, grow: 0.6, col: [0.85, 0.85, 0.82], a0: 0.45 }); } if (S.smoke <= 0) toast('You flick the end away. Nice.'); }
    if (s.fire && P.hp < SV.maxHp) P.hp = Math.min(SV.maxHp, P.hp + dt * 4);
    return; }
  _stepFoot158(dt);
};
var _poseOfPlayer158 = poseOfPlayer; poseOfPlayer = function () {
  if (G.seat && !G.interior) { var Q = pose0(); poseSit(Q); Q.y = -0.45; var S = G.seat; if (S.smoke > 0) { var c = (S.t % 2.2) / 2.2, up = c < 0.35 ? Math.sin(c / 0.35 * Math.PI) : 0; Q.sh[1] = [1.1 + up * 0.5, -0.15, 0.2]; Q.el[1] = 1.6 + up * 0.75; Q.hp = -0.1 * up; } else if (S.s.fire) { Q.sh[0] = [1.3, 0.2, 0]; Q.sh[1] = [1.3, 0.2, 0]; Q.el[0] = Q.el[1] = 0.3; } else { Q.sh[0][0] = 0.6; Q.sh[1][0] = 0.6; } return Q; }
  return _poseOfPlayer158(); };
var _drawPlayer158 = drawPlayer; drawPlayer = function () { _drawPlayer158(); if (G.seat && G.seat.smoke > 0 && !G.interior) { var a = P.a, hx = P.x + Math.sin(a) * 0.28 + Math.cos(a) * -0.22, hz = P.z + Math.cos(a) * 0.28 - Math.sin(a) * -0.22, c = (G.seat.t % 2.2) / 2.2, up = c < 0.35 ? Math.sin(c / 0.35 * Math.PI) : 0, hy = P.y + 0.75 + up * 0.35;
    if (!RIGS.jointM) { var m = new R3.Mesh(); tub(m, [0, 0, 0], [0, 0, 0.16], 0.014, 0.02, '#f1e7d0', 5, { cap: 1, cap0: 1 }); RIGS.jointM = m.upload(); } R3.draw(RIGS.jointM, ATT, { m: MD(hx, hy, hz, a, -0.3, 0) }); var tip = [hx + Math.sin(a) * 0.17, hy + 0.05, hz + Math.cos(a) * 0.17]; if (Math.random() < 0.08) addFx({ k: 'puff', x: tip[0], y: tip[1], z: tip[2], vy: 0.35, vx: 0, vz: 0, life: 1.6, s0: 0.06, grow: 0.25, col: [0.9, 0.9, 0.9], a0: 0.35 }); addFx({ k: 'ember', x: tip[0], y: tip[1], z: tip[2], life: 0.02 }); } };
/* ---------- the drugs: a joint is just wavy, TB's pills are the full trip (his rule) ---------- */
stepDrugs = function (dt) { ['drunk', 'high', 'pilled'].forEach(function (k) { if (G[k] > 0) G[k] = Math.max(0, G[k] - dt / (k === 'high' ? 120 : 160)); });
  var pl = G.pilled || 0, hi = G.high || 0; G.fxWarp = hi * 0.55 + pl * 1.5; G.fxHue = pl * 1.1; G.fxNeg = pl > 0.6 && Math.sin(G.t * 0.7) > 0.97 ? 0.8 : 0; G.fxMeat = pl > 0.45 ? Math.max(0, Math.sin(G.t * 0.31)) * 0.35 * pl : 0;
  if (hi > 0.05) CAM.sway = Math.sin(G.t * 0.6) * 0.06 * hi; else CAM.sway = 0; if (pl > 0.3 && Math.random() < dt * 0.15) CAM.shake = Math.max(CAM.shake, 0.3);
  if (G.garlic > 0) G.garlic -= dt; };
/* ---------- things a car knocks over ---------- */
var KPM = {}, FLY = [];
function kpMesh(kind) { if (!KPM[kind]) { var m = new R3.Mesh(), g = new R3.Mesh(); sfDraw(m, kind, 0, 0, 0, 0, g); KPM[kind] = m.upload(); } return KPM[kind]; }
function knockProp(o, v) { if (KNOCKED[o.kp]) return; KNOCKED[o.kp] = G.t; var sp = Math.max(4, Math.abs(v.sp)), a = v.a + rnd(-0.5, 0.5);
  FLY.push({ kind: o.kind, x: o.x, y: o.y, z: o.z, a: o.a, vx: Math.sin(a) * sp * 0.8, vz: Math.cos(a) * sp * 0.8, vy: 3 + sp * 0.18, ry: rnd(-6, 6), rp: rnd(4, 9), pitch: 0, roll: 0, life: 40, rest: 0 });
  v.vx *= 0.94; v.vz *= 0.94; v.sp *= 0.94; if (G.t > (G.kpSfx || 0)) { G.kpSfx = G.t + 0.25; sfx.play('hit'); }
  if (o.kind === 'hyd') G.sprays = (G.sprays || []).concat([{ x: o.x, z: o.z, y: o.y, t: 14 }]);
  if (o.kind === 'meter') for (var c = 0; c < 3; c++) PICKUPS.push({ k: 'cash', x: o.x + rnd(-1.5, 1.5), z: o.z + rnd(-1.5, 1.5), y: o.y, n: 5 });
  if (o.kind === 'news') for (var n = 0; n < 8; n++) addFx({ k: 'paper', x: o.x, y: o.y + 0.8, z: o.z, vx: rnd(-3, 3), vy: rnd(2, 5), vz: rnd(-3, 3), life: 3 });
  rebuildFurn(o.x, o.z); }
function rebuildFurn(x, z) { var C = CHUNKS[chunkKey(Math.floor(x / CS), Math.floor(z / CS))]; if (!C || !C.kp) return; var m = new R3.Mesh(), g = new R3.Mesh();
  C.kp.forEach(function (q) { if (!KNOCKED[q.key]) sfDraw(m, q.kind, q.x, q.y, q.z, q.a, g); }); if (C.furn) C.furn.free(); C.furn = m.n ? m.upload() : null; }
function stepKnock(dt) {
  FLY = FLY.filter(function (f) { f.life -= dt; if (!f.rest) { f.vy -= 18 * dt; f.x += f.vx * dt; f.z += f.vz * dt; f.y += f.vy * dt; f.a += f.ry * dt; f.pitch += f.rp * dt; var g = groundY(f.x, f.z) + 0.1; if (f.y < g) { f.y = g; if (Math.abs(f.vy) > 2.5) { f.vy *= -0.32; f.vx *= 0.55; f.vz *= 0.55; f.rp *= 0.5; } else { f.rest = 1; f.pitch = Math.PI / 2 * (Math.cos(f.pitch) > 0 ? 1 : -1); f.vx = f.vz = f.vy = 0; } } } return f.life > 0; });
  (G.sprays || []).forEach(function (s) { s.t -= dt; for (var k = 0; k < 3; k++) addFx({ k: 'drop', x: s.x + rnd(-0.1, 0.1), y: s.y + 0.6, z: s.z + rnd(-0.1, 0.1), vx: rnd(-1.2, 1.2), vy: rnd(7, 10) * Math.min(1, s.t / 4 + 0.3), vz: rnd(-1.2, 1.2), life: 1.4 }); }); G.sprays = (G.sprays || []).filter(function (s) { return s.t > 0; });
  if ((G.kpCheck = (G.kpCheck || 0) - dt) <= 0) { G.kpCheck = 5; var back = {}; for (var k2 in KNOCKED) { if (G.t - KNOCKED[k2] > 240) { var p = k2.split('@')[1].split(','), x = +p[0] / 10, z = +p[1] / 10; if (dist2(x, z, P.x, P.z) > 90 * 90) { delete KNOCKED[k2]; back[chunkKey(Math.floor(x / CS), Math.floor(z / CS))] = [x, z]; } } } for (var ck in back) rebuildFurn(back[ck][0], back[ck][1]); }
}
function drawKnock() { FLY.forEach(function (f) { if (dist2(f.x, f.z, CAM.x, CAM.z) > 120 * 120) return; R3.draw(kpMesh(f.kind), ATT, { m: MD(f.x, f.y, f.z, f.a, f.pitch, 0, f.life < 2 ? Math.max(0.01, f.life / 2) : 1) }); }); }
/* ---------- animals ---------- */
var ANIM = [], ANM = {};
function animalMesh(k) { if (ANM[k]) return ANM[k]; var m = new R3.Mesh();
  function legs(w, l, h, col, r) { [[-w, l], [w, l], [-w, -l], [w, -l]].forEach(function (q) { tub(m, [q[0], h, q[1]], [q[0], 0, q[1]], r, r * 0.8, col, 5, { cap0: 1 }); }); }
  if (k === 'cow') { ell(m, 0, 1.25, 0, 0.6, 0.55, 1.05, '#f1ece0', 10, 6); ell(m, 0.35, 1.4, 0.2, 0.3, 0.32, 0.45, '#1a1416', 6, 4); ell(m, -0.3, 1.2, -0.5, 0.32, 0.3, 0.4, '#1a1416', 6, 4); ell(m, 0, 1.45, 1.2, 0.28, 0.3, 0.38, '#f1ece0', 8, 5); ell(m, 0, 1.32, 1.5, 0.2, 0.17, 0.12, '#e8a0a0', 6, 4); [-1, 1].forEach(function (s) { tub(m, [s * 0.18, 1.7, 1.12], [s * 0.38, 1.85, 1.05], 0.04, 0.02, '#e8dcc0', 4); ell(m, s * 0.33, 1.55, 1.05, 0.12, 0.06, 0.08, '#1a1416', 5, 3); }); legs(0.35, 0.65, 0.95, '#f1ece0', 0.11); tub(m, [0, 1.4, -1.0], [0, 0.8, -1.25], 0.04, 0.03, '#1a1416', 4); }
  else if (k === 'sheep') { ell(m, 0, 0.9, 0, 0.5, 0.45, 0.7, '#e8e0d0', 10, 6); for (var q = 0; q < 6; q++) ell(m, Math.cos(q) * 0.3, 1.1 + (q % 2) * 0.1, Math.sin(q * 1.7) * 0.4, 0.28, 0.25, 0.28, '#f1ece0', 6, 4); ell(m, 0, 1.05, 0.78, 0.18, 0.22, 0.26, '#1a1416', 8, 5); [-1, 1].forEach(function (s) { ell(m, s * 0.2, 1.12, 0.72, 0.12, 0.05, 0.06, '#1a1416', 4, 3); }); legs(0.25, 0.4, 0.6, '#1a1416', 0.06); }
  else if (k === 'deer') { ell(m, 0, 1.15, 0, 0.32, 0.38, 0.75, '#8a5a34', 10, 6); tub(m, [0, 1.3, 0.55], [0, 1.85, 0.85], 0.14, 0.11, '#8a5a34', 6); ell(m, 0, 1.95, 0.98, 0.13, 0.15, 0.25, '#7a4a2a', 8, 5); ell(m, 0, 1.15, -0.72, 0.1, 0.12, 0.06, '#f1e7d0', 5, 3); [-1, 1].forEach(function (s) { tub(m, [s * 0.06, 2.05, 0.9], [s * 0.3, 2.5, 0.85], 0.025, 0.015, '#d8c8a0', 3); tub(m, [s * 0.2, 2.3, 0.87], [s * 0.36, 2.4, 1.0], 0.02, 0.01, '#d8c8a0', 3); ell(m, s * 0.12, 2.1, 0.9, 0.04, 0.1, 0.03, '#7a4a2a', 4, 3); }); legs(0.18, 0.5, 0.85, '#6a4020', 0.05); }
  else if (k === 'rabbit') { ell(m, 0, 0.18, 0, 0.12, 0.14, 0.2, '#9a8a7a', 8, 5); ell(m, 0, 0.3, 0.18, 0.09, 0.09, 0.1, '#9a8a7a', 6, 4); [-1, 1].forEach(function (s) { ell(m, s * 0.035, 0.45, 0.16, 0.025, 0.1, 0.02, '#9a8a7a', 4, 3); }); ell(m, 0, 0.2, -0.2, 0.05, 0.05, 0.05, '#f1ece0', 4, 3); }
  else if (k === 'chicken') { ell(m, 0, 0.3, 0, 0.14, 0.16, 0.2, '#f1ece0', 8, 5); ell(m, 0, 0.5, 0.14, 0.08, 0.1, 0.08, '#f1ece0', 6, 4); ell(m, 0, 0.6, 0.15, 0.03, 0.05, 0.05, '#c4121c', 4, 3); tub(m, [0, 0.5, 0.2], [0, 0.48, 0.28], 0.025, 0, '#e0a020', 4); legs(0.05, 0.02, 0.18, '#e0a020', 0.015); }
  ANM[k] = m.upload(); return ANM[k]; }
var ANSPD = { cow: 0.7, sheep: 0.8, deer: 6.5, rabbit: 5, chicken: 1.2 };
function animalFor(x, z) { var k = kAt(x, z), d = dAt(x, z); if (!natural(k) && k !== K_DIRT) return null;
  var farm = POIS.filter(function (p) { return p.k === 'farm' && Math.abs(p.x - x) < 90 && Math.abs(p.z - z) < 90; })[0];
  if (farm) { var inYard = Math.abs(x - farm.x) < 22 && Math.abs(z - farm.z) < 16; if (inYard) return Math.random() < 0.5 ? 'chicken' : 'cow'; return k === K_FIELD ? (Math.random() < 0.5 ? 'cow' : 'sheep') : 'sheep'; }
  if (d.style === 'forest' || d.style === 'grotto' || k === K_FOREST) return Math.random() < 0.45 ? 'deer' : 'rabbit';
  if (d.style === 'country' && (k === K_GRASS || k === K_FIELD)) return Math.random() < 0.7 ? 'rabbit' : 'deer';
  return null; }
function stepAnimals(dt) {
  if (G.interior) return; var px = P.state === 'car' && P.veh ? P.veh.x : P.x, pz = P.state === 'car' && P.veh ? P.veh.z : P.z;
  if ((G.anT = (G.anT || 0) - dt) <= 0 && ANIM.length < 16 && !/downtown|redlight|cafe|labs|industrial|docks/.test(dAt(px, pz).style)) { G.anT = 0.6; var a = Math.random() * 6.283, r = rnd(35, 110), x = px + Math.sin(a) * r, z = pz + Math.cos(a) * r, k = animalFor(x, z);
    if (k && !collide(x, z, 0.6, groundY(x, z), 1).hit) { var n = k === 'sheep' || k === 'cow' || k === 'chicken' ? 3 : k === 'deer' ? 2 : 1; for (var q = 0; q < n; q++) ANIM.push({ k: k, x: x + rnd(-4, 4), z: z + rnd(-4, 4), a: Math.random() * 6.28, st: 'idle', t: rnd(1, 5), ph: Math.random() * 6, sp: 0, hp: 1 }); } }
  ANIM = ANIM.filter(function (A) { if (dist2(A.x, A.z, px, pz) > 170 * 170) return false;
    if (A.st === 'dead') { A.t += dt; return A.t < 60; }
    var dP = Math.hypot(P.x - A.x, P.z - A.z), wild = A.k === 'deer' || A.k === 'rabbit' || A.k === 'chicken';
    if (wild && (dP < (P.sp > 3 || P.state === 'car' ? 16 : 7))) { A.st = 'flee'; A.t = 3; A.a = Math.atan2(A.x - P.x, A.z - P.z) + rnd(-0.4, 0.4); }
    A.t -= dt; if (A.t <= 0) { if (A.st === 'idle') { A.st = 'walk'; A.t = rnd(2, 6); A.a += rnd(-1.2, 1.2); } else { A.st = 'idle'; A.t = rnd(2, 8); } }
    var want = A.st === 'walk' ? ANSPD[A.k] * (A.k === 'deer' ? 0.15 : A.k === 'rabbit' ? 0.25 : 1) : A.st === 'flee' ? ANSPD[A.k] * (A.k === 'cow' || A.k === 'sheep' ? 2.5 : 1) : 0; A.sp += (want - A.sp) * Math.min(1, dt * 4);
    var nx = A.x + Math.sin(A.a) * A.sp * dt, nz = A.z + Math.cos(A.a) * A.sp * dt, nk = kAt(nx, nz); if (isWaterK(nk) || nk === K_ROAD && !A.st === 'flee' || collide(nx, nz, 0.4, groundY(nx, nz), 1).hit) { A.a += Math.PI * 0.7; } else { A.x = nx; A.z = nz; }
    A.ph += A.sp * dt * (A.k === 'rabbit' ? 5 : 3);
    // cars knock them down
    for (var i = 0; i < VEH.length; i++) { var v = VEH[i]; if (Math.abs(v.sp) > 5 && dist2(v.x, v.z, A.x, A.z) < Math.pow(v.t.len * 0.5 + 0.4, 2)) { A.st = 'dead'; A.t = 0; A.roll = 0; A.vy = 4; sfx.play('hit'); if (v === P.veh) toast(pick(['Roadkill.', 'Sorry, Bambi.', 'That will buff out.', 'The farmer is not going to like that.'])); break; } }
    return true; });
}
function drawAnimals() { ANIM.forEach(function (A) { if (dist2(A.x, A.z, CAM.x, CAM.z) > 120 * 120 || !inView(A.x, A.z, 3)) return; var y = groundY(A.x, A.z), bob = A.st === 'dead' ? 0 : A.k === 'rabbit' && A.sp > 0.5 ? Math.abs(Math.sin(A.ph)) * 0.25 : Math.abs(Math.sin(A.ph)) * 0.05, pit = A.st === 'dead' ? 0 : Math.sin(A.ph) * (A.sp > 0.3 ? 0.06 : 0), graze = A.st === 'idle' && (A.k === 'cow' || A.k === 'sheep') ? 0.15 : 0;
  R3.draw(animalMesh(A.k), ATT, { m: MD(A.x, y + bob, A.z, A.a, pit + graze, A.st === 'dead' ? Math.PI / 2 : 0) }); }); }
function animalUse() { var best = null, bd = 2.4 * 2.4; ANIM.forEach(function (A) { if (A.st === 'dead' || A.k === 'deer' || A.k === 'rabbit') return; var d = dist2(A.x, A.z, P.x, P.z); if (d < bd) { bd = d; best = A; } }); if (!best) return null;
  var A = best; return { x: A.x, z: A.z, r: 2.4, label: 'PET THE ' + A.k.toUpperCase(), fn: function () { A.st = 'idle'; A.t = 4; A.a = Math.atan2(P.x - A.x, P.z - A.z); P.hp = Math.min(SV.maxHp, P.hp + 5); toast({ cow: pick(['Moo.', 'The cow leans into you. Good cow.', 'She smells of grass and secrets.']), sheep: pick(['Baa.', 'Fluffy. Very fluffy.', 'The sheep judges you, but kindly.']), chicken: pick(['Bawk.', 'The chicken pecks your shoe.', 'It looks at you like you owe it money.']) }[A.k]); } }; }
/* ---------- birds ---------- */
var BIRDM = [];
function birdMeshes() { if (BIRDM.length) return BIRDM; [0.5, -0.3].forEach(function (up) { var m = new R3.Mesh(); m.tri([0, 0, 0.2], [-0.7, up, -0.05], [0, 0, -0.2], UV1, TL('white'), [0.12, 0.1, 0.1], [0, 1, 0]); m.tri([0, 0, -0.2], [0.7, up, -0.05], [0, 0, 0.2], UV1, TL('white'), [0.12, 0.1, 0.1], [0, 1, 0]); m.tri([0, 0, -0.2], [-0.7, up, -0.05], [0, 0, 0.2], UV1, TL('white'), [0.12, 0.1, 0.1], [0, -1, 0]); m.tri([0, 0, 0.2], [0.7, up, -0.05], [0, 0, -0.2], UV1, TL('white'), [0.12, 0.1, 0.1], [0, -1, 0]); BIRDM.push(m.upload()); }); return BIRDM; }
function drawBirds() { G.birdsDrawn = 0; if (G.interior || G.weather === 'storm') return; var dl = dayLight(G.time); if (dl < 0.2) return; var M2 = birdMeshes(), cx = Math.floor(CAM.x / 300), cz = Math.floor(CAM.z / 300);
  for (var gi = -1; gi <= 1; gi++) for (var gj = -1; gj <= 1; gj++) { var bi = cx + gi, bj = cz + gj, h = hash2(bi, bj, 61); if (h > 0.3) continue; var ox = (bi + 0.5) * 300, oz = (bj + 0.5) * 300, gull = isWaterK(kAt(ox, oz)) || kAt(ox, oz) === K_SAND, n = 4 + Math.floor(h * 12), R0 = 30 + h * 40, Y = groundY(ox, oz) + 35 + h * 30, sp = 0.18 + h * 0.15;
    for (var k = 0; k < n; k++) { if ((G.birdsDrawn = (G.birdsDrawn || 0) + 1) > 24) return; var a = G.t * sp + k * 0.5 + h * 9, rr = R0 + Math.sin(k * 2.3) * 8, x = ox + Math.cos(a) * rr, z = oz + Math.sin(a) * rr, y = Y + Math.sin(G.t * 0.7 + k) * 3; if (dist2(x, z, CAM.x, CAM.z) > 260 * 260) continue; var flap = Math.floor((G.t * (gull ? 3 : 7) + k) % 2);
      R3.draw(M2[flap], ATT, { m: MD(x, y, z, a + Math.PI, 0, 0.3, gull ? 1.4 : 0.8), lit: false, tint: gull ? [7, 7, 7] : [1, 1, 1] }); } } }
/* ---------- smoke, steam and fountains ---------- */
var STEAMS = null;
function steamSpots() { if (STEAMS) return STEAMS; STEAMS = poisOf('manhole').map(function (p) { return { x: p.x, z: p.z }; });
  RN.forEach(function (nd) { if (STEAMS.length > 90) return; var st = dAt(nd.x, nd.z).style; if (!/downtown|redlight|cafe|industrial/.test(st) || hash2(Math.round(nd.x), Math.round(nd.z), 71) > 0.28 || !nd.e.length) return; var E = RE[nd.e[0]], p = edgeAt(E, Math.min(E.len - 2, 14), E.b === nd.i, 0); STEAMS.push({ x: p.x, z: p.z, grate: 1 }); }); return STEAMS; }
function stepSmoke(dt) { if (G.interior) return; var cx = CAM.x, cz = CAM.z, wind = [Math.cos(G.t * 0.03) * 0.8 + 0.6, Math.sin(G.t * 0.02) * 0.6];
  LMK.forEach(function (o) { if (!o.smoke) return; var s = o.smoke, d = dist2(s[0], s[2], cx, cz); if (d > 320 * 320) return; o.smT = (o.smT || 0) - dt; if (o.smT > 0) return; var big = o.p.k === 'volcano' || o.p.k === 'chimney'; o.smT = big ? 0.25 : 0.55;
    addFx({ k: 'puff', x: s[0] + rnd(-0.2, 0.2), y: s[1], z: s[2] + rnd(-0.2, 0.2), vx: wind[0] * 0.6, vy: big ? 2.6 : 1.1, vz: wind[1] * 0.6, life: big ? 7 : 5, s0: big ? 2.2 : 0.5, grow: big ? 2.6 : 0.9, col: o.p.k === 'volcano' ? [0.35, 0.3, 0.3] : [0.55, 0.53, 0.52], a0: 0.5, drift: wind }); });
  steamSpots().forEach(function (s) { if (Math.abs(s.x - cx) > 70 || Math.abs(s.z - cz) > 70) return; s.t = (s.t || 0) - dt; if (s.t > 0) return; s.t = 0.35 + hash2(Math.round(s.x), 1, 1) * 0.3; var y = groundY(s.x, s.z) + 0.1;
    addFx({ k: 'puff', x: s.x + rnd(-0.3, 0.3), y: y, z: s.z + rnd(-0.3, 0.3), vx: wind[0] * 0.3, vy: 1.4, vz: wind[1] * 0.3, life: 3.2, s0: 0.6, grow: 1.4, col: [0.85, 0.85, 0.88], a0: 0.32, drift: wind }); });
  // the fountains: droplets in arcs from the jets, the basin rippling
  poisOf('fountain2').forEach(function (p) { if (dist2(p.x, p.z, cx, cz) > 90 * 90) return; for (var k = 0; k < 8; k++) { if (Math.random() > dt * 18) continue; var a = k / 8 * 6.283 + G.t * 0.1, r = 4.5, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r; addFx({ k: 'drop', x: x, y: p.h + 0.7, z: z, vx: -Math.cos(a) * 1.6, vy: 5.2 + Math.random(), vz: -Math.sin(a) * 1.6, life: 1.1, floor: p.h + 0.6 }); }
    if (Math.random() < dt * 30) addFx({ k: 'drop', x: p.x, y: p.h + 3.4, z: p.z, vx: rnd(-1.4, 1.4), vy: 6 + Math.random() * 2, vz: rnd(-1.4, 1.4), life: 1.3, floor: p.h + 3.2 }); });
}
/* ---------- places in the country you can use ---------- */
function countryUses() { var U = [];
  poisOf('jetty').forEach(function (p) { if (p.end) U.push({ x: p.end.x, z: p.end.z, r: 2.4, label: 'FISH', fn: function () { startFishing(p); } }); });
  poisOf('lookout').forEach(function (p) { if (!p.top) return; U.push({ x: p.foot.x, z: p.foot.z, r: 2, label: 'CLIMB THE LOOKOUT', fn: function () { G.fade = 1; P.x = p.top.x; P.z = p.top.z + 1.2; P.y = p.top.y; P.vy = 0; toast('The whole of Cum City, laid out like a cheap rug.'); } }); U.push({ x: p.top.x, z: p.top.z, r: 3, label: 'CLIMB DOWN', top: p.top.y, fn: function () { G.fade = 1; P.x = p.foot.x; P.z = p.foot.z + 0.6; P.y = groundY(P.x, P.z); } }); });
  poisOf('view').forEach(function (p) { U.push({ x: p.x, z: p.z, r: 2.6, label: 'TAKE A PHOTO: ' + p.name.toUpperCase() + (SV.photos[p.name] ? ' (TAKEN)' : ''), fn: function () { G.flashT = 0.25; sfx.play('blip'); if (SV.photos[p.name]) { toast('Lovely. Still lovely.'); return; } SV.photos[p.name] = 1; var n = Object.keys(SV.photos).length; money(150); bigText('PHOTO ' + n + ' OF ' + poisOf('view').length, p.name + ' · +$150', '#f1e7d0', 2.5); if (n === poisOf('view').length) { money(2000); toast('Every view in Cum City. The tourist board sends you $2000.', 5); } persist(); } }); });
  poisOf('scrapyard').forEach(function (p) { if (p.crusher) U.push({ x: p.crusher.x, z: p.crusher.z + 4, r: 6, car: 1, label: 'CRUSH THIS CAR FOR CASH', fn: crushCar }); });
  poisOf('diner').forEach(function (p) { if (p.door) U.push({ x: p.door.x, z: p.door.z, r: 2.4, label: "EAT AT DOT'S ($12)", blip: 'shop', icon: 'D', fn: function () { if (SV.money < 12) { toast('$12 for the all day breakfast.'); return; } money(-12); P.hp = SV.maxHp; G.fade = 0.8; toast(pick(["Dot slaps down a plate. 'Eat it before it gets cold, sugar.'", 'Eggs, beans, something brown. Full health.', 'Bottomless coffee. You feel indestructible.'])); } }); });
  poisOf('petrol').forEach(function (p) { if (p.door) U.push({ x: p.door.x, z: p.door.z, r: 2.4, label: 'BUY SNACKS ($5)', icon: 'P', blip: 'shop', fn: function () { if (SV.money < 5) { toast('$5 for a meal deal.'); return; } money(-5); P.hp = Math.min(SV.maxHp, P.hp + 35); toast(pick(['A sausage roll of unknown age. +35 health.', 'Crisps and an energy drink. Your heart says thank you.'])); } }); });
  poisOf('motel').forEach(function (p) { if (p.door) U.push({ x: p.door.x, z: p.door.z, r: 2.4, label: 'RENT A ROOM ($40): SLEEP AND SAVE', icon: 'M', blip: 'house', fn: function () { if (SV.money < 40) { toast('$40 a night. No questions asked.'); return; } money(-40); sleepSave(); toast('The sheets are sticky. You sleep like a log anyway. Saved.'); } }); });
  poisOf('village').forEach(function (p) { if (p.pub) U.push({ x: p.pub.x, z: p.pub.z, r: 2.4, label: 'A PINT AT THE DRIPPING TAP ($6)', fn: function () { if (SV.money < 6) return; money(-6); G.drunk = Math.min(1, (G.drunk || 0) + 0.35); P.hp = Math.min(SV.maxHp, P.hp + 10); toast(pick(['The locals stop talking when you walk in. Then start again.', 'A warm pint and a pickled egg.'])); } }); });
  poisOf('church').forEach(function (p) { if (p.door) U.push({ x: p.door.x, z: p.door.z, r: 2.4, label: 'PRAY', fn: function () { if (SV.wanted > 0) { SV.wanted = Math.max(0, SV.wanted - 1); SV.heat = HEATLV[SV.wanted]; toast('A star forgiven. Go and sin no more. Or at least less.'); } else toast('Peace and quiet. Even Cum City has some.'); G.fade = 0.6; } }); });
  poisOf('cabin').forEach(function (p) { if (p.door) U.push({ x: p.door.x, z: p.door.z, r: 2, label: 'SEARCH THE CABIN', fn: function () { var k = 'cabin' + Math.round(p.x); if (SV.photos[k]) { toast('Empty. Just antlers and regret.'); return; } SV.photos[k] = 1; giveWeapon('rifle', 30); toast('A hunting rifle under the bed. Finders keepers.'); persist(); } }); });
  return U; }
function crushCar() { var v = P.veh; if (!v) return; var val = { hatch: 120, saloon: 160, van: 200, muscle: 400, sports: 600, taxi: 150, police: 300, truck: 350, limo: 800, hearse: 300, icecream: 250, buggy: 180, ambulance: 300, kart: 100 }[v.type] || 150; exitVehicle(true); VEH.splice(VEH.indexOf(v), 1); money(val); CAM.shake = 0.6; sfx.play('crash'); bigText('CRUSHED', '+$' + val, '#ffe36a', 2.5); for (var k = 0; k < 12; k++) addFx({ k: 'spark', x: P.x + rnd(-2, 2), y: P.y + 1, z: P.z + rnd(-2, 2), vx: rnd(-4, 4), vy: rnd(2, 6), vz: rnd(-4, 4), life: 0.6 }); }
/* ---------- fishing ---------- */
var FISHES = [['Cream Carp', 3, 40], ['Spunk Salmon', 5, 80], ['Load Bass', 4, 60], ['Blum Eel', 2, 90], ['Pike of Shame', 7, 120], ['Old Boot', 1, 0], ['Rusty Cumbo Hubcap', 2, 5], ['The Fish That Grinned', 9, 400]];
function startFishing(p) { G.fish = { p: p, st: 'cast', t: 0, wait: rnd(3, 9) }; P.a = p.end.a; P.x = p.end.x; P.z = p.end.z; sfx.play('swing'); toast('Cast out. Wait for a bite, then press A.'); }
function stepFishing(dt) { var F = G.fish; if (!F) return; F.t += dt; P.vx = P.vz = 0; var st = KIT.stick(0);
  if (Math.hypot(st.x, st.y) > 0.6 && F.st !== 'bite') { G.fish = null; toast('You reel in. Nothing.'); return; }
  if (F.st === 'cast' && F.t > F.wait) { F.st = 'bite'; F.t = 0; sfx.play('alarm'); }
  else if (F.st === 'bite') { if (KIT.pressed('a') || KIT.pressed('x')) { var r = Math.random(), f = r < 0.04 ? FISHES[7] : r < 0.12 ? FISHES[5] : r < 0.18 ? FISHES[6] : FISHES[Math.floor(Math.random() * 5)], kg = Math.round((f[1] * (0.5 + Math.random())) * 10) / 10; money(f[2]); SV.fish = (SV.fish || 0) + 1; if (kg > (SV.fishBest || 0) && f[2] > 0) SV.fishBest = kg; bigText(f[0].toUpperCase(), kg + ' kg' + (f[2] ? ' · sold for $' + f[2] : ''), '#4adfff', 3); sfx.play(f[2] ? 'coin' : 'lose'); G.fish = { p: F.p, st: 'cast', t: 0, wait: rnd(4, 10) }; persist(); }
    else if (F.t > 0.9) { toast('It got away.'); G.fish = { p: F.p, st: 'cast', t: 0, wait: rnd(4, 10) }; } }
  if (KIT.pressed('y')) { G.fish = null; } }
function drawFishing() { var F = G.fish; if (!F) return; var a = F.p.end.a, bx = P.x + Math.sin(a) * 9, bz = P.z + Math.cos(a) * 9, by = 0.1 + (F.st === 'bite' ? -0.25 + Math.sin(G.t * 30) * 0.08 : Math.sin(G.t * 2) * 0.05), hx = P.x + Math.sin(a) * 0.5, hz = P.z + Math.cos(a) * 0.5, tip = [P.x + Math.sin(a) * 3.2, P.y + 2.6, P.z + Math.cos(a) * 3.2];
  var m = new R3.Mesh(); tub(m, [hx, P.y + 1.1, hz], tip, 0.03, 0.012, '#3a2a1a', 4); tub(m, tip, [bx, by + 0.15, bz], 0.004, 0.004, '#f1e7d0', 3); ell(m, bx, by + 0.15, bz, 0.09, 0.12, 0.09, '#c4121c', 6, 4); R3.draw(m, ATT); }
var _poseOfPlayerF = poseOfPlayer; poseOfPlayer = function () { var Q = _poseOfPlayerF(); if (G.fish) { Q.sh[0] = [1.3, 0.1, 0.3]; Q.sh[1] = [1.4, 0.1, -0.3]; Q.el[0] = Q.el[1] = 0.6; if (G.fish.st === 'bite') { Q.lean = -0.2; Q.sh[0][0] = 1.9; Q.sh[1][0] = 1.9; } } return Q; };
/* ---------- side jobs (from the phone) ---------- */
var JOBS = { taxi: { n: 'TAXI FARES', need: ['taxi'], pay: 1 }, para: { n: 'PARAMEDIC', need: ['ambulance'] }, vig: { n: 'VIGILANTE', need: ['police'] }, pizza: { n: "JOFF'S PIZZA RUN", need: ['scooter', 'moto'] } };
function jobStart(k) { var v = P.veh; if (!v || JOBS[k].need.indexOf(v.type) < 0) { toast(k === 'taxi' ? 'Get in a taxi first.' : k === 'para' ? 'Get in an ambulance first.' : k === 'vig' ? 'Get in a police car first.' : 'Get on a scooter or a motorbike first.'); return; }
  G.job = { k: k, lvl: 0, total: 0, v: v }; bigText(JOBS[k].n, 'Level 1 · leave the vehicle to stop', '#ffe36a', 2.5); jobNext(); }
function jobStop(msg) { var J = G.job; if (!J) return; if (J.ped) { J.ped.keep = 0; J.ped.inside = J.ped.inside === 'cab' ? null : J.ped.inside; } if (J.foe) J.foe.keep = 0; G.job = null; G.timer = null; G.counter = null; toast((msg || 'Shift over.') + ' You made $' + J.total + '.', 5); }
function jobPlace(minD, maxD) { for (var t = 0; t < 30; t++) { var a = Math.random() * 6.283, r = rnd(minD, maxD), x = P.veh.x + Math.sin(a) * r, z = P.veh.z + Math.cos(a) * r, rd = nearestRoad(x, z, 80); if (rd && !rd.E.track) { var s = edgeAt(rd.E, rd.s, false, rd.E.w / 2 + 1.6); return { x: s.x, z: s.z }; } } return null; }
function jobNext() { var J = G.job; if (!J) return; J.lvl++; J.st = 'pick'; var p = jobPlace(120, 420); if (!p) { jobStop(); return; }
  if (J.k === 'vig') { var r = nearestRoad(p.x, p.z, 60), v = makeVeh(pick(['muscle', 'sports', 'saloon']), r.x, r.z, Math.atan2(r.dx, r.dz), { col: 1 }); var d = makePed({ x: v.x, z: v.z, kind: 'goon', rig: RIGS.gimp || CITIZENS[0], keep: 1, hostile: 1 }); d.inVeh = v; v.driver = d; v.keep = 1; v.ai = { E: r.E, s: r.s, back: false, lane: r.E.w / 4, want: 22, wait: 0, flee: 1 }; J.foe = v; J.mark = { x: v.x, z: v.z }; G.objective = 'Level ' + J.lvl + ': stop the criminals.'; G.timer = 120; return; }
  var who = makePed({ x: p.x, z: p.z, kind: 'cit', rig: pick(CITIZENS), state: 'idle', keep: 1 }); if (J.k === 'para') { who.down = 1; who.pose = function (Q) { poseDown(Q, 1, 0); }; } J.ped = who; J.mark = { x: p.x, z: p.z };
  G.objective = J.k === 'taxi' ? 'Level ' + J.lvl + ': pick up the fare.' : J.k === 'para' ? 'Level ' + J.lvl + ': pick up the patient.' : 'Level ' + J.lvl + ': collect the pizza at Joff\'s.'; G.timer = J.k === 'para' ? 60 + J.lvl * 4 : 90;
  if (J.k === 'pizza') { var jd = doorOf(SHOPS.joff.b); J.mark = { x: jd.x + Math.sin(jd.a) * 4, z: jd.z + Math.cos(jd.a) * 4 }; who.keep = 0; who.inside = 'gone'; J.ped = null; } }
function stepJob(dt) { var J = G.job; if (!J) return; if (P.state !== 'car' || P.veh !== J.v) { jobStop(); return; } if (G.timer !== null && G.timer !== undefined) { G.timer -= dt; if (G.timer <= 0) { jobStop('Out of time.'); return; } }
  var v = P.veh, d = J.mark ? Math.hypot(v.x - J.mark.x, v.z - J.mark.z) : 99; if (J.foe) { J.mark = { x: J.foe.x, z: J.foe.z }; if (J.foe.dead || !J.foe.driver || J.foe.driver.dead || J.foe.hp < 20) { var pay = 150 + J.lvl * 60; money(pay); J.total += pay; J.foe.keep = 0; J.foe = null; bigText('CRIMINALS STOPPED', '+$' + pay, '#4adfff', 2); jobNext(); } return; }
  if (d < 7 && Math.abs(v.sp) < 2.5) {
    if (J.st === 'pick') { J.st = 'drop'; if (J.ped) { J.ped.inside = 'cab'; } var t2 = jobPlace(200, 700); J.mark = t2; if (J.k === 'para') { var hd = doorOf(SHOPS.hosp.b); J.mark = { x: hd.x + Math.sin(hd.a) * 4, z: hd.z + Math.cos(hd.a) * 4 }; } J.dist = Math.hypot(J.mark.x - v.x, J.mark.z - v.z); G.timer = Math.max(30, J.dist / 9 + 15); G.objective = J.k === 'taxi' ? 'Take the fare to the marker.' : J.k === 'para' ? 'Get the patient to Cum City Hospital.' : 'Deliver the pizza while it is hot.'; sfx.play('door'); if (J.k === 'taxi') say(J.ped, pick(['Drive. Just drive.', 'Is this a real taxi?', 'Take the scenic route, I am in no hurry. Kidding. Hurry.'])); }
    else { var pay2 = Math.round((J.dist || 300) / 6 + G.timer * 2 + J.lvl * 20); money(pay2); J.total += pay2; if (J.ped) { J.ped.inside = null; J.ped.x = v.x + 2; J.ped.z = v.z; J.ped.keep = 0; J.ped.down = 0; J.ped.pose = null; J.ped.state = 'walk'; } J.ped = null; bigText(J.k === 'taxi' ? 'FARE PAID' : J.k === 'para' ? 'PATIENT SAVED' : 'PIZZA DELIVERED', '+$' + pay2 + ' · tips for speed', '#ffe36a', 2); sfx.play('coin'); jobNext(); } } }
var _gpsTarget158 = gpsTarget; gpsTarget = function () { var J = G.job; if (J && J.mark) return { x: J.mark.x, z: J.mark.z, c: '#4adfff' }; return _gpsTarget158(); };
var _blipList158 = blipList; blipList = function () { var L = _blipList158(); if (G.job && G.job.mark) L.push({ x: G.job.mark.x, z: G.job.mark.z, c: '#4adfff', big: 1, icon: '$' }); return L; };
/* ---------- the uses: seats, animals and the country places join the list ---------- */
var _nearestUse158 = nearestUse; nearestUse = function () { if (G.ride) return null; var u = _nearestUse158(); if (G.interior || G.seat || G.fish || P.state !== 'foot') return u;
  if (u && u.top !== undefined && Math.abs(P.y - u.top) > 2) u = null;
  var cn = typeof carNear === 'function' ? carNear() : null; if (cn && dist2(cn.x, cn.z, P.x, P.z) < 4.5 * 4.5) return u; // a car right there wins: Y gets in
  var s = seatNear(); if (s && (!u || dist2(s.x, s.z, P.x, P.z) < dist2(u.x, u.z, P.x, P.z))) return { x: s.x, z: s.z, r: 1.6, label: s.fire ? 'SIT BY THE FIRE' : 'SIT DOWN', fn: function () { sitDown(s); } };
  if (!u) u = animalUse(); return u; };
var _worldSetup158 = worldSetup; worldSetup = function () { _worldSetup158(); G.uses = G.uses.concat(countryUses()); };
/* ---------- inside: walk into the door to leave, nothing in front of the door ---------- */
var _roomMesh158 = roomMesh; roomMesh = function (id) { var RM = _roomMesh158(id); if (RM && RM.boxes) { var w = RM.w; RM.boxes = RM.boxes.filter(function (b) { return !(b[0] < w / 2 + 1.5 && b[2] > w / 2 - 1.5 && b[1] < 2.4); }).map(function (b) { return [b[0] + 0.06, b[1] + 0.06, b[2] - 0.06, b[3] - 0.06]; }); } return RM; };
function stepDoorWalk(dt) { var I = G.interior; if (!I || G.cut || G.talk || G.seat) return; var RM = I.RM, w = RM.w, mi = moveInput(); if (P.z < 0.85 && Math.abs(P.x - w / 2) < 1.1 && mi.m > 0.4 && mi.z < -0.2) { G.doorPush = (G.doorPush || 0) + dt; if (G.doorPush > 0.15) { G.doorPush = 0; var L = (G.indoorUses || []).filter(function (u) { return u.label === 'LEAVE'; })[0]; if (L) { sfx.play('door'); L.fn(); } } } else G.doorPush = 0; }
/* ---------- one step and one draw for all of the above ---------- */
function stepFun(dt) { stepKnock(dt); stepAnimals(dt); stepSmoke(dt); stepFishing(dt); stepJob(dt); stepDoorWalk(dt);
  LMK.forEach(function (o) { (o.lights || []).forEach(function (L) { if (L.flick) L.k2 = 0.75 + Math.sin(G.t * 13) * 0.12 + Math.sin(G.t * 7.7) * 0.1; }); }); }
function drawFun() { drawKnock(); drawAnimals(); drawBirds(); drawFishing(); }
/* a soft white puff for smoke and steam (tinted per use); Psycho's own 'smoke' tile was dark */
HIPAINT.smoke = function (g) { for (var k = 0; k < 7; k++) { var a = k / 7 * 6.283, x = 32 + Math.cos(a) * 9 * (k % 2 ? 1 : 0.6), y = 32 + Math.sin(a) * 9 * (k % 2 ? 1 : 0.6), r = 14 + (k % 3) * 3, gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  var gc = g.createRadialGradient(32, 32, 2, 32, 32, 24); gc.addColorStop(0, 'rgba(255,255,255,0.6)'); gc.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gc; g.fillRect(0, 0, 64, 64); };
/* sitting: the camera comes round to the front, a little to one side, so you see him sat there (the right stick still turns it) */
var _stepCamera158 = stepCamera; stepCamera = function (dt) { if (!G.seat || G.interior || G.cut) { G.seatCam = null; return _stepCamera158(dt); }
  var s = G.seat.s, r = KIT.stick(1); G.seatCam = (G.seatCam || 0) + (r.on ? -r.x * dt * 1.6 : 0); var a = s.a + 0.45 + G.seatCam, d = 3.6, tx = P.x, tz = P.z, ty = P.y + 0.9;
  var cx = tx + Math.sin(a) * d, cz = tz + Math.cos(a) * d, cy = Math.max(groundY(cx, cz) + 0.6, ty + 0.5); CAM.x += (cx - CAM.x) * Math.min(1, dt * 4); CAM.z += (cz - CAM.z) * Math.min(1, dt * 4); CAM.y += (cy - CAM.y) * Math.min(1, dt * 4); CAM.yaw = Math.atan2(tx - CAM.x, tz - CAM.z); CAM.at = [tx, ty, tz]; };
/* ---------- the rides at Ejaculand (update 158, more to do): pay $5 and ride the coaster, the ferris wheel, the drop
   tower or the carousel; the camera rides with you, any button gets off early ---------- */
var RIDEN = { coaster: ['THE LOAD COASTER', 34], ferris: ['THE FERRIS WHEEL', 52], dropper: ['THE DROP TOWER', 14], carousel: ['THE CAROUSEL', 20] };
function rideUses() { var U = []; Object.keys(RIDEN).forEach(function (k) { poisOf(k).forEach(function (p) { var e = k === 'coaster' ? { x: p.x - 30, z: p.z + 20 } : k === 'ferris' ? { x: p.x + 4, z: p.z + 5 } : { x: p.x, z: p.z + (k === 'carousel' ? 11 : 4) }; U.push({ x: e.x, z: e.z, r: 3, label: 'RIDE ' + RIDEN[k][0] + ' ($5)', fn: function () { if (SV.money < 5) { toast('$5 a ride.'); return; } money(-5); G.ride = { k: k, p: p, t: 0, back: [P.x, P.z, P.a] }; G.fade = 0.8; sfx.play('coin'); } }); }); }); return U; }
var _worldSetupR = worldSetup; worldSetup = function () { _worldSetupR(); G.uses = G.uses.concat(rideUses()); };
function rideCam(dt) { var R0 = G.ride, p = R0.p, y = p.h, t = G.t; R0.t += dt; var e, at;
  if (R0.k === 'ferris') { var a = t * 0.12, R = 16; e = [p.x + 1.2, y + 18 + Math.sin(a) * R - 1.2, p.z - Math.cos(a) * R]; at = [p.x + 40, y + 10, e[2] + 6]; }
  else if (R0.k === 'coaster' && p.path) { var u = (t * 0.06) % 1, f = u * 64, i = Math.floor(f), A = p.path[i], B = p.path[Math.min(64, i + 1)], C = p.path[Math.min(64, i + 3)], q = f - i; e = [A[0] + (B[0] - A[0]) * q, A[1] + (B[1] - A[1]) * q + 2.4, A[2] + (B[2] - A[2]) * q]; at = [C[0], C[1] + 1.2, C[2]]; }
  else if (R0.k === 'dropper') { var c = t % 14, h = c < 8 ? c / 8 * 34 : c < 9 ? 34 : Math.max(0, 34 - (c - 9) * (c - 9) * 30); e = [p.x, y + 2.6 + h, p.z + 3.2]; at = [p.x, y + h - 6 + (c < 9 ? 6 : 0), p.z + 30]; if (c > 9 && c < 10.2) CAM.shake = 0.4; }
  else { var a2 = t * 0.6, r = 6.5; e = [p.x + Math.cos(a2) * r, y + 2.2 + Math.sin(t * 2) * 0.25, p.z + Math.sin(a2) * r]; at = [p.x + Math.cos(a2 + 0.7) * 30, y + 2, p.z + Math.sin(a2 + 0.7) * 30]; }
  CAM.x = e[0]; CAM.y = e[1]; CAM.z = e[2]; CAM.at = at; P.x = R0.back[0]; P.z = R0.back[1];
  var any = KIT.pressed('a') || KIT.pressed('b') || KIT.pressed('x') || KIT.pressed('y'); if (R0.t > RIDEN[R0.k][1] || (any && R0.t > 1.5)) { G.ride = null; G.fade = 0.8; P.y = groundY(P.x, P.z); CAM.x = P.x - 4; CAM.z = P.z - 4; CAM.y = P.y + 3; toast(pick(['What a ride.', 'Your legs have gone to jelly.', 'Steve waves at you. He always waves.'])); } }
var _stepCameraR = stepCamera; stepCamera = function (dt) { if (G.ride && !G.interior) { rideCam(dt); return; } return _stepCameraR(dt); };
var _stepFootR = stepFoot; stepFoot = function (dt) { if (G.ride) { P.vx = P.vz = 0; return; } return _stepFootR(dt); };
var _drawPlayerR = drawPlayer; drawPlayer = function () { if (G.ride) return; return _drawPlayerR(); };
/* traffic: anything left standing in a junction (a car knocked off its lane that cannot get back on, a car nobody
   drives) is towed away once you are not looking at it close up, so the grid never locks solid behind it */
function stepTow(dt) { for (var i = VEH.length - 1; i >= 0; i--) { var v = VEH[i]; if (v === P.veh || v.keep || v.mission || v.owned || v.phone || v.t.cls === 'heli' || v.t.cls === 'plane' || v.t.cls === 'boat') continue; if (Math.abs(v.sp || 0) > 0.3 || (v.ai && !v.ai.phys && v.driver && !v.driver.dead)) { v.stillT = 0; continue; }
    v.stillT = (v.stillT || 0) + dt; if (v.stillT < 10) continue; var r = nearestRoad(v.x, v.z, 8); if (!r) continue; var A = RN[r.E.a], B = RN[r.E.b], nd = dist2(v.x, v.z, A.x, A.z) < dist2(v.x, v.z, B.x, B.z) ? A : B; if (nd.e.length < 3 || dist2(v.x, v.z, nd.x, nd.z) > 16 * 16) continue;
    if (dist2(v.x, v.z, P.x, P.z) < 45 * 45) continue; if (v.driver) { v.driver.inVeh = null; v.driver.keep = 0; } VEH.splice(i, 1); } }
var _stepFunT = stepFun; stepFun = function (dt) { _stepFunT(dt); stepTow(dt); };
