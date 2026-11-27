#!/usr/bin/env python3
"""Spermabonk: Spermaid Survivors (www/games/spermaid-survivors.html) with the 3D parts on top.
Run from this folder:  node bake.js  (only when models change)  then  python3 build.py"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'www', 'games', 'spermaid-survivors.html')
OUT = os.path.join(ROOT, 'www', 'games', 'spermabonk.html')
s = open(SRC, encoding='utf-8').read()

def sub(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit('expected %d of %r, found %d' % (count, old[:60], n))
    s = s.replace(old, new)

sub('<title>Spermaid Survivors</title>', '<title>Spermabonk</title>')
sub("KIT.load('ss-save', null)", "KIT.load('sb-save', null)")
sub("KIT.save('ss-save', SV)", "KIT.save('sb-save', SV)")
sub("logo: '../assets/surv-logo.webp', title: 'Spermaid Survivors'", "logo: bonkLogo(), title: 'Spermabonk'")
sub("<b>Aim</b> (optional): right stick. On a phone: the d-pad on the left, A and B on the right.", "<b>Turn the camera</b>: right stick, Q / E, LB / RB, or drag the picture (on a phone, drag the right side of the screen). Left on the stick always goes left on the screen. On a phone: the d-pad on the left, A and B on the right.")
sub("<b>A</b> (Z / Space): Tidal Wave when the bar is full, it fills with kills. <b>B</b> (X): a quick dash you cannot be hit in.</p>", "<b>A</b> (Z): Tidal Wave when the bar is full, it fills with kills. <b>B</b> (X): a quick dash you cannot be hit in. <b>Jump</b> (Space, C, the X button on a controller): over foes that walk, burning ground and rolling pins, and up onto ledges.</p>")
sub("KeyZ: 'a', Space: 'a',", "KeyZ: 'a', Space: 'x',")
sub("pad: { btns: [{ k: 'b', label: 'B', sub: 'DASH' }, { k: 'a', label: 'A', sub: 'WAVE', cls: 'gold' }] } });", "pad: { btns: [{ k: 'b', label: 'B', sub: 'DASH' }, { k: 'a', label: 'A', sub: 'WAVE', cls: 'gold' }, { k: 'x', label: 'X', sub: 'JUMP', cls: 'big' }] } });")
sub("    KIT.resItem(function () { optionsMenu(from); }),\n", "    KIT.resItem(function () { optionsMenu(from); }),\n    BONK.resItem(function () { optionsMenu(from); }),\n")
# drops: only what you pick up is banked, and a broken number can never be spent as if it were endless
sub("var g = Math.round(run.gold); SV.gold += g; SV.total += g;", "var g = Math.round(run.gold); if (!isFinite(g) || g < 0) g = 0; if (!isFinite(SV.gold)) SV.gold = 0; if (!isFinite(SV.total)) SV.total = 0; SV.gold += g; SV.total += g;")
sub("if (SV.opt.nums === undefined) SV.opt.nums = 1;", "if (!isFinite(SV.gold) || SV.gold < 0) SV.gold = 0; if (!isFinite(SV.spent) || SV.spent < 0) SV.spent = 0; if (SV.opt.nums === undefined) SV.opt.nums = 1;")
sub("yes: function () { if (SV.gold < cost) return;", "yes: function () { if (!(SV.gold >= cost)) return;")
# the loop starts once the 3D parts are in (they replace draw, and the title needs the logo)
sub('KIT.start({ w: W, h: H, flex: 800, autoS: 2, update: function (dt) { update(dt); }, draw: draw,', 'function bonkGo() { KIT.start({ w: W, h: H, flex: 800, autoS: 2, update: function (dt) { update(dt); }, draw: function () { draw(); },')
m = re.search(r"\} \}\); // a fixed d-pad on the left[^\n]*\ntitleMenu\(\);\n", s)
if not m:
    sys.exit('no start block end')
s = s[:m.end() - len('titleMenu();\n')] + 'titleMenu(); }\n' + s[m.end():]
# the 3D parts
parts = ['models.js', '0-gl.js', '2-world.js', '3-play.js']
js = ''.join('<script>\n' + open(os.path.join(HERE, p), encoding='utf-8').read() + '\n</script>\n' for p in parts)
js += '<script>bonkGo();</script>\n'
sub('</body>', js + '</body>')
open(OUT, 'w', encoding='utf-8').write(s)
print(OUT, len(s.encode('utf-8')))
