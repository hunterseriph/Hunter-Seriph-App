"""Puts out/*.png into the game as tools/newgames/games/spermhog/0b-backs.js (HOGBKIMG: lossless webp data urls)."""
import base64, io, json, os, glob
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); out = {}
for p in sorted(glob.glob(os.path.join(HERE, 'out', '*.png'))):
    b = io.BytesIO(); Image.open(p).save(b, 'WEBP', lossless=True, quality=100, method=6)
    out[os.path.basename(p)[:-4]] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
import numpy as np
roof = [k for k in out if k.startswith('d_') and (np.array(Image.open(os.path.join(HERE, 'out', k + '.png')))[1, :, 3] > 0).mean() > 0.9]
dst = os.path.join(HERE, '..', '..', 'newgames', 'games', 'spermhog', '0b-backs.js')
open(dst, 'w').write('/* the zones painted backdrop layers (made by tools/spermhog/backs/zones.py, baked by bake.py) */\nvar HOGBKIMG = ' + json.dumps(out) + ';\nvar HOGBKROOF = ' + json.dumps(dict((k[2:], 1) for k in roof)) + ';\n')
print('wrote', dst, sum(len(v) for v in out.values()) // 1024, 'KB')
