"""SHITHEAD LABOOZIE: every 2D frame, from Hunter's drawing (original.png).

His head and his hoodie are cut straight out of the pixelled drawing (pix.py), so his face never changes; his arms (black
sleeves, white gloves), camo legs and big tan boots are drawn by Skeet Fighter's rig (rig.py) in the same colours, outline
and top-left light, and posed with two-bone IK. That gives him a real idle, walk, run, jump, crouch, his bag throw, getting
hurt, falling, lying, and every Skeet Fighter move.

Writes lab.png + lab.json (frames lab_<anim><i>, lab_s0 = the straight drawing, lab_bag0-3 = the flaming bag of shit,
lab_burn0-3 = the burning patch it leaves, lab_splat = what covers a foe it hits, lab_face = a head-and-shoulders bust).
Every game reads them: newgames through art.base(), Load Legacy through its build, Cumheads Quest through its own block.
    python3 tools/laboozie/make.py
"""
import json, math, os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE)
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(TOOLS, 'newgames', 'games', 'skeet'))
import pix, rig as R, fighters as FT

INK = '#12040a'
def rigspec(S):
    """the rig, built from the pixelled drawing S (31 x 54): head rows 0-20, hoodie 19-36, legs and boots below"""
    head = S.crop((3, 0, 27, 21))
    body = R.reline(R.erase(S.crop((4, 19, 26, 37)), [(0, 5, 3, 18), (18, 5, 22, 18)]), INK)
    return dict(head=(head, (14 - 3, 20)), body=(body, (14 - 4, 36 - 19)), hipRow=36, neckRow=20, hipW=3.4,
        shf=(5, 12), shb=(-4, 12), arm=(5.6, 5.2), armR=2.3, armPal=('#4a4654', '#2c2834', '#18141c'), armPalB=('#34303c', '#201c26', '#100c14'), armOut=INK,
        handR=3.2, handPal=('#ffffff', '#dcd8e0', '#8a8494'), leg=(5.8, 5.6), legR=3.0, legTaper=0.92,
        legPal=('#6e6a3a', '#4a4a26', '#2a2a16'), legPalB=('#56522c', '#3a381c', '#1e1e10'), legOut=INK,
        footR=(5.0, 2.9), footF=2.0, footPal=('#f0b45a', '#c08038', '#6a4418'), sole=('#8a5a28', '#5a3a18', '#3a2410'),
        boot=boot, outer=INK, inner='#0a080c', rest=dict(hip=(0, 0.95), lean=1, ff=(0.4, 0), bf=(-0.36, 0), fh=(0.62, 0.3), bh=(0.3, 0.22)))
def boot(pt, t):
    """his tan work boots seen from the side: a high ankle, a round toe cap pointing the way he faces, a heel at the back
    and a thick dark sole (he said the round blobs read as feet on backwards)"""
    x, y = t; P = ('#f0b45a', '#c08038', '#6a4418') # y is up here: y is the floor under him
    pt.cap((x - 0.9, y + 1.4), (x - 0.7, y + 5.2), 2.6, P)        # ankle and heel counter
    pt.cap((x - 1.9, y + 1.6), (x + 3.4, y + 1.4), 2.0, P)        # the foot
    pt.ell((x + 4.3, y + 1.7), 2.5, 2.1, P, shine=True)          # toe cap, in front
    pt.cap((x - 3.1, y - 0.4), (x + 6.3, y - 0.4), 0.9, ('#5a3a18', '#3a2410', '#2a1a0c'))  # sole, toe to heel
def camo(im, seed):
    """his cargo trousers are camo: blotches of olive, brown and black on the leg colours"""
    im = im.copy(); p = im.load(); legs = {(0x6e, 0x6a, 0x3a), (0x4a, 0x4a, 0x26), (0x2a, 0x2a, 0x16), (0x56, 0x52, 0x2c), (0x3a, 0x38, 0x1c), (0x1e, 0x1e, 0x10)}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = p[x, y]
            if a and (r, g, b) in legs:
                n = math.sin(x * 1.7 + y * 0.9 + seed) + math.sin(x * 0.6 - y * 1.3 + seed * 2)
                if n > 0.9: p[x, y] = (96, 74, 44, 255) if (r, g, b)[0] > 60 else (70, 54, 30, 255)
                elif n < -1.1: p[x, y] = (30, 30, 20, 255)
    return im
