"""Closed captions for the film: the reading script's words, timed by Whisper's word timestamps on the
narration track.  python3 captions.py <whisper-words.json> <reading-script.md> <outdir>
Writes narration.srt, narration.vtt and subtitles.json (the film's burned-in mode reads the last).
The script is the authority on the words; Whisper supplies only when each was said. The two are aligned
with difflib on normalised tokens; a script word Whisper missed takes its time from its neighbours."""
import sys, json, re, difflib
words_path, script_path, out = sys.argv[1:4]
W = json.load(open(words_path))
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('’', "'"))
# the script's narration paragraphs, in order, as tokens that keep their punctuation
text = open(script_path).read()
paras = re.findall(r'^\*\*\[(\d+:\d\d)\]\*\*\s+(.*)$', text, re.M)
toks = []
for i, (tc, p) in enumerate(paras):
    p = re.sub(r'\*([^*]+)\*', r'\1', p).replace('`', '')
    for t in p.split(): toks.append({'t': t, 'para': i})
A = [norm(t['t']) for t in toks]; B = [norm(w['w']) for w in W]
sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
for a0, a1, b0, b1 in [(m.a, m.a + m.size, m.b, m.b + m.size) for m in sm.get_matching_blocks()]:
    for k in range(a1 - a0): toks[a0 + k]['s'] = W[b0 + k]['s']; toks[a0 + k]['e'] = W[b0 + k]['e']
matched = sum(1 for t in toks if 's' in t)
# fill gaps by interpolation between the nearest timed neighbours
n = len(toks); i = 0
while i < n:
    if 's' in toks[i]: i += 1; continue
    j = i
    while j < n and 's' not in toks[j]: j += 1
    s0 = toks[i - 1]['e'] if i > 0 else 0.0; e1 = toks[j]['s'] if j < n else s0 + 0.4 * (j - i)
    for k in range(i, j): f0 = (k - i) / (j - i); f1 = (k - i + 1) / (j - i); toks[k]['s'] = s0 + (e1 - s0) * f0; toks[k]['e'] = s0 + (e1 - s0) * f1
    i = j
# cues: up to two lines of ~40 characters, broken at sentence ends when near, never across a paragraph, 1–6 s
MAXC = 40; cues = []; cur = []
def flush():
    global cur
    if not cur: return
    s = cur[0]['s']; e = max(cur[-1]['e'], s + 1.0); txt = ' '.join(t['t'] for t in cur)
    # wrap into two balanced lines
    if len(txt) > MAXC:
        ws = txt.split(); best = None
        for k in range(1, len(ws)):
            l1, l2 = ' '.join(ws[:k]), ' '.join(ws[k:]); score = abs(len(l1) - len(l2)) + (0 if l1[-1] in ',.;:' else 6)
            if max(len(l1), len(l2)) <= MAXC + 6 and (best is None or score < best[0]): best = (score, l1 + '\n' + l2)
        if best: txt = best[1]
    cues.append({'s': round(s, 2), 'e': round(e, 2), 'text': txt}); cur = []
for k, t in enumerate(toks):
    if cur and (t['para'] != cur[0]['para'] or t['s'] - cur[-1]['e'] > 1.2): flush()
    cur.append(t)
    length = len(' '.join(x['t'] for x in cur)); dur = t['e'] - cur[0]['s']
    ends = t['t'][-1] in '.?!'
    if (ends and length > MAXC) or length >= 2 * MAXC - 6 or dur > 6.0 or (ends and dur > 3.5):
        # when the break is forced mid-sentence, step back to the last comma or clause mark if it leaves a fair share on each side
        if not ends and len(cur) >= 6:
            cut = max((i for i in range(2, len(cur) - 2) if cur[i]['t'][-1] in ',;:'), default=None)
            if cut is not None and cut >= len(cur) // 3:
                rest = cur[cut + 1:]; cur = cur[:cut + 1]; flush(); cur = rest; continue
        flush()
flush()
for a, b in zip(cues, cues[1:]):   # a cue ends before the next begins
    if a['e'] > b['s'] - 0.05: a['e'] = round(max(a['s'] + 0.6, b['s'] - 0.05), 2)
def ts(x, sep): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s % 1) * 1000)):03d}'
with open(f'{out}/narration.srt', 'w') as f:
    for i, c in enumerate(cues, 1): f.write(f"{i}\n{ts(c['s'], ',')} --> {ts(c['e'], ',')}\n{c['text']}\n\n")
with open(f'{out}/narration.vtt', 'w') as f:
    f.write('WEBVTT\n\n')
    for i, c in enumerate(cues, 1): f.write(f"{i}\n{ts(c['s'], '.')} --> {ts(c['e'], '.')}\n{c['text']}\n\n")
json.dump(cues, open(f'{out}/subtitles.json', 'w'), indent=0)
print(f'{len(toks)} script words, {matched} timed by Whisper directly, {len(cues)} cues, {min(c["e"]-c["s"] for c in cues):.1f}–{max(c["e"]-c["s"] for c in cues):.1f} s each')
