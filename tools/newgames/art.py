"""Sprite sheets for the newer games (Willy Nilly, Spuzzworld, Arcade Overdrive, The Grinding of Cumhead, Journey to the Void).

Every game takes the frames it needs from the art we already have (Load Legacy's characters, Cumhead's atlas from
Cumhead the Spermhog, the foes and props from tools/foes, the homunculus breeds) plus its own new pixel art from
games/<id>/art.py (drawn with tools/pixelkit.py, same outline and shading). build.py calls sheet(game) for each game.
"""
import base64, fnmatch, io, json, os, re, sys, importlib.util
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE); APP = os.path.dirname(TOOLS)
sys.path.insert(0, TOOLS); sys.path.insert(0, HERE)
from pixelkit import render, pack

def _sheet(png, js, prefix=''):
    im = Image.open(png).convert('RGBA'); fr = json.load(open(js)); fr = fr.get('frames', fr)
    return {prefix + k: im.crop((v[0], v[1], v[0] + v[2], v[1] + v[3])) for k, v in fr.items()}

_BASE = None
def base():
    global _BASE
    if _BASE is not None: return _BASE
    out = {}
    out.update(_sheet(os.path.join(TOOLS, 'load-legacy', 'sprites.png'), os.path.join(TOOLS, 'load-legacy', 'sprites.json')))
    out.update(_sheet(os.path.join(TOOLS, 'foes', 'foes.png'), os.path.join(TOOLS, 'foes', 'foes.json')))
    out.update(_sheet(os.path.join(TOOLS, 'homunculus', 'hom.png'), os.path.join(TOOLS, 'homunculus', 'hom.json')))
    hog = open(os.path.join(APP, 'www', 'games', 'spermhog.html'), encoding='utf-8').read()
    atlas = json.loads(re.search(r'var ATLAS = (\{.*?\});', hog).group(1)); atlas = atlas.get('frames', atlas)
    src = dict(re.findall(r"(\w+): '(data:[^']+)'", re.search(r'var SRC = \{(.*?)\};', hog, re.S).group(1)))
    im = Image.open(io.BytesIO(base64.b64decode(src['atlas'].split(',', 1)[1]))).convert('RGBA')
    for k, v in atlas.items(): out['ch_' + k] = im.crop((v[0], v[1], v[0] + v[2], v[1] + v[3]))
    _BASE = out; return out

def extra(game):
    p = os.path.join(HERE, 'games', game, 'art.py')
    if not os.path.exists(p): return {}
    spec = importlib.util.spec_from_file_location('art_' + game.replace('-', '_'), p); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    out = {}
    for k, fn in m.ART.items():
        r = fn()
        out[k] = r if isinstance(r, Image.Image) else render(*r)
    return out, getattr(m, 'USE', ['*'])

def sheet(game):
    """returns (data uri of the packed png, {name: [x, y, w, h]})"""
    ex, use = extra(game) if os.path.exists(os.path.join(HERE, 'games', game, 'art.py')) else ({}, [])
    frames = {}
    b = base()
    for pat in use:
        for k in sorted(b):
            if fnmatch.fnmatch(k, pat): frames[k] = b[k]
    frames.update(ex)
    # tallest first packs tighter
    order = sorted(frames, key=lambda k: -frames[k].height)
    sh, pos = pack({k: frames[k] for k in order}, 1024)
    buf = io.BytesIO(); sh.save(buf, 'PNG', optimize=True)
    sh.save(os.path.join(HERE, 'games', game, 'sheet-preview.png'))
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), pos

if __name__ == '__main__':
    for g in sys.argv[1:]:
        uri, pos = sheet(g); print(g, len(pos), 'frames', len(uri) // 1024, 'KB')
