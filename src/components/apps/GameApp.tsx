'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'select' | 'playing' | 'dead' | 'level_complete' | 'victory';

interface GameAppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  secretPassword?: string;
}

interface GS {
  diff: Difficulty;
  lvl: number;
  tiles: number[][];
  px: number;
  py: number;
  facing: number;   // 1 = right, -1 = left
  got: number;      // hearts collected
  total: number;    // hearts needed
  doorOpen: boolean;
  moves: number;    // total move count (drives toggle timing)
  flash: number;    // frames left for death flash
}

// ──────────────────────────────────────────────────────────────────────────────
// Grid constants
// ──────────────────────────────────────────────────────────────────────────────
const TILE = 40;
const COLS = 15;
const ROWS = 11;
const W    = COLS * TILE;   // 600
const H    = ROWS * TILE;   // 440

// Tile IDs
const VOID = 0, FLOOR = 1, WALL = 2, HEART = 3, SPIKE = 4, TOGGLE = 5, DOOR = 6, START = 7;

// Colour palette
const C = {
  bg:        '#0D1117',
  f1:        '#7EC8C0',
  f2:        '#6BB8B0',
  wall:      '#2D3561',
  wallT:     '#4A5290',
  wallB:     '#1A1F40',
  heart:     '#FF6B9D',
  spike:     '#FF4444',
  spikeBg:   '#3D1515',
  toggle:    '#FF9900',
  doorCl:    '#7B4F2E',
  skin:      '#FFCBA4',
  shirt:     '#4B9EFF',
  pants:     '#222244',
};

