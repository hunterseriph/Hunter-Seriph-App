/* =====================================================================================================
   THE HOMUNCULUS HEIR: hatches from an egg when the run starts, then grows from baby to teenager to adult.
   Kills and drops fill his growth bar. Each stage hits harder and fights differently. Half the time he is
   the classic Gloop; otherwise he is one of the other breeds from Cumheads Quest, each with its own power.
   Art: tools/homunculus/gen.py (frames h_<breed>_<stage>_<frame>, eggs h_<breed>_egg0..3).
   ===================================================================================================== */
var HOMDATA = /*@HOM@*/{};
var HOMSTAGE = ['baby', 'teen', 'adult'], HOMSTNAME = ['BABY', 'TEENAGER', 'ADULT'], HOMNEED = [0, 150, 480];
var HOMMOD = { dmg: [0.65, 0.9, 1.2], hp: [0, 20, 50], spd: [1.15, 1.05, 0.95] };
function homOn() { return RUN && RUN.cls === 'homunculus'; }
function homSt() { return RUN && RUN.hom ? RUN.hom.st : 0; }
function homBreed() { return RUN && RUN.hom ? RUN.hom.b : 'gloop'; }
function homName() { var b = HOMDATA.breeds && HOMDATA.breeds[homBreed()]; return b ? b.name : 'Gloop'; }
function homOoze() { var b = HOMDATA.breeds && HOMDATA.breeds[homBreed()]; return b ? b.ooze : '#7dff3a'; }
function homPick() { // half the time the classic Gloop; Bloodmoon, the black and red one, is rare
  var o = (HOMDATA.order || ['gloop']).filter(function (k) { return k !== 'gloop' && k !== 'blood'; }), r = Math.random();
  if (r < 0.06 && HOMDATA.breeds && HOMDATA.breeds.blood) return 'blood';
  return r < 0.53 || !o.length ? 'gloop' : o[Math.floor(Math.random() * o.length)];
}
function homNew() { RUN.hom = { b: (!RUN.endless && META.nextHom) || homPick(), st: 0, g: 0 }; if (!RUN.endless) { META.nextHom = null; saveMeta(); } } // hatched at the Hatchery in town
/* stat changes for his stage and breed, applied at the end of calcStats */
function homStats(s) {
  if (!homOn()) return; if (!RUN.hom) homNew();
  var st = RUN.hom.st, b = RUN.hom.b;
  s.mhp = Math.round(s.mhp + HOMMOD.hp[st]); s.dmg *= HOMMOD.dmg[st]; s.spd *= HOMMOD.spd[st]; s.small = st < 2;
  if (b === 'medic') s.regen = (s.regen || 0) + 1 + st;
  if (b === 'goldie') s.dropMul *= 1.3;
  if (b === 'titan') s.dmg *= 1.1;
  if (b === 'scout') s.crit += 0.1;
  if (b === 'blood') { s.dmg *= 1.2; s.mhp += 15; s.leech += 0.02; }
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
  G.bannerSub = (h.st === 1 ? 'BIGGER ' : 'FULL POWER ') + HOMMOVE[h.b][0].toUpperCase() + '  ·  ' + HOMMOVE[h.b][1].toUpperCase();
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
/* ---------- every breed fights its own way. Attack and special both get bigger as he grows. ---------- */
var HOMMOVE = {
  gloop: ['Acid Spit', 'Ooze Shield', 'Acid that poisons. Ooze Shield makes him untouchable for a moment.'],
  guard: ['Headbutt', 'Bone Plates', 'Butts foes with his bone plates. Bone Plates cut the damage he takes to a quarter.'],
  ember: ['Fire Breath', 'Fireball', 'Breathes short bursts of fire. Fireball explodes and sets everything alight.'],
  frost: ['Icicles', 'Freeze Nova', 'Icicles pierce and can freeze. Freeze Nova freezes everything near him.'],
  volt: ['Zap', 'Thunder', 'An instant zap that chains between foes. Thunder strikes the nearest foes.'],
  medic: ['Bandage Lash', 'Patch Up', 'A long lash that heals him a little on every hit. Patch Up heals a lot.'],
  leech: ['Bite', 'Blood Drain', 'Lunging bites that drink HP. Blood Drain drinks from everything nearby.'],
  scout: ['Eye Laser', 'Third Eye', 'A fast, long laser with more crits. Third Eye marks foes to take extra damage.'],
  goldie: ['Coin Toss', 'Gold Rush', 'Lobs bouncing coins. Gold Rush rains coins from above. Foes drop more.'],
  titan: ['Ground Pound', 'Earthquake', 'Heavy slams that send shockwaves along the floor. Earthquake hits every foe standing nearby.'],
  blood: ['Blood Scythe', 'Red Moon', 'The rarest and strongest. A wide scythe that throws crescents and drinks HP. Red Moon rains blood on every foe.']
};
var HOMPOW = {}; Object.keys(HOMMOVE).forEach(function (k) { HOMPOW[k] = HOMMOVE[k][0] + '  ·  ' + HOMMOVE[k][1]; });
var HOMCD = { gloop: 0.2, guard: 0.32, ember: 0.22, frost: 0.28, volt: 0.26, medic: 0.26, leech: 0.3, scout: 0.3, goldie: 0.28, titan: 0.38, blood: 0.3 };
function hshot(o) { o.hb = 1; o.col = o.col || homOoze(); if (o.k === undefined) o.k = 'acid'; if (o.pierce && !o.hit) o.hit = {}; pshots.push(o); return o; }
function hmelee(reach, h, m, extra) { var o = { k: 'melee', x: P.x, y: P.y, life: 0.14, m: m, hit: {}, reach: reach, h: h }; for (var k in extra || {}) o[k] = extra[k]; return hshot(o); }
function homFoes(r) { var out = []; enemies.concat(bosses).forEach(function (e) { if (e.alive && !e.hidden && !e.ghost && Math.hypot(e.x - P.x, (e.y - e.h / 2) - (P.y - P.h / 2)) < r) out.push(e); }); out.sort(function (a, b) { return Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y); }); return out; }
function homAttack() {
  var st = homSt(), f = P.face, b = homBreed(), hy = P.y - P.h * 0.6;
  P.atkCd = (HOMCD[b] || 0.25) * (1 + st * 0.1) * ST.atkMul; P.attackT = 0.2;
  if (b === 'gloop') { sfx.spit(); hshot({ x: P.x + f * 6, y: hy, vx: f * (250 + st * 60), vy: 0, life: 0.3 + st * 0.1, r: 3 + st, m: 0.75, fx: 'poison', small: st === 0 }); if (st === 2) hshot({ x: P.x + f * 6, y: hy, vx: f * 360, vy: -40, life: 0.45, r: 4, m: 0.5, fx: 'poison' }); }
  else if (b === 'guard') { sfx.stomp(); hmelee(22 + st * 6, P.h + 4, 1.3, { knock: 16 + st * 4, look: 'bone' }); P.vx = f * 140; }
  else if (b === 'ember') { sfx.fire(); for (var i = 0; i < 3; i++) hshot({ x: P.x + f * 8, y: hy, vx: f * (200 + i * 30), vy: (i - 1) * 40, life: 0.16 + st * 0.05, r: 4 + st, m: 0.35, pierce: 1, look: 'fire', fx: 'burn' }); }
  else if (b === 'frost') { sfx.whip(); var n = st + 1; for (var k = 0; k < n; k++) hshot({ x: P.x + f * 8, y: hy, vx: f * 420, vy: (k - (n - 1) / 2) * 50, life: 0.45, r: 3, m: 0.8, pierce: 1, look: 'ice', fx: 'freeze' }); }
  else if (b === 'volt') { homZap(100 + st * 30, 1.3, st); }
  else if (b === 'medic') { sfx.whip(); hmelee(40 + st * 8, 18, 1.1, { fx: 'mend', look: 'band' }); }
  else if (b === 'leech') { sfx.spit(); hmelee(20 + st * 4, P.h, 1.2, { fx: 'drink', look: 'bite' }); P.vx = f * 220; }
  else if (b === 'scout') { sfx.shoot(); hshot({ x: P.x + f * 8, y: P.y - P.h * 0.75, vx: f * 640, vy: 0, life: 0.45, r: 2, m: 1.15, look: 'beam', crit: 0.15, pierce: st === 2 ? 1 : 0 }); }
  else if (b === 'goldie') { sfx.pick(G.t); var nc = st === 2 ? 2 : 1; for (var c = 0; c < nc; c++) hshot({ x: P.x + f * 8, y: hy, vx: f * (210 + c * 60), vy: -170 - c * 40, g: 700, bounce: 1, life: 1.2, r: 4, m: 0.9 + st * 0.1, look: 'coin' }); }
  else if (b === 'titan') { sfx.land(); G.shake = Math.max(G.shake, 3); hmelee(26, 30, 1.6, { look: 'quake' }); if (st >= 1) [-1, 1].forEach(function (d) { hshot({ x: P.x + d * 14, y: P.y - 6, vx: d * 220, vy: 0, life: 0.25 + st * 0.12, r: 6, m: 0.6, pierce: 1, look: 'quake', ground: 1 }); }); }
  else if (b === 'blood') { sfx.whip(); hmelee(44 + st * 6, 34, 1.5, { fx: 'drink', look: 'scythe', back: 10 }); if (st >= 1) hshot({ x: P.x + f * 14, y: P.y - P.h * 0.55, vx: f * 340, vy: 0, life: 0.35 + st * 0.1, r: 6, m: 0.7, pierce: 1, look: 'blood', fx: 'drink' }); }
}
function homZap(range, m, chains) {
  var f = P.face, cands = homFoes(range).filter(function (e) { return (e.x - P.x) * f > -6 && Math.abs((e.y - e.h / 2) - (P.y - P.h / 2)) < 50; });
  sfx.fire(); var x0 = P.x + f * 8, y0 = P.y - P.h * 0.6;
  if (!cands.length) { fx.push({ k: 'zap', x0: x0, y0: y0, x1: x0 + f * range * 0.6, y1: y0, age: 0 }); return; }
  var hitL = [cands[0]], cur = cands[0];
  for (var i = 0; i < chains; i++) { var nx = null, bd = 90; enemies.concat(bosses).forEach(function (q) { if (q.alive && hitL.indexOf(q) < 0) { var d = Math.hypot(q.x - cur.x, q.y - cur.y); if (d < bd) { bd = d; nx = q; } } }); if (!nx) break; hitL.push(nx); cur = nx; }
  var px = x0, py = y0;
  hitL.forEach(function (e, k) { fx.push({ k: 'zap', x0: px, y0: py, x1: e.x, y1: e.y - e.h / 2, age: 0 }); px = e.x; py = e.y - e.h / 2; hitShot({ m: m * (k ? 0.7 : 1), hb: 1, k: 'zap', x: P.x }, e); });
}
function homSpecial() {
  var st = homSt(), col = homOoze(), b = homBreed(), f = P.face, i, list, tot;
  fx.push({ k: 'ring', x: P.x, y: P.y - P.h / 2, age: 0, big: st === 2 ? 1 : 0, c: col });
  if (b === 'gloop') { sfx.magic(); P.ooze = 3; P.oozeT = 0.5; if (st === 2) for (i = -2; i <= 2; i++) { var a = i * 0.28; hshot({ x: P.x + f * 10, y: P.y - P.h * 0.6, vx: f * Math.cos(a) * 380, vy: Math.sin(a) * 380, life: 0.6, r: 5, m: 1.1, fx: 'poison' }); } }
  else if (b === 'guard') { sfx.lock(); P.plates = 4 + st * 1.5; pop(P.x, P.y - P.h - 6, 'BONE PLATES', '#e9dcbc'); }
  else if (b === 'ember') { sfx.roar(); hshot({ x: P.x + f * 10, y: P.y - P.h * 0.6, vx: f * 230, vy: 0, life: 1.2, r: 8, m: 2, look: 'fire', fx: 'burn', boom: 40 + st * 12 }); }
  else if (b === 'frost') { sfx.magic(); homFoes(110 + st * 25).forEach(function (e) { e.stun = Math.max(e.stun || 0, e.boss ? 0.7 : 2.2); hitShot({ m: 1, hb: 1, k: 'zap', x: e.x - P.face }, e); pop(e.x, e.y - e.h - 12, 'FROZEN', '#9adfff'); }); poof(P.x, P.y - 16, 24, ['#ffffff', '#9adfff', '#c4f0ff']); }
  else if (b === 'volt') { sfx.roar(); G.strike = 0.12; homFoes(VW).slice(0, 3 + st).forEach(function (e) { fx.push({ k: 'zap', x0: e.x, y0: e.y - 140, x1: e.x, y1: e.y - e.h / 2, age: 0 }); hitShot({ m: 2.2, hb: 1, k: 'zap', x: e.x - P.face }, e); }); }
  else if (b === 'medic') { sfx.oneup(); var keep = ST.noHeal; healP(Math.round(ST.mhp * (0.25 + 0.05 * st))); P.ooze = 1; P.oozeT = 0.5; }
  else if (b === 'leech') { sfx.magic(); tot = 0; homFoes(100).forEach(function (e) { var h0 = e.hp; hitShot({ m: 1.3, hb: 1, k: 'zap', x: e.x - P.face }, e); tot += Math.max(0, h0 - e.hp); fx.push({ k: 'zap', x0: e.x, y0: e.y - e.h / 2, x1: P.x, y1: P.y - P.h / 2, age: 0 }); }); if (tot) healP(Math.round(tot * 0.3)); }
  else if (b === 'scout') { sfx.magic(); homFoes(VW).forEach(function (e) { e.marked = G.t + 5; pop(e.x, e.y - e.h - 12, 'MARKED', '#ffe36a'); }); }
  else if (b === 'goldie') { sfx.chest(); for (i = 0; i < 6 + st * 2; i++) hshot({ x: P.x + f * (20 + i * 22) + (Math.random() - 0.5) * 20, y: P.y - 150 - Math.random() * 40, vx: 0, vy: 120, g: 600, bounce: 1, life: 1.6, r: 5, m: 1.1, look: 'coin' }); }
  else if (b === 'titan') { sfx.roar(); G.shake = 14; homFoes(220).forEach(function (e) { if (e.onGround || e.boss) { hitShot({ m: 2.5, hb: 1, k: 'zap', x: e.x - P.face }, e); e.stun = Math.max(e.stun || 0, e.boss ? 0.5 : 1); } }); poof(P.x, P.y - 2, 30, ['#8a8a9a', '#565466', '#ffb040']); }
  else if (b === 'blood') { sfx.roar(); P.redMoon = 3; P.redT = 0; G.flash = 0.3; }
}
/* timers for specials that last a while */
function homTick(dt) {
  if (!homOn()) return;
  if (P.plates > 0) P.plates -= dt;
  if (P.redMoon > 0) {
    P.redMoon -= dt; P.redT -= dt;
    if (P.redT <= 0) { P.redT = 0.18; var fs = homFoes(VW * 0.8); var e = fs[Math.floor(Math.random() * Math.min(fs.length, 4))]; var tx = e ? e.x : P.x + (Math.random() - 0.5) * 200; hshot({ x: tx + (Math.random() - 0.5) * 10, y: (e ? e.y - e.h : P.y) - 140, vx: 0, vy: 460, life: 0.6, r: 5, m: 1, look: 'blood', fx: 'drink' }); }
  }
}
/* breed effects on a hit */
function homHit(s, e) {
  if (!s.hb || !homOn()) return;
  var b = homBreed();
  if (s.fx === 'poison') e.poison = 3;
  else if (s.fx === 'burn') e.burn = Math.max(e.burn || 0, 4);
  else if (s.fx === 'freeze' && Math.random() < 0.15 + 0.05 * homSt()) { e.stun = Math.max(e.stun || 0, e.boss ? 0.4 : 1.6); pop(e.x, e.y - e.h - 12, 'FROZEN', '#9adfff'); }
  else if (s.fx === 'mend') healP(1 + homSt(), true);
  else if (s.fx === 'drink') healP(Math.max(1, Math.round(ST.dmg * s.m * (b === 'blood' ? 0.06 : 0.1))), true);
  if (s.knock && !e.boss) { e.x += P.face * s.knock; e.stun = Math.max(e.stun || 0, 0.3); unstick(e); }
  if (s.boom) homBlast(s);
}
function homBlast(s) {
  if (s.boomed) return; s.boomed = 1; s.life = 0; sfx.splat(); G.shake = Math.max(G.shake, 6);
  fx.push({ k: 'ring', x: s.x, y: s.y, age: 0, c: s.col }); poof(s.x, s.y, 20, ['#ffb040', '#ff7a30', '#ffe36a']);
  enemies.concat(bosses).forEach(function (e) { if (e.alive && Math.hypot(e.x - s.x, (e.y - e.h / 2) - s.y) < s.boom + e.w / 2) { hurtE(e, ST.dmg * s.m * 0.8, 'boom'); if (s.fx === 'burn') e.burn = 4; } });
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
  if (P.plates > 0) for (var i = 0; i < 4; i++) { var a = G.t * 4 + i * 1.57; R(ctx, '#12040a', Math.round(x + Math.cos(a) * 13) - 2, Math.round(y - P.h / 2 + Math.sin(a) * 9) - 2, 5, 5); R(ctx, '#e9dcbc', Math.round(x + Math.cos(a) * 13) - 1, Math.round(y - P.h / 2 + Math.sin(a) * 9) - 1, 3, 3); }
  if (P.redMoon > 0) { ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 12; R(ctx, '#ff2630', Math.round(x) - 5, Math.round(y - P.h - 18), 10, 10); R(ctx, '#12040a', Math.round(x) - 2, Math.round(y - P.h - 18), 7, 7); ctx.restore(); }
  if (P.hatch > 0) { var fr = P.hatch / 0.55; spr('h_' + homBreed() + '_egg3', x, y, false, 1.3, fr * 0.8); } // the shell falls away
}
function homIcon() { return 'h_' + homBreed() + '_' + HOMSTAGE[homSt()] + '_idle0'; }
