/* =====================================================================================================
   POTBELLY'S ARCADE OVERDRIVE: a WarioWare style rush of tiny games. Cumhead walks into Potbelly
   Arcade, puts a coin in the big gold cabinet, the machine goes Super Saiyan and Cumhead locks in.
   Then it is one micro game after another, a few seconds each, every one taken from our other games.
   Four lives. Every five games it speeds up; every tenth is a boss. D-pad and A only.
   ===================================================================================================== */
var W = 480, H = 270;
var SV = KIT.load('ao-save', null) || { best: 0, plays: 0, seen: {} };
function persist() { KIT.save('ao-save', SV); }
var R = KIT.R, spr = KIT.spr, text = KIT.text;
var G = { mode: 'title', t: 0 };

/* ---------- the micro games ---------- */
var GROUND = 214;
function hitbox(a, b) { return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2; }
function cumFrame(m, p) { if (p.dead) return 'ch_hurt0'; if (!p.ground) return 'ch_jump1'; return Math.abs(p.vx) > 10 ? 'ch_walk' + (Math.floor(m.t * 14) % 9) : 'ch_idle' + (Math.floor(m.t * 8) % 7); }
function moveLR(p, dt, sp) { var ix = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0); p.vx = ix * sp; if (ix) p.face = ix; p.x = clamp(p.x + p.vx * dt, 20, W - 20); }
function physics(p, dt) { p.vy += 900 * dt; p.y += p.vy * dt; p.ground = false; if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.ground = true; } }
function floorBg(c1, c2) { R(c1, 0, 0, W, H); R(c2, 0, GROUND, W, H - GROUND); R('#12040a', 0, GROUND, W, 2); for (var x = 0; x < W; x += 32) R('rgba(0,0,0,0.25)', x, GROUND + 2, 16, H - GROUND); }

