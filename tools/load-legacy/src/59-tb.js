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
  openMenu({ title: "TB's Toll", note: '"Everything you are carrying, mate. That is the toll. House rules."', pic: 'npc_tb', bank: 'town', rows: [
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
  if (!META.seenTB && Math.abs(P.x - (x + G.cam.x)) < 90) text('"THE TOLL, MATE"', x, gy - 52, 'center', '#ffe36a', 5);
}
