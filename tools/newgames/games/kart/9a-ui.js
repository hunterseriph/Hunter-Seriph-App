/* =====================================================================================================
   CUMHEAD KART: the menus. Every screen fills the whole screen (portrait, landscape and desktop), works with
   touch, mouse, keyboard and a controller (padkit drives the plain <button>s), and shows your app profile
   (games/profile.js) in the corner. Screens are built straight into the kit's #menu element, so
   KIT.menuOpen() still pauses the race and padkit still finds them.
   ===================================================================================================== */
var CKCSS = [
  '#menu.ck{padding:0;display:block;overflow:hidden;background:linear-gradient(90deg,rgba(7,4,5,.96) 0,rgba(7,4,5,.88) 46%,rgba(7,4,5,.55) 100%)}',
  '#menu.ck.solid{background:radial-gradient(circle at 70% 20%,#2a0408,#070405 65%)}',
  '.cks{position:absolute;inset:0;display:flex;flex-direction:column;padding:calc(10px + env(safe-area-inset-top,0px)) 14px calc(10px + env(safe-area-inset-bottom,0px));gap:10px}',
  '.ckh{display:flex;align-items:center;gap:10px;flex:none;min-height:44px;padding-right:138px}',
  '.ckh h1{margin:0;font-family:var(--display);font-weight:400;font-size:clamp(26px,5.2vw,40px);line-height:1;color:var(--hot);text-shadow:0 0 14px rgba(255,38,48,.4),2px 2px 0 #12040a;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.ckh .sub{font-size:13px;color:var(--ash);letter-spacing:.04em}',
  '.ckbk{flex:none;width:44px;height:44px;border:0;background:#140809;color:var(--bone);font-size:20px;cursor:pointer;box-shadow:inset 0 0 0 1px #4a1a1c;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)}',
  '.ckme{display:flex;align-items:center;gap:8px;border:0;padding:4px 10px 4px 4px;background:rgba(14,7,8,.85);color:var(--bone);cursor:pointer;box-shadow:inset 0 0 0 1px #4a1a1c;font-family:var(--display);font-size:18px;max-width:42vw;flex:none}',
  '.ckme .hsp-pic{outline:1px solid #c8b898;flex:none}.ckme b{font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ckme small{display:block;font-family:var(--body);font-size:10px;letter-spacing:.14em;color:var(--hot)}',
  '.ckb{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:2px}',
  '.ckf{flex:none;font-family:var(--pixel);font-size:8px;color:rgba(241,231,208,.45);letter-spacing:.04em;text-align:center}',
  '.ckbtn{appearance:none;border:0;cursor:pointer;color:var(--bone);text-align:left;background:#140809;box-shadow:inset 0 0 0 1px #4a1a1c;clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);font-family:var(--body)}',
  '.ckbtn:hover,.ckbtn.hs-focus,.ckbtn:focus-visible{background:#2a0a0e;box-shadow:inset 0 0 0 2px #ff2630;outline:none!important}',
  '.ckbtn:disabled{opacity:.42;cursor:default}',
  /* title */
  '.ckt{display:flex;flex-direction:column;gap:12px;max-width:520px;height:100%}',
  '.ckt .logo{width:min(300px,62%);align-self:center;filter:drop-shadow(0 4px 0 #12040a)}',
  '.ckt .list{display:flex;flex-direction:column;gap:8px}',
  '.ckt .ckbtn{display:flex;align-items:center;gap:12px;padding:10px 16px;min-height:54px}',
  '.ckt .ckbtn b{font-family:var(--display);font-weight:400;font-size:24px;line-height:1;color:var(--bone);flex:none;min-width:7.2em}',
  '.ckt .ckbtn span{font-size:13px;color:var(--ash);line-height:1.25}',
  '.ckt .ckbtn.hot{background:linear-gradient(90deg,#8e0c14,#3a0608)}.ckt .ckbtn.hot b{color:#ffe36a}',
  '.ckt .note{font-size:12px;color:var(--ash);letter-spacing:.06em}',
  /* cards */
  '.ckg{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}',
  '.ckc{display:flex;flex-direction:column;gap:6px;padding:12px 14px 14px;min-height:100%}',
  '.ckc b{font-family:var(--display);font-weight:400;font-size:26px;line-height:1;color:var(--bone)}',
  '.ckc span{font-size:13px;color:var(--ash);line-height:1.3}.ckc em{font-style:normal;font-size:12px;letter-spacing:.1em;color:var(--gold)}',
  '.ckc .lock{color:var(--hot)}',
  '.ckc canvas,.ckc img.th{width:100%;aspect-ratio:16/9;height:auto;display:block;image-rendering:pixelated;background:#0a0506;box-shadow:inset 0 0 0 1px #2a0c0e}',
  '.ckcup{display:grid;grid-template-columns:64px 1fr;gap:4px 12px;align-items:center}.ckcup img{grid-row:span 3;image-rendering:pixelated}',
  '.ckgrp{font-family:var(--display);font-size:22px;color:var(--gold);margin:10px 2px 6px}',
  '.heat{display:flex;gap:3px}.heat i{width:14px;height:22px;background:#2a0c0e;clip-path:polygon(50% 0,100% 40%,80% 100%,20% 100%,0 40%)}.heat i.on{background:#ff2630}',
  /* character select */
  '.ckch{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,38%);gap:14px;height:100%;min-height:0}',
  '.ckch .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px;align-content:start;overflow:auto;padding:2px;touch-action:pan-y}',
  '.ckch .p{position:relative;padding:0;aspect-ratio:1;display:block}',
  '.ckch .p .hsp-pic{width:100%!important;height:100%!important;display:block}',
  '.ckch .p.sel{box-shadow:inset 0 0 0 3px #ffe36a}.ckch .p[aria-disabled] .hsp-pic{filter:brightness(0)}',
  '.ckch .p .nm{position:absolute;left:0;right:0;bottom:0;font-family:var(--pixel);font-size:7px;padding:3px 2px;background:rgba(7,4,5,.8);text-align:center;white-space:nowrap;overflow:hidden}',
  '.ckinfo{display:flex;flex-direction:column;gap:8px;padding:12px;background:linear-gradient(180deg,#1c0a0d,#0e0708);box-shadow:inset 0 0 0 2px #c8b898,0 0 0 2px #12040a;min-height:0;overflow:auto}',
  '.ckinfo .top{display:flex;gap:12px;align-items:center}.ckinfo .top .hsp-pic{outline:2px solid #12040a;box-shadow:0 0 0 3px #4a1a1c;flex:none}',
  '.ckinfo h2{margin:0;font-family:var(--display);font-weight:400;font-size:30px;line-height:1;color:var(--bone)}',
  '.ckinfo p{margin:0;font-size:13px;color:var(--ash);line-height:1.35}',
  '.ckst{display:grid;grid-template-columns:auto 1fr;gap:5px 10px;align-items:center;font-family:var(--pixel);font-size:8px;color:var(--ash)}',
  '.ckst .bar{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}.ckst .bar i{height:10px;background:#2a0c0e}.ckst .bar i.on{background:linear-gradient(180deg,#ff2630,#c4121c)}',
  '.ckinfo .sw{display:flex;gap:6px}.ckinfo .sw i{width:22px;height:12px;box-shadow:0 0 0 1px #12040a}',
  '.ckgo{padding:12px;text-align:center;font-weight:700;letter-spacing:.14em;font-size:15px;background:linear-gradient(180deg,#d8141f,#8e0c14)!important;flex:none}',
  /* results */
  '.ckres{display:flex;flex-direction:column;gap:4px;max-width:760px;margin:0 auto;width:100%}',
  '.ckr{display:grid;grid-template-columns:44px 40px 1fr auto auto;gap:10px;align-items:center;padding:4px 10px 4px 6px;background:#140809;box-shadow:inset 0 0 0 1px #2a0c0e;font-size:15px}',
  '.ckr .pl{font-family:var(--display);font-size:22px;color:var(--ash);text-align:center}.ckr .nm small{display:block;font-size:11px;color:var(--ash)}',
  '.ckr.me{box-shadow:inset 0 0 0 2px #ffe36a}.ckr.me .pl{color:var(--gold)}.ckr .tm{font-family:var(--pixel);font-size:9px;color:var(--bone)}.ckr .pt{font-family:var(--pixel);font-size:9px;color:var(--gold);min-width:3.5em;text-align:right}',
  '.ckr:nth-child(1) .pl{color:#ffe36a}.ckr:nth-child(2) .pl{color:#d0c8d0}.ckr:nth-child(3) .pl{color:#e09a5a}',
  '.ckacts{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;flex:none}.ckacts .ckbtn{padding:12px 18px;font-weight:700;letter-spacing:.12em;font-size:14px;min-width:150px;text-align:center}',
  '.ckacts .ckbtn.hot{background:linear-gradient(180deg,#d8141f,#8e0c14)}',
  '.ckmsg{text-align:center;font-family:var(--display);font-size:22px;color:var(--gold)}',
  /* the kit\'s plain menus (pause, help, options) also fill the screen here */
  '#menu.ck.plain{display:flex;padding:0;background:rgba(7,4,5,.82)}#menu.ck.plain .mbox{width:100%;max-width:none;min-height:100%;margin:0;clip-path:none;box-shadow:none;background:transparent;padding:calc(16px + env(safe-area-inset-top,0px)) max(16px,calc(50% - 300px)) 16px;justify-content:center}',
  'html.ckmenu #pad{display:none!important}',
  '#menu.ck.plain .mclose{right:auto;left:10px;top:calc(8px + env(safe-area-inset-top,0px))}',
  '@media (max-width:640px){.ckh{padding-right:128px}.ckh h1{font-size:24px}.ckme b,.ckme small{display:none}.ckme{padding:4px}.ckg{grid-template-columns:repeat(2,minmax(0,1fr))}.ckc b{font-size:20px}}',
  '@media (max-width:640px),(orientation:portrait){.ckch{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.ckch .ckinfo{order:-1}.ckinfo .ckst{grid-template-columns:auto 1fr auto 1fr}.ckinfo .top .hsp-pic{width:72px!important;height:72px!important}.ckt .ckbtn b{min-width:0}.ckt .ckbtn{flex-direction:column;align-items:flex-start;gap:3px;min-height:0}}',
  '@media (max-height:460px){.ckt{flex-direction:row;max-width:none;align-items:stretch}.ckt .logo{width:34%;align-self:center}.ckt .list{flex:1;overflow:auto;max-width:520px}.ckt .ckbtn{min-height:44px;padding:7px 14px}.ckt .ckbtn b{font-size:20px}.ckinfo .top .hsp-pic{width:64px!important;height:64px!important}.ckch .ckinfo p.fr{display:none}}'
].join('\n');
(function () { var s = document.createElement('style'); s.textContent = CKCSS; document.head.appendChild(s);
  var m = document.getElementById('menu'); new MutationObserver(function () { document.documentElement.classList.toggle('ckmenu', !m.hidden); }).observe(m, { attributes: true, attributeFilter: ['hidden'] }); })();

