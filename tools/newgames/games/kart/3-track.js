/* =====================================================================================================
   THE TRACK: the control points become a smooth loop sampled every STEP units. Each sample knows where
   it is, which way the road runs, how wide it is and how high. Karts find themselves on it every frame
   (which sample, how far across), and the road, kerbs, verges, walls and ground are built from it.
   ===================================================================================================== */
var STEP = 2.5, KERB = 1.0;
function buildTrack(def) {
  var P = def.pts, n = P.length, dense = [];
  function cr(a, b, c, d, t) { var t2 = t * t, t3 = t2 * t; return [0, 1, 2].map(function (i) { return 0.5 * (2 * b[i] + (-a[i] + c[i]) * t + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t2 + (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * t3); }); }
  for (var i = 0; i < n; i++) for (var s = 0; s < 40; s++) dense.push(cr(P[(i - 1 + n) % n], P[i], P[(i + 1) % n], P[(i + 2) % n], s / 40));
  var cum = [0]; for (i = 1; i <= dense.length; i++) { var a = dense[i - 1], b = dense[i % dense.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  var len = cum[cum.length - 1], N = Math.round(len / STEP), S = [], j = 0;
  for (i = 0; i < N; i++) {
    var d = i * len / N; while (cum[j + 1] < d) j++;
    var k = (d - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]), p0 = dense[j], p1 = dense[(j + 1) % dense.length];
    S.push({ x: p0[0] + (p1[0] - p0[0]) * k, z: p0[1] + (p1[1] - p0[1]) * k, y: (p0[2] + (p1[2] - p0[2]) * k), d: d });
  }
  for (i = 0; i < N; i++) {
    var A = S[(i - 1 + N) % N], B = S[(i + 1) % N], tx = B.x - A.x, tz = B.z - A.z, l = Math.hypot(tx, tz) || 1;
    S[i].tx = tx / l; S[i].tz = tz / l; S[i].nx = -S[i].tz; S[i].nz = S[i].tx; S[i].hw = def.hw; S[i].i = i;
  }
  // curvature: how hard the road bends here (the AI brakes for it, kerbs only show where it bends)
  for (i = 0; i < N; i++) { var a2 = S[i], b2 = S[(i + 4) % N]; S[i].curve = Math.atan2(a2.tx * b2.tz - a2.tz * b2.tx, a2.tx * b2.tx + a2.tz * b2.tz); }
  var minY = 1e9, maxY = -1e9, bx0 = 1e9, bx1 = -1e9, bz0 = 1e9, bz1 = -1e9;
  S.forEach(function (q) { minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y); bx0 = Math.min(bx0, q.x); bx1 = Math.max(bx1, q.x); bz0 = Math.min(bz0, q.z); bz1 = Math.max(bz1, q.z); });
  var T = { def: def, S: S, N: N, len: len, minY: minY, maxY: maxY, box: [bx0, bz0, bx1, bz1], edge: def.hw + KERB + def.off };
  T.at = function (f) { return S[((Math.round(f * N) % N) + N) % N]; };
  T.idx = function (f) { return ((Math.round(f * N) % N) + N) % N; };
  /* where is a point on the track: the nearest sample (searching near a hint), how far along it, how far across, and the road height */
  T.locate = function (x, z, hint) {
    var best = -1, bd = 1e18, bt = 0, from = hint === undefined || hint < 0 ? 0 : hint - 10, to = hint === undefined || hint < 0 ? N : hint + 10;
    for (var q = from; q < to; q++) {
      var i0 = ((q % N) + N) % N, a = S[i0], b = S[(i0 + 1) % N], ex = b.x - a.x, ez = b.z - a.z, el = ex * ex + ez * ez;
      var t = el ? ((x - a.x) * ex + (z - a.z) * ez) / el : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      var px = a.x + ex * t - x, pz = a.z + ez * t - z, dd = px * px + pz * pz; if (dd < bd) { bd = dd; best = i0; bt = t; }
    }
    if (hint !== undefined && hint >= 0 && bd > (T.edge + 6) * (T.edge + 6)) return T.locate(x, z, -1); // lost: search the whole loop
    var A = S[best], B = S[(best + 1) % N], cx = A.x + (B.x - A.x) * bt, cz = A.z + (B.z - A.z) * bt;
    var lat = (x - cx) * A.nx + (z - cz) * A.nz;
    return { i: best, t: bt, lat: lat, y: A.y + (B.y - A.y) * bt, cx: cx, cz: cz, s: A };
  };
  T.pos = function (i, lat) { var q = S[((i % N) + N) % N]; return { x: q.x + q.nx * lat, z: q.z + q.nz * lat, y: q.y, s: q }; };
  return T;
}

/* ---------- building the world mesh ---------- */
function bakeLights(m, lights) {
  var a = m.a; if (!lights.length) return;
  for (var i = 0; i < a.length; i += 13) {
    var x = a[i], y = a[i + 1], z = a[i + 2], r = 0, g = 0, b = 0;
    for (var j = 0; j < lights.length; j++) { var L = lights[j], dx = x - L.x, dy = y - L.y, dz = z - L.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 >= L.r * L.r) continue; var k = 1 - Math.sqrt(d2) / L.r; k *= k * 0.55; r += L.c[0] * k; g += L.c[1] * k; b += L.c[2] * k; }
    if (r + g + b) { a[i + 9] += r; a[i + 10] += g; a[i + 11] += b; }
  }
}
function lightK(nx, nz, base) { var d = nx * 0.55 + nz * 0.83; return base * (0.78 + 0.22 * d); } // walls facing the light are a touch brighter
function mulc(c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }
function buildWorld(T, TH, A) {
  var def = T.def, S = T.S, N = T.N, m = new R3.Mesh(), L = def.light, hw = def.hw, off = def.off, e1 = hw + KERB, e2 = e1 + off, wallH = def.wallH;
  var groundY = def.floating ? null : T.minY - 0.4;
  function road(i) { var rt = TH.roadAt ? TH.roadAt(i / N) : null; return A.tile(rt || 'road'); }
  for (var i = 0; i < N; i++) {
    var a = S[i], b = S[(i + 1) % N], v0 = a.d / 4, v1 = (i + 1 === N ? T.len : b.d) / 4;
    function P(q, lat, dy) { return [q.x + q.nx * lat, q.y + (dy || 0), q.z + q.nz * lat]; }
    var shadeA = mulc(L, 1), shadeB = mulc(L, 1);
    // road
    var ce = mulc(L, 1.06), ed = mulc(L, 0.8), rs = TH.roadScroll ? TH.roadScroll(i / N) : 0, rt = road(i); // lighter down the middle, darker at the edges (Gouraud)
    m.quad(P(a, hw), P(b, hw), P(b, 0), P(a, 0), [0, v0, 0, v1, hw / 4, v1, hw / 4, v0], rt, [ed, ed, ce, ce], rs);
    m.quad(P(a, 0), P(b, 0), P(b, -hw), P(a, -hw), [hw / 4, v0, hw / 4, v1, hw * 2 / 4, v1, hw * 2 / 4, v0], rt, [ce, ce, ed, ed], rs);
    // kerbs: striped where the road bends, plain verge colour on straights
    var bend = Math.abs(a.curve) > 0.035 || Math.abs(b.curve) > 0.035, kt = A.tile(bend ? 'kerb' : 'kerb2');
    m.quad(P(a, e1, 0.02), P(b, e1, 0.02), P(b, hw, 0.02), P(a, hw, 0.02), [0, v0 * 2, 0, v1 * 2, 1, v1 * 2, 1, v0 * 2], kt, mulc(L, 0.95));
    m.quad(P(a, -hw, 0.02), P(b, -hw, 0.02), P(b, -e1, 0.02), P(a, -e1, 0.02), [0, v0 * 2, 0, v1 * 2, 1, v1 * 2, 1, v0 * 2], kt, mulc(L, 0.95));
    // verges (the slow stuff either side)
    var ot = A.tile('off'), os = def.creamOff ? 0.25 : 0;
    m.quad(P(a, e2, -0.02), P(b, e2, -0.02), P(b, e1, -0.02), P(a, e1, -0.02), [0, v0, 0, v1, off / 4, v1, off / 4, v0], ot, mulc(L, 0.9), os);
    m.quad(P(a, -e1, -0.02), P(b, -e1, -0.02), P(b, -e2, -0.02), P(a, -e2, -0.02), [0, v0, 0, v1, off / 4, v1, off / 4, v0], ot, mulc(L, 0.9), os);
    // walls in bands of 4 (so a band can be a window or a banner), and a skirt down to the ground under raised road
    [1, -1].forEach(function (sd) {
      var top = wallH, botA = groundY === null ? -6 : Math.min(0, groundY - a.y), botB = groundY === null ? -6 : Math.min(0, groundY - b.y), k = lightK(-a.nx * sd, -a.nz * sd, 1);
      function W(lat, y0a, y0b, y1, tile, kk) { m.quad(P(a, lat, y0a), P(b, lat, y0b), P(b, lat, y1), P(a, lat, y1), [v0, (y1 - y0a) / 4, v1, (y1 - y0b) / 4, v1, 0, v0, 0], A.tile(tile), [mulc(L, kk * 0.75), mulc(L, kk * 0.75), mulc(L, kk), mulc(L, kk)]); }
      if (botA < -0.05 || botB < -0.05) W(sd * e2, botA, botB, 0, top > 0 ? 'wall' : 'skirt', 0.55 * k);
      for (var y0 = 0; y0 < top - 0.01; y0 += 4) { var y1 = Math.min(top, y0 + 4), tl = TH.wallAt ? TH.wallAt(i, y0 / 4, sd) : 'wall'; W(sd * e2, y0, y0, y1, tl, k * (0.7 + 0.3 * y1 / Math.max(top, 1))); }
      if (top > 0) { // a cap on top of the wall, and its back face
        var wa1 = P(a, sd * e2, top), wb1 = P(b, sd * e2, top), c0 = P(a, sd * (e2 + 0.7), top), c1 = P(b, sd * (e2 + 0.7), top);
        m.quad(wa1, wb1, c1, c0, [v0, 0, v1, 0, v1, 0.25, v0, 0.25], A.tile('trim'), mulc(L, 1.05));
        W(sd * (e2 + 0.7), botA, botB, top, 'wall', 0.5 * k);
      }
      if (groundY === null) m.quad(P(a, sd * e2, -0.6), P(b, sd * e2, -0.6), P(b, 0, -0.6), P(a, 0, -0.6), [0, v0, 0, v1, e2 / 4, v1, e2 / 4, v0], A.tile('skirt'), mulc(L, 0.5)); // floating road: its underside
    });
  }
  // the start line and its gantry
  var s0 = S[0]; function P0(lat, dy, fwd) { return [s0.x + s0.nx * lat + s0.tx * (fwd || 0), s0.y + (dy || 0), s0.z + s0.nz * lat + s0.tz * (fwd || 0)]; }
  m.quad(P0(hw, 0.03, -1.2), P0(hw, 0.03, 1.2), P0(-hw, 0.03, 1.2), P0(-hw, 0.03, -1.2), [0, 0, 0, 0.6, hw * 2 / 2.4, 0.6, hw * 2 / 2.4, 0], A.tile('check'), mulc(L, 1));
  // ground
  if (groundY !== null) {
    var g = 24, gx0 = Math.floor((T.box[0] - 220) / g) * g, gz0 = Math.floor((T.box[1] - 220) / g) * g, gx1 = T.box[2] + 220, gz1 = T.box[3] + 220, gt = A.tile('ground');
    for (var gx = gx0; gx < gx1; gx += g) for (var gz = gz0; gz < gz1; gz += g) m.quad([gx, groundY, gz], [gx + g, groundY, gz], [gx + g, groundY, gz + g], [gx, groundY, gz + g], [0, 0, g / 6, 0, g / 6, g / 6, 0, g / 6], gt, mulc(L, 0.8), TH.groundScroll || 0);
  }
  return m;
}

