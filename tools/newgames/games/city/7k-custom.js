/* ---------- update 160: Cream Customs, the auto shop (his ask). Drive in and change the paint, a spoiler, neon under
   the car, the engine, the handling and the armour. Cars you own keep it all (it is saved with the car in your
   garage); a stolen car keeps it only until it is gone. Every change asks before it spends. ---------- */
HIPAINT.sign_custom = function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 8, 64, 48); g.fillStyle = '#c4121c'; g.fillRect(0, 8, 64, 3); g.fillRect(0, 53, 64, 3);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffe36a'; g.font = '13px "Pirata One", serif'; g.fillText('CREAM', 32, 22); g.fillText('CUSTOMS', 32, 36); g.fillStyle = '#f1e7d0'; g.font = 'bold 6px "Archivo Narrow", sans-serif'; g.fillText('PIMP YOUR LOAD', 32, 48); };
SIGNOF.custom = 'sign_custom';
var CUSTP = [['Blood Red', '#c4121c'], ['Hot Red', '#ff2630'], ['Bone', '#f1e7d0'], ['Midnight', '#12040a'], ['Gold', '#ffe36a'], ['Cream', '#e8dcc0'], ['Bruise', '#3a1a5a'], ['Pill Pink', '#ff7ab0'], ['Toxic Green', '#3a9a3a'], ['Sea Blue', '#2a4a8a'], ['Gunmetal', '#4a4a52'], ['Rust', '#8a3a1a'], ['Chilli Orange', '#e8641a'], ['Lilac', '#c48aff'], ['Teal', '#1a7a7a'], ['Chrome', '#c8ccd2']];
var CUSTS = { spoiler: [['None', 0], ['Lip', 600], ['Wing', 1200], ['Big Wing', 2200]], neon: [['None', 0, null], ['Red', 800, '#ff2630'], ['Cream', 800, '#f1e7d0'], ['Gold', 800, '#ffe36a'], ['Purple', 800, '#c040ff'], ['Blue', 800, '#3a8aff'], ['Pink', 800, '#ff3aa0']],
  engine: [['Stock', 0], ['Street', 2000], ['Sport', 5000], ['Race', 9000]], grip: [['Stock', 0], ['Street', 1500], ['Sport', 3500], ['Race', 6000]], armour: [['Stock', 0], ['Plated', 2500], ['Heavy', 6000], ['Tank', 10000]] };
function colIndex(type, hex) { var a = VT[type].col, i = a.indexOf(hex); if (i < 0) { a.push(hex); i = a.length - 1; } return i; }
function applyCust(v) { var c = v.cust; if (!c) return; var t0 = VT[v.type], t = {}; for (var k in t0) t[k] = t0[k];
  t.top = t0.top * (1 + 0.07 * (c.engine || 0)); t.acc = t0.acc * (1 + 0.12 * (c.engine || 0)); t.grip = t0.grip * (1 + 0.09 * (c.grip || 0)); v.t = t;
  if (c.paint) v.col = colIndex(v.type, c.paint); }
