/* =====================================================================================================
   EXTRAS: the newer foes' moves, the newer room types (shrine, slot machine, ambush) and each area's quirks
     castle: chandeliers that drop when you walk under them
     roof: gusts of wind and lightning strikes (a marker shows where it will land)
     Ejaculand: bounce pads
     dungeon: drips from the ceiling, and some rooms are pitch dark
   ===================================================================================================== */

/* ---------- foes ---------- */
function ledgeAhead(e) { var bl = tileAt(e.x + e.face * (e.w / 2 + 2), e.y + 4); return e.onGround && !solidT(bl) && bl !== TL && bl !== TV && bl !== TG; }
function patrol(e, sp) {
  if (e.hitWall) e.face = -e.face;
  if (ledgeAhead(e)) e.face = -e.face;
  e.vx = e.face * sp;
}
function guardStep(e, dx, adx, sp, dt) { // the knight turns to face you (slowly, so you can get behind him) and edges in behind his shield
  var want = dx > 0 ? 1 : -1;
  if (want !== e.face) { e.turnT = (e.turnT || 0) + dt; if (e.turnT > 0.7) { e.face = want; e.turnT = 0; } else { e.vx = 0; return; } } else e.turnT = 0;
  e.vx = ledgeAhead(e) || adx < 16 ? 0 : e.face * sp * 0.75;
}
function shieldBlock(s, e) {
  if (!e.d || !e.d.shield || e.stun > 0 || s.k === 'cat') return false;
  var sx = (s.k === 'whip' || s.k === 'claw' || s.x === undefined) ? P.x : s.x;
  if ((sx - e.x) * e.face <= 0) return false; // hit from behind
  pop(e.x, e.y - e.h - 4, 'BLOCK', '#a6968f'); sfx.click();
  for (var i = 0; i < 5; i++) parts.push({ x: e.x + e.face * 10, y: e.y - 18, vx: e.face * (40 + Math.random() * 60), vy: -60 - Math.random() * 60, life: 0.3, c: i % 2 ? '#ffe36a' : '#f1e7d0' });
  return true;
}
function foeAI(e, dt, dx, dy, adx, sp) {
  var ai = e.d.ai, a, d;
  if (ai === 'phase') { // the wraith drifts through walls, and fades out now and then (nothing touches it while it is faded)
    e.pt = (e.pt || 0) + dt; e.ghost = (e.pt % 4.6) > 3.2;
    var tx = adx < 320 ? P.x : e.bx, ty = adx < 320 ? P.y - 2 : e.by; d = Math.hypot(tx - e.x, ty - e.y);
    if (d > 4) { e.x += (tx - e.x) / d * sp * dt; e.y += (ty - e.y) / d * sp * dt; }
    e.face = dx >= 0 ? 1 : -1;
  } else if (ai === 'perch') { // the gargoyle clings to the ceiling as stone, then swoops when you pass beneath
    if (e.st === 'go') { e.fr = 0; e.x = e.bx; e.y = e.by; e.cd -= dt; if (e.cd <= 0 && adx < 120 && P.y > e.y + 16) { e.st = 'tell'; e.st2 = 0.4; } }
    else if (e.st === 'tell') { e.fr = 1; e.x = e.bx + (Math.random() - 0.5) * 3; e.st2 -= dt; if (e.st2 <= 0) { e.ty = P.y - 6; a = Math.atan2(e.ty - e.y, P.x - e.x); e.vx = Math.cos(a) * sp; e.vy = Math.sin(a) * sp; e.st = 'swoop'; e.st2 = 1; sfx.whip(); } }
    else if (e.st === 'swoop') { e.fr = 1 + Math.floor(e.t * 12) % 3; e.x += e.vx * dt; e.y += e.vy * dt; e.face = e.vx >= 0 ? 1 : -1; e.st2 -= dt; if (e.st2 <= 0 || e.y >= e.ty || boxSolid(e.x - 6, e.y - 4, e.x + 6, e.y)) e.st = 'rise'; }
    else { e.fr = 1 + Math.floor(e.t * 10) % 3; d = Math.hypot(e.bx - e.x, e.by - e.y); if (d < 3) { e.st = 'go'; e.cd = 1.8; } else { e.x += (e.bx - e.x) / d * 80 * dt; e.y += (e.by - e.y) / d * 80 * dt; e.face = e.bx >= e.x ? 1 : -1; } }
  } else if (ai === 'dive') { // the crow circles above you, then dives
    if (e.st === 'go') {
      var cx = P.x + Math.sin(e.t * 1.5 + e.ph) * 70, cy = P.y - 85;
      e.vx += clamp(cx - e.x, -1, 1) * 160 * dt; e.vy += clamp(cy - e.y, -1, 1) * 160 * dt; e.vx = clamp(e.vx, -sp, sp); e.vy = clamp(e.vy, -sp, sp);
      e.cd -= dt; if (e.cd <= 0 && adx < 180) { a = Math.atan2(P.y - 10 - e.y, dx); e.vx = Math.cos(a) * sp * 2.8; e.vy = Math.sin(a) * sp * 2.8; e.st = 'dive'; e.st2 = 0.9; }
    } else if (e.st === 'dive') { e.st2 -= dt; if (e.st2 <= 0 || boxSolid(e.x - 4, e.y - 4, e.x + 4, e.y)) { e.st = 'up'; e.st2 = 0.7; e.vy = -90; e.vx *= 0.4; } }
    else { e.st2 -= dt; if (e.st2 <= 0) { e.st = 'go'; e.cd = 1.4 + Math.random(); } }
    e.x += e.vx * dt; e.y += e.vy * dt; e.face = e.vx >= 0 ? 1 : -1;
  } else if (ai === 'lob') { // the clown walks about and lobs cream pies over walls
    if (e.st === 'wind') { e.vx = 0; e.fr = 3; e.st2 -= dt; if (e.st2 <= 0) { throwPie(e); e.st = 'go'; e.cd = 2.4; e.fr = null; } }
    else { e.fr = null; e.cd -= dt; patrol(e, sp); if (e.cd <= 0 && adx > 30 && adx < 240 && Math.abs(dy) < 130 && e.onGround) { e.st = 'wind'; e.st2 = 0.45; e.face = dx > 0 ? 1 : -1; } }
    moveBody(e, dt, GRAV);
  } else if (ai === 'heart') { heartAI(e, dt);
  } else if (ai === 'slug') { // the magma slug crawls along slowly and leaves burning puddles behind it
    patrol(e, adx < 160 && Math.abs(dy) < 40 && (dx > 0) === (e.face > 0) ? sp * 1.6 : sp); moveBody(e, dt, GRAV);
    e.cd -= dt; if (e.cd <= 0 && e.onGround) { e.cd = 1.1; eshots.push({ x: e.x - e.face * 12, y: e.y - 4, vx: 0, vy: 0, life: 3.2, r: 6, dmg: e.dmg * 0.6, k: 'lava', by: 'a magma puddle', safe: 0.3 }); }
  } else if (ai === 'float') { // Steve balloons bob towards you and burst into shrapnel
    var fx2 = P.x + Math.sin(e.t * 0.8 + e.ph) * 30, fy2 = P.y - 20 + Math.sin(e.t * 2 + e.ph) * 8;
    var mx = clamp(fx2 - e.x, -sp, sp) * dt, my = clamp(fy2 - e.y, -sp, sp) * dt;
    if (!boxSolid(e.x + mx - 7, e.y - e.h, e.x + mx + 7, e.y - 12)) e.x += mx;
    if (!boxSolid(e.x - 7, e.y + my - e.h, e.x + 7, e.y + my - 12)) e.y += my;
    e.face = 1;
  } else if (ai === 'flail') { // the jailer swings his ball and chain round when you get close
    e.cd -= dt;
    if (e.swing > 0) {
      e.swing -= dt; e.swA += dt * 8 * e.face; e.vx = ledgeAhead(e) ? 0 : e.face * sp * 0.3;
      e.ballX = e.x + Math.cos(e.swA) * 40; e.ballY = e.y - 20 + Math.sin(e.swA) * 28;
      if (P.state !== 'dead' && Math.hypot(P.x - e.ballX, P.y - P.h / 2 - e.ballY) < 13) hurtP(e.dmg, e.ballX, 'a ball and chain');
      if (e.swing <= 0) e.ballX = null;
    } else {
      if (adx < 200 && Math.abs(dy) < 50) { e.face = dx > 0 ? 1 : -1; e.vx = ledgeAhead(e) || adx < 20 ? 0 : e.face * sp; } else patrol(e, sp * 0.7);
      if (e.cd <= 0 && adx < 85 && Math.abs(dy) < 50) { e.swing = 1.3; e.swA = -Math.PI / 2; e.cd = 3.4; sfx.whip(); }
    }
    moveBody(e, dt, GRAV);
  }
}
function throwPie(e) {
  var sx = e.x + e.face * 8, sy = e.y - 26, tx = P.x, ty = P.y - 10, tt = clamp(Math.abs(tx - sx) / 150, 0.55, 1.3), g = 520;
  var k = e.d.shot || 'pie', by = { pie: 'a cream pie', dagger: "a cultist's dagger", bone: 'a thrown bone', blob: 'a glob of Blum' }[k];
  eshots.push({ x: sx, y: sy, vx: (tx - sx) / tt, vy: (ty - sy - 0.5 * g * tt * tt) / tt, g: g, life: 3, r: 5, dmg: e.dmg, k: k, by: by }); sfx.lob();
}
function burstShards(e) {
  var cy = e.y - e.h + 8; sfx.stomp(); poof(e.x, cy, 12, ['#ff2630', '#1e1418', '#f1e7d0']);
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + 0.2; eshots.push({ x: e.x, y: cy, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, life: 0.5, r: 3, dmg: e.dmg, k: 'shard', by: 'balloon shrapnel', safe: 0.06 }); }
}
function splat(x, y) { sfx.splat(); poof(x, y, 10, ['#f1e7d0', '#fff6d8', '#c8903a']); }

