/* =====================================================================================================
   THE RACE: karts, driving, drifting, items, the AI, laps and places.
   ===================================================================================================== */
var GRAV = 26, TOP = 27, KR = 0.85; // KR: a kart's radius
var RACE = null;
function newKart(ch, slot, ai, cls) {
  var c = CH[ch], st = c.st;
  return { ch: ch, c: c, slot: slot, ai: ai, x: 0, z: 0, y: 0, vy: 0, yaw: 0, spd: 0, air: false, seg: -1, lat: 0, lap: 0, half: true, prog: 0, place: slot + 1,
    top: TOP * cls.spd * (0.9 + 0.035 * st[0]), acc: 13 * (0.72 + 0.11 * st[1]), turn: 1.75 * (0.82 + 0.07 * st[2]), wt: 0.6 + 0.2 * st[3],
    item: null, itemN: 0, roul: 0, boostT: 0, boostK: 1, drift: 0, driftT: 0, driftLvl: 0, hopT: 0, spinT: 0, squashT: 0, shieldT: 0, nadoT: 0, gooT: 0, invT: 0, splatT: 0, revT: 0, tinyT: 0, hicT: 0, petT: 0, petCd: 0, floatT: 0, floatY: 0, magT: 0, magCd: 0, orbit: 0, wobT: 0,
    drops: 0, kx: 0, kz: 0, steer: 0, steerVis: 0, wrongT: 0, done: false, time: 0, laps: [], lapStart: 0, trick: 0, trickT: 0, bumpT: 0, stuckT: 0,
    lane: (Math.random() - 0.5) * 0.9, laneT: 0, skill: 1, itemT: 0, said: 0, tag: c.n };
}
/* ---------- starting a race ---------- */
function startRace(o) {
  // o: { course, cls, player: charId, rivals: [charIds], mode: 'gp' | 'race' | 'tt' }
  var def = COURSES[o.course]; if (o.defMod) def = o.defMod(def); var cls = CLASSES.filter(function (c) { return c.id === o.cls; })[0] || CLASSES[0];
  var T = buildTrack(def), TH = THEMES[def.theme];
  var A = Atlas(T.N * 7 + def.hw); THEME_TILES(A, TH, def); TH.tiles(A, def);
  var m = buildWorld(T, TH, A), B = Builder(T, A, m); if (TH.scen) TH.scen(B, def);
  // item boxes, drops, boost pads and ramps
  var boxes = [], drops = [], pads = [], ramps = [];
  (def.boxes || []).forEach(function (f) { var q = T.at(f); [-0.6, -0.2, 0.2, 0.6].forEach(function (k) { var p = T.pos(q.i, k * def.hw); boxes.push({ x: p.x, z: p.z, y: q.y, t: 0, ph: Math.random() * 6 }); }); });
  (def.drops || []).forEach(function (d) { var i0 = T.idx(d[0]); for (var k = 0; k < d[2]; k++) { var p = T.pos(i0 + k * 2, d[1] * def.hw * 0.7); drops.push({ x: p.x, z: p.z, y: p.y, t: 0 }); } });
  (def.boosts || []).forEach(function (b) { var q = T.at(b[0]), lat = b[1] * def.hw * 0.6, i0 = q.i; pads.push({ i: i0, lat: lat, len: 3 }); for (var k = 0; k < 3; k++) { var a = T.S[(i0 + k) % T.N], c2 = T.S[(i0 + k + 1) % T.N]; var P = function (s, l) { return [s.x + s.nx * (lat + l), s.y + 0.04, s.z + s.nz * (lat + l)]; }; m.quad(P(a, 1.8), P(c2, 1.8), P(c2, -1.8), P(a, -1.8), [0, 1, 0, 0, 1, 0, 1, 1], A.tile('arrow'), mulc(def.light, 1.2), -1.5); } });
  (def.ramps || []).forEach(function (r) { var q = T.at(r[0]); ramps.push({ i: q.i, k: r[1] }); buildRamp(m, T, A, q.i, def); });
  (def.belts || []).forEach(function (b) { var i0 = T.idx(b[0]), n = Math.round(b[1] * T.N); for (var k = 0; k < n; k++) { var a = T.S[(i0 + k) % T.N], c3 = T.S[(i0 + k + 1) % T.N]; var P2 = function (s, l) { return [s.x + s.nx * l, s.y + 0.03, s.z + s.nz * l]; }; m.quad(P2(a, def.hw), P2(c3, def.hw), P2(c3, -def.hw), P2(a, -def.hw), [0, k, 0, k + 1, def.hw / 2, k + 1, def.hw / 2, k], A.tile('belt'), mulc(def.light, 1), -2); } });
  bakeLights(m, B.lights); m.upload();
  var sky = R3.texture(paintSky(def.sky, T.N)), atlas = R3.texture(A.canvas, true);
  var karts = [], roster = [o.player].concat(o.rivals);
  var humans = o.humans || [0], meIdx = o.meIdx || 0;
  roster.forEach(function (ch, i) { var k = newKart(ch, i, humans.indexOf(i) < 0, cls); k.idx = i; if (o.names && o.names[i]) k.tag = o.names[i]; if (o.net === 'host' && !k.ai && i !== meIdx) k.remote = true; if (o.net === 'client' && i !== meIdx) { k.puppet = true; k.ai = false; } karts.push(k); });
  // the grid: two by two behind the line, player at the back of the pack in a Grand Prix's first race (or where they finished last time)
  var order = o.grid || karts.map(function (k, i) { return i; }).reverse();
  order.forEach(function (ki, g) { var k = karts[ki], row = Math.floor(g / 2), col = g % 2 ? -1 : 1, p = T.pos(T.N - 3 - row * 3, col * def.hw * 0.4); k.x = p.x; k.z = p.z; k.y = p.y; var q = T.S[(T.N - 3 - row * 3 + T.N) % T.N]; k.yaw = Math.atan2(q.tz, q.tx); k.seg = q.i; k.lap = 0; k.half = true; k.prog = q.i; });
  karts.forEach(function (k) { if (k.ai) k.skill = cls.ai * (0.97 + Math.random() * 0.05); });
  RACE = { o: o, def: def, cls: cls, T: T, TH: TH, A: A, mesh: m, B: B, sky: sky, atlas: atlas, karts: karts, all: karts, me: karts[meIdx], net: o.net || null, humans: humans, boxes: boxes, drops: drops, pads: pads, ramps: ramps,
    proj: [], traps: [], fx: [], goo: B.goo || [], bumpers: B.bumpers || [], t: 0, phase: 'intro', phaseT: 0, count: 3, laps: def.laps, finalLap: false, tt: o.mode === 'tt', ev: o.ev || null, camYaw: karts[meIdx].yaw, cam: null, lapBanner: 0, bannerTxt: '', places: [], shake: 0, msg: null, said: [], gooRain: 0, flash: 0 };
  if (o.laps) RACE.laps = o.laps;
  if (TH.init) TH.init(RACE);
  if (RACE.tt) { RACE.karts = karts.filter(function (k, i) { return humans.indexOf(i) >= 0; }); RACE.ghosts = RACE.karts.length > 1; if (!o.noCuppa) RACE.karts.forEach(function (k) { k.item = 'cuppa3'; k.itemN = 3; }); RACE.boxes = []; }
  if (RACE.ev && typeof evInit === 'function') evInit(RACE);
  music.play(def.song); return RACE;
}
function buildRamp(m, T, A, i0, def) { // a wedge on the road: up over a few samples, then a sheer drop
  var L = def.light;
  for (var k = 0; k < 3; k++) {
    var a = T.S[(i0 - 3 + k + T.N) % T.N], b = T.S[(i0 - 2 + k + T.N) % T.N], h0 = k * 0.4, h1 = (k + 1) * 0.4;
    function P(s, l, h) { return [s.x + s.nx * l, s.y + h + 0.03, s.z + s.nz * l]; }
    m.quad(P(a, def.hw * 0.75, h0), P(b, def.hw * 0.75, h1), P(b, -def.hw * 0.75, h1), P(a, -def.hw * 0.75, h0), [0, 1, 0, 0, def.hw * 1.5 / 3, 0, def.hw * 1.5 / 3, 1], A.tile('ramp'), mulc(L, 1.15));
    [1, -1].forEach(function (sd) { m.quad(P(a, sd * def.hw * 0.75, 0), P(b, sd * def.hw * 0.75, 0), P(b, sd * def.hw * 0.75, h1), P(a, sd * def.hw * 0.75, h0), [0, 0.5, 1, 0.5, 1, 0, 0, 0], A.tile('trim'), mulc(L, 0.7)); });
  }
  var e = T.S[i0]; function Q(l, h) { return [e.x + e.nx * l, e.y + h + 0.03, e.z + e.nz * l]; }
  m.quad(Q(def.hw * 0.75, 0), Q(-def.hw * 0.75, 0), Q(-def.hw * 0.75, 1.2), Q(def.hw * 0.75, 1.2), [0, 0.5, 2, 0.5, 2, 0, 0, 0], A.tile('trim'), mulc(L, 0.6));
}

