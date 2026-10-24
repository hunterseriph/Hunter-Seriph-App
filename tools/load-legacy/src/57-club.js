/* =====================================================================================================
   CUMHEAD'S CLUBHOUSE, inside. Walk in off the street. Stations, left to right:
   the Level Desk (stats), the Wardrobe (wear found gear, runes on/off), the Trophy Wall (records),
   the Jukebox (play any song from the game), the Training Dummy (what each heir hits like right now),
   the Legacy Book (every heir so far) and the Endless Door down to the cellar.
   ===================================================================================================== */
var CLUBST = [
  { id: 'desk', x: 9, name: 'THE LEVEL DESK' }, { id: 'wardrobe', x: 14, name: 'THE WARDROBE' }, { id: 'trophy', x: 19, name: 'THE TROPHY WALL' },
  { id: 'jukebox', x: 24, name: 'THE JUKEBOX' }, { id: 'dummy', x: 29, name: 'TRAINING DUMMY' }, { id: 'book', x: 34, name: 'THE LEGACY BOOK' }, { id: 'endless', x: 39, name: 'THE ENDLESS DOOR' }
];
function buildClub() {
  var W = 44, H = CH, tl = new Uint8Array(W * H);
  for (var x = 0; x < W; x++) { tl[(H - 1) * W + x] = TW; tl[x] = TW; }
  for (var y = 0; y < H; y++) { tl[y * W] = TW; tl[y * W + W - 1] = TW; }
  var ents = [{ k: 'exit', x: 3 * T + 8, y: 15 * T, name: 'BACK TO THE STREET' }];
  CLUBST.forEach(function (s) { ents.push({ k: 'st', id: s.id, x: s.x * T + 8, y: 15 * T, name: s.name, sh: 0 }); });
  return { w: W, h: H, tiles: tl, ents: ents, town: true, inside: true, gateX: 0 };
}
function enterClub() {
  G.streetX = P.x; TOWN = L = buildClub(); G.layer = null; G.near = null; P.x = 6 * T; P.y = 15 * T; P.vx = 0; P.face = 1; camSnapTown(); sfx.door(); G.fade = 0.3;
  G.banner = 2; G.bannerTxt = "Cumhead's Clubhouse"; G.bannerSub = 'MAKE YOURSELF AT HOME';
}
function leaveClub() { if (G.juke) { G.juke = null; music.play('town'); } TOWN = L = buildTown(); G.layer = null; G.near = null; P.x = G.streetX || TOWN.gateX - 70; P.y = 15 * T; P.vx = 0; camSnapTown(); sfx.door(); G.fade = 0.3; }
function clubStation(e) {
  e.sh = 0.4;
  if (e.id === 'desk') openMenu({ title: 'The Level Desk', note: '', pic: 'cumhead', rebuild: clubRows });
  else if (e.id === 'wardrobe') openMenu({ title: 'The Wardrobe', note: 'Wear what you have had made. Runes: three at a time.', pic: null, rebuild: wardrobeRows });
  else if (e.id === 'trophy') openTrophies();
  else if (e.id === 'jukebox') openJukebox();
  else if (e.id === 'dummy') openDummy();
  else if (e.id === 'book') openLegacy(function () { closeMenu(); });
  else if (e.id === 'endless') openEndlessMenu();
}
function wardrobeRows() {
  var rows = [];
  ['weapon', 'armour', 'helm'].forEach(function (slot) {
    rows.push({ name: GEARNAME[slot].toUpperCase(), cls: 'head' });
    GEAR[slot].forEach(function (g, i) { if (i > META.gearOwn[slot]) return; var on = META.gear[slot] === i; rows.push({ icon: g.icon, name: g.name.toUpperCase(), sub: gearDesc(slot, g), price: on ? 'WEARING' : 'WEAR', cls: on ? 'own' : '', fn: function () { META.gear[slot] = i; saveMeta(); sfx.click(); renderMenu(true); } }); });
  });
  rows.push({ name: 'RUNES ON ' + META.runeOn.length + '/3', cls: 'head' });
  var any = false;
  RUNES.forEach(function (r) { if (!META.runes[r.id]) return; any = true; var on = runeOn(r.id); rows.push({ icon: r.icon, name: r.name.toUpperCase(), sub: r.d, price: on ? 'ON' : 'OFF', cls: on ? 'own' : '', fn: function () { if (runeOn(r.id)) META.runeOn.splice(META.runeOn.indexOf(r.id), 1); else { if (META.runeOn.length >= 3) { sfx.no(); toastMenu('THREE RUNES AT A TIME. TURN ONE OFF FIRST.'); return; } META.runeOn.push(r.id); } saveMeta(); sfx.click(); renderMenu(true); } }); });
  if (!any) rows.push({ name: 'NO RUNES YET', sub: 'Find them in the castle, then have Spermaid bind them', cls: 'off' });
  return rows;
}
function openTrophies() {
  var best = META.lb.length ? META.lb[0] : null, nb = 0; ['weapon', 'armour', 'helm'].forEach(function (s) { nb += META.found[s]; }); var nr = Object.keys(META.found.runes).length;
  var rows = [
    { icon: 'f_blum_0', name: 'BLUMHEAD BEATEN ' + META.blumWins + 'x', sub: META.seenSuper || META.superWins ? 'Super Blumhead beaten ' + META.superWins + 'x' : 'Something stirs after the fifth time...' },
    { icon: 'holy', name: 'NEW GAME+ ' + META.ng, sub: 'Seals broken this time round: ' + sealCount() + '/4' },
    { icon: 'f_moon_0', name: 'THE CRIMSON MOON ' + (META.moonWins || 0) + 'x', sub: META.seenMoon ? 'The portal is always in a hidden alcove' : 'There is a secret somewhere in the castle' },
    { icon: 'scrollWarp', name: 'ENDLESS BEST: ' + (best ? 'SCREEN ' + best.screen : 'NONE YET'), sub: best ? best.name + ' as ' + best.heir : 'Through the Endless Door at the end of the room' },
    { icon: 'scrollMend', name: 'BLUEPRINTS FOUND ' + nb + '  ·  RUNES FOUND ' + nr + '/' + RUNES.length, sub: 'Big chests, secret rooms and bosses hold them' },
    { icon: 'coin', name: 'HEIRS SENT IN ' + META.runs, sub: 'Drops earned in total: ' + fmtN(META.totalDrops || 0) },
    { icon: 'cleaver', name: 'HEIR LEVEL ' + heirLevel(), sub: UPGRADES.map(function (u) { return u.name + ' ' + (META.up[u.id] || 0); }).join('  ·  ') }
  ];
  openMenu({ title: 'The Trophy Wall', note: '', pic: null, bank: 'none', rows: rows });
}
var JUKE = [['title', 'Load Legacy'], ['town', 'Clubhouse Row'], ['castle', "Cumhead's Castle"], ['roof', 'Above the Red Moon'], ['park', 'Ejaculand Waltz'], ['dungeon', 'Chains in the Dark'], ['boss', 'Boss Fight'], ['blum', 'Blumhead'], ['super', 'Super Blumhead'], ['pulsar1', "Pulsar's Track One"], ['pulsar2', "Pulsar's Track Two"], ['pulsar3', "Pulsar's Track Three"]];
function openJukebox() {
  openMenu({ title: 'The Jukebox', note: 'Every song in the game. It plays until you leave the Clubhouse.', pic: null, bank: 'none', rebuild: function () {
    return JUKE.map(function (j) { var on = G.juke === j[0]; return { icon: 'sage', name: j[1].toUpperCase(), price: on ? 'PLAYING' : 'PLAY', cls: on ? 'own' : '', fn: function () { G.juke = j[0]; music.play(j[0]); renderMenu(true); } }; }).concat([{ icon: 'curse', name: 'STOP', price: '', fn: function () { G.juke = null; music.play('town'); renderMenu(true); } }]);
  } });
}
function heirNumbers(cls) { // what calcStats gives this heir right now, without starting a run
  var keepR = RUN; RUN = { cls: cls, powers: [], card: null, provEff: {}, hom: cls === 'homunculus' ? { b: 'gloop', st: 1, g: 0 } : undefined };
  var s = calcStats(); RUN = keepR; return s;
}
function openDummy() {
  var rows = CLASSORDER.map(function (cls) { var s = heirNumbers(cls), c = CLASSES[cls]; return { icon: cls === 'cumhead' ? 'cumface' : cls === 'homunculus' ? 'h_gloop_teen_idle0' : cls + '_d', name: c.name.toUpperCase() + '  ·  HITS FOR ' + Math.round(s.dmg), sub: 'HP ' + s.mhp + '  ·  MANA ' + s.mmana + '  ·  ' + Math.round(s.arm * 100) + '% blocked  ·  speed x' + s.spd.toFixed(2) + '  ·  ' + Math.round(s.crit * 100) + '% crits' }; });
  openMenu({ title: 'Training Dummy', note: 'It has seen things. This is what each heir hits like with your levels and gear right now.', pic: null, bank: 'none', rows: rows });
}

