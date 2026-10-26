/* =====================================================================================================
   PLAY: run state, rooms, the heir, enemies, shots, drops, chests, traps, challenges
   ===================================================================================================== */
var G = { mode: 'title', t: 0, cam: { x: 0, y: 0 }, shake: 0, banner: 0, bannerTxt: '', bannerSub: '', flash: 0, lock: false, msg: null, fade: 0 };
var RUN = null, L = null, P = {}, ST = {};
var enemies = [], pshots = [], eshots = [], drops = [], parts = [], pops = [], fx = [], bosses = [], waves = [];
var JUMP2 = 290, ACC = 520, DEC = 760, BRAKE = 980, MAXV = 170, AIRACC = 380, GRAV = 950, JUMPV = 335, JCUT = 125, TERM = 430;

/* ---------- stats from class, town upgrades, gear, runes, provisions, Stacked Fate's card and powerups ---------- */
function cnt(arr, id) { var n = 0; for (var i = 0; i < arr.length; i++) if (arr[i] === id) n++; return n; }
function runeOn(id) { return META.runeOn.indexOf(id) >= 0; }
function calcStats() {
  var c = CLASSES[RUN.cls], up = META.up, pw = RUN.powers, card = RUN.card, pv = RUN.provEff || {};
  var wpn = GEAR.weapon[META.gear.weapon] || GEAR.weapon[0], arm = GEAR.armour[META.gear.armour] || GEAR.armour[0], helm = GEAR.helm[META.gear.helm] || GEAR.helm[0];
  var s = {};
  s.mhp = (RUN.feastHp || 0) + c.hp + (up.vit || 0) * 12 + (arm.hp || 0) + (pv.hp || 0) + cnt(pw, 'heart') * 25 + (card === 'blessed' ? 20 : 0);
  if (card === 'glass') s.mhp *= 0.6; if (card === 'tiny') s.mhp *= 0.8; if (card === 'speed') s.mhp *= 0.85; s.mhp = Math.round(s.mhp);
  var dm = 1 + (RUN.feastDmg || 0) + (pv.dmgP || 0) + cnt(pw, 'thick') * 0.2 + (card === 'glass' ? 0.6 : 0); if (card === 'allin') dm *= 2;
  s.dmg = (c.dmg + (up.str || 0) * 2 + (wpn.dmg || 0)) * dm;
  s.mmana = c.mana + (up.spi || 0) * 10 + (helm.mana || 0) + (pv.mana || 0);
  s.arm = Math.min(0.7, upArm(up.arm) + (arm.arm || 0) + cnt(pw, 'iron') * 0.08);
  s.spd = c.spd * (1 + upAgi(up.agi)) * (runeOn('haste') ? 1.12 : 1) * Math.pow(1.1, cnt(pw, 'swift')) * (card === 'speed' ? 1.3 : 1) * (card === 'tiny' ? 1.12 : 1);
  s.jumps = c.jumps + (runeOn('vault') ? 1 : 0) + cnt(pw, 'jump');
  s.atkMul = 1 / (1 + cnt(pw, 'quick') * 0.2 + (runeOn('fury') ? 0.15 : 0) + (card === 'speed' ? 0.2 : 0));
  s.crit = 0.05 + (helm.crit || 0) + cnt(pw, 'crit') * 0.1;
  s.leech = (runeOn('vamp') ? 0.03 : 0) + cnt(pw, 'leech') * 0.03 + (card === 'vampnight' ? 0.06 : 0);
  s.dropMul = (1 + (up.gre || 0) * 0.06 + (runeOn('greed') ? 0.15 : 0) + cnt(pw, 'greedy') * 0.25 + (RUN.cls === 'greebo' ? 0.3 : 0)) * (card === 'bigload' ? 2 : 1) * (card === 'hard' ? 1.6 : 1) * (1 + 0.3 * META.ng);
  s.manaRegen = 1.6 * (pv.manaRegen || 1) * (1 + 0.6 * cnt(pw, 'flow'));
  s.regen = pv.regen || 0; s.siphon = runeOn('siphon') ? 2 : 0;
  s.iframes = 1.0 + (RUN.cls === 'spermaid' ? 0.4 : 0) + (runeOn('grace') ? 0.5 : 0);
  s.burn = !!pv.burn; s.boom = !!pv.boom || cnt(pw, 'volatile') > 0; s.ward = !!pv.ward;
  s.thorns = cnt(pw, 'thorns'); s.magnet = cnt(pw, 'magnet'); s.snack = cnt(pw, 'snack') * 4; s.stompMul = 1 + cnt(pw, 'boots'); s.big = cnt(pw, 'bigshot'); s.echo = Math.min(0.75, cnt(pw, 'echo') * 0.25);
  s.soul = cnt(pw, 'soul') * 10; s.berserk = cnt(pw, 'berserk') * 0.4; s.lucky = Math.min(0.5, cnt(pw, 'lucky') * 0.1); s.cold = Math.min(0.5, cnt(pw, 'cold') * 0.12); s.bubble = cnt(pw, 'bubble'); s.slayer = cnt(pw, 'slayer') * 0.35;
  s.takeMul = (card === 'allin' ? 2 : 1); s.foeDmg = (card === 'hard' ? 1.3 : 1) * (1 + 0.35 * META.ng); s.foeHp = (card === 'bigload' ? 1.5 : 1) * (1 + 0.6 * META.ng);
  s.grav = card === 'moon' ? 0.62 : 1; s.small = card === 'tiny' || RUN.cls === 'homunculus'; s.noHeal = card === 'vampnight';
  bonusStats(s); pillStats(s); homStats(s);
  return s;
}
function tierOf() { if (RUN && RUN.endless) return RUN.endless.tier; if (L && L.lair) return 6; return L && L.arena ? (L.arena === 'blum' || L.arena === 'blum2' ? 5 : AREAS[BOSSDEF[L.arena].area].tier) : AREAS[G.rm.area].tier; }
function dropVal() { return Math.max(1, Math.round((3 + tierOf() * 2) * ST.dropMul)); }

