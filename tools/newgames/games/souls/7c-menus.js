/* =====================================================================================================
   DARK LOADS update 149: the menus (his ask: the UI was all off, barely any stats to level, no information, the menus
   did not use the screen). Every screen fills the whole screen in portrait, landscape and on PC. Six attributes like
   Elden Ring's (Vigour, Mind, Endurance, Strength, Dexterity, Arcane), levelled a point at a time with - and +
   before you confirm, every number they change shown beside them; weapons have Strength / Dexterity grades, a weight,
   attack power; equip load decides how you roll. Candle screen, level up, equipment, status, the map, travel,
   Spermaid, Saba's stall, the pause screen.
   ===================================================================================================== */
var STATS = [['vig', 'VIGOUR', 'Your health. The more you have, the more mistakes you can make.'], ['mind', 'MIND', 'FP, the blue bar: what your weapon skills cost.'], ['end', 'ENDURANCE', 'Stamina, and how much you can carry before you roll like a sack of spuds.'], ['str', 'STRENGTH', 'Damage with weapons that scale with Strength: the heavy ones.'], ['dex', 'DEXTERITY', 'Damage with weapons that scale with Dexterity: the quick ones.'], ['arc', 'ARCANE', 'More Loads from everything you kill.']];
var SBASE = { vig: 10, mind: 8, end: 10, str: 12, dex: 10, arc: 8 };
var SCAL = { sausage: 'CD', pin: 'CC', knife: 'EB', cleaver: 'DB', bat: 'CD', hammer: 'AE', axe: 'BD', fork: 'CC', scythe: 'DA', guitar: 'SE', flail: 'BD', dusters: 'DA' };
var GRADEK = { S: 1.0, A: 0.82, B: 0.64, C: 0.48, D: 0.32, E: 0.16 };
var WWEIGHT = { sausage: 4, pin: 4.5, knife: 2, cleaver: 3, bat: 5.5, hammer: 13, axe: 9, fork: 7, scythe: 9, guitar: 14, flail: 11, dusters: 1.5 };
function sv(o, k) { return (o || SV)[k] || 0; }
function maxHp(o) { var v = sv(o, 'vig'); return Math.round((100 + v * 13 - Math.max(0, v - 25) * 6) * ((o || SV).ring === 'tb' ? 0.8 : 1)); }
function maxFp(o) { return Math.round(60 + sv(o, 'mind') * 7); }
function maxSta(o) { return Math.round(80 + sv(o, 'end') * 6); }
function capLoad(o) { return 30 + sv(o, 'end') * 1.6; }
function wWeight(w) { return WWEIGHT[w] || 5; }
function loadOf(w, o) { var r = wWeight(w || SV.wpn) / capLoad(o); return r < 0.1 ? 'light' : r < 0.3 ? 'mid' : 'heavy'; }
function scurve(n) { return 1 - Math.exp(-n / 22); }
function dmgK(w, o) { w = w || SV.wpn; o = o || SV; var g = SCAL[w] || 'CC'; return (1 + GRADEK[g[0]] * scurve(sv(o, 'str')) * 2.2 + GRADEK[g[1]] * scurve(sv(o, 'dex')) * 2.2) * (o.ring === 'tb' ? 1.3 : 1); }
function discK(o) { return Math.min(0.8, sv(o, 'arc') * 0.025); }
function defence(o) { return Math.round(40 + sv(o, 'vig') * 0.6 + sv(o, 'end') * 0.5 + sv(o, 'str') * 0.8); }
function poiseOf(o) { return Math.round(20 + sv(o, 'str') * 0.5 + sv(o, 'end') * 0.3 + wWeight(SV.wpn)); }
function lvlCost(L) { L = L || SV.lvl; return Math.round(300 + 90 * Math.pow(L, 1.35)); }
var defHurt = hurtPlayer;
hurtPlayer = function (dmg) { var a = Array.prototype.slice.call(arguments); a[0] = dmg * (1 - Math.min(0.35, (defence() - 40) / 260)); return defHurt.apply(this, a); };
/* ---------- the screen ---------- */
(function () { var st = document.createElement('style'); st.textContent = [
  '#menu{position:fixed!important;inset:0!important;z-index:30}',
  '#menu.dk{padding:0;display:block;overflow:hidden;background:radial-gradient(ellipse at 25% 15%,rgba(70,8,14,.5),rgba(5,2,3,.95) 70%)}',
  '.dks{position:absolute;inset:0;display:flex;flex-direction:column;padding:max(12px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));font-family:"Archivo Narrow",sans-serif;color:#f1e7d0;box-sizing:border-box}',
  '.dkh{display:flex;align-items:flex-end;gap:12px;border-bottom:1px solid #7a6238;padding-bottom:6px;flex:0 0 auto}',
  '.dkh h1{font:400 clamp(26px,5.2vmin,46px)/1 "Pirata One",serif;margin:0;color:#f1e7d0;letter-spacing:1px}',
  '.dksub{color:#a6968f;font-size:14px;margin-top:2px}',
  '.dkl{margin-left:auto;color:#ffe36a;font:700 17px "Archivo Narrow",sans-serif;white-space:nowrap}',
  '.dkb{flex:1 1 auto;min-height:0;display:flex;gap:22px;padding:10px 0;overflow:auto}',
  '.dkcol{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:2px}',
  '.dkcol.wide{flex:1.4 1 0}',
  '@media (orientation:portrait){.dkb{flex-direction:column;gap:10px}.dkcol,.dkcol.wide{flex:0 0 auto}}',
  '.dkhd{color:#c48a3a;font:700 13px "Archivo Narrow",sans-serif;letter-spacing:2px;margin:8px 0 2px;border-bottom:1px solid rgba(196,138,58,.35);padding-bottom:2px}',
  '.dkrow{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 8px;border-bottom:1px solid rgba(122,98,56,.2);font-size:16px}',
  '.dkrow span{color:#a6968f}.dkrow b{font-weight:700}.dkrow .up{color:#7ad0ff}.dkrow .dn{color:#ff5a5a}.dkrow .gold{color:#ffe36a}',
  '.dkbtn{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:9px 14px;border:1px solid transparent;color:#f1e7d0;font:600 19px "Archivo Narrow",sans-serif;cursor:pointer;letter-spacing:1px}',
  '.dkbtn:focus,.dkbtn:hover{border-color:#7a6238;background:linear-gradient(90deg,rgba(196,138,58,.3),rgba(196,138,58,0))}',
  '.dkbtn:disabled{opacity:.35;cursor:default}.dkbtn.gold{color:#ffe36a}.dkbtn.on{color:#ffe36a}.dkbtn small{margin-left:auto;color:#a6968f;font-size:14px;font-weight:400}',
  '.dkbtn canvas{width:40px;height:40px;flex:0 0 40px}',
  '.dkstat{display:grid;grid-template-columns:minmax(80px,1fr) 40px 18px 40px 40px 40px;align-items:center;gap:4px;padding:3px 6px;border-bottom:1px solid rgba(122,98,56,.2);font-size:17px}',
  '.dkstat i{font-style:normal;color:#a6968f;text-align:center}.dkstat b{text-align:right}.dkstat .new{text-align:right;color:#7ad0ff;font-weight:700}',
  '.dkpm{all:unset;box-sizing:border-box;width:40px;height:34px;text-align:center;border:1px solid #4a1a1c;color:#ffe36a;font:700 20px/32px monospace;cursor:pointer}',
  '.dkpm:focus,.dkpm:hover{border-color:#ffe36a;background:rgba(255,227,106,.16)}.dkpm:disabled{opacity:.25}',
  '.dkdesc{color:#c8b898;font-size:15px;line-height:1.35;padding:8px 8px;min-height:2.8em}',
  '.dkf{flex:0 0 auto;border-top:1px solid #7a6238;padding-top:5px;color:#7a6a60;font-size:13px;display:flex;gap:14px;justify-content:space-between;flex-wrap:wrap}',
  '.dkbig{display:flex;gap:14px;align-items:center;padding:6px 8px}.dkbig canvas{width:96px;height:96px;flex:0 0 96px;border:1px solid #4a1a1c;background:rgba(0,0,0,.35)}',
  '.dkbig h2{font:400 26px/1.05 "Pirata One",serif;margin:0;color:#ffe36a}',
  '.dktabs{display:flex;gap:6px;margin-left:16px}.dktabs .dkbtn{padding:4px 10px;font-size:16px}',
  '.dkmap{width:100%;flex:1 1 auto;min-height:160px;image-rendering:pixelated;border:1px solid #4a1a1c;background:#050203;object-fit:contain}',
  '.dksay{font:400 22px/1.3 "Archivo Narrow",sans-serif;color:#f1e7d0;padding:12px 10px;border-left:3px solid #c4121c;background:rgba(0,0,0,.3)}',
  '.dkback{all:unset;margin-left:8px;color:#a6968f;font:700 26px/1 sans-serif;cursor:pointer;padding:0 6px}.dkback:focus{color:#ffe36a}'
].join('\n'); document.head.appendChild(st); })();
function esc2(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function dkScreen(o) {
  KIT.menu({ cls: 'dk', items: [] }); var m = document.getElementById('menu');
  m.innerHTML = '<div class="dks"><div class="dkh"><div><h1>' + esc2(o.title) + '</h1>' + (o.sub ? '<div class="dksub">' + o.sub + '</div>' : '') + '</div>' + (o.tabs || '') +
    '<div class="dkl">' + (o.right !== undefined ? o.right : '&#9670; ' + SV.loads + ' LOADS') + '</div>' + (o.back ? '<button type="button" class="dkback" data-back data-act="back" data-pad-skip aria-label="Back">&#10005;</button>' : '') + '</div>' +
    '<div class="dkb">' + o.html + '</div><div class="dkf"><span>' + (o.foot || 'A / TAP CHOOSE &nbsp;&middot;&nbsp; B BACK') + '</span><span>LEVEL ' + SV.lvl + '</span></div></div>';
  var acts = o.acts || {};
  m.querySelectorAll('[data-act]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); var a = b.getAttribute('data-act');
    if (a === 'back') { sfx.play('back'); if (o.back) o.back(); return; } if (acts[a]) { sfx.play('select'); acts[a](b); } }); });
  if (o.focus) m.querySelectorAll('[data-f]').forEach(function (b) { b.addEventListener('focus', function () { o.focus(b.getAttribute('data-f'), b); }); b.addEventListener('mouseenter', function () { o.focus(b.getAttribute('data-f'), b); }); });
  var def = m.querySelector('[data-pad-default]') || m.querySelector('.dkb button:not(:disabled)'); if (def) { def.setAttribute('data-pad-default', ''); if (!('ontouchstart' in window)) def.focus({ preventScroll: true }); }
  return m; }
