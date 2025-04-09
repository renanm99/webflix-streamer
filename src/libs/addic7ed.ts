import { load } from 'cheerio';
import * as fs from 'fs/promises'; // Change to promises API
import * as iconv from 'iconv-lite'; // Add this import

interface SubtitleInfo {
    language: string;
    url: string;
    fullUrl: string;
    version?: string;
    completed?: boolean;
    link?: string;
    referer?: string;
}

const headers = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' };

export const addic7ed = {
    searchTV: async (show: string, season: string, episode: string, languages: string[]) => {
        try {
            const searchTitle = `${show.trim()} ${season} ${episode}`.trim();
            const response = await fetch(`https://www.addic7ed.com/srch.php?search=${searchTitle}&Submit=Search`,
                { headers, });
            const body = await response.text();

            if (~body.indexOf('<b>0 results found<\/b>')) {
                return [] as SubtitleInfo[];
            }

            const regexp = new RegExp(
                'href="(serie/[^/]+/' + parseInt(season) + '/' + parseInt(episode) + '/.+?)"'
            );

            const urlMatch = body.match(regexp);
            const url = urlMatch && urlMatch[1];

            if (!url) {
                return [] as SubtitleInfo[];
            }

            const urlResponse = await fetch(`https://www.addic7ed.com/${url}`, { headers });
            const urlBody = await urlResponse.text();
            return extractSubtitleUrls(urlBody, languages);
        } catch (error) {
            console.error('Error searching Addic7ed:', error);
            throw error;
        }
    },

    searchMovie: async (title: string, year: string, languages: string[]) => {
        try {
            const searchTitle = `${title.trim()} ${year}`.trim();
            const response = await fetch(`https://www.addic7ed.com/srch.php?search=${searchTitle}&Submit=Search`,
                { headers });
            const body = await response.text();

            if (~body.indexOf('<b>0 results found<\/b>')) {
                return [] as SubtitleInfo[];
            }

            const movieUrlRegex = /href="(movie\/\d+)"/i;
            const match = body.match(movieUrlRegex);
            const url = match && match[1];

            if (!url) {
                return [] as SubtitleInfo[];
            }

            const urlResponse = await fetch(`https://www.addic7ed.com/${url}`, { headers });
            const urlBody = await urlResponse.text();
            return extractSubtitleUrls(urlBody, languages);
        } catch (error) {
            console.error('Error searching Addic7ed:', error);
            throw error;
        }
    },

    download: async (subtitles: SubtitleInfo[]): Promise<Array<{ language: string, content: string }>> => {
        // Create an array to hold results
        const results: Array<{ language: string, content: string }> = [];

        // Process each subtitle in the array
        for (const subInfo of subtitles) {
            try {
                // Fetch the subtitle
                const response = await fetch(`https://www.addic7ed.com${subInfo.url}`, {
                    headers: {
                        ...headers,
                        'Referer': 'https://www.addic7ed.com/show/1',
                    },
                });

                if (!response.ok) {
                    console.error(`Failed to download subtitle: ${response.status} ${response.statusText}`);
                    continue; // Skip this subtitle but continue with others
                }

                // Process the response
                const body = await response.arrayBuffer();
                const fileContentBuffer = Buffer.from(body);
                let fileContent = iconv.decode(fileContentBuffer, 'utf8');

                if (fileContent.includes('�')) {
                    fileContent = iconv.decode(fileContentBuffer, 'binary');
                }

                // Add to results array
                results.push({
                    language: subInfo.language,
                    content: fileContent
                });
            } catch (error) {
                console.error(`Error downloading subtitle for ${subInfo.language}:`, error);
                // Continue with next subtitle
            }
        }

        return results;
    }
}

function extractSubtitleUrls(htmlContent: string, languages: string[]): SubtitleInfo[] {
    const $ = load(htmlContent);
    const subtitleUrls: SubtitleInfo[] = [];

    // Find all download buttons with their language info
    $('a.face-button').each((i, element) => {
        const url = $(element).attr('href');
        if (!url) return; // Skip if URL is missing

        const language = $(element).find('.face-secondary').text().trim();

        // Get version info if available
        const versionElement = $(element).closest('tr').prevAll('tr:has(.NewsTitle)').first();
        const version = versionElement.find('.NewsTitle').text().replace(/Version |, Duration:.+$/g, '').trim();

        // Get completion status
        const completed = $(element).closest('tr').find('b').text().includes('Completed');

        // Filter by the languages array instead of hardcoding
        const normalizedLang = language.toLowerCase();
        if (languages.some(lang => normalizedLang.includes(lang.toLowerCase()))
            && !subtitleUrls.some(sub => sub.language === language)) {
            // Check if the URL is already in the array
            // If not, add it
            subtitleUrls.push({
                language,
                url,
                fullUrl: `https://www.addic7ed.com${url}`,
                version: version || undefined,
                completed
            });
        }
    });

    return subtitleUrls;
}