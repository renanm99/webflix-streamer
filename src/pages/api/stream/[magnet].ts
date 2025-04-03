'use server'
import { client } from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'
import { isMediaFile, mediaType, torrentIdFromQuery } from '@/utils/helpers'
import fs from 'fs'
import removeAllTorrents from '@/pages/api/removeAllTorrents'

export const config = {
  api: {
    responseLimit: false
  }
}

const CHUNK_SIZE = 10 ** 6 // 1MB



const streamTorrent = (torrent: Torrent, req: NextApiRequest, res: NextApiResponse) => {

  console.log('----------------->inside streamTorrent')
  const file = torrent?.files?.find((file) => isMediaFile(file?.name))
  if (!file) {
    /*
      torrent.destroy()
      torrent.files.forEach((file) => {
        fs.unlinkSync(file.path)
      })
        */
    return res.status(500).json({ error: 'No media file found' })
  }

  const fileSize = file.length
  const range = req.headers.range
  const contentType = mediaType(file.name)

  if (range) {
    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1)

    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize} `
      })
      return res.end()
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType
    })


    const readStream = file.createReadStream({ start, end });
    readStream.pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType
    })

    const readStream = file.createReadStream();
    readStream.pipe(res)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.xt == 'urn:btih:0000000000000000000000000000000000000000') {
    return res.status(404).json({ error: 'Torrent does not exist' })
  }
  console.log('----------------->1starting handler')

  const torrentId = torrentIdFromQuery(req.query)

  if (!torrentId) {
    return res.status(400).json({ error: 'Incorrect magnet URI' })
  }

  const torrentAlreadyAdded = client.get(torrentId)

  if (torrentAlreadyAdded && torrentAlreadyAdded.files.length == 0) {
    client.remove(torrentAlreadyAdded)
  } else if (torrentAlreadyAdded && torrentAlreadyAdded.files.length > 0) {
    console.log('----------------->(if 1) starting streamTorrent from torrentAlreadyAdded')
    return streamTorrent(torrentAlreadyAdded, req, res)
  } else {
    console.log('----------------->(if 2) torrentAlreadyAdded not yet added')
  }



  try {
    console.log('----------------->starting await promise')
    // Add timeout to the promise
    const torrentPromise = new Promise<Torrent>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        return reject('Torrent initialization timed out');
      }, 30 * 1000); // 30 second timeout

      client.add(
        torrentId,
        {
          destroyStoreOnDestroy: true,
          strategy: 'sequential',
        },
        (torrent) => {
          clearTimeout(timeoutId);
          resolve(torrent);
        }
      );
    });

    const torrent = await torrentPromise;
    console.log('----------------->finished await promise');

    if (!torrent) {
      return res.status(404).json({ error: 'Error adding torrent' });
    }

    let torrentIsReady = false
    let count = 0
    console.log('----------------->starting while torrentIsReady', torrentIsReady)
    while (!torrentIsReady) {
      if (count > 60) {
        break
      }
      console.log('----------------->(while 2) checking torrent ready', (torrent.files.length > 0 && torrent.ready && torrent.files.find((file) => isMediaFile(file.name))))
      if (torrent.files.length > 0 && torrent.ready && torrent.files.find((file) => isMediaFile(file.name))) {
        torrentIsReady = true
        continue
      }
      console.log('----------------->(while 2) waiting 1 segs for torrentIsReady', torrentIsReady)
      await new Promise((r) => setTimeout(r, 1000))
      count++
    }

    if (!torrentIsReady) {
      return res.status(400).json({ error: 'Torrent not ready for streaming' })
    }
    console.log('----------------->starting final streamTorrent')

    return streamTorrent(torrent, req, res)
  } catch (error) {
    console.error('Error in handler:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
