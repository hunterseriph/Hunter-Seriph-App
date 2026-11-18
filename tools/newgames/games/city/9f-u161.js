/* ---------- update 161: garages you drive into, feet that find the ground, cars that ignore the kerb ---------- */
function storeCar(h) { var v = P.veh; if (!v || v.dead) return; if (v.t.cls === 'heli' || v.t.cls === 'plane' || v.t.cls === 'boat') { toast('That will not fit in the garage.'); return; }
  if (v.owned && v.slot !== undefined && SV.cars[v.slot]) custSave(v); else SV.cars.push({ type: v.type, col: v.col, cust: v.cust ? JSON.parse(JSON.stringify(v.cust)) : null });
  var g = homeGarage(h.b); exitVehicle(true); var i = VEH.indexOf(v); if (i >= 0) VEH.splice(i, 1); P.x = g.x + g.ux * 2.4; P.z = g.z + g.uz * 2.4; P.y = standY(P.x, P.z, 999); P.a = g.a; G.fade = 1.0; sfx.play('door'); toast('Driven in and kept. ' + VT[v.type].n + ' is in your garage.'); persist(); }
(function () { var ws = worldSetup; worldSetup = function () { ws(); G.uses = G.uses.filter(function (u) { return u.label !== 'GARAGE'; });
  HOUSES.forEach(function (h) { if (SV.houses.indexOf(h.id) < 0) return; var g = homeGarage(h.b);
    G.uses.push({ x: g.door[0] + g.nx * 2.2, z: g.door[1] + g.nz * 2.2, r: 3.6, car: 1, label: 'DRIVE INTO YOUR GARAGE', fn: function () { storeCar(h); } });
    G.uses.push({ x: g.door[0] + g.nx * 1.0, z: g.door[1] + g.nz * 1.0, r: 2.2, label: 'GARAGE', icon: 'G', fn: function () { garageMenu(h); } }); }); }; })();
/* cars ride over the kerb instead of hopping it: the 15 cm pavement step is for feet */
(function () { var sv = stepVehicle; stepVehicle = function (v, inp, dt) { window.NOPAVE = 1; try { return sv(v, inp, dt); } finally { window.NOPAVE = 0; } }; })();
/* his feet find the ground: the body sits on the lower foot and the other leg bends at the hip and knee to reach
   the kerb or the slope (one foot floated before) */
(function () { var pp = poseOfPlayer; poseOfPlayer = function () { var Q = pp(); if (!P || P.state !== 'foot' || !P.ground || P.swim || P.ragT > 0 || G.seat || G.interior) return Q;
  var a = P.a, rx = Math.cos(a), rz = -Math.sin(a), fx = Math.sin(a), fz = Math.cos(a), L = 0.33, g = [];
  for (var k = 0; k < 2; k++) { var side = k ? -0.105 : 0.105, fw = L * Math.sin(Q.hip[k]) + L * Math.sin(Q.hip[k] - Q.kn[k]), x = P.x + rx * side + fx * fw, z = P.z + rz * side + fz * fw; g.push(standY(x, z, P.y + 0.45)); }
  var lo = Math.min(g[0], g[1]), drop = P.y - lo; if (drop > 0.01 && drop < 0.5) Q.y = (Q.y || 0) - drop;
  for (var k2 = 0; k2 < 2; k2++) { var d = g[k2] - lo; if (d < 0.015) continue; d = Math.min(d, 0.45); var th = Math.acos(clamp(1 - d / (2 * L), -1, 1)); Q.hip[k2] += th; Q.kn[k2] += th * 2; }
  if (P.sp > 0.5) { var up = (standY(P.x + fx * 0.6, P.z + fz * 0.6, P.y + 0.6) - standY(P.x - fx * 0.6, P.z - fz * 0.6, P.y + 0.6)) / 1.2; P.slK = (P.slK || 0) + (clamp(up, -0.6, 0.6) - (P.slK || 0)) * 0.15; Q.lean = (Q.lean || 0) + clamp(P.slK * 0.4, -0.1, 0.2); } /* leans into a climb, sits back going down */
  return Q; }; })();
