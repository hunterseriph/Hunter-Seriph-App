/* ---------- battles: ATB like Final Fantasy VII ----------
   Everyone has a TIME bar. When a hero's fills, their command window opens (time waits while you choose);
   when a foe's fills, it acts. Actions play out one at a time, each with its own animation: the fighter steps
   out, the effect plays, the numbers pop, they step back. Taking hits fills the LIMIT bar; a full one swaps
   ATTACK for that hero's Limit Break. */
var BGS = { waste: ['#1a0408', '#3a0a10', '#5a1a14'], forest: ['#0a0a06', '#1a1a10', '#2a2018'], castle: ['#14080e', '#2a1018', '#3e1820'], sewer: ['#141008', '#2a2214', '#4a3a20'],
  park: ['#100410', '#2a0820', '#4a0e2a'], bone: ['#100c08', '#2a241c', '#4a4030'], moon: ['#120204', '#3a0610', '#6a0a14'], lair: ['#0e0208', '#2a0618', '#4a0a2a'], void: ['#000000', '#0a0410', '#1a0a2a'] };
var LIMITS = {
  cumhead: { n: 'Overdrive Load', d: 'A beam of everything. Hits every foe four times.' },
  spermaid: { n: "Ocean's Embrace", d: 'Heals and revives the whole party, then drowns the foes.' },
  greebo: { n: 'Nine Course Meal', d: 'Nine pies, one after another, at random foes.' }
};
var FIGHT_ANIM = { cumhead: 'punch', spermaid: 'tail', greebo: 'claw' };
var SKILL_ANIM = { loadshot: 'shot', lockin: 'aura', burst: 'burst', super: 'beam', spin: 'spin', mend: 'heal', splash: 'splash', tidal: 'wave', rise: 'pillar', song: 'heal', riptide: 'wave',
  pietoss: 'pie', swipe: 'claw3', gourmet: 'heal', steal: 'steal', barrage: 'pies', nine: 'pillar' };
