/* ---------- update 157 (his ask): Cumhead's smartphone. D-pad up on a pad, T on a keyboard, or the phone button by the
   pause button opens it. Three apps, each asks before it spends (KIT.confirm), each with a little scene:
   CUM CABS: he puts the phone to his ear and calls, a taxi drives up to him (the camera watches it pull in), he gets in
   and picks where to go; the screen fades and he steps out there.
   CUM CITY INSURANCE: call it in and a fresh copy of your last car is driven to you (free once you have insured it).
   COMBAT STIMS: a courier on a scooter rides up, hands them over and rides off; you are on stims at once.
   The phone works in a car too (the delivery comes to the car); not inside, not in a mission cutscene. ---------- */
var PHONE = null;
function phoneOpen() { if (!P || G.mode !== 'play' || G.cut || G.interior || P.state === 'dead' || G.spray) { if (G.interior) toast('No signal in here.'); return; } G.phone = 1; sfx.play('blip');
  var busy = PHONE && PHONE.st !== 'done';
  KIT.menu({ cls: 'phone', title: 'CUMPHONE', sub: (G.time | 0) + ':' + ('0' + Math.floor((G.time % 1) * 60)).slice(-2) + '  ·  $' + Math.floor(SV.money).toLocaleString('en-GB') + (busy ? '  ·  ' + PHONE.what + ' on the way' : ''), grid: true, items: [
    { label: 'CUM CABS', cls: 'app cab', fn: function () { phoneAsk('taxi'); } },
    { label: 'INSURANCE', cls: 'app ins', fn: function () { phoneAsk('insure'); } },
    { label: 'COMBAT STIMS', cls: 'app stim', fn: function () { phoneAsk('stims'); } },
    { label: 'MAP', cls: 'app map', fn: function () { phoneClose(); mapMenu(null); } },
    { label: 'JOBS', cls: 'app jobs', fn: function () { jobsMenu(); } },
    { label: 'CAMERA', cls: 'app cam', fn: function () { phoneClose(); G.flashT = 0.2; sfx.play('blip'); toast(pick(['Click. Nobody will ever look at that again.', 'Click. Blurry, but it has character.', 'Click. A masterpiece of Cum City.'])); } },
    { label: 'HANG UP', back: true, cls: 'app off', fn: phoneClose }] }); }
function jobsMenu() { // update 158: side jobs (taxi, paramedic, vigilante, pizza) for the vehicle you are in
  var v = P.veh; KIT.menu({ cls: 'phone', title: 'JOBS', sub: G.job ? 'On shift: ' + JOBS[G.job.k].n : v ? 'In a ' + v.t.n : 'Get in the right vehicle', items: Object.keys(JOBS).map(function (k) { var ok = v && JOBS[k].need.indexOf(v.type) >= 0; return { label: JOBS[k].n, sub: ok ? 'Start a shift' : (k === 'taxi' ? 'Needs a taxi' : k === 'para' ? 'Needs an ambulance' : k === 'vig' ? 'Needs a police car' : 'Needs a scooter or motorbike'), fn: function () { phoneClose(); if (G.job) jobStop(); jobStart(k); } }; })
    .concat(G.job ? [{ label: 'END THE SHIFT', fn: function () { phoneClose(); jobStop(); } }] : []).concat([{ label: 'BACK', back: true, fn: phoneOpen }]) }); }
function phoneClose() { G.phone = 0; KIT.closeMenu(); }
function phoneAsk(what) { if (PHONE && PHONE.st !== 'done') { toast('Something is already on its way.'); return; }
  if (what === 'taxi') KIT.confirm({ title: 'Cum Cabs', sub: 'A cab comes to you. You pay the fare when you pick where to go.', price: 20, have: Math.floor(SV.money), unit: '$', yesLabel: 'Call a cab', yes: function () { phoneCall('taxi'); }, no: phoneOpen });
  else if (what === 'insure') { var last = SV.lastCar && VT[SV.lastCar] ? SV.lastCar : null, ins = SV.insured && last && SV.insured[last];
    if (!last) { KIT.menu({ cls: 'phone', title: 'INSURANCE', sub: 'Cum City Insurance has no car on file for you. Drive something first.', items: [{ label: 'BACK', back: true, fn: phoneOpen }] }); return; }
    KIT.menu({ cls: 'phone', title: 'INSURANCE', sub: 'Your car on file: ' + VT[last].n + (ins ? ' (insured)' : ''), items: [
      { label: ins ? 'SEND MY CAR (FREE)' : 'SEND MY CAR ($250)', fn: function () { if (ins) phoneCall('insure'); else KIT.confirm({ title: 'Replacement ' + VT[last].n, sub: 'A fresh one is driven to you.', price: 250, have: Math.floor(SV.money), unit: '$', yes: function () { money(-250); phoneCall('insure'); }, no: phoneOpen }); } },
      ins ? null : { label: 'INSURE IT FOR GOOD ($900)', fn: function () { KIT.confirm({ title: 'Insure the ' + VT[last].n, sub: 'From now on a fresh one is sent free whenever you call.', price: 900, have: Math.floor(SV.money), unit: '$', yes: function () { money(-900); SV.insured = SV.insured || {}; SV.insured[last] = 1; persist(); toast('Insured. Call any time.'); phoneOpen(); }, no: phoneOpen }); } },
      { label: 'BACK', back: true, fn: phoneOpen }] }); }
  else if (what === 'stims') KIT.confirm({ title: 'Combat Stims, delivered', sub: 'A courier brings them to you. Hit harder, take less, for 90 seconds.', price: 60, have: Math.floor(SV.money), unit: '$', yes: function () { money(-60); phoneCall('stims'); }, no: phoneOpen }); }
