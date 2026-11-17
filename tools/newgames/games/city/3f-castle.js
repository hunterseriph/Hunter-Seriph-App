/* ---------- update 157 (his ask: the places you visit like the castle need to be enterable, fixed and resized).
   Both castles are rebuilt at castle size: a 96 m curtain wall with a walkway of merlons, round corner towers, wall
   towers, a gatehouse with an arched passage you drive through, and inside the bailey a keep with four turrets and a
   great tower, stables, barracks, a well, training dummies, carts, banners and torches. The ground under them is made
   level first (the walls stood on the slope), the courtyard is cobbles and the land round the walls is grass with an
   approach road, so it is no longer a castle on a giant car park. The keep's door, the grotto's cave mouth and the
   chapel's door now go inside (7h-places.js). Blumhead's Castle is the black, purple and goo version. ---------- */
var CASTLE_R = 46;
(function castleGround() {
  POIS.forEach(function (p) { if (p.k !== 'castle') return; var R = CASTLE_R, ci = Math.floor(p.x / CT), cj = Math.floor(p.z / CT), id = DM[cj * MW + ci], rt = Math.ceil((R + 70) / CT);
    // update 158 (his ask: still ramps near the castles): level under the walls, then eased out into the hill over 50 m
    for (var j = cj - rt; j <= cj + rt + 1; j++) for (var i = ci - rt; i <= ci + rt + 1; i++) { if (i < 0 || j < 0 || i > MW || j > MH) continue; var dx = i * CT - p.x, dz = j * CT - p.z, d = Math.max(Math.abs(dx), Math.abs(dz)), u = clamp((d - R - 12) / 50, 0, 1); u = u * u * (3 - 2 * u); var q = j * (MW + 1) + i; CH[q] = p.h + (CH[q] - p.h) * u; }
    rt = Math.ceil((R + 30) / CT);
    for (var j2 = cj - rt; j2 <= cj + rt; j2++) for (var i2 = ci - rt; i2 <= ci + rt; i2++) { var t = j2 * MW + i2; if (DM[t] !== id) continue; var x = i2 * CT + 2 - p.x, z = j2 * CT + 2 - p.z, dd = Math.max(Math.abs(x), Math.abs(z));
      if (KM[t] === K_ROAD || KM[t] === K_BRIDGE) continue;
      if (dd < R - 1) KM[t] = K_YARD; else if (Math.abs(x) < 6 && z > 0) KM[t] = K_PAVE; else KM[t] = p.dark ? K_DIRT : K_GRASS; } });
})();
LMBUILD.castle = function (o, p) {
  var y = p.h, dark = p.dark, tex = dark ? 'darkstone' : 'stone', R = CASTLE_R, cone = dark ? '#3a0a2a' : '#8a1a20', win = dark ? 'litwin2' : 'litwin', gate = 6, X = p.x, Z = p.z, trim = dark ? '#2a2228' : '#7a746e', ban = dark ? '#3a0a4a' : '#8a0c14';
  // the curtain wall, the gate in the south side
  var C = [[-R, -R], [R, -R], [R, R], [-R, R]];
  for (var k = 0; k < 4; k++) { var a = C[k], b = C[(k + 1) % 4]; if (k === 2) { wallRun(o.m, X + a[0], Z + a[1], X + gate, Z + b[1], y, 13, 3, tex, 1); wallRun(o.m, X - gate, Z + b[1], X + b[0], Z + b[1], y, 13, 3, tex, 1); }
    else wallRun(o.m, X + a[0], Z + a[1], X + b[0], Z + b[1], y, 13, 3, tex, 1); towerAt(o.m, X + a[0], Z + a[1], y, 5.5, 22, tex, cone, win, o.glow); }
  // towers half way along the other three sides
  [[0, -R], [-R, 0], [R, 0]].forEach(function (q) { towerAt(o.m, X + q[0], Z + q[1], y, 4.2, 18, tex, cone, win, o.glow); });
  // the gatehouse: two towers and the arch over the way in (only the towers are solid, you drive under the arch)
  [-1, 1].forEach(function (s) { towerAt(o.m, X + s * (gate + 3.5), Z + R, y, 4.5, 20, tex, cone, win, o.glow); });
  boxT(o.m, X - gate, y + 9, Z + R - 3, X + gate, y + 17, Z + R + 3, { wall: tex, top: tex }); for (var u = -gate + 0.6; u < gate; u += 2.2) boxC(o.m, X + u - 0.5, y + 17, Z + R + 2, X + u + 0.5, y + 18.2, Z + R + 3, trim);
  for (var q2 = 0; q2 < 9; q2++) tub(o.m, [X - gate + 0.6 + q2 * 1.35, y + 7.6, Z + R + 1.8], [X - gate + 0.6 + q2 * 1.35, y + 9, Z + R + 1.8], 0.08, 0.08, '#2a2a2e', 4); // the portcullis, raised
  [-1, 1].forEach(function (s) { boxC(o.m, X + s * (gate - 0.3), y + 3.8, Z + R + 3.05, X + s * (gate - 0.3) + 0.12 * s, y + 4.4, Z + R + 3.3, '#2a2a2a'); ell(o.glow, X + s * (gate - 0.3), y + 4.8, Z + R + 3.3, 0.25, 0.4, 0.25, '#ffb030', 6, 4);
    standQ(o.m, X + s * (gate + 3.5), Z + R + 4.6, 0, 2.2, y + 8, y + 16, TL('velvet'), 1.1, 0.2); });
  // the keep: a big block, four turrets, the great tower in the middle, a door with steps
  var kx0 = X - 16, kx1 = X + 16, kz0 = Z - R + 8, kz1 = Z - 8, KH = 22;
  boxT(o.m, kx0, y, kz0, kx1, y + KH, kz1, { wall: tex, top: tex, u: 4, v: 4 }); addBox(kx0, kz0, kx1, kz1, y - 2, y + KH);
  for (var u3 = kx0 + 0.8; u3 < kx1; u3 += 2.2) { boxC(o.m, u3 - 0.5, y + KH, kz1 - 0.6, u3 + 0.5, y + KH + 1.2, kz1, trim); boxC(o.m, u3 - 0.5, y + KH, kz0, u3 + 0.5, y + KH + 1.2, kz0 + 0.6, trim); }
  [[kx0, kz0], [kx1, kz0], [kx0, kz1], [kx1, kz1]].forEach(function (q) { towerAt(o.m, q[0], q[1], y, 3.2, KH + 6, tex, cone, win, o.glow); });
  towerAt(o.m, X, (kz0 + kz1) / 2, y + KH, 6, 12, tex, cone, win, o.glow);
  for (var wx = -12; wx <= 12; wx += 6) if (wx) { standQ(o.glow, X + wx, kz1 + 0.06, 0, 1.4, y + 9, y + 12, TL(win), 1.5, 1); standQ(o.glow, X + wx, kz1 + 0.06, 0, 1.4, y + 15, y + 18, TL(win), 1.5, 1); }
  standQ(o.m, X, kz1 + 0.08, 0, 4.2, y, y + 6.2, TL('door'), 1.2); boxC(o.m, X - 3.4, y + 6.2, kz1, X + 3.4, y + 7, kz1 + 0.5, trim);
  for (var st = 0; st < 3; st++) { boxC(o.m, X - 4 - st * 0.3, y, kz1 + st * 0.7, X + 4 + st * 0.3, y + 0.6 - st * 0.2, kz1 + st * 0.7 + 0.7, trim); }
  [-1, 1].forEach(function (s) { standQ(o.m, X + s * 7, kz1 + 0.07, 0, 2.6, y + 5, y + 17, TL('velvet'), 1.1, 0.2); ell(o.glow, X + s * 3.2, y + 4.2, kz1 + 0.5, 0.25, 0.4, 0.25, '#ffb030', 6, 4); });
  p.door = { x: X, z: kz1 + 2.6 };
  // stables along the west wall, barracks along the east, a well, dummies, carts
  boxT(o.m, X - R + 1.5, y, Z - 18, X - R + 11, y + 6, Z + 26, { wall: 'plank', top: 'roofs', u: 3, v: 2 }); addBox(X - R + 1.5, Z - 18, X - R + 11, Z + 26, y - 2, y + 6);
  for (var sz = -14; sz < 26; sz += 5) standQ(o.m, X - R + 11.05, Z + sz, Math.PI / 2, 3, y, y + 3, TL('black'), 0.8);
  boxT(o.m, X + R - 11, y, Z - 30, X + R - 1.5, y + 8, Z + 6, { wall: tex, top: 'roofs', u: 3, v: 2 }); addBox(X + R - 11, Z - 30, X + R - 1.5, Z + 6, y - 2, y + 8);
  for (var bz = -26; bz < 6; bz += 6) standQ(o.glow, X + R - 11.05, Z + bz, -Math.PI / 2, 1.4, y + 3, y + 5, TL(win), 1.5, 1);
  tub(o.m, [X + 10, y, Z + 18], [X + 10, y + 1.1, Z + 18], 2, 2, trim, 12, { T: TL(tex), cap0: 1 }); o.m.quad([X + 8.4, y + 0.9, Z + 16.4], [X + 8.4, y + 0.9, Z + 19.6], [X + 11.6, y + 0.9, Z + 19.6], [X + 11.6, y + 0.9, Z + 16.4], UV1, TL(dark ? 'goo' : 'water'), [0.5, 0.5, 0.5], [0, 1, 0]);
  [-1, 1].forEach(function (s) { tub(o.m, [X + 10 + s * 1.8, y + 1, Z + 18], [X + 10 + s * 1.8, y + 3.5, Z + 18], 0.1, 0.1, '#4a3020', 5); }); boxC(o.m, X + 8, y + 3.4, Z + 17.6, X + 12, y + 3.7, Z + 18.4, '#4a3020'); addPost(X + 10, Z + 18, 2, y, y + 1.2);
  for (var dm = 0; dm < 3; dm++) { var dx = X - 22 + dm * 4, dz = Z + 30; tub(o.m, [dx, y, dz], [dx, y + 1.8, dz], 0.08, 0.08, '#4a3020', 5); ell(o.m, dx, y + 1.5, dz, 0.4, 0.55, 0.3, '#c8a860', 7, 5); ell(o.m, dx, y + 2.2, dz, 0.25, 0.25, 0.25, '#c8a860', 6, 4); tub(o.m, [dx - 0.6, y + 1.6, dz], [dx + 0.6, y + 1.6, dz], 0.06, 0.06, '#4a3020', 4); addPost(dx, dz, 0.4, y, y + 2); }
  [[X + 22, Z + 30], [X + 26, Z + 10]].forEach(function (c) { boxR(o.m, c[0], c[1], 0.3, 1.0, 1.8, y + 0.6, y + 1.5, '#6a4a2a', 'plank'); [-1, 1].forEach(function (s) { tub(o.m, [c[0] + s * 1.15, y + 0.6, c[1]], [c[0] + s * 1.25, y + 0.6, c[1]], 0.6, 0.6, '#3a2418', 10, { cap: 1, cap0: 1 }); }); addPost(c[0], c[1], 1.6, y, y + 1.5); });
  // banners along the curtain wall, torches on the inside
  for (var bn = -R + 8; bn < R - 8; bn += 12) { standQ(o.m, X + bn, Z - R + 1.52, 0, 2, y + 6, y + 12, TL('velvet'), 1.1, 0.2); standQ(o.m, X - R + 1.52, Z + bn, Math.PI / 2, 2, y + 6, y + 12, TL('velvet'), 1.1, 0.2); }
  if (dark) { ell(o.glow, X, y + KH + 46, (kz0 + kz1) / 2, 3, 3, 3, '#c040ff', 8, 5); o.m.quad([X - 6, y + 0.05, Z + 4], [X - 6, y + 0.05, Z + 12], [X + 6, y + 0.05, Z + 12], [X + 6, y + 0.05, Z + 4], uvR(3, 2), TL('goo'), [0.5, 0.5, 0.5], [0, 1, 0]); }
  o.r = 140; o.lights = [{ x: X, y: y + 6, z: Z + R + 5, c: dark ? [0.8, 0.2, 1] : [1, 0.6, 0.3], r: 20 }, { x: X, y: y + 6, z: kz1 + 4, c: dark ? [0.8, 0.2, 1] : [1, 0.6, 0.3], r: 18 }];
};
PAINT.goo = function (p) { p.fill('#5a1a7a'); p.speck(['#8a3aaa', '#3a0a5a', '#c070e0'], 140); };
