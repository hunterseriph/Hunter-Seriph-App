/* ---------- characters (his ask): Cumhead, the homunculi, Cumhead with a homunculus following him, Greebo & Sir Johnathan ----------
   Every homunculus breed is its own character, opened in order: finish the game as one (on his own, or following Cumhead)
   and the next colour hatches. The last is Bloodmoon, the ultimate lifeform; finishing as him opens Greebo & Sir Johnathan,
   who come as a pair. Everyone has a super form (the seven Cum Chalices + 50 drops, then a third jump in the air).
   Ids: 'cumhead', 'hom_<breed>', 'ch_<breed>' (Cumhead + that breed following), 'greebo' (Greebo, Sir Johnathan follows).
   Unlocks are for the whole game, not one save: SV.homs (breeds hatched), SV.gs (the pair). */
var HOMORDER = ['gloop', 'guard', 'ember', 'frost', 'volt', 'medic', 'leech', 'scout', 'goldie', 'titan', 'blood'];
var HOMNAME = { gloop: 'GLOOP', guard: 'BULWARK', ember: 'EMBERTAIL', frost: 'FROSTBITE', volt: 'VOLTLING', medic: 'MENDLING', leech: 'LEECHLING', scout: 'PEEPER', goldie: 'GOLDIE', titan: 'TITAN', blood: 'BLOODMOON' };
// each one's super form: [outline, shadow, body, light] (Bloodmoon goes black with a crimson glow: the ultimate lifeform)
var SUPERPAL = { cumhead: ['#6e3808', '#c88c1e', '#ffd84a', '#fffbe8'], gloop: ['#1e5a10', '#4ec43a', '#a8ff6a', '#f4ffe0'], guard: ['#5a4a3a', '#c8b89a', '#f1e7d0', '#ffffff'],
  ember: ['#7a1a04', '#ff6a10', '#ffb040', '#fff0c0'], frost: ['#10406a', '#4ab0ff', '#9adfff', '#f0fbff'], volt: ['#6a5a00', '#e8d020', '#ffe36a', '#fffde0'],
  medic: ['#7a1a3a', '#ff6a9a', '#ffb0c8', '#fff0f4'], leech: ['#3a0408', '#a00c18', '#ff2630', '#ffb0b0'], scout: ['#3a106a', '#9a5aff', '#c8a0ff', '#f4ecff'],
  goldie: ['#6e3808', '#e0a020', '#ffe36a', '#fffbe8'], titan: ['#5a1404', '#d04a1a', '#ff8a5a', '#ffe0d0'], blood: ['#ff2630', '#000000', '#1a0206', '#c4121c'], greebo: ['#7a4a08', '#e8b040', '#fff0b0', '#ffffff'] };
SV.homs = SV.homs || ['gloop']; SV.gs = SV.gs || 0;
function homOpen(b) { return SV.homs.indexOf(b) >= 0; }
function mkChars() {
  var L = [{ id: 'cumhead', kind: 'ch', name: 'CUMHEAD', sup: 'cumhead' }];
  HOMORDER.forEach(function (b) { if (homOpen(b)) L.push({ id: 'hom_' + b, kind: 'hom', breed: b, name: HOMNAME[b], sc: 1.15, sup: b }); });
  HOMORDER.forEach(function (b) { if (homOpen(b)) L.push({ id: 'ch_' + b, kind: 'ch', fol: b, name: 'CUMHEAD + ' + HOMNAME[b], sup: 'cumhead' }); });
  if (SV.gs) L.push({ id: 'greebo', kind: 'gs', name: 'GREEBO & SIR JOHNATHAN', fol: 'cat', sup: 'greebo' });
  return L;
}
function charDef(id) { var L = mkChars(); for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
  if (id && id.indexOf('hom_') === 0) return { id: id, kind: 'hom', breed: id.slice(4), name: HOMNAME[id.slice(4)] || 'HOMUNCULUS', sc: 1.15, sup: id.slice(4) };
  if (id && id.indexOf('ch_') === 0) return { id: id, kind: 'ch', fol: id.slice(3), name: 'CUMHEAD', sup: 'cumhead' };
  if (id === 'greebo') return { id: 'greebo', kind: 'gs', name: 'GREEBO & SIR JOHNATHAN', fol: 'cat', sup: 'greebo' };
  return L[0]; }
