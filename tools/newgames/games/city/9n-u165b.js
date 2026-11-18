/* update 165, part two: boxes that turn with the thing they belong to (the clinics, the first aid tent and the dock containers were
   squared off to the map, so their corners stuck out as invisible walls), and the clinics rebuilt */
function addOBB(cx, cz, a, hw, hd, y0, y1, o) {
  var c = Math.cos(a), s = Math.sin(a), ex = Math.abs(c) * hw + Math.abs(s) * hd, ez = Math.abs(s) * hw + Math.abs(c) * hd;
  var b = { obb: 1, cx: cx, cz: cz, c: c, s: s, hw: hw, hd: hd, x0: cx - ex, z0: cz - ez, x1: cx + ex, z1: cz + ez, y0: y0, y1: y1, o: o };
  gridAdd(SOLID, b.x0, b.z0, b.x1, b.z1, b); return b;
}
function obbLocal(b, x, z) { var dx = x - b.cx, dz = z - b.cz; return [dx * b.c - dz * b.s, dx * b.s + dz * b.c]; }
function obbWorld(b, u, v) { return [b.cx + u * b.c + v * b.s, b.cz - u * b.s + v * b.c]; }
function obbIn(b, x, z, pad) { var l = obbLocal(b, x, z); pad = pad || 0; return Math.abs(l[0]) <= b.hw + pad && Math.abs(l[1]) <= b.hd + pad; }

collide = function (x, z, r, y, hh) {
  if (G.interior) return interiorCollide(x, z, r);
  var px = 0, pz = 0, hit = null, L = near(BGRID, x, z, r + 1);
  for (var n = 0; n < 2; n++) {
    var ls = n ? near(SOLID, x, z, r + 1) : L;
    for (var k = 0; k < ls.length; k++) { var b = ls[k]; if (b.o && b.o.deck) continue; var top = n ? b.y1 : b.y0 + b.h, bot = n ? b.y0 : b.y0 - 2; if (y + (hh || 1.6) < bot || y > top - 0.05) continue;
      if (b.o && b.o.kp) { if (KNOCKED[b.o.kp]) continue; if (COLLV && Math.abs(COLLV.sp) > 2.5 && Math.hypot(x - b.x, z - b.z) < r + b.r) { knockProp(b.o, COLLV); continue; } }
      if (b.post) { var dx = x + px - b.x, dz = z + pz - b.z, d = Math.hypot(dx, dz), m = r + b.r; if (d < m && d > 0.0001) { px += dx / d * (m - d); pz += dz / d * (m - d); hit = b; } continue; }
      if (b.obb) { var l = obbLocal(b, x + px, z + pz), cu = clamp(l[0], -b.hw, b.hw), cv = clamp(l[1], -b.hd, b.hd), eu = l[0] - cu, ev = l[1] - cv, de = Math.hypot(eu, ev);
        if (de < r) { var nu, nv, pen;
          if (de < 0.0001) { var pu = b.hw - Math.abs(l[0]), pv = b.hd - Math.abs(l[1]); if (pu < pv) { nu = l[0] < 0 ? -1 : 1; nv = 0; pen = pu + r; } else { nu = 0; nv = l[1] < 0 ? -1 : 1; pen = pv + r; } }
          else { nu = eu / de; nv = ev / de; pen = r - de; }
          px += (nu * b.c + nv * b.s) * pen; pz += (-nu * b.s + nv * b.c) * pen; hit = b; }
        continue; }
      var cx = clamp(x + px, b.x0, b.x1), cz = clamp(z + pz, b.z0, b.z1), ex = x + px - cx, ez = z + pz - cz, dd = Math.hypot(ex, ez);
      if (dd < r) { if (dd < 0.0001) { var l0 = x + px - b.x0, rr = b.x1 - x - px, t = z + pz - b.z0, bb = b.z1 - z - pz, mn = Math.min(l0, rr, t, bb); if (mn === l0) px -= l0 + r; else if (mn === rr) px += rr + r; else if (mn === t) pz -= t + r; else pz += bb + r; }
        else { px += ex / dd * (r - dd); pz += ez / dd * (r - dd); } hit = b; }
    }
  }
  return { x: px, z: pz, hit: hit };
};
/* standing on a turned box (the containers) */
var _standY165 = standY;
standY = function (x, z, y) {
  var g = _standY165(x, z, y); if (G.interior) return g;
  var ls = near(SOLID, x, z, 0.6);
  for (var k = 0; k < ls.length; k++) { var b = ls[k]; if (!b.obb || !b.top) continue; if (!obbIn(b, x, z)) continue; if (b.y1 <= y + 0.7 && b.y1 > g) g = b.y1; }
  return g;
};
/* the ray (camera, bullets) against turned boxes too; the plain boxes and buildings stay as they were */
var _rayBlock165 = rayBlock;
rayBlock = function (ax, ay, az, bx, by, bz) {
  if (G.interior) return _rayBlock165(ax, ay, az, bx, by, bz);
  var ob = [], keep = {}, dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), steps = Math.max(1, Math.ceil(L / 8));
  for (var s = 0; s <= steps; s++) near(SOLID, ax + dx * s / steps, az + dz * s / steps, 4).forEach(function (b) { if (b.obb && ob.indexOf(b) < 0) { ob.push(b); } });
  /* hide them from the old ray while it runs, then test them properly */
  ob.forEach(function (b) { b.__x0 = b.x0; b.x0 = 1e9; b.x1v = b.x1; b.x1 = 1e9 + 1; });
  var best = _rayBlock165(ax, ay, az, bx, by, bz);
  ob.forEach(function (b) { b.x0 = b.__x0; b.x1 = b.x1v;
    var A = obbLocal(b, ax, az), B = obbLocal(b, bx, bz), o = [A[0], ay, A[1]], d = [B[0] - A[0], by - ay, B[1] - A[1]], lo = [-b.hw, b.y0, -b.hd], hi = [b.hw, b.y1, b.hd], t0 = 0, t1 = 1;
    for (var a = 0; a < 3; a++) { if (Math.abs(d[a]) < 1e-6) { if (o[a] < lo[a] || o[a] > hi[a]) return; continue; } var q1 = (lo[a] - o[a]) / d[a], q2 = (hi[a] - o[a]) / d[a]; if (q1 > q2) { var q = q1; q1 = q2; q2 = q; } t0 = Math.max(t0, q1); t1 = Math.min(t1, q2); if (t0 > t1) return; }
    if (t0 < best) best = t0; });
  return best;
};

