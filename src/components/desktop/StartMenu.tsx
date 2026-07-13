'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShutdown: () => void;
  recipientName: string;
}

export default function StartMenu({ isOpen, onClose, onShutdown, recipientName }: StartMenuProps) {
  const sounds = useSound();

  const handleShutdown = () => {
    sounds.click();
    onClose();
    setTimeout(onShutdown, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[990]"
            onClick={onClose}
          />

          <motion.div
            className="start-menu"
            style={{ zIndex: 991 }}
            initial={{ opacity: 0, y: 20, scaleY: 0.8, transformOrigin: 'bottom left' }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 20, scaleY: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="start-menu-header">
              <div style={{ fontSize: 32 }}>👤</div>
              <div>
                <div className="start-menu-user">Hello, {recipientName}! 💌</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>Guest · Desktop Dear OS</div>
              </div>
            </div>

            {/* Body */}
            <div className="start-menu-body">
              {/* Left */}
              <div className="start-menu-left">
                <div style={{ padding: '4px 12px 2px', fontSize: 9, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Recently used
                </div>
                {[
                  { icon: '📧', label: 'Inbox' },
                  { icon: '🎰', label: 'Gacha Machine' },
                  { icon: '🎵', label: 'Mixtape' },
                  { icon: '🎟', label: 'Invitation' },
                  { icon: '⭐', label: 'Star Catcher' },
                  { icon: '📸', label: 'My Photos' },
                ].map((item) => (
                  <div key={item.label} className="start-menu-item" onClick={onClose}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Right */}
              <div className="start-menu-right">
                <div style={{ padding: '4px 8px 2px', fontSize: 9, color: '#5A6A8A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Places
                </div>
                {[
                  { icon: '🖥️', label: 'Desktop' },
                  { icon: '📁', label: 'My Memories' },
                  { icon: '🎵', label: 'My Music' },
                  { icon: '📸', label: 'My Pictures' },
                ].map((item) => (
                  <div key={item.label} className="start-menu-item" onClick={onClose} style={{ fontSize: 11 }}>
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="start-menu-footer">
              <motion.button
                className="xp-button"
                onClick={handleShutdown}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
              >
                <span>⏻</span>
                <span>Shut Down...</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