function startBattle(form, boss) {
  BT = { foes: form.foes, bg: form.bg, boss: boss, phase: 'intro', t: 0, ready: [], acts: [], anim: null, pops: [], fx: [], msg: '', menu: null, round: 0 };
  S.party.forEach(function (m, i) { m.st = {}; m.guard = false; m.atb = alive(m) ? 0.25 + Math.random() * 0.45 + i * 0.05 : 0; m.limit = m.limit || 0; m.off = 0; });
  BT.foes.forEach(function (f) { f.atb = Math.random() * 0.4; f.off = 0; });
  layoutFoes();
  G.mode = 'battle'; sfx.play('roar'); music.play(boss ? BOSSES[form.foes[0].id].song : 'jvbattle'); BT.flash = 0.5; BT.swirl = 0.7;
}
function layoutFoes() {
  var fs = BT.foes.filter(function (f) { return !f.gone; }), n = fs.length;
  fs.forEach(function (f, i) { if (f.boss) { f.x = 130; f.y = 178; } else { var col = i % 2, row = Math.floor(i / 2); f.x = 70 + col * 92 + (n === 1 ? 50 : 0); f.y = 110 + row * 44 + col * 18 + (n <= 2 ? 30 : 0); } });
}
function partyPos(i) { return { x: 362 + i * 30, y: 98 + i * 34 }; }
function liveFoes() { return BT.foes.filter(function (f) { return f.hp > 0 && !f.gone; }); }
function liveParty() { return S.party.filter(alive); }
function atbRate(spd) { return 0.16 + spd * 0.011; }
function battleUpdate(dt) {
  if (DLG) { dlgUpdate(dt); return; }
  BT.t += dt; if (BT.flash > 0) BT.flash -= dt; if (BT.swirl > 0) BT.swirl -= dt;
  BT.pops.forEach(function (p) { p.t -= dt; p.vy += 260 * dt; p.y += p.vy * dt; if (p.y > p.y0) { p.y = p.y0; p.vy = -p.vy * 0.35; } }); BT.pops = BT.pops.filter(function (p) { return p.t > 0; });
  BT.fx.forEach(function (f) { f.t += dt; }); BT.fx = BT.fx.filter(function (f) { return f.t < f.life; });
  S.party.forEach(function (m) { if (m.hurtT > 0) m.hurtT -= dt; });
  BT.foes.forEach(function (f) { if (f.flash > 0) f.flash -= dt; if (f.hp <= 0 && !f.gone) { f.fade = (f.fade || 0) + dt; if (f.fade > 0.7) f.gone = true; } });
  if (BT.phase === 'intro') { if (BT.t > 1.0) { BT.phase = 'run'; BT.msg = ''; } return; }
  if (BT.phase === 'win' || BT.phase === 'lose') { BT.endT -= dt; if (BT.endT <= 0) { if (BT.phase === 'win') endWin(); else gameOver(); } return; }
  if (BT.menu) { battleMenuInput(); return; } // time waits while you choose
  if (BT.anim) { animUpdate(dt); return; }
  if (!liveFoes().length) return win();
  if (!liveParty().length) return lose();
  if (BT.acts.length) { startAnim(BT.acts.shift()); return; }
  // TIME bars fill
  S.party.forEach(function (m) { if (!alive(m)) { m.atb = 0; return; } if (m.atb < 1) { m.atb = Math.min(1, m.atb + atbRate(stat(m, 'spd')) * (m.st.haste ? 1.5 : 1) * dt); if (m.atb >= 1 && BT.ready.indexOf(m) < 0) { BT.ready.push(m); sfx.play('tick'); } } });
  liveFoes().forEach(function (f) { f.atb += atbRate(f.spd) * (f.boss ? 1.35 : 1) * dt; if (f.atb >= 1) { f.atb = 0; BT.acts.push({ k: 'foe', who: f }); } });
  if (BT.ready.length && !BT.acts.length) openCommand(BT.ready[0]);
  BT.timer = (BT.timer || 0) + dt; if (BT.timer > 4) { BT.timer = 0; tickStatus(); }
}
function tickStatus() { // poison bites, buffs run out, every few seconds
  S.party.forEach(function (m) { if (!alive(m)) return; if (m.st.poison) { var d = Math.max(1, Math.round(maxHp(m) * 0.05)); m.hp = Math.max(1, m.hp - d); popAt(m, String(d), '#9aff5a'); m.st.poison--; } if (m.st.lock) m.st.lock--; if (m.st.blind) m.st.blind--; });
  BT.foes.forEach(function (f) { if (f.roar) f.roar--; if (f.blind) f.blind--; });
}
/* ---------- choosing ---------- */
function openCommand(m) {
  if (!alive(m)) { BT.ready.shift(); return; }
  var full = m.limit >= 1;
  BT.menu = { m: m, lv: 'cmd', cur: 0, cmds: [full ? 'LIMIT' : 'ATTACK', 'SKILL', 'ITEM', 'DEFEND', 'RUN'] }; sfx.play('blip');
}
function closeChoice(act) {
  var m = BT.menu.m; BT.menu = null; BT.ready.shift(); m.atb = 0; if (act) { BT.acts.unshift(act); if (act.k === 'item') S.inv[act.item]--; }
}
function battleMenuInput() {
  var M = BT.menu, m = M.m;
  if (M.lv === 'cmd') {
    var n = M.cmds.length; if (KIT.pressed('down')) { M.cur = (M.cur + 1) % n; sfx.play('tick'); } if (KIT.pressed('up')) { M.cur = (M.cur + n - 1) % n; sfx.play('tick'); }
    var tp = tapRects(cmdRects()); if (tp >= 0) M.cur = tp;
    if (KIT.pressed('b') && BT.ready.length > 1) { BT.ready.push(BT.ready.shift()); BT.menu = null; sfx.play('back'); return; } // pass to the next ready hero
    if (KIT.pressed('a') || tp >= 0) {
      var c = M.cmds[M.cur]; sfx.play('select');
      if (c === 'ATTACK') { M.pend = { k: 'fight', who: m }; toTarget('one'); }
      else if (c === 'LIMIT') { var L = m.id === 'spermaid' ? 'allies' : m.id === 'cumhead' ? 'all' : 'all'; M.pend = { k: 'limit', who: m, tg: L }; closeChoice(M.pend); }
      else if (c === 'SKILL') { M.list = skillsOf(m).map(function (s) { return { label: s.n, right: s.mp, dis: m.mp < s.mp, v: s, d: s.d }; }); M.kind = 'skill'; M.lv = 'list'; M.sub = 0; }
      else if (c === 'ITEM') { M.list = Object.keys(S.inv).filter(function (k) { return S.inv[k] > 0; }).map(function (k) { return { label: ITEMS[k].n, right: S.inv[k], v: k, d: ITEMS[k].d }; }); if (!M.list.length) { sfx.play('no'); return; } M.kind = 'item'; M.lv = 'list'; M.sub = 0; }
      else if (c === 'DEFEND') { m.guard = true; closeChoice(null); popAt(m, 'DEFEND', '#7af0ff'); }
      else if (c === 'RUN') { if (BT.boss) { sfx.play('no'); BT.msg = 'No running from this one.'; return; } closeChoice({ k: 'run', who: m }); }
    }
    return;
  }
  if (M.lv === 'list') {
    var n2 = M.list.length; if (KIT.pressed('down')) { M.sub = Math.min(n2 - 1, M.sub + 2); sfx.play('tick'); } if (KIT.pressed('up')) { M.sub = Math.max(0, M.sub - 2); sfx.play('tick'); }
    if (KIT.pressed('right') && M.sub % 2 === 0 && M.sub + 1 < n2) { M.sub++; sfx.play('tick'); } if (KIT.pressed('left') && M.sub % 2 === 1) { M.sub--; sfx.play('tick'); }
    var tp2 = tapRects(listRects(M)); if (tp2 >= 0) M.sub = tp2;
    if (KIT.pressed('b')) { M.lv = 'cmd'; sfx.play('back'); return; }
    if (KIT.pressed('a') || tp2 >= 0) { var it = M.list[M.sub]; if (!it || it.dis) { sfx.play('no'); return; } sfx.play('select');
      if (M.kind === 'skill') { M.pend = { k: 'skill', who: m, s: it.v }; toTarget(it.v.tg); } else { M.pend = { k: 'item', who: m, item: it.v }; toTarget(ITEMS[it.v].tg); } }
    return;
  }
  if (M.lv === 'target') {
    var n3 = M.tl.length; if (KIT.pressed('down') || KIT.pressed('right')) { M.tc = (M.tc + 1) % n3; sfx.play('tick'); } if (KIT.pressed('up') || KIT.pressed('left')) { M.tc = (M.tc + n3 - 1) % n3; sfx.play('tick'); }
    var tp3 = -1; if (KIT.ptr.tap) M.tl.forEach(function (t, i) { var r = targetRect(t); if (KIT.ptr.x >= r[0] && KIT.ptr.x <= r[0] + r[2] && KIT.ptr.y >= r[1] && KIT.ptr.y <= r[1] + r[3]) tp3 = i; }); if (tp3 >= 0) M.tc = tp3;
    if (KIT.pressed('b')) { M.lv = M.pend.k === 'fight' ? 'cmd' : 'list'; sfx.play('back'); return; }
    if (KIT.pressed('a') || tp3 >= 0) { sfx.play('select'); M.pend.target = M.tl[M.tc]; closeChoice(M.pend); }
  }
}
function toTarget(tg) {
  var M = BT.menu; M.pend.tg = tg;
  if (tg === 'all' || tg === 'allies' || tg === 'self' || tg === 'rand3') { closeChoice(M.pend); return; }
  M.tl = tg === 'one' ? liveFoes() : tg === 'deadally' ? S.party.filter(function (q) { return !alive(q); }) : liveParty();
  if (!M.tl.length) { sfx.play('no'); M.lv = 'cmd'; return; }
  M.tc = 0; M.lv = 'target';
}
/* ---------- the actions, with their animations ---------- */
function startAnim(a) {
  var actorAlive = a.k === 'foe' ? a.who.hp > 0 && !a.who.gone : alive(a.who); if (!actorAlive) return;
  var kind;
  if (a.k === 'foe') { a.sk = foePick(a.who); kind = 'f_' + a.sk; }
  else if (a.k === 'fight') kind = FIGHT_ANIM[a.who.id];
  else if (a.k === 'skill') kind = SKILL_ANIM[a.s.id] || 'aura';
  else if (a.k === 'item') kind = ITEMS[a.item].dmg ? 'throw' : 'drink';
  else if (a.k === 'limit') kind = 'limit_' + a.who.id;
  else kind = 'run';
  var dur = { beam: 2.2, spin: 1.8, wave: 1.7, pies: 2.0, limit_cumhead: 3.0, limit_spermaid: 2.6, limit_greebo: 3.0, burst: 1.6, claw3: 1.4, f_all: 1.4, f_summon: 1.2 }[kind] || 1.15;
  BT.anim = { a: a, kind: kind, t: 0, dur: dur, hits: [], did: {} };
  var nm = a.k === 'foe' ? a.who.n : heroName(a.who);
  BT.label = a.k === 'skill' ? a.s.n : a.k === 'limit' ? LIMITS[a.who.id].n : a.k === 'item' ? ITEMS[a.item].n : a.k === 'foe' && a.sk !== 'hit' ? FOE_SKILL_NAME[a.sk] : null;
  BT.msg = nm;
  if (a.k === 'skill') { if (a.who.mp < a.s.mp) { BT.msg = nm + ' is out of MP.'; BT.anim.dur = 0.6; BT.anim.kind = 'none'; return; } a.who.mp -= a.s.mp; }
  if (a.k === 'limit') { a.who.limit = 0; BT.flash = 0.25; }
  if (a.k !== 'foe') a.who.guard = false;
}
var FOE_SKILL_NAME = { all: 'Rampage', fire: 'Hellfire', blizzard: 'Black Ice', drain: 'Drain', poison: 'Poison Bite', blind: 'Muck in the Eyes', roar: 'Roar', explode: 'Pop', summon: 'Call for Help', nothing: 'Nothing' };
function foePick(f) { var sk = f.sk.length && Math.random() < (f.boss ? 0.55 : 0.33) ? pick(f.sk) : 'hit'; if (sk === 'summon' && liveFoes().length >= 4) sk = 'hit'; return sk; }
function animUpdate(dt) {
  var A = BT.anim, a = A.a; A.t += dt; var k = A.t / A.dur;
  // step out and back
  var out = k < 0.18 ? k / 0.18 : k > 0.82 ? (1 - k) / 0.18 : 1;
  if (a.k === 'foe') a.who.off = out * 14; else a.who.off = out * (A.kind === 'punch' || A.kind === 'claw' || A.kind === 'steal' || A.kind === 'spin' ? 0 : 26);
  animFx(A, dt);
  if (A.t >= A.dur) { if (a.k !== 'foe') a.who.off = 0; else a.who.off = 0; BT.anim = null; BT.label = null; BT.msg = '';
    if (A.ran) { BT.phase = 'win'; BT.endT = 0.6; BT.ran = true; } }
}
function at(A, time, key) { if (A.t >= time && !A.did[key]) { A.did[key] = 1; return true; } return false; }
function heroXY(m) { var p = partyPos(S.party.indexOf(m)); return { x: p.x - (m.off || 0), y: p.y }; }
function foeXY(f) { var sz = KIT.size(KIT.has(f.s + '0') ? f.s + '0' : f.s), k = f.boss ? 1 : 1.5; return { x: f.x + (f.off || 0), y: f.y - sz.h * k * 0.5, h: sz.h * k, w: sz.w * k }; }
function fx(o) { o.t = 0; BT.fx.push(o); }
function animFx(A, dt) {
  var a = A.a, m = a.who, K = A.kind, t = A.t;
  if (K === 'none') return;
  var tgt = function () { return retarget(a.target, 'one'); };
  if (K === 'punch' || K === 'tail' || K === 'claw') { // run up to the foe and hit
    var T = tgt(); if (!T) return; var from = partyPos(S.party.indexOf(m)), to = foeXY(T), kk = t < 0.35 ? t / 0.35 : t > 0.8 ? Math.max(0, 1 - (t - 0.8) / 0.35) : 1;
    m.off = (from.x - (to.x + to.w / 2 + 16)) * kk;
    if (at(A, 0.42, 'hit')) { var d = physDmg(m, T, 1); hitFoe(m, T, d); fx({ k: K === 'claw' ? 'claws' : K === 'tail' ? 'splashring' : 'star', x: to.x, y: to.y, life: 0.4 }); if (K === 'tail') for (var i = 0; i < 10; i++) fx({ k: 'drop', x: to.x, y: to.y, vx: rnd(-80, 80), vy: rnd(-140, -40), life: 0.6, c: '#9adfff' }); }
    return;
  }
  if (K === 'shot' || K === 'pie' || K === 'throw') {
    var T2 = tgt(), f0 = heroXY(m); if (!T2) return; var t2 = foeXY(T2);
    if (at(A, 0.25, 'go')) fx({ k: K === 'pie' ? 'pieproj' : K === 'throw' ? 'chilliproj' : 'blob', x0: f0.x - 14, y0: f0.y - 30, x1: t2.x, y1: t2.y, life: 0.4, arc: K !== 'shot' ? 40 : 6 });
    if (at(A, 0.65, 'hit')) { if (K === 'throw') { useItem(a.item, a.target, a.tg, m); for (var j = 0; j < 14; j++) fx({ k: 'drop', x: t2.x, y: t2.y, vx: rnd(-120, 120), vy: rnd(-160, -40), life: 0.7, c: j % 2 ? '#ff9a30' : '#ff2630' }); return; }
      var d2 = physDmg(m, T2, a.s.pow, a.s.el); hitFoe(m, T2, d2); fx({ k: K === 'pie' ? 'splat' : 'creamsplat', x: t2.x, y: t2.y, life: 0.6 }); if (a.s.st === 'blind' && Math.random() < 0.6) { T2.blind = 3; popFoe(T2, 'BLIND', '#a6968f', 14); } }
    return;
  }
  if (K === 'aura') { if (at(A, 0.1, 'a')) for (var q = 0; q < 16; q++) fx({ k: 'rise', x: heroXY(m).x + rnd(-14, 14), y: heroXY(m).y, vy: rnd(-80, -40), life: 0.9, c: '#ffe36a', delay: q * 0.03 }); if (at(A, 0.6, 'b')) { m.st.lock = 3; popAt(m, 'LOCKED IN', '#ffe36a'); } return; }
  if (K === 'heal' || K === 'drink') {
    var ts = a.k === 'item' ? null : a.s.tg === 'allies' ? liveParty() : [retarget(a.target, 'ally')];
    if (at(A, 0.15, 'a')) (ts || [a.tg === 'allies' ? null : retarget(a.target, a.tg === 'deadally' ? 'dead' : 'ally')]).forEach(function (q) { var p = q ? heroXY(q) : { x: 400, y: 150 }; for (var i = 0; i < 12; i++) fx({ k: 'fall', x: p.x + rnd(-16, 16), y: p.y - 70 - rnd(0, 20), vy: rnd(60, 110), life: 0.7, c: i % 2 ? '#7dff9a' : '#ffffff' }); });
    if (at(A, 0.6, 'b')) { if (a.k === 'item') useItem(a.item, a.target, a.tg, m); else ts.forEach(function (q) { if (!q) return; var h = Math.round(stat(m, 'mag') * a.s.pow + a.s.base); q.hp = Math.min(maxHp(q), q.hp + h); popAt(q, String(h), '#7dff9a'); if (a.s.cure) q.st = {}; }); sfx.play('magic'); }
    return;
  }
  if (K === 'pillar') { // bring the fallen back
    var dead = a.s.tg === 'allies' ? S.party.filter(function (q) { return !alive(q); }) : [a.target];
    if (at(A, 0.1, 'a')) dead.forEach(function (q) { if (q) fx({ k: 'pillar', x: partyPos(S.party.indexOf(q)).x, y: partyPos(S.party.indexOf(q)).y, life: 1 }); });
    if (at(A, 0.7, 'b')) { dead.forEach(function (q) { if (q && !alive(q)) { q.hp = Math.round(maxHp(q) * a.s.pow); q.atb = 0.3; popAt(q, 'UP!', '#7dff9a'); } }); sfx.play('magic'); }
    return;
  }
  if (K === 'splash') { var T3 = tgt(); if (!T3) return; var t3 = foeXY(T3); if (at(A, 0.2, 'a')) for (var r = 0; r < 18; r++) fx({ k: 'fall', x: t3.x + rnd(-20, 20), y: t3.y - 60 - rnd(0, 40), vy: rnd(160, 240), life: 0.5, c: '#9adfff', delay: r * 0.015 }); if (at(A, 0.65, 'h')) hitFoe(m, T3, magDmg(m, T3, a.s.pow, a.s.el)); return; }
  if (K === 'wave') { if (at(A, 0.2, 'a')) fx({ k: 'wave', life: 1.2 }); if (at(A, 0.85, 'h')) liveFoes().forEach(function (f) { hitFoe(m, f, magDmg(m, f, a.s.pow, a.s.el)); }); return; }
  if (K === 'burst') { if (at(A, 0.3, 'a')) liveFoes().forEach(function (f, i) { var p = foeXY(f), h0 = heroXY(m); fx({ k: 'blob', x0: h0.x - 14, y0: h0.y - 30, x1: p.x, y1: p.y, life: 0.35, arc: 30 }); });
    if (at(A, 0.7, 'h')) liveFoes().forEach(function (f) { var p = foeXY(f); fx({ k: 'creamsplat', x: p.x, y: p.y, life: 0.7 }); hitFoe(m, f, physDmg(m, f, a.s.pow, a.s.el)); }); return; }
  if (K === 'beam') { var T4 = tgt(); if (!T4) return; if (at(A, 0.1, 'c')) { fx({ k: 'charge', x: heroXY(m).x, y: heroXY(m).y - 24, life: 1 }); BT.dim = 1.2; }
    if (at(A, 1.0, 'b')) { fx({ k: 'beam', x0: heroXY(m).x - 10, y: heroXY(m).y - 24, x1: foeXY(T4).x, life: 0.7 }); KIT.shake(8); } if (at(A, 1.25, 'h')) hitFoe(m, T4, physDmg(m, T4, a.s.pow, a.s.el)); return; }
  if (K === 'spin') { var fl = liveFoes(); var kk2 = t < 1.4 ? t / 1.4 : 1; var sx = 380 - kk2 * 380; m.off = 380 - sx - 0; A.spinX = sx;
    fl.forEach(function (f, i) { if (!A.did['s' + i] && sx < f.x + 10) { A.did['s' + i] = 1; hitFoe(m, f, physDmg(m, f, a.s.pow, a.s.el)); fx({ k: 'star', x: foeXY(f).x, y: foeXY(f).y, life: 0.3 }); } }); if (t > 1.4) m.off = 0; return; }
  if (K === 'claw3') { for (var c3 = 0; c3 < 3; c3++) if (at(A, 0.25 + c3 * 0.3, 'c' + c3)) { var Tr = pick(liveFoes()); if (Tr) { hitFoe(m, Tr, physDmg(m, Tr, a.s.pow)); fx({ k: 'claws', x: foeXY(Tr).x, y: foeXY(Tr).y, life: 0.35 }); } } return; }
  if (K === 'steal') { var T5 = tgt(); if (!T5) return; var fr5 = partyPos(S.party.indexOf(m)), to5 = foeXY(T5), kk5 = t < 0.35 ? t / 0.35 : t > 0.8 ? Math.max(0, 1 - (t - 0.8) / 0.35) : 1; m.off = (fr5.x - (to5.x + to5.w / 2 + 16)) * kk5;
    if (at(A, 0.45, 'h')) { var g = Math.round(T5.drops * 0.4 + 10); S.drops += g; popFoe(T5, '+' + g + ' DROPS', '#ffe36a'); for (var i5 = 0; i5 < 8; i5++) fx({ k: 'drop', x: to5.x, y: to5.y, vx: rnd(40, 160), vy: rnd(-160, -60), life: 0.7, c: '#ffe36a' }); sfx.play('coin'); } return; }
  if (K === 'pies') { for (var p6 = 0; p6 < 5; p6++) { if (at(A, 0.2 + p6 * 0.28, 'p' + p6)) { var T6 = pick(liveFoes()); if (!T6) break; A['t' + p6] = T6; var h6 = heroXY(m), t6 = foeXY(T6); fx({ k: 'pieproj', x0: h6.x - 14, y0: h6.y - 30, x1: t6.x, y1: t6.y, life: 0.28, arc: 30 }); }
      if (at(A, 0.48 + p6 * 0.28, 'h' + p6) && A['t' + p6]) { var T7 = A['t' + p6], q7 = foeXY(T7); hitFoe(m, T7, physDmg(m, T7, a.s.pow * 0.4, a.s.el)); fx({ k: 'splat', x: q7.x, y: q7.y, life: 0.5 }); } } return; }
  if (K === 'limit_cumhead') { if (at(A, 0.1, 'c')) { BT.dim = 2.6; fx({ k: 'charge', x: heroXY(m).x, y: heroXY(m).y - 24, life: 1.4 }); sfx.play('power'); }
    for (var b7 = 0; b7 < 4; b7++) if (at(A, 1.4 + b7 * 0.3, 'b' + b7)) { fx({ k: 'beam', x0: heroXY(m).x - 10, y: heroXY(m).y - 24 - (b7 % 2) * 10, x1: 20, life: 0.25 }); KIT.shake(6); liveFoes().forEach(function (f) { hitFoe(m, f, physDmg(m, f, 1.1, 'cream')); }); } return; }
  if (K === 'limit_spermaid') { if (at(A, 0.1, 'a')) S.party.forEach(function (q) { var p = partyPos(S.party.indexOf(q)); fx({ k: 'pillar', x: p.x, y: p.y, life: 1 }); });
    if (at(A, 0.8, 'h')) { S.party.forEach(function (q) { var was = alive(q); q.hp = was ? Math.min(maxHp(q), q.hp + Math.round(maxHp(q) * 0.6)) : Math.round(maxHp(q) * 0.5); q.st = {}; popAt(q, was ? 'HEALED' : 'UP!', '#7dff9a'); }); sfx.play('magic'); }
    if (at(A, 1.2, 'w')) fx({ k: 'wave', life: 1.2 }); if (at(A, 1.9, 'd')) liveFoes().forEach(function (f) { hitFoe(m, f, magDmg(m, f, 2.4, 'water')); }); return; }
  if (K === 'limit_greebo') { for (var p8 = 0; p8 < 9; p8++) if (at(A, 0.2 + p8 * 0.27, 'p' + p8)) { var T8 = pick(liveFoes()); if (!T8) break; var h8 = heroXY(m), t8 = foeXY(T8); fx({ k: 'pieproj', x0: h8.x - 14, y0: h8.y - 30, x1: t8.x, y1: t8.y, life: 0.25, arc: 26 }); hitFoe(m, T8, physDmg(m, T8, 0.9, 'pie')); fx({ k: 'splat', x: t8.x, y: t8.y, life: 0.5 }); } return; }
  if (K === 'run') { if (at(A, 0.3, 'r')) { if (Math.random() < 0.6) { BT.msg = 'Got away!'; sfx.play('back'); A.ran = true; S.party.forEach(function (q) { q.off = -60; }); } else BT.msg = "Can't get away!"; } return; }
  if (K.indexOf('f_') === 0) foeAnim(A, K.slice(2));
}
function foeAnim(A, sk) {
  var f = A.a.who, t = A.t, ps = liveParty(); if (!ps.length) return; if (!A.tgt) A.tgt = pick(ps); var T = alive(A.tgt) ? A.tgt : pick(ps), tp = heroXY(T), fp = foeXY(f);
  if (sk === 'hit' || sk === 'poison') { if (at(A, 0.45, 'h')) { if (f.blind && Math.random() < 0.5) { popAt(T, 'MISS', '#a6968f'); return; } hurtHero(T, (f.atk * (f.roar ? 1.3 : 1) * (sk === 'poison' ? 0.8 : 1)) * rnd(0.9, 1.1) - stat(T, 'def') * 0.5); fx({ k: sk === 'poison' ? 'bite' : 'slash', x: tp.x, y: tp.y - 24, life: 0.35 });
    if (sk === 'poison' && alive(T)) { T.st.poison = 4; popAt(T, 'POISON', '#9aff5a', 14); } } return; }
  if (sk === 'all') { if (at(A, 0.3, 'a')) { fx({ k: 'shock', x: fp.x, y: fp.y + 20, life: 0.8 }); KIT.shake(6); } if (at(A, 0.8, 'h')) liveParty().forEach(function (q) { hurtHero(q, f.atk * 0.7 * rnd(0.9, 1.1) - stat(q, 'def') * 0.4); }); return; }
  if (sk === 'fire') { if (at(A, 0.25, 'a')) fx({ k: 'flame', x: tp.x, y: tp.y, life: 0.8 }); if (at(A, 0.6, 'h')) { hurtHero(T, f.mag * 1.5 * rnd(0.9, 1.1) - stat(T, 'mag') * 0.3); sfx.play('boom'); } return; }
  if (sk === 'blizzard') { if (at(A, 0.2, 'a')) for (var i = 0; i < 12; i++) fx({ k: 'shard', x: tp.x + rnd(-20, 20), y: tp.y - 90 - rnd(0, 30), vy: rnd(200, 280), life: 0.45, delay: i * 0.02 }); if (at(A, 0.6, 'h')) hurtHero(T, f.mag * 1.5 * rnd(0.9, 1.1) - stat(T, 'mag') * 0.3); return; }
  if (sk === 'drain') { if (at(A, 0.4, 'h')) { var d2 = Math.max(1, Math.round(f.mag * 1.1 - stat(T, 'mag') * 0.3)); hurtHero(T, d2); f.hp = Math.min(f.mhp, f.hp + d2); popFoe(f, '+' + d2, '#7dff9a'); for (var j = 0; j < 8; j++) fx({ k: 'orb', x0: tp.x, y0: tp.y - 24, x1: fp.x, y1: fp.y, life: 0.5, delay: j * 0.04 }); } return; }
  if (sk === 'blind') { if (at(A, 0.3, 'a')) for (var b = 0; b < 12; b++) fx({ k: 'drop', x: tp.x, y: tp.y - 30, vx: rnd(-60, 60), vy: rnd(-60, 20), life: 0.6, c: '#5a4a3a' }); if (at(A, 0.5, 'h')) { T.st.blind = 3; popAt(T, 'BLIND', '#a6968f'); } return; }
  if (sk === 'roar') { if (at(A, 0.2, 'a')) { fx({ k: 'rings', x: fp.x, y: fp.y, life: 0.9 }); sfx.play('roar'); KIT.shake(5); f.roar = 3; } return; }
  if (sk === 'explode') { if (at(A, 0.4, 'a')) { fx({ k: 'boom', x: fp.x, y: fp.y, life: 0.6 }); KIT.shake(8); sfx.play('boom'); liveParty().forEach(function (q) { hurtHero(q, f.mag * 1.2 - stat(q, 'def') * 0.3); }); f.hp = 0; } return; }
  if (sk === 'summon') { if (at(A, 0.5, 'a')) { var mf = foeStats(f.summon, Math.max(1, f.lv - 4)); mf.atb = 0; mf.off = 0; BT.foes.push(mf); layoutFoes(); var p2 = foeXY(mf); fx({ k: 'smoke', x: p2.x, y: p2.y, life: 0.7 }); sfx.play('roar'); } return; }
  if (sk === 'nothing') { if (at(A, 0.2, 'a')) { BT.dim = 1.2; } if (at(A, 0.8, 'h')) liveParty().forEach(function (q) { q.mp = Math.max(0, q.mp - 15); q.st = {}; popAt(q, '-15 MP', '#7af0ff'); }); return; }
}
function retarget(t, kind) { if (kind === 'one') { if (t && t.hp > 0 && !t.gone) return t; var l = liveFoes(); return l.length ? pick(l) : null; } if (kind === 'dead') return t; if (t && alive(t)) return t; var p = liveParty(); return p.length ? pick(p) : null; }
function physDmg(m, t, pow, el) {
  if (m.st && m.st.blind && Math.random() < 0.5) return { miss: true };
  var atk = stat(m, 'atk') * (m.st && m.st.lock ? 1.5 : 1), d = atk * pow * rnd(0.9, 1.1) - t.def * 0.5, crit = Math.random() < 0.07;
  if (crit) d *= 1.75; if (el && t.weak === el) d *= 2; return { n: Math.max(1, Math.round(d)), crit: crit, weak: el && t.weak === el };
}
function magDmg(m, t, pow, el) { var d = (stat(m, 'mag') * pow * 1.25 + 6) * rnd(0.92, 1.08) - t.def * 0.25; if (el && t.weak === el) d *= 2; return { n: Math.max(1, Math.round(d)), weak: el && t.weak === el }; }
function hitFoe(m, t, d) {
  if (!t || t.hp <= 0) return;
  if (d.miss) { popFoe(t, 'MISS', '#a6968f'); return; }
  t.hp -= d.n; t.flash = 0.25; sfx.play('hit'); popFoe(t, d.n + (d.crit ? '!' : ''), d.weak ? '#ffe36a' : '#ffffff'); if (d.weak) popFoe(t, 'WEAK', '#ff2630', 14);
  if (t.hp <= 0) { t.hp = 0; sfx.play('splat'); }
}
function useItem(id, t, tg, m) {
  var it = ITEMS[id];
  if (it.dmg) { (tg === 'all' ? liveFoes() : [retarget(t, 'one')]).forEach(function (f) { if (f) hitFoe(m, f, { n: Math.round(it.dmg * rnd(0.9, 1.1)) }); }); sfx.play('boom'); return; }
  var ts = tg === 'allies' ? S.party : [tg === 'deadally' ? t : retarget(t, 'ally')];
  ts.forEach(function (q) {
    if (!q) return;
    if (it.revive) { if (!alive(q)) { q.hp = Math.round(maxHp(q) * it.revive); q.atb = 0.3; popAt(q, 'UP!', '#7dff9a'); } return; }
    if (!alive(q)) return;
    if (it.pill) { var r = Math.random(); if (r < 0.4) { q.hp = maxHp(q); popAt(q, 'FULL HP!', '#7dff9a'); } else if (r < 0.7) { q.st.haste = 1; popAt(q, 'HASTE', '#ffe36a'); } else { q.hp = Math.max(1, Math.round(q.hp / 2)); q.st.blind = 3; popAt(q, 'UH OH', '#ff2630'); } return; }
    if (it.heal) { var h = Math.min(it.heal, maxHp(q) - q.hp); q.hp += h; popAt(q, String(h), '#7dff9a'); }
    if (it.mp) { var mm = Math.min(it.mp, maxMp(q) - q.mp); q.mp += mm; popAt(q, mm + ' MP', '#7af0ff'); }
    if (it.cure) { q.st = {}; popAt(q, 'CURED', '#7dff9a'); }
  });
  sfx.play('magic');
}
function hurtHero(t, d) {
  d = Math.max(1, Math.round(d)); if (t.guard) d = Math.round(d / 2); t.hp = Math.max(0, t.hp - d); t.hurtT = 0.4; popAt(t, String(d), '#ffffff'); sfx.play('hurt');
  t.limit = Math.min(1, (t.limit || 0) + d / maxHp(t) * 0.9); if (t.limit >= 1 && !t.limitSaid) { t.limitSaid = 1; popAt(t, 'LIMIT!', '#ffe36a', -14); }
  if (t.hp <= 0) { popAt(t, 'DOWN', '#ff2630', 14); t.st = {}; t.atb = 0; var ri = BT.ready.indexOf(t); if (ri >= 0) BT.ready.splice(ri, 1); }
}
function popAt(m, s, c, oy) { var p = heroXY(m), y = p.y - 50 + (oy || 0); BT.pops.push({ x: p.x, y: y - 10, y0: y, vy: -120, s: s, c: c, t: 1.1 }); }
function popFoe(f, s, c, oy) { var p = foeXY(f), y = p.y - p.h / 2 + 4 + (oy || 0); BT.pops.push({ x: p.x, y: y - 10, y0: y, vy: -120, s: s, c: c, t: 1.1 }); }
function win() {
  if (BT.phase === 'win') return; BT.phase = 'win'; BT.endT = 1.2; BT.menu = null;
  var boss = BT.boss && BT.foes[0];
  if (boss && boss.next) { // Blumhead does not stay down
    BT.phase = 'run'; say(STORY.blumSuper, function () { var nb = foeStats(boss.next, BOSSES[boss.next].lv, true); nb.atb = 0.5; nb.off = 0; BT.foes = [nb]; layoutFoes(); music.play(BOSSES[boss.next].song); KIT.flash(0.5); sfx.play('roar'); }); return;
  }
  sfx.play('win'); music.play('jvwin'); S.party.forEach(function (m) { if (alive(m)) m.victory = 1; });
}
function endWin() {
  var xp = 0, gold = 0; if (!BT.ran) BT.foes.forEach(function (f) { xp += f.xp; gold += f.drops; });
  var lines = [];
  if (!BT.ran) {
    S.drops += gold; lines.push(['', 'Won! ' + xp + ' XP and ' + gold + ' drops.']);
    S.party.forEach(function (m) { if (!alive(m)) return; m.xp += xp; while (m.xp >= xpNext(m.lv)) { m.xp -= xpNext(m.lv); var oldS = skillsOf(m).length; m.lv++; m.hp = maxHp(m); m.mp = maxMp(m); lines.push(['', heroName(m) + ' is now level ' + m.lv + '!']); var ns = skillsOf(m); if (ns.length > oldS) lines.push(['', heroName(m) + ' learns ' + ns[ns.length - 1].n + '!']); } });
    if (Math.random() < 0.18 && !BT.boss) { var drop = pick(['puff', 'puff', 'garlic', 'cuppa', 'chilli']); S.inv[drop] = (S.inv[drop] || 0) + 1; lines.push(['', 'Found a ' + ITEMS[drop].n + '.']); }
  }
  S.party.forEach(function (m) { m.st = {}; m.guard = false; m.victory = 0; m.off = 0; m.limitSaid = 0; });
  var wasBoss = BT.boss && !BT.ran; BT = null; G.mode = 'field';
  var after = function () { if (wasBoss) bossBeaten(); else { music.play(G.mk === 'world' ? 'jvworld' : G.mk === 'dun' ? DUNGEONS[G.mid].song : TOWNSPEC[G.mid].song); } };
  if (lines.length) say(lines, after); else after();
}
function bossBeaten() {
  var D = DUNGEONS[G.mid]; if (!D) return; S.flags['boss_' + G.mid] = 1; S.flags[D.reward.flag] = 1;
  if (G.mid === 'V') { save(); endingScene(); return; }
  var lines = [['', D.reward.text]];
  if (S.flags.keyC && S.flags.keyB && S.flags.keyM && !S.flags.keysNote) { S.flags.keysNote = 1; lines = lines.concat(STORY.keys3); }
  if (G.mid === 'K') { S.gear.blade = (S.gear.blade || 0) + 1; }
  say(lines, function () { music.play(D.song); if (G.mid === 'L') { say([['', 'You step off the edge into the dark.']], function () { enter('dun', 'V', 0, 4, 8, 'r'); }); } });
}
function lose() { if (BT.phase === 'lose') return; BT.phase = 'lose'; BT.endT = 1.8; BT.menu = null; sfx.play('lose'); music.stop(1); }
function gameOver() {
  BT = null; G.mode = 'over';
  KIT.menu({ title: 'The Party Has Fallen', sub: 'The road to the Void is long.', items: [hasSave() ? { label: 'LOAD YOUR SAVE', fn: function () { KIT.closeMenu(); loadGame(); }, cls: 'hot', def: true } : null, { label: 'TITLE', fn: titleMenu, back: true }].filter(Boolean) });
}
function endingScene() { music.play('swend'); say(STORY.ending, function () { S.flags.done = 1; save(); KIT.menu({ title: 'Journey to the Void', sub: 'The End', html: '<p style="text-align:center">Cumhead, Spermaid and Greebo found the Void and came home.<br>Party level: <b>' + S.party.map(function (m) { return heroName(m) + ' ' + m.lv; }).join(' · ') + '</b></p>', items: [{ label: 'KEEP EXPLORING', fn: function () { KIT.closeMenu(); exitDungeon(); }, def: true }, { label: 'TITLE', fn: titleMenu, back: true }] }); }); }

