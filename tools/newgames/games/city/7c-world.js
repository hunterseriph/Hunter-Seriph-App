/* ---------- everything else in the world: doors and uses, stunt jumps, street races, the Lost Loads (hidden packages),
   the long mystery, world events, garages, the haunted asylum, the dungeons and the sewers, drink and drugs ---------- */
var RNG = srand(4242);
/* ---------- stunt jumps: ramps at the side of long straight roads, on the river banks and the beach ---------- */
var STUNTS = (function () {
  var L = [], used = []; RE.slice().sort(function (a, b) { return hash2(a.i, 1, 3) - hash2(b.i, 1, 3); }).forEach(function (E) { if (L.length >= 18 || E.len < 90 || E.pts.length > 2) return; var p = edgeAt(E, E.len * 0.5, false, E.w / 2 + 3.5); if (isWaterK(kAt(p.x, p.z)) || used.some(function (u) { return Math.hypot(u.x - p.x, u.z - p.z) < 260; })) return;
    var k = kAt(p.x, p.z); if (k === K_BRIDGE) return; used.push(p); L.push({ id: 's' + L.length, x: p.x, z: p.z, a: p.a, y: groundY(p.x, p.z), name: districtName(p.x, p.z) }); });
  return L;
})();
function buildRamps() { STUNTS.forEach(function (s) { if (s.mesh) return; var m = M(), len = 9, w = 3.4, h = 2.4, c = Math.cos(s.a), sn = Math.sin(s.a); function Pt(u, v, y) { return [s.x + sn * v + c * u, s.y + y, s.z + Math.cos(s.a) * v - sn * u]; }
    m.quad(Pt(-w / 2, -len / 2, 0), Pt(w / 2, -len / 2, 0), Pt(w / 2, len / 2, h), Pt(-w / 2, len / 2, h), uvR(1, 3), TL('stripes'), [0.55, 0.55, 0.55], [0, 0.97, -0.25]);
    m.quad(Pt(w / 2, len / 2, 0), Pt(-w / 2, len / 2, 0), Pt(-w / 2, len / 2, h), Pt(w / 2, len / 2, h), uvR(1, 1), TL('metal'), lit([sn, 0, Math.cos(s.a)]), [sn, 0, Math.cos(s.a)]);
    [-1, 1].forEach(function (q) { m.tri(Pt(q * w / 2, -len / 2, 0), Pt(q * w / 2, len / 2, 0), Pt(q * w / 2, len / 2, h), [0, 1, 1, 1, 1, 0], TL('metal'), lit([c * q, 0, -sn * q]), [c * q, 0, -sn * q]); });
    s.mesh = m.upload();
    var b = addBox(s.x - 6, s.z - 6, s.x + 6, s.z + 6, s.y - 1, s.y + h, { ramp: s }); b.y1 = -999; b.ramp = function (x, z) { var dx = x - s.x, dz = z - s.z, v = dx * sn + dz * Math.cos(s.a), u = dx * c - dz * sn; if (Math.abs(u) > w / 2 || v < -len / 2 || v > len / 2) return -99; return s.y + (v + len / 2) / len * h; }; s.box = b; }); }
function stuntLanded(v) { var near = STUNTS.filter(function (s) { return dist2(s.x, s.z, G.lastRampX || -999, G.lastRampZ || -999) < 400; })[0]; var air = v.airT || 0;
  if (near && air > 0.9) { var first = !SV.stuntsDone[near.id], cash = first ? 500 + Math.round(air * 200) : Math.round(air * 50); SV.stuntsDone[near.id] = 1; SV.stats.stunts++; money(cash); bigText(first ? 'UNIQUE STUNT JUMP!' : 'STUNT JUMP', Math.round(air * 10) / 10 + ' s in the air · $' + cash, '#ffe36a', 3); sfx.play('win'); if (MS) MS.stuntCount = (MS.stuntCount || 0) + 1; G.lastRampX = -999; }
  else if (air > 1.5) { money(50); toast('Big air: $50'); } }
