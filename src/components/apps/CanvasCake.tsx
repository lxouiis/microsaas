// Happy Birthday - browser port of birthday.py (turtle/tkinter -> React + TypeScript + Canvas 2D).
// Usage: drop into any React + TypeScript project and render <Birthday />.
// The cake of multilingual "happy birthday" phrases is drawn, the candles are blown out,
// and the cake gets eaten bite by bite. The whole animation runs for about 50 seconds.

import { useEffect, useRef } from "react";

/* ============================================================
 * Constants
 * ============================================================ */

const W = 800;
const H = 800;
const OY = 56;
const TICK = 16;
const GAP = 7;
const SIZES = [9, 10, 11, 12];
const FONT = "Arial";
const BG = "#060208";
const SEED = 11;

const TOTAL_MS = 50000; // total length of the animation
const START_DELAY = 300; // pause before anything moves
const TAIL_FRAMES = 70; // frames reserved after the last bite for the plate to clear

const INTRO = 120;
const BLOW_GAP = 40;
const BLOW_N = 26;

type RGB = [number, number, number];
type Box = [number, number, number, number]; // x0, y0, x1, y1 in canvas (centered) coordinates

const PHRASES = [
  "Happy Birthday",
  "İyi ki doğdun",
  "Feliz cumpleaños",
  "Joyeux anniversaire",
  "Alles Gute zum Geburtstag",
  "Buon compleanno",
  "Feliz aniversário",
  "С днём рождения",
  "생일 축하해요",
  "お誕生日おめでとう",
  "生日快乐",
  "जन्मदिन मुबारक हो",
  "Χρόνια πολλά",
  "Gefeliciteerd",
  "Grattis på födelsedagen",
  "Wszystkiego najlepszego",
  "สุขสันต์วันเกิด",
  "Chúc mừng sinh nhật",
  "Selamat ulang tahun",
  "З днем народження",
  "عيد ميلاد سعيد",
  "تولدت مبارک",
  "יום הולדת שמח",
  "Tillykke med fødselsdagen",
  "Všechno nejlepší",
];

// name, width, bottom y, top y, top radius, bottom radius
type Part = { name: string; W: number; bot: number; top: number; Rt: number; Rb: number };
const PARTS: Part[] = [
  { name: "plate", W: 350, bot: -302, top: -262, Rt: 18, Rb: 18 },
  { name: "base", W: 300, bot: -262, top: -110, Rt: 22, Rb: 10 },
  { name: "mid", W: 225, bot: -110, top: -5, Rt: 22, Rb: 0 },
  { name: "top", W: 150, bot: -5, top: 85, Rt: 20, Rb: 0 },
];

const CANDLE_X = [-100, -50, 0, 50, 100];
const CANDLE_Y0 = 96;
const CANDLE_Y1 = 166;
const FLAME_Y = 170;

const PAL: Record<string, RGB> = {
  plate: [0.95, 0.72, 0.3],
  base: [0.8, 0.12, 0.42],
  mid: [0.95, 0.3, 0.55],
  top: [1.0, 0.55, 0.7],
};
const PHASE: Record<string, number> = { base: 0.0, mid: 1.7, top: 3.1 };
const CREAM: RGB = [1.0, 0.9, 0.93];
const FILL: RGB = [1.0, 0.8, 0.55];
const FLASH: RGB = [1.0, 0.78, 0.78];
const WHITE: RGB = [1, 1, 1];

const RED: RGB = [0.95, 0.1, 0.05];
const ORANGE: RGB = [1.0, 0.55, 0.05];
const YELLOW: RGB = [1.0, 0.8, 0.25];
const EMBER: RGB = [0.3, 0.04, 0.02];
const BGC: RGB = [0x06 / 255, 0x02 / 255, 0x08 / 255];

/* ============================================================
 * Helpers
 * ============================================================ */

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const mix = (a: RGB, b: RGB, k: number): RGB => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
  a[2] + (b[2] - a[2]) * k,
];
const dim = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
const toCss = (c: RGB) =>
  `rgb(${Math.trunc(clamp(c[0]) * 255)}, ${Math.trunc(clamp(c[1]) * 255)}, ${Math.trunc(clamp(c[2]) * 255)})`;

// Turtle y (up) -> canvas y (down), with the same OY offset as the original
const cyOf = (y: number) => -(y + OY);

const YMAX = Math.max(...PARTS.map((p) => p.top));
const YMIN = Math.min(...PARTS.map((p) => p.bot));

