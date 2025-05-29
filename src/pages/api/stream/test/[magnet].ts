'use server'
import client from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'
import { Torrent } from 'webtorrent'
import { torrentIdFromQuery, hasAudioTrack } from '@/utils/helpers'
import { EventEmitter } from 'stream'

export const config = {
  api: {
    responseLimit: false
  }
}

EventEmitter.setMaxListeners(1000)

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
  }

  try {
    // Add timeout to the promise
    const torrentPromise = new Promise<Torrent>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject('Torrent initialization teste timed out');
      }, 20 * 1000); // 20 second test timeout

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

    const hasAudio = await hasAudioTrack(torrent);
    if (!hasAudio) {
      return res.status(404).json({ error: 'No Audio Track' });
    }

    if (!torrent) {
      if (torrentAlreadyAdded) {
        client.remove(torrentAlreadyAdded)
      }
      return res.status(404).json({ error: 'Error adding torrent' });
    }

    return res.status(200).json({ message: 'Torrent added successfully', torrentId: torrentId });

  } catch (error) {
    console.error('Test Stream Error in handler:', error)
    return res.status(500).json({ error: 'Internal server error' + error })
  }
}
