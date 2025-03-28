'use client'

import { useEffect, useState, Suspense } from 'react'
import Player from '../components/player'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

import { GetById } from "@/../repo/tmdbApi";
import { MovieById } from "@/../repo/models/movie";

function WatchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [content, setContent] = useState<MovieById>({} as MovieById);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the movie/show data
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const id = parseInt(searchParams?.get('id') || '', 10);
                const movie = await GetById(id);
                setContent(movie);
            } catch (error) {
                console.error('Error fetching content:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovie();
    }, [searchParams]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-xl">Loading content...</p>
                </div>
            </div>
        );
    }

    if (!content || !content.id) {
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
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
                    <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
                    {content.tagline && <p className="italic text-blue-400 mb-4">&quot;{content.tagline}&quot;</p>}

                    <div className="relative w-full md:w-3/4 mb-6">
                        <Image
                            alt={content.title}
                            src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${content.backdrop_path}`}
                            width={800}
                            height={450}
                            className="rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 w-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                    </div>

                    <p className="text-lg text-gray-300 leading-relaxed mb-4">
                        {content.overview || "No description available for this title."}
                    </p>

                    <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                        <span>Release Date: <strong>{content.release_date}</strong></span>
                        <span>Status: <strong>{content.status}</strong></span>
                        <span>Runtime: <strong>{content.runtime ? `${content.runtime} min` : <>&quot;N/A&quot;</>}</strong></span>
                        <span>Budget: <strong>${content.budget.toLocaleString()}</strong></span>
                        <span>Vote Average: <strong>{content.vote_average.toFixed(1)}</strong></span>
                        <span>Vote Count: <strong>{content.vote_count}</strong></span>
                    </div>
                </div>

                {/* Belongs to Collection */}
                {content.belongs_to_collection && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Part of the Collection</h2>
                        <div className="flex items-center gap-4">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_TMDB_POSTER_URL}${content.belongs_to_collection.poster_path}`}
                                alt={content.belongs_to_collection.name}
                                width={100}
                                height={150}
                                className="rounded-md shadow-md"
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
                                            />
                                        )}
                                        <span className="text-gray-300">{company.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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
                )}
                {/*"magnet:?xt=urn:btih:1a6a0d3c790e574aa6bfa347cfe77674feae9c75&dn=Sonic The Hedgehog 3 (2024) [720p] [BluRay] [YTS.MX]&tr=udp://tracker.opentrackr.org:1337&tr=udp://explodie.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://open.stealth.si:80/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=udp://tracker.dler.org:6969/announce&tr=udp://ipv4.tracker.harry.lu:80/announce&tr=udp://zephir.monocul.us:6969/announce&tr=http://open.acgtracker.com:1096/announce&tr=http://t.nyaatracker.com:80/announce&tr=udp://retracker.lanta-net.ru:2710/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://opentracker.i2p.rocks:6969/announce&tr=udp://47.ip-51-68-199.eu:6969/announce&tr=udp://tracker.cyberia.is:6969/announce&tr=udp://uploads.gamecoast.net:6969/announce&tr=https://tracker.foreverpirates.co:443/announce&tr=udp://9.rarbg.to:2760&tr=udp://tracker.slowcheetah.org:14770&tr=udp://tracker.tallpenguin.org:15800&tr=udp://9.rarbg.to:2710/announce&tr=udp://opentor.org:2710"*/}
                <div className="mb-10 w-full h-full">
                    <h2 className="text-2xl font-semibold mb-4">Watch Now</h2>

                    <div className="rounded-xl overflow-hidden shadow-2xl bg-black mx-auto">
                        <Player magnetTorrent={content.magnet_torrent || "magnet:?xt=urn:btih:1a6a0d3c790e574aa6bfa347cfe77674feae9c75&dn=Sonic The Hedgehog 3 (2024) [720p] [BluRay] [YTS.MX]&tr=udp://tracker.opentrackr.org:1337&tr=udp://explodie.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://open.stealth.si:80/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=udp://tracker.dler.org:6969/announce&tr=udp://ipv4.tracker.harry.lu:80/announce&tr=udp://zephir.monocul.us:6969/announce&tr=http://open.acgtracker.com:1096/announce&tr=http://t.nyaatracker.com:80/announce&tr=udp://retracker.lanta-net.ru:2710/announce&tr=udp://tracker.uw0.xyz:6969/announce&tr=udp://opentracker.i2p.rocks:6969/announce&tr=udp://47.ip-51-68-199.eu:6969/announce&tr=udp://tracker.cyberia.is:6969/announce&tr=udp://uploads.gamecoast.net:6969/announce&tr=https://tracker.foreverpirates.co:443/announce&tr=udp://9.rarbg.to:2760&tr=udp://tracker.slowcheetah.org:14770&tr=udp://tracker.tallpenguin.org:15800&tr=udp://9.rarbg.to:2710/announce&tr=udp://opentor.org:2710"} />
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center py-6 text-gray-500 text-sm mt-12 border-t border-gray-800">
                    <p>© {new Date().getFullYear()} WebFlix Streamer. All rights reserved.</p>
                </footer>
            </main>
        </div>
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