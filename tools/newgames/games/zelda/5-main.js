/* ---------- the loop and the menus ---------- */
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (FADE) { FADE.t += dt; if (FADE.t >= 0.22 && !FADE.done) { FADE.done = 1; FADE.fn(); } if (FADE.t >= 0.44) FADE = null; return; }
  if (G.mode === 'dead') { G.deadT += dt; if (G.deadT > 2.5) { G.mode = 'play'; P.hp = 6; SV.hp = 6; P.inv = 2; P.fall = 0; P.hop = null; if (DG) { var dgi = DG.di; enterDungeon(dgi); } else { enterInside('club'); say('Cumhead wakes up in the Clubhouse again. Sir Johnathan has not moved.', ''); } persist(); } return; }
  if (G.mode === 'map' && G.map) { stepMap(dt); return; }
  if (G.mode !== 'play' || !P) return;
  if (MSGBOX) { MSGBOX.t += dt; if (MSGBOX.t > 0.3 && (KIT.pressed('a') || KIT.pressed('b') || KIT.ptr.tap)) MSGBOX = null; return; }
  stepPlayer(dt); stepFoes(dt); stepBoss(dt); stepBits(dt); stepSpawns(dt); SV.hp = P.hp;
  var tg = camTarget(), k = SCR.kind === 'dg' ? 9 : 12; CAM.x += (tg[0] - CAM.x) * Math.min(1, dt * k); CAM.y += (tg[1] - CAM.y) * Math.min(1, dt * k);
  if (Math.abs(tg[0] - CAM.x) < 0.3) CAM.x = tg[0]; if (Math.abs(tg[1] - CAM.y) < 0.3) CAM.y = tg[1];
}
function ending() {
  G.mode = 'end'; SV.won++; persist(); music.play('lcover');
  KIT.menu({ title: 'The Legend Ends', html: '<p>Blumhead bursts into goo and the five Cum Chalices ring out together. The seal over the land lifts, the sky goes back to its proper red, and somewhere down in Cum City Amy is already asking if you want mild, hot or dynamite.</p><p style="color:#a6968f">Deaths ' + SV.deaths + ' · Hearts ' + SV.hearts + '</p>',
    items: [{ label: 'SECOND QUEST', sub: 'Keep your things, foes hit harder, your sausage hits harder', def: true, fn: function () { var keep = { items: SV.items, sel: SV.sel, hearts: SV.hearts, won: SV.won, deaths: SV.deaths, drops: SV.drops, bombs: SV.bombs }; SV = freshSave(); for (var k in keep) SV[k] = keep[k]; DGN = {}; persist(); startGame(); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left stick / d-pad / WASD. <b>A</b> talk, read, buy, open a chest, or swing Amy\u2019s Sausage (Amy gives it to you in her shop, on the same street as the Clubhouse). <b>B</b> use your item. <b>X</b> or <b>Y</b> switch items.</p><p>Cum City sits in the south of the land, inside its wall. Out past its gates every country is walled in by forest, cliffs, reeds or thorns, and the ways on are passages. Some are shut by things you can only get past with the right thing: bushes (the Sausage), cracked rocks (bombs, from Saba), red pegs (knock the orb behind them with Ali\u2019s Garlic Bread), stone eyes (shoot them with the Cream Pistol), chasms (float over on the Steve Balloon) and blood boulders (walk into them wearing the Bloodmoon Ring). Ledges can be hopped down but not climbed: they are the short cuts home.</p><p>Each dungeon has a small key, its item in a big chest, a Boss Key past a gate only that item opens, and the boss. Some rooms shut their doors until every foe is down. Uncle Beeb at the Tavern tells you where to go next.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') sysMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode === 'map') { closeMap(); return; } if (G.mode !== 'play') return; invMenu(); }
var CHALCOL = ['#f1e0b0', '#e8dcc8', '#ff2630', '#c4121c', '#a040ff'];
function chalDraw(col, have) { return function (g, w, h) { var k = w / 24; g.save(); g.scale(k, k); g.globalAlpha = have ? 1 : 0.3; g.fillStyle = '#12040a'; g.fillRect(4, 3, 16, 3); g.fillRect(6, 5, 12, 7); g.fillRect(10, 12, 4, 5); g.fillRect(6, 17, 12, 3); g.fillStyle = have ? '#ffe36a' : '#5a4a3a'; g.fillRect(5, 4, 14, 2); g.fillRect(7, 6, 10, 5); g.fillRect(11, 11, 2, 6); g.fillRect(7, 17, 10, 2); g.fillStyle = col; g.fillRect(8, 6, 8, 3); g.fillStyle = '#fff6dc'; g.fillRect(7, 6, 1, 4); g.restore(); }; }
function iconDraw(k) { return function (g, w, h) { var L = KIT.layer('lc-icon:' + k, 32, 32, function () { drawIcon(k, 16, 17); }, { px: 1 }); g.imageSmoothingEnabled = false; g.drawImage(L, 0, 0, w, w); }; }
function invMenu() {
  var own = ['sword', 'bombs', 'bread', 'pistol', 'balloon', 'ring', 'condom', 'bottle'], sl = own.map(function (k) { if (k === 'bottle' ? !SV.bottle : !SV.items[k]) return null; if (k === 'condom' || k === 'bottle') { return k === 'condom' ? { draw: iconDraw('condom'), name: 'Condom', desc: 'Shots from the front bounce off you.' } : { draw: iconDraw(SV.bottle === 'full' ? 'cuppa' : 'bottle'), name: SV.bottle === 'full' ? 'Cumpuccino' : 'Empty Bottle', desc: SV.bottle === 'full' ? 'Drink it with B for every heart back. It saves you if you drop.' : 'Kaya fills it at the Cum Café.', gold: SV.sel === 'bottle', tag: SV.sel === 'bottle' ? 'B' : null, act: SV.sel === 'bottle' ? 'ON B' : 'PUT ON B', dis: SV.sel === 'bottle', fn: function () { SV.sel = 'bottle'; persist(); invMenu(); } }; } var I = ITEMS[k], b = k !== 'sword' && k !== 'ring';
    return { spr: I.icon, name: I.n + (k === 'sword' && SV.items.sharp ? ' (sharpened)' : ''), desc: I.d + (k === 'sword' ? ' Always on A.' : k === 'ring' ? ' Always on.' : ''), count: k === 'bombs' ? SV.bombs : null, gold: SV.sel === k, tag: SV.sel === k ? 'B' : null, act: b ? (SV.sel === k ? 'ON B' : 'PUT ON B') : null, dis: SV.sel === k, fn: b ? function () { SV.sel = k; persist(); invMenu(); } : null }; });
  while (sl.length < 10) sl.push(null);
  for (var c = 0; c < 5; c++) { var hv = SV.chal.indexOf(c) >= 0; sl.push({ draw: chalDraw(CHALCOL[c], hv), name: hv ? 'Cum Chalice' : '???', desc: hv ? 'Taken back from ' + DUNGEONS[c].n + '.' : 'Still somewhere in ' + DUNGEONS[c].n + '.' }); }
  sl = sl.map(function (x) { return x || { spr: null, name: '', desc: '', empty: 1 }; }).map(function (x) { return x.empty ? null : x; });
  KIT.inv({ title: 'Your Things', cols: 5, slots: sl, min: 15, tabs: [{ label: 'THINGS', on: true, fn: invMenu }, { label: 'MAP', fn: mapMenu }, { label: 'SYSTEM', fn: sysMenu }],
    stats: [['HEARTS', SV.hearts], ['PIECES', SV.pieces + '/2'], ['DROPS', SV.drops], ['CHALICES', SV.chal.length + '/5'], ['DEATHS', SV.deaths]], close: KIT.closeMenu }); }
/* the map: the whole land at 2 px a tile filling the screen (no title, no scrolling: his ask), only the parts you've walked;
   in a dungeon, its rooms you've seen. Any button or a tap goes back to Your Things */
function mapPic() { genWorld(); var c = document.createElement('canvas'), g = c.getContext('2d'), info = { label: '', note: '' };
  if (SCR && SCR.kind === 'dg') { var dg = DG, st = dgState(dg.di), k = 38; c.width = 6 * k; c.height = 6 * k;
    dg.list.forEach(function (r) { if (!st.seen[r.id] && r.type !== 'boss') return; var x = r.x * k, y = r.y * k; g.fillStyle = '#12040a'; g.fillRect(x + 2, y + 2, k - 4, k - 4);
      g.fillStyle = r === ROOM ? '#c4121c' : st.seen[r.id] ? '#4a1a1c' : '#2a1012'; g.fillRect(x + 4, y + 4, k - 8, k - 8);
      g.fillStyle = '#a6968f'; Object.keys(r.doors).forEach(function (sd) { if (sd === 'n') g.fillRect(x + k / 2 - 3, y, 6, 5); if (sd === 's') g.fillRect(x + k / 2 - 3, y + k - 5, 6, 5); if (sd === 'w') g.fillRect(x, y + k / 2 - 3, 5, 6); if (sd === 'e') g.fillRect(x + k - 5, y + k / 2 - 3, 5, 6); });
      if (r.type === 'boss') { g.fillStyle = '#f1e7d0'; g.fillRect(x + k / 2 - 4, y + k / 2 - 4, 8, 8); g.fillStyle = '#12040a'; g.fillRect(x + k / 2 - 2, y + k / 2 - 2, 4, 4); } });
    info.label = dg.D.n.toUpperCase(); info.note = 'KEYS ' + (st.keys || 0) + (st.bk ? '  BOSS KEY' : ''); return { c: c, info: info }; }
  var k2 = 2; c.width = WW * k2; c.height = WHT * k2; g.fillStyle = '#0a0506'; g.fillRect(0, 0, c.width, c.height);
  for (var j = 0; j < WHT; j++) for (var i = 0; i < WW; i++) { if (!SV.seen[Math.floor(i / 9) + ',' + Math.floor(j / 7)]) continue; var t = WT[widx(i, j)], col = BIOMES[bioAt(i, j)].map;
    if (t === 1 || t === 42) col = '#1a0c0e'; else if (t === 3) col = '#5a0a14'; else if (t === 4 || t === 10) col = '#7a5a3a'; else if (t === 40 || t === 41) col = '#a6968f'; else if (t === 22) col = '#000';
    g.fillStyle = col; g.fillRect(i * k2, j * k2, k2, k2); }
  DUNGEONS.forEach(function (D, n) { if (D.wx === undefined || !SV.seen[Math.floor(D.wx / 9) + ',' + Math.floor(D.wy / 7)]) return; g.fillStyle = '#12040a'; g.fillRect(D.wx * k2 - 5, D.wy * k2 - 7, 11, 11); g.fillStyle = SV.chal.indexOf(n) >= 0 ? '#ffe36a' : '#ff2630'; g.fillRect(D.wx * k2 - 4, D.wy * k2 - 6, 9, 9); g.fillStyle = '#12040a'; g.fillRect(D.wx * k2 - 2, D.wy * k2 - 4, 5, 5); });
  var px = (SCR && SCR.kind === 'world' ? P.x : SV.where && SV.where.x || TOWN.home.x) / TS * k2, py = (SCR && SCR.kind === 'world' ? P.y : SV.where && SV.where.y || TOWN.home.y) / TS * k2;
  if (SCR && SCR.kind === 'in') { var dd = null; Object.keys(DOORS).forEach(function (q) { if (DOORS[q].to && DOORS[q].to.in === SCR.id) dd = DOORS[q]; }); if (dd) { px = dd.back.x / TS * k2; py = dd.back.y / TS * k2; } }
  info.px = px; info.py = py; info.label = SCR && SCR.kind === 'world' ? BIOMES[bioAt(P.x / TS, P.y / TS)].n : SCR && SCR.kind === 'in' ? (SCR.label || '').toUpperCase() : ''; return { c: c, info: info }; }
function mapMenu() { KIT.closeMenu(); G.map = mapPic(); G.map.t = 0; G.mode = 'map'; document.documentElement.classList.add('hs-menu'); }
function closeMap() { G.map = null; G.mode = 'play'; document.documentElement.classList.remove('hs-menu'); invMenu(); }
function stepMap(dt) { G.map.t += dt; if (G.map.t > 0.2 && (KIT.pressed('a') || KIT.pressed('b') || KIT.pressed('x') || KIT.pressed('y') || KIT.pressed('start') || KIT.ptr.tap)) closeMap(); }
function drawMap() { var m = G.map, c = m.c, g = KIT.ctx, W2 = KIT.W, sc = Math.min(1, (W2 - 8) / c.width, (H - 20) / c.height), w = Math.round(c.width * sc), h = Math.round(c.height * sc), x = Math.round((W2 - w) / 2), y = H - h - 4;
  R('#070405', 0, 0, W2, H); g.imageSmoothingEnabled = false; R('#4a1a1c', x - 2, y - 2, w + 4, h + 4); R('#12040a', x - 1, y - 1, w + 2, h + 2); g.drawImage(c, x, y, w, h);
  if (m.info.px !== undefined && Math.floor(G.t * 4) % 4) { var px = x + m.info.px * sc, py = y + m.info.py * sc; R('#fff', px - 3, py - 3, 7, 7); R('#ff2630', px - 2, py - 2, 5, 5); }
  if (m.info.label) KIT.text(m.info.label, x, 4, { size: 6, col: '#a6968f' }); if (m.info.note) KIT.text(m.info.note, x + w, 4, { size: 6, col: '#ffe36a', align: 'right' }); }
function sysMenu() { KIT.menu({ cls: 'clear', title: 'Paused', items: [{ label: 'CARRY ON', def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }, { label: 'BACK', back: true, fn: invMenu }] }); }
function titleMenu() {
  G.mode = 'title'; SCR = null; P = null; music.play('lctitle');
  var started = SV.items.sword || SV.deaths || SV.got.intro;
  KIT.menu({ cls: 'clear', logo: '../assets/lc-logo.webp', title: 'The Legend of Cumhead', items: [{ label: started ? 'CONTINUE' : 'NEW GAME', cls: 'hot', def: true, fn: startGame },
    started ? { label: 'NEW GAME', fn: function () { KIT.confirm({ title: 'Start Again?', sub: 'Your save is wiped.', yesLabel: 'Start again', yes: function () { SV = freshSave(); DGN = {}; persist(); startGame(); }, no: titleMenu }); } } : null, { label: 'HOW TO PLAY', fn: helpMenu }] });
}
music.songs.lctitle = { bpm: 96, beats: 4, vol: 0.85, wet: 0.5, lead: 'pulse', harm: 1, bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'Bb Bb Ab Bb Bb Bb Ab Bb Gb Gb Ab Ab Bb Bb F F', mel: 'bb4 - - - f4 - bb4 bb4 | c5 d5 eb5 f5 - - - - | f5 - f5 - gb5 - ab5 - | bb5 - - - - - - - | bb5 - ab5 - gb5 - ab5 - | gb5 - f5 - - - - - | f5 - eb5 - f5 - gb5 - | f5 - eb5 - db5 - eb5 - | db5 - - - eb5 - f5 - | eb5 - db5 - c5 - - - | c5 - d5 - e5 - g5 - | f5 - - - - - . . | bb4 - - - d5 - f5 - | bb5 - - - a5 - f5 - | f5 - - - - - - - | c5 - - - - - . .' };
music.songs.lcover = { bpm: 128, beats: 4, vol: 0.85, wet: 0.35, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C G Am F C G F G', mel: 'e5 - g5 - c6 - b5 - | a5 - g5 - d5 - - - | c5 - e5 - a5 - g5 - | f5 - a5 - c6 - - - | e6 - d6 - c6 - g5 - | b5 - d6 - g5 - - - | a5 - c6 - f6 - e6 - | d6 - - - b5 - - -' };
var drawPlay = draw; draw = function () { drawPlay(); if (G.mode === 'map' && G.map) drawMap(); };
KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu, startPauses: true,
  pad: { btns: [{ k: 'a', label: 'A', sub: 'SAUSAGE', cls: 'big' }, { k: 'b', label: 'B', sub: 'ITEM' }, { k: 'y', label: 'Y', sub: 'SWITCH' }] } });
music.songs.town = music.songs.town || music.songs.lcover;
titleMenu();
window.__lc = { G: G, get P() { return P; }, get SV() { return SV; }, get SCR() { return SCR; }, get FOE() { return FOE; }, get PICK() { return PICK; }, get BOSS() { return BOSS; }, get DG() { return DG; }, get ROOM() { return ROOM; }, startGame: startGame, goWorld: goWorld, enterInside: enterInside, get CAM() { return CAM; }, get WT() { return WT; }, get STRUCTS() { return STRUCTS; }, get GATES() { return GATES; }, get WITEMS() { return WITEMS; }, get AREAINFO() { return AREAINFO; }, EDGES: EDGES, bioAt: bioAt, openGate: openGate, dgState: dgState, roomCheck: roomCheck, camSnap: camSnap, get DOORS() { return DOORS; }, get TOWN() { return TOWN; }, get SPAWNS() { return SPAWNS; }, genWorld: genWorld, widx: widx, interact: interact, enterDungeon: enterDungeon, buildDungeon: buildDungeon, freshSave: function () { SV = freshSave(); DGN = {}; }, update: update, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } } };
