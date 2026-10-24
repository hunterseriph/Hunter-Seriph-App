/* =====================================================================================================
   SPUZZWORLD: CUM'S ODDYSEE. An Oddworld style escape. Cumhead wakes up in a cell in Blumhead's Lair.
   One screen at a time: walk, run, leap, climb and drop, pull levers, ride lifts, keep still in the dark
   while the guards look, outrun blumlings, jump the mines. Homunculi are held prisoner all over the lair.
   Tell them to follow you (X), wait (Y), and hold CHANT (C / LB) next to a portal to send them home.
   Escape alone, or save every one of them. Die and the screen starts again.
   ===================================================================================================== */
var SW = 480, SH = 272, TT = 16, GRAV = 900, WALK = 72, RUN = 170;
var R = KIT.R, spr = KIT.spr, text = KIT.text;
var SV = KIT.load('sw-save', null) || { best: -1, done: 0 };
function persist() { KIT.save('sw-save', SV); }
var G = { mode: 'title', t: 0 }, P, homs, SC = {}, trail, bubbles, parts, banner, total = 0;
var BREEDS = ['gloop', 'ember', 'frost', 'volt', 'scout', 'goldie', 'medic', 'titan', 'leech', 'blood'];

/* ---------- build the world from the screen text ---------- */
function build() {
  SC = {}; homs = []; var hid = 0; total = 0;
  SCREENS.forEach(function (s) {
    var key = s.sx + ',' + s.sy, sc = { s: s, key: key, sx: s.sx, sy: s.sy, grid: [], guards: [], blums: [], mines: [], levers: [], portals: [], lifts: [], exits: [], signs: [], bars: [], leverOn: false };
    var sign = 0;
    for (var y = 0; y < 17; y++) {
      var row = ((s.rows[y] || '') + '                              ').slice(0, 30).split('');
      for (var x = 0; x < 30; x++) {
        var c = row[x], wx = s.sx * SW + x * TT + 8, wy = s.sy * SH + (y + 1) * TT;
        if (c === '@') { sc.start = { x: wx, y: wy }; row[x] = ' '; }
        else if (c === 'H') { homs.push({ id: hid++, x: wx, y: wy, breed: BREEDS[(hid * 7) % BREEDS.length], st: 'idle', face: x < 15 ? 1 : -1, scr: key, t: Math.random() * 3 }); total++; row[x] = ' '; }
        else if (c === 'G' || c === 'g' || c === 'z') { sc.guards.push({ x: wx, y: wy, face: c === 'g' ? -1 : 1, st: c === 'z' ? 'sleep' : 'patrol', t: 0, tx: x, ty: y }); row[x] = ' '; }
        else if (c === 'B') { sc.blums.push({ x: wx, y: wy, face: -1, st: 'idle', t: 0 }); row[x] = ' '; }
        else if (c === 'M') { sc.mines.push({ x: wx, y: wy, alive: true }); row[x] = ' '; }
        else if (c === 'L') { sc.levers.push({ x: wx, y: wy }); row[x] = ' '; }
        else if (c === 'P') { sc.portals.push({ x: wx, y: wy, open: 0 }); row[x] = ' '; }
        else if (c === 'U' || c === 'V') { sc.lifts.push({ x: wx, y: wy, up: c === 'U' }); row[x] = ' '; }
        else if (c === 'X') { sc.exits.push({ x: wx, y: wy }); row[x] = ' '; }
        else if (c === 'T') { sc.signs.push({ x: wx, y: s.sy * SH + y * TT + 8, t: s.signs[sign++] || '' }); row[x] = ' '; }
      }
      sc.grid.push(row);
    }
    SC[key] = sc;
  });
  // where each guard turns: the stop marks, walls, gates or the end of the floor
  for (var k in SC) SC[k].guards.forEach(function (g) {
    var sc = SC[k], row = sc.grid[g.ty], under = sc.grid[g.ty + 1];
    function stop(x) { return x < 0 || x > 29 || row[x] === '|' || row[x] === '#' || row[x] === 'D' || !(under[x] === '#' || under[x] === '=' || under[x] === 'h'); }
    var a = g.tx, b = g.tx; while (!stop(a - 1)) a--; while (!stop(b + 1)) b++;
    g.min = sc.sx * SW + a * TT + 8; g.max = sc.sx * SW + b * TT + 8;
  });
}
function scrAt(wx, wy) { return SC[Math.floor(wx / SW) + ',' + Math.floor(wy / SH)]; }
function tileAt(wx, wy) {
  var sx = Math.floor(wx / SW), sy = Math.floor(wy / SH), sc = SC[sx + ',' + sy];
  if (!sc) return SC[sx + ',' + (sy - 1)] ? ' ' : '#';
  var tx = Math.floor((wx - sx * SW) / TT), ty = Math.floor((wy - sy * SH) / TT); if (ty > 16) return ' ';
  return sc.grid[ty][tx];
}
function solidAt(wx, wy) { var c = tileAt(wx, wy); if (c === '#' || c === '=' || c === 'h') return true; if (c === 'D') { var sc = scrAt(wx, wy); return !sc.leverOn; } return false; }
function boxHit(x, y, hw, h) { for (var yy = y - h; yy <= y - 1; yy += 8) { if (solidAt(x - hw, yy) || solidAt(x + hw, yy)) return true; } return solidAt(x - hw, y - 1) || solidAt(x + hw, y - 1); }
function groundAt(x, y) { return solidAt(x - 5, y + 1) || solidAt(x + 5, y + 1); }

