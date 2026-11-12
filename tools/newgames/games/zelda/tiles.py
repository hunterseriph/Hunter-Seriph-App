"""The Legend of Cumhead's own 16-bit art (update 135): every tile, prop and building is a sprite drawn here at the game's
own pixel size (24 px tiles, nothing scaled in the game), so the whole land shares one look with the shop fronts and the
characters. Terrain is autotiled in quarters (RPG Maker A2 style): each 24x24 tile is four 12x12 pieces picked from
F (full), H (edge on the top/bottom), V (edge on the left/right), O (outer corner), I (inner corner), so paths, water,
pits and the tops of cliffs and forests get proper rounded, outlined edges. Walls also get a two-tile face on their south
side (cliff strata, tree trunks, city bricks...). All of it: dark outline, light from the top left, limited ramps."""
import math, random, zlib
def sh(*a): return zlib.crc32(repr(a).encode())
import numpy as np
from PIL import Image

OUT = (18, 4, 10, 255)
def hx(s):
    s = s.lstrip('#'); return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), 255)
def R(*cs): return [hx(c) for c in cs]
def blank(w, h): return np.zeros((h, w, 4), np.uint8)
def img(a): return Image.fromarray(a, 'RGBA')
def put(a, x, y, c):
    h, w = a.shape[:2]
    if 0 <= x < w and 0 <= y < h: a[y, x] = c
def wput(a, x, y, c): # wrapping put, for tileable textures
    h, w = a.shape[:2]; a[y % h, x % w] = c

# ---------------------------------------------------------------- shading
def shade(mask, ramp, base=2, out=True, grad=0.0, seed=0, dith=0.0, lit=True):
    """fill a boolean mask with a ramp: light rim on the top left, dark on the bottom right, a soft vertical darkening
    (grad, in ramp steps over the height, dithered), speckle (dith), and the house outline round it"""
    h, w = mask.shape; a = blank(w, h); rnd = random.Random(seed); n = len(ramp) - 1
    ys = np.where(mask.any(axis=1))[0]
    if not len(ys): return a
    top, bot = ys[0], ys[-1]
    def m(x, y): return 0 <= x < w and 0 <= y < h and mask[y, x]
    for y in range(h):
        for x in range(w):
            if not mask[y, x]: continue
            t = float(base)
            if grad: t -= grad * (y - top) / max(1, bot - top)
            if lit:
                if not m(x, y - 1) or not m(x - 1, y): t += 2
                elif not m(x, y - 2) or not m(x - 2, y): t += 1
                if not m(x, y + 1) or not m(x + 1, y): t -= 2
                elif not m(x, y + 2) or not m(x + 2, y): t -= 1
            fr = t - math.floor(t); ti = int(math.floor(t))
            if fr > 0.01 and ((x + y) % 2 == 0) == (fr > 0.5): ti += 1
            if dith and rnd.random() < dith: ti += rnd.choice((-1, 1))
            a[y, x] = ramp[max(0, min(n, ti))]
    if out: outline(a, mask)
    return a