/* ---------- input for the player ---------- */
function playerInput() {
  var s = KIT.stick(0), gp = KIT.gamepad, trig = function (n) { return gp && gp.buttons && gp.buttons[n] ? gp.buttons[n].value : 0; };
  var steer = s.on ? s.x : 0; if (!s.on) steer = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0);
  var brake = KIT.held('b') || KIT.held('down') || trig(6) > 0.3, gas = KIT.held('a') || KIT.held('up') || trig(7) > 0.3 || (SV.auto && !brake);
  return { steer: steer, gas: gas && !brake, brake: brake, drift: KIT.held('x') || KIT.held('rb') || KIT.held('run'), item: KIT.pressed('y') || KIT.pressed('lb'), back: s.on ? s.y > 0.5 : KIT.held('down'), fwd: s.on ? s.y < -0.5 : KIT.held('up') };
}

/* ---------- one kart, one step ---------- */
function driveKart(k, inp, dt) {
  var R = RACE, T = R.T, def = R.def, g = GRAV * (def.grav || 1);
  var loc = T.locate(k.x, k.z, k.seg), onRoad = Math.abs(loc.lat) <= def.hw + KERB * 0.6;
  if (k.done && !k.ai) { inp = aiInput(k, dt); } // after the line the AI takes over your kart
  var top = k.top * (1 + 0.012 * k.drops) * k.boostK, acc = k.acc;
  if (k.ai) top *= k.skill * rubber(k);
  if (!onRoad && k.boostT <= 0 && k.nadoT <= 0) top *= def.creamOff ? 0.45 : 0.55;
  if (k.boostT > 0) { top *= 1.42; acc *= 3; k.boostT -= dt; }
  if (k.nadoT > 0) { top *= 1.25; acc *= 2.5; k.nadoT -= dt; }
  if (k.gooT > 0) { top *= 0.62; k.gooT -= dt; }
  if (k.squashT > 0) { top *= 0.5; k.squashT -= dt; }
  if (k.splatT > 0) { top *= 0.86; k.splatT -= dt; }
  if (k.tinyT > 0) { top *= 0.8; k.tinyT -= dt; }
  if (k.revT > 0) { k.revT -= dt; if (k.ai) top *= 0.85; }
  if (k.wobT > 0) k.wobT -= dt;
  if (k.hicT > 0) { k.hicT -= dt; k.hicN = (k.hicN || 0) - dt; if (k.hicN <= 0 && !k.air) { k.hicN = 0.75; k.vy = 4.5; k.air = true; k.drift = 0; k.spd *= 0.93; if (!k.ai) sfx.play('jump'); } }
  if (k.floatT > 0) { k.floatT -= dt; top *= 1.12; }
  k.floatY += ((k.floatT > 0 ? 3.2 : 0) - k.floatY) * Math.min(1, dt * 4);
  if (k.petT > 0) k.petT -= dt; if (k.petBite > 0) k.petBite -= dt;
  if (k.magT > 0) k.magT -= dt;
  if (!onRoad && k.floatT > 0) top /= def.creamOff ? 0.45 : 0.55;
  if (k.shieldT > 0) k.shieldT -= dt; if (k.invT > 0) k.invT -= dt; if (k.bumpT > 0) k.bumpT -= dt;
  var control = k.spinT <= 0 && R.phase === 'go';
  if (k.spinT > 0) { k.spinT -= dt; k.spd *= Math.pow(0.15, dt); k.drift = 0; k.driftT = 0; }
  // speed
  if (control) {
    if (inp.gas) k.spd += (k.spd < top ? acc * (1 - Math.max(0, k.spd) / (top * 1.05)) * (k.spd < 0 ? 3 : 1) : -acc * 0.6) * dt;
    else if (inp.brake) k.spd -= (k.spd > 0 ? 34 : 9) * dt;
    else k.spd -= Math.sign(k.spd) * Math.min(Math.abs(k.spd), 7 * dt);
    if (k.spd > top && !inp.brake) k.spd = Math.max(top, k.spd - 22 * dt);
    if (k.spd < -top * 0.32) k.spd = -top * 0.32;
  } else if (R.phase !== 'go') { // the start: hold gas as GO lands for a boost (too early and you wheelspin)
    if (inp.gas) k.rev = (k.rev || 0) + dt; else k.rev = 0;
  }
  // steering and drifting
  var st = inp.steer * (k.revT > 0 && !k.ai ? -1 : 1) + (k.wobT > 0 ? Math.sin(R.t * 23 + k.slot) * 0.5 : 0) + (k.splatT > 0 && k.ai ? Math.sin(R.t * 7 + k.slot) * 0.35 : 0), sv = Math.min(1, Math.abs(k.spd) / 9) * (k.spd < 0 ? -1 : 1), rate = k.turn * (1 - 0.22 * Math.max(0, k.spd) / Math.max(1, k.top));
  if (control && !k.air && inp.drift && !k.driftHeld && Math.abs(st) > 0.3 && k.spd > 10) { k.drift = st > 0 ? 1 : -1; k.driftT = 0; k.driftLvl = 0; k.hopT = 0.18; }
  if (control && k.air && inp.drift && !k.driftHeld && k.trickable) { k.trick = 1; k.trickable = false; k.trickT = 0.45; sfx.play('jump'); }
  k.driftHeld = inp.drift;
  if (k.drift && (!inp.drift || k.spd < 6 || !control)) { // let go: the boost for how long you held it
    if (k.driftLvl > 0 && control) { k.boostT = Math.max(k.boostT, [0, 0.55, 1.0, 1.5][k.driftLvl]); sfx.play(k.driftLvl >= 2 ? 'power' : 'select'); if (!k.ai) R.flash = 0.06; }
    k.drift = 0; k.driftT = 0; k.driftLvl = 0;
  }
  var yawRate;
  if (k.drift) {
    var bias = k.drift * (0.62 + 0.42 * st * k.drift); yawRate = bias * rate * 1.18;
    k.driftT += dt * (0.6 + 0.6 * Math.abs(st)); var lv = k.driftT > 2.6 ? 3 : k.driftT > 1.6 ? 2 : k.driftT > 0.75 ? 1 : 0;
    if (lv > k.driftLvl) { k.driftLvl = lv; if (!k.ai) sfx.play('tick'); }
  } else yawRate = st * rate * sv;
  if (k.air) yawRate *= 0.5;
  if (k.gooT > 0) { yawRate *= 0.45; k.kx += -Math.sin(k.yaw) * Math.sin(R.t * 3 + k.slot) * 9 * dt; k.kz += Math.cos(k.yaw) * Math.sin(R.t * 3 + k.slot) * 9 * dt; } // goo: the kart slides about
  if (control || k.done) k.yaw += yawRate * dt;
  if (k.spinT > 0) k.spinA = (k.spinA || 0) + dt * 16; else k.spinA = 0;
  k.steer = st; k.steerVis += (st - k.steerVis) * Math.min(1, dt * 10);
  // move: along the heading, plus a little outward slide in a drift, plus knocks from bumps
  var vx = Math.cos(k.yaw) * k.spd, vz = Math.sin(k.yaw) * k.spd;
  if (k.drift) { vx += -Math.sin(k.yaw) * -k.drift * k.spd * 0.09; vz += Math.cos(k.yaw) * -k.drift * k.spd * 0.09; }
  k.x += (vx + k.kx) * dt; k.z += (vz + k.kz) * dt; k.kx *= Math.pow(0.04, dt); k.kz *= Math.pow(0.04, dt);
  // walls
  loc = T.locate(k.x, k.z, k.seg); var lim = T.edge - KR;
  if (Math.abs(loc.lat) > lim) {
    var over = Math.abs(loc.lat) - lim, sd = Math.sign(loc.lat), n = loc.s; k.x -= n.nx * sd * over; k.z -= n.nz * sd * over;
    var into = Math.cos(k.yaw) * n.nx * sd + Math.sin(k.yaw) * n.nz * sd; // how square on we hit it
    if (into > 0.05) { k.spd *= 1 - 0.55 * into; var ty = Math.atan2(n.tz, n.tx), dyaw = angDiff(ty, k.yaw); if (Math.abs(dyaw) > Math.PI / 2) ty += Math.PI; k.yaw += angDiff(ty, k.yaw) * 0.3; if (k.bumpT <= 0 && k.spd > 7) { k.bumpT = 0.3; if (!k.ai || near(k)) sfx.play('land'); } }
    k.kx -= n.nx * sd * 3; k.kz -= n.nz * sd * 3; loc = T.locate(k.x, k.z, k.seg);
  }
  // height: follow the road, or fly off ramps and crests
  var gy = loc.y + (k.hopT > 0 ? 0 : 0);
  if (k.hopT > 0) k.hopT -= dt;
  if (k.air) {
    k.vy -= g * dt; k.y += k.vy * dt;
    if (k.y <= gy) { k.y = gy; k.air = false; if (k.vy < -6) { if (!k.ai || near(k)) sfx.play('land'); R.fx.push({ k: 'dust', x: k.x, y: k.y, z: k.z, t: 0.4 }); } k.vy = 0; if (k.trick) { k.trick = 0; k.boostT = Math.max(k.boostT, 0.8); if (!k.ai) sfx.play('power'); } k.trickable = false; }
  } else {
    var wantVy = (gy - k.y) / dt; if (wantVy < k.vy - g * dt * 1.5 && k.spd > 14) { k.air = true; k.vy = Math.min(k.vy, 0); } else { k.vy = wantVy; k.y = gy; }
  }
  // ramps
  R.ramps.forEach(function (r) { if (!k.air && loc.i === r.i && Math.abs(loc.lat) < def.hw * 0.75 && k.spd > 8) { k.air = true; k.vy = (6.5 + 5 * r.k) * Math.min(1.2, k.spd / 25) * (def.grav ? 0.8 : 1); k.y += 0.3; k.trickable = true; } });
  // boost pads
  if (!k.air) R.pads.forEach(function (p) { var di = (loc.i - p.i + T.N) % T.N; if (di < p.len && Math.abs(loc.lat - p.lat) < 2) { if (k.boostT < 0.9) { k.boostT = 1.0; if (!k.ai) sfx.play('power'); } } });
  // conveyor belts and course hazards
  if (R.TH.kartStep) R.TH.kartStep(R, k, loc, dt);
  // laps
  var prevSeg = k.seg; k.seg = loc.i; k.lat = loc.lat;
  if (prevSeg >= 0) {
    if (prevSeg > T.N * 0.75 && loc.i < T.N * 0.25) { if (k.half) { k.lap++; k.half = false; lapDone(k); } }
    else if (prevSeg < T.N * 0.25 && loc.i > T.N * 0.75) { k.lap--; k.half = true; }
    if (loc.i > T.N * 0.45 && loc.i < T.N * 0.55) k.half = true;
  }
  k.prog = k.lap * T.N + loc.i + loc.t;
  // wrong way
  var dot = Math.cos(k.yaw) * loc.s.tx + Math.sin(k.yaw) * loc.s.tz;
  if (dot < -0.3 && k.spd > 3) k.wrongT += dt; else k.wrongT = Math.max(0, k.wrongT - dt * 2);
  // stuck (AI): turn back towards the road
  if (k.ai && R.phase === 'go' && !k.done) { if (Math.abs(k.spd) < 2) k.stuckT += dt; else k.stuckT = 0; if (k.stuckT > 2.2) { var p = T.pos(loc.i, 0); k.x = p.x; k.z = p.z; k.y = p.y; k.yaw = Math.atan2(loc.s.tz, loc.s.tx); k.spd = 5; k.stuckT = 0; } }
}
function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function near(k) { var m = RACE.me; return Math.hypot(k.x - m.x, k.z - m.z) < 30; }
function rubber(k) { // the pack stays close: AI behind you speed up a little, AI far ahead ease off
  var R = RACE, me = R.me; if (R.tt || me.done) return 1; var gap = (me.prog - k.prog) * STEP;
  if (gap > 0) return 1 + Math.min(0.12, gap / 260 * 0.12); return 1 - Math.min(R.cls.id === 'mild' ? 0.14 : 0.07, -gap / 320 * 0.1);
}
function lapDone(k) {
  var R = RACE; if (k.lap <= 1) { k.lapStart = R.t; return; }
  k.laps.push(R.t - k.lapStart); k.lapStart = R.t;
  if (k.lap > R.laps && !k.done) { k.done = true; k.time = R.t; R.places.push(k); if (k === R.me) finishRace(); }
  else if (k === R.me) { if (k.lap === R.laps) { R.bannerTxt = 'FINAL LAP'; R.lapBanner = 2.2; sfx.play('bell'); speedSong(1.08); } else { R.bannerTxt = 'LAP ' + k.lap + ' / ' + R.laps; R.lapBanner = 1.6; sfx.play('coin'); } }
}
function speedSong(k) { var id = RACE.def.song, base = music.songs[id]; if (!base) return; var c = {}; for (var q in base) c[q] = base[q]; c.bpm = Math.round(base.bpm * k); music.songs[id + '_fast'] = c; music.play(id + '_fast'); }