/* ---------- starting, saving and ending runs ---------- */
function startRun(cls) {
  var pv = {}, provs = [];
  for (var slot in META.prov) { var id = META.prov[slot]; (PROV[slot] || []).forEach(function (it) { if (it.id === id) { for (var k in it.eff) pv[k] = (pv[k] || 0) + it.eff[k]; provs.push(it.name); } }); }
  RUN = { v: 1, seed: (Math.random() * 1e9) | 0, cls: cls, card: META.card, provEff: pv, provNames: provs, powers: [], drops: 0, rs: {}, t: 0, kills: 0, revive: (pv.revive || 0) + (META.card === 'blessed' ? 1 : 0), sw: false, room: null };
  META.prov = {}; META.card = null; META.runs++; META.started = true; META.last = cls; saveMeta();
  WORLD = genWorld(RUN.seed); ST = calcStats(); RUN.hp = ST.mhp; RUN.mana = ST.mmana;
  newPlayer(); G.mode = 'play'; G.msg = null; enterRoom(WORLD.start, null);
  if (homOn()) { G.banner = 2.4; G.bannerTxt = homName().toUpperCase(); G.bannerSub = 'HEIR #' + META.runs + '  ·  ' + (HOMPOW[homBreed()] || '').toUpperCase(); return; } // he already hatched at the Hatchery
  G.banner = 3; G.bannerTxt = CLASSES[cls].name.toUpperCase(); G.bannerSub = 'HEIR #' + META.runs + (RUN.card ? '  ·  ' + cardName(RUN.card).toUpperCase() : '');
}
function cardName(id) { for (var i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) return CARDS[i].name; return ''; }
function saveRun() {
  if (!RUN || P.state === 'dead' || G.mode !== 'play') return;
  RUN.hp = P.hp; RUN.mana = P.mana; RUN.pos = { key: G.roomKey, arena: L && L.arena ? L.arena : null, ret: G.retKey, x: P.x, y: P.y };
  try { localStorage.setItem(RUN_KEY, JSON.stringify(RUN)); } catch (e) {}
}
function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) {} }
function readRun() { try { var r = JSON.parse(localStorage.getItem(RUN_KEY) || 'null'); if (r && r.v === 1 && r.cls && r.pos) return r; } catch (e) {} return null; }
function resumeRun() {
  var r = readRun(); if (!r) return false;
  RUN = r; if (RUN.endless) { genEndless(RUN.seed); for (var gi = 0; gi < 3000 && !WORLD.rooms[RUN.pos.key] && !WORLD.rooms[RUN.pos.ret]; gi++) ensureEndless(WORLD.count + 1); ensureEndless(WORLD.count + 3); } else WORLD = genWorld(RUN.seed); ST = calcStats(); newPlayer(); P.hp = Math.min(ST.mhp, RUN.hp); P.mana = RUN.mana; G.mode = 'play';
  var pos = RUN.pos; G.retKey = pos.ret;
  // a save from an older map layout: start this heir again from the first room
  if (!WORLD.rooms[pos.key] || (pos.ret && !WORLD.rooms[pos.ret])) { RUN.rs = {}; pos = RUN.pos = { key: WORLD.start, arena: null, ret: null, x: 10 * T, y: 15 * T }; G.retKey = null; }
  if (pos.arena) { enterRoom(pos.ret, null, null); var dr = L.ents.filter(function (e) { return e.k === 'door'; })[0]; if (dr) { P.x = dr.x + 34; P.y = 15 * T; camSnap(); } } else enterRoom(pos.key, null, { x: pos.x, y: pos.y });
  P.inv = 1.5; G.banner = 2; G.bannerTxt = 'WELCOME BACK'; G.bannerSub = CLASSES[RUN.cls].name.toUpperCase(); return true;
}
function bankRun() { var d = Math.floor(RUN.drops); META.bank += d; META.totalDrops = (META.totalDrops || 0) + d; RUN.drops = 0; return d; }
function runOver(win) {
  clearRun(); var erec = RUN.endless ? recordEndless() : null;
  var area = G.rm ? AREAS[G.rm.area].name : '', got = Math.floor(RUN.drops), d = bankRun();
  META.legacy.unshift({ cls: RUN.cls, hb: RUN.hom ? RUN.hom.b : undefined, area: L && L.arena ? BOSSDEF[L.arena].name : area, by: win ? (win === 3 ? 'Beat Mega Blumhead' : 'Beat Blumhead') : (RUN.by || 'the castle'), d: d, ng: META.ng, t: Math.round(RUN.t), win: !!win, kills: RUN.kills });
  META.legacy = META.legacy.slice(0, 30); META.nextHeir = null; saveMeta();
  G.mode = 'over'; music.stop(1.2);
  el('overH').textContent = erec ? 'Endless: screen ' + erec.screen : win ? (win === 3 ? 'Mega Blumhead falls' : win === 2 ? 'Super Blumhead falls' : 'Blumhead falls') : 'Your heir has fallen';
  el('overTxt').textContent = CLASSES[RUN.cls].name.toUpperCase() + (RUN.hom ? ' (' + homName().toUpperCase() + ')' : '') + (win ? ' finished the legacy' : ' was slain by ' + (RUN.by || 'the castle')) + '.';
  // the stats of the run
  var st = [['TIME', fmtT(RUN.t)], ['FOES KILLED', RUN.kills], ['FELL IN', L && L.arena ? BOSSDEF[L.arena].name : area], ['POWERUPS', RUN.powers.length], ['FOUND', (RUN.finds || []).length ? RUN.finds.join(', ') : 'nothing'], ['FATE', RUN.card ? cardName(RUN.card) : 'none']];
  if (RUN.pill) st.push(["TB'S PILL", PILLS[RUN.pill].name]);
  if (erec) st.push(['SCREEN', erec.screen], ['PROOF', erec.sig]);
  if (RUN.hom) st.push(['GREW TO', HOMSTNAME[RUN.hom.st]]);
  var box = el('overStats'); box.innerHTML = ''; st.forEach(function (q) { var d2 = document.createElement('div'); var a = document.createElement('span'); a.textContent = q[0]; var b2 = document.createElement('b'); b2.textContent = String(q[1]); d2.appendChild(a); d2.appendChild(b2); box.appendChild(d2); });
  // the drops count up into the inheritance for the next heir
  var n0 = META.bank - d, t0 = performance.now(), dur = Math.min(2200, 600 + d * 2), ticks = 0;
  el('overInhN').textContent = fmtN(n0);
  (function tick(now) { var k = Math.min(1, (now - t0) / dur), v = Math.round(n0 + d * (1 - Math.pow(1 - k, 2))); el('overInhN').textContent = fmtN(v); if (Math.floor(k * 20) > ticks) { ticks = Math.floor(k * 20); sfx.pick(G.t + ticks); } if (k < 1 && G.mode === 'over') requestAnimationFrame(tick); })(t0);
  el('overInhS').textContent = '+' + fmtN(got) + ' DROPS CARRIED  ·  PASSED TO THE NEXT HEIR';
  el('overGold').textContent = win ? 'NEW GAME+ ' + META.ng + ': the bosses return, stronger.' : '';
  el('overBtn').textContent = 'CHOOSE THE NEXT HEIR';
  el('over').hidden = false; setMenuMode(true);
}
function fmtT(s) { s = Math.max(0, Math.floor(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

/* ---------- the heir ---------- */
function newPlayer() {
  var sm = ST.small;
  P = { x: 0, y: 0, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuf: 0, jumpHeld: false, jumps: 0, state: 'normal', wasG: true, lsf: 0, hurtT: 0, inv: 0, deadT: 0,
    attackT: 0, atkCd: 0, anim: 0, idleT: 0, jumpStartT: 0, prevJump: false, prevAtk: false, prevSpec: false, w: sm ? 10 : 12, h: sm ? 28 : 36, ooze: 0, oozeT: 0, regenT: 0,
    hp: RUN ? RUN.hp : 100, mana: RUN ? RUN.mana : 50 };
  if (homOn()) homSize();
}
function tileAt(px, py) { var tx = Math.floor(px / T), ty = Math.floor(py / T); if (tx < 0 || ty < 0 || tx >= L.w || ty >= L.h) return TA; return L.tiles[ty * L.w + tx]; }
function solidT(t) { return t === TW || (t === TB && G.lock); }
function boxSolid(x0, y0, x1, y1) {
  var tx0 = Math.floor(x0 / T), tx1 = Math.floor((x1 - 0.001) / T), ty0 = Math.floor(y0 / T), ty1 = Math.floor((y1 - 0.001) / T);
  for (var ty = ty0; ty <= ty1; ty++) for (var tx = tx0; tx <= tx1; tx++) { if (tx < 0 || ty < 0 || tx >= L.w || ty >= L.h) continue; if (solidT(L.tiles[ty * L.w + tx])) return { tx: tx, ty: ty }; }
  return null;
}
/* move a body (feet-centred box) through the tiles; returns the ledge tile it is standing on */
function moveBody(b, dt, grav) {
  var hw = b.w / 2, hit;
  b.x += b.vx * dt;
  hit = boxSolid(b.x - hw, b.y - b.h, b.x + hw, b.y);
  if (hit) { if (b.vx > 0) b.x = hit.tx * T - hw - 0.01; else if (b.vx < 0) b.x = (hit.tx + 1) * T + hw + 0.01; else { var c = (hit.tx + 0.5) * T; b.x += b.x < c ? -1 : 1; } b.vx = 0; b.hitWall = true; } else b.hitWall = false;
  var prevY = b.y; b.vy = Math.min(TERM, b.vy + grav * dt); b.y += b.vy * dt; b.onGround = false; b.stand = -1; b.mover = null;
  if (b.vy < 0) { hit = boxSolid(b.x - hw, b.y - b.h, b.x + hw, b.y - b.h + 1); if (hit) { b.y = (hit.ty + 1) * T + b.h; b.vy = 0; } }
  else {
    var tx0 = Math.floor((b.x - hw) / T), tx1 = Math.floor((b.x + hw - 0.001) / T), ty = Math.floor(b.y / T);
    for (var tx = tx0; tx <= tx1; tx++) {
      if (tx < 0 || ty < 0 || tx >= L.w || ty >= L.h) continue;
      var t = L.tiles[ty * L.w + tx], top = ty * T;
      if (solidT(t) || ((t === TL || t === TV || t === TG) && prevY <= top + 0.5 && !b.drop)) { b.y = top; b.vy = 0; b.onGround = true; if (t === TV) b.stand = ty * L.w + tx; break; }
    }
    if (!b.onGround && b === P && L.movers) for (var mi = 0; mi < L.movers.length; mi++) { var mv = L.movers[mi], mt = mv.y - mv.h; if (mv.under) continue; if (prevY <= mt + 0.5 && b.y >= mt && Math.abs(b.x - mv.x) < mv.w / 2 + hw - 2) { b.y = mt; b.vy = 0; b.onGround = true; b.mover = mv; break; } }
    if (!b.onGround) { hit = boxSolid(b.x - hw, b.y - 1, b.x + hw, b.y); if (hit) { b.y = hit.ty * T; b.vy = 0; b.onGround = true; } }
  }
}

function updatePlayer(dt) {
  var dir = (input.r ? 1 : 0) - (input.l ? 1 : 0), sgn;
  var jumpPressed = input.j && !P.prevJump; P.prevJump = input.j;
  var atkPressed = input.a && !P.prevAtk; P.prevAtk = input.a;
  var specPressed = input.s && !P.prevSpec; P.prevSpec = input.s;
  if (P.drop > 0) { P.drop -= dt; if (P.drop <= 0) P.drop = 0; }
  if (P.inv > 0) P.inv -= dt; if (P.atkCd > 0) P.atkCd -= dt; if (P.attackT > 0) P.attackT -= dt; if (P.jumpStartT > 0) P.jumpStartT -= dt;
  if (P.ooze > 0) { P.ooze -= dt; P.oozeT -= dt; if (P.oozeT <= 0) { P.oozeT = 0.5; healP(4); } }
  if (homHatchTick(dt)) return;
  homTick(dt); pillTick(dt);
  if (P.echoT > 0) { P.echoT -= dt; if (P.echoT <= 0 && P.state === 'normal') { var cd0 = P.atkCd; attack(true); P.atkCd = cd0; } }
  if (ST.bubble && !P.bubbleOn) { P.bubbleT = (P.bubbleT || 0) - dt; if (P.bubbleT <= 0) { P.bubbleOn = 1; } }
  if (P.state === 'dead') {
    P.vy = Math.min(TERM, P.vy + GRAV * dt); P.y += P.vy * dt; P.deadT += dt;
    if (P.deadT > 1.6 && G.mode === 'play') runOver(0);
    return;
  }
  P.mana = Math.min(ST.mmana, P.mana + ST.manaRegen * dt);
  if (ST.regen) { P.regenT += dt; if (P.regenT >= 1 / ST.regen) { P.regenT = 0; healP(1, true); } }
  var mx = MAXV * ST.spd, g = GRAV * ST.grav;
  if (P.state === 'hurt') { P.hurtT -= dt; moveBody(P, dt, g); if (P.hurtT <= 0) P.state = 'normal'; }
  else {
    sgn = P.vx > 0 ? 1 : (P.vx < 0 ? -1 : 0);
    if (P.onGround) { if (dir !== 0) { P.vx += dir * ((sgn !== 0 && sgn !== dir) ? BRAKE : ACC) * dt; if (Math.abs(P.vx) > mx) P.vx = dir * mx; } else { var f = Math.min(Math.abs(P.vx), DEC * dt); P.vx -= sgn * f; } }
    else { if (dir !== 0) { P.vx += dir * AIRACC * dt; if (Math.abs(P.vx) > mx) P.vx = dir * mx; } else { var f2 = Math.min(Math.abs(P.vx), 70 * dt); P.vx -= sgn * f2; } }
    if (dir !== 0) P.face = dir;
    if (P.onGround) { P.coyote = 0.09; P.jumps = 0; } else P.coyote -= dt;
    // hold down and press jump to drop through an iron grate or a ledge
    if (jumpPressed && input.d && P.onGround) { var ft = tileAt(P.x, P.y + 2); if (ft === TG || ft === TL) { P.drop = 0.3; P.onGround = false; P.vy = 80; P.coyote = 0; jumpPressed = false; P.jumpBuf = 0; if (ft === TG) sfx.door(); } }
    if (jumpPressed) P.jumpBuf = 0.1; else P.jumpBuf -= dt;
    if (P.jumpBuf > 0 && P.coyote > 0) { sfx.jump(); P.vy = -JUMPV; P.onGround = false; P.coyote = 0; P.jumpBuf = 0; P.jumpStartT = 0.07; P.jumpHeld = true; P.jumps = 1; }
    else if (P.jumpBuf > 0 && !P.onGround && P.coyote <= 0 && P.jumps < ST.jumps) { if (P.jumps === 0) P.jumps = 1; sfx.dbl(); P.vy = -JUMP2; P.jumpBuf = 0; P.jumpStartT = 0.07; P.jumpHeld = true; P.jumps++; poof(P.x, P.y - 4, 6, ['#f1e7d0', '#ff2630']); }
    if (P.jumpHeld && !input.j && P.vy < -JCUT) { P.vy = -JCUT; P.jumpHeld = false; }
    if (P.vy >= 0) P.jumpHeld = false;
    var near = G.near;
    if (atkPressed) { if (near) useThing(near); else if (P.atkCd <= 0) attack(); }
    if (specPressed) special();
    // Spermaid floats: hold jump while falling and she drifts down slowly, trailing bubbles
    if (RUN.cls === 'spermaid' && input.j && !P.onGround && P.vy > 55) { P.vy = 55; P.floatT = (P.floatT || 0) + dt; if (Math.random() < 0.3) parts.push({ x: P.x + (Math.random() - 0.5) * 14, y: P.y - 6, vx: 0, vy: -40, life: 0.5, c: '#9adfff', spark: 0 }); }
    moveBody(P, dt, g);
    if (P.stand >= 0) crumble(P.stand);
    if (P.mover && P.onGround) P.x += P.mover.vx * dt;
  }
  var sp = Math.abs(P.vx);
  if (P.onGround && !P.wasG && P.state === 'normal') sfx.land();
  P.wasG = P.onGround;
  if (P.onGround && sp > 20 && P.state === 'normal') { var sf = Math.floor(P.anim * (sp < 115 ? 1 : 0.5)); if (sf !== P.lsf) { P.lsf = sf; sfx.step(G.t); } }
  if (P.onGround) P.anim += dt * (sp < 115 ? 4 + sp / 10 : sp * 0.154);
  if (sp < 10) P.idleT += dt; else P.idleT = 0;
  // the Load Flume: fall in the cream and it throws you out
  if (L.water && P.state === 'normal' && P.inv <= 0 && P.ooze <= 0 && P.x > L.water.x0 && P.x < L.water.x1 && P.y > L.water.y + 8) { sfx.splat(); poof(P.x, L.water.y, 14, ['#f1e7d0', '#fff6d8']); hurtP(6 + 3 * tierOf(), P.x - P.face, 'the Load Flume'); P.vy = -380; return; }
  // spikes
  if (P.state === 'normal' && P.inv <= 0 && P.ooze <= 0) {
    var tx0 = Math.floor((P.x - P.w / 2 + 2) / T), tx1 = Math.floor((P.x + P.w / 2 - 2) / T), ty0 = Math.floor((P.y - 10) / T), ty1 = Math.floor((P.y - 1) / T);
    for (var ty = ty0; ty <= ty1; ty++) for (var tx = tx0; tx <= tx1; tx++) if (tx >= 0 && ty >= 0 && tx < L.w && ty < L.h && L.tiles[ty * L.w + tx] === TS) { hurtP(10 + 4 * tierOf(), P.x - P.face, 'spikes'); if (P.state !== 'dead') { P.vy = -300; P.state = 'hurt'; } return; }
  }
  roomEdges();
}
function healP(n, quiet) { if (ST.noHeal && !quiet) return; var b = P.hp; P.hp = Math.min(ST.mhp, P.hp + n); if (P.hp > b && !quiet) pop(P.x, P.y - P.h - 6, '+' + Math.round(P.hp - b), '#7dff9a'); }
function hurtP(dmg, srcx, by) {
  if (P.inv > 0 || P.state === 'dead' || P.ooze > 0) return;
  if (P.bubbleOn) { P.bubbleOn = 0; P.bubbleT = 12; P.inv = 0.6; pop(P.x, P.y - 40, 'POP', '#9adfff'); sfx.splat(); poof(P.x, P.y - P.h / 2, 12, ['#9adfff', '#ffffff']); return; }
  if (ST.ward && RUN.wardRoom !== G.roomKey + (L.arena || '')) { RUN.wardRoom = G.roomKey + (L.arena || ''); P.inv = 0.6; pop(P.x, P.y - 40, 'WARDED', '#7dff9a'); sfx.click(); return; }
  dmg = Math.max(1, Math.round(dmg * ST.foeDmg * ST.takeMul * (1 - ST.arm) * (P.plates > 0 ? 0.25 : 1)));
  P.hp -= dmg; G.shake = Math.max(G.shake, 5); sfx.hurt(); pop(P.x, P.y - P.h - 4, '-' + dmg, '#ff5a60');
  P.state = 'hurt'; P.hurtT = 0.35; P.vy = -200; P.vx = (P.x < srcx ? -1 : 1) * 120; P.inv = ST.iframes; P.onGround = false;
  if (P.hp <= 0) {
    if (RUN.cls === 'cumhead' && !RUN.sw) { RUN.sw = true; P.hp = 1; G.banner = 1.6; G.bannerTxt = 'SECOND WIND'; G.bannerSub = ''; sfx.oneup(); return; }
    if (RUN.revive > 0) { RUN.revive--; P.hp = ST.mhp; P.inv = 2.5; G.banner = 2; G.bannerTxt = 'THE DOORS OPEN'; G.bannerSub = 'YOU COME BACK'; sfx.magic(); poof(P.x, P.y - 18, 30, ['#ffe36a', '#f1e7d0', '#ff2630']); return; }
    P.hp = 0; P.state = 'dead'; P.vy = -270; P.vx = 0; P.deadT = 0; RUN.by = by || 'the castle'; sfx.die(); clearRun();
  }
}
function dmgRoll(bonus) { var c = Math.random() < ST.crit + (bonus || 0); return { v: ST.dmg * (0.9 + Math.random() * 0.2) * (c ? 1.8 : 1), crit: c }; }
function attack(echoed) {
  var n0 = pshots.length; attack0();
  for (var i = n0; i < pshots.length; i++) { var q = pshots[i]; if (ST.big) { if (q.r) q.r *= 1 + 0.4 * ST.big; if (q.rv) q.rv *= 1 + 0.4 * ST.big; if (q.reach) q.reach *= 1 + 0.25 * ST.big; q.m *= 1 + 0.1 * ST.big; q.bigS = 1 + 0.4 * ST.big; } }
  if (!echoed && ST.echo && Math.random() < ST.echo) P.echoT = 0.13;
}
function attack0() {
  if (homOn()) { homAttack(); return; }
  var c = CLASSES[RUN.cls], cd = c.cd * ST.atkMul; P.atkCd = cd; P.attackT = 0.22;
  if (c.atk === 'shot') { sfx.shoot(); pshots.push({ k: 'shot', x: P.x + P.face * 12, y: P.y - P.h * 0.55, vx: P.face * 300, vy: 0, life: 0.55, r: 6, rv: 10, m: 1 }); }
  else if (c.atk === 'whip') { // a three-hit combo: slap, slap, then a tail spin that throws a wave
    P.combo = G.t - (P.lastAtk || -9) < 0.7 ? (P.combo || 0) + 1 : 0; P.lastAtk = G.t;
    sfx.whip(); pshots.push({ k: 'whip', x: P.x, y: P.y, life: 0.13, m: 1.0, hit: {}, x2: P.x });
    if (P.combo % 3 === 2) { P.spin = 0.32; sfx.splat(); pshots.push({ k: 'acid', look: 'wave', x: P.x + P.face * 14, y: P.y - 14, vx: P.face * 280, vy: 0, life: 0.55, r: 8, rv: 12, m: 1.1, pierce: 1, hit: {}, col: '#9adfff' }); P.atkCd = cd * 1.4; }
  }
  else if (c.atk === 'pie') { sfx.lob(); pshots.push({ k: 'pie', x: P.x + P.face * 12, y: P.y - P.h * 0.62, vx: P.face * 260, vy: 0, life: 0.32, r: 10, m: 1.0 }); }
  else { sfx.spit(); pshots.push({ k: 'acid', x: P.x + P.face * 8, y: P.y - P.h * 0.6, vx: P.face * 360, vy: 0, life: 0.5, r: 4, m: 0.7 }); }
}
function special() {
  var c = CLASSES[RUN.cls];
  if (P.mana < c.specCost || P.state !== 'normal') { if (P.mana < c.specCost) sfx.no(); return; }
  P.mana -= c.specCost; P.attackT = 0.3;
  if (homOn()) { homSpecial(); return; }
  if (c.spec === 'splash') { sfx.magic(); for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; pshots.push({ k: 'shot', x: P.x, y: P.y - P.h / 2, vx: Math.cos(a) * 280, vy: Math.sin(a) * 280, life: 0.6, r: 6, m: 1 }); } }
  else if (c.spec === 'song') { sfx.magic(); fx.push({ k: 'ring', x: P.x, y: P.y - 20, age: 0, big: 1, c: '#ff9ad0' }); enemies.forEach(function (e) { e.stun = 3; }); bosses.forEach(function (b) { b.stun = Math.max(b.stun || 0, 0.8); }); healP(Math.round(ST.mhp * 0.12)); for (var nn = 0; nn < 10; nn++) { var na = nn / 10 * 6.283; pops.push({ x: P.x + Math.cos(na) * 30, y: P.y - 24 + Math.sin(na) * 18, t: nn % 2 ? '♪' : '♫', c: '#ff9ad0', age: 0 }); } }
  else if (c.spec === 'cat') { sfx.roar(); pshots.push({ k: 'cat', x: P.x, y: P.y, vx: P.face * 420, vy: 0, life: 3, m: 3, hit: {}, pass: 0, face: P.face }); }
  else { sfx.magic(); P.ooze = 3; P.oozeT = 0.5; fx.push({ k: 'ring', x: P.x, y: P.y - 14, age: 0, c: '#7dff3a' }); }
}

/* ---------- rooms ---------- */
function rsOf(k) { return RUN.rs[k] || (RUN.rs[k] = { k: {}, c: {}, d: {}, b: {} }); }
function enterRoom(k, from, at) {
  var prevArea = G.rm && !(L && L.arena) ? G.rm.area : null;
  G.rm = WORLD.rooms[k]; k = key2(G.rm.cx, G.rm.cy); G.roomKey = k; L = buildRoom(G.rm); G.lock = false; G.near = null; G.layer = null;
  var rs = rsOf(k); if (ST.snack && rs.v !== 1) healP(ST.snack); rs.v = 1;
  spawnRoom(rs);
  // which screen of a big room we come in through
  var ox = from && from.cell ? (from.cell[0] - G.rm.cx) * CW * T : 0, oy = from && from.cell ? (from.cell[1] - G.rm.cy) * CH * T : 0;
  var ly = from ? ((from.y % (CH * T)) + CH * T) % (CH * T) : 0, lx = from ? ((from.x % (CW * T)) + CW * T) % (CW * T) : 0;
  if (at) { P.x = at.x; P.y = at.y; P.vx = 0; P.vy = 0; }
  else if (!from) { P.x = L.spawnX; P.y = L.h * T - T; P.vx = 0; P.vy = 0; }
  else if (from.dir === 'r') { P.x = 10; P.y = oy + clamp(ly, 13 * T, 15 * T); }
  else if (from.dir === 'l') { P.x = L.w * T - 10; P.y = oy + clamp(ly, 13 * T, 15 * T); }
  else if (from.dir === 'd') { P.x = ox + lx; P.y = P.h + 2; }
  else if (from.dir === 'u') { P.x = ox + lx; P.y = L.h * T - 1; P.vy = -420; }
  if (P.state === 'hurt') P.state = 'normal';
  camSnap();
  var area = G.rm.area;
  if (area !== prevArea) { G.banner = 2.6; G.bannerTxt = AREAS[area].name; G.bannerSub = AREAS[area].sub; if (!RUN.seenArea) RUN.seenArea = {}; RUN.seenArea[area] = 1; }
  if (RUN.tune && RUN.tune.area !== area) RUN.tune = null; // Pulsar's track lasts until you leave his area
  music.play(RUN.tune ? RUN.tune.id : AREAS[area].music, false);
  endlessEnter();
  saveRun();
}
function spawnRoom(rs) {
  enemies = []; pshots = []; eshots = []; drops = []; parts = []; pops = []; fx = []; bosses = []; waves = []; G.crumble = {}; G.chal = null;
  L.ents.forEach(function (e) {
    if (e.k === 'enemy') {
      var ed0 = ENEMIES[e.e], n0 = ed0.pack || 1;
      for (var pj = 0; pj < n0; pj++) { var id0 = pj ? e.idx + '_' + pj : e.idx; if (rs.k[id0]) continue; var me = mkEnemy(e.e, e.x + pj * (pj % 2 ? -16 : 16), e.y, id0); if (isFlyer(ed0)) { if (ed0.ai !== 'phase' && boxSolid(me.x - me.w / 2, me.y - me.h, me.x + me.w / 2, me.y)) unstick(me); } else unstick(me); enemies.push(me); }
    }
    else if (e.k === 'drop') { if (!rs.d[e.i]) drops.push({ x: e.x, y: e.y, fly: false, vx: 0, vy: 0, age: 0, room: e.i }); }
    else if (e.k === 'chest') e.open = !!rs.c[e.i];
    else if (e.k === 'altar') e.taken = !!rs.taken;
  });
  L.movers = L.ents.filter(function (e) { return e.k === 'log'; }).map(function (e) { return { x: e.x, y: e.y, w: e.w, h: e.h, vx: e.vx, v0: e.vx, sink: e.sink, st: Math.random() * 3 }; }); L.flumeT = 0; L.water = L.ents.filter(function (e) { return e.k === 'water'; })[0] || null; lairSpawn(rs);
  if (G.rm && G.rm.type === 'challenge' && rs.done && !L.ents.some(function (e) { return e.k === 'chest' && e.chal; })) L.ents.push({ k: 'chest', x: chestSpot(L.cx0), y: 15 * T, big: 1, chal: 1, i: 'ch', open: !!rs.c.ch });
}
/* the challenge reward chest goes on open floor nearest the middle, never inside a block */
function chestSpot(cx0) {
  for (var d = 0; d < 14; d++) for (var sgn = -1; sgn <= 1; sgn += 2) { var tx = cx0 + sgn * d; if (tx < 2 || tx > L.w - 3) continue;
    var ok = true; for (var x = tx - 1; x <= tx + 1; x++) { var a = L.tiles[14 * L.w + x], a2 = L.tiles[13 * L.w + x], f = L.tiles[15 * L.w + x]; if (a !== TA || a2 !== TA || f !== TW) ok = false; }
    if (ok) return tx * T + 8; }
  return cx0 * T;
}
function roomEdges() {
  if (P.state === 'dead') return;
  var W = L.w * T, H = L.h * T;
  if (L.arena) { if (P.x < -2) leaveArena(); return; }
  var rm = G.rm, d = null, i = 0;
  var row = clamp(Math.floor((P.y - 1) / (CH * T)), 0, (rm.ch || 1) - 1), col = clamp(Math.floor(P.x / (CW * T)), 0, (rm.cw || 1) - 1);
  if (RUN && RUN.endless && P.x < 6) { P.x = 6; return; } // Endless: no way back
  if (P.x < -2) { d = 'l'; i = row; } else if (P.x > W + 2) { d = 'r'; i = row; } else if (P.y - P.h / 2 < 0 && P.vy < 0) { d = 'u'; i = col; } else if (P.y - P.h / 2 > H) { d = 'd'; i = col; }
  var exit = d && hasExit(rm, d, i), cell = exit ? exitCell(rm, d, i) : null, nk = cell ? key2(cell[0], cell[1]) : null;
  if (nk && WORLD.rooms[nk]) { G.fade = 0.18; enterRoom(nk, { dir: d, x: P.x, y: P.y, cell: cell }); }
  else { if (!hasExit(rm, 'l', row) && P.x < 6) P.x = 6; if (!hasExit(rm, 'r', row) && P.x > W - 6) P.x = W - 6; if (P.y > H + 60) { P.y = L.h * T - T; P.x = L.spawnX; } }
}
/* exits of any room, one or two screens big */
function hasExit(rm, d, i) { var ex = rm.exits || []; for (var k = 0; k < ex.length; k++) if (ex[k].d === d && ex[k].i === i) return true; return false; }
function exitCell(rm, d, i) { var cw = rm.cw || 1, ch = rm.ch || 1; return d === 'l' ? [rm.cx - 1, rm.cy + i] : d === 'r' ? [rm.cx + cw, rm.cy + i] : d === 'u' ? [rm.cx + i, rm.cy - 1] : [rm.cx + i, rm.cy + ch];
}
function bodyInFake() { var tx0 = Math.floor((P.x - P.w / 2) / T), tx1 = Math.floor((P.x + P.w / 2) / T), ty0 = Math.floor((P.y - P.h) / T), ty1 = Math.floor((P.y - 1) / T); for (var ty = ty0; ty <= ty1; ty++) for (var tx = tx0; tx <= tx1; tx++) if (tx >= 0 && ty >= 0 && tx < L.w && ty < L.h && L.tiles[ty * L.w + tx] === TF) return true; return false; }
function crumble(i) { if (G.crumble[i] === undefined) { G.crumble[i] = 0.4; sfx.land(); } }

/* ---------- enemies ---------- */
/* wide enemies can overlap a wall next to their spawn tile: slide them sideways (then up) into open space */
function unstick(e) {
  var hw = e.w / 2 - 2;
  function hit(x, y) { return boxSolid(x - hw, y - e.h + 2, x + hw, y - 2); }
  if (!hit(e.x, e.y)) return true;
  for (var d = 2; d <= 40; d += 2) for (var sgn = -1; sgn <= 1; sgn += 2) { var nx = e.x + sgn * d; if (nx > 12 && nx < L.w * T - 12 && !hit(nx, e.y)) { e.x = nx; return true; } }
  for (var u = T; u <= 3 * T; u += T) if (!hit(e.x, e.y - u)) { e.y -= u; return true; }
  return false;
}
function mkEnemy(k, x, y, idx, mini) {
  var d = ENEMIES[k], t = tierOf(), hp = Math.round(d.hp * (1 + 0.45 * (t - 1)) * ST.foeHp * (mini ? 0.5 : 1));
  return { k: k, d: d, x: x, y: y, vx: 0, vy: 0, w: d.w * (mini ? 0.7 : 1), h: d.h * (mini ? 0.7 : 1), hp: hp, mhp: hp, dmg: d.dmg * (1 + 0.3 * (t - 1)) * (mini ? 0.7 : 1), face: Math.random() < 0.5 ? -1 : 1,
    t: Math.random() * 3, st: 'go', cd: 1 + Math.random() * 2, flash: 0, stun: 0, burn: 0, poison: 0, idx: idx, mini: mini, bx: x, by: y, ph: Math.random() * 6, alive: true };
}
function updateEnemies(dt) {
  var t = tierOf();
  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i]; if (!e.alive) continue; e.t += dt; if (e.flash > 0) e.flash -= dt; if (e.safe > 0) e.safe -= dt;
    if (e.burn > 0) { e.burnT = (e.burnT || 0) - dt; if (e.burnT <= 0) { e.burnT = 0.5; e.burn--; hurtE(e, Math.max(1, ST.dmg * 0.25), 'burn'); if (!e.alive) continue; } }
    if (e.poison > 0) { e.poisT = (e.poisT || 0) - dt; if (e.poisT <= 0) { e.poisT = 0.5; e.poison--; hurtE(e, Math.max(1, ST.dmg * 0.3), 'poison'); if (!e.alive) continue; } }
    if (e.stun > 0) { e.stun -= dt; e.ghost = false; if (!isFlyer(e.d)) { e.vx = 0; moveBody(e, dt, GRAV); } continue; }
    var dx = P.x - e.x, dy = (P.y - P.h / 2) - (e.y - e.h / 2), adx = Math.abs(dx), ai = e.d.ai, sp = e.d.spd * (1 + 0.1 * (t - 1));
    if (e.swarm) { e.face = e.swarm; e.vx = e.swarm * 175; moveBody(e, dt, GRAV); if (e.swarm > 0 ? e.x > L.w * T - 34 : e.x < 34) { e.alive = false; continue; } } // a swarming rat runs straight across and is gone
    else if (ai === 'walk' || ai === 'charge' || ai === 'heavy' || ai === 'guard') {
      if (ai === 'charge' && e.st === 'go' && adx < 170 && Math.abs(dy) < 34 && (dx > 0) === (e.face > 0) && e.cd <= 0) { e.st = 'tell'; e.st2 = 0.35; }
      if (e.st === 'tell') { e.vx = 0; e.st2 -= dt; if (e.st2 <= 0) { e.st = 'rush'; e.st2 = 0.8; } }
      else if (e.st === 'rush') { e.vx = e.face * sp * 3.4; e.st2 -= dt; if (e.st2 <= 0 || e.hitWall) { e.st = 'go'; e.cd = 1.4; } }
      else if (ai === 'guard' && adx < 180 && Math.abs(dy) < 40) { e.cd -= dt; guardStep(e, dx, adx, sp, dt); }
      else { e.cd -= dt;
        // turn round at walls and ledges first, then walk, so walkers never get pinned against a wall
        if (e.hitWall) e.face = -e.face;
        var ax = e.x + e.face * (e.w / 2 + 2), below = tileAt(ax, e.y + 4);
        if (e.onGround && !solidT(below) && below !== TL && below !== TV && below !== TG) e.face = -e.face;
        if (e.face > 0 && boxSolid(e.x + e.w / 2, e.y - e.h + 2, e.x + e.w / 2 + 2, e.y - 2)) e.face = -1; else if (e.face < 0 && boxSolid(e.x - e.w / 2 - 2, e.y - e.h + 2, e.x - e.w / 2, e.y - 2)) e.face = 1;
        e.vx = e.face * sp;
        if (ai === 'heavy' && adx < 150 && e.cd <= 0 && e.onGround) { e.cd = 3.2; e.vy = -260; e.slam = 1; } }
      var wasG = e.onGround; moveBody(e, dt, GRAV);
      if (e.slam && e.onGround && !wasG) { e.slam = 0; G.shake = 6; sfx.land(); waves.push({ x: e.x - 16, y: e.y, dir: -1, life: 1.4, dmg: e.dmg }, { x: e.x + 16, y: e.y, dir: 1, life: 1.4, dmg: e.dmg }); }
    } else if (ai === 'fly') {
      var tx = P.x + Math.sin(e.t * 1.3 + e.ph) * 40, ty = P.y - 30 + Math.sin(e.t * 2.6 + e.ph) * 14;
      if (adx > 260) { tx = e.bx + Math.sin(e.t + e.ph) * 50; ty = e.by; }
      e.vx += clamp(tx - e.x, -1, 1) * 120 * dt; e.vy += clamp(ty - e.y, -1, 1) * 120 * dt; e.vx = clamp(e.vx, -sp, sp); e.vy = clamp(e.vy, -sp, sp);
      e.x += e.vx * dt; e.y += e.vy * dt; e.face = e.vx >= 0 ? 1 : -1;
      if (e.d.embers) { e.cd -= dt; if (e.cd <= 0 && adx < 90 && dy > 10) { e.cd = 1.6 + Math.random(); eshots.push({ x: e.x, y: e.y, vx: 0, vy: 40, g: 300, life: 2, r: 3, dmg: e.dmg * 0.7, k: 'ember', by: 'an ember' }); } }
    } else if (ai === 'shoot') {
      var want = P.x + (e.x < P.x ? -110 : 110), wy = P.y - 70 + Math.sin(e.t * 2 + e.ph) * 18;
      e.x += clamp(want - e.x, -sp * dt, sp * dt); e.y += clamp(wy - e.y, -sp * dt, sp * dt); e.face = dx >= 0 ? 1 : -1;
      e.cd -= dt; if (e.cd <= 0 && adx < 300) { e.cd = 2.4; var a = Math.atan2(dy, dx); eshots.push({ x: e.x, y: e.y - e.h / 2, vx: Math.cos(a) * (e.d.shotsp || 150), vy: Math.sin(a) * (e.d.shotsp || 150), life: 3, r: 5, dmg: e.dmg, k: e.d.shotk || 'fire', by: e.d.name }); sfx.fire(); }
    } else if (ai === 'hop') {
      e.cd -= dt; if (e.onGround) { e.vx *= 0.8; if (e.cd <= 0 && adx < 280) { e.cd = 1.1 + Math.random() * 0.5; e.vy = -250 - Math.random() * 60; e.vx = (dx > 0 ? 1 : -1) * sp; e.face = dx > 0 ? 1 : -1; } }
      moveBody(e, dt, GRAV);
    } else if (ai === 'tele') {
      e.cd -= dt; if (e.fade > 0) e.fade -= dt;
      if (e.cd <= 0 && adx < 320) {
        e.cd = 2.8; var spot = null;
        for (var q = 0; q < 20; q++) { var sx = P.x + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 70), sy = Math.floor(P.y / T) * T; if (sx > 24 && sx < L.w * T - 24 && !boxSolid(sx - 8, sy - 30, sx + 8, sy) && boxSolid(sx - 4, sy, sx + 4, sy + 4)) { spot = [sx, sy]; break; } }
        if (spot) { poof(e.x, e.y - 15, 10, ['#5a1a8a', '#ff2630']); e.x = spot[0]; e.y = spot[1]; e.fade = 0.3; }
        e.face = P.x > e.x ? 1 : -1; e.shootIn = 0.5;
      }
      if (e.shootIn > 0) { e.shootIn -= dt; if (e.shootIn <= 0) { var a2 = Math.atan2(dy, dx); [-0.25, 0, 0.25].forEach(function (o) { eshots.push({ x: e.x, y: e.y - 20, vx: Math.cos(a2 + o) * 170, vy: Math.sin(a2 + o) * 170, life: 2.5, r: 4, dmg: e.dmg, k: 'bolt' }); }); sfx.fire(); } }
    } else foeAI(e, dt, dx, dy, adx, sp);
    if (isFlyer(e.d) || ai === 'tele') { e.x = clamp(e.x, 20, L.w * T - 20); e.y = clamp(e.y, 30, L.h * T - 20); }
    if (e.y > L.h * T + 40 || e.x < -40 || e.x > L.w * T + 40) { e.alive = false; continue; }
    if (!isFlyer(e.d) && boxSolid(e.x - e.w / 2 + 2, e.y - e.h + 2, e.x + e.w / 2 - 2, e.y - 2)) { e.stuck = (e.stuck || 0) + dt; if (e.stuck > 0.2 && unstick(e)) e.stuck = 0; else if (e.stuck > 1.5) { e.alive = false; poof(e.x, e.y - e.h / 2, 8, ['#ff2630', '#5a0f14']); spill(e.x, e.y - e.h / 2, 2); continue; } } else e.stuck = 0;
    // touch: stomp or get hurt
    if (P.state === 'dead' || e.ghost) continue;
    if (ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, e.x - e.w / 2, e.y - e.h, e.x + e.w / 2, e.y)) {
      if (e.d.burst) { hurtE(e, 999, 'pop'); continue; }
      // a stomp: falling onto the top of a foe (judged from where your feet were last frame, so hopping slimes count),
      // or landing on a second foe in the same moment as the first
      var feet0 = P.y - P.vy / 60, top = e.y - e.h, recent = G.t - (P.stompT || -9) < 0.15;
      if (e.safe > 0) continue;
      if (P.state === 'normal' && ((P.vy > 0 && feet0 <= top + 10) || (recent && P.y <= e.y - e.h * 0.4))) { stompBounce(); hurtE(e, ST.dmg * (RUN.cls === 'cumhead' ? 2 : 1.5) * (ST.stompMul || 1), 'stomp'); }
      else if (P.ooze > 0) { if (!e.oozeHit || G.t - e.oozeHit > 0.5) { e.oozeHit = G.t; hurtE(e, ST.dmg * 0.6, 'ooze'); } }
      else if (recent) continue; // no hurting the heir in the moment after a stomp
      else { if (ST.thorns && P.inv <= 0 && G.t - (e.thornT || -9) > 1) { e.thornT = G.t; hurtE(e, ST.dmg * 0.8 * ST.thorns, 'thorns'); } hurtP(e.dmg, e.x, 'a ' + e.d.name.toLowerCase()); }
    }
  }
  enemies = enemies.filter(function (q) { return q.alive; });
}
function stompBounce() { P.stompT = G.t; sfx.stomp(); P.vy = input.j ? -320 : -235; P.onGround = false; P.jumpHeld = input.j; P.jumps = 1; }
function hurtE(e, dmg, src) {
  if (!e.alive) return;
  var crit = false; if (src === 'hit' || src === 'stomp') { crit = Math.random() < ST.crit; if (crit) dmg *= 1.8; }
  if (e.marked > G.t) dmg *= 1.5; // Peeper's Third Eye
  if (src !== 'burn' && src !== 'poison') { if (ST.berserk && P.hp < ST.mhp * 0.4) dmg *= 1 + ST.berserk; if (ST.slayer && e.boss) dmg *= 1 + ST.slayer; if (ST.cold && !e.boss && Math.random() < ST.cold) e.stun = Math.max(e.stun || 0, 1.2); }
  dmg = Math.max(1, Math.round(dmg)); e.hp -= dmg; e.flash = 0.15;
  pop(e.x, e.y - e.h - 4, String(dmg) + (crit ? '!' : ''), crit ? '#ffe36a' : (src === 'poison' ? '#7dff3a' : src === 'burn' ? '#ffb040' : '#fff'));
  if (src !== 'burn' && src !== 'poison') {
    if (ST.leech) healP(Math.max(1, Math.round(dmg * ST.leech)), true);
    if (ST.siphon) P.mana = Math.min(ST.mmana, P.mana + ST.siphon);
    if (ST.burn && Math.random() < 0.35) e.burn = 4;
    if (src !== 'stomp' && !e.boss) { e.x += (e.x < P.x ? -4 : 4); }
    sfx.hit();
  }
  if (e.hp <= 0) {
    e.alive = false; G.shake = Math.max(G.shake, 3); homGain(e.boss ? 80 : 10);
    if (e.boss) { bossDown(e); return; }
    sfx.kill(); poof(e.x, e.y - e.h / 2, 10, ['#ff2630', '#b3121c', '#f1e7d0']); RUN.kills++;
    if (e.idx !== undefined && e.idx !== null && (typeof e.idx === 'string' || e.idx >= 0)) rsOf(G.roomKey).k[e.idx] = 1;
    if (e.d.burst) burstShards(e);
    if (!e.swarm) spill(e.x, e.y - e.h / 2, (e.d.drops || 2) + tierOf());
    // Cum Crackers: a fair chance from anything, more likely when you are hurting
    if (Math.random() < (e.swarm ? 0.04 : 0.16) + (P.hp < ST.mhp * 0.4 ? 0.12 : 0)) dropCracker(e.x, e.y - e.h / 2);
    P.mana = Math.min(ST.mmana, P.mana + 4 + (ST.soul || 0));
    if (ST.lucky && Math.random() < ST.lucky) { healP(Math.round(ST.mhp * 0.1)); pop(e.x, e.y - e.h - 12, 'LUCKY', '#7dff9a'); }
    if (RUN.cls === 'spermaid') healP(3);
    if (ST.boom) { fx.push({ k: 'ring', x: e.x, y: e.y - e.h / 2, age: 0, c: '#ffb040' }); enemies.forEach(function (o) { if (o.alive && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 50) hurtE(o, ST.dmg * 0.8, 'boom'); }); }
    if (e.d.onDie) e.d.onDie(e);
    if (e.d.split && !e.mini) { for (var s = -1; s <= 1; s += 2) { var m = mkEnemy(e.k, e.x + s * 8, e.y, -1, true); m.vy = -200; m.vx = s * 60; m.safe = 0.5; enemies.push(m); } }
  }
}
function dropCracker(x, y) { drops.push({ x: x, y: y, fly: true, vx: (Math.random() - 0.5) * 80, vy: -230, age: 0, crk: 1 }); }
function spill(x, y, n) {
  for (var i = 0; i < n; i++) { var a = -Math.PI * (0.15 + 0.7 * (i / Math.max(1, n - 1))), s = 80 + Math.random() * 90; drops.push({ x: x, y: y, fly: true, vx: Math.cos(a) * s, vy: Math.sin(a) * s, age: 0 }); }
}

