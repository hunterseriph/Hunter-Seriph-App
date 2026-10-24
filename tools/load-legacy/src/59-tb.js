/* =====================================================================================================
   TB'S TOLL: TB stands in front of the castle gate and takes your drops to let you in.
   Pay the lot, or make a deal: he takes only 80% but you both swallow one of TB's Silly Pills, and the
   heir goes in with a random bad effect. There is a 1% chance he slips you a pill anyway.
   Every trip through raises your reputation with him, and the better you know him the less he takes.
   ===================================================================================================== */
var PILLS = {
  heavy: { name: 'Heavy Legs', d: 'You move 20% slower' },
  butter: { name: 'Butterfingers', d: 'Attacks are 25% slower' },
  glass: { name: 'Glass Jaw', d: 'You take 30% more damage' },
  tiny: { name: 'Tiny Heart', d: '25% less max HP' },
  blurry: { name: 'Blurry Eyes', d: 'You can barely see past the end of your nose' },
  leaky: { name: 'Leaky Pockets', d: 'Drops are worth 25% less' },
  hiccup: { name: 'The Hiccups', d: 'You hop about when you least want to' },
  fog: { name: 'Brain Fog', d: 'Mana refills half as fast' }
};
var PILLORDER = Object.keys(PILLS);
function townHeir() { return META.nextHeir || META.last || 'cumhead'; } // who you walk the town as: the heir chosen for the next run
function tbLevel() { return Math.min(10, Math.floor((META.tbRep || 0) / 3)); }
function tbRate() { return (100 - tbLevel() * 5) / 100; } // 100% down to 50%
function tbToll(deal) { return Math.floor(META.bank * tbRate() * (deal ? 0.8 : 1)); }
function openToll() {
  var heir = META.nextHeir || 'cumhead', lv = tbLevel(), next = 3 - (META.tbRep || 0) % 3;
  openMenu({ title: "TB's Toll", note: tbQuote() + '  ·  He takes your banked drops to let you in.', pic: 'npc_tb', bank: 'town', rows: [
    { name: 'TB TAKES ' + Math.round(tbRate() * 100) + '% OF YOUR BANK  ·  REPUTATION ' + lv + (lv < 10 ? '  ·  ' + next + ' MORE TRIPS TO THE NEXT' : '  ·  BEST MATES'), cls: 'head' },
    { icon: 'coin', name: 'PAY THE TOLL', sub: CLASSES[heir].name + ' goes in. TB keeps ' + fmtN(tbToll(false)) + ' drops.', price: fmtN(tbToll(false)), cls: 'sec', fn: function () { payToll(false); } },
    { icon: 'stim', name: "MAKE A DEAL", sub: "He only takes 80% (" + fmtN(tbToll(true)) + "), but you take one of TB's Silly Pills with him. Something will go wrong in there.", price: fmtN(tbToll(true)), fn: function () { payToll(true); } },
    { icon: 'curse', name: 'NOT YET', sub: 'Spend your drops in town first. Whatever is left, he takes.', fn: closeMenu }
  ] });
}
function payToll(deal) {
  var toll = tbToll(deal); META.bank -= toll; META.tbRep = (META.tbRep || 0) + (deal ? 2 : 1); saveMeta(); closeMenu();
  var pill = deal || Math.random() < 0.01 ? PILLORDER[Math.floor(Math.random() * PILLORDER.length)] : null, sneaky = pill && !deal;
  G.banner = 0; G.msg = null;
  G.pillFade = { t: pill ? 3.2 : 1.2, pill: pill, sneaky: sneaky, heir: META.nextHeir || 'cumhead', toll: toll }; sfx.door();
}
/* the walk through the gate: a fade to black, then the run starts (with a pill, if he gave you one) */
function tollStep(dt) {
  var f = G.pillFade; if (!f) return false;
  f.t -= dt; if (f.t <= 0) { G.pillFade = null; startRun(f.heir); if (f.pill) { RUN.pill = f.pill; ST = calcStats(); P.hp = Math.min(P.hp, ST.mhp); G.banner = 3.2; G.bannerTxt = "TB'S SILLY PILL"; G.bannerSub = PILLS[f.pill].name.toUpperCase() + ': ' + PILLS[f.pill].d.toUpperCase(); saveRun(); } }
  return true;
}
function drawToll() {
  var f = G.pillFade; if (!f) return; var a = Math.min(1, (f.pill ? 3.2 : 1.2) - f.t) * 1.4;
  ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, a).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH);
  if (a > 0.9) {
    text('TB TAKES ' + fmtN(f.toll) + ' DROPS', VW / 2, VH / 2 - 26, 'center', '#ffe36a', 7);
    if (f.pill) text(f.sneaky ? 'HE SLIPS SOMETHING INTO YOUR HAND. YOU SWALLOW IT BEFORE YOU THINK.' : 'YOU SWALLOW THE PILL. TB SWALLOWS TWO.', VW / 2, VH / 2 - 8, 'center', '#f1e7d0', 5);
    if (f.pill && f.t < 1.6) text('...THE ROOM TILTS.', VW / 2, VH / 2 + 10, 'center', '#ff2630', 6);
  }
}
/* what the pills do, applied at the end of calcStats */
function pillStats(s) {
  var p = RUN && RUN.pill; if (!p) return;
  if (p === 'heavy') s.spd *= 0.8; else if (p === 'butter') s.atkMul *= 1.25; else if (p === 'glass') s.takeMul *= 1.3;
  else if (p === 'tiny') s.mhp = Math.round(s.mhp * 0.75); else if (p === 'leaky') s.dropMul *= 0.75; else if (p === 'fog') s.manaRegen *= 0.5;
}
function pillTick(dt) {
  if (!RUN || RUN.pill !== 'hiccup' || P.state !== 'normal') return;
  P.hicT = (P.hicT || 3) - dt; if (P.hicT <= 0) { P.hicT = 2 + Math.random() * 4; if (P.onGround) { P.vy = -200; P.onGround = false; pop(P.x, P.y - P.h - 6, 'HIC!', '#ff9ad0'); sfx.jump(); } }
}
function drawPillFx() {
  if (!RUN || RUN.pill !== 'blurry' || G.mode !== 'play') return;
  var x = P.x - G.cam.x, y = P.y - P.h / 2 - (G.cam.y || 0), g = ctx.createRadialGradient(x, y, 50, x, y, 190);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.88)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}
