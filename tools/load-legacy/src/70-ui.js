/* =====================================================================================================
   MENUS: one shared panel for every shop, the heir choice, merchants, altars and pause
   ===================================================================================================== */
var MENU = null, menuIdx = 0;
function menuOpen() { return !el('menu').hidden; }
function setMenuMode(on) { el('app').classList.toggle('menu', !!on); G.paused = !!on; for (var k in pad) pad[k] = false; }
function iconURL(id) { if (ICONS[id]) return ICONS[id]; var c = SPR[id] ? sprCanvas(id, 1) : null; return c ? c.toDataURL() : ''; }
function openMenu(o) {
  MENU = o; el('menu').hidden = false; setMenuMode(true); renderMenu(); sfx.click();
}
function closeMenu() { el('menu').hidden = true; MENU = null; if (G.mode === 'play' || G.mode === 'town') setMenuMode(false); }
function renderMenu(keepIdx) {
  var o = MENU; if (!o) return;
  el('menuTitle').textContent = o.title; el('menuNote').textContent = o.note || '';
  el('menuBank').textContent = o.bank === 'run' ? 'CARRYING ' + fmtN(RUN ? RUN.drops : 0) : (o.bank === 'none' ? '' : 'BANK ' + fmtN(META.bank));
  var pc = el('menuPic'), src = o.pic ? (typeof o.pic === 'string' ? (o.pic === 'cumhead' ? cumCanvas('idle0') : sprCanvas(o.pic, 1)) : o.pic) : null;
  pc.hidden = !src; if (src) { pc.width = src.width; pc.height = src.height; pc.getContext('2d').drawImage(src, 0, 0); }
  var list = el('menuList'); list.innerHTML = '';
  if (o.custom) o.custom(list);
  (o.rows || []).forEach(function (r, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'row' + (r.cls ? ' ' + r.cls : '');
    if (r.icon) { var im = document.createElement('img'); im.alt = ''; im.src = iconURL(r.icon); b.appendChild(im); }
    var t = document.createElement('span'); t.className = 't'; var bb = document.createElement('b'); bb.textContent = r.name; t.appendChild(bb);
    if (r.sub) { var ii = document.createElement('i'); ii.textContent = r.sub; t.appendChild(ii); } b.appendChild(t);
    if (r.price !== undefined) { var p = document.createElement('span'); p.className = 'p'; p.textContent = r.price; b.appendChild(p); }
    b.addEventListener('click', function () { if (r.fn) r.fn(); else sfx.no(); });
    list.appendChild(b);
  });
  el('menuBack').textContent = o.backTxt || 'BACK'; el('menuBack').hidden = o.noBack;
  if (!keepIdx) menuIdx = 0; paintKb();
}
function menuButtons() { return [].slice.call(el('menu').querySelectorAll('#menuList button, #menuBack')).filter(function (b) { return !b.hidden && b.offsetParent !== null; }); }
function paintKb() { var bs = menuButtons(); bs.forEach(function (b, i) { b.classList.toggle('kb', i === menuIdx); }); if (bs[menuIdx]) bs[menuIdx].scrollIntoView({ block: 'nearest' }); }
function menuMove(d) { var n = menuButtons().length; if (!n) return; menuIdx = (menuIdx + d + n) % n; paintKb(); sfx.click(); }
function menuPress() { var b = menuButtons()[menuIdx]; if (b) b.click(); }
function menuBackPress() { el('menuBack').click(); }
function menuKey(e) {
  if (!menuOpen()) {
    if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && (G.mode === 'play' || G.mode === 'town') && !G.paused) { openPause(); e.preventDefault(); return true; }
    if (e.key === 'Enter' && !el('over').hidden) { el('overBtn').click(); e.preventDefault(); return true; }
    if (e.key === 'Enter' && !el('title').hidden) { (el('contBtn').disabled ? el('newBtn') : el('contBtn')).click(); e.preventDefault(); return true; }
    return false;
  }
  var k = e.key;
  if (k === 'ArrowDown' || k === 's' || k === 'S') menuMove(1);
  else if (k === 'ArrowUp' || k === 'w' || k === 'W') menuMove(-1);
  else if (k === 'Enter' || k === ' ' || k === 'x' || k === 'X') menuPress();
  else if (k === 'Escape' || k === 'Backspace') menuBackPress();
  else return false;
  e.preventDefault(); return true;
}
el('menuBack').addEventListener('click', function () { sfx.click(); if (MENU && MENU.back) MENU.back(); else closeMenu(); });
function spend(n, fromRun) { if (fromRun) { if (RUN.drops < n) { sfx.no(); return false; } RUN.drops -= n; } else { if (META.bank < n) { sfx.no(); return false; } META.bank -= n; saveMeta(); } sfx.buy(); return true; }