/* ---------- the AI ---------- */
function aiInput(k, dt) {
  var R = RACE, T = R.T, S = T.S, N = T.N, def = R.def, inp = { steer: 0, gas: true, brake: false, drift: false, item: false };
  k.laneT -= dt; if (k.laneT <= 0) { k.laneT = 2 + Math.random() * 3; k.lane = (Math.random() - 0.5) * 1.1; }
  var lane = k.lane * def.hw * 0.75;
  // go for an item box if empty-handed, steer round traps and goo ahead
  var ahead = function (x, z) { var q = T.locate(x, z, k.seg), di = (q.i - k.seg + N) % N; return { di: di, lat: q.lat }; };
  if (!k.item && !(k.roul > 0)) { var bb = null; R.boxes.forEach(function (b) { if (b.t > 0) return; var a = ahead(b.x, b.z); if (a.di > 2 && a.di < 14 && (!bb || a.di < bb.di)) bb = a; }); if (bb) lane = bb.lat; }
  R.traps.concat(R.goo).forEach(function (t) { var a = ahead(t.x, t.z); if (a.di > 0 && a.di < 10 && Math.abs(a.lat - lane) < 2.6) lane = a.lat + (a.lat > 0 ? -3.4 : 3.4); });
  lane = clamp(lane, -def.hw * 0.85, def.hw * 0.85);
  var look = Math.round((5 + Math.max(0, k.spd) * 0.32) / STEP), q = S[(k.seg + look) % N], tx = q.x + q.nx * lane - k.x, tz = q.z + q.nz * lane - k.z;
  var want = Math.atan2(tz, tx), d = angDiff(want, k.yaw); inp.steer = clamp(d * 2.6, -1, 1);
  // ease off into sharp bends
  var bend = 0; for (var i = 2; i < 12; i++) bend += Math.abs(S[(k.seg + i) % N].curve); if (bend > 3.4 && k.spd > k.top * 0.85) { inp.gas = false; if (bend > 4.6) inp.brake = k.spd > k.top * 0.72; }
  // a little drift boost now and then on long bends (better drivers on harder classes)
  if (bend > 1.6 && k.spd > 14 && !k.drift && Math.random() < 0.012 * R.cls.ai) { k.aiDrift = 1.2 + Math.random() * 1.2; }
  if (k.aiDrift > 0) { k.aiDrift -= dt; inp.drift = k.aiDrift > 0.05 && Math.abs(inp.steer) > 0.25 || (k.drift && k.aiDrift > 0); if (!k.drift && Math.abs(inp.steer) <= 0.3) k.aiDrift = 0; }
  // items
  k.itemT -= dt; if ((k.item || k.orbit > 0) && k.itemT <= 0) { if (aiWantsItem(k)) inp.item = true; else k.itemT = 0.4; }
  return inp;
}
function aiWantsItem(k) {
  var R = RACE, it = k.item, ahead = R.karts.filter(function (o) { return o !== k && !o.done && (o.prog - k.prog) * STEP > 0 && (o.prog - k.prog) * STEP < 26; }), behind = R.karts.filter(function (o) { return o !== k && (k.prog - o.prog) * STEP > 0 && (k.prog - o.prog) * STEP < 20; });
  var near9 = R.karts.filter(function (o) { return o !== k && Math.hypot(o.x - k.x, o.z - k.z) < 9; });
  if (!it) return k.orbit > 0 && ahead.length > 0;
  if (it === 'pie') return ahead.length > 0 || behind.length > 0 && Math.random() < 0.3;
  if (it === 'pie3') return k.orbit === 0 || ahead.length > 0;
  if (it === 'pill' || it === 'goo') return behind.length > 0 || Math.random() < 0.08;
  if (it === 'cuppa' || it === 'cuppa3' || it === 'cracker' || it === 'balloon') return Math.abs(R.T.S[(k.seg + 8) % R.T.N].curve) < 0.04;
  if (it === 'bubble') return true;
  if (it === 'sperm') return k.place > 1 || (R.ev && R.ev.t === 'pursuit');
  if (it === 'beat') return near9.length > 0;
  if (it === 'magnet') return near9.some(function (o) { return o.drops > 0; }) || Math.random() < 0.05;
  return true; // meatnado, egg, Sir Johnathan: right away
}

