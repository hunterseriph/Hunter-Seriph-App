/* =====================================================================================================
   CUMHEAD KART: the 3D renderer. A small WebGL 1 engine made to look like a PlayStation 1 game:
   - the world is drawn into a 400x225 picture and scaled up with hard pixels
   - no corner snapping or affine texture swim (Hunter removes those when he emulates; they made things flicker and warp)
   - vertex colours are doubled like the PS1 did (0.5 = normal), colours are cut down to 15-bit with dithering
   - distance fog instead of a far draw distance
   Everything else (HUD, menus, sound, input) is the shared kit, drawn over it on the 480x270 canvas.
   ===================================================================================================== */
var GLW = 400, GLH = 225;
var R3 = (function () {
  var view = document.getElementById('view'), hud = document.getElementById('c');
  var cv = document.createElement('canvas'); cv.id = 'gl'; cv.width = GLW; cv.height = GLH;
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;image-rendering:crisp-edges;background:#000';
  view.insertBefore(cv, hud);
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' }) || cv.getContext('experimental-webgl'); } catch (e) { gl = null; }
  if (!gl) return { ok: false, canvas: cv };

  var VS = [
    'attribute vec3 aP; attribute vec2 aU; attribute vec4 aT; attribute vec4 aC;',
    'uniform mat4 uM; uniform vec2 uRes; uniform float uTime; uniform float uSnap;',
    'varying vec3 vU; varying vec4 vT; varying vec3 vC; varying float vF;',
    'void main() {',
    '  vec4 p = uM * vec4(aP, 1.0);',
    '  if (uSnap > 0.5 && p.w > 0.05) { vec2 n = p.xy / p.w; n = floor(n * uRes * 0.5 + 0.5) / (uRes * 0.5); p.xy = n * p.w; }',
    '  gl_Position = p;',
    '  vec2 uv = aU + vec2(0.0, aC.a * uTime);', // the 4th colour channel scrolls a texture (cream rivers, conveyors, boost pads)
    '  vU = vec3(uv, 1.0); vT = aT; vC = aC.rgb; vF = p.w;', // perspective-correct textures: Hunter turns the PS1 wobble off when he emulates, so we do too
    '}'].join('\n');
  /* far-away textures use smaller copies of themselves (mipmaps), picked by hand per tile, so distant walls and roads do not sparkle and flicker */
  var MIP = !!(gl.getExtension('OES_standard_derivatives') && gl.getExtension('EXT_shader_texture_lod'));
  var FS = [
    MIP ? '#extension GL_OES_standard_derivatives : enable\n#extension GL_EXT_shader_texture_lod : enable' : '',
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform sampler2D uTex; uniform vec3 uFog; uniform vec2 uFogR; uniform float uAlpha; uniform float uBright; uniform float uSoft; uniform float uMip; uniform vec2 uTexSize;',
    'varying vec3 vU; varying vec4 vT; varying vec3 vC; varying float vF;',
    'float b2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }',
    'float b4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }',
    'void main() {',
    '  vec2 uv = vU.xy / vU.z;',
    MIP ? '  vec2 px = uv * vT.zw * uTexSize; float l = uMip > 0.5 ? clamp(0.5 * log2(max(dot(dFdx(px), dFdx(px)), dot(dFdy(px), dFdy(px)))), 0.0, 4.0) : 0.0; vec4 t = texture2DLodEXT(uTex, vT.xy + fract(uv) * vT.zw, l);'
        : '  vec4 t = texture2D(uTex, vT.xy + fract(uv) * vT.zw);',
    '  if (t.a < (uSoft > 0.5 ? 0.02 : 0.5)) discard;',
    '  vec3 c = t.rgb * vC * 2.0 * uBright;',
    '  float f = clamp((vF - uFogR.x) / (uFogR.y - uFogR.x), 0.0, 1.0);',
    '  c = mix(c, uFog, f * f * (3.0 - 2.0 * f));',
    '  c = floor(clamp(c, 0.0, 1.0) * 31.0 + b4(gl_FragCoord.xy)) / 31.0;', // 15-bit colour, dithered
    '  gl_FragColor = vec4(c, uAlpha * (uSoft > 0.5 ? t.a : 1.0));',
    '}'].join('\n');
  var built = (function () { try { return setup(); } catch (e) { return null; } })();
  if (!built) return { ok: false, canvas: cv };
  return built;
  function setup() {
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
  gl.useProgram(pr);
  var A = { p: gl.getAttribLocation(pr, 'aP'), u: gl.getAttribLocation(pr, 'aU'), t: gl.getAttribLocation(pr, 'aT'), c: gl.getAttribLocation(pr, 'aC') };
  var U = {}; ['uM', 'uRes', 'uTime', 'uSnap', 'uTex', 'uFog', 'uFogR', 'uAlpha', 'uBright', 'uSoft', 'uMip', 'uTexSize'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
  gl.uniform2f(U.uRes, GLW, GLH); gl.uniform1i(U.uTex, 0); gl.uniform1f(U.uAlpha, 1); gl.uniform1f(U.uBright, 1);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
  var STRIDE = 13 * 4;
  function attribs() {
    gl.enableVertexAttribArray(A.p); gl.vertexAttribPointer(A.p, 3, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(A.u); gl.vertexAttribPointer(A.u, 2, gl.FLOAT, false, STRIDE, 12);
    gl.enableVertexAttribArray(A.t); gl.vertexAttribPointer(A.t, 4, gl.FLOAT, false, STRIDE, 20);
    gl.enableVertexAttribArray(A.c); gl.vertexAttribPointer(A.c, 4, gl.FLOAT, false, STRIDE, 36);
  }
  /* ---------- textures ---------- */
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
  function update(t, src) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); }
  /* ---------- buffers ---------- */
  function Mesh() { this.a = []; this.n = 0; }
  /* one vertex: position, uv (in tile units, so 0..1 is one tile and 0..3 repeats it three times), tile rect, colour (0.5 = normal), scroll */
  Mesh.prototype.v = function (x, y, z, u, v, T, r, g, b, s) { this.a.push(x, y, z, u, v, T[0], T[1], T[2], T[3], r, g, b, s || 0); this.n++; };
  /* a quad from four corners (a, b, c, d going round), uv corners, one tile, a colour per corner or one for all */
  Mesh.prototype.quad = function (a, b, c, d, uv, T, col, s) {
    var ca = col.length === 4 && col[0].length ? col : [col, col, col, col];
    this.v(a[0], a[1], a[2], uv[0], uv[1], T, ca[0][0], ca[0][1], ca[0][2], s); this.v(b[0], b[1], b[2], uv[2], uv[3], T, ca[1][0], ca[1][1], ca[1][2], s); this.v(c[0], c[1], c[2], uv[4], uv[5], T, ca[2][0], ca[2][1], ca[2][2], s);
    this.v(a[0], a[1], a[2], uv[0], uv[1], T, ca[0][0], ca[0][1], ca[0][2], s); this.v(c[0], c[1], c[2], uv[4], uv[5], T, ca[2][0], ca[2][1], ca[2][2], s); this.v(d[0], d[1], d[2], uv[6], uv[7], T, ca[3][0], ca[3][1], ca[3][2], s);
  };
  Mesh.prototype.tri = function (a, b, c, uv, T, col) {
    this.v(a[0], a[1], a[2], uv[0], uv[1], T, col[0], col[1], col[2]); this.v(b[0], b[1], b[2], uv[2], uv[3], T, col[0], col[1], col[2]); this.v(c[0], c[1], c[2], uv[4], uv[5], T, col[0], col[1], col[2]);
  };
  Mesh.prototype.upload = function () { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.a), gl.STATIC_DRAW); this.buf = b; this.count = this.n; this.a = null; return this; };
  Mesh.prototype.free = function () { if (this.buf) gl.deleteBuffer(this.buf); this.buf = null; };
  var dyn = gl.createBuffer(), dynCap = 0;
  function draw(mesh, tex, o) {
    o = o || {}; var n = mesh.buf ? mesh.count : mesh.n; if (!n) return;
    if (mesh.buf) gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
    else { var arr = new Float32Array(mesh.a); gl.bindBuffer(gl.ARRAY_BUFFER, dyn); if (arr.byteLength > dynCap) { dynCap = arr.byteLength * 2; gl.bufferData(gl.ARRAY_BUFFER, dynCap, gl.DYNAMIC_DRAW); } gl.bufferSubData(gl.ARRAY_BUFFER, 0, arr); }
    attribs(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1f(U.uAlpha, o.alpha === undefined ? 1 : o.alpha); gl.uniform1f(U.uSoft, o.soft ? 1 : 0); gl.uniform1f(U.uMip, tex.mip ? 1 : 0); gl.uniform2f(U.uTexSize, tex.w, tex.h);
    if ((o.alpha !== undefined && o.alpha < 1) || (o.soft && !o.add)) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
    if (o.add) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.depthMask(false); }
    if (o.noDepth) gl.disable(gl.DEPTH_TEST);
    if (o.offset) { gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1, -o.offset); }
    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
  }
  /* ---------- matrices (column major) ---------- */
  function persp(fov, asp, n, f) { var t = 1 / Math.tan(fov / 2), m = new Float32Array(16); m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m; }
  function look(e, c, up) {
    var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx, m = new Float32Array(16);
    m[0] = xx; m[4] = xy; m[8] = xz; m[1] = yx; m[5] = yy; m[9] = yz; m[2] = zx; m[6] = zy; m[10] = zz;
    m[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); m[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); m[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); m[15] = 1; return m;
  }
  function mul(a, b) { var o = new Float32Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
  var cam = { m: null, eye: [0, 0, 0], fwd: [0, 0, 1], right: [1, 0, 0] };
  function setCam(eye, at, fov, fog, fogR) {
    var p = persp(fov, GLW / GLH, 0.3, 700), v = look(eye, at, [0, 1, 0]); cam.m = mul(p, v); cam.eye = eye;
    var fx = at[0] - eye[0], fz = at[2] - eye[2], l = Math.hypot(fx, fz) || 1; cam.fwd = [fx / l, 0, fz / l]; cam.right = [-fz / l, 0, fx / l];
    gl.uniformMatrix4fv(U.uM, false, cam.m); gl.uniform3f(U.uFog, fog[0], fog[1], fog[2]); gl.uniform2f(U.uFogR, fogR[0], fogR[1]);
  }
  function setMatrix(m) { gl.uniformMatrix4fv(U.uM, false, m); }
  function begin(clear) { var ww = Math.round(GLH * KIT.W / KIT.H); if (ww !== GLW) { GLW = ww; cv.width = GLW; gl.useProgram(pr); gl.uniform2f(U.uRes, GLW, GLH); } gl.viewport(0, 0, GLW, GLH); gl.clearColor(clear[0], clear[1], clear[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); }
  function setTime(t) { gl.uniform1f(U.uTime, t); }
  function snap(on) { gl.uniform1f(U.uSnap, 0); } // no vertex snapping: the PS1 jitter looked bad, so polygons stay put
  function bright(b) { gl.uniform1f(U.uBright, b); }
  function clearDepth() { gl.clear(gl.DEPTH_BUFFER_BIT); }
  snap(true);
  /* project a world point to HUD (480x270) coordinates, for name tags and markers */
  function project(x, y, z) {
    var m = cam.m; if (!m) return null; var cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw < 0.3) return null; return { x: (cx / cw * 0.5 + 0.5) * KIT.W, y: (1 - (cy / cw * 0.5 + 0.5)) * 270, w: cw };
  }
  return { ok: true, gl: gl, canvas: cv, Mesh: Mesh, texture: texture, update: update, draw: draw, setCam: setCam, setMatrix: setMatrix, persp: persp, look: look, mul: mul, cam: cam, begin: begin, setTime: setTime, snap: snap, bright: bright, clearDepth: clearDepth, project: project };
  }
})();