var CALLS = { taxi: [['cumhead', 'Yeah, hi. I need a cab. Where am I? Look for the droplet in the nice shirt.'], ['pedM1', 'Cum Cabs. Two minutes, Mister Mayor. Do not go anywhere.']],
  insure: [['cumhead', 'Hello, insurance? Yeah, my car is a bit... gone. Can you send another one?'], ['pedF1', 'Cum City Insurance. Of course, Mister Mayor. A fresh one is on its way. Please try not to blow this one up.']],
  stims: [['cumhead', 'Yeah, can I get some combat stims delivered? The usual.'], ['pedM1', 'Stims for the mayor, coming right up. Five minutes or the next one is free.']] };
var ARRIVE = { taxi: 'Cab for Mister Mayor! Hop in, where to?', insure: 'Here are your keys, Mister Mayor. Sign here. Do not crash it.', stims: 'Combat stims for the mayor. Enjoy the ride.' };
function phoneCall(what) { phoneClose(); if (what === 'taxi' && SV.money < 20) { toast('$20 call out.'); return; } if (what === 'taxi') money(-20);
  PHONE = { what: { taxi: 'Your cab', insure: 'Your car', stims: 'Your stims' }[what], k: what, st: 'call', t: 0, line: 0 };
  sfx.play('blip'); }
function phoneVehType(k) { return k === 'taxi' ? 'taxi' : k === 'stims' ? (VT.scooter ? 'scooter' : 'moto') : (SV.lastCar && VT[SV.lastCar] ? SV.lastCar : 'hatch'); }
function stepPhone(dt) { var S = PHONE; if (!S || S.st === 'done' || !P) return; S.t += dt;
  if (S.st === 'call') { // the call itself: the phone at his ear, both sides spoken
    var L = CALLS[S.k]; if (S.t > 0.3 && S.line === 0) { S.line = 1; subtitle(CAST.cumhead.name, L[0][1], 3.5); voiceLine('cumhead', L[0][1]); }
    if (S.t > 3.9 && S.line === 1) { S.line = 2; subtitle(S.k === 'insure' ? 'Cum City Insurance' : S.k === 'taxi' ? 'Cum Cabs' : 'Stims Courier', L[1][1], 3.5); voiceLine(L[1][0], L[1][1]); }
    if (S.t > 7.6) { var r = roadNear('xz:' + P.x + ':' + P.z, 90); if (!r || !r.E) { toast('Nobody can find you here.'); S.st = 'done'; return; } var v = makeVeh(phoneVehType(S.k), r.x, r.z, r.a || 0, { col: S.k === 'taxi' ? 3 : 0 }); v.keep = 1; v.phone = 1; v.y = groundY(v.x, v.z);
      var dr = makePed({ x: v.x, z: v.z, kind: 'cit', rig: rigFor('cit'), keep: 1 }); dr.inVeh = v; v.driver = dr; v.god = 1; v.ai = { manual: 1 }; S.v = v; S.st = 'drive'; S.t = 0; G.sub = null; } return; }
  var v = S.v; if (!v || v.dead) { S.st = 'done'; toast('Your delivery got wrecked on the way.'); return; }
  var tx = P.state === 'car' && P.veh ? P.veh.x : P.x, tz = P.state === 'car' && P.veh ? P.veh.z : P.z, d = Math.hypot(v.x - tx, v.z - tz);
  if (S.st === 'drive') { if (S.t > 30 || d > 400) { var rr = nearestRoad(tx, tz, 60); if (rr) { var b = edgeAt(rr.E, Math.max(1, rr.s - 25), false, laneOf(rr.E)); v.x = b.x; v.z = b.z; v.y = groundY(b.x, b.z); v.a = Math.atan2(b.dx, b.dz); S.t = 0; } }
    var near = nearestRoad(tx, tz, 40), goal = near ? { x: near.x, z: near.z } : { x: tx, z: tz }; if (d < 45 && !S.cam) S.cam = 3;
    var dg = Math.hypot(v.x - goal.x, v.z - goal.z); if (dg > 6 && d > 9) { if (dg < 25 && Math.abs(v.sp) > 8) stepVehicle(v, { thr: 0, brk: 1, steer: clamp(angDiff(v.a, Math.atan2(goal.x - v.x, goal.z - v.z)) * 2, -1, 1) }, dt); else raceAI(v, goal, dt); } else { stepVehicle(v, { thr: 0, brk: 1, steer: 0, park: 1 }, dt); if (Math.abs(v.sp) < 1) { S.st = 'arrived'; S.t = 0; say(v.driver, ARRIVE[S.k]); voiceLine('pedM0', ARRIVE[S.k]); arrive(S); } }
  }
  else if (S.st === 'arrived') { stepVehicle(v, { park: 1, thr: 0, brk: 1, steer: 0 }, dt); if (S.hand && S.t > 1.2) { S.hand = 0; takeStim(); S.st = 'leave'; S.t = 0; } if (S.k === 'taxi' && S.t > 90) { S.st = 'leave'; S.t = 0; G.phoneUse = null; } }
  else if (S.st === 'leave') { if (v.driver && v.driver.inVeh === v) { var rl = nearestRoad(v.x, v.z, 20); if (rl && (!v.ai || v.ai.manual)) { v.ai = { E: rl.E, s: rl.s, back: Math.abs(angDiff(v.a, Math.atan2(rl.dx, rl.dz))) > 1.57, lane: laneOf(rl.E), want: 15, wait: 0, sp: 0 }; v.keep = 0; } } S.st = 'done'; }
  if (S.cam > 0) S.cam -= dt; }
