var R = KIT.R;
/* =====================================================================================================
   GOONING CAVE KEEPER in 3D (update 132, his playtest: it needs to be 3D, zoom in and out, turn the camera, bigger blocks,
   more like Dungeon Keeper). Same cave simulation as before (tiles, jobs, rooms, waves), drawn as a real 3D dungeon on
   Psycho Nightmare's engine: rock blocks a full storey tall (gold seams glint, hard rock is black, marked rock glows
   yellow), dug earth, your claimed floor in red tiles with the Cumhead drop, walls next to your floor turn to brick with
   torches and banners, rooms furnished (beds in the Lair, pie nests in the Hatchery, gold piles in the Treasury,
   dummies in the Training Pit, shelves in the Library), the Dungeon Heart beats on its plinth, the portal swirls.
   Homunculi are 3D in their breed colours, TB's boys come through the portal to work for you, and Ejaculand's lot raid you
   through the hero gate (Sir Johnathan at the end). Camera: turn with the right stick / Q E / the turn buttons, zoom
   with the right stick / Z C / the mouse wheel / + and -; the hand moves the way the camera faces; tap the screen to
   put the hand there.
   ===================================================================================================== */
CREATURES = {
  gimp: { rig: 'gimp', hp: 80, dmg: 9, spd: 32, pay: 30, needs: ['lair', 'hatch'], n: 'Gimp' },
  pusher: { rig: 'pusher', hp: 70, dmg: 11, spd: 30, pay: 40, needs: ['lair', 'hatch', 'train'], n: 'Pill Pusher', range: 1 },
  acrobat: { rig: 'acrobat', hp: 60, dmg: 9, spd: 42, pay: 45, needs: ['lair', 'train'], n: 'Acrobat' },
  lab: { rig: 'laboozie', hp: 80, dmg: 14, spd: 30, pay: 70, needs: ['lair', 'hatch', 'library'], n: 'Shithead Laboozie', range: 1 },
  butcher: { rig: 'butcher', hp: 150, dmg: 16, spd: 34, pay: 110, needs: ['lair', 'library', 'train'], n: 'Butcher', held: 'weapon' },
  strongman: { rig: 'strongman', hp: 260, dmg: 22, spd: 22, pay: 140, needs: ['lair', 'hatch', 'train', 'treasury'], n: 'Strongman' }
};
HEROES = { clown: { rig: 'clown', hp: 120, dmg: 12, spd: 30, n: 'Clown' }, smiles: { rig: 'smiles', hp: 90, dmg: 10, spd: 44, n: 'Smiles Twin' }, bride: { rig: 'bride', hp: 130, dmg: 13, spd: 38, n: 'Gravedigger Bride' },
  sissy: { rig: 'sissifier', hp: 170, dmg: 14, spd: 26, n: 'The Sissifier' }, muckies: { rig: 'muckies', hp: 420, dmg: 22, spd: 26, big: 1, n: 'MAMA MUCKIES' }, sirj: { cat: 1, hp: 1400, dmg: 30, spd: 34, big: 2, n: 'SIR JOHNATHAN' } };
