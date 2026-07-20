'use client';
import React, { useRef, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useDesktopStore } from '@/stores/desktopStore';

// ── colour palette (matches the photo: warm golden tabby) ─────────────────
const K = {
  bodyBase:   '#8A939E',   // gray
  stripe:     '#374151',   // charcoal
  belly:      '#F3F4F6',   // light gray-white
  innerEar:   '#F2A0B0',   // pink
  eyes:       '#A3D258',   // green-yellow
  pupil:      '#1A0800',
  eyeShine:   '#FFFFFF',
  nose:       '#E07888',   // pink-red
  collar:     '#D4506A',   // coral pink
  bell:       '#F0B030',   // gold
  mouth:      '#994455',
  whisker:    '#E8D8C0',   // cream whiskers (represented as thin meshes)
  grass:      '#7CC47A',
  grassDark:  '#5AA858',
  sky1:       '#FFDDE9',
  sky2:       '#C8E0FF',
  cloud:      '#FFFFFF',
  heartCol:   '#FF6B9D',
};

// ── Float-away heart particle ─────────────────────────────────────────────
interface HeartProps { id: number; x: number; z: number; onDone: (id: number) => void }

function HeartParticle({ id, x, z, onDone }: HeartProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const ageRef = useRef(0);
  const doneCalled = useRef(false);
  useFrame((_, dt) => {
    ageRef.current += dt;
    if (!ref.current) return;
    ref.current.position.y += dt * 1.2;
    ref.current.position.x += Math.sin(ageRef.current * 4) * dt * 0.15;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = Math.max(0, 1 - ageRef.current * 0.7);
    ref.current.scale.setScalar(1 + Math.sin(ageRef.current * 10) * 0.12);
    if (ageRef.current > 1.5 && !doneCalled.current) {
      doneCalled.current = true;
      setTimeout(() => onDone(id), 0);
    }
  });
  return (
    <mesh ref={ref} position={[x, 1.8, z]}>
      <sphereGeometry args={[0.1, 6, 4]} />
      <meshStandardMaterial color={K.heartCol} transparent opacity={1} roughness={0.3} />
    </mesh>
  );
}

interface StarProps { id: number; x: number; z: number; onDone: (id: number) => void }

function StarParticle({ id, x, z, onDone }: StarProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const ageRef = useRef(0);
  const doneCalled = useRef(false);
  useFrame((_, dt) => {
    ageRef.current += dt;
    if (!ref.current) return;
    ref.current.position.y += dt * 0.8;
    ref.current.rotation.z += dt * 4;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = Math.max(0, 1 - ageRef.current * 1.0);
    if (ageRef.current > 1.2 && !doneCalled.current) {
      doneCalled.current = true;
      setTimeout(() => onDone(id), 0);
    }
  });
  const color = ['#FBBF24','#F472B6','#A78BFA','#34D399'][id % 4];
  return (
    <mesh ref={ref} position={[x + (Math.random()-0.5)*0.6, 1.6, z]}>
      <boxGeometry args={[0.08, 0.08, 0.08]} />
      <meshStandardMaterial color={color} transparent opacity={1} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

// ── Floating cloud ────────────────────────────────────────────────────────
function Cloud({ pos }: { pos: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  const speed = useMemo(() => 0.006 + Math.random() * 0.004, []);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x += speed;
    if (ref.current.position.x > 12) ref.current.position.x = -12;
  });
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[1.4, 0.6, 0.5]} /><meshStandardMaterial color={K.cloud} roughness={1} /></mesh>
      <mesh position={[-0.45, 0.25, 0]}><boxGeometry args={[0.7, 0.5, 0.5]} /><meshStandardMaterial color={K.cloud} roughness={1} /></mesh>
      <mesh position={[0.35, 0.3, 0]}><boxGeometry args={[0.6, 0.55, 0.5]} /><meshStandardMaterial color={K.cloud} roughness={1} /></mesh>
    </group>
  );
}