def outline(a, mask, col=OUT):
    h, w = mask.shape
    for y in range(h):
        for x in range(w):
            if mask[y, x]: continue
            if any(0 <= x + dx < w and 0 <= y + dy < h and mask[y + dy, x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): a[y, x] = col
def M(w, h): return np.zeros((h, w), bool)
def ell(m, cx, cy, rx, ry, v=True):
    h, w = m.shape
    for y in range(h):
        for x in range(w):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1: m[y, x] = v
    return m
def rect(m, x, y, w, h, v=True): m[max(0, y):y + h, max(0, x):x + w] = v; return m
def poly(m, pts, v=True):
    h, w = m.shape; n = len(pts)
    for y in range(h):
        for x in range(w):
            px, py = x + 0.5, y + 0.5; ins = False; j = n - 1
            for i in range(n):
                xi, yi = pts[i]; xj, yj = pts[j]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi: ins = not ins
                j = i
            if ins: m[y, x] = v
    return m
def line(m, x0, y0, x1, y1, r=0.6, v=True):
    h, w = m.shape; n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
    for i in range(n + 1):
        t = i / n; cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                if 0 <= x < w and 0 <= y < h and (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r: m[y, x] = v
    return m
def over(dst, src, x=0, y=0):
    """paste src onto dst (numpy RGBA), alpha 0/255 only"""
    h, w = src.shape[:2]; H, W = dst.shape[:2]
    for yy in range(h):
        for xx in range(w):
            if src[yy, xx, 3] and 0 <= x + xx < W and 0 <= y + yy < H: dst[y + yy, x + xx] = src[yy, xx]
    return dst
def part(dst, mask, ramp, x=0, y=0, **k): return over(dst, shade(mask, ramp, **k), x, y)

# ---------------------------------------------------------------- palettes
GROUND = { # darkest .. lightest
    'moors': R('#120709', '#1e0d0f', '#2a1315', '#38191b', '#4a2224'),
    'wood': R('#0e060c', '#170a14', '#21101c', '#2c1626', '#3c2034'),
    'marsh': R('#171208', '#261e10', '#352a18', '#463822', '#5a4a2e'),
    'bones': R('#1c1612', '#2c241e', '#3c322a', '#4e4236', '#6a5a48'),
    'peaks': R('#171214', '#261e20', '#352a2c', '#46383a', '#5c4a4c'),
    'park': R('#14040e', '#200818', '#2c0e22', '#3a142e', '#4e1e3e'),
    'wastes': R('#120614', '#1e0a22', '#2a1030', '#3a1842', '#4e2258'),
    'shore': R('#241810', '#36261a', '#4a3624', '#604830', '#7a5e3e'),
    'city': R('#120c0e', '#1e1618', '#2a2022', '#382c2e', '#4a3c3c'),
}
TUFT = {'moors': R('#1a0a0c', '#3a1416', '#5a1c20', '#7a2428', '#9a3434'), 'wood': R('#120810', '#2a1022', '#40182e', '#58203c', '#70304e'), 'park': R('#14040e', '#3a0c26', '#561438', '#741e4a', '#98305e')}
def tex_ground(b, v):
    """24x24 tileable ground: base tone, dithered clumps of light and dark, then the biome's own bits"""
    ramp = GROUND[b]; rnd = random.Random(sh((b, v)) & 0xffff); a = blank(24, 24); a[:, :] = ramp[2]
    if b == 'city': # cobbles
        for row in range(4):
            off = (row % 2) * 4 + v * 2
            for col in range(3):
                x0, y0 = (col * 8 + off) % 24, row * 6; t = rnd.choice((2, 3, 3))
                for yy in range(5):
                    for xx in range(7):
                        c = ramp[t]
                        if yy == 0 or xx == 0: c = ramp[min(4, t + 1)]
                        if yy == 4 or xx == 6: c = ramp[t - 1]
                        wput(a, x0 + xx, y0 + yy, c)
                for xx in range(8): wput(a, x0 + xx, y0 + 5, ramp[0])
                wput(a, x0 + 7, y0 + 2, ramp[0]); wput(a, x0 + 7, y0 + 3, ramp[0])
        return a
    for _ in range(4): # soft lighter patches, dithered at the rim
        cx, cy, r = rnd.randrange(24), rnd.randrange(24), rnd.uniform(2.5, 4.5)
        for yy in range(-6, 7):
            for xx in range(-6, 7):
                d = math.hypot(xx, yy * 1.3)
                if d < r - 1.3 or (d < r and (cx + xx + cy + yy) % 2 == 0): wput(a, cx + xx, cy + yy, ramp[3])
    for _ in range(9): wput(a, rnd.randrange(24), rnd.randrange(24), ramp[1])
    for _ in range(3): wput(a, rnd.randrange(24), rnd.randrange(24), ramp[4])
    if b in ('moors', 'wood', 'park'): # grass tufts
        for _ in range(1 + v // 2):
            x, y = rnd.randrange(2, 21), rnd.randrange(3, 21)
            for (dx, dy, t) in ((0, 0, 3), (0, -1, 4), (-1, -2, 4), (2, 0, 3), (2, -1, 4), (3, -2, 4), (1, 0, 3), (1, -1, 3)):
                put(a, x + dx, y + dy, TUFT.get(b, ramp)[t])
            for dx in range(-1, 4): put(a, x + dx, y + 1, ramp[1])
    if b == 'wood': # fallen leaves
        for _ in range(3): x, y = rnd.randrange(1, 22), rnd.randrange(1, 22); put(a, x, y, hx('#7a1420')); put(a, x + 1, y, hx('#a02030')); put(a, x, y + 1, hx('#4a0a12'))
    if b == 'marsh': # little puddles
        for _ in range(2 if v < 2 else 0):
            x, y = rnd.randrange(3, 18), rnd.randrange(3, 20)
            for xx in range(4): put(a, x + xx, y, hx('#5e5034')); put(a, x + xx, y + 1, hx('#2a2214'))
            put(a, x + 1, y, hx('#c8b880'))
    if b == 'bones':
        for _ in range(2):
            x, y = rnd.randrange(2, 20), rnd.randrange(2, 20); put(a, x, y, hx('#d8ccb0')); put(a, x + 1, y, hx('#b8aa88')); put(a, x + 2, y + 1, hx('#d8ccb0')); put(a, x, y + 1, ramp[0])
    if b == 'park':
        for _ in range(2): put(a, rnd.randrange(24), rnd.randrange(24), hx(rnd.choice(('#ffe36a', '#ff2630', '#f1e7d0'))))
    if b == 'wastes':
        for _ in range(2): x, y = rnd.randrange(2, 21), rnd.randrange(2, 21); put(a, x, y, hx('#9a50c8')); put(a, x + 1, y, hx('#642088')); put(a, x, y + 1, hx('#2e0c44'))
    if b == 'peaks':
        for _ in range(3):
            x, y = rnd.randrange(2, 20), rnd.randrange(2, 20); put(a, x, y, ramp[4]); put(a, x + 1, y, ramp[3]); put(a, x, y + 1, ramp[1]); put(a, x + 1, y + 1, ramp[0])
    if b == 'shore':
        for _ in range(3): x, y = rnd.randrange(1, 22), rnd.randrange(1, 22); put(a, x, y, ramp[4]); put(a, x + 1, y + 1, ramp[1])
    return a

# ---------------------------------------------------------------- autotile terrains
def leafy(ramp, seed, r=5.0, step=8, berries=None):
    """tileable canopy: shaded leaf clusters on a jittered grid"""
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = ramp[0]
    pts = []
    for gy in range(0, 24, step):
        for gx in range(0, 24, step): pts.append((gx + rnd.uniform(0, step * 0.6) + (gy // step % 2) * step / 2, gy + rnd.uniform(0, step * 0.5)))
    pts.sort(key=lambda p: p[1])
    for (cx, cy) in pts:
        for yy in range(-7, 8):
            for xx in range(-7, 8):
                d = math.hypot(xx, yy * 1.1)
                if d > r: continue
                t = 2
                if math.hypot(xx + 1.6, yy + 1.8) < r * 0.45: t = 4
                elif math.hypot(xx + 1, yy + 1) < r * 0.75: t = 3
                if yy > r * 0.45 or d > r - 0.9: t = 1
                wput(a, int(cx + xx), int(cy + yy), ramp[t])
    if berries:
        for _ in range(3): x, y = rnd.randrange(24), rnd.randrange(24); wput(a, x, y, hx(berries)); wput(a, x + 1, y + 1, ramp[0])
    return a
def noisy(ramp, seed, chunks=6, cracks=4, bits=None):
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = ramp[2]
    for _ in range(chunks): # rock plates
        cx, cy, rw, rh = rnd.randrange(24), rnd.randrange(24), rnd.randint(4, 8), rnd.randint(3, 6)
        for yy in range(rh):
            for xx in range(rw):
                t = 3 if yy == 0 or xx == 0 else 1 if yy == rh - 1 or xx == rw - 1 else 2
                wput(a, cx + xx, cy + yy, ramp[t])
    for _ in range(cracks):
        x, y = rnd.randrange(24), rnd.randrange(24)
        for k in range(rnd.randint(3, 6)): wput(a, x, y, ramp[0]); x += rnd.choice((-1, 0, 1)); y += 1
    for _ in range(10): wput(a, rnd.randrange(24), rnd.randrange(24), ramp[rnd.choice((1, 3))])
    if bits:
        for _ in range(2): x, y = rnd.randrange(24), rnd.randrange(24); wput(a, x, y, hx(bits)); wput(a, x + 1, y, hx(bits)); wput(a, x, y + 1, ramp[0])
    return a
def rocktop(ramp, seed, bits=None):
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = ramp[1]
    hi = tuple(min(255, int(v * 1.12)) for v in ramp[4][:3]) + (255,)
    stones = [(rnd.uniform(0, 24), rnd.uniform(0, 24), rnd.uniform(3.2, 5.6), rnd.uniform(2.6, 4.2)) for _ in range(11)]
    stones.sort(key=lambda t: t[1])
    for (cx, cy, rx, ry) in stones:
        for y in range(-6, 30):
            for x in range(-6, 30):
                dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry; d = dx * dx + dy * dy
                if d > 1: continue
                t = 3
                if dx + dy < -0.55: t = 4
                if dx + dy > 0.6: t = 2
                c = ramp[t]
                if dx + dy < -1.05: c = hi
                if d > 0.78 and dx + dy > 0: c = ramp[1]
                a[y % 24, x % 24] = c
    for _ in range(3):
        x, y = rnd.randrange(24), rnd.randrange(24)
        for k in range(rnd.randint(2, 4)): wput(a, x, y, ramp[0]); x += rnd.choice((-1, 1)); y += rnd.choice((0, 1))
    for _ in range(8): wput(a, rnd.randrange(24), rnd.randrange(24), ramp[rnd.choice((2, 4))])
    if bits:
        for _ in range(2): x, y = rnd.randrange(24), rnd.randrange(24); wput(a, x, y, hx(bits)); wput(a, x + 1, y, hx(bits)); wput(a, x, y + 1, ramp[1])
    return a
def waterfill(ramp, seed):
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = ramp[1]
    for y in range(24):
        for x in range(24):
            if (x + y * 3) % 7 == 0 and rnd.random() < 0.5: a[y, x] = ramp[2]
    for _ in range(4):
        x, y = rnd.randrange(24), rnd.randrange(24)
        for k in range(rnd.randint(3, 6)): wput(a, x + k, y, ramp[3 if k else 4])
    return a
def pathfill(ramp, seed, stone=False):
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = ramp[2]
    if stone:
        for row in range(3):
            off = (row % 2) * 6
            for col in range(2):
                x0, y0 = col * 12 + off, row * 8
                for yy in range(7):
                    for xx in range(11):
                        t = 3 if yy == 0 or xx == 0 else 1 if yy == 6 or xx == 10 else 2
                        wput(a, x0 + xx, y0 + yy, ramp[t])
                for xx in range(12): wput(a, x0 + xx, y0 + 7, ramp[0])
                for yy in range(8): wput(a, x0 + 11, y0 + yy, ramp[0])
        for _ in range(6): wput(a, rnd.randrange(24), rnd.randrange(24), ramp[rnd.choice((1, 3))])
        return a
    for _ in range(16): wput(a, rnd.randrange(24), rnd.randrange(24), ramp[rnd.choice((1, 3))])
    for _ in range(5): # pebbles
        x, y = rnd.randrange(24), rnd.randrange(24); wput(a, x, y, ramp[4]); wput(a, x + 1, y, ramp[3]); wput(a, x, y + 1, ramp[0]); wput(a, x + 1, y + 1, ramp[1])
    for _ in range(2): # cart ruts
        y = rnd.randrange(24)
        for x in range(rnd.randrange(24), rnd.randrange(24) + 6): wput(a, x, y, ramp[1])
    return a
def pitfill(seed): a = blank(24, 24); a[:, :] = hx('#050203'); return a

TERR = {} # name -> (style, fills[], ramp, extra)
def terr(name, style, fills, ramp, **k): TERR[name] = (style, fills, ramp, k)
CANOPY = R('#120408', '#24080e', '#3a0e16', '#561620', '#742228')
CANOPYW = R('#0e0408', '#1c0812', '#2c0e1c', '#401628', '#582036')
HEDGE = R('#160410', '#28081c', '#3c0e2a', '#541838', '#702448')
ROCK = R('#141012', '#221a1c', '#32282a', '#46383a', '#5e4c4c')
BONEROCK = R('#1e1814', '#30281e', '#44382c', '#5e4e3c', '#7e6a52')
SLATE = R('#100a0c', '#1c1416', '#2a2022', '#3a2e30', '#4c3e40')
THORN = R('#0e0610', '#1a0a1e', '#28102c', '#3a1a40', '#4e2656')
REED = R('#141008', '#221c0e', '#322a14', '#44391c', '#5a4c26')
DIRT = R('#1a120c', '#281c12', '#38281a', '#4a3624', '#5e4630')
FLAG = R('#141012', '#221c1e', '#322a2c', '#443a3a', '#5a4e4c')
BLOOD = R('#200206', '#3a050c', '#5a0a14', '#7a1420', '#b02a34')
CREAM = R('#5e5034', '#9a8a62', '#c8b880', '#e4d6a6', '#fff6dc')
GOO = R('#1a0626', '#2e0c44', '#481466', '#642088', '#9a50c8')

def thornfill(seed):
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = THORN[0]
    for _ in range(9):
        x, y = rnd.uniform(0, 24), rnd.uniform(0, 24); ang = rnd.uniform(0, 6.3)
        for k in range(14):
            x += math.cos(ang); y += math.sin(ang); ang += rnd.uniform(-0.5, 0.5)
            wput(a, int(x), int(y), THORN[3 if k % 3 else 4]); wput(a, int(x), int(y) + 1, THORN[1])
            if k % 5 == 2: wput(a, int(x) + 1, int(y) - 1, hx('#c4121c'))
    return a
def reedfill(seed):
    rnd = random.Random(seed); a = blank(24, 24); a[:, :] = REED[1]
    for _ in range(26):
        x, y = rnd.randrange(24), rnd.randrange(24); hgt = rnd.randint(4, 8)
        for k in range(hgt): wput(a, x, y - k, REED[2 if k < 2 else 3]); wput(a, x + 1, y - k, REED[0])
        wput(a, x, y - hgt, REED[4]);
        if rnd.random() < 0.3: wput(a, x, y - hgt - 1, hx('#e4d6a6'))
    return a
def cwallfill(seed):
    a = blank(24, 24); a[:, :] = SLATE[2]
    for row in range(4):
        off = (row % 2) * 6
        for col in range(2):
            x0, y0 = col * 12 + off, row * 6
            for yy in range(5):
                for xx in range(11):
                    t = 3 if yy == 0 else 1 if yy == 4 else 2
                    wput(a, x0 + xx, y0 + yy, SLATE[t])
            for xx in range(12): wput(a, x0 + xx, y0 + 5, SLATE[0])
            for yy in range(6): wput(a, x0 + 11, y0 + yy, SLATE[0])
    return a

terr('forest', 'top', [leafy(CANOPY, s, berries='#c4121c' if s == 1 else None) for s in range(3)], CANOPY)
terr('woodsy', 'top', [leafy(CANOPYW, 10 + s, r=5.5, berries='#7a2a8a' if s == 2 else None) for s in range(3)], CANOPYW)
terr('hedge', 'top', [leafy(HEDGE, 20 + s, r=3.6, step=6) for s in range(3)], HEDGE)
terr('cliff', 'top', [rocktop(ROCK, 30 + s) for s in range(3)], ROCK)
terr('bonecliff', 'top', [rocktop(BONEROCK, 40 + s, bits='#e8dcc0') for s in range(3)], BONEROCK)
terr('cwall', 'top', [cwallfill(50)], SLATE)
terr('thorns', 'top', [thornfill(60 + s) for s in range(3)], THORN)
terr('reeds', 'top', [reedfill(70 + s) for s in range(3)], REED)
terr('dirt', 'soft', [pathfill(DIRT, 80 + s) for s in range(3)], DIRT)
terr('flag', 'soft', [pathfill(FLAG, 90 + s, True) for s in range(2)], FLAG)
terr('sand', 'soft', [tex_ground('shore', s) for s in range(3)], GROUND['shore'])
terr('blood', 'bank', [waterfill(BLOOD, 100 + s) for s in range(2)], BLOOD)
terr('cream', 'bank', [waterfill(CREAM, 110 + s) for s in range(2)], CREAM)
terr('goo', 'bank', [waterfill(GOO, 120 + s) for s in range(2)], GOO)
terr('pit', 'pit', [pitfill(0)], ROCK)
RUG = R('#3a0610', '#5a0a14', '#7a1420', '#9a2028', '#ffe36a')
def rugfill(seed):
    a = blank(24, 24); a[:, :] = RUG[2]
    for y in range(24):
        for x in range(24):
            if (x + y) % 12 == 0 or (x - y) % 12 == 0: a[y, x] = RUG[1]
            if (x % 12 == 6 and y % 12 == 6): a[y, x] = RUG[4]
    return a
terr('rug', 'rug', [rugfill(0)], RUG)

def ragged(pos, amp, seed):
    """edge wobble along an edge, periodic every 24 px so neighbouring tiles join"""
    if not amp: return 0
    return int(round(amp * (0.5 + 0.5 * math.sin(pos * 2 * math.pi / 24 * 2 + seed) * math.cos(pos * 2 * math.pi / 24 + seed * 1.7))))
STY = {'top': dict(e=1, r=5, amp=1), 'soft': dict(e=2, r=6, amp=2), 'bank': dict(e=2, r=6, amp=1), 'pit': dict(e=1, r=3, amp=0), 'rug': dict(e=1, r=1, amp=0)}
def quarter(name, qx, qy, case, fill):
    """one 12x12 quarter of terrain `name` at quarter position qx,qy (0 = left/top) for edge case F/H/V/O/I"""
    style, fills, ramp, k = TERR[name]; s = STY[style]; e0, rr, amp = s['e'], s['r'], s['amp']; seed = sh(name) % 7
    q = blank(12, 12); ox, oy = qx * 12, qy * 12
    for y in range(12):
        for x in range(12):
            X, Y = ox + x, oy + y
            dh = X if qx == 0 else 23 - X # distance to the left/right side of the tile
            dv = Y if qy == 0 else 23 - Y
            eh = e0 + ragged(Y, amp, seed); ev = e0 + ragged(X, amp, seed + 3)
            if style == 'top':
                eh = 0 # sides line up with the outline of the face below
                if qy == 1: ev = 0 # the south edge of a wall top sits right on its face
            side = None
            if case == 'F': d = 99
            elif case == 'H': d = dv - ev; side = 'T' if qy == 0 else 'B'
            elif case == 'V': d = dh - eh; side = 'L' if qx == 0 else 'R'
            elif case == 'O':
                cx, cy = max(0, rr + e0 - dh), max(0, rr + e0 - dv)
                if cx > 0 and cy > 0: d = rr - math.hypot(cx, cy); side = ('T' if qy == 0 else 'B') if cy >= cx else ('L' if qx == 0 else 'R')
                else:
                    d = min(dh - eh, dv - ev); side = ('L' if qx == 0 else 'R') if dh - eh < dv - ev else ('T' if qy == 0 else 'B')
            else: # I: notch at the diagonal corner
                d = math.hypot(dh + 0.5, dv + 0.5) - (e0 + 1.5); side = ('T' if qy == 0 else 'B') if dv < dh else ('L' if qx == 0 else 'R')
            if d < 0: continue
            c = fill[Y % 24, X % 24]
            lightside = side in ('T', 'L')
            if style == 'top':
                if d < 1: c = OUT
                elif d < 2: c = ramp[4] if lightside else ramp[0]
                elif d < 3 and lightside: c = ramp[3]
                if side == 'B' and d < 3: c = fill[Y % 24, X % 24] # never a line where the top meets its face
            elif style == 'soft':
                if d < 1: c = ramp[1] if (X + Y) % 2 else ramp[0]
                elif d < 2: c = ramp[1]
            elif style == 'bank':
                if d < 1: c = OUT
                elif d < 2: c = ramp[0] if lightside else ramp[3]
                elif d < 3: c = ramp[4] if lightside and (X + Y) % 3 else c
            elif style == 'pit':
                if d < 1: c = OUT
                elif side == 'T' and d < 8: c = [ROCK[3], ROCK[2], ROCK[2], ROCK[1], ROCK[1], ROCK[0], ROCK[0], hx('#0a0406')][int(d - 1)] if (X % 7) else ROCK[0]
                elif d < 2: c = hx('#1a0c10')
            elif style == 'rug':
                if d < 1: c = OUT
                elif d < 2: c = ramp[0]
                elif d < 3: c = ramp[4]
                elif d < 4: c = ramp[0]
            q[y, x] = c
    return q

# ---------------------------------------------------------------- wall faces (the two tiles under a cliff, a forest, a city wall)
FACE = {}
def face_tile(kind, pos, row, cave=False):
    a = blank(24, 24); rnd = random.Random(sh((kind, pos, row)) & 0xfff)
    if kind in ('forest', 'woodsy', 'hedge'):
        can = {'forest': CANOPY, 'woodsy': CANOPYW, 'hedge': HEDGE}[kind]
        a[:, :] = hx('#0a0306')
        if kind == 'hedge':
            for y in range(24):
                for x in range(24):
                    t = 2 if (x // 3) % 2 else 1
                    if y > 18 - row * 6: t = max(0, t - 1)
                    a[y, x] = can[t]
                    if (x + y * 2) % 9 == 0: a[y, x] = can[3]
            if row == 1:
                for x in range(24): a[23, x] = OUT; a[22, x] = can[0]
        else:
            trunk = R('#120808', '#1e0e0c', '#2c1610', '#3e2016', '#52301e')
            for tx in ((3, 15) if row else (8, 19)):
                w = 5
                for y in range(24):
                    for x in range(tx, tx + w):
                        t = 3 if x == tx else 1 if x == tx + w - 1 else 2
                        a[y, x] = trunk[t]
                    a[y, tx - 1] = OUT; a[y, min(23, tx + w)] = OUT
                if row == 1: # roots
                    for k in range(3): put(a, tx - 2 - k, 20 + k, trunk[1]); put(a, tx + w + 1 + k, 20 + k, trunk[1])
            if row == 0: # canopy hanging over the trunks
                for x in range(24):
                    hgt = 7 + int(3 * (0.5 + 0.5 * math.sin(x * 0.9 + 1))) + (x % 3 == 0)
                    for y in range(hgt): a[y, x] = can[2 if y < hgt - 3 else 1]
                    a[hgt, x] = OUT
                    if hgt > 2: a[1, x] = can[3]
            if row == 1:
                for x in range(24): a[23, x] = hx('#0a0306')
    elif kind in ('cliff', 'bonecliff'):
        rp = ROCK if kind == 'cliff' else BONEROCK; a[:, :] = rp[0]
        # stacked boulders, wrapping left/right so faces join: bigger ones low down, lit from the top left
        rr = random.Random(sh(kind, row, pos) & 0xffff)
        blobs = []
        for k in range(9 if row else 8):
            cx = rr.uniform(0, 24); cy = rr.uniform(1, 22) if row else rr.uniform(-1, 20); rx = rr.uniform(4, 7) + row * 1.2; ry = rx * rr.uniform(0.6, 0.85)
            blobs.append((cy, cx, rx, ry))
        blobs.sort()
        for (cy, cx, rx, ry) in blobs:
            for y in range(24):
                for x in range(-8, 32):
                    dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry; d = dx * dx + dy * dy
                    if d > 1: continue
                    t = 2
                    if dx < -0.25 and dy < 0.2: t = 3
                    if dx + dy < -0.9: t = 4
                    if dx + dy > 0.7 or dy > 0.6: t = 1
                    if d > 0.82: t = 0 if (dx + dy > -0.3) else 1
                    a[y, x % 24] = rp[t]
        if row == 0: # the lip: the edge of the top, lit, crumbling into the face
            for x in range(24):
                lip = 2 + (sh(kind, x // 3) % 2)
                for y in range(lip): a[y, x] = rp[4] if y == 0 else rp[3]
                a[lip, x] = rp[1] if (x + lip) % 4 else rp[0]
        if row == 1:
            for x in range(24): a[23, x] = OUT; a[22, x] = rp[0]
        if kind == 'bonecliff' and rr.random() < 0.5:
            sx, sy = rr.randrange(4, 14), rr.randrange(6, 13); m = ell(M(24, 24), sx + 3, sy + 3, 3.2, 3)
            part(a, m, R('#5a4e3a', '#8a7a5e', '#c8bca0', '#e8dcc0', '#fff4dc'))
            put(a, sx + 2, sy + 3, OUT); put(a, sx + 4, sy + 3, OUT); put(a, sx + 3, sy + 5, OUT)
    elif kind == 'cwall':
        for y in range(24):
            for x in range(24):
                yy = y + row * 24; off = ((yy // 6) % 2) * 6
                t = 2 if ((x + off) // 12 + yy // 6) % 3 else 1
                if yy % 6 == 0: t = 3
                if yy % 6 == 5 or (x + off) % 12 == 11: t = 0
                a[y, x] = SLATE[t]
        if row == 1:
            for y in range(18, 24):
                for x in range(24): a[y, x] = SLATE[1] if y > 18 else SLATE[3]
            for x in range(24): a[23, x] = OUT
        if row == 0 and pos == 'M' and rnd.random() < 0.35: # an arrow slit with red light
            for y in range(6, 16): put(a, 11, y, OUT); put(a, 12, y, hx('#c4121c') if 8 < y < 14 else OUT)
    elif kind == 'thorns':
        a[:, :] = THORN[0]
        for _ in range(16):
            x = rnd.randrange(24); y = rnd.randrange(24) if row == 0 else rnd.randrange(16)
            for k in range(rnd.randint(6, 12)):
                put(a, x, y, THORN[2 + (k % 2)]); x += rnd.choice((-1, 0, 1)); y += 1
                if k % 4 == 3: put(a, x + 1, y, hx('#c4121c'))
        if row == 1:
            for x in range(24): a[23, x] = OUT
    elif kind == 'reeds':
        a[:, :] = REED[0]
        for x in range(0, 24, 2):
            top = rnd.randrange(0, 6) if row == 0 else 0
            for y in range(top, 24): a[y, x] = REED[2 if (y + x) % 5 else 3]; put(a, x + 1, y, REED[1])
            if row == 0: put(a, x, top, REED[4]); put(a, x, top - 1, hx('#e4d6a6'))
        if row == 1:
            for x in range(24): a[22, x] = hx('#5e5034'); a[23, x] = OUT
    else: # dungeon walls: kind 'dw_<n>'
        rp = DGPAL[kind[3:]]['wall']
        for y in range(24):
            for x in range(24):
                yy = y + row * 24; off = ((yy // 8) % 2) * 8
                t = 2 if ((x + off) // 16 + yy // 8) % 2 else 1
                if yy % 8 == 0: t = 3
                if yy % 8 == 7 or (x + off) % 16 == 15: t = 0
                a[y, x] = rp[t]
        if row == 1:
            for y in range(19, 24):
                for x in range(24): a[y, x] = rp[0] if y > 19 else rp[3]
            for x in range(24): a[23, x] = OUT
    # ends: a dark outline and a lit/shaded edge where the face stops
    if pos in ('L', 'S'):
        for y in range(24): a[y, 0] = OUT; a[y, 1] = a[y, 1] if kind in ('forest', 'woodsy') else _tint(a[y, 1], 1.3)
    if pos in ('R', 'S'):
        for y in range(24): a[y, 23] = OUT; a[y, 22] = _tint(a[y, 22], 0.6)
    if cave: # a cave mouth: a black arch over both rows
        for y in range(24):
            for x in range(24):
                Y = y + row * 24; dx = x - 11.5
                inside = (Y >= 14 and abs(dx) <= 9) and (Y >= 22 or (dx * dx) / 81 + ((Y - 22) ** 2) / 64 <= 1)
                rim = (Y >= 12 and abs(dx) <= 11) and (Y >= 22 or (dx * dx) / 121 + ((Y - 22) ** 2) / 100 <= 1)
                if inside: a[y, x] = hx('#050203') if Y > 20 else hx('#0e0608')
                elif rim: a[y, x] = OUT if (abs(dx) > 9.5 or Y < 14) else a[y, x]
        if row == 1:
            for x in range(4, 20): a[23, x] = hx('#1a0c10')
    return a
def _tint(c, k): return (min(255, int(c[0] * k)), min(255, int(c[1] * k)), min(255, int(c[2] * k)), 255)

def ledge(pos):
    a = blank(24, 24); er = R('#1a0c08', '#2a140e', '#3a1e14', '#4e2a1c', '#6a3a26')
    for y in range(9, 24):
        for x in range(24):
            if y == 9: a[y, x] = OUT
            elif y < 12: a[y, x] = er[4] if y == 10 else er[3]
            elif y < 22: a[y, x] = er[2 if (x // 4 + y // 3) % 2 else 1]
            elif y < 23: a[y, x] = er[0]
            else: a[y, x] = OUT
    for x in range(0, 24, 5): put(a, x, 13, er[0]); put(a, x + 1, 17, er[0])
    if pos in ('L', 'S'):
        for y in range(9, 24): a[y, 0] = OUT
    if pos in ('R', 'S'):
        for y in range(9, 24): a[y, 23] = OUT
    return a

# ---------------------------------------------------------------- dungeons
DGPAL = {
    'sewer': dict(floor=R('#1a160e', '#2a2416', '#3a3220', '#4a402a', '#5e5236'), wall=R('#1e1a10', '#34301e', '#4a442c', '#5e573a', '#7a7250'), water='cream'),
    'skull': dict(floor=R('#1e1814', '#2e2620', '#3e342c', '#504438', '#6a5a4a'), wall=R('#2a2218', '#463a2a', '#62523c', '#807050', '#a8966e'), water='blood'),
    'funhouse': dict(floor=R('#1a0612', '#2c0a1e', '#3c102a', '#521a3a', '#6e264e'), wall=R('#2a0a1a', '#4a1430', '#6a1e44', '#8a2c5a', '#b24476'), water='cream'),
    'factory': dict(floor=R('#140c0a', '#221410', '#301c16', '#40261e', '#563428'), wall=R('#1e0c08', '#3a1610', '#5a2218', '#7a3224', '#a04a34'), water='blood'),
    'lair': dict(floor=R('#120410', '#1e081a', '#2c0e26', '#3c1634', '#542246'), wall=R('#1e0614', '#360c26', '#52143a', '#701e50', '#962c6c'), water='goo'),
}
def dg_floor(k, v):
    rp = DGPAL[k]['floor']; a = blank(24, 24); rnd = random.Random(sh((k, v)) & 0xffff)
    if k == 'funhouse': # checker
        for y in range(24):
            for x in range(24): a[y, x] = rp[3] if ((x // 12) + (y // 12)) % 2 else rp[1]
        for x in range(24): a[0, x] = rp[4]; a[12, x] = rp[0]
        return a
    if k == 'factory': # riveted plates
        a[:, :] = rp[2]
        for y in range(24): a[y, 0] = rp[0]; a[y, 23] = rp[1]
        for x in range(24): a[0, x] = rp[3]; a[23, x] = rp[0]
        for (x, y) in ((3, 3), (20, 3), (3, 20), (20, 20)): put(a, x, y, rp[4]); put(a, x + 1, y + 1, rp[0])
        if v == 1:
            for x in range(4, 20, 2): put(a, x, 11, rp[1]); put(a, x, 12, rp[3])
        return a
    if k == 'lair': # flesh
        a[:, :] = rp[2]
        for _ in range(7):
            cx, cy = rnd.randrange(24), rnd.randrange(24)
            for yy in range(-3, 4):
                for xx in range(-4, 5):
                    if xx * xx / 16 + yy * yy / 9 <= 1: wput(a, cx + xx, cy + yy, rp[3] if yy < 0 else rp[1])
        for _ in range(2):
            x, y = rnd.randrange(24), rnd.randrange(24)
            for kk in range(10): wput(a, x, y, hx('#c4121c')); x += 1; y += rnd.choice((-1, 0, 1))
        return a
    # stone flags (sewer, skull)
    for yy in range(0, 24, 12):
        for xx in range(0, 24, 12):
            t = rnd.choice((2, 2, 3, 1))
            for y in range(12):
                for x in range(12):
                    c = rp[t]
                    if y == 0 or x == 0: c = rp[min(4, t + 1)]
                    if y == 11 or x == 11: c = rp[0]
                    a[yy + y, xx + x] = c
    if k == 'skull' and v == 2:
        m = ell(M(24, 24), 12, 12, 4, 3.5); part(a, m, R('#5a4e3a', '#8a7a5e', '#c8bca0', '#e8dcc0', '#fff4dc')); put(a, 10, 12, OUT); put(a, 13, 12, OUT)
    if k == 'sewer' and v == 2:
        for x in range(4, 20): put(a, x, 12, hx('#c8b880')); put(a, x, 13, hx('#5e5034'))
    return a
for k in DGPAL: terr('dw_' + k, 'top', [noisy(DGPAL[k]['wall'], 200 + i) for i in range(2)], DGPAL[k]['wall'])

# ---------------------------------------------------------------- props (anchored at the bottom centre in the game)
WOODR = R('#120806', '#22120c', '#341c12', '#4a2a1a', '#643a24')
IRON = R('#0e0c10', '#1e1a20', '#322c34', '#4a444e', '#6e6874')
BONE = R('#3a3024', '#6a5e48', '#a89a7a', '#d8ccb0', '#fff4dc')
STONE = R('#16121a', '#262028', '#38303a', '#4c4250', '#665a6a')
REDR = R('#2a0408', '#5a0a10', '#8a1018', '#c4121c', '#ff4a50')
GOLD = R('#3a2a08', '#7a5a10', '#b88a20', '#ffc840', '#fff09a')
P = {}
def prop(fn):
    P[fn.__name__] = fn; return fn

def tree(kind):
    if kind == 'pine':
        w, h = 30, 56; a = blank(w, h)
        part(a, rect(M(w, h), 12, 44, 6, 12), WOODR)
        m = M(w, h)
        for k, (y, r) in enumerate(((4, 5), (12, 8), (20, 11), (29, 13), (38, 14))): poly(m, [(15, y - 6), (15 + r, y + 8), (15 - r, y + 8)])
        part(a, m, CANOPYW, base=2, grad=1.2)
        return a
    if kind == 'dead':
        w, h = 36, 52; a = blank(w, h); m = M(w, h)
        line(m, 18, 51, 18, 18, 2.6); line(m, 18, 30, 7, 14, 1.4); line(m, 7, 14, 4, 6, 0.9); line(m, 18, 24, 30, 10, 1.4); line(m, 30, 10, 33, 3, 0.9); line(m, 18, 18, 15, 4, 1.1); line(m, 24, 17, 27, 12, 0.8); line(m, 11, 22, 8, 21, 0.8)
        part(a, m, R('#100608', '#1e0e10', '#2e1a1c', '#42282a', '#5a3a3c'))
        return a
    if kind == 'goo':
        w, h = 36, 50; a = blank(w, h)
        part(a, rect(M(w, h), 15, 34, 6, 16), R('#100610', '#1e0c1e', '#2e1430', '#402044', '#56305c'))
        m = M(w, h); ell(m, 18, 20, 16, 14); ell(m, 9, 30, 4, 5); ell(m, 27, 31, 3, 6)
        part(a, m, GOO, base=2, grad=1)
        for x in (8, 15, 26): put(a, x, 34 + x % 4, hx('#9a50c8')); put(a, x, 35 + x % 4, hx('#642088'))
        return a
    if kind == 'mush':
        w, h = 34, 44; a = blank(w, h)
        part(a, rect(M(w, h), 13, 22, 8, 22), R('#4a4040', '#8a7a70', '#c8bca8', '#e8dcc8', '#fff6e8'))
        m = ell(M(w, h), 17, 16, 16, 12); rect(m, 0, 18, 34, 10, False); ell(m, 17, 18, 16, 4)
        part(a, m, REDR, base=2)
        for (x, y) in ((9, 10), (21, 8), (26, 15), (14, 16)): over(a, shade(ell(M(5, 4), 2.5, 2, 2.2, 1.8), R('#c8bca8', '#e8dcc8', '#f1e7d0', '#fff6e8', '#ffffff')), x, y)
        return a
    # 'red' (moors) and 'wine' (the wood): round crowns of leaves
    can = CANOPY if kind == 'red' else CANOPYW
    w, h = 42, 54; a = blank(w, h)
    m = rect(M(w, h), 17, 34, 8, 20); poly(m, [(13, 54), (17, 46), (17, 54)]); poly(m, [(29, 54), (25, 46), (25, 54)])
    part(a, m, WOODR)
    m = M(w, h)
    for (cx, cy, r) in ((21, 14, 12), (11, 22, 10), (31, 22, 10), (21, 26, 12), (14, 31, 8), (28, 31, 8)): ell(m, cx, cy, r, r * 0.92)
    c = shade(m, can, base=2, grad=1.3)
    for (cx, cy) in ((14, 12), (25, 9), (8, 22), (29, 18), (19, 22), (24, 30), (11, 31)): # leaf clumps catch the light
        for yy in range(-2, 2):
            for xx in range(-3, 3):
                if m[cy + yy, cx + xx] and (xx + yy) % 2 == 0: c[cy + yy, cx + xx] = can[3 if yy < 0 else 2]
    if kind == 'red':
        for (x, y) in ((16, 19), (27, 27), (12, 27), (24, 13)): c[y, x] = hx('#ff2630'); c[y + 1, x] = hx('#5a0a10')
    over(a, c)
    return a
def bush(kind):
    can = {'red': CANOPY, 'wine': CANOPYW, 'olive': REED, 'goo': GOO, 'bone': BONEROCK, 'pink': HEDGE}[kind]
    a = blank(24, 22); m = M(24, 22)
    for (cx, cy, r) in ((8, 11, 6.5), (16, 11, 6.5), (12, 7, 6.5), (12, 14, 7)): ell(m, cx, cy, r, r * 0.85)
    c = shade(m, can, base=2, grad=0.8)
    for (x, y) in ((8, 7), (14, 5), (17, 10), (10, 12)):
        put(c, x, y, can[4]); put(c, x + 1, y, can[3])
    if kind == 'red': put(c, 15, 13, hx('#ff2630')); put(c, 9, 9, hx('#ff2630'))
    return over(a, c)
@prop
def pr_rock():
    a = blank(22, 18); m = ell(M(22, 18), 11, 10, 10, 7.5); return over(a, shade(m, STONE, base=2, grad=1))
@prop
def pr_rock2():
    a = blank(22, 18); m = ell(M(22, 18), 8, 11, 7, 6); ell(m, 15, 12, 6, 5); s = shade(m, STONE, base=2, grad=1); return over(a, s)
@prop
def pr_crack():
    a = blank(26, 24); m = ell(M(26, 24), 13, 13, 12, 10.5); s = shade(m, ROCK, base=2, grad=1)
    l = line(M(26, 24), 8, 5, 12, 12, 0.6); line(l, 12, 12, 9, 19, 0.6); line(l, 12, 12, 19, 14, 0.6); line(l, 19, 14, 21, 9, 0.5)
    s[l & m] = OUT; return over(a, s)
@prop
def pr_bloodrock():
    a = blank(26, 26); m = ell(M(26, 26), 13, 14, 12, 11); s = shade(m, REDR, base=1, grad=1)
    for (x, y) in ((8, 8), (15, 6), (18, 13), (9, 15)): put(s, x, y, hx('#ff8a8a')); put(s, x + 1, y + 1, REDR[0])
    m2 = ell(M(26, 26), 13, 13, 4, 4); s[m2] = REDR[0]; s[ell(M(26, 26), 13, 13, 2, 2)] = hx('#12040a'); put(s, 12, 12, hx('#ff2630'))
    return over(a, s)
@prop
def pr_grave():
    a = blank(16, 22); m = rect(M(16, 22), 2, 6, 12, 15); ell(m, 8, 7, 6, 5)
    s = shade(m, STONE, base=2); l = M(16, 22); rect(l, 7, 7, 2, 7); rect(l, 5, 9, 6, 2); s[l] = STONE[1]
    for x in range(16): put(s, x, 21, OUT)
    return over(a, s)
@prop
def pr_cross():
    a = blank(14, 24); m = rect(M(14, 24), 5, 1, 4, 23); rect(m, 1, 6, 12, 4); return over(a, shade(m, R('#1a1010', '#2e1e1e', '#4a3434', '#6a4e4e', '#8a6a6a')))
@prop
def pr_lamp():
    a = blank(14, 46); m = rect(M(14, 46), 6, 12, 2, 32); rect(m, 4, 42, 6, 4); part(a, m, IRON)
    m = rect(M(14, 46), 2, 2, 10, 11); poly(m, [(1, 3), (7, -1), (13, 3)]); s = shade(m, IRON)
    s[rect(M(14, 46), 4, 5, 6, 6)] = hx('#ffb040'); s[rect(M(14, 46), 5, 6, 4, 3)] = hx('#fff09a'); over(a, s)
    return a
@prop
def pr_sign():
    a = blank(20, 22); part(a, rect(M(20, 22), 9, 10, 3, 12), WOODR); m = rect(M(20, 22), 1, 2, 18, 10); s = shade(m, WOODR, base=3)
    for x in range(4, 16, 2): put(s, x, 5, WOODR[0]); put(s, x + 1, 8, WOODR[0])
    return over(a, s)
@prop
def pr_statue():
    a = blank(26, 44); m = rect(M(26, 44), 2, 34, 22, 10); part(a, m, STONE, base=3)
    m = ell(M(26, 44), 13, 20, 8, 10); poly(m, [(13, 2), (19, 14), (7, 14)]); rect(m, 7, 24, 12, 10); s = shade(m, R('#1a1418', '#2e262c', '#4a4048', '#6a5e68', '#8a7e88'), base=2, grad=1)
    put(s, 10, 19, hx('#ff2630')); put(s, 15, 19, hx('#ff2630')); over(a, s); return a
@prop
def pr_stone():
    a = blank(18, 32); m = rect(M(18, 32), 3, 4, 12, 28); ell(m, 9, 5, 6, 4); s = shade(m, STONE, base=2, grad=1.2)
    for y in (10, 18, 25): put(s, 8, y, hx('#c4121c')); put(s, 9, y + 1, hx('#c4121c'))
    return over(a, s)
@prop
def pr_stump():
    a = blank(20, 14); m = ell(M(20, 14), 10, 8, 8, 5); s = shade(m, WOODR, base=2); s[ell(M(20, 14), 10, 6, 6, 2.5)] = WOODR[4]; s[ell(M(20, 14), 10, 6, 3, 1.2)] = WOODR[2]; return over(a, s)
@prop
def pr_skulls():
    a = blank(22, 14); m = M(22, 14)
    for (cx, cy) in ((6, 9), (15, 9), (10, 5)): ell(m, cx, cy, 4.5, 4)
    s = shade(m, BONE, base=3)
    for (cx, cy) in ((6, 9), (15, 9), (10, 5)): put(s, cx - 2, cy, OUT); put(s, cx + 1, cy, OUT); put(s, cx - 1, cy + 2, OUT)
    return over(a, s)
@prop
def pr_bones():
    a = blank(20, 10); m = line(M(20, 10), 3, 7, 16, 3, 1.1); ell(m, 3, 7, 2, 2); ell(m, 16, 3, 2, 2); line(m, 5, 2, 14, 8, 0.9); return over(a, shade(m, BONE, base=3))
@prop
def pr_candles():
    a = blank(18, 16); m = M(18, 16)
    for (x, hgt) in ((3, 9), (8, 12), (13, 7)): rect(m, x, 16 - hgt, 3, hgt)
    s = shade(m, R('#5a5040', '#a89a80', '#e8dcc0', '#f8f0dc', '#ffffff'), base=2)
    for (x, hgt) in ((3, 9), (8, 12), (13, 7)): put(s, x + 1, 16 - hgt - 1, hx('#ffe36a')); put(s, x + 1, 16 - hgt - 2, hx('#ff9a30'))
    return over(a, s)
@prop
def pr_mush():
    a = blank(18, 14); m = M(18, 14); rect(m, 4, 8, 3, 6); rect(m, 11, 6, 3, 8); s = shade(m, BONE, base=3); over(a, s)
    m = ell(M(18, 14), 5.5, 8, 5, 3); ell(m, 12.5, 6, 5, 3.5); s = shade(m, REDR, base=2); put(s, 4, 7, hx('#fff4dc')); put(s, 12, 4, hx('#fff4dc')); return over(a, s)
@prop
def pr_flowers():
    a = blank(24, 24); rnd = random.Random(5)
    for _ in range(6):
        x, y = rnd.randrange(3, 20), rnd.randrange(4, 21); c = hx(rnd.choice(('#ff2630', '#c4121c', '#f1e7d0')))
        put(a, x, y + 1, hx('#2a0810')); put(a, x, y, c); put(a, x - 1, y, c); put(a, x + 1, y, c); put(a, x, y - 1, c); put(a, x, y + 2, hx('#3a1a10'))
    return a
@prop
def pr_grass():
    a = blank(24, 24); G = TUFT['moors']
    for (bx, by) in ((5, 14), (13, 12), (18, 17), (9, 20)):
        for k in range(-3, 4):
            hgt = 7 - abs(k) * 1.4
            for yy in range(int(hgt)):
                x = bx + k + (1 if yy > hgt * 0.6 and k > 0 else -1 if yy > hgt * 0.6 and k < 0 else 0)
                put(a, x, by - yy, G[2] if yy < 2 else G[3] if yy < hgt - 1 else G[4])
        for k in range(-4, 5): put(a, bx + k, by + 1, OUT)
    return a
@prop
def pr_fence():
    a = blank(24, 22); m = M(24, 22)
    for x in (2, 12, 22): rect(m, x - 1, 3, 3, 19)
    rect(m, 0, 8, 24, 2); rect(m, 0, 15, 24, 2)
    s = shade(m, IRON, base=2)
    for x in (2, 12, 22): put(s, x, 2, OUT); put(s, x, 1, hx('#8a7a80'))
    return over(a, s)
@prop
def pr_peg_up():
    a = blank(24, 24); m = rect(M(24, 24), 4, 4, 16, 18); s = shade(m, REDR, base=2); s[rect(M(24, 24), 7, 7, 10, 2)] = REDR[4]; return over(a, s)
@prop
def pr_peg_dn():
    a = blank(24, 24); m = rect(M(24, 24), 4, 14, 16, 8); s = shade(m, REDR, base=1, lit=False); return over(a, s)
def orb(on):
    a = blank(20, 26); part(a, rect(M(20, 26), 4, 18, 12, 8), STONE)
    m = ell(M(20, 26), 10, 10, 8, 8); s = shade(m, REDR if on else R('#1a0a20', '#3a1446', '#5a2070', '#8a3aa8', '#c47aff'), base=2)
    put(s, 7, 6, hx('#ffffff')); put(s, 8, 6, hx('#ffffff')); put(s, 7, 7, hx('#ffffff'))
    return over(a, s)
P['pr_orb0'] = lambda: orb(False); P['pr_orb1'] = lambda: orb(True)
@prop
def pr_eyegate():
    w, h = 72, 54; a = blank(w, h); m = rect(M(w, h), 2, 10, 68, 44); poly(m, [(0, 12), (36, 0), (72, 12)])
    s = shade(m, STONE, base=2, grad=1)
    for x in range(4, 68, 8):
        for y in range(16, 54, 6): put(s, x + (y // 6 % 2) * 4, y, STONE[0])
    e = ell(M(w, h), 36, 28, 14, 9); se = shade(e, R('#5a5040', '#a89a80', '#e8dcc0', '#f8f0dc', '#ffffff'), base=3); over(s, se)
    s[ell(M(w, h), 36, 28, 6, 6)] = hx('#c4121c'); s[ell(M(w, h), 36, 28, 3, 3)] = OUT; put(s, 34, 26, hx('#ffffff'))
    return over(a, s)
@prop
def pr_eyeopen():
    w, h = 72, 54; a = blank(w, h); m = rect(M(w, h), 0, 46, 72, 8); s = shade(m, STONE, base=1)
    for x in range(2, 70, 9): s[rect(M(w, h), x, 44, 5, 4)] = STONE[2]
    return over(a, s)
@prop
def pr_fountain():
    w, h = 74, 56; a = blank(w, h); m = ell(M(w, h), 37, 38, 35, 16); part(a, m, STONE, base=3)
    m = ell(M(w, h), 37, 37, 30, 12); part(a, m, CREAM, base=2, out=False)
    m = rect(M(w, h), 33, 10, 8, 26); ell(m, 37, 12, 9, 5); part(a, m, STONE, base=2)
    for (x, y) in ((30, 20), (44, 22), (37, 6), (26, 30), (48, 30)): put(a, x, y, hx('#fff6dc')); put(a, x, y + 1, hx('#e4d6a6'))
    return a
@prop
def pr_bench():
    a = blank(36, 18); m = rect(M(36, 18), 1, 2, 34, 4); rect(m, 1, 8, 34, 4); rect(m, 3, 12, 3, 6); rect(m, 30, 12, 3, 6); return over(a, shade(m, WOODR, base=3))
@prop
def pr_stall():
    w, h = 50, 46; a = blank(w, h); m = rect(M(w, h), 3, 26, 44, 20); part(a, m, WOODR, base=2)
    for x in (4, 44): part(a, rect(M(w, h), x, 10, 3, 18), WOODR)
    m = M(w, h); poly(m, [(0, 14), (6, 2), (44, 2), (50, 14)]); s = shade(m, REDR, base=2)
    for x in range(0, 50):
        if (x // 6) % 2:
            for y in range(2, 15):
                if m[y, x]: s[y, x] = hx('#f1e7d0') if y > 3 else s[y, x]
    over(a, s)
    for (x, c) in ((10, '#ff9a30'), (18, '#c4121c'), (26, '#ffe36a'), (34, '#f1e0b0')): part(a, ell(M(w, h), x + 2, 25, 3, 2.5), R('#2a0a08', c, c, c, '#ffffff'))
    return a
@prop
def pr_barrel():
    a = blank(18, 22); m = ell(M(18, 22), 9, 11, 8, 10); rect(m, 1, 4, 16, 14); s = shade(m, WOODR, base=2)
    for y in (5, 16): s[rect(M(18, 22), 1, y, 16, 1) & m] = IRON[3]
    return over(a, s)
@prop
def pr_crate():
    a = blank(22, 22); m = rect(M(22, 22), 1, 1, 20, 20); s = shade(m, WOODR, base=3); l = line(M(22, 22), 3, 3, 18, 18, 0.7); line(l, 18, 3, 3, 18, 0.7); s[l] = WOODR[1]; return over(a, s)
@prop
def pr_well():
    w, h = 40, 46; a = blank(w, h); part(a, ell(M(w, h), 20, 36, 18, 9), STONE, base=3); a[ell(M(w, h), 20, 34, 12, 5).astype(bool)] = hx('#050203')
    for x in (4, 33): part(a, rect(M(w, h), x, 8, 3, 28), WOODR)
    m = M(w, h); poly(m, [(0, 12), (20, 0), (40, 12)]); part(a, m, REDR, base=2)
    part(a, rect(M(w, h), 19, 12, 2, 14), IRON); part(a, rect(M(w, h), 16, 24, 8, 6), WOODR)
    return a
@prop
def pr_ribs():
    w, h = 22, 40; a = blank(w, h); m = M(w, h); line(m, 3, 40, 6, 14, 1.6); line(m, 6, 14, 16, 2, 1.6); line(m, 16, 2, 21, 6, 1.3); return over(a, shade(m, BONE, base=3))
@prop
def pr_coffin():
    a = blank(18, 30); m = poly(M(18, 30), [(5, 0), (13, 0), (17, 9), (13, 29), (5, 29), (1, 9)]); s = shade(m, WOODR, base=2); l = rect(M(18, 30), 8, 4, 2, 14); rect(l, 5, 8, 8, 2); s[l] = GOLD[3]; return over(a, s)
@prop
def pr_vat():
    a = blank(24, 26); m = rect(M(24, 26), 2, 6, 20, 20); s = shade(m, IRON, base=2); s[rect(M(24, 26), 4, 7, 16, 3)] = REDR[3]; over(a, s)
    part(a, ell(M(24, 26), 12, 6, 10, 3), REDR, base=3); return a
@prop
def pr_torch():
    a = blank(16, 30); part(a, rect(M(16, 30), 4, 12, 8, 18), STONE, base=2); part(a, ell(M(16, 30), 8, 12, 6, 3), IRON); return a
@prop
def pr_block():
    a = blank(24, 26); m = rect(M(24, 26), 0, 0, 24, 26); s = shade(m, STONE, base=2)
    s[rect(M(24, 26), 4, 4, 16, 14)] = STONE[3]; s[rect(M(24, 26), 6, 6, 12, 10)] = STONE[2]; return over(a, s)
@prop
def pr_heavy():
    a = blank(24, 26); m = rect(M(24, 26), 0, 0, 24, 26); s = shade(m, REDR, base=1)
    l = M(24, 26); rect(l, 11, 3, 2, 18); rect(l, 5, 10, 14, 2); s[l] = REDR[0]; put(s, 11, 6, hx('#ff8a8a'))
    return over(a, s)
@prop
def pr_spikes():
    a = blank(24, 24); a[:, :] = hx('#0e0608')
    for (x, y) in ((2, 2), (14, 2), (8, 13), (20, 13), (2, 18)):
        m = poly(M(24, 24), [(x, y + 8), (x + 2.5, y), (x + 5, y + 8)]); part(a, m, IRON, base=3, out=False)
    return a
def door(kind):
    w, h = 72, 30; a = blank(w, h)
    if kind == 'shut':
        for x in range(0, 72, 8): part(a, rect(M(w, h), x + 1, 0, 5, 30), IRON, base=3)
        part(a, rect(M(w, h), 0, 12, 72, 4), IRON, base=2); return a
    m = rect(M(w, h), 0, 0, 72, 30); s = shade(m, WOODR if kind == 'lock' else REDR, base=2)
    for x in range(0, 72, 12): s[rect(M(w, h), x, 0, 1, 30)] = OUT
    for y in (6, 22): s[rect(M(w, h), 0, y, 72, 2)] = IRON[2]
    over(a, s)
    if kind == 'lock':
        part(a, rect(M(w, h), 30, 9, 12, 13), GOLD, base=2); a[rect(M(w, h), 35, 13, 2, 5)] = OUT
    elif kind == 'boss':
        part(a, ell(M(w, h), 36, 15, 11, 11), BONE, base=3); a[ell(M(w, h), 32, 13, 2.5, 3).astype(bool)] = OUT; a[ell(M(w, h), 40, 13, 2.5, 3).astype(bool)] = OUT; a[rect(M(w, h), 33, 20, 6, 2)] = OUT
    elif kind == 'eye':
        e = ell(M(w, h), 36, 15, 13, 9); over(a, shade(e, R('#5a5040', '#a89a80', '#e8dcc0', '#f8f0dc', '#ffffff'), base=3)); a[ell(M(w, h), 36, 15, 5, 5).astype(bool)] = hx('#c4121c'); a[ell(M(w, h), 36, 15, 2.5, 2.5).astype(bool)] = OUT
    return a
for k in ('shut', 'lock', 'boss', 'eye'): P['dr_' + k] = (lambda k=k: door(k))
@prop
def dr_crack():
    w, h = 72, 30; a = blank(w, h); l = line(M(w, h), 20, 0, 30, 14, 0.7); line(l, 30, 14, 26, 29, 0.7); line(l, 30, 14, 44, 18, 0.7); line(l, 44, 18, 50, 6, 0.6); line(l, 44, 18, 48, 29, 0.6)
    a[l] = OUT; return a
@prop
def pr_stairs():
    a = blank(24, 24)
    for k in range(4): part(a, rect(M(24, 24), 0, k * 6, 24, 6), STONE, base=3 - k * 0.7)
    return a
@prop
def pr_chest():
    a = blank(22, 20); m = rect(M(22, 20), 1, 5, 20, 15); s = shade(m, WOODR, base=3); s[rect(M(22, 20), 1, 9, 20, 2)] = GOLD[3]; s[rect(M(22, 20), 9, 8, 4, 5)] = GOLD[4]; return over(a, s)
@prop
def pr_chesto():
    a = blank(22, 20); m = rect(M(22, 20), 1, 9, 20, 11); s = shade(m, WOODR, base=2); s[rect(M(22, 20), 3, 9, 16, 2)] = hx('#050203'); over(a, s)
    part(a, rect(M(22, 20), 1, 1, 20, 6), WOODR, base=3); return a
@prop
def pr_bigchest():
    a = blank(32, 26); m = rect(M(32, 26), 1, 6, 30, 20); ell(m, 16, 8, 15, 5); s = shade(m, REDR, base=2)
    s[rect(M(32, 26), 1, 12, 30, 3)] = GOLD[3]; s[rect(M(32, 26), 13, 10, 6, 8)] = GOLD[4]; s[rect(M(32, 26), 15, 13, 2, 3)] = OUT; for_x = [s.__setitem__((slice(6, 26), slice(x, x + 2)), GOLD[2]) for x in (4, 26)]
    return over(a, s)
@prop
def pr_bigchesto():
    a = blank(32, 26); m = rect(M(32, 26), 1, 12, 30, 14); s = shade(m, REDR, base=2); s[rect(M(32, 26), 3, 12, 26, 3)] = hx('#050203'); s[rect(M(32, 26), 1, 16, 30, 2)] = GOLD[3]; over(a, s)
    part(a, rect(M(32, 26), 1, 2, 30, 8), REDR, base=3); return a

# ---------------------------------------------------------------- buildings and landmarks (doors marked in the game data)
def roof(a, x0, y0, w, h, rp, tiles=True):
    m = poly(M(*a.shape[1::-1]), [(x0, y0 + h), (x0 + w // 2, y0), (x0 + w, y0 + h)]); s = shade(m, rp, base=2, grad=1)
    if tiles:
        for y in range(y0 + 3, y0 + h, 3):
            for x in range(x0, x0 + w):
                if m[y, x] and (x + y) % 6 == 0: s[y, x] = rp[0]
    over(a, s)
def wall(a, x0, y0, w, h, rp):
    m = rect(M(*a.shape[1::-1]), x0, y0, w, h); s = shade(m, rp, base=2)
    for y in range(y0 + 3, y0 + h, 4):
        for x in range(x0 + 1, x0 + w - 1):
            if (x + (y // 4) * 3) % 8 == 0: s[y, x] = rp[1]
    over(a, s)
def doorway(a, cx, by, w=10, h=16, col='#050203'):
    m = rect(M(*a.shape[1::-1]), cx - w // 2, by - h, w, h); ell(m, cx, by - h, w / 2, w / 3); a[m] = hx(col); outline(a, m)
def window(a, x, y, w=6, h=7, lit=True):
    m = rect(M(*a.shape[1::-1]), x, y, w, h); a[m] = hx('#ffb040') if lit else hx('#1a0c10'); outline(a, m)
    if lit: a[y, x:x + w] = hx('#fff09a'); a[y + h // 2, x:x + w] = OUT
ST = {}
def st(fn): ST[fn.__name__] = fn; return fn
@st
def st_sewer():
    w, h = 80, 58; a = blank(w, h)
    m = rect(M(w, h), 4, 14, 72, 44); ell(m, 40, 16, 36, 14); part(a, m, R('#1a160e', '#2e2a1c', '#46402a', '#5e573a', '#7a7250'), base=2, grad=0.8)
    for y in range(18, 56, 6):
        for x in range(6, 74, 10): put(a, x + (y // 6 % 2) * 5, y, hx('#1a160e'))
    m = rect(M(w, h), 22, 26, 36, 32); ell(m, 40, 27, 18, 12); a[m] = hx('#050203'); outline(a, m)
    for x in range(24, 58, 5): a[rect(M(w, h), x, 18, 2, 40) & m] = IRON[3]
    for y in (34, 44): a[rect(M(w, h), 22, y, 36, 2) & m] = IRON[2]
    part(a, rect(M(w, h), 26, 52, 28, 6), CREAM, base=3)
    return a
@st
def st_skull():
    w, h = 104, 86; a = blank(w, h)
    m = ell(M(w, h), 52, 38, 48, 38); rect(m, 22, 50, 60, 36); s = shade(m, BONE, base=3, grad=1.3); over(a, s)
    for (cx, cy) in ((34, 34), (70, 34)):
        e = ell(M(w, h), cx, cy, 12, 11); a[e] = hx('#050203'); outline(a, e); a[ell(M(w, h), cx, cy + 2, 3, 3)] = hx('#ff2630')
    n = poly(M(w, h), [(52, 44), (46, 56), (58, 56)]); a[n] = OUT
    m = rect(M(w, h), 30, 62, 44, 24); ell(m, 52, 64, 22, 6); a[m] = hx('#050203'); outline(a, m)
    for x in range(32, 74, 7): part(a, rect(M(w, h), x, 60, 5, 8), BONE, base=3); part(a, rect(M(w, h), x + 2, 80, 4, 6), BONE, base=3)
    return a
@st
def st_funhouse():
    w, h = 104, 92; a = blank(w, h)
    m = poly(M(w, h), [(4, 50), (52, 4), (100, 50), (100, 92), (4, 92)]); s = shade(m, REDR, base=2)
    for y in range(h):
        for x in range(w):
            if m[y, x] and (x // 10) % 2 and y > 4: s[y, x] = hx('#f1e7d0') if y < 50 else hx('#d8ccb0')
    over(a, s)
    f = ell(M(w, h), 52, 50, 20, 18); over(a, shade(f, R('#5a5040', '#c8bca8', '#f1e7d0', '#fff6e8', '#ffffff'), base=2))
    for (cx, cy) in ((45, 45), (59, 45)): a[ell(M(w, h), cx, cy, 3, 4)] = OUT
    a[ell(M(w, h), 52, 52, 4, 4)] = hx('#ff2630')
    m = rect(M(w, h), 38, 60, 28, 32); ell(m, 52, 60, 14, 8); a[m] = hx('#050203'); outline(a, m)
    for x in range(40, 66, 3): put(a, x, 60 - int(5 * math.sin((x - 38) / 28 * math.pi)), hx('#ffffff'))
    part(a, rect(M(w, h), 50, 0, 3, 8), IRON); part(a, poly(M(w, h), [(53, 0), (62, 3), (53, 6)]), REDR)
    return a
@st
def st_factory():
    w, h = 108, 100; a = blank(w, h)
    for x in (14, 78): part(a, rect(M(w, h), x, 2, 14, 50), R('#1e0c08', '#3a1610', '#5a2218', '#7a3224', '#a04a34'), base=2)
    wall(a, 4, 34, 100, 66, R('#1e0c08', '#3a1610', '#5a2218', '#7a3224', '#a04a34'))
    for x in (12, 28, 72, 88): window(a, x, 46, 8, 10)
    m = rect(M(w, h), 38, 54, 32, 46); a[m] = IRON[1]; outline(a, m)
    for y in range(56, 100, 4): a[rect(M(w, h), 38, y, 32, 1)] = IRON[3]
    a[rect(M(w, h), 44, 74, 20, 26)] = hx('#050203')
    part(a, rect(M(w, h), 30, 36, 48, 10), IRON, base=2)
    for x in range(34, 74, 6): put(a, x, 40, hx('#ffe36a'))
    return a
@st
def st_lair():
    w, h = 104, 92; a = blank(w, h)
    m = ell(M(w, h), 52, 50, 50, 44); rect(m, 4, 50, 96, 42); s = shade(m, R('#1e0614', '#360c26', '#52143a', '#701e50', '#962c6c'), base=2, grad=1, dith=0.1, seed=3); over(a, s)
    for (x, y) in ((16, 30), (84, 34), (24, 70), (82, 68)):
        e = ell(M(w, h), x, y, 5, 4); a[e] = hx('#f1e7d0'); a[ell(M(w, h), x, y, 2, 2)] = hx('#c04aff'); outline(a, e)
    e = ell(M(w, h), 52, 26, 14, 9); a[e] = hx('#f1e7d0'); outline(a, e); a[ell(M(w, h), 52, 26, 6, 6)] = hx('#c4121c'); a[ell(M(w, h), 52, 26, 3, 3)] = OUT
    m = rect(M(w, h), 34, 54, 36, 38); ell(m, 52, 54, 18, 12); a[m] = hx('#050203'); outline(a, m)
    for x in range(36, 70, 6): part(a, poly(M(w, h), [(x, 46 + abs(x - 52) // 4), (x + 3, 58), (x + 6, 46 + abs(x - 52) // 4)]), BONE, base=3)
    return a
@st
def st_treehouse():
    w, h = 96, 112; a = blank(w, h)
    m = rect(M(w, h), 38, 50, 20, 62); poly(m, [(30, 112), (38, 96), (38, 112)]); poly(m, [(66, 112), (58, 96), (58, 112)]); part(a, m, WOODR, base=2)
    m = M(w, h)
    for (cx, cy, r) in ((48, 22, 22), (24, 34, 18), (72, 34, 18), (48, 44, 20)): ell(m, cx, cy, r, r * 0.85)
    over(a, shade(m, CANOPYW, base=2, grad=1.2))
    wall(a, 26, 52, 44, 26, WOODR); roof(a, 22, 38, 52, 16, REDR)
    window(a, 32, 58, 7, 7); window(a, 56, 58, 7, 7)
    for y in range(80, 112, 5): part(a, rect(M(w, h), 44, y, 8, 2), WOODR, base=3)
    doorway(a, 48, 76, 10, 14)
    return a
@st
def st_shack():
    w, h = 64, 56; a = blank(w, h); wall(a, 6, 24, 52, 32, WOODR); roof(a, 2, 4, 60, 22, R('#100c08', '#1e1810', '#2e2618', '#40361e', '#564a2a'))
    window(a, 12, 32, 7, 6, False); doorway(a, 40, 56, 11, 18)
    return a
@st
def st_chapel():
    w, h = 76, 96; a = blank(w, h); wall(a, 8, 44, 60, 52, STONE); roof(a, 4, 28, 68, 20, R('#100a10', '#1e141e', '#2e1e2e', '#40283e', '#583650'))
    wall(a, 28, 8, 20, 40, STONE); roof(a, 26, 0, 24, 12, R('#100a10', '#1e141e', '#2e1e2e', '#40283e', '#583650'))
    m = rect(M(w, h), 37, -2, 2, 8); a[m] = GOLD[3]
    for (x, c) in ((16, '#c04aff'), (54, '#c4121c')):
        m = rect(M(w, h), x, 54, 7, 14); ell(m, x + 3.5, 54, 3.5, 3); a[m] = hx(c); outline(a, m)
    doorway(a, 38, 96, 14, 22); window(a, 35, 20, 6, 8)
    return a
@st
def st_tent():
    w, h = 66, 56; a = blank(w, h); m = poly(M(w, h), [(2, 56), (33, 2), (64, 56)]); s = shade(m, R('#1a0610', '#3a0c20', '#5a1430', '#7a2044', '#a03060'), base=2)
    for y in range(h):
        for x in range(w):
            if m[y, x] and ((x - 33) // 6) % 2: s[y, x] = hx('#2a0a18')
    over(a, s); doorway(a, 33, 56, 14, 20, '#0a0306')
    for x in (16, 50): put(a, x, 30, hx('#ffe36a'))
    return a
@st
def st_ferris():
    w, h = 104, 116; a = blank(w, h); cx, cy, r = 52, 50, 44
    m = M(w, h); line(m, cx, cy, 20, 116, 1.6); line(m, cx, cy, 84, 116, 1.6); part(a, m, IRON)
    m = M(w, h)
    for k in range(12):
        ang = k / 12 * 6.283; line(m, cx, cy, cx + math.cos(ang) * r, cy + math.sin(ang) * r, 0.6)
    for k in range(120):
        ang = k / 120 * 6.283; line(m, cx + math.cos(ang) * r, cy + math.sin(ang) * r, cx + math.cos(ang + 0.06) * r, cy + math.sin(ang + 0.06) * r, 0.8)
    s = shade(m, REDR, base=3, lit=False); over(a, s)
    for k in range(8):
        ang = k / 8 * 6.283 + 0.2; x, y = int(cx + math.cos(ang) * r), int(cy + math.sin(ang) * r)
        part(a, rect(M(w, h), x - 5, y, 10, 8), R('#1a0a10', '#3a1420', '#f1e7d0', '#ffffff', '#ffffff') if k % 2 else REDR, base=2)
    part(a, ell(M(w, h), cx, cy, 6, 6), GOLD)
    return a
@st
def st_carousel():
    w, h = 92, 76; a = blank(w, h); part(a, ell(M(w, h), 46, 66, 44, 10), R('#1a0a10', '#2e1218', '#46202a', '#5e2e3a', '#7a3e4e'), base=3)
    for x in (12, 30, 46, 62, 80): part(a, rect(M(w, h), x - 1, 22, 3, 44), GOLD, base=3)
    m = poly(M(w, h), [(2, 26), (46, 2), (90, 26)]); s = shade(m, REDR, base=2)
    for y in range(h):
        for x in range(w):
            if m[y, x] and (x // 8) % 2: s[y, x] = hx('#f1e7d0')
    over(a, s); part(a, rect(M(w, h), 2, 24, 88, 6), GOLD, base=3)
    for (x, c) in ((20, '#f1e7d0'), (40, '#12040a'), (60, '#f1e7d0'), (76, '#12040a')):
        m = ell(M(w, h), x, 50, 7, 5); ell(m, x + 6, 44, 3, 4); part(a, m, R('#12040a', '#2a1a1a', c, c, '#ffffff'), base=2)
    return a
@st
def st_wreck():
    w, h = 116, 58; a = blank(w, h); m = poly(M(w, h), [(2, 24), (104, 18), (114, 30), (92, 56), (14, 56)]); part(a, m, WOODR, base=2, grad=1)
    for y in range(28, 54, 6): a[line(M(w, h), 8, y, 104, y - 4, 0.5) & m] = WOODR[0]
    part(a, rect(M(w, h), 50, 0, 4, 24), WOODR); m = poly(M(w, h), [(54, 2), (80, 10), (54, 18)]); s = shade(m, R('#2a1a14', '#4a3a2a', '#6a5a46', '#8a7a62', '#a89a80'), base=2)
    for x in range(56, 80, 5): s[rect(M(w, h), x, 2, 1, 16) & m] = hx('#2a1a14')
    over(a, s); a[ell(M(w, h), 30, 44, 7, 6)] = hx('#050203')
    return a
@st
def st_bigtree():
    w, h = 104, 118; a = blank(w, h)
    m = rect(M(w, h), 40, 56, 24, 62); poly(m, [(26, 118), (40, 98), (40, 118)]); poly(m, [(78, 118), (64, 98), (64, 118)]); part(a, m, WOODR, base=2)
    m = M(w, h)
    for (cx, cy, r) in ((52, 24, 26), (24, 40, 22), (80, 40, 22), (52, 52, 26), (32, 62, 14), (72, 62, 14)): ell(m, cx, cy, r, r * 0.85)
    c = shade(m, CANOPY, base=2, grad=1.4)
    for (x, y) in ((40, 20), (60, 30), (30, 44), (70, 50), (50, 56)): c[y, x] = hx('#ff2630'); c[y + 1, x] = hx('#5a0a10')
    over(a, c)
    m = rect(M(w, h), 46, 92, 12, 26); ell(m, 52, 92, 6, 5); a[m] = hx('#050203'); outline(a, m)
    return a
def house(v):
    w, h = 64, 70; a = blank(w, h); wp = [R('#120a0c', '#22161a', '#342428', '#463438', '#5a4448'), R('#140808', '#261010', '#3a1818', '#4e2222', '#662e2e')][v]
    wall(a, 4, 30, 56, 40, wp); roof(a, 0, 6, 64, 28, R('#0c0608', '#180c10', '#24121a', '#321a24', '#442430'))
    part(a, rect(M(w, h), 44, 2, 8, 14), wp, base=2)
    for x in (10, 44): window(a, x, 38, 8, 9, lit=(x == 10) != bool(v))
    window(a, 27, 14, 10, 8, lit=bool(v)); doorway(a, 32, 70, 10, 15, '#0a0506')
    return a
ST['st_house0'] = lambda: house(0); ST['st_house1'] = lambda: house(1)
@prop
def pr_bridge():
    a = blank(24, 24)
    for y in range(0, 24, 6): part(a, rect(M(24, 24), 0, y, 24, 5), WOODR, base=2.6)
    for x in (0, 23):
        for y in range(24): a[y, x] = OUT
    return a
@prop
def pr_bridgeh():
    a = blank(24, 24)
    for x in range(0, 24, 6): part(a, rect(M(24, 24), x, 0, 5, 24), WOODR, base=2.6)
    for y in (0, 23):
        for x in range(24): a[y, x] = OUT
    return a
@st
def st_skullsign(): # the Bone Fields' giant ribcage arch
    w, h = 108, 70; a = blank(w, h)
    for k, x in enumerate((8, 26, 44, 62, 80, 98)):
        m = M(w, h); line(m, x, 70, x + 4 * (1 if x < 54 else -1), 30, 2.2); line(m, x + 4 * (1 if x < 54 else -1), 30, 54, 8 + abs(x - 54) // 4, 2); part(a, m, BONE, base=3)
    m = rect(M(w, h), 4, 4, 100, 7); part(a, m, BONE, base=2)
    return a

# ---------------------------------------------------------------- inside (shops, caves): 24x24 tiles
INT = {}
def it(fn): INT[fn.__name__] = fn; return fn
PLANK = R('#1a0e08', '#2a180c', '#3a2214', '#4a2c1a', '#5e3a22')
@it
def in_floor():
    a = blank(24, 24)
    for y in range(24):
        for x in range(24):
            row = y // 6; t = 2 if ((x + row * 9) // 24 + row) % 2 else 3
            if y % 6 == 0: t = 1
            if y % 6 == 5: t = 1
            if (x + row * 9) % 24 == 0: t = 0
            a[y, x] = PLANK[t]
    return a
@it
def in_cfloor():
    a = blank(24, 24); rp = R('#120c0a', '#1c1412', '#261c18', '#30241e', '#3e3028'); a[:, :] = rp[2]; rnd = random.Random(3)
    for _ in range(18): put(a, rnd.randrange(24), rnd.randrange(24), rp[rnd.choice((1, 3))])
    for _ in range(3): x, y = rnd.randrange(22), rnd.randrange(22); put(a, x, y, rp[4]); put(a, x + 1, y + 1, rp[0])
    return a
def in_wall(style, row):
    cols = {'club': ('#2a1012', '#4a1a1c'), 'amy': ('#3a0a0e', '#6a1a14'), 'saba': ('#1a1a22', '#3a3a48'), 'tb': ('#1a0a08', '#3a1a10'), 't': ('#3a0a20', '#6a1438'), 'bonjo': ('#2a0a2a', '#5a1a5a'),
            'sanct': ('#0a2a2a', '#1a4a4a'), 'greebo': ('#2a1a0a', '#5a3a1a'), 'joff': ('#2a2a0a', '#5a5a1a'), 'cafe': ('#2a1a12', '#5a3a26'), 'beebs': ('#1e1208', '#4a2e14'), 'arcade': ('#10081e', '#2a1448'),
            'pulsar': ('#081a2a', '#14365a'), 'harold': ('#1a1408', '#3a2a12'), 'chapel': ('#141218', '#2a2630'), 'tent': ('#2a0a14', '#5a1428'), 'shack': ('#1a140c', '#3a2a18')}.get(style, ('#1a1012', '#3a1a1c'))
    d, l = hx(cols[0]), hx(cols[1]); mid = tuple((d[i] + l[i]) // 2 for i in range(3)) + (255,); a = blank(24, 24)
    if row == 0: # wallpaper with a stripe and a picture rail
        for y in range(24):
            for x in range(24):
                a[y, x] = l if (x // 4) % 2 else mid
                if y == 4: a[y, x] = d
                if y < 4: a[y, x] = d if y < 3 else OUT
        if style in ('club', 'tb', 'beebs', 'harold'):
            for y in range(8, 18): put(a, 11, y, OUT)
    else: # wainscot
        for y in range(24):
            for x in range(24):
                a[y, x] = PLANK[2] if y > 6 else (l if (x // 4) % 2 else mid)
                if y == 6: a[y, x] = PLANK[4]
                if y == 7: a[y, x] = OUT
                if y > 7 and x % 8 == 0: a[y, x] = PLANK[1]
                if y == 23: a[y, x] = OUT
    return a
@it
def in_cwall():
    a = blank(24, 24); a[:, :] = hx('#0a0606'); return a
@it
def in_side():
    a = blank(24, 24); a[:, :] = hx('#0a0506'); return a
@it
def in_counter():
    a = blank(24, 24); m = rect(M(24, 24), 0, 2, 24, 22); s = shade(m, WOODR, base=2, lit=False)
    s[rect(M(24, 24), 0, 2, 24, 3)] = WOODR[4]; s[rect(M(24, 24), 0, 5, 24, 1)] = OUT
    for x in range(4, 24, 8): s[rect(M(24, 24), x, 8, 1, 14)] = WOODR[0]
    return over(a, s)
@it
def in_table():
    a = blank(24, 24); m = rect(M(24, 24), 1, 5, 22, 9); rect(m, 3, 14, 3, 8); rect(m, 18, 14, 3, 8); s = shade(m, WOODR, base=3); return over(a, s)
@it
def in_shelf():
    a = blank(24, 24); m = rect(M(24, 24), 0, 0, 24, 24); s = shade(m, WOODR, base=1, lit=False); rnd = random.Random(1)
    for sh in range(3):
        s[rect(M(24, 24), 1, 7 + sh * 7, 22, 1)] = WOODR[3]
        for b in range(5): x = 2 + b * 4; s[rect(M(24, 24), x, 2 + sh * 7, 3, 5)] = hx(rnd.choice(('#c4121c', '#f1e0b0', '#4adfff', '#ffe36a', '#7a2a8a')))
    return over(a, s)
@it
def in_crate(): return P['pr_crate']()
@it
def in_bed():
    a = blank(24, 48); m = rect(M(24, 48), 2, 2, 20, 44); s = shade(m, WOODR, base=2); over(a, s)
    part(a, rect(M(24, 48), 4, 4, 16, 10), R('#8a7a70', '#c8bca8', '#f1e7d0', '#fff6e8', '#ffffff'), base=2); part(a, rect(M(24, 48), 3, 15, 18, 29), REDR, base=2)
    return a
@it
def in_exit():
    a = blank(24, 24); a[:, :] = hx('#050203')
    for y in range(4, 24, 4):
        for x in range(2, 22): a[y, x] = hx('#2a1012')
    a[0:2, :] = OUT; return a
@it
def in_fire():
    a = blank(24, 24); m = rect(M(24, 24), 0, 0, 24, 24); s = shade(m, STONE, base=2); s[rect(M(24, 24), 4, 8, 16, 16)] = hx('#050203'); over(a, s)
    part(a, poly(M(24, 24), [(6, 23), (9, 12), (12, 17), (15, 10), (18, 23)]), R('#5a0a10', '#c4301a', '#ff7a2a', '#ffc840', '#fff09a'), base=2, out=False)
    return a
@it
def in_stool():
    a = blank(24, 24); m = ell(M(24, 24), 12, 10, 7, 3); rect(m, 7, 10, 2, 10); rect(m, 15, 10, 2, 10); return over(a, shade(m, WOODR, base=3))
@it
def in_cabinet():
    a = blank(24, 24); m = rect(M(24, 24), 2, 0, 20, 24); s = shade(m, R('#10081e', '#1e1036', '#2a1448', '#3e2066', '#5a3290'), base=2)
    s[rect(M(24, 24), 5, 3, 14, 9)] = hx('#0a0a12'); s[rect(M(24, 24), 6, 5, 12, 5)] = hx('#ff2630'); s[rect(M(24, 24), 6, 15, 3, 3)] = hx('#c4121c'); s[rect(M(24, 24), 13, 15, 2, 2)] = hx('#ffe36a')
    return over(a, s)
@it
def in_plant():
    a = blank(24, 24); part(a, rect(M(24, 24), 7, 14, 10, 10), WOODR, base=3); part(a, ell(M(24, 24), 12, 9, 8, 7), CANOPY, base=3); return a
@it
def in_pool():
    a = blank(24, 24); a[:, :] = hx('#1a5a5a')
    for x in range(3, 20, 6): put(a, x, 7, hx('#8affff')); put(a, x + 1, 7, hx('#8affff')); put(a, x + 3, 16, hx('#4adfff'))
    return a
@it
def in_trophy():
    a = blank(24, 24); m = rect(M(24, 24), 0, 0, 24, 24); s = shade(m, WOODR, base=1, lit=False); s[rect(M(24, 24), 1, 15, 22, 2)] = WOODR[3]; over(a, s)
    part(a, poly(M(24, 24), [(6, 4), (18, 4), (15, 11), (13, 12), (13, 14), (11, 14), (11, 12), (9, 11)]), GOLD, base=3)
    return a

# ---------------------------------------------------------------- everything, as name -> PIL image
WALLS = ['forest', 'woodsy', 'hedge', 'cliff', 'bonecliff', 'cwall', 'thorns', 'reeds'] + ['dw_' + k for k in DGPAL]
def build():
    out = {}
    for b in GROUND:
        for v in range(4): out['g_%s%d' % (b, v)] = img(tex_ground(b, v))
    for name, (style, fills, ramp, k) in TERR.items():
        for qy in (0, 1):
            for qx in (0, 1):
                for case in 'HVOI': out['a_%s_%d%d%s' % (name, qx, qy, case)] = img(quarter(name, qx, qy, case, fills[0]))
                for v, f in enumerate(fills): out['a_%s_%d%dF%d' % (name, qx, qy, v)] = img(quarter(name, qx, qy, 'F', f))
    for w in WALLS:
        for pos in 'LMRS':
            for row in (0, 1): out['f_%s_%s%d' % (w, pos, row)] = img(face_tile(w, pos, row))
        for row in (0, 1): out['f_%s_C%d' % (w, row)] = img(face_tile(w, 'M', row, cave=True))
    for pos in 'LMRS': out['ld_' + pos] = img(ledge(pos))
    for k in DGPAL:
        for v in range(3): out['df_%s%d' % (k, v)] = img(dg_floor(k, v))
    for kind in ('red', 'wine', 'pine', 'dead', 'goo', 'mush'): out['tr_' + kind] = img(tree(kind))
    for kind in ('red', 'wine', 'olive', 'goo', 'bone', 'pink'): out['bu_' + kind] = img(bush(kind))
    for k, fn in P.items(): out[k] = img(fn())
    for k in ('shut', 'lock', 'boss', 'eye', 'crack'): out['dr_%s_v' % k] = out['dr_' + k].transpose(Image.TRANSPOSE)
    sh_ = blank(24, 24)
    for x in range(1, 24, 6): part(sh_, rect(M(24, 24), x, 0, 4, 24), IRON, base=3)
    part(sh_, rect(M(24, 24), 0, 10, 24, 3), IRON, base=2); out['pr_shut'] = img(sh_)
    for k, fn in ST.items(): out[k] = img(fn())
    for k, fn in INT.items(): out[k] = img(fn())
    for s in ('club', 'amy', 'saba', 'tb', 't', 'bonjo', 'sanct', 'greebo', 'joff', 'cafe', 'beebs', 'arcade', 'pulsar', 'harold', 'chapel', 'tent', 'shack'):
        for row in (0, 1): out['iw_%s%d' % (s, row)] = img(in_wall(s, row))
    return out

if __name__ == '__main__':
    import sys
    fr = build(); print(len(fr), 'frames')
