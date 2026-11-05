"""The four fighters' rigs (pieces cut from their own sprites, limb colours taken from them) and their movesets.

ANIMS lists every animation as a list of poses; each becomes frames sk_<k>_<anim><i>. The game picks the frame from a
move's own timing (wind-up, hit, recovery), so a jab, a cross and a kick are all different drawings.
"""
import math
import rig as R

def build_rigs(B):
    ch = B('ch_idle0'); gr = B('greebo_s0'); ho = B('h_gloop_adult_idle0'); sp = B('spermaid_s0')
    rigs = {}
    # CUMHEAD: his head and shirt, black sleeves and trousers with his red edging, big white gloves, chunky boots
    head = R.erase(ch.crop((4, 0, 30, 28)), [(0, 22, 4, 28), (21, 22, 26, 28)])
    body = R.reline(R.erase(ch.crop((7, 26, 24, 39)), [(0, 8, 2, 13), (15, 8, 17, 13)]), '#b31b24') # the shirt only: the trousers are drawn as legs
    rigs['cu'] = dict(head=(head, (15 - 4, 27)), body=(body, (15 - 7, 38 - 26)), hipRow=38, neckRow=27, hipW=3.2,
        shf=(4, 9), shb=(-3, 9), arm=(5.5, 5.5), armR=1.9, armPal=('#5a4a52', '#2e2529', '#141012'), armPalB=('#3a3034', '#1e181b', '#0a0809'), armOut='#b31b24',
        handR=3.3, handPal=('#ffffff', '#dcd6e0', '#8a8494'), leg=(9, 8.5), legR=2.7, legTaper=0.9, legPal=('#5a4a52', '#2e2529', '#141012'), legPalB=('#3a3034', '#1e181b', '#0a0809'),
        legOut='#b31b24', footR=(4.4, 2.5), footF=1.6, footPal=('#5a4a52', '#221a1e', '#070506'), sole=('#ff3a44', '#c4121c', '#6a0a10'),
        outer='#b31b24', inner='#6a0a10',
        rest=dict(hip=(0, 0.95), lean=1, ff=(0.4, 0), bf=(-0.36, 0), fh=(0.62, 0.3), bh=(0.3, 0.22)))
    # GREEBO: the whole pie and hat, his black apron with the G, white chef sleeves and gloves, little black legs
    ghead = R.reline(R.erase(gr.crop((8, 0, 33, 32)), [(0, 18, 3, 32), (21, 18, 25, 32)]), '#12040a')
    gbody = R.reline(R.erase(gr.crop((9, 30, 31, 41)), [(0, 0, 3, 11), (18, 0, 22, 11)]), '#12040a')
    rigs['gr'] = dict(head=(ghead, (19 - 8, 31)), body=(gbody, (19 - 9, 39 - 30)), hipRow=39, neckRow=31, hipW=4,
        shf=(6, 7), shb=(-5, 7), arm=(5.5, 5.5), armR=2.2, armPal=('#ffffff', '#dcdcdc', '#9a9a9a'), armPalB=('#dcdcdc', '#b0b0b0', '#7a7a7a'), armOut='#12040a',
        handR=3.4, handPal=('#ffffff', '#e4e4e4', '#a0a0a0'), leg=(3.2, 3.2), legR=2.5, legPal=('#3a3a3a', '#2c2c2c', '#141414'), legPalB=('#2c2c2c', '#1c1c1c', '#0c0c0c'),
        legOut='#12040a', footR=(4.2, 2.3), footF=1.4, footPal=('#4a4a4a', '#222222', '#0a0a0a'),
        rest=dict(hip=(0, 0.92), lean=1, ff=(0.45, 0), bf=(-0.45, 0), fh=(0.55, 0.35), bh=(0.45, 0.5)))
    # THE HOMUNCULUS: his head and body, long teal arms with bone claws, digitigrade-ish legs
    hhead = R.erase(ho.crop((10, 0, 34, 18)), [])
    hbody = R.reline(R.erase(ho.crop((12, 15, 30, 31)), [(10, 2, 18, 16)]), '#12040a')
    rigs['ho'] = dict(head=(hhead, (19 - 10, 16)), body=(hbody, (19 - 12, 29 - 15)), hipRow=29, neckRow=16, hipW=3,
        shf=(3, 11), shb=(-3, 11), arm=(6.5, 6.5), armR=1.8, armTaper=0.75, armPal=('#5cc7c9', '#2a8a94', '#16505a'), armPalB=('#3aa0a8', '#1e6a74', '#0e3a42'), armOut='#12040a',
        handR=2.4, handPal=('#e8dcc0', '#bfae8e', '#7a6a4e'), claw=1, leg=(6, 6.5), legR=2.3, legTaper=0.75, legPal=('#5cc7c9', '#2a8a94', '#16505a'), legPalB=('#3aa0a8', '#1e6a74', '#0e3a42'),
        legOut='#12040a', footR=(3, 2), footF=1, footPal=('#e8dcc0', '#bfae8e', '#7a6a4e'),
        rest=dict(hip=(0, 0.9), lean=2, ff=(0.36, 0), bf=(-0.34, 0), fh=(0.6, 0.15), bh=(0.5, 0.3)))
    # SPERMAID: her whole droplet from his drawing, her tail drawn as one sweeping curve with the pink fin, little arms
    spx = sp.copy(); p = spx.load()
    for y in range(spx.height):
        for x in range(spx.width):
            r, g, b, a = p[x, y]
            if a and ((g > r + 30 and b > r + 30) or (r > 150 and b > 60 and g < 80)) : p[x, y] = (0, 0, 0, 0) # tail and fin go
            if a and y >= 34: p[x, y] = (0, 0, 0, 0)
    spx = R.erase(spx, [(26, 26, 34, 40)])
    sbody = R.reline(spx.crop((6, 0, 32, 36)), '#12040a')
    rigs['sp'] = dict(head=None, body=(sbody, (19 - 6, 34)), hipRow=34, neckRow=8, hipW=0, order=['ba', 'fl', 'body', 'fa'],
        shf=(3, 9), shb=(-4, 10), arm=(4.5, 4.5), armR=1.7, armPal=('#fffbe8', '#f1e0b0', '#b8a070'), armPalB=('#f1e0b0', '#d0bc8a', '#9a8458'), armOut='#12040a',
        handR=2.3, handPal=('#fffbe8', '#f1e0b0', '#b8a070'), tail=1, leg=(7, 7), legR=4.2, legPal=('#4ad0d8', '#1aa0b0', '#0a7088'), legOut='#12040a',
        finPal=('#ff8ac4', '#f01078', '#a00a60'), tailRoot=(0, 2), tailBow=(-2, -6),
        rest=dict(hip=(0, 0.95), lean=0, ff=(0.55, 0.1), fh=(0.55, 0.2), bh=(0.4, 0.3)))
    return rigs