// ── Decorative flower ─────────────────────────────────────────────────────
function Flower({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <group position={pos}>
      {/* stem */}
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[0.04, 0.16, 0.04]} /><meshStandardMaterial color="#5AA858" /></mesh>
      {/* petals */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 2) * 0.1, 0.19,
          Math.sin(i * Math.PI / 2) * 0.1,
        ]}>
          <boxGeometry args={[0.1, 0.07, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {/* center */}
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.1, 0.06, 0.1]} /><meshStandardMaterial color="#FBBF24" roughness={0.3} /></mesh>
    </group>
  );
}

// ── Voxel Cat House ───────────────────────────────────────────────────────
function CatHouse({ pos }: { pos: [number, number, number] }) {
  const m = (col: string, r = 0.5) => (
    <meshStandardMaterial color={col} roughness={r} />
  );
  return (
    <group position={pos}>
      {/* Main wooden structure */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.9, 0.95]} />
        {m('#E1B07C', 0.6)}
      </mesh>
      
      {/* Dark entrance door */}
      <mesh position={[0, 0.35, 0.48]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.02]} />
        {m('#2E1F15', 0.9)}
      </mesh>
      
      {/* Stepped red voxel roof */}
      <mesh position={[0, 0.94, 0]} castShadow><boxGeometry args={[1.15, 0.08, 1.15]} />{m('#D4506A', 0.4)}</mesh>
      <mesh position={[0, 1.02, 0]} castShadow><boxGeometry args={[0.95, 0.08, 1.0]} />{m('#D4506A', 0.4)}</mesh>
      <mesh position={[0, 1.10, 0]} castShadow><boxGeometry args={[0.75, 0.08, 0.85]} />{m('#D4506A', 0.4)}</mesh>
      <mesh position={[0, 1.18, 0]} castShadow><boxGeometry args={[0.55, 0.08, 0.7]} />{m('#D4506A', 0.4)}</mesh>
      <mesh position={[0, 1.26, 0]} castShadow><boxGeometry args={[0.35, 0.08, 0.55]} />{m('#D4506A', 0.4)}</mesh>
      <mesh position={[0, 1.34, 0]} castShadow><boxGeometry args={[0.15, 0.08, 0.4]} />{m('#D4506A', 0.4)}</mesh>

      {/* Voxel ears details on roof trim */}
      <mesh position={[-0.2, 0.82, 0.49]}><boxGeometry args={[0.16, 0.16, 0.03]} />{m('#E1B07C')}</mesh>
      <mesh position={[-0.2, 0.82, 0.51]}><boxGeometry args={[0.08, 0.08, 0.01]} />{m('#FFAAAA')}</mesh>
      
      <mesh position={[0.2, 0.82, 0.49]}><boxGeometry args={[0.16, 0.16, 0.03]} />{m('#E1B07C')}</mesh>
      <mesh position={[0.2, 0.82, 0.51]}><boxGeometry args={[0.08, 0.08, 0.01]} />{m('#FFAAAA')}</mesh>

      {/* Gold bell above entryway */}
      <mesh position={[0, 0.81, 0.5]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        {m('#FBBF24', 0.1)}
      </mesh>
    </group>
  );
}

// ── Behavior type ─────────────────────────────────────────────────────────
type Behavior = 'idle' | 'groom' | 'lookleft' | 'lookright' | 'yawn' | 'happy' | 'headtilt' | 'kneading';

// ── Main Voxel Tabby Cat ──────────────────────────────────────────────────
interface CatProps {
  onPet: () => void;
  happiness: number;
  behavior: Behavior;
}

