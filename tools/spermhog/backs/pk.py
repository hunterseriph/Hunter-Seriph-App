"""Small pixel painter for Spermhog's backdrop layers (Mega Drive style): every shape is a mask, filled with a colour or a
texture, then given a dark outline, a lit top-left edge and a shaded bottom-right edge. Layers are 960 px wide and tile
left to right (shapes that cross an edge wrap round). Bands of hard colour, ordered dither, no smooth gradients."""
import numpy as np
from PIL import Image, ImageDraw

W = 960
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def hx(s):
    s = s.lstrip('#')
    return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], np.int16)


def mix(a, b, t):
    a, b = hx(a) if isinstance(a, str) else a, hx(b) if isinstance(b, str) else b
    return np.clip(a + (b - a) * t, 0, 255).astype(np.int16)


def tohex(c):
    return '#%02x%02x%02x' % tuple(int(v) for v in c)


def lighten(c, k):
    return tohex(mix(c, '#ffffff', k)) if k >= 0 else tohex(mix(c, '#000000', -k))


class Layer:
    def __init__(self, h, seed=1):
        self.h = h
        self.rgb = np.zeros((h, W, 3), np.int16)
        self.a = np.zeros((h, W), bool)
        self.rng = np.random.RandomState(seed)
        self.ys, self.xs = np.mgrid[0:h, 0:W]

    def r(self):
        return self.rng.rand()

    # ---- masks: draw on a strip three widths wide, then fold so things wrap round the edges
    def mask(self, fn):
        im = Image.new('L', (W * 3, self.h), 0)
        fn(ImageDraw.Draw(im), W)
        m = np.array(im) > 127
        return m[:, :W] | m[:, W:2 * W] | m[:, 2 * W:]

    def rectm(self, x, y, w, h):
        return self.mask(lambda d, o: d.rectangle([o + x, y, o + x + w - 1, y + h - 1], fill=255))

    def polym(self, pts):
        return self.mask(lambda d, o: d.polygon([(o + px, py) for px, py in pts], fill=255))

    def ellm(self, cx, cy, rx, ry):
        return self.mask(lambda d, o: d.ellipse([o + cx - rx, cy - ry, o + cx + rx, cy + ry], fill=255))

    def linem(self, pts, w):
        return self.mask(lambda d, o: d.line([(o + px, py) for px, py in pts], fill=255, width=int(w)))

    # ---- painting
    def put(self, m, col):
        c = hx(col) if isinstance(col, str) else col
        if c.ndim == 1:
            self.rgb[m] = c
        else:
            self.rgb[m] = c[m]
        self.a |= m

    def shape(self, m, fill, out='#12040a', light=None, shade=None, lw=1):
        """fill a mask, then its lit top-left edge, its shaded bottom-right edge and a dark outline round it"""
        if fill is not None:
            self.put(m, fill)
        if light:
            e = m & ~(np.roll(m, 1, 0) & np.roll(m, 1, 1))
            e[0, :] = False
            self.put(e, light)
        if shade:
            e = m & ~(np.roll(m, -1, 0) & np.roll(m, -1, 1))
            e[-1, :] = False
            self.put(e, shade)
        if out:
            d = m.copy()
            for _ in range(lw):
                d = d | np.roll(d, 1, 0) | np.roll(d, -1, 0) | np.roll(d, 1, 1) | np.roll(d, -1, 1)
            o = d & ~m
            o[0, :] &= False
            self.put(o, out)

    def dither(self, m, c0, c1, t):
        """t: 0..1 per pixel (array) or a number: ordered dither between two colours"""
        if np.isscalar(t):
            t = np.full(m.shape, t)
        th = BAYER[self.ys % 4, self.xs % 4]
        a, b = hx(c0), hx(c1)
        pick = t > th
        self.rgb[m & ~pick] = a
        self.rgb[m & pick] = b
        self.a |= m

    def bands(self, m, cols, y0, y1):
        """hard horizontal bands of colour from y0 to y1 inside a mask, dithered where two bands meet"""
        n = len(cols)
        f = np.clip((self.ys - y0) / max(1, (y1 - y0)), 0, 0.9999) * n
        i = f.astype(int)
        frac = f - i
        th = BAYER[self.ys % 4, self.xs % 4]
        i2 = np.where((frac > 0.75) & (th < (frac - 0.75) * 4), np.minimum(i + 1, n - 1), i)
        C = np.array([hx(c) for c in cols])
        self.rgb[m] = C[i2][m]
        self.a |= m

    def bricks(self, m, cols, mortar, bw=16, bh=8, x0=0, y0=0, light=None):
        """brick courses: each brick its own colour from cols, mortar lines, a lit top edge"""
        row = (self.ys - y0) // bh
        off = (row % 2) * (bw // 2)
        bx = (self.xs - x0 + off) // bw
        idx = (bx * 7 + row * 13 + (bx * row) % 5) % len(cols)
        C = np.array([hx(c) for c in cols])
        col = C[idx]
        mm = ((self.ys - y0) % bh == 0) | ((self.xs - x0 + off) % bw == 0)
        col[mm] = hx(mortar)
        if light:
            lt = ((self.ys - y0) % bh == 1) & ~mm
            col[lt] = hx(light)
        self.rgb[m] = col[m]
        self.a |= m

    def stones(self, m, cols, mortar, sz=14, light=None):
        """rough stone blocks of uneven widths"""
        row = self.ys // sz
        wid = sz + 6 + (row * 37) % 11
        off = (row * 53) % wid
        bx = (self.xs + off) // wid
        idx = (bx * 5 + row * 3 + (bx ^ row) % 4) % len(cols)
        C = np.array([hx(c) for c in cols])
        col = C[idx]
        mm = (self.ys % sz == 0) | ((self.xs + off) % wid == 0)
        col[mm] = hx(mortar)
        if light:
            col[(self.ys % sz == 1) & ~mm] = hx(light)
        self.rgb[m] = col[m]
        self.a |= m

    def noise(self, m, cols, k=0.5, scale=1):
        """speckle: picks from cols by a hashed noise per (scaled) pixel"""
        hsh = ((self.xs // scale) * 73856093 ^ (self.ys // scale) * 19349663) % 1000 / 1000.0
        C = np.array([hx(c) for c in cols])
        i = np.minimum((hsh * len(cols) * k + (1 - k) * len(cols) / 2).astype(int), len(cols) - 1)
        self.rgb[m] = C[i][m]
        self.a |= m

    def px(self, x, y, col):
        x, y = int(x) % W, int(y)
        if 0 <= y < self.h:
            self.rgb[y, x] = hx(col)
            self.a[y, x] = True

    def save(self, path, band=None):
        img = np.zeros((self.h, W, 4), np.uint8)
        img[..., :3] = np.clip(self.rgb, 0, 255)
        img[..., 3] = self.a * 255
        Image.fromarray(img, 'RGBA').save(path)
