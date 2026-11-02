/* ---------- icons for the HTML menus: cut from the sheet, scaled up crisp ---------- */
var ICONS = {};
function iconURL(n, sc) {
  sc = sc || 2; var key = n + '@' + sc; if (ICONS[key]) return ICONS[key];
  var f = KIT.SPR[n]; if (!f || !KIT.sheetReady) return '';
  var c = document.createElement('canvas'); c.width = f[2] * sc; c.height = f[3] * sc; var g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(KIT.sheet, f[0], f[1], f[2], f[3], 0, 0, f[2] * sc, f[3] * sc);
  return (ICONS[key] = c.toDataURL());
}
function ic(n, px, sc) { var u = iconURL(n, sc); return u ? '<img src="' + u + '" alt="" style="height:' + (px || 32) + 'px;width:auto;image-rendering:pixelated;vertical-align:middle;margin-right:8px">' : ''; }
function nameOf(c) { return c.t === 'w' ? WEAPONS[c.id].n : c.t === 'c' ? CHARMS[c.id].n : c.t === 'gold' ? 'Bag of Drops' : 'Cum Cracker'; }

/* ---------- levelling up ---------- */
function choices(n) {
  var pool = [];
  run.weapons.forEach(function (w) { if (!w.evo && w.lv < MAXLV) pool.push({ t: 'w', id: w.id, wt: 3 }); });
  run.charms.forEach(function (c) { if (c.lv < charmMax(c.id)) pool.push({ t: 'c', id: c.id, wt: 2.5 }); });
  if (run.weapons.length < 6) WID.forEach(function (id) { if (weapOpen(id) && !wOf(id) && !run.banished[id]) pool.push({ t: 'w', id: id, nw: 1, wt: 2 }); });
  if (run.charms.length < 6) CID.forEach(function (id) { if (!cOf(id) && !run.banished[id]) pool.push({ t: 'c', id: id, nw: 1, wt: 1.6 }); });
  var out = [];
  while (out.length < n && pool.length) { var tot = 0; pool.forEach(function (p) { tot += p.wt; }); var r = Math.random() * tot, i = 0; for (; i < pool.length - 1; i++) { r -= pool[i].wt; if (r <= 0) break; } out.push(pool.splice(i, 1)[0]); }
  if (!out.length) out = [{ t: 'gold' }, { t: 'heal' }];
  return out;
}
function choiceSub(c) {
  if (c.t === 'gold') return '+25 drops'; if (c.t === 'heal') return 'Heals 30';
  if (c.t === 'w') { var w = wOf(c.id), D = WEAPONS[c.id]; if (!w) return 'NEW · ' + D.d; var s = 'LV ' + (w.lv + 1) + ' · ' + D.lv[w.lv - 1]; if (w.lv + 1 === MAXLV && cOf(D.evo)) s += ' · ready to evolve'; return s; }
  var cc = cOf(c.id); return (cc ? 'LV ' + (cc.lv + 1) : 'NEW') + ' · ' + CHARMS[c.id].d;
}
function applyChoice(c) {
  if (c.t === 'gold') run.gold += 25; else if (c.t === 'heal') heal(30);
  else if (c.t === 'w') { var w = wOf(c.id); if (w) w.lv++; else addWeapon(c.id); }
  else { var cc = cOf(c.id); if (cc) { cc.lv++; calc(); } else addCharm(c.id); }
}
function levelUpMenu(keep) {
  var opts = keep || choices(3 + (Math.random() < (S.luck - 1) * 0.5 + 0.1 ? 1 : 0));
  if (G.bot) { var sc = function (c) { return c.t === 'w' && !c.nw ? 0 : c.t === 'w' && run.weapons.length < 3 ? 1 : c.t === 'c' && !c.nw ? 2 : c.t === 'c' ? 3 : 4; }; opts.sort(function (a, b) { return sc(a) - sc(b); }); applyChoice(opts[0]); run.pending--; return; }
  sfx.play('power');
  var items = opts.map(function (c, i) { return { label: ic(c.t === 'w' || c.t === 'c' ? 'ic_' + c.id : c.t === 'gold' ? 'pk_gold2' : 'pk_cracker') + nameOf(c), sub: choiceSub(c), def: i === 0, fn: function () { applyChoice(c); run.pending--; KIT.closeMenu(); } }; });
  var row = [];
  if (run.rerolls > 0) row.push({ label: 'REROLL ' + run.rerolls, fn: function () { run.rerolls--; levelUpMenu(); } });
  if (run.skips > 0) row.push({ label: 'SKIP ' + run.skips, fn: function () { run.skips--; run.pending--; gainXP(0); KIT.closeMenu(); } });
  if (run.banish > 0 && opts[0].id) row.push({ label: 'BANISH ' + run.banish, fn: function () { banishMenu(opts); } });
  KIT.menu({ cls: 'clear', title: 'Level ' + run.lvl, items: items.concat(row) });
}
function banishMenu(opts) {
  KIT.menu({ cls: 'clear', title: 'Banish', sub: 'It will not be offered again this run', items: opts.filter(function (c) { return c.id; }).map(function (c) { return { label: ic('ic_' + c.id) + nameOf(c), fn: function () { run.banished[c.id] = 1; run.banish--; levelUpMenu(); } }; }).concat([{ label: 'BACK', back: true, fn: function () { levelUpMenu(opts); } }]) });
}
/* ---------- chests: evolutions first, then upgrades to what she has ---------- */
function openChest(big) {
  var n = big ? (Math.random() < 0.3 * S.luck ? 5 : 3) : (Math.random() < 0.06 * S.luck ? 5 : Math.random() < 0.22 * S.luck ? 3 : 1), got = [];
  for (var i = 0; i < n; i++) {
    var ev = run.weapons.filter(function (w) { return !w.evo && w.lv >= MAXLV && cOf(WEAPONS[w.id].evo); })[0];
    if (ev) { ev.evo = true; SV.seen['evo_' + ev.id] = 1; got.push({ evo: ev.id }); continue; }
    var up = [];
    run.weapons.forEach(function (w) { if (!w.evo && w.lv < MAXLV) up.push({ t: 'w', id: w.id }); });
    run.charms.forEach(function (c) { if (c.lv < charmMax(c.id)) up.push({ t: 'c', id: c.id }); });
    if (!up.length) { run.gold += 30; got.push({ gold: 30 }); continue; }
    var c = pick(up); applyChoice(c); got.push(c);
  }
  persist();
  if (G.bot) return;
  sfx.play('win');
  var html = '<div style="display:flex;flex-direction:column;gap:6px">' + got.map(function (g) {
    if (g.evo) { var D = WEAPONS[g.evo]; return '<div style="padding:8px 10px;background:#1a0e04;box-shadow:inset 0 0 0 2px #ffe36a;font-size:16px">' + ic('ic_' + g.evo, 32) + '<b style="color:#ffe36a">' + D.en.toUpperCase() + '</b><br><span style="color:#a6968f">' + D.n + ' evolved. ' + D.ed + '.</span></div>'; }
    if (g.gold) return '<div style="padding:6px 10px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c">' + ic('pk_gold2', 24) + '+' + g.gold + ' drops</div>';
    var lv = g.t === 'w' ? wOf(g.id).lv : cOf(g.id).lv;
    return '<div style="padding:6px 10px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c">' + ic('ic_' + g.id, 24) + nameOf(g) + ' <span style="color:#a6968f">LV ' + lv + '</span></div>';
  }).join('') + '</div>';
  KIT.menu({ cls: 'clear', title: 'Treasure', html: html, items: [{ label: 'TAKE IT', def: true, fn: KIT.closeMenu }] });
}
/* ---------- the end of the night ---------- */
function dawnMenu() {
  bank(); var st = run.st, nx = STAGES[st.i + 1], lines = [];
  if (nx) lines.push('New place: ' + nx.n); if (st.unlock) lines.push('New weapon: ' + WEAPONS[st.unlock].n);
  music.play('ssdawn');
  if (G.bot) { resultsMenu(true); return; }
  KIT.menu({ title: 'Dawn Breaks', sub: st.n + ' survived.', html: lines.length ? '<p style="text-align:center;margin:0;color:#ffe36a">' + lines.join('<br>') + '</p>' : '',
    items: [{ label: 'KEEP SWIMMING', sub: 'Endless night, it only gets worse', def: true, fn: function () { KIT.closeMenu(); run.endless = true; run.banked = 0; run.nextBoss = run.t + 90; banner = { a: 'ENDLESS NIGHT', b: 'HOW LONG CAN SHE LAST', t: 3 }; music.play('ssnight'); } },
      { label: 'LEAVE', fn: function () { resultsMenu(true); } }] });
}
function resultsMenu(win) {
  G.mode = 'over'; bank(); if (!win) music.stop(1);
  var st = run.st, dm = Object.keys(run.dmg).filter(function (k) { return WEAPONS[k] && run.dmg[k] > 0; }).sort(function (a, b) { return run.dmg[b] - run.dmg[a]; });
  var html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;margin-bottom:8px">' + [['TIME', fmt(run.t)], ['KILLS', run.kills], ['LEVEL', run.lvl], ['DROPS', '+' + Math.round(run.gold)]].map(function (s) { return '<div style="padding:6px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c"><div style="font-size:11px;color:#a6968f;letter-spacing:.12em">' + s[0] + '</div><div style="font-size:20px">' + s[1] + '</div></div>'; }).join('') + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:3px">' + dm.map(function (k) { var w = wOf(k); return '<div style="display:flex;align-items:center;gap:6px;font-size:14px">' + ic('ic_' + k, 22, 2) + '<span style="flex:1">' + (w && w.evo ? WEAPONS[k].en : WEAPONS[k].n) + (w ? ' <span style="color:#a6968f">LV ' + w.lv + '</span>' : '') + '</span><span style="color:#ffe36a">' + Math.round(run.dmg[k]).toLocaleString() + '</span></div>'; }).join('') + '</div>';
  if (G.bot) { G.result = { win: win, t: run.t, kills: run.kills, lvl: run.lvl }; return; }
  KIT.menu({ wide: true, title: win ? 'Dawn Breaks' : 'Swallowed by the Dark', sub: win ? st.n + ' survived.' : 'Taken by ' + (run.by || 'the dark') + ' in ' + st.n + '.', html: html,
    items: [{ label: 'AGAIN', def: true, fn: function () { KIT.closeMenu(); newRun(st.id, run.weapons[0].id); } }, { label: 'PLACES', fn: stageMenu }, { label: 'TITLE', back: true, fn: titleMenu }],
    note: 'Drops banked: ' + Math.floor(SV.gold) });
}
/* ---------- title and the menus around it ---------- */
function titleMenu() {
  G.mode = 'title'; run = null; music.play('sstitle');
  KIT.menu({ logo: '../assets/surv-logo.webp', title: 'Spermaid Survivors',
    items: [{ label: 'PLAY', cls: 'hot', def: true, fn: stageMenu }, { label: 'SANCTUM', fn: sanctumMenu }, { label: 'COLLECTION', fn: collectionMenu }, { label: 'OPTIONS', fn: optionsMenu }, { label: 'HOW TO PLAY', fn: helpMenu }],
    note: Math.floor(SV.gold) + ' drops' });
}
function stageMenu() {
  KIT.menu({ title: 'Choose a Place', wide: true, grid: true, items: STAGES.map(function (st, i) { var open = stageOpen(i), b = SV.best[st.id];
    return { label: open ? st.n : '???', sub: !open ? 'Survive ' + STAGES[i - 1].n + ' first' : SV.cleared[st.id] ? 'Cleared · best ' + fmt(b || 0) : b ? 'Best ' + fmt(b) : 'Not tried yet', dis: !open, def: open && !SV.cleared[st.id] && (i === 0 || SV.cleared[STAGES[i - 1].id]), fn: function () { weaponMenu(st.id); } }; })
    .concat([{ label: 'BACK', back: true, fn: titleMenu }]) });
}
function weaponMenu(sid) {
  KIT.menu({ title: 'Her First Weapon', sub: STAGE[sid].n, wide: true, grid: true, items: WID.map(function (id, i) { var open = weapOpen(id), un = null; STAGES.forEach(function (s) { if (s.unlock === id) un = s; });
    return { label: open ? ic('ic_' + id, 28) + WEAPONS[id].n : '???', sub: open ? WEAPONS[id].d : 'Survive ' + (un ? un.n : '?'), dis: !open, def: i === 0, fn: function () { KIT.closeMenu(); newRun(sid, id); } }; })
    .concat([{ label: 'BACK', back: true, fn: stageMenu }]) });
}
function sanctumMenu(focus) {
  KIT.menu({ title: "Spermaid's Sanctum", sub: '"Sweetie! Even down here I keep a little stall."', wide: true, grid: true,
    items: POWERS.map(function (p) { var l = SV.ups[p.id] || 0, max = l >= p.max, cost = powerCost(p);
      return { label: p.n + ' ' + l + '/' + p.max, sub: max ? 'MAX · ' + p.d : cost + ' drops · ' + p.d, dis: max || cost > SV.gold, def: p.id === focus, fn: function () { if (SV.gold < cost || max) return; SV.gold -= cost; SV.spent = (SV.spent || 0) + cost; SV.ups[p.id] = l + 1; persist(); sfx.play('coin'); sanctumMenu(p.id); } }; })
    .concat([{ label: 'REFUND ALL', sub: 'Get every drop back', dis: !SV.spent, fn: function () { SV.gold += SV.spent || 0; SV.spent = 0; SV.ups = {}; persist(); sanctumMenu(); } }, { label: 'BACK', back: true, fn: titleMenu }]),
    note: Math.floor(SV.gold) + ' drops' });
}
function gridHTML(cells) { return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">' + cells.join('') + '</div>'; }
function cellHTML(on, icon, name, sub) { return '<div style="padding:6px 8px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c;font-size:13px;display:flex;align-items:center;gap:4px;min-height:44px">' + (on ? ic(icon, 28) + '<div><b>' + name + '</b>' + (sub ? '<br><span style="color:#a6968f">' + sub + '</span>' : '') + '</div>' : '<span style="color:#4a1a1c">???</span>') + '</div>'; }
function collectionMenu() {
  var back = [{ label: 'BACK', back: true, fn: titleMenu }];
  KIT.menu({ title: 'Collection', items: [{ label: 'WEAPONS', fn: function () { colShow('Weapons', WID.map(function (id) { var D = WEAPONS[id], e = SV.seen['evo_' + id]; return cellHTML(SV.seen[id], 'ic_' + id, D.n, e ? 'Evolved: ' + D.en : D.d) + cellHTML(e, 'ic_' + id, D.en, D.n + ' at LV 8 + ' + CHARMS[D.evo].n); })); } },
    { label: 'CHARMS', fn: function () { colShow('Charms', CID.map(function (id) { return cellHTML(SV.seen[id], 'ic_' + id, CHARMS[id].n, CHARMS[id].d); })); } },
    { label: 'FOES', fn: function () { colShow('Foes', Object.keys(FOES).map(function (k) { return cellHTML(SV.kills[k], 'f_' + k + '_0', FOES[k].n, (SV.kills[k] || 0).toLocaleString() + ' killed'); }).concat(Object.keys(BOSSES).map(function (k) { return cellHTML(SV.kills[k], 'f_' + k + '_0', BOSSES[k].n, (SV.kills[k] || 0) + ' beaten'); }))); } },
    { label: 'FRIENDS', fn: function () { colShow('Friends Freed', Object.keys(FRIENDS).map(function (k) { var st = STAGES.filter(function (s) { return s.friend === k; })[0]; return cellHTML(SV.friends[k], FRIENDS[k].spr, FRIENDS[k].n, SV.friends[k] ? FRIENDS[k].gift : 'Locked up in ' + st.n); })); } },
    { label: 'PICKUPS', fn: function () { colShow('Pickups', Object.keys(PICKS).map(function (k) { return cellHTML(SV.seen['pk_' + k], PICKS[k].spr, PICKS[k].n, PICKS[k].d); })); } }].concat(back) });
}
function colShow(t, cells) { KIT.menu({ title: t, wide: true, html: gridHTML(cells), items: [{ label: 'BACK', back: true, fn: collectionMenu }] }); }
function optionsMenu(from) {
  var back = from === 'pause' ? pauseMenu : titleMenu;
  KIT.menu({ title: 'Options', items: [
    { label: 'DAMAGE NUMBERS: ' + (SV.opt.nums ? 'ON' : 'OFF'), fn: function () { SV.opt.nums = SV.opt.nums ? 0 : 1; persist(); optionsMenu(from); } },
    { label: 'SCREEN SHAKE: ' + (SV.opt.shake ? 'ON' : 'OFF'), fn: function () { SV.opt.shake = SV.opt.shake ? 0 : 1; persist(); optionsMenu(from); } },
    { label: 'MUSIC: ' + Math.round(OPT.mus * 100) + '%', fn: function () { OPT.mus = OPT.mus >= 1 ? 0 : Math.round((OPT.mus + 0.25) * 100) / 100; SV.opt.mus = OPT.mus; persist(); music.setVol(); optionsMenu(from); } },
    KIT.resItem(function () { optionsMenu(from); }),
    { label: 'BACK', back: true, fn: back }] });
}
function helpMenu(from) {
  KIT.menu({ title: 'How to Play', html: '<p><b>Swim</b>: left stick, d-pad or WASD. Her weapons fire by themselves. <b>Aim</b> (optional): right stick. On a phone: the d-pad on the left, A and B on the right. <b>A</b> (Z / Space): Tidal Wave when the bar is full, it fills with kills. <b>B</b> (X): a quick dash you cannot be hit in.</p>' +
    '<p>Pick up pearls to level up and choose upgrades. Up to six weapons and six charms. A weapon at level 8 evolves in a chest if you hold its charm. Nasty ones carry chests, and every big foe does.</p>' +
    '<p>Hold out until dawn: two big foes come at 3:30 and 7:00, the place\'s own boss at 10:00. Smash the things on the floor for crackers and drops. Somewhere out there a friend is locked in a cell: stand by it to set them free.</p><p>Drops are kept. Spend them at Spermaid\'s Sanctum.</p>',
    items: [{ label: 'BACK', back: true, fn: from === 'pause' ? pauseMenu : titleMenu }] });
}
function pauseMenu() {
  if (G.mode !== 'play') return;
  var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">' + run.weapons.map(function (w) { return '<span style="font-size:13px;padding:4px 6px;background:#140809;box-shadow:inset 0 0 0 1px ' + (w.evo ? '#ffe36a' : '#4a1a1c') + '">' + ic('ic_' + w.id, 20) + (w.evo ? WEAPONS[w.id].en : WEAPONS[w.id].n + ' ' + w.lv) + '</span>'; }).join('') + run.charms.map(function (c) { return '<span style="font-size:13px;padding:4px 6px;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c">' + ic('ic_' + c.id, 20) + CHARMS[c.id].n + ' ' + c.lv + '</span>'; }).join('') + '</div>';
  KIT.menu({ cls: 'clear', title: 'Paused', sub: run.st.n + ' · ' + fmt(run.t), html: html, items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: function () { helpMenu('pause'); } }, { label: 'OPTIONS', fn: function () { optionsMenu('pause'); } }, { label: 'GIVE UP', fn: function () { run.by = 'giving up'; KIT.closeMenu(); G.mode = 'dead'; resultsMenu(false); } }] });
}