/* ---------- battle drawing ---------- */
function cmdRects() { var r = []; for (var i = 0; i < 5; i++) r.push([12, 182 + i * 16, 104, 15]); return r; }
function listRects(M) { var r = []; for (var i = 0; i < Math.min(M.list.length, 8); i++) r.push([12 + (i % 2) * 150, 186 + Math.floor(i / 2) * 18, 146, 16]); return r; }
function tapRects(rs) { if (!KIT.ptr.tap) return -1; for (var i = 0; i < rs.length; i++) { var r = rs[i]; if (KIT.ptr.x >= r[0] && KIT.ptr.x <= r[0] + r[2] && KIT.ptr.y >= r[1] && KIT.ptr.y <= r[1] + r[3]) return i; } return -1; }
function targetRect(t) { if (t.boss !== undefined) { var p = foeXY(t); return [p.x - p.w / 2, p.y - p.h / 2, p.w, p.h]; } var q = partyPos(S.party.indexOf(t)); return [q.x - 20, q.y - 50, 40, 52]; }
function drawBattleBg() {
  var c = BGS[BT.bg] || BGS.waste;
  KIT.blit(KIT.layer('jv-bg-' + BT.bg, W, H, function () {
    var g = KIT.ctx.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); KIT.ctx.fillStyle = g; KIT.ctx.fillRect(0, 0, W, 160);
    for (var i = 0; i < 9; i++) { var bx = i * 60 - 10, bh = 30 + (i * 37) % 50; R(c[0], bx, 110 - bh, 54, bh + 50); R('rgba(255,255,255,0.03)', bx, 110 - bh, 54, 2); }
    var g2 = KIT.ctx.createLinearGradient(0, 120, 0, 270); g2.addColorStop(0, c[1]); g2.addColorStop(1, c[2]); KIT.ctx.fillStyle = g2; KIT.ctx.fillRect(0, 118, W, 152);
    for (var y = 120; y < 270; y += 10) R('rgba(0,0,0,' + (0.18 - (y - 120) / 1200) + ')', 0, y, W, 1);
    for (var k = 0; k < 40; k++) R('rgba(0,0,0,0.2)', (k * 97) % W, 124 + (k * 53) % 140, 8 + (k % 3) * 6, 2);
    if (BT.bg === 'moon' || BT.bg === 'waste') { KIT.ctx.fillStyle = '#c4121c'; KIT.ctx.beginPath(); KIT.ctx.arc(380, 40, 24, 0, 6.28); KIT.ctx.fill(); }
  }), 0, 0);
  if (BT.bg === 'void') for (var s = 0; s < 40; s++) R(s % 3 ? '#3a2a4a' : '#ffe36a', (s * 71 + G.t * 6) % W, (s * 37) % 150, 1, 1);
}
function drawFx() {
  BT.fx.forEach(function (f) {
    var t = f.t - (f.delay || 0), k = t / (f.life - (f.delay || 0)); if (t < 0) return; var c = KIT.ctx;
    if (f.k === 'star') { for (var i = 0; i < 8; i++) { var a = i / 8 * 6.28; R('#ffffff', f.x + Math.cos(a) * k * 26 - 2, f.y + Math.sin(a) * k * 26 - 2, 4, 4); } R('rgba(255,255,255,' + (1 - k) + ')', f.x - 10, f.y - 10, 20, 20); }
    else if (f.k === 'claws' || f.k === 'slash') { c.save(); c.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; c.lineWidth = 3; for (var j = 0; j < (f.k === 'claws' ? 3 : 1); j++) { c.beginPath(); c.moveTo(f.x - 24 + j * 8, f.y - 24 + k * 6); c.lineTo(f.x + 16 + j * 8, f.y + 20 * Math.min(1, k * 3)); c.stroke(); } c.restore(); }
    else if (f.k === 'drop' || f.k === 'rise' || f.k === 'fall') { var x = f.x + (f.vx || 0) * t, y = f.y + (f.vy || 0) * t + (f.k === 'drop' ? 300 * t * t : 0); R(f.c, x, y, f.k === 'fall' ? 2 : 3, f.k === 'fall' ? 6 : 3); }
    else if (f.k === 'blob' || f.k === 'pieproj' || f.k === 'chilliproj' || f.k === 'orb') { var kk = Math.min(1, k), x2 = lerp(f.x0, f.x1, kk), y2 = lerp(f.y0, f.y1, kk) - Math.sin(kk * Math.PI) * (f.arc || 0);
      if (f.k === 'pieproj') spr('wn_d_q', x2, y2 + 6, { rot: kk * 6 }); else if (f.k === 'chilliproj') spr('wn_bowld', x2, y2 + 6, { rot: kk * 8, sc: 0.8 }); else if (f.k === 'orb') { R('#ff2630', x2 - 3, y2 - 3, 6, 6); R('#ff9aa0', x2 - 1, y2 - 1, 2, 2); } else { R('#12040a', x2 - 6, y2 - 6, 12, 12); R('#fff6d8', x2 - 5, y2 - 5, 10, 10); R('#ffffff', x2 - 3, y2 - 3, 3, 3); } }
    else if (f.k === 'splat' || f.k === 'creamsplat') { var col = f.k === 'splat' ? '#ff9adf' : '#fff6d8'; for (var s2 = 0; s2 < 10; s2++) { var a2 = s2 / 10 * 6.28; R(col, f.x + Math.cos(a2) * (8 + k * 22) - 3, f.y + Math.sin(a2) * (6 + k * 16) - 3, 6 * (1 - k) + 2, 6 * (1 - k) + 2); } }
    else if (f.k === 'splashring') { c.save(); c.strokeStyle = 'rgba(154,223,255,' + (1 - k) + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, f.y, 10 + k * 30, 6 + k * 16, 0, 0, 6.28); c.stroke(); c.restore(); }
    else if (f.k === 'pillar') { R('rgba(255,251,232,' + (0.6 * Math.sin(k * Math.PI)) + ')', f.x - 14, 0, 28, f.y); R('rgba(255,255,255,' + (0.9 * Math.sin(k * Math.PI)) + ')', f.x - 4, 0, 8, f.y); }
    else if (f.k === 'wave') { var wx = W + 40 - k * (W + 160); for (var yy = 100; yy < 230; yy += 6) { var wob = Math.sin(yy * 0.1 + G.t * 8) * 10; R('rgba(58,138,200,0.8)', wx + wob, yy, 120, 6); R('rgba(154,223,255,0.9)', wx + wob - 6, yy, 10, 6); } }
    else if (f.k === 'charge') { for (var q = 0; q < 10; q++) { var a3 = q / 10 * 6.28 + t * 6, r3 = 40 * (1 - k); R('#ffe36a', f.x + Math.cos(a3) * r3 - 2, f.y + Math.sin(a3) * r3 - 2, 4, 4); } }
    else if (f.k === 'beam') { var a4 = Math.sin(Math.min(1, k) * Math.PI); R('rgba(255,251,232,' + a4 + ')', f.x1, f.y - 14, f.x0 - f.x1, 28); R('rgba(255,255,255,' + a4 + ')', f.x1, f.y - 6, f.x0 - f.x1, 12); }
    else if (f.k === 'bite') { R('rgba(154,255,90,' + (1 - k) + ')', f.x - 12, f.y - 8, 24, 4); R('rgba(154,255,90,' + (1 - k) + ')', f.x - 12, f.y + 8, 24, 4); }
    else if (f.k === 'shock') { c.save(); c.strokeStyle = 'rgba(255,38,48,' + (1 - k) + ')'; c.lineWidth = 4; c.beginPath(); c.ellipse(f.x + k * 300, f.y, 10, 60, 0, 0, 6.28); c.stroke(); c.restore(); }
    else if (f.k === 'flame') { for (var fl = 0; fl < 12; fl++) { var fy = f.y - ((t * 120 + fl * 9) % 70); R(fl % 2 ? '#ff9a30' : '#ff2630', f.x - 12 + (fl * 7) % 24, fy, 5, 8); } }
    else if (f.k === 'shard') { var sy = f.y + f.vy * t; R('#c0e8ff', f.x, sy, 3, 10); R('#ffffff', f.x, sy + 8, 3, 2); }
    else if (f.k === 'rings') { c.save(); c.strokeStyle = 'rgba(255,227,106,' + (1 - k) + ')'; c.lineWidth = 2; for (var rr = 0; rr < 3; rr++) { c.beginPath(); c.arc(f.x, f.y, (k * 60 + rr * 14), 0, 6.28); c.stroke(); } c.restore(); }
    else if (f.k === 'boom' || f.k === 'smoke') { var cc = f.k === 'boom' ? ['#ffe36a', '#ff9a30', '#ff2630'] : ['#a6968f', '#5a4a4a', '#3a2a2a']; for (var b = 0; b < 3; b++) { c.fillStyle = cc[b]; c.globalAlpha = 1 - k; c.beginPath(); c.arc(f.x, f.y, (10 + k * 40) * (1 - b * 0.25), 0, 6.28); c.fill(); } c.globalAlpha = 1; }
  });
}
function drawBattle() {
  drawBattleBg();
  if (BT.dim > 0) { BT.dim -= 1 / 60; R('rgba(0,0,0,' + Math.min(0.6, BT.dim) + ')', 0, 0, W, H); }
  var M = BT.menu;
  BT.foes.forEach(function (f) { if (f.gone) return; var fr = KIT.has(f.s + '0') ? f.s + (Math.floor(G.t * 3) % 2) : f.s, a = f.hp <= 0 ? Math.max(0, 1 - (f.fade || 0) / 0.7) : 1;
    var dying = f.hp <= 0; if (dying) R('rgba(196,18,28,' + a * 0.4 + ')', f.x - 20, f.y - 40, 40, 40);
    R('rgba(0,0,0,0.35)', f.x - 20 + (f.off || 0), f.y - 2, 40, 5); spr(fr, f.x + (f.off || 0), f.y, { flash: f.flash > 0 && Math.floor(G.t * 30) % 2, alpha: a, sc: f.boss ? 1 : 1.5 }); });
  S.party.forEach(function (m, i) {
    var p = partyPos(i), h = HEROES[m.id], ready = M && M.m === m, x = p.x - (m.off || 0) - (ready ? 12 : 0) + (BT.anim && BT.anim.kind === 'spin' && BT.anim.a.who === m && BT.anim.spinX !== undefined ? 0 : 0);
    var f = !alive(m) ? h.spr.dead : m.hurtT > 0 ? h.spr.hurt : (BT.anim && BT.anim.a.who === m) || m.victory ? h.spr.act : h.spr.idle;
    R('rgba(0,0,0,0.35)', x - 12, p.y - 2, 24, 4);
    var bob = alive(m) && !m.hurtT ? Math.round(Math.sin(G.t * 3 + i) * 1) : 0, jump = m.victory ? -Math.abs(Math.sin(G.t * 8 + i)) * 8 : 0;
    spr(f, x, p.y + (alive(m) ? bob + jump : 6), { flip: true, rot: BT.anim && BT.anim.kind === 'spin' && BT.anim.a.who === m && BT.anim.t < 1.4 ? G.t * 20 : 0 });
    if (m.guard) R('rgba(122,240,255,0.4)', x - 16, p.y - 44, 4, 40); if (m.st && m.st.poison) R('#9aff5a', x - 14, p.y - 52, 4, 4); if (m.st && m.st.lock) R('#ffe36a', x - 8, p.y - 52, 4, 4);
  });
  drawFx();
  BT.pops.forEach(function (p) { text(p.s, p.x, p.y, { align: 'center', size: 11, col: p.c, alpha: Math.min(1, p.t * 3), outline: true }); });
  // FF7 layout: the action name at the top, enemy names bottom left, the party bottom right with HP, MP, LIMIT and TIME
  if (BT.label) { var lw = KIT.tw(BT.label, 15, 'body') + 40; win7(W / 2 - lw / 2, 6, lw, 24); text(BT.label, W / 2, 10, { align: 'center', size: 15, font: 'body', col: '#ffffff' }); }
  win7(4, 176, 150, 90); liveFoes().slice(0, 5).forEach(function (f, i) { text(f.n, 14, 184 + i * 16, { size: 13, font: 'body', col: '#ffffff', max: 130 }); });
  win7(158, 176, 318, 90);
  text('NAME', 168, 180, { size: 6, col: '#8ab0ff' }); text('HP', 262, 180, { size: 6, col: '#8ab0ff' }); text('MP', 336, 180, { size: 6, col: '#8ab0ff' }); text('LIMIT', 380, 180, { size: 6, col: '#8ab0ff' }); text('TIME', 428, 180, { size: 6, col: '#8ab0ff' });
  S.party.forEach(function (m, i) { var y = 196 + i * 22, low = !alive(m) ? '#ff2630' : m.hp < maxHp(m) * 0.25 ? '#ffe36a' : '#ffffff', on = M && M.m === m;
    if (on) R('rgba(255,255,255,0.12)', 162, y - 3, 310, 20);
    text(heroName(m), 168, y, { size: 14, font: 'body', col: on ? '#ffe36a' : low });
    text(m.hp + '/' + maxHp(m), 300, y - 1, { size: 13, font: 'body', col: low, align: 'right' }); bar7(250, y + 13, 52, m.hp / maxHp(m), '#4a8aff');
    text(String(m.mp), 352, y - 1, { size: 13, font: 'body', col: '#ffffff', align: 'right' }); bar7(318, y + 13, 36, m.mp / Math.max(1, maxMp(m)), '#9aff5a');
    bar7(380, y + 6, 40, m.limit || 0, (m.limit || 0) >= 1 ? (Math.floor(G.t * 8) % 2 ? '#ff9adf' : '#ffe36a') : '#ff6aa0', 5);
    bar7(428, y + 6, 40, m.atb || 0, (m.atb || 0) >= 1 ? '#ffe36a' : '#e8e0c8', 5); });
  // the command window, the list window and the pointing hand
  if (M) {
    if (M.lv === 'cmd' || M.lv === 'target' && M.pend.k === 'fight') { win7(6, 176, 116, 90); M.cmds.forEach(function (c, i) { text(c, 30, 182 + i * 16, { size: 14, font: 'body', col: c === 'RUN' && BT.boss ? '#5a5a7a' : c === 'LIMIT' ? '#ffe36a' : '#ffffff' }); }); if (M.lv === 'cmd') hand(12, 186 + M.cur * 16); }
    if (M.lv === 'list' || (M.lv === 'target' && M.pend.k !== 'fight')) { win7(6, 176, 310, 90); var top = Math.max(0, (M.sub - (M.sub % 2)) - 6); M.list.slice(top, top + 8).forEach(function (s, j) { var i = top + j; text(s.label, 30 + (j % 2) * 150, 184 + Math.floor(j / 2) * 18, { size: 13, font: 'body', col: s.dis ? '#5a5a7a' : '#ffffff', max: 100 }); text(String(s.right), 144 + (j % 2) * 150, 184 + Math.floor(j / 2) * 18, { size: 13, font: 'body', col: '#ffffff', align: 'right' }); });
      if (M.lv === 'list') { hand(12 + (M.sub % 2) * 150, 188 + Math.floor((M.sub - top) / 2) * 18); var cur = M.list[M.sub]; if (cur) { win7(4, 6, W - 8, 24); text(cur.d, 14, 10, { size: 13, font: 'body', col: '#ffffff', max: W - 30 }); } } }
    if (M.lv === 'target') { var t = M.tl[M.tc], r = targetRect(t); hand(t.boss !== undefined ? r[0] - 16 : r[0] - 18, r[1] + r[3] / 2, t.boss === undefined); win7(4, 6, W - 8, 24); text(t.n || heroName(t), 14, 10, { size: 13, font: 'body', col: '#ffffff' }); }
    if (M.lv === 'cmd' && M.cmds[M.cur] === 'LIMIT') { win7(4, 6, W - 8, 24); text(LIMITS[M.m.id].n + ': ' + LIMITS[M.m.id].d, 14, 10, { size: 13, font: 'body', col: '#ffe36a', max: W - 30 }); }
  }
  if (BT.msg === 'No running from this one.' || BT.msg === 'Got away!' || BT.msg === "Can't get away!") { win7(4, 6, W - 8, 24); text(BT.msg, 14, 10, { size: 13, font: 'body', col: '#ffffff' }); }
  if (BT.swirl > 0) { var k = BT.swirl / 0.7; for (var s = 0; s < 12; s++) { var a = s / 12 * 6.28 + k * 6; R('rgba(0,0,0,' + k + ')', W / 2 + Math.cos(a) * (1 - k) * 300 - 60, H / 2 + Math.sin(a) * (1 - k) * 200 - 30, 120, 60); } }
  if (BT.flash > 0) R('rgba(255,255,255,' + Math.min(0.8, BT.flash) + ')', 0, 0, W, H);
  if (BT.phase === 'lose') R('rgba(0,0,0,' + Math.min(0.85, (1.8 - BT.endT)) + ')', 0, 0, W, H);
}
