/* =====================================================================================================
   ONLINE: a tiny WebRTC link between players, no library and no server of our own.
   Players find each other through the free public PeerJS signalling server (0.peerjs.com): it only passes
   the "how do I reach you" messages along, then the karts talk to each other directly (peer to peer).
   The host's room code is part of their id ('hskart-' + code). Each link has two data channels:
   'ctl' (reliable, in order: lobby, items, hits, results) and 'fast' (unreliable: positions many times a second).
   No secrets or keys of ours are involved ('peerjs' is the public key everyone uses).
   ===================================================================================================== */
var SIGURL = (function () { try { var q = location.search.match(/[?&]sig=([^&]+)/); if (q) return decodeURIComponent(q[1]); var s = localStorage.getItem('ck-sig'); if (s) return s; } catch (e) {} return 'wss://0.peerjs.com/peerjs?key=peerjs'; })();
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
    L.pc.createOffer().then(function (o) { return L.pc.setLocalDescription(o); }).then(function () { sig.send({ type: 'OFFER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, label: 'ck', reliable: true, serialization: 'json', browser: 'ck' } }); });
  } else L.pc.ondatachannel = function (e) { if (e.channel.label === 'ctl') L.ctl = e.channel; else L.fast = e.channel; wire(e.channel); };
  L.signal = function (m) {
    var p = m.payload || {};
    if (m.type === 'OFFER') L.pc.setRemoteDescription(p.sdp).then(function () { return L.pc.createAnswer(); }).then(function (a) { return L.pc.setLocalDescription(a); }).then(function () { sig.send({ type: 'ANSWER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, browser: 'ck' } }); L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'ANSWER') L.pc.setRemoteDescription(p.sdp).then(function () { L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'CANDIDATE' && p.candidate) { if (L.pc.remoteDescription) L.pc.addIceCandidate(p.candidate).catch(function () {}); else L.queue.push(p.candidate); }
  };
  L.send = function (m, fast) { var ch = fast ? L.fast : L.ctl; if (ch && ch.readyState === 'open') { try { ch.send(JSON.stringify(m)); } catch (e) {} } };
  L.close = function () { try { L.pc.close(); } catch (e) {} };
  return L;
}
/* ---------- the room ---------- */
var NET = { role: null, code: '', sig: null, links: [], host: null, players: [], meIdx: 0, msgs: [], onChange: null, err: '' };
function netMe() { var p = window.HSProfile ? HSProfile.get() : { name: 'Player', pic: 'cumhead' }; return { name: p.name || 'Player', pic: p.pic, ch: SV.ch }; }
function netHost(done) {
  netLeave(); NET.role = 'host'; NET.code = rid(5, 'ABCDEFGHJKLMNPQRSTUVWXYZ'); NET.players = [Object.assign({ id: 'host', ready: true }, netMe())]; NET.meIdx = 0; NET.err = '';
  NET.sig = Signal('hskart-' + NET.code.toLowerCase(), {
    open: function () { done && done(true); netChanged(); },
    error: function (e) { NET.err = e; netChanged(); done && done(false); done = null; },
    msg: function (m) {
      var L = NET.links.filter(function (l) { return l.remote === m.src; })[0];
      if (m.type === 'OFFER' && !L) {
        if (NET.players.length >= 8 || NET.locked) return; // the room is full (or racing)
        L = Link(NET.sig, m.src, (m.payload || {}).connectionId, false, { up: function (l) { l.send({ t: 'hello?' }); }, data: hostData, close: hostDrop }); NET.links.push(L);
      }
      if (L) L.signal(m);
    } });
}
function netJoin(code, done) {
  netLeave(); NET.role = 'client'; NET.code = code.toUpperCase(); NET.err = ''; NET.players = [];
  var host = 'hskart-' + NET.code.toLowerCase(), timer = setTimeout(function () { if (!NET.host || !NET.host.up) { NET.err = 'Could not reach room ' + NET.code + '. Check the code, or the host\'s network may block direct connections.'; netChanged(); done && done(false); done = null; } }, 15000);
  NET.sig = Signal('hskartc-' + rid(10), {
    open: function () { NET.host = Link(NET.sig, host, 'dc_' + rid(10), true, { up: function (l) { clearTimeout(timer); l.send({ t: 'join', p: netMe() }); }, data: clientData, close: function () { NET.err = 'The host left.'; netChanged(); if (NET.role === 'client') netLost(); } }); },
    error: function (e) { NET.err = e; netChanged(); clearTimeout(timer); done && done(false); done = null; },
    expire: function () { NET.err = 'No room with the code ' + NET.code + '.'; clearTimeout(timer); netChanged(); done && done(false); done = null; },
    msg: function (m) { if (NET.host && m.src === host) NET.host.signal(m); } });
  NET.joined = function () { done && done(true); done = null; };
}
function netLeave() {
  if (NET.role === 'client' && NET.host) NET.host.send({ t: 'bye' });
  if (NET.role === 'host') netBroadcast({ t: 'closed' });
  NET.links.forEach(function (l) { l.close(); }); if (NET.host) NET.host.close(); if (NET.sig) NET.sig.close();
  NET.role = null; NET.links = []; NET.host = null; NET.sig = null; NET.players = []; NET.locked = false;
}
function netChanged() { if (NET.onChange) NET.onChange(); }
function netBroadcast(m, fast, except) { NET.links.forEach(function (l) { if (l.up && l !== except) l.send(m, fast); }); }
function netSend(m, fast) { if (NET.role === 'client' && NET.host) NET.host.send(m, fast); }
/* host: messages from players */
function hostData(L, m) {
  var pi = NET.players.findIndex(function (p) { return p.id === L.remote; });
  if (m.t === 'join') { if (pi < 0) { NET.players.push({ id: L.remote, name: String(m.p.name || 'Player').slice(0, 14), pic: m.p.pic, ch: CH[m.p.ch] ? m.p.ch : 'cumhead', ready: true }); } hostLobbyPush(); netChanged(); sfx.play('coin'); return; }
  if (pi < 0) return;
  if (m.t === 'bye') { hostDrop(L); return; }
  if (m.t === 'ch' && CH[m.ch]) { NET.players[pi].ch = m.ch; hostLobbyPush(); netChanged(); return; }
  if (m.t === 'st') { netReport(pi, m.s); return; }
  if (m.t === 'use') { netUse(pi, m); return; }
}
function hostDrop(L) {
  var pi = NET.players.findIndex(function (p) { return p.id === L.remote; }); NET.links = NET.links.filter(function (l) { return l !== L; }); L.close();
  if (pi > 0) { var gone = NET.players[pi]; NET.players.splice(pi, 1); if (RACE && RACE.net) RACE.karts.forEach(function (k) { if (k.netId === gone.id) { k.remote = false; k.ai = true; } }); hostLobbyPush(); netChanged(); }
}
function hostLobbyPush(back) { NET.links.forEach(function (l) { var i = NET.players.findIndex(function (p) { return p.id === l.remote; }); l.send({ t: 'lobby', players: NET.players.map(function (p) { return { name: p.name, pic: p.pic, ch: p.ch }; }), you: i, back: back ? 1 : 0 }); }); }
/* client: messages from the host */
function clientData(L, m) {
  if (m.t === 'hello?') return;
  if (m.t === 'lobby') { NET.players = m.players; NET.meIdx = m.you; if (NET.joined) { NET.joined(); NET.joined = null; } if (m.back) { RACE = null; mpLobby(); } else netChanged(); return; }
  if (m.t === 'closed') { NET.err = 'The host closed the room.'; netLost(); return; }
  if (m.t === 'start') { netClientStart(m); return; }
  if (m.t === 'snap') { netSnap(m); return; }
  if (m.t === 'ev') { netEvent(m); return; }
  if (m.t === 'end') { netClientEnd(m); return; }
}
function netLost() { var e = NET.err; netLeave(); RACE = null; mpMenu(e); }