function TabbyCat({ onPet, happiness, behavior }: CatProps) {
  const groupRef   = useRef<THREE.Group>(null!);
  const headRef    = useRef<THREE.Group>(null!);
  const tailRef    = useRef<THREE.Group>(null!);
  const lEarRef    = useRef<THREE.Group>(null!);
  const rEarRef    = useRef<THREE.Group>(null!);
  const lPawRef    = useRef<THREE.Group>(null!);
  const rPawRef    = useRef<THREE.Group>(null!);
  const lEyeRef    = useRef<THREE.Mesh>(null!);
  const rEyeRef    = useRef<THREE.Mesh>(null!);

  const behaviorRef = useRef<Behavior>('idle');
  useEffect(() => { behaviorRef.current = behavior; }, [behavior]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const beh = behaviorRef.current;

    if (!groupRef.current || !headRef.current || !tailRef.current) return;

    // ── base idle bounce ────────────────────────────────
    const bounceSpeed = beh === 'happy' ? 5 : 1.8;
    const bounceAmp   = beh === 'happy' ? 0.14 : 0.05;
    groupRef.current.position.y = Math.sin(t * bounceSpeed) * bounceAmp;

    // ── tail sway ───────────────────────────────────────
    const tailSpeed = beh === 'happy' ? 5 : 2;
    tailRef.current.rotation.y = Math.sin(t * tailSpeed) * 0.55;

    // ── ear flick ───────────────────────────────────────
    if (lEarRef.current) lEarRef.current.rotation.z = Math.sin(t * 2.8 + 0.5) * 0.08;
    if (rEarRef.current) rEarRef.current.rotation.z = -Math.sin(t * 2.8 + 1.2) * 0.08;

    // ── head behaviour ──────────────────────────────────
    const baseHeadY = beh === 'lookleft' ? -0.7
                    : beh === 'lookright' ? 0.7
                    : 0;
    const baseHeadZ = beh === 'headtilt' ? 0.3 : 0;
    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y, baseHeadY + Math.sin(t * 0.6) * 0.06, 0.04,
    );
    headRef.current.rotation.z = THREE.MathUtils.lerp(
      headRef.current.rotation.z, baseHeadZ, 0.04,
    );
    // subtle nod
    headRef.current.rotation.x = Math.sin(t * 0.9) * 0.03;

    // ── groom: raise right paw to face ─────────────────
    if (rPawRef.current) {
      const isGroom = beh === 'groom';
      const targetY = isGroom ? 0.55 : 0.06;
      rPawRef.current.position.y = THREE.MathUtils.lerp(rPawRef.current.position.y, targetY, 0.06);
      rPawRef.current.position.z = THREE.MathUtils.lerp(rPawRef.current.position.z, isGroom ? 0.4 : 0.34, 0.06);
      rPawRef.current.rotation.x = THREE.MathUtils.lerp(rPawRef.current.rotation.x, isGroom ? -0.9 : 0, 0.06);
    }

    // ── kneading: alternate paw bounce ─────────────────
    if (beh === 'kneading') {
      if (lPawRef.current) lPawRef.current.position.y = 0.06 + Math.sin(t * 5) * 0.06;
      if (rPawRef.current) rPawRef.current.position.y = 0.06 + Math.sin(t * 5 + Math.PI) * 0.06;
    } else {
      if (lPawRef.current) lPawRef.current.position.y = THREE.MathUtils.lerp(lPawRef.current.position.y, 0.06, 0.08);
    }

    // ── yawn: head tilts back ──────────────────────────
    if (beh === 'yawn') {
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.25;
    }

    // ── blink (independent of behaviour) ───────────────
    const blinkPhase = t % 4.2;
    const blinkScale = blinkPhase < 0.1 ? blinkPhase / 0.1 : blinkPhase < 0.2 ? 1 : 0;
    const eyeScaleY  = 1 - blinkScale * 0.9;
    if (lEyeRef.current) lEyeRef.current.scale.y = eyeScaleY;
    if (rEyeRef.current) rEyeRef.current.scale.y = eyeScaleY;
  });

  // ── cat geometry ───────────────────────────────────────────────────────
  const m = (col: string, r = 0.25, met = 0) => (
    <meshStandardMaterial color={col} roughness={r} metalness={met} />
  );

  return (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onPet(); }}
    >
      {/* ── BODY ─────────────────────────────────────────────── */}
      <group position={[0, 0.4, 0]}>
        {/* main torso */}
        <mesh castShadow><boxGeometry args={[0.9, 0.85, 0.75]} />{m(K.bodyBase)}</mesh>
        {/* belly patch */}
        <mesh position={[0, -0.05, 0.38]}><boxGeometry args={[0.55, 0.65, 0.02]} />{m(K.belly, 0.5)}</mesh>
        {/* back stripes */}
        {[-0.22, 0, 0.22].map((zoff, i) => (
          <mesh key={i} position={[0, 0.44, zoff - 0.08]}>
            <boxGeometry args={[0.92, 0.08, 0.1]} />
            {m(K.stripe, 0.3)}
          </mesh>
        ))}
        {/* side stripe marks */}
        <mesh position={[-0.46, 0.15, 0]}><boxGeometry args={[0.02, 0.25, 0.5]} />{m(K.stripe, 0.3)}</mesh>
        <mesh position={[0.46, 0.15, 0]}><boxGeometry args={[0.02, 0.25, 0.5]} />{m(K.stripe, 0.3)}</mesh>
      </group>

      {/* ── HEAD ─────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 1.07, 0.1]}>
        {/* main head block */}
        <mesh castShadow><boxGeometry args={[0.92, 0.88, 0.9]} />{m(K.bodyBase)}</mesh>

        {/* forehead tabby M stripes */}
        <mesh position={[0, 0.35, 0.46]}><boxGeometry args={[0.55, 0.07, 0.04]} />{m(K.stripe, 0.3)}</mesh>
        <mesh position={[-0.22, 0.3, 0.46]}><boxGeometry args={[0.1, 0.14, 0.04]} />{m(K.stripe, 0.3)}</mesh>
        <mesh position={[0.22, 0.3, 0.46]}><boxGeometry args={[0.1, 0.14, 0.04]} />{m(K.stripe, 0.3)}</mesh>
        {/* cheek stripes */}
        <mesh position={[-0.47, 0.06, 0.28]}><boxGeometry args={[0.02, 0.12, 0.3]} />{m(K.stripe, 0.3)}</mesh>
        <mesh position={[0.47, 0.06, 0.28]}><boxGeometry args={[0.02, 0.12, 0.3]} />{m(K.stripe, 0.3)}</mesh>

        {/* ── EARS ─────────────────────────────────────────── */}
        <group ref={lEarRef} position={[-0.35, 0.52, -0.15]}>
          <mesh><boxGeometry args={[0.26, 0.32, 0.22]} />{m(K.bodyBase)}</mesh>
          <mesh position={[0, 0.02, 0.08]}><boxGeometry args={[0.14, 0.18, 0.06]} />{m(K.innerEar, 0.6)}</mesh>
          {/* ear stripe */}
          <mesh position={[-0.01, 0.1, -0.04]}><boxGeometry args={[0.18, 0.06, 0.16]} />{m(K.stripe, 0.3)}</mesh>
        </group>
        <group ref={rEarRef} position={[0.35, 0.52, -0.15]}>
          <mesh><boxGeometry args={[0.26, 0.32, 0.22]} />{m(K.bodyBase)}</mesh>
          <mesh position={[0, 0.02, 0.08]}><boxGeometry args={[0.14, 0.18, 0.06]} />{m(K.innerEar, 0.6)}</mesh>
          <mesh position={[0.01, 0.1, -0.04]}><boxGeometry args={[0.18, 0.06, 0.16]} />{m(K.stripe, 0.3)}</mesh>
        </group>

        {/* ── EYES ─────────────────────────────────────────── */}
        {/* left eye — amber base */}
        <mesh ref={lEyeRef} position={[-0.27, 0.1, 0.46]}>
          <boxGeometry args={[0.2, 0.17, 0.05]} />
          <meshStandardMaterial color={K.eyes} roughness={0.1} />
        </mesh>
        {/* left pupil — vertical slit */}
        <mesh position={[-0.27, 0.1, 0.482]}>
          <boxGeometry args={[0.07, 0.17, 0.04]} />
          {m(K.pupil, 0.1)}
        </mesh>
        {/* left eye shine */}
        <mesh position={[-0.22, 0.14, 0.49]}>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          {m(K.eyeShine, 0.0)}
        </mesh>

        {/* right eye — amber base */}
        <mesh ref={rEyeRef} position={[0.27, 0.1, 0.46]}>
          <boxGeometry args={[0.2, 0.17, 0.05]} />
          <meshStandardMaterial color={K.eyes} roughness={0.1} />
        </mesh>
        {/* right pupil */}
        <mesh position={[0.27, 0.1, 0.482]}>
          <boxGeometry args={[0.07, 0.17, 0.04]} />
          {m(K.pupil, 0.1)}
        </mesh>
        {/* right eye shine */}
        <mesh position={[0.32, 0.14, 0.49]}>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          {m(K.eyeShine, 0.0)}
        </mesh>

        {/* ── SNOUT ─────────────────────────────────────────── */}
        <mesh position={[0, -0.08, 0.5]}><boxGeometry args={[0.38, 0.28, 0.08]} />{m(K.belly, 0.5)}</mesh>
        {/* nose */}
        <mesh position={[0, -0.01, 0.55]}><boxGeometry args={[0.13, 0.09, 0.05]} />{m(K.nose, 0.3)}</mesh>
        {/* chin white */}
        <mesh position={[0, -0.18, 0.46]}><boxGeometry args={[0.5, 0.14, 0.06]} />{m(K.belly, 0.6)}</mesh>
        {/* whisker dots (cheek blush) */}
        <mesh position={[-0.38, -0.08, 0.46]}><boxGeometry args={[0.14, 0.1, 0.03]} />{m('#FFB8C8', 0.6)}</mesh>
        <mesh position={[0.38, -0.08, 0.46]}><boxGeometry args={[0.14, 0.1, 0.03]} />{m('#FFB8C8', 0.6)}</mesh>
      </group>

      {/* ── COLLAR ───────────────────────────────────────────── */}
      <group position={[0, 0.76, 0.08]}>
        {/* front band */}
        <mesh position={[0, 0, 0.41]}><boxGeometry args={[0.86, 0.09, 0.03]} /><meshStandardMaterial color={K.collar} roughness={0.3} /></mesh>
        {/* back band */}
        <mesh position={[0, 0, -0.4]}><boxGeometry args={[0.86, 0.09, 0.03]} /><meshStandardMaterial color={K.collar} roughness={0.3} /></mesh>
        {/* left side */}
        <mesh position={[-0.44, 0, 0]}><boxGeometry args={[0.03, 0.09, 0.84]} /><meshStandardMaterial color={K.collar} roughness={0.3} /></mesh>
        {/* right side */}
        <mesh position={[0.44, 0, 0]}><boxGeometry args={[0.03, 0.09, 0.84]} /><meshStandardMaterial color={K.collar} roughness={0.3} /></mesh>
        {/* bell pendant */}
        <mesh position={[0, -0.1, 0.44]}>
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshStandardMaterial color={K.bell} roughness={0.1} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.04, 0.44]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* ── FRONT PAWS (loaf position) ────────────────────────── */}
      <group ref={lPawRef} position={[-0.22, 0.06, 0.4]}>
        <mesh><boxGeometry args={[0.22, 0.12, 0.32]} />{m(K.belly, 0.6)}</mesh>
        {/* paw toe dots */}
        {[-0.07, 0, 0.07].map((xo, i) => (
          <mesh key={i} position={[xo, -0.04, 0.17]}><boxGeometry args={[0.05, 0.04, 0.06]} />{m('#E8D8C8', 0.7)}</mesh>
        ))}
      </group>
      <group ref={rPawRef} position={[0.22, 0.06, 0.34]}>
        <mesh><boxGeometry args={[0.22, 0.12, 0.32]} />{m(K.belly, 0.6)}</mesh>
        {[-0.07, 0, 0.07].map((xo, i) => (
          <mesh key={i} position={[xo, -0.04, 0.17]}><boxGeometry args={[0.05, 0.04, 0.06]} />{m('#E8D8C8', 0.7)}</mesh>
        ))}
      </group>

      {/* ── TAIL ─────────────────────────────────────────────── */}
      <group ref={tailRef} position={[-0.5, 0.18, -0.25]}>
        {/* base segment — goes sideways */}
        <mesh position={[0, 0, 0]} rotation={[0, 0.3, 0.8]}>
          <boxGeometry args={[0.15, 0.48, 0.15]} />
          {m(K.bodyBase)}
        </mesh>
        {/* tip segment — curls forward */}
        <mesh position={[-0.24, -0.16, 0.22]} rotation={[0.7, 0, 0.4]}>
          <boxGeometry args={[0.13, 0.32, 0.13]} />
          {m(K.bodyBase)}
        </mesh>
        {/* tail stripe rings */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0.3, 0.8]}>
          <boxGeometry args={[0.17, 0.07, 0.17]} />
          {m(K.stripe, 0.3)}
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[0, 0.3, 0.8]}>
          <boxGeometry args={[0.17, 0.07, 0.17]} />
          {m(K.stripe, 0.3)}
        </mesh>
        {/* tail tip — cream */}
        <mesh position={[-0.3, -0.24, 0.38]} rotation={[0.6, 0, 0.3]}>
          <boxGeometry args={[0.11, 0.14, 0.11]} />
          {m(K.belly, 0.5)}
        </mesh>
      </group>
    </group>
  );
}

