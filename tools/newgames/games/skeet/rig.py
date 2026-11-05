"""Skeet Fighter's animation rig.

The fighters' heads (and Cumhead's shirt, Greebo's apron, the Homunculus's body, all of Spermaid's droplet) are cut
straight out of their own sprites, so their faces never change. Arms, legs and Spermaid's tail are drawn here in the
same colours, outline and top-left light as the sprites, and posed with two-bone IK: a pose says where the hands and
feet go and the elbows and knees work themselves out. That gives every fighter a real walk, run, jab, cross, kick,
roundhouse, uppercut, sweep, throw, fireball push and so on, each its own drawing rather than one frame leaned over.

Pose units: feet and the hip are in leg lengths from the ground under the fighter (x forwards, y up); hands are in arm
lengths from the shoulder. lean = pixels the shoulders move forwards (the torso is sheared row by row, no blurring).
"""
import math
from PIL import Image

def hexc(s):
    s = s.lstrip('#'); return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), 255)

LIGHT = (-0.55, 0.83) # light from the top left (game coordinates: y up)

class Frame:
    def __init__(self, W=96, H=80, ox=48, oy=78):
        self.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); self.W, self.H, self.ox, self.oy = W, H, ox, oy; self.parts = []
    def compose(self, outer, inner):
        """lay every part in order, then ONE outline round the outside of the limbs (never doubled on the cut sprite pieces,
        they keep their own) and a thin seam where a limb crosses something else, so arms and legs read cleanly"""
        own = {}; col = {}
        for i, pt in enumerate(self.parts):
            for k, c in pt.col.items(): col[k] = c; own[k] = i
        seam = set()
        for k, i in own.items():
            if self.parts[i].kind != 'limb': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (k[0] + dx, k[1] + dy); j = own.get(n)
                if j is not None and j < i and self.parts[j].group != self.parts[i].group: seam.add(k); break
        dst = self.im.load()
        for k, c in col.items(): dst[k] = hexc(inner) if k in seam else c
        if outer:
            oc = hexc(outer)
            for k, i in own.items():
                if self.parts[i].kind != 'limb': continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = (k[0] + dx, k[1] + dy)
                    if n not in col and 0 <= n[0] < self.W and 0 <= n[1] < self.H: dst[n] = oc
    def px(self, x, y): return self.ox + x, self.oy - y

class Part:
    """one piece drawn into its own layer, outlined, then laid on the frame"""
    def __init__(self, fr, outline, kind='limb', group=None):
        self.fr = fr; self.col = {}; self.outline = hexc(outline) if isinstance(outline, str) else outline; self.kind = kind; self.group = group
    def put(self, X, Y, c):
        if 0 <= X < self.fr.W and 0 <= Y < self.fr.H: self.col[(X, Y)] = c
    def cap(self, a, b, r0, pal, r1=None):
        """a capsule (a limb) from a to b, radius r0 tapering to r1, shaded by the light"""
        r1 = r0 if r1 is None else r1; L, M, D = [hexc(c) for c in pal]
        ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay; ll = dx * dx + dy * dy or 1e-6; rr = max(r0, r1)
        x0, x1 = int(math.floor(min(ax, bx) - rr - 1)), int(math.ceil(max(ax, bx) + rr + 1))
        y0, y1 = int(math.floor(min(ay, by) - rr - 1)), int(math.ceil(max(ay, by) + rr + 1))
        for gy in range(y0, y1 + 1):
            for gx in range(x0, x1 + 1):
                cx, cy = gx + 0.5 - 0.5, gy + 0.5 - 0.5
                t = max(0, min(1, ((cx - ax) * dx + (cy - ay) * dy) / ll)); qx, qy = ax + dx * t, ay + dy * t
                r = r0 + (r1 - r0) * t; vx, vy = cx - qx, cy - qy; d = math.hypot(vx, vy)
                if d > r: continue
                s = (vx * LIGHT[0] + vy * LIGHT[1]) / max(0.8, r)
                c = L if s > 0.38 else D if s < -0.42 else M
                X, Y = self.fr.px(gx, gy); self.put(X, Y, c)
    def ell(self, c, rx, ry, pal, shine=False):
        L, M, D = [hexc(k) for k in pal]; cx, cy = c
        for gy in range(int(cy - ry - 1), int(cy + ry + 2)):
            for gx in range(int(cx - rx - 1), int(cx + rx + 2)):
                ux, uy = (gx - cx) / rx, (gy - cy) / ry
                if ux * ux + uy * uy > 1.0: continue
                s = ux * LIGHT[0] + uy * LIGHT[1]
                k = L if s > 0.3 else D if s < -0.45 else M
                X, Y = self.fr.px(gx, gy); self.put(X, Y, k)
        if shine:
            X, Y = self.fr.px(int(round(cx - rx * 0.4)), int(round(cy + ry * 0.4))); self.put(X, Y, (255, 255, 255, 255))
    def img(self, im, X, Y):
        """a cut sprite piece, its top left at frame pixel X, Y (it keeps its own outline)"""
        p = im.load()
        for y in range(im.height):
            for x in range(im.width):
                if p[x, y][3] > 40: self.put(X + x, Y + y, p[x, y])
    def lay(self, skip_outline=False):
        if skip_outline and self.kind == 'limb': self.kind = 'img'
        self.fr.parts.append(self); return
        fr = self.fr; dst = fr.im.load()
        if not skip_outline and self.outline:
            for (X, Y) in list(self.col):
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    k = (X + dx, Y + dy)
                    if k not in self.col and 0 <= k[0] < fr.W and 0 <= k[1] < fr.H: dst[k] = self.outline
        for k, c in self.col.items(): dst[k] = c

