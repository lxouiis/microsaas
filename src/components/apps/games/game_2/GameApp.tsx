'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// "Hull Run" — a Project Hail Mary–inspired lane runner.
// Grace sprints across the three parallel hull tubes of the ship for 65 seconds,
// jumping gaps and dodging debris, guided by Rocky, to collect hearts. 3+ hearts
// by the time the clock runs out reveals the secret code with a planet reveal;
// fewer sends her tumbling into deep space.
// ──────────────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'playing' | 'dead' | 'victory' | 'failure';
type EventType = 'gap' | 'debris' | 'heart';

interface TrackEvent {
  dist: number;
  lane: number; // 0,1,2
  type: EventType;
  judged: boolean;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

interface GameAppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  secretPassword?: string;
}

interface GS {
  lane: number;
  laneX: number;
  jumping: boolean;
  jumpT: number;
  squash: number;      // >0 = squash (landing), <0 = stretch (takeoff), decays to 0
  scroll: number;
  speed: number;        // px / second
  elapsed: number;      // seconds since run start
  timeLeft: number;     // seconds remaining
  got: number;
  flash: number;        // death-flash seconds remaining
  events: TrackEvent[];
  particles: Particle[];
  victoryT: number;
  failureT: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Canvas + lane constants
// ──────────────────────────────────────────────────────────────────────────────
const W = 600, H = 440;
const LANES = [140, 300, 460];
const LANE_W = 120;
const PLAYER_ROW = 352;
const JUMP_SECONDS = 0.46;
const GAP_HALF = 34;
const SPEED_START = 150;   // px/sec
const SPEED_MAX = 300;     // px/sec
const DIST_STEP = 250;
const TIMER_SECONDS = 65;
const WIN_HEARTS = 3;
const MAX_DT = 1 / 15;     // clamp so backgrounded tabs don't jump the scene

const C = {
  spaceTop: '#06080F',
  spaceBottom: '#0A1420',
  nebulaGreen: 'rgba(92, 219, 149, 0.22)',
  nebulaOrange: 'rgba(255, 150, 70, 0.16)',
  hull: '#D7D9DC',
  hullDark: '#9FA3A8',
  hullRib: 'rgba(0,0,0,0.12)',
  hullShine: 'rgba(255,255,255,0.55)',
  void: '#040608',
  debris: '#5B5F66',
  debrisHi: '#86898F',
  heart: '#FF6B9D',
  suitRed: '#C0392B',
  suitRedDark: '#8E2A1F',
  suitRedLight: '#E0584A',
  visor: '#BFE9FF',
};

// ──────────────────────────────────────────────────────────────────────────────
// Easing (hand values, not approximated — from the animate skill's table)
// ──────────────────────────────────────────────────────────────────────────────
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ──────────────────────────────────────────────────────────────────────────────
// Deterministic PRNG (seeded) so the run is fair & reproducible, not truly random
// ──────────────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hand-scripted onramp (fair, teaches the mechanics) + procedurally generated
// rest of the 65s track. Generation always leaves at least one lane safe.
function buildTrack(): TrackEvent[] {
  const intro: Array<[number, EventType, number]> = [
    [1, 'heart', 1],
    [2, 'debris', 1],
    [3, 'heart', 0],
    [4, 'gap', 2],
    [5, 'debris', 0],
    [6, 'heart', 2],
  ];
  const events: TrackEvent[] = intro.map(([k, type, lane]) => ({ dist: k * DIST_STEP, type, lane, judged: false }));

  const rand = mulberry32(20251019);
  let dist = events[events.length - 1].dist;
  const targetDist = TIMER_SECONDS * SPEED_MAX * 1.2;

  while (dist < targetDist) {
    const step = Math.max(150, 260 - dist * 0.004);
    dist += step;

    const hazardLanes = new Set<number>();
    const roll = rand();

    if (roll < 0.24) {
      const lane = Math.floor(rand() * 3);
      events.push({ dist, type: 'gap', lane, judged: false });
      hazardLanes.add(lane);
    } else if (roll < 0.46) {
      const lane = Math.floor(rand() * 3);
      events.push({ dist, type: 'debris', lane, judged: false });
      hazardLanes.add(lane);
    } else if (roll < 0.62) {
      // two-lane hazard beat — exactly one lane stays safe
      const shuffled = [0, 1, 2].sort(() => rand() - 0.5);
      const [a, b] = shuffled;
      events.push({ dist, type: rand() < 0.5 ? 'gap' : 'debris', lane: a, judged: false });
      events.push({ dist: dist + 6, type: rand() < 0.5 ? 'gap' : 'debris', lane: b, judged: false });
      hazardLanes.add(a); hazardLanes.add(b);
    }
    // else: a calm beat with no hazard — breathing room

    if (rand() < 0.6) {
      const free = [0, 1, 2].filter(l => !hazardLanes.has(l));
      const lane = free.length ? free[Math.floor(rand() * free.length)] : Math.floor(rand() * 3);
      events.push({ dist: dist + (hazardLanes.size ? 12 : 0), type: 'heart', lane, judged: false });
    }
  }

  return events;
}

// ──────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ──────────────────────────────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.spaceTop);
  g.addColorStop(1, C.spaceBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const blob = (x: number, y: number, r: number, color: string) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(120 + Math.sin(t * 0.3) * 20, 70, 180, C.nebulaGreen);
  blob(480 + Math.cos(t * 0.24) * 24, 50, 160, C.nebulaOrange);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97 + (t * 20) % 600) % W;
    const sy = (i * 53) % 150;
    ctx.fillRect(sx, sy, 1.4, 1.4);
  }
}

