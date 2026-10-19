'use client';
import { motion } from 'framer-motion';
import type { DesktopConfig } from '@/lib/types';
import DesktopPet from '@/components/desktop/DesktopPet';

interface MobilePortraitHomeProps {
  config: DesktopConfig;
}

// Portrait is a dead end for the full desktop metaphor (icons/windows need
// real width), so instead of cramming it in, this is just a cute "please
// rotate" front screen — the same cat mascot that wanders the real desktop,
// sitting here waiting, with a nudge to flip the phone to landscape where
// MobileDesktop's existing scaled-monitor view takes over automatically.
export default function MobilePortraitHome({ config }: MobilePortraitHomeProps) {
  return (
    <div
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
      }}
    >
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
        style={{ color: '#8FB3C7', fontSize: 13, marginBottom: 28, maxWidth: 280, lineHeight: 1.5 }}
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
          height: 220,
          marginBottom: 12,
        }}
      >
        <DesktopPet desktopAreaId="rotate-screen-area" />
      </div>

      {/* Rotate phone icon */}
      <motion.div
        animate={{ rotate: [0, -90, -90, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut', times: [0, 0.4, 0.8, 1] }}
        style={{ fontSize: 40, marginBottom: 10 }}
      >
        📱
      </motion.div>

      <div style={{ color: '#FFF', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
        Turn your phone sideways
      </div>
      <div style={{ color: '#6A8FAA', fontSize: 12, lineHeight: 1.6, maxWidth: 260 }}>
        Flip to landscape for the full Desktop Dear experience — letters, games, photos, and all the little surprises inside. 🌸
      </div>
    </div>
  );
}
