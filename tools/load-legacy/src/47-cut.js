/* =====================================================================================================
   CUTSCENES: short in-game scenes. Black bars slide in, the camera looks at whoever is talking, and lines
   type out in a box. A, B or jump skips a line (or finishes typing it). Lines move on by themselves too.
   cutPlay({ lines: [{ who, say, fx(), dur }], focus: {x} or a function, onEnd() })
   ===================================================================================================== */
var CUT = null;
function cutPlay(o) {
  CUT = { lines: o.lines || [], i: -1, t: 0, chars: 0, bars: 0, focus: o.focus, onEnd: o.onEnd, out: 0, prevKey: true };
  P.vx = 0; if (P.state === 'normal') P.attackT = 0; cutNext();
}
function cutNext() {
  CUT.i++; CUT.t = 0; CUT.chars = 0;
  var ln = CUT.lines[CUT.i]; if (!ln) { CUT.out = 0.35; return; }
  if (ln.fx) ln.fx(); if (ln.who || ln.say) sfx.click();
}
function cutStep(dt) {
  var c = CUT; if (!c) return false;
  if (c.out > 0) { c.out -= dt; c.bars = Math.max(0, c.out / 0.35); if (c.out <= 0) { CUT = null; if (c.onEnd) c.onEnd(); } return true; }
  c.bars = Math.min(1, c.bars + dt * 4); c.t += dt;
  var ln = c.lines[c.i], len = (ln.say || '').length; c.chars = Math.min(len, c.chars + dt * 48);
  if (ln.each) ln.each(dt, c.t);
  var key = input.a || input.j || input.s;
  if (key && !c.prevKey) { if (c.chars < len) c.chars = len; else cutNext(); }
  else if (c.t > (ln.dur || Math.max(2.2, len * 0.055 + 1.2))) cutNext();
  c.prevKey = key;
  // the camera looks at the speaker
  var f = typeof c.focus === 'function' ? c.focus() : c.focus;
  if (f) { var W = L.w * T, tx = W <= VW ? (W - VW) / 2 : clamp(f.x - VW / 2, 0, W - VW); G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 4); }
  return true;
}
function drawCut() {
  var c = CUT; if (!c) return;
  var bh = Math.round(22 * c.bars); R(ctx, '#000', 0, 0, VW, bh); R(ctx, '#000', 0, VH - bh, VW, bh);
  var ln = c.lines[c.i]; if (!ln || c.out > 0 || (!ln.who && !ln.say)) return;
  var w = Math.min(VW - 24, 330), x = Math.round((VW - w) / 2), y = 26; // at the top, so it never covers whoever is talking
  R(ctx, '#12040a', x - 1, y - 1, w + 2, 42); R(ctx, 'rgba(14,7,8,0.94)', x, y, w, 40); R(ctx, '#c4121c', x, y, w, 1); R(ctx, '#4a1a1c', x, y + 39, w, 1);
  if (ln.who) text(ln.who.toUpperCase(), x + 8, y + 10, 'left', ln.col || '#ffe36a', 6);
  var s = (ln.say || '').slice(0, Math.floor(c.chars)), words = s.split(' '), lines = [''], max = Math.floor((w - 16) / 5.6);
  words.forEach(function (wd) { if ((lines[lines.length - 1] + ' ' + wd).trim().length > max) lines.push(wd); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + wd).trim(); });
  lines.slice(0, 3).forEach(function (l, i) { text(l, x + 8, y + 21 + i * 9, 'left', '#f1e7d0', 6); });
  if (c.chars >= (ln.say || '').length && Math.floor(G.t * 3) % 2) text('>', x + w - 10, y + 34, 'center', '#ff2630', 6);
}