/* ---------- music: her own, plus the places' songs from Load Legacy ---------- */
music.songs.sstitle = { bpm: 96, beats: 3, vol: 0.9, wet: 0.6, lead: 'organlead', bass: 'waltz', acc: 'organ', drums: 'waltz', chords: 'Dm Dm Bb C Dm Gm A A F C Dm Bb Gm A Dm Dm',
  mel: 'a4 - d5 - f5 - | e5 - d5 - a4 - | bb4 - d5 - f5 - | g5 - - e5 - c5 | a5 - - f5 - d5 | g5 - bb5 - g5 - | e5 - c#5 - a4 - | a4 - - - . . | c5 - f5 - a5 - | g5 - e5 - c5 - | d5 - f5 - a5 - | bb5 - a5 - f5 - | g5 - bb5 - d6 - | c#6 - - a5 - e5 | f5 - e5 - d5 - | d5 - - - . .' };
music.songs.sspicnic = { bpm: 132, beats: 4, vol: 0.85, wet: 0.35, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C Am F G C Am Dm G',
  mel: 'e5 - g5 - c6 - g5 e5 | a5 - - - e5 - c5 - | f5 - a5 - c6 - a5 f5 | g5 - - - d5 - b4 - | c5 e5 g5 c6 b5 - g5 - | a5 - c6 - e6 - c6 a5 | f5 - a5 - d6 - c6 a5 | b5 - - - g5 - - -' };
