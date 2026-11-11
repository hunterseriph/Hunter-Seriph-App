/* =====================================================================================================
   PULSAR'S OCTOBEATS: PulsarOctopus's rhythm game. Notes fall down the lanes in time with the music and you hit them
   as they cross the line. Every chart is written from the song itself (its melody, its bass and its drums), so every
   song from every one of our games can be played. Four lanes on EASY, NORMAL and HARD; OCTO uses all eight (d-pad and
   face buttons together, one for each of Pulsar's arms). Holds: keep the button down to the end of the tail.
   ===================================================================================================== */
var W = 480, H = 270;
var SV = KIT.load('ob-save', null) || { best: {}, clears: 0, off: 0, speed: 1 };
function persist() { KIT.save('ob-save', SV); }
var SONGLIST = [
  ['pulsar1', 'Just Vibes', 'PulsarOctopus'], ['pulsar2', 'Beat Drop', 'PulsarOctopus'], ['town', 'Clubhouse Row', 'Load Legacy'], ['obgroove', 'Octo Groove', 'PulsarOctopus'],
  ['castle', 'Castle Stomp', 'Load Legacy'], ['sewer', 'The Cream Sewers', 'Load Legacy'], ['pulsar3', 'Deep Blue', 'PulsarOctopus'], ['park', 'Ejaculand Waltz', 'Load Legacy'],
  ['roof', 'Rooftop Run', 'Load Legacy'], ['bpig', 'Brothers Load', 'Load Legacy'], ['bone', 'Bone Xylophone', 'Load Legacy'], ['dungeon', 'Down in the Dungeon', 'Load Legacy'],
  ['bboner', 'The Big Boner', 'Load Legacy'], ['moonarea', 'The Crimson Moon', 'Load Legacy'], ['furnace', 'The Furnace', 'Load Legacy'], ['brat', 'Cult of the Rat', 'Load Legacy'],
  ['bsperm', 'The Sperminator', 'Load Legacy'], ['bbeast', 'Cum-starved Beast', 'Load Legacy'], ['lair', "Blumhead's Lair", 'Load Legacy'], ['bmoon', 'Moon Boss', 'Load Legacy'],
  ['obrush', 'Eight Arm Rush', 'PulsarOctopus'], ['boss', 'Boss Fight', 'Load Legacy'], ['bhot', 'The Hot Load', 'Load Legacy'], ['blum', 'Blumhead', 'Load Legacy'],
  ['bdemon', 'Legion of Semen Demon', 'Load Legacy'], ['bmega', 'Mega Blumhead', 'Load Legacy'], ['super', 'Super Blumhead', 'Load Legacy']];
var DIFFS = [{ id: 'easy', n: 'EASY', lanes: 4 }, { id: 'normal', n: 'NORMAL', lanes: 4 }, { id: 'hard', n: 'HARD', lanes: 4 }, { id: 'octo', n: 'OCTO', lanes: 8 }];
var LANECOL = ['#c04aff', '#4adfff', '#7aff6a', '#ff4a8a', '#ffe36a', '#ff7a2a', '#f1e7d0', '#ff2630'];
var LANEKEY = ['◀', '▼', '▲', '▶', 'X', 'A', 'Y', 'B'];
var JUDGE = [['PERFECT', 0.05, 300, '#ffe36a'], ['GREAT', 0.095, 200, '#7aff6a'], ['GOOD', 0.14, 100, '#4adfff']], MISSW = 0.17;
function unlocked(i) { return i < 8 + SV.clears * 2; }
KIT.setKeymap({ ArrowLeft: 'l0', ArrowDown: 'l1', ArrowUp: 'l2', ArrowRight: 'l3', KeyD: 'l0', KeyF: 'l1', KeyJ: 'l2', KeyK: 'l3',
  KeyA: 'l0', KeyS: 'l1', KeyL: 'l6', Semicolon: 'l7', KeyC: 'l4', KeyZ: 'l5', KeyV: 'l6', KeyX: 'l7', KeyW: 'none', KeyQ: 'none', KeyE: 'none' });

