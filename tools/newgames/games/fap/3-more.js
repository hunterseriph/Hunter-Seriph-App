/* =====================================================================================================
   THE FAP ROOMS, update 132 (his playtest: the torch drained too fast, too few batteries, not uncanny enough, not enough
   in it, more decorations). Each level now has its own furniture (solid props you walk round, laid against walls and
   never cutting anything off), writing and stains on the walls, puddles, hanging dead panels; spare batteries you carry
   (the torch swaps one in by itself), Almond Water for your head, and things that are wrong:
     a phone that rings somewhere (answer it), footsteps behind you that stop when you stop, a figure at the end of the
     hall that is gone when the torch finds it, the lights dying one by one towards you, your own name whispered, doors
     that open onto a wall, a room you have already been in (your own note on the floor), the EXIT sign saying STAY,
     the vending machine that gives you one thing and then has your face on the glass.
   ===================================================================================================== */
var PROPS = [], DECALS = [], DECOMESH = null, WEIRD = { t: 18, ev: null, watcher: null, steps: 0 };
/* props per level: [name, solid?, weight] */
var PROPSET = {
  rooms: [['chair', 1, 3], ['cooler', 1, 2], ['plant', 1, 2], ['vend', 1, 1], ['cab', 1, 3], ['desk', 1, 2], ['wetsign', 0, 3], ['phone', 1, 1], ['fakedoor', 0, 2], ['clock', 0, 2]],
  garage: [['shelf', 1, 5], ['pallet', 1, 3], ['barrel', 1, 3], ['cone', 0, 4], ['cab', 1, 1], ['fakedoor', 0, 2], ['phone', 1, 1]],
  maze: [['valve', 1, 3], ['tank', 1, 2], ['barrel', 1, 2], ['gauge', 0, 4], ['fakedoor', 0, 1]],
  pools: [['lounger', 1, 4], ['plant', 1, 2], ['float', 0, 4], ['lifeguard', 1, 1], ['wetsign', 0, 2], ['fakedoor', 0, 1]],
  party: [['ptable', 1, 4], ['present', 1, 4], ['balloons', 0, 5], ['speaker', 1, 2], ['chair', 1, 2], ['fakedoor', 0, 2], ['phone', 1, 1]],
  run: [['barrel', 1, 1]]
};
var WRITING = {
  rooms: ['YOU\'VE BEEN HERE BEFORE', 'DON\'T LOOK BEHIND YOU', 'IT HUMS IN F#', 'TB WAS HERE', 'NO WINDOWS', 'KEEP THE TORCH ON IT', 'WHO MADE THE COFFEE', 'EXIT  -->', '<--  EXIT', 'SAME ROOM SAME ROOM SAME ROOM', '=)', 'I FINISHED. IT DIDN\'T HELP.'],
  garage: ['LEVEL 1 OF ?', 'NO PARKING', 'IT SAW ME', 'STAY QUIET', 'COUNT THE PILLARS', 'THE LIGHTS LIE', 'TB WAS HERE'],
  maze: ['DON\'T RUN', 'THEY HEAR YOU', 'HOT', 'TURN BACK', 'IT\'S IN THE PIPES', 'DRINK THE WATER'],
  pools: ['NO DIVING', 'NO LIFEGUARD ON DUTY', 'THE WATER IS WARM', 'WHO IS SWIMMING', 'DEEP END'],
  party: ['=)', '=)', '=)', 'HAPPY BIRTHDAY', 'SMILE', 'YOU\'RE INVITED', 'DON\'T STOP DANCING', 'STEVE IS HERE', '=) =) =)'],
  run: ['RUN', 'RUN', 'RUN', 'FASTER', 'DON\'T LOOK BACK', 'ALMOST']
};
function pickW(list, rnd) { var t = 0; list.forEach(function (p) { t += p[2]; }); var r = rnd() * t; for (var i = 0; i < list.length; i++) { r -= list[i][2]; if (r <= 0) return list[i]; } return list[0]; }
/* laid after genLevel: against walls, never in a doorway, never cutting anything off (checked by a flood after each one) */
function placeDecor(rnd) {
  PROPS = []; DECALS = []; WEIRD = { t: 14 + rnd() * 10, ev: null, watcher: null, steps: 0, phone: null };
  var set = PROPSET[LV.gen] || PROPSET.rooms, want = Math.floor(MW * MH / (LV.gen === 'run' ? 400 : 26)), tries = 0, reach = countReach();
  var busy = {}; busy[idx(G.start.i, G.start.j)] = 1; busy[idx(EXIT.i, EXIT.j)] = 1; ITEMS.forEach(function (it) { busy[idx(tileOf(it.x), tileOf(it.z))] = 1; });
  while (PROPS.length < want && tries++ < want * 12) {
    var i = 1 + Math.floor(rnd() * (MW - 2)), j = 1 + Math.floor(rnd() * (MH - 2)), q = idx(i, j); if (K[q] !== 0 || busy[q]) continue;
    var wall = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(function (d) { return solid(i + d[0], j + d[1]); }); if (!wall.length || wall.length > 2) continue;
    var P0 = pickW(set, rnd), d = wall[0], pr = { i: i, j: j, k: P0[0], solid: P0[1], d: d, r: rnd() };
    if (pr.solid) { K[q] = 4; var now = countReach(); if (now < reach - 1) { K[q] = 0; continue; } reach = now; }
    busy[q] = 1; PROPS.push(pr); if (pr.k === 'phone' && !WEIRD.phone) WEIRD.phone = pr;
  }
  // writing on the walls and stains on the floor
  var words = WRITING[LV.gen] || WRITING.rooms;
  for (var n = 0; n < Math.floor(MW * MH / 40); n++) { var a = 1 + Math.floor(rnd() * (MW - 2)), b = 1 + Math.floor(rnd() * (MH - 2)); if (K[idx(a, b)] !== 0) continue; var ws = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(function (dd) { var t = inMap(a + dd[0], b + dd[1]) ? K[idx(a + dd[0], b + dd[1])] : 0; return t === 1 || t === 2; }); if (!ws.length) continue;
    var kind = rnd(); DECALS.push({ i: a, j: b, d: ws[0], k: kind < 0.5 ? 'w' + Math.floor(rnd() * words.length) + '_' + LV.gen : kind < 0.7 ? 'handprint' : kind < 0.85 ? 'smear' : 'face', h: 0.9 + rnd() * 0.9, o: (rnd() - 0.5) * 0.9 }); }
  for (n = 0; n < Math.floor(MW * MH / 30); n++) { var c = 1 + Math.floor(rnd() * (MW - 2)), e = 1 + Math.floor(rnd() * (MH - 2)); if (K[idx(c, e)] !== 0) continue; DECALS.push({ i: c, j: e, floor: 1, k: LV.gen === 'pools' ? 'puddle' : LV.gen === 'run' ? 'blood' : rnd() < 0.6 ? 'stain' : 'puddle', o: rnd() * 6.28, s: 0.5 + rnd() * 0.7 }); }
  for (n = 0; n < Math.floor(MW * MH / 70); n++) { var f = 1 + Math.floor(rnd() * (MW - 2)), h = 1 + Math.floor(rnd() * (MH - 2)); if (K[idx(f, h)] === 0 && LV.gen !== 'pools') DECALS.push({ i: f, j: h, ceil: 1, k: 'damp', o: rnd() * 6.28, s: 0.6 + rnd() * 0.8 }); }
  // more batteries and almond water, spread out (his ask: not enough batteries)
  var D = bfsFrom(G.start.i, G.start.j), far = []; for (var q2 = 0; q2 < MW * MH; q2++) if (D[q2] > 5 && K[q2] === 0 && !busy[q2]) far.push(q2);
  var extra = LV.gen === 'run' ? 2 : 7; for (n = 0; n < extra && far.length; n++) { var pick = far.splice(Math.floor(rnd() * far.length), 1)[0]; ITEMS.push({ x: tx(pick % MW), z: tx((pick / MW) | 0), k: n % 3 === 2 ? 'almond' : 'battery', n: 0 }); }
}
function countReach() { var D = bfsFrom(G.start.i, G.start.j), n = 0; for (var q = 0; q < D.length; q++) if (D[q] >= 0) n++; return n; }
/* the furniture is boxes painted with its own textures */
function bx(m, cx, cz, w, d, y0, y1, T, Tt, col) { var x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, c = col || [0.5, 0.5, 0.5], uv = [0, 1, 1, 1, 1, 0, 0, 0];
  m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], uv, T, c, [0, 0, 1]); m.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], uv, T, c, [0, 0, -1]);
  m.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], uv, T, c, [1, 0, 0]); m.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], uv, T, c, [-1, 0, 0]);
  m.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 1, 1, 1, 0, 0, 0], Tt || T, c, [0, 1, 0]); }