def extra_anims():
    """his own moves on top of the fighter set"""
    P = FT.P; A = {}
    # TOSS: the flaming bag goes back over his shoulder, then he lobs it underarm-overarm out in front
    A['toss'] = [P(hip=(-0.04, 0.93), lean=-2, fh=(-0.45, 0.85), bh=(0.45, 0.35), feb=(1, 0.2), head=(-1, 0)),
                 P(hip=(0.06, 0.92), lean=3, fh=(0.95, 0.55), bh=(0.2, 0.1), feb=(-1, 0), fhand='big', bf=(-0.42, 0.05)),
                 P(hip=(0.04, 0.93), lean=2, fh=(0.8, 0.0), bh=(0.3, 0.2))]
    # STAND: arms down by his sides like the drawing, a little breath
    A['stand'] = [P(hip=(0, 0.95 - 0.02 * k), lean=0, ff=(0.3, 0), bf=(-0.3, 0), fh=(0.42, -0.82), bh=(-0.42, -0.82), head=(0, -k)) for k in (0, 1)]
    # PLATFORM GAMES: a relaxed idle and walk with his arms down and swinging (the fighter's walk keeps his guard up)
    A['pidle'] = [P(hip=(0, 0.95 - 0.02 * (1 - math.cos(a)) / 2), lean=0, ff=(0.28, 0), bf=(-0.28, 0), fh=(0.42, -0.8 + 0.03 * math.sin(a)), bh=(-0.42, -0.8 + 0.03 * math.sin(a)), head=(0, -round((1 - math.cos(a)) / 2))) for a in [i / 4 * math.tau for i in range(4)]]
    def pw(a):
        c = math.cos(a); s = math.sin(a)
        return P(hip=(0.02, 0.93 - 0.035 * abs(c)), lean=1, ff=(0.04 + 0.34 * c, max(0, -0.2 * s)), bf=(0.0 - 0.34 * c, max(0, 0.2 * s)), fh=(0.42 - 0.24 * c, -0.8 + 0.06 * abs(c)), bh=(-0.42 + 0.24 * c, -0.8 + 0.06 * abs(c)), feb=(-1, -0.2), beb=(-1, -0.2))
    A['pwalk'] = [pw(i / 8 * math.tau) for i in range(8)]
    A['pjump'] = [P(hip=(0, 0.95), lean=1, ff=(0.3, 0.5), bf=(-0.15, 0.35), fh=(0.55, 0.65), bh=(-0.35, 0.75), fkb=(1, 0.5), bkb=(1, 0.5)),
                  P(hip=(0, 0.95), lean=1, ff=(0.3, 0.1), bf=(-0.25, 0.2), fh=(0.6, 0.2), bh=(-0.45, 0.35))]
    A['fall2'] = [P(hip=(0, 0.95), lean=2, ff=(0.3, 0.3), bf=(-0.3, 0.1), fh=(0.6, 0.8), bh=(-0.4, 0.8), feb=(0, 1), beb=(0, 1))]
    return A
