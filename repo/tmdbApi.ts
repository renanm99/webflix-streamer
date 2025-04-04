'use server'

import { Movie, TV, MovieById, TVById, TVSeasonDetails } from "@/../repo/models/movie";
import crypto from 'crypto';

interface TMDBResponseMovie {
    "page": number,
    "results": Movie[],
    "total_pages": number,
    "total_results": number
}
interface TMDBResponseTV {
    "page": number,
    "results": TV[],
    "total_pages": number,
    "total_results": number
}
// Keep track of ongoing requests
let currentAbortController: AbortController | null = null;
// Cache for magnet links
const globalForMagnetCache = global as unknown as { magnetCache: Map<string, { magnet: string, status: number }> };

if (!globalForMagnetCache.magnetCache) {
    globalForMagnetCache.magnetCache = new Map();
}

const magnetCache = globalForMagnetCache.magnetCache;
const CACHE_TTL = 3600 * 1000; // 1 hour

function generateHash(data: { title: string; time: string; seeds: number; peers: number; size: string; desc: string; provider: string }): string {
    const hash = crypto.createHash('sha256'); // Use SHA-256 hashing algorithm
    hash.update(JSON.stringify(data)); // Convert the object to a string and hash it
    return hash.digest('hex'); // Return the hash as a hexadecimal string
}


export async function GetPopular(page: number): Promise<Movie[]> {
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/trending/movie/day?language=en-US&page=${page}`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            },
            next: { revalidate: 3600 * 12 } // 12 hours
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as TMDBResponseMovie;

        return data.results.sort((a, b) => {
            // Get release dates, using fallbacks if undefined
            const dateA = a.release_date;
            const dateB = b.release_date;

            // Default dates if undefined
            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;

            return timeB - timeA; // Sort descending (newest first)
        });
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return [];
    }
}

export async function GetTVPopular(page: number): Promise<TV[]> {
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/trending/tv/day?language=en-US&page=${page}`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            },
            next: { revalidate: 3600 * 12 } // 12 hours
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as TMDBResponseTV;

        return data.results.sort((a, b) => {
            // Get release dates, using fallbacks if undefined
            const dateA = a.first_air_date;
            const dateB = b.first_air_date;

            // Default dates if undefined
            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;

            return timeB - timeA; // Sort descending (newest first)
        });
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return [];
    }
}

export async function GetMovieById(id: number): Promise<MovieById> {
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/movie/${id}`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as MovieById;

        return data;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return {} as MovieById;
    }
}

export async function GetSeachMovieName(query: string, page: number): Promise<Movie[]> {
    const queryString = query.split(" ").map((title) => `${title}`).join("+");
    const url = `${process.env.TMDB_API_URL}/search/movie?query=${queryString}&include_adult=false&language=en-US&page=${page}`
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/search/movie?query=${queryString}&include_adult=false&language=en-US&page=${page}`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as TMDBResponseMovie
        return data.results;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return [];
    }
}

export async function GetSeachTVName(query: string, page: number): Promise<TV[]> {
    const queryString = query.split(" ").map((title) => `${title}`).join("+");
    const url = `${process.env.TMDB_API_URL}/search/tv?query=${queryString}&include_adult=false&language=en-US&page=${page}`

    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/search/tv?query=${queryString}&include_adult=false&language=en-US&page=${page}`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as TMDBResponseTV
        return data.results;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return [];
    }
}

export async function GetTVById(id: number): Promise<TVById> {
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/tv/${id}?language=en-US`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as TVById;

        return data;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return {} as TVById;
    }
}

export async function GetTVSeasonsDetailsById(id: number, season: number): Promise<TVSeasonDetails> {
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/tv/${id}/season/${season}?language=en-US`, {
            headers: {
                "authorization": `Bearer ${process.env.TMDB_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }

        const data = await response.json() as TVSeasonDetails;

        return data;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return {} as TVSeasonDetails;
    }
}

