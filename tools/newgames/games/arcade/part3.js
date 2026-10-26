/* ---------- a run: a cabinet's stage (six games then its boss) or the Overdrive (endless, everything) ---------- */
var run, M;
if (!SV.stages) SV.stages = {};
function newRun(stage) {
  run = { n: 0, lives: stage ? 3 : 4, speed: 0, score: 0, last: null, stage: stage || null, len: stage ? 6 : 0 };
  if (stage) { var o = []; while (o.length < run.len) { var sh = shuffle(stage.games.slice()); if (o.length && sh[0] === o[o.length - 1]) sh.reverse(); o = o.concat(sh); } run.order = o.slice(0, run.len); }
  SV.plays++; persist(); nextGame(true);
}
function speedK() { return run ? 1 + run.speed * 0.13 : 1; }
function nextGame(first) {
  var st = run.stage, boss, g;
  if (st) { boss = run.n >= run.len; if (boss) g = st.boss; else { var id = run.order[run.n]; g = MICRO.filter(function (q) { return q.id === id; })[0]; } }
  else { boss = run.n > 0 && run.n % 10 === 9; if (boss) g = pick(STAGES.filter(function (s) { return SV.stages[s.id]; }).map(function (s) { return s.boss; }).concat([BOSSG])); else { var pool2 = MICRO.filter(function (m) { return m.id !== run.last; }); g = pick(pool2); } }
  run.last = g.id; var lv = st ? Math.min(2, Math.floor(run.n / 3)) : Math.min(2, Math.floor(run.n / 7));
  M = { g: g, t: 0, lv: lv, word: g.word, skin: st && st.skin }; g.init(M, lv);
  G.mode = 'between'; G.bt = first ? 2.2 : 1.9; G.speedUp = !first && !boss && (st ? run.n === 3 : run.n > 0 && run.n % 5 === 0);
  if (G.speedUp) { run.speed++; G.bt += 1; }
  music.play(boss ? 'aoboss' : 'aobetween');
}
function finishMicro(won) {
  G.mode = 'result'; G.rt = 1.1; G.won = won; if (won) { run.score++; sfx.play('win'); } else { run.lives--; sfx.play('lose'); KIT.shake(6); }
  SV.seen[M.g.id] = 1; persist();
}
function update(dt) {
  G.t += dt;
  if (G.mode === 'hub') { hubUpdate(dt); return; }
  if (G.mode === 'intro') { introUpdate(dt); return; }
  if (G.mode === 'between') { G.bt -= dt * (G.speedUp ? 1 : speedK()); if (G.bt <= 0) { G.mode = 'micro'; M.t = 0; music.play(M.g.boss ? (run.stage ? run.stage.song : 'aoboss') : 'aomicro'); } return; }
  if (G.mode === 'micro') {
    var sdt = dt * speedK(); M.t += sdt; M.g.update(M, sdt);
    var over = M.t >= M.g.dur;
    if (M.win && !M.g.survive) { M.endT = (M.endT || 0) + dt; if (M.endT > 0.35) finishMicro(true); }
    else if (M.lose) { M.endT = (M.endT || 0) + dt; if (M.endT > 0.35) finishMicro(false); }
    else if (over) finishMicro(!!M.g.survive || (M.g.boss && false));
    return;
  }
  if (G.mode === 'result') { G.rt -= dt; if (G.rt <= 0 && run) {
    if (run.stage && M.g.boss && G.won) { stageClear(); return; }
    if (run.stage && M.g.boss && !G.won && run.lives > 0) { nextGame(); return; } // the boss again
    run.n++; if (run.lives <= 0) gameOver(); else nextGame(); } }
}
function stageClear() {
  var st = run.stage, stars = Math.max(1, run.lives), was = SV.stages[st.id] || 0, before = cleared(); SV.stages[st.id] = Math.max(was, stars); persist(); G.mode = 'over'; music.play('aohub');
  var i = STAGES.indexOf(st), nxt = STAGES[i + 1], odNow = before < OVERDRIVE_AT && cleared() >= OVERDRIVE_AT;
  KIT.menu({ title: 'Cabinet Cleared!', sub: st.name + ': ' + '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars), html: '<p style="text-align:center;margin:0">' + (nxt && !was ? 'The ' + nxt.name + ' cabinet just switched on.' : 'Lives left decide the stars. Three stars means you never dropped one.') + (odNow ? '<br><b style="color:#ffe36a">The gold OVERDRIVE cabinet is awake.</b>' : '') + '</p>',
    items: [{ label: 'BACK TO THE FLOOR', fn: function () { KIT.closeMenu(); enterHub(st.id); }, cls: 'hot', def: true }, { label: 'PLAY IT AGAIN', fn: function () { KIT.closeMenu(); newRun(st); } }] });
}
function gameOver() {
  G.mode = 'over'; music.play('aohub');
  if (run.stage) { var st = run.stage; KIT.menu({ title: 'Game Over', sub: st.name + ': the cabinet spat you out after ' + run.score + ' games.', html: '<p style="text-align:center;color:#a6968f;margin:0">"Cabinets are free, kid. Play all you like."</p>',
    items: [{ label: 'TRY AGAIN', fn: function () { KIT.closeMenu(); newRun(st); }, cls: 'hot', def: true }, { label: 'BACK TO THE FLOOR', back: true, fn: function () { KIT.closeMenu(); enterHub(st.id); } }] }); return; }
  var best = run.score > SV.best; if (best) { SV.best = run.score; persist(); }
  KIT.menu({ title: best ? 'New Best!' : 'Game Over', sub: 'Cumhead cleared ' + run.score + ' games before the machine spat him out.', html: '<p style="text-align:center;margin:0">Best: <b>' + SV.best + '</b>  ·  Speed level reached: <b>' + (run.speed + 1) + '</b></p><p style="text-align:center;color:#a6968f;margin:6px 0 0">"Cabinets are free, kid. Play all you like."</p>',
    items: [{ label: 'ANOTHER COIN', fn: function () { KIT.closeMenu(); newRun(); }, cls: 'hot', def: true }, { label: 'BACK TO THE FLOOR', back: true, fn: function () { KIT.closeMenu(); enterHub('od'); } }] });
}

