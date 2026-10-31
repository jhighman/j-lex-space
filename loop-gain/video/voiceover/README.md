# Voiceover tools

Three scripts, no ffmpeg. Both run with a Python that has PyObjC, which on
this machine is the Whisper venv (`~/.venvs/whisper/bin/python`); the
first needs only the system `say`.

`scratch-track.py [voice]` reads `../reading-script.md`, speaks each
paragraph with the Mac's built-in voice (Samantha by default) at 165
words a minute, speeds a paragraph up to 205 if it will not fit before
the next timecode, lets a paragraph that still spills push the next one
later, and writes `track.wav`, 690 s, mono, 22.05 kHz, with each clip at
its timecode. It prints a line per paragraph with the start, length,
slot and any lateness. This is a scratch track for checking timing and
feel against the picture; the narration is to be recorded by a person.

`lay-scenes.py <dir with 0.wav … 10.wav> <outdir>` takes the recorded
scenes, one 48 kHz mono WAV per scene of `script.md`, trims each lead-in
to a sixth of a second, levels them to a common loudness under a peak
ceiling, and writes `timing.json` (each scene's original window and its
new one: the recording's length plus a breath) and `narration.wav` with
every scene at its new start. Copy the timing file beside `film.js`,
render, then mux. The levelling is the only processing; no compression,
no noise reduction.

`mux.py <video.mp4> <audio.m4a> <out.mp4>` lays an audio file onto the
silent film with AVFoundation, passthrough, so the picture is not
re-encoded. Convert a WAV first with `afconvert -f m4af -d aac in.wav
out.m4a`. The same command takes the real recording, once it exists,
exported as M4A or AAC at the film's length.

On 2026-10-31 the eleven scenes were recorded and laid in this way; the
result, `loop-gain-film-narrated.mp4`, is kept with the other takes.

The scratch voiceover made on 2026-10-28 is `loop-gain-film-scratch-
voiceover.mp4`, kept out of the repository with the other takes. Its
worst drift against the cue sheet is five seconds, in the proofs scene,
where the "twenty-one theorems" paragraph does not fit its slot even at
205 words a minute.