class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  uniform(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  randint(a: number, b: number): number {
    return a + Math.floor(this.next() * (b - a + 1));
  }
  choice<T>(xs: T[]): T {
    return xs[Math.floor(this.next() * xs.length)];
  }
  shuffle<T>(xs: T[]): void {
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [xs[i], xs[j]] = [xs[j], xs[i]];
    }
  }
}

function halfW(part: Part, y: number): number {
  const { W: wd, top: y2, bot: y1, Rt, Rb } = part;
  let w = wd;
  if (Rt && y > y2 - Rt) {
    const d = y - (y2 - Rt);
    w = wd - Rt + Math.sqrt(Math.max(0, Rt * Rt - d * d));
  } else if (Rb && y < y1 + Rb) {
    const d = y1 + Rb - y;
    w = wd - Rb + Math.sqrt(Math.max(0, Rb * Rb - d * d));
  }
  return w;
}

function spans(y: number): [number, number][] {
  for (const part of PARTS) {
    if (part.bot <= y && y < part.top) {
      const w = halfW(part, y);
      return w > 0 ? [[-w, w]] : [];
    }
  }
  return [];
}

function intersect(A: [number, number][], B: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const a of A) {
    for (const b of B) {
      const lo = Math.max(a[0], b[0]);
      const hi = Math.min(a[1], b[1]);
      if (hi - lo > 14) out.push([lo, hi]);
    }
  }
  return out;
}

function partOf(y: number): string {
  for (const p of PARTS) if (p.bot <= y && y < p.top) return p.name;
  return "base";
}

function drip(part: string, x: number): number {
  const ph = PHASE[part];
  const a = 0.5 + 0.5 * Math.sin(x / 15.0 + ph);
  const b = 0.5 + 0.5 * Math.sin(x / 38.0 + ph * 2);
  return 22 + 26 * a * b;
}

/* ============================================================
 * Scene types
 * ============================================================ */

type Kind = "plate" | "body" | "cherry" | "candle";

type Item = {
  x: number;
  y: number;
  text: string;
  size: number;
  edge: boolean;
  color: RGB;
  kind: Kind;
  ci: number;
  alive: boolean;
  gone: boolean;
  rm: { f: number; N: number; dx: number; dy: number } | null;
  flash: number;
};

type Flame = {
  x: number;
  glow: Box;
  outer: Box;
  inner: Box;
  glowFill: RGB;
  outerFill: RGB;
  innerFill: RGB;
  done: boolean;
};

type Smoke = { x: number; y: number; f: number; N: number; ph: number; drift: number };

/* ============================================================
 * Component
 * ============================================================ */

