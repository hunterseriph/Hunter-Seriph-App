#!/usr/bin/env python3
"""Update 184: records only what changed (the voices that got their own speaker, and lines that had no recording yet),
then writes voices.js for every line in the game. Uses voices.py's speakers and settings."""
import json, os, sys, multiprocessing
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import voices as V
CHANGED = set(os.environ.get('WHO', 'clown,bl,pedM0,pedM1,pedM2,knight,traffic,sports').split(','))
T0 = float(os.environ.get('T0', '0'))
def main():
    lines = json.load(open(V.LINES)); have = json.loads(open(os.path.join(V.OUT, 'voices.js')).read().split('=', 1)[1].strip().rstrip(';'))
    done, todo = {}, []
    for who, text in lines:
        if who == 'steve' or who not in V.V: continue
        k = V.key(who, text); done[k] = 1
        f = os.path.join(V.OUT, k + '.mp3')
        if os.path.exists(f) and os.path.getmtime(f) > T0: continue  # already recorded this time round
        if who in CHANGED or k not in have: todo.append((who, text, f, None))
    print('to record', len(todo), flush=True)
    with multiprocessing.Pool(int(os.environ.get('JOBS', '4'))) as pool: errs = [e for e in pool.map(V.job, todo) if e]
    print('errors', len(errs), errs[:3])
    open(os.path.join(V.OUT, 'voices.js'), 'w').write('window.CCNVOICE = ' + json.dumps(done, separators=(',', ':')) + ';\n')
    print('voices.js', len(done))
    return [t[2] for t in todo]
if __name__ == '__main__':
    out = main(); open('/home/claude/ck/ccn/recorded184.txt', 'w').write('\n'.join(out))
