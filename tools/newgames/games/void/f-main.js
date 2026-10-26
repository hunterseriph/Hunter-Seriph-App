/* ---------- start, load, title ---------- */
function townStart(id) { var T = buildTown(id), b = T.blds.filter(function (q) { return q.id === T.sp.start; })[0]; return b ? { x: b.door.x, y: b.door.y + 1 } : { x: 2, y: 20 }; }
function newGame() { S = newSave(); var st = townStart('C'); enter('town', 'C', 0, st.x, st.y, 'd'); say(STORY.intro); }
function loadGame() {
  S = KIT.load('jv-save', null); if (!S) return newGame(); var m = S.map || {};
  S.party.forEach(function (p) { p.limit = p.limit || 0; });
  if (!S.v) { S.v = 2; if (m.k === 'town') { var st = townStart(m.id === 'E' ? 'C' : m.id); m = { k: 'town', id: m.id, x: st.x, y: st.y, dir: 'd' }; if (m.id === 'E') { m.x = 2; m.y = 20; } } } // towns were rebuilt
  if (m.k === 'dun') { G.worldPos = worldSpot(m.id); }
  if (m.k === 'room') { var T = buildTown(m.id), b = T.blds.filter(function (q) { return q.id === m.bld; })[0]; if (!b) { m = { k: 'town', id: m.id, x: 2, y: 20 }; } }
  enter(m.k, m.id, m.floor || 0, m.x, m.y, m.dir || 'd', m.bld);
}
function titleMenu() {
  G.mode = 'title'; BT = null; DLG = null; UI = []; music.play('jvtitle');
  var sv = KIT.load('jv-save', null);
  KIT.menu({ cls: 'clear', logo: '../assets/jv-logo.webp', title: 'Journey to the Void', sub: 'Cumhead, Spermaid and Greebo set out to find the Void.',
    items: [sv ? { label: 'CONTINUE', sub: sv.party.map(function (m) { return HEROES[m.id].name + ' Lv ' + m.lv; }).join(' · '), fn: function () { KIT.closeMenu(); loadGame(); }, cls: 'hot', def: true } : null,
      { label: 'NEW JOURNEY', sub: sv ? 'Starts over (your save is kept until you save again)' : '', fn: function () { KIT.closeMenu(); newGame(); }, cls: sv ? '' : 'hot', def: !sv }, { label: 'HOW TO PLAY', fn: helpMenu }].filter(Boolean) });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> with the d-pad, stick or WASD/arrows. Hold <b>B</b> (X key) to hurry. <b>A</b> (Z) talks, opens chests and touches crystals. Walk into a door to go inside. <b>Start</b> / Esc / the pause button opens the menu.</p><p><b>Battles</b> run on TIME bars, like Final Fantasy VII. When a hero\'s bar fills, their commands open (time waits while you pick): ATTACK, SKILL, ITEM, DEFEND, RUN. B on the commands passes to the next hero who is ready. Getting hurt fills the LIMIT bar; when it is full, ATTACK becomes that hero\'s Limit Break.</p><p>Foes can be WEAK to cream (Cumhead), water (Spermaid) or pie (Greebo). Inns, your own bed in the Clubhouse and red crystals heal you and save. Potbelly Arcade has every one of our games in its cabinets.</p><p>Find the three keys, then go north behind the mountains.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'field') KIT.closeMenu(); else titleMenu(); } }] });
}
function drawTitle() {
  R('#000000', 0, 0, W, H); for (var s = 0; s < 60; s++) R(s % 4 ? '#3a2a4a' : '#ffe36a', (s * 71 + G.t * 4) % W, (s * 37) % H, 1, 1);
  spr('jv_void' + (Math.floor(G.t * 2) % 2), W / 2, 150 + Math.sin(G.t) * 4, { sc: 0.9, alpha: 0.85 });
  spr('ch_idle' + (Math.floor(G.t * 7) % 7), 190, 262); spr('spermaid_s' + (Math.floor(G.t * 5) % 3), 240, 262); spr('greebo_s' + (Math.floor(G.t * 5) % 3), 290, 262);
}

