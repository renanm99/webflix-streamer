'use client'

import { useEffect, useState, Suspense } from 'react'
import Player from '../components/player'
import { repo } from '@/../repo/db'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

// Componente separado que usa useSearchParams
function WatchPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const id = parseInt(searchParams?.get('id') || '', 10)
    const content = repo.movies.find(movie => movie.id === id)

    //seasons
    const hasSeasons = content?.content_type === 'tv' && content?.seasons?.length > 0;
    const seasons = hasSeasons ? content?.seasons : null;
    const [selectedSeason, setSelectedSeason] = useState(hasSeasons ? seasons?.findLast(season => season?.episodes?.length > 0)?.seasonId : null);

    const [contentEpisodes, setcontentEpisodes] = useState(seasons ? seasons?.findLast(season => season?.episodes?.length > 0)?.episodes : null);
    const [selectedEpisode, setSelectedEpisode] = useState(seasons ? seasons?.findLast(season => season?.episodes?.length > 0)?.episodes?.findLast(episode => episode?.magnet_torrent != undefined && episode?.magnet_torrent != null && episode?.magnet_torrent != '')?.episodeId : null);


    useEffect(() => {
        let episodes = hasSeasons ? content?.seasons?.find(season => season.seasonId === selectedSeason)?.episodes : null;
        if (episodes && episodes.length > 0) {
            setcontentEpisodes(episodes)
            setSelectedEpisode(episodes?.findLast(episode => episode?.magnet_torrent != undefined && episode?.magnet_torrent != null && episode?.magnet_torrent != '')?.episodeId)
        } else {
            setSelectedEpisode(null)
        }
    }, [selectedSeason, hasSeasons, content])

    if (!content) {
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
                <Player id={id} seasonId={selectedEpisode ? selectedSeason : null} episodeId={selectedEpisode} />
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

            {/* Seção "Mais como este" */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">More Like This</h2>
                <div className="flex flex-wrap justify-center gap-14">
                    {repo.movies
                        .filter(movie => {
                            if ((movie.magnet_torrent != undefined && movie.magnet_torrent != null && movie.magnet_torrent != '') || (movie.content_type == 'tv' && movie.seasons?.length > 0) && movie.id !== id && (movie.original_title?.toLowerCase().split(' ').some(title => content.original_title?.toLowerCase().includes(title)) || movie.genre_ids?.some(genre => content.genre_ids?.includes(genre)))) {
                                return movie;
                            }
                            return false;
                        })
                        .slice(0, 4)
                        .map(movie => (
                            <div key={movie.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
                                <a href={`/watch?id=${movie.id}`} className="block">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_URL_PATH}${movie.poster_path}`}
                                        alt={movie.title}
                                        width={500}
                                        height={750}
                                        className="w-full h-auto rounded-lg hover:opacity-75 transition-opacity"
                                    />
                                    <h3 className="mt-2 font-medium">{movie.title}</h3>
                                </a>
                            </div>
                        ))}
                </div>
            </div>
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