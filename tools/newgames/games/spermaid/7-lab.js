/* ---------- Shithead Laboozie drops by (his ask: he appears in every game; here Spermaid is the only one you play,
   so he is a visitor). Now and then he walks in from the edge of the screen, lobs three Flaming Bags of Shit at the
   thickest bunch of foes (a hit covers them, the ground burns for 8 seconds) and wanders off again. ---------- */
var LABV = null;
function labVisit() {
  var s = Math.random() < 0.5 ? -1 : 1; LABV = { x: P.x + s * (KIT.W / 2 + 30), y: P.y + rnd(-40, 40), face: -s, st: 'in', t: 0, n: 0, lab: 1 };
  banner = { a: 'SHITHEAD LABOOZIE', b: 'DROPS BY WITH A FLAMING BAG OF SHIT', t: 2.6 }; sfx.play('pop');
}
var LABBAGS = [];
(function () {
  var sd = stepDirector; stepDirector = function (dt) { sd(dt); if (!run) return;
    if (run.labT === undefined) run.labT = 100 + Math.random() * 40; run.labT -= dt; if (run.labT <= 0 && !LABV) { run.labT = 170 + Math.random() * 60; labVisit(); }
    var L = LABV; if (L) { L.t += dt;
      if (L.st === 'in') { var dx = P.x - L.x, dy = P.y - L.y, d = Math.hypot(dx, dy) || 1; L.face = dx > 0 ? 1 : -1; if (d > 80) { L.x += dx / d * 110 * dt; L.y += dy / d * 110 * dt; } else { L.st = 'throw'; L.t = 0; } if (L.t > 6) { L.st = 'throw'; L.t = 0; } }
      else if (L.st === 'throw') { if (L.t > 0.45 * (L.n + 1) && L.n < 3) { L.n++; var live = foes.filter(function (e) { return !e.dead && !e.under && Math.abs(e.x - L.x) < 260 && Math.abs(e.y - L.y) < 200; }), tg = live.length ? live[Math.floor(Math.random() * live.length)] : { x: L.x + L.face * 120, y: L.y };
          LABBAGS.push({ x: L.x, y: L.y - 24, x0: L.x, y0: L.y - 24, x1: tg.x, y1: tg.y, t: 0, T: 0.7 }); sfx.play('pop'); L.face = tg.x > L.x ? 1 : -1; }
        if (L.n >= 3 && L.t > 2) { L.st = 'out'; L.t = 0; } }
      else { L.x += L.face * -1 * 0 + (L.out || (L.out = (L.x < P.x ? -1 : 1))) * 130 * dt; L.face = L.out; if (Math.abs(L.x - P.x) > KIT.W) LABV = null; } }
    for (var i = LABBAGS.length - 1; i >= 0; i--) { var b = LABBAGS[i]; b.t += dt; var k = Math.min(1, b.t / b.T); b.x = b.x0 + (b.x1 - b.x0) * k; b.y = b.y0 + (b.y1 - b.y0) * k - Math.sin(k * Math.PI) * 60;
      if (k >= 1) { LABBAGS.splice(i, 1); circleHit(b.x1, b.y1, 30, 14, 'laboozie', 0, 0); pools.push({ x: b.x1, y: b.y1 - 10, r: 28, dmg: 5, life: 8, t: 0, tick: 0, fire: 1 }); sfx.play('splat'); } }
  };
  var dw = drawWeaponsTop; drawWeaponsTop = function (cx, cy) { dw(cx, cy);
    LABBAGS.forEach(function (b) { spr('lab_bag' + (Math.floor(KIT.t * 10) % 4), b.x - cx, b.y - cy, { anchor: 'c', sc: 0.8 }); });
    var L = LABV; if (!L) return; shadow(L.x - cx, L.y - cy + 1, 10, 3);
    var f = L.st === 'throw' && L.t % 0.45 < 0.25 ? 'lab_toss' + Math.min(2, Math.floor((L.t % 0.45) / 0.08)) : L.st === 'throw' ? 'lab_pidle' + (Math.floor(KIT.t * 4) % 4) : 'lab_pwalk' + (Math.floor(KIT.t * 10) % 8);
    spr(f, L.x - cx, L.y - cy + 2, { flip: L.face < 0, sc: 0.75 }); };
})();
(function () { var nr = newRun; newRun = function () { LABV = null; LABBAGS = []; return nr.apply(this, arguments); }; })();