/* ---------- a fresh escape ---------- */
function newGame() {
  build(); var st = SC['0,0'].start; P = { x: st.x, y: st.y, vx: 0, vy: 0, face: 1, st: 'stand', ground: true, t: 0, fallFrom: st.y, anim: 0, chant: 0 };
  G.saved = 0; G.lost = 0; G.deaths = 0; trail = [{ x: P.x, y: P.y, d: 0 }]; bubbles = []; parts = []; G.scr = '0,0';
  snapshot(); G.mode = 'play'; banner = { t: 3, a: 'CELL 37', b: "BLUMHEAD'S LAIR" }; music.play('swcells');
  say(P, 'Where... am I?', 2.5);
}
/* the screen you came into is the checkpoint: die and it all goes back to how it was */
function snapshot() {
  var dyn = {}; for (var k in SC) { var sc = SC[k]; dyn[k] = { guards: sc.guards, blums: sc.blums, mines: sc.mines, portals: sc.portals, leverOn: sc.leverOn }; }
  G.snap = JSON.stringify({ P: P, homs: homs, dyn: dyn, saved: G.saved, lost: G.lost });
  try { localStorage.setItem('sw-run', JSON.stringify({ snap: G.snap, deaths: G.deaths })); } catch (e) {}
}
function restore(snap) {
  var o = JSON.parse(snap), savedNow = {}; homs && homs.forEach(function (h) { if (h.st === 'saved') savedNow[h.id] = 1; });
  P = o.P; homs = o.homs; G.lost = o.lost; for (var k in o.dyn) { var d = o.dyn[k], sc = SC[k]; sc.guards = d.guards; sc.blums = d.blums; sc.mines = d.mines; sc.portals = d.portals; sc.leverOn = d.leverOn; }
  homs.forEach(function (h) { if (savedNow[h.id]) h.st = 'saved'; if (h.st === 'follow') { h.join = true; } }); G.saved = homs.filter(function (h) { return h.st === 'saved'; }).length;
  P.st = 'stand'; P.vx = P.vy = 0; P.ground = true; P.fallFrom = P.y; trail = [{ x: P.x, y: P.y, d: 0 }]; homs.forEach(function (h) { h.k = 0; }); bubbles = []; parts = [];
  G.scr = Math.floor(P.x / SW) + ',' + Math.floor((P.y - 1) / SH);
}
function continueGame() { var s = KIT.load('sw-run', null); if (!s) return newGame(); build(); G.deaths = s.deaths || 0; restore(s.snap); G.snap = s.snap; G.mode = 'play'; var sc = SC[G.scr]; banner = { t: 2.5, a: sc.s.name.toUpperCase(), b: ZONES[sc.s.zone].name.toUpperCase() }; music.play(['swcells', 'swworks', 'swthrone'][sc.s.zone]); }