/* ---------- the arcade floor: walk along the cabinets ---------- */
var HUB = null, CABW = 120, CAB0 = 260, FLOOR = 236;
var LOGOS = {};
function logo(k) { if (!LOGOS[k]) { var im = new Image(); im.src = '../assets/' + k + '-logo.webp'; LOGOS[k] = im; } return LOGOS[k].complete && LOGOS[k].naturalWidth ? LOGOS[k] : null; }
function cabX(i) { return CAB0 + i * CABW; }
function odX() { return CAB0 + STAGES.length * CABW + 70; }
function hubW() { return odX() + 160; }
function enterHub(at) {
  G.mode = 'hub'; music.play('aohub'); run = null;
  var x = at === 'od' ? odX() : at ? cabX(STAGES.map(function (s) { return s.id; }).indexOf(at)) : 70;
  HUB = { x: x, face: 1, t: 0, cam: 0, near: null, bubble: at ? 0 : 4 }; HUB.cam = clamp(x - W / 2, 0, hubW() - W);
}
function hubUpdate(dt) {
  var h = HUB; h.t += dt; if (h.bubble > 0) h.bubble -= dt;
  var s2 = KIT.stick(0), ix = s2.x > 0.25 ? 1 : s2.x < -0.25 ? -1 : 0; h.vx = ix * 130; if (ix) h.face = ix; h.x = clamp(h.x + h.vx * dt, 40, hubW() - 40);
  h.cam += (clamp(h.x - W / 2, 0, hubW() - W) - h.cam) * Math.min(1, dt * 6);
  h.near = null; STAGES.forEach(function (s, i) { if (Math.abs(h.x - cabX(i)) < 34) h.near = i; }); if (Math.abs(h.x - odX()) < 50) h.near = 'od';
  if (Math.abs(h.x - 110) < 40 && h.vx === 0 && h.bubble <= 0 && !h.said) { h.said = 1; h.bubble = 3.5; }
  if (Math.abs(h.x - 110) > 80) h.said = 0;
  if (h.near !== null && (KIT.pressed('a') || KIT.pressed('up'))) cabinetMenu(h.near);
}
function cabinetMenu(i) {
  if (i === 'od') {
    var on = cleared() >= OVERDRIVE_AT;
    KIT.menu({ title: 'OVERDRIVE', sub: on ? 'Every micro game from every cabinet, faster and faster, a boss every tenth. Four lives.' : 'The gold cabinet is dark. Clear ' + OVERDRIVE_AT + ' cabinets to wake it up (' + cleared() + ' so far).',
      html: on ? '<p style="text-align:center;margin:0">Best: <b>' + SV.best + '</b></p>' : '', items: [on ? { label: 'INSERT COIN', fn: function () { KIT.closeMenu(); if (!SV.odSeen) { SV.odSeen = 1; persist(); startIntro(); } else newRun(); }, cls: 'hot', def: true } : null, on ? { label: 'WATCH THE INTRO', fn: function () { KIT.closeMenu(); startIntro(); } } : null, { label: 'WALK AWAY', back: true, fn: KIT.closeMenu }].filter(Boolean) });
    return;
  }
  var st = STAGES[i], open = stageOpen(i), stars = SV.stages[st.id] || 0;
  KIT.menu({ title: st.name, sub: open ? 'Six micro games from ' + st.name + ', faster after three, then ' + st.boss.name + '. Three lives.' : 'OUT OF ORDER. Clear the ' + STAGES[i - 1].name + ' cabinet first.',
    html: open ? '<p style="text-align:center;margin:0;font-size:20px;color:#ffe36a">' + '★★★'.slice(0, stars) + '<span style="color:#4a1a1c">' + '★★★'.slice(0, 3 - stars) + '</span></p>' : '',
    items: [open ? { label: 'PLAY', fn: function () { KIT.closeMenu(); newRun(st); }, cls: 'hot', def: true } : null, { label: 'WALK AWAY', back: true, fn: KIT.closeMenu }].filter(Boolean) });
}
/* drawing the floor: neon, a loud carpet, a cabinet for every game with its own decals */
function neonLine(x1, y1, x2, y2, col, on) { var c = KIT.ctx; c.save(); c.lineCap = 'round'; c.strokeStyle = col; c.globalAlpha = on ? 0.18 : 0.06; c.lineWidth = 9; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.globalAlpha = on ? 0.35 : 0.1; c.lineWidth = 5; c.stroke(); c.globalAlpha = 1; c.lineWidth = 2; c.strokeStyle = on ? '#ffffff' : col; c.stroke(); c.globalAlpha = on ? 1 : 0.4; c.lineWidth = 2; c.strokeStyle = col; c.beginPath(); c.moveTo(x1, y1 + 1); c.lineTo(x2, y2 + 1); c.stroke(); c.restore(); }
function glowRect(x, y, w, h, col, a) { R(col, x - 6, y - 6, w + 12, h + 12); }
function carpet() { return KIT.layer('ao-carpet', 192, 40, function () { R('#0e0618', 0, 0, 192, 40); var cols = ['#ff2aa8', '#30d8ff', '#ffe36a', '#7a2ad8'];
  for (var i = 0; i < 26; i++) { var x = (i * 47) % 192, y = (i * 23) % 40, c = cols[i % 4]; if (i % 3 === 0) { R(c, x, y, 6, 2); R(c, x + 2, y - 2, 2, 6); } else if (i % 3 === 1) { R(c, x, y, 3, 3); } else { R(c, x, y, 8, 1); R(c, x + 6, y + 1, 1, 3); } } }); }