function stuntBonus(k) { if (k === 'splat') { G.splats = (G.splats || 0) + 1; } }
/* ---------- street races: checkpoints along the roads, three rivals ---------- */
var RACES = (function () {
  var spots = [['Clubhouse Row Sprint', 'dist:club', 12], ['Red Light Run', 'dist:red', 14], ['Coast Ring', 'poi:pierend', 18], ['Castle Climb', 'poi:castle:Cumhead\'s Castle', 14], ['Isles Dash', 'poi:sanctum', 10], ['Airport Drag', 'poi:terminal', 10], ['Blood Factory Loop', 'dist:factory', 14], ['Cemetery Gates', 'poi:chapel', 12]];
  var rr = srand(77); return spots.map(function (sp, i) { var c = placeOf(sp[1]); if (!c) return null; var r = nearestRoad(c.x, c.z, 120); if (!r) return null; var E = r.E, back = false, s = r.s, pts = [], prevA = null;
    for (var k = 0; k < sp[2]; k++) { s += 70; var g = 0; while (s > E.len && g < 10) { g++; s -= E.len; var nd = RN[back ? E.a : E.b], opts = nd.e.filter(function (e) { return e !== E.i; }); if (!opts.length) { back = !back; continue; } var best = opts[Math.floor(rr() * opts.length)]; E = RE[best]; back = E.b === nd.i; } var p = edgeAt(E, Math.min(s, E.len), back, 0); pts.push({ x: p.x, z: p.z }); }
    var st = edgeAt(r.E, r.s, false, 0); return { id: 'r' + i, name: sp[0], x: st.x, z: st.z, a: st.a, pts: pts, prize: 800 + i * 250 }; }).filter(Boolean);
})();
var RACE = null;
function startRace(R0) {
  KIT.closeMenu(); if (P.state !== 'car' || !P.veh || P.veh.t.cls === 'heli' || P.veh.t.cls === 'plane' || P.veh.t.cls === 'boat') { toast('You need a car or a bike for a street race.'); return; }
  RACE = { R: R0, cp: 0, t: 0, count: 3.5, rivals: [] }; var v = P.veh; v.x = R0.x; v.z = R0.z; v.a = R0.a; v.vx = v.vz = 0; v.sp = 0; v.y = groundY(v.x, v.z); CAM.yaw = v.a; CAM.snap = 1;
  ['sports', 'muscle', 'moto'].forEach(function (ty, i) { var o = edgeAt(nearestRoad(R0.x, R0.z, 40).E, 0, false, 0), rv = makeVeh(ty, R0.x + Math.cos(R0.a) * (i - 1) * 3.2 - Math.sin(R0.a) * (i + 1) * 3, R0.z - Math.sin(R0.a) * (i - 1) * 3.2 - Math.cos(R0.a) * (i + 1) * 3, R0.a, { col: i }); rv.ai = { race: 1 }; rv.keep = 1; var d = makePed({ x: rv.x, z: rv.z, who: pick(['saba', 'amy', 'joff', 't', 'lab', 'bonjo']), keep: 1 }); d.rig = rigOf(d.who); d.inVeh = rv; rv.driver = d; RACE.rivals.push({ v: rv, cp: 0 }); });
  bigText(R0.name, 'First past ' + R0.pts.length + ' checkpoints wins $' + R0.prize, '#4adfff', 3);
}
function stepRace(dt) {
  var Rr = RACE; if (!Rr) return; if (!P.veh) { endRace(false, 'You left your car.'); return; }
  if (Rr.count > 0) { Rr.count -= dt; P.veh.vx = P.veh.vz = 0; P.veh.sp = 0; G.objective = Rr.count > 0.5 ? String(Math.ceil(Rr.count - 0.5)) : 'GO!'; return; }
  Rr.t += dt; G.timer = null; var cp = Rr.R.pts[Rr.cp]; G.objective = 'Checkpoint ' + (Rr.cp + 1) + ' of ' + Rr.R.pts.length; G.mission = G.mission || null; G.raceMark = cp;
  if (Math.hypot(P.veh.x - cp.x, P.veh.z - cp.z) < 12) { Rr.cp++; sfx.play('coin'); if (Rr.cp >= Rr.R.pts.length) { var place = 1 + Rr.rivals.filter(function (r) { return r.done; }).length; endRace(place === 1, place === 1 ? 'You won!' : 'You came ' + ['first', 'second', 'third', 'fourth'][place - 1] + '.'); return; } }
  Rr.rivals.forEach(function (r) { if (r.done) return; var c = Rr.R.pts[r.cp]; if (!c) { r.done = 1; return; } raceAI(r.v, c, dt); if (Math.hypot(r.v.x - c.x, r.v.z - c.z) < 14) { r.cp++; if (r.cp >= Rr.R.pts.length) r.done = 1; } });
  var pos = 1 + Rr.rivals.filter(function (r) { return r.cp > Rr.cp; }).length; G.counter = 'POSITION ' + pos + ' / 4';
}
function endRace(won, msg) { var Rr = RACE; if (!Rr) return; RACE = null; G.objective = null; G.counter = null; G.raceMark = null; Rr.rivals.forEach(function (r) { r.v.keep = 0; r.v.ai = null; if (r.v.driver) { r.v.driver.keep = 0; } });
  if (won) { var first = !SV.races[Rr.R.id]; SV.races[Rr.R.id] = 1; SV.stats.races++; money(Rr.R.prize * (first ? 1 : 0.4)); bigText('RACE WON', msg + ' $' + Math.round(Rr.R.prize * (first ? 1 : 0.4)), '#4adfff', 3); sfx.play('win'); } else bigText('RACE LOST', msg, '#c4121c', 3); }
/* ---------- the Lost Loads: 50 hidden packages ---------- */
var PACKAGES = (function () {
  var L = [], rr = srand(909);
  POIS.forEach(function (p, i) { if (['castle', 'grotto', 'altar', 'asylum', 'chapel', 'quarry', 'terminal', 'hangar', 'ferris', 'carousel', 'clock', 'pierend', 'crane', 'dome', 'sanctum', 'lighthouse', 'volcano', 'cove', 'outfall', 'dungeon', 'bigtop', 'chimney'].indexOf(p.k) < 0) return; var a = rr() * 6.28, d = 6 + rr() * 10, x = p.x + Math.sin(a) * d, z = p.z + Math.cos(a) * d; if (isWaterK(kAt(x, z))) return; L.push({ x: x, z: z, where: p.name || p.k }); });
  var tries = 0; while (L.length < 50 && tries++ < 4000) { var x = 60 + rr() * (WX - 120), z = 60 + rr() * (WZ - 120), k = kAt(x, z); if (isWaterK(k) || k === K_ROAD || collide(x, z, 0.6, groundY(x, z), 1.7).hit) continue; if (L.some(function (q) { return Math.hypot(q.x - x, q.z - z) < 120; })) continue; L.push({ x: x, z: z, where: districtName(x, z) }); }
  return L.slice(0, 50).map(function (q, i) { q.id = 'p' + i; return q; });
})();
function placePackages() { PICKUPS = PICKUPS.filter(function (q) { return q.k !== 'package'; }); PACKAGES.forEach(function (q) { if (SV.packages[q.id]) return; PICKUPS.push({ k: 'package', x: q.x, z: q.z, y: groundY(q.x, q.z), fn: null, id: q.id }); }); }
var _takeP = takePickup; takePickup = function (q) { if (q.k === 'package') { SV.packages[q.id] = 1; SV.stats.packages++; var n = Object.keys(SV.packages).length; money(100); bigText('LOST LOAD ' + n + ' OF ' + PACKAGES.length, n === 10 ? 'A pistol waits at every safehouse' : n === 25 ? 'Armour waits at every safehouse' : n === 50 ? 'Every weapon, forever. And a Cumhead Kart.' : '+$100', '#f1e7d0', 2.5); if (n === 50) { WORDER.forEach(function (w) { if (WPN[w].cost) giveWeapon(w, 50); }); SV.kart = 1; } sfx.play('win'); persist(); return; }
  if (q.k === 'clue') { findClue(q.clue); return; } _takeP(q); };
