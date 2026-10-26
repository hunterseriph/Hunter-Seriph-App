/* =====================================================================================================
   THE CRIMSON MOON: a secret area. One illusion room in every new castle hides a portal in its alcove.
   Step through and you are somewhere else entirely, with its own rooms, foes and boss. A portal in the
   first room takes you back. The Crimson Moon can be fought once per heir and gives a big reward.
   ===================================================================================================== */
function usePortal(e) {
  var to = e.back ? WORLD.portalFrom : WORLD.moonEntry; if (!to) return;
  sfx.magic(); sfx.door(); G.fade = 0.5; G.shake = 6;
  enterRoom(to, null, null);
  var pe = L.ents.filter(function (q) { return q.k === 'portal'; })[0];
  if (pe) { P.x = pe.x + (e.back ? -24 : 30); P.y = pe.y; P.vx = 0; P.vy = 0; if (e.back) { P.y = 8 * T; } camSnap(); }
  poof(P.x, P.y - 16, 24, ['#ff2630', '#12040a', '#ffe36a']);
  if (!e.back && !META.seenMoon) { META.seenMoon = 1; saveMeta(); cutPlay({ focus: function () { return { x: P.x }; }, lines: [{ who: '', say: 'The portal spits you out under a moon that is far too close. Something up there is watching.', dur: 3.2 }] }); }
}
function drawPortal(e, cx) {
  var x = Math.round(e.x - cx), y = e.y, h = e.back ? 40 : 30, w = e.back ? 16 : 12;
  ctx.save(); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 14 + Math.sin(G.t * 5) * 4;
  ctx.fillStyle = '#12040a'; ctx.beginPath(); ctx.ellipse(x, y - h / 2 - 1, w + 3, h / 2 + 3, 0, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.ellipse(x, y - h / 2 - 1, w + 1, h / 2 + 1, 0, 0, 6.28); ctx.fill(); ctx.restore();
  for (var i = 0; i < 4; i++) { var k = 1 - i * 0.22; ctx.fillStyle = i % 2 ? '#c4121c' : '#12040a'; ctx.beginPath(); ctx.ellipse(x + Math.sin(G.t * 3 + i) * 1.5, y - h / 2 - 1, w * k, (h / 2) * k, Math.sin(G.t * 2 + i) * 0.2, 0, 6.28); ctx.fill(); }
  R(ctx, '#ffe36a', x - 1, y - h / 2 - 2, 2, 2);
  if (Math.random() < 0.3) parts.push({ x: e.x + (Math.random() - 0.5) * w * 2, y: y - Math.random() * h, vx: 0, vy: -30, life: 0.5, c: Math.random() < 0.5 ? '#ff2630' : '#ffe36a', spark: 1 });
}
/* the backdrop: a black sky with the moon itself hanging enormous behind everything */
function moonBack(gx) {
  ctx.fillStyle = '#0a0204'; ctx.fillRect(0, 0, VW, VH);
  for (var i = 0; i < 40; i++) { var sx = ((i * 97 + 13) % 503) - (gx * 0.04) % 503, sy = (i * 53) % 150; if (sx < 0) sx += 503; if (sx < VW) R(ctx, i % 3 ? '#5a1a20' : '#a6968f', Math.round(sx), sy, 1, 1); }
  var mx = Math.round(VW * 0.62 - gx * 0.03), my = 80; moon(mx, my, 64);
  ctx.fillStyle = 'rgba(58,4,8,0.6)'; [[-20, -18, 12], [24, 10, 16], [-8, 30, 9], [30, -30, 7]].forEach(function (c) { ctx.beginPath(); ctx.arc(mx + c[0], my + c[1], c[2], 0, 6.28); ctx.fill(); });
  ctx.fillStyle = '#0c0306'; var x0 = -((gx * 0.3) % 80) - 80; for (var x = x0; x < VW + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, VH); ctx.lineTo(x + 18, VH - 70); ctx.lineTo(x + 30, VH - 52); ctx.lineTo(x + 46, VH - 96); ctx.lineTo(x + 62, VH - 60); ctx.lineTo(x + 80, VH); ctx.fill(); }
}