HOGCHARS = mkChars();
charOf = function (id) { return charDef(id); };
function CHR() { var id = G.mode === 'title' || !G.ch ? 'cumhead' : G.ch; if (CHR.id !== id) { CHR.id = id; CHR.c = charDef(id); } return CHR.c; }
function superName() { var C = CHR(); return C.kind === 'hom' && C.breed === 'blood' ? 'THE ULTIMATE LIFEFORM!' : C.kind === 'hom' ? 'SUPER ' + C.name + '!' : C.kind === 'gs' ? 'SUPER GREEBO & SIR JOHNATHAN!' : 'SUPER CUMHEAD!'; }
function shortName() { var C = CHR(); return C.kind === 'gs' ? 'GREEBO' : C.kind === 'hom' ? C.name : 'CUMHEAD'; }
function refreshChars() { HOGCHARS = mkChars(); CHR.id = null; }

/* the frame for the player, by character */
function pName(p, sp) { return frameFor(CHR(), p, sp); }
function frameFor(C, p, sp) {
  if (C.kind === 'hom') { var pre = 'h_' + C.breed + '_adult_';
    if (p.state === 'dead' || p.state === 'hurt') return pre + 'hurt'; if (p.atkT > 0) return pre + 'atk'; if (p.air) return pre + 'jump';
    if (sp < 8) return pre + 'idle' + (Math.floor(G.t * 3) % 2); return pre + 'run' + (Math.floor((p.dist || 0) / (sp < 115 ? 5 : 7)) % 4); }
  if (C.kind === 'gs') {
    if (p.state === 'dead') return 'greebo_dead'; if (p.state === 'hurt') return 'greebo_d'; if (p.air || p.atkT > 0) return 'greebo_s1';
    if (sp < 8) return 'npc_greebo'; return 'greebo_s' + (Math.floor((p.dist || 0) / (sp < 115 ? 6 : 8)) % 3); }
  if (p.state === 'dead') return 'ch_death' + (Math.floor(p.deadT * 4) % 2);
  if (p.state === 'hurt') return 'ch_hurt0'; if (p.atkT > 0) return 'ch_attack';
  if (p.air) return 'ch_jump' + Math.min(3, p.vy < -150 ? 0 : p.vy < 0 ? 1 : p.vy < 200 ? 2 : 3);
  if (sp < 8) return 'ch_idle' + (Math.floor(G.t * 6) % 7);
  if (sp < 115) return 'ch_walk' + (Math.floor((p.dist || 0) / 5.5) % 9);
  return 'ch_rn' + (Math.floor((p.dist || 0) / 7.5) % 8);
}
/* super forms: the frame recoloured into the character's own super palette */
var SUPIMG = {};
function superImg(n, key) {
  key = key || CHR().sup; var k = key + ':' + n; if (SUPIMG[k]) return SUPIMG[k];
  var f = KIT.SPR[n]; if (!f || !KIT.sheetReady) return null; var P = SUPERPAL[key] || SUPERPAL.cumhead;
  var c = document.createElement('canvas'); c.width = f[2]; c.height = f[3]; var g = c.getContext('2d');
  g.drawImage(KIT.sheet, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]);
  var im = g.getImageData(0, 0, f[2], f[3]), d = im.data, C = P.map(function (h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; });
  for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var l = (d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15) / 255, q = l < 0.07 ? 0 : l < 0.3 ? 1 : l < 0.62 ? 2 : 3;
    d[i] = C[q][0]; d[i + 1] = C[q][1]; d[i + 2] = C[q][2]; }
  g.putImageData(im, 0, 0); return (SUPIMG[k] = c);
}
goldFrame = function (n) { return superImg(n, 'cumhead'); };