/* the dock containers stand turned: their box turns with them now */
LMBUILD.containers = function (o, p) { var y = p.h, a = p.a, cols = ['#8a2a20', '#2a4a6a', '#3a6a3a', '#c4121c', '#6a6a6a', '#a87a20'];
  for (var k = 0; k < p.n; k++) { var col = cols[Math.floor(hash2(Math.round(p.x), k, 2) * cols.length)]; boxR(o.m, p.x, p.z, a, 6, 1.25, y + k * 2.6, y + (k + 1) * 2.6, col, 'container'); }
  addOBB(p.x, p.z, a, 6, 1.25, y - 1, y + p.n * 2.6).top = 1; o.r = 20; };

/* ---------- the clinics, rebuilt ---------- */
HIPAINT.sg_clinic2 = function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 19, 64, 26); g.fillStyle = '#f6f1e6'; g.fillRect(1, 20, 62, 24);
  g.fillStyle = '#c4121c'; g.fillRect(3, 22, 18, 20); g.fillStyle = '#f6f1e6'; g.fillRect(10, 24, 4, 16); g.fillRect(4, 30, 16, 4);
  g.fillStyle = '#1a0a0c'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = 'bold 7px "Archivo Narrow", Arial'; g.fillText('CUM CITY', 24, 27);
  g.fillStyle = '#c4121c'; g.font = 'bold 10px "Archivo Narrow", Arial'; g.fillText('CLINIC', 24, 37); };
HIPAINT.sg_clinic2.big = true;
HIPAINT.clinicpanel = function (g) { g.fillStyle = '#e9e4da'; g.fillRect(0, 0, 64, 64); for (var r = 0; r < 4; r++) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(0, r * 16 + 15, 64, 1); }
  g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(31, 0, 1, 64); for (var k = 0; k < 40; k++) { g.fillStyle = 'rgba(80,60,50,' + (0.02 + (k % 5) * 0.01) + ')'; g.fillRect((k * 37) % 64, (k * 23) % 64, 2, 1); }
  g.fillStyle = 'rgba(60,40,30,0.10)'; g.fillRect(0, 60, 64, 4); };
HIPAINT.clinicglass = function (g) { var gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, '#2a3a44'); gr.addColorStop(0.5, '#5a7480'); gr.addColorStop(1, '#22303a'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(255,240,220,0.35)'; g.fillRect(4, 40, 56, 20); g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(8, 0); g.lineTo(22, 0); g.lineTo(4, 30); g.lineTo(0, 30); g.closePath(); g.fill();
  g.fillStyle = '#2a2a2e'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 62, 64, 2); g.fillRect(0, 0, 2, 64); g.fillRect(62, 0, 2, 64); g.fillRect(31, 0, 2, 64); };
HIPAINT.clinicdoor = function (g) { HIPAINT.clinicglass(g); g.fillStyle = '#c4121c'; g.fillRect(20, 30, 8, 2); g.fillRect(36, 30, 8, 2); g.fillStyle = '#f6f1e6'; g.font = 'bold 5px Arial'; g.textAlign = 'center'; g.fillText('PUSH', 24, 27); g.fillText('PUSH', 40, 27); };

