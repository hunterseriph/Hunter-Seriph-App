/* ---------- update 172 (his ask: Ejaculand needs a big car park): the open ground between the motel and the avenue,
   north of the road that runs west from the gate, becomes car park ground at load (no trees, no grass). Its bays,
   lamps, booth and signs are laid out in 9zb-u172-ejac.js; the lot painter leaves these squares alone (EJCP). ---- */
var EJCP_RECT = { x0: 1960, z0: 2264, x1: 2036, z1: 2332 }, EJCP = {};
(function () { for (var z = EJCP_RECT.z0; z < EJCP_RECT.z1; z += CT) for (var x = EJCP_RECT.x0; x < EJCP_RECT.x1; x += CT) { var i = Math.floor(x / CT), j = Math.floor(z / CT), t = j * MW + i; if (KM[t] === K_ROAD || isWaterK(KM[t])) continue; KM[t] = K_LOT; EJCP[t] = 1; } })();