var MICRO = [
  { id: 'stomp', word: 'STOMP!', from: 'Load Legacy', dur: 5,
    init: function (m, lv) { m.p = { x: 100, y: GROUND, vx: 0, vy: 0, face: 1, ground: true }; m.e = { x: W + 20, y: GROUND, sp: 70 + lv * 30 }; },
    update: function (m, dt) { var p = m.p, e = m.e; moveLR(p, dt, 140); if (KIT.pressed('a') && p.ground) { p.vy = -380; sfx.play('jump'); } physics(p, dt); e.x -= e.sp * dt; if (e.x < -30) m.lose = 1;
      if (!m.win && Math.abs(p.x - e.x) < 24 && p.y > GROUND - 30) { if (p.vy > 0 && !p.ground) { m.win = 1; e.dead = 1; p.vy = -250; sfx.play('hit'); } else { m.lose = 1; p.dead = 1; } } },
    draw: function (m) { floorBg('#1a0a14', '#3e0f16'); for (var i = 0; i < 6; i++) R('#2a0e18', i * 90 + 20, 60, 40, 120); spr(cumFrame(m, m.p), m.p.x, m.p.y, { flip: m.p.face < 0 }); if (!m.e.dead) spr('f_crawler_' + (Math.floor(m.t * 8) % 4), m.e.x, m.e.y, { flip: true }); else spr('f_crawler_0', m.e.x, m.e.y + 4, { flip: true, alpha: 0.5 }); } },
  { id: 'grab', word: 'GRAB!', from: 'Cumhead the Spermhog', dur: 5,
    init: function (m, lv) { m.p = { x: W / 2, y: GROUND, vx: 0, vy: 0, face: 1, ground: true }; m.d = []; var n = 3 + lv; for (var i = 0; i < n; i++) m.d.push({ x: 40 + Math.random() * (W - 80), y: GROUND - (Math.random() < 0.4 ? 70 : 6) }); },
    update: function (m, dt) { var p = m.p; moveLR(p, dt, 190); if (KIT.pressed('a') && p.ground) { p.vy = -360; sfx.play('jump'); } physics(p, dt);
      m.d.forEach(function (d) { if (!d.got && Math.abs(d.x - p.x) < 18 && d.y > p.y - 60 && d.y < p.y + 6) { d.got = 1; sfx.play('coin'); } }); if (m.d.every(function (d) { return d.got; })) m.win = 1; },
    draw: function (m) { floorBg('#140a1a', '#2a1418'); R('#0a0a1a', 0, 120, W, 94); for (var i = 0; i < 12; i++) R('#1a1430', i * 44, 140 - (i % 3) * 20, 30, 80); m.d.forEach(function (d) { if (!d.got) spr('ao_drop', d.x, d.y + Math.sin(m.t * 6 + d.x) * 2); }); spr(cumFrame(m, m.p), m.p.x, m.p.y, { flip: m.p.face < 0 }); } },
  { id: 'escape', word: 'ESCAPE!', from: 'Meatnado Escape', dur: 5, survive: 1,
    init: function (m, lv) { m.p = { x: W / 2, y: GROUND, vx: 0, vy: 0, face: 1, ground: true }; m.meat = []; m.rate = 0.45 - lv * 0.1; m.next = 0.3; },
    update: function (m, dt) { var p = m.p; moveLR(p, dt, 200); physics(p, dt); m.next -= dt; if (m.next <= 0) { m.next = m.rate; m.meat.push({ x: clamp(p.x + rnd(-120, 120), 20, W - 20), y: -20, vy: 140 + Math.random() * 80, r: Math.random() * 6 }); }
      m.meat.forEach(function (c) { c.vy += 200 * dt; c.y += c.vy * dt; c.r += dt * 5; if (!p.dead && Math.abs(c.x - p.x) < 16 && c.y > p.y - 50 && c.y < p.y) { p.dead = 1; m.lose = 1; sfx.play('splat'); } }); },
    draw: function (m) { floorBg('#2a0408', '#4a1010'); var t = m.t; for (var i = 0; i < 9; i++) { var y = i * 24, w = 40 + i * 30; R('rgba(196,18,28,0.25)', W / 2 - w / 2 + Math.sin(t * 6 + i) * 30, y, w, 6); }
      m.meat.forEach(function (c) { spr(c.r % 2 > 1 ? 'ao_meat1' : 'ao_meat0', c.x, c.y, { anchor: 'c', rot: c.r }); }); spr(cumFrame(m, m.p), m.p.x, m.p.y, { flip: m.p.face < 0 }); } },
  { id: 'survive', word: 'SURVIVE!', from: 'Spermaid Survivors', dur: 5, survive: 1,
    init: function (m, lv) { m.p = { x: W / 2, y: H / 2 + 20 }; m.e = []; m.n = 0; m.rate = 0.6 - lv * 0.15; m.next = 0.2; m.sp = 50 + lv * 20; },
    update: function (m, dt) { var p = m.p, ix = (KIT.held('right') ? 1 : 0) - (KIT.held('left') ? 1 : 0), iy = (KIT.held('down') ? 1 : 0) - (KIT.held('up') ? 1 : 0), mm = Math.hypot(ix, iy) || 1;
      p.x = clamp(p.x + ix / mm * 150 * dt, 20, W - 20); p.y = clamp(p.y + iy / mm * 150 * dt, 50, H - 10); if (ix) p.face = ix;
      m.next -= dt; if (m.next <= 0) { m.next = m.rate; var a = Math.random() * 6.28; m.e.push({ x: W / 2 + Math.cos(a) * 280, y: H / 2 + Math.sin(a) * 180 }); }
      m.e.forEach(function (e) { var dx = p.x - e.x, dy = p.y - 20 - e.y, d = Math.hypot(dx, dy) || 1; e.x += dx / d * m.sp * dt; e.y += dy / d * m.sp * dt; if (d < 16 && !p.dead) { p.dead = 1; m.lose = 1; sfx.play('hurt'); } }); },
    draw: function (m) { R('#0a1424', 0, 0, W, H); for (var i = 0; i < 40; i++) R('rgba(122,240,255,0.08)', (i * 53 + m.t * 20) % W, (i * 37) % H, 2, 2); m.e.forEach(function (e) { spr('f_bat_' + (Math.floor(m.t * 10) % 4), e.x, e.y, { anchor: 'c' }); }); spr('spermaid_s' + (Math.floor(m.t * 6) % 3), m.p.x, m.p.y, { flip: (m.p.face || 1) < 0, alpha: m.p.dead ? 0.5 : 1 }); } },
  { id: 'descend', word: 'FIND THE STAIRS!', from: 'Cumheads Quest', dur: 6,
    init: function (m, lv) {
      var C = 11, Rw = 7; m.C = C; m.Rw = Rw;
      do { m.grid = []; for (var y = 0; y < Rw; y++) { m.grid.push([]); for (var x = 0; x < C; x++) m.grid[y].push(Math.random() < 0.18 + lv * 0.05 ? 1 : 0); } m.p = { x: 0, y: rndi(0, Rw - 1) }; m.s = { x: C - 1 - rndi(0, 2), y: rndi(0, Rw - 1) }; m.grid[m.p.y][m.p.x] = 0; m.grid[m.s.y][m.s.x] = 0; } while (!reach(m));
      function reach(m) { var seen = {}, q = [[m.p.x, m.p.y]]; seen[m.p.x + ',' + m.p.y] = 1; while (q.length) { var c = q.shift(); if (c[0] === m.s.x && c[1] === m.s.y) return true; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = c[0] + d[0], ny = c[1] + d[1]; if (nx >= 0 && ny >= 0 && nx < m.C && ny < m.Rw && !m.grid[ny][nx] && !seen[nx + ',' + ny]) { seen[nx + ',' + ny] = 1; q.push([nx, ny]); } }); } return false; }
    },
    update: function (m, dt) { var d = KIT.pressed('left') ? [-1, 0] : KIT.pressed('right') ? [1, 0] : KIT.pressed('up') ? [0, -1] : KIT.pressed('down') ? [0, 1] : null;
      if (d) { var nx = m.p.x + d[0], ny = m.p.y + d[1]; if (nx >= 0 && ny >= 0 && nx < m.C && ny < m.Rw && !m.grid[ny][nx]) { m.p.x = nx; m.p.y = ny; sfx.play('step'); } else sfx.play('no'); }
      if (m.p.x === m.s.x && m.p.y === m.s.y) m.win = 1; },
    draw: function (m) { R('#0c0406', 0, 0, W, H); var ts = 28, ox = (W - m.C * ts) / 2, oy = 54;
      for (var y = 0; y < m.Rw; y++) for (var x = 0; x < m.C; x++) { var px = ox + x * ts, py = oy + y * ts; if (m.grid[y][x]) spr('ao_wall', px, py, { anchor: 'tl', sc: ts / 24 }); else { R((x + y) % 2 ? '#2a1418' : '#22101a', px, py, ts, ts); } }
      spr('ao_stairs', ox + m.s.x * ts, oy + m.s.y * ts, { anchor: 'tl', sc: ts / 24 }); spr('cumface', ox + m.p.x * ts + ts / 2, oy + m.p.y * ts + ts - 1, { sc: 0.9 }); } },
  { id: 'serve', word: 'SERVE!', from: 'Willy Nilly', dur: 4,
    init: function (m, lv) { m.want = Math.random() < 0.5 ? 'c' : 'd'; m.who = pick(['npc_joff', 'npc_saba', 'npc_kaya', 'npc_t', 'npc_tb', 'npc_greebo', 'cumface']); m.pickd = null; m.slide = 0; },
    update: function (m, dt) { if (!m.pickd) { if (KIT.pressed('left')) m.pickd = 'c'; else if (KIT.pressed('right')) m.pickd = 'd'; if (m.pickd) sfx.play('select'); } else { m.slide = Math.min(1, m.slide + dt * 3); if (m.slide >= 1) { if (m.pickd === m.want) m.win = 1; else m.lose = 1; } } },
    draw: function (m) { R('#3a0a10', 0, 0, W, H); for (var y = 140; y < H; y += 16) for (var x = 0; x < W; x += 16) R(((x + y) / 16) % 2 ? '#1e0a0c' : '#4a0e14', x, y, 16, 16);
      R('#6e3a1e', 150, 150, 180, 20); R('#a8643a', 150, 146, 180, 6); spr(m.who, 240, 146, { sc: 1.5 }); spr('ao_bubble', 290, 82); spr(m.want === 'd' ? 'ao_bowld' : 'ao_bowlc', 290, 70);
      spr('npc_amy', 240, 250, { sc: 1.4 });
      var cx = m.pickd ? lerp(m.pickd === 'c' ? 120 : 360, 240, m.slide) : 0, cy = m.pickd ? lerp(220, 150, m.slide) : 0;
      if (m.pickd !== 'c') spr('ao_bowlc', 120, 226, { sc: 1.4 }); if (m.pickd !== 'd') spr('ao_bowld', 360, 226, { sc: 1.4 }); if (m.pickd) spr(m.pickd === 'd' ? 'ao_bowld' : 'ao_bowlc', cx, cy, { sc: 1.4 });
      text('< CLASSIC', 70, 236, { size: 8, col: '#ffb040' }); text('DYNAMITE >', 330, 236, { size: 8, col: '#ff2630' }); } },
  { id: 'free', word: 'FREE THEM!', from: 'Spuzzworld', dur: 4,
    init: function (m, lv) { m.k = 0; m.dir = 1; m.sp = 1.3 + lv * 0.5; m.z0 = 0.35 + Math.random() * 0.4; m.zw = 0.2 - lv * 0.04; m.pulled = 0; },
    update: function (m, dt) { if (!m.pulled) { m.k += m.dir * m.sp * dt; if (m.k > 1) { m.k = 1; m.dir = -1; } if (m.k < 0) { m.k = 0; m.dir = 1; } if (KIT.pressed('a')) { m.pulled = 1; sfx.play('door'); if (m.k >= m.z0 && m.k <= m.z0 + m.zw) m.win = 1; else m.lose = 1; } } },
    draw: function (m) { R('#140612', 0, 0, W, H); R('#2a0a20', 0, 200, W, 70); spr(m.win ? 'h_gloop_baby_idle0' : 'h_gloop_baby_idle0', 300, 200, { sc: 1.5 }); spr(m.win ? 'h_blood_baby_idle0' : 'h_blood_baby_idle0', 340, 200, { sc: 1.5 });
      if (!m.win) spr('ao_bars', 320, 202, { sc: 1.6 }); else spr('ao_bars', 320, 120, { sc: 1.6, alpha: 0.6 });
      spr(m.pulled ? 'ao_lever1' : 'ao_lever0', 150, 202, { sc: 1.5 }); spr('ch_idle0', 110, 202);
      R('#12040a', 60, 60, 360, 18); R('#2a0a0e', 62, 62, 356, 14); R('#2aa84a', 62 + m.z0 * 356, 62, m.zw * 356, 14); R('#ffe36a', 62 + m.k * 356 - 2, 56, 4, 26); } },
  { id: 'shoot', word: 'SHOOT!', from: 'The Grinding of Cumhead', dur: 4,
    init: function (m, lv) { var dirs = shuffle(['left', 'right', 'up', 'down']); m.t3 = dirs.slice(0, 2 + (lv > 0 ? 1 : 0)).map(function (d) { return { d: d, hit: 0 }; }); m.tears = []; },
    update: function (m, dt) { ['left', 'right', 'up', 'down'].forEach(function (d) { if (KIT.pressed(d)) { m.tears.push({ d: d, k: 0 }); sfx.play('shoot'); } });
      m.tears.forEach(function (t) { t.k += dt * 4; if (t.k >= 1 && !t.done) { t.done = 1; m.t3.forEach(function (g) { if (g.d === t.d && !g.hit) { g.hit = 1; sfx.play('hit'); } }); } });
      if (m.t3.every(function (g) { return g.hit; })) m.win = 1; },
    draw: function (m) { R('#2a1c20', 0, 0, W, H); for (var y = 0; y < H; y += 26) for (var x = 0; x < W; x += 26) if ((x + y) / 26 % 2) R('#33242a', x, y, 26, 26);
      var cx = W / 2, cy = H / 2 + 10, P = { left: [-150, 0], right: [150, 0], up: [0, -95], down: [0, 95] };
      m.t3.forEach(function (g) { if (!g.hit) spr('ao_target', cx + P[g.d][0], cy + P[g.d][1], { anchor: 'c', sc: 1.3 }); });
      m.tears.forEach(function (t) { if (!t.done) { R('#12040a', cx + P[t.d][0] * t.k - 5, cy + P[t.d][1] * t.k - 5, 10, 10); R('#fffbe8', cx + P[t.d][0] * t.k - 4, cy + P[t.d][1] * t.k - 4, 8, 8); } });
      spr('ch_icon0', cx, cy + 14, { sc: 1.5 }); } },
  { id: 'command', word: 'FIGHT!', from: 'Journey to the Void', dur: 4,
    init: function (m, lv) { m.cmds = shuffle(['FIGHT', 'MAGIC', 'ITEM', 'RUN']); m.want = pick(['FIGHT', 'MAGIC', 'ITEM']); m.word = m.want === 'MAGIC' ? 'CAST!' : m.want === 'ITEM' ? 'USE AN ITEM!' : 'FIGHT!'; m.cur = 0; m.done = 0; },
    update: function (m, dt) { if (m.done) { m.done += dt; if (m.done > 0.4) { if (m.cmds[m.cur] === m.want) m.win = 1; else m.lose = 1; } return; } if (KIT.pressed('down')) { m.cur = (m.cur + 1) % 4; sfx.play('tick'); } if (KIT.pressed('up')) { m.cur = (m.cur + 3) % 4; sfx.play('tick'); } if (KIT.pressed('a')) { m.done = 0.01; sfx.play('select'); } },
    draw: function (m) { R('#0a0614', 0, 0, W, H); R('#1a1030', 0, 140, W, 130); spr('f_vampire_' + (Math.floor(m.t * 4) % 4), 120, 150, { sc: 2 }); spr('ch_idle' + (Math.floor(m.t * 8) % 7), 360, 150, { flip: true }); spr('spermaid_s0', 400, 160); spr('greebo_s0', 330, 168);
      KIT.panel(250, 172, 220, 90); m.cmds.forEach(function (c, i) { text((i === m.cur ? '> ' : '  ') + c, 266, 184 + i * 18, { size: 8, col: i === m.cur ? '#ffe36a' : '#f1e7d0' }); });
      if (m.done && m.cmds[m.cur] === m.want) { R('rgba(255,255,255,0.4)', 60, 70, 120, 90); } } },
  { id: 'seven', word: 'STOP ON 7!', from: 'The Cursed Slot', dur: 5,
    init: function (m, lv) { m.syms = ['ao_s7', 'ao_scherry', 'ao_sskull', 'ao_sdrop']; m.pos = Math.random() * 4; m.sp = 6 + lv * 3; m.stop = 0; },
    update: function (m, dt) { if (!m.stop) { m.pos = (m.pos + m.sp * dt) % 4; if (KIT.pressed('a')) { m.stop = 1; sfx.play('select'); var i = Math.round(m.pos) % 4; m.pos = Math.round(m.pos); if (i === 0) { m.win = 1; sfx.play('coin'); } else m.lose = 1; } } },
    draw: function (m) { R('#1a0a0e', 0, 0, W, H); spr('npc_tb', 400, 230, { sc: 1.5 }); R('#c4121c', 170, 50, 140, 170); R('#12040a', 190, 80, 100, 110); R('#f1e7d0', 194, 84, 92, 102);
      for (var k = -1; k <= 1; k++) { var f = m.pos + k, idx = ((Math.floor(f) % 4) + 4) % 4, off = (f - Math.floor(f)); spr(m.syms[idx], 240, 135 + (k - off) * 36 + (m.stop ? 0 : 0), { anchor: 'c', sc: 1.4 }); }
      R('#f1e7d0', 194, 84, 92, 14); R('#f1e7d0', 194, 172, 92, 14); R('#ff2630', 190, 133, 6, 4); R('#ff2630', 284, 133, 6, 4); text('CURSED SLOT', 240, 58, { align: 'center', size: 8, col: '#ffe36a' }); } },
  { id: 'hatch', word: 'HATCH!', from: 'Load Legacy', dur: 4,
    init: function (m, lv) { m.n = 0; m.need = 8 + lv * 4; m.br = Math.random() < 0.2 ? 'blood' : 'gloop'; },
    update: function (m, dt) { if (KIT.pressed('a') && !m.win) { m.n++; sfx.play('tick'); KIT.shake(2); if (m.n >= m.need) { m.win = 1; sfx.play('power'); } } },
    draw: function (m) { R('#1a2a10', 0, 0, W, H); R('#c8903a', 0, 200, W, 70); for (var i = 0; i < 30; i++) R('#a87020', (i * 31) % W, 200 + (i * 7) % 60, 12, 2);
      var k = Math.min(3, Math.floor(m.n / m.need * 4)); if (m.win) spr('h_' + m.br + '_baby_idle0', 240, 210, { sc: 2 }); else spr('h_' + m.br + '_egg' + k, 240 + (Math.random() - 0.5) * k * 2, 210, { sc: 2.2 });
      text('PRESS A!', 240, 60, { align: 'center', size: 16, col: '#ffe36a' }); KIT.bar(140, 230, 200, 8, m.n / m.need, '#ffe36a'); } },
  { id: 'ride', word: 'JUMP ON!', from: 'The Load Flume', dur: 5,
    init: function (m, lv) { m.p = { x: 60, y: 186, vx: 0, vy: 0, ground: true, face: 1 }; m.b = { x: -60, sp: 110 + lv * 50 }; m.jumped = 0; },
    update: function (m, dt) { var p = m.p; m.b.x += m.b.sp * dt; if (m.b.x > W + 60) m.b.x = -60; if (KIT.pressed('a') && !m.jumped) { m.jumped = 1; p.vy = -330; p.vx = 160; sfx.play('jump'); }
      if (m.jumped && !m.win && !m.lose) { p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y >= 206 && p.vy > 0) { if (Math.abs(p.x - m.b.x) < 30) { m.win = 1; p.y = 206; m.ride = 1; sfx.play('land'); } else if (p.y > 230) { m.lose = 1; sfx.play('splat'); } } }
      if (m.ride) p.x = m.b.x; },
    draw: function (m) { R('#2a0410', 0, 0, W, H); R('#5a0a1a', 0, 120, W, 90); R('#12040a', 0, 186, 90, 84); R('#3a1020', 0, 186, 90, 4); R('#e6cf98', 90, 212, W - 90, 58); R('#fff6d8', 90, 212, W - 90, 3);
      for (var x = 90; x < W; x += 6) if (Math.sin(x * 0.2 - m.t * 6) > 0.6) R('#ffffff', x, 211, 6, 2);
      spr('p_logboat', m.b.x, 222); spr(m.p.y < 186 || m.jumped ? 'ch_jump1' : 'ch_idle0', m.p.x, m.p.y + (m.ride ? -4 : 0)); spr('steve0', 30, 186, { sc: 0.8 }); } },
  { id: 'dodge', word: 'DODGE!', from: "TB's Toll", dur: 5, survive: 1,
    init: function (m, lv) { m.p = { x: 110, y: GROUND, vx: 0, vy: 0, ground: true, face: 1 }; m.pills = []; m.next = 0.5; m.rate = 1 - lv * 0.25; m.sp = 200 + lv * 60; },
    update: function (m, dt) { var p = m.p; if (KIT.pressed('a') && p.ground) { p.vy = -400; sfx.play('jump'); } physics(p, dt); m.next -= dt; if (m.next <= 0) { m.next = m.rate * rnd(0.8, 1.3); m.pills.push({ x: 400, y: GROUND - 16 }); sfx.play('shoot'); }
      m.pills.forEach(function (q) { q.x -= m.sp * dt; if (!p.dead && Math.abs(q.x - p.x) < 14 && p.y > GROUND - 22) { p.dead = 1; m.lose = 1; sfx.play('hurt'); } }); },
    draw: function (m) { floorBg('#1a0a0e', '#2a1012'); R('#3a2a20', 330, 60, 150, 154); text("TB'S TOLL", 405, 70, { align: 'center', size: 8, col: '#ffe36a' }); spr('npc_tb', 420, GROUND, { sc: 1.6, flip: true });
      m.pills.forEach(function (q) { spr('ao_pill', q.x, q.y, { anchor: 'c', rot: m.t * 10 }); }); spr(cumFrame(m, m.p), m.p.x, m.p.y); } }
];
var BOSSG = { id: 'boss', word: 'BEAT BLUMHEAD!', from: 'BOSS STAGE', dur: 12, boss: 1,
  init: function (m, lv) { m.p = { x: W / 2, y: GROUND, vx: 0, vy: 0, face: 1, ground: true }; m.b = { x: W / 2, y: 80, hp: 6 + lv * 2, flash: 0 }; m.sh = []; m.bl = []; m.cd = 0; m.bcd = 1; },
  update: function (m, dt) { var p = m.p, b = m.b; moveLR(p, dt, 190); m.cd -= dt; if (KIT.pressed('a') && m.cd <= 0) { m.cd = 0.18; m.sh.push({ x: p.x, y: p.y - 40 }); sfx.play('shoot'); }
    b.x = W / 2 + Math.sin(m.t * 1.3) * 170; if (b.flash > 0) b.flash -= dt; m.bcd -= dt; if (m.bcd <= 0) { m.bcd = 0.55; m.bl.push({ x: b.x, y: b.y + 20, vx: rnd(-60, 60), vy: 110 }); }
    m.sh.forEach(function (s) { s.y -= 380 * dt; if (!s.done && Math.abs(s.x - b.x) < 34 && Math.abs(s.y - b.y) < 36) { s.done = 1; b.hp--; b.flash = 0.1; sfx.play('hit'); if (b.hp <= 0) { m.win = 1; sfx.play('boom'); KIT.shake(10); } } });
    m.bl.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; if (!p.dead && Math.abs(q.x - p.x) < 14 && q.y > p.y - 50 && q.y < p.y) { p.dead = 1; m.lose = 1; sfx.play('hurt'); } }); },
  draw: function (m) { floorBg('#1a0410', '#3a0a1e'); for (var i = 0; i < 8; i++) R('#2a0618', i * 64, 0, 24, GROUND); if (!m.win) spr('f_blum_' + (Math.floor(m.t * 4) % 2), m.b.x, m.b.y + 50, { sc: 0.9, flash: m.b.flash > 0 });
    m.sh.forEach(function (s) { if (!s.done) { R('#12040a', s.x - 3, s.y - 6, 6, 12); R('#fffbe8', s.x - 2, s.y - 5, 4, 10); } }); m.bl.forEach(function (q) { R('#12040a', q.x - 5, q.y - 5, 10, 10); R('#ff3a44', q.x - 4, q.y - 4, 8, 8); });
    spr(cumFrame(m, m.p), m.p.x, m.p.y, { flip: m.p.face < 0 }); for (var h = 0; h < m.b.hp; h++) R('#ff2630', 20 + h * 10, 40, 8, 4); } };