/* ---------- player shots, enemy shots, shockwaves ---------- */
function shotHits(s, x0, y0, x1, y1) {
  var hitAny = false;
  enemies.forEach(function (e) { if (!e.alive || e.ghost || (s.hit && s.hit[e.uid || (e.uid = Math.random())])) return; if (ov(x0, y0, x1, y1, e.x - e.w / 2, e.y - e.h, e.x + e.w / 2, e.y)) { hitAny = true; if (s.hit) s.hit[e.uid] = 1; hitShot(s, e); } });
  bosses.forEach(function (b) { if (!b.alive || b.hidden || (s.hit && s.hit[b.uid || (b.uid = Math.random())])) return; if (ov(x0, y0, x1, y1, b.x - b.w / 2, b.y - b.h, b.x + b.w / 2, b.y)) { hitAny = true; if (s.hit) s.hit[b.uid] = 1; hitShot(s, b); } });
  return hitAny;
}
function hitShot(s, e) {
  if (shieldBlock(s, e)) return;
  var r = dmgRoll(s.crit); hurtE(e, r.v * s.m, 'hit');
  if (s.k === 'acid') e.poison = 3;
  homHit(s, e);
}
function splash(x, y, r, m) { sfx.splat(); fx.push({ k: 'ring', x: x, y: y, age: 0, c: '#f1e7d0' }); poof(x, y, 12, ['#f1e7d0', '#fff6d8', '#d9b36a']); var s = { m: m, k: 'pie', x: x }; enemies.concat(bosses).forEach(function (e) { if (e.alive && Math.hypot(e.x - x, (e.y - e.h / 2) - y) < r + e.w / 2) hitShot(s, e); }); }
function updateShots(dt) {
  for (var i = 0; i < pshots.length; i++) {
    var s = pshots[i]; s.life -= dt;
    if (s.k === 'claw') { var cx0 = P.face > 0 ? P.x : P.x - 52, cx1 = P.face > 0 ? P.x + 52 : P.x; shotHits(s, cx0, P.y - P.h - 4, cx1, P.y); continue; }
    if (s.k === 'melee') { var mx0 = P.face > 0 ? P.x - (s.back || 0) : P.x - s.reach, mx1 = P.face > 0 ? P.x + s.reach : P.x + (s.back || 0); shotHits(s, mx0, P.y - s.h, mx1, P.y); continue; }
    if (s.k === 'whip') { var x0 = P.face > 0 ? P.x : P.x - 46, x1 = P.face > 0 ? P.x + 46 : P.x; shotHits(s, x0, P.y - 36, x1, P.y - 2); continue; }
    if (s.k === 'cat') {
      s.x += s.vx * dt; var gx = Math.floor(s.x / T);
      if (s.x < 8 || s.x > L.w * T - 8 || solidT(tileAt(s.x + Math.sign(s.vx) * 8, s.y - 6))) { s.pass++; s.vx = -s.vx; s.face = -s.face; s.hit = {}; if (s.pass >= 2) s.life = 0; }
      shotHits(s, s.x - 14, s.y - 20, s.x + 14, s.y); if (Math.random() < 0.5) parts.push({ x: s.x, y: s.y - 4, vx: -s.vx * 0.1, vy: -30, life: 0.3, c: '#f1e7d0' }); continue;
    }
    if (s.g) s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    var tt = tileAt(s.x, s.y);
    if (s.ground && !solidT(tileAt(s.x, s.y + 10)) && tileAt(s.x, s.y + 10) !== TL) { s.life = 0; continue; } // shockwaves stop at a drop
    if (solidT(tt) || s.y > L.h * T) {
      if (s.bounce > 0 && s.vy > 0) { s.bounce--; s.y = Math.floor(s.y / T) * T - 1; s.vy = -Math.abs(s.vy) * 0.55; continue; }
      if (s.boom) homBlast(s); else if (s.k === 'pie') splash(s.x, s.y, 24, s.m * 0.5); else poof(s.x, s.y, 4, [s.col || '#f1e7d0']); s.life = 0; continue; }
    if (shotHits(s, s.x - s.r, s.y - (s.rv || s.r), s.x + s.r, s.y + (s.rv || s.r))) { if (s.k === 'pie') splash(s.x, s.y, 24, s.m * 0.4); if (!s.pierce) s.life = 0; }
    else if (s.k === 'pie' && s.life <= 0) poof(s.x, s.y, 8, ['#f1e7d0', '#fff6d8', '#c8903a']);
  }
  pshots = pshots.filter(function (q) { return q.life > 0; });
  for (i = 0; i < eshots.length; i++) {
    var b = eshots[i]; b.life -= dt; if (b.g) b.vy += b.g * dt;
    if (b.home && b.life > 0.6) { var ha = Math.atan2((P.y - P.h / 2) - b.y, P.x - b.x), hs = Math.hypot(b.vx, b.vy) || 1, ca = Math.atan2(b.vy, b.vx), dA = ((ha - ca + Math.PI * 3) % (Math.PI * 2)) - Math.PI; ca += clamp(dA, -2.4 * dt, 2.4 * dt); hs = Math.min(190, hs + 120 * dt); b.vx = Math.cos(ca) * hs; b.vy = Math.sin(ca) * hs; } /* swimmers home in */
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.k !== 'ghost' && solidT(tileAt(b.x, b.y))) { b.life = 0; if (b.k === 'pie') splat(b.x, b.y); else poof(b.x, b.y, 4, b.k === 'drip' ? dripC() : b.k === 'dagger' || b.k === 'bone' ? ['#f1e7d0', '#a6968f'] : ['#ff9a40', '#ff2630']); continue; }
    if (b.safe > 0) { b.safe -= dt; continue; }
    if (P.state !== 'dead' && ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r)) { hurtP(b.dmg, b.x, b.by || 'a fireball'); b.life = 0; }
  }
  eshots = eshots.filter(function (q) { return q.life > 0 && q.x > -40 && q.x < L.w * T + 40 && q.y > -60 && q.y < L.h * T + 40; });
  for (i = 0; i < waves.length; i++) {
    var w = waves[i]; w.x += w.dir * 150 * dt; w.life -= dt;
    if (solidT(tileAt(w.x + w.dir * 6, w.y - 6))) w.life = 0;
    if (P.state !== 'dead' && ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, w.x - 8, w.y - 14, w.x + 8, w.y)) hurtP(w.dmg, w.x, w.by || 'a shockwave');
  }
  waves = waves.filter(function (q) { return q.life > 0; });
}

