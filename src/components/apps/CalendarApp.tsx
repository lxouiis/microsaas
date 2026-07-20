'use client';
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarConfig, MemoryDateItem } from '@/lib/types';

interface CalendarAppProps {
  config: CalendarConfig;
}

// ── Palette Presets ───────────────────────────────────────────────────────
const PALETTES: Record<string, { label: string; binder: string; bg: string; accent: string; cardBg: string; text: string; highlight: string }> = {
  rose:     { label: 'Rose Blush',   binder: '#C05868', bg: '#FFF5F7', accent: '#B04858', cardBg: '#FFFDF9', text: '#3D1A20', highlight: '#FF889B' },
  sage:     { label: 'Sage Green',   binder: '#5B6F4E', bg: '#F4F7F2', accent: '#4B5F3E', cardBg: '#FFFDF9', text: '#2A3326', highlight: '#7CAB68' },
  cream:    { label: 'Warm Cream',   binder: '#A07D48', bg: '#FFFDF7', accent: '#805D28', cardBg: '#FFFDF9', text: '#3A2E1C', highlight: '#E5B868' },
  lavender: { label: 'Soft Lavender',binder: '#7048A0', bg: '#F8F5FF', accent: '#603890', cardBg: '#FFFDF9', text: '#281048', highlight: '#A87CE8' },
  butter:   { label: 'Butter Yellow',binder: '#B08828', bg: '#FFFDEB', accent: '#906818', cardBg: '#FFFDF9', text: '#3A2D10', highlight: '#F5C842' },
  slate:    { label: 'Slate Gray',   binder: '#485868', bg: '#F5F7FA', accent: '#384858', cardBg: '#FFFDF9', text: '#182230', highlight: '#6888A8' },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ── Countdown Helper ──────────────────────────────────────────────────────
function MemoryCountdown({ targetDate }: { targetDate: string }) {
  const diff = useMemo(() => {
    const t = new Date(targetDate).getTime();
    if (isNaN(t)) return null;
    const now = Date.now();
    const d = Math.abs(Math.floor((t - now) / 86400000));
    const isPast = t < now;
    return { days: d, isPast };
  }, [targetDate]);

  if (!diff) return null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'sans-serif', opacity: 0.85 }}>
      <span>⏳</span>
      <span>{diff.isPast ? `${diff.days} days since this special date` : `${diff.days} days until this event!`}</span>
    </div>
  );
}