/* ---------- the run ---------- */
var run, M;
function newRun() { run = { n: 0, lives: 4, speed: 0, score: 0, last: null }; SV.plays++; persist(); nextGame(true); }
function speedK() { return run ? 1 + run.speed * 0.13 : 1; }
function nextGame(first) {
  var boss = run.n > 0 && run.n % 10 === 9, g;
  if (boss) g = BOSSG; else { var pool = MICRO.filter(function (m) { return m.id !== run.last; }); g = pick(pool); }
  run.last = g.id; var lv = Math.min(2, Math.floor(run.n / 7));
  M = { g: g, t: 0, lv: lv, word: g.word }; g.init(M, lv); if (M.word !== g.word) {} else M.word = M.word;
  if (g.id === 'command') M.word = M.word || g.word;
  G.mode = 'between'; G.bt = first ? 2.2 : 2.0; G.speedUp = !first && run.n > 0 && run.n % 5 === 0 && !boss;
  if (G.speedUp) { run.speed++; G.bt += 1; }
  music.play(boss ? 'aoboss' : 'aobetween');
}
function finishMicro(won) {
  G.mode = 'result'; G.rt = 1.1; G.won = won; if (won) { run.score++; sfx.play('win'); } else { run.lives--; sfx.play('lose'); KIT.shake(6); }
  SV.seen[M.g.id] = 1; persist();
}
function update(dt) {
  G.t += dt;
  if (G.mode === 'intro') { introUpdate(dt); return; }
  if (G.mode === 'between') { G.bt -= dt * (G.speedUp ? 1 : speedK()); if (G.bt <= 0) { G.mode = 'micro'; M.t = 0; music.play(M.g.boss ? 'aoboss' : 'aomicro'); } return; }
  if (G.mode === 'micro') {
    var sdt = dt * speedK(); M.t += sdt; M.g.update(M, sdt);
    var over = M.t >= M.g.dur;
    if (M.win && !M.g.survive) { M.endT = (M.endT || 0) + dt; if (M.endT > 0.35) finishMicro(true); }
    else if (M.lose) { M.endT = (M.endT || 0) + dt; if (M.endT > 0.35) finishMicro(false); }
    else if (over) finishMicro(!!M.g.survive);
    return;
  }
  if (G.mode === 'result') { G.rt -= dt; if (G.rt <= 0 && run) { run.n++; if (run.lives <= 0) gameOver(); else nextGame(); } }
}
function gameOver() {
  G.mode = 'over'; music.play('aotitle'); var best = run.score > SV.best; if (best) { SV.best = run.score; persist(); }
  KIT.menu({ title: best ? 'New Best!' : 'Game Over', sub: 'Cumhead cleared ' + run.score + ' games before the machine spat him out.', html: '<p style="text-align:center;margin:0">Best: <b>' + SV.best + '</b>  ·  Speed level reached: <b>' + (run.speed + 1) + '</b></p><p style="text-align:center;color:#a6968f;margin:6px 0 0">"Cabinets are free, kid. Play all you like."</p>',
    items: [{ label: 'ANOTHER COIN', fn: function () { KIT.closeMenu(); newRun(); }, cls: 'hot', def: true }, { label: 'TITLE', fn: titleMenu, back: true }] });
}

