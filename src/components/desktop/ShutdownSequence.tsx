'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShutdownSequenceProps {
  message: string;
  onRestart: () => void;
}

export default function ShutdownSequence({ message, onRestart }: ShutdownSequenceProps) {
  const [phase, setPhase] = useState<'fading' | 'crt' | 'black' | 'message'>('fading');

  useEffect(() => {
    const timeline = async () => {
      await delay(500);
      setPhase('crt');
      await delay(800);
      setPhase('black');
      await delay(600);
      setPhase('message');
    };
    timeline();
  }, []);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {/* CRT shutoff animation */}
        {phase === 'crt' && (
          <motion.div
            key="crt"
            className="absolute inset-0"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: [1, 0.1, 0.02, 0], scaleX: [1, 1, 0.2, 0] }}
            transition={{ duration: 0.7, ease: 'easeIn' }}
            style={{ background: 'white', transformOrigin: 'center' }}
          />
        )}

        {/* Final message */}
        {phase === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
            style={{ textAlign: 'center', padding: 32 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ fontSize: 64, marginBottom: 16 }}
            >
              💌
            </motion.div>
            <p
              style={{
                fontFamily: 'var(--font-hand)',
                fontSize: '28px',
                color: 'white',
                lineHeight: 1.5,
                maxWidth: 400,
                textShadow: '0 0 20px rgba(255,183,197,0.5)',
              }}
            >
              {message}
            </p>

            {/* Floating particles */}
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  y: -80 - Math.random() * 60,
                  x: (Math.random() - 0.5) * 120,
                }}
                transition={{ delay: 0.5 + i * 0.2, duration: 2, repeat: Infinity, repeatDelay: Math.random() * 2 }}
                style={{
                  position: 'absolute',
                  fontSize: 20,
                  bottom: '35%',
                  left: `${40 + Math.random() * 20}%`,
                  pointerEvents: 'none',
                }}
              >
                {['💗', '✨', '🌸', '💫', '⭐'][i % 5]}
              </motion.div>
            ))}

            <motion.button
              onClick={onRestart}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: 32,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 24,
                padding: '10px 24px',
                color: 'white',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-nunito)',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              🔄 Visit again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
