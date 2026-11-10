/* =====================================================================================================
   PSYCHO NIGHTMARE: the 3D renderer. Cumhead Kart's little WebGL 1 engine (PS1 look: a low picture scaled up with
   hard pixels, 15-bit dithered colour, fog, no vertex jitter or texture swim) made into a horror engine:
   - real lights: Cumhead's torch is a spotlight, and up to 8 lamps near him light the basement per pixel (they flicker)
   - every model can be placed with its own matrix, so bodies are rigid parts like the old survival horror games
   - TB's Silly Pills reach into the shader: walls breathe and swim (uWarp), colours run like oil (uHue), the
     basement turns to meat (uMeat), the picture goes negative (uNeg)
   The 3D resolution setting is the same one Kart uses ('hs-gl').
   ===================================================================================================== */
var GLW = 400, GLH = 225;
var GLRES = '2', GLAUTO = true; try { var _gs = localStorage.getItem('hs-gl'); if (_gs) { GLRES = _gs; GLAUTO = false; } } catch (e) {}
/* nobody has picked a resolution: start SHARP (it looked too basic at 225p) and drop to PS1 by itself if this device can't keep up */
var _glT = 0, _glN = 0, _glSlow = 0;
function glAuto() { if (!GLAUTO) return; var now = (window.performance || Date).now(); if (_glT) { var d = now - _glT; if (d < 250) { _glN++; if (d > 30) _glSlow++; if (_glN >= 150) { if (_glSlow > 80) { GLRES = '1'; GLAUTO = false; } _glN = 0; _glSlow = 0; } } } _glT = now; }
var GLRESNAME = { '1': 'PS1 (225p)', '2': 'SHARP (450p)', '3': 'SHARPER (675p)', native: 'FULL (SCREEN)' }, GLRESORDER = ['1', '2', '3', 'native'];
var NL = 8; // lamps lighting the picture at once
var R3 = (function () {
  var view = document.getElementById('view'), hud = document.getElementById('c');
  var cv = document.createElement('canvas'); cv.id = 'gl'; cv.width = GLW; cv.height = GLH;
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;image-rendering:crisp-edges;background:#000';
  view.insertBefore(cv, hud);
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' }) || cv.getContext('experimental-webgl'); } catch (e) { gl = null; }
  if (!gl) return { ok: false, canvas: cv };
  var VS = [
    'attribute vec3 aP; attribute vec2 aU; attribute vec4 aT; attribute vec3 aC; attribute vec3 aN; attribute float aG;',
    'uniform mat4 uVP; uniform mat4 uW; uniform float uTime; uniform float uWarp; uniform vec3 uEye;',
    'varying vec2 vU; varying vec4 vT; varying vec3 vC; varying vec3 vN; varying vec3 vW; varying float vG; varying float vF; varying vec3 vV;',
    'void main() {',
    '  vec4 w = uW * vec4(aP, 1.0);',
    '  if (uWarp > 0.001) { float d = length(w.xz - uEye.xz), k = uWarp * smoothstep(1.2, 5.0, d);', // the walls breathe and swim (never right in your face)
    '    w.x += k * sin(w.z * 0.55 + uTime * 1.7) * 0.35; w.z += k * sin(w.x * 0.5 + uTime * 1.3) * 0.35; w.y += k * sin(w.x * 0.4 + w.z * 0.45 + uTime * 2.3) * 0.22 * (w.y + 0.3); }',
    '  gl_Position = uVP * w; vW = w.xyz; vN = normalize((uW * vec4(aN, 0.0)).xyz + vec3(0.0, 0.0001, 0.0));',
    '  vU = aU; vT = aT; vC = aC; vG = aG; vF = gl_Position.w; vV = uEye - w.xyz;',
    '}'].join('\n');
  var MIP = !!(gl.getExtension('OES_standard_derivatives') && gl.getExtension('EXT_shader_texture_lod'));
  var FS = [
    MIP ? '#extension GL_OES_standard_derivatives : enable\n#extension GL_EXT_shader_texture_lod : enable' : '',
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform sampler2D uTex; uniform vec3 uFog; uniform vec2 uFogR; uniform float uAlpha; uniform float uSoft; uniform float uMip; uniform vec2 uTexSize;',
    'uniform vec3 uAmb; uniform vec4 uLP[' + NL + ']; uniform vec3 uLC[' + NL + ']; uniform vec3 uTP; uniform vec3 uTD; uniform vec3 uTC; uniform float uLit;',
    'uniform float uTime; uniform float uHue; uniform float uMeat; uniform float uNeg; uniform vec3 uTint; uniform vec3 uAdd; uniform float uRim;',
    'varying vec2 vU; varying vec4 vT; varying vec3 vC; varying vec3 vN; varying vec3 vW; varying float vG; varying float vF; varying vec3 vV;',
    'float b2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }',
    'float b4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }',
    'vec3 hue(vec3 c, float a) { const vec3 k = vec3(0.57735); float ca = cos(a); return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca); }',
    'void main() {',
    '  vec2 uv = vU;',
    MIP ? '  vec2 px = uv * vT.zw * uTexSize; float l = uMip > 0.5 ? clamp(0.5 * log2(max(dot(dFdx(px), dFdx(px)), dot(dFdy(px), dFdy(px)))), 0.0, 4.0) : 0.0; vec4 t = texture2DLodEXT(uTex, vT.xy + fract(uv) * vT.zw, l);'
        : '  vec4 t = texture2D(uTex, vT.xy + fract(uv) * vT.zw);',
    '  if (t.a < (uSoft > 0.5 ? 0.02 : 0.5)) discard;',
    '  vec3 base = t.rgb * vC * 2.0 * uTint;',
    '  vec3 L = uAmb + vec3(vG);',
    '  if (uLit > 0.5) {',
    '    for (int i = 0; i < ' + NL + '; i++) { vec3 d = uLP[i].xyz - vW; float ln = length(d) + 0.001; float a = max(0.0, 1.0 - ln / max(uLP[i].w, 0.01)); a *= a; L += uLC[i] * a * (0.3 + 0.7 * max(0.0, dot(vN, d / ln))); }',
    '    vec3 td = vW - uTP; float tl = length(td) + 0.001; vec3 tn = td / tl; float sp = smoothstep(0.82, 0.97, dot(tn, uTD)) + 0.12 * smoothstep(0.5, 0.82, dot(tn, uTD));',
    '    L += uTC * sp / (1.0 + 0.05 * tl * tl) * (0.35 + 0.65 * max(0.0, dot(vN, -tn)));',
    '    if (uRim > 0.001) { float fr = 1.0 - max(0.0, dot(normalize(vN), normalize(vV))); L *= 0.6 + 0.4 * smoothstep(-0.7, 0.6, vN.y); L += uRim * fr * fr * (uAmb * 3.5 + L * 0.35 + vec3(0.05, 0.02, 0.02)); }', // people: shaded from above, a rim of light round the edge so they stand out from the dark
    '  } else L = vec3(1.0);',
    '  vec3 c = base * L + uAdd;',
    '  if (uHue > 0.001) { float a = uHue * (uTime * 0.9 + vW.x * 0.35 + vW.z * 0.25 + vW.y * 0.8); vec3 h = hue(c, a) * (1.0 + 0.6 * uHue); c = mix(c, h, min(1.0, uHue * 1.4)); }',
    '  if (uMeat > 0.001) { float v = 0.5 + 0.5 * sin(vW.x * 3.1 + sin(vW.z * 2.3 + uTime) * 2.0 + vW.y * 4.0 + uTime * 2.5); float lum = dot(c, vec3(0.33));',
    '    vec3 m = mix(vec3(0.35, 0.02, 0.05), vec3(0.95, 0.35, 0.4), v * v) * (0.4 + lum * 1.6); c = mix(c, m, uMeat); }',
    '  float f = clamp((vF - uFogR.x) / (uFogR.y - uFogR.x), 0.0, 1.0);',
    '  c = mix(c, uFog, f * f * (3.0 - 2.0 * f));',
    '  if (uNeg > 0.001) c = mix(c, vec3(1.0) - c, uNeg);',
    '  c = floor(clamp(c, 0.0, 1.0) * 31.0 + b4(gl_FragCoord.xy)) / 31.0;',
    '  gl_FragColor = vec4(c, uAlpha * (uSoft > 0.5 ? t.a : 1.0));',
    '}'].join('\n');
  var built = (function () { try { return setup(); } catch (e) { if (window.console) console.error(e); return null; } })();
  if (!built) return { ok: false, canvas: cv };
  return built;
  function setup() {
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    var A = { p: gl.getAttribLocation(pr, 'aP'), u: gl.getAttribLocation(pr, 'aU'), t: gl.getAttribLocation(pr, 'aT'), c: gl.getAttribLocation(pr, 'aC'), n: gl.getAttribLocation(pr, 'aN'), g: gl.getAttribLocation(pr, 'aG') };
    var U = {}; ['uVP', 'uW', 'uTime', 'uWarp', 'uEye', 'uTex', 'uFog', 'uFogR', 'uAlpha', 'uSoft', 'uMip', 'uTexSize', 'uAmb', 'uLP', 'uLC', 'uTP', 'uTD', 'uTC', 'uLit', 'uHue', 'uMeat', 'uNeg', 'uTint', 'uAdd', 'uRim'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var ID = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    gl.uniform1i(U.uTex, 0); gl.uniform1f(U.uAlpha, 1); gl.uniformMatrix4fv(U.uW, false, ID); gl.uniform3f(U.uTint, 1, 1, 1); gl.uniform3f(U.uAdd, 0, 0, 0); gl.uniform1f(U.uLit, 1);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    var NF = 16, STRIDE = NF * 4;
    function attribs() {
      gl.enableVertexAttribArray(A.p); gl.vertexAttribPointer(A.p, 3, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(A.u); gl.vertexAttribPointer(A.u, 2, gl.FLOAT, false, STRIDE, 12);
      gl.enableVertexAttribArray(A.t); gl.vertexAttribPointer(A.t, 4, gl.FLOAT, false, STRIDE, 20);
      gl.enableVertexAttribArray(A.c); gl.vertexAttribPointer(A.c, 3, gl.FLOAT, false, STRIDE, 36);
      gl.enableVertexAttribArray(A.n); gl.vertexAttribPointer(A.n, 3, gl.FLOAT, false, STRIDE, 48);
      gl.enableVertexAttribArray(A.g); gl.vertexAttribPointer(A.g, 1, gl.FLOAT, false, STRIDE, 60);
    }
    function pot(n) { return n > 0 && (n & (n - 1)) === 0; }
    function texture(src, mip) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); t.w = src.width; t.h = src.height;
      t.mip = !!(mip && MIP && pot(src.width) && pot(src.height));
      if (t.mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      return t;
    }
    /* a mesh: vertices of position, uv (tile units), tile rect, colour (0.5 = normal), normal, glow (lights itself) */
    function Mesh() { this.a = []; this.n = 0; }
    Mesh.prototype.v = function (p, u, v, T, c, n, g) { this.a.push(p[0], p[1], p[2], u, v, T[0], T[1], T[2], T[3], c[0], c[1], c[2], n[0], n[1], n[2], g || 0); this.n++; };
    /* a quad from four corners going round, uv corners [u0,v0, u1,v1, u2,v2, u3,v3], one tile, colour(s), the normal (worked out if left out) */
    Mesh.prototype.quad = function (a, b, c, d, uv, T, col, n, g) {
      if (!n) n = faceN(a, b, c); var ca = col.length === 4 && col[0].length ? col : [col, col, col, col];
      this.v(a, uv[0], uv[1], T, ca[0], n, g); this.v(b, uv[2], uv[3], T, ca[1], n, g); this.v(c, uv[4], uv[5], T, ca[2], n, g);
      this.v(a, uv[0], uv[1], T, ca[0], n, g); this.v(c, uv[4], uv[5], T, ca[2], n, g); this.v(d, uv[6], uv[7], T, ca[3], n, g);
    };
    Mesh.prototype.quadN = function (q, uv, T, col, ns, g) { // a quad with a normal per corner (smooth shapes)
      var o = [0, 1, 2, 0, 2, 3]; for (var i = 0; i < 6; i++) { var k = o[i]; this.v(q[k], uv[k * 2], uv[k * 2 + 1], T, col, ns[k], g); }
    };
    Mesh.prototype.tri = function (a, b, c, uv, T, col, n, g) { if (!n) n = faceN(a, b, c); this.v(a, uv[0], uv[1], T, col, n, g); this.v(b, uv[2], uv[3], T, col, n, g); this.v(c, uv[4], uv[5], T, col, n, g); };
    Mesh.prototype.upload = function () { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.a), gl.STATIC_DRAW); this.buf = b; this.count = this.n; this.a = null; return this; };
    Mesh.prototype.free = function () { if (this.buf) gl.deleteBuffer(this.buf); this.buf = null; };
    Mesh.prototype.clear = function () { this.a.length = 0; this.n = 0; };
    var dyn = gl.createBuffer(), dynCap = 0, dynArr = new Float32Array(65536);
    /* draw(mesh, tex, { m: model matrix, alpha, soft, add, noDepth, lit: false, tint: [r,g,b], flash: [r,g,b], offset }) */
    function draw(mesh, tex, o) {
      o = o || {}; var n = mesh.buf ? mesh.count : mesh.n; if (!n) return;
      if (mesh.buf) gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
      else { if (mesh.a.length > dynArr.length) dynArr = new Float32Array(mesh.a.length * 2); dynArr.set(mesh.a); gl.bindBuffer(gl.ARRAY_BUFFER, dyn); var bytes = mesh.a.length * 4; if (bytes > dynCap) { dynCap = dynArr.byteLength; gl.bufferData(gl.ARRAY_BUFFER, dynCap, gl.DYNAMIC_DRAW); } gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynArr.subarray(0, mesh.a.length)); }
      attribs(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniformMatrix4fv(U.uW, false, o.m || ID);
      gl.uniform1f(U.uAlpha, o.alpha === undefined ? 1 : o.alpha); gl.uniform1f(U.uSoft, o.soft ? 1 : 0); gl.uniform1f(U.uMip, tex.mip ? 1 : 0); gl.uniform2f(U.uTexSize, tex.w, tex.h);
      gl.uniform1f(U.uLit, o.lit === false ? 0 : 1); gl.uniform1f(U.uRim, o.rim || 0); gl.uniform1f(U.uWarp, o.warp === undefined ? warpNow : o.warp);
      var tn = o.tint; gl.uniform3f(U.uTint, tn ? tn[0] : 1, tn ? tn[1] : 1, tn ? tn[2] : 1); var fl = o.flash; gl.uniform3f(U.uAdd, fl ? fl[0] : 0, fl ? fl[1] : 0, fl ? fl[2] : 0);
      if ((o.alpha !== undefined && o.alpha < 1) || (o.soft && !o.add)) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
      if (o.add) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.depthMask(false); }
      if (o.noDepth) gl.disable(gl.DEPTH_TEST);
      if (o.offset) { gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1, -o.offset); } if (o.decal) gl.depthMask(false);
      gl.drawArrays(gl.TRIANGLES, 0, n);
      gl.disable(gl.POLYGON_OFFSET_FILL); gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
    }
    /* matrices (column major) */
    function persp(fov, asp, n, f) { var t = 1 / Math.tan(fov / 2), m = new Float32Array(16); m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m; }
    function look(e, c, up) {
      var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
      var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
      var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx, m = new Float32Array(16);
      m[0] = xx; m[4] = xy; m[8] = xz; m[1] = yx; m[5] = yy; m[9] = yz; m[2] = zx; m[6] = zy; m[10] = zz;
      m[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); m[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); m[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); m[15] = 1; return m;
    }
    function mul(a, b) { var o = new Float32Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
    /* a model matrix: place at (x, y, z), turned by yaw round the up axis, then pitch (forward tilt) and roll, scaled */
    function model(x, y, z, yaw, pitch, roll, sc) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch || 0), sp = Math.sin(pitch || 0), cr = Math.cos(roll || 0), sr = Math.sin(roll || 0), s = sc || 1, m = new Float32Array(16);
      // R = Ry(yaw) * Rx(pitch) * Rz(roll); model space: x right, y up, z forward
      var r00 = cy * cr + sy * sp * sr, r01 = -cy * sr + sy * sp * cr, r02 = sy * cp;
      var r10 = cp * sr, r11 = cp * cr, r12 = -sp;
      var r20 = -sy * cr + cy * sp * sr, r21 = sy * sr + cy * sp * cr, r22 = cy * cp;
      m[0] = r00 * s; m[1] = r10 * s; m[2] = r20 * s; m[4] = r01 * s; m[5] = r11 * s; m[6] = r21 * s; m[8] = r02 * s; m[9] = r12 * s; m[10] = r22 * s; m[12] = x; m[13] = y; m[14] = z; m[15] = 1; return m;
    }
    var cam = { m: null, eye: [0, 0, 0], fwd: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] }, warpNow = 0;
    function setCam(eye, at, fov, up) {
      up = up || [0, 1, 0]; var p = persp(fov, GLW / GLH, 0.08, 120), v = look(eye, at, up); cam.m = mul(p, v); cam.eye = eye;
      cam.right = [v[0], v[4], v[8]]; cam.up = [v[1], v[5], v[9]]; cam.fwd = [-v[2], -v[6], -v[10]];
      gl.uniformMatrix4fv(U.uVP, false, cam.m); gl.uniform3f(U.uEye, eye[0], eye[1], eye[2]);
    }
    function scene(o) { // fog, ambient, lamps, torch, trip
      gl.uniform3f(U.uFog, o.fog[0], o.fog[1], o.fog[2]); gl.uniform2f(U.uFogR, o.fogR[0], o.fogR[1]); gl.uniform3f(U.uAmb, o.amb[0], o.amb[1], o.amb[2]);
      var lp = new Float32Array(NL * 4), lc = new Float32Array(NL * 3);
      (o.lights || []).slice(0, NL).forEach(function (L, i) { lp[i * 4] = L.x; lp[i * 4 + 1] = L.y; lp[i * 4 + 2] = L.z; lp[i * 4 + 3] = L.r; lc[i * 3] = L.c[0] * L.k; lc[i * 3 + 1] = L.c[1] * L.k; lc[i * 3 + 2] = L.c[2] * L.k; });
      gl.uniform4fv(U.uLP, lp); gl.uniform3fv(U.uLC, lc);
      var T = o.torch; gl.uniform3f(U.uTP, T.p[0], T.p[1], T.p[2]); gl.uniform3f(U.uTD, T.d[0], T.d[1], T.d[2]); gl.uniform3f(U.uTC, T.c[0], T.c[1], T.c[2]);
      gl.uniform1f(U.uTime, o.t); gl.uniform1f(U.uHue, o.hue || 0); gl.uniform1f(U.uMeat, o.meat || 0); gl.uniform1f(U.uNeg, o.neg || 0); warpNow = o.warp || 0;
    }
    function lines() { if (GLRES === 'native') { var r = cv.getBoundingClientRect(); return Math.max(225, Math.min(1440, Math.round((Math.min(r.height, r.width) || 225) * (window.devicePixelRatio || 1)))); } return 225 * (+GLRES || 1); } // the short side
    function setRes(v) { GLRES = v; GLAUTO = false; try { localStorage.setItem('hs-gl', v); } catch (e) {} }
    function resItem(back) { return { label: '3D RESOLUTION: ' + GLRESNAME[GLRES], fn: function () { setRes(GLRESORDER[(GLRESORDER.indexOf(GLRES) + 1) % GLRESORDER.length]); if (back) back(); } }; }
    function begin(clear) { glAuto(); var sd = lines(), up = KIT.W < KIT.H, hh = up ? Math.round(sd * KIT.H / KIT.W) : sd, ww = up ? sd : Math.round(sd * KIT.W / KIT.H); if (ww !== GLW || hh !== GLH) { GLW = ww; GLH = hh; cv.width = GLW; cv.height = GLH; } gl.viewport(0, 0, GLW, GLH); gl.clearColor(clear[0], clear[1], clear[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); }
    function clearDepth() { gl.clear(gl.DEPTH_BUFFER_BIT); }
    function project(x, y, z) {
      var m = cam.m; if (!m) return null; var cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      if (cw < 0.1) return null; return { x: (cx / cw * 0.5 + 0.5) * KIT.W, y: (1 - (cy / cw * 0.5 + 0.5)) * KIT.H, w: cw };
    }
    return { ok: true, gl: gl, canvas: cv, setRes: setRes, resItem: resItem, Mesh: Mesh, texture: texture, draw: draw, setCam: setCam, scene: scene, persp: persp, look: look, mul: mul, model: model, cam: cam, begin: begin, clearDepth: clearDepth, project: project, ID: ID };
  }
})();
function faceN(a, b, c) { var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1; return [nx / l, ny / l, nz / l]; }
