import type { NextApiRequest, NextApiResponse } from 'next';
import TorrentSearchApi from 'torrent-search-api';

//const api = TorrentSearchApi;
TorrentSearchApi.enablePublicProviders();

const validateRequest = (req: NextApiRequest): { isValid: boolean, error?: string } => {
    const appHeader = req.headers['x-app-request'];
    const authHeader = req.headers['authorization'];

    // Check if the custom header is present and valid
    if (appHeader !== 'webflix-app') {
        return { isValid: false, error: 'Unauthorized request: Invalid app header' };
    }

    const token = authHeader?.split(' ')[1];
    if (token !== process.env.API_SECRET_TOKEN) {
        return { isValid: false, error: 'Unauthorized request: Invalid token' };
    }

    return { isValid: true };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const validation = validateRequest(req);
    if (!validation.isValid) {
        return res.status(403).json({ error: validation.error });
    }

    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://webflix.renanmachado.dev.br',
        'http://localhost:9100'
    ];

    // Only set Access-Control-Allow-Origin if the origin is in our allowed list
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // For same-origin requests, this effectively disables CORS
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { query, category = 'All', limit = '20' } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        try {
            const results = await TorrentSearchApi.search(
                query as string,
                category as string,
                parseInt(limit as string) as number
            );

            if (results.length > 0 && results[0].size != '0 B') {
                return res.status(200).json({ results });
            }

            return res.status(404).json({});
        } catch (error) {
            console.error("Torrent search failed:", error);
            return res.status(500).json({ error: 'Search failed' });
        }
    } else if (req.method === 'POST') {
        const { torrent } = req.body;

        if (!torrent) {
            return res.status(400).json({ error: 'Torrent data is required' });
        }

        try {
            const magnet = await TorrentSearchApi.getMagnet(torrent);
            if (magnet && magnet != '') {
                return res.status(200).json({ magnet });
            }
            return res.status(404).json({ error: 'Empty magnet link' });
        } catch (error) {
            console.error("Failed to get magnet link:", error);
            return res.status(500).json({ error: 'Failed to get magnet link' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}