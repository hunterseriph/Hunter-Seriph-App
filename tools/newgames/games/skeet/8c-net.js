/* =====================================================================================================
   ONLINE (his ask): VERSUS, a one on one between two players, and CO-OP for up to four, the brawler stages played
   together. At a boss player 1 picks who fights it; if that player loses it passes to the next one, until everyone
   has lost or the boss is down. Foes get tougher and come in bigger crowds with more of you (coK / coExtra).
   The same tiny WebRTC link as Cumhead Kart and Psycho Nightmare: no library, the free public PeerJS signalling
   server only passes the "how do I reach you" messages (host id 'hsskeet-' + room code), then the machines talk
   directly. The host runs the whole game; guests send their buttons 60 times a second (held bits plus a press
   counter per button, so a lost packet never loses a press) and draw what the host sends back (snap).
   ===================================================================================================== */
var SIGURL = (function () { try { var q = location.search.match(/[?&]sig=([^&]+)/); if (q) return decodeURIComponent(q[1]); var s = localStorage.getItem('sk-sig') || localStorage.getItem('ck-sig'); if (s) return s; } catch (e) {} return 'wss://0.peerjs.com/peerjs?key=peerjs'; })();
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
    L.pc.createOffer().then(function (o) { return L.pc.setLocalDescription(o); }).then(function () { sig.send({ type: 'OFFER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, label: 'sk', reliable: true, serialization: 'json', browser: 'sk' } }); });
  } else L.pc.ondatachannel = function (e) { if (e.channel.label === 'ctl') L.ctl = e.channel; else L.fast = e.channel; wire(e.channel); };
  L.signal = function (m) {
    var p = m.payload || {};
    if (m.type === 'OFFER') L.pc.setRemoteDescription(p.sdp).then(function () { return L.pc.createAnswer(); }).then(function (a) { return L.pc.setLocalDescription(a); }).then(function () { sig.send({ type: 'ANSWER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, browser: 'sk' } }); L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'ANSWER') L.pc.setRemoteDescription(p.sdp).then(function () { L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); });
    else if (m.type === 'CANDIDATE' && p.candidate) { if (L.pc.remoteDescription) L.pc.addIceCandidate(p.candidate).catch(function () {}); else L.queue.push(p.candidate); }
  };
  L.send = function (m, fast) { var ch = fast ? L.fast : L.ctl; if (ch && ch.readyState === 'open') { try { ch.send(typeof m === 'string' ? m : JSON.stringify(m)); } catch (e) {} } };
  L.close = function () { try { L.pc.close(); } catch (e) {} };
  return L;
}

/* ---------- the room ---------- */
var MAXP = 4, PCOL = ['#ff2630', '#ffe36a', '#7ae0e0', '#ff9ad0'];
var NET = { role: null, code: '', sig: null, links: [], host: null, players: [], meIdx: 0, err: '', onChange: null, mode: 'co', stage: 0, vstage: -1, live: false, locked: false, seq: 0, snd: [], shk: 0, fl: 0, song: '', sendT: 0, fxN: 0 };
function netMe() { var p = window.HSProfile ? HSProfile.get() : null; return { name: String((p && p.name) || 'Player').slice(0, 14), pic: p && p.pic, hero: SV.netHero && HEROES[SV.netHero] ? SV.netHero : HEROLIST[0] }; }
function netLive() { return !!(NET.role && NET.live); }
function isGuest() { return NET.role === 'client' && NET.live; }
function netHost(done) {
  netLeave(); NET.role = 'host'; NET.code = rid(5, 'ABCDEFGHJKLMNPQRSTUVWXYZ'); NET.players = [Object.assign({ id: 'host' }, netMe())]; NET.meIdx = 0; NET.err = '';
  NET.sig = Signal('hsskeet-' + NET.code.toLowerCase(), {
    open: function () { done && done(true); done = null; netChanged(); },
    error: function (e) { NET.err = e; netChanged(); done && done(false); done = null; },
    msg: function (m) {
      var L = NET.links.filter(function (l) { return l.remote === m.src; })[0];
      if (m.type === 'OFFER' && !L) { if (NET.players.length >= MAXP || NET.locked) return; L = Link(NET.sig, m.src, (m.payload || {}).connectionId, false, { up: function (l) { l.send({ t: 'hello?' }); }, data: hostData, close: hostDrop }); NET.links.push(L); }
      if (L) L.signal(m);
    } });
}
function netJoin(code, done) {
  netLeave(); NET.role = 'client'; NET.code = code.toUpperCase(); NET.err = ''; NET.players = [];
  var host = 'hsskeet-' + NET.code.toLowerCase(), timer = setTimeout(function () { if (!NET.host || !NET.host.up) { NET.err = 'Could not reach room ' + NET.code + '. Check the code, or the host\'s network may block direct connections.'; netChanged(); done && done(false); done = null; } }, 15000);
  NET.sig = Signal('hsskeetc-' + rid(10), {
    open: function () { NET.host = Link(NET.sig, host, 'dc_' + rid(10), true, { up: function (l) { clearTimeout(timer); l.send({ t: 'join', p: netMe() }); }, data: clientData, close: function () { NET.err = 'The host left.'; if (NET.role === 'client') netLost(); } }); },
    error: function (e) { NET.err = e; netChanged(); clearTimeout(timer); done && done(false); done = null; },
    expire: function () { NET.err = 'No room with the code ' + NET.code + '.'; clearTimeout(timer); netChanged(); done && done(false); done = null; },
    msg: function (m) { if (NET.host && m.src === host) NET.host.signal(m); } });
  NET.joined = function () { done && done(true); done = null; };
}
function netLeave() {
  try { if (NET.role === 'client' && NET.host) NET.host.send({ t: 'bye' }); if (NET.role === 'host') netBroadcast({ t: 'closed' }); } catch (e) {}
  NET.links.forEach(function (l) { l.close(); }); if (NET.host) NET.host.close(); if (NET.sig) NET.sig.close();
  NET.role = null; NET.links = []; NET.host = null; NET.sig = null; NET.players = []; NET.locked = false; NET.live = false; NET.onChange = null;
  G.pl = null; G.versus = null; G.me = null; G.relay = null; REP = {};
}
function netChanged() { if (NET.onChange) NET.onChange(); }
function netBroadcast(m, fast) { var s = JSON.stringify(m); NET.links.forEach(function (l) { if (l.up) l.send(s, fast); }); }
function linkOf(i) { var p = NET.players[i]; return p ? NET.links.filter(function (l) { return l.remote === p.id; })[0] : null; }
/* host: a message straight to one player (a pie in his face is only on his screen) */
function netTell(t, ev) { var L = NET.links.filter(function (l) { return l.remote === t.netId; })[0]; if (L) L.send({ t: 'ev', e: ev }); }
function hostData(L, m) {
  var pi = NET.players.findIndex(function (p) { return p.id === L.remote; });
  if (m.t === 'join') { if (pi < 0 && NET.players.length < MAXP && !NET.locked) { NET.players.push({ id: L.remote, name: String(m.p.name || 'Player').slice(0, 14), pic: m.p.pic, hero: HEROES[m.p.hero] ? m.p.hero : HEROLIST[0] }); sfx.play('coin'); } lobbyPush(); netChanged(); return; }
  if (pi < 0) return; var P0 = NET.players[pi];
  if (m.t === 'bye') { hostDrop(L); return; }
  if (m.t === 'hero' && HEROES[m.hero]) { P0.hero = m.hero; lobbyPush(); netChanged(); return; }
  if (m.t === 'in') { if (!P0.inp || m.s > P0.inp.s || m.s < P0.inp.s - 1000) { var seen = P0.inp ? P0.inp.seen : m.c.slice(); P0.inp = { s: m.s, h: m.h, c: m.c, seen: seen, bot: m.bot }; } return; }
}
function hostDrop(L) {
  var pi = NET.players.findIndex(function (p) { return p.id === L.remote; }); NET.links = NET.links.filter(function (l) { return l !== L; }); L.close();
  if (pi <= 0) return; var gone = NET.players[pi]; NET.players.splice(pi, 1);
  if (NET.live) { // mid game: the computer takes over his fighter (co-op), or the one left wins (versus)
    if (G.versus) { NET.players.length = 1; G.callout = { s: gone.name + ' LEFT', t: 2 }; netToLobby(gone.name + ' left the room.'); return; }
    (G.pl || []).forEach(function (p) { if (p.netId === gone.id) { p.netId = null; p.cpuSub = 1; p.pname = gone.name + ' (CPU)'; } });
    G.callout = { s: gone.name + ' LEFT: THE COMPUTER TAKES OVER', t: 2.4 };
  }
  lobbyPush(); netChanged();
}
function lobbyPush(back) { NET.links.forEach(function (l) { var i = NET.players.findIndex(function (p) { return p.id === l.remote; }); l.send({ t: 'lobby', players: NET.players.map(function (p) { return { name: p.name, pic: p.pic, hero: p.hero }; }), you: i, mode: NET.mode, stage: NET.mode === 'vs' ? NET.vstage : NET.stage, back: back ? 1 : 0 }); }); }
function clientData(L, m) {
  if (m.t === 'hello?') return;
  if (m.t === 'lobby') { NET.players = m.players; NET.meIdx = m.you; NET.mode = m.mode; NET.stage = m.stage; if (NET.joined) { NET.joined(); NET.joined = null; } if (m.back || !NET.live) { if (m.back) guestBack(); else netChanged(); } return; }
  if (m.t === 'closed') { NET.err = 'The host closed the room.'; netLost(); return; }
  if (m.t === 'start') { guestStart(m); return; }
  if (m.t === 'snap') { if (NET.live) guestSnap(m); return; }
  if (m.t === 'ev') { guestEv(m.e); return; }
}
function netLost() { var e = NET.err; netLeave(); KIT.closeMenu(); G.duel = null; G.pl = null; onlineMenu(e); }

/* ---------- buttons over the link ---------- */
var BTN = ['left', 'right', 'up', 'down', 'a', 'b', 'x', 'y', 'lb', 'rb'], BIT = {}; BTN.forEach(function (k, i) { BIT[k] = 1 << i; });
var _kHeld = KIT.held, _kPressed = KIT.pressed;
KIT.held = function (k) { return IN ? !!(IN.h & (BIT[k] || 0)) : _kHeld(k); };
KIT.pressed = function (k) { return IN ? !!(IN.p & (BIT[k] || 0)) : _kPressed(k); };
var GIN = { s: 0, c: BTN.map(function () { return 0; }) };
function guestSendInput() {
  var h = 0; BTN.forEach(function (k, i) { if (_kHeld(k)) h |= BIT[k]; if (_kPressed(k)) GIN.c[i]++; });
  if (KIT.menuOpen()) h = 0; GIN.s++;
  if (NET.host) NET.host.send({ t: 'in', s: GIN.s, h: h, c: GIN.c, bot: G.bot ? 1 : 0 }, true);
}
/* host, once a frame: turn each player's last report into this frame's buttons (a press = his counter went up) */
function netInputs() {
  NET.players.forEach(function (np, i) {
    if (!i) return; var e = G.pl ? G.pl.filter(function (p) { return p.netId === np.id; })[0] : G.versus && G.duel ? G.duel.foe : null; if (!e) return; var q = np.inp;
    if (!q) { e.IN = { h: 0, p: 0 }; return; }
    var p = 0; for (var j = 0; j < BTN.length; j++) if (q.c[j] > q.seen[j]) { p |= 1 << j; q.seen[j] = q.c[j]; }
    e.IN = { h: q.h, p: p, bot: q.bot };
  });
  (G.pl || []).forEach(function (e) { if (e.cpuSub) e.IN = { h: 0, p: 0, bot: 1 }; });
}

/* ---------- starting ---------- */
function hostStart() {
  var n = NET.players.length; if (n < 2) return; if (NET.mode === 'vs' && n !== 2) return;
  NET.locked = true; NET.live = true; KIT.closeMenu(); NET.players.forEach(function (p) { p.inp = null; });
  NET.links.forEach(function (L) { var i = NET.players.findIndex(function (p) { return p.id === L.remote; }); L.send({ t: 'start', you: i, mode: NET.mode }); });
  if (NET.mode === 'vs') { G.versus = { score: [0, 0] }; versusMatch(); } else coStart();
}
function coStart() {
  var NP = NET.players, n = NP.length; G.arc = null; G.duel = null; G.endArc = false; padSubs(false); G.hero = NP[0].hero; G.rush = false; G.hard = !!SV.hard; G.hardK = G.hard ? 1.35 : 1;
  G.si = NET.stage || 0; G.lives = 2 + n; G.score = 0; G.kills = 0; G.freed = 0; G.best = 0; G.runT = 0; G.conts = 0; G.versus = null; G.relay = null;
  var seen = {};
  G.pl = NP.map(function (np, i) { var e = makePlayer(np.hero); e.pi = i; e.net = i; e.netId = np.id; e.pname = np.name; if (seen[np.hero]) e.shade = ['', 'hue-rotate(160deg) saturate(1.25)', 'hue-rotate(80deg)', 'hue-rotate(260deg)'][seen[np.hero]]; seen[np.hero] = (seen[np.hero] || 0) + 1; return e; });
  P = G.pl[0]; G.me = P; startStage(G.si);
}
function versusMatch() {
  var NP = NET.players; G.pl = null; G.arc = null; G.duel = null; G.relay = null; G.rush = false; G.hard = false; G.hardK = 1; G.lives = 0; G.score = 0; G.kills = 0; G.freed = 0; G.best = 0; G.runT = 0; G.stageT = 0;
  P = makePlayer(NP[0].hero); P.pname = NP[0].name; P.pi = 0; G.me = P; G.hero = NP[0].hero;
  var si = NET.vstage >= 0 ? NET.vstage : Math.floor(Math.random() * STAGES.length); G.si = si; G.S = STAGES[si]; G.cam = 400 + si * 37; G.arena = G.cam; G.lock = G.cam;
  G.ents = []; G.shots = []; G.fx = []; G.items = []; G.props = []; G.puddles = []; G.waves = []; G.beam = null; G.sup = null; G.cutin = null; G.splat = 0;
  var o = { hero: NP[1].hero, net: 1, pname: NP[1].name }; G.vsOpp = { o: o, name: HEROES[o.hero].n, quote: HEROES[o.hero].quote, art: oppArt(o) };
  G.mode = 'vs'; G.vsT = 0; sfx.play('vs'); music.play(G.S.song); KIT.dropLayer();
}
/* co-op: everyone starts each stage together, out players come back */
var _startStage = startStage;
startStage = function (i) {
  if (!G.pl) return _startStage(i);
  P = G.pl[0]; G.relay = null; _startStage(i);
  G.pl.forEach(function (p, k) { var was = p.out; p.out = 0; p.x = 50 + k * 18; p.z = 14 + k * 14; p.h = 0; p.st = 'idle'; p.mv = null; p.vx = p.vz = 0; p.inv = 1; p.held = null; p.heldBy = null; p.face = 1;
    if (was || p.hp <= 0) p.hp = p.mhp * 0.6; else if (i > 0) p.hp = Math.min(p.mhp, p.hp + p.mhp * 0.5); });
};
/* co-op: a player who runs out of lives sits out until the next stage; all out = continue? */
var _playerOut = playerOut;
playerOut = function () {
  if (!G.pl) return _playerOut();
  if (G.lives <= 0) { P.out = 1; P.st = 'dead'; P.hp = 0; G.callout = { s: (P.pname || 'P' + (P.pi + 1)) + ' IS OUT', t: 2 }; if (G.pl.every(function (p) { return p.out; })) gameOver(); return; }
  _playerOut();
};
var _continueGame = continueGame;
continueGame = function () {
  if (!G.pl) return _continueGame();
  G.conts = (G.conts || 0) + 1; G.score = Math.floor(G.score / 2); G.lives = 1 + G.pl.length;
  if (G.bossOn && G.relay) { G.relay = null; G.duel = null; P = G.pl[0]; G.pl.forEach(function (p) { p.hp = p.mhp; p.out = 0; }); toPick(); return; }
  G.pl.forEach(function (p) { p.out = 0; p.hp = p.mhp; p.st = 'air'; p.h = 160; p.vh = 0; p.inv = 2.6; p.meter = 100; p.x = clamp(p.x, G.cam + 40, G.cam + KIT.W - 40); });
  P = G.pl[0]; G.mode = 'play'; music.play(G.bossOn ? BOSSES[G.S.boss].song : G.S.song); sfx.play('power');
};
/* co-op boss: player 1 picks who fights */
var _bossIntro = bossIntro;
bossIntro = function () { _bossIntro(); if (G.pl) toPick(); };
function toPick() { G.mode = 'pick'; G.pickT = 0; G.pickSel = G.pickSel || 0; G.pickBox = []; G.relay = null; G.duel = null; padSubs(false); if (NET.role === 'host' && !G.bot) pickMenu(); }
/* player 1 picks with a menu (touch and pad friendly); everyone else watches the cards on the canvas */
function pickMenu() {
  if (G.mode !== 'pick') return; var B = BOSSES[G.S.boss] || {};
  KIT.menu({ cls: 'clear', title: 'Who fights ' + (G.S.boss === 'brothers' ? BOSSES.brothers.n : B.n || 'the boss') + '?', sub: 'Lose and it passes to the next player along.', items: G.pl.map(function (p, i) {
    return { label: 'P' + (i + 1) + ' ' + (p.pname || '') + ' · ' + p.hero.n.toUpperCase(), def: i === G.pickSel ? 1 : 0, fn: function () { KIT.closeMenu(); G.pickSel = i; pickGo(); } }; }) });
}
function pickGo() { var n = G.pl.length, order = []; for (var k = 0; k < n; k++) order.push(G.pl[(G.pickSel + k) % n].id); G.relay = { order: order, i: 0 }; relayFighter(); sfx.play('fight'); }
function stepPick(dt) {
  G.t += dt; G.pickT += dt; var n = G.pl.length; G.pickSel = Math.min(G.pickSel, n - 1);
  if (G.pickT < 0.4) return;
  if (KIT.menuOpen()) return;
  if (KIT.pressed('right') || KIT.pressed('down')) { G.pickSel = (G.pickSel + 1) % n; sfx.play('blip'); }
  if (KIT.pressed('left') || KIT.pressed('up')) { G.pickSel = (G.pickSel + n - 1) % n; sfx.play('blip'); }
  var go = (G.bot && G.pickT > 1) || KIT.pressed('a');
  if (KIT.ptr.tap) (G.pickBox || []).forEach(function (b, i) { var q = KIT.ptr; if (q.x > b[0] && q.x < b[0] + b[2] && q.y > b[1] && q.y < b[1] + b[3]) { if (G.pickSel === i) go = true; else { G.pickSel = i; sfx.play('blip'); } } });
  if (go) pickGo();
}
function relayFighter() { var R = G.relay, id = R.order[R.i]; P = G.pl.filter(function (p) { return p.id === id; })[0] || G.pl[0]; P.out = 0; G.duel = null; G.mode = 'vs'; G.vsT = 0; sfx.play('vs'); }
var _duelEnd = duelEnd;
duelEnd = function (won) {
  if (G.versus) { var w = won ? 0 : 1; G.versus.score[w]++; G.versus.win = w; G.versus.winHero = won ? P.hid : G.duel.foe.hid; G.duel = null; padSubs(false); G.mode = 'vsres'; G.resT = 0; music.play('skclear'); return; }
  if (!G.pl || !G.relay) return _duelEnd(won);
  if (won) { var r = _duelEnd(true); G.relay = null; P = G.pl[0]; return r; }
  G.relay.i++;
  if (G.relay.i >= G.relay.order.length) { G.mode = 'over'; G.overT = 0; music.stop(0.6); sfx.play('lose'); return; } // everyone has had a go
  var lost = P; relayFighter(); G.callout = { s: (lost.pname || 'P' + (lost.pi + 1)) + ' IS DOWN. NEXT: ' + (P.pname || 'P' + (P.pi + 1)), t: 2.4 };
};
/* back to the room after a game (or when someone leaves a versus) */
function netToLobby(msg) {
  NET.live = false; NET.locked = false; G.pl = null; G.versus = null; G.relay = null; G.duel = null; G.me = null; P = null;
  lobbyPush(true); titleBack(); hostLobby(msg);
}
function titleBack() { G.mode = 'title'; G.S = STAGES[0]; G.cam = 0; G.ents = []; G.shots = []; G.fx = []; G.items = []; G.props = []; G.puddles = []; G.waves = []; G.sup = null; G.cutin = null; G.splat = 0; music.play('sktitle'); KIT.dropLayer(); }

/* ---------- the loop ---------- */
var _update = update;
update = function (dt) {
  if (isGuest()) return guestStep(dt);
  if (NET.role !== 'host' || !NET.live) return _update(dt);
  netInputs();
  if (G.mode === 'pick') stepPick(dt);
  else if (G.mode === 'vsres') { G.t += dt; G.resT += dt; stepFx(dt); if (G.resT > 1.2 && (KIT.pressed('a') || KIT.pressed('start') || (G.bot && G.resT > 2.5))) versusMatch(); else if (G.resT > 1.2 && KIT.pressed('b')) netToLobby(); }
  else if (G.mode === 'over') { G.t += dt; G.overT += dt; if (G.overT > 0.6 && (KIT.pressed('a') || KIT.pressed('start') || (G.bot && G.overT > 2))) continueGame(); else if (G.overT > 12 || (G.overT > 0.6 && KIT.pressed('b'))) netToLobby(); }
  else if (G.mode === 'end') { G.t += dt; G.endT += dt; if (G.endT > 9 && (KIT.pressed('a') || KIT.pressed('start') || G.bot)) netToLobby(); }
  else _update(dt);
  if (NET.live) netSendSnap(dt);
};
var _draw = draw;
draw = function () {
  if (G.mode === 'wait' || (isGuest() && !P && G.mode !== 'title')) { R('#070405', 0, 0, KIT.W, KIT.H); T('GET READY', KIT.W / 2, KIT.H / 2 - 8, { size: 16, align: 'center', col: '#ff2630', outline: true, font: 'title' }); return; }
  if (G.mode === 'pick') return drawPick();
  if (G.mode === 'vsres') return drawVsRes();
  _draw();
  if (isGuest() && (G.mode === 'over' || G.mode === 'clear' || G.mode === 'end')) T('WAITING FOR THE HOST', KIT.W / 2, KIT.H - 26, { size: 8, align: 'center', col: '#ffe36a', outline: true });
};
/* the host's sounds, shakes, flashes and music go to everyone */
(function () {
  var sp = sfx.play; sfx.play = function (n) { if (NET.role === 'host' && NET.live && NET.snd.length < 10 && NET.snd.indexOf(n) < 0) NET.snd.push(n); return sp.apply(sfx, arguments); };
  var sh = KIT.shake, fl = KIT.flash; KIT.shake = function (n) { NET.shk = Math.max(NET.shk, n || 0); return sh(n); }; KIT.flash = function (n) { NET.fl = Math.max(NET.fl, n || 0.12); return fl(n); };
  var mp = music.play, ms = music.stop; music.play = function (n) { NET.song = n; return mp.apply(music, arguments); }; music.stop = function () { NET.song = ''; return ms.apply(music, arguments); };
})();

/* ---------- what the host sends ---------- */
var EF = ['team', 'x', 'z', 'h', 'vx', 'vh', 'face', 'st', 't', 'anim', 'mvT', 'stun', 'hurtK', 'inv', 'flash', 'alpha', 'sc', 'hp', 'mhp', 'meter', 'w', 'ht', 'crouch', 'guardHeld', 'back', 'shade', 'washed', 'bubbled', 'silly', 'fire', 'shieldT', 'superOn', 'pose', 'leaving', 'intro', 'boss', 'assist', 'hid', 'fid', 'bid', 'pi', 'out', 'pname', 'freed'];
function r2(v) { return Math.round(v * 100) / 100; }
function pv(v) { return v === undefined || v === null ? null : typeof v === 'number' ? (isFinite(v) ? r2(v) : 0) : v === true ? 1 : v === false ? 0 : typeof v === 'string' ? v : null; }
function packE(e) {
  var a = [e.id]; for (var i = 0; i < EF.length; i++) a.push(pv(e[EF[i]]));
  var m = e.mv; a.push(m ? [m.an || 0, r2(m.st || 0), r2(m.ac || 0), m.rise ? 1 : 0, m.spin ? 1 : 0, m.arc || 0, m.box || 0, m.weap ? 1 : 0] : 0);
  a.push(e.weapon ? [e.weapon.id, r2(e.weapon.dur)] : 0); a.push(e.mf && e.mf.rose ? 1 : 0); a.push(e.assist && G.duel ? G.duel.o.assist : 0);
  return a;
}
function netSendSnap(dt) {
  NET.sendT -= dt; if (NET.sendT > 0) return; NET.sendT = G.duel ? 1 / 30 - 0.001 : 1 / 20 - 0.001;
  var s = { t: 'snap', q: ++NET.seq, m: G.mode, si: G.si, cam: r2(G.cam), zoom: G.zoom || 1, arena: G.arena || 0, lv: G.lives, sc: G.score, cb: G.combo, cbt: r2(G.comboT || 0), best: G.best || 0, go: r2(G.go || 0), ft: r2(G.fightT || 0), ko: r2(G.koT || 0),
    ct: r2(G.cardT || 0), clt: r2(G.clearT || 0), ot: r2(G.overT || 0), et: r2(G.endT || 0), vt: r2(G.vsT || 0), rt: r2(G.resT || 0), pt: r2(G.pickT || 0), ps: G.pickSel || 0,
    tg: G.tag && G.tag.id || 0, tgt: r2(G.tagT || 0), co: G.callout ? [G.callout.s, r2(G.callout.t)] : 0, tal: G.mode === 'clear' ? G.tally : 0, fr: G.freed || 0, ea: G.endArc ? 1 : 0, rush: G.rush ? 1 : 0, hard: G.hard ? 1 : 0,
    pid: P ? P.id : 0, pl: G.pl ? G.pl.map(function (p) { return p.id; }) : [P ? P.id : 0, G.duel && G.duel.foe ? G.duel.foe.id : 0], vsr: G.versus ? [G.versus.score[0], G.versus.score[1], G.versus.win, G.versus.winHero || ''] : 0, rel: G.relay ? [G.relay.order, G.relay.i] : 0,
    e: G.ents.filter(function (e) { return e.st !== 'gone'; }).map(packE), p: (G.pl || (P ? [P] : [])).map(packE),
    pr: G.props.map(function (p) { return [p.id, r2(p.x), r2(p.z), p.spr, p.hp, p.flash > 0 ? 1 : 0]; }),
    it: G.items.map(function (i) { return [i.id, r2(i.x), r2(i.z), r2(i.h)]; }),
    sh: G.shots.map(function (b) { return [r2(b.x), r2(b.z), r2(b.h), r2(b.vx), r2(b.vz || 0), b.spr, b.spin ? 1 : 0, b.big ? 1 : 0, b.rat ? 1 : 0, b.ground ? 1 : 0, b.col || 0, r2(b.vh || 0), b.grav ? 1 : 0]; }),
    pu: G.puddles.map(function (q) { return [r2(q.x), r2(q.z), q.r, q.col, q.fire ? 1 : 0, r2(q.t), q.life]; }),
    wv: (G.waves || []).map(function (w) { return [r2(w.x), r2(w.z), r2(w.r)]; }),
    fx: G.fx.filter(function (f) { if (f._s) return false; f._s = 1; return true; }).slice(-40).map(function (f) { var o = {}; for (var k in f) { var v = f[k]; if (k !== '_s' && (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean')) o[k] = typeof v === 'number' ? r2(v) : v; } return o; }),
    sup: G.sup ? [G.sup.kind, r2(G.sup.t), r2(G.sup.x), r2(G.sup.z), G.sup.face, G.sup.by ? G.sup.by.id : 0, G.sup.n || ''] : 0, sut: r2(G.superT || 0),
    bm: G.beam ? [r2(G.beam.x), r2(G.beam.z), G.beam.face, G.beam.warn ? 1 : 0] : 0, cut: G.cutin ? [r2(G.cutin.t), G.cutin.n, G.cutin.boss ? 1 : 0, G.cutin.face || '', G.cutin.shade || ''] : 0,
    du: G.duel ? [G.duel.o, G.duel.round, G.duel.wins, G.duel.phase, r2(G.duel.t), r2(G.duel.clock), G.duel.foe ? G.duel.foe.id : 0, G.duel.winner ? G.duel.winner.id : 0, G.duel.msg || '', G.duel.x0] : 0,
    vo: G.vsOpp ? [G.vsOpp.o, G.vsOpp.name, G.vsOpp.quote] : 0, song: NET.song, snd: NET.snd, shk: NET.shk, fl: NET.fl };
  NET.snd = []; NET.shk = 0; NET.fl = 0;
  var str = JSON.stringify(s), fast = str.length < 14000; NET.lastSize = str.length;
  NET.links.forEach(function (l) { if (l.up) l.send(str, fast); });
}

/* ---------- the guest: draws what the host sends ---------- */
var REP = {}, GQ = 0;
function guestStart(m) {
  NET.live = true; NET.meIdx = m.you; NET.myPi = m.you; NET.mode = m.mode; GQ = 0; REP = {}; KIT.closeMenu(); G.mode = 'wait'; G.pl = null; G.versus = m.mode === 'vs' ? { score: [0, 0] } : null; G.me = null; P = null; G.gSong = null; G.duel = null;
}
function guestBack() { NET.live = false; G.pl = null; G.versus = null; G.duel = null; G.me = null; P = null; REP = {}; titleBack(); guestLobby(); }
function repOf(a) {
  var id = a[0], e = REP[id]; if (!e) { e = REP[id] = { id: id, hit: {}, dirs: [], mf: {} }; e._new = 1; }
  for (var i = 0; i < EF.length; i++) { var v = a[i + 1], k = EF[i]; e[k] = v === null ? undefined : v; }
  var j = EF.length + 1, m = a[j], w = a[j + 1];
  e.mv = m ? { an: m[0] || undefined, st: m[1], ac: m[2], rise: m[3], spin: m[4], arc: m[5] || undefined, box: m[6] || undefined, weap: m[7] } : null;
  e.weapon = w ? { id: w[0], dur: w[1] } : null; e.mf = { rose: a[j + 2] }; var aid = a[j + 3];
  if (e.hid && (!e.hero || e.hero.id !== e.hid)) e.hero = HEROES[e.hid];
  if (e.fid && e._fid !== e.fid) { e._fid = e.fid; e.fr = foeFrames(e.fid); e.def = foeDef(e.fid); }
  if (e.bid) { var d = BOSSES[e.bid]; e.def = e.superOn && d.super ? Object.assign({}, d, { n: d.super.n }) : d; e.spr = e.superOn && d.super ? d.super.spr : d.spr; }
  if (aid && BOSSES[aid]) { e.def = BOSSES[aid]; e.spr = e.def.spr; }
  // smooth the moves between snaps
  if (e._new) { e._new = 0; e.tx = e.x; e.tz = e.z; e.th = e.h; } else { e.tx = e.x; e.tz = e.z; e.th = e.h; e.x = e.px; e.z = e.pz; e.h = e.ph; }
  return e;
}
function guestSnap(s) {
  if (s.q <= GQ && GQ - s.q < 1000) return; GQ = s.q;
  if (s.si !== G.si || G.mode === 'wait' || G.mode === 'title') { G.si = s.si; G.S = STAGES[s.si] || STAGES[0]; KIT.dropLayer(); }
  G.mode = s.m; G.cam = s.cam; G.zoom = s.zoom; G.arena = s.arena; G.lives = s.lv; G.score = s.sc; G.combo = s.cb; G.comboT = s.cbt; G.best = s.best; G.go = s.go; G.fightT = s.ft; G.koT = s.ko;
  G.cardT = s.ct; G.clearT = s.clt; G.overT = s.ot; G.endT = s.et; G.vsT = s.vt; G.resT = s.rt; G.pickT = s.pt; G.pickSel = s.ps; G.tagT = s.tgt; G.callout = s.co ? { s: s.co[0], t: s.co[1] } : null; G.tally = s.tal || G.tally; G.freed = s.fr; G.endArc = !!s.ea; G.rush = !!s.rush; G.hard = !!s.hard;
  var keep = {}; function put(a) { var e = repOf(a); e.px = e.x; e.pz = e.z; e.ph = e.h; keep[e.id] = 1; return e; }
  G.ents = s.e.map(put); var pls = s.p.map(put);
  for (var k in REP) if (!keep[k]) delete REP[k];
  G.tag = s.tg ? REP[s.tg] || null : null;
  G.props = s.pr.map(function (q) { return { id: q[0], x: q[1], z: q[2], spr: q[3], hp: q[4], flash: q[5] ? 0.1 : 0, prop: true }; });
  G.items = s.it.map(function (q) { return { id: q[0], x: q[1], z: q[2], h: q[3] }; });
  G.shots = s.sh.map(function (q) { return { x: q[0], z: q[1], h: q[2], vx: q[3], vz: q[4], spr: q[5], spin: q[6], big: q[7], rat: q[8], ground: q[9], col: q[10] || undefined, vh: q[11], grav: q[12] }; });
  G.puddles = s.pu.map(function (q) { return { x: q[0], z: q[1], r: q[2], col: q[3], fire: q[4], t: q[5], life: q[6] }; });
  G.waves = s.wv.map(function (q) { return { x: q[0], z: q[1], r: q[2] }; });
  s.fx.forEach(function (f) { G.fx.push(f); });
  G.sup = s.sup ? { kind: s.sup[0], t: s.sup[1], x: s.sup[2], z: s.sup[3], face: s.sup[4], by: REP[s.sup[5]] || null, n: s.sup[6] } : null; G.superT = s.sut;
  G.beam = s.bm ? { x: s.bm[0], z: s.bm[1], face: s.bm[2], warn: s.bm[3] } : null;
  G.cutin = s.cut ? { t: s.cut[0], n: s.cut[1], boss: s.cut[2], face: s.cut[3] || undefined, shade: s.cut[4] || undefined } : null;
  var d = s.du; G.duel = d ? { o: d[0], round: d[1], wins: d[2], phase: d[3], t: d[4], clock: d[5], foe: REP[d[6]] || null, winner: REP[d[7]] || null, msg: d[8], x0: d[9] } : null; if (G.duel) G.lastDuel = G.duel;
  if (s.vo) { if (!G.vsOpp || JSON.stringify(G.vsOpp.o) !== JSON.stringify(s.vo[0])) G.vsOpp = { o: s.vo[0], name: s.vo[1], quote: s.vo[2], art: oppArt(s.vo[0]) }; }
  if (s.vsr) G.versus = { score: [s.vsr[0], s.vsr[1]], win: s.vsr[2], winHero: s.vsr[3] };
  G.relay = s.rel ? { order: s.rel[0], i: s.rel[1] } : null;
  var mine = REP[s.pl[NET.myPi]] || null; G.me = mine;
  G.pl = NET.mode === 'co' ? pls : null;
  var duelish = G.duel || s.m === 'vs' || s.m === 'pick' || s.m === 'vsres' || NET.mode === 'vs';
  P = duelish ? REP[s.pid] || mine : mine || REP[s.pid] || null;
  if (s.song !== G.gSong) { G.gSong = s.song; if (s.song) music.play(s.song); else music.stop(0.6); }
  s.snd.forEach(function (n) { sfx.play(n); }); if (s.shk) KIT.shake(s.shk); if (s.fl) KIT.flash(s.fl);
}
function guestEv(e) { if (e.k === 'splat') G.splat = 1.4; }
function guestStep(dt) {
  G.t += dt; guestSendInput();
  var k = Math.min(1, dt * 16);
  for (var id in REP) { var e = REP[id]; if (e.tx === undefined) continue; if (Math.abs(e.tx - e.x) > 120) { e.x = e.tx; e.z = e.tz; e.h = e.th; } e.x += (e.tx - e.x) * k; e.z += (e.tz - e.z) * k; e.h += (e.th - e.h) * k; e.px = e.x; e.pz = e.z; e.ph = e.h; }
  G.shots.forEach(function (b) { b.x += b.vx * dt; b.z += (b.vz || 0) * dt; if (b.grav) { b.vh -= GRAV * 0.9 * dt; b.h = Math.max(0, b.h + b.vh * dt); } });
  stepFx(dt); if (G.splat > 0) G.splat -= dt; if (G.cutin) G.cutin.t += dt; if (G.callout) { G.callout.t -= dt; if (G.callout.t <= 0) G.callout = null; }
  if (G.duel && G.duel.phase === 'fight') G.duel.clock = Math.max(0, G.duel.clock - dt);
}

/* ---------- the screens only online has ---------- */
function drawPick() {
  var W = KIT.W, HH = KIT.H, n = G.pl ? G.pl.length : 0, g = KIT.ctx; R('#070405', 0, 0, W, HH); for (var i = 0; i < 12; i++) R(i % 2 ? '#0e0708' : '#120809', 0, i * 20, W, 20);
  var B = BOSSES[G.S.boss] || {}; T('WHO FIGHTS ' + (G.S.boss === 'brothers' ? BOSSES.brothers.n : B.n || 'THE BOSS') + '?', W / 2, 10, { size: 16, align: 'center', col: '#ff2630', outline: true, font: 'title', max: W - 16 });
  var cw = Math.min(86, (W - 24) / Math.max(1, n) - 8), x0 = W / 2 - (cw * n + 8 * (n - 1)) / 2; G.pickBox = [];
  (G.pl || []).forEach(function (p, i) { var x = x0 + i * (cw + 8), y = 44, on = i === G.pickSel, H = p.hero; G.pickBox[i] = [x, y, cw, 118];
    KIT.panel(x, y, cw, 118, { edge: on ? '#ffe36a' : '#4a1a1c', fill: on ? 'rgba(90,10,16,0.95)' : 'solid' });
    if (p.shade) g.filter = p.shade; KIT.spr(on ? H.A.idle[Math.floor(G.t * 4) % 4] : H.A.idle[0], x + cw / 2, y + 92, { sc: 1.2 }); g.filter = 'none';
    T('P' + (i + 1), x + 4, y + 4, { size: 8, col: PCOL[i] }); T(p.pname || '', x + cw / 2, y + 96, { size: 8, align: 'center', col: '#f1e7d0', max: cw - 6 }); T(H.n, x + cw / 2, y + 107, { size: 6, align: 'center', col: '#a6968f', max: cw - 6 }); });
  var host = NET.role === 'host'; T(host ? 'PICK WHO GOES FIRST. LOSE AND IT PASSES ALONG THE LINE.' : (NET.players[0] ? NET.players[0].name : 'PLAYER 1') + ' IS PICKING...', W / 2, HH - 34, { size: 8, align: 'center', col: '#a6968f', max: W - 12 });
  if (host && Math.floor(G.t * 2) % 2) T('LEFT / RIGHT · A: FIGHT', W / 2, HH - 18, { size: 8, align: 'center', col: '#ffe36a' });
}
function drawVsRes() {
  var W = KIT.W, HH = KIT.H, V = G.versus || { score: [0, 0] }; R('#070405', 0, 0, W, HH); moon(W / 2, 60, 34);
  var hid = V.winHero, H = HEROES[hid]; if (H) KIT.spr(H.A.win[Math.floor(G.t * 3) % 2], W / 2, HH - 40, { sc: 1.6 });
  var nm = NET.players[V.win] ? NET.players[V.win].name : 'P' + (V.win + 1);
  T(nm + ' WINS', W / 2, 12, { size: 32, align: 'center', col: '#ffe36a', outline: true, font: 'title', max: W - 16 });
  T((NET.players[0] ? NET.players[0].name : 'P1') + '  ' + V.score[0] + ' - ' + V.score[1] + '  ' + (NET.players[1] ? NET.players[1].name : 'P2'), W / 2, 52, { size: 8, align: 'center', col: '#f1e7d0', outline: true, max: W - 16 });
  if (G.resT > 1.2 && Math.floor(G.t * 2) % 2) T(NET.role === 'host' ? 'A: REMATCH    B: BACK TO THE ROOM' : 'WAITING FOR THE HOST', W / 2, HH - 14, { size: 8, align: 'center', col: '#a6968f' });
}
/* co-op HUD: the others' health under yours, and P1-P4 over everyone's head */
function drawMates(ty) {
  var y = ty + (G.tag && G.tagT > 0 ? 16 : 0) + 2; G.pl.forEach(function (p) { if (p === P) return; var H = p.hero;
    KIT.panel(3, y, 20, 18, { fill: 'solid' }); if (p.shade) KIT.ctx.filter = p.shade; KIT.spr(H.face, 13, y + 19, { sc: 0.55 }); KIT.ctx.filter = 'none';
    T('P' + (p.pi + 1) + ' ' + (p.pname || H.n), 26, y, { size: 6, col: PCOL[p.pi] || '#f1e7d0', max: 90 }); if (p.out) T('OUT', 26, y + 8, { size: 6, col: '#a6968f' }); else hpBar(26, y + 9, 60, 4, p.hp / p.mhp, p.hp / p.mhp, '#c4121c');
    y += 21; });
}
function drawTags() { G.pl.forEach(function (p) { if (p.out || p.st === 'gone') return; var x = p.x - G.cam, y = FLOOR + p.z - p.h - p.ht - 10; T('P' + (p.pi + 1), x, y, { size: 6, align: 'center', col: PCOL[p.pi] || '#fff', outline: true }); if (p === G.me) R(PCOL[p.pi], x - 2, y + 8, 4, 2); }); }

/* ---------- menus ---------- */
function onlineMenu(err) {
  if (window.HSProfile && !HSProfile.has()) { HSProfile.edit(function (p) { if (p) onlineMenu(); else titleMenu(); }, { title: 'YOUR NAME FOR ONLINE' }); return; }
  NET.onChange = null; if (G.mode !== 'title') titleBack();
  KIT.menu({ title: 'Online', sub: (err ? err + '  ·  ' : '') + 'Versus: one on one. Co-op: up to four of you through the story.', items: [
    { label: 'Host a room', def: 1, fn: function () { KIT.menu({ title: 'Opening a room...', items: [{ label: 'Cancel', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); netHost(function (ok) { if (ok) hostLobby(); else onlineMenu(NET.err || 'Could not open a room.'); }); } },
    { label: 'Join a room', fn: function () { joinPad(''); } },
    { label: 'Back', back: 1, fn: function () { netLeave(); titleMenu(); } }], note: 'Some networks block direct connections. Home wifi works best.' });
}
function cleared() { var m = 0; for (var k in SV.clear || {}) m = Math.max(m, SV.clear[k] || 0); return Math.min(STAGES.length - 1, m); }
function heroNext(h) { var i = HEROLIST.indexOf(h); return HEROLIST[(i + 1) % HEROLIST.length]; }
function roomHtml() {
  return '<div class="skroom">' + NET.players.map(function (p, i) { return '<div><b style="color:' + PCOL[i] + '">P' + (i + 1) + '</b> ' + escH(p.name) + ' <span>' + HEROES[p.hero].n + '</span></div>'; }).join('') +
    (NET.players.length < MAXP ? '<div class="dim">Room code <b>' + NET.code + '</b>: ' + (NET.mode === 'vs' ? 'waiting for one more' : 'up to ' + MAXP + ' players') + '</div>' : '') + '</div>';
}
function escH(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function hostLobby(msg) {
  NET.onChange = function () { if (NET.role === 'host' && !NET.live) hostLobby(); };
  var n = NET.players.length, vs = NET.mode === 'vs', me = NET.players[0], ok = vs ? n === 2 : n >= 2;
  var stageL = vs ? (NET.vstage < 0 ? 'RANDOM' : STAGES[NET.vstage].n.toUpperCase()) : 'STAGE ' + (NET.stage + 1) + ' · ' + STAGES[NET.stage].n.toUpperCase();
  KIT.menu({ title: 'Room ' + NET.code, sub: msg || (ok ? 'Ready when you are.' : 'Tell your friends the code: ' + NET.code), html: roomHtml(), items: [
    { label: 'MODE: ' + (vs ? 'VERSUS (1 ON 1)' : 'CO-OP (UP TO 4)'), fn: function () { NET.mode = vs ? 'co' : 'vs'; lobbyPush(); hostLobby(); } },
    { label: 'FIGHTER: ' + HEROES[me.hero].n.toUpperCase(), fn: function () { me.hero = heroNext(me.hero); SV.netHero = me.hero; persist(); lobbyPush(); hostLobby(); } },
    { label: (vs ? 'STAGE: ' : 'START AT: ') + stageL, fn: function () { if (vs) { NET.vstage = NET.vstage + 1 >= STAGES.length ? -1 : NET.vstage + 1; } else { NET.stage = NET.stage + 1 > cleared() ? 0 : NET.stage + 1; } lobbyPush(); hostLobby(); } },
    ok ? { label: 'START', def: 1, fn: function () { NET.onChange = null; hostStart(); } } : { label: vs && n > 2 ? 'VERSUS IS FOR TWO' : 'WAITING FOR PLAYERS...', dis: true },
    { label: 'Close the room', back: 1, fn: function () { netLeave(); onlineMenu(); } }] });
}
function guestLobby() {
  NET.onChange = function () { if (NET.role === 'client' && !NET.live) guestLobby(); };
  var me = NET.players[NET.meIdx] || {}, vs = NET.mode === 'vs';
  KIT.menu({ title: 'Room ' + NET.code, sub: (vs ? 'Versus' : 'Co-op') + ' · waiting for the host to start', html: roomHtml(), items: [
    { label: 'FIGHTER: ' + (HEROES[me.hero] ? HEROES[me.hero].n.toUpperCase() : '?'), def: 1, fn: function () { var h = heroNext(me.hero || HEROLIST[0]); me.hero = h; SV.netHero = h; persist(); netSend({ t: 'hero', hero: h }); guestLobby(); } },
    { label: 'Leave', back: 1, fn: function () { netLeave(); onlineMenu(); } }] });
}
function netSend(m, fast) { if (NET.role === 'client' && NET.host) NET.host.send(m, fast); }
function joinPad(code) {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ', items = abc.split('').map(function (c) { return { label: c, cls: 'key', fn: function () { if (code.length < 5) joinPad(code + c); } }; });
  items.push({ label: 'DELETE', cls: 'key2', fn: function () { joinPad(code.slice(0, -1)); } });
  items.push({ label: 'JOIN', cls: 'key2', def: code.length === 5, fn: function () { if (code.length !== 5) return; KIT.menu({ title: 'Joining room ' + code + '...', items: [{ label: 'Cancel', back: 1, fn: function () { netLeave(); onlineMenu(); } }] }); netJoin(code, function (ok) { if (ok) guestLobby(); else onlineMenu(NET.err || 'Could not join.'); }); } });
  items.push({ label: 'Back', back: 1, fn: function () { onlineMenu(); } });
  KIT.menu({ cls: 'skkeys', title: 'Join a room', html: '<div class="skcode">' + (code + '_____').slice(0, 5) + '</div>', grid: true, items: items });
}
/* online pause: the game carries on underneath (the others are still playing) */
function netPause() {
  var host = NET.role === 'host'; if (host && G.mode === 'pick') return pickMenu();
  KIT.menu({ cls: 'clear', title: 'Online', sub: 'Room ' + NET.code + ' · the game keeps going', items: [{ label: 'Resume', fn: KIT.closeMenu }, { label: 'Move List', fn: function () { if (P && P.hero) moveList(); } }, { label: 'How to Play', fn: function () { helpMenu(netPause); } },
    host ? { label: 'Back to the room', fn: function () { netToLobby(); } } : null,
    { label: host ? 'Close the room' : 'Leave the room', fn: function () { netLeave(); G.duel = null; onlineMenu(); } }] });
}
(function () { var st = document.createElement('style'); st.textContent = '#menu.skkeys .mlist.grid{grid-template-columns:repeat(6,1fr);gap:6px}#menu.skkeys .mbtn.key{padding:8px 0;min-height:40px;text-align:center}#menu.skkeys .mbtn.key2{grid-column:span 3}#menu.skkeys .mbtn[data-back]{grid-column:span 6}#menu .skcode{font-family:"Press Start 2P",monospace;font-size:26px;letter-spacing:.3em;color:#ffe36a;text-align:center;padding:10px;background:#070405;box-shadow:inset 0 0 0 1px #4a1a1c;margin-bottom:8px}' +
    '#menu .skroom{display:flex;flex-direction:column;gap:4px;margin:0 0 10px;font-size:15px}#menu .skroom span{color:#a6968f}#menu .skroom .dim{color:#a6968f;font-size:13px}#menu .skroom .dim b{color:#ffe36a;letter-spacing:.15em}';
  document.head.appendChild(st);
  window.addEventListener('keydown', function (e) { var m = document.querySelector('#menu.skkeys'); if (!m || m.hidden) return; var c = (e.key || '').toUpperCase(), cur = ((m.querySelector('.skcode') || {}).textContent || '').replace(/_/g, '');
    if (c.length === 1 && 'ABCDEFGHJKLMNPQRSTUVWXYZ'.indexOf(c) >= 0) { e.preventDefault(); e.stopPropagation(); if (cur.length < 5) joinPad(cur + c); } else if (e.key === 'Backspace') { e.preventDefault(); joinPad(cur.slice(0, -1)); } }, true); })();
