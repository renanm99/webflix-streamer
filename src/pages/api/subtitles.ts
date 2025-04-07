'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { lang } = req.query; // Expecting a query parameter like ?lang=en or ?lang=pt-br

    try {
        // Define paths to subtitle files
        const filePathEn = join(process.cwd(), 'public', 'subtitles', 'en.srt');
        const filePathPtBr = join(process.cwd(), 'public', 'subtitles', 'pt-br.srt');

        // Read subtitle files
        const [contentEn, contentPtBr] = await Promise.all([
            readFile(filePathEn, 'utf-8'),
            readFile(filePathPtBr, 'utf-8'),
        ]);

        // Construct the response array
        const subtitles = [
            { lang: 'en', content: contentEn },
            { lang: 'pt-br', content: contentPtBr },
        ];

        // If a specific language is requested, return the content as a Blob-like response
        if (lang) {
            const subtitle = subtitles.find((s) => s.lang === lang);
            if (!subtitle) {
                return res.status(404).json({ error: 'Subtitle not found' });
            }

            res.setHeader('Content-Type', 'text/srt; charset=utf-8');
            res.setHeader('Content-Disposition', `inline; filename="${lang}.srt"`);
            return res.status(200).send(subtitle.content);
        }

        // Otherwise, return the array as JSON
        res.status(200).json(subtitles);
    } catch (error) {
        console.error('Error reading subtitle files:', error);
        res.status(500).json({ error: 'Error reading subtitle files' });
    }
}