/* ---------- Data Select: save slots like Sonic 3 & Knuckles (his ask, because more characters are coming) ----------
   NO SAVE, six save slots and the ERASE box in a row. A slot keeps the character, the act you reached (saved at the start
   of every act), lives, score and the Cum Chalices of that game. A cleared slot (and NO SAVE once a zone is reached) picks
   any zone with up/down; a new slot picks the character with up/down. Saves: 'hog-slots'. */
var HOGCHARS = [{ id: 'cumhead', name: 'CUMHEAD', idle: 'ch_idle', icon: 'ch_icon0' }]; // more characters go here
var NSLOT = 16, SLOTS = KIT.load('hog-slots', null); // 16 saves (he asked for way more: there are lots of homunculi to play through)
if (!SLOTS) { // the old single save becomes save 1
  SLOTS = []; for (var si0 = 0; si0 < NSLOT; si0++) SLOTS.push(null);
  if (SV.reached > 0 || chalCount() || SV.done) SLOTS[0] = { ch: 'cumhead', ai: Math.min(ACTS.length - 1, (SV.reached || 0) * 2), lives: 3, score: 0, chal: SV.chal.slice(), done: SV.done ? 1 : 0, zone: 0 };
  KIT.save('hog-slots', SLOTS);
}
if (SLOTS.length < NSLOT) { while (SLOTS.length < NSLOT) SLOTS.push(null); KIT.save('hog-slots', SLOTS); }
G.slot = -1;
function saveSlots() { KIT.save('hog-slots', SLOTS); }
function slotSaveAct() { // called at the start of every act (not when coming back from a checkpoint)
  var s = SLOTS[G.slot]; if (G.slot < 0 || !s) return;
  s.ai = G.ai; s.lives = Math.max(0, G.lives); s.score = G.score; s.chal = SV.chal.slice(); saveSlots();
}
/* each special stage gateway works once per game (his ask: restarting the act to try again was an exploit); the used ones
   are kept in the slot (s.gates) or, on NO SAVE, for the game being played (G.gates); key = act and the gateway's column */
function gateList() { var s = G.slot >= 0 && SLOTS[G.slot]; if (s) return s.gates || (s.gates = []); return G.gates || (G.gates = []); }
function gateKey(e) { return G.ai + ':' + Math.round(e.x0); }
function gateUsed(e) { return gateList().indexOf(gateKey(e)) >= 0; }
function useGate(e) { var l = gateList(), k = gateKey(e); if (l.indexOf(k) < 0) { l.push(k); saveSlots(); } }
function charOf(id) { for (var i = 0; i < HOGCHARS.length; i++) if (HOGCHARS[i].id === id) return HOGCHARS[i]; return HOGCHARS[0]; }

var DS = { ci: 1, sx: 0, t: 0, erase: false, pick: {} };
function dataSelect() {
  for (var pk in DS.pick) if (pk.charAt(0) !== 'c' && pk !== '0') delete DS.pick[pk]; // slots show where you left them
  KIT.closeMenu(); document.documentElement.classList.add('hs-menu'); G.mode = 'data'; DS.t = 0; // the touch pad hides: tap a panel to pick it, tap again to start DS.erase = false; music.play('hogtitle');
  if (DS.ci < 0 || DS.ci > NSLOT + 1) DS.ci = 1;
}
function dsPanels() { return NSLOT + 2; } // 0 = no save, 1..6 = slots, 7 = erase
function dsZones(i) { var s = SLOTS[i - 1]; return i === 0 ? (SV.reached || 0) : s && s.done ? ZONES.length - 1 : 0; }
function dsGo(i) {
  if (i === NSLOT + 1) { DS.erase = !DS.erase; if (DS.erase && DS.ci === NSLOT + 1) DS.ci = 1; sfx.play('clink'); return; }
  if (DS.erase) { var e = SLOTS[i - 1]; if (i < 1 || !e) { sfx.play('bump'); return; }
    KIT.confirm({ title: 'Erase save ' + i + '?', sub: 'It cannot be brought back.', yesLabel: 'Erase', noLabel: 'Keep', yes: function () { SLOTS[i - 1] = null; saveSlots(); KIT.closeMenu(); sfx.play('crumble'); DS.erase = false; }, no: function () { KIT.closeMenu(); } }); return; }
  var z = DS.pick[i] || 0; sfx.play('check'); if (i >= 1 && SLOTS[i - 1]) SLOTS[i - 1].gates = SLOTS[i - 1].gates || [];
  if (i === 0) { G.slot = -1; G.ch = 'cumhead'; newGame(Math.min(z, SV.reached || 0)); return; }
  var s = SLOTS[i - 1];
  if (!s) { s = SLOTS[i - 1] = { ch: HOGCHARS[(DS.pick['c' + i] || 0) % HOGCHARS.length].id, ai: 0, lives: 3, score: 0, chal: [], done: 0 }; saveSlots(); }
  G.slot = i - 1; SV.chal = (s.chal || []).slice(); G.lives = s.lives > 0 ? s.lives : 3; G.score = s.score || 0; G.kills = 0; G.super = 0; G.ch = s.ch;
  beginAct(s.done && DS.pick[i] != null && DS.pick[i] !== ACTS[s.ai].z ? Math.min(DS.pick[i], ZONES.length - 1) * 2 : s.ai); // a save goes back to the exact act you left (a cleared one too, unless you pick another zone)
}
function dsGeom() { var W = KIT.W, pw = 116, gap = 12, tot = dsPanels() * (pw + gap) - gap + 32; return { pw: pw, gap: gap, ph: 186, y: 58, tot: tot, x0: 16 }; }
function dsZoneStep(i, d) { var s = i >= 1 && i <= NSLOT ? SLOTS[i - 1] : null, mz = dsZones(i); if (mz <= 0) return false;
  if (DS.pick[i] == null && s) DS.pick[i] = ACTS[s.ai].z; DS.pick[i] = ((DS.pick[i] || 0) + d + mz + 1) % (mz + 1); sfx.play('clink'); return true; }
