'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhotosConfig, PhotoAlbumPage, PhotoItem } from '@/lib/types';
import { useDesktopStore } from '@/stores/desktopStore';

interface PhotosAppProps {
  config: PhotosConfig;
}

// ── Palette Presets ───────────────────────────────────────────────────────
const PALETTES: Record<string, { label: string; bookCover: string; bg: string; accent: string; cardBg: string; text: string }> = {
  sage:     { label: 'Sage Green',   bookCover: '#A8B89A', bg: '#F4F7F2', accent: '#5B6F4E', cardBg: '#FFFDF9', text: '#2A3326' },
  cream:    { label: 'Cream Vintage',bookCover: '#E8DCC8', bg: '#FFFDF7', accent: '#A07D48', cardBg: '#FFFDF9', text: '#3A2E1C' },
  rose:     { label: 'Rose Blush',   bookCover: '#E8B4B8', bg: '#FFF6F7', accent: '#B05864', cardBg: '#FFFDF9', text: '#3D1A20' },
  lavender: { label: 'Soft Lavender',bookCover: '#C4B4E0', bg: '#F8F5FF', accent: '#7048A0', cardBg: '#FFFDF9', text: '#281048' },
  butter:   { label: 'Butter Yellow',bookCover: '#F5E6B8', bg: '#FFFDEB', accent: '#B08828', cardBg: '#FFFDF9', text: '#3A2D10' },
  slate:    { label: 'Slate Gray',   bookCover: '#B0B8C4', bg: '#F5F7FA', accent: '#485868', cardBg: '#FFFDF9', text: '#182230' },
};

// ── Washi Tape Clips ──────────────────────────────────────────────────────
function WashiTape({ style = 'pastel' }: { style?: PhotoItem['tapeStyle'] }) {
  if (style === 'none') return null;
  const colors: Record<string, { bg: string; pattern: string }> = {
    grid:   { bg: '#E2E8F0', pattern: 'radial-gradient(#94A3B8 1px, transparent 1px) 0 0/6px 6px' },
    floral: { bg: '#FBCFE8', pattern: 'linear-gradient(45deg, #F472B6 25%, transparent 25%, transparent 75%, #F472B6 75%) 0 0/8px 8px' },
    pastel: { bg: '#FEF08A', pattern: 'linear-gradient(135deg, #FBBF24 25%, transparent 25%) 0 0/6px 6px' },
    clear:  { bg: 'rgba(255,255,255,0.65)', pattern: 'none' },
  };
  const t = colors[style || 'pastel'];
  return (
    <div
      style={{
        position: 'absolute',
        top: -10,
        left: '50%',
        transform: 'translateX(-50%) rotate(-2deg)',
        width: 64,
        height: 18,
        background: t.bg,
        backgroundImage: t.pattern,
        opacity: 0.85,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        borderRadius: 1,
        clipPath: 'polygon(0 0, 95% 0, 100% 100%, 5% 100%)',
        zIndex: 10,
      }}
    />
  );
}

// ── Stickers ─────────────────────────────────────────────────────────────
function StickerBadge({ type = 'none' }: { type?: PhotoItem['sticker'] }) {
  if (type === 'none' || !type) return null;
  const badges: Record<string, string> = {
    stamp: '🏷️',
    heart: '💖',
    ribbon: '🎀',
    star: '⭐',
  };
  return (
    <div
      style={{
        position: 'absolute',
        bottom: -8,
        right: -8,
        fontSize: 22,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        transform: 'rotate(12deg)',
        zIndex: 12,
        pointerEvents: 'none',
      }}
    >
      {badges[type]}
    </div>
  );
}

// ── Filters for Photo ─────────────────────────────────────────────────────
function getFilterStyle(filter?: PhotoItem['filter']): React.CSSProperties {
  switch (filter) {
    case 'vintage': return { filter: 'sepia(0.35) contrast(1.08) saturate(1.1)' };
    case 'grain':   return { filter: 'contrast(1.15) brightness(0.95) saturate(0.9)' };
    case 'glow':    return { filter: 'brightness(1.08) saturate(1.2) contrast(0.98)' };
    case 'bw':      return { filter: 'grayscale(1) contrast(1.1)' };
    default:        return {};
  }
}