/* ---------- THE MYSTERY: who took the Crimson Moon Trophy? Twenty clues, some only show at night, in a season or in fog ---------- */
var CLUES = [
  { at: 'poi:altar', when: 'any', t: 'A dusty ring on the altar where something round stood for a very long time. Scratched into the stone: "Gone, 20 years ago, the night the moon went red."' },
  { at: 'shop:club', when: 'any', t: 'An old photo pinned behind the Clubhouse bar: a crowd at the altar holding up a crimson trophy. In the corner, a black droplet with a big grin.' },
  { at: 'poi:gate', when: 'night', t: 'Steve is not waving tonight. He is staring at the moon. Someone has written on his sign: "HE KNOWS".' },
  { at: 'poi:chapel', when: 'night', t: 'A grave with no name: "Here lies the last Keeper of the Moon. He trusted the wrong grin."' },
  { at: 'poi:asylum', when: 'night', t: 'Patient file 0069, Cumwood Asylum: "Insists the moon talks to him. Draws a trophy on every wall. Discharged into the care of Ejaculand."' },
  { at: 'poi:clock', when: 'any', t: 'The clock tower stopped at 00:00. Inside the face, scratched backwards: "THE WHEEL TURNS, THE MOON RETURNS".' },
  { at: 'poi:lighthouse', when: 'fog', t: 'The lighthouse keeper\'s log, the night of the theft: "A small black shape rowed out to sea carrying something that glowed red. It came back without it."' },
  { at: 'poi:cove', when: 'any', t: 'In the wreck at Pirate Cove: an empty crimson velvet box, the size of a trophy. Salt water has not touched the inside.' },
  { at: 'poi:sanctum', when: 'any', t: 'Spermaid\'s sisters remember: "The moon trophy came to the isles for one night. Then the grinning one took it back. He said the city was not ready."' },
  { at: 'poi:castle:Blumhead\'s Castle', when: 'night', t: 'Blumhead\'s orders, torn: "...find the moon trophy and the egg will hatch at full power..." He wanted it too.' },
  { at: 'poi:dome', when: 'any', t: 'Spunk Brain Labs, sample 12: "Residue of crimson glass with a strange pulse. Origin: Ejaculand, ride maintenance."' },
  { at: 'poi:quarry', when: 'any', t: 'A bone carved into a key, half buried in the Bone Pit. The teeth of the key are shaped like a ferris wheel.' },
  { at: 'poi:volcano', when: 'any', t: 'Melted into the crater rim: a red stain shaped like a crescent. "The moon was hidden in fire, then in water, then in the sky."' },
  { at: 'poi:grotto', when: 'any', t: 'Sir Johnathan bats at something under Greebo\'s Grotto: a crimson shard. Cats always find the shiny thing.' },
  { at: 'poi:outfall', when: 'any', t: 'In the Cream Sewers outfall: a maintenance ticket from Ejaculand, the ferris wheel hub, signed with a little grinning face.' },
  { at: 'poi:terminal', when: 'any', t: 'A lost luggage tag at the airport: "Item: one trophy, crimson. Owner: S. Ejaculand. Flight: never departed."' },
  { at: 'poi:castle:Cumhead\'s Castle', when: 'winter', t: 'Snow settles everywhere in the castle except one square of stone. Under it: "WHEN WINTER COMES, LOOK UP AT THE WHEEL."' },
  { at: 'poi:hangar', when: 'any', t: 'A dusty plane in the hangar has red glitter on its seats and a Steve plush belted into the pilot\'s seat.' },
  { at: 'shop:fate', when: 'any', t: 'Stacked Fate lays out three cards: the Moon, the Wheel, the Grin. "You already know," says the deck.' },
  { at: 'poi:ferris', when: 'any', t: 'Under the ferris wheel, a tiny door with a ferris-wheel-shaped lock. The bone key from the Bone Pit would fit. Come back at midnight, in winter, with every other clue.' }
];
CLUES.forEach(function (c, i) { c.id = 'c' + i; });
function clueReady(c) { var n = dayLight(G.time) < 0.25; return c.when === 'any' || (c.when === 'night' && n) || (c.when === 'fog' && G.weather === 'fog') || (c.when === 'winter' && season() === 3); }
function placeClues() { PICKUPS = PICKUPS.filter(function (q) { return q.k !== 'clue'; }); if (!SV.mysteryOn) return; CLUES.forEach(function (c, i) { if (SV.clues[c.id] || !clueReady(c) || i === CLUES.length - 1) return; var p = placeOf(c.at); if (!p) return; var a = i * 2.4, x = p.x + Math.sin(a) * 4, z = p.z + Math.cos(a) * 4; PICKUPS.push({ k: 'clue', clue: c, x: x, z: z, y: groundY(x, z) }); }); }
function findClue(c) { if (SV.clues[c.id]) return; SV.clues[c.id] = 1; SV.stats.clues++; var n = Object.keys(SV.clues).length; G.cut = null; KIT.menu({ title: 'Clue ' + n + ' of ' + CLUES.length, html: '<p>' + c.t + '</p>', items: [{ label: 'KEEP LOOKING', def: true, fn: KIT.closeMenu }] }); sfx.play('blip'); persist(); }
function finalClueCheck() { if (!SV.mysteryOn || SV.mysterySolved) return; var last = CLUES[CLUES.length - 1], p = placeOf(last.at); if (!p || dist2(P.x, P.z, p.x, p.z) > 100) return; var all = CLUES.slice(0, -1).every(function (c) { return SV.clues[c.id]; }), mid = G.time >= 23.5 || G.time < 0.5, win = season() === 3;
  if (!all) { if (!G.mystNag) { G.mystNag = 1; toast('A tiny door with a ferris-wheel lock. You do not know enough yet.'); } return; } if (!(mid && win)) { if (!G.mystNag) { G.mystNag = 1; toast('Midnight. Winter. The wheel waits.'); } return; }
  SV.mysterySolved = 1; SV.clues[last.id] = 1; G.moonBig = 1; persist(); G.mission = null; startCutscene([['steve', '...'], ['lab', 'Steve? It was you all along?'], ['steve', '...'], ['lab', 'He says he hid the Crimson Moon Trophy for twenty years so Blumhead could never use it. In the fire, in the sea, in the sky... and in the wheel.'], ['spermaid', 'He has been grinning so nobody would see how scared he was. Oh, Steve.'], ['lab', 'He wants you to have it. The moon is back over Cum City.']], function () { money(50000); SV.trophy = 1; bigText('THE MYSTERY IS SOLVED', 'The Crimson Moon Trophy is yours. +$50,000', '#ff2630', 6); }); }
