/* =====================================================================================================
   THE DRIVERS, REBUILT (he said the 3D models looked hideous: hair all off, very basic). Each one now has a proper
   chibi build: a big head with ears and a neck, the face cut from their sprite (just the face: the hair is 3D),
   hair built per person (a cap, fringe bumps, back volume, side locks, long hair down the back, beards, moustaches),
   better hats (puffy chef hats, a bent cowboy brim with a band, a striped beanie with a bobble, a viking helmet with
   curved horns), shoulders, sleeves, collars and aprons. Spermaid is her real self: a slim cream droplet with her
   curled tip and little drop, a black shell bra, and her teal tail curling up behind the seat with the pink fin.
   ===================================================================================================== */
var HAIR = {
  amy: { style: 'long', fringe: 1, bow: '#c4121c', collar: '#f1e7d0' },
  tb: { style: 'short', collar: '#3a2412' },
  saba: { style: 'short', beard: '#e8e0d8', collar: '#2a6a1a' },
  joff: { style: 'short', apron: '#f6f0e4', collar: '#c4121c' },
  kaya: { style: 'long', fringe: 1, side: 1, collar: '#f1e7d0', apron: '#f1e7d0' },
  beebs: { style: 'short', beard: '#c8702a', braids: 1, collar: '#4a2a10', belt: '#3a2010' },
  ali: { style: 'quiff', collar: '#c4121c', apron: '#3a9a2a' }
};
/* an ellipsoid that can keep only its front (o.front: keep where facing forward more than this) or back (o.back) */
function ball2(m, fr, T, cf, cs, cu, rf, rs, ru, col, seg, o) {
  o = o || {}; var LD = typeof DLOD === 'number' ? DLOD : 1; seg = Math.max(5, Math.round(Math.min(10, seg || 8) * LD)); var rings = Math.max(2, Math.round(Math.min(5, o.rings || 6) * (LD < 1 ? 0.6 : 1))), c = rgb01(col), b0 = o.b0 || 0, b1 = o.b1 || Math.PI;
  function V(a, b) { var nf = Math.cos(a) * Math.sin(b), ns = Math.sin(a) * Math.sin(b), nu = Math.cos(b); return { p: fr.P(cf + nf * rf, cs + ns * rs, cu + nu * ru), n: fr.N(nf, ns, nu), nf: nf }; }
  for (var r = 0; r < rings; r++) for (var i = 0; i < seg; i++) {
    var ba = b0 + (b1 - b0) * r / rings, bb = b0 + (b1 - b0) * (r + 1) / rings, aa = i / seg * Math.PI * 2, ab = (i + 1) / seg * Math.PI * 2;
    var q = [V(aa, ba), V(ab, ba), V(ab, bb), V(aa, bb)], nf = (q[0].nf + q[1].nf + q[2].nf + q[3].nf) / 4;
    if (o.front !== undefined && nf < o.front) continue; if (o.back !== undefined && nf > o.back) continue;
    m.quad(q[0].p, q[1].p, q[2].p, q[3].p, [0.1, 0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.9], T, q.map(function (v) { return fr.lit(c, v.n); }));
  }
}
function torso(m, fr, W, col, w0, w1, u0, u1, f0, f1) { // tapered: w0 wide at the hips, w1 at the shoulders
  hull(m, fr, W, [[f0, -w0, u0], [f1, -w0, u0], [f1, w0, u0], [f0, w0, u0], [f0 + 0.04, -w1, u1], [f1 - 0.02, -w1, u1], [f1 - 0.02, w1, u1], [f0 + 0.04, w1, u1]], col);
}
function driver3D(m, k, fr) {
  var d = DRV3D[k.c.id] || DRV3D.cumhead, H = HAIR[k.c.id] || {}, W = DRVT.white, face = DRVT[k.c.id], R = RACE, t = R ? R.t : 0, id = k.c.id;
  var body = d.body || d.col, arm = d.arm || body, hand = d.hand || '#f0c8a0', wob = Math.sin((k.steerVis || 0) * 1.2) * 0.06;
  if (d.kind === 'cat') { // Sir Johnathan: a proper cat, loaf body, white chest and paws, green eyes, swishing tail
    ball2(m, fr, W, -0.3, 0, 0.66, 0.44, 0.32, 0.32, '#1a1418', 9); ball2(m, fr, W, -0.06, 0, 0.66, 0.2, 0.2, 0.24, '#f1e7d0', 7, { front: -0.2 });
    [-1, 1].forEach(function (sd) { ball2(m, fr, W, 0.2, sd * 0.14, 0.5, 0.09, 0.08, 0.07, '#f1e7d0', 6, { rings: 3 }); });
    ball(m, fr, W, -0.16, 0, 1.1, 0.32, 0.34, 0.29, '#1a1418', 9, { rings: 6, face: { T: DRVT.cat, fz: 0.3, w: 0.9, h: 0.9 } });
    [-1, 1].forEach(function (sd) { tube(m, fr, W, [-0.2, sd * 0.17, 1.3], [-0.24, sd * 0.24, 1.62], 0.11, 0.0, '#1a1418', 4); tube(m, fr, W, [-0.18, sd * 0.18, 1.33], [-0.21, sd * 0.23, 1.54], 0.05, 0.0, '#c86a8a', 4); });
    var sw = Math.sin(t * 3) * 0.2; tube(m, fr, W, [-0.66, 0, 0.62], [-0.9, sw, 0.9], 0.07, 0.06, '#1a1418', 5); tube(m, fr, W, [-0.9, sw, 0.9], [-0.96, sw * 1.6, 1.22], 0.06, 0.04, '#1a1418', 5); return;
  }
  if (id === 'greebo') { // Greebo is a cream pie: a round pie for a head (cream face, crimped golden crust round it), chef's hat, black apron with his red G, white gloves
    var CR = '#d8943a', CR2 = '#b8742a', CM = '#f6ecd0';
    torso(m, fr, W, '#1e1a1c', 0.27, 0.27, 0.42, 0.95, -0.44, -0.08);
    [[-0.07, 0.03, 0.88, 0.9], [-0.07, -0.12, 0.12, 0.13], [-0.07, 0.03, 0.6, 0.62], [-0.07, 0.09, 0.62, 0.74], [-0.07, 0.0, 0.73, 0.75]].forEach(function (g, i) { // the G
      if (i === 1) hull(m, fr, W, bx(g[0], g[0] + 0.02, -0.11, -0.08, 0.6, 0.9), '#c4121c'); else if (i === 3) hull(m, fr, W, bx(g[0], g[0] + 0.02, 0.07, 0.1, 0.6, 0.75), '#c4121c'); else hull(m, fr, W, bx(g[0], g[0] + 0.02, -0.11, i === 4 ? 0.1 : 0.1, g[2], g[3]), '#c4121c'); });
    [-1, 1].forEach(function (sd) {
      ball2(m, fr, W, -0.24, sd * 0.3, 0.88, 0.11, 0.11, 0.1, '#f6f0e4', 7, { rings: 4 });
      tube(m, fr, W, [-0.24, sd * 0.3, 0.86], [0.06, sd * 0.27, 0.68], 0.085, 0.075, '#f6f0e4', 6); tube(m, fr, W, [0.06, sd * 0.27, 0.68], [0.38, sd * 0.15 + sd * wob, 0.63 + sd * wob], 0.075, 0.07, '#f6f0e4', 6);
      ball2(m, fr, W, 0.42, sd * 0.15 + sd * wob, 0.63 + sd * wob, 0.09, 0.09, 0.09, '#ffffff', 6, { rings: 3 }); // big white gloves
    });
    var pf = -0.16, pu = 1.38, PR = 0.44;
    tube(m, fr, W, [pf - 0.16, 0, pu], [pf + 0.02, 0, pu], PR * 0.92, PR, CR2, 14, { cap0: CR2 });          // the pie dish, round the back
    ball(m, fr, W, pf + 0.04, 0, pu, 0.12, PR * 0.9, PR * 0.9, CM, 12, { rings: 8, face: face ? { T: face, fz: 0.0, w: 0.98, h: 0.98 } : null }); // the cream face
    for (var cr = 0; cr < 16; cr++) { var ca = cr / 16 * Math.PI * 2; ball2(m, fr, W, pf + 0.02, Math.cos(ca) * PR * 0.98, pu + Math.sin(ca) * PR * 0.98, 0.08, 0.085, 0.085, cr % 2 ? CR : CR2, 6, { rings: 3 }); } // crimped crust
    var hc = d.hatc || '#f6f0e4'; tube(m, fr, W, [pf - 0.06, 0, pu + 0.36], [pf - 0.06, 0, pu + 0.56], 0.3, 0.33, hc, 10);
    [0, 1, 2, 3, 4].forEach(function (j) { var a = j / 5 * Math.PI * 2; ball2(m, fr, W, pf - 0.06 + Math.cos(a) * 0.2, Math.sin(a) * 0.2, pu + 0.72, 0.21, 0.21, 0.19, hc, 7, { rings: 4 }); }); ball2(m, fr, W, pf - 0.06, 0, pu + 0.84, 0.25, 0.25, 0.17, hc, 8, { rings: 4 });
    return;
  }
  var mermaid = id === 'spermaid', drop = d.kind === 'drop' || d.kind === 'blob';
  // ---- body ----
  if (mermaid) {
    torso(m, fr, W, '#fff0d8', 0.17, 0.2, 0.42, 0.95, -0.4, -0.12);
    [-1, 1].forEach(function (sd) { ball2(m, fr, W, -0.1, sd * 0.095, 0.8, 0.07, 0.095, 0.08, '#16121a', 7, { rings: 4 }); }); // her shell bra
    // the tail curls up behind the seat, the pink fin on the end
    var tw = Math.sin(t * 2.4) * 0.05;
    tube(m, fr, W, [-0.3, 0, 0.5], [-0.62, tw, 0.66], 0.17, 0.15, '#1aa0b0', 8); tube(m, fr, W, [-0.62, tw, 0.66], [-0.8, tw * 1.5, 0.98], 0.15, 0.1, '#1890a8', 8); tube(m, fr, W, [-0.8, tw * 1.5, 0.98], [-0.82, tw * 2, 1.22], 0.1, 0.07, '#0a7088', 7);
    [-1, 1].forEach(function (sd) { hull(m, fr, W, [[-0.84, tw * 2, 1.2], [-0.78, tw * 2, 1.2], [-0.78, tw * 2 + 0.02 * sd, 1.24], [-0.84, tw * 2 + 0.02 * sd, 1.24], [-0.98, tw * 2 + sd * 0.3, 1.52], [-0.86, tw * 2 + sd * 0.26, 1.5], [-0.86, tw * 2 + sd * 0.28, 1.54], [-0.98, tw * 2 + sd * 0.32, 1.56]], '#f0107a'); });
  } else if (d.kind === 'pig') {
    ball2(m, fr, W, -0.26, 0, 0.66, 0.26, 0.34, 0.32, d.col, 9); torso(m, fr, W, body, 0.3, 0.26, 0.5, 0.9, -0.4, -0.12); // his tum in a red waistcoat
  } else {
    var wide = id === 'greebo' || id === 'beebs' ? 0.04 : id === 'amy' || id === 'kaya' ? -0.04 : 0;
    torso(m, fr, W, body, 0.23 + wide, 0.27 + wide, 0.42, 0.97, -0.44, -0.08);
    if (H.apron) hull(m, fr, W, bx(-0.08, -0.06, -0.16 - wide, 0.16 + wide, 0.44, 0.86), H.apron);
    if (H.belt) hull(m, fr, W, bx(-0.46, -0.06, -0.25 - wide, 0.25 + wide, 0.5, 0.56), H.belt);
    if (d.trim) hull(m, fr, W, bx(-0.08, -0.06, -0.06, 0.06, 0.5, 0.94), d.trim);
  }
  if (d.cape) { hull(m, fr, W, [[-0.56, -0.4, 0.38], [-0.46, -0.4, 0.38], [-0.46, 0.4, 0.38], [-0.56, 0.4, 0.38], [-0.5, -0.3, 1.0], [-0.42, -0.3, 1.0], [-0.42, 0.3, 1.0], [-0.5, 0.3, 1.0]], d.cape); }
  if (id === 'cumhead') { tube(m, fr, W, [-0.26, 0, 0.94], [-0.26, 0, 1.06], 0.24, 0.27, '#c4121c', 10); } // his high red collar
  else if (H.collar && !mermaid) tube(m, fr, W, [-0.26, 0, 0.93], [-0.26, 0, 1.0], 0.17, 0.16, H.collar, 9);
  // shoulders and arms on the wheel
  var skin = d.skin || d.col, sl = mermaid ? '#fff0d8' : arm, fore = d.skin ? (id === 'tb' || id === 'saba' || id === 'beebs' ? arm : skin) : arm;
  [-1, 1].forEach(function (sd) {
    var sh = mermaid ? 0.2 : 0.28; ball2(m, fr, W, -0.24, sd * sh, 0.9, 0.11, 0.11, 0.1, sl, 7, { rings: 4 });
    tube(m, fr, W, [-0.24, sd * sh, 0.88], [0.06, sd * (sh - 0.03), 0.68], 0.085, 0.075, sl, 6);
    tube(m, fr, W, [0.06, sd * (sh - 0.03), 0.68], [0.38, sd * 0.15 + sd * wob, 0.63 + sd * wob], 0.07, 0.06, fore, 6);
    ball2(m, fr, W, 0.41, sd * 0.15 + sd * wob, 0.63 + sd * wob, 0.07, 0.07, 0.07, hand, 6, { rings: 3 });
  });
  // ---- head ----
  if (drop) {
    var hf = -0.24, hu = 1.36, tex = d.kind === 'blob' ? { T: DRVT.blob, fz: 0.25 } : d.ownface ? { T: DRVT[d.ownface], fz: 0.2 } : face ? { T: face, fz: 0.16, w: 0.92, h: 0.95, dv: 0.04 } : null;
    var col = mermaid ? '#fff0d8' : d.col;
    if (!mermaid) tube(m, fr, W, [hf, 0, 0.98], [hf, 0, 1.1], 0.14, 0.14, col, 7);
    ball(m, fr, W, hf, 0, hu, 0.42, 0.42, 0.4, col, 10, { rings: 8, face: tex, tip: d.tip || 0 });
    if (d.tip) { // the tip, curling back like his drawing, and (Spermaid) the little drop above it
      tube(m, fr, W, [hf - 0.02, 0, hu + 0.34], [hf - 0.1, 0, hu + 0.6], 0.14, 0.05, col, 7);
      tube(m, fr, W, [hf - 0.1, 0, hu + 0.6], [hf - 0.24, 0, hu + 0.7], 0.05, 0.03, col, 5);
      if (d.curl) ball2(m, fr, W, hf - 0.26, 0, hu + 0.68, 0.06, 0.06, 0.06, col, 6, { rings: 3 });
      if (mermaid) { ball2(m, fr, W, hf - 0.04, 0, hu + 0.86, 0.06, 0.06, 0.08, col, 6, { rings: 4 }); tube(m, fr, W, [hf - 0.04, 0, hu + 0.92], [hf - 0.02, 0, hu + 1.0], 0.04, 0.0, col, 5); }
    }
  } else {
    var hf = -0.22, hu = 1.36, Rh = 0.37, hc = d.hair || '#3a2418', HC = H.style || 'short';
    tube(m, fr, W, [hf, 0, 0.94], [hf, 0, 1.06], 0.11, 0.11, skin, 7);                                   // neck
    ball(m, fr, W, hf, 0, hu, Rh, Rh * 1.02, Rh * 1.04, skin, 10, { rings: 8, face: face ? { T: face, fz: 0.22, w: 0.86, h: 0.9, dv: 0.02 } : null });
    if (d.kind === 'pig') { // Potbelly: snout with nostrils, floppy ears
      tube(m, fr, W, [hf + 0.3, 0, hu - 0.1], [hf + 0.44, 0, hu - 0.1], 0.14, 0.13, '#ff7a9a', 8, { cap: '#ff7a9a' });
      [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf + 0.45, sd * 0.05, hu - 0.1, 0.012, 0.03, 0.04, '#8a2a40', 4, { rings: 2 }); hull(m, fr, W, [[hf - 0.06, sd * 0.2, hu + 0.24], [hf + 0.1, sd * 0.2, hu + 0.24], [hf + 0.1, sd * 0.26, hu + 0.24], [hf - 0.06, sd * 0.26, hu + 0.24], [hf + 0.04, sd * 0.38, hu + 0.46], [hf + 0.16, sd * 0.36, hu + 0.4], [hf + 0.16, sd * 0.4, hu + 0.4], [hf + 0.04, sd * 0.42, hu + 0.46]], d.col); });
    } else {
      [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf - 0.02, sd * Rh * 0.98, hu - 0.02, 0.06, 0.05, 0.09, skin, 6, { rings: 3 }); }); // ears
      // hair: a cap over the top and back (bigger than the head, so it sits on it), the back, then each one's own style
      var capTo = d.hat ? 1.0 : 1.18;
      ball2(m, fr, W, hf - 0.02, 0, hu + 0.02, Rh * 1.07, Rh * 1.08, Rh * 1.07, hc, 10, { rings: 5, b0: 0, b1: capTo });
      ball2(m, fr, W, hf - 0.04, 0, hu - 0.02, Rh * 1.06, Rh * 1.07, Rh * 1.06, hc, 10, { rings: 6, b0: 0.3, b1: 2.3, back: -0.05 });
      if (!d.hat || d.hat === 'cowboy') { // a fringe of soft bumps across the forehead
        var nf = H.fringe ? 5 : 3; for (var j = 0; j < nf; j++) { var a = (j / (nf - 1) - 0.5) * (H.fringe ? 1.5 : 1.1); ball2(m, fr, W, hf + Math.cos(a) * Rh * 0.92, Math.sin(a) * Rh * 0.94, hu + Rh * (H.fringe ? 0.5 : 0.62), 0.07, 0.11, H.fringe ? 0.13 : 0.08, hc, 6, { rings: 3 }); }
      }
      if (HC === 'long') { // down the back past the shoulders, and locks either side of the face
        ball2(m, fr, W, hf - 0.2, 0, hu - 0.34, 0.2, Rh * 1.02, 0.5, hc, 9, { rings: 6 });
        [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf + 0.04, sd * Rh * 0.94, hu - 0.2, 0.1, 0.09, 0.34, hc, 7, { rings: 5 }); });
        if (H.bow) [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf - 0.1, sd * 0.12, hu + Rh * 1.02, 0.05, 0.1, 0.07, H.bow, 6, { rings: 3 }); });
      } else if (HC === 'curly') { for (var c2 = 0; c2 < 8; c2++) { var a2 = c2 / 8 * Math.PI * 2; ball2(m, fr, W, hf - 0.04 + Math.cos(a2) * Rh * 0.9, Math.sin(a2) * Rh * 1.02, hu - 0.06, 0.1, 0.1, 0.12, hc, 6, { rings: 3, back: Math.cos(a2) > 0.4 ? -2 : undefined }); } }
      else if (HC === 'quiff') ball2(m, fr, W, hf + 0.14, 0, hu + Rh * 0.98, 0.17, 0.2, 0.12, hc, 8, { rings: 4 });
      else [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf + 0.02, sd * Rh * 0.96, hu + 0.04, 0.08, 0.05, 0.12, hc, 6, { rings: 3 }); }); // sideburns
      if (H.braids) [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf + 0.04, sd * 0.3, hu - 0.3], [hf + 0.14, sd * 0.3, hu - 0.72], 0.06, 0.05, H.beard, 5); });
      if (H.beard) { ball2(m, fr, W, hf + 0.02, 0, hu - 0.2, Rh * 0.9, Rh * 1.06, Rh * 0.7, H.beard, 10, { rings: 4, b0: 1.7, b1: 3.0, back: 0.45 }); ball2(m, fr, W, hf + 0.1, 0, hu - 0.44, 0.2, 0.24, 0.2, H.beard, 8, { rings: 4 }); } // the beard's bulk round the jaw and under the chin (the face shows its front)
      else if (H.stubble) ball2(m, fr, W, hf + 0.03, 0, hu - 0.12, Rh * 0.98, Rh * 1.0, Rh * 0.8, H.stubble, 9, { rings: 3, b0: 2.0, b1: 2.8, front: 0.2 });
      if (H.tash) [-1, 1].forEach(function (sd) { ball2(m, fr, W, hf + Rh * 0.95, sd * 0.07, hu - 0.12, 0.04, 0.09, 0.03, H.tash, 6, { rings: 3 }); });
    }
    // hats
    if (d.hat === 'chef') { tube(m, fr, W, [hf, 0, hu + 0.24], [hf, 0, hu + 0.44], Rh * 1.02, Rh * 1.06, d.hatc, 10); [0, 1, 2, 3, 4].forEach(function (j) { var a = j / 5 * Math.PI * 2; ball2(m, fr, W, hf + Math.cos(a) * 0.2, Math.sin(a) * 0.2, hu + 0.6, 0.2, 0.2, 0.18, d.hatc, 7, { rings: 4 }); }); ball2(m, fr, W, hf, 0, hu + 0.72, 0.24, 0.24, 0.16, d.hatc, 8, { rings: 4 }); }
    if (d.hat === 'cowboy') {
      for (var j2 = 0; j2 < 12; j2++) { var a3 = j2 / 12 * Math.PI * 2, a4 = (j2 + 1) / 12 * Math.PI * 2, up = function (a) { return Math.abs(Math.sin(a)) * 0.1; }; // the brim, turned up at the sides
        hull(m, fr, W, [[hf + Math.cos(a3) * 0.3, Math.sin(a3) * 0.3, hu + 0.22], [hf + Math.cos(a3) * 0.62, Math.sin(a3) * 0.64, hu + 0.22 + up(a3)], [hf + Math.cos(a4) * 0.62, Math.sin(a4) * 0.64, hu + 0.22 + up(a4)], [hf + Math.cos(a4) * 0.3, Math.sin(a4) * 0.3, hu + 0.22], [hf + Math.cos(a3) * 0.3, Math.sin(a3) * 0.3, hu + 0.25], [hf + Math.cos(a3) * 0.62, Math.sin(a3) * 0.64, hu + 0.25 + up(a3)], [hf + Math.cos(a4) * 0.62, Math.sin(a4) * 0.64, hu + 0.25 + up(a4)], [hf + Math.cos(a4) * 0.3, Math.sin(a4) * 0.3, hu + 0.25]], d.hatc); }
      tube(m, fr, W, [hf, 0, hu + 0.24], [hf, 0, hu + 0.56], 0.3, 0.26, d.hatc, 10, { cap: d.hatc }); tube(m, fr, W, [hf, 0, hu + 0.25], [hf, 0, hu + 0.32], 0.305, 0.3, '#2a1a0c', 10);
      hull(m, fr, W, bx(hf - 0.18, hf + 0.18, -0.03, 0.03, hu + 0.5, hu + 0.58), '#3a2410'); // the dent on top
    }
    if (d.hat === 'beanie') { ball2(m, fr, W, hf, 0, hu + 0.1, Rh * 1.1, Rh * 1.1, Rh * 1.14, d.hatcols[0], 10, { rings: 2, b0: 0, b1: 0.5 }); ball2(m, fr, W, hf, 0, hu + 0.1, Rh * 1.1, Rh * 1.1, Rh * 1.14, d.hatcols[1], 10, { rings: 1, b0: 0.5, b1: 0.85 }); ball2(m, fr, W, hf, 0, hu + 0.1, Rh * 1.1, Rh * 1.1, Rh * 1.14, d.hatcols[2], 10, { rings: 2, b0: 0.85, b1: 1.3 }); ball2(m, fr, W, hf, 0, hu + 0.56, 0.1, 0.1, 0.1, d.hatcols[1], 6, { rings: 3 }); }
    if (d.hat === 'viking') {
      ball2(m, fr, W, hf, 0, hu + 0.08, Rh * 1.1, Rh * 1.1, Rh * 1.1, d.hatc, 10, { rings: 4, b0: 0, b1: 1.3 }); tube(m, fr, W, [hf, 0, hu + 0.12], [hf, 0, hu + 0.2], Rh * 1.12, Rh * 1.12, '#c8903a', 10); hull(m, fr, W, bx(hf + 0.3, hf + 0.42, -0.03, 0.03, hu - 0.12, hu + 0.2), '#c8903a'); // band and nose guard
      [-1, 1].forEach(function (sd) { tube(m, fr, W, [hf, sd * 0.34, hu + 0.24], [hf + 0.08, sd * 0.56, hu + 0.42], 0.09, 0.06, '#f1e7d0', 6); tube(m, fr, W, [hf + 0.08, sd * 0.56, hu + 0.42], [hf + 0.18, sd * 0.6, hu + 0.72], 0.06, 0.0, '#f1e7d0', 6); });
    }
  }
  if (d.crown) { var hu2 = 1.36; tube(m, fr, W, [-0.24, 0, hu2 + 0.3], [-0.24, 0, hu2 + 0.46], 0.3, 0.3, '#ffe36a', 10); for (var j3 = 0; j3 < 5; j3++) { var a5 = j3 / 5 * Math.PI * 2; tube(m, fr, W, [-0.24 + Math.cos(a5) * 0.26, Math.sin(a5) * 0.26, hu2 + 0.46], [-0.24 + Math.cos(a5) * 0.26, Math.sin(a5) * 0.26, hu2 + 0.66], 0.06, 0.0, '#ffe36a', 4); ball2(m, fr, W, -0.24 + Math.cos(a5) * 0.3, Math.sin(a5) * 0.3, hu2 + 0.38, 0.03, 0.03, 0.03, '#c4121c', 4, { rings: 2 }); } }
}