def ik(a, t, l1, l2, pref):
    """two bones from a towards t: where the elbow or knee goes (the side pref points to)"""
    ax, ay = a; dx, dy = t[0] - ax, t[1] - ay; d = math.hypot(dx, dy) or 1e-6
    d2 = max(abs(l1 - l2) + 0.01, min(l1 + l2 - 0.01, d)); ux, uy = dx / d, dy / d
    tx, ty = ax + ux * d2, ay + uy * d2
    ca = max(-1, min(1, (l1 * l1 + d2 * d2 - l2 * l2) / (2 * l1 * d2))); al = math.acos(ca)
    best = None
    for sgn in (1, -1):
        c, s = math.cos(al * sgn), math.sin(al * sgn); jx, jy = ax + l1 * (ux * c - uy * s), ay + l1 * (ux * s + uy * c)
        sc = (jx - (ax + tx) / 2) * pref[0] + (jy - (ay + ty) / 2) * pref[1]
        if best is None or sc > best[0]: best = (sc, (jx, jy))
    return best[1], (tx, ty)

def shear(im, k):
    """lean the top of a piece k pixels forwards, the bottom row fixed"""
    w, h = im.size; pad = abs(int(round(k))) + 1; out = Image.new('RGBA', (w + pad * 2, h), (0, 0, 0, 0))
    for y in range(h):
        s = int(round(k * (1 - y / max(1, h - 1)))); out.paste(im.crop((0, y, w, y + 1)), (pad + s, y))
    return out, pad

def erase(im, boxes):
    im = im.copy(); p = im.load()
    for (x0, y0, x1, y1) in boxes:
        for y in range(max(0, y0), min(im.height, y1)):
            for x in range(max(0, x0), min(im.width, x1)): p[x, y] = (0, 0, 0, 0)
    return im

def reline(im, col):
    """put a 1px outline back where a cut went through the middle of a sprite (only against light pixels)"""
    im = im.copy(); p = im.load(); w, h = im.size; oc = hexc(col); add = []
    for y in range(h):
        for x in range(w):
            if p[x, y][3] > 40: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < w and 0 <= Y < h and p[X, Y][3] > 40:
                    r, g, b, a = p[X, Y]
                    if (r + g + b) / 3 > 40 and not (abs(r - oc[0]) < 30 and abs(g - oc[1]) < 30 and abs(b - oc[2]) < 30): add.append((x, y)); break
    for xy in add: p[xy] = oc
    return im

# ------------------------------------------------------------------ drawing one pose
def V(p, k): return (p[0] * k, p[1] * k)