/* ---------- drawing the inside ---------- */
function clubBack() {
  ctx.fillStyle = '#170508'; ctx.fillRect(0, 0, VW, VH);
  var cx = G.cam.x, x0 = -(cx % 24);
  for (var x = x0; x < VW; x += 24) { R(ctx, '#1e070b', Math.round(x), 0, 12, VH); for (var y = 14; y < 190; y += 26) R(ctx, '#2a0a10', Math.round(x) + 4, y + ((x / 24) % 2) * 13, 4, 4); }
}
function drawClubInside(cx) {
  var gy = 15 * T, W = TOWN.w * T;
  // wainscot and picture rail
  R(ctx, '#12040a', -cx, gy - 52, W, 52); R(ctx, '#2a1208', -cx, gy - 50, W, 48); for (var px = 8; px < W; px += 40) { R(ctx, '#3a1a0c', px - cx, gy - 46, 32, 40); R(ctx, '#1e0c06', px - cx + 2, gy - 44, 28, 36); } R(ctx, '#5a2a10', -cx, gy - 52, W, 3);
  R(ctx, '#5a2a10', -cx, 52, W, 2);
  // windows with the red moon
  [6, 22, 37].forEach(function (wx, i) { var x = Math.round(wx * T - cx); R(ctx, '#12040a', x - 26, 64, 52, 70); R(ctx, '#2a050a', x - 24, 66, 48, 66); if (i === 1) moon(x + 6, 92, 14); R(ctx, '#12040a', x - 1, 66, 2, 66); R(ctx, '#12040a', x - 24, 98, 48, 2); R(ctx, '#3a1a0c', x - 28, 134, 56, 4); });
  // portraits of the heirs on the wall
  [['cumhead', 11.5], ['spermaid', 16.5], ['greebo', 26.5], ['homunculus', 31.5]].forEach(function (p) { var x = Math.round(p[1] * T - cx); R(ctx, '#12040a', x - 18, 70, 36, 46); R(ctx, '#c8903a', x - 17, 71, 34, 44); R(ctx, '#1c0b11', x - 14, 74, 28, 38); ctx.save(); ctx.beginPath(); ctx.rect(x - 14, 74, 28, 38); ctx.clip();
    if (p[0] === 'cumhead') cspr('idle0', x, 120, false); else if (p[0] === 'homunculus') spr('h_gloop_teen_idle0', x, 113, false, 1); else spr(p[0] + '_s0', x, 113, false, p[0] === 'greebo' ? 0.52 : 0.58); ctx.restore(); });
  // a big Cumhead banner over the middle
  var bx = Math.round(21.5 * T - cx); R(ctx, '#12040a', bx - 24, 18, 48, 4); R(ctx, '#8e0c14', bx - 22, 22, 44, 30); ctx.fillStyle = '#8e0c14'; ctx.beginPath(); ctx.moveTo(bx - 22, 52); ctx.lineTo(bx, 60); ctx.lineTo(bx + 22, 52); ctx.fill(); ctx.drawImage(dropImg, bx - 4, 34, 9, 11);
  // hanging lamps
  [9, 19, 29, 39].forEach(function (lx) { var x = Math.round(lx * T - cx); R(ctx, '#12040a', x - 1, 16, 2, 22); R(ctx, '#12040a', x - 6, 38, 12, 8); R(ctx, '#ffb040', x - 4, 40, 8, 5); ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = '#ffb040'; ctx.beginPath(); ctx.moveTo(x - 5, 44); ctx.lineTo(x - 40, gy); ctx.lineTo(x + 40, gy); ctx.lineTo(x + 5, 44); ctx.fill(); ctx.restore(); });
  TOWN.ents.forEach(function (e) {
    var x = Math.round(e.x - cx); if (x < -60 || x > VW + 60) return; if (e.sh > 0) { e.sh -= 1 / 60; x += Math.round((Math.random() - 0.5) * 3); }
    if (e.k === 'exit') { R(ctx, '#12040a', x - 18, gy - 58, 36, 58); R(ctx, '#3a1a0c', x - 16, gy - 56, 32, 56); R(ctx, '#2a1208', x - 13, gy - 52, 11, 22); R(ctx, '#2a1208', x + 2, gy - 52, 11, 22); R(ctx, '#2a1208', x - 13, gy - 26, 11, 22); R(ctx, '#2a1208', x + 2, gy - 26, 11, 22); R(ctx, '#ffe36a', x + 10, gy - 30, 3, 3); return; }
    var id = e.id;
    if (id === 'desk') { R(ctx, '#12040a', x - 26, gy - 26, 52, 26); R(ctx, '#5a2a10', x - 25, gy - 25, 50, 6); R(ctx, '#3a1a0c', x - 25, gy - 19, 50, 19); R(ctx, '#f1e7d0', x - 16, gy - 30, 14, 4); R(ctx, '#12040a', x + 6, gy - 34, 6, 8); R(ctx, '#c4121c', x + 7, gy - 33, 4, 6); R(ctx, '#ffe36a', x - 4, gy - 36, 2, 6); text('LEVEL ' + heirLevel(), x, gy - 44, 'center', '#ffe36a', 6); }
    else if (id === 'wardrobe') { R(ctx, '#12040a', x - 20, gy - 70, 40, 70); R(ctx, '#3a1a0c', x - 19, gy - 69, 38, 69); R(ctx, '#2a1208', x - 17, gy - 66, 16, 62); R(ctx, '#2a1208', x + 1, gy - 66, 16, 62); R(ctx, '#c8903a', x - 3, gy - 36, 2, 4); R(ctx, '#c8903a', x + 2, gy - 36, 2, 4); R(ctx, '#5a2a10', x - 22, gy - 72, 44, 4); }
    else if (id === 'trophy') { R(ctx, '#12040a', x - 28, gy - 88, 56, 40); R(ctx, '#3a1a0c', x - 27, gy - 87, 54, 38); for (var t = 0; t < Math.min(6, META.blumWins + (META.moonWins || 0) + sealCount()); t++) { var tx = x - 22 + (t % 3) * 17, ty = gy - 84 + Math.floor(t / 3) * 18; R(ctx, '#ffc840', tx + 2, ty + 2, 8, 7); R(ctx, '#a8741a', tx + 4, ty + 9, 4, 3); R(ctx, '#ffc840', tx + 2, ty + 12, 8, 2); } R(ctx, '#12040a', x - 12, gy - 30, 24, 30); R(ctx, '#2a1208', x - 11, gy - 29, 22, 29); spr('f_blum_0', x, gy - 32, false, 0.35); }
    else if (id === 'jukebox') { R(ctx, '#12040a', x - 16, gy - 54, 32, 54); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x, gy - 50, 16, Math.PI, 0); ctx.fill(); R(ctx, '#8e0c14', x - 14, gy - 50, 28, 48); ctx.fillStyle = '#8e0c14'; ctx.beginPath(); ctx.arc(x, gy - 50, 14, Math.PI, 0); ctx.fill(); var on = Math.floor(G.t * 4) % 2; R(ctx, on ? '#ffe36a' : '#ff2630', x - 10, gy - 52, 20, 3); R(ctx, '#1c0b11', x - 9, gy - 44, 18, 16); for (var k = 0; k < 4; k++) R(ctx, '#f1e7d0', x - 7, gy - 42 + k * 4, 14, 1); R(ctx, '#c8903a', x - 9, gy - 22, 18, 12); if (G.juke) text('♪', x + 14 + Math.sin(G.t * 3) * 3, gy - 60 - (G.t * 10) % 12, 'center', '#ff9ad0', 7); }
    else if (id === 'dummy') { var wob = e.sh > 0 ? Math.sin(G.t * 40) * 0.2 : 0; ctx.save(); ctx.translate(x, gy); ctx.rotate(wob); R(ctx, '#12040a', -2, -40, 4, 40); R(ctx, '#12040a', -12, -6, 24, 6); R(ctx, '#12040a', -11, -46, 22, 26); R(ctx, '#c8a060', -10, -45, 20, 24); R(ctx, '#12040a', -16, -40, 32, 5); R(ctx, '#c8a060', -15, -39, 30, 3); R(ctx, '#12040a', -7, -58, 14, 13); R(ctx, '#c8a060', -6, -57, 12, 11); R(ctx, '#c4121c', -4, -53, 2, 2); R(ctx, '#c4121c', 2, -53, 2, 2); R(ctx, '#c4121c', -3, -40, 6, 6); ctx.restore(); }
    else if (id === 'book') { R(ctx, '#12040a', x - 12, gy - 34, 24, 34); R(ctx, '#3a1a0c', x - 11, gy - 33, 22, 33); R(ctx, '#12040a', x - 16, gy - 42, 32, 9); R(ctx, '#f1e7d0', x - 15, gy - 41, 14, 7); R(ctx, '#e8dcc0', x + 1, gy - 41, 14, 7); for (var l = 0; l < 3; l++) { R(ctx, '#a6968f', x - 13, gy - 39 + l * 2, 9, 1); R(ctx, '#a6968f', x + 3, gy - 39 + l * 2, 9, 1); } R(ctx, '#c4121c', x - 1, gy - 41, 2, 10); }
    else if (id === 'endless') { // a stair down into red light
      R(ctx, '#12040a', x - 22, gy - 64, 44, 64); ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.arc(x, gy - 64, 22, Math.PI, 0); ctx.fill();
      var gl = 0.6 + Math.sin(G.t * 3) * 0.2; ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 16; ctx.fillStyle = 'rgba(196,18,28,' + gl.toFixed(2) + ')'; ctx.fillRect(x - 18, gy - 64, 36, 64); ctx.beginPath(); ctx.arc(x, gy - 64, 18, Math.PI, 0); ctx.fill(); ctx.restore();
      for (var st = 0; st < 5; st++) R(ctx, '#12040a', x - 18 + st * 4, gy - 10 + st * 2 - 10, 36 - st * 8, 3);
      text('ENDLESS', x, gy - 92, 'center', '#ff2630', 6); var b = META.lb[0]; if (b) text('BEST ' + b.screen, x, gy - 82, 'center', '#ffe36a', 5);
    }
  });
}

