'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DesktopConfig } from '@/lib/types';
import Desktop from '@/components/desktop/Desktop';
import BootSequence from '@/components/boot/BootSequence';
import Link from 'next/link';

interface MobileDesktopProps {
  config: DesktopConfig;
}

export default function MobileDesktop({ config }: MobileDesktopProps) {
  const [bootDone, setBootDone] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect orientation
  useEffect(() => {
    const check = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  // Virtual desktop dimensions
  const VIRT_W = 1280;
  const VIRT_H = 720;

  // Calculate monitor screen size to fit viewport
  // Portrait: use 92% of viewport width
  // Landscape: use 88% of viewport width but cap to avoid overflow
  const [screenW, setScreenW] = useState(320);
  const [screenH, setScreenH] = useState(180);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const landscape = vw > vh;

      let maxW: number;
      if (landscape) {
        // In landscape: leave room for the CTA below — cap height at 70% of vh
        maxW = Math.min(vw * 0.88, (vh * 0.70) * (VIRT_W / VIRT_H));
      } else {
        // Portrait: width drives everything
        maxW = vw * 0.92;
      }

      const sw = Math.floor(maxW);
      const sh = Math.floor(sw * (VIRT_H / VIRT_W));
      setScreenW(sw);
      setScreenH(sh);
      setScale(sw / VIRT_W);
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('orientationchange', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('orientationchange', calc);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#F2F2F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isLandscape ? 'flex-start' : 'center',
        padding: isLandscape ? '16px 0 12px' : '0 0 24px',
        fontFamily: 'var(--font-nunito, monospace)',
        overflowY: 'auto',
      }}
    >
      {/* ── RETRO MONITOR CASING ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: screenW, flexShrink: 0 }}
      >
        {/* Outer bezel — the monitor casing */}
        <div
          style={{
            backgroundColor: '#D0CFC8',
            borderRadius: 8,
            padding: 8,
            boxShadow:
              'inset 2px 2px 0px #FFFFFF, inset -2px -2px 0px #6A6A6A, 0 12px 36px rgba(0,0,0,0.22), 0 4px 8px rgba(0,0,0,0.12)',
            border: '3px solid',
            borderColor: '#E8E8E4 #8A8A84 #8A8A84 #E8E8E4',
          }}
        >
          {/* Inner screen sunken border */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: screenH,
              borderRadius: 3,
              overflow: 'hidden',
              border: '3px solid',
              borderColor: '#6A6A6A #E8E8E4 #E8E8E4 #6A6A6A',
              background: '#000',
            }}
          >
            {/* Scaled virtual desktop canvas */}
            <div
              style={{
                width: VIRT_W,
                height: VIRT_H,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <AnimatePresence>
                {!bootDone && (
                  <BootSequence
                    key="boot"
                    recipientName={config.recipientName}
                    welcomeMessage={config.welcomeMessage}
                    onComplete={() => setBootDone(true)}
                  />
                )}
              </AnimatePresence>
              {bootDone && <Desktop config={config} />}
            </div>

            {/* CRT scanline overlay */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 3px)',
              }}
            />
            {/* Screen glare */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%, rgba(0,0,0,0.06) 100%)',
              }}
            />
          </div>

          {/* Monitor chin — branding bar */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px 2px',
            }}
          >
            {/* Power LED + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 5px #22c55e',
              }} />
              <span style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700, color: '#555', letterSpacing: 1 }}>POWER</span>
            </div>

            <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: '#555', letterSpacing: 2 }}>
              ■ DESKTOP DEAR
            </span>

            {/* Fake buttons */}
            <div style={{ display: 'flex', gap: 3 }}>
              {[0, 1].map(i => (
                <div key={i} style={{
                  width: 14, height: 8,
                  background: 'linear-gradient(180deg,#D8D8D4 0%,#B8B8B4 100%)',
                  border: '1.5px solid',
                  borderColor: '#E8E8E4 #7A7A74 #7A7A74 #E8E8E4',
                  borderRadius: 1,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Monitor neck */}
        <div style={{
          width: 56, height: 20, margin: '0 auto',
          background: 'linear-gradient(90deg,#888 0%,#D0CFC8 30%,#E8E8E4 50%,#D0CFC8 70%,#888 100%)',
          borderLeft: '1.5px solid #888', borderRight: '1.5px solid #888', borderBottom: '1.5px solid #888',
        }} />

        {/* Monitor base */}
        <div style={{
          width: 120, height: 12, margin: '0 auto',
          borderRadius: '4px 4px 3px 3px',
          background: 'linear-gradient(180deg,#C8C8C4 0%,#B8B8B4 100%)',
          border: '2px solid', borderColor: '#E0E0DC #7A7A74 #7A7A74 #E0E0DC',
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
        }} />
      </motion.div>

      {/* ── CTA BELOW MONITOR ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          marginTop: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        <Link href="/create" style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: 'monospace', fontWeight: 700, fontSize: 13,
            color: '#444',
            background: 'linear-gradient(180deg,#E0DFD8 0%,#C8C7C0 100%)',
            border: '2px solid', borderColor: '#E8E8E4 #7A7A74 #7A7A74 #E8E8E4',
            borderRadius: 3,
            padding: '8px 22px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
            letterSpacing: 0.5,
            cursor: 'pointer',
          }}>
            create your own →
          </div>
        </Link>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
          created by{' '}
          <span style={{ color: '#555', textDecoration: 'underline', cursor: 'pointer' }}>
            Desktop Dear
          </span>
        </div>
      </motion.div>
    </div>
  );
}