/* ---------- new room types ---------- */
function pray(e) {
  var rs = rsOf(G.roomKey); rs.prayed = 1; sfx.magic();
  poof(e.x, e.y - 24, 18, ['#ff2630', '#ff9ad0', '#f1e7d0']);
  if (ST.noHeal) pop(P.x, P.y - P.h - 8, 'THE FOUNTAIN IS DRY', '#a6968f');
  else { healP(Math.round(ST.mhp * 0.4)); P.mana = ST.mmana; G.banner = 1.6; G.bannerTxt = 'BLOOD FOUNTAIN'; G.bannerSub = 'HEALTH AND MANA RESTORED'; }
  saveRun();
}
function gambleCost(rs) { return Math.round((40 + 25 * tierOf()) * Math.pow(1.5, rs.pulls || 0)); }
function openGamble(e) {
  var rs = rsOf(G.roomKey); if (rs.broke) return;
  openMenu({ title: e.park ? "Steve's Prize Wheel" : 'The Cursed Slot', note: '', pic: null, bank: 'run', rebuild: function () {
    var c = gambleCost(rs), left = 3 - (rs.pulls || 0);
    return { note: 'Pay to play. The house usually wins. It is rattling: ' + left + (left === 1 ? ' go' : ' goes') + ' left in it.', rows: [{ icon: 'coin', name: e.park ? 'SPIN THE WHEEL' : 'PULL THE LEVER', sub: 'A powerup, a jackpot, nothing at all, or a nasty surprise', price: fmtN(c), cls: 'sec', fn: function () { if (spend(c, true)) { rs.pulls = (rs.pulls || 0) + 1; closeMenu(); gambleSpin(e, c); } } }] };
  } });
}
function gambleSpin(e, cost) {
  e.spin = 1.1; sfx.click();
  var r = Math.random();
  e.after = function () {
    if (r < 0.28) { var pw = shuffle(POWERS.slice())[0]; grantPower(pw.id); }
    else if (r < 0.58) { var win = Math.round(cost * 2.2); RUN.drops += win; sfx.goal(); spill(e.x, e.y - 40, 10); G.banner = 1.8; G.bannerTxt = 'JACKPOT'; G.bannerSub = '+' + fmtN(win) + ' DROPS'; }
    else if (r < 0.85) { sfx.no(); G.banner = 1.6; G.bannerTxt = 'NOTHING'; G.bannerSub = 'THE HOUSE WINS'; }
    else { var hurt = Math.round(ST.mhp * 0.15); P.hp = Math.max(1, P.hp - hurt); sfx.hurt(); G.shake = 6; pop(P.x, P.y - P.h - 4, '-' + hurt, '#ff5a60'); G.banner = 1.6; G.bannerTxt = 'CURSED'; G.bannerSub = 'IT BIT YOU'; }
    if ((rsOf(G.roomKey).pulls || 0) >= 3) gambleBoom(e);
    saveRun();
  };
}
/* three goes and the machine blows itself to bits */
function gambleBoom(e) {
  var rs = rsOf(G.roomKey); rs.broke = 1; e.boomT = 0.6; G.shake = 12; sfx.roar(); sfx.splat();
  fx.push({ k: 'ring', x: e.x, y: e.y - 24, age: 0, big: 1, c: '#ffb040' });
  poof(e.x, e.y - 24, 40, ['#ffb040', '#ff2630', '#ffe36a', '#3a2a2a', '#12040a']); spill(e.x, e.y - 30, 6);
  G.banner = 1.8; G.bannerTxt = 'KABOOM'; G.bannerSub = e.park ? 'THE WHEEL FLEW OFF' : 'THE MACHINE IS DEAD';
}
function startAmbush(rs) {
  rs.amb = 1; G.chal = { wave: 0, wait: 0.7, amb: 1 }; G.lock = true; G.layer = null; lockExits(true); sfx.lock(); G.shake = 6;
  G.banner = 1.8; G.bannerTxt = 'AMBUSH'; G.bannerSub = 'IT WAS A TRAP';
}
function ambushStep(dt) {
  if (!G.chal || !G.chal.amb || L.arena) return;
  if (enemies.length) return;
  G.chal.wait -= dt; if (G.chal.wait > 0) return;
  if (G.chal.wave >= 2) { G.chal = null; G.lock = false; lockExits(false); G.layer = null; rsOf(G.roomKey).ambDone = 1; sfx.goal(); grantPower(shuffle(POWERS.slice())[0].id); return; }
  G.chal.wave++; G.chal.wait = 1; spawnWave(2 + tierOf() + G.chal.wave - 1);
}

