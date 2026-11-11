/* ---------- the loop and the menus ---------- */
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode === 'cut') { stepCut(dt); return; }
  if (G.mode === 'race') { stepRace(dt); return; }
  if (G.mode === 'karate') { stepKarate(dt); return; }
  if (G.mode !== 'play' || !P) return; G.time += dt;
  stepPlayer(dt);
}
function storyMenu() {
  var list = ['cumhead', 'greebo', 'spermaid', 'lab'].map(function (k) { var S = STORIES[k], d = storyDone(k), n = SV.prog[k]; return { label: S.n + (d ? '  ·  DONE' : n ? '  ·  ' + Math.round(n / S.ev.length * 100) + '%' : ''), fn: function () { if (d) { KIT.confirm({ title: S.n, sub: 'Play it again from the start?', yesLabel: 'From the start', yes: function () { SV.prog[k] = 0; persist(); playStory(k); }, no: storyMenu }); } else playStory(k); } }; });
  if (allFour()) list.push({ label: STORIES.super.n + (storyDone('super') ? '  ·  DONE' : ''), cls: 'hot', fn: function () { if (storyDone('super')) SV.prog.super = 0; playStory('super'); } });
  KIT.menu({ title: 'Pick a Story', items: list.concat([{ label: 'BACK', back: true, fn: titleMenu }]) });
}
function freeMenu() { var list = []; Object.keys(SV.stars).forEach(function (k) { var w = k.split(':'); if (STAGES[w[1]]) list.push({ label: CHARS[w[0]].n + '  ·  ' + STAGES[w[1]].n, fn: function () { STORY = null; startRun({ who: w[0], stage: w[1] }); } }); });
  KIT.menu({ title: 'Free Play', sub: list.length ? 'Stages you have cleared' : 'Clear stages in the stories first', items: list.concat([{ label: 'WALK CUM CITY', fn: function () { STORY = null; enterHub('city'); } }, { label: 'BACK', back: true, fn: titleMenu }]) }); }
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left stick / WASD, <b>camera</b> right stick / arrow keys. <b>A</b> jump. In the hub, <b>B</b> goes through a portal or talks.</p><p><b>Cumhead</b>: A in the air is the homing attack, hold B to rev a spin dash and let go. <b>Greebo</b>: hold A in the air to glide, run into tall walls to climb them, B punches; the radar at the bottom finds ingredients. <b>Spermaid</b>: swims anywhere there is water (A up, B down), B is a tail spin. <b>Laboozie</b>: hold B to lock on to everything in front, let go to throw a Flaming Bag of Shit at each.</p><p>Drops keep you alive: get hit and they scatter. Hit with none and you lose a life. Bosses: hit them when they are dizzy (jump on them, homing attack, punch, tail or bags). Some stages give you a homunculus egg for the Garden.</p><p><b>The Garden</b> is behind the Clubhouse door in Cum City: shake trees for fruit, carry it to a homunculus to feed it, hatch eggs on the nests, and carry a homunculus (B) to the race track, the karate ring, the Academy, the job board or the hat stand.</p>',
  items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode !== 'play') return; KIT.menu({ cls: 'clear', title: 'Paused', items: [{ label: 'CARRY ON', back: true, def: true, fn: KIT.closeMenu }, LV && LV.hub === undefined ? { label: 'BACK TO THE HUB', fn: function () { enterHub(RUN.stage ? STAGES[RUN.stage].hub : 'city'); } } : null, { label: 'HOW TO PLAY', fn: helpMenu }, R3.ok ? R3.resItem(pauseMenu) : null, { label: 'TITLE', fn: titleMenu }] }); }
function titleMenu() { G.mode = 'title'; LV = null; P = null; STORY = null; music.play('hogtitle');
  KIT.menu({ cls: 'clear', logo: '../assets/sa-logo.webp', title: 'Spermhog Adventure', items: [{ label: 'STORIES', cls: 'hot', def: true, fn: storyMenu }, { label: 'HOMUNCULUS GARDEN', fn: openGarden }, { label: 'FREE PLAY', fn: freeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }], note: 'Stars ' + Object.keys(SV.stars).length + '  ·  Drops ' + SV.drops + '  ·  Homunculi ' + SV.homs.length }); }
KIT.setKeymap({ ArrowLeft: 'sleft', ArrowRight: 'sright', ArrowUp: 'sup', ArrowDown: 'sdown', Space: 'a', KeyJ: 'a', KeyK: 'b', ShiftLeft: 'b' });
KIT.start({ w: W, h: H, flex: 720, update: update, draw: draw, idleUpdate: function (dt) { G.t += dt; }, onPause: pauseMenu, startPauses: true,
  pad: { sticks: true, btns: [{ k: 'a', label: 'A', sub: 'JUMP', cls: 'big' }, { k: 'b', label: 'B', sub: 'ACTION' }] }, padKeys: { l: 'a', r: 'd', u: 'w', d: 's', a: 'z', b: 'x', x: 'c', y: 'v', lb: 'q', rb: 'e' } });
titleMenu();
window.__sa = { G: G, get P() { return P; }, get LV() { return LV; }, get BOSS() { return BOSS; }, get SV() { return SV; }, startRun: startRun, enterHub: enterHub, playStory: playStory, openGarden: openGarden, startRace: startRace, startKarate: startKarate, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, freshSave: function () { SV = freshSave(); }, hitBoss: hitBoss, finish: finish, get GD() { return GD; } };