export default function CalendarApp({ config }: CalendarAppProps) {
  // Normalize memory list with backwards compatibility
  const memories: MemoryDateItem[] = useMemo(() => {
    if (config.memories && config.memories.length > 0) return config.memories;
    if (config.highlightedDay || config.memoryTitle) {
      return [
        {
          id: 'mem-legacy',
          day: config.highlightedDay || 1,
          month: config.month || 1,
          year: config.year || 2025,
          icon: '💌',
          title: config.memoryTitle || 'A Special Memory',
          text: config.memoryText || 'Remember this special date…',
          photoUrl: config.memoryPhotoUrl,
        },
      ];
    }
    return [
      {
        id: 'mem-demo',
        day: 14,
        month: config.month || 2,
        year: config.year || 2025,
        icon: '💖',
        title: 'Special Memory Date 💖',
        text: 'A day to remember forever and cherish in your heart.',
      },
    ];
  }, [config]);

  const [activeMonthIndex, setActiveMonthIndex] = useState((config.month || 7) - 1);
  const [activeYear, setActiveYear] = useState(config.year || 2025);
  const [selectedMemory, setSelectedMemory] = useState<MemoryDateItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const palKey = config.palette || 'rose';
  const palette = PALETTES[palKey] || PALETTES.rose;
  const calendarTitle = config.title || 'Our Special Memory Dates 📅';

  // Calculate calendar days grid
  const currentMonthNum = activeMonthIndex + 1;
  const firstDayOfMonth = new Date(activeYear, activeMonthIndex, 1).getDay();
  const daysInMonth = new Date(activeYear, currentMonthNum, 0).getDate();

  const daysGrid: (number | null)[] = useMemo(() => {
    const list: (number | null)[] = [
      ...Array(firstDayOfMonth).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [firstDayOfMonth, daysInMonth]);

  // Map of memory items by day for quick lookup in current month/year
  const memoriesByDay = useMemo(() => {
    const map: Record<number, MemoryDateItem> = {};
    memories.forEach((mem) => {
      const mMonth = mem.month || config.month || currentMonthNum;
      const mYear = mem.year || config.year || activeYear;
      if (mMonth === currentMonthNum && mYear === activeYear) {
        map[mem.day] = mem;
      }
    });
    return map;
  }, [memories, currentMonthNum, activeYear, config.month, config.year]);

  const prevMonth = () => {
    if (activeMonthIndex === 0) {
      setActiveMonthIndex(11);
      setActiveYear((y) => y - 1);
    } else {
      setActiveMonthIndex((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (activeMonthIndex === 11) {
      setActiveMonthIndex(0);
      setActiveYear((y) => y + 1);
    } else {
      setActiveMonthIndex((m) => m + 1);
    }
  };

  const toggleVoiceMemo = () => {
    if (!audioRef.current || !selectedMemory?.voiceUrl) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;700&display=swap');
        .cal-serif { font-family: 'Playfair Display', Georgia, serif; }
        .cal-hand  { font-family: 'Caveat', cursive; }
        .cal-btn {
          font-family: 'Playfair Display', Georgia, serif;
          border: none; cursor: pointer; transition: all 0.2s ease;
        }
        .cal-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>

      {/* ── Top Bar with Wood Binder Rings ────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${palette.binder}33`,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Binder spiral rings */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                style={{
                  width: 8,
                  height: 16,
                  borderRadius: 4,
                  background: `linear-gradient(180deg, ${palette.binder} 0%, #333 100%)`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
          <div>
            <div className="cal-serif" style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
              {calendarTitle}
            </div>
            <div style={{ fontSize: 11, fontFamily: 'sans-serif', color: palette.accent, opacity: 0.85 }}>
              Click any date with a badge to unbox memories ✨
            </div>
          </div>
        </div>

        {/* Quick Memory Bookmark icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {memories.slice(0, 4).map((m, idx) => (
            <button
              key={m.id || idx}
              onClick={() => {
                if (m.month) setActiveMonthIndex(m.month - 1);
                if (m.year) setActiveYear(m.year);
                setSelectedMemory(m);
              }}
              title={m.title}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: palette.cardBg,
                border: `1.5px solid ${palette.highlight}`,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              {m.icon || '❤️'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Wall Calendar Body ───────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <motion.div
          layout
          style={{
            width: 'min(480px, 98%)',
            background: palette.cardBg,
            borderRadius: 16,
            boxShadow: '0 12px 36px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)',
            border: `1.5px solid ${palette.binder}44`,
            padding: '24px 20px',
            position: 'relative',
          }}
        >
          {/* Month & Year Navigation Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: `1px solid ${palette.binder}22`,
            }}
          >
            <button
              className="cal-btn"
              onClick={prevMonth}
              style={{
                background: palette.accent,
                color: 'white',
                padding: '5px 12px',
                borderRadius: 14,
                fontSize: 12,
                fontFamily: 'sans-serif',
              }}
            >
              ◀
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, color: palette.accent, fontWeight: 700 }}>
                {activeYear}
              </div>
              <div className="cal-serif" style={{ fontSize: 24, fontWeight: 700, color: palette.text, lineHeight: 1.1 }}>
                {MONTHS[activeMonthIndex]}
              </div>
            </div>

            <button
              className="cal-btn"
              onClick={nextMonth}
              style={{
                background: palette.accent,
                color: 'white',
                padding: '5px 12px',
                borderRadius: 14,
                fontSize: 12,
                fontFamily: 'sans-serif',
              }}
            >
              ▶
            </button>
          </div>

          {/* Days of Week Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'sans-serif',
                  color: palette.accent,
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ height: 42 }} />;
              }

              const mem = memoriesByDay[day];

              return (
                <motion.div
                  key={`day-${day}`}
                  whileHover={mem ? { scale: 1.12, y: -2 } : { scale: 1.04 }}
                  whileTap={mem ? { scale: 0.95 } : {}}
                  onClick={() => mem && setSelectedMemory(mem)}
                  style={{
                    height: 42,
                    borderRadius: 10,
                    background: mem ? palette.highlight : 'transparent',
                    color: mem ? 'white' : palette.text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: mem ? 'pointer' : 'default',
                    position: 'relative',
                    boxShadow: mem ? `0 4px 12px ${palette.highlight}66` : 'none',
                    fontWeight: mem ? 800 : 400,
                    fontFamily: mem ? "'Playfair Display', serif" : 'sans-serif',
                    fontSize: 13,
                    border: mem ? 'none' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{day}</span>

                  {/* Memory icon badge */}
                  {mem && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -4,
                        fontSize: 12,
                        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                      }}
                    >
                      {mem.icon || '❤️'}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Memory Postcard / Card Unboxing Modal ─────────────────────────── */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              zIndex: 100,
            }}
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(440px, 95%)',
                background: '#FFFDF9',
                borderRadius: 16,
                boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
                border: `2px solid ${palette.binder}55`,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMemory(null)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: '#888',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>

              {/* Date Stamp & Location Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: palette.accent,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  borderBottom: `1px dashed ${palette.binder}33`,
                  paddingBottom: 6,
                }}
              >
                <span>{selectedMemory.icon || '💌'}</span>
                <span>
                  {MONTHS[(selectedMemory.month || currentMonthNum) - 1]} {selectedMemory.day}, {selectedMemory.year || activeYear}
                </span>
                {selectedMemory.location && <span>· 📍 {selectedMemory.location}</span>}
              </div>

              {/* Memory Title */}
              <div className="cal-serif" style={{ fontSize: 20, fontWeight: 700, color: palette.text, marginBottom: 10, lineHeight: 1.25 }}>
                {selectedMemory.title}
              </div>

              {/* Memory Text */}
              <div className="cal-hand" style={{ fontSize: 18, color: '#3A2E1C', lineHeight: 1.5, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
                {selectedMemory.text}
              </div>

              {/* Photo Attachment */}
              {selectedMemory.photoUrl && (
                <div
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    marginBottom: 14,
                    border: '3px solid white',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedMemory.photoUrl}
                    alt={selectedMemory.title}
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              {/* Countdown & Voice Note Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${palette.binder}22` }}>
                <MemoryCountdown targetDate={`${selectedMemory.year || activeYear}-${String(selectedMemory.month || currentMonthNum).padStart(2, '0')}-${String(selectedMemory.day).padStart(2, '0')}`} />

                {selectedMemory.voiceUrl && (
                  <button
                    className="cal-btn"
                    onClick={toggleVoiceMemo}
                    style={{
                      background: palette.accent,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontFamily: 'sans-serif',
                    }}
                  >
                    {isPlayingAudio ? '⏸ Pause' : '🎙 Voice Note'}
                  </button>
                )}
              </div>

              {selectedMemory.voiceUrl && (
                <audio
                  ref={audioRef}
                  src={selectedMemory.voiceUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  style={{ display: 'none' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
