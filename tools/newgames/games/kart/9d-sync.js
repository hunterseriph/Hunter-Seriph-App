/* =====================================================================================================
   ONLINE RACES: the host runs the race (AI, items, boxes, drops, hits, places, the Expedition rules) and
   sends everyone a picture of it 20 times a second. Each player drives their own kart on their own machine
   (so steering never lags) and reports where it is; the host tells them when something hits them, when
   they get an item, and when an item they used does something to themselves.
   ===================================================================================================== */
var NETHZ = 20;
var KF = ['x', 'y', 'z', 'yaw', 'spd', 'vy', 'seg', 'lat', 'lap', 'prog', 'time', 'drift', 'driftLvl', 'driftT', 'steerVis', 'boostT', 'nadoT', 'spinT', 'spinA', 'squashT', 'splatT', 'revT', 'tinyT', 'hicT', 'floatT', 'floatY', 'gooT', 'invT', 'shieldT', 'orbit', 'petT', 'magT', 'wobT', 'hopT', 'slingT', 'slingCd'];
var SF = ['x', 'y', 'z', 'yaw', 'spd', 'lap', 'prog', 'place', 'drift', 'driftLvl', 'steerVis', 'boostT', 'nadoT', 'spinA', 'squashT', 'splatT', 'tinyT', 'floatY', 'gooT', 'shieldT', 'orbit', 'petT', 'magT', 'hopT', 'drops', 'itemN', 'roul', 'time', 'slingT'];
var GUARD = ['invT', 'shieldT', 'orbit', 'spinT', 'splatT', 'revT', 'tinyT', 'hicT', 'gooT', 'squashT'];
var ITEMKEYS = Object.keys(ITEMS);
function r3(v) { return typeof v === 'number' ? Math.round(v * 1000) / 1000 : v; }
function kartByIdx(i) { var A = RACE.all || RACE.karts; return A[i]; }

