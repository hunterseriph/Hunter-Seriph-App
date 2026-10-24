/* =====================================================================================================
   MERCHANTS IN THE CASTLE: each shopkeeper sells their own stock, like in Cumheads Quest.
   Prices are in the drops you are carrying and go up in deeper areas. Each item sells once per stall.
   Effects that last the run go into RUN.bonus and are read by calcStats (bonusStats).
   ===================================================================================================== */
var TBQUOTES = ['"Fuck muck"', '"Shithead Laboozie"', '"let me tighten that kynodesme"', '"dick skin"', '"whyma wimina"', '"suck your own and fuck your own"', '"suck me fuck me suck me fuck me"', '"I got lotion on my dick I\'m out here shooting my shit I\'m free man for real!"', '"Old geezer, Prick teaser"', '"I made muckies..."', '"a sissy doesn\'t deserve pleasure, a sissy is someone plaything"'];
function tbQuote() { return TBQUOTES[Math.floor(Math.random() * TBQUOTES.length)]; }
// item: [icon, name, description, base price, effect]. Effects: heal (fraction), mana, full, or run bonuses
var STALLS = {
  npc_joff: { q: '"Pineapple belongs on pizza. Fight me."', items: [['ppz', 'Pineapple Slice', 'Heal 35% of your HP', 30, { heal: 0.35 }], ['hpz', 'Ham and Pineapple', 'Heal 60% of your HP', 50, { heal: 0.6 }], ['cpie', 'Whole Pizza Box', '+20 max HP for this run', 80, { mhp: 20 }]] },
  npc_beebs: { q: '"Sit down, lad. First one\'s always warm."', items: [['ale', 'Pint of Ale', '+10% damage for this run', 70, { dmgP: 0.1 }], ['stew', "Beeb's Stew", 'Heal 40% of your HP', 35, { heal: 0.4 }], ['brute', 'One for the Road', '+25 max mana for this run', 50, { mana: 25 }]] },
  npc_kaya: { q: '"Welcome in! Kaya\'s on the coffee, Elden\'s on the grill."', items: [['cumpuccino', 'Cumpuccino', 'Full mana, and it refills faster this run', 50, { full: 1, manaRegen: 0.4 }], ['stim', 'Espresso Shot', '+10% attack speed for this run', 70, { atk: 0.1 }], ['croissant', 'Cream Croissant', 'Heal 30% of your HP', 25, { heal: 0.3 }]] },
  npc_elden: { q: '"Welcome in! Kaya\'s on the coffee, Elden\'s on the grill."', items: [['stew', 'Grilled Sausage', 'Heal 50% of your HP', 40, { heal: 0.5 }], ['hpz', "Elden's Full Plate", 'Heal 1 HP every 2 seconds this run', 90, { regen: 0.5 }], ['garlicbread', 'Burnt Toast', '+5% critical hits for this run', 60, { crit: 0.05 }]] },
  npc_amy: { q: '"Mild, hot or dynamite?"', items: [['wchili', 'Mild', 'Heal 25% of your HP', 20, { heal: 0.25 }], ['wchili', 'Hot', 'Your hits set foes on fire this run', 90, { burn: 1 }], ['dchili', 'Dynamite', 'Foes explode when they die this run', 120, { boom: 1 }]] },
  npc_t: { q: '"Come in, darling. I\'ll get the doors."', items: [['elixir', 'Have the Doors Opened', 'Come back once at full HP if you die this run', 160, { revive: 1 }], ['gtonic', 'A Little Kiss', 'Heal 50% of your HP', 40, { heal: 0.5 }], ['bloodpack', 'Red Lipstick', 'Heal 3% of the damage you deal this run', 90, { leech: 0.03 }]] },
  npc_saba: { q: '"Hitless runs only. Take a look, my friend."', items: [['iron', 'Hitless Charm', 'The first hit in every room is cancelled this run', 140, { ward: 1 }], ['regen', 'Hemp Wrap', 'Heal 30% and longer safety after a hit this run', 70, { heal: 0.3, iframes: 0.3 }], ['swift', 'Calm Leaf', '+12% move speed for this run', 70, { spd: 0.12 }]] },
  npc_tb: { q: null, items: [['stim', "TB's Silly Pill", 'Half the time a powerup. Half the time... a pill.', 40, { gamble: 1 }], ['gtonic', 'Sit a While', 'Heal to full. Mind the stains.', 60, { heal: 1 }], ['tonic', 'Stain Remover', "Gets rid of a Silly Pill you are on", 80, { cure: 1 }]] },
  npc_pulsar: { q: '"Just vibes, friend. Free of charge."', items: [['sage', 'Good Vibes', 'Heal 20% and refill your mana', 0, { heal: 0.2, full: 1 }], ['deck', 'Bass Drop', '+10% damage for this run', 60, { dmgP: 0.1 }]] },
  npc_bonjo: { q: '"Welcome, welcome. Let me get the door."', items: [['briefs', 'Fancy Briefs', '+6% damage blocked this run', 80, { arm: 0.06 }], ['panties', 'Silk Panties', '+10% move speed this run', 70, { spd: 0.1 }], ['lgloves', 'Leather Gloves', '+10% attack speed this run', 80, { atk: 0.1 }]] },
  npc_harold: { q: '"Potions? Tea? Same thing, really. Sit, sit!"', items: [['tonic', 'Cup of Tea', 'Heal 35% of your HP', 30, { heal: 0.35 }], ['elixir', 'Mad Potion', 'Something good happens. Probably.', 60, { mad: 1 }], ['gtonic', 'Teacup of Fury', '+15% damage for this run', 90, { dmgP: 0.15 }]] },
  npc_ali: { q: '"Nuggets? Garlic bread? Everything is better with garlic."', items: [['garlicbread', 'Garlic Bread', 'Heal 40% of your HP', 30, { heal: 0.4 }], ['stew', 'Nuggets', '+15 max HP for this run', 60, { mhp: 15 }], ['garlicbread', 'Garlic Breath', 'Foes that bump into you get hurt this run', 90, { thorns: 1 }]] },
  npc_judgement: { q: '"Light or shadow. Both have a price."', items: [['holy', 'Light', 'Heal to full, but -10% damage this run', 50, { heal: 1, dmgP: -0.1 }], ['curse', 'Shadow', '+25% damage, but -15% max HP this run', 90, { dmgP: 0.25, mhpP: -0.15 }]] },
  npc_nattyboro: { q: '"A blade without a bite is merely a stick."', items: [['cleaver', 'Sharpen', '+3 damage for this run', 90, { dmg: 3 }], ['wchili', 'Fire Enchant', 'Your hits set foes on fire this run', 100, { burn: 1 }], ['katana', 'Keen Edge', '+10% critical hits for this run', 100, { crit: 0.1 }]] },
  npc_jessiah: { q: '"An empty stomach makes a hollow man. Eat."', items: [['stew', 'Hearty Meal', 'Heal 60% of your HP', 45, { heal: 0.6 }], ['garlicbread', 'Bread', 'Heal 25% of your HP', 15, { heal: 0.25 }], ['hpz', 'A Proper Feast', '+25 max HP for this run', 90, { mhp: 25 }]] },
  npc_spermaid: { q: '"Sweetie! Even down here I keep a little stall."', items: [['sage', 'Siren Tea', 'Refill your mana', 25, { full: 1 }], ['regen', 'Sea Salt', 'Heal 1 HP every 2 seconds this run', 90, { regen: 0.5 }], ['holy', 'Pearl', '+20 max mana for this run', 50, { mana: 20 }]] }
};
function bonusStats(s) { // run bonuses bought from merchants
  var b = RUN && RUN.bonus; if (!b) return;
  s.mhp = Math.round((s.mhp + (b.mhp || 0)) * (1 + (b.mhpP || 0))); s.dmg = (s.dmg + (b.dmg || 0)) * (1 + (b.dmgP || 0)); s.mmana += b.mana || 0;
  s.manaRegen *= 1 + (b.manaRegen || 0); s.atkMul /= 1 + (b.atk || 0); s.crit += b.crit || 0; s.spd *= 1 + (b.spd || 0); s.arm = Math.min(0.75, s.arm + (b.arm || 0));
  s.leech += b.leech || 0; s.regen = (s.regen || 0) + (b.regen || 0); s.iframes += b.iframes || 0; if (b.burn) s.burn = true; if (b.boom) s.boom = true; if (b.ward) s.ward = true; s.thorns = (s.thorns || 0) + (b.thorns || 0);
}
function merchBuy(eff) {
  var b = RUN.bonus || (RUN.bonus = {}), oldM = ST.mhp;
  if (eff.gamble) { if (Math.random() < 0.5) { grantPower(shuffle(POWERS.slice())[0].id); return; } RUN.pill = PILLORDER[Math.floor(Math.random() * PILLORDER.length)]; ST = calcStats(); P.hp = Math.min(P.hp, ST.mhp); G.banner = 2.4; G.bannerTxt = "TB'S SILLY PILL"; G.bannerSub = PILLS[RUN.pill].name.toUpperCase(); sfx.hurt(); return; }
  if (eff.cure) { if (RUN.pill) { pop(P.x, P.y - P.h - 6, 'CURED', '#7dff9a'); RUN.pill = null; ST = calcStats(); } else pop(P.x, P.y - P.h - 6, 'NOTHING TO CURE', '#a6968f'); return; }
  if (eff.mad) { var r = Math.random(); if (r < 0.4) { var k = ST.noHeal; ST.noHeal = false; healP(ST.mhp); ST.noHeal = k; } else if (r < 0.7) { b.dmgP = (b.dmgP || 0) + 0.1; pop(P.x, P.y - P.h - 6, '+10% DAMAGE', '#ffe36a'); } else grantPower(shuffle(POWERS.slice())[0].id); ST = calcStats(); return; }
  if (eff.revive) RUN.revive = (RUN.revive || 0) + 1;
  ['mhp', 'mhpP', 'dmg', 'dmgP', 'mana', 'manaRegen', 'atk', 'crit', 'spd', 'arm', 'leech', 'regen', 'iframes', 'thorns'].forEach(function (k) { if (eff[k]) b[k] = (b[k] || 0) + eff[k]; });
  ['burn', 'boom', 'ward'].forEach(function (k) { if (eff[k]) b[k] = 1; });
  ST = calcStats(); if (ST.mhp > oldM) P.hp += ST.mhp - oldM; P.hp = Math.min(P.hp, ST.mhp);
  if (eff.heal) { var keep = ST.noHeal; ST.noHeal = false; healP(Math.round(ST.mhp * eff.heal)); ST.noHeal = keep; }
  if (eff.full) P.mana = ST.mmana;
}
function openStall(e) {
  var rs = rsOf(G.roomKey), t = tierOf(), m = 1 + 0.5 * META.ng, who = MERCHNAME[e.who] || 'A stranger', st = STALLS[e.who] || STALLS.npc_jessiah;
  if (!rs.sold) rs.sold = {};
  var note = e.who === 'npc_tb' ? tbQuote() : st.q;
  openMenu({ title: who + "'s Stall", note: note, pic: e.who, bank: 'run', rebuild: function () {
    var rows = st.items.map(function (it, i) {
      var price = Math.round(it[3] * (0.6 + 0.4 * t) * m), sold = rs.sold[e.who + i];
      return { icon: it[0], name: sold ? 'SOLD OUT' : it[1].toUpperCase(), sub: sold ? '' : it[2], price: sold ? '' : (price ? fmtN(price) : 'FREE'), cls: sold ? 'off' : (RUN.drops < price ? 'off' : ''), fn: sold ? null : function () { if (price && !spend(price, true)) return; if (!price) sfx.buy(); rs.sold[e.who + i] = 1; merchBuy(it[4]); saveRun(); renderMenu(true); } };
    });
    if (e.who === 'npc_pulsar') rows.unshift({ icon: 'npc_pulsar', name: 'CHANGE UP THE TUNES', sub: 'Pulsar spins a new track for the rest of this area', price: 'FREE', cls: 'sec', fn: function () {
      var all = ['pulsar1', 'pulsar2', 'pulsar3'].filter(function (q) { return !RUN.tune || q !== RUN.tune.id; }); RUN.tune = { id: all[Math.floor(Math.random() * all.length)], area: G.rm.area };
      music.play(RUN.tune.id); sfx.magic(); toastMenu('"Just vibes, friend. Free of charge."'); } });
    return rows;
  } });
}