function row(k, v, cls) { return '<div class="dkrow"><span>' + k + '</span><b' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</b></div>'; }
function btn(act, label, o) { o = o || {}; return '<button type="button" class="dkbtn' + (o.cls ? ' ' + o.cls : '') + '" data-act="' + act + '"' + (o.f ? ' data-f="' + o.f + '"' : '') + (o.dis ? ' disabled' : '') + (o.def ? ' data-pad-default' : '') + '>' + (o.icon ? '<canvas width="48" height="48" data-icon="' + o.icon + '"></canvas>' : '') + '<span>' + label + '</span>' + (o.small ? '<small>' + o.small + '</small>' : '') + '</button>'; }
function paintIcons(m) { m.querySelectorAll('canvas[data-icon]').forEach(function (c) { var k = c.getAttribute('data-icon'), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); if (k === 'flask') flaskIcon(g, c.width); else if (k.indexOf('r:') === 0) rIcon(k.slice(2))(g, c.width, c.height); else wIcon(k)(g, c.width, c.height); }); }
function candleOf(id) { return WORLD.things.filter(function (t) { return t.k === 'candle' && t.id === id; })[0]; }
function seals() { return ['muckies', 'bride', 'stag'].filter(function (b) { return SV.bosses[b]; }).length; }
/* ---------- the candle ---------- */
function candleMenu(c) {
  var R0 = regionAt(tx(c.i), tx(c.j));
  dkScreen({ title: c.n || 'The Candle', sub: R0.name === c.n ? 'A candle' : R0.name, back: function () { KIT.closeMenu(); }, foot: 'A / TAP CHOOSE &nbsp;&middot;&nbsp; B LEAVE THE CANDLE',
    html: '<div class="dkcol">' + btn('lvl', 'LEVEL UP', { def: 1, small: 'next ' + lvlCost() }) + btn('eq', 'EQUIPMENT') + btn('st', 'STATUS') + btn('tr', 'TRAVEL', { small: Object.keys(SV.lit).length + ' candles lit' }) + btn('map', 'MAP') + btn('back', 'LEAVE') + '</div>' +
      '<div class="dkcol wide"><div class="dkhd">RESTED</div>' + row('Health', maxHp() + ' / ' + maxHp()) + row('Cum Flask', flaskMax() + ' swigs') + row('FP', maxFp()) + row('The dead', 'back on their feet') +
      '<div class="dkhd">THE PILL KEEP</div>' + row('Seals broken', seals() + ' of 3', seals() >= 3 ? 'gold' : '') + row('Deaths', SV.deaths || 0) + '<div class="dkdesc">Rest here and you heal and refill your flask, but everything you killed gets back up. Level up with the Loads you carry: Spermaid can do it too.</div></div>',
    acts: { lvl: function () { levelMenu(function () { candleMenu(c); }); }, eq: function () { equipMenu(function () { candleMenu(c); }); }, st: function () { statusMenu(function () { candleMenu(c); }); }, tr: function () { travelMenu(c); }, map: function () { mapMenu(function () { candleMenu(c); }); }, back: KIT.closeMenu } });
}
/* ---------- level up: points go on first, then CONFIRM pays for them all ---------- */
function levelMenu(back, pend) {
  pend = pend || {}; var add = 0; STATS.forEach(function (s) { add += pend[s[0]] || 0; });
  var cost = 0; for (var n = 0; n < add; n++) cost += lvlCost(SV.lvl + n); var next = lvlCost(SV.lvl + add), canMore = SV.loads >= cost + next;
  var T = {}; for (var k in SV) T[k] = SV[k]; STATS.forEach(function (s) { T[s[0]] = (SV[s[0]] || 0) + (pend[s[0]] || 0); });
  function cmp(a, b, unit) { return a === b ? '<b>' + a + (unit || '') + '</b>' : '<b>' + a + ' &rarr; <span class="' + (b > a ? 'up' : 'dn') + '">' + b + (unit || '') + '</span></b>'; }
  var stats = STATS.map(function (s) { var k = s[0], v = SBASE[k] + (SV[k] || 0), nv = SBASE[k] + T[k];
    return '<div class="dkstat"><span>' + s[1] + '</span><b>' + v + '</b><i>&rarr;</i><span class="new">' + (nv !== v ? nv : '') + '</span>' +
      '<button type="button" class="dkpm" data-act="m_' + k + '" data-f="' + k + '"' + (pend[k] ? '' : ' disabled') + ' aria-label="less ' + s[1] + '">&minus;</button><button type="button" class="dkpm" data-act="p_' + k + '" data-f="' + k + '"' + (canMore ? '' : ' disabled') + (k === 'vig' ? ' data-pad-default' : '') + ' aria-label="more ' + s[1] + '">+</button></div>'; }).join('');
  var W0 = WEAPONS[SV.wpn], L0 = LOADS[loadOf(SV.wpn, SV)], L1 = LOADS[loadOf(SV.wpn, T)];
  var right = '<div class="dkhd">WHAT CHANGES</div>' + row('Health', cmp(maxHp(), maxHp(T))) + row('FP', cmp(maxFp(), maxFp(T))) + row('Stamina', cmp(maxSta(), maxSta(T))) +
    row('Equip load', cmp(wWeight(SV.wpn).toFixed(1) + ' / ' + capLoad().toFixed(1), wWeight(SV.wpn).toFixed(1) + ' / ' + capLoad(T).toFixed(1))) + row('Roll', L0 === L1 ? '<b>' + L0.n + '</b>' : '<b>' + L0.n + ' &rarr; <span class="up">' + L1.n + '</span></b>') +
    row(W0.n + ' hit', cmp(Math.round(W0.dmg * dmgK(SV.wpn, SV)), Math.round(W0.dmg * dmgK(SV.wpn, T)))) + row('Heavy', cmp(Math.round(W0.heavy * dmgK(SV.wpn, SV)), Math.round(W0.heavy * dmgK(SV.wpn, T)))) +
    row('Defence', cmp(defence(), defence(T))) + row('Discovery', cmp(100 + Math.round(discK() * 100), 100 + Math.round(discK(T) * 100))) + '<div class="dkdesc" id="dkdesc">' + STATS[0][2] + '</div>';
  var m = dkScreen({ title: 'Level Up', sub: 'Level ' + SV.lvl + (add ? ' &rarr; <b style="color:#7ad0ff">' + (SV.lvl + add) + '</b>' : ''), back: back, right: '&#9670; ' + SV.loads + ' LOADS' + (add ? ' <span style="color:#ff8a6a">&minus;' + cost + '</span>' : ''),
    html: '<div class="dkcol wide">' + row('Level', SV.lvl + add) + row('Loads held', SV.loads) + row('Loads needed', next, SV.loads >= cost + next ? 'gold' : 'dn') + '<div class="dkhd">ATTRIBUTES</div>' + stats +
      '<div style="display:flex;gap:8px;margin-top:8px">' + btn('ok', 'CONFIRM' + (add ? ' (' + cost + ')' : ''), { cls: 'gold', dis: !add }) + btn('back', 'BACK') + '</div></div><div class="dkcol">' + right + '</div>',
    foot: 'PICK + TO ADD A POINT, &minus; TO TAKE IT BACK &nbsp;&middot;&nbsp; CONFIRM PAYS FOR THEM ALL',
    focus: function (k) { var s = STATS.filter(function (x) { return x[0] === k; })[0], d = document.getElementById('dkdesc'); if (s && d) d.textContent = s[1] + ': ' + s[2]; },
    acts: (function () { var a = { ok: function () { if (!add || SV.loads < cost) return; SV.loads -= cost; STATS.forEach(function (s) { SV[s[0]] = T[s[0]]; }); SV.lvl += add; if (P) { P.hp = maxHp(); P.sta = maxSta(); P.fp = maxFp(); } persist(); sfx.play('power'); levelMenu(back); }, back: back };
      STATS.forEach(function (s) { var k = s[0]; a['p_' + k] = function () { var p2 = Object.assign({}, pend); p2[k] = (p2[k] || 0) + 1; levelMenu(back, p2); refocus('p_' + k); }; a['m_' + k] = function () { var p2 = Object.assign({}, pend); p2[k] = Math.max(0, (p2[k] || 0) - 1); levelMenu(back, p2); refocus(p2[k] ? 'm_' + k : 'p_' + k); }; }); return a; })() });
}
function refocus(act) { var b = document.querySelector('#menu [data-act="' + act + '"]'); if (b && !b.disabled) b.focus({ preventScroll: true }); else { var p = document.querySelector('#menu [data-act^="p_"]:not(:disabled)'); if (p) p.focus({ preventScroll: true }); } }
/* ---------- equipment: the weapons and rings you have, everything about the one you are looking at ---------- */
function equipMenu(back, tab, sel) {
  tab = tab || 'w'; back = typeof back === 'function' ? back : KIT.closeMenu;
  var list = tab === 'w' ? Object.keys(WEAPONS) : Object.keys(RINGS), have = tab === 'w' ? SV.wpns : SV.rings;
  sel = sel || (tab === 'w' ? SV.wpn : SV.ring || have[0] || list[0]);
  var items = list.map(function (k) { var got = have.indexOf(k) >= 0, on = tab === 'w' ? SV.wpn === k : SV.ring === k;
    return btn('i_' + k, got ? (tab === 'w' ? WEAPONS[k].n : RINGS[k].n) : '???', { icon: got ? (tab === 'w' ? k : 'r:' + k) : null, f: k, cls: on ? 'on' : '', small: on ? 'EQUIPPED' : got ? '' : 'not found', def: k === sel }); }).join('');
  var det = '', can = have.indexOf(sel) >= 0;
  if (tab === 'w') { var W0 = WEAPONS[sel], g = SCAL[sel] || 'CC', K0 = KINDS[W0.c], sk = skillOf(sel);
    det = '<div class="dkbig"><canvas width="96" height="96" data-icon="' + (can ? sel : 'flask') + '"></canvas><div><h2>' + (can ? W0.n : '???') + '</h2><div class="dksub">' + (can ? W0.c.toUpperCase() + ' &middot; ' + K0.l.length + '-hit combo' : 'Not found yet. Chests, bosses, and Saba.') + '</div></div></div>' +
      (can ? '<div class="dkhd">ATTACK</div>' + row('Hit', Math.round(W0.dmg * dmgK(sel)) + ' <span>(' + W0.dmg + ' + ' + Math.round(W0.dmg * (dmgK(sel) - 1)) + ')</span>') + row('Heavy', Math.round(W0.heavy * dmgK(sel))) + row('Reach', W0.reach.toFixed(1) + ' m') + row('Stamina a swing', W0.sta) +
      '<div class="dkhd">SCALING</div>' + row('Strength', g[0], 'gold') + row('Dexterity', g[1], 'gold') + '<div class="dkhd">CARRYING</div>' + row('Weight', wWeight(sel).toFixed(1) + ' / ' + capLoad().toFixed(1)) + row('Roll', LOADS[loadOf(sel)].n) +
      '<div class="dkhd">WEAPON SKILL</div>' + row(sk.n, sk.fp + ' FP') + '<div class="dkdesc">' + esc2(W0.d) + '</div>' + (SV.wpn === sel ? '' : btn('eq', 'EQUIP ' + W0.n.toUpperCase(), { cls: 'gold' })) : ''); }
  else { var R0 = RINGS[sel]; det = '<div class="dkbig"><canvas width="96" height="96" data-icon="r:' + sel + '"></canvas><div><h2>' + (can ? R0.n : '???') + '</h2></div></div>' + (can ? '<div class="dkdesc">' + esc2(R0.d) + '</div>' + (SV.ring === sel ? btn('off', 'TAKE IT OFF') : btn('eq', 'PUT IT ON', { cls: 'gold' })) : '<div class="dkdesc">Not found yet.</div>'); }
  var tabs = '<div class="dktabs">' + btn('tw', 'WEAPONS', { cls: tab === 'w' ? 'on' : '' }) + btn('tr2', 'RINGS', { cls: tab === 'r' ? 'on' : '' }) + '</div>';
  var acts = { tw: function () { equipMenu(back, 'w'); }, tr2: function () { equipMenu(back, 'r'); }, back: back,
    eq: function () { if (tab === 'w') SV.wpn = sel; else SV.ring = sel; if (P) P.hp = Math.min(P.hp, maxHp()); persist(); sfx.play('power'); equipMenu(back, tab, sel); refocus('i_' + sel); },
    off: function () { SV.ring = null; persist(); equipMenu(back, tab, sel); } };
  list.forEach(function (k) { acts['i_' + k] = function () { if (k === sel && have.indexOf(k) >= 0) { acts.eq(); return; } equipMenu(back, tab, k); refocus('i_' + k); }; });
  var m = dkScreen({ title: 'Equipment', sub: (tab === 'w' ? SV.wpns.length + ' of ' + list.length + ' weapons' : SV.rings.length + ' of ' + list.length + ' rings') + ' &middot; Cum Flask ' + (P ? P.flask : flaskMax()) + '/' + flaskMax(), tabs: tabs, back: back,
    html: '<div class="dkcol">' + items + '</div><div class="dkcol wide">' + det + '</div>', acts: acts, foot: 'A ON THE ONE PICKED EQUIPS IT &nbsp;&middot;&nbsp; B BACK' });
  paintIcons(m);
}
/* ---------- status ---------- */
function statusMenu(back) { back = typeof back === 'function' ? back : KIT.closeMenu; var W0 = WEAPONS[SV.wpn];
  dkScreen({ title: 'Status', sub: 'Cumhead &middot; Level ' + SV.lvl, back: back,
    html: '<div class="dkcol"><div class="dkhd">ATTRIBUTES</div>' + STATS.map(function (s) { return row(s[1], SBASE[s[0]] + (SV[s[0]] || 0)); }).join('') + '<div class="dkhd">THE JOURNEY</div>' + row('Seals broken', seals() + ' of 3') + row('Candles lit', Object.keys(SV.lit).length + ' of ' + WORLD.things.filter(function (t) { return t.k === 'candle'; }).length) + row('Deaths', SV.deaths || 0) + row('Times beaten TB', SV.won || 0) + '</div>' +
      '<div class="dkcol"><div class="dkhd">BODY</div>' + row('Health', (P ? Math.round(P.hp) : maxHp()) + ' / ' + maxHp()) + row('FP', (P ? Math.round(P.fp || 0) : maxFp()) + ' / ' + maxFp()) + row('Stamina', maxSta()) + row('Equip load', wWeight(SV.wpn).toFixed(1) + ' / ' + capLoad().toFixed(1) + ' (' + LOADS[loadOf()].n + ')') +
      '<div class="dkhd">FIGHTING</div>' + row(W0.n, Math.round(W0.dmg * dmgK()) + ' / ' + Math.round(W0.heavy * dmgK())) + row('Ring', SV.ring ? RINGS[SV.ring].n : 'none') + row('Defence', defence()) + row('Poise', poiseOf()) + row('Discovery', 100 + Math.round(discK() * 100)) + row('Cum Flask', flaskMax() + ' swigs') + '</div>', acts: { back: back } }); }
