'use client'

import { useEffect, useState, Suspense } from 'react'
import Player from '../components/player'
//import { repo } from '../../../repo/db'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

import { GetWatchMovie } from "@/../repo/dbHandler";
import { Movie } from "@/../repo/models/movie";

// Componente separado que usa useSearchParams
function WatchPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [content, setContent] = useState<Movie>({} as Movie);
    const [isLoading, setIsLoading] = useState(true);
    const [contentEpisodes, setContentEpisodes] = useState<any[] | null>(null);
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
    const [magnetTorrentSelected, setmagnetTorrentSelected] = useState<string>('');

    // Fetch the movie/show data
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const id = parseInt(searchParams?.get('id') || '', 10)
                const movie = await GetWatchMovie(id);
                setContent(movie);
            } catch (error) {
                console.error('Error fetching content:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, [searchParams]); // Only re-run if searchParams changes

    // Initialize seasons and episodes when content changes
    useEffect(() => {
        if (!content) return;

        const hasSeasons = content?.content_type === 'tv';

        if (hasSeasons && content.seasons) {
            // Find the last season with episodes
            const lastSeasonWithEpisodes = content.seasons.findLast(season =>
                season?.episodes && season.episodes.length > 0
            );

            if (lastSeasonWithEpisodes) {
                setSelectedSeason(lastSeasonWithEpisodes.seasonId);

                // Find episodes for this season
                const episodes = lastSeasonWithEpisodes.episodes;
                if (episodes && episodes.length > 0) {
                    setContentEpisodes(episodes);

                    // Find the last episode with a magnet link
                    const lastEpisodeWithMagnet = episodes.findLast(episode =>
                        episode?.magnet_torrent != undefined &&
                        episode?.magnet_torrent != null &&
                        episode?.magnet_torrent != ''
                    );

                    if (lastEpisodeWithMagnet) {
                        setSelectedEpisode(lastEpisodeWithMagnet.episodeId);
                    }
                }
            }
        } else {
            setmagnetTorrentSelected(content.magnet_torrent || '');
        }
    }, [content]); // Only re-run if content changes

    // Update episodes when selected season changes
    useEffect(() => {
        if (!content || !content.seasons || selectedSeason === null) return;

        const selectedSeasonData = content.seasons.find(season =>
            season.seasonId === selectedSeason
        );

        if (selectedSeasonData && selectedSeasonData.episodes && selectedSeasonData.episodes.length > 0) {
            setContentEpisodes(selectedSeasonData.episodes);

            if (selectedEpisode === null) {
                setSelectedEpisode(selectedSeasonData.episodes.findLast(episode => episode)?.episodeId || null);
            }

            setSelectedEpisode(contentEpisodes?.find(episode => episode.episodeId === selectedEpisode)?.episodeId || null);
            setmagnetTorrentSelected(contentEpisodes?.find(episode => episode.episodeId === selectedEpisode)?.magnet_torrent || '');
        } else {
            setContentEpisodes(null);
            setSelectedEpisode(null);
        }
    }, [selectedSeason, selectedEpisode, content, contentEpisodes]);

    const hasSeasons = content?.content_type === 'tv';
    const seasons = hasSeasons ? content.seasons : null;

    if (isLoading) {
        return <div className="container mx-auto px-4 py-16">Loading content...</div>
    }

    if (!content || !content.id) {
        return <div className="container mx-auto px-4 py-16">Content not found</div>
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md mb-6 transition-colors">
                ←   Back
            </button>

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
                <Image
                    alt={content.title}
                    src={`${process.env.NEXT_PUBLIC_URL_PATH}${content.backdrop_path}`}
                    width={800}
                    height={450}
                    className={`rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full h-full md:w-3/4`}
                />
                <p className="text-gray-400 mb-4">
                    {content.release_date} •
                    {/*content.genres?.join(' • ') || "Drama • Action"*/}
                </p>
                <p className="text-lg">
                    {content.overview || "No description available for this title."}
                </p>
            </div>

            <div className="mb-10 w-full h-full">
                <Player magnetTorrent={magnetTorrentSelected} />
            </div>

            {/* Season selection - only shown for TV shows with seasons */}
            {hasSeasons && (
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
                    <div className="flex flex-wrap gap-3">
                        {seasons && seasons.map(season => (
                            <button
                                key={season.seasonId}
                                className={`px-4 py-2 rounded-lg transition-colors ${selectedSeason === season.seasonId
                                    ? "bg-blue-900 border border-blue-500"
                                    : "bg-gray-800 hover:bg-gray-700"
                                    }`}
                                onClick={() => setSelectedSeason(season.seasonId)}
                            >
                                {`Season ${season.seasonId}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Resto do componente... */}
            {contentEpisodes && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contentEpisodes?.filter(episode => episode?.magnet_torrent != undefined && episode?.magnet_torrent != null && episode?.magnet_torrent != '').map(episode => (
                            <div
                                key={episode.episodeId}
                                className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedEpisode === episode.episodeId
                                    ? "bg-blue-900 border border-blue-500"
                                    : "bg-gray-800 hover:bg-gray-700"
                                    }`}
                                onClick={() => {
                                    setSelectedEpisode(episode.episodeId)
                                }}
                            >
                                <h3 className="font-semibold">{episode.title}</h3>
                                <p className="text-sm text-gray-300">{episode.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasSeasons && !contentEpisodes && (
                <div className="mb-8">
                    <p className="text-lg text-gray-400">No episodes available</p>
                </div>
            )}
        </main>
    )
}

// Componente principal que usa Suspense
export default function WatchPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-16">Loading...</div>}>
            <WatchPageContent />
        </Suspense>
    )
}