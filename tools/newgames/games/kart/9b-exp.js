/* =====================================================================================================
   EXPEDITION: Blumhead has stolen the Crimson Moon Trophy. Race across the world to take it back.
   12 areas (one per course), 8 events each, up to 3 stars an event. Each area ends in a face-off with one
   of our racers (it opens at FACE_AT stars in that area); beating them opens the next area and unlocks
   them as a driver. Blumhead waits at The Crimson Moon.
   Event types (EVT): race, duel, drift, rings, boost, pursuit, nado (Meatnado Escape), drops, ghost, face.
   Saves: SV.exp = { stars: {eventId: n}, beat: {areaIndex: 1}, seen: 1, won: 1 }.
   ===================================================================================================== */
var FACE_AT = 12;
var EVT = {
  race: { n: 'Race', ic: 'ck_star', d: 'Finish in the top three.' },
  duel: { n: 'Duel', ic: 'ck_gold', d: 'One on one. Beat them to the line.' },
  drift: { n: 'Drift Challenge', ic: 'ck_flame0', d: 'Score points by drifting. Longer drifts score more.' },
  rings: { n: 'Ring Run', ic: 'ck_bubble', d: 'Drive through the gates. Each one adds time to the clock. Reach the finish before it runs out.' },
  boost: { n: 'Boost Challenge', ic: 'it_espresso', d: 'Boost pads everywhere. Set a fast time.' },
  pursuit: { n: 'Pursuit', ic: 'it_pie', d: 'Hunt them down. Hit them with items before the clock runs out.' },
  nado: { n: 'Meatnado Escape', ic: 'ck_nado', d: 'The meatnado is coming. Every so often whoever is last gets eaten. Be the last one standing.' },
  drops: { n: 'Drop Hunt', ic: 'mn_drop', d: 'Grab as many drops as you can before the time is up.' },
  ghost: { n: 'Ghost Battle', ic: 'ck_silver', d: 'Beat the set times.' },
  face: { n: 'Face-off', ic: 'ck_gold', d: 'The rival of this place. Win to open the next area.' }
};
/* the areas: course, rival, class, what the rival says, then the events: [type, name, options] */
var EXP = [
  { c: 'clubrow', r: 'tb', cls: 'mild', q: '"Shithead Laboozie"', region: 'Cream', ev: [
    ['race', 'Opening Night', { laps: 2, riv: 5 }], ['drops', 'Drop Sweep', { time: 50 }], ['rings', 'Gate Crasher', { laps: 2 }], ['drift', 'Kerb Kisser', { time: 50 }],
    ['ghost', "Beat TB's Time", { laps: 2 }], ['duel', 'Pineapple Duel', { vs: 'joff', laps: 2 }], ['race', 'Back Down the Row', { laps: 2, rev: 1 }], ['face', 'TB at the Gate', { laps: 3 }]] },
  { c: 'park', r: 'amy', cls: 'mild', q: '"Mild, hot or dynamite?"', region: 'Cream', ev: [
    ['race', 'Steve Says Go', { laps: 2 }], ['boost', 'Coaster Rush', { laps: 2 }], ['drops', 'Prize Grab', { time: 55 }], ['nado', 'Carousel Panic', { riv: 5, every: 22 }],
    ['rings', 'Through the Hoops', { laps: 2 }], ['duel', 'Kaya on the Rides', { vs: 'kaya', laps: 2 }], ['drift', 'Ferris Wheel Drift', { time: 55 }], ['face', 'Amy at the Fair', { laps: 3 }]] },
  { c: 'cafe', r: 'kaya', cls: 'mild', q: '"Welcome in! Kaya\'s on the coffee, Elden\'s on the grill."', region: 'Cream', ev: [
    ['nado', 'Order Up', { riv: 5, every: 20 }], ['race', 'Rush Hour', { laps: 2 }], ['ghost', 'Hot Delivery', { laps: 1 }], ['drift', 'Latte Art', { time: 55 }],
    ['pursuit', 'Catch the Dine and Dasher', { vs: 'ali', hp: 3, time: 90 }], ['drops', 'Spilt Cream', { time: 55 }], ['race', 'Closing Time', { laps: 2, rev: 1 }], ['face', 'Kaya on the Coffee', { laps: 3 }]] },
  { c: 'castle', r: 'saba', cls: 'mild', q: '"Hitless runs only. Take a look, my friend."', region: 'Cream', ev: [
    ['race', 'Into the Keep', { laps: 2 }], ['rings', 'Banner Gates', { laps: 2 }], ['duel', 'Spermaid in the Halls', { vs: 'spermaid', laps: 2 }], ['boost', 'Chandelier Dash', { laps: 2 }],
    ['ghost', 'Hitless Lap', { laps: 1 }], ['drift', 'Throne Room Slide', { time: 55 }], ['race', 'Back Through the Gate', { laps: 2, rev: 1 }], ['face', 'Saba: Hitless', { laps: 3, hitless: 1 }]] },
  { c: 'sewer', r: 'ali', cls: 'hot', q: '"Nuggets? Garlic bread? Everything is better with garlic."', region: 'Blood', ev: [
    ['race', 'Down the Drain', { laps: 2 }], ['drops', 'Cream Fishing', { time: 55 }], ['nado', 'Flush', { riv: 6, every: 20 }], ['rings', 'Pipe Gates', { laps: 2 }],
    ['pursuit', 'Rat Hunt', { vs: 'potbelly', hp: 4, time: 90 }], ['drift', 'Slick Bends', { time: 60 }], ['ghost', 'Sewer Sprint', { laps: 2 }], ['face', 'Ali in the Sewers', { laps: 3 }]] },
  { c: 'arcade', r: 'potbelly', cls: 'hot', q: '"Cabinets are free, kid. Play all you like."', region: 'Blood', ev: [
    ['race', 'Insert Coin', { laps: 2 }], ['boost', 'Turbo Mode', { laps: 2 }], ['drops', 'Token Rush', { time: 55 }], ['duel', 'High Score', { vs: 'saba', laps: 2 }],
    ['rings', 'Bonus Stage', { laps: 2 }], ['drift', 'Pinball Drift', { time: 60 }], ['race', 'Game Over, Backwards', { laps: 2, rev: 1 }], ['face', "Potbelly's Cabinet", { laps: 3 }]] },
  { c: 'spuzz', r: 'hom', cls: 'hot', q: '"Blub!"', region: 'Blood', ev: [
    ['nado', 'Mincer Run', { riv: 6, every: 20 }], ['race', 'Night Shift', { laps: 2 }], ['rings', 'Steam Gates', { laps: 2 }], ['ghost', 'Belt Sprint', { laps: 2 }],
    ['pursuit', 'Free the Homunculi', { vs: 'beebs', hp: 4, time: 95 }], ['drops', 'Spare Parts', { time: 60 }], ['drift', 'Conveyor Drift', { time: 60 }], ['face', 'The Homunculus', { laps: 3 }]] },
  { c: 'lair', r: 'kingblum', cls: 'hot', q: '"ON MY OWN GROUND I AM KING."', region: 'Blood', ev: [
    ['race', 'Into the Lair', { laps: 2 }], ['drops', 'Goo Harvest', { time: 60 }], ['duel', 'Blumling Blitz', { vs: 'tb', laps: 2 }], ['boost', 'Heart Rush', { laps: 2 }],
    ['nado', 'Goo Tide', { riv: 6, every: 19 }], ['rings', 'Eye Gates', { laps: 2 }], ['pursuit', "Chase the King's Guard", { vs: 'greebo', hp: 5, time: 100 }], ['face', 'King Blumhead', { laps: 3, boss: 1 }]] },
  { c: 'picnic', r: 'greebo', cls: 'dyn', q: '"Fresh cream pies. Don\'t ask what\'s in them."', region: 'Moon', ev: [
    ['race', 'Picnic Blanket Dash', { laps: 2 }], ['drops', 'Crumb Trail', { time: 60 }], ['drift', 'Hill Slide', { time: 60 }], ['nado', 'March of the Ants', { riv: 6, every: 19 }],
    ['ghost', 'Before the Rain', { laps: 2 }], ['duel', 'Amy Brings the Chilli', { vs: 'amy', laps: 2 }], ['rings', 'Wasp Gates', { laps: 2 }], ['face', "Greebo's Picnic", { laps: 3, cat: 1 }]] },
  { c: 'dungeon', r: 'beebs', cls: 'dyn', q: '"Sit down, lad. First one\'s always warm."', region: 'Moon', ev: [
    ['race', 'Floor One', { laps: 2 }], ['rings', 'Torch Gates', { laps: 2 }], ['pursuit', 'Find Master Bates', { vs: 'joff', hp: 5, time: 100 }], ['drops', 'Loot Run', { time: 60 }],
    ['boost', 'Stairs Down', { laps: 2 }], ['nado', 'Trap Floor', { riv: 6, every: 18 }], ['race', 'Back Up the Stairs', { laps: 2, rev: 1 }], ['face', 'Uncle Beeb', { laps: 3 }]] },
  { c: 'void', r: 'spermaid', cls: 'dyn', q: '"Sweetie!"', region: 'Moon', ev: [
    ['race', 'Into the Void', { laps: 2 }], ['drift', 'Starlight Slide', { time: 60 }], ['ghost', 'Limit Break', { laps: 2 }], ['rings', 'Crystal Gates', { laps: 2 }],
    ['duel', "Kaya's Last Order", { vs: 'kaya', laps: 2 }], ['drops', 'Falling Stars', { time: 60 }], ['pursuit', 'Catch the Thief', { vs: 'blum', hp: 6, time: 100 }], ['face', 'Spermaid in the Void', { laps: 3 }]] },
  { c: 'moon', r: 'blum', cls: 'dyn', q: '"THE LOAD AT THE END."', region: 'Moon', ev: [
    ['race', 'Moonfall', { laps: 2 }], ['boost', 'Low Gravity', { laps: 2 }], ['nado', 'Eclipse', { riv: 6, every: 18 }], ['drops', 'Moon Dust', { time: 60 }],
    ['rings', 'Crater Gates', { laps: 2 }], ['duel', 'King of the Moon', { vs: 'kingblum', laps: 2 }], ['drift', 'Crimson Drift', { time: 60 }], ['face', 'Blumhead', { laps: 3, boss: 1, final: 1 }]] }
];
EXP.forEach(function (a, i) { a.i = i; a.events = a.ev.map(function (e, j) { return { id: i + '_' + j, a: i, j: j, t: e[0], n: e[1], o: e[2] || {} }; }); });
function XS() { if (!SV.exp) SV.exp = { stars: {}, beat: {} }; return SV.exp; }
function evStars(id) { return XS().stars[id] || 0; }
function areaStars(i) { return EXP[i].events.reduce(function (s, e) { return s + evStars(e.id); }, 0); }
function totalStars() { var t = 0; EXP.forEach(function (a, i) { t += areaStars(i); }); return t; }
function areaOpen(i) { return i === 0 || !!XS().beat[i - 1]; }
function evOpen(e) { return areaOpen(e.a) && (e.t !== 'face' || areaStars(e.a) - evStars(e.id) >= FACE_AT); }
function starStr(n, of) { var s = ''; for (var i = 0; i < (of || 3); i++) s += i < n ? '★' : '☆'; return s; }