function dsCharStep(i, d) { DS.pick['c' + i] = ((DS.pick['c' + i] || 0) + d + HOGCHARS.length) % HOGCHARS.length; sfx.play('clink'); }
/* on a touch screen there is no up/down (he spotted it): the picked panel shows arrow buttons either side of its zone
   picture (and of the character on a new save when there is more than one) to tap through them */
function dsArrows(i) { var Gm = dsGeom(), x = Math.round(Gm.x0 + i * (Gm.pw + Gm.gap) - DS.sx), s = i >= 1 && i <= NSLOT ? SLOTS[i - 1] : null, out = [];
  if (i <= NSLOT && dsZones(i) > 0 && (i === 0 || s)) { var by = Gm.y + 22; out.push({ x: x - 6, y: by + 12, w: 22, h: 38, d: -1, k: 'z' }, { x: x + Gm.pw - 16, y: by + 12, w: 22, h: 38, d: 1, k: 'z' }); }
  if (i >= 1 && i <= NSLOT && !s && HOGCHARS.length > 1) out.push({ x: x - 6, y: Gm.y + 100, w: 22, h: 38, d: -1, k: 'c' }, { x: x + Gm.pw - 16, y: Gm.y + 100, w: 22, h: 38, d: 1, k: 'c' });
  return out; }
