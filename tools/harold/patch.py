#!/usr/bin/env python3
"""Puts Harold's new look (harold-cq.js) into Cumheads Quest, straight after its old HSPEC.harold, so it wins.
Then node /home/claude/tools/cqspr.js harold renders his frames and --ll (below) pastes the front one into Load Legacy's sheets."""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
p = os.path.join(ROOT, 'www/games/cumheads-quest.html'); h = open(p, encoding='utf-8').read()
h = re.sub(r'/\* HAROLD-SPEC .*?/\* /HAROLD-SPEC \*/\n', '', h, flags=re.S)
blk = '/* HAROLD-SPEC (tools/harold/harold-cq.js) */\n' + open(os.path.join(HERE, 'harold-cq.js')).read() + '/* /HAROLD-SPEC */\n'
i = h.index('HSPEC.harold = {'); j = h.index('\nHSPEC.', i + 10); h = h[:j + 1] + blk + h[j + 1:]
open(p, 'w', encoding='utf-8').write(h)
if '--ll' in sys.argv:
    import json
    from PIL import Image
    fr = json.load(open(os.path.join(ROOT, 'tools/load-legacy/sprites.json'))); fr = fr.get('frames', fr); x, y, w, hh = fr['npc_harold']
    s = Image.open(sys.argv[sys.argv.index('--ll') + 1]).convert('RGBA')
    for sheet in ('sprites-base.png', 'sprites.png'):
        q = os.path.join(ROOT, 'tools/load-legacy', sheet); im = Image.open(q).convert('RGBA'); im.paste((0, 0, 0, 0), (x, y, x + w, y + hh))
        im.paste(s, (x + (w - s.width) // 2, y + hh - s.height), s); im.save(q)
print('ok')
