/* update 166 (his playtest), the gameplay: working girls in the red light district at night (pull up, she gets in, find
   somewhere quiet: your health goes over the top and your money goes down; kill her and you get it back) and the same at
   T's Hussy House and Bonjo's BJ Boutique (no money back there); the Semen Demons attack less and now and then carry
   someone off; a joint IS a combat stim now; the Fapling Hook is earned from Shithead Laboozie and takes claws. */

/* ---------------- working girls ---------------- */
CAST.worker = { rig: 'worker0', name: 'Working Girl' };
CASTLINES.worker = ['Looking for a good time, honey?', 'Find us somewhere quiet, sugar.', 'Not here, there are people about!', 'Come back soon, honey.', 'No money, no honey.', 'Hey, Mister Mayor. Want some company?', 'Mmm. That will be fifty, sugar.', 'Rude.', 'Watch it!', 'I have not got all night, honey.'];
(function () { var bc = buildCityRigs; buildCityRigs = function () { bc.apply(this, arguments); if (RIGS.worker0) return;
  RIGS.worker0 = person({ skin: '#f0c8a0', shirt: '#ff2a8a', legs: '#f0c8a0', skirt: '#12040a', boot: '#c4121c', hand: '#f0c8a0', hair: '#e8d080', long: 1, face: 'f_c1w0', fem: 1, short: 1, plain: 1 });
  RIGS.worker1 = person({ skin: '#a87048', shirt: '#7a1aa0', legs: '#a87048', skirt: '#c4121c', boot: '#12040a', hand: '#a87048', hair: '#12040a', long: 1, face: 'f_c3w1', fem: 1, short: 1, plain: 1 });
  RIGS.worker2 = person({ skin: '#e0b090', shirt: '#12040a', legs: '#e0b090', skirt: '#ff2a8a', boot: '#12040a', hand: '#e0b090', hair: '#c4121c', long: 1, face: 'f_c2w2', fem: 1, short: 1, plain: 1 }); }; })();
function poseWork(Q, p) { var t = G.t + p.id * 4; Q.hip[0] = 0.08; Q.hip[1] = -0.05; Q.kn[0] = 0.15; Q.roll = 0.05 * Math.sin(t * 0.7); Q.sh[0] = [-0.15, 0.35, 0.4]; Q.el[0] = 1.5; Q.sh[1] = [0.1, 0.12, 0]; Q.el[1] = 0.3 + 0.15 * Math.sin(t * 0.9); Q.hy = 0.3 * Math.sin(t * 0.4); }
var WORK = null; /* the one in your car: { p, v, st: 'in'|'busy', t, paid } */
function workerNight() { return G.time >= 20 || G.time < 5; }
function stepWorkers(dt) { if (G.interior || !P) return; var mine = PEDS.filter(function (p) { return p.worker && !p.dead; });
  // spawn: up to four along the kerbs of the red light district at night
  if (workerNight() && dAt(P.x, P.z).style === 'redlight' && mine.length < 4 && Math.random() < dt * 0.5) { var r = spawnPoint(35, 110); if (r && r.E && !r.E.track) { var side = Math.random() < 0.5, pt = edgeAt(r.E, clamp(r.s, 6, r.E.len - 6), side, r.E.w / 2 + 1.6);
      if (kAt(pt.x, pt.z) === K_PAVE && dAt(pt.x, pt.z).style === 'redlight' && !(inView(pt.x, pt.z, 1) && dist2(pt.x, pt.z, CAM.x, CAM.z) < 40 * 40)) { var n = Math.floor(Math.random() * 3), p = makePed({ x: pt.x, z: pt.z, who: 'worker', kind: 'cit', rig: RIGS['worker' + n], state: 'idle' });
        p.worker = 1; p.a = Math.atan2(-(pt.x - r.x), -(pt.z - r.z)) + Math.PI; p.a = Math.atan2(r.x - pt.x, r.z - pt.z); p.y = standY(pt.x, pt.z, groundY(pt.x, pt.z) + 1); p.money = 20 + Math.floor(Math.random() * 30); p.pose = poseWork;
        p.ctl = function (q) { if (q.leaving) return; q.vx = q.vz = 0; q.sp = 0; }; } } }
  if (WORK) { stepWork(dt); return; }
  // pick up: stop next to one in a car
  if (P.state === 'car' && P.veh && P.veh.t.cls === 'car' && Math.abs(P.veh.sp) < 1.5 && !G.mission) { var v = P.veh, best = null, bd = 7 * 7;
    mine.forEach(function (p) { if (p.leaving || p.cool > G.t) return; var d = dist2(p.x, p.z, v.x, v.z); if (d < bd) { bd = d; best = p; } });
    if (best) { best.waitT = (best.waitT || 0) + dt; if (best.waitT > 0.3 && !best.greeted) { best.greeted = 1; say(best, best.id % 2 ? 'Looking for a good time, honey?' : 'Hey, Mister Mayor. Want some company?'); }
      if (best.waitT > 1.4) { best.waitT = 0; best.greeted = 0; if (SV.money < 10) { say(best, 'No money, no honey.'); best.cool = G.t + 15; return; } var i = PEDS.indexOf(best); if (i >= 0) PEDS.splice(i, 1); v.passRigW = v.passRig; v.passRig = best.rig; WORK = { p: best, v: v, st: 'in', t: 0, paid: 0, hint: 0 }; sfx.play('door'); toast('She gets in. Find somewhere quiet.'); } }
    else mine.forEach(function (p) { p.waitT = 0; p.greeted = 0; }); } }