/* ---------- Cumhead ---------- */
function visible(e) { // in the dark you cannot be seen unless you run
  var sc = scrAt(e.x, e.y - 20); if (!sc) return true; var tx = (e.x - sc.sx * SW) / TT, ty = (e.y - 20 - sc.sy * SH) / TT;
  var dark = sc.s.shadows.some(function (r) { return tx >= r[0] && tx <= r[2] + 1 && ty >= r[1] && ty <= r[3] + 1; });
  return !dark || e.st === 'run' || e.st === 'air';
}
function running() { return KIT.held('b') || KIT.held('run'); }
function updP(dt) {
  P.t += dt; if (P.inv > 0) P.inv -= dt;
  if (P.st === 'dead') { P.deadT -= dt; if (P.deadT <= 0) { G.deaths++; restore(G.snap); } return; }
  if (P.st === 'hoist' || P.st === 'drop') { P.at += dt; var k = Math.min(1, P.at / P.dur); P.x = lerp(P.from.x, P.to.x, k); P.y = lerp(P.from.y, P.to.y, P.st === 'hoist' ? Math.sin(k * Math.PI / 2) : k * k); if (k >= 1) { P.st = 'stand'; P.ground = true; P.fallFrom = P.y; if (P.st2 === 'drop') sfx.play('land'); } recordTrail(); return; }
  if (P.st === 'lift') { P.at += dt; if (P.at < 0.6) P.y += (P.lift.up ? -1 : 1) * 160 * dt; else { var to = P.lift.to; var dx0 = P.x, dy0 = P.y; P.x = to.x; P.y = to.y; P.st = 'stand'; carry(dx0, dy0); sfx.play('door'); } return; }
  if (P.st === 'door') return;
  var ix = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0);
  if (P.ground) {
    if (KIT.held('lb') && Math.abs(P.vx) < 5) { chant(dt); return; } P.chant = 0;
    var sp = running() ? RUN : WALK; P.vx = ix * sp; if (ix) P.face = ix;
    P.st = ix ? (running() ? 'run' : 'walk') : 'stand';
    if (KIT.pressed('up')) { if (useUp()) return; }
    if (KIT.pressed('down')) { if (useDown()) return; }
    if (KIT.pressed('a')) { var run = Math.abs(P.vx) > 120, walk = Math.abs(P.vx) > 10; P.vy = run ? -310 : walk ? -270 : -235; P.vx = run ? P.face * 180 : walk ? P.face * 115 : 0; P.ground = false; P.st = 'air'; P.fallFrom = P.y; sfx.play('jump'); }
    if (KIT.pressed('x')) speak('FOLLOW ME!'); if (KIT.pressed('y')) speak('WAIT!');
  } else P.st = 'air';
  // move
  var nx = P.x + P.vx * dt; if (!boxHit(nx, P.y, 6, 50)) P.x = nx; else { P.vx = 0; }
  if (!P.ground) { P.vy += GRAV * dt; var ny = P.y + P.vy * dt; if (P.vy > 0 && groundAt(P.x, ny - 1)) { P.y = Math.floor(ny / TT) * TT; landed(); } else if (P.vy < 0 && boxHit(P.x, ny, 6, 50)) P.vy = 0; else P.y = ny; }
  else if (!groundAt(P.x, P.y)) { P.ground = false; P.fallFrom = P.y; P.vy = 0; }
  if (P.y > (Math.floor(P.fallFrom / SH) + 1) * SH + 40 && !SC[Math.floor(P.x / SW) + ',' + Math.floor(P.y / SH)]) die('fell into the dark');
  if (P.ground && P.st !== 'stand') { var st = Math.floor(P.t * (P.st === 'run' ? 9 : 5)); if (st !== P.lastStep) { P.lastStep = st; if (P.st === 'run') sfx.play('step'); } }
  recordTrail();
}
function landed() { P.ground = true; P.vy = 0; var fall = P.y - P.fallFrom; P.vx = 0; if (fall > 7.5 * TT) { die('fell too far'); return; } P.st = 'stand'; sfx.play('land'); }
function recordTrail() { var l = trail[trail.length - 1], d = Math.hypot(P.x - l.x, P.y - l.y); if (d > 2) { trail.push({ x: P.x, y: P.y, d: l.d + d }); if (trail.length > 3000) { trail.shift(); homs.forEach(function (h) { if (h.k) h.k--; }); } } }
function near(list, r) { var out = null; list.forEach(function (e) { if (Math.abs(e.x - P.x) < r && Math.abs(e.y - P.y) < 10) out = e; }); return out; }
function useUp() {
  var sc = scrAt(P.x, P.y - 4); if (!sc) return false;
  var lv = near(sc.levers, 14); if (lv) { sc.leverOn = !sc.leverOn; sfx.play('door'); KIT.shake(2); say(P, sc.leverOn ? 'Click.' : 'Clunk.', 1); return true; }
  var lf = near(sc.lifts, 16); if (lf && lf.up) { ride(lf, sc); return true; }
  var ex = near(sc.exits, 18); if (ex) { P.st = 'door'; ending(); return true; }
  // a yellow ledge five tiles up: climb onto it
  var hy = P.y - 5 * TT + 4;
  for (var o = 0; o <= 12; o += 6) for (var s = -1; s <= 1; s += 2) { var hx = P.x + o * s; if (tileAt(hx, hy) === 'h' && !solidAt(hx, hy - TT)) { var cx = Math.floor(hx / TT) * TT + 8; P.st = 'hoist'; P.at = 0; P.dur = 0.5; P.from = { x: P.x, y: P.y }; P.to = { x: cx, y: Math.floor(hy / TT) * TT }; P.st2 = 'hoist'; sfx.play('jump'); return true; } }
  return false;
}
function useDown() {
  var sc = scrAt(P.x, P.y - 4); if (!sc) return false;
  var lf = near(sc.lifts, 16); if (lf && !lf.up) { ride(lf, sc); return true; }
  if (tileAt(P.x, P.y + 4) === 'h') { // drop down through the climbing ledge to the floor below
    for (var d = 2; d <= 12; d++) { var y = P.y + d * TT; if (solidAt(P.x, y + 1) && !solidAt(P.x, y - 1)) { P.st = 'drop'; P.st2 = 'drop'; P.at = 0; P.dur = 0.4; P.from = { x: P.x, y: P.y }; P.to = { x: P.x, y: y }; return true; } }
  }
  return false;
}
function ride(lf, sc) {
  var tsc = SC[sc.sx + ',' + (sc.sy + (lf.up ? -1 : 1))]; if (!tsc) return; var tl = tsc.lifts.filter(function (q) { return q.up !== lf.up; })[0]; if (!tl) return;
  P.st = 'lift'; P.at = 0; P.lift = { up: lf.up, to: { x: tl.x, y: tl.y } }; P.x = lf.x; sfx.play('door');
}
function carry(ox, oy) { // followers standing close ride the lift with you
  homs.forEach(function (h) { if ((h.st === 'follow' || h.st === 'wait') && Math.abs(h.x - ox) < 110 && Math.abs(h.y - oy) < 90) { h.x = P.x - P.face * (20 + Math.random() * 30); h.y = P.y; h.k = trail.length; h.join = true; } });
  trail.push({ x: P.x, y: P.y, d: trail[trail.length - 1].d + 1 });
}
function chant(dt) {
  P.st = 'chant'; P.vx = 0; P.chant += dt; if (Math.random() < 0.2) sfx.tone('sine', 220 + Math.sin(G.t * 8) * 30, 230, 0.15, 0.03);
  if (P.chant > 0.8) { var sc = scrAt(P.x, P.y - 4); sc && sc.portals.forEach(function (p) { if (Math.abs(p.x - P.x) < 70 && Math.abs(p.y - P.y) < 20 && p.open <= 0) { p.open = 5; sfx.play('magic'); KIT.flash(0.15); } }); }
}
function speak(w) {
  say(P, w, 1.2); sfx.play(w === 'WAIT!' ? 'back' : 'select');
  var n = 0;
  homs.forEach(function (h) {
    if (h.st === 'dead' || h.st === 'saved' || h.st === 'enter') return;
    var close = Math.abs(h.x - P.x) < 150 && Math.abs(h.y - P.y) < 24 && scrAt(h.x, h.y - 4) === scrAt(P.x, P.y - 4);
    if (w === 'FOLLOW ME!' && close && h.st !== 'follow') { h.st = 'follow'; h.join = true; h.k = trail.length - 1; h.order = G.t + n * 0.01; n++; say(h, 'Okay!', 1); }
    else if (w === 'WAIT!' && (h.st === 'follow') && (close || Math.abs(h.x - P.x) < 220)) { h.st = 'wait'; say(h, 'Waiting.', 1); }
  });
}
function die(why) {
  if (P.st === 'dead') return; P.st = 'dead'; P.deadT = 1.5; P.why = why; sfx.play(why === 'blown up' ? 'boom' : 'hurt'); KIT.shake(8);
  for (var i = 0; i < 14; i++) parts.push({ x: P.x, y: P.y - 25, vx: rnd(-120, 120), vy: rnd(-200, -40), t: 0.9, c: i % 2 ? '#f1e0b0' : '#c4121c' });
  say(P, pick(['Ow.', 'Not again.', 'Bollocks.', 'Ugh.']), 1.2);
}

