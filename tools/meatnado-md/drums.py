import numpy as np, scipy.io.wavfile as wf, scipy.signal as ss
sr, x = wf.read('perc.wav'); x = x.astype(np.float32) / 32768
BPM=210; s16=60/BPM/4; off=0.1518
n=1024; hop=128; fps=sr/hop
f,t,Z = ss.stft(x, sr, nperseg=n, noverlap=n-hop); M=np.abs(Z)
def env(lo,hi):
    b=(f>=lo)&(f<hi); e=np.log1p(30*M[b]).sum(0); d=np.maximum(0,np.diff(e,prepend=e[0])); return d
K=env(30,110); S=env(180,600)+0.5*env(1500,4000); Hh=env(7000,11000)
def grid(e):
    out=[]; k=0
    while True:
        c=off+k*s16; i0=int((c-0.02)*fps); i1=int((c+0.03)*fps)
        if i1>=len(e): break
        out.append(e[i0:i1].max()); k+=1
    a=np.array(out); return a/np.percentile(a,95)
k,s,h=grid(K),grid(S),grid(Hh)
np.save('dr.npy',np.stack([k,s,h]))
for bar in range(0,len(k)//16):
    sl=slice(bar*16,bar*16+16)
    def row(a,ch,th): return ''.join(ch if v>th else '.' for v in a[sl])
    print('%3d %6.1f  K %s  S %s  H %s'%(bar, off+bar*16*s16, row(k,'k',0.55), row(s,'s',0.55), row(h,'h',0.55)))