/* ---------- the walk in: the coin, Super Saiyan, locking in ---------- */
var IN;
function startIntro() { G.mode = 'intro'; IN = { t: 0, x: -30, phase: 0 }; music.play('aotitle'); }
function introUpdate(dt) {
  IN.t += dt; if (KIT.pressed('a') || KIT.pressed('start') || KIT.ptr.tap) { if (IN.t > 0.3) { newRun(); return; } }
  if (IN.phase === 0) { IN.x += 80 * dt; if (IN.x >= 200) { IN.x = 200; IN.phase = 1; IN.pt = 0; sfx.play('coin'); } }
  else if (IN.phase === 1) { IN.pt += dt; if (IN.pt > 1) { IN.phase = 2; IN.pt = 0; sfx.play('roar'); music.play('aoboss'); } }
  else if (IN.phase === 2) { IN.pt += dt; KIT.shake(4); if (Math.random() < 0.15) { KIT.flash(0.1); sfx.play('boom'); } if (IN.pt > 2.6) { IN.phase = 3; IN.pt = 0; KIT.flash(0.4); sfx.play('power'); } }
  else if (IN.phase === 3) { IN.pt += dt; if (IN.pt > 1.6) newRun(); }
}
function aura(cx, cy, w, h, k) {
  var ctx = KIT.ctx;
  for (var i = 0; i < 26; i++) {
    var a = i / 26 * Math.PI * 2, fl = Math.sin(G.t * 18 + i * 1.7) * 0.5 + 0.5, len = (30 + fl * 40) * k;
    var bx = cx + Math.cos(a) * w * 0.55, by = cy + Math.sin(a) * h * 0.55;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,' + 0.7 * k + ')' : i % 3 === 1 ? 'rgba(255,227,106,' + 0.8 * k + ')' : 'rgba(255,160,40,' + 0.7 * k + ')';
    ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * 8, by + Math.cos(a) * 8); ctx.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len - len * 0.6); ctx.lineTo(bx + Math.sin(a) * 8, by - Math.cos(a) * 8); ctx.fill();
  }
  if (Math.random() < 0.5 * k) { ctx.strokeStyle = '#7af0ff'; ctx.lineWidth = 2; ctx.beginPath(); var x = cx + rnd(-w, w) * 0.6, y = cy - h * 0.6; ctx.moveTo(x, y); for (var s = 0; s < 6; s++) { x += rnd(-14, 14); y += h * 0.22; ctx.lineTo(x, y); } ctx.stroke(); }
}
function drawArcade(alpha) {
  R('#0c0408', 0, 0, W, H); R('#1a0a12', 0, 0, W, 170);
  for (var x = 0; x < W; x += 40) { R('#220c16', x, 0, 20, 170); }
  ctx2Neon('POTBELLY ARCADE', W / 2, 18);
  ['ao_cab_r', 'ao_cab_p', 'ao_cab_b', 'ao_cab_g'].forEach(function (c, i) { var x = i < 2 ? 40 + i * 64 : 340 + (i - 2) * 64; spr(c, x, 196); R(['#ff2630', '#c08aff', '#7af0ff', '#9aff5a'][i], x - 17 + (Math.floor(G.t * 6 + i) % 3) * 6, 125, 4, 4); });
  for (var y = 196; y < H; y += 12) for (var x2 = 0; x2 < W; x2 += 24) R(((x2 + y) / 12) % 2 ? '#1a0a0e' : '#2a0e12', x2, y, 24, 12);
  spr('npc_potbelly', 440, 250, { sc: 1.2 });
}
function ctx2Neon(s, x, y) { text(s, x, y, { align: 'center', size: 20, font: 'title', col: '#ff2630', shadowCol: '#5a0410' }); }
function drawIntro() {
  drawArcade(); var k = IN.phase >= 2 ? Math.min(1, IN.pt * 0.8 + (IN.phase === 3 ? 1 : 0)) : 0;
  if (k > 0) aura(W / 2, 140, 110, 180, k);
  spr('ao_cabbig', W / 2, 200, { flash: IN.phase === 2 && Math.floor(G.t * 20) % 4 === 0 });
  if (IN.phase >= 2) { R('rgba(255,227,106,' + (0.4 + Math.sin(G.t * 20) * 0.2) + ')', W / 2 - 30, 70, 60, 46); }
  var cx = IN.phase === 0 ? IN.x : 200, frame = IN.phase === 0 ? 'ch_walk' + (Math.floor(IN.t * 12) % 9) : IN.phase === 3 ? 'ch_attack' : 'ch_idle' + (Math.floor(IN.t * 8) % 7);
  spr(frame, cx, 250);
  if (IN.phase === 1) { var c = Math.min(1, IN.pt * 1.5); spr('ao_coin', lerp(cx + 10, W / 2 + 8, c), lerp(200, 166, c) - Math.sin(c * Math.PI) * 30, { anchor: 'c' }); }
  if (IN.phase === 0) caption('Cumhead walks into Potbelly Arcade. One cabinet is glowing.', 'npc_potbelly', '"Cabinets are free, kid. Play all you like."');
  if (IN.phase === 1) caption('He puts a coin in anyway.');
  if (IN.phase === 2) caption('THE MACHINE GOES SUPER SAIYAN', null, null, '#ffe36a');
  if (IN.phase === 3) { R('rgba(255,255,255,' + Math.max(0, 0.6 - IN.pt) + ')', 0, 0, W, H); caption('CUMHEAD LOCKS IN', null, null, '#ff2630'); }
  text('A TO SKIP', W - 10, H - 12, { align: 'right', size: 6, col: '#a6968f' });
}
function caption(a, who, quote, col) { KIT.panel(40, 6, 400, quote ? 50 : 32); text(a, W / 2, 14, { align: 'center', size: quote ? 14 : 16, font: quote ? 'body' : 'title', col: col || '#f1e7d0' }); if (quote) text('Potbelly: ' + quote, W / 2, 34, { align: 'center', size: 12, font: 'body', col: '#ffe36a' }); }

