/* ---------- update 178 (his ask: T's job and the race to the airport could not be finished because you could not get
   to the airport building, and the whole airport was done badly: no planes, no helicopters, a road across the runway).
   - The road goes round the airport now (1a-u178-airport.js, 1f-u178-airport.js) with a slip road to the terminal.
   - The terminal has a way in at the front (the landside, facing the slip road): a canopy, glass doors and a drop-off
     kerb. Inside: the departures hall with check-in desks and staff, a departures board, security, rows of seats you
     can sit on, a cafe counter, travellers coming and going.
   - Jobs that say "the airport" end at the drop-off kerb. Any job place that sat inside something solid is moved to the
     nearest spot you can actually get to (that is what stopped the airport jobs).
   - Planes at the stands (Cumcorde jets and Skyloads), helicopters on painted pads by the hangars, a Skyload in front of
     each hangar. All real: you can take them. They are there while you are near the airport.
   - An airliner lands and takes off on the runway now and then (with the roar). ---------- */
var APT = null;
function aptP() { return POIS.filter(function (p) { return p.k === 'terminal'; })[0]; }
(function () { var p = aptP(); if (!p) return; SHOPS.airport = { id: 'airport', name: 'Cum City Airport', b: { x0: p.x - 28, x1: p.x + 28, z0: p.z - 10, z1: p.z + 10, front: 2, airport: 1 } }; })();
// job places: the terminal ends at the kerb; anything inside a solid moves out to where you can stand
(function () { var po = placeOf; placeOf = function (sp) { var r = po.apply(this, arguments);
  if (typeof sp === 'string' && /^poi:terminal/.test(sp)) { var p = aptP(); if (p) return { x: p.x, z: p.z + 25 }; }
  if (r && typeof sp === 'string' && /^poi:/.test(sp) && !r.a) { var y = groundY(r.x, r.z); if (collide(r.x, r.z, 0.8, y + 0.3, 1.6).hit) { for (var rad = 3; rad < 60; rad += 3) for (var k = 0; k < 16; k++) { var a = k / 16 * 6.283, x = r.x + Math.sin(a) * rad, z = r.z + Math.cos(a) * rad, yy = groundY(x, z);
      if (!isWaterK(kAt(x, z)) && !collide(x, z, 1.2, yy + 0.3, 1.6).hit) return { x: x, z: z }; } } }
  return r; }; })();
