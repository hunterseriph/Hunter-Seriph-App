/* =====================================================================================================
   THE HOMUNCULI PLAY DIFFERENTLY (his ask: Gloop and Bulwark played exactly like Cumhead). Every breed has its own
   B attack and its own ability, after their Load Legacy moves (HOMMOVE there):
     GLOOP      Acid Spit (a lobbed glob that leaves an acid puddle)      / Ooze Shield (a slime bubble takes a hit, grows back in 20 s)
     BULWARK    Headbutt (charges through foes, boxes and cracked walls)  / Bone Plates (a hit only loses half your drops)
     EMBERTAIL  Fire Breath (a burst of flame in front of him)            / Fireproof (lava and fire jets do not hurt)
     FROSTBITE  Icicle (freezes a foe solid; run into it to shatter it)   / Ice Skates (faster on the ground)
     VOLTLING   Chain Zap (the nearest foe and two more beside it)        / Static (drops fly to him)
     MENDLING   Healing Lash (a long whip; every foe it hits gives a drop) / Patch Up (once an act, a hit with no drops does not kill)
     LEECHLING  Lunging Bite (a lunge that hits twice as hard)            / Blood Drain (every kill gives a drop)
     PEEPER     Eye Laser (a beam across the screen, through everything)  / Third Eye (cracked walls glow)
     GOLDIE     Bouncing Coins (they bounce along the ground)             / Gold Rush (a drop sometimes counts twice)
     TITAN      Ground Pound (shockwaves both ways; in the air he slams)  / Titan Build (stomps hit three times as hard, walks through cracked walls)
     BLOODMOON  Blood Scythe (cuts all round him and throws a crescent)   / Red Moon (a third jump in the air)
   Cumhead with a homunculus following: when Cumhead shoots, the one behind him uses his breed's attack too.
   ===================================================================================================== */
var HOMAB = {
  gloop: { b: 'ACID SPIT', p: 'OOZE SHIELD', pad: 'SPIT', cd: 0.5 }, guard: { b: 'HEADBUTT', p: 'BONE PLATES', pad: 'RAM', cd: 0.8 },
  ember: { b: 'FIRE BREATH', p: 'FIREPROOF', pad: 'FIRE', cd: 0.6 }, frost: { b: 'ICICLE', p: 'ICE SKATES', pad: 'ICE', cd: 0.45 },
  volt: { b: 'CHAIN ZAP', p: 'STATIC', pad: 'ZAP', cd: 0.7 }, medic: { b: 'HEALING LASH', p: 'PATCH UP', pad: 'LASH', cd: 0.42 },
  leech: { b: 'LUNGING BITE', p: 'BLOOD DRAIN', pad: 'BITE', cd: 0.55 }, scout: { b: 'EYE LASER', p: 'THIRD EYE', pad: 'LASER', cd: 0.75 },
  goldie: { b: 'BOUNCING COINS', p: 'GOLD RUSH', pad: 'COINS', cd: 0.4 }, titan: { b: 'GROUND POUND', p: 'TITAN BUILD', pad: 'POUND', cd: 0.9 },
  blood: { b: 'BLOOD SCYTHE', p: 'RED MOON', pad: 'SCYTHE', cd: 0.6 } };
function homBreed() { var C = CHR(); return C && C.kind === 'hom' ? C.breed : null; }
function homIs(b) { return homBreed() === b; }
var HFX = []; // this file's own effects (flames, lightning, beams, cuts, waves), drawn in world space