/* ---------- drawing the rush ---------- */
function drawBetween() {
  var t = G.t; R('#140408', 0, 0, W, H);
  aura(W / 2, 150, 200, 200, 0.55 + Math.sin(t * 4) * 0.15);
  R('rgba(20,4,8,0.55)', 0, 0, W, H);
  // the score and the lives
  text(String(run.score), W / 2, 40, { align: 'center', size: 48, font: 'title', col: '#ffe36a' });
  for (var i = 0; i < 4; i++) spr(i < run.lives ? 'ao_heart' : 'ao_heart0', W / 2 - 34 + i * 18, 108, { anchor: 'tl' });
  spr('ch_icon0', W / 2, 200 + Math.sin(t * 10) * 2, { sc: 2 });
  if (G.speedUp && G.bt > 1.8) { text('SPEED UP!', W / 2, 130, { align: 'center', size: 32, font: 'title', col: '#ff2630' }); return; }
  var k = clamp((2 - G.bt) * 3, 0, 1);
  if (G.bt < 1.2) { text(M.word, W / 2, 132 - (1 - k) * 10, { align: 'center', size: 34, font: 'title', col: '#ffffff', shadowCol: '#c4121c', max: 440 }); text('FROM ' + M.g.from.toUpperCase(), W / 2, 172, { align: 'center', size: 6, col: '#a6968f' }); }
}
function drawMicro() {
  M.g.draw(M);
  // the fuse: a burning bar along the bottom
  var left = Math.max(0, 1 - M.t / M.g.dur); R('#12040a', 0, H - 8, W, 8); R('#c8a050', 0, H - 6, W * left, 4); R(Math.floor(G.t * 20) % 2 ? '#ffe36a' : '#ff5a20', W * left - 4, H - 9, 8, 10);
  if (M.t < 0.7) text(M.word, W / 2, 10, { align: 'center', size: 26, font: 'title', col: '#ffffff', shadowCol: '#c4121c', max: 440 });
  // the gold bezel of the Overdrive cabinet's screen
  R('#ffc840', 0, 0, W, 2); R('#ffc840', 0, 0, 2, H); R('#ffc840', W - 2, 0, 2, H);
}
function drawResult() {
  drawMicro(); var k = 1 - G.rt / 1.1;
  R('rgba(7,4,5,' + Math.min(0.6, k * 2) + ')', 0, 0, W, H);
  text(G.won ? 'YES!' : 'NOPE!', W / 2, 100, { align: 'center', size: 40, font: 'title', col: G.won ? '#ffe36a' : '#ff2630' });
}
function draw() {
  if (G.mode === 'title' || G.mode === 'over') { drawArcade(); aura(W / 2, 140, 110, 180, 0.6); spr('ao_cabbig', W / 2, 200); return; }
  if (G.mode === 'intro') { drawIntro(); return; }
  if (G.mode === 'between') { drawBetween(); return; }
  if (G.mode === 'micro') { drawMicro(); return; }
  if (G.mode === 'result') drawResult();
}

