"""Meatnado, Mega Drive style. Renders an instrumental chiptune cover that follows the original's tempo (210),
structure, drum part and riff roots (all read out of the original mix by ana/riff/drums scripts), played on
YM2612-style FM voices (guitar, bass, lead), SN76489-style PSG (noise hats, square arps) and 8-bit DAC drums."""
import numpy as np, scipy.io.wavfile as wf

SR = 44100
BPM = 210; S16 = 60 / BPM / 4; OFF = 0.1518
R = np.load('riff.npy'); DR = np.load('dr.npy')
EN = R[:, 1]; THR = np.percentile(EN, 20)
NBAR = 126                      # bar 126 is the last hit, then the chord rings out
END = OFF + (NBAR + 6) * 16 * S16 + 2.5
L = np.zeros(int(END * SR) + SR); Rr = np.zeros_like(L)

def mf(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, d, s, rel, gate):
    """ADSR in samples: attack a, decay d to level s, release rel after gate"""
    e = np.ones(n); t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    dd = (t >= a) & (t < gate); e[dd] = s + (1 - s) * np.exp(-(t[dd] - a) / max(d, 1e-4))
    rr = t >= gate; gv = s + (1 - s) * np.exp(-(gate - a) / max(d, 1e-4)) if gate > a else 1
    e[rr] = gv * np.exp(-(t[rr] - gate) / max(rel, 1e-4)); return e
def add(buf, t0, sig, pan=0.0, gain=1.0):
    i = int(t0 * SR); j = min(len(L), i + len(sig)); sig = sig[:j - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:j] += sig * l * 1.41; Rr[i:j] += sig * r * 1.41

# ---------------------------------------------------------------- FM voices (phase modulation, YM2612 style)
def fm_guitar(m, dur, mute, det=0.0):
    """power chord on an FM 'distortion guitar': a feedback op drives a ratio-1 and a ratio-2 modulator into the carrier"""
    n = int((dur + 0.08) * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for iv, g in ((0, 1.0), (7, 0.8), (12, 0.55)):
        f = mf(m + iv) * 2 ** (det / 1200); ph = 2 * np.pi * f * t
        fb = np.sin(ph + 1.1 * np.sin(ph))                      # feedback-ish op 1
        mod = np.sin(2 * ph + 1.4 * fb)                         # op 2 at ratio 2
        idx = 2.6 if not mute else 2.6 * (0.45 + 0.55 * np.exp(-t / 0.05))
        out += g * np.sin(ph + idx * mod)
    e = env(n, 0.002, 0.06 if mute else 0.4, 0.25 if mute else 0.7, 0.03, dur)
    return np.tanh(out * e * 1.3) * 0.5
def fm_bass(m, dur):
    n = int((dur + 0.06) * SR); t = np.arange(n) / SR; ph = 2 * np.pi * mf(m) * t
    idx = 0.9 + 2.6 * np.exp(-t / 0.05)
    s = np.sin(ph + idx * np.sin(ph + 0.6 * np.sin(ph)))
    return s * env(n, 0.002, 0.25, 0.6, 0.04, dur) * 0.55
def fm_lead(m, dur, bright=1.0):
    n = int((dur + 0.12) * SR); t = np.arange(n) / SR
    vib = np.where(t > 0.14, 0.22 * np.sin(2 * np.pi * 6.0 * (t - 0.14)) * np.minimum(1, (t - 0.14) / 0.2), 0)
    f = mf(m) * 2 ** (vib / 12); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph + bright * 1.5 * np.sin(ph + 0.8 * np.sin(ph))) + 0.35 * np.sin(2 * ph + 0.6 * np.sin(ph))
    return s * env(n, 0.006, 0.3, 0.75, 0.08, dur) * 0.32