function drawCab(x, st, i, lit, near) {
  var y = FLOOR, c = st.col, open = stageOpen(i), stars = SV.stages[st.id] || 0, t = G.t;
  if (open) { KIT.ctx.globalAlpha = 0.16 + (near ? 0.12 : 0); R(c[1], x - 34, y - 132, 68, 132); KIT.ctx.globalAlpha = 1; }
  // body
  R('#05020a', x - 28, y - 124, 56, 124); R(c[2], x - 26, y - 122, 52, 122); R(c[1], x - 26, y - 122, 6, 122); R(c[1], x + 20, y - 122, 6, 122);
  for (var k = 0; k < 4; k++) R(open ? c[0] : '#3a3238', x - 26, y - 86 + k * 22, 4, 10); // side decal stripes
  // marquee
  R('#05020a', x - 30, y - 132, 60, 20); R(open ? c[1] : '#2a2228', x - 28, y - 130, 56, 16); var short = st.name.split(':')[0].split(' ').slice(-1)[0].toUpperCase().slice(0, 9);
  text(short, x, y - 127, { align: 'center', size: 6, col: open ? (Math.floor(t * 3 + i) % 7 ? '#ffffff' : c[0]) : '#5a4a50', shadow: true });
  // the screen, playing its attract mode
  R('#05020a', x - 22, y - 108, 44, 36); R(open ? '#0a0a14' : '#000', x - 20, y - 106, 40, 32);
  if (open) { var f = st.mf > 1 ? st.mascot + (Math.floor(t * 8 + i) % st.mf) : st.mascot; spr(f, x + Math.sin(t * 1.5 + i) * 8, y - 76, { sc: 0.5, flip: Math.cos(t * 1.5 + i) < 0 }); for (var sl = 0; sl < 32; sl += 2) R('rgba(0,0,0,0.25)', x - 20, y - 106 + sl, 40, 1); if (stars) text('★'.repeat(stars), x, y - 104, { align: 'center', size: 6, col: '#ffe36a', font: 'body' }); }
  else { text('OUT OF', x, y - 98, { align: 'center', size: 6, col: '#ff2630' }); text('ORDER', x, y - 88, { align: 'center', size: 6, col: '#ff2630' }); }
  // control panel: a stick and two buttons
  R('#05020a', x - 28, y - 70, 56, 14); R(c[1], x - 26, y - 68, 52, 10); R('#12040a', x - 16, y - 68, 3, 5); R('#ff2630', x - 18, y - 72, 7, 5); R(open ? '#ffe36a' : '#5a4a50', x + 4, y - 66, 5, 4); R(open ? '#30d8ff' : '#5a4a50', x + 13, y - 66, 5, 4);
  // coin door
  R('#05020a', x - 12, y - 46, 24, 30); R('#2a2228', x - 10, y - 44, 20, 26); R(open && Math.floor(t * 2 + i) % 2 ? '#ff2630' : '#5a0a10', x - 3, y - 38, 6, 3);
  if (near) { R('#ffe36a', x - 4, y - 150 + Math.sin(t * 8) * 3, 8, 4); R('#ffe36a', x - 2, y - 146 + Math.sin(t * 8) * 3, 4, 4); }
}
function drawHub() {
  var h = HUB, cam = Math.round(h.cam), t = G.t, lit = Math.floor(t * 2) % 2;
  R('#07030c', 0, 0, W, H);
  KIT.ctx.save(); KIT.ctx.translate(-cam, 0);
  var x0 = Math.max(0, Math.floor(cam / 64) * 64), x1 = cam + W + 64;
  // back wall: dark panels, a neon zigzag along the top, posters (the game logos) over the cabinets
  for (var x = x0 - 64; x < x1; x += 64) { R('#0c0616', x, 0, 62, FLOOR); R('#120a20', x + 2, 2, 58, FLOOR - 4); }
  for (var z = x0 - 64; z < x1; z += 64) neonLine(z, 22, z + 32, 40, '#ff2aa8', true), neonLine(z + 32, 40, z + 64, 22, '#ff2aa8', true);
  neonLine(x0 - 64, 52, x1, 52, '#30d8ff', Math.floor(t * 1.3) % 6 !== 0);
  STAGES.forEach(function (st, i) { var cx = cabX(i); if (cx < cam - 80 || cx > cam + W + 80) return; var lg = logo(st.logo), open = stageOpen(i); if (lg) { var w = 92, hh = w * lg.naturalHeight / lg.naturalWidth; if (hh > 62) { hh = 62; w = hh * lg.naturalWidth / lg.naturalHeight; } KIT.ctx.globalAlpha = open ? 1 : 0.25; KIT.ctx.drawImage(lg, Math.round(cx - w / 2), Math.round(98 - hh / 2 - 22), Math.round(w), Math.round(hh)); KIT.ctx.globalAlpha = 1; } });
  // the entrance and Potbelly behind his counter
  R('#05020a', 10, FLOOR - 110, 70, 110); R('#1a0a24', 14, FLOOR - 106, 62, 106); R('#30d8ff', 14, FLOOR - 108, 62, 2); text('EXIT', 45, FLOOR - 124, { align: 'center', size: 6, col: '#30d8ff' });
  R('#05020a', 92, FLOOR - 40, 90, 40); R('#3a1a4a', 94, FLOOR - 38, 86, 36); R('#ff2aa8', 94, FLOOR - 40, 86, 2); spr('npc_potbelly', 137, FLOOR - 36);
  text('TOKENS', 137, FLOOR - 28, { align: 'center', size: 6, col: '#ffe36a' });
  // the big neon sign
  var sx = 260 + 1.5 * CABW; neonLine(sx - 120, 64, sx + 360, 64, '#ffe36a', true);
  // floor
  var cp = carpet(); for (var fx = Math.floor(cam / 192) * 192; fx < cam + W; fx += 192) for (var fy = FLOOR; fy < H; fy += 40) KIT.blit(cp, fx, fy);
  R('#05020a', x0 - 64, FLOOR, x1 - x0 + 128, 3); R('#ff2aa8', x0 - 64, FLOOR, x1 - x0 + 128, 1);
  // cabinets
  STAGES.forEach(function (st, i) { var cx = cabX(i); if (cx < cam - 60 || cx > cam + W + 60) return; drawCab(cx, st, i, lit, h.near === i); });
  // the gold Overdrive cabinet
  var ox = odX(), on = cleared() >= OVERDRIVE_AT; if (on) aura(ox, FLOOR - 80, 90, 150, 0.35 + Math.sin(t * 4) * 0.1); spr('ao_cabbig', ox, FLOOR, { alpha: on ? 1 : 0.45 }); text('OVERDRIVE', ox, FLOOR - 176, { align: 'center', size: 8, col: on ? '#ffe36a' : '#5a4a50' }); if (!on) text(cleared() + '/' + OVERDRIVE_AT, ox, FLOOR - 164, { align: 'center', size: 6, col: '#a6968f' });
  if (h.near === 'od') { R('#ffe36a', ox - 4, FLOOR - 196 + Math.sin(t * 8) * 3, 8, 4); }
  // Cumhead
  spr(Math.abs(h.vx) > 1 ? 'ch_walk' + (Math.floor(h.t * 12) % 9) : 'ch_idle' + (Math.floor(h.t * 7) % 7), h.x, FLOOR + 2, { flip: h.face < 0 });
  // light sweeping the floor
  KIT.ctx.globalAlpha = 0.07; KIT.ctx.fillStyle = '#ff2aa8'; KIT.ctx.beginPath(); var lx = cam + W / 2 + Math.sin(t * 0.7) * 260; KIT.ctx.moveTo(lx, 0); KIT.ctx.lineTo(lx - 60, FLOOR + 30); KIT.ctx.lineTo(lx + 60, FLOOR + 30); KIT.ctx.fill(); KIT.ctx.globalAlpha = 1;
  KIT.ctx.restore();
  if (h.bubble > 0) { var bx = 137 - cam, bw = 220; if (bx > -100 && bx < W + 100) { R('#12040a', bx - bw / 2 - 1, FLOOR - 101, bw + 2, 18); R('#f1e7d0', bx - bw / 2, FLOOR - 100, bw, 16); text('"Cabinets are free, kid. Play all you like."', bx, FLOOR - 96, { align: 'center', size: 9, font: 'body', col: '#12040a', shadow: false }); } }
  if (h.near !== null) { var nm = h.near === 'od' ? 'OVERDRIVE' : STAGES[h.near].name.toUpperCase(); var w2 = KIT.tw(nm, 8) + 30; KIT.panel(W / 2 - w2 / 2, 8, w2, 22); text(nm, W / 2, 14, { align: 'center', size: 8, col: '#ffe36a' }); text('A TO PLAY', W / 2, 34, { align: 'center', size: 6, col: '#a6968f' }); }
  text('CLEARED ' + cleared() + '/' + STAGES.length, 8, H - 12, { size: 6, col: '#a6968f' });
}