/* ---------------- the terminal's front and the hall inside ---------------- */
HIPAINT.ap_dep = parkSign('DEPARTURES', '#12040a', '#ffe36a'); HIPAINT.ap_chk = parkSign('CHECK-IN', '#c4121c', '#f1e7d0'); HIPAINT.ap_sec = parkSign('SECURITY', '#12040a', '#7aff6a'); HIPAINT.ap_cafe = parkSign('CRUMB CAFE', '#ffe36a', '#12040a');
var APFL = [['CC69  CUM CITY (ROUND TRIP)', 'BOARDING'], ['SL420  SPERM ISLES', 'ON TIME'], ['BL12  PIGGY BUSSY INTL', 'DELAYED'], ['EJ01  EJACULAND', 'CANCELLED'], ['HS666  THE VOID', 'GATE 9'], ['TB88  SILLY PILLS', 'GO TO GATE'], ['GR55  PIE HEAVEN', 'ON TIME'], ['PO77  BEAT DROP', 'LANDED']];
APFL.forEach(function (f, i) { HIPAINT['ap_f' + i] = parkSign(f[0], '#12040a', '#f1e7d0'); HIPAINT['ap_s' + i] = parkSign(f[1], '#12040a', f[1] === 'CANCELLED' || f[1] === 'DELAYED' ? '#ff2630' : f[1] === 'BOARDING' || f[1] === 'GO TO GATE' ? '#ffe36a' : '#7aff6a'); });
ROOMS.airport = { wall: 'w_glass', floor: 'tilefloor', place: 'airport', w: 36, d: 26, h: 8, props: [] };
(function () { var rmP = roomMesh; roomMesh = function (id) { var RM = rmP(id), R0 = ROOMS[id]; if (!R0 || R0.place !== 'airport') return RM; var m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, d = RM.d, h = R0.h, cx = w / 2, L = [];
  // check-in: a long run of desks along the back with a belt behind, signs above
  RM.desks = []; for (var k = 0; k < 5; k++) { var x = 6 + k * 6; boxC(m, x - 2, 0, d - 5, x + 2, 1.1, d - 4.2, '#d8d4cc'); boxC(gl, x - 2.02, 1.05, d - 5.02, x + 2.02, 1.12, d - 4.18, '#c4121c'); RM.boxes.push([x - 2, d - 5, x + 2, d - 4.2]);
    boxC(m, x - 2.5, 0, d - 3.6, x + 2.5, 0.55, d - 2.6, '#3a3a40'); for (var b = 0; b < 2; b++) boxC(m, x - 1.6 + b * 2, 0.55, d - 3.4, x - 0.6 + b * 2, 1.15, d - 2.8, ['#5a3a20', '#2a4a7a', '#7a1018'][(k + b) % 3]);
    standQ(gl, x, d - 0.05, Math.PI, 3.4, 4.2, 5.1, TL('ap_chk'), 0, 0, SGUV); RM.desks.push({ x: x, z: d - 3.9, ux: x, uz: d - 6.2 }); }
  RM.boxes.push([1, d - 3.6, w - 1, d - 2.6]);
  // the departures board, hung in the middle
  boxC(m, cx - 7.6, 4.4, 10.9, cx + 7.6, 7.8, 11.1, '#12040a'); standQ(gl, cx, 10.85, Math.PI, 7, 7.0, 7.7, TL('ap_dep'), 0, 0, SGUV); APFL.forEach(function (f, i) { var y = 6.5 - i * 0.28; standQ(gl, cx - 2.2, 10.85, Math.PI, 9.6, y, y + 0.26, TL('ap_f' + i), 0, 0, SGUV); standQ(gl, cx + 5, 10.85, Math.PI, 3.6, y, y + 0.26, TL('ap_s' + i), 0, 0, SGUV); });
  [cx - 6, cx + 6].forEach(function (x) { tub(m, [x, 7.8, 11], [x, h, 11], 0.04, 0.04, '#8a8a92', 4); });
  // security: two arches and a belt on the right; the cafe on the left
  [w - 8, w - 4].forEach(function (x) { boxC(m, x - 0.9, 0, 15, x - 0.7, 2.3, 15.6, '#c8c8d0'); boxC(m, x + 0.7, 0, 15, x + 0.9, 2.3, 15.6, '#c8c8d0'); boxC(m, x - 0.9, 2.3, 15, x + 0.9, 2.5, 15.6, '#c8c8d0'); boxC(gl, x - 0.3, 2.32, 15.62, x + 0.3, 2.45, 15.64, '#7aff6a'); });
  boxC(m, w - 6.8, 0, 12, w - 5.2, 0.9, 17, '#3a3a40'); RM.boxes.push([w - 6.8, 12, w - 5.2, 17]); standQ(gl, w - 6, 15.3, Math.PI, 3, 3.1, 3.7, TL('ap_sec'), 0, 0, SGUV);
  boxC(m, 1.5, 0, 12, 4, 1.1, 18, '#5a3a20'); boxC(gl, 1.48, 1.05, 12, 4.02, 1.12, 18, '#ffe36a'); RM.boxes.push([1.5, 12, 4, 18]); standQ(gl, 0.08, 15, Math.PI / 2, 4, 3, 3.8, TL('ap_cafe'), 0, 0, SGUV);
  tub(m, [2.2, 1.1, 13], [2.2, 1.5, 13], 0.12, 0.1, '#c8c8d0', 6, { cap: 1 }); RM.cafe = { x: 5.3, z: 15, kx: 0.9, kz: 15 };
  // rows of seats facing the board
  RM.seatsA = []; for (var r = 0; r < 3; r++) for (var s = 0; s < 8; s++) { var sx = cx - 6.3 + s * 1.8 + (s > 3 ? 1.2 : 0), sz = 4 + r * 2.2; boxC(m, sx - 0.35, 0.42, sz - 0.3, sx + 0.35, 0.5, sz + 0.3, '#2a4a7a'); boxC(m, sx - 0.35, 0.5, sz - 0.34, sx + 0.35, 1.05, sz - 0.28, '#2a4a7a');
    tub(m, [sx, 0, sz], [sx, 0.42, sz], 0.05, 0.05, '#8a8a92', 4); RM.seatsA.push({ x: sx, z: sz, a: 0 }); } RM.boxes.push([cx - 7, 3.6, cx + 7.4, 9.0]);
  // big windows onto the runway at the back are the glass walls; lights in the ceiling
  for (var lx = 6; lx < w; lx += 8) for (var lz = 5; lz < d; lz += 8) { boxC(gl, lx - 1, h - 0.06, lz - 0.2, lx + 1, h - 0.02, lz + 0.2, '#fff4dc'); L.push({ x: lx, y: h - 1, z: lz, r: 13, c: [1, 0.97, 0.92], k: 0.8 }); }
  for (var pl = 0; pl < 4; pl++) { var px = 4 + pl * 9.3; tub(m, [px, 0, 22], [px, 0.7, 22], 0.45, 0.35, '#3a3a3e', 10, { cap: 1 }); ell(m, px, 1.6, 22, 0.8, 1.1, 0.8, '#2a6a2a', 8, 6); RM.boxes.push([px - 0.5, 21.5, px + 0.5, 22.5]); }
  RM.extra3 = m.upload(); RM.glow3 = gl.upload(); RM.lights = L; return RM; }; })();