/* ---------- charts: written from the song ---------- */
function chartFor(id, diff) {
  var sp = music.songs[id], C = music.compile(sp), len = C.len, sd = 60 / sp.bpm / 4, loops = Math.max(1, Math.min(4, Math.round(80 / (len * sd)))), out = [];
  var lo = 999, hi = 0; C.ev.forEach(function (evs) { evs.forEach(function (e) { if (e.k === 'lead') { lo = Math.min(lo, e.n); hi = Math.max(hi, e.n); } }); });
  var span = Math.max(1, hi - lo), lanes = diff.lanes, lastLane = -1, lastS = -9, prevN = null;
  function laneOf(n, base, nl) { var l = base + Math.min(nl - 1, Math.floor((n - lo) / span * nl * 0.999)); return l; }
  for (var lp = 0; lp < loops; lp++) for (var s = 0; s < len; s++) {
    var evs = C.ev[s], S = lp * len + s;
    var lead = evs.filter(function (e) { return e.k === 'lead'; })[0], bass = evs.filter(function (e) { return e.k === 'bass'; })[0], drum = evs.filter(function (e) { return e.k === 'drum'; }).map(function (e) { return e.t; }).join('');
    if (lead) {
      if (diff.id === 'easy' && s % 4) continue;
      var base = diff.id === 'octo' ? 4 : 0, nl = 4, l = laneOf(lead.n, base, nl);
      if (prevN !== null && lead.n !== prevN && l === lastLane && S - lastS < 3) l = base + ((l - base) + (lead.n > prevN ? 1 : 3)) % 4; // contour: it moves when the tune moves
      var hold = (diff.id !== 'easy' && lead.d >= 6) ? lead.d - 1 : 0;
      out.push({ s: S, l: l, h: hold }); lastLane = l; lastS = S; prevN = lead.n;
      if (diff.id === 'hard' && drum.indexOf('s') >= 0 && s % 8 === 4) { var l2 = (l + 2) % 4; out.push({ s: S, l: l2, h: 0 }); }
      continue;
    }
    if (diff.id === 'hard' && drum.indexOf('s') >= 0 && S - lastS >= 2) { var l3 = (lastLane + 1 + (s >> 2)) % 4; out.push({ s: S, l: l3, h: 0 }); lastLane = l3; lastS = S; }
    if (diff.id === 'normal' && drum.indexOf('s') >= 0 && S - lastS >= 4 && s % 8 === 4) { out.push({ s: S, l: (lastLane + 2) % 4, h: 0 }); lastS = S; }
  }
  if (diff.id === 'octo') { // the left hand plays the bass and the kick drum on the d-pad
    var bl = 0; for (var lp2 = 0; lp2 < loops; lp2++) for (var s2 = 0; s2 < len; s2 += 2) { var evs2 = C.ev[s2], S2 = lp2 * len + s2, b = evs2.filter(function (e) { return e.k === 'bass'; })[0], k = evs2.some(function (e) { return e.k === 'drum' && /k/.test(e.t); });
      if (b && s2 % 4 === 0) { bl = ((b.n % 12) >> 2) % 4; out.push({ s: S2, l: bl, h: b.d >= 8 ? Math.min(b.d, 12) - 1 : 0 }); } else if (k && s2 % 4 === 2) out.push({ s: S2, l: (bl + 2) % 4, h: 0 }); } }
  out.sort(function (a, b) { return a.s - b.s || a.l - b.l; });
  var seen = {}; out = out.filter(function (n) { var key = n.s + ':' + n.l; if (seen[key]) return false; seen[key] = 1; return true; });
  return { notes: out, end: loops * len, sd: sd, bpm: sp.bpm, beats: sp.beats || 4 };
}

