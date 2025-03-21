'use client'

import { useEffect, useRef, useState } from 'react'

import Poster from './components/poster'
import Header from './components/header'
import { repo } from '../../repo/db'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter movies based on search query
  const filteredMovies = repo.movies.filter(movie => {
    if ((movie.magnet_torrent != undefined && movie.magnet_torrent != null && movie.magnet_torrent != '') || (movie.content_type == 'tv' && movie.seasons.length > 0)) {
      return movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
  }).sort((a, b) => {
    // Get release dates, using fallbacks if undefined
    const dateA = a.content_type === 'tv' ? a.first_air_date : a.release_date;
    const dateB = b.content_type === 'tv' ? b.first_air_date : b.release_date;

    // Default dates if undefined
    const timeA = dateA ? new Date(dateA).getTime() : 0;
    const timeB = dateB ? new Date(dateB).getTime() : 0;

    return timeB - timeA; // Sort descending (newest first)
  });

  // Handle search input changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-6 pb-8">
        {searchQuery && (
          <p className="text-center text-gray-400 mb-4">
            Showing results for &quot;{searchQuery}&quot;
          </p>
        )}
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
        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No movies found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}

      </main>
    </>
  )
}