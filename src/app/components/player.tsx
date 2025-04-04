'use client'
import React from 'react';
import { useEffect, useRef, useState } from 'react'
import Loading from '@/app/components/loading';

interface PlayerProps {
  magnetTorrent: string;
}

const Player: React.FC<PlayerProps> = ({ magnetTorrent }) => {
  const [streamUrl, setStreamUrl] = useState('/api/stream/' + magnetTorrent);
  const [isLoading, setIsLoading] = useState(true)
  const [loadingState, setLoadingState] = useState('Loading stream...')
  const videoRef = useRef<HTMLVideoElement>(null);

  const [subtitles, setSubtitles] = useState([
    { label: "Off", value: "off", default: true },
    {
      label: "English",
      value: "en",
      src: "/subtitles/english.vtt",
      language: "en"
    },
    {
      label: "Spanish",
      value: "es",
      src: "/subtitles/spanish.vtt",
      language: "es"
    }
  ]);


  useEffect(() => {
    if (!videoRef.current || !streamUrl) {
      if (streamUrl == '/api/stream/' + '') {
        setLoadingState('No torrents to stream')
      } else {
        setLoadingState('Error loading stream')
      }
      return
    }

    const video = videoRef.current

    const eventHandler = () => {
      const playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented by browser:', error)
        }).finally(() => {
          console.log('Autoplay started')
          setIsLoading(false)
        })
      }
    }

    video.src = streamUrl
    video.addEventListener('canplay', eventHandler)

    video.autoplay = true
    video.muted = true
    video.playsInline = true

    video.addEventListener('waiting', () => setIsLoading(true))
    video.addEventListener('playing', () => setIsLoading(false))
    return () => {
      video.removeEventListener('canplay', eventHandler)
      video.removeEventListener('waiting', () => setIsLoading(true))
      video.removeEventListener('playing', () => setIsLoading(false))
    }
  }, [streamUrl])

  return (
    <div>
      {isLoading && (
        <Loading text={loadingState} />
      )}
      {
        (
          <video
            src={streamUrl}
            ref={videoRef}
            controls
            autoPlay={true}
            muted
            playsInline
            className={`w-full h-full border border-gray-800 rounded-lg bg-black ${isLoading ? 'hidden' : 'block'}`}
            onCanPlay={(e) => {
              e.currentTarget.play()
                .catch(err => console.log('Autoplay failed:', err));
              e.currentTarget.muted = false;
            }}
            onError={(e) => {
              e.currentTarget.pause();
              e.currentTarget.src = '';

              setLoadingState('Error loading stream');
            }}
          />

        )
      }
    </div >
  )
}

export default Player;