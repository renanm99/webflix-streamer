"use server";

import { Movie, TV, MovieById, TVById, TVSeasonDetails } from "@/../repo/models/movie";
import { torrentApi } from "@/libs/torrentsearch"

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

export async function GetMovieMagnetLink(id: number): Promise<any> {
    try {
        const movieDetails = await GetMovieById(id);
        const query = `${movieDetails.title.replace(/[^\w\s]/gi, '')} ${movieDetails.release_date.substring(0, 4)}`;

        const response = await fetch(
            `${process.env.BASE_URL}/api/torrents?category=Movies&query=${encodeURIComponent(query)}`,
            { cache: 'default' }
        );

        const data = await response.json();

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
        return '';
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return '';
    }
}

export async function GetTVMagnetLink(id: number, season: number, episode: number): Promise<string> {
    try {
        const tvDetails = await GetTVById(id);
        const query = `${tvDetails.name.replace(/[^\w\s]/gi, '')} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;

        // Call your API endpoint
        const response = await fetch(
            `${process.env.BASE_URL}/api/torrents?category=TV&query=${encodeURIComponent(query)}`,
            { cache: 'default' }
        );

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Get the magnet for the first result
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

        return '';
    } catch (error) {
        console.error("Failed to fetch TV magnet:", error);
        return '';
    }
}



