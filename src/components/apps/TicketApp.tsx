'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TicketConfig } from '@/lib/types';

interface TicketAppProps {
  config: TicketConfig;
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
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

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[
        { value: timeLeft.days, label: 'DAYS' },
        { value: timeLeft.hours, label: 'HRS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEC' },
      ].map(({ value, label }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 6,
            padding: '4px 8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: 20,
            color: '#5A3A00',
            minWidth: 40,
          }}>
            {String(value).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 8, color: '#888', fontWeight: 700, marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function TicketApp({ config }: TicketAppProps) {
  const [unfolded, setUnfolded] = useState(false);

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return d; }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #FFF5D0 0%, #FFE8A0 100%)',
        padding: 24,
        fontFamily: 'var(--font-nunito)',
      }}
    >
      <AnimatePresence mode="wait">
        {!unfolded ? (
          <motion.div
            key="folded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={() => setUnfolded(true)}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: 24,
              background: 'white',
              borderRadius: 12,
              border: '3px solid #D4B800',
              boxShadow: '4px 4px 0 #B89A00',
            }}
            whileHover={{ scale: 1.03, rotate: 1 }}
            whileTap={{ scale: 0.97 }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎟️</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: '#888', letterSpacing: 2 }}>
              TAP TO UNFOLD YOUR INVITATION
            </div>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, type: 'tween', ease: 'easeInOut' }}
              style={{ fontSize: 11, color: '#AAA', marginTop: 8 }}
            >
              ↕ unfold me
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="ticket"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{ width: '100%', maxWidth: 360 }}
          >
            {/* Ticket main body */}
            <div className="ticket-body">
              {/* Top section */}
              <div style={{ padding: '20px 24px 16px', textAlign: 'center', position: 'relative' }}>
                {/* Star stamp */}
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: -12, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 16,
                    background: '#FF4444',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: 4,
                    letterSpacing: 0.5,
                    fontFamily: 'var(--font-pixel)',
                  }}
                >
                  ADMIT ONE
                </motion.div>

                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#888', letterSpacing: 2, marginBottom: 6 }}>
                  ★ DESKTOP DEAR ★
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#3A2800', letterSpacing: 1, lineHeight: 1.2 }}>
                  {config.title}
                </div>
                {config.subtitle && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
                    {config.subtitle}
                  </div>
                )}
              </div>

              {/* Perforation */}
              <div className="ticket-perforation" />

              {/* Details section */}
              <div style={{ padding: '16px 24px' }}>
                {[
                  { icon: '📅', label: 'Date', value: formatDate(config.date) },
                  { icon: '🕐', label: 'Time', value: config.time },
                  { icon: '📍', label: 'Location', value: config.location },
                  ...(config.dresscode ? [{ icon: '👗', label: 'Dress Code', value: config.dresscode }] : []),
                  ...(config.notes ? [{ icon: '💌', label: 'Notes', value: config.notes }] : []),
                ].map(({ icon, label, value }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    style={{
                      display: 'flex',
                      gap: 10,
                      marginBottom: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 9, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#3A2800', marginTop: 1 }}>{value}</div>
                    </div>
                  </motion.div>
                ))}

                {/* Barcode decoration */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}
                >
                  <div style={{ display: 'flex', gap: 1, alignItems: 'stretch', height: 32 }}>
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: i % 3 === 0 ? 3 : 1,
                          background: '#3A2800',
                          opacity: 0.4 + Math.random() * 0.4,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Countdown */}
                {config.countdownEnabled && config.date && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{ marginTop: 16, padding: '10px 0', borderTop: '1px dashed #D4B800' }}
                  >
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#888', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                      ⏳ Countdown
                    </div>
                    <Countdown targetDate={config.date} />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
