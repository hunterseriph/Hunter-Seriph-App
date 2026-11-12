/* =====================================================================================================
   ONLINE CO-OP (his ask: two players, like Kart): Cumhead on the host's machine, Shithead Laboozie on the guest's.
   The same tiny WebRTC link as Cumhead Kart (no library, the free public PeerJS signalling server only passes the
   "how do I reach you" messages; host id 'hspsy-' + room code). The host runs the world: TB, his boys, doors,
   pickups, bags and fires, the car and the rides; the guest runs himself and tells the host what he hit and took.
   ===================================================================================================== */
var SIGURL = (function () { try { var q = location.search.match(/[?&]sig=([^&]+)/); if (q) return decodeURIComponent(q[1]); var s = localStorage.getItem('pn-sig') || localStorage.getItem('ck-sig'); if (s) return s; } catch (e) {} return 'wss://0.peerjs.com/peerjs?key=peerjs'; })();
var ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
function rid(n, abc) { abc = abc || 'abcdefghijkmnpqrstuvwxyz23456789'; var s = ''; for (var i = 0; i < n; i++) s += abc[Math.floor(Math.random() * abc.length)]; return s; }
/* one connection to the signalling server */
function Signal(id, on) {
  var self = { id: id, open: false, ws: null, hb: null, closed: false }, url = SIGURL + (SIGURL.indexOf('?') < 0 ? '?' : '&') + 'id=' + encodeURIComponent(id) + '&token=' + rid(12) + '&version=1.5.4';
  try { self.ws = new WebSocket(url); } catch (e) { setTimeout(function () { on.error && on.error('No connection to the internet.'); }, 0); return self; }
  self.ws.onmessage = function (ev) { var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.type === 'OPEN') { self.open = true; on.open && on.open(); }
    else if (m.type === 'ID-TAKEN') on.error && on.error('That room code is taken. Try again.');
    else if (m.type === 'ERROR') on.error && on.error((m.payload && m.payload.msg) || 'The matchmaking server said no.');
    else if (m.type === 'EXPIRE') on.expire && on.expire(m.src);
    else if (m.type === 'OFFER' || m.type === 'ANSWER' || m.type === 'CANDIDATE' || m.type === 'LEAVE') on.msg && on.msg(m); };
  self.ws.onclose = function () { self.open = false; clearInterval(self.hb); if (!self.closed) on.error && on.error('Lost the matchmaking server.'); };
  self.ws.onerror = function () { };
  self.hb = setInterval(function () { self.send({ type: 'HEARTBEAT' }); }, 5000);
  self.send = function (m) { if (self.ws && self.ws.readyState === 1) self.ws.send(JSON.stringify(m)); };
  self.close = function () { self.closed = true; clearInterval(self.hb); try { self.ws.close(); } catch (e) {} };
  return self;
}
/* one link to another player */
function Link(sig, remote, cid, offerer, on) {
  var L = { remote: remote, cid: cid, pc: new RTCPeerConnection({ iceServers: ICE }), ctl: null, fast: null, up: false, queue: [] };
  L.pc.onicecandidate = function (e) { if (e.candidate) sig.send({ type: 'CANDIDATE', dst: remote, payload: { type: 'data', connectionId: cid, candidate: e.candidate } }); };
  L.pc.onconnectionstatechange = function () { var s = L.pc.connectionState; if (s === 'failed' || s === 'closed' || s === 'disconnected') { if (L.up || s === 'failed') { L.up = false; on.close && on.close(L); } } };
  function wire(ch) {
    ch.onopen = function () { if (L.ctl && L.ctl.readyState === 'open' && L.fast && L.fast.readyState === 'open' && !L.up) { L.up = true; on.up && on.up(L); } };
    ch.onmessage = function (e) { var m; try { m = JSON.parse(e.data); } catch (x) { return; } on.data && on.data(L, m); };
    ch.onclose = function () { if (L.up) { L.up = false; on.close && on.close(L); } };
  }
  if (offerer) {
    L.ctl = L.pc.createDataChannel('ctl', { ordered: true }); L.fast = L.pc.createDataChannel('fast', { ordered: false, maxRetransmits: 0 }); wire(L.ctl); wire(L.fast);
    L.pc.createOffer().then(function (o) { return L.pc.setLocalDescription(o); }).then(function () { sig.send({ type: 'OFFER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, label: 'pn', reliable: true, serialization: 'json', browser: 'pn' } }); });
  } else L.pc.ondatachannel = function (e) { if (e.channel.label === 'ctl') L.ctl = e.channel; else L.fast = e.channel; wire(e.channel); };
  L.signal = function (m) {
    var p = m.payload || {};
    if (m.type === 'OFFER') L.pc.setRemoteDescription(p.sdp).then(function () { return L.pc.createAnswer(); }).then(function (a) { return L.pc.setLocalDescription(a); }).then(function () { sig.send({ type: 'ANSWER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, browser: 'pn' } }); L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'ANSWER') L.pc.setRemoteDescription(p.sdp).then(function () { L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'CANDIDATE' && p.candidate) { if (L.pc.remoteDescription) L.pc.addIceCandidate(p.candidate).catch(function () {}); else L.queue.push(p.candidate); }
  };
  L.send = function (m, fast) { var ch = fast ? L.fast : L.ctl; if (ch && ch.readyState === 'open') { try { ch.send(JSON.stringify(m)); } catch (e) {} } };
  L.close = function () { try { L.pc.close(); } catch (e) {} };
  return L;
}
/* ---------- the room: just two of you ---------- */
var NET = { role: null, code: '', sig: null, link: null, host: null, mate: null, err: '', onChange: null, sendT: 0, lootSent: -1 };
function netMe() { var p = window.HSProfile ? HSProfile.get() : { name: 'Player', pic: 'cumhead' }; return { name: (p && p.name) || 'Player', pic: p && p.pic }; }
function netHost(done) {
  netLeave(); NET.role = 'host'; NET.code = rid(5, 'ABCDEFGHJKLMNPQRSTUVWXYZ'); NET.err = ''; NET.mate = null;
  NET.sig = Signal('hspsy-' + NET.code.toLowerCase(), {
    open: function () { done && done(true); done = null; netChanged(); },
    error: function (e) { NET.err = e; netChanged(); done && done(false); done = null; },
    msg: function (m) { var L = NET.link && NET.link.remote === m.src ? NET.link : null;
      if (m.type === 'OFFER' && !L) { if (NET.link && NET.link.up) return; L = NET.link = Link(NET.sig, m.src, (m.payload || {}).connectionId, false, { up: function (l) { l.send({ t: 'hello?' }); }, data: hostData, close: hostDrop }); }
      if (L) L.signal(m); } });
}
function netJoin(code, done) {
  netLeave(); NET.role = 'client'; NET.code = code.toUpperCase(); NET.err = '';
  var host = 'hspsy-' + NET.code.toLowerCase(), timer = setTimeout(function () { if (!NET.host || !NET.host.up) { NET.err = 'Could not reach room ' + NET.code + '. Check the code, or the host\'s network may block direct connections.'; netChanged(); done && done(false); done = null; } }, 15000);
  NET.sig = Signal('hspsyc-' + rid(10), {
    open: function () { NET.host = Link(NET.sig, host, 'dc_' + rid(10), true, { up: function (l) { clearTimeout(timer); l.send({ t: 'join', p: netMe() }); done && done(true); done = null; }, data: clientData, close: function () { NET.err = 'The host left.'; if (NET.role === 'client') netLost(); } }); },
    error: function (e) { NET.err = e; netChanged(); clearTimeout(timer); done && done(false); done = null; },
    expire: function () { NET.err = 'No room with the code ' + NET.code + '.'; clearTimeout(timer); netChanged(); done && done(false); done = null; },
    msg: function (m) { if (NET.host && m.src === host) NET.host.signal(m); } });
}
function netLeave() {
  try { if (NET.role === 'client' && NET.host) NET.host.send({ t: 'bye' }); if (NET.role === 'host' && NET.link) NET.link.send({ t: 'closed' }); } catch (e) {}
  if (NET.link) NET.link.close(); if (NET.host) NET.host.close(); if (NET.sig) NET.sig.close();
  NET.role = null; NET.link = null; NET.host = null; NET.sig = null; NET.mate = null; NET.lootSent = -1; if (G) { G.net = null; }
}
function netChanged() { if (NET.onChange) NET.onChange(); }
function netSend(m, fast) { if (NET.role === 'client' && NET.host) NET.host.send(m, fast); }
function netToGuest(m, fast) { if (NET.role === 'host' && NET.link && NET.link.up) NET.link.send(m, fast); }
function netEv(e) { if (isHost()) netToGuest({ t: 'ev', e: e }); }
function netFloor(how) { netToGuest({ t: 'floor', seed: G.seed, fi: G.fi, how: how }); NET.lootSent = -1; }
/* what a player looks like on the wire */
var PF = ['x', 'z', 'a', 'ca', 'spd', 'ph', 'run', 'crouch', 'aim', 'atkT', 'hp', 'dead', 'hurtT', 'duck', 'rca', 'kick'];
function packP(P) { var o = {}; PF.forEach(function (k) { var v = P[k]; o[k] = typeof v === 'number' ? Math.round(v * 100) / 100 : v ? 1 : 0; }); o.weap = P.weap; o.hide = P.hide ? FL.lockers.indexOf(P.hide) : -1; o.who = P.who; o.strip = P === G.P ? (G.stash ? 1 : 0) : P.stripped ? 1 : 0; return o; }
function unpackP(R, o) { PF.forEach(function (k) { if (o[k] !== undefined) R[k] = o[k]; }); R.weap = WEAP[o.weap] ? o.weap : R.weap; R.hide = o.hide >= 0 && FL.lockers ? FL.lockers[o.hide] || null : null; R.stripped = !!o.strip; R.who = o.who === 'lab' ? 'lab' : 'cum'; }
/* ---------- host side ---------- */
function hostData(L, m) {
  if (m.t === 'join') { NET.mate = { name: String((m.p && m.p.name) || 'Player').slice(0, 14), pic: m.p && m.p.pic }; sfx.play('key'); netChanged(); return; }
  if (m.t === 'bye') { hostDrop(L); return; }
  if (!G || !G.R) return; var R = G.R;
  if (m.t === 'st') { unpackP(R, m.s); R.seenAt = KIT.t; return; }
  if (m.t === 'hit') { var f = m.id === 'tb' ? G.tb : G.foes.filter(function (q) { return q.id === m.id; })[0]; if (f) hurtFoe(f, +m.dmg || 0, +m.a || 0, +m.push || 0, m.w); return; }
  if (m.t === 'bag') { var b = m.b || {}; G.bags.push({ x: +b.x, z: +b.z, y: +b.y, vx: +b.vx, vz: +b.vz, vy: +b.vy, t: 3, by: 'g' }); return; }
  if (m.t === 'take') { var i = G.loot.findIndex(function (l) { return l.id === m.id; }); if (i < 0) return; var l = G.loot[i]; if (l.k === 'bag' && l.own !== 'g') return; G.loot.splice(i, 1); G.lootV++; if (l.k === 'key') { G.keys[G.fi] = 1; say('Shithead Laboozie found the ' + FLOORS[G.fi].key + '! The stairs up are open now.', 4, '#ffe36a'); sfx.play('key'); } netToGuest({ t: 'got', l: l }); return; }
  if (m.t === 'exit') { if (haveKey()) climb(); return; }
  if (m.t === 'unlock') { FL.cellLocked = 0; return; } if (m.t === 'lock') { FL.cellLocked = 1; return; }
  if (m.t === 'noise') { makeNoise(+m.x, +m.z, +m.r, m.src); return; }
  if (m.t === 'dead') { R.dead = 1; R.downT = 15; say('Shithead Laboozie is down! He gets back up in a bit... if you live that long.', 4, '#c4121c'); checkBothDown(); return; }
  if (m.t === 'bagdrop') { G.loot = G.loot.filter(function (q) { return !(q.k === 'bag' && q.own === 'g'); }); addLoot(+m.x, +m.z, 'bag', { own: 'g' }); return; }
  if (m.t === 'again') { return; }
}
function hostDrop(L) { if (NET.link === L) NET.link = null; try { L.close(); } catch (e) {} NET.mate = null; netChanged(); if (G && G.R) { G.R.gone = 1; G.R.dead = 1; say('Shithead Laboozie left the game.', 4, '#a6968f'); } }
function checkBothDown() { if (G.P.dead && (!G.R || G.R.dead || G.R.gone) && G.mode !== 'over') { gameOver('dead'); netEv({ k: 'over', why: 'dead' }); } }
/* every frame: the snapshot to the guest, and getting downed players back up */
function netStep(dt) {
  if (!G || !G.net) return;
  [G.P, G.R].forEach(function (pl) { if (!pl || !pl.dead || pl.gone || !pl.downT || isGuest()) return; pl.downT -= dt; if (pl.downT <= 0) { pl.downT = 0; if (pl === G.P) reviveMe(); else netEv({ k: 'revive' }); if (pl === G.R) pl.dead = 0; } });
  NET.sendT -= dt; if (NET.sendT > 0) return; NET.sendT = 1 / 15;
  if (isGuest()) { var P = G.P; netSend({ t: 'st', s: packP(P) }, true); return; }
  if (!NET.link || !NET.link.up) return;
  var s = { t: 'snap', m: G.mode, P: packP(G.P), cl: FL.cellLocked ? 1 : 0, keys: G.keys, trip: Math.round(G.trip * 100) / 100 };
  var tb = G.tb; if (tb) s.tb = { x: r2(tb.x), z: r2(tb.z), a: r2(tb.a), st: tb.st, ph: r2(tb.ph || 0), spd: r2(tb.spd || 0), sus: r2(tb.sus || 0), clown: tb.clown ? 1 : 0, fire: tb.fire ? 1 : 0, angry: tb.angry ? 1 : 0, hp: r2(tb.hp || 0), max: tb.max || 0, phase: tb.phase || 1, mv: tb.mv ? [tb.mv.k, r2(tb.mv.t)] : null, stun: r2(tb.stun || 0), hurtT: r2(tb.hurtT || 0), downT: r2(tb.downT || 0), flinch: r2(tb.flinch || 0) };
  s.f = G.foes.map(function (f) { return [f.id, r2(f.x), r2(f.z), r2(f.a), f.st, r2(f.ph), r2(f.spd), r2(f.atk), r2(f.hurt), r2(f.sus), f.poison > 0 ? 1 : 0, f.burnT > 0 ? 1 : 0, f.k, Math.round(f.hp), Math.round(f.max || 0), f.under ? 1 : 0, r2(f.y || 0), r2(f.wind || 0), f.p2 ? 1 : 0, f.mv ? f.mv.k : 0, f.spinT ? 1 : 0]; }); s.hz = (G.hazards || []).map(function (h) { return [r2(h.x), r2(h.z), r2(h.r), r2(h.t), h.k, r2(h.delay || 0)]; });
  s.bags = G.bags.map(function (b) { return [r2(b.x), r2(b.y), r2(b.z)]; }); s.burns = G.burns.map(function (B) { return [r2(B.x), r2(B.z), r2(B.t), B.r]; });
  s.shots = G.shots.map(function (q) { return [r2(q.x), r2(q.y || 1.4), r2(q.z), q.tex || 0, q.sz || 0]; });
  if (G.mode === 'drive' && DR) s.dr = { z: r2(DR.z), x: r2(DR.x), yaw: r2(DR.yaw), v: r2(DR.v), steer: r2(DR.steer), hp: r2(DR.hp), end: DR.end, hits: DR.hits, splat: r2(DR.splat), peds: DR.peds.map(function (p) { return [p.id, p.k, r2(p.z), r2(p.x), p.st, r2(p.y), r2(p.spin), r2(p.a), r2(p.ph)]; }) };
  if ((G.mode === 'ride' || FL.ride) && RD) s.rd = { d: r2(RD.d), v: r2(RD.v), fly: r2(RD.fly) };
  if (G.doorsOpen = FL.doors && FL.doors.length) s.doors = FL.doors.map(function (D) { return r2(D.open); });
  netToGuest(s, true);
  if (NET.lootSent !== G.lootV) { NET.lootSent = G.lootV; netToGuest({ t: 'loot', L: G.loot.map(function (l) { return [l.id, r2(l.x), r2(l.z), l.k, l.own || '', l.n === undefined ? -1 : l.n]; }) }); }
}
function r2(v) { return Math.round((v || 0) * 100) / 100; }
function reviveMe() { var P = G.P, spot = FL.respawn || FL.cellIn || FL.start; P.dead = 0; P.hp = 50; P.hurtT = 0; if (G.mode === 'play') { P.x = tx(spot.i); P.z = tx(spot.j); collide(P, 0.3, 'me'); } say('You drag yourself back up.', 3, '#ffe36a'); }
/* ---------- guest side ---------- */
function clientData(L, m) {
  if (m.t === 'hello?') return;
  if (m.t === 'closed') { NET.err = 'The host closed the room.'; netLost(); return; }
  if (m.t === 'start') { guestStart(m); return; }
  if (!G || G.net !== 'guest') return;
  if (m.t === 'floor') { KIT.closeMenu(); G.seed = m.seed; loadFloor(m.fi, m.how); G.wake = 1.4; return; }
  if (m.t === 'snap') { guestSnap(m); return; }
  if (m.t === 'loot') { var old = {}; G.loot.forEach(function (l) { old[l.id] = l; }); G.loot = m.L.map(function (q) { var o = old[q[0]]; return { id: q[0], x: q[1], z: q[2], k: q[3], own: q[4] || undefined, n: q[5] >= 0 ? q[5] : undefined, t: o ? o.t : Math.random() * 6, asked: o && o.asked }; }).filter(function (l) { return LOOT[l.k]; }); return; }
  if (m.t === 'got') { gotLoot(m.l); return; }
  if (m.t === 'ev') { guestEv(m.e || {}); return; }
}
function guestSnap(s) {
  var R = G.R; if (R && s.P) unpackP(R, s.P); if (!FL) return;
  if (G.mode === 'play' || G.mode === 'win' || G.mode === 'crash') { FL.cellLocked = s.cl; G.keys = s.keys || {}; }
  if (s.tb && G.tb) { var tb = G.tb, q = s.tb; tb.tx = q.x; tb.tz = q.z; if (tb.x < -40 || Math.hypot(tb.x - q.x, tb.z - q.z) > 4) { tb.x = q.x; tb.z = q.z; } tb.a = q.a; tb.ph = q.ph; tb.spd = q.spd; tb.sus = q.sus; tb.clown = q.clown; tb.fire = q.fire; tb.angry = q.angry; tb.hp = q.hp; tb.max = q.max; tb.phase = q.phase; tb.mv = q.mv ? { k: q.mv[0], t: q.mv[1] } : null; tb.stun = q.stun; tb.hurtT = q.hurtT; tb.downT = q.downT; tb.flinch = q.flinch; if (G.mode !== 'catch' && G.mode !== 'crash') tb.st = q.st; }
  if (s.f) { var map = {}; G.foes.forEach(function (f) { map[f.id] = f; }); G.foes = s.f.map(function (q) { var f = map[q[0]] || { id: q[0], k: q[12], d: FOES[q[12]] || FOES.gimp, x: q[1], z: q[2], hurt: 0, ph: 0 }; f.tx = q[1]; f.tz = q[2]; if (Math.hypot(f.x - q[1], f.z - q[2]) > 3) { f.x = q[1]; f.z = q[2]; } f.a = q[3]; if (f.st !== 'dead' && q[4] === 'dead') f.t = 0; f.st = q[4]; f.ph = q[5]; f.spd = q[6]; f.atk = q[7]; f.hurt = Math.max(f.hurt || 0, q[8]); f.sus = q[9]; f.poison = q[10]; f.burnT = q[11]; f.k = q[12]; f.d = FOES[q[12]] || FOES.gimp; f.hp = q[13]; f.max = q[14]; f.under = q[15]; f.y = q[16]; f.wind = q[17]; f.p2 = q[18]; f.mv = q[19] ? { k: q[19] } : null; f.spinT = q[20]; return f; }); }
  if (s.hz) G.hazards = s.hz.map(function (q) { return { x: q[0], z: q[1], r: q[2], t: q[3], k: q[4], delay: q[5] }; });
  if (s.bags) G.bagsNet = s.bags; if (s.burns) G.burns = s.burns.map(function (q) { return { x: q[0], z: q[1], t: q[2], r: q[3] }; }); if (s.shots) G.shots = s.shots.map(function (q) { return { x: q[0], y: q[1], z: q[2], vx: 0, vz: 0, t: 1, tex: q[3] || null, sz: q[4] }; });
  if (s.dr && DR) { var d = s.dr; ['z', 'x', 'yaw', 'v', 'steer', 'hp', 'end', 'hits', 'splat'].forEach(function (k) { DR[k] = d[k]; }); DR.peds = d.peds.map(function (q) { return { id: q[0], k: q[1], z: q[2], x: q[3], st: q[4], y: q[5], spin: q[6], a: q[7], ph: q[8] }; }); }
  if (s.rd && RD) { RD.d = s.rd.d; RD.v = s.rd.v; RD.fly = s.rd.fly; }
  if (s.doors && FL.doors) s.doors.forEach(function (o, i) { if (FL.doors[i]) FL.doors[i].open = o; });
}
function stepGuestWorld(dt) { // smooth the host's people between snapshots
  G.foes.forEach(function (f) { f.hurt = Math.max(0, (f.hurt || 0) - dt); f.t = (f.t || 0) + dt; if (f.tx !== undefined) { f.x += (f.tx - f.x) * Math.min(1, dt * 10); f.z += (f.tz - f.z) * Math.min(1, dt * 10); } });
  var tb = G.tb; if (tb && tb.tx !== undefined) { tb.x += (tb.tx - tb.x) * Math.min(1, dt * 10); tb.z += (tb.tz - tb.z) * Math.min(1, dt * 10); }
  if (G.bagsNet) G.bags = G.bagsNet.map(function (q) { return { x: q[0], y: q[1], z: q[2], vx: 0, vz: 0, vy: 0, t: 1, ghost: 1 }; });
}
function guestEv(e) { var P = G.P;
  if (e.k === 'say') say(e.s, e.t, e.col); else if (e.k === 'sub') { G.sub = { who: e.who, s: e.s, t: e.t || 3.2 }; voice(e.who, e.s); }
  else if (e.k === 'hurt') hurtPlayer(P, +e.dmg || 0, { x: e.fx, z: e.fz }, +e.dose || 0);
  else if (e.k === 'caught') catchPlayer(P);
  else if (e.k === 'blood') blood(e.x, 1.2, e.z, e.n || 6);
  else if (e.k === 'sfx') sfx.play(e.n); else if (e.k === 'splat') G.splatT = 3.2; else if (e.k === 'scene') guestScene(e);
  else if (e.k === 'climb') { G.mode = 'trans'; G.trans = 0; music.stop(1); }
  else if (e.k === 'crash') startCrash();
  else if (e.k === 'win') { G.mode = 'win'; G.winT = 0; G.tb.st = 'dead'; music.stop(0.5); }
  else if (e.k === 'over') gameOver(e.why || 'dead');
  else if (e.k === 'revive') reviveMe();
  else if (e.k === 'tripup') G.trip = Math.min(TRIPMAX, G.trip + (+e.n || 0));
  else if (e.k === 'forceev') forceEv(e.e, e.len);
  else if (e.k === 'qte' && RD) startQte(e.key, e.s, e.who, e.dmg);
  else if (e.k === 'rdark' && RD) RD.dark = e.t;
  else if (e.k === 'rpop' && RD) RD.pops.push({ d: e.d, side: e.side, t: e.who === 'sheet' ? 3 : 7, who: e.who, wave: e.who === 'tbclown' ? 1 : 0 });
  else if (e.k === 'rbehind' && RD) RD.behind = { t: 4.5 };
  else if (e.k === 'rfly' && RD) RD.fly = 0.01;
}
function netLost() { var e = NET.err; netLeave(); if (G && G.mode !== 'title') { G = null; } KIT.closeMenu(); onlineMenu(e); }
/* ---------- starting a game together ---------- */
function hostStart(cont) {
  var r = SV.run; KIT.closeMenu(); SV.runs++; persist();
  G = freshG(cont && r ? r.seed : (Math.random() * 1e9) >>> 0); G.net = 'host'; G.R = newPlayer('lab'); G.R.name = NET.mate ? NET.mate.name : 'SHITHEAD LABOOZIE';
  if (cont && r) { var P = G.P; P.hp = Math.max(40, r.hp); P.weaps = r.weaps; P.weap = r.weap; P.ammo = r.ammo; P.inv = r.inv; P.buffs = r.buffs || []; G.trip = r.trip; G.read = r.read || {}; G.kills = r.kills; G.caught = r.caught; G.pills = r.pills; G.time = r.time; }
  netToGuest({ t: 'start', seed: G.seed, intro: cont && r ? 0 : 1, name: netMe().name });
  if (cont && r) { G.henchDone = r.done || {}; loadFloor(r.fi, r.arena ? 'arena' : r.fi === 0 ? 'new' : 'up'); music.stop(1); } else { G.mode = 'intro'; G.introT = 0; music.stop(1); }
}
function guestStart(m) {
  KIT.closeMenu(); G = freshG(m.seed); G.net = 'guest'; G.P = newPlayer('lab'); G.R = newPlayer('cum'); G.R.name = String(m.name || 'CUMHEAD').slice(0, 14);
  G.mode = m.intro ? 'intro' : 'wait'; G.introT = 0; music.stop(1);
}
/* ---------- the menus ---------- */
function onlineMenu(err) {
  if (window.HSProfile && !HSProfile.has()) { HSProfile.edit(function (p) { if (p) onlineMenu(); else titleMenu(); }, { title: 'YOUR NAME FOR ONLINE' }); return; }
  NET.onChange = null;
  KIT.menu({ cls: 'pn plain', title: 'Play online', sub: (err ? err + '  ·  ' : '') + 'Two of you: Cumhead (the host) and Shithead Laboozie (whoever joins).', items: [
    { label: 'HOST A GAME (CUMHEAD)', def: 1, fn: function () { KIT.menu({ cls: 'pn plain', title: 'Opening a room...', items: [{ label: 'CANCEL', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); netHost(function (ok) { if (ok) hostLobby(); else onlineMenu(NET.err || 'Could not open a room.'); }); } },
    { label: 'JOIN A GAME (SHITHEAD LABOOZIE)', fn: function () { joinPad(''); } },
    { label: 'BACK', back: 1, fn: function () { netLeave(); titleMenu(); } }], note: 'Some networks block direct connections. Home wifi works best.' });
}
function hostLobby() {
  NET.onChange = function () { if (NET.role === 'host') hostLobby(); };
  var mate = NET.mate, r = SV.run;
  KIT.menu({ cls: 'pn plain', title: 'Room ' + NET.code, sub: mate ? 'Shithead Laboozie is here: ' + mate.name : 'Tell your friend the code: ' + NET.code + '. Waiting for Shithead Laboozie...', items: [
    mate ? { label: 'START A NEW NIGHTMARE', def: 1, fn: function () { NET.onChange = null; hostStart(false); } } : null,
    mate && r ? { label: 'CARRY ON FROM ' + (FLOORS[r.fi].n || FLOORS[r.fi].name), fn: function () { NET.onChange = null; hostStart(true); } } : null,
    { label: 'CLOSE THE ROOM', back: 1, fn: function () { netLeave(); onlineMenu(); } }] });
}
function joinPad(code) {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ', items = abc.split('').map(function (c) { return { label: c, cls: 'key', fn: function () { if (code.length < 5) joinPad(code + c); } }; });
  items.push({ label: 'DELETE', cls: 'key2', fn: function () { joinPad(code.slice(0, -1)); } });
  items.push({ label: 'JOIN', cls: 'key2', def: code.length === 5, fn: function () { if (code.length !== 5) return; KIT.menu({ cls: 'pn plain', title: 'Joining room ' + code + '...', items: [{ label: 'CANCEL', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); netJoin(code, function (ok) { if (ok) KIT.menu({ cls: 'pn plain', title: 'In room ' + code, sub: 'Waiting for the host to start...', items: [{ label: 'LEAVE', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); else onlineMenu(NET.err || 'Could not join.'); }); } });
  items.push({ label: 'BACK', back: 1, fn: function () { onlineMenu(); } });
  KIT.menu({ cls: 'pn plain pnkeys', title: 'Join a room', html: '<div class="pncode">' + (code + '_____').slice(0, 5) + '</div>', grid: true, items: items });
}
(function () { var st = document.createElement('style'); st.textContent = '#menu.pnkeys .mlist.grid{grid-template-columns:repeat(6,1fr);gap:6px}#menu.pnkeys .mbtn.key{padding:8px 0;min-height:40px;text-align:center}#menu.pnkeys .mbtn.key2{grid-column:span 3}#menu.pnkeys .mbtn[data-back]{grid-column:span 6}#menu .pncode{font-family:"Press Start 2P",monospace;font-size:26px;letter-spacing:.3em;color:#ffe36a;text-align:center;padding:10px;background:#070405;box-shadow:inset 0 0 0 1px #4a1a1c;margin-bottom:8px}';
  document.head.appendChild(st);
  window.addEventListener('keydown', function (e) { var m = document.querySelector('#menu.pnkeys'); if (!m || m.hidden) return; var c = (e.key || '').toUpperCase(), cur = (m.querySelector('.pncode') || {}).textContent || ''; cur = cur.replace(/_/g, '');
    if (c.length === 1 && 'ABCDEFGHJKLMNPQRSTUVWXYZ'.indexOf(c) >= 0) { e.preventDefault(); e.stopPropagation(); if (cur.length < 5) joinPad(cur + c); } else if (e.key === 'Backspace') { e.preventDefault(); joinPad(cur.slice(0, -1)); } }, true); })();