/* ---------- drops, chests and the other things in a room ---------- */
function updateDrops(dt) {
  var keep = [];
  for (var i = 0; i < drops.length; i++) {
    var d = drops[i]; d.age += dt;
    if (d.fly) {
      d.vy += 700 * dt; d.x += d.vx * dt; var py = d.y; d.y += d.vy * dt;
      var t = tileAt(d.x, d.y + 5); if (d.vy > 0 && (solidT(t) || ((t === TL || t === TV || t === TG) && py + 5 <= Math.floor((d.y + 5) / T) * T + 1))) { d.y = Math.floor((d.y + 5) / T) * T - 5; d.vy *= -0.5; d.vx *= 0.8; if (Math.abs(d.vy) < 30) d.vy = 0; }
      if (solidT(tileAt(d.x, d.y))) d.vx = -d.vx;
      if ((d.age > (d.crk ? 16 : 9)) || d.y > L.h * T + 30) continue;
    }
    if (P.state !== 'dead' && (!d.fly || d.age > 0.35)) {
      var dx = d.x - P.x, dy = d.y - (P.y - P.h / 2);
      if (d.crk && (P.hp >= ST.mhp || ST.noHeal)) { keep.push(d); continue; } /* full health: the cracker waits for later */
      if (dx * dx + dy * dy < 17 * 17 && d.crk) { var hb = P.hp; healP(Math.round(ST.mhp * 0.12) + 6, true); pop(P.x, P.y - P.h - 6, 'CUM CRACKER +' + Math.round(P.hp - hb), '#7dff9a'); sfx.pick(G.t); RUN.crackers = (RUN.crackers || 0) + 1; continue; }
      if (dx * dx + dy * dy < 17 * 17) { var v = d.val || dropVal(); RUN.drops += v; sfx.pick(G.t); homGain(2); if (d.room !== undefined) rsOf(G.roomKey).d[d.room] = 1; continue; }
      var mr = ST.magnet ? 50 + 70 * ST.magnet : 50;
      if (dx * dx + dy * dy < mr * mr && (d.fly || ST.magnet) && d.age > 0.6) { d.x -= dx * 3 * dt; d.y -= dy * 3 * dt; }
    }
    keep.push(d);
  }
  drops = keep;
}
function findNear() {
  if (P.state !== 'normal' || G.lock) return null;
  var best = null, bd = 1e9;
  L.ents.forEach(function (e) {
    var dx = Math.abs(e.x - P.x), dy = Math.abs(e.y - P.y), r = 0;
    if (e.k === 'chest' && !e.open) r = 22; else if (e.k === 'shrine' && !rsOf(G.roomKey).prayed) r = 24; else if (e.k === 'portal') r = 22; else if (e.k === 'cell' && !rsOf(G.roomKey).freed) r = 26; else if (e.k === 'feast' && !rsOf(G.roomKey).ate) r = 40; else if (e.k === 'gamble' && !rsOf(G.roomKey).broke && !(e.spin > 0)) r = 24; else if (e.k === 'door') r = 26; else if (e.k === 'npc') r = 26; else if (e.k === 'altar' && !e.taken) r = 24; else return;
    if (dx < r && dy < 30 && dx < bd) { bd = dx; best = e; }
  });
  return best;
}
function useThing(e) {
  var rs = rsOf(G.roomKey);
  if (e.k === 'chest') {
    e.open = true; rs.c[e.i] = 1; sfx.chest(); spill(e.x, e.y - 10, e.big ? 22 : 12); poof(e.x, e.y - 8, 14, ['#ffe36a', '#f1e7d0']);
    if (e.chal || (e.secret && Math.random() < 0.5)) { var pw = shuffle(POWERS.slice())[0]; grantPower(pw.id); }
    if (e.ambush && !rs.amb) startAmbush(rs);
    findBlueprint(e.chal ? 0.45 : e.secret ? 0.6 : e.big ? 0.3 : 0.06);
    saveRun();
  } else if (e.k === 'door') openDoor(e);
  else if (e.k === 'npc') openMerchant(e);
  else if (e.k === 'altar') openAltar(e);
  else if (e.k === 'shrine') pray(e);
  else if (e.k === 'portal') usePortal(e);
  else if (e.k === 'cell') rescue(e);
  else if (e.k === 'feast') openFeast(e);
  else if (e.k === 'gamble') openGamble(e);
}
function grantPower(id) {
  var p = powerById(id); RUN.powers.push(id); var oldM = ST.mhp; ST = calcStats();
  if (id === 'heart') P.hp += 25; P.hp = Math.min(P.hp, ST.mhp);
  G.banner = 2; G.bannerTxt = p.name.toUpperCase(); G.bannerSub = p.d.toUpperCase(); sfx.oneup(); saveRun();
}
function updateRoomThings(dt) {
  // illusion ledges giving way
  for (var k in G.crumble) { G.crumble[k] -= dt; if (G.crumble[k] <= 0) { var i = +k; if (L.tiles[i] === TV) { L.tiles[i] = TA; G.layer = null; poof((i % L.w) * T + 8, Math.floor(i / L.w) * T + 4, 8, ['#4a1a1c', '#2a0509']); } delete G.crumble[k]; } }
  // logs drift down the flume and go round again
  if (L.movers && L.water) { L.flumeT += dt; var cyc = L.flumeT % 9; L.surge = cyc > 6.4 ? 1 : cyc > 5.6 ? 0.5 : 0; if (L.surge === 1 && cyc - dt <= 6.4) { sfx.splat(); pop(P.x, P.y - P.h - 8, 'SURGE!', '#fff6d8'); } } /* every 9 s the cream surges and the boats speed up */
  if (L.movers) L.movers.forEach(function (m) {
    m.vx = m.v0 * (L.surge === 1 ? 1.8 : 1);
    if (m.sink) { m.st = (m.st + dt) % 6.5; m.warn = m.st > 4.2 && m.st < 5.2; var was = m.under; m.under = m.st >= 5.2; if (m.under && !was) { sfx.splat(); poof(m.x, m.y - 2, 10, ['#fff6d8', '#e6cf98']); if (P.mover === m) { P.mover = null; P.onGround = false; } } }
    m.x += m.vx * dt; if (m.x > L.water.x1 - m.w / 2) { m.x = L.water.x0 + m.w / 2; if (P.mover === m) P.mover = null; } });
  // trap turrets
  L.ents.forEach(function (e) {
    if (e.k !== 'turret') return; e.cd -= dt;
    if (e.cd <= 0) { e.cd = 2.2; eshots.push({ x: e.x + e.dir * 8, y: e.y, vx: e.dir * 160, vy: 0, life: 4, r: 5, dmg: 10 + 3 * tierOf(), k: 'fire', by: 'a wall cannon' }); sfx.fire(); }
  });
  // challenge rooms: lock the doors, three waves, then a chest
  if (G.rm && G.rm.type === 'challenge' && !L.arena) {
    var rs = rsOf(G.roomKey), trg = L.ents.filter(function (e) { return e.k === 'trigger'; })[0];
    if (!rs.done && !G.chal && trg && P.x > trg.x0 && P.x < trg.x1 && P.state === 'normal') { G.chal = { wave: 0, wait: 0.8 }; G.lock = true; G.layer = null; sfx.lock(); G.banner = 1.8; G.bannerTxt = 'CHALLENGE'; G.bannerSub = 'SURVIVE THREE WAVES'; lockExits(true); }
    if (G.chal && !rs.done) {
      if (!enemies.length) { G.chal.wait -= dt; if (G.chal.wait <= 0) { if (G.chal.wave >= 3) { rs.done = 1; G.chal = null; G.lock = false; lockExits(false); G.layer = null; sfx.goal(); G.banner = 1.8; G.bannerTxt = 'CHALLENGE CLEARED'; G.bannerSub = 'A CHEST APPEARS'; L.ents.push({ k: 'chest', x: L.cx0 * T, y: 15 * T, big: 1, chal: 1, i: 'ch', open: false }); saveRun(); } else { G.chal.wave++; G.chal.wait = 1.2; spawnWave(2 + tierOf() + G.chal.wave - 1); } } }
    }
  }
  ambushStep(dt); quirkStep(dt); lairStep(dt);
  G.near = findNear();
}
function lockExits(on) {
  var rm = G.rm, W = L.w, y, x;
  function S(x, y, v) { L.tiles[y * W + x] = v; }
  if (rm.ex.l) for (y = 12; y <= 14; y++) S(0, y, on ? TB : TA);
  if (rm.ex.r) for (y = 12; y <= 14; y++) S(W - 1, y, on ? TB : TA);
  if (rm.ex.u) for (x = 14; x <= 17; x++) S(x, 0, on ? TB : TA);
  if (rm.ex.d) for (x = 14; x <= 17; x++) S(x, L.h - 1, on ? TB : TG);
}
function spawnWave(n) {
  var pool = AREAS[G.rm.area].pool, tot = 0; pool.forEach(function (p) { tot += p[1]; });
  for (var i = 0; i < n; i++) {
    var v = Math.random() * tot, k = pool[0][0]; for (var j = 0; j < pool.length; j++) { v -= pool[j][1]; if (v <= 0) { k = pool[j][0]; break; } }
    var d = ENEMIES[k], x = (5 + Math.random() * 22) * T, y = isFlyer(d) ? (3 + Math.random() * 4) * T : 15 * T;
    if (Math.abs(x - P.x) < 50) x = clamp(x + 100 * (x < P.x ? -1 : 1), 5 * T, 27 * T);
    if (!isFlyer(d)) { for (var ty = 15; ty > 1; ty--) { if (boxSolid(x - 6, ty * T - d.h, x + 6, ty * T) === null && (boxSolid(x - 4, ty * T, x + 4, ty * T + 2) || tileAt(x, ty * T + 1) === TL)) { y = ty * T; break; } } }
    var e = mkEnemy(k, x, y, -1); e.cd = 1; unstick(e); enemies.push(e); poof(x, y - 10, 10, ['#ff2630', '#5a0f14']);
  }
}