/* ---------- a scenery builder handed to each theme ---------- */
function Builder(T, A, m) {
  var S = T.S, N = T.N, L = T.def.light, bills = [], anims = [];
  var B = {
    T: T, A: A, m: m, bills: bills, anims: anims, rnd: srand(T.N * 13 + T.def.hw),
    /* is a spot clear of the road (and its verges) by r */
    clear: function (x, z, r) { var q = T.locate(x, z, -1); return Math.abs(q.lat) > T.edge + 1 + (r || 0); },
    /* a billboard sprite standing at x,z (its feet on y) */
    bill: function (x, y, z, spr, sc, o) { var b = { x: x, y: y, z: z, spr: spr, sc: sc || 0.1 }; if (o) for (var k in o) b[k] = o[k]; bills.push(b); return b; },
    /* a box: centre x,z, base y, size w (x) d (z) h, rotated by ry; tiles per side; colour */
    box: function (x, y, z, w, d, h, ry, tSide, tTop, col, uvk) {
      col = col || L; uvk = uvk || 4; var c = Math.cos(ry || 0), s = Math.sin(ry || 0);
      function p(dx, dy, dz) { return [x + dx * c - dz * s, y + dy, z + dx * s + dz * c]; }
      var hw = w / 2, hd = d / 2, ts = A.tile(tSide), tt = A.tile(tTop || tSide);
      var faces = [[[-hw, -hd], [hw, -hd], w, [0, -1]], [[hw, -hd], [hw, hd], d, [1, 0]], [[hw, hd], [-hw, hd], w, [0, 1]], [[-hw, hd], [-hw, -hd], d, [-1, 0]]];
      faces.forEach(function (f) {
        var nx = f[3][0] * c - f[3][1] * s, nz = f[3][0] * s + f[3][1] * c, k = lightK(nx, nz, 1);
        m.quad(p(f[0][0], 0, f[0][1]), p(f[1][0], 0, f[1][1]), p(f[1][0], h, f[1][1]), p(f[0][0], h, f[0][1]), [0, h / uvk, f[2] / uvk, h / uvk, f[2] / uvk, 0, 0, 0], ts, [mulc(col, 0.6 * k), mulc(col, 0.6 * k), mulc(col, k), mulc(col, k)]);
      });
      m.quad(p(-hw, h, -hd), p(hw, h, -hd), p(hw, h, hd), p(-hw, h, hd), [0, 0, w / uvk, 0, w / uvk, d / uvk, 0, d / uvk], tt, mulc(col, 1.1));
    },
    /* a flat sign facing a direction (yaw), one tile stretched over it (or a wide tile) */
    panel: function (x, y, z, w, h, ry, tile, col, two) {
      col = col || L; var c = Math.cos(ry), s = Math.sin(ry), tl = typeof tile === 'string' ? A.tile(tile) : tile;
      var a = [x - c * w / 2, y, z - s * w / 2], b = [x + c * w / 2, y, z + s * w / 2];
      m.quad([a[0], y, a[2]], [b[0], y, b[2]], [b[0], y + h, b[2]], [a[0], y + h, a[2]], [0, 0.999, 0.999, 0.999, 0.999, 0, 0, 0], tl, mulc(col, 1));
    },
    /* a cylinder (or a cone when r2 differs), seg sides */
    cyl: function (x, y, z, r, h, seg, tile, col, r2, cap, uvk) {
      col = col || L; seg = seg || 8; r2 = r2 === undefined ? r : r2; uvk = uvk || 4; var tl = A.tile(tile);
      for (var i = 0; i < seg; i++) {
        var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2, k = lightK(Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), 1), circ = 2 * Math.PI * Math.max(r, 0.5) / seg / uvk;
        m.quad([x + Math.cos(a0) * r, y, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, y, z + Math.sin(a1) * r], [x + Math.cos(a1) * r2, y + h, z + Math.sin(a1) * r2], [x + Math.cos(a0) * r2, y + h, z + Math.sin(a0) * r2], [0, h / uvk, circ, h / uvk, circ, 0, 0, 0], tl, [mulc(col, 0.6 * k), mulc(col, 0.6 * k), mulc(col, k), mulc(col, k)]);
        if (cap && r2 > 0) m.tri([x, y + h, z], [x + Math.cos(a0) * r2, y + h, z + Math.sin(a0) * r2], [x + Math.cos(a1) * r2, y + h, z + Math.sin(a1) * r2], [0.5, 0.5, 0.5 + Math.cos(a0) * 0.5, 0.5 + Math.sin(a0) * 0.5, 0.5 + Math.cos(a1) * 0.5, 0.5 + Math.sin(a1) * 0.5], A.tile(cap), mulc(col, 1.1));
      }
    },
    /* walk the loop every 'every' units and call fn(sample, side) for each side, at a distance past the walls */
    along: function (every, fn) { var step = Math.max(1, Math.round(every / STEP)); for (var i = 0; i < N; i += step) { fn(S[i], 1, i); fn(S[i], -1, i); } },
    side: function (q, sd, dist) { var e = T.edge + 0.7 + (dist || 0); return { x: q.x + q.nx * e * sd, z: q.z + q.nz * e * sd, y: q.y, face: Math.atan2(-q.nz * sd, -q.nx * sd) }; },
    anim: function (o) { anims.push(o); return o; },
    /* a light: it brightens the world's vertex colours round it (baked once) and can wear a glowing halo */
    lights: [], light: function (x, y, z, r, col, halo) { B.lights.push({ x: x, y: y, z: z, r: r, c: col, halo: halo }); },
    /* a horizontal pipe from one point to another */
    hcyl: function (x0, y0, z0, x1, y1, z1, r, tile, col, seg) {
      col = col || L; seg = seg || 6; var dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, l = Math.hypot(dx, dy, dz), ux = dx / l, uy = dy / l, uz = dz / l;
      var px = -uz, pz = ux, pl = Math.hypot(px, pz) || 1; px /= pl; pz /= pl; var qx = uy * pz, qy = uz * px - ux * pz, qz = -uy * px; // two vectors across the pipe
      for (var i = 0; i < seg; i++) {
        var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2, k = 0.6 + 0.4 * Math.max(0, Math.sin((a0 + a1) / 2)), c0 = Math.cos(a0) * r, s0 = Math.sin(a0) * r, c1 = Math.cos(a1) * r, s1 = Math.sin(a1) * r;
        m.quad([x0 + px * c0 + qx * s0, y0 + qy * s0, z0 + pz * c0 + qz * s0], [x1 + px * c0 + qx * s0, y1 + qy * s0, z1 + pz * c0 + qz * s0], [x1 + px * c1 + qx * s1, y1 + qy * s1, z1 + pz * c1 + qz * s1], [x0 + px * c1 + qx * s1, y0 + qy * s1, z0 + pz * c1 + qz * s1], [0, 0, l / 4, 0, l / 4, 1, 0, 1], A.tile(tile), mulc(col, k));
      }
    },
    /* a beam right across the track at sample i, h up (indoor ceilings) */
    beam: function (i, h, tile, thick, col) { var q = S[((i % N) + N) % N], e = T.edge + 0.7, w = thick || 1.2; B.box(q.x, q.y + h, q.z, e * 2 + 1.4, w, w, Math.atan2(q.nz, q.nx), tile, tile, col); },
    tree: function (x, y, z, h, trunk, leaf, col) { B.cyl(x, y, z, h * 0.07, h * 0.45, 5, trunk, col); B.cyl(x, y + h * 0.3, z, h * 0.32, h * 0.45, 7, leaf, col, 0.02); B.cyl(x, y + h * 0.6, z, h * 0.24, h * 0.4, 7, leaf, col, 0.02); },
    /* a sprite from the sheet stuck flat on the world (shop fronts, signs): built once the sheet has loaded */
    decals: [], decal: function (x, y, z, w, h, ry, spr, col) { B.decals.push({ x: x, y: y, z: z, w: w, h: h, ry: ry, spr: spr, col: col }); var sg = typeof SIGNS !== 'undefined' && SIGNS[spr]; if (sg) { var k = hexrgb(sg[2]); B.light(x, y + h + w * 0.12, z, 9, [k[0] / 300, k[1] / 300, k[2] / 300]); } }
  };
  return B;
}