function drawLaneHull(ctx: CanvasRenderingContext2D, laneX: number, scroll: number, voidFrom: number, voidTo: number, gapAlpha: number) {
  const left = laneX - LANE_W / 2;

  const grad = ctx.createLinearGradient(left, 0, left + LANE_W, 0);
  grad.addColorStop(0, C.hullDark);
  grad.addColorStop(0.5, C.hull);
  grad.addColorStop(1, C.hullDark);
  ctx.fillStyle = grad;
  ctx.fillRect(left, 0, LANE_W, H);

  ctx.fillStyle = C.hullShine;
  ctx.fillRect(left + LANE_W * 0.42, 0, 6, H);

  ctx.fillStyle = C.hullRib;
  const ribGap = 34;
  const offset = scroll % ribGap;
  for (let y = -ribGap; y < H + ribGap; y += ribGap) {
    ctx.fillRect(left, y + offset, LANE_W, 3);
  }

  if (voidTo > 0 && voidFrom < H && gapAlpha > 0) {
    const y0 = Math.max(0, voidFrom);
    const y1 = Math.min(H, voidTo);
    ctx.save();
    ctx.globalAlpha = gapAlpha;
    ctx.fillStyle = C.void;
    ctx.fillRect(left, y0, LANE_W, y1 - y0);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 6; i++) {
      const sx = left + 8 + (i * 19) % (LANE_W - 16);
      const sy = y0 + ((i * 37) % Math.max(1, y1 - y0));
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
    ctx.fillStyle = `rgba(255,90,90,${0.55 * gapAlpha})`;
    ctx.fillRect(left, y0, LANE_W, 2);
    ctx.fillRect(left, y1 - 2, LANE_W, 2);
    ctx.restore();
  }
}

