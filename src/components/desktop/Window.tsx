'use client';
import { useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore, AppType } from '@/stores/windowStore';
import { useDesktopStore } from '@/stores/desktopStore';
import { useSound } from '@/hooks/useSound';

interface WindowProps {
  id: string;
  appType?: AppType;
  title: string;
  icon: string;
  isMinimized: boolean;
  isFocused: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}

export default function Window({
  id,
  appType,
  title,
  icon,
  isMinimized,
  isFocused,
  position,
  size,
  zIndex,
  children,
  onClose,
  onMinimize,
  onFocus,
}: WindowProps) {
  const { updatePosition } = useWindowStore();
  const { credits } = useDesktopStore();
  const sounds = useSound();
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const isGacha = appType === 'gacha';

  // Drag logic via native mouse events for performance
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.xp-btn') || (e.target as HTMLElement).closest('.gacha-btn')) return;
    isDragging.current = true;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: position.x,
      winY: position.y,
    };
    onFocus();
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      const newX = Math.max(0, Math.min(dragStart.current.winX + dx, window.innerWidth - 120));
      const newY = Math.max(0, Math.min(dragStart.current.winY + dy, window.innerHeight - 80));
      updatePosition(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, updatePosition]);

  const handleClose = () => {
    sounds.windowClose();
    onClose();
  };

  if (isMinimized) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        className={`${isGacha ? 'desktop-window-gacha' : 'xp-window'} absolute select-none`}
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex,
        }}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onMouseDown={onFocus}
      >
        {/* Title Bar */}
        <div
          className={isGacha 
            ? `gacha-titlebar ${!isFocused ? 'gacha-titlebar-inactive' : ''}` 
            : `xp-titlebar ${!isFocused ? 'xp-titlebar-inactive' : ''}`
          }
          onMouseDown={handleTitleBarMouseDown}
        >
          <div className={isGacha ? "gacha-titlebar-text" : "xp-titlebar-text"}>
            <span className="text-lg">{icon}</span>
            <span>{title}</span>
          </div>
          <div className={isGacha ? "flex gap-1" : "xp-window-buttons"}>
            <button
              className={isGacha ? "gacha-btn-min" : "xp-btn xp-btn-min"}
              onClick={onMinimize}
              title="Minimize"
            >
              _
            </button>
            <button
              className={isGacha ? "gacha-btn-close" : "xp-btn xp-btn-close"}
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div
          className="overflow-hidden"
          style={{
            height: size.height - (isGacha ? 55 : 33), // subtract titlebar and statusbar height for Gacha
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>

        {/* Statusbar Footer for Gacha */}
        {isGacha && (
          <div className="gacha-statusbar select-none">
            <span>🪙 Balance: {credits} Credits</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