LEVELS[0].heroes = ['clown']; LEVELS[1].heroes = ['clown', 'smiles']; LEVELS[2].heroes = ['clown', 'smiles', 'bride']; LEVELS[2].boss = 'muckies'; LEVELS[3].heroes = ['clown', 'smiles', 'sissy', 'bride']; LEVELS[3].boss = 'muckies'; LEVELS[4].heroes = ['clown', 'smiles', 'sissy', 'bride', 'muckies'];
var TSZ = 2.4, BH = 1.6, CAMK = { yaw: Math.PI, dist: 13, pitch: 0.95, tx: 0, tz: 0 }, WMESH = null, WSIG = '', DYN3 = null, RIGSOK = false;
function wx(px) { return px / KT; }
/* textures */
PAINT.krock = function (p) { p.fill('#3a2a24'); p.speck(['#2a1e1a', '#4a362e', '#5a4438', '#30221c'], 420); for (var k = 0; k < 4; k++) { var x = Math.floor(p.rnd() * 28), y = Math.floor(p.rnd() * 28); p.rect(x, y, 4, 2, '#22180f'); } };
PAINT.krocktop = function (p) { p.fill('#5a4438'); p.speck(['#4a362e', '#6a5244', '#523e32'], 300); p.rect(0, 0, 32, 2, '#7a6050'); p.rect(0, 0, 2, 32, '#7a6050'); p.rect(0, 30, 32, 2, '#2a1e18'); p.rect(30, 0, 2, 32, '#2a1e18'); for (var k = 0; k < 3; k++) p.rect(4 + Math.floor(p.rnd() * 22), 4 + Math.floor(p.rnd() * 22), 3, 2, '#3a2a22'); };
PAINT.kgold = function (p) { PAINT.krock(p); for (var k = 0; k < 9; k++) { var x = Math.floor(p.rnd() * 28), y = Math.floor(p.rnd() * 28); p.rect(x, y, 3, 2, '#ffc840'); p.px(x, y, '#fff09a'); p.px(x + 2, y + 1, '#a8741a'); } };
PAINT.khard = function (p) { p.fill('#141012'); p.speck(['#1e181a', '#0a0808', '#262022'], 300); for (var k = 0; k < 3; k++) { var x = Math.floor(p.rnd() * 30); for (var y = 0; y < 32; y++) if (p.rnd() < 0.7) p.px(x + Math.round(Math.sin(y * 0.5)), y, '#2e2628'); } };
PAINT.kdirt = function (p) { p.fill('#2e221c'); p.speck(['#241a16', '#3a2c24', '#1e1612'], 300); };
PAINT.kclaim = function (p) { p.fill('#2a0a0e'); p.rect(1, 1, 14, 14, '#3a0e14'); p.rect(17, 1, 14, 14, '#3a0e14'); p.rect(1, 17, 14, 14, '#3a0e14'); p.rect(17, 17, 14, 14, '#3a0e14'); p.rect(14, 10, 4, 10, '#6a0a10'); p.rect(15, 7, 2, 3, '#6a0a10'); p.speck(['#4a1018'], 30); };
PAINT.kfort = pBricks('#4a1a1c', '#1a0a0c', 8, 16);
PAINT.klava = function (p) { p.fill('#c4301a'); p.speck(['#ff7a2a', '#ffb030', '#8a1a0a'], 200); };
PAINT.klair = function (p) { p.fill('#3a1a2a'); p.speck(['#4a2234', '#2a1220'], 120); p.rect(0, 0, 32, 1, '#5a2a40'); };
PAINT.khatch = function (p) { p.fill('#4a3418'); p.speck(['#5a4020', '#3a2810', '#6a5028'], 200); };
PAINT.ktreas = function (p) { p.fill('#3a2c08'); for (var k = 0; k < 20; k++) p.rect(Math.floor(p.rnd() * 30), Math.floor(p.rnd() * 30), 2, 2, '#ffc840'); };
PAINT.ktrain = function (p) { p.fill('#3a0e0e'); for (var y = 0; y < 32; y += 8) p.rect(0, y, 32, 1, '#2a0808'); p.speck(['#4a1212'], 80); };
PAINT.klib = function (p) { p.fill('#1a2a4a'); p.rect(2, 2, 28, 28, '#22345a'); p.rect(4, 4, 24, 24, '#1a2a4a'); };
PAINT.kbanner = function (p) { p.fill('#6a0810'); p.rect(0, 0, 32, 3, '#ffe36a'); p.rect(12, 10, 8, 8, '#f1e0b0'); p.rect(14, 7, 4, 3, '#f1e0b0'); p.rect(15, 5, 2, 2, '#f1e0b0'); };
PAINT.kgate = function (p) { p.fill('#d8d0c0'); for (var y = 0; y < 32; y += 8) p.rect(0, y, 32, 1, '#a89e8e'); for (var y2 = 0; y2 < 32; y2 += 8) p.rect((y2 / 8) % 2 ? 8 : 24, y2, 1, 8, '#a89e8e'); };
PAINT.kbooks = function (p) { p.fill('#2a1a10'); for (var y = 0; y < 32; y += 10) { p.rect(0, y + 8, 32, 2, '#5a3a24'); for (var x = 0; x < 32; x += 3) p.rect(x, y, 2, 8, ['#6a0a10', '#1a2a4a', '#2a4a1a', '#5a4a1a', '#3a1a3a'][(x * 7 + y) % 5]); } };
PAINT.kbed = function (p) { p.fill('#5a1a2a'); p.rect(0, 0, 32, 10, '#e8dcc8'); for (var x = 0; x < 32; x += 6) p.rect(x, 12, 3, 20, '#4a1220'); };
/* the world mesh: rebuilt whenever the cave changes */
function caveSig() { var h = 0; for (var q = 0; q < T.length; q++) { h = (h * 31 + T[q] * 7 + MARK[q] * 3 + (ROOMAT[q] ? ROOMAT[q].length : 0)) | 0; } return h + ':' + (PORTAL && PORTAL.claimed); }
function buildCave() {
  var m = M(), rnd = srand(55 + G.lv), D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]; TORCHES = [];
  function solidT(i, j) { if (!inMap(i, j)) return true; var t = T[idx(i, j)]; return t === 0 || t === 1 || t === 2; }
  function hgt(t) { return t === 1 ? BH * 1.15 : BH; }
  for (var j = 0; j < MH; j++) for (var i = 0; i < MW; i++) {
    var t = T[idx(i, j)], x0 = i, z0 = j, x1 = i + 1, z1 = j + 1, k = idx(i, j);
    if (t === 0 || t === 1 || t === 2) { var h = hgt(t), tex = t === 1 ? 'khard' : t === 2 ? 'kgold' : 'krock', top = t === 1 ? 'khard' : 'krocktop', mk = MARK[k];
      m.quad([x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1], [0, 0, 1, 0, 1, 1, 0, 1], TL(top), mk ? [0.8, 0.72, 0.3] : t === 1 ? [0.4, 0.4, 0.4] : [0.5 + ((i * 7 + j * 3) % 5) * 0.015, 0.5, 0.5], [0, 1, 0], mk ? 0.3 : 0.06);
      D4.forEach(function (d) { var ni = i + d[0], nj = j + d[1]; if (solidT(ni, nj)) return; var a, b; if (d[0] > 0) { a = [x1, z1]; b = [x1, z0]; } else if (d[0] < 0) { a = [x0, z0]; b = [x0, z1]; } else if (d[1] > 0) { a = [x0, z1]; b = [x1, z1]; } else { a = [x1, z0]; b = [x0, z0]; }
        var nt = T[idx(ni, nj)], fort = (nt === 4 || nt === 5) && t !== 2 && !mk, T2 = TL(fort ? 'kfort' : tex), c = mk ? [0.8, 0.7, 0.25] : [0.5, 0.5, 0.5];
        m.quad([a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], h, b[1]], [a[0], h, a[1]], [0, h, 1, h, 1, 0, 0, 0], T2, c, [d[0], 0, d[1]], mk ? 0.25 : t === 2 ? 0.05 : 0);
        if (fort && (i * 3 + j * 5) % 7 === 0) { var cx = (a[0] + b[0]) / 2 + d[0] * 0.02, cz = (a[1] + b[1]) / 2 + d[1] * 0.02, sx = -d[1], sz = d[0]; m.quad([cx + sx * 0.22, 0.5, cz + sz * 0.22], [cx - sx * 0.22, 0.5, cz - sz * 0.22], [cx - sx * 0.22, 1.4, cz - sz * 0.22], [cx + sx * 0.22, 1.4, cz + sz * 0.22], [0, 1, 1, 1, 1, 0, 0, 0], TL('kbanner'), [0.5, 0.5, 0.5], [d[0], 0, d[1]]); }
        else if (fort && (i * 5 + j * 3) % 9 === 0) { var tx2 = (a[0] + b[0]) / 2 + d[0] * 0.08, tz2 = (a[1] + b[1]) / 2 + d[1] * 0.08; bxp(m, tx2 - 0.04, 0.9, tz2 - 0.04, tx2 + 0.04, 1.15, tz2 + 0.04, '#3a2a1a'); TORCHES.push({ x: tx2 + d[0] * 0.04, y: 1.22, z: tz2 + d[1] * 0.04 }); } });
      continue; }
    var ft = t === 8 ? 'klava' : t === 4 || t === 5 || t === 6 && PORTAL.claimed ? 'kclaim' : 'kdirt', rm = ROOMAT[k];
    if (rm) ft = { lair: 'klair', hatch: 'khatch', treasury: 'ktreas', train: 'ktrain', library: 'klib' }[rm];
    m.quad([x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x0, 0, z0], [0, 1, 1, 1, 1, 0, 0, 0], TL(ft), [0.5, 0.5, 0.5], [0, 1, 0], t === 8 ? 0.8 : 0);
    if (rm && (i + j) % 2 === 0) furnish(m, rm, i + 0.5, j + 0.5, rnd);
  }
  // the hero gate: a white stone arch
  var gx = GATE.i + 0.5, gz = GATE.j + 0.5; bxp(m, gx - 1.2, 0, gz - 0.25, gx - 0.8, 2.4, gz + 0.25, '#d8d0c0', TL('kgate')); bxp(m, gx + 0.8, 0, gz - 0.25, gx + 1.2, 2.4, gz + 0.25, '#d8d0c0', TL('kgate')); bxp(m, gx - 1.3, 2.4, gz - 0.3, gx + 1.3, 2.8, gz + 0.3, '#d8d0c0', TL('kgate')); bxp(m, gx - 0.15, 2.8, gz - 0.1, gx + 0.15, 3.2, gz + 0.1, '#ffe36a');
  // the heart's plinth
  var hx = HEART.i + 0.5, hz = HEART.j + 0.5; bxp(m, hx - 0.9, 0, hz - 0.9, hx + 0.9, 0.35, hz + 0.9, '#3a0a10', TL('kfort')); [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]].forEach(function (c) { tub(m, [hx + c[0], 0.35, hz + c[1]], [hx + c[0], 1.6, hz + c[1]], 0.1, 0.08, '#2a0a10', 6); });
  return m.upload();
}
var TORCHES = [];
function furnish(m, rm, x, z, rnd) {
  if (rm === 'lair') { bxp(m, x - 0.35, 0, z - 0.45, x + 0.35, 0.25, z + 0.45, '#5a1a2a', TL('kbed')); ell(m, x, 0.3, z - 0.3, 0.2, 0.06, 0.1, '#e8dcc8', 6, 3); }
  else if (rm === 'hatch') { tub(m, [x, 0, z], [x, 0.08, z], 0.32, 0.36, '#6a5028', 10); ell(m, x, 0.12, z, 0.26, 0.08, 0.26, '#d8a050', 10, 4); ell(m, x, 0.18, z, 0.22, 0.05, 0.22, '#fff6dc', 10, 4); }
  else if (rm === 'treasury') { for (var q = 0; q < 3; q++) ell(m, x + (rnd() - 0.5) * 0.4, 0.05, z + (rnd() - 0.5) * 0.4, 0.18 + rnd() * 0.1, 0.12 + rnd() * 0.1, 0.18, '#ffc840', 8, 4); }
  else if (rm === 'train') { tub(m, [x, 0, z], [x, 1.0, z], 0.05, 0.05, '#5a3a24', 6); ell(m, x, 0.85, z, 0.18, 0.25, 0.14, '#c8a070', 8, 5); tub(m, [x - 0.3, 0.85, z], [x + 0.3, 0.85, z], 0.04, 0.04, '#5a3a24', 5); ell(m, x, 1.18, z, 0.12, 0.12, 0.12, '#c8a070', 8, 5); }
  else if (rm === 'library') { bxp(m, x - 0.42, 0, z - 0.15, x + 0.42, 1.3, z + 0.15, '#2a1a10', TL('kbooks')); }
}
/* 3D people: homunculi in their breed colours, TB's boys (Psycho's rigs), Sir Johnathan */
function drawWho(o, rigName, sc, yaw, pose, extra) { if (!RIGS[rigName]) return; drawRig(RIGS[rigName], wx(o.x), 0, wx(o.y), yaw, pose, Object.assign({ sc: sc }, extra || {})); }
function yawOf(o) { if (o.lx !== undefined) { var dx = o.x - o.lx, dy = o.y - o.ly; if (Math.abs(dx) + Math.abs(dy) > 0.05) o.yaw = Math.atan2(dx, dy); } o.lx = o.x; o.ly = o.y; return o.yaw || 0; }
function draw() {
  W = KIT.W; H = KIT.H; var ctx = KIT.ctx; ctx.clearRect(0, 0, KIT.W, KIT.H);
  if (!R3.ok) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, KIT.W, KIT.H); KIT.text('THIS DEVICE CANNOT DRAW 3D (NO WEBGL)', KIT.W / 2, KIT.H / 2, { align: 'center' }); return; }
  if (!T) { R3.begin([0.05, 0.02, 0.03]); titleBack(); return; }
  if (!RIGSOK) { buildAtlas(); buildRigs(); RIGSOK = true; }
  var sig = caveSig(); if (sig !== WSIG || !WMESH) { WSIG = sig; if (WMESH) WMESH.free(); WMESH = buildCave(); }
  // the camera looks at the hand from above and behind, turned and zoomed as you like
  if (Math.hypot(wx(CUR.x) - CAMK.tx, wx(CUR.y) - CAMK.tz) > 12) { CAMK.tx = wx(CUR.x); CAMK.tz = wx(CUR.y); } CAMK.tx += (wx(CUR.x) - CAMK.tx) * 0.18; CAMK.tz += (wx(CUR.y) - CAMK.tz) * 0.18;
  var cp = Math.cos(CAMK.pitch), eye = [CAMK.tx - Math.sin(CAMK.yaw) * cp * CAMK.dist, Math.sin(CAMK.pitch) * CAMK.dist, CAMK.tz - Math.cos(CAMK.yaw) * cp * CAMK.dist], at = [CAMK.tx, 0, CAMK.tz];
  R3.begin([0.03, 0.01, 0.02]); R3.setCam(eye, at, KIT.W < KIT.H ? 1.15 : 0.9); G.eye = eye; G.at = at;
  var lights = [{ x: HEART.i + 0.5, y: 1.6, z: HEART.j + 0.5, r: 9, c: [1, 0.15, 0.15], k: 1.4 + Math.sin(G.t * 4) * 0.3, d: 0 }, { x: PORTAL.i + 0.5, y: 1.2, z: PORTAL.j + 0.5, r: 7, c: [0.75, 0.3, 1], k: PORTAL.claimed ? 1.4 : 0.5, d: 0 }];
  TORCHES.forEach(function (t, n) { var d = Math.hypot(t.x - CAMK.tx, t.z - CAMK.tz); if (d < 14) lights.push({ x: t.x, y: t.y + 0.2, z: t.z, r: 5, c: [1, 0.6, 0.3], k: 1.2 * (0.9 + Math.sin(G.t * 12 + n) * 0.1), d: d }); });
  lights.sort(function (a, b) { return a.d - b.d; }); lights = lights.slice(0, 6); lights.push({ x: wx(CUR.x), y: 2.6, z: wx(CUR.y), r: 7, c: [1, 0.9, 0.75], k: 1.0 });
  R3.scene({ fog: [0.03, 0.01, 0.02], fogR: [CAMK.dist + 8, CAMK.dist + 30], amb: [0.46, 0.38, 0.36], lights: lights, torch: { p: [0, -99, 0], d: [0, 1, 0], c: [0, 0, 0] }, t: G.t });
  R3.draw(WMESH, ATT);
  // the heart, the portal
  var hb = 1 + Math.sin(G.t * 4) * 0.06; R3.draw(HEARTM(), ATT, { m: R3.model(HEART.i + 0.5, 1.15, HEART.j + 0.5, G.t * 0.5, 0, 0, hb), flash: HEART.hp < HEART.mhp * 0.3 && Math.floor(G.t * 6) % 2 ? [0.4, 0, 0] : null });
  R3.draw(PORTALM(), ATT, { m: R3.model(PORTAL.i + 0.5, 1.0, PORTAL.j + 0.5, G.t * (PORTAL.claimed ? 1.5 : 0.3), 0, 0), add: PORTAL.claimed ? 1 : 0, alpha: PORTAL.claimed ? 0.9 : 0.6, lit: false });
  // the homunculi
  OWN.forEach(function (o) { if (o.held) return; var Hm = HOM3D.get(o.br, 'baby'), moving = o.path && o.path.length, dig = o.job && o.job.t === 'dig' && !moving, y = moving ? Math.abs(Math.sin(G.t * 12 + o.x)) * 0.06 : dig ? Math.abs(Math.sin(G.t * 10)) * 0.05 : 0, yw = dig ? Math.atan2(o.job.i + 0.5 - wx(o.x), o.job.j + 0.5 - wx(o.y)) : yawOf(o);
    R3.draw(Hm.mesh, ATT, { m: R3.model(wx(o.x), y, wx(o.y), yw, dig ? Math.sin(G.t * 10) * 0.25 : 0, moving ? Math.sin(G.t * 12) * 0.1 : 0, 0.9), flash: o.slap > 7.6 ? [0.5, 0.1, 0.1] : null });
    if (o.carry) R3.draw(NUGGET(), ATT, { m: R3.model(wx(o.x), 0.75, wx(o.y), G.t * 3, 0, 0) }); });
  CRE.forEach(function (c) { if (c.held) return; var Q = pose0(), mv = c.path && c.path.length; poseWalk(Q, G.t * 8 + c.x, mv ? 1 : 0, false); if (c.atk > 0) poseSwing(Q, 1 - c.atk / 0.4); drawWho(c, c.d.rig, 0.48, yawOf(c), Q, { held: c.d.held && RIGS[c.d.rig].P[c.d.held] ? RIGS[c.d.rig].P[c.d.held] : null, heldP: -Math.PI / 2, flash: c.slap > 7.6 ? [0.5, 0.1, 0.1] : null }); });
  HER.forEach(function (h) { if (h.d.cat) { var Cm = HOM3D.cat(); R3.draw(Cm.mesh, ATT, { m: R3.model(wx(h.x), Math.abs(Math.sin(G.t * 6)) * 0.05, wx(h.y), yawOf(h), 0, 0, 1.6) }); return; } var Q = pose0(), mv = h.path && h.path.length; poseWalk(Q, G.t * 8 + h.x, mv ? 1 : 0, false); drawWho(h, h.d.rig, h.d.big ? 0.75 : 0.5, yawOf(h), Q, { tint: [1, 0.92, 0.92] }); });
  // the hand: a big gauntlet over the tile, things you are holding dangle under it
  var cxw = wx(CUR.x), czw = wx(CUR.y), ct = curTile(), ctt = inMap(ct[0], ct[1]) ? T[idx(ct[0], ct[1])] : 0, hy = (ctt === 0 || ctt === 1 || ctt === 2 ? BH : 0) + 1.0 + Math.sin(G.t * 3) * 0.08;
  R3.draw(HANDM(), ATT, { m: R3.model(cxw, hy, czw, CAMK.yaw + Math.PI, 0.3, 0, 1), flash: BUILD ? [0.3, 0.25, 0] : null });
  HAND.forEach(function (o, n) { if (o.br) R3.draw(HOM3D.get(o.br, 'baby').mesh, ATT, { m: R3.model(cxw + (n - HAND.length / 2) * 0.18, hy - 0.6, czw, G.t * 2 + n, 0, 0.3, 0.6) }); });
  if (!DYN3) DYN3 = new R3.Mesh(); DYN3.clear();
  // the tile under the hand, room paint preview
  var y0 = (ctt === 0 || ctt === 1 || ctt === 2 ? BH : 0) + 0.02; DYN3.quad([ct[0], y0, ct[1] + 1], [ct[0] + 1, y0, ct[1] + 1], [ct[0] + 1, y0, ct[1]], [ct[0], y0, ct[1]], [0, 0, 1, 0, 1, 1, 0, 1], TL('glow'), BUILD ? [0.4, 0.33, 0.08] : [0.16, 0.14, 0.12], [0, 1, 0], 1);
  TORCHES.forEach(function (t, n) { if (Math.abs(t.x - CAMK.tx) > 18 || Math.abs(t.z - CAMK.tz) > 18) return; var R2 = R3.cam.right, s = 0.08 + Math.sin(G.t * 13 + n) * 0.015; DYN3.quad([t.x - R2[0] * s, t.y - s, t.z - R2[2] * s], [t.x + R2[0] * s, t.y - s, t.z + R2[2] * s], [t.x + R2[0] * s, t.y + s * 1.6, t.z + R2[2] * s], [t.x - R2[0] * s, t.y + s * 1.6, t.z - R2[2] * s], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), [0.8, 0.45, 0.12], [0, 0, 1], 2); });
  FX.forEach(function (f) { if (f.k !== 'dust' && f.k !== 'hit') return; var x = wx(f.x), z = wx(f.y), s = 0.05, c = f.col ? [0.6, 0.05, 0.05] : [0.4, 0.33, 0.28]; DYN3.quad([x - s, 0.3, z], [x + s, 0.3, z], [x + s, 0.3 + s * 2, z], [x - s, 0.3 + s * 2, z], [0, 1, 1, 1, 1, 0, 0, 0], TL('glow'), c, [0, 0, 1], 1); });
  R3.draw(DYN3, ATT, { soft: true, lit: false });
  // labels: levels and moods over heads, hero health
  CRE.forEach(function (c) { if (c.held) return; var p = R3.project(wx(c.x), 1.2, wx(c.y)); if (!p) return; if (c.lv > 1) KIT.text('' + c.lv, p.x + 6, p.y - 4, { size: 6, col: '#7aff6a', outline: 1 }); if (c.mood < 0.4) KIT.text('!', p.x - 2, p.y - 12, { size: 8, col: '#ff2630', outline: 1 }); });
  HER.forEach(function (h) { var p = R3.project(wx(h.x), h.d.big ? 1.9 : 1.3, wx(h.y)); if (!p) return; R('#12040a', p.x - 11, p.y, 22, 4); R('#f1e7d0', p.x - 10, p.y + 1, 20 * Math.max(0, h.hp) / h.d.hp, 2); });
  OWN.forEach(function (o) { if (o.carry && !o.held) { } });
  FX.forEach(function (f) { if (f.k !== 'txt') return; var p = R3.project(wx(f.x), 1.2 + (1 - f.t) * 0.5, wx(f.y)); if (p) KIT.text(f.s, p.x, p.y, { align: 'center', size: 6, col: f.col, outline: 1 }); });
  hud();
}
var _HM = null, _PM = null, _NM = null, _HAND = null;
function HEARTM() { if (_HM) return _HM; var m = M(); ell(m, -0.18, 0.1, 0, 0.32, 0.32, 0.28, '#c4121c', 12, 8); ell(m, 0.18, 0.1, 0, 0.32, 0.32, 0.28, '#c4121c', 12, 8); ell(m, 0, -0.18, 0, 0.3, 0.38, 0.26, '#a80e18', 12, 8, { tip: -0.3 }); tub(m, [-0.1, 0.35, 0], [-0.18, 0.62, 0], 0.08, 0.06, '#7a0a10', 6); tub(m, [0.12, 0.35, 0], [0.22, 0.58, 0.05], 0.07, 0.05, '#7a0a10', 6); return (_HM = m.upload()); }
function PORTALM() { if (_PM) return _PM; var m = M(); for (var s = 0; s < 16; s++) { var a0 = s / 16 * 6.283, a1 = (s + 1) / 16 * 6.283, r0 = 0.9, r1 = 0.35; m.quad([Math.cos(a0) * r0, 0, Math.sin(a0) * r0], [Math.cos(a1) * r0, 0, Math.sin(a1) * r0], [Math.cos(a1 + 0.6) * r1, 0.02, Math.sin(a1 + 0.6) * r1], [Math.cos(a0 + 0.6) * r1, 0.02, Math.sin(a0 + 0.6) * r1], [0, 0, 1, 0, 1, 1, 0, 1], TL('glow'), s % 2 ? [0.5, 0.15, 0.7] : [0.3, 0.08, 0.45], [0, 1, 0], 1); } for (var k = 0; k < 10; k++) { var a = k / 10 * 6.283; tub(m, [Math.cos(a) * 1.0, -1, Math.sin(a) * 1.0], [Math.cos(a) * 1.0, 0.1, Math.sin(a) * 1.0], 0.08, 0.06, '#3a2a3a', 5); } return (_PM = m.upload()); }
function NUGGET() { if (_NM) return _NM; var m = M(); ell(m, 0, 0, 0, 0.1, 0.08, 0.09, '#ffc840', 6, 4); return (_NM = m.upload()); }
function HANDM() { if (_HAND) return _HAND; var m = M(); ell(m, 0, 0, 0, 0.26, 0.1, 0.3, '#f1e7d0', 10, 5); for (var f = 0; f < 4; f++) tub(m, [-0.18 + f * 0.12, -0.02, 0.22], [-0.2 + f * 0.13, -0.2, 0.42], 0.05, 0.04, '#f1e7d0', 6); tub(m, [0.24, 0, 0.05], [0.38, -0.12, 0.2], 0.05, 0.04, '#f1e7d0', 6); tub(m, [0, 0, -0.25], [0, 0.05, -0.55], 0.16, 0.18, '#c4121c', 8); return (_HAND = m.upload()); }
/* the controls: the hand moves the way the camera looks; the camera turns and zooms */
function update(dt) {
  G.t += dt; if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.mode !== 'play') return;
  var mv = KIT.stick(0), lk = KIT.stick(1), f = [Math.sin(CAMK.yaw), Math.cos(CAMK.yaw)], r = [-f[1], f[0]], sp = 9 * KT * dt * (0.6 + CAMK.dist / 22);
  CUR.x = Math.max(8, Math.min(MW * KT - 8, CUR.x + (mv.x * r[0] + -mv.y * f[0]) * sp)); CUR.y = Math.max(8, Math.min(MH * KT - 8, CUR.y + (mv.x * r[1] + -mv.y * f[1]) * sp));
  var turn = (KIT.held('rotl') ? 1 : 0) - (KIT.held('rotr') ? 1 : 0) + (KIT.held('lb') ? 1 : 0) - (KIT.held('rb') ? 1 : 0) - lk.x; CAMK.yaw += turn * 1.8 * dt;
  var zoom = (KIT.held('zin') ? -1 : 0) + (KIT.held('zout') ? 1 : 0) + lk.y + G.wheel; G.wheel = 0; CAMK.dist = Math.max(5, Math.min(26, CAMK.dist + zoom * 9 * dt)); CAMK.pitch = 0.75 + (CAMK.dist - 5) / 21 * 0.4;
  if (KIT.ptr.tap) { var hit = pick(KIT.ptr.x, KIT.ptr.y); if (hit) { CUR.x = hit[0] * KT; CUR.y = hit[1] * KT; act(); } } else if (KIT.pressed('a')) act();
  if (KIT.pressed('b')) drop(); if (KIT.pressed('x')) slap(); if (KIT.pressed('y')) buildMenu();
  if (KIT.held('a') && BUILD) paint();
  stepImps(dt); stepCreatures(dt); stepHeroes(dt);
  FX.forEach(function (fx) { fx.t -= dt; if (fx.vx) { fx.x += fx.vx * dt; fx.y += fx.vy * dt; } }); FX = FX.filter(function (fx) { return fx.t > 0; });
}
var _wheelHooked = (function () { G.wheel = 0; KIT.canvas.addEventListener('wheel', function (e) { if (G.mode === 'play') { G.wheel += Math.sign(e.deltaY) * 4; e.preventDefault(); } }, { passive: false }); })();
/* a tap on the picture: a ray from the camera to the rock tops, then to the floor */
function pick(sx, sy) {
  var e = G.eye, a = G.at; if (!e) return null; var fx = a[0] - e[0], fy = a[1] - e[1], fz = a[2] - e[2], fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
  var rx = fy * 0 - fz * 1, ry = fz * 0 - fx * 0, rz = fx * 1 - fy * 0, rl = Math.hypot(rx, ry, rz); rx /= rl; ry /= rl; rz /= rl; // right = f x up
  var ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx, fov = KIT.W < KIT.H ? 1.15 : 0.9, th = Math.tan(fov / 2), asp = KIT.W / KIT.H, nx = (sx / KIT.W) * 2 - 1, ny = 1 - (sy / KIT.H) * 2;
  var dx = fx + rx * nx * th * asp + ux * ny * th, dy = fy + ry * nx * th * asp + uy * ny * th, dz = fz + rz * nx * th * asp + uz * ny * th;
  if (dy >= 0) return null; var tTop = (BH - e[1]) / dy, px = e[0] + dx * tTop, pz = e[2] + dz * tTop, i = Math.floor(px), j = Math.floor(pz);
  if (inMap(i, j)) { var t = T[idx(i, j)]; if (t === 0 || t === 1 || t === 2) return [px, pz]; }
  var t0 = -e[1] / dy; return [e[0] + dx * t0, e[2] + dz * t0];
}
function titleBack() { var g = KIT.ctx, Wd = KIT.W, Hd = KIT.H; g.fillStyle = '#0a0506'; g.fillRect(0, 0, Wd, Hd); for (var j = 0; j < Hd; j += 24) for (var i = 0; i < Wd; i += 24) { g.fillStyle = ((i + j) / 24) % 3 ? '#1e1410' : '#2a1c16'; g.fillRect(i, j, 23, 23); } g.fillStyle = '#c4121c'; g.beginPath(); g.arc(Wd / 2, Hd * 0.3, 34, 0, 6.3); g.fill(); }