music.songs.ssnight = { bpm: 170, beats: 4, vol: 0.9, wet: 0.22, lead: 'fm', harm: 1, fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'boss', chords: 'Cm Cm Ab Bb Cm Cm Fm G',
  mel: 'c5 . c5 eb5 g5 . f5 eb5 | d5 eb5 c5 - g4 - - - | ab4 - c5 - eb5 - ab5 - | bb5 - g5 - d5 - bb4 - | c6 . c6 . bb5 . g5 eb5 | f5 g5 eb5 f5 c5 - - - | f5 - ab5 - c6 - f6 - | d6 - b5 - g5 - - -' };
music.songs.ssdawn = { bpm: 100, beats: 4, vol: 0.9, wet: 0.5, lead: 'organlead', bass: 'drone', acc: 'organ', drums: null, chords: 'F C Dm Bb F C Bb C',
  mel: 'c5 - f5 - a5 - c6 - | g5 - - - e5 - - - | f5 - a5 - d6 - - - | bb5 - a5 - g5 - f5 - | a5 - c6 - f6 - - - | e6 - - - c6 - - - | d6 - c6 - bb5 - a5 - | g5 - - - - - - -' };
if (SV.opt.mus !== undefined) OPT.mus = SV.opt.mus;

/* ---------- a simple autopilot (tests only): keeps away from foes, goes for pearls and chests ---------- */
function botMove() {
  var vx = 0, vy = 0;
  foes.forEach(function (e) { if (e.dead || e.under) return; var dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, r = e.boss ? 180 : 110; if (d < r) { var k = (r - d) / r * (e.boss ? 3 : 1); vx += dx / d * k; vy += dy / d * k; } });
  eshots.forEach(function (s) { var dx = P.x - s.x, dy = P.y - 16 - s.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(s.vx, s.vy) || 1, toward = (dx * s.vx + dy * s.vy) / (d * sp); if (d < 110 && toward > 0.6) { var px = -s.vy / sp, py = s.vx / sp, side = px * dx + py * dy > 0 ? 1 : -1; vx += px * side * 2.5; vy += py * side * 2.5; } });
  marks2.concat(hazards.filter(function (z) { return z.r; })).forEach(function (m) { var dx = P.x - m.x, dy = P.y - m.y, d = Math.hypot(dx, dy) || 1; if (d < (m.r || 30) + 30) { vx += dx / d * 3; vy += dy / d * 3; } });
  var best = null, bd = 1e9; loot.forEach(function (o) { var d = Math.hypot(o.x - P.x, o.y - P.y); if (d < bd && d < 260) { bd = d; best = o; } });
  if (run.cell && !run.cell.freed && Math.hypot(run.cell.x - P.x, run.cell.y - P.y) < 400) best = run.cell;
  if (best) { var d2 = Math.hypot(best.x - P.x, best.y - P.y) || 1; vx += (best.x - P.x) / d2 * 0.8; vy += (best.y - P.y) / d2 * 0.8; }
  else { vx += Math.cos(run.t * 0.2) * 0.4; vy += Math.sin(run.t * 0.27) * 0.4; }
  var b = run.st.band; if (b && b.y) vy -= P.y / b.y * 0.8; if (b && b.x) vx -= P.x / b.x * 0.8;
  var n = 0; foes.forEach(function (e) { if (!e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 40) n++; }); if (n > 3) G.botDash = 1; if (onScreenFoes().length > 40 || foes.some(function (e) { return e.boss && !e.dead; })) G.botWave = 1;
  var l = Math.hypot(vx, vy); if (l < 0.05) return { x: 0, y: 0, on: false }; return { x: vx / l, y: vy / l, on: true };
}

