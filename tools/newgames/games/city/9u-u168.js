/* ---------- update 168 (his co-op playtest) ---------- */

/* ---- the pad in a car (he said X was accelerating: only RT is the gas). padkit turns pad X into the key that is also the
   touch GAS button, so the pad's own buttons are read here: X is the handbrake, B no longer pulls it, RT/LT lift and
   lower a helicopter. ---- */
(function () { var vi = vehInput; vehInput = function () { var o = vi(), gp = KIT.gamepad; if (!gp || !gp.buttons) return o;
  var rt = gp.buttons[7] ? gp.buttons[7].value : 0, lt = gp.buttons[6] ? gp.buttons[6].value : 0;
  if (gpHeld(2)) { o.thr = rt; o.up = rt > 0.3; o.hand = 1; }
  if (gpHeld(1)) o.hand = KIT.held('hb') || gpHeld(2) ? 1 : 0;
  if (rt > 0.3) o.up = true; if (lt > 0.3) o.down = true;
  return o; }; })();

/* ---- the horn (his ask): L3 on a pad, B on a keyboard, HORN on the touch pad. The ice cream van plays its jingle
   instead; the horn again turns it off. ---- */
KIT.setKeymap({ KeyB: 'horn' });
var HORN = { prev: 0, t: 0, n: 0 };
function playHorn(k) { var t = sfx.tone; k = k || 1; t('sawtooth', 392, 388, 0.42, 0.09 * k); t('sawtooth', 494, 490, 0.42, 0.07 * k); t('square', 196, 196, 0.42, 0.03 * k); }
var JINGLE = [[1047, 0], [1319, 1], [1568, 2], [1319, 3], [1397, 4], [1760, 5], [1568, 6], [1319, 7], [1175, 8], [1397, 9], [1319, 10], [1047, 11], [1175, 12], [988, 13], [1047, 14]]; // an original music box tune
var JSTEP = 0.19, JLEN = 16 * 0.19;
function playJingle(k) { JINGLE.forEach(function (n) { sfx.tone('triangle', n[0], n[0], JSTEP * 0.9, 0.08 * k, n[1] * JSTEP); sfx.tone('square', n[0] * 2, n[0] * 2, JSTEP * 0.35, 0.014 * k, n[1] * JSTEP); }); }
function hornHeld() { return gpHeld(10) || KIT.held('horn') || !!window.HORNTOUCH || !!window.HORNTAP; }
function hornScare(v) { PEDS.forEach(function (p) { if (p.dead || p.inVeh || p.pup || p.hostile || p.cop) return; var dx = p.x - v.x, dz = p.z - v.z; if (dx * dx + dz * dz < 14 * 14 && (dx * Math.sin(v.a) + dz * Math.cos(v.a)) > 0) { p.fear = Math.max(p.fear || 0, 1.5); if (Math.random() < 0.3 && !(p.sayT > 0)) say(p, pick(['Alright! Alright!', 'Watch it!', 'Do not honk at me.', 'Rude.'])); } }); }
function stepHorn(dt) { var v = P && P.state === 'car' ? P.veh : null, h = !!(v && !G.cut && hornHeld()), pr = h && !HORN.prev; HORN.prev = h; window.HORNTAP = 0; /* a quick tap still counts */
  if (pr && v) { if (v.type === 'icecream') { v.jingle = !v.jingle; v.jT = 0; toast(v.jingle ? 'Jingle on. Horn again to stop it.' : 'Jingle off.'); } else { HORN.n++; playHorn(1); HORN.t = 0.44; hornScare(v); } }
  if (h && v && v.type !== 'icecream') { HORN.t -= dt; if (HORN.t <= 0) { HORN.t = 0.42; playHorn(1); } }
  var cars = VEH.slice(); if (G.coop && G.coop.other && G.coop.other.pv) cars.push(G.coop.other.pv);
  cars.forEach(function (c) { if (!c.jingle || c.dead) return; c.jT = (c.jT || 0) - dt; if (c.jT > 0) return; c.jT = JLEN + 0.25; var d = Math.hypot(c.x - CAM.x, c.z - CAM.z), k = G.interior ? 0 : Math.max(0, 1 - d / 90); if (k > 0.02) playJingle(k); }); }