def render(C, pose):
    """C: the fighter's rig (below). pose: where everything goes. Returns the frame, feet at the bottom centre."""
    fr = Frame(); P = dict(C['rest']); P.update(pose)
    LL = C['leg'][0] + C['leg'][1]; AL = C['arm'][0] + C['arm'][1]
    hip = (P['hip'][0] * LL, P['hip'][1] * LL)
    lean = P.get('lean', 0); torsoH = C['hipRow'] - C['neckRow']
    def up(y): return lean * y / max(1, torsoH) # how far the body has leaned at height y above the hip
    sh = {}
    for side in ('f', 'b'):
        sx, sy = C['sh' + side]; sh[side] = (hip[0] + sx + up(sy), hip[1] + sy)
    hipj = {'f': (hip[0] + C['hipW'], hip[1]), 'b': (hip[0] - C['hipW'], hip[1])}
    order = P.get('order') or C.get('order') or ['bl', 'fl', 'body', 'ba', 'head', 'fa']
    for part in order:
        if part in ('ba', 'fa'):
            side = part[0]; key = side + 'h'
            if P.get(key) is None: continue
            s = sh[side]; tgt = (s[0] + P[key][0] * AL, s[1] + P[key][1] * AL)
            # the back arm is drawn behind the head: a fist that would end up hidden behind the face drops to the chest instead
            # (he saw Cumhead's left hand vanish behind his face)
            if side == 'b' and C.get('head') is not None and order.index('ba') < order.index('head') if 'head' in order else False:
                him, (hox, hoy) = C['head']; nx = hip[0] + up(torsoH); ny = hip[1] + torsoH
                if nx - hox - 1 <= tgt[0] <= nx - hox + him.width + 1 and tgt[1] > ny - C['handR'] - 1:
                    tgt = (tgt[0] + 1.5, ny - C['handR'] - 1.5)
            j, t = ik(s, tgt, C['arm'][0], C['arm'][1], P.get(side + 'eb', (-0.4, -1)))
            pt = Part(fr, C['armOut'], group='a' + side); pal = C['armPal'] if side == 'f' else C.get('armPalB', C['armPal'])
            pt.cap(s, j, C['armR'], pal); pt.cap(j, t, C['armR'], pal, C['armR'] * C.get('armTaper', 1))
            hand = P.get(side + 'hand', 'fist'); hr = C['handR'] * (1.15 if hand == 'big' else 1)
            if C.get('claw'): # the Homunculus: three claws
                ang = math.atan2(t[1] - j[1], t[0] - j[0])
                for da in (-0.5, 0, 0.5):
                    e2 = (t[0] + math.cos(ang + da) * hr * 1.3, t[1] + math.sin(ang + da) * hr * 1.3); pt.cap(t, e2, 1.0, C['handPal'], 0.5)
                pt.ell(t, hr * 0.8, hr * 0.8, C['handPal'])
            elif hand != 'none': pt.ell(t, hr * C.get('handW', 1), hr, C['handPal'], shine=True)
            pt.lay()
        elif part in ('bl', 'fl'):
            side = part[0]; key = side + 'f'
            if C.get('tail'):
                if side == 'b': continue
                draw_tail(fr, C, hip, P[key], LL); continue
            if P.get(key) is None: continue
            a = hipj[side]; tgt = (P[key][0] * LL, P[key][1] * LL)
            j, t = ik(a, tgt, C['leg'][0], C['leg'][1], P.get(side + 'kb', (1, 0.2)))
            pt = Part(fr, C['legOut'], group='l' + side); pal = C['legPal'] if side == 'f' else C.get('legPalB', C['legPal'])
            pt.cap(a, j, C['legR'], pal); pt.cap(j, t, C['legR'], pal, C['legR'] * C.get('legTaper', 1))
            # the foot points along the floor, or along the leg when it is kicking out
            ang = math.atan2(t[1] - j[1], t[0] - j[0]); kick = P.get(side + 'kick', False)
            fx, fy = (math.cos(ang), math.sin(ang)) if kick else (1, 0)
            if C.get('claw'):
                for da in (-0.35, 0.35): pt.cap(t, (t[0] + fx * 3.5 + math.cos(da) * 0, t[1] + fy * 3.5 + da * 2), 1.0, C['footPal'], 0.6)
            else:
                pt.ell((t[0] + fx * C['footF'], t[1] + fy * C['footF'] + (0 if kick else C['footR'][1] * 0.6)), C['footR'][0], C['footR'][1], C['footPal'], shine=True)
                if C.get('sole') and not kick: pt.cap((t[0] + fx * C['footF'] - C['footR'][0] + 1, t[1] - 0.2), (t[0] + fx * C['footF'] + C['footR'][0] - 1, t[1] - 0.2), 0.6, C['sole'])
            pt.lay()
        elif part == 'body':
            if C.get('body') is None: continue
            im, (ox, oy) = C['body'] # the piece and where its hip pixel is inside it
            X, Y = fr.px(hip[0], hip[1]); pt = Part(fr, None); p = im.load()
            for y in range(im.height):
                s = int(round(lean * max(0, oy - y) / max(1, torsoH)))
                for x in range(im.width):
                    if p[x, y][3] > 40: pt.put(int(round(X - ox)) + x + s, int(round(Y - oy)) + y, p[x, y])
            pt.lay(True)
        elif part == 'head':
            if C.get('head') is None: continue
            im, (ox, oy) = C['head'] # oy = the neck row inside the head piece
            hx, hy = P.get('head', (0, 0)); nx, ny = hip[0] + up(torsoH) + hx + C.get('neckX', 0), hip[1] + torsoH + hy
            X, Y = fr.px(nx, ny); pt = Part(fr, None); pt.img(im, int(round(X - ox)), int(round(Y - oy))); pt.lay(True)
        elif part == 'extra' and P.get('extra'):
            P['extra'](fr, hip, sh)
    fr.compose(C.get('outer', '#12040a'), C.get('inner', '#12040a'))
    return crop(fr)

