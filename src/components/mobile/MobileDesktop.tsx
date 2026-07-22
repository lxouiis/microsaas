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
  const [showGuide, setShowGuide] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [zoomMode, setZoomMode] = useState<'fit' | 'readable'>('readable');
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

  const handleBootComplete = () => {
    setBootDone(true);
  };

  // Virtual desktop dimensions
  const VIRT_W = 1280;
  const VIRT_H = 720;

  const [screenW, setScreenW] = useState(340);
  const [screenH, setScreenH] = useState(240);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const landscape = vw > vh;

      let sw: number;
      let sh: number;

      if (landscape) {
        // Landscape mode
        const maxW = Math.min(vw * 0.92, (vh * 0.72) * (VIRT_W / VIRT_H));
        sw = Math.floor(maxW);
        sh = Math.floor(sw * (VIRT_H / VIRT_W));
      } else {
        // Portrait mode — make screen larger and readable
        sw = Math.floor(vw * 0.95);
        if (zoomMode === 'readable') {
          // Increase height significantly so elements are larger & easily readable
          sh = Math.floor(vh * 0.52);
        } else {
          // Fit ratio
          sh = Math.floor(sw * (VIRT_H / VIRT_W));
        }
      }

      setScreenW(sw);
      setScreenH(sh);

      // Determine scale based on mode
      if (!landscape && zoomMode === 'readable') {
        // Scale up by ~1.4x fit scale for clear readable text and icons
        const fitScale = sw / VIRT_W;
        setScale(Math.max(0.42, fitScale * 1.45));
      } else {
        setScale(sw / VIRT_W);
      }
    };

    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('orientationchange', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('orientationchange', calc);
    };
  }, [zoomMode]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: '#F0EFEB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '16px 8px 36px',
        fontFamily: 'var(--font-nunito, system-ui)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Instructions Quick Banner */}
      <div
        onClick={() => setShowGuide(true)}
        style={{
          width: screenW,
          maxWidth: '100%',
          marginBottom: 10,
          background: 'linear-gradient(180deg,#FFF9C4 0%,#FFF59D 100%)',
          border: '2px solid #FBC02D',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: '#5D4037',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <span><strong>Tap any icon inside to open apps!</strong></span>
        </div>
        <span style={{ fontSize: 11, color: '#F57F17', fontWeight: 800, textDecoration: 'underline', flexShrink: 0 }}>
          Full Guide ❓
        </span>
      </div>

      {/* ── RETRO MONITOR CASING ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: screenW, flexShrink: 0, position: 'relative' }}
      >
        {/* Outer bezel */}
        <div
          style={{
            backgroundColor: '#D4D3CB',
            borderRadius: 12,
            padding: '10px 10px 8px',
            boxShadow:
              'inset 2px 2px 0px #FFFFFF, inset -2px -2px 0px #5F5F58, 0 16px 40px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.12)',
            border: '3.5px solid',
            borderColor: '#EFEFEA #7F7F78 #7F7F78 #EFEFEA',
          }}
        >
          {/* Inner screen frame with scrollable inner viewport */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: screenH,
              borderRadius: 5,
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              border: '3px solid',
              borderColor: '#5F5F58 #EFEFEA #EFEFEA #5F5F58',
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
                position: 'relative',
              }}
            >
              <AnimatePresence>
                {!bootDone && (
                  <BootSequence
                    key="boot"
                    recipientName={config.recipientName}
                    welcomeMessage={config.welcomeMessage}
                    onComplete={handleBootComplete}
                  />
                )}
              </AnimatePresence>
              {bootDone && <Desktop config={config} />}
            </div>

            {/* CRT scanlines overlay */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 999,
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px)',
              }}
            />
          </div>

          {/* Monitor chin — branding bar & controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 6px 2px',
            }}
          >
            {/* Power LED + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 6px #22c55e',
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#555',
                  letterSpacing: 1,
                }}
              >
                POWER
              </span>
            </div>

            {/* Title / Brand */}
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 800,
                color: '#444',
                letterSpacing: 1.5,
              }}
            >
              ■ DESKTOP DEAR
            </span>

            {/* Controls: Help & Zoom Toggle */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {!isLandscape && (
                <button
                  onClick={() =>
                    setZoomMode(zoomMode === 'readable' ? 'fit' : 'readable')
                  }
                  style={{
                    background:
                      'linear-gradient(180deg,#E8E8E4 0%,#C0C0B8 100%)',
                    border: '1.5px solid',
                    borderColor: '#FFF #6A6A64 #6A6A64 #FFF',
                    borderRadius: 3,
                    padding: '2px 6px',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#333',
                    cursor: 'pointer',
                  }}
                  title="Toggle Zoom / Screen Fit"
                >
                  {zoomMode === 'readable' ? '🔍 Fit' : '🔍 Large'}
                </button>
              )}

              <button
                onClick={() => setShowGuide(true)}
                style={{
                  background:
                    'linear-gradient(180deg,#FFE58F 0%,#FFC038 100%)',
                  border: '1.5px solid',
                  borderColor: '#FFF #B37D00 #B37D00 #FFF',
                  borderRadius: 3,
                  padding: '2px 7px',
                  fontSize: 9,
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  color: '#523C00',
                  cursor: 'pointer',
                }}
              >
                ❓ Guide
              </button>
            </div>
          </div>
        </div>

        {/* Monitor neck */}
        <div
          style={{
            width: 64,
            height: 18,
            margin: '0 auto',
            background:
              'linear-gradient(90deg,#777 0%,#D4D3CB 25%,#EFEFEA 50%,#D4D3CB 75%,#777 100%)',
            borderLeft: '1.5px solid #777',
            borderRight: '1.5px solid #777',
            borderBottom: '1.5px solid #777',
          }}
        />

        {/* Monitor base */}
        <div
          style={{
            width: 140,
            height: 12,
            margin: '0 auto',
            borderRadius: '4px 4px 3px 3px',
            background: 'linear-gradient(180deg,#C8C7BF 0%,#B4B3AB 100%)',
            border: '2px solid',
            borderColor: '#E8E8E4 #6F6F68 #6F6F68 #E8E8E4',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          }}
        />
      </motion.div>

      {/* ── INSTRUCTIONS POPUP MODAL ── */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="xp-window"
              style={{
                maxWidth: 380,
                width: '100%',
                backgroundColor: '#ECE9D8',
                borderRadius: '8px 8px 0 0',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '3px solid #0055EA',
                overflow: 'hidden',
              }}
            >
              {/* XP Window Titlebar */}
              <div
                className="xp-titlebar"
                style={{
                  background:
                    'linear-gradient(180deg, #0058EE 0%, #3593FF 4%, #288EFF 18%, #0055EA 100%)',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#FFF',
                  fontWeight: 'bold',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💡</span>
                  <span>How to Explore Your Desktop Dear</span>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  style={{
                    background:
                      'linear-gradient(180deg, #E7644E 0%, #B9301B 100%)',
                    border: '1px solid #FFF',
                    borderRadius: 3,
                    color: '#FFF',
                    fontWeight: 900,
                    width: 20,
                    height: 20,
                    fontSize: 11,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Instructions Body */}
              <div style={{ padding: 18, fontSize: 13, color: '#222', lineHeight: 1.5 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    marginBottom: 12,
                    color: '#003399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>💌</span>
                  <span>Welcome, {config.recipientName || 'Friend'}!</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>👆</span>
                    <div>
                      <strong>Tap / Double-Tap Icons</strong> to open Love Letters, Gacha Machine, Mixtape, Photos & secrets!
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>📜</span>
                    <div>
                      <strong>Swipe & Scroll</strong> up/down to view the full monitor screen and explore everything comfortably.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>🎵</span>
                    <div>
                      <strong>Background Music</strong>: Click the music banner in the top-right corner to play audio.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>📱</span>
                    <div>
                      <strong>Pro-tip</strong>: Turn your phone sideways (landscape mode) for a wide computer view!
                    </div>
                  </div>
                </div>

                {/* Dismiss Button */}
                <div style={{ marginTop: 18, textAlign: 'center' }}>
                  <button
                    onClick={() => setShowGuide(false)}
                    style={{
                      background:
                        'linear-gradient(180deg, #3593FF 0%, #0055EA 100%)',
                      color: '#FFF',
                      border: '1px solid #002D80',
                      borderRadius: 4,
                      padding: '8px 24px',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    Got it, let's explore! 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA BELOW MONITOR ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Link href="/create" style={{ textDecoration: 'none' }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: 13,
              color: '#333',
              background: 'linear-gradient(180deg,#EBEBE5 0%,#D0CF8 100%)',
              border: '2px solid',
              borderColor: '#FFFFFF #6A6A64 #6A6A64 #FFFFFF',
              borderRadius: 4,
              padding: '9px 24px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
              letterSpacing: 0.5,
              cursor: 'pointer',
            }}
          >
            create your own →
          </div>
        </Link>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#777' }}>
          created by{' '}
          <span style={{ color: '#444', fontWeight: 700, textDecoration: 'underline' }}>
            Desktop Dear
          </span>
        </div>
      </motion.div>
    </div>
  );
}