/* ---------- hitting everything in a box: foes, boxes, the boss, cracked walls ---------- */
function homHit(x0, y0, x1, y1, dmg, o) {
  o = o || {}; var n = 0, ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1);
  ENTS.forEach(function (e, ei) {
    if (e.k === 'foe' && e.alive) { var w = e.small ? 8 : 11, h = e.small ? 14 : 24; if (e.x + w < ax || e.x - w > bx || e.y < ay || e.y - h > by) return; if (o.seen) { if (o.seen[ei]) return; o.seen[ei] = 1; }
      if (e.F.beh === 'pop' && (e.rise || 0) < 0.4) return;
      if (e.F.shield && !o.brk && o.from !== undefined && Math.sign(o.from - e.x) === e.dir) { sfx.play('clink'); bits(e.x, e.y - 14, 4, ['#a6968f', '#f1e7d0'], 80); return; }
      if (o.freeze) freezeFoe(e, o.freeze); else hitFoe(e, dmg); n++; if (o.onHit) o.onHit(e); }
    else if (e.k === 'box' && e.alive && e.x > ax - 12 && e.x < bx + 12 && e.y > ay && e.y - 26 < by) { openBox(e); n++; } });
  if (G.boss && G.boss.alive) { var hit = false; [[ax, ay], [bx, ay], [ax, by], [bx, by], [(ax + bx) / 2, (ay + by) / 2], [(ax + bx) / 2, by], [(ax + bx) / 2, ay]].forEach(function (q) { if (!hit && bossHitBy(q[0], q[1])) { hit = true; hitBoss(dmg >= 2 ? 2 : 1); n++; } }); }
  if (o.walls !== false) for (var cx = Math.floor(ax / TS); cx <= Math.floor(bx / TS); cx++) for (var cy = Math.floor(ay / TS); cy <= Math.floor(by / TS); cy++) if (isBreak(T(cx, cy))) { breakWall(cx, cy); n++; }
  return n;
}
/* ---------- Frostbite's ice: a frozen foe stops, cannot hurt you, and shatters when you run into it ---------- */
function freezeFoe(e, t) { if (e.F.beh === 'pop' && (e.rise || 0) < 0.4) return; e.frozen = t; e.hitT = 0.15; sfx.play('clink'); bits(e.x, e.y - 12, 8, ['#9adfff', '#f0fbff', '#4ab0ff'], 90); }
(function () {
  var sF = stepFoe; stepFoe = function (e, dt) { if (e.frozen > 0) { e.frozen -= dt; if (e.frozen <= 0) { e.frozen = 0; bits(e.x, e.y - 12, 6, ['#9adfff', '#f0fbff'], 60); } return; } sF(e, dt); };
  var tc = touch; touch = function (e, dt) {
    if (e.k === 'foe' && e.frozen > 0) { var p = PL; if (e.alive && p.state === 'normal' && Math.abs(p.x - e.x) < 11 + PHW + 2 && p.y > e.y - 28 && p.y - PH < e.y) { e.frozen = 0; hitFoe(e, 99); bits(e.x, e.y - 12, 14, ['#9adfff', '#f0fbff', '#4ab0ff'], 160); sfx.play('crumble'); if (p.air && p.vy > 0) { p.vy = -300; } } return; }
    G.fireNow = e.k === 'jet' ? 1 : 0; tc(e, dt); G.fireNow = 0; };
})();

