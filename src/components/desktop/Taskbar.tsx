'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Clock from './Clock';
import { useWindowStore } from '@/stores/windowStore';
import { useDesktopStore } from '@/stores/desktopStore';
import { useSound } from '@/hooks/useSound';

interface TaskbarProps {
  onStartClick: () => void;
  isStartMenuOpen: boolean;
}

export default function Taskbar({ onStartClick, isStartMenuOpen }: TaskbarProps) {
  const { windows, focusWindow, restoreWindow, minimizeWindow } = useWindowStore();
  const { soundEnabled, toggleSound } = useDesktopStore();
  const sounds = useSound();
  const openWindows = windows.filter((w) => w.isOpen);

  const handleWindowClick = (id: string, isMinimized: boolean) => {
    sounds.click();
    if (isMinimized) {
      restoreWindow(id);
    } else {
      minimizeWindow(id);
    }
  };

  return (
    <div className="taskbar">
      {/* Start button */}
      <motion.button
        className="start-button"
        onClick={() => {
          sounds.click();
          onStartClick();
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        animate={isStartMenuOpen ? { scale: 0.97 } : { scale: 1 }}
      >
        <span style={{ fontSize: 18 }}>🖥️</span>
        <span>start</span>
      </motion.button>

      <div className="taskbar-separator" />

      {/* Open windows */}
      <div style={{ display: 'flex', gap: 4, flex: 1, overflow: 'hidden' }}>
        {openWindows.map((win) => (
          <motion.button
            key={win.id}
            className={`taskbar-item ${win.isFocused && !win.isMinimized ? 'active' : ''}`}
            onClick={() => handleWindowClick(win.id, win.isMinimized)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{win.icon}</span>
            <span>{win.title}</span>
          </motion.button>
        ))}
      </div>

      <div className="taskbar-separator" />

      {/* Sound toggle */}
      <motion.button
        className="sound-toggle"
        onClick={() => {
          sounds.click();
          toggleSound();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </motion.button>

      {/* Clock */}
      <Clock />
    </div>
  );
}