def bag(i):
    """the flaming bag of shit: a brown paper bag, the shit poking out the top, flames licking up (4 flickers)"""
    im = Image.new('RGBA', (18, 22), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    fl = [(8, 2), (5, 5), (11, 4), (13, 7)]; s = [0, 1, -1, 1][i]
    for k, (x, y) in enumerate(fl):
        h = 7 + (k + i) % 3 * 2; d.polygon([(x - 3, 12), (x + s, max(0, y - (h - 7))), (x + 3, 12)], fill=(255, 120 + 30 * ((k + i) % 2), 20, 255))
        d.polygon([(x - 1, 12), (x + s, y + 3), (x + 1, 12)], fill=(255, 230, 110, 255))
    d.polygon([(3, 11), (15, 11), (16, 21), (2, 21)], fill=(170, 120, 70, 255), outline=(18, 4, 10, 255))
    d.line([(4, 12), (14, 12)], fill=(120, 80, 40, 255)); d.line([(5, 14), (6, 20)], fill=(200, 150, 96, 255))
    d.ellipse((6, 8, 12, 13), fill=(110, 60, 24, 255), outline=(18, 4, 10, 255)); d.point((8, 9), fill=(170, 110, 60, 255))
    return im
def fire(i):
    """the patch a bag leaves when it hits the floor: a burning brown smear with green stink and flames for 8 seconds"""
    im = Image.new('RGBA', (40, 18), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((1, 10, 39, 17), fill=(70, 40, 16, 255), outline=(18, 4, 10, 255)); d.ellipse((6, 11, 33, 15), fill=(110, 64, 26, 255))
    for k in range(6):
        x = 4 + k * 6 + (i * 3 + k) % 4; h = 5 + (k * 3 + i * 2) % 6
        d.polygon([(x - 3, 13), (x, 13 - h - 3), (x + 3, 13)], fill=(255, 110 + (k % 2) * 40, 20, 255)); d.polygon([(x - 1, 13), (x, 13 - h), (x + 1, 13)], fill=(255, 220, 100, 255))
    for k in range(4):
        x = 6 + k * 9 + i % 2 * 3; y = 2 + (k + i) % 3; d.ellipse((x, y, x + 3, y + 3), outline=(120, 190, 60, 200))
    return im
def splat():
    """the shit that covers a foe the bag hits (poisoned): drawn over them, dripping"""
    im = Image.new('RGBA', (20, 14), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((2, 1, 18, 9), fill=(100, 56, 22, 255), outline=(18, 4, 10, 255)); d.ellipse((5, 2, 11, 5), fill=(150, 96, 50, 255))
    for x in (4, 9, 14): d.line([(x, 8), (x, 12)], fill=(100, 56, 22, 255), width=2)
    d.ellipse((12, 0, 16, 3), outline=(120, 190, 60, 255)); return im
def bust(S):
    """head and shoulders for HUD faces and portraits"""
    return S.crop((0, 0, 31, 34))
def build():
    S = pix.pixel(); C = rigspec(S); frames = {'lab_s0': S, 'lab_face': bust(S)}
    A = FT.anims('cu')
    for n in ('idle', 'walk', 'run', 'dash', 'jump', 'jab', 'cross', 'kick', 'rh', 'sweep', 'knee', 'crouch', 'cjab', 'fire', 'upper', 'grab', 'throw'):
        for p in A.get(n, []):
            b = p.get('bh')
            if b and b[0] > -0.2 and b[1] < 0.5: p['bh'] = (min(b[0] - 0.55, -0.25), b[1] - 0.25)
    A.update(extra_anims())
    for n, L in A.items():
        for i, p in enumerate(L):
            im = R.render(C, p)
            if n == 'lie': im = R.lying(im)
            frames['lab_%s%d' % (n, i)] = camo(im, i * 1.3 + len(n))
    for i in range(4): frames['lab_bag%d' % i] = bag(i); frames['lab_burn%d' % i] = fire(i)
    frames['lab_splat'] = splat()
    # pack in rows
    W = 512; x = y = rowh = 0; pos = {}
    for k, im in frames.items():
        if x + im.width > W: x = 0; y += rowh + 1; rowh = 0
        pos[k] = [x, y, im.width, im.height]; x += im.width + 1; rowh = max(rowh, im.height)
    sh = Image.new('RGBA', (W, y + rowh + 1), (0, 0, 0, 0))
    for k, im in frames.items(): sh.paste(im, (pos[k][0], pos[k][1]))
    sh.save(os.path.join(HERE, 'lab.png')); json.dump({'frames': pos}, open(os.path.join(HERE, 'lab.json'), 'w'), indent=0)
    return frames
if __name__ == '__main__':
    F = build(); print(len(F), 'frames')
    if '--preview' in sys.argv:
        names = ['lab_s0'] + ['lab_idle%d' % i for i in range(4)] + ['lab_walk%d' % i for i in range(8)] + ['lab_run%d' % i for i in range(6)] + ['lab_jump%d' % i for i in range(3)] + \
                ['lab_toss%d' % i for i in range(3)] + ['lab_stand0', 'lab_crouch0', 'lab_hurt0', 'lab_hurt1', 'lab_fall0', 'lab_lie0', 'lab_jab1', 'lab_kick1', 'lab_rh1', 'lab_fire1', 'lab_win0', 'lab_bag0', 'lab_burn0', 'lab_splat']
        sc = 5; cw = 64; prev = Image.new('RGBA', (cw * sc * 8, cw * sc * ((len(names) + 7) // 8)), (60, 40, 44, 255))
        for k, n in enumerate(names):
            im = F[n].resize((F[n].width * sc, F[n].height * sc), Image.NEAREST); X = (k % 8) * cw * sc + (cw * sc - im.width) // 2; Y = (k // 8) * cw * sc + cw * sc - im.height - 8
            prev.paste(im, (X, Y), im)
        prev.save('/home/claude/ck/labprev.png')
