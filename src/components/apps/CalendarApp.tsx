'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarConfig } from '@/lib/types';

interface CalendarAppProps {
  config: CalendarConfig;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarApp({ config }: CalendarAppProps) {
  const [showMemory, setShowMemory] = useState(false);

  const { year, month, highlightedDay } = config;
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const days: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (days.length % 7 !== 0) days.push(null);

  return (
    <div
      className="flex flex-col h-full overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #F0F8FF 0%, #EEF0FF 100%)',
        padding: 16,
        fontFamily: 'var(--font-nunito)',
      }}
    >
      {/* Calendar header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 12,
        background: 'white',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
          {year}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>
          {MONTHS[month - 1]}
        </div>
      </div>

      {/* Days of week header */}
      <div className="calendar-grid" style={{ marginBottom: 4 }}>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#888',
            padding: '2px 0',
            textTransform: 'uppercase',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {days.map((day, idx) => (
          <motion.div
            key={idx}
            className={`calendar-day ${day === highlightedDay ? 'highlighted' : ''}`}
            style={{
              color: day === null ? 'transparent' : day === highlightedDay ? 'white' : '#2A2A2A',
              fontSize: 13,
              fontWeight: day === highlightedDay ? 800 : 400,
              cursor: day === highlightedDay ? 'pointer' : 'default',
              background: day === highlightedDay ? 'var(--pink-accent)' : undefined,
            }}
            onClick={() => day === highlightedDay && setShowMemory(true)}
            whileHover={day === highlightedDay ? { scale: 1.15 } : {}}
            whileTap={day === highlightedDay ? { scale: 0.95 } : {}}
            initial={day === highlightedDay ? { scale: 0.8 } : {}}
            animate={day === highlightedDay ? { scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {day || ''}
          </motion.div>
        ))}
      </div>

      {/* Hint */}
      {!showMemory && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#AAA' }}
        >
          Click the highlighted date to see a memory 💝
        </motion.div>
      )}

      {/* Memory card */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              marginTop: 12,
              background: 'white',
              borderRadius: 12,
              padding: '16px 20px',
              border: '2px solid var(--pink-accent)',
              boxShadow: '0 4px 16px rgba(255,183,197,0.3)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowMemory(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 10,
                background: 'none',
                border: 'none',
                fontSize: 14,
                cursor: 'pointer',
                color: '#AAA',
              }}
            >
              ×
            </button>
            <div style={{ fontSize: 11, color: '#BBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              📅 {MONTHS[month - 1]} {highlightedDay}, {year}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#2A2A2A', marginBottom: 8 }}>
              {config.memoryTitle}
            </div>
            <div style={{
              fontFamily: 'var(--font-hand)',
              fontSize: 15,
              color: '#555',
              lineHeight: 1.7,
            }}>
              {config.memoryText}
            </div>
            {config.memoryPhotoUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginTop: 12 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.memoryPhotoUrl}
                  alt="Memory"
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 160 }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
