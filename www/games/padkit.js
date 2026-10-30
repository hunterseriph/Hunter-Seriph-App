/* =====================================================================================================
   PADKIT: controller support and the on-screen controls toggle, shared by every game in the app.
   A game calls HSPad.setup({...}) once. Options:
     menu()      -> the element holding the menu that is open right now (or null while playing)
     back(el)    -> what B does in that menu (default: clicks the first [data-back] button in it)
     keys        -> { l, r, u, d, a, b, x, y, start, lb, rb }: keyboard keys to press while playing,
                    for games whose own code only reads the keyboard
     onStart()   -> Start while playing (usually pause)
     onSelect()  -> Select/View, used to leave an arcade cabinet
     idle()      -> true when padkit should do nothing at all (e.g. a cabinet game has the controller)
     onFocus(b)  -> told whenever a menu button gets controller focus
     touch       -> CSS selector(s) of the on-screen controls to hide when they are switched off
     toggleAfter -> element (or selector) the toggle button goes after; otherwise it floats top-right
     toggleClass -> class names to copy onto the toggle so it matches the game's own HUD buttons
   Buttons: A confirm, B back, Start pause, Select leave cabinet. Stick or d-pad moves in menus.
   ===================================================================================================== */
(function () {
  'use strict';
  var cfg = {}, prev = {}, held = {}, rep = {}, focus = null, scope = null, last = 0, started = false;
  var TOUCH_KEY = 'hs-touch';
  function $(s) { return typeof s === 'string' ? document.querySelector(s) : s; }
  function visible(b) { return b && !b.hidden && !b.disabled && b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden'; }
  function buttons(sc) { return [].slice.call(sc.querySelectorAll('button, [data-pad]')).filter(function (b) { return visible(b) && !b.closest('[data-pad-skip]'); }); }
  function centre(b) { var r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r }; }

  /* ---------- the toggle for on-screen controls (one setting shared by every game) ---------- */
  function touchPref() { try { return localStorage.getItem(TOUCH_KEY); } catch (e) { return null; } }
  function touchOn() { var p = touchPref(); if (p === 'on') return true; if (p === 'off') return false; return !padSeen; } // shown by default (they can be clicked with a mouse too); hidden once a controller is used
  var padSeen = false, tgl = null;
  function applyTouch() {
    var on = touchOn();
    document.documentElement.classList.toggle('hs-notouch', !on);
    if (tgl) { tgl.setAttribute('aria-pressed', on ? 'true' : 'false'); tgl.title = on ? 'Hide on-screen controls' : 'Show on-screen controls'; tgl.classList.toggle('off', !on); }
  }
  function setTouch(on) { try { localStorage.setItem(TOUCH_KEY, on ? 'on' : 'off'); } catch (e) {} applyTouch(); }
  function makeToggle() {
    tgl = document.createElement('button'); tgl.type = 'button'; tgl.id = 'hsTouchTgl'; tgl.setAttribute('aria-label', 'On-screen controls'); tgl.setAttribute('data-pad-skip', '');
    tgl.className = cfg.toggleClass || '';
    tgl.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="7" width="19" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10.5v4M5 12.5h4" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="11" r="1.4" fill="currentColor"/><circle cx="18.2" cy="13.8" r="1.4" fill="currentColor"/></svg>';
    tgl.addEventListener('click', function (e) { e.stopPropagation(); setTouch(!touchOn()); });
    tgl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    var after = cfg.toggleAfter && $(cfg.toggleAfter);
    if (after && after.parentNode) after.parentNode.insertBefore(tgl, after.nextSibling); else { tgl.classList.add('hs-float'); document.body.appendChild(tgl); }
  }
  function css() {
    var s = document.createElement('style'), hide = (cfg.touch || '').split(',').map(function (q) { return q.trim() ? '.hs-notouch ' + q.trim() : ''; }).filter(Boolean).join(',');
    s.textContent = (hide ? hide + '{display:none!important}' : '') +
      '.hs-focus{outline:2px solid #ffe36a!important;outline-offset:2px;box-shadow:0 0 0 4px rgba(255,227,106,.25)!important}' +
      '#hsTouchTgl svg{width:60%;height:60%;display:block;margin:auto}#hsTouchTgl.off{opacity:.55}' +
      '#hsTouchTgl.hs-float{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));right:8px;z-index:60;width:38px;height:38px;border:0;padding:0;background:rgba(14,7,8,.75);box-shadow:inset 0 0 0 2px rgba(255,38,48,.6);color:#f1e7d0;cursor:pointer}';
    document.head.appendChild(s);
  }

  /* ---------- menus ---------- */
  function setFocus(b) {
    if (focus && focus !== b) focus.classList.remove('hs-focus');
    focus = b; if (!b) return; lastC = centre(b);
    b.classList.add('hs-focus'); if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (cfg.onFocus) cfg.onFocus(b);
  }
  /* a menu that redraws itself replaces its buttons: keep the focus on the new copy of the same button, or the one nearest where it was */
  var lastC = null;
  function same(old, bs) {
    var ks = ['data-key', 'data-pic', 'data-act', 'id'];
    for (var i = 0; i < ks.length; i++) { var v = old.getAttribute && old.getAttribute(ks[i]); if (v !== null && v !== undefined) for (var j = 0; j < bs.length; j++) if (bs[j].getAttribute(ks[i]) === v) return bs[j]; }
    if (!lastC) return null; var best = null, bd = 1e9; bs.forEach(function (b) { var c = centre(b), d = Math.hypot(c.x - lastC.x, c.y - lastC.y); if (d < bd) { bd = d; best = b; } }); return bd < 80 ? best : null;
  }
  function move(dir) {
    var bs = buttons(scope); if (!bs.length) return;
    if (!focus || bs.indexOf(focus) < 0) { setFocus(bs[0]); return; }
    var c = centre(focus), best = null, bd = 1e9;
    bs.forEach(function (b) {
      if (b === focus) return; var o = centre(b), dx = o.x - c.x, dy = o.y - c.y;
      var along = dir === 'r' ? dx : dir === 'l' ? -dx : dir === 'd' ? dy : -dy, across = dir === 'l' || dir === 'r' ? Math.abs(dy) : Math.abs(dx);
      if (along <= 4) return; var d = along + across * 2.2; if (d < bd) { bd = d; best = b; }
    });
    if (!best && (dir === 'd' || dir === 'u')) { var i = bs.indexOf(focus); best = bs[(i + (dir === 'd' ? 1 : bs.length - 1)) % bs.length]; } // wrap round lists
    if (best) { setFocus(best); if (cfg.tick) cfg.tick(); }
  }
  function back() {
    if (cfg.back && cfg.back(scope) !== false) return;
    var b = scope.querySelector('[data-back]'); if (b && visible(b)) b.click();
  }
  function keyEvt(type, key) {
    var code = key === ' ' ? 'Space' : key.length === 1 ? 'Key' + key.toUpperCase() : key;
    window.dispatchEvent(new KeyboardEvent(type, { key: key, code: code, bubbles: true, cancelable: true }));
  }

  /* ---------- reading the controller ---------- */
  function read() {
    var gps = navigator.getGamepads ? navigator.getGamepads() : [], g = null;
    for (var i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { g = gps[i]; break; }
    if (!g) return null;
    var b = function (n) { return !!(g.buttons[n] && g.buttons[n].pressed); }, ax = g.axes || [];
    return { l: b(14) || ax[0] < -0.5, r: b(15) || ax[0] > 0.5, u: b(12) || ax[1] < -0.5, d: b(13) || ax[1] > 0.5,
      a: b(0), b: b(1), x: b(2), y: b(3), lb: b(4), rb: b(5), select: b(8), start: b(9), sx: ax[0] || 0, sy: ax[1] || 0 };
  }
  var S = null;
  function frame(t) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (t - last) / 1000 || 0); last = t;
    var s = read(); S = s;
    if (!s) { releaseAll(); prev = {}; return; }
    if (!padSeen) { padSeen = true; applyTouch(); }
    var pressed = function (k) { return s[k] && !prev[k]; };
    if (cfg.idle && cfg.idle()) { if (pressed('select') && cfg.onSelect) cfg.onSelect(); releaseAll(); prev = s; return; }
    var sc = document.getElementById('hsProf') || (cfg.menu ? cfg.menu() : null); // the profile editor (profile.js) sits over any game's menu
    if (sc) {
      releaseAll();
      if (sc !== scope) { scope = sc; setFocus(null); var bs = buttons(sc), def = sc.querySelector('[data-pad-default]'); setFocus(def && visible(def) ? def : bs[0] || null); prev = s; return; } // a button that opened this menu must not also press inside it (B would close it straight away)
      else if (focus && !visible(focus)) { var bs2 = buttons(sc); setFocus(same(focus, bs2) || bs2[0] || null); }
      ['u', 'd', 'l', 'r'].forEach(function (k) {
        if (pressed(k)) { move(k); rep[k] = 0.38; }
        else if (s[k]) { rep[k] -= dt; if (rep[k] <= 0) { move(k); rep[k] = 0.12; } }
      });
      if (pressed('a') && focus) focus.click();
      if (pressed('b')) back();
      if (pressed('start') && focus) focus.click();
    } else {
      if (scope) { scope = null; setFocus(null); }
      if (pressed('start') && cfg.onStart) cfg.onStart();
      if (pressed('select') && cfg.onSelect) cfg.onSelect();
      var K = cfg.keys;
      if (K) for (var k in K) { var on = !!s[k]; if (on !== !!held[k]) { held[k] = on; keyEvt(on ? 'keydown' : 'keyup', K[k]); } }
    }
    prev = s;
  }
  function releaseAll() { var K = cfg.keys; if (!K) return; for (var k in held) if (held[k]) { held[k] = false; keyEvt('keyup', K[k]); } }

  window.HSPad = {
    setup: function (o) {
      cfg = o || {}; css(); if (cfg.touch !== undefined || cfg.toggle) makeToggle(); applyTouch();
      window.addEventListener('gamepadconnected', function () { padSeen = true; applyTouch(); });
      if (!started) { started = true; requestAnimationFrame(frame); }
    },
    /* analogue stick for games that want it, with a dead zone */
    stick: function () { if (!S) return { x: 0, y: 0, on: false }; var x = S.sx, y = S.sy, m = Math.hypot(x, y); if (m < 0.22) { x = S.r ? 1 : S.l ? -1 : 0; y = S.d ? 1 : S.u ? -1 : 0; m = Math.hypot(x, y); if (!m) return { x: 0, y: 0, on: false }; } if (m > 1) { x /= m; y /= m; } return { x: x, y: y, on: true }; },
    touchOn: touchOn, setTouch: setTouch, connected: function () { return !!S; }
  };
})();