(function () { var hv = hurtVeh; hurtVeh = function (v, dmg, by, isBoom) { if (v.cust && v.cust.armour && dmg < 300) dmg *= [1, 0.72, 0.52, 0.36][v.cust.armour]; return hv(v, dmg, by, isBoom); }; })();
function custSave(v) { if (v.owned && v.slot !== undefined && SV.cars[v.slot]) { SV.cars[v.slot].cust = JSON.parse(JSON.stringify(v.cust)); SV.cars[v.slot].col = v.col; persist(); } }
function customMenu() { var v = P.veh; if (!v || v.dead) return; if (v.t.cls !== 'car' && v.t.cls !== 'bike') { toast('Cream Customs only does cars and bikes.'); return; }
  v.cust = v.cust || {}; v.sp = 0; var c = v.cust, kept = v.owned && v.slot !== undefined;
  function buy(name, price, fn, back) { if (price <= 0) { fn(); back(); return; } KIT.confirm({ title: name, sub: v.t.n + (kept ? '' : ' (stolen: it stays till the car is gone)'), price: price, have: Math.floor(SV.money), unit: '$', yes: function () { if (SV.money < price) { toast('Not enough money.'); back(); return; } money(-price); fn(); applyCust(v); custSave(v); sfx.play('coin'); back(); }, no: back }); }
  function part(key, title) { var L = CUSTS[key]; KIT.menu({ title: title, sub: 'Now: ' + L[c[key] || 0][0], items: L.map(function (o, i) { return { label: o[0] + (i === (c[key] || 0) ? '  (FITTED)' : o[1] ? '  $' + o[1].toLocaleString('en-GB') : ''), fn: function () { if (i === (c[key] || 0)) return; buy(title + ': ' + o[0], o[1], function () { c[key] = i; }, function () { part(key, title); }); } }; }).concat([{ label: 'BACK', back: true, fn: customMenu }]) }); }
  function paint() { KIT.menu({ title: 'Paint', sub: '$300 a coat', grid: true, items: CUSTP.map(function (p) { return { label: p[0] + (c.paint === p[1] ? '  (ON)' : ''), fn: function () { buy('Paint: ' + p[0], 300, function () { c.paint = p[1]; }, paint); } }; }).concat([{ label: 'BACK', back: true, fn: customMenu }]) }); }
  KIT.menu({ title: 'Cream Customs', sub: v.t.n + (kept ? ' · yours, it keeps everything' : ' · stolen: the work goes when the car does. Park it in your garage to keep it.'), items: [
    { label: 'PAINT', fn: paint }, { label: 'SPOILER', fn: function () { part('spoiler', 'Spoiler'); } }, { label: 'NEON UNDERGLOW', fn: function () { part('neon', 'Neon'); } },
    { label: 'ENGINE', fn: function () { part('engine', 'Engine'); } }, { label: 'HANDLING', fn: function () { part('grip', 'Handling'); } }, { label: 'ARMOUR', fn: function () { part('armour', 'Armour'); } },
    { label: 'REPAIR ($150)', fn: function () { buy('Repair', 150, function () { v.hp = 100; v.fire = 0; }, customMenu); } },
    { label: 'DRIVE OUT', back: true, fn: KIT.closeMenu }] }); }
/* drawn on the car: the spoiler and the neon under it */
var CUSTM = {};
function spoilerMesh(type, kind, hex) { var key = type + ':' + kind + ':' + hex; if (CUSTM[key]) return CUSTM[key]; var t = VT[type], m = new R3.Mesh(), L = t.len / 2, Wd = t.wid / 2, y = Math.min(t.hgt, 1.6) * 0.78, z = -L + 0.25;
  if (kind === 1) boxC(m, -Wd + 0.15, y, z - 0.1, Wd - 0.15, y + 0.07, z + 0.2, hex);
  else { var hh = kind === 3 ? 0.55 : 0.32, ww = kind === 3 ? Wd + 0.05 : Wd - 0.1; [-1, 1].forEach(function (s) { boxC(m, s * (Wd - 0.35) - 0.04, y, z - 0.05, s * (Wd - 0.35) + 0.04, y + hh, z + 0.05, '#1a1a1e'); });
    boxC(m, -ww, y + hh, z - 0.28, ww, y + hh + 0.06, z + 0.12, hex); [-1, 1].forEach(function (s) { boxC(m, s * ww - 0.03, y + hh - 0.12, z - 0.3, s * ww + 0.03, y + hh + 0.12, z + 0.14, '#12040a'); }); }
  return (CUSTM[key] = m.upload()); }
function neonMesh(type, hex) { var key = 'n:' + type + ':' + hex; if (CUSTM[key]) return CUSTM[key]; var t = VT[type], m = new R3.Mesh(), L = t.len / 2 + 0.3, Wd = t.wid / 2 + 0.35;
  m.quad([-Wd, 0.06, -L], [-Wd, 0.06, L], [Wd, 0.06, L], [Wd, 0.06, -L], UV1, TL('white'), rgb01(hex).map(function (q) { return q * 0.9; }), [0, 1, 0]); boxC(m, -t.wid / 2 + 0.1, 0.22, -L + 0.5, t.wid / 2 - 0.1, 0.27, L - 0.5, hex, 1);
  return (CUSTM[key] = m.upload()); }
