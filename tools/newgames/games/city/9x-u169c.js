/* ---------- update 169: content from his playtest ---------- */

/* ---- T'S HUSSY HOUSE AND BONJO'S BJ BOUTIQUE: T and Bonjo own the places, they are not the girls (his correction). Both
   have a back room door on the right wall. Paying for the back rooms plays a little scene: Cumhead walks round the
   counter and through the door, love hearts float out round the door frame, he comes back out, walks to the owner and
   thanks them, they answer, and he leaves the room loaded (health over the top). ---- */
var BACKROOM = { t: { pay: 80, name: "T's back rooms", me: ["Cheers, T. Same time next week?", 'Lovely as always, T. Put it on my tab... joking, joking.', 'Thank you, T. I needed that more than the city did.'], her: ['Come again, darling.', 'Any time, Mister Mayor. Mind your blood pressure.', 'The girls say you were a gentleman. Mostly.'] },
  bonjo: { pay: 80, name: "The Boutique's back rooms", me: ['Thanks, Bonjo. You run a classy place.', 'Bonjo, I owe you one. Well, eighty.', 'Same time next week, Bonjo?'], her: ['Always a pleasure, sweetie. Mind the step.', 'You know where the door is, darling.', 'Come back soon. Bring cash. Bring flowers.'] } };
var HEARTM = null;
function heartMesh() { if (HEARTM) return HEARTM; var m = new R3.Mesh(); ell(m, -0.09, 0.06, 0, 0.11, 0.11, 0.05, '#ff3a6a', 8, 5); ell(m, 0.09, 0.06, 0, 0.11, 0.11, 0.05, '#ff3a6a', 8, 5); tub(m, [0, 0.04, 0], [0, -0.2, 0], 0.17, 0.0, '#ff3a6a', 8, { cap0: 1 }); HEARTM = m.upload(); return HEARTM; }
var BRDOOR = {};
function backDoorMesh(id, RM) { if (BRDOOR[id]) return BRDOOR[id]; var m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, z = RM.d - 1.6, x = w - 0.04;
  boxC(m, x - 0.06, 0, z - 0.68, x + 0.02, 2.35, z - 0.56, '#2a0a10'); boxC(m, x - 0.06, 0, z + 0.56, x + 0.02, 2.35, z + 0.68, '#2a0a10'); boxC(m, x - 0.06, 2.23, z - 0.68, x + 0.02, 2.35, z + 0.68, '#2a0a10');
  boxC(m, x - 0.03, 0, z - 0.56, x, 2.23, z + 0.56, '#5a0a18'); [0.5, 1.4].forEach(function (y) { boxC(m, x - 0.05, y, z - 0.42, x - 0.03, y + 0.6, z + 0.42, '#7a1428'); }); ell(m, x - 0.07, 1.05, z - 0.42, 0.035, 0.035, 0.035, '#c8a040', 5, 4);
  boxC(gl, x - 0.05, 2.45, z - 0.5, x - 0.02, 2.75, z + 0.5, '#ff2a6a'); for (var q = 0; q < 3; q++) ell(gl, x - 0.06, 2.6, z - 0.3 + q * 0.3, 0.05, 0.06, 0.05, '#ffd0e0', 5, 3); // the PRIVATE light over it
  BRDOOR[id] = { m: m.upload(), gl: gl.upload(), x: w - 0.9, z: z }; return BRDOOR[id]; }
function brStart(id) { var I = G.interior, RM = I.RM, D = backDoorMesh(id, RM), k = G.keeper, B = BACKROOM[id];
  var path = [[P.x, P.z], [RM.w - 1.3, Math.min(RM.d - 3.2, 4.8)], [D.x, D.z]];
  G.brs = { id: id, t: 0, ph: 'in', path: path, seg: 0, hearts: [], D: D, k: k, line: 0, B: B }; G.talk = 1; KIT.closeMenu(); sfx.play('door'); }
function brWalk(S, dt) { var p = S.path; if (S.seg >= p.length - 1) return true; var a = p[S.seg], b = p[S.seg + 1], dx = b[0] - P.x, dz = b[1] - P.z, d = Math.hypot(dx, dz), sp = 2.0;
  if (d < sp * dt + 0.02) { P.x = b[0]; P.z = b[1]; S.seg++; return S.seg >= p.length - 1; } P.x += dx / d * sp * dt; P.z += dz / d * sp * dt; P.a += angDiff(P.a, Math.atan2(dx, dz)) * Math.min(1, dt * 10); P.sp = sp; P.ph += dt * sp * 2.4; return false; }