function hornBtn() { var b = document.getElementById('hsHorn'); if (b) return b; b = document.createElement('div'); b.id = 'hsHorn';
  b.style.cssText = 'position:fixed;z-index:40;width:62px;height:62px;border-radius:50%;display:none;align-items:center;justify-content:center;background:rgba(14,7,8,0.82);border:2px solid #c4121c;color:#f1e7d0;font:9px "Press Start 2P",monospace;touch-action:none;user-select:none;-webkit-user-select:none';
  b.textContent = 'HORN'; document.body.appendChild(b);
  b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); window.HORNTOUCH = 1; window.HORNTAP = 1; b.style.background = 'rgba(196,18,28,0.85)'; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (k) { b.addEventListener(k, function () { window.HORNTOUCH = 0; b.style.background = 'rgba(14,7,8,0.82)'; }); }); return b; }
function hornBtnShow() { var want = TOUCHUI() && G.mode === 'play' && P && P.state === 'car' && P.veh && P.veh.t.cls !== 'heli' && P.veh.t.cls !== 'plane' && !document.documentElement.classList.contains('hs-menu') && !G.phone && !G.cut;
  var b = document.getElementById('hsHorn'); if (!want) { if (b) b.style.display = 'none'; window.HORNTOUCH = 0; return; } b = hornBtn(); var A = document.getElementById('acts'); if (!A) return; var r = A.getBoundingClientRect();
  b.textContent = P.veh.type === 'icecream' ? 'TUNE' : 'HORN'; b.style.left = Math.round(r.left + 4) + 'px'; b.style.top = Math.max(8, Math.round(r.top - 70)) + 'px'; b.style.display = 'flex'; }

/* ---- inside a shop the police (cars, helicopters, officers) chased the room's own little floor, which sits in a corner
   of the world map, so they drove round inside the building where nobody could see them and ran you over. While you are
   indoors everything outside goes after the door you went in by, and nothing outside can hurt or arrest you. ---- */
(function () {
  // noRoom: the room is also put aside, because the world's collision indoors is the room's (that is what pulled the police
  // cars in: every step of a car outside was pushed back inside the room's walls)
  function atDoor(fn, noRoom) { return function () { var I = G.interior; if (!I || !P || I.exitX === undefined) return fn.apply(this, arguments); var x = P.x, z = P.z, y = P.y; if (noRoom) G.interior = null; P.x = I.exitX; P.z = I.exitZ; P.y = standY(P.x, P.z, 999); G.swapP = 1;
    try { return fn.apply(this, arguments); } finally { P.x = x; P.z = z; P.y = y; G.swapP = 0; G.interior = I; } }; }
  var stp = stepPeds; stepPeds = function (dt) { if (!G.interior) return stp(dt); var all = PEDS, inn = all.filter(function (p) { return p.inside; }), out = all.filter(function (p) { return !p.inside; });
    PEDS = out; atDoor(stp, 1)(dt); var o2 = PEDS; PEDS = inn; stp(dt); PEDS = o2.concat(PEDS.filter(function (p) { return o2.indexOf(p) < 0; })); };
  stepTraffic = atDoor(stepTraffic, 1); stepWanted = atDoor(stepWanted); if (typeof stepTanks === 'function') stepTanks = atDoor(stepTanks, 1);
  var df = despawnFar; despawnFar = atDoor(df);
  var hp = hurtPlayer; hurtPlayer = function () { if (G.swapP) return; return hp.apply(this, arguments); };
  var bu = busted; busted = function () { if (G.swapP) return; return bu.apply(this, arguments); };
})();

/* ---- WASTED never leaves a black screen: if you are still dead after 7 s, or the screen stays black for 5 s while you
   play, you are put back on your feet at the hospital ---- */
function deathWatch(dt) { if (G.mode !== 'play' || !P) return;
  if (P.state === 'dead') { G.deadW = (G.deadW || 0) + dt; if (G.deadW > 7) { G.deadW = 0; try { respawn(); } catch (e) { console.warn('deathWatch', e); } if (P.state === 'dead') { try { G.interior = null; PEDS = PEDS.filter(function (p) { return !p.inside; }); var d = doorOf(SHOPS.hosp.b); newPlayer(d.x + Math.sin(d.a) * 2, d.z + Math.cos(d.a) * 2, d.a); P.hp = SV.maxHp; G.fade = 1; CAM.snap = 1; } catch (e2) {} } } } else G.deadW = 0;
  if (G.fade > 0.9 && !G.cut) { G.fadeW = (G.fadeW || 0) + dt; if (G.fadeW > 5) { G.fade = 0; G.fadeW = 0; } } else G.fadeW = 0; }

/* ---- player two stays Shithead Laboozie after dying (newPlayer made a fresh Cumhead) ---- */
(function () { var np = newPlayer; newPlayer = function () { var r = np.apply(this, arguments); if (G.guest && P) P.rig = 'laboozie'; return r; }; })();

