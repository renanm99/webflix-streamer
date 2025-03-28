import React from 'react';
import { useEffect, useRef, useState } from 'react'
import Loading from '@/app/components/loading';
//import { repo } from '../../../repo/db'

interface PlayerProps {
  magnetTorrent: string;
}

const Player: React.FC<PlayerProps> = ({ magnetTorrent }) => {
  const [streamUrl, setStreamUrl] = useState('/api/stream/' + magnetTorrent);
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setStreamUrl('/api/stream/' + magnetTorrent);
  }, [magnetTorrent]);

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return

    const video = videoRef.current
    console.log("video: ", video)
    console.log("isloading: ", isLoading)
    console.log("streamUrl: ", streamUrl)

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
  }, [streamUrl, videoRef.current])

  return (
    <div className="">
      {isLoading && (
        <Loading text={"Loading content..."} />
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
            }} />
        )
      }
    </div >
  )
}

export default Player;