function mysteryHint() { var next = CLUES.filter(function (c) { return !SV.clues[c.id]; })[0]; if (!SV.mysteryOn) { toast('Finish "Clear Your Head" for Master Bates first.'); return; } if (!next) { toast('You have them all. Midnight, winter, the wheel.'); return; } var p = placeOf(next.at); SV.way = [p.x, p.z]; toast('Master Bates closes his eyes: "Look near ' + districtName(p.x, p.z) + (next.when !== 'any' ? ', and only ' + (next.when === 'night' ? 'at night' : next.when === 'fog' ? 'in the fog' : 'in winter') : '') + '." (waypoint set)', 6); }
function mysteryMenu() { var got = CLUES.filter(function (c) { return SV.clues[c.id]; }); KIT.menu({ title: 'The Mystery', sub: SV.mysteryOn ? got.length + ' of ' + CLUES.length + ' clues' + (SV.mysterySolved ? ' · SOLVED' : '') : 'Master Bates has something to tell you first.', html: got.length ? got.map(function (c, i) { return '<p><b>' + (i + 1) + '.</b> ' + c.t + '</p>'; }).join('') : '<p>No clues yet.</p>', items: [{ label: 'BACK', back: true, fn: pauseMenu }] }); }
function startCutscene(lines, done) { castFor(lines); G.cut = { lines: lines, i: -1, done: done }; var _cn = cutNext; cutNext(); G.cutDone = done; }
/* ---------- world events: something is always happening somewhere ---------- */
var EVENTS = [
  { k: 'protest', n: 'A protest', where: ['dist:club', 'dist:cafe'], who: 'cit', crowd: 10, hold: 'batM', chant: ['PINEAPPLE OFF PIZZA!', 'WHAT DO WE WANT? LESS CREAM!', 'NO MORE CUM IN THE CAFE!', 'JUSTICE FOR STEVE!'], reward: 'Joff gives you a free slice for breaking it up.' },
  { k: 'rally', n: 'A Pineapple Party rally', where: ['dist:club'], who: 'cit', crowd: 12, chant: ['PINEAPPLE! PINEAPPLE!', 'FIGHT ME! FIGHT ME!'], leader: 'joff', reward: 'Joff shakes your hand. +$100' },
  { k: 'festival', n: 'The Cream Festival', where: ['poi:carousel', 'dist:cafe'], who: 'cit', crowd: 14, dance: 1, music: 'ccnfest', reward: 'Free Cumpuccinos all round. Full health.' },
  { k: 'band', n: 'A marching band', where: ['dist:club', 'dist:hills', 'dist:cafe'], who: 'cit', crowd: 8, march: 1, music: 'ccnmarch', reward: 'You march along. The band leader tips you $50.' },
  { k: 'mardi', n: 'Mardi Gras', where: ['dist:red', 'dist:club'], who: 'cit', crowd: 16, dance: 1, floats: 2, music: 'ccnfest', confetti: 1, reward: 'Beads! Someone throws you $200 of them.' },
  { k: 'ghosts', n: 'Ghost hunters', where: ['poi:chapel', 'poi:asylum'], who: 'cit', crowd: 4, night: 1, torches: 1, chant: ['Did you hear that?', 'EVP reading off the scale!', 'Is anybody there?', 'Steve? Is that you?'], reward: 'The hunters swear they saw you glow. Here is a clue tip.' },
  { k: 'carmeet', n: 'A car meet', where: ['dist:docks', 'poi:terminal'], cars: 6, crowd: 6, night: 1, reward: 'Somebody leaves the keys in their Spunkster GT.' },
  { k: 'tbparty', n: "TB's pill party", where: ['dist:red'], who: 'cit', crowd: 10, dance: 1, leader: 'tb', music: 'ccnfest', night: 1, reward: 'TB gives you a Silly Pill. You did not ask.' },
  { k: 'steve', n: "Steve's Ejaculand parade", where: ['poi:gate'], who: 'steve', crowd: 6, march: 1, music: 'ccnmarch', reward: 'Steve grins at you. +$150' },
  { k: 'zombiewalk', n: 'A zombie walk (fancy dress)', where: ['dist:club', 'dist:red'], who: 'zombie', crowd: 10, march: 1, reward: 'Best costume prize: $250. You were not in costume.' },
  { k: 'preacher', n: 'Judgement preaching', where: ['dist:club', 'dist:cafe'], who: 'cit', crowd: 6, leader: 'judge', chant: ['Light or shadow!', 'Both have a price!'], reward: 'Judgement blesses you: your wanted level clears.' },
  { k: 'flashmob', n: 'A flash mob', where: ['dist:club', 'poi:terminal', 'dist:cafe'], who: 'cit', crowd: 12, dance: 1, music: 'ccnfest', reward: 'You join in. Everyone films it. +$100' }
];
var EV = null;
function stepEvents(dt) {
  if (G.interior) return; if (EV) { EV.t -= dt; if (EV.t <= 0 || dist2(P.x, P.z, EV.x, EV.z) > 450 * 450) { endEvent(); return; } stepEvent(dt); return; }
  G.evT = (G.evT || 30) - dt; if (G.evT > 0) return; G.evT = rnd(60, 140);
  var night = dayLight(G.time) < 0.4, L = EVENTS.filter(function (e) { return !e.night || night; }), e = pick(L), sp = placeOf(pick(e.where)); if (!sp || dist2(P.x, P.z, sp.x, sp.z) > 400 * 400) return; var r = nearestRoad(sp.x, sp.z, 60); if (!r) return; startEvent(e, r);
}
function startEvent(e, r) {
  EV = { e: e, x: r.x, z: r.z, E: r.E, s: r.s, t: 240, peds: [], cars: [], seen: 0 };
  for (var i = 0; i < (e.crowd || 0); i++) { var off = (e.march ? 0 : r.E.w / 2 + 2 + (i % 3) * 1.4) * (i % 2 ? 1 : -1), pt = edgeAt(r.E, clamp(r.s + (e.march ? -i * 1.6 : (i - e.crowd / 2) * 1.2), 0, r.E.len), false, e.march ? (i % 2 ? 1.5 : -1.5) : off);
    var who = i === 0 && e.leader ? e.leader : e.who === 'steve' && i % 2 ? 'steve' : null, kind = e.who === 'zombie' ? 'zombie' : 'cit', p = makePed({ x: pt.x, z: pt.z, kind: kind, who: who, rig: who ? (who === 'steve' ? 'steve' : rigOf(who)) : rigFor(kind), state: 'event', keep: 1 }); p.hostile = false; p.ev = 1; p.i = i;
    if (e.hold) p.holding = e.hold; if (e.torches) p.holding = 'phoneM'; if (e.march && i % 3 === 0) p.inst = i % 2 ? 'drum' : 'horn';
    p.ctl = function (q, dt) { if (q.fear > 0) { q.ctl = null; q.state = 'flee'; return; } if (EV && EV.e.march) { q.s2 = (q.s2 || EV.s - q.i * 1.6) + 1.1 * dt; if (q.s2 > EV.E.len) { q.ctl = null; q.state = 'walk'; return; } var pt2 = edgeAt(EV.E, q.s2, false, q.i % 2 ? 1.5 : -1.5); q.vx = (pt2.x - q.x) * 3; q.vz = (pt2.z - q.z) * 3; q.x = pt2.x; q.z = pt2.z; q.y = standY(q.x, q.z, q.y + 0.5); q.a = pt2.a; q.sp = 1.1; q.ph += dt * 2.6; } else { q.a = Math.atan2(EV ? EV.x - q.x : 0, EV ? EV.z - q.z : 1); if (EV && EV.e.chant && Math.random() < dt * 0.15) say(q, pick(EV.e.chant)); } };
    p.pose = function (Q, q) { if (EV && EV.e.dance) poseDance(Q, G.t, q.i); else if (q.inst) { if (q.sp > 0.3) poseWalk(Q, q.ph, 0.6, false); posePlay(Q, G.t, q.inst); } else if (q.sp > 0.3) poseWalk(Q, q.ph, 0.6, false); else if (EV && EV.e.chant) { Q.sh[1] = [2.6 + Math.sin(G.t * 4 + q.i) * 0.3, 0.2, 0]; Q.el[1] = 0.3; } };
    EV.peds.push(p); }
  if (e.cars) for (var c = 0; c < e.cars; c++) { var pt3 = edgeAt(r.E, clamp(r.s + c * 6, 0, r.E.len), false, r.E.w / 2 + 2.5), v = makeVeh(pick(['sports', 'muscle', 'buggy']), pt3.x, pt3.z, pt3.a + 0.5, { col: c }); v.keep = 1; EV.cars.push(v); }
  if (e.floats) for (var f = 0; f < e.floats; f++) { var pt4 = edgeAt(r.E, clamp(r.s - 10 - f * 12, 0, r.E.len), false, r.E.w / 4), fv = makeVeh('truck', pt4.x, pt4.z, pt4.a, { col: f }); fv.keep = 1; fv.ai = { E: r.E, s: r.s - 10 - f * 12, back: false, lane: r.E.w / 4, want: 3, wait: 0 }; var d = makePed({ x: fv.x, z: fv.z, rig: rigFor('cit') }); d.inVeh = fv; fv.driver = d; EV.cars.push(fv); }
}
function stepEvent(dt) { var e = EV.e, d = dist2(P.x, P.z, EV.x, EV.z);
  if (!EV.seen && d < 70 * 70) { EV.seen = 1; toast('EVENT: ' + e.n); if (!SV.seenEvents[e.k]) { SV.seenEvents[e.k] = 1; SV.stats.events++; } }
  if (e.music && d < 60 * 60 && P.state === 'foot' && !G.evMusic) { G.evMusic = 1; music.play(e.music); } else if (G.evMusic && (d > 70 * 70 || P.state !== 'foot')) { G.evMusic = 0; music.stop && music.stop(); }
  if (e.confetti && Math.random() < dt * 20 && d < 80 * 80) addFx({ k: 'confetti', x: EV.x + rnd(-8, 8), y: groundY(EV.x, EV.z) + 6, z: EV.z + rnd(-8, 8), vx: rnd(-1, 1), vy: -1, vz: rnd(-1, 1), life: 3, c: [Math.random(), Math.random() * 0.5, Math.random()] });
  if (e.torches && dayLight(G.time) < 0.4) G.dynLights.push({ x: EV.x, y: groundY(EV.x, EV.z) + 2, z: EV.z, r: 10, c: [0.8, 0.9, 1], k: 0.8, life: 0.05 });
  if (!EV.paid && d < 8 * 8 && P.state === 'foot') { EV.paid = 1; toast(e.reward, 5); if (e.k === 'festival') P.hp = SV.maxHp; else if (e.k === 'preacher') { SV.wanted = 0; SV.heat = 0; } else if (e.k === 'tbparty') G.pilled = 0.6; else if (e.k === 'mardi') money(200); else if (e.k === 'zombiewalk') money(250); else if (e.k === 'carmeet') { var v = EV.cars[0]; if (v) { v.keep = 0; v.owned = 0; } } else if (e.k === 'ghosts') mysteryHint(); else money(e.k === 'steve' ? 150 : e.k === 'band' ? 50 : 100); }
}
function endEvent() { if (!EV) return; EV.peds.forEach(function (p) { p.keep = 0; p.ctl = null; p.pose = null; p.state = 'walk'; var r = nearestRoad(p.x, p.z, 30); if (r) { p.E = r.E; p.s = r.s; } }); EV.cars.forEach(function (v) { v.keep = 0; }); if (G.evMusic) { G.evMusic = 0; music.stop && music.stop(); } EV = null; }
/* ---------- uses: shop doors, houses, garages, mission starts, races ---------- */
function worldSetup() {
  buildRamps(); placePackages(); placeClues();
  var U = [];
  Object.keys(SHOPS).forEach(function (id) { var s = SHOPS[id], d = doorOf(s.b); if (id === 'wash' || id === 'wash2') { U.push({ x: d.x, z: d.z, r: 6, label: 'CREAM WASH ($100: LOSE THE HEAT)', blip: 'wash', icon: 'W', fn: function () { if (SV.money < 100) { toast('$100 for a wash.'); return; } money(-100); SV.wanted = 0; SV.heat = 0; G.fade = 1.2; if (P.veh) { P.veh.hp = Math.max(P.veh.hp, 100); P.veh.col = (P.veh.col + 1) % 9; } toast('Washed, waxed and nobody recognises the car.'); }, car: 1 }); return; }
    U.push({ x: d.x, z: d.z, r: 2.4, label: 'ENTER ' + s.name.toUpperCase(), blip: id === 'motors' || id === 'estate' || id === 'saba' || id === 'cops' || id === 'hosp' ? 'shop' : null, icon: s.name[0], fn: function () { enterShop(id); } }); });
  HOUSES.forEach(function (h) { var d = doorOf(h.b), own = SV.houses.indexOf(h.id) >= 0; if (own) { U.push({ x: d.x, z: d.z, r: 2.4, label: 'GO HOME', blip: 'house', icon: 'H', fn: function () { enterShop(null, h.id); } }); U.push({ x: d.x + Math.sin(d.a) * 5, z: d.z + Math.cos(d.a) * 5, r: 3, label: 'GARAGE', fn: function () { garageMenu(h); } }); }
    else U.push({ x: d.x, z: d.z, r: 2.4, label: 'FOR SALE: ' + h.name.toUpperCase() + ' ($' + h.cost.toLocaleString('en-GB') + ')', blip: 'house', icon: '$', fn: function () { KIT.confirm({ title: h.name, sub: 'Save here, sleep here, keep your cars here.', price: h.cost, have: Math.floor(SV.money), unit: '$', yes: function () { money(-h.cost); SV.houses.push(h.id); SV.lastHouse = h.id; KIT.closeMenu(); toast('It is yours. Welcome home.'); worldSetup(); persist(); }, no: KIT.closeMenu }); } }); });
  if (SV.mysteryOn) CLUES.forEach(function (c) { if (SV.clues[c.id] || !clueReady(c)) return; var p = placeOf(c.at); if (p) U.push({ x: p.x, z: p.z, r: 0.01, blip: 'clue', icon: '?', fn: function () {} }); });
  RACES.forEach(function (R0) { U.push({ x: R0.x, z: R0.z, r: 6, label: 'STREET RACE: ' + R0.name.toUpperCase() + (SV.races[R0.id] ? ' (WON)' : ''), blip: 'race', icon: 'R', car: 1, fn: function () { startRace(R0); } }); });
  poisOf('manhole').concat(poisOf('outfall')).forEach(function (p, i) { U.push({ x: p.x, z: p.z, r: 2, label: 'CLIMB INTO THE CREAM SEWERS', fn: function () { enterShop(null, null, 'sewer'); } }); });
  var asy = poiNamed('asylum'); if (asy) U.push({ x: asy.x, z: asy.z + 8, r: 3, label: 'ENTER CUMWOOD ASYLUM', icon: '!', fn: function () { enterShop(null, null, 'asylum'); } });
  var dun = poiNamed('dungeon'); if (dun) U.push({ x: dun.x, z: dun.z + 4, r: 3, label: 'GO DOWN INTO THE CUM DUNGEONS', fn: function () { enterShop(null, null, 'dungeon'); } });
  var fer = poiNamed('ferris'); if (fer) U.push({ x: fer.x, z: fer.z + 3, r: 3, label: 'THE LITTLE DOOR UNDER THE WHEEL', fn: function () { G.mystNag = 0; finalClueCheck(); } });
  G.uses = U.concat(typeof missionGivers === 'function' ? missionGivers() : []);
}
function garageMenu(h) { KIT.menu({ title: 'Garage', sub: h.name, items: SV.cars.map(function (c, i) { return { label: VT[c.type].n, fn: function () { var d = doorOf(h.b), x = d.x + Math.sin(d.a) * 7, z = d.z + Math.cos(d.a) * 7, v = makeVeh(c.type, x, z, d.a, { owned: 1, col: c.col }); v.keep = 1; KIT.closeMenu(); toast('Your ' + VT[c.type].n + ' is out front.'); } }; })
  .concat(SV.kart ? [{ label: 'Cumhead Kart (Lost Loads prize)', fn: function () { var d = doorOf(h.b), v = makeVeh('kart', d.x + Math.sin(d.a) * 7, d.z + Math.cos(d.a) * 7, d.a, { owned: 1 }); v.keep = 1; KIT.closeMenu(); } }] : []).concat(P.veh ? [{ label: 'PARK THIS ' + P.veh.t.n.toUpperCase() + ' HERE', fn: function () { SV.cars.push({ type: P.veh.type, col: P.veh.col }); var v = P.veh; exitVehicle(true); VEH.splice(VEH.indexOf(v), 1); KIT.closeMenu(); toast('Parked and kept.'); persist(); } }] : []).concat([{ label: 'BACK', back: true, fn: KIT.closeMenu }]) }); }
