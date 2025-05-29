'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import Player from '../components/player'
import Footer from '../components/footer'
import Header from '../components/header'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { GetMovieById, GetTVById, GetTVSeasonsDetailsById, GetMagnetLink } from "@/../repo/tmdbApi";
import { MovieById, TVById, TVSeasonDetails } from "@/../repo/models/movie";
import Loading from '../components/loading';
import Router from 'next/router';

function WatchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [content, setContent] = useState<MovieById | TVById>({} as (MovieById | TVById));
    const [contentEpisodes, setContentEpisodes] = useState<TVSeasonDetails>({} as TVSeasonDetails);
    const [selectedSeason, setSelectedSeason] = useState<number>(0);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(0);
    const [contentMagnetLink, setcontentMagnetLink] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);
    const playerRef = useRef<HTMLDivElement>(null);
    const EpisodesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleBeforeUnload = (event: any) => {
        setcontentMagnetLink("")
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, []); 

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const contentType = searchParams?.get('content')?.toString();
                const id = parseInt(searchParams?.get('id') || '', 10);
                if (contentType === 'movie') {
                    const movie = await GetMovieById(id);
                    if (movie.id !== content.id) {
                        setContent(movie);
                    }
                    const magnetLink = await GetMagnetLink(id);
                    if (magnetLink !== contentMagnetLink) {
                        setcontentMagnetLink(magnetLink);
                    }
                } else {
                    const tvShow = await GetTVById(id);
                    if (tvShow.id !== content.id) {
                        setContent(tvShow);
                    }
                }
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };
        fetchMovie();
    }, [searchParams]);

    useEffect(() => {
        if (content.id) {
            setIsLoading(false);
        }
        if (contentEpisodes.id) {
            setIsLoadingEpisodes(false);
        }
    }, [content, contentEpisodes]);

    useEffect(() => {
        const fetchMagnetLink = async () => {
            try {
                const contentType = searchParams?.get('content')?.toString();
                if (contentType === 'tv' && content.id && selectedSeason > 0) {
                    const episodes = await GetTVSeasonsDetailsById(content.id, selectedSeason);
                    if (episodes.id !== contentEpisodes.id) {
                        setContentEpisodes(episodes);
                    }
                    if (selectedSeason > 0 && selectedEpisode > 0) {
                        const magnetLink = await GetMagnetLink(content.id, selectedSeason, selectedEpisode);
                        if (magnetLink !== contentMagnetLink) {
                            setcontentMagnetLink(magnetLink);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching magnet link:', error);
            }
        };

        fetchMagnetLink();
    }, [selectedSeason, selectedEpisode, content]);



    if (isLoading) {
        return (
            <div className="">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-xl">Loading content...</p>
                </div>
            </div>
        );
    }

    if ((!content.id) && !isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md">
                    <div className="text-5xl mb-6">🎬</div>
                    <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
                    <p className="text-gray-400 mb-6">We couldn&apos;t find what you&apos;re looking for.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const scrollToEpisodes = () => {
        setTimeout(() => {
            if (EpisodesRef.current) {
                EpisodesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200)
    };

    const scrollToPlayer = () => {
        setTimeout(() => {
            if (playerRef.current) {
                playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200)
    };

    const handleSeasonClick = async (seasonNumber: number) => {
        setSelectedSeason(seasonNumber);
        setIsLoadingEpisodes(true);
        setSelectedEpisode(0);
        scrollToEpisodes();
    }

    const handleEpisodeClick = (episode_number: number) => {
        setcontentMagnetLink('');
        setSelectedEpisode(episode_number);
        scrollToPlayer();
    }





    return (

        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Header onSearch={() => { }} />
            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 mb-6 shadow-md hover:shadow-lg flex items-center"
                >
                    <span className="mr-2">←</span> Back
                </button>

                {/* Content Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{('title' in content) ? content.title : content.name}</h1>
                    {content.tagline && <p className="italic text-blue-400 mb-4">&quot;{content.tagline}&quot;</p>}

                    <div className="relative w-full md:w-3/4 mb-6">
                        <Image
                            alt={('title' in content) ? content.title : content.name}
                            src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${content.backdrop_path}`}
                            width={800}
                            height={450}
                            priority
                            className="rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 w-full"
                            placeholder="blur"
                            blurDataURL="/placeholder.png"
                            onError={(e) => (e.currentTarget.src = '/notfound.png')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                    </div>

                    <p className="text-lg text-gray-300 leading-relaxed mb-4">
                        {content.overview || "No description available for this title."}
                    </p>

                    <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                        {!('title' in content) && content.number_of_seasons > 1 ? <span>Release Date: <strong>{content.first_air_date}</strong></span> : <></>}
                        {!('title' in content) && content.number_of_seasons > 1 ? <span>Last Season Release Date: <strong>{content.last_air_date}</strong></span> : !('title' in content) ? <span>Release Date: <strong>{content.last_air_date}</strong></span> : <></>}
                        {('title' in content) ? <span>Release Date: <strong>{content.release_date}</strong></span> : <></>}
                        <span>Status: <strong>{content.status}</strong></span>
                        {('title' in content) ? <span>Runtime: <strong>{content.runtime ? `${content.runtime} min` : <>&quot;N/A&quot;</>}</strong></span> : <></>}
                        {('title' in content) ? <span>Budget: <strong>${content.budget.toLocaleString()}</strong></span> : <></>}
                        <span>Vote Average: <strong>{content.vote_average.toFixed(1)}</strong></span>
                    </div>
                </div>

                {/* Belongs to Collection */}
                {('title' in content) && content.belongs_to_collection && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Part of the Collection</h2>
                        <div className="flex items-center gap-4">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_TMDB_POSTER_URL}${content.belongs_to_collection.poster_path}`}
                                alt={content.belongs_to_collection.name}
                                width={100}
                                height={150}
                                className="rounded-md shadow-md"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="/placeholder.png"
                                onError={(e) => (e.currentTarget.src = '/notfound.png')}
                            />
                            <div>
                                <h3 className="text-lg font-bold">{content.belongs_to_collection.name}</h3>
                            </div>
                        </div>
                    </div>
                )}


                {/* Genres */}
                {content.genres && content.genres.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Genres</h2>
                        <div className="flex flex-wrap gap-3">
                            {content.genres.map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Networks */}
                {!('title' in content) && content.networks && content.networks.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Networks</h2>
                        <div className="relative bg-gray-800/50 backdrop-blur-md p-6 rounded-lg shadow-lg">
                            <div className="flex flex-wrap gap-6">
                                {content.networks.map((network) => (
                                    <div key={network.id} className="flex items-center gap-3">
                                        {network.logo_path && (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_TMDB_POSTER_URL}${network.logo_path}`}
                                                alt={network.name}
                                                width={50}
                                                height={50}
                                                className="rounded-md"
                                                loading="lazy"
                                                placeholder="blur"
                                                blurDataURL="/placeholder.png"
                                                onError={(e) => (e.currentTarget.src = '/notfound.png')}
                                            />
                                        )}
                                        <span className="text-gray-300">{network.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Production Companies */}
                {content.production_companies && content.production_companies.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Production Companies</h2>
                        <div className="relative bg-gray-800/50 backdrop-blur-md p-6 rounded-lg shadow-lg">
                            <div className="flex flex-wrap gap-6">
                                {content.production_companies.map((company) => (
                                    <div key={company.id} className="flex items-center gap-3">
                                        {company.logo_path && (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_TMDB_POSTER_URL}${company.logo_path}`}
                                                alt={company.name}
                                                width={50}
                                                height={50}
                                                className="rounded-md"
                                                loading="lazy"
                                                placeholder="blur"
                                                blurDataURL="/placeholder.png"
                                                onError={(e) => (e.currentTarget.src = '/notfound.png')}
                                            />
                                        )}
                                        <span className="text-gray-300">{company.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Spoken Languages */}
                {content.spoken_languages && content.spoken_languages.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Spoken Languages</h2>
                        <div className="flex flex-wrap gap-3">
                            {content.spoken_languages.map((language) => (
                                <span
                                    key={language.iso_639_1}
                                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm"
                                >
                                    {language.english_name}
                                </span>
                            ))}
                        </div>
                    </div>
                )
                }

                {/* Seasons */}
                {!('title' in content) && content.seasons && content.seasons.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
                        <div className="flex flex-wrap gap-6">
                            {content.seasons.map((season) => (
                                <button
                                    key={season.id}
                                    onClick={() => handleSeasonClick(season.season_number)}
                                    className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                                >
                                    <Image
                                        src={season.poster_path ? `${process.env.NEXT_PUBLIC_TMDB_POSTER_URL}${season.poster_path}` : '/notfound.png'}
                                        alt={season.name}
                                        width={150}
                                        height={225}
                                        className="rounded-md shadow-md"
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL="/placeholder.png"
                                        onError={(e) => (e.currentTarget.src = '/notfound.png')}
                                    />
                                    <span className="text-gray-300 mt-2">{season.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Episodes */}
                <div ref={EpisodesRef} className="h-1"></div>
                {isLoadingEpisodes && selectedSeason > 0 && (<Loading text='Loading Season...' />)}
                {!('title' in content) && contentEpisodes.episodes && contentEpisodes.episodes.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Episodes</h2><div className="flex flex-col gap-6">
                            {contentEpisodes.episodes.map((episode) => (
                                <button
                                    key={episode.id}
                                    onClick={() => handleEpisodeClick(episode.episode_number)}
                                    className={`flex items-start gap-4 text-left ${episode.episode_number === selectedEpisode
                                        ? 'bg-gray-700/50 border-l-4 border-blue-500'
                                        : 'bg-gray-800/10'
                                        } hover:bg-gray-700/30 p-4 rounded-lg transition-colors`}
                                >
                                    <Image
                                        src={episode.still_path ? `${process.env.NEXT_PUBLIC_TMDB_POSTER_URL}${episode.still_path}` : '/notfound.png'}
                                        alt={episode.name}
                                        width={150}
                                        height={100}
                                        className="rounded-md shadow-md"
                                        loading="lazy"
                                        onError={(e) => (e.currentTarget.src = '/notfound.png')}
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold">{episode.name}</h3>
                                        <p className="text-gray-400 text-sm">Date: {episode.air_date}</p>
                                        <p className="text-gray-300">{episode.overview}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-10 w-full">
                    {(!('title' in content) && selectedEpisode == 0) ? <></> : (('title' in content && new Date(content.release_date) <= new Date()) ||
                        (!('title' in content) && new Date(content.first_air_date) <= new Date())) && (
                            <div className="w-full">
                                <h2 className="text-2xl font-semibold mb-4">Watch Now</h2>
                                <div className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-black mx-auto" style={{ paddingBottom: '46.25%' }}>
                                    {contentMagnetLink === '' ? (
                                        <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
                                            <Loading text="Fetching content..." />
                                        </div>
                                    ) : (
                                        <div className="absolute top-0 left-0 w-full h-full">
                                            <Player magnetTorrent={contentMagnetLink} tmdb_id={content.id} season={!('title' in content) ? selectedSeason : 0} episode={!('title' in content) ? selectedEpisode : 0} />
                                        </div>

                                    )}
                                </div>
                            </div>
                        )}
                </div>

                <Footer />
                <div ref={playerRef} className="h-1" />

            </main >
        </div >
    );
}

// Main component with Suspense
export default function WatchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-xl">Loading content...</p>
                </div>
            </div>
        }>
            <WatchPageContent />
        </Suspense>
    );
}