/* a flat picture standing against the wall the prop backs onto, facing out */
function wallPic(m, i, j, d, w, y0, y1, T, out, glow) { var cx = tx(i) + d[0] * (TSZ / 2 - out), cz = tx(j) + d[1] * (TSZ / 2 - out), sx = -d[1], sz = d[0];
  m.quad([cx + sx * w, y0, cz + sz * w], [cx - sx * w, y0, cz - sz * w], [cx - sx * w, y1, cz - sz * w], [cx + sx * w, y1, cz + sz * w], [0, 1, 1, 1, 1, 0, 0, 0], T, [0.5, 0.5, 0.5], [-d[0], 0, -d[1]], glow || 0); }
function buildDecor(m) {
  PROPS.forEach(function (p) { var x = tx(p.i), z = tx(p.j), d = p.d, bxp = x + d[0] * 0.55, bzp = z + d[1] * 0.55, along = d[0] ? 'z' : 'x';
    function B(w, dd, y0, y1, t, tt, ox, oz) { var W2 = d[0] ? dd : w, D2 = d[0] ? w : dd; bx(m, bxp + (ox || 0), bzp + (oz || 0), W2, D2, y0, y1, TL(t), tt ? TL(tt) : null); }
    switch (p.k) {
      case 'chair': bx(m, x, z, 0.55, 0.55, 0.42, 0.5, TL('fabric')); bx(m, x + d[0] * 0.22, z + d[1] * 0.22, d[0] ? 0.08 : 0.55, d[0] ? 0.55 : 0.08, 0.5, 1.1, TL('fabric')); bx(m, x, z, 0.08, 0.08, 0.06, 0.42, TL('metal')); bx(m, x, z, 0.5, 0.06, 0.02, 0.07, TL('metal')); bx(m, x, z, 0.06, 0.5, 0.02, 0.07, TL('metal')); break;
      case 'cooler': B(0.4, 0.4, 0, 1.0, 'plastic'); bx(m, bxp, bzp, 0.3, 0.3, 1.0, 1.45, TL('bottle')); break;
      case 'plant': bx(m, x, z, 0.4, 0.4, 0, 0.45, TL('pot')); bx(m, x, z, 0.7, 0.7, 0.45, 1.5, TL('leaves')); break;
      case 'vend': B(1.0, 0.8, 0, 2.0, 'metal'); wallPic(m, p.i, p.j, d, 0.48, 0.15, 1.95, TL('vend'), 0.96, 0.25); break;
      case 'cab': B(0.6, 0.6, 0, 1.3, 'cabinet'); break;
      case 'desk': B(1.6, 0.8, 0.7, 0.78, 'wood'); B(0.08, 0.7, 0, 0.7, 'wood', null, d[0] ? 0 : -0.7, d[0] ? -0.7 : 0); B(0.08, 0.7, 0, 0.7, 'wood', null, d[0] ? 0 : 0.7, d[0] ? 0.7 : 0); bx(m, bxp, bzp, 0.45, 0.35, 0.78, 1.1, TL('monitor')); break;
      case 'phone': B(0.6, 0.5, 0, 0.75, 'wood'); bx(m, bxp, bzp, 0.3, 0.22, 0.75, 0.85, TL('phonetex')); break;
      case 'clock': wallPic(m, p.i, p.j, d.map(function (v) { return -v; }), 0.3, 1.8, 2.4, TL('clock'), -0.02); break;
      case 'fakedoor': wallPic(m, p.i, p.j, d.map(function (v) { return -v; }), 0.55, 0, 2.1, TL('door'), -0.02); break;
      case 'shelf': B(2.0, 0.6, 0, 2.4, 'shelf', 'metal'); break;
      case 'pallet': bx(m, x, z, 1.1, 1.1, 0, 0.15, TL('wood')); bx(m, x, z, 0.9, 0.9, 0.15, 0.9 + p.r * 0.6, TL('crate')); break;
      case 'barrel': bx(m, x, z, 0.6, 0.6, 0, 0.95, TL('barrel'), TL('barreltop')); break;
      case 'cone': break;
      case 'valve': B(0.5, 0.5, 0, 1.2, 'rust'); bx(m, bxp - d[0] * 0.3, bzp - d[1] * 0.3, 0.5, 0.5, 1.0, 1.1, TL('red')); break;
      case 'tank': B(1.2, 1.0, 0, 2.2, 'rust'); break;
      case 'gauge': wallPic(m, p.i, p.j, d.map(function (v) { return -v; }), 0.25, 1.3, 1.8, TL('gaugetex'), -0.02); break;
      case 'lounger': B(0.7, 1.8, 0.25, 0.4, 'lounger'); B(0.7, 0.3, 0.4, 0.9, 'lounger'); break;
      case 'lifeguard': B(0.8, 0.8, 1.4, 1.5, 'white'); B(0.08, 0.08, 0, 1.4, 'white'); break;
      case 'ptable': bx(m, x, z, 1.0, 1.0, 0.72, 0.8, TL('cloth')); bx(m, x, z, 0.12, 0.12, 0, 0.72, TL('metal')); bx(m, x, z, 0.45, 0.45, 0.8, 1.05, TL('cake'), TL('caketop')); break;
      case 'present': bx(m, x, z, 0.6 + p.r * 0.3, 0.6, 0, 0.5 + p.r * 0.4, TL('present')); bx(m, x + 0.2, z - 0.1, 0.35, 0.35, 0.5 + p.r * 0.4, 0.8 + p.r * 0.4, TL('present2')); break;
      case 'speaker': B(0.7, 0.6, 0, 1.6, 'speakertex', 'black'); break;
    }
  });
}
/* billboards and see-through things, rebuilt as you go round (cheap: only near ones) */
function decoDyn(m) {
  PROPS.forEach(function (p) { var x = tx(p.i), z = tx(p.j); if (Math.abs(x - P.x) > 20 || Math.abs(z - P.z) > 20) return;
    if (p.k === 'wetsign') bill(m, x, 0.4, z, 0.3, 0.4, TL('wetsign'), [0.5, 0.5, 0.5]);
    else if (p.k === 'cone') bill(m, x, 0.32, z, 0.25, 0.32, TL('conetex'), [0.5, 0.5, 0.5]);
    else if (p.k === 'balloons') bill(m, x, 1.6 + Math.sin(G.t + p.r * 6) * 0.08, z, 0.55, 0.55, TL('balloon'), [0.55, 0.55, 0.55]);
    else if (p.k === 'float') bill(m, x, 0.18, z, 0.45, 0.3, TL('floattex'), [0.5, 0.5, 0.5]);
  });
  if (WEIRD.watcher) { var w = WEIRD.watcher; bill(m, w.x, 1.0, w.z, 0.45, 1.0, TL('watcher'), [0.5, 0.5, 0.5]); }
}
function buildDecals() {
  var m = new R3.Mesh();
  DECALS.forEach(function (D) { var x = tx(D.i), z = tx(D.j);
    if (D.floor || D.ceil) { var s = D.s, y = D.ceil ? WH - 0.01 : 0.01, c = Math.cos(D.o) * s, n = Math.sin(D.o) * s, T = TL(D.k);
      if (D.ceil) m.quad([x - c, y, z - n], [x - n, y, z + c], [x + c, y, z + n], [x + n, y, z - c], [0, 0, 1, 0, 1, 1, 0, 1], T, [0.5, 0.5, 0.5], [0, -1, 0]);
      else m.quad([x - c, y, z - n], [x + n, y, z - c], [x + c, y, z + n], [x - n, y, z + c], [0, 0, 1, 0, 1, 1, 0, 1], T, [0.5, 0.5, 0.5], [0, 1, 0]); return; }
    var d = D.d, cx = x + d[0] * (TSZ / 2 - 0.02), cz = z + d[1] * (TSZ / 2 - 0.02), sx = -d[1], sz = d[0], wd = D.k[0] === 'w' ? 0.95 : 0.4, ht = D.k[0] === 'w' ? 0.48 : 0.4, h = D.h, o = D.o;
    // u = 0 on the viewer's left (looking at the wall from inside the room)
    m.quad([cx + sx * (o + wd), h - ht, cz + sz * (o + wd)], [cx + sx * (o - wd), h - ht, cz + sz * (o - wd)], [cx + sx * (o - wd), h + ht, cz + sz * (o - wd)], [cx + sx * (o + wd), h + ht, cz + sz * (o + wd)], [0, 1, 1, 1, 1, 0, 0, 0], TL(D.k), [0.5, 0.5, 0.5], [-d[0], 0, -d[1]]);
  });
  return m.upload();
}
/* the things that are wrong */
function profName() { try { var p = window.HSProfile && HSProfile.get && HSProfile.get(); if (p && p.name) return p.name.toUpperCase(); } catch (e) {} return 'CUMHEAD'; }
function stepUncanny(dt) {
  if (LV.gen === 'run') return; var W2 = WEIRD;
  // footsteps behind you that stop when you stop
  var moving = KIT.stick(0).x || KIT.stick(0).y; if (W2.ev === 'steps') { W2.et -= dt; if (moving) { W2.sb = (W2.sb || 0) + dt; if (W2.sb > 0.62) { W2.sb = 0; sfx.noise(0.05, 0.03, 900); } } if (W2.et <= 0) { W2.ev = null; if (!moving) msg('...THEY STOPPED WHEN YOU DID.', '#a6968f'); } }
  if (W2.ev === 'ring') { W2.et -= dt; W2.rt = (W2.rt || 0) - dt; var pd = Math.hypot(tx(W2.phone.i) - P.x, tx(W2.phone.j) - P.z); if (W2.rt <= 0) { W2.rt = 2.2; var v = Math.max(0.01, 0.12 - pd * 0.004); sfx.tone('square', 900, 900, 0.35, v); sfx.tone('square', 1100, 1100, 0.35, v * 0.8, 0.4); }
    if (pd < 1.8) { G.prompt = 'A  ANSWER THE PHONE'; if (KIT.pressed('a')) { W2.ev = null; var lines = ['"Are you still in the chair?"', '"You left the tab open. Everyone can see."', '"Hello? ' + profName() + '? We can hear the hum from here."', '"Don\'t go to the exit. That\'s how it gets you."', '"...breathing..."', '"Suck your own and fuck your own." (click)']; G.note = lines[Math.floor(Math.random() * lines.length)]; G.noteT = 5; P.san = Math.max(0, P.san - 6); sfx.play('tick'); } }
    if (W2.et <= 0) W2.ev = null; }
  if (W2.ev === 'cascade') { W2.et -= dt; if (W2.et <= 0) { var lit = LIGHTS.filter(function (L) { return !L.dead && !L.exit && Math.hypot(tx(L.i) - P.x, tx(L.j) - P.z) < 18; }).sort(function (a, b) { return Math.hypot(tx(b.i) - P.x, tx(b.j) - P.z) - Math.hypot(tx(a.i) - P.x, tx(a.j) - P.z); }); if (lit.length) { lit[0].dead = 1; W2.dead.push(lit[0]); sfx.noise(0.08, 0.05, 3000); W2.et = 0.45; if (W2.dead.length > 6) W2.ev = 'relight', W2.et = 6; } else W2.ev = null; } }
  if (W2.ev === 'relight') { W2.et -= dt; if (W2.et <= 0) { W2.dead.forEach(function (L) { L.dead = 0; }); W2.ev = null; } }
  if (W2.watcher) { var w = W2.watcher, ddx = w.x - P.x, ddz = w.z - P.z, dd = Math.hypot(ddx, ddz), facing = (Math.sin(P.a) * ddx + Math.cos(P.a) * ddz) / (dd || 1); w.t -= dt;
    if ((facing > 0.9 && P.torch && P.bat > 0 && dd < 16) || dd < 4 || w.t <= 0) { W2.watcher = null; if (facing > 0.9 && dd < 16) { P.san = Math.max(0, P.san - 5); sfx.tone('sine', 220, 110, 0.6, 0.04); } } }
  W2.t -= dt; if (W2.t > 0 || W2.ev) return; W2.t = 22 + Math.random() * 25;
  var opts = ['steps', 'name', 'watcher', 'cascade', 'sign', 'knock']; if (W2.phone) opts.push('ring', 'ring'); var ev = opts[Math.floor(Math.random() * opts.length)];
  if (ev === 'steps') { W2.ev = 'steps'; W2.et = 9; }
  else if (ev === 'ring') { W2.ev = 'ring'; W2.et = 26; W2.rt = 0; msg('A PHONE IS RINGING SOMEWHERE.', '#a6968f'); }
  else if (ev === 'cascade') { W2.ev = 'cascade'; W2.et = 0.2; W2.dead = []; }
  else if (ev === 'name') { var nm = profName(); msg(nm.toLowerCase().split('').join(' ') + ' . . .', '#c04aff'); for (var k = 0; k < 6; k++) sfx.noise(0.15, 0.012, 400 + k * 90); P.san = Math.max(0, P.san - 4); }
  else if (ev === 'knock') { for (var k2 = 0; k2 < 3; k2++) sfx.tone('sine', 90, 60, 0.12, 0.12, k2 * 0.35); msg('KNOCK KNOCK KNOCK', '#a6968f'); }
  else if (ev === 'sign') { G.stay = 6; }
  else if (ev === 'watcher') { // a figure stands far down a hall you are looking along
    for (var t = 0; t < 30; t++) { var dist = 9 + Math.random() * 7, a = P.a + (Math.random() - 0.5) * 0.5, x = P.x + Math.sin(a) * dist, z = P.z + Math.cos(a) * dist; if (!solid(tileOf(x), tileOf(z)) && canSee(P.x, P.z, x, z)) { W2.watcher = { x: x, z: z, t: 7 }; break; } } }
}
/* A on a prop: the phone, the fake doors, the vending machine */
function useProp() {
  var near = null, bd = 1.6; PROPS.forEach(function (p) { var dd = Math.hypot(tx(p.i) - P.x, tx(p.j) - P.z); if (dd < bd) { bd = dd; near = p; } }); if (!near) return false;
  if (near.k === 'fakedoor') { if (near.used) { msg('JUST WALL. IT WAS ALWAYS WALL.', '#a6968f'); return true; } near.used = 1; sfx.play('door'); if (Math.random() < 0.5) { msg('THE DOOR OPENS ONTO BRICK.', '#a6968f'); P.san = Math.max(0, P.san - 6); } else { msg('THE DOOR OPENS ONTO YOU, STANDING THERE, LOOKING BACK.', '#ff2630'); P.san = Math.max(0, P.san - 14); P.scare = 0.8; jump(); } return true; }
  if (near.k === 'vend') { if (near.used) { msg('YOUR FACE IS ON THE GLASS. IT IS SMILING. YOU ARE NOT.', '#c04aff'); P.san = Math.max(0, P.san - 3); return true; } near.used = 1; sfx.play('coin'); var g = ['almond', 'battery', 'cuppa'][Math.floor(Math.random() * 3)]; ITEMS.push({ x: P.x, z: P.z, k: g, n: 0 }); msg('THE MACHINE DROPS SOMETHING. YOU DIDN\'T PAY.', '#ffe36a'); return true; }
  if (near.k === 'clock') { msg('THE CLOCK HAS NO HANDS. IT IS STILL TICKING.', '#a6968f'); return true; }
  if (near.k === 'phone' && WEIRD.ev !== 'ring') { msg('DEAD LINE. SOMEONE IS BREATHING ON IT ANYWAY.', '#a6968f'); return true; }
  return false;
}
/* your bag (the pause screen is an inventory now) */
function bagMenu() { if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {}
  var found = Object.keys(SV.notes).length;
  KIT.inv({ title: LV.n + ': ' + LV.name, cols: 4, min: 8, tabs: [{ label: 'BAG', on: true, fn: bagMenu }, { label: 'NOTES', fn: function () { notesMenu(true); } }, { label: 'SYSTEM', fn: sysMenu }],
    slots: [{ spr: null, draw: hiIcon('battery'), name: 'Torch', desc: P.torch ? 'On. ' + Math.round(P.bat) + '% left. X turns it off.' : 'Off. X turns it on.', count: Math.round(P.bat) + '%', act: P.torch ? 'TURN OFF' : 'TURN ON', fn: function () { P.torch = P.torch ? 0 : 1; bagMenu(); } },
      P.batts ? { draw: hiIcon('battery'), name: 'Spare Batteries', desc: 'The torch swaps one in by itself when it dies. Or put one in now.', count: P.batts, act: 'PUT ONE IN', dis: P.bat > 90, fn: function () { P.batts--; P.bat = 100; sfx.play('tick'); bagMenu(); } } : null,
      P.cups ? { draw: hiIcon('cuppa'), name: 'Cumpuccino', desc: 'Warm. Too warm. +40 sanity, +25 health.', count: P.cups, act: 'DRINK', fn: function () { P.cups--; P.san = Math.min(100, P.san + 40); P.hp = Math.min(100, P.hp + 25); sfx.play('pour'); bagMenu(); } } : null,
      P.almond ? { draw: hiIcon('almond'), name: 'Almond Water', desc: 'Tastes of almonds and nothing. Your head clears. +30 sanity.', count: P.almond, act: 'DRINK', fn: function () { P.almond--; P.san = Math.min(100, P.san + 30); sfx.play('pour'); bagMenu(); } } : null,
      { draw: hiIcon('note'), name: 'Notes', desc: found + ' of ' + NOTES.length + ' found. Someone was here before you.', count: found, act: 'READ', fn: function () { notesMenu(true); } }].filter(Boolean),
    stats: [['HEALTH', Math.round(P.hp)], ['SANITY', Math.round(P.san)], ['DEATHS', SV.deaths]], close: KIT.closeMenu }); }