function rescue(e) { // break the lock: they thank you with a powerup or a bag of drops
  var rs = rsOf(G.roomKey); rs.freed = 1; sfx.door(); sfx.oneup(); poof(e.x, e.y - 20, 20, ['#a6968f', '#ffe36a', '#f1e7d0']);
  var nm = MERCHNAME[e.who] || 'A prisoner';
  if (Math.random() < 0.55) { var pw = shuffle(POWERS.slice())[0]; grantPower(pw.id); G.bannerTxt = nm.toUpperCase() + ' IS FREE'; G.bannerSub = 'THEY GIVE YOU ' + pw.name.toUpperCase(); }
  else { var v = 80 + 60 * tierOf(); RUN.drops += v; spill(e.x, e.y - 30, 12); G.banner = 2; G.bannerTxt = nm.toUpperCase() + ' IS FREE'; G.bannerSub = 'THEY GIVE YOU ' + v + ' DROPS'; }
  cutPlay({ focus: { x: e.x }, lines: [{ who: nm, say: pick(['YOU CAME! I THOUGHT I WAS DONE FOR.', 'FINALLY. THE FOOD IN HERE IS AWFUL.', 'BLESS YOU, HEIR. TAKE THIS.', 'I OWE YOU ONE. NO, TWO.']), col: '#ffe36a' }] });
  saveRun();
}
function openFeast(e) {
  var rs = rsOf(G.roomKey);
  openMenu({ title: 'The Long Table', note: 'Eat one dish. The rest goes cold.', pic: null, bank: 'none', rows: [
    { icon: 'stew', name: 'HEARTY STEW', sub: 'Heal 45% of your HP', price: 'EAT', cls: 'sec', fn: function () { rs.ate = 1; closeMenu(); var k = ST.noHeal; ST.noHeal = false; healP(Math.round(ST.mhp * 0.45)); ST.noHeal = k; sfx.oneup(); saveRun(); } },
    { icon: 'cpie', name: 'IRON PIE', sub: '+20 max HP for the rest of the run', price: 'EAT', cls: 'sec', fn: function () { rs.ate = 1; closeMenu(); RUN.feastHp = (RUN.feastHp || 0) + 20; ST = calcStats(); P.hp += 20; sfx.oneup(); saveRun(); } },
    { icon: 'wchili', name: 'DEVIL WINGS', sub: '+12% damage for the rest of the run', price: 'EAT', cls: 'sec', fn: function () { rs.ate = 1; closeMenu(); RUN.feastDmg = (RUN.feastDmg || 0) + 0.12; ST = calcStats(); sfx.oneup(); saveRun(); } }] });
}
/* ---------- area quirks ---------- */
var STREAKS = [];
function dripC() { return G.rm && G.rm.area === 'sewer' ? ['#fff6d8', '#c8b080'] : ['#7dff3a', '#3ab43a']; } /* sewer drips are cream */
function quirkStep(dt) {
  if (L.arena) return;
  if (G.quirkRoom !== G.roomKey) { G.quirkRoom = G.roomKey; G.bolt = null; G.boltT = 3 + Math.random() * 3; G.windT = 0; STREAKS = []; }
  var t = tierOf();
  L.ents.forEach(function (e) {
    if (e.k === 'chand') {
      if (e.st === 'hang') { if (Math.abs(P.x - e.x) < 20 && P.y > e.y + 20 && P.state !== 'dead') { e.st = 'shake'; e.st2 = 0.45; sfx.click(); } }
      else if (e.st === 'shake') { e.st2 -= dt; if (e.st2 <= 0) { e.st = 'fall'; e.vy = 0; e.fy = e.y; } }
      else if (e.st === 'fall') {
        e.vy += 900 * dt; e.fy += e.vy * dt; var bot = e.fy + 16, tt = tileAt(e.x, bot);
        if (P.state !== 'dead' && ov(P.x - P.w / 2, P.y - P.h, P.x + P.w / 2, P.y, e.x - 11, e.fy + 4, e.x + 11, bot)) hurtP(12 + 4 * t, e.x, 'a falling chandelier');
        enemies.forEach(function (o) { if (o.alive && !o.chand && ov(o.x - o.w / 2, o.y - o.h, o.x + o.w / 2, o.y, e.x - 11, e.fy + 4, e.x + 11, bot)) { o.chand = 1; hurtE(o, 30, 'boom'); } });
        if (solidT(tt) || tt === TL || bot > L.h * T) { e.st = 'gone'; G.shake = Math.max(G.shake, 5); sfx.splat(); poof(e.x, bot - 4, 18, ['#ffe36a', '#c8903a', '#ff9a40', '#3a2a2a']); }
      }
    } else if (e.k === 'pad') {
      if (e.sq > 0) e.sq -= dt;
      if (P.state === 'normal' && P.onGround && Math.abs(P.y - e.y) < 2 && Math.abs(P.x - e.x) < 13) { P.vy = -600; P.onGround = false; P.jumps = 1; P.jumpHeld = false; P.coyote = 0; e.sq = 0.25; sfx.stomp(); poof(e.x, e.y - 4, 6, ['#ff2630', '#ffe36a']); }
    } else if (e.k === 'drip') {
      e.cd -= dt; if (e.cd <= 0) { e.cd = 2.6 + Math.random() * 2.4; eshots.push({ x: e.x, y: e.y + 3, vx: 0, vy: 30, g: 600, life: 3, r: 3, dmg: 6 + 2 * t, k: 'drip', by: 'a drip from the ceiling' }); }
    } else if (e.k === 'vent') ventStep(e, dt);
    else if (e.k === 'saw') { // back and forth along its rail
      e.ph += dt * e.sp / Math.max(1, e.x1 - e.x0) * 0.5; var u = e.ph % 1, tri = u < 0.5 ? u * 2 : 2 - u * 2; e.x = e.x0 + (e.x1 - e.x0) * tri;
      if (P.state !== 'dead' && Math.hypot(P.x - e.x, (P.y - P.h / 2) - e.y) < 12 + P.w / 2) hurtP(10 + 4 * t, e.x, 'a saw blade');
      if (Math.random() < 0.2) parts.push({ x: e.x + (Math.random() - 0.5) * 6, y: e.y + 8, vx: (Math.random() - 0.5) * 80, vy: -60, life: 0.25, c: '#ffe36a', spark: 0 });
    } else if (e.k === 'gamble' && e.spin > 0) { e.spin -= dt; if (e.spin <= 0 && e.after) { var f = e.after; e.after = null; f(); } }
  });
  // roof: gusts every few seconds push you along
  if (L.wind) {
    G.windT += dt; var cyc = G.windT % 6; G.gust = cyc > 3.4 ? L.wind : 0;
    if (G.gust && P.state === 'normal') { var nx = P.x + G.gust * 62 * dt; if (!boxSolid(nx - P.w / 2, P.y - P.h, nx + P.w / 2, P.y - 1)) P.x = nx; }
    if ((G.gust || cyc > 2.9) && Math.random() < (G.gust ? 0.9 : 0.25)) STREAKS.push({ x: G.cam.x + (L.wind > 0 ? -10 : VW + 10), y: G.cam.y + 10 + Math.random() * (VH - 20), l: 10 + Math.random() * 20, life: 1.6 });
  }
  STREAKS.forEach(function (s) { s.x += L.wind * 300 * dt; s.life -= dt; }); STREAKS = STREAKS.filter(function (s) { return s.life > 0; });
  // roof: lightning. A marker glows where it will land, then it strikes
  if (L.storm) {
    G.boltT -= dt;
    if (!G.bolt && G.boltT <= 0 && P.state !== 'dead') {
      var bx = clamp(P.x + (Math.random() - 0.5) * 120, 30, L.w * T - 30), gy = L.h * T;
      for (var ty = 1; ty < L.h; ty++) { var q = L.tiles[ty * L.w + Math.floor(bx / T)]; if (solidT(q) || q === TL) { gy = ty * T; break; } }
      G.bolt = { x: bx, gy: gy, t: 1 }; G.boltT = 7 + Math.random() * 6;
    }
    if (G.bolt) {
      var b = G.bolt;
      if (!b.hit) { b.t -= dt; if (b.t <= 0) {
        b.hit = 1; b.show = 0.25; G.strike = 0.18; G.shake = Math.max(G.shake, 7); sfx.fire(); sfx.roar();
        if (P.state !== 'dead' && Math.abs(P.x - b.x) < 16 && P.y <= b.gy + 2) hurtP(12 + 4 * t, b.x, 'lightning');
        enemies.forEach(function (o) { if (o.alive && Math.abs(o.x - b.x) < 16 && o.y <= b.gy + 2) hurtE(o, 30, 'boom'); });
        poof(b.x, b.gy - 2, 14, ['#fff6a0', '#ffffff', '#ff2630']);
      } } else { b.show -= dt; if (b.show <= 0) G.bolt = null; }
    }
  }
  if (G.strike > 0) G.strike -= dt;
}