/* touch: two fingers turn the camera (twist) and zoom it (pinch) */
(function () { var T2 = null; function two(e) { if (e.touches.length !== 2) return null; var a = e.touches[0], b = e.touches[1]; return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), a: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) }; }
  window.addEventListener('touchstart', function (e) { if (G.mode === 'play') T2 = two(e); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (G.mode !== 'play' || !T2) return; var n = two(e); if (!n) return; CAMK.dist = Math.max(5, Math.min(26, CAMK.dist * T2.d / Math.max(20, n.d))); var da = Math.atan2(Math.sin(n.a - T2.a), Math.cos(n.a - T2.a)); CAMK.yaw -= da; T2 = n; }, { passive: true });
  window.addEventListener('touchend', function (e) { if (e.touches.length < 2) T2 = null; }, { passive: true }); })();

/* the build panel is a grid of room cards (update 132: inventories, not menus) */
function roomIcon(r) { return function (g, w) { var s = w / 48; g.save(); g.scale(s, s); g.fillStyle = '#12040a'; g.fillRect(4, 8, 40, 32); g.fillStyle = ROOMS[r] ? ROOMS[r].col : '#3a0e14'; g.fillRect(6, 10, 36, 28); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(6, 10, 36, 3);
  if (r === 'lair') { g.fillStyle = '#e8dcc8'; g.fillRect(12, 18, 24, 6); g.fillStyle = '#5a1a2a'; g.fillRect(12, 24, 24, 8); }
  else if (r === 'hatch') { g.fillStyle = '#d8a050'; g.beginPath(); g.ellipse(24, 26, 12, 6, 0, 0, 6.3); g.fill(); g.fillStyle = '#fff6dc'; g.beginPath(); g.ellipse(24, 24, 10, 4, 0, 0, 6.3); g.fill(); }
  else if (r === 'treasury') { g.fillStyle = '#ffc840'; [[16, 28], [24, 24], [32, 28], [20, 30], [28, 30]].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], 4, 0, 6.3); g.fill(); }); }
  else if (r === 'train') { g.fillStyle = '#c8a070'; g.fillRect(22, 14, 4, 20); g.beginPath(); g.arc(24, 14, 5, 0, 6.3); g.fill(); g.fillRect(16, 20, 16, 3); }
  else if (r === 'library') { ['#6a0a10', '#1a2a4a', '#2a4a1a', '#5a4a1a', '#3a1a3a'].forEach(function (c, n) { g.fillStyle = c; g.fillRect(12 + n * 5, 16, 4, 14); }); g.fillStyle = '#5a3a24'; g.fillRect(10, 30, 28, 3); }
  else if (r === 'hatchimp') { g.fillStyle = '#5cc7c9'; g.beginPath(); g.arc(24, 26, 10, 0, 6.3); g.fill(); g.fillStyle = '#c98e7c'; g.beginPath(); g.ellipse(24, 19, 7, 4, 0, 0, 6.3); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(24, 27, 3, 0, 6.3); g.fill(); }
  else if (r === 'sell') { g.fillStyle = '#ffe36a'; g.font = 'bold 20px monospace'; g.textAlign = 'center'; g.fillText('$', 24, 32); }
  else if (r === 'stop') { g.strokeStyle = '#ff2630'; g.lineWidth = 4; g.beginPath(); g.moveTo(14, 14); g.lineTo(34, 34); g.moveTo(34, 14); g.lineTo(14, 34); g.stroke(); }
  g.restore(); }; }
