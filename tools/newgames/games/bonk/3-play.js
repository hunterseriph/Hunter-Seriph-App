/* 3-play: Spermaid Survivors drawn in 3D. The game underneath is untouched; this replaces its drawing, turns the
   controls round with the camera, and hangs the 2D picture (the HUD, numbers, banners) over the 3D one. */
var BONK = (function () {
  var UNIT = B3.UNIT, ENV = W3.ENV;
  B3.load();
  /* ---------- which model is who ---------- */
  var CH3 = { cumhead: 'c_cumhead', spermaid: 'c_spermaid', greebo: 'c_greebo', pulsar: 'c_pulsar', ali: 'c_ali', tb: 'c_tb', amy: 'c_amy', sirj: 'cat', bonjo: 'c_bonjo', t: 'c_t', joff: 'c_joff', kaya: 'c_kaya', elden: 'c_elden', potbelly: 'c_potbelly', beebs: 'c_beeb', saba: 'c_saba' };
  var FR3 = { kaya: 'c_kaya', bonjo: 'c_bonjo', tb: 'c_tb', potbelly: 'c_potbelly', saba: 'c_saba', pulsar: 'c_pulsar', greebo: 'c_greebo', amy: 'c_amy', ali: 'c_ali', joff: 'c_joff' };
  var G_ = [0.45, 1.05, 0.45];
  var FOE3 = { rat: { m: 'f_rat' }, cultrat: { m: 'cultrat' }, creamblob: { m: 'f_blob' }, slime: { m: 'f_blob', t: [0.42, 1.05, 0.4] }, slimeY: { m: 'f_blob', t: [1.1, 0.95, 0.3] }, slimeB: { m: 'f_blob', t: [0.4, 0.6, 1.25] },
    slimeR: { m: 'f_blob', t: [1.25, 0.35, 0.3] }, slimeP: { m: 'f_blob', t: [0.75, 0.38, 1.15] }, crawler: { m: 'crawler' }, crawlerN: { m: 'crawlerN' }, bat: { m: 'f_bat', fly: 1 }, batP: { m: 'f_bat', t: [1.15, 0.5, 1], fly: 1 },
    crow: { m: 'crow', fly: 1 }, clown: { m: 'c_pieclown', walk: 1 }, balloon: { m: 'f_balloon', fly: 1 }, pieling: { m: 'pieling' }, skeleton: { m: 'skeleton', walk: 1 }, bonehound: { m: 'bonehound' }, mummy: { m: 'mummy', walk: 1 },
    gravehand: { m: 'gravehand' }, wraith: { m: 'wraith', fly: 0.5 }, magmaslug: { m: 'magmaslug' }, emberbat: { m: 'f_bat', t: [1.35, 0.6, 0.25], fly: 1 }, imp: { m: 'f_imp', fly: 1 }, golem: { m: 'golem', walk: 1 },
    knight: { m: 'c_knight2', t: [0.6, 0.6, 0.68], walk: 1 }, ghoul: { m: 'c_zombie2', walk: 1 }, vampire: { m: 'vampire', walk: 1 }, gargoyle: { m: 'gargoyle', fly: 1 }, jailer: { m: 'jailer', walk: 1 }, ant: { m: 'ant' }, wasp: { m: 'f_wasp', fly: 1 },
    rollingpin: { m: 'rollingpin' }, toymouse: { m: 'toymouse' }, thornling: { m: 'thornling' }, rotfly: { m: 'rotfly', fly: 1 }, feather: { m: 'feather', fly: 1 }, corkbot: { m: 'corkbot' }, jelly: { m: 'f_jelly', fly: 0.6 },
    blumling: { m: 'blumling' }, blumeye: { m: 'blumeye', fly: 0.6 }, blumguard: { m: 'c_goon', walk: 1 }, blumspore: { m: 'blumspore' }, goohound: { m: 'goohound' }, harpy: { m: 'harpy', fly: 1 }, stormling: { m: 'stormling', fly: 1 }, cultist: { m: 'cultist', walk: 1 } };
  var BOSS3 = { ratking: 'b_ratking', sperm: 'b_sperm', kraken: 'f_kraken', cowpig: 'b_cowpig', cake: 'b_cake', pig: 'f_pig', queen: 'b_queen', execu: 'b_execu', boner: 'b_boner', demon: 'b_demon', clockmouse: 'b_clockmouse', hotload: 'f_hotload',
    stormwing: 'b_stormwing', kingblum: 'b_kingblum', beast: 'b_beast', waspqueen: 'b_waspqueen', rotmother: 'b_rotmother', sirj: 'cat', blum: 'b_blum', blum2: 'b_blum2', mega: 'b_mega', moon: 'b_moon' };
  var BFLY = { demon: 1, stormwing: 1, waspqueen: 1, moon: 0.4 };
  var PICK3 = { bomb: 'bomb', golden: 'golden', lube: 'lube', jar: 'jar', cracker: 'cracker', shell: 'shell', cuppa: 'cuppa', egg: 'egg', scroll: 'scroll', gold: 'gold', gold2: 'gold2', magnet: 'magnet', heart: 'heart' };
  // how big a model is drawn: the same height as its old sprite (so every size and hitbox reads the same as before)
  function sprH(n) { var f = KIT.SPR && KIT.SPR[n]; return f ? f[3] : 0; }
  var SCC = {};
  function scaleFor(model, h, w) { var m = B3.MODELS[model]; if (!m) return 1; var mh = Math.max(0.05, m.top - Math.min(0, m.bot)) * UNIT, s = h / mh; if (w) s = Math.min(s, w / Math.max(0.05, m.rad * 2 * UNIT)); return s; }
  function foeScale(e) { var key = (e.boss ? 'B' : 'F') + e.k; var base = SCC[key]; if (base === undefined) { var fr = KIT.SPR && KIT.SPR['f_' + e.k + '_0'], h = fr ? fr[3] : e.r * 2.6, w = fr ? fr[2] : e.r * 2.6; var mdl = e.boss ? BOSS3[e.k] : (FOE3[e.k] || {}).m; base = SCC[key] = mdl ? scaleFor(mdl, h * (e.boss ? 1.05 : 1.12), w * 1.25) : 1; } return base; }
  function charModel() { var C = charOf(run && run.ch); return CH3[C.id] || 'c_spermaid'; }
  /* ---------- the camera ---------- */
  var CAMR = { yaw: 0, vyaw: 0, dist: 175, pitch: 0.52, drag: null, tx: 0, ty: 0 };
  try { var cs = localStorage.getItem('sb-cam'); if (cs) { var o = JSON.parse(cs); if (o.d) CAMR.dist = o.d; } } catch (e) {}
  var st0 = KIT.stick;
  KIT.stick = function (i) { var s = st0.call(KIT, i); if (G.mode !== 'play' || !run) return s;
    if (i === 1) return { x: 0, y: 0, on: false }; // the right stick turns the camera here
    if (i === 0 && s && s.on) { var y = CAMR.yaw, fx = Math.sin(y), fz = -Math.cos(y), rx = Math.cos(y), rz = Math.sin(y); return { x: rx * s.x + fx * -s.y, y: rz * s.x + fz * -s.y, on: true }; }
    return s; };
  function camInput(dt) { var r = st0.call(KIT, 1), turn = 0;
    if (r && r.on && Math.abs(r.x) > 0.25) turn += r.x * 2.4; if (KIT.held('lb')) turn -= 2.0; if (KIT.held('rb')) turn += 2.0;
    CAMR.vyaw += (turn - CAMR.vyaw) * Math.min(1, dt * 10); CAMR.yaw += CAMR.vyaw * dt; }
  // drag on the picture (mouse, or a finger away from the buttons and d-pad) to look round
  (function () { var view = document.getElementById('view'), act = null;
    function onBtn(t) { return t && t.closest && t.closest('button,a,input,select,#menu,#pad,.dpad,.pbtn'); }
    view.addEventListener('pointerdown', function (e) { if (G.mode !== 'play' || onBtn(e.target) || (KIT.menuOpen && KIT.menuOpen())) return; act = { id: e.pointerId, x: e.clientX }; });
    window.addEventListener('pointermove', function (e) { if (!act || act.id !== e.pointerId) return; var dx = e.clientX - act.x; act.x = e.clientX; CAMR.yaw += dx * 0.0075; });
    window.addEventListener('pointerup', function (e) { if (act && act.id === e.pointerId) act = null; }); window.addEventListener('pointercancel', function () { act = null; });
    document.addEventListener('touchstart', function (e) { if (G.mode !== 'play') return; for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i]; if (!onBtn(document.elementFromPoint(t.clientX, t.clientY)) && t.clientX > window.innerWidth * 0.33 && !act) act = { id: 'T' + t.identifier, x: t.clientX }; } }, { passive: true });
    document.addEventListener('touchmove', function (e) { if (!act) return; for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i]; if (act.id === 'T' + t.identifier) { CAMR.yaw += (t.clientX - act.x) * 0.009; act.x = t.clientX; } } }, { passive: true });
    var te = function (e) { if (!act) return; for (var i = 0; i < e.changedTouches.length; i++) if (act.id === 'T' + e.changedTouches[i].identifier) act = null; };
    document.addEventListener('touchend', te); document.addEventListener('touchcancel', te); })();
  // with no foe near, shots go the way you face (not just left or right)
  aimDir = function () { var e = nearestFoe(P.x, P.y, 420); if (e) return Math.atan2(e.y - P.y, e.x - P.x); return P.ang3 !== undefined ? P.ang3 : (P.face > 0 ? 0 : Math.PI); };
  /* ---------- the scenery you go round ---------- */
  function scenery(x, y, out) { out = out || []; if (!run) return out; var g = run.st.ground; W3.bigNear(x, y, g, out); W3.wallThings(run.st, x, y, out); return out; }
  function pushOut(o, rad) { var L = scenery(o.x, o.y); for (var i = 0; i < L.length; i++) { var q = L[i], dx = o.x - q.x, dy = o.y - q.y, d = Math.hypot(dx, dy), m = q.r + rad; if (d < m && d > 0.001) { o.x = q.x + dx / d * m; o.y = q.y + dy / d * m; } } }
  /* ---------- height: jumping, ledges and slopes ---------- */
  var JUMPV = 330, GRAV = 980, STEP = 7;
  function rises() { if (run) B3.plats(W3.risesNear(P.x, P.y, run.st.ground)); else B3.plats([]); }
  (function () { var sp = stepPlayer; stepPlayer = function (dt) { if (!run) return sp.apply(this, arguments); rises();
      var x0 = P.x, y0 = P.y; if (P.z3 === undefined || isNaN(P.z3)) { P.z3 = hgt(x0, y0); P.vz = 0; }
      sp.apply(this, arguments); pushOut(P, 8);
      // a ledge taller than a step stops you unless you are up level with it (you slide along its edge)
      var g1 = hgt(P.x, P.y); if (g1 > P.z3 + STEP) { if (hgt(P.x, y0) <= P.z3 + STEP) P.y = y0; else if (hgt(x0, P.y) <= P.z3 + STEP) P.x = x0; else { P.x = x0; P.y = y0; } g1 = hgt(P.x, P.y); }
      if (G.mode === 'play' && KIT.pressed('x') && P.z3 <= g1 + 1.5) { P.vz = JUMPV; P.jumpT = 0; sfx.play('jump'); }
      if (P.vz > 0 || P.z3 > g1 + 3) { P.vz -= GRAV * dt; P.z3 += P.vz * dt; if (P.z3 <= g1) { if (P.vz < -200) KIT.shake(2); P.z3 = g1; P.vz = 0; } } else { P.z3 = g1; P.vz = 0; }
      var dx = P.x - x0, dy = P.y - y0, d = Math.hypot(dx, dy); if (d > 0.2) { var a = Math.atan2(dy, dx); P.ang3 = a; } P.mv3 = d / Math.max(dt, 1e-4); P.ph3 = (P.ph3 || 0) + d * 0.16; };
    // nothing goes through a wall: every foe is kept inside the corridor, and goes round the big scenery
    var sf = stepFoes; if (typeof sf === 'function') stepFoes = function (dt) { sf.apply(this, arguments); if (!run) return; var bd = run.st.band; FR3N = (FR3N + 1) % 2;
      for (var i = 0; i < foes.length; i++) { var e = foes[i]; if (e.dead) continue; if (bd) clampBand(e); if (i % 2 !== FR3N || e.boss || e.f.ai === 'fly' || e.f.fly) continue; pushOut(e, e.r * 0.8); } };
    // up in the air you go over what is on the ground: foes that walk, burning ground, the rolling pin
    var hp0 = hurtPlayer; hurtPlayer = function (dmg, by) { if (run && P.z3 !== undefined && by) { var g = hgt(P.x, P.y);
        if (by.f && by.x !== undefined) { var fz = hgt(by.x, by.y) + (by.boss ? 0 : lift(by)), reach = by.boss ? 46 : (FOE3[by.k] && FOE3[by.k].fly ? 30 : 18); if (Math.abs(P.z3 - fz) > reach) return; }
        else if ((by.k === 'magmaslug' || by.k === 'pin' || by.k === 'goo') && P.z3 - g > 14) return; }
      return hp0.apply(this, arguments); }; })();
  var FR3N = 0;
  /* ---------- the look of each place ---------- */
  function looks() { var g = run ? run.st.ground : 'castle', e = ENV[g] || ENV.castle, L = e.look; return { e: e, L: L }; }
  function groundTex(g) { return KIT.layer('g3_' + g, TILE, TILE, PAINT[g], { px: 1 }); }
  /* ---------- drawing ---------- */
  var SKY = {};
  function lift(e) { var f = FOE3[e.k]; return f && f.fly ? 6 + f.fly * 8 + Math.sin(e.t * 5) * 2 : 0; }
  function shadowAt(x, y, z, r, a) { B3.add('fx_shadow', x, y + 0.6, z, 0, { sc: r, sy: 1, unlit: 1, tint: [0, 0, 0], a: a || 0.35 }); }
  function hgt(x, y) { return B3.hgt(x, y); }
  // anything standing between the camera and you goes see-through, so a big foe or a tree never hides you
  function inWay(x, y, r) { var E = CAMR.eye; if (!E || !P) return false; var ax = P.x - E[0], az = P.y - E[2], L2 = ax * ax + az * az; if (L2 < 1) return false;
    var t = ((x - E[0]) * ax + (y - E[2]) * az) / L2; if (t < 0 || t > 1.02) return false; var qx = E[0] + ax * t - x, qz = E[2] + az * t - y; return qx * qx + qz * qz < (r + 8) * (r + 8); }
  function drawFoe3(e) {
    var gy = hgt(e.x, e.y);
    if (e.under !== undefined) { B3.add('fx_disc', e.x, gy + 0.5, e.y, 0, { sc: 10, unlit: 1, tint: [0.24, 0.16, 0.12], a: 0.9 }); if (Math.floor(KIT.t * 10) % 2) B3.add('fx_ball', e.x + rnd(-5, 5), gy + 2, e.y, 0, { sc: 1.4, unlit: 1, tint: [0.66, 0.6, 0.48] }); return; }
    var mdl = e.boss ? BOSS3[e.k] : (FOE3[e.k] || {}).m, F = e.boss ? {} : (FOE3[e.k] || {}); if (!mdl) return; var m = B3.MODELS[mdl]; if (!m) return;
    var sc = foeScale(e) * (e.elite ? 1 : 1) * (e.sc || 1) / (e.boss ? 1 : 1), fly = e.boss ? (BFLY[e.k] ? 10 + Math.sin(e.t * 3) * 4 : 0) : lift(e);
    // which way it faces: where it is going, else at you
    var px = e._px === undefined ? e.x : e._px, py = e._py === undefined ? e.y : e._py, dx = e.x - px, dy = e.y - py; e._px = e.x; e._py = e.y;
    var want = Math.hypot(dx, dy) > 0.05 ? Math.atan2(dx, dy) : Math.atan2(P.x - e.x, P.y - e.y); if (e._yaw === undefined) e._yaw = want; var dd = ((want - e._yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; e._yaw += dd * 0.2;
    var born = Math.min(1, e.t * 5), sx = 1, sy = 1; if (e.flash > 0) { sx = 1.12; sy = 0.9; } if (born < 1) { sx *= 0.6 + born * 0.4; sy *= born * (2 - born) * 1.08; }
    var tint = F.t || null; if (G.freeze > 0) tint = [0.55, 0.85, 1.25]; if (e.elite) tint = [1.25, 0.6, 0.6];
    var alpha = F && e.f && e.f.ghost ? 0.55 : 1; if (e.boss && e.act && e.act.k === 'charge' && e.act.t < 0.6) alpha = Math.floor(KIT.t * 16) % 2 ? 0.6 : 1;
    var y = gy + fly - m.bot * sc * UNIT; if (inWay(e.x, e.y, m.rad * sc * UNIT * 0.8)) alpha = Math.min(alpha, 0.35);
    B3.add(mdl, e.x, y, e.y, e._yaw, { sc: sc, ph: e.t * (e.boss ? 5 : 9) + e.x * 0.05, am: 1, fl: e.flash > 0 ? 0.75 : 0, a: alpha, sx: sx, sy: Math.max(0.05, sy), tint: tint });
    shadowAt(e.x, gy, e.y, e.r * 1.1, fly ? 0.22 : 0.35);
    if (e.elite) B3.add('fx_ring', e.x, gy + 1.5, e.y, KIT.t, { sc: e.r * 1.7, sy: 2, unlit: 1, tint: [1, 0.15, 0.2], a: 0.55 + Math.sin(KIT.t * 6) * 0.2, glow: 1 });
    if (G.freeze > 0) B3.add('fx_disc', e.x, gy + 0.8, e.y, 0, { sc: e.r * 1.2, unlit: 1, tint: [0.6, 0.87, 1], a: 0.5 });
    if (e.boss && ((e.beams !== null && e.beams !== undefined) || (e.beamWarn !== null && e.beamWarn !== undefined))) { var ang = e.beams !== null && e.beams !== undefined ? e.beams : e.beamWarn, on = e.beams !== null && e.beams !== undefined;
      for (var b = 0; b < 4; b++) { var a = ang + b * Math.PI / 2; B3.add('fx_box', e.x + Math.cos(a) * 350, gy + 26, e.y + Math.sin(a) * 350, Math.atan2(Math.sin(a), Math.cos(a)) * 0 + Math.PI / 2 - a, { sc: 1, sx: on ? 8 : 2, sy: on ? 8 : 2, unlit: 1, tint: [1, 0.15, 0.2], a: on ? 0.85 : 0.3, glow: 1, len: 700 }); } }
  }
  function drawPlayer3() { if (!P) return; var gy = hgt(P.x, P.y), pz = P.z3 === undefined ? gy : P.z3, mdl = charModel(), C = charOf(run && run.ch), sc = scaleFor(mdl, mdl === 'cat' ? 24 : (sprH(C.one || (C.walk + '0')) || 44) * (C.sc || 1) * 1.08);
    if (P.ang3 === undefined) P.ang3 = -Math.PI / 2; var want = Math.atan2(Math.cos(P.ang3), Math.sin(P.ang3)); // 2D angle (x right, y down) to a turn round the up axis
    if (P._yaw === undefined) P._yaw = want; var dd = ((want - P._yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; P._yaw += dd * 0.25;
    var mv = Math.min(1, (P.mv3 || 0) / 100), dead = G.mode === 'dead', blink = P.inv > 0 && P.dashT <= 0 && Math.floor(KIT.t * 20) % 2;
    if (G.frenzy > 0) B3.add('fx_ball', P.x, pz + 22, P.y, 0, { sc: 26, unlit: 1, tint: [1, 0.15, 0.2], a: 0.12 + Math.sin(KIT.t * 12) * 0.05, glow: 1 });
    shadowAt(P.x, gy, P.y, 14 * Math.max(0.5, 1 - (pz - gy) / 120), 0.4);
    if (!blink) B3.add(mdl, P.x, pz - B3.MODELS[mdl].bot * sc * UNIT, P.y, P._yaw, { sc: sc, ph: (P.ph3 || 0) + (mv < 0.1 ? KIT.t * 1.5 : 0), am: dead ? 0 : Math.max(0.12, mv), fl: P.hurtT > 0 ? 0.6 : 0, tilt: dead ? -1.45 : P.dashT > 0 ? 0.45 : pz > gy + 3 ? Math.max(-0.35, Math.min(0.35, -(P.vz || 0) / 900)) : mv * 0.06, sx: P.hurtT > 0 ? 1.1 : 1, sy: P.hurtT > 0 ? 0.92 : 1 }); }
  function drawPets3() { (run.pals ? run.weapons.concat(run.pals) : run.weapons).forEach(function (w) {
      if (w.pets) w.pets.forEach(function (p) { var mdl = 'hom_' + p.b + '_adult'; if (!B3.MODELS[mdl]) return; var gy = hgt(p.x, p.y), sc = scaleFor(mdl, [14, 19, 24][p.st || 0]) * (p.atk > 0 ? 1.1 : 1);
        var px = p._px === undefined ? p.x : p._px, dx = p.x - px, dy = p.y - (p._py === undefined ? p.y : p._py); p._px = p.x; p._py = p.y; if (Math.hypot(dx, dy) > 0.1) p._yaw = Math.atan2(dx, dy);
        B3.add(mdl, p.x, gy - B3.MODELS[mdl].bot * sc * UNIT, p.y, p._yaw || 0, { sc: sc, ph: (p.t || 0) * 10, am: p.mv ? 1 : 0.15 }); shadowAt(p.x, gy, p.y, 8); });
      [w.cat].concat(w.cats || []).forEach(function (c) { if (!c) return; var gy = hgt(c.x, c.y), sc = scaleFor('cat', 18); var px = c._px === undefined ? c.x : c._px, dx = c.x - px, dy = c.y - (c._py === undefined ? c.y : c._py); c._px = c.x; c._py = c.y; if (Math.hypot(dx, dy) > 0.1) c._yaw = Math.atan2(dx, dy);
        B3.add('cat', c.x, gy + (c.z || 0) - B3.MODELS.cat.bot * sc * UNIT, c.y, c._yaw || 0, { sc: sc, ph: KIT.t * 12, am: 1, tilt: c.j ? -0.4 : 0 }); shadowAt(c.x, gy, c.y, 9); }); }); }
  var SHOTM = { heart: 's_heart', pizza: 's_pizza', coffee: 's_coffee', cleaver: 's_cleaver', token: 's_token', beer: 's_beer', drop: 'p_drop', sperm: 'p_drop', pie: 's_pie', pill: 'p_pill', saus: 's_saus', sausage: 's_saus', wave: 's_wave', cres: 's_cres', trident: 's_dagger', bone: 's_bone', coin: 's_coin', dagger: 's_dagger', pillb: 'p_pill' };
  function shotModel(s) { if (SHOTM[s.k]) return SHOTM[s.k]; var n = s.spr || ''; if (/pie/.test(n)) return 's_pie'; if (/pill/.test(n)) return 'p_pill'; if (/saus/.test(n)) return 's_saus'; if (/wave/.test(n)) return 's_wave'; if (/tri|bolt/.test(n)) return 's_dagger'; return 'p_drop'; }
  var ORB3 = { fire: [1, 0.6, 0.19], goo: [0.6, 0.23, 0.85], bolt: [1, 0.78, 0.25], orb: [0.77, 0.07, 0.11], shard: [1, 0.2, 0.25], cork: [0.65, 0.4, 0.23] };
  function drawShots3() {
    shots.forEach(function (s) { var gy = hgt(s.x, s.y), m = shotModel(s), a = Math.atan2(s.vx || 0, s.vy || 0), H0 = 14, z = s.y + 16;
      if (s.k === 'wave') { B3.add('s_wave', s.x, gy, z, a, { sc: s.r / 13 * 1.1 }); B3.add('fx_ring', s.x, gy + 2, z, 0, { sc: s.r, sy: 3, unlit: 1, tint: [0.6, 0.95, 0.95], a: 0.6, glow: 1 }); return; }
      if (s.land && s.tx !== undefined) { var kl = Math.min(1, s.t / s.T), lx = s.x0 + (s.tx - s.x0) * kl, lz = s.y0 + (s.ty - s.y0) * kl; B3.add(m, lx, hgt(lx, lz) + 8 + Math.sin(kl * Math.PI) * 60, lz, s.t * 9, { sc: 1.1 * (s.vs || 1), tilt: s.t * 7 }); return; }
      if (s.k === 'pie' || m === 's_pie') { var k = Math.min(1, s.t / Math.max(0.2, s.life || 1)); H0 = 12 + Math.sin(k * Math.PI) * 50; }
      var sc = (s.k === 'drop' ? s.r / 4 : (s.sc || 1) * (s.vs || 1)) * (m === 'p_drop' ? 0.55 : m === 'p_pill' ? 0.6 : 0.045 * UNIT / 1);
      B3.add(m, s.x, gy + H0, z, m === 'p_drop' || m === 's_dagger' || m === 's_saus' || m === 's_heart' ? a : (s.rot || 0) + s.t * 6, { sc: sc, tilt: m === 'p_drop' ? 1.4 : 0, am: 0 });
      if (m === 'p_drop') B3.add('fx_ball', s.x, gy + H0, z, 0, { sc: s.r * 0.9, unlit: 1, tint: [1, 0.95, 0.8], a: 0.25, glow: 1 }); });
    eshots.forEach(function (s) { var gy = hgt(s.x, s.y), z = s.y + 14, k = s.k;
      if (k === 'pie') { B3.add('s_pie', s.x, gy + 14, z, s.t * 8, { sc: 0.8 }); return; } if (k === 'bone') { B3.add('s_bone', s.x, gy + 14, z, s.t * 10, { sc: 0.9 }); return; }
      if (k === 'coin') { B3.add('s_coin', s.x, gy + 14, z, s.t * 8, { sc: 0.8 }); return; } if (k === 'dagger') { B3.add('s_dagger', s.x, gy + 14, z, Math.atan2(s.vx, s.vy), { sc: 1 }); return; }
      var c = ORB3[k] || ORB3.orb; B3.add('fx_ball', s.x, gy + 14, z, 0, { sc: (s.r + 1), unlit: 1, tint: c, a: 0.95 }); B3.add('fx_ball', s.x, gy + 14, z, 0, { sc: (s.r + 1) * 1.8, unlit: 1, tint: c, a: 0.35, glow: 1 }); });
  }
  function drawFloorThings3() { var t = KIT.t;
    hazards.forEach(function (z) { var gy = hgt(z.x, z.y === undefined ? P.y : z.y), warn = z.t < (z.warn || 0);
      if (z.k === 'burn') { var a = Math.min(1, (z.life - z.t)); B3.add('fx_disc', z.x, gy + 0.7, z.y, 0, { sc: z.r, unlit: 1, tint: [1, 0.35, 0.08], a: 0.45 * a, glow: 1 }); }
      else if (z.k === 'hand' || z.k === 'vent' || z.k === 'chand') { if (warn) { var kk = z.t / z.warn; B3.add('fx_disc', z.x, gy + 0.7, z.y, 0, { sc: z.r, unlit: 1, tint: z.k === 'vent' ? [1, 0.6, 0.19] : [0, 0, 0], a: 0.2 * (1 + kk) }); B3.add('fx_ring', z.x, gy + 1, z.y, 0, { sc: z.r * kk, sy: 2, unlit: 1, tint: z.k === 'vent' ? [1, 0.6, 0.19] : [1, 0.15, 0.2], a: 0.9, glow: 1 }); }
        else if (z.k === 'vent') { var fk = Math.min(1, (z.life - z.t) * 2); for (var i = 0; i < 6; i++) B3.add('fx_ball', z.x + Math.sin(t * 20 + i) * 3, gy + 6 + i * 11, z.y, 0, { sc: z.r * (1 - i / 8) * fk * 0.8, unlit: 1, tint: i < 2 ? [0.77, 0.19, 0.1] : i < 4 ? [1, 0.6, 0.19] : [1, 0.9, 0.42], a: 0.8, glow: 1 }); } }
      else if (z.k === 'goo') { var g = warn ? z.t / z.warn : Math.min(1, (z.life - z.t)); B3.add('fx_disc', z.x, gy + 0.7, z.y, 0, { sc: z.r * g, unlit: 1, tint: [0.6, 0.23, 0.85], a: 0.6 }); }
      else if (z.k === 'coaster') { if (warn) { var bl = Math.floor(t * 8) % 2; B3.add('fx_box', P.x, gy + 0.5, z.y, 0, { sc: 1, sx: 900, sy: 0.6, len: 28, unlit: 1, tint: [1, 0.15, 0.2], a: bl ? 0.35 : 0.15, glow: 1 }); }
        else for (var c = 0; c < 3; c++) { var cx = z.x - z.dir * c * 34; B3.add('coaster', cx, hgt(cx, z.y), z.y, z.dir > 0 ? Math.PI / 2 : -Math.PI / 2, { sc: 1.25 }); } }
      else if (z.k === 'pin') { if (warn) { B3.add('fx_box', z.x, gy + 0.5, P.y, Math.PI / 2, { sc: 1, sx: 900, sy: 0.6, len: 160, unlit: 1, tint: [1, 0.15, 0.2], a: Math.floor(t * 8) % 2 ? 0.3 : 0.12, glow: 1 }); } else B3.add('rollingpin', z.x, gy + 10, z.y, Math.PI / 2, { sc: 4, ph: t * 8 }); }
      else if (z.k === 'flush') { var bw = run.st.band && run.st.band.y ? run.st.band.y : 300;
        if (warn) { var wk = z.t / z.warn, wx = z.x + z.dir * (1 - wk) * 0; for (var a2 = -2; a2 <= 2; a2++) B3.add('fx_box', P.x - z.dir * 120, 1, a2 * bw * 0.4, 0, { sx: 30, sy: 0.6, len: 26, unlit: 1, tint: [1, 0.9, 0.6], a: Math.floor(t * 8) % 2 ? 0.7 : 0.2, glow: 1 }); }
        else { for (var s = -Math.ceil(bw / 40); s <= Math.ceil(bw / 40); s++) { var zz = s * 40; if (Math.abs(zz) > bw) continue; var hh2 = 44 + Math.sin(t * 9 + s * 1.3) * 6;
            B3.add('fx_box', z.x - z.dir * 40, 0, zz, 0, { sx: 80, sy: hh2 * 0.8, len: 42, tint: [0.8, 0.72, 0.52] });
            B3.add('fx_box', z.x, 0, zz, 0, { sx: 40, sy: hh2, len: 42, tint: [0.95, 0.89, 0.7] });
            B3.add('fx_ball', z.x + z.dir * 10, hh2, zz + Math.sin(t * 7 + s) * 6, 0, { sc: 12, sy: 0.7, tint: [1, 0.98, 0.9] });
            B3.add('fx_ball', z.x + z.dir * 22 + Math.sin(t * 11 + s) * 4, hh2 * 0.6, zz, 0, { sc: 7, unlit: 1, tint: [1, 1, 0.95], a: 0.8 }); }
          for (var sp2 = 0; sp2 < 10; sp2++) { var k3 = ((t * 2 + sp2 * 0.37) % 1); B3.add('fx_ball', z.x + z.dir * (16 + k3 * 30), 40 + k3 * 30 - k3 * k3 * 60, (sp2 - 5) * bw / 5, 0, { sc: 3, unlit: 1, tint: [1, 0.97, 0.88], a: 1 - k3 }); } } }
      if (z.k === 'chand') { var live = z.t >= (z.warn || 0); if (!live) { var k2 = z.t / z.warn; B3.add('chand', z.x, gy + (1 - k2) * 220 + 4, z.y, 0, { sc: 1.1 }); } else if (z.t < z.warn + 0.5) B3.add('chand', z.x, gy + 2, z.y, 0, { sc: 1.1, a: Math.max(0.05, 1 - (z.t - z.warn) * 2) }); }
      if (z.k === 'hand' && !warn && z.t < z.life) B3.add('gravehand', z.x, gy, z.y, Math.atan2(P.x - z.x, P.y - z.y), { sc: 1.3, sy: Math.min(1, (z.t - z.warn) * 6) }); });
    pools.forEach(function (p) { var gy = hgt(p.x, p.y);
      if (p.fire) { var fa = Math.min(1, (p.life - p.t) / 1.5); B3.add('fx_disc', p.x, gy + 0.7, p.y, 0, { sc: p.r, unlit: 1, tint: [0.28, 0.14, 0.05], a: 0.7 * fa }); for (var i = 0; i < 5; i++) B3.add('fx_cone', p.x - p.r * 0.6 + i * p.r * 0.3, gy, p.y + Math.sin(i * 2.3) * p.r * 0.4, 0, { sc: 1, sx: 4 * fa + 1, sy: (10 + Math.sin(t * 14 + i) * 4) * fa, unlit: 1, tint: i % 2 ? [1, 0.6, 0.15] : [1, 0.85, 0.3], a: 0.85, glow: 1 }); return; }
      var a = Math.min(1, (p.life - p.t) * 2) * (p.hold ? 0.35 : 0.6), cof = p.coffee; B3.add('fx_disc', p.x, gy + 0.6, p.y, 0, { sc: p.r, unlit: 1, tint: cof ? [0.24, 0.12, 0.05] : [0.72, 0.63, 0.44], a: a * 0.8 }); B3.add('fx_disc', p.x, gy + 0.8, p.y, 0, { sc: p.r - 3, unlit: 1, tint: cof ? [0.47, 0.26, 0.1] : [0.95, 0.88, 0.69], a: a }); if (cof && Math.random() < 0.2) fx.push({ k: 'bub', x: p.x + rnd(-p.r, p.r) * 0.6, y: p.y + rnd(-4, 4), t: 0, life: 0.6 }); });
    marks.forEach(function (m) { var gy = hgt(m.x, m.y), k = m.t / m.at; B3.add('fx_disc', m.x, gy + 0.7, m.y, 0, { sc: m.r * k, unlit: 1, tint: [0, 0, 0], a: 0.4 }); B3.add('s_pie', m.x, gy + (1 - k) * 200 + 6, m.y, k * 6, { sc: 1.6 }); });
    marks2.forEach(function (m) { if (m.t < 0) return; var gy = hgt(m.x, m.y), k = m.t / m.at; B3.add('fx_disc', m.x, gy + 0.7, m.y, 0, { sc: m.r, unlit: 1, tint: [1, 0.15, 0.19], a: 0.12 + 0.18 * k }); B3.add('fx_ring', m.x, gy + 1, m.y, 0, { sc: m.r * k, sy: 2, unlit: 1, tint: [1, 0.3, 0.3], a: 0.9, glow: 1 });
      if (m.meteor) B3.add('s_meteor', m.x + (1 - k) * 60, gy + (1 - k) * 220 + m.r * 0.5, m.y, k * 4, { sc: m.r / 12 }); });
    var gw = wOf('garlic'); if (gw && gw.rad) { var pr = gw.rad * (1 + Math.sin(t * 6) * 0.04), gy2 = hgt(P.x, P.y); B3.add('fx_disc', P.x, gy2 + 1, P.y, 0, { sc: pr, unlit: 1, tint: gw.evo ? [1, 0.94, 0.78] : [0.95, 0.9, 0.82], a: gw.evo ? 0.16 : 0.1 }); B3.add('fx_ring', P.x, gy2 + 1.5, P.y, t * 0.3, { sc: pr, sy: 2, unlit: 1, tint: [0.95, 0.9, 0.82], a: 0.4 }); B3.add('fx_ball', P.x, gy2 + 12, P.y, 0, { sc: pr * 0.9, sy: 0.4, unlit: 1, tint: [0.95, 0.9, 0.6], a: 0.05, glow: 1 }); }
  }
  var DMAP = { dc_lamp: ['city_lamp', 0.3] }; // floor things the city already has a model of
  function drawWorldThings3(cx, cy, R2) { var st = run.st, g = st.ground, e = ENV[g];
    // the floor dressing (the same cells as before)
    var a = Math.floor((cx - R2) / DCELL), b = Math.floor((cy - R2) / DCELL), a2 = Math.floor((cx + R2) / DCELL), b2 = Math.floor((cy + R2) / DCELL);
    for (var gy = b; gy <= b2; gy++) for (var gx = a; gx <= a2; gx++) decorAt(gx, gy, st).forEach(function (d) {
      if (!inBand(d.x, d.y, 30) || (g === 'sewer' && Math.abs(d.y) < 50) || (g === 'castle' && Math.abs(d.x) < 80)) return; var s = hh(gx, gy, 99);
      var dm = DMAP[d.k]; B3.add(dm ? dm[0] : d.k, d.x, hgt(d.x, d.y), d.y, s * 6.283, { sc: dm ? dm[1] : 1, am: 0, ph: KIT.t }); });
    // the breakable things
    var c0 = Math.floor((cx - R2) / BCELL), r0 = Math.floor((cy - R2) / BCELL), c1 = Math.floor((cx + R2) / BCELL), r1 = Math.floor((cy + R2) / BCELL);
    for (var y = r0; y <= r1; y++) for (var x = c0; x <= c1; x++) { if (hh(x, y, 201) > 0.24 || run.broken[x + ',' + y]) continue; var bx = x * BCELL + 30 + hh(x, y, 202) * (BCELL - 60), by = y * BCELL + 30 + hh(x, y, 203) * (BCELL - 60); if (!inBand(bx, by, 30)) continue;
      B3.add(B3.MODELS['br_' + g] ? 'br_' + g : run.st.br, bx, hgt(bx, by), by, hh(x, y, 204) * 6.283, { sc: 1, am: 0 }); shadowAt(bx, hgt(bx, by), by, 9, 0.3); }
    // the big scenery
    var L = []; for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) W3.bigNear(cx + i * 300, cy + j * 300, g, L); W3.wallThings(st, cx, cy, L); var seen = {};
    L.forEach(function (q) { var k = q.x.toFixed(1) + ',' + q.y.toFixed(1); if (seen[k]) return; seen[k] = 1; if (Math.abs(q.x - cx) > R2 + 60 || Math.abs(q.y - cy) > R2 + 60) return; var mdl = q.m, sc = q.sc || 1, m = B3.MODELS[mdl]; if (!m) return; B3.add(mdl, q.x, hgt(q.x, q.y), q.y, q.yaw, { sc: sc, am: 0, ph: KIT.t, a: inWay(q.x, q.y, q.r) ? 0.35 : 1 }); });
    // the corridor walls
    var bd = st.band; if (bd && bd.y) { [-1, 1].forEach(function (sg) { B3.add('fx_box', cx, 0, sg * (bd.y + 14 + 600), 0, { sx: R2 * 2 + 400, sy: 80, len: 1200, tint: [0.16, 0.1, 0.07] }); }); var x0 = Math.floor((cx - R2) / 64) * 64; for (var xx = x0; xx < cx + R2; xx += 64) { B3.add('wall_sewer', xx, 0, -bd.y - 7, 0, { sc: 1 }); B3.add('wall_sewer', xx, 0, bd.y + 7, Math.PI, { sc: 1 }); }
      for (var p = Math.floor((cx - R2) / 220); p < (cx + R2) / 220; p++) { B3.add('wall_pipe', p * 220 + 60, 30, -bd.y, 0, { sc: 1 }); B3.add('wall_pipe', p * 220 + 60, 30, bd.y, Math.PI, { sc: 1 }); var dr = (KIT.t * 30 + p * 7) % 26; B3.add('fx_ball', p * 220 + 60, 40 - dr * 1.4, -bd.y + 12, 0, { sc: 2, unlit: 1, tint: [0.95, 0.88, 0.69], a: 0.9 }); }
      for (var rx = Math.floor((cx - R2) / 80) * 80; rx < cx + R2; rx += 80) { B3.add('fx_box', rx, -0.4, 0, 0, { sc: 1, sx: 80, sy: 1, len: 60, tint: [0.3, 0.23, 0.13] }); for (var w = 0; w < 3; w++) { var wx = rx + ((KIT.t * 30 + w * 27 + rx) % 80) - 40; B3.add('fx_box', wx, 0.8, -20 + w * 18, 0, { sx: 12, sy: 0.3, len: 1.4, unlit: 1, tint: [0.95, 0.88, 0.69], a: 0.35 }); } } }
    if (bd && bd.x) { [-1, 1].forEach(function (sg) { B3.add('fx_box', sg * (bd.x + 16 + 600), 0, cy, 0, { sx: 1200, sy: 100, len: R2 * 2 + 400, tint: [0.14, 0.1, 0.11] }); }); var z0 = Math.floor((cy - R2) / 70) * 70; for (var zz = z0; zz < cy + R2; zz += 70) { B3.add('wall_castle', -bd.x - 8, 0, zz, 0, { sc: 1 }); B3.add('wall_castle', bd.x + 8, 0, zz, Math.PI, { sc: 1 }); }
      for (var tq = Math.floor((cy - R2) / 160); tq < (cy + R2) / 160; tq++) [-1, 1].forEach(function (sg) { var tx = sg * (bd.x - 4), tz = tq * 160 + 50; B3.add('torch', tx, 40, tz, 0, { sc: 1 }); B3.add('fx_cone', tx, 50, tz, 0, { sx: 2.5, sy: 7 + Math.sin(KIT.t * 12 + tq) * 1.5, unlit: 1, tint: [1, 0.75, 0.3], a: 0.9, glow: 1 }); B3.add('fx_ball', tx, 54, tz, 0, { sc: 14, unlit: 1, tint: [1, 0.55, 0.2], a: 0.1, glow: 1 }); }); }
    if (g === 'castle') for (var cz = Math.floor((cy - R2) / 120) * 120; cz < cy + R2; cz += 120) B3.add('fx_box', 0, 0.3, cz, 0, { sx: 120, sy: 0.6, len: 120, tint: [0.2, 0.02, 0.03] });
    // the friend's cell
    var cl = run.cell; if (cl) { var cg = hgt(cl.x, cl.y); if (!cl.freed && FR3[cl.id]) { var fm = FR3[cl.id], fs = scaleFor(fm, 38); B3.add(fm, cl.x, cg - B3.MODELS[fm].bot * fs * UNIT, cl.y, Math.atan2(P.x - cl.x, P.y - cl.y), { sc: fs, ph: KIT.t * 2, am: 0.2 }); }
      B3.add(cl.freed ? 'cellopen' : 'cell', cl.x, cg, cl.y, 0, { sc: 1 }); if (!cl.freed && cl.t > 0) B3.add('fx_ring', cl.x, cg + 44, cl.y, 0, { sc: 24 * cl.t / 1.4, sy: 3, unlit: 1, tint: [1, 0.89, 0.42], a: 0.9, glow: 1 }); }
    // pearls, drops, pickups and chests
    loot.forEach(function (o) { if (Math.abs(o.x - cx) > R2 || Math.abs(o.y - cy) > R2) return; var gy = hgt(o.x, o.y);
      if (o.k === 'pearl') { var col = o.tier === 2 ? [1, 0.89, 0.42] : o.tier === 1 ? [1, 0.15, 0.2] : [0.92, 0.92, 0.97]; B3.add('fx_ball', o.x, gy + 5 + Math.sin(KIT.t * 4 + o.x) * 1.5, o.y, 0, { sc: (o.big ? 4.5 : 2.8), unlit: 0, tint: col, sc2: 1 }); return; }
      if (o.k === 'chest') { B3.add(o.big ? 'bigchest' : 'chest', o.x, gy, o.y, Math.atan2(P.x - o.x, P.y - o.y), { sc: 1.1 }); if (Math.floor(KIT.t * 3) % 2) B3.add('fx_ball', o.x, gy + 26, o.y, 0, { sc: 3, unlit: 1, tint: [1, 0.89, 0.42], a: 0.9, glow: 1 }); shadowAt(o.x, gy, o.y, 10); return; }
      var mdl = PICK3[o.k] || 'gold'; B3.add(mdl, o.x, gy + 4 + Math.sin(KIT.t * 3 + o.x) * 2, o.y, KIT.t * 2, { sc: 1.2 }); shadowAt(o.x, gy, o.y, 6); });
    // Shithead Laboozie and his bags
    if (typeof LABV !== 'undefined' && LABV) { var Lb = LABV, lg = hgt(Lb.x, Lb.y), ls = scaleFor('c_laboozie', 40); B3.add('c_laboozie', Lb.x, lg - B3.MODELS.c_laboozie.bot * ls * UNIT, Lb.y, Lb.face > 0 ? Math.PI / 2 : -Math.PI / 2, { sc: ls, ph: KIT.t * 9, am: Lb.st === 'throw' ? 0.2 : 1 }); shadowAt(Lb.x, lg, Lb.y, 10); }
    if (typeof LABBAGS !== 'undefined') LABBAGS.forEach(function (bg) { var k = Math.min(1, bg.t / bg.T), x = bg.x0 + (bg.x1 - bg.x0) * k, z = bg.y0 + (bg.y1 - bg.y0) * k + 24, gy = hgt(x, z); B3.add('p_bag', x, gy + 20 + Math.sin(k * Math.PI) * 70, z, KIT.t * 6, { sc: 0.7 }); B3.add('fx_ball', x, gy + 26 + Math.sin(k * Math.PI) * 70, z, 0, { sc: 6, unlit: 1, tint: [1, 0.5, 0.1], a: 0.4, glow: 1 }); });
  }
  function drawWeapons3() { var dw = wOf('disco'); if (dw && dw.bx !== undefined) { var pz = P.z3 === undefined ? hgt(P.x, P.y) : P.z3; B3.add('disco', dw.bx, pz + 56 + Math.sin(KIT.t * 3) * 2, dw.by + 52, KIT.t * 2, { sc: 1.3 }); B3.add('fx_ball', dw.bx, pz + 56, dw.by + 52, 0, { sc: 16, unlit: 1, tint: [1, 0.5, 0.8], a: 0.08, glow: 1 }); }
    if (G.goldT > 0) { var gz = P.z3 === undefined ? hgt(P.x, P.y) : P.z3; B3.add('fx_ball', P.x, gz + 20, P.y, 0, { sc: 24, unlit: 1, tint: [1, 0.85, 0.3], a: 0.15 + Math.sin(KIT.t * 10) * 0.05, glow: 1 }); }
    var CT = window.__cart && __cart(); if (CT && !(CT.life - CT.t < 8 && Math.floor(KIT.t * 6) % 2)) { var cg = hgt(CT.x, CT.y), ks = scaleFor('c_kaya', 40); B3.add('cart', CT.x, cg, CT.y, Math.atan2(P.x - CT.x, P.y - CT.y), { sc: 1 }); B3.add('c_kaya', CT.x + 14, cg - B3.MODELS.c_kaya.bot * ks * UNIT, CT.y - 14, Math.atan2(P.x - CT.x, P.y - CT.y), { sc: ks, ph: KIT.t * 2, am: 0.15 }); shadowAt(CT.x, cg, CT.y, 26, 0.35); }
    run.weapons.forEach(function (w) {
      if (w.id === 'bubble' && w.on && w.pts) w.pts.forEach(function (p) { var gy = hgt(p[0], p[1]); B3.add('fx_ball', p[0], gy + 16, p[1] + 14, 0, { sc: p[2], unlit: 1, tint: [0.6, 0.87, 1], a: 0.22 }); B3.add('fx_ring', p[0], gy + 16, p[1] + 14, KIT.t, { sc: p[2], sy: 6, unlit: 1, tint: w.evo ? [1, 0.89, 0.42] : [0.6, 0.87, 1], a: 0.8, glow: 1 }); });
      if (w.id === 'sausage' && w.evo && w.pts) w.pts.forEach(function (p, i) { var gy = hgt(p[0], p[1]); for (var k = 0; k < 9; k++) { var a = KIT.t * 10 + k * 0.9 + i, r = 6 + k * 2.6; B3.add('s_saus', p[0] + Math.cos(a) * r, gy + 4 + k * 6, p[1] + 10 + Math.sin(a) * r, a, { sc: 0.9 }); } B3.add('fx_cone', p[0], gy, p[1] + 10, 0, { sx: 26, sy: 60, unlit: 1, tint: [0.65, 0.59, 0.56], a: 0.18 }); }); }); }
  function drawFx3() { var t = KIT.t; fx.forEach(function (f) { var k = f.t / f.life, gy = hgt(f.x, f.y), z = f.y + 14;
      if (f.k === 'beam') { var col = B3.hex(f.col || '#ffffff'), wy = (P.z3 === undefined ? gy : P.z3) + 56, n = 7; for (var j = 0; j <= n; j++) { var bx = f.x + (f.x2 - f.x) * j / n, bz = (f.y + 52) + ((f.y2 + 10) - (f.y + 52)) * j / n; B3.add('fx_ball', bx, wy + (hgt(f.x2, f.y2) + 12 - wy) * j / n, bz, 0, { sc: 1.6, unlit: 1, tint: col, a: 1 - k, glow: 1 }); } return; }
      if (f.k === 'slash') { var pz = P.z3 === undefined ? gy : P.z3; for (var j2 = 0; j2 <= 10; j2++) { var aa2 = f.a - f.w + 2 * f.w * j2 / 10, rr2 = f.r * (0.7 + k * 0.3); B3.add('fx_ball', f.x + Math.cos(aa2) * rr2, pz + 14, f.y + 12 + Math.sin(aa2) * rr2, 0, { sc: 3 * (1 - k) + 1, unlit: 1, tint: j2 % 2 ? [0.91, 0.96, 1] : [1, 0.89, 0.42], a: 1 - k, glow: 1 }); } return; }
      if (f.k === 'pt') B3.add('fx_box', f.x, gy + 12 + (1 - k) * 6, z, 0, { sx: 2, sy: 2, len: 2, unlit: 1, tint: B3.hex(f.col && f.col[0] === '#' ? f.col : '#f1e7d0'), a: 1 - k });
      else if (f.k === 'bub') B3.add('fx_ball', f.x, gy + 8 + k * 14, z, 0, { sc: 2 + k * 2, unlit: 1, tint: [0.6, 0.87, 1], a: (1 - k) * 0.7 });
      else if (f.k === 'slap') { for (var i = 0; i < 7; i++) { var a = -1.2 + i * 0.4; B3.add('fx_ball', f.x + f.dir * (f.w / 2 + Math.cos(a) * f.w / 2), gy + 10, z + Math.sin(a) * f.h / 2, 0, { sc: 5, unlit: 1, tint: [0.16, 0.63, 0.66], a: 0.5 * (1 - k), glow: 1 }); } }
      else if (f.k === 'bolt') { B3.add('fx_cyl', f.x + rnd(-3, 3), gy, z - 14, 0, { sx: 1.6, sy: 220, unlit: 1, tint: [1, 0.94, 0.6], a: 1 - k, glow: 1 }); B3.add('fx_disc', f.x, gy + 1, z - 14, 0, { sc: 16 * (1 - k) + 4, unlit: 1, tint: [1, 0.94, 0.6], a: 0.6 * (1 - k), glow: 1 }); }
      else if (f.k === 'arc') { var n = 5; for (var j = 0; j <= n; j++) { var x = f.x + (f.x2 - f.x) * j / n + rnd(-3, 3), y = f.y + (f.y2 - f.y) * j / n + rnd(-3, 3); B3.add('fx_ball', x, hgt(x, y) + 14, y + 10, 0, { sc: 2, unlit: 1, tint: [1, 0.94, 0.6], a: 1 - k, glow: 1 }); } }
      else if (f.k === 'ring') B3.add('fx_ring', f.x, gy + 2, f.y, 0, { sc: f.r * (0.6 + k * 0.6), sy: 3, unlit: 1, tint: B3.hex(f.col && f.col[0] === '#' ? f.col : '#ffe36a'), a: 1 - k, glow: 1 });
      else if (f.k === 'splat') B3.add('fx_disc', f.x, gy + 0.9, f.y + 4, 0, { sc: 9 * (f.sc || 1) * (1 + k * 0.4), unlit: 1, tint: [0.95, 0.88, 0.69], a: 1 - k });
      else if (f.k === 'nado') { var nx = P.x - 360 + k * 720; for (var q = 0; q < 14; q++) { var aa = t * 12 + q * 0.9, r = 10 + q * 5; B3.add('s_saus', nx + Math.cos(aa) * r, hgt(nx, P.y) + q * 9, P.y + Math.sin(aa) * r, aa, { sc: 1.2 }); } } });
    rings.forEach(function (g) { var gy = hgt(g.x, g.y), a = 1 - Math.max(0, g.t - g.life) / 0.15; B3.add('fx_ring', g.x, gy + 2, g.y, 0, { sc: g.r, sy: g.big ? 10 : 4, unlit: 1, tint: B3.hex(g.col && g.col[0] === '#' ? g.col : '#c08aff'), a: 0.9 * a, glow: 1 });
      if (g.big) B3.add('fx_cyl', g.x, gy, g.y, 0, { sx: g.r, sy: 26, unlit: 1, tint: [0.16, 0.63, 0.66], a: 0.25 * a }); else B3.add('fx_ring', g.x, gy + 2, g.y, 0, { sc: g.r * 0.85, sy: 3, unlit: 1, tint: [0.75, 0.54, 1], a: 0.3 * a, glow: 1 }); });
  }
  /* ---------- the HUD over the picture ---------- */
  function proj(x, y, z) { return B3.project(x, y, z, KIT.W, KIT.H); }
  function hud3() {
    for (var i = 0; i < nums.length; i++) { var nm = nums[i], p = proj(nm.x, hgt(nm.x, nm.y) + 30 + nm.t * 30, nm.y + 22); if (p) numDraw(nm.s, p.x, p.y, nm.col, 1 - nm.t / 0.7); }
    var pp = proj(P.x, (P.z3 === undefined ? hgt(P.x, P.y) : P.z3) - 2, P.y); if (pp && G.mode === 'play') { var x = pp.x, y = pp.y + 4; if (P.hp < P.max) { R('#12040a', x - 16, y, 32, 4); R('#4a0a10', x - 15, y + 1, 30, 2); R('#ff2630', x - 15, y + 1, 30 * P.hp / P.max, 2); } if (P.dashCd > 0) R('rgba(42,160,168,0.8)', x - 15, y + 5, 30 * (1 - P.dashCd / 1.8), 1); }
    foes.forEach(function (e) { if (e.dead) return; if (!e.elite && !(e.confT > 0)) return; var p = proj(e.x, hgt(e.x, e.y), e.y); if (!p) return;
      if (e.confT > 0) text('?', p.x, p.y - e.r * 3 - 10, { size: 8, col: '#ffe36a', align: 'center' }); if (e.elite) { var w = 30; R('#12040a', p.x - w / 2 - 1, p.y + 4, w + 2, 4); R('#ff2630', p.x - w / 2, p.y + 5, w * Math.max(0, e.hp / e.mhp), 2); } });
    var cl = run.cell; run.cell = null; try { drawHud(); } finally { run.cell = cl; }
    // which way the friend's cell is: an arrow at the edge, turned with the camera
    if (cl && !cl.freed) { var q = proj(cl.x, hgt(cl.x, cl.y) + 20, cl.y), WW = KIT.W, HH = KIT.H; if (!q || q.x < 0 || q.x > WW || q.y < 0 || q.y > HH) { var dx = cl.x - P.x, dy = cl.y - P.y, y0 = CAMR.yaw, rx = dx * Math.cos(y0) + dy * Math.sin(y0), fz = dx * Math.sin(y0) - dy * Math.cos(y0), a = Math.atan2(-fz, rx);
        var kk = Math.min((WW / 2 - 22) / Math.abs(Math.cos(a) || 1e-6), (HH / 2 - 40) / Math.abs(Math.sin(a) || 1e-6)), ex = WW / 2 + Math.cos(a) * kk, ey = HH / 2 + Math.sin(a) * kk;
        spr(FRIENDS[cl.id].spr, ex, ey + 8, { sc: 0.5 }); var c2 = KIT.ctx; c2.fillStyle = '#ffe36a'; c2.beginPath(); c2.moveTo(ex + Math.cos(a) * 16, ey + Math.sin(a) * 16); c2.lineTo(ex + Math.cos(a + 2.5) * 8, ey + Math.sin(a + 2.5) * 8); c2.lineTo(ex + Math.cos(a - 2.5) * 8, ey + Math.sin(a - 2.5) * 8); c2.fill(); } }
  }
  /* ---------- the far skyline (not in the fog) ---------- */
  function far3(cx, cy, e) { (e.far || []).forEach(function (f) { var a = f[1] + 0.0, d = 1500, x = cx + Math.sin(a) * d, z = cy - Math.cos(a) * d, m = f[0]; if (!B3.MODELS[m]) return; var sk = e.look.sky;
      B3.add(m, x, -40, z, a + Math.PI, { sc: f[2] || 1, unlit: 2, tint: [Math.min(1, sk[0] * 1.9 + 0.03), Math.min(1, sk[1] * 1.6 + 0.02), Math.min(1, sk[2] * 1.6 + 0.03)], a: 1 }); }); }
  /* ---------- a frame ---------- */
  var RES = { auto: 1 };
  var RES3 = ['auto', 'low', 'med', 'high', 'vhigh', 'native'], RES3N = { auto: 'AUTO', low: 'LOW (240p)', med: 'MEDIUM (360p)', high: 'HIGH (540p)', vhigh: 'VERY HIGH (720p)', native: 'NATIVE' };
  function res3() { var r = SV && SV.opt && SV.opt.res3; return RES3N[r] ? r : 'auto'; }
  function glSize() { var r = res3(), s = KIT.S || 2, rc = B3.canvas.getBoundingClientRect(), dev = Math.round((rc.height || KIT.H * s) * (window.devicePixelRatio || 1)), lines;
    if (r === 'low') lines = 240; else if (r === 'med') lines = 360; else if (r === 'high') lines = 540; else if (r === 'vhigh') lines = 720; else if (r === 'native') lines = Math.min(1440, dev); else lines = Math.min(540, Math.round(KIT.H * (s >= 3 ? 1.5 : s >= 2 ? 1.1 : 0.8)));
    lines = Math.max(160, lines); B3.size(Math.round(lines * KIT.W / KIT.H), lines); }
  function resItem3(back) { return { label: '3D RESOLUTION: ' + RES3N[res3()], fn: function () { SV.opt.res3 = RES3[(RES3.indexOf(res3()) + 1) % RES3.length]; persist(); if (back) back(); } }; }
  function clear2D() { var c = KIT.ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); }
  function play3() { var dt = Math.min(0.05, KIT.dt || 1 / 60); camInput(dt); var LL = looks(), e = LL.e, L = LL.L, g = run.st.ground;
    var tx = P.x, ty = P.y, tg = P.z3 === undefined ? hgt(tx, ty) : Math.min(P.z3, hgt(tx, ty) + 30); CAMR.th = CAMR.th === undefined ? tg : CAMR.th + (tg - CAMR.th) * 0.15; var th = CAMR.th; CAMR.tx += (tx - CAMR.tx) * 0.25; CAMR.ty += (ty - CAMR.ty) * 0.25; if (Math.abs(CAMR.tx - tx) > 200) { CAMR.tx = tx; CAMR.ty = ty; }
    var y = CAMR.yaw, d = CAMR.dist, fx0 = Math.sin(y), fz0 = -Math.cos(y), eye = [CAMR.tx - fx0 * d * Math.cos(CAMR.pitch), th + 20 + d * Math.sin(CAMR.pitch), CAMR.ty - fz0 * d * Math.cos(CAMR.pitch)], at = [CAMR.tx + fx0 * 40, th + 18, CAMR.ty + fz0 * 40];
    var eh = hgt(eye[0], eye[2]) + 16; if (eye[1] < eh) eye[1] = eh; CAMR.eye = eye;
    if (run.st.band && run.st.band.y) { var lim = run.st.band.y - 10; if (eye[2] > lim) eye[2] = lim; if (eye[2] < -lim) eye[2] = -lim; } if (run.st.band && run.st.band.x) { var lx = run.st.band.x - 10; if (eye[0] > lx) eye[0] = lx; if (eye[0] < -lx) eye[0] = -lx; }
    var look = { sky: L.sky, fog: L.fog, sun: L.sun, sunCol: L.sunCol, amb: G.freeze > 0 ? [L.amb[0] * 0.8, L.amb[1] * 0.95, L.amb[2] * 1.25] : L.amb, rim: 0.7 };
    var R2 = 560, cx = CAMR.tx + fx0 * 200, cy = CAMR.ty + fz0 * 200;
    far3(cx, cy, e); drawWorldThings3(cx, cy, R2); drawFloorThings3();
    for (var i = 0; i < foes.length; i++) { var f = foes[i]; if (f.dead) continue; if (Math.abs(f.x - cx) > R2 + 80 || Math.abs(f.y - cy) > R2 + 80) continue; drawFoe3(f); }
    drawPlayer3(); drawPets3(); drawWeapons3(); drawShots3(); drawFx3();
    glSize(); B3.frame({ eye: eye, at: at, fov: 0.98, look: look, hill: [e.hill || 0, 1, 0.7, 1.3], ground: { canvas: groundTex(g), key: g, bright: e.bright || 1.7 } });
    clear2D();
    if (G.freeze > 0) R('rgba(154,223,255,0.10)', 0, 0, KIT.W, KIT.H); if (run.endless) R('rgba(196,18,28,0.07)', 0, 0, KIT.W, KIT.H);
    drawVignette(); hud3(); }
  /* the title: the character you last picked holds out on the castle floor while foes close in, the camera going round */
  var TFO = ['f_bat', 'crawler', 'f_rat', 'c_zombie2', 'c_pieclown', 'skeleton', 'blumling', 'f_imp', 'f_blob', 'wraith'];
  function title3() { B3.plats([]); var e = ENV.castle, L = e.look, t = KIT.t, who = (SV && SV.lastCh && CH3[SV.lastCh]) ? CH3[SV.lastCh] : 'c_spermaid', a0 = t * 0.12;
    var ps = scaleFor(who, 48); B3.add(who, 0, -B3.MODELS[who].bot * ps * UNIT, 0, Math.sin(t * 0.5) * 0.6, { sc: ps, ph: t * 1.5, am: 0.12 });
    for (var i = 0; i < 4; i++) { var a = t * 2.6 + i * 1.57; B3.add('fx_ball', Math.cos(a) * 46, 26 + Math.sin(a * 1.3) * 8, Math.sin(a) * 46, 0, { sc: 7, unlit: 1, tint: [0.6, 0.87, 1], a: 0.3 }); }
    TT.foes.forEach(function (f) { var m = TFO[['bat', 'crawler', 'rat', 'ghoul', 'clown', 'skeleton', 'blumling', 'imp', 'creamblob', 'wraith'].indexOf(f.k)] || 'f_rat', x = Math.cos(f.a) * f.d * 0.9, z = Math.sin(f.a) * f.d * 0.9, s = scaleFor(m, 30);
      B3.add(m, x, -B3.MODELS[m].bot * s * UNIT + (m === 'f_bat' || m === 'f_imp' ? 14 : 0), z, Math.atan2(-x, -z), { sc: s, ph: f.t * 9, am: 1, a: Math.min(1, (f.d - 60) / 40) }); });
    for (var k = -3; k <= 3; k++) { B3.add('dc_pillar', -150, 0, k * 120, 0, {}); B3.add('dc_pillar', 150, 0, k * 120, 0, {}); }
    B3.add('fx_box', 0, 0.3, 0, 0, { sx: 120, sy: 0.6, len: 900, tint: [0.2, 0.02, 0.03] });
    far3(0, 0, e);
    var d = 150, eye = [Math.sin(a0) * d, 70, Math.cos(a0) * d];
    glSize(); B3.frame({ eye: eye, at: [0, 24, 0], fov: 0.9, look: { sky: L.sky, fog: [260, 700], sun: L.sun, sunCol: L.sunCol, amb: L.amb, rim: 0.7 }, hill: [0, 0, 0, 0], ground: { canvas: groundTex('castle'), key: 'castle', bright: e.bright } });
    clear2D(); drawVignette(); R('rgba(7,4,5,0.25)', 0, 0, KIT.W, KIT.H); }
  var draw2 = draw;
  draw = function () { H = KIT.H; if (!B3.ok) { draw2(); return; } if (!B3.ready()) { KIT.ctx.fillStyle = '#000'; KIT.ctx.fillRect(0, 0, KIT.W, KIT.H); return; }
    if (G.mode === 'title' || !run) { title3(); return; } play3(); };
  /* ---------- the character select shows the 3D models ---------- */
  var PORT = {};
  B3.whenReady(function () { var LK = { sky: B3.hex('#140809'), fog: [3000, 4000], sun: ENV.castle.look.sun, sunCol: [0.6, 0.55, 0.5], amb: [0.5, 0.45, 0.5], rim: 0.8 };
    Object.keys(CH3).forEach(function (k) { try { PORT[k] = B3.portrait(CH3[k], { w: 96, h: 112, look: LK }); } catch (e) {} }); });
  var cp = charPic; charPic = function (c) { return PORT[c.id] ? 'p3_' + c.id : cp(c); };
  var iu = iconURL; iconURL = function (n, sc) { if (n.indexOf('p3_') === 0) return PORT[n.slice(3)] || ''; return iu(n, sc); };
  /* ---------- the logo, in the app's gothic lettering ---------- */
  var LOGO = null;
  function bonkLogo() { if (LOGO) return LOGO; var c = document.createElement('canvas'); c.width = 720; c.height = 210; var g = c.getContext('2d'), f = '"Pirata One", "UnifrakturCook", serif';
    g.font = '150px ' + f; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#12040a'; g.strokeText('Spermabonk', 360, 100);
    var gr = g.createLinearGradient(0, 30, 0, 170); gr.addColorStop(0, '#ff4a50'); gr.addColorStop(0.55, '#c4121c'); gr.addColorStop(1, '#6a0a10'); g.fillStyle = gr; g.fillText('Spermabonk', 360, 100);
    g.fillStyle = '#f1e0b0'; for (var i = 0; i < 6; i++) { var x = 120 + i * 92 + (i % 2) * 20, y = 140 + (i % 3) * 6; g.beginPath(); g.ellipse(x, y + 18, 5, 9, 0, 0, 6.283); g.fill(); g.fillRect(x - 2, y - 4, 4, 18); }
    g.font = '34px "Press Start 2P", monospace'; g.fillStyle = '#f1e7d0'; g.textAlign = 'right'; g.strokeStyle = '#12040a'; g.lineWidth = 8; g.strokeText('3D', 690, 186); g.fillText('3D', 690, 186);
    LOGO = c.toDataURL(); return LOGO; }
  if (document.fonts && document.fonts.load) document.fonts.load('150px "Pirata One"').then(function () { var had = LOGO; LOGO = null; if (had && G.mode === 'title' && KIT.menuOpen && KIT.menuOpen()) try { titleMenu(); } catch (e) {} }).catch(function () {});
  return { CAM: CAMR, resItem: resItem3, logo: bonkLogo, FOE3: FOE3, BOSS3: BOSS3, scaleFor: scaleFor };
})();
function bonkLogo() { return BONK.logo(); }