function drawDebris(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = C.debris;
  ctx.fillRect(-26, -16, 52, 32);
  ctx.fillStyle = C.debrisHi;
  ctx.fillRect(-26, -16, 52, 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-26, -16, 52, 32);
  ctx.fillStyle = '#FFB347';
  ctx.fillRect(-4, -26, 8, 10);
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, pulse: number, alpha: number, scale: number) {
  const s = scale * (0.9 + Math.sin(pulse) * 0.12);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.bezierCurveTo(0, -15, -14, -15, -14, -5);
  ctx.bezierCurveTo(-14, 5, 0, 14, 0, 16);
  ctx.bezierCurveTo(0, 14, 14, 5, 14, -5);
  ctx.bezierCurveTo(14, -15, 0, -15, 0, -7);
  ctx.fillStyle = C.heart;
  ctx.shadowColor = C.heart;
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(-5, -6, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
  ctx.restore();
}

function drawGrace(ctx: CanvasRenderingContext2D, x: number, y: number, jumpOffset: number, stride: number, squash: number, rotate = 0, scale = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y - jumpOffset);
  if (rotate) ctx.rotate(rotate);
  if (scale !== 1) ctx.scale(scale, scale);

  const scaleX = 1 + Math.max(squash, 0) * 0.14 - Math.min(squash, 0) * 0.1;
  const scaleY = 1 - Math.max(squash, 0) * 0.18 + Math.min(squash, 0) * 0.16;

  const shadowScale = (1 - Math.min(0.6, jumpOffset / 60)) * scale;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 20 + jumpOffset, 13 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.scale(scaleX, scaleY);

  const legSwing = Math.sin(stride) * 7;
  const armSwing = Math.sin(stride + Math.PI) * 6;

  // legs
  ctx.fillStyle = C.suitRedDark;
  ctx.fillRect(-8, 6 + legSwing * 0.2, 7, 14 - legSwing * 0.3);
  ctx.fillRect(1, 6 - legSwing * 0.2, 7, 14 + legSwing * 0.3);
  ctx.fillStyle = '#2A2A2E';
  ctx.fillRect(-9, 18 + legSwing * 0.2, 9, 4);
  ctx.fillRect(0, 18 - legSwing * 0.2, 9, 4);

  // backpack / life-support pack
  ctx.fillStyle = '#4A4F57';
  ctx.fillRect(-12, -12, 5, 16);

  // torso / suit
  ctx.fillStyle = C.suitRed;
  ctx.fillRect(-10, -14, 20, 22);
  ctx.fillStyle = C.suitRedLight;
  ctx.fillRect(-10, -14, 20, 4);
  // shoulder patch
  ctx.fillStyle = '#F4D35E';
  ctx.fillRect(-7, -10, 6, 5);
  ctx.fillStyle = '#4C8FD6';
  ctx.fillRect(4, -10, 5, 4);

  // arms (swinging)
  ctx.fillStyle = C.suitRedDark;
  ctx.fillRect(-14, -10 + armSwing * 0.3, 5, 14);
  ctx.fillRect(9, -10 - armSwing * 0.3, 5, 14);

  // helmet
  ctx.fillStyle = '#E8ECEF';
  ctx.beginPath();
  ctx.arc(0, -22, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.visor;
  ctx.beginPath();
  ctx.ellipse(1.5, -22, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-1, -25, 2.5, 1.6, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // helmet rim highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -22, 11, Math.PI * 1.1, Math.PI * 1.7);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawPlanet(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  // atmosphere glow
  const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.35);
  halo.addColorStop(0, 'rgba(120,230,170,0.5)');
  halo.addColorStop(1, 'rgba(120,230,170,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  body.addColorStop(0, '#BFF0D6');
  body.addColorStop(0.5, '#4FAE7C');
  body.addColorStop(1, '#1C5A3C');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // terminator shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, cy, r * 0.98, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.restore();
}

// Rocky — small inline rock-crab glyph used in the intro / HUD
function RockyIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g stroke="#6B5842" strokeWidth="3" strokeLinecap="round">
        <path d="M22 30 L10 14" />
        <path d="M78 30 L90 14" />
        <path d="M20 62 L6 74" />
        <path d="M80 62 L94 74" />
      </g>
      <path d="M50 20 L74 34 L80 62 L62 82 L38 82 L20 62 L26 34 Z" fill="#8B7355" stroke="#5C4A35" strokeWidth="2.5" />
      <path d="M50 20 L74 34 L80 62 L62 82 L38 82 L20 62 L26 34 Z" fill="url(#rockyGrad)" opacity="0.5" />
      <defs>
        <linearGradient id="rockyGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#A68B6A" />
          <stop offset="100%" stopColor="#6B5842" />
        </linearGradient>
      </defs>
      <circle cx="42" cy="48" r="3.5" fill="#CFE8C7" />
      <circle cx="60" cy="46" r="3.5" fill="#CFE8C7" />
      <path d="M34 40 L46 44" stroke="#4A3A28" strokeWidth="2" />
      <path d="M68 40 L56 42" stroke="#4A3A28" strokeWidth="2" />
    </svg>
  );
}

