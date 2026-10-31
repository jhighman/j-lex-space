"""Lay eleven scene recordings (0.wav .. 10.wav) onto the film's timeline.
Writes timing.json beside film.js (original scene windows -> new windows, so the
film stretches each scene to its recording), narration.wav (48 kHz mono, levelled),
and prints the new scene table.   python3 lay-scenes.py <dir with N.wav> <outdir>"""
import sys, os, json, wave, array, math
src, out = sys.argv[1], sys.argv[2]
ORIG = [(0,30),(30,85),(85,150),(150,215),(215,270),(270,360),(360,430),(430,510),(510,555),(555,605),(605,675)]
CREDITS = 15; LEAD_IN = 2.0; TAIL = 1.6; SR = 48000
OPEN, CLOSE = 5, 12   # film.js's bookends: the opening card before the black, the closing card before the credits
TARGET_RMS = 0.06; PEAK = 0.94
def load(i):
    with wave.open(os.path.join(src, f'{i}.wav')) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2, 'expects 48 kHz mono 16-bit'
        a = array.array('h'); a.frombytes(w.readframes(w.getnframes()))
    return a
def trim_lead(a, thr=300, keep=0.15):
    win = int(SR*0.02)
    for j in range(0, len(a), win):
        seg = a[j:j+win]
        if math.sqrt(sum(x*x for x in seg)/len(seg)) > thr: return a[max(0, j - int(SR*keep)):]
    return a
def level(a):
    step = 10; rms = math.sqrt(sum(a[j]*a[j] for j in range(0, len(a), step)) / (len(a)/step)) / 32768
    peak = max(abs(x) for x in a[::5]) / 32768
    g = min(TARGET_RMS / max(rms, 1e-6), PEAK / max(peak, 1e-6))
    return array.array('h', (max(-32768, min(32767, int(x*g))) for x in a)), g, rms
scenes = []; cursor = 0.0; clips = []
for i, (o0, o1) in enumerate(ORIG):
    a = trim_lead(load(i)); a, g, rms = level(a); d = len(a) / SR
    start = cursor + (LEAD_IN if i == 0 else 0.0)   # scene 0 speaks over the loop after two seconds of black
    n0 = cursor; n1 = start + d + TAIL
    scenes.append({'scene': i, 'orig': [o0, o1], 'new': [round(n0, 2), round(n1, 2)], 'speech_at': round(start, 2), 'speech_len': round(d, 2), 'gain_db': round(20*math.log10(g), 1)})
    clips.append((start, a)); cursor = n1
total = cursor + CREDITS
timing = {'scenes': scenes, 'credits': [round(cursor, 2), round(total, 2)], 'total': round(total, 2), 'orig_total': 690, 'bookends': {'open': OPEN, 'close': CLOSE, 'note': 'scene and credit times above are before the bookends; film.js adds open to every shot and close to the credits'}}
json.dump(timing, open(os.path.join(out, 'timing.json'), 'w'), indent=1)
track = array.array('h', bytes(2 * int(math.ceil((total + OPEN + CLOSE) * SR))))
for start, a in clips:
    o = int((start + OPEN) * SR); track[o:o+len(a)] = a   # the narration starts after the opening card
with wave.open(os.path.join(out, 'narration.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(track.tobytes())
for s in scenes: print(f"scene {s['scene']:2d}  {s['orig'][0]:4d}-{s['orig'][1]:<4d} -> {s['new'][0]:6.1f}-{s['new'][1]:<6.1f}  speech {s['speech_len']:5.1f}s  gain {s['gain_db']:+5.1f} dB")
T = total + OPEN + CLOSE
print('credits', timing['credits'], 'film with bookends', round(T, 2), f'({int(T//60)}:{int(T%60):02d}); narration offset by', OPEN, 's')