/* ---------- the attacks: o = { x, y (feet), face, fol (the follower: no moving him about) } ---------- */
function homAttack(b, o) {
  var x = o.x, y = o.y, f = o.face || 1, p = PL, me = !o.fol, eye = y - 22;
  switch (b) {
    case 'gloop': SHOTS.push({ x: x + f * 10, y: y - 16, vx: f * 210 + (me ? (p.air ? p.vx : p.gsp) * 0.3 : 0), vy: -120, g: 700, life: 1.6, k: 'acid', mine: true, onHit: acidSplash, onWall: function (s) { acidSplash(s); return false; } }); sfx.play('pop'); break;
    case 'guard': if (me) { p.ramT = 0.36; p.face = f; sfx.play('dash'); } else homHit(x, y - 30, x + f * 26, y, 2, { from: x, brk: 1 }); break;
    case 'ember': HFX.push({ k: 'fire', x: x, y: eye + 4, f: f, t: 0.5, tt: 0, fol: o.fol, seen: {} }); sfx.play('shoot'); break;
    case 'frost': SHOTS.push({ x: x + f * 12, y: eye, vx: f * 440 + (me ? (p.air ? p.vx : p.gsp) * 0.3 : 0), vy: 0, life: 0.7, k: 'icicle', mine: true, freeze: 4 }); sfx.play('shoot'); break;
    case 'volt': chainZap(x, eye, f); break;
    case 'medic': HFX.push({ k: 'lash', x: x, y: eye + 2, f: f, t: 0.22 }); homHit(x, eye - 12, x + f * 60, eye + 14, 1, { from: x, onHit: function () { if (me && (HFX.lashN = (HFX.lashN || 0) + 1) <= 2) { gotDrop(); FX.push({ k: 'spark', x: PL.x, y: PL.y - 40, t: 0.25 }); } } }); HFX.lashN = 0; sfx.play('whip'); break;
    case 'leech': if (me) { p.biteT = 0.24; p.face = f; p.biteSeen = {}; if (p.air) p.vx = f * 380; else { p.gsp = f * Math.max(Math.abs(p.gsp), 380); } sfx.play('dash'); } else homHit(x, y - 26, x + f * 24, y, 2, { from: x }); break;
    case 'scout': var len = 280, n2 = homHit(x, eye - 4, x + f * len, eye + 4, 1, { from: x, brk: 1 }); HFX.push({ k: 'laser', x: x + f * 8, y: eye - 2, f: f, len: len, t: 0.25 }); sfx.play('zap'); break;
    case 'goldie': SHOTS.push({ x: x + f * 10, y: y - 14, vx: f * 230 + (me ? (p.air ? p.vx : p.gsp) * 0.25 : 0), vy: -90, g: 820, life: 2.2, k: 'coin', mine: true, bounces: 4, onWall: coinBounce }); sfx.play('drop'); break;
    case 'titan': if (me && p.air) { p.poundT = 1; p.vy = 900; p.vx *= 0.3; sfx.play('dash'); } else quake(x, y, me); break;
    case 'blood': HFX.push({ k: 'scythe', x: x, y: y - 18, f: f, t: 0.28 }); homHit(x - 46, y - 40, x + 46, y + 2, 2, { from: x, brk: 1 });
      SHOTS.push({ x: x + f * 14, y: y - 20, vx: f * 360, vy: 0, life: 0.7, k: 'crescent', mine: true, pierce: 1, dmg: 1 }); sfx.play('whip'); break;
  }
}
function acidSplash(s) { if (s.splashed) return; s.splashed = 1; var y = s.y, x = s.x; for (var k = 0; k < 6 && wallAt(x, y); k++) y -= TS / 2; var fl = floorAt(x, y - 8, y + 6 * TS, true); BURNS.push({ x: x, y: (fl === null ? y : fl) + 2, t: 5, acid: 1 }); sfx.play('pop'); bits(x, y, 10, ['#4ec43a', '#a8ff6a', '#1e5a10'], 140); }
function coinBounce(s) { if (s.vy > 0 && s.bounces > 0) { s.bounces--; s.y = Math.floor(s.y / TS) * TS - 1; s.vy = -Math.max(200, Math.abs(s.vy) * 0.75); sfx.play('drop', 0.4); return true; } return false; }
function quake(x, y, me) { [-1, 1].forEach(function (d) { SHOTS.push({ x: x + d * 12, y: y - 6, vx: d * 280, vy: 0, life: 0.75, k: 'quake', mine: true, pierce: 1, dmg: 2, ghost: 1, big: 4 }); });
  homHit(x - 30, y - 30, x + 30, y + 4, 2, { from: x, brk: 1 }); for (var cx = -2; cx <= 2; cx++) { var tx = Math.floor((x + cx * TS) / TS), ty = Math.floor((y + 4) / TS); if (isBreak(T(tx, ty))) breakWall(tx, ty); }
  G.shake = Math.max(G.shake, me ? 6 : 3); sfx.play('thud'); bits(x, y, 14, ['#7a6a6a', '#d04a1a', '#f1e7d0'], 160); HFX.push({ k: 'quake', x: x, y: y, t: 0.35 }); }
function chainZap(x, y, f) {
  var pts = [[x, y]], seen = {}, cur = { x: x, y: y }, reach = 160, any = false;
  for (var j = 0; j < 3; j++) { var best = null, bd = 1e9, bi = -1;
    ENTS.forEach(function (e, ei) { if (e.k !== 'foe' || !e.alive || seen[ei] || (e.F.beh === 'pop' && (e.rise || 0) < 0.4)) return; var d = Math.hypot(e.x - cur.x, e.y - 14 - cur.y); if (j === 0 && (e.x - x) * f < -20) d += 60; if (d < reach && d < bd) { bd = d; best = e; bi = ei; } });
    if (!best) break; seen[bi] = 1; any = true; hitFoe(best, 1); pts.push([best.x, best.y - 14]); cur = { x: best.x, y: best.y - 14 }; reach = 110; }
  if (G.boss && G.boss.alive) { var bb = bossList()[0]; if (bb && Math.hypot(bb.x - x, bb.y - bb.h / 2 - y) < 190 && bossHitBy(bb.x, bb.y - bb.h / 2)) { hitBoss(1); pts.push([bb.x, bb.y - bb.h / 2]); any = true; } }
  if (!any) { pts.push([x + f * 70, y]); homHit(x, y - 8, x + f * 70, y + 8, 1, { from: x }); }
  HFX.push({ k: 'zap', pts: pts, t: 0.25 }); sfx.play('zap');
}