/* ---------- drawing ---------- */
function drawQuirks(cx) {
  L.ents.forEach(function (e) {
    var x = Math.round(e.x - cx); if (x < -40 || x > VW + 40) return;
    if (e.k === 'chand' && e.st !== 'gone') drawChand(x, e);
    else if (e.k === 'pad') drawPad(x, e);
    else if (e.k === 'drip') { var g = clamp(1 - e.cd / 0.7, 0, 1); R(ctx, '#2a0509', x - 3, e.y, 6, 2); if (g > 0) { R(ctx, '#12040a', x - 2, e.y + 1, 4, 2 + Math.round(g * 3)); R(ctx, dripC()[0], x - 1, e.y + 1, 2, 1 + Math.round(g * 3)); } }
    else if (e.k === 'shrine') drawShrine(x, e);
    else if (e.k === 'saw') drawSaw(x, e);
    else if (e.k === 'vent') drawVent(x, e);
    else if (e.k === 'adeco') { spr('p_' + e.s, x, e.y, e.fl, 1); if (e.s === 'crucible' && Math.random() < 0.15) parts.push({ x: e.x + (Math.random() - 0.5) * 16, y: e.y - 22, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 30, life: 0.8, c: Math.random() < 0.5 ? '#ffb040' : '#ff5a20' }); else if (e.s === 'creampool' && Math.random() < 0.02) parts.push({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 4, vx: 0, vy: -20, life: 0.4, c: '#fffbe8' }); }
    else if (e.k === 'cell') drawCell(x, e);
    else if (e.k === 'feast') drawFeast(x, e);
    else if (e.k === 'gamble') { if (rsOf(G.roomKey).broke) drawWreck(x, e); else if (e.park) drawWheel(x, e); else drawSlot(x, e); }
  });
}
function drawSaw(x, e) {
  var y = Math.round(e.y), x0 = Math.round(e.x0 - G.cam.x), x1 = Math.round(e.x1 - G.cam.x);
  R(ctx, '#12040a', x0 - 2, y - 1, x1 - x0 + 4, 3); R(ctx, '#5a545c', x0 - 1, y, x1 - x0 + 2, 1); R(ctx, '#9a929a', x0 - 1, y - 1, x1 - x0 + 2, 1);
  spr('p_saw' + (Math.floor(G.t * 24) % 2), x, y + 15, false, 1);
}
function drawCell(x, e) {
  var free = !!rsOf(G.roomKey).freed; spr(e.who, x, e.y, P.x < e.x, 1.1); spr(free ? 'p_cellopen' : 'p_cell', x, e.y + 1, false, 1);
}
function drawFeast(x, e) {
  var ate = !!rsOf(G.roomKey).ate, tlx = x - 43, tly = e.y - 31; spr(ate ? 'p_feastate' : 'p_feast', x, e.y + 1, false, 1);
  [[29, 2], [55, 4]].forEach(function (c, k) { var fl = Math.floor(G.t * 8 + k) % 2; R(ctx, '#ff7a30', tlx + c[0], tly + c[1] - 4 - fl, 3, 4); R(ctx, '#ffe36a', tlx + c[0] + 1, tly + c[1] - 3 - fl, 1, 2); });
  if (!ate && Math.floor(G.t * 2) % 2) [16, 43, 70].forEach(function (dx) { R(ctx, 'rgba(241,231,208,0.5)', tlx + dx, tly + 2, 1, 4); });
}
function drawChand(x, e) {
  var y = e.st === 'fall' ? Math.round(e.fy) : e.y, j = e.st === 'shake' ? Math.round((Math.random() - 0.5) * 3) : 0;
  if (e.st !== 'fall') { R(ctx, '#12040a', x - 1, y - 2, 3, 6); }
  spr('p_chand', x + j, y + 20, false, 1);
  [-12, 0, 12].forEach(function (o, k) { var fl = Math.floor(G.t * 8 + k) % 2; R(ctx, '#ff7a30', x + j + o - 1, y + 1 - fl, 3, 4); R(ctx, '#ffe36a', x + j + o, y + 2 - fl, 1, 2); });
}
function drawPad(x, e) {
  spr(e.sq > 0 ? 'p_pad1' : 'p_pad0', x, e.y + 1, false, 1);
  if (Math.floor(G.t * 3) % 2) { R(ctx, '#ffe36a', x - 1, e.y - 18, 3, 2); R(ctx, '#ffe36a', x, e.y - 19, 1, 1); }
}
function drawShrine(x, e) {
  var dry = !!rsOf(G.roomKey).prayed; spr(dry ? 'p_shrinedry' : 'p_shrine', x, e.y + 1, false, 1);
  if (!dry) { var d = (G.t * 30) % 20; R(ctx, '#ff2630', x - 8, e.y - 46 + d, 2, 2); R(ctx, '#ff2630', x + 6, e.y - 40 + ((d + 9) % 20), 2, 2); ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 10; R(ctx, '#ff3a44', x - 2, e.y - 56 + Math.round(Math.sin(G.t * 3) * 2), 4, 4); ctx.restore(); }
}
function drawSlot(x, e) {
  var y = e.y, sp = e.spin > 0; spr('p_slot', x, y + 1, false, 1);
  var cols = ['#ff2630', '#ffe36a', '#7dff9a', '#12040a', '#9a4aff'], tlx = x - 17, tly = y - 47;
  for (var i = 0; i < 3; i++) { var k = sp ? Math.floor(G.t * 18 + i * 2) % 5 : (i * 2 + 1) % 5; R(ctx, '#12040a', tlx + 6 + i * 7, tly + 16, 6, 9); R(ctx, cols[k], tlx + 7 + i * 7, tly + 18, 4, 5); }
  text('LOAD', x - 2, tly + 37, 'center', '#12040a', 5);
  if (Math.floor(G.t * 4) % 2) R(ctx, '#ffe36a', tlx + 2, tly + 6, 2, 2); else R(ctx, '#ffe36a', tlx + 26, tly + 6, 2, 2);
}
function drawWheel(x, e) {
  var y = e.y, cy = y - 34, a0 = (e.spin > 0 ? e.spin * e.spin * 14 : 0) + 0.3;
  R(ctx, '#12040a', x - 3, y - 26, 6, 26); R(ctx, '#3a3038', x - 2, y - 25, 4, 25); R(ctx, '#12040a', x - 12, y - 4, 24, 4);
  ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x, cy, 19, 0, 6.28); ctx.fill();
  for (var i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#1a1014' : '#c4121c'; if (i === 0) ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.moveTo(x, cy); ctx.arc(x, cy, 17, a0 + i * 0.785, a0 + (i + 1) * 0.785); ctx.fill(); }
  R(ctx, '#12040a', x - 3, cy - 3, 6, 6); R(ctx, '#f1e7d0', x - 2, cy - 2, 4, 4);
  ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.moveTo(x - 5, cy - 23); ctx.lineTo(x + 5, cy - 23); ctx.lineTo(x, cy - 15); ctx.fill(); ctx.fillStyle = '#f1e7d0'; ctx.beginPath(); ctx.moveTo(x - 3, cy - 22); ctx.lineTo(x + 3, cy - 22); ctx.lineTo(x, cy - 17); ctx.fill();
}
function drawWreck(x, e) { // what is left after three goes
  var y = e.y;
  R(ctx, '#12040a', x - 15, y - 12, 30, 12); R(ctx, '#2a1014', x - 14, y - 11, 28, 11); R(ctx, '#12040a', x - 12, y - 20, 9, 9); R(ctx, '#3a1a1e', x - 11, y - 19, 7, 7);
  R(ctx, '#12040a', x + 3, y - 17, 10, 6); R(ctx, '#3a1a1e', x + 4, y - 16, 8, 4); R(ctx, '#a6968f', x + 6, y - 24, 2, 8);
  if (Math.random() < 0.15) parts.push({ x: e.x + (Math.random() - 0.5) * 20, y: y - 16, vx: (Math.random() - 0.5) * 10, vy: -25, life: 0.9, c: Math.random() < 0.3 ? '#ffb040' : '#4a3a3a', spark: 0 });
}
function drawStorm(cx) {
  if (L.arena) return;
  if (STREAKS.length) { ctx.fillStyle = 'rgba(241,231,208,0.45)'; STREAKS.forEach(function (s) { ctx.fillRect(Math.round(s.x - cx), Math.round(s.y), Math.round(s.l), 1); }); }
  var b = G.bolt; if (!b) return; var x = Math.round(b.x - cx);
  if (!b.hit) { var on = Math.floor(G.t * (b.t < 0.4 ? 16 : 7)) % 2; R(ctx, on ? '#fff6a0' : '#ff2630', x - 12, b.gy - 2, 24, 2); R(ctx, on ? '#fff6a0' : '#ff2630', x - 1, b.gy - 8, 2, 5); }
  else {
    ctx.save(); ctx.shadowColor = '#fff6a0'; ctx.shadowBlur = 14; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, G.cam.y - 10);
    var y = G.cam.y - 10, n = 8, st = (b.gy - y) / n; for (var i = 1; i <= n; i++) ctx.lineTo(x + (i < n ? (Math.random() - 0.5) * 14 : 0), y + st * i); ctx.stroke(); ctx.strokeStyle = '#fff6a0'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
}
var darkCv = null;
function drawDark(cx, cy) {
  if (!L.dark || L.arena) return;
  if (!darkCv) darkCv = document.createElement('canvas');
  if (darkCv.width !== VW || darkCv.height !== VH) { darkCv.width = VW; darkCv.height = VH; }
  var d = darkCv.getContext('2d'); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, VW, VH); d.fillStyle = 'rgba(4,1,2,0.9)'; d.fillRect(0, 0, VW, VH);
  d.globalCompositeOperation = 'destination-out';
  function hole(x, y, r) { [[r * 1.45, 0.3], [r * 1.2, 0.55], [r, 1]].forEach(function (s) { d.globalAlpha = s[1]; d.beginPath(); d.arc(Math.round(x - cx), Math.round(y - cy), s[0], 0, 6.28); d.fill(); }); }
  var fl = Math.sin(G.t * 9) * 2;
  if (P.x !== undefined) hole(P.x, P.y - P.h / 2, 62 + fl);
  L.ents.forEach(function (e) { if (e.k === 'deco' && e.d === 'candle') hole(e.x + 1, e.y + 2, 26 + fl); else if (e.k === 'shrine' || e.k === 'chest' && !e.open) hole(e.x, e.y - 14, 22); else if (e.k === 'door') hole(e.x, e.y - 30, 34); });
  eshots.forEach(function (b) { hole(b.x, b.y, 12); });
  pshots.forEach(function (s) { if (s.x !== undefined && s.k !== 'whip' && s.k !== 'claw') hole(s.x, s.y, 18); });
  d.globalAlpha = 1; d.globalCompositeOperation = 'source-over';
  ctx.drawImage(darkCv, 0, 0);
  enemies.forEach(function (e) { var ex = Math.round(e.x - cx), ey = Math.round(e.y - e.h * 0.7 - cy); if (Math.hypot(e.x - P.x, e.y - P.y) > 70) { R(ctx, '#ff2630', ex - 3, ey, 2, 1); R(ctx, '#ff2630', ex + 2, ey, 2, 1); } }); // eyes in the dark
}
function drawFoeExtra(e, x) {
  if (e.ballX != null) {
    var bx = Math.round(e.ballX - G.cam.x), by = Math.round(e.ballY), hx = x + e.face * 12, hy = Math.round(e.y - 20);
    for (var i = 1; i < 6; i++) R(ctx, '#a6968f', Math.round(hx + (bx - hx) * i / 6) - 1, Math.round(hy + (by - hy) * i / 6) - 1, 2, 2);
    ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 6.28); ctx.fill(); ctx.fillStyle = '#5a5058'; ctx.beginPath(); ctx.arc(bx, by, 5.5, 0, 6.28); ctx.fill(); R(ctx, '#8a8088', bx - 3, by - 3, 2, 2);
    [[0, -9], [0, 7], [-9, 0], [7, 0]].forEach(function (s) { R(ctx, '#12040a', bx + s[0], by + s[1], 3, 3); });
  }
}

