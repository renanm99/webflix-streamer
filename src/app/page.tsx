'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import Image from 'next/image'
import Poster from '@/app/components/poster'
import Header from '@/app/components/header'
import Loading from '@/app/components/loading'
import Footer from '@/app/components/footer'
import { GetPopular, GetTVPopular } from "@/../repo/tmdbApi"
import { Movie, TV } from "@/../repo/models/movie"

type ContentType = 'movies' | 'tv';

export default function ExplorePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentType>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<TV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const [featuredContent, setFeaturedContent] = useState<Movie | TV | null>(null);
  const [featuredItems, setFeaturedItems] = useState<(Movie | TV)[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Helper function to remove duplicates
  const removeDuplicates = <T extends { id: number }>(items: T[]): T[] => {
    const uniqueIds = new Set();
    return items.filter(item => {
      if (uniqueIds.has(item.id)) {
        return false;
      }
      uniqueIds.add(item.id);
      return true;
    });
  };

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await GetPopular(moviePage);

        if (moviePage === 1 && movies.length > 0) {
          // Select up to 5 movies with backdrops for the carousel
          const moviesWithBackdrops = movies.filter(movie => movie.backdrop_path).slice(0, 5);
          setFeaturedItems(moviesWithBackdrops);
        }

        setPopularMovies(prevMovies => {
          const newMovies = [...prevMovies, ...movies.slice(5)];
          return removeDuplicates(newMovies);
        });

      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    if (activeTab === 'movies') {
      fetchMovies();
    }
  }, [moviePage, activeTab]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === featuredItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredItems.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide]);

  // Fetch TV shows
  useEffect(() => {
    const fetchTV = async () => {
      try {
        const shows = await GetTVPopular(tvPage);
        if (tvPage === 1 && shows.length > 0) {
          // Select up to 5 TV shows with backdrops for the carousel
          const showsWithBackdrops = shows.filter(show => show.backdrop_path).slice(0, 5);
          setFeaturedItems(showsWithBackdrops); // Set the featured items for the carousel
        }


        setPopularTV(prevShows => {
          const newShows = [...prevShows, ...shows.slice(5)];
          return removeDuplicates(newShows);
        });
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    if (activeTab === 'tv') {
      fetchTV();
    }
  }, [tvPage, activeTab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset to first page when searching
    if (activeTab === 'movies') {
      setMoviePage(1);
      setPopularMovies([]);
    } else {
      setTvPage(1);
      setPopularTV([]);
    }
    setIsLoading(true);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    if (activeTab === 'movies') {
      setMoviePage(prev => prev + 1);
    } else {
      setTvPage(prev => prev + 1);
    }
  };

  const handleTabChange = (tab: ContentType) => {
    setActiveTab(tab);
    setIsLoading(true);
    setCurrentSlide(0); // Reset to first slide when changing tabs

    // Clear featuredItems when switching tabs to prevent brief display of wrong content
    setFeaturedItems([]);
  };

  const filteredContent = activeTab === 'movies'
    ? popularMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : popularTV.filter(show =>
      show.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header onSearch={() => { }} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section Carousel */}
        {featuredItems.length > 0 && !searchQuery && (
          <div className="relative w-full h-[40vh] mb-12 rounded-xl overflow-hidden">
            {/* Carousel Items */}
            {featuredItems.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_TMDB_BACKDROP_URL}${item.backdrop_path}`}
                  alt={('title' in item) ? item.title : item.name}
                  fill
                  className="object-cover object-top"
                  priority={index === currentSlide}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h1 className="text-4xl font-bold mb-2">
                    {('title' in item) ? item.title : item.name}
                  </h1>
                  <p className="text-gray-300 line-clamp-2 max-w-2xl mb-6">
                    {item.overview}
                  </p>
                  <button
                    onClick={() => router.push(`/watch?id=${item.id}&content=${activeTab === 'movies' ? 'movie' : 'tv'}`)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 font-bold"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              className="absolute top-1/2 left-4 z-20 p-2 bg-black/50 text-white rounded-full transform -translate-y-1/2 hover:bg-black/70 transition-all"
              onClick={prevSlide}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              className="absolute top-1/2 right-4 z-20 p-2 bg-black/50 text-white rounded-full transform -translate-y-1/2 hover:bg-black/70 transition-all"
              onClick={nextSlide}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-blue-500 w-6' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-full p-1 inline-flex">
            <button
              onClick={() => handleTabChange('movies')}
              className={`px-8 py-2 rounded-full font-medium transition-all ${activeTab === 'movies'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
                }`}
            >
              Movies
            </button>
            <button
              onClick={() => handleTabChange('tv')}
              className={`px-8 py-2 rounded-full font-medium transition-all ${activeTab === 'tv'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
                }`}
            >
              TV Shows
            </button>
          </div>
        </div>

        {/* Page Title */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : activeTab === 'movies'
              ? 'Popular Movies'
              : 'Popular TV Shows'
          }
        </h2>

        {/* Content Grid */}
        {isLoading && !isLoadingMore ? (
          <div className="flex justify-center items-center py-20">
            <Loading />
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="flex justify-center">
                <Poster
                  id={item.id}
                  title={'title' in item ? item.title : item.name}
                  imageUrl={item.poster_path}
                  year={'release_date' in item ? item.release_date : item.first_air_date}
                  contentType={activeTab === 'movies' ? 'movie' : 'tv'}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-6">🎬</div>
            <p className="text-xl text-gray-400 text-center max-w-md">
              {searchQuery
                ? `No ${activeTab === 'movies' ? 'movies' : 'TV shows'} found matching "${searchQuery}"`
                : `No ${activeTab === 'movies' ? 'movies' : 'TV shows'} available at the moment.`
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
        {!isLoading && filteredContent.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center min-w-[250px] disabled:bg-gray-700 disabled:text-gray-400"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore
                ? 'Loading...'
                : `Load More ${activeTab === 'movies' ? 'Movies' : 'TV Shows'}`
              }
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}