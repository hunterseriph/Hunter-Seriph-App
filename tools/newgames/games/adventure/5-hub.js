/* ---------- the stories, the hubs and the cutscenes ---------- */
var STORY = null; // which story you are playing
function curEv(who) { var S = STORIES[who]; return S.ev[SV.prog[who]] || null; }
function storyDone(who) { return SV.prog[who] >= STORIES[who].ev.length; }
function allFour() { return ['cumhead', 'greebo', 'spermaid', 'lab'].every(storyDone); }
function storyWants(po) { if (!STORY) return false; var e = curEv(STORY); return e && ((e.stage && po.k === 'stage' && po.id === e.stage) || (e.boss && po.k === 'boss')); }
function playStory(who) { STORY = who; advance(); }
function advance() {
  var who = STORY, e = curEv(who);
  if (!e) { endStory(who); return; }
  if (e.say) { showSay(e, function () { SV.prog[who]++; persist(); advance(); }); return; }
  var hub = e.stage ? STAGES[e.stage].hub : e.hub || 'city'; enterHub(hub);
}
function enterHub(h) { var walker = STORY === 'super' ? 'cumhead' : (STORY || SV.walker || 'cumhead'); startRun({ who: walker, hub: h }); var e = STORY && curEv(STORY);
  if (e && e.boss && (e.hub || 'city') === h) LV.portals.push({ k: 'boss', x: 0, y: 0, z: h === 'city' ? 8 : 10, n: 'BOSS: ' + BOSSES[e.boss].n });
  if (h === 'garden') gardenEnter();
  G.banner = { t: 3, s: HUBS[h].n, b: e ? (e.stage ? 'NEXT: ' + STAGES[e.stage].n : e.boss ? 'NEXT: ' + BOSSES[e.boss].n : '') : STORY ? 'STORY DONE' : '' }; }
