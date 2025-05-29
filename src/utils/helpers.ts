import type { NextApiRequest } from 'next'
import type { Torrent } from 'webtorrent'
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg'
import ffprobe from 'ffprobe-static'

ffmpeg.setFfprobePath(ffprobe.path)

export function torrentIdFromQuery(query: NextApiRequest['query']) {
  const { dn, tr, xt } = query as { dn: string; tr: string[]; xt: string }
  return `magnet:?xt=${xt}&dn=${dn}${tr.map((t) => `tr=${t}`).join('&')}`
}

export function mediaType(file: string) {
  if (file.endsWith('.mkv')) {
    return 'video/x-matroska'
  }
  else if (file.endsWith('.mp4')) {
    return 'video/mp4'
  }
  else if (file.endsWith('.webm')) {
    return 'video/mp4'
  } else {
    return 'application/octet-stream'
  }
}

export function isMediaFile(file: string) {
  return file.endsWith('.mkv') || file.endsWith('.mp4')
}
/*
export function hasAudioTrack(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err)
      const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio')
      resolve(hasAudio)
    })
  })
}
*/

export function hasAudioTrack(torrent: Torrent): Promise<boolean> {
  const file = torrent?.files?.find((file) => isMediaFile(file?.name));

  if (!file) {
    return Promise.resolve(false);
  }

  // Use a stream for ffprobe
  const stream = file.createReadStream({ start: 0, end: Math.min(20 * 1024 * 1024, file.length - 1) }) as Readable;

  // Wrap ffprobe in a promise

  return new Promise<boolean>((resolve, reject) => {
    ffmpeg(stream).ffprobe((err, metadata) => {
      if (err) {
        console.error('ffprobe error:', err);
        return reject(false); // or reject(err) if you want to fail hard
      }
      const found = metadata.streams.some(s => s.codec_type === 'audio');
      resolve(found);
    });
  });
}