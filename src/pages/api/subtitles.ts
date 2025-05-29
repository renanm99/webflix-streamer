import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { srt2vtt } from 'srt-support-for-html5-videos';

interface SubtitleInfo {
    language: string;
    content: string;
}

interface RequestSubtitle {
    id: string;
    type: string;
    attributes: {
        language: string;
        files: Array<{
            file_id: number;
        }>;
    };
}

const OPENSUB_URL = 'https://api.opensubtitles.com/api/v1'
const OPENSUB_API_KEY = process.env.OPENSUB_API_KEY || '';
const OPENSUB_USER_AGENT = process.env.OPENSUB_USER_AGENT || '';
const OPENSUB_AUTH = process.env.OPENSUB_AUTH || '';

const headers = {
    'Content-Type': 'application/json',
    'Api-Key': `${OPENSUB_API_KEY}`,
    'User-Agent': `${OPENSUB_USER_AGENT}`,
    'Authorization': `${OPENSUB_AUTH}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tmdb_id, season, episode } = req.query;

    if (req.method === 'GET') {
        try {
            const cacheDir = path.join(process.cwd(), 'subtitle-cache');
            let metadataCacheFile = "";

            if (!season && !episode) {
                metadataCacheFile = path.join(cacheDir, `metadata_${tmdb_id}.json`);
            } else {
                metadataCacheFile = path.join(cacheDir, `metadata_${tmdb_id}_${season}_${episode}.json`);
            }

            // Create cache directory if it doesn't exist
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }

            // Cleanup old .srt files in the cache
            const now = Date.now();
            const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            const files = fs.readdirSync(cacheDir);

            /*
            files.forEach((file) => {
                if (file.endsWith('.srt')) {
                    const filePath = path.join(cacheDir, file);
                    const stats = fs.statSync(filePath);

// 
                    // Delete the file if it's older than 7 days
                    if (now - stats.mtimeMs > oneWeek) {
                        fs.unlinkSync(filePath);
                    }
                }
            });

            // Check if we have metadata cache for this media
            if (fs.existsSync(metadataCacheFile)) {
                const cachedSubtitles = JSON.parse(fs.readFileSync(metadataCacheFile, 'utf8'));
                return res.status(200).json(cachedSubtitles);
            }
            */

            let response = null;
            if (!season && !episode) {

                response = await fetch(
                    `${OPENSUB_URL}/subtitles?tmdb_id=${tmdb_id}&languages=pt-br,en&order_by=download_count`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Api-Key': OPENSUB_API_KEY,
                            'User-Agent': OPENSUB_USER_AGENT,
                            'Authorization': OPENSUB_AUTH
                        }
                    }
                );
            } else {

                response = await fetch(
                    `${OPENSUB_URL}/subtitles?tmdb_id=${tmdb_id}&languages=pt-br,en&season_number=${season}&episode_number=${episode}&order_by=download_count`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Api-Key': OPENSUB_API_KEY,
                            'User-Agent': OPENSUB_USER_AGENT,
                            'Authorization': OPENSUB_AUTH
                        }
                    }
                );
            }

            if (response.status !== 200) {
                return res.status(response.status).json({ error: 'No subtitles found' });
            }


            const data = await response.json();

            // Filter to get only one subtitle per language
            const languageMap: Record<string, RequestSubtitle> = {};

            if (data.data && Array.isArray(data.data)) {
                data.data.forEach((subtitle: RequestSubtitle) => {
                    if (subtitle && subtitle.attributes && subtitle.attributes.language) {
                        const lang = subtitle.attributes.language.toLowerCase();
                        if ((lang === 'pt-br' || lang === 'en') && !languageMap[lang] &&
                            subtitle.attributes.files && subtitle.attributes.files.length > 0) {
                            languageMap[lang] = subtitle;
                        }
                    }
                });
            }

            // Process subtitles and get download links
            const subtitlePromises = Object.values(languageMap).map(async (subtitle) => {
                const fileId = subtitle.attributes.files[0].file_id.toString();

                // Create a hash for the file ID to use as the cache filename
                const fileHash = crypto.createHash('md5').update(fileId).digest('hex');
                const cacheFile = path.join(cacheDir, `${fileHash}.vtt`); // Store as .vtt

                // Check if the subtitle file is already cached
                if (fs.existsSync(cacheFile)) {
                    return {
                        language: subtitle.attributes.language,
                        content: `/subtitle-cache/${fileHash}.vtt` // Return the cached file path
                    };
                }

                const downloadResponse = await fetch(`${OPENSUB_URL}/download`, {
                    method: 'POST',
                    headers: {
                            'Content-Type': 'application/json',
                            'Api-Key': OPENSUB_API_KEY,
                            'User-Agent': OPENSUB_USER_AGENT,
                            'Authorization': OPENSUB_AUTH
                    },
                    body: JSON.stringify({
                        file_id: fileId
                    })
                });

                const downloadData = await downloadResponse.json();

                if (downloadResponse.status !== 200 || !downloadData.link) {
                    console.error(`Failed to fetch download link for file_id ${fileId}`);
                    throw new Error(`Failed to fetch download link for file_id ${fileId}`);
                }

                // Fetch the actual subtitle content from the download link
                const subtitleResponse = await fetch(downloadData.link);
                if (!subtitleResponse.ok) {
                    console.error(`Failed to fetch subtitle content for file_id ${fileId}`);
                    throw new Error(`Failed to fetch subtitle content for file_id ${fileId}`);
                }
                const subtitleContent = await subtitleResponse.text();
                if (subtitleContent.length > 100) {
                    console.log("has subtitles")
                }

                // Convert SRT to VTT
                let vttContent = '';
                try {
                    vttContent = srt2vtt(subtitleContent);
                } catch (err) {
                    console.error(`Failed to convert SRT to VTT for file_id ${fileId}:`, err);
                    throw new Error(`Failed to convert SRT to VTT for file_id ${fileId}`);
                }

                // Save the VTT content to the cache
                fs.writeFileSync(cacheFile, vttContent, 'utf8');
                console.log(`Cached subtitle (VTT) for file_id ${fileId} at ${cacheFile}`);

                return {
                    language: subtitle.attributes.language,
                    content: `/subtitle-cache/${fileHash}.vtt` // Return the cached file path
                };
            });

            // Wait for all subtitle downloads to complete
            const subtitles: SubtitleInfo[] = await Promise.all(subtitlePromises);

            // Cache the results
            fs.writeFileSync(metadataCacheFile, JSON.stringify(subtitles));

            return res.status(200).json(subtitles);

        } catch (error) {
            console.error('Error in subtitles handler:', error);
            return res.status(500).json({ error: 'Server error processing subtitles' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