/* ======================= CO-OP: riding together ======================= */
/* Either player can get in the other's car as the passenger (Y by the car). The passenger holds LT (LB / the AIM button)
   to aim out of the window by hand with the camera and shoots with RT (the HIT button); Y gets out. */
function coopOther() { return G.coop && G.coop.other && G.coop.other.tg ? G.coop.other : null; }
function seatAt(v, local) { var c = Math.cos(v.a), s = Math.sin(v.a); return { x: v.x + local[0] * c + local[2] * s, z: v.z - local[0] * s + local[2] * c, y: v.y + local[1] + 0.02 - Math.sin(v.pitch || 0) * local[2] }; }
function passLocal(v) { var CB = cabinOf(v.type); if (CB) return CB.pas; return [v.t.wid * 0.28, 0.45, v.t.cls === 'bike' ? -0.6 : 0]; }
function drawSeated(rig, v, yaw, aim, held) { if (typeof rig === 'string') rig = RIGS[rig]; if (!rig || !rig.D) return; var L = passLocal(v), S = seatAt(v, L), CB = cabinOf(v.type), Q = pose0(); poseSit(Q);
  var roofIn = (CB ? CB.roof : 1.4) - 0.1, hipAt = L[1] + 0.02, hh = rig.drip ? 0.95 : 0.34, upper = (rig.D.tor + rig.D.neck + hh) * 0.93, sc = CB ? clamp((roofIn - hipAt) / upper, 0.45, 0.86) : 0.9;
  Q.y = -(rig.D.lu + rig.D.ll); Q.kn[0] = Q.kn[1] = 0.25; Q.hip[0] = Q.hip[1] = 1.4; Q.lean = -0.3;
  if (aim) { Q.sh[0] = [1.5, 0.1, 0]; Q.el[0] = 0.1; } else { Q.sh[0][0] = 0.4; Q.sh[1][0] = 0.4; }
  drawPerson(rig, S.x, S.y, S.z, aim ? yaw : v.a, Q, { noShadow: 1, sc: sc, noDrip: 1, still: 1, held: aim && held ? held : null, heldP: -Math.PI / 2 }); }
function canBoard() { var R = coopOther(); if (!R || !R.pv || P.state !== 'foot' || G.interior || G.cut) return null; var v = R.pv; if (v.dead || v.t.cls === 'board' || v.t.cls === 'bike' && !v.t.carry) return null;
  var reach = v.t.len * 0.6 + 2.2; return dist2(P.x, P.z, v.x, v.z) < reach * reach && Math.abs(P.y - v.y) < 2.5 ? v : null; }
