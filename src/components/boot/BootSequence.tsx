'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  recipientName: string;
  welcomeMessage: string;
  onComplete: () => void;
}

type BootPhase =
  | 'black'
  | 'crt-on'
  | 'bios'
  | 'logo'
  | 'loading'
  | 'starting'
  | 'welcome'
  | 'done';

const BIOS_LINES = [
  'DESKTOP DEAR BIOS v1.0.2 (c) 2025',
  'CPU: Memory of Love Processor @ 3.14GHz',
  'Memory Test: 65536K OK',
  'Detecting Primary Master... Heartstrings HDD',
  'Detecting Primary Slave... None',
  'Press DEL to enter Setup... (just kidding)',
  'Loading DESKTOP DEAR OS...',
  '',
  '♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥',
];

export default function BootSequence({ recipientName, welcomeMessage, onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<BootPhase>('black');
  const [biosLines, setBiosLines] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const timeline = async () => {
      // Phase 1: Black
      await delay(600);

      // Phase 2: CRT power on
      setPhase('crt-on');
      await delay(800);

      // Phase 3: BIOS
      setPhase('bios');
      for (let i = 0; i < BIOS_LINES.length; i++) {
        await delay(180);
        setBiosLines((prev) => [...prev, BIOS_LINES[i]]);
      }
      await delay(500);

      // Phase 4: Logo
      setPhase('logo');
      await delay(1200);

      // Phase 5: Loading bar
      setPhase('loading');
      for (let p = 0; p <= 100; p += 2) {
        await delay(30);
        setLoadingProgress(p);
      }
      await delay(400);

      // Phase 6: Starting
      setPhase('starting');
      await delay(800);

      // Phase 7: Welcome popup
      setPhase('welcome');
      setShowWelcome(true);
      await delay(3500);

      // Phase 8: Done
      setPhase('done');
      await delay(300);
      onComplete();
    };

    timeline();
  }, [onComplete]);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  if (phase === 'done') return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#000' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* CRT scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      <AnimatePresence mode="wait">
        {/* Black phase */}
        {phase === 'black' && (
          <motion.div key="black" className="w-full h-full bg-black" />
        )}

        {/* CRT power-on flash */}
        {phase === 'crt-on' && (
          <motion.div
            key="crt-on"
            className="w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 1] }}
            transition={{ duration: 0.6 }}
            style={{ background: '#111' }}
          >
            <motion.div
              initial={{ scaleX: 0, scaleY: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.2, 1], scaleY: [0, 0.05, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
              style={{ background: '#0A0A14', transformOrigin: 'center' }}
            />
          </motion.div>
        )}

        {/* BIOS screen */}
        {phase === 'bios' && (
          <motion.div
            key="bios"
            className="w-full h-full p-8 flex flex-col"
            style={{ background: '#0A0A14' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-2xl">
              {biosLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className="bios-text"
                >
                  {line === '' ? '\u00A0' : line}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Logo screen */}
        {phase === 'logo' && (
          <motion.div
            key="logo"
            className="w-full h-full flex flex-col items-center justify-center gap-6"
            style={{ background: '#0A0A1E' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Cute monitor icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-8xl"
            >
              🖥️
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontFamily: 'var(--font-vt323)', color: '#4EBFBF', fontSize: '48px', letterSpacing: '4px' }}
            >
              DESKTOP DEAR
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ fontFamily: 'var(--font-vt323)', color: '#888', fontSize: '18px' }}
            >
              OS v1.0.0 · A tiny computer filled with memories.
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
              transition={{ delay: 0.8, duration: 1.2 }}
              style={{ fontFamily: 'var(--font-vt323)', color: '#FFB7C5', fontSize: '20px' }}
            >
              ♥ ♥ ♥ ♥ ♥
            </motion.div>
          </motion.div>
        )}

        {/* Loading bar */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            className="w-full h-full flex flex-col items-center justify-center gap-6"
            style={{ background: '#0A0A1E' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl">💿</div>
            <div style={{ fontFamily: 'var(--font-vt323)', color: '#4EBFBF', fontSize: '32px' }}>
              Loading your memories...
            </div>
            <div className="loading-bar w-80">
              <motion.div
                className="loading-bar-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div style={{ fontFamily: 'var(--font-vt323)', color: '#666', fontSize: '16px' }}>
              {loadingProgress}%
            </div>
          </motion.div>
        )}

        {/* Starting up */}
        {phase === 'starting' && (
          <motion.div
            key="starting"
            className="w-full h-full flex flex-col items-center justify-center gap-4"
            style={{ background: '#0A0A1E' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="text-4xl"
            >
              ⚙️
            </motion.div>
            <div style={{ fontFamily: 'var(--font-vt323)', color: '#CCC', fontSize: '24px' }}>
              Starting Desktop Dear OS...
            </div>
          </motion.div>
        )}

        {/* Welcome popup */}
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4EBFBF 0%, #3AA0A0 40%, #5BB8D4 70%, #4EBFBF 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  className="welcome-popup"
                  initial={{ scale: 0.5, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-5xl mb-4"
                  >
                    💌
                  </motion.div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#3A3A3A',
                      marginBottom: '8px',
                    }}
                  >
                    Hello, {recipientName}! 🌸
                  </h2>
                  <p
                    style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: 1.6,
                    }}
                  >
                    {welcomeMessage}
                  </p>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: '#AAA', marginTop: '16px' }}
                  >
                    Double-click the icons to explore...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
