"""Spuzzworld's art: mines, levers, the lift, the exit door, sign plates and the cell bars. The characters come from
the shared sheets (Cumhead, the Lair Guards, Blumlings and the homunculus breeds)."""
from pixelkit import Grid
USE = ['ch_idle*', 'ch_walk*', 'ch_run*', 'ch_jump*', 'ch_hurt0', 'ch_death*', 'ch_icon0', 'f_blumguard_*', 'f_blumling_*', 'f_blum_0', 'f_blum_1',
       'h_gloop_teen_*', 'h_ember_teen_*', 'h_frost_teen_*', 'h_volt_teen_*', 'h_scout_teen_*', 'h_goldie_teen_*', 'h_blood_teen_*', 'h_medic_teen_*', 'h_titan_teen_*', 'h_leech_teen_*']
RED = ('#ff3a44', '#c4121c', '#6a0a10'); IRON = ('#9a929a', '#5a545c', '#2a262c'); BLACK = ('#4a3a40', '#221a1e', '#0c0608'); GOLD = ('#fff09a', '#ffc840', '#a8741a')
def mine(lit):
    g = Grid(16, 8); g.ellipse(8, 7, 7, 5, 'dome'); g.rect(0, 6, 16, 2, 'base'); g.rect(7, 1, 2, 2, 'lamp')
    return g, {'dome': IRON, 'base': BLACK, 'lamp': '#ff2630' if lit else '#5a0a10'}
def lever(on):
    import math
    g = Grid(20, 30); g.rect(3, 24, 14, 6, 'base'); a = -0.7 if not on else 0.7; x1, y1 = 10 + math.sin(a) * 18, 26 - math.cos(a) * 18
    g.line(10, 26, x1, y1, 'stick', 1); g.ellipse(x1, y1, 3, 3, 'knob'); return g, {'base': BLACK, 'stick': IRON, 'knob': RED}
def lift():
    g = Grid(40, 10); g.rect(0, 2, 40, 6, 'plat'); g.rect(0, 2, 40, 2, 'edge')
    for x in range(2, 38, 6): g.rect(x, 4, 3, 2, 'stripe')
    return g, {'plat': IRON, 'edge': GOLD, 'stripe': BLACK}
def exitdoor():
    g = Grid(48, 70); g.rect(0, 0, 48, 70, 'frame'); g.rect(6, 10, 36, 60, 'door'); g.rect(23, 10, 2, 60, 'seam')
    for y in (20, 40, 58): g.rect(6, y, 36, 3, 'band')
    g.rect(10, 1, 28, 8, 'sign'); return g, {'frame': BLACK, 'door': ('#6a5a5e', '#3e2c30', '#1e1418'), 'seam': '#12040a', 'band': IRON, 'sign': ('#7aff7a', '#2aa84a', '#0a4a1a')}
def plate():
    g = Grid(20, 14); g.rect(0, 0, 20, 14, 'p'); g.put(2, 2, 'bolt'); g.put(17, 2, 'bolt'); g.put(2, 11, 'bolt'); g.put(17, 11, 'bolt'); g.rect(5, 5, 10, 1, 'ln'); g.rect(5, 8, 8, 1, 'ln')
    return g, {'p': IRON, 'bolt': '#12040a', 'ln': '#12040a'}
def brush():
    g = Grid(10, 6); g.rect(0, 0, 10, 3, 'w'); for_x = [g.put(x, 4, 'b') for x in range(1, 10, 2)]; return g, {'w': ('#a8643a', '#6e3a1e', '#3a1a0c'), 'b': '#f1e7d0'}
ART = {'sw_mine0': lambda: mine(False), 'sw_mine1': lambda: mine(True), 'sw_lever0': lambda: lever(False), 'sw_lever1': lambda: lever(True), 'sw_lift': lift,
       'sw_exit': exitdoor, 'sw_plate': plate, 'sw_brush': brush}
