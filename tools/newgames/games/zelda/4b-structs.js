/* things drawn in particular rooms (update 135: the land's buildings and landmarks are sprites from tiles.py now) */
var INSIDE_EXTRA = {
  club: function () { SV.chal.forEach(function (d, n) { chalice((13 + n * 1.2) * TS, 1.2 * TS + 6, CHALCOL[d]); }); },
  arcade: function () { [2, 4, 6, 13, 15, 17].forEach(function (i, n) { var on = Math.floor(G.t * 3 + n) % 2; R(on ? 'rgba(255,38,48,0.35)' : 'rgba(74,223,255,0.3)', i * TS + 6, 2 * TS + 5, 12, 5); }); },
  pulsar: function () { var b = Math.abs(Math.sin(G.t * 6)); [[2, 2], [3, 2], [16, 2], [17, 2]].forEach(function (p) { var g = KIT.ctx; g.fillStyle = 'rgba(74,223,255,' + (0.25 + b * 0.3) + ')'; g.beginPath(); g.arc((p[0] + 0.5) * TS, (p[1] + 0.7) * TS, 5 + b * 2, 0, 6.3); g.fill(); }); for (var k = 0; k < 8; k++) R(['#ff2630', '#ffe36a', '#4adfff'][k % 3], (8 + k * 0.5) * TS, 6.8 * TS - (Math.abs(Math.sin(G.t * 5 + k)) * 14), 8, 2); }
};