/* ---------- the walk in: the coin, Super Saiyan, locking in ---------- */
var IN;
function startIntro() { G.mode = 'intro'; IN = { t: 0, x: -30, phase: 0 }; music.play('aotitle'); }
function introUpdate(dt) {
  IN.t += dt; if (KIT.pressed('a') || KIT.pressed('start') || KIT.ptr.tap) { if (IN.t > 0.3) { newRun(); return; } }
  if (IN.phase === 0) { IN.x += 80 * dt; if (IN.x >= 200) { IN.x = 200; IN.phase = 1; IN.pt = 0; sfx.play('coin'); } }
  else if (IN.phase === 1) { IN.pt += dt; if (IN.pt > 1) { IN.phase = 2; IN.pt = 0; sfx.play('roar'); music.play('aoboss'); } }
  else if (IN.phase === 2) { IN.pt += dt; KIT.shake(4); if (Math.random() < 0.15) { KIT.flash(0.1); sfx.play('boom'); } if (IN.pt > 2.6) { IN.phase = 3; IN.pt = 0; KIT.flash(0.4); sfx.play('power'); } }
  else if (IN.phase === 3) { IN.pt += dt; if (IN.pt > 1.6) newRun(); }
}
function aura(cx, cy, w, h, k) {
  var ctx = KIT.ctx;
  for (var i = 0; i < 26; i++) {
    var a = i / 26 * Math.PI * 2, fl = Math.sin(G.t * 18 + i * 1.7) * 0.5 + 0.5, len = (30 + fl * 40) * k;
    var bx = cx + Math.cos(a) * w * 0.55, by = cy + Math.sin(a) * h * 0.55;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,' + 0.7 * k + ')' : i % 3 === 1 ? 'rgba(255,227,106,' + 0.8 * k + ')' : 'rgba(255,160,40,' + 0.7 * k + ')';
    ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * 8, by + Math.cos(a) * 8); ctx.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len - len * 0.6); ctx.lineTo(bx + Math.sin(a) * 8, by - Math.cos(a) * 8); ctx.fill();
  }
  if (Math.random() < 0.5 * k) { ctx.strokeStyle = '#7af0ff'; ctx.lineWidth = 2; ctx.beginPath(); var x = cx + rnd(-w, w) * 0.6, y = cy - h * 0.6; ctx.moveTo(x, y); for (var s = 0; s < 6; s++) { x += rnd(-14, 14); y += h * 0.22; ctx.lineTo(x, y); } ctx.stroke(); }
}
function drawArcade() {
  R('#07030c', 0, 0, W, H); for (var x = 0; x < W; x += 64) { R('#0c0616', x, 0, 62, 196); R('#120a20', x + 2, 2, 58, 192); }
  for (var z = 0; z < W; z += 64) { neonLine(z, 22, z + 32, 40, '#ff2aa8', true); neonLine(z + 32, 40, z + 64, 22, '#ff2aa8', true); }
  ['ao_cab_r', 'ao_cab_p', 'ao_cab_b', 'ao_cab_g'].forEach(function (c, i) { var x = i < 2 ? 40 + i * 64 : 340 + (i - 2) * 64; spr(c, x, 196); });
  var cp = carpet(); for (var fx = 0; fx < W; fx += 192) for (var fy = 196; fy < H; fy += 40) KIT.blit(cp, fx, fy);
  R('#ff2aa8', 0, 196, W, 1); spr('npc_potbelly', 440, 250, { sc: 1.2 });
}
function drawIntro() {
  drawArcade(); var k = IN.phase >= 2 ? Math.min(1, IN.pt * 0.8 + (IN.phase === 3 ? 1 : 0)) : 0;
  if (k > 0) aura(W / 2, 140, 110, 180, k);
  spr('ao_cabbig', W / 2, 200, { flash: IN.phase === 2 && Math.floor(G.t * 20) % 4 === 0 });
  if (IN.phase >= 2) { R('rgba(255,227,106,' + (0.4 + Math.sin(G.t * 20) * 0.2) + ')', W / 2 - 30, 70, 60, 46); }
  var cx = IN.phase === 0 ? IN.x : 200, frame = IN.phase === 0 ? 'ch_walk' + (Math.floor(IN.t * 12) % 9) : IN.phase === 3 ? 'ch_attack' : 'ch_idle' + (Math.floor(IN.t * 8) % 7);
  spr(frame, cx, 250);
  if (IN.phase === 1) { var c = Math.min(1, IN.pt * 1.5); spr('ao_coin', lerp(cx + 10, W / 2 + 8, c), lerp(200, 166, c) - Math.sin(c * Math.PI) * 30, { anchor: 'c' }); }
  if (IN.phase === 0) caption('The gold cabinet at the back is glowing.', 'npc_potbelly', '"Cabinets are free, kid. Play all you like."');
  if (IN.phase === 1) caption('He puts a coin in anyway.');
  if (IN.phase === 2) caption('THE MACHINE GOES SUPER SAIYAN', null, null, '#ffe36a');
  if (IN.phase === 3) { R('rgba(255,255,255,' + Math.max(0, 0.6 - IN.pt) + ')', 0, 0, W, H); caption('CUMHEAD LOCKS IN', null, null, '#ff2630'); }
  text('A TO SKIP', W - 10, H - 12, { align: 'right', size: 6, col: '#a6968f' });
}
function caption(a, who, quote, col) { KIT.panel(40, 6, 400, quote ? 50 : 32); text(a, W / 2, 14, { align: 'center', size: quote ? 14 : 16, font: quote ? 'body' : 'title', col: col || '#f1e7d0' }); if (quote) text('Potbelly: ' + quote, W / 2, 34, { align: 'center', size: 12, font: 'body', col: '#ffe36a' }); }

