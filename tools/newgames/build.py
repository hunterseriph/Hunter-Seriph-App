#!/usr/bin/env python3
"""Build the newer games into single HTML files in www/games/.

  python3 tools/newgames/build.py            builds every game
  python3 tools/newgames/build.py willy-nilly  builds one

Each game lives in games/<id>/: its code (*.js, joined in name order), its own art (art.py, optional) and meta.json
({"title": ..., "file": ...}). lib/kit.js is the shared engine and Load Legacy's music engine (src/15-music.js) plays
the soundtracks. Do not edit the HTML in www/games: edit here and rebuild.
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import art

def build(gid):
    gdir = os.path.join(HERE, 'games', gid); meta = json.load(open(os.path.join(gdir, 'meta.json')))
    head = open(os.path.join(HERE, 'lib', 'head.html'), encoding='utf-8').read()
    kit = open(os.path.join(HERE, 'lib', 'kit.js'), encoding='utf-8').read()
    musjs = open(os.path.join(APP, 'tools', 'load-legacy', 'src', '15-music.js'), encoding='utf-8').read()
    code = '\n'.join(open(os.path.join(gdir, f), encoding='utf-8').read() for f in sorted(os.listdir(gdir)) if f.endswith('.js'))
    uri, pos = art.sheet(gid)
    kit = kit.replace("/*@SPR@*/{}", json.dumps(pos, separators=(',', ':'))).replace("/*@SHEET@*/''", json.dumps(uri))
    js = kit + '\n' + musjs + '\n' + code
    html = head.replace('/*@TITLE@*/', meta['title']).replace('/*@JS@*/', js.replace('</script', '<\\/script'))
    out = os.path.join(APP, 'www', 'games', meta['file']); open(out, 'w', encoding='utf-8').write(html)
    print('wrote', out, len(html), 'bytes')

if __name__ == '__main__':
    ids = sys.argv[1:] or sorted(d for d in os.listdir(os.path.join(HERE, 'games')) if os.path.exists(os.path.join(HERE, 'games', d, 'meta.json')))
    for g in ids: build(g)
