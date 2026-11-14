/* ---------- the game: the save, the loop, dying and getting nicked, the menus, the title ---------- */
function freshSave() { return { v: 1, money: 500, maxHp: 100, armour: 0, weapons: { sausage: 1 }, ammo: {}, wpn: 'fists', wanted: 0, heat: 0, stats: { kills: 0, earned: 0, stunts: 0, races: 0, miles: 0, robbed: 0, deaths: 0, busted: 0, packages: 0, clues: 0, events: 0 },
  time: 9.5, day: 0, pos: null, done: {}, chapter: 'one', houses: [], cars: [], clues: {}, packages: {}, stuntsDone: {}, races: {}, radio: 0, str: 0, intro: 0, way: null, seenEvents: {}, tattoo: 0, outfit: 0, lastHouse: null }; }
var SV = (function () { var s = KIT.load('ccn-save', null); if (!s || s.v !== 1) s = freshSave(); var f = freshSave(); for (var k in f) if (s[k] === undefined) s[k] = f[k]; for (var k2 in f.stats) if (s.stats[k2] === undefined) s.stats[k2] = 0; return s; })();
function persist() { if (P) { SV.pos = [P.x, P.z, P.a]; SV.armour = P.armour; } SV.time = G.time; SV.day = G.day; KIT.save('ccn-save', SV); }
var G = { mode: 'title', t: 0, time: SV.time, day: SV.day, weather: 'clear', wxT: 300, uses: [], toasts: [], dynLights: [], chapter: SV.chapter };
var TIMESCALE = 1 / 60; // one game hour a real minute
function startGame(fresh) {
  KIT.closeMenu(); buildAtlas(); buildCityRigs(); buildLandmarks();
  if (fresh) { SV = freshSave(); persist(); }
  G.time = SV.time; G.day = SV.day; G.chapter = SV.chapter; PEDS = []; VEH = []; PICKUPS = []; FX = [];
  var at = SV.pos || startSpot(); newPlayer(at[0], at[1], at[2] || 0); P.hp = SV.maxHp; CAM.x = P.x - 4; CAM.y = P.y + 3; CAM.z = P.z - 4;
  solidsAround(P.x, P.z, 70); G.mode = 'play'; worldSetup();
  if (!SV.intro) playIntro(); else bigText(districtName(P.x, P.z), null, '#f1e7d0', 2.5);
  if (typeof radioInit === 'function') radioInit();
}
function playIntro() {
  SV.intro = 1; persist(); G.time = 21.5; var bus = makeVeh('van', P.x + Math.sin(P.a + 1.6) * 5, P.z + Math.cos(P.a + 1.6) * 5, P.a, { col: 2 }); bus.keep = 0;
  startCutscene([['lab', 'Oi! Cumhead! Over here! Welcome to Cum City!'], ['lab', 'Shithead Laboozie, at your service. I run the Clubhouse now. Well, I sit in it.'], ['lab', 'Every door is open, every car is a taxi if you are brave, and everyone in this city wants a favour.'], ['lab', 'Find the yellow markers. That is where people want you. Come and see me in the Clubhouse when you are ready.'], ['lab', 'And Cumhead? Stay away from the Crimson Peak at midnight. Just... a feeling.']],
    function () { bigText('CUM CITY NIGHTS', 'Clubhouse Row, Cum City', '#c4121c', 4); });
}
(function () { ['pn-voice/voices.js', 'ccn-radio/radio.js'].forEach(function (src) { var s = document.createElement('script'); s.src = src; s.onerror = function () {}; document.head.appendChild(s); }); })();
function startSpot() { var d = doorOf(SHOPS.club.b); return [d.x + Math.sin(d.a) * 3, d.z + Math.cos(d.a) * 3, d.a]; }
function update(dt) {
  G.t += dt;
  if (G.mode === 'map') { stepMap(dt); return; }
  if (G.mode === 'fly') { flyStep(dt); return; }
  if (G.mode !== 'play' || !P) return;
  if (G.slowmo > 0) { G.slowmo -= dt; dt *= 0.35; }
  // time passes
  G.time += dt * TIMESCALE * (G.sleeping ? 60 : 1); if (G.time >= 24) { G.time -= 24; G.day++; dayChange(); }
  G.wxT -= dt; if (G.wxT <= 0) newWeather();
  // you
  if (P.state === 'dead') { G.deadT += dt; if (G.deadT > 3.5) respawn(); }
  else if (P.state === 'foot') stepFoot(dt);
  else if (P.state === 'car' && P.veh) { var inp = vehInput(); stepVehicle(P.veh, inp, dt); carHits(dt); P.x = P.veh.x; P.z = P.veh.z; P.y = P.veh.y; G.lookBack = KIT.held('lb') && P.veh.t.cls === 'car';
    if (KIT.pressed('y') && !G.cut) { if (G.carUse && !G.mission) G.carUse.fn(); else exitVehicle(); } if (KIT.pressed('rb')) radioNext(); SV.stats.miles += Math.abs(P.veh.sp) * dt / 1609;
    if (P.veh && P.veh.t.cls === 'car' && dayLight(G.time) < 0.5) { var v = P.veh; G.headlight = { p: [v.x + Math.sin(v.a) * v.t.len * 0.5, v.y + 0.9, v.z + Math.cos(v.a) * v.t.len * 0.5], d: [Math.sin(v.a) * 0.96, -0.25, Math.cos(v.a) * 0.96], c: [1.6, 1.4, 1.1] }; } else G.headlight = null; }
  if (P.state !== 'car') G.headlight = null;
  stepCamera(dt);
  // the city
  if (!G.interior) { spawnPeds(); spawnTraffic(); }
  stepPeds(dt); stepTraffic(dt); stepWanted(dt); stepPickups(dt); stepFx(dt); despawnFar();
  if (typeof stepWorldStuff === 'function') stepWorldStuff(dt);
  if (typeof stepMission === 'function') stepMission(dt);
  if (typeof stepRadio === 'function') stepRadio(dt);
  if (typeof stepDrugs === 'function') stepDrugs(dt);
  if (G.interior) stepRobbery(dt); if (G.arcade) stepArcade(dt); if (G.noCops > 0) G.noCops -= dt;
  if (G.fade > 0) G.fade -= dt;
  G.dynLights = (G.dynLights || []).filter(function (L) { if (L.life === undefined) return true; L.life -= dt; return L.life > 0; });
  if (P.state === 'foot' && P.hp < SV.maxHp && SV.wanted === 0) P.hp = Math.min(SV.maxHp * 0.5 > P.hp ? SV.maxHp * 0.5 : P.hp, P.hp + dt * 0.5); // you slowly patch up to half
  if ((G.saveT = (G.saveT || 0) + dt) > 20) { G.saveT = 0; persist(); }
  if (P.y < -30) { P.y = standY(P.x, P.z, 999); }
}
function dayChange() { toast(SEASONS[season()] + ', day ' + (G.day + 1)); if (G.day % 7 === 0) bigText(SEASONS[season()], 'The season turns in Cum City', '#ffe36a', 3); newWeather(); }
function newWeather() { var s = season(), r = Math.random(); G.weather = s === 3 ? (r < 0.4 ? 'snow' : r < 0.55 ? 'fog' : r < 0.7 ? 'rain' : 'clear') : s === 2 ? (r < 0.35 ? 'rain' : r < 0.5 ? 'fog' : r < 0.58 ? 'storm' : 'clear') : s === 1 ? (r < 0.1 ? 'storm' : r < 0.2 ? 'rain' : 'clear') : (r < 0.3 ? 'rain' : r < 0.4 ? 'fog' : 'clear'); G.wxT = rnd(240, 600); }
function wasted() { P.state = 'dead'; G.deadT = 0; if (P.veh) exitVehicle(true); SV.stats.deaths++; bigText('WASTED', 'Sent to Cum City Hospital', '#c4121c', 3.5); sfx.play('hurt'); G.respawnAt = 'hosp'; if (G.mission) missionFail('You died.'); }
function busted() { P.state = 'dead'; G.deadT = 1; SV.stats.busted++; bigText('BUSTED', 'The Cum City Police take your guns', '#2a6aff', 3.5); G.respawnAt = 'cops'; if (G.mission) missionFail('You got nicked.'); }
function respawn() {
  var s = SHOPS[G.respawnAt] || SHOPS.hosp, d = doorOf(s.b), loss = Math.min(1000, Math.floor(SV.money * 0.08)); money(-loss);
  if (G.respawnAt === 'cops') { var keep = { sausage: SV.weapons.sausage }; SV.weapons = keep; SV.ammo = {}; P.wpn = 'fists'; SV.wanted = 0; SV.heat = 0; }
  SV.wanted = 0; SV.heat = 0; VEH = VEH.filter(function (v) { return !(v.ai && v.ai.cop); }); PEDS = PEDS.filter(function (p) { return !p.cop; });
  newPlayer(d.x + Math.sin(d.a) * 2, d.z + Math.cos(d.a) * 2, d.a); P.hp = SV.maxHp; G.time = (G.time + 6) % 24; toast((loss ? '$' + loss + ' to get you back on your feet. ' : '') + 'You are fine. Mostly.'); persist();
}
/* ---------- effects ---------- */
function stepFx(dt) { FX = FX.filter(function (f) { f.life -= dt; if (f.vx !== undefined) { f.x += f.vx * dt; f.z += f.vz * dt; } if (f.vy !== undefined) { f.y += f.vy * dt; if (f.k !== 'smoke' && f.k !== 'flame') f.vy -= 16 * dt; }
  if (f.k === 'rocket') { var gy = groundY(f.x, f.z), hit = f.y <= gy || collide(f.x, f.z, 0.3, f.y, 0.2).hit; f.vy += 16 * dt; PEDS.forEach(function (p) { if (!p.dead && p !== f.by && dist2(p.x, p.z, f.x, f.z) < 1.5 && Math.abs(p.y + 1 - f.y) < 1.5) hit = true; }); VEH.forEach(function (v) { if (v !== (f.by && f.by.veh) && dist2(v.x, v.z, f.x, f.z) < v.t.len * v.t.len * 0.25 && f.y < v.y + v.t.hgt + 0.5) hit = true; }); if (hit || f.life <= 0) { boom(f.x, f.y, f.z, 10, f.by); return false; } if (Math.random() < 0.5) addFx({ k: 'smoke', x: f.x, y: f.y, z: f.z, vy: 0.5, life: 0.8 }); }
  if (f.k === 'bagf' || f.k === 'pill') { var g2 = groundY(f.x, f.z); if (f.y <= g2 + 0.1) { if (f.k === 'bagf') { boom(f.x, g2, f.z, 4, f.by); G.fires = G.fires || []; G.fires.push({ x: f.x, z: f.z, y: g2, t: 8 }); } else { addFx({ k: 'cloud', x: f.x, y: g2 + 1, z: f.z, life: 6 }); PEDS.forEach(function (p) { if (dist2(p.x, p.z, f.x, f.z) < 36 && !p.dead) { p.tripT = 12; p.fear = 0; p.state = 'idle'; p.danceT = 12; } }); } return false; } }
  return f.life > 0; });
  (G.fires || []).forEach(function (F) { F.t -= dt; if (Math.random() < dt * 14) addFx({ k: 'flame', x: F.x + rnd(-1, 1), y: F.y + 0.2, z: F.z + rnd(-1, 1), vy: 2, life: 0.5 }); PEDS.forEach(function (p) { if (!p.dead && dist2(p.x, p.z, F.x, F.z) < 4) hurtPed(p, dt * 20, null); }); if (P.state === 'foot' && dist2(P.x, P.z, F.x, F.z) < 3) hurtPlayer(dt * 15, 'fire'); }); G.fires = (G.fires || []).filter(function (F) { return F.t > 0; });
}
var FXQ = null;
function drawFx() {
  if (!FXQ) { FXQ = new R3.Mesh(); FXQ.quad([-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL('white'), [0.5, 0.5, 0.5], [0, 0, 1]); FXQ.upload(); }
  var cam = R3.cam.eye;
  function bill(x, y, z, s, tile, o) { var yaw = Math.atan2(cam[0] - x, cam[2] - z); var m = new R3.Mesh(); m.quad([-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL(tile), [0.5, 0.5, 0.5], [0, 0, 1]); R3.draw(m, ATT, Object.assign({ m: MD(x, y, z, yaw, 0, 0, s), lit: false, soft: 1 }, o || {})); }
  FX.forEach(function (f) {
    if (f.k === 'tracer') { var m = new R3.Mesh(), dx = f.ex - f.x, dy = f.ey - f.y, dz = f.ez - f.z, l = Math.hypot(dx, dz) || 1, px = -dz / l * 0.03, pz = dx / l * 0.03; m.quad([f.x - px, f.y, f.z - pz], [f.x + px, f.y, f.z + pz], [f.ex + px, f.ey, f.ez + pz], [f.ex - px, f.ey, f.ez - pz], UV1, TL('white'), [0.6, 0.55, 0.4], [0, 1, 0]); R3.draw(m, ATT, { lit: false, add: 1, alpha: 0.9 }); }
    else if (f.k === 'flame') bill(f.x, f.y, f.z, 1.1 * (0.5 + f.life), 'fire', { add: 1 });
    else if (f.k === 'smoke') bill(f.x, f.y, f.z, 1.5 + (2.5 - f.life) * 1.2, 'halo', { tint: [0.25, 0.22, 0.22], alpha: clamp(f.life * 0.4, 0, 0.6) });
    else if (f.k === 'spark') bill(f.x, f.y, f.z, 0.4, 'spark', { add: 1 });
    else if (f.k === 'blood') bill(f.x, f.y, f.z, 0.3, 'drop', { tint: [0.6, 0.02, 0.05] });
    else if (f.k === 'cloud') bill(f.x, f.y, f.z, 6, 'halo', { tint: [1, 0.4, 0.9], alpha: 0.4, add: 1 });
    else if (f.k === 'rocket') bill(f.x, f.y, f.z, 0.8, 'fire', { add: 1 });
    else if (f.k === 'bagf') { R3.draw(RIGS.bagM, ATT, { m: MD(f.x, f.y, f.z, G.t * 8, G.t * 5, 0, 2) }); bill(f.x, f.y + 0.3, f.z, 0.6, 'fire', { add: 1 }); }
    else if (f.k === 'pill') bill(f.x, f.y, f.z, 0.5, 'i_pill');
    else if (f.k === 'confetti') bill(f.x, f.y, f.z, 0.25, 'spark', { tint: f.c || [1, 0.3, 0.6] });
    else if (f.k === 'note') bill(f.x, f.y, f.z, 0.5, 'star', { tint: [1, 0.9, 0.4], add: 1 });
  });
  // pickups: spinning, glowing
  PICKUPS.forEach(function (q) { var s = q.k === 'cash' ? 'cc_dropT' : null, y = q.y + 0.6 + Math.sin(G.t * 3 + q.x) * 0.15; if (q.k === 'cash') bill(q.x, y, q.z, 0.6, 'drop', { tint: [1, 0.95, 0.75], lit: false }); else if (q.k === 'health') bill(q.x, y, q.z, 0.8, 'i_cracker'); else if (q.k === 'armour') bill(q.x, y, q.z, 0.8, 'halo', { tint: [1, 0.95, 0.85], add: 1 }); else if (q.k === 'wpn') bill(q.x, y, q.z, 0.8, 'i_' + ({ pistol: 'handgun', smg: 'handgun', shotgun: 'shotgun', rifle: 'riflew', knife: 'knife', bat: 'bat' }[q.w] || 'handgun'));
    else if (q.k === 'package') bill(q.x, y, q.z, 0.9, 'package'); else if (q.k === 'clue') bill(q.x, y, q.z, 0.9, 'i_note'); else if (q.tile) bill(q.x, y, q.z, q.size || 0.9, q.tile, q.o); });
  // weather near the camera
  if (!G.interior && (G.weather === 'rain' || G.weather === 'storm' || G.weather === 'snow' || season() === 2 || season() === 0)) { var n = G.weather === 'storm' ? 70 : G.weather === 'rain' || G.weather === 'snow' ? 50 : 10, tile = G.weather === 'snow' ? 'flake' : G.weather === 'rain' || G.weather === 'storm' ? 'rain' : season() === 2 ? 'leaf' : 'petal';
    for (var i = 0; i < n; i++) { var h = hash2(i, 3, 7), h2 = hash2(i, 5, 9), sp = tile === 'rain' ? 22 : tile === 'flake' ? 2.4 : 1.4, fall = (G.t * sp + h * 30) % 30, x = cam[0] + (h - 0.5) * 40 + Math.sin(G.t * 0.7 + i) * (tile === 'rain' ? 0 : 2), z = cam[2] + (h2 - 0.5) * 40, y = cam[1] + 15 - fall; bill(x, y, z, tile === 'rain' ? 1.4 : 0.3, tile, { alpha: 0.8 }); } }
  if (G.weather === 'storm' && Math.random() < 0.003) { G.flashT = 0.15; sfx.play('boom'); }
}
/* ---------- drawing everything ---------- */
function draw() {
  var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (!R3.ok) { tx('This game needs WebGL, and this device has not got it.', 20, 40, { size: 10 }); return; }
  if (G.mode === 'title' || !P) { if (G.mode === 'title') drawTitleBack(); return; }
  if (G.mode === 'map') { drawMap(); return; }
  var look = worldLook(); updateChunks(CAM.x, CAM.z, G.mode === 'play' ? 6 : 14);
  var pk = G.interior ? 0.85 : 1 - 0.34 * clamp(look.dl, 0, 1); G.ptint = [pk, pk, pk]; window.RIMK = G.interior ? 0.15 : 0.12 + 0.6 * (1 - clamp(look.dl, 0, 1)); R3.begin([look.fog[0], look.fog[1], look.fog[2]]); R3.setCam([CAM.x, CAM.y, CAM.z], CAM.at || [P.x, P.y + 1.4, P.z], P.aim ? 0.85 : 1.05 + (P.veh ? clamp(Math.abs(P.veh.sp) / 60, 0, 0.25) : 0));
  if (G.interior) drawInterior(look); else { drawSky(look); drawWorld(look); }
  // vehicles and people
  VEH.forEach(function (v) { if (!inView(v.x, v.z, 8) || dist2(v.x, v.z, CAM.x, CAM.z) > 230 * 230) return; if (G.interior && !v.inside) return; drawVeh(v); });
  PEDS.forEach(function (p) { if (p.inVeh) { if (p.inVeh.t.cls === 'bike' || p.inVeh.t.cls === 'board') { var Q2 = pose0(); if (p.inVeh.t.cls === 'board') poseRideStand(Q2); else poseSit(Q2); drawPerson(p.rig, p.inVeh.x, p.inVeh.y + 0.35, p.inVeh.z, p.inVeh.a, Q2, { noShadow: 1 }); } return; }
    if ((G.interior ? G.interior.id : null) !== (p.inside || null)) return; if (dist2(p.x, p.z, CAM.x, CAM.z) > 75 * 75 || !inView(p.x, p.z, 3)) return; drawPed(p); });
  if (P.state !== 'dead' || true) drawPlayer();
  if (typeof drawWorldStuff === 'function') drawWorldStuff();
  drawFx();
  if (G.flashT > 0) { G.flashT -= 1 / 60; ctx.fillStyle = 'rgba(255,255,255,' + G.flashT * 4 + ')'; ctx.fillRect(0, 0, KIT.W, KIT.H); }
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, G.fade) + ')'; ctx.fillRect(0, 0, KIT.W, KIT.H); }
  if (G.cut) drawCutBars(); else { drawHud(); if (G.arcade) drawArcade(); }
}
function drawPed(p) {
  var Q = pose0();
  if (p.dead) poseDown(Q, 1, (p.id * 10) % 2 > 1);
  else if (p.downT > 0) poseDown(Q, Math.min(1, p.downT), 0);
  else if (p.danceT > 0) { p.danceT -= 1 / 60; poseDance(Q, G.t, p.id * 10); }
  else if (p.pose) p.pose(Q, p);
  else if (p.kind === 'zombie') poseZombie(Q, p.ph, Math.min(1, p.sp / 1.5));
  else { if (p.sp > 0.3) poseWalk(Q, p.ph, Math.min(1, p.sp / 1.5), p.sp > 3); if (p.state === 'flee') { Q.sh[0] = [2.4, 0.5, 0]; Q.sh[1] = [2.4, 0.5, 0]; } if (p.handsUp) poseHandsUp(Q); if (p.cower) poseCower(Q); }
  if (p.atkT > 0) { if (p.wpn) poseAim(Q, 'handgun', p.atkT); else posePunch(Q, 1 - p.atkT / 0.35); } else if (p.wpn && p.state === 'fight') poseAim(Q, 'handgun', 0);
  if (p.who === 'tb' && typeof tbTwitch === 'function') tbTwitch(Q, p);
  drawPerson(p.rig, p.x, p.y, p.z, p.a, Q, { held: p.wpn ? RIGS[WPN[p.wpn].mesh] : p.holding ? RIGS[p.holding] : null, heldP: -Math.PI / 2, flash: p.flash > 0 ? [0.6, 0, 0] : null, sc: p.sc });
  p.flash = Math.max(0, (p.flash || 0) - 1 / 60);
}
function drawCutBars() { var ctx = KIT.ctx, h = KIT.H * 0.1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, h); ctx.fillRect(0, KIT.H - h, KIT.W, h);
  if (G.sub && G.sub.t > 0) { G.sub.t -= 1 / 60; var who = G.sub.who ? G.sub.who + ': ' : '', L = KIT.wrap(who + G.sub.s, KIT.W * 0.84, 9, 'body'); L.forEach(function (l, i) { tx(l, KIT.W / 2 - tw2(l, 9) / 2, KIT.H - h + 4 + i * 10, { col: i === 0 && who ? '#ffe36a' : '#f1e7d0', size: 9 }); }); }
  tx(TOUCHUI() ? 'TAP TO SKIP' : 'A: NEXT', KIT.W - 60, 6, { col: '#a6968f', size: 6 }); }
