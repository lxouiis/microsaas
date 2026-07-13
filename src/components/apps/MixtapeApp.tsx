'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MixtapeConfig } from '@/lib/types';
import { useSound } from '@/hooks/useSound';

interface MixtapeAppProps {
  config: MixtapeConfig;
}

export default function MixtapeApp({ config }: MixtapeAppProps) {
  const sounds = useSound();
  const [phase, setPhase] = useState<'case' | 'open' | 'letter' | 'playing'>('case');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCassetteClick = async () => {
    if (phase === 'case') {
      sounds.cassette();
      setPhase('open');
      await delay(600);
      setPhase('letter');
    }
  };

  const handlePlay = () => {
    sounds.cassette();
    setIsPlaying(!isPlaying);
    if (!isPlaying) setPhase('playing');
    else setPhase('letter');
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const spotifyEmbedId = config.spotifyUrl?.includes('playlist/')
    ? config.spotifyUrl.split('playlist/')[1]?.split('?')[0]
    : null;

  return (
    <div
      className="flex flex-col items-center h-full overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE0D4 100%)',
        padding: '20px',
        fontFamily: 'var(--font-nunito)',
      }}
    >
      <AnimatePresence mode="wait">
        {/* Phase 1: Cassette case closed */}
        {phase === 'case' && (
          <motion.div
            key="case"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>Click to open the cassette... 🎵</div>
            <motion.div
              className="cassette-body"
              onClick={handleCassetteClick}
              whileHover={{ scale: 1.04, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
              style={{ cursor: 'pointer' }}
            >
              {/* Cassette label */}
              <div style={{
                background: 'linear-gradient(135deg, #FFD6B8, #FFB7C5)',
                borderRadius: 6,
                padding: '8px 12px',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: '#5A3A3A' }}>
                  {config.title}
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#8A6060', marginTop: 2 }}>
                  Side A · DESKTOP DEAR
                </div>
              </div>

              {/* Reels */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div className="cassette-reel" />
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ width: 3, height: 12, background: '#C8C0B0', borderRadius: 2 }} />
                  ))}
                </div>
                <div className="cassette-reel" />
              </div>

              {/* Decorative stickers */}
              <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 16 }}>🌸</div>
              <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 14 }}>⭐</div>
            </motion.div>
            <div style={{ fontSize: 11, color: '#AAA' }}>Double-click to unwrap this mixtape</div>
          </motion.div>
        )}

        {/* Phase 2: Case opening animation */}
        {phase === 'open' && (
          <motion.div
            key="opening"
            className="flex items-center justify-center"
            style={{ height: 200 }}
          >
            <motion.div
              animate={{ rotateX: 90 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: 48 }}
            >
              💿
            </motion.div>
          </motion.div>
        )}

        {/* Phase 3: Letter + playlist */}
        {(phase === 'letter' || phase === 'playing') && (
          <motion.div
            key="letter"
            className="w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Cassette (mini, now playing) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <motion.div
                className="cassette-body"
                style={{ width: 200, padding: 10, cursor: 'default' }}
                whileHover={{ scale: 1.02 }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #FFD6B8, #FFB7C5)',
                  borderRadius: 4,
                  padding: '4px 8px',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 12, fontWeight: 700, color: '#5A3A3A' }}>
                    {config.title}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div className={`cassette-reel ${isPlaying ? 'spinning' : ''}`} style={{ width: 40, height: 40 }} />
                  <motion.button
                    onClick={handlePlay}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: isPlaying ? '#FFB7C5' : '#4EBFBF',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </motion.button>
                  <div className={`cassette-reel ${isPlaying ? 'spinning' : ''}`} style={{ width: 40, height: 40 }} />
                </div>
              </motion.div>
            </div>

            {/* Handwritten letter */}
            <motion.div
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                background: 'white',
                borderRadius: 8,
                padding: '16px 20px',
                marginBottom: 12,
                boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '3px solid #FFB7C5',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #E8E8E8 23px, #E8E8E8 24px)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-hand)',
                fontSize: 15,
                lineHeight: 1.7,
                color: '#3A3A3A',
                whiteSpace: 'pre-wrap',
              }}>
                {config.personalNote}
              </div>
            </motion.div>

            {/* Track listing */}
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 16px', marginBottom: 12, boxShadow: '2px 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#888', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                🎵 Tracklist
              </div>
              {config.songs.map((song, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '5px 0',
                    borderBottom: i < config.songs.length - 1 ? '1px solid #F0F0F0' : 'none',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#AAA', minWidth: 16, fontFamily: 'var(--font-pixel)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 12, flex: 1, fontWeight: 600, color: '#2A2A2A' }}>{song.title}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>{song.artist}</span>
                  {isPlaying && i === 0 && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ fontSize: 10 }}
                    >
                      ♪
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Spotify embed */}
            {spotifyEmbedId && isPlaying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.4 }}
              >
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${spotifyEmbedId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ borderRadius: 12 }}
                />
              </motion.div>
            )}

            {!spotifyEmbedId && config.youtubeUrl && isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center' }}
              >
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#FF0000',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  ▶ Open in YouTube Music
                </a>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