function hubStep(dt) {
  var p = P; G.prompt = null; G.act = null;
  LV.portals.forEach(function (po) { if (Math.hypot(po.x - p.x, po.z - p.z) > 2.4 || Math.abs((po.y || 0) - p.y) > 2) return; G.prompt = 'B  ' + po.n; G.act = function () {
    if (po.k === 'hub') { if (LV.hub === 'garden') gardenLeave(); enterHub(po.to); }
    else if (po.k === 'garden') enterHub('garden');
    else if (po.k === 'boss') { var e = curEv(STORY); startRun({ who: e.who || STORY, boss: e.boss, ev: 1 }); }
    else if (po.k === 'stage') { var e2 = STORY && curEv(STORY); if (e2 && e2.stage === po.id) startRun({ who: STORY, stage: po.id, ev: 1 }); else if (SV.stars[(STORY || p.who) + ':' + po.id]) startRun({ who: STORY || p.who, stage: po.id }); else { G.banner = { t: 2, s: 'NOT YET', b: 'THE STORY HAS NOT COME HERE' }; sfx.play('no'); } } }; });
  LV.npcs.forEach(function (n) { if (Math.hypot(n.x - p.x, n.z - p.z) < 2.4 && !G.prompt && !(n.rig === 'spermaidN' && p.who === 'spermaid')) { G.prompt = 'B  TALK TO ' + n.name; G.act = function () { n.talk = 2.5; G.note = n.name + ': "' + n.say + '"'; G.noteT = 4; sfx.play('blip'); }; } });
  if (LV.steve && Math.hypot(LV.steve.x - p.x, LV.steve.z - p.z) < 3 && !G.prompt) { G.prompt = 'B  STEVE'; G.act = function () { G.note = 'Steve waves. Steve always waves.'; G.noteT = 3; sfx.play('blip'); }; }
  if (LV.hub === 'garden') gardenStep(dt);
  if (G.act && KIT.pressed('b')) { var f = G.act; G.act = null; f(); }
}
function clearMenu() { if (G.mode !== 'clear' || !RUN || (!RUN.stage && !RUN.boss)) return;
  var ev = RUN.ev && STORY, e = ev && curEv(STORY); if (e && ((RUN.stage && e.stage === RUN.stage) || (RUN.boss && e.boss === RUN.boss))) { SV.prog[STORY]++; persist(); }
  KIT.menu({ title: RUN.boss ? 'Boss Down' : 'Stage Clear', sub: (RUN.stage ? STAGES[RUN.stage].n : BOSSES[RUN.boss].n) + '  ·  ' + P.rings + ' drops  ·  ' + fmtT(G.time), html: G.egg ? '<p style="text-align:center;color:#ffe36a">You found a homunculus egg! It is waiting on a nest in the Garden.</p>' : '',
    items: [STORY ? { label: 'CARRY ON', def: true, fn: advance } : { label: 'BACK TO THE HUB', def: true, fn: function () { enterHub(RUN.stage ? STAGES[RUN.stage].hub : 'city'); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
function endStory(who) { STORY = null; persist(); var html = who === 'super' ? '<p>The seven chalices clatter onto the street, just cups again. TB is sat in the gutter laughing at nothing. Cumhead, Greebo, Spermaid and Shithead Laboozie go for a drink. Not at TB\'s.</p>' : '<p>' + STORIES[who].n + ' is done.' + (allFour() && !storyDone('super') ? ' Something is happening in the sky over Cum City...' : '') + '</p>';
  KIT.menu({ title: who === 'super' ? 'The End' : 'Story Done', html: html, items: [{ label: 'TITLE', def: true, back: true, fn: titleMenu }] }); }
/* ---------- the cutscenes: played out in 3D where the story is, everyone acting, the camera on whoever speaks ---------- */
var CUT = null, SPOT = { city: { x: 0, z: 9 }, park: { x: 0, z: -14 }, isles: { x: 0, z: -18 } };
var WHO = { CUMHEAD: 'cumhead', GREEBO: 'greebo', SPERMAID: 'spermaid', LABOOZIE: 'lab', 'SHITHEAD LABOOZIE': 'lab', TB: 'tb' };
function showSay(ev, done) {
  if (!R3.ok) { done(); return; }
  buildAtlas(); buildAdvRigs(); KIT.closeMenu(); var at = ev.at || 'city'; LV = buildHub(at); LV.npcs = []; buildMesh(); P = null; BOSS = null; FX = []; SHOTS = [];
  var sp = SPOT[at] || SPOT.city, cast = ev.cast || ['cumhead'], n = cast.length, actors = cast.map(function (id, i) { var a = (i - (n - 1) / 2) * 0.55, r = 3.2; return { id: id, x: sp.x + Math.sin(a) * r, y: 0, z: sp.z + Math.cos(a) * r, a: a + Math.PI, t: 0 }; });
  if (ev.fx === 'roofs') { actors[1].x = -12; actors[1].y = 10.4; actors[1].z = -20; actors[2].x = 14; actors[2].y = 8.4; actors[2].z = -14; }
  if (ev.fx === 'run') { actors[1].x0 = actors[1].x + 18; }
  if (ev.fx === 'blacksea' || ev.fx === 'clean') { actors.forEach(function (a) { a.z -= 6; }); }
  CUT = { ev: ev, lines: ev.say, i: -1, t: 0, lt: 0, done: done, actors: actors, eye: null, at: null, fx: ev.fx, sp: sp };
  G.mode = 'cut'; CAMO = { eye: [sp.x + 8, 6, sp.z - 10], at: [sp.x, 1.2, sp.z] }; music.play(ev.fx === 'supertb' ? 'hogboss' : HUBS[at].song);
}
function cutActor(name) { var id = WHO[name]; return CUT.actors.filter(function (a) { return a.id === id; })[0] || CUT.actors[0]; }
function stepCut(dt) {
  var C0 = CUT; if (!C0) return; C0.t += dt; C0.lt += dt; var est = 3.2;
  if (C0.i < 0 && C0.t > est) { C0.i = 0; C0.lt = 0; }
  if ((KIT.pressed('a') || KIT.ptr.tap) && C0.lt > 0.35) { if (C0.i < 0) { C0.i = 0; C0.lt = 0; } else { C0.i++; C0.lt = 0; sfx.play('blip'); } }
  if (KIT.pressed('b') || KIT.pressed('start')) C0.i = C0.lines.length;
  if (C0.i >= C0.lines.length) { var d = C0.done; CUT = null; CAMO = null; G.mode = 'menu'; d(); return; }
  // what happens
  var fx = C0.fx, sp = C0.sp;
  if (fx === 'chalice') { C0.cy = Math.max(1.1, 40 - C0.t * 14); if (C0.cy <= 1.1 && !C0.landed) { C0.landed = 1; KIT.shake(8); sfx.play('boom'); } }
  if (fx === 'blacksea') LV.blackSea = C0.t > 1.6; if (fx === 'ship' && LV.ship) { LV.ship.x = -40 + C0.t * 10; LV.ship.y = 16; LV.ship.z = sp.z + 4; }
  if (fx === 'run') { var g = C0.actors[1]; if (g.x0 !== undefined) { g.runX = Math.max(0, 1 - C0.t / 2.4); } }
  if (fx === 'supertb') { C0.rise = Math.min(1, Math.max(0, (C0.t - 1) / 3)); if (C0.t > 1 && C0.t < 4) KIT.shake(2); }
  if (fx === 'end' && Math.random() < 0.3) FX.push({ ring: 1, x: sp.x + (Math.random() - 0.5) * 8, y: 12, z: sp.z + (Math.random() - 0.5) * 8, vx: 0, vy: 0, vz: 0, t: 4 });
  FX.forEach(function (f) { if (f.ring) { f.vy -= 14 * dt; f.y += f.vy * dt; if (f.y < 0.2) { f.y = 0.2; f.vy = Math.abs(f.vy) * 0.5; } } f.t -= dt; }); FX = FX.filter(function (f) { return f.t > 0; });
  // the camera: a slow establishing move, then onto whoever speaks
  var eye, at;
  if (C0.i < 0) { var k = C0.t / est;
    if (fx === 'chalice') { eye = [sp.x + 6, 1.2, sp.z - 8]; at = [sp.x, 1.5 + (C0.cy || 1) * 0.6, sp.z]; }
    else if (fx === 'supertb') { var tb = cutActor('TB'); eye = [tb.x + Math.sin(k * 2) * 9, 2 + k * 3, tb.z - 9]; at = [tb.x, 2 + C0.rise * 6, tb.z]; }
    else if (fx === 'ship') { eye = [sp.x, 2, sp.z - 12]; at = [LV.ship.x, LV.ship.y, LV.ship.z]; }
    else if (fx === 'roofs') { eye = [sp.x, 3 + k * 6, sp.z - 6]; at = [sp.x, 8, sp.z - 18]; }
    else { var r = 14 - k * 6; eye = [sp.x + Math.sin(0.8 - k * 0.8) * r, 3 + (1 - k) * 5, sp.z - Math.cos(0.8 - k * 0.8) * r]; at = [sp.x, 1.3, sp.z]; } }
  else { var L = C0.lines[C0.i], s = cutActor(L[0]), dir = [Math.sin(s.a), Math.cos(s.a)], side = C0.i % 2 ? 1 : -1, hy = s.y + (L[0] === 'TB' && fx === 'supertb' ? 2 + C0.rise * 6 : 1.5);
    eye = [s.x + dir[0] * 2.6 - dir[1] * side * 1.0, hy + 0.2, s.z + dir[1] * 2.6 + dir[0] * side * 1.0]; at = [s.x, hy, s.z];
    if (L[0] === 'TB' && fx === 'supertb') { eye = [s.x + dir[0] * 7, hy - 2, s.z + dir[1] * 7]; } }
  if (!C0.eye) { C0.eye = eye; C0.at = at; } var e2 = C0.i < 0 ? 0.25 : 0.08; for (var q = 0; q < 3; q++) { C0.eye[q] += (eye[q] - C0.eye[q]) * e2; C0.at[q] += (at[q] - C0.at[q]) * e2; } CAMO = { eye: C0.eye, at: C0.at };
}
function drawActors() { var C0 = CUT; if (!C0) return; var t = G.t, L = C0.i >= 0 ? C0.lines[C0.i] : null;
  C0.actors.forEach(function (a, i) { var Q = pose0(), speaking = L && WHO[L[0]] === a.id, x = a.x + (a.runX ? a.runX * 18 : 0), y = a.y;
    if (a.runX > 0) poseWalk(Q, t * 14, 1, true);
    else if (speaking) { Q.sh[1] = [1.2 + Math.sin(t * 6) * 0.35, 0.35, 0.5]; Q.el[1] = 1.0 + Math.sin(t * 5) * 0.3; Q.hp = Math.sin(t * 4) * 0.08; if (a.id === 'tb') { Q.lean = -0.15 + Math.sin(t * 14) * 0.05; Q.hp = -0.3; Q.sh[0] = [0.8, 0.9, 0]; } }
    if (C0.fx === 'hold' && i === 0) { Q.sh = [[2.9, 0.2], [2.9, 0.2]]; Q.el = [0.3, 0.3]; }
    if (C0.fx === 'end' && a.id !== 'tb') { Q.sh = [[2.8, 0.5], [2.8, 0.5]]; y += Math.abs(Math.sin(t * 6 + i)) * 0.4; }
    if (C0.fx === 'end' && a.id === 'tb') { Q.bodyY = 0.3; Q.bp = -1.3; Q.hp = 0.5; }
    if (C0.fx === 'supertb' && a.id === 'tb') { var s = 1 + C0.rise * 1.8; drawRig(RIGS.tbmad, a.x, y + C0.rise * 4, a.z, a.a, Q, { sc: s, tint: [0.6 - C0.rise * 0.2, 0.3, 0.45] }); for (var c = 0; c < 7; c++) { var ca = t * 1.5 + c / 7 * 6.283; R3.draw(propMesh('chalice'), ATT, { m: R3.model(a.x + Math.cos(ca) * 3, y + 2 + C0.rise * 6 + Math.sin(t * 3 + c) * 0.4, a.z + Math.sin(ca) * 3, t, 0, 0, 0.8), lit: false }); } return; }
    if (a.id === 'gimp') { drawRig(RIGS.gimp, x, y, a.z, Math.atan2(C0.sp.x - x, C0.sp.z - a.z), Q, {}); return; }
    drawChar(a.id === 'tb' ? 'tb' : a.id, x, y, a.z, a.runX > 0 ? -Math.PI / 2 : a.a, Q, {}); });
  if (C0.fx === 'chalice' && C0.cy) R3.draw(propMesh('chalice'), ATT, { m: R3.model(C0.sp.x, C0.cy - 1.1, C0.sp.z, t * 2, 0, 0, 1.2), lit: false, tint: [1.4, 1.3, 1] });
  if (C0.fx === 'hold') { var h = C0.actors[0]; R3.draw(propMesh('chalice'), ATT, { m: R3.model(h.x, h.y + 2.55, h.z, t, 0, 0, 0.8), lit: false }); }
  if (C0.fx === 'pie') { var g = C0.actors[0]; bxpOnce(); R3.draw(PIEM, ATT, { m: R3.model(g.x + Math.sin(g.a) * 1.4, 0, g.z + Math.cos(g.a) * 1.4, 0, 0, 0) }); }
}
var PIEM = null; function bxpOnce() { if (PIEM) return; var m = M(); tub(m, [0, 0, 0], [0, 0.9, 0], 0.08, 0.08, '#5a3a24', 6); tub(m, [0, 0.9, 0], [0, 1.0, 0], 1.0, 1.0, '#5a3a24', 14, { cap: 1 }); tub(m, [0, 1.0, 0], [0, 1.3, 0], 0.85, 0.9, '#d8a050', 14, { cap: 1 }); ell(m, 0, 1.32, 0, 0.82, 0.25, 0.82, '#fff6dc', 14, 6, { b1: 1.6 }); ell(m, 0, 1.55, 0, 0.12, 0.12, 0.12, '#c4121c', 8, 5); PIEM = m.upload(); }
function cutHud() { var Wd = KIT.W, Hd = KIT.H, C0 = CUT; if (!C0) return; KIT.R('#000000', 0, 0, Wd, Math.round(Hd * 0.09)); KIT.R('#000000', 0, Hd - Math.round(Hd * 0.09), Wd, Math.round(Hd * 0.09));
  if (C0.i < 0) { KIT.text('B  SKIP', Wd - 10, Hd - 14, { align: 'right', size: 6, col: '#a6968f' }); return; }
  var L = C0.lines[C0.i]; if (!L) return; var lines = KIT.wrap(L[1], Wd - 80, 15, 'body'), bh = 26 + lines.length * 16, y0 = Hd - Math.round(Hd * 0.09) - bh - 6;
  KIT.panel(16, y0, Wd - 32, bh); KIT.text(L[0], 30, y0 + 8, { size: 8, col: L[0] === 'TB' ? '#ff2630' : '#ffe36a' }); lines.forEach(function (s, n) { KIT.text(s, 30, y0 + 22 + n * 16, { font: 'body', size: 15, alpha: Math.min(1, C0.lt * 4) }); });
  KIT.text('A', Wd - 30, y0 + bh - 14, { size: 8, col: Math.floor(G.t * 3) % 2 ? '#ffe36a' : '#a6968f' }); }
