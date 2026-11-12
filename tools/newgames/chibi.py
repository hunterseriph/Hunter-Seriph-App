"""Chibi Cumhead for the top-down games (The Grinding of Cumhead, Journey to the Void's field map).

Big droplet head, little body in his black shirt, chained black and red trousers, big boots and white gloves.
Three facings (d = towards you, u = away, s = side, facing right; flip for left), four walk frames each,
plus a shooting face (mouth open) for d and s.

frames() -> {name: (Grid, palette)} with names chb_<dir><frame> and chb_<dir><frame>_o (mouth open)
"""
import math
from pixelkit import Grid

HEAD = ('#fff6dc', '#f2dca0', '#c9a462')
CLOTH = ('#3e2e34', '#21161b', '#0e0709')
RED = ('#ff4a52', '#c4121c', '#6a0a10')
GLOVE = ('#ffffff', '#ece4dc', '#a89a90')
BOOT = ('#4a3a40', '#1a1014', '#060304')
PAL = {'head': '#f2dca0', 'headd': '#c9a462', 'headl': '#fff6dc', 'cloth': CLOTH, 'red': RED, 'glove': GLOVE, 'boot': BOOT, 'eye': '#ffffff', 'pupil': '#12040a', 'mouth': '#6a0a10', 'tongue': '#ff6a6a',
       'shine': '#ffffff', 'chain': '#a8a0a8', 'sweat': '#bfe6ff', 'cheek': '#f0b088', 'smile': '#5a2a14'}
W, H = 24, 35


def head(g, d, oy, mouth):
    cx, cy = 12, 13 + oy
    # shaded by hand (flat colours) so the face stays clean: dark rim low and right, light high and left
    g.ellipse(cx, cy, 9.2, 8.2, 'headd')
    g.poly([(cx - 4.5, cy - 5), (cx + 0.5, cy - 12.5), (cx + 2.5, cy - 13), (cx + 4.5, cy - 5)], 'headd')
    g.ellipse(cx - 0.8, cy - 0.8, 8.4, 7.4, 'head')
    g.poly([(cx - 4, cy - 5), (cx + 0.5, cy - 11.5), (cx + 1.8, cy - 11.8), (cx + 3.2, cy - 5)], 'head')
    g.ellipse(cx - 3.5, cy - 3.5, 3.5, 2.6, 'headl')
    g.ellipse(cx + 5.5, cy - 13.5, 1.3, 1.6, 'head')  # the flick of cream above the point
    if d == 'u':
        g.ellipse(cx - 4, cy - 3, 1.6, 2.4, 'shine'); g.put(cx - 2, cy - 7, 'shine'); return
    if d == 'd':
        for ex in (cx - 3.5, cx + 3.5):
            g.ellipse(ex, cy - 0.5, 2.3, 3.2, 'eye'); g.rect(int(ex) - (0 if ex < cx else 1), int(cy), 2, 2, 'pupil')
        g.ellipse(cx - 6.5, cy - 4, 1.2, 1.6, 'shine')
        if mouth:
            g.ellipse(cx, cy + 5, 3.2, 2.2, 'mouth'); g.rect(cx - 1, cy + 6, 3, 1, 'tongue')
        else:
            g.line(cx - 4, cy + 4, cx - 2, cy + 5.5, 'smile'); g.line(cx - 2, cy + 5.5, cx + 2, cy + 5.5, 'smile'); g.line(cx + 2, cy + 5.5, cx + 4, cy + 4, 'smile')
        g.put(cx - 6, cy + 3, 'cheek'); g.put(cx + 6, cy + 3, 'cheek')
    else:  # side, facing right
        g.ellipse(cx + 4, cy - 0.5, 2.2, 3.2, 'eye'); g.rect(cx + 4, cy, 2, 2, 'pupil')
        g.ellipse(cx + 8.6, cy + 1.5, 1.6, 1.4, 'head')  # his nose
        g.ellipse(cx - 5, cy - 3, 1.2, 1.8, 'shine')
        if mouth: g.ellipse(cx + 5, cy + 5, 2.4, 1.8, 'mouth'); g.put(cx + 5, cy + 6, 'tongue')
        else: g.line(cx + 2, cy + 4.5, cx + 6, cy + 5.5, 'smile'); g.put(cx + 7, cy + 4.5, 'smile')
        g.put(cx + 1, cy + 3, 'cheek')


