'use server'
import client from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'
import { Torrent } from 'webtorrent'
import { torrentIdFromQuery } from '@/utils/helpers'

export const config = {
  api: {
    responseLimit: false
  }
}

client.setMaxListeners(1000)

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
        reject('Torrent initialization timed out');
      }, 15 * 1000); // 30 second timeout

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
      if (torrentAlreadyAdded) {
        client.remove(torrentAlreadyAdded)
      }
      return res.status(404).json({ error: 'Error adding torrent' });
    } else {
      if (torrentAlreadyAdded) {
        client.remove(torrentAlreadyAdded)
      }
      return res.status(200).json({ message: 'Torrent added successfully', torrentId: torrentId });
    }

  } catch (error) {
    console.error('Test Stream Error in handler:', error)
    return res.status(500).json({ error: 'Internal server error' + error })
  }
}