(function () { var es = enterShop; enterShop = function (id) { var r = es.apply(this, arguments); var I = G.interior; if (id !== 'airport' || !I) return r; var RM = I.RM;
  G.indoorUses = [{ x: RM.w / 2, z: 0.6, r: 2.4, label: 'LEAVE THE AIRPORT', fn: leaveShop }];
  function staff(x, z, a) { var k = makePed({ x: x, z: z, a: a, kind: 'cit', rig: rigFor('cit'), state: 'idle', keep: 1 }); k.inside = 'airport'; k.god = 1; k.y = 0; k.ctl = function (q) { q.vx = q.vz = 0; q.x = x; q.z = z; q.y = 0; q.a = a; }; return k; }
  RM.desks.forEach(function (dk, i) { if (i % 2 === 0) { staff(dk.x, dk.z + 0.4, Math.PI); G.indoorUses.push({ x: dk.ux, z: dk.uz, r: 1.8, label: 'CHECK IN', fn: function () { toast(pick(['"Any liquids? Any sharp objects? Any regrets?" Your flight is the next one. It is always the next one.', '"Window or aisle?" She gives you the wing. Everybody gets the wing.', '"Cum City to Cum City. Gate 9. Do not miss it." There is no gate 9.'])); } }); } });
  staff(RM.w - 6, 13.2, Math.PI); staff(RM.cafe.kx, RM.cafe.kz, Math.PI / 2);
  G.indoorUses.push({ x: RM.cafe.x, z: RM.cafe.z, r: 1.8, label: 'BUY A COFFEE ($4)', fn: function () { payFor(4, function () { P.hp = Math.min(SV.maxHp, P.hp + 15); toast('Airport coffee. Four dollars of hot brown water.'); }); } });
  RM.seatsA.forEach(function (s, i) { G.indoorUses.push({ x: s.x, z: s.z + 0.8, r: 0.7, label: 'SIT DOWN', fn: function () { sitDown({ id: 'ap' + i, x: s.x, z: s.z, a: 0, kind: 'chair', y: 0.5 }); } }); });
  for (var k = 0; k < 18; k++) { var sx = 4 + Math.random() * (RM.w - 8), sz = 3 + Math.random() * 18, q0 = makePed({ x: sx, z: sz, kind: 'cit', rig: rigFor('cit'), state: 'walk', keep: 1 }); q0.inside = 'airport'; q0.god = 1; q0.y = 0;
    (function (q1) { var tx = sx, tz = sz; q1.ctl = function (q, dt) { q.y = 0; if (Math.hypot(tx - q.x, tz - q.z) < 1) { tx = 4 + Math.random() * (RM.w - 8); tz = 2 + Math.random() * 18; if (Math.abs(tx - RM.w / 2) < 8 && tz > 3 && tz < 9.5) tz = 10.5; } var a = Math.atan2(tx - q.x, tz - q.z); q.a += angDiff(q.a, a) * Math.min(1, dt * 5); q.vx = Math.sin(q.a) * 1.3; q.vz = Math.cos(q.a) * 1.3; q.sp = 1.3; }; })(q0); }
  return r; }; })();
