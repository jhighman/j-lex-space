/* Decoding a whole file, for the analysis. The browser decodes; the
   channels are averaged to mono, since the analysis is about the music
   rather than the stereo image. */

export async function decode(data: ArrayBuffer): Promise<{ pcm: Float32Array; sr: number }> {
  /* the sample rate is whatever the file was made at; a one-frame offline
     context decodes without opening an output device */
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const buf = await ctx.decodeAudioData(data.slice(0));
  const pcm = new Float32Array(buf.length);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < ch.length; i++) pcm[i] += ch[i] / buf.numberOfChannels;
  }
  return { pcm, sr: buf.sampleRate };
}
