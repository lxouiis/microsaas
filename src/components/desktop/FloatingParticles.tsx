'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

export default function FloatingParticles() {
  const EMOJIS = ['💗', '✨', '🌸', '⭐', '💫', '🌟', '💝', '🦋'];
  const PARTICLE_COUNT = 12;

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: (i / PARTICLE_COUNT) * 100 + Math.random() * 8,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 10,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    size: 12 + Math.random() * 10,
  }));

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
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight : 600) - 80],
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, Math.random() > 0.5 ? 180 : -180],
            x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 4,
            ease: 'easeOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
