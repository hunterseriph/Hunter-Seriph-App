/* =====================================================================================================
   ONLINE CO-OP (update 156, his ask: player 2 is Shithead Laboozie). Kart's and Psycho Nightmare's tiny WebRTC link
   (no library; the free public PeerJS signalling server only passes the "how do I reach you" messages; host id
   'hsccn-' + room code). The host is Cumhead and owns the story: his missions, the time, the weather. The guest is
   Shithead Laboozie, the sheriff, in the same city: each machine runs its own people and traffic, the two players see
   each other (on foot, in any car or bike, shooting), the guest sees the host's mission, markers and cutscene lines and
   can help (kills he makes on mission targets count: they are the host's people, so he sends the hit), and the guest's
   own save is never touched. Some networks block direct connections; home wifi works best.
   ===================================================================================================== */
var SIGURL = (function () { try { var q = location.search.match(/[?&]sig=([^&]+)/); if (q) return decodeURIComponent(q[1]); var s = localStorage.getItem('ccn-sig') || localStorage.getItem('ck-sig'); if (s) return s; } catch (e) {} return 'wss://0.peerjs.com/peerjs?key=peerjs'; })();
var ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
function rid(n, abc) { abc = abc || 'abcdefghijkmnpqrstuvwxyz23456789'; var s = ''; for (var i = 0; i < n; i++) s += abc[Math.floor(Math.random() * abc.length)]; return s; }
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
    L.pc.createOffer().then(function (o) { return L.pc.setLocalDescription(o); }).then(function () { sig.send({ type: 'OFFER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, label: 'ccn', reliable: true, serialization: 'json', browser: 'ccn' } }); });
  } else L.pc.ondatachannel = function (e) { if (e.channel.label === 'ctl') L.ctl = e.channel; else L.fast = e.channel; wire(e.channel); };
  L.signal = function (m) {
    var p = m.payload || {};
    if (m.type === 'OFFER') L.pc.setRemoteDescription(p.sdp).then(function () { return L.pc.createAnswer(); }).then(function (a) { return L.pc.setLocalDescription(a); }).then(function () { sig.send({ type: 'ANSWER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, browser: 'ccn' } }); L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'ANSWER') L.pc.setRemoteDescription(p.sdp).then(function () { L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'CANDIDATE' && p.candidate) { if (L.pc.remoteDescription) L.pc.addIceCandidate(p.candidate).catch(function () {}); else L.queue.push(p.candidate); }
  };
  L.send = function (m, fast) { var ch = fast ? L.fast : L.ctl; if (ch && ch.readyState === 'open') { try { ch.send(JSON.stringify(m)); } catch (e) {} } };
  L.close = function () { try { L.pc.close(); } catch (e) {} };
  return L;
}
var NET = { role: null, code: '', sig: null, link: null, host: null, mate: null, err: '', onChange: null, sendT: 0 };
function isGuest() { return NET.role === 'client'; }
function netMe() { var p = window.HSProfile ? HSProfile.get() : null; return { name: (p && p.name) || 'Player' }; }
function netHost(done) {
  netLeave(); NET.role = 'host'; NET.code = rid(5, 'ABCDEFGHJKLMNPQRSTUVWXYZ'); NET.err = ''; NET.mate = null;
  NET.sig = Signal('hsccn-' + NET.code.toLowerCase(), {
    open: function () { done && done(true); done = null; netChanged(); },
    error: function (e) { NET.err = e; netChanged(); done && done(false); done = null; },
    msg: function (m) { var L = NET.link && NET.link.remote === m.src ? NET.link : null;
      if (m.type === 'OFFER' && !L) { if (NET.link && NET.link.up) return; L = NET.link = Link(NET.sig, m.src, (m.payload || {}).connectionId, false, { up: function () {}, data: hostData, close: hostDrop }); }
      if (L) L.signal(m); } });
}
function netJoin(code, done) {
  netLeave(); NET.role = 'client'; NET.code = code.toUpperCase(); NET.err = '';
  var host = 'hsccn-' + NET.code.toLowerCase(), timer = setTimeout(function () { if (!NET.host || !NET.host.up) { NET.err = 'Could not reach room ' + NET.code + '. Check the code, or the host\'s network may block direct connections.'; netChanged(); done && done(false); done = null; } }, 15000);
  NET.sig = Signal('hsccnc-' + rid(10), {
    open: function () { NET.host = Link(NET.sig, host, 'dc_' + rid(10), true, { up: function (l) { clearTimeout(timer); l.send({ t: 'join', p: netMe() }); done && done(true); done = null; }, data: clientData, close: function () { NET.err = 'The host left.'; if (NET.role === 'client') netLost(); } }); },
    error: function (e) { NET.err = e; netChanged(); clearTimeout(timer); done && done(false); done = null; },
    expire: function () { NET.err = 'No room with the code ' + NET.code + '.'; clearTimeout(timer); netChanged(); done && done(false); done = null; },
    msg: function (m) { if (NET.host && m.src === host) NET.host.signal(m); } });
}
function netLeave() {
  try { if (NET.role === 'client' && NET.host) NET.host.send({ t: 'bye' }); if (NET.role === 'host' && NET.link) NET.link.send({ t: 'closed' }); } catch (e) {}
  if (NET.link) NET.link.close(); if (NET.host) NET.host.close(); if (NET.sig) NET.sig.close();
  NET.role = null; NET.link = null; NET.host = null; NET.sig = null; NET.mate = null; G.coop = null; if (G.guest && G.svBack) { SV = JSON.parse(G.svBack); G.svBack = null; } G.guest = 0;
}
function netChanged() { if (NET.onChange) NET.onChange(); }
function netSendOther(m, fast) { if (NET.role === 'client' && NET.host) NET.host.send(m, fast); else if (NET.role === 'host' && NET.link && NET.link.up) NET.link.send(m, fast); }
/* ---------- what goes over the wire ---------- */
function r2(v) { return Math.round((v || 0) * 100) / 100; }
function packMe() { var o = { x: r2(P.x), y: r2(P.y), z: r2(P.z), a: r2(P.a), sp: r2(P.sp || 0), st: P.state, w: P.wpn, aim: P.aim ? 1 : 0, hp: Math.round(P.hp), hurt: P.hurtT > 0.3 ? 1 : 0 };
  if (P.state === 'car' && P.veh) { var v = P.veh; o.v = { k: v.type, c: v.col, x: r2(v.x), y: r2(v.y), z: r2(v.z), a: r2(v.a), p: r2(v.pitch), r: r2(v.roll), w: r2(v.wheelA), s: r2(v.sp), h: v.siren && G.sirenOn ? 1 : 0 }; }
  return o; }
function packWorld() { var mk = G.mission && G.mission.mark; return { time: r2(G.time), day: G.day, wx: G.wx ? G.wx.k : null, obj: G.objective || null, mk: mk ? [r2(mk.x), r2(mk.z)] : null, cnt: G.counter || null, tmr: G.timer != null ? Math.round(G.timer) : null, sub: G.sub ? { who: G.sub.who, s: G.sub.s } : null }; }
function netStep(dt) {
  if (!NET.role || !G.coop || !P) return; NET.sendT -= dt;
  if (NET.sendT <= 0) { NET.sendT = 1 / 15; var m = { t: 'st', p: packMe() }; if (NET.role === 'host') m.w = packWorld(); netSendOther(m, true); }
  var R = G.coop.other; if (!R || !R.tg) return; var k = Math.min(1, dt * 12), T = R.tg;
  ['x', 'y', 'z'].forEach(function (q) { R[q] += (T[q] - R[q]) * k; }); if (Math.hypot(T.x - R.x, T.z - R.z) > 30) { R.x = T.x; R.y = T.y; R.z = T.z; }
  R.a += angDiff(R.a, T.a) * k; R.sp = T.sp; R.ph = (R.ph || 0) + dt * R.sp * 2.4; R.st = T.st; R.w = T.w; R.aim = T.aim; R.hurt = T.hurt;
  if (T.v) { var pv = R.pv; if (!pv || pv.type !== T.v.k || pv.col !== T.v.c) { var i0 = VEH.length; pv = makeVeh(T.v.k, T.v.x, T.v.z, T.v.a, { col: T.v.c }); if (VEH.indexOf(pv) >= 0) VEH.splice(VEH.indexOf(pv), 1); pv.puppet = 1; R.pv = pv; pv.y = T.v.y; }
    pv.x += (T.v.x - pv.x) * k; pv.y += (T.v.y - pv.y) * k; pv.z += (T.v.z - pv.z) * k; if (Math.hypot(T.v.x - pv.x, T.v.z - pv.z) > 30) { pv.x = T.v.x; pv.z = T.v.z; pv.y = T.v.y; }
    pv.a += angDiff(pv.a, T.v.a) * k; pv.pitch = T.v.p; pv.roll = T.v.r; pv.wheelA = T.v.w; pv.sp = T.v.s; R.veh = 1; R.x = pv.x; R.z = pv.z; R.y = pv.y; }
  else { R.veh = 0; R.pv = null; }
  // players don't walk through each other's cars
  if (R.pv && P.state === 'foot') { var v = R.pv, c = Math.cos(v.a), s = Math.sin(v.a), dx = P.x - v.x, dz = P.z - v.z, lx = dx * c - dz * s, lz = dx * s + dz * c, hx = v.t.wid / 2 + 0.3, hz = v.t.len / 2 + 0.3;
    if (Math.abs(lx) < hx && Math.abs(lz) < hz) { if (hx - Math.abs(lx) < hz - Math.abs(lz)) lx = Math.sign(lx) * hx; else lz = Math.sign(lz) * hz; P.x = v.x + lx * c + lz * s; P.z = v.z - lx * s + lz * c; if (Math.abs(v.sp) > 6) hurtPlayer(Math.abs(v.sp) * 0.6, null); } }
}
function remoteIn(p) { var R = G.coop.other; if (!R) { R = G.coop.other = { x: p.x, y: p.y, z: p.z, a: p.a, sp: 0, ph: 0 }; G.coop.others = [R]; } R.tg = p; R.name = (NET.mate && NET.mate.name) || R.name || ''; }
function hostData(L, m) {
  if (m.t === 'join') { NET.mate = m.p || { name: 'Player' }; netChanged(); if (G.mode === 'play' && P) hostStart(); }
  else if (m.t === 'st') { if (G.coop) remoteIn(m.p); }
  else if (m.t === 'hit') { var q = PEDS.filter(function (p) { return p.nid === m.id; })[0]; if (q && !q.dead) hurtPed(q, m.d, G.coop && G.coop.other ? G.coop.other : null, null); }
  else if (m.t === 'bye') hostDrop(L);
}
function hostDrop(L) { if (NET.link === L) NET.link = null; try { L.close(); } catch (e) {} NET.mate = null; if (G.coop) { G.coop.other = null; G.coop.others = []; } netChanged(); if (G.mode === 'play') toast('Shithead Laboozie has left Cum City.'); }
function clientData(L, m) {
  if (m.t === 'start') { guestStart(m); }
  else if (m.t === 'st') { if (G.coop) { remoteIn(m.p); if (m.w) guestWorld(m.w); } }
  else if (m.t === 'ids') { (m.list || []).forEach(function (q) { var p = makePed({ x: q[1], z: q[2], kind: 'goon', rig: RIGS.goon, hostile: 1, hp: q[3], wpn: 'pistol', mission: 1, keep: 1 }); p.nid = q[0]; }); }
  else if (m.t === 'dead') { PEDS.forEach(function (p) { if (p.nid === m.id && !p.dead) { p.hp = 0; p.dead = 1; } }); }
  else if (m.t === 'closed') { NET.err = 'The host closed the room.'; netLost(); }
}
function netLost() { var e = NET.err; netLeave(); KIT.closeMenu(); G.mode = 'title'; P = null; onlineMenu(e); }
/* the host's story, shown to the guest */
function guestWorld(w) { G.time = w.time; G.day = w.day; G.objective = w.obj ? 'Help Cumhead: ' + w.obj : null; G.counter = w.cnt; G.timer = w.tmr; G.coopMark = w.mk ? { x: w.mk[0], z: w.mk[1] } : null;
  if (w.sub) { if (!G.sub || G.sub.s !== w.sub.s) { subtitle(w.sub.who, w.sub.s, 99); var who = Object.keys(CAST).filter(function (k) { return CAST[k].name === w.sub.who; })[0]; if (who && typeof voiceLine === 'function') voiceLine(who, w.sub.s); } } else if (G.sub && G.sub.coop) G.sub = null; if (G.sub && w.sub) G.sub.coop = 1; }
/* mission targets the host spawns get ids so the guest can fight them too */
var _stepInitNet = stepInit;
stepInit = function (s) { _stepInitNet(s); if (NET.role === 'host' && G.coop && s.t === 'kill' && MS && MS.st.list) { var L = MS.st.list.map(function (p) { p.nid = p.nid || Math.floor(Math.random() * 1e9); return [p.nid, Math.round(p.x), Math.round(p.z), p.hp]; }); netSendOther({ t: 'ids', list: L }); } };
var _hurtPedNet = hurtPed;
hurtPed = function (p, dmg, by, dir, car) { var r = _hurtPedNet(p, dmg, by, dir, car); if (p.nid) { if (NET.role === 'client' && by === P) netSendOther({ t: 'hit', id: p.nid, d: dmg }); if (NET.role === 'host' && p.dead) netSendOther({ t: 'dead', id: p.nid }); } return r; };
/* ---------- starting together ---------- */
function hostStart() { G.coop = { other: null, others: [] }; if (G.mode !== 'play' || !P) startGame(false); G.coop = G.coop || { other: null, others: [] }; KIT.closeMenu();
  var a = P.a + Math.PI / 2; netSendOther({ t: 'start', x: P.x + Math.sin(a) * 2.5, z: P.z + Math.cos(a) * 2.5, a: P.a, time: G.time, day: G.day }); toast('Shithead Laboozie is in Cum City. ' + (NET.mate ? NET.mate.name : '')); }
function guestStart(m) { G.guest = 1; G.svBack = JSON.stringify(SV); startGame(false, true); G.coop = { other: null, others: [] }; P.x = m.x; P.z = m.z; P.y = standY(P.x, P.z, 999); P.a = m.a; G.time = m.time; G.day = m.day; P.rig = 'laboozie'; G.cut = null; G.sub = null; KIT.closeMenu(); CAM.snap = 1;
  bigText('SHERIFF OF CUM CITY', 'Shithead Laboozie, riding with Cumhead', '#ffe36a', 3.5); }
// the guest never saves over his own game, never starts missions or the intro
var _persistNet = persist;
persist = function () { if (G.guest) return; return _persistNet(); };
var _startMissionNet = startMission;
startMission = function (m) { if (G.guest) { toast('Cumhead runs the jobs in co-op. Ride along!'); return; } return _startMissionNet(m); };
/* ---------- drawing the other player ---------- */
var _dwsNet = drawWorldStuff;
drawWorldStuff = function () { _dwsNet(); var R = G.coop && G.coop.other; if (!R || !R.tg || G.interior) return;
  var rig = RIGS[isGuest() ? 'cumhead' : 'laboozie'];
  if (R.pv) { drawVeh(R.pv); if (R.pv.t.cls === 'bike' || R.pv.t.cls === 'board' || R.pv.t.carry) { var Q2 = pose0(); if (R.pv.t.cls === 'board') poseRideStand(Q2); else { poseSit(Q2); Q2.y = -0.35; } drawPerson(rig, R.pv.x, R.pv.y + (R.pv.t.cls === 'board' ? 0.15 : 0.35), R.pv.z, R.pv.a, Q2, { noShadow: 1 }); } return; }
  var Q = pose0(); if (R.sp > 0.3) poseWalk(Q, R.ph, Math.min(1, R.sp / 5)); var W0 = WPN[R.w] || WPN.fists; if (R.aim && !W0.melee) { Q.sh[0] = [1.5, 0.1, 0]; Q.el[0] = 0.1; }
  drawPerson(rig, R.x, R.y, R.z, R.a, Q, { held: W0.mesh ? RIGS[W0.mesh] : null, heldP: W0.swing ? -Math.PI / 2 - 0.2 : -Math.PI / 2, flash: R.hurt ? [0.5, 0, 0] : null }); };
/* ---------- menus ---------- */
function onlineMenu(err) {
  if (window.HSProfile && HSProfile.has && !HSProfile.has()) { HSProfile.edit(function (p) { if (p) onlineMenu(); else titleMenu(); }, { title: 'YOUR NAME FOR ONLINE' }); return; }
  NET.onChange = null;
  KIT.menu({ cls: 'clear', title: 'Online Co-op', sub: (err ? err + '  ·  ' : '') + 'Two of you: Cumhead, the mayor (the host, his own save), and Shithead Laboozie, the sheriff (whoever joins).', items: [
    { label: 'HOST (CUMHEAD)', def: 1, fn: function () { KIT.menu({ title: 'Opening a room...', items: [{ label: 'CANCEL', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); netHost(function (ok) { if (ok) hostLobby(); else onlineMenu(NET.err || 'Could not open a room.'); }); } },
    { label: 'JOIN (SHITHEAD LABOOZIE)', fn: function () { joinPad(''); } },
    { label: 'BACK', back: 1, fn: function () { netLeave(); titleMenu(); } }] });
}
function hostLobby() { NET.onChange = function () { if (NET.role === 'host' && G.mode !== 'play') hostLobby(); };
  KIT.menu({ cls: 'clear', title: 'Room ' + NET.code, sub: NET.mate ? 'Shithead Laboozie is here: ' + NET.mate.name : 'Tell your friend the code: ' + NET.code + '. Waiting for Shithead Laboozie...', items: [
    NET.mate ? { label: 'RIDE OUT', cls: 'hot', def: 1, fn: function () { NET.onChange = null; hostStart(); } } : null,
    { label: 'CLOSE THE ROOM', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); }
function joinPad(code) {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ', items = abc.split('').map(function (c) { return { label: c, cls: 'key', fn: function () { if (code.length < 5) joinPad(code + c); } }; });
  items.push({ label: 'DELETE', cls: 'key2', fn: function () { joinPad(code.slice(0, -1)); } });
  items.push({ label: 'JOIN', cls: 'key2', def: code.length === 5, fn: function () { if (code.length !== 5) return; KIT.menu({ title: 'Joining room ' + code + '...', items: [{ label: 'CANCEL', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); netJoin(code, function (ok) { if (ok) KIT.menu({ title: 'In room ' + code, sub: 'Waiting for Cumhead to ride out...', items: [{ label: 'LEAVE', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); else onlineMenu(NET.err || 'Could not join.'); }); } });
  items.push({ label: 'BACK', back: 1, fn: function () { onlineMenu(); } });
  KIT.menu({ cls: 'ccnkeys', title: 'Join a room', html: '<div class="pncode">' + (code + '_____').slice(0, 5) + '</div>', grid: true, items: items });
}
(function () { var st = document.createElement('style'); st.textContent = '#menu.ccnkeys .mlist.grid{grid-template-columns:repeat(6,1fr);gap:6px}#menu.ccnkeys .mbtn.key{padding:8px 0;min-height:40px;text-align:center}#menu.ccnkeys .mbtn.key2{grid-column:span 3}#menu.ccnkeys .mbtn[data-back]{grid-column:span 6}#menu .pncode{font-family:"Press Start 2P",monospace;font-size:26px;letter-spacing:.3em;color:#ffe36a;text-align:center;padding:10px;background:#070405;box-shadow:inset 0 0 0 1px #4a1a1c;margin-bottom:8px}';
  document.head.appendChild(st);
  window.addEventListener('keydown', function (e) { var m = document.querySelector('#menu.ccnkeys'); if (!m || m.hidden) return; var c = (e.key || '').toUpperCase(), cur = ((m.querySelector('.pncode') || {}).textContent || '').replace(/_/g, '');
    if (c.length === 1 && 'ABCDEFGHJKLMNPQRSTUVWXYZ'.indexOf(c) >= 0) { e.preventDefault(); e.stopPropagation(); if (cur.length < 5) joinPad(cur + c); } else if (e.key === 'Backspace') { e.preventDefault(); joinPad(cur.slice(0, -1)); } }, true); })();
var _missionGiversNet = missionGivers;
missionGivers = function () { return G.guest ? [] : _missionGiversNet(); };