/* the special rooms: the asylum, the dungeons, the sewers (they reuse the room builder with their own look and people) */
ROOMS.asylum = { wall: 'w_brick', floor: 'tilefloor', keeper: null, props: ['bed', 'bed', 'table', 'shelf', 'candles'], w: 24, d: 18, dark: 1, haunted: 1 };
ROOMS.dungeon = { wall: 'stone', floor: 'stone', keeper: null, props: ['candles', 'keg', 'keg', 'shelf', 'vault'], w: 26, d: 20, dark: 1, foes: 'skeleton' };
ROOMS.sewer = { wall: 'w_brick', floor: 'grate', keeper: null, props: ['pool', 'keg', 'shelf'], w: 22, d: 14, dark: 1, foes: 'rat' };
var _enterShop = enterShop; enterShop = function (id, homeId, special) {
  if (!special) return _enterShop(id, homeId);
  var key = special, R0 = ROOMS[key]; if (!IMESH[key]) IMESH[key] = roomMesh(key); var RM = IMESH[key];
  G.fade = 1.4; G.interior = { id: key, key: key, RM: RM, special: 1, exitX: P.x + 2, exitZ: P.z + 2, exitA: P.a }; P.x = RM.w / 2; P.z = 1.4; P.y = 0; P.a = 0; CAM.yaw = 0; CAM.x = P.x; CAM.z = -2; CAM.y = 2.4; P.vx = P.vz = 0;
  G.indoorUses = [{ x: RM.w / 2, z: 0.5, r: 1.6, label: 'LEAVE', fn: leaveShop }]; radioOff();
  if (R0.haunted) { G.haunt = { t: 0, next: 4 }; var clueA = CLUES[4]; if (SV.mysteryOn && !SV.clues[clueA.id]) G.indoorUses.push({ x: RM.w - 3, z: RM.d - 3, r: 1.6, label: 'READ THE PATIENT FILE', fn: function () { findClue(clueA); } }); }
  if (R0.foes) for (var k = 0; k < 6; k++) { var p = makePed({ x: 4 + (k % 3) * 7, z: 8 + Math.floor(k / 3) * 6, kind: 'goon', rig: R0.foes === 'rat' ? RIGS.pusher : RIGS.zombie2, hostile: 1, hp: 50, keep: 1 }); p.inside = key; p.hostile = 1; p.angry = 1; }
  G.indoorUses.push({ x: RM.w - 2.5, z: RM.d - 2.5, r: 1.6, label: 'SEARCH', fn: function () { if (G.interior.looted) { toast('Nothing else here.'); return; } G.interior.looted = 1; var c = key === 'dungeon' ? 800 : key === 'sewer' ? 300 : 500; money(c); toast('You find $' + c + ' and something sticky.'); } });
};
function stepHaunt(dt) { var H0 = G.haunt; if (!H0 || !G.interior || G.interior.key !== 'asylum') { G.haunt = null; return; } H0.t += dt; if (H0.t > H0.next) { H0.next = H0.t + rnd(5, 11); var r = Math.random(); if (r < 0.35) { G.flashT = 0.2; sfx.play('roar'); toast(pick(['Something whispered your name.', 'A wheelchair rolls across the room on its own.', 'The lights die, then come back.', 'Footsteps above you. There is no upstairs.'])); }
  else if (r < 0.7) { var RM = G.interior.RM, g = makePed({ x: rnd(2, RM.w - 2), z: rnd(4, RM.d - 2), kind: 'cit', rig: CITIZENS[3], state: 'idle', keep: 1 }); g.inside = 'asylum'; g.ghost = 1; g.god = 1; g.life = 3; g.ctl = function (q, d2) { q.life -= d2; q.a = Math.atan2(P.x - q.x, P.z - q.z); q.x += (P.x - q.x) * d2 * 0.6; q.z += (P.z - q.z) * d2 * 0.6; if (q.life <= 0) { q.inside = 'gone'; q.keep = 0; } }; say(g, pick(['Get out.', 'Where is the moon?', 'Patient 0069...', 'He grinned at me.'])); } else { CAM.shake = 0.5; sfx.play('boom'); } } }