/* ---------- the map: the places you have been, the candles you have lit ---------- */
function mapPic(cv, hi) { var M0 = REALMMAP, S = 3, g = cv.getContext('2d'); cv.width = M0.W * S; cv.height = M0.H * S; g.fillStyle = '#050203'; g.fillRect(0, 0, cv.width, cv.height); var seen = SV.seen || {}, col = { A: '#5a463c', B: '#3c503c', C: '#7a5a28', D: '#5a3232', E: '#463c64', F: '#642850', G: '#504a36' };
  for (var j = 0; j < M0.H; j++) for (var i = 0; i < M0.W; i++) { var k = M0.k[j][i], r = M0.r[j][i]; if (k === '#' || k === ' ' || !seen[REGIONS[r].id]) continue; var h = (M0.h[j].charCodeAt(i) - 48) / 2 - 12; g.fillStyle = k === '=' ? '#8a7a6a' : k === 'F' ? '#f1e7d0' : col[r]; g.globalAlpha = 0.6 + Math.max(0, Math.min(0.4, (h + 8) / 50)); g.fillRect(i * S, j * S, S, S); } g.globalAlpha = 1;
  WORLD.things.forEach(function (t) { if (t.k !== 'candle' || !SV.lit[t.id]) return; g.fillStyle = t.id === hi ? '#ffffff' : '#ffe36a'; g.beginPath(); g.arc(t.i * S + 1.5, t.j * S + 1.5, t.id === hi ? 5 : 3.5, 0, 6.3); g.fill(); });
  if (P) { g.fillStyle = '#ff2630'; g.beginPath(); g.arc(P.x / TSZ * S, P.z / TSZ * S, 4, 0, 6.3); g.fill(); } }