/* ---------- playing ---------- */
var G = { mode: 'title', t: 0 }, R = null, FX = [], BEAT = 0;
function startSong(i, d) {
  var id = SONGLIST[i][0], diff = DIFFS[d], ch = chartFor(id, diff);
  R = { i: i, id: id, d: d, diff: diff, ch: ch, notes: ch.notes.map(function (n) { return { s: n.s, l: n.l, h: n.h, hit: 0, done: 0, held: 0 }; }), score: 0, combo: 0, max: 0, life: 0.6,
    cnt: [0, 0, 0, 0], judge: null, fail: 0, t: 0, started: 0, endT: 0, hold: {}, lanes: diff.lanes, bump: [] };
  for (var l = 0; l < 8; l++) R.bump[l] = 0;
  G.mode = 'play'; KIT.closeMenu(); music.stop(0.1); R.wait = 16 * ch.sd; R.st = -16; // a bar of count-in, the notes already coming
}
function nowStep() { if (!R) return -99; if (!R.started) return -R.wait / R.ch.sd; var p = music.pos(), ac = music.ctx, live = p > -4 && ac && ac.state === 'running' && !sfx.muted && music.current === R.id; return (live ? p : R.clk / R.ch.sd) - SV.off / 1000 / R.ch.sd; } // the song's own clock (or ours when the sound is off) // song step, with the player's offset
function judgeLine() { return H - 46; }
function update(dt) {
  G.t += dt; FX = FX.filter(function (f) { f.t -= dt; return f.t > 0; });
  if (G.mode !== 'play' || !R) return;
  if (R.started) R.clk += dt;
  if (R.wait > 0) { R.wait -= dt; if (R.wait <= 0) { music.play(R.id); R.started = 1; R.wait = 0; R.clk = 0; } }
  var st = nowStep(); if (st < -50) return; R.st = st; BEAT = st / 4;
  var sd = R.ch.sd;
  for (var l = 0; l < 8; l++) R.bump[l] = Math.max(0, R.bump[l] - dt * 6);
  // presses
  for (var k = 0; k < 8; k++) { var lane = R.lanes === 4 ? k % 4 : k; if (KIT.pressed('l' + k) || tapQ[k]) press(lane, st); }
  tapQ = {};
  // misses and holds
  R.notes.forEach(function (n) {
    if (n.done) return;
    if (!n.hit && (st - n.s) * sd > MISSW) { n.done = 1; miss(n); return; }
    if (n.hit && n.h) { var down = laneHeld(n.l); if (st >= n.s + n.h) { n.done = 1; R.score += 50 * n.h; addFx('hold', n.l); } else if (!down && st < n.s + n.h - 1) { n.done = 1; n.dropped = 1; R.combo = 0; R.life -= 0.03; } else R.score += 1; }
  });
  if (R.life <= 0 && !R.fail) { R.fail = 1; R.life = 0; sfx.play('lose'); music.stop(1.2); setTimeout(results, 1400); G.mode = 'over'; return; }
  if (st > R.ch.end + 4 && !R.endT) { R.endT = 1; music.stop(1.5); setTimeout(results, 900); G.mode = 'over'; }
}
function laneHeld(l) { if (touchHeld[l]) return true; if (R.lanes === 4) return KIT.held('l' + l) || KIT.held('l' + (l + 4)); return KIT.held('l' + l); }
function press(lane, st) {
  R.bump[lane] = 1; var sd = R.ch.sd, best = null, bd = 9;
  R.notes.forEach(function (n) { if (n.hit || n.done || n.l !== lane) return; var d = Math.abs(n.s - st) * sd; if (d < bd) { bd = d; best = n; } });
  if (!best || bd > MISSW) return; // a press with nothing near it costs nothing
  var j = JUDGE.findIndex(function (q) { return bd <= q[1]; }); if (j < 0) { best.done = 1; miss(best); return; }
  best.hit = 1; if (!best.h) best.done = 1; R.cnt[j]++; R.combo++; R.max = Math.max(R.max, R.combo);
  R.score += Math.round(JUDGE[j][2] * (1 + Math.min(R.combo, 100) / 100)); R.life = Math.min(1, R.life + [0.025, 0.015, 0.004][j]);
  R.judge = { j: j, t: 0.5, late: best.s < st }; addFx('hit', lane, JUDGE[j][3]); if (j === 0) sfx.play('tick');
}
function miss(n) { R.cnt[3]++; R.combo = 0; R.life -= 0.06; R.judge = { j: 3, t: 0.5 }; }
function addFx(k, l, col) { var x = laneX(l); for (var i = 0; i < (k === 'hold' ? 14 : 8); i++) FX.push({ x: x, y: judgeLine(), vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 110, t: 0.5, col: col || LANECOL[l] }); }

