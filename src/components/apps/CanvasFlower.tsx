// Pointillism Flower - browser port of flow.py (NumPy/PIL/Tkinter -> plain TypeScript + Canvas 2D).
// Usage: drop into any React + TypeScript project and render <PointillismFlower />.
// Controls: Space = pause/play, R = restart, S = save PNG.

import { useEffect, useRef, useState } from "react";

/* ============================================================
 * Constants
 * ============================================================ */

const SEED = 5;
const T_END = 45.0;

type RGB = [number, number, number];
type Vec = ArrayLike<number>;
type Arr = Float32Array | Int32Array;
type PSet = Record<string, Arr>;
type Pt4 = [[number, number], [number, number], [number, number], [number, number]];
type Img = { w: number; h: number; data: Uint8ClampedArray };
type Splat = { x: Vec; y: Vec; col: Vec; rad: Vec; z: Vec };

// columns: time, stem, size, bloom, wilt, leaf, glow
const KEYS: number[][] = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [5.0, 0.42, 0.22, 0.0, 0.0, 0.25, 0.0],
  [10.0, 0.62, 0.42, 0.0, 0.0, 0.5, 0.35],
  [16.0, 0.8, 0.68, 0.5, 0.0, 0.72, 0.55],
  [24.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0],
  [30.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0],
  [39.0, 0.98, 0.85, 0.55, 1.0, 0.92, 0.0],
  [45.0, 0.98, 0.85, 0.55, 1.0, 0.9, 0.0],
];

const SOIL_PAL: RGB[] = [[34, 25, 20], [50, 36, 28], [68, 50, 37], [88, 65, 47], [108, 82, 60], [64, 58, 52]];
const SOIL_HI_PAL: RGB[] = [[58, 52, 48], [84, 74, 64], [104, 90, 76], [46, 38, 32]];
const STEM_PAL: RGB[] = [[62, 38, 120], [100, 58, 165], [140, 84, 200], [60, 160, 140]];
const STEM_WILT: RGB[] = [[120, 88, 66], [96, 66, 52], [140, 108, 76]];
const LEAF_PAL: RGB[] = [[60, 150, 140], [80, 120, 175], [130, 80, 195], [175, 105, 215]];
const LEAF_WILT: RGB[] = [[130, 100, 70], [104, 76, 58], [146, 116, 84]];
const RIB_PAL: RGB[] = [[210, 180, 255], [170, 230, 220]];
const WILT_PAL: RGB[] = [[150, 86, 128], [116, 64, 108], [88, 52, 88], [126, 94, 104], [104, 72, 56]];
const RIM_PAL: RGB[] = [[205, 165, 255], [255, 190, 250], [170, 140, 255]];
const HI_PAL: RGB[] = [[235, 215, 255], [255, 225, 250]];
const GOLD_PAL: RGB[] = [[255, 214, 110], [255, 238, 170], [255, 184, 90]];
const STAMEN_PAL: RGB[] = [[255, 240, 255], [255, 215, 235], [255, 230, 150], [255, 190, 80]];
const STAMEN_WILT: RGB[] = [[140, 112, 84], [120, 96, 72]];

type Layer = {
  n: number; ac: number; ao: number; kc: number; ko: number; L: number;
  wc: number; wo: number; d: number; off: number; pal: RGB[];
};

const LAYERS: Layer[] = [
  {
    n: 8, ac: 0.60, ao: 1.00, kc: -1.20, ko: 0.45, L: 1.00, wc: 0.20, wo: 0.34, d: 1150, off: 0.00,
    pal: [[210, 80, 225], [170, 58, 225], [128, 50, 218], [96, 44, 205], [78, 42, 185]]
  },
  {
    n: 6, ac: 0.48, ao: 0.68, kc: -1.05, ko: 0.15, L: 0.88, wc: 0.19, wo: 0.31, d: 950, off: 0.40,
    pal: [[255, 150, 235], [245, 92, 218], [205, 62, 218], [150, 52, 222]]
  },
  {
    n: 5, ac: 0.36, ao: 0.46, kc: -0.85, ko: -0.05, L: 0.72, wc: 0.17, wo: 0.27, d: 760, off: 0.20,
    pal: [[255, 205, 245], [255, 135, 232], [238, 84, 216], [195, 62, 226]]
  },
  {
    n: 4, ac: 0.22, ao: 0.32, kc: -0.50, ko: -0.10, L: 0.46, wc: 0.14, wo: 0.22, d: 480, off: 0.55,
    pal: [[255, 238, 252], [255, 185, 242], [255, 125, 228]]
  },
];

// [anchor along stem, side (+1/-1), length factor, base angle, curl]
const LEAF_DEFS: [number, number, number, number, number][] = [
  [0.10, +1, 1.00, 0.55, -0.80],
  [0.16, -1, 0.90, 0.50, -0.85],
  [0.40, +1, 0.70, 0.95, -0.70],
  [0.33, -1, 0.62, 0.90, -0.65],
];

// Pixel offsets of a filled disc, sorted by distance (matches the Python OFF table)
const OFF: [number, number][] = [];
for (let dy = -3; dy <= 3; dy++)
  for (let dx = -3; dx <= 3; dx++)
    if (dx * dx + dy * dy <= 9) OFF.push([dx, dy]);
OFF.sort((a, b) => (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]) || a[0] - b[0] || a[1] - b[1]);
const OX = Int32Array.from(OFF, (p) => p[0]);
const OY = Int32Array.from(OFF, (p) => p[1]);
const D2 = Float32Array.from(OFF, (p) => p[0] * p[0] + p[1] * p[1]);