def draw_tail(fr, C, hip, tip, LL):
    """Spermaid's tail: a bezier from her hip down and round to the tip, thick to thin, with her pink fin"""
    a = (hip[0] + C['tailRoot'][0], hip[1] + C['tailRoot'][1]); b = (tip[0] * LL, tip[1] * LL)
    ctrl = (a[0] + (b[0] - a[0]) * 0.2 + C['tailBow'][0], min(a[1], b[1]) + C['tailBow'][1])
    pts = []
    for i in range(13):
        t = i / 12; x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * ctrl[0] + t * t * b[0]; y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * ctrl[1] + t * t * b[1]; pts.append((x, y))
    pt = Part(fr, C['legOut'], group='tail')
    for i in range(12):
        r0 = C['legR'] * (1 - i / 12 * 0.6); r1 = C['legR'] * (1 - (i + 1) / 12 * 0.6); pt.cap(pts[i], pts[i + 1], r0, C['legPal'], r1)
    # scales: a darker fleck every few pixels along the middle
    for i in range(2, 11, 2):
        X, Y = fr.px(int(round(pts[i][0])), int(round(pts[i][1])))
        if (X, Y) in pt.col: pt.col[(X, Y)] = hexc(C['legPal'][2])
    pt.lay()
    # the fin: two lobes splayed out from the tip, across the way the tail is going
    ex, ey = pts[-1]; px_, py_ = pts[-3]; ang = math.atan2(ey - py_, ex - px_)
    fin = Part(fr, C['legOut'], group='tail')
    for da in (-0.9, 0.9):
        c = (ex + math.cos(ang + da) * 4, ey + math.sin(ang + da) * 4); fin.cap((ex, ey), c, 1.6, C['finPal'], 2.6)
    fin.lay()

def crop(fr):
    """cut to the drawing, keeping the feet at the bottom centre"""
    im = fr.im; bb = im.getbbox()
    if not bb: return Image.new('RGBA', (2, 2), (0, 0, 0, 0))
    half = max(fr.ox - bb[0], bb[2] - fr.ox) + 1; bottom = max(bb[3], fr.oy + 1)
    return im.crop((fr.ox - half, bb[1], fr.ox + half, bottom))

def lying(im):
    """a pose turned on its back: rotated a quarter turn, exact pixels"""
    r = im.transpose(Image.ROTATE_90); return r
