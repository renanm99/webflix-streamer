import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { url } = req.query;

        console.log('Received URL:', url);

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Create a hash of the URL to use as filename
        const cacheFile = path.join(process.cwd(), `${url}`);

        console.log('Cache file path:', cacheFile);

        // Check if the subtitle file exists in the cache
        if (fs.existsSync(cacheFile)) {
            const cachedContent = fs.readFileSync(cacheFile, 'utf8');

            res.setHeader('Content-Type', 'text/srt; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('X-Cache', 'HIT');

            return res.status(200).send(cachedContent);
        }

        // If the file is not in the cache, return an error
        console.error('Subtitle not found in cache:', cacheFile);
        return res.status(404).json({ error: 'Subtitle not found in cache' });
    } catch (error) {
        console.error('Error in subtitle-proxy handler:', error);
        return res.status(500).json({ error: 'Server error processing subtitle' });
    }
}