/* touch: tap the lanes themselves, any number of fingers at once */
var tapQ = {}, touchHeld = {}, TID = {};
function laneAtX(x) { if (!R) return -1; var w = laneW(), x0 = W / 2 - w * R.lanes / 2, l = Math.floor((x - x0) / w); if (x < x0 - 30 || x > x0 + w * R.lanes + 30) return -1; return Math.max(0, Math.min(R.lanes - 1, l)); }
function tcan(t) { var r = KIT.canvas.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), ox = r.left + (r.width - W * s) / 2; return (t.clientX - ox) / s; }
KIT.canvas.addEventListener('touchstart', function (e) { if (G.mode !== 'play' || !R) return; e.preventDefault(); for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i], l = laneAtX(tcan(t)); if (l < 0) continue; TID[t.identifier] = l; touchHeld[l] = 1; tapQ[l] = 1; } }, { passive: false });
function tend(e) { for (var i = 0; i < e.changedTouches.length; i++) { var l = TID[e.changedTouches[i].identifier]; if (l !== undefined) { delete TID[e.changedTouches[i].identifier]; touchHeld[l] = 0; } } }
KIT.canvas.addEventListener('touchend', tend); KIT.canvas.addEventListener('touchcancel', tend);

/* ---------- drawing ---------- */
function laneW() { return R && R.lanes === 8 ? 30 : 40; }
function laneX(l) { var w = laneW(); return W / 2 - w * R.lanes / 2 + w * (l + 0.5); }
var R_ = KIT.R;
function stageBack() {
  var b = BEAT % 1, pulse = 1 - b;
  KIT.blit(KIT.layer('ob-back', W, H, function () {
    var g = KIT.ctx; for (var y = 0; y < H; y += 6) R_(['#0e0614', '#120818', '#16081c', '#1a0a1e'][Math.min(3, (y / 70) | 0)], 0, y, W, 6);
    for (var i = 0; i < 14; i++) { var x = i * 36 - 4; R_('#1a0c24', x, 30, 2, 160); } // the rig over the stage
    R_('#22102c', 0, 26, W, 6); R_('#2e1438', 0, 26, W, 1);
    R_('#1c0c10', 0, 196, W, 74); for (var x2 = 0; x2 < W; x2 += 24) R_('#24101a', x2, 196, 1, 74); R_('#4a1a1c', 0, 196, W, 2);
    [[34, 120], [W - 70, 120]].forEach(function (p) { R_('#12040a', p[0] - 2, p[1] - 2, 40, 80); R_('#1e1218', p[0], p[1], 36, 76); [18, 52].forEach(function (cy) { g.fillStyle = '#0a0608'; g.beginPath(); g.arc(p[0] + 18, p[1] + cy, 12, 0, 6.3); g.fill(); g.fillStyle = '#2a1a22'; g.beginPath(); g.arc(p[0] + 18, p[1] + cy, 5, 0, 6.3); g.fill(); }); });
  }, { px: 1 }), 0, 0);
  var g = KIT.ctx; // beams that swing to the beat
  for (var i = 0; i < 6; i++) { var a = Math.sin(G.t * 0.8 + i * 1.7) * 0.5, x = 40 + i * 80, c = LANECOL[(i + Math.floor(BEAT)) % 8];
    g.save(); g.globalAlpha = 0.07 + pulse * 0.08; g.fillStyle = c; g.beginPath(); g.moveTo(x, 30); g.lineTo(x + Math.sin(a) * 200 - 30, 200); g.lineTo(x + Math.sin(a) * 200 + 30, 200); g.fill(); g.restore(); R_(c, x - 3, 28, 6, 4); }
  // speaker cones thump
  [[52, 138], [52, 172], [W - 52, 138], [W - 52, 172]].forEach(function (p) { g.fillStyle = 'rgba(255,38,48,' + (0.15 + pulse * 0.25) + ')'; g.beginPath(); g.arc(p[0], p[1], 6 + pulse * 3, 0, 6.3); g.fill(); });
}
var CROWD = null;
function crowd() {
  if (!CROWD) { CROWD = []; var br = ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood']; for (var i = 0; i < 16; i++) CROWD.push({ x: 8 + i * 30 + Math.random() * 10, k: 'h_' + br[i % br.length] + '_' + (i % 3 ? 'adult' : 'teen') + '_idle0', ph: Math.random() * 6, f: i % 2 }); }
  var b = BEAT % 1, jump = R && R.combo > 20;
  CROWD.forEach(function (c, i) { var hop = jump ? Math.max(0, Math.sin((BEAT + c.ph) * Math.PI)) * 6 : (1 - b) * 2; KIT.spr(c.k, c.x, H + 8 - hop, { flip: !!c.f, sx: 1 + (1 - b) * 0.05, sy: 1 - (1 - b) * 0.05 }); });
}
function pulsar() {
  var b = BEAT % 1, x = W - 64, y = 190, bob = Math.abs(Math.sin(BEAT * Math.PI)) * 5, g = KIT.ctx;
  for (var t = 0; t < 8; t++) { var a0 = -0.4 + t * 0.12, len = 26; g.strokeStyle = t % 2 ? '#6a2aa8' : '#8a3ad8'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); var px = x - 14 + t * 4, py = y - 14 - bob; g.moveTo(px, py);
    for (var k = 1; k <= 6; k++) { var w = Math.sin(G.t * 5 + t * 0.9 + k * 0.8) * (3 + k), q = k / 6; g.lineTo(px + (t - 3.5) * 6 * q + w, py + q * len); } g.stroke(); }
  KIT.spr('npc_pulsar', x, y - bob, { sc: 2, sx: 1 + (1 - b) * 0.06, sy: 1 - (1 - b) * 0.06 });
}
function highway() {
  var g = KIT.ctx, n = R.lanes, w = laneW(), x0 = W / 2 - w * n / 2, jl = judgeLine(), st = R.st === undefined ? -16 : R.st, spd = 30 * (SV.speed || 1); // pixels per step
  R_('rgba(8,4,8,0.93)', x0 - 6, 0, w * n + 12, H); R_('#4a1a1c', x0 - 6, 0, 2, H); R_('#4a1a1c', x0 + w * n + 4, 0, 2, H);
  for (var l = 0; l < n; l++) { R_(l % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.045)', x0 + l * w, 0, w, H); if (R.bump[l] > 0) { g.save(); g.globalAlpha = R.bump[l] * 0.35; g.fillStyle = LANECOL[l]; g.fillRect(x0 + l * w, jl - 120, w, 120); g.restore(); } }
  for (var bt = Math.ceil(st / 4) * 4; bt < st + 60; bt += 4) { var by = jl - (bt - st) * spd; if (by < 0) break; R_(bt % (4 * R.ch.beats) ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)', x0, by, w * n, 1); }
  // the line: Pulsar's suckers
  for (var l2 = 0; l2 < n; l2++) { var cx = x0 + (l2 + 0.5) * w, pr = laneHeld(l2) ? 1 : 0; g.fillStyle = '#12040a'; g.beginPath(); g.arc(cx, jl, w * 0.36 + 2, 0, 6.3); g.fill(); g.fillStyle = pr ? LANECOL[l2] : '#3a1a40'; g.beginPath(); g.arc(cx, jl, w * 0.36, 0, 6.3); g.fill();
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(cx, jl, w * 0.2, 0, 6.3); g.fill(); KIT.text(LANEKEY[R.lanes === 4 ? l2 : l2], cx, jl + w * 0.36 + 4, { align: 'center', size: 6, col: '#a6968f' }); }
  // notes
  R.notes.forEach(function (o) {
    if (o.done && !(o.hit && o.h && !o.dropped && st < o.s + o.h)) return; if (o.done && o.dropped) return;
    var y = jl - (o.s - st) * spd, cx = x0 + (o.l + 0.5) * w; if (o.h) { var y2 = jl - (o.s + o.h - st) * spd; if (y2 > H) return; var ys = o.hit ? jl : y; if (ys > -10) { R_('#12040a', cx - 6, Math.max(0, y2), 12, ys - Math.max(0, y2)); R_(LANECOL[o.l], cx - 4, Math.max(0, y2), 8, ys - Math.max(0, y2)); R_('rgba(255,255,255,0.4)', cx - 4, Math.max(0, y2), 2, ys - Math.max(0, y2)); } }
    if (o.hit) return; if (y < -20 || y > H + 20) return; var r = w * 0.34;
    g.fillStyle = '#12040a'; g.beginPath(); g.arc(cx, y, r + 2, 0, 6.3); g.fill(); g.fillStyle = LANECOL[o.l]; g.beginPath(); g.arc(cx, y, r, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(cx - r * 0.35, y - r * 0.35, r * 0.3, 0, 6.3); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(cx, y + r * 0.4, r * 0.55, 0, 3.14); g.fill(); });
  FX.forEach(function (f) { f.x += f.vx / 60; f.y += f.vy / 60; f.vy += 6; R_(f.col, f.x, f.y, 2, 2); });
}
function hud() {
  KIT.panel(6, 6, 128, 40); KIT.text(SONGLIST[R.i][1].toUpperCase(), 14, 13, { size: 6, col: '#a6968f', max: 112 }); KIT.text(String(R.score), 14, 23, { size: 16, col: '#ffe36a' });
  KIT.bar(14, 40 - 1, 112, 3, R.life, R.life < 0.25 ? '#ff2630' : '#7aff6a'); KIT.text(R.diff.n, W - 12, 8, { align: 'right', size: 8, col: '#ff2630' });
  if (R.combo > 2) KIT.text(R.combo + ' COMBO', W / 2, 60, { align: 'center', size: 8, col: '#f1e7d0', outline: 1 });
  if (R.judge && R.judge.t > 0) { R.judge.t -= 1 / 60; var J = R.judge.j < 3 ? JUDGE[R.judge.j] : ['MISS', 0, 0, '#ff2630']; KIT.text(J[0], W / 2, 76 - (0.5 - R.judge.t) * 10, { align: 'center', font: 'title', size: 22, col: J[3], outline: 1, alpha: Math.min(1, R.judge.t * 4) }); }
  if (R.st < 0) { var c = Math.ceil(-R.st / 4); if (c > 0 && c <= 4) KIT.text(String(c), W / 2, 110, { align: 'center', font: 'title', size: 40, col: '#ffe36a', outline: 1, alpha: 0.85 }); }
  if (R.fail) KIT.text('THE CROWD BOOS', W / 2, 120, { align: 'center', font: 'title', size: 30, col: '#ff2630', outline: 1 });
}
function draw() {
  stageBack(); crowd(); pulsar();
  if (G.mode === 'play' || G.mode === 'over') { highway(); hud(); }
  else { var b = BEAT % 1; BEAT += 1 / 60 * 1.8; KIT.text("PULSAR'S", W / 2, 52, { align: 'center', size: 8, col: '#a6968f' }); }
}

/* ---------- results and menus ---------- */
function grade(acc) { return acc >= 0.97 ? 'S' : acc >= 0.9 ? 'A' : acc >= 0.8 ? 'B' : acc >= 0.7 ? 'C' : 'D'; }
function results() {
  if (!R) return; var tot = R.notes.length, acc = tot ? (R.cnt[0] + R.cnt[1] * 0.7 + R.cnt[2] * 0.35) / tot : 0, g = R.fail ? 'F' : grade(acc), key = R.id + ':' + R.diff.id, old = SV.best[key], nb = !old || R.score > old.score;
  if (!R.fail && !old) SV.clears++; if (nb && !R.fail) SV.best[key] = { score: R.score, g: g }; persist(); G.mode = 'res'; if (!R.fail) sfx.play('win');
  KIT.menu({ title: R.fail ? 'Booed Off' : (nb ? 'New Best!' : 'Cleared'), sub: SONGLIST[R.i][1] + ' · ' + R.diff.n,
    html: '<div style="text-align:center"><div style="font:64px Pirata One;color:' + (g === 'S' ? '#ffe36a' : g === 'F' ? '#ff2630' : '#f1e7d0') + '">' + g + '</div><div style="font-size:22px;color:#ffe36a">' + R.score + '</div><p style="color:#a6968f">PERFECT ' + R.cnt[0] + ' · GREAT ' + R.cnt[1] + ' · GOOD ' + R.cnt[2] + ' · MISS ' + R.cnt[3] + '<br>MAX COMBO ' + R.max + ' · ' + Math.round(acc * 100) + '%</p></div>',
    items: [{ label: 'PLAY AGAIN', def: true, fn: function () { startSong(R.i, R.d); } }, { label: 'PICK A SONG', fn: songMenu }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
var PICK = { d: 1 };
function songMenu() {
  G.mode = 'menu'; music.play('obgroove');
  KIT.menu({ title: 'Pick a Song', wide: true, grid: true, items: [{ label: 'DIFFICULTY: ' + DIFFS[PICK.d].n, fn: function () { PICK.d = (PICK.d + 1) % 4; songMenu(); } }].concat(SONGLIST.map(function (s, i) {
    var b = SV.best[s[0] + ':' + DIFFS[PICK.d].id]; return unlocked(i) ? { label: s[1] + (b ? '  ·  ' + b.g : ''), fn: function () { startSong(i, PICK.d); } } : { label: '• • •', dis: true }; }))
    .concat([{ label: 'BACK', back: true, fn: titleMenu }]), note: 'Clear a song to open two more. Cleared ' + SV.clears });
}
function optsMenu() {
  KIT.menu({ title: 'Options', items: [{ label: 'NOTE SPEED: ' + (SV.speed || 1).toFixed(1) + 'x', fn: function () { SV.speed = Math.round(((SV.speed || 1) >= 2 ? 0.6 : (SV.speed || 1) + 0.2) * 10) / 10; persist(); optsMenu(); } },
    { label: 'TIMING: ' + (SV.off > 0 ? '+' : '') + SV.off + ' MS', sub: 'Raise it if you hit late every time', fn: function () { SV.off = SV.off >= 150 ? -100 : SV.off + 10; persist(); optsMenu(); } }, KIT.resItem(optsMenu), { label: 'BACK', back: true, fn: titleMenu }] });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p>Notes fall down the lanes in time with the song. Hit each one as it crosses Pulsar’s suckers at the bottom. Long notes have a tail: hold the button until it ends.</p><p><b>Four lanes</b>: the d-pad, the face buttons (X A Y B) or D F J K / the arrow keys. On a phone tap the lanes themselves, as many fingers as you like.</p><p><b>OCTO</b> uses all eight: the d-pad plays the bass and the kick on the left, the face buttons play the tune on the right (A S D F and J K L ; on a keyboard).</p><p>Misses drain the bar at the top. Empty it and the crowd boos you off.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' || KIT.menuOpen()) return; music.stop(0.2);
  KIT.menu({ title: 'Paused', items: [{ label: 'START OVER', def: true, fn: function () { startSong(R.i, R.d); } }, { label: 'PICK A SONG', fn: songMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT', back: true, fn: titleMenu }] });
}
function titleMenu() {
  G.mode = 'title'; R = null; music.play('obgroove');
  KIT.menu({ cls: 'clear', logo: '../assets/ob-logo.webp', title: "Pulsar's Octobeats", items: [{ label: 'PLAY', cls: 'hot', def: true, fn: songMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }] });
}
/* Pulsar's own tunes */
music.songs.obgroove = { bpm: 108, beats: 4, vol: 0.85, wet: 0.4, lead: 'fm', fmbass: 1, bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'Dm G C A Dm G Bb A',
  mel: 'a5 - . a5 c6 - a5 - | g5 - f5 - d5 - . . | e5 - g5 - c6 - e6 - | c#6 - - - a5 - . . | d6 - . d6 f6 - d6 - | b5 - g5 - d5 - g5 - | bb5 - d6 - f6 - d6 - | c#6 - e6 - a6 - - -' };
music.songs.obrush = { bpm: 148, beats: 4, vol: 0.88, wet: 0.25, lead: 'pulse', harm: 1, bass: 'pulse16', acc: 'arp16', drums: 'fast', chords: 'Em C G D Em C B B',
  mel: 'e5 g5 b5 e6 d6 b5 g5 b5 | c6 - b5 - g5 - e5 - | d5 g5 b5 d6 c6 b5 a5 g5 | f#5 - a5 - d6 - f#6 - | e6 - d6 b5 g5 - b5 - | c6 e6 g6 e6 c6 - g5 - | f#5 a5 b5 d#6 f#6 - d#6 - | b5 - - - b4 - - -' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu, pad: 'none', padKeys: { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' } });
titleMenu();
window.__ob = { G: G, get R() { return R; }, startSong: startSong, chartFor: chartFor, DIFFS: DIFFS, SONGLIST: SONGLIST, press: function (l) { press(l, R.st); }, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } } };
