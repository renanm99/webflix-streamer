'use client'
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import Loading from '@/app/components/loading';
import { transformSrtTracks } from 'srt-support-for-html5-videos';

interface PlayerProps {
  magnetTorrent: string;
}

const Player: React.FC<PlayerProps> = ({ magnetTorrent }) => {
  const streamUrl = '/api/stream/' + magnetTorrent;
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState('Loading stream...');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !streamUrl) {
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

    fetchSubtitles(video);

    video.src = streamUrl;
    video.addEventListener('canplay', eventHandler);

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    //transformSrtTracks(video);

    video.addEventListener('waiting', () => setIsLoading(true));
    video.addEventListener('playing', () => setIsLoading(false));
    return () => {
      video.removeEventListener('canplay', eventHandler);
      video.removeEventListener('waiting', () => setIsLoading(true));
      video.removeEventListener('playing', () => setIsLoading(false));
    };

  }, [magnetTorrent]);

  const fetchSubtitles = async (video: HTMLVideoElement) => {
    try {
      const response = await fetch('/api/subtitles');
      if (!response.ok) {
        throw new Error('Failed to fetch subtitles');
      }

      const subtitles = await response.json();

      const existingTracks = video.querySelectorAll('track');

      if (existingTracks.length == 0) {
        subtitles.forEach((subtitle: { lang: string; content: string }) => {
          const blob = new Blob([subtitle.content], { type: 'text/srt' });
          const blobUrl = URL.createObjectURL(blob);

          const track = document.createElement('track');
          track.src = blobUrl;
          track.label = subtitle.lang === 'en' ? 'English' : 'Portuguese';
          track.kind = 'subtitles';
          track.srclang = subtitle.lang;

          video.appendChild(track);

          // Clean up the blob URL after use
          track.addEventListener('load', () => {
            URL.revokeObjectURL(blobUrl);
          }
          );
          track.addEventListener('error', () => {
            console.error('Error loading track:', track);
          }
          );
        });

        // Apply subtitle transformation
        transformSrtTracks(video);
      }
    } catch (error) {
      console.error('Error fetching subtitles:', error);
      setLoadingState('Error loading subtitles');
    }
  };

  return (
    <div>
      {isLoading && <Loading text={loadingState} />}
      {
        <video
          src={streamUrl}
          ref={videoRef}
          controlsList="nodownload"
          controls
          autoPlay={true}
          muted
          playsInline
          className={`w-full h-full border border-gray-800 rounded-lg bg-black ${isLoading ? 'hidden' : 'block'
            }`}
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
        </video>
      }
    </div>
  );
};

export default Player;