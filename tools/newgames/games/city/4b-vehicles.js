/* ---------- the vehicles: cars, vans, trucks, bikes, a skateboard, an electric scooter, boats, a helicopter and planes.
   Each type: how it handles (cls, top speed, grip...), its look, and seats. Bodies are one mesh, wheels another. ---------- */
var VT = {
  hatch: { n: 'Cumbo', cls: 'car', top: 38, acc: 9, grip: 7, len: 3.8, wid: 1.7, hgt: 1.45, col: ['#c4121c', '#f1e7d0', '#2a4a6a', '#3a6a3a', '#ffe36a'], cost: 4000, body: 'hatch' },
  saloon: { n: 'Loadmaster', cls: 'car', top: 44, acc: 10, grip: 7.5, len: 4.6, wid: 1.8, hgt: 1.45, col: ['#12040a', '#5a5a62', '#6a1a1a', '#2a3a5a', '#d8d4cc'], cost: 9000, body: 'saloon' },
  sports: { n: 'Spunkster GT', cls: 'car', top: 62, acc: 16, grip: 9.5, len: 4.4, wid: 1.9, hgt: 1.2, col: ['#c4121c', '#ffe36a', '#12040a', '#ff7ab0'], cost: 45000, body: 'sports' },
  muscle: { n: 'Dickhead Charger', cls: 'car', top: 54, acc: 15, grip: 7, len: 4.8, wid: 1.95, hgt: 1.35, col: ['#12040a', '#c4121c', '#3a2a5a', '#f1e7d0'], cost: 26000, body: 'muscle' },
  van: { n: 'Cream Van', cls: 'car', top: 34, acc: 7, grip: 6.5, len: 5, wid: 2.0, hgt: 2.3, col: ['#f1e7d0', '#5a5a62', '#c4121c'], cost: 7000, body: 'van' },
  police: { n: 'Cum City Police', cls: 'car', top: 52, acc: 14, grip: 8.5, len: 4.7, wid: 1.85, hgt: 1.5, col: ['#1a2a5a'], cost: 0, body: 'saloon', cop: 1 },
  taxi: { n: 'Cum Cab', cls: 'car', top: 42, acc: 10, grip: 7.5, len: 4.6, wid: 1.8, hgt: 1.5, col: ['#ffe36a'], cost: 8000, body: 'saloon', taxi: 1 },
  truck: { n: 'Load Hauler', cls: 'car', top: 30, acc: 6, grip: 6, len: 7.2, wid: 2.4, hgt: 3.2, col: ['#c4121c', '#2a4a6a', '#5a5a5a'], cost: 15000, body: 'truck', heavy: 1 },
  hearse: { n: 'Stiff Ride', cls: 'car', top: 40, acc: 9, grip: 7, len: 5.6, wid: 1.9, hgt: 1.7, col: ['#12040a'], cost: 12000, body: 'hearse' },
  icecream: { n: 'Cream Dream', cls: 'car', top: 30, acc: 7, grip: 6.5, len: 5, wid: 2.0, hgt: 2.6, col: ['#ff9ab4'], cost: 9000, body: 'icecream' },
  limo: { n: 'Loadsamoney Limo', cls: 'car', top: 42, acc: 9, grip: 6.5, len: 7.4, wid: 2.0, hgt: 1.45, col: ['#12040a', '#f1e7d0'], cost: 60000, body: 'limo' },
  buggy: { n: 'Sand Sperm', cls: 'car', top: 46, acc: 14, grip: 8, len: 3.4, wid: 1.8, hgt: 1.4, col: ['#ffe36a', '#c4121c'], cost: 11000, body: 'buggy', offroad: 1 },
  ambulance: { n: 'Cum City Ambulance', cls: 'car', top: 44, acc: 10, grip: 7, len: 5.4, wid: 2.1, hgt: 2.5, col: ['#f1e7d0'], cost: 0, body: 'van', amb: 1 },
  kart: { n: 'Cumhead Kart', cls: 'car', top: 50, acc: 18, grip: 11, len: 2.2, wid: 1.4, hgt: 0.9, col: ['#c4121c'], cost: 0, body: 'kart', secret: 1 },
  moto: { n: 'Spunk Rocket', cls: 'bike', top: 58, acc: 18, grip: 8, len: 2.1, wid: 0.7, hgt: 1.1, col: ['#c4121c', '#12040a', '#ffe36a'], cost: 14000, body: 'moto' },
  bmx: { n: 'Pedal Load', cls: 'bike', top: 18, acc: 5, grip: 7, len: 1.7, wid: 0.5, hgt: 1.0, col: ['#c4121c', '#4adfff', '#12040a'], cost: 400, body: 'bmx', pedal: 1 },
  scooter: { n: 'Zippy E-Scooter', cls: 'board', top: 12, acc: 4, grip: 7, len: 1.1, wid: 0.5, hgt: 1.1, col: ['#c4121c', '#7aff6a'], cost: 600, body: 'scooter' },
  skate: { n: 'Skateboard', cls: 'board', top: 11, acc: 4, grip: 6, len: 0.85, wid: 0.25, hgt: 0.15, col: ['#c4121c', '#12040a'], cost: 250, body: 'skate', carry: 1 },
  speedboat: { n: 'Seaman', cls: 'boat', top: 36, acc: 9, grip: 3, len: 6, wid: 2.2, hgt: 1.4, col: ['#f1e7d0', '#c4121c'], cost: 30000, body: 'boat' },
  dinghy: { n: 'Rubber Johnny', cls: 'boat', top: 22, acc: 7, grip: 3, len: 3.6, wid: 1.8, hgt: 0.9, col: ['#ff7a20', '#12040a'], cost: 5000, body: 'dinghy' },
  heli: { n: 'Choppa Load', cls: 'heli', top: 40, acc: 10, grip: 3, len: 9, wid: 2.4, hgt: 3, col: ['#12040a', '#c4121c', '#1a2a5a'], cost: 120000, body: 'heli' },
  plane: { n: 'Skyload', cls: 'plane', top: 70, acc: 9, grip: 3, len: 8, wid: 10, hgt: 2.6, col: ['#f1e7d0', '#c4121c'], cost: 150000, body: 'plane' },
  jet: { n: 'Cumcorde', cls: 'plane', top: 120, acc: 18, grip: 3, len: 14, wid: 9, hgt: 3.5, col: ['#f1e7d0'], cost: 400000, body: 'jet' }
};
var TRAFFICTYPES = ['hatch', 'hatch', 'saloon', 'saloon', 'saloon', 'taxi', 'van', 'muscle', 'sports', 'truck', 'hearse', 'icecream', 'moto', 'limo', 'buggy'];
var VMESH = {};
function vmesh(type, colI) {
  var key = type + ':' + colI; if (VMESH[key]) return VMESH[key]; var t = VT[type], c = t.col[colI % t.col.length], m = M(), wh = M(), L = t.len / 2, Wd = t.wid / 2, Hh = t.hgt, D = '#12040a', glass = '#1a2a3a', chrome = '#c8ccd0';
  function wheel(r, w) { tub(wh, [-w / 2, 0, 0], [w / 2, 0, 0], r, r, '#1a1a1c', 10, { T: TL('tyre'), cap: 1, cap0: 1 }); tub(wh, [w / 2, 0, 0], [w / 2 + 0.01, 0, 0], r * 0.6, r * 0.6, chrome, 8, { cap: 1 }); }
  var b = t.body, wr = 0.36;
  if (b === 'hatch' || b === 'saloon' || b === 'sports' || b === 'muscle' || b === 'hearse' || b === 'limo') {
    var low = b === 'sports' ? 0.32 : 0.38, mid = b === 'sports' ? 0.85 : 0.95, cabF = b === 'hatch' ? L * 0.5 : L * 0.3, cabB = b === 'hatch' ? -L * 0.95 : b === 'hearse' || b === 'limo' ? -L * 0.85 : -L * 0.55;
    boxC(m, -Wd, low + 0.12, -L, Wd, mid, L, c); boxC(m, -Wd - 0.01, low - 0.02, -L + 0.12, Wd + 0.01, low + 0.13, L - 0.12, '#1a1416'); boxC(m, -Wd * 0.55, mid - 0.3, L + 0.005, Wd * 0.55, mid - 0.12, L + 0.02, '#2a2a2e'); [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.02) - 0.03, mid - 0.06, cf - 0.35, s * (Wd + 0.02) + 0.03, mid + 0.04, cf - 0.15, '#12040a'); }); boxC(m, -Wd + 0.05, mid, -L + 0.2, Wd - 0.05, mid + 0.06, L - 0.2, c); // body and shoulder
    // the cabin: glass with pillars, a roof
    var rt = Hh, cf = cabF, cb = cabB; m.quad([-Wd + 0.1, mid, cf], [Wd - 0.1, mid, cf], [Wd - 0.18, rt, cf - 0.6], [-Wd + 0.18, rt, cf - 0.6], UV1, TL('w_glass'), litc(glass, [0, 0.6, 0.8]), [0, 0.6, 0.8]);
    m.quad([Wd - 0.1, mid, cb], [-Wd + 0.1, mid, cb], [-Wd + 0.18, rt, cb + (b === 'hatch' ? 0.15 : 0.5)], [Wd - 0.18, rt, cb + (b === 'hatch' ? 0.15 : 0.5)], UV1, TL('w_glass'), litc(glass, [0, 0.6, -0.8]), [0, 0.6, -0.8]);
    [-1, 1].forEach(function (s) { m.quad([s * (Wd - 0.08), mid, cf], [s * (Wd - 0.08), mid, cb], [s * (Wd - 0.18), rt, cb + (b === 'hatch' ? 0.15 : 0.5)], [s * (Wd - 0.18), rt, cf - 0.6], UV1, TL('w_glass'), litc(glass, [s, 0.3, 0]), [s, 0.3, 0]); });
    boxC(m, -Wd + 0.18, rt, cb + (b === 'hatch' ? 0.15 : 0.5), Wd - 0.18, rt + 0.05, cf - 0.6, b === 'hearse' ? D : c);
    boxC(m, -Wd - 0.02, low - 0.05, L - 0.15, Wd + 0.02, low + 0.2, L + 0.06, chrome); boxC(m, -Wd - 0.02, low - 0.05, -L - 0.06, Wd + 0.02, low + 0.2, -L + 0.15, chrome);
    [-1, 1].forEach(function (s) { boxC(m, s * Wd * 0.65 - 0.2, mid - 0.25, L, s * Wd * 0.65 + 0.2, mid - 0.08, L + 0.03, '#fff6d0', 0.8); boxC(m, s * Wd * 0.7 - 0.2, mid - 0.25, -L - 0.03, s * Wd * 0.7 + 0.2, mid - 0.1, -L, '#ff2630', 0.6); });
    if (b === 'muscle') { boxC(m, -0.35, mid + 0.06, L * 0.2, 0.35, mid + 0.22, L * 0.65, D); [-1, 1].forEach(function (s) { boxC(m, s * 0.18 - 0.08, mid + 0.065, -L, s * 0.18 + 0.08, mid + 0.07, L, '#f1e7d0'); }); }
    if (b === 'sports') { boxC(m, -Wd + 0.1, mid + 0.25, -L + 0.05, Wd - 0.1, mid + 0.32, -L + 0.4, D); [-1, 1].forEach(function (s) { boxC(m, s * (Wd - 0.3) - 0.04, mid, -L + 0.2, s * (Wd - 0.3) + 0.04, mid + 0.25, -L + 0.3, D); }); }
    if (t.cop) { boxC(m, -0.5, rt + 0.05, -0.1, -0.05, rt + 0.2, 0.15, '#ff2630', 0.8); boxC(m, 0.05, rt + 0.05, -0.1, 0.5, rt + 0.2, 0.15, '#2a6aff', 0.8); [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.01) - 0.005, low + 0.1, -L * 0.6, s * (Wd + 0.01) + 0.005, mid - 0.05, L * 0.6, '#f1e7d0'); }); }
    if (t.taxi) { boxC(m, -0.4, rt + 0.05, -0.15, 0.4, rt + 0.3, 0.15, '#12040a'); boxC(m, -0.38, rt + 0.07, -0.16, 0.38, rt + 0.28, -0.15, '#ffe36a', 0.5); }
    if (b === 'hearse') { [-1, 1].forEach(function (s) { m.quad([s * (Wd + 0.01), mid, cb + 0.6], [s * (Wd + 0.01), mid, cb + 1.6], [s * (Wd + 0.01), rt - 0.1, cb + 1.6], [s * (Wd + 0.01), rt - 0.1, cb + 0.6], UV1, TL('velvet'), [0.5, 0.5, 0.5], [s, 0, 0]); }); }
    [[Wd, L * 0.66], [-Wd, L * 0.66], [Wd, -L * 0.66], [-Wd, -L * 0.66]].forEach(function () {}); wheel(b === 'muscle' ? 0.4 : 0.36, 0.26); wr = b === 'muscle' ? 0.4 : 0.36;
  } else if (b === 'van' || b === 'icecream') {
    boxC(m, -Wd, 0.55, -L, Wd, Hh, L - 0.9, c); boxC(m, -Wd, 0.55, L - 0.9, Wd, 1.1, L, c); boxC(m, -Wd - 0.01, 0.32, -L - 0.01, Wd + 0.01, 0.56, L + 0.01, '#1a1416'); boxC(m, -Wd + 0.1, Hh, -L + 0.3, Wd - 0.1, Hh + 0.05, L - 1.1, '#3a3236');
    [-1, 1].forEach(function (s) { m.quad([s * (Wd + 0.012), 1.15, L - 1.0], [s * (Wd + 0.012), 1.15, L - 0.2], [s * (Wd + 0.012), Hh - 0.15, L - 0.85], [s * (Wd + 0.012), Hh - 0.15, L - 1.0], UV1, TL('w_glass'), litc(glass, [s, 0.2, 0]), [s, 0.2, 0]); boxC(m, s * Wd - 0.06, 0.6, -L * 0.62 - 0.55, s * Wd + 0.06, 0.62, -L * 0.62 + 0.55, '#12040a'); boxC(m, s * Wd - 0.06, 0.6, L * 0.62 - 0.55, s * Wd + 0.06, 0.62, L * 0.62 + 0.55, '#12040a'); });
    m.quad([Wd - 0.15, 1.3, -L - 0.012], [0.03, 1.3, -L - 0.012], [0.03, Hh - 0.25, -L - 0.012], [Wd - 0.15, Hh - 0.25, -L - 0.012], UV1, TL('w_glass'), litc(glass, [0, 0, -1]), [0, 0, -1]); m.quad([-0.03, 1.3, -L - 0.012], [-Wd + 0.15, 1.3, -L - 0.012], [-Wd + 0.15, Hh - 0.25, -L - 0.012], [-0.03, Hh - 0.25, -L - 0.012], UV1, TL('w_glass'), litc(glass, [0, 0, -1]), [0, 0, -1]);
    boxC(m, -Wd * 0.5, 0.6, L, Wd * 0.5, 0.85, L + 0.02, '#2a2a2e'); m.quad([-Wd + 0.05, 1.1, L - 0.05], [Wd - 0.05, 1.1, L - 0.05], [Wd - 0.1, Hh - 0.1, L - 0.85], [-Wd + 0.1, Hh - 0.1, L - 0.85], UV1, TL('w_glass'), litc(glass, [0, 0.6, 0.8]), [0, 0.6, 0.8]);
    [-1, 1].forEach(function (s) { boxC(m, s * Wd * 0.65 - 0.2, 0.75, L, s * Wd * 0.65 + 0.2, 0.92, L + 0.03, '#fff6d0', 0.8); boxC(m, s * Wd * 0.75 - 0.15, 0.8, -L - 0.03, s * Wd * 0.75 + 0.15, 1.0, -L, '#ff2630', 0.6); });
    if (b === 'icecream') { tub(m, [0, Hh, -0.4], [0, Hh + 0.6, -0.4], 0.35, 0.25, '#f1e7d0', 8); ell(m, 0, Hh + 0.85, -0.4, 0.42, 0.42, 0.42, '#ff9ab4', 8, 5); tub(m, [0, Hh + 1.2, -0.4], [0.1, Hh + 1.5, -0.45], 0.08, 0.0, '#c4121c', 6); [-1, 1].forEach(function (s) { m.quad([s * (Wd + 0.01), 1.0, -1.4], [s * (Wd + 0.01), 1.0, 0.4], [s * (Wd + 0.01), 1.9, 0.4], [s * (Wd + 0.01), 1.9, -1.4], UV1, TL('litwin'), [0.5, 0.5, 0.5], [s, 0, 0], 0.4); }); }
    else if (t.amb) { [-1, 1].forEach(function (s) { boxC(m, s * (Wd + 0.01) - 0.005, 1.2, -L + 0.4, s * (Wd + 0.01) + 0.005, 1.5, L - 1, '#c4121c'); }); boxC(m, -0.5, Hh, 0.6, 0.5, Hh + 0.15, 0.85, '#2a6aff', 0.8); }
    else [-1, 1].forEach(function (s) { m.quad([s * (Wd + 0.01), 1.0, -L + 0.4], [s * (Wd + 0.01), 1.0, L - 1.2], [s * (Wd + 0.01), 1.9, L - 1.2], [s * (Wd + 0.01), 1.9, -L + 0.4], UV1, TL('sign_' + (s > 0 ? 'wash' : 'wash')), [0.5, 0.5, 0.5], [s, 0, 0]); });
    wheel(0.38, 0.28); wr = 0.38;
  } else if (b === 'truck') {
    boxC(m, -Wd, 0.6, L - 2.2, Wd, 2.6, L, c); m.quad([-Wd + 0.05, 1.6, L + 0.01], [Wd - 0.05, 1.6, L + 0.01], [Wd - 0.05, 2.4, L + 0.01], [-Wd + 0.05, 2.4, L + 0.01], UV1, TL('w_glass'), litc(glass, [0, 0, 1]), [0, 0, 1]);
    boxT(m, -Wd, 0.9, -L, Wd, Hh, L - 2.3, { wall: 'container', top: 'metal', u: 2.4, v: 2.4 }); boxC(m, -Wd, 0.5, -L, Wd, 0.9, L, '#2a2a2e'); wheel(0.5, 0.36); wr = 0.5;
  } else if (b === 'buggy' || b === 'kart') {
    boxC(m, -Wd * 0.8, 0.35, -L, Wd * 0.8, 0.6, L, c); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { tub(m, [q[0] * Wd * 0.7, 0.6, q[1] * L * 0.4], [q[0] * Wd * 0.5, b === 'kart' ? 0.9 : 1.5, q[1] * L * 0.2], 0.04, 0.04, D, 4); }); if (b === 'buggy') boxC(m, -Wd * 0.55, 1.5, -L * 0.25, Wd * 0.55, 1.55, L * 0.25, D);
    boxC(m, -0.3, 0.6, -L * 0.3, 0.3, 1.0, -L * 0.05, D); wheel(b === 'kart' ? 0.25 : 0.45, 0.34); wr = b === 'kart' ? 0.25 : 0.45;
  } else if (b === 'moto' || b === 'bmx') {
    var f = b === 'moto'; boxC(m, -0.14, 0.45, -0.6, 0.14, f ? 0.8 : 0.5, 0.5, f ? c : D); if (f) { ell(m, 0, 0.85, 0.25, 0.22, 0.14, 0.35, c, 8, 4); boxC(m, -0.13, 0.82, -0.6, 0.13, 0.92, -0.05, D); }
    tub(m, [0, 0.4, 0.75], [0, 1.0, 0.55], 0.03, 0.03, chrome, 5); tub(m, [-0.32, 1.0, 0.55], [0.32, 1.0, 0.55], 0.025, 0.025, D, 5); if (!f) { tub(m, [0, 0.4, -0.6], [0, 0.85, -0.2], 0.03, 0.03, c, 5); boxC(m, -0.08, 0.85, -0.3, 0.08, 0.9, -0.1, D); }
    if (f) boxC(m, -0.08, 0.7, 0.86, 0.08, 0.82, 0.9, '#fff6d0', 0.8); wheel(f ? 0.33 : 0.3, 0.1); wr = f ? 0.33 : 0.3;
  } else if (b === 'scooter') { boxC(m, -0.08, 0.1, -0.45, 0.08, 0.15, 0.35, c); tub(m, [0, 0.15, 0.38], [0, 1.05, 0.3], 0.025, 0.025, D, 5); tub(m, [-0.25, 1.05, 0.3], [0.25, 1.05, 0.3], 0.02, 0.02, D, 5); wheel(0.1, 0.06); wr = 0.1; }
  else if (b === 'skate') { boxC(m, -0.12, 0.08, -0.42, 0.12, 0.11, 0.42, c); boxC(m, -0.121, 0.111, -0.41, 0.121, 0.112, 0.41, '#12040a'); wheel(0.035, 0.18); wr = 0.035; }
  else if (b === 'boat' || b === 'dinghy') {
    var f2 = b === 'boat'; for (var k = 0; k < 6; k++) { var z0 = -L + k * L / 3, z1 = z0 + L / 3, w0 = Wd * (k < 4 ? 1 : (6 - k) / 2.5), w1 = Wd * (k + 1 < 4 ? 1 : Math.max(0.05, (6 - k - 1) / 2.5)); [-1, 1].forEach(function (s) { m.quad([s * w0, 0, z0], [s * w1, 0, z1], [s * w1 * 0.7, -0.5, z1], [s * w0 * 0.7, -0.5, z0], UV1, TL('white'), litc(f2 ? '#f1e7d0' : c, [s, -0.3, 0]), [s, -0.3, 0]); m.quad([s * w0, 0, z0], [s * w1, 0, z1], [s * w1, 0.5, z1], [s * w0, 0.5, z0], UV1, TL('white'), litc(c, [s, 0, 0]), [s, 0, 0]); }); m.quad([-w0 * 0.7, -0.5, z0], [w0 * 0.7, -0.5, z0], [w1 * 0.7, -0.5, z1], [-w1 * 0.7, -0.5, z1], UV1, TL('white'), litc(D, [0, -1, 0]), [0, -1, 0]); }
    boxC(m, -Wd + 0.1, 0.2, -L + 0.2, Wd - 0.1, 0.3, L * 0.6, f2 ? '#5a3a20' : D); if (f2) { m.quad([-Wd + 0.2, 0.5, L * 0.1], [Wd - 0.2, 0.5, L * 0.1], [Wd - 0.3, 1.3, -0.2], [-Wd + 0.3, 1.3, -0.2], UV1, TL('w_glass'), litc(glass, [0, 0.6, 0.8]), [0, 0.6, 0.8]); boxC(m, -0.3, 0.3, -L + 0.1, 0.3, 0.9, -L + 0.6, '#2a2a2e'); }
  } else if (b === 'heli') {
    ell(m, 0, 1.4, 0.8, 1.2, 1.2, 2.0, c, 10, 6); ell(m, 0, 1.6, 1.6, 0.9, 0.8, 1.0, glass, 8, 4, { b1: 1.6 }); tub(m, [0, 1.5, -1], [0, 1.9, -5.2], 0.4, 0.15, c, 6); boxC(m, -0.04, 1.6, -5.4, 0.04, 2.8, -4.8, c); [-1, 1].forEach(function (s) { tub(m, [s * 0.9, 0.05, -1.2], [s * 0.9, 0.05, 2.4], 0.05, 0.05, D, 5); tub(m, [s * 0.9, 0.05, 0], [s * 0.6, 0.6, 0], 0.04, 0.04, D, 4); }); tub(m, [0, 2.6, 0.6], [0, 3.0, 0.6], 0.12, 0.12, D, 6);
    var rot = M(); boxC(rot, -4.8, -0.03, -0.18, 4.8, 0.03, 0.18, '#2a2a2e'); boxC(rot, -0.18, -0.03, -4.8, 0.18, 0.03, 4.8, '#2a2a2e'); VMESH[key + 'r'] = rot.upload();
  } else if (b === 'plane' || b === 'jet') {
    var j = b === 'jet'; tub(m, [0, 1.5, -L * 0.5], [0, 1.6, L * 0.4], j ? 0.8 : 0.7, j ? 0.9 : 0.7, c, 10, { cap: 1 }); ell(m, 0, 1.6, L * 0.42, j ? 0.9 : 0.7, j ? 0.8 : 0.7, j ? 2.4 : 1.2, j ? c : '#c4121c', 10, 5);
    ell(m, 0, 2.05, L * 0.22, 0.45, 0.35, 0.9, glass, 8, 4); var ww = t.wid / 2; m.quad([-ww, 1.5, j ? -1 : 0.6], [ww, 1.5, j ? -1 : 0.6], [ww, 1.5, j ? 0.4 : 1.8], [-ww, 1.5, j ? 0.4 : 1.8], UV1, TL('white'), litc(c, [0, 1, 0]), [0, 1, 0]); m.quad([-ww, 1.35, j ? -1 : 0.6], [ww, 1.35, j ? -1 : 0.6], [ww, 1.35, j ? 0.4 : 1.8], [-ww, 1.35, j ? 0.4 : 1.8], UV1, TL('white'), litc(c, [0, -1, 0]), [0, -1, 0]);
    boxC(m, -ww, 1.35, j ? -1 : 0.6, ww, 1.5, j ? 0.4 : 1.8, c); boxC(m, -2, 1.6, -L * 0.5, 2, 1.7, -L * 0.5 + 1, c); boxC(m, -0.05, 1.6, -L * 0.5, 0.05, 3.2, -L * 0.5 + 1.1, '#c4121c'); [-1, 1].forEach(function (s) { boxC(m, s * ww - 0.4 * s - 0.1, 1.4, 0.8, s * ww - 0.4 * s + 0.1, 1.55, 1.4, '#ff2630', 0.8); });
    tub(m, [0, 0.4, L * 0.3], [0, 1.2, L * 0.3], 0.05, 0.05, D, 4); [-1, 1].forEach(function (s) { tub(m, [s * 1.2, 0.4, -0.2], [s * 0.6, 1.3, -0.2], 0.05, 0.05, D, 4); });
    if (!j) { var pr = M(); boxC(pr, -1.1, -0.06, -0.03, 1.1, 0.06, 0.03, '#2a2a2e'); VMESH[key + 'r'] = pr.upload(); } wheel(0.3, 0.2); wr = 0.3;
  }
  if (!wh.n) wheel(0.3, 0.2);
  var sh = M(); sh.quad([-Wd * 1.15, 0.02, -L * 1.1], [-Wd * 1.15, 0.02, L * 1.1], [Wd * 1.15, 0.02, L * 1.1], [Wd * 1.15, 0.02, -L * 1.1], UV1, TL('shadow'), [0.5, 0.5, 0.5], [0, 1, 0]);
  VMESH[key] = { body: m.upload(), wheel: wh.upload(), wr: wr, sh: sh.upload() };
  return VMESH[key];
}
/* a vehicle in the world */
var VEH = [];
function makeVeh(type, x, z, a, o) {
  var t = VT[type]; o = o || {}; var v = { type: type, t: t, x: x, z: z, y: groundY(x, z), a: a, sp: 0, vx: 0, vz: 0, vy: 0, steer: 0, pitch: 0, roll: 0, hp: 100, col: o.col !== undefined ? o.col : Math.floor(Math.random() * 9), wheelA: 0, rotor: 0,
    driver: o.driver || null, ai: o.ai || null, owned: o.owned || 0, mission: o.mission || 0, siren: !!t.cop, air: 0, alt: 0, fire: 0, dead: 0, id: Math.random() };
  if (t.cls === 'boat') v.y = WATERY; if (t.cls === 'heli' || t.cls === 'plane') { v.y = standY(x, z, 999); v.ground = 1; }
  VEH.push(v); return v;
}
function drawVeh(v) {
  var t = v.t, VM = vmesh(v.type, v.col), m = MD(v.x, v.y, v.z, v.a, v.pitch, v.roll), fl = v.flash > 0 ? [0.6, 0.6, 0.6] : null, burnt = v.dead ? [0.25, 0.22, 0.22] : null;
  R3.draw(VM.body, ATT, { m: m, flash: fl, tint: burnt || [0.82, 0.82, 0.82] });
  var L = t.len / 2, Wd = t.wid / 2;
  if (t.cls === 'car') [[Wd, L * 0.66, 1], [-Wd, L * 0.66, 1], [Wd, -L * 0.66, 0], [-Wd, -L * 0.66, 0]].forEach(function (w) { R3.draw(VM.wheel, ATT, { m: MM(m, MD(w[0] * (w[0] > 0 ? 1 : 1), VM.wr, w[1], w[2] ? v.steer * 0.5 : 0, v.wheelA, 0)), tint: burnt }); });
  else if (t.cls === 'bike') [[0, t.len * 0.36], [0, -t.len * 0.32]].forEach(function (w, i) { R3.draw(VM.wheel, ATT, { m: MM(m, MD(0, VM.wr, w[1], i ? 0 : v.steer * 0.5, v.wheelA, 0)) }); });
  else if (t.cls === 'board') [[0, t.len * 0.38], [0, -t.len * 0.38]].forEach(function (w) { R3.draw(VM.wheel, ATT, { m: MM(m, MD(0, VM.wr, w[1], 0, v.wheelA, 0)) }); });
  else if (t.cls === 'heli' && VMESH[v.type + ':' + v.col + 'r']) R3.draw(VMESH[v.type + ':' + v.col + 'r'], ATT, { m: MM(m, MD(0, 3.05, 0.6, v.rotor, 0, 0)) });
  else if (t.cls === 'plane') { if (VMESH[v.type + ':' + v.col + 'r']) R3.draw(VMESH[v.type + ':' + v.col + 'r'], ATT, { m: MM(m, MD(0, 1.6, t.len * 0.5 + 0.55, 0, 0, v.rotor)) }); if (v.ground) [[1.2, -0.2], [-1.2, -0.2], [0, t.len * 0.3]].forEach(function (w) { R3.draw(VM.wheel, ATT, { m: MM(m, MD(w[0], VM.wr, w[1], 0, v.wheelA, 0)) }); }); }
  var gy = v.t.cls === 'boat' ? v.y : groundY(v.x, v.z); if (v.y - gy < 40) R3.draw(VM.sh, ATT, { m: MD(v.x, gy + 0.05, v.z, v.a, 0, 0), soft: 1, lit: false, alpha: clamp(0.75 - (v.y - gy) / 40, 0, 0.75) });
}