/* ---------- homunculi ---------- */
function updHoms(dt) {
  var foll = homs.filter(function (h) { return h.st === 'follow'; }).sort(function (a, b) { return a.order - b.order; }), lastD = trail[trail.length - 1].d;
  homs.forEach(function (h) {
    h.t += dt; if (h.st === 'dead' || h.st === 'saved') return;
    var ox = h.x, oy = h.y;
    if (h.st === 'follow') {
      var order = foll.indexOf(h), target = lastD - 28 * (order + 1);
      if (h.join) { var tp = trail[Math.min(h.k, trail.length - 1)], dx = tp.x - h.x; if (Math.abs(dx) < 3 || Math.abs(tp.y - h.y) > 30) { h.join = false; h.x = Math.abs(tp.y - h.y) > 30 ? h.x : tp.x; } else { h.x += Math.sign(dx) * Math.min(Math.abs(dx), 150 * dt); } }
      else { var rem = 175 * dt; while (rem > 0 && h.k < trail.length - 1 && trail[h.k + 1].d <= target) { var q = trail[h.k + 1], ddx = q.x - h.x, ddy = q.y - h.y, dd = Math.hypot(ddx, ddy); if (dd <= rem) { h.x = q.x; h.y = q.y; h.k++; rem -= dd; } else { h.x += ddx / dd * rem; h.y += ddy / dd * rem; rem = 0; } } }
    } else if (h.st === 'enter') { var dx2 = h.portal.x - h.x; h.x += Math.sign(dx2) * Math.min(Math.abs(dx2), 160 * dt); h.y += (h.portal.y - h.y) * Math.min(1, dt * 6); if (Math.abs(dx2) < 3) { h.st = 'saved'; G.saved++; sfx.play('coin'); for (var i = 0; i < 10; i++) parts.push({ x: h.x, y: h.y - 20, vx: rnd(-60, 60), vy: rnd(-160, -60), t: 0.8, c: '#fffbe8' }); say(P, pick(['Go!', 'Home you go.', 'Off you pop.']), 1); } }
    h.moving = Math.hypot(h.x - ox, h.y - oy) > 0.3; h.vy = h.y - oy; if (Math.abs(h.x - ox) > 0.2) h.face = h.x > ox ? 1 : -1;
    // portals pull in anyone you are leading
    var sc = scrAt(h.x, h.y - 4); if (!sc) return;
    if (h.st === 'follow' || h.st === 'wait') sc.portals.forEach(function (p) { if (p.open > 0 && Math.abs(p.x - h.x) < 220 && Math.abs(p.y - h.y) < 30) { h.st = 'enter'; h.portal = p; } });
    if (hazard(h, sc)) { h.st = 'dead'; G.lost++; sfx.play('splat'); for (var j = 0; j < 8; j++) parts.push({ x: h.x, y: h.y - 15, vx: rnd(-80, 80), vy: rnd(-150, -30), t: 0.7, c: '#c4121c' }); say(P, pick(['No!', 'Sorry, little one.', 'Oh no.']), 1.4); }
  });
}
function hazard(e, sc) { // electric barriers (and the self-switching ones)
  for (var y = 0; y < 17; y++) for (var x = 0; x < 30; x++) { var c = sc.grid[y][x]; if ((c === 'E' && !sc.leverOn) || (c === 'e' && cyc(sc))) { var bx = sc.sx * SW + x * TT + 8, by = sc.sy * SH + y * TT; if (Math.abs(e.x - bx) < 8 && e.y - 40 < by + TT && e.y > by) return true; } }
  return false;
}
function cyc(sc) { return (G.t % 4) < 2.2; }

/* ---------- guards, blumlings, mines, portals in the current screen ---------- */
function canSee(g, t) {
  if (Math.abs(t.y - g.y) > 12) return false; var dx = t.x - g.x; if (dx * g.face <= 0 || Math.abs(dx) > 230) return false;
  for (var x = g.x; Math.abs(x - g.x) < Math.abs(dx); x += 8 * g.face) if (solidAt(x, g.y - 30)) return false;
  return visible(t);
}
function updScreen(sc, dt) {
  sc.guards.forEach(function (g) {
    if (g.st === 'dead') return; g.t += dt;
    if (g.st === 'sleep') { if (P.st === 'run' && Math.abs(P.x - g.x) < 170 && Math.abs(P.y - g.y) < 14) { g.st = 'wake'; g.t = 0; g.face = P.x > g.x ? 1 : -1; say(g, 'Huh?!', 1); sfx.play('roar'); } return; }
    if (g.st === 'wake') { if (g.t > 0.9) { g.st = 'patrol'; } return; }
    if (g.st === 'patrol') { g.x += g.face * 36 * dt; if (g.x <= g.min || g.x >= g.max) { g.x = clamp(g.x, g.min, g.max); g.st = 'pause'; g.t = 0; } }
    else if (g.st === 'pause') { if (g.t > 1.3) { g.face = -g.face; g.st = 'patrol'; } }
    else if (g.st === 'alert') { if (g.t > 0.55) { if (P.st !== 'dead' && canSee(g, P)) { g.st = 'shoot'; g.t = 0; g.shotX = P.x; sfx.play('boom'); die('shot by a Lair Guard'); } else { g.st = 'search'; g.t = 0; say(g, '?', 1); } } return; }
    else if (g.st === 'search') { if (g.t > 1.4) g.st = 'patrol'; return; }
    else if (g.st === 'shoot') { if (g.t > 1.5) g.st = 'patrol'; return; }
    if (P.st !== 'dead' && canSee(g, P) && P.st !== 'lift') { g.st = 'alert'; g.t = 0; say(g, '!', 0.8); sfx.play('no'); }
  });
  sc.blums.forEach(function (b) {
    if (b.st === 'dead') return; b.t += dt;
    var same = Math.abs(P.y - b.y) < 14 && P.st !== 'dead';
    if (b.st === 'idle') { if (same && Math.abs(P.x - b.x) < 180) { b.st = 'chase'; b.lost = 0; sfx.play('roar'); say(b, 'GRRK!', 0.8); } return; }
    if (!same) { b.lost += dt; if (b.lost > 1.6) { b.st = 'idle'; } return; } b.lost = 0;
    var dir = Math.sign(P.x - b.x) || 1, nx = b.x + dir * 150 * dt; b.face = dir;
    if (groundAt(nx + dir * 6, b.y) && !solidAt(nx + dir * 8, b.y - 8)) b.x = nx;
    if (Math.abs(P.x - b.x) < 14 && same) die('eaten by a blumling');
    homs.forEach(function (h) { if (h.st !== 'dead' && h.st !== 'saved' && Math.abs(h.x - b.x) < 12 && Math.abs(h.y - b.y) < 14) { h.st = 'dead'; G.lost++; sfx.play('splat'); } });
  });
  sc.mines.forEach(function (m) {
    if (!m.alive) return;
    var hit = (P.ground && P.st !== 'dead' && Math.abs(P.x - m.x) < 8 && Math.abs(P.y - m.y) < 4);
    homs.forEach(function (h) { if ((h.st === 'follow' || h.st === 'enter') && Math.abs(h.x - m.x) < 6 && Math.abs(h.y - m.y) < 3 && Math.abs(h.vy || 0) < 0.2) hit = true; });
    sc.guards.forEach(function (g) { if (g.st === 'patrol' && Math.abs(g.x - m.x) < 6) hit = true; }); sc.blums.forEach(function (b) { if (b.st === 'chase' && Math.abs(b.x - m.x) < 6 && Math.abs(b.y - m.y) < 4) hit = true; });
    if (hit) explode(m, sc);
  });
  sc.portals.forEach(function (p) { if (p.open > 0) p.open -= dt; });
  if (P.st !== 'dead' && hazard(P, sc)) die('fried on a barrier');
}
function explode(m, sc) {
  m.alive = false; sfx.play('boom'); KIT.shake(10); KIT.flash(0.1);
  for (var i = 0; i < 20; i++) parts.push({ x: m.x, y: m.y - 6, vx: rnd(-160, 160), vy: rnd(-260, -60), t: 0.9, c: i % 3 ? '#ffb040' : '#ff2630' });
  if (P.st !== 'dead' && Math.abs(P.x - m.x) < 30 && Math.abs(P.y - m.y) < 30) die('blown up');
  homs.forEach(function (h) { if (h.st !== 'dead' && h.st !== 'saved' && Math.abs(h.x - m.x) < 30 && Math.abs(h.y - m.y) < 30) { h.st = 'dead'; G.lost++; } });
  sc.guards.forEach(function (g) { if (Math.abs(g.x - m.x) < 30 && Math.abs(g.y - m.y) < 20) g.st = 'dead'; else if (g.st === 'sleep' && Math.abs(g.x - m.x) < 240) { g.st = 'wake'; g.t = 0; g.face = m.x > g.x ? 1 : -1; say(g, 'WHAT WAS THAT?', 1.2); } });
  sc.blums.forEach(function (b) { if (Math.abs(b.x - m.x) < 30 && Math.abs(b.y - m.y) < 20) b.st = 'dead'; });
}
function say(e, t, d) { bubbles = bubbles.filter(function (b) { return b.e !== e; }); bubbles.push({ e: e, t: t, life: d || 1.2 }); }