# ---------------------------------------------------------------- PSG
def psg_sq(m, dur, vol=0.08):
    n = int((dur + 0.01) * SR); t = np.arange(n) / SR; s = np.sign(np.sin(2 * np.pi * mf(m) * t))
    return s * env(n, 0.001, 0.08, 0.6, 0.02, dur) * vol
_rng = np.random.default_rng(7)
def lfsr_noise(n, rate):
    k = int(n * rate / SR) + 2; v = _rng.choice([-1.0, 1.0], k); return np.repeat(v, int(np.ceil(SR / rate)))[:n]
def hat(open_=False):
    n = int((0.16 if open_ else 0.035) * SR); s = lfsr_noise(n, 22000); s = s - np.concatenate([[0], s[:-1]]) * 0.9
    return s * np.exp(-np.arange(n) / SR / (0.05 if open_ else 0.012)) * 0.05
def crash():
    n = int(1.4 * SR); s = lfsr_noise(n, 20000); s = s - np.concatenate([[0], s[:-1]])
    return s * np.exp(-np.arange(n) / SR / 0.45) * 0.06
# ---------------------------------------------------------------- DAC drums: 8-bit samples at ~13 kHz, like the Mega Drive's PCM channel
def crunch(s, rate=13000):
    step = SR / rate; idx = (np.floor(np.arange(len(s)) / step) * step).astype(int); s = s[np.minimum(idx, len(s) - 1)]
    return np.round(s * 127) / 127
def kick():
    n = int(0.16 * SR); t = np.arange(n) / SR; f = 45 + 130 * np.exp(-t / 0.025); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.07); s[:60] += np.linspace(0.8, 0, 60); return crunch(np.clip(s * 1.2, -1, 1)) * 0.55
def snare():
    n = int(0.17 * SR); t = np.arange(n) / SR
    s = 0.6 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03) + _rng.uniform(-1, 1, n) * np.exp(-t / 0.06) * 0.8
    return crunch(np.clip(s, -1, 1)) * 0.42
KICK, SNARE = kick(), snare()

# ---------------------------------------------------------------- the score
def bar_t(b, s=0): return OFF + (b * 16 + s) * S16
SECT = [('intro', 0, 8), ('A', 8, 39), ('stop', 39, 40), ('B', 40, 56), ('C', 56, 62), ('D', 62, 88), ('E', 88, 102), ('A2', 102, 126)]
def sect(b):
    for nm, b0, b1 in SECT:
        if b0 <= b < b1: return nm
    return 'end'
# riff note per eighth: what was heard, filtered to the riff's own notes; gaps are rests
def riffnote(k, hold=True):
    if k >= len(R): return None
    if EN[k] < THR:
        b = k // 8
        if not hold or sect(b) in ('intro', 'stop', 'end'): return None
        j = k - 1
        while j >= 0 and EN[j] < THR: j -= 1   # a dropout in a busy section: keep chugging the last note
        if j < 0: return None
        k = j
    m = int(R[k, 0])
    while m < 40: m += 12
    while m > 51: m -= 12
    return m
kick_on = DR[0] > 0.55; snare_on = DR[1] > 0.55; hat_on = DR[2] > 0.6

# guitars (hard left and right, slightly detuned, like two tracked guitars) and the bass
for b in range(NBAR):
    nm = sect(b)
    for s in range(0, 16, 2):
        k = b * 8 + s // 2; m = riffnote(k)
        if m is None: continue
        g = b * 16 + s
        # chug on every kick sixteenth, otherwise let the note ring for the eighth (and tie repeats)
        hits = [h for h in (0, 1) if g + h < len(kick_on) and kick_on[g + h]] or [0]
        if nm == 'A2' or nm == 'A':
            hits = [0, 1] if (g < len(kick_on) and kick_on[g:g + 2].sum() >= 1) else [0]   # tremolo through the blasts
        for h in hits:
            dur = S16 * (0.9 if len(hits) > 1 else 1.8)
            mute = len(hits) > 1 or nm in ('E', 'C')
            t0 = OFF + (g + h) * S16
            add(L, t0, fm_guitar(m, dur, mute, -6), pan=-0.85, gain=0.55)
            add(L, t0 + 0.004, fm_guitar(m, dur, mute, +6), pan=0.85, gain=0.55)
        add(L, OFF + g * S16, fm_bass(m - 12, S16 * 1.8), pan=0, gain=0.9)