/* ---------------- outside: the front, parked planes and helicopters, the airliner ---------------- */
function aptBuild() { if (APT) return APT; var p = aptP(); if (!p) return null; var m = new R3.Mesh(), gl = new R3.Mesh(), y = p.h, z1 = p.z + 10;
  // canopy over the front doors, glass doors, a drop-off kerb, bollards
  boxC(m, p.x - 14, y + 4.4, z1, p.x + 14, y + 4.7, z1 + 7, '#d8d4cc'); [-13, -4.5, 4.5, 13].forEach(function (o) { tub(m, [p.x + o, y, z1 + 6.5], [p.x + o, y + 4.4, z1 + 6.5], 0.15, 0.15, '#8a8a92', 6); addPost(p.x + o, z1 + 6.5, 0.2, y, y + 4.4); });
  for (var dx = -6; dx <= 4; dx += 2.5) { boxC(gl, p.x + dx, y + 0.05, z1 + 0.02, p.x + dx + 2.2, y + 2.8, z1 + 0.06, '#7ab8d8'); boxC(m, p.x + dx - 0.05, y, z1 + 0.02, p.x + dx + 0.05, y + 2.9, z1 + 0.08, '#2a2a2e'); }
  standQ(gl, p.x, z1 + 7.05, 0, 10, y + 4.75, y + 5.7, TL('ap_dep'), 1.2, 0.4, SGUV); boxC(m, p.x - 22, y, z1 + 7.2, p.x + 22, y + 0.15, z1 + 7.6, '#b8b2a8');
  for (var b = -20; b <= 20; b += 4) { tub(m, [p.x + b, y, z1 + 7.4], [p.x + b, y + 0.9, z1 + 7.4], 0.12, 0.12, '#ffe36a', 6, { cap: 1 }); }
  for (var lx = -12; lx <= 12; lx += 8) boxC(gl, p.x + lx - 1.2, y + 4.38, z1 + 3, p.x + lx + 1.2, y + 4.42, z1 + 3.4, '#fff4dc');
  // painted helicopter pads by the hangars and stand lines at the gates
  var pads = [[1110, 2742], [1290, 2742], [1200, 2760]]; pads.forEach(function (q) { var yy = groundY(q[0], q[1]) + 0.05; ring(m, q[0], 0, q[1], 7, 24, function (x, z, a, k) { boxC(m, x - 0.3, yy, z - 0.3, x + 0.3, yy + 0.02, z + 0.3, '#ffe36a'); });
    boxC(m, q[0] - 2, yy, q[1] - 3, q[0] - 1.2, yy + 0.02, q[1] + 3, '#f1e7d0'); boxC(m, q[0] + 1.2, yy, q[1] - 3, q[0] + 2, yy + 0.02, q[1] + 3, '#f1e7d0'); boxC(m, q[0] - 1.2, yy, q[1] - 0.4, q[0] + 1.2, yy + 0.02, q[1] + 0.4, '#f1e7d0'); });
  var stands = [[p.x - 60, 2628, Math.PI], [p.x, 2628, Math.PI], [p.x + 60, 2628, Math.PI], [p.x - 120, 2628, Math.PI], [p.x + 120, 2628, Math.PI]];
  stands.forEach(function (s) { var yy = groundY(s[0], s[1]) + 0.05; boxC(m, s[0] - 0.2, yy, s[1] - 14, s[0] + 0.2, yy + 0.02, s[1] + 18, '#ffe36a'); boxC(m, s[0] - 6, yy, s[1] + 17, s[0] + 6, yy + 0.02, s[1] + 17.4, '#ffe36a'); });
  var spots = [['jet', stands[0]], ['jet', stands[1]], ['plane', stands[2]], ['jet', stands[3]], ['plane', stands[4]], ['heli', [pads[0][0], pads[0][1], 0]], ['armyheli', [pads[1][0], pads[1][1], 0]], ['heli', [pads[2][0], pads[2][1], 0.6]], ['plane', [1240, 2660, Math.PI]], ['plane', [1360, 2660, Math.PI]]];
  APT = { m: m.upload(), gl: gl.upload(), spots: spots.map(function (q) { return { type: q[0], x: q[1][0], z: q[1][1], a: q[1][2], v: null }; }), p: p }; return APT; }
