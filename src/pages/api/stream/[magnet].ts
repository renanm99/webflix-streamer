'use client'
import { client } from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'
import { isMediaFile, mediaType, torrentIdFromQuery } from '@/utils/helpers'
import fs from 'fs'

export const config = {
  api: {
    responseLimit: false
  }
}

const CHUNK_SIZE = 10 ** 6 // 1MB

const streamTorrent = (torrent: Torrent, req: NextApiRequest, res: NextApiResponse) => {
  const file = torrent?.files?.find((file) => isMediaFile(file?.name))
  if (!file) {
    client.remove(torrent)
    torrent.destroy()
    torrent.files.forEach((file) => {
      fs.unlinkSync(file.path)
    })
    return res.status(405).json({ error: 'No media file found' })
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
  //removeAllTorrents()
  const torrentId = torrentIdFromQuery(req.query)
  if (!torrentId) {
    return res.status(400).json({ error: 'Incorrect magnet URI' })
  }

  const torrentAlreadyAdded = client.get(torrentId)
  if (torrentAlreadyAdded) {

    return streamTorrent(torrentAlreadyAdded, req, res)
  }

  const torrent = await new Promise<Torrent>((resolve) => {
    client.add(
      torrentId,
      {
        //path: path.resolve(process.cwd(), 'torrents'),
        destroyStoreOnDestroy: true,
        strategy: 'sequential',
      },
      (torrent) => {
        resolve(torrent)
      }
    )
  })

  if (!torrent) {
    return res.status(402).json({ error: 'Error adding torrent' })
  }

  let torrentIsReady = false
  let count = 0
  while (!torrentIsReady) {
    if (count > 60) {
      break
    }
    if (torrent.files.length > 0 && torrent.ready && torrent.files.find((file) => isMediaFile(file.name))) {
      torrentIsReady = true
    }
    await new Promise((r) => setTimeout(r, 1000))
    count++
  }

  if (!torrentIsReady) {
    return res.status(400).json({ error: 'Torrent not ready for streaming' })
  }

  return streamTorrent(torrent, req, res)
}
