"""python3 preview.py [zone]: the layers stacked the way the game places them (640x270, three camera heights), 2x"""
import sys, os
from PIL import Image
from zones import SIZE, OUT
SKY = {'sewer': ['#050a06', '#0c1810', '#16281a'], 'park': ['#06020a', '#14061a', '#2a0a20'], 'bone': ['#050404', '#100c0a', '#1e1612'], 'factory': ['#0a0302', '#200804', '#3a1006'], 'brain': ['#030204', '#0c0610', '#1a0a14'], 'city': ['#0a0204', '#1c0508', '#3a0a10']}
F = {'far': (0.52, 0.6), 'mid': (0.64, 1.0), 'near': (0.86, 1.6)}
def comp(z, D, W=640, H=270):
    im = Image.new('RGBA', (W, H)); s = SKY[z]
    for i in range(10):
        c = s[0] if i < 3 else s[1] if i < 7 else s[2]
        im.paste(c, (0, i * H // 10, W, (i + 1) * H // 10 + 1))
    for k in ['far', 'mid', 'near']:
        p = os.path.join(OUT, '%s_%s.png' % (z, k))
        if not os.path.exists(p): continue
        L = Image.open(p); hz = SIZE[k][1]; f, m = F[k]
        y = round(H * f + D * m - hz)
        im.alpha_composite(L.crop((0, 0, W, L.height)), (0, max(0, y)) if y >= 0 else (0, 0)) if y >= 0 else im.alpha_composite(L.crop((0, -y, W, L.height)), (0, 0))
    return im
for z in sys.argv[1:] or ['sewer', 'park', 'bone', 'factory', 'brain']:
    rows = [comp(z, D) for D in (50, 0, -50)]
    S = Image.new('RGBA', (640, 270 * 3 + 4), 'white')
    for i, r in enumerate(rows): S.paste(r, (0, i * 272))
    S = S.resize((1280, S.height * 2), Image.NEAREST); S.save('/home/claude/ck/bkp_%s.png' % z)