/* ---------- into the player's step ---------- */
(function () {
  var sP = stepPlayer; stepPlayer = function (dt) {
    var p = PL, b = homBreed(), C = CHR(), n0 = SHOTS.length, j0 = p ? p.jumps : 0, a0 = p ? p.air : false, jHeld = KIT.held('a'), jp = jHeld && !G.homPrevJ; G.homPrevJ = jHeld;
    var keep = null; if (b === 'frost') { keep = [PHYS.top, PHYS.acc]; PHYS.top *= 1.15; PHYS.acc *= 1.12; }
    try { sP(dt); } finally { if (keep) { PHYS.top = keep[0]; PHYS.acc = keep[1]; } }
    if (!p || !PL) return; p = PL;
    // B: Cumhead's shot becomes the breed's own attack (and his follower joins in)
    for (var i = n0; i < SHOTS.length; i++) { var s = SHOTS[i]; if (s.k !== 'sperm' || !s.mine || s.homDone) continue; s.homDone = 1;
      if (b) { s.life = 0; homAttack(b, { x: p.x, y: p.y, face: p.face }); p.atkCd = HOMAB[b].cd; }
      else if (C.kind === 'ch' && C.fol && C.fol !== 'cat' && FOL && !FOL.hide && !FOL.fly && HOMAB[C.fol]) { if (!(G.folCd > 0)) { homAttack(C.fol, { x: FOL.x, y: FOL.y, face: FOL.face, fol: true }); G.folCd = HOMAB[C.fol].cd * 1.6; } } }
    if (G.folCd > 0) G.folCd -= dt;
    if (!b) return;
    // moving attacks: Bulwark's charge, Leechling's lunge, Titan's slam
    if (p.ramT > 0) { p.ramT -= dt; var v = p.face * 520; if (p.air) p.vx = v; else p.gsp = v; homHit(p.x, p.y - 30, p.x + p.face * 22, p.y, 2, { brk: 1 }); if (Math.random() < 0.6) FX.push({ k: 'bit', x: p.x - p.face * 8, y: p.y - 4, vx: -p.face * 60, vy: -30, t: 0.3, c: '#c8b89a' }); }
    if (p.biteT > 0) { p.biteT -= dt; homHit(p.x, p.y - 26, p.x + p.face * 22, p.y, 2, { from: p.x, seen: p.biteSeen }); }
    if (p.poundT) { if (p.state !== 'normal') p.poundT = 0; else if (p.air) { p.vy = Math.max(p.vy, 900); homHit(p.x - 12, p.y - 20, p.x + 12, p.y + 6, 2, { brk: 1 }); } else { p.poundT = 0; quake(p.x, p.y, true); } }
    // Bloodmoon: a third jump (Super still comes first once all seven chalices and 50 drops are in)
    if (b === 'blood' && jp && a0 && j0 === 2 && p.air && p.jumps === 2 && p.state === 'normal' && !G.super && !canSuper()) { p.vy = -PHYS.jump2 * 0.95; p.jumps = 3; sfx.play('jump2'); FX.push({ k: 'ring', x: p.x, y: p.y, t: 0.3 }); bits(p.x, p.y, 8, ['#ff2630', '#1a0206'], 90); }
    // Voltling: drops fly to him
    if (b === 'volt' && p.state === 'normal') { ENTS.forEach(function (e) { if (e.k === 'drop' && e.alive) { var dx = p.x - e.x, dy = p.y - 16 - (e.y - 6), d = Math.hypot(dx, dy); if (d < 110 && d > 2) { var sp = Math.min(d, 340 * dt); e.x += dx / d * sp; e.y += dy / d * sp; } } });
      SCAT.forEach(function (d0) { if (d0.t < 0.6 || d0.t > 50) return; var dx = p.x - d0.x, dy = p.y - 16 - d0.y, d = Math.hypot(dx, dy); if (d < 110 && d > 2) { var sp = Math.min(d, 340 * dt); d0.x += dx / d * sp; d0.y += dy / d * sp; d0.vy = 0; d0.vx = 0; } }); }
    // Gloop's slime regrows
    if (b === 'gloop' && !G.ooze) { G.oozeT = (G.oozeT || 0) - dt; if (G.oozeT <= 0) { G.ooze = 1; sfx.play('bubble'); } }
    // Titan walks through cracked walls at any pace
    if (b === 'titan' && p.state === 'normal') { var vv = p.air ? p.vx : p.gsp; if (Math.abs(vv) > 30) { var ax = p.x + Math.sign(vv) * 14; for (var hh = 4; hh < 44; hh += 10) { var cx = Math.floor(ax / TS), cy = Math.floor((p.y - hh) / TS); if (isBreak(T(cx, cy))) { breakWall(cx, cy); break; } } } }
  };
  // getting hurt: Bulwark's plates, Gloop's slime, Mendling's patch, Embertail's fireproof hide, Bulwark/Leechling mid charge
  var hu = hurt; hurt = function (srcx, hazard) {
    var p = PL, b = homBreed(); if (!b || !p || p.state !== 'normal' || p.inv > 0 || G.star > 0 || G.mode !== 'play') return hu(srcx, hazard);
    if (p.ramT > 0) return; // he is charging: things bounce off his skull
    if (b === 'ember' && (G.fireNow || (hazard && liquidAt(p.x, p.y - 10) === 'lava'))) return;
    if (p.shield) return hu(srcx, hazard);
    if (b === 'gloop' && G.ooze) { G.ooze = 0; G.oozeT = 20; p.inv = 1.2; sfx.play('pop'); bits(p.x, p.y - 18, 14, ['#4ec43a', '#a8ff6a', '#f4ffe0'], 160); knock(srcx, 0.5); return; }
    if (b === 'medic' && G.drops <= 0 && !G.patched) { G.patched = 1; p.inv = 2; knock(srcx, 0.8); sfx.play('life'); G.banner = 1.4; G.bannerTxt = 'PATCHED UP!'; bits(p.x, p.y - 18, 10, ['#ffb0c8', '#f1e7d0'], 120); return; }
    if (b === 'guard' && G.drops > 1) { var keep = Math.floor(G.drops / 2); G.drops -= keep; hu(srcx, hazard); G.drops += keep; FX.push({ k: 'item', x: p.x, y: p.y - 50, t: 1, s: 'BONE PLATES', vx: 0, vy: -20, g: 0 }); return; }
    return hu(srcx, hazard);
  };
  // kills: Leechling drinks a drop from each; Titan's stomps land three times as hard
  var hf = hitFoe; hitFoe = function (e, n, stomp) { var b = homBreed(), was = e.alive; if (stomp && b === 'titan') n = Math.max(n, 3); hf(e, n, stomp); if (was && !e.alive && b === 'leech' && G.mode === 'play' && PL && PL.state !== 'dead') { gotDrop(); FX.push({ k: 'bit', x: e.x, y: e.y - 14, vx: 0, vy: -60, t: 0.5, c: '#ff2630' }); } };
  // Goldie: one drop in three counts twice
  var gd = gotDrop; gotDrop = function (quiet) { gd(quiet); if (homIs('goldie') && Math.random() < 1 / 3) { gd(true); if (!quiet && PL) FX.push({ k: 'bit', x: PL.x, y: PL.y - 40, vx: 0, vy: -50, t: 0.4, c: '#ffe36a' }); } };
  // a new act: the slime is back, the patch is fresh, the pad says what B does
  var bA = beginAct; beginAct = function (ai, fromCheck) { bA(ai, fromCheck); HFX = []; G.ooze = homIs('gloop') ? 1 : 0; G.oozeT = 0; if (!fromCheck) G.patched = 0; homPad(); };
  // the effects
  var sw = stepWorld; stepWorld = function (dt) { sw(dt); stepHFX(dt); };
  var dB = drawBurns; drawBurns = function (cx, cy) { drawAcid(cx, cy); dB(cx, cy); drawHFX(cx, cy); };
  var dP = drawPlayer; drawPlayer = function (p, cx, cy) { dP(p, cx, cy); if (homIs('gloop') && G.ooze && p.state !== 'dead') { var g = KIT.ctx, x = Math.round(p.x - cx), y = Math.round(p.y - cy - 18), r = 20 + Math.sin(G.t * 4) * 1.5; g.strokeStyle = 'rgba(168,255,106,0.75)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r * 0.8, r, 0, 0, 6.3); g.stroke(); R('#f4ffe0', x - 8, y - 12, 3, 3); } };
})();
function homPad() { try { var C = CHR(), b = C.kind === 'hom' ? C.breed : null, s = document.querySelectorAll('#acts .pbtn small'); if (s[1]) s[1].textContent = b ? HOMAB[b].pad : C.kind === 'lab' ? 'BAG' : 'SHOT'; } catch (e) {} }
/* flames burn what is in front while they last, the rest just fade */
function stepHFX(dt) {
  HFX.forEach(function (h) { h.t -= dt;
    if (h.k === 'fire') { h.tt -= dt; if (!h.fol && PL) { h.x = PL.x; h.y = PL.y - 18; h.f = PL.face; } else if (h.fol && FOL) { h.x = FOL.x; h.y = FOL.y - 18; h.f = FOL.face; }
      if (h.tt <= 0) { h.tt = 0.12; h.seen = {}; homHit(h.x + h.f * 6, h.y - 14, h.x + h.f * 62, h.y + 10, 1, { from: h.x, seen: h.seen }); }
      if (Math.random() < 0.9) FX.push({ k: 'bit', x: h.x + h.f * (10 + Math.random() * 50), y: h.y + (Math.random() - 0.5) * 16, vx: h.f * 60, vy: -40, t: 0.25, c: Math.random() < 0.5 ? '#ff6a10' : '#ffd23a' }); } });
  HFX = HFX.filter(function (h) { return h.t > 0; });
}
function drawAcid(cx, cy) { var g = KIT.ctx; BURNS.forEach(function (b) { if (!b.acid) return; var x = Math.round(b.x - cx), y = Math.round(b.y - cy), k = Math.min(1, b.t / 1.5); if (x < -30 || x > KIT.W + 30) return;
  R('#1e5a10', x - 16, y - 2, 32, 3); R('#4ec43a', x - 14, y - 3, 28, 2); for (var i = 0; i < 4; i++) { var bx = x - 12 + i * 8, by = y - 4 - Math.abs(Math.sin(G.t * 5 + i * 1.7)) * 6 * k; R('#a8ff6a', bx, by, 2, 2); } }); }
function drawHFX(cx, cy) {
  var g = KIT.ctx;
  HFX.forEach(function (h) { var x = Math.round(h.x - cx), y = Math.round(h.y - cy);
    if (h.k === 'fire') { for (var i = 0; i < 7; i++) { var d = 10 + i * 8, s2 = 3 + i * 1.6, wob = Math.sin(G.t * 30 + i) * 2; g.fillStyle = i % 2 ? '#ff6a10' : '#ffb040'; g.beginPath(); g.arc(x + h.f * d, y + wob, s2, 0, 6.3); g.fill(); } g.fillStyle = '#fff0c0'; g.beginPath(); g.arc(x + h.f * 12, y, 3, 0, 6.3); g.fill(); }
    else if (h.k === 'lash') { var k = 1 - h.t / 0.22; g.strokeStyle = '#7a1a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + h.f * 30, y - 18 + k * 20, x + h.f * 60 * Math.min(1, k * 1.6), y + 2); g.stroke(); g.strokeStyle = '#ffb0c8'; g.lineWidth = 1; g.stroke(); }
    else if (h.k === 'laser') { var x1 = x + h.f * h.len, a = h.t / 0.25; R('rgba(154,90,255,' + (0.5 * a).toFixed(2) + ')', Math.min(x, x1), y - 4, Math.abs(x1 - x), 8); R('#c8a0ff', Math.min(x, x1), y - 2, Math.abs(x1 - x), 4); R('#f4ecff', Math.min(x, x1), y - 1, Math.abs(x1 - x), 2); }
    else if (h.k === 'zap') { g.strokeStyle = '#ffe36a'; g.lineWidth = 2; g.beginPath(); h.pts.forEach(function (q, i) { var qx = q[0] - cx, qy = q[1] - cy; if (!i) g.moveTo(qx, qy); else { var px = h.pts[i - 1][0] - cx, py = h.pts[i - 1][1] - cy; for (var s = 1; s <= 4; s++) g.lineTo(px + (qx - px) * s / 4 + (s < 4 ? (Math.random() - 0.5) * 10 : 0), py + (qy - py) * s / 4 + (s < 4 ? (Math.random() - 0.5) * 10 : 0)); } }); g.stroke(); g.strokeStyle = '#fffde0'; g.lineWidth = 1; g.stroke(); }
    else if (h.k === 'scythe') { var k2 = 1 - h.t / 0.28; g.strokeStyle = '#ff2630'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 34, -Math.PI / 2 + h.f * (k2 * 6.3 - 1), -Math.PI / 2 + h.f * k2 * 6.3, h.f < 0); g.stroke(); g.strokeStyle = '#1a0206'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 30, 0, 6.3); g.stroke(); }
    else if (h.k === 'quake') { var r = (0.35 - h.t) * 160; g.strokeStyle = '#d04a1a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r, r * 0.25, 0, 0, 6.3); g.stroke(); }
  });
  // Frostbite's frozen foes
  ENTS.forEach(function (e) { if (e.k !== 'foe' || !e.alive || !(e.frozen > 0)) return; var x = Math.round(e.x - cx), y = Math.round(e.y - cy), w = e.small ? 9 : 13, h = e.small ? 16 : 27;
    g.fillStyle = 'rgba(154,223,255,0.45)'; g.fillRect(x - w, y - h, w * 2, h); R('#f0fbff', x - w, y - h, w * 2, 1); R('#4ab0ff', x - w, y - 1, w * 2, 1); R('#f0fbff', x - w + 2, y - h + 3, 2, 6); if (e.frozen < 1 && Math.floor(G.t * 10) % 2) R('#ffffff', x - 2, y - h / 2, 4, 1); });
  // Peeper's third eye: cracked walls on screen glow
  if (homIs('scout')) { var c0 = Math.floor(cx / TS), r0 = Math.floor(cy / TS), pulse = 0.35 + Math.sin(G.t * 5) * 0.2; for (var c = c0; c <= c0 + Math.ceil(KIT.W / TS) + 1; c++) for (var r2 = r0; r2 <= r0 + Math.ceil(KIT.H / TS) + 1; r2++) if (T(c, r2) === 'X') { g.fillStyle = 'rgba(200,160,255,' + pulse.toFixed(2) + ')'; g.fillRect(c * TS - cx, r2 * TS - cy, TS, TS); } }
}
/* the new shots */
(function () { var dS = drawShot; drawShot = function (g, s, x, y) {
  if (s.k === 'acid') { R('#12040a', x - 4, y - 4, 8, 8); R('#4ec43a', x - 3, y - 3, 6, 6); R('#a8ff6a', x - 3, y - 3, 3, 2); return; }
  if (s.k === 'icicle') { var f = s.vx < 0 ? -1 : 1; g.fillStyle = '#10406a'; g.beginPath(); g.moveTo(x + f * 9, y); g.lineTo(x - f * 7, y - 4); g.lineTo(x - f * 7, y + 4); g.fill(); g.fillStyle = '#9adfff'; g.beginPath(); g.moveTo(x + f * 7, y); g.lineTo(x - f * 6, y - 2.5); g.lineTo(x - f * 6, y + 2.5); g.fill(); R('#f0fbff', x - 3, y - 1, 5, 1); return; }
  if (s.k === 'coin') { var w = Math.abs(Math.cos(G.t * 14)) * 4 + 1; R('#6e3808', x - w - 1, y - 5, w * 2 + 2, 10); R('#ffe36a', x - w, y - 4, w * 2, 8); R('#fffbe8', x - w, y - 4, Math.max(1, w), 2); return; }
  if (s.k === 'crescent') { g.strokeStyle = '#1a0206'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 9, -1.3, 1.3, s.vx < 0); g.stroke(); g.strokeStyle = '#ff2630'; g.lineWidth = 3; g.stroke(); return; }
  if (s.k === 'quake') { R('#5a1404', x - 8, y - 2, 16, 8); R('#d04a1a', x - 7, y - 6 - Math.abs(Math.sin(G.t * 30)) * 4, 4, 10); R('#ff8a5a', x + 2, y - 4, 4, 8); return; }
  dS(g, s, x, y); }; })();
(function () { var t = sfx.tone, n = sfx.noise; // the sounds the homunculi need
  sfx.add('whip', function () { t('sawtooth', 1600, 200, 0.12, 0.05); n(0.08, 0.08, 3000); });
  sfx.add('zap', function () { t('square', 1800, 300, 0.14, 0.05); n(0.12, 0.12, 5000); });
  sfx.add('bubble', function () { t('sine', 400, 1200, 0.2, 0.08); }); })();