const COLOR_KEYS = new Set(["live", "wilt", "col"]);
const isColor = (k: string) => COLOR_KEYS.has(k);

/* ============================================================
 * Small math / array helpers
 * ============================================================ */

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

const smoothstep = (x: number, a: number, b: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const sinc = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);

const profile = (u: number) => Math.pow(Math.sin(Math.PI * Math.pow(clamp(u, 0, 1), 0.75)), 0.85);

function arr(n: number, f: (i: number) => number): Float32Array {
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = f(i);
  return o;
}

const fillA = (n: number, v: number) => new Float32Array(n).fill(v);

function newLike(a: Arr, n: number): Arr {
  return a instanceof Int32Array ? new Int32Array(n) : new Float32Array(n);
}

/* ============================================================
 * Seeded RNG (mulberry32). Same role as numpy's default_rng(SEED),
 * different bit stream, so the look is the same but not identical pixels.
 * ============================================================ */

class RNG {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  r(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  uni(a: number, b: number): number {
    return a + (b - a) * this.r();
  }
  nrm(m = 0, s = 1): number {
    const u = Math.max(this.r(), 1e-12);
    const v = this.r();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  rand(n: number): Float32Array {
    return arr(n, () => this.r());
  }
  uniA(a: number, b: number, n: number): Float32Array {
    return arr(n, () => this.uni(a, b));
  }
  normA(m: number, s: number, n: number): Float32Array {
    return arr(n, () => this.nrm(m, s));
  }
  perm(n: number): Uint32Array {
    const p = new Uint32Array(n);
    for (let i = 0; i < n; i++) p[i] = i;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(this.r() * (i + 1));
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    return p;
  }
  choice(vals: number[], probs: number[], n: number): Float32Array {
    const cum: number[] = [];
    let acc = 0;
    for (const p of probs) {
      acc += p;
      cum.push(acc);
    }
    return arr(n, () => {
      const r = this.r() * acc;
      let k = 0;
      while (k < vals.length - 1 && r >= cum[k]) k++;
      return vals[k];
    });
  }
}

/* ============================================================
 * Palette / sampling helpers
 * ============================================================ */

function palettePick(rng: RNG, pal: RGB[], g: Vec, spread = 0.55, jitter = 0.07): Float32Array {
  const n = g.length;
  const L = pal.length;
  const out = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    const x = clamp(g[i], 0, 1) * (L - 1) + rng.nrm(0, spread);
    const idx = clamp(Math.round(x), 0, L - 1);
    const m = 1 + rng.nrm(0, jitter);
    out[3 * i] = pal[idx][0] * m;
    out[3 * i + 1] = pal[idx][1] * m;
    out[3 * i + 2] = pal[idx][2] * m;
  }
  return out;
}

// Rejection-sample u in [0,1] with density proportional to profile(u)
function areaU(rng: RNG, n: number): Float32Array {
  const out = new Float32Array(n);
  let k = 0;
  while (k < n) {
    const u = rng.rand(3 * n);
    const r = rng.rand(3 * n);
    for (let i = 0; i < 3 * n && k < n; i++) {
      if (r[i] < profile(u[i])) out[k++] = u[i];
    }
  }
  return out;
}

// v in [-1,1] with a fraction of samples pushed to the rim
function sampleV(rng: RNG, n: number, rim = 0.14): Float32Array {
  const v = rng.uniA(-1, 1, n);
  const r = rng.rand(n);
  for (let i = 0; i < n; i++) {
    if (r[i] < rim) v[i] = Math.sign(v[i]) * rng.uni(0.88, 1.0);
  }
  return v;
}

function overwrite(dst: Float32Array, idx: number[], src: Vec) {
  for (let k = 0; k < idx.length; k++) {
    const j = idx[k];
    dst[3 * j] = src[3 * k];
    dst[3 * j + 1] = src[3 * k + 1];
    dst[3 * j + 2] = src[3 * k + 2];
  }
}

function mixcol(live: Vec, wilt: Vec, w: Vec): Float32Array {
  const n = w.length;
  const o = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) {
      const k = 3 * i + c;
      o[k] = live[k] + (wilt[k] - live[k]) * w[i];
    }
  }
  return o;
}

function scaleCol(col: Vec, f: Vec): Float32Array {
  const n = f.length;
  const o = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) o[3 * i + c] = col[3 * i + c] * f[i];
  }
  return o;
}

function tintCol(rgb: number[], f: Vec): Float32Array {
  const n = f.length;
  const o = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) o[3 * i + c] = rgb[c] * f[i];
  }
  return o;
}

/* ============================================================
 * Structure-of-arrays sets: concat, permute, slice
 * ============================================================ */

function catSets(parts: PSet[]): PSet {
  const out: PSet = {};
  for (const k of Object.keys(parts[0])) {
    const total = parts.reduce((s, p) => s + p[k].length, 0);
    const o = newLike(parts[0][k], total);
    let off = 0;
    for (const p of parts) {
      o.set(p[k], off);
      off += p[k].length;
    }
    out[k] = o;
  }
  return out;
}

function permuteSet(s: PSet, n: number, rng: RNG): PSet {
  const p = rng.perm(n);
  const out: PSet = {};
  for (const k of Object.keys(s)) {
    const a = s[k];
    const o = newLike(a, a.length);
    if (isColor(k)) {
      for (let i = 0; i < n; i++) {
        const j = p[i] * 3;
        const t = i * 3;
        o[t] = a[j];
        o[t + 1] = a[j + 1];
        o[t + 2] = a[j + 2];
      }
    } else {
      for (let i = 0; i < n; i++) o[i] = a[p[i]];
    }
    out[k] = o;
  }
  return out;
}