/* ---------- par times: how fast a good driver gets round, to set fair goals ---------- */
function parLap(R) { var len = R.T.N * STEP; return len / (TOP * R.cls.spd * 0.86); }

/* ---------- the menus ---------- */
var EXPBACK = null;
function expedition(back) {
  if (back) EXPBACK = back; else if (back === undefined && !mpRoom()) EXPBACK = null;
  var X = XS(); if (!X.seen) return expIntro();
  var h = '<div class="ckmsg" style="text-align:left;font-size:18px;margin-bottom:4px">★ ' + totalStars() + ' / ' + EXP.length * 24 + '</div>';
  ['Cream', 'Blood', 'Moon'].forEach(function (rg) {
    h += '<div class="ckgrp">The ' + rg + ' Road</div><div class="ckg">';
    EXP.forEach(function (a, i) {
      if (a.region !== rg) return; var op = areaOpen(i), c = COURSES[a.c], beat = X.beat[i];
      h += '<button type="button" class="ckbtn ckc" data-act="a' + i + '"' + (op ? '' : ' disabled') + (op && !beat && (i === 0 || X.beat[i - 1]) ? ' data-pad-default' : '') + '><img class="th" src="' + thumb(a.c) + '" alt="">' +
        '<div style="display:flex;gap:10px;align-items:center">' + pic(a.r, 40) + '<div style="min-width:0"><b style="font-size:22px">' + (op ? esc(c.n) : '???') + '</b><span style="display:block">' + (op ? 'Rival: ' + esc(CH[a.r].n) : 'Beat the last rival to open') + '</span></div></div>' +
        '<em>★ ' + areaStars(i) + '/24' + (beat ? '  ·  CLEARED' : '') + '</em></button>';
    });
    h += '</div>';
  });
  var acts = { story: expIntro }; EXP.forEach(function (a, i) { acts['a' + i] = function () { expArea(i); }; });
  screen({ title: 'Expedition', sub: mpRoom() ? 'Co-op: you and ' + esc((NET.players[1] || {}).name || 'a friend') : 'Take back the Crimson Moon Trophy', back: function () { (EXPBACK || titleMenu)(); }, redo: function () { expedition(null); }, acts: acts,
    html: h + '<div class="ckacts" style="margin-top:14px"><button type="button" class="ckbtn" data-act="story">THE STORY SO FAR</button></div>' });
}
function expIntro() {
  XS().seen = 1; persist();
  screen({ cls: 'solid', title: 'The Crimson Moon Trophy', back: function () { expedition(null); }, foot: false,
    html: '<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:12px;font-size:16px;line-height:1.5">' +
      '<div style="display:flex;gap:12px;align-items:center">' + pic('blum', 72) + '<p style="margin:0">Every year the best racer in the land lifts the Crimson Moon Trophy. This year Blumhead didn\'t bother racing. He just took it, and flew off to The Crimson Moon laughing.</p></div>' +
      '<p style="margin:0">To get there you have to race your way across the whole world, from Clubhouse Row to the Moon. In every place someone fancies themselves the fastest. Earn stars in their events, then beat them in a face-off, and they\'ll point you to the next place.</p>' +
      '<p style="margin:0;color:#ffe36a">Earn ' + FACE_AT + ' stars in an area to open its face-off.</p>' +
      '<div class="ckacts"><button type="button" class="ckbtn hot" data-act="go" data-pad-default>LET\'S GO</button></div></div>', acts: { go: function () { expedition(null); } } });
}
function expArea(i) {
  var a = EXP[i], c = COURSES[a.c], acts = {}, h = '<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">' + pic(a.r, 64) + '<div><div style="font-family:var(--display);font-size:22px;color:var(--bone)">' + esc(CH[a.r].n) + '</div><div style="font-size:15px;color:#ffe36a">' + esc(a.q) + '</div><div style="font-size:12px;color:var(--ash)">' + clsName(a.cls) + ' class  ·  ★ ' + areaStars(i) + '/24</div></div></div><div class="ckg">';
  a.events.forEach(function (e, j) {
    var op = evOpen(e), st = evStars(e.id), T = EVT[e.t], face = e.t === 'face';
    acts['e' + j] = function () { expBrief(e); };
    h += '<button type="button" class="ckbtn ckc" data-act="e' + j + '"' + (op ? '' : ' disabled') + (op && st < 3 && !h.match(/data-pad-default/) ? ' data-pad-default' : '') + (face ? ' style="box-shadow:inset 0 0 0 2px #ffe36a"' : '') + '>' +
      '<div style="display:flex;gap:10px;align-items:center">' + (portrait(T.ic, 36, '#0a0506') ? '<img src="' + portrait(face ? 'ck_gold' : T.ic, 36, '#0a0506') + '" width="36" height="36" style="image-rendering:pixelated" alt="">' : '') + '<div style="min-width:0"><span style="font-size:11px;letter-spacing:.14em;color:' + (face ? '#ffe36a' : '#ff2630') + '">' + (j + 1) + '. ' + T.n.toUpperCase() + (e.o.rev ? ' · BACKWARDS' : '') + '</span><b style="display:block;font-size:20px">' + esc(e.n) + '</b></div></div>' +
      '<em style="font-size:18px">' + starStr(st) + '</em>' + (op ? '' : '<span class="lock">' + (face ? 'Earn ' + FACE_AT + ' stars here first' : 'Locked') + '</span>') + '</button>';
  });
  screen({ title: c.n, sub: 'Expedition  ·  area ' + (i + 1) + ' of ' + EXP.length, back: function () { expedition(null); }, redo: function () { expArea(i); }, acts: acts, html: h + '</div>' });
}
function evGoals(e) { // what each star needs, in words
  var t = e.t, o = e.o;
  if (t === 'race') return ['3rd', '2nd', '1st'];
  if (t === 'duel' || t === 'face') return o.hitless ? ['Win', 'Win with 1 hit or less', 'Win without being hit'] : ['Win', 'Win by 1 second', 'Win by 3 seconds'];
  if (t === 'nado') return ['Top three', 'Top two', 'Last one standing'];
  if (t === 'pursuit') return ['Catch them', 'With 20 s left', 'With 40 s left'];
  if (t === 'rings') return ['Reach the finish', '5 s left', '10 s left'];
  return ['Bronze', 'Silver', 'Gold'];
}
function expBrief(e) {
  var a = EXP[e.a], T = EVT[e.t], vs = e.t === 'face' ? a.r : e.o.vs, g = evGoals(e), st = evStars(e.id);
  screen({ cls: 'solid', title: e.n, sub: T.n + (e.o.rev ? '  ·  backwards' : '') + '  ·  ' + esc(COURSES[a.c].n), back: function () { expArea(e.a); }, redo: function () { expBrief(e); }, foot: false,
    html: '<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:12px">' +
      (vs ? '<div style="display:flex;gap:12px;align-items:center">' + pic(vs, 64) + '<div><div style="font-family:var(--display);font-size:24px">' + esc(CH[vs].n) + '</div><div style="font-size:14px;color:#ffe36a">' + esc(e.t === 'face' ? a.q : (SAYS[vs] || [''])[0]) + '</div></div></div>' : '') +
      '<p style="margin:0;font-size:16px;line-height:1.45">' + esc(T.d) + (e.o.hitless ? ' Hitless: every hit you take costs a star.' : '') + (e.o.cat ? ' Watch out for Sir Johnathan.' : '') + '</p>' +
      '<div class="ckres">' + g.map(function (x, i) { return '<div class="ckr' + (st > i ? ' me' : '') + '" style="grid-template-columns:auto 1fr"><span class="pl" style="font-size:20px;color:#ffe36a">' + starStr(i + 1, i + 1) + '</span><span class="nm">' + esc(x) + '</span></div>'; }).join('') + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' + pic(SV.ch, 40) + '<span>Driving: <b>' + esc(CH[SV.ch].n) + '</b></span></div>' +
      '<div class="ckacts"><button type="button" class="ckbtn hot" data-act="go" data-pad-default>START</button><button type="button" class="ckbtn" data-act="drv">CHANGE DRIVER</button></div></div>',
    acts: { go: function () { expGo(e); }, drv: function () { pickChar(function () { expBrief(e); }, function () { expBrief(e); }); } } });
}

