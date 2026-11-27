/* =====================================================================================================
   SPERMABONK 3D (his ask: Spermaid Survivors in 3D, the way Megabonk is Vampire Survivors in 3D). The whole of
   Spermaid Survivors runs underneath unchanged: places, characters, weapons, charms, foes, big foes, friends, the
   Sanctum, the menus. This part draws it in 3D. The 2D world (x, y) is the ground (X, Z), with hills; the camera
   follows behind you and turns with the right stick, the mouse, Q / E or LB / RB.
   The models are the ones the other 3D games already have (Cumhead, Spermaid, Greebo, Pulsar, Ali, Amy, TB, the friends,
   Laboozie, Steve, Sir Johnathan, the homunculi, the Pie Clown, the knight, the zombie, the Blum goon, the rat, bat,
   cream blob, jelly, Steve balloon, wasp, imp, the Piggy, the Kraken, Hot Load), baked out of the shared 3D kit with
   the same atlas and colours (models.js); only the ones no game had yet were built new, with the same kit.
   0-gl: the renderer. Every model is drawn once a frame for all its copies (instancing); legs, arms, wings, tails and
   heads swing in the vertex shader. Lit like the other games: ambient, a moon, rim light; fog; 15-bit dither.
   ===================================================================================================== */
var B3 = (function () {
  'use strict';
  var view = document.getElementById('view'), cv = document.createElement('canvas'); cv.id = 'gl';
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;image-rendering:crisp-edges;background:#000';
  view.insertBefore(cv, document.getElementById('c'));
  var gl = null; try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, premultipliedAlpha: false, powerPreference: 'high-performance' }) || cv.getContext('experimental-webgl'); } catch (e) {}
  var IA = gl && gl.getExtension('ANGLE_instanced_arrays'), U32 = gl && gl.getExtension('OES_element_index_uint'), OK = !!(gl && IA), UNIT = 22;
  function persp(fov, ar, n, f) { var t = 1 / Math.tan(fov / 2), nf = 1 / (n - f); return [t / ar, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
  function look(e, c, u) { var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    var xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l; var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]; }
  function mul(a, b) { var o = new Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  var DITHER = 'float b2(vec2 a){a=floor(a);return fract(a.x/2.0+a.y*a.y*0.75);} float b4(vec2 a){return b2(0.5*a)*0.25+b2(a);}';
  var VS = [
    'attribute vec3 aP; attribute vec2 aU; attribute vec4 aT; attribute vec3 aC; attribute vec3 aN; attribute float aG; attribute vec4 aK;',
    'attribute vec4 iA; attribute vec4 iB; attribute vec4 iC; attribute vec4 iD;',
    'uniform mat4 uVP; uniform vec3 uEye; uniform vec2 uSnap; uniform float uUnit;',
    'varying vec2 vU; varying vec4 vT; varying vec3 vC; varying vec3 vN; varying float vG; varying float vF; varying vec3 vV; varying vec4 vD; varying float vFl; varying float vA;',
    'mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}',
    'mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}',
    'mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}',
    'void main(){',
    ' vec3 p=aP; vec3 n=aN; float id=aK.x; vec3 pv=aK.yzw; float ph=iB.y; float am=iC.z;',
    ' if(id>0.5){ mat3 R=mat3(1.);',
    '  if(id<1.5) R=rx(sin(ph)*0.7*am); else if(id<2.5) R=rx(-sin(ph)*0.7*am);',
    '  else if(id<3.5) R=rx(-sin(ph)*0.55*am); else if(id<4.5) R=rx(sin(ph)*0.55*am);',
    '  else if(id<5.5) R=rz(sin(ph*1.6)*0.85); else if(id<6.5) R=rz(-sin(ph*1.6)*0.85);',
    '  else if(id<7.5) R=ry(sin(ph*0.7)*0.45); else if(id<8.5) R=rx(sin(ph*2.0)*0.05*am+sin(ph*0.37)*0.04)*ry(sin(ph*0.23)*0.12);',
    '  else if(id<9.5) R=ry(ph*1.5); else if(id<10.5) R=rx(sin(ph+pv.x*6.)*0.35*(0.4+am));',
    '  else if(id<11.5) R=rz(sin(ph*0.5)*0.25+0.1); else R=rz(-sin(ph*0.5)*0.25-0.1);',
    '  p=R*(p-pv)+pv; n=R*n; }',
    ' float fw=mod(iD.w,4.); float zl=floor(iD.w/4.+0.001)/16.; p.x*=iC.x; p.z*=(zl>0.?zl:iC.x); p.y*=iC.y; p*=iB.x*uUnit;',
    ' mat3 T=rx(iC.w); p=T*p; n=T*n;',
    ' float c=cos(iA.w), s=sin(iA.w); p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z); n=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);',
    ' vec3 w=p+iA.xyz; vec4 g=uVP*vec4(w,1.); g.xy=floor(g.xy/g.w*uSnap+0.5)/uSnap*g.w; gl_Position=g;',
    ' vN=normalize(n+vec3(0.,0.0001,0.)); vU=aU; vT=aT; vC=aC; vG=aG; vF=g.w; vV=uEye-w; vD=vec4(iD.rgb,fw); vFl=iB.z; vA=iB.w;',
    '}'].join('\n');
  var FS = ['precision mediump float;',
    'uniform sampler2D uTex; uniform vec3 uFog; uniform vec2 uFogR; uniform vec3 uAmb; uniform vec3 uSun; uniform vec3 uSunC; uniform float uRim; uniform float uUnlit; uniform vec3 uLP; uniform vec3 uLC; uniform float uLR;',
    'varying vec2 vU; varying vec4 vT; varying vec3 vC; varying vec3 vN; varying float vG; varying float vF; varying vec3 vV; varying vec4 vD; varying float vFl; varying float vA;', DITHER,
    'void main(){',
    ' vec4 t=texture2D(uTex, vT.xy+fract(vU)*vT.zw); if(t.a<0.5) discard;',
    ' vec3 base=t.rgb*vC*2.0*vD.rgb; vec3 c;',
    ' float fw=mod(vD.a+0.01,2.)-0.01; if(fw>0.5) c=vD.rgb; else {',
    '  vec3 L=uAmb+vec3(vG)+uSunC*max(0.,dot(vN,uSun));',
    '  float fr=1.0-max(0.0,dot(normalize(vN),normalize(vV))); L*=0.65+0.35*smoothstep(-0.7,0.6,vN.y); L+=uRim*fr*fr*(uAmb*3.0+vec3(0.06,0.02,0.02));',
    '  c=base*L; }',
    ' c=mix(c,vec3(1.,0.95,0.88),vFl);',
    ' float f=clamp((vF-uFogR.x)/(uFogR.y-uFogR.x),0.,1.); if(vD.a<1.5) c=mix(c,uFog,f*f*(3.-2.*f));',
    ' c=floor(clamp(c,0.,1.)*31.+b4(gl_FragCoord.xy))/31.;',
    ' gl_FragColor=vec4(c,vA);',
    '}'].join('\n');
  // the ground: a grid that follows the camera, raised by the same hills the game uses, wearing the place's floor
  var VS_GR = ['attribute vec2 aXZ; uniform mat4 uVP; uniform vec2 uOff; uniform vec2 uSnap; uniform vec4 uH; uniform vec3 uSun; uniform vec3 uSunC; uniform vec3 uAmb;',
    'varying vec2 vUV; varying float vF; varying vec3 vL; varying float vS;',
    'uniform vec4 uP[12]; uniform float uPw[12];',
    'float F(vec2 q){ float m=0.; for(int i=0;i<12;i++){ vec4 p=uP[i]; if(p.w<=0.) continue; vec2 d=abs(q-p.xy); float w=uPw[i]; float r=w<20.?sqrt(sqrt(d.x*d.x*d.x*d.x+d.y*d.y*d.y*d.y)):length(d); float t=clamp((p.z-r)/w,0.,1.); m=max(m,p.w*t*t*(3.-2.*t)); } return m; }',
    'float H(vec2 q){ return uH.x*(sin(q.x*0.0041+uH.z)*cos(q.y*0.0037+uH.w)+0.55*sin(q.x*0.0093+q.y*0.0071+uH.z*2.)+0.3*cos(q.x*0.017-q.y*0.013))*uH.y+F(q); }',
    'void main(){ vec2 q=aXZ+uOff; float h=H(q); vec4 g=uVP*vec4(q.x,h,q.y,1.); g.xy=floor(g.xy/g.w*uSnap+0.5)/uSnap*g.w; gl_Position=g;',
    ' vec3 n=normalize(vec3(H(q-vec2(6.,0.))-H(q+vec2(6.,0.)),12.,H(q-vec2(0.,6.))-H(q+vec2(0.,6.)))); vL=uAmb*1.25+uSunC*max(dot(n,uSun),0.)*0.75; vS=clamp((0.9-n.y)*3.,0.,1.);',
    ' vUV=q/128.; vF=g.w; }'].join('\n');
  var FS_GR = ['precision mediump float; varying vec2 vUV; varying float vF; varying vec3 vL; varying float vS; uniform sampler2D uT; uniform vec3 uFog; uniform vec2 uFogR; uniform float uBright; uniform vec3 uLP; uniform vec3 uLC; uniform float uLR;', DITHER,
    'void main(){ vec3 c=texture2D(uT,vUV).rgb*uBright*vL; c=mix(c,c*vec3(0.42,0.38,0.36),vS); float f=clamp((vF-uFogR.x)/(uFogR.y-uFogR.x),0.,1.); c=mix(c,uFog,f*f*(3.-2.*f)); c=floor(clamp(c,0.,1.)*31.+b4(gl_FragCoord.xy))/31.; gl_FragColor=vec4(c,1.); }'].join('\n');
  function prog(vs, fs) { function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var o = { p: p, a: {}, u: {} }, i, n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (i = 0; i < n; i++) { var a = gl.getActiveAttrib(p, i); o.a[a.name] = gl.getAttribLocation(p, a.name); }
    n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (i = 0; i < n; i++) { var u = gl.getActiveUniform(p, i); o.u[u.name] = gl.getUniformLocation(p, u.name); } return o; }
  var PM, PG; if (OK) { try { PM = prog(VS, FS); PG = prog(VS_GR, FS_GR); } catch (e) { OK = false; console.error(e); } }
  /* ---------- the models (from models.js) ---------- */
  var MODELS = {}, ATEX = null, READY = false, onReady = [];
  function load() { if (!OK || !window.BONKM) return; var B = BONKM, raw = atob(B.bin), bin = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) bin[i] = raw.charCodeAt(i);
    B.head.forEach(function (h) { var A16 = new Int16Array(bin.buffer.slice(h.o16, h.o16 + h.nv * 12)), A8 = new Uint8Array(bin.buffer.slice(h.o8, h.o8 + h.nv * 8)), f = new Float32Array(h.nv * 20), lo = 1e9, hi = -1e9, rad = 0;
      for (var v = 0; v < h.nv; v++) { var a = v * 6, b = v * 8, o = v * 20, T = B.tiles[A16[a + 5]] || [0, 0, 0.01, 0.01], K = h.tags[A8[b + 7]] || [0, 0, 0, 0];
        f[o] = A16[a] * h.ps; f[o + 1] = A16[a + 1] * h.ps; f[o + 2] = A16[a + 2] * h.ps; f[o + 3] = A16[a + 3] / 256; f[o + 4] = A16[a + 4] / 256; f[o + 5] = T[0]; f[o + 6] = T[1]; f[o + 7] = T[2]; f[o + 8] = T[3];
        f[o + 9] = A8[b] / 255; f[o + 10] = A8[b + 1] / 255; f[o + 11] = A8[b + 2] / 255; f[o + 12] = ((A8[b + 3] << 24) >> 24) / 127; f[o + 13] = ((A8[b + 4] << 24) >> 24) / 127; f[o + 14] = ((A8[b + 5] << 24) >> 24) / 127; f[o + 15] = A8[b + 6] / 255;
        f[o + 16] = K[0]; f[o + 17] = K[1]; f[o + 18] = K[2]; f[o + 19] = K[3]; if (f[o + 1] > hi) hi = f[o + 1]; if (f[o + 1] < lo) lo = f[o + 1]; var rr = Math.max(Math.abs(f[o]), Math.abs(f[o + 2])); if (rr > rad) rad = rr; }
      var I = h.i32 ? new Uint32Array(bin.buffer.slice(h.oi, h.oi + h.ni * 4)) : new Uint16Array(bin.buffer.slice(h.oi, h.oi + h.ni * 2));
      var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW); var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, I, gl.STATIC_DRAW);
      MODELS[h.n] = { vb: vb, ib: ib, ni: h.ni, i32: h.i32, top: hi, bot: lo, rad: rad, inst: [], tinst: [], add: [] }; });
    var img = new Image(); img.onload = function () { ATEX = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      READY = true; onReady.forEach(function (f) { f(); }); }; img.src = B.atlas; }
  /* ---------- per-frame drawing ---------- */
  var IB = OK ? gl.createBuffer() : null, IDATA = new Float32Array(16 * 2048), cam = { VP: null, eye: [0, 0, 0] }, LOOK = null;
  // add(model, x, y, z, yaw, o): o = { sc, ph (walk phase), fl (flash), a (alpha), sx, sy (squash), am (how much it moves its limbs), tilt, tint: [r,g,b], unlit, add (glow) }
  function add(name, x, y, z, yaw, o) { var m = MODELS[name]; if (!m) return false; o = o || {}; var a = o.a === undefined ? 1 : o.a, t = o.tint || W1;
    var q = o.glow ? m.add : (a < 0.99 || o.unlit) ? m.tinst : m.inst;
    q.push(x, y, z, yaw || 0, o.sc || 1, o.ph || 0, o.fl || 0, a, o.sx || 1, o.sy || 1, o.am === undefined ? 1 : o.am, o.tilt || 0, t[0], t[1], t[2], (o.unlit ? 1 : 0) + (o.unlit === 2 ? 2 : 0) + (o.len ? 4 * Math.max(1, Math.round(o.len * 16)) : 0)); return true; }
  var W1 = [1, 1, 1];
  function bindMesh(m) { var st = 80; gl.bindBuffer(gl.ARRAY_BUFFER, m.vb); var A = PM.a;
    [['aP', 3, 0], ['aU', 2, 12], ['aT', 4, 20], ['aC', 3, 36], ['aN', 3, 48], ['aG', 1, 60], ['aK', 4, 64]].forEach(function (q) { var L = A[q[0]]; if (L === undefined || L < 0) return; gl.enableVertexAttribArray(L); gl.vertexAttribPointer(L, q[1], gl.FLOAT, false, st, q[2]); });
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ib); }
  function drawList(m, list, unlitPass) { if (!list.length) return; bindMesh(m); var n = list.length / 16, off = 0;
    while (off < n) { var k = Math.min(n - off, 2048); IDATA.set(list.subarray ? list.subarray(off * 16, (off + k) * 16) : list.slice(off * 16, (off + k) * 16)); gl.bindBuffer(gl.ARRAY_BUFFER, IB); gl.bufferData(gl.ARRAY_BUFFER, IDATA.subarray(0, k * 16), gl.STREAM_DRAW);
      ['iA', 'iB', 'iC', 'iD'].forEach(function (nm, i) { var L = PM.a[nm]; if (L === undefined || L < 0) return; gl.enableVertexAttribArray(L); gl.vertexAttribPointer(L, 4, gl.FLOAT, false, 64, i * 16); IA.vertexAttribDivisorANGLE(L, 1); });
      IA.drawElementsInstancedANGLE(gl.TRIANGLES, m.ni, m.i32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0, k); off += k; }
    ['iA', 'iB', 'iC', 'iD'].forEach(function (nm) { var L = PM.a[nm]; if (L !== undefined && L >= 0) IA.vertexAttribDivisorANGLE(L, 0); }); }
  /* ---------- the ground ---------- */
  var GRID = 90, GS = 14, GB = null, GN = 0, TEX = {};
  if (OK) { var g = []; for (var j = 0; j < GRID; j++) for (var i = 0; i < GRID; i++) { var x0 = (i - GRID / 2) * GS, z0 = (j - GRID / 2) * GS, x1 = x0 + GS, z1 = z0 + GS; g.push(x0, z0, x1, z1, x1, z0, x0, z0, x0, z1, x1, z1); }
    GB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, GB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g), gl.STATIC_DRAW); GN = g.length / 2; }
  function texOf(key, canvas) { if (TEX[key]) return TEX[key]; var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); return (TEX[key] = t); }
  var HILL = [0, 1, 0, 0];
  /* raised ground: up to 12 ledges (steep, w < 20, squarish) and mounds (gently sloped) near the camera, each [x, z, r, h, w] */
  var PLAT = [], PU = new Float32Array(48), PW = new Float32Array(12);
  function plats(list) { PLAT = list || []; PU.fill(0); PW.fill(1); for (var i = 0; i < Math.min(12, PLAT.length); i++) { var q = PLAT[i]; PU[i * 4] = q[0]; PU[i * 4 + 1] = q[1]; PU[i * 4 + 2] = q[2]; PU[i * 4 + 3] = q[3]; PW[i] = q[4]; } }
  function platH(x, z) { var m = 0; for (var i = 0; i < Math.min(12, PLAT.length); i++) { var q = PLAT[i], dx = Math.abs(x - q[0]), dz = Math.abs(z - q[1]), w = q[4], r = w < 20 ? Math.sqrt(Math.sqrt(dx * dx * dx * dx + dz * dz * dz * dz)) : Math.hypot(dx, dz), t = Math.max(0, Math.min(1, (q[2] - r) / w)); m = Math.max(m, q[3] * t * t * (3 - 2 * t)); } return m; }
  function hgt(x, z) { return platH(x, z) + hill(x, z); }
  function hill(x, z) { return HILL[0] * (Math.sin(x * 0.0041 + HILL[2]) * Math.cos(z * 0.0037 + HILL[3]) + 0.55 * Math.sin(x * 0.0093 + z * 0.0071 + HILL[2] * 2) + 0.3 * Math.cos(x * 0.017 - z * 0.013)) * HILL[1]; }
  /* ---------- a frame ---------- */
  var W = 320, H = 180;
  function size(w, h) { W = Math.max(64, Math.round(w)); H = Math.max(36, Math.round(h)); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } }
  function uni(P) { var u = P.u, L = LOOK; gl.uniformMatrix4fv(u.uVP, false, cam.VP); if (u.uEye) gl.uniform3fv(u.uEye, cam.eye); gl.uniform2f(u.uFogR, L.fog[0], L.fog[1]); gl.uniform3fv(u.uFog, L.sky); gl.uniform2f(u.uSnap, W / 2, H / 2);
    gl.uniform3fv(u.uSun, L.sun); gl.uniform3fv(u.uSunC, L.sunCol); gl.uniform3fv(u.uAmb, L.amb); }
  function frame(o) { // o: { eye, at, fov, look, ground: { canvas, key, bright }, hill }
    if (!OK || !READY) return false; LOOK = o.look; if (o.hill) HILL = o.hill;
    cam.eye = o.eye; cam.VP = mul(persp(o.fov || 0.95, W / H, 6, 3000), look(o.eye, o.at, [0, 1, 0]));
    gl.viewport(0, 0, W, H); gl.clearColor(LOOK.sky[0], LOOK.sky[1], LOOK.sky[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(true);
    if (o.ground) { gl.useProgram(PG.p); uni(PG); var u = PG.u, sx = Math.floor(o.at[0] / GS) * GS, sz = Math.floor(o.at[2] / GS) * GS; gl.uniform2f(u.uOff, sx, sz); gl.uniform4fv(u.uH, HILL); gl.uniform4fv(u['uP[0]'], PU); gl.uniform1fv(u['uPw[0]'], PW); gl.uniform1f(u.uBright, o.ground.bright || 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texOf(o.ground.key, o.ground.canvas)); gl.uniform1i(u.uT, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, GB); gl.enableVertexAttribArray(PG.a.aXZ); gl.vertexAttribPointer(PG.a.aXZ, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, GN); gl.disableVertexAttribArray(PG.a.aXZ); }
    gl.useProgram(PM.p); uni(PM); gl.uniform1f(PM.u.uUnit, UNIT); gl.uniform1f(PM.u.uRim, LOOK.rim === undefined ? 0.8 : LOOK.rim); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ATEX); gl.uniform1i(PM.u.uTex, 0);
    gl.uniform1f(PM.u.uUnlit, 0); var k, m;
    for (k in MODELS) { m = MODELS[k]; if (m.inst.length) { drawList(m, m.inst); m.inst.length = 0; } }
    gl.enable(gl.BLEND); gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); for (k in MODELS) { m = MODELS[k]; if (m.tinst.length) { gl.uniform1f(PM.u.uUnlit, 0); drawList(m, m.tinst); m.tinst.length = 0; } }
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); for (k in MODELS) { m = MODELS[k]; if (m.add.length) { drawList(m, m.add); m.add.length = 0; } }
    gl.depthMask(true); gl.disable(gl.BLEND);
    for (var nm in PM.a) gl.disableVertexAttribArray(PM.a[nm]); return true; }
  // where a point in the world lands on KIT's 2D picture (its logical pixels); null if behind the camera
  function project(x, y, z, w2, h2) { var M = cam.VP; if (!M) return null; var cx = M[0] * x + M[4] * y + M[8] * z + M[12], cy = M[1] * x + M[5] * y + M[9] * z + M[13], cw = M[3] * x + M[7] * y + M[11] * z + M[15]; if (cw < 1) return null; return { x: (cx / cw * 0.5 + 0.5) * w2, y: (1 - (cy / cw * 0.5 + 0.5)) * h2, d: cw }; }
  // a still picture of one model (the character select); returns a data url
  function portrait(name, o) { if (!READY) return null; o = o || {}; var sw = W, sh = H, m = MODELS[name]; if (!m) return null; size(o.w || 128, o.h || 128); var top = (m.top || 1.6) * UNIT * (o.sc || 1);
    add(name, 0, 0, 0, 0.35, { sc: o.sc || 1, am: 0, ph: 0 }); frame({ eye: [top * 0.42, top * 0.6, top * 1.22], at: [0, top * 0.5, 0], fov: 0.8, look: o.look, hill: [0, 0, 0, 0] });
    var url = cv.toDataURL('image/png'); size(sw, sh); return url; }
  function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
  return { hex: hex, ok: OK, gl: gl, canvas: cv, load: load, ready: function () { return READY; }, whenReady: function (f) { if (READY) f(); else onReady.push(f); }, MODELS: MODELS, add: add, frame: frame, size: size, project: project, hgt: hgt, plats: plats, portrait: portrait, UNIT: UNIT, cam: cam, get W() { return W; }, get H() { return H; } };
})();