function sliceSet(s: PSet, nv: number): PSet {
  const out: PSet = {};
  for (const k of Object.keys(s)) {
    out[k] = isColor(k) ? s[k].subarray(0, 3 * nv) : s[k].subarray(0, nv);
  }
  return out;
}

/* ============================================================
 * Splatting (filled discs of pixels onto an RGBA buffer)
 * ============================================================ */

function blank(w: number, h: number): Img {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { w, h, data };
}

function splat(img: Img, x: Vec, y: Vec, col: Vec, rad: Vec, nmax = 13) {
  const { w, h, data } = img;
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const xi = Math.round(x[i]);
    const yi = Math.round(y[i]);
    const r2 = rad[i] * rad[i] + 0.01;
    const cr = col[3 * i], cg = col[3 * i + 1], cb = col[3 * i + 2];
    for (let k = 0; k < nmax; k++) {
      if (D2[k] > r2) continue;
      const px = xi + OX[k];
      const py = yi + OY[k];
      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      const o = (py * w + px) * 4;
      data[o] = cr;
      data[o + 1] = cg;
      data[o + 2] = cb;
    }
  }
}

function concatSplats(parts: Splat[]): { x: Float32Array; y: Float32Array; col: Float32Array; rad: Float32Array; z: Float32Array } {
  const n = parts.reduce((s, p) => s + p.x.length, 0);
  const out = {
    x: new Float32Array(n), y: new Float32Array(n), col: new Float32Array(3 * n),
    rad: new Float32Array(n), z: new Float32Array(n),
  };
  let o = 0;
  for (const p of parts) {
    const m = p.x.length;
    out.x.set(p.x, o);
    out.y.set(p.y, o);
    out.rad.set(p.rad, o);
    out.z.set(p.z, o);
    out.col.set(p.col, 3 * o);
    o += m;
  }
  return out;
}

// Collects splats for one frame; draw() sorts them by depth (back to front)
class Batch {
  parts: Splat[] = [];
  add(x: Vec, y: Vec, col: Vec, rad: Vec, z: Vec | number) {
    const n = x.length;
    if (!n) return;
    this.parts.push({ x, y, col, rad, z: typeof z === "number" ? fillA(n, z) : z });
  }
  draw(img: Img) {
    if (!this.parts.length) return;
    const s = concatSplats(this.parts);
    const n = s.x.length;
    const z = s.z;
    const order = new Uint32Array(n);
    for (let i = 0; i < n; i++) order[i] = i;
    order.sort((a, b) => (z[a] - z[b]) || (a - b));
    const x = new Float32Array(n), y = new Float32Array(n);
    const rad = new Float32Array(n), col = new Float32Array(3 * n);
    for (let k = 0; k < n; k++) {
      const j = order[k];
      x[k] = s.x[j];
      y[k] = s.y[j];
      rad[k] = s.rad[j];
      col[3 * k] = s.col[3 * j];
      col[3 * k + 1] = s.col[3 * j + 1];
      col[3 * k + 2] = s.col[3 * j + 2];
    }
    splat(img, x, y, col, rad, 13);
  }
}

/* ============================================================
 * Timeline (Catmull-Rom through key poses)
 * ============================================================ */