function aptStep(dt) { var A = aptBuild(); if (!A || G.interior) return; var d = Math.hypot(P.x - 1180, P.z - 2640); if ((G.aptT = (G.aptT || 0) - dt) > 0) return; G.aptT = 1;
  A.spots.forEach(function (s) { var v = s.v; if (v && VEH.indexOf(v) < 0) v = s.v = null;
    if (!v && d < 420 && !(G.guest && G.netSync)) { if (!VT[s.type]) return; v = makeVeh(s.type, s.x, s.z, s.a, {}); v.parked = 1; v.apt = 1; s.v = v; }
    else if (v && d > 520 && v !== P.veh && Math.hypot(v.x - s.x, v.z - s.z) < 6) { VEH.splice(VEH.indexOf(v), 1); s.v = null; }
    else if (v && v !== P.veh && Math.hypot(v.x - s.x, v.z - s.z) > 6) s.v = null; }); } // taken away: a new one comes when you are back
(function () { var df = despawnFar; despawnFar = function () { var keep = VEH.filter(function (v) { return v.apt && v !== P.veh && Math.hypot(v.x - P.x, v.z - P.z) < 520; }); df(); keep.forEach(function (v) { if (VEH.indexOf(v) < 0) VEH.push(v); }); }; })();
// the airliner: lands from the east, rolls out, turns round, takes off to the east again; about every three minutes
var AIRL = null;
function airlMesh() { var m = new R3.Mesh(); tub(m, [0, 3, -18], [0, 3, 18], 2.2, 2.2, '#f1e7d0', 12, { cap: 1 }); ell(m, 0, 3, 18, 2.2, 2.2, 3, '#f1e7d0', 12, 6); tub(m, [0, 3, -18], [0, 4.2, -24], 2.2, 0.6, '#f1e7d0', 12, { cap: 1 });
  boxC(m, -16, 2.4, -2, 16, 2.8, 4, '#d8d4cc'); boxC(m, -6, 4.2, -24, 6, 4.4, -21, '#d8d4cc'); boxC(m, -0.2, 4.2, -24, 0.2, 10, -20, '#c4121c'); [-7, 7].forEach(function (x) { tub(m, [x, 1.6, -1], [x, 1.6, 4], 1.0, 1.0, '#8a8a92', 10, { cap: 1 }); });
  for (var w = -15; w < 15; w += 1.2) boxC(m, 2.18, 3.6, w, 2.25, 4.1, w + 0.6, '#12040a'); for (var w2 = -15; w2 < 15; w2 += 1.2) boxC(m, -2.25, 3.6, w2, -2.18, 4.1, w2 + 0.6, '#12040a');
  boxC(m, -2.21, 2.2, -16, 2.21, 2.6, 16, '#c4121c'); [[0, 15], [-4, 0], [4, 0]].forEach(function (q) { tub(m, [q[0], 0, q[1]], [q[0], 1.3, q[1]], 0.2, 0.2, '#3a3a40', 6); tub(m, [q[0] - 0.4, 0.5, q[1]], [q[0] + 0.4, 0.5, q[1]], 0.5, 0.5, '#1a1a1e', 8, { cap: 1 }); });
  return m.upload(); }
