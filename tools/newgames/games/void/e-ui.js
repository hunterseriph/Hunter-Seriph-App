/* ---------- Final Fantasy VII style windows: a blue gradient box with a light rim, a white pointing hand ---------- */
function win7(x, y, w, h, alpha) {
  var c = KIT.ctx; c.save(); if (alpha !== undefined) c.globalAlpha *= alpha;
  var g = c.createLinearGradient(x, y, x + w * 0.3, y + h); g.addColorStop(0, '#3a4ea6'); g.addColorStop(1, '#0a1240');
  c.fillStyle = '#05061a'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, Math.round(w) + 2, Math.round(h) + 2);
  c.fillStyle = g; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  c.strokeStyle = '#d8dcf0'; c.lineWidth = 1; c.strokeRect(Math.round(x) + 1.5, Math.round(y) + 1.5, Math.round(w) - 3, Math.round(h) - 3);
  c.strokeStyle = 'rgba(90,100,160,0.9)'; c.strokeRect(Math.round(x) + 2.5, Math.round(y) + 2.5, Math.round(w) - 5, Math.round(h) - 5);
  c.restore();
}
function bar7(x, y, w, k, col, h) { h = h || 3; R('#05061a', x - 1, y - 1, w + 2, h + 2); R('#1a2050', x, y, w, h); R(col, x, y, Math.round(w * clamp(k, 0, 1)), h); R('rgba(255,255,255,0.35)', x, y, Math.round(w * clamp(k, 0, 1)), 1); }
function hand(x, y, flip) { // the white gloved pointer
  var bob = Math.round(Math.sin(G.t * 10)), c = KIT.ctx; c.save(); c.translate(Math.round(x) + bob, Math.round(y)); if (flip) { c.scale(-1, 1); }
  R('#12040a', -1, -4, 15, 9); R('#ffffff', 0, -3, 9, 7); R('#ffffff', 8, -2, 6, 4); R('#c8c8d8', 0, 2, 9, 2); R('#12040a', 4, -3, 1, 6); c.restore();
}

/* ---------- a stack of canvas menus (controller, keys and taps all drive them) ---------- */
var UI = [];
function uiPush(s) { UI.push(s); sfx.play('blip'); }
function uiPop() { UI.pop(); sfx.play('back'); }
function uiUpdate(dt) { var s = UI[UI.length - 1]; if (s) s.input(); }
function drawUI() { UI.forEach(function (s) { s.draw(); }); }
function inRect(r) { return KIT.ptr.tap && KIT.ptr.x >= r[0] && KIT.ptr.x <= r[0] + r[2] && KIT.ptr.y >= r[1] && KIT.ptr.y <= r[1] + r[3]; }
/* a list in a window: items {label, right, dis, d, fn}; cols 1 or 2 */
function listScreen(o) {
  var s = { cur: 0, top: 0, o: o };
  var rows = function () { return Math.floor((o.h - 16) / o.rh); };
  s.rect = function (i) { var j = i - s.top * (o.cols || 1), c = o.cols || 1; return [o.x + 8 + (j % c) * ((o.w - 16) / c), o.y + 8 + Math.floor(j / c) * o.rh, (o.w - 16) / c, o.rh]; };
  s.input = function () {
    var n = o.items().length, c = o.cols || 1; if (!n) { if (KIT.pressed('b') || KIT.pressed('a') || KIT.ptr.tap) uiPop(); return; }
    if (KIT.pressed('down')) { s.cur = Math.min(n - 1, s.cur + c); sfx.play('tick'); } if (KIT.pressed('up')) { s.cur = Math.max(0, s.cur - c); sfx.play('tick'); }
    if (c > 1 && KIT.pressed('right') && s.cur % c < c - 1 && s.cur + 1 < n) { s.cur++; sfx.play('tick'); } if (c > 1 && KIT.pressed('left') && s.cur % c > 0) { s.cur--; sfx.play('tick'); }
    var vis = rows() * c; if (s.cur < s.top * c) s.top = Math.floor(s.cur / c); if (s.cur >= s.top * c + vis) s.top = Math.floor(s.cur / c) - rows() + 1;
    var tapped = -1; for (var i = s.top * c; i < Math.min(n, s.top * c + vis); i++) if (inRect(s.rect(i))) tapped = i;
    if (tapped >= 0) s.cur = tapped;
    if (KIT.pressed('b') || (KIT.ptr.tap && tapped < 0 && o.tapOut === true && !inRect([o.x, o.y, o.w, o.h]))) { if (o.back) o.back(); else uiPop(); return; }
    if (KIT.pressed('a') || tapped >= 0) { var it = o.items()[s.cur]; if (!it || it.dis) { sfx.play('no'); return; } sfx.play('select'); it.fn(it, s); }
  };
  s.draw = function () {
    if (o.under) o.under(s);
    win7(o.x, o.y, o.w, o.h); var its = o.items(), c = o.cols || 1, vis = rows() * c;
    its.slice(s.top * c, s.top * c + vis).forEach(function (it, j) { var r = s.rect(s.top * c + j); text(it.label, r[0] + 18, r[1] + 1, { size: o.fs || 14, font: 'body', col: it.dis ? '#6a6a90' : it.col || '#ffffff', max: r[2] - 60 }); if (it.right !== undefined) text(String(it.right), r[0] + r[2] - 6, r[1] + 1, { size: o.fs || 14, font: 'body', col: it.dis ? '#6a6a90' : '#ffffff', align: 'right' }); });
    if (UI[UI.length - 1] === s && its.length) { var rr = s.rect(s.cur); hand(rr[0], rr[1] + o.rh / 2 - 1); }
    if (!its.length) text(o.empty || 'Nothing here.', o.x + 20, o.y + 12, { size: 14, font: 'body', col: '#a0a0c8' });
    var cur = its[s.cur]; if (o.help !== false && cur && cur.d) { win7(4, 4, W - 8, 24); text(cur.d, 14, 8, { size: 13, font: 'body', col: '#ffffff', max: W - 30 }); }
    if (o.over) o.over(s);
  };
  return s;
}