(function () { var dv = drawVeh; drawVeh = function (v) { dv(v); var c = v.cust; if (!c || v.dead) return; if ((v.x - CAM.x) * (v.x - CAM.x) + (v.z - CAM.z) * (v.z - CAM.z) > 90 * 90) return;
  var M2 = MD(v.x, v.y, v.z, v.a, v.pitch, v.roll), hex = VT[v.type].col[v.col % VT[v.type].col.length];
  if (c.spoiler) R3.draw(spoilerMesh(v.type, c.spoiler, hex), ATT, { m: M2, tint: [0.82, 0.82, 0.82] });
  if (c.neon && CUSTS.neon[c.neon][2]) R3.draw(neonMesh(v.type, CUSTS.neon[c.neon][2]), ATT, { m: M2, lit: false, alpha: 0.55 + 0.1 * Math.sin(G.t * 4) }); }; })();
/* the garage keeps each car's work, and knows which slot a car came from */
function garageMenu(h) { var d = doorOf(h.b), x = d.x + Math.sin(d.a) * 7, z = d.z + Math.cos(d.a) * 7; if (typeof homeGarage === 'function') { var gg = homeGarage(h.b); x = gg.x; z = gg.z; d = { x: x, z: z, a: gg.a }; }
  KIT.menu({ title: 'Garage', sub: h.name, items: SV.cars.map(function (c, i) { var ex = VEH.filter(function (v) { return v.owned && v.slot === i && !v.dead; })[0]; return { label: VT[c.type].n + (c.cust ? ' (customised)' : '') + (ex ? '  · out' : ''), fn: function () { if (ex) { var j = VEH.indexOf(ex); if (j >= 0 && ex !== P.veh) VEH.splice(j, 1); }
      var v = makeVeh(c.type, x, z, d.a, { owned: 1, col: c.col }); v.slot = i; v.keep = 1; if (c.cust) { v.cust = JSON.parse(JSON.stringify(c.cust)); applyCust(v); } KIT.closeMenu(); toast('Your ' + VT[c.type].n + ' is out front.'); } }; })
    .concat(SV.kart ? [{ label: 'Cumhead Kart (Lost Loads prize)', fn: function () { var v = makeVeh('kart', x, z, d.a, { owned: 1 }); v.keep = 1; KIT.closeMenu(); } }] : [])
    .concat(P.veh && !(P.veh.owned && P.veh.slot !== undefined) ? [{ label: 'PARK THIS ' + P.veh.t.n.toUpperCase() + ' HERE (KEEP IT)', fn: function () { var v = P.veh; SV.cars.push({ type: v.type, col: v.col, cust: v.cust ? JSON.parse(JSON.stringify(v.cust)) : null }); exitVehicle(true); VEH.splice(VEH.indexOf(v), 1); KIT.closeMenu(); toast('Parked and kept, with all its work.'); persist(); } }] : [])
    .concat(P.veh && P.veh.owned && P.veh.slot !== undefined ? [{ label: 'PUT THE ' + P.veh.t.n.toUpperCase() + ' AWAY', fn: function () { var v = P.veh; custSave(v); exitVehicle(true); VEH.splice(VEH.indexOf(v), 1); KIT.closeMenu(); toast('Put away.'); } }] : [])
    .concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }
/* painted colours of saved cars come back on load */
(function () { var done = 0; var ws = worldSetup; worldSetup = function () { if (!done && SV && SV.cars) { done = 1; SV.cars.forEach(function (c) { if (c.cust && c.cust.paint && VT[c.type]) c.col = colIndex(c.type, c.cust.paint); }); } ws(); }; })();