/* ---------- town buildings ---------- */
function openBuilding(e) {
  if (e.k === 'gate') { openHeirs(); return; }
  var b = e.b;
  if (!META.built[b.id]) {
    openMenu({ title: 'Empty Lot', note: 'Build ' + b.name + ' here and the town grows.', pic: b.npc, rows: [
      { name: 'BUILD ' + b.name.toUpperCase(), sub: b.kind === 'prov' ? 'Sells provisions that power up your next heir' : b.kind === 'runes' ? 'Runes you keep and equip, three at a time' : '', price: fmtN(b.cost) + ' drops', icon: 'coin', fn: function () { if (spend(b.cost)) { META.built[b.id] = 1; saveMeta(); G.layer = null; closeMenu(); G.banner = 2; G.bannerTxt = 'BUILT'; G.bannerSub = b.name.toUpperCase(); } } }] });
    return;
  }
  if (b.kind === 'club') openClub(); else if (b.kind === 'gear') openGear(); else if (b.kind === 'fate') openFate(); else if (b.kind === 'runes') openRunes(); else if (b.kind === 'prov') openProv(b); else if (b.kind === 'arcade') openArcadeMenu();
}
function openClub() {
  var rows = UPGRADES.map(function (u) {
    var lv = META.up[u.id] || 0, max = lv >= u.max, c = upCost(u, lv);
    return { icon: u.icon, name: u.name.toUpperCase() + '  ·  ' + lv + '/' + u.max, sub: u.d + ' per level', price: max ? 'MAX' : fmtN(c), cls: max ? 'own' : (META.bank < c ? 'off' : ''), fn: max ? null : function () { if (spend(c)) { META.up[u.id] = lv + 1; saveMeta(); renderMenu(true); } } };
  });
  BUILDINGS.forEach(function (b) { if (!META.built[b.id]) rows.push({ icon: 'coin', name: 'BUILD ' + b.name.toUpperCase(), sub: 'Opens a new building on the street', price: fmtN(b.cost), cls: 'sec' + (META.bank < b.cost ? ' off' : ''), fn: function () { if (spend(b.cost)) { META.built[b.id] = 1; saveMeta(); G.layer = null; renderMenu(true); } } }); });
  openMenu({ title: "Cumhead's Clubhouse", note: BUILDINGS[0].quote, pic: 'cumhead', rows: rows });
}
function openGear() {
  var rows = [];
  ['weapon', 'armour', 'helm'].forEach(function (slot) {
    var cur = META.gear[slot], own = META.gearOwn[slot], list = GEAR[slot];
    list.forEach(function (g, i) {
      var desc = slot === 'weapon' ? '+' + g.dmg + ' damage' : slot === 'armour' ? '+' + g.hp + ' HP · ' + Math.round(g.arm * 100) + '% blocked' : '+' + g.mana + ' mana · +' + Math.round(g.crit * 100) + '% crits';
      if (i <= own) rows.push({ icon: g.icon, name: GEARNAME[slot].toUpperCase() + ': ' + g.name.toUpperCase(), sub: desc, price: i === cur ? 'EQUIPPED' : 'EQUIP', cls: i === cur ? 'own' : '', fn: function () { META.gear[slot] = i; saveMeta(); sfx.click(); renderMenu(true); } });
      else if (i === own + 1) rows.push({ icon: g.icon, name: 'BUY ' + g.name.toUpperCase(), sub: desc, price: fmtN(g.cost), cls: META.bank < g.cost ? 'off' : '', fn: function () { if (spend(g.cost)) { META.gearOwn[slot] = i; META.gear[slot] = i; saveMeta(); renderMenu(true); } } });
    });
  });
  openMenu({ title: "Greebo's Gourmet Goonery", note: BUILDINGS[1].quote, pic: 'npc_greebo', rows: rows });
}
function openRunes() {
  var rows = RUNES.map(function (r) {
    var own = META.runes[r.id], on = runeOn(r.id);
    if (!own) return { icon: r.icon, name: 'BUY ' + r.name.toUpperCase(), sub: r.d, price: fmtN(r.cost), cls: META.bank < r.cost ? 'off' : '', fn: function () { if (spend(r.cost)) { META.runes[r.id] = 1; if (META.runeOn.length < 3) META.runeOn.push(r.id); saveMeta(); renderMenu(true); } } };
    return { icon: r.icon, name: r.name.toUpperCase(), sub: r.d, price: on ? 'ON' : 'OFF', cls: on ? 'own' : '', fn: function () { if (on) META.runeOn.splice(META.runeOn.indexOf(r.id), 1); else { if (META.runeOn.length >= 3) { sfx.no(); toastMenu('THREE RUNES AT A TIME. TURN ONE OFF FIRST.'); return; } META.runeOn.push(r.id); } saveMeta(); sfx.click(); renderMenu(true); } };
  });
  openMenu({ title: 'Spermaid Sanctum', note: 'Runes on: ' + META.runeOn.length + '/3', pic: 'npc_spermaid', rows: rows });
}
function toastMenu(t) { el('menuNote').textContent = t; }
function openFate(drawn) {
  var rows = [];
  if (META.card) rows.push({ name: 'YOUR NEXT HEIR CARRIES: ' + cardName(META.card).toUpperCase(), sub: CARDS.filter(function (c) { return c.id === META.card; })[0].d, price: 'HELD', cls: 'own', icon: 'deck' });
  if (!drawn) {
    var cost = META.card ? 60 : 0;
    rows.push({ icon: 'deck', name: META.card ? 'DRAW AGAIN' : 'DRAW THREE CARDS', sub: 'Pick one. It changes the whole next run, good and bad.', price: cost ? fmtN(cost) : 'FREE', fn: function () { if (cost && !spend(cost)) return; if (!cost) sfx.magic(); openFate(shuffle(CARDS.slice()).slice(0, 3)); } });
    if (META.card) rows.push({ icon: 'curse', name: 'THROW THE CARD AWAY', sub: 'Go in clean', price: '', fn: function () { META.card = null; saveMeta(); sfx.click(); openFate(); } });
  } else drawn.forEach(function (c) { rows.push({ icon: 'deck', name: c.name.toUpperCase(), sub: c.d, price: 'TAKE', cls: 'sec', fn: function () { META.card = c.id; saveMeta(); sfx.magic(); openFate(); } }); });
  openMenu({ title: "Stacked Fate's Table", note: BUILDINGS[2].quote, pic: 'npc_stackedfate', rows: rows, back: drawn ? function () { openFate(); } : null });
}
function openProv(b) {
  var slot = b.slot, have = META.prov[slot], rows = (PROV[slot] || []).map(function (it) {
    var mine = have === it.id;
    return { icon: it.icon, name: it.name.toUpperCase(), sub: it.d + (have && !mine ? '  (replaces what you bought)' : ''), price: mine ? 'READY' : fmtN(it.cost), cls: mine ? 'own' : (META.bank < it.cost ? 'off' : ''), fn: mine ? null : function () { if (spend(it.cost)) { META.prov[slot] = it.id; saveMeta(); renderMenu(true); } } };
  });
  openMenu({ title: b.name, note: (b.quote ? b.quote + '  ' : '') + 'One per heir, used up when the next run starts.', pic: b.npc, rows: rows });
}
function openArcadeMenu() {
  var rows = [
    { icon: 'npc_potbelly', name: 'PLAY MEATNADO ESCAPE', sub: 'The cabinet by the door', fn: function () { openCab('meatnado.html'); } },
    { icon: 'cumface', name: 'PLAY CUMHEAD THE SPERMHOG', sub: 'Where this engine came from', fn: function () { openCab('spermhog.html'); } },
    { icon: 'coin', name: 'THE LEGACY BOARD', sub: 'Every heir who went in', fn: openLegacy },
    { icon: 'boss_blum', name: 'RECORDS', sub: 'Blumhead beaten ' + META.blumWins + 'x  ·  Super Blumhead ' + META.superWins + 'x  ·  New Game+ ' + META.ng, fn: null }
  ];
  openMenu({ title: 'Potbelly Arcade', note: BUILDINGS[10].quote, pic: 'npc_potbelly', rows: rows });
}
function openLegacy() {
  var rows = META.legacy.length ? META.legacy.map(function (h, i) { return { icon: h.cls === 'cumhead' ? 'cumface' : (h.cls === 'homunculus' ? 'hom_s0' : h.cls + '_d'), name: (h.win ? 'WON  ·  ' : '') + CLASSES[h.cls].name.toUpperCase() + (h.ng ? '  ·  NG+' + h.ng : ''), sub: (h.win ? 'Finished the legacy' : 'Fell in ' + h.area + ' to ' + h.by) + '  ·  ' + fmtT(h.t) + '  ·  ' + h.kills + ' foes', price: '+' + fmtN(h.d) }; }) : [{ name: 'NO HEIRS YET', sub: 'Go in through the castle gate' }];
  openMenu({ title: 'The Legacy Board', note: 'Newest first.', pic: 'npc_potbelly', rows: rows, back: openArcadeMenu });
}
function openCab(src) { closeMenu(); setMenuMode(true); el('arcFrame').src = src; el('arc').hidden = false; music.stop(0.5); }
el('arcX').addEventListener('click', function () { el('arc').hidden = true; el('arcFrame').src = 'about:blank'; setMenuMode(false); music.play('b7', false); sfx.init(); });

