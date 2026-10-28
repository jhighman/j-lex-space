import sys, time
from Foundation import NSURL
import AVFoundation as AV
from CoreMedia import CMTimeRangeMake, kCMTimeZero
video, audio, out = sys.argv[1:4]
v = AV.AVURLAsset.URLAssetWithURL_options_(NSURL.fileURLWithPath_(video), None)
a = AV.AVURLAsset.URLAssetWithURL_options_(NSURL.fileURLWithPath_(audio), None)
comp = AV.AVMutableComposition.composition()
vt = comp.addMutableTrackWithMediaType_preferredTrackID_(AV.AVMediaTypeVideo, 0)
at = comp.addMutableTrackWithMediaType_preferredTrackID_(AV.AVMediaTypeAudio, 0)
vsrc = v.tracksWithMediaType_(AV.AVMediaTypeVideo)[0]
asrc = a.tracksWithMediaType_(AV.AVMediaTypeAudio)[0]
ok, err = vt.insertTimeRange_ofTrack_atTime_error_(CMTimeRangeMake(kCMTimeZero, v.duration()), vsrc, kCMTimeZero, None)
assert ok, err
ok, err = at.insertTimeRange_ofTrack_atTime_error_(CMTimeRangeMake(kCMTimeZero, a.duration()), asrc, kCMTimeZero, None)
assert ok, err
ex = AV.AVAssetExportSession.exportSessionWithAsset_presetName_(comp, AV.AVAssetExportPresetPassthrough)
ex.setOutputURL_(NSURL.fileURLWithPath_(out)); ex.setOutputFileType_(AV.AVFileTypeMPEG4)
done = {'d': False}
ex.exportAsynchronouslyWithCompletionHandler_(lambda: done.__setitem__('d', True))
while not done['d']: time.sleep(0.5)
print('status', ex.status(), 'error', ex.error())
