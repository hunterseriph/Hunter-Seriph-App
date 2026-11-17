/* update 157: some road-graph edges run where the map has no road any more (blocks and yards were laid over them at
   the docks, Spunk Brain and Ejaculand), so traffic drove through buildings and rides and a taxi dropped him on the
   swings. An edge with under 60% of its length on road tiles is switched off (`E.off`): no traffic, no GPS, and
   nearestRoad never returns it. */
(function () { var n = 0; RE.forEach(function (E) { var k = 0, on = 0; for (var s = 2; s < E.len - 2; s += 3) { var q = edgeAt(E, s, false, 0), t = kAt(q.x, q.z); k++; if (t === K_ROAD || t === K_BRIDGE) on++; } if (k && on / k < 0.6) { E.off = 1; n++; } }); window.__offEdges = n; })();
