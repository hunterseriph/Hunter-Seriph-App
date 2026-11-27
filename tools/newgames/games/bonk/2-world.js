/* 2-world: each place as a 3D area. Its own light, fog and sky, hills (or a flat tunnel / hall), its floor, the things
   lying about (the 2D game's floor dressing, now in 3D), big scenery you have to go round (pipes, tents, rib arches,
   chimneys, statues, trees, flesh pillars, rock spires), the breakable things, walls for the corridor places, and
   far-off shapes on the skyline (the ferris wheel, the castle, the volcano, the Crimson Moon). */
var W3 = (function () {
  var BK = '#12040a', WH = '#f4efe6', RED = '#c4121c', HOT = '#ff2630', CREAM = '#f1e0b0', GOLD = '#ffe36a';
  /* ---------- the places ---------- */
  function L(sky, fog, sun, sunCol, amb) { return { sky: B3.hex(sky), fog: fog, sun: (function () { var l = Math.hypot(sun[0], sun[1], sun[2]); return [sun[0] / l, sun[1] / l, sun[2] / l]; })(), sunCol: B3.hex(sunCol), amb: B3.hex(amb) }; }
  var ENV = {
    sewer: { look: L('#0c0806', [200, 560], [0.3, 1, 0.2], '#8a7050', '#5a4a40'), hill: 0, bright: 1.7, big: [['pipe', 16, 1], ['barrels', 18, 1]], bigP: 0, far: [['far_pipes', 0, 1]] },
    park: { look: L('#14040a', [240, 640], [-0.4, 1, 0.3], '#a04050', '#5a3a48'), hill: 14, bright: 1.9, big: [['lm_bigtop', 36, 1, 0.15], ['city_lamp', 4, 2], ['city_bench', 8, 2]], rise: [0.42, 0.35], bigP: 0.34, far: [['lm_ferris', 0.6, 0.38]] },
    bone: { look: L('#120c08', [220, 600], [0.5, 1, -0.2], '#b8a080', '#4a4038'), hill: 24, bright: 1.8, big: [['ribarch', 30, 1], ['tomb', 21, 1], ['city_dead', 6, 1]], rise: [0.55, 0.6], bigP: 0.36, far: [['far_skull', 2.4, 1]] },
    furnace: { look: L('#1c0804', [220, 600], [0.2, 1, 0.5], '#ff8a40', '#5a3020'), hill: 10, bright: 1.7, big: [['lm_chimney', 12, 1, 0.1], ['anvil', 14, 1]], rise: [0.55, 0.7], bigP: 0.32, far: [['lm_volcano', 1.2, 1.1]] },
    castle: { look: L('#0e0608', [220, 600], [-0.2, 1, 0.4], '#c08060', '#4a3438'), hill: 0, bright: 1.8, big: [['lm_statue', 18, 1, 0.45]], bigP: 0, far: [['lm_castle', 3.1, 0.26]] },
    picnic: { look: L('#060c08', [220, 620], [0.4, 1, 0.3], '#90a870', '#38483a'), hill: 20, bright: 2.1, big: [['city_tree', 9, 1], ['city_pine', 9, 1], ['bush', 13, 1]], rise: [0.45, 0.3], bigP: 0.42, far: [['far_trees', 0.3, 1], ['far_trees', 3.4, 1]] },
    lair: { look: L('#12040e', [220, 600], [-0.3, 1, -0.3], '#c070c0', '#4a2a48'), hill: 16, bright: 1.8, big: [['fleshpillar', 11, 1], ['podbig', 17, 1]], rise: [0.45, 0.5], bigP: 0.34, far: [['far_tower', 0.9, 1]] },
    cafe: { look: L('#0e0806', [220, 600], [0.3, 1, 0.4], '#ffd0a0', '#5a4038'), hill: 6, bright: 1.8, big: [['city_bench', 8, 2], ['city_bin', 7, 1], ['city_planter', 10, 1], ['cart', 22, 0.5]], rise: [0.35, 0.8], bigP: 0.4, far: [['lm_chapel', 0.4, 0.6], ['lm_windmill', 3.6, 0.5]] },
    arcade: { look: L('#0a0414', [220, 620], [-0.2, 1, 0.3], '#c08aff', '#3a2a50'), hill: 0, bright: 2.0, big: [['cabinet', 12, 3], ['city_lamp', 4, 1]], rise: [0.45, 0.7], bigP: 0.5, far: [['lm_coaster', 0.2, 0.35], ['lm_ferris', 2.7, 0.38], ['lm_carousel', 4.4, 0.8]] },
    moon: { look: L('#1e0406', [240, 660], [0.1, 1, 0.6], '#ff6a6a', '#5a2a2c'), hill: 26, bright: 1.7, big: [['spire', 14, 1], ['rocks', 13, 1]], rise: [0.6, 0.6], bigP: 0.36, far: [['far_moon', 0, 1]] }
  };
  /* the big scenery: one in some of the 300-tile cells, keyed to the world so it is always in the same place */
  var BC = 300;
  function bigAt(cx, cy, ground) { var e = ENV[ground]; if (!e || !e.bigP) return null; if (hh(cx, cy, 401) > e.bigP) return null; var list = e.big, t = list[Math.floor(hh(cx, cy, 402) * list.length)];
    var x = cx * BC + 40 + hh(cx, cy, 403) * (BC - 80), y = cy * BC + 40 + hh(cx, cy, 404) * (BC - 80); if (Math.hypot(x, y) < 160) return null; return { m: t[0], r: t[1], sc: t[3] || 1, x: x, y: y, yaw: hh(cx, cy, 405) * 6.283 }; }
  function bigNear(x, y, ground, out) { out = out || []; var a = Math.floor(x / BC), b = Math.floor(y / BC); for (var j = b - 1; j <= b + 1; j++) for (var i = a - 1; i <= a + 1; i++) { var q = bigAt(i, j, ground); if (q) out.push(q); } return out; }
  // the sewer and the hall: big things stand along the walls instead
  function wallThings(st, x, y, out) { var b = st.band; if (!b) return out; if (st.ground === 'sewer') { var a = Math.floor(x / 220); for (var i = a - 3; i <= a + 3; i++) { var bx = i * 220 + 110; [-1, 1].forEach(function (sg) { if (hh(i, sg, 411) < 0.5) out.push({ m: hh(i, sg, 412) < 0.5 ? 'pipe' : 'barrels', r: 16, x: bx + hh(i, sg, 413) * 60, y: sg * (b.y - 26), yaw: 0 }); }); } }
    if (st.ground === 'castle') { var c = Math.floor(y / 200); for (var k = c - 3; k <= c + 3; k++) [-1, 1].forEach(function (sg) { out.push({ m: 'lm_statue', sc: 0.45, r: 18, x: sg * (b.x - 30), y: k * 200 + 100, yaw: sg > 0 ? -Math.PI / 2 : Math.PI / 2 }); }); }
    return out; }
  /* raised ground in the open places: ledges (steep, you jump up; some have a ramp) and mounds (slopes you walk up).
     One chance per 420 cell, keyed to the world. Each is [x, z, r, h, w] for B3.plats. */
  var RC = 420;
  function riseAt(cx, cy, ground, out) { var e = ENV[ground]; if (!e || !e.rise || hh(cx, cy, 501) > e.rise[0]) return;
    var x = cx * RC + 90 + hh(cx, cy, 502) * (RC - 180), y = cy * RC + 90 + hh(cx, cy, 503) * (RC - 180); if (Math.hypot(x, y) < 230) return;
    if (hh(cx, cy, 504) < e.rise[1]) { var r = 55 + hh(cx, cy, 505) * 45, h = 22 + Math.floor(hh(cx, cy, 506) * 3) * 6; out.push([x, y, r, h, 8]);
      if (hh(cx, cy, 507) < 0.6) { var a = hh(cx, cy, 508) * 6.283; out.push([x + Math.cos(a) * (r + 30), y + Math.sin(a) * (r + 30), 90, h, 80]); } }
    else { var R = 110 + hh(cx, cy, 509) * 90; out.push([x, y, R, 30 + hh(cx, cy, 510) * 30, R * 0.75]); } }
  function risesNear(x, y, ground) { var out = [], a = Math.floor(x / RC), b = Math.floor(y / RC); for (var j = b - 2; j <= b + 2; j++) for (var i = a - 2; i <= a + 2; i++) riseAt(i, j, ground, out);
    out.sort(function (p, q) { return (Math.hypot(p[0] - x, p[1] - y) - p[2]) - (Math.hypot(q[0] - x, q[1] - y) - q[2]); }); return out.slice(0, 12); }
  return { ENV: ENV, bigNear: bigNear, wallThings: wallThings, risesNear: risesNear };
})();
