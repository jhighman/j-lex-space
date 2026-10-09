# Samples

Something to work with: one track in, one take out.

| file | what it is |
|---|---|
| `Editions.mp3` | the input: a 5:25 track |
| `editions-basis.mp4` | the output: a 5:25 take of Basis playing that track, recorded by Basis itself (1280×632, H.264 and AAC) |

To try it, run `npm run dev`, open the page, and drop `Editions.mp3` on it.
Press `V` to record your own take; it saves an MP4 when the track ends.

## How the take was played

A lens every forty seconds, through all eight, with the pads in between.
Times are from the start of the track.

| time | key | what happens |
|---|---|---|
| 0:00 | `1` | Lissajous |
| 0:40 | `2` | Tide |
| 1:02 | `A` | burst |
| 1:20 | `3` | Ripple |
| 1:40 | `F` | trails on |
| 2:00 | `4` | Swarm |
| 2:18 | `D` | fold ×2 |
| 2:30 | `S` | reverse |
| 2:40 | `5` | Frost |
| 2:58 | `S` | reverse back |
| 3:20 | `6` | Kiln |
| 3:35 | `A` `A` | two bursts |
| 4:00 | `7` | Garden |
| 4:15 | `D` | fold ×3 |
| 4:30 | `D` | fold ×4 |
| 4:40 | `8` | Prism |
| 5:00 | `F` | trails off |
| 5:15 | `R` | let go of everything |

Every lens switch and pad landed on the next beat, so the times above are
when the key was pressed, not exactly when it shows.

The take is recorded at a lower bitrate than the app uses (about 1.5 Mbps
against 8) so that a five-minute film, 63 MB, fits in a repository. A take
recorded in the app will look sharper.
