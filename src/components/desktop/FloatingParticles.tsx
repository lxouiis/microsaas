'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Seeded pseudo-random — same value on server & client, no hydration mismatch
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const EMOJIS = ['💗', '✨', '🌸', '⭐', '💫', '🌟', '💝', '🦋'];
const PARTICLE_COUNT = 12;

export default function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x:        (i / PARTICLE_COUNT) * 100 + seededRand(i * 3) * 8,
      delay:    seededRand(i * 7) * 8,
      duration: 8 + seededRand(i * 11) * 10,
      emoji:    EMOJIS[Math.floor(seededRand(i * 13) * EMOJIS.length)],
      size:     12 + seededRand(i * 17) * 10,
      rotDir:   seededRand(i * 5) > 0.5 ? 180 : -180,
      driftA:   (seededRand(i * 19) - 0.5) * 40,
      driftB:   (seededRand(i * 23) - 0.5) * 80,
      repeatDel: seededRand(i * 29) * 4,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-5%',
            fontSize: p.size,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          animate={{
            y: [0, -700],
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, p.rotDir],
            x: [p.driftA, p.driftB],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: p.repeatDel,
            ease: 'easeOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