function mapMenu(back) { back = typeof back === 'function' ? back : KIT.closeMenu; var m = dkScreen({ title: 'Map', sub: regionAt(P.x, P.z).name, back: back, html: '<canvas class="dkmap" id="dkmap"></canvas>', foot: 'GOLD: CANDLES YOU HAVE LIT &nbsp;&middot;&nbsp; RED: YOU &nbsp;&middot;&nbsp; B BACK', acts: { back: back } });
  mapPic(document.getElementById('dkmap')); var bk = m.querySelector('.dkback'); if (bk) bk.setAttribute('data-pad-default', ''); }
function travelMenu(c, sel) {
  var lit = WORLD.things.filter(function (t) { return t.k === 'candle' && SV.lit[t.id]; }); sel = sel || c.id;
  var acts = { back: function () { candleMenu(c); } };
  lit.forEach(function (t) { acts['g_' + t.id] = function () { if (t.id === sel) { if (t.id === c.id) { candleMenu(c); return; } SV.candle = t.id; persist(); enterArea(0, t.id); var n = candleOf(t.id); if (n) rest(n); return; } travelMenu(c, t.id); refocus('g_' + t.id); }; });
  var m = dkScreen({ title: 'Travel', sub: 'Pick a candle, pick it again to go', back: acts.back,
    html: '<div class="dkcol">' + lit.map(function (t) { return btn('g_' + t.id, t.n, { f: t.id, cls: t.id === c.id ? 'on' : '', small: regionAt(tx(t.i), tx(t.j)).name.replace('THE ', ''), def: t.id === sel }); }).join('') + '</div><div class="dkcol wide"><canvas class="dkmap" id="dkmap"></canvas></div>', acts: acts,
    focus: function (id) { mapPic(document.getElementById('dkmap'), id); } });
  mapPic(document.getElementById('dkmap'), sel);
}
/* ---------- the people of the square ---------- */
var SPERMAID_SAYS = ['Sweetie! Even down here I keep a little stall.', 'TB sits up in his Keep laughing. Break his three seals and the gate will open for you.', 'Mama Muckies is up the streets past the Bell Square. The Bride is in the Cathedral above her. The Stag... the Stag is down in the Depths. Mind yourself.', 'Lost a lot of Loads? Go back to where you fell. They wait for you. Once.', 'You look good in that shirt, you know.'];
function spermaidMenu(n) { n = n === undefined ? (SV.talked.spermaid ? 1 + ((SV.talked.spermaid - 1) % (SPERMAID_SAYS.length - 1)) : 0) : n;
  var gift = !SV.talked.gift; SV.talked.spermaid = (SV.talked.spermaid || 0) + 1;
  if (gift) { SV.talked.gift = 1; SV.shards = (SV.shards || 0) + 1; if (P) P.flask = flaskMax(); } persist();
  dkScreen({ title: 'Spermaid', sub: 'The Candlelit Square', back: KIT.closeMenu,
    html: '<div class="dkcol wide"><div class="dksay">&ldquo;' + esc2(SPERMAID_SAYS[n]) + '&rdquo;</div>' + (gift ? '<div class="dkdesc" style="color:#ffe36a">She presses a Cream Shard into your glove. Your Cum Flask holds one more swig.</div>' : '') + '</div><div class="dkcol">' +
      btn('lvl', 'LEVEL UP', { def: 1, small: 'next ' + lvlCost() }) + btn('talk', 'TALK') + btn('back', 'LEAVE') + '</div>',
    acts: { lvl: function () { levelMenu(function () { spermaidMenu(n); }); }, talk: function () { spermaidMenu((n % (SPERMAID_SAYS.length - 1)) + 1); }, back: KIT.closeMenu } }); }
var SABA_STOCK = [{ k: 'shard', n: 'Cream Shard', d: 'One more swig in your Cum Flask.', cost: 800, max: 3, icon: 'flask' }, { k: 'w_knife', cost: 900 }, { k: 'w_pin', cost: 1200 }, { k: 'w_dusters', cost: 1400 }, { k: 'w_cleaver', cost: 2200 }, { k: 'r_tb', cost: 1500 }, { k: 'r_condom', cost: 2000 }, { k: 'r_pie', cost: 2600 }];
function sabaMenu(sel) {
  var st = SABA_STOCK.map(function (it) { var w = it.k.slice(2), name = it.n || (it.k[0] === 'w' ? WEAPONS[w].n : RINGS[w].n), desc = it.d || (it.k[0] === 'w' ? WEAPONS[w].d : RINGS[w].d), owned = it.k === 'shard' ? (SV.bought.shard || 0) >= it.max : it.k[0] === 'w' ? SV.wpns.indexOf(w) >= 0 : SV.rings.indexOf(w) >= 0;
    return { it: it, name: name, desc: desc, owned: owned, icon: it.icon || (it.k[0] === 'w' ? w : 'r:' + w) }; });
  sel = sel || st[0].it.k; var cur = st.filter(function (s) { return s.it.k === sel; })[0];
  var acts = { back: KIT.closeMenu };
  st.forEach(function (s) { acts['b_' + s.it.k] = function () { if (s.it.k !== sel) { sabaMenu(s.it.k); refocus('b_' + s.it.k); return; } if (s.owned) return;
    KIT.confirm({ title: s.name, sub: s.desc, price: s.it.cost, have: SV.loads, unit: 'LOADS', yes: function () { SV.loads -= s.it.cost; SV.bought[s.it.k] = (SV.bought[s.it.k] || 0) + 1; var w = s.it.k.slice(2);
      if (s.it.k === 'shard') { SV.shards++; if (P) P.flask = flaskMax(); } else if (s.it.k[0] === 'w') SV.wpns.push(w); else SV.rings.push(w); persist(); sfx.play('coin'); sabaMenu(s.it.k); }, no: function () { sabaMenu(s.it.k); } }); }; });
  var m = dkScreen({ title: "Saba's Hitless Hemporium", sub: '&ldquo;Hitless runs only. Take a look, my friend.&rdquo;', back: KIT.closeMenu,
    html: '<div class="dkcol">' + st.map(function (s) { return btn('b_' + s.it.k, s.name, { icon: s.icon, f: s.it.k, def: s.it.k === sel, small: s.owned ? 'SOLD' : s.it.cost + ' LOADS', cls: s.owned ? '' : SV.loads >= s.it.cost ? 'gold' : '' }); }).join('') + '</div>' +
      '<div class="dkcol wide"><div class="dkbig"><canvas width="96" height="96" data-icon="' + cur.icon + '"></canvas><div><h2>' + esc2(cur.name) + '</h2><div class="dksub">' + (cur.owned ? 'Sold' : cur.it.cost + ' Loads') + '</div></div></div><div class="dkdesc">' + esc2(cur.desc) + '</div>' +
      (cur.it.k[0] === 'w' ? row('Hit', Math.round(WEAPONS[cur.it.k.slice(2)].dmg * dmgK(cur.it.k.slice(2)))) + row('Scaling', (SCAL[cur.it.k.slice(2)] || 'CC').split('').join(' / ')) + row('Weight', wWeight(cur.it.k.slice(2))) : '') + row('You have', SV.loads + ' Loads') + '</div>', acts: acts, foot: 'PICK TWICE TO BUY &nbsp;&middot;&nbsp; SHE ASKS FIRST' });
  paintIcons(m); }