/* ---------- choosing the next heir ---------- */
function heirPic(cls) { if (cls === 'cumhead') return cumCanvas('idle0'); if (cls === 'homunculus') return sprCanvas('hom_s0', 1.4); return sprCanvas(cls + '_s0', 1.3); }
function openHeirs() {
  var opts;
  if (!META.runs) opts = ['cumhead'];
  else opts = shuffle(CLASSORDER.filter(function (c) { return c !== META.last; })).slice(0, 2);
  var pv = []; for (var s in META.prov) PROV[s].forEach(function (it) { if (it.id === META.prov[s]) pv.push(it.name); });
  openMenu({ title: META.runs ? 'Choose Your Heir' : 'Your First Heir', note: (META.runs ? 'Two heirs step up. ' + CLASSES[META.last].name + ' went in last time and stays home.' : 'Every legacy starts with Cumhead.') + (META.card ? '  Fate: ' + cardName(META.card) + '.' : '') + (pv.length ? '  Provisions: ' + pv.join(', ') + '.' : ''), pic: null, rows: [],
    custom: function (list) {
      var wrap = document.createElement('div'); wrap.className = 'heirs';
      opts.forEach(function (cls) {
        var c = CLASSES[cls], b = document.createElement('button'); b.type = 'button'; b.className = 'heir' + (opts.length === 1 ? ' solo' : '');
        var cv2 = heirPic(cls) || mk(1, 1); b.appendChild(cv2);
        var h = document.createElement('b'); h.textContent = c.name; b.appendChild(h);
        [['HP ' + c.hp + '  ·  DMG ' + c.dmg + '  ·  MANA ' + c.mana], [c.pas.toUpperCase() + ': ' + c.pd], ['B: ' + c.ad], ['C: ' + c.sd]].forEach(function (l) { var p = document.createElement('span'); p.textContent = l[0]; b.appendChild(p); });
        b.addEventListener('click', function () { sfx.goal(); closeMenu(); startRun(cls); });
        wrap.appendChild(b);
      });
      list.appendChild(wrap); list.style.display = 'flex';
    } });
}