function boardPass() { var v = canBoard(); if (!v) return; P.state = 'pass'; P.passV = v; P.aim = 0; P.target = null; P.vx = P.vz = 0; sfx.play('door'); CAM.yaw = v.a; toast('Riding with ' + (isGuest() ? 'Cumhead' : 'Shithead Laboozie') + '. Hold ' + (TOUCHUI() ? 'AIM' : KIT.gamepad ? 'LT' : 'Q') + ' to aim out of the window.'); }
function leavePass() { var v = P.passV || (coopOther() && coopOther().pv); P.state = 'foot'; P.aim = 0; P.passV = null; if (!v) return; var L = passLocal(v), D = seatAt(v, [L[0] + v.t.wid * 0.5 + 0.9, 0, L[2]]); P.x = D.x; P.z = D.z; P.y = standY(P.x, P.z, v.y + 1.5); P.a = v.a; sfx.play('door'); }
function stepPass(dt) { var R = coopOther(), v = R && R.pv; if (!v) { leavePass(); return; } P.passV = v;
  var S = seatAt(v, passLocal(v)); P.x = S.x; P.z = S.z; P.y = v.y; P.a = v.a; P.vx = P.vz = 0; P.sp = 0;
  P.cool -= dt; P.kick = Math.max(0, (P.kick || 0) - dt * 6);
  if (KIT.pressed('y') && !G.cut) { leavePass(); return; }
  if (KIT.pressed('rb') || KIT.pressed('swap')) nextWeapon(1);
  var W0 = WPN[P.wpn] || WPN.fists; P.aim = (KIT.held('lb') || gpHeld(6)) && !G.cut ? 1 : 0; P.target = null; // manual aim: no lock-on from a moving car
  if (P.aim) CAM.free = Math.max(CAM.free || 0, 0.6);
  var fire = W0.auto ? KIT.held('x') || gpHeld(7) : KIT.pressed('x') || gpPressed(7);
  if (fire && P.aim && P.cool <= 0 && !G.cut) {
    if (W0.melee || !W0.ammo) { if (!G.passWarn) { G.passWarn = 1; toast('You need a gun to shoot out of the window.'); } }
    else if (ammoOf(P.wpn) <= 0) { sfx.play('back'); P.cool = 0.4; nextWeapon(1); }
    else { P.cool = W0.rate; SV.ammo[W0.ammo]--; P.kick = 1; var a0 = P.a, y0 = P.y; P.a = CAM.yaw; P.y = v.y - 0.15; try { shoot(P, W0); } finally { P.a = a0; P.y = y0; } } }
}
(function () {
  var nu = nearestUse; nearestUse = function () { var u = nu(); if (u && !u.pass) return u; var v = canBoard(); if (!v) return u; return { x: v.x, z: v.z, r: v.t.len * 0.6 + 2.2, pass: 1, label: 'RIDE WITH ' + (isGuest() ? 'CUMHEAD' : 'SHITHEAD LABOOZIE'), fn: boardPass }; };
  var sc = stepCamera; stepCamera = function (dt) { if (P && P.state === 'pass') { stepPass(dt); var v = P.passV; if (P.state === 'pass' && v) { P.state = 'car'; P.veh = v; try { sc(dt); } finally { P.state = 'pass'; P.veh = null; } return; } } return sc(dt); };
  var dpl = drawPlayer; drawPlayer = function () { if (P && P.state === 'pass') { if (P.passV) drawSeated(P.rig || 'cumhead', P.passV, CAM.yaw, P.aim, (WPN[P.wpn] || {}).mesh ? RIGS[WPN[P.wpn].mesh] : null); return; } return dpl(); };
  var pm = padMode; padMode = function () { var was = PADMODE; if (P && P.state === 'pass' && G.mode === 'play') { if (PADMODE !== 'pass') { PADMODE = 'pass'; try { var b = document.querySelectorAll('#acts .pbtn small'), L = ['', '', 'SHOOT', 'GET OUT', 'AIM', 'SWAP']; for (var i = 0; i < b.length && i < L.length; i++) b[i].textContent = L[i]; } catch (e) {} } } else pm(); hornBtnShow(); };
  // what goes over the wire: sitting as the passenger, the aim, the horn and the jingle
  var pk = packMe; packMe = function () { var o = pk(); if (P.state === 'pass') { o.st = 'pass'; o.ay = r2(CAM.yaw); } if (o.v && P.veh) { o.v.hn = HORN.n; o.v.jg = P.veh.jingle ? 1 : 0; } return o; };
  // draw the other player in the passenger seat of my car
  var dws = drawWorldStuff; drawWorldStuff = function () { var R = G.coop && G.coop.other; if (R && R.tg && R.tg.st === 'pass') { var tg = R.tg; R.tg = null; try { dws(); } finally { R.tg = tg; } var mine = P.state === 'car' ? P.veh : null; if (mine && !G.interior) { mine.passRig = null; var W0 = WPN[tg.w] || WPN.fists; drawSeated(isGuest() ? 'cumhead' : 'laboozie', mine, tg.ay || mine.a, tg.aim, W0.mesh ? RIGS[W0.mesh] : null); } return; } return dws(); };
})();

/* ======================= CO-OP: the same people and the same traffic ======================= */
/* The host runs the town. Ten times a second he sends player two everyone and every vehicle within reach of him; player
   two's own street spawning is off and he draws those (puppets: p.pup, v.pup). Hurting a puppet tells the host (the
   old 'hit' message). Taking a car out of the traffic tells the host to take it out of his town ('take'); leaving a car
   hands it back to the host ('give'), so a parked car is the same car for both. While the host is indoors the guest
   runs his own town again. People keep walking near player two on the host (NEAROTHER), and the host spawns people
   and cars round player two too when they are apart. */
