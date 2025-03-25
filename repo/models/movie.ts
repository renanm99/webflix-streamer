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
    content_type: 'tv' | 'movie';
    magnet_torrent?: string | null;
    seasons?: Season[];
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