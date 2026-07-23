'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/stores/desktopStore';

interface MusicPlayerProps {
  config?: {
    enabled: boolean;
    url?: string;
    fileName?: string;
    startOffset?: number;
    endOffset?: number;
    loop?: boolean;
    volume?: number;
  };
}

export default function DesktopMusicPlayer({ config }: MusicPlayerProps) {
  const { isAppPlayingMedia } = useDesktopStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [volume, setVolume] = useState(config?.volume ?? 0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const url = config?.url;
  const enabled = config?.enabled !== false && !!url;
  const start = config?.startOffset ?? 0;
  const end = config?.endOffset ?? 180;
  const loop = config?.loop !== false;

  // Initialize Audio
  useEffect(() => {
    if (!enabled || !url) {
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.loop = false; // We handle loop offset manually to enforce trim endOffset
    audio.volume = volume;

    // Start offset setup
    audio.currentTime = start;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Enforce end trim offset
      if (audio.currentTime >= end) {
        if (loop) {
          audio.currentTime = start;
          audio.play().catch(() => {});
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      }

      // Enforce start trim offset (in case user seeks backwards below start)
      if (audio.currentTime < start) {
        audio.currentTime = start;
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Try auto-play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        })
        .catch(() => {
          // Autoplay blocked
          setIsPlaying(false);
          setNeedsInteraction(true);
        });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current = null;
    };
  }, [enabled, url, start, end, loop]);

  // Automatically pause background music when an app plays audio/video
  useEffect(() => {
    if (!audioRef.current || !enabled) return;
    if (isAppPlayingMedia) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isAppPlayingMedia, enabled]);

  // Handle interaction to play after autoplay block
  const handleStartPlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        })
        .catch((e) => console.warn('Audio play failed:', e));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setNeedsInteraction(true));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Autoplay block prompt banner */}
      <AnimatePresence>
        {needsInteraction && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            onClick={handleStartPlay}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 99999,
              background: 'rgba(255, 255, 235, 0.95)',
              border: '2px solid #D4AF37',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>🎵 Click to unmute background music</span>
            <span style={{
              background: '#D4AF37',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}>Play</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiny Winamp/CD Vinyl controller at bottom-right next to clock */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          right: 16,
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(26, 26, 46, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 40,
          padding: '6px 14px 6px 8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          color: '#FFF',
          fontFamily: 'system-ui, sans-serif',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Spinning Vinyl Record CD */}
        <div
          onClick={togglePlay}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #222 25%, #444 30%, #111 60%, #444 65%, #000 80%)',
            border: '2px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isPlaying ? 'spin 3s linear infinite' : 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {/* Label center */}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF4757', border: '1px solid #FFF' }} />
          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>

        {/* Info & controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              maxWidth: 120,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#F1F2F6',
              opacity: 0.95,
            }}
            title={config?.fileName || 'Background Music'}
          >
            {config?.fileName || 'Background Music'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '9px', opacity: 0.6, fontFamily: 'monospace' }}>
              {Math.floor(Math.max(0, currentTime - start))}s / {Math.floor(end - start)}s
            </span>

            {/* Volume slider (Tiny) */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: 45,
                height: 3,
                accentColor: '#FF4757',
                cursor: 'pointer',
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
