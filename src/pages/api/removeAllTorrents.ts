import { client } from '@/libs/webtorret'
import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function removeAllTorrents() {
  try {
    for (const torrent of client.torrents) {
      client.remove(torrent)
      torrent.destroy()

      torrent.files.forEach((file) => {
        fs.unlinkSync(file.path)
      })
      //fs.rmdirSync(torrent.path)
    }

    return 0
  } catch (e) {
    return 99
  }
}