/* ---------- the scenes ---------- */
var BOSSLINES = {
  beast: ['HUNGRY... SO HUNGRY... YOU SMELL LIKE CREAM.', 'COME HERE, LITTLE SNACK.'],
  demon: ['WE ARE MANY. YOU ARE ONE.', 'DO THE MATHS, HEIR.'],
  pig: ['OINK. THIS ROOF IS OURS NOW.', 'MY BROTHER IS NEVER FAR AWAY. REMEMBER THAT.'],
  sperm: ['TARGET ACQUIRED. ONE HEIR.', 'TERMINATING THE LEGACY.'],
  blum: ['SO ANOTHER HEIR CRAWLS UP TO MY THRONE.', 'EVERY ONE OF YOU FALLS. THE LOAD ENDS WITH ME.']
};
function bossIntro(id) {
  var b = bosses[0]; if (!b || !BOSSLINES[id]) return;
  if (!META.seenBoss) META.seenBoss = {};
  var sk = G.lairFight && id !== 'mega' ? 'x' + id : id, first = !META.seenBoss[sk]; META.seenBoss[sk] = 1; saveMeta();
  var nm = G.lairFight && LAIRBOSS[id] ? LAIRBOSS[id] : BOSSDEF[id].name, ls = G.lairFight && LAIRBOSS[id] ? [BOSSLINES[id][0], 'BLUMHEAD GAVE ME MORE OF THE LOAD. MUCH MORE.'] : BOSSLINES[id];
  cutPlay({ focus: function () { return { x: b.x }; }, lines: first ? [{ who: nm, say: ls[0], col: '#ff2630', fx: function () { sfx.roar(); G.shake = 6; } }, { who: nm, say: ls[1], col: '#ff2630' }] : [{ who: nm, say: ls[1], col: '#ff2630', fx: function () { sfx.roar(); } }],
    onEnd: function () { G.banner = 2.4; G.bannerTxt = nm; G.bannerSub = id === 'blum' ? 'THE LOAD AT THE END' : id === 'kingblum' ? 'KING OF THE BLACK KEEP' : id === 'sirj' ? "GREEBO'S CAT. VERY, VERY BIG NOW." : G.lairFight ? (id === 'mega' ? 'THE LAST LOAD' : "GUARDIAN OF BLUMHEAD'S LAIR") : AREAS[BOSSDEF[id].area].name.toUpperCase(); } });
}
function brotherIntro(c) {
  G.banner = 0;
  cutPlay({ focus: function () { return { x: c.x }; }, lines: [{ who: 'Cowboy Brother', say: 'YEEHAW! NOBODY TOUCHES MY BIG BROTHER!', col: '#ffb040', fx: function () { sfx.roar(); G.shake = 8; } }],
    onEnd: function () { G.banner = 1.8; G.bannerTxt = 'THE COWBOY BROTHER'; G.bannerSub = 'BROTHERS LOAD REUNITED'; } });
}
/* Blumhead does not stay down: his body rises, the load answers him, and he comes back as Super Blumhead */
function superTransform(b) {
  G.blumBody = { x: b.x, y: b.y, s: 1, glow: 0 };
  var body = G.blumBody;
  cutPlay({ focus: function () { return { x: body.x }; }, lines: [
    { who: 'Blumhead', say: 'NO... NOT LIKE THIS... NOT TO A LITTLE DROP...', col: '#ff2630', fx: function () { G.shake = 4; } },
    { who: '', say: 'The ground shakes. Something answers him.', dur: 2.2, fx: function () { sfx.roar(); G.shake = 10; }, each: function (dt, t) { body.glow = Math.min(1, t / 2); body.y -= dt * 12; if (Math.random() < 0.6) parts.push({ x: body.x + (Math.random() - 0.5) * 70, y: body.y - Math.random() * 80, vx: 0, vy: -60 - Math.random() * 60, life: 0.8, c: Math.random() < 0.5 ? '#9a4aff' : '#ff2630' }); } },
    { who: 'Blumhead', say: 'THE LOAD... IT ANSWERS ME! RISE!', col: '#c070ff', fx: function () { G.flash = 0.5; G.shake = 14; sfx.roar(); }, each: function (dt) { body.s = Math.min(1.35, body.s + dt * 0.3); G.shake = Math.max(G.shake, 4); } }
  ], onEnd: function () {
    G.blumBody = null; poof(body.x, body.y - 60, 50, ['#9a4aff', '#ff2630', '#f1e7d0']);
    var sb = mkBoss('blum2', L.w * T / 2, 140); sb.fly = true; bosses = [sb]; G.bossGroup = 'blum2'; sfx.roar(); G.shake = 12; music.play('super');
    if (!META.seenSuper) { META.seenSuper = 1; saveMeta(); }
    G.banner = 3; G.bannerTxt = 'SUPER BLUMHEAD'; G.bannerSub = 'IT IS NOT OVER';
  } });
}
function drawBlumBody(cx) {
  var b = G.blumBody; if (!b) return;
  ctx.save(); if (b.glow > 0) { ctx.shadowColor = '#9a4aff'; ctx.shadowBlur = 30 * b.glow; }
  spr('f_blum_0', Math.round(b.x - cx + (G.shake > 2 ? (Math.random() - 0.5) * 4 : 0)), Math.round(b.y), false, b.s);
  ctx.restore();
}
function blumFallScene(onEnd) {
  var b = bosses[0] || { x: P.x + 80 };
  cutPlay({ focus: { x: b.x }, lines: [{ who: 'Blumhead', say: 'YOU THINK THIS IS THE END? THE LOAD... ALWAYS... COMES BACK.', col: '#ff2630' }], onEnd: onEnd });
}
function sealScene(n) {
  cutPlay({ focus: function () { return { x: P.x }; }, lines: [{ who: '', say: n >= 4 ? 'The fourth seal breaks. Far away, the Blumhead door groans open.' : 'A seal cracks on the Blumhead door. ' + n + ' of 4 broken.', dur: 2.6 }] });
}
function steveScene(e) {
  if (META.metSteve) return; META.metSteve = 1; saveMeta();
  cutPlay({ focus: { x: e.x }, lines: [
    { who: 'Steve', say: 'WELCOME TO EJACULAND! THE PARK NEVER CLOSES.', col: '#ff2630' },
    { who: 'Steve', say: 'NEVER. EVER. ENJOY THE LOAD FLUME!', col: '#ff2630' }] });
}
