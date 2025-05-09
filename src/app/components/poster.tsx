import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface PosterProps {
  id: number;
  title: string;
  imageUrl: string;
  year: string | undefined;
  contentType: string;
}

const urlPoster = process.env.NEXT_PUBLIC_TMDB_POSTER_URL;
const Poster: React.FC<PosterProps> = ({ id, title, imageUrl, year, contentType }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>(urlPoster + imageUrl);
  const [imageError, setImageError] = useState<boolean>(false);


  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col w-80 items-center">
        <div className="flex flex-col items-center justify-center">
          <a href={`/watch?content=${contentType}&id=${id}`}>
            <div className="relative">
              <Image
                src={imageUrl ? imageSrc : '/notfound.png'}
                alt={title}
                width={imageError ? 50 : 500}
                height={imageError ? 50 : 750}
                className={`rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ${imageError ? 'opacity-50' : ''}`}
                onLoad={handleImageLoad}
                loading="lazy"
                placeholder="blur"
                blurDataURL="/placeholder.png"
                onError={(e) => (e.currentTarget.src = '/notfound.png')}
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