function workSecluded(v) { for (var i = 0; i < PEDS.length; i++) { var q = PEDS[i]; if (q.dead || q.inVeh === v) continue; if (dist2(q.x, q.z, v.x, v.z) < (q.cop ? 70 * 70 : 24 * 24)) return false; }
  for (var j = 0; j < VEH.length; j++) { var o = VEH[j]; if (o === v || o.dead || !o.driver) continue; if (dist2(o.x, o.z, v.x, v.z) < 20 * 20) return false; } return true; }
function workOut(msg) { var W = WORK, v = W.v, p = W.p; WORK = null; v.passRig = v.passRigW; var D = doorPt(v, 1.4); p.x = D.x + (D.x - v.x) * 0.4; p.z = D.z + (D.z - v.z) * 0.4; p.y = standY(p.x, p.z, v.y + 1); p.money = (p.money || 0) + W.paid; p.leaving = 1; p.cool = G.t + 120; p.pose = null; p.ctl = null; p.state = 'walk'; p.keep = 0; PEDS.push(p); if (msg) say(p, msg); sfx.play('door'); }
function stepWork(dt) { var W = WORK, v = W.v; W.t += dt;
  if (P.state !== 'car' || P.veh !== v || v.dead) { workOut(v.dead ? null : 'Rude.'); return; }
  if (W.st === 'in') { if (Math.abs(v.sp) < 0.5) { W.still = (W.still || 0) + dt; if (W.still > 1.5) { if (workSecluded(v)) { W.st = 'busy'; W.t = 0; W.tick = 0; say(W.p, 'Mmm. That will be fifty, sugar.'); W.p.x = v.x; W.p.z = v.z; } else if (!W.hint || G.t - W.hint > 8) { W.hint = G.t; say(W.p, 'Not here, there are people about!'); W.p.x = v.x; W.p.z = v.z; } W.still = 0; } } else W.still = 0;
    if (W.t > 240) workOut('I have not got all night, honey.'); return; }
  if (W.st === 'busy') { if (Math.abs(v.sp) > 2) { workOut('Watch it!'); return; } W.tick += dt; v.rock = Math.sin(G.t * 9) * 0.035;
    if (W.tick > 1.2) { W.tick = 0; if (SV.money < 5) { v.rock = 0; workOut('No money, no honey.'); return; } money(-5); W.paid += 5; P.hp = Math.min(SV.maxHp + 50, P.hp + 6); }
    if (W.t > 12) { v.rock = 0; bigText('FEELING LOADED', 'Health over the top', '#ffe36a', 2.2); workOut('Come back soon, honey.'); } } }