/* standing pictures and life icons for the HUD and Data Select */
function charIdle(C, t) { return C.kind === 'hom' ? 'h_' + C.breed + '_adult_idle' + (Math.floor(t * 3) % 2) : C.kind === 'gs' ? 'npc_greebo' : 'ch_idle' + (Math.floor(t * 6) % 7); }
function drawCharStand(C, x, y, t) {
  if (C.fol) drawFolStand(C.fol, x + 20, y, t);
  spr(charIdle(C, t), C.fol ? x - 6 : x, y, { anchor: 'b', sc: C.sc, flip: !!C.flipped });
}
function drawFolStand(b, x, y, t) { if (b === 'cat') spr('cat', x, y, { anchor: 'b' }); else spr('h_' + b + '_adult_idle' + (Math.floor(t * 3) % 2), x, y, { anchor: 'b', sc: 0.8 }); }
function drawCharIcon(C, x, y) {
  if (C.kind === 'hom') spr('h_' + C.breed + '_baby_idle0', x, y, { anchor: 'b' });
  else if (C.kind === 'gs') spr('npc_greebo', x, y, { anchor: 'b', sc: 0.42 });
  else spr('ch_icon0', x, y, { anchor: 'b', sc: 0.5 });
}
function drawLifeIcon(x, y) { var C = CHR(); if (C.kind === 'hom') spr('h_' + C.breed + '_baby_idle0', x, y, { sc: 1.1 }); else if (C.kind === 'gs') spr('npc_greebo', x, y, { sc: 0.5 }); else spr('ch_icon0', x, y, { sc: 0.7 }); }

/* ---------- the follower (a homunculus behind Cumhead, Sir Johnathan behind Greebo): Tails style, he runs where you ran
   a moment ago, bites foes he runs into (bosses too, now and then) and catches up from the sky if he is left behind */
