'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/stores/desktopStore';
import { useSound } from '@/hooks/useSound';

interface ObbyBlock {
  x: number;
  y: number;
  z: number;
  type: 'normal' | 'lava' | 'checkpoint' | 'goal';
}

interface GameAppProps {
  config: any;
  secretPassword?: string;
}

const OBBY_BLOCKS: ObbyBlock[] = [
  { x: 0, y: 0, z: 0, type: 'normal' },
  { x: 36, y: 0, z: 0, type: 'normal' },
  { x: 72, y: 0, z: 8, type: 'normal' },
  { x: 108, y: 0, z: 16, type: 'normal' },
  { x: 144, y: 20, z: 16, type: 'lava' }, // LAVA block! Must jump over!
  { x: 144, y: 56, z: 24, type: 'normal' },
  { x: 108, y: 80, z: 32, type: 'checkpoint' }, // Checkpoint flag
  { x: 72, y: 80, z: 32, type: 'normal' },
  { x: 36, y: 80, z: 40, type: 'normal' },
  { x: 0, y: 80, z: 48, type: 'normal' },
  { x: -36, y: 56, z: 48, type: 'lava' }, // Second Lava block!
  { x: -72, y: 32, z: 56, type: 'normal' },
  { x: -108, y: 8, z: 64, type: 'normal' },
  { x: -144, y: -16, z: 72, type: 'goal' }, // Golden Trophy goal platform
];