/* ---------- drawing the rush ---------- */
var CTLTXT = { 'lr': '◀ ▶', 'lr+a': '◀ ▶  +  A', 'a': 'A', 'dpad': '✚', 'dpad+a': '✚  +  A', 'ud+a': '▲ ▼  +  A' };
function drawBetween() {
  var t = G.t; R('#140408', 0, 0, W, H);
  aura(W / 2, 150, 200, 200, 0.55 + Math.sin(t * 4) * 0.15);
  R('rgba(20,4,8,0.55)', 0, 0, W, H);
  if (run.stage) text(run.stage.name.toUpperCase() + (M.g.boss ? '  ·  BOSS' : '  ·  ' + (run.n + 1) + '/' + run.len), W / 2, 12, { align: 'center', size: 6, col: run.stage.col[0] });
  text(String(run.score), W / 2, 40, { align: 'center', size: 48, font: 'title', col: '#ffe36a' });
  var nl = run.stage ? 3 : 4; for (var i = 0; i < nl; i++) spr(i < run.lives ? 'ao_heart' : 'ao_heart0', W / 2 - nl * 9 + 2 + i * 18, 108, { anchor: 'tl' });
  spr('ch_icon0', W / 2, 200 + Math.sin(t * 10) * 2, { sc: 2 });
  if (G.speedUp && G.bt > 1.8) { text('SPEED UP!', W / 2, 130, { align: 'center', size: 32, font: 'title', col: '#ff2630' }); return; }
  var k = clamp((2 - G.bt) * 3, 0, 1);
  if (G.bt < 1.2) { text(M.word, W / 2, 132 - (1 - k) * 10, { align: 'center', size: 34, font: 'title', col: '#ffffff', shadowCol: '#c4121c', max: 440 }); text(CTLTXT[M.g.ctl] || '', W / 2, 176, { align: 'center', size: 18, font: 'body', col: '#ffe36a' }); }
}
function drawMicro() {
  M.g.draw(M);
  var left = Math.max(0, 1 - M.t / M.g.dur); R('#12040a', 0, H - 8, W, 8); R('#c8a050', 0, H - 6, W * left, 4); R(Math.floor(G.t * 20) % 2 ? '#ffe36a' : '#ff5a20', W * left - 4, H - 9, 8, 10);
  if (M.t < 0.7) text(M.word, W / 2, 10, { align: 'center', size: 26, font: 'title', col: '#ffffff', shadowCol: '#c4121c', max: 440 });
  R('#ffc840', 0, 0, W, 2); R('#ffc840', 0, 0, 2, H); R('#ffc840', W - 2, 0, 2, H);
}
function drawResult() {
  drawMicro(); var k = 1 - G.rt / 1.1;
  R('rgba(7,4,5,' + Math.min(0.6, k * 2) + ')', 0, 0, W, H);
  text(G.won ? 'YES!' : 'NOPE!', W / 2, 100, { align: 'center', size: 40, font: 'title', col: G.won ? '#ffe36a' : '#ff2630' });
}
function draw() {
  if (G.mode === 'hub' && HUB) { drawHub(); return; }
  if (G.mode === 'title' || G.mode === 'over') { drawArcade(); aura(W / 2, 140, 110, 180, 0.6); spr('ao_cabbig', W / 2, 200); return; }
  if (G.mode === 'intro') { drawIntro(); return; }
  if (G.mode === 'between') { drawBetween(); return; }
  if (G.mode === 'micro') { drawMicro(); return; }
  if (G.mode === 'result') drawResult();
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; music.play('aohub');
  KIT.menu({ cls: 'clear', logo: '../assets/ao-logo.webp', title: "Potbelly's Arcade Overdrive", sub: 'A cabinet for every game we made. Clear them, then wake up the gold one.',
    items: [{ label: 'WALK IN', fn: function () { KIT.closeMenu(); enterHub(); }, cls: 'hot', def: true }, { label: 'HOW TO PLAY', fn: helpMenu }],
    note: 'Cabinets cleared ' + cleared() + ' of ' + STAGES.length + '  ·  Overdrive best ' + SV.best });
}
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p>Walk along the arcade floor and press <b>A</b> (or up) at a cabinet. Each cabinet is a stage: six micro games from that game, a few seconds each, faster after three, then its boss. Three lives. Clear one and the next cabinet switches on.</p><p>Before each game you see the word and the buttons it needs. The fuse along the bottom is your time.</p><p>Clear ' + OVERDRIVE_AT + ' cabinets and the gold <b>OVERDRIVE</b> cabinet wakes up: everything, endless, faster every five, a boss every tenth.</p><p>Only the <b>d-pad / stick</b> and <b>A</b> (Z or Space on a keyboard).</p>', items: [{ label: 'BACK', back: true, fn: function () { if (run && G.mode !== 'title' && G.mode !== 'over') pauseMenu(); else if (G.mode === 'hub') KIT.closeMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode === 'title' || G.mode === 'over' || KIT.menuOpen()) return; KIT.menu({ cls: 'clear', title: 'Paused', items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'HOW TO PLAY', fn: helpMenu }, G.mode === 'hub' ? { label: 'TITLE', fn: titleMenu } : { label: 'LEAVE THE CABINET', fn: function () { KIT.closeMenu(); enterHub(run && run.stage ? run.stage.id : 'od'); } }] }); }

