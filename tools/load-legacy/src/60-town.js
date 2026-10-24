/* =====================================================================================================
   TOWN: Clubhouse Row. Walk the street, step up to a building and press B. Empty lots can be bought.
   The castle gate is in the middle of the street, shops either side.
   ===================================================================================================== */
var TOWN = null, BLD_X0 = 100, BLD_GAP = 124; // a tighter street than before
function buildTown() {
  // the castle gate stands in the middle of the street, with shops on both sides of it, so nothing is far away
  var n = BUILDINGS.length, half = Math.ceil(n / 2), gateX = BLD_X0 + half * BLD_GAP + 70, last = gateX + 140 + (n - half - 1) * BLD_GAP, W = Math.ceil((last + 110) / T), H = CH, tl = new Uint8Array(W * H);
  for (var x = 0; x < W; x++) tl[(H - 1) * W + x] = TW;
  for (var y = 0; y < H; y++) { tl[y * W] = TW; tl[y * W + W - 1] = TW; }
  var ents = BUILDINGS.map(function (b, i) { return { k: 'bld', b: b, x: i < half ? BLD_X0 + i * BLD_GAP : gateX + 140 + (i - half) * BLD_GAP, y: 15 * T }; });
  ents.push({ k: 'gate', x: gateX, y: 15 * T });
  return { w: W, h: H, tiles: tl, ents: ents, town: true, gateX: gateX };
}
function townStats() {
  var cls = townHeir(), c = CLASSES[cls];
  return { mhp: 1, mmana: 1, manaRegen: 0, regen: 0, spd: c.spd * 1.15, jumps: c.jumps, grav: 1, small: cls === 'homunculus', dmg: 0, crit: 0, iframes: 1, arm: 0, foeDmg: 1, takeMul: 1, foeHp: 1, dropMul: 1, atkMul: 1 };
}
function goTown(first) {
  clearRun(); RUN = null; G.mode = 'town'; G.lock = false; G.layer = null; L = TOWN = buildTown(); ST = townStats();
  enemies = []; pshots = []; eshots = []; drops = []; parts = []; pops = []; fx = []; bosses = []; waves = [];
  var cls = townHeir(); P = {}; RUN = null; newPlayer(); P.cls = cls; P.w = ST.small ? 10 : 12; P.h = ST.small ? 28 : 36;
  P.x = TOWN.gateX - 70; P.y = 15 * T; P.face = first ? 1 : -1; camSnapTown();
  G.banner = 2.6; G.bannerTxt = 'Clubhouse Row'; G.bannerSub = 'BANK  ' + fmtN(META.bank) + ' DROPS';
  music.play('town'); saveMeta();
  if (cls === 'homunculus' && !META.nextHom) { var hb = TOWN.ents.filter(function (e) { return e.k === 'bld' && e.b.id === 'hatch'; })[0]; if (hb) { P.x = hb.x; camSnapTown(); P.thatch = 2.2; G.banner = 0; } } // a Homunculus heir hatches here first
  if (!META.seenTown) { META.seenTown = 1; saveMeta(); toast('THE CASTLE GATE IS RIGHT HERE. SPEND DROPS IN TOWN BETWEEN HEIRS.'); }
}
function camSnapTown() { G.cam.x = clamp(P.x - VW / 2, 0, TOWN.w * T - VW); G.cam.y = 0; }
function townNear() {
  var best = null, bd = 1e9;
  TOWN.ents.forEach(function (e) { var r = e.k === 'gate' ? 60 : e.k === 'st' || e.k === 'exit' ? 22 : 50, dx = Math.abs(e.x - P.x); if (dx < r && dx < bd) { bd = dx; best = e; } });
  return best;
}
function stepTown(dt) {
  if (tollStep(dt)) { updateFx(dt); return; }
  if (townHatch(dt)) { updateFx(dt); return; }
  var dir = (input.r ? 1 : 0) - (input.l ? 1 : 0), jumpPressed = input.j && !P.prevJump, atkPressed = input.a && !P.prevAtk; P.prevJump = input.j; P.prevAtk = input.a; P.prevSpec = input.s;
  if (P.jumpStartT > 0) P.jumpStartT -= dt;
  var mx = MAXV * ST.spd, sgn = P.vx > 0 ? 1 : (P.vx < 0 ? -1 : 0);
  if (dir !== 0) { P.vx += dir * ((sgn !== 0 && sgn !== dir) ? BRAKE : (P.onGround ? ACC : AIRACC)) * dt; if (Math.abs(P.vx) > mx) P.vx = dir * mx; P.face = dir; }
  else { var f = Math.min(Math.abs(P.vx), (P.onGround ? DEC : 70) * dt); P.vx -= sgn * f; }
  if (P.onGround) { P.coyote = 0.09; P.jumps = 0; } else P.coyote -= dt;
  if (jumpPressed) P.jumpBuf = 0.1; else P.jumpBuf -= dt;
  if (P.jumpBuf > 0 && P.coyote > 0) { sfx.jump(); P.vy = -JUMPV; P.coyote = 0; P.jumpBuf = 0; P.jumps = 1; P.jumpHeld = true; P.jumpStartT = 0.07; }
  else if (P.jumpBuf > 0 && !P.onGround && P.jumps < ST.jumps) { if (!P.jumps) P.jumps = 1; sfx.dbl(); P.vy = -JUMP2; P.jumpBuf = 0; P.jumps++; P.jumpHeld = true; P.jumpStartT = 0.07; }
  if (P.jumpHeld && !input.j && P.vy < -JCUT) { P.vy = -JCUT; P.jumpHeld = false; }
  moveBody(P, dt, GRAV);
  var sp = Math.abs(P.vx); if (P.onGround) P.anim += dt * (sp < 115 ? 4 + sp / 10 : sp * 0.154); if (sp < 10) P.idleT += dt; else P.idleT = 0;
  if (P.onGround && sp > 20) { var sf = Math.floor(P.anim * (sp < 115 ? 1 : 0.5)); if (sf !== P.lsf) { P.lsf = sf; sfx.step(G.t); } }
  P.x = clamp(P.x, 24, TOWN.w * T - 24);
  G.near = townNear();
  if (atkPressed && G.near) openBuilding(G.near);
  G.cam.x += (clamp(P.x - VW / 2 + P.face * 30, 0, TOWN.w * T - VW) - G.cam.x) * Math.min(1, dt * 6);
  updateFx(dt);
}