/* ---------- the loop ---------- */
function update(dt) {
  G.t += dt;
  if (G.mode !== 'play') return;
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  updP(dt); updHoms(dt);
  var key = Math.floor(P.x / SW) + ',' + Math.floor((P.y - 1) / SH);
  if (SC[key] && key !== G.scr && P.st !== 'dead') { G.scr = key; var sc = SC[key]; banner = { t: 2.2, a: sc.s.name.toUpperCase(), b: ZONES[sc.s.zone].name.toUpperCase() }; music.play(['swcells', 'swworks', 'swthrone'][sc.s.zone]); snapshot(); }
  if (SC[G.scr]) updScreen(SC[G.scr], dt);
  bubbles.forEach(function (b) { b.life -= dt; }); bubbles = bubbles.filter(function (b) { return b.life > 0; });
  parts.forEach(function (p) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; }); parts = parts.filter(function (p) { return p.t > 0; });
}
function ending() {
  G.mode = 'end'; music.play('swend'); var s = G.saved, all = s >= total;
  if (s > SV.best) SV.best = s; SV.done++; persist(); try { localStorage.removeItem('sw-run'); } catch (e) {}
  var title = all ? 'Every Last One' : s >= Math.ceil(total / 2) ? 'Out With Friends' : s > 0 ? 'Out, Mostly Alone' : 'Out Alone';
  var txt = all ? 'Cumhead walks out of the lair with every homunculus home safe. Down in the dark, Blumhead\'s machines stop. Nobody is left to work them.'
    : s >= Math.ceil(total / 2) ? 'Cumhead gets out, and plenty got out before him. The rest are still down there, scrubbing.'
    : s > 0 ? 'Cumhead gets out. A few homunculi did too. The lair keeps grinding on without them.'
    : 'Cumhead walks out into the air on his own. Behind him, the lair keeps grinding. Nobody else is coming.';
  KIT.menu({ title: title, sub: 'Saved ' + s + ' of ' + total + '  ·  Lost ' + G.lost + '  ·  Deaths ' + G.deaths, html: '<p style="text-align:center">' + txt + '</p>',
    items: [{ label: 'ESCAPE AGAIN', fn: function () { KIT.closeMenu(); newGame(); }, cls: 'hot', def: true }, { label: 'TITLE', fn: titleMenu, back: true }] });
}