/* ---------- pausing ---------- */
function pauseMenu() { if (G.mode !== 'play' || G.wake > 0) return; if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {}
  dkScreen({ title: 'Paused', sub: regionAt(P.x, P.z).name, back: KIT.closeMenu,
    html: '<div class="dkcol">' + btn('back', 'CARRY ON', { def: 1 }) + btn('eq', 'EQUIPMENT') + btn('st', 'STATUS') + btn('map', 'MAP') + btn('help', 'HOW TO PLAY') + btn('opt', 'OPTIONS') + btn('quit', 'QUIT TO TITLE') + '</div>' +
      '<div class="dkcol wide"><div class="dkhd">CUMHEAD</div>' + row('Health', Math.round(P.hp) + ' / ' + maxHp()) + row('Cum Flask', P.flask + ' / ' + flaskMax()) + row(WEAPONS[SV.wpn].n, Math.round(WEAPONS[SV.wpn].dmg * dmgK())) + row('Seals broken', seals() + ' of 3') + row('Level', SV.lvl) + row('Loads', SV.loads) + row('Candles lit', Object.keys(SV.lit).length) + '</div>',
    acts: { back: KIT.closeMenu, eq: function () { equipMenu(pauseMenu); }, st: function () { statusMenu(pauseMenu); }, map: function () { mapMenu(pauseMenu); }, help: helpMenu, opt: optsMenu, quit: function () { KIT.confirm({ title: 'Quit to the title?', sub: 'You keep everything. You start at the last candle.', yesLabel: 'Quit', yes: titleMenu, no: pauseMenu }); } } }); }