/* ---------- drink and drugs ---------- */
function stepDrugs(dt) { ['drunk', 'high', 'pilled'].forEach(function (k) { if (G[k] > 0) G[k] = Math.max(0, G[k] - dt / 160); });
  G.fxWarp = (G.pilled || 0) * 1.2 + (G.high || 0) * 0.3; G.fxHue = (G.high || 0) * 0.9 + (G.pilled || 0) * 0.5; G.fxNeg = G.pilled > 0.6 && Math.sin(G.t * 0.7) > 0.97 ? 0.8 : 0;
  if (G.garlic > 0) G.garlic -= dt; }
function stepWorldStuff(dt) { stepEvents(dt); stepRace(dt); stepHaunt(dt); STUNTS.forEach(function (s) { if (P.veh && dist2(P.veh.x, P.veh.z, s.x, s.z) < 40 && Math.abs(P.veh.sp) > 18) { G.lastRampX = s.x; G.lastRampZ = s.z; } });
  if ((G.clueT = (G.clueT || 0) - dt) <= 0) { G.clueT = 20; placeClues(); G.uses = G.uses.filter(function (u) { return u.blip !== 'clue'; }); if (SV.mysteryOn) CLUES.forEach(function (c) { if (SV.clues[c.id] || !clueReady(c)) return; var p = placeOf(c.at); if (p) G.uses.push({ x: p.x, z: p.z, r: 0.01, blip: 'clue', icon: '?', fn: function () {} }); }); }
  if ((G.giverT = (G.giverT || 0) - dt) <= 0) { G.giverT = 3; G.uses = G.uses.filter(function (u) { return !u.m; }).concat(missionGivers()); }
  // car uses (races, the wash) only work from a car
  if (P.state === 'car' && P.veh) { var u = null; (G.uses || []).forEach(function (q) { if (q.car && dist2(P.veh.x, P.veh.z, q.x, q.z) < q.r * q.r) u = q; }); G.carUse = RACE ? null : u; } else G.carUse = null;
  if (SV.mysteryOn && !SV.mysterySolved) { var fp = poiNamed('ferris'); if (fp && dist2(P.x, P.z, fp.x, fp.z) < 64) finalClueCheck(); }
  // the chapters change who is about
  if (G.chapter === 'blum' && Math.random() < dt * 0.02 && !G.interior) { var gp = spawnPoint(30, 60); if (gp) addFx({ k: 'cloud', x: gp.x, y: groundY(gp.x, gp.z) + 1, z: gp.z, life: 8 }); }
}
function drawWorldStuff() {
  STUNTS.forEach(function (s) { if (s.mesh && inView(s.x, s.z, 8) && dist2(s.x, s.z, CAM.x, CAM.z) < 200 * 200) R3.draw(s.mesh, ATT); });
  // markers: missions, races, the current target
  var marks = []; (G.uses || []).forEach(function (u) { if (u.blip === 'mission' || u.blip === 'race' || u.blip === 'house' || u.blip === 'wash') marks.push([u.x, u.z, u.blip]); }); if (G.mission && G.mission.mark) marks.push([G.mission.mark.x, G.mission.mark.z, 'go']); if (G.raceMark) marks.push([G.raceMark.x, G.raceMark.z, 'race']);
  marks.forEach(function (k) { if (dist2(k[0], k[1], CAM.x, CAM.z) > 160 * 160 || !inView(k[0], k[1], 4)) return; var y = groundY(k[0], k[1]), col = { mission: [1, 0.85, 0.3], race: [0.3, 0.9, 1], house: [0.5, 1, 0.4], wash: [1, 1, 1], go: [1, 0.9, 0.3] }[k[2]] || [1, 1, 1];
    if (!MARKM) { MARKM = M(); tub(MARKM, [0, 0, 0], [0, 2.4, 0], 0.75, 0.75, '#ffffff', 14); MARKM.upload(); } R3.draw(MARKM, ATT, { m: MD(k[0], y + Math.sin(G.t * 2) * 0.15, k[1], G.t, 0, 0), lit: false, add: 1, alpha: 0.32, tint: col }); });
}
var MARKM = null;
