'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

type PetState = 'idle' | 'wandering' | 'navigating_icon' | 'sleeping' | 'preening' | 'chasing_food';

interface DesktopPetProps {
  desktopAreaId?: string;
}

export default function DesktopPet({ desktopAreaId = 'desktop-area' }: DesktopPetProps) {
  const sounds = useSound();
  
  // Coordinates
  const [posX, setPosX] = useState(250);
  const [posY, setPosY] = useState(200);
  const [petState, setPetState] = useState<PetState>('idle');
  const [facingLeft, setFacingLeft] = useState(false);
  
  // Context Menu state
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  
  // Interactive food state
  const [activeFood, setActiveFood] = useState<{ x: number; y: number } | null>(null);
  const [eating, setEating] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [zzzText, setZzzText] = useState<{ id: number; y: number }[]>([]);

  // Refs for requestAnimationFrame loop and coordinates tracking
  const posRef = useRef({ x: 250, y: 200 });
  const targetRef = useRef({ x: 250, y: 200 });
  const stateRef = useRef<PetState>('idle');

  // Decision loop timer
  useEffect(() => {
    stateRef.current = petState;
  }, [petState]);

  // Handle drifting "Zzz..." particles for sleeping state
  useEffect(() => {
    if (petState !== 'sleeping') {
      setZzzText([]);
      return;
    }

    const interval = setInterval(() => {
      setZzzText((prev) => [
        ...prev.slice(-3),
        { id: Date.now(), y: 0 }
      ]);
    }, 1500);

    return () => clearInterval(interval);
  }, [petState]);

  // Core decision maker loop
  useEffect(() => {
    const decideNextMove = () => {
      // If currently chasing food, don't interrupt!
      if (stateRef.current === 'chasing_food') return;

      const randomChance = Math.random();
      const parent = document.getElementById(desktopAreaId);
      if (!parent) return;
      const rect = parent.getBoundingClientRect();

      if (randomChance < 0.4) {
        // Option A: Choose a random icon and walk to it
        const icons = document.querySelectorAll('.desktop-icon');
        if (icons.length > 0) {
          const randomIcon = icons[Math.floor(Math.random() * icons.length)];
          const iconRect = randomIcon.getBoundingClientRect();

          // Offset destination to sit slightly below and to the side of the icon label
          const relX = iconRect.left - rect.left + iconRect.width / 2 + (Math.random() * 20 - 10);
          const relY = iconRect.bottom - rect.top + 8;

          targetRef.current = { x: Math.max(10, Math.min(rect.width - 40, relX)), y: Math.max(10, Math.min(rect.height - 50, relY)) };
          setFacingLeft(targetRef.current.x < posRef.current.x);
          setPetState('navigating_icon');
        }
      } else if (randomChance < 0.7) {
        // Option B: Wander to random spot
        const randX = Math.random() * (rect.width - 60) + 20;
        const randY = Math.random() * (rect.height - 80) + 20;

        targetRef.current = { x: randX, y: randY };
        setFacingLeft(targetRef.current.x < posRef.current.x);
        setPetState('wandering');
      } else if (randomChance < 0.85) {
        // Option C: Sit down and Preen (lick paw)
        setPetState('preening');
      } else {
        // Option D: Just sleep
        setPetState('sleeping');
      }
    };

    // Run decision cycle every 12 seconds
    const timer = setInterval(decideNextMove, 12000);
    
    // Run initial decision after a short delay
    const initialDelay = setTimeout(decideNextMove, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialDelay);
    };
  }, [desktopAreaId]);

  // Smooth walk loop (animation loop)
  useEffect(() => {
    let animFrame: number;

    const walk = () => {
      const current = posRef.current;
      const target = targetRef.current;
      const currentState = stateRef.current;

      const isWalkingState =
        currentState === 'wandering' ||
        currentState === 'navigating_icon' ||
        currentState === 'chasing_food';

      if (isWalkingState) {
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const dist = Math.hypot(dx, dy);
        const speed = currentState === 'chasing_food' ? 2.2 : 1.2; // trot faster when hungry!

        if (dist > 4) {
          const vx = (dx / dist) * speed;
          const vy = (dy / dist) * speed;

          current.x += vx;
          current.y += vy;

          setPosX(current.x);
          setPosY(current.y);
          setFacingLeft(vx < 0);
        } else {
          // Arrived!
          if (currentState === 'chasing_food') {
            // Start eating
            setEating(true);
            sounds.star(); // play high note/bell sound
            setTimeout(() => {
              setActiveFood(null);
              setEating(false);
              setPetState('preening');
              // Spawn heart visual reward
              setHearts(
                Array.from({ length: 5 }, (_, i) => ({
                  id: Date.now() + i,
                  x: Math.random() * 40 - 20,
                  y: Math.random() * -20 - 10,
                }))
              );
              setTimeout(() => setHearts([]), 2000);
            }, 1800);
          } else if (currentState === 'navigating_icon') {
            setPetState('sleeping'); // sleep next to the icon
          } else {
            setPetState('idle');
          }
        }
      }

      animFrame = requestAnimationFrame(walk);
    };

    animFrame = requestAnimationFrame(walk);
    return () => cancelAnimationFrame(animFrame);
  }, [sounds]);

  // Pet Menu Handlers
  const handlePet = () => {
    sounds.windowOpen();
    setPetState('preening');
    setHearts(
      Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 40 - 20,
        y: Math.random() * -20 - 10,
      }))
    );
    setTimeout(() => setHearts([]), 2000);
    setMenuPos(null);
  };

  const handleFeed = () => {
    sounds.click();
    const parent = document.getElementById(desktopAreaId);
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    // Place fish 80px to the side of the cat
    const foodX = Math.max(20, Math.min(rect.width - 40, posRef.current.x + (facingLeft ? -80 : 80)));
    const foodY = Math.max(20, Math.min(rect.height - 40, posRef.current.y + 10));

    setActiveFood({ x: foodX, y: foodY });
    targetRef.current = { x: foodX, y: foodY };
    setFacingLeft(foodX < posRef.current.x);
    setPetState('chasing_food');
    setMenuPos(null);
  };

  const handleShoo = () => {
    sounds.windowOpen(); // swoosh sound fallback
    const parent = document.getElementById(desktopAreaId);
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    // Scamper to a random bottom corner
    const cornerX = Math.random() < 0.5 ? 20 : rect.width - 60;
    const cornerY = rect.height - 80;

    targetRef.current = { x: cornerX, y: cornerY };
    setFacingLeft(cornerX < posRef.current.x);
    setPetState('wandering');
    setMenuPos(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sounds.click();
    
    // Get cursor position relative to desktop-area parent
    const parent = document.getElementById(desktopAreaId);
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();

    setMenuPos({
      x: e.clientX - parentRect.left,
      y: e.clientY - parentRect.top,
    });
  };

  // Close context menu clicking outside
  useEffect(() => {
    const closeMenu = () => setMenuPos(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <>
      {/* Absolute Pet Sprite Layer */}
      <div
        id="desktop-cat"
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute',
          left: posX,
          top: posY,
          transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
          zIndex: 9999,
          cursor: 'pointer',
          pointerEvents: hovered ? 'auto' : 'none',
          userSelect: 'none',
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ pointerEvents: 'auto' }}>
          {/* Animated SVG black kitten */}
          <svg width="60" height="60" viewBox="0 0 60 60" style={{ display: 'block' }}>
            <style>
              {`
                .cat-body { fill: #121214; }
                .cat-pink { fill: #FFAAAA; }
                .cat-collar { fill: #EF4444; }
                .cat-bell { fill: #FBBF24; }
                .cat-eye { fill: #4E9BFF; }
                .cat-pupil { fill: #000000; }
                .cat-highlight { fill: #FFFFFF; }
                
                /* Animations */
                @keyframes tail-wag {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-25deg); }
                }
                @keyframes head-bob {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-2px); }
                }
                @keyframes leg-swing-front {
                  0%, 100% { transform: rotate(-12deg); }
                  50% { transform: rotate(12deg); }
                }
                @keyframes leg-swing-back {
                  0%, 100% { transform: rotate(12deg); }
                  50% { transform: rotate(-12deg); }
                }
                @keyframes preen-paw {
                  0%, 100% { transform: translate(0px, 0px); }
                  50% { transform: translate(-4px, -6px) rotate(-30deg); }
                }
                
                .tail {
                  transform-origin: 38px 46px;
                  animation: tail-wag 1.6s ease-in-out infinite;
                }
                .head-bob-class {
                  transform-origin: 22px 30px;
                  animation: head-bob 0.8s ease-in-out infinite;
                }
                .leg-front {
                  transform-origin: 18px 46px;
                  animation: leg-swing-front 0.6s linear infinite;
                }
                .leg-back {
                  transform-origin: 28px 46px;
                  animation: leg-swing-back 0.6s linear infinite;
                }
                .lick-paw {
                  transform-origin: 16px 40px;
                  animation: preen-paw 0.8s ease-in-out infinite;
                }
              `}
            </style>

            {/* SLEEPING STATE */}
            {petState === 'sleeping' && (
              <g transform="translate(0, 8)">
                {/* Curved sleeping tail */}
                <path d="M 40 38 C 44 38, 48 34, 46 28 C 44 24, 38 26, 38 28" fill="none" stroke="#121214" strokeWidth="5" strokeLinecap="round" />
                {/* Curled body */}
                <ellipse cx="26" cy="34" rx="16" ry="12" className="cat-body" />
                {/* Sleeping head */}
                <circle cx="18" cy="26" r="10" className="cat-body" />
                {/* Pink Inner Ears */}
                <polygon points="10,20 6,12 16,16" className="cat-body" />
                <polygon points="9,18 7,13 14,15" className="cat-pink" />
                <polygon points="20,18 24,10 26,18" className="cat-body" />
                <polygon points="21,17 23,12 25,17" className="cat-pink" />
                {/* Sleeping closed eye curves */}
                <path d="M 12 26 Q 14 28 16 26" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 20 26 Q 22 28 24 26" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
                {/* Pink Nose */}
                <polygon points="17,29 19,29 18,30.5" className="cat-pink" />
                {/* Collar & Bell */}
                <path d="M 22 32 Q 24 35 21 37" fill="none" stroke="#EF4444" strokeWidth="2.5" />
                <circle cx="20" cy="37" r="2.5" className="cat-bell" />
              </g>
            )}

            {/* PREENING STATE */}
            {petState === 'preening' && (
              <g>
                {/* Tail waving */}
                <path d="M 38 46 Q 48 40 46 24" fill="none" stroke="#121214" strokeWidth="5.5" strokeLinecap="round" className="tail" />
                {/* Standing/Sitting back legs */}
                <ellipse cx="32" cy="44" rx="8" ry="6" className="cat-body" />
                {/* Main sitting body */}
                <path d="M 16 30 Q 14 46 22 48 L 34 46 Q 36 36 28 30 Z" className="cat-body" />
                
                {/* Licking/Preening front paw */}
                <g className="lick-paw">
                  <rect x="12" y="38" width="5" height="12" rx="2.5" className="cat-body" />
                </g>
                <rect x="22" y="38" width="5" height="12" rx="2.5" className="cat-body" />

                {/* Head tilted forward */}
                <g transform="rotate(10, 22, 26)">
                  <circle cx="20" cy="24" r="10" className="cat-body" />
                  {/* Pink Inner Ears */}
                  <polygon points="12,18 8,8 18,13" className="cat-body" />
                  <polygon points="11,16 9,10 16,13" className="cat-pink" />
                  <polygon points="22,15 26,6 30,14" className="cat-body" />
                  <polygon points="23,13 25,8 28,13" className="cat-pink" />
                  {/* Licking closed eye */}
                  <path d="M 13 24 Q 15 26 17 24" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
                  <path d="M 21 23 Q 23 25 25 23" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
                  {/* Pink tongue */}
                  <path d="M 16 28 Q 18 31 20 28 Z" fill="#FF8888" />
                  <polygon points="17,26 19,26 18,27.5" className="cat-pink" />
                </g>
              </g>
            )}

            {/* WALKING / TROTTING STATE */}
            {(petState === 'wandering' || petState === 'navigating_icon' || petState === 'chasing_food') && (
              <g className="head-bob-class">
                {/* Wagging tail */}
                <path d="M 38 42 Q 52 38 46 16" fill="none" stroke="#121214" strokeWidth="5" strokeLinecap="round" className="tail" />
                {/* Moving Legs (Swing animations) */}
                <g className="leg-front">
                  <rect x="16" y="42" width="5" height="14" rx="2.5" className="cat-body" />
                </g>
                <g className="leg-back">
                  <rect x="28" y="42" width="5" height="14" rx="2.5" className="cat-body" />
                </g>
                <g className="leg-front" style={{ animationDelay: '0.3s' }}>
                  <rect x="22" y="42" width="5" height="14" rx="2.5" className="cat-body" />
                </g>
                <g className="leg-back" style={{ animationDelay: '0.3s' }}>
                  <rect x="34" y="42" width="4.5" height="14" rx="2" className="cat-body" />
                </g>
                
                {/* Horizontal side body */}
                <path d="M 14 32 Q 10 40 18 42 L 36 42 Q 38 34 32 30 Z" className="cat-body" />
                
                {/* Head facing front/side */}
                <circle cx="16" cy="24" r="9.5" className="cat-body" />
                {/* Ears */}
                <polygon points="8,19 4,10 13,15" className="cat-body" />
                <polygon points="7,17 5,11 11,14" className="cat-pink" />
                <polygon points="17,16 21,7 24,15" className="cat-body" />
                <polygon points="18,14 20,9 22,14" className="cat-pink" />
                {/* Blue Eyes */}
                <circle cx="11.5" cy="22.5" r="3" className="cat-eye" />
                <circle cx="11.5" cy="22.5" r="1.5" className="cat-pupil" />
                <circle cx="11" cy="21.5" r="0.8" className="cat-highlight" />

                <circle cx="18.5" cy="22.5" r="3" className="cat-eye" />
                <circle cx="18.5" cy="22.5" r="1.5" className="cat-pupil" />
                <circle cx="18" cy="21.5" r="0.8" className="cat-highlight" />
                
                {/* Pink Nose */}
                <polygon points="14,25.5 16,25.5 15,27" className="cat-pink" />
                {/* Collar with gold bell */}
                <path d="M 12 30 Q 15 33 19 30" fill="none" stroke="#EF4444" strokeWidth="2.5" />
                <circle cx="15.5" cy="33.5" r="2.5" className="cat-bell" />
              </g>
            )}

            {/* IDLE STATE */}
            {petState === 'idle' && (
              <g>
                {/* Tail swishing */}
                <path d="M 36 44 Q 48 38 44 20" fill="none" stroke="#121214" strokeWidth="5.5" strokeLinecap="round" className="tail" />
                
                {/* Standing front legs */}
                <rect x="18" y="40" width="5.5" height="15" rx="2.5" className="cat-body" />
                <rect x="25.5" y="40" width="5.5" height="15" rx="2.5" className="cat-body" />
                {/* Sitting back legs */}
                <ellipse cx="33" cy="46" rx="8" ry="6" className="cat-body" />

                {/* Main sitting body */}
                <path d="M 16 28 Q 14 44 22 48 L 36 46 Q 38 34 28 28 Z" className="cat-body" />

                {/* Head sitting politely */}
                <g>
                  <circle cx="22" cy="22" r="10" className="cat-body" />
                  {/* Pink Inner Ears */}
                  <polygon points="14,16 9,6 19,11" className="cat-body" />
                  <polygon points="13,14 10,8 17,11" className="cat-pink" />
                  <polygon points="25,13 29,4 32,13" className="cat-body" />
                  <polygon points="26,11 28,6 30,11" className="cat-pink" />
                  
                  {/* Large Blue Eyes (Blinks periodically via CSS) */}
                  <g style={{ transformOrigin: '22px 22px' }}>
                    <circle cx="17.5" cy="20.5" r="3.2" className="cat-eye" />
                    <circle cx="17.5" cy="20.5" r="1.5" className="cat-pupil" />
                    <circle cx="16.5" cy="19.5" r="0.8" className="cat-highlight" />

                    <circle cx="26.5" cy="20.5" r="3.2" className="cat-eye" />
                    <circle cx="26.5" cy="20.5" r="1.5" className="cat-pupil" />
                    <circle cx="25.5" cy="19.5" r="0.8" className="cat-highlight" />
                  </g>
                  
                  {/* Pink Nose */}
                  <polygon points="21,23.5 23,23.5 22,25" className="cat-pink" />
                  
                  {/* Collar with gold bell */}
                  <path d="M 16 28 Q 22 32 27 28" fill="none" stroke="#EF4444" strokeWidth="2.5" />
                  <circle cx="21.5" cy="31" r="2.5" className="cat-bell" />
                </g>
              </g>
            )}
          </svg>
        </span>

        {/* Drifting "Zzz..." particles for sleeping state */}
        {petState === 'sleeping' && (
          <div className="absolute top-[-10px] left-[15px] pointer-events-none" style={{ direction: 'ltr' }}>
            {zzzText.map((z) => (
              <motion.span
                key={z.id}
                initial={{ y: 0, opacity: 1, scale: 0.7 }}
                animate={{ y: -30, x: [0, 5, -5, 0], opacity: 0, scale: 1.1 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  color: '#A5B4FC',
                  fontSize: '11px',
                  fontFamily: 'var(--font-pixel)',
                  fontWeight: 'bold',
                }}
              >
                Zzz
              </motion.span>
            ))}
          </div>
        )}

        {/* Floating Heart Particles (feedback when fed or pet) */}
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{ x: h.x, y: h.y, opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '-16px',
              fontSize: '16px',
              pointerEvents: 'none',
            }}
          >
            ❤️
          </motion.span>
        ))}
      </div>

      {/* Render food item if active */}
      {activeFood && (
        <div
          style={{
            position: 'absolute',
            left: activeFood.x,
            top: activeFood.y,
            transform: 'translate(-50%, -50%)',
            zIndex: 9998,
            fontSize: '20px',
            transition: 'opacity 0.5s',
            opacity: eating ? 0 : 1,
            pointerEvents: 'none',
          }}
        >
          🐟
        </div>
      )}

      {/* Windows 95 Retro Context Menu */}
      {menuPos && (
        <div
          className="xp-window"
          style={{
            position: 'absolute',
            left: menuPos.x,
            top: menuPos.y,
            zIndex: 10000,
            width: 90,
            padding: 2,
            boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div
            onClick={handlePet}
            className="px-2 py-1 text-[11px] cursor-pointer hover:bg-[#000080] hover:text-white"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'black' }}
          >
            Pet ❤️
          </div>
          <div
            onClick={handleFeed}
            className="px-2 py-1 text-[11px] cursor-pointer hover:bg-[#000080] hover:text-white border-t border-b border-gray-300"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'black' }}
          >
            Feed 🐟
          </div>
          <div
            onClick={handleShoo}
            className="px-2 py-1 text-[11px] cursor-pointer hover:bg-[#000080] hover:text-white"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'black' }}
          >
            Shoo 💨
          </div>
        </div>
      )}
    </>
  );
}
