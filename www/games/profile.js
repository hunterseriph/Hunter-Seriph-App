/* =====================================================================================================
   HSPROFILE: the player's profile, shared by the whole app and every game (same origin, one localStorage key).
   No email, no password, no uploads: just a name and a portrait picked from our characters.
     HSProfile.get()            -> { name, pic } (name '' and pic 'cumhead' until they make one)
     HSProfile.has()            -> true once they have saved a profile
     HSProfile.name(fallback)   -> their name, or fallback
     HSProfile.set({name, pic}) -> save (fires 'hsprofile' on window, other tabs/frames get a storage event)
     HSProfile.draw(ctx, pic, x, y, size, frame) -> draw a portrait on a canvas (frame: true = FF7-style window)
     HSProfile.html(pic, px)    -> HTML for a portrait <span> at px pixels
     HSProfile.edit(done)       -> full-screen editor (name keyboard + portrait grid), works with touch, mouse,
                                   keyboard and controller (padkit drives it: its buttons are plain <button>s)
     HSProfile.ready(fn)        -> fn() once the portrait sheet has loaded
   Portraits: www/assets/portraits.png, made by tools/portraits/make.py (which also writes the LIST below).
   ===================================================================================================== */
(function () {
  'use strict';
  var KEY = 'hs-profile';
  var LIST = /*PORTRAITS*/[{"id":"cumhead","n":"Cumhead","g":"Heroes","i":0},{"id":"spermaid","n":"Spermaid","g":"Heroes","i":1},{"id":"greebo","n":"Greebo","g":"Heroes","i":2},{"id":"amy","n":"Amy","g":"Town","i":3},{"id":"tb","n":"TB","g":"Town","i":4},{"id":"saba","n":"Saba","g":"Town","i":5},{"id":"joff","n":"Joff","g":"Town","i":6},{"id":"kaya","n":"Kaya","g":"Town","i":7},{"id":"elden","n":"Elden","g":"Town","i":8},{"id":"beebs","n":"Uncle Beeb","g":"Town","i":9},{"id":"ali","n":"Ali","g":"Town","i":10},{"id":"potbelly","n":"Potbelly","g":"Town","i":11},{"id":"t","n":"T","g":"Town","i":12},{"id":"bonjo","n":"Bonjo","g":"Town","i":13},{"id":"pulsar","n":"PulsarOctopus","g":"Town","i":14},{"id":"harold","n":"Harold","g":"Town","i":15},{"id":"jessiah","n":"Jessiah","g":"Town","i":16},{"id":"nattyboro","n":"Nattyboro","g":"Town","i":17},{"id":"judgement","n":"Judgement","g":"Town","i":18},{"id":"stackedfate","n":"Stacked Fate","g":"Town","i":19},{"id":"masterbates","n":"Master Bates","g":"Town","i":20},{"id":"steve","n":"Steve","g":"Town","i":21},{"id":"sirj","n":"Sir Johnathan","g":"Town","i":22},{"id":"blum","n":"Blumhead","g":"Villains","i":23},{"id":"kingblum","n":"King Blumhead","g":"Villains","i":24},{"id":"gloop_baby","n":"Gloop (baby)","g":"Homunculi","i":25},{"id":"gloop_teen","n":"Gloop (teen)","g":"Homunculi","i":26},{"id":"gloop","n":"Gloop","g":"Homunculi","i":27},{"id":"hom_guard","n":"Bulwark","g":"Homunculi","i":28},{"id":"hom_ember","n":"Embertail","g":"Homunculi","i":29},{"id":"hom_frost","n":"Frostbite","g":"Homunculi","i":30},{"id":"hom_volt","n":"Voltling","g":"Homunculi","i":31},{"id":"hom_medic","n":"Mendling","g":"Homunculi","i":32},{"id":"hom_leech","n":"Leechling","g":"Homunculi","i":33},{"id":"hom_scout","n":"Peeper","g":"Homunculi","i":34},{"id":"hom_goldie","n":"Goldie","g":"Homunculi","i":35},{"id":"hom_titan","n":"Titan","g":"Homunculi","i":36},{"id":"hom_blood","n":"Bloodmoon","g":"Homunculi","i":37}]/*END*/;
  var SZ = 64, COLS = 8;
  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^\/]*$/, '') : '';
  var IMG = new Image(), loaded = false, waiting = [];
  IMG.onload = function () { loaded = true; waiting.splice(0).forEach(function (f) { try { f(); } catch (e) {} }); };
  IMG.src = base + '../assets/portraits.png';
  var BY = {}; LIST.forEach(function (p) { BY[p.id] = p; });

  function read() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') return o; } catch (e) {} return null; }
  function clean(n) { return String(n || '').replace(/[^A-Za-z0-9 _.'\-!?]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); }
  function get() { var o = read() || {}; return { name: clean(o.name), pic: BY[o.pic] ? o.pic : 'cumhead' }; }
  function set(p) {
    var o = get(); if (p.name !== undefined) o.name = clean(p.name); if (p.pic && BY[p.pic]) o.pic = p.pic;
    try { localStorage.setItem(KEY, JSON.stringify({ name: o.name, pic: o.pic, v: 1 })); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('hsprofile', { detail: o })); } catch (e) {}
    return o;
  }
  function has() { var o = read(); return !!(o && clean(o.name)); }
  function cell(pic) { var p = BY[pic] || BY.cumhead || { i: 0 }; return { x: (p.i % COLS) * SZ, y: Math.floor(p.i / COLS) * SZ }; }

  /* ---------- drawing ---------- */
  function draw(ctx, pic, x, y, size, frame) {
    size = size || SZ; var c = cell(pic), sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    if (frame) { // the window round it, like the portraits in FF7's menu but in our colours
      ctx.fillStyle = '#12040a'; ctx.fillRect(x - 3, y - 3, size + 6, size + 6);
      ctx.fillStyle = '#c8b898'; ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
      ctx.fillStyle = '#4a1a1c'; ctx.fillRect(x - 1, y - 1, size + 2, size + 2);
    }
    if (loaded) ctx.drawImage(IMG, c.x, c.y, SZ, SZ, x, y, size, size);
    else { ctx.fillStyle = '#0e0708'; ctx.fillRect(x, y, size, size); }
    ctx.imageSmoothingEnabled = sm;
  }
  function html(pic, px) { // sized in percent, so the same span can be stretched to any size by CSS
    var p = BY[pic] || BY.cumhead || { i: 0 }, rows = Math.ceil(LIST.length / COLS), cx = p.i % COLS, cy = Math.floor(p.i / COLS);
    return '<span class="hsp-pic" style="display:inline-block;width:' + (px ? px + 'px' : '100%') + ';height:' + (px ? px + 'px' : '100%') + ';background:url(' + IMG.src + ') ' + (COLS > 1 ? cx / (COLS - 1) * 100 : 0) + '% ' + (rows > 1 ? cy / (rows - 1) * 100 : 0) + '%/' + COLS * 100 + '% ' + rows * 100 + '% no-repeat;image-rendering:pixelated;image-rendering:crisp-edges;vertical-align:top"></span>';
  }
  /* ---------- the editor ---------- */
  var CSS = '#hsProf{position:fixed;inset:0;z-index:9000;background:#070405;color:#f1e7d0;font-family:"Archivo Narrow",sans-serif;display:flex;flex-direction:column;overflow:hidden}' +
    '#hsProf *{box-sizing:border-box}#hsProf button{font:inherit;color:inherit;cursor:pointer}' +
    '#hsProf .hp-top{display:flex;align-items:center;gap:14px;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 10px;border-bottom:1px solid #4a1a1c;flex:none}' +
    '#hsProf .hp-win{display:flex;gap:14px;align-items:center;flex:1;min-width:0;padding:10px;background:linear-gradient(180deg,#1c0a0d,#0e0708);border:2px solid #c8b898;box-shadow:0 0 0 2px #12040a,inset 0 0 0 1px #4a1a1c}' +
    '#hsProf .hp-big{flex:none;border:2px solid #12040a;box-shadow:0 0 0 1px #4a1a1c}' +
    '#hsProf .hp-who{min-width:0;flex:1;display:flex;flex-direction:column;gap:6px}' +
    '#hsProf .hp-title{font-family:"Pirata One",serif;font-size:15px;letter-spacing:.06em;color:#a6968f}' +
    '#hsProf .hp-name{display:flex;align-items:center;min-height:42px;padding:0 12px;background:#070405;border:1px solid #4a1a1c;font-family:"Pirata One",serif;font-size:26px;line-height:1;color:#f1e7d0;text-align:left;width:100%;overflow:hidden;white-space:nowrap}' +
    '#hsProf .hp-name.empty{color:#6a5a58}#hsProf .hp-name.on{border-color:#ffe36a}' +
    '#hsProf .hp-char{font-size:13px;letter-spacing:.12em;color:#ff2630;font-weight:700}' +
    '#hsProf .hp-body{flex:1;overflow:auto;padding:10px 16px 16px;-webkit-overflow-scrolling:touch}' +
    '#hsProf .hp-grp{font-family:"Pirata One",serif;font-size:18px;color:#ffe36a;margin:10px 0 6px}' +
    '#hsProf .hp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:8px}' +
    '#hsProf .hp-p{padding:0;border:2px solid #4a1a1c;background:#0e0708;aspect-ratio:1;display:flex;align-items:center;justify-content:center;position:relative}' +
    '#hsProf .hp-p.sel{border-color:#ffe36a;box-shadow:0 0 0 2px #ffe36a}' +
    '#hsProf .hp-p .hsp-pic{width:100%!important;height:100%!important}' +
    '#hsProf .hp-foot{display:flex;gap:10px;padding:10px 16px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid #4a1a1c;flex:none}' +
    '#hsProf .hp-btn{flex:1;height:46px;border:0;font-weight:700;letter-spacing:.12em;font-size:15px;background:#1a0a0c;box-shadow:inset 0 0 0 1px #4a1a1c}' +
    '#hsProf .hp-btn.go{background:linear-gradient(180deg,#d8141f,#8e0c14);color:#f1e7d0}#hsProf .hp-btn:disabled{opacity:.45}' +
    '#hsProf .hp-keys{display:grid;grid-template-columns:repeat(10,1fr);gap:5px;margin-top:4px}' +
    '#hsProf .hp-k{height:42px;border:0;background:#1a0a0c;box-shadow:inset 0 0 0 1px #4a1a1c;font-family:"Press Start 2P",monospace;font-size:12px}' +
    '#hsProf .hp-k.w2{grid-column:span 2}#hsProf .hp-k.w3{grid-column:span 3}#hsProf .hp-k.ok{background:#8e0c14}' +
    '#hsProf .hp-hint{font-size:12px;color:#a6968f;margin-top:8px}' +
    '@media (min-width:720px){#hsProf .hp-grid{grid-template-columns:repeat(auto-fill,minmax(84px,1fr))}#hsProf .hp-top,#hsProf .hp-body,#hsProf .hp-foot{padding-left:max(16px,calc(50% - 420px));padding-right:max(16px,calc(50% - 420px))}}';
  var styled = false;
  function edit(done, opt) {
    opt = opt || {}; if (document.getElementById('hsProf')) return;
    if (!styled) { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); styled = true; }
    var cur = get(), name = cur.name, pic = cur.pic, typing = !name, caps = true;
    var ov = document.createElement('div'); ov.id = 'hsProf'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Your profile');
    document.body.appendChild(ov);
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
    function render() {
      var groups = []; LIST.forEach(function (p) { if (groups.indexOf(p.g) < 0) groups.push(p.g); });
      var h = '<div class="hp-top"><div class="hp-win"><span class="hp-big">' + html(pic, 76) + '</span><div class="hp-who"><div class="hp-title">' + esc(opt.title || 'YOUR PROFILE') + '</div>' +
        '<button type="button" class="hp-name' + (name ? '' : ' empty') + (typing ? ' on' : '') + '" data-act="name">' + (name ? esc(name) : 'Choose your name') + (typing ? '<span style="color:#ffe36a">_</span>' : '') + '</button>' +
        '<div class="hp-char">' + esc((BY[pic] || {}).n || '').toUpperCase() + '</div></div></div></div><div class="hp-body">';
      if (typing) {
        var rows = caps ? ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL\'', 'ZXCVBNM.-!'] : ['1234567890', 'qwertyuiop', 'asdfghjkl\'', 'zxcvbnm.-!'];
        h += '<div class="hp-keys">'; rows.forEach(function (r) { for (var i = 0; i < r.length; i++) h += '<button type="button" class="hp-k" data-key="' + esc(r[i]) + '">' + esc(r[i]) + '</button>'; });
        h += '<button type="button" class="hp-k w2" data-act="caps">' + (caps ? 'abc' : 'ABC') + '</button><button type="button" class="hp-k w3" data-key=" ">SPACE</button><button type="button" class="hp-k w2" data-act="del">DEL</button><button type="button" class="hp-k w3 ok" data-act="okname">OK</button></div>';
        h += '<div class="hp-hint">Up to 14 letters. This is the name other players and the leaderboards see.</div>';
      } else {
        groups.forEach(function (g) {
          h += '<div class="hp-grp">' + esc(g) + '</div><div class="hp-grid">';
          LIST.forEach(function (p) { if (p.g === g) h += '<button type="button" class="hp-p' + (p.id === pic ? ' sel' : '') + '" data-pic="' + p.id + '" aria-label="' + esc(p.n) + '" title="' + esc(p.n) + '">' + html(p.id, 64) + '</button>'; });
          h += '</div>';
        });
      }
      h += '</div><div class="hp-foot"><button type="button" class="hp-btn" data-back data-act="cancel">' + (typing && name ? 'BACK' : 'CANCEL') + '</button><button type="button" class="hp-btn go" data-act="save"' + (name ? '' : ' disabled') + '>SAVE</button></div>';
      var keepKey = document.activeElement && document.activeElement.getAttribute && (document.activeElement.getAttribute('data-key') || document.activeElement.getAttribute('data-pic') || document.activeElement.getAttribute('data-act'));
      ov.innerHTML = h;
      var again = keepKey && ov.querySelector('[data-key="' + keepKey.replace(/"/g, '\\"') + '"],[data-pic="' + keepKey + '"],[data-act="' + keepKey + '"]');
      if (again && again.focus) again.focus({ preventScroll: true });
    }
    function type(ch) { if (name.length < 14) { name = (name + ch).replace(/^\s+/, ''); render(); } }
    function close(saved) { window.removeEventListener('keydown', onKey, true); ov.remove(); if (done) done(saved ? get() : null); }
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
      var k = b.getAttribute('data-key'), a = b.getAttribute('data-act'), p = b.getAttribute('data-pic');
      if (k !== null) type(k);
      else if (p) { pic = p; render(); }
      else if (a === 'name') { typing = true; render(); }
      else if (a === 'caps') { caps = !caps; render(); }
      else if (a === 'del') { name = name.slice(0, -1); render(); }
      else if (a === 'okname') { name = clean(name); if (name) { typing = false; render(); } }
      else if (a === 'cancel') { if (typing && clean(name) && get().name) { typing = false; name = get().name; render(); } else close(false); }
      else if (a === 'save') { name = clean(name); if (!name) return; set({ name: name, pic: pic }); close(true); }
    });
    function onKey(e) { // a real keyboard types straight in
      if (!typing) { if (e.key === 'Escape') { e.preventDefault(); close(false); } return; }
      if (e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); name = name.slice(0, -1); render(); }
      else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('#hsProf button'))) { e.preventDefault(); name = clean(name); if (name) { typing = false; render(); } }
      else if (e.key === 'Escape') { e.preventDefault(); close(false); }
      else if (e.key.length === 1 && /[A-Za-z0-9 _.'\-!?]/.test(e.key) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); e.stopPropagation(); type(e.key); }
    }
    window.addEventListener('keydown', onKey, true);
    render();
  }
  function ready(fn) { if (loaded) fn(); else waiting.push(fn); }
  window.HSProfile = { get: get, set: set, has: has, name: function (f) { return get().name || f || ''; }, list: LIST, by: BY, draw: draw, html: html, edit: edit, ready: ready, KEY: KEY };
})();
