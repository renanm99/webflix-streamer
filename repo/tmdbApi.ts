"use server";

import { Movie, TV, MovieById, TVById, TVSeasonDetails } from "@/../repo/models/movie";

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

export async function GetTVSeasonsDetailsById(id: number): Promise<TVSeasonDetails> {
    try {
        const response = await fetch(`${process.env.TMDB_API_URL}/tv/${id}/season/1?language=en-US`, {
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

export async function GetMovieMagnetLink(id: number): Promise<string> {
    try {
        const data = "magnet:?xt=urn:btih:1a6a0d3c790e574aa6bfa347cfe77674feae9c75&dn=Sonic The Hedgehog 3 (2024) [720p] [BluRay] [YTS.MX]&tr=udp://tracker.opentrackr.org:1337&tr=udp://explodie.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://open.stealth.si:80/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=udp://tracker.dler.org:6969/announce&tr=udp://ipv4.tracker.harry.lu:80/announce&tr=udp://zephir.monocul.us:6969/announce&tr=http://open.acgtracker.com:1096/announce&tr=http://t.nyaatracker.com:80/announce&tr=udp://retracker.lanta-net.ru:2710/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://opentracker.i2p.rocks:6969/announce&tr=udp://47.ip-51-68-199.eu:6969/announce&tr=udp://tracker.cyberia.is:6969/announce&tr=udp://uploads.gamecoast.net:6969/announce&tr=https://tracker.foreverpirates.co:443/announce&tr=udp://9.rarbg.to:2760&tr=udp://tracker.slowcheetah.org:14770&tr=udp://tracker.tallpenguin.org:15800&tr=udp://9.rarbg.to:2710/announce&tr=udp://opentor.org:2710";

        return data;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return '';
    }
}

export async function GetTVMagnetLink(id: number, season: number, episode: number): Promise<string> {
    try {
        const data = "magnet:?xt=urn:btih:1a6a0d3c790e574aa6bfa347cfe77674feae9c75&dn=Sonic The Hedgehog 3 (2024) [720p] [BluRay] [YTS.MX]&tr=udp://tracker.opentrackr.org:1337&tr=udp://explodie.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://open.stealth.si:80/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=udp://tracker.dler.org:6969/announce&tr=udp://ipv4.tracker.harry.lu:80/announce&tr=udp://zephir.monocul.us:6969/announce&tr=http://open.acgtracker.com:1096/announce&tr=http://t.nyaatracker.com:80/announce&tr=udp://retracker.lanta-net.ru:2710/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://opentracker.i2p.rocks:6969/announce&tr=udp://47.ip-51-68-199.eu:6969/announce&tr=udp://tracker.cyberia.is:6969/announce&tr=udp://uploads.gamecoast.net:6969/announce&tr=https://tracker.foreverpirates.co:443/announce&tr=udp://9.rarbg.to:2760&tr=udp://tracker.slowcheetah.org:14770&tr=udp://tracker.tallpenguin.org:15800&tr=udp://9.rarbg.to:2710/announce&tr=udp://opentor.org:2710";

        return data;
    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return '';
    }
}