/* ---------- menus ---------- */
function titleMenu() {
  G.mode = 'title'; music.play('aotitle');
  KIT.menu({ cls: 'clear', title: "Potbelly's Arcade Overdrive", sub: 'One coin. Every game we ever made, a few seconds at a time.',
    items: [{ label: 'INSERT COIN', fn: function () { KIT.closeMenu(); if (SV.plays) newRun(); else startIntro(); }, cls: 'hot', def: true }, { label: 'WATCH THE INTRO', fn: function () { KIT.closeMenu(); startIntro(); } }, { label: 'HOW TO PLAY', fn: helpMenu }],
    note: 'Best ' + SV.best + '  ·  Micro games seen ' + Object.keys(SV.seen).length + ' of ' + (MICRO.length + 1) });
}
function helpMenu() { KIT.menu({ title: 'How to Play', html: '<p>Each game lasts a few seconds. Read the word, then do it, fast. The fuse along the bottom is your time.</p><p>Only the <b>d-pad</b> and <b>A</b> (Z or Space on a keyboard). Miss and you lose a heart. Four hearts. Every five games it gets faster, and every tenth game is a boss.</p>', items: [{ label: 'BACK', back: true, fn: function () { if (run && G.mode !== 'title' && G.mode !== 'over') pauseMenu(); else titleMenu(); } }] }); }
function pauseMenu() { if (G.mode === 'title' || G.mode === 'over' || KIT.menuOpen()) return; KIT.menu({ cls: 'clear', title: 'Paused', items: [{ label: 'CARRY ON', fn: KIT.closeMenu, back: true, def: true }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'QUIT', fn: titleMenu }] }); }