var CKSCREEN = null; // redraws the screen that is open (after the profile changes)
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
function pid(ch) { return ch === 'hom' ? 'gloop' : ch; } // drivers to profile portraits
function pic(ch, px) { return window.HSProfile ? HSProfile.html(pid(ch), px) : ''; }
function meName() { return window.HSProfile && HSProfile.has() ? HSProfile.name() : 'You'; }
function meChip() {
  var P = window.HSProfile; if (!P) return ''; var p = P.get(), has = P.has();
  return '<button type="button" class="ckme" data-act="profile" aria-label="Your profile">' + P.html(p.pic, 34) + '<span style="min-width:0"><small>' + (has ? 'PROFILE' : 'SET UP') + '</small><b>' + esc(has ? p.name : 'Your profile') + '</b></span></button>';
}
/* open a screen: html for the body, acts: { name: fn(button) } for data-act buttons. back: what B / the arrow does. */
function screen(o) {
  KIT.menu({ cls: 'ck ' + (o.cls || ''), items: [] });
  var m = document.getElementById('menu');
  m.innerHTML = '<div class="cks">' + (o.noHead ? '' : '<div class="ckh">' + (o.back ? '<button type="button" class="ckbk" data-back data-act="back" aria-label="Back">‹</button>' : '') + '<div style="flex:1;min-width:0"><h1>' + esc(o.title || '') + '</h1>' + (o.sub ? '<div class="sub">' + o.sub + '</div>' : '') + '</div>' + meChip() + '</div>') +
    '<div class="ckb">' + o.html + '</div>' + (o.foot !== false ? '<div class="ckf">' + (o.foot || 'A / TAP CHOOSE  ·  B BACK') + '</div>' : '') + '</div>';
  var acts = o.acts || {};
  m.querySelectorAll('[data-act]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var a = b.getAttribute('data-act'); e.stopPropagation();
      if (a === 'profile') { sfx.play('select'); HSProfile.edit(function () { if (CKSCREEN) CKSCREEN(); }); return; }
      if (a === 'back') { sfx.play('back'); if (o.back) o.back(); return; }
      if (acts[a]) { sfx.play('select'); acts[a](b); }
    });
  });
  var def = m.querySelector('[data-pad-default]') || m.querySelector('.ckb button:not(:disabled)'); if (def && !('ontouchstart' in window)) def.focus({ preventScroll: true });
  if (o.after) o.after(m);
  CKSCREEN = o.redo || null;
}
/* a course outline for its card, drawn from its control points (smoothed) */
var THUMBS = {};
function thumb(k) {
  if (THUMBS[k]) return THUMBS[k]; var c = COURSES[k], cv = document.createElement('canvas'); cv.width = 192; cv.height = 108; var g = cv.getContext('2d');
  var sky = (c.sky && c.sky.grad) || [[0, '#000'], [1, '#200']], gr = g.createLinearGradient(0, 0, 0, 108); sky.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); g.fillStyle = gr; g.fillRect(0, 0, 192, 108);
  var P = c.pts, n = P.length, pts = [];
  for (var i = 0; i < n; i++) for (var t = 0; t < 1; t += 0.125) { var p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n], t2 = t * t, t3 = t2 * t; pts.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
  var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
  var s = Math.min(168 / (x1 - x0), 86 / (z1 - z0)), ox = 96 - (x0 + x1) / 2 * s, oz = 54 - (z0 + z1) / 2 * s;
  g.lineJoin = 'round'; g.lineCap = 'round';
  [[9, '#12040a'], [6, '#4a1a1c'], [3, '#c8b898']].forEach(function (L) { g.lineWidth = L[0]; g.strokeStyle = L[1]; g.beginPath(); pts.forEach(function (p, i) { var X = ox + p[0] * s, Z = oz + p[1] * s; if (i) g.lineTo(X, Z); else g.moveTo(X, Z); }); g.closePath(); g.stroke(); });
  var st = pts[0]; g.fillStyle = '#ffe36a'; g.fillRect(ox + st[0] * s - 3, oz + st[1] * s - 3, 6, 6);
  return (THUMBS[k] = cv.toDataURL());
}
function clsName(id) { return CLASSES.filter(function (c) { return c.id === id; })[0].n; }

