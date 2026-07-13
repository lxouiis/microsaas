'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GachaConfig } from '@/lib/types';
import { useDesktopStore } from '@/stores/desktopStore';
import { useSound } from '@/hooks/useSound';

interface GachaAppProps {
  config: GachaConfig;
}

type GachaPhase = 'idle' | 'coin' | 'turning' | 'shaking' | 'rolling' | 'revealing' | 'done';

export default function GachaApp({ config }: GachaAppProps) {
  const { openedCapsules, openCapsule } = useDesktopStore();
  const sounds = useSound();
  const [phase, setPhase] = useState<GachaPhase>('idle');
  const [currentCapsule, setCurrentCapsule] = useState<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; emoji: string }[]>([]);

  const totalCapsules = config.capsules.length;
  const remainingCapsules = config.capsules.filter((_, i) => !openedCapsules.includes(i));
  const allUsed = remainingCapsules.length === 0;

  const getNextCapsuleIndex = useCallback(() => {
    const available = config.capsules
      .map((_, i) => i)
      .filter((i) => !openedCapsules.includes(i));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }, [config.capsules, openedCapsules]);

  const spawnConfetti = (capsuleColor: string) => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#FFB7C5', '#B4E3D1', '#FFD6B8', '#C8B4E3', '#FFE680', '#FFFAAA'][i % 6],
      emoji: ['✨', '🌸', '⭐', '💫', '🎊', '🎁', '💖'][i % 7],
    }));
    setConfetti(items);
    setTimeout(() => setConfetti([]), 2500);
  };

  const handleCoinInsert = async () => {
    if (phase !== 'idle' || allUsed) return;
    const nextIdx = getNextCapsuleIndex();
    if (nextIdx === null) return;

    sounds.coinDrop();
    setPhase('coin');
    await delay(700);

    setPhase('turning');
    sounds.cassette(); // Use click sound for crank turn
    await delay(1200);

    setPhase('shaking');
    await delay(600);

    setCurrentCapsule(nextIdx);
    setPhase('rolling');
    await delay(900);

    setPhase('idle');
  };

  const handleCapsuleClick = () => {
    if (currentCapsule === null || phase !== 'idle') return;
    sounds.capsuleOpen();
    setPhase('revealing');
    openCapsule(currentCapsule);
    const cap = config.capsules[currentCapsule];
    spawnConfetti(cap.color);
    setShowMessage(true);
    setTimeout(() => {
      setPhase('done');
    }, 200);
  };

  const handleReset = () => {
    setCurrentCapsule(null);
    setShowMessage(false);
    setPhase('idle');
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const rarityLabel: Record<string, string> = {
    normal: '',
    rare: '✨ RARE!',
    legendary: '🌟 LEGENDARY!',
  };

  // Fixed static positions for capsules in the glass case to prevent recalculating on render
  const capsulePositions = [
    { x: 120, y: 220, r: -15 },
    { x: 155, y: 232, r: 10 },
    { x: 195, y: 225, r: -5 },
    { x: 232, y: 235, r: 25 },
    { x: 270, y: 220, r: -20 },
    { x: 105, y: 235, r: 40 },
    { x: 295, y: 238, r: -35 },
    { x: 175, y: 215, r: -10 },
    { x: 250, y: 210, r: 15 },
    { x: 215, y: 240, r: 8 },
  ];

  return (
    <div
      className="flex flex-col items-center justify-between h-full overflow-auto select-none"
      style={{
        background: 'linear-gradient(180deg, #E6F4F8 0%, #FAF0E6 100%)',
        padding: '16px',
        fontFamily: 'var(--font-nunito)',
      }}
    >
      {/* Confetti overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ top: '45%', left: `${c.x}%`, opacity: 1, scale: 0 }}
            animate={{ top: '-10%', opacity: 0, scale: 1.5, rotate: Math.random() * 720 }}
            transition={{ duration: 2.2 + Math.random() * 0.8, ease: 'easeOut' }}
            style={{ position: 'absolute', fontSize: 24 }}
          >
            {c.emoji}
          </motion.div>
        ))}
      </div>

      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#3A3A3A', letterSpacing: 0.5, fontFamily: 'var(--font-nunito)' }}>
          A tiny gacha for you
        </h2>
        <div style={{ fontSize: 11, color: '#777', fontWeight: 600 }}>
          {remainingCapsules.length} / {totalCapsules} capsules remaining
        </div>
      </div>

      {/* Gacha Machine Container */}
      {!allUsed ? (
        <div className="relative flex items-center justify-center" style={{ width: '380px', height: '460px' }}>
          
          {/* Main Hand-drawn SVG Gacha Machine */}
          <motion.svg
            width="350"
            height="450"
            viewBox="0 0 350 450"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={phase === 'shaking' ? {
              x: [-3, 3, -4, 4, -2, 2, 0],
              y: [-1, 2, -2, 1, -1, 1, 0],
            } : {}}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }}
          >
            {/* Top Red Rim with slight curve */}
            <path
              d="M 45,55 Q 175,40 305,55 C 310,55 315,60 315,65 L 315,80 C 315,82 310,80 305,80 Q 175,70 45,80 C 40,80 35,82 35,80 L 35,65 C 35,60 40,55 45,55 Z"
              fill="#E15545"
              stroke="#333"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Cream Main Body Case */}
            <rect
              x="38"
              y="78"
              width="274"
              height="348"
              rx="12"
              ry="12"
              fill="#FFFDF7"
              stroke="#333"
              strokeWidth="4"
            />

            {/* Red Bottom Trim */}
            <rect
              x="30"
              y="420"
              width="290"
              height="16"
              rx="8"
              fill="#E15545"
              stroke="#333"
              strokeWidth="4"
            />
            {/* Machine Feet */}
            <rect x="55" y="436" width="30" height="8" rx="2" fill="#E15545" stroke="#333" strokeWidth="3" />
            <rect x="265" y="436" width="30" height="8" rx="2" fill="#E15545" stroke="#333" strokeWidth="3" />

            {/* Glass Display Window (Upper half) */}
            <rect
              x="50"
              y="92"
              width="250"
              height="150"
              rx="16"
              ry="16"
              fill="#F2F8FC"
              stroke="#333"
              strokeWidth="4"
            />

            {/* Poster inside Glass: "OPEN WHEN YOU'RE READY" */}
            <g>
              <rect
                x="64"
                y="104"
                width="222"
                height="100"
                rx="6"
                fill="#FFF4E3"
                stroke="#333"
                strokeWidth="3"
              />
              {/* Poster Title text */}
              <text x="74" y="132" fill="#F45A3E" fontSize="20" fontWeight="900" style={{ letterSpacing: '0.5px' }}>
                OPEN
              </text>
              <text x="74" y="154" fill="#F45A3E" fontSize="20" fontWeight="900" style={{ letterSpacing: '0.5px' }}>
                WHEN
              </text>
              <text x="74" y="176" fill="#F45A3E" fontSize="16" fontWeight="900" style={{ letterSpacing: '0.5px' }}>
                YOU&apos;RE
              </text>
              <text x="74" y="194" fill="#F45A3E" fontSize="16" fontWeight="900" style={{ letterSpacing: '0.5px' }}>
                READY.
              </text>

              {/* Poster illustration: capsule + envelope */}
              <circle cx="218" cy="154" r="26" fill="#FAF6EE" stroke="#333" strokeWidth="2" strokeDasharray="3,3" />
              {/* Mini capsule sticker */}
              <path d="M 215,138 C 224,138 230,144 230,154 L 200,154 C 200,144 206,138 215,138 Z" fill="#F59EB0" stroke="#333" strokeWidth="2" />
              <path d="M 215,170 C 206,170 200,164 200,154 L 230,154 C 230,164 224,170 215,170 Z" fill="#FFF" stroke="#333" strokeWidth="2" />
              {/* Mini envelope */}
              <rect x="206" y="147" width="18" height="13" rx="2" fill="#FFF" stroke="#333" strokeWidth="1.5" />
              <path d="M 206,147 L 215,154 L 224,147" fill="none" stroke="#333" strokeWidth="1.5" />
              {/* Little heart sticker inside poster */}
              <path d="M 215,152 Q 215,150 213,150 C 211,150 210,151 210,153 C 210,155 215,157 215,157 C 215,157 220,155 220,153 C 220,151 219,150 217,150 Q 215,150 215,152 Z" fill="#E15545" />

              {/* Small details on poster */}
              <text x="240" y="184" fill="#8A6B50" fontSize="7" fontWeight="800">DESIGNED BY</text>
              <text x="240" y="193" fill="#8A6B50" fontSize="8" fontWeight="900">SHOKO :)</text>

              <rect x="180" y="180" width="46" height="15" rx="3" fill="#0D7FCE" stroke="#333" strokeWidth="1.5" />
              <text x="186" y="190" fill="#FFF" fontSize="8" fontWeight="800">¥200 ONLY</text>
            </g>

            {/* Capsules inside displaying case */}
            <g>
              {config.capsules.map((cap, i) => {
                const isOpened = openedCapsules.includes(i);
                if (isOpened) return null; // Hide opened capsules completely

                const pos = capsulePositions[i % capsulePositions.length];

                return (
                  <motion.g
                    key={i}
                    animate={phase === 'shaking' ? {
                      y: [0, -12, 4, -6, 2, 0],
                      x: [0, Math.sin(i) * 8, Math.sin(i) * -4, 0],
                      rotate: [pos.r, pos.r + 20, pos.r - 20, pos.r],
                    } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  >
                    {/* Top half colored */}
                    <path
                      d={`M ${pos.x},${pos.y - 12} C ${pos.x + 12},${pos.y - 12} ${pos.x + 12},${pos.y} ${pos.x + 12},${pos.y} L ${pos.x - 12},${pos.y} C ${pos.x - 12},${pos.y} ${pos.x - 12},${pos.y - 12} ${pos.x},${pos.y - 12} Z`}
                      fill={cap.color}
                      stroke="#333"
                      strokeWidth="2"
                    />
                    {/* Bottom half white */}
                    <path
                      d={`M ${pos.x},${pos.y + 12} C ${pos.x - 12},${pos.y + 12} ${pos.x - 12},${pos.y} ${pos.x - 12},${pos.y} L ${pos.x + 12},${pos.y} C ${pos.x + 12},${pos.y} ${pos.x + 12},${pos.y + 12} ${pos.x},${pos.y + 12} Z`}
                      fill="#FFF"
                      stroke="#333"
                      strokeWidth="2"
                    />
                    {/* Separation line */}
                    <line x1={pos.x - 12} y1={pos.y} x2={pos.x + 12} y2={pos.y} stroke="#333" strokeWidth="2.5" />
                    {/* Tiny shine reflection */}
                    <path d={`M ${pos.x - 7},${pos.y - 8} Q ${pos.x - 3},${pos.y - 10} ${pos.x},${pos.y - 9}`} stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>
                );
              })}
            </g>

            {/* Glass Shine Diagonal highlights */}
            <path d="M 60,102 L 110,92 M 280,242 L 295,230" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <path d="M 50,150 L 70,110" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

            {/* Console separator line */}
            <line x1="38" y1="250" x2="312" y2="250" stroke="#333" strokeWidth="4" />

            {/* Middle controls panel elements */}
            <g>
              {/* Badge 1: 各200円 (税込) */}
              <rect x="50" y="260" width="70" height="24" rx="4" fill="#FFF" stroke="#333" strokeWidth="2.5" />
              <rect x="52" y="262" width="66" height="20" rx="2" fill="#5CB9F2" />
              <text x="60" y="276" fill="#FFF" fontSize="10" fontWeight="900">各200円</text>

              {/* Badge 2: 100円玉 専用 */}
              <rect x="126" y="260" width="56" height="24" rx="4" fill="#FFF" stroke="#333" strokeWidth="2.5" />
              <rect x="128" y="262" width="52" height="20" rx="2" fill="#F59EB0" />
              <text x="133" y="275" fill="#FFF" fontSize="9" fontWeight="900">100円玉専用</text>

              {/* Coin badge slot pointer */}
              <rect x="188" y="260" width="60" height="15" rx="3" fill="#FFF" stroke="#333" strokeWidth="2" />
              <text x="192" y="270" fill="#333" fontSize="8" fontWeight="800" style={{ letterSpacing: '0.2px' }}>
                コイン投入口▼
              </text>

              {/* Left Instructions label box */}
              <rect x="50" y="296" width="78" height="38" rx="4" fill="#FFF" stroke="#333" strokeWidth="2" />
              <text x="54" y="308" fill="#D24A32" fontSize="7" fontWeight="900">▶ ハンドルをゆっくり</text>
              <text x="54" y="318" fill="#D24A32" fontSize="7" fontWeight="900">1回転させてください。</text>

              {/* Age limit badge (対象年齢 6才以上) */}
              <rect x="50" y="394" width="46" height="18" rx="3" fill="#10B981" stroke="#333" strokeWidth="2" />
              <text x="54" y="406" fill="#FFF" fontSize="7" fontWeight="900">対象年齢6才以上</text>

              {/* Coin Return Badge (コイン返却ボタン) */}
              <g style={{ cursor: 'pointer' }} onClick={handleReset}>
                <rect x="250" y="265" width="48" height="28" rx="4" fill="#FFF" stroke="#333" strokeWidth="2.5" />
                <rect x="252" y="267" width="44" height="24" rx="2" fill="#0D7FCE" />
                <text x="256" y="278" fill="#FFF" fontSize="7" fontWeight="900">コイン返却</text>
                <text x="260" y="287" fill="#FFF" fontSize="8" fontWeight="900">ボタン❤️</text>
              </g>

              {/* Keyhole decoration */}
              <circle cx="274" cy="316" r="10" fill="#E5E7EB" stroke="#333" strokeWidth="2" />
              <line x1="274" y1="311" x2="274" y2="321" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Central Crank dial */}
            <g>
              {/* Outer dial ring */}
              <circle cx="196" cy="336" r="46" fill="#FFF" stroke="#333" strokeWidth="4" />
              <circle cx="196" cy="336" r="38" fill="#0D7FCE" stroke="#333" strokeWidth="2" />

              {/* Crank turn path arrow decoration */}
              <path d="M 166,310 A 34,34 0 0,1 226,310" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,3" />
              <path d="M 223,308 L 229,313 L 222,318" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Rotating crank knob group */}
              <motion.g
                animate={phase === 'turning' ? { rotate: [0, 180, 360] } : {}}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                style={{ transformOrigin: '196px 336px', cursor: phase === 'idle' && !allUsed ? 'pointer' : 'not-allowed' }}
                onClick={handleCoinInsert}
              >
                {/* Inner white circle */}
                <circle cx="196" cy="336" r="24" fill="#FFF" stroke="#333" strokeWidth="2" />
                {/* Horizontal oblong dial bar */}
                <rect x="175" y="328" width="42" height="16" rx="8" fill="#FFF" stroke="#333" strokeWidth="2.5" />
                <circle cx="196" cy="336" r="4" fill="#6B7280" />
              </motion.g>
            </g>

            {/* Prize Chute Box (Bottom right) */}
            <g>
              <rect x="215" y="356" width="75" height="55" rx="10" fill="#374151" stroke="#333" strokeWidth="4" />
              <rect x="220" y="361" width="65" height="45" rx="8" fill="#1F2937" />
              <path d="M 220,380 L 285,380" stroke="#333" strokeWidth="2" />
            </g>
          </motion.svg>

          {/* Interactive coin slot hit area (Flashes gently when ready) */}
          {phase === 'idle' && !allUsed && (
            <motion.div
              onClick={handleCoinInsert}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '254px',
                left: '185px',
                width: '64px',
                height: '24px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: '2.5px solid #E15545',
                background: 'rgba(255,215,0,0.15)',
                zIndex: 10,
              }}
              title="Click here to insert coin!"
            />
          )}

          {/* Falling Coin Animation */}
          {phase === 'coin' && (
            <motion.div
              initial={{ y: 220, x: 22, opacity: 1, scale: 1 }}
              animate={{ y: 270, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                fontSize: 24,
                zIndex: 15,
              }}
            >
              🪙
            </motion.div>
          )}

          {/* Dispensed Capsule sitting in Chute */}
          <AnimatePresence>
            {currentCapsule !== null && (phase === 'idle' || phase === 'done') && !showMessage && (
              <motion.div
                key="dispensed-capsule"
                initial={{ y: -190, x: -72, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                onClick={handleCapsuleClick}
                style={{
                  position: 'absolute',
                  top: '364px',
                  left: '232px',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  filter: `drop-shadow(0 4px 8px ${config.capsules[currentCapsule].color}66)`,
                }}
                whileHover={{ scale: 1.15, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                title="Click capsule to open! 🌸"
              >
                {/* Hand-drawn look capsule representing output */}
                <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                  {/* Top half */}
                  <div style={{
                    width: '36px',
                    height: '18px',
                    borderRadius: '18px 18px 0 0',
                    background: config.capsules[currentCapsule].color,
                    border: '3px solid #333',
                    borderBottom: 'none',
                  }} />
                  {/* Bottom half */}
                  <div style={{
                    width: '36px',
                    height: '18px',
                    borderRadius: '0 0 18px 18px',
                    background: '#FFF',
                    border: '3px solid #333',
                    borderTop: 'none',
                  }} />
                  {/* Separation line strip */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: 0,
                    width: '36px',
                    height: '4px',
                    background: '#333',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '8px',
                    height: '4px',
                    background: '#FFF',
                    borderRadius: '50%',
                    opacity: 0.6,
                  }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: 24 }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏮</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#3A3A3A' }}>No more capsules! ❤️</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>You found all {totalCapsules} messages!</div>
        </motion.div>
      )}

      {/* Revealed message */}
      <AnimatePresence>
        {showMessage && currentCapsule !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            style={{
              background: 'white',
              border: `3px solid ${config.capsules[currentCapsule].color}`,
              borderRadius: 16,
              padding: '20px 24px',
              textAlign: 'center',
              maxWidth: 320,
              boxShadow: `0 8px 24px ${config.capsules[currentCapsule].color}55`,
              marginTop: 6,
              position: 'relative',
              zIndex: 30,
            }}
          >
            {config.capsules[currentCapsule].rarity !== 'normal' && (
              <div style={{
                fontSize: 11,
                fontWeight: 900,
                color: config.capsules[currentCapsule].color,
                marginBottom: 6,
                letterSpacing: 1,
              }}>
                {rarityLabel[config.capsules[currentCapsule].rarity]}
              </div>
            )}
            <div style={{ fontSize: 40, marginBottom: 8, display: 'inline-block' }}>
              {config.capsules[currentCapsule].emoji || '🎁'}
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#333',
              lineHeight: 1.6,
              fontFamily: 'var(--font-hand)',
            }}>
              {config.capsules[currentCapsule].message}
            </div>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: 16,
                background: config.capsules[currentCapsule].color,
                color: '#333',
                border: '2.5px solid #333',
                borderRadius: 20,
                padding: '6px 20px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-nunito)',
                boxShadow: '2px 2px 0px #333',
              }}
            >
              Try again ↩
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text instructions */}
      {!allUsed && !showMessage && (
        <div style={{
          fontSize: 11,
          color: '#888',
          fontWeight: 700,
          textAlign: 'center',
          marginTop: 6,
          background: 'rgba(255,255,255,0.4)',
          padding: '4px 12px',
          borderRadius: '12px',
        }}>
          {phase === 'idle' && currentCapsule === null && 'Click the coin slot or crank to get a capsule! 🪙'}
          {phase === 'idle' && currentCapsule !== null && 'Click the capsule in the chute to open it! ✨'}
          {phase === 'coin' && '🪙 Coin dropping...'}
          {phase === 'turning' && '⚙️ Turning the crank...'}
          {phase === 'shaking' && '💫 Mixing capsules!'}
          {phase === 'rolling' && '🎊 Capsule rolling out!'}
        </div>
      )}
    </div>
  );
}