(function () { var dv = drawVeh; drawVeh = function (v) { if (v.rock) { var r0 = v.roll || 0, p0 = v.pitch || 0; v.roll = r0 + v.rock; v.pitch = p0 + v.rock * 0.4; dv(v); v.roll = r0; v.pitch = p0; return; } dv(v); }; })();
/* T's Hussy House and Bonjo's BJ Boutique: the same, in a room upstairs, no money back */
(function () { var gd = goods; goods = function (id) { var L = gd(id);
  if (id === 't' || id === 'bonjo') L.push({ n: id === 't' ? 'A Private Room with T (health over the top)' : 'The Boutique Special (health over the top)', p: 80, fn: function () { G.fade = 1.6; P.hp = SV.maxHp + 50; G.time = (G.time + 1) % 24; setTimeout(function () { bigText('FEELING LOADED', 'Health over the top', '#ffe36a', 2.2); }, 900); } });
  if (id === 'saba' && SV.weapons && SV.weapons.hook) L.push({ n: 'Fapling Hook claws (10)', p: 120, fn: function () { SV.ammo.hook = (SV.ammo.hook || 0) + 10; toast('Ten claws for the Fapling Hook.'); } });
  return L; }; })();

/* ---------------- the Legion of Semen Demons: fewer attacks, and now and then they carry someone off ---------------- */
var KID = null, KIDT = 80 + Math.random() * 80;
function stepKidnap(dt) { if (KID) { stepKid(dt); return; } if (nightK() < 0.8 || G.interior || G.cut) return; KIDT -= dt; if (KIDT > 0) return; KIDT = 120 + Math.random() * 180;
  var cand = PEDS.filter(function (p) { if (p.dead || p.keep || p.cop || p.inVeh || p.worker || p.who || p.inside || p.life2) return false; var d = Math.hypot(p.x - P.x, p.z - P.z); return d > 14 && d < 70; }); if (!cand.length) return;
  var p = pick(cand), F = demonFlocks().sort(function (a, b) { return dist2(a.x, a.z, p.x, p.z) - dist2(b.x, b.z, p.x, p.z); })[0]; if (!F) return; var s = demonAt(F, 1);
  var ddx = s.x - p.x, ddz = s.z - p.z, dd = Math.hypot(ddx, ddz) || 1; if (dd > 70) { s.x = p.x + ddx / dd * 70; s.z = p.z + ddz / dd * 70; s.y = Math.min(s.y, p.y + 50); } KID = { x: s.x, y: s.y, z: s.z, a: s.a, vx: 0, vy: 0, vz: 0, p: p, st: 'dive', t: 0, hp: 45 }; sfx.play('screech'); }
function stepKid(dt) { var K = KID, p = K.p; K.t += dt;
  if (K.st === 'dive') { if (p.dead || PEDS.indexOf(p) < 0) { K.st = 'away'; K.t = 0; return; } var tx = p.x, ty = p.y + 2.0, tz = p.z, dx = tx - K.x, dy = ty - K.y, dz = tz - K.z, L = Math.hypot(dx, dy, dz) || 1;
    var sp = L > 40 ? 34 : 22; K.vx += (dx / L * sp - K.vx) * Math.min(1, dt * 2.5); K.vy += (dy / L * sp - K.vy) * Math.min(1, dt * 2.5); K.vz += (dz / L * sp - K.vz) * Math.min(1, dt * 2.5); K.x += K.vx * dt; K.y += K.vy * dt; K.z += K.vz * dt; K.a = Math.atan2(K.vx, K.vz);
    if (L < 3.2) { K.x = tx; K.y = ty; K.z = tz; K.st = 'carry'; K.t = 0; p.grabbed = 1; p.ctl = function (q) { q.vx = q.vz = 0; }; p.pose = function (Q) { Q.sh[0] = [3.0, 0.15, 0]; Q.sh[1] = [3.0, 0.15, 0]; Q.el[0] = Q.el[1] = 0.2; Q.hip[0] = 0.5 + 0.4 * Math.sin(G.t * 9); Q.hip[1] = 0.5 - 0.4 * Math.sin(G.t * 9); Q.kn[0] = Q.kn[1] = 0.6; }; say(p, 'HELP! HELP ME!'); sfx.play('hurt'); }
    if (K.t > 16) { K.st = 'away'; K.t = 0; } return; }
  if (K.st === 'carry') { K.vy += (9 - K.vy) * Math.min(1, dt * 1.2); K.vx *= 0.98; K.vz *= 0.98; K.x += (K.vx + Math.sin(K.a) * 6) * dt; K.z += (K.vz + Math.cos(K.a) * 6) * dt; K.y += K.vy * dt;
    p.x = K.x; p.z = K.z; p.y = K.y - 2.2; p.a = K.a; if (K.t > 1.5 && K.t < 1.6) say(p, 'HELP!');
    if (K.y > groundY(K.x, K.z) + 90 || K.t > 16) { var i = PEDS.indexOf(p); if (i >= 0) PEDS.splice(i, 1); KID = null; } return; }
  if (K.st === 'drop') { p.y = Math.max(groundY(p.x, p.z), p.y - 9 * dt); K.vy += (12 - K.vy) * dt; K.y += K.vy * dt; if (K.t > 4) KID = null; return; }
  if (K.st === 'away') { K.vy += (12 - K.vy) * dt; K.y += K.vy * dt; if (K.t > 5) KID = null; } }