/* ---------- the main menu: party on the left, commands on the right, time and drops below ---------- */
function fieldMenu() {
  if (G.mode !== 'field' || DLG || UI.length || KIT.menuOpen()) return;
  var opts = [{ label: 'Item', fn: itemScreen }, { label: 'Skill', fn: function () { pickHeroUI('Who casts?', function (m) { skillScreen(m); }, function (m) { return alive(m) && skillsOf(m).some(function (s) { return s.k === 'heal' || s.k === 'revive'; }); }); } },
    { label: 'Equip', fn: function () { pickHeroUI('Equip who?', equipScreen); } }, { label: 'Status', fn: function () { pickHeroUI('Whose status?', statusScreen); } },
    { label: 'Save', dis: G.mk === 'dun', fn: function () { save(); sfx.play('magic'); UI = []; say([['', 'Saved.']]); } }, { label: 'Help', fn: function () { UI = []; helpMenu(); } }, { label: 'Quit', fn: function () { UI = []; titleMenu(); } }];
  var s = listScreen({ x: 342, y: 6, w: 132, h: 156, rh: 20, items: function () { return opts; }, help: false, under: drawPartyMain, over: drawMainExtras });
  uiPush(s);
}
function drawPartyMain() {
  win7(6, 6, 332, 214);
  S.party.forEach(function (m, i) { var y = 14 + i * 68, h = HEROES[m.id];
    R('rgba(0,0,0,0.25)', 14, y, 50, 60); spr(alive(m) ? h.spr.idle : h.spr.dead, 39, y + 58, { sc: m.id === 'spermaid' ? 0.95 : 1.1 });
    text(heroName(m), 74, y + 2, { size: 16, font: 'body', col: '#ffffff' }); text('LV', 74, y + 22, { size: 6, col: '#8ab0ff' }); text(String(m.lv), 104, y + 20, { size: 14, font: 'body', col: '#ffffff', align: 'right' });
    text('HP', 120, y + 22, { size: 6, col: '#8ab0ff' }); text(m.hp + ' / ' + maxHp(m), 230, y + 20, { size: 14, font: 'body', col: alive(m) ? '#ffffff' : '#ff6a74', align: 'right' }); bar7(140, y + 36, 90, m.hp / maxHp(m), '#4a8aff');
    text('MP', 120, y + 42, { size: 6, col: '#8ab0ff' }); text(m.mp + ' / ' + maxMp(m), 230, y + 40, { size: 14, font: 'body', col: '#ffffff', align: 'right' }); bar7(140, y + 56, 90, m.mp / Math.max(1, maxMp(m)), '#9aff5a');
    text('NEXT LEVEL', 246, y + 6, { size: 6, col: '#8ab0ff' }); bar7(246, y + 18, 80, m.xp / xpNext(m.lv), '#ff6aa0'); text('LIMIT', 246, y + 30, { size: 6, col: '#8ab0ff' }); bar7(246, y + 42, 80, m.limit || 0, '#ffe36a');
  });
}
function placeName() { if (G.mk === 'world') return 'The Red Waste'; if (G.mk === 'town') return TOWNSPEC[G.mid].name; if (G.mk === 'room') return BUILDINGS[G.bld].n; return DUNGEONS[G.mid].name; }
function drawMainExtras() {
  var t = Math.floor(S.t), hh = Math.floor(t / 3600), mm = Math.floor(t / 60) % 60, ss = t % 60;
  win7(342, 164, 132, 28); text('Time', 352, 169, { size: 13, font: 'body', col: '#8ab0ff' }); text(hh + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2), 466, 169, { size: 14, font: 'body', col: '#ffffff', align: 'right' });
  win7(342, 194, 132, 30); text('Drops', 352, 200, { size: 13, font: 'body', col: '#8ab0ff' }); text(String(S.drops), 466, 200, { size: 14, font: 'body', col: '#ffe36a', align: 'right' });
  win7(6, 226, 332, 38); text(placeName(), 18, 236, { size: 15, font: 'body', col: '#ffffff' });
  var keys = ['keyC', 'keyB', 'keyM'].filter(function (k) { return S.flags[k]; }); keys.forEach(function (k, i) { spr({ keyC: 'jv_keyc', keyB: 'jv_keyb', keyM: 'jv_keym' }[k], 300 - i * 18, 258, { sc: 0.8 }); });
  win7(342, 226, 132, 38); text('Menu', 408, 236, { size: 15, font: 'body', col: '#ffffff', align: 'center' });
}
function pickHeroUI(title, cb, ok) {
  var s = { cur: 0 };
  s.input = function () {
    if (KIT.pressed('down')) { s.cur = (s.cur + 1) % 3; sfx.play('tick'); } if (KIT.pressed('up')) { s.cur = (s.cur + 2) % 3; sfx.play('tick'); }
    var tp = -1; for (var i = 0; i < 3; i++) if (inRect([6, 10 + i * 68, 332, 66])) tp = i; if (tp >= 0) s.cur = tp;
    if (KIT.pressed('b')) { uiPop(); return; }
    if (KIT.pressed('a') || tp >= 0) { var m = S.party[s.cur]; if (ok && !ok(m)) { sfx.play('no'); return; } sfx.play('select'); cb(m, s); }
  };
  s.draw = function () { drawPartyMain(); win7(4, 4, W - 8, 24); text(title, 14, 8, { size: 14, font: 'body', col: '#ffffff' }); if (UI[UI.length - 1] === s) hand(8, 40 + s.cur * 68); };
  uiPush(s); return s;
}
function itemScreen() {
  var s = listScreen({ x: 6, y: 34, w: W - 12, h: 230, rh: 18, cols: 2, empty: 'No items.',
    items: function () { return Object.keys(S.inv).filter(function (k) { return S.inv[k] > 0; }).map(function (k) { var it = ITEMS[k]; return { label: it.n, right: S.inv[k], d: it.d, dis: !!it.dmg, k: k, fn: function () { useItemField(k); } }; }); } });
  uiPush(s);
}
function useItemField(k) {
  var it = ITEMS[k];
  if (it.tg === 'allies') { S.inv[k]--; S.party.forEach(function (m) { if (alive(m)) { if (it.heal) m.hp = Math.min(maxHp(m), m.hp + it.heal); if (it.mp) m.mp = Math.min(maxMp(m), m.mp + it.mp); } }); sfx.play('magic'); return; }
  pickHeroUI('Use ' + it.n + ' on who?', function (m) { if (!S.inv[k]) { uiPop(); return; } if (it.revive ? alive(m) : !alive(m)) { sfx.play('no'); return; }
    S.inv[k]--; if (it.revive) m.hp = Math.round(maxHp(m) * it.revive); if (it.heal) m.hp = Math.min(maxHp(m), m.hp + it.heal); if (it.mp) m.mp = Math.min(maxMp(m), m.mp + it.mp); if (it.cure) m.st = {};
    if (it.pill) { var r = Math.random(); if (r < 0.5) m.hp = maxHp(m); else m.hp = Math.max(1, Math.round(m.hp / 2)); }
    sfx.play('magic'); if (!S.inv[k]) uiPop(); });
}
function skillScreen(m) {
  var s = listScreen({ x: 6, y: 34, w: W - 12, h: 230, rh: 18, cols: 2, items: function () { return skillsOf(m).filter(function (q) { return q.k === 'heal' || q.k === 'revive'; }).map(function (q) { return { label: q.n, right: q.mp + ' MP', d: q.d + '  (' + heroName(m) + ' has ' + m.mp + ' MP)', dis: m.mp < q.mp, fn: function () {
    var go = function (t) { if (m.mp < q.mp) return; m.mp -= q.mp; (q.tg === 'allies' ? S.party : [t]).forEach(function (o) { if (q.k === 'revive') { if (!alive(o)) o.hp = Math.round(maxHp(o) * q.pow); } else if (alive(o)) { o.hp = Math.min(maxHp(o), o.hp + Math.round(stat(m, 'mag') * q.pow + q.base)); if (q.cure) o.st = {}; } }); sfx.play('magic'); };
    if (q.tg === 'allies') go(); else pickHeroUI(q.n + ' on who?', function (t) { go(t); uiPop(); }); } }; }); } });
  uiPush(s);
}
function equipScreen(m) {
  var slot = 'wpn';
  var s = listScreen({ x: 6, y: 112, w: W - 12, h: 152, rh: 18, cols: 2, empty: 'Nothing else to wear. Buy gear in town or find it in chests.',
    items: function () { return Object.keys(S.gear).filter(function (k) { return S.gear[k] > 0 && GEAR[k].s === slot && (GEAR[k].w === 'all' || GEAR[k].w === m.id); }).map(function (k) { var g = GEAR[k]; return { label: g.n, right: S.gear[k], d: gearDesc(g), fn: function () { var old = m[g.s]; m[g.s] = k; S.gear[k]--; S.gear[old] = (S.gear[old] || 0) + 1; m.hp = Math.min(m.hp, maxHp(m)); m.mp = Math.min(m.mp, maxMp(m)); sfx.play('select'); } }; }); },
    under: function () { win7(6, 34, W - 12, 74); spr(HEROES[m.id].spr.idle, 34, 100); text(heroName(m), 60, 40, { size: 16, font: 'body', col: '#ffffff' });
      text((slot === 'wpn' ? '> ' : '  ') + 'Weapon  ' + GEAR[m.wpn].n, 60, 60, { size: 13, font: 'body', col: slot === 'wpn' ? '#ffe36a' : '#ffffff' }); text((slot === 'arm' ? '> ' : '  ') + 'Armour  ' + GEAR[m.arm].n, 60, 78, { size: 13, font: 'body', col: slot === 'arm' ? '#ffe36a' : '#ffffff' });
      text('ATK ' + stat(m, 'atk') + '   DEF ' + stat(m, 'def') + '   MAG ' + stat(m, 'mag') + '   SPD ' + stat(m, 'spd'), 300, 60, { size: 13, font: 'body', col: '#ffffff' }); text('LEFT / RIGHT: weapon or armour', 300, 80, { size: 12, font: 'body', col: '#8ab0ff' }); } });
  var inp = s.input; s.input = function () { if (KIT.pressed('left') || KIT.pressed('right') || inRect([60, 58, 220, 36])) { slot = slot === 'wpn' ? 'arm' : 'wpn'; s.cur = 0; s.top = 0; sfx.play('tick'); return; } inp(); };
  uiPush(s);
}
function gearDesc(g) { return (g.w === 'all' ? 'Anyone' : HEROES[g.w].name) + ' · ' + (g.s === 'wpn' ? 'Weapon' : 'Armour') + (g.atk ? '  ATK +' + g.atk : '') + (g.def ? '  DEF +' + g.def : '') + (g.mag ? '  MAG +' + g.mag : ''); }
function statusScreen(m) {
  var s = { input: function () { if (KIT.pressed('b') || KIT.pressed('a') || KIT.ptr.tap) uiPop(); },
    draw: function () { win7(6, 6, W - 12, H - 12); var h = HEROES[m.id]; spr(h.spr.idle, 60, 110, { sc: 1.6 });
      text(heroName(m), 120, 18, { size: 22, font: 'body', col: '#ffffff' }); text('LV ' + m.lv + '   HP ' + m.hp + '/' + maxHp(m) + '   MP ' + m.mp + '/' + maxMp(m), 120, 46, { size: 14, font: 'body', col: '#ffffff' });
      ['atk', 'def', 'mag', 'spd'].forEach(function (k, i) { text({ atk: 'Attack', def: 'Defence', mag: 'Magic', spd: 'Speed' }[k], 120, 74 + i * 18, { size: 14, font: 'body', col: '#8ab0ff' }); text(String(stat(m, k)), 230, 74 + i * 18, { size: 14, font: 'body', col: '#ffffff', align: 'right' }); });
      text('XP to next level: ' + (xpNext(m.lv) - m.xp), 120, 150, { size: 14, font: 'body', col: '#ffffff' }); text('Limit Break: ' + LIMITS[m.id].n, 120, 170, { size: 14, font: 'body', col: '#ffe36a' }); text(LIMITS[m.id].d, 120, 188, { size: 12, font: 'body', col: '#c8c8e8', max: 230 });
      text('Skills', 300, 74, { size: 14, font: 'body', col: '#8ab0ff' }); skillsOf(m).forEach(function (q, i) { text(q.n, 300, 92 + i * 16, { size: 13, font: 'body', col: '#ffffff' }); text(q.mp + ' MP', 462, 92 + i * 16, { size: 13, font: 'body', col: '#ffffff', align: 'right' }); });
      text(GEAR[m.wpn].n + '  ·  ' + GEAR[m.arm].n, 120, 236, { size: 13, font: 'body', col: '#c8c8e8' }); } };
  uiPush(s);
}
/* ---------- shops, the inn, the arcade ---------- */
function shopUI(B) {
  var goods = (B.shop || []).map(function (k) { return { k: k, it: ITEMS[k], gear: false }; }).concat((B.gear || []).map(function (k) { return { k: k, it: GEAR[k], gear: true }; }));
  var s = listScreen({ x: 6, y: 66, w: 300, h: 198, rh: 20, items: function () { return goods.map(function (g) { var price = g.it.price; return { label: g.it.n, right: price, dis: S.drops < price, d: g.gear ? gearDesc(g.it) : g.it.d, fn: function () { S.drops -= price; if (g.gear) S.gear[g.k] = (S.gear[g.k] || 0) + 1; else S.inv[g.k] = (S.inv[g.k] || 0) + 1; sfx.play('coin'); } }; }); },
    under: function () { win7(6, 32, 468, 30); text(B.n + (B.who ? ' · ' + B.who : ''), 16, 38, { size: 14, font: 'body', col: '#ffe36a', max: 448 }); },
    over: function (s) { var g = goods[s.cur]; win7(310, 66, 164, 120); if (g) { text('Owned', 320, 72, { size: 13, font: 'body', col: '#8ab0ff' }); text(String(g.gear ? (S.gear[g.k] || 0) : (S.inv[g.k] || 0)), 464, 72, { size: 13, font: 'body', col: '#ffffff', align: 'right' });
        if (g.gear) S.party.forEach(function (m, i) { var can = g.it.w === 'all' || g.it.w === m.id, cur = GEAR[m[g.it.s]], st = g.it.s === 'wpn' ? 'atk' : 'def', d = (g.it[st] || 0) - (cur[st] || 0); text(heroName(m), 320, 96 + i * 26, { size: 13, font: 'body', col: can ? '#ffffff' : '#6a6a90' }); if (can) text((d >= 0 ? '+' : '') + d + ' ' + st.toUpperCase(), 464, 96 + i * 26, { size: 13, font: 'body', col: d > 0 ? '#7dff9a' : d < 0 ? '#ff6a74' : '#ffffff', align: 'right' }); }); }
      win7(310, 190, 164, 30); text('Drops', 320, 196, { size: 13, font: 'body', col: '#8ab0ff' }); text(String(S.drops), 464, 196, { size: 14, font: 'body', col: '#ffe36a', align: 'right' }); win7(310, 224, 164, 40); text('A buys one.  B leaves.', 392, 236, { size: 12, font: 'body', col: '#c8c8e8', align: 'center' }); } });
  uiPush(s);
}
function innUI(B) {
  var s = listScreen({ x: W / 2 - 110, y: 96, w: 220, h: 66, rh: 20, help: false, items: function () { return [{ label: 'Stay the night (' + B.inn + ' drops)', dis: S.drops < B.inn, fn: function () { UI = []; restParty(B.inn, 'You sleep well. Everyone is back to full. (Saved.)'); } }, { label: 'Not now', fn: function () { uiPop(); } }]; },
    under: function () { win7(W / 2 - 110, 62, 220, 30); text(B.n, W / 2, 68, { size: 13, font: 'body', col: '#ffe36a', align: 'center', max: 200 }); } });
  uiPush(s);
}
function arcadeMenu(i) {
  var s = listScreen({ x: 60, y: 40, w: 360, h: 220, rh: 20, help: false, items: function () { return ARCADE.map(function (g, j) { return { label: g[1], fn: function () { UI = []; openArcadeGame(j); } }; }); },
    under: function () { win7(60, 8, 360, 28); text('Potbelly Arcade  ·  "Cabinets are free, kid. Play all you like."', 240, 14, { size: 12, font: 'body', col: '#ffe36a', align: 'center', max: 340 }); } });
  s.cur = Math.min(i || 0, ARCADE.length - 1); uiPush(s);
}