// ──────────────────────────────────────────────────────────────────────────────
// Level maps  (15 cols × 11 rows)
// Legend: # wall  . floor  H heart  S spike  T toggle-spike  D door  P start
// ──────────────────────────────────────────────────────────────────────────────
const MAPS: Record<Difficulty, Array<{ name: string; rows: string[] }>> = {
  easy: [
    {
      name: 'Hello ♡',
      rows: [
        '###############',
        '#P.....H......#',
        '#.H...........#',
        '#.............#',
        '#......H......#',
        '#.............#',
        '#...H.........#',
        '#.............#',
        '#..........H..#',
        '#............D#',
        '###############',
      ],
    },
    {
      name: 'Garden Path ♡',
      rows: [
        '###############',
        '#P.H..........#',
        '#.............#',
        '#.......H.....#',
        '######.########',
        '#.....H.......#',
        '#.............#',
        '#.H...........#',
        '#..........H..#',
        '#...........D.#',
        '###############',
      ],
    },
    {
      name: 'Spike Garden ♡',
      rows: [
        '###############',
        '#P..H.........#',
        '#.............#',
        '#..S..H.......#',
        '#.............#',
        '#.......S.....#',
        '#.H...........#',
        '#.............#',
        '#.........H...#',
        '#...S.......D.#',
        '###############',
      ],
    },
  ],

  medium: [
    {
      name: 'Two Rooms',
      rows: [
        '###############',
        '#P.S..........#',
        '#.............#',
        '#.H...S.......#',
        '###.###########',
        '#.....H.....H.#',
        '#.S...........#',
        '#.H...........#',
        '#.........H...#',
        '#...........D.#',
        '###############',
      ],
    },
    {
      name: 'The Field',
      rows: [
        '###############',
        '#P.....S....H.#',
        '#.H...........#',
        '#.......S.H...#',
        '#.............#',
        '#...S.........#',
        '#.H...........#',
        '#.........S...#',
        '#.......H.....#',
        '#...H...S...D.#',
        '###############',
      ],
    },
    {
      name: 'Danger Zone',
      rows: [
        '###############',
        '#P.S..H.......#',
        '#.............#',
        '#.H.....S.....#',
        '#.........S...#',
        '#.......H.....#',
        '#.S...........#',
        '#.......S.....#',
        '#.H.....H.....#',
        '#.....S...H.D.#',
        '###############',
      ],
    },
  ],

  hard: [
    {
      name: 'Pulse',
      rows: [
        '###############',
        '#P.T..........#',
        '#.............#',
        '#.H...T.......#',
        '###.###########',
        '#.....H.....H.#',
        '#.T...........#',
        '#.H...........#',
        '#.........H...#',
        '#...........D.#',
        '###############',
      ],
    },
    {
      name: 'Heartbeat',
      rows: [
        '###############',
        '#P.....T....H.#',
        '#.H...........#',
        '#.......T.H...#',
        '#.............#',
        '#...T.........#',
        '#.H...........#',
        '#.........T...#',
        '#.......H.....#',
        '#...H...T...D.#',
        '###############',
      ],
    },
    {
      name: 'Chaos Theory',
      rows: [
        '###############',
        '#P.T..H.......#',
        '#.............#',
        '#.H.....T.....#',
        '#.........T...#',
        '#.......H.....#',
        '#.T...........#',
        '#.......T.....#',
        '#.H.....H.....#',
        '#.....T...H.D.#',
        '###############',
      ],
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// Parse a string-map → 2D number grid
// ──────────────────────────────────────────────────────────────────────────────
function parseRows(rows: string[]): number[][] {
  return rows.map(row => {
    const padded = row.padEnd(COLS, '#');
    return [...padded.slice(0, COLS)].map(ch => {
      switch (ch) {
        case '.': return FLOOR;
        case 'H': return HEART;
        case 'S': return SPIKE;
        case 'T': return TOGGLE;
        case 'D': return DOOR;
        case 'P': return START;
        default:  return WALL;
      }
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Canvas drawing helpers
// ──────────────────────────────────────────────────────────────────────────────
function drawTile(
  ctx: CanvasRenderingContext2D,
  type: number, x: number, y: number,
  toggleOn: boolean, pulse: number, doorOpen: boolean,
) {
  const px = x * TILE, py = y * TILE;
  const alt = (x + y) % 2 === 0;

  const floor = () => {
    ctx.fillStyle = alt ? C.f1 : C.f2;
    ctx.fillRect(px, py, TILE, TILE);
  };

  switch (type) {

    case WALL: {
      ctx.fillStyle = C.wall;
      ctx.fillRect(px, py, TILE, TILE);
      // bevel highlights
      ctx.fillStyle = C.wallT;
      ctx.fillRect(px, py, TILE, 4);
      ctx.fillRect(px, py, 4, TILE);
      ctx.fillStyle = C.wallB;
      ctx.fillRect(px, py + TILE - 4, TILE, 4);
      ctx.fillRect(px + TILE - 4, py, 4, TILE);
      // inner pixel dot texture
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(px + 10, py + 10, 6, 6);
      ctx.fillRect(px + 24, py + 24, 6, 6);
      break;
    }

    case FLOOR: case START: {
      floor();
      break;
    }

    case VOID: {
      ctx.fillStyle = C.bg;
      ctx.fillRect(px, py, TILE, TILE);
      break;
    }

    case HEART: {
      floor();
      const s = 0.85 + Math.sin(pulse) * 0.12;
      const cx = px + TILE / 2, cy = py + TILE / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.bezierCurveTo(0, -13, -12, -13, -12, -4);
      ctx.bezierCurveTo(-12, 4, 0, 12, 0, 14);
      ctx.bezierCurveTo(0, 12, 12, 4, 12, -4);
      ctx.bezierCurveTo(12, -13, 0, -13, 0, -6);
      ctx.fillStyle = C.heart;
      ctx.fill();
      // shine
      ctx.beginPath();
      ctx.arc(-4, -5, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fill();
      ctx.restore();
      break;
    }

    case SPIKE: {
      ctx.fillStyle = C.spikeBg;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = C.spike;
      for (let i = 0; i < 3; i++) {
        const sx = px + 5 + i * 12;
        ctx.beginPath();
        ctx.moveTo(sx, py + TILE - 2);
        ctx.lineTo(sx + 6, py + 5);
        ctx.lineTo(sx + 12, py + TILE - 2);
        ctx.closePath();
        ctx.fill();
      }
      // spike base bar
      ctx.fillStyle = '#661111';
      ctx.fillRect(px + 2, py + TILE - 6, TILE - 4, 4);
      break;
    }

    case TOGGLE: {
      if (toggleOn) {
        // active orange toggle
        ctx.fillStyle = '#2A1200';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = C.toggle;
        for (let i = 0; i < 3; i++) {
          const sx = px + 5 + i * 12;
          ctx.beginPath();
          ctx.moveTo(sx, py + TILE - 2);
          ctx.lineTo(sx + 6, py + 5);
          ctx.lineTo(sx + 12, py + TILE - 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = '#883300';
        ctx.fillRect(px + 2, py + TILE - 6, TILE - 4, 4);
      } else {
        // retracted — safe, show dim grooves
        floor();
        ctx.fillStyle = 'rgba(255,153,0,0.22)';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(px + 5 + i * 12, py + TILE - 9, 10, 6);
        }
      }
      break;
    }

    case DOOR: {
      floor();
      if (doorOpen) {
        // glowing portal
        const g = ctx.createRadialGradient(
          px + TILE / 2, py + TILE / 2, 2,
          px + TILE / 2, py + TILE / 2, TILE / 2 + 4,
        );
        g.addColorStop(0, '#BBFFDD');
        g.addColorStop(1, 'rgba(34,170,85,0.05)');
        ctx.fillStyle = g;
        ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = '#44FF88';
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', px + TILE / 2, py + TILE / 2);
      } else {
        // locked door
        ctx.fillStyle = C.doorCl;
        ctx.fillRect(px + 6, py + 2, TILE - 12, TILE - 2);
        ctx.fillStyle = '#FBBF24';
        [8, 17, 26].forEach(ox => ctx.fillRect(px + ox, py + 4, 4, TILE - 10));
        // lock circle
        ctx.beginPath();
        ctx.arc(px + TILE / 2, py + TILE / 2 + 2, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FBBF24';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + TILE / 2, py + TILE / 2 + 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = C.doorCl;
        ctx.fill();
      }
      break;
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number) {
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2 + 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (facing < 0) ctx.scale(-1, 1);

  // drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.fillStyle = C.pants;
  ctx.fillRect(-6, 6, 5, 8);
  ctx.fillRect(2, 6, 5, 8);
  // shoes
  ctx.fillStyle = '#111';
  ctx.fillRect(-7, 12, 6, 3);
  ctx.fillRect(1, 12, 6, 3);
  // body / shirt
  ctx.fillStyle = C.shirt;
  ctx.fillRect(-7, -4, 14, 12);
  // collar
  ctx.fillStyle = '#3A7ECC';
  ctx.fillRect(-7, -4, 14, 3);
  // head
  ctx.fillStyle = C.skin;
  ctx.fillRect(-6, -16, 12, 13);
  // hair
  ctx.fillStyle = '#5C3D11';
  ctx.fillRect(-6, -16, 12, 4);
  // eyes
  ctx.fillStyle = '#222';
  ctx.fillRect(-4, -12, 3, 3);
  ctx.fillRect(2, -12, 3, 3);
  // eye shine
  ctx.fillStyle = '#FFF';
  ctx.fillRect(-3, -12, 1, 1);
  ctx.fillRect(3, -12, 1, 1);
  // smile
  ctx.fillStyle = '#C07060';
  ctx.fillRect(-2, -7, 4, 2);

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill: string | CanvasGradient,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export default function GameApp({ config, secretPassword }: GameAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef<Phase>('select');
  const gsRef     = useRef<GS | null>(null);
  const rafRef    = useRef(0);
  const pulseRef  = useRef(0);

  const [phase, setPhase] = useState<Phase>('select');
  const [hud, setHud] = useState({ got: 0, total: 0, lvl: 1, name: '', diff: '' });

  // Resolve the secret passcode from multiple possible sources
  const pass: string =
    secretPassword ??
    (typeof config?.secretPassword === 'string' ? config.secretPassword : undefined) ??
    (typeof config?.password        === 'string' ? config.password        : undefined) ??
    '1234';

  // ── Initialise / reset a level ───────────────────────────────────────────
  const initLevel = useCallback((diff: Difficulty, lvlIdx: number): GS => {
    const lvlData = MAPS[diff][lvlIdx];
    const tiles   = parseRows(lvlData.rows);

    let px = 1, py = 1, total = 0;
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < (tiles[y]?.length ?? 0); x++) {
        if (tiles[y][x] === START) { px = x; py = y; tiles[y][x] = FLOOR; }
        if (tiles[y][x] === HEART) total++;
      }
    }

    const gs: GS = {
      diff, lvl: lvlIdx,
      tiles, px, py, facing: 1,
      got: 0, total, doorOpen: false,
      moves: 0, flash: 0,
    };
    gsRef.current = gs;
    setHud({
      got: 0, total, lvl: lvlIdx + 1,
      name: lvlData.name,
      diff: diff.charAt(0).toUpperCase() + diff.slice(1),
    });
    return gs;
  }, []);

  const startGame = useCallback((diff: Difficulty) => {
    initLevel(diff, 0);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, [initLevel]);

  // ── Keyboard handler ─────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const ph = phaseRef.current;
      const gs = gsRef.current;

      // Victory / select: ignore all game keys
      if (ph === 'select' || ph === 'victory') return;

      // During death flash — wait for auto-respawn
      if (ph === 'dead') return;

      // Level complete screen — only Enter/Space to advance
      if (ph === 'level_complete') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!gs) return;
          const next = gs.lvl + 1;
          if (next < MAPS[gs.diff].length) {
            initLevel(gs.diff, next);
            phaseRef.current = 'playing';
            setPhase('playing');
          } else {
            phaseRef.current = 'victory';
            setPhase('victory');
          }
        }
        return;
      }

      // Restart with R
      if (e.key === 'r' || e.key === 'R') {
        if (gs) {
          initLevel(gs.diff, gs.lvl);
          phaseRef.current = 'playing';
          setPhase('playing');
        }
        return;
      }

      // Movement
      let dx = 0, dy = 0;
      switch (e.key) {
        case 'ArrowLeft':  case 'a': case 'A': dx = -1; break;
        case 'ArrowRight': case 'd': case 'D': dx =  1; break;
        case 'ArrowUp':    case 'w': case 'W': dy = -1; break;
        case 'ArrowDown':  case 's': case 'S': dy =  1; break;
        default: return;
      }
      e.preventDefault();
      if (!gs) return;

      const nx = gs.px + dx;
      const ny = gs.py + dy;
      if (ny < 0 || ny >= ROWS || nx < 0 || nx >= COLS) return;

      const target = gs.tiles[ny]?.[nx] ?? WALL;

      // Blocked by solid wall
      if (target === WALL || target === VOID) return;
      // Blocked by closed door
      if (target === DOOR && !gs.doorOpen) return;

      // Check toggle state BEFORE the move (what the player sees)
      const toggleOn = (gs.moves % 6) < 3;

      // Commit move
      if (dx !== 0) gs.facing = dx;
      gs.px = nx;
      gs.py = ny;
      gs.moves++;

      // ── Stepped on a hazard?
      if (target === SPIKE || (target === TOGGLE && toggleOn)) {
        gs.flash = 30;
        phaseRef.current = 'dead';
        setPhase('dead');
        return;
      }

      // ── Collected a heart?
      if (target === HEART) {
        gs.tiles[ny][nx] = FLOOR;
        gs.got++;
        if (gs.got >= gs.total) gs.doorOpen = true;
        setHud(h => ({ ...h, got: gs.got }));
      }

      // ── Entered open door → level complete
      if (target === DOOR && gs.doorOpen) {
        phaseRef.current = 'level_complete';
        setPhase('level_complete');
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [initLevel]);

  // ── Canvas render loop ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const ph = phaseRef.current;
      const gs = gsRef.current;
      pulseRef.current += 0.055;

      // Background fill
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      if (ph !== 'select' && gs) {
        const toggleOn = (gs.moves % 6) < 3;

        // ── Draw all tiles
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            drawTile(ctx, gs.tiles[y]?.[x] ?? WALL, x, y, toggleOn, pulseRef.current, gs.doorOpen);
          }
        }

        // ── Draw player (blink during death flash)
        if (ph !== 'dead' || gs.flash % 6 < 3) {
          drawPlayer(ctx, gs.px, gs.py, gs.facing);
        }

        // ── Death flash countdown
        if (ph === 'dead') {
          const alpha = (gs.flash / 30) * 0.5;
          ctx.fillStyle = `rgba(255,40,40,${alpha})`;
          ctx.fillRect(0, 0, W, H);
          gs.flash--;
          if (gs.flash <= 0) {
            initLevel(gs.diff, gs.lvl);
            phaseRef.current = 'playing';
            setPhase('playing');
          }
        }

        // ── Level complete overlay
        if (ph === 'level_complete') {
          ctx.fillStyle = 'rgba(0,0,0,0.62)';
          ctx.fillRect(0, 0, W, H);
          roundRect(ctx, W / 2 - 192, H / 2 - 76, 384, 152, 20, '#FFFDE7');
          ctx.fillStyle = '#1A1A2E';
          ctx.font = 'bold 28px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✨ Level Complete! ✨', W / 2, H / 2 - 28);
          ctx.font = '15px system-ui, sans-serif';
          ctx.fillStyle = '#555';
          ctx.fillText(
            gs.lvl + 1 < MAPS[gs.diff].length
              ? 'Press  Enter  or  Space  to continue →'
              : 'Press  Enter  or  Space  for the finale!',
            W / 2, H / 2 + 14,
          );
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillStyle = '#888';
          ctx.fillText('R to restart this level', W / 2, H / 2 + 42);
        }

        // ── Victory overlay
        if (ph === 'victory') {
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
          ctx.fillRect(0, 0, W, H);

          const g = ctx.createLinearGradient(0, H / 2 - 148, 0, H / 2 + 148);
          g.addColorStop(0, '#FF6B9D');
          g.addColorStop(1, '#B5294A');
          roundRect(ctx, W / 2 - 214, H / 2 - 146, 428, 292, 24, g);

          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 34px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎉  You Did It!  🎉', W / 2, H / 2 - 96);

          ctx.font = '16px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.88)';
          ctx.fillText('You found the secret key!', W / 2, H / 2 - 54);

          // passcode card
          roundRect(ctx, W / 2 - 116, H / 2 - 32, 232, 76, 14, 'rgba(255,255,255,0.16)');
          ctx.fillStyle = '#FBBF24';
          ctx.font = 'bold 52px monospace';
          ctx.fillText(pass, W / 2, H / 2 + 6);

          ctx.fillStyle = 'rgba(255,220,234,0.92)';
          ctx.font = '15px system-ui, sans-serif';
          ctx.fillText('Enter this in the 🔒 Secret Folder!', W / 2, H / 2 + 76);

          ctx.fillStyle = 'rgba(255,255,255,0.38)';
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillText('Close window  ·  Click the Secret icon  ·  Type the code', W / 2, H / 2 + 106);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pass, initLevel]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: C.bg, overflow: 'hidden',
      userSelect: 'none',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* HUD bar */}
      {phase !== 'select' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 14px',
          background: '#111827',
          borderBottom: '2px solid #2D3561',
          fontSize: 12, color: '#C7D5E8', flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700 }}>
            💕&nbsp;{hud.got}&nbsp;/&nbsp;{hud.total}
          </span>
          <span style={{ fontWeight: 800, letterSpacing: '0.2px' }}>
            Level {hud.lvl}: {hud.name}
          </span>
          <span style={{ opacity: 0.45 }}>
            {hud.diff} · R = restart
          </span>
        </div>
      )}

      {/* Canvas wrapper */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', imageRendering: 'pixelated' }}
        />

        {/* ── Difficulty select screen ── */}
        {phase === 'select' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg, #0D1B2A 0%, #152232 50%, #0D2137 100%)',
            gap: 22,
          }}>
            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 60, lineHeight: 1, marginBottom: 10 }}>💕</div>
              <h2 style={{
                color: '#FFF', fontSize: 30, margin: 0,
                fontWeight: 900, letterSpacing: '-0.5px',
              }}>
                Heart Maze
              </h2>
              <p style={{
                color: '#6A8FAA', fontSize: 13, margin: '10px 0 0', lineHeight: 1.8,
              }}>
                Collect all hearts · Reach the door · Unlock the secret
              </p>
            </div>

            {/* Difficulty buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {([ 
                { d: 'easy'   as const, emoji: '😊', label: 'Easy',   bg: '#166534', hi: '#1A7A3F' },
                { d: 'medium' as const, emoji: '😤', label: 'Medium', bg: '#92400E', hi: '#B45309' },
                { d: 'hard'   as const, emoji: '💀', label: 'Hard',   bg: '#991B1B', hi: '#B91C1C' },
              ]).map(({ d, emoji, label, bg, hi }) => (
                <button
                  key={d}
                  onClick={() => startGame(d)}
                  style={{
                    padding: '15px 32px',
                    borderRadius: 14, border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800, fontSize: 16,
                    background: bg, color: '#FFF',
                    boxShadow: '0 5px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)',
                    transition: 'transform 0.08s, box-shadow 0.08s, background 0.12s',
                    letterSpacing: '0.3px',
                  }}
                  onMouseEnter={e  => { e.currentTarget.style.background = hi; }}
                  onMouseLeave={e  => {
                    e.currentTarget.style.background  = bg;
                    e.currentTarget.style.transform   = '';
                    e.currentTarget.style.boxShadow   = '0 5px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)';
                  }}
                  onMouseDown={e   => {
                    e.currentTarget.style.transform = 'translateY(3px)';
                    e.currentTarget.style.boxShadow = '0 2px 0 rgba(0,0,0,0.45)';
                  }}
                  onMouseUp={e     => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 5px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)';
                  }}
                >
                  {emoji}&nbsp;&nbsp;{label}
                </button>
              ))}
            </div>

            {/* Controls reminder */}
            <div style={{
              color: '#2E4A5F', fontSize: 12, textAlign: 'center', lineHeight: 2,
            }}>
              <div>← → ↑ ↓ &nbsp;&nbsp;or&nbsp;&nbsp; W A S D &nbsp;&nbsp;to move</div>
              <div>R to restart &nbsp;·&nbsp; Enter / Space to advance</div>
              <div style={{ marginTop: 4, color: '#243340', fontSize: 11 }}>
                Hard: 🟠 orange spikes toggle — time your moves!
              </div>
            </div>
          </div>
        )}

        {/* ── Death message ── */}
        {phase === 'dead' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#DC2626', color: '#FFF',
            padding: '8px 24px', borderRadius: 10,
            fontSize: 14, fontWeight: 800,
            pointerEvents: 'none',
            boxShadow: '0 4px 20px rgba(220,38,38,0.6)',
            letterSpacing: '0.3px',
          }}>
            💀&nbsp;Ouch! Respawning…
          </div>
        )}
      </div>
    </div>
  );
}
