import numpy as np, scipy.io.wavfile as wf
sr, x = wf.read('harm.wav'); x = x.astype(np.float32) / 32768
BPM=210; e8=60/BPM/2; off=0.1518
NN=['c','c#','d','d#','e','f','f#','g','g#','a','a#','b']
N=32768; fr=np.fft.rfftfreq(N,1/sr); df=fr[1]
def sal(sp, m, H=6):
    f0=440*2**((m-69)/12); s=0
    for h in range(1,H+1):
        i=int(round(f0*h/df)); s+=sp[i-2:i+3].max()*(0.85**(h-1))
    return s
rows=[]
nb=int((len(x)/sr-off)/e8)
for k in range(nb):
    c=off+k*e8+e8/2; a=int((c-0.11)*sr); seg=x[max(0,a):a+int(0.22*sr)]
    sp=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),N))
    s=np.array([sal(sp,m) for m in range(28,62)])
    # prefer the lowest note whose salience is near the max (octave errors)
    mx=s.max(); cand=[i for i in range(len(s)) if s[i]>0.6*mx]
    m=28+cand[0]; rows.append((m, mx))
np.save('riff.npy',np.array(rows))
en=np.array([r[1] for r in rows]); thr=np.percentile(en,20)
for b in range(0,nb,8):
    print('%3d %6.1f  '%(b//8, off+b*e8)+' '.join(('%-4s'%(NN[r[0]%12]+str(r[0]//12-1)) if r[1]>thr else ' .  ') for r in rows[b:b+8]))
