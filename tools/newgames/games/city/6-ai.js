/* ---------- the life of the city: people on the pavements, the traffic, the police and the wanted level ---------- */
var PEDS = [], PICKUPS = [];
var DISTCAST = { downtown: ['saba', 'potbelly', 'pulsar', 'spermaid', 'jessiah', 'bates'], redlight: ['t', 'bonjo', 'tb', 'natty', 'judge', 'fate', 'gimp', 'butcher', 'pusher'], cafe: ['amy', 'kaya', 'elden', 'joff', 'ali', 'harold', 'beeb', 'greebo'],
  park: ['clown', 'pieclown', 'strongman', 'acrobat', 'steve', 'steve'], suburb: ['lab', 'amy', 'harold'], industrial: ['gimp', 'butcher'], docks: ['beeb', 'butcher'], site: ['strongman'], cemetery: ['bride'], isles: ['spermaid'], labs: ['pusher'] };
function popTarget() { var dl = dayLight(G.time); return G.interior ? 0 : Math.round((14 + 14 * dl) * (G.chapter === 'zombie' ? 1.2 : 1)); }
function trafficTarget() { var dl = dayLight(G.time); return G.interior ? 0 : Math.round(10 + 12 * dl); }
function spawnPoint(minD, maxD, onRoad) {
  for (var k = 0; k < 12; k++) { var a = Math.random() * 6.283, d = rnd(minD, maxD), x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d; if (x < 10 || z < 10 || x > WX - 10 || z > WZ - 10) continue;
    var r = nearestRoad(x, z, 40); if (!r) continue; return r; }
  return null;
}
function makePed(o) {
  var p = { x: o.x, z: o.z, y: groundY(o.x, o.z), a: o.a || 0, vx: 0, vz: 0, vy: 0, ph: Math.random() * 6, sp: 0, hp: o.hp || 40, kind: o.kind || 'cit', who: o.who || null, rig: o.rig, state: o.state || 'walk', E: o.E || null, s: o.s || 0, back: o.back || false, side: o.side || 1, cool: 0, wpn: o.wpn || null, hostile: !!o.hostile, cop: !!o.cop, fear: 0, sayT: 0, id: Math.random(), keep: o.keep || 0, mission: o.mission || 0, home: o.home || null, money: o.money !== undefined ? o.money : Math.floor(rnd(2, 40)) };
  PEDS.push(p); return p;
}
function rigFor(kind, who) {
  if (who) return who === 'steve' ? 'steve' : rigOf(who);
  if (kind === 'cop') return Math.random() < 0.7 ? RIGS.copM : RIGS.copF; if (kind === 'zombie') return Math.random() < 0.5 ? RIGS.zombie : RIGS.zombie2; if (kind === 'robot') return RIGS.robot; if (kind === 'goon') return RIGS.goon;
  return CITIZENS[Math.floor(Math.random() * CITIZENS.length)];
}
function spawnPeds() {
  var want = popTarget(), have = PEDS.filter(function (p) { return !p.keep && !p.inVeh; }).length;
  for (var n = 0; n < 2 && have < want; n++) { var r = spawnPoint(45, 95); if (!r) return; var E = r.E, st = dAt(r.x, r.z).style, side = Math.random() < 0.5 ? 1 : -1, off = side * (E.w / 2 + 2.0), back = Math.random() < 0.5, pt = edgeAt(E, r.s, back, off);
    if (isWaterK(kAt(pt.x, pt.z)) || kAt(pt.x, pt.z) === K_BRIDGE && false) continue;
    var kind = 'cit', who = null, ch = G.chapter;
    if (ch === 'zombie' && dayLight(G.time) < 0.5 && Math.random() < 0.6) kind = 'zombie'; else if (ch === 'robot' && Math.random() < 0.35) kind = 'robot'; else if (ch === 'blum' && Math.random() < 0.25) kind = 'goon';
    else if (Math.random() < 0.14 && DISTCAST[st]) who = pick(DISTCAST[st]);
    var p = makePed({ x: pt.x, z: pt.z, a: pt.a, E: E, s: r.s, back: back, side: side, kind: kind, who: who, rig: rigFor(kind, who), hostile: kind !== 'cit', hp: kind === 'robot' ? 80 : kind === 'zombie' ? 60 : 40 });
    if (who === 'gimp' || who === 'butcher' || who === 'pusher') { p.gang = 1; p.wpn = Math.random() < 0.4 ? 'pistol' : null; }
    have++; }
}
function despawnFar() {
  PEDS = PEDS.filter(function (p) { if (p.keep || p.mission) return true; var d = dist2(p.x, p.z, P.x, P.z); if (p.dead && (p.deadT || 0) > 25) return false; return d < 150 * 150 || p.inVeh; });
  VEH = VEH.filter(function (v) { if (v === (P && P.veh) || v.owned || v.mission || v.keep) return true; var d = dist2(v.x, v.z, P.x, P.z); if (d > 280 * 280) { if (v.driver && v.driver.inVeh) { var i = PEDS.indexOf(v.driver); if (i >= 0) PEDS.splice(i, 1); } return false; } return true; });
}
/* ---------- people ---------- */
function stepPeds(dt) {
  for (var i = 0; i < PEDS.length; i++) { var p = PEDS[i]; if (p.inVeh) { p.x = p.inVeh.x; p.z = p.inVeh.z; p.y = p.inVeh.y; continue; }
    p.sayT = Math.max(0, p.sayT - dt); p.cool -= dt;
    if (p.dead) { p.deadT = (p.deadT || 0) + dt; p.vy -= 18 * dt; p.y += p.vy * dt; p.x += p.vx * dt * 0.5; p.z += p.vz * dt * 0.5; p.vx *= 0.9; p.vz *= 0.9; var gd = standY(p.x, p.z, p.y); if (p.y < gd) { p.y = gd; p.vy = 0; } continue; }
    if (p.downT > 0) { p.downT -= dt; p.vy -= 18 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= 0.92; p.vz *= 0.92; var g2 = standY(p.x, p.z, p.y); if (p.y < g2) { p.y = g2; p.vy = 0; } continue; }
    var far = dist2(p.x, p.z, P.x, P.z) > 120 * 120; if (far && !p.mission) continue;
    var tx = 0, tz = 0, spd = 1.25, d2p = Math.hypot(P.x - p.x, P.z - p.z);
    if (p.ctl) { p.ctl(p, dt); continue; } // missions and events drive their own people
    if (p.hostile || p.angry || (p.cop && SV.wanted > 0)) { // attack the player
      var chase = d2p < (p.cop ? 120 : 45); if (p.kind === 'zombie' || p.kind === 'robot' || p.kind === 'goon' || p.gang || p.angry || p.cop) {
        if (chase) { p.state = 'fight'; var tg = P.state === 'car' && P.veh ? P.veh : P; tx = tg.x - p.x; tz = tg.z - p.z; spd = p.kind === 'zombie' ? 1.6 + (dayLight(G.time) < 0.3 ? 1.8 : 0) : p.kind === 'robot' ? 2.6 : 4.2;
          var rng = p.wpn ? 16 : 1.3; if (d2p < rng && p.cool <= 0 && (P.state === 'foot' || p.wpn)) { p.cool = p.wpn ? WPN[p.wpn].rate * 3 + rnd(0, 0.6) : 1.1; p.atkT = 0.35; p.tgt = P;
            if (p.wpn) shoot(p, WPN[p.wpn]); else if (P.state === 'foot') { hurtPlayer(p.kind === 'zombie' ? 9 : p.kind === 'robot' ? 12 : 6, p); if (p.cop && SV.wanted <= 1 && P.sp < 1.5) bustTry(p); } }
          if (d2p < rng * 0.7) spd = 0; } else p.state = 'walk'; } }
    else if (p.fear > 0) { p.fear -= dt; p.state = 'flee'; tx = p.x - P.x; tz = p.z - P.z; spd = 5.5; if (Math.random() < dt * 0.3 && p.sayT <= 0) say(p, pick(SCREAMS)); }
    else if (p.state === 'idle' || p.state === 'event') { tx = 0; tz = 0; }
    else if (p.E) { var E = p.E, off = p.side * (E.w / 2 + 2.0); p.s += 1.25 * dt; if (p.s > E.len) { var nd = RN[p.back ? E.a : E.b], opts = nd.e.filter(function (e) { return e !== E.i; }); var ne = RE[opts.length ? pick(opts) : E.i]; p.back = ne.b === nd.i; p.E = ne; p.s = 0; }
      var pt = edgeAt(p.E, p.s, p.back, off); tx = pt.x - p.x; tz = pt.z - p.z; if (Math.hypot(tx, tz) > 6) { p.x = pt.x; p.z = pt.z; } spd = 1.25 + (p.id * 0.4); }
    var l = Math.hypot(tx, tz); if (l > 0.05 && spd > 0) { var mvx = tx / l * spd, mvz = tz / l * spd; p.vx += (mvx - p.vx) * Math.min(1, dt * 6); p.vz += (mvz - p.vz) * Math.min(1, dt * 6); p.a += angDiff(p.a, Math.atan2(p.vx, p.vz)) * Math.min(1, dt * 8); } else { p.vx *= 0.8; p.vz *= 0.8; if (p.state === 'fight') p.a += angDiff(p.a, Math.atan2(P.x - p.x, P.z - p.z)) * Math.min(1, dt * 8); }
    var nx = p.x + p.vx * dt, nz = p.z + p.vz * dt, c = collide(nx, nz, 0.3, p.y, 1.7); nx += c.x; nz += c.z; if (!isWaterK(kAt(nx, nz))) { p.x = nx; p.z = nz; } vehPush(p, 0.3);
    p.y = standY(p.x, p.z, p.y + 0.5); p.sp = Math.hypot(p.vx, p.vz); p.ph += dt * p.sp * 2.4; p.atkT = Math.max(0, (p.atkT || 0) - dt);
    if (p.sayT <= 0 && d2p < 6 && Math.random() < dt * 0.08 && P.state === 'foot' && !p.hostile) say(p, lineFor(p));
  }
}
var SCREAMS = ['Aaargh!', 'Not again!', 'Somebody call Saba!', 'My loads!', 'Run!', 'This city, man!', 'Get away from me!', 'Mummy!'];
var GREETS = ['Alright, Cumhead?', 'Nice drip, mate.', 'Is that a Hunter Seriph shirt?', 'Watch where you are walking, droplet.', 'I saw you on Twitch last night.', 'Have you tried the Cumpuccino?', 'Mind the cream, it is slippy.', 'You owe me a fiver.', 'Lovely weather for it.', 'Ejaculand is open late tonight.', 'Pineapple on pizza? Disgusting.', 'Steve waved at me!', 'Hitless runs only.'];
function lineFor(p) { if (p.who && CASTLINES[p.who]) return pick(CASTLINES[p.who]); if (p.kind === 'zombie') return 'Braaains... and cream...'; if (p.kind === 'robot') return 'COMPLY. CLEAN. COMPLY.'; if (p.kind === 'goon') return 'All hail Blumhead.'; return pick(GREETS); }
var CASTLINES = { saba: ['Hitless runs only. Take a look, my friend.'], amy: ['Mild, hot or dynamite?'], joff: ['Pineapple belongs on pizza. Fight me.'], beeb: ['Sit down, lad. First one\'s always warm.'], kaya: ['Kaya\'s on the coffee!'], elden: ['Elden\'s on the grill!'],
  pulsar: ['Just vibes, friend. Free of charge.'], potbelly: ['Cabinets are free, kid. Play all you like.'], spermaid: ['Sweetie! Even down here I keep a little stall.'], greebo: ['Fresh cream pies. Don\'t ask what\'s in them.'], ali: ['Nuggets? Garlic bread? Everything is better with garlic.'],
  harold: ['Potions? Tea? Same thing, really. Sit, sit!'], t: ['Come in, darling. I\'ll get the doors.'], bonjo: ['Welcome, welcome. Let me get the door.'], jessiah: ['An empty stomach makes a hollow man. Eat.'], natty: ['A blade without a bite is merely a stick.'], judge: ['Light or shadow. Both have a price.'],
  fate: ['The deck was never yours. Neither was your fate.'], bates: ['One must clear one\'s head before one proceeds.'], lab: ['Shithead Laboozie, at your service.'], steve: ['...'], clown: ['Honk honk!'], tb: [] };