// ── Confetti particle for final page ──────────────────────────────────────
function ConfettiParticle({ delay }: { delay: number }) {
  const x = (Math.random() - 0.5) * 450;
  const rot = Math.random() * 720 - 360;
  const colors = ['#A8B89A', '#E8B4B8', '#C4B4E0', '#FBBF24', '#F472B6', '#34D399'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 8;
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? '50%' : 2,
        background: color,
        pointerEvents: 'none',
        zIndex: 99,
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{ x, y: -280 - Math.random() * 180, opacity: 0, rotate: rot }}
      transition={{ duration: 1.8 + Math.random() * 0.8, delay, ease: 'easeOut' }}
    />
  );
}

// ── Single Polaroid Flip Card ──────────────────────────────────────────────
function PolaroidCard({ photo, accentColor }: { photo: PhotoItem; accentColor: string }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || !photo.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        perspective: 1000,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setIsFlipped(!isFlipped)}
      title="Click to flip & see secret message!"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.65, type: 'spring', stiffness: 140, damping: 18 }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* ── FRONT SIDE ────────────────────────────────────────────────── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            background: '#FFFDF9',
            borderRadius: 8,
            padding: '12px 12px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            position: 'relative',
          }}
        >
          <WashiTape style={photo.tapeStyle} />
          <StickerBadge type={photo.sticker} />

          {/* Photo frame */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: '#F3EFEA',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                ...getFilterStyle(photo.filter),
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80`;
              }}
            />
          </div>

          {/* Handwritten Caption */}
          <div
            style={{
              marginTop: 12,
              textAlign: 'center',
              fontFamily: "'Caveat', 'Indie Flower', cursive",
              fontSize: 18,
              fontWeight: 700,
              color: '#2D2416',
              lineHeight: 1.2,
            }}
          >
            {photo.caption || 'A lovely memory…'}
          </div>

          {/* Flip indicator icon */}
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              right: 6,
              fontSize: 10,
              color: accentColor,
              opacity: 0.65,
              fontFamily: 'sans-serif',
            }}
          >
            ↺ flip
          </div>
        </div>

        {/* ── BACK SIDE ─────────────────────────────────────────────────── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #F5EBE1 0%, #EBE0D3 100%)',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {/* Lined paper texture overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, rgba(0,0,0,0.04) 20px)',
              pointerEvents: 'none',
            }}
          />

          <div>
            {/* Stamp date & location header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px dashed rgba(0,0,0,0.2)',
                paddingBottom: 6,
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#8C6F56', fontWeight: 700 }}>
                📅 {photo.date || 'Memory Date'}
              </div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#8C6F56', fontWeight: 700 }}>
                📍 {photo.location || 'Special Place'}
              </div>
            </div>

            {/* Secret personal note */}
            <div
              style={{
                fontFamily: "'Caveat', 'Indie Flower', cursive",
                fontSize: 16,
                color: '#3A2E1C',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
              }}
            >
              {photo.secretNote || 'Flip over to read the secret message written on the back of this photo 💌'}
            </div>
          </div>

          {/* Voice Note player if present */}
          {photo.audioUrl ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
                border: `1px solid ${accentColor}44`,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'sans-serif', color: '#4A3B2C', fontWeight: 600 }}>
                🎙 Voice Memo
              </span>
              <button
                onClick={toggleAudio}
                style={{
                  background: accentColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '3px 10px',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Listen'}
              </button>
              <audio
                ref={audioRef}
                src={photo.audioUrl}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'right', fontSize: 10, color: '#A08060', fontFamily: 'sans-serif' }}>
              ↺ click to flip back
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main PhotosApp Component ──────────────────────────────────────────────
export default function PhotosApp({ config }: PhotosAppProps) {
  // Normalize pages array with backwards compatibility
  const pages: PhotoAlbumPage[] = useMemo(() => {
    if (config.pages && config.pages.length > 0) return config.pages;
    if (config.photos && config.photos.length > 0) {
      return [
        {
          id: 'page-default',
          title: 'Our Memories',
          layout: 'grid2x2',
          photos: config.photos.map((p, i) => ({
            id: `photo-${i}`,
            url: p.url,
            caption: p.caption || 'Memory',
            rotation: p.rotation,
          })),
        },
      ];
    }
    return [
      {
        id: 'page-empty',
        title: 'Memory Scrapbook',
        layout: 'single',
        photos: [
          {
            id: 'demo-1',
            url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80',
            caption: 'Golden hour magic ✨',
            date: 'Oct 14, 2024',
            location: 'Sunset Point',
            secretNote: 'We stayed until the last light.',
          },
        ],
      },
    ];
  }, [config]);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { setAppPlayingMedia } = useDesktopStore();

  useEffect(() => {
    if (isPlayingMusic) {
      setAppPlayingMedia(true);
    } else {
      setAppPlayingMedia(false);
    }
    return () => {
      setAppPlayingMedia(false);
    };
  }, [isPlayingMusic, setAppPlayingMedia]);

  const palKey = config.palette || 'sage';
  const palette = PALETTES[palKey] || PALETTES.sage;
  const albumTitle = config.albumTitle || 'Our Memory Scrapbook 📖';

  const currentPage = pages[currentPageIndex] || pages[0];

  // Confetti on last page
  useEffect(() => {
    if (currentPageIndex === pages.length - 1 && pages.length > 1) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentPageIndex, pages.length]);

  const toggleMusic = () => {
    if (!audioRef.current || !config.musicUrl) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const nextPage = () => setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1));
  const prevPage = () => setCurrentPageIndex((i) => Math.max(0, i - 1));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: palette.bg,
        color: palette.text,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      {/* Load Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;700&family=Indie+Flower&display=swap');
        .album-serif { font-family: 'Playfair Display', Georgia, serif; }
        .album-hand  { font-family: 'Caveat', 'Indie Flower', cursive; }
        .album-btn {
          font-family: 'Playfair Display', Georgia, serif;
          border: none; cursor: pointer; transition: all 0.2s ease;
        }
        .album-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>

      {/* Confetti particles on reaching final page */}
      {showConfetti && Array.from({ length: 36 }, (_, i) => (
        <ConfettiParticle key={i} delay={i * 0.05} />
      ))}

      {/* ── Top Album Header ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 24px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${palette.bookCover}44`,
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 20,
        }}
      >
        <div>
          <div className="album-serif" style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
            {albumTitle}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'sans-serif', color: palette.accent, opacity: 0.8 }}>
            {currentPage?.title || `Page ${currentPageIndex + 1} of ${pages.length}`}
          </div>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {config.musicUrl && (
            <button
              className="album-btn"
              onClick={toggleMusic}
              style={{
                background: palette.accent,
                color: 'white',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'sans-serif',
              }}
            >
              {isPlayingMusic ? '⏸ Pause Music' : '🎵 Ambient Music'}
            </button>
          )}

          <button
            className="album-btn"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: 'white',
              border: `1.5px solid ${palette.bookCover}`,
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 11,
              color: palette.accent,
              fontFamily: 'sans-serif',
            }}
          >
            {isEditing ? '📖 View Album' : '⚙️ Customizer'}
          </button>
        </div>
      </div>

      {/* ── 3D Album Page Canvas ──────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: 16,
          perspective: 1400,
          overflow: 'auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageIndex}
            initial={{ rotateY: -25, opacity: 0, scale: 0.95 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: 25, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 18 }}
            style={{
              width: 'min(720px, 98%)',
              minHeight: 440,
              background: palette.cardBg,
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              border: `1.5px solid ${palette.bookCover}55`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Book spine line overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: 16,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.06) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Layout Switcher Renderer */}
            {currentPage?.layout === 'journal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: '100%', alignItems: 'center' }}>
                {/* Left: Hero photo */}
                <div>
                  {currentPage.photos[0] && (
                    <PolaroidCard photo={currentPage.photos[0]} accentColor={palette.accent} />
                  )}
                </div>
                {/* Right: Handwritten Journal Sheet */}
                <div
                  style={{
                    background: '#FAF6EE',
                    borderRadius: 12,
                    padding: 20,
                    border: `1px solid ${palette.bookCover}44`,
                    boxShadow: 'inset 0 0 12px rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div className="album-serif" style={{ fontSize: 16, fontWeight: 700, color: palette.accent, marginBottom: 12 }}>
                    {currentPage.title}
                  </div>
                  <div
                    className="album-hand"
                    style={{
                      fontSize: 19,
                      lineHeight: 1.6,
                      color: '#3A2E1C',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {currentPage.journalText || 'Write your heartfelt story here for your special recipient to read…'}
                  </div>
                </div>
              </div>
            )}

            {currentPage?.layout === 'single' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 'min(360px, 90%)' }}>
                  {currentPage.photos[0] && (
                    <PolaroidCard photo={currentPage.photos[0]} accentColor={palette.accent} />
                  )}
                </div>
                {currentPage.journalText && (
                  <div
                    className="album-hand"
                    style={{
                      maxWidth: 500,
                      textAlign: 'center',
                      fontSize: 20,
                      color: '#3A2E1C',
                      lineHeight: 1.5,
                    }}
                  >
                    {currentPage.journalText}
                  </div>
                )}
              </div>
            )}

            {currentPage?.layout === 'grid2x2' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {currentPage.photos.slice(0, 4).map((p, idx) => (
                  <PolaroidCard key={p.id || idx} photo={p} accentColor={palette.accent} />
                ))}
              </div>
            )}

            {currentPage?.layout === 'scrapbook' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
                {currentPage.photos.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    style={{
                      transform: `rotate(${p.rotation || (idx % 2 === 0 ? -3 : 4)}deg)`,
                    }}
                  >
                    <PolaroidCard photo={p} accentColor={palette.accent} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Floating Control Bar ───────────────────────────────────── */}
      <div
        style={{
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${palette.bookCover}33`,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 11, fontFamily: 'sans-serif', color: palette.accent }}>
          💡 <em>Click any photo to flip & read secret note!</em>
        </div>

        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="album-btn"
            onClick={prevPage}
            disabled={currentPageIndex === 0}
            style={{
              background: currentPageIndex === 0 ? '#E2E8F0' : palette.accent,
              color: currentPageIndex === 0 ? '#94A3B8' : 'white',
              padding: '6px 14px',
              borderRadius: 16,
              fontSize: 12,
              fontFamily: 'sans-serif',
              cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ◀ Prev
          </button>

          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>
            {currentPageIndex + 1} / {pages.length}
          </span>

          <button
            className="album-btn"
            onClick={nextPage}
            disabled={currentPageIndex === pages.length - 1}
            style={{
              background: currentPageIndex === pages.length - 1 ? '#E2E8F0' : palette.accent,
              color: currentPageIndex === pages.length - 1 ? '#94A3B8' : 'white',
              padding: '6px 14px',
              borderRadius: 16,
              fontSize: 12,
              fontFamily: 'sans-serif',
              cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Next ▶
          </button>
        </div>

        {/* Save/Share Action */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="album-btn"
            style={{
              background: 'white',
              border: `1px solid ${palette.bookCover}`,
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 11,
              color: palette.accent,
              fontFamily: 'sans-serif',
            }}
          >
            💾 Save Memory
          </button>
        </div>
      </div>

      {/* Audio element for background music */}
      {config.musicUrl && (
        <audio
          ref={audioRef}
          src={config.musicUrl}
          loop
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}
