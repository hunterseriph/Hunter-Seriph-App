/* ---------- weapons: each one fires by itself. w = { id, lv, t (timer), evo, ... } ---------- */
function L(w, n) { return w.lv >= n ? 1 : 0; } // 1 once the weapon has reached level n
function cdOf(base) { return base * S.cool * (G.frenzy > 0 ? 0.6 : 1); }
function nearestFoe(x, y, maxD, skip) {
  var best = null, bd = (maxD || 9999) * (maxD || 9999);
  for (var i = 0; i < foes.length; i++) { var e = foes[i]; if (e.dead || (skip && skip.indexOf(e) >= 0) || e.under) continue; var d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y); if (d < bd) { bd = d; best = e; } }
  return best;
}
function onScreenFoes() { var cx = CAM.x, cy = CAM.y, out = []; for (var i = 0; i < foes.length; i++) { var e = foes[i]; if (!e.dead && !e.under && e.x > cx - 10 && e.x < cx + KIT.W + 10 && e.y > cy - 10 && e.y < cy + H + 10) out.push(e); } return out; }
function aimDir() { // the right stick aims; otherwise the nearest foe; otherwise the way she faces
  var a = KIT.stick(1); if (a.on) return Math.atan2(a.y, a.x);
  var e = nearestFoe(P.x, P.y, 420); if (e) return Math.atan2(e.y - P.y, e.x - P.x);
  return P.face > 0 ? 0 : Math.PI;
}
function shot(o) { o.hit = o.hit || {}; o.t = 0; o.life = o.life || 1; o.pierce = o.pierce === undefined ? 0 : o.pierce; shots.push(o); return o; }
var WB = {
  droplet: {
    step: function (w, dt) {
      if (w.evo) { w.t -= dt; if (w.t > 0) return; w.t = cdOf(0.09); var a = aimDir(), n = 1 + Math.floor(S.amount / 2);
        for (var i = 0; i < n; i++) { var aa = a + rnd(-0.12, 0.12) + (i - (n - 1) / 2) * 0.1; shot({ w: 'droplet', k: 'drop', x: P.x, y: P.y - 18, vx: Math.cos(aa) * 380 * S.pspd, vy: Math.sin(aa) * 380 * S.pspd, r: 5 * S.area, dmg: 14, pierce: 99, life: 0.9 * S.dur, rehit: 0.25, spr: 'sv_drop', rot: aa }); }
        if (Math.random() < 0.3) sfx.play('shoot'); return; }
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(0.85);
      var n2 = 1 + L(w, 2) + L(w, 4) + L(w, 6) + S.amount, dmg = 12 + 5 * L(w, 3) + 5 * L(w, 7), pierce = L(w, 5) + L(w, 8);
      var targets = [], skip = [];
      for (var k = 0; k < n2; k++) { var e = nearestFoe(P.x, P.y, 440, skip); if (e) { skip.push(e); targets.push(Math.atan2(e.y - P.y, e.x - P.x)); } }
      var st = KIT.stick(1); if (st.on || !targets.length) { var a0 = aimDir(); targets = []; for (var j = 0; j < n2; j++) targets.push(a0 + (j - (n2 - 1) / 2) * 0.14); }
      targets.forEach(function (a, i) { setTimeout0(i * 0.05, function () { shot({ w: 'droplet', k: 'drop', x: P.x, y: P.y - 18, vx: Math.cos(a) * 300 * S.pspd, vy: Math.sin(a) * 300 * S.pspd, r: 4 * S.area, dmg: dmg, pierce: pierce, life: 1.2 * S.dur, spr: 'sv_drop', rot: a }); }); });
      sfx.play('shoot');
    }
  },
  tail: {
    step: function (w, dt) {
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(1.5 * (w.lv >= 6 ? 0.9 : 1) * (w.evo ? 0.85 : 1));
      var dmg = 14 + 6 * L(w, 3) + 6 * L(w, 5) + 8 * L(w, 8) + (w.evo ? 10 : 0), sz = S.area * (1 + 0.15 * L(w, 4) + 0.15 * L(w, 7)) * (w.evo ? 1.3 : 1);
      var sides = [P.face]; if (w.lv >= 2 || w.evo) sides.push(-P.face);
      var n = 1 + S.amount;
      for (var r = 0; r < n; r++) sides.forEach(function (sd, si) {
        setTimeout0(r * 0.18 + si * 0.09, function () {
          var bw = 74 * sz, bh = 28 * sz, x0 = sd > 0 ? P.x : P.x - bw, y0 = P.y - 14 - bh / 2 + (r % 2 ? 16 : 0);
          fx.push({ k: 'slap', x: P.x, y: y0 + bh / 2, dir: sd, w: bw, h: bh, t: 0, life: 0.22 });
          areaHit(x0, y0, bw, bh, dmg, 'tail', { kx: sd * 160, ky: 0 });
          if (w.evo) shot({ w: 'tail', k: 'wave', x: P.x + sd * 20, y: y0 + bh / 2, vx: sd * 260 * S.pspd, vy: 0, r: 16 * sz, dmg: dmg * 0.7, pierce: 99, life: 1.1 * S.dur, spr: 'sv_wave', flip: sd < 0, kb: 180 });
          sfx.play('splat');
        });
      });
    }
  },
  bubble: {
    step: function (w, dt) {
      var n = 2 + L(w, 2) + L(w, 5) + L(w, 8) + S.amount + (w.evo ? 2 : 0), on = 3 * S.dur + L(w, 3);
      if (!w.evo) { w.t -= dt; if (w.t <= 0) { w.on = !w.on; w.t = w.on ? on : cdOf(2.6); if (w.on) sfx.play('magic'); } } else w.on = true;
      if (!w.on) return;
      w.ang = (w.ang || 0) + dt * (2.8 + 1.4 * L(w, 6));
      var rad = 52 * S.area * (w.evo ? 1.2 : 1), dmg = 9 + 5 * L(w, 4) + 5 * L(w, 7) + (w.evo ? 6 : 0), br = 9 * S.area * (w.evo ? 1.3 : 1);
      w.pts = [];
      for (var i = 0; i < n; i++) { var a = w.ang + i * Math.PI * 2 / n, x = P.x + Math.cos(a) * rad, y = P.y - 16 + Math.sin(a) * rad; w.pts.push([x, y, br]); circleHit(x, y, br, dmg, 'bubble', 0.45, 60); }
    }
  },
  swarm: {
    step: function (w, dt) {
      w.t -= dt; if (w.t > 0) return;
      if (w.evo) { w.t = cdOf(0.22); for (var q = 0; q < 1 + Math.floor(S.amount / 2); q++) spawnSperm(16, 1.25); return; }
      w.t = cdOf(1.7); var n = 2 + L(w, 2) + L(w, 4) + L(w, 6) + 2 * L(w, 8) + S.amount, dmg = 8 + 4 * L(w, 3) + 4 * L(w, 7);
      for (var i = 0; i < n; i++) setTimeout0(i * 0.06, function () { spawnSperm(dmg, w.lv >= 5 ? 1.15 : 1); });
    }
  },
  puddle: {
    step: function (w, dt) {
      var rad = 22 * S.area * (1 + 0.2 * L(w, 3) + 0.2 * L(w, 7)), dmg = 5 + 2 * L(w, 4) + 3 * L(w, 8), life = 2.6 * S.dur + L(w, 5);
      if (w.evo) { w.tr = (w.tr || 0) - dt; if (w.tr <= 0) { w.tr = 0.22; pools.push({ x: P.x + rnd(-6, 6), y: P.y + rnd(-4, 6), r: rad * 1.15, dmg: dmg + 3, life: 3.6 * S.dur, t: 0, tick: 0, hold: 1 }); } }
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(3.2);
      var n = 1 + L(w, 2) + L(w, 6) + S.amount, list = onScreenFoes();
      for (var i = 0; i < n; i++) { var e = list.length ? pick(list) : null, x = e ? e.x : P.x + rnd(-120, 120), y = e ? e.y : P.y + rnd(-90, 90); pools.push({ x: x, y: y, r: rad, dmg: dmg, life: life, t: 0, tick: 0, drop: 0.25 }); }
      sfx.play('pour');
    }
  },
  pie: {
    step: function (w, dt) {
      w.t -= dt; if (w.t > 0) return;
      var dmg = 22 + 10 * L(w, 3) + 10 * L(w, 6), splat = 26 * S.area * (1 + 0.3 * L(w, 4));
      if (w.evo) { w.t = cdOf(0.3); var list = onScreenFoes(), e = list.length ? pick(list) : null, x = e ? e.x : P.x + rnd(-160, 160), y = e ? e.y : P.y + rnd(-100, 100);
        marks.push({ k: 'pie', x: x, y: y, r: 40 * S.area, t: 0, at: 0.55, dmg: dmg * 1.6, w: 'pie' }); return; }
      w.t = cdOf(1.8 * (w.lv >= 7 ? 0.85 : 1));
      var n = 1 + L(w, 2) + L(w, 5) + L(w, 8) + S.amount;
      for (var i = 0; i < n; i++) setTimeout0(i * 0.1, function () { shot({ w: 'pie', k: 'pie', x: P.x, y: P.y - 20, vx: rnd(-90, 90) + P.face * 30, vy: -280 * S.pspd, grav: 520, r: 8 * S.area, dmg: dmg, pierce: 4, life: 1.5 * S.dur, spr: 'sv_pie', spin: rnd(-6, 6), splat: splat }); });
      sfx.play('jump');
    }
  },
  beat: {
    step: function (w, dt) {
      w.t -= dt; if (w.t > 0) return;
      w.t = cdOf(w.evo ? 1.4 : 3.6 * (w.lv >= 4 ? 0.85 : 1) * (w.lv >= 7 ? 0.85 : 1));
      var R0 = (w.evo ? 150 : 80) * S.area * (1 + 0.2 * L(w, 2) + 0.2 * L(w, 5) + 0.2 * L(w, 8)), dmg = 12 + 6 * L(w, 3) + 8 * L(w, 6) + (w.evo ? 10 : 0);
      for (var q = 0; q <= S.amount; q++) setTimeout0(q * 0.25, function () { rings.push({ x: P.x, y: P.y - 14, r: 0, R: R0, dmg: dmg, t: 0, life: 0.45, hit: {}, w: 'beat', kb: 260, stun: w.evo ? 1 : 0, col: '#c08aff' }); });
      sfx.add('beat', function () { sfx.tone('sine', 110, 40, 0.3, 0.2); sfx.noise(0.15, 0.08, 200); }); sfx.play('beat');
    }
  },
  pill: {
    step: function (w, dt) {
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(2.6);
      var n = 1 + L(w, 2) + L(w, 5) + L(w, 8) + S.amount, dmg = 10 + 5 * L(w, 3) + 5 * L(w, 6) + (w.evo ? 10 : 0), big = w.evo ? 2 : w.lv >= 7 ? 1.5 : 1;
      for (var i = 0; i < n; i++) { var a = rnd(0, 6.283); shot({ w: 'pill', k: 'pill', x: P.x, y: P.y - 16, vx: Math.cos(a) * 220 * S.pspd, vy: Math.sin(a) * 220 * S.pspd, r: 5 * big * S.area, dmg: dmg, pierce: 999, rehit: 0.3, life: (2.5 + L(w, 4)) * S.dur, spr: w.evo ? 'sv_pillb' : 'sv_pill', bounce: 1, spin: 8, silly: w.evo }); }
      sfx.play('blip');
    }
  },
  sirj: {
    step: function (w, dt) {
      if (w.evo) {
        if (!w.cats) { w.cats = []; for (var c = 0; c < 9; c++) w.cats.push({ x: P.x, y: P.y, t: c * 0.13, j: null }); }
        w.cats.forEach(function (ct) { ct.t -= dt; if (ct.j) return catStep(ct, dt, 46, 30 * S.area); if (ct.t <= 0) { ct.t = cdOf(1.2); var e = pick(onScreenFoes()) || null; if (e) pounce(ct, e, 46, 30 * S.area); } else { ct.x = lerp(ct.x, P.x + Math.cos(KIT.t + ct.t * 9) * 26, 0.1); ct.y = lerp(ct.y, P.y + Math.sin(KIT.t + ct.t * 9) * 12, 0.1); } });
        return;
      }
      if (!w.cat) w.cat = { x: P.x - 16, y: P.y, j: null, q: 0 };
      var ct2 = w.cat, dmg = 30 + 10 * L(w, 3) + 12 * L(w, 6), rad = 22 * S.area * (1 + 0.3 * L(w, 7));
      if (ct2.j) { catStep(ct2, dt, dmg, rad); return; }
      if (ct2.q > 0) { var t = nearestFoe(ct2.x, ct2.y, 360); if (t) { pounce(ct2, t, dmg, rad); ct2.q--; return; } ct2.q = 0; }
      ct2.x = lerp(ct2.x, P.x - P.face * 18, 0.12); ct2.y = lerp(ct2.y, P.y + 2, 0.12);
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(3.2 * (w.lv >= 4 ? 0.8 : 1)); ct2.q = 1 + L(w, 2) + L(w, 5) + L(w, 8) + S.amount;
    }
  },
  hom: {
    step: function (w, dt) {
      var n = 1 + S.amount;
      if (!w.pets) w.pets = [];
      while (w.pets.length < n) w.pets.push({ b: w.evo ? 'blood' : homPick(), x: P.x, y: P.y, t: 0, face: 1, bite: 0 });
      var st = w.evo ? 2 : w.lv >= 6 ? 2 : w.lv >= 3 ? 1 : 0, dmg = 10 + 5 * L(w, 2) + 6 * L(w, 5) + 8 * L(w, 8) + (w.evo ? 12 : 0) + st * 4, rate = 0.6 * (w.lv >= 4 ? 0.8 : 1) * (w.lv >= 7 ? 0.8 : 1);
      w.pets.forEach(function (p, i) {
        if (w.evo) p.b = 'blood';
        p.st = st; p.bite -= dt; p.t += dt;
        var e = nearestFoe(P.x, P.y, 230), tx = e ? e.x : P.x + (i % 2 ? 24 : -24), ty = e ? e.y : P.y + 6, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1, sp = e ? 200 : 140;
        if (d > (e ? 10 : 18)) { p.x += dx / d * Math.min(d, sp * dt); p.y += dy / d * Math.min(d, sp * dt); p.mv = 1; } else p.mv = 0;
        if (Math.abs(dx) > 2) p.face = dx > 0 ? 1 : -1;
        if (e && d < e.r + 14 && p.bite <= 0) { p.bite = cdOf(rate); hurtFoe(e, dmg, 'hom', dx / d * 80, dy / d * 80); p.atk = 0.15; if (w.evo) heal(1, true); }
        if (w.evo && e && Math.random() < dt * 0.8) shot({ w: 'hom', k: 'cres', x: p.x, y: p.y - 10, vx: (e.x - p.x) / d * 240, vy: (e.y - p.y) / d * 240, r: 9, dmg: dmg, pierce: 99, life: 1, spr: 'sv_crescent', spin: 10 });
        if (p.atk > 0) p.atk -= dt;
        if (Math.hypot(P.x - p.x, P.y - p.y) > 320) { p.x = P.x; p.y = P.y; }
      });
    }
  },
  trident: {
    step: function (w, dt) {
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(2.4 * (w.lv >= 6 ? 0.9 : 1));
      var n = 2 + L(w, 2) + L(w, 5) + 2 * L(w, 8) + S.amount, dmg = 24 + 8 * L(w, 3) + 10 * L(w, 7) + (w.evo ? 8 : 0), rad = 16 * S.area * (1 + 0.3 * L(w, 4)), list = shuffle(onScreenFoes());
      for (var i = 0; i < n; i++) (function (e, i) { setTimeout0(i * 0.07, function () {
        var x = e ? e.x : P.x + rnd(-200, 200), y = e ? e.y : P.y + rnd(-120, 120); bolt(x, y, rad, dmg);
        if (w.evo) { var prev = { x: x, y: y }, hitl = e ? [e] : []; for (var c = 0; c < 3; c++) { var nx = nearestFoe(prev.x, prev.y, 120, hitl); if (!nx) break; hitl.push(nx); fx.push({ k: 'arc', x: prev.x, y: prev.y, x2: nx.x, y2: nx.y - 8, t: 0, life: 0.2 }); hurtFoe(nx, dmg * 0.7, 'trident', 0, 0); prev = nx; } }
      }); })(list[i], i);
      sfx.add('zap', function () { sfx.noise(0.12, 0.12, 4000); sfx.tone('square', 1400, 200, 0.12, 0.04); }); sfx.play('zap');
    }
  },
  garlic: {
    step: function (w, dt) {
      var rad = (w.evo ? 64 : 30 * (1 + 0.15 * L(w, 2) + 0.15 * L(w, 4) + 0.15 * L(w, 7))) * S.area, dmg = 4 + 2 * L(w, 3) + 2 * L(w, 5) + 3 * L(w, 8) + (w.evo ? 4 : 0);
      w.rad = rad; w.t -= dt; if (w.t > 0) return; w.t = cdOf(0.5 * (w.lv >= 6 ? 0.8 : 1));
      circleHit(P.x, P.y - 12, rad, dmg, 'garlic', 0, 40, w.evo ? function () { heal(0.5, true); } : null);
    }
  },
  sausage: {
    step: function (w, dt) {
      if (w.evo) {
        w.ang = (w.ang || 0) + dt * 3.2; w.sp = ((w.sp || 0) + dt * 0.45) % 1; var rr = (40 + w.sp * 130) * S.area, n = 2 + S.amount;
        w.pts = []; for (var i = 0; i < n; i++) { var a = w.ang + i * Math.PI * 2 / n, x = P.x + Math.cos(a) * rr, y = P.y - 12 + Math.sin(a) * rr * 0.8; w.pts.push([x, y]); circleHit(x, y, 26 * S.area, 22, 'sausage', 0.25, 120); }
        return;
      }
      w.t -= dt; if (w.t > 0) return; w.t = cdOf(1.6 * (w.lv >= 7 ? 0.85 : 1));
      var n2 = 1 + L(w, 2) + L(w, 5) + L(w, 8) + S.amount, dmg = 15 + 8 * L(w, 3) + 8 * L(w, 6), sc = w.lv >= 4 ? 1.3 : 1, a0 = aimDir();
      for (var j = 0; j < n2; j++) { var a2 = a0 + (j - (n2 - 1) / 2) * 0.35; shot({ w: 'sausage', k: 'saus', x: P.x, y: P.y - 16, vx: Math.cos(a2) * 330 * S.pspd, vy: Math.sin(a2) * 330 * S.pspd, ret: 1, r: 9 * sc * S.area, dmg: dmg, pierce: 999, rehit: 0.4, life: 2.4, spr: 'sv_sausage', spin: 14, sc: sc }); }
      sfx.play('jump');
    }
  }
};
/* little helpers the weapons share */
var LATER = [];
function setTimeout0(s, fn) { if (s <= 0) fn(); else LATER.push({ t: s, fn: fn }); } // game-time delays (they pause with the game)
function spawnSperm(dmg, spd) { var a = aimDir() + rnd(-1.2, 1.2); shot({ w: 'swarm', k: 'sperm', x: P.x, y: P.y - 16, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, r: 4 * S.area, dmg: dmg, pierce: 0, life: 2.6 * S.dur, spr: 'sv_sperm', homing: 1, spd: 210 * spd * S.pspd }); }
function pounce(ct, e, dmg, rad) { ct.j = { x0: ct.x, y0: ct.y, x1: e.x, y1: e.y, t: 0, T: 0.32, dmg: dmg, rad: rad }; }
function catStep(ct, dt, dmg, rad) {
  var j = ct.j; j.t += dt; var k = Math.min(1, j.t / j.T); ct.x = lerp(j.x0, j.x1, k); ct.y = lerp(j.y0, j.y1, k); ct.z = Math.sin(k * Math.PI) * 30; ct.face = j.x1 > j.x0 ? 1 : -1;
  if (k >= 1) { ct.j = null; ct.z = 0; circleHit(ct.x, ct.y, j.rad, j.dmg, 'sirj', 0, 120); fx.push({ k: 'ring', x: ct.x, y: ct.y, r: j.rad, t: 0, life: 0.25, col: '#f1e7d0' }); sfx.play('hit'); }
}
function bolt(x, y, rad, dmg) { fx.push({ k: 'bolt', x: x, y: y, t: 0, life: 0.25 }); circleHit(x, y, rad, dmg, 'trident', 0, 0); }
function areaHit(x, y, w, h, dmg, src, o) {
  o = o || {}; near(x + w / 2, y + h / 2, Math.max(w, h), function (e) { if (e.x + e.r > x && e.x - e.r < x + w && e.y - 10 + e.r > y && e.y - 10 - e.r < y + h) hurtFoe(e, dmg, src, o.kx || 0, o.ky || 0); });
}
/* every foe inside a circle; rehit: per-foe cooldown for this source (0 = every call) */
function circleHit(x, y, r, dmg, src, rehit, kb, onKill) {
  near(x, y, r + 20, function (e) {
    var dx = e.x - x, dy = e.y - 10 - y, rr = r + e.r; if (dx * dx + dy * dy > rr * rr) return;
    if (rehit) { var key = src + 'h'; if ((e[key] || 0) > KIT.t) return; e[key] = KIT.t + rehit; }
    var d = Math.hypot(dx, dy) || 1, k = hurtFoe(e, dmg, src, dx / d * (kb || 0), dy / d * (kb || 0)); if (k && onKill) onKill(e);
  });
}
function stepShots(dt) {
  for (var i = shots.length - 1; i >= 0; i--) {
    var s = shots[i]; s.t += dt;
    if (s.homing) { var e = s.tg && !s.tg.dead ? s.tg : (s.tg = nearestFoe(s.x, s.y, 300)); if (e) { var a = Math.atan2(e.y - 10 - s.y, e.x - s.x), cur = Math.atan2(s.vy, s.vx), da = Math.atan2(Math.sin(a - cur), Math.cos(a - cur)); cur += clamp(da, -7 * dt, 7 * dt); s.vx = Math.cos(cur) * s.spd; s.vy = Math.sin(cur) * s.spd; } }
    if (s.grav) s.vy += s.grav * dt;
    if (s.ret) { var back = s.t > 0.45; if (back) { var dx = P.x - s.x, dy = P.y - 16 - s.y, d = Math.hypot(dx, dy) || 1; s.vx = lerp(s.vx, dx / d * 380, 0.08); s.vy = lerp(s.vy, dy / d * 380, 0.08); if (d < 14 && s.t > 0.6) s.life = 0; } else { s.vx *= 0.97; s.vy *= 0.97; } }
    s.x += s.vx * dt; s.y += s.vy * dt; if (s.spin) s.rot = (s.rot || 0) + s.spin * dt;
    if (s.bounce) { var cx = CAM.x, cy = CAM.y; if (s.x < cx + 4 && s.vx < 0 || s.x > cx + KIT.W - 4 && s.vx > 0) s.vx = -s.vx; if (s.y < cy + 4 && s.vy < 0 || s.y > cy + H - 4 && s.vy > 0) s.vy = -s.vy; }
    if (!inBand(s.x, s.y, -10) && !s.bounce) s.life = 0;
    // hits
    (function (s) {
      near(s.x, s.y, s.r + 24, function (e) {
        if (s.life <= 0 || s.t > s.life) return;
        var dx = e.x - s.x, dy = e.y - 10 - s.y, rr = s.r + e.r; if (dx * dx + dy * dy > rr * rr) return;
        var id = e.id; if (s.hit[id] && (!s.rehit || s.hit[id] > KIT.t)) return; s.hit[id] = s.rehit ? KIT.t + s.rehit : 1;
        var sp = Math.hypot(s.vx, s.vy) || 1; hurtFoe(e, s.dmg, s.w, s.vx / sp * (s.kb || 50), s.vy / sp * (s.kb || 50));
        if (s.silly && !e.boss) { var r = rndi(0, 3); if (r === 0) e.slowT = 2; else if (r === 1) e.confT = 2; else if (r === 2) e.burnT = 3; else e.softT = 3; }
        if (s.pierce-- <= 0) s.life = 0;
      });
    })(s);
    if (s.t > s.life || s.life <= 0) { if (s.splat) { circleHit(s.x, s.y, s.splat, s.dmg * 0.5, s.w, 0, 60); fx.push({ k: 'splat', x: s.x, y: s.y, t: 0, life: 0.5 }); } shots.splice(i, 1); }
  }
  // pools, rings and marks
  for (i = pools.length - 1; i >= 0; i--) { var p = pools[i]; p.t += dt; p.tick -= dt; if (p.tick <= 0) { p.tick = 0.35; circleHit(p.x, p.y + 10, p.r, p.dmg, 'puddle', 0, 0); } if (p.hold) near(p.x, p.y, p.r + 20, function (e) { if (!e.boss && Math.hypot(e.x - p.x, e.y - p.y) < p.r + e.r) e.slowT = Math.max(e.slowT || 0, 0.3); }); if (p.t > p.life) pools.splice(i, 1); }
  for (i = rings.length - 1; i >= 0; i--) { var g = rings[i]; g.t += dt; g.r = g.R * Math.min(1, g.t / g.life);
    near(g.x, g.y, g.r + 20, function (e) { if (g.hit[e.id]) return; var d = Math.hypot(e.x - g.x, e.y - 10 - g.y); if (d < g.r + e.r) { g.hit[e.id] = 1; hurtFoe(e, g.dmg, g.w, (e.x - g.x) / (d || 1) * g.kb, (e.y - g.y) / (d || 1) * g.kb); if (g.stun && !e.boss) e.stunT = g.stun; } });
    if (g.t > g.life + 0.15) rings.splice(i, 1); }
  for (i = marks.length - 1; i >= 0; i--) { var m = marks[i]; m.t += dt; if (m.t >= m.at) { circleHit(m.x, m.y + 10, m.r, m.dmg, m.w, 0, 90); fx.push({ k: 'splat', x: m.x, y: m.y, t: 0, life: 0.5, sc: 2 }); sfx.play('splat'); marks.splice(i, 1); } }
  for (i = LATER.length - 1; i >= 0; i--) { LATER[i].t -= dt; if (LATER[i].t <= 0) { var f = LATER[i].fn; LATER.splice(i, 1); f(); } }
}
