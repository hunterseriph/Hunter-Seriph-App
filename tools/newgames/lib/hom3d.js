/* =====================================================================================================
   hom3d.js (update 132): 3D homunculi of every breed, and a 3D Sir Johnathan, for the 3D games (built with Psycho
   Nightmare's shapes: ell, tub, bxp, M). Colours and features follow tools/homunculus/gen.py: a round body in the breed's
   skin, the brain showing on top, one big eye or two, stubby legs and arms, and the breed's own thing (Gloop's mole,
   Bulwark's bone plates, Embertail's flame tail, Frostbite's icicles, Voltling's antennae, Mendling's bandage, Leechling's
   fangs, Peeper's single eye, Goldie's gold tooth, Titan's horns and scar, Bloodmoon's crescent horns and red spines).
   HOM3D.get(breed, stage) gives { mesh, h } (stage baby / teen / adult: bigger and longer in the leg as they grow).
   ===================================================================================================== */
var HOM3D = (function () {
  var PAL = { gloop: ['#5cc7c9', '#2a8a94', '#c98e7c', '#8dff4a'], guard: ['#9aa0e0', '#5a5ea8', '#c49aa0', '#7dffd0'], ember: ['#f08a44', '#b8461e', '#d07a5a', '#ffe36a'], frost: ['#c4f0ff', '#6ab8d8', '#d8b0c0', '#e8ffff'],
    volt: ['#f4e060', '#b8a020', '#c890c8', '#c070ff'], medic: ['#ffa8cc', '#d86a9a', '#e0a090', '#7dffd0'], leech: ['#a878dc', '#6a3a9a', '#c87a8a', '#ff3a44'], scout: ['#c4e070', '#8aa83a', '#c8987a', '#ffe36a'],
    goldie: ['#ffd870', '#c8962a', '#d89a7a', '#8dff4a'], titan: ['#8a8a9a', '#565466', '#c07a6a', '#ff3a2a'], blood: ['#5a4650', '#2e2228', '#ff3a44', '#ff2630'] };
  var cache = {};
  function build(br, stage) {
    var P = PAL[br] || PAL.gloop, m = M(), k = stage === 'baby' ? 0.75 : stage === 'teen' ? 0.9 : 1, leg = stage === 'baby' ? 0.1 : stage === 'teen' ? 0.16 : 0.22, by = leg + 0.32 * k;
    ell(m, 0, by, 0, 0.32 * k, 0.3 * k, 0.28 * k, P[0], 12, 8); ell(m, 0, by - 0.05 * k, 0.12 * k, 0.2 * k, 0.18 * k, 0.16 * k, P[0], 10, 6); // body and belly
    ell(m, 0, by + 0.22 * k, -0.03, 0.21 * k, 0.12 * k, 0.19 * k, P[2], 10, 5); for (var g = 0; g < 4; g++) tub(m, [-0.14 * k + g * 0.09 * k, by + 0.3 * k, -0.15 * k], [-0.14 * k + g * 0.09 * k, by + 0.31 * k, 0.12 * k], 0.012, 0.012, '#7a4a40', 4); // the brain
    if (br === 'scout') { ell(m, 0, by + 0.04, 0.25 * k, 0.12 * k, 0.12 * k, 0.05, '#ffffff', 8, 5); ell(m, 0, by + 0.04, 0.29 * k, 0.07 * k, 0.07 * k, 0.02, P[3], 8, 4); ell(m, 0, by + 0.04, 0.31 * k, 0.03 * k, 0.03 * k, 0.01, '#12040a', 6, 3); }
    else [-1, 1].forEach(function (s) { ell(m, s * 0.1 * k, by + 0.05, 0.24 * k, 0.065 * k, 0.07 * k, 0.04, '#ffffff', 8, 5); ell(m, s * 0.1 * k, by + 0.05, 0.27 * k, 0.04 * k, 0.045 * k, 0.015, P[3], 6, 4); ell(m, s * 0.1 * k, by + 0.05, 0.285 * k, 0.018 * k, 0.02 * k, 0.008, '#12040a', 5, 3); });
    tub(m, [-0.07 * k, by - 0.1 * k, 0.26 * k], [0.07 * k, by - 0.1 * k, 0.26 * k], 0.012, 0.012, '#12040a', 4); // mouth
    [-1, 1].forEach(function (s) { tub(m, [s * 0.13 * k, leg + 0.02, 0], [s * 0.13 * k, 0.02, 0.02], 0.06 * k, 0.055 * k, P[1], 6); ell(m, s * 0.13 * k, 0.03, 0.05, 0.07 * k, 0.04, 0.09 * k, P[1], 6, 3); // legs and feet
      tub(m, [s * 0.28 * k, by + 0.02, 0.02], [s * 0.38 * k, by - 0.16 * k, 0.08], 0.05 * k, 0.04 * k, P[0], 6); ell(m, s * 0.39 * k, by - 0.18 * k, 0.09, 0.05 * k, 0.05 * k, 0.05 * k, P[1], 6, 3); });
    // the breed's own thing
    if (br === 'gloop') ell(m, 0.16 * k, by - 0.08, 0.22 * k, 0.025, 0.025, 0.012, '#16505a', 5, 3);
    else if (br === 'guard') { [-0.12, 0, 0.12].forEach(function (x) { ell(m, x * k, by + 0.12 * k, -0.22 * k, 0.07 * k, 0.09 * k, 0.04, '#e9dcbc', 6, 4); }); ell(m, 0, by - 0.02, 0.24 * k, 0.12 * k, 0.06 * k, 0.03, '#e9dcbc', 8, 3); }
    else if (br === 'ember') { tub(m, [0, by - 0.1, -0.26 * k], [0, by + 0.05, -0.5 * k], 0.07 * k, 0.03, '#b8461e', 6); ell(m, 0, by + 0.12, -0.52 * k, 0.08 * k, 0.14 * k, 0.08 * k, '#ffd040', 8, 5); ell(m, 0, by + 0.1, -0.5 * k, 0.05 * k, 0.1 * k, 0.05 * k, '#ff7a30', 6, 4); }
    else if (br === 'frost') { [-0.12, 0, 0.12].forEach(function (x) { tub(m, [x * k, by + 0.3 * k, 0], [x * k * 1.3, by + 0.5 * k, -0.02], 0.035 * k, 0.004, '#ffffff', 5); }); }
    else if (br === 'volt') { [-1, 1].forEach(function (s) { tub(m, [s * 0.08 * k, by + 0.3 * k, 0], [s * 0.16 * k, by + 0.52 * k, 0], 0.012, 0.012, '#6a5a0a', 4); ell(m, s * 0.16 * k, by + 0.54 * k, 0, 0.035, 0.035, 0.035, '#c070ff', 6, 4); }); }
    else if (br === 'medic') { tub(m, [-0.22 * k, by + 0.18 * k, 0.05], [0.22 * k, by + 0.18 * k, 0.05], 0.04 * k, 0.04 * k, '#ffffff', 8); bxp(m, -0.03, by + 0.16 * k, 0.2 * k, 0.03, by + 0.21 * k, 0.24 * k, '#ff2630'); }
    else if (br === 'leech') { [-1, 1].forEach(function (s) { tub(m, [s * 0.04 * k, by - 0.11 * k, 0.26 * k], [s * 0.04 * k, by - 0.19 * k, 0.27 * k], 0.018, 0.003, '#f1e7d0', 4); }); }
    else if (br === 'goldie') { bxp(m, -0.02, by - 0.14 * k, 0.255 * k, 0.02, by - 0.1 * k, 0.27 * k, '#ffd040'); ell(m, -0.16 * k, by - 0.06, 0.22 * k, 0.022, 0.022, 0.01, '#3a2410', 5, 3); }
    else if (br === 'titan' || br === 'blood') { [-1, 1].forEach(function (s) { tub(m, [s * 0.16 * k, by + 0.26 * k, 0], [s * 0.3 * k, by + (br === 'blood' ? 0.5 : 0.44) * k, br === 'blood' ? 0.06 : -0.04], 0.05 * k, 0.008, br === 'blood' ? '#12040a' : '#e8dcc8', 6); });
      if (br === 'titan') tub(m, [0.06, by + 0.12 * k, 0.27 * k], [0.14, by - 0.02, 0.26 * k], 0.01, 0.01, '#542a24', 3); else for (var sp = 0; sp < 4; sp++) tub(m, [0, by + 0.2 * k - sp * 0.1 * k, -0.25 * k], [0, by + 0.24 * k - sp * 0.1 * k, -0.38 * k], 0.03 * k, 0.003, '#ff2630', 4); }
    return { mesh: m.upload(), h: by + 0.4 * k };
  }
  function get(br, stage) { var key = br + ':' + (stage || 'adult'); return cache[key] || (cache[key] = build(br, stage || 'adult')); }
  var catM = null;
  function cat() { if (catM) return catM; var m = M(); // Sir Johnathan: a big black cat with white socks and yellow eyes
    ell(m, 0, 0.55, 0, 0.32, 0.3, 0.6, '#1a1a1e', 12, 8); ell(m, 0, 0.85, 0.62, 0.28, 0.26, 0.26, '#1a1a1e', 12, 8); [-1, 1].forEach(function (s) { tub(m, [s * 0.14, 1.04, 0.62], [s * 0.2, 1.24, 0.6], 0.09, 0.01, '#1a1a1e', 6); ell(m, s * 0.1, 0.9, 0.84, 0.06, 0.07, 0.03, '#ffe36a', 8, 4); ell(m, s * 0.1, 0.9, 0.87, 0.015, 0.05, 0.01, '#12040a', 5, 3);
      tub(m, [s * 0.18, 0.4, 0.4], [s * 0.18, 0.02, 0.45], 0.08, 0.07, '#1a1a1e', 6); ell(m, s * 0.18, 0.04, 0.48, 0.08, 0.05, 0.1, '#f1e7d0', 6, 3); tub(m, [s * 0.18, 0.4, -0.4], [s * 0.18, 0.02, -0.42], 0.09, 0.07, '#1a1a1e', 6); ell(m, s * 0.18, 0.04, -0.38, 0.08, 0.05, 0.1, '#f1e7d0', 6, 3); });
    ell(m, 0, 0.8, 0.86, 0.04, 0.03, 0.02, '#ff8ab0', 6, 3); tub(m, [0, 0.62, -0.55], [0, 0.9, -0.9], 0.06, 0.05, '#1a1a1e', 6); tub(m, [0, 0.9, -0.9], [0, 1.25, -0.85], 0.05, 0.03, '#1a1a1e', 6);
    catM = { mesh: m.upload(), h: 1.3 }; return catM; }
  return { get: get, cat: cat, PAL: PAL };
})();