/* ---------- the boss ---------- */
BOSSLINES.moon = ['SO SMALL. SO FAR FROM YOUR CASTLE.', 'LOOK UP, LITTLE DROP. I HAVE BEEN WATCHING EVERY HEIR.'];
var MOONFX = [];
BRAIN.moon = function (b, dt, W, ph) {
  var hx = clamp(P.x + Math.sin(b.t * 0.5) * 120, 90, W - 90), hy = 110 + Math.sin(b.t * 1.3) * 14;
  if (b.st === 'idle') {
    b.x += (hx - b.x) * Math.min(1, dt * 0.7); b.y += (hy - b.y) * Math.min(1, dt * 1.2); b.face = towardP(b); b.cd -= dt;
    if (b.cd <= 0) { var o = ['beams', 'meteors', 'ring', 'beams', 'slam']; if (ph === 2) o.push('eclipse', 'spawn'); b.st = o[Math.floor(Math.random() * o.length)]; if (b.st === 'spawn' && enemies.length >= 3) b.st = 'ring'; b.n = 0; b.t2 = 0.3; }
  } else if (b.st === 'beams') { // columns of moonlight: a red line warns where each will land
    b.t2 -= dt; if (b.t2 <= 0) { b.n++; b.t2 = ph === 2 ? 0.45 : 0.6; MOONFX.push({ k: 'beam', x: clamp(P.x + (Math.random() - 0.5) * 30, 20, W - 20), t: 0.75, dmg: b.dmg * 0.9 }); if (b.n >= (ph === 2 ? 5 : 3)) { b.st = 'idle'; b.cd = 1.4; } }
  } else if (b.st === 'meteors') {
    b.t2 -= dt; if (b.t2 <= 0) { b.n++; b.t2 = 0.22; var mx = clamp(P.x + (Math.random() - 0.5) * 260, 20, W - 20); MOONFX.push({ k: 'mark', x: mx, t: 0.7 }); eshots.push({ x: mx - 40, y: -60, vx: 40 / 0.75, vy: 290, life: 3, r: 7, dmg: b.dmg * 0.8, k: 'big', by: 'a falling meteor' }); if (b.n === 1) sfx.roar(); if (b.n >= (ph === 2 ? 9 : 6)) { b.st = 'idle'; b.cd = 1.3; } }
  } else if (b.st === 'ring') {
    b.t2 -= dt; if (b.t2 <= 0) { var nr = ph === 2 ? 18 : 14, off = Math.random(); for (var i = 0; i < nr; i++) bshot(b.x, b.y - b.h / 2, off + i / nr * Math.PI * 2, 120, b.dmg * 0.6, 'blob', b.d.name); sfx.fire(); b.n++; b.t2 = 0.8; if (b.n >= 2) { b.st = 'idle'; b.cd = 1.2; } }
  } else if (b.st === 'slam') {
    if (b.n === 0) { b.tx = P.x; b.n = 1; b.t2 = 0.6; }
    if (b.n === 1) { b.x += clamp(b.tx - b.x, -240 * dt, 240 * dt); b.y += (60 - b.y) * Math.min(1, dt * 3); b.t2 -= dt; if (b.t2 <= 0) { b.n = 2; b.vy = 0; } }
    else if (b.n === 2) { b.vy += 1500 * dt; b.y += b.vy * dt; if (b.y >= 15 * T) { b.y = 15 * T; b.n = 3; b.t2 = 0.7; G.shake = 14; sfx.land(); for (var q = -1; q <= 1; q += 2) waves.push({ x: b.x + q * 36, y: 15 * T, dir: q, life: 2.6, dmg: b.dmg * 0.8, by: b.d.name }); } }
    else { b.t2 -= dt; if (b.t2 < 0.4) b.y += (hy - b.y) * Math.min(1, dt * 2); if (b.t2 <= 0) { b.st = 'idle'; b.cd = 1.3; } }
  } else if (b.st === 'eclipse') { // the light goes out for a while and the moon shoots in the dark
    if (b.n === 0) { b.n = 1; G.eclipse = 4.5; sfx.roar(); G.banner = 1.2; G.bannerTxt = 'ECLIPSE'; G.bannerSub = ''; b.t2 = 0.6; }
    b.t2 -= dt; if (b.t2 <= 0) { b.t2 = 0.55; var a = Math.atan2((P.y - 18) - (b.y - b.h / 2), P.x - b.x); for (var k = -1; k <= 1; k++) bshot(b.x, b.y - b.h / 2, a + k * 0.2, 190, b.dmg * 0.6, 'blob', b.d.name); sfx.fire(); b.n++; if (b.n > 7) { b.st = 'idle'; b.cd = 1.2; } }
  } else if (b.st === 'spawn') {
    for (var s = 0; s < 2; s++) { var e = mkEnemy(s ? 'wraith' : 'gargoyle', clamp(b.x + (s ? 100 : -100), 60, W - 60), s ? 100 : T + 23, -1); if (!s) { e.bx = e.x; e.by = e.y; } enemies.push(e); poof(e.x, e.y - 10, 12, ['#ff2630', '#12040a']); }
    sfx.roar(); b.st = 'idle'; b.cd = 1.6;
  }
};
function moonFxStep(dt) {
  if (G.eclipse > 0) G.eclipse -= dt;
  MOONFX.forEach(function (f) {
    f.t -= dt;
    if (f.k === 'beam' && f.t <= 0 && !f.hit) { f.hit = 1; f.show = 0.3; G.shake = Math.max(G.shake, 6); sfx.fire(); if (P.state !== 'dead' && Math.abs(P.x - f.x) < 15) hurtP(f.dmg, f.x, 'moonlight'); poof(f.x, 15 * T - 2, 12, ['#ff2630', '#ffe36a', '#ffffff']); }
    if (f.hit) f.show -= dt;
  });
  MOONFX = MOONFX.filter(function (f) { return f.k === 'beam' ? !(f.hit && f.show <= 0) : f.t > 0; });
}
function drawMoonFx(cx) {
  MOONFX.forEach(function (f) {
    var x = Math.round(f.x - cx), gy = 15 * T;
    if (f.k === 'mark') { R(ctx, Math.floor(G.t * 12) % 2 ? '#ffe36a' : '#ff2630', x - 8, gy - 2, 16, 2); }
    else if (!f.hit) { var on = Math.floor(G.t * (f.t < 0.3 ? 16 : 8)) % 2; R(ctx, on ? '#ff2630' : '#5a0a10', x - 1, 0, 2, gy); R(ctx, '#ffe36a', x - 10, gy - 2, 20, 2); }
    else { ctx.save(); ctx.globalAlpha = Math.max(0, f.show / 0.3); ctx.shadowColor = '#ff2630'; ctx.shadowBlur = 16; R(ctx, '#ff2630', x - 12, 0, 24, gy); R(ctx, '#ffd0d0', x - 5, 0, 10, gy); ctx.restore(); }
  });
  if (G.eclipse > 0 && L.arena === 'moon') { ctx.fillStyle = 'rgba(2,0,1,' + Math.min(0.8, G.eclipse * 0.6).toFixed(2) + ')'; ctx.fillRect(0, -40, VW, VH + 80); }
}
function moonDown(b) { // the reward: a pile of drops and two powerups. Not a seal; once per heir.
  RUN.moonDown = 1; META.moonWins = (META.moonWins || 0) + 1; saveMeta();
  G.lock = false; G.layer = null; MOONFX = []; G.eclipse = 0; sfx.goal();
  RUN.drops += 900 * (1 + 0.3 * META.ng);
  var pw = shuffle(POWERS.slice()); grantPower(pw[0].id); RUN.powers.push(pw[1].id); ST = calcStats();
  G.banner = 3.2; G.bannerTxt = 'THE CRIMSON MOON FALLS'; G.bannerSub = pw[0].name.toUpperCase() + ' AND ' + pw[1].name.toUpperCase();
  saveRun();
}
