'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SecretConfig } from '@/lib/types';
import { useSound } from '@/hooks/useSound';

interface SecretAppProps {
  config: SecretConfig;
}

export default function SecretApp({ config }: SecretAppProps) {
  const sounds = useSound();
  const [phase, setPhase] = useState<'locked' | 'unlocking' | 'unlocked' | 'wrong'>('locked');
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (input.toLowerCase().trim() === config.password.toLowerCase().trim()) {
      setPhase('unlocking');
      sounds.unlock();
      setTimeout(() => setPhase('unlocked'), 800);
    } else {
      sounds.error();
      setPhase('wrong');
      setTimeout(() => setPhase('locked'), 800);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        padding: 24,
        fontFamily: 'var(--font-nunito)',
      }}
    >
      <AnimatePresence mode="wait">
        {/* Locked state */}
        {(phase === 'locked' || phase === 'wrong') && (
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: phase === 'wrong' ? [-8, 8, -8, 8, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={phase === 'wrong' ? { duration: 0.4 } : { type: 'spring', stiffness: 200 }}
            className="password-dialog"
            style={{ maxWidth: 300, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Folder icon */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', type: 'tween' }}
              style={{ fontSize: 48, marginBottom: 12 }}
            >
              🔒
            </motion.div>

            <div style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              {config.title || 'Secret Folder'}
            </div>

            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              marginBottom: 16,
              fontStyle: 'italic',
            }}>
              Hint: {config.passwordHint}
            </div>

            {phase === 'wrong' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: '#FF6B6B', fontSize: 11, marginBottom: 8 }}
              >
                ✗ Wrong password. Try again!
              </motion.div>
            )}

            <input
              ref={inputRef}
              type="password"
              maxLength={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter 4-digit key..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${phase === 'wrong' ? '#FF6B6B' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 8,
                padding: '8px 12px',
                color: 'white',
                fontSize: 13,
                outline: 'none',
                marginBottom: 10,
                fontFamily: 'var(--font-nunito)',
              }}
              autoFocus
            />

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFB7C5, #C8B4E3)',
                border: 'none',
                borderRadius: 8,
                padding: '10px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                color: '#2A1A3A',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              Unlock 🔑
            </motion.button>

            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 10 }}>
              🔐 This folder is protected with love
            </div>
          </motion.div>
        )}

        {/* Unlocking animation */}
        {phase === 'unlocking' && (
          <motion.div
            key="unlocking"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.3, 1], opacity: 1, rotate: [0, 20, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 56 }}>🔓</div>
            <motion.div
              animate={{ opacity: [0, 1, 0, 1] }}
              transition={{ duration: 0.6 }}
              style={{ color: '#FFD700', fontSize: 16, fontWeight: 700, marginTop: 8 }}
            >
              ✨ Unlocking...
            </motion.div>
          </motion.div>
        )}

        {/* Unlocked state */}
        {phase === 'unlocked' && (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ width: '100%', height: '100%', overflow: 'auto' }}
          >
            {/* Sparkle header */}
            <motion.div
              style={{ textAlign: 'center', marginBottom: 16 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: 40, marginBottom: 4 }}
              >
                🎉
              </motion.div>
              <div style={{ color: '#FFD700', fontSize: 13, fontWeight: 700 }}>
                You found the secret! ✨
              </div>
            </motion.div>

            {/* Content */}
            {config.contentType === 'message' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  color: 'white',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-hand)',
                  fontSize: 15,
                }}
              >
                {config.content}
              </motion.div>
            )}

            {config.contentType === 'video' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ borderRadius: 12, overflow: 'hidden' }}
              >
                <video src={config.content} controls style={{ width: '100%', borderRadius: 12 }} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