/* ---------- title ---------- */
function titleMenu() {
  if (typeof mpRoom === 'function' && mpRoom()) return mpLobby();
  MODE = 'title'; GP = null; if (!RACE || !RACE.demo) demo();
  var trophies = Object.keys(SV.cups).filter(function (k) { return SV.cups[k] <= 3; }).length;
  var rows = [
    ['exp', 'Expedition', 'Take back the Crimson Moon Trophy: 12 areas, 120 events, stars to earn', 'hot'],
    ['gp', 'Grand Prix', 'Four races, points for every place, a trophy at the end'],
    ['race', 'Single Race', 'Any course you have opened, against seven rivals'],
    ['chain', 'Chain Race', 'You and a partner tied together by a rope of cream'],
    ['tt', 'Time Trial', 'Just you, the clock and three Cumpuccinos'],
    ['mp', 'Online', 'Host or join a room and race your friends'],
    ['help', 'How to Drive', 'Controls, drifting and items'],
    ['opt', 'Options', 'Auto accelerate: ' + (SV.auto ? 'on' : 'off')]
  ];
  screen({ noHead: true, cls: 'title', foot: false, redo: titleMenu,
    html: '<div style="position:absolute;top:calc(10px + env(safe-area-inset-top,0px));left:14px;z-index:2">' + meChip() + '</div><div class="ckt" style="padding-top:44px"><img class="logo" src="../assets/ck-logo.webp" alt="Cumhead Kart"><div class="list">' +
      rows.map(function (r, i) { return '<button type="button" class="ckbtn ' + (r[3] || '') + '" data-act="' + r[0] + '"' + (i ? '' : ' data-pad-default') + '><b>' + r[1] + '</b><span>' + r[2] + '</span></button>'; }).join('') +
      '</div><div class="note">DROPS ' + (SV.drops || 0) + '  ·  TROPHIES ' + trophies + '</div></div>',
    acts: {
      gp: function gpFlow() { function ch() { pickChar(cup, gpFlow); } function cup() { pickCup(beginGP, ch); } pickClass(ch, titleMenu); },
      race: function raceFlow() { function ch() { pickChar(co, raceFlow); } function co() { pickCourse(beginRace, ch); } pickClass(ch, titleMenu); },
      tt: function ttFlow() { function co() { pickCourse(beginTT, ttFlow); } pickChar(co, titleMenu); },
      exp: function () { expedition(); }, chain: function () { chainMenu(); }, mp: function () { mpMenu(); }, help: helpMenu, opt: optionsMenu
    } });
}
/* ---------- class ---------- */
function pickClass(next, back) {
  var redo = function () { pickClass(next, back); };
  screen({ title: 'Mild, hot or dynamite?', sub: 'How fast everyone goes', back: back || titleMenu, redo: redo,
    html: '<div class="ckg" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">' + CLASSES.map(function (c, i) {
      var op = classOpen(c.id); return '<button type="button" class="ckbtn ckc" data-act="c' + i + '"' + (op ? '' : ' disabled') + (SV.cls === c.id ? ' data-pad-default' : '') + '><div class="heat">' + [0, 1, 2].map(function (h) { return '<i class="' + (h <= i ? 'on' : '') + '"></i>'; }).join('') + '</div><b>' + (op ? c.n : '???') + '</b><span' + (op ? '' : ' class="lock"') + '>' + esc(op ? c.sub : c.lock) + '</span>' + (op ? '<em>SPEED ×' + c.spd.toFixed(2) + '</em>' : '') + '</button>';
    }).join('') + '</div>',
    acts: (function () { var a = {}; CLASSES.forEach(function (c, i) { a['c' + i] = function () { SV.cls = c.id; persist(); next(); }; }); return a; })() });
}
/* ---------- who is driving ---------- */
function pickChar(next, back) {
  var sel = SV.ch, redo = function () { pickChar(next, back); };
  function info(id) {
    var c = CH[id], op = charOpen(id), names = ['SPEED', 'ACCEL', 'HANDLING', 'WEIGHT'];
    return '<div class="top">' + (op ? pic(id, 96) : '<span class="hsp-pic" style="display:inline-block;width:96px;height:96px;background:#0a0506"></span>') + '<div><h2>' + (op ? esc(c.n) : '???') + '</h2>' + (op && id === SV.ch ? '<p style="color:#ffe36a">' + (pickChar.title ? 'YOUR PARTNER' : 'YOUR DRIVER') + '</p>' : '') + '</div></div>' +
      '<p class="fr"' + (op ? '' : ' style="color:#ff2630"') + '>' + esc(op ? c.from : 'Locked: ' + c.lock) + '</p>' +
      (op ? '<div class="ckst">' + c.st.map(function (v, i) { return '<span>' + names[i] + '</span><span class="bar">' + [0, 1, 2, 3, 4].map(function (q) { return '<i class="' + (q < v ? 'on' : '') + '"></i>'; }).join('') + '</span>'; }).join('') + '</div>' +
        '<div class="sw">' + c.kart.map(function (k) { return '<i style="background:' + k + '"></i>'; }).join('') + '</div>' : '');
  }
  screen({ title: pickChar.title || 'Who is driving?', back: back || titleMenu, redo: redo, foot: 'A / TAP PICK  ·  A AGAIN OR DRIVE TO GO  ·  B BACK',
    html: '<div class="ckch"><div class="grid">' + CHARS.map(function (c) { var op = charOpen(c.id); return '<button type="button" class="ckbtn p' + (c.id === sel ? ' sel' : '') + '" data-act="ch" data-ch="' + c.id + '"' + (op ? '' : ' aria-disabled="true"') + (c.id === sel ? ' data-pad-default' : '') + ' aria-label="' + esc(op ? c.n : 'Locked') + '">' + pic(c.id) + '<span class="nm">' + esc(op ? c.n.replace(/^(The|Uncle|Sir) /, '').replace(/^King /, 'K.').split(' ')[0].toUpperCase() : '???') + '</span></button>'; }).join('') +
      '</div><div class="ckinfo"><div id="ckInfo">' + info(sel) + '</div><button type="button" class="ckbtn ckgo" data-act="go">DRIVE</button></div></div>',
    acts: {
      ch: function (b) { var id = b.getAttribute('data-ch'); if (!charOpen(id)) { document.getElementById('ckInfo').innerHTML = info(id); sfx.play('back'); return; }
        if (id === sel) { SV.ch = id; persist(); next(); return; } sel = id; [].forEach.call(document.querySelectorAll('.ckch .p'), function (q) { q.classList.toggle('sel', q === b); }); document.getElementById('ckInfo').innerHTML = info(id); },
      go: function () { SV.ch = sel; persist(); next(); }
    },
    after: function (m) { // the info panel follows the controller focus and the mouse
      var shown = sel, ip = document.getElementById('ckInfo');
      m.querySelectorAll('.ckch .p').forEach(function (b) { b.addEventListener('mouseenter', function () { var id = b.getAttribute('data-ch'); if (id !== shown) { shown = id; ip.innerHTML = info(id); } }); b.addEventListener('mouseleave', function () { if (shown !== sel) { shown = sel; ip.innerHTML = info(sel); } }); });
      (function follow() { if (!document.body.contains(ip)) return; var f = m.querySelector('.ckch .p.hs-focus'), id = f && f.getAttribute('data-ch'); if (id && id !== shown) { shown = id; ip.innerHTML = info(id); } requestAnimationFrame(follow); })();
    } });
}
/* ---------- cups ---------- */
function pickCup(next, back) {
  screen({ title: 'Choose a cup', sub: clsName(SV.cls) + ' class', back: back || titleMenu, redo: function () { pickCup(next, back); },
    html: '<div class="ckg" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' + CUPS.map(function (c, i) {
      var op = cupOpen(c.id), p = cupPlace(c.id, SV.cls), tro = p === 1 ? 'ck_gold' : p === 2 ? 'ck_silver' : p === 3 ? 'ck_bronze' : c.ic;
      return '<button type="button" class="ckbtn ckc" data-act="u' + i + '"' + (op ? '' : ' disabled') + (i ? '' : ' data-pad-default') + '><div class="ckcup">' + (portrait(tro, 64, '#0a0506') ? '<img src="' + portrait(tro, 64, '#0a0506') + '" width="64" height="64" alt="">' : '') +
        '<b>' + (op ? c.n : '???') + '</b><span' + (op ? '' : ' class="lock"') + '>' + (op ? c.courses.map(function (k) { return esc(COURSES[k].n); }).join('<br>') : esc(c.lock)) + '</span>' + (p ? '<em>BEST: ' + ordinal(p).toUpperCase() + '</em>' : '') + '</div></button>';
    }).join('') + '</div>',
    acts: (function () { var a = {}; CUPS.forEach(function (c, i) { a['u' + i] = function () { next(c); }; }); return a; })() });
}
/* ---------- courses ---------- */
function pickCourse(next, back) {
  var h = '', a = {}, first = true;
  CUPS.forEach(function (cup) {
    var op = cupOpen(cup.id); h += '<div class="ckgrp">' + esc(cup.n) + (op ? '' : ' <span style="font-size:14px;color:#ff2630">· ' + esc(cup.lock) + '</span>') + '</div><div class="ckg">';
    cup.courses.forEach(function (k) {
      var c = COURSES[k], b = SV.best[k]; a['k_' + k] = function () { next(k); };
      h += '<button type="button" class="ckbtn ckc" data-act="k_' + k + '"' + (op ? '' : ' disabled') + (op && first ? ' data-pad-default' : '') + '><img class="th" src="' + thumb(k) + '" alt=""><b>' + (op ? esc(c.n) : '???') + '</b><span' + (op ? '' : ' class="lock"') + '>' + (op ? 'From ' + esc(c.from) : 'Locked') + '</span>' + (b && op ? '<em>LAP ' + fmtTime(b.lap) + '  ·  RACE ' + fmtTime(b.race) + '</em>' : '') + '</button>';
      if (op) first = false;
    });
    h += '</div>';
  });
  screen({ title: 'Choose a course', back: back || function () { pickChar(function () { pickCourse(next); }, titleMenu); }, redo: function () { pickCourse(next, back); }, html: h, acts: a });
}
/* ---------- results ---------- */
function resultRows(list, opt) {
  return '<div class="ckres">' + list.map(function (r, i) {
    var nm = r.me ? meName() : r.name; return '<div class="ckr' + (r.me ? ' me' : '') + '"><span class="pl">' + (r.place || i + 1) + '</span>' + pic(r.ch, 40) + '<span class="nm">' + esc(nm || CH[r.ch].n) + (nm ? '<small>' + esc(CH[r.ch].n) + '</small>' : '') + '</span><span class="tm">' + (r.time || '') + '</span><span class="pt">' + (r.pts !== undefined && r.pts !== null ? r.pts : '') + '</span></div>';
  }).join('') + '</div>';
}
function endRace() {
  var R = RACE; if (R.demo) { demo(); return; }
  R.karts.forEach(function (k) { if (!k.done) { var left = (R.laps + 1) * R.T.N - k.prog; k.time = R.t + left * STEP / Math.max(8, k.top * 0.85); k.done = true; } });
  var order = R.karts.slice().sort(function (a, b) { return a.time - b.time; }); order.forEach(function (k, i) { k.place = i + 1; });
  if (R.ev) return expEnd(R);
  if (R.tt) return ttResults();
  if (R.chain) return chainEnd(R);
  var rows = order.map(function (k, i) { var pts = GP ? POINTS[i] : null; if (GP) GP.pts[k.idx] += pts; return { ch: k.ch, idx: k.idx, name: !k.ai && k !== R.me ? k.tag : null, me: k === R.me, time: fmtTime(k.time), pts: GP ? '+' + pts : null }; });
  var html = resultRows(rows) + (R.newLap ? '<div class="ckmsg" style="margin-top:10px">New best lap!</div>' : '');
  if (GP) {
    if (R.net === 'host') netBroadcast({ t: 'end', kind: 'race', title: R.def.n, sub: 'Race ' + (GP.n + 1) + ' of 4', rows: rows });
    GP.grid = order.map(function (k) { return R.karts.indexOf(k); }).reverse(); GP.lastPlace = R.me.place; GP.n++;
    screen({ cls: 'solid', title: R.def.n, sub: 'Race ' + GP.n + ' of 4  ·  you came ' + ordinal(R.me.place), html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="next" data-pad-default>' + (GP.n < 4 ? 'STANDINGS' : 'FINAL STANDINGS') + '</button></div>', acts: { next: standings }, foot: false });
  } else {
    if (R.net === 'host') netBroadcast({ t: 'end', kind: 'race', title: R.def.n, sub: 'Single race', rows: rows });
    screen({ cls: 'solid', title: R.def.n, sub: 'You came ' + ordinal(R.me.place), back: function () { RACE = null; titleMenu(); },
      html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="again" data-pad-default>RACE AGAIN</button><button type="button" class="ckbtn" data-act="other">ANOTHER COURSE</button><button type="button" class="ckbtn" data-act="title">TITLE</button></div>',
      acts: { again: function () { beginRace(R.o.course); }, other: function () { pickCourse(beginRace, function () { RACE = null; titleMenu(); }); }, title: function () { RACE = null; titleMenu(); } }, foot: false });
  }
}
function standings() {
  var list = GP.pts.map(function (p, i) { return i; }).sort(function (a, b) { return GP.pts[b] - GP.pts[a] || a - b; }), place = list.indexOf(0) + 1;
  var rows = list.map(function (i) { return { ch: GP.roster[i], idx: i, name: i ? GP.names[i] || null : null, me: i === 0, pts: GP.pts[i] + ' PTS' }; }), html = resultRows(rows);
  if (NET.role === 'host') netBroadcast({ t: 'end', kind: 'race', title: GP.n < 4 ? 'Standings' : 'Final standings', sub: GP.cup.n, rows: rows });
  if (GP.n < 4) {
    screen({ cls: 'solid', title: 'Standings', sub: esc(GP.cup.n) + '  ·  next: ' + esc(COURSES[GP.cup.courses[GP.n]].n), html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="next" data-pad-default>NEXT RACE</button><button type="button" class="ckbtn" data-act="quit">QUIT THE CUP</button></div>', acts: { next: gpRace, quit: function () { RACE = null; titleMenu(); } }, foot: false });
    return;
  }
  var key = GP.cup.id + '_' + GP.cls, prev = SV.cups[key]; if (!prev || place < prev) SV.cups[key] = place; persist();
  var got = checkUnlocks(), tro = place === 1 ? 'ck_gold' : place === 2 ? 'ck_silver' : place === 3 ? 'ck_bronze' : null;
  music.play(place <= 3 ? 'ck_win' : 'ck_results');
  screen({ cls: 'solid', title: place <= 3 ? (place === 1 ? 'You win the ' : 'You finish ' + ordinal(place) + ' in the ') + GP.cup.n : 'You finish ' + ordinal(place), sub: clsName(GP.cls) + ' class',
    html: (tro ? '<div style="text-align:center"><img src="' + portrait(tro, 96, '#0e0708') + '" width="96" height="96" style="image-rendering:pixelated" alt=""></div>' : '') + html + (got.length ? '<div class="ckmsg" style="margin-top:10px">Unlocked: ' + esc(got.join(', ')) + '</div>' : '') +
      '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="t" data-pad-default>BACK TO THE TITLE</button></div>', acts: { t: function () { RACE = null; GP = null; titleMenu(); } }, foot: false });
}
function ttResults() {
  var R = RACE, k = R.me, b = SV.best[R.o.course] || { lap: Math.min.apply(null, k.laps.length ? k.laps : [0]), race: k.time };
  if (R.net === 'host') netBroadcast({ t: 'end', kind: 'race', title: R.def.n, sub: 'Time trial', rows: R.all.filter(function (q) { return isHuman(R, q); }).sort(function (p, q) { return p.time - q.time; }).map(function (q) { return { ch: q.ch, idx: q.idx, name: q.tag, time: fmtTime(q.time) }; }) });
  var html = '<div class="ckres">' + k.laps.map(function (l, i) { return '<div class="ckr' + (l === b.lap ? ' me' : '') + '" style="grid-template-columns:auto 1fr auto"><span class="pl" style="font-size:16px">LAP ' + (i + 1) + '</span><span></span><span class="tm">' + fmtTime(l) + '</span></div>'; }).join('') +
    '<div class="ckr me" style="grid-template-columns:auto 40px 1fr auto"><span class="pl" style="font-size:16px">TIME</span>' + pic(k.ch, 40) + '<span class="nm">' + esc(meName()) + (R.newRace ? '<small style="color:#ffe36a">NEW BEST!</small>' : '') + '</span><span class="tm">' + fmtTime(k.time) + '</span></div>' +
    '<div class="ckr" style="grid-template-columns:1fr auto"><span class="nm">Best race ' + fmtTime(b.race) + '</span><span class="tm">best lap ' + fmtTime(b.lap) + '</span></div></div>';
  screen({ cls: 'solid', title: R.def.n, sub: 'Time trial', back: function () { RACE = null; titleMenu(); },
    html: html + '<div class="ckacts" style="margin-top:12px"><button type="button" class="ckbtn hot" data-act="again" data-pad-default>TRY AGAIN</button><button type="button" class="ckbtn" data-act="other">ANOTHER COURSE</button><button type="button" class="ckbtn" data-act="title">TITLE</button></div>',
    acts: { again: function () { beginTT(R.o.course); }, other: function () { pickCourse(beginTT, function () { RACE = null; titleMenu(); }); }, title: function () { RACE = null; titleMenu(); } }, foot: false });
}