function brStep(dt) { var S = G.brs; if (!S || !G.interior) { G.brs = null; G.talk = 0; return; } S.t += dt; P.vx = P.vz = 0; P.y = 0;
  if (S.ph === 'in') { if (brWalk(S, dt)) { S.ph = 'room'; S.t = 0; S.hide = 1; P.sp = 0; sfx.play('door'); } }
  else if (S.ph === 'room') { if (Math.random() < dt * 9) S.hearts.push({ x: S.D.x + 0.75 + rnd(-0.1, 0.1), y: rnd(0.6, 2.2), z: S.D.z + rnd(-0.7, 0.7), vx: -rnd(0.3, 0.9), vy: rnd(0.4, 0.9), vz: rnd(-0.3, 0.3), s: rnd(0.6, 1.2), t: 0 });
    if (Math.random() < dt * 1.6) [0, 1].forEach(function (q) { sfx.tone('sine', 660 + q * 330 + rnd(0, 80), 880 + q * 330, 0.35, 0.03, q * 0.12); });
    if (S.t > 4.6) { S.ph = 'out'; S.t = 0; S.hide = 0; sfx.play('door'); var k = S.k, kx = k ? k.x + 0.5 : G.interior.RM.w / 2, kz = (k ? k.z : G.interior.RM.d - 1.6) - 2.3; S.path = [[S.D.x, S.D.z], [G.interior.RM.w - 1.3, kz], [kx, kz]]; S.seg = 0; P.x = S.D.x; P.z = S.D.z; } }
  else if (S.ph === 'out') { if (brWalk(S, dt)) { S.ph = 'thanks'; S.t = 0; P.sp = 0; if (S.k) P.a = Math.atan2(S.k.x - P.x, S.k.z - P.z); var me = pick(S.B.me); subtitle('Cumhead', me); if (typeof voiceLine === 'function') try { voiceLine('cumhead', me); } catch (e) {} } }
  else if (S.ph === 'thanks') { if (S.t > 2.6 && !S.said) { S.said = 1; var her = pick(S.B.her); if (S.k) say(S.k, her); subtitle(S.id === 't' ? 'T' : 'Bonjo', her); if (typeof voiceLine === 'function') try { voiceLine(S.id === 't' ? 't' : 'bonjo', her); } catch (e) {} }
    if (S.t > 5.4) { G.brs = null; G.talk = 0; P.hp = SV.maxHp + 50; bigText('FEELING LOADED', 'Health over the top', '#ffe36a', 2.4); } }
  S.hearts = S.hearts.filter(function (h) { h.t += dt; h.x += h.vx * dt; h.y += h.vy * dt; h.z += h.vz * dt; return h.t < 2.4; }); }
(function () {
  var gd = goods; goods = function (id) { var L = gd(id); if (!BACKROOM[id]) return L; L = L.filter(function (g) { return !/Private Room|Boutique Special/.test(g.n); });
    L.push({ n: 'The back rooms (health over the top)', p: BACKROOM[id].pay, fn: function () { brStart(id); } }); return L; };
  var sf = stepFoot; stepFoot = function (dt) { if (G.brs) { brStep(dt); return; } return sf(dt); };
  var dp = drawPlayer; drawPlayer = function () { if (G.brs && G.brs.hide) return; return dp(); };
  var di = drawInterior; drawInterior = function (look) { di(look); var I = G.interior; if (!I || !BACKROOM[I.id] || I.special) return; var D = backDoorMesh(I.id, I.RM); R3.draw(D.m, ATT); R3.draw(D.gl, ATT, { lit: false });
    if (G.brs) G.brs.hearts.forEach(function (h) { var sc = h.s * (h.t < 0.3 ? h.t / 0.3 : h.t > 1.9 ? Math.max(0, (2.4 - h.t) / 0.5) : 1); R3.draw(heartMesh(), ATT, { lit: false, m: MD(h.x, h.y, h.z, -Math.PI / 2 + Math.sin(h.t * 3) * 0.3, 0, Math.sin(h.t * 4) * 0.2, sc) }); }); };
  var sc = stepCamera; stepCamera = function (dt) { var r = sc(dt); var S = G.brs; if (S && G.interior) { var RM = G.interior.RM; CAM.x = RM.w * 0.28; CAM.y = 2.5; CAM.z = 1.2; CAM.at = [S.ph === 'thanks' ? P.x : RM.w - 1.4, 1.2, S.ph === 'thanks' ? P.z : RM.d - 2.4]; } return r; };
})();