/* ---------- the host ---------- */
var _hitKart = hitKart;
hitKart = function (k, by, how, p) {
  var r = _hitKart(k, by, how, p);
  if (r && k.remote && RACE && RACE.net === 'host') { netEmit(k, { e: 'hit', how: how || 'spin', by: by ? by.idx : -1 }); k.netGuard = 0.6; }
  return r;
};
var _useItem = useItem;
useItem = function (k, inp) {
  var it = k.item, n = k.itemN, orb = k.orbit;
  _useItem(k, inp);
  if (k.remote && RACE && RACE.net === 'host') {
    var used = it && (k.item !== it || k.itemN < n);
    if (used && SELFITEMS.indexOf(it) >= 0 && !(it === 'pie3' && k.orbit !== 3)) netEmit(k, { e: 'self', it: it });
    else if (!it && orb > 0 && k.orbit < orb) netEmit(k, { e: 'orbit' });
    k.netGuard = 0.3;
  }
};
var SELFITEMS = ['cuppa', 'cuppa3', 'cracker', 'bubble', 'meatnado', 'egg', 'balloon', 'magnet', 'pie3'];
function selfItem(k, it) { // the part of an item that happens to whoever used it (a guest does this to their own kart)
  if (it === 'cuppa' || it === 'cuppa3') { k.boostT = Math.max(k.boostT, 1.3); sfx.play('power'); }
  else if (it === 'cracker') { k.boostT = Math.max(k.boostT, 0.5); sfx.play('coin'); }
  else if (it === 'bubble') { k.shieldT = 14; sfx.play('magic'); }
  else if (it === 'meatnado') { k.nadoT = 6.5; k.invT = 6.5; sfx.play('roar'); }
  else if (it === 'egg') { k.petT = 11; k.petCd = 0.8; sfx.play('magic'); }
  else if (it === 'balloon') { k.floatT = 3.6; k.invT = Math.max(k.invT, 3.8); k.boostT = Math.max(k.boostT, 0.6); sfx.play('jump'); }
  else if (it === 'magnet') { k.magT = 5; sfx.play('coin'); }
  else if (it === 'pie3') { k.orbit = 3; sfx.play('magic'); }
}
function netEmit(k, ev) { var pl = NET.players.filter(function (p) { return p.id === k.netId; })[0]; if (!pl) return; var L = NET.links.filter(function (l) { return l.remote === pl.id; })[0]; if (L) L.send({ t: 'ev', ev: ev }); }
function netReport(pi, s) { // a guest says where their kart is
  var R = RACE; if (!R || !R.net) return; var id = NET.players[pi].id, k = R.all.filter(function (q) { return q.netId === id; })[0]; if (!k) return;
  var g = k.netGuard > 0;
  KF.forEach(function (f, i) { if (g && GUARD.indexOf(f) >= 0) return; if (s.v[i] !== undefined && s.v[i] !== null) k[f] = s.v[i]; });
  k.air = !!s.air; k.half = !!s.half; if (s.done && !k.done) { k.done = true; R.places.push(k); } if (s.laps) k.laps = s.laps;
}
function netUse(pi, m) { var R = RACE; if (!R || R.phase !== 'go') return; var id = NET.players[pi].id, k = R.karts.filter(function (q) { return q.netId === id; })[0]; if (k) useItem(k, { back: m.back, fwd: m.fwd }); }
var netAcc = 0;
function netTick(dt) {
  var R = RACE; R.all.forEach(function (k) { if (k.netGuard > 0) k.netGuard -= dt; });
  netAcc += dt; if (netAcc < 1 / NETHZ) return; netAcc = 0;
  var fx = R.fx.filter(function (f) { if (f.sent) return false; f.sent = 1; return true; }).map(function (f) { return [f.k, r3(f.x), r3(f.y), r3(f.z), r3(f.t), r3(f.vx), r3(f.vy), r3(f.vz), f.big ? 1 : 0]; });
  var X = R.evs, m = { t: 'snap', T: r3(R.t), ph: R.phase, live: R.karts.map(function (k) { return k.idx; }),
    k: R.all.map(function (k) { return SF.map(function (f) { return r3(k[f]); }).concat([ITEMKEYS.indexOf(k.item), k.done ? 1 : 0, k.air ? 1 : 0]); }),
    p: R.proj.map(function (p) { return [p.k, r3(p.x), r3(p.y), r3(p.z), r3(p.a || 0)]; }),
    tr: R.traps.map(function (t) { return [t.k, r3(t.x), r3(t.y), r3(t.z), t.r || 1.3, t.air ? 1 : 0]; }),
    bx: R.boxes.map(function (b) { return b.t > 0 ? 0 : 1; }).join(''),
    dr: R.drops.map(function (d) { return [r3(d.x), r3(d.z), d.t > 0 ? 0 : 1]; }),
    fx: fx, msg: R.msg ? [R.msg.who, R.msg.s, r3(R.msg.t)] : null,
    evs: X ? { left: r3(X.left), score: X.score, hp: X.hp, next: r3(X.next), cur: X.cur, goal: X.goal, over: X.over ? 1 : 0 } : null,
    gates: R.gates ? R.gates.map(function (g) { return Object.keys(g.got).map(Number); }) : null,
    ch: R.chain ? R.teams.map(function (t) { return [r3(t.snapT), t.snag ? 1 : 0]; }) : null, cn: R.chainNote || null };
  R.chainNote = null;
  netBroadcast(m, true);
}