/* ---------- drawing ---------- */
function hash(a, b) { var h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return h - Math.floor(h); }
function drawBack(sc) {
  var Z = ZONES[sc.s.zone];
  R(Z.back, 0, 0, SW, SH);
  for (var y = 0; y < SH; y += 34) R(Z.band, 0, y, SW, 17);
  for (var i = 0; i < 6; i++) { var px = Math.floor(hash(sc.sx, i) * 28) * 16, ph = hash(i, sc.sy) * 80 + 40; R(Z.pipe, px, 0, 10, SH); R('rgba(255,255,255,0.06)', px + 1, 0, 2, SH); for (var j = 0; j < SH; j += 48) R('#12040a', px - 2, j + ph % 48, 14, 4); }
  for (var k = 0; k < 3; k++) { var hy = 40 + k * 70 + Math.floor(hash(k, sc.sx + 3) * 20); R(Z.pipe, 0, hy, SW, 8); R('rgba(255,255,255,0.05)', 0, hy + 1, SW, 2); }
  // machines in the gloom
  for (var m = 0; m < 3; m++) { var mx = 40 + m * 160 + hash(m, sc.sx * 9) * 40, my = 120 + hash(sc.sy, m) * 30; R('rgba(0,0,0,0.35)', mx, my, 70, 110); R('rgba(255,38,48,' + (0.25 + Math.sin(G.t * 3 + m) * 0.15) + ')', mx + 10, my + 14, 6, 6); }
}
function drawTiles(sc) {
  var Z = ZONES[sc.s.zone], ox = sc.sx * SW, oy = sc.sy * SH, fakeNear = Math.abs(P.x - ox) < 40;
  for (var y = 0; y < 17; y++) for (var x = 0; x < 30; x++) {
    var c = sc.grid[y][x], px = x * TT, py = y * TT;
    if (c === '#' || c === 'F') {
      if (c === 'F' && fakeNear) KIT.ctx.globalAlpha = 0.45;
      R(Z.block[0], px, py, TT, TT); R(Z.block[1], px, py, TT, 2); R(Z.block[1], px, py, 2, TT); R(Z.block[2], px, py + TT - 2, TT, 2); R(Z.block[2], px + TT - 2, py, 2, TT);
      if ((x + y) % 3 === 0) R('rgba(0,0,0,0.2)', px + 5, py + 6, 4, 3);
      KIT.ctx.globalAlpha = 1;
    } else if (c === '=' || c === 'h') {
      R('#12040a', px, py, TT, 7); R(Z.ledge, px, py + 1, TT, 5); R('rgba(255,255,255,0.2)', px, py + 1, TT, 1); R('#12040a', px + 3, py + 3, 1, 1); R('#12040a', px + 12, py + 3, 1, 1);
      if (c === 'h') { for (var s = 0; s < 4; s++) R(s % 2 ? '#12040a' : '#ffc840', px + s * 4, py + 1, 4, 2); R('#ffc840', px + 6, py + 6, 4, 3); }
    } else if (c === 'D') {
      if (!sc.leverOn) { R('#12040a', px + 2, py, 12, TT); for (var b = 0; b < 3; b++) R('#9a929a', px + 3 + b * 4, py, 2, TT); }
      else { R('rgba(154,146,154,0.25)', px + 3, py, 10, 3); }
    } else if (c === 'E' || c === 'e') {
      var on = c === 'E' ? !sc.leverOn : cyc(sc);
      R('#3a343c', px + 4, py, 8, 2); if (on) { var f = Math.floor(G.t * 20); R('rgba(122,240,255,0.35)', px + 3, py, 10, TT); R('#e0ffff', px + 7 + (f % 3) - 1, py, 2, TT); if (f % 2) R('#7af0ff', px + 5, py + (f * 5) % TT, 6, 2); }
      else if (c === 'e' && (G.t % 4) > 3.5) { if (Math.floor(G.t * 16) % 2) R('rgba(122,240,255,0.25)', px + 6, py, 4, TT); }
    } else if (c === 'b') { R('#12040a', px + 6, py, 4, TT); R('#5a545c', px + 7, py, 2, TT); }
  }
  // the gate's lever-side emitters, top and bottom of each barrier column
}
function drawEnts(sc) {
  var ox = sc.sx * SW, oy = sc.sy * SH;
  sc.signs.forEach(function (s) { spr('sw_plate', s.x - ox, s.y - oy + 8); });
  sc.portals.forEach(function (p) {
    var x = p.x - ox, y = p.y - oy - 2;
    if (p.open > 0) { var k = Math.min(1, (5 - p.open) * 4, p.open * 2); for (var i = 0; i < 5; i++) { KIT.ctx.strokeStyle = i % 2 ? '#fffbe8' : '#ffc840'; KIT.ctx.lineWidth = 2; KIT.ctx.beginPath(); KIT.ctx.ellipse(x, y - 30, (22 - i * 4) * k, (34 - i * 6) * k, G.t * (i % 2 ? 3 : -3), 0, 6.28); KIT.ctx.stroke(); } }
    else { KIT.ctx.strokeStyle = 'rgba(255,251,232,' + (0.3 + Math.sin(G.t * 3) * 0.15) + ')'; KIT.ctx.lineWidth = 1; KIT.ctx.beginPath(); KIT.ctx.ellipse(x, y, 18, 4, 0, 0, 6.28); KIT.ctx.stroke(); R('rgba(255,251,232,0.25)', x - 1, y - 24, 2, 20); }
  });
  sc.levers.forEach(function (l) { spr(sc.leverOn ? 'sw_lever1' : 'sw_lever0', l.x - ox, l.y - oy); });
  sc.lifts.forEach(function (l) { var x = l.x - ox, y = l.y - oy; R('#2a262c', x - 18, 0, 2, y - 4); R('#2a262c', x + 16, 0, 2, y - 4); spr('sw_lift', x, y + 2); text(l.up ? 'UP' : 'DOWN', x, y - 64, { align: 'center', size: 6, col: '#ffc840' }); });
  sc.exits.forEach(function (e) { spr('sw_exit', e.x - ox, e.y - oy); text('EXIT', e.x - ox, e.y - oy - 68, { align: 'center', size: 6, col: '#12040a', shadow: false }); });
  sc.mines.forEach(function (m) { if (m.alive) spr(Math.floor(G.t * 3) % 2 ? 'sw_mine1' : 'sw_mine0', m.x - ox, m.y - oy); });
  // homunculi
  homs.forEach(function (h) {
    if (h.st === 'saved' || h.st === 'dead' || scrAt(h.x, h.y - 4) !== sc) return;
    var base = 'h_' + h.breed + '_teen_', f = h.st === 'idle' ? base + 'idle' + (Math.floor(h.t * 3) % 2) : h.moving ? (Math.abs(h.vy) > 0.5 ? base + 'jump' : base + 'run' + (Math.floor(h.t * 10) % 4)) : base + 'idle' + (Math.floor(h.t * 2) % 2);
    if (!KIT.has(f)) f = 'h_gloop_teen_idle0';
    spr(f, h.x - ox, h.y - oy, { flip: h.face < 0, sc: 1.15 });
    if (h.st === 'idle') spr('sw_brush', h.x - ox + h.face * 10 + Math.sin(h.t * 8) * 3, h.y - oy - 1);
    if (h.st === 'wait') text('W', h.x - ox, h.y - oy - 44, { align: 'center', size: 6, col: '#a6968f' });
  });
  sc.guards.forEach(function (g) {
    var x = g.x - ox, y = g.y - oy;
    if (g.st === 'dead') { spr('f_blumguard_0', x, y + 6, { flip: g.face < 0, alpha: 0.4, rot: g.face * 1.4, sc: 1.35 }); return; }
    var f = g.st === 'patrol' ? 'f_blumguard_' + (Math.floor(g.t * 6) % 3) : g.st === 'alert' || g.st === 'shoot' ? 'f_blumguard_3' : 'f_blumguard_0';
    spr(f, x, y, { flip: g.face < 0, sc: 1.35 });
    if (g.st === 'sleep') text('z' + (Math.floor(G.t * 2) % 2 ? 'Z' : ''), x + 8, y - 46 - (G.t * 10) % 6, { size: 6, col: '#a6968f' });
    if (g.st === 'alert' && Math.floor(G.t * 12) % 2) { R('rgba(255,38,48,0.15)', g.face > 0 ? x : x - 230, y - 34, 230, 2); }
    if (g.st === 'shoot' && g.t < 0.12) { R('#ffe36a', Math.min(x, g.shotX - ox), y - 22, Math.abs(g.shotX - ox - x), 2); }
  });
  sc.blums.forEach(function (b) { if (b.st === 'dead') return; spr('f_blumling_' + (b.st === 'chase' ? Math.floor(b.t * 12) % 4 : 0), b.x - ox, b.y - oy, { flip: b.face > 0, sc: 1.4 }); if (b.st === 'idle') text('...', b.x - ox, b.y - oy - 26, { align: 'center', size: 6, col: '#a6968f' }); });
}
function drawP(sc) {
  var ox = sc.sx * SW, oy = sc.sy * SH, x = P.x - ox, y = P.y - oy, f;
  if (P.st === 'dead') { f = P.deadT > 1 ? 'ch_hurt0' : 'ch_death' + (P.deadT > 0.6 ? 0 : 1); if (P.why === 'blown up' || P.why === 'eaten by a blumling') return; }
  else if (P.st === 'hoist' || P.st === 'drop') f = 'ch_jump2';
  else if (P.st === 'air') f = P.vy < -60 ? 'ch_jump1' : P.vy < 100 ? 'ch_jump2' : 'ch_jump3';
  else if (P.st === 'run') f = 'ch_run' + (Math.floor(P.t * 14) % 7);
  else if (P.st === 'walk') f = 'ch_walk' + (Math.floor(P.t * 10) % 9);
  else f = 'ch_idle' + (Math.floor(P.t * 7) % 7);
  if (P.st === 'chant') { var k = Math.min(1, P.chant); KIT.ctx.save(); KIT.ctx.globalAlpha = 0.35 * k; KIT.ctx.fillStyle = '#ffe36a'; KIT.ctx.beginPath(); KIT.ctx.ellipse(x, y - 28, 22 + Math.sin(G.t * 20) * 3, 36, 0, 0, 6.28); KIT.ctx.fill(); KIT.ctx.restore(); for (var i = 0; i < 2; i++) parts.push({ x: P.x + rnd(-18, 18), y: P.y - rnd(0, 50), vx: 0, vy: -60, t: 0.4, c: '#ffe36a' }); }
  spr(f, x, y + 1, { flip: P.face < 0 });
}
function drawShadows(sc) { sc.s.shadows.forEach(function (r) { R('rgba(4,0,4,0.72)', r[0] * TT, r[1] * TT, (r[2] - r[0] + 1) * TT, (r[3] - r[1] + 1) * TT); }); }
function drawBubbles(sc) {
  var ox = sc.sx * SW, oy = sc.sy * SH;
  bubbles.forEach(function (b) { var e = b.e; if (scrAt(e.x, e.y - 4) !== sc) return; var w = KIT.tw(b.t, 6) + 10, x = clamp(e.x - ox - w / 2, 2, SW - w - 2), y = e.y - oy - (e === P ? 72 : 52); R('#12040a', x - 1, y - 1, w + 2, 14); R('#f1e7d0', x, y, w, 12); text(b.t, x + 5, y + 3, { size: 6, col: '#12040a', shadow: false }); });
}
function draw() {
  if (G.mode === 'title' || !P) { drawTitle(); return; }
  var sc = SC[G.scr] || scrAt(P.x, P.y - 4); if (!sc) return;
  drawBack(sc); drawTiles(sc); drawEnts(sc); drawP(sc); drawShadows(sc);
  parts.forEach(function (p) { R(p.c, p.x - sc.sx * SW, p.y - sc.sy * SH, 2, 2); });
  drawBubbles(sc);
  // a sign you are standing by
  sc.signs.forEach(function (s) { if (Math.abs(s.x - P.x) < 60 && Math.abs(s.y - P.y + 40) < 90) { var w = Math.min(440, KIT.tw(s.t, 6) + 24); KIT.panel(SW / 2 - w / 2, 40, w, 22); text(s.t, SW / 2, 48, { align: 'center', size: 6, col: '#ffe36a' }); } });
  // HUD
  KIT.panel(4, 4, 150, 26); spr('h_gloop_teen_idle0', 18, 28, { sc: 0.55 }); text('SAVED ' + G.saved + '/' + total, 32, 9, { size: 6, col: '#ffe36a' }); text('LOST ' + G.lost, 32, 19, { size: 6, col: '#ff2630' });
  var foll = homs.filter(function (h) { return h.st === 'follow'; }).length; if (foll) text('FOLLOWING ' + foll, 100, 19, { size: 6, col: '#a6968f' });
  if (banner) { var a = Math.min(1, banner.t * 2); text(banner.a, SW / 2, 74, { align: 'center', size: 24, font: 'title', col: '#ff2630', alpha: a }); text(banner.b, SW / 2, 100, { align: 'center', size: 6, alpha: a, col: '#a6968f' }); }
  if (P.st === 'dead' && P.deadT < 1.1) { R('rgba(0,0,0,' + (1 - P.deadT / 1.1) + ')', 0, 0, SW, SH); text(P.why ? P.why.toUpperCase() : '', SW / 2, SH / 2, { align: 'center', size: 8, col: '#ff2630' }); }
}
function drawTitle() {
  R('#0c0408', 0, 0, SW, SH); for (var y = 0; y < SH; y += 34) R('#160810', 0, y, SW, 17);
  for (var i = 0; i < 5; i++) R('#2a0e18', 30 + i * 100, 0, 10, SH);
  spr('ch_idle' + (Math.floor(G.t * 7) % 7), 200, 240); spr('h_gloop_teen_idle' + (Math.floor(G.t * 2) % 2), 250, 240); spr('h_blood_teen_idle0', 285, 240, { flip: true });
  R('#3a2a34', 0, 240, SW, 32);
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; music.play('swtitle'); var cont = KIT.load('sw-run', null);
  KIT.menu({ cls: 'clear', title: "Spuzzworld: Cum's Oddysee", sub: "Cumhead wakes up in a cell in Blumhead's Lair. Homunculi are held all over it. Escape alone, or bring them home.",
    items: [cont ? { label: 'CARRY ON', sub: 'From the last screen you reached', fn: function () { KIT.closeMenu(); continueGame(); }, cls: 'hot', def: true } : null,
      { label: cont ? 'START OVER' : 'WAKE UP', fn: function () { KIT.closeMenu(); newGame(); }, cls: cont ? '' : 'hot', def: !cont }, { label: 'HOW TO PLAY', fn: helpMenu }].filter(Boolean),
    note: SV.done ? 'Escapes ' + SV.done + '  ·  Most saved ' + SV.best + ' of ' + SCREENS.reduce(function (n, s) { return n + s.rows.join('').split('H').length - 1; }, 0) : '' });
}
function helpMenu() {
  KIT.menu({ title: 'How to Play', html: '<p><b>Move</b> left and right. Hold <b>B</b> (X key) to run. <b>A</b> (Z) jumps: standing, walking and running jumps go further each time. <b>Up</b> under a yellow ledge climbs, <b>down</b> on one drops. Up at a lever pulls it. Up/down on a lift rides it.</p><p><b>X</b> (C key): FOLLOW ME. <b>Y</b> (V key): WAIT. Hold <b>LB</b> (Q key, or the C button) next to a portal ring to chant it open; anyone following you jumps in and is home.</p><p>Guards shoot what they see. In the dark they cannot see you unless you run. Sleeping guards wake if you run past. Blumlings chase you but cannot climb. Mines go off underfoot. Die and the screen starts again.</p>',
    items: [{ label: 'BACK', back: true, fn: function () { if (G.mode === 'play') pauseMenu(); else titleMenu(); } }] });
}
function pauseMenu() {
  if (G.mode !== 'play' || KIT.menuOpen()) return;
  KIT.menu({ cls: 'clear', title: 'Paused', sub: 'Saved ' + G.saved + ' of ' + total + '  ·  Lost ' + G.lost, items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'RESTART THIS SCREEN', fn: function () { KIT.closeMenu(); restore(G.snap); } }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT TO TITLE', sub: 'Your place is kept', fn: titleMenu }] });
}
music.songs.swtitle = { bpm: 70, beats: 4, vol: 0.95, wet: 0.6, lead: 'soft', bass: 'drone', acc: 'bell', drums: null, chords: 'Dm Dm Bb A Dm Gm A A', mel: 'a4 - - - d5 - - - | f5 - e5 - d5 - - - | f5 - - - bb5 - - - | a5 - - - - - . . | d6 - - - a5 - - - | bb5 - a5 - g5 - - - | e5 - - - c#5 - - - | a4 - - - - - . .' };
music.songs.swcells = { bpm: 80, beats: 4, vol: 0.85, wet: 0.65, lead: 'soft', bass: 'drone', acc: 'bell', drums: 'slow', chords: 'Am Am F E', mel: 'e5 - - - . . a4 - | c5 - - - b4 - - - | a4 - - - c5 - f5 - | e5 - - - - - . .' };
music.songs.swworks = { bpm: 96, beats: 4, vol: 0.85, wet: 0.5, lead: 'fm', fmbass: 1, bass: 'walk', acc: 'bell', drums: 'industrial', chords: 'Em Em C B', mel: 'e4 . e4 . g4 . e4 . | b4 - - - a4 - - - | c5 . c5 . e5 . c5 . | b4 - - - d#5 - - -' };
music.songs.swthrone = { bpm: 108, beats: 4, vol: 0.9, wet: 0.45, lead: 'organlead', harm: 1, bass: 'drone', acc: 'organ', drums: 'tribal', chords: 'Cm Ab Fm G', mel: 'c5 - eb5 - g5 - c6 - | ab5 - - - eb5 - - - | f5 - ab5 - c6 - f6 - | d6 - - - b5 - - -' };
music.songs.swend = { bpm: 84, beats: 4, vol: 0.9, wet: 0.5, lead: 'calliope', bass: 'walk', acc: 'arp8', drums: 'slow', chords: 'F C Dm Bb F C Bb C', mel: 'a5 - - - g5 - f5 - | e5 - - - c5 - - - | d5 - f5 - a5 - d6 - | c6 - - - bb5 - - - | a5 - c6 - f6 - - - | e6 - - - c6 - - - | d6 - c6 - bb5 - a5 - | g5 - - - - - . .' };

KIT.start({ w: SW, h: SH, update: update, draw: draw, onPause: pauseMenu,
  pad: { four: false, btns: [{ k: 'a', label: 'A', sub: 'JUMP' }, { k: 'b', label: 'B', sub: 'RUN' }, { k: 'x', label: 'X', sub: 'FOLLOW' }, { k: 'y', label: 'Y', sub: 'WAIT' }, { k: 'lb', label: 'C', sub: 'CHANT', cls: 'gold' }] } });
titleMenu();
window.__sw = { G: G, get P() { return P; }, get homs() { return homs; }, SC: function () { return SC; }, newGame: newGame, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } }, restore: restore, speak: speak, useUp: useUp, useDown: useDown, die: die,
  tp: function (key, tx, ty) { var s = SC[key]; P.x = s.sx * SW + tx * TT + 8; P.y = s.sy * SH + (ty + 1) * TT; P.st = 'stand'; P.ground = true; P.fallFrom = P.y; } };