function hurtKid(dmg) { var K = KID; if (!K || K.st === 'drop' || K.st === 'away') return; K.hp -= dmg; K.hit = 0.15; if (K.hp > 0) return; var p = K.p; sfx.play('screech');
  if (K.st === 'carry') { p.grabbed = 0; p.pose = null; p.ctl = null; p.vy = 0; var h = p.y - groundY(p.x, p.z); if (h > 6) hurtPed(p, 200, null); else { p.state = 'walk'; say(p, 'Thank you, Mister Mayor!'); } }
  money(80); bigText('SEMEN DEMON DOWN', '$80', '#ffe36a', 2); K.st = 'drop'; K.t = 0; }
(function () { var rh = rayHit; rayHit = function (o, d, maxT, who) { var best = rh.apply(this, arguments), K = KID; if (!K || K.st === 'drop' || K.st === 'away' || who !== P) return best;
    var ox = o[0] - K.x, oy = o[1] - K.y, oz = o[2] - K.z, b = ox * d[0] + oy * d[1] + oz * d[2], c = ox * ox + oy * oy + oz * oz - 1.2 * 1.2, disc = b * b - c; if (disc < 0) return best; var t = -b - Math.sqrt(disc); if (t < 0 || t > (best ? best.t : maxT)) return best;
    if (window.__shootW) hurtKid(window.__shootW.dmg || 10); return best; }; })();
/* attacks on you are rarer (the timer was 2-4 minutes, it is 3.5-7 now, and a third of those let you be) */
(function () { var sd = stepDemons; stepDemons = function (dt) { var before = DIVET; sd(dt); if (DIVET > before + 50 && DIVET < 300) DIVET += 100 + Math.random() * 60; }; })();