export async function GetMagnetLink(id: number, season?: number, episode?: number): Promise<string> {
    try {
        // Cancel any previous requests
        if (currentAbortController) {
            currentAbortController.abort();
        }

        // Create a new abort controller for this request
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;

        let url = '';
        let secondurl = '';
        let thirdurl = '';
        if (season && episode) {
            const tvDetails = await GetTVById(id);
            const query = `${tvDetails.name.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
            const secondquery = `${tvDetails.original_name.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
            const thirdquery = `S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')} ${tvDetails.name.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')}`;
            url = `${process.env.BASE_URL}/api/torrents?category=TV&query=${encodeURIComponent(query)}`;
            secondurl = `${process.env.BASE_URL}/api/torrents?category=TV&query=${encodeURIComponent(secondquery)}`;
            thirdurl = `${process.env.BASE_URL}/api/torrents?category=TV&query=${encodeURIComponent(thirdquery)}`;
        } else {

            const movieDetails = await GetMovieById(id);
            const query = `${movieDetails.title.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')} ${movieDetails.release_date.substring(0, 4)}`;
            const secondquery = `${movieDetails.original_title.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')} ${movieDetails.release_date.substring(0, 4)}`;
            const thirdquery = `${movieDetails.release_date.substring(0, 4)} ${movieDetails.original_title.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')}`;
            url = `${process.env.BASE_URL}/api/torrents?category=Movies&query=${encodeURIComponent(query)}`;
            secondurl = `${process.env.BASE_URL}/api/torrents?category=Movies&query=${encodeURIComponent(secondquery)}`;
            thirdurl = `${process.env.BASE_URL}/api/torrents?category=Movies&query=${encodeURIComponent(thirdquery)}`;
        }


        let response = null
        let tries = 3
        do {
            if (tries % 3 == 0) {
                response = await fetch(url,
                    {
                        method: 'GET', cache: 'default',
                        headers: {
                            'cors': 'same-origin',
                            'X-App-Request': 'webflix-app',
                            'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`
                        }
                    }
                );
            } else if (tries % 3 == 1) {
                response = await fetch(secondurl,
                    {
                        method: 'GET', cache: 'no-cache', headers: {
                            'cors': 'same-origin',
                            'X-App-Request': 'webflix-app',
                            'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`
                        }
                    }
                );
            } else {
                response = await fetch(thirdurl,
                    {
                        method: 'GET', cache: 'no-cache', headers: {
                            'cors': 'same-origin',
                            'X-App-Request': 'webflix-app',
                            'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`
                        }
                    }
                );
            }
            tries--;
        } while (response.status != 200 && tries > 0)


        if (response.status != 200) {
            return '';
        }

        const data = await response.json();

        let magnettries = 0
        let testMagnetStream = null

        if (data.results && data.results.length > 0) {
            do {
                // Check if the operation was aborted before each magnetLink call
                if (signal.aborted) {
                    return '';
                }
                testMagnetStream = await magnetLink(data, magnettries, signal);
                magnettries++;

                // Check if the operation was aborted after the magnetLink call
                if (signal.aborted) {
                    return '';
                }

                if (testMagnetStream && testMagnetStream.status == 200) {
                    break
                }
            } while ((testMagnetStream && testMagnetStream.status != 200) && magnettries < data.results.length)

            if (testMagnetStream && testMagnetStream.status == 200) {
                return testMagnetStream.magnet;
            }
            return '';
        }

        return '';
    } catch (error) {
        console.error("Failed to fetch magnet:", error);
        return '';
    }
}

async function magnetLink(data: any, magnettries: number, signal: AbortSignal): Promise<{ magnet: string, status: number }> {
    try {
        const cacheKey = generateHash(data.results[magnettries]); // Generate a hash for the torrent object
        if (magnetCache.has(cacheKey)) {
            console.log(`Cache hit for magnet: ${cacheKey}`);
            return magnetCache.get(cacheKey)!;
        }

        const magnetResponse = await fetch(`${process.env.BASE_URL}/api/torrents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cors': 'same-origin',
                'X-App-Request': 'webflix-app',
                'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`
            },
            body: JSON.stringify({ torrent: data.results[magnettries] }),
            signal
        });

        if (magnetResponse.status == 200) {
            const magnetData = await magnetResponse.json();
            const streamResponse = await fetch(`${process.env.BASE_URL}/api/stream/test/${magnetData.magnet}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'cors': 'same-origin',
                    'X-App-Request': 'webflix-app',
                    'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`
                },
                signal
            });

            if (streamResponse && streamResponse.status == 200) {
                // Cache the result
                const result = { magnet: magnetData.magnet, status: streamResponse.status };
                magnetCache.set(cacheKey, result);
                setTimeout(() => {
                    magnetCache.delete(cacheKey);
                    console.log(`Cache expired for magnet: ${cacheKey}`);
                }, CACHE_TTL);
                console.log(`Cache set for magnet: ${cacheKey}`);
                return result;
            }
            return { magnet: '', status: 404 };
        }
        return { magnet: '', status: 404 };
    } catch (error) {
        console.error('Error in magnetLink:', error);
        if (error === 'AbortError') {
            return { magnet: '', status: 499 }; // Using 499 to indicate client closed request
        }
        console.error('MagnetLink error:', error);
        return { magnet: '', status: 500 };
    }
}