/* ---------- inside the castle: merchants, altars, pause ---------- */
function openMerchant(e) {
  var rs = rsOf(G.roomKey), t = tierOf(), m = 1 + 0.5 * META.ng, who = MERCHNAME[e.who] || 'A stranger';
  if (!rs.mp) rs.mp = shuffle(POWERS.slice())[0].id;
  var pw = powerById(rs.mp), rows = [
    { icon: 'gtonic', name: 'PATCH UP', sub: 'Heal half your HP', price: fmtN(30 * t * m), fn: function () { if (P.hp >= ST.mhp) { sfx.no(); return; } if (spend(Math.round(30 * t * m), true)) { var keep = ST.noHeal; ST.noHeal = false; healP(Math.round(ST.mhp / 2)); ST.noHeal = keep; renderMenu(true); } } },
    { icon: 'sage', name: 'TOP UP MANA', sub: 'Fill your mana', price: fmtN(18 * t * m), fn: function () { if (spend(Math.round(18 * t * m), true)) { P.mana = ST.mmana; renderMenu(true); } } },
    { icon: pw.icon, name: rs.b.p ? 'SOLD OUT' : pw.name.toUpperCase(), sub: rs.b.p ? '' : pw.d + ' for this run', price: rs.b.p ? '' : fmtN(90 * t * m), cls: rs.b.p ? 'off' : 'sec', fn: rs.b.p ? null : function () { if (spend(Math.round(90 * t * m), true)) { rs.b.p = 1; closeMenu(); grantPower(pw.id); } } }
  ];
  openMenu({ title: who + "'s Stall", note: '"Drops spend the same in here, love."', pic: e.who, rows: rows, bank: 'run' });
}
function openAltar(e) {
  var rs = rsOf(G.roomKey); if (!rs.alt) rs.alt = shuffle(POWERS.slice()).slice(0, 2).map(function (p) { return p.id; });
  openMenu({ title: 'Powerup Altar', note: 'Take one. The other fades.', pic: null, bank: 'none', rows: rs.alt.map(function (id) { var p = powerById(id); return { icon: p.icon, name: p.name.toUpperCase(), sub: p.d, price: 'TAKE', cls: 'sec', fn: function () { rs.taken = 1; e.taken = true; closeMenu(); grantPower(id); poof(e.x, e.y - 30, 20, ['#ffe36a', '#f1e7d0', '#7a2aff']); } }; }) });
}
function openPause() {
  var rows = [{ icon: 'elixir', name: 'RESUME', fn: closeMenu }];
  if (G.mode === 'play') {
    rows.push({ icon: 'deck', name: 'THIS HEIR', sub: CLASSES[RUN.cls].name + '  ·  HP ' + Math.ceil(P.hp) + '/' + ST.mhp + '  ·  DMG ' + Math.round(ST.dmg) + '  ·  ' + (RUN.card ? 'Fate: ' + cardName(RUN.card) : 'No fate card') });
    var counts = {}; RUN.powers.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
    Object.keys(counts).forEach(function (id) { var p = powerById(id); rows.push({ icon: p.icon, name: p.name.toUpperCase() + (counts[id] > 1 ? ' x' + counts[id] : ''), sub: p.d }); });
    rows.push({ icon: 'coin', name: 'SEALS BROKEN ' + sealCount() + '/4', sub: AREAORDER.map(function (a) { return (META.bosses[a] ? '✓ ' : '· ') + BOSSDEF[AREAS[a].boss].name; }).join('   ') });
    rows.push({ icon: 'scrollWarp', name: 'SAVE AND QUIT TO TITLE', sub: 'Carry on later from this room', fn: function () { saveRun(); closeMenu(); toTitle(); } });
  } else rows.push({ icon: 'scrollWarp', name: 'QUIT TO TITLE', fn: function () { closeMenu(); toTitle(); } });
  openMenu({ title: 'Paused', note: '', pic: null, rows: rows, bank: G.mode === 'play' ? 'run' : 'town', backTxt: 'RESUME' });
}