/* ---- CUMHEAD TALKS BACK in every mission (his ask): after the person giving the job finishes each piece of talk,
   Cumhead answers. The words fit the moment: taking the job on (by what the job is: a chase, a race, a fight, a
   delivery...), carrying on, and thanking them at the end; some lines are his own for each of the regulars. ---- */
var CUMSAYS = {
  start: { chase: ["Which way did they go? Never mind. I'll find them.", 'Leave it with me, {n}. Nobody nicks from you on my watch.', "They won't get far. I've got a city full of cream behind me.", 'Right. I run them off the road, I bring it back. Simple.'],
    race: ['A race? {n}, I was born in the fast lane.', "I'll be over the line before they find second gear.", "Hold my drip. I'm going in.", 'First place or nothing. Mostly first place.'],
    fight: ["Say no more. They'll be sorry they came to Cum City.", 'Mayor\'s orders: they\'re done.', 'Point me at them, {n}.', "I'll keep it quick. I've got a city to run."],
    go: ['On my way, {n}.', 'Consider it done.', "I know a shortcut. Probably.", 'Easy. I could do this in my sleep. I have, actually.'],
    deliver: ['Delivered hot, delivered fast. That\'s the mayor\'s promise.', "Leave it with me. I won't spill a drop.", 'Fragile? Got it. I drive like a saint.'],
    def: ["Leave it with me, {n}.", "I'm on it.", 'For you, {n}? Anything. Within reason.', 'Right. Let\'s get this done.'] },
  mid: ['Got it.', 'Easy.', 'On it.', 'Right behind you.', 'Understood.', 'Nearly there.', 'No problem.', "Don't worry, I've got this."],
  end: ['Any time, {n}. That\'s what the mayor\'s for.', 'Pleasure doing business, {n}.', "Call me if they come back. They won't.", 'Cheers, {n}. Put the kettle on next time.', 'All in a day\'s drip.', "Just keep my name off the news, yeah?"],
  who: { tb: ["TB, I'm only doing this so you stop ringing me.", 'Keep your pills to yourself this time, TB.', "If this is another one of your schemes, TB, I'm out."], greebo: ['For you, Greebo, and for the pies.', "Sir Johnathan's watching, isn't he? Fine. I'm going.", 'I never ask what\'s in them, Greebo. I never will.'],
    lab: ["Sheriff's business, eh? I'll keep it legal. Ish.", 'You owe me a pint after this, Laboozie.', "Right you are, Sheriff."], spermaid: ['For you, sweetie? Of course.', "I'll be careful. You worry too much, Spermaid."],
    saba: ['Hitless, Saba. I know, I know.', "No hits taken. That's the plan."], amy: ['Mild, hot or dynamite? With you it\'s always dynamite, Amy.', 'Keep the chilli warm, Amy.'], potbelly: ['High score or nothing, Potbelly.', 'Insert coin, eh Potbelly?'],
    pulsar: ["Just vibes, Pulsar. I'm on it.", 'Keep the beat going, I\'ll be back.'], beeb: ['First one\'s warm, eh Beeb? Line one up.', 'For you, Uncle Beeb.'], joff: ['Pineapple still does not belong on pizza, Joff. But fine.', 'For you, Joff. Not for the pineapple.'] } };
