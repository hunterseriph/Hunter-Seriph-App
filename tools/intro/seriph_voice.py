"""SEERIIIPH, sung to his spec (update 188): like the SEGA call at the start of Sonic 1 on the Mega Drive.
0.00-0.70 s SEEEEE held (update 189: two semitones under F4), 0.70-1.25 s RIIIIIPH a little higher with a long IIIII, hard stop.
One adult male announcer voice (Piper libritts speaker 201), re-timed and re-pitched note for note by psola.py,
then made to sound like an early-90s console sample (bright, a little nasal, squashed, low sample rate)."""
import os, subprocess, tempfile, numpy as np
import psola
PIPER = '/home/claude/piper-dl'; SPEAKER = 201
F4, AS4 = 349.23, 466.16


def segments(x, sr):
    tr = psola.f0_track(x, sr); v = np.where(tr[:, 1] > 0)[0]; t = tr[:, 0] / sr
    v0, v1 = v[0], v[-1]
    E = tr[:, 2]; a, b = v0 + int((v1 - v0) * 0.12), v0 + int((v1 - v0) * 0.7); Es = np.convolve(E, np.ones(5) / 5, 'same')
    r = a + int(np.argmin(Es[a:b]))  # the R: the dip in loudness between the two EEs
    after = np.where(E[v1:] > E.max() * 0.002)[0]; fend = t[v1 + after[-1]] if len(after) else t[v1] + 0.08
    s0 = t[np.where(E > E.max() * 0.002)[0][0]]
    a0, a1 = t[v0], t[r] - 0.025; m = (a0 + a1) / 2  # the middle of the first EE: the long hold is sung from there
    return [max(0, s0 - 0.005), a0, m - 0.003, m + 0.003, a1, t[r] + 0.03, t[v1], fend]


def make(out_wav, hold=-9, step=-4):
    """update 189 (his revision): SEEEEE 0.00-0.70 s, then RIIIIIPH 0.70-1.25 s with a long, strong IIIII (like the
    GAAAA, it carries energy), a hard stop right after the PH. Two semitones lower than before (a deeper, natural adult
    male), and a small, confident rise (+2.5 semitones) instead of a sung jump. The RIIIIPH keeps the speaker's own
    rise and fall of the voice around that pitch, so it is said with energy, not sung as a flat note."""
    tmp = tempfile.mkdtemp(); raw = os.path.join(tmp, 'raw.wav')
    subprocess.run([os.path.join(PIPER, 'piper', 'piper'), '--model', os.path.join(PIPER, 'v', 'en-us-libritts-high.onnx'), '--speaker', str(SPEAKER), '--length_scale', '1.0', '--noise_scale', '0', '--noise_w', '0', '--output_file', raw], input=b'See-reef!', check=True, capture_output=True)
    x, sr = psola.load(raw); seg_in = segments(x, sr)
    seg_out = [0.0, 0.07, 0.11, 0.67, 0.70, 0.75, 1.15, 1.25]  # S | EE onset | EEEE held | EE into R | R | IIIII (long) | PH
    HOLD = F4 * 2 ** (hold / 12); TOP = HOLD * 2 ** (step / 12)  # update 191: SEE on G#3 (he picked the -9 one), then RIIIPH DOWN a major third, ding-dong, like SEE-GA
    tr = psola.smooth_f0(psola.f0_track(x, sr)); tt = tr[:, 0] / sr; ff = tr[:, 1]; vv = ff > 0
    def own(t):  # the speaker's own pitch at the matching moment, against his average over the RIIII
        ti = np.interp(t, seg_out, seg_in); return np.interp(ti, tt[vv], ff[vv])
    ref2 = np.median([own(t) for t in np.arange(0.75, 1.15, 0.01)])
    def f0(t):
        if t < 0.11: return HOLD * 2 ** ((-1.0 * (1 - (t - 0.07) / 0.04)) / 12)  # a quick scoop up into the note
        if t < 0.67:
            vib = 0.12 * np.sin(2 * np.pi * 5.4 * (t - 0.3)) * min(1, max(0, (t - 0.3) / 0.2))
            return HOLD * 2 ** (vib / 12)
        if t < 0.75: k = (t - 0.67) / 0.08; k = k * k * (3 - 2 * k); return HOLD * (TOP / HOLD) ** k  # down through the R to the second note
        nat = (own(t) / ref2) ** 0.6  # his own lift and fall, a little calmer
        fall = 2 ** (-1.2 * max(0, (t - 0.95) / 0.2) / 12)  # and it comes down a touch at the end, like a call does
        return TOP * nat * fall
    def gain(t):
        if t < 0.70: return 0.85
        if t < 0.76: return 1.0 + 0.15 * max(0, 1 - (t - 0.70) / 0.06)  # the R lands with a push
        return 1.0 if t < 1.15 else 1.25  # the PH clear and loud
    def voiced(t): return 0.07 <= t < 1.15
    y, tr2, M = psola.sing(x, sr, seg_in, seg_out, f0, gain, voiced)
    def rms(a, b): q = y[int(a * sr):int(b * sr)]; return np.sqrt(np.mean(q ** 2)) + 1e-9
    k = min(3.0, rms(0.15, 0.62) / 0.85 / rms(0.8, 1.1))  # RIIIIPH is the payoff: 100% against SEEEE's 85%
    t = np.arange(len(y)) / sr; y *= 1 + (k - 1) * np.clip((t - 0.68) / 0.04, 0, 1)
    n = int(0.004 * sr); y[-n:] *= np.linspace(1, 0, n)  # stops dead after the PH
    psola.save(out_wav, y / (np.abs(y).max() + 1e-9) * 0.9, sr)
    return seg_in


if __name__ == '__main__':
    import sys; print(make(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sung.wav'))
