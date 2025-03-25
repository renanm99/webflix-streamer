'use client'
import { useEffect, useState, Suspense } from 'react'

import Poster from './components/poster'
import Header from './components/header'
import Loading from './components/loading'
//import { repo } from '../../repo/db'
import { GetAllMovies } from "@/../repo/dbHandler";
import { Movie } from "@/../repo/models/movie";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mongoMovies, setMongoMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await GetAllMovies();
        setMongoMovies(movies);
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

  // Filter movies based on search query
  const filteredMovies = mongoMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-6 pb-8">
        {searchQuery && (
          <p className="text-center text-gray-400 mb-4">
            Showing results for &quot;{searchQuery}&quot;
          </p>
        )}

        {isLoading ? (
          <Loading />
        ) : filteredMovies.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-10 w-full">
            {filteredMovies.map((result) => (
              <Poster
                key={result.id}
                id={result.id}
                title={result.title}
                imageUrl={result.poster_path}
                year={result.release_date ? result.release_date : result.first_air_date}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              {searchQuery
                ? `No movies found matching "${searchQuery}"`
                :
                `Well... This is awkward. We couldn't find any movies.&apos;But don't worry, we're working on it!`
              }
            </p>
          </div>
        )}
      </main>
    </>
  )
}