function drawTB(x, gy) { // TB waits by the gate
  spr('npc_tb', x, gy, P.x < x + G.cam.x, 1.15);
  if (Math.abs(P.x - (x + G.cam.x)) < 110) { // TB has a lot to say
    var k = Math.floor(G.t / 4) % TBQUOTES.length, words = TBQUOTES[k].split(' '), lines = [''];
    words.forEach(function (w) { if ((lines[lines.length - 1] + ' ' + w).length > 26) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
    lines.forEach(function (l, i) { text(l, x, gy - 52 - (lines.length - 1 - i) * 8, 'center', '#ffe36a', 5); });
  }
}

/* ---------- the Homunculus Hatchery: a Homunculus heir hatches here in town, before going in ---------- */
function townHatch(dt) {
  if (!(P.thatch > 0)) return false;
  var was = P.thatch; P.thatch -= dt; P.vx = 0;
  if (!META.nextHom && was >= 2.2 - dt * 1.5) { META.nextHom = homPick(); META.hatched = META.hatched || {}; META.hatched[META.nextHom] = 1; saveMeta(); }
  if (was > 0.5 && P.thatch <= 0.5) { sfx.splat(); poof(P.x, P.y - 10, 20, ['#f1e7d0', '#fff6d8', HOMDATA.breeds[META.nextHom].ooze]); G.shake = 4; }
  if (P.thatch <= 0) { P.thatch = 0; var b = META.nextHom; G.banner = 2.6; G.bannerTxt = 'A BABY ' + HOMDATA.breeds[b].name.toUpperCase() + ' HATCHES'; G.bannerSub = (HOMPOW[b] || '').toUpperCase(); sfx.oneup(); }
  return true;
}
function drawTownEgg(x, y) {
  var t = 2.2 - P.thatch, k = t < 0.6 ? 0 : t < 1.1 ? 1 : t < 1.5 ? 2 : 3, b = META.nextHom || 'gloop', wob = Math.sin(G.t * (10 + k * 6)) * (0.06 + k * 0.05);
  if (P.thatch < 0.5) { spr('h_' + b + '_baby_idle0', x, y + 1, false, 1); spr('h_' + b + '_egg3', x, y, false, 1.3, P.thatch / 0.5 * 0.8); return; }
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(wob); spr('h_' + b + '_egg' + k, 0, 0, false, 1.3); ctx.restore();
}
function drawHatchery(x, gy) { // a low nursery: glass front, a heat lamp, eggs on straw
  R(ctx, '#12040a', x - 52, gy - 70, 104, 70); R(ctx, '#2a1410', x - 51, gy - 69, 102, 69); for (var i = 0; i < 6; i++) R(ctx, '#3a1c14', x - 51 + i * 17, gy - 69, 2, 69);
  ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.moveTo(x - 58, gy - 70); ctx.lineTo(x, gy - 92); ctx.lineTo(x + 58, gy - 70); ctx.fill(); ctx.fillStyle = '#3a6a1a'; ctx.beginPath(); ctx.moveTo(x - 52, gy - 71); ctx.lineTo(x, gy - 88); ctx.lineTo(x + 52, gy - 71); ctx.fill();
  R(ctx, '#12040a', x - 40, gy - 54, 80, 40); R(ctx, 'rgba(120,255,90,0.12)', x - 38, gy - 52, 76, 36); R(ctx, '#c8903a', x - 38, gy - 22, 76, 6);
  var hl = 0.5 + Math.sin(G.t * 3) * 0.15; ctx.save(); ctx.globalAlpha = hl; ctx.fillStyle = '#ffb040'; ctx.beginPath(); ctx.moveTo(x - 4, gy - 52); ctx.lineTo(x - 30, gy - 22); ctx.lineTo(x + 30, gy - 22); ctx.lineTo(x + 4, gy - 52); ctx.fill(); ctx.restore(); R(ctx, '#ff7a30', x - 4, gy - 54, 8, 4);
  ['gloop', 'ember', 'blood', 'frost'].forEach(function (b, i) { spr('h_' + b + '_egg0', x - 27 + i * 18, gy - 22, false, 0.9); });
  R(ctx, '#12040a', x - 10, gy - 14, 20, 14); R(ctx, '#3a1c14', x - 9, gy - 13, 18, 13);
}
function openHatchery() {
  var mine = townHeir() === 'homunculus' ? META.nextHom : null, seen = META.hatched || {};
  var rows = [{ name: mine ? 'YOUR HEIR: A BABY ' + HOMDATA.breeds[mine].name.toUpperCase() : 'CHOOSE THE HOMUNCULUS AS YOUR HEIR AND HE HATCHES HERE', cls: 'head' }];
  (HOMDATA.order || []).forEach(function (b) { var known = seen[b] || b === 'gloop'; rows.push({ icon: 'h_' + b + '_adult_idle0', name: known ? HOMDATA.breeds[b].name.toUpperCase() + (b === mine ? '  ·  YOURS' : '') : '???', sub: known ? HOMMOVE[b][2] : (b === 'blood' ? 'Black and red. Very rare. The best of them.' : 'Not hatched yet'), cls: b === mine ? 'own' : (known ? '' : 'off') }); });
  openMenu({ title: 'Homunculus Hatchery', note: 'Every breed fights its own way. You never know which one is in the egg.', pic: null, bank: 'none', rows: rows });
}
