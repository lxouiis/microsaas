'use client';
import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DesktopConfig } from '@/lib/types';
import type { AppType } from '@/stores/windowStore';
import { APP_ICONS, APP_TITLES } from '@/lib/demoData';
import { renderApp } from '@/components/desktop/Desktop';
import DesktopPet from '@/components/desktop/DesktopPet';
import { useFullscreen } from '@/hooks/useFullscreen';

interface MobilePortraitHomeProps {
  config: DesktopConfig;
}

const APP_ORDER: AppType[] = ['mail', 'gacha', 'mixtape', 'ticket', 'game', 'photos', 'calendar', 'secret', 'purr'];

// Portrait is a dead end for the full desktop metaphor (icons/windows need
// real width), so this stays a "please rotate" front screen — the cat
// mascot sitting and waiting, nudging toward landscape where
// MobileDesktop's scaled-monitor view takes over. But rotating isn't
// mandatory: a horizontal icon dock lets apps be opened right here too
// (full-screen, at natural size — not shrunk into a tiny canvas), and a
// fullscreen toggle gives a more immersive, browser-chrome-free view either
// way.
export default function MobilePortraitHome({ config }: MobilePortraitHomeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(rootRef);
  const [openApp, setOpenApp] = useState<AppType | null>(null);

  const enabledApps = useMemo(
    () => APP_ORDER.filter((appType) => config.apps[appType]?.enabled !== false),
    [config.apps]
  );

  const activeApp = openApp ? (config.apps[openApp]?.config || {}) : null;

  return (
    <div
      ref={rootRef}
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'linear-gradient(160deg, #0D1B2A 0%, #152232 55%, #0D2137 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontFamily: 'var(--font-nunito, system-ui)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fullscreen toggle */}
      <button
        onClick={toggle}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        style={{
          position: 'absolute', top: 14, right: 14, zIndex: 30,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#FFF', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isFullscreen ? '⤡' : '⤢'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ color: '#FFF', fontSize: 20, fontWeight: 900, marginBottom: 4 }}
      >
        💌 Hey {config.recipientName || 'friend'}!
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{ color: '#8FB3C7', fontSize: 13, marginBottom: 20, maxWidth: 280, lineHeight: 1.5 }}
      >
        This little desktop is happiest wide open.
      </motion.div>

      {/* Cat's waiting spot — DesktopPet positions itself absolutely within
          whatever element has this id, and wanders it if there's room. */}
      <div
        id="rotate-screen-area"
        style={{
          position: 'relative',
          width: 280,
          height: 180,
          marginBottom: 8,
        }}
      >
        <DesktopPet desktopAreaId="rotate-screen-area" />
      </div>

      {/* Rotate phone icon */}
      <motion.div
        animate={{ rotate: [0, -90, -90, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut', times: [0, 0.4, 0.8, 1] }}
        style={{ fontSize: 32, marginBottom: 6 }}
      >
        📱
      </motion.div>

      <div style={{ color: '#FFF', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>
        Turn your phone sideways
      </div>
      <div style={{ color: '#6A8FAA', fontSize: 11.5, lineHeight: 1.5, maxWidth: 260, marginBottom: 18 }}>
        for the full experience — or open apps right here below. 🌸
      </div>

      {/* Horizontal scrollable app dock */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '4px 8px 10px',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {enabledApps.map((appType) => (
          <button
            key={appType}
            onClick={() => setOpenApp(appType)}
            style={{
              flexShrink: 0,
              scrollSnapAlign: 'start',
              width: 68,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 14,
              padding: '10px 4px',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 24 }}>{APP_ICONS[appType] || '📁'}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#D6E8F5', textAlign: 'center', lineHeight: 1.2 }}>
              {APP_TITLES[appType] || appType}
            </span>
          </button>
        ))}
      </div>

      {/* Full-screen app sheet */}
      <AnimatePresence>
        {openApp && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: '#ECE9D8',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px calc(10px + env(safe-area-inset-top, 0px))',
                background: 'linear-gradient(180deg, #0A5DB5, #0C3FA3)',
                color: 'white', flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 20 }}>{APP_ICONS[openApp] || '📁'}</span>
              <span style={{ fontWeight: 800, fontSize: 15, flex: 1, textAlign: 'left' }}>{APP_TITLES[openApp] || openApp}</span>
              <button
                onClick={() => setOpenApp(null)}
                style={{
                  background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white',
                  width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {activeApp && renderApp(openApp, activeApp, config)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
