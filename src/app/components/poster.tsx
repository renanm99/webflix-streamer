import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface PosterProps {
  id: number;
  title: string;
  imageUrl: string;
  year: string | undefined;
}

const urlPoster = process.env.NEXT_PUBLIC_TMDB_POSTER_URL;
const Poster: React.FC<PosterProps> = ({ id, title, imageUrl, year }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>(urlPoster + imageUrl);
  const [imageError, setImageError] = useState<boolean>(false);

  // Function to handle image loading errors
  const handleImageError = () => {
    setImageError(true);
    setIsLoading(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col w-80 items-center">
        <div className="flex flex-col items-center justify-center">
          <a href={'/watch?id=' + id}>
            <div className="relative">
              <Image
                src={imageSrc}
                alt={title}
                width={imageError ? 50 : 500}
                height={imageError ? 50 : 750}
                className={`rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ${imageError ? 'opacity-50' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          </a>
          <h2 className="mt-3 text-lg text-center font-semibold">{title}</h2>
          <p className="text-gray-400">{year?.substring(0, 4)}</p>
        </div>
      </div>
    </>
  );
};

export default Poster;