// node bake.js -> models.js: Spermabonk's models baked out of Cum City Nights (the existing ones as they are, the new ones
// built there with the same kit), one small atlas of only the tiles they use, compact vertex data.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const DIR = __dirname, OUT = path.join(DIR, 'models.js');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext({ viewport: { width: 900, height: 520 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.route(/^https?:/, r => r.abort()); await p.goto('file://' + path.resolve(DIR, '../../../../www/games/cum-city-nights.html')); await p.waitForTimeout(1500);
  await p.addScriptTag({ content: fs.readFileSync(path.join(DIR, 'bake-shim.js'), 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(path.join(DIR, 'm-new.js'), 'utf8') });
  if (errs.length) { console.log('LOAD ERR', errs); }
  const res = await p.evaluate(() => {
    buildAtlas(); buildCityRigs(); M3.build();
    var LIST = []; // [name, Float32 16/vertex, tags 4/vertex or null, scale]
    function addM(name, mesh, tagFn) { if (!mesh || !mesh.keep) { LIST.push([name, null]); return; } var t = mesh.keepT && mesh.keepT.length === mesh.keep.length / 4 ? mesh.keepT : null; LIST.push([name, mesh.keep, t, tagFn || null]); }
    // matrices as drawRig makes them (rest pose)
    function xfm(M, d, out) { for (var i = 0; i < d.length; i += 16) { var x = d[i], y = d[i + 1], z = d[i + 2], nx = d[i + 12], ny = d[i + 13], nz = d[i + 14];
        out.push(M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14], d[i + 3], d[i + 4], d[i + 5], d[i + 6], d[i + 7], d[i + 8], d[i + 9], d[i + 10], d[i + 11],
          M[0] * nx + M[4] * ny + M[8] * nz, M[1] * nx + M[5] * ny + M[9] * nz, M[2] * nx + M[6] * ny + M[10] * nz, d[i + 15]); } }
    var RIGL = ['cumhead', 'spermaid', 'greebo', 'pulsar', 'ali', 'amy', 'tb', 'saba', 'joff', 'potbelly', 'laboozie', 'pieclown', 'knight2', 'zombie2', 'goon', 'bonjo', 't', 'kaya', 'elden', 'beeb'], META = {};
    RIGL.forEach(function (n) { var r = RIGS[n]; if (!r) { META[n] = null; return; } var D = r.D, S = r.P, parts = {};
      
      META[n] = { D: D, eyeY: r.eyeY, drip: r.drip ? 1 : 0, dripAt: r.dripAt || null, parts: parts };
      // the merged one for crowds: legs, arms and head tagged to swing in the shader
      var hipY = D.lu + D.ll, body = MD(0, 0, 0, 0, 0, 0, 1), hips = MM(body, MD(0, hipY, 0, 0, 0, 0)), tor = MM(hips, MD(0, 0.02, 0, 0, 0, 0)), head = MM(tor, MD(0, D.tor + D.neck, 0, 0, 0, 0));
      var v = [], tg = []; function put(mesh, M, tag, piv) { if (!mesh || !mesh.keep) return; var n0 = v.length; xfm(M, mesh.keep, v); for (var i = n0; i < v.length; i += 16) tg.push(tag, piv[0], piv[1], piv[2]); }
      put(S.hips, hips, 0, [0, 0, 0]); put(S.torso, tor, 0, [0, 0, 0]); put(S.head, head, 8, [0, hipY + D.tor + D.neck, 0]);
      if (S.drip && r.drip) { var da = r.dripAt || [0.04, 0.95, -0.1]; put(S.drip, MM(head, MD(da[0], da[1], da[2], 0, 0, 0)), 8, [0, hipY + D.tor + D.neck, 0]); }
      [0, 1].forEach(function (k) { var sd = k ? 'R' : 'L', sx = k ? -D.shW : D.shW, up = MM(tor, MD(sx, D.tor * 0.86, 0, 0, 0, k ? -0.08 : 0.08)), lo = MM(up, MD(0, -D.au, 0, 0, -0.15, 0)), sp = [sx, hipY + 0.02 + D.tor * 0.86, 0];
        put(S['au' + sd], up, k ? 4 : 3, sp); put(S['al' + sd], lo, k ? 4 : 3, sp); if (k === 1 && S.weapon) put(S.weapon, MM(lo, MD(0, -D.al - D.hand * 0.7, 0.02, 0, Math.PI, 0)), 4, sp); if (k === 1 && S.bottle) put(S.bottle, MM(lo, MD(0, -D.al - D.hand * 0.7, 0.02, 0, Math.PI, 0)), 4, sp);
        var hx = k ? -D.hipW : D.hipW, th = MM(hips, MD(hx, -0.02, 0, 0, 0, 0)), hp = [hx, hipY, 0]; put(S['lu' + sd], th, k ? 2 : 1, hp); put(S['ll' + sd], MM(th, MD(0, -D.lu, 0, 0, 0.06, 0)), k ? 2 : 1, hp); });
      LIST.push(['c_' + n, new Float32Array(v), new Float32Array(tg)]); });
    addM('steve', RIGS.steveM);
    // Sir Johnathan: legs, tail tagged
    addM('cat', HOM3D.cat().mesh, function (x, y, z) { if (y < 0.42 && Math.abs(z) > 0.2) return [(x > 0) === (z > 0) ? 1 : 2, 0, 0.42, z > 0 ? 0.4 : -0.4]; if (z < -0.55 && y > 0.4) return [7, 0, 0.6, -0.55]; if (z > 0.35 && y > 0.6) return [8, 0, 0.7, 0.4]; return null; });
    var BR = Object.keys(HOM3D.PAL || {}); if (!BR.length) BR = ['gloop', 'guard', 'ember', 'frost', 'volt', 'blood', 'leech', 'medic', 'scout', 'titan', 'goldie'];
    BR.forEach(function (br) { ['adult'].forEach(function (st) { try { var h = HOM3D.get(br, st); addM('hom_' + br + '_' + st, h.mesh, function (x, y, z) { if (y < 0.16 && Math.abs(x) > 0.05) return [x > 0 ? 1 : 2, x, 0.18, 0]; return null; }); } catch (e) {} }); });
    ['rat', 'bat', 'blob', 'jelly', 'balloon', 'wasp', 'imp', 'pig', 'kraken', 'hotload'].forEach(function (k) { var fn = null;
      if (k === 'bat') fn = function (x, y, z) { return Math.abs(x) > 0.14 ? [x > 0 ? 5 : 6, x > 0 ? 0.12 : -0.12, y, 0] : null; };
      if (k === 'wasp') fn = function (x, y, z) { return Math.abs(x) > 0.12 && y > 0.1 ? [x > 0 ? 5 : 6, x > 0 ? 0.1 : -0.1, y, 0] : null; };
      if (k === 'imp') fn = function (x, y, z) { return Math.abs(x) > 0.22 ? [x > 0 ? 5 : 6, x > 0 ? 0.2 : -0.2, y, 0] : null; };
      try { addM('f_' + k, foeMesh(k), fn); } catch (e) { LIST.push(['f_' + k, null]); } });
    ['drop', 'pill', 'bag'].forEach(function (k) { try { addM('p_' + k, propMesh(k)); } catch (e) { LIST.push(['p_' + k, null]); } });
    // city street things and trees
    function sf(name, fn) { var m = new R3.Mesh(); fn(m); addM(name, m.upload()); }
    sf('city_tree', function (m) { tree(m, 0, 0, 0, false, 1); }); sf('city_pine', function (m) { tree(m, 0, 0, 0, true, 1); }); sf('city_dead', function (m) { tree(m, 0, 0, 0, false, 1, true); });
    ['lamp', 'bench', 'bin', 'planter'].forEach(function (k) { sf('city_' + k, function (m) { var g = new R3.Mesh(); try { sfDraw(m, k, 0, 0, 0, 0, 0, g); } catch (e) { try { sfDraw(m, k, 0, 0, 0, 0); } catch (e2) {} } }); });
    // the big places of the city, for scenery and the skyline (rides, the circus tent, the castle, the volcano...)
    ['ferris', 'bigtop', 'carousel', 'castle', 'volcano', 'chimney', 'statue', 'stones', 'chapel', 'windmill', 'coaster'].forEach(function (k) { try { var pp = { k: k, x: 0, z: 0, h: 0, a: 0, r: 30 }, o = LM(pp); LMBUILD[k](o, pp); var v = [];
      var I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; function put(d, M, glow) { if (!d) return; var n0 = v.length; xfm(M, d, v); if (glow) for (var i = n0; i < v.length; i += 16) v[i + 15] = 1; }
      put(o.m.a ? new Float32Array(o.m.a) : o.m.keep, I, 0); put(o.glow.a ? new Float32Array(o.glow.a) : o.glow.keep, I, 1); (o.parts || []).forEach(function (q) { put(q.m.keep || (q.m.a && new Float32Array(q.m.a)), q.f ? q.f(0) : I, 0); });
      LIST.push(['lm_' + k, new Float32Array(v), null]); } catch (e) { LIST.push(['lm_' + k, null]); } });
    Object.keys(NEWM).forEach(function (k) { addM(k, NEWM[k]); });
    // the atlas: only the tiles in use, packed into a small sheet
    var TA = ATL.canvas.width, rects = {}, order = [];
    LIST.forEach(function (q) { var d = q[1]; if (!d) return; for (var i = 0; i < d.length; i += 16) { var key = d[i + 5] + ',' + d[i + 6] + ',' + d[i + 7] + ',' + d[i + 8]; if (!(key in rects)) { rects[key] = -1; order.push(key); } } });
    var tiles = order.map(function (k) { var a = k.split(',').map(Number); return { k: k, x: Math.round(a[0] * TA), y: Math.round(a[1] * TA), w: Math.round(a[2] * TA), h: Math.round(a[3] * TA) }; });
    tiles.sort(function (a, b) { return b.h - a.h; }); var SW = 1024, x = 0, y = 0, rowH = 0;
    tiles.forEach(function (t) { if (x + t.w > SW) { x = 0; y += rowH; rowH = 0; } t.nx = x; t.ny = y; x += t.w; rowH = Math.max(rowH, t.h); }); var SH = 1; while (SH < y + rowH) SH *= 2;
    var cv = document.createElement('canvas'); cv.width = SW; cv.height = SH; var g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    var TT = []; tiles.forEach(function (t, i) { g.drawImage(ATL.canvas, t.x, t.y, t.w, t.h, t.nx, t.ny, t.w, t.h); rects[t.k] = i; TT.push([t.nx / SW, t.ny / SH, t.w / SW, t.h / SH]); });
    // pack the meshes: unique vertices, 16-bit indices
    var bytes = [], head = [], miss = [];
    function pushArr(ta) { var u8 = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength); var o = 0; bytes.forEach(function (bb) { o += bb.length; }); bytes.push(u8.slice()); return o; }
    LIST.forEach(function (q) { var name = q[0], d = q[1], tg = q[2], fn = q[3]; if (!d) { miss.push(name); return; }
      var map = {}, uv = [], idx = [], mx = 0.001; for (var i = 0; i < d.length; i += 16) mx = Math.max(mx, Math.abs(d[i]), Math.abs(d[i + 1]), Math.abs(d[i + 2]));
      var ps = mx / 32000, PV = [], tagT = {}, nt = 0, tagI = [];
      for (var j = 0, n = d.length / 16; j < n; j++) { var i2 = j * 16, t = tg ? [tg[j * 4], tg[j * 4 + 1], tg[j * 4 + 2], tg[j * 4 + 3]] : null; if (fn) { var r = fn(d[i2], d[i2 + 1], d[i2 + 2]); if (r) t = r; }
        var tk = t && t[0] ? t.join(',') : '0'; if (!(tk in tagT)) { tagT[tk] = nt++; tagI.push(t && t[0] ? t : [0, 0, 0, 0]); }
        var rec = [Math.round(d[i2] / ps), Math.round(d[i2 + 1] / ps), Math.round(d[i2 + 2] / ps), Math.round(d[i2 + 3] * 256), Math.round(d[i2 + 4] * 256), rects[d[i2 + 5] + ',' + d[i2 + 6] + ',' + d[i2 + 7] + ',' + d[i2 + 8]],
          Math.min(255, Math.round(d[i2 + 9] * 255)), Math.min(255, Math.round(d[i2 + 10] * 255)), Math.min(255, Math.round(d[i2 + 11] * 255)), Math.round(d[i2 + 12] * 127), Math.round(d[i2 + 13] * 127), Math.round(d[i2 + 14] * 127), Math.min(255, Math.round(d[i2 + 15] * 255)), tagT[tk]];
        var key = rec.join(','); var at = map[key]; if (at === undefined) { at = map[key] = PV.length; PV.push(rec); } idx.push(at); }
      var nv = PV.length, A16 = new Int16Array(nv * 6), A8 = new Uint8Array(nv * 8);
      PV.forEach(function (r, k) { A16.set([r[0], r[1], r[2], Math.max(-32768, Math.min(32767, r[3])), Math.max(-32768, Math.min(32767, r[4])), r[5]], k * 6); A8.set([r[6], r[7], r[8], r[9] & 255, r[10] & 255, r[11] & 255, r[12], r[13]], k * 8); });
      var I = nv > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
      var o16 = pushArr(A16), o8 = pushArr(A8), oi = pushArr(I);
      head.push({ n: name, nv: nv, ni: idx.length, ps: ps, o16: o16, o8: o8, oi: oi, i32: nv > 65535 ? 1 : 0, tags: tagI }); });
    var total = 0; bytes.forEach(function (bb) { total += bb.length; }); var all = new Uint8Array(total), o = 0; bytes.forEach(function (bb) { all.set(bb, o); o += bb.length; });
    var s = ''; for (var k = 0; k < all.length; k += 32768) s += String.fromCharCode.apply(null, all.subarray(k, k + 32768));
    return { atlas: cv.toDataURL('image/png'), tiles: TT, head: head, bin: btoa(s), meta: META, miss: miss, size: all.length, tw: SW, th: SH };
  });
  fs.writeFileSync(OUT, '/* Spermabonk models: baked from the 3D kit the other games share (tools/newgames/games/bonk/bake.js) */\nvar BONKM = ' + JSON.stringify({ atlas: res.atlas, tiles: res.tiles, head: res.head, bin: res.bin, meta: res.meta }) + ';\n');
  console.log('meshes', res.head.length, 'missing', res.miss, 'bin', res.size, 'atlas', res.tw + 'x' + res.th, 'file', fs.statSync(OUT).size);
  res.head.forEach(h => { if (h.nv > 3000) console.log(' big', h.n, h.nv, h.ni); });
  console.log('ERR', errs.slice(0, 5)); await b.close(); })();