function arrive(S) { var v = S.v;
  if (S.k === 'stims') { S.hand = 1; }
  else if (S.k === 'insure') { var dr = v.driver; dr.inVeh = null; v.driver = null; var D = doorPt(v, 1.2); dr.x = D.x; dr.z = D.z; dr.y = v.y; dr.keep = 0; dr.state = 'walk'; v.owned = 1; v.mine = 1; v.god = 0; v.keep = 1; v.ai = null; S.st = 'done'; toast('Your ' + v.t.n + ' is here. It is yours.'); }
  else if (S.k === 'taxi') { G.phoneUse = { x: v.x, z: v.z, r: 4, label: 'GET IN THE CAB', fn: taxiMenu, v: v }; } }
function taxiMenu() { var S = PHONE, v = S && S.v; if (!v) return; var dests = [];
  if (SV.way) dests.push(['YOUR WAYPOINT', SV.way[0], SV.way[1]]);
  if (G.mission && G.mission.mark && G.mission.mark.x !== undefined) dests.push(['THE JOB', G.mission.mark.x, G.mission.mark.z]);
  [['THE CLUBHOUSE', 'shop:club'], ["POTBELLY'S ARCADE", 'shop:arcade'], ['CUM CITY HOSPITAL', 'shop:hosp'], ['CUM MOTORS', 'shop:motors'], ['EJACULAND', 'dist:ejac'], ['THE AIRPORT', 'dist:airport'], ['SEAMEN BEACH', 'dist:beach']].forEach(function (q) { var p = placeOf(q[1]); if (p) dests.push([q[0], p.x, p.z]); });
  KIT.menu({ cls: 'phone', title: 'CUM CABS', sub: '"Where to, Mister Mayor?"', items: dests.map(function (d) { var fare = Math.max(25, Math.round(Math.hypot(d[1] - P.x, d[2] - P.z) / 18)); return { label: d[0] + '  ·  $' + fare, fn: function () { KIT.confirm({ title: d[0], sub: 'The fare.', price: fare, have: Math.floor(SV.money), unit: '$', yes: function () { money(-fare); KIT.closeMenu(); taxiRide(d[1], d[2]); }, no: taxiMenu }); } }; }).concat([{ label: 'NEVER MIND', back: true, fn: function () { KIT.closeMenu(); } }]) }); }
function taxiRide(x, z) { var S = PHONE, v = S.v; G.phoneUse = null; G.fade = 2.2; sfx.play('door');
  setTimeout(function () { var r = nearestRoad(x, z, 300) || { x: x, z: z, dx: 0, dz: 1, E: null }; var lane = r.E ? laneOf(r.E) : 0, px = r.x + r.dz * lane, pz = r.z - r.dx * lane;
    v.x = px; v.z = pz; v.y = groundY(px, pz); v.a = Math.atan2(r.dx, r.dz); v.vx = v.vz = v.sp = 0; var D = doorPt(v, 1.2); P.x = D.x + (D.x - v.x) * 0.3; P.z = D.z + (D.z - v.z) * 0.3; P.y = standY(P.x, P.z, v.y + 2); P.a = v.a; CAM.yaw = v.a; CAM.snap = 1;
    if (typeof solidsAround === 'function') solidsAround(P.x, P.z, 70); G.time = (G.time + Math.min(1.5, Math.hypot(x - P.x, z - P.z) / 3000)) % 24;
    S.st = 'leave'; S.t = 0; say(v.driver, pick(['Pleasure, Mister Mayor.', 'Tip is optional. It is not optional.', 'Mind how you go.'])); }, 900); }