function say(p, txt) { if (!txt) { if (p.who === 'tb') txt = pick(TBQUOTES2); else return; } p.sayT = 3.2; p.said = txt; }
var TBQUOTES2 = ['Fuck muck', 'Shithead Laboozie', 'let me tighten that kynodesme', 'dick skin', 'whyma wimina', 'suck your own and fuck your own', 'suck me fuck me suck me fuck me', "I got lotion on my dick I'm out here shooting my shit I'm free man for real!", 'Old geezer, Prick teaser', 'I made muckies...', "a sissy doesn't deserve pleasure, a sissy is somebody's play thing", 'you shoot real hard huh?', 'Im a fuckin piggy', "who's ready for shithead pudding", 'holy shit!', 'Cock rinse', 'you suck, ill spray', "where the fuck do you think you're goin? Prick!", 'Oh god im pushing piss out of my dick', 'im so fucked right now', "who's ready for sissification? I'll make you pretty, so pretty...", 'Im a tucker fucker!', "you'll make a good sissy"];
function hurtPed(p, dmg, by, dir, car) {
  if (p.dead || p.god) return; p.hp -= dmg; p.flash = 0.12; if (dir) { p.vx += dir[0] * Math.min(8, dmg * 0.15); p.vz += dir[2] * Math.min(8, dmg * 0.15); }
  if (by === P) { if (p.cop) crime(p.hp <= 0 ? 'killcop' : 'hitcop', p.x, p.z); else if (!p.hostile || p.kind === 'cit') crime(p.hp <= 0 ? 'kill' : 'assault', p.x, p.z); if (!p.hostile && !p.cop) { if (Math.random() < 0.3 || p.gang) p.angry = 1; else p.fear = 12; } }
  for (var k = 0; k < 3; k++) addFx({ k: p.kind === 'robot' ? 'spark' : 'blood', x: p.x, y: p.y + 1.2, z: p.z, vx: rnd(-2, 2), vy: rnd(1, 3), vz: rnd(-2, 2), life: 0.6 });
  if (p.hp <= 0) { p.dead = 1; p.deadT = 0; p.vy = car ? 5 : 2; p.state = 'dead'; if (p.onDie) p.onDie(p, by); if (by === P) { SV.stats.kills = (SV.stats.kills || 0) + 1; if (p.money > 0) PICKUPS.push({ k: 'cash', x: p.x, z: p.z, y: p.y, v: p.money, life: 30 }); if (p.wpn && Math.random() < 0.5) PICKUPS.push({ k: 'wpn', w: p.wpn, x: p.x + 0.5, z: p.z, y: p.y, life: 30 }); } sfx.play('hurt'); }
  else if (dmg > 15 && !car) { p.downT = 0; }
  if (car && p.hp > 0) { p.downT = 1.5; p.vy = 3; }
}
function makeNoise(x, z, r, by) { PEDS.forEach(function (p) { if (p.dead || p.hostile || p.cop || p.ctl) return; if (dist2(p.x, p.z, x, z) < r * r * 0.5) p.fear = 10; }); if (by === P) crime('shots', x, z); }
/* ---------- traffic ---------- */
function spawnTraffic() {
  var have = VEH.filter(function (v) { return v.ai && !v.ai.cop; }).length, want = trafficTarget();
  if (have >= want) return; var r = spawnPoint(80, 170); if (!r) return; var E = r.E; if (E.len < 20) return;
  var back = Math.random() < 0.5, lane = E.w / 4, pt = edgeAt(E, r.s, back, lane), k = kAt(pt.x, pt.z); if (k !== K_ROAD && k !== K_BRIDGE) return;
  for (var i = 0; i < VEH.length; i++) if (dist2(VEH[i].x, VEH[i].z, pt.x, pt.z) < 12 * 12) return;
  // not right in front of the camera
  var dx = pt.x - CAM.x, dz = pt.z - CAM.z, f = R3.cam.fwd, d = Math.hypot(dx, dz); if (d < 90 && (dx * f[0] + dz * f[2]) / d > 0.5) return;
  var st = dAt(pt.x, pt.z).style, type = pick(TRAFFICTYPES); if (st === 'park' && Math.random() < 0.4) type = 'icecream'; if (st === 'industrial' || st === 'docks') type = Math.random() < 0.5 ? 'truck' : 'van'; if (st === 'cemetery' && Math.random() < 0.5) type = 'hearse';
  if (G.chapter === 'robot' && Math.random() < 0.3) type = 'van';
  var v = makeVeh(type, pt.x, pt.z, pt.a); v.ai = { E: E, s: r.s, back: back, lane: lane, want: (E.w > 11 ? 20 : 13) + rnd(-2, 3), wait: 0 };
  var dr = makePed({ x: v.x, z: v.z, kind: 'cit', rig: rigFor('cit') }); dr.inVeh = v; v.driver = dr; v.sp = v.ai.want * 0.7; v.vx = Math.sin(v.a) * v.sp; v.vz = Math.cos(v.a) * v.sp;
}
function stepTraffic(dt) {
  for (var i = 0; i < VEH.length; i++) { var v = VEH[i]; if (v === (P && P.veh)) continue;
    if (!v.ai || !v.driver || v.dead) { stepVehicle(v, { thr: 0, brk: v.t.cls === 'heli' ? 0 : 1, steer: 0 }, dt); continue; }
    if (dist2(v.x, v.z, P.x, P.z) > 260 * 260 && !v.ai.cop) continue;
    if (v.ai.cop) { copDrive(v, dt); continue; }
    if (v.ai.race || v.ai.manual) continue; // raced or driven by a mission or an event
    if (v.driver.fear > 0 || v.ai.flee) { // drive off fast, anywhere
      v.ai.want = 26; }
    var A = v.ai, E = A.E; A.s += Math.max(0, v.sp) * dt;
    if (A.s > E.len - 2) { var nd = RN[A.back ? E.a : E.b], opts = nd.e.filter(function (e) { return e !== E.i; }), ne = RE[opts.length ? pick(opts) : E.i]; A.back = ne.b === nd.i; A.E = ne; A.s = Math.max(0, A.s - E.len); A.lane = ne.w / 4; E = ne; A.want = (E.w > 11 ? 20 : 13) + rnd(-2, 3); }
    var look = 5 + Math.abs(v.sp) * 0.45, tp = edgeAt(E, Math.min(E.len, A.s + look), A.back, A.lane), da = angDiff(v.a, Math.atan2(tp.x - v.x, tp.z - v.z)), steer = clamp(da * 1.6, -1, 1);
    // something in the way? slow and stop
    var want = A.want * (Math.abs(da) > 0.5 ? 0.55 : 1), f = [Math.sin(v.a), Math.cos(v.a)], block = 99;
    function ahead(x, z, r) { var dx = x - v.x, dz = z - v.z, fwd = dx * f[0] + dz * f[1], lat = Math.abs(dx * f[1] - dz * f[0]); if (fwd > 0 && fwd < 22 && lat < r) block = Math.min(block, fwd); }
    for (var j = 0; j < VEH.length; j++) { var o = VEH[j]; if (o !== v) ahead(o.x, o.z, 1.8); }
    if (P.state === 'foot') ahead(P.x, P.z, 1.4); PEDS.forEach(function (p) { if (!p.inVeh && !p.dead && dist2(p.x, p.z, v.x, v.z) < 400) ahead(p.x, p.z, 1.2); });
    if (block < 99) want = Math.min(want, Math.max(0, (block - v.t.len * 0.6 - 2.5) * 0.9));
    if (A.bump > 0) { A.bump -= dt; want = 0; if (A.bump <= 0 && Math.random() < 0.4 && v.driver) { v.driver.angry = 0; honk(v); } }
    var thr = v.sp < want ? clamp((want - v.sp) * 0.4, 0, 1) : 0, brk = v.sp > want + 1 ? clamp((v.sp - want) * 0.3, 0, 1) : 0;
    stepVehicle(v, { thr: thr, brk: brk, steer: steer }, dt);
    if (block < 6 && v.sp < 0.5) { A.wait += dt; if (A.wait > 4 && Math.random() < dt * 0.5) honk(v); } else A.wait = 0;
  }
}
function honk(v) { if (dist2(v.x, v.z, P.x, P.z) < 50 * 50) sfx.play('horn'); }
/* ---------- the police and the wanted level ---------- */
var CRIMES = { steal: 0.6, copcar: 1.2, assault: 0.5, kill: 1.0, hitcop: 1.2, killcop: 2.0, shootcop: 1.2, shots: 0.4, ram: 0.3, carattack: 0.4, rob: 2.0, speed: 0.1 };
function crime(k, x, z, mul) {
  if (G.noCops) return; var heat = (CRIMES[k] || 0.3) * (mul || 1), seen = false;
  PEDS.forEach(function (p) { if (p.cop && !p.dead && dist2(p.x, p.z, x, z) < 50 * 50) seen = true; }); VEH.forEach(function (v) { if (v.t.cop && v.driver && dist2(v.x, v.z, x, z) < 60 * 60) seen = true; });
  if (!seen && heat < 1) { if (Math.random() > heat * 0.6) return; } // somebody may have phoned it in
  SV.heat = (SV.heat || 0) + heat; var lv = SV.heat >= 9 ? 5 : SV.heat >= 6 ? 4 : SV.heat >= 3.6 ? 3 : SV.heat >= 1.6 ? 2 : SV.heat >= 0.5 ? 1 : 0; if (lv > SV.wanted) { SV.wanted = lv; G.lostT = 0; sfx.play('alarm'); }
  G.copSeen = 0;
}
function stepWanted(dt) {
  if (SV.wanted <= 0) { SV.heat = Math.max(0, (SV.heat || 0) - dt * 0.05); return; }
  var seen = false; PEDS.forEach(function (p) { if (p.cop && !p.dead && dist2(p.x, p.z, P.x, P.z) < 40 * 40) seen = true; }); VEH.forEach(function (v) { if (v.t.cop && v.driver && !v.dead && dist2(v.x, v.z, P.x, P.z) < 70 * 70) seen = true; });
  if (seen) G.lostT = 0; else { G.lostT = (G.lostT || 0) + dt; if (G.lostT > 12 + SV.wanted * 5) { SV.wanted--; SV.heat = [0, 0.5, 1.6, 3.6, 6, 9][SV.wanted]; G.lostT = 0; if (SV.wanted === 0) { toast('You lost them.'); } } }
  // keep enough police coming
  var cops = VEH.filter(function (v) { return v.ai && v.ai.cop && !v.dead; }).length, want = [0, 1, 2, 3, 4, 6][SV.wanted];
  if (cops < want && Math.random() < dt * 0.5) spawnCop();
  if (SV.wanted >= 3 && !VEH.some(function (v) { return v.ai && v.ai.copHeli && !v.dead; }) && Math.random() < dt * 0.15) spawnCopHeli();
}
function spawnCop() { var r = spawnPoint(90, 160); if (!r) return; var pt = edgeAt(r.E, r.s, false, 0), v = makeVeh(SV.wanted >= 5 ? 'muscle' : 'police', pt.x, pt.z, Math.atan2(P.x - pt.x, P.z - pt.z), { col: 0 }); v.t = v.type === 'muscle' ? VT.muscle : VT.police; v.ai = { cop: 1 }; v.siren = 1;
  var dr = makePed({ x: v.x, z: v.z, kind: 'cop', cop: 1, rig: rigFor('cop'), hp: 60, wpn: SV.wanted >= 2 ? (SV.wanted >= 4 ? 'smg' : 'pistol') : null }); dr.inVeh = v; v.driver = dr; v.keep = 1; }