LMBUILD.clinic = function (o, p) { o.r = 26; var R = p.R || 6, big = R >= 9.5, FR = Math.min(9.0, R + 0.7); /* FR: how far out the front things may go before the pavement */ var m = o.m, gl = o.glow, a = p.a, y = p.y, c = Math.cos(a), s = Math.sin(a), fx = s, fz = c;
  function at(u, v) { return [p.x + c * u + fx * v, p.z - s * u + fz * v]; }
  function bx(u, v, hw, hd, y0, y1, hex, T) { var q = at(u, v); boxR(m, q[0], q[1], a, hw, hd, y0, y1, hex, T); }
  function face(u, v, w, y0, y1, T, k, mm, uv) { var q = at(u, v); standQ(mm || m, q[0], q[1], a, w, y0, y1, TL(T), k || 1.1, 0, uv); }
  function side(u, v, sd, w, y0, y1, T, k, mm) { var q = at(u, v); standQ(mm || m, q[0], q[1], a + sd * Math.PI / 2, w, y0, y1, TL(T), k || 1.1); }
  function post(u, v, r, y0, y1, col) { var q = at(u, v); tub(m, [q[0], y0, q[1]], [q[0], y1, q[1]], r, r, col, 6); }
  // the forecourt slab, flush with the ground so you walk straight on
  bx(big ? 1 : 0, (FR - 4.2) / 2, big ? 10 : 6.6, (FR + 5.2) / 2, y - 1.6, y + 0.06, '#8a8680', 'paver'); var CP = Math.min(7.5, FR - 1.2);
  // the main block: plinth course, rendered walls, a red fascia, a parapet with a cap
  bx(0, 0, 6.1, 4.6, y - 1.5, y + 0.45, '#5a5458', 'concrete');
  bx(0, 0, 6, 4.5, y + 0.45, y + 4.1, '#ece7dd', 'clinicpanel');
  bx(0, 0, 6.06, 4.56, y + 3.15, y + 3.75, '#b8101a');
  bx(0, 0, 6.15, 4.65, y + 4.1, y + 4.4, '#3a3438'); bx(0, 0, 5.8, 4.3, y + 4.1, y + 4.32, '#2a2226');
  // the glass front between grey columns
  face(-3.3, 4.53, 4.0, y + 0.45, y + 3.1, 'clinicglass', 1.3); face(3.3, 4.53, 4.0, y + 0.45, y + 3.1, 'clinicglass', 1.3);
  face(0, 4.54, 2.4, y + 0.06, y + 2.7, 'clinicdoor', 1.3);
  [-5.5, -1.35, 1.35, 5.5].forEach(function (u) { bx(u, 4.55, 0.22, 0.12, y + 0.45, y + 3.15, '#4a4448'); });
  // side windows in a strip, the back has a service door
  [-1, 1].forEach(function (sd) { [-2.2, 0, 2.2].forEach(function (v) { var q = at(sd * 6.02, v); standQ(m, q[0], q[1], a + sd * Math.PI / 2, 1.7, y + 1.2, y + 2.7, TL('litwin'), 1.1); bx(sd * 6.05, v, 0.06, 0.95, y + 1.1, y + 1.2, '#4a4448'); }); });
  var bk = at(2.5, -4.53); standQ(m, bk[0], bk[1], a + Math.PI, 1.4, y + 0.45, y + 2.6, TL('door'), 1);
  // the upper floor, set back, a ribbon of lit windows and a red cross lightbox on the front
  bx(-0.6, -0.7, 4.8, 3.4, y + 4.1, y + 7.2, '#e2ddd2', 'clinicpanel'); bx(-0.6, -0.7, 4.95, 3.55, y + 7.2, y + 7.45, '#3a3438');
  [-2.8, -0.6, 1.6].forEach(function (u) { face(u, 2.72, 1.8, y + 5.2, y + 6.6, 'litwin2', 1.1); });
  var X = at(3.1, 2.72); standQ(gl, X[0], X[1], a, 1.6, y + 5.1, y + 6.7, TL('redcross'), 1.5);
  // plant on the roof: units, a vent stack, a rail
  bx(3.6, -2.8, 1.2, 0.9, y + 4.4, y + 5.3, '#9a9a96', 'metal'); bx(3.6, -0.6, 1.2, 0.9, y + 4.4, y + 5.3, '#9a9a96', 'metal');
  [[3.6, -2.8], [3.6, -0.6]].forEach(function (q) { var r = at(q[0], q[1]); ell(m, r[0], y + 5.32, r[1], 0.6, 0.06, 0.6, '#2a2a2e', 8, 2); });
  post(-4.4, -3.4, 0.2, y + 4.4, y + 8.2, '#6a6a6e');
  // the sign on the fascia, crisp
  face(0, 4.72, 4.2, y + 3.4, y + 5.0, 'sg_clinic2', 1.5, gl, SGUV); bx(0, 4.66, 2.15, 0.05, y + 3.36, y + 5.04, '#12040a');
  // the canopy over the door on two posts, with downlights
  bx(0, (4.5 + CP + 0.2) / 2, 2.9, (CP + 0.2 - 4.5) / 2, y + 3.0, y + 3.22, '#c4121c'); bx(0, (4.5 + CP + 0.2) / 2, 2.95, (CP + 0.2 - 4.5) / 2 + 0.05, y + 3.22, y + 3.3, '#2a2226');
  [-2.6, 2.6].forEach(function (u) { post(u, CP, 0.09, y, y + 3.0, '#3a3438'); var q = at(u, CP); addPost(q[0], q[1], 0.12, y - 0.5, y + 3.2); });
  [-1.6, 0, 1.6].forEach(function (u) { var q = at(u, 6.6); ell(gl, q[0], y + 2.97, q[1], 0.2, 0.03, 0.2, '#fff2d0', 6, 2); });
  // a ramp along the front with rails, two planters by the door
  [-1, 1].forEach(function (sd) { var q = at(sd * 2.2, 5.0); boxR(m, q[0], q[1], a, 0.6, 0.35, y, y + 0.5, '#5a5458', 'concrete'); ell(m, q[0], y + 0.75, q[1], 0.5, 0.35, 0.3, '#2a5a2a', 7, 3); ell(gl, q[0] + 0.1, y + 0.9, q[1], 0.08, 0.08, 0.08, '#ff2630', 4, 2); addOBB(q[0], q[1], a, 0.6, 0.35, y - 0.5, y + 0.6); });
  [-5.8, -4.2].forEach(function (u) { var q1 = at(u, 4.9), q2 = at(u, 6.4); tub(m, [q1[0], y + 0.9, q1[1]], [q2[0], y + 0.9, q2[1]], 0.035, 0.035, '#b8b8bc', 5); post(u, 6.4, 0.035, y, y + 0.9, '#b8b8bc'); });
  // the bollards across the front so nobody drives in
  [-4.8, -3.2, 3.2, 4.8].forEach(function (u) { post(u, FR, 0.11, y, y + 0.85, '#2a2226'); var q = at(u, FR); ell(gl, q[0], y + 0.88, q[1], 0.11, 0.03, 0.11, '#ff2630', 6, 2); addPost(q[0], q[1], 0.14, y - 0.5, y + 0.9); });
  // the pylon sign by the road: tall, lit both sides
  if (big) { var Py = at(-8.2, 8.4); bx(-8.2, 8.4, 0.25, 0.25, y, y + 3.4, '#2a2226'); bx(-8.2, 8.4, 0.75, 0.18, y + 3.4, y + 5.2, '#2a2226');
  [0, 1].forEach(function (b) { var q = at(-8.2, 8.4 + (b ? -0.19 : 0.19)); standQ(gl, q[0], q[1], a + (b ? Math.PI : 0), 1.4, y + 3.5, y + 5.1, TL('redcross'), 1.5); });
  addPost(Py[0], Py[1], 0.3, y - 0.5, y + 5.2); }
  // the ambulance bay on the right: a lower wing with a roller door and the ambulance backed up to it
  if (big) { bx(8.3, -1.0, 2.3, 3.5, y - 1.5, y + 3.3, '#ddd8ce', 'clinicpanel'); bx(8.3, -1.0, 2.4, 3.6, y + 3.3, y + 3.55, '#3a3438'); bx(8.33, -1.0, 2.33, 3.53, y + 2.4, y + 2.75, '#b8101a');
  var Rd = at(8.3, 2.53); standQ(m, Rd[0], Rd[1], a, 3.4, y, y + 2.35, TL('shutter'), 1.0);
  [[7.0], [9.6]].forEach(function (q) { var r = at(q[0], 2.7); ell(gl, r[0], y + 2.6, r[1], 0.14, 0.07, 0.07, '#ffb040', 6, 2); });
  var Am = at(8.3, 6.0); car3(m, Am[0], Am[1], a, y, '#f1e7d0'); boxR(m, Am[0], Am[1], a, 0.92, 0.6, y + 1.52, y + 1.62, '#c4121c');
  ell(gl, Am[0], y + 1.72, Am[1], 0.25, 0.08, 0.12, '#ff2630', 6, 2); addOBB(Am[0], Am[1], a, 1.0, 2.2, y, y + 1.7);
  // yellow hatching in the bay
  for (var h = 0; h < 4; h++) bx(8.3, 4.0 + h * 1.0, 1.6, 0.08, y + 0.06, y + 0.075, '#e0a020'); var Cw = at(8.3, -1.0); addOBB(Cw[0], Cw[1], a, 2.35, 3.55, y - 2, y + 3.6); }
  // a bench by the door and a bin
  var Bn = at(-4.6, Math.min(7.4, FR - 1.3)); boxR(m, Bn[0], Bn[1], a, 0.9, 0.25, y + 0.42, y + 0.5, '#6a4a2a'); boxR(m, Bn[0], Bn[1], a, 0.85, 0.2, y, y + 0.42, '#2a2226');
  if (typeof addSeat === 'function') try { addSeat(Bn[0], Bn[1], a, 'bench'); } catch (e) { }
  post(-6.0, Math.min(7.6, FR - 1.1), 0.25, y, y + 0.9, '#2a3a2a');
  // collision: the real shapes, turned with the building
  var Cm = at(0, 0); addOBB(Cm[0], Cm[1], a, 6.1, 4.6, y - 2, y + 7.2);
  o.lights = [{ x: at(0, 6.6)[0], y: y + 2.8, z: at(0, 6.6)[1], c: [1, 0.92, 0.8], r: 9 }, { x: X[0], y: y + 5.5, z: X[1], c: [1, 0.2, 0.25], r: 8 }];
  o.flick = [];
};

