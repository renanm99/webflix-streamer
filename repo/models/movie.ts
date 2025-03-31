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

export interface TVById {
    adult: boolean;
    backdrop_path: string;
    created_by: {
        id: number;
        credit_id: string;
        name: string;
        original_name: string;
        gender: number;
        profile_path: string | null;
    }[];
    episode_run_time: number[];
    first_air_date: string;
    genres: {
        id: number;
        name: string;
    }[];
    homepage: string;
    id: number;
    in_production: boolean;
    languages: string[];
    last_air_date: string;
    last_episode_to_air: {
        id: number;
        name: string;
        overview: string;
        vote_average: number;
        vote_count: number;
        air_date: string;
        episode_number: number;
        episode_type: string;
        production_code: string;
        runtime: number | null;
        season_number: number;
        show_id: number;
        still_path: string | null;
    };
    name: string;
    next_episode_to_air: {
        id: number;
        name: string;
        overview: string;
        vote_average: number;
        vote_count: number;
        air_date: string;
        episode_number: number;
        episode_type: string;
        production_code: string;
        runtime: number | null;
        season_number: number;
        show_id: number;
        still_path: string | null;
    } | null;
    networks: {
        id: number;
        logo_path: string | null;
        name: string;
        origin_country: string;
    }[];
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
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
    seasons: {
        air_date: string;
        episode_count: number;
        id: number;
        name: string;
        overview: string;
        poster_path: string | null;
        season_number: number;
        vote_average: number;
    }[];
    spoken_languages: {
        english_name: string;
        iso_639_1: string;
        name: string;
    }[];
    status: string;
    tagline: string;
    type: string;
    vote_average: number;
    vote_count: number;
    magnet_torrent: string;
}

export interface TVSeasonDetails {
    _id: string;
    air_date: string;
    episodes: {
        air_date: string;
        episode_number: number;
        episode_type: string;
        id: number;
        name: string;
        overview: string;
        production_code: string;
        runtime: number;
        season_number: number;
        show_id: number;
        still_path: string | null;
        vote_average: number;
        vote_count: number;
        crew: {
            job: string;
            department: string;
            credit_id: string;
            adult: boolean;
            gender: number;
            id: number;
            known_for_department: string;
            name: string;
            original_name: string;
            popularity: number;
            profile_path: string | null;
        }[];
        guest_stars: {
            character: string;
            credit_id: string;
            order: number;
            adult: boolean;
            gender: number;
            id: number;
            known_for_department: string;
            name: string;
            original_name: string;
            popularity: number;
            profile_path: string | null;
        }[];
    }[];
    name: string;
    overview: string;
    id: number;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
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