var NETPOP = { q: 0, last: -1, t: 0, pid: 1, vid: 1, gT: 0 };
var RIGKEY = typeof Map !== 'undefined' ? new Map() : null;
function rigKey(r) { if (!r) return 0; if (typeof r === 'string') return r; var k = RIGKEY && RIGKEY.get(r); if (k) return k; for (var n in RIGS) if (RIGS[n] === r) { if (RIGKEY) RIGKEY.set(r, n); return n; } return 0; }
function poseCode(p) { if (p.seat) return 'bench'; if (p.danceT > 0) return 'dance'; if (!p.pose) return 0; var n = p.pose.name; return n && window[n] === p.pose ? n : 0; }
function popFar() { var R = coopOther(); return R && Math.hypot(R.x - P.x, R.z - P.z) > 150; }
window.NEAROTHER = function (x, z, r) { if (NET.role !== 'host') return false; var R = coopOther(); return !!(R && dist2(x, z, R.x, R.z) < r * r); };
(function () {
  // the host fills the streets round player two as well
  var sp = spawnPoint; spawnPoint = function (a, b, c) { if (NET.role === 'host' && popFar() && Math.random() < 0.5) { var R = coopOther(), x = P.x, z = P.z; P.x = R.x; P.z = R.z; try { return sp(a, b, c); } finally { P.x = x; P.z = z; } } return sp(a, b, c); };
  var pt = popTarget; popTarget = function () { var n = pt(); return NET.role === 'host' && popFar() ? n * 2 : n; };
  var tt = trafficTarget; trafficTarget = function () { var n = tt(); return NET.role === 'host' && popFar() ? n * 2 : n; };
  var df = despawnFar; despawnFar = function () { var R = NET.role === 'host' ? coopOther() : null;
    if (G.guest && G.netSync) { var allP = PEDS, allV = VEH, pp = allP.filter(function (p) { return p.pup; }), vv = allV.filter(function (v) { return v.pup; }); PEDS = allP.filter(function (p) { return !p.pup; }); VEH = allV.filter(function (v) { return !v.pup; }); try { df(); } finally { PEDS = PEDS.concat(pp); VEH = VEH.concat(vv); } return; }
    if (!R) return df();
    var kp = PEDS.filter(function (p) { return !(p.dead && (p.deadT || 0) > 25) && (p.inVeh || dist2(p.x, p.z, R.x, R.z) < 150 * 150); }), kv = VEH.filter(function (v) { return dist2(v.x, v.z, R.x, R.z) < 280 * 280; });
    df(); kv.forEach(function (v) { if (VEH.indexOf(v) < 0) VEH.push(v); }); kp.forEach(function (p) { if (PEDS.indexOf(p) < 0 && (!p.inVeh || VEH.indexOf(p.inVeh) >= 0)) PEDS.push(p); }); };
  // the guest does not run the host's people or cars, nor spawn his own while the host is outside
  function guestOff(name) { var f = window[name]; if (typeof f !== 'function') return; window[name] = function () { if (G.guest && G.netSync) return; return f.apply(this, arguments); }; }
  ['spawnPeds', 'spawnTraffic', 'spawnParked', 'stepEvents', 'stepStreetLife', 'stepKnights', 'stepSpooge', 'stepWorkers', 'stepKidnap', 'stepHelipads', 'stepTow'].forEach(guestOff);
  function locals(fn) { return function () { if (!(G.guest && G.netSync)) return fn.apply(this, arguments); var allP = PEDS, allV = VEH, pp = allP.filter(function (p) { return p.pup; }), vv = allV.filter(function (v) { return v.pup; });
    PEDS = allP.filter(function (p) { return !p.pup; }); VEH = allV.filter(function (v) { return !v.pup; }); try { return fn.apply(this, arguments); } finally { PEDS = PEDS.concat(pp.filter(function (p) { return PEDS.indexOf(p) < 0; })); VEH = VEH.concat(vv.filter(function (v) { return VEH.indexOf(v) < 0; })); } }; }
  stepPeds = locals(stepPeds); stepTraffic = locals(stepTraffic);
  // the guest's own police (his own wanted level) are his own
  var sw = stepWanted; stepWanted = function (dt) { if (!G.guest) return sw(dt); G.mkMine = 1; try { return sw(dt); } finally { G.mkMine = 0; } };
  var mp = makePed; makePed = function (o) { var p = mp(o); if (G.guest && (G.mkMine || !G.mkPup)) p.mine = G.mkPup ? 0 : 1; return p; };
  var mv = makeVeh; makeVeh = function (a, b, c, d, o) { var v = mv(a, b, c, d, o); if (G.guest && !G.mkPup) v.mine = 1; return v; };
  // givers: player two sees the host's mission givers and their icons, and can start one for both of them
  window._missionGiversNet = window._missionGiversNet || missionGivers;
  missionGivers = function () { if (!G.guest) return _missionGiversNet(); var ids = G.hostGivers || [], L = [];
    MISSIONS.forEach(function (m) { if (ids.indexOf(m.id) < 0) return; var p = placeOf(m.at); if (!p || L.some(function (u) { return Math.hypot(u.x - p.x, u.z - p.z) < 3; })) return;
      L.push({ x: p.x, z: p.z, r: 1.8, blip: 'mission', who: m.who, icon: (CAST[m.who] ? CAST[m.who].name : '?')[0], label: 'START: ' + m.title.toUpperCase(), m: m, fn: function () { netSendOther({ t: 'mstart', id: m.id }); toast('Starting ' + m.title + ' for you both.'); } }); });
    return L; };
  var sm = startMission; startMission = function (m) { if (G.guest) { netSendOther({ t: 'mstart', id: m.id }); return; } return sm(m); };
})();
function hostGiversNow() { return (_missionGiversNet() || []).map(function (u) { return u.m && u.m.id; }).filter(Boolean); }
/* host: pack everything near player two */
function packPop() { var R = coopOther(); if (!R || G.interior) return { t: 'pop', q: ++NETPOP.q, on: 0 };
  var cx = R.x, cz = R.z, ps = [], vs = [];
  PEDS.forEach(function (p) { if (p.inside || p.inVeh || p.pup) return; var dx = p.x - cx, dz = p.z - cz; if (dx * dx + dz * dz > 115 * 115) return; if (!p.nid) p.nid = NETPOP.pid++ + 5e9;
    var f = (p.dead ? 1 : 0) | (p.state === 'flee' ? 2 : 0) | (p.handsUp ? 4 : 0) | (p.cower ? 8 : 0) | (p.atkT > 0 ? 16 : 0) | (p.state === 'fight' ? 32 : 0) | (p.downT > 0 ? 64 : 0) | (p.smoke ? 128 : 0) | (p.cop ? 256 : 0) | (p.hostile ? 512 : 0);
    ps.push([p.nid, rigKey(p.rig), r2(p.x), r2(p.y), r2(p.z), r2(p.a), r2(p.sp || 0), f, p.wpn || 0, poseCode(p), p.sayT > 0 ? p.said : 0, p.who || 0, p.holding || 0, p.sc || 0, p.kind === 'cit' ? 0 : p.kind]); });
  VEH.forEach(function (v) { if (v === P.veh || v.pup) return; var dx = v.x - cx, dz = v.z - cz; if (dx * dx + dz * dz > 170 * 170) return; if (!v.nid) v.nid = NETPOP.vid++ + 7e9;
    vs.push([v.nid, v.type, v.col, r2(v.x), r2(v.y), r2(v.z), r2(v.a), r2(v.pitch || 0), r2(v.roll || 0), r2(v.sp || 0), v.dead ? 1 : 0, v.driver && v.driver !== P && v.driver.rig ? rigKey(v.driver.rig) : 0, (v.siren && v.ai && v.ai.cop ? 1 : 0) | (v.mission ? 2 : 0) | (v.jingle ? 4 : 0), r2(v.rotor || 0)]); });
  var m = { t: 'pop', q: ++NETPOP.q, on: 1, p: ps, v: vs }; if ((NETPOP.gT -= 1) <= 0) { NETPOP.gT = 20; m.gv = hostGiversNow(); } return m; }