KIT.start({ w: W, h: H, flex: 800, autoS: 2, update: update, draw: draw, onPause: pauseMenu, idleUpdate: function (dt) { if (G.mode === 'title') titleStep(dt); },
  pad: { btns: [{ k: 'b', label: 'B', sub: 'DASH' }, { k: 'a', label: 'A', sub: 'WAVE', cls: 'gold' }] } }); // a fixed d-pad on the left (he asked: not a stick that appears wherever you touch)
titleMenu();
window.__ss = { G: G, get P() { return P; }, get S() { return S; }, get run() { return run; }, get foes() { return foes; }, get loot() { return loot; }, SV: SV, STAGES: STAGES, WEAPONS: WEAPONS,
  start: function (sid, w) { KIT.closeMenu(); newRun(sid || 'sewers', w); }, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } },
  give: function (id, lv) { var w = WEAPONS[id] ? (wOf(id) || addWeapon(id)) : null; if (w) w.lv = lv || w.lv; else { var c = cOf(id) || addCharm(id); c.lv = lv || c.lv; calc(); } },
  evolve: function (id) { var w = wOf(id) || addWeapon(id); w.lv = 8; w.evo = true; }, killAll: function () { foes.forEach(function (e) { if (!e.dead) killFoe(e); }); },
  boss: function (id, fin) { return spawnBoss(id, fin); }, openChest: openChest, levelUpMenu: levelUpMenu, dawnMenu: dawnMenu, resultsMenu: resultsMenu };