function buildMenu() {
  var hatchCost = 150 + OWN.length * 40, sl = Object.keys(ROOMS).map(function (r) { return { draw: roomIcon(r), name: ROOMS[r].n, desc: ROOMS[r].d, gold: BUILD === r, tag: BUILD === r ? 'ON' : null, stats: [['A tile', ROOMS[r].cost + ' gold'], ['You have', roomCount(r) + ' tiles']], act: 'PAINT IT', fn: function () { BUILD = r; KIT.closeMenu(); G.banner = { t: 2, s: 'PAINT ' + ROOMS[r].n + ' ON RED FLOOR', b: 'A TO PAINT, Y TO STOP' }; } }; });
  sl.push({ draw: roomIcon('hatchimp'), name: 'Hatch a Homunculus', desc: 'One more worker, a new breed each time.', stats: [['Costs', hatchCost + ' gold']], act: 'HATCH', dis: G.gold < hatchCost, fn: function () { KIT.confirm({ title: 'Hatch a Homunculus', price: hatchCost, have: G.gold, unit: 'GOLD', yesLabel: 'Hatch', yes: function () { G.gold -= hatchCost; OWN.push(mkImp(HEART.i, HEART.j + 1)); sfx.play('magic'); KIT.closeMenu(); }, no: buildMenu }); } });
  sl.push({ draw: roomIcon('sell'), name: 'Sell a Room Tile', desc: 'Sells the room tile under the hand for half what it cost.', act: 'SELL', fn: function () { var c = curTile(), k = idx(c[0], c[1]); if (ROOMAT[k]) { G.gold += Math.round(ROOMS[ROOMAT[k]].cost / 2); ROOMAT[k] = null; sfx.play('coin'); } KIT.closeMenu(); } });
  if (BUILD) sl.push({ draw: roomIcon('stop'), name: 'Stop Building', desc: 'Put the paint away.', act: 'STOP', fn: function () { BUILD = null; KIT.closeMenu(); } });
  KIT.inv({ title: 'Build', cols: 4, slots: sl, stats: [['GOLD', Math.round(G.gold)], ['HOMUNCULI', OWN.length], ['CREATURES', CRE.length]], close: KIT.closeMenu });
}