/* ---------------- a joint is a combat stim ---------------- */
takeStim = function () { G.stim = 90; G.high = Math.min(1, (G.high || 0) + 0.45); P.hp = Math.min(Math.max(SV.maxHp, P.hp), P.hp + 25); sfx.play('blip'); bigText('COMBAT JOINT', 'Ninety seconds of pure load', '#ff2630', 2.5); CAM.shake = 0.3; };
stimMenu = function () { KIT.confirm({ title: 'A Joint from the Stash', sub: 'Hit 60% harder, take half the damage and move quicker for 90 seconds. Then you crash.', price: 40, have: Math.floor(SV.money), unit: '$', yes: function () { if (SV.money < 40) { KIT.closeMenu(); return; } money(-40); KIT.closeMenu(); SV.joints = (SV.joints || 0) + 1; startSmoke(); }, no: function () { KIT.closeMenu(); } }); };
(function () { var lj = lightJoint; lightJoint = function () { var had = SV.joints || 0; lj.apply(this, arguments); if ((SV.joints || 0) < had) takeStim(); }; })();
/* smoking one standing up: Y with nothing else about, the hand to the mouth, the drag, the cloud, then the high */
G.smk = null;
function startSmoke() { if (G.smk || (SV.joints || 0) <= 0) return; SV.joints--; G.smk = { t: 0, done: 0 }; sfx.play('blip'); toast(pick(['You spark one up.', 'A long drag. The streetlights go soft at the edges.', 'You light up. Somewhere a dog laughs.'])); }
function stepSmoke(dt) { var S = G.smk; if (!S) return; if (P.state !== 'foot' || G.seat) { G.smk = null; return; } S.t += dt; if (!S.done && S.t > 3.6) { S.done = 1; takeStim(); } if (S.t > 8.4) G.smk = null; }
(function () { var nu = nearestUse; nearestUse = function () { var u = nu(); if (u || G.smk || G.seat || P.state !== 'foot' || G.interior || (SV.joints || 0) <= 0) return u; var sp = Math.hypot(P.vx || 0, P.vz || 0); if (sp > 0.4) { G.stillT = 0; return u; } G.stillT = (G.stillT || 0) + 1 / 60; if (G.stillT < 1.2) return u;
    return { x: P.x, z: P.z, r: 99, label: 'SPARK A JOINT (' + SV.joints + ')', fn: startSmoke }; };
  var pp = poseOfPlayer; poseOfPlayer = function () { var Q = pp(); if (G.smk && P.state === 'foot') smokeArm165(Q, G.smk.t, 0, 0); return Q; };
  var dpl = drawPlayer; drawPlayer = function () { dpl(); if (G.smk && P.state === 'foot') drawJoint(P.x, P.y, P.z, P.a, G.smk.t); };
  var sf = stepFun; stepFun = function (dt) { sf(dt); try { stepWorkers(dt); stepKidnap(dt); stepSmoke(dt); } catch (e) { if (!window.__u166err) { window.__u166err = 1; console.warn(e); } } };
  var df = drawFun; drawFun = function () { df(); if (KID && !G.interior) { var K = KID, fl = K.st === 'dive' ? -0.5 : Math.sin(G.t * 12) * 0.7, tt = K.hit > 0 ? [3, 3, 3] : [1, 1, 1]; K.hit = Math.max(0, (K.hit || 0) - 1 / 60); drawOneDemon(demonMesh(), K.x, K.y, K.z, K.a, fl, 1.4, tt, 0); } }; })();

/* ---------------- the Fapling Hook is earned: Shithead Laboozie's job at the docks, then claws from Saba ---------------- */
MI({ id: 'lab_hook', who: 'lab', title: 'The Fapling Hook', at: 'shop:club', chap: 'one', req: ['lab2'], pay: 500, steps: [
  TALK(['lab', 'Mister Mayor. TB\'s boys have nicked a prototype from the Blood Factory and taken it down the docks. A grappling hook. They call it the Fapling Hook.'], ['lab', 'Get it back and it is yours. Sheriff\'s orders.']),
  { t: 'go', to: 'dist:docks', msg: 'Get to the docks.', r: 45 },
  { t: 'kill', spawn: [{ kind: 'goon', n: 5, at: 'dist:docks', spread: 16, wpn: 'pistol' }], msg: 'Take the Fapling Hook off TB\'s boys.' },
  TALK(['lab', 'Point it at a wall, pull the trigger, up you go. Point it at a car and you ride the roof. The claws are not free though. Saba sells them.'])],
  after: function () { SV.weapons = SV.weapons || {}; SV.weapons.hook = 1; SV.ammo = SV.ammo || {}; SV.ammo.hook = (SV.ammo.hook || 0) + 10; bigText('THE FAPLING HOOK', 'Ten claws. Saba sells more.', '#ffe36a', 3); persist(); } });

/* update 166b (his correction): the Legion of Semen Demons are brown, like in Load Legacy (tools/foes/gen.py demon):
   a brown fiend with brown bat wings and dark bones, cream horns, red eyes, a black mouth with white teeth, arms with cream
   claws, legs, and a tail with a red barb */
