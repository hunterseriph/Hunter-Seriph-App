/* The SERIPH intro (update 185, his ask: like the SEGA screen at the start of the Mega Drive Sonic games). A black
   screen, Cumhead dashes across it and leaves the blood red SERIPH logo behind him, the logo lights up with a shine
   running over it and a voice calls "SEEEERIIIIPH", then the game fades in. Built by tools/intro/make.py, which puts the
   pictures and the voice in SI_DATA. Every game loads this first, in its <head>, so it is on screen before the game is.
   While it plays the game's own sound waits (its AudioContexts are held and its <audio> waits to start) and presses
   don't reach the game. Any press skips it. */
(function () {
  if (window.__seriphIntro) return; window.__seriphIntro = 1;
  if (/[?&]nointro\b/.test(location.search)) return;
/*SI_DATA*/
  var active = true, T0 = 0, done = false, VW = 480, VH = 270;

  /* ---- the game's sound waits until the intro is over ---- */
  var held = [], queued = [];
  var AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    var oldResume = AC.prototype.resume;
    AC.prototype.resume = function () { if (active && !this.__siMine) { this.__siWant = 1; return Promise.resolve(); } return oldResume.apply(this, arguments); };
    try {
      var W2 = class extends AC { constructor(a) { super(a); if (active && !window.__siMaking) { held.push(this); this.__siWant = this.state === 'running'; try { this.suspend(); } catch (e) {} } } };
      window.AudioContext = W2; if (window.webkitAudioContext) window.webkitAudioContext = W2;
    } catch (e) {}
  }
  var MP = window.HTMLMediaElement && HTMLMediaElement.prototype, oldPlay = MP && MP.play, oldPause = MP && MP.pause;
  if (MP) {
    MP.play = function () { if (active && !this.__siMine) { if (queued.indexOf(this) < 0) queued.push(this); this.__siQ = 1; return Promise.resolve(); } return oldPlay.apply(this, arguments); };
    MP.pause = function () { this.__siQ = 0; return oldPause.apply(this, arguments); };
  }

  /* ---- the screen ---- */
  var cv = document.createElement('canvas'); cv.id = 'seriphIntro';
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483647;background:#000;image-rendering:pixelated;image-rendering:crisp-edges;touch-action:none;transition:none';
  (document.body || document.documentElement).appendChild(cv);
  var g = cv.getContext('2d');
  function fit() { var w = window.innerWidth || 960, h = window.innerHeight || 540; VH = 270; VW = Math.max(300, Math.round(VH * w / h)); cv.width = VW; cv.height = VH; g.imageSmoothingEnabled = true; }
  fit(); window.addEventListener('resize', fit);
  function img(src) { var i = new Image(); i.src = src; return i; }
  var LIT = img(SI_DATA.lit), DIM = img(SI_DATA.dim), RUN = img(SI_DATA.run);
  var voice = new Audio(SI_DATA.voice); voice.__siMine = 1; voice.preload = 'auto'; var spoke = false, voiceBlocked = false;
  var shineC = document.createElement('canvas'), sg = shineC.getContext('2d');

  /* ---- the timeline (seconds) ---- */
  var RUN0 = 0.3, RUN1 = 1.15, LIGHT = 1.35, FADE = 3.25, END = 3.75;
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }
  function draw(now) {
    if (done) return; if (!T0) T0 = now; var t = (now - T0) / 1000;
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    var lw = Math.min(VW * 0.62, 290), lh = LIT.width ? lw * LIT.height / LIT.width : lw * 0.21, lx = (VW - lw) / 2, ly = VH * 0.5 - lh / 2 - 6;
    var fw = SI_DATA.fw, fh = SI_DATA.fh, sc = 1.15, cw = fw * sc, ch = fh * sc, cy = ly + lh + 8 - ch;
    // Cumhead's dash: left to right across the screen, the logo left behind him as he goes
    var k = (t - RUN0) / (RUN1 - RUN0), cx = -cw - 20 + (VW + cw * 2 + 40) * k, reveal = Math.max(0, Math.min(VW, cx + cw * 0.35));
    if (LIT.complete && DIM.complete && reveal > 0) {
      var lightK = ease((t - LIGHT) / 0.14);
      g.save(); g.beginPath(); g.rect(0, 0, reveal, VH); g.clip();
      g.drawImage(DIM, lx, ly, lw, lh);
      if (lightK > 0) {
        // it lights up: a red bloom behind it, the lit letters, a white flash that settles, and a shine across it
        var pulse = 0.75 + 0.25 * Math.sin((t - LIGHT) * 5.5);
        g.save(); g.globalAlpha = lightK * 0.55 * pulse; g.shadowColor = '#ff1a2a'; g.shadowBlur = 26; g.drawImage(LIT, lx, ly, lw, lh); g.restore();
        g.globalAlpha = lightK; g.drawImage(LIT, lx, ly, lw, lh); g.globalAlpha = 1;
        var fl = 1 - ease((t - LIGHT) / 0.35);
        if (fl > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = fl * 0.6; g.drawImage(LIT, lx, ly, lw, lh); g.restore(); }
        var sk = (t - LIGHT - 0.1) / 0.6;
        if (sk > 0 && sk < 1.2) {
          shineC.width = Math.ceil(lw); shineC.height = Math.ceil(lh); sg.clearRect(0, 0, lw, lh); sg.drawImage(LIT, 0, 0, lw, lh); sg.globalCompositeOperation = 'source-atop';
          var sx = -lw * 0.3 + sk * lw * 1.5, gr = sg.createLinearGradient(sx - 40, 0, sx + 40, lh); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,240,230,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          sg.fillStyle = gr; sg.fillRect(0, 0, lw, lh); sg.globalCompositeOperation = 'source-over'; g.drawImage(shineC, lx, ly);
        }
      }
      g.restore();
    }
    if (k > -0.2 && k < 1.2 && RUN.complete) {
      var fi = Math.floor(t * 20) % SI_DATA.n; /* the run plays at the speed Spermhog plays it at full tilt */
      // the speed blur behind him, then him
      for (var q = 3; q >= 1; q--) { g.globalAlpha = 0.16 * (4 - q); g.drawImage(RUN, fi * fw, 0, fw, fh, cx - q * 16, cy, cw, ch); }
      g.globalAlpha = 1; g.drawImage(RUN, fi * fw, 0, fw, fh, cx, cy, cw, ch);
      g.fillStyle = 'rgba(255,38,48,0.5)'; for (var s2 = 0; s2 < 3; s2++) g.fillRect(cx - 60 - s2 * 22, cy + ch * (0.35 + s2 * 0.2), 34 - s2 * 6, 1.5);
    }
    if (t >= LIGHT - (SI_DATA.lead || 0) - 0.04 && !spoke) { spoke = true; try { voice.currentTime = 0; var pr = oldPlay ? oldPlay.call(voice) : voice.play(); if (pr && pr.catch) pr.catch(function () { voiceBlocked = true; }); } catch (e) { voiceBlocked = true; } }
    if (t > FADE) { cv.style.opacity = String(1 - ease((t - FADE) / (END - FADE))); }
    if (t >= END) { finish(); return; }
    requestAnimationFrame(draw);
  }

  /* ---- a press skips it; presses never reach the game while it is up ---- */
  function block(e) { if (!active) return; e.stopImmediatePropagation(); if (e.cancelable && e.type !== 'keyup') e.preventDefault();
    if (e.type === 'keydown' || e.type === 'pointerdown' || e.type === 'touchstart' || e.type === 'mousedown') {
      if (voiceBlocked && !spoke2) { spoke2 = true; try { oldPlay.call(voice); } catch (x) {} return; } /* the browser held the voice back until a press */
      var t = (performance.now() - T0) / 1000; if (t > 0.35) skip(); } }
  var spoke2 = false;
  ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(function (ev) { window.addEventListener(ev, block, { capture: true, passive: false }); });
  var padWas = null;
  function padPoll() { if (!active) return; try { var gp = navigator.getGamepads ? navigator.getGamepads() : [], any = false; for (var i = 0; i < gp.length; i++) if (gp[i]) for (var b = 0; b < gp[i].buttons.length; b++) if (gp[i].buttons[b].pressed) any = true;
      if (padWas === false && any && (performance.now() - T0) / 1000 > 0.35) skip(); padWas = any; } catch (e) {} requestAnimationFrame(padPoll); }
  function skip() { if (done) return; var t = (performance.now() - T0) / 1000; if (t < FADE) { T0 = performance.now() - FADE * 1000; } }
  function finish() { if (done) return; done = true; active = false; try { voice.pause(); } catch (e) {} if (cv.parentNode) cv.parentNode.removeChild(cv);
    ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(function (ev) { window.removeEventListener(ev, block, { capture: true }); });
    held.forEach(function (c) { if (c.__siWant && c.state === 'suspended') { try { oldResume.call(c); } catch (e) {} } });
    queued.forEach(function (m) { if (m.__siQ) { m.__siQ = 0; try { var p = oldPlay.call(m); if (p && p.catch) p.catch(function () {}); } catch (e) {} } });
    try { window.dispatchEvent(new Event('seriphintroend')); } catch (e) {} }
  window.SeriphIntro = { skip: skip, get on() { return active; } };
  requestAnimationFrame(draw); requestAnimationFrame(padPoll);
  setTimeout(finish, 9000); /* never stuck on it */
})();
