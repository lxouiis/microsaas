'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameConfig } from '@/lib/types';
import { useDesktopStore } from '@/stores/desktopStore';
import { useSound } from '@/hooks/useSound';

interface Star {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  caught: boolean;
}

interface GameAppProps {
  config: GameConfig;
}

export default function GameApp({ config }: GameAppProps) {
  const { earnStar, starEarned } = useDesktopStore();
  const sounds = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const caughtRef = useRef(0);
  const timeRef = useRef(30);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [caught, setCaught] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const TARGET_STARS = 10;
  const GAME_DURATION = 30;

  const spawnStar = useCallback((): Star => ({
    id: Date.now() + Math.random(),
    x: Math.random() * 460 + 10,
    y: -20,
    speed: 1 + Math.random() * 2,
    size: 16 + Math.random() * 16,
    caught: false,
  }), []);

  const startGame = () => {
    starsRef.current = [];
    caughtRef.current = 0;
    timeRef.current = GAME_DURATION;
    setCaught(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    // Timer
    const timer = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        setGameState('lost');
        clearInterval(timer);
      }
    }, 1000);

    // Star spawner
    const spawner = setInterval(() => {
      if (starsRef.current.length < 8) {
        starsRef.current.push(spawnStar());
      }
    }, 500);

    // Canvas animation loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(
          (i * 137) % canvas.width,
          (i * 97 + Date.now() * 0.01) % canvas.height,
          1,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      starsRef.current = starsRef.current.filter((s) => !s.caught && s.y < canvas.height + 30);
      starsRef.current.forEach((star) => {
        star.y += star.speed;
        // Draw star emoji via canvas
        ctx.font = `${star.size}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⭐', star.x, star.y);
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, spawnStar]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = starsRef.current.find((s) => {
      const dx = s.x - mx;
      const dy = s.y - my;
      return Math.sqrt(dx * dx + dy * dy) < s.size;
    });

    if (hit) {
      hit.caught = true;
      sounds.star();
      caughtRef.current += 1;
      setCaught(caughtRef.current);

      if (caughtRef.current >= TARGET_STARS) {
        setGameState('won');
        earnStar();
        // Spawn confetti
        setConfetti(
          Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 40 + 20,
            emoji: ['⭐', '✨', '💫', '🌟'][i % 4],
          }))
        );
        setTimeout(() => setConfetti([]), 3000);
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center h-full"
      style={{ background: 'linear-gradient(180deg, #0A0A2A 0%, #1A1A4A 100%)', padding: 16, fontFamily: 'var(--font-nunito)' }}
    >
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ top: `${c.y}%`, left: `${c.x}%`, opacity: 1, scale: 0.5 }}
            animate={{ top: '-20%', opacity: 0, scale: 1.5, rotate: 360 }}
            transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
            style={{ position: 'absolute', fontSize: 24 }}
          >
            {c.emoji}
          </motion.div>
        ))}
      </div>

      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
        <div style={{ color: '#FFD700', fontSize: 13, fontWeight: 700 }}>
          ⭐ {caught}/{TARGET_STARS}
        </div>
        <div style={{ color: timeLeft <= 10 ? '#FF6B6B' : '#CCC', fontSize: 13, fontWeight: 700 }}>
          ⏱ {timeLeft}s
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div
            key="idle"
            className="flex flex-col items-center justify-center flex-1 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: 48 }}
            >
              ⭐
            </motion.div>
            <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Star Catcher</div>
            <div style={{ color: '#888', fontSize: 12, lineHeight: 1.6 }}>
              Catch {TARGET_STARS} falling stars in {GAME_DURATION} seconds!<br />
              Win to earn a ⭐ for your desktop!
            </div>
            {starEarned && (
              <div style={{ color: '#FFD700', fontSize: 11, padding: '6px 12px', background: 'rgba(255,215,0,0.1)', borderRadius: 20, border: '1px solid rgba(255,215,0,0.3)' }}>
                ✨ You already earned your star! Play again?
              </div>
            )}
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                borderRadius: 20,
                padding: '10px 28px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                color: '#3A2800',
                boxShadow: '0 4px 12px rgba(255,165,0,0.4)',
              }}
            >
              ▶ Start Game!
            </motion.button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1 }}>
            <canvas
              ref={canvasRef}
              width={460}
              height={340}
              className="game-canvas"
              onClick={handleCanvasClick}
              style={{ display: 'block', cursor: 'crosshair' }}
            />
            <div style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
              Click the ⭐ stars before they fall!
            </div>
          </motion.div>
        )}

        {gameState === 'won' && (
          <motion.div
            key="won"
            className="flex flex-col items-center justify-center flex-1 gap-4 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: 3, duration: 0.5 }}
              style={{ fontSize: 56 }}
            >
              🌟
            </motion.div>
            <div style={{ color: '#FFD700', fontSize: 20, fontWeight: 800 }}>You won!</div>
            <div style={{ color: '#DDD', fontSize: 15, lineHeight: 1.7, maxWidth: 280, fontFamily: 'var(--font-hand)' }}>
              {config.rewardMessage}
            </div>
            <div style={{ color: '#FFD700', fontSize: 12, background: 'rgba(255,215,0,0.1)', padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(255,215,0,0.3)' }}>
              ⭐ A star has been added to your desktop!
            </div>
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '8px 20px', fontSize: 12, color: 'white', cursor: 'pointer' }}
            >
              Play again
            </motion.button>
          </motion.div>
        )}

        {gameState === 'lost' && (
          <motion.div
            key="lost"
            className="flex flex-col items-center justify-center flex-1 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ fontSize: 48 }}>💫</div>
            <div style={{ color: '#FF6B6B', fontSize: 18, fontWeight: 700 }}>So close!</div>
            <div style={{ color: '#888', fontSize: 12 }}>You caught {caught}/{TARGET_STARS} stars. Try again!</div>
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: 20, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#3A2800' }}
            >
              Try Again!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
