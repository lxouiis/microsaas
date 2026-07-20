import { useState, useEffect, useRef, useCallback } from 'react';
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

const SpindleGear = ({ spinning }: { spinning: boolean }) => {
  return (
    <motion.div
      animate={spinning ? { rotate: 360 } : {}}
      transition={spinning ? { repeat: Infinity, duration: 3, ease: 'linear' } : {}}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        backgroundColor: '#1E293B',
        border: '3px solid #64748B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Spindle teeth */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <div
          key={angle}
          style={{
            position: 'absolute',
            width: '5px',
            height: '6px',
            backgroundColor: '#64748B',
            borderRadius: '1px',
            transform: `rotate(${angle}deg) translateY(-14px)`,
          }}
        />
      ))}
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0F172A' }} />
    </motion.div>
  );
};

export default function MixtapeApp({ config }: MixtapeAppProps) {
  const sounds = useSound();
  const [phase, setPhase] = useState<'case' | 'door-open' | 'inserting' | 'locking' | 'spinning' | 'playing'>('case');
  const [isPlaying, setIsPlaying] = useState(false);
  const [tapeHiss, setTapeHiss] = useState<{ stop: () => void } | null>(null);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Clean up hiss audio on unmount
  useEffect(() => {
    return () => {
      if (tapeHiss) {
        tapeHiss.stop();
      }
    };
  }, [tapeHiss]);

  const startPlaybackSequence = async () => {
    if (phase !== 'case') return;

    // Stage 1 & 2: Prep & Door Open (0.0s - 0.5s)
    sounds.cassette();
    setPhase('door-open');
    await delay(500);

    // Stage 3: Drop (0.5s - 1.2s)
    setPhase('inserting');
    await delay(700);

    // Stage 4: Lock (1.2s - 1.5s)
    setPhase('locking');
    sounds.clunk(); // play retro clunk sound
    await delay(300);

    // Stage 5: Spin (1.5s - 2.2s)
    setPhase('spinning');
    await delay(700);

    // Stage 6: Play (2.2s+)
    setPhase('playing');
    const hiss = sounds.playTapeHiss();
    setTapeHiss(hiss);
    setIsPlaying(true);
  };

  const handleStop = async () => {
    if (tapeHiss) {
      tapeHiss.stop();
      setTapeHiss(null);
    }
    setIsPlaying(false);
    sounds.cassette();

    // Reverse ejection timeline
    setPhase('locking');
    await delay(250);
    setPhase('door-open');
    await delay(400);
    setPhase('inserting');
    await delay(300);
    setPhase('case');
  };

function getSpotifyEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/spotify\.com\/(playlist|track|album|artist|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }
  return null;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  // Playlist
  const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch) {
    return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
  }
  // Video (watch?v= or youtu.be/ or embed/ or music.youtube.com/watch?v=)
  const videoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (videoMatch) {
    return `https://www.youtube.com/embed/${videoMatch[1]}`;
  }
  return null;
}

  const cassetteStyle = (config as any).cassette_style || {};
  const patternId = cassetteStyle.pattern_id || 'floral';
  const doodleDataUrl = (config as any).doodle_data_url;
  const stickers = (config as any).stickers || [];

  const cassetteVariants = {
    case: {
      y: -140,
      scale: 1.538,
      rotateX: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    'door-open': {
      y: -100,
      scale: 1.3,
      rotateX: -15,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }
    },
    inserting: {
      y: 0,
      scale: 1.0,
      rotateX: -20,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }
    },
    locking: {
      y: 0,
      scale: 1.0,
      rotateX: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    spinning: {
      y: 0,
      scale: 1.0,
      rotateX: 0,
      opacity: 1,
    },
    playing: {
      y: 0,
      scale: 1.0,
      rotateX: 0,
      opacity: 1,
    }
  };

  const isReelsSpinning = phase === 'spinning' || phase === 'playing';

  return (
    <div
      className="flex flex-col items-center h-full overflow-auto w-full"
      style={{
        background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE0D4 100%)',
        padding: '20px',
        fontFamily: 'var(--font-nunito)',
      }}
    >
      {/* 3D Perspective Animation Container */}
      <div 
        style={{ 
          perspective: '1000px', 
          width: '100%', 
          maxWidth: '360px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          position: 'relative',
          height: '320px',
          marginBottom: '20px',
        }}
      >
        {/* The Tape Recorder Casing (Skeuomorphic Deck Casing) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            width: '320px',
            height: '170px',
            backgroundColor: '#CBD5E1',
            borderRadius: '12px',
            border: '5px solid #475569',
            boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
            zIndex: 10,
            overflow: 'visible', // Ensure the floating cassette tape doesn't get clipped when translated upwards!
          }}
        >
          {/* Deck background styling */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#94A3B8', border: '3px inset #475569', borderRadius: '6px' }} />

          {/* Layer 1: Spindle Gears */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '48px', 
              left: '52px', 
              right: '52px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <SpindleGear spinning={isReelsSpinning} />
            <SpindleGear spinning={isReelsSpinning} />
          </div>

          {/* Cassette Slot background shadows */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '32px', 
              left: '26px', 
              right: '26px', 
              height: '84px', 
              backgroundColor: '#1E293B', 
              border: '2px solid #334155',
              borderRadius: '6px',
              zIndex: 5,
            }}
          />

          {/* Layer 2: The Cassette tape itself (positioned inside the slot area) */}
          <motion.div
            animate={phase}
            variants={cassetteVariants as any}
            style={{
              position: 'absolute',
              top: '32px',
              left: '26px',
              width: '268px',
              height: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20, // Sit between Spindles (10) and Door (30)
              cursor: phase === 'case' ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (phase === 'case') {
                startPlaybackSequence();
              }
            }}
          >
            <div style={{ transform: 'scale(0.65)', transformOrigin: 'center center', flexShrink: 0 }}>
              <CassetteTape
                title={config.title}
                patternId={patternId}
                doodleDataUrl={doodleDataUrl}
                stickers={stickers}
                isPlaying={isReelsSpinning}
                scale={1}
              />
            </div>
          </motion.div>

          {/* Layer 3: Acrylic Door overlay */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '20px',
              right: '20px',
              height: '100px',
              backgroundColor: '#475569',
              border: '3px solid #1E293B',
              borderRadius: '8px 8px 2px 2px',
              zIndex: 30, // Stacked on top of Cassette (20)
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom',
              transform: (phase === 'door-open' || phase === 'inserting') ? 'rotateX(-30deg)' : 'rotateX(0deg)',
              transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
            }}
          >
            {/* Acrylic transparent screen */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '22px',
                right: '22px',
                bottom: '12px',
                backgroundColor: 'rgba(241, 245, 249, 0.15)',
                border: '2px solid #1E293B',
                borderRadius: '4px',
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(0.5px)',
              }}
            />
            {/* Retro label print on door */}
            <div style={{ position: 'absolute', bottom: '2px', width: '100%', textAlign: 'center', fontSize: '8px', color: '#94A3B8', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px' }}>
              AUTO REVERSE · DOLBY B-C NR
            </div>
          </div>

          {/* Deck Control Mechanical Buttons */}
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '20px',
              right: '20px',
              display: 'flex',
              gap: '6px',
              zIndex: 35,
            }}
          >
            {[
              { label: 'REC', color: '#EF4444', icon: '●', action: null, disabled: true },
              { label: 'PLAY', color: '#10B981', icon: '▶', action: startPlaybackSequence, disabled: phase !== 'case' },
              { label: 'STOP', color: '#64748B', icon: '■', action: handleStop, disabled: phase === 'case' || phase === 'door-open' || phase === 'inserting' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => {
                  if (btn.action && !btn.disabled) {
                    btn.action();
                  }
                }}
                disabled={btn.disabled}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  fontSize: '9px',
                  fontWeight: 900,
                  backgroundColor: btn.disabled ? '#94A3B8' : btn.color,
                  color: 'white',
                  borderRadius: '4px',
                  borderTop: '2px solid #FFF',
                  borderLeft: '2px solid #FFF',
                  borderBottom: '2.5px solid #1E293B',
                  borderRight: '2.5px solid #1E293B',
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  opacity: btn.disabled ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1px',
                }}
              >
                <span>{btn.icon}</span>
                <span style={{ fontSize: '7px' }}>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Eject / Insert helper prompt text */}
        <div style={{ position: 'absolute', bottom: '-15px', fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
          {phase === 'case' ? 'Click cassette to insert & play' : phase === 'playing' ? 'Mixtape playing! ⚡' : 'Loading...'}
        </div>
      </div>

      <AnimatePresence>
        {(phase === 'playing') && (
          <motion.div
            key="letter-details"
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            {/* Handwritten letter */}
            <div
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
            </div>

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
                    transition={{ delay: 0.2 + i * 0.1 }}
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
                  </motion.div>
                ))}
              </div>
            )}

            {/* Spotify embed */}
            {getSpotifyEmbedUrl(config.spotifyUrl) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.4 }}
                style={{ marginTop: 12 }}
              >
                <iframe
                  src={getSpotifyEmbedUrl(config.spotifyUrl)!}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ borderRadius: 12, border: 'none' }}
                />
              </motion.div>
            )}

            {/* YouTube embed */}
            {getYouTubeEmbedUrl(config.youtubeUrl) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.4 }}
                style={{ marginTop: 12 }}
              >
                <iframe
                  src={getYouTubeEmbedUrl(config.youtubeUrl)!}
                  width="100%"
                  height="180"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  style={{ borderRadius: 12, border: 'none' }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
