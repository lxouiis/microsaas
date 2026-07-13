'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWindowStore, AppType } from '@/stores/windowStore';
import { useSound } from '@/hooks/useSound';
import { APP_ICONS, APP_TITLES } from '@/lib/demoData';

interface DesktopIconProps {
  appType: AppType;
  position?: { x: number; y: number };
  label?: string;
  disabled?: boolean;
}

export default function DesktopIcon({ appType, label, disabled = false }: DesktopIconProps) {
  const { openWindow } = useWindowStore();
  const sounds = useSound();
  const [selected, setSelected] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  const icon = APP_ICONS[appType] || '📁';
  const title = label || APP_TITLES[appType] || appType;

  const handleClick = () => {
    if (disabled) return;
    clickCount.current += 1;
    setSelected(true);

    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      if (clickCount.current >= 2) {
        // Double click
        sounds.windowOpen();
        openWindow(appType, APP_TITLES[appType], APP_ICONS[appType]);
      }
      clickCount.current = 0;
    }, 300);
  };

  return (
    <motion.div
      className={`desktop-icon ${selected ? 'selected' : ''}`}
      onClick={handleClick}
      onBlur={() => setSelected(false)}
      tabIndex={0}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      animate={selected ? { scale: [1, 1.06, 1] } : {}}
      transition={{ type: 'tween', duration: 0.2 }}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      title={`Double-click to open ${title}`}
    >
      {/* Icon container with pixel art frame effect */}
      <motion.div
        style={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          filter: disabled ? 'grayscale(0.7)' : 'none',
          imageRendering: 'pixelated',
        }}
        animate={selected ? { y: [0, -4, 0] } : {}}
        transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>

      {/* Icon label */}
      <div className="desktop-icon-label">{title}</div>
    </motion.div>
  );
}