// ── Voxel ground tiles ────────────────────────────────────────────────────
function GroundTiles() {
  const tiles = useMemo(() => {
    const out: { x: number; z: number; col: string }[] = [];
    for (let x = -6; x <= 6; x++) {
      for (let z = -6; z <= 6; z++) {
        out.push({ x: x * 1.0, z: z * 1.0, col: (x + z) % 2 === 0 ? K.grass : K.grassDark });
      }
    }
    return out;
  }, []);
  return (
    <>
      {tiles.map(({ x, z, col }, i) => (
        <mesh key={i} position={[x, -0.06, z]} receiveShadow>
          <boxGeometry args={[1.0, 0.12, 1.0]} />
          <meshStandardMaterial color={col} roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

// ── Mood text that floats above cat ───────────────────────────────────────
const BEHAVIOR_TEXT: Record<Behavior, string> = {
  idle:      '',
  groom:     '🐾 Grooming~',
  lookleft:  '👀 What\'s that?',
  lookright: '👀 Hmm…',
  yawn:      '😴 *yawn*',
  happy:     '💖 Purr purr!',
  headtilt:  '❓ Curious!',
  kneading:  '🍞 Kneading~',
};

// ── Main 3D scene ─────────────────────────────────────────────────────────
interface SceneProps {
  behavior: Behavior;
  onPet: () => void;
  happiness: number;
  petCount: number;
}

let heartIdCounter = 0;

function Scene({ behavior, onPet, happiness, petCount }: SceneProps) {
  const [hearts, setHearts] = useState<{ id: number; x: number; z: number }[]>([]);
  const [stars, setStars]   = useState<{ id: number; x: number; z: number }[]>([]);

  // Spawn hearts on pet
  const prevPetCount = useRef(petCount);
  useEffect(() => {
    if (petCount === prevPetCount.current) return;
    prevPetCount.current = petCount;
    const count = happiness > 70 ? 6 : 3;
    const newH = Array.from({ length: count }, () => ({
      id: heartIdCounter++, x: (Math.random() - 0.5) * 1.2, z: (Math.random() - 0.5) * 0.8,
    }));
    const newS = happiness > 50 ? Array.from({ length: 4 }, () => ({
      id: heartIdCounter++, x: (Math.random() - 0.5) * 1.6, z: (Math.random() - 0.5) * 1.0,
    })) : [];
    setHearts(h => [...h, ...newH]);
    setStars(s => [...s, ...newS]);
  }, [petCount, happiness]);

  const removeHeart = useCallback((id: number) => setHearts(h => h.filter(x => x.id !== id)), []);
  const removeStar  = useCallback((id: number) => setStars(s => s.filter(x => x.id !== id)), []);

  const moodText = BEHAVIOR_TEXT[behavior];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} color="#FFF5EC" />
      <directionalLight
        position={[5, 9, 5]} intensity={1.1} color="#FFEEDD"
        castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5} shadow-camera-far={30}
        shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6}
      />
      <pointLight position={[-4, 4, -4]} intensity={0.3} color="#B5CCFF" />
      <pointLight position={[3, 2, 4]}   intensity={0.2} color="#FFD6E8" />

      {/* Ground */}
      <GroundTiles />

      {/* Cat House */}
      <CatHouse pos={[-2.2, 0, -2.2]} />

      {/* Cat */}
      <TabbyCat onPet={onPet} happiness={happiness} behavior={behavior} />

      {/* Mood label */}
      {moodText && (
        <Billboard position={[0, 2.6, 0]}>
          <Text
            fontSize={0.18}
            color="#FF6B9D"
            anchorX="center"
            anchorY="middle"
          >
            {moodText}
          </Text>
        </Billboard>
      )}

      {/* Heart particles */}
      {hearts.map(h => <HeartParticle key={h.id} id={h.id} x={h.x} z={h.z} onDone={removeHeart} />)}
      {stars.map(s  => <StarParticle  key={s.id}  id={s.id}  x={s.x}  z={s.z}  onDone={removeStar}  />)}

      {/* Floating clouds */}
      {[
        [-8, 5, -5] as [number,number,number],
        [-2, 6, -7] as [number,number,number],
        [ 5, 4.5, -6] as [number,number,number],
        [-5, 5.5, 3] as [number,number,number],
        [ 2, 5.8, 4] as [number,number,number],
        [ 8, 5.0, 2] as [number,number,number],
      ].map((pos, i) => <Cloud key={i} pos={pos} />)}

      {/* Flowers */}
      {[
        [-2.5, 0, 1.8, '#FFB6C1'],
        [ 2.0, 0, 2.2, '#FFD6FA'],
        [-1.8, 0,-2.0, '#B5F5B5'],
        [ 2.8, 0,-1.5, '#FFE066'],
        [-3.2, 0,-1.0, '#FFB6C1'],
        [ 1.5, 0, 3.0, '#D4B5FF'],
        [-2.0, 0, 3.2, '#FF9EC8'],
      ].map(([x, y, z, col], i) => (
        <Flower key={i} pos={[x as number, y as number, z as number]} color={col as string} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enableDamping dampingFactor={0.08}
        minDistance={2.5} maxDistance={9}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.5, 0]}
      />
    </>
  );
}

// ── Top-level component (exported, no Canvas here — SSR-safe) ─────────────
interface KittenCanvasProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}

const BEHAVIORS: Behavior[] = ['idle','idle','idle','groom','lookleft','lookright','yawn','headtilt','kneading'];

export default function KittenCanvas({ config }: KittenCanvasProps) {
  const [happiness,  setHappiness]  = useState(40);
  const [petCount,   setPetCount]   = useState(0);
  const [behavior,   setBehavior]   = useState<Behavior>('idle');
  const [purMessage, setPurMessage] = useState('Click Lemon to pet~');

  const catName: string = config?.catName || config?.name || 'Lemon';

  // ── Random behavior timer ───────────────────────────────────────────
  useEffect(() => {
    const schedule = () => {
      const delay = 4000 + Math.random() * 4000;
      return setTimeout(() => {
        const beh = BEHAVIORS[Math.floor(Math.random() * BEHAVIORS.length)];
        setBehavior(beh);
        const dur = beh === 'idle' ? 1000 : 2200 + Math.random() * 1500;
        setTimeout(() => setBehavior('idle'), dur);
        schedule();
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const handlePet = useCallback(() => {
    setHappiness(h => Math.min(100, h + 8));
    setPetCount(c => c + 1);
    setBehavior('happy');
    setTimeout(() => setBehavior('idle'), 2000);

    const msgs = [
      `✨ ${catName} loves you!`,
      '💕 Purr purr purr…',
      '🐾 Headbutt!',
      '😻 So fluffy!',
      `🎀 ${catName} is happy!`,
      '💖 Best friends!',
      '🌸 *kneading intensifies*',
    ];
    setPurMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  }, [catName]);

  // Happiness drain over time
  useEffect(() => {
    const t = setInterval(() => setHappiness(h => Math.max(20, h - 1)), 5000);
    return () => clearInterval(t);
  }, []);

  const happinessColor = happiness > 70 ? '#22AA55' : happiness > 40 ? '#FBBF24' : '#EF4444';

  // ── Low happiness notification ──────────────────────────────────────
  const { showNotification } = useDesktopStore();
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (happiness < 40 && !notifiedRef.current) {
      notifiedRef.current = true;
      showNotification(`🐱 ${catName} needs ya attention! Give them some love 💕`);
    }
    if (happiness >= 40) {
      notifiedRef.current = false;
    }
  }, [happiness, catName, showNotification]);

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#0D1117', overflow:'hidden', fontFamily:'system-ui,sans-serif' }}>

      {/* ── HUD ──────────────────────────────────────────────────── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'6px 14px',
        background:'linear-gradient(90deg,#1F0D2A,#2A1040)',
        borderBottom:'2px solid #6B21A8',
        flexShrink:0, gap:12,
      }}>
        {/* Cat name & mood */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>🐱</span>
          <div>
            <div style={{ color:'#F5D0FE', fontSize:13, fontWeight:800, lineHeight:1 }}>{catName}</div>
            <div style={{ color:'#C084FC', fontSize:11, marginTop:1 }}>{purMessage}</div>
          </div>
        </div>

        {/* Happiness bar */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#F9A8D4', fontSize:12 }}>💖 {happiness}%</span>
          <div style={{ width:90, height:8, background:'#3B1259', borderRadius:4, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:4,
              width:`${happiness}%`,
              background:happinessColor,
              transition:'width 0.4s, background 0.4s',
            }} />
          </div>
        </div>

        {/* Hint */}
        <div style={{ color:'#7C3AED', fontSize:11 }}>
          Drag to rotate · Scroll to zoom
        </div>
      </div>

      {/* ── Canvas ───────────────────────────────────────────────── */}
      <div style={{ flex:1, position:'relative' }}>
        <Canvas
          shadows
          camera={{ position: [3.5, 2.5, 4.5], fov: 42 }}
          style={{ background:'linear-gradient(180deg,#60A5FA 0%,#BFDBFE 60%,#EFF6FF 100%)' }}
          gl={{ antialias:true }}
        >
          <Suspense fallback={null}>
            <Scene
              behavior={behavior}
              onPet={handlePet}
              happiness={happiness}
              petCount={petCount}
            />
          </Suspense>
        </Canvas>

        {/* Click hint overlay (fades after first pet) */}
        {petCount === 0 && (
          <div style={{
            position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
            background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)',
            padding:'8px 20px', borderRadius:20,
            fontSize:13, color:'#9D2F6A', fontWeight:700,
            pointerEvents:'none',
            boxShadow:'0 4px 16px rgba(157,47,106,0.2)',
            whiteSpace:'nowrap',
          }}>
            🐾 Click {catName} to pet!
          </div>
        )}
      </div>
    </div>
  );
}
