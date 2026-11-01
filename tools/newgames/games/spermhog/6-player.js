/* =====================================================================================================
   CUMHEAD: momentum along the ground (slopes speed you up going down and slow you going up), a jump and a
   double jump, a shot (B), stomping foes, and Sonic's rules for drops: get hit holding drops and they scatter
   (grab some back); get hit with none and you lose a life.
   ===================================================================================================== */
var PL = null;
function newPlayer(x, y) { PL = { x: x, y: y, vx: 0, vy: 0, gsp: 0, air: false, face: 1, jumps: 0, state: 'normal', inv: 0, hurtT: 0, deadT: 0, atkT: 0, atkCd: 0, anim: 0, lock: 0, spring: 0, slope: 0, shield: 0, prevJ: false, prevA: false, idle: 0 }; }
function pIn() {
  var s = KIT.stick(0), l = KIT.held('left') || (s.on && s.x < -0.4), r = KIT.held('right') || (s.on && s.x > 0.4);
  return { dir: (r ? 1 : 0) - (l ? 1 : 0), j: KIT.held('a'), at: KIT.held('b') || KIT.held('x'), down: KIT.held('down') };
}
function sensors(x, y, y0, y1, ow) { var a = floorAt(x - 5, y0, y1, ow), b = floorAt(x + 5, y0, y1, ow); return { l: a, r: b, f: a === null ? b : b === null ? a : Math.min(a, b) }; }
function stepPlayer(dt) {
  var p = PL, inp = G.mode === 'clear' || G.ctl === false ? { dir: G.mode === 'clear' ? 1 : 0, j: false, at: false } : pIn(), K = PHYS;
  var jp = inp.j && !p.prevJ, ap = inp.at && !p.prevA; p.prevJ = inp.j; p.prevA = inp.at;
  if (p.inv > 0) p.inv -= dt; if (p.atkT > 0) p.atkT -= dt; if (p.atkCd > 0) p.atkCd -= dt; if (p.lock > 0) p.lock -= dt; if (p.spring > 0) p.spring -= dt;
  if (p.state === 'dead') { p.vy += K.grav * dt; p.y += p.vy * dt; p.deadT += dt; if (p.deadT > 2) loseLife(); return; }
  var liq = liquidAt(p.x, p.y - 10), wet = liq === 'cream', top = K.top * (G.shoes > 0 ? 1.45 : 1) * (wet ? 0.6 : 1);
  if (liq === 'lava') { hurt(p.x, true); p.vy = -460; p.air = true; }
  if (p.state === 'hurt') { p.hurtT -= dt; if (p.hurtT <= 0 && !p.air) p.state = 'normal'; }
  var ctl = p.state === 'normal' && p.lock <= 0, dir = ctl ? inp.dir : 0;
  if (dir) p.face = dir;
  // the shot
  if (ap && p.atkCd <= 0 && p.state === 'normal') { p.atkT = 0.2; p.atkCd = 0.32; SHOTS.push({ x: p.x + p.face * 14, y: p.y - 24, vx: p.face * 330 + p.gsp * 0.3, vy: 0, life: 0.55, k: 'sperm', mine: true }); sfx.play('shoot'); }
  if (!p.air) {
    // ---- on the ground ----
    var s = sensors(p.x, p.y, p.y - 14, p.y + 14, true), slope = (s.l !== null && s.r !== null) ? (s.r - s.l) / 10 : 0; p.slope = slope;
    var sn = slope / Math.sqrt(1 + slope * slope);
    if (dir) { var sg = Math.sign(p.gsp); if (sg && sg !== dir) p.gsp += dir * K.brake * dt; else if (Math.abs(p.gsp) < top) p.gsp = Math.min(top, Math.max(-top, p.gsp + dir * K.acc * dt)); }
    else { var dcc = Math.min(Math.abs(p.gsp), K.dec * dt * (inp.down ? 0.25 : 1)); p.gsp -= Math.sign(p.gsp) * dcc; }
    p.gsp += K.slope * sn * dt * (Math.abs(sn) > 0.15 ? 1 : 0.4); // downhill pulls you on, uphill drags you back
    if (Math.abs(p.gsp) > top) p.gsp -= Math.sign(p.gsp) * Math.min(Math.abs(p.gsp) - top, (Math.abs(sn) > 0.2 ? 60 : 260) * dt);
    p.gsp = Math.max(-K.maxg, Math.min(K.maxg, p.gsp));
    var ch = T(Math.floor(p.x / TS), Math.floor((p.y + 2) / TS)); if (ch === '_') p.x += 70 * dt; else if (ch === '-') p.x -= 70 * dt;
    var pu = platUnder(p.x, p.y); if (pu) { p.x += pu.dx; p.y += pu.dy; if (pu.k === 'crumble' && !pu.touch && !pu.fall) pu.touch = 0.001; }
    var nx = p.x + p.gsp * dt;
    if (blocked(nx, p.y, p.gsp)) { p.gsp = 0; nx = p.x; }
    p.x = nx;
    var s2 = sensors(p.x, p.y, p.y - 15, p.y + 16, true);
    if (s2.f !== null) p.y = s2.f;
    else { p.air = true; p.vx = p.gsp; p.vy = Math.min(0, slope * p.gsp * 0.9); p.jumps = 0; p.coyote = 0.08; }
    if (jp && p.state === 'normal') { p.air = true; p.vx = p.gsp; p.vy = -K.jumpv * (wet ? 0.8 : 1) + Math.min(0, slope * p.gsp * 0.5); p.jumps = 1; p.jumpHold = true; sfx.play('jump'); }
    if (Math.abs(p.gsp) < 5 && dir === 0) p.idle += dt; else p.idle = 0;
  } else {
    // ---- in the air ----
    if (p.coyote > 0) { p.coyote -= dt; if (jp && p.jumps === 0) { p.vy = -K.jumpv; p.jumps = 1; jp = false; p.coyote = 0; sfx.play('jump'); } }
    if (dir) { if (Math.abs(p.vx) < top || Math.sign(p.vx) !== dir) p.vx += dir * K.airacc * dt * (wet ? 0.6 : 1); }
    else p.vx -= p.vx * Math.min(1, dt * 0.4);
    if (jp && p.jumps <= 1 && p.state === 'normal' && p.spring <= 0.2) { p.vy = -K.jump2 * (wet ? 0.85 : 1); p.jumps = 2; sfx.play('jump2'); FX.push({ k: 'ring', x: p.x, y: p.y, t: 0.3 }); }
    if (!inp.j && p.vy < -K.jcut && p.jumps >= 1 && p.spring <= 0) p.vy = -K.jcut;
    p.vy = Math.min(K.term * (wet ? 0.35 : 1), p.vy + K.grav * dt * (wet ? 0.4 : 1));
    var ax = p.x + p.vx * dt;
    if (blocked(ax, p.y, p.vx)) { p.vx = 0; ax = p.x; }
    p.x = ax;
    var py0 = p.y; p.y += p.vy * dt;
    if (p.vy < 0) { // head
      var hy = p.y - PH; if (wallAt(p.x - 4, hy) || wallAt(p.x + 4, hy)) { p.y = (Math.floor(hy / TS) + 1) * TS + PH; p.vy = 0; if (T(Math.floor(p.x / TS), Math.floor(hy / TS)) === 'v') hurt(p.x); }
    } else {
      var s3 = sensors(p.x, p.y, py0 - 1, p.y + 1, true);
      if (s3.f !== null && s3.f >= py0 - 1) { p.y = s3.f; p.air = false; p.gsp = p.vx; p.jumps = 0; p.vy = 0; if (p.state === 'hurt') p.state = 'normal'; sfx.play('land', 0.5); }
    }
  }
  // spikes and falling out of the world
  var spk = T(Math.floor(p.x / TS), Math.floor((p.y - 4) / TS)); if (spk === '^') hurt(p.x, true);
  if (p.y > LV.h * TS + 30) die(true);
  p.anim += dt * (p.air ? 8 : Math.max(4, Math.abs(p.gsp) * 0.09)); if (!p.air) p.dist = (p.dist || 0) + Math.abs(p.gsp) * dt; // the feet follow the ground covered, so the legs never slide
  if (G.lock) { var L = G.lock; if (p.x < L.x0 + PHW) { p.x = L.x0 + PHW; p.gsp = Math.max(0, p.gsp); p.vx = Math.max(0, p.vx); } if (p.x > L.x1 - PHW) { p.x = L.x1 - PHW; p.gsp = Math.min(0, p.gsp); p.vx = Math.min(0, p.vx); } }
  if (p.x < PHW) { p.x = PHW; p.gsp = 0; p.vx = 0; }
}
function blocked(nx, y, v) { if (!v) return false; var ex = nx + Math.sign(v) * PHW; return wallAt(ex, y - 12) || wallAt(ex, y - 24) || wallAt(ex, y - PH + 2); }
function hurt(srcx, hazard) {
  var p = PL; if (p.state !== 'normal' || p.inv > 0 || G.star > 0 || G.mode !== 'play') return;
  if (p.shield) { p.shield = 0; p.inv = 1.2; sfx.play('pop'); knock(srcx, 0.6); return; }
  if (G.drops <= 0) { die(false); return; }
  var n = Math.min(G.drops, 24); for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + (i % 2 ? 1 : -1) * (0.2 + (i >> 1) * 0.16); SCAT.push({ x: p.x, y: p.y - 20, vx: Math.cos(a) * (120 + (i % 4) * 30), vy: Math.sin(a) * 260, t: 0 }); }
  G.drops = 0; sfx.play('scatter'); knock(srcx, 1); p.inv = 2;
}
function knock(srcx, k) { var p = PL; p.state = 'hurt'; p.hurtT = 0.5; p.air = true; p.vy = -300 * k; p.vx = (p.x < srcx ? -1 : 1) * 160 * k; p.gsp = 0; G.shake = Math.max(G.shake, 3); }
function die(fell) { var p = PL; if (p.state === 'dead') return; p.state = 'dead'; p.deadT = 0; p.vy = fell ? 0 : -420; p.shield = 0; G.shoes = 0; G.star = 0; sfx.play('die'); music.stop(0.4); }
