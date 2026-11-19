/* ---------- update 167: no wildlife beside the town's pavements (deer and rabbits only out in the fields and woods) ---------- */
(function () { var af = animalFor; animalFor = function (x, z) { var i = Math.floor(x / CT), j = Math.floor(z / CT);
  for (var dj = -4; dj <= 4; dj++) for (var di = -4; di <= 4; di++) { var ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) continue; var k = KM[nj * MW + ni]; if (k === K_PAVE || k === K_LOT) return null; }
  if (/^(downtown|redlight|cafe|labs|industrial|docks|site|suburb|factory)$/.test(dAt(x, z).style)) return null;
  return af(x, z); }; })();