/* ---------- a guest ---------- */
var netCAcc = 0;
function netClientTick(dt) {
  var R = RACE, k = R.me; netCAcc += dt; if (netCAcc < 1 / NETHZ) return; netCAcc = 0;
  netSend({ t: 'st', s: { v: KF.map(function (f) { return r3(k[f]); }), air: k.air ? 1 : 0, half: k.half ? 1 : 0, done: k.done ? 1 : 0, laps: k.done ? k.laps : null } }, true);
}
function netSnap(m) {
  var R = RACE; if (!R || R.net !== 'client') return; R.snapT = 0; R.hostT = m.T;
  if (m.live) R.karts = m.live.map(function (i) { return R.all[i]; }).filter(Boolean);
  m.k.forEach(function (v, i) {
    var k = R.all[i]; if (!k) return; var n = SF.length, it = v[n] >= 0 ? ITEMKEYS[v[n]] : null;
    if (k === R.me) { // only what the host decides: items, drops, places
      if (it && !k.item) sfx.play('blip'); if (!it && k.item && k.roul <= 0) {}
      k.item = it; k.itemN = v[SF.indexOf('itemN')]; k.roul = v[SF.indexOf('roul')]; k.drops = v[SF.indexOf('drops')]; k.place = v[SF.indexOf('place')]; return;
    }
    var T = k.net || (k.net = {}); SF.forEach(function (f, j) { T[f] = v[j]; }); T.age = 0; k.item = it; k.done = !!v[n + 1]; k.air = !!v[n + 2];
    if (!k.netInit) { k.netInit = true; SF.forEach(function (f) { k[f] = T[f]; }); }
  });
  R.proj = m.p.map(function (a) { return { k: a[0], x: a[1], y: a[2], z: a[3], a: a[4] }; });
  R.traps = m.tr.map(function (a) { return { k: a[0], x: a[1], y: a[2], z: a[3], r: a[4], air: !!a[5] }; });
  for (var i = 0; i < R.boxes.length; i++) R.boxes[i].t = m.bx[i] === '1' ? 0 : 1;
  m.dr.forEach(function (d, i) { var q = R.drops[i]; if (q) { q.x = d[0]; q.z = d[1]; q.t = d[2] ? 0 : 1; } });
  m.fx.forEach(function (a) { var f = { k: a[0], x: a[1], y: a[2], z: a[3], t: a[4], big: a[8] }; if (a[5] !== null && a[5] !== undefined) { f.vx = a[5]; f.vy = a[6]; f.vz = a[7]; } R.fx.push(f); });
  if (m.msg) R.msg = { who: m.msg[0], s: m.msg[1], t: m.msg[2] };
  if (m.evs) { R.evs = R.evs || {}; for (var q in m.evs) R.evs[q] = m.evs[q]; }
  if (m.ch && R.teams) m.ch.forEach(function (c, i) { var t = R.teams[i]; if (t) { t.snapT = c[0]; } });
  if (m.cn && R.chain) m.cn.forEach(function (c) { var f = R.all[c[0]], to = R.all[c[1]]; if (f && to && f.team) { R.fx.push({ sent: 1, k: 'pulse', team: f.team.i, from: f === f.team.a ? 0 : 1, t: 0.45, item: 1 }); if (to === R.me) { R.chainMsg = { s: 'GOT AN ITEM FROM ' + f.c.n.toUpperCase(), t: 1.3 }; sfx.play('select'); } } });
  if (m.gates && R.gates) m.gates.forEach(function (got, i) { var g = R.gates[i]; if (!g) return; g.got = {}; got.forEach(function (l) { g.got[l] = 1; }); g.lap = g.got[R.me.lap] ? R.me.lap : -1; });
}
function puppetStep(k, dt) { // glide towards where the host last saw it, guessing ahead by its speed
  var T = k.net; if (!T) return; T.age += dt;
  var ax = T.x + Math.cos(T.yaw) * T.spd * T.age, az = T.z + Math.sin(T.yaw) * T.spd * T.age, f = Math.min(1, dt * 12);
  k.x += (ax - k.x) * f; k.z += (az - k.z) * f; k.y += (T.y - k.y) * f; k.yaw += angDiff(T.yaw, k.yaw) * f;
  ['spd', 'steerVis', 'floatY'].forEach(function (q) { k[q] += (T[q] - k[q]) * f; });
  ['lap', 'prog', 'place', 'drift', 'driftLvl', 'boostT', 'slingT', 'nadoT', 'spinA', 'squashT', 'splatT', 'tinyT', 'gooT', 'shieldT', 'orbit', 'petT', 'magT', 'hopT', 'drops', 'time'].forEach(function (q) { k[q] = T[q]; });
  var loc = RACE.T.locate(k.x, k.z, k.seg); k.seg = loc.i; k.lat = loc.lat;
}
function netEvent(m) {
  var R = RACE, ev = m.ev; if (!R || R.net !== 'client') return; var me = R.me;
  if (ev.e === 'hit') _hitKart(me, ev.by >= 0 ? R.all[ev.by] : null, ev.how);
  else if (ev.e === 'self') selfItem(me, ev.it);
  else if (ev.e === 'orbit') { if (me.orbit > 0) me.orbit--; sfx.play('shoot'); }
  else if (ev.e === 'knock') { me.kx += ev.kx; me.kz += ev.kz; me.wobT = 1.1; me.drift = 0; me.spd *= 0.75; sfx.play('hit'); }
  else if (ev.e === 'eaten') { me.done = true; R.msg = { who: 'Meatnado', s: 'You got eaten! Cheer your partner on.', t: 3 }; sfx.play('roar'); }
}
function netClientStart(m) {
  var o = m.o; o.net = 'client'; o.meIdx = m.me;
  if (o.evId) { o.ev = expEvent(o.evId); o.defMod = evDefMod(o.ev); }
  KIT.closeMenu(); MODE = 'race'; GP = null; EXPCUR = o.ev || null; startRace(o); RACE.mp = m.kind;
}