/* ---------- small visual effects ---------- */
function poof(x, y, n, cols) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 40 + Math.random() * 90; parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.5 + Math.random() * 0.3, c: cols[i % cols.length] }); } }
function pop(x, y, t, c) { pops.push({ x: x, y: y, t: t, c: c, age: 0 }); }
function updateFx(dt) {
  for (var i = 0; i < parts.length; i++) { var q = parts[i]; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.spark ? 20 : 360) * dt; q.life -= dt; }
  parts = parts.filter(function (q) { return q.life > 0; });
  pops.forEach(function (p) { p.age += dt; p.y -= 26 * dt; }); pops = pops.filter(function (p) { return p.age < 0.8; });
  fx.forEach(function (f) { f.age += dt; }); fx = fx.filter(function (f) { return f.age < 0.45; });
}
function camTarget() {
  var W = L.w * T, H = L.h * T, tx = P.x - VW * 0.5 + P.face * 20;
  return { x: W <= VW ? (W - VW) / 2 : clamp(tx, 0, W - VW), y: H <= VH ? 0 : clamp(P.y - VH * 0.6, 0, H - VH) };
}
function camSnap() { var c = camTarget(); G.cam.x = c.x; G.cam.y = c.y; }

function stepPlay(dt) {
  RUN.t += dt;
  if (CUT) { cutStep(dt); updateFx(dt); return; } // a cutscene holds the action
  updatePlayer(dt);
  if (G.mode !== 'play') return;
  G.inFake = bodyInFake(); if (G.inFake && Math.random() < 0.7) parts.push({ x: P.x + (Math.random() - 0.5) * 22, y: P.y - Math.random() * P.h, vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 40, life: 0.45, c: pick(['#ffe36a', '#fff6d8', '#d878ff', '#f1e7d0']), spark: 1 });
  updateEnemies(dt); updateBosses(dt); moonFxStep(dt); lairFxStep(dt); updateShots(dt); updateDrops(dt); updateRoomThings(dt); updateFx(dt);
  var c = camTarget(); G.cam.x += (c.x - G.cam.x) * Math.min(1, dt * 7); G.cam.y += (c.y - G.cam.y) * Math.min(1, dt * 6);
  endlessStep(dt);
  if (G.findDue > 0) { G.findDue -= dt; if (G.findDue <= 0) findBlueprint(1); }
  if (G.sealDue) { G.sealDue.t -= dt; if (G.sealDue.t <= 0) { var sn = G.sealDue.n; G.sealDue = null; sealScene(sn); } }
  if (G.rm && G.rm.entry && G.rm.area === 'city' && !META.metSteve && !L.arena) { var stv = L.ents.filter(function (e) { return e.k === 'steve'; })[0]; if (stv && Math.abs(P.x - stv.x) < 90 && P.onGround) steveScene(stv); }
  if (P.state !== 'dead' && P.hp < ST.mhp * 0.25 && !G.lowWarn) { G.lowWarn = 1; } else if (P.hp >= ST.mhp * 0.25) G.lowWarn = 0;
}
