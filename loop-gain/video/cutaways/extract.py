"""Pull frame sequences from a screen recording for the film's cut-aways, as JPEGs, via AVFoundation.
   python extract.py <recording.mp4> <outdir>
Writes <outdir>/<segment>/fNNNN.jpg and <outdir>/cutaways.json. Segments are named here, with the
recording's own seconds; the film reads the manifest. Frames stay out of the repository; the recording
they come from is committed beside the playtest notes, so this regenerates them."""
import sys, os, json
import AVFoundation as AV, Quartz, Foundation
from CoreMedia import CMTimeMakeWithSeconds
src, out = sys.argv[1], sys.argv[2]
FPS = 10; MAXW = 1152
SEGMENTS = {  # name: (start, end) in the recording's seconds
  'session': (18.0, 40.0),   # Kate's moves falling onto the line, the band rising; after the shock at 0:14, before her hands come off
  'report':  (135.5, 152.5), # the decay report's replay, from whole to the end of the session
}
asset = AV.AVURLAsset.URLAssetWithURL_options_(Foundation.NSURL.fileURLWithPath_(src), None)
gen = AV.AVAssetImageGenerator.assetImageGeneratorWithAsset_(asset)
gen.setAppliesPreferredTrackTransform_(True); gen.setMaximumSize_(Quartz.CGSizeMake(MAXW, MAXW))
gen.setRequestedTimeToleranceBefore_(CMTimeMakeWithSeconds(0.02, 600)); gen.setRequestedTimeToleranceAfter_(CMTimeMakeWithSeconds(0.02, 600))
manifest = {'fps': FPS, 'source': os.path.basename(src), 'segments': {}}
for name, (a, b) in SEGMENTS.items():
    d = os.path.join(out, name); os.makedirs(d, exist_ok=True); n = int(round((b - a) * FPS)); w = h = 0
    for i in range(n):
        t = a + i / FPS
        img, err = gen.copyCGImageAtTime_actualTime_error_(CMTimeMakeWithSeconds(t, 600), None, None)
        if img is None: print('miss at', t, err); continue
        w, h = Quartz.CGImageGetWidth(img), Quartz.CGImageGetHeight(img)
        url = Foundation.NSURL.fileURLWithPath_(os.path.join(d, f'f{i:04d}.jpg'))
        dest = Quartz.CGImageDestinationCreateWithURL(url, 'public.jpeg', 1, None)
        Quartz.CGImageDestinationAddImage(dest, img, {Quartz.kCGImageDestinationLossyCompressionQuality: 0.82}); Quartz.CGImageDestinationFinalize(dest)
    manifest['segments'][name] = {'start': a, 'end': b, 'frames': n, 'width': w, 'height': h}
    print(name, n, 'frames', f'{w}x{h}')
json.dump(manifest, open(os.path.join(out, 'cutaways.json'), 'w'), indent=1)