function state(time: number): number[] {
  const t = clamp(time, 0, T_END);
  const ts = KEYS.map((k) => k[0]);
  let i = 0;
  while (i < KEYS.length - 1 && ts[i + 1] <= t) i++;
  i = clamp(i, 0, KEYS.length - 2);
  const u = (t - ts[i]) / (ts[i + 1] - ts[i]);
  const p0 = KEYS[Math.max(i - 1, 0)].slice(1);
  const p1 = KEYS[i].slice(1);
  const p2 = KEYS[i + 1].slice(1);
  const p3 = KEYS[Math.min(i + 2, KEYS.length - 1)].slice(1);
  const out: number[] = [];
  for (let k = 0; k < 6; k++) {
    const v = 0.5 * (
      2 * p1[k] +
      (p2[k] - p0[k]) * u +
      (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u +
      (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * u * u * u
    );
    out.push(clamp(v, 0, 1));
  }
  return out;
}

// Cubic Bezier point and derivative
function bezPt(P: Pt4, s: number): [number, number, number, number] {
  const [P0, P1, P2, P3] = P;
  const q = 1 - s;
  const x = q * q * q * P0[0] + 3 * q * q * s * P1[0] + 3 * q * s * s * P2[0] + s * s * s * P3[0];
  const y = q * q * q * P0[1] + 3 * q * q * s * P1[1] + 3 * q * s * s * P2[1] + s * s * s * P3[1];
  const dx = 3 * q * q * (P1[0] - P0[0]) + 6 * q * s * (P2[0] - P1[0]) + 3 * s * s * (P3[0] - P2[0]);
  const dy = 3 * q * q * (P1[1] - P0[1]) + 6 * q * s * (P2[1] - P1[1]) + 3 * s * s * (P3[1] - P2[1]);
  return [x, y, dx, dy];
}

function bezArr(P: Pt4, s: Vec) {
  const n = s.length;
  const x = new Float32Array(n), y = new Float32Array(n);
  const dx = new Float32Array(n), dy = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const q = bezPt(P, s[i]);
    x[i] = q[0];
    y[i] = q[1];
    dx[i] = q[2];
    dy[i] = q[3];
  }
  return { x, y, dx, dy };
}

/* ============================================================
 * The plant
 * ============================================================ */

class Plant {
  W: number;
  H: number;
  rng: RNG;
  cx: number;
  y0: number;
  Ls: number;
  Lf: number;
  base!: Img;
  cr!: PSet;
  stem!: PSet;
  head!: PSet;
  st!: PSet;
  leaf!: PSet;
  halo!: PSet;
  ring!: PSet;
  spark!: PSet;
  fall!: PSet;

  constructor(W: number, H: number) {
    this.W = W;
    this.H = H;
    this.rng = new RNG(SEED);
    this.cx = W / 2;
    this.y0 = H * 0.8;
    this.Ls = H * 0.38;
    this.Lf = H * 0.235;
    this.buildSoil();
    this.buildStem();
    this.buildHead();
    this.buildStamens();
    this.buildLeaves();
    this.buildFx();
  }

  surface(x: number): number {
    const { H, W, cx, y0 } = this;
    return (
      y0 -
      0.022 * H * Math.exp(-Math.pow((x - cx) / (0.2 * W), 2)) -
      0.003 * H * Math.sin(x * 0.045) -
      0.002 * H * Math.sin(x * 0.13 + 1.3)
    );
  }

  private buildSoil() {
    const { W, H, rng } = this;
    const n = 26000;
    const x = rng.uniA(0, W, n);
    const rnd = rng.rand(n);
    const d = arr(n, (i) => Math.pow(rnd[i], 1.5) * 0.14 * H);
    const y = arr(n, (i) => this.surface(x[i]) + d[i]);
    const depth = arr(n, (i) => d[i] / (0.14 * H));
    const edge = arr(n, (i) => Math.pow(clamp(Math.min(x[i], W - x[i]) / (0.2 * W), 0, 1), 0.8));
    const clump = arr(n, (i) => 0.5 + 0.5 * Math.sin(x[i] * 0.07 + y[i] * 0.05) * Math.sin(y[i] * 0.11 - x[i] * 0.03));
    const jit = rng.rand(n);
    const bright = arr(n, (i) => Math.pow(1 - depth[i], 0.8) * edge[i] * (0.55 + 0.35 * clump[i] + 0.35 * jit[i]));
    const col = scaleCol(palettePick(rng, SOIL_PAL, rng.rand(n), 1.0), bright);
    const rad = rng.choice([1, 1.5, 2], [0.4, 0.4, 0.2], n);
    this.base = blank(W, H);
    splat(this.base, x, y, col, rad);

    // Dark soil specks along the ground
    const k = 170;
    const px = rng.uniA(0.05 * W, 0.95 * W, k);
    const pr = rng.rand(k);
    const py = arr(k, (i) => this.surface(px[i]) + Math.pow(pr[i], 1.3) * 0.1 * H);
    const pc0 = palettePick(rng, SOIL_HI_PAL, rng.rand(k), 0.7);
    const pc = scaleCol(pc0, arr(k, (i) => Math.pow(clamp(Math.min(px[i], W - px[i]) / (0.2 * W), 0, 1), 0.8)));
    splat(this.base, px, py, pc, rng.choice([2, 3], [0.6, 0.4], k), 29);

    // Crumbs that fall in at the start
    const m = 520;
    const cxs = arr(m, () => this.cx + rng.nrm(0, 0.03 * H));
    const cys = arr(m, (i) => this.surface(cxs[i]) - rng.r() * 0.006 * H);
    this.cr = {
      x: cxs,
      y: cys,
      amp: arr(m, () => H * 0.05 * Math.pow(rng.r(), 2.2)),
      delay: rng.uniA(0, 2.5, m),
      col: scaleCol(palettePick(rng, SOIL_PAL, rng.uniA(0.3, 1, m), 0.8), fillA(m, 0.8)),
      rad: rng.choice([1, 1.5, 2], [0.4, 0.4, 0.2], m),
    };
  }

  private buildStem() {
    const { rng } = this;
    const n = 3600;
    const s = rng.rand(n);
    const lat = rng.uniA(-1, 1, n);
    const rimR = rng.rand(n);
    for (let i = 0; i < n; i++) {
      if (rimR[i] < 0.18) lat[i] = Math.sign(lat[i]) * rng.uni(0.85, 1.0);
    }
    const live = palettePick(rng, STEM_PAL.slice(0, 3), arr(n, (i) => s[i] * 0.8 + rng.r() * 0.2));
    const gr = rng.rand(n);
    for (let i = 0; i < n; i++) {
      if (gr[i] < 0.12) {
        const f = 1 + rng.nrm(0, 0.08);
        for (let c = 0; c < 3; c++) live[3 * i + c] = STEM_PAL[3][c] * f;
      }
    }
    const wilt = palettePick(rng, STEM_WILT, rng.rand(n), 0.8);
    const rn = rng.rand(n);
    const rad = rng.choice([1, 1.5, 2], [0.35, 0.45, 0.2], n);
    this.stem = permuteSet({ s, lat, live, wilt, rn, rad }, n, rng);
  }

  // Control points of the stem curve for a given length, wilt and sway
  private ctrl(L: number, wilt: number, sway: number): Pt4 {
    const { cx, y0 } = this;
    const P0: [number, number] = [cx, y0 + 4.0];
    const P1: [number, number] = [cx - 0.06 * L * (1 - wilt) + 0.02 * L * wilt, y0 - 0.33 * L];
    const P2: [number, number] = [
      cx + 0.05 * L * (1 - wilt) + 0.08 * L * wilt + sway * 0.5,
      y0 - L * (0.74 + 0.3 * wilt),
    ];
    const P3: [number, number] = [cx + sway + 0.32 * L * wilt, y0 - L * (1 - 0.15 * wilt)];
    return [P0, P1, P2, P3];
  }

  private buildHead() {
    const { rng } = this;
    const parts: PSet[] = [];
    for (const Ly of LAYERS) {
      const d = Ly.d;
      for (let i = 0; i < Ly.n; i++) {
        const th = (2 * Math.PI * i) / Ly.n + Ly.off + rng.nrm(0, 0.1);
        const aj = rng.nrm(0, 0.06);
        const lj = rng.uni(0.92, 1.08);
        const pj = rng.r();
        const wj = rng.uni(-0.5, 0.5);
        const u = areaU(rng, d);
        const v = sampleV(rng, d);

        const g = arr(d, (j) => u[j] + rng.nrm(0, 0.1));
        const col = palettePick(rng, Ly.pal, g);

        const rv = rng.rand(d);
        const sel: number[] = [];
        for (let j = 0; j < d; j++) if (Math.abs(v[j]) > 0.86 && rv[j] < 0.55) sel.push(j);
        overwrite(col, sel, palettePick(rng, RIM_PAL, rng.rand(sel.length)));

        const rh = rng.rand(d);
        const hl: number[] = [];
        for (let j = 0; j < d; j++) if (rh[j] < 0.04) hl.push(j);
        overwrite(col, hl, palettePick(rng, HI_PAL, rng.rand(hl.length)));

        const rf = rng.rand(d);
        const fl: number[] = [];
        for (let j = 0; j < d; j++) if (rf[j] < 0.02 && u[j] < 0.55) fl.push(j);
        overwrite(col, fl, palettePick(rng, GOLD_PAL, rng.rand(fl.length)));

        const wilt = palettePick(rng, WILT_PAL, arr(d, (j) => 0.4 * u[j] + 0.6 * rng.r()), 0.7);

        parts.push({
          th: fillA(d, th), aj: fillA(d, aj), pj: fillA(d, pj), wj: fillA(d, wj),
          u, v,
          ac: fillA(d, Ly.ac), ao: fillA(d, Ly.ao), kc: fillA(d, Ly.kc), ko: fillA(d, Ly.ko),
          L: fillA(d, Ly.L * lj), wc: fillA(d, Ly.wc), wo: fillA(d, Ly.wo),
          live: col, wilt,
          rn: rng.rand(d),
          rad: rng.choice([1, 1.5, 2], [0.3, 0.45, 0.25], d),
        });
      }
    }
    const h = catSets(parts);
    const n = h.u.length;
    h.sp = arr(n, (i) => profile(h.u[i]));
    this.head = permuteSet(h, n, rng);
  }

  private buildStamens() {
    const { rng } = this;
    const n = 700, nf = 60;
    const fid = arr(n, () => Math.floor(rng.r() * nf));
    const t = arr(n, () => 1 - Math.pow(rng.r(), 1.6));
    const live = palettePick(rng, STAMEN_PAL, t, 0.35);
    const thF = arr(nf, () => rng.uni(0, 2 * Math.PI));
    const betaF = arr(nf, () => rng.uni(0.2, 0.85));
    const ellF = arr(nf, () => rng.uni(0.3, 0.55));
    const wilt = palettePick(rng, STAMEN_WILT, rng.rand(n), 0.6);
    const rad = arr(n, (i) => (t[i] > 0.88 ? 2.0 : rng.r() < 0.5 ? 1.0 : 1.5));
    this.st = permuteSet(
      {
        th: arr(n, (i) => thF[fid[i]]),
        beta: arr(n, (i) => betaF[fid[i]]),
        ell: arr(n, (i) => ellF[fid[i]]),
        t, live, wilt, rad,
      },
      n,
      rng,
    );
  }

  private buildLeaves() {
    const { rng } = this;
    const d = 900;
    const parts: PSet[] = [];
    LEAF_DEFS.forEach((_, j) => {
      const u = areaU(rng, d);
      const v = sampleV(rng, d, 0.1);
      const ribR = rng.rand(d);
      const ribIdx: number[] = [];
      for (let k = 0; k < d; k++) {
        if (ribR[k] < 0.09) {
          ribIdx.push(k);
          v[k] = rng.nrm(0, 0.03);
        }
      }
      const live = palettePick(rng, LEAF_PAL, arr(d, (k) => u[k] + rng.nrm(0, 0.1)));
      overwrite(live, ribIdx, palettePick(rng, RIB_PAL, rng.rand(ribIdx.length)));
      parts.push({
        lid: fillA(d, j),
        u, v, live,
        wilt: palettePick(rng, LEAF_WILT, rng.rand(d), 0.8),
        rn: rng.rand(d),
        rad: rng.choice([1, 1.5, 2], [0.35, 0.45, 0.2], d),
      });
    });
    const total = LEAF_DEFS.length * d;
    this.leaf = permuteSet(catSets(parts), total, rng);
  }

  private buildFx() {
    const { rng, H } = this;

    // Glow halo
    const nh = 1800;
    const r = arr(nh, () => Math.min(Math.abs(rng.nrm(0, 0.55)), 1.6));
    this.halo = permuteSet(
      {
        a: rng.uniA(0, 2 * Math.PI, nh),
        r,
        b: arr(nh, (i) => Math.pow(1 - r[i] / 1.6, 1.5) * 0.55),
        fl: rng.rand(nh),
      },
      nh,
      rng,
    );

    // Orbiting ring of sparkles
    const cf: number[] = [], cj: number[] = [], rho: number[] = [], ang: number[] = [];
    for (let j = 0; j < 7; j++) {
      const m = j === 0 ? 700 : 170;
      for (let k = 0; k < m; k++) {
        cf.push(j === 0 ? 0 : 0.5);
        cj.push(Math.max(j - 1, 0));
        rho.push(j === 0 ? 1 : 0.5);
        ang.push(rng.uni(0, 2 * Math.PI));
      }
    }
    const RN = cf.length;
    this.ring = permuteSet(
      {
        cf: Float32Array.from(cf),
        cj: Float32Array.from(cj),
        rho: Float32Array.from(rho),
        a: Float32Array.from(ang),
        fl: rng.rand(RN),
      },
      RN,
      rng,
    );

    // Twinkling sparks
    const ms = 280;
    this.spark = {
      a: rng.uniA(0, 2 * Math.PI, ms),
      rho: rng.rand(ms),
      ph: rng.rand(ms),
      sp: rng.uniA(0.6, 1.4, ms),
      rad: rng.choice([1, 2], [0.7, 0.3], ms),
      hue: rng.rand(ms),
    };

    // Petals falling as the flower wilts
    const mf = 260;
    const xl = arr(mf, () => this.cx + rng.nrm(0, 0.12 * H));
    this.fall = {
      r0: rng.rand(mf),
      ox: rng.normA(0, 1, mf),
      oy: rng.normA(0, 1, mf),
      xl,
      yl: arr(mf, (i) => this.surface(xl[i]) - rng.r() * 0.012 * H),
      ph: rng.uniA(0, 6.28, mf),
      col: palettePick(rng, WILT_PAL, rng.rand(mf), 0.8),
      rad: rng.choice([1.5, 2], [0.5, 0.5], mf),
    };
  }

  render(time: number): Img {
    const { H, W } = this;
    const img: Img = { w: W, h: H, data: this.base.data.slice() };
    const [stem, size, bloom, wilt, leaf, glow] = state(time);
    const t = time;
    const B = new Batch();
    const nodes = new Batch();
    const Lf = this.Lf;

    const L = this.Ls * stem;
    const sway = 0.012 * H * Math.sin(t * 0.9) * stem * (1 - 0.6 * wilt);
    const P = this.ctrl(L, wilt, sway);
    const hx = P[3][0];
    const hy = P[3][1];

    // ---- stem ----
    if (stem > 0.01) {
      const nv = Math.floor(this.stem.s.length * clamp(stem, 0.08, 1));
      const S = sliceSet(this.stem, nv);
      const bz = bezArr(P, S.s);
      const nn = arr(nv, (i) => Math.hypot(bz.dx[i], bz.dy[i]) + 1e-6);
      const wst = (s: number) => 0.0085 * H * (1 - 0.3 * s) * (1 - 0.25 * wilt) * clamp(0.4 + stem * 1.2, 0.4, 1);
      const latW = arr(nv, (i) => S.lat[i] * wst(S.s[i]));
      const X = arr(nv, (i) => bz.x[i] - (bz.dy[i] / nn[i]) * latW[i]);
      const Y = arr(nv, (i) => bz.y[i] + (bz.dx[i] / nn[i]) * latW[i]);
      const wi = arr(nv, (i) => clamp(wilt * (0.75 + 0.5 * S.s[i]) * (0.7 + 0.5 * S.rn[i]), 0, 1));
      B.add(X, Y, mixcol(S.live, S.wilt, wi), S.rad, -500);
    }

    // ---- leaves ----
    if (leaf > 0.02 && stem > 0.05) {
      const nv = Math.floor(this.leaf.u.length * clamp(leaf, 0.15, 1));
      const S = sliceSet(this.leaf, nv);
      const anchors = LEAF_DEFS.map((d) => bezPt(P, d[0]));
      const X = new Float32Array(nv), Y = new Float32Array(nv), wi = new Float32Array(nv);
      for (let i = 0; i < nv; i++) {
        const lid = S.lid[i];
        const [, m, lfac, a0base, cbase] = LEAF_DEFS[lid];
        const a0 = a0base + (1 - leaf) * 0.8 - 0.6 * wilt;
        const c = cbase - 0.5 * wilt;
        const u = S.u[i];
        const v = S.v[i];
        const LL = 0.19 * H * lfac * leaf * (1 - 0.25 * wilt);
        const am = a0 + c * u * 0.5;
        const al = a0 + c * u;
        const sc = sinc(c * u * 0.5);
        const lat = v * 0.27 * LL * profile(u);
        X[i] = anchors[lid][0] + LL * u * m * Math.cos(am) * sc - lat * Math.sin(al);
        const Yup = LL * u * Math.sin(am) * sc + lat * m * Math.cos(al);
        Y[i] = anchors[lid][1] - Yup;
        wi[i] = clamp(wilt * (0.9 + 0.5 * u + 0.3 * S.rn[i]) - 0.1, 0, 1);
      }
      B.add(X, Y, mixcol(S.live, S.wilt, wi), S.rad, -450);
    }

    // ---- flower head, stamens and effects ----
    if (stem > 0.01 && size > 0.05) {
      const phi = wilt * 2.75 + 0.035 * Math.sin(t * 0.9 + 1.0) * (1 - wilt);
      const tau = 0.2 + 0.36 * bloom - 0.4 * wilt;
      const cphi = Math.cos(phi), sphi = Math.sin(phi);
      const ct = Math.cos(tau), st_ = Math.sin(tau);
      const Ls_ = Lf * size;

      const project = (xl: number, yl: number, zl: number): [number, number, number, number] => {
        const yp = yl * ct - zl * st_;
        const zp = yl * st_ + zl * ct;
        return [hx + xl * cphi + yp * sphi, hy - (-xl * sphi + yp * cphi), zp, yp];
      };

      // petals
      const vis = clamp(size * size * 1.15, 0.2, 1);
      const nvH = Math.floor(this.head.rad.length * vis);
      const h = sliceSet(this.head, nvH);
      const X = new Float32Array(nvH), Y = new Float32Array(nvH), Z = new Float32Array(nvH);
      const shade = new Float32Array(nvH), wi = new Float32Array(nvH);
      for (let i = 0; i < nvH; i++) {
        const u = h.u[i];
        const v = h.v[i];
        let A0 = h.ac[i] + (h.ao[i] - h.ac[i]) * bloom + h.aj[i];
        A0 = A0 * (1 - 0.55 * wilt) + wilt * h.wj[i] * 0.3;
        const K = h.kc[i] + (h.ko[i] - h.kc[i]) * bloom + wilt * (0.6 + 0.6 * h.pj[i]);
        const Lp = Ls_ * h.L[i] * (1 - 0.28 * wilt * h.pj[i]);
        const am = A0 + K * u * 0.5;
        const sc = sinc(K * u * 0.5);
        const rr0 = Lp * u * Math.sin(am) * sc;
        const hh = Lp * u * Math.cos(am) * sc;
        const lat = v * (h.wc[i] + (h.wo[i] - h.wc[i]) * bloom) * Lp * h.sp[i];
        const rr = rr0 + 0.025 * Ls_ - (0.5 * lat * lat) / (Lp + 1.0);
        const cth = Math.cos(h.th[i]), sth = Math.sin(h.th[i]);
        const p = project(cth * rr - sth * lat, hh, sth * rr + cth * lat);
        X[i] = p[0];
        Y[i] = p[1];
        Z[i] = p[2];
        shade[i] = clamp(0.72 + 0.28 * clamp((p[2] / Ls_) * 0.5 + 0.5, 0, 1) + 0.12 * (hh / Ls_), 0.5, 1.2);
        wi[i] = clamp(wilt * (1.0 + 0.7 * u + 0.4 * h.rn[i]) - 0.2, 0, 1);
      }
      B.add(X, Y, scaleCol(mixcol(h.live, h.wilt, wi), shade), h.rad, Z);

      // stamens (fade in as the flower blooms)
      const ss = smoothstep(bloom, 0.3, 0.85);
      if (ss > 0.02) {
        const nv2 = Math.floor(this.st.rad.length * clamp(size * size, 0.25, 1));
        const S = sliceSet(this.st, nv2);
        const SX = new Float32Array(nv2), SY = new Float32Array(nv2), SZ = new Float32Array(nv2);
        for (let i = 0; i < nv2; i++) {
          const ell = Ls_ * ss * S.ell[i];
          const beta = S.beta[i] * (0.6 + 0.4 * bloom) + wilt * 0.3;
          const r2 = ell * S.t[i] * Math.sin(beta) + 0.02 * Ls_;
          const yl = 0.05 * Ls_ + ell * S.t[i] * Math.cos(beta);
          const p = project(Math.cos(S.th[i]) * r2, yl, Math.sin(S.th[i]) * r2);
          SX[i] = p[0];
          SY[i] = p[1];
          SZ[i] = p[2] + 3.0;
        }
        B.add(SX, SY, mixcol(S.live, S.wilt, fillA(nv2, wilt)), S.rad, SZ);
      }

      // glow, halo, orbit ring, sparks
      const axis0 = Math.sin(phi), axis1 = -Math.cos(phi);
      const ccx = hx + axis0 * 0.5 * Ls_;
      const ccy = hy + axis1 * 0.5 * Ls_;
      const Rs = Ls_ * 1.25;

      if (glow > 0.02) {
        const Hh = this.halo;
        const nH = Math.floor(Hh.a.length * glow);
        const rh = arr(nH, (i) => Hh.r[i] * Ls_ * 1.1);
        const br = arr(nH, (i) => Hh.b[i] * glow * (0.85 + 0.3 * Math.sin(t * 1.3 + Hh.fl[i] * 6.28)));
        B.add(
          arr(nH, (i) => ccx + Math.cos(Hh.a[i]) * rh[i]),
          arr(nH, (i) => ccy + Math.sin(Hh.a[i]) * rh[i]),
          tintCol([150, 70, 240], br),
          fillA(nH, 1),
          -2000,
        );

        const R = this.ring;
        const nr = Math.floor(R.a.length * glow);
        const cang = (i: number) => (2 * Math.PI * R.cj[i]) / 6 + t * 0.15;
        const aa = (i: number) => R.a[i] + t * 0.05;
        const rx = arr(nr, (i) => ccx + Rs * (R.cf[i] * Math.cos(cang(i)) + R.rho[i] * Math.cos(aa(i))));
        const ry = arr(nr, (i) => ccy + Rs * (R.cf[i] * Math.sin(cang(i)) + R.rho[i] * Math.sin(aa(i))));
        const bb = arr(nr, (i) => (0.4 + 0.6 * glow) * (0.65 + 0.35 * Math.sin(t * 2 + R.fl[i] * 20)));
        B.add(rx, ry, tintCol([210, 145, 255], bb), fillA(nr, 1), -1500);

        // little bright nodes on the ring
        const nodeX = arr(6, (j) => ccx + Rs * Math.cos((2 * Math.PI * j) / 6 + t * 0.15));
        const nodeY = arr(6, (j) => ccy + Rs * Math.sin((2 * Math.PI * j) / 6 + t * 0.15));
        nodes.add(nodeX, nodeY, tintCol([255, 215, 255], fillA(6, glow)), fillA(6, 3), fillA(6, 0));

        const Sp = this.spark;
        const msp = Sp.a.length;
        const life = arr(msp, (i) => ((((0.1 * t * Sp.sp[i]) + Sp.ph[i]) % 1) + 1) % 1);
        const rhoS = arr(msp, (i) => (0.25 + 1.15 * Sp.rho[i]) * Ls_ * (0.6 + 0.6 * life[i]));
        const px = arr(msp, (i) => ccx + Math.cos(Sp.a[i]) * rhoS[i]);
        const py = arr(msp, (i) => ccy + Math.sin(Sp.a[i]) * rhoS[i] - life[i] * 0.25 * Ls_);
        const bs = arr(msp, (i) => Math.pow(Math.sin(Math.PI * life[i]), 0.8) * glow);
        const scol = new Float32Array(3 * msp);
        for (let i = 0; i < msp; i++) {
          const c = Sp.hue[i] < 0.5 ? [255, 215, 255] : [255, 150, 235];
          for (let k = 0; k < 3; k++) scol[3 * i + k] = c[k] * bs[i];
        }
        B.add(px, py, scol, Sp.rad, fillA(msp, 2000));
      }

      // petals falling off when wilted
      if (wilt > 0.02) {
        const F = this.fall;
        const idx: number[] = [];
        const fp: number[] = [];
        for (let i = 0; i < F.r0.length; i++) {
          const f = clamp((wilt * 1.05 - F.r0[i] * 0.7) / 0.35, 0, 1);
          if (f > 0) {
            idx.push(i);
            fp.push(f);
          }
        }
        const nf = idx.length;
        if (nf) {
          const FX = new Float32Array(nf), FY = new Float32Array(nf);
          const fcol = new Float32Array(3 * nf), frad = new Float32Array(nf);
          for (let k = 0; k < nf; k++) {
            const i = idx[k];
            const f = fp[k];
            const sx = hx + F.ox[i] * 0.18 * Ls_;
            const sy = hy + F.oy[i] * 0.18 * Ls_ + 0.25 * Ls_;
            FX[k] = sx + (F.xl[i] - sx) * f + Math.sin(f * 6.28 + F.ph[i]) * 0.03 * H * (1 - f);
            FY[k] = sy + (F.yl[i] - sy) * f * f;
            fcol[3 * k] = F.col[3 * i];
            fcol[3 * k + 1] = F.col[3 * i + 1];
            fcol[3 * k + 2] = F.col[3 * i + 2];
            frad[k] = F.rad[i];
          }
          B.add(FX, FY, fcol, frad, fillA(nf, 500));
        }
      }
    }

    B.draw(img);
    if (nodes.parts.length) {
      const s = concatSplats(nodes.parts);
      splat(img, s.x, s.y, s.col, s.rad, 29);
    }

    // soil crumbs bouncing into place
    const C = this.cr;
    const nc = C.x.length;
    const cy = arr(nc, (i) => {
      const e = clamp((t - C.delay[i]) / 3.0, 0, 1);
      return C.y[i] - C.amp[i] * Math.sin(Math.PI * e);
    });
    splat(img, C.x, cy, C.col, C.rad);

    return img;
  }
}

/* ============================================================
 * React component
 * ============================================================ */

const buttonStyle: React.CSSProperties = {
  background: "#1a1a1a",
  color: "#ddd",
  border: "1px solid #333",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  font: "14px system-ui, sans-serif",
};

export default function PointillismFlower() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(false);
  const restartRef = useRef<() => void>(() => { });
  const saveRef = useRef<() => void>(() => { });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let plant: Plant | null = null;
    let out: ImageData | null = null;
    let clock = 0;
    let last = performance.now();
    let raf = 0;
    let resizeTimer = 0;

    const build = () => {
      const size = Math.max(200, Math.floor(Math.min(window.innerWidth * 0.96, window.innerHeight * 0.92)));
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      plant = new Plant(size, size);
      out = ctx.createImageData(size, size);
    };
    build();

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };

    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current) clock += dt;
      if (plant && out) {
        const img = plant.render(clock);
        out.data.set(img.data);
        ctx.putImageData(out, 0, 0);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    restartRef.current = () => {
      clock = 0;
    };
    saveRef.current = () => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "flower.png";
      a.click();
    };

    const toggle = () => {
      pausedRef.current = !pausedRef.current;
      setPaused(pausedRef.current);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key === "r" || e.key === "R") {
        restartRef.current();
      } else if (e.key === "s" || e.key === "S") {
        saveRef.current();
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <canvas ref={canvasRef} />
      <div style={{ display: "flex", gap: 8 }}>
        <button style={buttonStyle} onClick={togglePause}>
          {paused ? "Play" : "Pause"}
        </button>
        <button style={buttonStyle} onClick={() => restartRef.current()}>
          Restart
        </button>
        <button style={buttonStyle} onClick={() => saveRef.current()}>
          Save PNG
        </button>
      </div>
    </div>
  );
}