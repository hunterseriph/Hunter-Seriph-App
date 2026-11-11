/* ---------- the stories and the hub ---------- */
var STORY = null; // which story you are playing
function curEv(who) { var S = STORIES[who]; return S.ev[SV.prog[who]] || null; }
function storyDone(who) { return SV.prog[who] >= STORIES[who].ev.length; }
function allFour() { return ['cumhead', 'greebo', 'spermaid', 'lab'].every(storyDone); }
function storyWants(po) { if (!STORY) return false; var e = curEv(STORY); return e && ((e.stage && po.k === 'stage' && po.id === e.stage) || (e.boss && po.k === 'boss')); }
function playStory(who) { STORY = who; advance(); }
function advance() {
  var who = STORY, e = curEv(who);
  if (!e) { endStory(who); return; }
  if (e.say) { showSay(e.say, function () { SV.prog[who]++; persist(); advance(); }); return; }
  var hub = e.stage ? STAGES[e.stage].hub : e.hub || 'city'; enterHub(hub);
}
function enterHub(h) { var walker = STORY === 'super' ? 'cumhead' : (STORY || 'cumhead'); startRun({ who: walker, hub: h }); var e = STORY && curEv(STORY); if (e && e.boss && (e.hub || 'city') === h) LV.portals.push({ k: 'boss', x: 0, z: 10, n: 'BOSS: ' + BOSSES[e.boss].n }); G.banner = { t: 3, s: HUBS[h].n, b: e ? (e.stage ? 'NEXT: ' + STAGES[e.stage].n : e.boss ? 'NEXT: ' + BOSSES[e.boss].n : '') : STORY ? 'STORY DONE' : '' }; }
function hubStep(dt) {
  var p = P; G.prompt = null; G.act = null;
  LV.portals.forEach(function (po) { if (Math.hypot(po.x - p.x, po.z - p.z) > 2.2) return; G.prompt = 'B  ' + po.n; G.act = function () {
    if (po.k === 'hub') enterHub(po.to);
    else if (po.k === 'garden') openGarden();
    else if (po.k === 'boss') { var e = curEv(STORY); startRun({ who: e.who || STORY, boss: e.boss, ev: 1 }); }
    else if (po.k === 'stage') { var e2 = STORY && curEv(STORY); if (e2 && e2.stage === po.id) startRun({ who: STORY, stage: po.id, ev: 1 }); else if (SV.stars[(STORY || 'cumhead') + ':' + po.id]) startRun({ who: STORY || 'cumhead', stage: po.id }); else { G.banner = { t: 2, s: 'NOT YET', b: 'THE STORY HAS NOT COME HERE' }; sfx.play('no'); } } }; });
  LV.npcs.forEach(function (n) { if (Math.hypot(n.x - p.x, n.z - p.z) < 2.2 && !G.prompt) { G.prompt = 'B  TALK'; G.act = function () { G.banner = { t: 3, s: n.say }; }; } });
  if (G.act && KIT.pressed('b')) { var f = G.act; G.act = null; f(); }
}
function clearMenu() {
  var ev = RUN.ev && STORY, e = ev && curEv(STORY); if (e && ((RUN.stage && e.stage === RUN.stage) || (RUN.boss && e.boss === RUN.boss))) { SV.prog[STORY]++; persist(); }
  KIT.menu({ title: RUN.boss ? 'Boss Down' : 'Stage Clear', sub: (RUN.stage ? STAGES[RUN.stage].n : BOSSES[RUN.boss].n) + '  ·  ' + P.rings + ' drops', html: G.egg ? '<p style="text-align:center;color:#ffe36a">You found a homunculus egg! It is waiting in the Garden.</p>' : '',
    items: [STORY ? { label: 'CARRY ON', def: true, fn: advance } : { label: 'BACK TO THE HUB', def: true, fn: function () { enterHub(RUN.stage ? STAGES[RUN.stage].hub : 'city'); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function endStory(who) { STORY = null; persist(); var html = who === 'super' ? '<p>The seven chalices clatter onto the street, just cups again. TB is sat in the gutter laughing at nothing. Cumhead, Greebo, Spermaid and Laboozie go for a drink. Not at TB\'s.</p>' : '<p>' + STORIES[who].n + ' is done.' + (allFour() && !storyDone('super') ? ' Something is happening in the sky over Cum City... the last story is open.' : '') + '</p>';
  KIT.menu({ title: who === 'super' ? 'The End' : 'Story Done', html: html, items: [{ label: 'TITLE', def: true, back: true, fn: titleMenu }] }); }
/* the say screens: who speaks, their picture, the line */
var SAY = null;
function showSay(lines, done) { SAY = { lines: lines, i: 0, t: 0, done: done }; G.mode = 'say'; KIT.closeMenu(); music.play('hogtitle'); }
var FACE = { CUMHEAD: 'ch_idle0', GREEBO: 'greebo_s0', SPERMAID: 'spermaid_s0', LABOOZIE: 'lab_idle0', TB: 'npc_tb', AMY: 'npc_amy' };
function stepSay(dt) { SAY.t += dt; if (SAY.t > 0.3 && (KIT.pressed('a') || KIT.pressed('b') || KIT.ptr.tap)) { SAY.i++; SAY.t = 0; sfx.play('blip'); if (SAY.i >= SAY.lines.length) { var d = SAY.done; SAY = null; G.mode = 'menu'; d(); } } }
function drawSay() { var c = KIT.ctx, Wd = KIT.W, Hd = KIT.H; c.fillStyle = '#070405'; c.fillRect(0, 0, Wd, Hd); if (!SAY) return; var L = SAY.lines[SAY.i], who = L[0];
  c.fillStyle = '#1a0a10'; c.fillRect(0, Hd * 0.1, Wd, Hd * 0.55); c.fillStyle = '#c4121c'; c.beginPath(); c.arc(Wd * 0.5, Hd * 0.32, 60, 0, 6.3); c.fill();
  KIT.spr(FACE[who] || 'ch_idle0', Wd / 2, Hd * 0.6, { sc: who === 'TB' ? 4 : 2.4 });
  KIT.panel(16, Hd * 0.66, Wd - 32, Hd * 0.3); KIT.text(who, 30, Hd * 0.66 + 10, { size: 8, col: who === 'TB' ? '#ff2630' : '#ffe36a' }); KIT.wrap(L[1], Wd - 70, 15, 'body').forEach(function (s, n) { KIT.text(s, 30, Hd * 0.66 + 26 + n * 16, { font: 'body', size: 15 }); }); KIT.text('A', Wd - 30, Hd - 22, { size: 8, col: '#a6968f' }); }
