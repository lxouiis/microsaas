'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { TicketConfig } from '@/lib/types';

interface TicketAppProps {
  config: TicketConfig;
}

// ── Stable seeded pseudo-random (no hydration mismatch) ────────────────────
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Colour palettes matching ticket creator aesthetic ─────────────────────
const PALETTES = [
  { id: 'sage',   label: 'Sage',   ticket: '#A8B89A', bg: '#F5F7F3', accent: '#6B7F5E', stub: '#C8D8BE', text: '#2A3A22' },
  { id: 'cream',  label: 'Cream',  ticket: '#E8DABA', bg: '#FFFDF7', accent: '#9A7848', stub: '#D8C8A0', text: '#3A2810' },
  { id: 'rose',   label: 'Rose',   ticket: '#E8B4B8', bg: '#FFF6F7', accent: '#A05868', stub: '#D89CA0', text: '#3A1820' },
  { id: 'violet', label: 'Violet', ticket: '#C4B4E0', bg: '#F8F5FF', accent: '#6840A0', stub: '#B0A0CC', text: '#200840' },
  { id: 'slate',  label: 'Slate',  ticket: '#B0B8C8', bg: '#F5F7FA', accent: '#485868', stub: '#98A8B8', text: '#182030' },
];

// ── Countdown ─────────────────────────────────────────────────────────────
function Countdown({ targetDate, accent }: { targetDate: string; accent: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[
        { value: timeLeft.days,    label: 'DAYS' },
        { value: timeLeft.hours,   label: 'HRS'  },
        { value: timeLeft.minutes, label: 'MIN'  },
        { value: timeLeft.seconds, label: 'SEC'  },
      ].map(({ value, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <motion.div
            key={value}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background: `${accent}22`,
              border: `1.5px solid ${accent}44`,
              borderRadius: 8,
              padding: '6px 10px',
              fontFamily: 'monospace',
              fontSize: 22,
              fontWeight: 700,
              color: accent,
              minWidth: 44,
              textAlign: 'center',
            }}
          >
            {String(value).padStart(2, '0')}
          </motion.div>
          <div style={{ fontSize: 8, color: accent, fontWeight: 700, marginTop: 3, opacity: 0.7, letterSpacing: 1 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Confetti particle (seeded — no hydration issues) ──────────────────────
function ConfettiParticle({ idx, accent }: { idx: number; accent: string }) {
  const x   = (seededRand(idx * 3)     - 0.5) * 500;
  const rot = seededRand(idx * 7)       * 720 - 360;
  const dur = 1.6 + seededRand(idx * 5) * 0.9;
  const del = seededRand(idx * 11)      * 0.4;
  const sz  = 6  + seededRand(idx * 13) * 8;
  const colors = [accent, '#FBBF24', '#F472B6', '#34D399', '#60A5FA', '#A78BFA'];
  const color  = colors[idx % colors.length];
  const round  = seededRand(idx * 17) > 0.5;
  return (
    <motion.div
      style={{
        position: 'absolute', top: '35%', left: '50%',
        width: sz, height: sz,
        borderRadius: round ? '50%' : 2,
        background: color, pointerEvents: 'none',
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{ x, y: -350 - seededRand(idx * 19) * 150, opacity: 0, rotate: rot }}
      transition={{ duration: dur, delay: del, ease: 'easeOut' }}
    />
  );
}

// ── Barcode bars (seeded) ─────────────────────────────────────────────────
const BARCODE = Array.from({ length: 32 }, (_, i) => ({
  width: i % 3 === 0 ? 3 : 1,
  opacity: 0.35 + seededRand(i * 23) * 0.45,
}));

// ── Main component ────────────────────────────────────────────────────────
export default function TicketApp({ config }: TicketAppProps) {
  const [palette, setPalette] = useState(PALETTES[0]);
  const [stage, setStage] = useState<'sealed' | 'tearing' | 'unfolding' | 'revealed'>('sealed');
  const [confetti, setConfetti] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragX = useMotionValue(0);
  const tearProgress = useTransform(dragX, [0, 160], [0, 1]);
  const detailsRef = useRef<HTMLDivElement>(null);

  const formatDate = (d: string) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  const handleOpen = useCallback(() => {
    if (stage !== 'sealed') return;
    setStage('tearing');
    setTimeout(() => {
      setStage('unfolding');
      setTimeout(() => {
        setStage('revealed');
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2800);
      }, 900);
    }, 700);
  }, [stage]);

  // watch drag
  useEffect(() => {
    const unsub = tearProgress.on('change', (v) => {
      if (v >= 0.82 && !hasDragged) {
        setHasDragged(true);
        handleOpen();
      }
    });
    return () => unsub();
  }, [tearProgress, hasDragged, handleOpen]);

  const pal = palette;

  const fields = useMemo(() => [
    { label: "YOU'RE INVITED TO", value: config.title, big: true },
    ...(config.subtitle ? [{ label: 'NOTE', value: config.subtitle, big: false }] : []),
    { label: 'DATE', value: formatDate(config.date), big: false },
    { label: 'TIME', value: config.time, big: false },
    ...(config.location ? [{ label: 'LOCATION', value: config.location, big: false }] : []),
    ...(config.dresscode ? [{ label: 'DRESS CODE', value: config.dresscode, big: false }] : []),
    ...(config.notes ? [{ label: 'NOTES', value: config.notes, big: false }] : []),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [config]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: pal.bg,
        fontFamily: "'Georgia', serif",
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Confetti layer */}
      {confetti && Array.from({ length: 44 }, (_, i) => (
        <ConfettiParticle key={i} idx={i} accent={pal.accent} />
      ))}

      {/* ── Palette picker bar (always visible) ───────────────────────── */}
      <div style={{
        padding: '10px 16px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: `1px solid ${pal.ticket}44`,
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10, color: pal.accent, fontFamily: 'sans-serif',
          textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700,
        }}>COLOUR</span>
        {PALETTES.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPalette(p); setStage('sealed'); setHasDragged(false); dragX.set(0); }}
            title={p.label}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: p.ticket,
              border: palette.id === p.id ? `3px solid ${p.accent}` : '2px solid transparent',
              cursor: 'pointer', outline: 'none', transition: 'border 0.2s',
              flexShrink: 0,
            }}
          />
        ))}
        {stage === 'revealed' && (
          <button
            onClick={() => { setStage('sealed'); setHasDragged(false); dragX.set(0); }}
            style={{
              marginLeft: 'auto', fontSize: 10, fontFamily: 'sans-serif',
              color: pal.accent, background: 'transparent',
              border: `1px solid ${pal.accent}66`, borderRadius: 12,
              padding: '3px 10px', cursor: 'pointer',
            }}
          >
            ↺ reset
          </button>
        )}
      </div>

      {/* ── Stage container ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: stage === 'revealed' ? '0' : '24px',
        overflow: 'hidden', position: 'relative',
      }}>
        <AnimatePresence mode="wait">

          {/* SEALED + TEARING ─────────────────────────────────────────────── */}
          {(stage === 'sealed' || stage === 'tearing') && (
            <motion.div
              key="envelope"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{
                scale: 1, opacity: 1,
                y: stage === 'tearing' ? -8 : [0, -5, 0],
              }}
              exit={{ scale: 0.9, opacity: 0, y: -24 }}
              transition={stage === 'tearing'
                ? { duration: 0.3 }
                : { scale: { type: 'spring', stiffness: 220, damping: 18 }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }
              }
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}
            >
              {/* Envelope SVG */}
              <div
                style={{
                  position: 'relative', width: 300,
                  filter: 'drop-shadow(0 14px 36px rgba(0,0,0,0.13))',
                  cursor: 'pointer', userSelect: 'none',
                }}
                onClick={handleOpen}
              >
                <svg width="300" height="190" viewBox="0 0 300 190" fill="none">
                  {/* Body */}
                  <rect x="0" y="32" width="300" height="158" rx="10" fill={pal.ticket} />

                  {/* Flap */}
                  <path
                    d={stage === 'tearing'
                      ? 'M0 32 L150 58 L300 32 L300 6 Q150 -6 0 6 Z'
                      : 'M0 32 L150 96 L300 32 L300 6 Q150 -12 0 6 Z'}
                    fill={pal.accent} opacity="0.82"
                    style={{ transition: 'all 0.55s ease' }}
                  />
                  {/* Fold creases */}
                  <line x1="0" y1="190" x2="150" y2="96" stroke={pal.accent} strokeOpacity="0.25" strokeWidth="1.2" />
                  <line x1="300" y1="190" x2="150" y2="96" stroke={pal.accent} strokeOpacity="0.25" strokeWidth="1.2" />

                  {/* Perforated strip */}
                  <rect x="0" y="86" width="300" height="18" rx="2" fill={pal.bg} fillOpacity="0.55" />
                  {Array.from({ length: 20 }, (_, i) => (
                    <circle key={i} cx={10 + i * 14} cy={95} r={3.2}
                      fill={pal.accent} fillOpacity="0.4" />
                  ))}
                  <text x="150" y="98.5" textAnchor="middle" fill={pal.accent}
                    fontSize="7.5" fontFamily="sans-serif" opacity="0.65" letterSpacing="1">
                    ✂ TEAR OPEN ✂
                  </text>

                  {/* Stamp-style wax seal */}
                  <circle cx="150" cy="95" r="24" fill={pal.accent} opacity="0.9" />
                  <circle cx="150" cy="95" r="19" fill={pal.ticket} stroke={pal.accent} strokeWidth="1.5" />
                  <text x="150" y="100" textAnchor="middle" fill={pal.accent} fontSize="15" fontWeight="bold">
                    🎟
                  </text>
                </svg>

                {/* Tear strip peel anim */}
                {stage === 'tearing' && (
                  <motion.div
                    style={{
                      position: 'absolute', top: 86, left: 0,
                      width: '100%', height: 18,
                      background: pal.bg, borderRadius: 2, originX: 0,
                    }}
                    initial={{ scaleX: 0, opacity: 0.9 }}
                    animate={{ scaleX: 1.08, opacity: 0, y: -16 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                  />
                )}
              </div>

              {/* Interaction controls */}
              {stage === 'sealed' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  {/* Drag-to-tear slider */}
                  <div style={{
                    width: 210, height: 38, borderRadius: 19,
                    background: `${pal.ticket}88`,
                    border: `1.5px dashed ${pal.accent}88`,
                    position: 'relative', overflow: 'hidden', cursor: 'grab',
                  }}>
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 162 }}
                      dragElastic={0}
                      style={{
                        x: dragX,
                        position: 'absolute', left: 5, top: 5,
                        width: 28, height: 28, borderRadius: '50%',
                        background: pal.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 14,
                        boxShadow: `0 2px 10px ${pal.accent}66`,
                        cursor: 'grab', zIndex: 2,
                      }}
                      whileTap={{ cursor: 'grabbing', scale: 1.1 }}
                    >
                      ✂
                    </motion.div>
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: pal.accent, fontFamily: 'sans-serif',
                      letterSpacing: 1, pointerEvents: 'none', paddingLeft: 38,
                    }}>
                      slide to tear open →
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 1, background: `${pal.accent}44` }} />
                    <span style={{ fontSize: 10, color: pal.accent, fontFamily: 'sans-serif', opacity: 0.7 }}>or</span>
                    <div style={{ width: 40, height: 1, background: `${pal.accent}44` }} />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpen}
                    style={{
                      background: pal.accent, color: 'white',
                      border: 'none', borderRadius: 24,
                      padding: '11px 32px', fontSize: 13,
                      fontFamily: "'Georgia', serif",
                      fontWeight: 600, cursor: 'pointer',
                      boxShadow: `0 6px 20px ${pal.accent}55`,
                      letterSpacing: 0.3,
                    }}
                  >
                    🎟 Open invitation
                  </motion.button>

                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: 10, color: pal.accent, fontFamily: 'sans-serif', opacity: 0.6 }}
                  >
                    ↕ tap or drag to reveal
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* UNFOLDING ────────────────────────────────────────────────────── */}
          {stage === 'unfolding' && (
            <motion.div
              key="unfolding"
              initial={{ scaleY: 0.04, opacity: 0, y: 50 }}
              animate={{ scaleY: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 85, damping: 15 }}
              style={{
                width: 300, minHeight: 160,
                background: pal.ticket,
                borderRadius: 14,
                boxShadow: `0 20px 56px ${pal.accent}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transformOrigin: 'top center',
                border: `1.5px solid ${pal.accent}44`,
              }}
            >
              <div style={{ fontSize: 30 }}>🎟️</div>
            </motion.div>
          )}

          {/* REVEALED TICKET ─────────────────────────────────────────────── */}
          {stage === 'revealed' && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 130, damping: 22 }}
              style={{
                width: '100%', height: '100%',
                overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 16px 28px',
              }}
              ref={detailsRef}
            >
              {/* ── Ticket Card ─────────────────────────────────────────── */}
              <motion.div
                style={{
                  width: 'min(340px, 100%)',
                  background: pal.ticket,
                  borderRadius: 14,
                  boxShadow: `0 10px 40px ${pal.accent}28`,
                  border: `1.5px solid ${pal.accent}44`,
                  overflow: 'visible',
                  position: 'relative',
                }}
              >
                {/* ADMIT TWO rotated sidebar */}
                <div style={{
                  position: 'absolute', left: -1, top: 0, bottom: 0,
                  width: 44,
                  background: pal.accent,
                  borderRadius: '14px 0 0 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    color: pal.ticket,
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: 4,
                    fontFamily: "'Georgia', serif",
                    transform: 'rotate(-90deg)',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}>
                    ADMIT TWO
                  </div>
                </div>

                {/* Ticket main content */}
                <div style={{ marginLeft: 44, padding: '20px 20px 16px' }}>
                  {/* Top label */}
                  <div style={{
                    fontSize: 9, color: pal.text, opacity: 0.55,
                    fontFamily: 'sans-serif', textTransform: 'uppercase',
                    letterSpacing: 2, marginBottom: 6,
                  }}>
                    {fields[0]?.label}
                  </div>

                  {/* Event title */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      fontSize: 22, fontWeight: 700, color: pal.text,
                      lineHeight: 1.2, marginBottom: 4,
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {config.title}
                  </motion.div>

                  {/* Subtitle as italic byline */}
                  {config.subtitle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.18 }}
                      style={{
                        fontSize: 12, color: pal.accent,
                        fontStyle: 'italic', marginBottom: 14,
                        fontFamily: "'Georgia', serif",
                      }}
                    >
                      {config.subtitle}
                    </motion.div>
                  )}

                  {/* Divider */}
                  <div style={{ height: 1, background: `${pal.accent}33`, marginBottom: 14 }} />

                  {/* Detail rows */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 14 }}>
                    {[
                      { label: 'DATE', value: formatDate(config.date) },
                      { label: 'TIME', value: config.time },
                      ...(config.location ? [{ label: 'LOCATION', value: config.location }] : []),
                      ...(config.dresscode ? [{ label: 'DRESS CODE', value: config.dresscode }] : []),
                    ].map(({ label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.07 }}
                      >
                        <div style={{
                          fontSize: 8, color: pal.text, opacity: 0.5,
                          fontFamily: 'sans-serif', textTransform: 'uppercase',
                          letterSpacing: 1.5, marginBottom: 3,
                        }}>
                          {label}
                        </div>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: pal.text,
                          fontFamily: "'Georgia', serif",
                        }}>
                          {value || '—'}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Notes */}
                  {config.notes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      style={{ marginBottom: 14 }}
                    >
                      <div style={{
                        fontSize: 8, color: pal.text, opacity: 0.5,
                        fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3,
                      }}>NOTE</div>
                      <div style={{
                        fontSize: 13, color: pal.accent, fontStyle: 'italic',
                        fontFamily: "'Georgia', serif",
                      }}>
                        {config.notes}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Perforation divider */}
                <div style={{
                  marginLeft: 44,
                  height: 1,
                  backgroundImage: `repeating-linear-gradient(90deg, ${pal.accent}66 0px, ${pal.accent}66 6px, transparent 6px, transparent 12px)`,
                  position: 'relative',
                }}>
                  {/* Left notch */}
                  <div style={{
                    position: 'absolute', left: -12, top: -8,
                    width: 16, height: 16, borderRadius: '50%',
                    background: pal.bg,
                  }} />
                  {/* Right notch */}
                  <div style={{
                    position: 'absolute', right: -8, top: -8,
                    width: 16, height: 16, borderRadius: '50%',
                    background: pal.bg,
                  }} />
                </div>

                {/* Stub / barcode section */}
                <div style={{
                  marginLeft: 44,
                  background: pal.stub,
                  borderRadius: '0 0 14px 0',
                  padding: '14px 20px',
                  display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
                }}>
                  {/* Barcode */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{ display: 'flex', gap: 1.5, alignItems: 'stretch', height: 36 }}
                  >
                    {BARCODE.map(({ width, opacity }, i) => (
                      <div key={i} style={{ width, background: pal.accent, opacity }} />
                    ))}
                  </motion.div>

                  {/* Play audio button placeholder */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: pal.accent, border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: 'white', cursor: 'pointer',
                      boxShadow: `0 2px 8px ${pal.accent}55`,
                    }}
                    title="Save invitation"
                  >
                    ▲
                  </motion.button>
                </div>
              </motion.div>

              {/* ── Countdown ─────────────────────────────────────────── */}
              {config.countdownEnabled && config.date && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  style={{
                    width: 'min(340px, 100%)',
                    marginTop: 16,
                    background: `${pal.ticket}88`,
                    borderRadius: 12,
                    padding: '16px',
                    border: `1px solid ${pal.accent}33`,
                  }}
                >
                  <div style={{
                    textAlign: 'center', fontSize: 9, color: pal.accent,
                    fontFamily: 'sans-serif', textTransform: 'uppercase',
                    letterSpacing: 2, fontWeight: 700, marginBottom: 10,
                  }}>
                    ⏳ Countdown to the event
                  </div>
                  <Countdown targetDate={config.date} accent={pal.accent} />
                </motion.div>
              )}

              {/* ── Action row ────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                style={{
                  display: 'flex', gap: 10, marginTop: 16,
                  flexWrap: 'wrap', justifyContent: 'center',
                }}
              >
                {['💾 Save', '📤 Share', '💌 Reply'].map((btn) => (
                  <button
                    key={btn}
                    style={{
                      background: 'white', border: `1.5px solid ${pal.ticket}`,
                      borderRadius: 24, padding: '8px 18px',
                      fontSize: 12, color: pal.accent,
                      fontFamily: 'sans-serif', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
                  >
                    {btn}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
