'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MixtapeConfig } from '@/lib/types';
import { useSound } from '@/hooks/useSound';

interface MixtapeAppProps {
  config: MixtapeConfig;
}



const PATTERN_TEMPLATES = [
  { id: 'floral', bg: '#FFD6B8', bgStyle: 'radial-gradient(circle, #FFE4E6 20%, transparent 20%), radial-gradient(circle, #FFE4E6 20%, transparent 20%)', bgSize: '20px 20px', bgPosition: '0 0, 10px 10px' },
  { id: 'plaid', bg: '#FBBF24', bgStyle: 'linear-gradient(90deg, rgba(255,255,255,0.2) 50%, transparent 50%), linear-gradient(rgba(255,255,255,0.2) 50%, transparent 50%)', bgSize: '15px 15px' },
  { id: 'grid', bg: '#FCA5A5', bgStyle: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', bgSize: '16px 16px' },
  { id: 'blue', bg: '#93C5FD', bgStyle: 'linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', bgSize: '20px 20px' },
];

const CassetteTape = ({
  title,
  patternId = 'floral',
  doodleDataUrl,
  stickers = [],
  isPlaying = false,
  scale = 1,
}: {
  title: string;
  patternId?: string;
  doodleDataUrl?: string;
  stickers?: any[];
  isPlaying?: boolean;
  scale?: number;
}) => {
  const pattern = PATTERN_TEMPLATES.find((p) => p.id === patternId) || PATTERN_TEMPLATES[0];

  return (
    <div
      style={{
        position: 'relative',
        width: '320px',
        height: '210px',
        backgroundColor: pattern.bg,
        backgroundImage: pattern.bgStyle,
        backgroundSize: pattern.bgSize,
        backgroundPosition: pattern.bgPosition,
        borderRadius: '16px',
        border: '6px solid #2B2B2B',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Outer classic plastic bevel frame overlay */}
      <div
        style={{
          position: 'absolute',
          inset: '8px',
          border: '2.5px solid rgba(0,0,0,0.2)',
          borderRadius: '10px',
          pointerEvents: 'none',
        }}
      />

      {/* Center Paper Label Area */}
      <div
        style={{
          position: 'absolute',
          left: '32px',
          top: '32px',
          right: '32px',
          height: '110px',
          backgroundColor: '#FFFFFF',
          border: '3.5px solid #2B2B2B',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Horizontal writing lines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px)',
          backgroundSize: '100% 24px',
          backgroundPosition: '0 12px',
          opacity: 0.7,
        }} />

        {/* Text Title */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            fontFamily: 'var(--font-hand)',
            fontSize: '18px',
            fontWeight: 700,
            color: '#334155',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {title || 'mixtape name'}
        </div>

        {/* Recipient writing */}
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '12px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '9px',
          color: '#64748B',
          zIndex: 10,
        }}>
          Side A · DESKTOP DEAR
        </div>

        {/* Drawing image layer */}
        {doodleDataUrl && (
          <img
            src={doodleDataUrl}
            alt="doodle"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Reels visualization placeholders */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '52px',
          right: '52px',
          height: '38px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div className={`cassette-reel ${isPlaying ? 'spinning' : ''}`} style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2B2B2B', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px dashed #94A3B8' }} />
        </div>
        <div className={`cassette-reel ${isPlaying ? 'spinning' : ''}`} style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2B2B2B', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px dashed #94A3B8' }} />
        </div>
      </div>

      {/* Placed Stickers Workspace Tree */}
      {(stickers || []).map((st: any, i: number) => {
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${st.xPercent}%`,
              top: `${st.yPercent}%`,
              transform: `translate(-50%, -50%) rotate(${st.rotationDeg}deg) scale(${st.scale})`,
              transformOrigin: 'center center',
              zIndex: 30,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div style={{ fontSize: '32px', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.15))' }}>
              {st.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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

  const cassetteStyle = (config as any).cassette_style || {};
  const patternId = cassetteStyle.pattern_id || 'floral';
  const doodleDataUrl = (config as any).doodle_data_url;
  const stickers = (config as any).stickers || [];

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
              onClick={handleCassetteClick}
              whileHover={{ scale: 1.04, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
              style={{ cursor: 'pointer' }}
            >
              <CassetteTape
                title={config.title}
                patternId={patternId}
                doodleDataUrl={doodleDataUrl}
                stickers={stickers}
                isPlaying={false}
                scale={1}
              />
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
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 192, height: 126, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <CassetteTape
                    title={config.title}
                    patternId={patternId}
                    doodleDataUrl={doodleDataUrl}
                    stickers={stickers}
                    isPlaying={isPlaying}
                    scale={0.6}
                  />
                </div>
                <motion.button
                  onClick={handlePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: isPlaying ? '#FFB7C5' : '#4EBFBF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </motion.button>
              </div>
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
            {config.songs && config.songs.length > 0 && (
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
            )}

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
