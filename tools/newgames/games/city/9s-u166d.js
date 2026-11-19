/* update 166 (his playtest: the phone still looked bad, most of the screen was two buttons that did the same thing, icons
   were cut off): the CumPhone looks like a real phone. A thin bezel, the island at the top, a status bar, the red moon
   wallpaper, a clock widget, a grid of app icons with their names under them, and a home bar at the bottom. No big
   buttons: B, Start, the home bar, the phone button or T close it. Sideways it turns sideways (widget left, apps right).
   New app CUM EATS orders things to wherever you are (joints, pizza, a pie, a Cumpuccino, armour, ammo, hook claws). */
(function () { var st = document.createElement('style'); st.textContent = [
  '#menu.phone .mlist .mbtn{flex-shrink:0}#menu.phone:not(.home) .mbox h1{display:block!important}#menu.phone:not(.home) .msub{display:block!important}#menu.phone{background:rgba(4,2,3,.55)!important}#menu.phone .mbox{animation:none!important;opacity:1!important;transform:none!important}#menu.phone .mlist{position:static!important}',
  '#menu.phone .mbox{position:relative;width:min(330px,88vw)!important;height:min(680px,90vh,calc(100% - 28px))!important;max-width:none!important;min-height:0!important;margin:auto;display:flex;flex-direction:column;overflow:hidden;border-radius:46px!important;padding:58px 18px 34px!important;border:0!important;',
  'background:radial-gradient(circle at 80% 14%,rgba(150,16,26,.55) 0 4%,rgba(120,10,18,.22) 4.5% 6%,rgba(120,10,18,.10) 6.5%,transparent 22%),radial-gradient(ellipse at 50% 120%,#3a0810,transparent 60%),linear-gradient(180deg,#160709 0%,#0b0406 55%,#070304 100%)!important;',
  'box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 0 0 9px #050506,0 0 0 11px #2e2e34,0 0 0 12px #0b0b0d,0 30px 80px rgba(0,0,0,.85)!important}',
  '#menu.phone .mbox::before{display:none!important}#menu.phone .mbox::after{content:"";display:block!important;position:absolute;top:13px;left:50%;width:94px;height:27px;margin:0 0 0 -47px;border-radius:15px;background:#000;box-shadow:inset 0 0 0 1px #111;border:0!important}',
  '#menu.phone .mclose{display:none!important}',
  '#menu.phone .mhtml{position:static!important;margin:0!important}',
  '#menu.phone .pbar{position:absolute!important;top:16px;left:30px;right:30px;height:22px;display:flex;justify-content:space-between;align-items:center;font:600 13px "Archivo Narrow",sans-serif;color:#f1e7d0;letter-spacing:.02em;padding:0;z-index:2}',
  '#menu.phone .pbar .r{display:flex;align-items:center;gap:5px}#menu.phone .pbar svg{display:block}',
  '#menu.phone .mbox h1{font:700 22px "Archivo Narrow",sans-serif!important;letter-spacing:.01em;text-align:left;margin:4px 2px 2px!important;color:#f1e7d0;text-transform:none}#menu.phone .mbox h1::after{display:none!important}',
  '#menu.phone .msub{font:400 13px "Archivo Narrow",sans-serif;text-align:left;opacity:.75;margin:0 2px 10px!important;color:#e8dcc8}',
  '#menu.phone.home .mbox h1,#menu.phone.home .msub{display:none}',
  '#menu.phone .pclock{text-align:center;color:#f6efe2;margin:4px 0 18px;text-shadow:0 2px 12px rgba(0,0,0,.6)}#menu.phone .pclock b{display:block;font:300 64px/1 "Archivo Narrow",sans-serif;letter-spacing:-.01em}',
  '#menu.phone .pclock span{display:block;font:500 14px "Archivo Narrow",sans-serif;opacity:.85;margin-top:4px}#menu.phone .pclock i{display:inline-block;font:600 12px "Archivo Narrow",sans-serif;font-style:normal;margin-top:10px;padding:5px 12px;border-radius:14px;background:rgba(255,255,255,.1);backdrop-filter:blur(6px);color:#ffe36a}',
  '#menu.phone .pclock em{display:block;font:500 12px "Archivo Narrow",sans-serif;font-style:normal;margin:8px auto 0;padding:6px 12px;border-radius:12px;background:rgba(196,18,28,.35);max-width:220px}',
  '#menu.phone .mlist{flex:1;display:flex;flex-direction:column;gap:8px;overflow-y:auto;overflow-x:hidden;padding:2px 2px 6px;margin:0!important}',
  '#menu.phone .mlist.grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;grid-auto-rows:max-content!important;gap:16px 4px!important;align-content:start}',
  '#menu.phone .mbtn{min-height:0!important;height:auto!important;margin:0!important;border-radius:14px!important;padding:12px 14px!important;background:rgba(255,255,255,.07)!important;border:0!important;box-shadow:none!important;text-align:left;font:600 15px "Archivo Narrow",sans-serif!important;letter-spacing:.01em;color:#f1e7d0!important;text-transform:none!important;transform:none!important;clip-path:none!important}',
  '#menu.phone .mbtn::before,#menu.phone .mbtn::after{display:none!important}#menu.phone .mbtn small{display:block;font:400 12px "Archivo Narrow",sans-serif;opacity:.7;margin-top:2px;text-transform:none}',
  '#menu.phone .mbtn.hs-focus,#menu.phone .mbtn:focus-visible,#menu.phone .mbtn:hover{background:rgba(196,18,28,.55)!important;outline:none}',
  '#menu.phone .mbtn .row{display:flex;align-items:center;gap:12px}#menu.phone .mbtn .row svg{width:38px;height:38px;border-radius:10px;flex:none}#menu.phone .mbtn .row b{display:block;font-weight:600}#menu.phone .mbtn .row s{text-decoration:none;margin-left:auto;color:#ffe36a;font-weight:600}',
  '#menu.phone .mbtn.app{background:transparent!important;padding:0!important;text-align:center;font:500 11.5px "Archivo Narrow",sans-serif!important;overflow:visible}#menu.phone .mbtn.app span{display:flex;flex-direction:column;align-items:center;gap:6px;white-space:nowrap}',
  '#menu.phone .mbtn.app .ic{display:block;width:56px;height:56px;flex:none}#menu.phone .mbtn.app .ic svg{width:100%;height:100%;display:block;filter:drop-shadow(0 3px 4px rgba(0,0,0,.45))}',
  '#menu.phone .mbtn.app.hs-focus,#menu.phone .mbtn.app:focus-visible,#menu.phone .mbtn.app:hover{background:transparent!important}#menu.phone .mbtn.app.hs-focus .ic,#menu.phone .mbtn.app:focus-visible .ic{outline:2.5px solid #ffe36a;outline-offset:3px;border-radius:15px}',
  '#menu.phone .mbtn.home{position:absolute!important;bottom:6px;left:50%;width:150px;height:22px!important;margin-left:-75px!important;padding:0!important;background:transparent!important;font-size:0!important;color:transparent!important;z-index:3}',
  '#menu.phone .mbtn.home::after{content:"";display:block!important;position:absolute;left:25px;right:25px;top:9px;height:5px;border-radius:3px;background:rgba(241,231,208,.75)}#menu.phone .mbtn.home.hs-focus::after{background:#ffe36a}',
  '#menu.phone .mbtn.pback{position:absolute!important;top:44px;left:16px;padding:4px 8px!important;background:transparent!important;color:#ff6a70!important;font:600 14px "Archivo Narrow",sans-serif!important;z-index:3}#menu.phone .mbtn.pback.hs-focus{background:rgba(196,18,28,.4)!important}',
  '#menu.phone:not(.home) .mbox{padding-top:72px!important}',
  '#menu.phone .mcost{font:600 26px "Archivo Narrow",sans-serif;color:#ffe36a;text-align:center;margin:8px 0}#menu.phone .mcost small{display:block;font:400 12px "Archivo Narrow",sans-serif;color:#e8dcc8;opacity:.8}',
  '#menu.phone.snake .snk{display:flex;flex-direction:column;align-items:center;gap:12px}#menu.phone.snake .snk canvas{width:min(270px,72vw);height:auto;border-radius:14px;border:0;box-shadow:0 0 0 2px #4a1a1c;image-rendering:pixelated;touch-action:none}',
  '#menu.phone.snake .snk .pad{display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,38px);gap:6px}#menu.phone.snake .snk .pad button{background:rgba(255,255,255,.08);border:0;border-radius:12px;color:#f1e7d0;font-size:16px;touch-action:none}',
  /* sideways: the phone turns too; the clock on the left, the apps on the right */
  '@media (orientation:landscape) and (max-height:560px){#menu.phone .mbox{width:min(700px,92vw)!important;height:min(330px,88vh)!important;padding:34px 34px 26px 64px!important;flex-direction:row;gap:18px;border-radius:40px!important}',
  '#menu.phone .mbox::after{top:50%;left:14px;width:26px;height:84px;margin:-42px 0 0 0}#menu.phone .pbar{left:64px;right:34px;top:8px}',
  '#menu.phone.home .mhtml{flex:0 0 32%;display:flex;align-items:center;justify-content:center}#menu.phone .pclock{margin:0}#menu.phone .pclock b{font-size:clamp(34px,15vh,56px)}',
  '#menu.phone .mlist.grid{grid-template-columns:repeat(4,1fr)!important;gap:clamp(6px,3vh,14px) 4px!important;align-content:center}#menu.phone .mbtn.app .ic{width:clamp(36px,14vh,52px);height:clamp(36px,14vh,52px)}#menu.phone .mbtn.app{font-size:10.5px!important}',
  '#menu.phone:not(.home) .mbox{flex-direction:column;padding-top:56px!important;gap:0}#menu.phone .mbtn.pback{top:26px;left:60px}#menu.phone.snake .snk{flex-direction:row;justify-content:center;gap:24px}#menu.phone.snake .snk canvas{width:auto;height:min(220px,58vh)}',
  '#menu.phone .mbtn.home{bottom:3px}}'].join('\n'); document.head.appendChild(st); })();
