/* ---------- update 178 (his ask: all the minigames were the exact same stop-the-needle bar; add some variety).
   Each stall game plays differently now:
   - Hook a duck: ducks bob round a moat, the hook swings over them; drop it (A) onto a duck. The number on its bottom
     is your score. Three goes.
   - Coconut shy: your aim wanders in loops; throw (A) when it is over a coconut. Three balls, three coconuts.
   - Shooting gallery: tin ducks pop up all over a six-slot board for twenty seconds; aim with the stick (or tap the
     duck on a touch screen) and shoot (A) before they drop.
   - High striker: hammer A as fast as you can for three seconds to build the swing, then see how high the puck goes.
     Ring the bell. Three swings.
   - Ring toss: the throw power climbs and falls; each bottle is a different distance (the green band); let go (A) in
     the band. Four rings.
   - Dance-off: buttons (A B X Y) slide along the lane to the beat; press the right one as it crosses the line.
   The pay works as before (actFinish). ---------- */
function mgOK() { return KIT.pressed('a') || KIT.pressed('x') || gpPressed(0) || (KIT.ptr && KIT.ptr.tap); }
(function () { var stP = startTiming; startTiming = function (name, pay, rounds) {
    var k = { 'Hook a duck': 'duck', 'Coconut shy': 'shy', 'Shooting gallery': 'gallery', 'High striker': 'striker', 'Ring toss': 'rings', 'Dance-off': 'dance' }[name]; if (!k) return stP.apply(this, arguments);
    var A = ACT = { k: 'mg_' + k, name: name, pay: pay, t: 0, cool: 0.5, score: 0, r: 0 }; G.talk = 1;
    if (k === 'duck') { A.n = 3; A.hx = 0.5; A.hd = 1; A.drop = 0; A.ducks = []; for (var i = 0; i < 7; i++) A.ducks.push({ x: i / 7, n: 1 + Math.floor(Math.random() * 5), bob: Math.random() * 6 }); toast('Hook a duck: drop the hook (A) when it is over a duck. The number underneath is what you score.'); }
    if (k === 'shy') { A.n = 3; A.nuts = [{ x: 0.25, up: 1 }, { x: 0.5, up: 1 }, { x: 0.75, up: 1 }]; A.fly = 0; toast('Coconut shy: throw (A) when your aim is over a coconut.'); }
    if (k === 'gallery') { A.left = 20; A.slots = []; for (var s = 0; s < 6; s++) A.slots.push({ up: 0, t: 0 }); A.ax = 0.5; A.ay = 0.5; A.max = 0; A.spawn = 0.4; toast('Shooting gallery: shoot the tin ducks (A) before they drop. Aim with the stick, or tap them.'); }
    if (k === 'striker') { A.n = 3; A.pow = 0; A.ph = 'mash'; A.left = 3; A.puck = 0; A.best = 0; toast('High striker: hammer A as fast as you can, then watch the puck.'); }
    if (k === 'rings') { A.n = 4; A.pow = 0; A.dir = 1; A.band = 0.35 + Math.random() * 0.5; A.fly = 0; toast('Ring toss: let go (A) when the power is in the green band.'); }
    if (k === 'dance') { A.notes = []; A.n = (rounds || 6) * 2; A.made = 0; A.next = 0.8; A.bpm = 112; A.hit = 0; toast('Dance-off: press the button as it crosses the line.'); }
  };
  var sa = stepAct; stepAct = function (dt) { var A = ACT; if (!A || A.k.indexOf('mg_') !== 0) return sa(dt); if (P.state === 'dead') { ACT = null; G.talk = 0; return; } A.t += dt; A.cool -= dt; var go = A.cool <= 0 && mgOK(), st = KIT.stick(0) || { x: 0, y: 0 };
    if (A.k === 'mg_duck') { A.ducks.forEach(function (d) { d.x = (d.x + dt * 0.09) % 1; d.bob += dt * 3; });
      if (A.drop > 0) { A.drop -= dt; if (A.drop <= 0) { var best = null; A.ducks.forEach(function (d) { var dx = Math.abs(d.x - A.hx); if (dx < 0.045 && (!best || dx < Math.abs(best.x - A.hx))) best = d; }); if (best) { A.score += best.n; A.got = best.n; sfx.play('coin'); best.x = (best.x + 0.5) % 1; best.n = 1 + Math.floor(Math.random() * 5); } else { A.got = 0; sfx.play('back'); } A.r++; A.cool = 0.6; if (A.r >= A.n) actFinish(A.score, 12, A.pay); } return; }
      A.hx += A.hd * dt * (0.45 + A.r * 0.15); if (A.hx > 0.95) { A.hx = 0.95; A.hd = -1; } if (A.hx < 0.05) { A.hx = 0.05; A.hd = 1; } if (go) { A.drop = 0.45; sfx.play('swing'); } return; }
    if (A.k === 'mg_shy') { var sp = 1 + A.r * 0.35; A.ax = 0.5 + Math.sin(A.t * 1.3 * sp) * 0.38; A.ay = 0.45 + Math.sin(A.t * 2.1 * sp + 1) * 0.3;
      if (A.fly > 0) { A.fly -= dt; if (A.fly <= 0) { var hitN = null; A.nuts.forEach(function (c) { if (c.up && Math.abs(c.x - A.tx) < 0.07 && Math.abs(0.4 - A.ty) < 0.12) hitN = c; }); if (hitN) { hitN.up = 0; A.score++; sfx.play('hit'); } else sfx.play('back'); A.r++; A.cool = 0.5; if (A.r >= A.n) actFinish(A.score, A.n, A.pay); } return; }
      if (go) { A.tx = A.ax; A.ty = A.ay; A.fly = 0.35; sfx.play('swing'); } return; }
    if (A.k === 'mg_gallery') { A.left -= dt; A.spawn -= dt; A.ax = clamp(A.ax + st.x * dt * 1.4, 0, 1); A.ay = clamp(A.ay + st.y * dt * 1.4, 0, 1);
      if (A.spawn <= 0) { A.spawn = 0.55 + Math.random() * 0.5; var free = A.slots.filter(function (s) { return !s.up; }); if (free.length) { var s0 = pick(free); s0.up = 1; s0.t = 0.9 + Math.random() * 0.4; A.max++; } }
      A.slots.forEach(function (s) { if (s.up) { s.t -= dt; if (s.t <= 0) s.up = 0; } });
      var tap = KIT.ptr && KIT.ptr.tap; if (A.cool <= 0 && (KIT.pressed('a') || KIT.pressed('x') || gpPressed(0) || tap)) { A.cool = 0.18; sfx.play('shoot'); var G0 = mgGalleryBox(), hitS = -1;
        A.slots.forEach(function (s, i) { var c = mgSlotXY(G0, i), px = tap ? KIT.ptr.x : G0.x + A.ax * G0.w, py = tap ? KIT.ptr.y : G0.y + A.ay * G0.h; if (s.up && Math.abs(px - c[0]) < 18 && Math.abs(py - c[1]) < 16) hitS = i; });
        if (hitS >= 0) { A.slots[hitS].up = 0; A.score++; sfx.play('hit'); } }
      if (A.left <= 0) actFinish(A.score, Math.max(1, A.max), A.pay); return; }
    if (A.k === 'mg_striker') { if (A.ph === 'mash') { A.left -= dt; A.pow = Math.max(0, A.pow - dt * 0.35); if (mgOK()) A.pow = Math.min(1.08, A.pow + 0.075); if (A.left <= 0) { A.ph = 'fly'; A.puck = 0; A.top = Math.min(1, A.pow); sfx.play('hit'); } return; }
      if (A.ph === 'fly') { A.puck += dt * 2.2; if (A.puck >= A.top) { A.puck = A.top; A.ph = 'show'; A.showT = 1.2; if (A.top >= 0.97) { A.score++; sfx.play('bell'); toast('DING!'); } else sfx.play('back'); } return; }
      A.showT -= dt; if (A.showT <= 0) { A.r++; if (A.r >= A.n) { actFinish(A.score, A.n, A.pay); return; } A.ph = 'mash'; A.left = 3; A.pow = 0; } return; }
    if (A.k === 'mg_rings') { if (A.fly > 0) { A.fly -= dt; if (A.fly <= 0) { var ok = Math.abs(A.rel - A.band) < 0.07; if (ok) { A.score++; sfx.play('coin'); } else sfx.play('back'); A.r++; A.band = 0.3 + Math.random() * 0.55; A.cool = 0.6; if (A.r >= A.n) actFinish(A.score, A.n, A.pay); } return; }
      A.pow += A.dir * dt * (0.9 + A.r * 0.25); if (A.pow > 1) { A.pow = 1; A.dir = -1; } if (A.pow < 0) { A.pow = 0; A.dir = 1; } if (go) { A.rel = A.pow; A.fly = 0.6; sfx.play('swing'); } return; }
    if (A.k === 'mg_dance') { var beat = 60 / A.bpm; A.next -= dt; if (A.made < A.n && A.next <= 0) { A.next = beat * (Math.random() < 0.3 ? 2 : 1); A.notes.push({ b: pick(['a', 'b', 'x', 'y']), x: 1.05 }); A.made++; }
      A.notes.forEach(function (n) { n.x -= dt * 0.42; }); var tapD = KIT.ptr && KIT.ptr.tap, pressed = ['a', 'b', 'x', 'y'].filter(function (b) { return KIT.pressed(b); });
      if (pressed.length || tapD) { var tgt = A.notes.filter(function (n) { return !n.done && Math.abs(n.x - 0.18) < 0.07; })[0]; if (tgt && (tapD || pressed.indexOf(tgt.b) >= 0)) { tgt.done = 1; A.score++; A.flash = 0.2; sfx.play('blip'); } else sfx.play('back'); }
      A.notes = A.notes.filter(function (n) { if (!n.done && n.x < 0.08) { n.done = 2; } return n.x > -0.1; }); A.flash = Math.max(0, (A.flash || 0) - dt);
      if (A.made >= A.n && !A.notes.length) actFinish(A.score, A.n, A.pay); return; } };
})();
function mgGalleryBox() { var W = KIT.W, H = KIT.H, w = Math.min(300, W * 0.7), h = 110; return { x: (W - w) / 2, y: H * 0.36, w: w, h: h }; }
function mgSlotXY(G0, i) { return [G0.x + G0.w * (0.2 + (i % 3) * 0.3), G0.y + G0.h * (0.3 + Math.floor(i / 3) * 0.45)]; }
(function () { var dh = drawActHud; drawActHud = function (ctx) { var A = ACT; if (!A || A.k.indexOf('mg_') !== 0) return dh(ctx); var W = KIT.W, H = KIT.H, tx = KIT.text;
  function title(s) { tx(s, W / 2 - tw2(s, 8) / 2, H * 0.3 - 16, { col: '#ffe36a', size: 8 }); }
  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  var bw = Math.min(300, W * 0.7), bx = (W - bw) / 2, by = H * 0.32, bh = 120; KIT.panel(bx - 8, by - 26, bw + 16, bh + 36);
  if (A.k === 'mg_duck') { title('HOOK A DUCK  ' + A.score + ' PTS  ' + A.r + '/' + A.n); rect(bx, by + 70, bw, 30, '#1e4a6a'); rect(bx, by + 68, bw, 3, '#4adfff');
    A.ducks.forEach(function (d) { var x = bx + d.x * bw, y = by + 62 + Math.sin(d.bob) * 2; rect(x - 9, y, 18, 10, '#ffe36a'); rect(x + 3, y - 7, 8, 8, '#ffe36a'); rect(x + 9, y - 4, 4, 3, '#ff7a00'); rect(x + 6, y - 5, 2, 2, '#12040a'); });
    var hx = bx + A.hx * bw, hy = by + 6 + (A.drop > 0 ? (1 - A.drop / 0.45) * 55 : 0); rect(hx - 0.5, by, 1.5, hy - by, '#f1e7d0'); rect(hx - 4, hy, 8, 2, '#f1e7d0'); rect(hx + 3, hy - 4, 2, 6, '#f1e7d0');
    if (A.got !== undefined && A.cool > 0) { var s1 = A.got ? '+' + A.got : 'MISSED'; tx(s1, W / 2 - tw2(s1, 10) / 2, by + 30, { col: A.got ? '#7aff6a' : '#ff2630', size: 10 }); } return; }
  if (A.k === 'mg_shy') { title('COCONUT SHY  ' + A.score + '/' + A.r); rect(bx, by + 90, bw, 30, '#5a3a20');
    A.nuts.forEach(function (c) { var x = bx + c.x * bw; rect(x - 2, by + 52, 4, 40, '#c8a870'); if (c.up) { ctx.fillStyle = '#6a4424'; ctx.beginPath(); ctx.arc(x, by + 46, 8, 0, 6.283); ctx.fill(); } });
    var ax = bx + A.ax * bw, ay = by + A.ay * 100; ctx.strokeStyle = '#ff2630'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ax, ay, 8, 0, 6.283); ctx.moveTo(ax - 12, ay); ctx.lineTo(ax + 12, ay); ctx.moveTo(ax, ay - 12); ctx.lineTo(ax, ay + 12); ctx.stroke();
    if (A.fly > 0) { var f = 1 - A.fly / 0.35, x0 = W / 2, y0 = by + bh, x1 = bx + A.tx * bw, y1 = by + A.ty * 100; ctx.fillStyle = '#f1e7d0'; ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f - Math.sin(f * 3.14) * 20, 3, 0, 6.283); ctx.fill(); } return; }
  if (A.k === 'mg_gallery') { var G0 = mgGalleryBox(); title('SHOOTING GALLERY  ' + A.score + '  ' + Math.ceil(A.left) + 's'); rect(G0.x, G0.y, G0.w, G0.h, '#2a1a1e');
    A.slots.forEach(function (s, i) { var c = mgSlotXY(G0, i); rect(c[0] - 18, c[1] + 10, 36, 4, '#5a3a20'); if (s.up) { rect(c[0] - 12, c[1] - 6, 24, 14, '#c8c8d0'); rect(c[0] + 4, c[1] - 14, 10, 10, '#c8c8d0'); rect(c[0] + 12, c[1] - 10, 5, 3, '#ff7a00'); ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.arc(c[0] - 2, c[1] + 1, 4, 0, 6.283); ctx.fill(); } });
    var ax2 = G0.x + A.ax * G0.w, ay2 = G0.y + A.ay * G0.h; ctx.strokeStyle = '#ffe36a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ax2, ay2, 7, 0, 6.283); ctx.moveTo(ax2 - 11, ay2); ctx.lineTo(ax2 + 11, ay2); ctx.moveTo(ax2, ay2 - 11); ctx.lineTo(ax2, ay2 + 11); ctx.stroke(); return; }
  if (A.k === 'mg_striker') { title('HIGH STRIKER  ' + A.score + ' BELLS  ' + Math.min(A.r + 1, A.n) + '/' + A.n); var cx = W / 2, tH = bh - 10; rect(cx - 4, by, 8, tH, '#5a3a20'); for (var m = 0; m < 10; m++) rect(cx - 10, by + tH - m * tH / 10 - 1, 20, 1, m >= 9 ? '#ffe36a' : '#8a6a4a');
    ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(cx, by - 4, 7, 0, 6.283); ctx.fill(); var ph = A.ph === 'mash' ? 0 : A.puck; rect(cx - 7, by + tH - ph * tH - 5, 14, 6, '#c4121c');
    rect(bx + 10, by + bh - 14, (bw - 20) * Math.min(1, A.pow), 8, A.pow > 0.97 ? '#7aff6a' : '#ff2630'); ctx.strokeStyle = '#f1e7d0'; ctx.strokeRect(bx + 10, by + bh - 14, bw - 20, 8);
    if (A.ph === 'mash') { var s2 = 'HAMMER A!  ' + Math.ceil(A.left); tx(s2, cx + 20, by + 40, { col: '#f1e7d0', size: 9 }); } return; }
  if (A.k === 'mg_rings') { title('RING TOSS  ' + A.score + '/' + A.r); var px = bx + 20, pw = 14, ph2 = bh - 10; rect(px, by, pw, ph2, '#2a1a1e'); rect(px, by + ph2 - (A.band + 0.07) * ph2, pw, 0.14 * ph2, '#3a8a2a'); rect(px - 2, by + ph2 - A.pow * ph2 - 1, pw + 4, 3, '#ffe36a');
    var bxp = bx + 60 + A.band * (bw - 90); rect(bxp - 3, by + 40, 6, 50, '#2a6a3a'); rect(bxp - 1.5, by + 30, 3, 12, '#2a6a3a'); rect(bx + 50, by + 90, bw - 60, 4, '#5a3a20');
    if (A.fly > 0) { var f2 = 1 - A.fly / 0.6, lx = bx + 50 + f2 * (bx + 60 + A.rel * (bw - 90) - bx - 50), ly = by + 70 - Math.sin(f2 * 3.14) * 40; ctx.strokeStyle = '#ff7ab0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(lx, ly, 8, 3, 0, 0, 6.283); ctx.stroke(); } return; }
  if (A.k === 'mg_dance') { title('DANCE-OFF  ' + A.score + '/' + A.n); var ly2 = by + 50; rect(bx, ly2 - 14, bw, 28, '#2a1a1e'); rect(bx + 0.18 * bw - 1, ly2 - 16, 3, 32, A.flash > 0 ? '#7aff6a' : '#ffe36a');
    var COL = { a: '#7aff6a', b: '#ff2630', x: '#4adfff', y: '#ffe36a' }; A.notes.forEach(function (n) { if (n.done === 1) return; var x = bx + n.x * bw; ctx.fillStyle = n.done === 2 ? '#5a5a5a' : COL[n.b]; ctx.beginPath(); ctx.arc(x, ly2, 10, 0, 6.283); ctx.fill(); tx(n.b.toUpperCase(), x - tw2(n.b.toUpperCase(), 9) / 2, ly2 - 5, { col: '#12040a', size: 9 }); }); return; }
}; })();