var FOL = null;
function folReset() { var C = CHR(); FOL = C.fol ? { b: C.fol, hist: [], x: PL ? PL.x - 20 : 0, y: PL ? PL.y : 0, face: 1, sp: 0, air: false, dist: 0, fly: 0, bite: 0, rot: 0 } : null; }
function stepFollower(dt) {
  if (!FOL || !PL) return; var C = CHR(); if (!C.fol || C.fol !== FOL.b) { folReset(); if (!FOL) return; }
  var p = PL; FOL.hist.unshift({ x: p.x, y: p.y, face: p.face, air: p.air, sp: Math.abs(p.air ? p.vx : p.gsp), rot: p.loop ? p.rot : 0, dead: p.state === 'dead' });
  if (FOL.hist.length > 40) FOL.hist.length = 40;
  var h = FOL.hist[Math.min(FOL.hist.length - 1, 14)];
  var off = Math.hypot(h.x - FOL.x, h.y - FOL.y), onCam = FOL.x > CAM.x - 60 && FOL.x < CAM.x + KIT.W + 60 && FOL.y > CAM.y - 80 && FOL.y < CAM.y + KIT.H + 80;
  if (off > 220 || !onCam) { FOL.fly = 1; } // left behind (a checkpoint, a warp): he comes back down from the sky
  if (FOL.fly) { var tx = h.x - p.face * 18, ty = h.y; if (FOL.fly === 1) { FOL.x = CAM.x + (p.face > 0 ? -20 : KIT.W + 20); FOL.y = CAM.y - 30; FOL.fly = 2; }
    var dx = tx - FOL.x, dy = ty - FOL.y, m = Math.hypot(dx, dy) || 1, v = Math.min(m, 420 * dt); FOL.x += dx / m * v; FOL.y += dy / m * v; FOL.face = dx > 0 ? 1 : -1; FOL.air = true; FOL.sp = 0; FOL.rot = 0;
    if (m < 6) FOL.fly = 0; }
  else { var prevx = FOL.x; FOL.x = h.x; FOL.y = h.y; FOL.face = h.face; FOL.air = h.air; FOL.sp = h.sp; FOL.rot = h.rot; FOL.dist += Math.abs(FOL.x - prevx); }
  FOL.hide = h.dead;
  // bites: foes he touches, and the boss now and then
  if (FOL.bite > 0) FOL.bite -= dt;
  if (!FOL.hide && G.mode === 'play') {
    ENTS.forEach(function (e) { if (e.k === 'foe' && e.alive && !(e.hitT > 0) && Math.abs(e.x - FOL.x) < 14 && FOL.y > e.y - (e.h || 26) && FOL.y - 22 < e.y) { if (e.F.shield && Math.sign(FOL.x - e.x) === e.dir) return; hitFoe(e, 1); FOL.bite = 0.25; } });
    if (G.boss && G.boss.alive && FOL.bite <= 0 && typeof bossHitBy === 'function' && bossHitBy(FOL.x, FOL.y - 12)) { hitBoss(1); FOL.bite = 1.2; }
  }
}
function drawFollower(cx, cy) {
  if (!FOL || FOL.hide) return; var x = Math.round(FOL.x - cx), y = Math.round(FOL.y - cy), n, sc = 0.85;
  if (FOL.b === 'cat') { n = 'cat'; sc = 1; var hop = FOL.air ? 0 : (FOL.sp > 20 ? Math.abs(Math.sin((FOL.dist || 0) / 9)) * 3 : 0); y -= Math.round(hop); }
  else { var pre = 'h_' + FOL.b + '_adult_'; n = FOL.fly ? pre + 'jump' : FOL.air ? pre + 'jump' : FOL.sp < 8 ? pre + 'idle' + (Math.floor(G.t * 3) % 2) : pre + 'run' + (Math.floor((FOL.dist || 0) / 7) % 4); }
  if (FOL.fly && Math.random() < 0.5) FX.push({ k: 'bit', x: FOL.x, y: FOL.y - 4, vx: 0, vy: 40, t: 0.3, c: '#f1e7d0' });
  if (G.super) { var gf = superImg(n, FOL.b === 'cat' ? 'greebo' : FOL.b); if (gf) { var g = KIT.ctx; g.save(); g.translate(x, y + 1); if (FOL.rot) g.rotate(FOL.rot); if (FOL.face < 0) g.scale(-1, 1); g.drawImage(gf, -gf.width * sc / 2, -gf.height * sc, gf.width * sc, gf.height * sc); g.restore(); return; } }
  spr(n, x, y + 1, { flip: FOL.face < 0, rot: FOL.rot || 0, sc: sc });
}
(function () { // hook the follower into the act, the step and the drawing
  var bA = beginAct; beginAct = function (ai, fromCheck) { bA(ai, fromCheck); folReset(); };
  var sP = stepPlayer; stepPlayer = function (dt) { sP(dt); stepFollower(dt); };
  var dP = drawPlayer; drawPlayer = function (p, cx, cy) { drawFollower(cx, cy); dP(p, cx, cy); };
})();

/* ---------- finishing the game hatches the next homunculus (or opens Greebo & Sir Johnathan) ---------- */
function unlockFromEnding() {
  var C = CHR(), b = C.kind === 'hom' ? C.breed : C.kind === 'ch' && C.fol ? C.fol : null; if (!b) return null;
  if (b === 'blood') { if (SV.gs) return null; SV.gs = 1; persist(); refreshChars(); return 'GREEBO & SIR JOHNATHAN have joined you.'; }
  var nx = HOMORDER[HOMORDER.indexOf(b) + 1]; if (!nx || homOpen(nx)) return null;
  SV.homs.push(nx); persist(); refreshChars(); return 'A new homunculus has hatched: ' + HOMNAME[nx] + (nx === 'blood' ? ', the ultimate lifeform.' : '.');
}
(function () { var en = ending; ending = function () { var msg = unlockFromEnding(); en(); if (msg) { G.banner = 6; G.bannerTxt = msg; var m = document.querySelector('#menu .msub'); if (m) m.textContent = m.textContent + ' ' + msg; } }; })();
(function () { var ds = dataSelect; dataSelect = function () { refreshChars(); ds(); }; })();
