/* The app's profile button and friends (update 195, his ask: "move [the profile] off to the side, not a big bar in the
   middle ... click on it and there's a sub menu: change profile, friends list, add friend, recently played with. If
   someone is playing a game you can quick join their lobby from the friends list. Make it look nice and modern").

   A round portrait sits in the top corner. It opens a panel from the side:
     - the profile (name, portrait, your friend code to give to people) and Edit profile (the editor we already had)
     - Friends: each one says Offline, In the app, Playing <game>, or In a room in <game> with a JOIN button
     - Add friend: type their six-letter code
     - Recently played with: the people you were in an online room with lately, with ADD
   How it works: no accounts and no server of ours. While the app is open it listens on the same free matchmaking
   server the online games use (PeerJS), under 'hsf-' + your code. A friend's app asks it directly (one small WebRTC
   message) what you are doing; the answer comes from what the game you are playing wrote on this phone (profile.js:
   which game, and the room code while a room is open). JOIN opens that game with '?join=CODE'. */
(function () {
  'use strict';
  if (!window.HSProfile || !HSProfile.code) return;
  var SIGURL = (function () { try { var s = localStorage.getItem('ck-sig'); if (s) return s; } catch (e) {} return 'wss://0.peerjs.com/peerjs?key=peerjs'; })();
  var ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
  var GAMES = { 'cumhead-kart': 'Cumhead Kart', 'cum-city-nights': 'Cum City Nights', 'skeet-fighter': 'Skeet Fighter', 'psycho-nightmare': 'Psycho Nightmare' };
  function rid(n) { var a = 'abcdefghijkmnpqrstuvwxyz23456789', s = ''; for (var i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- the matchmaking server and one-message links (the same protocol the games use) ---------- */
  function Signal(id, on) {
    var self = { id: id, open: false, closed: false }, url = SIGURL + (SIGURL.indexOf('?') < 0 ? '?' : '&') + 'id=' + encodeURIComponent(id) + '&token=' + rid(12) + '&version=1.5.4';
    try { self.ws = new WebSocket(url); } catch (e) { setTimeout(function () { on.error && on.error(); }, 0); return self; }
    self.ws.onmessage = function (ev) { var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.type === 'OPEN') { self.open = true; on.open && on.open(); }
      else if (m.type === 'ID-TAKEN' || m.type === 'ERROR') on.error && on.error(m.type);
      else if (m.type === 'EXPIRE') on.expire && on.expire(m.src);
      else if (m.type === 'OFFER' || m.type === 'ANSWER' || m.type === 'CANDIDATE') on.msg && on.msg(m); };
    self.ws.onclose = function () { self.open = false; clearInterval(self.hb); if (!self.closed) on.error && on.error('closed'); };
    self.ws.onerror = function () {};
    self.hb = setInterval(function () { self.send({ type: 'HEARTBEAT' }); }, 5000);
    self.send = function (m) { if (self.ws && self.ws.readyState === 1) self.ws.send(JSON.stringify(m)); };
    self.close = function () { self.closed = true; clearInterval(self.hb); try { self.ws.close(); } catch (e) {} };
    return self;
  }
  function Link(sig, remote, cid, offerer, on) {
    var L = { remote: remote, cid: cid, pc: new RTCPeerConnection({ iceServers: ICE }), ch: null, up: false, queue: [] };
    L.pc.onicecandidate = function (e) { if (e.candidate) sig.send({ type: 'CANDIDATE', dst: remote, payload: { type: 'data', connectionId: cid, candidate: e.candidate } }); };
    function wire(ch) { L.ch = ch; ch.onopen = function () { L.up = true; on.up && on.up(L); }; ch.onmessage = function (e) { var m; try { m = JSON.parse(e.data); } catch (x) { return; } on.data && on.data(L, m); }; }
    if (offerer) { wire(L.pc.createDataChannel('hsf', { ordered: true }));
      L.pc.createOffer().then(function (o) { return L.pc.setLocalDescription(o); }).then(function () { sig.send({ type: 'OFFER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, label: 'hsf', reliable: true, serialization: 'json', browser: 'hs' } }); }).catch(function () {}); }
    else L.pc.ondatachannel = function (e) { wire(e.channel); };
    L.signal = function (m) { var p = m.payload || {};
      if (m.type === 'OFFER') L.pc.setRemoteDescription(p.sdp).then(function () { return L.pc.createAnswer(); }).then(function (a) { return L.pc.setLocalDescription(a); }).then(function () { sig.send({ type: 'ANSWER', dst: remote, payload: { type: 'data', connectionId: cid, sdp: L.pc.localDescription, browser: 'hs' } }); L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); }).catch(function () {});
      else if (m.type === 'ANSWER') L.pc.setRemoteDescription(p.sdp).then(function () { L.queue.splice(0).forEach(function (c) { L.pc.addIceCandidate(c).catch(function () {}); }); }).catch(function () {});
      else if (m.type === 'CANDIDATE' && p.candidate) { if (L.pc.remoteDescription) L.pc.addIceCandidate(p.candidate).catch(function () {}); else L.queue.push(p.candidate); } };
    L.send = function (m) { if (L.ch && L.ch.readyState === 'open') try { L.ch.send(JSON.stringify(m)); } catch (e) {} };
    L.close = function () { try { L.pc.close(); } catch (e) {} };
    return L;
  }
  function me() { var p = HSProfile.get(); return { fc: HSProfile.code(), name: p.name || 'Player', pic: p.pic }; }

  /* ---------- answering: my friends ask what I am doing ---------- */
  var HOST = null, hostLinks = {}, retry = 0;
  function listen() {
    if (HOST) return; if (!HSProfile.has()) { setTimeout(listen, 8000); return; }
    HOST = Signal('hsf-' + HSProfile.code().toLowerCase(), {
      open: function () { retry = 0; },
      error: function () { if (HOST) HOST.close(); HOST = null; retry = Math.min(60000, (retry || 4000) * 1.6); setTimeout(listen, retry); },
      msg: function (m) { var L = hostLinks[m.src];
        if (m.type === 'OFFER' && !L) { L = hostLinks[m.src] = Link(HOST, m.src, (m.payload || {}).connectionId, false, { data: function (l, d) {
          if (d && d.t === 'hi') { l.send({ t: 'st', p: me(), st: HSProfile.presence() || { app: 1 } }); setTimeout(function () { l.close(); delete hostLinks[m.src]; }, 4000); } } });
          setTimeout(function () { if (hostLinks[m.src] === L) { L.close(); delete hostLinks[m.src]; } }, 20000); }
        if (L) L.signal(m); } });
  }

  /* ---------- asking: what is each friend doing ---------- */
  var ASK = null, asks = {}, STATUS = {};
  function asker(cb) { if (ASK && ASK.open) { cb(); return; } if (ASK) { (ASK.wait = ASK.wait || []).push(cb); return; }
    ASK = Signal('hsfq-' + rid(12), { open: function () { var w = (ASK.wait || []).splice(0); cb(); w.forEach(function (f) { f(); }); },
      error: function () { var a = ASK; ASK = null; Object.keys(asks).forEach(function (k) { asks[k].done(null); }); try { a && a.close(); } catch (e) {} },
      expire: function (src) { var k = Object.keys(asks).filter(function (x) { return asks[x].remote === src; })[0]; if (k) asks[k].done(null); },
      msg: function (m) { var k = Object.keys(asks).filter(function (x) { return asks[x].remote === m.src; })[0]; if (k) asks[k].L.signal(m); } });
  }
  function ask(fc, cb) {
    if (asks[fc]) return; var A = asks[fc] = { remote: 'hsf-' + fc.toLowerCase(), done: function (r) { if (A.fin) return; A.fin = 1; clearTimeout(A.t); if (A.L) A.L.close(); delete asks[fc]; cb(r); } };
    A.t = setTimeout(function () { A.done(null); }, 9000);
    asker(function () { if (A.fin) return; A.L = Link(ASK, A.remote, 'dc_' + rid(10), true, { up: function (l) { l.send({ t: 'hi', p: me() }); }, data: function (l, d) { if (d && d.t === 'st') A.done(d); } }); });
  }
  function refresh() { HSProfile.friends().forEach(function (f) { STATUS[f.fc] = STATUS[f.fc] && STATUS[f.fc].k !== 'wait' ? STATUS[f.fc] : { k: 'wait' };
    ask(f.fc, function (r) { if (!r) STATUS[f.fc] = { k: 'off', at: Date.now() };
      else { var st = r.st || {}; STATUS[f.fc] = { k: st.code ? 'room' : st.game ? 'game' : 'app', st: st, at: Date.now() }; if (r.p) HSProfile.addFriend(f.fc, r.p.name, r.p.pic); }
      paint(); }); }); paint(); }

  /* ---------- the button and the panel ---------- */
  var CSS = '#hsMe{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:12px;z-index:7;width:46px;height:46px;padding:0;border:0;border-radius:50%;cursor:pointer;background:#0e0708;box-shadow:0 0 0 2px #c4121c,0 0 0 4px rgba(0,0,0,.55),0 4px 16px rgba(0,0,0,.6);overflow:visible;transition:transform .12s,box-shadow .12s}' +
    '#hsMe:hover,#hsMe:focus-visible{transform:scale(1.06);box-shadow:0 0 0 2px #ff2630,0 0 0 4px rgba(0,0,0,.55),0 0 18px rgba(255,38,48,.55);outline:none}' +
    '#hsMe .av{position:absolute;inset:0;border-radius:50%;overflow:hidden}#hsMe .av .hsp-pic{display:block;width:100%!important;height:100%!important}' +
    '#hsMe .dot{position:absolute;right:-1px;bottom:-1px;min-width:14px;height:14px;border-radius:7px;background:#2ad06a;box-shadow:0 0 0 2px #070405;font:800 9px/14px system-ui,sans-serif;color:#04140a;text-align:center;padding:0 3px}' +
    '#hsMe .dot.off{display:none}' +
    '#hsSide{position:absolute;inset:0;z-index:30;display:flex;justify-content:flex-end;background:rgba(4,2,3,.0);transition:background .2s;pointer-events:none}' +
    '#hsSide.on{background:rgba(4,2,3,.62);pointer-events:auto;backdrop-filter:blur(3px)}' +
    '#hsSide .pan{width:min(380px,92vw);height:100%;background:linear-gradient(180deg,#160709,#0b0506 40%);box-shadow:-12px 0 40px rgba(0,0,0,.7),inset 1px 0 0 #3a1315;transform:translateX(104%);transition:transform .24s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;padding:calc(14px + env(safe-area-inset-top,0px)) 16px calc(16px + env(safe-area-inset-bottom,0px));overflow-y:auto;color:#f1e7d0;font:500 14px/1.35 system-ui,-apple-system,sans-serif}' +
    '#hsSide.on .pan{transform:none}' +
    '#hsSide .top{display:flex;align-items:center;gap:10px;margin-bottom:14px}#hsSide .top h2{flex:1;margin:0;font:400 26px/1 "Pirata One",serif;letter-spacing:.02em}' +
    '#hsSide .ib{width:38px;height:38px;border:0;border-radius:11px;background:rgba(255,255,255,.07);color:#f1e7d0;font-size:20px;line-height:1;cursor:pointer;display:grid;place-items:center;flex:none}#hsSide .ib:hover{background:#c4121c}' +
    '#hsSide .card{display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:linear-gradient(135deg,rgba(196,18,28,.28),rgba(196,18,28,.06));box-shadow:inset 0 0 0 1px rgba(255,38,48,.35)}' +
    '#hsSide .big{width:72px;height:72px;border-radius:50%;overflow:hidden;flex:none;box-shadow:0 0 0 2px #ff2630,0 0 0 5px rgba(0,0,0,.5)}#hsSide .big .hsp-pic,#hsSide .sm .hsp-pic{display:block;width:100%!important;height:100%!important}' +
    '#hsSide .nm{font:400 26px/1 "Pirata One",serif}#hsSide .fc{margin-top:6px;font:800 12px/1 system-ui,sans-serif;letter-spacing:.18em;color:#a6968f}#hsSide .fc b{color:#ffe36a;letter-spacing:.22em}' +
    '#hsSide .list{display:flex;flex-direction:column;gap:8px;margin-top:14px}' +
    '#hsSide .row{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border:0;border-radius:14px;background:rgba(255,255,255,.045);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);color:#f1e7d0;text-align:left;font:700 14px/1.2 system-ui,sans-serif;letter-spacing:.05em;cursor:pointer;transition:background .12s,box-shadow .12s}' +
    '#hsSide button.row:hover,#hsSide button.row:focus-visible{background:rgba(255,38,48,.12);box-shadow:inset 0 0 0 1px #ff2630;outline:none}' +
    '#hsSide .row .ic{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(196,18,28,.18);color:#ff2630;flex:none}#hsSide .row .ic svg{width:20px;height:20px}' +
    '#hsSide .row .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}#hsSide .row .tx small{font:500 12px/1.25 system-ui,sans-serif;letter-spacing:0;color:#a6968f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#hsSide .row .go{color:#ff2630;font-size:22px;line-height:1}' +
    '#hsSide .sm{position:relative;width:44px;height:44px;border-radius:50%;overflow:hidden;flex:none;box-shadow:0 0 0 2px rgba(255,255,255,.12)}' +
    '#hsSide .pres{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#5a4a48;vertical-align:1px}#hsSide .pres.on{background:#2ad06a;box-shadow:0 0 6px #2ad06a}#hsSide .pres.play{background:#ffe36a;box-shadow:0 0 6px #ffe36a}#hsSide .pres.room{background:#ff2630;box-shadow:0 0 6px #ff2630}' +
    '#hsSide .btn{border:0;border-radius:999px;padding:9px 16px;font:800 12px/1 system-ui,sans-serif;letter-spacing:.14em;cursor:pointer;background:#c4121c;color:#fff;flex:none}#hsSide .btn:hover{background:#ff2630}#hsSide .btn.ghost{background:rgba(255,255,255,.08);color:#f1e7d0}#hsSide .btn.ok{background:transparent;color:#2ad06a;cursor:default}' +
    '#hsSide .x{border:0;background:transparent;color:#6a5a58;font-size:18px;cursor:pointer;padding:4px 6px}#hsSide .x:hover{color:#ff2630}' +
    '#hsSide .hint{color:#a6968f;font-size:13px;margin:10px 2px 0}#hsSide .empty{padding:22px 14px;text-align:center;color:#a6968f;border-radius:14px;background:rgba(255,255,255,.03);margin-top:14px}' +
    '#hsSide .codebox{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px;border-radius:14px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);margin-top:6px}#hsSide .codebox b{font:800 26px/1 system-ui,sans-serif;letter-spacing:.3em;color:#ffe36a}' +
    '#hsSide input{width:100%;box-sizing:border-box;margin-top:8px;padding:14px 16px;border:0;border-radius:14px;background:#050304;box-shadow:inset 0 0 0 1px #4a1a1c;color:#fff;font:800 22px/1 system-ui,sans-serif;letter-spacing:.32em;text-transform:uppercase;outline:none}#hsSide input:focus{box-shadow:inset 0 0 0 2px #ff2630}' +
    '#hsSide .lab{font:800 11px/1 system-ui,sans-serif;letter-spacing:.24em;color:#ff2630;margin:18px 2px 4px}' +
    '#hsSide .msg{margin-top:10px;font-size:13px;color:#ffe36a;min-height:18px}';
  var ICON = { prof: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    friends: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M16.5 14.6c2.6.3 4.4 2.2 5 5"/></svg>',
    add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10" cy="8" r="3.8"/><path d="M3 20c1.2-3.8 3.9-5.8 7-5.8 1.4 0 2.7.4 3.8 1.1"/><path d="M19 13v7M15.5 16.5h7"/></svg>',
    recent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>' };
  var btn, side, page = 'menu', addMsg = '';
  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var host = document.getElementById('app') || document.body;
    btn = document.createElement('button'); btn.type = 'button'; btn.id = 'hsMe'; btn.setAttribute('aria-label', 'Profile and friends'); btn.innerHTML = '<span class="av"></span><span class="dot off"></span>';
    btn.addEventListener('click', function () { open('menu'); }); host.appendChild(btn);
    side = document.createElement('div'); side.id = 'hsSide'; side.setAttribute('aria-hidden', 'true'); side.innerHTML = '<div class="pan" role="dialog" aria-label="Profile and friends"></div>'; host.appendChild(side);
    side.addEventListener('click', function (e) { if (e.target === side) close(); });
    side.querySelector('.pan').addEventListener('click', onClick);
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && side.classList.contains('on') && !document.getElementById('hsProf')) { e.preventDefault(); if (page === 'menu') close(); else go('menu'); } });
    ['hsprofile', 'hsfriends'].forEach(function (ev) { addEventListener(ev, function () { badge(); if (side.classList.contains('on')) paint(); }); });
    addEventListener('storage', function (e) { if (/^hs-(profile|friends|recent)$/.test(e.key)) { badge(); if (side.classList.contains('on')) paint(); } });
    addEventListener('hashchange', vis); vis(); badge();
  }
  function vis() { var h = location.hash.replace(/^#\/?/, ''); btn.style.display = h === 'play' || h === 'watch' ? 'none' : ''; if (h === 'play' || h === 'watch') close(); }
  function badge() { var p = HSProfile.get(); btn.querySelector('.av').innerHTML = HSProfile.html(p.pic); var n = HSProfile.friends().filter(function (f) { var s = STATUS[f.fc]; return s && (s.k === 'room' || s.k === 'game' || s.k === 'app'); }).length;
    var d = btn.querySelector('.dot'); d.textContent = n ? String(n) : ''; d.classList.toggle('off', !n); }
  function open(p) { page = p || 'menu'; side.classList.add('on'); side.setAttribute('aria-hidden', 'false'); paint(); if (page === 'menu' || page === 'friends') refresh(); }
  function close() { if (!side) return; side.classList.remove('on'); side.setAttribute('aria-hidden', 'true'); }
  function go(p) { page = p; addMsg = ''; paint(); if (p === 'friends') refresh(); var f = side.querySelector('input'); if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 60); }
  function ago(t) { var s = (Date.now() - t) / 1000; return s < 90 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; }
  function gameName(st) { return (st && (GAMES[st.game] || st.title)) || 'a game'; }
  function head(title, back) { return '<div class="top">' + (back ? '<button class="ib" data-a="back" aria-label="Back">&#8249;</button>' : '') + '<h2>' + title + '</h2><button class="ib" data-a="close" aria-label="Close">&#10005;</button></div>'; }
  function row(a, icon, t, sub) { return '<button class="row" data-a="' + a + '"><span class="ic">' + icon + '</span><span class="tx">' + t + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="go">&#8250;</span></button>'; }
  function paint() {
    if (!side) return; var pan = side.querySelector('.pan'), p = HSProfile.get(), has = HSProfile.has(), F = HSProfile.friends(), R = HSProfile.recent(), html = '';
    var onl = F.filter(function (f) { var s = STATUS[f.fc]; return s && s.k !== 'off' && s.k !== 'wait'; }).length;
    if (page === 'menu') {
      html = head('Profile') + '<div class="card"><span class="big">' + HSProfile.html(p.pic) + '</span><div><div class="nm">' + esc(has ? p.name : 'No profile yet') + '</div><div class="fc">FRIEND CODE <b>' + HSProfile.code() + '</b></div></div></div>' +
        '<div class="list">' + row('edit', ICON.prof, has ? 'Edit profile' : 'Make your profile', 'Your name and character, shown in every game') +
        row('friends', ICON.friends, 'Friends', F.length ? F.length + (F.length === 1 ? ' friend' : ' friends') + (onl ? ' · ' + onl + ' online' : '') : 'Nobody yet') +
        row('add', ICON.add, 'Add friend', 'With their friend code') + row('recent', ICON.recent, 'Recently played with', R.length ? R.length + ' people' : 'Play online to meet people') + '</div>';
    } else if (page === 'friends') {
      html = head('Friends', 1) + '<div style="display:flex;justify-content:space-between;align-items:center"><span class="hint" style="margin:0">' + (F.length ? onl + ' of ' + F.length + ' online' : '') + '</span>' + (F.length ? '<button class="btn ghost" data-a="refresh">REFRESH</button>' : '') + '</div>' +
        (F.length ? '<div class="list">' + F.map(function (f) { var s = STATUS[f.fc] || { k: 'wait' }, cls = s.k === 'room' ? 'room' : s.k === 'game' ? 'play' : s.k === 'app' ? 'on' : '',
          line = s.k === 'wait' ? 'Checking…' : s.k === 'off' ? 'Offline' : s.k === 'app' ? 'Online · in the app' : s.k === 'game' ? 'Playing ' + esc(gameName(s.st)) : 'In a room in ' + esc(gameName(s.st)) + (s.st.n ? ' · ' + s.st.n + ' in it' : '');
          return '<div class="row" style="cursor:default"><span class="sm">' + HSProfile.html(f.pic) + '</span><span class="tx">' + esc(f.name || f.fc) + '<small><span class="pres ' + cls + '"></span>' + line + '</small></span>' +
            (s.k === 'room' ? '<button class="btn" data-a="join" data-fc="' + f.fc + '">JOIN</button>' : '') + '<button class="x" data-a="rm" data-fc="' + f.fc + '" aria-label="Remove friend">&#10005;</button></div>'; }).join('') + '</div>'
          : '<div class="empty">No friends yet. Give people your code, or add theirs.<br><br><button class="btn" data-a="add">ADD FRIEND</button></div>') +
        '<p class="hint">Friends show up online while their app is open. JOIN takes you straight into their room.</p>';
    } else if (page === 'add') {
      html = head('Add friend', 1) + '<div class="lab">YOUR CODE</div><div class="codebox"><b>' + HSProfile.code() + '</b><button class="btn ghost" data-a="copy">COPY</button></div><p class="hint">Give this to a friend so they can add you.</p>' +
        '<div class="lab">THEIR CODE</div><input id="hsAddIn" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC123" aria-label="Friend code"><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn" data-a="doadd">ADD FRIEND</button></div><div class="msg">' + esc(addMsg) + '</div>';
    } else if (page === 'recent') {
      var fr = {}; F.forEach(function (f) { fr[f.fc] = 1; });
      html = head('Recently played with', 1) + (R.length ? '<div class="list">' + R.map(function (r) { return '<div class="row" style="cursor:default"><span class="sm">' + HSProfile.html(r.pic) + '</span><span class="tx">' + esc(r.name) + '<small>' + esc(GAMES[r.game] || r.title || '') + ' · ' + ago(r.at) + '</small></span>' +
        (fr[r.fc] ? '<span class="btn ok">FRIEND &#10003;</span>' : '<button class="btn" data-a="addr" data-fc="' + r.fc + '">ADD</button>') + '</div>'; }).join('') + '</div>' : '<div class="empty">Nobody yet. The people you meet in online rooms show up here.</div>');
    }
    pan.innerHTML = html;
    var inp = pan.querySelector('#hsAddIn'); if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } });
    badge();
  }
  function doAdd() { var v = (side.querySelector('#hsAddIn') || {}).value || '', c = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (c.length !== 6) { addMsg = 'A friend code is six letters and numbers.'; paint(); return; } if (c === HSProfile.code()) { addMsg = 'That is your own code.'; paint(); return; }
    if (HSProfile.friends().some(function (f) { return f.fc === c; })) { addMsg = 'Already your friend.'; paint(); return; }
    HSProfile.addFriend(c, '', 'cumhead'); STATUS[c] = { k: 'wait' }; go('friends'); }
  function onClick(e) { var b = e.target.closest('[data-a]'); if (!b) return; var a = b.getAttribute('data-a'), fc = b.getAttribute('data-fc');
    if (a === 'close') close(); else if (a === 'back') go('menu');
    else if (a === 'edit') HSProfile.edit(function () { paint(); badge(); listen(); });
    else if (a === 'friends' || a === 'add' || a === 'recent') go(a);
    else if (a === 'refresh') refresh();
    else if (a === 'rm') { var f = HSProfile.friends().filter(function (x) { return x.fc === fc; })[0]; if (f && confirm('Remove ' + (f.name || f.fc) + ' from your friends?')) { HSProfile.removeFriend(fc); paint(); } }
    else if (a === 'join') { var s = STATUS[fc]; if (s && s.st && s.st.code && s.st.game) { close(); if (window.hsPlay) window.hsPlay('games/' + s.st.game + '.html?join=' + encodeURIComponent(s.st.code), GAMES[s.st.game] || s.st.title || ''); } }
    else if (a === 'doadd') doAdd();
    else if (a === 'addr') { var r = HSProfile.recent().filter(function (x) { return x.fc === fc; })[0]; if (r) { HSProfile.addFriend(r.fc, r.name, r.pic); paint(); } }
    else if (a === 'copy') { var c = HSProfile.code(); try { navigator.clipboard.writeText(c).then(function () { b.textContent = 'COPIED'; }, function () { b.textContent = c; }); } catch (x) { b.textContent = c; } }
  }
  function start() { build(); listen(); setInterval(function () { if (HSProfile.friends().length && !document.hidden) refresh(); }, 60000); setTimeout(refresh, 1500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.HSFriends = { open: open, refresh: refresh, status: function () { return STATUS; } };
})();