export default function Birthday() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = W;
    canvas.height = H;

    const rng = new Rng(SEED);
    const measureCtx = document.createElement("canvas").getContext("2d");
    const measure = (text: string, size: number): number => {
      if (!measureCtx) return text.length * size * 0.6;
      measureCtx.font = `bold ${size}px ${FONT}`;
      return measureCtx.measureText(text).width;
    };

    /* ---------- phrase cycle (shuffled, endless) ---------- */
    let queue: string[] = [];
    const nextPhrase = (): string => {
      if (!queue.length) {
        queue = [...PHRASES];
        rng.shuffle(queue);
      }
      return queue.shift() as string;
    };

    /* ---------- color of a glyph on the cake ---------- */
    const colorFor = (y: number, x: number, edge: boolean): RGB => {
      const part = partOf(y);
      let base: RGB = PAL[part];
      if (part === "plate") {
        base = mix(base, WHITE, rng.uniform(0, 0.35));
      } else {
        const p = PARTS.find((q) => q.name === part) as Part;
        if (y > p.top - drip(part, x)) {
          base = mix(CREAM, base, rng.uniform(0, 0.18));
        } else if (part !== "base" && y < p.bot + 16) {
          base = mix(FILL, base, rng.uniform(0, 0.25));
        } else {
          base = mix(base, WHITE, rng.uniform(0, 0.18) + (edge ? 0.15 : 0));
        }
      }
      return [Math.min(1, base[0]), Math.min(1, base[1]), Math.min(1, base[2])];
    };

    /* ---------- build the cake of text ---------- */
    const items: Item[] = [];
    const newItem = (
      partial: Partial<Item> & Pick<Item, "x" | "y" | "text" | "size" | "color" | "kind">,
    ): Item => ({
      edge: false,
      ci: -1,
      alive: true,
      gone: false,
      rm: null,
      flash: 0,
      ...partial,
    });

    const rowH = Math.max(...SIZES.map((s) => s * 1.25)) + 4;
    const half = rowH / 2;
    let y = YMAX - half;
    while (y > YMIN + half) {
      const row = intersect(spans(y + half), spans(y - half));
      for (const [lo0, hi0] of row) {
        const lo = lo0 + 4;
        const hi = hi0 - 4;
        let cur = lo + rng.uniform(0, 8);
        const line: { cx: number; text: string; size: number; w: number }[] = [];

        for (; ;) {
          let fit: { text: string; size: number; w: number } | null = null;
          for (let k = 0; k < 12; k++) {
            const text = nextPhrase();
            const size = rng.choice(SIZES);
            const w = measure(text, size);
            if (cur + w <= hi) {
              fit = { text, size, w };
              break;
            }
          }
          if (!fit) break;
          line.push({ cx: cur + fit.w / 2, text: fit.text, size: fit.size, w: fit.w });
          cur += fit.w + GAP;
        }

        if (!line.length) continue;

        if (line.length > 1) {
          const last = line[line.length - 1];
          const left = hi - (last.cx + last.w / 2);
          line.forEach((it, i) => {
            it.cx += (left * i) / (line.length - 1);
          });
        } else {
          line[0].cx = (lo + hi) / 2;
        }

        line.forEach((it, i) => {
          const edge = i === 0 || i === line.length - 1;
          const kind: Kind = partOf(y) === "plate" ? "plate" : "body";
          items.push(
            newItem({
              x: it.cx,
              y,
              text: it.text,
              size: it.size,
              edge,
              kind,
              color: colorFor(y, it.cx, edge),
            }),
          );
        });
      }
      y -= rowH;
    }

    // cherries on top
    for (const cx of [-75, -25, 25, 75]) {
      items.push(
        newItem({
          x: cx,
          y: PARTS[3].top - 2,
          text: "●",
          size: 13,
          color: [0.92, 0.04, 0.12],
          kind: "cherry",
        }),
      );
    }

    // candles
    CANDLE_X.forEach((cx, ci) => {
      let k = 0;
      for (let yy = CANDLE_Y0; yy <= CANDLE_Y1; yy += 13) {
        const col: RGB = k % 2 === 0 ? [1.0, 0.92, 0.95] : [0.45, 0.8, 1.0];
        items.push(newItem({ x: cx, y: yy, text: "|", size: 12, color: col, kind: "candle", ci }));
        k++;
      }
    });

    const eatable = items.filter((it) => it.kind === "body" || it.kind === "cherry");

    /* ---------- plan every bite up front ----------
     * The number of bites decides how the eating phase is spaced out,
     * so the whole sequence is planned here and then played back. */
    const selectBite = (pool: Item[]): Item[] => {
      const th = rng.uniform(0, 2 * Math.PI);
      const vx = Math.cos(th);
      const vy = Math.sin(th);
      let ext = pool[0];
      for (const it of pool) if (it.x * vx + it.y * vy > ext.x * vx + ext.y * vy) ext = it;
      const R = rng.uniform(85, 115);
      const victims: Item[] = [];
      for (const it of pool) {
        const d = Math.hypot((it.x - ext.x) / 1.6, (it.y - ext.y) * 1.2) + rng.uniform(-10, 10);
        if (d <= R) victims.push(it);
      }
      return victims;
    };

    const bitePlan: Item[][] = [];
    let remaining = eatable.slice();
    while (remaining.length > 5) {
      const victims = selectBite(remaining);
      if (!victims.length) break;
      bitePlan.push(victims);
      const gone = new Set(victims);
      remaining = remaining.filter((it) => !gone.has(it));
    }
    bitePlan.push(remaining); // final bite clears whatever is left

    /* ---------- candle flames ---------- */
    const flames: Flame[] = CANDLE_X.map((cx) => {
      const by = cyOf(FLAME_Y);
      return {
        x: cx,
        glow: [cx - 26, by - 36, cx + 26, by + 16],
        outer: [cx - 8, by - 24, cx + 8, by + 2],
        inner: [cx - 4, by - 14, cx + 4, by + 1],
        glowFill: dim(ORANGE, 0.15),
        outerFill: RED,
        innerFill: YELLOW,
        done: false,
      };
    });

    const flicker = (f: Flame) => {
      const by = cyOf(FLAME_Y);
      const cx = f.x;
      const k = rng.next();
      const h = rng.uniform(20, 29);
      const w = rng.uniform(7, 10);
      const sway = rng.uniform(-2.5, 2.5);
      f.outer = [cx - w + sway, by - h, cx + w + sway, by + 2];
      f.outerFill = mix(RED, ORANGE, k);
      f.inner = [cx - w * 0.45 + sway * 0.6, by - h * 0.55, cx + w * 0.45 + sway * 0.6, by + 1];
      f.innerFill = mix(ORANGE, YELLOW, rng.uniform(0.3, 1));
      const g = rng.uniform(22, 30);
      f.glow = [cx - g, by - g - 10, cx + g, by + g - 14];
      f.glowFill = dim(mix(RED, ORANGE, k), rng.uniform(0.13, 0.22));
    };

    const blowStep = (f: Flame, u: number) => {
      const by = cyOf(FLAME_Y);
      const cx = f.x;
      const lean = 14 * Math.pow(u, 1.4) + rng.uniform(-1.5, 1.5) * (1 - u);
      const h = 24 * Math.pow(1 - u, 1.2) + 2 + rng.uniform(0, 4) * (1 - u);
      const w = 8 * (1 - 0.55 * u);
      f.outer = [cx - w + lean, by - h, cx + w + lean, by + 2];
      f.outerFill = mix(mix(RED, ORANGE, 0.4), EMBER, u);
      f.inner = [cx - w * 0.45 + lean * 0.6, by - h * 0.55, cx + w * 0.45 + lean * 0.6, by + 1];
      f.innerFill = mix(YELLOW, RED, clamp(u * 1.6));
      const g = 28 * (1 - 0.75 * u);
      f.glow = [cx - g, by - g - 10, cx + g, by + g - 14];
      f.glowFill = dim(ORANGE, 0.17 * Math.pow(1 - u, 1.5));
    };

    const smoke: Smoke[] = [];
    const finishBlow = (f: Flame) => {
      f.done = true;
      const by = cyOf(FLAME_Y);
      for (let i = 0; i < 4; i++) {
        smoke.push({
          x: f.x + 8,
          y: by - 2,
          f: -rng.randint(0, 14),
          N: rng.randint(55, 80),
          ph: rng.uniform(0, 6),
          drift: rng.uniform(6, 16),
        });
      }
    };

    /* ---------- removal (eaten / melted items) ---------- */
    const scheduleRemoval = (it: Item, dx: number, dy: number, n: number, delay = 0) => {
      it.alive = false;
      it.rm = { f: -delay, N: n, dx, dy };
    };

    const updateRemoval = (it: Item) => {
      if (!it.rm) return;
      it.rm.f++;
      if (it.rm.f <= 0) return;
      const u = clamp(it.rm.f / it.rm.N);
      if (u >= 1) {
        it.gone = true;
        it.rm = null;
      }
    };

    const liftCandle = (ci: number) => {
      for (const it of items) {
        if (it.kind === "candle" && it.ci === ci && it.alive) scheduleRemoval(it, 0, -36, 24);
      }
    };

    let eatDone = false;
    const finishEating = () => {
      eatDone = true;
      for (const it of items) {
        if (it.kind === "plate" && it.alive) {
          const delay = Math.trunc(((it.x + 350) / 700) * 40);
          scheduleRemoval(it, rng.uniform(-6, 6), rng.uniform(20, 40), rng.randint(20, 28), delay);
        }
      }
    };

    const applyBite = (k: number) => {
      for (const it of bitePlan[k]) {
        scheduleRemoval(it, rng.uniform(-8, 8), rng.uniform(16, 42), rng.randint(18, 26), rng.randint(0, 8));
      }
      if (k === bitePlan.length - 1) finishEating();
    };

    const shimmer = () => {
      const alive = items.filter((it) => it.alive && it.kind !== "candle");
      if (!alive.length) return;
      rng.choice(alive).flash = 16; // about 260ms at TICK
    };

    /* ---------- drawing ---------- */
    const fillOval = (b: Box, fill: RGB) => {
      const cx = (b[0] + b[2]) / 2;
      const cy = (b[1] + b[3]) / 2;
      const rx = (b[2] - b[0]) / 2;
      const ry = (b[3] - b[1]) / 2;
      ctx.fillStyle = toCss(fill);
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawItem = (it: Item) => {
      if (it.gone) return;
      let x = it.x;
      let yy = cyOf(it.y);
      let shadowC = dim(it.color, 0.3);
      let haloC = dim(it.color, 0.2);
      let mainC = it.color;
      const rm = it.rm;
      if (rm && rm.f > 0) {
        const u = clamp(rm.f / rm.N);
        const off = rm.dy > 0 ? rm.dy * u * u : rm.dy * (1 - Math.pow(1 - u, 2));
        x += rm.dx * u;
        yy += off;
        shadowC = mix(BGC, dim(it.color, 0.3), 1 - u);
        haloC = mix(BGC, dim(it.color, 0.2), 1 - u);
        mainC = mix(it.color, BGC, u);
      } else if (it.flash > 0) {
        mainC = mix(it.color, FLASH, 0.6);
      }

      ctx.font = `bold ${it.size}px ${FONT}`;
      ctx.fillStyle = toCss(shadowC);
      ctx.fillText(it.text, x + 2, yy + 3);

      ctx.font = `bold ${it.size + 1}px ${FONT}`;
      ctx.fillStyle = toCss(haloC);
      ctx.fillText(it.text, x, yy);

      ctx.font = `bold ${it.size}px ${FONT}`;
      ctx.fillStyle = toCss(mainC);
      ctx.fillText(it.text, x, yy);
    };

    const draw = () => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const f of flames) if (!f.done) fillOval(f.glow, f.glowFill);
      for (const it of items) drawItem(it);
      for (const f of flames) {
        if (f.done) continue;
        fillOval(f.outer, f.outerFill);
        fillOval(f.inner, f.innerFill);
      }
      for (const sm of smoke) {
        if (sm.f <= 0) continue;
        const u = clamp(sm.f / sm.N);
        const x = sm.x + sm.drift * u + 5 * Math.sin(u * 7 + sm.ph);
        const yy = sm.y - 60 * u;
        const rad = 2 + 8 * u;
        ctx.fillStyle = toCss(mix(BGC, [0.62, 0.62, 0.68], 0.75 * Math.pow(1 - u, 1.3)));
        ctx.beginPath();
        ctx.arc(x, yy, rad, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    };

    /* ---------- timeline ---------- */
    const blowT0 = (i: number) => INTRO + i * BLOW_GAP;
    const EAT_START = blowT0(CANDLE_X.length - 1) + BLOW_N + 40;

    // Total frames available, and the spacing that fits the planned bites into them.
    const TOTAL_FRAMES = (TOTAL_MS - START_DELAY) / TICK;
    const lastBiteFrame = TOTAL_FRAMES - TAIL_FRAMES;
    const BITE_GAP =
      bitePlan.length > 1
        ? Math.max(1, Math.floor((lastBiteFrame - EAT_START) / (bitePlan.length - 1)))
        : 1;

    let fr = 0;
    let biteIdx = 0;
    let timer = 0;
    const startedAt = performance.now();

    const finished = () => eatDone && !smoke.length && !items.some((it) => it.rm !== null);

    const stepFrame = () => {
      fr++;

      flames.forEach((f, i) => {
        const t0 = blowT0(i);
        if (fr < t0) {
          if (fr % 5 === 0) flicker(f);
        } else if (fr < t0 + BLOW_N) {
          blowStep(f, (fr - t0) / BLOW_N);
        } else if (fr === t0 + BLOW_N) {
          finishBlow(f);
        }
        if (fr === t0 + BLOW_N + 6) liftCandle(i);
      });

      for (let i = smoke.length - 1; i >= 0; i--) {
        smoke[i].f++;
        if (smoke[i].f >= smoke[i].N) smoke.splice(i, 1);
      }

      if (biteIdx < bitePlan.length && fr >= EAT_START + biteIdx * BITE_GAP) {
        applyBite(biteIdx);
        biteIdx++;
      }

      for (const it of items) {
        updateRemoval(it);
        if (it.flash > 0) it.flash--;
      }

      if (fr % 16 === 0 && !eatDone) shimmer();
    };

    // Frames are driven by wall-clock time, so the animation lasts TOTAL_MS even if a frame runs long.
    const tick = () => {
      const target = Math.floor((performance.now() - startedAt - START_DELAY) / TICK);
      let steps = 0;
      while (fr < target && steps < 60 && !finished()) {
        stepFrame();
        steps++;
      }
      draw();
      if (finished()) return;
      timer = window.setTimeout(tick, TICK);
    };

    draw();
    timer = window.setTimeout(tick, TICK);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", maxWidth: "100%", height: "auto", aspectRatio: "1 / 1" }}
      />
    </div>
  );
}