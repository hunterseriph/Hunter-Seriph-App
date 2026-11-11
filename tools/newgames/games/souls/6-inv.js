/* ---------- update 132: equipment and the pause screen are a real inventory (KIT.inv), weapons and rings drawn in their slots ---------- */
function wIcon(w) { return function (g, W2, H2) { var s = W2 / 48; g.save(); g.scale(s, s); g.translate(24, 24); g.rotate(-0.78); g.lineCap = 'round';
  function stick(len, col, wd) { g.strokeStyle = '#12040a'; g.lineWidth = wd + 3; g.beginPath(); g.moveTo(0, 18); g.lineTo(0, 18 - len); g.stroke(); g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(0, 18); g.lineTo(0, 18 - len); g.stroke(); }
  function blob(x, y, rx, ry, col) { g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(x, y, rx + 1.5, ry + 1.5, 0, 0, 6.3); g.fill(); g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.3); g.fill(); }
  function rect(x, y, w, h, col) { g.fillStyle = '#12040a'; g.fillRect(x - 1.5, y - 1.5, w + 3, h + 3); g.fillStyle = col; g.fillRect(x, y, w, h); }
  switch (w) {
    case 'sausage': blob(0, -2, 5, 17, '#a8442a'); g.fillStyle = '#e8a080'; g.fillRect(-2, -14, 2, 18); break;
    case 'pin': stick(40, '#8a5a30', 3); blob(0, -2, 6, 13, '#d8b080'); break;
    case 'knife': stick(10, '#2a1a10', 4); rect(-2.5, -16, 5, 22, '#d8d8d0'); break;
    case 'cleaver': stick(12, '#3a2010', 4); rect(-8, -16, 12, 20, '#b8b8c0'); rect(-8, -16, 12, 3, '#7a0a10'); break;
    case 'bat': stick(16, '#2a1a10', 4); blob(0, -6, 5, 15, '#c8a070'); break;
    case 'hammer': stick(36, '#8a5a30', 3); rect(-9, -20, 18, 9, '#5a5a60'); break;
    case 'axe': stick(38, '#c4121c', 3); g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(1, -18); g.lineTo(13, -22); g.lineTo(14, -6); g.lineTo(1, -10); g.fill(); g.fillStyle = '#c0c0c8'; g.beginPath(); g.moveTo(2, -17); g.lineTo(12, -20); g.lineTo(12, -8); g.lineTo(2, -11); g.fill(); break;
    case 'fork': stick(40, '#6a4a2a', 2.5); [-5, 0, 5].forEach(function (x) { g.strokeStyle = '#a0a0a8'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -16); g.lineTo(x, -24); g.stroke(); }); rect(-6, -17, 12, 2, '#7a7a80'); break;
    case 'scythe': stick(40, '#2a1a10', 2.5); g.fillStyle = '#12040a'; g.beginPath(); g.moveTo(0, -22); g.quadraticCurveTo(18, -24, 20, -8); g.quadraticCurveTo(14, -18, 0, -17); g.fill(); g.fillStyle = '#d0d0d8'; g.beginPath(); g.moveTo(1, -21); g.quadraticCurveTo(16, -22, 18, -10); g.quadraticCurveTo(12, -17, 1, -18); g.fill(); break;
    case 'guitar': stick(26, '#2a1a10', 3); blob(0, 8, 9, 10, '#c4121c'); blob(0, -2, 7, 7, '#c4121c'); blob(0, 4, 2.5, 2.5, '#12040a'); break;
    case 'flail': stick(14, '#3a2a1a', 3); g.strokeStyle = '#8a8a90'; g.setLineDash([2, 2]); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 4); g.quadraticCurveTo(10, -6, 4, -14); g.stroke(); g.setLineDash([]); blob(4, -17, 7, 7, '#3a3a40'); break;
    case 'dusters': g.rotate(0.78); rect(-14, -6, 28, 10, '#b8b8c0'); [-9, -3, 3, 9].forEach(function (x) { blob(x, -4, 3, 3, '#d8d8e0'); }); break;
  } g.restore(); }; }
function rIcon(r) { return function (g, W2) { var s = W2 / 48; g.save(); g.scale(s, s); g.strokeStyle = '#12040a'; g.lineWidth = 9; g.beginPath(); g.arc(24, 27, 11, 0, 6.3); g.stroke(); g.strokeStyle = r === 'blood' ? '#c4121c' : r === 'condom' ? '#f1e0b0' : r === 'tb' ? '#c86a1a' : '#ffe36a'; g.lineWidth = 5; g.beginPath(); g.arc(24, 27, 11, 0, 6.3); g.stroke(); g.fillStyle = '#12040a'; g.beginPath(); g.ellipse(24, 15, 7, 6, 0, 0, 6.3); g.fill(); g.fillStyle = r === 'blood' ? '#ff2630' : r === 'tb' ? '#f1e7d0' : r === 'pie' ? '#d8a050' : '#ffe36a'; g.beginPath(); g.ellipse(24, 15, 5, 4, 0, 0, 6.3); g.fill(); g.restore(); }; }
function flaskIcon(g, W2) { var s = W2 / 48; g.save(); g.scale(s, s); g.fillStyle = '#12040a'; g.fillRect(17, 6, 14, 8); g.beginPath(); g.ellipse(24, 30, 14, 14, 0, 0, 6.3); g.fill(); g.fillStyle = '#a8743a'; g.fillRect(19, 7, 10, 6); g.fillStyle = '#f1e0b0'; g.beginPath(); g.ellipse(24, 30, 12, 12, 0, 0, 6.3); g.fill(); g.fillStyle = '#fffbe8'; g.fillRect(17, 23, 4, 6); g.restore(); }
function equipMenu(c, tab) {
  tab = tab || 'w'; var back = c ? function () { candleMenu(c); } : KIT.closeMenu, tabs = [{ label: 'WEAPONS', on: tab === 'w', fn: function () { equipMenu(c, 'w'); } }, { label: 'RINGS', on: tab === 'r', fn: function () { equipMenu(c, 'r'); } }];
  if (!c) tabs.push({ label: 'SYSTEM', fn: sysMenu });
  var slots = tab === 'w' ? Object.keys(WEAPONS).map(function (w) { var W0 = WEAPONS[w], have = SV.wpns.indexOf(w) >= 0, K0 = KINDS[W0.c];
      if (!have) return { draw: wIcon(w), name: '???', desc: 'Not found yet. Chests, and TB\'s stall.', dis: true };
      return { draw: wIcon(w), name: W0.n, desc: W0.d, gold: SV.wpn === w, tag: SV.wpn === w ? 'E' : null, def: SV.wpn === w, act: SV.wpn === w ? 'EQUIPPED' : 'EQUIP', dis: SV.wpn === w,
        stats: [['Kind', W0.c.toUpperCase()], ['Hit', Math.round(W0.dmg * dmgK())], ['Heavy', Math.round(W0.heavy * dmgK())], ['Reach', W0.reach.toFixed(1) + ' m'], ['Stamina', W0.sta], ['Moves', K0.l.length + ' hit combo']], fn: function () { SV.wpn = w; persist(); equipMenu(c, 'w'); } }; })
    : [null].concat(Object.keys(RINGS)).map(function (r) { if (r === null) return { draw: function (g, W2) { var s = W2 / 48; g.save(); g.scale(s, s); g.strokeStyle = '#4a1a1c'; g.lineWidth = 3; g.beginPath(); g.arc(24, 24, 12, 0, 6.3); g.stroke(); g.beginPath(); g.moveTo(15, 33); g.lineTo(33, 15); g.stroke(); g.restore(); }, name: 'No Ring', desc: 'Bare fingers.', gold: !SV.ring, act: 'TAKE OFF', dis: !SV.ring, fn: function () { SV.ring = null; persist(); equipMenu(c, 'r'); } };
      var have = SV.rings.indexOf(r) >= 0; if (!have) return { draw: rIcon(r), name: '???', desc: 'Not found yet.', dis: true };
      return { draw: rIcon(r), name: RINGS[r].n, desc: RINGS[r].d, gold: SV.ring === r, tag: SV.ring === r ? 'E' : null, def: SV.ring === r, act: SV.ring === r ? 'WORN' : 'PUT ON', dis: SV.ring === r, fn: function () { SV.ring = r; if (P) P.hp = Math.min(P.hp, maxHp()); persist(); equipMenu(c, 'r'); } }; });
  if (tab === 'w') slots.push({ draw: flaskIcon, name: 'Cum Flask', desc: 'B drinks a swig: nearly half your health back. Candles fill it.', count: P ? P.flask + '/' + flaskMax() : flaskMax() });
  KIT.inv({ title: c ? 'Equipment' : AREAS[SV.area].name, cols: 4, min: 8, tabs: tabs, slots: slots, stats: [['LEVEL', SV.lvl], ['HEALTH', maxHp()], ['STAMINA', maxSta()], ['LOADS', SV.loads]], close: back });
}
function pauseMenu() { if (G.mode !== 'play') return; if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) {} equipMenu(null, 'w'); }
function sysMenu() { KIT.menu({ cls: 'clear', title: 'Paused', sub: AREAS[SV.area].name + ' · Level ' + SV.lvl, items: [{ label: 'CARRY ON', def: true, fn: KIT.closeMenu }, { label: 'HOW TO PLAY', fn: helpMenu }, { label: 'OPTIONS', fn: optsMenu }, { label: 'QUIT TO TITLE', fn: titleMenu }, { label: 'BACK', back: true, fn: function () { equipMenu(null, 'w'); } }] }); }