function stepData(dt) {
  DS.t += dt; if (KIT.menuOpen()) return;
  var n = dsPanels(), lo = DS.erase ? 1 : 0, hi = DS.erase ? NSLOT + 1 : n - 1;
  if (KIT.pressed('right')) { DS.ci = Math.min(hi, DS.ci + 1); sfx.play('clink'); }
  if (KIT.pressed('left')) { DS.ci = Math.max(lo, DS.ci - 1); sfx.play('clink'); }
  var i = DS.ci, s = i >= 1 && i <= NSLOT ? SLOTS[i - 1] : null;
  if ((KIT.pressed('up') || KIT.pressed('down')) && !DS.erase) { var d = KIT.pressed('up') ? 1 : -1;
    if (i >= 1 && i <= NSLOT && !s && HOGCHARS.length > 1) { DS.pick['c' + i] = ((DS.pick['c' + i] || 0) + d + HOGCHARS.length) % HOGCHARS.length; sfx.play('clink'); }
    else dsZoneStep(i, d); }
  if (KIT.pressed('a') || KIT.pressed('start')) dsGo(i);
  else if (KIT.pressed('b')) { if (DS.erase) DS.erase = false; else titleMenu(); }
  // taps: tap a panel to pick it, tap it again to open it
  var hitA = false; if (KIT.ptr.tap && !DS.erase) dsArrows(DS.ci).forEach(function (a) { if (!hitA && KIT.ptr.x >= a.x && KIT.ptr.x < a.x + a.w && KIT.ptr.y >= a.y && KIT.ptr.y < a.y + a.h) { hitA = true; if (a.k === 'z') dsZoneStep(DS.ci, a.d); else dsCharStep(DS.ci, a.d); } });
  if (KIT.ptr.tap && !hitA) { var G2 = dsGeom(); for (var k = 0; k < n; k++) { var px = G2.x0 + k * (G2.pw + G2.gap) - DS.sx; if (KIT.ptr.x >= px && KIT.ptr.x < px + G2.pw && KIT.ptr.y >= G2.y && KIT.ptr.y < G2.y + G2.ph) { if (k === DS.ci) dsGo(k); else if (!(DS.erase && k === 0)) { DS.ci = k; sfx.play('clink'); } } } }
  var Gm = dsGeom(), want = Gm.x0 + DS.ci * (Gm.pw + Gm.gap) + Gm.pw / 2 - KIT.W / 2; want = Math.max(0, Math.min(Gm.tot - KIT.W, want)); DS.sx += (want - DS.sx) * Math.min(1, dt * 10);
}
function dsZonePic(g, zi, x, y, w, h) { // a little window onto the zone: its sky in bands and its painted far layer
  var Z = ZONES[zi]; for (var b = 0; b < 4; b++) { R(Z.sky[Math.min(Z.sky.length - 1, b >> 1)], x, y + b * h / 4, w, h / 4 + 1); }
  var im = Z.id === 'city' ? HOGIM.skyline : HOGBK[Z.id + '_far'];
  if (imgOk(im)) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); var sc = Z.id === 'city' ? h * 0.9 / im.naturalHeight : h * 1.5 / im.naturalHeight; g.imageSmoothingEnabled = false; g.drawImage(im, (zi * 137) % 300, 0, w / sc, im.naturalHeight, x, y + h - im.naturalHeight * sc * (Z.id === 'city' ? 1 : 0.62), w, im.naturalHeight * sc); g.restore(); }
}
function drawData() {
  var g = KIT.ctx, W = KIT.W, H = KIT.H, Gm = dsGeom(), t = DS.t;
  skyBands(g, ['#0a0204', '#16050a', '#24080e', '#36101a'], W, H);
  for (var k = 0; k < 40; k++) { var sx = ((k * 83 - t * 12) % W + W) % W, sy = (k * 47) % (H * 0.3); g.fillStyle = k % 3 ? '#4a1a1c' : '#c4121c'; g.fillRect(sx, sy, 1, 1); } // embers drifting
  g.fillStyle = '#c4121c'; g.beginPath(); g.arc(W * 0.62, 26, 16, 0, 6.3); g.fill(); g.fillStyle = '#8a0a14'; g.beginPath(); g.arc(W * 0.62 + 5, 22, 5, 0, 6.3); g.fill(); // his red moon
  text(DS.erase ? 'ERASE WHICH SAVE?' : 'DATA SELECT', 18, 14, { size: 22, col: DS.erase ? '#ff2630' : '#f1e7d0', font: 'title', outline: true });
  for (var i = 0; i < dsPanels(); i++) {
    var x = Math.round(Gm.x0 + i * (Gm.pw + Gm.gap) - DS.sx), y = Gm.y, pw = Gm.pw, ph = Gm.ph, on = i === DS.ci, s = i >= 1 && i <= NSLOT ? SLOTS[i - 1] : null;
    if (x > W + 4 || x + pw < -4) continue;
    if (on && DS.erase && i <= NSLOT) x += Math.round(Math.sin(t * 40) * 2);
    R('#12040a', x - 2, y - 2, pw + 4, ph + 4); R(on ? (Math.floor(t * 4) % 2 ? '#ff2630' : '#c4121c') : '#4a1a1c', x - 1, y - 1, pw + 2, ph + 2); R('#0e0708', x, y, pw, ph);
    R(on ? '#c4121c' : '#2a0c12', x, y, pw, 16); text(i === 0 ? 'NO SAVE' : i === NSLOT + 1 ? 'ERASE' : 'SAVE ' + i, x + pw / 2, y + 4, { size: 7, align: 'center', col: '#f1e7d0' });
    var bx = x + 8, by = y + 22, bw = pw - 16, bh = 62; R('#12040a', bx - 1, by - 1, bw + 2, bh + 2);
    if (i === NSLOT + 1) { // the erase box: a coffin lid with a red X
      R('#2a0c12', bx, by, bw, bh); g.fillStyle = '#4a1a1c'; g.beginPath(); g.moveTo(bx + bw * 0.3, by + 4); g.lineTo(bx + bw * 0.7, by + 4); g.lineTo(bx + bw * 0.82, by + 20); g.lineTo(bx + bw * 0.66, by + bh - 4); g.lineTo(bx + bw * 0.34, by + bh - 4); g.lineTo(bx + bw * 0.18, by + 20); g.fill();
      g.strokeStyle = '#ff2630'; g.lineWidth = 4; g.beginPath(); g.moveTo(bx + bw * 0.36, by + 16); g.lineTo(bx + bw * 0.64, by + bh - 16); g.moveTo(bx + bw * 0.64, by + 16); g.lineTo(bx + bw * 0.36, by + bh - 16); g.stroke();
      text(DS.erase ? 'PICK A SAVE, B: STOP' : 'A TO ERASE A SAVE', x + pw / 2, y + 100, { size: 6, align: 'center', col: '#a6968f' }); continue; }
    var zi = 0, act = 1, clear = s && s.done;
    if (i === 0) zi = Math.min(DS.pick[0] || 0, SV.reached || 0); else if (s) { var own = !clear || DS.pick[i] == null || DS.pick[i] === ACTS[s.ai].z; zi = own ? ACTS[s.ai].z : Math.min(DS.pick[i], ZONES.length - 1); act = own ? ACTS[s.ai].act : 1; }
    if (i >= 1 && !s) { // a new slot: static on the screen
      for (var ny = 0; ny < bh; ny += 2) for (var nx = 0; nx < bw; nx += 2) { var v = (Math.sin(nx * 12.9898 + ny * 78.233 + Math.floor(t * 20) * 3.1) * 43758.5) % 1; v = v < 0 ? -v : v; g.fillStyle = v < 0.5 ? '#1e0a10' : v < 0.85 ? '#3a1a22' : '#6a3a44'; g.fillRect(bx + nx, by + ny, 2, 2); }
      text('NEW', x + pw / 2, by + bh / 2 - 8, { size: 16, align: 'center', col: '#f1e7d0', font: 'title', outline: true }); }
    else { dsZonePic(g, zi, bx, by, bw, bh); R('rgba(7,4,5,0.55)', bx, by + bh - 16, bw, 16); text(ZONES[zi].name, x + pw / 2, by + bh - 13, { size: 5, align: 'center', col: '#ffe36a' });
      if (!clear && i > 0) text('ACT ' + act, x + pw / 2, by + 4, { size: 6, align: 'center', col: '#f1e7d0', outline: true });
      if (clear) { var a2 = Math.floor(t * 3) % 2; text('CLEAR', x + pw / 2, by + 6, { size: 14, align: 'center', col: a2 ? '#ffe36a' : '#f1e7d0', font: 'title', outline: true }); }
    }
    // the character, standing on the panel
    var C = i === 0 ? charDef('cumhead') : charOf(s ? s.ch : HOGCHARS[(DS.pick['c' + i] || 0) % HOGCHARS.length].id);
    drawCharStand(C, x + pw / 2, y + 140, t + i * 0.3);
    text(i === 0 ? 'ANY ZONE YOU HAVE REACHED' : C.name, x + pw / 2, y + 147, { size: i === 0 || C.name.length > 15 ? 4 : 6, align: 'center', col: '#f1e7d0' });
    var AB = i > 0 && typeof HOMAB !== 'undefined' ? HOMAB[C.kind === 'hom' ? C.breed : C.fol] : null; if (AB) text(C.kind === 'hom' ? 'B ' + AB.b + ' · ' + AB.p : 'FOLLOWER: ' + AB.b, x + pw / 2, y + 154, { size: 4, align: 'center', col: '#ffe36a', max: pw - 6 }); // what this one does (9e-homs.js)
    if (on && !DS.erase) dsArrows(i).forEach(function (a) { var cx = a.x + a.w / 2, cy = a.y + a.h / 2, pulse = Math.floor(t * 3) % 2;
      R('#12040a', a.x, a.y, a.w, a.h); R(pulse ? '#c4121c' : '#8a0a14', a.x + 1, a.y + 1, a.w - 2, a.h - 2); g.fillStyle = '#ffe36a'; g.beginPath(); g.moveTo(cx + a.d * 6, cy); g.lineTo(cx - a.d * 4, cy - 8); g.lineTo(cx - a.d * 4, cy + 8); g.fill(); });
    if (s) { drawCharIcon(C, x + 14, y + 168); text('x' + s.lives, x + 22, y + 160, { size: 6, col: '#f1e7d0' });
      var ch = s.chal || []; for (var c = 0; c < 7; c++) spr('hog_chal' + c, x + 56 + c * 8, y + 168, { sc: 0.5, alpha: ch[c] ? 1 : 0.2, anchor: 'b' });
      text(String(s.score || 0), x + pw - 6, y + 174, { size: 5, align: 'right', col: '#a6968f' }); }
  }
  text('TAP OR LEFT / RIGHT TO PICK   ARROWS OR UP / DOWN: ZONE OR CHARACTER   A START   B BACK', W / 2, H - 14, { size: 5, align: 'center', col: '#a6968f' });
}
