'use client'
import React from 'react';
import { useEffect, useRef, useState } from 'react'
//import { repo } from '../../../repo/db'

interface PlayerProps {
  magnetTorrent: string;
}

const Player: React.FC<PlayerProps> = ({ magnetTorrent }) => {
  const [streamUrl, setStreamUrl] = useState('/api/stream/undefined')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMagnet, setselectedMagnet] = useState<string>(magnetTorrent)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setselectedMagnet(magnetTorrent)
  }, [magnetTorrent]);

  useEffect(() => {
    const url = selectedMagnet

    setStreamUrl('/api/stream/' + (url || 'undefined'));
    setIsLoading(url !== undefined && url !== null && url !== '');
  }, [selectedMagnet]);

  useEffect(() => {
    const video = videoRef.current
    if (!video || streamUrl === '/api/stream/undefined') return

    const eventHandler = () => {
      const playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented by browser:', error)
        }).finally(() => {
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
    <div className="relative w-full h-full md:w-3/4">
      {(isLoading && streamUrl === '/api/stream/undefined') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-lg">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          </div>
          <p className="text-white text-lg">Loading video stream...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      )}
      {streamUrl !== '/api/stream/undefined' && (
        <video
          src={streamUrl}
          ref={videoRef}
          controls
          autoPlay={true}
          muted
          playsInline
          className="w-full h-full border border-gray-800 rounded-lg bg-black"
          onCanPlay={(e) => {
            e.currentTarget.play()
              .catch(err => console.log('Autoplay failed:', err));
            e.currentTarget.muted = false;
          }} />
      )
      }
    </div >
  )
}

export default Player;