music.songs.aotitle = { bpm: 128, beats: 4, vol: 0.85, wet: 0.3, lead: 'pulse', bass: 'drive', acc: 'arp16', drums: 'rock', chords: 'Em C D B Em C Am B',
  mel: 'b4 - e5 - g5 - b5 - | c6 - b5 - g5 - e5 - | f#5 - a5 - d6 - c6 - | b5 - - - d#5 - - - | e5 - g5 - b5 - e6 - | e6 - d6 - c6 - g5 - | a5 - c6 - e6 - c6 - | b5 - - - - - . .' };
music.songs.aobetween = { bpm: 150, beats: 4, vol: 0.8, wet: 0.2, lead: 'pulse', bass: 'pulse16', acc: 'arp16', drums: 'fast', chords: 'C G Am F',
  mel: 'c6 . g5 . e5 . g5 . | b5 . g5 . d5 . g5 . | a5 . e5 . c5 . e5 . | f5 . a5 . c6 . f6 .' };
music.songs.aomicro = { bpm: 170, beats: 4, vol: 0.8, wet: 0.15, lead: 'fm', fmbass: 1, bass: 'pulse16', acc: 'arp16', drums: 'boss', chords: 'Am Am F G',
  mel: 'a5 . a5 c6 . a5 e6 . | d6 c6 b5 a5 g5 . e5 . | f5 . a5 c6 . f6 . e6 | d6 . b5 . g5 . b5 .' };
music.songs.aoboss = { bpm: 176, beats: 4, vol: 0.9, wet: 0.2, lead: 'fm', harm: 1, fmbass: 1, bass: 'drive', acc: 'organ', drums: 'industrial', chords: 'Dm Bb C A',
  mel: 'd5 . d5 f5 . a5 . d6 | bb5 . a5 . f5 . d5 . | c5 . e5 g5 . c6 . e6 | c#6 . a5 . e5 . c#5 .' };

KIT.start({ w: W, h: H, update: update, draw: draw, onPause: pauseMenu, pad: { four: true, btns: [{ k: 'a', label: 'A', cls: 'big' }] } });
titleMenu();
window.__ao = { G: G, get M() { return M; }, get run() { return run; }, MICRO: MICRO, BOSSG: BOSSG, newRun: newRun, startIntro: startIntro, step: function (n) { for (var i = 0; i < n; i++) { KIT.tick(); update(1 / 60); } },
  force: function (id) { var g = id === 'boss' ? BOSSG : MICRO.filter(function (m) { return m.id === id; })[0]; M = { g: g, t: 0, lv: 1, word: g.word }; g.init(M, 1); G.mode = 'micro'; } };