def body(g, d, f, oy):
    # walk: 0 stand, 1 left foot forward, 2 stand, 3 right foot forward
    sw = [0, 1, 0, -1][f]
    by = 22 + oy
    # trousers then boots (drawn first so the shirt sits over the waist)
    if d == 's':
        g.rect(9, by + 5, 7, 4, 'cloth')
        for bx in (8 + sw * 2, 12 - sw * 2): g.rect(bx, by + 8, 5, 3, 'boot'); g.rect(bx + 5, by + 9, 1, 2, 'boot') # toe out in front
        g.put(9 + sw * 2, by + 10, 'red'); g.put(13 - sw * 2, by + 10, 'red')
    else:
        g.rect(7, by + 5, 10, 3, 'cloth'); g.put(8, by + 6, 'red'); g.put(15, by + 6, 'red')
        lf, rf = (-1 if sw > 0 else 0), (-1 if sw < 0 else 0)
        g.rect(6, by + 8 + lf, 5, 3, 'boot'); g.rect(13, by + 8 + rf, 5, 3, 'boot')
        g.rect(6, by + 10 + lf, 5, 1, 'red'); g.rect(13, by + 10 + rf, 5, 1, 'red')
        g.put(9, by + 7, 'chain'); g.put(10, by + 8, 'chain'); g.put(14, by + 7, 'chain')
    # the shirt
    if d == 's': g.rect(8, by, 9, 6, 'cloth')
    else: g.rect(7, by, 10, 6, 'cloth')
    if d == 'd': g.rect(9, by + 1, 6, 2, 'red'); g.put(10, by + 3, 'red'); g.put(13, by + 3, 'red')  # HUNTER SERIPH, as far as it fits
    if d == 'u': g.put(11, by + 1, 'red'); g.put(12, by + 1, 'red')
    # arms and gloves, swinging opposite the feet
    if d == 's':
        g.rect(11 - sw, by + 1, 3, 4, 'cloth'); g.rect(11 - sw * 2, by + 4, 3, 3, 'glove')
    else:
        g.rect(5, by + 1 + max(0, sw), 2, 4, 'cloth'); g.rect(17, by + 1 + max(0, -sw), 2, 4, 'cloth')
        g.rect(4, by + 4 + max(0, sw), 3, 3, 'glove'); g.rect(17, by + 4 + max(0, -sw), 3, 3, 'glove')


def frame(d, f, mouth=False):
    g = Grid(W, H); oy = 1 if f in (1, 3) else 0  # a little bob in the walk
    body(g, d, f, -oy); head(g, d, -oy + 1, mouth)
    return g, PAL


def frames():
    out = {}
    for d in ('d', 'u', 's'):
        for f in range(4):
            out['chb_%s%d' % (d, f)] = (lambda d=d, f=f: frame(d, f))
            if d != 'u': out['chb_%s%d_o' % (d, f)] = (lambda d=d, f=f: frame(d, f, True))
    return out


# ---- chibi Shithead Laboozie (from Hunter's drawing): a swirl of poop for a head, black hoodie, white gloves,
# camo cargo trousers, tan boots. Same sizes and facings as Cumhead, names chl_<dir><frame>(_o) ----
LPAL = {'p1': '#3e1e08', 'p2': '#6e3e14', 'p3': '#9a5e26', 'cloth': ('#3a3440', '#1e1a22', '#0c0a0e'), 'camo': ('#7a7a4a', '#5a5a38', '#2e2e1c'), 'camod': '#3a3a22',
        'glove': GLOVE, 'boot': ('#e0b070', '#b08850', '#5a4020'), 'eye': '#ffffff', 'pupil': '#12040a', 'mouth': '#3a0a0a', 'tongue': '#ff6a6a', 'shine': '#ffffff', 'string': '#d8d0c0', 'smile': '#1e0e04'}


