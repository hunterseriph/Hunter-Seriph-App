/* ---------- update 178 (his ask: the airport was done badly, with a road going straight across the runway).
   The road that cut through the airport now goes round it: along the north side of the runway, down the east side and
   back along the south side, where a slip road goes to a drop-off in front of the terminal. This runs before the road
   graph is built (1b-core), so the traffic, the GPS and the map all use the new way round. The ground is repainted in
   1f-u178-airport.js. ---------- */
var AP178 = { start: 363, mid: 348, end: 287 };
(function () { var C = CITY, T = function (p) { return [p[0] / 4, p[1] / 4]; }; // the map's tiles are 4 m
  var e1 = C.edges.filter(function (e) { return e[0] === 363 && e[1] === 348; })[0], e2 = C.edges.filter(function (e) { return e[0] === 348 && e[1] === 287; })[0];
  if (!e1 || !e2 || C.nodes.length < 400) return; AP178.ok = 1;
  // node 348 (it sat on the apron) moves to the south-east corner of the airport
  C.nodes[348] = T([1566, 2774]);
  e1[3] = [[1288, 2486], [1316, 2495], [1400, 2497], [1500, 2497], [1546, 2498], [1560, 2508], [1566, 2524], [1566, 2600], [1566, 2700], [1566, 2752]].map(T);
  var nJ = C.nodes.length, nF = nJ + 1; C.nodes.push(T([1214, 2792])); C.nodes.push(T([966, 2700])); AP178.join = nJ; AP178.fore = nF;
  e2[1] = nJ; e2[3] = [[1560, 2788], [1546, 2792], [1460, 2792], [1360, 2792], [1260, 2792]].map(T); e2[4] = [];
  C.edges.push([nJ, 287, 3, [[1204, 2802], [1200, 2820]].map(T), []]); // on south as before
  C.edges.push([nJ, nF, 3, [[1160, 2792], [1080, 2792], [1062, 2786], [1054, 2772], [1054, 2716], [1048, 2704], [1036, 2700], [1000, 2700]].map(T), []]); // the slip road to the terminal
})();