function airlAt(t) { var R = POIS.filter(function (p) { return p.k === 'runway'; })[0]; if (!R) return null; var zc = R.z, y0 = R.h + 0.1, c = t % 200;
  // 0-25 approach and land, 25-45 roll out and stop at the west end, 45-70 sit, 70-95 take-off roll and climb, then gone
  if (c < 25) { var f = c / 25, x = 2300 - f * (2300 - 1500), y = y0 + 140 * Math.pow(1 - f, 1.3); return { x: x, y: y, z: zc, a: -Math.PI / 2, p: 0.05, on: 1, loud: 1 }; }
  if (c < 45) { var f2 = (c - 25) / 20, e = 1 - (1 - f2) * (1 - f2); return { x: 1500 - e * 600, y: y0, z: zc, a: -Math.PI / 2, p: 0, on: 1, loud: 1 - f2 * 0.6 }; }
  if (c < 70) return { x: 900, y: y0, z: zc, a: c < 50 ? -Math.PI / 2 + (c - 45) / 5 * Math.PI : Math.PI / 2, p: 0, on: 1, loud: 0.3 };
  if (c < 95) { var f3 = (c - 70) / 25, x3 = 900 + f3 * f3 * 1500, up = Math.max(0, x3 - 1250), y3 = y0 + up * 0.18; return { x: x3, y: y3, z: zc, a: Math.PI / 2, p: up > 0 ? -0.18 : 0, on: 1, loud: 0.5 + f3 * 0.5 }; }
  return null; }
(function () {
  var sf = stepFun; stepFun = function (dt) { sf(dt); try { aptStep(dt); AIRL = airlAt(Date.now() / 1000); } catch (e) { if (!window.__aptE) { window.__aptE = 1; console.warn(e); } } };
  var df = drawFun; drawFun = function () { df(); if (G.interior) return; try { var p = aptP(); if (!p || dist2(p.x, p.z, CAM.x, CAM.z) > 900 * 900) return; var A = aptBuild(); R3.draw(A.m, ATT); R3.draw(A.gl, ATT, { lit: false });
      if (AIRL) { if (!window.__airM) window.__airM = airlMesh(); R3.draw(__airM, ATT, { m: MD(AIRL.x, AIRL.y, AIRL.z, AIRL.a, AIRL.p, 0) }); } } catch (e) { if (!window.__aptD) { window.__aptD = 1; console.warn(e); } } };
  // the roar
  setInterval(function () { try { if (!window.AMB || !AMB || !P) return; var A = AMB.A; if (!AMB.jet) { var s = AMB.src(), f = A.createBiquadFilter(), g = A.createGain(); f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(AMB.out); AMB.jet = { g: g, f: f }; }
    var v = 0; if (AIRL && !G.interior && G.mode === 'play') { var d = Math.hypot(AIRL.x - P.x, AIRL.y - P.y, AIRL.z - P.z); v = AIRL.loud * Math.max(0, 1 - d / 700) * 0.14; AMB.jet.f.frequency.setTargetAtTime(500 + Math.max(0, 1 - d / 400) * 1500, A.currentTime, 0.3); }
    AMB.jet.g.gain.setTargetAtTime(v, A.currentTime, 0.4); } catch (e) {} }, 100);
})();
