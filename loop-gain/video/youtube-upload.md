# Posting Loop Gain on YouTube without losing the picture

*Written 2026-10-31. YouTube re-encodes every upload; nothing stops that.
What you control is which of its encoders the video goes through and how
much it has to throw away. These steps keep the drawn lines, the text and
the captions sharp.*

## 1. Upload the master, not the small cut

Use **`loop-gain-film-master-1440p.mp4`**: 2560×1440, 30 fps, H.264 at
10 Mb/s, AAC voice, about 1 GB, 13:54. Every mark in it is drawn at that
size, not upscaled, so its edges survive a re-encode.

Do not upload the 46 MB cut. It was made for a 50 MB limit, and YouTube
would compress its compression. Do not upload the 720p cuts either:
YouTube gives 720p and 1080p uploads from most channels its oldest
encoder at a low bitrate, which is what smears text and thin lines. At
1440p and above it uses a newer encoder (VP9 or AV1) at several times
the bitrate, and the 1080p and 720p versions it makes for viewers are
derived from that, so they look better too. This is the whole trick:
resolution is the lever, because it is the only one YouTube exposes.

Do not pass the file through iMovie, QuickTime's export, or any "share
to YouTube" button; each is one more encode. Upload the file itself.

## 2. Captions as a file, not burned in

For YouTube, use the master, which has no caption band, and upload
**`loop-gain-narration.srt`** as the subtitle track. Viewers switch it on
with the CC button, it is searchable, and it reads at any size. The
burned-in cut is for places that cannot carry a caption file.

In YouTube Studio: open the video › **Subtitles** in the left column →
the English row › **Add** › **Upload file** › *With timing* › choose the
`.srt` › **Publish**. Set the video language to English under
**Details › Show more** first, or the Subtitles page will ask for it.

## 3. The upload itself, in order

1. In YouTube Studio: **Create › Upload videos**, choose the master.
2. **Details**: the title and description. A draft description is in
   `youtube-cut.md` under "The description, draft"; the credit line goes
   in as written: *Alexandra Krížová — critical reviewer and development
   reviewer*. Add the repository URL. Under **Show more**, set language
   English, and leave *Altered or synthetic content* unticked: the voice
   is a person's, and the only synthetic element, the models, is what
   the video is about and says so.
3. **Visibility**: **Unlisted**, not Public, for now. The link works for
   anyone who has it, which is what the Phase Transition submission needs,
   and it leaves time for step 4.
4. **Wait for the HD versions.** After upload, YouTube first offers only
   360p or 480p; the 1080p and 1440p versions appear minutes to a few
   hours later, longer for a new channel. Do not share the link, and do
   not submit it, until the quality menu on the player shows **1440p**.
   Check in a private window: right-click the player › **Stats for
   nerds** › the *Codecs* line should read `vp09` or `av01`, not `avc1`.
   If it reads `avc1` after an hour, the better encoder has not been
   applied yet; wait rather than re-upload.
5. Add the subtitle file (step 2) once processing is done.
6. Switch to **Public** when you want it found, or leave it Unlisted for
   the judges and the thesis's link.

## 4. What viewers will see

YouTube auto-selects quality by their connection, so a phone on mobile
data may get 480p. Nothing to be done about that except what step 1
already does: the 480p it makes from a 1440p master is cleaner than the
480p it would make from a 720p one. The film's text is large enough to
read at 720p; the recorded page in the cut-aways is the one place small
text lives, and it is the page as it was.

## 5. If the judges' link should be the file, not YouTube

The thesis's link can point at the repository's served page for the
piece itself; the film is the video. If a platform limit forces the
small cut, that is what it is for, and the picture holds at it. Nothing
else between the master and the 46 MB cut is worth making.
