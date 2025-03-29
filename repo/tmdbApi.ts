"use server";

import { Movie, TV, MovieById } from "@/../repo/models/movie";

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

export async function GetById(id: number): Promise<MovieById> {
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
    console.log("URL", url)
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


    console.log("URL", url)
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