/* ---------- the castle gate at the middle of the street ---------- */
function drawGate(x0g, gy0) { // drawn at full size, scaled to fit the screen height
  ctx.save(); ctx.translate(x0g, gy0); ctx.scale(0.8, 0.8); drawGateBig(0, 0); ctx.restore();
}
function drawGateBig(x, gy) {
  var fl = function (k) { return Math.floor(G.t * 10 + k) % 3; };
  // the moon behind the keep
  moon(x, gy - 214, 34);
  // stone: dark blocks with a lighter bevel
  function stone(x0, y0, w, h) { R(ctx, '#0c0306', x0, y0, w, h); for (var yy = y0 + 2; yy < y0 + h - 2; yy += 10) for (var xx = x0 + 2 + (((yy - y0) / 10) % 2) * 8; xx < x0 + w - 4; xx += 16) { var bw = Math.min(14, x0 + w - 2 - xx); R(ctx, '#1e080c', xx, yy, bw, 8); R(ctx, '#2c0c12', xx, yy, bw, 1); } }
  // two round towers with pointed roofs and banners
  [-1, 1].forEach(function (s) {
    var tx = x + s * 104; stone(tx - 26, gy - 196, 52, 196);
    for (var b = 0; b < 4; b++) R(ctx, '#0c0306', tx - 26 + b * 15, gy - 206, 9, 10);
    ctx.fillStyle = '#0c0306'; ctx.beginPath(); ctx.moveTo(tx - 32, gy - 204); ctx.lineTo(tx, gy - 262); ctx.lineTo(tx + 32, gy - 204); ctx.fill();
    ctx.fillStyle = '#3a0a10'; ctx.beginPath(); ctx.moveTo(tx - 26, gy - 206); ctx.lineTo(tx, gy - 256); ctx.lineTo(tx - 6, gy - 206); ctx.fill();
    R(ctx, '#12040a', tx - 1, gy - 278, 2, 18); var wv = Math.sin(G.t * 3 + s) * 2; ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.moveTo(tx + 1, gy - 278); ctx.lineTo(tx + 1 + s * (18 + wv), gy - 273); ctx.lineTo(tx + 1, gy - 268); ctx.fill();
    R(ctx, '#12040a', tx - 7, gy - 160, 14, 24); R(ctx, '#ff2630', tx - 5, gy - 158, 10, 20); R(ctx, '#12040a', tx - 1, gy - 158, 2, 20); // a lit window
    R(ctx, '#12040a', tx - 22, gy - 120, 44, 50); R(ctx, '#8e0c14', tx - 20, gy - 118, 40, 42); ctx.fillStyle = '#8e0c14'; ctx.beginPath(); ctx.moveTo(tx - 20, gy - 76); ctx.lineTo(tx, gy - 64); ctx.lineTo(tx + 20, gy - 76); ctx.fill(); ctx.drawImage(dropImg, tx - 6, gy - 104, 12, 15); // banner with a drop
    // gargoyle on the tower edge
    var gxp = tx + s * 22; ctx.fillStyle = '#0c0306'; ctx.beginPath(); ctx.moveTo(gxp - 8, gy - 196); ctx.lineTo(gxp + s * 14, gy - 200); ctx.lineTo(gxp + s * 10, gy - 212); ctx.lineTo(gxp + s * 2, gy - 206); ctx.lineTo(gxp - 4, gy - 214); ctx.lineTo(gxp - 6, gy - 200); ctx.fill(); R(ctx, '#ff2630', gxp + s * 8 - 1, gy - 206, 2, 2);
  });
  // the keep between them, with battlements
  stone(x - 78, gy - 180, 156, 180);
  for (var i = 0; i < 8; i++) R(ctx, '#0c0306', x - 78 + i * 20, gy - 192, 12, 12);
  // skulls over the arch
  [-30, 0, 30].forEach(function (o) { var sx = x + o, sy = gy - 152; R(ctx, '#12040a', sx - 6, sy - 6, 12, 12); R(ctx, '#e8dcc0', sx - 5, sy - 5, 10, 8); R(ctx, '#e8dcc0', sx - 3, sy + 3, 6, 2); R(ctx, '#12040a', sx - 3, sy - 2, 2, 3); R(ctx, '#12040a', sx + 1, sy - 2, 2, 3); });
  // the great arch: red glow inside, a portcullis half up
  ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.moveTo(x - 48, gy); ctx.lineTo(x - 48, gy - 90); ctx.arc(x, gy - 90, 48, Math.PI, 0); ctx.lineTo(x + 48, gy); ctx.fill();
  var gl = 0.55 + Math.sin(G.t * 2.4) * 0.12; ctx.save(); ctx.fillStyle = 'rgba(160,10,20,' + gl.toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(x - 42, gy); ctx.lineTo(x - 42, gy - 90); ctx.arc(x, gy - 90, 42, Math.PI, 0); ctx.lineTo(x + 42, gy); ctx.fill(); ctx.restore();
  var lift = 34 + Math.sin(G.t * 0.8) * 2;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - 42, gy); ctx.lineTo(x - 42, gy - 90); ctx.arc(x, gy - 90, 42, Math.PI, 0); ctx.lineTo(x + 42, gy); ctx.clip();
  for (var b2 = -36; b2 <= 36; b2 += 9) R(ctx, '#12040a', x + b2 - 1, gy - 140, 3, 140 - lift); for (var h = gy - 136; h < gy - lift; h += 14) R(ctx, '#12040a', x - 42, h, 84, 2);
  for (var sp = -36; sp <= 36; sp += 9) { R(ctx, '#12040a', x + sp - 1, gy - lift, 3, 5); R(ctx, '#3a2a2a', x + sp, gy - lift, 1, 4); }
  ctx.restore();
  // steps
  for (var stp = 0; stp < 3; stp++) { R(ctx, '#12040a', x - 60 + stp * 6, gy - 4 - stp * 4, 120 - stp * 12, 5); R(ctx, '#2c0c12', x - 59 + stp * 6, gy - 4 - stp * 4, 118 - stp * 12, 1); }
  // torches either side of the arch
  [-62, 62].forEach(function (o, k) { var tx = x + o, ty = gy - 104; R(ctx, '#12040a', tx - 3, ty, 6, 14); R(ctx, '#3a2a2a', tx - 2, ty + 1, 4, 12); R(ctx, '#12040a', tx - 5, ty - 3, 10, 4); var f = fl(k * 2); ctx.save(); ctx.shadowColor = '#ff7a30'; ctx.shadowBlur = 16; R(ctx, '#ff5a20', tx - 4, ty - 12 - f, 8, 10 + f); R(ctx, '#ffb040', tx - 2, ty - 9 - f, 4, 7 + f); R(ctx, '#fff09a', tx - 1, ty - 5, 2, 3); ctx.restore(); if (Math.random() < 0.15) parts.push({ x: G.gateX0 + tx * 0.8 + (Math.random() - 0.5) * 4, y: 15 * T + (ty - 14) * 0.8, vx: (Math.random() - 0.5) * 10, vy: -30, life: 0.5, c: '#ffb040', spark: 0 }); });
  // the name over the door
  R(ctx, '#12040a', x - 58, gy - 182, 116, 20); R(ctx, '#2a050a', x - 56, gy - 180, 112, 16);
  ctx.save(); ctx.font = '15px "Pirata One", serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff2630'; ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 8; ctx.fillText("Cumhead's Castle", x, gy - 167, 108); ctx.restore();
}