/* the icons: every one a full tile (rounded square) with its picture well inside the edges */
function picon2(k) { var g = PIC2[k] || PIC2.map; return '<i class="ic"><svg viewBox="0 0 60 60"><defs><linearGradient id="pg' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + g[0] + '"/><stop offset="1" stop-color="' + g[1] + '"/></linearGradient></defs><rect x="0" y="0" width="60" height="60" rx="14" fill="url(#pg' + k + ')"/><rect x="0.5" y="0.5" width="59" height="59" rx="13.5" fill="none" stroke="rgba(255,255,255,.18)"/>' + g[2] + '</svg></i>'; }
var PIC2 = {
  cab: ['#ffe36a', '#d8a820', '<path d="M14 36 l5-11 h22 l5 11 v7 h-32z" fill="#12040a"/><rect x="21" y="27" width="18" height="6" rx="1" fill="#7ad8ff"/><circle cx="21" cy="43" r="4" fill="#f1e7d0" stroke="#12040a" stroke-width="2"/><circle cx="39" cy="43" r="4" fill="#f1e7d0" stroke="#12040a" stroke-width="2"/><rect x="25" y="19" width="10" height="5" rx="1" fill="#c4121c"/>'],
  eats: ['#ff3a3a', '#a00c18', '<path d="M16 28 h28 l-3 16 h-22z" fill="#f1e7d0"/><path d="M22 28 c0-8 16-8 16 0" stroke="#f1e7d0" stroke-width="3" fill="none"/><circle cx="30" cy="36" r="4" fill="#c4121c"/>'],
  ins: ['#3a7ad8', '#1a3a7a', '<path d="M30 14 l13 5 v9 c0 9-6 15-13 18 c-7-3-13-9-13-18 v-9z" fill="#f1e7d0"/><path d="M24 30 l4 4 l8-9" stroke="#1a3a7a" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],
  map: ['#3aa04a', '#1a5a24', '<path d="M12 18 l11-4 l14 4 l11-4 v28 l-11 4 l-14-4 l-11 4z" fill="#f1e7d0"/><path d="M23 14 v28 M37 18 v28" stroke="#a8c8a0" stroke-width="2"/><path d="M30 20 c-4 0-6 3-6 6 c0 5 6 10 6 10 s6-5 6-10 c0-3-2-6-6-6z" fill="#c4121c"/><circle cx="30" cy="26" r="2.2" fill="#f1e7d0"/>'],
  jobs: ['#8a5a2a', '#4a2a10', '<rect x="14" y="23" width="32" height="20" rx="3" fill="#f1e7d0"/><path d="M24 23 v-4 h12 v4" stroke="#f1e7d0" stroke-width="3" fill="none"/><rect x="14" y="31" width="32" height="3" fill="#8a5a2a"/><rect x="27" y="29" width="6" height="7" rx="1" fill="#c4121c"/>'],
  cam: ['#5a5a62', '#26262c', '<rect x="13" y="21" width="34" height="23" rx="5" fill="#f1e7d0"/><rect x="23" y="17" width="12" height="6" rx="2" fill="#f1e7d0"/><circle cx="30" cy="32.5" r="8" fill="#26262c"/><circle cx="30" cy="32.5" r="4.5" fill="#4adfff"/><circle cx="41" cy="26" r="1.8" fill="#c4121c"/>'],
  snake: ['#2a2a30', '#0e0708', '<path d="M15 42 h12 v-10 h12 v-10" stroke="#f1e7d0" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="39" cy="19" r="5" fill="#f1e7d0"/><circle cx="40.5" cy="18" r="1.3" fill="#12040a"/><circle cx="19" cy="21" r="3.5" fill="#ffe36a"/>'],
  music: ['#a03ad8', '#4a0a7a', '<path d="M25 40 V20 l15-4 v20" stroke="#f1e7d0" stroke-width="3.5" fill="none"/><circle cx="21.5" cy="40.5" r="5" fill="#f1e7d0"/><circle cx="36.5" cy="36" r="5" fill="#f1e7d0"/>'],
  joint: ['#3a8a3a', '#1a4a1a', '<path d="M14 36 l28-10 l3 5 l-28 10z" fill="#f1e7d0"/><path d="M42 26 l3 5 l3-1 l-3-5z" fill="#ff7a30"/><path d="M47 22 c3-3 0-6 3-9" stroke="#e8e8e8" stroke-width="1.6" fill="none" opacity=".8"/>'],
  pizza: ['#ffcf4a', '#e08a20', '<path d="M30 14 l15 30 h-30z" fill="#f6d27a" stroke="#b86a20" stroke-width="2.5"/><circle cx="30" cy="28" r="2.6" fill="#c4121c"/><circle cx="25" cy="37" r="2.6" fill="#c4121c"/><circle cx="35" cy="38" r="2.3" fill="#ffe36a"/>'],
  pie: ['#f1e7d0', '#c8a870', '<ellipse cx="30" cy="35" rx="16" ry="8" fill="#b8742a"/><ellipse cx="30" cy="31" rx="14" ry="7" fill="#fff6dc"/><circle cx="30" cy="26" r="3" fill="#c4121c"/>'],
  cuppa: ['#7a4a2a', '#3a1a0a', '<path d="M18 24 h22 l-2 18 h-18z" fill="#f1e7d0"/><path d="M40 28 c6 0 6 8 0 8" stroke="#f1e7d0" stroke-width="3" fill="none"/><path d="M24 19 c0-3 3-3 3-6 M31 19 c0-3 3-3 3-6" stroke="#f1e7d0" stroke-width="1.8" fill="none" opacity=".8"/>'],
  armour: ['#c4121c', '#5a0a10', '<rect x="17" y="18" width="26" height="26" rx="4" fill="#f1e7d0"/><circle cx="30" cy="31" r="7" fill="none" stroke="#c4121c" stroke-width="3"/><text x="30" y="16" font-size="7" text-anchor="middle" fill="#f1e7d0" font-family="sans-serif">XL</text>'],
  ammo: ['#8a8a8e', '#3a3a3e', '<rect x="18" y="24" width="6" height="18" rx="1" fill="#c8a040"/><path d="M18 24 q3-8 6 0z" fill="#d8b860"/><rect x="27" y="24" width="6" height="18" rx="1" fill="#c8a040"/><path d="M27 24 q3-8 6 0z" fill="#d8b860"/><rect x="36" y="24" width="6" height="18" rx="1" fill="#c8a040"/><path d="M36 24 q3-8 6 0z" fill="#d8b860"/>'],
  hook: ['#e8e2d6', '#9a948a', '<path d="M30 46 v-24" stroke="#12040a" stroke-width="3"/><path d="M30 22 l-8-6 M30 22 l8-6 M30 22 v-9" stroke="#c4121c" stroke-width="3" stroke-linecap="round"/>']
};
function pbar2() { var t = (G.time | 0) + ':' + ('0' + Math.floor((G.time % 1) * 60)).slice(-2); return '<div class="pbar"><span>' + t + '</span><span class="r"><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#f1e7d0"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="#f1e7d0"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#f1e7d0"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="#f1e7d0"/></svg><svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 10 L1 4 a9 9 0 0 1 13 0z" fill="#f1e7d0"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="#f1e7d0" opacity=".7"/><rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill="#f1e7d0"/><rect x="22.5" y="4" width="2" height="4" rx="1" fill="#f1e7d0" opacity=".7"/></svg></span></div>'; }
var DAYN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function phoneHomeBtn() { return { label: 'Close', back: true, cls: 'home', fn: phoneClose }; }
phoneOpen = function () { if (!P || G.mode !== 'play' || G.cut || G.interior || P.state === 'dead' || G.spray) { if (G.interior) toast('No signal in here.'); return; } G.phone = 1; sfx.play('blip');
  var busy = PHONE && PHONE.st !== 'done', t = (G.time | 0) + ':' + ('0' + Math.floor((G.time % 1) * 60)).slice(-2), sn = typeof season === 'function' && typeof SEASONS !== 'undefined' ? SEASONS[season()] : '';
  var html = pbar2() + '<div class="pclock"><b>' + t + '</b><span>' + DAYN[((G.day || 1) - 1) % 7] + ' · Day ' + (G.day || 1) + (sn ? ' · ' + sn : '') + '</span><i>$' + Math.floor(SV.money).toLocaleString('en-GB') + '</i>' + (busy ? '<em>' + PHONE.what + ' is on the way</em>' : '') + '</div>';
  KIT.menu({ cls: 'phone home', title: 'CumPhone', html: html, grid: true, items: [
    { label: picon2('cab') + 'Spooger', cls: 'app', fn: function () { phoneAsk('taxi'); } },
    { label: picon2('eats') + 'Spooger Eats', cls: 'app', fn: eatsMenu },
    { label: picon2('ins') + 'Insurance', cls: 'app', fn: function () { phoneAsk('insure'); } },
    { label: picon2('map') + 'Map', cls: 'app', fn: function () { phoneClose(); mapMenu(null); } },
    { label: picon2('jobs') + 'Jobs', cls: 'app', fn: function () { jobsMenu(); } },
    { label: picon2('cam') + 'Camera', cls: 'app', fn: function () { phoneClose(); G.flashT = 0.2; sfx.play('blip'); toast(pick(['Click. Nobody will ever look at that again.', 'Click. Blurry, but it has character.', 'Click. A masterpiece of Cum City.'])); } },
    { label: picon2('snake') + 'Sperm Snake', cls: 'app', fn: snakeOpen },
    { label: picon2('music') + 'Radio', cls: 'app', fn: function () { phoneClose(); if (RAD.on) { radioOff(); toast('Radio off.'); } else { radioOn({ t: { cls: 'car' } }); toast('Radio on. RB changes the station.'); } } },
    phoneHomeBtn()] }); };
function prow(ic, name, sub, price) { return '<span class="row">' + picon2(ic).replace('<i class="ic">', '').replace('</i>', '') + '<span><b>' + name + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (price !== undefined ? '<s>' + price + '</s>' : '') + '</span>'; }
function phoneSub(title, sub, rows) { KIT.menu({ cls: 'phone', title: title, sub: sub, html: pbar2(), items: rows.concat([{ label: '‹ Apps', back: true, cls: 'pback', fn: phoneOpen }]) }); }
/* CUM EATS: things brought to wherever you are, by the scooter courier */
function eatsList() { var W0 = WPN[P.wpn], L = [
  { ic: 'joint', n: 'Joints (5)', s: 'A combat high each. Smoke one anywhere.', p: 40, give: function () { SV.joints = (SV.joints || 0) + 5; toast('Five joints. Stand still and spark one.'); } },
  { ic: 'pizza', n: "Joff's Pineapple Pizza", s: 'Full health.', p: 25, give: function () { P.hp = Math.max(P.hp, SV.maxHp); toast('Pineapple belongs on pizza. Full health.'); } },
  { ic: 'pie', n: "Greebo's Cream Pie", s: '+70 health.', p: 30, give: function () { P.hp = Math.min(Math.max(SV.maxHp, P.hp), P.hp + 70); toast("Greebo's Cream Pie: +70 health."); } },
  { ic: 'cuppa', n: 'Cumpuccino', s: '+30 health.', p: 8, give: function () { P.hp = Math.min(Math.max(SV.maxHp, P.hp), P.hp + 30); toast('Cumpuccino: +30 health.'); } },
  { ic: 'armour', n: 'Box of Condoms', s: 'Full armour.', p: 400, give: function () { P.armour = 100; toast('A fresh condom: full armour.'); } }];
  if (W0 && W0.ammo && W0.ammoN && P.wpn !== 'hook') L.push({ ic: 'ammo', n: W0.n + ' ammo (' + W0.ammoN + ')', s: 'For the gun in your hand.', p: Math.round((W0.ammoCost || 60) * 1.25), give: function () { SV.ammo[W0.ammo] = (SV.ammo[W0.ammo] || 0) + W0.ammoN; toast(W0.n + ': +' + W0.ammoN + ' rounds.'); } });
  if (SV.weapons && SV.weapons.hook) L.push({ ic: 'hook', n: 'Fapling Hook claws (10)', s: 'Ammo for the hook.', p: 150, give: function () { SV.ammo.hook = (SV.ammo.hook || 0) + 10; toast('Ten claws for the Fapling Hook.'); } });
  return L; }
function eatsMenu() { if (PHONE && PHONE.st !== 'done') { toast('Something is already on its way.'); return; }
  phoneSub('Spooger Eats', 'Brought to wherever you are.', eatsList().map(function (it) { return { label: prow(it.ic, it.n, it.s, '$' + it.p), fn: function () {
    KIT.confirm({ cls: 'phone', title: it.n, sub: it.s + ' A courier brings it to you.', price: it.p, have: Math.floor(SV.money), unit: '$', yesLabel: 'Order', yes: function () { if (SV.money < it.p) return; money(-it.p); phoneOrder(it); }, no: eatsMenu }); } }; })); }
CALLS.order = [['cumhead', 'Hi, Spooger Eats? I would like something brought to me. Look for the droplet in the nice shirt.'], ['pedF1', 'Spooger Eats! It is on its way, Mister Mayor. Ten minutes or it is free.']];
ARRIVE.order = 'Spooger Eats! Here you go, Mister Mayor. Enjoy.';
function phoneOrder(it) { phoneClose(); PHONE = { what: 'Your ' + it.n.replace(/ \(.*\)$/, ''), k: 'order', st: 'call', t: 0, line: 0, give: it.give }; sfx.play('blip'); }
(function () { var pv = phoneVehType; phoneVehType = function (k) { return k === 'order' ? (VT.scooter ? 'scooter' : 'moto') : pv(k); };
  var ar = arrive; arrive = function (S) { if (S.k === 'order') { S.hand = 1; return; } return ar(S); };
  var ts = takeStim; takeStim = function () { if (PHONE && PHONE.k === 'order' && PHONE.give) { var g = PHONE.give; PHONE.give = null; sfx.play('coin'); g(); return; } return ts.apply(this, arguments); }; })();
/* the other phone screens in the same look */
jobsMenu = function () { var v = P.veh; phoneSub('Jobs', G.job ? 'On shift: ' + JOBS[G.job.k].n : v ? 'In a ' + v.t.n : 'Get in the right vehicle first.', Object.keys(JOBS).map(function (k) { var ok = v && JOBS[k].need.indexOf(v.type) >= 0;
    return { label: prow('jobs', JOBS[k].n, ok ? 'Start a shift' : 'Needs: ' + JOBS[k].need.map(function (t) { return VT[t] ? VT[t].n : t; }).join(' or ')), dis: !ok, fn: function () { phoneClose(); if (G.job) jobStop(); jobStart(k); } }; })
  .concat(G.job ? [{ label: prow('jobs', 'End the shift', ''), fn: function () { phoneClose(); jobStop(); } }] : [])); };
/* Start (the pause button) closes the phone too */
(function () { var was = 0; function loop() { if (G && G.phone) { try { var gp = navigator.getGamepads ? navigator.getGamepads() : []; var on = 0; for (var i = 0; i < gp.length; i++) if (gp[i] && gp[i].buttons[9] && gp[i].buttons[9].pressed) on = 1; if (on && !was && KIT.menuOpen()) phoneClose(); was = on; } catch (e) { } } else was = 0; requestAnimationFrame(loop); } requestAnimationFrame(loop);
  window.addEventListener('keydown', function (e) { if (!G || !G.phone || !KIT.menuOpen()) return; if (e.code === 'KeyT' || e.code === 'Enter' && e.shiftKey) { phoneClose(); e.preventDefault(); e.stopPropagation(); } }, true); })();