/* guest: take the host's picture of the town */
var PUPP = {}, PUPV = {};
function guestPop(m) { if (m.q <= NETPOP.last) return; NETPOP.last = m.q; NETPOP.t = 0; if (m.gv) { var old = (G.hostGivers || []).join(); G.hostGivers = m.gv; if (old !== m.gv.join()) G.giverT = 0; }
  if (!m.on) { if (G.netSync) { G.netSync = 0; PEDS = PEDS.filter(function (p) { return !p.pup; }); VEH = VEH.filter(function (v) { return !v.pup; }); PUPP = {}; PUPV = {}; } return; }
  if (!G.netSync) { G.netSync = 1; // the host's town replaces the one player two was making up himself
    PEDS = PEDS.filter(function (p) { if (p.nid && !p.pup) return false; return p.pup || p.inside || p.mission || p.keep && p.mine || p === G.ally || p.inVeh && (p.inVeh === P.veh || p.inVeh.keep); });
    VEH = VEH.filter(function (v) { return v.pup || v === P.veh || v.keep || v.owned || v.mission; }); }
  if (G.interior) return;
  var seenP = {}, seenV = {}, inP = new Set(PEDS), inV = new Set(VEH); G.mkPup = 1;
  try {
    (m.p || []).forEach(function (q) { var id = q[0]; seenP[id] = 1; var p = PUPP[id];
      if (!p || !inP.has(p)) { var rg = q[1] ? (RIGS[q[1]] || (typeof rigOf === 'function' && rigOf(q[1])) || q[1]) : rigFor('cit'); p = makePed({ x: q[2], z: q[4], a: q[5], kind: q[14] || 'cit', rig: rg, keep: 1 }); p.pup = 1; p.nid = id; p.y = q[3]; p.passRig = null; PUPP[id] = p; }
      p.tg = q; var f = q[7]; p.dead = f & 1 ? 1 : 0; if (p.dead) { p.hp = 0; } p.state = f & 2 ? 'flee' : f & 32 ? 'fight' : 'walk'; p.handsUp = !!(f & 4); p.cower = !!(f & 8); p.atkT = f & 16 ? 0.2 : 0; p.downT = f & 64 ? 0.5 : 0; p.smoke = !!(f & 128); p.cop = !!(f & 256); p.hostile = !!(f & 512);
      p.wpn = q[8] || null; p.who = q[11] || null; p.holding = q[12] || null; p.sc = q[13] || undefined;
      var pc = q[9]; if (pc !== p.pc) { p.pc = pc; p.life2 = pc === 'bench' ? 1 : 0; p.danceT = pc === 'dance' ? 1e9 : 0; p.pose = pc === 'bench' ? function (Q, pp) { var S = sitPose('bench', pp.smoke, G.t + pp.id * 3, 0, 0); for (var k in S) Q[k] = S[k]; } : pc && typeof window[pc] === 'function' ? window[pc] : null; }
      if (q[10] && q[10] !== p.said) { p.said = q[10]; p.sayT = 3; if (typeof voiceLine === 'function' && p.who && dist2(p.x, p.z, P.x, P.z) < 25 * 25) try { voiceLine(p.who, p.said); } catch (e) {} } });
    (m.v || []).forEach(function (q) { var id = q[0]; seenV[id] = 1; var v = PUPV[id];
      if (!v || !inV.has(v)) { if (!VT[q[1]]) return; v = makeVeh(q[1], q[3], q[5], q[6], { col: q[2] }); v.pup = 1; v.nid = id; v.y = q[4]; v.passRig = null; v.rest = 1; PUPV[id] = v; }
      v.tg = q; v.dead = q[10]; v.siren = !!(q[12] & 1); v.mis = !!(q[12] & 2); v.jingle = !!(q[12] & 4);
      var rk = q[11]; if (rk !== v.drk) { v.drk = rk; v.driver = rk ? { rig: RIGS[rk] || rk, kind: 'cit', hp: 40, x: v.x, y: v.y, z: v.z, a: 0, vx: 0, vz: 0, vy: 0, ph: 0, sp: 0, state: 'walk', fear: 0, sayT: 0, cool: 0, id: Math.random(), inVeh: v, mine: 1, money: Math.floor(rnd(2, 40)) } : null; } });
  } finally { G.mkPup = 0; }
  // gone from the host's picture: gone here
  PEDS = PEDS.filter(function (p) { if (!p.pup) return true; if (seenP[p.nid]) return true; delete PUPP[p.nid]; return false; });
  VEH = VEH.filter(function (v) { if (!v.pup) return true; if (seenV[v.nid]) return true; delete PUPV[v.nid]; return false; });
}
function guestPupStep(dt) { var k = Math.min(1, dt * 10);
  for (var i = 0; i < PEDS.length; i++) { var p = PEDS[i], q = p.tg; if (!p.pup || !q) continue; var tx = q[2], ty = q[3], tz = q[4];
    if (Math.abs(tx - p.x) + Math.abs(tz - p.z) > 12) { p.x = tx; p.z = tz; p.y = ty; } else { p.x += (tx - p.x) * k; p.y += (ty - p.y) * k; p.z += (tz - p.z) * k; }
    p.a += angDiff(p.a, q[5]) * k; p.sp = q[6]; p.ph = (p.ph || 0) + dt * p.sp * 2.6; p.sayT = Math.max(0, (p.sayT || 0) - dt); }
  for (var j = 0; j < VEH.length; j++) { var v = VEH[j], w = v.tg; if (!v.pup || !w) continue;
    if (Math.abs(w[3] - v.x) + Math.abs(w[5] - v.z) > 20) { v.x = w[3]; v.y = w[4]; v.z = w[5]; } else { v.x += (w[3] - v.x) * k; v.y += (w[4] - v.y) * k; v.z += (w[5] - v.z) * k; }
    v.a += angDiff(v.a, w[6]) * k; v.pitch = w[7]; v.roll = w[8]; v.sp = w[9]; v.vx = Math.sin(v.a) * v.sp; v.vz = Math.cos(v.a) * v.sp; v.wheelA = (v.wheelA || 0) + v.sp * dt / 0.35; v.rotor = w[13]; if (v.driver) { v.driver.x = v.x; v.driver.z = v.z; v.driver.y = v.y; } } }