function cumReply(m, ti, nTalks, nextStep) { var name = CAST[m.who] ? CAST[m.who].name.split(' ')[0] : 'mate', h = 0, s = m.id + ':' + ti; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  function from(L) { return L[h % L.length].replace('{n}', name); }
  if (ti === nTalks - 1 && ti > 0) return from(CUMSAYS.end);
  if (ti === 0) { if (CUMSAYS.who[m.who] && h % 3 === 0) return from(CUMSAYS.who[m.who]); var t = nextStep ? nextStep.t : '', kind = t === 'chase' || t === 'destroy' ? 'chase' : t === 'race' ? 'race' : /kill|goons|survive|boss|fight|wave|horde/.test(t) ? 'fight' : t === 'drops' || t === 'deliver' || t === 'collect' ? 'deliver' : t === 'go' || t === 'getin' || t === 'trail' ? 'go' : 'def'; return from(CUMSAYS.start[kind]); }
  return from(CUMSAYS.mid); }
(function () { MISSIONS.forEach(function (m) { var talks = (m.steps || []).filter(function (s) { return s.t === 'talk' && s.lines && s.lines.length; }); var ti = 0;
  (m.steps || []).forEach(function (s, si) { if (s.t !== 'talk' || !s.lines || !s.lines.length) return; if (s.lines.some(function (l) { return l[0] === 'cumhead'; }) || s.cumDone) { ti++; return; }
    var next = (m.steps || []).slice(si + 1).filter(function (x) { return x.t !== 'talk'; })[0]; s.lines = s.lines.concat([['cumhead', cumReply(m, ti, talks.length, next)]]); s.cumDone = 1; ti++; }); }); })();

/* ---- PULSAROCTOPUS BEATS: two matching speaker stacks either side of the decks, cones that pump to the beat, light bars
   and a lit DJ booth, and his station (PulsarOctopus Beats FM) plays out of them while you are inside ---- */
var PULSARM = null;
function pulsarMesh(RM) { if (PULSARM) return PULSARM; var m = new R3.Mesh(), gl = new R3.Mesh(), w = RM.w, d = RM.d, cx = w / 2, CONES = [];
  // the DJ booth in the middle of the back wall
  // the decks and the mixer on the counter, with a light strip along its front
  boxC(gl, cx - 3, 1.02, d - 3.02, cx + 3, 1.07, d - 2.98, '#4adfff'); boxC(m, cx - 1.5, 1.1, d - 2.85, cx - 0.25, 1.18, d - 2.3, '#2a2a2e'); boxC(m, cx + 0.25, 1.1, d - 2.85, cx + 1.5, 1.18, d - 2.3, '#2a2a2e'); boxC(m, cx - 0.22, 1.1, d - 2.8, cx + 0.22, 1.22, d - 2.35, '#1a1a1e');
  [-0.88, 0.88].forEach(function (o) { tub(m, [cx + o, 1.18, d - 2.57], [cx + o, 1.21, d - 2.57], 0.26, 0.26, '#0a0a0c', 14, { cap: 1 }); ell(gl, cx + o, 1.22, d - 2.57, 0.05, 0.01, 0.05, '#c48aff', 6, 2); });
  // the stacks: exactly the same on both sides
  [-1, 1].forEach(function (s) { var x = cx + s * (w / 2 - 1.1); for (var lv = 0; lv < 3; lv++) { var y0 = lv * 1.05; boxC(m, x - 0.75, y0, d - 1.6, x + 0.75, y0 + 1.0, d - 0.3, '#0e0e10'); boxC(m, x - 0.78, y0 + 0.97, d - 1.63, x + 0.78, y0 + 1.03, d - 0.27, '#3a1a5a');
      CONES.push({ x: x, y: y0 + (lv === 2 ? 0.5 : 0.48), z: d - 1.62, r: lv === 2 ? 0.26 : 0.38 }); if (lv === 2) [-0.4, 0.4].forEach(function (o) { CONES.push({ x: x + o, y: y0 + 0.75, z: d - 1.62, r: 0.11 }); }); }
    boxC(gl, x - 0.8, 3.18, d - 1.65, x + 0.8, 3.24, d - 0.25, '#c48aff'); RM.boxes.push([x - 0.8, d - 1.65, x + 0.8, d]); });
  for (var lz = 2; lz < d - 2; lz += 2.2) [-1, 1].forEach(function (s) { boxC(gl, s < 0 ? 0.04 : w - 0.1, 2.4, lz, s < 0 ? 0.1 : w - 0.04, 2.5, lz + 1.4, lz % 4 < 2 ? '#4adfff' : '#c48aff'); });
  var cone = new R3.Mesh(); tub(cone, [0, 0, 0], [0, 0, -0.06], 1, 0.6, '#1a1a1e', 16, { cap0: 1 }); tub(cone, [0, 0, -0.06], [0, 0, -0.1], 0.3, 0.25, '#3a3a3e', 12, { cap: 1 }); ell(cone, 0, 0, -0.12, 0.2, 0.2, 0.06, '#4a4a50', 8, 4);
  var ring = new R3.Mesh(); tub(ring, [0, 0, 0.005], [0, 0, -0.005], 1.12, 1.12, '#c48aff', 16);
  PULSARM = { m: m.upload(), gl: gl.upload(), cones: CONES, cone: cone.upload(), ring: ring.upload() }; return PULSARM; }