/* ---------- items ---------- */
function rollItem(k) {
  if (RACE.tt) return 'cuppa'; var o = ODDS[Math.min(7, Math.max(0, k.place - 1 + (8 - RACE.karts.length > 0 ? 0 : 0)))], tot = 0, key;
  for (key in o) tot += o[key]; var v = Math.random() * tot; for (key in o) { v -= o[key]; if (v <= 0) return key; } return 'pie';
}
function useItem(k, inp) {
  var R = RACE, it = k.item, back = inp.back && !inp.fwd; if (k.roul > 0) return;
  if (!it) { if (k.orbit > 0) { k.orbit--; throwPie(k, back); k.itemT = 0.5; } return; } // the pies spinning round you go one at a time
  var fx = Math.cos(k.yaw), fz = Math.sin(k.yaw);
  if (it === 'pie3' && k.orbit === 0 && k.itemN === 3) { k.orbit = 3; k.itemN = 0; k.item = null; sfx.play('magic'); k.itemT = 0.8; return; } // the first press sets the three pies spinning round you
  k.itemN--; if (k.itemN <= 0) { k.item = null; k.itemN = 0; }
  R.used = R.used || {}; R.used[it] = (R.used[it] || 0) + 1;
  k.itemT = 0.6 + Math.random() * 0.8;
  if (it === 'pie') throwPie(k, back);
  else if (it === 'pill' || it === 'goo') { var tx = back || !inp.fwd ? -2.6 : 2.6; var p = { k: it, x: k.x + fx * tx, z: k.z + fz * tx, y: k.y, life: it === 'goo' ? 30 : 45, by: k, safe: 0.4, r: it === 'goo' ? 2.7 : 1.3 }; if (inp.fwd) { p.vx = fx * (k.spd + 18); p.vz = fz * (k.spd + 18); p.vy = 7; p.air = true; } R.traps.push(p); sfx.play(it === 'goo' ? 'splat' : 'blip'); if (it === 'goo') say(k, 'goo'); }
  else if (it === 'sperm') { var tgt = R.ev && R.ev.t === 'pursuit' && !k.ai && R.foe ? R.foe : R.karts.filter(function (o) { return o.place === k.place - 1; })[0] || null; R.proj.push({ k: 'sperm', x: k.x + fx * 2, z: k.z + fz * 2, y: k.y + 0.6, seg: k.seg, tgt: tgt, life: 9, by: k, safe: 0.3, sp: Math.max(k.spd + 10, 44) }); sfx.play('shoot'); }
  else if (it === 'cuppa' || it === 'cuppa3') { k.boostT = Math.max(k.boostT, 1.3); sfx.play('power'); }
  else if (it === 'cracker') { k.drops = Math.min(10, k.drops + 3); k.boostT = Math.max(k.boostT, 0.5); sfx.play('coin'); }
  else if (it === 'bubble') { k.shieldT = 14; sfx.play('magic'); }
  else if (it === 'meatnado') { k.nadoT = 6.5; k.invT = 6.5; sfx.play('roar'); }
  else if (it === 'sirj') { var lead = R.karts.filter(function (o) { return o.place === 1; })[0]; if (lead === k) lead = R.karts.filter(function (o) { return o.place === 2; })[0]; R.proj.push({ k: 'cat', x: k.x, z: k.z, y: k.y, seg: k.seg, tgt: lead, life: 20, by: k, safe: 99, sp: 66 }); sfx.play('roar'); }
  else if (it === 'egg') { k.petT = 11; k.petCd = 0.8; sfx.play('magic'); R.fx.push({ k: 'pop', x: k.x, y: k.y + 1.6, z: k.z, t: 0.4, col: '#9aff5a' }); }
  else if (it === 'balloon') { k.floatT = 3.6; k.invT = Math.max(k.invT, 3.8); k.boostT = Math.max(k.boostT, 0.6); sfx.play('jump'); }
  else if (it === 'magnet') { k.magT = 5; k.magCd = 0; sfx.play('coin'); }
  else if (it === 'beat') { // the shockwave
    R.fx.push({ k: 'ring', x: k.x, y: k.y + 0.4, z: k.z, t: 0.6 }); sfx.play('boom'); if (near(k)) KIT.shake(3);
    R.karts.forEach(function (o) { if (o === k || o.nadoT > 0 || o.floatT > 0) return; var dx = o.x - k.x, dz = o.z - k.z, d = Math.hypot(dx, dz); if (d > 9 || d < 0.01) return;
      if (o.shieldT > 0) { o.shieldT = 0; R.fx.push({ k: 'pop', x: o.x, y: o.y + 1, z: o.z, t: 0.4 }); } if (o.orbit > 0) o.orbit = 0;
      var f = 30 * (1 - d / 10); o.kx += dx / d * f; o.kz += dz / d * f; o.wobT = 1.1; o.drift = 0; o.spd *= 0.75; if (o === R.me) sfx.play('hit'); if (o.remote && typeof netEmit === 'function') netEmit(o, { e: 'knock', kx: dx / d * f, kz: dz / d * f }); });
  }
}
function throwPie(k, back) {
  var R = RACE, fx = Math.cos(k.yaw), fz = Math.sin(k.yaw), sp = back ? -24 : Math.max(k.spd, 0) + 36;
  R.proj.push({ k: 'pie', x: k.x + fx * (back ? -1.8 : 1.8), z: k.z + fz * (back ? -1.8 : 1.8), y: k.y + 0.6, vx: fx * sp, vz: fz * sp, life: 5, by: k, safe: 0.25, seg: k.seg }); sfx.play('shoot');
}
/* what each thing does when it hits you. how: 'spin' (default), 'pie', 'pill', 'goo', 'toss', 'pounce', 'bite'. Returns false if it did nothing. */
/* the Gloop's bites and the coin magnet: worked out by whoever runs the race (the host online) */
function kartPerks(k, dt) {
  var R = RACE;
  if (k.petT > 0) { k.petCd -= dt; if (k.petCd <= 0) { k.petCd = 0.9; R.karts.forEach(function (o) { if (o !== k && !o.done && Math.hypot(o.x - k.x, o.z - k.z) < 3.4 && Math.abs(o.y - k.y) < 1.5) { hitKart(o, k, 'bite'); k.petBite = 0.3; } }); } }
  if (k.magT > 0) { k.magCd -= dt; if (k.magCd <= 0) { k.magCd = 0.45; R.karts.forEach(function (o) { if (o !== k && o.drops > 0 && k.drops < 10 && Math.hypot(o.x - k.x, o.z - k.z) < 10) { o.drops--; k.drops++; R.fx.push({ k: 'drop', x: o.x, y: o.y + 1, z: o.z, vx: (k.x - o.x) * 2.2, vy: 4, vz: (k.z - o.z) * 2.2, t: 0.45 }); if (k === R.me) sfx.play('coin'); } }); }
    R.drops.forEach(function (dr) { if (dr.t <= 0 && Math.hypot(dr.x - k.x, dr.z - k.z) < 9) { dr.x += (k.x - dr.x) * Math.min(1, dt * 6); dr.z += (k.z - dr.z) * Math.min(1, dt * 6); } }); }
}
function hitKart(k, by, how, p) {
  var R = RACE; if (k.floatT > 0) return false; if (k.invT > 0 || k.nadoT > 0) return false;
  if (k.shieldT > 0 && how !== 'bite') { // Spermaid's bubble: what was thrown goes back where it came from
    k.shieldT = 0; k.invT = 0.5; sfx.play('magic'); R.fx.push({ k: 'pop', x: k.x, y: k.y + 1, z: k.z, t: 0.4, col: '#9adfff' });
    if (p && by && by !== k) { var q = { k: p.k, x: k.x, z: k.z, y: k.y + 0.6, seg: k.seg, life: 6, by: k, safe: 0.4 }; if (p.k === 'pie') { var a = Math.atan2(by.z - k.z, by.x - k.x); q.vx = Math.cos(a) * 44; q.vz = Math.sin(a) * 44; } if (p.k === 'sperm') { q.tgt = by; q.sp = 50; } if (p.k === 'pie' || p.k === 'sperm') R.proj.push(q); }
    return true;
  }
  if (k.orbit > 0 && how !== 'bite' && how !== 'goo' && how !== 'pounce') { k.orbit--; k.invT = 0.5; sfx.play('splat'); R.fx.push({ k: 'pop', x: k.x, y: k.y + 1, z: k.z, t: 0.4 }); return true; } // a spinning pie takes it
  var me = k === R.me;
  if (how === 'pie') { k.splatT = 2.6; k.spd *= 0.6; k.invT = 1.2; if (me) R.splatScreen = 2.6; }
  else if (how === 'pill') { var e = ['rev', 'tiny', 'hic'][Math.floor(Math.random() * 3)]; k.invT = 1.2; k.spd *= 0.7; if (e === 'rev') k.revT = 4.5; else if (e === 'tiny') k.tinyT = 5.5; else k.hicT = 4.5; if (me) R.pillMsg = { e: e, t: 2.2 }; }
  else if (how === 'goo') { if (k.gooT > 0) return false; k.gooT = 3; k.drift = 0; if (me) R.gooScreen = 1.6; }
  else if (how === 'bite') { k.spd *= 0.8; k.wobT = 0.5; if (k.drops > 0 && by) { k.drops--; by.drops = Math.min(10, by.drops + 1); R.fx.push({ k: 'drop', x: k.x, y: k.y + 1, z: k.z, vx: (by.x - k.x) * 2, vy: 5, vz: (by.z - k.z) * 2, t: 0.5 }); } if (me || by === R.me) sfx.play('hit'); return true; }
  else {
    k.spinT = how === 'pounce' ? 1.6 : 1.15; k.invT = 1.8; k.spd *= 0.35; k.drift = 0; k.boostT = 0;
    if (how === 'pounce') { k.squashT = 2.2; k.vy = 5; k.air = true; }
    if (how === 'toss') { k.vy = 11; k.air = true; k.spinT = 1.3; }
  }
  k.drift = 0;
  var lost = Math.min(k.drops, 2); k.drops -= lost; for (var i = 0; i < lost; i++) R.fx.push({ k: 'drop', x: k.x, y: k.y + 1, z: k.z, vx: (Math.random() - 0.5) * 8, vy: 6, vz: (Math.random() - 0.5) * 8, t: 0.9 });
  if (!k.ai || near(k)) sfx.play(how === 'pounce' || how === 'toss' ? 'boom' : how === 'pie' || how === 'goo' ? 'splat' : 'hit');
  R.hits = (R.hits || 0) + 1;
  if (me) KIT.shake(how === 'pie' || how === 'goo' ? 2 : 4);
  if (by && by !== k) say(by, 'hit'); say(k, 'ouch');
  return true;
}
/* drivers shout now and then (TB always says one of his lines) */
var SAYS = {
  tb: ['"Fuck muck"', '"Shithead Laboozie"', '"let me tighten that kynodesme"', '"dick skin"', '"whyma wimina"', '"suck your own and fuck your own"', '"suck me fuck me suck me fuck me"', '"I got lotion on my dick I\'m out here shooting my shit I\'m free man for real!"', '"Old geezer, Prick teaser"', '"I made muckies..."', '"a sissy doesn\'t deserve pleasure, a sissy is someone plaything"'],
  joff: ['"Pineapple belongs on pizza. Fight me."'], amy: ['"Mild, hot or dynamite?"'], greebo: ['"Fresh cream pies. Don\'t ask what\'s in them."'], saba: ['"Hitless runs only."'],
  beebs: ['"Sit down, lad. First one\'s always warm."'], ali: ['"Everything is better with garlic."'], potbelly: ['"Cabinets are free, kid."'], kaya: ['"Kaya\'s on the coffee!"'],
  spermaid: ['"Sweetie!"'], kingblum: ['"ON MY OWN GROUND I AM KING."'], blum: ['"THE LOAD AT THE END."'], sirj: ['"Mrrrow."'], cumhead: ['"Splat!"'], hom: ['"Blub!"']
};
function say(k, why) {
  var R = RACE, l = SAYS[k.ch]; if (!l || R.t - (k.said || -9) < 6) return; if (k !== R.me && !near(k)) return; if (why === 'ouch' && k.ch !== 'tb' && Math.random() < 0.6) return;
  k.said = R.t; R.msg = { who: k.c.n, s: l[Math.floor(Math.random() * l.length)], t: 2.6 };
}

