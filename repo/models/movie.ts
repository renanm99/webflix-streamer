export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    first_air_date: string;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    vote_average: number;
    vote_count: number;
    origin_country: string[];
    content_type: 'movie';
    magnet_torrent: string;
}

export interface MovieById {
    adult: boolean;
    backdrop_path: string;
    belongs_to_collection: {
        id: number;
        name: string;
        poster_path: string;
        backdrop_path: string;
    } | null;
    budget: number;
    genres: {
        id: number;
        name: string;
    }[];
    homepage: string;
    id: number;
    imdb_id: string | null;
    origin_country: string[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: {
        id: number;
        logo_path: string | null;
        name: string;
        origin_country: string;
    }[];
    production_countries: {
        iso_3166_1: string;
        name: string;
    }[];
    release_date: string;
    revenue: number;
    runtime: number | null;
    spoken_languages: {
        english_name: string;
        iso_639_1: string;
        name: string;
    }[];
    status: string;
    tagline: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    magnet_torrent: string;
}


export interface TV {
    id: number;
    name: string;
    poster_path: string;
    first_air_date: string;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    vote_average: number;
    vote_count: number;
    origin_country: string[];
    content_type: 'tv';
    magnet_torrent: string;
    seasons: Season[];
}

interface Season {
    seasonId: number;
    episodes?: Episode[];
}

interface Episode {
    episodeId: number;
    title: string;
    description: string;
    magnet_torrent: string | null;
}