DEMONM = null;
demonMesh = function () { if (DEMONM) return DEMONM; var b = new R3.Mesh(), sk = '#b86a3a', sk2 = '#7a3a1a', wg = '#8a4a2a', bone = '#3a1a0a', cr = '#f1e7d0';
  ell(b, 0, 0, 0, 0.3, 0.42, 0.26, sk, 12, 8); ell(b, 0, 0.12, 0.08, 0.22, 0.2, 0.16, sk2, 10, 6); // chest and belly
  ell(b, 0, 0.55, 0.12, 0.24, 0.23, 0.24, sk, 12, 8); // the head
  [-1, 1].forEach(function (s) { tub(b, [s * 0.12, 0.72, 0.1], [s * 0.3, 1.02, 0.02], 0.06, 0.0, cr, 7); // horns
    ell(b, s * 0.09, 0.6, 0.33, 0.045, 0.035, 0.03, '#ff2630', 6, 3); // eyes
    tub(b, [s * 0.24, 0.25, 0.05], [s * 0.42, -0.05, 0.25], 0.06, 0.05, sk, 6); tub(b, [s * 0.42, -0.05, 0.25], [s * 0.46, -0.2, 0.4], 0.05, 0.04, sk, 6); // arms
    for (var c = -1; c <= 1; c++) tub(b, [s * 0.46 + c * 0.03, -0.2, 0.4], [s * 0.47 + c * 0.04, -0.28, 0.47], 0.015, 0.0, cr, 4); // claws
    tub(b, [s * 0.12, -0.35, 0], [s * 0.15, -0.65, 0.1], 0.07, 0.05, sk, 6); tub(b, [s * 0.15, -0.65, 0.1], [s * 0.14, -0.85, -0.05], 0.05, 0.035, sk, 6); });
  b.quad([-0.12, 0.47, 0.34], [0.12, 0.47, 0.34], [0.1, 0.41, 0.3], [-0.1, 0.41, 0.3], UV1, TL('white'), litc('#12040a', [0, 0, 1], 1), [0, 0, 1]);
  [-0.06, 0.06].forEach(function (x) { tub(b, [x, 0.47, 0.35], [x, 0.43, 0.345], 0.014, 0.0, cr, 4); });
  tub(b, [0, -0.3, -0.18], [0, -0.55, -0.6], 0.07, 0.04, sk, 6); tub(b, [0, -0.55, -0.6], [0, -0.5, -1.0], 0.04, 0.02, sk, 6);
  b.tri([0, -0.5, -1.0], [0.13, -0.56, -1.2], [-0.13, -0.56, -1.2], [0, 0, 1, 0, 0.5, 1], TL('white'), litc('#c4121c', [0, 1, 0], 1), [0, 1, 0]); b.tri([0, -0.5, -1.0], [-0.13, -0.56, -1.2], [0.13, -0.56, -1.2], [0, 0, 1, 0, 0.5, 1], TL('white'), litc('#c4121c', [0, -1, 0], 1), [0, -1, 0]);
  function wing(sd) { var w = new R3.Mesh(), P0 = [0, 0, 0], tips = [[1.8, 0.45, -0.1], [1.6, -0.05, -0.45], [1.1, -0.3, -0.6], [0.5, -0.3, -0.45]].map(function (t) { return [t[0] * sd, t[1], t[2]]; });
    for (var i = 0; i < tips.length - 1; i++) { var A = tips[i], B = tips[i + 1]; if (sd > 0) { w.tri(P0, A, B, [0, 0, 1, 0, 1, 1], TL('white'), litc(wg, [0, 1, 0], 1), [0, 1, 0]); w.tri(P0, B, A, [0, 0, 1, 0, 1, 1], TL('white'), litc('#5a2a14', [0, -1, 0], 1), [0, -1, 0]); }
      else { w.tri(P0, B, A, [0, 0, 1, 0, 1, 1], TL('white'), litc(wg, [0, 1, 0], 1), [0, 1, 0]); w.tri(P0, A, B, [0, 0, 1, 0, 1, 1], TL('white'), litc('#5a2a14', [0, -1, 0], 1), [0, -1, 0]); } }
    tips.forEach(function (t, i) { tub(w, P0, t, i === 0 ? 0.045 : 0.025, 0.012, bone, 5); }); return w.upload(); }
  DEMONM = { body: b.upload(), wr: wing(1), wl: wing(-1) }; return DEMONM; };
