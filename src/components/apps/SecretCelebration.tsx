'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PointillismFlower from './CanvasFlower';
import Birthday from './CanvasCake';

interface SecretCelebrationProps {
  message?: string;
  videoUrl?: string;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// PointillismFlower and Birthday (flower.py / birthday.py ports) are built as
// full-page drop-ins — they size their canvas off window.innerWidth/Height,
// not a parent container, and run their own real-time clocks with no
// completion callback. So instead of embedding them in the Secret app's small
// window pane (which would badly overflow), each gets a timed full-screen
// takeover, then we drop back into the window-sized video view. Durations
// are picked to land mid-animation at a good cut point: ~3.5s into the
// flower's bloom (well before its wilt tail starts at t=24s-ish real time),
// and ~5.3s into the cake — right as all 5 candles finish blowing out, just
// before birthday.py's bite-by-bite eating sequence would otherwise start.
const BLOOM_MS = 3500;
const CAKE_MS = 5300;

export default function SecretCelebration({ message, videoUrl }: SecretCelebrationProps) {
  const [stage, setStage] = useState<'bloom' | 'cake' | 'video'>('bloom');
  const [needsTap, setNeedsTap] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stage !== 'bloom') return;
    const t = setTimeout(() => setStage('cake'), BLOOM_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'cake') return;
    const t = setTimeout(() => setStage('video'), CAKE_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'video' || !videoUrl) return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => setNeedsTap(true));
    }
  }, [stage, videoUrl]);

  if (stage === 'bloom') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <PointillismFlower />
      </div>
    );
  }

  if (stage === 'cake') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <Birthday />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ fontSize: 48 }}>🎂</div>
      <div style={{ color: '#FFD700', fontSize: 15, fontWeight: 800, marginTop: 2 }}>Happy Birthday!</div>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6, textAlign: 'center', maxWidth: 300, fontFamily: 'var(--font-hand)', lineHeight: 1.5 }}
        >
          {message}
        </motion.div>
      )}
      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ width: '100%', maxWidth: 360, marginTop: 18, borderRadius: 12, overflow: 'hidden', position: 'relative' }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            controls
            style={{ width: '100%', borderRadius: 12, display: 'block' }}
            onPlay={() => setNeedsTap(false)}
          />
          {needsTap && (
            <button
              onClick={() => { videoRef.current?.play(); setNeedsTap(false); }}
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 130, height: 40,
                background: 'rgba(0,0,0,0.68)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              🔊 Tap to play
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
