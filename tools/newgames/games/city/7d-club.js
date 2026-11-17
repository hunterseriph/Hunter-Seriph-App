/* ---------- update 156 (his asks): the Clubhouse gets a sofa, a telly and the SPRAYSTATION, a games console that plays
   every other game he has made, but only the cartridges you own. Cartridges come from Potbelly, who now runs FOUR
   arcades round Cum City, each with its own cabinets (a go is $5) and its own cartridges for sale (asked first, like
   every shop). The Clubhouse also has the stim stash: COMBAT STIMS get you high and make you hit harder and take less. ---------- */
var SPRAYGAMES = {
  meatnado: ['Meatnado Escape', 'meatnado.html', 600], spermhog: ['Cumhead the Spermhog', 'spermhog.html', 900], survivors: ['Spermaid Survivors', 'spermaid-survivors.html', 800],
  willy: ['Willy Nilly', 'willy-nilly.html', 600], spuzz: ["Spuzzworld: Cum's Oddysee", 'spuzzworld.html', 700], grinding: ['The Grinding of Cumhead', 'grinding-of-cumhead.html', 800],
  overdrive: ["Potbelly's Arcade Overdrive", 'arcade-overdrive.html', 500], void: ['Journey to the Void', 'journey-to-the-void.html', 1200], kart: ['Cumhead Kart', 'cumhead-kart.html', 1200],
  skeet: ['Skeet Fighter', 'skeet-fighter.html', 900], psycho: ['Psycho Nightmare', 'psycho-nightmare.html', 1400], adv: ['Spermhog Adventure', 'spermhog-adventure.html', 1200],
  dark: ['Dark Loads', 'dark-loads.html', 1500], legend: ['The Legend of Cumhead', 'legend-of-cumhead.html', 1200], cumstein: ['Cumstein 3D', 'cumstein-3d.html', 700],
  faprooms: ['The Fap Rooms', 'fap-rooms.html', 700], keeper: ['Gooning Cave Keeper', 'gooning-cave-keeper.html', 900], spunky: ['Super Spunky Ball', 'super-spunky-ball.html', 600],
  octo: ["Pulsar's Octobeats", 'pulsars-octobeats.html', 600], cq: ['Cumheads Quest', 'cumheads-quest.html', 1500], ll: ['Load Legacy', 'load-legacy.html', 1500]
};
// each arcade has its own cabinets
var ARCADES = {
  arcade: { name: "Potbelly's Arcade", games: ['overdrive', 'meatnado', 'spermhog', 'skeet', 'kart', 'cq'] },
  arcade2: { name: "Potbelly's Arcade: Red Light", games: ['psycho', 'faprooms', 'cumstein', 'dark', 'grinding'] },
  arcade3: { name: "Potbelly's Arcade: Ejaculand", games: ['spunky', 'octo', 'willy', 'survivors', 'adv'] },
  arcade4: { name: "Potbelly's Arcade: The Docks", games: ['legend', 'void', 'keeper', 'spuzz', 'll'] }
};
(function () { // cabinet art: the game's name on the marquee and a screen glow
  Object.keys(SPRAYGAMES).forEach(function (g) { var nm = SPRAYGAMES[g][0].toUpperCase(); HIPAINT['cab_' + g] = function (c) { c.fillStyle = '#12040a'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#c4121c'; c.fillRect(2, 2, 60, 18); c.fillStyle = '#ffe36a'; c.textAlign = 'center'; c.textBaseline = 'middle';
    var w = nm.split(' '), L = [], cur = ''; c.font = 'bold 8px "Archivo Narrow", sans-serif'; w.forEach(function (x) { var t = cur ? cur + ' ' + x : x; if (c.measureText(t).width > 56 && cur) { L.push(cur); cur = x; } else cur = t; }); L.push(cur); L = L.slice(0, 2);
    L.forEach(function (l, k) { c.fillText(l, 32, 11 + (k - (L.length - 1) / 2) * 8); }); c.fillStyle = '#1a2a3a'; c.fillRect(8, 24, 48, 30); c.fillStyle = ['#ff2630', '#4adfff', '#7aff6a', '#ffe36a'][g.length % 4]; for (var i = 0; i < 6; i++) c.fillRect(12 + i * 7, 46 - (i * 13 % 17), 4, 4); c.fillStyle = '#f1e7d0'; c.fillRect(10, 26, 20, 2); c.fillStyle = '#2a2226'; c.fillRect(6, 56, 52, 8); }; });
  HIPAINT.spraytv = function (c) { c.fillStyle = '#0a0a10'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#12040a'; c.fillRect(4, 4, 56, 40); c.fillStyle = '#c4121c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '13px "Pirata One", serif'; c.fillText('SPRAY', 32, 18); c.fillStyle = '#f1e7d0'; c.fillText('STATION', 32, 32); c.fillStyle = '#4adfff'; c.fillRect(20, 38, 24, 2); };
  HIPAINT.stims = function (c) { c.fillStyle = '#f1e7d0'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#c4121c'; c.fillRect(24, 8, 16, 48); c.fillRect(8, 24, 48, 16); c.fillStyle = '#12040a'; c.textAlign = 'center'; c.font = 'bold 9px "Archivo Narrow", sans-serif'; c.fillText('STIMS', 32, 60); };
})();
ROOMS.club.props = ['bar', 'jukebox', 'table', 'bed', 'spraystation', 'stims'];
['arcade', 'arcade2', 'arcade3', 'arcade4'].forEach(function (id) { ROOMS[id] = { wall: 'arcwall', floor: 'arcarpet', keeper: 'potbelly', props: [], arcade: 1, w: 16, d: 14 }; });
// the new props, drawn into the room mesh
var _roomMesh = roomMesh;
roomMesh = function (id) {
  var R0 = ROOMS[id] || ROOMS.home; if (!R0.cabs && id !== 'club') return _roomMesh(id);
  var keep = R0.props; R0.props = keep.filter(function (p) { return p !== 'cabinet' && p !== 'spraystation' && p !== 'stims'; }); var RM = _roomMesh(id); R0.props = keep;
  var m = M(), w = RM.w, d = RM.d;
  if (R0.cabs) R0.cabs.forEach(function (g, i) { var ax = 1.4 + i * ((w - 2.8) / Math.max(1, R0.cabs.length - 1)), z0 = 3.6; boxT(m, ax - 0.55, 0, z0, ax + 0.55, 1.9, z0 + 0.8, { wall: 'black', top: 'black' }); boxC(m, ax - 0.55, 0.95, z0 - 0.25, ax + 0.55, 1.05, z0, '#2a2226');
    standQ(m, ax, z0 - 0.02, Math.PI, 1.0, 1.05, 1.85, TL('cab_' + g), 1.7, 0.7); RM.boxes.push([ax - 0.55, z0 - 0.25, ax + 0.55, z0 + 0.8]); });
  if (id === 'club') { // the sofa, the telly on its stand, the SprayStation under it; the stim stash on the wall by the bar
    var tx = 0.35, tz = 6.6; boxC(m, tx, 0, tz - 1.2, tx + 0.6, 0.7, tz + 1.2, '#2a1a10'); boxC(m, tx + 0.15, 0.7, tz - 1.1, tx + 0.25, 1.9, tz + 1.1, '#0a0a10'); standQ(m, tx + 0.27, tz, Math.PI / 2, 2.1, 0.78, 1.82, TL('spraytv'), 1.6, 0.9);
    boxC(m, tx + 0.15, 0.72, tz - 0.4, tx + 0.5, 0.82, tz + 0.1, '#f1e7d0'); boxC(m, tx + 0.25, 0.82, tz - 0.3, tx + 0.45, 0.84, tz - 0.2, '#c4121c');
    var sx = 3.6; boxC(m, sx, 0, tz - 1.6, sx + 1.0, 0.5, tz + 1.6, '#5a0a14'); boxC(m, sx + 0.7, 0.5, tz - 1.6, sx + 1.0, 1.15, tz + 1.6, '#5a0a14'); boxC(m, sx, 0.5, tz - 1.6, sx + 1.0, 0.75, tz - 1.35, '#4a0a10'); boxC(m, sx, 0.5, tz + 1.35, sx + 1.0, 0.75, tz + 1.6, '#4a0a10');
    boxC(m, sx + 0.1, 0.5, tz - 1.2, sx + 0.65, 0.62, tz - 0.05, '#7a1a24'); boxC(m, sx + 0.1, 0.5, tz + 0.05, sx + 0.65, 0.62, tz + 1.2, '#7a1a24'); boxC(m, 1.6, 0, tz - 0.6, 2.6, 0.42, tz + 0.6, '#3a2418');
    RM.boxes.push([tx, tz - 1.2, tx + 0.6, tz + 1.2], [sx, tz - 1.6, sx + 1.0, tz + 1.6], [1.6, tz - 0.6, 2.6, tz + 0.6]);
    boxC(m, 0.05, 1.2, d - 4.6, 0.3, 2.2, d - 3.6, '#f1e7d0'); standQ(m, 0.31, d - 4.1, Math.PI / 2, 0.9, 1.25, 2.15, TL('stims'), 1.4, 0.4);
    RM.club = { sofa: { x: sx - 0.4, z: tz }, stims: { x: 0.9, z: d - 4.1 } }; }
  var em = m.upload(), base = RM.mesh; RM.mesh = base; RM.extra = em; return RM;
};
var _drawInterior = drawInterior;
drawInterior = function (look) { _drawInterior(look); var I = G.interior; if (I && I.RM.extra) R3.draw(I.RM.extra, ATT); };
// the other three arcades: a building in the red light district and one at the docks take Potbelly's shop front; Ejaculand's is the hall in the park
(function () {
  function grab(dist, id) { var d = DISTID[dist], best = null; BLD.forEach(function (b) { if (best || b.shop || b.style === 'carpark' || HOUSES.some(function (h) { return h.b === b; }) || DM[Math.floor((b.z0 + b.z1) / 2 / CT) * MW + Math.floor((b.x0 + b.x1) / 2 / CT)] !== d) return; var dd = doorOf(b); if (!dd || (b.x1 - b.x0) < 9 || (b.z1 - b.z0) < 9) return; var r = nearestRoad(dd.x, dd.z, 16); if (!r) return; best = b; }); if (!best) return;
    best.shop = id; best.shopName = ARCADES[id].name; SHOPS[id] = { id: id, name: ARCADES[id].name, b: best }; }
  grab('red', 'arcade2'); grab('docks', 'arcade4');
  FACOF.arcade2 = FACOF.arcade4 = 'fac_arcade';
  var hall = (typeof PARKCELL !== 'undefined' ? PARKCELL : []).filter(function (p) { return p.k === 'arcadehall'; })[0];
  if (hall) SHOPS.arcade3 = { id: 'arcade3', name: ARCADES.arcade3.name, b: { i: -1, x0: hall.x - 9, x1: hall.x + 9, z0: hall.z - 7, z1: hall.z + 7, y0: hall.h, h: 8, front: 2, shop: 'arcade3', hall: 1 } };
  if (SHOPS.arcade) SHOPS.arcade.name = ARCADES.arcade.name;
})();
CAST.potbelly.shop = 'arcade';
/* what Potbelly sells: the cartridges for the games in this arcade (asked first) */
var _goods = goods;
goods = function (id) { if (!ARCADES[id]) return _goods(id); SV.carts = SV.carts || {};
  return ARCADES[id].games.map(function (g) { var Gm = SPRAYGAMES[g]; return { n: Gm[0] + ' cartridge' + (SV.carts[g] ? ' (yours)' : ''), p: SV.carts[g] ? 0 : Gm[2], dis: !!SV.carts[g], fn: function () { SV.carts[g] = 1; toast(Gm[0] + ' is yours. Play it on the SprayStation in the Clubhouse.'); } }; }); };
// inside: the cabinets, the sofa and the stash
var _enterShop2 = enterShop;
enterShop = function (id, homeId, special) { var r = _enterShop2.apply(this, arguments); var I = G.interior; if (!I || !I.RM) return r;
  if (ARCADES[id] && typeof arcadeUses === 'function') arcadeUses(id, I);
  if (id === 'club' && I.RM.club) { var C = I.RM.club; G.indoorUses.push({ x: C.sofa.x, z: C.sofa.z, r: 1.4, label: 'PLAY THE SPRAYSTATION', fn: sprayMenu }); G.indoorUses.push({ x: C.stims.x, z: C.stims.z, r: 1.2, label: 'COMBAT STIMS ($40)', fn: stimMenu }); }
  return r; };
/* ---------- the SprayStation ---------- */
function sprayMenu() { SV.carts = SV.carts || {}; var own = Object.keys(SPRAYGAMES).filter(function (g) { return SV.carts[g]; });
  KIT.menu({ title: 'SPRAYSTATION', sub: own.length ? own.length + ' of ' + Object.keys(SPRAYGAMES).length + ' cartridges' : 'No cartridges yet. Potbelly sells them at his four arcades.',
    items: own.map(function (g) { return { label: SPRAYGAMES[g][0], fn: function () { KIT.closeMenu(); sprayOpen(g, 'console'); } }; }).concat([{ label: 'WHERE ARE THE ARCADES?', fn: function () { var ids = Object.keys(ARCADES).filter(function (a) { return SHOPS[a]; }); var a = ids[Math.floor(Math.random() * ids.length)]; if (a) { var d = doorOf(SHOPS[a].b); SV.way = [d.x, d.z]; toast('Waypoint set: ' + ARCADES[a].name); } KIT.closeMenu(); } }, { label: 'BACK', back: true, fn: function () { KIT.closeMenu(); } }]) }); }
function sprayOpen(g, how) {
  var Gm = SPRAYGAMES[g]; if (!Gm) return; var el = document.getElementById('spray'); if (!el) { el = document.createElement('div'); el.id = 'spray'; el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:none';
    el.innerHTML = '<iframe id="sprayF" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; fullscreen; gamepad"></iframe><button id="sprayX" style="position:absolute;top:6px;left:50%;transform:translateX(-50%);z-index:2;font:16px \'Pirata One\',serif;background:#12040a;color:#f1e7d0;border:2px solid #c4121c;border-radius:6px;padding:2px 14px;opacity:.85">✕ ' + (how === 'cabinet' ? 'LEAVE THE CABINET' : 'SWITCH OFF') + '</button>';
    document.body.appendChild(el); document.getElementById('sprayX').addEventListener('click', sprayClose); }
  else document.getElementById('sprayX').textContent = '✕ ' + (how === 'cabinet' ? 'LEAVE THE CABINET' : 'SWITCH OFF');
  var f = document.getElementById('sprayF'); f.onload = function () { try { f.contentWindow.addEventListener('keydown', function (e) { if (e.key === 'Escape') sprayClose(); }); f.contentWindow.focus(); } catch (e) {} };
  f.src = Gm[1]; el.style.display = 'block'; G.spray = { g: g, how: how }; try { music.stop(); } catch (e) {} if (window.HSPad && HSPad.audioPause) HSPad.audioPause(true); toast(how === 'cabinet' ? 'Select / Back leaves the cabinet.' : 'Select / Back switches it off.'); }
function sprayClose() { var el = document.getElementById('spray'); if (!el || !G.spray) return; var f = document.getElementById('sprayF'); f.onload = null; f.src = 'about:blank'; el.style.display = 'none'; G.spray = null; if (window.HSPad && HSPad.audioPause) HSPad.audioPause(false); try { window.focus(); } catch (e) {} }
/* ---------- combat stims: get high, hit harder, take less (a minute and a half) ---------- */
function stimMenu() { KIT.confirm({ title: 'Combat Stims', sub: 'You hit 60% harder, take half the damage and move quicker for 90 seconds. Then you crash.', price: 40, have: Math.floor(SV.money), unit: '$', yes: function () { if (SV.money < 40) { toast('$40 for the stims.'); KIT.closeMenu(); return; } money(-40); KIT.closeMenu(); takeStim(); }, no: function () { KIT.closeMenu(); } }); }
function takeStim() { G.stim = 90; G.high = Math.min(1, (G.high || 0) + 0.6); P.hp = Math.min(SV.maxHp, P.hp + 25); sfx.play('blip'); bigText('COMBAT STIMS', 'Ninety seconds of pure load', '#ff2630', 2.5); CAM.shake = 0.4; }
var _hurtPlayer = hurtPlayer;
hurtPlayer = function (dmg, by) { if (G.stim > 0) dmg *= 0.5; return _hurtPlayer(dmg, by); };
var _hurtPed = hurtPed;
hurtPed = function (p, dmg, by, dir, car) { if (G.stim > 0 && by === P) dmg *= 1.6; return _hurtPed(p, dmg, by, dir, car); };
function stepStim(dt) { if (!(G.stim > 0)) return; G.stim -= dt; G.high = Math.max(G.high || 0, 0.35); if (G.stim <= 0) { G.stim = 0; toast('The stims wear off. You feel like a wet sock.'); G.drunk = Math.max(G.drunk || 0, 0.25); } }
