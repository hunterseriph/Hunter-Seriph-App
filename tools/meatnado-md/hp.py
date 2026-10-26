import numpy as np, scipy.io.wavfile as wf, scipy.signal as ss, scipy.ndimage as nd
sr, x = wf.read('m.wav'); x = x.astype(np.float32) / 32768
n=4096; hop=512
f,t,Z = ss.stft(x, sr, nperseg=n, noverlap=n-hop)
M=np.abs(Z)
H=nd.median_filter(M,(1,17)); P=nd.median_filter(M,(17,1))
mask=H**2/(H**2+P**2+1e-9)
_,xh=ss.istft(Z*mask, sr, nperseg=n, noverlap=n-hop)
_,xp=ss.istft(Z*(1-mask), sr, nperseg=n, noverlap=n-hop)
wf.write('harm.wav', sr, (xh/np.abs(xh).max()*30000).astype(np.int16))
wf.write('perc.wav', sr, (xp/np.abs(xp).max()*30000).astype(np.int16))
print('ok')
