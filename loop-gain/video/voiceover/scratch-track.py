import re, subprocess, wave, struct, sys, os
SRC=__import__('os').path.join(__import__('os').path.dirname(__file__),'..','reading-script.md')
VOICE=sys.argv[1] if len(sys.argv)>1 else 'Samantha'
TOTAL=690.0; SR=22050
text=open(SRC).read()
paras=re.findall(r'^\*\*\[(\d+):(\d\d)\]\*\*\s+(.*)$',text,re.M)
def clean(s):
    s=re.sub(r'\*([^*]+)\*',r'\1',s)           # emphasis
    s=s.replace('‑',' ').replace('R‑nought','R nought').replace('R-nought','R nought').replace('R0','R nought')
    s=s.replace('σ','sigma').replace('Hz','hertz').replace('Chladni','Kladnee').replace('Wegner','Vegner')
    s=s.replace('“','"').replace('”','"').replace('’',"'").replace('`','')
    return s
def dur(path):
    with wave.open(path) as w: return w.getnframes()/w.getframerate()
clips=[]
for i,(m,s,p) in enumerate(paras):
    t=int(m)*60+int(s); nxt=(int(paras[i+1][0])*60+int(paras[i+1][1])) if i+1<len(paras) else TOTAL-15
    slot=nxt-t-0.5
    txt=clean(p); rate=165
    while True:
        f=f'p{i:02d}.wav'
        subprocess.run(['say','-v',VOICE,'-r',str(rate),'--file-format=WAVE',f'--data-format=LEI16@{SR}','-o',f,txt],check=True)
        d=dur(f)
        if d<=slot or rate>=200: break
        rate+=10
    clips.append((t,f,d,slot,rate))
# place clips, letting one spill push the next
out=bytearray(b'\x00\x00'*int(TOTAL*SR)); cursor=0.0; log=[]
for t,f,d,slot,rate in clips:
    start=max(t,cursor+0.35)
    with wave.open(f) as w: data=w.readframes(w.getnframes())
    off=int(start*SR)*2
    out[off:off+len(data)]=data
    cursor=start+d
    log.append(f'{int(t//60)}:{int(t%60):02d} start {start:6.1f} len {d:5.1f} slot {slot:5.1f} rate {rate}{"  LATE %.1f"%(start-t) if start-t>0.5 else ""}{"  SPILL %.1f"%(d-slot) if d>slot else ""}')
with wave.open('track.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(out))
print('\n'.join(log)); print('clips',len(clips),'track',dur('track.wav'))
