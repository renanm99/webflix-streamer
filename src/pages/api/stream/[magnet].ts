'use server'
import client from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'
import { isMediaFile, mediaType, torrentIdFromQuery } from '@/utils/helpers'

export const config = {
  api: {
    responseLimit: false
  }
}

const CHUNK_SIZE = 10 ** 6 // 1MB



const streamTorrent = (torrent: Torrent, req: NextApiRequest, res: NextApiResponse) => {
  const file = torrent?.files?.find((file) => isMediaFile(file?.name));
  if (!file) {
    return res.status(500).json({ error: 'No media file found' });
  }

  const fileSize = file.length;
  const range = req.headers.range;
  const contentType = mediaType(file.name);

  if (range) {
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`,
      });
      return res.end();
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
    });

    // Stream the requested range of the file
    const readStream = file.createReadStream({ start, end });

    // Handle errors during streaming
    readStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).end('Error streaming file');
    });

    readStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    });

    // Stream the entire file
    const readStream = file.createReadStream();

    // Handle errors during streaming
    readStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).end('Error streaming file');
    });

    readStream.pipe(res);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.xt == 'urn:btih:0000000000000000000000000000000000000000') {
    return res.status(404).json({ error: 'Torrent does not exist' })
  }

  const torrentId = torrentIdFromQuery(req.query)

  if (!torrentId) {
    return res.status(400).json({ error: 'Incorrect magnet URI' })
  }

  const torrentAlreadyAdded = client.get(torrentId)

  if (torrentAlreadyAdded && torrentAlreadyAdded.files.length == 0) {
    client.remove(torrentAlreadyAdded)
  } else if (torrentAlreadyAdded && torrentAlreadyAdded.files.length > 0) {
    return streamTorrent(torrentAlreadyAdded, req, res)
  }

  try {
    // Add timeout to the promise
    const torrentPromise = new Promise<Torrent>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject('Torrent initialization timed out');
      }, 30 * 1000); // 30 second timeout

      client.add(
        torrentId,
        {
          destroyStoreOnDestroy: true,
          strategy: 'sequential',
        },
        (torrent: Torrent) => {
          clearTimeout(timeoutId);
          resolve(torrent);
        }
      );
    });

    const torrent = await torrentPromise;

    if (!torrent) {
      return res.status(404).json({ error: 'Error adding torrent' });
    }

    let torrentIsReady = false
    let count = 0
    while (!torrentIsReady) {
      if (count > 60) {
        break
      }
      if (torrent.files.length > 0 && torrent.ready && torrent.files.find((file) => isMediaFile(file.name))) {
        torrentIsReady = true
        continue
      }
      await new Promise((r) => setTimeout(r, 1000))
      count++
    }

    if (!torrentIsReady) {
      return res.status(400).json({ error: 'Torrent not ready for streaming' })
    }

    return streamTorrent(torrent, req, res)
  } catch (error) {
    console.error('Error in handler:', error)
    return res.status(500).json({ error: 'Internal server error' + error })
  }
}