music.songs.aohub = { bpm: 116, beats: 4, vol: 0.85, wet: 0.35, lead: 'pulse', harm: 1, bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'Am F C G Am F E E',
  mel: 'a5 . c6 . e6 . a5 . | f5 . a5 . c6 . a5 . | g5 . c6 . e6 . g6 . | d6 . b5 . g5 . b5 . | a5 . c6 . e6 . a6 . | g6 . f6 . e6 . c6 . | b5 . g#5 . e5 . g#5 . | b5 - - - e6 - - -' };
music.songs.aotitle = { bpm: 128, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'Em C D B Em C Am B',
  mel: 'b4 - e5 - g5 - b5 - | c6 - b5 - g5 - e5 - | f#5 - a5 - d6 - c6 - | b5 - - - d#5 - - - | e5 - g5 - b5 - e6 - | e6 - d6 - c6 - g5 - | a5 - c6 - e6 - c6 - | b5 - - - - - . .' };
music.songs.aobetween = { bpm: 150, beats: 4, vol: 0.8, wet: 0.2, lead: 'pulse', bass: 'pulse16', acc: 'arp16', drums: 'fast', chords: 'C G Am F',
  mel: 'c6 . g5 . e5 . g5 . | b5 . g5 . d5 . g5 . | a5 . e5 . c5 . e5 . | f5 . a5 . c6 . f6 .' };
