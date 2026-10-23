/* =====================================================================================================
   THE HOMUNCULUS HEIR: hatches from an egg when the run starts, then grows from baby to teenager to adult.
   Kills and drops fill his growth bar. Each stage hits harder and fights differently. Half the time he is
   the classic Gloop; otherwise he is one of the other breeds from Cumheads Quest, each with its own power.
   Art: tools/homunculus/gen.py (frames h_<breed>_<stage>_<frame>, eggs h_<breed>_egg0..3).
   ===================================================================================================== */
var HOMDATA = /*@HOM@*/{};
var HOMSTAGE = ['baby', 'teen', 'adult'], HOMSTNAME = ['BABY', 'TEENAGER', 'ADULT'], HOMNEED = [0, 150, 480];
var HOMMOD = { dmg: [0.8, 1.25, 1.9], hp: [0, 20, 55], spd: [1.15, 1.05, 0.95], cd: [0.17, 0.2, 0.3] };
var HOMPOW = {
  gloop: 'Acid that poisons', guard: 'The first hit in every room is blocked', ember: 'Spit sets foes on fire', frost: 'Spit can freeze foes solid',
  volt: 'Spit arcs on to a second foe', medic: 'Slowly heals himself', leech: 'Drinks back some of the damage he deals', scout: 'Sharp eyes: more critical hits',
  goldie: 'Foes drop more', titan: 'Heavier spit, more damage'
};
function homOn() { return RUN && RUN.cls === 'homunculus'; }
function homSt() { return RUN && RUN.hom ? RUN.hom.st : 0; }
function homBreed() { return RUN && RUN.hom ? RUN.hom.b : 'gloop'; }
function homName() { var b = HOMDATA.breeds && HOMDATA.breeds[homBreed()]; return b ? b.name : 'Gloop'; }
function homOoze() { var b = HOMDATA.breeds && HOMDATA.breeds[homBreed()]; return b ? b.ooze : '#7dff3a'; }
function homPick() { var o = (HOMDATA.order || ['gloop']).slice(1); return Math.random() < 0.5 || !o.length ? 'gloop' : o[Math.floor(Math.random() * o.length)]; }
function homNew() { RUN.hom = { b: homPick(), st: 0, g: 0 }; }
/* stat changes for his stage and breed, applied at the end of calcStats */
function homStats(s) {
  if (!homOn()) return; if (!RUN.hom) homNew();
  var st = RUN.hom.st, b = RUN.hom.b;
  s.mhp = Math.round(s.mhp + HOMMOD.hp[st]); s.dmg *= HOMMOD.dmg[st]; s.spd *= HOMMOD.spd[st]; s.small = st < 2;
  if (b === 'guard') s.ward = true;
  if (b === 'medic') s.regen = (s.regen || 0) + 1 + st;
  if (b === 'goldie') s.dropMul *= 1.3;
  if (b === 'leech') s.leech += 0.06 + 0.02 * st;
  if (b === 'titan') s.dmg *= 1.15;
  if (b === 'scout') s.crit += 0.1;
}
function homSize() { var st = homSt(); P.w = [10, 11, 14][st]; P.h = [20, 28, 38][st]; }
/* growth: kills and drops */
function homGain(n) {
  if (!homOn() || !RUN.hom || RUN.hom.st >= 2 || P.state === 'dead') return;
  RUN.hom.g += n; if (RUN.hom.g >= HOMNEED[RUN.hom.st + 1]) homGrow();
}
function homGrow() {
  var h = RUN.hom; h.st++; ST = calcStats(); P.hp = ST.mhp; P.mana = ST.mmana; var y = P.y; homSize(); P.y = y;
  G.banner = 2.2; G.bannerTxt = h.st === 1 ? homName().toUpperCase() + ' IS A TEENAGER' : homName().toUpperCase() + ' IS FULLY GROWN';
  G.bannerSub = h.st === 1 ? 'ACID SPIT  ·  HITS HARDER' : 'CLAW SWIPES  ·  ACID BURST  ·  MUCH STRONGER';
  sfx.oneup(); G.shake = 6; poof(P.x, P.y - P.h / 2, 26, [homOoze(), '#f1e7d0', '#ffe36a']); fx.push({ k: 'ring', x: P.x, y: P.y - P.h / 2, age: 0, big: 1, c: homOoze() });
  saveRun();
}
function homGrowFrac() { if (!RUN.hom) return 0; var st = RUN.hom.st; if (st >= 2) return 1; return (RUN.hom.g - HOMNEED[st]) / (HOMNEED[st + 1] - HOMNEED[st]); }
/* the hatching at the start of a run */
function homHatchStart() { if (!homOn()) return; P.hatch = 1.9; P.vx = 0; G.banner = 0; }
function homHatchTick(dt) {
  if (!(P.hatch > 0)) return false;
  var was = P.hatch; P.hatch -= dt;
  if (was > 0.55 && P.hatch <= 0.55) { sfx.splat(); poof(P.x, P.y - 10, 20, ['#f1e7d0', '#fff6d8', homOoze()]); G.shake = 4; P.vy = -260; P.onGround = false; }
  if (P.hatch <= 0) { P.hatch = 0; G.banner = 2.4; G.bannerTxt = 'A BABY ' + homName().toUpperCase() + ' HATCHES'; G.bannerSub = (HOMPOW[homBreed()] || '').toUpperCase(); sfx.oneup(); }
  if (P.hatch < 0.55) { moveBody(P, dt, GRAV); }
  return true;
}
/* attacks by stage */
function homAttack() {
  var st = homSt(), f = P.face, col = homOoze();
  P.atkCd = HOMMOD.cd[st] * ST.atkMul; P.attackT = 0.2;
  if (st === 0) { sfx.spit(); pshots.push({ k: 'acid', x: P.x + f * 6, y: P.y - P.h * 0.55, vx: f * 250, vy: 0, life: 0.26, r: 3, m: 0.75, col: col, hb: 1, small: 1 }); }
  else if (st === 1) { sfx.spit(); pshots.push({ k: 'acid', x: P.x + f * 8, y: P.y - P.h * 0.62, vx: f * 360, vy: 0, life: 0.5, r: 4, m: 0.8, col: col, hb: 1 }); }
  else {
    sfx.whip(); pshots.push({ k: 'claw', x: P.x, y: P.y, life: 0.14, m: 1.6, hit: {}, col: col });
    P.clawN = (P.clawN || 0) + 1;
    if (P.clawN % 2 === 0) { [-30, 30].forEach(function (vy) { pshots.push({ k: 'acid', x: P.x + f * 10, y: P.y - P.h * 0.7, vx: f * 380, vy: vy, life: 0.5, r: 4, m: 0.7, col: col, hb: 1 }); }); sfx.spit(); }
  }
}
function homSpecial() {
  var st = homSt(), col = homOoze();
  if (st < 2) { sfx.magic(); P.ooze = 3; P.oozeT = 0.5; fx.push({ k: 'ring', x: P.x, y: P.y - 14, age: 0, c: col }); return; }
  // adult: Acid Burst, a fan of spit, and a short shield
  sfx.magic(); P.ooze = 1.5; P.oozeT = 0.5; fx.push({ k: 'ring', x: P.x, y: P.y - 20, age: 0, big: 1, c: col });
  for (var i = -2; i <= 2; i++) { var a = i * 0.28; pshots.push({ k: 'acid', x: P.x + P.face * 10, y: P.y - P.h * 0.6, vx: P.face * Math.cos(a) * 380, vy: Math.sin(a) * 380, life: 0.6, r: 5, m: 1.1, col: col, hb: 1 }); }
}
/* breed powers on a hit */
function homHit(s, e) {
  if (!s.hb || !homOn()) return; var b = homBreed();
  e.poison = 3;
  if (b === 'ember') e.burn = 4;
  else if (b === 'frost' && Math.random() < 0.25) { e.stun = Math.max(e.stun || 0, e.boss ? 0.4 : 1.6); pop(e.x, e.y - e.h - 12, 'FROZEN', '#9adfff'); }
  else if (b === 'volt') { var o = null, bd = 90; enemies.forEach(function (q) { if (q.alive && q !== e) { var d = Math.hypot(q.x - e.x, q.y - e.y); if (d < bd) { bd = d; o = q; } } }); if (o) { fx.push({ k: 'zap', x0: e.x, y0: e.y - e.h / 2, x1: o.x, y1: o.y - o.h / 2, age: 0 }); hurtE(o, ST.dmg * 0.5 * s.m, 'arc'); } }
}
/* drawing */
function homFrame() {
  var st = homSt(), sp = Math.abs(P.vx), f;
  if (P.state === 'hurt' || P.state === 'dead') f = 'hurt';
  else if (P.attackT > 0) f = 'atk';
  else if (!P.onGround) f = 'jump';
  else if (sp > 10) f = 'run' + (Math.floor(P.anim * 0.9) % 4);
  else f = 'idle' + (Math.floor(P.idleT * 2.2) % 2);
  return 'h_' + homBreed() + '_' + HOMSTAGE[st] + '_' + f;
}
function drawHom(x, y, flip) {
  if (P.hatch > 0.55) { // the egg wobbles, then cracks
    var t = 1.9 - P.hatch, k = t < 0.5 ? 0 : t < 0.9 ? 1 : t < 1.2 ? 2 : 3, wob = Math.sin(G.t * (10 + k * 6)) * (0.06 + k * 0.05);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(wob); spr('h_' + homBreed() + '_egg' + k, 0, 0, false, 1.3); ctx.restore(); return;
  }
  if (P.state === 'dead') { ctx.save(); ctx.translate(x, y - 6); ctx.rotate(flip ? -1.4 : 1.4); spr(homFrame(), 0, 6, flip, 1); ctx.restore(); return; }
  spr(homFrame(), x, y + 1, flip, 1);
  if (P.hatch > 0) { var fr = P.hatch / 0.55; spr('h_' + homBreed() + '_egg3', x, y, false, 1.3, fr * 0.8); } // the shell falls away
}
function homIcon() { return 'h_' + homBreed() + '_' + HOMSTAGE[homSt()] + '_idle0'; }
