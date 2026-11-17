/* ---------- update 157 (his ask: the menus and UI need a new sleeker look): Cum City Nights' own menu style on top of the
   kit's: flat dark glass panels with a thin red line, square corners, a short title with a red bar under it, buttons as
   rows with a red fill that slides in, tidy type. The phone (7f-phone.js) is a phone on screen: rounded body, notch,
   app tiles. ---------- */
(function () { var st = document.createElement('style'); st.textContent = [
  '#menu{background:linear-gradient(90deg,rgba(5,3,4,0.86),rgba(5,3,4,0.55));backdrop-filter:blur(5px)}',
  '#menu.clear{background:linear-gradient(90deg,rgba(5,3,4,0.82),rgba(5,3,4,0.35))}',
  '#menu .mbox{clip-path:none;border-radius:4px;background:rgba(12,7,8,0.9);box-shadow:0 0 0 1px rgba(196,18,28,0.65),0 18px 50px rgba(0,0,0,0.6);padding:20px 22px 18px;gap:8px}',
  '#menu .mbox::before{display:none}',
  '#menu .mbox h1{text-align:left;font-size:clamp(26px,5vw,36px);color:#f1e7d0;text-shadow:none;padding-bottom:8px;letter-spacing:.02em}',
  '#menu .mbox h1::after{left:0;right:auto;width:64px;height:3px;bottom:0;background:#c4121c}',
  '#menu .msub{text-align:left;font-family:var(--body);font-size:14px;color:#a6968f;letter-spacing:.02em}',
  '#menu .mbtn{background:rgba(255,255,255,0.03);box-shadow:none;border-bottom:1px solid rgba(255,255,255,0.06);font-family:var(--body);font-size:15px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:11px 14px 11px 16px;transform:none!important;text-shadow:none;overflow:hidden}',
  '#menu .mbtn::before{width:0;background:#c4121c;transition:width .14s ease-out;z-index:0}',
  '#menu .mbtn span,#menu .mbtn small{position:relative;z-index:1}',
  '#menu .mbtn:hover,#menu .mbtn:focus-visible,#menu .mbtn.hs-focus{background:rgba(255,255,255,0.03);box-shadow:none}',
  '#menu .mbtn:hover::before,#menu .mbtn:focus-visible::before,#menu .mbtn.hs-focus::before{width:100%;background:linear-gradient(90deg,#c4121c,#8a0c14)}',
  '#menu .mbtn.hot{background:#c4121c;box-shadow:none}#menu .mbtn.hot::before{background:#ff2630}',
  '#menu .mbtn small{font-family:var(--body);text-transform:none;letter-spacing:0;font-weight:400}',
  '#menu .mclose{border-radius:3px}',
  '#menu .mbox.title{background:none;box-shadow:none}#menu .mbox.title .mbtn{font-family:var(--display);text-transform:none;letter-spacing:.01em;font-size:24px;font-weight:400;border-bottom:0}',
  // the phone
  '#menu.phone{background:rgba(5,3,4,0.45);backdrop-filter:blur(3px)}',
  '#menu.phone .mbox{width:min(300px,92vw);min-height:min(540px,86vh);border-radius:34px;padding:42px 18px 26px;background:linear-gradient(170deg,#1a0d10,#070405 60%);box-shadow:0 0 0 8px #0b0b0d,0 0 0 9px #3a3a40,0 30px 60px rgba(0,0,0,0.7)}',
  '#menu.phone .mbox::after{content:"";position:absolute;top:14px;left:50%;width:84px;height:16px;margin-left:-42px;border-radius:10px;background:#0b0b0d}',
  '#menu.phone .mbox h1{font-size:24px;text-align:center}#menu.phone .mbox h1::after{left:50%;margin-left:-32px}#menu.phone .msub{text-align:center;font-size:13px}',
  '#menu.phone .mlist.grid{grid-template-columns:repeat(2,1fr);gap:14px;margin-top:10px}',
  '#menu.phone .mbtn.app{flex-direction:column;align-items:center;justify-content:flex-end;min-height:100px;border-radius:18px;border:0;padding:10px 6px;font-size:12px;letter-spacing:.06em;text-align:center}',
  '#menu.phone .mbtn.app::after{content:"";position:absolute;left:50%;top:14px;width:46px;height:46px;margin-left:-23px;border-radius:13px;background:#333}',
  '#menu.phone .mbtn.cab::after{background:linear-gradient(160deg,#ffe36a,#c89a10);box-shadow:inset 0 -12px 0 #12040a}',
  '#menu.phone .mbtn.ins::after{background:linear-gradient(160deg,#4adfff,#1a5a8a);border-radius:23px 23px 13px 13px}',
  '#menu.phone .mbtn.stim::after{background:linear-gradient(90deg,transparent 38%,#fff 38%,#fff 62%,transparent 62%),linear-gradient(0deg,transparent 38%,#fff 38%,#fff 62%,transparent 62%),linear-gradient(160deg,#ff2630,#8a0c14)}',
  '#menu.phone .mbtn.map::after{background:linear-gradient(160deg,#7aff6a,#1a6a2a)}',
  '#menu.phone .mbtn.off{grid-column:span 2;min-height:46px;justify-content:center;background:#c4121c}#menu.phone .mbtn.off::after{display:none}',
  '#menu.phone .mbtn:not(.app){border-radius:12px;margin-top:2px}',
  '#phoneBtn{order:-1}'
].join('\n'); document.head.appendChild(st); })();