/* ---------- running an event ---------- */
var EXPCUR = null;
function expEvent(id) { var p = String(id).split('_'); return EXP[+p[0]] && EXP[+p[0]].events[+p[1]]; }
function evDefMod(e) { // how an event changes its course: backwards, extra boost pads, drops everywhere, more boxes
  var o = e.o, t = e.t;
  return function (def) {
    var d = {}; for (var k in def) d[k] = def[k];
    if (o.rev) { d.pts = def.pts.slice().reverse(); d.boxes = (def.boxes || []).map(function (f) { return 1 - f; }); }
    if (t === 'boost') { d.boosts = []; for (var f = 0.04; f < 1; f += 0.07) d.boosts.push([f, ((f * 17) % 1.6) - 0.8]); d.boxes = []; }
    if (t === 'drops') { d.drops = []; for (var f2 = 0.02; f2 < 1; f2 += 0.06) d.drops.push([f2, ((f2 * 13) % 1.4) - 0.7, 4]); }
    if (t === 'pursuit') d.boxes = (def.boxes || []).concat([0.33, 0.66, 0.95]);
    return d;
  };
}
function expGo(e) {
  var a = EXP[e.a], o = e.o, t = e.t, me = SV.ch, rivals = [], mode = 'race';
  var vs = t === 'face' ? a.r : o.vs;
  if (vs && vs === me) me = vs === 'cumhead' ? 'spermaid' : 'cumhead'; // you can't race yourself
  if (t === 'race' || t === 'nado') rivals = shuffle(CHARS.filter(function (c) { return c.id !== me && c.id !== 'sirj' && c.id !== 'kingblum'; }).map(function (c) { return c.id; })).slice(0, o.riv || 7);
  else if (vs) rivals = [vs];
  if (t === 'drift' || t === 'rings' || t === 'boost' || t === 'drops' || t === 'ghost') mode = 'tt';
  var defMod = evDefMod(e);
  EXPCUR = e; GP = null;
  var grid = t === 'nado' ? [1, 2, 0].concat(rivals.slice(2).map(function (r, i) { return i + 3; })) : null;
  go({ grid: grid, course: a.c, cls: a.cls, player: me, rivals: rivals, mode: mode, laps: o.laps || (t === 'drift' || t === 'drops' || t === 'nado' || t === 'pursuit' ? 99 : 3), defMod: defMod, ev: e, noCuppa: true });
}
function isHuman(R, k) { return (R.humans || [0]).indexOf(k.idx) >= 0; }
function evHumans(R) { return R.karts.filter(function (k) { return isHuman(R, k); }); }
function evInit(R) {
  var e = R.ev, t = e.t, o = e.o, par = parLap(R); R.evs = { t: 0, score: 0, out: [], hits: {}, par: par, dcur: {}, rank: 0 };
  R.foe = R.karts.filter(function (k) { return !isHuman(R, k); })[0] || null; // the rival, or the one you're chasing
  if (t === 'drift' || t === 'drops') R.evs.left = o.time || 60;
  if (t === 'drift') R.boxes = [];
  if (t === 'pursuit' && R.foe) { R.evs.left = (o.time || 90) + 10; R.evs.hp = Math.max(2, (o.hp || 4) - 1); var tg = R.foe; tg.target = true; var q = R.T.pos(10, 0); tg.x = q.x; tg.z = q.z; tg.y = q.y; tg.seg = 10 % R.T.N; tg.lap = 1; tg.half = false; tg.prog = R.T.N + tg.seg; tg.skill = R.cls.ai * 0.95; }
  if (t === 'nado') R.evs.next = (o.every || 20) + 8;
  if (t === 'rings') { // gates every 18 samples, weaving across the road; time starts short and each gate adds some. Two players share the gates.
    var n = 0; R.gates = []; for (var i = 10; i < R.T.N - 4; i += 18) { R.gates.push({ i: i, lat: Math.sin(i * 0.37) * R.def.hw * 0.42, lap: -1, laps: {}, got: {} }); n++; }
    var laps = R.laps, start = par * 0.8; R.evs.bonus = (par * laps * 1.05 + 8 - start) / Math.max(1, n * laps); R.evs.left = start;
  }
  if ((t === 'duel' || t === 'face') && R.foe) { var rv = R.foe; rv.skill = R.cls.ai * (t === 'face' ? (o.boss ? 1.07 : 1.04) : 1.0); rv.rival = true; if (o.boss) rv.top *= 1.04; }
  if (t === 'ghost' || t === 'boost') { var L = R.laps * par; R.evs.goal = [L * 1.1, L * 0.98, L * 0.9]; }
  if (t === 'drift') { var s = (o.time || 60) / 60, two = evHumans(R).length > 1 ? 1.5 : 1; R.evs.goal = [1200 * s * two, 2600 * s * two, 4000 * s * two].map(function (v) { return Math.round(v / 50) * 50; }); }
  if (t === 'drops') { var s2 = (o.time || 60) / 60, two2 = evHumans(R).length > 1 ? 1.4 : 1; R.evs.goal = [Math.round(28 * s2 * two2), Math.round(48 * s2 * two2), Math.round(66 * s2 * two2)]; }
}
function evFinish(R, ok) { // the event is over: let the karts roll on for a moment, then the results
  if (R.evs.over) return; R.evs.over = true; R.evs.ok = ok; R.phase = 'done'; R.doneT = 0; R.me.done = true; sfx.play(ok ? 'win' : 'lose'); music.play(ok ? 'ck_win' : 'ck_results');
}
function evStep(R, dt) {
  var e = R.ev, t = e.t, X = R.evs, me = R.me, H = evHumans(R); if (R.phase !== 'go' && !X.over) return;
  if (X.over) { X.endT = (X.endT || 0) + dt; if (X.endT > 2.2 && !R.ended) { R.ended = true; endRace(); } return; }
  X.t += dt;
  if (X.left !== undefined && t !== 'rings') { X.left -= dt; if (X.left <= 0) { X.left = 0; evFinish(R, t === 'drift' || t === 'drops'); return; } }
  if (t === 'drift') H.forEach(function (k) { // points for drifts as they are let go; two players add theirs together
    var c = X.dcur[k.idx] || 0;
    if (k.drift && k.driftLvl > 0) X.dcur[k.idx] = [0, 100, 250, 500][k.driftLvl] + Math.round((k.driftT || 0) * 40);
    else { if (c) { X.score += c; R.fx.push({ k: 'pop', x: k.x, y: k.y + 1.4, z: k.z, t: 0.3 }); } X.dcur[k.idx] = 0; }
    X.cur = Object.keys(X.dcur).reduce(function (a, q) { return a + X.dcur[q]; }, 0);
  });
  if (t === 'drops') { X.score = H.reduce(function (a, k) { return a + (k.got || 0); }, 0); R.drops.forEach(function (d) { if (d.t > 3) d.t = 3; }); }
  if (t === 'rings') {
    X.left -= dt; if (X.left <= 0) { X.left = 0; evFinish(R, false); return; }
    if (me.ai) { var ng = R.gates.filter(function (g) { return g.lap !== me.lap && (g.i - me.seg + R.T.N) % R.T.N < 30; })[0]; if (ng) { me.lane = ng.lat / (R.def.hw * 0.75); me.laneT = 1; } } // the autopilot aims for the next gate
    H.forEach(function (k) { R.gates.forEach(function (g) {
      if (g.laps[k.idx] === k.lap) return; var di = (k.seg - g.i + R.T.N) % R.T.N; if (di < 0 || di >= 2) return; g.laps[k.idx] = k.lap; if (k === me) g.lap = k.lap;
      if (Math.abs(k.lat - g.lat) < 3.8) { if (!g.got[k.lap]) { g.got[k.lap] = 1; X.left += X.bonus; X.score++; if (k === me) sfx.play('coin'); R.fx.push({ k: 'box', x: k.x, y: k.y + 1, z: k.z, t: 0.35 }); } } else if (k === me) sfx.play('back');
    }); });
  }
  if (t === 'pursuit' && R.foe) {
    var tg = R.foe; if (tg._lastInv === undefined) tg._lastInv = 0;
    if (tg.invT > 0 && tg._lastInv <= 0 && (tg.spinT > 0 || tg.splatT > 0 || tg.gooT > 0 || tg.revT > 0 || tg.tinyT > 0 || tg.hicT > 0)) { X.hp--; X.score++; sfx.play('boom'); R.msg = { who: tg.c.n, s: X.hp > 0 ? X.hp + ' more!' : 'Got me!', t: 1.6 }; if (X.hp <= 0) { evFinish(R, true); } }
    tg._lastInv = tg.invT;
    var tick = Math.floor(X.t / 4) !== Math.floor((X.t - dt) / 4);
    H.forEach(function (k) {
      if (!k.item && !(k.roul > 0) && tick) { k.item = ['pie', 'sperm', 'sperm', 'sperm', 'sperm'][Math.floor(Math.random() * 5)]; k.itemN = ITEMS[k.item].n3 || 1; k.roul = 0.8; if (k === me) sfx.play('blip'); }
      if (k.item && ['pie', 'pie3', 'sperm'].indexOf(k.item) < 0 && !(k.roul > 0.5)) { k.item = Math.random() < 0.8 ? 'sperm' : 'pie'; k.itemN = 1; } // the boxes only give things to throw in a pursuit
    });
  }
  if (t === 'nado') { // every so often whoever is last gets eaten
    X.next -= dt; var alive = R.karts.filter(function (k) { return !k.out; });
    if (X.next <= 0 && alive.length > 1) {
      X.next = e.o.every || 20; var last = alive.slice().sort(function (a, b) { return a.prog - b.prog; })[0]; last.out = true; X.out.push(last); R.fx.push({ k: 'pop', x: last.x, y: last.y + 1, z: last.z, t: 0.6, big: 1 }); sfx.play('roar');
      R.msg = { who: 'Meatnado', s: (last === me ? 'You' : last.tag || last.c.n) + ' got eaten!', t: 2 };
      if (isHuman(R, last)) { last.eatenRank = alive.length; if (last.remote && typeof netEmit === 'function') netEmit(last, { e: 'eaten' }); }
      R.karts = R.karts.filter(function (k) { return !k.out; }); // eaten: gone from the race
      var left = evHumans(R);
      if (!left.length) { X.rank = Math.min.apply(null, H.map(function (k) { return k.eatenRank || 99; })); evFinish(R, false); return; }
      if (R.karts.length === 1) { X.rank = 1; evFinish(R, true); return; }
      if (last === me) { me.done = true; R.msg = { who: 'Meatnado', s: 'You got eaten! Cheer your partner on.', t: 3 }; }
    }
  }
  if (t === 'face' && e.o.cat && !X.cat && R.foe && H.some(function (k) { return k.lap >= 2; })) { X.cat = 1; var gr = R.foe, lead = R.karts.filter(function (k) { return k.place === 1; })[0]; R.proj.push({ k: 'cat', x: gr.x, z: gr.z, y: gr.y, seg: gr.seg, tgt: lead, life: 20, by: gr, safe: 99, sp: 60 }); R.msg = { who: 'Sir Johnathan', s: '"Mrrrow."', t: 2.2 }; sfx.play('roar'); }
  if ((t === 'face' || t === 'duel') && e.o.hitless) H.forEach(function (k) { var on = k.invT > 0; if (on && !X['_inv' + k.idx]) X.hits[k.idx] = (X.hits[k.idx] || 0) + 1; X['_inv' + k.idx] = on; });
}
/* the stars for how it went: with two players, the better of the two counts for both */
function evResult(R) {
  var H = (R.all || R.karts).filter(function (k) { return isHuman(R, k); }), best = null;
  H.forEach(function (k) { var r = evResultFor(R, k); if (!best || r.s > best.s) best = r; });
  return best || { s: 0, line: '' };
}
function evResultFor(R, me) {
  var e = R.ev, t = e.t, X = R.evs, s = 0, line = '', who = me === R.me ? 'You' : (me.tag || me.c.n), all = R.all || R.karts;
  if (t === 'race') { s = me.place <= 3 ? 4 - me.place : 0; line = who + ' came ' + ordinal(me.place); }
  else if (t === 'duel' || t === 'face') { var rv = R.foe, gap = rv ? rv.time - me.time : 0, hits = X.hits[me.idx] || 0; if (!rv || (me.done && gap > 0)) { s = e.o.hitless ? Math.max(1, 3 - hits) : gap >= 3 ? 3 : gap >= 1 ? 2 : 1; line = who + ' won by ' + gap.toFixed(2) + ' s' + (e.o.hitless ? '  ·  hits taken: ' + hits : ''); } else line = rv.c.n + ' won by ' + (-gap).toFixed(2) + ' s'; }
  else if (t === 'nado') { var rank = me.eatenRank || X.rank || 1; if (!me.eatenRank && X.rank && X.ok) rank = 1; s = rank === 1 ? 3 : rank === 2 ? 2 : rank === 3 ? 1 : 0; line = rank === 1 ? 'Last one standing!' : who + ' got eaten in ' + ordinal(rank) + ' place'; }
  else if (t === 'pursuit') { if (X.ok) { s = X.left >= 40 ? 3 : X.left >= 20 ? 2 : 1; line = 'Caught with ' + X.left.toFixed(1) + ' s left'; } else line = 'They got away (' + X.hp + (X.hp === 1 ? ' hit' : ' hits') + ' short)'; }
  else if (t === 'rings') { if (!X.over) { s = X.left >= 10 ? 3 : X.left >= 5 ? 2 : 1; line = X.score + ' gates  ·  ' + X.left.toFixed(1) + ' s left'; } else line = 'Out of time (' + X.score + ' gates)'; }
  else if (t === 'ghost' || t === 'boost') { var tm = me.done ? me.time : 1e9; s = tm <= X.goal[2] ? 3 : tm <= X.goal[1] ? 2 : tm <= X.goal[0] ? 1 : 0; line = me.done ? who + ': ' + fmtTime(tm) + '  ·  gold ' + fmtTime(X.goal[2]) : who + ' did not finish'; }
  else if (t === 'drift' || t === 'drops') { var sc = X.score; s = sc >= X.goal[2] ? 3 : sc >= X.goal[1] ? 2 : sc >= X.goal[0] ? 1 : 0; line = (t === 'drift' ? sc + ' drift points' : sc + ' drops') + '  ·  gold ' + X.goal[2]; }
  return { s: s, line: line };
}
function expEnd(R) {
  var e = R.ev, res = evResult(R), X = XS(), prev = evStars(e.id), a = EXP[e.a], got = [];
  if (res.s > prev) X.stars[e.id] = res.s;
  SV.drops = (SV.drops || 0) + (R.got || 0);
  if (e.t === 'face' && res.s > 0) {
    if (!X.beat[e.a]) { X.beat[e.a] = 1; if (EXP[e.a + 1]) got.push('Next area: ' + COURSES[EXP[e.a + 1].c].n); }
    if (CH[a.r].lock && !SV.unlock[a.r]) { SV.unlock[a.r] = 1; got.push(CH[a.r].n + ' can now drive'); }
  }
  persist();
  if (R.net === 'host') netBroadcast({ t: 'end', kind: 'exp', id: e.id, s: res.s, line: res.line, title: e.n, sub: EVT[e.t].n });
  if (e.o.final && res.s > 0 && !X.won) { X.won = 1; persist(); return expEnding(); }
  var next = a.events[e.j + 1];
  screen({ cls: 'solid', title: e.n, sub: EVT[e.t].n, back: function () { RACE = null; expArea(e.a); }, foot: false,
    html: '<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center">' +
      '<div style="font-size:54px;line-height:1;color:#ffe36a;letter-spacing:.08em;text-shadow:2px 2px 0 #12040a">' + starStr(res.s) + '</div>' +
      '<div class="ckmsg">' + (res.s ? (res.s > prev ? (prev ? 'New best!' : 'Cleared!') : 'Cleared') : 'Not this time') + '</div><p style="margin:0;font-size:16px">' + esc(res.line) + '</p>' +
      (got.length ? '<p style="margin:0;color:#ffe36a">' + got.map(esc).join('<br>') + '</p>' : '') +
      '<div class="ckacts"><button type="button" class="ckbtn hot" data-act="' + (res.s && next && evOpen(next) ? 'next' : 'again') + '" data-pad-default>' + (res.s && next && evOpen(next) ? 'NEXT EVENT' : 'TRY AGAIN') + '</button>' + (res.s && next && evOpen(next) ? '<button type="button" class="ckbtn" data-act="again">TRY AGAIN</button>' : '') + '<button type="button" class="ckbtn" data-act="area">' + esc(COURSES[a.c].n.toUpperCase()) + '</button></div></div>',
    acts: { next: function () { expBrief(next); }, again: function () { expGo(e); }, area: function () { RACE = null; expArea(e.a); } } });
}
function expEnding() {
  screen({ cls: 'solid', title: 'The Crimson Moon Trophy is yours', foot: false,
    html: '<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center;font-size:16px;line-height:1.5">' +
      '<img src="' + portrait('ck_gold', 96, '#0e0708') + '" width="96" height="96" style="image-rendering:pixelated" alt="">' +
      '<p style="margin:0">Blumhead skids off the edge of The Crimson Moon and drops the trophy on the way. You catch it one-handed.</p>' +
      '<div style="display:flex;gap:10px;align-items:center">' + pic('blum', 56) + '<p style="margin:0;color:#ffe36a">"THE LOAD AT THE END... next year."</p></div>' +
      '<p style="margin:0">Back on Clubhouse Row everyone you raced is waiting. TB says something unrepeatable. Greebo has made a pie.</p>' +
      '<p style="margin:0;color:#a6968f">Stars so far: ' + totalStars() + ' / ' + EXP.length * 24 + '. Go back for the ones you missed.</p>' +
      '<div class="ckacts"><button type="button" class="ckbtn hot" data-act="ok" data-pad-default>BACK TO THE MAP</button></div></div>', acts: { ok: function () { RACE = null; expedition(null); } } });
}