function spawnHeartParticles(particles: Particle[], x: number, y: number) {
  const colors = [C.heart, '#FFD36B', '#FFFFFF'];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 60 + Math.random() * 70;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.55,
      maxLife: 0.55,
      color: colors[i % colors.length],
      size: 2 + Math.random() * 2,
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export default function HullRunGame({ config, secretPassword }: GameAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>('intro');
  const gsRef = useRef<GS | null>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const strideRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('intro');
  const [hud, setHud] = useState({ got: 0, timeLeft: TIMER_SECONDS });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const pass: string =
    secretPassword ??
    (typeof config?.secretPassword === 'string' ? config.secretPassword : undefined) ??
    (typeof config?.password === 'string' ? config.password : undefined) ??
    '1234';

  const initRun = useCallback((): GS => {
    const gs: GS = {
      lane: 1,
      laneX: LANES[1],
      jumping: false,
      jumpT: 0,
      squash: 0,
      scroll: 0,
      speed: SPEED_START,
      elapsed: 0,
      timeLeft: TIMER_SECONDS,
      got: 0,
      flash: 0,
      events: buildTrack(),
      particles: [],
      victoryT: 0,
      failureT: 0,
    };
    gsRef.current = gs;
    setHud({ got: 0, timeLeft: TIMER_SECONDS });
    return gs;
  }, []);

  const startGame = useCallback(() => {
    initRun();
    lastFrameRef.current = null;
    phaseRef.current = 'playing';
    setPhase('playing');
  }, [initRun]);

  const doJump = (gs: GS) => {
    if (!gs.jumping) { gs.jumping = true; gs.jumpT = 0; gs.squash = -0.6; }
  };
  const moveLane = (gs: GS, dir: -1 | 1) => {
    gs.lane = Math.max(0, Math.min(2, gs.lane + dir));
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const ph = phaseRef.current;
      const gs = gsRef.current;

      if (ph === 'intro') {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startGame(); }
        return;
      }
      if (ph === 'victory' || ph === 'failure') {
        if ((e.key === 'Enter' || e.key === ' ') && ph === 'failure') { e.preventDefault(); startGame(); }
        return;
      }
      if (ph === 'dead' || !gs) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); moveLane(gs, -1); }
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); moveLane(gs, 1); }
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') { e.preventDefault(); doJump(gs); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [startGame]);

  // ── Touch / pointer zones (mobile-first, no 300ms click delay) ───────────
  const handleZone = (zone: 'left' | 'right' | 'jump') => {
    const ph = phaseRef.current;
    const gs = gsRef.current;
    if (ph !== 'playing' || !gs) return;
    if (zone === 'left') moveLane(gs, -1);
    if (zone === 'right') moveLane(gs, 1);
    if (zone === 'jump') doJump(gs);
  };

  // ── Game loop (delta-time based for consistent speed across devices) ────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HiDPI-crisp rendering on mobile without changing game-logic coordinates
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const draw = (now: number) => {
      const last = lastFrameRef.current;
      const rawDt = last == null ? 0 : (now - last) / 1000;
      lastFrameRef.current = now;
      const dt = Math.min(MAX_DT, Math.max(0, rawDt));

      const ph = phaseRef.current;
      const gs = gsRef.current;
      tRef.current += reducedMotionRef.current ? dt * 0.4 : dt;

      drawBackground(ctx, tRef.current);

      if (ph !== 'intro' && gs) {
        if (ph === 'playing' || ph === 'dead') {
          gs.elapsed += dt;
          gs.timeLeft = Math.max(0, TIMER_SECONDS - gs.elapsed);
          if (Math.ceil(gs.timeLeft) !== hud.timeLeft || gs.got !== hud.got) {
            setHud({ got: gs.got, timeLeft: Math.ceil(gs.timeLeft) });
          }
          if (gs.timeLeft <= 0 && ph === 'playing') {
            if (gs.got >= WIN_HEARTS) { phaseRef.current = 'victory'; setPhase('victory'); }
            else { phaseRef.current = 'failure'; setPhase('failure'); }
          }
        }

        if (ph === 'playing') {
          gs.scroll += gs.speed * dt;
          gs.speed = Math.min(SPEED_MAX, SPEED_START + gs.elapsed * 2.6);
          strideRef.current += dt * (reducedMotionRef.current ? 2.4 : 6.5);

          if (gs.jumping) {
            gs.jumpT += dt;
            if (gs.jumpT >= JUMP_SECONDS) { gs.jumping = false; gs.jumpT = 0; gs.squash = 1; }
          }
          // decay squash/stretch toward 0 (hand-approximated spring settle)
          gs.squash *= Math.pow(0.002, dt);

          for (const ev of gs.events) {
            if (ev.judged) continue;
            const rel = ev.dist - gs.scroll;
            if (rel <= 0) {
              ev.judged = true;
              if (ev.lane === gs.lane) {
                if (ev.type === 'heart') {
                  gs.got++;
                  spawnHeartParticles(gs.particles, LANES[ev.lane], PLAYER_ROW - 10);
                } else if (ev.type === 'gap') {
                  if (!gs.jumping) {
                    gs.flash = 0.42;
                    phaseRef.current = 'dead';
                    setPhase('dead');
                  }
                } else if (ev.type === 'debris') {
                  gs.flash = 0.42;
                  phaseRef.current = 'dead';
                  setPhase('dead');
                }
              }
            }
          }
        }

        const targetX = LANES[gs.lane];
        gs.laneX += (targetX - gs.laneX) * Math.min(1, dt * 11);

        for (let i = 0; i < 3; i++) {
          let voidFrom = -9999, voidTo = -9999, gapAlpha = 1;
          for (const ev of gs.events) {
            if (ev.type !== 'gap' || ev.lane !== i) continue;
            const rel = ev.dist - gs.scroll;
            if (rel > -GAP_HALF - 40 && rel < H + GAP_HALF) {
              voidFrom = PLAYER_ROW - rel - GAP_HALF;
              voidTo = PLAYER_ROW - rel + GAP_HALF;
              const entryRel = H + 40 - rel;
              gapAlpha = easeOutCubic(clamp01(entryRel / 40));
            }
          }
          drawLaneHull(ctx, LANES[i], gs.scroll, voidFrom, voidTo, gapAlpha);
        }

        for (const ev of gs.events) {
          const rel = ev.dist - gs.scroll;
          if (rel < -40 || rel > H + 40) continue;
          const sy = PLAYER_ROW - rel;
          const entryProgress = clamp01((H + 40 - rel) / 36);
          const alpha = easeOutCubic(entryProgress);
          const scale = 0.82 + 0.18 * easeOutCubic(entryProgress);
          if (ev.type === 'debris' && !ev.judged) drawDebris(ctx, LANES[ev.lane], sy, alpha, scale);
          if (ev.type === 'heart' && !ev.judged) drawHeart(ctx, LANES[ev.lane], sy, tRef.current * 4 + ev.dist, alpha, scale);
        }

        // particles
        for (let i = gs.particles.length - 1; i >= 0; i--) {
          const p = gs.particles[i];
          p.life -= dt;
          if (p.life <= 0) { gs.particles.splice(i, 1); continue; }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 90 * dt;
          const a = easeOutCubic(clamp01(p.life / p.maxLife));
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const jumpOffset = gs.jumping
          ? Math.sin(clamp01(gs.jumpT / JUMP_SECONDS) * Math.PI) * 46
          : 0;

        if (ph === 'playing' || (ph === 'dead' && gs.flash % 0.12 < 0.06)) {
          drawGrace(ctx, gs.laneX, PLAYER_ROW, jumpOffset, strideRef.current, gs.squash);
        }

        if (ph === 'dead') {
          const alpha = (gs.flash / 0.42) * 0.5;
          ctx.fillStyle = `rgba(255,60,40,${alpha})`;
          ctx.fillRect(0, 0, W, H);
          gs.flash -= dt;
          if (gs.flash <= 0) {
            gs.scroll = Math.max(0, gs.scroll - 170);
            for (const ev of gs.events) {
              if (ev.type !== 'heart' && ev.dist > gs.scroll) ev.judged = false;
            }
            gs.lane = 1;
            gs.laneX = LANES[1];
            phaseRef.current = 'playing';
            setPhase('playing');
          }
        }

        if (ph === 'victory') {
          gs.victoryT += dt;
          const zoomT = easeOutCubic(clamp01(gs.victoryT / 1.7));
          ctx.fillStyle = `rgba(0,0,0,${0.3 + 0.55 * zoomT})`;
          ctx.fillRect(0, 0, W, H);

          const planetR = 18 + zoomT * 150;
          drawPlanet(ctx, W / 2, H / 2 + 40, planetR, 0.5 + 0.5 * zoomT);

          if (gs.victoryT > 1.1) {
            const cardT = easeOutCubic(clamp01((gs.victoryT - 1.1) / 0.5));
            ctx.save();
            ctx.globalAlpha = cardT;
            const g = ctx.createLinearGradient(0, H / 2 - 150, 0, H / 2 + 150);
            g.addColorStop(0, 'rgba(47,111,79,0.92)');
            g.addColorStop(1, 'rgba(27,74,51,0.92)');
            roundRect(ctx, W / 2 - 214, H / 2 - 148, 428, 296, 24, g);

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 28px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🪨  Rocky is amazed!  🌍', W / 2, H / 2 - 96);

            ctx.font = '14px system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.88)';
            ctx.fillText(`Grace found ${gs.got} heart${gs.got === 1 ? '' : 's'} before the hull run ended!`, W / 2, H / 2 - 58);

            roundRect(ctx, W / 2 - 116, H / 2 - 30, 232, 76, 14, 'rgba(255,255,255,0.14)');
            ctx.fillStyle = '#FBBF24';
            ctx.font = 'bold 50px monospace';
            ctx.fillText(pass, W / 2, H / 2 + 8);

            ctx.fillStyle = 'rgba(220,255,230,0.92)';
            ctx.font = '13px system-ui, sans-serif';
            ctx.fillText('Enter this in the 🔒 Secret Folder!', W / 2, H / 2 + 78);

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '11px system-ui, sans-serif';
            ctx.fillText('Close window · Click the Secret icon · Type the code', W / 2, H / 2 + 108);
            ctx.restore();
          }
        }

        if (ph === 'failure') {
          gs.failureT += dt;
          const fallT = easeOutCubic(clamp01(gs.failureT / 1.6));
          const graceScale = 1 - fallT * 0.85;
          const graceAlpha = 1 - fallT;
          const graceRotate = fallT * Math.PI * 1.6;
          const graceY = PLAYER_ROW + fallT * 120;
          if (graceAlpha > 0.01) {
            drawGrace(ctx, gs.laneX, graceY, 0, strideRef.current, 0, graceRotate, graceScale, graceAlpha);
          }
          // radial streak lines for a falling sensation (linear = constant motion)
          ctx.save();
          ctx.globalAlpha = 0.5 * fallT;
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1.4;
          for (let i = 0; i < 18; i++) {
            const ang = (i / 18) * Math.PI * 2;
            const r0 = 40 + (tRef.current * 240) % 200;
            const r1 = r0 + 50;
            ctx.beginPath();
            ctx.moveTo(gs.laneX + Math.cos(ang) * r0, graceY - 30 + Math.sin(ang) * r0 * 0.6);
            ctx.lineTo(gs.laneX + Math.cos(ang) * r1, graceY - 30 + Math.sin(ang) * r1 * 0.6);
            ctx.stroke();
          }
          ctx.restore();

          ctx.fillStyle = `rgba(0,0,0,${0.25 + fallT * 0.65})`;
          ctx.fillRect(0, 0, W, H);

          if (gs.failureT > 1.3) {
            const cardT = easeOutCubic(clamp01((gs.failureT - 1.3) / 0.5));
            ctx.save();
            ctx.globalAlpha = cardT;
            roundRect(ctx, W / 2 - 200, H / 2 - 110, 400, 220, 20, 'rgba(20,10,30,0.92)');
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 24px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌌 Lost in the Dark', W / 2, H / 2 - 56);
            ctx.font = '13px system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.78)';
            ctx.fillText(`Only ${gs.got} heart${gs.got === 1 ? '' : 's'} found — need ${WIN_HEARTS} before time runs out.`, W / 2, H / 2 - 20);
            ctx.fillText('Rocky is waiting for another try!', W / 2, H / 2 + 4);
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.fillStyle = '#7DD4D4';
            ctx.fillText('Press Enter / Space or tap below to retry', W / 2, H / 2 + 42);
            ctx.restore();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pass]);

  // ── Render ───────────────────────────────────────────────────────────────
  const urgent = phase === 'playing' && hud.timeLeft <= 10;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: C.spaceTop, overflow: 'hidden',
      userSelect: 'none',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes hr-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .hr-timer-urgent { animation: hr-pulse 0.6s ease-in-out infinite; color: #FF6B6B !important; }
        @media (prefers-reduced-motion: reduce) {
          .hr-timer-urgent { animation: none; }
        }
      `}</style>

      {(phase === 'playing' || phase === 'dead') && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 14px',
          background: 'rgba(6,8,15,0.9)',
          borderBottom: '2px solid #233041',
          fontSize: 12, color: '#D6E8F5', flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700 }}>💕&nbsp;{hud.got}</span>
          <span style={{ fontWeight: 800, letterSpacing: '0.2px' }}>🚀 Hull Run</span>
          <span className={urgent ? 'hr-timer-urgent' : ''} style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            ⏱ {hud.timeLeft}s
          </span>
        </div>
      )}

      <div
        ref={wrapRef}
        style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', touchAction: 'none' }}
        />

        {phase === 'intro' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg, #06080F 0%, #0C1A14 55%, #0A1420 100%)',
            gap: 16, padding: 20, textAlign: 'center',
          }}>
            <RockyIcon size={68} />
            <div>
              <h2 style={{ color: '#FFF', fontSize: 25, margin: 0, fontWeight: 900, letterSpacing: '-0.3px' }}>Hull Run</h2>
              <p style={{ color: '#8FB3A6', fontSize: 12, margin: '6px 0 0' }}>Project Hail Mary–inspired mini game</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '13px 18px', maxWidth: 380, color: '#D6E8DD', fontSize: 12.5, lineHeight: 1.65,
            }}>
              🪨 <strong>Rocky says:</strong> &ldquo;You have <strong>65 seconds</strong>! Switch tubes with ← / →,
              jump gaps with ↑, dodge debris. Collect <strong>3+ hearts</strong> before time's up — or we're both lost in the dark.&rdquo;
            </div>

            <button
              onClick={startGame}
              style={{
                padding: '13px 34px', borderRadius: 14, border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: 15, background: '#2F6F4F', color: '#FFF',
                boxShadow: '0 5px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              🚀 Start Running
            </button>
            <div style={{ color: '#2E4A44', fontSize: 11, lineHeight: 1.8 }}>
              ← → or A / D to switch tubes &nbsp;·&nbsp; ↑ / W / Space to jump
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div
              onPointerDown={() => handleZone('left')}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', cursor: 'pointer', touchAction: 'none' }}
            />
            <div
              onPointerDown={() => handleZone('jump')}
              style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: '40%', cursor: 'pointer', touchAction: 'none' }}
            />
            <div
              onPointerDown={() => handleZone('right')}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', cursor: 'pointer', touchAction: 'none' }}
            />
          </>
        )}

        {phase === 'dead' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#DC2626', color: '#FFF', padding: '8px 24px', borderRadius: 10,
            fontSize: 14, fontWeight: 800, pointerEvents: 'none',
            boxShadow: '0 4px 20px rgba(220,38,38,0.6)', letterSpacing: '0.3px',
          }}>
            💥&nbsp;Careful! Respawning…
          </div>
        )}

        {phase === 'failure' && (
          <div
            onPointerDown={startGame}
            style={{ position: 'absolute', inset: 0, cursor: 'pointer', touchAction: 'none' }}
            aria-label="Tap to retry"
          />
        )}
      </div>
    </div>
  );
}
