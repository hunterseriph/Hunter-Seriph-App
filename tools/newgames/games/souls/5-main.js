/* ---------- the loop and the menus ---------- */
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode === 'dead') { G.deadT += dt; if (G.deadT > 3.2) { var c = SV.candle; enterArea(candleArea(c), c); } return; }
  if (G.mode !== 'play' || !P) return;
  if (G.hs > 0) { G.hs -= dt; return; } // a moment's stop when a hit lands
  stepPlayer(dt); stepFoes(dt); stepBoss(dt);
  if (P.hp <= 0) die();
}
function candleMenu(c) {
  var tbHere = c.id === 'ruins0';
  KIT.menu({ title: 'The Candle', sub: AREAS[candleArea(c.id)].name + ' · ' + SV.loads + ' Loads', items: [
    { label: 'LEVEL UP', sub: 'Level ' + SV.lvl + ' · next costs ' + lvlCost(), fn: function () { levelMenu(c); } },
    { label: 'EQUIPMENT', fn: function () { equipMenu(c); } },
    { label: 'TRAVEL', fn: function () { travelMenu(c); } },
    tbHere ? { label: 'TALK TO TB', fn: function () { tbMenu(c); } } : null,
    { label: 'LEAVE', back: true, def: true, fn: KIT.closeMenu }] });
}
function levelMenu(c) {
  var cost = lvlCost(), can = SV.loads >= cost;
  function up(k) { if (SV.loads < cost) return; KIT.confirm({ title: 'Level Up', sub: { vig: 'Vigour: more health', end: 'Endurance: more stamina', str: 'Strength: harder hits' }[k], price: cost, have: SV.loads, unit: 'LOADS', yesLabel: 'Level up', yes: function () { SV.loads -= cost; SV[k]++; SV.lvl++; P.hp = maxHp(); P.sta = maxSta(); persist(); sfx.play('power'); levelMenu(c); }, no: function () { levelMenu(c); } }); }
  KIT.menu({ title: 'Level ' + SV.lvl, sub: SV.loads + ' Loads · next level ' + cost, items: [
    { label: 'VIGOUR ' + SV.vig, sub: 'Health ' + maxHp(), dis: !can, fn: function () { up('vig'); } }, { label: 'ENDURANCE ' + SV.end, sub: 'Stamina ' + maxSta(), dis: !can, fn: function () { up('end'); } },
    { label: 'STRENGTH ' + SV.str, sub: 'Damage x' + dmgK().toFixed(2), dis: !can, fn: function () { up('str'); } }, { label: 'BACK', back: true, fn: function () { candleMenu(c); } }] });
}
function equipMenu(c) {
  KIT.menu({ title: 'Equipment', items: SV.wpns.map(function (w) { var W0 = WEAPONS[w]; return { label: (SV.wpn === w ? '▶ ' : '') + W0.n, sub: W0.d + ' (' + W0.dmg + ' / ' + W0.heavy + ')', fn: function () { SV.wpn = w; persist(); equipMenu(c); } }; })
    .concat([{ label: 'RING: ' + (SV.ring ? RINGS[SV.ring].n : 'NONE'), sub: SV.ring ? RINGS[SV.ring].d : (SV.rings.length ? 'Pick one' : 'Find rings in chests'), dis: !SV.rings.length, fn: function () { var l = [null].concat(SV.rings), i = l.indexOf(SV.ring); SV.ring = l[(i + 1) % l.length]; P.hp = Math.min(P.hp, maxHp()); persist(); equipMenu(c); } }, { label: 'BACK', back: true, fn: function () { candleMenu(c); } }]) });
}
function travelMenu(c) {
  var list = []; AREAS.forEach(function (A, ai) { [0, 1, 2, 3].forEach(function (n) { var id = A.id + n; if (SV.lit[id]) list.push({ label: A.name + ' ' + ['I', 'II', 'III', 'IV'][n], fn: function () { SV.candle = id; enterArea(ai, id); } }); }); });
  KIT.menu({ title: 'Travel', items: list.concat([{ label: 'BACK', back: true, fn: function () { candleMenu(c); } }]) });
}
function tbMenu(c) {
  var q = TBQ[Math.floor(Math.random() * TBQ.length)];
  KIT.menu({ title: "TB's Stall", sub: '"' + q + '"', items: SHOP.map(function (it) { var have = it.k === 'shard' ? (SV.bought.shard || 0) : SV.bought[it.k] ? 1 : 0, sold = have >= it.max;
    return { label: it.n + (sold ? '  ·  SOLD OUT' : '  ·  ' + it.cost), sub: it.d, dis: sold, fn: function () { KIT.confirm({ title: it.n, sub: it.d, price: it.cost, have: SV.loads, unit: 'LOADS', yes: function () { SV.loads -= it.cost; SV.bought[it.k] = (SV.bought[it.k] || 0) + 1;
      if (it.k === 'shard') SV.shards++; else if (it.k[0] === 'w') SV.wpns.push(it.k.slice(2)); else SV.rings.push(it.k.slice(2)); persist(); sfx.play('coin'); tbMenu(c); }, no: function () { tbMenu(c); } }); } }; })
    .concat([{ label: 'BACK', back: true, fn: function () { candleMenu(c); } }]) });
}
function ending() {
  G.mode = 'end'; SV.won++; persist(); music.play('dkruins');
  KIT.menu({ title: 'The Age of Cum', html: '<p>TB slumps on his throne of pill bottles, laughing to himself, and goes still. Behind the throne there is a candle that has never been lit. You could light it and sit here for ever, king of a dead keep. Or you could blow it out.</p><p>You blow it out. Somewhere far above, in Cum City, the street lamps come back on.</p><p style="color:#a6968f">Deaths ' + SV.deaths + ' · Level ' + SV.lvl + '</p>',
    items: [{ label: 'NEW GAME+', sub: 'Keep your level and gear, the foes hit harder', def: true, fn: function () { var keep = { lvl: SV.lvl, vig: SV.vig, end: SV.end, str: SV.str, wpns: SV.wpns, rings: SV.rings, shards: SV.shards, wpn: SV.wpn, ring: SV.ring, won: SV.won, deaths: SV.deaths, bought: SV.bought }; SV = freshSave(); for (var k in keep) SV[k] = keep[k]; persist(); enterArea(0, 'ruins0'); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p>The buttons are laid out like Elden Ring.</p><p><b>Controller:</b> left stick move, right stick camera. <b>RB</b> attack, <b>RT</b> heavy (hold to charge), <b>LB</b> guard, <b>LT</b> weapon skill (costs FP, the blue bar). <b>B</b> tap to roll (no direction steps back), hold to sprint. <b>A</b> jump. <b>X</b> drink from the Cum Flask. <b>Y</b> use (candles, chests, doors). <b>R3</b> lock on (flick the right stick to switch; with nothing to lock on to it swings the camera behind you). <b>L3</b> crouch.</p><p><b>Keyboard and mouse:</b> WASD move, mouse or arrows camera (click the picture). Left click or <b>J</b> attack, Shift + left click or <b>K</b> heavy, right click or <b>L</b> guard, Shift + right click or <b>U</b> skill, <b>Space</b> roll / sprint, <b>F</b> jump, <b>R</b> flask, <b>E</b> use, <b>Q</b> or middle click lock on, <b>Ctrl</b> crouch.</p><p>Attack straight out of a roll for a rolling attack. Jump over sweeps and ground slams; attack in the air to come down on them. Heavy straight after blocking a hit is a guard counter. Guard just as a hit lands to parry; break a foe\'s stance or parry it, then attack in front of it for a critical hit. Big hits knock you down: you cannot be hurt on the floor, and dodge rolls you out early. Landing hits fills your FP. A light weapon rolls further and faster than a heavy one.</p><p>Every swing, roll, jump and guard costs stamina (the green bar). Sprinting only tires you while something is fighting you. Rest at candles to heal and refill your flask and FP, but the dead get back up. Spend your Loads on levels at a candle.</p><p>When you die your Loads stay where you fell (the red glow). Get back to them without dying again. Fall into a chasm and you die. Some doors only open from the far side: they are shortcuts. Bosses wait behind the white fog.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') sysMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode !== 'play') return; if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {} KIT.menu({ cls: 'clear', title: 'Paused', sub: AREAS[SV.area].name + ' · Level ' + SV.lvl, items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }] }); }
function optsMenu() { KIT.menu({ title: 'Options', items: [R3.ok ? R3.resItem(optsMenu) : null, { label: 'BACK', back: true, fn: function () { if (G.mode === 'play') sysMenu(); else titleMenu(); } }] }); }
function titleMenu() {
  G.mode = 'title'; WORLD = null; P = null; music.play('dkcath'); if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {}
  var started = SV.deaths || SV.lvl > 1 || Object.keys(SV.lit).length > 1;
  KIT.menu({ cls: 'clear', logo: '../assets/dk-logo.webp', title: 'Dark Loads', items: [{ label: started ? 'CONTINUE' : 'NEW GAME', cls: 'hot', def: true, fn: function () { enterArea(candleArea(SV.candle), SV.candle); } },
    started ? { label: 'NEW GAME', fn: function () { KIT.confirm({ title: 'Start Again?', sub: 'Everything you have is lost.', yesLabel: 'Start again', yes: function () { SV = freshSave(); persist(); enterArea(0, 'ruins0'); }, no: titleMenu }); } } : null, { label: 'HOW TO PLAY', fn: helpMenu }] });
}
music.songs.dkruins = { bpm: 66, beats: 4, vol: 0.8, wet: 0.7, lead: 'organlead', bass: 'drone', acc: 'organ', drums: null, chords: 'Em Em C B Em Am B B', mel: 'e5 - - - g5 - - - | f#5 - - - e5 - - - | e5 - - - c6 - - - | b5 - - - - - - - | g5 - - - b5 - e6 - | d6 - c6 - a5 - - - | b5 - - - d#6 - - - | b5 - - - - - - -' };
music.songs.dkcath = { bpm: 58, beats: 4, vol: 0.85, wet: 0.8, lead: 'organlead', harm: 1, bass: 'drone', acc: 'organ', drums: null, chords: 'Dm Bb Gm A Dm F C A', mel: 'd5 - - - f5 - - - | e5 - - - d5 - - - | g5 - - - bb5 - - - | a5 - - - - - - - | f5 - - - a5 - d6 - | c6 - - - a5 - - - | g5 - e5 - c5 - e5 - | c#5 - - - - - - -' };
music.songs.dkdepths = { bpm: 72, beats: 3, vol: 0.85, wet: 0.6, lead: 'xylo', bass: 'waltz', acc: 'stabs', drums: 'waltz', chords: 'Am Am E E Am Dm E E', mel: 'a4 - c5 - e5 - | d5 - c5 - b4 - | g#4 - b4 - e5 - | d5 - - - - - | a4 - e5 - a5 - | f5 - e5 - d5 - | c5 - b4 - g#4 - | e4 - - - - -' };
music.songs.dkthrone = { bpm: 80, beats: 4, vol: 0.85, wet: 0.6, lead: 'organlead', harm: 1, bass: 'drone', acc: 'organ', drums: 'slow', chords: 'Cm Ab Fm G Cm Ab Db G', mel: 'c5 - - - eb5 - g5 - | ab5 - - - g5 - - - | f5 - ab5 - c6 - - - | b5 - - - g5 - - - | c6 - - - eb6 - - - | ab5 - c6 - f6 - - - | db6 - c6 - ab5 - f5 - | g5 - - - b5 - d6 -' };
(function () { var st = document.createElement('style'); st.textContent = '@media (orientation:landscape){#acts{grid-template-columns:repeat(4,auto);gap:8px}}'; document.head.appendChild(st); })(); // eight buttons: four across when the phone is sideways
// update 146: Elden Ring's layout. The controller's face buttons and bumpers come in as F13-F18 (padKeys below) so the keyboard is free for its own keys
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'sup', ArrowDown: 'sdown', F13: 'a', F14: 'b', F15: 'x', F16: 'y', F17: 'lb', F18: 'rb',
  Space: 'b', KeyF: 'a', KeyE: 'y', KeyR: 'x', KeyJ: 'rb', KeyK: 'rt', KeyL: 'lb', KeyU: 'lt', KeyQ: 'r3', Tab: 'r3', ControlLeft: 'l3', ControlRight: 'l3', KeyC: 'l3', ShiftLeft: 'shift', ShiftRight: 'shift', KeyZ: 'a', KeyX: 'b', KeyV: 'y', KeyI: 'y' });
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, onPause: pauseMenu, startPauses: true,
  pad: { sticks: true, btns: [{ k: 'b', label: 'B', sub: 'ROLL', cls: 'big' }, { k: 'rb', label: 'RB', sub: 'HIT' }, { k: 'rt', label: 'RT', sub: 'HEAVY' }, { k: 'a', label: 'A', sub: 'JUMP' }, { k: 'lb', label: 'LB', sub: 'GUARD' }, { k: 'lt', label: 'LT', sub: 'SKILL' }, { k: 'x', label: 'X', sub: 'FLASK' }, { k: 'r3', label: 'R3', sub: 'LOCK' }] },
  padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'F13', b: 'F14', x: 'F15', y: 'F16', lb: 'F17', rb: 'F18' } });
titleMenu();
window.__dk = { G: G, get P() { return P; }, get SV() { return SV; }, get FOE() { return FOE; }, get BOSS() { return BOSS; }, get WORLD() { return WORLD; }, enterArea: enterArea, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, freshSave: function () { SV = freshSave(); }, tk: tk, th: th, tx: tx, tileOf: tileOf, passable: passable };
