"""Shithead Laboozie's base sprite, pixelled straight from Hunter's drawing (original.png): scaled down to sprite size,
a limited palette, and the dark outline every sprite of ours has."""
from PIL import Image
import os
HERE = os.path.dirname(os.path.abspath(__file__))
INK = (18, 4, 10, 255)
def pixel(h=52, colours=32):
    im = Image.open(os.path.join(HERE, 'original.png')).convert('RGBA'); im = im.crop(im.getbbox())
    w = max(1, round(im.width * h / im.height))
    # step down in halves for a cleaner result, then the last step with box filtering
    while im.height > h * 3: im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    sm = im.resize((w, h), Image.BOX)
    a = sm.split()[3].point(lambda v: 255 if v > 110 else 0)
    rgb = sm.convert('RGB').quantize(colours, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    out = Image.new('RGBA', (w + 2, h + 2), (0, 0, 0, 0)); out.paste(rgb, (1, 1), a)
    p = out.load()
    for y in range(out.height):  # the black hoodie in three dark greys (pure black would vanish into the outline)
        for x in range(out.width):
            r, g, b, al = p[x, y]
            if not al: continue
            v = (r + g + b) / 3
            if y < out.height * 0.6 and max(r, g, b) - min(r, g, b) < 26 and v < 80: p[x, y] = (24, 20, 28, 255) if v < 18 else (40, 36, 46, 255) if v < 34 else (62, 58, 70, 255)
    edge = []
    for y in range(out.height):
        for x in range(out.width):
            if p[x, y][3]: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < out.width and 0 <= Y < out.height and p[X, Y][3] and p[X, Y] != INK: edge.append((x, y)); break
    for e in edge: p[e] = INK
    return out
if __name__ == '__main__':
    for h in (40, 50, 60):
        im = pixel(h); im.save('/home/claude/ck/lab%d.png' % h); im.resize((im.width * 8, im.height * 8), Image.NEAREST).save('/home/claude/ck/lab%d_8.png' % h)
