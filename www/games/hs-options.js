/* Hunter Seriph games: the options screens (update 195, his ask: "sort the options out properly for all games to make
   them look nice and organised and modern").
   Every game's Options menu (KIT.menu with the title Options) is drawn as a modern settings screen: rows grouped under
   AUDIO / DISPLAY / CONTROLS / GAMEPLAY, ON/OFF settings as switches, numbers and volumes as sliders, other settings as
   < value > pickers, and links to other screens with an arrow. A controller or the arrow keys move up and down, left and
   right change the setting on the row, A changes it too. A tap or drag on a slider sets it.
   The games keep their own option code: a row like 'MUSIC: 75%' still calls the game's own function, which steps the
   setting round; going left steps it round to the one before. A game can also give a row exactly (item.hso = { k:
   'slider' | 'toggle' | 'choice', get, set, min, max, step, fmt, opts }).
   Every game gets a MASTER VOLUME slider (one setting for all the games), and a game with no Options menu gets one on
   its title screen (master volume and resolution). Loaded in each game's <head>, before the game. */
(function () {
  if (window.HSOpt) return;
  var LS = function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  var SS = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---- master volume: everything a game plays goes through it ---- */
  var VOL = +LS('hs-vol', 1); if (!(VOL >= 0 && VOL <= 1)) VOL = 1;
  var masters = [], medias = [];
  var oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d) {
    if (window.AudioDestinationNode && d instanceof AudioDestinationNode) {
      var ctx = this.context; if (!ctx.__hsMaster) { var g = ctx.createGain(); g.gain.value = VOL; oc.call(g, d); ctx.__hsMaster = g; masters.push(g); }
      if (this !== ctx.__hsMaster) { arguments[0] = ctx.__hsMaster; }
    }
    return oc.apply(this, arguments);
  };
  var MP = HTMLMediaElement.prototype, vd = Object.getOwnPropertyDescriptor(MP, 'volume');
  if (vd && vd.set) Object.defineProperty(MP, 'volume', { configurable: true, enumerable: true,
    get: function () { return this.__hsBase !== undefined ? this.__hsBase : vd.get.call(this); },
    set: function (v) { this.__hsBase = v; if (medias.indexOf(this) < 0) medias.push(this); vd.set.call(this, Math.max(0, Math.min(1, v * VOL))); } });
  var op = MP.play; MP.play = function () { if (this.__hsBase === undefined && vd && vd.set) { this.__hsBase = vd.get.call(this); medias.push(this); vd.set.call(this, this.__hsBase * VOL); } return op.apply(this, arguments); };
  function setVol(v) { VOL = Math.max(0, Math.min(1, Math.round(v * 20) / 20)); SS('hs-vol', VOL);
    masters.forEach(function (g) { try { g.gain.setTargetAtTime(VOL, g.context.currentTime, 0.02); } catch (e) { g.gain.value = VOL; } });
    medias = medias.filter(function (m) { return m.isConnected || !m.paused; }); medias.forEach(function (m) { try { vd.set.call(m, Math.max(0, Math.min(1, (m.__hsBase === undefined ? 1 : m.__hsBase) * VOL))); } catch (e) {} }); }

  /* ---- reading a row out of an item's label ---- */
  var SECS = [['AUDIO', /MUSIC|SOUND|SFX|VOICE|VOLUME|RADIO|AUDIO|SPEECH/], ['DISPLAY', /RESOLUTION|SCREEN|SHAKE|VIEW|QUALITY|GRAPHIC|FPS|NUMBERS|BRIGHT|CAMERA|FOV|SHADOW|DRAW DIST|HUD|SUBTITLE|FULL/],
    ['CONTROLS', /STICK|CONTROL|INVERT|AIM|SENS|TURN SPEED|LOOK SPEED|VIBRAT|RUMBLE|BUTTON|TOUCH|AUTO ACCEL|PAD|TIMING|NOTE SPEED/], ['GAMEPLAY', /./]];
  function txt(h) { var d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').trim(); }
  function parse(it) {
    if (!it) return null; var L = txt(it.label || ''), i = L.indexOf(': '), r = { it: it, label: L, sub: it.sub || '' };
    if (it.hso) { r.k = it.hso.k; r.name = it.hso.n || (i > 0 ? L.slice(0, i) : L); r.spec = it.hso; }
    else if (it.back) { r.k = 'back'; r.name = L; }
    else if (i < 0) { r.k = 'link'; r.name = L; }
    else {
      r.name = L.slice(0, i).trim(); r.val = L.slice(i + 2).trim(); var V = r.val.toUpperCase();
      var num = V.match(/^([+-]?\d+(?:\.\d+)?)\s*(%|X|MS)?(\s*\(OFF\))?$/);
      if (V === 'ON' || V === 'OFF') { r.k = 'toggle'; r.on = V === 'ON'; }
      else if (num) { r.k = 'slider'; r.num = +num[1]; r.pct = num[2] === '%'; }
      else r.k = 'choice';
    }
    r.sec = (it.hso && it.hso.sec) || it.sec || (r.k === 'link' || r.k === 'back' ? null : SECS.filter(function (s) { return s[1].test(r.name.toUpperCase()); })[0][0]);
    r.key = 'hso:' + r.name; return r;
  }

  /* ---- the screen ---- */
  var orig = null, CUR = null, css = false, busy = 0, lastShown = null;
  function style() { if (css) return; css = true; var s = document.createElement('style'); s.textContent =
    '#menu .mbox.hso,.mbox.hso{width:min(580px,94vw)!important;max-width:94vw!important;min-width:min(420px,94vw)!important}.hso{--hso-acc:#ff2630}' +
    '.mbox.hso h1{letter-spacing:.06em}' +
    '.mbox.hso .mlist{display:flex!important;flex-direction:column;gap:7px;width:100%}' +
    '.hso-h{font:800 11px/1 var(--body,system-ui,sans-serif);letter-spacing:.26em;color:var(--hso-acc);margin:12px 4px 1px;display:flex;align-items:center;gap:10px;text-transform:uppercase}' +
    '.hso-h:first-child{margin-top:2px}.hso-h::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(255,38,48,.6),rgba(255,38,48,0))}' +
    '.hso .hso-row{appearance:none;border:0;cursor:pointer;width:100%;display:flex!important;flex-direction:row!important;flex-wrap:wrap;align-items:center!important;justify-content:space-between!important;gap:8px 14px;min-height:52px;padding:9px 12px 9px 16px!important;border-radius:12px;clip-path:none!important;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)!important;transform:none!important;font:700 14px/1.2 var(--body,system-ui,sans-serif)!important;letter-spacing:.07em!important;text-transform:uppercase;text-shadow:none!important;color:#f1e7d0;text-align:left;transition:background .12s,box-shadow .12s}' +
    '.hso .hso-row::before{display:none!important}' +
    '.hso .hso-row:hover,.hso .hso-row.hs-focus,.hso .hso-row.kbf,.hso .hso-row:focus-visible{background:linear-gradient(180deg,rgba(255,38,48,.16),rgba(255,38,48,.07))!important;box-shadow:inset 0 0 0 2px var(--hso-acc),0 6px 22px -10px rgba(255,38,48,.8)!important;outline:none!important}' +
    '.hso .hso-row:disabled{opacity:.45}' +
    '.hso-name{display:flex!important;flex-direction:column;gap:3px;min-width:0;flex:1 1 150px;color:#f1e7d0!important}' +
    '.hso-name small{display:block!important;font:500 12px/1.25 var(--body,system-ui,sans-serif)!important;letter-spacing:0!important;text-transform:none;color:#a6968f!important}' +
    '.hso-ctl{display:flex!important;align-items:center;gap:10px;flex:0 0 auto;margin-left:auto}' +
    '.hso-tg{position:relative!important;display:block!important;flex:none;width:48px;height:28px;border-radius:14px;background:rgba(255,255,255,.16);box-shadow:inset 0 1px 3px rgba(0,0,0,.5);transition:background .15s}' +
    '.hso-tg i{position:absolute!important;display:block!important;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#d8cfc2;box-shadow:0 1px 3px rgba(0,0,0,.6);transition:left .15s,background .15s}' +
    '.hso-tg.on{background:var(--hso-acc)}.hso-tg.on i{left:23px;background:#fff}' +
    '.hso-st{min-width:30px;font-size:11px;letter-spacing:.12em;color:#a6968f!important;text-align:right}' +
    '.hso-tr{position:relative!important;display:block!important;width:min(190px,38vw);height:26px;cursor:pointer;touch-action:none}' +
    '.hso-tr::before{content:"";position:absolute;left:0;right:0;top:11px;height:5px;border-radius:3px;background:rgba(255,255,255,.16);box-shadow:inset 0 1px 2px rgba(0,0,0,.5)}' +
    '.hso-fill{position:absolute!important;display:block!important;z-index:0!important;left:0;top:11px;height:5px;border-radius:3px;background:linear-gradient(90deg,#7a0a10,var(--hso-acc))}' +
    '.hso-knob{position:absolute!important;display:block!important;z-index:1!important;top:4px;width:19px;height:19px;margin-left:-9px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,38,48,.55),0 2px 5px rgba(0,0,0,.6)}' +
    '.hso-v{min-width:50px;text-align:right;font-variant-numeric:tabular-nums;color:#fff!important;letter-spacing:.03em}' +
    '.hso-ch{display:flex;align-items:center;gap:6px}' +
    '.hso-ar{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:rgba(255,255,255,.08);color:#f1e7d0!important;font-size:17px;line-height:1;cursor:pointer;user-select:none}' +
    '.hso-ar:hover{background:var(--hso-acc);color:#fff!important}' +
    '.hso-ch b{min-width:min(150px,32vw);text-align:center;color:#fff!important;font-weight:800;letter-spacing:.05em}' +
    '.hso-go{font-size:24px;line-height:1;color:var(--hso-acc)!important;padding-right:2px}' +
    '.mbox.hso .mbtn.hso-back{align-self:center;margin-top:12px;min-width:170px;min-height:44px;border-radius:999px;clip-path:none!important;justify-content:center!important;text-align:center;transform:none!important;font:800 14px/1 var(--body,system-ui,sans-serif)!important;letter-spacing:.2em!important;background:rgba(255,255,255,.06)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)!important}' +
    '.mbox.hso .mbtn.hso-back::before{display:none!important}' +
    '.mbox.hso .mbtn.hso-back:hover,.mbox.hso .mbtn.hso-back.hs-focus{background:var(--hso-acc)!important;box-shadow:none!important}' +
    '.mbox.hso .mbtn.hso-back span{color:#fff!important}' +
    '.mbox.hso.hso-still,.mbox.hso.hso-still *,#menu.hso-still{animation:none!important}' +
    '@media (max-width:520px){.hso-tr{width:min(150px,42vw)}.hso-ch b{min-width:96px}}';
    document.head.appendChild(s); }

  function menuEl() { return document.getElementById('menu'); }
  function isOpts(o) { return o && !o.hsoRaw && /^(options|settings)$/i.test(String(o.title || '').trim()); }
  function masterItem() { return { label: 'MASTER VOLUME', hso: { k: 'slider', n: 'MASTER VOLUME', sec: 'AUDIO', get: function () { return VOL; }, set: setVol, min: 0, max: 1, step: 0.05, fmt: function (v) { return Math.round(v * 100) + '%'; } } }; }

  function render(o) {
    style(); var items = (o.items || []).filter(Boolean);
    if (!items.some(function (it) { return /MASTER VOLUME/i.test(txt(it.label || '')); })) items = [masterItem()].concat(items);
    var rows = items.map(parse), order = ['AUDIO', 'DISPLAY', 'CONTROLS', 'GAMEPLAY'];
    var setRows = rows.filter(function (r) { return r.sec; }).sort(function (a, b) { return order.indexOf(a.sec) - order.indexOf(b.sec); });
    var links = rows.filter(function (r) { return r.k === 'link'; }), backs = rows.filter(function (r) { return r.k === 'back'; });
    var all = setRows.concat(links, backs);
    CUR = { o: o, rows: all };
    var out = {}; for (var k in o) out[k] = o[k]; out.hsoRaw = 1;
    out.items = all.map(function (r) { return { label: r.label, sub: r.sub, back: r.it.back, def: r.it.def, dis: r.it.dis, cls: r.k === 'back' ? 'hso-back' : 'hso-row', fn: function () { act(r.name, 0); } }; });
    var keepKey = focusedKey(), same = !!(lastShown && lastShown === String(o.title) && menuEl() && !menuEl().hidden && menuEl().querySelector('.mbox.hso'));
    busy++; try { orig.call(KIT, out); } finally { busy--; }
    var M = menuEl(); if (!M) return; var box = M.querySelector('.mbox'); if (box) { box.classList.add('hso'); if (same) { box.classList.add('hso-still'); M.classList.add('hso-still'); } } lastShown = String(o.title);
    var list = M.querySelector('.mlist'), bs = list ? [].slice.call(list.children).filter(function (b) { return b.tagName === 'BUTTON'; }) : [], sec = null;
    bs.forEach(function (b, i) { var r = all[i]; if (!r) return; b.setAttribute('data-key', r.key);
      if (r.k === 'back') return;
      if (r.sec && r.sec !== sec) { sec = r.sec; var h = document.createElement('div'); h.className = 'hso-h'; h.textContent = sec; list.insertBefore(h, b); }
      if (r.k === 'link' && !sec) {} // links follow the sections without a heading
      b.innerHTML = '<span class="hso-name">' + esc(r.name) + (r.sub ? '<small>' + esc(txt(r.sub)) + '</small>' : '') + '</span><span class="hso-ctl">' + ctl(r) + '</span>';
      if (r.k !== 'link') b.setAttribute('data-pad-lr', '');
      b.addEventListener('hs-lr', function (e) { adjust(r.name, e.detail); });
      wire(b, r); });
    if (keepKey) { var nb = M.querySelector('[data-key="' + keepKey.replace(/"/g, '') + '"]'); if (nb) { if (focusMode === 'dom') try { nb.focus({ preventScroll: true }); } catch (e) {} } }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function specVal(r) { return r.spec.get(); }
  function frac(r) { if (r.spec) { var v = specVal(r), a = r.spec.min || 0, b = r.spec.max === undefined ? 1 : r.spec.max; return (v - a) / ((b - a) || 1); }
    if (r.pct) return Math.max(0, Math.min(1, r.num / 100)); var lo = r.lo === undefined ? null : r.lo; return lo === null ? 0.5 : (r.num - r.lo) / ((r.hi - r.lo) || 1); }
  function ctl(r) {
    if (r.k === 'toggle') { var on = r.spec ? !!specVal(r) : r.on; return '<span class="hso-st">' + (on ? 'ON' : 'OFF') + '</span><span class="hso-tg' + (on ? ' on' : '') + '"><i></i></span>'; }
    if (r.k === 'slider' && !r.spec && !r.pct) return '<span class="hso-ch"><span class="hso-ar" data-d="-1">&#8249;</span><b>' + esc(r.val) + '</b><span class="hso-ar" data-d="1">&#8250;</span></span>'; // a number with no known range: a picker (left lower, right higher)
    if (r.k === 'slider') { var f = Math.max(0, Math.min(1, frac(r))), v = r.spec ? (r.spec.fmt ? r.spec.fmt(specVal(r)) : String(specVal(r))) : r.val;
      return '<span class="hso-tr"><span class="hso-fill" style="width:' + (f * 100).toFixed(1) + '%"></span><span class="hso-knob" style="left:' + (f * 100).toFixed(1) + '%"></span></span><span class="hso-v">' + esc(v) + '</span>'; }
    if (r.k === 'choice') { var cv = r.spec ? (r.spec.fmt ? r.spec.fmt(specVal(r)) : String(specVal(r))) : r.val; return '<span class="hso-ch"><span class="hso-ar" data-d="-1">&#8249;</span><b>' + esc(cv) + '</b><span class="hso-ar" data-d="1">&#8250;</span></span>'; }
    if (r.k === 'link') return '<span class="hso-go">&#8250;</span>';
    return '';
  }
  function wire(b, r) {
    [].forEach.call(b.querySelectorAll('.hso-ar'), function (a) { a.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); adjust(r.name, +a.getAttribute('data-d')); }); });
    var tr = b.querySelector('.hso-tr'); if (!tr) return;
    tr.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); });
    tr.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); var name = r.name;
      var at = function (ev) { var t = (CUR && document.querySelector('.mbox.hso [data-key="' + ('hso:' + name).replace(/"/g, '') + '"] .hso-tr')) || tr, rc = t.getBoundingClientRect(); return Math.max(0, Math.min(1, (ev.clientX - rc.left) / (rc.width || 1))); };
      var spec = rowOf(name) && rowOf(name).spec;
      if (spec) { setFrac(name, at(e)); var mv = function (ev) { setFrac(name, at(ev)); }, up = function () { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up); }
      else { var up2 = function (ev) { removeEventListener('pointerup', up2); goFrac(name, at(ev)); }; addEventListener('pointerup', up2); } });
  }
  function rowOf(name) { return CUR && CUR.rows.filter(function (r) { return r.name === name; })[0]; }
  function rerender() { if (CUR) render(CUR.o); }
  function tick() { try { if (KIT.sfx && KIT.sfx.play) KIT.sfx.play('blip'); } catch (e) {} }
  function setFrac(name, f) { var r = rowOf(name); if (!r || !r.spec) return; var a = r.spec.min || 0, b = r.spec.max === undefined ? 1 : r.spec.max, st = r.spec.step || (b - a) / 20, v = Math.round((a + f * (b - a)) / st) * st;
    v = Math.max(a, Math.min(b, +v.toFixed(4))); if (v !== r.spec.get()) { r.spec.set(v); rerender(); } }

  /* the game's own rows: step its function round, reading the new label each time */
  function call(name) { var r = rowOf(name); if (!r || r.it.dis || !r.it.fn) return null; var t0 = CUR.o.title; r.it.fn(); var n = rowOf(name); if (!CUR || CUR.o.title !== t0 || !n) return null; return n; }
  function cycle(name) { var r = rowOf(name), start = r && r.val, seq = []; if (!r) return null; for (var i = 0; i < 24; i++) { var n = call(name); if (!n) return null; if (n.val === start) break; seq.push(n); } return seq; }
  function stepTo(name, idx) { for (var i = 0; i <= idx; i++) if (!call(name)) return; }
  function numOf(r) { return r.k === 'slider' ? r.num : null; }
  function adjust(name, dir) {
    var r = rowOf(name); if (!r || r.it.dis) return;
    if (r.spec) {
      if (r.k === 'toggle') { r.spec.set(!r.spec.get()); }
      else if (r.k === 'slider') { var a = r.spec.min || 0, b = r.spec.max === undefined ? 1 : r.spec.max, st = r.spec.step || (b - a) / 20; r.spec.set(Math.max(a, Math.min(b, +(r.spec.get() + dir * st).toFixed(4)))); }
      else if (r.k === 'choice') { var O = r.spec.opts, i = O.indexOf(r.spec.get()); r.spec.set(O[(i + (dir < 0 ? O.length - 1 : 1)) % O.length]); }
      tick(); rerender(); return;
    }
    if (r.k === 'toggle') { tick(); call(name); return; }
    if (r.k === 'choice') { if (dir > 0) { tick(); call(name); return; } var seq = cycle(name); if (seq && seq.length) stepTo(name, seq.length - 1); tick(); return; }
    if (r.k === 'slider') { var v = r.num, sq = cycle(name); if (!sq || !sq.length) return; var best = -1, bd = 1e9;
      sq.forEach(function (n, i) { var d = (numOf(n) - v) * dir; if (d > 0 && d < bd) { bd = d; best = i; } }); if (best >= 0) { stepTo(name, best); tick(); } return; }
  }
  function goFrac(name, f) { var r = rowOf(name); if (!r || r.k !== 'slider') return; var sq = cycle(name); if (!sq) return; var all = sq.concat([rowOf(name)]);
    var nums = all.map(numOf), lo = Math.min.apply(null, nums), hi = Math.max.apply(null, nums), want = r.pct ? f * 100 : lo + f * (hi - lo), best = sq.length - 1, bd = 1e9;
    all.forEach(function (n, i) { var d = Math.abs(numOf(n) - want); if (d < bd) { bd = d; best = i; } }); if (best < sq.length) stepTo(name, best); tick(); }
  function act(name, d) { var r = rowOf(name); if (!r) return; if (r.k === 'back' || r.k === 'link') { r.it.fn && r.it.fn(); return; }
    if (r.spec) { if (r.k === 'toggle') { r.spec.set(!r.spec.get()); rerender(); } else adjust(name, 1); return; }
    if (r.k === 'slider') { r.it.fn(); return; } // A steps the game's setting round as it always did
    r.it.fn(); }

  /* keyboard: left / right change the row that has the focus */
  var focusMode = 'pad';
  function focusedKey() { var M = menuEl(); if (!M) return null; var f = M.querySelector('.hs-focus') || (M.contains(document.activeElement) ? document.activeElement : null); return f && f.getAttribute('data-key'); }
  addEventListener('keydown', function (e) { if (!CUR) return; var M = menuEl(); if (!M || M.hidden || !M.querySelector('.mbox.hso')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; var f = M.querySelector('.hs-focus') || (M.contains(document.activeElement) ? document.activeElement : null); if (!f || !f.hasAttribute('data-pad-lr')) return;
    e.preventDefault(); e.stopImmediatePropagation(); focusMode = f === document.activeElement ? 'dom' : 'pad'; var k = f.getAttribute('data-key'); adjust(k.slice(4), e.key === 'ArrowLeft' ? -1 : 1); }, true);

  /* a title screen with no Options gets one: master volume and the resolution */
  function basic(back) { var it = [masterItem()]; try { if (KIT.resItem) it.push(KIT.resItem(function () { basic(back); })); } catch (e) {} try { if (window.R3 && R3.ok && R3.resItem) it.push(R3.resItem(function () { basic(back); })); } catch (e) {}
    it.push({ label: 'BACK', back: true, fn: back }); KIT.menu({ title: 'Options', items: it }); }

  function hook() {
    if (!window.KIT || !KIT.menu || KIT.__hso) return; orig = KIT.menu; KIT.__hso = 1;
    KIT.menu = function (o) {
      if (busy) return orig.apply(this, arguments);
      if (isOpts(o)) { render(o); return; }
      CUR = null; lastShown = null;
      if (o && o.logo && o.items && !o.items.some(function (it) { return it && /OPTIONS|SETTINGS/i.test(txt(it.label || '')); })) {
        var t = {}; for (var k in o) t[k] = o[k]; var title = o; t.items = o.items.concat([{ label: 'OPTIONS', fn: function () { basic(function () { KIT.menu(title); }); } }]); return orig.call(this, t);
      }
      return orig.apply(this, arguments);
    };
  }
  window.HSOpt = { setVol: setVol, vol: function () { return VOL; }, hook: hook, style: style, ctl: function (r) { return ctl(r); } };
  /* hook the kit the moment the game makes it (its title screen is drawn straight after) */
  if (window.KIT) hook();
  else try { Object.defineProperty(window, 'KIT', { configurable: true, enumerable: true, get: function () { return undefined; },
    set: function (v) { Object.defineProperty(window, 'KIT', { value: v, writable: true, configurable: true, enumerable: true }); try { hook(); } catch (e) {} } }); } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () { try { hook(); } catch (e) {} });
})();
