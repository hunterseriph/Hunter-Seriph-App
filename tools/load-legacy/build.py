#!/usr/bin/env python3
"""Assemble Load Legacy into one self-contained HTML file, like the other games in the app.

Edit the files in src/, then run:  python3 tools/load-legacy/build.py
It writes www/games/load-legacy.html. It pulls Cumhead's atlas and the city backdrops from
www/games/spermhog.html so that
must be present. The homunculus art comes from tools/homunculus. sprites.png/json and icons.json were rendered from Cumheads Quest's own art.
"""
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
APP = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(os.path.join(HERE, '..', '..'))
GAMES = os.path.join(APP, 'www', 'games')
SRC = os.path.join(HERE, 'src')

head = open(os.path.join(SRC, '00-head.html'), encoding='utf-8').read()
parts = sorted(f for f in os.listdir(SRC) if f.endswith('.js'))
js = '\n'.join(open(os.path.join(SRC, f), encoding='utf-8').read() for f in parts)

hog = open(os.path.join(GAMES, 'spermhog.html'), encoding='utf-8').read()
atlas = re.search(r'var ATLAS = (\{.*?\});', hog).group(1)
srcblock = re.search(r'var SRC = \{(.*?)\};', hog, re.S).group(1)
src = dict(re.findall(r"(\w+): '(data:[^']+)'", srcblock))
assert set(['atlas', 'sky', 'clouds', 'skyline', 'city', 'bricks']) <= set(src), src.keys()
src['sheet'] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(HERE, 'sprites.png'), 'rb').read()).decode()

# the soundtrack is Load Legacy's own now: src/15-music.js

def put(s, key, val):
    tag = '/*@' + key + '@*/'
    assert s.count(tag) == 1, key
    if key == 'MUSIC':
        return s.replace(tag, val)
    return s.replace(tag + '{}', val)

js = put(js, 'ATLAS', atlas)
js = put(js, 'SRC', json.dumps(src, separators=(',', ':')))
js = put(js, 'SPR', open(os.path.join(HERE, 'sprites.json')).read())
js = put(js, 'ICONS', open(os.path.join(HERE, 'icons.json')).read())

# the homunculus: pixel art from tools/homunculus/gen.py, merged into SPR (5th value 1 = the hom sheet)
HOMDIR = os.path.join(HERE, '..', 'homunculus')
hom = json.load(open(os.path.join(HOMDIR, 'hom.json')))
js = put(js, 'HOM', json.dumps({'breeds': hom['breeds'], 'order': hom['order']}, separators=(',', ':')))
js = js.replace("Object.keys(SRC).forEach(", "Object.keys(HOMFR).forEach(function (k) { SPR[k] = HOMFR[k]; });\nObject.keys(SRC).forEach(", 1)
js = js.replace("var imgs = {};", "var imgs = {};\nvar HOMFR = " + json.dumps({k: v + [1] for k, v in hom['frames'].items()}, separators=(',', ':')) + ";\nSRC.hom = 'data:image/png;base64," + base64.b64encode(open(os.path.join(HOMDIR, 'hom.png'), 'rb').read()).decode() + "';", 1)

out = head + "\n<script>\n(function () {\n'use strict';\n" + js + "\n})();\n</script>\n\n</body></html>\n"
dst = os.path.join(GAMES, 'load-legacy.html')
open(dst, 'w', encoding='utf-8').write(out)
print('wrote', dst, len(out), 'bytes')
