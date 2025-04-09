'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { addic7ed } from '@/libs/addic7ed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { name, year, season, episode } = req.query;
    if (req.method === 'GET') {
        try {
            let response = null;
            if (season == '0' && episode == '0') {
                response = await addic7ed.searchMovie(`${name}`, `${year}`, ['English', 'Brazilian', 'Portuguese']).then(async (response) => {
                    return await addic7ed.download(response);
                });
            } else {

                response = await addic7ed.searchTV(`${name}`, `${season}`, `${episode}`, ['English', 'Brazilian', 'Portuguese']).then(async (response) => {
                    return await addic7ed.download(response);
                });
            }

            if (response.length === 0) {
                res.status(204).json({ error: 'No subtitles found' });
            } else {
                res.status(200).json(response);
            }
        } catch (error) {
            console.error('Error reading subtitle files:', error);
            res.status(500).json({ error: 'Error reading subtitle files -> ' + error });
        }
    }
    else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}