def lab_head(g, d, oy, mouth):
    cx, cy = 12, 15 + oy
    g.ellipse(cx, cy, 9.5, 6.5, 'p1'); g.ellipse(cx - 0.5, cy - 0.5, 8.7, 5.8, 'p2')            # the bottom coil
    g.ellipse(cx + 0.5, cy - 6, 7.2, 4.6, 'p1'); g.ellipse(cx, cy - 6.5, 6.5, 4.0, 'p2')          # the middle coil
    g.ellipse(cx - 0.5, cy - 11, 4.8, 3.2, 'p1'); g.ellipse(cx - 1, cy - 11.5, 4.2, 2.7, 'p2')     # the top coil
    g.poly([(cx - 2, cy - 13), (cx + 2, cy - 18), (cx + 3, cy - 13)], 'p2')                       # the tip
    g.line(cx - 7, cy - 3, cx + 6, cy - 2, 'p1'); g.line(cx - 5, cy - 9, cx + 5, cy - 8, 'p1')
    g.ellipse(cx - 4, cy - 2, 2.2, 1.2, 'p3'); g.ellipse(cx - 2, cy - 8, 1.6, 0.9, 'p3')
    if d == 'u': return
    if d == 'd':
        for ex in (cx - 3.5, cx + 3.5):
            g.ellipse(ex, cy, 2.4, 2.8, 'eye'); g.rect(int(ex) - (0 if ex < cx else 1), int(cy), 2, 2, 'pupil')
        if mouth: g.ellipse(cx, cy + 4, 3, 1.6, 'mouth'); g.put(cx, cy + 5, 'tongue')
        else: g.line(cx - 3, cy + 3.5, cx, cy + 4.5, 'smile'); g.line(cx, cy + 4.5, cx + 3, cy + 3.5, 'smile')
    else:
        g.ellipse(cx + 4.5, cy, 2.2, 2.8, 'eye'); g.rect(cx + 5, cy, 2, 2, 'pupil')
        if mouth: g.ellipse(cx + 6, cy + 4, 2, 1.4, 'mouth')
        else: g.line(cx + 3, cy + 4, cx + 7, cy + 3.5, 'smile')


def lab_body(g, d, f, oy):
    sw = [0, 1, 0, -1][f]; by = 22 + oy
    if d == 's':
        g.rect(9, by + 5, 7, 4, 'camo'); g.put(10, by + 6, 'camod'); g.put(13, by + 7, 'camod')
        for bx in (8 + sw * 2, 12 - sw * 2): g.rect(bx, by + 8, 5, 3, 'boot'); g.rect(bx + 5, by + 9, 1, 2, 'boot') # toe out in front
    else:
        g.rect(7, by + 5, 10, 4, 'camo'); g.put(8, by + 6, 'camod'); g.put(12, by + 5, 'camod'); g.put(15, by + 7, 'camod'); g.put(10, by + 8, 'camod')
        lf, rf = (-1 if sw > 0 else 0), (-1 if sw < 0 else 0)
        g.rect(6, by + 8 + lf, 5, 3, 'boot'); g.rect(13, by + 8 + rf, 5, 3, 'boot')
    if d == 's': g.rect(7, by - 1, 10, 7, 'cloth')
    else: g.rect(6, by - 1, 12, 7, 'cloth')
    if d == 'd': g.put(10, by + 1, 'string'); g.put(10, by + 2, 'string'); g.put(13, by + 1, 'string'); g.put(13, by + 2, 'string')
    if d == 'u': g.rect(8, by - 2, 8, 3, 'cloth')  # the hood
    if d == 's':
        g.rect(11 - sw, by + 1, 3, 4, 'cloth'); g.rect(11 - sw * 2, by + 4, 3, 3, 'glove')
    else:
        g.rect(4, by + 1 + max(0, sw), 2, 4, 'cloth'); g.rect(18, by + 1 + max(0, -sw), 2, 4, 'cloth')
        g.rect(3, by + 4 + max(0, sw), 3, 3, 'glove'); g.rect(18, by + 4 + max(0, -sw), 3, 3, 'glove')


def lab_frame(d, f, mouth=False):
    g = Grid(W, H); oy = 1 if f in (1, 3) else 0
    lab_body(g, d, f, -oy); lab_head(g, d, -oy + 1, mouth)
    return g, LPAL


def lab_frames():
    out = {}
    for d in ('d', 'u', 's'):
        for f in range(4):
            out['chl_%s%d' % (d, f)] = (lambda d=d, f=f: lab_frame(d, f))
            if d != 'u': out['chl_%s%d_o' % (d, f)] = (lambda d=d, f=f: lab_frame(d, f, True))
    return out
