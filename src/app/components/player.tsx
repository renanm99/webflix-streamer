'use client'
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import Loading from '@/app/components/loading';

interface PlayerProps {
  magnetTorrent: string;
  tmdb_id: number;
  season: number;
  episode: number;
}

interface Subtitle {
  language: string;
  content: string
}

const Player: React.FC<PlayerProps> = ({ magnetTorrent, tmdb_id, season, episode }) => {
  const streamUrl = '/api/stream/' + magnetTorrent;
  const [trackSubtitles, setTrackSubtitles] = useState<Subtitle[]>([] as Subtitle[]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState('Loading stream...');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initVideo = async () => {
      if (!videoRef.current || !magnetTorrent) {
        if (streamUrl === '/api/stream/' + '') {
          setLoadingState('No torrents to stream');
        } else {
          setLoadingState('Error loading stream');
        }
        return;
      }

      const video = videoRef.current;

      const eventHandler = () => {
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .catch((error) => {
              console.log('Autoplay prevented by browser:', error);
            })
            .finally(() => {
              console.log('Autoplay started');
              setIsLoading(false);
            });
        }
      };

      await fetchSubtitles(video)

      video.src = streamUrl;
      video.addEventListener('canplay', eventHandler);

      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      //await transformSrtTracks(video);
      //video.addEventListener('waiting', () => setIsLoading(true));
      video.addEventListener('playing', () => setIsLoading(false));
      return () => {
        video.removeEventListener('canplay', eventHandler);
        //video.removeEventListener('waiting', () => setIsLoading(true));
        video.removeEventListener('playing', () => setIsLoading(false));
      };
    }
    initVideo();
  }, [magnetTorrent]);

  const fetchSubtitles = async (video: HTMLVideoElement) => {
    try {

      const queryParams = new URLSearchParams({
        tmdb_id: tmdb_id.toString(),
        season: season.toString(),
        episode: episode.toString(),
      });

      if (season === 0 && episode === 0) {
        queryParams.delete('season');
        queryParams.delete('episode');
      }

      const response = await fetch(`/api/subtitles?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 204) {
        return
      }

      const subtitles = await response.json();

      console.log('subtitles:', subtitles);

      await setTrackSubtitles(subtitles);

      // Apply subtitle transformation
      //await transformSrtTracks(video);

    } catch (error) {
      console.error('Error fetching subtitles:', error);
      setLoadingState('Error loading subtitles');
    }
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-70">
          <Loading text={loadingState} />
        </div>
      )}
      <video
        src={streamUrl}
        ref={videoRef}
        controlsList="nodownload"
        controls
        autoPlay={true}
        muted
        playsInline
        className="w-full h-full rounded-lg bg-black"
        onCanPlay={(e) => {
          e.currentTarget
            .play()
            .catch((err) => console.log('Autoplay failed:', err));
          e.currentTarget.muted = false;
        }}
        onError={(e) => {
          e.currentTarget.pause();
          e.currentTarget.src = '';
          setLoadingState('Error loading stream');
        }}
      >
        {trackSubtitles.length > 0 && trackSubtitles.map((subtitles) => (
          <track
            key={subtitles.language}
            src={`/api/subtitle-proxy?url=${subtitles.content}`}
            label={subtitles.language}
            kind="subtitles"
            srcLang={subtitles.language}
          />
        ))}
      </video>
    </div>
  );
};

export default Player;