var _nearestUseP = nearestUse;
nearestUse = function () { var u = _nearestUseP(); if (G.phoneUse && !G.interior) { var q = G.phoneUse, v = q.v; if (v) { q.x = v.x; q.z = v.z; } var d = dist2(P.x, P.z, q.x, q.z); if (d < q.r * q.r && (!u || d < dist2(P.x, P.z, u.x, u.z))) return q; } return u; };
var _carNearP = carNear;
carNear = function () { var v = _carNearP(); return v && v.phone && PHONE && PHONE.st !== 'done' && PHONE.k !== 'insure' ? null : v; };
/* the scene: while calling, his hand is at his ear with the phone; when the delivery is close the camera watches it pull in */
var PHONEM = null;
function drawPhoneProp() { var S = PHONE; if (!S || S.st !== 'call' || P.state !== 'foot') return; if (!PHONEM) { var m = new R3.Mesh(); boxC(m, -0.035, -0.07, -0.01, 0.035, 0.07, 0.01, '#12040a'); boxC(m, -0.03, -0.06, 0.011, 0.03, 0.06, 0.013, '#4adfff'); PHONEM = m.upload(); }
  var a = P.a, rx = Math.cos(a), rz = -Math.sin(a), sc = 1.22, hx = P.x - rx * 0.24 * sc + Math.sin(a) * 0.05, hz = P.z - rz * 0.24 * sc + Math.cos(a) * 0.05; R3.draw(PHONEM, ATT, { m: MD(hx, P.y + 1.62 * sc, hz, a + 1.4, 0.2, 0) }); }
var _poseOfPlayerP = poseOfPlayer;
poseOfPlayer = function () { var Q = _poseOfPlayerP(); if (PHONE && PHONE.st === 'call' && P.state === 'foot') { Q.sh[0] = [1.25, 0.5, 1.2]; Q.el[0] = 2.5; Q.hy = (Q.hy || 0) + 0.15; } return Q; };
var _dwsPhone = drawWorldStuff; drawWorldStuff = function () { _dwsPhone(); drawPhoneProp(); };
function phoneCam(dt) { var S = PHONE; if (!S || !(S.cam > 0) || !S.v || G.cut || G.mode !== 'play') return; var v = S.v, tx = P.state === 'car' && P.veh ? P.veh : P, mx = (v.x + tx.x) / 2, mz = (v.z + tx.z) / 2, dx = v.x - tx.x, dz = v.z - tx.z, d = Math.hypot(dx, dz) || 1;
  var ex = mx - dz / d * (d * 0.7 + 6), ez = mz + dx / d * (d * 0.7 + 6), ey = Math.max(groundY(ex, ez), tx.y) + 3.2; CAM.x += (ex - CAM.x) * Math.min(1, dt * 3); CAM.y += (ey - CAM.y) * Math.min(1, dt * 3); CAM.z += (ez - CAM.z) * Math.min(1, dt * 3); CAM.at = [mx, tx.y + 1.0, mz]; }
/* the phone button by the pause button, and the keys */
(function () { function add() { var top = document.getElementById('top'); if (!top || document.getElementById('phoneBtn')) return; var b = document.createElement('button'); b.id = 'phoneBtn'; b.type = 'button'; b.setAttribute('aria-label', 'Phone');
  b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="7" y="2.5" width="10" height="19" rx="2" fill="none" stroke="#f1e7d0" stroke-width="1.8"/><rect x="9" y="5" width="6" height="11" fill="#c4121c"/><circle cx="12" cy="18.7" r="1" fill="#f1e7d0"/></svg>';
  b.addEventListener('click', function () { if (G.phone) phoneClose(); else phoneOpen(); }); top.insertBefore(b, top.firstChild); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add(); setTimeout(add, 500); })();
var _takeSeatP = takeSeat; takeSeat = function (v, j) { if (v && v.t && v.t.cls === 'car' && v.type !== 'taxi' && !v.t.cop) SV.lastCar = v.type; return _takeSeatP(v, j); };
function phoneLines() { var L = []; Object.keys(CALLS).forEach(function (k) { CALLS[k].forEach(function (q) { L.push(q); }); L.push(['pedM0', ARRIVE[k]]); }); return L; }
