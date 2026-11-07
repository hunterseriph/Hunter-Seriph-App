"""Psycho Nightmare's sprites: the game is 3D, so the sheet only holds the bits the menus and the HUD show (TB, Cumhead,
TB's shop front for the way out, the Silly Pill from Meatnado). Everything in the basement is painted in 1-tex.js."""
import art as _A
USE = ['npc_tb', 'fac_tb', 'ch_idle0', 'cumface']
ART = {}
_mn = _A.extra('meatnado')[0]
for k in ('mn_pill', 'mn_drop'):
    if k in _mn: ART[k] = (lambda im=_mn[k]: im)