/* ---------- menus ---------- */
function pauseMenu() { if (G.mode !== 'play' || !P) return; persist(); KIT.menu({ cls: 'clear', title: 'Paused', sub: districtName(P.x, P.z) + ' · ' + SEASONS[season()] + ' · $' + Math.floor(SV.money).toLocaleString('en-GB'), items: [
  { label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'MAP', fn: function () { mapMenu(); } }, { label: 'MISSIONS', fn: missionsMenu }, { label: 'THE MYSTERY', fn: mysteryMenu }, { label: 'STATS', fn: statsMenu },
  { label: 'OPTIONS', fn: optsMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'SAVE AND QUIT', fn: function () { persist(); titleMenu(); } }] }); }
function statsMenu() { var s = SV.stats; KIT.menu({ title: 'Stats', html: '<p>Money earned: $' + Math.floor(s.earned).toLocaleString('en-GB') + '<br>Miles driven: ' + s.miles.toFixed(1) + '<br>People flattened or worse: ' + s.kills + '<br>Wasted: ' + s.deaths + ' · Busted: ' + s.busted + '<br>Shops robbed: ' + s.robbed + '<br>Stunt jumps: ' + Object.keys(SV.stuntsDone).length + ' of ' + STUNTS.length + '<br>Street races won: ' + Object.keys(SV.races).length + ' of ' + RACES.length + '<br>Lost Loads found: ' + Object.keys(SV.packages).length + ' of ' + PACKAGES.length + '<br>Mystery clues: ' + Object.keys(SV.clues).length + ' of ' + CLUES.length + '<br>Houses owned: ' + SV.houses.length + ' · Cars in your garages: ' + SV.cars.length + '<br>Missions done: ' + Object.keys(SV.done).length + ' of ' + MISSIONS.length + '</p>', items: [{ label: 'BACK', back: true, fn: pauseMenu }] }); }
function optsMenu() { KIT.menu({ title: 'Options', items: [R3.resItem(optsMenu), { label: 'VIEW DISTANCE: ' + (VIEWR >= 380 ? 'FAR' : VIEWR >= 300 ? 'NORMAL' : 'NEAR'), fn: function () { VIEWR = VIEWR >= 380 ? 200 : VIEWR >= 300 ? 400 : 300; try { localStorage.setItem('ccn-view', VIEWR); } catch (e) {} optsMenu(); } },
  { label: 'RADIO: ' + (SV.radioOff ? 'OFF' : 'ON'), fn: function () { SV.radioOff = !SV.radioOff; if (SV.radioOff) radioOff(); optsMenu(); } }, { label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>On foot:</b> left stick walks, <b>B</b> (or Shift) runs, <b>A</b> jumps, <b>X</b> hits or shoots, hold <b>LB</b> (Q) to aim and lock on, <b>RB</b> (E key: R) swaps weapons, <b>Y</b> gets in a car, goes through a door or talks.</p><p><b>Driving:</b> stick or <b>A</b> / RT to go, <b>B</b> / LT to brake and reverse, <b>X</b> handbrake, <b>Y</b> to get out, <b>RB</b> changes the radio, hold <b>LB</b> to look behind. Helicopters: A up, B down, the stick flies. Planes: A throttle, pull back to take off.</p><p>Yellow markers are missions. Do crime and the police come: lose them out of sight or wash your car at The Cream Wash. Buy houses at Load Estates to save and keep cars. Cars at Cum Motors. Guns at Saba\'s.</p>', items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function titleMenu() {
  G.mode = 'title'; P = null; KIT.closeMenu(); if (typeof radioOff === 'function') radioOff(); music.play('ccntitle');
  var started = SV.intro;
  KIT.menu({ cls: 'clear', logo: '../assets/ccn-logo.webp', title: 'Cum City Nights', items: [{ label: started ? 'CONTINUE' : 'NEW GAME', cls: 'hot', def: true, fn: function () { startGame(false); } },
    started ? { label: 'NEW GAME', fn: function () { KIT.confirm({ title: 'Start Again?', sub: 'Everything you own in Cum City is gone.', yesLabel: 'Start again', yes: function () { startGame(true); }, no: titleMenu }); } } : null, { label: 'OPTIONS', fn: optsMenu }, { label: 'HOW TO PLAY', fn: helpMenu }] });
}
var TITLECAM = 0;
function drawTitleBack() { // a slow flight over the city behind the menu
  buildAtlas(); buildLandmarks(); TITLECAM += 1 / 60; var t = TITLECAM * 0.03, x = 2000 + Math.sin(t) * 300, z = 1450 + Math.cos(t * 0.8) * 260, y = 70;
  updateChunks(x, z, 8); G.time = 20.5; var look = worldLook(); R3.begin([look.fog[0], look.fog[1], look.fog[2]]); R3.setCam([x, y, z], [x + Math.cos(t) * 60, 30, z - Math.sin(t) * 60], 1.0); drawSky(look); drawWorld(look);
}
function flyStep(dt) { var s = KIT.stick(0), r = KIT.stick(1), c = G.fly; c.yaw -= r.x * dt * 1.6; c.pit = clamp(c.pit - r.y * dt * 1.2, -1.4, 1.2); var fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), sp = 60; c.x += (fx * -s.y - fz * s.x) * sp * dt; c.z += (fz * -s.y + fx * s.x) * sp * dt; CAM.x = c.x; CAM.y = c.y; CAM.z = c.z; CAM.at = [c.x + fx * Math.cos(c.pit), c.y + Math.sin(c.pit), c.z + fz * Math.cos(c.pit)]; }
try { var vr = +localStorage.getItem('ccn-view'); if (vr) VIEWR = vr; } catch (e) {}
KIT.setKeymap({ KeyI: 'sup', KeyK: 'sdown', KeyJ: 'sleft', KeyL: 'sright', KeyQ: 'lb', KeyR: 'rb', KeyE: 'y', KeyF: 'y', KeyX: 'b', ShiftLeft: 'run', ShiftRight: 'run', Space: 'a', KeyZ: 'a', KeyC: 'x', ControlLeft: 'x', KeyM: 'map', Tab: 'rb' });
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, onPause: pauseMenu, startPauses: true, idleUpdate: function (dt) { if (G.mode === 'play' && typeof stepRadio === 'function') stepRadio(dt); },
  pad: { sticks: true, btns: [{ k: 'b', label: 'B', sub: 'RUN' }, { k: 'a', label: 'A', sub: 'JUMP' }, { k: 'x', label: 'X', sub: 'HIT' }, { k: 'y', label: 'Y', sub: 'CAR' }, { k: 'lb', label: 'LB', sub: 'AIM' }, { k: 'rb', label: 'RB', sub: 'SWAP' }] } });
titleMenu();
window.__cc = { G: G, get P() { return P; }, get SV() { return SV; }, get PEDS() { return PEDS; }, get VEH() { return VEH; }, get CHUNKS() { return CHUNKS; }, startGame: startGame, persist: persist,
  flyTo: function (s) { if (!P) { startGame(false); } G.mode = 'fly'; G.fly = { x: s.x, y: s.y, z: s.z, yaw: s.yaw || 0, pit: s.pit || 0 }; flyStep(0); }, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick && KIT.tick(); update(1 / 60); } } };