/* the first aid tent by Ejaculand's gate: a proper marquee with a turned box */
LMBUILD.firstaid = function (o, p) { o.r = 14; var m = o.m, gl = o.glow, a = p.a, y = p.y, c = Math.cos(a), s = Math.sin(a), fx = s, fz = c;
  function at(u, v) { return [p.x + c * u + fx * v, p.z - s * u + fz * v]; }
  boxR(m, p.x, p.z, a, 3.4, 3.4, y - 0.6, y + 0.05, '#6a6460', 'plank');
  // white walls with red stripes, a peaked roof in red and white panels
  boxR(m, p.x, p.z, a, 3.2, 3.2, y + 0.05, y + 2.3, '#f1e7d0');
  for (var k = -1; k <= 1; k += 2) boxR(m, p.x, p.z, a, 3.22, 3.22, y + 1.9 + k * 0.0, y + 2.1, '#c4121c');
  var corners = [[-3.3, -3.3], [3.3, -3.3], [3.3, 3.3], [-3.3, 3.3]].map(function (q) { return at(q[0], q[1]); }), top = [p.x, y + 4.6, p.z];
  for (var i = 0; i < 4; i++) { var A = corners[i], B = corners[(i + 1) % 4], n = [((A[0] + B[0]) / 2 - p.x), 1.6, ((A[1] + B[1]) / 2 - p.z)], L = Math.hypot(n[0], n[1], n[2]); n = [n[0] / L, n[1] / L, n[2] / L];
    for (var j = 0; j < 4; j++) { var t0 = j / 4, t1 = (j + 1) / 4, P0 = [A[0] + (B[0] - A[0]) * t0, y + 2.3, A[1] + (B[1] - A[1]) * t0], P1 = [A[0] + (B[0] - A[0]) * t1, y + 2.3, A[1] + (B[1] - A[1]) * t1];
      m.tri(P0, P1, top, [0, 1, 1, 1, 0.5, 0], TL('white'), litc(j % 2 ? '#f1e7d0' : '#c4121c', n, 1.05), n); } }
  tub(m, top, [p.x, y + 5.6, p.z], 0.04, 0.04, '#3a3a3e', 4); var Fl = [p.x + c * 0.5, y + 5.4, p.z - s * 0.5]; tub(m, [p.x, y + 5.45, p.z], Fl, 0.2, 0.0, '#c4121c', 3);
  // an open flap at the front, the inside dark, a cot and a cross
  var D = at(0, 3.24); standQ(m, D[0], D[1], a, 1.8, y + 0.05, y + 2.0, TL('white'), 0.35);
  [-1, 1].forEach(function (sd) { var q = at(sd * 1.3, 3.6); standQ(m, q[0], q[1], a + sd * 0.6, 0.8, y + 0.05, y + 2.0, TL('white'), 1.0); });
  var S = at(0, 3.27); standQ(gl, S[0], S[1], a, 3.0, y + 2.32, y + 3.15, TL('sg_firstaid'), 1.4, 0, SGUV);
  [-1, 1].forEach(function (sd) { var q = at(sd * 3.24, 0); standQ(gl, q[0], q[1], a + sd * Math.PI / 2, 1.6, y + 0.6, y + 1.8, TL('redcross'), 1.4); });
  var Bk = at(0, -3.24); standQ(gl, Bk[0], Bk[1], a + Math.PI, 1.6, y + 0.6, y + 1.8, TL('redcross'), 1.4);
  // guy ropes and pegs
  corners.forEach(function (q) { var o2 = [p.x + (q[0] - p.x) * 1.35, p.z + (q[1] - p.z) * 1.35]; tub(m, [q[0], y + 2.3, q[1]], [o2[0], y + 0.05, o2[1]], 0.015, 0.015, '#d8d0c0', 3); });
  var Lp = at(2.4, 4.4); tub(m, [Lp[0], y, Lp[1]], [Lp[0], y + 2.6, Lp[1]], 0.05, 0.05, '#3a3a3e', 5); ell(gl, Lp[0], y + 2.65, Lp[1], 0.16, 0.12, 0.16, '#fff2d0', 6, 3); addPost(Lp[0], Lp[1], 0.1, y - 0.5, y + 2.6);
  addOBB(p.x, p.z, a, 3.25, 3.25, y - 1, y + 4);
  o.lights = [{ x: at(0, 4.2)[0], y: y + 2.5, z: at(0, 4.2)[1], c: [1, 0.9, 0.75], r: 7 }];
};