export default function GameApp({ config, secretPassword = '1234' }: GameAppProps) {
  const { earnStar } = useDesktopStore();
  const sounds = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // States
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [isOof, setIsOof] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(-1);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  // Keyboard controls key status
  const keysPressed = useRef<Record<string, boolean>>({});

  // Player state refs to avoid closure stale-state issues inside loops
  const playerRef = useRef({
    x: 0,
    y: 0,
    z: 12,
    vx: 0,
    vy: 0,
    vz: 0,
    grounded: true,
    checkpoint: { x: 0, y: 0, z: 12 },
  });

  // Smooth camera refs
  const camRef = useRef({ x: 0, y: 0, z: 12 });

  const startGame = () => {
    playerRef.current = {
      x: 0,
      y: 0,
      z: 12,
      vx: 0,
      vy: 0,
      vz: 0,
      grounded: true,
      checkpoint: { x: 0, y: 0, z: 12 },
    };
    camRef.current = { x: 0, y: 0, z: 12 };
    keysPressed.current = {};
    setGameState('playing');
    setIsOof(false);
    setActiveCheckpoint(-1);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 3D Isometric Projection Helper
  const project = (x: number, y: number, z: number, camX: number, camY: number, camZ: number, width: number, height: number) => {
    const rx = x - camX;
    const ry = y - camY;
    const rz = z - camZ;

    // Isometric formula: X rotates by cos(30deg) and Y rotates by -cos(30deg)
    // screenX starts at canvas center
    const screenX = width / 2 + (rx - ry) * Math.cos(Math.PI / 6);
    const screenY = height / 2 + (rx + ry) * Math.sin(Math.PI / 6) - rz;

    return { x: screenX, y: screenY };
  };

  // Render generic block cube in isometric
  const drawCube = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    z: number,
    sizeX: number,
    sizeY: number,
    sizeZ: number,
    colorTop: string,
    colorLeft: string,
    colorRight: string,
    camX: number,
    camY: number,
    camZ: number,
    width: number,
    height: number,
    hasStuds: boolean = false
  ) => {
    const topCenter = project(x, y, z + sizeZ / 2, camX, camY, camZ, width, height);

    const dxX = (sizeX / 2) * Math.cos(Math.PI / 6);
    const dxY = (sizeX / 2) * Math.sin(Math.PI / 6);
    const dyX = -(sizeY / 2) * Math.cos(Math.PI / 6);
    const dyY = (sizeY / 2) * Math.sin(Math.PI / 6);
    const dz = sizeZ;

    // Top face vertices
    const t1 = { x: topCenter.x, y: topCenter.y };
    const t2 = { x: topCenter.x + dxX, y: topCenter.y + dxY };
    const t3 = { x: topCenter.x + dxX + dyX, y: topCenter.y + dxY + dyY };
    const t4 = { x: topCenter.x + dyX, y: topCenter.y + dyY };

    // Bottom face vertices
    const b2 = { x: t2.x, y: t2.y + dz };
    const b3 = { x: t3.x, y: t3.y + dz };
    const b4 = { x: t4.x, y: t4.y + dz };

    // Draw Top Face
    ctx.fillStyle = colorTop;
    ctx.beginPath();
    ctx.moveTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.closePath();
    ctx.fill();

    // Subtle outline
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Draw Studs (Roblox branding element)
    if (hasStuds) {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      const studPositions = [
        { x: topCenter.x - 7, y: topCenter.y + 4 },
        { x: topCenter.x + 7, y: topCenter.y + 4 },
        { x: topCenter.x, y: topCenter.y + 1 },
        { x: topCenter.x, y: topCenter.y + 7 },
      ];
      studPositions.forEach((pos) => {
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 2.5, 1.25, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Left Face
    ctx.fillStyle = colorLeft;
    ctx.beginPath();
    ctx.moveTo(t4.x, t4.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Right Face
    ctx.fillStyle = colorRight;
    ctx.beginPath();
    ctx.moveTo(t3.x, t3.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Main game physics & animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = () => {
      // 1. Gather player inputs
      const player = playerRef.current;
      const keys = keysPressed.current;

      const prevX = player.x;
      const prevY = player.y;

      let dx = 0;
      let dy = 0;
      if (keys['KeyW'] || keys['ArrowUp']) { dx -= 1; dy -= 1; }
      if (keys['KeyS'] || keys['ArrowDown']) { dx += 1; dy += 1; }
      if (keys['KeyA'] || keys['ArrowLeft']) { dx -= 1; dy += 1; }
      if (keys['KeyD'] || keys['ArrowRight']) { dx += 1; dy -= 1; }

      // Normalization of horizontal speed
      const len = Math.sqrt(dx * dx + dy * dy);
      const moveSpeed = 1.6;
      if (len > 0) {
        player.vx = (dx / len) * moveSpeed;
        player.vy = (dy / len) * moveSpeed;
      } else {
        player.vx *= 0.75;
        player.vy *= 0.75;
      }

      // Jump request
      if (keys['Space'] && player.grounded) {
        player.vz = 4.2;
        player.grounded = false;
        sounds.click();
      }

      // Apply Gravity
      if (!player.grounded) {
        player.vz -= 0.22;
      }

      // Apply positions
      player.x += player.vx;
      player.y += player.vy;
      player.z += player.vz;

      // Gravity and Ground collision loop
      let landed = false;
      let landedBlock: ObbyBlock | null = null;

      for (let i = 0; i < OBBY_BLOCKS.length; i++) {
        const b = OBBY_BLOCKS[i];
        // Bounding box size check
        const overlapX = Math.abs(player.x - b.x) < 22; // 6 player radius + 16 block radius
        const overlapY = Math.abs(player.y - b.y) < 22;

        if (overlapX && overlapY) {
          // Check landing on top of block
          const blockTop = b.z + 8;
          const playerFeet = player.z - 4; // player legs bottom is z - 4

          if (player.vz <= 0 && Math.abs(playerFeet - blockTop) < 6) {
            player.z = blockTop + 4;
            player.vz = 0;
            player.grounded = true;
            landed = true;
            landedBlock = b;
            break;
          }

          // Check side collision to prevent phasing through platforms
          const blockBottom = b.z - 8;
          if (playerFeet < blockTop && player.z + 16 > blockBottom) {
            player.x = prevX;
            player.y = prevY;
            player.vx = 0;
            player.vy = 0;
          }
        }
      }

      if (!landed) {
        player.grounded = false;
      }

      // Trigger landing properties (lava resets, checkpoints save, goal wins)
      if (landedBlock) {
        if (landedBlock.type === 'lava' && !isOof) {
          // OOF sequence!
          setIsOof(true);
          sounds.error();
          player.vx = 0;
          player.vy = 0;
          player.vz = 0;
          setTimeout(() => {
            player.x = player.checkpoint.x;
            player.y = player.checkpoint.y;
            player.z = player.checkpoint.z;
            setIsOof(false);
          }, 600);
        } else if (landedBlock.type === 'checkpoint') {
          player.checkpoint = { x: landedBlock.x, y: landedBlock.y, z: landedBlock.z + 12 };
          const checkpointIdx = OBBY_BLOCKS.indexOf(landedBlock);
          if (activeCheckpoint !== checkpointIdx) {
            setActiveCheckpoint(checkpointIdx);
            sounds.star();
          }
        } else if (landedBlock.type === 'goal') {
          // Win game!
          sounds.unlock();
          setGameState('won');
          earnStar();
          setConfetti(
            Array.from({ length: 25 }, (_, i) => ({
              id: i,
              x: Math.random() * 100,
              y: Math.random() * 40 + 20,
              emoji: ['🏆', '✨', '👑', '🎉', '🌟'][i % 5],
            }))
          );
          setTimeout(() => setConfetti([]), 3500);
          return; // Stop animation loop
        }
      }

      // Reset if player falls into the endless space void
      if (player.z < -100 && !isOof) {
        setIsOof(true);
        sounds.error();
        setTimeout(() => {
          player.x = player.checkpoint.x;
          player.y = player.checkpoint.y;
          player.z = player.checkpoint.z;
          player.vx = 0;
          player.vy = 0;
          player.vz = 0;
          setIsOof(false);
        }, 400);
      }

      // Smooth Camera tracking interpolations
      const cam = camRef.current;
      cam.x += (player.x - cam.x) * 0.08;
      cam.y += (player.y - cam.y) * 0.08;
      cam.z += (player.z - cam.z) * 0.08;

      // 2. Draw loop render operations
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep sky stars background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let i = 0; i < 40; i++) {
        const starX = (i * 97) % canvas.width;
        const starY = (i * 73 + Date.now() * 0.005) % canvas.height;
        ctx.fillRect(starX, starY, 1.5, 1.5);
      }

      // Depth sorting of elements (blocks + player)
      const renderQueue: Array<{
        type: 'block' | 'player';
        depth: number;
        data: any;
      }> = [];

      OBBY_BLOCKS.forEach((block) => {
        renderQueue.push({
          type: 'block',
          depth: (block.x + block.y) * 0.5 - block.z,
          data: block,
        });
      });

      if (!isOof) {
        renderQueue.push({
          type: 'player',
          depth: (player.x + player.y) * 0.5 - player.z,
          data: player,
        });
      }

      // Sort lowest depth to highest (back to front)
      renderQueue.sort((a, b) => a.depth - b.depth);

      // Draw all queued elements
      renderQueue.forEach((obj) => {
        if (obj.type === 'block') {
          const b: ObbyBlock = obj.data;
          let colTop = '#94A3B8'; // default grey
          let colLeft = '#64748B';
          let colRight = '#475569';

          if (b.type === 'lava') {
            colTop = '#EF4444'; // Red hot lava
            colLeft = '#DC2626';
            colRight = '#991B1B';
          } else if (b.type === 'checkpoint') {
            colTop = '#3B82F6'; // Blue checkpoint
            colLeft = '#2563EB';
            colRight = '#1D4ED8';
          } else if (b.type === 'goal') {
            colTop = '#FBBF24'; // Gold goal
            colLeft = '#D97706';
            colRight = '#B45309';
          }

          drawCube(
            ctx,
            b.x,
            b.y,
            b.z,
            32,
            32,
            16,
            colTop,
            colLeft,
            colRight,
            cam.x,
            cam.y,
            cam.z,
            canvas.width,
            canvas.height,
            b.type !== 'goal'
          );

          // Add flag pole for checkpoint flag
          if (b.type === 'checkpoint') {
            const flagTop = project(b.x, b.y, b.z + 8, cam.x, cam.y, cam.z, canvas.width, canvas.height);
            ctx.fillStyle = '#E2E8F0';
            ctx.fillRect(flagTop.x - 1, flagTop.y - 18, 2, 18);
            ctx.fillStyle = activeCheckpoint === OBBY_BLOCKS.indexOf(b) ? '#EF4444' : '#64748B';
            ctx.beginPath();
            ctx.moveTo(flagTop.x + 1, flagTop.y - 18);
            ctx.lineTo(flagTop.x + 10, flagTop.y - 14);
            ctx.lineTo(flagTop.x + 1, flagTop.y - 10);
            ctx.closePath();
            ctx.fill();
          }

          // Add golden trophy cup on top of goal block
          if (b.type === 'goal') {
            const cupPos = project(b.x, b.y, b.z + 10, cam.x, cam.y, cam.z, canvas.width, canvas.height);
            ctx.fillStyle = '#FFE043';
            ctx.beginPath();
            ctx.arc(cupPos.x, cupPos.y - 12, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(cupPos.x - 2, cupPos.y - 7, 4, 7);
            ctx.fillRect(cupPos.x - 5, cupPos.y, 10, 2);
          }
        } else {
          // Draw Roblox Noob player avatar
          const p = obj.data;
          
          // Legs: Green blocky base
          drawCube(ctx, p.x, p.y, p.z - 3, 10, 10, 6, '#4CAF50', '#388E3C', '#2E7D32', cam.x, cam.y, cam.z, canvas.width, canvas.height);
          
          // Torso: Blue blocky body
          drawCube(ctx, p.x, p.y, p.z + 3, 12, 12, 8, '#1E3A8A', '#1D4ED8', '#1E40AF', cam.x, cam.y, cam.z, canvas.width, canvas.height);
          
          // Head: Yellow blocky head
          drawCube(ctx, p.x, p.y, p.z + 11, 8, 8, 8, '#FFEB3B', '#FBC02D', '#F9A825', cam.x, cam.y, cam.z, canvas.width, canvas.height);

          // Face detailing (eyes and mouth)
          const face = project(p.x, p.y, p.z + 13, cam.x, cam.y, cam.z, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          // Draw little square eyes
          ctx.fillRect(face.x + 1, face.y, 1.5, 1.5);
          ctx.fillRect(face.x + 4, face.y - 1.5, 1.5, 1.5);
          // Draw small Roblox smile
          ctx.beginPath();
          ctx.arc(face.x + 2.5, face.y + 2, 2, 0, Math.PI);
          ctx.stroke();
        }
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, activeCheckpoint, isOof, sounds]);

  return (
    <div
      className="flex flex-col items-center h-full text-white"
      style={{
        background: 'linear-gradient(180deg, #1E1B4B 0%, #311042 100%)',
        padding: 16,
        fontFamily: 'var(--font-nunito)',
        overflow: 'hidden',
      }}
    >
      {/* HUD Details */}
      {gameState === 'playing' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8, fontSize: 12, fontWeight: 700 }}>
          <div style={{ color: '#FFD700' }}>
            🚩 Checkpoint: {activeCheckpoint !== -1 ? 'Saved!' : 'Start'}
          </div>
          <div style={{ color: '#CBD5E1' }}>
            Roblox Obby Course
          </div>
        </div>
      )}

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ top: `${c.y}%`, left: `${c.x}%`, opacity: 1, scale: 0.5 }}
            animate={{ top: '-20%', opacity: 0, scale: 1.5, rotate: 360 }}
            transition={{ duration: 2.2 + Math.random(), ease: 'easeOut' }}
            style={{ position: 'absolute', fontSize: 24 }}
          >
            {c.emoji}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Idle screen */}
        {gameState === 'idle' && (
          <motion.div
            key="idle"
            className="flex flex-col items-center justify-center flex-1 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 8, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ fontSize: 64, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
            >
              🎮
            </motion.div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>Roblox Studio Obby</div>
            <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.6, maxWidth: 300 }}>
              Help the classic yellow noob reach the golden trophy! Avoid falling, jump over the red lava blocks, and touch checkpoints to save progress.
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 11,
              color: '#CBD5E1',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              ⌨️ <strong>Controls:</strong> WASD / Arrows to Move, <strong>Space</strong> to Jump
            </div>

            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
                border: 'none',
                borderRadius: 20,
                padding: '10px 32px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                color: 'white',
                boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              ▶ Play Obby Game
            </motion.button>
          </motion.div>
        )}

        {/* Gameplay Canvas Screen */}
        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', flex: 1 }}>
            <canvas
              ref={canvasRef}
              width={440}
              height={320}
              style={{
                display: 'block',
                borderRadius: 12,
                border: '3.5px solid #431407',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6)',
                backgroundColor: '#111827',
              }}
            />

            {/* OOF screen overlay */}
            <AnimatePresence>
              {isOof && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(239,68,68,0.25)',
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: 44, fontWeight: 900, color: '#EF4444', textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000', fontFamily: 'var(--font-pixel)', letterSpacing: 2 }}>
                    OOF!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Victory Screen displaying key */}
        {gameState === 'won' && (
          <motion.div
            key="won"
            className="flex flex-col items-center justify-center flex-1 gap-4 text-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: 2, duration: 0.6 }}
              style={{ fontSize: 64, filter: 'drop-shadow(0 4px 10px rgba(255,215,0,0.4))' }}
            >
              🏆
            </motion.div>
            <div style={{ color: '#FBBF24', fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Obby Completed!
            </div>
            
            <div style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 1.6, maxWidth: 280, fontFamily: 'var(--font-hand)' }}>
              {config.rewardMessage || 'You made it across the stud layout! Excellent block jump calculations.'}
            </div>

            {/* Secret key reward presentation card */}
            <div style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              border: '2px solid #60A5FA',
              borderRadius: 12,
              padding: '12px 20px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginTop: 6,
              minWidth: 220,
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#93C5FD', letterSpacing: 1 }}>
                Unlocks Secret Folder
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-pixel)', color: '#FFFFFF', letterSpacing: 2 }}>
                {secretPassword}
              </span>
              <span style={{ fontSize: 9, color: '#93C5FD' }}>
                🔑 Enter this passcode into the Locked Folder!
              </span>
            </div>

            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 20,
                padding: '8px 24px',
                fontSize: 11,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
                marginTop: 6,
                fontFamily: 'var(--font-nunito)',
              }}
            >
              Play again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