music.songs.aomicro = { bpm: 170, beats: 4, vol: 0.8, wet: 0.15, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'boss', chords: 'Am Am F G',
  mel: 'a5 . a5 c6 . a5 e6 . | d6 c6 b5 a5 g5 . e5 . | f5 . a5 c6 . f6 . e6 | d6 . b5 . g5 . b5 .' };
music.songs.aoboss = { bpm: 176, beats: 4, vol: 0.9, wet: 0.2, lead: 'fm', harm: 1, fmbass: 1, bass: 'drive', acc: 'organ', drums: 'industrial', chords: 'Dm Bb C A',
  mel: 'd5 . d5 f5 . a5 . d6 | bb5 . a5 . f5 . d5 . | c5 . e5 g5 . c6 . e6 | c#6 . a5 . e5 . c#5 .' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu, pad: { four: false, btns: [{ k: 'a', label: 'A', cls: 'big' }] } });
titleMenu();
window.__ao = { G: G, get M() { return M; }, get run() { return run; }, get HUB() { return HUB; }, MICRO: MICRO, BOSSG: BOSSG, STAGES: STAGES, SV: SV, newRun: newRun, startIntro: startIntro, enterHub: enterHub, cabinetMenu: cabinetMenu, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } },
  force: function (id) { var g = id === 'boss' ? BOSSG : MICRO.concat(STAGES.map(function (s) { return s.boss; })).filter(function (m) { return m.id === id; })[0]; M = { g: g, t: 0, lv: 1, word: g.word }; g.init(M, 1); G.mode = 'micro'; } };