# the closing chord: A# power chord ringing out over six bars
for i in range(6):
    t0 = bar_t(NBAR + i)
    for side in (-0.85, 0.85):
        add(L, t0, fm_guitar(46, 16 * S16 * 0.98, False, 6 * side), pan=side, gain=0.5 * (1 - i / 7))
add(L, bar_t(NBAR), fm_bass(34, 16 * S16 * 4), gain=0.8)

# drums: the original's own kick, snare and hat hits, on DAC samples and PSG noise
for g in range(min(len(kick_on), (NBAR + 1) * 16)):
    t0 = OFF + g * S16
    if kick_on[g]: add(L, t0, KICK, gain=1.0)
    if snare_on[g]: add(L, t0, SNARE, gain=1.0)
    if hat_on[g] and not snare_on[g]: add(L, t0, hat(), pan=0.3, gain=1.0)
for nm, b0, b1 in SECT: add(L, bar_t(b0), crash(), pan=-0.3)
add(L, bar_t(NBAR), crash(), pan=0.3); add(L, bar_t(NBAR), KICK); add(L, bar_t(NBAR), SNARE)

# lead: the Mega Drive voice the vocals would have had. It follows the riff two octaves up, a beat at a time,
# and in the big groove (D) it plays a harmonised hook; in the blasts (A2) it tremolo picks.
def lead_line(b0, b1, mode):
    for b in range(b0, b1):
        for beat in range(4):
            k = b * 8 + beat * 2; m = riffnote(k)
            if m is None: continue
            t0 = bar_t(b, beat * 4)
            if mode == 'beat':
                add(L, t0, fm_lead(m + 24, S16 * 3.6), pan=0.1, gain=0.9)
            elif mode == 'harm':
                add(L, t0, fm_lead(m + 24, S16 * 3.6), pan=-0.15, gain=0.8); add(L, t0, fm_lead(m + 27, S16 * 3.6, 0.7), pan=0.15, gain=0.55)
            elif mode == 'trem':
                for q in range(4): add(L, t0 + q * S16, fm_lead(m + 24, S16 * 0.85, 1.2), pan=0, gain=0.6)
lead_line(0, 8, 'beat'); lead_line(16, 39, 'beat'); lead_line(44, 56, 'beat'); lead_line(62, 88, 'harm'); lead_line(110, 126, 'trem')
# the breakdown gets a cold PSG arpeggio instead: root, flat second, fifth
for b in range(88, 102):
    for s in range(16):
        m = riffnote(b * 8 + s // 2) or 40
        add(L, bar_t(b, s), psg_sq(m + 24 + [0, 1, 7, 12][s % 4], S16 * 0.8, 0.05), pan=-0.4)

# ---------------------------------------------------------------- mix down: the console's low-pass and a little grit
mix = np.stack([L, Rr], 1)
a = np.exp(-2 * np.pi * 9000 / SR)
for c in range(2):
    y = np.zeros(len(mix)); acc = 0.0; x = mix[:, c]
    # one-pole low-pass, vectorised with scipy
    import scipy.signal as ss
    mix[:, c] = ss.lfilter([1 - a], [1, -a], x)
mix = np.tanh(mix * 0.9)
mix = mix / np.sqrt(np.mean(mix ** 2)) * 0.16
mix = np.clip(mix, -0.95, 0.95)
mix = np.round(mix * 2048) / 2048       # the YM2612's coarse DAC
wf.write('meatnado_md.wav', SR, (mix * 32767).astype(np.int16))
print('rendered', len(mix) / SR, 's')
