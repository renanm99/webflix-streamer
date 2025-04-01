import type { NextApiRequest, NextApiResponse } from 'next';
import TorrentSearchApi from 'torrent-search-api';

// Initialize the API outside of the handler
const api = TorrentSearchApi;
//api.enableProvider('1337x')
//api.enableProvider('Eztv')
//api.enableProvider('KickassTorrents')
//api.enableProvider('Limetorrents')
//api.enableProvider('Rarbg')
api.enableProvider('ThePirateBay')
//api.enableProvider('Torrent9')
//api.enableProvider('TorrentProject')
//api.enableProvider('Torrentz2')
//api.enableProvider('Yts')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { query, category = 'All', limit = '4' } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        try {
            const results = await api.search(
                query as string,
                category as string,
                parseInt(limit as string) as number
            );
            if (results.length > 0) {
                return res.status(200).json({ results });
            }

            return res.status(404).json({});
        } catch (error) {
            console.error("Torrent search failed:", error);
            return res.status(500).json({ error: 'Search failed' });
        }
    }

    else if (req.method === 'POST') {
        const { torrent } = req.body;

        if (!torrent) {
            return res.status(400).json({ error: 'Torrent data is required' });
        }

        try {
            const magnet = await api.getMagnet(torrent);
            return res.status(200).json({ magnet });
        } catch (error) {
            console.error("Failed to get magnet link:", error);
            return res.status(500).json({ error: 'Failed to get magnet link' });
        }
    }

    else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}