/* ---------- the world ticking along ---------- */
function stepRace(dt) {
  var R = RACE; if (!R) return; R.t += dt; R.phaseT += dt;
  if (R.phase === 'intro') { if (R.phaseT > 3.2 || KIT.pressed('a') || KIT.pressed('start')) { R.phase = 'count'; R.phaseT = 0; R.count = 3; sfx.play('tick'); } }
  else if (R.phase === 'count') {
    var c = 3 - Math.floor(R.phaseT); if (c !== R.count && c > 0) { R.count = c; sfx.play('tick'); }
    if (R.phaseT >= 3) { R.phase = 'go'; R.phaseT = 0; R.t = 0; sfx.play('bell'); R.karts.forEach(function (k) { k.lapStart = 0; if (k.ai) { if (Math.random() < 0.45 * R.cls.ai) k.boostT = 0.8; } else if (k.rev > 0.15 && k.rev < 1.1) { k.boostT = 1.0; sfx.play('power'); } else if (k.rev >= 1.1) { k.spinT = 0.7; } }); }
  }
  if (R.phase === 'go' || R.phase === 'done') R.karts.forEach(function (k) { if (!k.done) k.time = R.t; }); // a finished kart's time stays where it crossed the line
  var CL = R.net === 'client';
  R.karts.forEach(function (k, i) {
    if (k.puppet) { puppetStep(k, dt); return; } // another player's kart, or anything else the host runs: shown where the host says
    if (k.remote) { if (k.roul > 0) { k.roul -= dt; if (k.roul <= 0) k.roul = 0; } return; } // a player on another machine drives this one; their reports move it
    var inp = k.ai || (R.phase === 'done') ? aiInput(k, dt) : playerInput(); driveKart(k, inp, dt);
    if (inp.item && R.phase === 'go') { if (CL) netSend({ t: 'use', back: !!inp.back, fwd: !!inp.fwd }); else useItem(k, inp); }
    if (!CL && k.roul > 0) { k.roul -= dt; if (k.roul <= 0) { k.roul = 0; if (k === R.me) sfx.play('select'); } }
  });
  if (!CL) R.karts.forEach(function (k) { kartPerks(k, dt); });
  // kart against kart
  if (!R.ghosts) for (var a = 0; a < R.karts.length; a++) for (var b = a + 1; b < R.karts.length; b++) {
    var A = R.karts[a], B = R.karts[b], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
    if (CL && A !== R.me && B !== R.me) continue; // on a guest's machine only their own kart gets pushed
    if (d < KR * 2 && d > 0.001 && Math.abs(A.y + A.floatY - B.y - B.floatY) < 1.5) {
      var aw = A.tinyT > 0 ? A.wt * 0.3 : A.wt, bw = B.tinyT > 0 ? B.wt * 0.3 : B.wt, nx = dx / d, nz = dz / d, ov = KR * 2 - d, wa = bw / (aw + bw), wb = 1 - wa;
      if (A.remote || A.puppet) { wa = 0; wb = 1; } else if (B.remote || B.puppet) { wa = 1; wb = 0; } // a kart someone else drives can't be pushed from here
      A.x -= nx * ov * wa; A.z -= nz * ov * wa; B.x += nx * ov * wb; B.z += nz * ov * wb;
      var push = 6 + Math.abs(A.spd - B.spd) * 0.3; A.kx -= nx * push * wa; A.kz -= nz * push * wa; B.kx += nx * push * wb; B.kz += nz * push * wb;
      if (!CL) { if (A.nadoT > 0 && B.nadoT <= 0) hitKart(B, A, 'toss'); else if (B.nadoT > 0 && A.nadoT <= 0) hitKart(A, B, 'toss'); }
      if ((A === R.me || B === R.me) && (A.bumpT <= 0)) { A.bumpT = 0.3; sfx.play('land'); }
    }
  }
  // item boxes and drops (the host decides who gets what)
  if (!CL) R.boxes.forEach(function (bx) {
    if (bx.t > 0) { bx.t -= dt; return; }
    R.karts.forEach(function (k) { if (bx.t > 0) return; if (Math.hypot(k.x - bx.x, k.z - bx.z) < 1.9 && Math.abs(k.y - bx.y) < 2) { bx.t = 2.2; R.fx.push({ k: 'box', x: bx.x, y: bx.y + 1, z: bx.z, t: 0.35 }); if (!k.item && !(k.roul > 0)) { k.item = rollItem(k); k.itemN = ITEMS[k.item].n3 || 1; k.roul = k.ai ? 0.01 : 1.1; k.itemT = 0.8 + Math.random() * 1.5; if (k === R.me) sfx.play('blip'); } } });
  });
  if (!CL) R.drops.forEach(function (dr) {
    if (dr.t > 0) { dr.t -= dt; return; }
    R.karts.forEach(function (k) { if (dr.t > 0) return; if (Math.hypot(k.x - dr.x, k.z - dr.z) < 1.6 && Math.abs(k.y - dr.y) < 2) { dr.t = 9; if (k.drops < 10) k.drops++; k.got = (k.got || 0) + 1; if (k === R.me) { sfx.play('coin'); R.got = (R.got || 0) + 1; } } });
  });
  if (!CL) stepProjectiles(dt);
  if (R.TH.step) R.TH.step(R, dt);
  if (R.ev && !CL && typeof evStep === 'function') { evStep(R, dt); if (RACE !== R) return; }
  // places
  if (!CL) { var order = R.karts.slice().sort(function (p, q) { if (p.done && q.done) return p.time - q.time; if (p.done) return -1; if (q.done) return 1; return q.prog - p.prog; });
  order.forEach(function (k, i) { k.place = i + 1; }); }
  if (R.net === 'host') netTick(dt); else if (CL) netClientTick(dt);
  // effects
  R.fx.forEach(function (f) { f.t -= dt; if (f.vx !== undefined) { f.x += f.vx * dt; f.z += f.vz * dt; f.y += f.vy * dt; f.vy -= 20 * dt; } });
  R.fx = R.fx.filter(function (f) { return f.t > 0; });
  if (R.lapBanner > 0) R.lapBanner -= dt; if (R.msg) { R.msg.t -= dt; if (R.msg.t <= 0) R.msg = null; } if (R.splatScreen > 0) R.splatScreen -= dt; if (R.pillMsg) { R.pillMsg.t -= dt; if (R.pillMsg.t <= 0) R.pillMsg = null; } if (R.gooScreen > 0) R.gooScreen -= dt; if (R.flash > 0) R.flash -= dt;
  if (R.phase === 'done' && !CL) { R.doneT = (R.doneT || 0) + dt; if (R.doneT > 1 && R.karts.every(function (k) { return k.done; }) || (R.net && R.doneT > 4 && R.karts.every(function (k) { return k.done || (R.humans || []).indexOf(k.idx) < 0; })) || R.doneT > (R.net ? 30 : 9)) { if (!R.ended) { R.ended = true; endRace(); } } }
}
function stepProjectiles(dt) {
  var R = RACE, T = R.T, N = T.N;
  R.proj.forEach(function (p) {
    p.life -= dt; if (p.safe > 0) p.safe -= dt;
    if (p.k === 'pie') {
      p.x += p.vx * dt; p.z += p.vz * dt; var q = T.locate(p.x, p.z, p.seg); p.seg = q.i; p.y = q.y + 0.6;
      if (Math.abs(q.lat) > T.edge - 0.4) { var n = q.s, sd = Math.sign(q.lat), dn = p.vx * n.nx + p.vz * n.nz; p.vx -= 2 * dn * n.nx; p.vz -= 2 * dn * n.nz; p.x -= n.nx * sd * (Math.abs(q.lat) - T.edge + 0.4); p.z -= n.nz * sd * (Math.abs(q.lat) - T.edge + 0.4); p.bounces = (p.bounces || 0) + 1; if (p.bounces > 4) p.life = 0; }
    } else if (p.k === 'sperm') { // swims along the road, then darts at the target
      var t = p.tgt; if (t && t.done) t = null;
      var q2 = T.locate(p.x, p.z, p.seg); p.seg = q2.i; p.y = q2.y + 0.5;
      var tx, tz; if (t && Math.hypot(t.x - p.x, t.z - p.z) < 14) { tx = t.x; tz = t.z; } else { var la = T.S[(q2.i + 4) % N], tl = t ? clamp(t.lat, -R.def.hw * 0.8, R.def.hw * 0.8) : 0; tx = la.x + la.nx * tl; tz = la.z + la.nz * tl; }
      var a = Math.atan2(tz - p.z, tx - p.x); p.a = a; p.x += Math.cos(a) * p.sp * dt; p.z += Math.sin(a) * p.sp * dt;
      if (Math.random() < 0.6) R.fx.push({ k: 'trail', x: p.x, y: p.y, z: p.z, t: 0.3, col: '#fff6d8' });
    } else if (p.k === 'cat') { // Sir Johnathan runs down the middle of the road to the leader and pounces
      var t2 = p.tgt; if (!t2 || t2.done) { var l2 = R.karts.filter(function (o) { return o.place === 1 && !o.done; })[0]; p.tgt = t2 = l2; }
      if (!t2) { p.life = 0; return; }
      var q3 = T.locate(p.x, p.z, p.seg); p.seg = q3.i; p.y = q3.y;
      var close = Math.hypot(t2.x - p.x, t2.z - p.z) < 10, la2 = T.S[(q3.i + 3) % N], tx2 = close ? t2.x : la2.x, tz2 = close ? t2.z : la2.z, a2 = Math.atan2(tz2 - p.z, tx2 - p.x);
      p.a = a2; p.x += Math.cos(a2) * p.sp * dt; p.z += Math.sin(a2) * p.sp * dt;
      if (Math.hypot(t2.x - p.x, t2.z - p.z) < 2) { p.life = 0; R.karts.forEach(function (o) { if (Math.hypot(o.x - p.x, o.z - p.z) < 7 && o.floatY < 1) hitKart(o, p.by, 'pounce'); }); R.fx.push({ k: 'pop', x: p.x, y: p.y + 1, z: p.z, t: 0.6, col: '#f1e7d0', big: 1 }); sfx.play('roar'); if (near(t2)) KIT.shake(6); }
      return;
    }
    R.karts.forEach(function (k) { if (p.life <= 0 || (k === p.by && p.safe > 0) || k.floatY > 1) return; if (Math.hypot(k.x - p.x, k.z - p.z) < 1.4 && Math.abs(k.y - p.y) < 2) { p.life = 0; hitKart(k, p.by, p.k === 'pie' ? 'pie' : 'spin', p); R.fx.push({ k: 'pop', x: p.x, y: p.y, z: p.z, t: 0.4, col: p.k === 'pie' ? '#f1e7d0' : '#fff6d8' }); } });
  });
  R.proj = R.proj.filter(function (p) { return p.life > 0; });
  R.traps.forEach(function (t) {
    t.life -= dt; if (t.safe > 0) t.safe -= dt;
    if (t.air) { t.x += t.vx * dt; t.z += t.vz * dt; t.vy -= 26 * dt; t.y += t.vy * dt; var q = T.locate(t.x, t.z, t.seg); t.seg = q.i; if (t.y <= q.y) { t.y = q.y; t.air = false; } return; }
    R.karts.forEach(function (k) { if (t.life <= 0 || (k === t.by && t.safe > 0) || k.floatY > 1 || k.air) return; if (Math.hypot(k.x - t.x, k.z - t.z) < (t.r || 1.3) && Math.abs(k.y - t.y) < 1.5) {
      if (t.k === 'goo') { hitKart(k, t.by, 'goo'); return; } // the puddle stays for everyone behind
      hitKart(k, t.by, 'pill'); t.life = 0; R.fx.push({ k: 'pop', x: t.x, y: t.y + 0.5, z: t.z, t: 0.4, col: '#ffe36a' }); } });
    R.proj.forEach(function (p) { if (t.life > 0 && t.k !== 'goo' && p.k === 'pie' && Math.hypot(p.x - t.x, p.z - t.z) < 1.2) { t.life = 0; p.life = 0; R.fx.push({ k: 'pop', x: t.x, y: t.y + 0.5, z: t.z, t: 0.4, col: '#ffe36a' }); } });
  });
  R.traps = R.traps.filter(function (t) { return t.life > 0; });
}