/* the guest takes a car out of the traffic, or leaves his own car behind */
function guestCars() {
  if (P.state === 'enter' && P.ent && P.ent.v && P.ent.v.pup) { var v = P.ent.v;
    if (v.mis) { P.state = 'foot'; P.ent = null; toast('That one belongs to the job. Let Cumhead deal with it.'); return; }
    netSendOther({ t: 'take', id: v.nid }); delete PUPV[v.nid]; v.pup = 0; v.tg = null; v.mine = 1; if (v.driver) v.driver.mine = 1; }
  if (P.state === 'car' && P.veh) G.myVeh = P.veh;
  else if (G.myVeh && P.state !== 'enter') { var c = G.myVeh; G.myVeh = null; var i = VEH.indexOf(c);
    if (i >= 0 && G.netSync && !G.interior && !c.keep && !c.owned && c.t.cls !== 'board') { netSendOther({ t: 'give', k: c.type, c: c.col, x: r2(c.x), y: r2(c.y), z: r2(c.z), a: r2(c.a), d: c.dead ? 1 : 0, hp: Math.round(c.hp || 100) }); VEH.splice(i, 1); } } }
(function () {
  var ns = netStep; netStep = function (dt) { ns(dt); if (!NET.role || !G.coop || !P) return; var R = G.coop.other; if (R && R.pv) R.pv.passRig = null;
    if (NET.role === 'host') { if ((NETPOP.t -= dt) <= 0) { NETPOP.t = 0.1; if (R && R.tg) netSendOther(packPop(), true); }
      // the other player's horn and jingle
      if (R && R.tg && R.tg.v) { if (R.hn !== undefined && R.tg.v.hn !== R.hn && R.pv) { var d = Math.hypot(R.pv.x - CAM.x, R.pv.z - CAM.z); if (d < 120) playHorn(Math.max(0.15, 1 - d / 120)); } R.hn = R.tg.v.hn; if (R.pv) R.pv.jingle = !!R.tg.v.jg; } }
    else { NETPOP.t += dt; if (G.netSync && NETPOP.t > 2.5) { G.netSync = 0; PEDS = PEDS.filter(function (p) { return !p.pup; }); VEH = VEH.filter(function (v) { return !v.pup; }); PUPP = {}; PUPV = {}; }
      if (G.netSync) { guestPupStep(dt); guestCars(); }
      if (R && R.tg && R.tg.v) { if (R.hn !== undefined && R.tg.v.hn !== R.hn && R.pv) { var d2 = Math.hypot(R.pv.x - CAM.x, R.pv.z - CAM.z); if (d2 < 120) playHorn(Math.max(0.15, 1 - d2 / 120)); } R.hn = R.tg.v.hn; if (R.pv) R.pv.jingle = !!R.tg.v.jg; } } };
  var hd = hostData; hostData = function (L, m) {
    if (m.t === 'take') { for (var i = VEH.length - 1; i >= 0; i--) { var v = VEH[i]; if (v.nid !== m.id || v === P.veh) continue; if (v.driver && v.driver !== P) { var j = PEDS.indexOf(v.driver); if (j >= 0) PEDS.splice(j, 1); } VEH.splice(i, 1); } return; }
    if (m.t === 'give') { if (!VT[m.k]) return; var nv = makeVeh(m.k, m.x, m.z, m.a, { col: m.c }); nv.y = m.y; nv.hp = m.hp; if (m.d) { nv.dead = 1; nv.hp = 0; } nv.rest = 0; return; }
    if (m.t === 'mstart') { var ms = MISSIONS.filter(function (x) { return x.id === m.id; })[0]; if (!ms) return; if (G.mission) { netSendOther({ t: 'toast', s: 'Cumhead is already on a job.' }); return; } if (typeof missionAvailable === 'function' && !missionAvailable(ms)) return; toast('Shithead Laboozie started ' + ms.title + '.'); startMission(ms); return; }
    return hd(L, m); };
  var cd = clientData; clientData = function (L, m) {
    if (m.t === 'pop') { if (G.mode === 'play' && P) guestPop(m); return; }
    if (m.t === 'ids' && G.netSync) return; // the host's mission people come in the picture anyway
    if (m.t === 'toast') { toast(m.s); return; }
    return cd(L, m); };
  var sf = stepFun; stepFun = function (dt) { sf(dt); try { stepHorn(dt); deathWatch(dt); } catch (e) { if (!window.__u168err) { window.__u168err = 1; console.warn(e); } } };
  // the host's mission blips and marker follow him to player two (the guest's radar reads G.uses)
  var gs = guestStart; guestStart = function (m) { G.netSync = 0; PUPP = {}; PUPV = {}; NETPOP.last = -1; G.hostGivers = []; var r = gs(m); G.giverT = 0; return r; };
})();