/* the camera never sits behind a wall: four rays (the middle, both sides and the top of the picture) from what it looks at, and it
   stops a little short of the nearest hit; pulling in is instant, easing back out is gentle (update 165, he said it kept going behind walls) */
var _stepCamera165 = stepCamera; stepCamera = function (dt) {
  _stepCamera165(dt);
  if ((G.cut && G.mode === 'play') || G.ride || G.interior) return;
  var tg = P.state === 'car' && P.veh ? [P.veh.x, P.veh.y + P.veh.t.hgt * 0.7, P.veh.z] : [P.x, P.y + 1.45, P.z];
  var dx = CAM.x - tg[0], dy = CAM.y - tg[1], dz = CAM.z - tg[2], L = Math.hypot(dx, dy, dz); if (L < 0.5) return;
  var hx = -dz / Math.hypot(dx, dz || 1e-6), hz = dx / Math.hypot(dx, dz || 1e-6), w = 0.42, best = 1;
  [[0, 0], [w, 0], [-w, 0], [0, w]].forEach(function (o) { var ex = CAM.x + hx * o[0], ey = CAM.y + o[1], ez = CAM.z + hz * o[0]; var t = rayBlock(tg[0], tg[1], tg[2], ex, ey, ez); if (t < best) best = t; });
  if (best < 1) { var D = Math.max(0.6, best * L - 0.45), k = D / L; if (k < 1) { CAM.x = tg[0] + dx * k; CAM.y = tg[1] + dy * k; CAM.z = tg[2] + dz * k; var gy = groundY(CAM.x, CAM.z) + 0.35; if (CAM.y < gy) CAM.y = gy; } }
};