/* ---------- drawing: gates, and the event panel on the HUD ---------- */
function evDraw(R, dm, glow, A) {
  if (!R.gates) return; var me = R.me, T = A.tile('glow'), uv = [0.1, 0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1];
  R.gates.forEach(function (g) {
    var s = R.T.S[g.i], done = g.lap === me.lap, d = Math.abs(s.x - me.x) + Math.abs(s.z - me.z); if (d > 170) return;
    var w = 3.8, H = 4.2, c = done ? [0.16, 0.12, 0.1] : [0.62, 0.55, 0.3], hc = done ? [0.05, 0.04, 0.03] : [0.5, 0.36, 0.08];
    function P(l, h, t) { return [s.x + s.nx * l + s.tx * t, s.y + h, s.z + s.nz * l + s.tz * t]; }
    // two posts and a bar across the top, standing across the road like an arch
    [-1, 1].forEach(function (sd) { var l = g.lat + sd * w; dm.quad(P(l - 0.25, 0, 0), P(l + 0.25, 0, 0), P(l + 0.25, H, 0), P(l - 0.25, H, 0), uv, T, c); dm.quad(P(l, 0, -0.25), P(l, 0, 0.25), P(l, H, 0.25), P(l, H, -0.25), uv, T, c);
      for (var h = 0; h < 3; h++) spark(glow, A, s.x + s.nx * l, s.y + 0.6 + h * 1.6, s.z + s.nz * l, 0.9, 'halo', hc); });
    dm.quad(P(g.lat - w, H - 0.5, 0), P(g.lat + w, H - 0.5, 0), P(g.lat + w, H, 0), P(g.lat - w, H, 0), uv, T, c);
    if (!done) spark(glow, A, s.x + s.nx * g.lat, s.y + H - 0.2, s.z + s.nz * g.lat, 2.2, 'halo', [0.35, 0.25, 0.05]);
  });
}
function evHud(R) {
  var e = R.ev, X = R.evs, t = e.t; if (!X || R.phase === 'intro') return;
  var w = 150, x = 165, y = 52; KIT.panel(x, y, w, 26);
  var lab = EVT[t].n.toUpperCase(), val = '';
  if (t === 'drift') val = (X.score + (X.cur || 0)) + ' PTS  ' + Math.ceil(X.left) + 'S';
  else if (t === 'drops') val = X.score + ' DROPS  ' + Math.ceil(X.left) + 'S';
  else if (t === 'rings') val = X.score + ' GATES  ' + X.left.toFixed(1) + 'S';
  else if (t === 'pursuit') val = 'HITS LEFT ' + X.hp + '  ' + Math.ceil(X.left) + 'S';
  else if (t === 'nado') val = R.karts.filter(function (k) { return !k.out; }).length + ' LEFT  NEXT ' + Math.ceil(X.next) + 'S';
  else if (t === 'ghost' || t === 'boost') { var g = X.goal, tm = R.me.time; val = (tm <= g[2] ? 'GOLD ' + fmtTime(g[2]) : tm <= g[1] ? 'SILVER ' + fmtTime(g[1]) : tm <= g[0] ? 'BRONZE ' + fmtTime(g[0]) : 'TOO SLOW'); }
  else if ((t === 'duel' || t === 'face') && R.foe) val = 'VS ' + R.foe.c.n.toUpperCase();
  else val = e.n.toUpperCase();
  text(lab, x + w / 2, y + 5, { size: 6, align: 'center', col: '#a6968f' }); text(val, x + w / 2, y + 15, { size: 6, align: 'center', col: '#ffe36a', max: w - 8 });
}