(function () {
  var rp = ROOMS.pulsar; if (rp) rp.props = rp.props.filter(function (p) { return p !== 'speaker' && p !== 'deck'; });
  var di = drawInterior; drawInterior = function (look) { di(look); var I = G.interior; if (!I || I.id !== 'pulsar' || I.special) return; var M = pulsarMesh(I.RM); R3.draw(M.m, ATT); R3.draw(M.gl, ATT, { lit: false });
    var beat = (G.t * 2.1) % 1, pump = Math.pow(1 - beat, 3); M.cones.forEach(function (c) { R3.draw(M.cone, ATT, { m: MD(c.x, c.y, c.z + 0.02 - pump * 0.035, 0, 0, 0, c.r) }); R3.draw(M.ring, ATT, { lit: false, m: MD(c.x, c.y, c.z + 0.01, 0, 0, 0, c.r * (1 + pump * 0.08)) }); }); };
  var es = enterShop; enterShop = function (id, homeId, special) { var r = es.apply(this, arguments); if (id === 'pulsar' && !special && G.interior) { var idx = 0; STATIONS.forEach(function (s, i) { if (s.id === 'po') idx = i; }); RAD.st = idx; RAD.on = true; RAD.seg = null; G.pulsarRadio = 1; G.radioName = STATIONS[idx].name; G.radioT = 3; try { radioNextSeg(); } catch (e) {} } return r; };
  var ls = leaveShop; leaveShop = function () { var was = G.pulsarRadio; G.pulsarRadio = 0; var r = ls.apply(this, arguments); if (was) radioOff(); return r; };
  var sr = stepRadio; stepRadio = function (dt) { if (G.pulsarRadio && G.interior && G.interior.id === 'pulsar' && RAD.on) { var st = P.state; P.state = 'car'; try { return sr(dt); } finally { P.state = st; } } return sr(dt); };
})();

/* ---- CUM HILLS: every house has its path, the cars on the drives are real cars, the front doors sit over the wall ---- */
/* real cars on the drives: made when you come within 110 m, taken away past 180 m (unless you have moved them) */
var DRIVEV = {};
function stepDrives(dt) { if ((G.drT = (G.drT || 0) - dt) > 0 || G.interior) return; G.drT = 0.8; var px = P.x, pz = P.z;
  DRIVES.forEach(function (d, i) { var dd = (d.x - px) * (d.x - px) + (d.z - pz) * (d.z - pz), v = DRIVEV[i];
    if (dd < 110 * 110 && !v && !(G.guest && G.netSync)) { var types = ['hatch', 'saloon', 'saloon', 'muscle', 'hatch', 'sports', 'saloon'], cols = ['#c4121c', '#f1e7d0', '#2a4a6a', '#12040a', '#3a6a3a', '#5a5a62', '#ffe36a'];
      var nv = makeVeh(types[(d.c + i) % types.length], d.x, d.z, d.a, {}); nv.y = groundY(d.x, d.z); nv.drive = i; nv.keep = 0; nv.parked = 1; DRIVEV[i] = nv; nv.home = [d.x, d.z]; }
    else if (v && (VEH.indexOf(v) < 0 || dd > 180 * 180)) { if (VEH.indexOf(v) >= 0 && Math.hypot(v.x - v.home[0], v.z - v.home[1]) < 2 && v !== P.veh) VEH.splice(VEH.indexOf(v), 1); if (VEH.indexOf(v) < 0 || Math.hypot(v.x - v.home[0], v.z - v.home[1]) >= 2) DRIVEV[i] = null; } }); }
