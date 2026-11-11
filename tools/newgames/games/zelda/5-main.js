/* ---------- the loop and the menus ---------- */
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode === 'dead') { G.deadT += dt; if (G.deadT > 2.5) { G.mode = 'play'; P.hp = 6; SV.hp = 6; P.inv = 2; SV.inDg = null; loadOver(2, 4); P.x = 10 * TS; P.y = 7 * TS; persist(); } return; }
  if (G.mode !== 'play' || !P) return;
  if (MSGBOX) { MSGBOX.t += dt; if (MSGBOX.t > 0.3 && (KIT.pressed('a') || KIT.pressed('b') || KIT.ptr.tap)) MSGBOX = null; return; }
  if (TRANS) return;
  stepPlayer(dt); stepFoes(dt); stepBoss(dt); stepBits(dt); SV.hp = P.hp;
}
function shopMenu() {
  var stock = [{ k: 'bombs', n: SV.items.bombs ? '4 Bombs' : 'A Bomb Bag (4 bombs)', cost: SV.items.bombs ? 20 : 40, ok: SV.bombs < 8 }, { k: 'heart', n: 'Refill your hearts', cost: 15, ok: P.hp < maxHp() }, { k: 'pie', n: "A slice of Greebo's pie (+1 heart, once)", cost: 120, ok: !SV.got.sabapie }];
  KIT.menu({ title: "Saba's Hitless Hemporium", sub: '"' + NPCSAY.saba + '"  ·  ' + SV.drops + ' drops', items: stock.map(function (it) { return { label: it.n + '  ·  ' + it.cost, dis: !it.ok, fn: function () { KIT.confirm({ title: it.n, price: it.cost, have: SV.drops, unit: 'DROPS', yes: function () { SV.drops -= it.cost;
      if (it.k === 'bombs') { if (!SV.items.bombs) { SV.items.bombs = 1; if (!SV.sel) SV.sel = 'bombs'; } SV.bombs = Math.min(8, SV.bombs + 4); } else if (it.k === 'heart') P.hp = maxHp(); else { SV.got.sabapie = 1; SV.hearts++; P.hp = maxHp(); }
      persist(); sfx.play('coin'); shopMenu(); }, no: shopMenu }); } }; }).concat([{ label: 'LEAVE', back: true, def: true, fn: KIT.closeMenu }]) });
}
function ending() {
  G.mode = 'end'; SV.won++; persist(); music.play('lcover');
  KIT.menu({ title: 'The Legend Ends', html: '<p>Blumhead bursts into goo and the five Cum Chalices ring out together. The seal over the land lifts, the sky goes back to its proper red, and somewhere down in Cum City Amy is already asking if you want mild, hot or dynamite.</p><p style="color:#a6968f">Deaths ' + SV.deaths + ' · Hearts ' + SV.hearts + '</p>',
    items: [{ label: 'SECOND QUEST', sub: 'Keep your things, foes hit harder, your sausage hits harder', def: true, fn: function () { var keep = { items: SV.items, sel: SV.sel, hearts: SV.hearts, won: SV.won, deaths: SV.deaths, drops: SV.drops, bombs: SV.bombs }; SV = freshSave(); for (var k in keep) SV[k] = keep[k]; DGN = {}; persist(); startGame(); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left stick / d-pad / WASD. <b>A</b> swing Amy’s Sausage (get it from Amy in the cave on the first screen). <b>B</b> use your item. <b>X</b> or <b>Y</b> switch items.</p><p>Walk off the edge of a screen to go to the next. Cut bushes for drops and hearts. Saba sells bombs: they open cracked rocks with secrets inside. Each dungeon has a small key, a Boss Key and an item in its chests. Clear a room and its doors open. Beat the boss for a heart and a Cum Chalice. The Lair at the top of the land opens with four chalices.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode !== 'play' || KIT.menuOpen()) return; KIT.menu({ cls: 'clear', title: 'Paused', sub: 'Chalices ' + SV.chal.length + ' of 5 · ' + (SV.sel ? 'B: ' + ITEMS[SV.sel].n : 'no item yet'), items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }] }); }
function titleMenu() {
  G.mode = 'title'; SCR = null; P = null; music.play('lctitle');
  var started = SV.items.sword || SV.deaths;
  KIT.menu({ cls: 'clear', logo: '../assets/lc-logo.webp', title: 'The Legend of Cumhead', items: [{ label: started ? 'CONTINUE' : 'NEW GAME', cls: 'hot', def: true, fn: startGame },
    started ? { label: 'NEW GAME', fn: function () { KIT.confirm({ title: 'Start Again?', sub: 'Your save is wiped.', yesLabel: 'Start again', yes: function () { SV = freshSave(); DGN = {}; persist(); startGame(); }, no: titleMenu }); } } : null, { label: 'HOW TO PLAY', fn: helpMenu }] });
}
music.songs.lctitle = { bpm: 96, beats: 4, vol: 0.85, wet: 0.5, lead: 'pulse', harm: 1, bass: 'drive', acc: 'arp8', drums: 'rock', chords: 'Bb Bb Ab Bb Bb Bb Ab Bb Gb Gb Ab Ab Bb Bb F F', mel: 'bb4 - - - f4 - bb4 bb4 | c5 d5 eb5 f5 - - - - | f5 - f5 - gb5 - ab5 - | bb5 - - - - - - - | bb5 - ab5 - gb5 - ab5 - | gb5 - f5 - - - - - | f5 - eb5 - f5 - gb5 - | f5 - eb5 - db5 - eb5 - | db5 - - - eb5 - f5 - | eb5 - db5 - c5 - - - | c5 - d5 - e5 - g5 - | f5 - - - - - . . | bb4 - - - d5 - f5 - | bb5 - - - a5 - f5 - | f5 - - - - - - - | c5 - - - - - . .' };
music.songs.lcover = { bpm: 128, beats: 4, vol: 0.85, wet: 0.35, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'shuffle', chords: 'C G Am F C G F G', mel: 'e5 - g5 - c6 - b5 - | a5 - g5 - d5 - - - | c5 - e5 - a5 - g5 - | f5 - a5 - c6 - - - | e6 - d6 - c6 - g5 - | b5 - d6 - g5 - - - | a5 - c6 - f6 - e6 - | d6 - - - b5 - - -' };
KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu, startPauses: true,
  pad: { btns: [{ k: 'a', label: 'A', sub: 'SAUSAGE', cls: 'big' }, { k: 'b', label: 'B', sub: 'ITEM' }, { k: 'y', label: 'Y', sub: 'SWITCH' }] } });
titleMenu();
window.__lc = { G: G, get P() { return P; }, get SV() { return SV; }, get SCR() { return SCR; }, get FOE() { return FOE; }, get BOSS() { return BOSS; }, get DG() { return DG; }, get ROOM() { return ROOM; }, startGame: startGame, loadOver: loadOver, enterDungeon: enterDungeon, enterRoom: enterRoom, buildDungeon: buildDungeon, freshSave: function () { SV = freshSave(); DGN = {}; }, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } } };
