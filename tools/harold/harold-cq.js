/* HAROLD: redrawn in his own style (his reference: tools/harold/original.jpg): black top hat with a gold band, round gold
   glasses, a huge brown beard, laughing, red waistcoat with gold trim over a checked brown shirt, a teacup. */
HSPEC.harold = { skin: '#f2c8a0', top: '#7a1016', sleeve: '#a8642a', btm: '#2a1a12', shoe: '#1a1010', mouth: null, eye: '#1a1a2a',
  over: function (g, v) {
    if (v === 'd') { vPoly(g, [[12.4, 17.5], [15.6, 17.5], [15.2, 26.6], [12.8, 26.6]], '#c8843a'); vLine(g, 12.4, 17.6, 12.8, 26.4, 0.6, '#e0b040'); vLine(g, 15.6, 17.6, 15.2, 26.4, 0.6, '#e0b040'); vLine(g, 9.8, 23, 12.6, 24.2, 0.5, '#ffe36a'); }
    else if (v === 's') vLine(g, 16.8, 17.8, 17.2, 26.4, 0.6, '#e0b040');
    vEll(g, 8.4, 24.2, 2.2, 1.9, '#f2c8a0'); vEll(g, 19.6, 24.2, 2.2, 1.9, '#f2c8a0'); },
  hair: function (g, v) {
    var H = '#7a4a24', B = '#8a5226', BH = '#a86a34';
    if (v === 'u') { vEll(g, 14, 10.6, 5.6, 5.6, H); vEll(g, 8.6, 14, 1.8, 3, B); vEll(g, 19.4, 14, 1.8, 3, B); return; }
    if (v === 's') { vEll(g, 11.6, 9.6, 2.6, 3.4, H); vPoly(g, [[12, 11.6], [19.4, 12.4], [20, 15.6], [17.6, 20.6], [12.6, 19.6], [11, 15]], B); vEll(g, 16, 17, 2.4, 1.8, BH); vEll(g, 18.6, 13.6, 1.8, 0.9, H); return; }
    vEll(g, 8.6, 10, 1.9, 2.8, H); vEll(g, 19.4, 10, 1.9, 2.8, H);
    vPoly(g, [[8.4, 11.4], [19.6, 11.4], [20.4, 15], [18.8, 19.8], [14, 22.6], [9.2, 19.8], [7.6, 15]], B); vEll(g, 14, 18, 3.4, 2.2, BH);
    vEll(g, 12, 13.4, 2.6, 1, H); vEll(g, 16, 13.4, 2.6, 1, H); },
  top2: function (g, v) {
    var cx = v === 's' ? 14.6 : 14;
    vEll(g, cx, 6, 7.8, 1.7, '#1a1418'); vPoly(g, [[cx - 4.6, 6], [cx + 4.6, 6], [cx + 4.2, 0], [cx - 4.2, 0]], '#221c22');
    vPoly(g, [[cx - 4.6, 5.6], [cx + 4.6, 5.6], [cx + 4.5, 3.8], [cx - 4.5, 3.8]], '#c8902a'); vEll(g, cx + 2.4, 4.7, 0.9, 0.8, '#7a3aba'); vLine(g, cx - 3.4, 0.6, cx - 3.6, 3.6, 0.6, '#4a404a'); },
  prop: function (g, v) { var x = v === 's' ? 17.4 : 21.6; vPoly(g, [[x, 22], [x + 4, 22], [x + 4.6, 26], [x - 0.6, 26]], '#f6f0e0'); vLine(g, x + 4, 23, x + 6, 23.6, 0.8, '#f6f0e0'); vEll(g, x + 2, 21.8, 2, 0.7, '#c8f0a0'); vLine(g, x + 0.6, 24, x + 4, 24, 0.5, '#c4121c'); },
  px: function (g, v, dead) {
    var G = '#e0b040';
    if (v === 'd') {
      [10, 15].forEach(function (x) { px1(g, G, x, 9, 3, 1); px1(g, G, x, 12, 3, 1); px1(g, G, x - 1, 10, 1, 2); px1(g, G, x + 3, 10, 1, 2); });
      px1(g, '#6a3a1a', 10, 8, 3, 1); px1(g, '#6a3a1a', 15, 8, 3, 1);
      if (!dead) { px1(g, '#3a0a0a', 12, 15, 4, 2); px1(g, '#fff6e8', 12, 15, 4, 1); }
      px1(g, G, 12, 21); px1(g, G, 12, 23); px1(g, G, 15, 21); px1(g, G, 15, 23);
    } else if (v === 's') { px1(g, G, 17, 9, 3, 1); px1(g, G, 17, 12, 3, 1); px1(g, G, 20, 10, 1, 2); px1(g, '#6a3a1a', 17, 8, 3, 1); if (!dead) { px1(g, '#3a0a0a', 18, 15, 2, 2); px1(g, '#fff6e8', 18, 15, 2, 1); } }
  } };
if (typeof vecCache === 'object') Object.keys(vecCache).forEach(function (k) { if (k.indexOf('harold') === 0) delete vecCache[k]; });
window.__cqspr = function (k, v, d) { return k === 'spermaid' || k === 'greebo' ? bigSpr(k, v, d) : vecSprite(k, v, d); };