(function () { var df = despawnFar; despawnFar = function () { var keep = VEH.filter(function (v) { return v.drive !== undefined && v !== P.veh; }); df(); keep.forEach(function (v) { if (VEH.indexOf(v) < 0 && DRIVEV[v.drive] === v && Math.hypot(v.x - P.x, v.z - P.z) < 180) VEH.push(v); }); }; })();
(function () { var hd = houseDress; houseDress = function (m, glow, b) { hd(m, glow, b);
  var F = frontFace(b), nx = F.n[0], nz = F.n[2], ux = F.R[0] - F.L[0], uz = F.R[1] - F.L[1], wF = Math.hypot(ux, uz) || 1, mx = (F.L[0] + F.R[0]) / 2, mz = (F.L[1] + F.R[1]) / 2, a = Math.atan2(nx, nz), y0 = b.y0 !== undefined ? b.y0 : groundY(mx, mz); ux /= wF; uz /= wF;
  // the front door, standing a little proud of the wall so no painted window ever shows over it
  var dx = mx + nx * 0.07, dz = mz + nz * 0.07; boxR(m, dx, dz, a, 0.62, 0.05, y0, y0 + 2.28, '#2a1a10'); boxR(m, dx + nx * 0.03, dz + nz * 0.03, a, 0.5, 0.04, y0 + 0.02, y0 + 2.16, ['#7a0c14', '#12040a', '#2a3a5a', '#3a5a3a', '#f1e7d0'][b.i % 5]);
  [[0.25, 0.55], [1.25, 0.85]].forEach(function (q) { boxR(m, dx + nx * 0.06, dz + nz * 0.06, a, 0.36, 0.02, y0 + q[0], y0 + q[0] + q[1] * 0.75, '#1e1010'); }); var kx = dx + nx * 0.1 + ux * 0.32, kz = dz + nz * 0.1 + uz * 0.32; ell(m, kx, y0 + 1.05, kz, 0.04, 0.04, 0.04, '#c8a040', 5, 4);
  boxR(m, mx + nx * 0.45, mz + nz * 0.45, a, 0.75, 0.4, y0, y0 + 0.16, '#8a8480'); // the step
  // a path to the pavement even when the pavement is not straight ahead
  var D = 0; for (var s = 0.5; s < 16; s += 0.25) { var k = kAt(mx + nx * s, mz + nz * s); if (k === K_PAVE || k === K_ROAD || k === K_BRIDGE) { D = s; break; } if (bldAt(mx + nx * s, mz + nz * s)) break; }
  if (!D) { var best = null, bd = 1e9; for (var r = 1; r < 9 && !(best && r > 3); r++) for (var di = -r; di <= r; di++) for (var dj = -r; dj <= r; dj++) { if (Math.abs(di) !== r && Math.abs(dj) !== r) continue; var tx = Math.floor((mx + nx * 2) / CT) + di, tz = Math.floor((mz + nz * 2) / CT) + dj; if (tx < 0 || tz < 0 || tx >= MW || tz >= MH || KM[tz * MW + tx] !== K_PAVE) continue; var px = tx * CT + 2, pz = tz * CT + 2, dd = (px - mx) * (px - mx) + (pz - mz) * (pz - mz); if (dd < bd) { bd = dd; best = [px, pz]; } }
    if (best) { var sx = mx + nx * 0.8, sz = mz + nz * 0.8, ex = best[0], ez = best[1], L = Math.hypot(ex - sx, ez - sz), ax2 = Math.atan2(ex - sx, ez - sz); for (var t = 0; t < L - 0.3; t += 0.95) { var cx = sx + (ex - sx) * (t + 0.4) / L, cz = sz + (ez - sz) * (t + 0.4) / L; if (bldAt(cx, cz)) break; var gy = groundY(cx, cz); boxR(m, cx, cz, ax2, 0.55, 0.36, gy, gy + 0.05, '#9a948e', 'paver'); } } } }; })();
(function () { var sf = stepFun; stepFun = function (dt) { sf(dt); try { stepDrives(dt); } catch (e) { if (!window.__dre) { window.__dre = 1; console.warn(e); } } }; })();