/* smoking, the way people really do it (his ask: they tapped their shoulder): the hand comes up to the mouth, stays there a second or
   two, goes back down, the smoke is breathed out, and about five seconds later the next drag. One cycle is 8.5 s. */
window.SMOKE165 = 1;
var SMK = { rest: [0.75, 0.0, 0.3, 1.1], mouth: [1.3, -0.45, 0.45, 1.6] }; /* mouth: found by fitting the hand onto the lips (_armfit.js) */
window.smokeCyc = function (t) { var c = ((t % 8.5) + 8.5) % 8.5, ss = function (k) { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
  var up = c < 0.9 ? ss(c / 0.9) : c < 2.7 ? 1 : c < 3.6 ? 1 - ss((c - 2.7) / 0.9) : 0;
  return { up: up, drag: c > 0.9 && c < 2.7, ex: c > 3.5 && c < 5.0 ? 1 - Math.abs(c - 4.0) / 1.0 : 0, c: c }; };
function smokeArm165(Q, t, passA, sd) { var S = smokeCyc(t), u = S.up, R = SMK.rest, M = SMK.mouth;
  Q.sh[1] = [R[0] + (M[0] - R[0]) * u, R[1] + (M[1] - R[1]) * u, R[2] + (M[2] - R[2]) * u]; Q.el[1] = R[3] + (M[3] - R[3]) * u;
  Q.hp = (Q.hp || 0) - 0.04 * u + (S.ex > 0 ? 0.12 * Math.min(1, S.ex * 2) : 0); /* chin up a touch while breathing out */
  if (passA > 0) { var k = Math.sin(passA / 0.7 * Math.PI); Q.sh[1] = [1.2, -0.15 + k * 0.9 * (sd > 0 ? -1 : 1), 0.2]; Q.el[1] = 0.6; } return u; }
window.sitPose = function (seatKind, hold, t, passA, sd) { var Q = pose0(); poseSit(Q); Q.y = seatKind === 'tub' ? -0.75 : -0.45;
  if (hold) smokeArm165(Q, t, passA, sd); else if (passA > 0) smokeArm165(Q, 1e-3 + 6, passA, sd); else { Q.sh[0][0] = 0.6; Q.sh[1][0] = 0.6; } return Q; };
/* the smoke: a thin wisp off the lit end all the time, a proper cloud breathed out of the mouth after each drag */
(function () { var dj = drawJoint; window.drawJoint = drawJoint = function (x, y, z, a, t) { dj(x, y, z, a, t); var S = smokeCyc(t), Hd = window.LASTHEAD; if (!Hd || !(S.ex > 0)) return;
  if (dist2(x, z, CAM.x, CAM.z) > 45 * 45) return; if (Math.random() > 0.55) return;
  var m = mPt(Hd, 0, 0.1, 0.24), fx = Math.sin(a), fz = Math.cos(a);
  addFx({ k: 'puff', x: m[0], y: m[1], z: m[2], vx: fx * (0.5 + S.ex * 0.5) + rnd(-0.1, 0.1), vy: 0.12 + rnd(0, 0.15), vz: fz * (0.5 + S.ex * 0.5) + rnd(-0.1, 0.1), life: 2.2 + Math.random(), s0: 0.06, grow: 0.5, col: [0.86, 0.86, 0.84], a0: 0.32 }); }; })();

/* waking up after WASTED never leaves you in a black screen (he died in Blumhead's keep and got one): everything you were doing is
   dropped first, a failed wake-up falls back to the hospital, the camera snaps to you, and you never wake in the dead of night */
(function () { var rs = respawn; respawn = function () {
  G.seat = null; G.ride = null; G.lift = null; G.darts = null; G.sitting = 0; G.cine = null; G.seatCam = null; G.fish = null; G.lookout = null; if (typeof HOOK !== 'undefined' && HOOK) HOOK.mode = null; P.roofV = null; G.ejectV = null; G.cut = null;
  try { rs(); } catch (e) { console.warn('respawn', e); try { if (G.interior) { G.interior = null; PEDS = PEDS.filter(function (p) { return !p.inside; }); } var s = SHOPS.hosp, d = doorOf(s.b); newPlayer(d.x + Math.sin(d.a) * 2, d.z + Math.cos(d.a) * 2, d.a); P.hp = SV.maxHp; } catch (e2) { console.warn('respawn2', e2); } }
  if (P.state === 'dead') { P.state = 'foot'; P.hp = SV.maxHp; }
  if (G.time > 22.5 || G.time < 6.5) { if (G.time > 22.5) G.day++; G.time = 7.5; }
  G.fade = 1; CAM.snap = 1; CAM.x = P.x - Math.sin(P.a) * 4; CAM.z = P.z - Math.cos(P.a) * 4; CAM.y = P.y + 2; CAM.yaw = P.a; CAM.pit = -0.15;
}; })();

/* gunmen give you a chance (he said Blumhead's keep killed him before he could react): someone who has just seen you takes a moment
   to aim (a red glint shows it), only two of them fire at you at once, they miss more when you are moving, and their shots hurt less.
   The police keep their old aim (the wanted level is their difficulty). */
var SHOTTOK = [];
function gbill(x, y, z, s, tile, o) { var yaw = Math.atan2(CAM.x - x, CAM.z - z), m = BILLQ[tile]; if (!m) { m = new R3.Mesh(); m.quad([-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0], [0, 1, 1, 1, 1, 0, 0, 0], TL(tile), [0.5, 0.5, 0.5], [0, 0, 1]); m.upload(); BILLQ[tile] = m; } R3.draw(m, ATT, Object.assign({ m: MD(x, y, z, yaw, 0, 0, s), lit: false, soft: 1 }, o || {})); }
(function () { var sh = shoot; shoot = function (who, W0) {
  if (who === P || !who || who.cop || W0.rocket || W0.thrown) return sh.apply(this, arguments);
  if (!who.lastTry || G.t - who.lastTry > 4) who.aimAt = G.t + rnd(1.0, 1.8); who.lastTry = G.t;
  if (G.t < who.aimAt) { who.cool = Math.min(who.cool || 0, 0.15); who.glint = 1; return; }
  SHOTTOK = SHOTTOK.filter(function (s) { return G.t - s.t < 1.4 && s.p !== who && !s.p.dead; });
  if (SHOTTOK.length >= 2) { who.cool = 0.4 + Math.random() * 0.6; return; }
  SHOTTOK.push({ p: who, t: G.t });
  var mv = P.state === 'foot' ? clamp((P.sp || 0) / 5, 0, 1) : 0.5, W2 = Object.create(W0); W2.spread = (W0.spread || 0.02) + 0.06 + mv * 0.1; W2.dmg = W0.dmg * (who.kind === 'goon' || who.inside ? 0.55 : 0.75);
  who.cool = (who.cool || 0) + 0.7; who.glint = 0; return sh.call(this, who, W2); }; })();
/* the glint: a little red flash at the gun while they aim */
(function () { var dp = drawPed; drawPed = function (p) { dp(p); if (p.glint && !p.dead && G.t < (p.aimAt || 0) && p.state === 'fight') { var k = 0.5 + 0.5 * Math.sin(G.t * 18); if (k > 0.2) { var m = typeof muzzle === 'function' ? muzzle(p) : [p.x, p.y + 1.3, p.z]; gbill(m[0], m[1], m[2], 0.16 * k, 'halo', { tint: [1, 0.08, 0.08], add: 1 }); } } }; })();

/* the map pans quickly (he said it scrolled way too slowly): the stick moves about a screen and a half a second and speeds up the longer
   you hold it, a drag keeps gliding after you let go, and the d-pad steps a third of a screen */
(function () { function perPx() { return CT / (Math.min(KIT.W / MW, KIT.H / MH) * G.mapOpen.zoom); }
  var sm = stepMap; stepMap = function (dt) { var M0 = G.mapOpen; if (!M0) return sm(dt);
    var s = KIT.stick(0), on = Math.hypot(s.x, s.y) > 0.15; M0.hold = on ? (M0.hold || 0) + dt : 0;
    var v = KIT.W * perPx() * (1.5 + Math.min(2.5, M0.hold * 1.5)) * dt; if (on) { M0.x = clamp(M0.x + s.x * v, 0, WX); M0.z = clamp(M0.z + s.y * v, 0, WZ); }
    if (M0.fx || M0.fz) { M0.x = clamp(M0.x + M0.fx * dt, 0, WX); M0.z = clamp(M0.z + M0.fz * dt, 0, WZ); var f = Math.pow(0.04, dt); M0.fx *= f; M0.fz *= f; if (Math.hypot(M0.fx, M0.fz) < 5) M0.fx = M0.fz = 0; }
    var ox = M0.x, oz = M0.z; sm(0); M0.x = ox; M0.z = oz; /* the old step does buttons and zoom; its own stick pan is skipped (dt 0) */
    var r = KIT.stick(1); if (G.mapOpen) G.mapOpen.zoom = clamp(G.mapOpen.zoom * (1 - r.y * dt * 1.8) * (KIT.held('rb') ? 1 + dt * 1.8 : 1) / (KIT.held('lb') ? 1 + dt * 1.8 : 1), 0.5, 6); };
  /* fling: track how fast a drag moved and keep it going */
  var mp = mapPointer; mapPointer = function (on) { mp(on); if (!on || !MAPH) return; var m0 = MAPH.m, u0 = MAPH.u, cv = KIT.ctx.canvas; var last = null;
    window.removeEventListener('pointermove', m0); window.removeEventListener('pointerup', u0); window.removeEventListener('pointercancel', u0);
    MAPH.m = function (e) { var M0 = G.mapOpen; if (M0) { var bx = M0.x, bz = M0.z, t = performance.now(); m0(e); if (M0.drag === 1) { var dtt = Math.max(8, t - (last ? last.t : t - 16)) / 1000; M0.vx = (M0.x - bx) / dtt; M0.vz = (M0.z - bz) / dtt; } last = { t: t }; M0.fx = M0.fz = 0; } else m0(e); };
    MAPH.u = function (e) { var M0 = G.mapOpen, dr = M0 && M0.drag === 1; u0(e); if (dr && M0 && last && performance.now() - last.t < 80) { M0.fx = clamp(M0.vx || 0, -6000, 6000); M0.fz = clamp(M0.vz || 0, -6000, 6000); } last = null; };
    window.addEventListener('pointermove', MAPH.m); window.addEventListener('pointerup', MAPH.u); window.addEventListener('pointercancel', MAPH.u); }; })();

/* stunt missions show where the ramps are (he asked why Steve's mission never said where to go): the GPS leads to the run-up of the
   nearest ramp you have not jumped in this mission, every ramp is on the radar, and close up the marker moves onto the ramp itself */
(function () { var sl = stuntLanded; stuntLanded = function (v) { var near = STUNTS.filter(function (s) { return dist2(s.x, s.z, G.lastRampX || -999, G.lastRampZ || -999) < 400; })[0]; var before = MS ? MS.stuntCount : 0; var r = sl.apply(this, arguments); if (MS && near && MS.stuntCount > before) { MS.stuntUsed = MS.stuntUsed || {}; MS.stuntUsed[near.id] = 1; } return r; };
  var smi = stepMission; stepMission = function (dt) { smi(dt); if (!MS || !G.mission) return; var s = MS.m.steps[MS.i]; if (!s || s.t !== 'stunts') return; var used = MS.stuntUsed || {}, px = P.x, pz = P.z;
    var L = STUNTS.filter(function (q) { return !used[q.id]; }); if (!L.length) L = STUNTS; var best = null, bd = 1e18; L.forEach(function (q) { var d = dist2(q.x, q.z, px, pz); if (d < bd) { bd = d; best = q; } }); if (!best) return;
    var run = { x: best.x - Math.sin(best.a) * 34, z: best.z - Math.cos(best.a) * 34 }, close = dist2(px, pz, run.x, run.z) < 30 * 30 || bd < 40 * 40;
    G.mission.mark = close ? { x: best.x, z: best.z } : run;
    G.blips = STUNTS.filter(function (q) { return !used[q.id]; }).map(function (q) { return { x: q.x, z: q.z, c: '#ffe36a' }; });
    G.objective = (s.msg ? s.msg.replace(/ ?\(look for the ramps\)\.?/, '.') : 'Do the stunt jumps.') + ' ' + (close ? 'Hit the ramp fast.' : 'Ramp marked: ' + best.name + '.'); }; })();

/* the car noises (he said the "duh" was far too often): one crash sound at a time across the whole town, and horns spaced out */
(function () { var last = {}, gap = { crash: 0.7, horn: 3.5 }; var pl = sfx.play; sfx.play = function (k) { if (gap[k]) { var t = performance.now() / 1000; if (t - (last[k] || -99) < gap[k]) return; last[k] = t; } return pl.apply(this, arguments); }; })();
