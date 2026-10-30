/* =====================================================================================================
   ONLINE MENUS: host a room (you get a five-letter code to give your friends, or read out on stream),
   or join one with a code. Up to 8 players; AI drivers fill the empty grid slots. The host picks
   everything: Grand Prix, Single Race, Time Trial (everyone at once as see-through ghosts) or Expedition
   (co-op, two players). Names and portraits come from the app profile.
   ===================================================================================================== */
function mpRoom() { return NET.role && (NET.role === 'client' || NET.sig); }
/* the grid for an online race: the players first (in the order they joined), then AI */
function mpRoster(myCh, rivals, total) {
  if (NET.role !== 'host') return null; var P = NET.players, ch = P.map(function (p, i) { return i ? p.ch : myCh; }), names = P.map(function (p) { return p.name; });
  var ai = rivals.filter(function (r) { return ch.indexOf(r) < 0; }).concat(rivals.filter(function (r) { return ch.indexOf(r) >= 0; }));
  ch = ch.concat(ai.slice(0, Math.max(0, total - ch.length)));
  return { ch: ch, names: names, humans: P.map(function (p, i) { return i; }) };
}
/* every race goes through go(): online, the host adds the players and tells everyone to start */
var _goLocal = go;
go = function (o) {
  if (NET.role !== 'host' || !NET.sig) return _goLocal(o);
  var P = NET.players, n = P.length;
  if (!o.fixed) {
    var tt = o.mode === 'tt', want = tt ? n : Math.max(n + o.rivals.length, o.ev ? n + o.rivals.length : 8), rs = mpRoster(o.player, o.rivals, Math.min(8, want));
    if (o.ev) { rs = mpRoster(o.player, o.rivals, n + o.rivals.length); }
    o.player = rs.ch[0]; o.rivals = rs.ch.slice(1); o.humans = rs.humans; o.names = rs.names;
    if (o.ev && o.ev.t === 'nado') o.grid = null; // with a friend everyone starts in grid order
  }
  o.meIdx = 0; o.net = 'host'; NET.locked = true;
  var wire = {}; for (var q in o) if (q !== 'defMod' && q !== 'ev') wire[q] = o[q]; if (o.ev) wire.evId = o.ev.id; wire.net = 'client';
  NET.links.forEach(function (L) { var i = P.findIndex(function (p) { return p.id === L.remote; }); if (i > 0) L.send({ t: 'start', o: wire, me: i, kind: o.ev ? 'exp' : o.mode }); });
  _goLocal(o);
  RACE.all.forEach(function (k, i) { if (P[i] && i > 0) k.netId = P[i].id; });
};
/* ---------- the menus ---------- */
function mpMenu(err) {
  if (window.HSProfile && !HSProfile.has()) { HSProfile.edit(function (p) { if (p) mpMenu(); else titleMenu(); }, { title: 'YOUR NAME FOR ONLINE RACES' }); return; }
  NET.onChange = null;
  screen({ title: 'Online', sub: 'Race your friends (and your viewers)', back: function () { netLeave(); titleMenu(); }, redo: function () { mpMenu(err); },
    html: '<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:12px">' + (err ? '<div class="ckmsg" style="color:#ff2630;font-size:18px">' + esc(err) + '</div>' : '') +
      '<div class="ckg" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))"><button type="button" class="ckbtn ckc" data-act="host" data-pad-default><b>Host a room</b><span>You get a five-letter code. Give it to your friends, or show it on stream. Up to 8 players.</span></button>' +
      '<button type="button" class="ckbtn ckc" data-act="join"><b>Join a room</b><span>Type in the code the host gives you.</span></button></div>' +
      '<p style="margin:0;font-size:13px;color:#a6968f;line-height:1.45">Online needs the internet. Players connect straight to each other; on some networks (some mobile data and work or school wifi) that is blocked and the join will fail. Home wifi usually works.</p></div>',
    acts: { host: function () { mpWait('Opening a room…'); netHost(function (ok) { if (ok) mpLobby(); else mpMenu(NET.err || 'Could not open a room.'); }); }, join: function () { mpCode(''); } } });
}
function mpWait(txt) { screen({ cls: 'solid', title: 'Online', html: '<div class="ckmsg" style="margin-top:20px">' + esc(txt) + '</div><div class="ckacts" style="margin-top:14px"><button type="button" class="ckbtn" data-act="x" data-pad-default>CANCEL</button></div>', acts: { x: function () { netLeave(); mpMenu(); } }, foot: false }); }
function mpCode(code) {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ', acts = {}, keys = '';
  abc.split('').forEach(function (c) { acts['k' + c] = function () { if (code.length < 5) mpCode(code + c); }; keys += '<button type="button" class="ckbtn" data-act="k' + c + '" style="height:46px;text-align:center;font-family:var(--pixel);font-size:14px">' + c + '</button>'; });
  acts.del = function () { mpCode(code.slice(0, -1)); }; acts.ok = function () { if (code.length !== 5) return; mpWait('Joining room ' + code + '…'); netJoin(code, function (ok) { if (ok) mpLobby(); else mpMenu(NET.err || 'Could not join.'); }); };
  screen({ title: 'Join a room', back: function () { mpMenu(); }, redo: function () { mpCode(code); },
    html: '<div style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:10px"><div style="text-align:center;font-family:var(--pixel);font-size:30px;letter-spacing:.3em;color:#ffe36a;padding:12px;background:#070405;box-shadow:inset 0 0 0 1px #4a1a1c">' + (code + '_____').slice(0, 5) + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">' + keys + '<button type="button" class="ckbtn" data-act="del" style="grid-column:span 4;height:46px;text-align:center;font-weight:700;letter-spacing:.1em">DELETE</button><button type="button" class="ckbtn hot" data-act="ok" style="grid-column:span 4;height:46px;text-align:center;font-weight:700;letter-spacing:.1em;background:linear-gradient(180deg,#d8141f,#8e0c14)"' + (code.length === 5 ? ' data-pad-default' : '') + '>JOIN</button></div></div>',
    acts: acts, after: function (m) { // a real keyboard types the code too
      function key(e) { if (!document.body.contains(m) || !m.querySelector('[data-act="del"]')) { window.removeEventListener('keydown', key, true); return; } var c = (e.key || '').toUpperCase(); if (abc.indexOf(c) >= 0 && c.length === 1) { e.preventDefault(); window.removeEventListener('keydown', key, true); acts['k' + c](); } else if (e.key === 'Backspace') { e.preventDefault(); window.removeEventListener('keydown', key, true); acts.del(); } else if (e.key === 'Enter' && code.length === 5) { e.preventDefault(); window.removeEventListener('keydown', key, true); acts.ok(); } }
      window.addEventListener('keydown', key, true);
    } });
}
function mpPlayers() {
  return '<div class="ckres">' + NET.players.map(function (p, i) { return '<div class="ckr' + (i === NET.meIdx ? ' me' : '') + '" style="grid-template-columns:44px 40px 1fr auto"><span class="pl">' + (i + 1) + '</span>' + (window.HSProfile ? HSProfile.html(p.pic, 40) : '') + '<span class="nm">' + esc(p.name) + (i === 0 ? '<small>HOST</small>' : '') + '</span><span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#a6968f">' + pic(p.ch, 32) + esc(CH[p.ch] ? CH[p.ch].n : '') + '</span></div>'; }).join('') + '</div>';
}
function mpLobby() {
  RACE = null; GP = null; MODE = 'title'; NET.locked = false;
  if (NET.role === 'host') { NET.players[0].ch = SV.ch; NET.players[0].name = netMe().name; NET.players[0].pic = netMe().pic; hostLobbyPush(true); }
  NET.onChange = function () { if (document.querySelector('#menu .mplobby')) mpLobby(); };
  var host = NET.role === 'host', two = NET.players.length === 2;
  var modes = host ? '<div class="ckg" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin-top:12px">' +
    '<button type="button" class="ckbtn ckc" data-act="gp" data-pad-default><b>Grand Prix</b><span>Four races for points</span></button>' +
    '<button type="button" class="ckbtn ckc" data-act="race"><b>Single Race</b><span>Any course</span></button>' +
    '<button type="button" class="ckbtn ckc" data-act="tt"><b>Time Trial</b><span>Everyone at once, as ghosts</span></button>' +
    '<button type="button" class="ckbtn ckc" data-act="exp"' + (two ? '' : ' disabled') + '><b>Expedition</b><span>' + (two ? 'Play through together' : 'Co-op is for exactly two players') + '</span></button></div>' : '<div class="ckmsg" style="margin-top:12px;font-size:18px">Waiting for ' + esc(NET.players[0] ? NET.players[0].name : 'the host') + ' to pick a race…</div>';
  screen({ cls: 'mplobby', title: 'Room ' + NET.code, sub: NET.players.length + ' of 8 players' + (host ? '  ·  tell your friends the code' : ''), back: function () { netLeave(); mpMenu(); }, redo: mpLobby,
    html: '<div class="mplobby" style="max-width:760px;margin:0 auto">' + (host ? '<div style="text-align:center;font-family:var(--pixel);font-size:34px;letter-spacing:.35em;color:#ffe36a;margin:4px 0 12px;text-shadow:3px 3px 0 #12040a">' + NET.code + '</div>' : '') + mpPlayers() +
      '<div class="ckacts" style="margin-top:10px"><button type="button" class="ckbtn" data-act="drv"' + (host ? '' : ' data-pad-default') + '>YOUR DRIVER: ' + esc(CH[SV.ch].n.toUpperCase()) + '</button>' + (host ? '<button type="button" class="ckbtn" data-act="cls">CLASS: ' + clsName(SV.cls).toUpperCase() + '</button>' : '') + '<button type="button" class="ckbtn" data-act="leave">LEAVE</button></div>' + modes + '</div>',
    acts: {
      drv: function () { pickChar(function () { if (NET.role === 'client') netSend({ t: 'ch', ch: SV.ch }); mpLobby(); }, mpLobby); },
      cls: function () { var open = CLASSES.filter(function (c) { return classOpen(c.id); }), i = open.findIndex(function (c) { return c.id === SV.cls; }); SV.cls = open[(i + 1) % open.length].id; persist(); mpLobby(); },
      leave: function () { netLeave(); mpMenu(); },
      gp: function () { pickCup(beginGP, mpLobby); }, race: function () { pickCourse(beginRace, mpLobby); }, tt: function () { pickCourse(beginTT, mpLobby); }, exp: function () { expedition(mpLobby); }
    } });
}
/* a guest's view at the end of a race: the host's results, then wait for the host */
function netClientEnd(m) {
  var R = RACE, me = NET.meIdx, h = '';
  if (m.kind === 'exp') {
    var X = XS(), e = expEvent(m.id); if (e) { if (m.s > (X.stars[e.id] || 0)) X.stars[e.id] = m.s; if (m.s > 0 && e.t === 'face') { X.beat[e.a] = 1; var a = EXP[e.a]; if (CH[a.r].lock) SV.unlock[a.r] = 1; } if (R) SV.drops = (SV.drops || 0) + (R.me.got || 0); persist(); }
    h = '<div style="text-align:center"><div style="font-size:54px;line-height:1;color:#ffe36a">' + starStr(m.s) + '</div><p style="font-size:16px">' + esc(m.line) + '</p><p style="color:#a6968f">Stars count for both of you.</p></div>';
  } else h = resultRows(m.rows.map(function (r) { return { ch: r.ch, me: r.idx === me, name: r.idx === me ? null : (r.idx === 0 ? NET.players[0] && NET.players[0].name : r.name), time: r.time, pts: r.pts }; }));
  screen({ cls: 'solid', title: m.title || 'Results', sub: m.sub || '', foot: false,
    html: h + '<div class="ckmsg" style="margin-top:12px;font-size:18px">Waiting for the host…</div><div class="ckacts" style="margin-top:10px"><button type="button" class="ckbtn" data-act="leave" data-pad-default>LEAVE THE ROOM</button></div>',
    acts: { leave: function () { netLeave(); RACE = null; mpMenu(); } } });
}
