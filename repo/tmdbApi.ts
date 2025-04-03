'use server'

import { Movie, TV, MovieById, TVById, TVSeasonDetails } from "@/../repo/models/movie";
import { torrentApi } from "@/libs/torrentsearch"
import { error } from "console";

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
    //console.log("URL", url)
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
        let url = '';
        if (season && episode) {
            const tvDetails = await GetTVById(id);
            const query = `${tvDetails.name.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
            url = `${process.env.BASE_URL}/api/torrents?category=TV&query=${encodeURIComponent(query)}`;
        } else {

            const movieDetails = await GetMovieById(id);
            const query = `${movieDetails.title.replace(/[-:]/g, ' ').replace(/[^\w\s]/gi, '')} ${movieDetails.release_date.substring(0, 4)}`;
            url = `${process.env.BASE_URL}/api/torrents?category=Movies&query=${encodeURIComponent(query)}`;
            console.log("URL", url)
        }


        let response = null
        let tries = 10
        do {
            response = await fetch(url,
                { method: 'GET', cache: 'default' }
            );
            tries--;
        } while (response.status != 200 && tries > 0)

        if (response.status != 200) {
            console.log("Response", response.status)
            throw Error('Could not find torrents');
        }

        const data = await response.json();
        data.results = data.results.sort((a: any, b: any) => {
            // Parse size strings (e.g., "8.3 GB") to numeric values in MB
            const sizeToMB = (sizeStr: string): number => {
                const [value, unit] = sizeStr.split(' ');
                const numValue = parseFloat(value);

                switch (unit.toLowerCase()) {
                    case 'kb': return numValue / 1024;
                    case 'mb': return numValue;
                    case 'gb': return numValue * 1024;
                    case 'tb': return numValue * 1024 * 1024;
                    default: return numValue;
                }
            };

            // Calculate size in MB
            const sizeA = sizeToMB(a.size);
            const sizeB = sizeToMB(b.size);

            // Check if seeds are extremely different (more than 10x difference)
            // This ensures we don't pick a tiny file with almost no seeds
            if (a.seeds > 0 && b.seeds > 0 && (a.seeds / b.seeds > 10 || b.seeds / a.seeds > 10)) {
                return b.seeds - a.seeds; // Sort by seeds when there's a massive seed difference
            }

            // For files with similar-ish seed counts:
            // First check if the size difference is significant (>20%)
            const sizeDiffPercent = Math.abs(sizeA - sizeB) / Math.max(sizeA, sizeB);
            if (sizeDiffPercent > 0.2) {
                return sizeA - sizeB; // Prioritize smaller sizes when there's a significant difference
            }

            // For similar-sized files, use a weighted score that still prioritizes size
            // The size is now squared to give it more weight
            const scoreA = (a.seeds + 10) / Math.pow(sizeA / 100, 2);
            const scoreB = (b.seeds + 10) / Math.pow(sizeB / 100, 2);

            // Higher score is better
            return scoreB - scoreA;
        });

        if (data.results && data.results.length > 0) {
            const magnetResponse = await fetch(`${process.env.BASE_URL}/api/torrents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ torrent: data.results[0] }),
            });

            const magnetData = await magnetResponse.json();
            return magnetData.magnet || '';
        }
        throw Error('404 No Files');
    } catch (error) {
        console.error("Failed to fetch magnet:", error);
        return '';
    }
}