# ------------------------------------------------------------------ the moveset (poses). i = frame index
def cyc(n, f): return [f(i, i / n * math.tau) for i in range(n)]
def P(**k): return k

def anims(k):
    A = {}
    tail = k == 'sp'; heavy = k == 'gr'; beast = k == 'ho'
    g = 0.04 if heavy else 0 # Greebo stands wider and lower
    # IDLE: a fighting stance that breathes
    A['idle'] = cyc(4, lambda i, a: P(hip=(0, 0.93 - 0.03 * (1 - math.cos(a)) / 2), fh=(0.62, 0.3 - 0.04 * math.sin(a)), bh=(0.3, 0.22 - 0.04 * math.sin(a)), head=(0, -round((1 - math.cos(a)) / 2)),
        ff=(0.55, 0.12 + 0.05 * math.sin(a)) if tail else (0.34, 0)))
    # WALK: proper steps, feet planted on the floor, the hip bobbing
    def walk(i, a):
        s = math.sin(a); c = math.cos(a)
        if tail: return P(hip=(0, 0.95 + 0.04 * s), lean=1 + round(c), ff=(0.5 + 0.12 * c, 0.1 + 0.08 * s), fh=(0.5, 0.28 + 0.04 * s), bh=(0.4, 0.4 - 0.04 * s))
        return P(hip=(0.02, 0.93 - 0.035 * abs(math.cos(a))), lean=1, ff=(0.04 + 0.34 * c, max(0, 0.2 * s)), bf=(0.0 - 0.34 * c, max(0, -0.2 * s)),
                 fh=(0.62, 0.3 + 0.03 * c), bh=(0.3, 0.22 - 0.03 * c))
    A['walk'] = cyc(8, walk)
    # RUN: long strides, arms pumping, leaning in
    def run(i, a):
        s = math.sin(a); c = math.cos(a)
        if tail: return P(hip=(0, 1.05 + 0.06 * s), lean=4, ff=(-0.3 + 0.3 * c, 0.35 + 0.15 * s), fh=(0.3 + 0.35 * c, -0.1), bh=(0.3 - 0.35 * c, -0.05))
        return P(hip=(0.06, 0.9 + 0.06 * abs(s)), lean=4, ff=(0.1 + 0.5 * c, max(0, 0.42 * s)), bf=(0.1 - 0.5 * c, max(0, -0.42 * s)),
                 fh=(0.25 - 0.45 * c, 0.05 - 0.15 * abs(c)), bh=(0.25 + 0.45 * c, 0.05 - 0.15 * abs(c)), feb=(-1, -0.4), beb=(-1, -0.4))
    A['run'] = cyc(6, run)
    # JAB: front hand snaps out at head height and straight back
    A['jab'] = [P(lean=0, fh=(0.3, 0.32), bh=(0.4, 0.46)), P(hip=(0.04, 0.94), lean=2, fh=(1.0, 0.22), bh=(0.38, 0.46), feb=(0, -1), fhand='big'), P(lean=1, fh=(0.65, 0.28))]
    # CROSS: the back hand comes all the way through, hips turned, back heel up
    A['cross'] = [P(lean=-1, bh=(0.15, 0.4), fh=(0.55, 0.36)), P(hip=(0.12, 0.92), lean=4, bh=(1.05, 0.2), fh=(0.2, 0.42), bf=(-0.36, 0.06) if not tail else None, beb=(0, -1), bhand='big', order=['bl', 'fl', 'body', 'head', 'fa', 'ba']),
                  P(hip=(0.06, 0.93), lean=2, bh=(0.6, 0.3), fh=(0.45, 0.38))]
    # KICK: knee up, foot out to the belly, back again (Spermaid: a tail flick)
    if tail:
        A['kick'] = [P(lean=-2, ff=(-0.3, 0.3)), P(lean=-1, ff=(1.05, 0.45), fkick=1, fh=(0.2, 0.45), bh=(-0.3, 0.3)), P(lean=0, ff=(0.6, 0.3))]
        A['rh'] = [P(lean=-3, hip=(0, 1.0), ff=(-0.6, 0.6)), P(lean=-3, hip=(0, 1.05), ff=(1.05, 1.1), fh=(-0.2, 0.6), bh=(-0.5, 0.3)), P(lean=-1, ff=(0.7, 0.7))]
    else:
        A['kick'] = [P(hip=(-0.04, 0.94), lean=-1, ff=(0.32, 0.45), fkb=(1, 0.6)), P(hip=(-0.1, 0.95), lean=-2, ff=(0.95, 0.55), fkick=1, fh=(0.35, 0.45), bh=(0.1, 0.5)), P(hip=(-0.04, 0.94), lean=-1, ff=(0.45, 0.25))]
        # ROUNDHOUSE: a high kick, leaning right back
        A['rh'] = [P(hip=(-0.05, 0.95), lean=-2, ff=(0.15, 0.55), fkb=(1, 1)), P(hip=(-0.14, 0.97), lean=-5, ff=(0.85, 1.25), fkick=1, fh=(-0.2, 0.55), bh=(-0.5, 0.25), head=(-1, 0)),
                   P(hip=(-0.08, 0.95), lean=-3, ff=(0.55, 0.7), fkick=1)]
    # UPPERCUT: dip low, then the fist goes right up past the head
    A['upper'] = [P(hip=(0, 0.72), lean=2, ff=(0.42, 0) if not tail else (0.4, 0.05), bf=(-0.36, 0), fh=(0.25, -0.35), bh=(0.4, 0.4), feb=(-1, 0)),
                  P(hip=(0.06, 1.0), lean=1, ff=(0.3, 0) if not tail else (0.2, -0.05), bf=(-0.36, 0.08), fh=(0.28, 0.98), bh=(0.2, 0.1), feb=(1, 0), fhand='big', head=(0, 1)),
                  P(hip=(0.03, 0.96), lean=1, fh=(0.35, 0.65))]
    # SWEEP: right down on the floor, the front leg (or the tail) swung along the ground
    if tail: A['sweep'] = [P(hip=(0, 0.65), lean=3, ff=(-0.4, 0.05), fh=(0.5, -0.4), bh=(0.2, -0.5)), P(hip=(0, 0.6), lean=3, ff=(1.1, 0.04), fkick=1, fh=(0.6, -0.5), bh=(-0.3, -0.4)), P(hip=(0, 0.65), lean=2, ff=(0.6, 0.05))]
    else: A['sweep'] = [P(hip=(0, 0.6), lean=4, ff=(0.45, 0), bf=(-0.3, 0), fh=(0.55, -0.6), bh=(0.3, -0.5)),
                        P(hip=(-0.05, 0.5), lean=5, ff=(1.0, 0.05), fkick=1, bf=(-0.15, 0), bkb=(1, 0.5), fh=(0.65, -0.75), bh=(0.25, -0.8), head=(0, -1)),
                        P(hip=(0, 0.55), lean=4, ff=(0.6, 0.02), bf=(-0.25, 0), fh=(0.5, -0.5), bh=(0.3, -0.5))]
    # CROUCH, crouch jab, blocks
    A['crouch'] = [P(hip=(0, 0.6), lean=3, ff=(0.42, 0) if not tail else (0.45, 0.02), bf=(-0.36, 0), fh=(0.55, 0.25), bh=(0.45, 0.38), head=(0, -1))]
    A['cjab'] = [P(hip=(0, 0.6), lean=4, ff=(0.42, 0) if not tail else (0.45, 0.02), bf=(-0.36, 0), fh=(1.0, 0.05), bh=(0.42, 0.35), fhand='big', feb=(0, -1))]
    A['block'] = [P(hip=(-0.04, 0.92), lean=-2, fh=(0.35, 0.65), bh=(0.3, 0.45), feb=(1, -0.2), beb=(1, -0.4), head=(-1, 0))]
    A['cblock'] = [P(hip=(-0.02, 0.6), lean=1, ff=(0.42, 0) if not tail else (0.45, 0.02), bf=(-0.36, 0), fh=(0.35, 0.5), bh=(0.3, 0.3), feb=(1, -0.2), head=(-1, -1))]
    # JUMPS: take off, tucked at the top, legs down for landing
    if tail:
        A['jump'] = [P(hip=(0, 0.8), lean=1, ff=(0.3, 0.0), fh=(0.3, -0.3), bh=(0.1, -0.3)), P(hip=(0, 1), lean=0, ff=(-0.5, 0.8), fh=(0.5, 0.6), bh=(-0.3, 0.7)), P(hip=(0, 1), lean=1, ff=(0.2, 0.2), fh=(0.6, 0.3), bh=(0.2, 0.5))]
        A['jkick'] = [P(hip=(0, 1), lean=-2, ff=(1.0, 0.25), fkick=1, fh=(-0.1, 0.6), bh=(-0.5, 0.4))]
    else:
        A['jump'] = [P(hip=(0, 0.75), lean=2, ff=(0.3, 0), bf=(-0.3, 0), fh=(0.2, -0.3), bh=(0.0, -0.35)),
                     P(hip=(0, 0.95), lean=1, ff=(0.35, 0.58), bf=(-0.05, 0.5), fh=(0.55, 0.5), bh=(0.35, 0.6), fkb=(1, 0.5), bkb=(1, 0.5)),
                     P(hip=(0, 0.95), lean=1, ff=(0.3, 0.12), bf=(-0.2, 0.2), fh=(0.55, 0.45), bh=(0.2, 0.6))]
        # FLYING KICK: front leg straight out and down, the back one tucked
        A['jkick'] = [P(hip=(0, 0.95), lean=-3, ff=(0.95, 0.3), fkick=1, bf=(-0.05, 0.55), bkb=(1, 0.4), fh=(-0.1, 0.6), bh=(-0.45, 0.35))]
    A['jpunch'] = [P(hip=(0, 0.95), lean=3, ff=(0.3, 0.45) if not tail else (-0.3, 0.4), bf=(-0.1, 0.4), fh=(0.85, -0.45), bh=(0.3, 0.4), fhand='big', feb=(0, 1))]
    # HURT: snapped back at the head, or folded at the gut
    A['hurt'] = [P(hip=(-0.08, 0.93), lean=-5, head=(-2, 0), fh=(-0.15, 0.55), bh=(-0.5, 0.35), feb=(0, 1), beb=(0, 1)),
                 P(hip=(0.02, 0.88), lean=5, head=(1, -2), fh=(0.35, -0.2), bh=(0.3, -0.1))]
    # LAUNCHED: flung back, arms and legs everywhere (the game tips it as they fly)
    A['fall'] = [P(hip=(0, 0.95), lean=-6, head=(-2, 1), ff=(0.6, 0.5) if not tail else (0.9, 0.6), bf=(0.3, 0.3), fh=(-0.5, 0.75), bh=(-0.9, 0.2), fkick=1, feb=(0, 1), beb=(0, 1))]
    # LYING on the back: drawn standing with everything along the body, then turned over in art.py
    A['lie'] = [P(hip=(0, 0.95), lean=0, ff=(0.1, 0) if not tail else (0.1, -0.05), bf=(-0.1, 0), fh=(0.35, -0.6), bh=(-0.35, -0.55), fkick=1)]
    A['getup'] = [P(hip=(0, 0.5), lean=6, ff=(0.42, 0) if not tail else (0.45, 0.02), bf=(-0.4, 0), fh=(0.5, -0.9), bh=(0.2, -0.9), head=(0, -1))]
    # GRAB: both hands out on them; KNEE: a knee to the gut while holding; THROW: heave them over
    A['grab'] = [P(hip=(0.04, 0.92), lean=3, fh=(0.85, 0.25), bh=(0.8, 0.1), feb=(0, -1), beb=(0, -1))]
    A['knee'] = [P(hip=(0.04, 0.95), lean=2, ff=(0.45, 0.6) if not tail else (0.9, 0.5), fkb=(1, 1), fh=(0.85, 0.25), bh=(0.8, 0.1)), P(hip=(0.04, 0.92), lean=3, fh=(0.85, 0.25), bh=(0.8, 0.1))]
    A['throw'] = [P(hip=(-0.04, 0.9), lean=-2, fh=(0.7, 0.5), bh=(0.6, 0.35)), P(hip=(-0.12, 0.95), lean=-6, head=(-2, 0), fh=(-0.5, 0.85), bh=(-0.6, 0.65), ff=(0.5, 0) if not tail else (0.6, 0.1), bf=(-0.3, 0), feb=(0, 1), beb=(0, 1))]
    # FIREBALL: both hands drawn back to the hip, then pushed out together, wide stance
    A['fire'] = [P(hip=(-0.06, 0.82), lean=-2, ff=(0.5, 0) if not tail else (0.5, 0.05), bf=(-0.42, 0), fh=(-0.35, -0.3), bh=(-0.45, -0.25), fhand='big', bhand='big', head=(-1, -1)),
                 P(hip=(0.08, 0.84), lean=4, ff=(0.6, 0) if not tail else (0.7, 0.05), bf=(-0.5, 0), fh=(1.0, 0.12), bh=(0.95, -0.02), fhand='big', bhand='big', feb=(0, -1), beb=(0, -1)),
                 P(hip=(0.06, 0.86), lean=3, ff=(0.6, 0) if not tail else (0.7, 0.05), bf=(-0.5, 0), fh=(0.85, 0.15), bh=(0.8, 0.02), fhand='big', bhand='big')]
    # RISING (the Shoryu): fist straight up, front knee up, in the air
    A['rise'] = [P(hip=(0.04, 0.98), lean=2, ff=(0.4, 0.55) if not tail else (-0.4, 0.5), fkb=(1, 1), bf=(-0.15, 0.1), fh=(0.2, 1.0), bh=(0.05, 0.1), fhand='big', feb=(1, 0)),
                 P(hip=(0.02, 1.0), lean=1, ff=(0.3, 0.4) if not tail else (-0.6, 0.6), bf=(-0.1, 0.2), fh=(0.05, 1.0), bh=(-0.2, 0.2), fhand='big', feb=(1, 0))]
    # DASH: a shoulder charge, low, both arms tucked
    A['dash'] = [P(hip=(0.1, 0.82), lean=6, ff=(0.6, 0) if not tail else (-0.6, 0.3), bf=(-0.55, 0.05), fh=(0.55, 0.0), bh=(0.4, -0.1), head=(1, -1), feb=(-1, -0.3))]
    # POUND: crouch and slam a fist into the floor
    A['pound'] = [P(hip=(0, 0.9), lean=-2, fh=(0.2, 1.0), bh=(-0.2, 0.9), fhand='big', bhand='big', feb=(-1, 0), beb=(-1, 0)),
                  P(hip=(0.02, 0.5), lean=6, ff=(0.45, 0) if not tail else (0.5, 0.02), bf=(-0.4, 0), fh=(0.55, -1.0), bh=(0.4, -0.9), fhand='big', bhand='big', head=(0, -1))]
    # SUPER: arms thrown wide, powering up
    A['super'] = [P(hip=(0, 0.88), lean=-2, ff=(0.5, 0) if not tail else (0.6, 0.1), bf=(-0.45, 0), fh=(0.65, 0.75), bh=(-0.65, 0.75), fhand='big', bhand='big', head=(0, 1), feb=(1, -1), beb=(-1, -1))]
    # WIN: a fist in the air, a little bounce
    A['win'] = [P(hip=(0, 0.95), lean=0, fh=(0.15, 1.0), bh=(0.3, -0.5), fhand='big', feb=(1, 0), head=(0, 1)), P(hip=(0, 0.92), lean=0, fh=(0.2, 0.95), bh=(0.3, -0.5), fhand='big', feb=(1, 0))]
    # DIZZY: slumped, arms hanging, swaying
    A['dizzy'] = [P(hip=(-0.03, 0.88), lean=3, head=(1, -2), fh=(0.15, -0.9), bh=(-0.05, -0.9)), P(hip=(0.03, 0.88), lean=-1, head=(-1, -2), fh=(0.05, -0.9), bh=(-0.15, -0.9))]
    # Greebo's swings are a big two-handed belly of a man: wider stance on everything
    if heavy:
        for n, L in A.items():
            for p in L:
                if 'ff' in p and p['ff'] and p['ff'][1] < 0.05: p['ff'] = (p['ff'][0] + 0.1, p['ff'][1])
                if 'bf' in p and p['bf'] and p['bf'][1] < 0.05: p['bf'] = (p['bf'][0] - 0.1, p['bf'][1])
    return A

def frames(B):
    """every frame, name -> image"""
    rigs = build_rigs(B); out = {}
    for k, C in rigs.items():
        for n, L in anims(k).items():
            for i, p in enumerate(L):
                im = R.render(C, p)
                if n == 'lie': im = R.lying(im)
                out['sk_%s_%s%d' % (k, n, i)] = im
    return out