/* ---------- loop ---------- */
function update(dt) {
  G.t += dt; if (S) S.t += dt;
  if (G.inArcade) return;
  if (G.mode === 'field') fieldUpdate(dt);
  else if (G.mode === 'battle') battleUpdate(dt);
}
function draw() {
  if (G.mode === 'title' || G.mode === 'over' || !S) { drawTitle(); return; }
  if (G.mode === 'battle' && BT) { drawBattle(); drawDlg(); return; }
  drawField();
}
music.songs.jvtitle = { bpm: 76, beats: 4, vol: 0.95, wet: 0.65, lead: 'organlead', bass: 'drone', acc: 'organ', drums: null, chords: 'Em C G D Em C Am B',
  mel: 'b4 - - - e5 - - - | g5 - - - e5 - c5 - | d5 - - - b4 - g4 - | a4 - - - f#4 - - - | e4 - - - b4 - e5 - | g5 - - - c6 - - - | a5 - - - e5 - c5 - | b4 - - - d#5 - - -' };
music.songs.jvworld = { bpm: 108, beats: 4, vol: 0.85, wet: 0.4, lead: 'pulse', bass: 'walk', acc: 'arp8', drums: 'rock', chords: 'Dm Bb F C Dm Bb Gm A',
  mel: 'a4 - d5 - f5 - a5 - | bb5 - - - f5 - d5 - | c5 - f5 - a5 - c6 - | g5 - - - e5 - c5 - | d5 - f5 - a5 - d6 - | d6 - c6 - bb5 - f5 - | g5 - bb5 - d6 - g6 - | e6 - - - c#6 - - -',
  counter: 'f4 - - - a4 - - - | d4 - - - f4 - - - | a4 - - - c5 - - - | e4 - - - g4 - - - | f4 - - - a4 - - - | d4 - - - f4 - - - | bb4 - - - d5 - - - | a4 - - - e4 - - -' };
music.songs.jvbattle = { bpm: 160, beats: 4, vol: 0.88, wet: 0.2, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'boss', chords: 'Am F G E Am F Dm E',
  mel: 'e5 . e5 a5 . c6 . e6 | f6 . e6 . c6 - a5 - | d6 . b5 . g5 . b5 d6 | e6 - - - g#5 - b5 - | a5 . c6 e6 . a6 . g6 | f6 e6 d6 c6 a5 - - - | d6 . f6 . a6 . f6 d6 | b5 - g#5 - e5 - - -' };
music.songs.jvwin = { bpm: 130, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'C G F G', mel: 'c6 . c6 . c6 - g5 - | a5 - b5 - c6 - - - | f5 - a5 - c6 - f6 - | e6 - d6 - b5 - g5 -' };
music.songs.aohub = { bpm: 116, beats: 4, vol: 0.85, wet: 0.35, lead: 'pulse', harm: 1, bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'Am F C G Am F E E',
  mel: 'a5 . c6 . e6 . a5 . | f5 . a5 . c6 . a5 . | g5 . c6 . e6 . g6 . | d6 . b5 . g5 . b5 . | a5 . c6 . e6 . a6 . | g6 . f6 . e6 . c6 . | b5 . g#5 . e5 . g#5 . | b5 - - - e6 - - -' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: function () { if (G.mode === 'field') fieldMenu(); },
  pad: { four: true, btns: [{ k: 'a', label: 'A' }, { k: 'b', label: 'B' }] } });
titleMenu();
window.__jv = { G: G, get S() { return S; }, get P() { return P; }, get BT() { return BT; }, get DLG() { return DLG; }, get UI() { return UI; }, newGame: newGame, loadGame: loadGame, enter: enter, startBattle: startBattle, foeStats: foeStats, enterDungeon: enterDungeon,
  step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, skipDlg: function () { var g = 0; while (DLG && g++ < 200) { var d = DLG; DLG = null; if (d.done) d.done(); } }, stat: stat, maxHp: maxHp, xpNext: xpNext, ZONES: ZONES,
  buildTown: buildTown, fieldMenu: fieldMenu, shopUI: shopUI, arcadeMenu: arcadeMenu, BUILDINGS: BUILDINGS };
