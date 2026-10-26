/* ---------- more micro games: every cabinet gets its own set ---------- */
function heroSpr(m, p) { if (m.skin === 'spermaid') return 'spermaid_s' + (Math.floor(m.t * 6) % 3); return cumFrame(m, p); }
MICRO.push(
  { id: 'loot', word: 'FIND THE GOLD!', dur: 8, ctl: 'lr', // a shell game with treasure chests
    init: function (m, lv) { m.slot = [0, 1, 2]; m.coin = rndi(0, 2); m.swaps = 3 + lv * 2; m.ph = 'show'; m.pt = 0; m.sel = 1; m.sw = null; m.speed = 0.42 - lv * 0.08; },
    update: function (m, dt) { m.pt += dt;
      if (m.ph === 'show' && m.pt > 1) { m.ph = 'swap'; m.pt = 0; }
      else if (m.ph === 'swap') { if (!m.sw) { var a = rndi(0, 2), b = (a + rndi(1, 2)) % 3; m.sw = { a: a, b: b, k: 0 }; sfx.play('tick'); } m.sw.k += dt / m.speed; if (m.sw.k >= 1) { var ia = m.slot.indexOf(m.sw.a), ib = m.slot.indexOf(m.sw.b); m.slot[ia] = m.sw.b; m.slot[ib] = m.sw.a; m.sw = null; if (--m.swaps <= 0) { m.ph = 'pick'; } } }
      else if (m.ph === 'pick') { if (KIT.pressed('left')) { m.sel = Math.max(0, m.sel - 1); sfx.play('tick'); } if (KIT.pressed('right')) { m.sel = Math.min(2, m.sel + 1); sfx.play('tick'); } if (KIT.pressed('a')) { m.ph = 'open'; m.pt = 0; if (m.slot[m.sel] === m.coin) { m.win = 1; sfx.play('coin'); } else m.lose = 1; } } },
    draw: function (m) { R('#0c0406', 0, 0, W, H); R('#22101a', 0, 170, W, 100); for (var x = 0; x < W; x += 28) R('#2a1418', x, 170, 14, 100);
      var X = [140, 240, 340];
      for (var s2 = 0; s2 < 3; s2++) { var id = m.slot[s2], x = X[s2], y = 196;
        if (m.sw && (id === m.sw.a || id === m.sw.b)) { var other = id === m.sw.a ? m.sw.b : m.sw.a, tx = X[m.slot.indexOf(other)], k = m.sw.k; x = lerp(X[s2], tx, k); y -= Math.sin(k * Math.PI) * (id === m.sw.a ? 30 : -14); }
        var open = m.ph === 'show' || m.ph === 'open'; spr(open && (m.ph === 'show' || s2 === m.sel || id === m.coin) ? 'p_chestopen' : 'p_chest', x, y, { sc: 2 });
        if (open && id === m.coin) spr('ao_coin', x, y - 40 - (m.ph === 'open' ? Math.min(20, m.pt * 60) : 0), { anchor: 'c', sc: 1.6 }); }
      if (m.ph === 'pick') { var ax = X[m.sel]; R('#ffe36a', ax - 6, 120 + Math.sin(m.t * 10) * 3, 12, 6); R('#ffe36a', ax - 2, 126 + Math.sin(m.t * 10) * 3, 4, 6); }
      spr('cumface', 60, 250, { sc: 1.2 }); } },
  { id: 'slay', word: 'SLAY!', dur: 6, ctl: 'lr', // swing left or right at what comes in
    init: function (m, lv) { m.need = 4 + lv; m.f = []; m.next = 0.25; m.kills = 0; m.sw = 0; m.face = 1; m.sp = 80 + lv * 30; m.p = { x: W / 2, y: GROUND, vx: 0, ground: true }; },
    update: function (m, dt) { m.next -= dt; if (m.next <= 0 && m.f.length < 3) { m.next = 0.75 - m.lv * 0.12; var side = Math.random() < 0.5 ? -1 : 1; m.f.push({ x: W / 2 + side * 260, side: side, k: m.skin === 'spermaid' ? 'f_bat_' : pick(['f_ghoul_', 'f_slime_', 'f_imp_']) }); }
      ['left', 'right'].forEach(function (d) { if (KIT.pressed(d)) { m.face = d === 'left' ? -1 : 1; m.sw = 0.16; sfx.play('shoot'); var best = null; m.f.forEach(function (f) { if (!f.dead && f.side === m.face && Math.abs(f.x - W / 2) < 80 && (!best || Math.abs(f.x - W / 2) < Math.abs(best.x - W / 2))) best = f; }); if (best) { best.dead = 1; m.kills++; sfx.play('hit'); KIT.shake(3); if (m.kills >= m.need) m.win = 1; } } });
      if (m.sw > 0) m.sw -= dt;
      m.f.forEach(function (f) { if (f.dead) return; f.x -= f.side * m.sp * dt; if (Math.abs(f.x - W / 2) < 16 && !m.win) { m.lose = 1; m.p.dead = 1; } }); m.f = m.f.filter(function (f) { return !f.dead; }); },
    draw: function (m) { if (m.skin === 'spermaid') { R('#0a1424', 0, 0, W, H); R('#0e2034', 0, GROUND, W, H - GROUND); } else floorBg('#140810', '#2e1218');
      m.f.forEach(function (f) { spr(f.k + (Math.floor(m.t * 8) % 4), f.x, GROUND, { flip: f.side > 0 }); });
      var hs = m.skin === 'spermaid' ? 'spermaid_s' + (m.sw > 0 ? 2 : Math.floor(m.t * 6) % 2) : m.sw > 0 ? 'ch_attack' : 'ch_idle' + (Math.floor(m.t * 8) % 7);
      spr(hs, W / 2, GROUND, { flip: m.face < 0 }); if (m.sw > 0) { R('rgba(255,255,255,0.7)', W / 2 + (m.face > 0 ? 10 : -70), GROUND - 40, 60, 3); R('rgba(255,227,106,0.6)', W / 2 + (m.face > 0 ? 14 : -66), GROUND - 34, 52, 2); }
      text(m.kills + '/' + m.need, W / 2, 40, { align: 'center', size: 16, col: '#ffe36a' }); } },
  { id: 'leap', word: 'JUMP!', dur: 5, ctl: 'a', survive: 1, // he runs by himself, you jump the gaps (or the mines)
    init: function (m, lv) { m.p = { x: 120, y: GROUND, vy: 0, ground: true }; m.sc = 0; m.sp = 170 + lv * 45; m.obs = []; for (var i = 0; i < 6; i++) m.obs.push(360 + i * (190 + Math.random() * 90)); },
    update: function (m, dt) { var p = m.p; m.sc += m.sp * dt; if (KIT.pressed('a') && p.ground) { p.vy = -380; p.ground = false; sfx.play('jump'); }
      var wx = m.sc + p.x, over = m.obs.some(function (o) { return wx > o + 6 && wx < o + (m.skin === 'mines' ? 14 : 52); });
      if (m.skin === 'mines') { if (over && p.y > GROUND - 10 && !p.dead) { p.dead = 1; m.lose = 1; sfx.play('boom'); KIT.shake(8); } p.vy += 900 * dt; p.y += p.vy * dt; if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.ground = true; } }
      else { p.vy += 900 * dt; p.y += p.vy * dt; if (p.y >= GROUND && !over) { p.y = GROUND; p.vy = 0; p.ground = true; } else if (p.y > GROUND) { p.ground = false; if (p.y > H + 20 && !m.lose) { m.lose = 1; sfx.play('splat'); } } } },
    draw: function (m) { var mines = m.skin === 'mines'; R(mines ? '#100808' : '#140a1a', 0, 0, W, H); for (var i = 0; i < 12; i++) { var bx = (i * 60 - m.sc * 0.3) % 720; if (bx < -60) bx += 720; R(mines ? '#1e1410' : '#1e1430', bx, 90 + (i % 3) * 20, 40, GROUND - 90); }
      var segs = []; R(mines ? '#2a1c16' : '#2a1418', 0, GROUND, W, H - GROUND);
      m.obs.forEach(function (o) { var x = o - m.sc; if (x < -60 || x > W + 60) return; if (mines) spr('ao_mine', x + 10, GROUND + 2); else { R('#000', x, GROUND, 52, H - GROUND); R('#12040a', x - 2, GROUND, 2, H - GROUND); R('#12040a', x + 52, GROUND, 2, H - GROUND); } });
      R('#12040a', 0, GROUND, W, 2);
      var p = m.p; spr(!p.ground ? 'ch_jump1' : 'ch_run' + (Math.floor(m.t * 14) % 7), p.x, p.y); } },
  { id: 'outrun', word: 'MASH < >!', dur: 5, ctl: 'lr', // alternate left and right to run from the meatnado
    init: function (m, lv) { m.d = 0.35; m.last = null; m.pull = 0.16 + lv * 0.06; },
    update: function (m, dt) { var k = KIT.pressed('left') ? 'l' : KIT.pressed('right') ? 'r' : null; if (k && k !== m.last) { m.d += 0.055; m.last = k; sfx.play('step'); } else if (k) { sfx.play('no'); }
      m.d -= m.pull * dt; if (m.d >= 1 && !m.lose) m.win = 1; if (m.d <= 0 && !m.win) { m.lose = 1; sfx.play('splat'); } },
    draw: function (m) { floorBg('#2a0408', '#4a1010'); var tx = 20 + (1 - Math.max(0, m.d)) * 0; for (var i = 0; i < 10; i++) { var y = i * 21, w = 30 + i * 12; R('rgba(196,18,28,' + (0.35 - i * 0.02) + ')', 60 - w / 2 + Math.sin(m.t * 9 + i) * 12, y, w, 14); }
      for (var j = 0; j < 6; j++) spr(j % 2 ? 'ao_meat1' : 'ao_meat0', 60 + Math.cos(m.t * 6 + j) * 30, 40 + j * 28, { anchor: 'c', rot: m.t * 5 + j });
      var x = 120 + m.d * 300; spr('ch_run' + (Math.floor(m.t * (8 + m.d * 10)) % 7), x, GROUND); R('#12040a', 60, 30, 360, 10); R('#ffe36a', 62, 32, 356 * clamp(m.d, 0, 1), 6); text('EXIT', 430, 26, { size: 6, col: '#ffe36a' }); } },
  { id: 'pearls', word: 'COLLECT!', dur: 6, ctl: 'dpad', // swim round and pick up the pearls
    init: function (m, lv) { m.p = { x: W / 2, y: H / 2 }; m.gems = []; for (var i = 0; i < 5 + lv; i++) m.gems.push({ x: rnd(40, W - 40), y: rnd(70, H - 30) }); m.b = []; for (var j = 0; j < 1 + lv; j++) m.b.push({ x: rnd(0, W), y: rnd(60, H), a: Math.random() * 6 }); },
    update: function (m, dt) { var s2 = KIT.stick(0), p = m.p; p.x = clamp(p.x + s2.x * 170 * dt, 16, W - 16); p.y = clamp(p.y + s2.y * 170 * dt, 50, H - 10); if (s2.x) p.face = s2.x;
      m.gems.forEach(function (g) { if (!g.got && Math.hypot(g.x - p.x, g.y - (p.y - 16)) < 20) { g.got = 1; sfx.play('coin'); } }); if (m.gems.every(function (g) { return g.got; })) m.win = 1;
      m.b.forEach(function (b) { b.a += dt; b.x += Math.cos(b.a) * 60 * dt + (p.x - b.x) * 0.25 * dt; b.y += Math.sin(b.a * 1.3) * 50 * dt + (p.y - 16 - b.y) * 0.25 * dt; if (Math.hypot(b.x - p.x, b.y - p.y + 16) < 14 && !m.win) { m.lose = 1; sfx.play('hurt'); } }); },
    draw: function (m) { R('#06142a', 0, 0, W, H); for (var i = 0; i < 30; i++) R('rgba(122,240,255,0.1)', (i * 53 + m.t * 10) % W, (i * 37 - m.t * 30 + 400) % H, 2, 2);
      m.gems.forEach(function (g) { if (!g.got) { R('#12040a', g.x - 5, g.y - 5, 10, 10); R('#fffbe8', g.x - 4, g.y - 4, 8, 8); R('#9adfff', g.x - 4, g.y - 4, 3, 3); } });
      m.b.forEach(function (b) { spr('f_bat_' + (Math.floor(m.t * 10) % 4), b.x, b.y, { anchor: 'c' }); }); spr('spermaid_s' + (Math.floor(m.t * 6) % 3), m.p.x, m.p.y, { flip: (m.p.face || 1) < 0 }); } },
  { id: 'chop', word: 'CHOP!', dur: 5, ctl: 'a', // press A as each chilli passes under Amy's knife
    init: function (m, lv) { m.c = []; for (var i = 0; i < 3 + lv; i++) m.c.push({ x: -40 - i * (110 - lv * 15) }); m.sp = 150 + lv * 40; m.k = 0; },
    update: function (m, dt) { m.c.forEach(function (c) { if (!c.cut) c.x += m.sp * dt; else c.x += m.sp * 0.4 * dt; if (!c.cut && c.x > W / 2 + 30 && !m.lose) { m.lose = 1; sfx.play('no'); } }); if (m.k > 0) m.k -= dt;
      if (KIT.pressed('a')) { m.k = 0.12; var hit = m.c.filter(function (c) { return !c.cut && Math.abs(c.x - W / 2) < 22; })[0]; if (hit) { hit.cut = 1; sfx.play('hit'); } else { sfx.play('tick'); } } if (m.c.every(function (c) { return c.cut; })) m.win = 1; },
    draw: function (m) { R('#2a0a0e', 0, 0, W, H); R('#6e3a1e', 0, 150, W, 50); R('#a8643a', 0, 150, W, 5); for (var x = 0; x < W; x += 40) R('#5a2e18', x, 160, 2, 40);
      m.c.forEach(function (c) { if (c.cut) { spr('ao_chilli', c.x - 8, 168, { sc: 1.2, rot: -0.3 }); spr('ao_chilli', c.x + 10, 170, { sc: 1.2, rot: 0.4 }); } else spr('ao_chilli', c.x, 168, { sc: 1.5 }); });
      var ky = m.k > 0 ? 160 : 110; R('#12040a', W / 2 - 3, ky - 50, 6, 30); R('#9a929a', W / 2 - 14, ky - 22, 28, 22); R('#e8e0e8', W / 2 - 14, ky - 4, 28, 3); spr('npc_amy', W / 2 + 60, 140, { sc: 1.4 }); R('rgba(255,227,106,0.25)', W / 2 - 22, 150, 44, 4); } },
  { id: 'tips', word: 'CATCH THE TIPS!', dur: 6, ctl: 'lr',
    init: function (m, lv) { m.p = { x: W / 2 }; m.c = []; m.next = 0.2; m.got = 0; m.need = 5 + lv; },
    update: function (m, dt) { var s2 = KIT.stick(0); m.p.x = clamp(m.p.x + s2.x * 260 * dt, 30, W - 30); m.next -= dt; if (m.next <= 0) { m.next = 0.5 - m.lv * 0.08; m.c.push({ x: rnd(30, W - 30), y: -10, vy: 120 + m.lv * 40, bad: Math.random() < 0.2 }); }
      m.c.forEach(function (c) { c.vy += 200 * dt; c.y += c.vy * dt; if (!c.done && c.y > 196 && c.y < 214 && Math.abs(c.x - m.p.x) < 30) { c.done = 1; if (c.bad) { m.lose = 1; sfx.play('boom'); KIT.shake(6); } else { m.got++; sfx.play('coin'); if (m.got >= m.need) m.win = 1; } } }); m.c = m.c.filter(function (c) { return !c.done && c.y < H + 20; }); },
    draw: function (m) { R('#3a0a10', 0, 0, W, H); for (var y = 200; y < H; y += 16) for (var x = 0; x < W; x += 16) R(((x + y) / 16) % 2 ? '#1e0a0c' : '#4a0e14', x, y, 16, 16);
      m.c.forEach(function (c) { if (c.bad) spr('ao_chilli', c.x, c.y, { anchor: 'c', rot: m.t * 6 }); else spr('ao_coin', c.x, c.y, { anchor: 'c' }); });
      spr('npc_amy', m.p.x, 236, { sc: 1.3 }); R('#c8c0b0', m.p.x - 26, 198, 52, 4); text(m.got + '/' + m.need + '  (NOT THE DYNAMITE)', W / 2, 30, { align: 'center', size: 8, col: '#ffe36a' }); } },
  { id: 'sneak', word: 'SNEAK!', dur: 7, ctl: 'lr', // move only while the guard looks away
    init: function (m, lv) { m.x = 50; m.gs = 'away'; m.gt = rnd(0.8, 1.6); m.look = 0; m.sp = 90 + lv * 15; },
    update: function (m, dt) { var s2 = KIT.stick(0), mv = s2.x > 0.3; m.gt -= dt;
      if (m.gt <= 0) { if (m.gs === 'away') { m.gs = 'turn'; m.gt = 0.45 - m.lv * 0.08; sfx.play('tick'); } else if (m.gs === 'turn') { m.gs = 'look'; m.gt = rnd(0.9, 1.5); } else { m.gs = 'away'; m.gt = rnd(0.8, 1.7); } }
      if (mv) m.x += m.sp * dt; if (m.gs === 'look' && mv && !m.lose && !m.win) { m.lose = 1; sfx.play('boom'); KIT.flash(0.15); } if (m.x >= 380 && !m.lose) m.win = 1; m.mv = mv; },
    draw: function (m) { R('#0c0806', 0, 0, W, H); for (var i = 0; i < 8; i++) R('#1a1410', i * 64, 0, 30, GROUND); R('#2a1c16', 0, GROUND, W, H - GROUND); R('#12040a', 0, GROUND, W, 2);
      R('#12040a', 400, GROUND - 70, 50, 70); R('#2aa84a', 412, GROUND - 82, 26, 8);
      spr('f_blumguard_' + (m.gs === 'look' ? 3 : 0), 450, GROUND, { flip: m.gs !== 'away', sc: 1.3 }); if (m.gs === 'turn') text('!', 440, GROUND - 80, { size: 16, col: '#ff2630' }); if (m.gs === 'look') { R('rgba(255,38,48,0.12)', 0, GROUND - 60, 440, 60); }
      spr(m.mv ? 'ch_walk' + (Math.floor(m.t * 10) % 9) : 'ch_idle' + (Math.floor(m.t * 7) % 7), m.x, GROUND); text('HOLD > WHILE HIS BACK IS TURNED', W / 2, 30, { align: 'center', size: 6, col: '#a6968f' }); } },
  { id: 'bomb', word: 'BOMB THE ROCK!', dur: 5, ctl: 'dpad+a', // drop a bomb by the rock, then get clear
    init: function (m, lv) { m.p = { x: 120, y: 150 }; m.rock = { x: rnd(260, 380), y: rnd(110, 200) }; m.b = null; m.boom = 0; },
    update: function (m, dt) { var s2 = KIT.stick(0), p = m.p; p.x = clamp(p.x + s2.x * 140 * dt, 40, W - 40); p.y = clamp(p.y + s2.y * 140 * dt, 70, 240); if (s2.x) p.face = s2.x;
      if (KIT.pressed('a') && !m.b) { m.b = { x: p.x, y: p.y, t: 1.1 - m.lv * 0.15 }; sfx.play('tick'); }
      if (m.b) { m.b.t -= dt; if (m.b.t <= 0 && !m.boom) { m.boom = 0.4; sfx.play('boom'); KIT.shake(8); if (Math.hypot(m.b.x - m.rock.x, m.b.y - m.rock.y) < 56) m.win = 1; if (Math.hypot(m.b.x - p.x, m.b.y - p.y) < 50) { m.win = 0; m.lose = 1; } if (!m.win && !m.lose) { m.b = null; m.boom = 0; } } }
      if (m.boom > 0) m.boom -= dt; },
    draw: function (m) { R('#2a1c20', 0, 0, W, H); for (var y = 60; y < H; y += 26) for (var x = 0; x < W; x += 26) if ((x + y) / 26 % 2) R('#33242a', x, y, 26, 26); R('#4e3c40', 0, 40, W, 20);
      if (!m.win) spr('gr_rock0', m.rock.x, m.rock.y + 12, { sc: 1.4 });
      if (m.b) { spr(Math.floor(m.t * 10) % 2 ? 'gr_bombl' : 'gr_bomb', m.b.x, m.b.y + 6); if (m.boom > 0) { KIT.ctx.fillStyle = 'rgba(255,160,40,' + m.boom * 2 + ')'; KIT.ctx.beginPath(); KIT.ctx.arc(m.b.x, m.b.y, 56, 0, 6.28); KIT.ctx.fill(); } }
      spr('chb_' + (Math.abs(m.p.face || 0) ? 's' : 'd') + (Math.floor(m.t * 8) % 4), m.p.x, m.p.y + 6, { flip: (m.p.face || 1) < 0 }); } },
  { id: 'limit', word: 'LIMIT BREAK!', dur: 5, ctl: 'a', // hold A to charge, let go in the gold
    init: function (m, lv) { m.c = 0; m.z0 = rnd(0.55, 0.75); m.zw = 0.16 - lv * 0.03; m.sp = 0.55 + lv * 0.25; m.held = 0; m.done = 0; },
    update: function (m, dt) { if (m.done) { m.done += dt; return; } if (KIT.held('a')) { m.held = 1; m.c += m.sp * dt; if (m.c > 1) { m.lose = 1; m.done = 0.01; sfx.play('no'); } } else if (m.held) { m.done = 0.01; if (m.c >= m.z0 && m.c <= m.z0 + m.zw) { m.win = 1; sfx.play('power'); KIT.flash(0.2); } else { m.lose = 1; sfx.play('no'); } } },
    draw: function (m) { R('#06030e', 0, 0, W, H); R('#120a24', 0, 150, W, 120); spr('f_vampire_' + (Math.floor(m.t * 4) % 4), 120, 170, { sc: 2, flash: m.win && m.done < 0.3 });
      spr(m.win ? 'ch_attack' : 'ch_idle' + (Math.floor(m.t * 8) % 7), 340, 170, { flip: true }); if (m.win) { for (var i = 0; i < 4; i++) R('rgba(255,255,255,0.8)', 60 + i * 30, 90 + i * 20, 120, 3); }
      R('#0a1838', 60, 220, 360, 30); R('#3a6ad8', 62, 222, 356, 26); R('#12040a', 70, 230, 340, 10); R('#ffe36a', 70 + m.z0 * 340, 228, m.zw * 340, 14); R(m.c > m.z0 + m.zw ? '#ff2630' : '#7af0ff', 70, 232, 340 * Math.min(1, m.c), 6);
      text('LIMIT', 70, 212, { size: 8, col: '#f1e7d0' }); if (!m.held) text('HOLD A', W / 2, 60, { align: 'center', size: 16, col: '#ffe36a' }); } },
  { id: 'heal', word: 'HEAL THE WEAK ONE!', dur: 4, ctl: 'lr',
    init: function (m, lv) { m.low = rndi(0, 2); m.hp = [0, 1, 2].map(function (i) { return i === m.low ? rnd(0.08, 0.2) : rnd(0.5 + lv * 0.1, 0.95); }); if (lv > 1) m.hp[(m.low + 1) % 3] = m.hp[m.low] + 0.12; m.sel = 1; },
    update: function (m, dt) { if (m.win || m.lose) return; if (KIT.pressed('left')) { m.sel = Math.max(0, m.sel - 1); sfx.play('tick'); } if (KIT.pressed('right')) { m.sel = Math.min(2, m.sel + 1); sfx.play('tick'); } if (KIT.pressed('a')) { if (m.sel === m.low) { m.win = 1; sfx.play('magic'); m.hp[m.low] = 1; } else { m.lose = 1; sfx.play('no'); } } },
    draw: function (m) { R('#06030e', 0, 0, W, H); R('#120a24', 0, 160, W, 110); var X = [140, 240, 340], S = ['ch_idle0', 'spermaid_s0', 'greebo_s0'];
      for (var i = 0; i < 3; i++) { spr(S[i], X[i], 190, { sc: 1.3 }); R('#12040a', X[i] - 30, 206, 60, 8); R(m.hp[i] < 0.25 ? '#ff2630' : '#7dff9a', X[i] - 29, 207, 58 * m.hp[i], 6); }
      R('#ffe36a', X[m.sel] - 6, 100 + Math.sin(m.t * 10) * 3, 12, 6); R('#ffe36a', X[m.sel] - 2, 106 + Math.sin(m.t * 10) * 3, 4, 6); if (m.win) for (var k = 0; k < 8; k++) R('#7dff9a', X[m.low] - 20 + k * 6, 150 - ((m.t * 60 + k * 9) % 50), 2, 4); } }
);
/* every cabinet's boss: a big one at the top of the screen, you strafe underneath and fire upward */
function mkBoss(sp, name, o) {
  o = o || {}; return { id: 'boss_' + sp, word: o.word || 'BEAT ' + name.toUpperCase() + '!', dur: 14, boss: 1, ctl: 'lr+a', name: name,
    init: function (m, lv) { m.p = { x: W / 2, y: GROUND, vx: 0, vy: 0, face: 1, ground: true }; m.b = { x: W / 2, y: o.y || 70, hp: (o.hp || 7) + lv * 2, flash: 0 }; m.sh = []; m.bl = []; m.cd = 0; m.bcd = 1; m.max = m.b.hp; },
    update: function (m, dt) { var p = m.p, b = m.b; moveLR(p, dt, 200); m.cd -= dt; if ((KIT.pressed('a') || KIT.held('a')) && m.cd <= 0) { m.cd = 0.2; m.sh.push({ x: p.x, y: p.y - 40 }); sfx.play('shoot'); }
      b.x = W / 2 + Math.sin(m.t * (o.sway || 1.3)) * 170; if (b.flash > 0) b.flash -= dt; m.bcd -= dt;
      if (m.bcd <= 0) { var pat = o.pat || 'rain'; m.bcd = (o.rate || 0.6) - m.lv * 0.06;
        if (pat === 'rain') m.bl.push({ x: b.x, y: b.y + 20, vx: rnd(-60, 60), vy: 120 });
        else if (pat === 'aim') { var dx = p.x - b.x, dy = p.y - 30 - b.y, d = Math.hypot(dx, dy); m.bl.push({ x: b.x, y: b.y + 20, vx: dx / d * 170, vy: dy / d * 170 }); }
        else { for (var k = -1; k <= 1; k++) m.bl.push({ x: b.x, y: b.y + 20, vx: k * 70, vy: 130 }); m.bcd += 0.3; } }
      m.sh.forEach(function (s) { s.y -= 400 * dt; if (!s.done && Math.abs(s.x - b.x) < 36 && Math.abs(s.y - b.y) < 40) { s.done = 1; b.hp--; b.flash = 0.1; sfx.play('hit'); if (b.hp <= 0 && !m.lose) { m.win = 1; sfx.play('boom'); KIT.shake(10); } } });
      m.bl.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; if (!p.dead && !m.win && Math.abs(q.x - p.x) < 13 && q.y > p.y - 48 && q.y < p.y) { p.dead = 1; m.lose = 1; sfx.play('hurt'); } }); m.bl = m.bl.filter(function (q) { return q.y < H + 10; }); },
    draw: function (m) { floorBg(o.bg || '#1a0410', o.fl || '#3a0a1e'); for (var i = 0; i < 8; i++) R('rgba(0,0,0,0.2)', i * 64, 0, 24, GROUND);
      if (!m.win) spr(sp + (Math.floor(m.t * 4) % 2), m.b.x, m.b.y + (o.oy || 50), { sc: o.sc || 1, flash: m.b.flash > 0 }); else { for (var k = 0; k < 10; k++) R(k % 2 ? '#ffe36a' : '#ff2630', m.b.x + Math.cos(k + m.t * 9) * m.t * 20, m.b.y + Math.sin(k * 2 + m.t * 7) * m.t * 18, 4, 4); }
      m.sh.forEach(function (s) { if (!s.done) { R('#12040a', s.x - 3, s.y - 6, 6, 12); R('#fffbe8', s.x - 2, s.y - 5, 4, 10); } }); m.bl.forEach(function (q) { R('#12040a', q.x - 5, q.y - 5, 10, 10); R(o.shot || '#ff3a44', q.x - 4, q.y - 4, 8, 8); });
      spr(cumFrame(m, m.p), m.p.x, m.p.y, { flip: m.p.face < 0 }); R('#12040a', 120, 20, 240, 8); R('#ff2630', 121, 21, 238 * Math.max(0, m.b.hp) / m.max, 6); text(name.toUpperCase(), W / 2, 32, { align: 'center', size: 6, col: '#f1e7d0' }); } };
}
MICRO.forEach(function (g) { if (!g.ctl) g.ctl = { stomp: 'lr+a', grab: 'lr+a', escape: 'lr', survive: 'dpad', descend: 'dpad', serve: 'lr', free: 'a', shoot: 'dpad', command: 'ud+a', seven: 'a', hatch: 'a', ride: 'a', dodge: 'a' }[g.id] || 'dpad+a'; });