function hiIcon(k) { return function (g, w, h) { var T = ATL && ATL.tile ? null : null; var c = document.createElement('canvas'); c.width = c.height = 64; HIPAINT[k](c.getContext('2d'), function () { return Math.random(); }); g.imageSmoothingEnabled = true; g.drawImage(c, 0, 0, w, h); }; }
function sysMenu() { KIT.menu({ cls: 'clear', title: 'Paused', sub: LV.n + ': ' + LV.name, items: [{ label: 'CARRY ON', def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }, { label: 'QUIT', fn: titleMenu }, { label: 'BACK', back: true, fn: bagMenu }] }); }
/* textures for all of it */
(function () {
  var A = {
    fabric: function (p) { p.fill('#3a3a4a'); p.speck(['#2a2a3a', '#4a4a5a'], 260); }, metal: function (p) { p.fill('#7a7a80'); p.speck(['#6a6a70', '#8a8a90'], 120); p.rect(0, 0, 32, 1, '#a0a0a8'); },
    plastic: function (p) { p.fill('#d8d4c8'); p.speck(['#c8c4b8', '#e0dcd0'], 80); p.rect(4, 8, 24, 10, '#a8a498'); }, bottle: function (p) { p.fill('#7ab8d8'); p.rect(0, 4, 32, 2, '#a8d8f0'); p.speck(['#6aa8c8'], 60); },
    pot: function (p) { p.fill('#8a4a2a'); p.rect(0, 0, 32, 4, '#6a3018'); }, leaves: function (p) { p.fill('#2a4a1a'); p.speck(['#3a6a24', '#1a3a10', '#4a7a2a'], 300); },
    cabinet: function (p) { p.fill('#8a8a7a'); for (var y = 2; y < 32; y += 10) { p.rect(2, y, 28, 8, '#9a9a8a'); p.rect(13, y + 3, 6, 2, '#5a5a4a'); } }, wood: function (p) { p.fill('#6a4a2a'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 1, '#5a3a1e'); p.speck(['#7a5a34'], 60); },
    monitor: function (p) { p.fill('#2a2a2a'); p.rect(3, 3, 26, 20, '#0a1a0a'); p.rect(5, 6, 10, 1, '#3aff4a'); p.rect(5, 9, 16, 1, '#3aff4a'); }, phonetex: function (p) { p.fill('#c8b878'); p.rect(4, 4, 24, 10, '#2a2a2a'); },
    shelf: function (p) { p.fill('#3a3a3e'); for (var y = 0; y < 32; y += 11) { p.rect(0, y, 32, 2, '#e8a020'); for (var x = 1; x < 32; x += 9) p.rect(x, y + 3, 7, 7, ['#a8844a', '#8a6a3a', '#c89a5a'][(x + y) % 3]); } },
    crate: function (p) { p.fill('#a8844a'); p.rect(0, 0, 32, 2, '#6a4a2a'); p.rect(0, 30, 32, 2, '#6a4a2a'); p.rect(0, 0, 2, 32, '#6a4a2a'); p.rect(30, 0, 2, 32, '#6a4a2a'); for (var i = 0; i < 30; i++) p.px(i + 1, i + 1, '#6a4a2a'); },
    barrel: function (p) { p.fill('#2a5a8a'); p.rect(0, 5, 32, 2, '#1a3a5a'); p.rect(0, 25, 32, 2, '#1a3a5a'); p.speck(['#3a6a9a'], 60); }, barreltop: function (p) { p.fill('#1a3a5a'); p.rect(8, 8, 16, 16, '#2a4a6a'); },
    rust: function (p) { p.fill('#5a3a2a'); p.speck(['#7a4a2a', '#4a2a1a', '#8a5a3a'], 260); p.rect(0, 10, 32, 2, '#3a2418'); }, red: function (p) { p.fill('#a8141e'); },
    lounger: function (p) { p.fill('#f0f0f0'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 4, 32, '#4ab8c8'); }, white: function (p) { p.fill('#e8e8e0'); },
    cloth: function (p) { p.fill('#e8d8e0'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 4, 32, '#ff8ab8'); }, cake: function (p) { p.fill('#f8f0e0'); p.rect(0, 10, 32, 3, '#ff6a9a'); p.rect(0, 20, 32, 3, '#ff6a9a'); }, caketop: function (p) { p.fill('#fff8f0'); p.rect(14, 10, 2, 8, '#4adfff'); p.rect(14, 8, 2, 2, '#ffe36a'); },
    present: function (p) { p.fill('#c4121c'); p.rect(14, 0, 4, 32, '#ffe36a'); p.rect(0, 14, 32, 4, '#ffe36a'); }, present2: function (p) { p.fill('#4adfff'); p.rect(14, 0, 4, 32, '#ff6a9a'); },
    speakertex: function (p) { p.fill('#1a1a1a'); p.rect(8, 4, 16, 10, '#2a2a2a'); p.rect(12, 7, 8, 4, '#0a0a0a'); p.rect(6, 17, 20, 13, '#2a2a2a'); p.rect(11, 20, 10, 7, '#0a0a0a'); },
  };
  Object.keys(A).forEach(function (k) { if (!PAINT[k]) PAINT[k] = A[k]; });
  function txt(s, col, size) { return function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = col; g.font = 'bold ' + size + 'px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; var lines = s.length > 9 ? s.split(' ').reduce(function (a, w) { var l = a[a.length - 1]; if ((l + ' ' + w).length > 10 && l) a.push(w); else a[a.length - 1] = (l ? l + ' ' : '') + w; return a; }, ['']) : [s]; lines = lines.slice(0, 4); var sz = Math.min(size, Math.floor(60 / Math.max(3, lines.reduce(function (m, l) { return Math.max(m, l.length); }, 0)) * 1.7)); g.font = 'bold ' + sz + 'px monospace'; lines.forEach(function (l, i) { g.globalAlpha = 0.85; g.fillText(l, 32 + (Math.random() - 0.5) * 2, 32 + (i - (lines.length - 1) / 2) * sz * 1.05); for (var d = 0; d < 3; d++) g.fillRect(8 + Math.random() * 48, 32 + (i - (lines.length - 1) / 2) * sz * 1.05 + sz * 0.4, 1, 2 + Math.random() * 7); }); g.globalAlpha = 1; }; }
  var H2 = {
    handprint: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(120,10,16,0.85)'; g.beginPath(); g.ellipse(32, 40, 11, 13, 0, 0, 6.3); g.fill(); [[-12, -10], [-5, -16], [3, -17], [10, -13], [16, -2]].forEach(function (f) { g.beginPath(); g.ellipse(32 + f[0], 32 + f[1], 3, 8, f[0] * 0.04, 0, 6.3); g.fill(); }); for (var i = 0; i < 4; i++) g.fillRect(24 + i * 5, 50, 2, 6 + i * 3); },
    smear: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(60,40,20,0.55)'; for (var i = 0; i < 40; i++) g.fillRect(8 + i, 26 + Math.sin(i * 0.3) * 6, 3, 10 + Math.random() * 6); },
    face: function (g) { g.clearRect(0, 0, 64, 64); g.strokeStyle = 'rgba(30,20,10,0.7)'; g.lineWidth = 2; g.beginPath(); g.ellipse(22, 24, 4, 6, 0, 0, 6.3); g.stroke(); g.beginPath(); g.ellipse(42, 24, 4, 6, 0, 0, 6.3); g.stroke(); g.beginPath(); g.moveTo(12, 38); g.quadraticCurveTo(32, 58, 52, 38); g.stroke(); },
    stain: function (g) { g.clearRect(0, 0, 64, 64); var r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(50,36,10,0.55)'); r.addColorStop(0.7, 'rgba(60,44,14,0.35)'); r.addColorStop(1, 'rgba(60,44,14,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); },
    puddle: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(160,200,210,0.35)'; g.beginPath(); g.ellipse(32, 32, 28, 18, 0.3, 0, 6.3); g.fill(); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(18, 26, 14, 2); },
    blood: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(110,0,8,0.8)'; g.beginPath(); g.ellipse(32, 32, 22, 14, 0.4, 0, 6.3); g.fill(); for (var i = 0; i < 8; i++) { g.beginPath(); g.arc(8 + Math.random() * 48, 8 + Math.random() * 48, 2 + Math.random() * 3, 0, 6.3); g.fill(); } },
    damp: function (g) { g.clearRect(0, 0, 64, 64); var r = g.createRadialGradient(32, 32, 4, 32, 32, 30); r.addColorStop(0, 'rgba(90,70,20,0.5)'); r.addColorStop(0.8, 'rgba(110,90,30,0.25)'); r.addColorStop(1, 'rgba(110,90,30,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(70,50,10,0.5)'; g.beginPath(); g.arc(32, 32, 22, 0, 6.3); g.stroke(); },
    vend: function (g) { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#c8e8ff'; g.fillRect(4, 4, 40, 52); for (var y = 0; y < 5; y++) for (var x = 0; x < 4; x++) { g.fillStyle = ['#c4121c', '#ffe36a', '#4adfff', '#f1e0b0'][(x + y) % 4]; g.fillRect(7 + x * 9, 7 + y * 10, 6, 7); } g.fillStyle = '#3a3a44'; g.fillRect(48, 10, 12, 20); g.fillStyle = '#ff2630'; g.fillRect(50, 34, 8, 3); g.fillStyle = '#000'; g.fillRect(8, 58, 32, 4); },
    clock: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#e8e4d8'; g.beginPath(); g.arc(32, 32, 26, 0, 6.3); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#1a1a1a'; for (var i = 0; i < 12; i++) g.fillRect(32 + Math.cos(i * 0.52) * 21 - 1, 32 + Math.sin(i * 0.52) * 21 - 1, 3, 3); },
    gaugetex: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#c8b878'; g.beginPath(); g.arc(32, 32, 24, 0, 6.3); g.fill(); g.fillStyle = '#f0e8d0'; g.beginPath(); g.arc(32, 32, 19, 0, 6.3); g.fill(); g.strokeStyle = '#c4121c'; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 32); g.lineTo(46, 22); g.stroke(); },
    wetsign: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#ffd820'; g.beginPath(); g.moveTo(16, 62); g.lineTo(24, 4); g.lineTo(40, 4); g.lineTo(48, 62); g.fill(); g.fillStyle = '#1a1a1a'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('CAUTION', 32, 24); g.fillText('WET', 32, 36); g.fillText('FLOOR', 32, 46); },
    conetex: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#ff6a1a'; g.beginPath(); g.moveTo(14, 58); g.lineTo(29, 4); g.lineTo(35, 4); g.lineTo(50, 58); g.fill(); g.fillStyle = '#f0f0f0'; g.fillRect(22, 22, 20, 6); g.fillRect(19, 38, 26, 6); g.fillStyle = '#2a2a2a'; g.fillRect(8, 56, 48, 6); },
    floattex: function (g) { g.clearRect(0, 0, 64, 64); g.strokeStyle = '#ff6a1a'; g.lineWidth = 12; g.beginPath(); g.ellipse(32, 36, 22, 14, 0, 0, 6.3); g.stroke(); g.strokeStyle = '#f0f0f0'; g.lineWidth = 12; g.beginPath(); g.ellipse(32, 36, 22, 14, 0, 0.4, 1.2); g.stroke(); g.beginPath(); g.ellipse(32, 36, 22, 14, 0, 3.5, 4.3); g.stroke(); },
    watcher: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = 'rgba(0,0,0,0.92)'; g.beginPath(); g.ellipse(32, 9, 6, 8, 0, 0, 6.3); g.fill(); g.fillRect(25, 16, 14, 26); g.fillRect(21, 17, 4, 26); g.fillRect(39, 17, 4, 26); g.fillRect(26, 42, 5, 22); g.fillRect(33, 42, 5, 22); g.fillStyle = '#fff'; g.fillRect(29, 8, 2, 1); g.fillRect(34, 8, 2, 1); },
    almond: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#e8f4ff'; g.fillRect(24, 16, 16, 40); g.fillStyle = '#c8b090'; g.fillRect(24, 28, 16, 14); g.fillStyle = '#4a7aaa'; g.fillRect(27, 8, 10, 8); g.fillStyle = '#6a4a2a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('ALMOND', 32, 37); }
  };
  Object.keys(H2).forEach(function (k) { if (!HIPAINT[k]) HIPAINT[k] = H2[k]; });
  Object.keys(WRITING).forEach(function (lv) { WRITING[lv].forEach(function (s, i) { var key = 'w' + i + '_' + lv; HIPAINT[key] = txt(s, lv === 'party' ? 'rgba(200,20,90,0.9)' : lv === 'run' ? 'rgba(160,0,10,0.95)' : lv === 'pools' ? 'rgba(20,70,90,0.8)' : 'rgba(40,24,10,0.85)', 16); }); });
  HIPAINT.stay = function (g) { g.fillStyle = '#2a0a0a'; g.fillRect(0, 16, 64, 32); g.fillStyle = '#ff2630'; g.font = 'bold 22px monospace'; g.textAlign = 'center'; g.fillText('STAY', 32, 40); };
})();