function spawnCopHeli() { var a = Math.random() * 6.28, v = makeVeh('heli', P.x + Math.sin(a) * 150, P.z + Math.cos(a) * 150, 0, { col: 2 }); v.y = groundY(v.x, v.z) + 60; v.ground = 0; v.ai = { cop: 1, copHeli: 1 }; v.keep = 1; var dr = makePed({ x: v.x, z: v.z, kind: 'cop', cop: 1, rig: rigFor('cop'), hp: 60, wpn: 'rifle' }); dr.inVeh = v; v.driver = dr; }
function copDrive(v, dt) {
  var tg = P.state === 'car' && P.veh ? P.veh : P, dx = tg.x - v.x, dz = tg.z - v.z, d = Math.hypot(dx, dz);
  if (SV.wanted <= 0) { v.ai.cop = 0; v.ai.flee = 1; v.keep = 0; var r = nearestRoad(v.x, v.z, 40); if (r) { v.ai.E = r.E; v.ai.s = r.s; v.ai.back = false; v.ai.lane = r.E.w / 4; v.ai.want = 14; } v.siren = 0; return; }
  if (v.ai.copHeli) { var hy = groundY(tg.x, tg.z) + 26; stepHeli(v, { up: v.y < hy, down: v.y > hy + 6, pitch: d > 30 ? -0.8 : 0, yaw: clamp(angDiff(v.a, Math.atan2(dx, dz)) * 2, -1, 1) }, dt);
    var dr = v.driver; if (dr && d < 90 && SV.wanted >= 4) { dr.cool -= dt; if (dr.cool <= 0) { dr.cool = 0.5; dr.x = v.x; dr.y = v.y - 1; dr.z = v.z; dr.a = Math.atan2(dx, dz); dr.tgt = P; shoot(dr, WPN.rifle); } }
    G.searchlight = { x: tg.x, z: tg.z }; return; }
  var steer = clamp(angDiff(v.a, Math.atan2(dx, dz)) * 2, -1, 1), thr = d > 12 ? 1 : 0.2, brk = d < 8 ? 1 : 0;
  if (v.sp < 1 && (v.ai.stuck = (v.ai.stuck || 0) + dt) > 2.5) { v.ai.rev = 1.2; v.ai.stuck = 0; } if (v.ai.rev > 0) { v.ai.rev -= dt; thr = 0; brk = 1; steer = -steer; }
  stepVehicle(v, { thr: thr, brk: brk, steer: steer }, dt);
  // close and stopped: the officers get out
  if (d < 14 && Math.abs(v.sp) < 2 && v.driver && v.driver.inVeh && P.state === 'foot') { var o = v.driver; o.inVeh = null; o.x = v.x + Math.cos(v.a) * 2; o.z = v.z - Math.sin(v.a) * 2; o.y = v.y; v.driver = null; v.ai.parked = 1; o.state = 'fight'; }
}
function bustTry(cop) { if (P.state !== 'foot' || G.cut) return; G.bustT = (G.bustT || 0) + 1; if (G.bustT >= 3) { G.bustT = 0; busted(); } }
/* ---------- pickups ---------- */
function stepPickups(dt) {
  PICKUPS = PICKUPS.filter(function (q) { if (q.life !== undefined) { q.life -= dt; if (q.life <= 0) return false; }
    if (P.state === 'foot' && dist2(P.x, P.z, q.x, q.z) < 1.4 && Math.abs(P.y - q.y) < 2) { takePickup(q); return false; }
    if (P.state === 'car' && P.veh && dist2(P.veh.x, P.veh.z, q.x, q.z) < 12 && (q.k === 'cash' || q.k === 'package' || (q.k === 'mission' && !q.r))) { takePickup(q); return false; } return true; });
}
function takePickup(q) {
  if (q.k === 'cash') { money(q.v); } else if (q.k === 'health') { P.hp = Math.min(SV.maxHp, P.hp + 50); toast('Cum Cracker: +50 health'); } else if (q.k === 'armour') { P.armour = 100; toast('A fresh condom: full armour'); }
  else if (q.k === 'wpn') { giveWeapon(q.w, WPN[q.w].ammoN || 0); toast('Picked up ' + WPN[q.w].n); } else if (q.fn) q.fn(q);
  sfx.play('coin');
}
function giveWeapon(w, ammo) { SV.weapons[w] = 1; var W0 = WPN[w]; if (W0.ammo) SV.ammo[W0.ammo] = (SV.ammo[W0.ammo] || 0) + (ammo || 0); }
function money(n) { SV.money = Math.max(0, (SV.money || 0) + n); G.moneyPop = 1; if (n > 0) SV.stats.earned = (SV.stats.earned || 0) + n; }
