# Voiceover tools

Two scripts, no ffmpeg. Both run with a Python that has PyObjC, which on
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

`mux.py <video.mp4> <audio.m4a> <out.mp4>` lays an audio file onto the
silent film with AVFoundation, passthrough, so the picture is not
re-encoded. Convert a WAV first with `afconvert -f m4af -d aac in.wav
out.m4a`. The same command takes the real recording, once it exists,
exported as M4A or AAC at the film's length.

The scratch voiceover made on 2026-10-28 is `loop-gain-film-scratch-
voiceover.mp4`, kept out of the repository with the other takes. Its
worst drift against the cue sheet is five seconds, in the proofs scene,
where the "twenty-one theorems" paragraph does not fit its slot even at
205 words a minute.