function sysMenu() { pauseMenu(); }
function titleMenu() {
  G.mode = 'title'; P = null; G.cine = null; music.play('dkcath'); if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {}
  var started = SV.intro || SV.deaths || SV.lvl > 1 || Object.keys(SV.lit).length;
  KIT.menu({ cls: 'clear', logo: '../assets/dk-logo.webp', title: 'Dark Loads', items: [started ? { label: 'CONTINUE', cls: 'hot', def: true, fn: function () { enterArea(0, SV.lit[SV.candle] ? SV.candle : null); if (!SV.lit[SV.candle]) G.wake = 0.01; } } : { label: 'NEW GAME', cls: 'hot', def: true, fn: startIntro },
    started ? { label: 'NEW GAME', fn: function () { KIT.confirm({ title: 'Start Again?', sub: 'Everything you have is lost.', yesLabel: 'Start again', yes: function () { SV = freshSave(); persist(); startIntro(); }, no: titleMenu }); } } : null, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }] });
}
function ending() {
  G.mode = 'end'; SV.won = (SV.won || 0) + 1; persist(); music.play('dkruins');
  KIT.menu({ title: 'The Age of Cum', html: '<p>You sit on the throne of pill bottles. TB is still laughing somewhere under it. Behind the throne there is a candle that has never been lit. You could light it and sit here for ever, king of a dead keep.</p><p>You blow it out. Far below, the Candlelit Square fills with light, and one by one the street lamps of Cum City come back on.</p><p style="color:#a6968f">Level ' + SV.lvl + ' &middot; deaths ' + SV.deaths + '</p>',
    items: [{ label: 'NEW GAME+', sub: 'Keep your level and gear, the foes hit harder', def: true, fn: function () { var keep = {}; ['lvl', 'vig', 'mind', 'end', 'str', 'dex', 'arc', 'wpns', 'rings', 'shards', 'wpn', 'ring', 'won', 'deaths', 'bought', 'talked', 'seen'].forEach(function (k) { keep[k] = SV[k]; }); SV = freshSave(); for (var k in keep) SV[k] = keep[k]; SV.intro = 1; SV.lit = { hub: 1 }; SV.candle = 'hub'; persist(); enterArea(0, 'hub'); } }, { label: 'TITLE', back: true, fn: titleMenu }] });
}