/* ---------- the cabinets: one per game, each a stage of its own micro games and a boss ---------- */
var STAGES = [
  { id: 'hog', name: 'Cumhead the Spermhog', col: ['#ffe36a', '#c08a10', '#3a2a04'], logo: 'hog', mascot: 'ch_run', mf: 7, games: ['grab', 'leap', 'stomp'], boss: mkBoss('f_sperm_', 'The Sperminator', { pat: 'aim', sc: 1.1 }), song: 'bsperm' },
  { id: 'meat', name: 'Meatnado Escape', col: ['#ff6a5a', '#c4121c', '#3a0408'], logo: 'meat', mascot: 'ao_meat', mf: 2, games: ['escape', 'outrun', 'leap'], boss: mkBoss('f_pig_', 'Brothers Load Piggy', { pat: 'spread', sc: 1.2 }), song: 'bpig' },
  { id: 'surv', name: 'Spermaid Survivors', col: ['#9ff0ff', '#2fb8d8', '#0a2a4a'], logo: 'surv', mascot: 'spermaid_s', mf: 3, skin: 'spermaid', games: ['survive', 'pearls', 'slay'], boss: mkBoss('f_demon_', 'Legion of Semen Demon', { pat: 'spread', bg: '#06142a', fl: '#0e2034', shot: '#c08aff' }), song: 'bdemon' },
  { id: 'cq', name: 'Cumheads Quest', col: ['#ff6a5a', '#c4121c', '#2a0408'], logo: 'cq', mascot: 'cumface', mf: 1, games: ['descend', 'loot', 'slay'], boss: mkBoss('f_golem_', 'The Golem', { pat: 'aim', sc: 1.3, oy: 40 }), song: 'boss' },
  { id: 'll', name: 'Load Legacy', col: ['#f1e7d0', '#b89c78', '#3a2a1c'], logo: 'll', mascot: 'ch_walk', mf: 9, games: ['stomp', 'hatch', 'ride', 'seven', 'dodge'], boss: mkBoss('f_beast_', 'Cum-starved Beast', { pat: 'rain', sc: 1 }), song: 'bbeast' },
  { id: 'wn', name: 'Willy Nilly', col: ['#ffd23a', '#e07a10', '#3a1a04'], logo: 'wn', mascot: 'npc_amy', mf: 1, games: ['serve', 'chop', 'tips'], boss: mkBoss('f_vampire_', 'The Customer From Hell', { pat: 'spread', sc: 1.4, bg: '#3a0a10', fl: '#4a0e14' }), song: 'bmoon' },
  { id: 'sw', name: "Spuzzworld: Cum's Oddysee", col: ['#d8d0c8', '#8a8078', '#2a2420'], logo: 'sw', mascot: 'h_gloop_baby_idle0', mf: 1, skin: 'mines', games: ['free', 'sneak', 'leap'], boss: mkBoss('f_blumguard_', 'The Lair Guard', { pat: 'aim', sc: 1.6, oy: 56, bg: '#100808', fl: '#2a1c16' }), song: 'brat' },
  { id: 'gr', name: 'The Grinding of Cumhead', col: ['#ff8a7a', '#d8202a', '#3a0408'], logo: 'gr', mascot: 'chb_d', mf: 4, games: ['shoot', 'bomb', 'escape'], boss: mkBoss('f_ratking_', 'Cult of the Rat', { pat: 'spread', sc: 1.1, bg: '#2a1c20', fl: '#33242a' }), song: 'brat' },
  { id: 'jv', name: 'Journey to the Void', col: ['#c8a0ff', '#7a2ad8', '#1a0a3a'], logo: 'jv', mascot: 'greebo_s', mf: 3, games: ['command', 'limit', 'heal'], boss: mkBoss('f_blum2_', 'Super Blumhead', { pat: 'aim', rate: 0.5, bg: '#06030e', fl: '#120a24', shot: '#c08aff' }), song: 'super' }
];
var OVERDRIVE_AT = 3; // cabinets you need to clear before the gold one wakes up
function cleared() { return STAGES.filter(function (s) { return SV.stages[s.id]; }).length; }
function stageOpen(i) { return i === 0 || !!SV.stages[STAGES[i - 1].id] || !!SV.stages[STAGES[i].id]; }
