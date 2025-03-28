'use client'
import { useEffect, useState, Suspense } from 'react'

import Poster from '@/app/components/poster'
import Header from '@/app/components/header'
import Loading from '@/app/components/loading'
import Footer from '@/app/components/footer'
import { GetPopular } from "@/../repo/tmdbApi";
import { Movie } from "@/../repo/models/movie";

export default function MoviesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [fetchPage, setFetchPage] = useState(1);

    // Remove duplicates based on movie id
    const removeDuplicates = (movies: Movie[]): Movie[] => {
        const uniqueIds = new Set();
        return movies.filter(movie => {
            if (uniqueIds.has(movie.id)) {
                return false;
            }
            uniqueIds.add(movie.id);
            return true;
        });
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const movies = await GetPopular(fetchPage);
                setPopularMovies(prevMovies => {
                    const newMovies = [...prevMovies, ...movies];
                    return removeDuplicates(newMovies);
                });
                setFetchPage(prevPage => prevPage + 1);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Handle search input changes
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Handle loading more movies
    const handleLoadMore = () => {
        const fetchMovies = async () => {
            try {
                setIsLoadingMore(true);
                const movies = await GetPopular(fetchPage);

                setPopularMovies(prevMovies => {
                    const newMovies = [...prevMovies, ...movies];
                    return removeDuplicates(newMovies);
                });
                setFetchPage(prevPage => prevPage + 1);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }

        fetchMovies();
    };

    // Filter movies based on search query
    const filteredMovies = popularMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Header onSearch={handleSearch} />

            <main className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <h1 className="text-3xl font-bold mb-6 text-center">
                    {searchQuery ? 'Search Results' : 'Trending Movies'}
                </h1>

                {/* Search Results Message */}
                {searchQuery && (
                    <p className="text-center text-gray-400 mb-6">
                        Showing results for &quot;{searchQuery}&quot;
                    </p>
                )}

                {/* Content Section */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loading />
                    </div>
                ) : filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredMovies.map((result) => (
                            <div key={result.id} className="flex justify-center">
                                <Poster
                                    id={result.id}
                                    title={result.title}
                                    imageUrl={result.poster_path}
                                    year={result.release_date ? result.release_date : result.first_air_date}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-5xl mb-6">🎬</div>
                        <p className="text-xl text-gray-400 text-center max-w-md">
                            {searchQuery
                                ? `No movies found matching "${searchQuery}"`
                                : `Well... this is awkward. We couldn't find any movies. But don't worry, we're working on it!`
                            }
                        </p>
                    </div>
                )}

                {/* Loading More Indicator */}
                {isLoadingMore && (
                    <div className="flex justify-center mt-8">
                        <Loading />
                    </div>
                )}

                {/* Load More Button */}
                {!isLoading && filteredMovies.length > 0 && (
                    <div className="flex justify-center mt-10">
                        <button
                            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center min-w-[200px] disabled:bg-gray-700 disabled:text-gray-400"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? 'Loading...' : 'Load More Movies'}
                        </button>
                    </div>
                )}
            </main>


            <Footer />
        </div>
    )
}