/* ---------- blueprints and runes found in the castle ----------
   Greebo can only make gear whose blueprint you have found, and Spermaid only binds runes you have brought her.
   Finds are kept for good the moment you pick them up, even if the heir dies. Deeper areas hold the better gear. */
function findBlueprint(chance) {
  if (Math.random() > chance) return false;
  var f = META.found, t = tierOf(), pool = [];
  ['weapon', 'armour', 'helm'].forEach(function (slot) { var nx = f[slot] + 1; if (nx < GEAR[slot].length && nx - 1 <= t) pool.push({ slot: slot, i: nx, w: 3 }); });
  RUNES.forEach(function (r) { if (!f.runes[r.id]) pool.push({ rune: r, w: 2 }); });
  if (!pool.length) return false;
  var tot = 0; pool.forEach(function (p) { tot += p.w; }); var v = Math.random() * tot, pk = pool[0];
  for (var i = 0; i < pool.length; i++) { v -= pool[i].w; if (v <= 0) { pk = pool[i]; break; } }
  var nm;
  if (pk.rune) { f.runes[pk.rune.id] = 1; nm = pk.rune.name; G.bannerTxt = 'RUNE FOUND'; G.bannerSub = nm.toUpperCase() + '  ·  TAKE IT TO SPERMAID SANCTUM'; }
  else { f[pk.slot] = pk.i; nm = GEAR[pk.slot][pk.i].name; G.bannerTxt = 'BLUEPRINT FOUND'; G.bannerSub = nm.toUpperCase() + '  ·  GREEBO CAN MAKE IT NOW'; }
  G.banner = 2.6; sfx.oneup(); saveMeta(); if (RUN) { RUN.finds = RUN.finds || []; RUN.finds.push(nm); }
  poof(P.x, P.y - P.h, 18, ['#ffe36a', '#f1e7d0', '#7a8aff']);
  return true;
}
